import { createClient } from '@/utils/supabase/server';
import { jwtDecode } from 'jwt-decode';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { IgnoredWord } from '../contracts';

const IGNORE_TYPES = ['ostalo', 'ime', 'strana_riječ', 'skraćenica'] as const;

const BulkImportSchema = z.object({
  headwords: z.array(z.string().trim().min(1)).min(1),
  type: z.enum(IGNORE_TYPES),
});

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const session = await supabase.auth.getSession();

  if (session.error || !session.data.session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const access_token = session.data.session.access_token;
  const jwt = jwtDecode<{ user_permission?: string; email?: string }>(access_token);
  const user_permission = jwt.user_permission;

  if (user_permission !== 'Dictionary.ReadWrite') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const rawPageNumber = Number(request.nextUrl.searchParams.get('pageNumber'));
  const rawPageSize = Number(request.nextUrl.searchParams.get('pageSize'));

  const pageNumber = Number.isInteger(rawPageNumber) && rawPageNumber >= 0 ? rawPageNumber : 0;
  const pageSize =
    Number.isInteger(rawPageSize) && rawPageSize > 0 ? Math.min(rawPageSize, 100) : 20;

  const word = request.nextUrl.searchParams.get('word') ?? '';

  let query = supabase
    .from('words_ignore')
    .select('*', { count: 'exact' })
    .order('inserted_at', { ascending: false });

  if (word) {
    query = query.ilike('headword', `%${word}%`);
  }

  const { data, error, count } = await query.range(
    pageNumber * pageSize,
    (pageNumber + 1) * pageSize - 1
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data as IgnoredWord[], total: count ?? 0 });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const session = await supabase.auth.getSession();

  if (session.error || !session.data.session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const access_token = session.data.session.access_token;
  const jwt = jwtDecode<{ user_permission?: string; email?: string }>(access_token);
  const user_permission = jwt.user_permission;

  if (user_permission !== 'Dictionary.ReadWrite') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const parseResult = BulkImportSchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Invalid body', details: parseResult.error.errors },
      { status: 400 }
    );
  }

  const uniqueHeadwords = Array.from(new Set(parseResult.data.headwords));

  const rows = uniqueHeadwords.map((headword) => ({
    headword,
    type: parseResult.data.type,
    updated_at: new Date().toISOString(),
  }));

  const { data, error } = await supabase
    .from('words_ignore')
    .upsert(rows, { onConflict: 'headword' })
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { data: data as IgnoredWord[], count: data?.length ?? 0 },
    { status: 201 }
  );
}
