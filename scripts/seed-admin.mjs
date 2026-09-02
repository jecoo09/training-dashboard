import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';

const required = ['DATABASE_URL', 'ADMIN_NIK', 'ADMIN_NAME', 'ADMIN_PASSWORD'];
const missing = required.filter((name) => !process.env[name]);
if (missing.length) throw new Error(`Environment variable wajib belum ada: ${missing.join(', ')}`);

const sql = neon(process.env.DATABASE_URL);
const nik = process.env.ADMIN_NIK.trim().toUpperCase();
const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
await sql`
  INSERT INTO users (nik, full_name, loc_group, password_hash, role)
  VALUES (${nik}, ${process.env.ADMIN_NAME.trim()}, ${process.env.ADMIN_LOCATION?.trim() || null}, ${passwordHash}, 'admin')
  ON CONFLICT (nik) DO UPDATE SET full_name = EXCLUDED.full_name, loc_group = EXCLUDED.loc_group,
    password_hash = EXCLUDED.password_hash, role = 'admin', is_active = TRUE, updated_at = NOW()
`;
console.log(`Admin ${nik} berhasil disiapkan.`);