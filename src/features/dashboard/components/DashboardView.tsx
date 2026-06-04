'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar, { MenuCategory } from '@/components/Sidebar';
import PatientsTab from '@/features/patients/components/PatientsTab';
import EvolutionModal, { ClinicalNote } from '@/features/patients/components/EvolutionModal';
import ProntuariosTab from '@/features/patients/components/ProntuariosTab';
import ProfilePage from '@/features/profile/Profilepage';
import { useDashboard, Patient, Appointment } from '@/features/dashboard/hooks/useDashboard';
import type { Patient as AppwritePatient } from '@/features/patients/usePatients';
import styles from './DashboardView.module.css';
import AgendaTab from '@/features/agenda/components/AgendaTab';
import ResumoFinanceiroTab from './ResumoFinanceiroTab';
import DocumentosTab from './DocumentosTab';
import RelatoriosTab from './RelatoriosTab';
import ConfiguracoesTab from './ConfiguracoesTab';
import {
  SalaEsperaTab, TeleconsultaTab, AnamneseTab, TestesTab, DiarioTab,
  PortalTab, ListaEsperaTab, LembretesTab, AssinaturaTab, BibliotecaTab,
  RecibosTab, CobrancasTab, SupervisaoTab
} from './NovasAbas';


interface PatientModalProps {
  patient: Patient;
  notes: ClinicalNote[];
  onClose: () => void;
  onNewNote: () => void;
  onEditNote: (note: ClinicalNote) => void;
  onDeleteNote: (id: string) => void;
}

