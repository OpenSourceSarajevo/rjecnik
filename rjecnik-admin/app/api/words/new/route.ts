import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export type WordProcessingStrategy = 'Frequency Only' | 'New Example' | 'New Definition' | 'New Form' | 'Existing Form' | 'New Headword' | 'Ignore' | 'Remove';

export type NewWord = {
  id: number;
  headword: string;
  examples: string[];
  count: number;
  is_new: boolean;
  created_at: string;
  created_by: string;
  assigned_to: string | null;
  strategy: WordProcessingStrategy | null;
};


export async function GET(request: NextRequest) {
    const supabase = await createClient();

    const pageNumber = +request.nextUrl.searchParams.get("pageNumber")!;
    const pageSize = +request.nextUrl.searchParams.get("pageSize")!;

    const { data, error } = await supabase
        .from('words_new')
        .select('*')
        .order('created_at', { ascending: false })
        .order('headword', { ascending: true })
        .range(pageNumber * pageSize, (pageNumber + 1) * pageSize);
    
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json<NewWord[]>(data);
}