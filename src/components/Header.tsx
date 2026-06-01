import React from 'react';
import styles from './Header.module.css';

export default function Header({ onOpenMobile, title, date, onNewPatient }: any) {
  return (
    <header className={styles.dashHeader}>
      <div className={styles.leftSection}>
        <button className={styles.mobileBtn} onClick={onOpenMobile} aria-label="Menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className={styles.titleContainer}>
          <h2 className={styles.title}>
            {title}
          </h2>
          <p className={styles.date}>{date}</p>
        </div>
      </div>
      
      <button className={styles.btnPrimary} onClick={onNewPatient}>
        Novo Paciente
      </button>
    </header>
  );
}