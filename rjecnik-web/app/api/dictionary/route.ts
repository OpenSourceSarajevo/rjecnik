import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

type Word = {
  id: number;
  word: string;
  meaning: string;
};

export async function GET(request: NextRequest) {
  const pageNumber = +request.nextUrl.searchParams.get("pageNumber")!;
  const pageSize = +request.nextUrl.searchParams.get("pageSize")!;
  const word = request.nextUrl.searchParams.get("word");

  const supabase = createClient();

  var query = supabase
    .from("words")
    .select("id, word, meaning")
    .order("word, id", { ascending: true });

  if (word!!) {
    query = query.ilike("word", `%${word}%`);
  }

  query = query.range(pageNumber * pageSize, (pageNumber + 1) * pageSize - 1);

  const { data, error } = await query;

  if (error) throw error;

  return NextResponse.json<Word[]>(data);
}
