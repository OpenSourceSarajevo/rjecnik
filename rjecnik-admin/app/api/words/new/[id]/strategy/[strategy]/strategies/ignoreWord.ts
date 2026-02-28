import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function applyIgnoreWord(id: number, body: any) {
  const supabase = await createClient();

  const { data: wordData, error: wordError } = await supabase
    .from('words_new')
    .select()
    .eq('id', id)
    .single();

  if (wordError) {
    return NextResponse.json({ error: wordError.message }, { status: 500 });
  }

  const headword: string = wordData.headword;
  const type: string = body?.type ?? 'ostalo';

  const { data: existing } = await supabase
    .from('words_ignore')
    .select('id')
    .eq('headword', headword)
    .maybeSingle();

  if (existing) {
    const { error: updateError } = await supabase
      .from('words_ignore')
      .update({ type, updated_at: new Date().toISOString() })
      .eq('headword', headword);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  } else {
    const { error: insertError } = await supabase
      .from('words_ignore')
      .insert({ headword, type });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  const { error: deleteError } = await supabase.from('words_new').delete().eq('id', id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
