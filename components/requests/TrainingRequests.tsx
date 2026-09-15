'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { User } from '@/lib/dashboard';
import { REGIONS, TRAINING_OPTIONS } from '@/lib/trainingConfig';
import styles from './requests.module.css';

type RequestItem = {
  id: string;
  submittedAt: string;
  executionDate: string;
  regionLabel: string;
  trainingTitle: string;
  programTraining: string;
  trainingType: string;
  trainingHours: number;
  participantCount: number;
  trainerNames: string;
  participantFileName: string | null;
  status: string;
  approvedByName: string | null;
  approvedAt: string | null;
};

const labels: Record<string, string> = {
  pending: 'Menunggu approval',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Dibatalkan',
};

function time(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(value));
}

export default function TrainingRequests({ user }: { user: User }) {
  const admin = user.role === 'admin';
  const [items, setItems] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<RequestItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    const data = await fetch('/api/requests').then((r) => r.json());
    if (data.success) setItems(data.requests);
    else setError(data.error || 'Gagal memuat pengajuan');
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const statusClass = (status: string) =>
    `${styles.status} ${styles[`status_${status}`]}`;

  async function action(
    id: string,
    action: 'approve' | 'reject' | 'cancel-approval' | 'cancel'
  ) {
    const message =
      action === 'approve'
        ? 'Approve pengajuan ini? Data akan langsung masuk ke DATA_TRAINING.'
        : action === 'cancel-approval'
        ? 'Batalkan approval? Data akan dihapus dari DATA_TRAINING dan kembali pending.'
        : action === 'reject'
        ? 'Tolak pengajuan ini?'
        : 'Batalkan pengajuan ini?';
    if (!window.confirm(message)) return;
    setBusy(true);
    setError('');
    const response = await fetch(
      action === 'cancel'
        ? `/api/requests/${id}`
        : `/api/requests/${id}/${action}`,
      { method: action === 'cancel' ? 'DELETE' : 'POST' }
    );
    const data = await response.json();
    setBusy(false);
    if (!data.success) setError(data.error || 'Aksi gagal');
    else load();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const response = await fetch(
      editing ? `/api/requests/${editing.id}` : '/api/requests',
      {
        method: editing ? 'PATCH' : 'POST',
        body: new FormData(event.currentTarget),
      }
    );
    const data = await response.json();
    setBusy(false);
    if (!data.success) {
      setError(data.error || 'Gagal menyimpan pengajuan');
      return;
    }
    setModal(false);
    setEditing(null);
    load();
  }

  return (
    <section className={styles.wrap}>
      <div className={styles.top}>
        {!admin && (
          <button
            className={styles.primary}
            onClick={() => {
              setEditing(null);
              setModal(true);
            }}
          >
            Add New Training
          </button>
        )}
      </div>
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.tableWrap}>
        <table>
          <thead>
            <tr>
              {admin ? (
                <>
                  <th>No</th>
                  <th>Tanggal Pengajuan</th>
                  <th>Judul Training</th>
                  <th>Tanggal Training</th>
                  <th>Jenis</th>
                  <th>Nama Trainer</th>
                  <th>Peserta</th>
                  <th>Daftar Peserta</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </>
              ) : (
                <>
                  <th>No</th>
                  <th>Tanggal Pengajuan</th>
                  <th>Judul Training</th>
                  <th>Jenis Training</th>
                  <th>Jumlah Peserta</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={admin ? 10 : 7}>Memuat pengajuan...</td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={admin ? 10 : 7}>Belum ada pengajuan.</td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{time(item.submittedAt)}</td>
                  <td>{item.trainingTitle}</td>
                  {admin && <td>{item.executionDate}</td>}
                  <td>{item.trainingType}</td>
                  {admin && <td>{item.trainerNames}</td>}
                  <td>{item.participantCount}</td>
                  {admin && (
                    <td>
                      {item.participantFileName ? (
                        <a href={`/api/requests/${item.id}/file`}>
                          Detail / Unduh
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                  )}

                  {/* Kolom Status (Dipisah secara terstruktur) */}
                  <td>
                    <span className={statusClass(item.status)}>
                      {labels[item.status]}
                    </span>
                    {admin && item.approvedByName && (
                      <div style={{ marginTop: '4px', fontSize: '11px', color: '#78716c' }}>
                        oleh {item.approvedByName}
                        <br />
                        {time(item.approvedAt!)}
                      </div>
                    )}
                  </td>

                  {/* Kolom Aksi */}
                  <td className={styles.actions}>
                    {admin ? (
                      <>
                        {item.status === 'pending' && (
                          <>
                            <button
                              disabled={busy}
                              onClick={() => action(item.id, 'approve')}
                            >
                              Approve
                            </button>
                            <button
                              disabled={busy}
                              onClick={() => action(item.id, 'reject')}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {item.status === 'approved' && (
                          <button
                            disabled={busy}
                            onClick={() => action(item.id, 'cancel-approval')}
                          >
                            Batalkan approval
                          </button>
                        )}
                        {item.status !== 'pending' && item.status !== 'approved' && '-'}
                      </>
                    ) : (
                      <>
                        {item.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => {
                                setEditing(item);
                                setModal(true);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              disabled={busy}
                              onClick={() => action(item.id, 'cancel')}
                            >
                              Batalkan
                            </button>
                          </>
                        ) : (
                          '-'
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <RequestForm
          user={user}
          editing={editing}
          onClose={() => {
            setModal(false);
            setEditing(null);
          }}
          onSubmit={submit}
          busy={busy}
        />
      )}
    </section>
  );
}

function RequestForm({
  user,
  editing,
  onClose,
  onSubmit,
  busy,
}: {
  user: User;
  editing: RequestItem | null;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  busy: boolean;
}) {
  const [type, setType] = useState<string>(editing?.trainingType || 'Internal');
  const [title, setTitle] = useState<string>(
    TRAINING_OPTIONS.some(([value]) => value === editing?.trainingTitle)
      ? editing?.trainingTitle || TRAINING_OPTIONS[0][0]
      : 'Lainnya'
  );

  const defaultRegionLabel = useMemo(() => {
    if (editing?.regionLabel) return editing.regionLabel;
    if (!user.locGroup) return '';
    const match = REGIONS.find(
      ([label, code]) =>
        label.toLowerCase().includes(user.locGroup!.toLowerCase()) ||
        code.toLowerCase() === user.locGroup!.toLowerCase()
    );
    return match ? match[0] : '';
  }, [user.locGroup, editing?.regionLabel]);

  const initialTrainers = useMemo(() => {
    if (editing?.trainerNames) {
      return editing.trainerNames.split(',').map((t) => t.trim());
    }
    return type === 'Internal' ? [user.fullName] : [''];
  }, [editing, type, user.fullName]);

  const [trainers, setTrainers] = useState<string[]>(initialTrainers);

  const handleAddTrainer = () => {
    if (trainers.length < 3) {
      setTrainers([...trainers, '']);
    }
  };

  const handleRemoveTrainer = (index: number) => {
    setTrainers(trainers.filter((_, i) => i !== index));
  };

  const handleTrainerChange = (index: number, value: string) => {
    const updated = [...trainers];
    updated[index] = value;
    setTrainers(updated);
  };

  return (
    <div className={styles.backdrop}>
      <form className={styles.modal} onSubmit={onSubmit}>
        <div className={styles.modalTop}>
          <h2>{editing ? 'Edit Pengajuan' : 'Ajukan Training'}</h2>
          <button type="button" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className={styles.formGrid}>
          {/* Tanggal Pelaksanaan */}
          <label>
            Tanggal pelaksanaan
            <input
              name="executionDate"
              type="date"
              defaultValue={editing?.executionDate}
              required
            />
          </label>

          {/* Wilayah */}
          <label>
            Wilayah
            <select name="regionLabel" defaultValue={defaultRegionLabel} required>
              <option value="">Pilih wilayah</option>
              {REGIONS.map(([label]) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          {/* Jenis Training */}
          <label>
            Jenis training
            <select
              name="trainingType"
              value={type}
              onChange={(e) => {
                const newType = e.target.value;
                setType(newType);
                if (newType === 'Internal') {
                  setTrainers([user.fullName]);
                } else {
                  setTrainers(['']);
                }
              }}
            >
              <option value="Internal">Internal</option>
              <option value="Eksternal">Eksternal</option>
            </select>
          </label>

          {/* Judul Training */}
          <label>
            Judul training
            <select
              name="trainingTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            >
              {TRAINING_OPTIONS.map(([value]) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          {/* Input Judul Lainnya */}
          {title === 'Lainnya' && (
            <label className={styles.full}>
              Judul training lainnya
              <input
                name="customTitle"
                defaultValue={
                  editing?.trainingTitle &&
                  !TRAINING_OPTIONS.some(([val]) => val === editing.trainingTitle)
                    ? editing.trainingTitle
                    : ''
                }
                placeholder="Ketikkan judul training..."
                required
              />
            </label>
          )}

          {/* Jumlah Peserta */}
          <label className={title === 'Lainnya' ? '' : styles.full}>
            Jumlah peserta
            <input
              name="participantCount"
              type="number"
              min="1"
              defaultValue={editing?.participantCount}
              required
            />
          </label>

          {/* Daftar Trainer */}
          <div className={styles.full} style={{ display: 'grid', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700 }}>
              Nama Trainer{' '}
              <small style={{ fontWeight: 400, color: '#78716c' }}>
                ({type === 'Internal' ? 'Pengaju terkunci di posisi 1' : 'Maksimal 3 trainer'})
              </small>
            </span>

            {trainers.map((trainer, index) => {
              const isLocked = type === 'Internal' && index === 0;
              return (
                <div
                  key={index}
                  style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
                >
                  <input
                    type="text"
                    value={trainer}
                    readOnly={isLocked}
                    onChange={(e) => handleTrainerChange(index, e.target.value)}
                    placeholder={`Nama Trainer ${index + 1}`}
                    style={{
                      flex: 1,
                      padding: '9px',
                      border: '1px solid #d6d3d1',
                      borderRadius: '6px',
                      backgroundColor: isLocked ? '#f5f5f4' : '#ffffff',
                    }}
                    required
                  />

                  {!isLocked && trainers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTrainer(index)}
                      style={{
                        padding: '9px 12px',
                        border: '1px solid #fca5a5',
                        background: '#fef2f2',
                        color: '#991b1b',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      Hapus
                    </button>
                  )}
                </div>
              );
            })}

            <input
              type="hidden"
              name="trainerNames"
              value={trainers.filter(Boolean).join(', ')}
            />

            {trainers.length < 3 && (
              <button
                type="button"
                onClick={handleAddTrainer}
                style={{
                  alignSelf: 'start',
                  marginTop: '4px',
                  padding: '6px 12px',
                  border: '1px dashed #d6d3d1',
                  background: '#fafaf9',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                + Tambah Trainer
              </button>
            )}
          </div>

          {/* Upload File Daftar Peserta */}
          <label className={styles.full}>
            Daftar peserta{' '}
            {editing?.participantFileName && (
              <small>File saat ini: {editing.participantFileName}</small>
            )}
            <input
              name="participantFile"
              type="file"
              accept=".pdf,.xlsx,.xls,.csv,.doc,.docx"
              required={!editing}
            />
          </label>
        </div>

        <p className={styles.hint}>
          File PDF, Excel/CSV, atau Word; maksimal 10 MB.
        </p>

        <div className={styles.modalActions}>
          <button type="button" onClick={onClose}>
            Batal
          </button>
          <button className={styles.primary} disabled={busy}>
            {busy ? 'Menyimpan...' : 'Kirim pengajuan'}
          </button>
        </div>
      </form>
    </div>
  );
}