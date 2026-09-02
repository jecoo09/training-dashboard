import { NextResponse } from 'next/server';
import { createSession, normalizeNik, verifyPassword } from '@/lib/auth';
import { findUserByNik } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const nik = normalizeNik(String(body.nik ?? ''));
    const password = String(body.password ?? '');
    const user = await findUserByNik(nik);

    if (!user || !user.isActive || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ success: false, error: 'NIK atau password salah' }, { status: 401 });
    }

    await createSession(user);
    return NextResponse.json({ success: true, role: user.role });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Login belum dapat diproses' }, { status: 500 });
  }
}