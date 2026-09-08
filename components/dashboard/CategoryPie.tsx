'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import styles from './dashboard.module.css';

interface CategoryPieProps {
  internalCount: number;
  externalCount: number;
}

const COLORS = {
  internal: '#D84315',
  external: '#F57C00',
};

export default function CategoryPie({ internalCount, externalCount }: CategoryPieProps) {
  const data = [
    { name: 'Internal', value: internalCount },
    { name: 'Eksternal', value: externalCount },
  ];

  const hasData = internalCount + externalCount > 0;

  return (
    <section className={`${styles.card} ${styles.pieWrap}`}>
      <div className={styles.pieChart}>
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={85}
                paddingAngle={0}
              >
                <Cell fill={COLORS.internal} />
                <Cell fill={COLORS.external} />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className={styles.pieEmpty}>Tidak ada data</div>
        )}
      </div>
      <div className={styles.pieLegend}>
        <div className={styles.pieLegendItem}>
          <span className={`${styles.pieDot} ${styles.pieDotInternal}`} />
          Internal: {internalCount}
        </div>
        <div className={styles.pieLegendItem}>
          <span className={`${styles.pieDot} ${styles.pieDotExternal}`} />
          Eksternal: {externalCount}
        </div>
      </div>
    </section>
  );
}
