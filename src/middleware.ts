import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const path = request.nextUrl.pathname;

  const demoCookie = request.cookies.get('demo_auth');
  const isDemo = demoCookie?.value === '1';

  const isAuthRoute = path === '/login' || path === '/register';
  const isProtectedRoute = path.startsWith('/dashboard');

  if (isProtectedRoute && !isDemo) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthRoute && isDemo) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/register',
  ],
};