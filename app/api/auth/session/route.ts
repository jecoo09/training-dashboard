import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { findUserByNik } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ authenticated: false }, { status: 401 });
  const user = await findUserByNik(session.nik);
  if (!user || !user.isActive) return NextResponse.json({ authenticated: false }, { status: 401 });
  return NextResponse.json({ authenticated: true, user: {
    id: user.id, nik: user.nik, fullName: user.fullName, locGroup: user.locGroup, role: user.role,
  } });
}