function PatientModal({ patient, notes, onClose, onNewNote, onEditNote, onDeleteNote }: PatientModalProps) {
  const patientNotes = notes.filter(n => n.patientId === patient.id);
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(26,16,8,0.6)',
        backdropFilter: 'blur(5px)', zIndex: 999998,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        boxSizing: 'border-box',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 24, width: '100%', maxWidth: 720,
          maxHeight: 'calc(100vh - 32px)', display: 'flex', flexDirection: 'column',
          boxShadow: '0 32px 80px rgba(26,16,8,0.2)', overflow: 'hidden',
        }}
      >
        <div style={{ background: '#1A1008', padding: '22px 28px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'rgba(239,187,85,0.15)', border: '1px solid rgba(239,187,85,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EFBB55" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'Lora, serif', fontSize: 22, fontWeight: 600, color: '#fff', margin: 0, lineHeight: 1.2 }}>
              {patient.name}
            </h2>
            <span style={{ fontSize: 12, color: 'rgba(239,187,85,0.65)' }}>
              {patient.therapyType || 'Terapia'} · {patient.status === 'active' ? 'Ativo' : patient.status === 'waiting' ? 'Aguardando' : 'Inativo'}
            </span>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.5)', width: 32, height: 32, borderRadius: 8,
            cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>
        <div style={{ padding: '16px 28px', borderBottom: '1px solid #F0E8D8', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {patient.email && <span style={{ fontSize: 12, color: '#9A7040' }}>📧 {patient.email}</span>}
          {patient.phone && <span style={{ fontSize: 12, color: '#9A7040' }}>📱 {patient.phone}</span>}
          {patient.nextSession && <span style={{ fontSize: 12, color: '#9A7040' }}>📅 Próxima: {patient.nextSession}</span>}
          {patient.pendingAmount != null && patient.pendingAmount > 0 && (
            <span style={{ fontSize: 12, color: '#C45A35', fontWeight: 600 }}>
              💰 Pendente: R$ {patient.pendingAmount.toLocaleString('pt-BR')}
            </span>
          )}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'Lora, serif', fontSize: 16, fontWeight: 600, color: '#2D1F0A', margin: 0 }}>
              Evoluções ({patientNotes.length})
            </h3>
            <button onClick={onNewNote} style={{
              background: '#1A1008', color: '#EFBB55', border: 'none',
              padding: '8px 16px', borderRadius: 8, fontSize: 11, fontWeight: 700,
              letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer',
            }}>+ Nova Evolução</button>
          </div>
          {patientNotes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#9A7040', fontSize: 13 }}>
              Nenhuma evolução registrada ainda.
            </div>
          ) : (
            patientNotes.map(note => (
              <div key={note.id} style={{ background: '#fff', border: '1px solid rgba(238,226,200,0.6)', borderRadius: 16, padding: 20, marginBottom: 14, boxShadow: '0 4px 12px rgba(45,31,10,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#5A3E20' }}>
                      {new Date(note.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                      {note.sessionNumber ? ` · Sessão #${note.sessionNumber}` : ''}
                    </span>
                    {note.mood && (
                      <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: '#F5ECD8', color: '#AD6D15' }}>
                        {note.mood}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => onEditNote(note)} style={{ padding: '4px 10px', fontSize: 10, fontWeight: 600, background: '#fff', border: '1px solid #D9C49A', color: '#AD6D15', borderRadius: 6, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Editar</button>
                    <button onClick={() => onDeleteNote(note.id)} style={{ padding: '4px 10px', fontSize: 10, fontWeight: 600, background: '#FEF0EC', border: '1px solid #F0C0A8', color: '#C45A35', borderRadius: 6, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Excluir</button>
                  </div>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.65, color: '#5A3E20', margin: 0 }}>
                  {note.content.length > 200 ? note.content.substring(0, 200) + '…' : note.content}
                </p>
              </div>
            ))
          )}
        </div>
        <div style={{ padding: '14px 28px', borderTop: '1px solid #F0E8D8', background: '#FDFAF5', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ background: 'none', border: '1.5px solid #D9C49A', color: '#9A7040', padding: '10px 20px', borderRadius: 8, fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer' }}>Fechar</button>
        </div>
      </div>
    </div>
  );
}

interface EvolucaoTabProps {
  patients: Patient[];
  notes: ClinicalNote[];
  notesLoading: boolean;
  onNewNote: (patient: Patient) => void;
  onEditNote: (note: ClinicalNote) => void;
  onDeleteNote: (id: string) => void;
}

function EvolucaoTab({ patients, notes, notesLoading, onNewNote, onEditNote, onDeleteNote }: EvolucaoTabProps) {
  const [search, setSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [noteSearch, setNoteSearch] = useState('');
  const [moodFilter, setMoodFilter] = useState<string>('');

  const filteredPatients = useMemo(() => {
    const q = search.toLowerCase().trim();
    return patients.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.therapyType ?? '').toLowerCase().includes(q)
    );
  }, [patients, search]);

  const selectedPatient = patients.find(p => p.id === selectedPatientId) ?? null;

  const patientNotes = useMemo(() => {
    if (!selectedPatientId) return [];
    let list = notes.filter(n => n.patientId === selectedPatientId);
    if (noteSearch.trim()) {
      const q = noteSearch.toLowerCase();
      list = list.filter(n =>
        n.content.toLowerCase().includes(q) ||
        n.mood?.toLowerCase().includes(q) ||
        n.topics?.some(t => t.toLowerCase().includes(q)) ||
        n.nextSteps?.toLowerCase().includes(q)
      );
    }
    if (moodFilter) list = list.filter(n => n.mood === moodFilter);
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [notes, selectedPatientId, noteSearch, moodFilter]);

  const allMoods = useMemo(() => {
    if (!selectedPatientId) return [];
    const moods = notes.filter(n => n.patientId === selectedPatientId && n.mood).map(n => n.mood);
    return [...new Set(moods)];
  }, [notes, selectedPatientId]);

  const notesCountFor = (patientId: string) => notes.filter(n => n.patientId === patientId).length;
  const lastNoteFor = (patientId: string) => {
    const pNotes = notes.filter(n => n.patientId === patientId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return pNotes[0]?.date ?? null;
  };

  return (
    <div className={`${styles.evolutionsGrid} ${selectedPatientId ? styles.patientSelected : ''}`}>
      <div className={styles.evolutionsList}>
        <div style={{ display: 'flex', alignItems: 'center', background: '#FDFAF5', border: '1.5px solid #E8D9BE', borderRadius: 12, padding: '0 14px' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9A7040" strokeWidth="2" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar paciente…"
            style={{ flex: 1, border: 'none', background: 'transparent', padding: '12px 0 12px 10px', outline: 'none', fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#2D1F0A' }}
          />
        </div>
        <div style={{ fontSize: 11, color: '#9A7040', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', paddingLeft: 4 }}>
          {filteredPatients.length} paciente{filteredPatients.length !== 1 ? 's' : ''}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filteredPatients.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#9A7040', fontSize: 13 }}>Nenhum paciente encontrado.</div>
          ) : (
            filteredPatients.map(p => {
              const count = notesCountFor(p.id);
              const last  = lastNoteFor(p.id);
              const isSelected = selectedPatientId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => { setSelectedPatientId(p.id); setNoteSearch(''); setMoodFilter(''); }}
                  style={{
                    width: '100%', textAlign: 'left', padding: '12px 14px',
                    borderRadius: 12, cursor: 'pointer', transition: 'all 0.15s',
                    border: isSelected ? '1.5px solid #AD6D15' : '1.5px solid #EEE2C8',
                    background: isSelected ? '#FDF5E6' : '#fff',
                    boxShadow: isSelected ? '0 2px 8px rgba(173,109,21,0.1)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: isSelected ? '#AD6D15' : '#2D1F0A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: 11, color: '#9A7040', marginTop: 2 }}>{p.therapyType || 'Terapia'}</div>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                      background: count > 0 ? (isSelected ? '#AD6D15' : '#F5ECD8') : '#F0EDE8',
                      color: count > 0 ? (isSelected ? '#fff' : '#AD6D15') : '#C0B090',
                      whiteSpace: 'nowrap', flexShrink: 0,
                    }}>
                      {count} {count === 1 ? 'nota' : 'notas'}
                    </span>
                  </div>
                  {last && <div style={{ fontSize: 10, color: '#B09060', marginTop: 6 }}>Última: {new Date(last).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</div>}
                  {count === 0 && <div style={{ fontSize: 10, color: '#C0B090', marginTop: 6, fontStyle: 'italic' }}>Sem evoluções ainda</div>}
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className={styles.evolutionsContent}>
        {!selectedPatient ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, color: '#9A7040', gap: 12 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D9C49A" strokeWidth="1.2" strokeLinecap="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#5A3E20', fontFamily: 'Lora, serif' }}>Selecione um paciente</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Escolha um paciente na lista ao lado para ver suas evoluções clínicas.</div>
            </div>
          </div>
        ) : (
          <>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F0E8D8', background: '#FDFAF5', borderRadius: '14px 14px 0 0' }}>
              <button className={styles.btnBackToList} onClick={() => setSelectedPatientId(null)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                Voltar à Lista
              </button>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h3 style={{ fontFamily: 'Lora, serif', fontSize: 17, fontWeight: 600, color: '#2D1F0A', margin: 0 }}>{selectedPatient.name}</h3>
                  <div style={{ fontSize: 12, color: '#9A7040', marginTop: 2 }}>
                    {selectedPatient.therapyType || 'Terapia'} · {patientNotes.length} evolução{patientNotes.length !== 1 ? 'ões' : ''} encontrada{patientNotes.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <button
                  onClick={() => onNewNote(selectedPatient)}
                  style={{ background: '#1A1008', color: '#EFBB55', border: 'none', padding: '9px 18px', borderRadius: 8, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  Nova Evolução
                </button>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9A7040" strokeWidth="2"
                    style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    value={noteSearch}
                    onChange={e => setNoteSearch(e.target.value)}
                    placeholder="Buscar em evoluções, tópicos…"
                    style={{ width: '100%', padding: '8px 10px 8px 30px', borderRadius: 8, border: '1.5px solid #E8D9BE', background: '#fff', fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#2D1F0A', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                {allMoods.length > 0 && (
                  <select value={moodFilter} onChange={e => setMoodFilter(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid #E8D9BE', background: '#fff', fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#5A3E20', outline: 'none', cursor: 'pointer' }}>
                    <option value="">Todos os humores</option>
                    {allMoods.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                )}
                {(noteSearch || moodFilter) && (
                  <button onClick={() => { setNoteSearch(''); setMoodFilter(''); }}
                    style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid #F0C0A8', background: '#FEF0EC', color: '#C45A35', fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    Limpar filtros
                  </button>
                )}
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {notesLoading ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#9A7040', fontSize: 13 }}>Carregando…</div>
              ) : patientNotes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#9A7040' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#5A3E20' }}>
                    {noteSearch || moodFilter ? 'Nenhuma evolução encontrada para esse filtro' : 'Nenhuma evolução ainda'}
                  </div>
                  {!noteSearch && !moodFilter && <div style={{ fontSize: 12, marginTop: 6 }}>Clique em "Nova Evolução" para registrar a primeira sessão.</div>}
                </div>
              ) : (
                patientNotes.map(note => (
                  <div key={note.id} style={{ background: '#FAF6EE', border: '1px solid #EEE2C8', borderRadius: 12, padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        {note.sessionNumber && (
                          <span style={{ width: 28, height: 28, borderRadius: 8, background: '#1A1008', color: '#EFBB55', fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            #{note.sessionNumber}
                          </span>
                        )}
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#2D1F0A' }}>
                            {new Date(note.date).toLocaleDateString('pt-BR', { timeZone: 'UTC', weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                          </div>
                          <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                            {note.mood && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: '#F5ECD8', color: '#AD6D15', textTransform: 'uppercase' }}>{note.mood}</span>}
                            {note.isTelehealth && <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: '#E8F4EC', color: '#2E9E5B' }}>🖥 Online</span>}
                            {note.duration && <span style={{ fontSize: 10, color: '#9A7040' }}>⏱ {note.duration} min</span>}
                            {note.topics?.slice(0, 3).map(t => <span key={t} style={{ fontSize: 11, color: '#9A7040' }}>#{t}</span>)}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button onClick={() => onEditNote(note)} style={{ padding: '5px 10px', fontSize: 10, fontWeight: 600, background: '#fff', border: '1px solid #D9C49A', color: '#AD6D15', borderRadius: 6, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}>✏ Editar</button>
                        <button onClick={() => onDeleteNote(note.id)} style={{ padding: '5px 10px', fontSize: 10, fontWeight: 600, background: '#FEF0EC', border: '1px solid #F0C0A8', color: '#C45A35', borderRadius: 6, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🗑</button>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, lineHeight: 1.7, color: '#5A3E20', margin: 0, whiteSpace: 'pre-wrap' }}>{note.content}</p>
                    {note.intervention && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #E8D9BE' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#9A7040', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>🛠 Intervenções</div>
                        <p style={{ fontSize: 12, color: '#7A5020', margin: 0, lineHeight: 1.6 }}>{note.intervention}</p>
                      </div>
                    )}
                    {note.nextSteps && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #E8D9BE' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#9A7040', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>🎯 Próximos passos</div>
                        <p style={{ fontSize: 12, color: '#7A5020', margin: 0, lineHeight: 1.6 }}>{note.nextSteps}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const MENU_CATEGORIES: MenuCategory[] = [
  {
    title: 'Visão Geral',
    items: [
      { id: 'dashboard', label: 'Painel Central', icon: <path d="M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z" /> },
    ],
  },
  {
    title: 'Atendimento Clínico',
    items: [
      { id: 'sala-espera',  label: 'Sala de Espera Virtual', icon: <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> },
      { id: 'teleconsulta', label: 'Teleconsulta Nativa',    icon: <path d="M23 7l-7 5 7 5V7zM1 5h15v14H1z" /> },
      { id: 'evolucao',     label: 'Evolução & Anotações',   icon: <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V8l-6-6z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" /></> },
    ],
  },
  {
    title: 'Gestão de Pacientes',
    items: [
      { id: 'pacientes',   label: 'Diretório de Pacientes',  icon: <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m8-14a4 4 0 100 8 4 4 0 000-8zm14 14v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75" /> },
      { id: 'prontuarios', label: 'Prontuários Eletrônicos',  icon: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" /></> },
      { id: 'anamnese',    label: 'Anamnese & Triagem',       icon: <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /> },
      { id: 'testes',      label: 'Testes Psicológicos',      icon: <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /> },
      { id: 'diario',      label: 'Diário de Emoções',        icon: <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01" /> },
      { id: 'portal',      label: 'Acesso do Paciente',       icon: <path d="M2 3h20v14H2zM8 21h8M12 17v4" /> },
    ],
  },
  {
    title: 'Agenda & Horários',
    items: [
      { id: 'agenda',       label: 'Calendário Inteligente', icon: <><path d="M3 4h18v18H3z" /><path d="M16 2v4M8 2v4M3 10h18" /></> },
      { id: 'lista-espera', label: 'Lista de Espera',        icon: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /> },
      { id: 'lembretes',    label: 'Lembretes (SMS/Email)',   icon: <path d="M22 17H2a3 3 0 003-3V9a7 7 0 0114 0v5a3 3 0 003 3zm-8.27 4a2 2 0 01-3.46 0" /> },
    ],
  },
  {
    title: 'Documentos',
    items: [
      { id: 'laudos',     label: 'Laudos & Atestados',     icon: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /></> },
      { id: 'assinatura', label: 'Assinatura Eletrônica',  icon: <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /> },
      { id: 'biblioteca', label: 'Materiais & Biblioteca', icon: <path d="M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /> },
    ],
  },
  {
    title: 'Financeiro',
    items: [
      { id: 'resumo-fin', label: 'Resumo Financeiro',       icon: <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /> },
      { id: 'recibos',    label: 'Recibos & Notas (NFS-e)', icon: <><path d="M4 22h14a2 2 0 002-2V7.5L14.5 2H6a2 2 0 00-2 2v4" /><path d="M14 2v6h6M3 15h6M3 18h6" /></> },
      { id: 'cobrancas',  label: 'Inadimplência & Pix',     icon: <path d="M22 12h-4l-3 9L9 3l-3 9H2" /> },
    ],
  },
  {
    title: 'Administração',
    items: [
      { id: 'supervisao',    label: 'Supervisão Clínica',       icon: <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /> },
      { id: 'relatorios',    label: 'Relatórios Estatísticos',  icon: <path d="M18 20V10M12 20V4M6 20v-6" /> },
      { id: 'configuracoes', label: 'Configurações do Sistema', icon: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></> },
    ],
  },
];

const allMenuItems = MENU_CATEGORIES.flatMap(c => c.items);

interface DashboardHeaderProps {
  activeTab: string;
  activeTabLabel: string;
  currentDate: string;
  notificationsCount: number;
  userName: string;
  onOpenMobileMenu: () => void;
  onOpenProfile: () => void;
  onNewPatient: () => void;
}

function DashboardHeader({
  activeTab,
  activeTabLabel,
  currentDate,
  notificationsCount,
  userName,
  onOpenMobileMenu,
  onOpenProfile,
  onNewPatient
}: DashboardHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <button className={styles.btnMobileMenu} onClick={onOpenMobileMenu} aria-label="Abrir menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className={styles.headerTitleWrapper}>
          <h2 className={styles.headerTitle}>
            {activeTab === 'dashboard' ? 'Painel de Controle' : activeTabLabel}
          </h2>
          <p className={styles.headerSubtitle}>{currentDate}</p>
        </div>
      </div>

      <div className={styles.headerActions}>
        <div className={styles.notifBell}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5A3E20" strokeWidth="1.8">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {notificationsCount > 0 && <span className={styles.notifDot} />}
        </div>

        <button
          className={styles.btnProfile}
          onClick={onOpenProfile}
          title="Meu perfil"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
          </svg>
          <span>{userName.split(' ')[0] || 'Perfil'}</span>
        </button>

        <button className={styles.btnPrimary} onClick={onNewPatient}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Novo Paciente</span>
        </button>
      </div>
    </header>
  );
}

interface DashboardKPIsProps {
  todayAppointments: number;
  isLoadingPatients: boolean;
  patientsLength: number;
  activePatients: number;
  financialTotalMonth: number;
  pendingTotal: number;
  recoveryRate: string;
  pendingEvolutionsCount: number;
  birthdaysOfMonth: any[];
}

function DashboardKPIs({
  todayAppointments,
  isLoadingPatients,
  patientsLength,
  activePatients,
  financialTotalMonth,
  pendingTotal,
  recoveryRate,
  pendingEvolutionsCount,
  birthdaysOfMonth,
}: DashboardKPIsProps) {
  return (
    <div className={styles.kpiGrid}>
      <div className={`${styles.card} ${styles.animFadeUp} ${styles.delay1}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span className={styles.kpiTitle}>Consultas Hoje</span>
          <div className={styles.kpiIcon} style={{ color: '#AD6D15', background: '#F5ECD8' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
        </div>
        <div className={styles.kpiValue}>{todayAppointments}</div>
        <div className={styles.kpiTitle} style={{ color: '#2E9E5B' }}>confirmadas</div>
      </div>

      <div className={`${styles.card} ${styles.animFadeUp} ${styles.delay2}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span className={styles.kpiTitle}>Pacientes Ativos</span>
          <div className={styles.kpiIcon} style={{ color: '#2E9E5B', background: '#E8F4EC' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
        </div>
        <div className={styles.kpiValue}>
          {isLoadingPatients ? <span className={styles.loadingPulse}>…</span> : patientsLength}
        </div>
        <div className={styles.kpiTitle} style={{ color: '#2E9E5B' }}>{activePatients} ativos</div>
      </div>

      <div className={`${styles.card} ${styles.animFadeUp} ${styles.delay3}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span className={styles.kpiTitle}>Faturamento Mensal</span>
          <div className={styles.kpiIcon} style={{ color: '#5A3E20', background: '#E8D9BE' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
        </div>
        <div className={styles.kpiValue}>R$ {financialTotalMonth.toLocaleString('pt-BR')}</div>
        <div className={styles.kpiTitle} style={{ color: '#C45A35' }}>R$ {pendingTotal.toLocaleString('pt-BR')} pendente</div>
      </div>

      <div className={`${styles.card} ${styles.animFadeUp} ${styles.delay4}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span className={styles.kpiTitle}>Taxa de Recebimento</span>
          <div className={styles.kpiIcon} style={{ color: '#2E9E5B', background: '#E8F4EC' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><polyline points="16 12 12 8 8 12" /><line x1="12" y1="16" x2="12" y2="8" />
            </svg>
          </div>
        </div>
        <div className={styles.kpiValue}>{recoveryRate}%</div>
        <div className={styles.kpiTitle}>do total faturado</div>
      </div>

      <div className={`${styles.card} ${styles.animFadeUp} ${styles.delay4}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span className={styles.kpiTitle}>Evoluções Pendentes</span>
          <div className={styles.kpiIcon} style={{ color: '#C45A35', background: '#FEF0EC' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
            </svg>
          </div>
        </div>
        <div className={styles.kpiValue}>{pendingEvolutionsCount}</div>
        <div className={styles.kpiTitle} style={{ color: '#C45A35' }}>pacientes ativos sem evolução recente</div>
      </div>

      <div className={`${styles.card} ${styles.animFadeUp} ${styles.delay4}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span className={styles.kpiTitle}>Aniversariantes do Mês</span>
          <div className={styles.kpiIcon} style={{ color: '#AD6D15', background: '#F5ECD8' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 12 20 22 4 22 4 12" />
              <rect x="2" y="7" width="20" height="5" />
              <line x1="12" y1="22" x2="12" y2="7" />
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
            </svg>
          </div>
        </div>
        <div className={styles.kpiValue}>{birthdaysOfMonth.length}</div>
        <div className={styles.kpiTitle} style={{ color: '#9A7040' }}>
          {birthdaysOfMonth.length > 0 ? birthdaysOfMonth.slice(0, 3).map(p => p.name.split(' ')[0]).join(', ') + (birthdaysOfMonth.length > 3 ? ` e +${birthdaysOfMonth.length - 3}` : '') : 'Nenhum neste mês'}
        </div>
      </div>
    </div>
  );
}

interface DashboardAgendaCardProps {
  appointments: Appointment[];
  patients: Patient[];
  onViewAll: () => void;
  onNewNote: (patient: Patient) => void;
}

function DashboardAgendaCard({ appointments, patients, onViewAll, onNewNote }: DashboardAgendaCardProps) {
  return (
    <div className={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <h3 className={styles.cardTitle} style={{ margin: 0 }}>Agenda de Hoje</h3>
        <button className={styles.btnAction} onClick={onViewAll}>Ver completa</button>
      </div>
      {appointments.map((apt: Appointment) => {
        const aptPatient = patients.find(p => p.id === apt.patientId) as any;
        let isBirthday = false;
        if (aptPatient?.birthDate) {
          const today = new Date();
          const [y, m, d] = aptPatient.birthDate.split('T')[0].split('-');
          if (parseInt(m, 10) === today.getMonth() + 1 && parseInt(d, 10) === today.getDate()) {
            isBirthday = true;
          }
        }
        return (
          <div key={apt.id} className={styles.sessionItem}>
            <div className={styles.sessionLeft}>
              <div className={styles.sessionTime}>{apt.time}</div>
              <div className={styles.sessionBar} style={{ background: apt.type === 'online' ? '#2E9E5B' : '#AD6D15' }} />
              <div>
                <div className={styles.sessionName} style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {apt.patientName}
                  {isBirthday && <span title="Aniversariante do dia!">🎉</span>}
                </div>
                <div className={styles.sessionType} style={{ fontSize: 11, fontWeight: 500 }}>{apt.type === 'online' ? '🖥 Teleconsulta' : '🏥 Presencial'}</div>
              </div>
            </div>
            <button className={styles.btnAction} style={{ fontSize: 10, padding: '6px 10px' }}
              onClick={() => { if (aptPatient) onNewNote(aptPatient); }}>
              + Evolução
            </button>
          </div>
        );
      })}
    </div>
  );
}

interface DashboardRecentNotesCardProps {
  notes: ClinicalNote[];
  notesLoading: boolean;
  onViewAll: () => void;
}

function DashboardRecentNotesCard({ notes, notesLoading, onViewAll }: DashboardRecentNotesCardProps) {
  return (
    <div className={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <h3 className={styles.cardTitle} style={{ margin: 0 }}>Evoluções Recentes</h3>
        <button className={styles.btnAction} onClick={onViewAll}>Ver todas</button>
      </div>
      {notesLoading ? (
        <p className={styles.loadingPulse}>Carregando…</p>
      ) : notes.length === 0 ? (
        <div className={styles.emptyState} style={{ padding: '32px 0' }}>
          <p style={{ color: '#9A7040', fontSize: 13 }}>Nenhuma evolução registrada ainda.</p>
        </div>
      ) : (
        notes.slice(0, 5).map(note => (
          <div key={note.id} className={styles.sessionItem}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#2D1F0A' }}>{note.patientName}</div>
              <div style={{ fontSize: 11, color: '#9A7040', marginTop: 2 }}>
                {new Date(note.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                {note.mood && ` · ${note.mood}`}
              </div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: '#F5ECD8', color: '#AD6D15' }}>{note.mood ?? '—'}</span>
          </div>
        ))
      )}
    </div>
  );
}

interface DashboardRecentPatientsCardProps {
  patients: Patient[];
  isLoadingPatients: boolean;
  notesForPatient: (id: string) => ClinicalNote[];
  onViewAll: () => void;
  onNewNote: (patient: Patient) => void;
  onOpenPatientModal: (patient: Patient) => void;
}

function DashboardRecentPatientsCard({ patients, isLoadingPatients, notesForPatient, onViewAll, onNewNote, onOpenPatientModal }: DashboardRecentPatientsCardProps) {
  return (
    <div className={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <h3 className={styles.cardTitle} style={{ margin: 0 }}>Pacientes Recentes</h3>
        <button className={styles.btnAction} onClick={onViewAll}>Ver todos</button>
      </div>
      {isLoadingPatients ? (
        <p className={styles.loadingPulse}>Carregando…</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr><th>Paciente</th><th>Status</th><th>Evoluções</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {patients.slice(0, 6).map((pt: any) => (
                <tr key={pt.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#2D1F0A', fontSize: 14 }}>{pt.name}</div>
                    <div style={{ fontSize: 11, color: '#9A7040' }}>{pt.therapyType || 'Terapia'}</div>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${pt.status === 'active' ? styles.badgeActive : pt.status === 'waiting' ? styles.badgeWaiting : styles.badgeInactive}`}>
                      {pt.status === 'active' ? 'Ativo' : pt.status === 'waiting' ? 'Aguardando' : 'Inativo'}
                    </span>
                  </td>
                  <td><span style={{ fontSize: 13, color: '#9A7040' }}>{notesForPatient(pt.id).length} registros</span></td>
                  <td>
                    <div className={styles.tableActions}>
                      <button className={styles.btnAction} style={{ padding: '6px 10px', fontSize: 10 }} onClick={() => onNewNote(pt)}>+ Evolução</button>
                      <button className={styles.btnPrimary} style={{ padding: '6px 10px', fontSize: 10 }} onClick={() => onOpenPatientModal(pt)}>Prontuário</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

interface DashboardViewProps {
  onLogout?: () => void;
  userId: string;
}

export default function DashboardView({ onLogout, userId }: DashboardViewProps) {
  const dash = useDashboard();
  const appointments: Appointment[] = Array.isArray(dash.appointments) ? dash.appointments : [];
  const patients: Patient[]         = Array.isArray(dash.patients) ? dash.patients : [];

  const [showProfile, setShowProfile] = useState(false);

  const handleSelectAppwritePatient = (ap: AppwritePatient) => {
    const p = {
      id: ap.$id, name: ap.name, phone: ap.phone, email: ap.email,
      status: ap.status as any, nextSession: ap.nextSession,
      pendingAmount: ap.pendingAmount, lastSession: ap.lastSession,
      therapyType: ap.therapyType,
      sessionValue: ap.sessionValue,
      frequency: ap.frequency,
      birthDate: ap.birthDate,
    } as unknown as Patient;
    dash.openPatientModal(p);
  };

  const handleTabChange = (id: string) => {
    dash.setActiveTab(id);
    dash.setMobileMenuOpen(false);
  };

  const financialTotalMonth = useMemo(() => {
    return patients.reduce((acc, p: any) => {
      if (p.status !== 'active') return acc;
      const value = p.sessionValue || 0;
      let multiplier = 0;
      if (p.frequency === 'Semanal') multiplier = 4;
      else if (p.frequency === 'Quinzenal') multiplier = 2;
      else if (p.frequency === 'Mensal') multiplier = 1;
      return acc + (value * multiplier);
    }, 0);
  }, [patients]);

  const birthdaysOfMonth = useMemo(() => {
    const currentMonth = new Date().getMonth() + 1;
    return patients.filter((p: any) => {
      if (!p.birthDate) return false;
      const [year, month] = p.birthDate.split('T')[0].split('-');
      if (!month) return false;
      return parseInt(month, 10) === currentMonth;
    });
  }, [patients]);

  const financialReceived   = Math.max(0, financialTotalMonth - dash.pendingTotal);
  const recoveryRate        = financialTotalMonth > 0
    ? ((financialReceived / financialTotalMonth) * 100).toFixed(1)
    : '0.0';

  const pendingEvolutionsCount = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return patients.filter(p => {
      if (p.status !== 'active') return false;
      const patientNotes = dash.notes.filter(n => n.patientId === p.id);
      if (patientNotes.length === 0) return true;
      const lastNoteDate = new Date(Math.max(...patientNotes.map(n => new Date(n.date).getTime())));
      return lastNoteDate < oneWeekAgo;
    }).length;
  }, [patients, dash.notes]);

  const myNotes = useMemo(() => {
    // Filtra as notas para exibir apenas as dos pacientes que o usuário atual possui
    return dash.notes.filter(note => patients.some(p => p.id === note.patientId));
  }, [dash.notes, patients]);

  if (showProfile) {
    return <ProfilePage onBack={() => setShowProfile(false)} />;
  }

  const activeTabLabel = allMenuItems.find(m => m.id === dash.activeTab)?.label ?? '';

  return (
    <div className={styles.container}>

      {dash.showPatientModal && dash.selectedPatient && (
        <PatientModal
          patient={dash.selectedPatient}
          notes={dash.notes}
          onClose={() => dash.setShowPatientModal(false)}
          onNewNote={() => dash.openNewNoteModal(dash.selectedPatient!)}
          onEditNote={dash.openEditNoteModal}
          onDeleteNote={dash.handleDeleteNote}
        />
      )}

      {dash.showNoteModal && dash.selectedPatient && (
        <EvolutionModal
          patientId={dash.selectedPatient.id}
          patientName={dash.selectedPatient.name}
          note={dash.editingNote}
          onClose={dash.closeModals}
          onSave={(note) => dash.handleSaveNote({ id: dash.editingNote?.id ?? '', ...note })}
        />
      )}

      <div className={styles.notificationContainer}>
        {dash.notifications.map(n => (
          <div key={n.id} className={`${styles.notificationItem} ${n.type === 'success' ? styles.notifSuccess : n.type === 'error' ? styles.notifError : styles.notifInfo}`}>
            <span>{n.text}</span>
            <button className={styles.notifClose} onClick={() => dash.removeNotification(n.id)}>×</button>
          </div>
        ))}
      </div>

      <div
        className={`${styles.overlay} ${dash.isMobileMenuOpen ? styles.overlayOpen : ''}`}
        onClick={() => dash.setMobileMenuOpen(false)}
      />

      <Sidebar
        activeTab={dash.activeTab}
        onTabChange={handleTabChange}
        isOpen={dash.isMobileMenuOpen}
        onClose={() => dash.setMobileMenuOpen(false)}
        userName={dash.userName}
        userInitials={dash.userInitials}
        userCrp={dash.userCrp}
        userSpecialty={dash.userSpecialty}
        onLogout={onLogout}
        onProfileClick={() => setShowProfile(true)}
        menuCategories={MENU_CATEGORIES}
      />

      <div className={styles.main}>

        <DashboardHeader
          activeTab={dash.activeTab}
          activeTabLabel={activeTabLabel}
          currentDate={dash.currentDate}
          notificationsCount={dash.notifications.length}
          userName={dash.userName}
          onOpenMobileMenu={() => dash.setMobileMenuOpen(true)}
          onOpenProfile={() => setShowProfile(true)}
          onNewPatient={() => handleTabChange('pacientes')}
        />

        <main className={styles.content}>

          <AnimatePresence mode="wait">
            <motion.div
              key={dash.activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={{ flex: 1, height: '100%' }}
            >
              {dash.activeTab === 'dashboard' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <DashboardKPIs
                    todayAppointments={dash.todayAppointments}
                    isLoadingPatients={dash.isLoadingPatients}
                    patientsLength={dash.patients.length}
                    activePatients={dash.activePatients}
                    financialTotalMonth={financialTotalMonth}
                    pendingTotal={dash.pendingTotal}
                    recoveryRate={recoveryRate}
                    pendingEvolutionsCount={pendingEvolutionsCount}
                    birthdaysOfMonth={birthdaysOfMonth}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
                    <DashboardAgendaCard
                      appointments={appointments}
                      patients={patients}
                      onViewAll={() => handleTabChange('agenda')}
                      onNewNote={dash.openNewNoteModal}
                    />

                    <DashboardRecentNotesCard
                      notes={myNotes}
                      notesLoading={dash.notesLoading}
                      onViewAll={() => handleTabChange('evolucao')}
                    />
                  </div>

                  <DashboardRecentPatientsCard
                    patients={dash.patients}
                    isLoadingPatients={dash.isLoadingPatients}
                    notesForPatient={dash.notesForPatient}
                    onViewAll={() => handleTabChange('pacientes')}
                    onNewNote={dash.openNewNoteModal}
                    onOpenPatientModal={dash.openPatientModal}
                  />
                </div>
              )}

              {dash.activeTab === 'evolucao' && (
                <EvolucaoTab
                  patients={dash.patients}
                  notes={dash.notes}
                  notesLoading={dash.notesLoading}
                  onNewNote={dash.openNewNoteModal}
                  onEditNote={dash.openEditNoteModal}
                  onDeleteNote={dash.handleDeleteNote}
                />
              )}

              {dash.activeTab === 'pacientes' && (
                <PatientsTab userId={userId} onSelectPatient={handleSelectAppwritePatient} />
              )}

              {dash.activeTab === 'resumo-fin' && (
                <ResumoFinanceiroTab patients={dash.patients} pendingTotal={dash.pendingTotal} financialTotalMonth={financialTotalMonth} />
              )}

              {dash.activeTab === 'agenda' && (
                <AgendaTab
                  userId={userId}
                  patients={dash.patients.map(p => ({
                    id: p.id,
                    name: p.name,
                    therapyType: p.therapyType,
                  }))}
                  appointments={appointments}
                />
              )}

              {dash.activeTab === 'laudos' && (
                <DocumentosTab patients={dash.patients} userName={dash.userName} userCrp={dash.userCrp} />
              )}

              {dash.activeTab === 'prontuarios' && (
                <ProntuariosTab
                  patients={dash.patients}
                  notes={dash.notes}
                  notesLoading={dash.notesLoading}
                  onNewNote={dash.openNewNoteModal}
                  onEditNote={dash.openEditNoteModal}
                  onDeleteNote={dash.handleDeleteNote}
                  userName={dash.userName}
                  userCrp={dash.userCrp}
                />
              )}

              {dash.activeTab === 'relatorios' && <RelatoriosTab patients={dash.patients} appointments={appointments} />}
              {dash.activeTab === 'configuracoes' && <ConfiguracoesTab />}
              {dash.activeTab === 'sala-espera' && <SalaEsperaTab />}
              {dash.activeTab === 'teleconsulta' && <TeleconsultaTab />}
              {dash.activeTab === 'anamnese' && <AnamneseTab patients={dash.patients} />}
              {dash.activeTab === 'testes' && <TestesTab patients={dash.patients} />}
              {dash.activeTab === 'diario' && <DiarioTab patients={dash.patients} />}
              {dash.activeTab === 'portal' && <PortalTab />}
              {dash.activeTab === 'lista-espera' && <ListaEsperaTab />}
              {dash.activeTab === 'lembretes' && <LembretesTab />}
              {dash.activeTab === 'assinatura' && <AssinaturaTab />}
              {dash.activeTab === 'biblioteca' && <BibliotecaTab />}
              {dash.activeTab === 'recibos' && <RecibosTab patients={dash.patients} />}
              {dash.activeTab === 'cobrancas' && <CobrancasTab patients={dash.patients} />}
              {dash.activeTab === 'supervisao' && <SupervisaoTab />}

              {!['dashboard', 'pacientes', 'resumo-fin', 'evolucao', 'prontuarios', 'agenda', 'laudos', 'relatorios', 'configuracoes', 'sala-espera', 'teleconsulta', 'anamnese', 'testes', 'diario', 'portal', 'lista-espera', 'lembretes', 'assinatura', 'biblioteca', 'recibos', 'cobrancas', 'supervisao'].includes(dash.activeTab) && (
                <div className={styles.card}>
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#AD6D15" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        {allMenuItems.find(m => m.id === dash.activeTab)?.icon}
                      </svg>
                    </div>
                    <h3 className={styles.emptyTitle}>{activeTabLabel}</h3>
                    <p className={styles.emptyText}>Este módulo está em desenvolvimento e em breve estará disponível.</p>
                    <button className={styles.btnAction} style={{ marginTop: 24 }} onClick={() => handleTabChange('dashboard')}>
                      Voltar ao Painel
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}