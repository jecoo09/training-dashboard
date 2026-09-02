'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface TrainingRow {
  no: number;
  tanggalPelaksanaan: string;
  bulan: string;
  wilayah: string;
  namaTraining: string;
  programTraining: string;
  jenisTraining: string;
  trainingHours: number;
  participant: number;
  totalTHours: number;
  namaTrainer: string;
}

interface AnalyticsData {
  kpi: {
    totalSessions: number;
    totalParticipants: number;
    totalHours: number;
    internalCount: number;
    externalCount: number;
  };
  rawData: TrainingRow[];
}

const REGION_LIST = [
  'HO', 'SANSBR', 'SBB', 'JKTBTN', 'JBR', 'JTH', 'JTR', 'BNA', 
  'KSI', 'DSG', 'PLB', 'CKG', 'CBT', 'UGN', 'MJO', 'GYR', 
  'PURB', 'PDA', 'STL', 'SLAWI'
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const SPECIFIC_PROGRAMS = [
  'SCC',
  'SSDP',
  'SALESMANSHIP CORE COMPETENCE',
  'SALESMANSHIP CORE COMPETENCE 2',
  'TEA CERTIFICATION'
];

const PROGRAM_LIST_FULL = [...SPECIFIC_PROGRAMS, 'TRAINING LAINNYA'];

const TRAINER_TARGET_LIST = [
  'JEKSON EDWARD PARDAMEAN SITOMPUL',
  'SATYA WIRATAMAS PRIYANGGA',
  'ANDRI RAHDRIAN',
  'ANDRIANA',
  'AMADEUS DIMAS ANGGITA WINARDI',
  'RONALD VINCENTIUS',
  'ENDRICO RAYMOND TANUJAYA',
  'ANASTASIA LAURA KRISTIANTO TAUFICK',
  'CINDY CAROLINE',
  'ILA TARLADI',
  'BEBEN MEKANIK MULYADI',
  'SUPARDIKA IGM NGURAH',
  'DODDY IRAWAN',
  'HERJUNO WIKANDARU',
  'IMRON HADI',
  'MUHAMMAD KOSASIH ARDIANTO AMD',
  'RAHMAT',
  'TEDDY RAMADHAN',
  'KHAERUL ANAM',
  'JULIAN DWI SETIAWAN',
  'ARIS RACHMAN HAKIM',
  'HARDI WIJAYA',
  'DIAN SYAHPUTRA',
  'ARIO KAMANDANU DWI PUTRA',
  'CASKAWI',
  'DJAENUDIN'
];

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<{ fullName: string; nik: string; locGroup: string | null; role: string } | null>(null);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  // State Filter Bagian 3
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedProgram, setSelectedProgram] = useState<string>('All');

  // State Slider Bagian 6
  const [b6Metric, setB6Metric] = useState<'TC' | 'TP' | 'TH'>('TC');

  // State Combined Slider Bagian 8-10
  const [progDimension, setProgDimension] = useState<'MONTH' | 'REGION'>('MONTH');
  const [progMetric, setProgMetric] = useState<'SESSIONS' | 'HOURS'>('SESSIONS');

  // State Filter khusus Data Trainer (Bagian 11)
  const [trainerFilterMonth, setTrainerFilterMonth] = useState<string>('All');
  const [trainerFilterProgram, setTrainerFilterProgram] = useState<string>('All');

  useEffect(() => {
    async function fetchData() {
      try {
        const sessionResponse = await fetch('/api/auth/session');
        if (!sessionResponse.ok) {
          window.location.href = '/login';
          return;
        }

        const session = await sessionResponse.json();
        if (session.user?.role !== 'admin') {
          window.location.href = '/login';
          return;
        }

        setUser(session.user);

        const response = await fetch('/api/analytics');
        const result = await response.json();
        if (result.success) {
          setData(result);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleResetFilter = () => {
    setSelectedMonth('All');
    setSelectedRegion('All');
    setSelectedProgram('All');
  };

  if (loading) {
    return <div className={styles.loading}>Memuat Data DASHBOARD TND 2026...</div>;
  }

  if (!data) {
    return <div className={styles.loading}>Gagal memuat data dashboard.</div>;
  }

  const getProgramCategory = (rawProg: string) => {
    const trimmed = rawProg.trim().toUpperCase();
    if (SPECIFIC_PROGRAMS.includes(trimmed)) {
      return trimmed;
    }
    return 'TRAINING LAINNYA';
  };

  // --- LOGIKA BAGIAN 3 ---
  const filteredData = data.rawData.filter((item) => {
    const matchMonth =
      selectedMonth === 'All' ||
      item.bulan.toLowerCase().includes(selectedMonth.toLowerCase()) ||
      item.tanggalPelaksanaan.toLowerCase().includes(selectedMonth.toLowerCase());

    const matchRegion =
      selectedRegion === 'All' ||
      item.wilayah.trim().toUpperCase() === selectedRegion.toUpperCase();

    const itemCategory = getProgramCategory(item.programTraining);
    const matchProgram =
      selectedProgram === 'All' ||
      itemCategory.toUpperCase() === selectedProgram.toUpperCase();

    return matchMonth && matchRegion && matchProgram;
  });

  const section3Sessions = filteredData.length;
  const section3Participants = filteredData.reduce((sum, item) => sum + item.participant, 0);
  const section3Hours = filteredData.reduce((sum, item) => sum + item.totalTHours, 0);

  // Perhitungan Komparasi vs Last Month
  let prevMonthSessions = 0;
  let prevMonthParticipants = 0;
  let prevMonthHours = 0;
  let hasPrevMonth = false;

  if (selectedMonth !== 'All') {
    const monthIdx = MONTHS.indexOf(selectedMonth);
    if (monthIdx > 0) {
      hasPrevMonth = true;
      const prevMonthName = MONTHS[monthIdx - 1];
      const prevFiltered = data.rawData.filter((item) => {
        const matchMonth =
          item.bulan.toLowerCase().includes(prevMonthName.toLowerCase()) ||
          item.tanggalPelaksanaan.toLowerCase().includes(prevMonthName.toLowerCase());
        const matchRegion =
          selectedRegion === 'All' ||
          item.wilayah.trim().toUpperCase() === selectedRegion.toUpperCase();
        const itemCategory = getProgramCategory(item.programTraining);
        const matchProgram =
          selectedProgram === 'All' ||
          itemCategory.toUpperCase() === selectedProgram.toUpperCase();
        return matchMonth && matchRegion && matchProgram;
      });

      prevMonthSessions = prevFiltered.length;
      prevMonthParticipants = prevFiltered.reduce((sum, item) => sum + item.participant, 0);
      prevMonthHours = prevFiltered.reduce((sum, item) => sum + item.totalTHours, 0);
    }
  }

  const calcPercentage = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? '+100%' : '0%';
    const diff = ((curr - prev) / prev) * 100;
    return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`;
  };

  // --- LOGIKA BAGIAN 4 & 5 ---
  const monthlyMatrix = MONTHS.map((m) => {
    const mRows = data.rawData.filter(
      (item) =>
        item.bulan.toLowerCase().includes(m.toLowerCase()) ||
        item.tanggalPelaksanaan.toLowerCase().includes(m.toLowerCase())
    );
    return {
      month: m,
      tc: mRows.length,
      tp: mRows.reduce((sum, i) => sum + i.participant, 0),
      th: mRows.reduce((sum, i) => sum + i.totalTHours, 0),
    };
  });

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

  // --- LOGIKA BAGIAN 6 ---
  const regionMatrix = REGION_LIST.map((region, idx) => {
    const monthsData = MONTHS.map((m) => {
      const match = data.rawData.filter(
        (i) =>
          i.wilayah.trim().toUpperCase() === region.toUpperCase() &&
          (i.bulan.toLowerCase().includes(m.toLowerCase()) ||
            i.tanggalPelaksanaan.toLowerCase().includes(m.toLowerCase()))
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

  // --- LOGIKA COMBINED BAGIAN 8-10 ---
  const combinedProgramData = PROGRAM_LIST_FULL.map((progCategory) => {
    if (progDimension === 'MONTH') {
      const columns = MONTHS.map((m) => {
        const match = data.rawData.filter(
          (i) =>
            getProgramCategory(i.programTraining) === progCategory &&
            (i.bulan.toLowerCase().includes(m.toLowerCase()) ||
              i.tanggalPelaksanaan.toLowerCase().includes(m.toLowerCase()))
        );
        return progMetric === 'SESSIONS'
          ? match.length
          : match.reduce((sum, r) => sum + r.totalTHours, 0);
      });
      const rowTotal = columns.reduce((sum, val) => sum + val, 0);
      return { program: progCategory, columns, rowTotal };
    } else {
      const columns = REGION_LIST.map((reg) => {
        const match = data.rawData.filter(
          (i) =>
            getProgramCategory(i.programTraining) === progCategory &&
            i.wilayah.trim().toUpperCase() === reg.toUpperCase()
        );
        return progMetric === 'SESSIONS'
          ? match.length
          : match.reduce((sum, r) => sum + r.totalTHours, 0);
      });
      const rowTotal = columns.reduce((sum, val) => sum + val, 0);
      return { program: progCategory, columns, rowTotal };
    }
  });

  // --- LOGIKA BAGIAN 11 (Dengan Filter Bulan & Program Training) ---
  const trainerSummaryList = TRAINER_TARGET_LIST.map((targetName) => {
    let totalHours = 0;
    let totalSessions = 0;

    data.rawData.forEach((item) => {
      const matchMonth =
        trainerFilterMonth === 'All' ||
        item.bulan.toLowerCase().includes(trainerFilterMonth.toLowerCase()) ||
        item.tanggalPelaksanaan.toLowerCase().includes(trainerFilterMonth.toLowerCase());

      const itemCategory = getProgramCategory(item.programTraining);
      const matchProgram =
        trainerFilterProgram === 'All' ||
        itemCategory.toUpperCase() === trainerFilterProgram.toUpperCase();

      if (matchMonth && matchProgram) {
        const rawTrainerStr = item.namaTrainer || '';
        const namesInRow = rawTrainerStr.split(',').map((n) => n.trim().toUpperCase());
        if (namesInRow.includes(targetName.toUpperCase())) {
          totalHours += item.totalTHours;
          totalSessions += 1;
        }
      }
    });

    return {
      name: targetName,
      hours: totalHours,
      sessions: totalSessions,
    };
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>DASHBOARD TND 2026</h1>
          {user && <p className={styles.userMeta}>Admin: {user.fullName}</p>}
        </div>
        <button type="button" onClick={logout} className={styles.logoutButton}>Logout</button>
      </header>

      {/* BAGIAN 2: Total Akumulasi Overall */}
      <section className={styles.sectionCard}>
        <div className={styles.sectionTitle}>DATA TOTAL</div>
        <div className={styles.gridThree}>
          <div className={styles.metricBox}>
            <div className={styles.metricLabel}>Total Sesi</div>
            <div className={styles.metricValue}>{data.kpi.totalSessions}</div>
          </div>
          <div className={styles.metricBox}>
            <div className={styles.metricLabel}>Total Peserta</div>
            <div className={styles.metricValue}>{data.kpi.totalParticipants}</div>
          </div>
          <div className={styles.metricBox}>
            <div className={styles.metricLabel}>Total Training Hours</div>
            <div className={styles.metricValue}>{data.kpi.totalHours} hrs</div>
          </div>
        </div>
      </section>

      {/* BAGIAN 1: Kategori Training */}
      <section className={styles.sectionCard}>
        <div className={styles.sectionTitle}>KATEGORI TRAINING</div>
        <div className={styles.gridTwo}>
          <div className={styles.metricBox}>
            <div className={styles.metricLabel}>Training Internal</div>
            <div className={styles.metricValue}>{data.kpi.internalCount}</div>
          </div>
          <div className={styles.metricBox}>
            <div className={styles.metricLabel}>Training Eksternal</div>
            <div className={styles.metricValue}>{data.kpi.externalCount}</div>
          </div>
        </div>
      </section>

      {/* BAGIAN 3: Filter Bulan, Wilayah, & Program */}
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeaderWithTabs}>
          <div className={styles.sectionTitle}>
            FILTER PER BULAN, WILAYAH, & PROGRAM TRAINING
          </div>
          <button className={styles.btnResetTitle} onClick={handleResetFilter}>
            Reset Filter
          </button>
        </div>

        <div className={styles.filterRow}>
          <div className={styles.filterControl}>
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
          </div>

          <div className={styles.filterControl}>
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
          </div>

          <div className={styles.filterControl}>
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
          </div>
        </div>

        <div className={styles.gridThree}>
          <div className={styles.metricBox}>
            <div className={styles.metricLabel}>Total Sesi</div>
            <div className={styles.metricValue}>{section3Sessions}</div>
            {hasPrevMonth && (
              <div
                className={`${styles.metricComparison} ${
                  section3Sessions >= prevMonthSessions ? styles.trendUp : styles.trendDown
                }`}
              >
                vs Last Month: {calcPercentage(section3Sessions, prevMonthSessions)}
              </div>
            )}
          </div>

          <div className={styles.metricBox}>
            <div className={styles.metricLabel}>Total Peserta</div>
            <div className={styles.metricValue}>{section3Participants}</div>
            {hasPrevMonth && (
              <div
                className={`${styles.metricComparison} ${
                  section3Participants >= prevMonthParticipants ? styles.trendUp : styles.trendDown
                }`}
              >
                vs Last Month: {calcPercentage(section3Participants, prevMonthParticipants)}
              </div>
            )}
          </div>

          <div className={styles.metricBox}>
            <div className={styles.metricLabel}>Total Jam Training</div>
            <div className={styles.metricValue}>{section3Hours} hrs</div>
            {hasPrevMonth && (
              <div
                className={`${styles.metricComparison} ${
                  section3Hours >= prevMonthHours ? styles.trendUp : styles.trendDown
                }`}
              >
                vs Last Month: {calcPercentage(section3Hours, prevMonthHours)}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* BAGIAN 4: Rekapitulasi Bulanan & Grafik */}
      <section className={styles.sectionCard}>
        <div className={styles.sectionTitle}>REKAP BULANAN & GRAFIK</div>
        <div className={styles.tableWrapper}>
          <table className={`${styles.table} ${styles.tableFixed}`}>
            <thead>
              <tr className={styles.headerTableB4}>
                <th className={styles.alignLeft}>Indicators</th>
                {MONTHS.map((m) => (
                  <th key={m} className={styles.colDataMonth}>{m.toUpperCase()}</th>
                ))}
                <th className={styles.colTotal}>Jumlah</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={styles.alignLeft}>Training Class</td>
                {monthlyMatrix.map((m) => (
                  <td key={m.month}>{m.tc}</td>
                ))}
                <td><strong>{totalTC}</strong></td>
              </tr>
              <tr>
                <td className={styles.alignLeft}>Participants</td>
                {monthlyMatrix.map((m) => (
                  <td key={m.month}>{m.tp}</td>
                ))}
                <td><strong>{totalTP}</strong></td>
              </tr>
              <tr>
                <td className={styles.alignLeft}>Training Hours</td>
                {monthlyMatrix.map((m) => (
                  <td key={m.month}>{m.th}</td>
                ))}
                <td><strong>{totalTH} hrs</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={styles.chartsGrid}>
          <div className={styles.chartCard}>
            <div className={styles.chartTitle}>Training Class per Bulan</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyMatrix}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Bar dataKey="tc" fill="#2563eb" radius={[4, 4, 0, 0]} name="Classes" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.chartCard}>
            <div className={styles.chartTitle}>Participants per Bulan</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyMatrix}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Bar dataKey="tp" fill="#16a34a" radius={[4, 4, 0, 0]} name="Participants" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.chartCard}>
            <div className={styles.chartTitle}>Hours of Training per Bulan</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyMatrix}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Bar dataKey="th" fill="#d97706" radius={[4, 4, 0, 0]} name="Hours" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* BAGIAN 5: Perbandingan Pertumbuhan Bulanan (% MoM) */}
      <section className={styles.sectionCard}>
        <div className={styles.sectionTitle}>REKAP PERBANDINGAN BULANAN</div>
        <div className={styles.tableWrapper}>
          <table className={`${styles.table} ${styles.tableFixed}`}>
            <thead>
              <tr className={styles.headerTableB5}>
                <th className={styles.alignLeft}>Indicators</th>
                {MONTHS.map((m) => (
                  <th key={m} className={styles.colDataMonth}>{m.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={styles.alignLeft}>Training Class</td>
                {momMatrix.map((m) => (
                  <td key={m.month}>{m.tcGrowth}</td>
                ))}
              </tr>
              <tr>
                <td className={styles.alignLeft}>Participants</td>
                {momMatrix.map((m) => (
                  <td key={m.month}>{m.tpGrowth}</td>
                ))}
              </tr>
              <tr>
                <td className={styles.alignLeft}>Training Hours</td>
                {momMatrix.map((m) => (
                  <td key={m.month}>{m.thGrowth}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* BAGIAN 6: Detail Matrix per Wilayah Kerja */}
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeaderWithTabs}>
          <div className={styles.sectionTitle}>
            DETAIL REKAP DATA
          </div>
          <div className={styles.segmentedControl}>
            <div
              className={styles.sliderPill}
              style={{
                left: b6Metric === 'TC' ? '3px' : b6Metric === 'TP' ? '33.3%' : '66.6%',
                width: '33.3%',
              }}
            />
            <button
              className={`${styles.segmentedButton} ${b6Metric === 'TC' ? styles.segmentedButtonActive : ''}`}
              onClick={() => setB6Metric('TC')}
            >
              Training Class
            </button>
            <button
              className={`${styles.segmentedButton} ${b6Metric === 'TP' ? styles.segmentedButtonActive : ''}`}
              onClick={() => setB6Metric('TP')}
            >
              Participants
            </button>
            <button
              className={`${styles.segmentedButton} ${b6Metric === 'TH' ? styles.segmentedButtonActive : ''}`}
              onClick={() => setB6Metric('TH')}
            >
              Training Hours
            </button>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={`${styles.table} ${styles.tableFixed}`}>
            <thead>
              <tr>
                {/* NO & WILAYAH KERJA dibuat biru (headerOdd) */}
                <th className={`${styles.colNo} ${styles.headerOdd}`}>NO</th>
                <th className={`${styles.alignLeft} ${styles.colWilayah} ${styles.headerOdd}`}>WILAYAH KERJA</th>
                {MONTHS.map((m, mIdx) => (
                  <th key={m} className={`${styles.colDataMonth} ${mIdx % 2 === 0 ? styles.headerEven : styles.headerOdd}`}>
                    {m.toUpperCase()}
                  </th>
                ))}
                {/* Jumlah dibuat abu-abu (headerEven) */}
                <th className={`${styles.colTotal} ${styles.headerEven}`}>Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {regionMatrix.map((r) => {
                const rowTotalVal = r.monthsData.reduce((sum, item) => {
                  return sum + (b6Metric === 'TC' ? item.tc : b6Metric === 'TP' ? item.tp : item.th);
                }, 0);
                return (
                  <tr key={r.region}>
                    {/* Kolom NO & WILAYAH dibuat biru (monthOdd) */}
                    <td className={styles.monthOdd}>{r.no}</td>
                    <td className={`${styles.alignLeft} ${styles.monthOdd}`}>{r.region}</td>
                    {r.monthsData.map((md, mIdx) => (
                      <td key={mIdx} className={mIdx % 2 === 0 ? styles.monthEven : styles.monthOdd}>
                        {b6Metric === 'TC' ? md.tc : b6Metric === 'TP' ? md.tp : md.th}
                      </td>
                    ))}
                    {/* Kolom Jumlah dibuat abu-abu/putih (monthEven) */}
                    <td className={styles.monthEven}>
                      <strong>{rowTotalVal} {b6Metric === 'TH' ? 'hrs' : ''}</strong>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className={styles.totalRow}>
                <td colSpan={2} className={`${styles.alignLeft} ${styles.headerOdd}`}>TOTAL</td>
                {MONTHS.map((m, mIdx) => {
                  const sumVal = regionMatrix.reduce((acc, curr) => {
                    const item = curr.monthsData[mIdx];
                    return acc + (b6Metric === 'TC' ? item.tc : b6Metric === 'TP' ? item.tp : item.th);
                  }, 0);
                  return (
                    <td key={`total-b6-${m}`} className={mIdx % 2 === 0 ? styles.headerEven : styles.headerOdd}>
                      {sumVal}
                    </td>
                  );
                })}
                <td className={styles.headerEven}>
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

      {/* COMBINED BAGIAN 8-10: Analitik Program Training */}
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeaderWithTabs}>
          <div className={styles.sectionTitle}>
            ANALITIK PROGRAM TRAINING ({progDimension === 'MONTH' ? 'PER BULAN' : 'PER WILAYAH'} - {progMetric === 'SESSIONS' ? 'JUMLAH SESI' : 'TRAINING HOURS'})
          </div>
          <div className={styles.sliderWrapper}>
            <div className={styles.segmentedControl}>
              <div
                className={styles.sliderPill}
                style={{
                  left: progDimension === 'MONTH' ? '3px' : '50%',
                  width: '50%',
                }}
              />
              <button
                className={`${styles.segmentedButton} ${progDimension === 'MONTH' ? styles.segmentedButtonActive : ''}`}
                onClick={() => setProgDimension('MONTH')}
              >
                Bulan
              </button>
              <button
                className={`${styles.segmentedButton} ${progDimension === 'REGION' ? styles.segmentedButtonActive : ''}`}
                onClick={() => setProgDimension('REGION')}
              >
                Wilayah
              </button>
            </div>
            <div className={styles.segmentedControl}>
              <div
                className={styles.sliderPill}
                style={{
                  left: progMetric === 'SESSIONS' ? '3px' : '50%',
                  width: '50%',
                }}
              />
              <button
                className={`${styles.segmentedButton} ${progMetric === 'SESSIONS' ? styles.segmentedButtonActive : ''}`}
                onClick={() => setProgMetric('SESSIONS')}
              >
                Jumlah Sesi
              </button>
              <button
                className={`${styles.segmentedButton} ${progMetric === 'HOURS' ? styles.segmentedButtonActive : ''}`}
                onClick={() => setProgMetric('HOURS')}
              >
                Training Hours
              </button>
            </div>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={`${styles.table} ${styles.tableFixed}`}>
            <thead>
              <tr>
                {/* PROGRAM TRAINING dibuat biru (headerOdd) */}
                <th className={`${styles.alignLeft} ${styles.colProgram} ${styles.headerOdd}`}>PROGRAM TRAINING</th>
                {progDimension === 'MONTH'
                  ? MONTHS.map((m, idx) => (
                      <th key={m} className={`${styles.colDataMonth} ${idx % 2 === 0 ? styles.headerEven : styles.headerOdd}`}>
                        {m.toUpperCase()}
                      </th>
                    ))
                  : REGION_LIST.map((r, idx) => (
                      <th key={r} className={`${styles.colDataRegion} ${idx % 2 === 0 ? styles.headerEven : styles.headerOdd}`}>
                        {r}
                      </th>
                    ))
                }
                {/* Jumlah dibuat abu-abu (headerEven) */}
                <th className={`${styles.colTotal} ${styles.headerEven}`}>Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {combinedProgramData.map((p) => (
                <tr key={p.program}>
                  <td className={`${styles.alignLeft} ${styles.monthOdd}`}>{p.program}</td>
                  {p.columns.map((val, idx) => (
                    <td key={idx} className={idx % 2 === 0 ? styles.monthEven : styles.monthOdd}>
                      {val}
                    </td>
                  ))}
                  <td className={styles.monthEven}>
                    <strong>{p.rowTotal} {progMetric === 'HOURS' ? 'hrs' : ''}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className={styles.totalRow}>
                <td className={`${styles.alignLeft} ${styles.headerOdd}`}>TOTAL</td>
                {(progDimension === 'MONTH' ? MONTHS : REGION_LIST).map((_, colIdx) => {
                  const colTotal = combinedProgramData.reduce(
                    (acc, curr) => acc + curr.columns[colIdx], 0
                  );
                  return (
                    <td key={`total-comb-${colIdx}`} className={colIdx % 2 === 0 ? styles.headerEven : styles.headerOdd}>
                      {colTotal}
                    </td>
                  );
                })}
                <td className={styles.headerEven}>
                  {combinedProgramData.reduce((acc, curr) => acc + curr.rowTotal, 0)} {progMetric === 'HOURS' ? 'hrs' : ''}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* BAGIAN 11: Data Trainer (Dengan Filter Bulan & Program Training) */}
      <section className={styles.sectionCard}>
        <div className={styles.sectionTitle}>DATA TRAINER</div>

        {/* Filter Khusus Data Trainer */}
        <div className={styles.filterRow}>
          <div className={styles.filterControl}>
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
          </div>

          <div className={styles.filterControl}>
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
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.headerTableTrainer}>
                <th className={styles.colNo}>NO</th>
                <th className={styles.alignLeft}>NAMA TRAINER</th>
                <th>TOTAL SESI</th>
                <th>TOTAL TRAINING HOURS</th>
              </tr>
            </thead>
            <tbody>
              {trainerSummaryList.map((trainer, idx) => (
                <tr key={trainer.name}>
                  <td>{idx + 1}</td>
                  <td className={styles.alignLeft}>{trainer.name}</td>
                  <td>{trainer.sessions} Sesi</td>
                  <td><strong>{trainer.hours} Jam</strong></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className={styles.totalRow}>
                <td colSpan={2} className={styles.alignLeft}>TOTAL AKUMULASI</td>
                <td>
                  {trainerSummaryList.reduce((acc, curr) => acc + curr.sessions, 0)} Sesi
                </td>
                <td>
                  {trainerSummaryList.reduce((acc, curr) => acc + curr.hours, 0)} Jam
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}