'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './EvolutionModal.module.css';

export interface ClinicalNote {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  content: string;
  mood: string;
  topics: string[];
  intervention: string;
  nextSteps: string;
  sessionNumber?: number;
  duration?: number;
  isTelehealth: boolean;
  status: 'completed' | 'draft';
}

interface EvolutionModalProps {
  patientId: string;
  patientName: string;
  note?: ClinicalNote | null;           
  lastSessionNumber?: number;          
 
  onSave: (note: Omit<ClinicalNote, 'id' | 'patientName' | 'status'> & { id?: string }) => Promise<void>;
  onClose: () => void;
}

const MOODS = ['Muito bem', 'Bem', 'Estável', 'Ansioso(a)', 'Triste', 'Agitado(a)', 'Em crise'];
const TOPIC_SUGGESTIONS = [
  'Ansiedade', 'Depressão', 'Autoestima', 'Relacionamentos', 'Família',
  'Trabalho', 'Luto', 'Trauma', 'Fobia', 'Sono', 'Alimentação', 'Vínculos',
  'Identidade', 'Limites', 'Raiva', 'Culpa', 'Medo',
];

type FormState = {
  date: string;
  content: string;
  mood: string;
  topics: string[];
  intervention: string;
  nextSteps: string;
  sessionNumber: string;
  duration: string;
  isTelehealth: boolean;
};

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function SectionLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
      textTransform: 'uppercase', color: '#9A7040',
      marginBottom: 14, marginTop: 24,
      paddingBottom: 8, borderBottom: '1px solid #F0E8D8',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      {icon}{children}
    </div>
  );
}

function Field({
  label, required, hint, children,
}: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{
        fontSize: 11, fontWeight: 600, color: '#5A3E20',
        textTransform: 'uppercase', letterSpacing: '0.06em',
        display: 'flex', alignItems: 'center', gap: 4,
      }}>
        {label}
        {required && <span style={{ color: '#C45A35', fontSize: 13 }}>*</span>}
      </label>
      {children}
      {hint && <span style={{ fontSize: 11, color: '#9A7040' }}>{hint}</span>}
    </div>
  );
}

const inp = (hasError?: boolean): React.CSSProperties => ({
  padding: '10px 12px',
  border: `1.5px solid ${hasError ? '#C45A35' : '#E8D9BE'}`,
  borderRadius: 8,
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 14,
  color: '#2D1F0A',
  background: '#FDFAF5',
  outline: 'none',
  width: '100%',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  boxSizing: 'border-box',
});

