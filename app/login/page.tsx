'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Loader from '@/components/ui/Loader';
import { useToast } from '@/components/ui/ToastProvider';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [nik, setNik] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nik: nik.trim(), password }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast(result.error || 'Login gagal', 'error');
        setSubmitting(false);
        return;
      }

      router.replace(result.role === 'admin' ? '/admin' : '/');
    } catch {
      toast('Tidak dapat terhubung ke server', 'error');
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.content}>
          <h1 className={styles.title}>Training - Dashboard</h1>
          <p className={styles.subtitle}>Masuk dengan NIK dan password akun Anda</p>
        </div>

        <form className={styles.form} onSubmit={submit}>
          <label className={styles.label}>
            NIK
            <input
              className={styles.input}
              value={nik}
              onChange={(event) => setNik(event.target.value.toUpperCase())}
              autoComplete="username"
              autoFocus
              required
            />
          </label>

          <label className={styles.label}>
            Password
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          <button className={styles.submit} type="submit" disabled={submitting}>
            {submitting ? <Loader /> : 'Login'}
          </button>
        </form>
      </div>
    </main>
  );
}
