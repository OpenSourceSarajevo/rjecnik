import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const WORDS_TABLE: string = "words_v2";

export async function GET(request: NextRequest, { params }: { params: Promise<{ headword: string }> }) {
    const { headword } = await params;

    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from(WORDS_TABLE)
      .select()
      .eq("headword", headword)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(data);
}