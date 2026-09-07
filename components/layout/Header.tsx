import styles from './layout.module.css';

interface HeaderProps {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  onLogout: () => void;
}

export default function Header({ title, eyebrow, subtitle, onLogout }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerBrand}>
        {eyebrow && <p className={styles.headerEyebrow}>{eyebrow}</p>}
        <h1 className={styles.headerTitle}>{title}</h1>
        {subtitle && <p className={styles.headerSubtitle}>{subtitle}</p>}
      </div>

      <button type="button" className={styles.logoutButton} onClick={onLogout} aria-label="Logout">
        <img src="/logout.png" alt="" width={20} height={20} />
      </button>
    </header>
  );
}
