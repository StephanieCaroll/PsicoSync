'use client';

import React from 'react';
import Sidebar, { MenuCategory } from '@/components/Sidebar';
import PatientsTab from '@/features/patients/components/PatientsTab';
import { PatientModal, EvolutionModal } from '@/features/patients/components/EvolutionModal';
import { useDashboard, Patient } from '@/features/dashboard/hooks/useDashboard';
import type { Patient as AppwritePatient } from '@/features/patients/usePatients';
import styles from './DashboardView.module.css';

/* ── Menu definition ── */
const MENU_CATEGORIES: MenuCategory[] = [
  {
    title: 'Visão Geral',
    items: [
      {
        id: 'dashboard', label: 'Painel Central',
        icon: <path d="M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z" />,
      },
    ],
  },
  {
    title: 'Atendimento Clínico',
    items: [
      { id: 'sala-espera',   label: 'Sala de Espera Virtual',  icon: <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> },
      { id: 'teleconsulta',  label: 'Teleconsulta Nativa',     icon: <path d="M23 7l-7 5 7 5V7zM1 5h15v14H1z" /> },
      {
        id: 'evolucao', label: 'Evolução & Anotações',
        icon: <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V8l-6-6z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" /></>,
      },
    ],
  },
  {
    title: 'Gestão de Pacientes',
    items: [
      { id: 'pacientes',    label: 'Diretório de Pacientes',    icon: <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m8-14a4 4 0 100 8 4 4 0 000-8zm14 14v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75" /> },
      { id: 'prontuarios',  label: 'Prontuários Eletrônicos',   icon: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" /></> },
      { id: 'anamnese',     label: 'Anamnese & Triagem',        icon: <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /> },
      { id: 'testes',       label: 'Testes Psicológicos',       icon: <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /> },
      { id: 'diario',       label: 'Diário de Emoções',         icon: <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01" /> },
      { id: 'portal',       label: 'Acesso do Paciente',        icon: <path d="M2 3h20v14H2zM8 21h8M12 17v4" /> },
    ],
  },
  {
    title: 'Agenda & Horários',
    items: [
      { id: 'agenda',       label: 'Calendário Inteligente',    icon: <><path d="M3 4h18v18H3z" /><path d="M16 2v4M8 2v4M3 10h18" /></> },
      { id: 'lista-espera', label: 'Lista de Espera',           icon: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /> },
      { id: 'lembretes',    label: 'Lembretes (SMS/Email)',      icon: <path d="M22 17H2a3 3 0 003-3V9a7 7 0 0114 0v5a3 3 0 003 3zm-8.27 4a2 2 0 01-3.46 0" /> },
    ],
  },
  {
    title: 'Documentos',
    items: [
      { id: 'laudos',       label: 'Laudos & Atestados',        icon: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /></> },
      { id: 'assinatura',   label: 'Assinatura Eletrônica',     icon: <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /> },
      { id: 'biblioteca',   label: 'Materiais & Biblioteca',    icon: <path d="M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /> },
    ],
  },
  {
    title: 'Financeiro',
    items: [
      { id: 'resumo-fin',   label: 'Resumo Financeiro',         icon: <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /> },
      { id: 'recibos',      label: 'Recibos & Notas (NFS-e)',   icon: <><path d="M4 22h14a2 2 0 002-2V7.5L14.5 2H6a2 2 0 00-2 2v4" /><path d="M14 2v6h6M3 15h6M3 18h6" /></> },
      { id: 'cobrancas',    label: 'Inadimplência & Pix',       icon: <path d="M22 12h-4l-3 9L9 3l-3 9H2" /> },
    ],
  },
  {
    title: 'Administração',
    items: [
      { id: 'supervisao',   label: 'Supervisão Clínica',        icon: <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /> },
      { id: 'relatorios',   label: 'Relatórios Estatísticos',   icon: <path d="M18 20V10M12 20V4M6 20v-6" /> },
      {
        id: 'configuracoes', label: 'Configurações da Clínica',
        icon: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></>,
      },
    ],
  },
];

const allMenuItems = MENU_CATEGORIES.flatMap(c => c.items);

/* ── Component ── */
interface DashboardViewProps {
  onLogout?: () => void;
  userId: string;
}

export default function DashboardView({ onLogout, userId }: DashboardViewProps) {
  const dash = useDashboard();

  const handleSelectAppwritePatient = (ap: AppwritePatient) => {
    const p: Patient = {
      id: ap.$id,
      name: ap.name,
      phone: ap.phone,
      email: ap.email,
      status: ap.status as any,
      nextSession: ap.nextSession,
      pendingAmount: ap.pendingAmount,
      lastSession: ap.lastSession,
      therapyType: ap.therapyType,
    };
    dash.openPatientModal(p);
  };

  const handleTabChange = (id: string) => {
    dash.setActiveTab(id);
    dash.setMobileMenuOpen(false);
  };

  const financialTotalMonth = 5250; // Replace with real Appwrite query
  const financialReceived   = financialTotalMonth - dash.pendingTotal;
  const recoveryRate        = financialTotalMonth > 0
    ? ((financialReceived / financialTotalMonth) * 100).toFixed(1)
    : '0.0';

  const activeTabLabel = allMenuItems.find(m => m.id === dash.activeTab)?.label ?? '';

  return (
    <div className={styles.container}>

      {/* ── Modals ── */}
      {dash.showPatientModal && dash.selectedPatient && (
        <PatientModal
          patient={dash.selectedPatient as any}
          notes={dash.notes}
          onClose={() => dash.setShowPatientModal(false)}
          onNewNote={() => dash.openNewNoteModal(dash.selectedPatient!)}
          onEditNote={dash.openEditNoteModal}
          onDeleteNote={dash.handleDeleteNote}
        />
      )}

      {dash.showNoteModal && dash.selectedPatient && (
        <EvolutionModal
          patient={dash.selectedPatient as any}
          editingNote={dash.editingNote}
          onClose={dash.closeModals}
          onSave={dash.handleSaveNote}
        />
      )}

      {/* ── Notifications ── */}
      <div className={styles.notificationContainer}>
        {dash.notifications.map(n => (
          <div
            key={n.id}
            className={`${styles.notificationItem} ${
              n.type === 'success' ? styles.notifSuccess
              : n.type === 'error' ? styles.notifError
              : styles.notifInfo
            }`}
          >
            <span>{n.text}</span>
            <button className={styles.notifClose} onClick={() => dash.removeNotification(n.id)}>×</button>
          </div>
        ))}
      </div>

      {/* ── Mobile overlay ── */}
      <div
        className={`${styles.overlay} ${dash.isMobileMenuOpen ? styles.overlayOpen : ''}`}
        onClick={() => dash.setMobileMenuOpen(false)}
      />

      {/* ── Sidebar ── */}
      <Sidebar
        activeTab={dash.activeTab}
        onTabChange={handleTabChange}
        isOpen={dash.isMobileMenuOpen}
        onClose={() => dash.setMobileMenuOpen(false)}
        userName={dash.userName}
        userInitials={dash.userInitials}
        userCrp={dash.userCrp}
        onLogout={onLogout}
        menuCategories={MENU_CATEGORIES}
      />

      {/* ── Main ── */}
      <div className={styles.main}>

        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button
              className={styles.btnMobileMenu}
              onClick={() => dash.setMobileMenuOpen(true)}
              aria-label="Abrir menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6"  x2="21" y2="6"  />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div>
              <h2 className={styles.headerTitle}>
                {dash.activeTab === 'dashboard' ? 'Painel de Controle' : activeTabLabel}
              </h2>
              <p className={styles.headerSubtitle}>{dash.currentDate}</p>
            </div>
          </div>

          <div className={styles.headerActions}>
            {/* Bell */}
            <div className={styles.notifBell}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5A3E20" strokeWidth="1.8">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {dash.notifications.length > 0 && <span className={styles.notifDot} />}
            </div>

            <button
              className={styles.btnPrimary}
              onClick={() => handleTabChange('pacientes')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5"  y1="12" x2="19" y2="12" />
              </svg>
              <span>Novo Paciente</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className={styles.content}>

          {/* ── DASHBOARD TAB ── */}
          {dash.activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* KPIs */}
              <div className={styles.kpiGrid}>
                {/* Consultas hoje */}
                <div className={`${styles.card} ${styles.animFadeUp} ${styles.delay1}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className={styles.kpiTitle}>Consultas Hoje</span>
                    <div className={styles.kpiIcon} style={{ color: '#AD6D15', background: '#F5ECD8' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8"  y1="2" x2="8"  y2="6" />
                        <line x1="3"  y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                  </div>
                  <div className={styles.kpiValue}>{dash.todayAppointments}</div>
                  <div className={styles.kpiTitle} style={{ color: '#2E9E5B' }}>confirmadas</div>
                </div>

                {/* Pacientes */}
                <div className={`${styles.card} ${styles.animFadeUp} ${styles.delay2}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className={styles.kpiTitle}>Pacientes Ativos</span>
                    <div className={styles.kpiIcon} style={{ color: '#2E9E5B', background: '#E8F4EC' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                  </div>
                  <div className={styles.kpiValue}>
                    {dash.isLoadingPatients ? (
                      <span className={styles.loadingPulse}>…</span>
                    ) : dash.patients.length}
                  </div>
                  <div className={styles.kpiTitle} style={{ color: '#2E9E5B' }}>
                    {dash.activePatients} ativos
                  </div>
                </div>

                {/* Faturamento */}
                <div className={`${styles.card} ${styles.animFadeUp} ${styles.delay3}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className={styles.kpiTitle}>Faturamento Mensal</span>
                    <div className={styles.kpiIcon} style={{ color: '#5A3E20', background: '#E8D9BE' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="1" x2="12" y2="23" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    </div>
                  </div>
                  <div className={styles.kpiValue}>R$ {financialTotalMonth.toLocaleString('pt-BR')}</div>
                  <div className={styles.kpiTitle} style={{ color: '#C45A35' }}>
                    R$ {dash.pendingTotal.toLocaleString('pt-BR')} pendente
                  </div>
                </div>

                {/* Taxa */}
                <div className={`${styles.card} ${styles.animFadeUp} ${styles.delay4}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className={styles.kpiTitle}>Taxa de Recebimento</span>
                    <div className={styles.kpiIcon} style={{ color: '#2E9E5B', background: '#E8F4EC' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="16 12 12 8 8 12" />
                        <line x1="12" y1="16" x2="12" y2="8" />
                      </svg>
                    </div>
                  </div>
                  <div className={styles.kpiValue}>{recoveryRate}%</div>
                  <div className={styles.kpiTitle}>do total faturado</div>
                </div>
              </div>

              {/* Evoluções Recentes + Agenda — two-column on desktop */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

                {/* Próximas sessões */}
                <div className={styles.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                    <h3 className={styles.cardTitle} style={{ margin: 0 }}>Agenda de Hoje</h3>
                    <button className={styles.btnAction} onClick={() => handleTabChange('agenda')}>Ver completa</button>
                  </div>
                  {dash.appointments.map(apt => (
                    <div key={apt.id} className={styles.sessionItem}>
                      <div className={styles.sessionLeft}>
                        <div className={styles.sessionTime}>{apt.time}</div>
                        <div
                          className={styles.sessionBar}
                          style={{ background: apt.type === 'online' ? '#2E9E5B' : '#AD6D15' }}
                        />
                        <div>
                          <div className={styles.sessionName}>{apt.patientName}</div>
                          <div className={styles.sessionType}>
                            {apt.type === 'online' ? '🖥 Teleconsulta' : '🏥 Presencial'}
                          </div>
                        </div>
                      </div>
                      <button
                        className={styles.btnAction}
                        style={{ fontSize: 10, padding: '6px 10px' }}
                        onClick={() => {
                          const p = dash.patients.find(x => x.id === apt.patientId);
                          if (p) dash.openNewNoteModal(p);
                        }}
                      >
                        + Evolução
                      </button>
                    </div>
                  ))}
                </div>

                {/* Evoluções recentes */}
                <div className={styles.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                    <h3 className={styles.cardTitle} style={{ margin: 0 }}>Evoluções Recentes</h3>
                    <button className={styles.btnAction} onClick={() => handleTabChange('evolucao')}>Ver todas</button>
                  </div>
                  {dash.notesLoading ? (
                    <p className={styles.loadingPulse}>Carregando…</p>
                  ) : dash.notes.length === 0 ? (
                    <div className={styles.emptyState} style={{ padding: '32px 0' }}>
                      <p style={{ color: '#9A7040', fontSize: 13 }}>Nenhuma evolução registrada ainda.</p>
                    </div>
                  ) : (
                    dash.notes.slice(0, 5).map(note => (
                      <div
                        key={note.id}
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                          padding: '10px 0', borderBottom: '1px solid #FAF6EE', gap: 8,
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#2D1F0A' }}>
                            {note.patientName}
                          </div>
                          <div style={{ fontSize: 11, color: '#9A7040', marginTop: 2 }}>
                            {new Date(note.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                            {note.mood && ` · ${note.mood}`}
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: 10, fontWeight: 700, padding: '3px 8px',
                            borderRadius: 6, background: '#F5ECD8', color: '#AD6D15',
                          }}
                        >
                          {note.mood ?? '—'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Pacientes recentes */}
              <div className={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                  <h3 className={styles.cardTitle} style={{ margin: 0 }}>Pacientes Recentes</h3>
                  <button className={styles.btnAction} onClick={() => handleTabChange('pacientes')}>Ver todos</button>
                </div>
                {dash.isLoadingPatients ? (
                  <p className={styles.loadingPulse}>Carregando…</p>
                ) : (
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Paciente</th>
                          <th>Status</th>
                          <th>Evoluções</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dash.patients.slice(0, 6).map(pt => (
                          <tr key={pt.id}>
                            <td>
                              <div style={{ fontWeight: 600, color: '#2D1F0A', fontSize: 14 }}>{pt.name}</div>
                              <div style={{ fontSize: 11, color: '#9A7040' }}>{pt.therapyType || 'Terapia'}</div>
                            </td>
                            <td>
                              <span className={`${styles.badge} ${
                                pt.status === 'active'   ? styles.badgeActive
                                : pt.status === 'waiting' ? styles.badgeWaiting
                                : styles.badgeInactive
                              }`}>
                                {pt.status === 'active' ? 'Ativo' : pt.status === 'waiting' ? 'Aguardando' : 'Inativo'}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontSize: 13, color: '#9A7040' }}>
                                {dash.notesForPatient(pt.id).length} registros
                              </span>
                            </td>
                            <td>
                              <div className={styles.tableActions}>
                                <button
                                  className={styles.btnAction}
                                  style={{ padding: '6px 10px', fontSize: 10 }}
                                  onClick={() => dash.openNewNoteModal(pt)}
                                >
                                  + Evolução
                                </button>
                                <button
                                  className={styles.btnPrimary}
                                  style={{ padding: '6px 10px', fontSize: 10 }}
                                  onClick={() => dash.openPatientModal(pt)}
                                >
                                  Prontuário
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── EVOLUÇÃO TAB ── */}
          {dash.activeTab === 'evolucao' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                  <h3 className={styles.cardTitle} style={{ margin: 0 }}>Todas as Evoluções</h3>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className={styles.btnPrimary} onClick={() => {
                      if (dash.patients.length > 0) dash.openNewNoteModal(dash.patients[0]);
                    }}>
                      + Nova Evolução
                    </button>
                  </div>
                </div>

                {dash.notesLoading ? (
                  <p className={styles.loadingPulse}>Carregando evoluções…</p>
                ) : dash.notes.length === 0 ? (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📋</div>
                    <h3 className={styles.emptyTitle}>Nenhuma evolução ainda</h3>
                    <p className={styles.emptyText}>
                      Registre a primeira evolução clínica de um paciente para começar.
                    </p>
                  </div>
                ) : (
                  dash.notes.map(note => (
                    <div
                      key={note.id}
                      style={{
                        background: '#FAF6EE', border: '1px solid #EEE2C8', borderRadius: 12,
                        padding: 16, marginBottom: 10, transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                        <div>
                          <div style={{ fontWeight: 700, color: '#2D1F0A', fontSize: 14 }}>
                            {note.patientName}
                            <span style={{ fontWeight: 400, color: '#9A7040', marginLeft: 10, fontSize: 12 }}>
                              {new Date(note.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                              {note.sessionNumber ? ` · Sessão #${note.sessionNumber}` : ''}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                            {note.mood && (
                              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: '#F5ECD8', color: '#AD6D15', textTransform: 'uppercase' }}>
                                {note.mood}
                              </span>
                            )}
                            {note.topics?.slice(0, 3).map(t => (
                              <span key={t} style={{ fontSize: 11, color: '#9A7040' }}>#{t}</span>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            style={{ padding: '5px 10px', fontSize: 10, fontWeight: 600, background: '#fff', border: '1px solid #D9C49A', color: '#AD6D15', borderRadius: 6, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                            onClick={() => dash.openEditNoteModal(note)}
                          >
                            ✏ Editar
                          </button>
                          <button
                            style={{ padding: '5px 10px', fontSize: 10, fontWeight: 600, background: '#FEF0EC', border: '1px solid #F0C0A8', color: '#C45A35', borderRadius: 6, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                            onClick={() => dash.handleDeleteNote(note.id)}
                          >
                            🗑 Excluir
                          </button>
                        </div>
                      </div>
                      <div style={{ fontSize: 13, lineHeight: 1.65, color: '#5A3E20' }}>
                        {note.content.length > 220 ? note.content.substring(0, 220) + '…' : note.content}
                      </div>
                      {note.nextSteps && (
                        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #E8D9BE', fontSize: 12, color: '#9A7040' }}>
                          <strong>Próximos passos:</strong> {note.nextSteps}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── PATIENTS TAB ── */}
          {dash.activeTab === 'pacientes' && (
            <PatientsTab userId={userId} onSelectPatient={handleSelectAppwritePatient} />
          )}

          {/* ── FINANCIAL TAB ── */}
          {dash.activeTab === 'resumo-fin' && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Resumo Financeiro</h3>
              <div className={styles.kpiGrid}>
                {[
                  { label: 'Faturamento Total',   value: `R$ ${financialTotalMonth.toLocaleString('pt-BR')}`, color: '#2D1F0A' },
                  { label: 'Recebido',             value: `R$ ${financialReceived.toLocaleString('pt-BR')}`,  color: '#2E9E5B' },
                  { label: 'Pendente',             value: `R$ ${dash.pendingTotal.toLocaleString('pt-BR')}`,  color: '#C45A35' },
                ].map(item => (
                  <div key={item.label} className={styles.finCard}>
                    <div className={styles.kpiTitle}>{item.label}</div>
                    <div className={styles.kpiValue} style={{ color: item.color }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── OTHER TABS — placeholder ── */}
          {!['dashboard', 'pacientes', 'resumo-fin', 'evolucao'].includes(dash.activeTab) && (
            <div className={styles.card}>
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#AD6D15" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    {allMenuItems.find(m => m.id === dash.activeTab)?.icon}
                  </svg>
                </div>
                <h3 className={styles.emptyTitle}>{activeTabLabel}</h3>
                <p className={styles.emptyText}>
                  Este módulo está em desenvolvimento e em breve estará disponível.
                </p>
                <button
                  className={styles.btnAction}
                  style={{ marginTop: 24 }}
                  onClick={() => handleTabChange('dashboard')}
                >
                  Voltar ao Painel
                </button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}