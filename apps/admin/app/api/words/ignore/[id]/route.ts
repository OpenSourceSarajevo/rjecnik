import { createClient } from '@/utils/supabase/server';
import { jwtDecode } from 'jwt-decode';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const IGNORE_TYPES = ['ostalo', 'ime', 'strana_riječ', 'skraćenica'] as const;

const IgnoreUpdateSchema = z.object({
  type: z.enum(IGNORE_TYPES),
});

async function requireReadWrite() {
  const supabase = await createClient();
  const session = await supabase.auth.getSession();

  if (session.error || !session.data.session) {
    return {
      supabase: null,
      errorResponse: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const access_token = session.data.session.access_token;
  const jwt = jwtDecode<{ user_permission?: string }>(access_token);

  if (jwt.user_permission !== 'Dictionary.ReadWrite') {
    return {
      supabase: null,
      errorResponse: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }

  return { supabase, errorResponse: null };
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, errorResponse } = await requireReadWrite();
  if (errorResponse) return errorResponse;

  const { id } = await params;
  const body = await request.json();
  const parseResult = IgnoreUpdateSchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Invalid body', details: parseResult.error.errors },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('words_ignore')
    .update({ type: parseResult.data.type, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Word not found' }, { status: 404 });
  }

  return NextResponse.json(data[0], { status: 200 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, errorResponse } = await requireReadWrite();
  if (errorResponse) return errorResponse;

  const { id } = await params;

  const { data, error } = await supabase.from('words_ignore').delete().eq('id', id).select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Word not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
