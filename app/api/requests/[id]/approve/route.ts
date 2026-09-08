import { NextResponse } from 'next/server';
import { approveTrainingRequest, findTrainingRequest, findUserByNik } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { appendApprovedTraining } from '@/lib/googleSheets';
import { monthShort } from '@/lib/trainingRequest';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession(); const admin = session ? await findUserByNik(session.nik) : null; const { id } = await params;
    const item = await findTrainingRequest(id);
    if (!admin?.isActive || admin.role !== 'admin' || !item || item.status !== 'pending') return NextResponse.json({ success: false, error: 'Pengajuan tidak dapat disetujui' }, { status: 400 });
    const sheet = await appendApprovedTraining({ tanggalPelaksanaan: item.executionDate, bulan: monthShort(item.executionDate), wilayah: item.regionCode, namaTraining: item.trainingTitle, programTraining: item.programTraining, jenisTraining: item.trainingType, trainingHours: Number(item.trainingHours), participant: Number(item.participantCount), totalTHours: Number(item.totalTrainingHours), namaTrainer: item.trainerNames });
    const approved = await approveTrainingRequest(id, admin, sheet.sheetRowNumber, sheet.no);
    if (!approved) return NextResponse.json({ success: false, error: 'Status pengajuan telah berubah. Baris Sheet sudah ditambahkan; hubungi admin.' }, { status: 409 });
    return NextResponse.json({ success: true, request: approved });
  } catch (error) { return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Approval gagal' }, { status: 500 }); }
}
