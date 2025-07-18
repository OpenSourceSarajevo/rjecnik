import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import { z } from "zod";

export type Definition = {
  type: string | null;
  gender: string | null;
  examples: string[] | null;
  definition: string;
  part_of_speech: string | null;
  pronunciation_ipa: string | null;
  pronunciation_audio: string | null;
  synonyms?: string[] | null;
  antonyms?: string[] | null;
};

export type Word = {
  id: number;
  headword: string;
  definitions: Definition[];
  forms?: { form: string; name: string; value: string; category: string }[] | null;
  alternatives?: string[] | null;
  origins?: string[] | null;
};

const WORDS_TABLE: string = "words_v2";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (id) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from(WORDS_TABLE)
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json(data);
  }
  const pageNumber = +request.nextUrl.searchParams.get("pageNumber")!;
  const pageSize = +request.nextUrl.searchParams.get("pageSize")!;
  const word = request.nextUrl.searchParams.get("word") ?? "";

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("search_words_ranked", {
    search_term: word,
    limit_value: pageSize,
    offset_value: pageNumber * pageSize,
  });

  if (error) throw error;

  return NextResponse.json<Word[]>(data);
}


const WordInputSchema = z.object({
  headword: z.string(),
  definitions: z.array(z.object({
    type: z.string().nullable(),
    gender: z.string().nullable(),
    examples: z.array(z.string()).nullable(),
    definition: z.string(),
    part_of_speech: z.string().nullable(),
    pronunciation_ipa: z.string().nullable(),
    pronunciation_audio: z.string().nullable(),
    synonyms: z.array(z.string()).nullable().optional(),
    antonyms: z.array(z.string()).nullable().optional(),
  })),
  forms: z.array(z.object({
    form: z.string(),
    name: z.string(),
    value: z.string(),
    category: z.string(),
  })).nullable().optional(),
  alternatives: z.array(z.string()).nullable().optional(),
  origins: z.array(z.string()).nullable().optional(),
  synonyms: z.array(z.string()).nullable().optional(),
  antonyms: z.array(z.string()).nullable().optional(),
  frequency: z.number().nullable().optional(),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  
  const session = await supabase.auth.getSession();

  if (session.error || !session.data.session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const access_token = session.data.session.access_token;
  const jwt = jwtDecode<{ user_permission?: string; email?: string }>(access_token);
  const user_permission = jwt.user_permission;
  const user_email = session.data.session.user.email || jwt.email;

  if (user_permission !== "Dictionary.ReadWrite") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  
  const body = await request.json();
  const parseResult = WordInputSchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid body", details: parseResult.error.errors }, { status: 400 });
  }

  const validBody = {
    ...parseResult.data,
    created_by: user_email,
    created_at: new Date().toISOString(),
    updated_by: user_email,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from(WORDS_TABLE)
    .insert([validBody])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data[0], { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const session = await supabase.auth.getSession();
  if (session.error || !session.data.session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const access_token = session.data.session.access_token;
  const jwt = jwtDecode<{ user_permission?: string; email?: string }>(access_token);
  const user_permission = jwt.user_permission;
  const user_email = session.data.session.user.email || jwt.email;
  if (user_permission !== "Dictionary.ReadWrite") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  const body = await request.json();
  const parseResult = WordInputSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid body", details: parseResult.error.errors }, { status: 400 });
  }
  const validBody = {
    ...parseResult.data,
    updated_by: user_email,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from(WORDS_TABLE)
    .update(validBody)
    .eq("id", id)
    .select();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data[0], { status: 200 });
}
