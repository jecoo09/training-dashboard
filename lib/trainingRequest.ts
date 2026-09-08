import type { TrainingRequestRecord, UserRecord } from './db';
import { REGIONS, TRAINING_OPTIONS } from './trainingConfig';
export { monthShort } from './trainingConfig';

const allowedTypes = new Set(['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']);

export async function requestInput(form: FormData, user: UserRecord, existing?: TrainingRequestRecord | null) {
  const executionDate = String(form.get('executionDate') ?? ''); const regionLabel = String(form.get('regionLabel') ?? '');
  const selectedTitle = String(form.get('trainingTitle') ?? ''); const customTitle = String(form.get('customTitle') ?? '').trim();
  const trainingType = String(form.get('trainingType') ?? ''); const participantCount = Number(form.get('participantCount'));
  const trainerNames = String(form.get('trainerNames') ?? '').split(',').map((name) => name.trim()).filter(Boolean);
  const region = REGIONS.find(([label]) => label === regionLabel); const option = TRAINING_OPTIONS.find(([title]) => title === selectedTitle);
  if (!executionDate || !region || !option || !['Internal', 'Eksternal'].includes(trainingType) || !Number.isInteger(participantCount) || participantCount < 1) throw new Error('Data pengajuan belum lengkap atau tidak valid');
  const trainingTitle = selectedTitle === 'Lainnya' ? customTitle : selectedTitle;
  if (!trainingTitle) throw new Error('Judul training lainnya wajib diisi');
  if (trainerNames.length === 0 || trainerNames.length > 3) throw new Error('Nama trainer maksimal 3 orang');
  if (trainingType === 'Internal' && trainerNames[0].toLocaleUpperCase('id-ID') !== user.fullName.toLocaleUpperCase('id-ID')) throw new Error('Trainer pengaju harus berada di urutan pertama');
  let fileName = existing?.participantFileName ?? null; let fileMimeType = existing?.participantFileMimeType ?? null; let fileData: string | null = null;
  const file = form.get('participantFile');
  if (file instanceof File && file.size > 0) {
    if (file.size > 10 * 1024 * 1024 || !allowedTypes.has(file.type)) throw new Error('File harus PDF, Excel/CSV, atau Word dengan ukuran maksimal 10 MB');
    fileName = file.name; fileMimeType = file.type; fileData = Buffer.from(await file.arrayBuffer()).toString('base64');
  }
  if (!fileName) throw new Error('Daftar peserta wajib diunggah');
  return { submittedBy: user.id, submittedByName: user.fullName, executionDate, regionLabel, regionCode: region[1], trainingTitle, programTraining: option[1], trainingType: trainingType as 'Internal' | 'Eksternal', trainingHours: option[2], participantCount, totalTrainingHours: option[2] * participantCount, trainerNames: trainerNames.join(', '), participantFileId: null, participantFileName: fileName, participantFileMimeType: fileMimeType, participantFileData: fileData };
}
