import type { User } from '@/lib/dashboard';
import styles from './layout.module.css';

interface SidebarProps {
  user: User;
}

export default function Sidebar({ user }: SidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <img className={styles.sidebarAvatar} src="/user.png" alt="" width={80} height={80} />
      <strong className={styles.sidebarNama}>{user.fullName}</strong>
      <p className={styles.sidebarNIK}>{user.nik}</p>
      <p className={styles.sidebarLoc}>{user.locGroup || '-'}</p>
    </aside>
  );
}
