import styles from './dashboard.module.css';

interface KpiCardsProps {
  totalSessions: number;
  totalParticipants: number;
  totalHours: number;
}

export default function KpiCards({
  totalSessions,
  totalParticipants,
  totalHours,
}: KpiCardsProps) {
  return (
    <section className={styles.card}>
      <div className={styles.kpiGrid}>
        <div className={styles.kpiItem}>
          <div className={styles.kpiLabel}>Total Sesi</div>
          <div className={styles.kpiValue}>{totalSessions}</div>
        </div>
        <div className={styles.kpiItem}>
          <div className={styles.kpiLabel}>Total Peserta</div>
          <div className={styles.kpiValue}>{totalParticipants}</div>
        </div>
        <div className={styles.kpiItem}>
          <div className={styles.kpiLabel}>Total Training Hours</div>
          <div className={styles.kpiValue}>{totalHours} hrs</div>
        </div>
      </div>
    </section>
  );
}
