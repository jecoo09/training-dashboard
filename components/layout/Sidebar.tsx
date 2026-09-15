'use client';

import type { User } from '@/lib/dashboard';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './layout.module.css';

interface SidebarProps {
  user: User;
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const dashboardHref = user.role === 'admin' ? '/admin' : '/';
  const monthlyRecapHref = '/admin/monthly-recap';
  const requestsHref = user.role === 'admin' ? '/admin/requests' : '/requests';
  return (
    <aside className={styles.sidebar}>
      <img className={styles.sidebarAvatar} src="/user.png" alt="" width={80} height={80} />
      <strong className={styles.sidebarNama}>{user.fullName}</strong>
      <p className={styles.sidebarNIK}>{user.nik}</p>
      <p className={styles.sidebarLoc}>{user.locGroup || '-'}</p>
      <nav className={styles.sidebarNav} aria-label="Navigasi utama">
        <Link className={pathname === dashboardHref ? styles.sidebarNavActive : styles.sidebarNavLink} href={dashboardHref}>Dashboard</Link>
        {user.role === 'admin' && (
          <Link className={pathname === monthlyRecapHref ? styles.sidebarNavActive : styles.sidebarNavLink} href={monthlyRecapHref}>Monthly Recap</Link>
        )}
        <Link className={pathname === requestsHref ? styles.sidebarNavActive : styles.sidebarNavLink} href={requestsHref}>Pengajuan Training</Link>
      </nav>
    </aside>
  );
}
