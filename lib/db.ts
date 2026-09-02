import { neon } from '@neondatabase/serverless';

export type UserRole = 'admin' | 'trainer';

export interface UserRecord {
  id: string;
  nik: string;
  fullName: string;
  locGroup: string | null;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
}

function getSql() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL belum dikonfigurasi');
  }
  return neon(databaseUrl);
}

export async function findUserByNik(nik: string): Promise<UserRecord | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, nik, full_name AS "fullName", loc_group AS "locGroup",
      password_hash AS "passwordHash", role, is_active AS "isActive"
    FROM users
    WHERE nik = ${nik}
    LIMIT 1
  `;
  return (rows[0] as UserRecord | undefined) ?? null;
}

export async function createTrainer(input: {
  nik: string;
  fullName: string;
  locGroup: string;
  passwordHash: string;
}): Promise<UserRecord> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO users (nik, full_name, loc_group, password_hash, role)
    VALUES (${input.nik}, ${input.fullName}, ${input.locGroup}, ${input.passwordHash}, 'trainer')
    RETURNING id, nik, full_name AS "fullName", loc_group AS "locGroup",
      password_hash AS "passwordHash", role, is_active AS "isActive"
  `;
  return rows[0] as UserRecord;
}