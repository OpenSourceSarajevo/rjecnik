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

  const supabase = createClient();

  const { data, error } = await supabase
    .from("words")
    .select("id, word, meaning")
    .order("id")
    .range(pageNumber * pageSize, (pageNumber + 1) * pageSize - 1);

  if (error) throw error;

  return NextResponse.json<Word[]>(data);
}
