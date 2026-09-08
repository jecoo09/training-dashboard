# Training Dashboard

## Setup Neon dan Auth

1. Buat project di Neon, salin connection string ke `DATABASE_URL`, dan buat `SESSION_SECRET` acak.
2. Isi `.env.local` dengan `DATABASE_URL`, `SESSION_SECRET`, dan credential Google Sheets.
3. Jalankan isi `sql/001_create_users.sql`, `sql/002_create_training_requests.sql`, dan `sql/003_store_participant_files_in_neon.sql` di Neon SQL Editor.
4. Isi `ADMIN_NIK`, `ADMIN_NAME`, `ADMIN_LOCATION`, dan `ADMIN_PASSWORD` di `.env.local`.
5. Jalankan `npm run seed:admin` untuk membuat atau memperbarui akun admin.
6. Jalankan `npm run dev` dan buka `/login`.

Tab Google Sheets `TRAINER` harus memiliki kolom `No, Nama, NIK, Lokasi, Posisi`; data dimulai dari baris kedua. NIK divalidasi dari kolom ketiga.

Dashboard admin berada di `/admin`. Dashboard trainer berada di `/` dan hanya dapat dibuka setelah login trainer.

## Pengajuan training

Trainer mengakses pengajuan di `/requests`; admin mengelolanya di `/admin/requests`. Lampiran daftar peserta disimpan langsung di Neon. Service Account hanya perlu menjadi **Editor** pada spreadsheet agar approval dapat menambah atau menghapus baris `DATA_TRAINING`.

## Commands

```bash
npm run dev
npm run lint
npm run build
npm run seed:admin
```
