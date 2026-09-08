// lib/googleSheets.ts
import { google } from 'googleapis';

function getWriteAuth() {
  return new google.auth.GoogleAuth({
    credentials: { client_email: process.env.GOOGLE_CLIENT_EMAIL, private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

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

export async function appendApprovedTraining(row: Omit<TrainingRow, 'no'>) {
  const sheets = google.sheets({ version: 'v4', auth: getWriteAuth() });
  const current = await getTrainingData();
  const no = current.reduce((max, item) => Math.max(max, item.no), 0) + 1;
  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SPREADSHEET_ID, range: 'DATA_TRAINING!A:K', valueInputOption: 'USER_ENTERED', insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [[no, row.tanggalPelaksanaan, row.bulan, row.wilayah, row.namaTraining, row.programTraining, row.jenisTraining, row.trainingHours, row.participant, row.totalTHours, row.namaTrainer]] },
  });
  const match = (response.data.updates?.updatedRange ?? '').match(/![A-Z]+(\d+):/);
  if (!match) throw new Error('Baris Google Sheet hasil approval tidak ditemukan');
  return { no, sheetRowNumber: Number(match[1]) };
}

export async function deleteApprovedTrainingRow(sheetRecordNo: number) {
  const sheets = google.sheets({ version: 'v4', auth: getWriteAuth() });
  const data = await getTrainingData();
  const index = data.findIndex((row) => row.no === sheetRecordNo);
  if (index < 0) throw new Error('Data training di Google Sheet tidak ditemukan');
  const sheetRowNumber = index + 2;
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: process.env.SPREADSHEET_ID, fields: 'sheets.properties' });
  const sheetId = spreadsheet.data.sheets?.find((sheet) => sheet.properties?.title === 'DATA_TRAINING')?.properties?.sheetId;
  if (sheetId === undefined) throw new Error('Sheet DATA_TRAINING tidak ditemukan');
  await sheets.spreadsheets.batchUpdate({ spreadsheetId: process.env.SPREADSHEET_ID, requestBody: { requests: [{ deleteDimension: { range: { sheetId, dimension: 'ROWS', startIndex: sheetRowNumber - 1, endIndex: sheetRowNumber } } }] } });
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
