import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

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

const MAX_PAGE_SIZE = 50;

export async function GET(request: NextRequest) {
  const rawPageNumber = Number(request.nextUrl.searchParams.get('pageNumber'));
  const rawPageSize = Number(request.nextUrl.searchParams.get('pageSize'));

  const pageNumber = Number.isInteger(rawPageNumber) && rawPageNumber >= 0 ? rawPageNumber : 0;
  const pageSize =
    Number.isInteger(rawPageSize) && rawPageSize > 0
      ? Math.min(rawPageSize, MAX_PAGE_SIZE)
      : MAX_PAGE_SIZE;

  const word = request.nextUrl.searchParams.get('word') ?? '';

  const supabase = await createClient();

  const { data, error } = await supabase.rpc('search_words_ranked', {
    search_term: word,
    limit_value: pageSize,
    offset_value: pageNumber * pageSize,
  });

  if (error) throw error;

  return NextResponse.json<Word[]>(data);
}
