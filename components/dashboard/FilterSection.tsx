'use client';

import { useState } from 'react';
import {
  MONTHS,
  REGION_LIST,
  PROGRAM_LIST_FULL,
  calcPercentage,
  matchesMonth,
  matchesRegion,
  matchesProgram,
  type TrainingRow,
} from '@/lib/dashboard';
import styles from './dashboard.module.css';

interface FilterSectionProps {
  rawData: TrainingRow[];
}

export default function FilterSection({ rawData }: FilterSectionProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedProgram, setSelectedProgram] = useState<string>('All');

  const handleResetFilter = () => {
    setSelectedMonth('All');
    setSelectedRegion('All');
    setSelectedProgram('All');
  };

  const filteredData = rawData.filter(
    (item) =>
      matchesMonth(item, selectedMonth) &&
      matchesRegion(item, selectedRegion) &&
      matchesProgram(item, selectedProgram)
  );

  const section3Sessions = filteredData.length;
  const section3Participants = filteredData.reduce((sum, item) => sum + item.participant, 0);
  const section3Hours = filteredData.reduce((sum, item) => sum + item.totalTHours, 0);

  let prevMonthSessions = 0;
  let prevMonthParticipants = 0;
  let prevMonthHours = 0;
  let hasPrevMonth = false;

  if (selectedMonth !== 'All') {
    const monthIdx = MONTHS.indexOf(selectedMonth);
    if (monthIdx > 0) {
      hasPrevMonth = true;
      const prevMonthName = MONTHS[monthIdx - 1];
      const prevFiltered = rawData.filter(
        (item) =>
          matchesMonth(item, prevMonthName) &&
          matchesRegion(item, selectedRegion) &&
          matchesProgram(item, selectedProgram)
      );

      prevMonthSessions = prevFiltered.length;
      prevMonthParticipants = prevFiltered.reduce((sum, item) => sum + item.participant, 0);
      prevMonthHours = prevFiltered.reduce((sum, item) => sum + item.totalTHours, 0);
    }
  }

  return (
    <section className={styles.card}>
      <div className={styles.filterBar}>
        <select
          className={styles.select}
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value="All">Semua Bulan</option>
          {MONTHS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <select
          className={styles.select}
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
        >
          <option value="All">Semua Wilayah</option>
          {REGION_LIST.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <select
          className={styles.select}
          value={selectedProgram}
          onChange={(e) => setSelectedProgram(e.target.value)}
        >
          <option value="All">Semua Program Training</option>
          {PROGRAM_LIST_FULL.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <button type="button" className={styles.resetButton} onClick={handleResetFilter}>
          Reset Filter
        </button>
      </div>

      <div className={styles.filteredGrid}>
        <div className={styles.filteredItem}>
          <div className={styles.kpiLabel}>Total Sesi</div>
          <div className={styles.kpiValue}>{section3Sessions}</div>
          <div className={styles.momHint}>
            {hasPrevMonth ? `vs Last Month: ${calcPercentage(section3Sessions, prevMonthSessions)}` : '\u00A0'}
          </div>
        </div>

        <div className={styles.filteredItem}>
          <div className={styles.kpiLabel}>Total Peserta</div>
          <div className={styles.kpiValue}>{section3Participants}</div>
          <div className={styles.momHint}>
            {hasPrevMonth ? `vs Last Month: ${calcPercentage(section3Participants, prevMonthParticipants)}` : '\u00A0'}
          </div>
        </div>

        <div className={styles.filteredItem}>
          <div className={styles.kpiLabel}>Total Jam Training</div>
          <div className={styles.kpiValue}>{section3Hours} hrs</div>
          <div className={styles.momHint}>
            {hasPrevMonth ? `vs Last Month: ${calcPercentage(section3Hours, prevMonthHours)}` : '\u00A0'}
          </div>
        </div>
      </div>
    </section>
  );
}
