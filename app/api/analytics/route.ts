// app/api/analytics/route.ts
import { NextResponse } from 'next/server';
import { getTrainingData, getTrainerMasterData } from '@/lib/googleSheets';

export async function GET() {
  try {
    const rawData = await getTrainingData();
    const trainerMaster = await getTrainerMasterData();

    // Nomor Sheet dapat memiliki celah saat approval dibatalkan; jumlah baris adalah total sesi yang akurat.
    const totalSessions = rawData.length;

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
      trainerMaster,
    });
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data dari Google Sheets' },
      { status: 500 }
    );
  }
}
