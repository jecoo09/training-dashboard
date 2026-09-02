'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import styles from './page.module.css';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <p>Redirecting to login...</p>
      </div>
    </main>
  );
}