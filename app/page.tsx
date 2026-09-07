'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import KpiCards from '@/components/dashboard/KpiCards';
import CategoryPie from '@/components/dashboard/CategoryPie';
import FilterSection from '@/components/dashboard/FilterSection';
import MonthlyAnalytics, { MomComparison } from '@/components/dashboard/MonthlyAnalytics';
import ProgramAnalytics from '@/components/dashboard/ProgramAnalytics';
import Loader from '@/components/ui/Loader';
import { useToast } from '@/components/ui/ToastProvider';
import type { User, TrainingRow } from '@/lib/dashboard';
import layoutStyles from '@/components/layout/layout.module.css';
import dashStyles from '@/components/dashboard/dashboard.module.css';

interface TrainerAnalyticsData {
  success: boolean;
  rawData: TrainingRow[];
}

export default function TrainerDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TrainerAnalyticsData | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const sessionResponse = await fetch('/api/auth/session');
        if (!sessionResponse.ok) {
          router.replace('/login');
          return;
        }

        const session = await sessionResponse.json();
        if (session.user?.role !== 'trainer') {
          router.replace('/admin');
          return;
        }

        setUser(session.user);

        const analyticsResponse = await fetch('/api/trainer/analytics');
        const analyticsData = await analyticsResponse.json();
        if (analyticsData.success) {
          setData(analyticsData);
        } else {
          toast(analyticsData.error || 'Gagal memuat data dashboard', 'error');
        }
      } catch {
        toast('Tidak dapat memuat dashboard', 'error');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router, toast]);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
  }

  if (loading) {
    return (
      <main className={layoutStyles.loading} data-theme="trainer">
        <Loader />
      </main>
    );
  }

  if (!user || !data) {
    return (
      <main className={layoutStyles.error} data-theme="trainer">
        Gagal memuat data dashboard.
      </main>
    );
  }

  const totalSessions = data.rawData.length;
  const totalParticipants = data.rawData.reduce((sum, item) => sum + item.participant, 0);
  const totalHours = data.rawData.reduce((sum, item) => sum + item.totalTHours, 0);
  const internalCount = data.rawData.filter((item) =>
    item.jenisTraining?.toUpperCase().includes('INTERNAL')
  ).length;
  const externalCount = data.rawData.filter((item) =>
    item.jenisTraining?.toUpperCase().includes('EKSTERNAL')
  ).length;

  return (
    <main className={layoutStyles.shell} data-theme="trainer">
      <Sidebar user={user} />

      <div className={layoutStyles.main}>
        <Header title="Training Dashboard" onLogout={logout} />

        <div className={layoutStyles.body}>
          <div className={layoutStyles.content}>
            <div className={dashStyles.container1}>
              <div className={dashStyles.container1Left}>
                <KpiCards
                  totalSessions={totalSessions}
                  totalParticipants={totalParticipants}
                  totalHours={totalHours}
                />
                <FilterSection rawData={data.rawData} />
              </div>
              <CategoryPie
                internalCount={internalCount}
                externalCount={externalCount}
              />
            </div>

            <MonthlyAnalytics rawData={data.rawData} />

            <ProgramAnalytics rawData={data.rawData} showDimensionToggle={false} />
          </div>
        </div>
      </div>
    </main>
  );
}
