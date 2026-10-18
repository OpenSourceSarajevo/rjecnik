import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const [statsRes, typeRes] = await Promise.all([
    supabase.from('words_dashboard_stats').select('*').single(),
    supabase.from('words_by_type').select('*'),
  ]);

  if (statsRes.error || typeRes.error) {
    return NextResponse.json(
      {
        error: statsRes.error?.message || typeRes.error?.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    stats: statsRes.data,
    type_breakdown: typeRes.data,
  });
}
