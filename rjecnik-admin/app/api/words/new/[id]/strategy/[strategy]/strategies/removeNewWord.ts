import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";


// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
export async function applyRemoveNewWord(id: number, body: any) {
  const supabase = await createClient();

  const { data, error } = await supabase.from('words_new')
    .delete()
    .eq('id', id)


  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data, { status: 200 });
}