export default function EvolutionModal({
  patientId,
  patientName,
  note,
  lastSessionNumber = 0,
  onSave,
  onClose,
}: EvolutionModalProps) {
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [topicInput, setTopicInput] = useState('');

  const [form, setForm] = useState<FormState>({
    date: todayISO(),
    content: '',
    mood: 'Estável',
    topics: [],
    intervention: '',
    nextSteps: '',
    sessionNumber: String(lastSessionNumber + 1),
    duration: '50',
    isTelehealth: false,
  });

  useEffect(() => {
    setMounted(true);
    if (note) {
      setForm({
        date: note.date || todayISO(),
        content: note.content || '',
        mood: note.mood || 'Estável',
        topics: note.topics || [],
        intervention: note.intervention || '',
        nextSteps: note.nextSteps || '',
        sessionNumber: String(note.sessionNumber ?? lastSessionNumber + 1),
        duration: String(note.duration ?? 50),
        isTelehealth: note.isTelehealth ?? false,
      });
    }
  }, [note, lastSessionNumber]);

  const set = (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }));

  const addTopic = (topic: string) => {
    const t = topic.trim();
    if (!t || form.topics.includes(t)) return;
    setForm(prev => ({ ...prev, topics: [...prev.topics, t] }));
    setTopicInput('');
  };

  const removeTopic = (topic: string) =>
    setForm(prev => ({ ...prev, topics: prev.topics.filter(x => x !== topic) }));

  const validate = () => {
    const e: typeof errors = {};
    if (!form.date) e.date = 'Data obrigatória';
    if (!form.content.trim()) e.content = 'Evolução obrigatória';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({
        id: note?.id, 
        patientId,
        date: form.date,
        content: form.content.trim(),
        mood: form.mood,
        topics: form.topics,
        intervention: form.intervention.trim(),
        nextSteps: form.nextSteps.trim(),
        sessionNumber: parseInt(form.sessionNumber, 10) || 1,
        duration: parseInt(form.duration, 10) || 50,
        isTelehealth: form.isTelehealth,
      });
      onClose();
    } catch (err: any) {
      alert('Erro ao salvar evolução: ' + (err?.message ?? err));
    } finally {
      setSaving(false);
    }
  };

  if (!mounted) return null;

  const content = (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h2 className={styles.title}>
              {note ? 'Editar Evolução' : 'Nova Evolução'}
            </h2>
            <div className={styles.subtitle}>{patientName}</div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">✕</button>
        </div>

        {/* ── Body ── */}
        <div className={styles.body}>

          {/* Sessão + Data */}
          <SectionLabel icon={
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#AD6D15" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="9" /><path d="M12 6v6l4 2" />
            </svg>
          }>
            Identificação da sessão
          </SectionLabel>
          <div className={styles.grid2}>
            <Field label="Data" required>
              <input type="date" className={styles.input} style={errors.date ? { borderColor: '#C45A35' } : {}} value={form.date} onChange={set('date')} />
              {errors.date && <span style={{ fontSize: 11, color: '#C45A35' }}>{errors.date}</span>}
            </Field>
            <Field label="Nº da sessão">
              <input type="number" min={1} className={styles.input} value={form.sessionNumber} onChange={set('sessionNumber')} />
            </Field>
            <Field label="Duração (min)">
              <input type="number" min={1} className={styles.input} value={form.duration} onChange={set('duration')} />
            </Field>
          </div>

          {/* Modalidade telehealth */}
          <div className={styles.modalityRow}>
            <label className={styles.radioLabel}>
              <div
                onClick={() => setForm(prev => ({ ...prev, isTelehealth: !prev.isTelehealth }))}
                style={{
                  width: 40, height: 22, borderRadius: 11,
                  background: form.isTelehealth ? '#EFBB55' : '#E8D9BE',
                  position: 'relative', transition: 'background 0.2s', cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <div style={{
                  position: 'absolute', top: 3,
                  left: form.isTelehealth ? 20 : 3,
                  width: 16, height: 16, borderRadius: '50%',
                  background: form.isTelehealth ? '#1A1008' : 'white',
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                }} />
              </div>
              <span>Sessão por teleconsulta (online)</span>
            </label>
          </div>

          {/* Humor */}
          <SectionLabel icon={
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#AD6D15" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          }>
            Estado emocional do paciente
          </SectionLabel>
          <div className={styles.moodGrid}>
            {MOODS.map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, mood: m }))}
                className={`${styles.moodBtn} ${form.mood === m ? styles.moodSelected : ''}`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Tópicos */}
          <SectionLabel icon={
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#AD6D15" strokeWidth="2.5" strokeLinecap="round">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <circle cx="3" cy="6" r="1" fill="#AD6D15" />
              <circle cx="3" cy="12" r="1" fill="#AD6D15" />
              <circle cx="3" cy="18" r="1" fill="#AD6D15" />
            </svg>
          }>
            Tópicos abordados
          </SectionLabel>

          {/* Tags selecionadas */}
          {form.topics.length > 0 && (
            <div className={styles.topicList} style={{ marginBottom: 10 }}>
              {form.topics.map(t => (
                <span key={t} className={styles.topicTag}>
                  {t}
                  <button type="button" onClick={() => removeTopic(t)} className={styles.topicRemove}>
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Input customizado */}
          <div className={styles.topicRow}>
            <input
              className={styles.input}
              placeholder="Adicionar tópico personalizado..."
              value={topicInput}
              onChange={e => setTopicInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTopic(topicInput); } }}
            />
            <button type="button" onClick={() => addTopic(topicInput)} className={styles.btnSecondary}>
              + Add
            </button>
          </div>

          {/* Sugestões */}
          <div className={styles.topicList}>
            {TOPIC_SUGGESTIONS.filter(s => !form.topics.includes(s)).map(s => (
              <button key={s} type="button" onClick={() => addTopic(s)} className={styles.btnAction}>
                {s}
              </button>
            ))}
          </div>

          {/* Evolução (texto principal) */}
          <SectionLabel icon={
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#AD6D15" strokeWidth="2.5" strokeLinecap="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          }>
            Registro de evolução <span style={{ color: '#C45A35', marginLeft: 2 }}>*</span>
          </SectionLabel>
          <textarea
            className={styles.textarea}
            style={errors.content ? { borderColor: '#C45A35', minHeight: 160 } : { minHeight: 160 }}
            placeholder="Descreva o conteúdo da sessão, observações clínicas, reações do paciente, avanços percebidos..."
            value={form.content}
            onChange={set('content')}
          />
          {errors.content && <span style={{ fontSize: 11, color: '#C45A35' }}>{errors.content}</span>}

          {/* Intervenções e próximos passos */}
          <SectionLabel icon={
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#AD6D15" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          }>
            Intervenções e encaminhamentos
          </SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Intervenções realizadas" hint="Técnicas, exercícios ou estratégias utilizados na sessão">
              <textarea
                className={styles.textarea}
                style={{ minHeight: 80 }}
                placeholder="Ex: Reestruturação cognitiva, respiração diafragmática, registro de pensamentos..."
                value={form.intervention}
                onChange={set('intervention')}
              />
            </Field>
            <Field label="Próximos passos" hint="Tarefas de casa, encaminhamentos, metas para a próxima sessão">
              <textarea
                className={styles.textarea}
                style={{ minHeight: 80 }}
                placeholder="Ex: Registro de humor diário, leitura do capítulo 3, encaminhamento ao psiquiatra..."
                value={form.nextSteps}
                onChange={set('nextSteps')}
              />
            </Field>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className={styles.footer}>
          <span style={{ fontSize: 11, color: '#9A7040', marginRight: 'auto', display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#C45A35', marginRight: 4 }}>*</span> campos obrigatórios
          </span>
          <button onClick={onClose} className={styles.btnSecondary}>Cancelar</button>
          <button onClick={handleSubmit} disabled={saving} className={styles.btnPrimary}>
              {saving ? (
                <>
                <div className={styles.spinner} />
                  Salvando...
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {note ? 'Salvar Edição' : 'Registrar Evolução'}
                </>
              )}
            </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}