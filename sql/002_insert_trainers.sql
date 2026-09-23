INSERT INTO users (
  nik,
  full_name,
  password_hash,
  loc_group,
  role,
  is_active
)
VALUES
  ('SGS000902604', 'JEKSON EDWARD PARDAMEAN SITOMPUL', crypt('SGS-KPW-SANSBR', gen_salt('bf')), 'KPW Sumut NAD - Sumbar Kepri', 'trainer', true),
  ('SGS241200023', 'SATYA WIRATAMAS PRIYANGGA', crypt('SGS-KPW-SBB', gen_salt('bf')), 'KPW Sumbagsel Babel', 'trainer', true),
  ('SGS000902541', 'ANDRI RAHDRIAN', crypt('SGS-KPW-JBR', gen_salt('bf')), 'KPW Jawa Barat', 'trainer', true),
  ('SGS020702670', 'ANDRIANA', crypt('SGS-KPW-JKTBTN', gen_salt('bf')), 'KPW Jakarta Banten', 'trainer', true),
  ('SGS231002319', 'AMADEUS DIMAS ANGGITA WINARDI', crypt('SGS-KPW-JKTBTN', gen_salt('bf')), 'KPW Jakarta Banten', 'trainer', true),
  ('SGS240102003', 'RONALD VINCENTIUS', crypt('SGS-KPW-JTR', gen_salt('bf')), 'KPW Jawa Timur', 'trainer', true),
  ('SGS241200062', 'ENDRICO RAYMOND TANUJAYA', crypt('SGS-KPW-JTH', gen_salt('bf')), 'KPW Jawa Tengah', 'trainer', true),
  ('SGS231102365', 'ANASTASIA LAURA KRISTIANTO TAUFICK', crypt('SGS-KPW-BNA', gen_salt('bf')), 'KPW Bali Nusra', 'trainer', true),
  ('SGS240402151', 'CINDY CAROLINE', crypt('SGS-KPW-KSI', gen_salt('bf')), 'KPW Kalimantan Sulawesi', 'trainer', true),
  ('SGS080302164', 'ILA TARLADI', crypt('SGS-KPB-CKG', gen_salt('bf')), 'KPB Cakung', 'trainer', true),
  ('SGS041102151', 'BEBEN MEKANIK MULYADI', crypt('SGS-KPB-CBT', gen_salt('bf')), 'KPB Cibitung', 'trainer', true),
  ('SGS060702667', 'SUPARDIKA IGM NGURAH', crypt('SGS-KPB-GYR', gen_salt('bf')), 'KPB Gianyar', 'trainer', true),
  ('SGS971102345', 'DODDY IRAWAN', crypt('SGS-KPB-PDA', gen_salt('bf')), 'KPB Pandaan', 'trainer', true),
  ('SGS110902308', 'HERJUNO WIKANDARU', crypt('SGS-KPB-UGN', gen_salt('bf')), 'KPB Ungaran', 'trainer', true),
  ('SGS971202383', 'IMRON HADI', crypt('SGS-KPB-MJO', gen_salt('bf')), 'KPB Mojokerto', 'trainer', true),
  ('SGS020302293', 'MUHAMMAD KOSASIH ARDIANTO AMD', crypt('SGS-KPB-DSG', gen_salt('bf')), 'KPB Deli Serdang', 'trainer', true),
  ('SGS061202106', 'RAHMAT', crypt('SGS-KPB-PLB', gen_salt('bf')), 'KPB Palembang', 'trainer', true),
  ('TPA130403004', 'TEDDY RAMADHAN', crypt('SGS-TPA-STL', gen_salt('bf')), 'TPA Sentul', 'trainer', true),
  ('TPA130603011', 'KHAERUL ANAM', crypt('SGS-TPA-PURB', gen_salt('bf')), 'TPA Purbalingga', 'trainer', true),
  ('SGS161001555', 'JULIAN DWI SETIAWAN', crypt('SGS-SLAWI', gen_salt('bf')), 'Slawi', 'trainer', true),
  ('SGS000402176', 'ARIS RACHMAN HAKIM', crypt('SGS-KPW-JTH', gen_salt('bf')), 'KPW Jawa Tengah', 'trainer', true),
  ('SGS021202056', 'HARDI WIJAYA', crypt('SGS-KPW-JBR', gen_salt('bf')), 'KPW Jawa Barat', 'trainer', true),
  ('SGS040602624', 'DIAN SYAHPUTRA', crypt('SGS-KPW-SANSBR', gen_salt('bf')), 'KPW Sumut NAD - Sumbar Kepri', 'trainer', true),
  ('SGS140802742', 'ARIO KAMANDANU DWI PUTRA', crypt('SGS-KPW-SBB', gen_salt('bf')), 'KPW Sumbagsel Babel', 'trainer', true),
  ('SGS170202172', 'CASKAWI', crypt('SGS-KPW-KSI', gen_salt('bf')), 'KPW Kalimantan Sulawesi', 'trainer', true),
  ('SGS970402051', 'DJAENUDIN', crypt('SGS-KPW-JKTBTN', gen_salt('bf')), 'KPW Jakarta Banten', 'trainer', true)
ON CONFLICT (nik)
DO UPDATE SET
  full_name = EXCLUDED.full_name,
  password_hash = EXCLUDED.password_hash,
  loc_group = EXCLUDED.loc_group,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();
