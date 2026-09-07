export interface User {
  fullName: string;
  nik: string;
  locGroup: string | null;
  role: string;
}

export interface TrainingRow {
  no: number;
  tanggalPelaksanaan: string;
  bulan: string;
  wilayah: string;
  namaTraining: string;
  programTraining: string;
  jenisTraining: string;
  trainingHours: number;
  participant: number;
  totalTHours: number;
  namaTrainer: string;
}

export const REGION_LIST = [
  'HO', 'SANSBR', 'SBB', 'JKTBTN', 'JBR', 'JTH', 'JTR', 'BNA',
  'KSI', 'DSG', 'PLB', 'CKG', 'CBT', 'UGN', 'MJO', 'GYR',
  'PURB', 'PDA', 'STL', 'SLAWI'
];

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const SPECIFIC_PROGRAMS = [
  'SCC',
  'SSDP',
  'SALESMANSHIP CORE COMPETENCE',
  'SALESMANSHIP CORE COMPETENCE 2',
  'TEA CERTIFICATION'
];

export const PROGRAM_LIST_FULL = [...SPECIFIC_PROGRAMS, 'TRAINING LAINNYA'];

export const TRAINER_TARGET_LIST = [
  'JEKSON EDWARD PARDAMEAN SITOMPUL',
  'SATYA WIRATAMAS PRIYANGGA',
  'ANDRI RAHDRIAN',
  'ANDRIANA',
  'AMADEUS DIMAS ANGGITA WINARDI',
  'RONALD VINCENTIUS',
  'ENDRICO RAYMOND TANUJAYA',
  'ANASTASIA LAURA KRISTIANTO TAUFICK',
  'CINDY CAROLINE',
  'ILA TARLADI',
  'BEBEN MEKANIK MULYADI',
  'SUPARDIKA IGM NGURAH',
  'DODDY IRAWAN',
  'HERJUNO WIKANDARU',
  'IMRON HADI',
  'MUHAMMAD KOSASIH ARDIANTO AMD',
  'RAHMAT',
  'TEDDY RAMADHAN',
  'KHAERUL ANAM',
  'JULIAN DWI SETIAWAN',
  'ARIS RACHMAN HAKIM',
  'HARDI WIJAYA',
  'DIAN SYAHPUTRA',
  'ARIO KAMANDANU DWI PUTRA',
  'CASKAWI',
  'DJAENUDIN'
];

export function getProgramCategory(rawProg: string): string {
  const trimmed = rawProg.trim().toUpperCase();
  if (SPECIFIC_PROGRAMS.some((p) => p.toUpperCase() === trimmed)) {
    return trimmed;
  }
  return 'TRAINING LAINNYA';
}

export function calcPercentage(curr: number, prev: number): string {
  if (prev === 0) return curr > 0 ? '+100%' : '0%';
  const diff = ((curr - prev) / prev) * 100;
  return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`;
}

export function matchesMonth(item: TrainingRow, month: string): boolean {
  if (month === 'All') return true;
  return (
    item.bulan.toLowerCase().includes(month.toLowerCase()) ||
    item.tanggalPelaksanaan.toLowerCase().includes(month.toLowerCase())
  );
}

export function matchesRegion(item: TrainingRow, region: string): boolean {
  if (region === 'All') return true;
  return item.wilayah.trim().toUpperCase() === region.toUpperCase();
}

export function matchesProgram(item: TrainingRow, program: string): boolean {
  if (program === 'All') return true;
  return getProgramCategory(item.programTraining).toUpperCase() === program.toUpperCase();
}
