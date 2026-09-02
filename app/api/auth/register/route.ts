import { NextResponse } from 'next/server';
import { hashPassword, normalizeNik } from '@/lib/auth';
import { createTrainer, findUserByNik } from '@/lib/db';
import { findTrainerByNik } from '@/lib/googleSheets';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fullName = String(body.fullName ?? '').trim();
    const nik = normalizeNik(String(body.nik ?? ''));
    const locGroup = String(body.locGroup ?? '').trim();
    const password = String(body.password ?? '');
    const confirmPassword = String(body.confirmPassword ?? '');

    if (!fullName || !nik || !locGroup || !password || password !== confirmPassword) {
      return NextResponse.json({ success: false, error: 'Data registrasi belum lengkap atau password tidak sama' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ success: false, error: 'Password minimal 8 karakter' }, { status: 400 });
    }
    if (await findUserByNik(nik)) {
      return NextResponse.json({ success: false, error: 'NIK sudah terdaftar' }, { status: 409 });
    }

    const trainer = await findTrainerByNik(nik);
    if (!trainer) {
      return NextResponse.json({ success: false, error: 'NIK tidak ditemukan di data trainer resmi' }, { status: 403 });
    }

    await createTrainer({
      nik,
      fullName: trainer.fullName || fullName,
      locGroup: trainer.locGroup || locGroup,
      passwordHash: await hashPassword(password),
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ success: false, error: 'Registrasi belum dapat diproses' }, { status: 500 });
  }
}