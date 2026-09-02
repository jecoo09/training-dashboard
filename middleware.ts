import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

async function getRole(request: NextRequest) {
  const token = request.cookies.get('tnd_auth')?.value;
  const secret = process.env.SESSION_SECRET;
  if (!token || !secret) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload.role === 'admin' || payload.role === 'trainer' ? payload.role : null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const role = await getRole(request);
  const isAdminPath = pathname === '/admin' || pathname.startsWith('/api/analytics');
  const isTrainerPath = pathname === '/';

  if (isAdminPath && role !== 'admin') {
    if (pathname.startsWith('/api/')) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (isTrainerPath && role !== 'trainer') return NextResponse.redirect(new URL('/login', request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin', '/api/analytics'],
};