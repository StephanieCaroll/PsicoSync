'use client';

import React from 'react';
import styles from './Sidebar.module.css';

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export interface MenuCategory {
  title: string;
  items: MenuItem[];
}

interface SidebarProps {
  activeTab: string;
  onTabChange: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userInitials: string;
  userCrp: string;
  onLogout?: () => void;
  menuCategories: MenuCategory[];
}

export default function Sidebar({
  activeTab,
  onTabChange,
  isOpen,
  onClose,
  userName,
  userInitials,
  userCrp,
  onLogout,
  menuCategories,
}: SidebarProps) {
  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
      {/* ── Logo ── */}
      <div className={styles.logoArea}>
        <div className={styles.logoInner}>
          <div className={styles.logoIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill="#EFBB55"
              />
            </svg>
          </div>
          <div>
            <div className={styles.logoName}>PsicoSync</div>
            <div className={styles.logoSub}>Consultório Web</div>
          </div>
        </div>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* ── Navigation ── */}
      <div className={styles.scroll}>
        {menuCategories.map((cat, idx) => (
          <div key={idx}>
            <div className={styles.category}>{cat.title}</div>
            {cat.items.map(item => (
              <div
                key={item.id}
                className={`${styles.navItem} ${activeTab === item.id ? styles.active : ''}`}
                onClick={() => onTabChange(item.id)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && onTabChange(item.id)}
              >
                <svg
                  className={styles.navIcon}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {item.icon}
                </svg>
                {item.label}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* ── Profile ── */}
      <div className={styles.profile}>
        <div className={styles.profileInner}>
          <div className={styles.avatar}>{userInitials}</div>
          <div style={{ overflow: 'hidden' }}>
            <div className={styles.profileName}>{userName}</div>
            <div className={styles.profileCrp}>{userCrp}</div>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={onLogout}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Encerrar Sessão
        </button>
      </div>
    </aside>
  );
}