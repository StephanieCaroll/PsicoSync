
'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

/* ─────────────────────────────────────────
   Tipos exportados (usados pelo useEvolutions)
───────────────────────────────────────── */
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

/* ─────────────────────────────────────────
   Props
───────────────────────────────────────── */
interface EvolutionModalProps {
  patientId: string;
  patientName: string;
  note?: ClinicalNote | null;           // null = nova nota
  lastSessionNumber?: number;           // para auto-incrementar
  onSave: (note: Omit<ClinicalNote, 'id' | 'patientName' | 'status'>) => Promise<void>;
  onClose: () => void;
}

/* ─────────────────────────────────────────
   Constantes
───────────────────────────────────────── */
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

/* ─────────────────────────────────────────
   Sub-componentes de layout
───────────────────────────────────────── */
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

/* ─────────────────────────────────────────
   Componente principal
───────────────────────────────────────── */
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
        patientId,
        date: form.date,
        content: form.content.trim(),
        mood: form.mood,
        topics: form.topics,
        intervention: form.intervention.trim(),
        nextSteps: form.nextSteps.trim(),
        sessionNumber: parseInt(form.sessionNumber) || 1,
        duration: parseInt(form.duration) || 50,
        isTelehealth: form.isTelehealth,
      });
      onClose();
    } catch (err: any) {
      alert('Erro ao salvar evolução: ' + (err?.message ?? err));
    } finally {
      setSaving(false);
    }
  };

  const focus = (e: React.FocusEvent<any>) => { e.target.style.borderColor = '#AD6D15'; e.target.style.background = 'white'; };
  const blur  = (e: React.FocusEvent<any>, hasError?: boolean) => {
    e.target.style.borderColor = hasError ? '#C45A35' : '#E8D9BE';
    e.target.style.background = '#FDFAF5';
  };

  if (!mounted) return null;

  const moodColors: Record<string, string> = {
    'Muito bem': '#1A6E3F', 'Bem': '#2E8A56', 'Estável': '#7A5020',
    'Ansioso(a)': '#993C1D', 'Triste': '#3B5998', 'Agitado(a)': '#8B2500', 'Em crise': '#C0392B',
  };

  const content = (
    <div className="em-overlay" onClick={onClose}>
      <div className="em-box" onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="em-header">
          <div className="em-header-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EFBB55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <line x1="10" y1="9" x2="8" y2="9" />
            </svg>
          </div>
          <div className="em-header-texts">
            <h2 className="em-title">
              {note ? 'Editar Evolução' : 'Nova Evolução'}
            </h2>
            <span className="em-subtitle">{patientName}</span>
          </div>
          <button className="em-close" onClick={onClose} aria-label="Fechar">✕</button>
        </div>

        {/* ── Body ── */}
        <div className="em-body">

          {/* Sessão + Data */}
          <SectionLabel icon={
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#AD6D15" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="9" /><path d="M12 6v6l4 2" />
            </svg>
          }>
            Identificação da sessão
          </SectionLabel>
          <div className="em-grid-3">
            <Field label="Data" required>
              <input type="date" style={inp(!!errors.date)} value={form.date}
                onChange={set('date')} onFocus={focus}
                onBlur={e => blur(e, !!errors.date)} />
              {errors.date && <span style={{ fontSize: 11, color: '#C45A35' }}>{errors.date}</span>}
            </Field>
            <Field label="Nº da sessão">
              <input type="number" min={1} style={inp()} value={form.sessionNumber}
                onChange={set('sessionNumber')} onFocus={focus} onBlur={blur} />
            </Field>
            <Field label="Duração (min)">
              <input type="number" min={1} style={inp()} value={form.duration}
                onChange={set('duration')} onFocus={focus} onBlur={blur} />
            </Field>
          </div>

          {/* Modalidade telehealth */}
          <div style={{ marginTop: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
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
              <span style={{ fontSize: 13, color: '#5A3E20', fontWeight: 500 }}>
                Sessão por teleconsulta (online)
              </span>
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
          <div className="em-mood-grid">
            {MOODS.map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, mood: m }))}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: `1.5px solid ${form.mood === m ? (moodColors[m] ?? '#AD6D15') : '#E8D9BE'}`,
                  background: form.mood === m ? `${(moodColors[m] ?? '#AD6D15')}15` : '#FDFAF5',
                  color: form.mood === m ? (moodColors[m] ?? '#AD6D15') : '#9A7040',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {form.topics.map(t => (
                <span key={t} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '4px 10px',
                  background: 'rgba(239,187,85,0.12)',
                  border: '1px solid rgba(239,187,85,0.35)',
                  borderRadius: 999,
                  fontSize: 12, fontWeight: 600, color: '#7A4E10',
                }}>
                  {t}
                  <button type="button" onClick={() => removeTopic(t)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C45A35', lineHeight: 1, padding: 0, fontSize: 14 }}>
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Input customizado */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <input
              style={{ ...inp(), flex: 1 }}
              placeholder="Adicionar tópico personalizado..."
              value={topicInput}
              onChange={e => setTopicInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTopic(topicInput); } }}
              onFocus={focus} onBlur={blur}
            />
            <button type="button" onClick={() => addTopic(topicInput)}
              style={{
                padding: '10px 16px', borderRadius: 8, border: '1.5px solid #E8D9BE',
                background: '#FDFAF5', color: '#9A7040', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}>
              + Add
            </button>
          </div>

          {/* Sugestões */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {TOPIC_SUGGESTIONS.filter(s => !form.topics.includes(s)).map(s => (
              <button key={s} type="button" onClick={() => addTopic(s)}
                style={{
                  padding: '4px 10px', borderRadius: 999,
                  border: '1px solid #E8D9BE', background: '#FDFAF5',
                  color: '#9A7040', fontSize: 11, fontWeight: 500, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}>
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
            style={{
              ...inp(!!errors.content),
              resize: 'vertical', minHeight: 160, lineHeight: 1.6,
            }}
            placeholder="Descreva o conteúdo da sessão, observações clínicas, reações do paciente, avanços percebidos..."
            value={form.content}
            onChange={set('content')}
            onFocus={focus}
            onBlur={e => blur(e, !!errors.content)}
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
                style={{ ...inp(), resize: 'vertical', minHeight: 80, lineHeight: 1.6 }}
                placeholder="Ex: Reestruturação cognitiva, respiração diafragmática, registro de pensamentos..."
                value={form.intervention}
                onChange={set('intervention')}
                onFocus={focus} onBlur={blur}
              />
            </Field>
            <Field label="Próximos passos" hint="Tarefas de casa, encaminhamentos, metas para a próxima sessão">
              <textarea
                style={{ ...inp(), resize: 'vertical', minHeight: 80, lineHeight: 1.6 }}
                placeholder="Ex: Registro de humor diário, leitura do capítulo 3, encaminhamento ao psiquiatra..."
                value={form.nextSteps}
                onChange={set('nextSteps')}
                onFocus={focus} onBlur={blur}
              />
            </Field>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="em-footer">
          <span style={{ fontSize: 11, color: '#9A7040' }}>
            <span style={{ color: '#C45A35' }}>*</span> campos obrigatórios
          </span>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} className="em-btn-cancel">Cancelar</button>
            <button onClick={handleSubmit} disabled={saving} className="em-btn-save">
              {saving ? (
                <>
                  <div style={{ width: 13, height: 13, border: '2px solid rgba(239,187,85,0.3)', borderTopColor: '#EFBB55', borderRadius: '50%', animation: 'em-spin 0.7s linear infinite' }} />
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

      <style>{`
        @keyframes em-spin { to { transform: rotate(360deg); } }
        .em-overlay, .em-overlay * { box-sizing: border-box !important; }

        .em-overlay {
          position: fixed; inset: 0;
          background: rgba(26,16,8,0.6);
          backdrop-filter: blur(5px);
          z-index: 999999;
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
        }

        .em-box {
          background: white;
          border-radius: 20px;
          width: 100%; max-width: 700px;
          max-height: calc(100vh - 32px);
          display: flex; flex-direction: column;
          box-shadow: 0 24px 64px rgba(0,0,0,0.25);
          overflow: hidden;
        }

        .em-header {
          background: #1A1008;
          padding: 22px 28px;
          display: flex; align-items: center; gap: 14px;
          flex-shrink: 0;
        }

        .em-header-icon {
          width: 44px; height: 44px;
          border-radius: 12px;
          background: rgba(239,187,85,0.15);
          border: 1px solid rgba(239,187,85,0.3);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .em-header-texts { flex: 1; display: flex; flex-direction: column; }

        .em-title {
          font-family: 'Lora', serif !important;
          font-size: 20px !important; font-weight: 600 !important;
          color: #FFFFFF !important; margin: 0 !important; line-height: 1.2 !important;
        }

        .em-subtitle {
          font-size: 12px; color: rgba(239,187,85,0.65); margin-top: 3px;
        }

        .em-close {
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.5); width: 32px; height: 32px; border-radius: 8px;
          cursor: pointer; font-size: 16px; transition: all 0.18s; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .em-close:hover { color: #FFF; background: rgba(255,255,255,0.15); }

        .em-body {
          padding: 22px 28px; overflow-y: auto; overflow-x: hidden; flex: 1;
        }

        .em-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }

        .em-mood-grid {
          display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 4px;
        }

        .em-footer {
          padding: 16px 28px; border-top: 1px solid #F0E8D8;
          display: flex; justify-content: space-between; align-items: center;
          background: #FDFAF5; flex-shrink: 0;
        }

        .em-btn-cancel {
          background: none; border: 1.5px solid #D9C49A; color: #9A7040;
          padding: 10px 20px; border-radius: 8px; font-size: 12px; font-weight: 600;
          letter-spacing: 0.05em; text-transform: uppercase; cursor: pointer;
        }

        .em-btn-save {
          background: #1A1008; color: #EFBB55; border: none;
          padding: 10px 28px; border-radius: 8px; font-size: 12px; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer;
          display: flex; align-items: center; gap: 8px; transition: all 0.18s;
        }
        .em-btn-save:disabled { background: #9A7040; cursor: not-allowed; }
        .em-btn-save:hover:not(:disabled) { background: #2D1F0A; }

        @media (max-width: 640px) {
          .em-overlay { padding: 0; }
          .em-box { max-height: 100vh; border-radius: 0; }
          .em-header { padding: 16px 18px; }
          .em-body { padding: 16px 18px; }
          .em-footer { padding: 14px 18px; flex-direction: column; gap: 12px; align-items: stretch; }
          .em-footer > div { display: flex; flex-direction: column-reverse; gap: 8px; }
          .em-btn-cancel, .em-btn-save { width: 100%; justify-content: center; }
          .em-grid-3 { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );

  return createPortal(content, document.body);
}
