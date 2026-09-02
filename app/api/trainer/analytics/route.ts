import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { findUserByNik } from '@/lib/db';
import { getTrainingData } from '@/lib/googleSheets';

function includesTrainer(value: string, fullName: string) {
  return value.split(',').some((name) => name.trim().toUpperCase() === fullName.trim().toUpperCase());
}

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'trainer') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const user = await findUserByNik(session.nik);
    if (!user || !user.isActive) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const rawData = (await getTrainingData()).filter((row) => includesTrainer(row.namaTrainer, user.fullName));
    return NextResponse.json({ success: true, rawData });
  } catch (error) {
    console.error('Trainer analytics error:', error);
    return NextResponse.json({ success: false, error: 'Gagal mengambil data training' }, { status: 500 });
  }
}