import { NextResponse } from 'next/server';
import { findTrainingRequest, findUserByNik, revokeTrainingRequestApproval } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { deleteApprovedTrainingRow } from '@/lib/googleSheets';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession(); const admin = session ? await findUserByNik(session.nik) : null; const { id } = await params; const item = await findTrainingRequest(id);
    if (!admin?.isActive || admin.role !== 'admin' || !item || item.status !== 'approved' || !item.sheetRecordNo) return NextResponse.json({ success: false, error: 'Approval tidak dapat dibatalkan' }, { status: 400 });
    await deleteApprovedTrainingRow(item.sheetRecordNo);
    const updated = await revokeTrainingRequestApproval(id);
    return NextResponse.json({ success: true, request: updated });
  } catch (error) { return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Pembatalan approval gagal' }, { status: 500 }); }
}
