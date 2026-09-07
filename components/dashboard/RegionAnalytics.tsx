'use client';

import { useState } from 'react';
import {
  MONTHS,
  REGION_LIST,
  matchesMonth,
  matchesRegion,
  type TrainingRow,
} from '@/lib/dashboard';
import styles from './dashboard.module.css';

interface RegionAnalyticsProps {
  rawData: TrainingRow[];
}

export default function RegionAnalytics({ rawData }: RegionAnalyticsProps) {
  const [b6Metric, setB6Metric] = useState<'TC' | 'TP' | 'TH'>('TC');

  const regionMatrix = REGION_LIST.map((region, idx) => {
    const monthsData = MONTHS.map((m) => {
      const match = rawData.filter(
        (i) => matchesRegion(i, region) && matchesMonth(i, m)
      );
      return {
        tc: match.length,
        tp: match.reduce((sum, r) => sum + r.participant, 0),
        th: match.reduce((sum, r) => sum + r.totalTHours, 0),
      };
    });

    return {
      no: idx + 1,
      region,
      monthsData,
    };
  });

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>Detail Analytics</h3>
        <div className={styles.toggleGroup}>
          <button
            type="button"
            className={`${styles.toggleButton} ${b6Metric === 'TC' ? styles.toggleButtonActive : ''}`}
            onClick={() => setB6Metric('TC')}
          >
            Training Class
          </button>
          <button
            type="button"
            className={`${styles.toggleButton} ${b6Metric === 'TP' ? styles.toggleButtonActive : ''}`}
            onClick={() => setB6Metric('TP')}
          >
            Participants
          </button>
          <button
            type="button"
            className={`${styles.toggleButton} ${b6Metric === 'TH' ? styles.toggleButtonActive : ''}`}
            onClick={() => setB6Metric('TH')}
          >
            Training Hours
          </button>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={`${styles.table} ${styles.tableIndexed}`}>
          <thead>
            <tr>
              <th className={styles.colNo}>No</th>
              <th className={styles.colRegionTitle}>Wilayah Kerja</th>
              {MONTHS.map((m) => (
                <th key={m} className={styles.colMonthCell}>{m.toUpperCase()}</th>
              ))}
              <th className={styles.colJumlah}>Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {regionMatrix.map((r) => {
              const rowTotalVal = r.monthsData.reduce((sum, item) => {
                return sum + (b6Metric === 'TC' ? item.tc : b6Metric === 'TP' ? item.tp : item.th);
              }, 0);
              return (
                <tr key={r.region}>
                  <td>{r.no}</td>
                  <td>{r.region}</td>
                  {r.monthsData.map((md, mIdx) => (
                    <td key={mIdx}>
                      {b6Metric === 'TC' ? md.tc : b6Metric === 'TP' ? md.tp : md.th}
                    </td>
                  ))}
                  <td>
                    <strong>{rowTotalVal} {b6Metric === 'TH' ? 'hrs' : ''}</strong>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} className={styles.totalLabel}>TOTAL</td>
              {MONTHS.map((m, mIdx) => {
                const sumVal = regionMatrix.reduce((acc, curr) => {
                  const item = curr.monthsData[mIdx];
                  return acc + (b6Metric === 'TC' ? item.tc : b6Metric === 'TP' ? item.tp : item.th);
                }, 0);
                return (
                  <td key={`total-b6-${m}`}>{sumVal}</td>
                );
              })}
              <td>
                {regionMatrix.reduce((totalAcc, r) => {
                  return totalAcc + r.monthsData.reduce((sum, item) => {
                    return sum + (b6Metric === 'TC' ? item.tc : b6Metric === 'TP' ? item.tp : item.th);
                  }, 0);
                }, 0)} {b6Metric === 'TH' ? 'hrs' : ''}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
