// app/api/analytics/route.ts
import { NextResponse } from 'next/server';
import { getTrainingData } from '@/lib/googleSheets';

export async function GET() {
  try {
    const rawData = await getTrainingData();

    // Total Sesi diambil dari angka nomor (No) pada baris paling akhir
    const lastRowNo = rawData.length > 0 ? rawData[rawData.length - 1].no : 0;
    const totalSessions = lastRowNo || rawData.length;

    const totalParticipants = rawData.reduce((acc, curr) => acc + curr.participant, 0);
    const totalHours = rawData.reduce((acc, curr) => acc + curr.totalTHours, 0);
    
    const internalCount = rawData.filter(d => 
      d.jenisTraining.toLowerCase().includes('internal')
    ).length;
    
    const externalCount = rawData.filter(d => 
      d.jenisTraining.toLowerCase().includes('eksternal') || 
      d.jenisTraining.toLowerCase().includes('external')
    ).length;

    return NextResponse.json({
      success: true,
      kpi: {
        totalSessions,
        totalParticipants,
        totalHours,
        internalCount,
        externalCount,
      },
      rawData,
    });
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data dari Google Sheets' },
      { status: 500 }
    );
  }
}