'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './EvolutionModal.module.css';

/* ── Types ── */
export interface Patient {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'active' | 'waiting' | 'inactive';
  nextSession: string;
  pendingAmount: number;
  lastSession: string;
  therapyType: string;
  evolution?: string[];
}

export interface ClinicalNote {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  content: string;
  mood?: string;
  topics?: string[];
  intervention?: string;
  nextSteps?: string;
  sessionNumber?: number;
  duration?: number;
  isTelehealth?: boolean;
  status: 'draft' | 'completed';
}

/* ── Constants ── */
const EMOTION_OPTIONS = [
  'Estável', 'Calmo', 'Ansioso', 'Irritado', 'Triste', 'Eufórico',
  'Agressivo', 'Apático', 'Angustiado', 'Deprimido', 'Esperançoso', 'Motivado',
];

const THERAPY_INTERVENTIONS = [
  'TCC - Reestruturação Cognitiva',
  'TCC - Ativação Comportamental',
  'Psicanálise - Associação Livre',
  'Humanista - Escuta Empática',
  'Gestalt - Aqui e Agora',
  'EMDR - Dessensibilização',
  'Mindfulness',
  'Terapia de Aceitação e Compromisso (ACT)',
  'Terapia de Casal',
  'Terapia Familiar',
  'Psicoeducação',
  'Técnicas de Relaxamento',
  'Análise Funcional',
  'Exposição Gradual',
];

/* ── Sub-component: PatientModal ── */
interface PatientModalProps {
  patient: Patient;
  notes: ClinicalNote[];
  onClose: () => void;
  onNewNote: () => void;
  onEditNote: (note: ClinicalNote) => void;
  onDeleteNote: (noteId: string) => void;
}

