import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  // If the user is signed in and the current path is '/', redirect the user to '/dashboard'
  if (user && req.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // If the user is signed in and the current path is '/account/login', redirect the user to '/account'
  if (user && req.nextUrl.pathname === '/account/login') {
    return NextResponse.redirect(new URL('/account', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/', '/account/login']
};
