'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import { useToast } from '@/components/ui/ToastProvider';
import {
  MONTHS,
  REGION_LIST,
  PROGRAM_LIST_FULL,
  calcPercentage,
  matchesMonth,
  matchesRegion,
  matchesProgram,
  type User,
  type TrainingRow,
} from '@/lib/dashboard';
import layoutStyles from '@/components/layout/layout.module.css';
import dashStyles from '@/components/dashboard/dashboard.module.css';

export default function MonthlyRecapPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [rawData, setRawData] = useState<TrainingRow[]>([]);

  // Filter States
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedProgram, setSelectedProgram] = useState<string>('All');

  useEffect(() => {
    async function init() {
      try {
        const sessionRes = await fetch('/api/auth/session');
        if (!sessionRes.ok) {
          router.replace('/login');
          return;
        }

        const session = await sessionRes.json();
        if (session.user?.role !== 'admin') {
          router.replace('/login');
          return;
        }

        setUser(session.user);

        const analyticsRes = await fetch('/api/analytics');
        const analyticsData = await analyticsRes.json();
        if (analyticsData.success) {
          setRawData(analyticsData.rawData || []);
        } else {
          toast(analyticsData.error || 'Gagal memuat data Monthly Recap', 'error');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        toast('Gagal memuat data', 'error');
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [router, toast]);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
  }

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

  const totalSessions = filteredData.length;
  const totalParticipants = filteredData.reduce((sum, item) => sum + item.participant, 0);
  const totalHours = filteredData.reduce((sum, item) => sum + item.totalTHours, 0);

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

  if (loading) {
    return <LoadingOverlay />;
  }

  if (!user) {
    return (
      <div className={layoutStyles.error} data-theme="admin">
        Gagal memuat data pengguna.
      </div>
    );
  }

  return (
    <main className={layoutStyles.shell} data-theme="admin">
      <Sidebar user={user} />

      <div className={layoutStyles.main}>
        <Header title="Monthly Recap" onLogout={logout} />

        <div className={layoutStyles.body}>
          <div className={layoutStyles.content}>
            {/* Filtered Section taking full top area */}
            <section className={dashStyles.card} style={{ marginBottom: '16px' }}>
              <div className={dashStyles.cardHeader} style={{ marginBottom: '12px' }}>
                <h3 className={dashStyles.cardTitle}>Filter Monthly Recap</h3>
              </div>

              <div className={dashStyles.filterBar}>
                <select
                  className={dashStyles.select}
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  <option value="All">Semua Bulan</option>
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>

                <select
                  className={dashStyles.select}
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                >
                  <option value="All">Semua Wilayah</option>
                  {REGION_LIST.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>

                <select
                  className={dashStyles.select}
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                >
                  <option value="All">Semua Program Training</option>
                  {PROGRAM_LIST_FULL.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>

                <button
                  type="button"
                  className={dashStyles.resetButton}
                  onClick={handleResetFilter}
                >
                  Reset Filter
                </button>
              </div>

              <div className={dashStyles.filteredGrid}>
                <div className={dashStyles.filteredItem}>
                  <div className={dashStyles.kpiLabel}>Total Sesi</div>
                  <div className={dashStyles.kpiValue}>{totalSessions}</div>
                  <div className={dashStyles.momHint}>
                    {hasPrevMonth ? `vs Last Month: ${calcPercentage(totalSessions, prevMonthSessions)}` : '\u00A0'}
                  </div>
                </div>

                <div className={dashStyles.filteredItem}>
                  <div className={dashStyles.kpiLabel}>Total Peserta</div>
                  <div className={dashStyles.kpiValue}>{totalParticipants}</div>
                  <div className={dashStyles.momHint}>
                    {hasPrevMonth ? `vs Last Month: ${calcPercentage(totalParticipants, prevMonthParticipants)}` : '\u00A0'}
                  </div>
                </div>

                <div className={dashStyles.filteredItem}>
                  <div className={dashStyles.kpiLabel}>Total Jam Training</div>
                  <div className={dashStyles.kpiValue}>{totalHours}</div>
                  <div className={dashStyles.momHint}>
                    {hasPrevMonth ? `vs Last Month: ${calcPercentage(totalHours, prevMonthHours)}` : '\u00A0'}
                  </div>
                </div>
              </div>
            </section>

            {/* Responsive Spreadsheet Data Table */}
            <section className={dashStyles.card}>
              <div className={dashStyles.tableWrap}>
                <table className={`${dashStyles.table} ${dashStyles.tableCompact}`}>
                  <thead>
                    <tr>
                      <th className={dashStyles.colNo}>No</th>
                      <th style={{ minWidth: '120px' }}>Tanggal Pelaksanaan</th>
                      <th style={{ minWidth: '90px' }}>Wilayah</th>
                      <th style={{ minWidth: '180px' }}>Nama Training</th>
                      <th style={{ minWidth: '180px' }}>Program Training</th>
                      <th style={{ minWidth: '120px' }}>Jenis Training</th>
                      <th style={{ minWidth: '100px' }}>Training Hours</th>
                      <th style={{ minWidth: '100px' }}>Jumlah Peserta</th>
                      <th style={{ minWidth: '120px' }}>Total Training Hours</th>
                      <th style={{ minWidth: '180px' }}>Nama Trainer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length > 0 ? (
                      filteredData.map((item, idx) => (
                        <tr key={`${item.no}-${idx}`}>
                          <td className={dashStyles.colNo}>{idx + 1}</td>
                          <td>{item.tanggalPelaksanaan || '-'}</td>
                          <td style={{ textAlign: 'center' }}>{item.wilayah || '-'}</td>
                          <td>{item.namaTraining || '-'}</td>
                          <td>{item.programTraining || '-'}</td>
                          <td style={{ textAlign: 'center' }}>{item.jenisTraining || '-'}</td>
                          <td style={{ textAlign: 'center' }}>{item.trainingHours}</td>
                          <td style={{ textAlign: 'center' }}>{item.participant}</td>
                          <td style={{ textAlign: 'center' }}><strong>{item.totalTHours}</strong></td>
                          <td>{item.namaTrainer || '-'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={10} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                          Tidak ada data training yang sesuai dengan filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
