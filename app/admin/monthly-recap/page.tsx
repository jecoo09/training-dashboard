'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import writeXlsxFile from 'write-excel-file/browser';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import { useToast } from '@/components/ui/ToastProvider';
import {
  MONTHS,
  REGION_LIST,
  PROGRAM_LIST_FULL,
  TRAINER_TARGET_LIST,
  calcPercentage,
  matchesMonth,
  matchesRegion,
  matchesProgram,
  type User,
  type TrainingRow,
} from '@/lib/dashboard';
import layoutStyles from '@/components/layout/layout.module.css';
import dashStyles from '@/components/dashboard/dashboard.module.css';

type ColumnKey =
  | 'no'
  | 'tanggalPelaksanaan'
  | 'wilayah'
  | 'namaTraining'
  | 'programTraining'
  | 'jenisTraining'
  | 'trainingHours'
  | 'participant'
  | 'totalTHours'
  | 'namaTrainer';

type TrainerSummary = {
  name: string;
  location: string;
  sessions: number;
  hours: number;
};

const columns: Array<{ key: ColumnKey; label: string }> = [
  { key: 'tanggalPelaksanaan', label: 'Tanggal Pelaksanaan' },
  { key: 'wilayah', label: 'Wilayah' },
  { key: 'namaTraining', label: 'Nama Training' },
  { key: 'programTraining', label: 'Program Training' },
  { key: 'jenisTraining', label: 'Jenis Training' },
  { key: 'trainingHours', label: 'Training Hours' },
  { key: 'participant', label: 'Jumlah Peserta' },
  { key: 'totalTHours', label: 'Total Training Hours' },
  { key: 'namaTrainer', label: 'Nama Trainer' },
];

function displayValue(item: TrainingRow, key: ColumnKey): string {
  const value = item[key];
  return value === '' || value === null || value === undefined ? '-' : String(value);
}

