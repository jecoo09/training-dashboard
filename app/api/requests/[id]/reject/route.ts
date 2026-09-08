import { NextResponse } from 'next/server';
import { findTrainingRequest, findUserByNik, setTrainingRequestStatus } from '@/lib/db';
import { getSession } from '@/lib/auth';
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) { const session = await getSession(); const admin = session ? await findUserByNik(session.nik) : null; const { id } = await params; const item = await findTrainingRequest(id); if (!admin?.isActive || admin.role !== 'admin' || !item || item.status !== 'pending') return NextResponse.json({ success: false, error: 'Pengajuan tidak dapat ditolak' }, { status: 400 }); return NextResponse.json({ success: true, request: await setTrainingRequestStatus(id, 'rejected') }); }
