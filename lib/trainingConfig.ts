export const REGIONS = [
  ['Kantor Pusat', 'HO'], ['KPB Deli Serdang', 'DSG'], ['KPB Palembang', 'PLB'], ['KPB Cakung', 'CKG'], ['KPB Cibitung', 'CBT'], ['KPB Ungaran', 'UGN'], ['KPB Mojokerto', 'MJO'], ['KPB Pandaan', 'PDA'], ['KPB Gianyar', 'GYR'], ['TPA Sentul', 'STL'], ['TPA Purbalingga', 'PURB'], ['KPW Sumut & NAD', 'SANSBR'], ['KPW Sumbagsel Babel', 'SBB'], ['KPW Jakarta Banten', 'JKTBTN'], ['KPW Jawa Barat', 'JBR'], ['KPW Jawa Tengah', 'JTH'], ['KPW Jawa Timur', 'JTR'], ['KPW Bali Nusra', 'BNA'], ['KPW Kalimantan Sulawesi', 'KSI'], ['Pabrik RTS Slawi', 'SLAWI'],
] as const;
export const TRAINING_OPTIONS = [
  ['Program Orientasi Salesman', 'Salesmanship Core Competence', 24], ['Tea Certification', 'Tea Certification', 16], ['SCC', 'SCC', 4], ['TACCP', 'TACCP', 4], ['SSDP', 'SSDP', 8], ['Pelatihan Peningkatan Produktivitas Sertifikasi Kemnaker RI', 'Sertifikasi pelatihan', 35], ['OEE & TPM', 'OEE & TPM', 16], ['Program Orientasi 2', 'Salesmanship Core Competence 2', 16], ['Lainnya', 'Functional Training', 4],
] as const;
export function monthShort(date: string) { return ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'][new Date(`${date}T00:00:00`).getMonth()]; }
