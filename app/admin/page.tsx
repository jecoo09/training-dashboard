'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import KpiCards from '@/components/dashboard/KpiCards';
import CategoryPie from '@/components/dashboard/CategoryPie';
import FilterSection from '@/components/dashboard/FilterSection';
import MonthlyAnalytics, { MomComparison } from '@/components/dashboard/MonthlyAnalytics';
import RegionAnalytics from '@/components/dashboard/RegionAnalytics';
import ProgramAnalytics from '@/components/dashboard/ProgramAnalytics';
import TrainerAnalytics from '@/components/dashboard/TrainerAnalytics';
import Loader from '@/components/ui/Loader';
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
}

export default function DashboardPage() {
  const { toast } = useToast();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }

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
  }, [toast]);

  if (loading) {
    return (
      <div className={layoutStyles.loading} data-theme="admin">
        <Loader />
      </div>
    );
  }

  if (!data || !user) {
    return (
      <div className={layoutStyles.error} data-theme="admin">
        Gagal memuat data dashboard.
      </div>
    );
  }

  return (
    <div className={layoutStyles.shell} data-theme="admin">
      <Sidebar user={user} />

      <div className={layoutStyles.main}>
        <Header title="Training Dashboard" onLogout={logout} />

        <div className={layoutStyles.body}>
          <div className={layoutStyles.content}>
            <div className={dashStyles.container1}>
              <div className={dashStyles.container1Left}>
                <KpiCards
                  totalSessions={data.kpi.totalSessions}
                  totalParticipants={data.kpi.totalParticipants}
                  totalHours={data.kpi.totalHours}
                />
                <FilterSection rawData={data.rawData} />
              </div>
              <CategoryPie
                internalCount={data.kpi.internalCount}
                externalCount={data.kpi.externalCount}
              />
            </div>

            <MonthlyAnalytics rawData={data.rawData} />

            <ProgramAnalytics rawData={data.rawData} showDimensionToggle={true} />

            <RegionAnalytics rawData={data.rawData} />

            <TrainerAnalytics rawData={data.rawData} />
          </div>
        </div>
      </div>
    </div>
  );
}
