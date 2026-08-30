import { Word } from '@/app/api/dictionary/route';
import { NewWord } from '@/app/api/words/contracts';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function applyNewDefinitionForm(id: number, body: any) {
  const supabase = await createClient();

  const headword = body.headword;
  const definition = body.definition;

  if (!headword || !definition || typeof definition.definition !== 'string' || !definition.definition.trim()) {
    return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
  }

  const { data, error } = await supabase.from('words_new').select().eq('id', id).single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const newWord: NewWord = data;

  const { data: headwordData, error: headwordError } = await supabase
    .from('words_v2')
    .select()
    .eq('headword', headword)
    .single();

  if (headwordError) {
    return NextResponse.json({ error: headwordError.message }, { status: 500 });
  }

  const headwordEntry: Word = headwordData;

  const newDefinition = {
    type: definition.type || null,
    gender: definition.gender || null,
    examples: Array.isArray(definition.examples) ? definition.examples : [],
    definition: definition.definition,
    hidden_definition: '',
    part_of_speech: null,
    pronunciation_ipa: null,
    pronunciation_audio: null,
    synonyms: [],
    antonyms: [],
  };

  const definitions = [...headwordEntry.definitions, newDefinition];
  const frequency = body.updateFrequency
    ? headwordEntry.frequency + newWord.count
    : headwordEntry.frequency;

  const { data: headwordUpdated, error: headwordUpdatedError } = await supabase
    .from('words_v2')
    .update({
      definitions,
      frequency,
      updated_by: body.user_email,
      updated_at: new Date().toISOString(),
    })
    .eq('headword', headword)
    .select();

  if (headwordUpdatedError) {
    return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
  }

  await supabase.from('words_new').delete().eq('id', newWord.id);

  return NextResponse.json(headwordUpdated[0], { status: 200 });
}
