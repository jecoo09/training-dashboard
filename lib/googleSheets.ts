// lib/googleSheets.ts
import { google } from 'googleapis';

export interface TrainingRow {
  no: number;
  tanggalPelaksanaan: string;
  bulan: string; // Singkatan seperti Jan, Feb, Mar, dll.
  wilayah: string; // Singkatan seperti JTR, HO, dll.
  namaTraining: string;
  programTraining: string;
  jenisTraining: string;
  trainingHours: number;
  participant: number;
  totalTHours: number;
  namaTrainer: string;
}

export interface TrainerMasterRow {
  fullName: string;
  nik: string;
  locGroup: string;
  position: string;
}

export async function getTrainingData(): Promise<TrainingRow[]> {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.SPREADSHEET_ID;

  // Membaca rentang A2:K (Kolom A: No, B: Tanggal, C: Bulan, D: Wilayah, dst)
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'DATA_TRAINING!A2:K',
  });

  const rows = response.data.values || [];

  return rows.map((row) => ({
    no: parseInt(row[0], 10) || 0,                 // Kolom A: No
    tanggalPelaksanaan: row[1] || '',             // Kolom B: Tanggal Pelaksanaan
    bulan: row[2] || '',                          // Kolom C: Bulan (Jan, Feb, dst)
    wilayah: row[3] || '',                        // Kolom D: Wilayah (JTR, HO, dst)
    namaTraining: row[4] || '',                   // Kolom E
    programTraining: row[5] || '',                // Kolom F
    jenisTraining: row[6] || 'Internal',          // Kolom G
    trainingHours: parseFloat(row[7]) || 0,       // Kolom H
    participant: parseInt(row[8], 10) || 0,       // Kolom I
    totalTHours: parseFloat(row[9]) || 0,         // Kolom J
    namaTrainer: row[10] || 'Unknown',            // Kolom K
  }));
}

export async function findTrainerByNik(nik: string): Promise<TrainerMasterRow | null> {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: 'TRAINER!A2:E',
  });

  const row = (response.data.values || []).find((values) =>
    String(values[2] || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '') === nik,
  );

  if (!row) return null;
  return {
    fullName: String(row[1] || '').trim(),
    nik: String(row[2] || '').trim(),
    locGroup: String(row[3] || '').trim(),
    position: String(row[4] || '').trim(),
  };
}

export async function getTrainerMasterData(): Promise<TrainerMasterRow[]> {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: 'TRAINER!A2:E',
  });

  const rows = response.data.values || [];
  
  // Asumsi Kolom:
  // Row[1] = Nama Lengkap, Row[2] = NIK, Row[3] = Lokasi/LocGroup
  return rows.map((row) => ({
    fullName: String(row[1] || '').trim(),
    nik: String(row[2] || '').trim(),
    locGroup: String(row[3] || '').trim(),
    position: String(row[4] || '').trim(),
  }));
}