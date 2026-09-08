'use client';

import { useState } from 'react';
import {
  MONTHS,
  PROGRAM_LIST_FULL,
  TRAINER_TARGET_LIST,
  matchesMonth,
  matchesProgram,
  type TrainingRow,
} from '@/lib/dashboard';
import styles from './dashboard.module.css';

interface TrainerMaster {
  fullName: string;
  locGroup: string;
}

interface TrainerAnalyticsProps {
  rawData: TrainingRow[];
  trainerMasterData?: TrainerMaster[]; 
}

export default function TrainerAnalytics({ rawData, trainerMasterData = [] }: TrainerAnalyticsProps) {
  const [trainerFilterMonth, setTrainerFilterMonth] = useState<string>('All');
  const [trainerFilterProgram, setTrainerFilterProgram] = useState<string>('All');
  const [hideZero, setHideZero] = useState<boolean>(false);

  const isFiltered = trainerFilterMonth !== 'All' || trainerFilterProgram !== 'All';

  const trainerLocMap = new Map<string, string>();
  trainerMasterData.forEach((t) => {
    trainerLocMap.set(t.fullName.trim().toUpperCase(), t.locGroup);
  });

  const allTrainers = TRAINER_TARGET_LIST.map((targetName) => {
    let totalHours = 0;
    let totalSessions = 0;

    rawData.forEach((item) => {
      const matchMonth = matchesMonth(item, trainerFilterMonth);
      const matchProgram = matchesProgram(item, trainerFilterProgram);

      if (matchMonth && matchProgram) {
        const rawTrainerStr = item.namaTrainer || '';
        const namesInRow = rawTrainerStr.split(',').map((n) => n.trim().toUpperCase());
        if (namesInRow.includes(targetName.toUpperCase())) {
          totalHours += item.totalTHours;
          totalSessions += 1;
        }
      }
    });

    const location = trainerLocMap.get(targetName.toUpperCase()) || '-';

    return {
      name: targetName,
      location: location,
      hours: totalHours,
      sessions: totalSessions,
    };
  });

  const handleResetTrainerFilter = () => {
    setTrainerFilterMonth('All');
    setTrainerFilterProgram('All');
    setHideZero(false);
  };

  const visibleTrainers = (isFiltered || hideZero)
    ? allTrainers.filter((t) => t.sessions > 0 || t.hours > 0)
    : allTrainers;

  return (
    <section className={`${styles.card} ${styles.container4}`}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>Trainers Analytics</h3>
        <div className={styles.trainerFilters}>
          <select
            className={styles.select}
            value={trainerFilterMonth}
            onChange={(e) => setTrainerFilterMonth(e.target.value)}
          >
            <option value="All">Semua Bulan</option>
            {MONTHS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select
            className={styles.select}
            value={trainerFilterProgram}
            onChange={(e) => setTrainerFilterProgram(e.target.value)}
          >
            <option value="All">Semua Program Training</option>
            {PROGRAM_LIST_FULL.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <label
            className={`${styles.radioLabel} ${isFiltered ? styles.radioDisabled : ''} ${(!isFiltered && hideZero) || isFiltered ? styles.radioActive : ''}`}
            title={isFiltered ? 'Filter aktif: otomatis menyembunyikan trainer tanpa sesi' : 'Sembunyikan trainer dengan 0 sesi'}
          >
            <input
              type="checkbox"
              className={styles.radioInput}
              checked={isFiltered ? true : hideZero}
              disabled={isFiltered}
              onChange={(e) => setHideZero(e.target.checked)}
            />
            <span>Hide 0 Session</span>
          </label>

          <button
            type="button"
            className={styles.resetButton}
            onClick={handleResetTrainerFilter}
          >
            Reset Filter
          </button>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={`${styles.table} ${styles.tableIndexed}`}>
          <thead>
            <tr>
              <th className={styles.colNo}>No</th>
              <th className={styles.colTrainer}>Nama Trainer</th>
              <th>Wilayah Kerja</th>
              <th className={styles.colStat}>Total Sesi</th>
              <th className={styles.colStat}>Total Training Hours</th>
            </tr>
          </thead>
          <tbody>
            {visibleTrainers.length > 0 ? (
              visibleTrainers.map((trainer, idx) => (
                <tr key={trainer.name}>
                  <td className={styles.colNo}>{idx + 1}</td>
                  <td>{trainer.name}</td>
                  <td>{trainer.location}</td>
                  <td>{trainer.sessions} Sesi</td>
                  <td><strong>{trainer.hours} Jam</strong></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                  Tidak ada data trainer untuk filter yang dipilih
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className={styles.totalLabel}>TOTAL AKUMULASI</td>
              <td>
                <strong>{visibleTrainers.reduce((acc, curr) => acc + curr.sessions, 0)} Sesi</strong>
              </td>
              <td>
                <strong>{visibleTrainers.reduce((acc, curr) => acc + curr.hours, 0)} Jam</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