export function PatientModal({
  patient,
  notes,
  onClose,
  onNewNote,
  onEditNote,
  onDeleteNote,
}: PatientModalProps) {
  const patientNotes = notes.filter(n => n.patientId === patient.id);

  const statusLabel: Record<string, string> = {
    active: 'Em tratamento',
    waiting: 'Aguardando',
    inactive: 'Inativo',
  };

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        style={{ maxWidth: 720 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h3 className={styles.patientName}>{patient.name}</h3>
            <p className={styles.patientMeta}>
              {patient.therapyType || 'Terapia não definida'}
              {' · '}
              {statusLabel[patient.status] ?? patient.status}
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Info grid */}
          <div className={styles.infoGrid}>
            <div>
              <div className={styles.infoLabel}>Contato</div>
              <div className={styles.infoValue}>{patient.phone || 'Não informado'}</div>
              <div className={styles.infoSub}>{patient.email || '—'}</div>
            </div>
            <div>
              <div className={styles.infoLabel}>Última sessão</div>
              <div className={styles.infoValue}>
                {patient.lastSession
                  ? new Date(patient.lastSession).toLocaleDateString('pt-BR')
                  : '—'}
              </div>
            </div>
            <div>
              <div className={styles.infoLabel}>Próxima sessão</div>
              <div className={styles.infoValue}>
                {patient.nextSession
                  ? new Date(patient.nextSession).toLocaleDateString('pt-BR')
                  : 'Não agendada'}
              </div>
            </div>
            <div>
              <div className={styles.infoLabel}>Pendente</div>
              <div
                className={styles.infoValue}
                style={{ color: patient.pendingAmount > 0 ? '#C45A35' : '#2E9E5B' }}
              >
                R$ {(patient.pendingAmount || 0).toLocaleString('pt-BR')}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className={styles.noteListHeader}>
            <span className={styles.noteListTitle}>
              Evoluções Clínicas ({patientNotes.length})
            </span>
            <button className={styles.btnAction} onClick={onNewNote}>
              + Nova Evolução
            </button>
          </div>

          <div className={styles.noteList}>
            {patientNotes.length === 0 ? (
              <div className={styles.emptyNotes}>
                <div className={styles.emptyNotesIcon}>📋</div>
                <p>Nenhuma evolução registrada ainda.</p>
              </div>
            ) : (
              patientNotes.map(note => (
                <div key={note.id} className={styles.noteCard}>
                  <div className={styles.noteCardHeader}>
                    <div>
                      <div className={styles.noteDate}>
                        {new Date(note.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                        {note.sessionNumber && (
                          <span style={{ fontWeight: 400, color: '#9A7040', marginLeft: 8, fontSize: 12 }}>
                            Sessão #{note.sessionNumber}
                          </span>
                        )}
                        {note.isTelehealth !== undefined && (
                          <span style={{ marginLeft: 8, fontSize: 11, color: note.isTelehealth ? '#2E9E5B' : '#AD6D15' }}>
                            {note.isTelehealth ? '🖥 Teleconsulta' : '🏥 Presencial'}
                          </span>
                        )}
                      </div>
                      <div className={styles.noteTagRow}>
                        {note.mood && (
                          <span className={styles.noteMoodBadge}>{note.mood}</span>
                        )}
                        {note.topics?.slice(0, 3).map(t => (
                          <span key={t} className={styles.noteTopicHash}>#{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className={styles.noteActions}>
                      <button className={styles.btnEdit} onClick={() => onEditNote(note)}>
                        ✏ Editar
                      </button>
                      <button
                        className={styles.btnDeleteNote}
                        onClick={() => onDeleteNote(note.id)}
                      >
                        🗑 Excluir
                      </button>
                    </div>
                  </div>

                  <div className={styles.noteContent}>
                    {note.content.length > 250
                      ? note.content.substring(0, 250) + '…'
                      : note.content}
                  </div>

                  {note.intervention && (
                    <div className={styles.noteNextSteps}>
                      <strong>Intervenção:</strong> {note.intervention}
                    </div>
                  )}
                  {note.nextSteps && (
                    <div className={styles.noteNextSteps}>
                      <strong>Próximos passos:</strong> {note.nextSteps}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.btnSecondary} onClick={onClose}>Fechar</button>
          <button className={styles.btnPrimary} onClick={onNewNote}>
            + Adicionar Evolução
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── Main: EvolutionModal ── */
interface EvolutionModalProps {
  patient: Patient;
  editingNote?: ClinicalNote | null;
  onClose: () => void;
  onSave: (noteData: Omit<ClinicalNote, 'patientName' | 'status'>) => Promise<void>;
}

export function EvolutionModal({
  patient,
  editingNote,
  onClose,
  onSave,
}: EvolutionModalProps) {
  const today = new Date().toISOString().split('T')[0];

  const [noteDate, setNoteDate]         = useState(editingNote?.date ?? today);
  const [mood, setMood]                 = useState(editingNote?.mood ?? 'Estável');
  const [content, setContent]           = useState(editingNote?.content ?? '');
  const [topics, setTopics]             = useState<string[]>(editingNote?.topics ?? []);
  const [currentTopic, setCurrentTopic] = useState('');
  const [intervention, setIntervention] = useState(editingNote?.intervention ?? '');
  const [nextSteps, setNextSteps]       = useState(editingNote?.nextSteps ?? '');
  const [sessionNum, setSessionNum]     = useState(editingNote?.sessionNumber ?? 1);
  const [duration, setDuration]         = useState(editingNote?.duration ?? 50);
  const [isTelehealth, setIsTelehealth] = useState(editingNote?.isTelehealth ?? false);
  const [saving, setSaving]             = useState(false);

  // sync when editingNote changes
  useEffect(() => {
    if (editingNote) {
      setNoteDate(editingNote.date);
      setMood(editingNote.mood ?? 'Estável');
      setContent(editingNote.content);
      setTopics(editingNote.topics ?? []);
      setIntervention(editingNote.intervention ?? '');
      setNextSteps(editingNote.nextSteps ?? '');
      setSessionNum(editingNote.sessionNumber ?? 1);
      setDuration(editingNote.duration ?? 50);
      setIsTelehealth(editingNote.isTelehealth ?? false);
    }
  }, [editingNote]);

  const addTopic = () => {
    const t = currentTopic.trim();
    if (t && !topics.includes(t)) {
      setTopics([...topics, t]);
      setCurrentTopic('');
    }
  };

  const removeTopic = (t: string) => setTopics(topics.filter(x => x !== t));

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      await onSave({
        id: editingNote?.id ?? Date.now().toString(),
        patientId: patient.id,
        date: noteDate,
        content,
        mood,
        topics,
        intervention,
        nextSteps,
        sessionNumber: sessionNum,
        duration,
        isTelehealth,
      });
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h3 className={styles.title}>
              {editingNote ? 'Editar Evolução' : 'Nova Evolução Clínica'}
            </h3>
            <p className={styles.subtitle}>{patient.name}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Row 1: Date + Duration */}
          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className={styles.labelIcon}>📅</span>Data da Sessão
              </label>
              <input
                type="date"
                className={styles.input}
                value={noteDate}
                onChange={e => setNoteDate(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className={styles.labelIcon}>⏱</span>Duração
              </label>
              <select
                className={styles.select}
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
              >
                <option value={30}>30 minutos</option>
                <option value={45}>45 minutos</option>
                <option value={50}>50 minutos</option>
                <option value={60}>60 minutos</option>
                <option value={90}>90 minutos</option>
              </select>
            </div>
          </div>

          {/* Row 2: Session # + Modality */}
          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className={styles.labelIcon}>🔢</span>Número da Sessão
              </label>
              <input
                type="number"
                min={1}
                className={styles.input}
                value={sessionNum}
                onChange={e => setSessionNum(Number(e.target.value))}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className={styles.labelIcon}>💻</span>Modalidade
              </label>
              <div className={styles.modalityRow}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    checked={!isTelehealth}
                    onChange={() => setIsTelehealth(false)}
                  />
                  🏥 Presencial
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    checked={isTelehealth}
                    onChange={() => setIsTelehealth(true)}
                  />
                  🖥 Teleconsulta
                </label>
              </div>
            </div>
          </div>

          {/* Mood */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.labelIcon}>😊</span>Estado Emocional
            </label>
            <div className={styles.moodGrid}>
              {EMOTION_OPTIONS.map(m => (
                <button
                  key={m}
                  type="button"
                  className={`${styles.moodBtn} ${mood === m ? styles.moodSelected : ''}`}
                  onClick={() => setMood(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Topics */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.labelIcon}>🏷</span>Tópicos Abordados
            </label>
            <div className={styles.topicRow}>
              <input
                type="text"
                className={styles.input}
                placeholder="Ex: Ansiedade, Autoestima, Relacionamentos…"
                value={currentTopic}
                onChange={e => setCurrentTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTopic())}
              />
              <button className={styles.btnAction} onClick={addTopic} type="button">
                Adicionar
              </button>
            </div>
            {topics.length > 0 && (
              <div className={styles.topicList}>
                {topics.map(t => (
                  <span key={t} className={styles.topicTag}>
                    {t}
                    <button className={styles.topicRemove} onClick={() => removeTopic(t)} type="button">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Intervention */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.labelIcon}>🛠</span>Intervenção Utilizada
            </label>
            <select
              className={styles.select}
              value={intervention}
              onChange={e => setIntervention(e.target.value)}
            >
              <option value="">Selecione uma intervenção…</option>
              {THERAPY_INTERVENTIONS.map(i => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.labelIcon}>📝</span>Evolução da Sessão
            </label>
            <textarea
              className={styles.textarea}
              rows={7}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={`Descreva:\n• Queixa principal do paciente\n• Progressos observados\n• Resistências ou desafios\n• Insights importantes\n• Observações da aliança terapêutica`}
            />
          </div>

          {/* Next steps */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span className={styles.labelIcon}>📋</span>Encaminhamentos e Próximos Passos
            </label>
            <textarea
              className={styles.textarea}
              rows={3}
              value={nextSteps}
              onChange={e => setNextSteps(e.target.value)}
              placeholder="Tarefas de casa, agendamento, encaminhamentos, etc."
            />
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button
            className={styles.btnSecondary}
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            className={styles.btnPrimary}
            onClick={handleSave}
            disabled={saving || !content.trim()}
          >
            {saving ? (
              <>
                <div className={styles.spinner} />
                Salvando…
              </>
            ) : (
              editingNote ? 'Atualizar Evolução' : 'Salvar Evolução'
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}