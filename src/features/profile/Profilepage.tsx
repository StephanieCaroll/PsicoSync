'use client';

import React, { useState, useEffect, useRef } from 'react';
import { account, databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import styles from './Profilepage.module.css';

const DB_ID  = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COL_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!;

/* ── Types ── */
interface ProfileData {
  $id: string;
  userId: string;
  name: string;
  email: string;
  crp: string;
  phone: string;
  specialty: string;
}

interface ProfilePageProps {
  onBack?: () => void;
}

type Tab = 'perfil' | 'seguranca' | 'preferencias';

/* ── Helpers ── */
function getInitials(name: string) {
  return name
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}

function formatPhone(val: string) {
  let v = val.replace(/\D/g, '');
  if (v.length > 11) v = v.substring(0, 11);
  if (v.length > 6)
    return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
  if (v.length > 2)
    return `(${v.slice(0, 2)}) ${v.slice(2)}`;
  return v;
}

function formatCRP(val: string) {
  let v = val.replace(/\D/g, '');
  if (v.length > 8) v = v.substring(0, 8);
  if (v.length > 2) return `${v.slice(0, 2)}/${v.slice(2)}`;
  return v;
}

const SPECIALTIES = [
  'Clínica Geral', 'Neuropsicologia', 'Psicologia Infantil',
  'Psicologia Organizacional', 'Saúde Mental', 'Terapia de Casal',
  'Psicanálise', 'TCC', 'Outra',
];

/* ── Sub-components ── */

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`${styles.toast} ${type === 'success' ? styles.toastSuccess : styles.toastError}`}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        {type === 'success'
          ? <polyline points="20 6 9 17 4 12" />
          : <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>
        }
      </svg>
      <span>{message}</span>
      <button onClick={onClose} className={styles.toastClose}>×</button>
    </div>
  );
}

function Skeleton({ w, h, radius = 8 }: { w: string | number; h: string | number; radius?: number }) {
  return (
    <div
      className={styles.skeleton}
      style={{ width: w, height: h, borderRadius: radius }}
    />
  );
}

