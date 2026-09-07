'use client';

import { useState } from 'react';
import {
  MONTHS,
  REGION_LIST,
  PROGRAM_LIST_FULL,
  getProgramCategory,
  matchesMonth,
  matchesRegion,
  type TrainingRow,
} from '@/lib/dashboard';
import styles from './dashboard.module.css';

interface ProgramAnalyticsProps {
  rawData: TrainingRow[];
  showDimensionToggle?: boolean;
}

export default function ProgramAnalytics({
  rawData,
  showDimensionToggle = true,
}: ProgramAnalyticsProps) {
  const [progDimension, setProgDimension] = useState<'MONTH' | 'REGION'>('MONTH');
  const [progMetric, setProgMetric] = useState<'SESSIONS' | 'HOURS'>('SESSIONS');

  const activeDimension = showDimensionToggle ? progDimension : 'MONTH';

  const combinedProgramData = PROGRAM_LIST_FULL.map((progCategory) => {
    if (activeDimension === 'MONTH') {
      const columns = MONTHS.map((m) => {
        const match = rawData.filter(
          (i) =>
            getProgramCategory(i.programTraining) === progCategory &&
            matchesMonth(i, m)
        );
        return progMetric === 'SESSIONS'
          ? match.length
          : match.reduce((sum, r) => sum + r.totalTHours, 0);
      });
      const rowTotal = columns.reduce((sum, val) => sum + val, 0);
      return { program: progCategory, columns, rowTotal };
    }

    const columns = REGION_LIST.map((reg) => {
      const match = rawData.filter(
        (i) =>
          getProgramCategory(i.programTraining) === progCategory &&
          matchesRegion(i, reg)
      );
      return progMetric === 'SESSIONS'
        ? match.length
        : match.reduce((sum, r) => sum + r.totalTHours, 0);
    });
    const rowTotal = columns.reduce((sum, val) => sum + val, 0);
    return { program: progCategory, columns, rowTotal };
  });

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>Training Program Analytics</h3>
        <div className={styles.toggleRow}>
          {showDimensionToggle && (
            <div className={styles.toggleGroup}>
              <button
                type="button"
                className={`${styles.toggleButton} ${activeDimension === 'MONTH' ? styles.toggleButtonActive : ''}`}
                onClick={() => setProgDimension('MONTH')}
              >
                Bulan
              </button>
              <button
                type="button"
                className={`${styles.toggleButton} ${activeDimension === 'REGION' ? styles.toggleButtonActive : ''}`}
                onClick={() => setProgDimension('REGION')}
              >
                Wilayah
              </button>
            </div>
          )}
          <div className={styles.toggleGroup}>
            <button
              type="button"
              className={`${styles.toggleButton} ${progMetric === 'SESSIONS' ? styles.toggleButtonActive : ''}`}
              onClick={() => setProgMetric('SESSIONS')}
            >
              Jumlah Sesi
            </button>
            <button
              type="button"
              className={`${styles.toggleButton} ${progMetric === 'HOURS' ? styles.toggleButtonActive : ''}`}
              onClick={() => setProgMetric('HOURS')}
            >
              Training Hours
            </button>
          </div>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={`${styles.table} ${styles.tableMetric} ${styles.tableCompact}`}>
          <thead>
            <tr>
              <th className={styles.colProgram}>Program Training</th>
              {activeDimension === 'MONTH'
                ? MONTHS.map((m) => (
                    <th key={m} className={styles.colMonthCell}>{m.toUpperCase()}</th>
                  ))
                : REGION_LIST.map((r) => (
                    <th key={r} className={styles.colMonthCell}>{r}</th>
                  ))}
              <th className={styles.colJumlah}>Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {combinedProgramData.map((p) => (
              <tr key={p.program}>
                <td>{p.program}</td>
                {p.columns.map((val, idx) => (
                  <td key={idx}>{val}</td>
                ))}
                <td>
                  <strong>{p.rowTotal} {progMetric === 'HOURS' ? 'hrs' : ''}</strong>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className={styles.totalLabel}>TOTAL</td>
              {(activeDimension === 'MONTH' ? MONTHS : REGION_LIST).map((_, colIdx) => {
                const colTotal = combinedProgramData.reduce(
                  (acc, curr) => acc + curr.columns[colIdx], 0
                );
                return (
                  <td key={`total-prog-${colIdx}`}>{colTotal}</td>
                );
              })}
              <td>
                {combinedProgramData.reduce((acc, curr) => acc + curr.rowTotal, 0)} {progMetric === 'HOURS' ? 'hrs' : ''}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
