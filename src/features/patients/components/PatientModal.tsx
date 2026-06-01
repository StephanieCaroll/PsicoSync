'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Patient, PatientInput } from '../usePatients';

interface PatientModalProps {
  patient?: Patient | null;
  onSave: (data: PatientInput) => Promise<void>;
  onClose: () => void;
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
  boxSizing: 'border-box'
});

export default function PatientModal({ patient, onSave, onClose }: PatientModalProps) {
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  useEffect(() => {
    setMounted(true);
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
    } else {
      setForm(emptyForm);
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

  const statusOptions: { key: 'active' | 'waiting' | 'inactive'; label: string; color: string; bg: string; border: string }[] = [
    { key: 'active', label: 'Ativo', color: '#1A6E3F', bg: '#E8F4EC', border: '#2E9E5B' },
    { key: 'waiting', label: 'Aguardando', color: '#993C1D', bg: '#FEF0EC', border: '#C45A35' },
    { key: 'inactive', label: 'Inativo', color: '#7A5020', bg: '#F5ECD8', border: '#C8A96E' },
  ];

  if (!mounted) return null;

  const modalContent = (
    <div className="pm-overlay" onClick={onClose}>
      <div className="pm-modal-box" onClick={e => e.stopPropagation()}>

        <div className="pm-modal-header">
          <div className="pm-header-icon-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EFBB55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          
          <div className="pm-header-texts">
            <h2 className="pm-title">
              {patient ? `Editar — ${(patient.name || 'Paciente').split(' ')[0]}` : 'Novo Paciente'}
            </h2>
            <span className="pm-subtitle">
              {patient ? 'Atualize os dados clínicos e de contato' : 'Preencha os dados clínicos e de contato'}
            </span>
          </div>

          <button onClick={onClose} className="pm-close-btn" aria-label="Fechar">✕</button>
        </div>

        <div className="pm-modal-body">

          <SectionLabel icon={IconUser}>Dados pessoais</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Nome completo" required>
              <input
                style={inputStyle(!!errors.name)}
                value={form.name}
                onChange={set('name')}
                placeholder="Ex: Maria da Silva"
                onFocus={e => { e.target.style.borderColor = '#AD6D15'; e.target.style.background = 'white'; }}
                onBlur={e => { e.target.style.borderColor = errors.name ? '#C45A35' : '#E8D9BE'; }}
              />
              {errors.name && <span style={{ fontSize: 11, color: '#C45A35' }}>{errors.name}</span>}
            </Field>

            <div className="pm-grid-2">
              <Field label="CPF" hint="Necessário para emissão de recibos">
                <input
                  style={inputStyle()}
                  value={form.cpf}
                  onChange={setCPF}
                  placeholder="000.000.000-00"
                  onFocus={e => { e.target.style.borderColor = '#AD6D15'; e.target.style.background = 'white'; }}
                  onBlur={e => { e.target.style.borderColor = '#E8D9BE'; }}
                />
              </Field>
              <Field label="Data de nascimento">
                <input
                  type="date"
                  style={inputStyle()}
                  value={form.birthDate}
                  onChange={set('birthDate')}
                  onFocus={e => { e.target.style.borderColor = '#AD6D15'; e.target.style.background = 'white'; }}
                  onBlur={e => { e.target.style.borderColor = '#E8D9BE'; }}
                />
              </Field>
              <Field label="Telefone" required>
                <input
                  style={inputStyle(!!errors.phone)}
                  value={form.phone}
                  onChange={setPhone}
                  placeholder="(81) 99999-9999"
                  onFocus={e => { e.target.style.borderColor = '#AD6D15'; e.target.style.background = 'white'; }}
                  onBlur={e => { e.target.style.borderColor = errors.phone ? '#C45A35' : '#E8D9BE'; }}
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
                  onFocus={e => { e.target.style.borderColor = '#AD6D15'; e.target.style.background = 'white'; }}
                  onBlur={e => { e.target.style.borderColor = '#E8D9BE'; }}
                />
              </Field>
            </div>
          </div>

          <SectionLabel icon={IconClinical}>Informações clínicas</SectionLabel>
          <div className="pm-grid-2">
            <Field label="Tipo de terapia" required>
              <select
                style={inputStyle(!!errors.therapyType)}
                value={form.therapyType}
                onChange={set('therapyType')}
                onFocus={e => { e.target.style.borderColor = '#AD6D15'; }}
                onBlur={e => { e.target.style.borderColor = errors.therapyType ? '#C45A35' : '#E8D9BE'; }}
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
                onFocus={e => { e.target.style.borderColor = '#AD6D15'; }}
                onBlur={e => { e.target.style.borderColor = '#E8D9BE'; }}
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
                onFocus={e => { e.target.style.borderColor = '#AD6D15'; }}
                onBlur={e => { e.target.style.borderColor = '#E8D9BE'; }}
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
                onFocus={e => { e.target.style.borderColor = '#AD6D15'; e.target.style.background = 'white'; }}
                onBlur={e => { e.target.style.borderColor = '#E8D9BE'; }}
              />
            </Field>

            <Field label="Próxima sessão">
              <input
                type="datetime-local"
                style={inputStyle()}
                value={form.nextSession}
                onChange={set('nextSession')}
                onFocus={e => { e.target.style.borderColor = '#AD6D15'; }}
                onBlur={e => { e.target.style.borderColor = '#E8D9BE'; }}
              />
            </Field>

            <Field label="Última sessão">
              <input
                type="date"
                style={inputStyle()}
                value={form.lastSession}
                onChange={set('lastSession')}
                onFocus={e => { e.target.style.borderColor = '#AD6D15'; }}
                onBlur={e => { e.target.style.borderColor = '#E8D9BE'; }}
              />
            </Field>
          </div>

          <SectionLabel icon={IconMoney}>Financeiro</SectionLabel>
          <div className="pm-grid-3">
            <Field label="Valor da sessão" required>
              <input
                style={inputStyle(!!errors.sessionValue)}
                value={form.sessionValue}
                onChange={setCurrency('sessionValue')}
                placeholder="R$ 0,00"
                onFocus={e => { e.target.style.borderColor = '#AD6D15'; e.target.style.background = 'white'; }}
                onBlur={e => { e.target.style.borderColor = errors.sessionValue ? '#C45A35' : '#E8D9BE'; }}
              />
              {errors.sessionValue && <span style={{ fontSize: 11, color: '#C45A35' }}>{errors.sessionValue}</span>}
            </Field>
            <Field label="Convênio / Plano">
              <input
                style={inputStyle()}
                value={form.insurance}
                onChange={set('insurance')}
                placeholder="Particular, Unimed..."
                onFocus={e => { e.target.style.borderColor = '#AD6D15'; e.target.style.background = 'white'; }}
                onBlur={e => { e.target.style.borderColor = '#E8D9BE'; }}
              />
            </Field>
            <Field label="Valor pendente">
              <input
                style={inputStyle()}
                value={form.pendingAmount}
                onChange={setCurrency('pendingAmount')}
                placeholder="R$ 0,00"
                onFocus={e => { e.target.style.borderColor = '#AD6D15'; e.target.style.background = 'white'; }}
                onBlur={e => { e.target.style.borderColor = '#E8D9BE'; }}
              />
            </Field>
          </div>

          <SectionLabel icon={IconStatus}>Status do paciente</SectionLabel>
          <div className="pm-status-options">
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
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: opt.border }} />
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

        <div className="pm-modal-footer">
          <span className="pm-footer-hint">
            <span style={{ color: '#C45A35' }}>*</span> campos obrigatórios
          </span>
          <div className="pm-footer-buttons">
            <button onClick={onClose} className="pm-btn-cancel">
              Cancelar
            </button>
            <button onClick={handleSubmit} disabled={saving} className="pm-btn-save">
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
                  {patient ? 'Salvar Edição' : 'Cadastrar Paciente'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .pm-overlay, .pm-overlay * { box-sizing: border-box !important; }

        .pm-overlay {
          position: fixed;
          inset: 0;
          background: rgba(26,16,8,0.55);
          backdrop-filter: blur(4px);
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }

        .pm-modal-box {
          background: white;
          border-radius: 20px;
          width: 100%;
          max-width: 680px;
          max-height: calc(100vh - 32px);
          margin: auto;
          display: flex;
          flex-direction: column;
          box-shadow: 0 24px 64px rgba(0,0,0,0.2);
          overflow: hidden;
        }

        .pm-modal-header {
          background: #1A1008;
          padding: 24px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          flex-shrink: 0;
        }

        .pm-header-left-content {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
        }

        .pm-header-icon-box {
          width: 44px; height: 44px;
          border-radius: 12px;
          background: rgba(239,187,85,0.15);
          border: 1px solid rgba(239,187,85,0.3);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .pm-header-texts {
          display: flex;
          flex-direction: column;
          justify-content: center;
          flex: 1;
        }

        .pm-title {
          font-family: 'Lora', serif !important;
          font-size: 22px !important;
          font-weight: 600 !important;
          color: #FFFFFF !important;
          line-height: 1.2 !important;
          margin: 0 !important;
          white-space: normal !important; /* BLINDAGEM CONTRA CORTE DE TEXTO */
        }

        .pm-subtitle {
          font-size: 12px;
          color: rgba(239,187,85,0.6);
          margin-top: 4px;
          line-height: 1.3;
          white-space: normal !important;
        }

        .pm-close-btn {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.5);
          width: 32px; height: 32px; border-radius: 8px;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          font-size: 16px; transition: all 0.18s; flex-shrink: 0;
          margin-left: 12px;
        }

        .pm-close-btn:hover { color: #FFF; background: rgba(255,255,255,0.15); }

        .pm-modal-body {
          padding: 24px 32px;
          overflow-y: auto;
          overflow-x: hidden;
          flex: 1;
        }

        .pm-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .pm-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
        .pm-status-options { display: flex; gap: 10px; }

        .pm-modal-footer {
          padding: 18px 32px; border-top: 1px solid #F0E8D8; display: flex;
          justify-content: space-between; align-items: center; background: #FDFAF5; flex-shrink: 0;
        }

        .pm-footer-hint { font-size: 11px; color: #9A7040; }
        .pm-footer-buttons { display: flex; gap: 12px; }

        .pm-btn-cancel {
          background: none; border: 1.5px solid #D9C49A; color: #9A7040; padding: 10px 20px;
          border-radius: 8px; font-size: 12px; font-weight: 600; letter-spacing: 0.05em;
          text-transform: uppercase; cursor: pointer; display: flex; align-items: center; justify-content: center;
        }

        .pm-btn-save {
          background: #1A1008; color: #EFBB55; border: none; padding: 10px 28px;
          border-radius: 8px; font-size: 12px; font-weight: 600; letter-spacing: 0.06em;
          text-transform: uppercase; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.18s;
        }

        .pm-btn-save:disabled { background: #9A7040; cursor: not-allowed; }

        @media (max-width: 640px) {
          .pm-overlay { padding: 12px; }
          .pm-modal-box { max-height: calc(100vh - 24px); border-radius: 16px; }

          .pm-modal-header { padding: 16px; }
          .pm-header-left-content { gap: 12px; }
          .pm-header-icon-box { width: 36px; height: 36px; }
          .pm-header-icon-box svg { width: 18px; height: 18px; }
          .pm-title { font-size: 18px !important; }
          .pm-subtitle { font-size: 11px; }

          .pm-modal-body { padding: 20px; }
          .pm-grid-2, .pm-grid-3 { grid-template-columns: 1fr; gap: 12px; }
          .pm-status-options { flex-direction: column; }
          
          .pm-modal-footer { padding: 16px 20px; flex-direction: column; gap: 16px; align-items: center; }
          .pm-footer-buttons { width: 100%; flex-direction: column-reverse; }
          .pm-btn-cancel, .pm-btn-save { width: 100%; justify-content: center; }
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
}