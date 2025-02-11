import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

type Word = {
  id: number;
  headword: string;
  definitions: Definition[];
};

type Definition = {
  type: string | null;
  gender: string | null;
  examples: string[] | null;
  definition: string;
  part_of_speech: string | null;
  pronunciation_ipa: string | null;
  pronunciation_audio: string | null;
};

export async function GET(request: NextRequest) {
  const pageNumber = +request.nextUrl.searchParams.get("pageNumber")!;
  const pageSize = +request.nextUrl.searchParams.get("pageSize")!;
  const word = request.nextUrl.searchParams.get("word");

  const supabase = createClient();

  var query = supabase
    .from("words_v2")
    .select("id, headword, definitions")
    .order("headword", { ascending: true });

  if (word!!) {
    query = query.ilike("headword", `%${word}%`);
  }

  query = query.range(pageNumber * pageSize, (pageNumber + 1) * pageSize - 1);

  const { data, error } = await query;

  if (error) throw error;

  return NextResponse.json<Word[]>(data);
}
