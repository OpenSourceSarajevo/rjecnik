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
  const word = request.nextUrl.searchParams.get("word") ?? "";

  const supabase = createClient();

  const { data, error } = await supabase.rpc("search_words_ranked", {
    search_term: word,
    limit_value: pageSize,
    offset_value: pageNumber * pageSize,
  });

  if (error) throw error;

  return NextResponse.json<Word[]>(data);
}
