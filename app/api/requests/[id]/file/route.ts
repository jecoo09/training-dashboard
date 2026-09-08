import { NextResponse } from 'next/server';
import { findTrainingRequest, findTrainingRequestFile, findUserByNik } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession(); const user = session ? await findUserByNik(session.nik) : null; const { id } = await params; const item = await findTrainingRequest(id); const file = await findTrainingRequestFile(id);
    if (!user?.isActive || !item || !file || (user.role !== 'admin' && item.submittedBy !== user.id) || !file.participantFileData) return new NextResponse('Not found', { status: 404 });
    return new NextResponse(Buffer.from(file.participantFileData, 'base64'), { headers: { 'Content-Type': file.participantFileMimeType || 'application/octet-stream', 'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(file.participantFileName || 'daftar-peserta')}` } });
  } catch { return new NextResponse('File tidak dapat diunduh', { status: 500 }); }
}
