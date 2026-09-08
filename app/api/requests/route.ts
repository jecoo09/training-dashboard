import { NextResponse } from 'next/server';
import { createTrainingRequest, findUserByNik, listTrainingRequests } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { requestInput } from '@/lib/trainingRequest';

async function currentUser() { const session = await getSession(); if (!session) return null; return findUserByNik(session.nik); }
export async function GET() { const user = await currentUser(); if (!user?.isActive) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }); return NextResponse.json({ success: true, requests: await listTrainingRequests(user) }); }
export async function POST(request: Request) { try { const user = await currentUser(); if (!user?.isActive || user.role !== 'trainer') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }); const created = await createTrainingRequest(await requestInput(await request.formData(), user)); return NextResponse.json({ success: true, request: created }, { status: 201 }); } catch (error) { return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Pengajuan gagal dikirim' }, { status: 400 }); } }
