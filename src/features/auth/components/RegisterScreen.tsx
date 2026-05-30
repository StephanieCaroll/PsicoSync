'use client';

import React, { useState, useEffect, useRef } from 'react';

interface RegisterScreenProps {
  onRegister: () => void;
  onNavigateToLogin: () => void;
}

type Field = 'name' | 'email' | 'crp' | 'phone' | 'password' | 'confirm';
type Step = 1 | 2;

export default function RegisterScreen({ onRegister, onNavigateToLogin }: RegisterScreenProps) {
  const [step, setStep] = useState<Step>(1);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<Field | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [fields, setFields] = useState({
    name: '', email: '', crp: '', phone: '', specialty: '', password: '', confirm: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;
    let t = 0;
    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);
    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      const orbX = w * 0.6 + Math.sin(t * 0.22) * w * 0.1;
      const orbY = h * 0.45 + Math.cos(t * 0.16) * h * 0.1;
      const grad = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, w * 0.5);
      grad.addColorStop(0, 'rgba(173,109,21,0.12)');
      grad.addColorStop(0.6, 'rgba(239,187,85,0.04)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(173,109,21,0.04)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= 8; i++) { ctx.beginPath(); ctx.moveTo((w/8)*i,0); ctx.lineTo((w/8)*i,h); ctx.stroke(); }
      for (let j = 0; j <= 10; j++) { ctx.beginPath(); ctx.moveTo(0,(h/10)*j); ctx.lineTo(w,(h/10)*j); ctx.stroke(); }
      t += 0.008;
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  const set = (key: string, val: string) => setFields(f => ({ ...f, [key]: val }));
  const setErr = (key: string, val: string) => setErrors(e => ({ ...e, [key]: val }));

  const validators: Record<string, (v: string) => string> = {
    name: v => !v.trim() ? 'Nome é obrigatório' : v.trim().split(' ').length < 2 ? 'Informe nome e sobrenome' : '',
    email: v => !v ? 'E-mail é obrigatório' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'E-mail inválido' : '',
    crp: v => !v.trim() ? 'CRP é obrigatório' : '',
    phone: v => !v.trim() ? 'Telefone é obrigatório' : '',
    password: v => !v ? 'Senha é obrigatória' : v.length < 8 ? 'Mínimo de 8 caracteres' : '',
    confirm: v => !v ? 'Confirmação é obrigatória' : v !== fields.password ? 'Senhas não coincidem' : '',
  };

  const validate = (key: string, val: string) => {
    const msg = validators[key] ? validators[key](val) : '';
    setErr(key, msg);
    return msg;
  };

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    ['name','email','crp','phone'].forEach(k => { errs[k] = validators[k](fields[k as keyof typeof fields]); });
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    setStep(2);
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    ['password','confirm'].forEach(k => { errs[k] = validators[k](fields[k as keyof typeof fields]); });
    if (!agreed) errs.agreed = 'Você precisa concordar com os termos';
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); onRegister(); }, 1800);
  };

  const passwordStrength = (p: string): { level: number; label: string; color: string } => {
    if (!p) return { level: 0, label: '', color: 'transparent' };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { level: 1, label: 'Fraca', color: '#C45A35' };
    if (score === 2) return { level: 2, label: 'Razoável', color: '#D9A52A' };
    if (score === 3) return { level: 3, label: 'Boa', color: '#7EAD3A' };
    return { level: 4, label: 'Forte', color: '#2E9E5B' };
  };

  const pwStrength = passwordStrength(fields.password);

  const specialties = [
    'Clínica Geral', 'Neuropsicologia', 'Psicologia Infantil',
    'Psicologia Organizacional', 'Saúde Mental', 'Terapia de Casal',
    'Psicanálise', 'TCC', 'Outra'
  ];

  const InputField = ({
    id, label, type = 'text', placeholder, value, icon, rightSlot, autoComplete
  }: {
    id: string; label: string; type?: string; placeholder: string;
    value: string; icon: React.ReactNode; rightSlot?: React.ReactNode; autoComplete?: string;
  }) => (
    <div>
      <label className="lbl">{label}</label>
      <div style={{ position: 'relative' }}>
        <div style={{ position:'absolute',left:0,top:'50%',transform:'translateY(-50%)',opacity:.4,pointerEvents:'none' }}>{icon}</div>
        <input
          type={type} autoComplete={autoComplete}
          className={`inp inp-ic${focusedField===id?' foc':''}${errors[id]?' err':''}`}
          placeholder={placeholder} value={value}
          onChange={e => { set(id, e.target.value); validate(id, e.target.value); }}
          onFocus={() => setFocusedField(id as Field)}
          onBlur={() => setFocusedField(null)}
          style={{ paddingRight: rightSlot ? 36 : 0 }}
        />
        {rightSlot && <div style={{ position:'absolute',right:0,top:'50%',transform:'translateY(-50%)',display:'flex',alignItems:'center' }}>{rightSlot}</div>}
      </div>
      {errors[id] && <p className="errmsg">{errors[id]}</p>}
    </div>
  );

  return (
    <div style={{ fontFamily:"'Lora','Georgia',serif", height:'100vh', display:'flex', overflow:'hidden', background:'#FAF6EE' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slide-left{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        @keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:.4}}
        .fu{animation:fadeUp .55s cubic-bezier(.22,1,.36,1) both}
        .d1{animation-delay:.05s}.d2{animation-delay:.1s}.d3{animation-delay:.15s}
        .d4{animation-delay:.2s}.d5{animation-delay:.25s}.d6{animation-delay:.3s}.d7{animation-delay:.35s}
        .slide-l{animation:slide-left .45s cubic-bezier(.22,1,.36,1) both}

        .lbl{font-family:'DM Sans',sans-serif;font-size:10px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:#9A7040;display:block;margin-bottom:5px}
        .inp{width:100%;background:transparent;border:none;border-bottom:1.5px solid #D9C49A;padding:9px 0;font-family:'DM Sans',sans-serif;font-size:14px;color:#2D1F0A;outline:none;transition:border-color .2s;display:block}
        .inp-ic{padding-left:22px}
        .inp::placeholder{color:#C4A97A}
        .inp.foc{border-bottom-color:#AD6D15}
        .inp.err{border-bottom-color:#C45A35}
        .errmsg{font-family:'DM Sans',sans-serif;font-size:11px;color:#C45A35;margin-top:4px;display:block}

        select.inp{-webkit-appearance:none;appearance:none;cursor:pointer;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23C4A97A' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 2px center;padding-right:20px}
        select.inp option{color:#2D1F0A;background:white}

        .btn-main{width:100%;padding:13px 20px;background:#2D1F0A;color:#FAF6EE;border:none;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:background .2s,transform .12s;display:flex;align-items:center;justify-content:center;gap:8px}
        .btn-main:hover:not(:disabled){background:#AD6D15}
        .btn-main:active:not(:disabled){transform:scale(.99)}
        .btn-main:disabled{opacity:.65;cursor:not-allowed}
        .btn-ghost{width:100%;padding:12px 20px;background:transparent;color:#AD6D15;border:1.5px solid #D9C49A;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:border-color .2s,background .2s}
        .btn-ghost:hover{border-color:#AD6D15;background:#F5ECD8}
        .btn-back{background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:6px;font-family:'DM Sans',sans-serif;font-size:12px;color:#9A7040;padding:0;transition:color .2s;letter-spacing:.04em}
        .btn-back:hover{color:#AD6D15}

        .chkbox{width:15px;height:15px;border:1.5px solid #C4A97A;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:border-color .2s,background .2s}
        .chkbox.on{border-color:#AD6D15;background:#AD6D15}
        .spinner{width:14px;height:14px;border:2px solid rgba(250,246,238,.3);border-top-color:#FAF6EE;border-radius:50%;animation:spin .8s linear infinite}
        .divline{flex:1;height:1px;background:#E8D9BE}

        .step-dot{width:8px;height:8px;border-radius:50%;transition:background .3s,transform .3s}
        .step-dot.active{background:#AD6D15;transform:scale(1.2)}
        .step-dot.done{background:#2D1F0A}
        .step-dot.idle{background:#D9C49A}
        .step-line{flex:1;height:1px;background:#D9C49A;position:relative;overflow:hidden}
        .step-line-fill{position:absolute;inset:0;background:#AD6D15;transition:transform .4s cubic-bezier(.22,1,.36,1);transform-origin:left}

        .pw-bar{height:2px;flex:1;border-radius:1px;transition:background .3s}

        .rp-step{display:flex;align-items:flex-start;gap:12px;padding:12px 14px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);transition:background .2s}
        .rp-step:hover{background:rgba(255,255,255,.08)}
        .rp-step-num{width:24px;height:24px;border:1px solid rgba(239,187,85,.35);display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:rgba(255,255,255,.1)}
        .stat-cell{background:#1A1008;padding:14px 8px;text-align:center}
        .stat-n{font-family:'Lora',serif;font-size:22px;font-weight:600;color:white;display:block;line-height:1.1}
        .stat-l{font-family:'DM Sans',sans-serif;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.4);display:block;margin-top:2px}

        @media(max-width:1023px){.right-panel{display:none!important}}
        @media(max-width:520px){.two-col{grid-template-columns:1fr!important}}
      `}</style>

      {/* ── LEFT PANEL ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'clamp(20px,3.5vw,48px)', position:'relative', overflow:'hidden' }}>
        <canvas ref={canvasRef} style={{ position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none' }} />

        <div style={{ position:'relative', width:'100%', maxWidth:420 }}>

          {/* Logo */}
          <div className={mounted?'fu':''} style={{ marginBottom:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
              <div style={{ width:36,height:36,background:'#2D1F0A',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="rgba(239,187,85,0.85)"/></svg>
              </div>
              <div>
                <div style={{ fontFamily:"'Lora',serif",fontSize:17,fontWeight:600,color:'#2D1F0A',lineHeight:1 }}>PsicoSync</div>
                <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:9,color:'#9A7040',letterSpacing:'.12em',textTransform:'uppercase',marginTop:1 }}>Gestão Clínica</div>
              </div>
              <button onClick={onNavigateToLogin} className="btn-back" style={{ marginLeft:'auto' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="15 18 9 12 15 6"/></svg>
                Já tenho conta
              </button>
            </div>

            <div style={{ width:24,height:2,background:'#AD6D15',marginBottom:12 }} />
            <h1 style={{ fontFamily:"'Lora',serif",fontSize:'clamp(20px,2.8vw,27px)',fontWeight:600,color:'#2D1F0A',lineHeight:1.2,letterSpacing:'-.02em',marginBottom:4 }}>
              Crie sua conta <span style={{ fontStyle:'italic',color:'#AD6D15' }}>profissional.</span>
            </h1>
            <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:12,color:'#9A7040',lineHeight:1.6 }}>
              Preencha as informações abaixo para começar gratuitamente.
            </p>
          </div>

          <div className={mounted?'fu d1':''} style={{ display:'flex',alignItems:'center',gap:0,marginBottom:20 }}>
            
            <div style={{ display:'flex',alignItems:'center',gap:8 }}>
              <div className={`step-dot ${step===1?'active':'done'}`} />
              <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:10,color:step===1?'#AD6D15':'#9A7040',letterSpacing:'.08em',textTransform:'uppercase',fontWeight:500 }}>
                Dados pessoais
              </span>
            </div>
            <div className="step-line" style={{ margin:'0 12px' }}>
              <div className="step-line-fill" style={{ transform: step===2?'scaleX(1)':'scaleX(0)' }} />
            </div>
           
            <div style={{ display:'flex',alignItems:'center',gap:8 }}>
              <div className={`step-dot ${step===2?'active':'idle'}`} />
              <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:10,color:step===2?'#AD6D15':'#C4A97A',letterSpacing:'.08em',textTransform:'uppercase',fontWeight:500 }}>
                Acesso & Senha
              </span>
            </div>
          </div>

          {step === 1 && (
            <form onSubmit={handleStep1} noValidate className="slide-l">
              <div style={{ display:'flex',flexDirection:'column',gap:14 }}>

                <div className={mounted?'fu d2':''}>
                  <InputField id="name" label="Nome completo" placeholder="Dra. Ana Beatriz Silva" value={fields.name}
                    icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#AD6D15" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>}
                    autoComplete="name"
                  />
                </div>

                {/* Email */}
                <div className={mounted?'fu d3':''}>
                  <InputField id="email" label="E-mail profissional" placeholder="voce@clinica.com.br" value={fields.email}
                    icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#AD6D15" strokeWidth="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>}
                    autoComplete="email"
                  />
                </div>

                {/* CRP + Phone */}
                <div className={`two-col ${mounted?'fu d4':''}`} style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
                  <div>
                    <label className="lbl">CRP</label>
                    <div style={{ position:'relative' }}>
                      <div style={{ position:'absolute',left:0,top:'50%',transform:'translateY(-50%)',opacity:.4,pointerEvents:'none' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#AD6D15" strokeWidth="1.5"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="12" y2="15"/></svg>
                      </div>
                      <input className={`inp inp-ic${focusedField==='crp'?' foc':''}${errors.crp?' err':''}`}
                        placeholder="06/00000" value={fields.crp}
                        onChange={e=>{set('crp',e.target.value);validate('crp',e.target.value)}}
                        onFocus={()=>setFocusedField('crp')} onBlur={()=>setFocusedField(null)} />
                    </div>
                    {errors.crp && <span className="errmsg">{errors.crp}</span>}
                  </div>
                  <div>
                    <label className="lbl">Telefone</label>
                    <div style={{ position:'relative' }}>
                      <div style={{ position:'absolute',left:0,top:'50%',transform:'translateY(-50%)',opacity:.4,pointerEvents:'none' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#AD6D15" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z" transform="translate(1,1)"/></svg>
                      </div>
                      <input className={`inp inp-ic${focusedField==='phone'?' foc':''}${errors.phone?' err':''}`}
                        placeholder="(11) 99999-9999" value={fields.phone} autoComplete="tel"
                        onChange={e=>{set('phone',e.target.value);validate('phone',e.target.value)}}
                        onFocus={()=>setFocusedField('phone')} onBlur={()=>setFocusedField(null)} />
                    </div>
                    {errors.phone && <span className="errmsg">{errors.phone}</span>}
                  </div>
                </div>

                {/* Especialidade */}
                <div className={mounted?'fu d5':''}>
                  <label className="lbl">Especialidade</label>
                  <div style={{ position:'relative' }}>
                    <div style={{ position:'absolute',left:0,top:'50%',transform:'translateY(-50%)',opacity:.4,pointerEvents:'none' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#AD6D15" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    </div>
                    <select className={`inp inp-ic${focusedField==='specialty' as Field?' foc':''}`}
                      value={fields.specialty}
                      onChange={e=>set('specialty',e.target.value)}
                      onFocus={()=>setFocusedField(null)} onBlur={()=>setFocusedField(null)}
                      style={{ paddingRight:28 }}>
                      <option value="">Selecione uma especialidade</option>
                      {specialties.map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                {/* CTA */}
                <div className={mounted?'fu d6':''} style={{ marginTop:4 }}>
                  <button type="submit" className="btn-main">
                    Continuar
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </div>

                <p className={mounted?'fu d7':''} style={{ fontFamily:"'DM Sans',sans-serif",fontSize:11,color:'#C4A97A',textAlign:'center',lineHeight:1.7,marginTop:2 }}>
                  Já tem conta?{' '}
                  <button type="button" onClick={onNavigateToLogin}
                    style={{ background:'none',border:'none',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontSize:11,color:'#AD6D15',textDecoration:'underline',padding:0 }}>
                    Entrar agora
                  </button>
                </p>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleStep2} noValidate className="slide-l">
              <div style={{ display:'flex',flexDirection:'column',gap:14 }}>

                {/* Password */}
                <div className={mounted?'fu d2':''}>
                  <label className="lbl">Senha</label>
                  <div style={{ position:'relative' }}>
                    <div style={{ position:'absolute',left:0,top:'50%',transform:'translateY(-50%)',opacity:.4,pointerEvents:'none' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#AD6D15" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                    </div>
                    <input type={showPassword?'text':'password'} autoComplete="new-password"
                      className={`inp inp-ic${focusedField==='password'?' foc':''}${errors.password?' err':''}`}
                      placeholder="Mínimo 8 caracteres" value={fields.password} style={{ paddingRight:36 }}
                      onChange={e=>{set('password',e.target.value);validate('password',e.target.value);if(fields.confirm)validate('confirm',fields.confirm)}}
                      onFocus={()=>setFocusedField('password')} onBlur={()=>setFocusedField(null)} />
                    <button type="button" onClick={()=>setShowPassword(v=>!v)}
                      style={{ position:'absolute',right:0,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',padding:2,color:'#C4A97A',display:'flex',alignItems:'center' }}>
                      {showPassword
                        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>
                        : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>
               
                  {fields.password && (
                    <div style={{ marginTop:8 }}>
                      <div style={{ display:'flex',gap:4,marginBottom:4 }}>
                        {[1,2,3,4].map(i=>(
                          <div key={i} className="pw-bar" style={{ background: i<=pwStrength.level ? pwStrength.color : '#E8D9BE' }} />
                        ))}
                      </div>
                      <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:10,color:pwStrength.color,letterSpacing:'.05em' }}>{pwStrength.label}</span>
                    </div>
                  )}
                  {errors.password && <span className="errmsg">{errors.password}</span>}
                </div>

                <div className={mounted?'fu d3':''}>
                  <label className="lbl">Confirmar senha</label>
                  <div style={{ position:'relative' }}>
                    <div style={{ position:'absolute',left:0,top:'50%',transform:'translateY(-50%)',opacity:.4,pointerEvents:'none' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#AD6D15" strokeWidth="1.5"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <input type={showConfirm?'text':'password'} autoComplete="new-password"
                      className={`inp inp-ic${focusedField==='confirm'?' foc':''}${errors.confirm?' err':''}`}
                      placeholder="Repita a senha" value={fields.confirm} style={{ paddingRight:36 }}
                      onChange={e=>{set('confirm',e.target.value);validate('confirm',e.target.value)}}
                      onFocus={()=>setFocusedField('confirm')} onBlur={()=>setFocusedField(null)} />
                    <button type="button" onClick={()=>setShowConfirm(v=>!v)}
                      style={{ position:'absolute',right:0,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',padding:2,color:'#C4A97A',display:'flex',alignItems:'center' }}>
                      {showConfirm
                        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>
                        : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>
                  {errors.confirm && <span className="errmsg">{errors.confirm}</span>}
                </div>

                <div className={mounted?'fu d4':''} style={{ padding:'10px 12px',border:'1px solid #E8D9BE',background:'rgba(239,187,85,0.04)' }}>
                  <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:10,color:'#9A7040',letterSpacing:'.06em',textTransform:'uppercase',marginBottom:6,fontWeight:500 }}>Sua senha precisa ter</p>
                  <div style={{ display:'flex',flexDirection:'column',gap:4 }}>
                    {[
                      { check: fields.password.length>=8, text:'Mínimo de 8 caracteres' },
                      { check: /[A-Z]/.test(fields.password), text:'Uma letra maiúscula' },
                      { check: /[0-9]/.test(fields.password), text:'Um número' },
                      { check: /[^A-Za-z0-9]/.test(fields.password), text:'Um caractere especial' },
                    ].map((h,i)=>(
                      <div key={i} style={{ display:'flex',alignItems:'center',gap:7 }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={h.check?'#2E9E5B':'#D9C49A'} strokeWidth="2.5">
                          {h.check ? <polyline points="20 6 9 17 4 12"/> : <circle cx="12" cy="12" r="9"/>}
                        </svg>
                        <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:11,color:h.check?'#5A3E20':'#C4A97A' }}>{h.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={mounted?'fu d5':''}>
                  <label style={{ display:'flex',alignItems:'flex-start',gap:9,cursor:'pointer' }}>
                    <div className={`chkbox${agreed?' on':''}`} style={{ marginTop:1 }} onClick={()=>setAgreed(v=>!v)}>
                      {agreed && <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <span onClick={()=>setAgreed(v=>!v)} style={{ fontFamily:"'DM Sans',sans-serif",fontSize:12,color:'#5A3E20',lineHeight:1.6,userSelect:'none' }}>
                      Concordo com os{' '}
                      <a href="#" style={{ color:'#AD6D15',textDecoration:'underline' }}>Termos de Uso</a>
                      {' '}e a{' '}
                      <a href="#" style={{ color:'#AD6D15',textDecoration:'underline' }}>Política de Privacidade</a>
                    </span>
                  </label>
                  {errors.agreed && <span className="errmsg" style={{ marginTop:6 }}>{errors.agreed}</span>}
                </div>

                <div className={mounted?'fu d6':''} style={{ display:'flex',flexDirection:'column',gap:10,marginTop:2 }}>
                  <button type="submit" className="btn-main" disabled={isLoading}>
                    {isLoading
                      ? <><span className="spinner"/>Criando conta...</>
                      : <>Criar minha conta<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></>
                    }
                  </button>
                  <button type="button" className="btn-ghost" onClick={()=>setStep(1)}>
                    ← Voltar
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="right-panel" style={{ width:'48%',height:'100vh',background:'#1A1008',position:'relative',overflow:'hidden',display:'flex',flexDirection:'column',justifyContent:'space-between',padding:'44px 48px' }}>

        <svg style={{ position:'absolute',inset:0,width:'100%',height:'100%' }} viewBox="0 0 580 800" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="0" cy="0" r="400" stroke="rgba(239,187,85,0.06)" strokeWidth="1"/>
          <circle cx="0" cy="0" r="280" stroke="rgba(239,187,85,0.05)" strokeWidth="1"/>
          <circle cx="580" cy="800" r="360" stroke="rgba(173,109,21,0.07)" strokeWidth="1"/>
          <circle cx="580" cy="800" r="240" stroke="rgba(173,109,21,0.05)" strokeWidth="1"/>
          <line x1="0" y1="300" x2="580" y2="700" stroke="rgba(239,187,85,0.04)" strokeWidth="1"/>
          <line x1="580" y1="200" x2="0" y2="600" stroke="rgba(173,109,21,0.03)" strokeWidth="1"/>
          <line x1="290" y1="0" x2="290" y2="800" stroke="rgba(239,187,85,0.025)" strokeWidth="0.5"/>
          <circle cx="90" cy="160" r="2" fill="rgba(239,187,85,0.3)"/>
          <circle cx="380" cy="100" r="1.5" fill="rgba(239,187,85,0.2)"/>
          <circle cx="500" cy="300" r="2" fill="rgba(239,187,85,0.18)"/>
          <circle cx="60" cy="500" r="1.5" fill="rgba(239,187,85,0.15)"/>
          <circle cx="460" cy="650" r="2" fill="rgba(239,187,85,0.22)"/>
          <line x1="40" y1="420" x2="200" y2="420" stroke="rgba(239,187,85,0.07)" strokeWidth="0.5"/>
          <line x1="380" y1="480" x2="540" y2="480" stroke="rgba(239,187,85,0.05)" strokeWidth="0.5"/>
        </svg>

        <div style={{ position:'absolute',top:'40%',left:'55%',width:280,height:280,borderRadius:'50%',background:'radial-gradient(circle,rgba(173,109,21,0.14) 0%,transparent 70%)',transform:'translate(-50%,-50%)' }} />

        <div style={{ position:'relative',zIndex:2 }}>
          <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:28 }}>
            <div style={{ width:34,height:34,background:'rgba(239,187,85,0.12)',border:'1px solid rgba(239,187,85,0.28)',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <svg width="15" height="15" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#EFBB55"/></svg>
            </div>
            <div style={{ fontFamily:"'Lora',serif",fontSize:16,fontWeight:600,color:'white',lineHeight:1 }}>PsicoSync</div>
            <div style={{ marginLeft:'auto',display:'flex',alignItems:'center',gap:6,padding:'5px 10px',border:'1px solid rgba(239,187,85,0.22)',background:'rgba(239,187,85,0.06)' }}>
              <div style={{ width:5,height:5,borderRadius:'50%',background:'#EFBB55',animation:'pulse-dot 2s ease-in-out infinite' }} />
              <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:9,color:'rgba(239,187,85,.8)',letterSpacing:'.1em',textTransform:'uppercase' }}>Grátis por 14 dias</span>
            </div>
          </div>

          <h2 style={{ fontFamily:"'Lora',serif",fontSize:'clamp(26px,2.8vw,38px)',fontWeight:600,color:'white',lineHeight:1.1,letterSpacing:'-.025em',marginBottom:10 }}>
            Comece em<br/><span style={{ color:'#EFBB55',fontStyle:'italic' }}>3 passos simples.</span>
          </h2>
          <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:12,color:'rgba(255,255,255,.4)',lineHeight:1.7,maxWidth:280 }}>
            Configure sua conta em menos de 2 minutos e tenha acesso imediato a todas as funcionalidades.
          </p>
        </div>

        <div style={{ position:'relative',zIndex:2,display:'flex',flexDirection:'column',gap:8 }}>
          {[
            { n:'01', title:'Dados profissionais', desc:'Nome, CRP, especialidade e contato' },
            { n:'02', title:'Crie sua senha segura', desc:'Proteja sua conta com uma senha forte' },
            { n:'03', title:'Pronto para usar!', desc:'Acesso imediato a todas as funcionalidades' },
          ].map((s,i)=>(
            <div key={i} className="rp-step">
              <div className="rp-step-num">
                <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:500,color:'rgba(239,187,85,.7)',letterSpacing:'.05em' }}>{s.n}</span>
              </div>
              <div>
                <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:500,color:'rgba(255,255,255,.85)',marginBottom:2 }}>{s.title}</div>
                <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:11,color:'rgba(255,255,255,.38)',lineHeight:1.5 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ position:'relative',zIndex:2 }}>
          <div style={{ padding:'14px 16px',border:'1px solid rgba(255,255,255,.08)',background:'rgba(255,255,255,.03)',marginBottom:12 }}>
            <div style={{ display:'flex',gap:2,marginBottom:6 }}>
              {[...Array(5)].map((_,i)=>(
                <svg key={i} width="10" height="10" viewBox="0 0 24 24" fill="#EFBB55"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              ))}
            </div>
            <p style={{ fontFamily:"'Lora',serif",fontStyle:'italic',fontSize:12,color:'rgba(255,255,255,.72)',lineHeight:1.55,margin:0,marginBottom:8 }}>
              "Configurei meu consultório digital em menos de 5 minutos. Incrível!"
            </p>
            <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:9,color:'#EFBB55',margin:0,letterSpacing:'.06em',textTransform:'uppercase' }}>
              Dr. Lucas Ferreira — Neuropsicólogo, RJ
            </p>
          </div>
          <div className="stat-grid">
            {[{n:'14 dias',l:'Grátis'},{n:'500+',l:'Psicólogos'},{n:'2 min',l:'p/ configurar'}].map((s,i)=>(
              <div key={i} className="stat-cell">
                <span className="stat-n" style={{ fontSize:18 }}>{s.n}</span>
                <span className="stat-l">{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}