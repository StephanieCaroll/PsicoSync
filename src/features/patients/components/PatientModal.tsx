'use client';

import React, { useState, useEffect } from 'react';
import { Patient, PatientInput } from '../usePatients';

interface PatientModalProps {
  patient?: Patient | null;
  onSave: (data: PatientInput) => Promise<void>;
  onClose: () => void;
}

export interface EvolutionEntry {
  id: string;
  date: string;
  state: string;
  text: string;
}

const emptyForm = {
  name: '',
  cpf: '',
  birthDate: '',
  phone: '',
  email: '',
  therapyType: '',
  frequency: 'Semanal',
  modality: 'Presencial',
  referredBy: '',
  sessionValue: '',
  insurance: '',
  pendingAmount: '',
  status: 'active' as 'active' | 'waiting' | 'inactive',
  nextSession: '',
  lastSession: '',
};

type FormState = typeof emptyForm;

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function formatCPF(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatCurrency(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  const number = parseInt(digits, 10) / 100;
  return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function parseCurrency(formatted: string): number {
  const digits = formatted.replace(/\D/g, '');
  if (!digits) return 0;
  return parseInt(digits, 10) / 100;
}

function SectionLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 600, letterSpacing: '0.12em',
      textTransform: 'uppercase', color: '#9A7040',
      marginBottom: 14, marginTop: 24,
      paddingBottom: 8, borderBottom: '1px solid #F0E8D8',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      {icon}
      {children}
    </div>
  );
}

