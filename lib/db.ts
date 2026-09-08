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

export type TrainingRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface TrainingRequestRecord {
  id: string; submittedBy: string; submittedByName: string; submittedAt: string;
  executionDate: string; regionLabel: string; regionCode: string; trainingTitle: string;
  programTraining: string; trainingType: 'Internal' | 'Eksternal'; trainingHours: number;
  participantCount: number; totalTrainingHours: number; trainerNames: string;
  participantFileId: string | null; participantFileName: string | null; participantFileMimeType: string | null;
  participantFileData: string | null;
  status: TrainingRequestStatus; approvedBy: string | null; approvedByName: string | null;
  approvedAt: string | null; sheetRowNumber: number | null; sheetRecordNo: number | null;
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

const requestFields = `id, submitted_by AS "submittedBy", submitted_by_name AS "submittedByName", submitted_at AS "submittedAt", execution_date::text AS "executionDate", region_label AS "regionLabel", region_code AS "regionCode", training_title AS "trainingTitle", program_training AS "programTraining", training_type AS "trainingType", training_hours AS "trainingHours", participant_count AS "participantCount", total_training_hours AS "totalTrainingHours", trainer_names AS "trainerNames", participant_file_id AS "participantFileId", participant_file_name AS "participantFileName", participant_file_mime_type AS "participantFileMimeType", status, approved_by AS "approvedBy", approved_by_name AS "approvedByName", approved_at AS "approvedAt", sheet_row_number AS "sheetRowNumber", sheet_record_no AS "sheetRecordNo"`;
function requestSql(sql: ReturnType<typeof getSql>) { return (query: string, params: unknown[] = []) => sql.query(query, params) as unknown as Promise<TrainingRequestRecord[]>; }
export async function listTrainingRequests(user: UserRecord) { const execute = requestSql(getSql()); return user.role === 'admin' ? execute(`SELECT ${requestFields} FROM training_requests ORDER BY submitted_at DESC`) : execute(`SELECT ${requestFields} FROM training_requests WHERE submitted_by = $1 ORDER BY submitted_at DESC`, [user.id]); }
export async function findTrainingRequest(id: string) { const rows = await requestSql(getSql())(`SELECT ${requestFields} FROM training_requests WHERE id = $1 LIMIT 1`, [id]); return rows[0] ?? null; }
export async function createTrainingRequest(input: Omit<TrainingRequestRecord, 'id' | 'submittedAt' | 'status' | 'approvedBy' | 'approvedByName' | 'approvedAt' | 'sheetRowNumber' | 'sheetRecordNo'>) { const rows = await requestSql(getSql())(`INSERT INTO training_requests (submitted_by, submitted_by_name, execution_date, region_label, region_code, training_title, program_training, training_type, training_hours, participant_count, total_training_hours, trainer_names, participant_file_id, participant_file_name, participant_file_mime_type, participant_file_data) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING ${requestFields}`, [input.submittedBy, input.submittedByName, input.executionDate, input.regionLabel, input.regionCode, input.trainingTitle, input.programTraining, input.trainingType, input.trainingHours, input.participantCount, input.totalTrainingHours, input.trainerNames, input.participantFileId, input.participantFileName, input.participantFileMimeType, input.participantFileData]); return rows[0]; }
export async function updateTrainingRequest(id: string, input: Omit<TrainingRequestRecord, 'id' | 'submittedBy' | 'submittedByName' | 'submittedAt' | 'status' | 'approvedBy' | 'approvedByName' | 'approvedAt' | 'sheetRowNumber' | 'sheetRecordNo'>) { const rows = await requestSql(getSql())(`UPDATE training_requests SET execution_date=$2, region_label=$3, region_code=$4, training_title=$5, program_training=$6, training_type=$7, training_hours=$8, participant_count=$9, total_training_hours=$10, trainer_names=$11, participant_file_id=$12, participant_file_name=$13, participant_file_mime_type=$14, participant_file_data=COALESCE($15, participant_file_data) WHERE id=$1 AND status='pending' RETURNING ${requestFields}`, [id, input.executionDate, input.regionLabel, input.regionCode, input.trainingTitle, input.programTraining, input.trainingType, input.trainingHours, input.participantCount, input.totalTrainingHours, input.trainerNames, input.participantFileId, input.participantFileName, input.participantFileMimeType, input.participantFileData]); return rows[0] ?? null; }

export async function findTrainingRequestFile(id: string) { const rows = await requestSql(getSql())(`SELECT submitted_by AS "submittedBy", participant_file_name AS "participantFileName", participant_file_mime_type AS "participantFileMimeType", participant_file_data AS "participantFileData" FROM training_requests WHERE id = $1 LIMIT 1`, [id]); return rows[0] ?? null; }
export async function setTrainingRequestStatus(id: string, status: TrainingRequestStatus) { const rows = await requestSql(getSql())(`UPDATE training_requests SET status = $2 WHERE id = $1 AND status = 'pending' RETURNING ${requestFields}`, [id, status]); return rows[0] ?? null; }
export async function approveTrainingRequest(id: string, admin: UserRecord, sheetRowNumber: number, sheetRecordNo: number) { const rows = await requestSql(getSql())(`UPDATE training_requests SET status='approved', approved_by=$2, approved_by_name=$3, approved_at=NOW(), sheet_row_number=$4, sheet_record_no=$5 WHERE id=$1 AND status='pending' RETURNING ${requestFields}`, [id, admin.id, admin.fullName, sheetRowNumber, sheetRecordNo]); return rows[0] ?? null; }
export async function revokeTrainingRequestApproval(id: string) { const rows = await requestSql(getSql())(`UPDATE training_requests SET status='pending', approved_by=NULL, approved_by_name=NULL, approved_at=NULL, sheet_row_number=NULL, sheet_record_no=NULL WHERE id=$1 AND status='approved' RETURNING ${requestFields}`, [id]); return rows[0] ?? null; }
