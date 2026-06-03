
'use client';

import React, { useState, useEffect } from 'react';
import type { Session, SessionInput, SessionStatus, SessionType, RecurrenceType } from '../hooks/useAgenda';

interface Patient {
  id: string;
  name: string;
  therapyType?: string;
}

interface SessionModalProps {
  session?: Session | null;
  patients: Patient[];
  defaultDate?: string;
  defaultTime?: string;
  onSave: (data: SessionInput) => Promise<void>;
  onClose: () => void;
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const WEEKDAYS_FULL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function SessionModal({
  session,
  patients,
  defaultDate,
  defaultTime,
  onSave,
  onClose,
}: SessionModalProps) {
  const isEditing = !!session;

  const [patientId, setPatientId]         = useState(session?.patientId ?? '');
  const [patientName, setPatientName]     = useState(session?.patientName ?? '');
  const [date, setDate]                   = useState(session?.date ?? defaultDate ?? '');
  const [startTime, setStartTime]         = useState(session?.startTime ?? defaultTime ?? '09:00');
  const [endTime, setEndTime]             = useState(session?.endTime ?? '10:00');
  const [status, setStatus]               = useState<SessionStatus>(session?.status ?? 'confirmada');
  const [type, setType]                   = useState<SessionType>(session?.type ?? 'presencial');
  const [notes, setNotes]                 = useState(session?.notes ?? '');
  const [isRecurring, setIsRecurring]     = useState(session?.isRecurring ?? false);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(session?.recurrenceType ?? 'weekly');
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>(() => {
    if (session?.recurrenceDays) {
      try { return JSON.parse(session.recurrenceDays); } catch { return []; }
    }
    return [];
  });
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(session?.recurrenceEndDate ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  useEffect(() => {
    const p = patients.find(p => p.id === patientId);
    if (p) setPatientName(p.name);
  }, [patientId, patients]);

  useEffect(() => {
    if (!startTime) return;
    const [h, m] = startTime.split(':').map(Number);
    const total  = h * 60 + m + 50;
    const eh = String(Math.floor(total / 60) % 24).padStart(2, '0');
    const em = String(total % 60).padStart(2, '0');
    setEndTime(`${eh}:${em}`);
  }, [startTime]);

  useEffect(() => {
    if (date && isRecurring && recurrenceType === 'weekly' && recurrenceDays.length === 0) {
      const dow = new Date(date + 'T12:00:00Z').getUTCDay();
      setRecurrenceDays([dow]);
    }
  }, [date, isRecurring, recurrenceType]);

  const toggleDay = (d: number) => {
    setRecurrenceDays(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort(),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) { setError('Selecione um paciente.'); return; }
    if (!date)      { setError('Informe a data.'); return; }
    if (!startTime) { setError('Informe o horário.'); return; }
    if (isRecurring && recurrenceType === 'weekly' && recurrenceDays.length === 0) {
      setError('Selecione pelo menos um dia da semana.'); return;
    }
    setError('');
    setSaving(true);
    try {
      await onSave({
        patientId, patientName, date, startTime, endTime,
        status, type, notes, isRecurring,
        recurrenceType: isRecurring ? recurrenceType : 'none',
        recurrenceDays: isRecurring ? recurrenceDays : undefined,
        recurrenceEndDate: isRecurring ? recurrenceEndDate : undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message ?? 'Erro ao salvar sessão.');
    } finally {
      setSaving(false);
    }
  };

  const statusOptions: { value: SessionStatus; label: string; color: string }[] = [
    { value: 'confirmada',  label: 'Confirmada',  color: '#2E9E5B' },
    { value: 'aguardando',  label: 'Aguardando',  color: '#AD6D15' },
    { value: 'realizada',   label: 'Realizada',   color: '#5A7ABF' },
    { value: 'faltou',      label: 'Faltou',      color: '#C45A35' },
    { value: 'desmarcada',  label: 'Desmarcada',  color: '#9A7040' },
  ];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(26,16,8,0.65)',
        backdropFilter: 'blur(6px)', zIndex: 999999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, boxSizing: 'border-box',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 24, width: '100%', maxWidth: 560,
          maxHeight: 'calc(100vh - 32px)', display: 'flex', flexDirection: 'column',
          boxShadow: '0 32px 80px rgba(26,16,8,0.22)', overflow: 'hidden',
        }}
      >
        
        <div style={{ background: '#1A1008', padding: '22px 28px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'rgba(239,187,85,0.15)', border: '1px solid rgba(239,187,85,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EFBB55" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'Lora, serif', fontSize: 20, fontWeight: 600, color: '#fff', margin: 0 }}>
              {isEditing ? 'Editar Sessão' : 'Nova Sessão'}
            </h2>
            <p style={{ fontSize: 12, color: 'rgba(239,187,85,0.6)', margin: 0 }}>
              {isEditing ? 'Atualize os dados da sessão' : 'Agende uma sessão para um paciente'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.5)', width: 32, height: 32, borderRadius: 8,
              cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          <div>
            <label style={labelStyle}>Paciente *</label>
            <select
              value={patientId}
              onChange={e => setPatientId(e.target.value)}
              required
              style={inputStyle}
            >
              <option value="">Selecione um paciente…</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name}{p.therapyType ? ` — ${p.therapyType}` : ''}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Data *</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Início</label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Término</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Status</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {statusOptions.map(opt => (
                  <label
                    key={opt.value}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                      border: status === opt.value ? `1.5px solid ${opt.color}` : '1.5px solid #E8D9BE',
                      background: status === opt.value ? `${opt.color}14` : '#FDFAF5',
                      transition: 'all 0.15s',
                    }}
                  >
                    <input
                      type="radio" name="status" value={opt.value}
                      checked={status === opt.value}
                      onChange={() => setStatus(opt.value)}
                      style={{ accentColor: opt.color, margin: 0 }}
                    />
                    <span style={{ fontSize: 13, fontWeight: status === opt.value ? 600 : 400, color: status === opt.value ? opt.color : '#5A3E20' }}>
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={labelStyle}>Modalidade</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['presencial', 'online'] as SessionType[]).map(t => (
                    <button
                      key={t} type="button"
                      onClick={() => setType(t)}
                      style={{
                        flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 12, fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.15s',
                        border: type === t ? '1.5px solid #AD6D15' : '1.5px solid #E8D9BE',
                        background: type === t ? '#F5ECD8' : '#FDFAF5',
                        color: type === t ? '#AD6D15' : '#9A7040',
                      }}
                    >
                      {t === 'presencial' ? '🏥 Presencial' : '🖥 Online'}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ border: '1.5px solid #E8D9BE', borderRadius: 12, padding: 14, background: '#FDFAF5' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: isRecurring ? 12 : 0 }}>
                  <input
                    type="checkbox" checked={isRecurring}
                    onChange={e => setIsRecurring(e.target.checked)}
                    style={{ accentColor: '#AD6D15', width: 15, height: 15, margin: 0 }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#2D1F0A' }}>Sessão recorrente</span>
                </label>

                {isRecurring && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <select
                      value={recurrenceType}
                      onChange={e => setRecurrenceType(e.target.value as RecurrenceType)}
                      style={{ ...inputStyle, padding: '8px 10px', fontSize: 12 }}
                    >
                      <option value="weekly">Semanal</option>
                      <option value="biweekly">Quinzenal</option>
                      <option value="monthly">Mensal</option>
                    </select>

                    {recurrenceType === 'weekly' && (
                      <div>
                        <div style={{ fontSize: 11, color: '#9A7040', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dias da semana</div>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {WEEKDAYS.map((d, i) => (
                            <button
                              key={i} type="button"
                              onClick={() => toggleDay(i)}
                              style={{
                                width: 34, height: 34, borderRadius: '50%', fontSize: 11, fontWeight: 700,
                                cursor: 'pointer', transition: 'all 0.15s',
                                border: recurrenceDays.includes(i) ? '2px solid #AD6D15' : '1.5px solid #E8D9BE',
                                background: recurrenceDays.includes(i) ? '#AD6D15' : '#fff',
                                color: recurrenceDays.includes(i) ? '#fff' : '#9A7040',
                              }}
                            >{d}</button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <div style={{ fontSize: 11, color: '#9A7040', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Repetir até</div>
                      <input
                        type="date" value={recurrenceEndDate}
                        onChange={e => setRecurrenceEndDate(e.target.value)}
                        min={date}
                        style={{ ...inputStyle, padding: '8px 10px', fontSize: 12 }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Observações</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Anotações rápidas sobre esta sessão…"
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
            />
          </div>

          {error && (
            <div style={{ padding: '10px 14px', background: '#FEF0EC', border: '1px solid #F0C0A8', borderRadius: 8, fontSize: 13, color: '#C45A35' }}>
              ⚠️ {error}
            </div>
          )}
        </form>

        <div style={{
          padding: '16px 28px', borderTop: '1px solid #F0E8D8',
          background: '#FDFAF5', display: 'flex', justifyContent: 'flex-end', gap: 10,
        }}>
          <button
            type="button" onClick={onClose}
            style={{
              background: 'none', border: '1.5px solid #D9C49A', color: '#9A7040',
              padding: '10px 20px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer',
            }}
          >Cancelar</button>
          <button
            onClick={handleSubmit as any}
            disabled={saving}
            style={{
              background: '#1A1008', color: '#EFBB55', border: 'none',
              padding: '10px 24px', borderRadius: 8, fontSize: 12, fontWeight: 700,
              letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer',
              opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            {saving && (
              <span style={{
                width: 14, height: 14, border: '2px solid rgba(239,187,85,0.3)',
                borderTopColor: '#EFBB55', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite', display: 'inline-block',
              }} />
            )}
            {saving ? 'Salvando…' : isEditing ? 'Salvar Alterações' : 'Agendar Sessão'}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 700, color: '#9A7040',
  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6,
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', border: '1.5px solid #E8D9BE',
  borderRadius: 8, fontFamily: 'DM Sans, sans-serif', fontSize: 13,
  color: '#2D1F0A', background: '#FDFAF5', outline: 'none', boxSizing: 'border-box',
};