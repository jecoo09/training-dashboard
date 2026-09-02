'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  fullName: string;
  nik: string;
  locGroup: string | null;
  role: string;
}

export default function TrainerDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
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
      } catch {
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [router]);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
  }

  if (loading || !user) {
    return <main>Loading...</main>;
  }

  return (
    <main style={{ padding: 24 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <p style={{ margin: 0, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Trainer</p>
          <h1 style={{ margin: '6px 0 0' }}>Dashboard Trainer</h1>
        </div>

        <button type="button" onClick={logout}>Logout</button>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(180px, 1fr))', gap: 16 }}>
        <div style={{ border: '1px solid #ddd', padding: 16 }}>
          <p style={{ margin: 0 }}>Nama</p>
          <strong>{user.fullName}</strong>
        </div>
        <div style={{ border: '1px solid #ddd', padding: 16 }}>
          <p style={{ margin: 0 }}>NIK</p>
          <strong>{user.nik}</strong>
        </div>
        <div style={{ border: '1px solid #ddd', padding: 16 }}>
          <p style={{ margin: 0 }}>Lokasi</p>
          <strong>{user.locGroup || '-'}</strong>
        </div>
      </section>
    </main>
  );
}
