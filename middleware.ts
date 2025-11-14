import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const path = request.nextUrl.pathname;
  if (!path.startsWith('/dashboard')) {
    return res;
  }

  const demoCookie = request.cookies.get('demo_auth');
  if (demoCookie?.value === '1') {
    return res;
  }

  return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
  matcher: ["/dashboard/:path*"],
};