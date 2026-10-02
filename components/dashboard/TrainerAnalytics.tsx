'use client';

import { useState } from 'react';
import {
  MONTHS,
  REGION_LIST,
  PROGRAM_LIST_FULL,
  TRAINER_TARGET_LIST,
  matchesMonth,
  matchesRegion,
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

type ColumnKey = 'name' | 'location' | 'sessions' | 'hours';

export default function TrainerAnalytics({ rawData, trainerMasterData = [] }: TrainerAnalyticsProps) {
  const [trainerFilterMonth, setTrainerFilterMonth] = useState<string>('All');
  const [trainerFilterRegion, setTrainerFilterRegion] = useState<string>('All');
  const [trainerFilterProgram, setTrainerFilterProgram] = useState<string>('All');

  // Sort state
  const [sortConfig, setSortConfig] = useState<{ key: ColumnKey | null; direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc',
  });

  const trainerLocMap = new Map<string, string>();
  trainerMasterData.forEach((t) => {
    trainerLocMap.set(t.fullName.trim().toUpperCase(), t.locGroup);
  });

  // Calculate trainer totals
  const allTrainers = TRAINER_TARGET_LIST.map((targetName) => {
    let totalHours = 0;
    let totalSessions = 0;

    rawData.forEach((item) => {
      const matchMonth = matchesMonth(item, trainerFilterMonth);
      const matchRegion = matchesRegion(item, trainerFilterRegion);
      const matchProgram = matchesProgram(item, trainerFilterProgram);

      if (matchMonth && matchRegion && matchProgram) {
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

  // Auto-hide 0 sessions/hours AND filter by Region if selected
  let visibleTrainers = allTrainers.filter((t) => {
    if (t.sessions === 0 && t.hours === 0) return false;
    if (trainerFilterRegion !== 'All' && t.location.toUpperCase() !== trainerFilterRegion.toUpperCase()) {
      return false;
    }
    return true;
  });

  // Sort logic
  if (sortConfig.key) {
    visibleTrainers = [...visibleTrainers].sort((a, b) => {
      const key = sortConfig.key!;
      const valA = a[key];
      const valB = b[key];

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
      }
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return sortConfig.direction === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }

  const handleHeaderClick = (col: ColumnKey) => {
    if (sortConfig.key !== col) {
      setSortConfig({ key: col, direction: 'asc' });
    } else if (sortConfig.direction === 'asc') {
      setSortConfig({ key: col, direction: 'desc' });
    } else {
      setSortConfig({ key: null, direction: 'asc' });
    }
  };

  const handleResetTrainerFilter = () => {
    setTrainerFilterMonth('All');
    setTrainerFilterRegion('All');
    setTrainerFilterProgram('All');
    setSortConfig({ key: null, direction: 'asc' });
  };

  const renderSortIndicator = (col: ColumnKey) => {
    if (sortConfig.key !== col) return <span style={{ opacity: 0.4, fontSize: '11px' }}> </span>;
    return sortConfig.direction === 'asc' ? <span style={{ fontSize: '11px' }}> ▲</span> : <span style={{ fontSize: '11px' }}> ▼</span>;
  };

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
            value={trainerFilterRegion}
            onChange={(e) => setTrainerFilterRegion(e.target.value)}
          >
            <option value="All">Semua Wilayah Kerja</option>
            {REGION_LIST.map((r) => (
              <option key={r} value={r}>{r}</option>
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

              <th
                className={`${styles.colTrainer} ${styles.thFilterable}`}
                onClick={() => handleHeaderClick('name')}
                title="Klik untuk Urutkan Nama Trainer"
              >
                <div className={styles.thHeaderBtn}>
                  <span>Nama Trainer{renderSortIndicator('name')}</span>
                </div>
              </th>

              <th
                className={styles.thFilterable}
                onClick={() => handleHeaderClick('location')}
                title="Klik untuk Urutkan Wilayah Kerja"
              >
                <div className={styles.thHeaderBtn}>
                  <span>Wilayah Kerja{renderSortIndicator('location')}</span>
                </div>
              </th>

              <th
                className={`${styles.colStat} ${styles.thFilterable}`}
                onClick={() => handleHeaderClick('sessions')}
                title="Klik untuk Urutkan Total Sesi"
              >
                <div className={styles.thHeaderBtn}>
                  <span>Total Sesi{renderSortIndicator('sessions')}</span>
                </div>
              </th>

              <th
                className={`${styles.colStat} ${styles.thFilterable}`}
                onClick={() => handleHeaderClick('hours')}
                title="Klik untuk Urutkan Total Training Hours"
              >
                <div className={styles.thHeaderBtn}>
                  <span>Total Training Hours{renderSortIndicator('hours')}</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleTrainers.length > 0 ? (
              visibleTrainers.map((trainer, idx) => (
                <tr key={trainer.name}>
                  <td className={styles.colNo}>{idx + 1}</td>
                  <td style={{ textAlign: 'left' }}>{trainer.name}</td>
                  <td>{trainer.location}</td>
                  <td>{trainer.sessions} Sesi</td>
                  <td><strong>{trainer.hours} Jam</strong></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
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
