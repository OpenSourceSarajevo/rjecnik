import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from './utils/supabase/server';
import { jwtDecode } from 'jwt-decode';

interface CustomJwtPayload {
  user_permission?: string;
}

export async function middleware(req: NextRequest) {
  const supabase = await createClient();

  const session = await supabase.auth.getSession();

  if (session.error || !session.data.session) {
    return NextResponse.redirect(new URL('/auth', req.url));
  }

  const {
    data: {
      session: { access_token },
    },
  } = session;

  const jwt = jwtDecode<CustomJwtPayload>(access_token);
  const user_permission = jwt.user_permission;

  if (user_permission !== 'Dictionary.ReadWrite') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  return NextResponse.next({ request: req });
}

export const config = {
  matcher: ['/dashboard', '/upload', '/process', '/dictionary', '/kontrolna-tabla', '/ucitaj-tekst', '/obradi-rijeci', '/rjecnik'],
};
