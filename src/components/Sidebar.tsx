'use client';

import React, { useCallback, useRef, useEffect } from 'react';
import styles from './Sidebar.module.css';

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  /** Número de notificações ou alertas */
  badge?: number;
  /** Exibe um ponto sem número */
  badgeDot?: boolean;
}

export interface MenuCategory {
  title: string;
  items: MenuItem[];
}

export type UserStatus = 'online' | 'away' | 'offline';

interface SidebarProps {
  activeTab: string;
  onTabChange: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userInitials: string;
  userCrp: string;
  userSpecialty?: string;
  userStatus?: UserStatus;
  onLogout?: () => void;
  onProfileClick?: () => void;
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
  userSpecialty,
  userStatus = 'online',
  onLogout,
  onProfileClick,
  menuCategories,
}: SidebarProps) {
  const sidebarRef = useRef<HTMLElement>(null);

  /* ── Escape key to close ── */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    },
    [isOpen, onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen && sidebarRef.current) {
      const focusable = sidebarRef.current.querySelectorAll<HTMLElement>(
        'button, [role="button"], [tabindex="0"]',
      );
      focusable[0]?.focus();
    }
  }, [isOpen]);

  const handleNavItem = useCallback(
    (id: string) => {
      onTabChange(id);
      if (window.innerWidth <= 1024) onClose();
    },
    [onTabChange, onClose],
  );

  const statusLabel: Record<UserStatus, string> = {
    online: 'Online',
    away: 'Ausente',
    offline: 'Offline',
  };

  return (
    <>
      {/* Backdrop overlay (mobile) */}
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        ref={sidebarRef}
        className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}
        aria-label="Menu de navegação"
        role="navigation"
      >
        {/* ── Logo ── */}
        <div className={styles.logoArea}>
          <div className={styles.logoInner}>
            <div className={styles.logoIcon} aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24">
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  fill="#EFBB55"
                />
              </svg>
            </div>
            <div className={styles.logoText}>
              <div className={styles.logoName}>PsicoSync</div>
              <div className={styles.logoSub}>Consultório Web</div>
            </div>
          </div>

          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className={styles.scroll} aria-label="Menu principal">
          {menuCategories.map((cat, idx) => (
            <div key={idx} className={styles.categoryGroup}>
              <div className={styles.category} aria-hidden="true">
                {cat.title}
              </div>

              <div className={styles.categoryItems} role="list">
                {cat.items.map(item => {
                  const isActive = activeTab === item.id;
                  return (
                    <div key={item.id} role="listitem">
                      <div
                        className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                        onClick={() => handleNavItem(item.id)}
                        onKeyDown={e =>
                          (e.key === 'Enter' || e.key === ' ') &&
                          handleNavItem(item.id)
                        }
                        tabIndex={0}
                        aria-current={isActive ? 'page' : undefined}
                        aria-label={item.label}
                        title={item.label}
                      >
                        <span className={styles.navIcon} aria-hidden="true">
                          <svg
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
                        </span>

                        <span className={styles.navLabel}>{item.label}</span>

                        {/* Badge numérico */}
                        {item.badge !== undefined && item.badge > 0 && (
                          <span
                            className={styles.badge}
                            aria-label={`${item.badge} notificações`}
                          >
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
                        )}

                        {/* Badge ponto */}
                        {item.badgeDot && !item.badge && (
                          <span
                            className={styles.badgeDot}
                            aria-label="Novo"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* ── Profile ── */}
        <footer className={styles.profile}>
          <div
            className={styles.profileInner}
            onClick={onProfileClick}
            onKeyDown={e =>
              (e.key === 'Enter' || e.key === ' ') && onProfileClick?.()
            }
            tabIndex={onProfileClick ? 0 : -1}
            role={onProfileClick ? 'button' : undefined}
            aria-label={`Perfil de ${userName}`}
          >
            <div className={styles.avatarWrapper}>
              <div className={styles.avatar} aria-hidden="true">
                {userInitials}
              </div>
              <span
                className={`${styles.avatarStatus} ${
                  userStatus !== 'online' ? styles[userStatus] : ''
                }`}
                aria-label={`Status: ${statusLabel[userStatus]}`}
                title={statusLabel[userStatus]}
              />
            </div>

            <div className={styles.profileInfo}>
              <div className={styles.profileName}>
                {userName || 'Profissional'}
              </div>
              <div className={styles.profileCrp}>
                {userCrp || 'CRP não informado'}
              </div>
              {userSpecialty && (
                <div className={styles.profileSpecialty}>{userSpecialty}</div>
              )}
            </div>

            {onProfileClick && (
              <svg
                className={styles.profileChevron}
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            )}
          </div>

          <button
            className={styles.logoutBtn}
            onClick={onLogout}
            type="button"
            aria-label="Encerrar sessão"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Encerrar Sessão</span>
          </button>
        </footer>
      </aside>
    </>
  );
}