function Field({
  label, required, hint, children,
}: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
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

const inputStyle = (hasError?: boolean): React.CSSProperties => ({
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
});

export default function PatientModal({ patient, onSave, onClose }: PatientModalProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  
  const [evolutions, setEvolutions] = useState<EvolutionEntry[]>([]);
  const [currentEv, setCurrentEv] = useState<EvolutionEntry>({ id: '', date: '', state: 'Estável', text: '' });
  const [isEditingEv, setIsEditingEv] = useState(false);

  useEffect(() => {
    if (patient) {
      setForm({
        name: patient.name || '',
        cpf: patient.cpf || '',
        birthDate: patient.birthDate || '',
        phone: patient.phone || '',
        email: patient.email || '',
        therapyType: patient.therapyType || '',
        frequency: patient.frequency || 'Semanal',
        modality: patient.modality || 'Presencial',
        referredBy: patient.referredBy || '',
        sessionValue: patient.sessionValue
          ? formatCurrency(String(Math.round(patient.sessionValue * 100)))
          : '',
        insurance: patient.insurance || '',
        pendingAmount: patient.pendingAmount
          ? formatCurrency(String(Math.round(patient.pendingAmount * 100)))
          : '',
        status: patient.status || 'active',
        nextSession: patient.nextSession || '',
        lastSession: patient.lastSession || '',
      });

      if (patient.evolution && Array.isArray(patient.evolution)) {
        const loadedEvolutions = patient.evolution.map(evString => {
          try {
            return JSON.parse(evString) as EvolutionEntry;
          } catch (e) {
            return null;
          }
        }).filter((ev): ev is EvolutionEntry => ev !== null);
        
        setEvolutions(loadedEvolutions);
      }
    } else {
      setForm(emptyForm);
      setEvolutions([]);
    }
  }, [patient]);

  const set = (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm(prev => ({ ...prev, [key]: e.target.value }));
      setErrors(prev => ({ ...prev, [key]: undefined }));
    };

  const setPhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, phone: formatPhone(e.target.value) }));
    setErrors(prev => ({ ...prev, phone: undefined }));
  };

  const setCPF = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, cpf: formatCPF(e.target.value) }));
  };

  const setCurrency = (key: 'sessionValue' | 'pendingAmount') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(prev => ({ ...prev, [key]: formatCurrency(e.target.value) }));
      setErrors(prev => ({ ...prev, [key]: undefined }));
    };

  const handleSaveEvolution = () => {
    if (!currentEv.text.trim()) return alert('O texto da evolução não pode estar vazio.');
    if (!currentEv.date) return alert('Selecione uma data para a evolução.');

    if (isEditingEv) {
      setEvolutions(prev => prev.map(ev => ev.id === currentEv.id ? currentEv : ev));
    } else {
      setEvolutions(prev => [{ ...currentEv, id: Date.now().toString() }, ...prev]);
    }
    
    setCurrentEv({ id: '', date: '', state: 'Estável', text: '' });
    setIsEditingEv(false);
  };

  const editEvolution = (ev: EvolutionEntry) => {
    setCurrentEv(ev);
    setIsEditingEv(true);
  };

  const deleteEvolution = (id: string) => {
    if (confirm('Deseja realmente apagar esta anotação?')) {
      setEvolutions(prev => prev.filter(ev => ev.id !== id));
      if (currentEv.id === id) {
        setCurrentEv({ id: '', date: '', state: 'Estável', text: '' });
        setIsEditingEv(false);
      }
    }
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!form.name.trim()) newErrors.name = 'Nome obrigatório';
    if (!form.phone.trim()) newErrors.phone = 'Telefone obrigatório';
    if (!form.therapyType) newErrors.therapyType = 'Tipo de terapia obrigatório';
    if (!form.sessionValue) newErrors.sessionValue = 'Valor da sessão obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({
        name: form.name.trim(),
        cpf: form.cpf,
        birthDate: form.birthDate,
        phone: form.phone,
        email: form.email,
        therapyType: form.therapyType,
        frequency: form.frequency,
        modality: form.modality,
        referredBy: form.referredBy,
        sessionValue: parseCurrency(form.sessionValue),
        insurance: form.insurance,
        pendingAmount: parseCurrency(form.pendingAmount),
        status: form.status,
        nextSession: form.nextSession,
        lastSession: form.lastSession,
       
        evolution: evolutions.map(ev => JSON.stringify(ev)),
      } as any);
      onClose();
    } catch (err: any) {
      alert('Erro ao salvar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const IconUser = (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#AD6D15" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
  const IconClinical = (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#AD6D15" strokeWidth="2.5" strokeLinecap="round">
      <path d="M9 12h6m-3-3v6" /><rect x="3" y="3" width="18" height="18" rx="3" />
    </svg>
  );
  const IconNotes = (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#AD6D15" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
  const IconMoney = (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#AD6D15" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
  const IconStatus = (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#AD6D15" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" /><path d="M12 6v6l4 2" />
    </svg>
  );

  const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 };
  const grid3: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 };

  const statusOptions: { key: 'active' | 'waiting' | 'inactive'; label: string; color: string; bg: string; border: string }[] = [
    { key: 'active', label: 'Ativo', color: '#1A6E3F', bg: '#E8F4EC', border: '#2E9E5B' },
    { key: 'waiting', label: 'Aguardando', color: '#993C1D', bg: '#FEF0EC', border: '#C45A35' },
    { key: 'inactive', label: 'Inativo', color: '#7A5020', bg: '#F5ECD8', border: '#C8A96E' },
  ];
  
  const emotionOptions = ['Estável', 'Calmo', 'Ansioso', 'Irritado', 'Triste', 'Eufórico', 'Agressivo', 'Apático', 'Angustiado'];

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(26,16,8,0.55)',
      backdropFilter: 'blur(4px)',
      zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }} onClick={onClose}>
      <div style={{
        background: 'white',
        borderRadius: 20,
        width: '100%',
        maxWidth: 720,
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
      }} onClick={e => e.stopPropagation()}>

        <div style={{
          background: '#1A1008',
          padding: '24px 32px',
          display: 'flex', alignItems: 'center', gap: 16,
          borderRadius: '20px 20px 0 0',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'rgba(239,187,85,0.15)',
            border: '1px solid rgba(239,187,85,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EFBB55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Lora', serif", fontSize: 20, fontWeight: 600, color: 'white', lineHeight: 1.2 }}>
              {patient ? `Editar — ${patient.name.split(' ')[0]}` : 'Novo Paciente'}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(239,187,85,0.6)', marginTop: 4 }}>
              {patient ? 'Atualize os dados clínicos e de contato' : 'Preencha os dados clínicos e de contato'}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.5)', width: 32, height: 32, borderRadius: 8,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, transition: 'all 0.18s', flexShrink: 0,
          }}
            onMouseOver={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
            onMouseOut={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
          >✕</button>
        </div>

        <div style={{ padding: '28px 32px' }}>

          <SectionLabel icon={IconUser}>Dados pessoais</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Nome completo" required>
              <input
                style={inputStyle(!!errors.name)}
                value={form.name}
                onChange={set('name')}
                placeholder="Ex: Maria da Silva"
                onFocus={e => { e.target.style.borderColor = '#AD6D15'; e.target.style.boxShadow = '0 0 0 3px rgba(173,109,21,0.1)'; e.target.style.background = 'white'; }}
                onBlur={e => { e.target.style.borderColor = errors.name ? '#C45A35' : '#E8D9BE'; e.target.style.boxShadow = 'none'; }}
              />
              {errors.name && <span style={{ fontSize: 11, color: '#C45A35' }}>{errors.name}</span>}
            </Field>

            <div style={grid2}>
              <Field label="CPF" hint="Necessário para emissão de recibos">
                <input
                  style={inputStyle()}
                  value={form.cpf}
                  onChange={setCPF}
                  placeholder="000.000.000-00"
                  onFocus={e => { e.target.style.borderColor = '#AD6D15'; e.target.style.boxShadow = '0 0 0 3px rgba(173,109,21,0.1)'; e.target.style.background = 'white'; }}
                  onBlur={e => { e.target.style.borderColor = '#E8D9BE'; e.target.style.boxShadow = 'none'; }}
                />
              </Field>
              <Field label="Data de nascimento">
                <input
                  type="date"
                  style={inputStyle()}
                  value={form.birthDate}
                  onChange={set('birthDate')}
                  onFocus={e => { e.target.style.borderColor = '#AD6D15'; e.target.style.boxShadow = '0 0 0 3px rgba(173,109,21,0.1)'; e.target.style.background = 'white'; }}
                  onBlur={e => { e.target.style.borderColor = '#E8D9BE'; e.target.style.boxShadow = 'none'; }}
                />
              </Field>
              <Field label="Telefone" required>
                <input
                  style={inputStyle(!!errors.phone)}
                  value={form.phone}
                  onChange={setPhone}
                  placeholder="(81) 99999-9999"
                  onFocus={e => { e.target.style.borderColor = '#AD6D15'; e.target.style.boxShadow = '0 0 0 3px rgba(173,109,21,0.1)'; e.target.style.background = 'white'; }}
                  onBlur={e => { e.target.style.borderColor = errors.phone ? '#C45A35' : '#E8D9BE'; e.target.style.boxShadow = 'none'; }}
                />
                {errors.phone && <span style={{ fontSize: 11, color: '#C45A35' }}>{errors.phone}</span>}
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  style={inputStyle()}
                  value={form.email}
                  onChange={set('email')}
                  placeholder="paciente@email.com"
                  onFocus={e => { e.target.style.borderColor = '#AD6D15'; e.target.style.boxShadow = '0 0 0 3px rgba(173,109,21,0.1)'; e.target.style.background = 'white'; }}
                  onBlur={e => { e.target.style.borderColor = '#E8D9BE'; e.target.style.boxShadow = 'none'; }}
                />
              </Field>
            </div>
          </div>

          <SectionLabel icon={IconClinical}>Informações clínicas</SectionLabel>
          <div style={grid2}>
            <Field label="Tipo de terapia" required>
              <select
                style={inputStyle(!!errors.therapyType)}
                value={form.therapyType}
                onChange={set('therapyType')}
                onFocus={e => { e.target.style.borderColor = '#AD6D15'; e.target.style.boxShadow = '0 0 0 3px rgba(173,109,21,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = errors.therapyType ? '#C45A35' : '#E8D9BE'; e.target.style.boxShadow = 'none'; }}
              >
                <option value="">Selecionar...</option>
                <option>Terapia Cognitivo-Comportamental</option>
                <option>Psicanálise</option>
                <option>Terapia de Casal</option>
                <option>Terapia Familiar</option>
                <option>Terapia Humanista</option>
                <option>EMDR</option>
                <option>Terapia Analítico-Comportamental</option>
                <option>Terapia de Aceitação e Compromisso</option>
              </select>
              {errors.therapyType && <span style={{ fontSize: 11, color: '#C45A35' }}>{errors.therapyType}</span>}
            </Field>

            <Field label="Frequência das sessões">
              <select
                style={inputStyle()}
                value={form.frequency}
                onChange={set('frequency')}
                onFocus={e => { e.target.style.borderColor = '#AD6D15'; e.target.style.boxShadow = '0 0 0 3px rgba(173,109,21,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#E8D9BE'; e.target.style.boxShadow = 'none'; }}
              >
                <option>Semanal</option>
                <option>Quinzenal</option>
                <option>Mensal</option>
                <option>Sob demanda</option>
              </select>
            </Field>

            <Field label="Modalidade">
              <select
                style={inputStyle()}
                value={form.modality}
                onChange={set('modality')}
                onFocus={e => { e.target.style.borderColor = '#AD6D15'; e.target.style.boxShadow = '0 0 0 3px rgba(173,109,21,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#E8D9BE'; e.target.style.boxShadow = 'none'; }}
              >
                <option>Presencial</option>
                <option>Online</option>
                <option>Híbrido</option>
              </select>
            </Field>

            <Field label="Encaminhado por" hint="Médico, UBS, indicação pessoal...">
              <input
                style={inputStyle()}
                value={form.referredBy}
                onChange={set('referredBy')}
                placeholder="Ex: Dr. Carlos Menezes"
                onFocus={e => { e.target.style.borderColor = '#AD6D15'; e.target.style.boxShadow = '0 0 0 3px rgba(173,109,21,0.1)'; e.target.style.background = 'white'; }}
                onBlur={e => { e.target.style.borderColor = '#E8D9BE'; e.target.style.boxShadow = 'none'; }}
              />
            </Field>

            <Field label="Próxima sessão">
              <input
                type="datetime-local"
                style={inputStyle()}
                value={form.nextSession}
                onChange={set('nextSession')}
                onFocus={e => { e.target.style.borderColor = '#AD6D15'; e.target.style.boxShadow = '0 0 0 3px rgba(173,109,21,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#E8D9BE'; e.target.style.boxShadow = 'none'; }}
              />
            </Field>

            <Field label="Última sessão">
              <input
                type="date"
                style={inputStyle()}
                value={form.lastSession}
                onChange={set('lastSession')}
                onFocus={e => { e.target.style.borderColor = '#AD6D15'; e.target.style.boxShadow = '0 0 0 3px rgba(173,109,21,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#E8D9BE'; e.target.style.boxShadow = 'none'; }}
              />
            </Field>
          </div>

          <SectionLabel icon={IconNotes}>Evoluções Clínicas</SectionLabel>
          
          <div style={{
            background: '#FAF6EE', padding: '16px', borderRadius: 12,
            border: '1px solid #E8D9BE', marginBottom: 20
          }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: 13, color: '#5A3E20', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {isEditingEv ? 'Editar Evolução' : 'Nova Evolução'}
            </h4>
            <div style={{ ...grid2, marginBottom: 12 }}>
              <Field label="Data da Sessão">
                <input
                  type="date"
                  style={inputStyle()}
                  value={currentEv.date}
                  onChange={e => setCurrentEv(prev => ({ ...prev, date: e.target.value }))}
                />
              </Field>
              <Field label="Estado Emocional">
                <select
                  style={inputStyle()}
                  value={currentEv.state}
                  onChange={e => setCurrentEv(prev => ({ ...prev, state: e.target.value }))}
                >
                  {emotionOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Anotações da Sessão">
              <textarea
                style={{ ...inputStyle(), minHeight: 80, resize: 'vertical' }}
                placeholder="Detalhes, insights, tarefas recomendadas..."
                value={currentEv.text}
                onChange={e => setCurrentEv(prev => ({ ...prev, text: e.target.value }))}
              />
            </Field>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12, gap: 8 }}>
              {isEditingEv && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingEv(false);
                    setCurrentEv({ id: '', date: '', state: 'Estável', text: '' });
                  }}
                  style={{
                    background: 'transparent', border: '1px solid #D9C49A', color: '#9A7040',
                    padding: '8px 16px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600
                  }}
                >
                  Cancelar
                </button>
              )}
              <button
                type="button"
                onClick={handleSaveEvolution}
                style={{
                  background: '#2D1F0A', border: 'none', color: '#EFBB55',
                  padding: '8px 16px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600
                }}
              >
                {isEditingEv ? 'Salvar Edição' : 'Adicionar à Lista'}
              </button>
            </div>
          </div>

          {evolutions.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {evolutions.map(ev => (
                <div key={ev.id} style={{
                  border: '1px solid #E8D9BE', borderRadius: 12, padding: '14px', background: '#FFF'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#2D1F0A' }}>
                        {ev.date ? new Date(ev.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'Sem data'}
                      </span>
                      <span style={{
                        background: '#F5ECD8', color: '#AD6D15', padding: '2px 8px',
                        borderRadius: 4, fontSize: 10, fontWeight: 600, textTransform: 'uppercase'
                      }}>
                        {ev.state}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" onClick={() => editEvolution(ev)} style={{ background: 'none', border: 'none', color: '#9A7040', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>Editar</button>
                      <button type="button" onClick={() => deleteEvolution(ev.id)} style={{ background: 'none', border: 'none', color: '#C45A35', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>Excluir</button>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#5A3E20', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                    {ev.text}
                  </p>
                </div>
              ))}
            </div>
          )}

          <SectionLabel icon={IconMoney}>Financeiro</SectionLabel>
          <div style={grid3}>
            <Field label="Valor da sessão" required>
              <input
                style={inputStyle(!!errors.sessionValue)}
                value={form.sessionValue}
                onChange={setCurrency('sessionValue')}
                placeholder="R$ 0,00"
                onFocus={e => { e.target.style.borderColor = '#AD6D15'; e.target.style.boxShadow = '0 0 0 3px rgba(173,109,21,0.1)'; e.target.style.background = 'white'; }}
                onBlur={e => { e.target.style.borderColor = errors.sessionValue ? '#C45A35' : '#E8D9BE'; e.target.style.boxShadow = 'none'; }}
              />
              {errors.sessionValue && <span style={{ fontSize: 11, color: '#C45A35' }}>{errors.sessionValue}</span>}
            </Field>
            <Field label="Convênio / Plano">
              <input
                style={inputStyle()}
                value={form.insurance}
                onChange={set('insurance')}
                placeholder="Particular, Unimed..."
                onFocus={e => { e.target.style.borderColor = '#AD6D15'; e.target.style.boxShadow = '0 0 0 3px rgba(173,109,21,0.1)'; e.target.style.background = 'white'; }}
                onBlur={e => { e.target.style.borderColor = '#E8D9BE'; e.target.style.boxShadow = 'none'; }}
              />
            </Field>
            <Field label="Valor pendente">
              <input
                style={inputStyle()}
                value={form.pendingAmount}
                onChange={setCurrency('pendingAmount')}
                placeholder="R$ 0,00"
                onFocus={e => { e.target.style.borderColor = '#AD6D15'; e.target.style.boxShadow = '0 0 0 3px rgba(173,109,21,0.1)'; e.target.style.background = 'white'; }}
                onBlur={e => { e.target.style.borderColor = '#E8D9BE'; e.target.style.boxShadow = 'none'; }}
              />
            </Field>
          </div>

          <SectionLabel icon={IconStatus}>Status do paciente</SectionLabel>
          <div style={{ display: 'flex', gap: 10 }}>
            {statusOptions.map(opt => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, status: opt.key }))}
                style={{
                  flex: 1, padding: '12px 8px',
                  border: `1.5px solid ${form.status === opt.key ? opt.border : '#E8D9BE'}`,
                  borderRadius: 10, cursor: 'pointer',
                  background: form.status === opt.key ? opt.bg : '#FDFAF5',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
                  transition: 'all 0.18s',
                }}
              >
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: opt.border,
                }} />
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  color: form.status === opt.key ? opt.color : '#9A7040',
                }}>
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div style={{
          padding: '18px 32px',
          borderTop: '1px solid #F0E8D8',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: '#FDFAF5',
          borderRadius: '0 0 20px 20px',
          position: 'sticky', bottom: 0,
        }}>
          <span style={{ fontSize: 11, color: '#9A7040' }}>
            <span style={{ color: '#C45A35' }}>*</span> campos obrigatórios
          </span>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={onClose} style={{
              background: 'none', border: '1.5px solid #D9C49A',
              color: '#9A7040', padding: '10px 20px', borderRadius: 8,
              fontSize: 12, fontWeight: 600, letterSpacing: '0.05em',
              textTransform: 'uppercase', cursor: 'pointer',
            }}>
              Cancelar
            </button>
            <button onClick={handleSubmit} disabled={saving} style={{
              background: saving ? '#9A7040' : '#1A1008',
              color: '#EFBB55', border: 'none',
              padding: '10px 28px', borderRadius: 8,
              fontSize: 12, fontWeight: 600, letterSpacing: '0.06em',
              textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.18s',
            }}>
              {saving ? (
                <>
                  <div style={{ width: 14, height: 14, border: '2px solid rgba(239,187,85,0.3)', borderTopColor: '#EFBB55', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Salvando...
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {patient ? 'Salvar Tudo' : 'Cadastrar Paciente'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}