'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [nik, setNik] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nik, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      setError(result.error || 'Login gagal');
      setSubmitting(false);
      return;
    }

    router.replace(result.role === 'admin' ? '/admin' : '/');
    setSubmitting(false);
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1>Login Dashboard</h1>

        <form onSubmit={submit} className={styles.form}>
          <label>
            NIK
            <input value={nik} onChange={(event) => setNik(event.target.value.toUpperCase())} required />
          </label>

          <label>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>

          {error && <p role="alert">{error}</p>}

          <button type="submit" disabled={submitting}>
            {submitting ? 'Memproses...' : 'Login'}
          </button>
        </form>
      </div>
    </main>
  );
}