export default function MonthlyRecapPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [rawData, setRawData] = useState<TrainingRow[]>([]);
  const [trainerMasterData, setTrainerMasterData] = useState<Array<{ fullName: string; locGroup: string }>>([]);

  // Filter States
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedProgram, setSelectedProgram] = useState<string>('All');
  const [openColumn, setOpenColumn] = useState<ColumnKey | null>(null);
  const [columnFilters, setColumnFilters] = useState<Partial<Record<ColumnKey, string>>>({});
  const [sortConfig, setSortConfig] = useState<{ key: ColumnKey | null; direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc',
  });
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'recap' | 'trainer'>('recap');

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
          setTrainerMasterData(analyticsData.trainerMaster || []);
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
    setColumnFilters({});
    setSortConfig({ key: null, direction: 'asc' });
    setOpenColumn(null);
  };

  const handleSort = (key: ColumnKey, direction: 'asc' | 'desc') => {
    setSortConfig({ key, direction });
    setOpenColumn(null);
  };

  const exportToExcel = async (table: 'recap' | 'trainer') => {
    try {
      const dateSuffix = new Date().toISOString().slice(0, 10);

      if (table === 'recap') {
        const exportRows = sortedData.map((item, index) => ({ item, index }));
        const workbook = writeXlsxFile(exportRows, {
          columns: [
            { header: 'No', width: 6, cell: ({ index }: { index: number }) => index + 1 },
            ...columns.map(({ key, label }) => ({
              header: label,
              width: key === 'namaTraining' || key === 'programTraining' || key === 'namaTrainer' ? 28 : 18,
              cell: ({ item }: { item: TrainingRow }) => displayValue(item, key),
            })),
          ],
          sheet: 'Monthly Recap',
          orientation: 'landscape',
        });
        await workbook.toFile(`monthly-recap-${dateSuffix}.xlsx`);
      } else {
        const totalTrainerSessions = trainerData.reduce((sum, trainer) => sum + trainer.sessions, 0);
        const totalTrainerHours = trainerData.reduce((sum, trainer) => sum + trainer.hours, 0);
        const exportRows = [
          ...trainerData,
          {
            name: 'TOTAL AKUMULASI',
            location: '',
            sessions: totalTrainerSessions,
            hours: totalTrainerHours,
          },
        ].map((item, index) => ({ item, index }));
        const workbook = writeXlsxFile(exportRows, {
          columns: [
            {
              header: 'No',
              width: 6,
              cell: ({ index }: { index: number }) => (index < trainerData.length ? index + 1 : ''),
            },
            { header: 'Nama Trainer', width: 32, cell: ({ item }: { item: TrainerSummary }) => item.name },
            { header: 'Wilayah Kerja', width: 18, cell: ({ item }: { item: TrainerSummary }) => item.location },
            { header: 'Total Sesi', width: 14, cell: ({ item }: { item: TrainerSummary }) => item.sessions },
            { header: 'Total Training Hours', width: 22, cell: ({ item }: { item: TrainerSummary }) => item.hours },
          ],
          sheet: 'Trainer Analytics',
          orientation: 'landscape',
        });
        await workbook.toFile(`trainer-analytics-${dateSuffix}.xlsx`);
      }

      setExportMenuOpen(false);
    } catch (error) {
      console.error(`Error exporting ${table === 'recap' ? 'Monthly Recap' : 'Trainer Analytics'}:`, error);
      toast('Gagal mengekspor file Excel', 'error');
    }
  };

  const getFilterOptions = (key: ColumnKey) =>
    Array.from(new Set(rawData.map((item) => displayValue(item, key)))).sort((a, b) =>
      a.localeCompare(b, 'id', { numeric: true, sensitivity: 'base' })
    );

  const renderSortIndicator = (key: ColumnKey) => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'asc' ? '▲' : '▼';
  };

  const filteredData = rawData.filter(
    (item) =>
      matchesMonth(item, selectedMonth) &&
      matchesRegion(item, selectedRegion) &&
      matchesProgram(item, selectedProgram) &&
      (!columnFilters.no || displayValue(item, 'no') === columnFilters.no) &&
      columns.every(({ key }) => {
        const selectedValue = columnFilters[key];
        return !selectedValue || displayValue(item, key) === selectedValue;
      })
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const valueA = a[sortConfig.key];
    const valueB = b[sortConfig.key];
    const result =
      typeof valueA === 'number' && typeof valueB === 'number'
        ? valueA - valueB
        : String(valueA).localeCompare(String(valueB), 'id', { numeric: true, sensitivity: 'base' });
    return sortConfig.direction === 'asc' ? result : -result;
  });

  const trainerLocMap = new Map<string, string>();
  trainerMasterData.forEach((trainer) => {
    trainerLocMap.set(trainer.fullName.trim().toUpperCase(), trainer.locGroup);
  });

  const trainerData: TrainerSummary[] = TRAINER_TARGET_LIST.map((trainerName) => {
    const location = trainerLocMap.get(trainerName.toUpperCase()) || '-';
    const trainerRows = filteredData.filter((item) => {
      const names = item.namaTrainer.split(',').map((name) => name.trim().toUpperCase());
      return names.includes(trainerName.toUpperCase()) &&
        (selectedRegion === 'All' || location.toUpperCase() === selectedRegion.toUpperCase());
    });

    return {
      name: trainerName,
      location,
      sessions: trainerRows.length,
      hours: trainerRows.reduce((sum, item) => sum + item.totalTHours, 0),
    };
  }).filter((trainer) => trainer.sessions > 0 || trainer.hours > 0);

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

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" className={dashStyles.resetButton} onClick={handleResetFilter}>
                    Reset Filter
                  </button>
                  <div style={{ position: 'relative' }}>
                    <button
                      type="button"
                      className={dashStyles.resetButton}
                      onClick={() => setExportMenuOpen((current) => !current)}
                      aria-expanded={exportMenuOpen}
                    >
                      Export Excel
                    </button>
                    {exportMenuOpen && (
                      <div
                        className={dashStyles.filterPopover}
                        style={{ right: 0, left: 'auto', minWidth: '190px' }}
                        role="menu"
                      >
                        <button
                          type="button"
                          className={dashStyles.popoverSortBtn}
                          onClick={() => exportToExcel('recap')}
                          role="menuitem"
                        >
                          Tabel Monthly Recap
                        </button>
                        <button
                          type="button"
                          className={dashStyles.popoverSortBtn}
                          onClick={() => exportToExcel('trainer')}
                          role="menuitem"
                        >
                          Tabel Trainer Analytics
                        </button>
                      </div>
                    )}
                  </div>
                </div>
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

            <section className={dashStyles.card}>
              <div className={dashStyles.cardHeader} style={{ justifyContent: 'flex-start', marginBottom: '12px' }}>
                <div
                  role="tablist"
                  aria-label="Pilihan tabel Monthly Recap"
                  style={{ display: 'flex', gap: '4px' }}
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'recap'}
                    className={activeTab === 'recap' ? dashStyles.resetButton : dashStyles.select}
                    style={{ minHeight: '32px', padding: '0 12px', fontSize: '12px' }}
                    onClick={() => setActiveTab('recap')}
                  >
                    Monthly Recap
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'trainer'}
                    className={activeTab === 'trainer' ? dashStyles.resetButton : dashStyles.select}
                    style={{ minHeight: '32px', padding: '0 12px', fontSize: '12px' }}
                    onClick={() => setActiveTab('trainer')}
                  >
                    Trainer Analytics
                  </button>
                </div>
              </div>

              {activeTab === 'trainer' && (
              <div className={dashStyles.tableWrap}>
                <table className={`${dashStyles.table} ${dashStyles.tableCompact}`}>
                  <thead>
                    <tr>
                      <th className={dashStyles.colNo}>No</th>
                      <th>Nama Trainer</th>
                      <th>Wilayah Kerja</th>
                      <th>Total Sesi</th>
                      <th>Total Training Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainerData.length > 0 ? (
                      trainerData.map((trainer, index) => (
                        <tr key={trainer.name}>
                          <td className={dashStyles.colNo}>{index + 1}</td>
                          <td>{trainer.name}</td>
                          <td>{trainer.location}</td>
                          <td style={{ textAlign: 'center' }}>{trainer.sessions} Sesi</td>
                          <td style={{ textAlign: 'center' }}><strong>{trainer.hours} Jam</strong></td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                          Tidak ada data trainer untuk filter yang dipilih.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3}>TOTAL AKUMULASI</td>
                      <td style={{ textAlign: 'center' }}>
                        <strong>{trainerData.reduce((sum, trainer) => sum + trainer.sessions, 0)} Sesi</strong>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <strong>{trainerData.reduce((sum, trainer) => sum + trainer.hours, 0)} Jam</strong>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              )}

            {/* Responsive Spreadsheet Data Table */}
            {activeTab === 'recap' && (
              <div className={dashStyles.tableWrap}>
                <table className={`${dashStyles.table} ${dashStyles.tableCompact}`} style={{ tableLayout: 'fixed', width: '100%' }}>
                  <colgroup>
                    <col style={{ width: '4%' }} />
                    <col style={{ width: '11%' }} />
                    <col style={{ width: '7%' }} />
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '14%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '8%' }} />
                    <col style={{ width: '8%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '13%' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th
                        className={`${dashStyles.colNo} ${dashStyles.tableIndexHeader} ${dashStyles.thFilterable} ${openColumn === 'no' || columnFilters.no ? dashStyles.thFilterableActive : ''}`}
                      >
                        <button
                          type="button"
                          className={dashStyles.thHeaderBtn}
                          onClick={() => setOpenColumn(openColumn === 'no' ? null : 'no')}
                        >
                          <span>No <small>{renderSortIndicator('no')}</small></span>
                        </button>
                        {openColumn === 'no' && (
                          <div className={dashStyles.filterPopover} onClick={(event) => event.stopPropagation()}>
                            <div className={dashStyles.popoverSortGroup}>
                              <button type="button" className={dashStyles.popoverSortBtn} onClick={() => handleSort('no', 'asc')}>
                                ▲ Urutkan ascending
                              </button>
                              <button type="button" className={dashStyles.popoverSortBtn} onClick={() => handleSort('no', 'desc')}>
                                ▼ Urutkan descending
                              </button>
                            </div>
                            <select
                              className={dashStyles.popoverSearchInput}
                              value={columnFilters.no || ''}
                              onChange={(event) =>
                                setColumnFilters((current) => ({ ...current, no: event.target.value || undefined }))
                              }
                            >
                              <option value="">Semua nomor</option>
                              {getFilterOptions('no').map((value) => (
                                <option key={value} value={value}>{value}</option>
                              ))}
                            </select>
                            <div className={dashStyles.popoverFooter}>
                              <button
                                type="button"
                                className={dashStyles.popoverClearBtn}
                                onClick={() => setColumnFilters((current) => ({ ...current, no: undefined }))}
                              >
                                Hapus filter
                              </button>
                              <button type="button" className={dashStyles.popoverClearBtn} onClick={() => setOpenColumn(null)}>
                                Selesai
                              </button>
                            </div>
                          </div>
                        )}
                      </th>
                      {columns.map(({ key, label }) => (
                        <th
                      key={key}
                      className={`${dashStyles.thFilterable} ${openColumn === key || columnFilters[key] ? dashStyles.thFilterableActive : ''}`}
                        >
                      <button
                        type="button"
                        className={dashStyles.thHeaderBtn}
                        onClick={() => setOpenColumn(openColumn === key ? null : key)}
                      >
                        <span>{label} <small>{renderSortIndicator(key)}</small></span>
                      </button>
                      {openColumn === key && (
                        <div className={dashStyles.filterPopover} onClick={(event) => event.stopPropagation()}>
                          <div className={dashStyles.popoverSortGroup}>
                            <button type="button" className={dashStyles.popoverSortBtn} onClick={() => handleSort(key, 'asc')}>
                              ▲ Urutkan ascending
                            </button>
                            <button type="button" className={dashStyles.popoverSortBtn} onClick={() => handleSort(key, 'desc')}>
                              ▼ Urutkan descending
                            </button>
                          </div>
                          <select
                            className={dashStyles.popoverSearchInput}
                            value={columnFilters[key] || ''}
                            onChange={(event) =>
                              setColumnFilters((current) => ({ ...current, [key]: event.target.value || undefined }))
                            }
                          >
                            <option value="">Semua nilai</option>
                            {getFilterOptions(key).map((value) => (
                              <option key={value} value={value}>{value}</option>
                            ))}
                          </select>
                          <div className={dashStyles.popoverFooter}>
                            <button
                              type="button"
                              className={dashStyles.popoverClearBtn}
                              onClick={() => setColumnFilters((current) => ({ ...current, [key]: undefined }))}
                            >
                              Hapus filter
                            </button>
                            <button type="button" className={dashStyles.popoverClearBtn} onClick={() => setOpenColumn(null)}>
                              Selesai
                            </button>
                          </div>
                        </div>
                      )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedData.length > 0 ? (
                      sortedData.map((item, idx) => (
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
            )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
