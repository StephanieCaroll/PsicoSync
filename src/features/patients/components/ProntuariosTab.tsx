'use client';

import React, { useState, useMemo } from 'react';
import { Patient } from '@/features/dashboard/hooks/useDashboard';
import { ClinicalNote } from '@/features/patients/components/EvolutionModal';
import styles from './ProntuariosTab.module.css';

interface ProntuariosTabProps {
  patients: Patient[];
  notes: ClinicalNote[];
  notesLoading: boolean;
  onNewNote: (patient: Patient) => void;
  onEditNote: (note: ClinicalNote) => void;
  onDeleteNote: (id: string) => void;
  userName?: string;
  userCrp?: string;
}

export default function ProntuariosTab({
  patients,
  notes,
  notesLoading,
  onEditNote,
  onDeleteNote,
  userName = 'Profissional',
  userCrp = 'CRP não informado'
}: ProntuariosTabProps) {
  const [search, setSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Filtrar pacientes pela busca
  const filteredPatients = useMemo(() => {
    const q = search.toLowerCase().trim();
    return patients.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.email ?? '').toLowerCase().includes(q)
    );
  }, [patients, search]);

  const selectedPatient = patients.find(p => p.id === selectedPatientId) ?? null;

  // Pegar notas do paciente selecionado e ordenar da mais recente para a mais antiga
  const patientNotes = useMemo(() => {
    if (!selectedPatientId) return [];
    return notes
      .filter(n => n.patientId === selectedPatientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [notes, selectedPatientId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`${styles.container} ${selectedPatientId ? styles.patientSelected : ''}`}>
      
      {/* ── PAINEL ESQUERDO: Lista de Pacientes ── */}
      <div className={styles.sidebar}>
        <div className={styles.searchWrapper}>
          <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className={styles.searchInput}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome..."
          />
        </div>

        <div className={styles.patientList}>
          {filteredPatients.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#9A7040', fontSize: 13 }}>
              Nenhum paciente encontrado.
            </div>
          ) : (
            filteredPatients.map(p => (
              <button
                key={p.id}
                className={`${styles.patientCard} ${selectedPatientId === p.id ? styles.patientCardSelected : ''}`}
                onClick={() => setSelectedPatientId(p.id)}
              >
                <div className={styles.patientName}>{p.name}</div>
                <div className={styles.patientType}>{p.therapyType || 'Terapia'}</div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── PAINEL DIREITO: Prontuário ── */}
      <div className={styles.mainContent}>
        {!selectedPatient ? (
          <div className={styles.emptyState}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#E8D9BE" strokeWidth="1">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
            </svg>
            <h3 className={styles.emptyTitle}>Prontuário Eletrônico</h3>
            <p className={styles.emptyText}>Selecione um paciente na lista ao lado para visualizar e imprimir seu histórico clínico completo.</p>
          </div>
        ) : (
          <>
            {/* cabeçalho no PDF/Impressão */}
            <div className={styles.printHeader}>
              <div className={styles.printLogo}>PsicoSync</div>
              <div className={styles.printMeta}>
                <strong>{userName}</strong><br />
                {userCrp}<br />
                Impresso em: {new Date().toLocaleDateString('pt-BR')}
              </div>
            </div>

            <div className={styles.recordHeader}>
              <div style={{ width: '100%' }}>
                <button className={styles.btnBack} onClick={() => setSelectedPatientId(null)}>
                   ← Voltar
                </button>
                <h2 className={styles.recordTitle}>{selectedPatient.name}</h2>
                <div className={styles.recordBadges}>
                  <span className={`${styles.badge} ${selectedPatient.status === 'active' ? styles.badgeActive : selectedPatient.status === 'waiting' ? styles.badgeWaiting : styles.badgeInactive}`}>
                    {selectedPatient.status === 'active' ? 'Ativo' : selectedPatient.status === 'waiting' ? 'Aguardando' : 'Inativo'}
                  </span>
                  <span className={`${styles.badge} ${styles.badgeTherapy}`}>
                    {selectedPatient.therapyType || 'Terapia Padrão'}
                  </span>
                </div>
                <div className={styles.contactInfo}>
                  {selectedPatient.email && <span>📧 {selectedPatient.email}</span>}
                  {selectedPatient.phone && <span>📱 {selectedPatient.phone}</span>}
                </div>
              </div>
              
              <button className={styles.btnAction} onClick={handlePrint} title="Imprimir Prontuário">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
                Imprimir / PDF
              </button>
            </div>

            <div className={styles.recordBody}>
              {notesLoading ? (
                <p style={{ color: '#9A7040', textAlign: 'center' }}>Carregando prontuário...</p>
              ) : patientNotes.length === 0 ? (
                <p style={{ color: '#9A7040', textAlign: 'center', fontStyle: 'italic' }}>Este paciente ainda não possui evoluções registradas.</p>
              ) : (
                <div className={styles.timeline}>
                  {patientNotes.map(note => (
                    <div key={note.id} className={styles.timelineItem}>
                      <div className={styles.timelineDot} />
                      <div className={styles.noteHeader}>
                        <div className={styles.noteDate}>
                          {new Date(note.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                          {note.sessionNumber && <span style={{ fontSize: 13, color: '#9A7040', fontWeight: 400, marginLeft: 8 }}>Sessão #{note.sessionNumber}</span>}
                        </div>
                      </div>
                      <div className={styles.noteContent}>{note.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}