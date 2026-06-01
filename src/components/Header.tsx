import React from 'react';
import styles from '../features/dashboard/components/DashboardView.module.css';

export default function Header({ onOpenMobile, title, date, onNewPatient }: any) {
  return (
    <header className={styles.dashHeader}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button className={styles.mobileBtn} onClick={onOpenMobile}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div>
          <h2 style={{ fontFamily: "'Lora', serif", fontSize: 24, fontWeight: 600, color: '#2D1F0A', margin: 0 }}>
            {title}
          </h2>
          <p style={{ fontSize: 12, color: '#9A7040', marginTop: 4 }}>{date}</p>
        </div>
      </div>
      
      <button className={styles.btnPrimary} onClick={onNewPatient}>
        Novo Paciente
      </button>
    </header>
  );
}