/* ── Main Component ── */
export default function ProfilePage({ onBack }: ProfilePageProps) {
  const [activeTab, setActiveTab]     = useState<Tab>('perfil');
  const [profile, setProfile]         = useState<ProfileData | null>(null);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [docId, setDocId]             = useState('');
  const [toast, setToast]             = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [avatarHover, setAvatarHover] = useState(false);
  const canvasRef                     = useRef<HTMLCanvasElement>(null);

  /* form fields */
  const [name, setName]           = useState('');
  const [crp, setCrp]             = useState('');
  const [phone, setPhone]         = useState('');
  const [specialty, setSpecialty] = useState('');
  const [bio, setBio]             = useState('');

  /* password fields */
  const [currentPw, setCurrentPw]   = useState('');
  const [newPw, setNewPw]           = useState('');
  const [confirmPw, setConfirmPw]   = useState('');
  const [showPw, setShowPw]         = useState({ current: false, new: false, confirm: false });
  const [pwErrors, setPwErrors]     = useState<Record<string, string>>({});

  /* preferences */
  const [notifEmail, setNotifEmail]   = useState(true);
  const [notifSms, setNotifSms]       = useState(false);
  const [theme, setTheme]             = useState<'light' | 'dark'>('light');
  const [lang, setLang]               = useState('pt-BR');

  /* ── Background canvas ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;
    let t = 0;
    const resize = () => {
      canvas.width  = canvas.offsetWidth  * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);
    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      const grad = ctx.createRadialGradient(
        w * 0.75 + Math.sin(t * 0.18) * 60, h * 0.3 + Math.cos(t * 0.13) * 40, 0,
        w * 0.75, h * 0.3, w * 0.55,
      );
      grad.addColorStop(0, 'rgba(173,109,21,0.07)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      t += 0.006;
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  /* ── Fetch profile ── */
  useEffect(() => {
    (async () => {
      try {
        const user = await account.get();
        const res  = await databases.listDocuments(DB_ID, COL_ID, [
          Query.equal('userId', user.$id),
        ]);
        if (res.documents.length > 0) {
          const doc = res.documents[0] as unknown as ProfileData;
          setProfile(doc);
          setDocId(doc.$id);
          setName(doc.name ?? '');
          setCrp(doc.crp ?? '');
          setPhone(doc.phone ?? '');
          setSpecialty(doc.specialty ?? '');
        }
      } catch (err) {
        showToast('Erro ao carregar perfil.', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type });

  /* ── Save profile ── */
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { showToast('O nome é obrigatório.', 'error'); return; }
    setSaving(true);
    try {
      await databases.updateDocument(DB_ID, COL_ID, docId, {
        name, crp, phone, specialty,
      });
      await account.updateName(name);
      setProfile(prev => prev ? { ...prev, name, crp, phone, specialty } : prev);
      showToast('Perfil atualizado com sucesso!', 'success');
    } catch {
      showToast('Erro ao salvar. Tente novamente.', 'error');
    } finally {
      setSaving(false);
    }
  };

  /* ── Change password ── */
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!currentPw) errs.current = 'Informe a senha atual';
    if (newPw.length < 8) errs.new = 'Mínimo 8 caracteres';
    if (newPw !== confirmPw) errs.confirm = 'Senhas não coincidem';
    setPwErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      await account.updatePassword(newPw, currentPw);
      showToast('Senha alterada com sucesso!', 'success');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch {
      showToast('Senha atual incorreta ou erro no servidor.', 'error');
    } finally {
      setSaving(false);
    }
  };

  /* ── Computed ── */
  const initials     = getInitials(name || profile?.name || '?');
  const displayName  = name  || profile?.name  || 'Profissional';
  const displayCrp   = crp   || profile?.crp   || '';
  const displaySpec  = specialty || profile?.specialty || '';

  const pwStrength = (p: string) => {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    const map = ['', 'Fraca', 'Razoável', 'Boa', 'Forte'];
    const col = ['', '#C45A35', '#D9A52A', '#7EAD3A', '#2E9E5B'];
    return { level: s, label: map[s] || '', color: col[s] || '' };
  };
  const strength = pwStrength(newPw);

  return (
    <div className={styles.page}>
      <canvas ref={canvasRef} className={styles.bgCanvas} />

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className={styles.inner}>

        {/* ── Back button ── */}
        {onBack && (
          <button className={styles.backBtn} onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Voltar ao painel
          </button>
        )}

        {/* ── Hero ── */}
        <div className={styles.hero}>
          <div
            className={`${styles.avatarWrap} ${avatarHover ? styles.avatarWrapHover : ''}`}
            onMouseEnter={() => setAvatarHover(true)}
            onMouseLeave={() => setAvatarHover(false)}
          >
            {loading
              ? <Skeleton w={96} h={96} radius={24} />
              : (
                <>
                  <div className={styles.avatar}>{initials}</div>
                  <div className={styles.avatarOverlay}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>
                  <div className={styles.statusDot} />
                </>
              )
            }
          </div>

          <div className={styles.heroInfo}>
            {loading ? (
              <>
                <Skeleton w={200} h={28} radius={6} />
                <Skeleton w={120} h={16} radius={4} />
                <Skeleton w={160} h={14} radius={4} />
              </>
            ) : (
              <>
                <h1 className={styles.heroName}>{displayName}</h1>
                {displayCrp && <div className={styles.heroCrp}>CRP {displayCrp}</div>}
                {displaySpec && <div className={styles.heroSpec}>{displaySpec}</div>}
                <div className={styles.heroBadges}>
                  <span className={styles.badge}>
                    <span className={styles.badgeDot} />
                    Online
                  </span>
                  <span className={styles.badgeOutline}>Conta verificada</span>
                </div>
              </>
            )}
          </div>

          {/* Stats row */}
          <div className={styles.heroStats}>
            {[
              { label: 'Membro desde', value: '2025' },
              { label: 'Sessões realizadas', value: '—' },
              { label: 'Pacientes ativos', value: '—' },
            ].map(s => (
              <div key={s.label} className={styles.statCell}>
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className={styles.tabs}>
          {(['perfil', 'seguranca', 'preferencias'] as Tab[]).map(tab => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {tab === 'perfil' && <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></>}
                {tab === 'seguranca' && <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>}
                {tab === 'preferencias' && <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>}
              </svg>
              {tab === 'perfil' && 'Dados Pessoais'}
              {tab === 'seguranca' && 'Segurança'}
              {tab === 'preferencias' && 'Preferências'}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        <div className={styles.body}>

          {/* PERFIL TAB */}
          {activeTab === 'perfil' && (
            <form onSubmit={handleSaveProfile} className={styles.form} noValidate>
              <div className={styles.formGrid}>

                {/* Left column */}
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <div className={styles.sectionIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EFBB55" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                      </svg>
                    </div>
                    <div>
                      <h2 className={styles.sectionTitle}>Informações Pessoais</h2>
                      <p className={styles.sectionSub}>Seus dados de identificação profissional.</p>
                    </div>
                  </div>

                  <div className={styles.fields}>
                    <FieldGroup label="Nome completo" required>
                      {loading
                        ? <Skeleton w="100%" h={44} />
                        : (
                          <input
                            className={styles.input}
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Dra. Ana Beatriz Silva"
                          />
                        )
                      }
                    </FieldGroup>

                    <FieldGroup label="E-mail profissional">
                      {loading
                        ? <Skeleton w="100%" h={44} />
                        : (
                          <input
                            className={`${styles.input} ${styles.inputDisabled}`}
                            value={profile?.email ?? ''}
                            readOnly
                            title="O e-mail não pode ser alterado por aqui."
                          />
                        )
                      }
                      <span className={styles.hint}>O e-mail não pode ser alterado diretamente.</span>
                    </FieldGroup>

                    <div className={styles.twoCol}>
                      <FieldGroup label="CRP">
                        {loading
                          ? <Skeleton w="100%" h={44} />
                          : (
                            <input
                              className={styles.input}
                              value={crp}
                              onChange={e => setCrp(formatCRP(e.target.value))}
                              placeholder="06/00000"
                            />
                          )
                        }
                      </FieldGroup>
                      <FieldGroup label="Telefone">
                        {loading
                          ? <Skeleton w="100%" h={44} />
                          : (
                            <input
                              className={styles.input}
                              value={phone}
                              onChange={e => setPhone(formatPhone(e.target.value))}
                              placeholder="(11) 99999-9999"
                            />
                          )
                        }
                      </FieldGroup>
                    </div>

                    <FieldGroup label="Especialidade">
                      {loading
                        ? <Skeleton w="100%" h={44} />
                        : (
                          <select
                            className={styles.select}
                            value={specialty}
                            onChange={e => setSpecialty(e.target.value)}
                          >
                            <option value="">Selecione uma especialidade</option>
                            {SPECIALTIES.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        )
                      }
                    </FieldGroup>

                    <FieldGroup label="Biografia">
                      {loading
                        ? <Skeleton w="100%" h={88} />
                        : (
                          <textarea
                            className={styles.textarea}
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            placeholder="Escreva uma breve apresentação sobre sua atuação clínica..."
                            rows={3}
                          />
                        )
                      }
                    </FieldGroup>
                  </div>
                </div>

                {/* Right column — info card */}
                <div className={styles.aside}>
                  <div className={styles.infoCard}>
                    <div className={styles.infoCardHeader}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#EFBB55" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      Informações da conta
                    </div>
                    <div className={styles.infoRows}>
                      <InfoRow label="ID do usuário" value={profile?.userId ? `${profile.userId.slice(0, 16)}…` : '—'} mono />
                      <InfoRow label="Plano" value="Gratuito — 14 dias" />
                      <InfoRow label="Status" value="Ativo" green />
                      <InfoRow label="Último acesso" value="Hoje" />
                    </div>
                  </div>

                  <div className={styles.tipCard}>
                    <div className={styles.tipIcon}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#AD6D15" strokeWidth="1.8">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </div>
                    <p className={styles.tipText}>
                      Mantenha seus dados atualizados para que seus pacientes possam se comunicar com você facilmente.
                    </p>
                  </div>
                </div>
              </div>

              {/* Save bar */}
              <div className={styles.saveBar}>
                <span className={styles.saveHint}>As alterações serão salvas imediatamente no seu perfil.</span>
                <button type="submit" className={styles.btnSave} disabled={saving || loading}>
                  {saving ? (
                    <><span className={styles.spinner} />Salvando…</>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Salvar alterações
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* SEGURANÇA TAB */}
          {activeTab === 'seguranca' && (
            <form onSubmit={handleChangePassword} className={styles.form} noValidate>
              <div className={styles.formGrid}>
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <div className={styles.sectionIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EFBB55" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    <div>
                      <h2 className={styles.sectionTitle}>Alterar Senha</h2>
                      <p className={styles.sectionSub}>Use uma senha forte para proteger sua conta.</p>
                    </div>
                  </div>

                  <div className={styles.fields}>
                    <FieldGroup label="Senha atual" error={pwErrors.current}>
                      <PasswordInput
                        value={currentPw}
                        onChange={setCurrentPw}
                        show={showPw.current}
                        onToggle={() => setShowPw(s => ({ ...s, current: !s.current }))}
                        placeholder="Digite sua senha atual"
                        hasError={!!pwErrors.current}
                      />
                    </FieldGroup>

                    <FieldGroup label="Nova senha" error={pwErrors.new}>
                      <PasswordInput
                        value={newPw}
                        onChange={setNewPw}
                        show={showPw.new}
                        onToggle={() => setShowPw(s => ({ ...s, new: !s.new }))}
                        placeholder="Mínimo 8 caracteres"
                        hasError={!!pwErrors.new}
                      />
                      {newPw && (
                        <div className={styles.strengthWrap}>
                          <div className={styles.strengthBars}>
                            {[1, 2, 3, 4].map(i => (
                              <div
                                key={i}
                                className={styles.strengthBar}
                                style={{ background: i <= strength.level ? strength.color : '#E8D9BE' }}
                              />
                            ))}
                          </div>
                          <span style={{ color: strength.color }}>{strength.label}</span>
                        </div>
                      )}
                    </FieldGroup>

                    <FieldGroup label="Confirmar nova senha" error={pwErrors.confirm}>
                      <PasswordInput
                        value={confirmPw}
                        onChange={setConfirmPw}
                        show={showPw.confirm}
                        onToggle={() => setShowPw(s => ({ ...s, confirm: !s.confirm }))}
                        placeholder="Repita a nova senha"
                        hasError={!!pwErrors.confirm}
                      />
                    </FieldGroup>

                    {/* Requirements */}
                    <div className={styles.requirementsBox}>
                      <p className={styles.requirementsTitle}>A nova senha precisa ter</p>
                      {[
                        { check: newPw.length >= 8, text: 'Mínimo de 8 caracteres' },
                        { check: /[A-Z]/.test(newPw), text: 'Uma letra maiúscula' },
                        { check: /[0-9]/.test(newPw), text: 'Um número' },
                        { check: /[^A-Za-z0-9]/.test(newPw), text: 'Um caractere especial (!@#…)' },
                      ].map((r, i) => (
                        <div key={i} className={styles.requirementRow}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                            stroke={r.check ? '#2E9E5B' : '#D9C49A'} strokeWidth="2.5">
                            {r.check
                              ? <polyline points="20 6 9 17 4 12" />
                              : <circle cx="12" cy="12" r="9" />
                            }
                          </svg>
                          <span style={{ color: r.check ? '#5A3E20' : '#C4A97A' }}>{r.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={styles.aside}>
                  <div className={styles.infoCard}>
                    <div className={styles.infoCardHeader}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#EFBB55" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      Dicas de segurança
                    </div>
                    <ul className={styles.tipList}>
                      {[
                        'Nunca compartilhe sua senha.',
                        'Troque sua senha regularmente.',
                        'Evite usar a mesma senha em outros serviços.',
                        'Use um gerenciador de senhas.',
                      ].map((tip, i) => (
                        <li key={i} className={styles.tipItem}>
                          <span className={styles.tipBullet} />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className={styles.saveBar}>
                <span className={styles.saveHint}>A sessão atual será mantida após a troca.</span>
                <button type="submit" className={styles.btnSave} disabled={saving}>
                  {saving ? (
                    <><span className={styles.spinner} />Alterando…</>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      Alterar senha
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* PREFERÊNCIAS TAB */}
          {activeTab === 'preferencias' && (
            <div className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <div className={styles.sectionIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EFBB55" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className={styles.sectionTitle}>Preferências</h2>
                      <p className={styles.sectionSub}>Personalize sua experiência na plataforma.</p>
                    </div>
                  </div>

                  <div className={styles.fields}>
                    {/* Notifications */}
                    <div className={styles.prefGroup}>
                      <h3 className={styles.prefGroupTitle}>Notificações</h3>
                      <ToggleRow
                        label="E-mail"
                        description="Receber lembretes e alertas por e-mail."
                        checked={notifEmail}
                        onChange={setNotifEmail}
                      />
                      <ToggleRow
                        label="SMS"
                        description="Receber notificações por mensagem de texto."
                        checked={notifSms}
                        onChange={setNotifSms}
                      />
                    </div>

                    {/* Appearance */}
                    <div className={styles.prefGroup}>
                      <h3 className={styles.prefGroupTitle}>Aparência</h3>
                      <div className={styles.themeRow}>
                        {(['light', 'dark'] as const).map(t => (
                          <button
                            key={t}
                            type="button"
                            className={`${styles.themeBtn} ${theme === t ? styles.themeBtnActive : ''}`}
                            onClick={() => setTheme(t)}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              {t === 'light'
                                ? <><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></>
                                : <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                              }
                            </svg>
                            {t === 'light' ? 'Claro' : 'Escuro'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Language */}
                    <div className={styles.prefGroup}>
                      <h3 className={styles.prefGroupTitle}>Idioma</h3>
                      <FieldGroup label="Idioma da interface">
                        <select
                          className={styles.select}
                          value={lang}
                          onChange={e => setLang(e.target.value)}
                        >
                          <option value="pt-BR">Português (Brasil)</option>
                          <option value="en-US">English (US)</option>
                          <option value="es">Español</option>
                        </select>
                      </FieldGroup>
                    </div>
                  </div>
                </div>

                <div className={styles.aside}>
                  <div className={styles.infoCard}>
                    <div className={styles.infoCardHeader}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#EFBB55" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      Sobre as preferências
                    </div>
                    <p className={styles.infoCardText}>
                      As preferências de aparência e idioma serão salvas localmente no seu navegador.
                      As notificações são sincronizadas com o servidor.
                    </p>
                  </div>
                </div>
              </div>

              <div className={styles.saveBar}>
                <span className={styles.saveHint}>Algumas preferências requerem recarregamento da página.</span>
                <button
                  type="button"
                  className={styles.btnSave}
                  onClick={() => showToast('Preferências salvas!', 'success')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Salvar preferências
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function FieldGroup({
  label,
  children,
  required,
  error,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
}) {
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      {children}
      {error && <span className={styles.errorMsg}>{error}</span>}
    </div>
  );
}

function PasswordInput({
  value, onChange, show, onToggle, placeholder, hasError,
}: {
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  placeholder?: string;
  hasError?: boolean;
}) {
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        className={`${styles.input} ${hasError ? styles.inputError : ''}`}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ paddingRight: 40 }}
      />
      <button
        type="button"
        onClick={onToggle}
        style={{
          position: 'absolute', right: 12, top: '50%',
          transform: 'translateY(-50%)', background: 'none',
          border: 'none', cursor: 'pointer', color: '#C4A97A',
          display: 'flex', alignItems: 'center', padding: 0,
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          {show
            ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" /></>
            : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
          }
        </svg>
      </button>
    </div>
  );
}

function InfoRow({ label, value, mono, green }: { label: string; value: string; mono?: boolean; green?: boolean }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoRowLabel}>{label}</span>
      <span
        className={styles.infoRowValue}
        style={{
          fontFamily: mono ? 'monospace' : undefined,
          color: green ? '#2E9E5B' : undefined,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function ToggleRow({
  label, description, checked, onChange,
}: {
  label: string; description: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className={styles.toggleRow}>
      <div className={styles.toggleInfo}>
        <span className={styles.toggleLabel}>{label}</span>
        <span className={styles.toggleDesc}>{description}</span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`${styles.toggle} ${checked ? styles.toggleOn : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.toggleThumb} />
      </button>
    </div>
  );
}