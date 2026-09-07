import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  MONTHS,
  calcPercentage,
  matchesMonth,
  type TrainingRow,
} from '@/lib/dashboard';
import styles from './dashboard.module.css';

const METRIC_TC = '#e53935';
const METRIC_TP = '#fbc02d';
const METRIC_TH = '#1e88e5';

interface MonthlyAnalyticsProps {
  rawData: TrainingRow[];
}

function buildMonthlyMatrix(rawData: TrainingRow[]) {
  return MONTHS.map((m) => {
    const mRows = rawData.filter((item) => matchesMonth(item, m));
    return {
      month: m,
      tc: mRows.length,
      tp: mRows.reduce((sum, i) => sum + i.participant, 0),
      th: mRows.reduce((sum, i) => sum + i.totalTHours, 0),
    };
  });
}

export function MomComparison({ rawData }: MonthlyAnalyticsProps) {
  const monthlyMatrix = buildMonthlyMatrix(rawData);

  const momMatrix = monthlyMatrix.map((item, idx) => {
    if (idx === 0) {
      return { month: item.month, tcGrowth: '-', tpGrowth: '-', thGrowth: '-' };
    }
    const prev = monthlyMatrix[idx - 1];
    return {
      month: item.month,
      tcGrowth: calcPercentage(item.tc, prev.tc),
      tpGrowth: calcPercentage(item.tp, prev.tp),
      thGrowth: calcPercentage(item.th, prev.th),
    };
  });

  return (
    <div className={styles.tableWrap}>
      <table className={`${styles.table} ${styles.tableMetric} ${styles.tableCompact}`}>
        <thead>
          <tr>
            <th className={styles.colRegionTitle}>MoM Growth</th>
            {MONTHS.map((m) => (
              <th key={m} className={styles.colMonthCell}>{m.toUpperCase()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className={styles.rowTc}>
            <td>Training Class</td>
            {momMatrix.map((m) => (
              <td key={m.month}>{m.tcGrowth}</td>
            ))}
          </tr>
          <tr className={styles.rowTp}>
            <td>Participants</td>
            {momMatrix.map((m) => (
              <td key={m.month}>{m.tpGrowth}</td>
            ))}
          </tr>
          <tr className={styles.rowTh}>
            <td>Training Hours</td>
            {momMatrix.map((m) => (
              <td key={m.month}>{m.thGrowth}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function MonthlyAnalytics({ rawData }: MonthlyAnalyticsProps) {
  const monthlyMatrix = buildMonthlyMatrix(rawData);

  const totalTC = monthlyMatrix.reduce((acc, curr) => acc + curr.tc, 0);
  const totalTP = monthlyMatrix.reduce((acc, curr) => acc + curr.tp, 0);
  const totalTH = monthlyMatrix.reduce((acc, curr) => acc + curr.th, 0);

  const momMatrix = monthlyMatrix.map((item, idx) => {
    if (idx === 0) {
      return { month: item.month, tcGrowth: '-', tpGrowth: '-', thGrowth: '-' };
    }
    const prev = monthlyMatrix[idx - 1];
    return {
      month: item.month,
      tcGrowth: calcPercentage(item.tc, prev.tc),
      tpGrowth: calcPercentage(item.tp, prev.tp),
      thGrowth: calcPercentage(item.th, prev.th),
    };
  });

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>Monthly Analytics</h3>
      </div>

      <div className={styles.monthlyContainer}>
        {/* Table 1: Matrix Values */}
        <div className={styles.tableWrap}>
          <table className={`${styles.table} ${styles.tableMetric}`}>
            <thead>
              <tr>
                <th className={styles.colRegionTitle}>Indicators</th>
                {MONTHS.map((m) => (
                  <th key={m} className={styles.colMonthCell}>{m.toUpperCase()}</th>
                ))}
                <th className={styles.colJumlah}>Jumlah</th>
              </tr>
            </thead>
            <tbody>
              <tr className={styles.rowTc}>
                <td>Training Class</td>
                {monthlyMatrix.map((m) => (
                  <td key={m.month}>{m.tc}</td>
                ))}
                <td><strong>{totalTC}</strong></td>
              </tr>
              <tr className={styles.rowTp}>
                <td>Participants</td>
                {monthlyMatrix.map((m) => (
                  <td key={m.month}>{m.tp}</td>
                ))}
                <td><strong>{totalTP}</strong></td>
              </tr>
              <tr className={styles.rowTh}>
                <td>Training Hours</td>
                {monthlyMatrix.map((m) => (
                  <td key={m.month}>{m.th}</td>
                ))}
                <td><strong>{totalTH} hrs</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 3 Bar Charts */}
        <div className={styles.chartGrid}>
          <div className={styles.chartCard}>
            <div className={styles.chartTitle}>Training Class per Bulan</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyMatrix}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Bar dataKey="tc" fill={METRIC_TC} radius={[4, 4, 0, 0]} name="Classes" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.chartCard}>
            <div className={styles.chartTitle}>Participants per Bulan</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyMatrix}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Bar dataKey="tp" fill={METRIC_TP} radius={[4, 4, 0, 0]} name="Participants" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.chartCard}>
            <div className={styles.chartTitle}>Hours of Training per Bulan</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyMatrix}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Bar dataKey="th" fill={METRIC_TH} radius={[4, 4, 0, 0]} name="Hours" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table 2: MoM Growth Comparison */}
        <div className={styles.tableWrap}>
          <table className={`${styles.table} ${styles.tableMetric} ${styles.tableCompact}`}>
            <thead>
              <tr>
                <th className={styles.colRegionTitle}>MoM Growth</th>
                {MONTHS.map((m) => (
                  <th key={m} className={styles.colMonthCell}>{m.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className={styles.rowTc}>
                <td>Training Class</td>
                {momMatrix.map((m) => (
                  <td key={m.month}>{m.tcGrowth}</td>
                ))}
              </tr>
              <tr className={styles.rowTp}>
                <td>Participants</td>
                {momMatrix.map((m) => (
                  <td key={m.month}>{m.tpGrowth}</td>
                ))}
              </tr>
              <tr className={styles.rowTh}>
                <td>Training Hours</td>
                {momMatrix.map((m) => (
                  <td key={m.month}>{m.thGrowth}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
