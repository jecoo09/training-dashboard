export const REGIONS = [
  ['Kantor Pusat', 'HO'], 
  ['KPW Sumut & NAD', 'SANSBR'], 
  ['KPW Sumbagsel Babel', 'SBB'], 
  ['KPW Jakarta Banten', 'JKTBTN'], 
  ['KPW Jawa Barat', 'JBR'], 
  ['KPW Jawa Tengah', 'JTH'], 
  ['KPW Jawa Timur', 'JTR'], 
  ['KPW Bali Nusra', 'BNA'], 
  ['KPW Kalimantan Sulawesi', 'KSI'], 
  ['KPB Deli Serdang', 'DSG'], 
  ['KPB Palembang', 'PLB'], 
  ['KPB Cakung', 'CKG'], 
  ['KPB Cibitung', 'CBT'], 
  ['KPB Ungaran', 'UGN'], 
  ['KPB Mojokerto', 'MJO'], 
  ['KPB Pandaan', 'PDA'], 
  ['KPB Gianyar', 'GYR'], 
  ['TPA Sentul', 'STL'], 
  ['TPA Purbalingga', 'PURB'], 
  ['Pabrik RTS Slawi', 'SLAWI'],
] as const;

export const TRAINING_OPTIONS = [
  ['NEOP (SCC)', 'SCC', 4],
  ['Filosofi & Value (SCC)', 'SCC', 4],
  ['ACC (SCC)', 'SCC', 4],
  ['5R & K3 (SCC)', 'SCC', 4],
  ['Basic Leadership (SSDP)', 'SSDP', 8],
  ['Problem Solving (SSDP)', 'SSDP', 8],
  ['7 Habits (SSDP)', 'SSDP', 8],
  ['High Performance Leadership (SSDP)', 'SSDP', 8],
  ['Tea Brewer', 'Tea Certification', 16],
  ['Allergen Management', 'Functional Training', 4],
  ['Akselerasi Transformasi Industri 4.0', 'Functional Training', 4],
  ['Basic Tea', 'Tea Certification', 8],
  ['Food Security-TACCP', 'TACCP', 4],
  ['Refreshment Good Manufacturing Product', 'Functional Training', 4],
  ['Program Orientasi Salesman', 'Salesmanship Core Competence', 24],
  ['Program Orientasi Salesman 2', 'Salesmanship Core Competence 2', 16],
  ['Pelatihan Penggunaan APAR', 'Functional Training', 4],
  ['Quality Management System (SQMS)', 'Functional Training', 4],
  ['Sistem Jaminan Halal', 'Functional Training', 4],
  ['ISO 9001:2015', 'Functional Training', 4],
  ['Material & Chemical Handling', 'Functional Training', 4],
  ['Pest Control', 'Functional Training', 4],
  ['Lubrikasi', 'Functional Training', 4],
  ['OEE & TPM', 'OEE & TPM', 16],
  ['Tea Certification (Tea Institute)', 'TEA CERTIFICATION', 16],
  ['The 4 Discipline of Execution (4DX)', 'Functional Training', 8],
  ['Kelas Industri', 'Functional Training', 4],
  ['Lainnya', 'Functional Training', 4],
] as const;

export function monthShort(date: string) { 
  return ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'][
    new Date(`${date}T00:00:00`).getMonth()
  ]; 
}
