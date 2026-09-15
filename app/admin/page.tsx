'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import CategoryPie from '@/components/dashboard/CategoryPie';
import FilterSection from '@/components/dashboard/FilterSection';
import MonthlyAnalytics from '@/components/dashboard/MonthlyAnalytics';
import RegionAnalytics from '@/components/dashboard/RegionAnalytics';
import ProgramAnalytics from '@/components/dashboard/ProgramAnalytics';
import TrainerAnalytics from '@/components/dashboard/TrainerAnalytics';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import { useToast } from '@/components/ui/ToastProvider';
import type { User, TrainingRow } from '@/lib/dashboard';
import layoutStyles from '@/components/layout/layout.module.css';
import dashStyles from '@/components/dashboard/dashboard.module.css';

interface AnalyticsData {
  kpi: {
    totalSessions: number;
    totalParticipants: number;
    totalHours: number;
    internalCount: number;
    externalCount: number;
  };
  rawData: TrainingRow[];
  trainerMaster?: { fullName: string; locGroup: string }[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [filteredRows, setFilteredRows] = useState<TrainingRow[] | null>(null);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const sessionResponse = await fetch('/api/auth/session');
        if (!sessionResponse.ok) {
          router.replace('/login');
          return;
        }

        const session = await sessionResponse.json();
        if (session.user?.role !== 'admin') {
          router.replace('/login');
          return;
        }

        setUser(session.user);

        const response = await fetch('/api/analytics');
        const result = await response.json();
        if (result.success) {
          setData(result);
          setFilteredRows(result.rawData);
        } else {
          toast(result.error || 'Gagal memuat data dashboard', 'error');
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast('Tidak dapat memuat dashboard', 'error');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router, toast]);

  if (loading) {
    return <LoadingOverlay />;
  }

  if (!data || !user) {
    return (
      <div className={layoutStyles.error} data-theme="admin">
        Gagal memuat data dashboard.
      </div>
    );
  }

  const activeRows = filteredRows ?? data.rawData;
  const internalCount = activeRows.filter((item) =>
    item.jenisTraining?.toUpperCase().includes('INTERNAL')
  ).length;
  const externalCount = activeRows.filter((item) =>
    item.jenisTraining?.toUpperCase().includes('EKSTERNAL')
  ).length;

  return (
    <div className={layoutStyles.shell} data-theme="admin">
      <Sidebar user={user} />

      <div className={layoutStyles.main}>
        <Header title="Training Dashboard" onLogout={logout} />

        <div className={layoutStyles.body}>
          <div className={layoutStyles.content}>
            <div className={dashStyles.container1}>
              <FilterSection
                rawData={data.rawData}
                onFilteredDataChange={(rows) => setFilteredRows(rows)}
              />
              <CategoryPie
                internalCount={internalCount}
                externalCount={externalCount}
              />
            </div>

            <MonthlyAnalytics rawData={data.rawData} />

            <ProgramAnalytics rawData={data.rawData} showDimensionToggle={true} />

            <RegionAnalytics rawData={data.rawData} />

            <TrainerAnalytics rawData={data.rawData} trainerMasterData={data.trainerMaster} />
          </div>
        </div>
      </div>
    </div>
  );
}
