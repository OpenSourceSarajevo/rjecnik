import { NewWord } from '@/app/api/words/contracts';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function applyNewHeadwordForm(id: number, body: any) {
  const supabase = await createClient();

  const definitions = body.definitions;

  if (!Array.isArray(definitions) || definitions.length === 0) {
    return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
  }

  const { data, error } = await supabase.from('words_new').select().eq('id', id).single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const newWord: NewWord = data;

  const { data: inserted, error: insertError } = await supabase
    .from('words_v2')
    .insert([
      {
        headword: newWord.headword,
        definitions,
        forms: body.forms ?? null,
        origins: body.origins ?? null,
        alternatives: body.alternatives ?? null,
        synonyms: body.synonyms ?? null,
        antonyms: body.antonyms ?? null,
        frequency: newWord.count,
        created_by: body.user_email,
        created_at: new Date().toISOString(),
        updated_by: body.user_email,
        updated_at: new Date().toISOString(),
      },
    ])
    .select();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await supabase.from('words_new').delete().eq('id', newWord.id);

  return NextResponse.json(inserted[0], { status: 200 });
}
