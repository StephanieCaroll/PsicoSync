'use client';

import React, { useState, useEffect, useRef } from 'react';
import { loginUser } from '@/lib/auth';

interface LoginScreenProps {
  onLogin: () => void;
  onNavigateToRegister: () => void;
}

export default function LoginScreen({ onLogin, onNavigateToRegister }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [serverError, setServerError] = useState('');
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
      const orbX = w * 0.4 + Math.sin(t * 0.25) * w * 0.12;
      const orbY = h * 0.5 + Math.cos(t * 0.18) * h * 0.12;
      const grad = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, w * 0.55);
      grad.addColorStop(0, 'rgba(239,187,85,0.14)');
      grad.addColorStop(0.6, 'rgba(173,109,21,0.05)');
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

  const validateEmail = (v: string) => {
    if (!v) return 'E-mail é obrigatório';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'E-mail inválido';
    return '';
  };
  const validatePassword = (v: string) => {
    if (!v) return 'Senha é obrigatória';
    if (v.length < 6) return 'Mínimo de 6 caracteres';
    return '';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    setServerError('');
    if (eErr || pErr) return;

    setIsLoading(true);
    try {
      await loginUser(email, password);
      onLogin();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('Invalid credentials') || msg.includes('user_invalid_credentials')) {
        setServerError('E-mail ou senha incorretos. Verifique e tente novamente.');
      } else if (msg.includes('user_not_found')) {
        setServerError('Nenhuma conta encontrada com este e-mail.');
      } else {
        setServerError('Ocorreu um erro. Tente novamente em instantes.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Lora','Georgia',serif", height: '100vh', display: 'flex', overflow: 'hidden', background: '#FAF6EE' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        *,*::before,*::after{box-sizing:border-box;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
        .fu{animation:fadeUp 0.6s cubic-bezier(.22,1,.36,1) both}
        .d1{animation-delay:.06s}.d2{animation-delay:.12s}.d3{animation-delay:.18s}
        .d4{animation-delay:.24s}.d5{animation-delay:.30s}.d6{animation-delay:.36s}
        .shake{animation:shake .35s ease both}

        .lbl{font-family:'DM Sans',sans-serif;font-size:10px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:#9A7040;display:block;margin-bottom:5px}
        .inp{width:100%;background:transparent;border:none;border-bottom:1.5px solid #D9C49A;padding:9px 36px 9px 0;font-family:'DM Sans',sans-serif;font-size:14px;color:#2D1F0A;outline:none;transition:border-color .2s}
        .inp::placeholder{color:#C4A97A}
        .inp.foc{border-bottom-color:#AD6D15}
        .inp.err{border-bottom-color:#C45A35}
        .errmsg{font-family:'DM Sans',sans-serif;font-size:11px;color:#C45A35;margin-top:4px;display:block}

        .server-error{background:#FEF0EC;border:1px solid #F5C4B3;padding:10px 14px;display:flex;align-items:flex-start;gap:8px;margin-bottom:16px}
        .server-error span{font-family:'DM Sans',sans-serif;font-size:12px;color:#993C1D;line-height:1.5}

        .btn-main{width:100%;padding:13px 20px;background:#2D1F0A;color:#FAF6EE;border:none;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:background .2s,transform .12s;display:flex;align-items:center;justify-content:center;gap:8px}
        .btn-main:hover:not(:disabled){background:#AD6D15}
        .btn-main:active:not(:disabled){transform:scale(.99)}
        .btn-main:disabled{opacity:.65;cursor:not-allowed}
        .btn-ghost{width:100%;padding:12px 20px;background:transparent;color:#AD6D15;border:1.5px solid #D9C49A;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:border-color .2s,background .2s}
        .btn-ghost:hover{border-color:#AD6D15;background:#F5ECD8}

        .social{flex:1;padding:9px 6px;background:white;border:1px solid #E8D9BE;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:400;color:#5A3E20;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;transition:border-color .2s,box-shadow .2s;letter-spacing:.01em;white-space:nowrap}
        .social:hover{border-color:#AD6D15;box-shadow:0 2px 8px rgba(173,109,21,.1)}

        .chkbox{width:15px;height:15px;border:1.5px solid #C4A97A;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:border-color .2s,background .2s}
        .chkbox.on{border-color:#AD6D15;background:#AD6D15}
        .spinner{width:14px;height:14px;border:2px solid rgba(250,246,238,.3);border-top-color:#FAF6EE;border-radius:50%;animation:spin .8s linear infinite}
        .divline{flex:1;height:1px;background:#E8D9BE}

        .rp-feature{display:flex;align-items:center;gap:10px;padding:10px 14px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);transition:background .2s}
        .rp-feature:hover{background:rgba(255,255,255,.1)}
        .rp-icon{width:30px;height:30px;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:rgba(255,255,255,.1)}
        .stat-cell{background:#1A1008;padding:14px 8px;text-align:center}
        .stat-n{font-family:'Lora',serif;font-size:22px;font-weight:600;color:white;display:block;line-height:1.1}
        .stat-l{font-family:'DM Sans',sans-serif;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.45);display:block;margin-top:2px}
        @media(max-width:1023px){.right-panel{display:none!important}}
      `}</style>

      {/* LEFT PANEL */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'clamp(24px,4vw,56px)', position:'relative', overflow:'hidden' }}>
        <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }} />

        <div style={{ position:'relative', width:'100%', maxWidth:380 }}>

          {/* Logo */}
          <div className={mounted ? 'fu' : ''} style={{ marginBottom:28 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
              <div style={{ width:38,height:38,background:'#2D1F0A',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="rgba(239,187,85,0.85)"/></svg>
              </div>
              <div>
                <div style={{ fontFamily:"'Lora',serif",fontSize:18,fontWeight:600,color:'#2D1F0A',lineHeight:1 }}>PsicoSync</div>
                <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:9,color:'#9A7040',letterSpacing:'.12em',textTransform:'uppercase',marginTop:1 }}>Gestão Clínica</div>
              </div>
            </div>
            <div style={{ width:28,height:2,background:'#AD6D15',marginBottom:16 }} />
            <h1 style={{ fontFamily:"'Lora',serif",fontSize:'clamp(22px,3.2vw,30px)',fontWeight:600,color:'#2D1F0A',lineHeight:1.2,letterSpacing:'-.02em',margin:0,marginBottom:6 }}>
              Bem-vindo <span style={{ fontStyle:'italic',color:'#AD6D15' }}>de volta.</span>
            </h1>
            <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:13,color:'#9A7040',lineHeight:1.6,margin:0 }}>
              Acesse sua conta e gerencie sua prática clínica.
            </p>
          </div>

          {/* Social */}
          <div className={mounted?'fu d1':''} style={{ display:'flex',gap:8,marginBottom:20 }}>
            <button className="social">
              <svg width="14" height="14" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
            <button className="social">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              LinkedIn
            </button>
          </div>

          {/* Divider */}
          <div className={mounted?'fu d2':''} style={{ display:'flex',alignItems:'center',gap:12,marginBottom:20 }}>
            <div className="divline" />
            <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:10,color:'#C4A97A',letterSpacing:'.1em',textTransform:'uppercase',whiteSpace:'nowrap' }}>ou por e-mail</span>
            <div className="divline" />
          </div>

          {/* Server error */}
          {serverError && (
            <div className={`server-error shake`}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#993C1D" strokeWidth="2" style={{ flexShrink:0, marginTop:1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>{serverError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} noValidate style={{ display:'flex',flexDirection:'column',gap:0 }}>

            <div className={mounted?'fu d3':''} style={{ marginBottom:16 }}>
              <label className="lbl">E-mail profissional</label>
              <div style={{ position:'relative' }}>
                <input
                  type="email" autoComplete="email"
                  className={`inp${focusedField==='email'?' foc':''}${emailError?' err':''}`}
                  placeholder="voce@clinica.com.br"
                  value={email}
                  onChange={e=>{setEmail(e.target.value);setEmailError(validateEmail(e.target.value));setServerError('');}}
                  onFocus={()=>setFocusedField('email')}
                  onBlur={()=>setFocusedField(null)}
                />
                <svg style={{ position:'absolute',right:0,top:'50%',transform:'translateY(-50%)',opacity:.35,pointerEvents:'none' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#AD6D15" strokeWidth="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>
              </div>
              {emailError && <span className="errmsg">{emailError}</span>}
            </div>

            <div className={mounted?'fu d4':''} style={{ marginBottom:14 }}>
              <label className="lbl">Senha</label>
              <div style={{ position:'relative' }}>
                <input
                  type={showPassword?'text':'password'} autoComplete="current-password"
                  className={`inp${focusedField==='password'?' foc':''}${passwordError?' err':''}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={e=>{setPassword(e.target.value);setPasswordError(validatePassword(e.target.value));setServerError('');}}
                  onFocus={()=>setFocusedField('password')}
                  onBlur={()=>setFocusedField(null)}
                />
                <button type="button" onClick={()=>setShowPassword(v=>!v)}
                  style={{ position:'absolute',right:0,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',padding:2,color:'#C4A97A',display:'flex',alignItems:'center' }}>
                  {showPassword
                    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>
                    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {passwordError && <span className="errmsg">{passwordError}</span>}
            </div>

            <div className={mounted?'fu d5':''} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20 }}>
              <label style={{ display:'flex',alignItems:'center',gap:7,cursor:'pointer' }}>
                <div className={`chkbox${rememberMe?' on':''}`} onClick={()=>setRememberMe(v=>!v)}>
                  {rememberMe && <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span onClick={()=>setRememberMe(v=>!v)} style={{ fontFamily:"'DM Sans',sans-serif",fontSize:12,color:'#5A3E20',userSelect:'none' }}>Lembrar de mim</span>
              </label>
              <a href="#" style={{ fontFamily:"'DM Sans',sans-serif",fontSize:12,color:'#AD6D15',textDecoration:'none',borderBottom:'1px solid transparent',transition:'border-color .2s' }}
                onMouseOver={e=>(e.currentTarget.style.borderBottomColor='#AD6D15')}
                onMouseOut={e=>(e.currentTarget.style.borderBottomColor='transparent')}>
                Esqueceu a senha?
              </a>
            </div>

            <div className={mounted?'fu d6':''} style={{ display:'flex',flexDirection:'column',gap:10 }}>
              <button type="submit" className="btn-main" disabled={isLoading}>
                {isLoading ? <><span className="spinner"/>Entrando...</> : 'Acessar conta'}
              </button>
              <button type="button" className="btn-ghost" onClick={onNavigateToRegister}>
                Criar nova conta
              </button>
            </div>
          </form>

          <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:11,color:'#C4A97A',textAlign:'center',marginTop:18,lineHeight:1.7 }}>
            Ao continuar, você concorda com os{' '}
            <a href="#" style={{ color:'#9A7040',textDecoration:'underline' }}>Termos de Uso</a>
            {' '}e a{' '}
            <a href="#" style={{ color:'#9A7040',textDecoration:'underline' }}>Política de Privacidade</a>
          </p>
        </div>
      </div>

      <div className="right-panel" style={{ width:'50%',height:'100vh',background:'#1A1008',position:'relative',overflow:'hidden',display:'flex',flexDirection:'column',justifyContent:'space-between',padding:'44px 48px' }}>
        <svg style={{ position:'absolute',inset:0,width:'100%',height:'100%' }} viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice" fill="none">
          <circle cx="600" cy="0" r="420" stroke="rgba(239,187,85,0.07)" strokeWidth="1"/>
          <circle cx="600" cy="0" r="320" stroke="rgba(239,187,85,0.06)" strokeWidth="1"/>
          <circle cx="600" cy="0" r="220" stroke="rgba(239,187,85,0.05)" strokeWidth="1"/>
          <circle cx="0" cy="800" r="380" stroke="rgba(239,187,85,0.05)" strokeWidth="1"/>
          <circle cx="0" cy="800" r="260" stroke="rgba(173,109,21,0.08)" strokeWidth="1"/>
          <line x1="0" y1="200" x2="600" y2="600" stroke="rgba(239,187,85,0.04)" strokeWidth="1"/>
          <line x1="600" y1="200" x2="0" y2="600" stroke="rgba(173,109,21,0.03)" strokeWidth="1"/>
          <circle cx="120" cy="140" r="2" fill="rgba(239,187,85,0.25)"/>
          <circle cx="340" cy="80" r="1.5" fill="rgba(239,187,85,0.2)"/>
          <circle cx="500" cy="220" r="2" fill="rgba(239,187,85,0.18)"/>
          <circle cx="80" cy="580" r="1.5" fill="rgba(239,187,85,0.15)"/>
          <circle cx="420" cy="660" r="2" fill="rgba(239,187,85,0.2)"/>
        </svg>
        <div style={{ position:'absolute',top:'30%',left:'60%',width:300,height:300,borderRadius:'50%',background:'radial-gradient(circle,rgba(239,187,85,0.12) 0%,transparent 70%)',transform:'translate(-50%,-50%)' }} />

        <div style={{ position:'relative',zIndex:2 }}>
          <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:32 }}>
            <div style={{ width:36,height:36,background:'rgba(239,187,85,0.15)',border:'1px solid rgba(239,187,85,0.3)',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#EFBB55"/></svg>
            </div>
            <div>
              <div style={{ fontFamily:"'Lora',serif",fontSize:16,fontWeight:600,color:'white',lineHeight:1 }}>PsicoSync</div>
              <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:9,color:'rgba(239,187,85,.6)',letterSpacing:'.1em',textTransform:'uppercase',marginTop:2 }}>Gestão Clínica Inteligente</div>
            </div>
            <div style={{ marginLeft:'auto',display:'flex',alignItems:'center',gap:6,padding:'5px 11px',border:'1px solid rgba(239,187,85,0.25)',background:'rgba(239,187,85,0.07)' }}>
              <div style={{ width:5,height:5,borderRadius:'50%',background:'#EFBB55',animation:'pulse-dot 2s ease-in-out infinite' }} />
              <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:9,color:'rgba(239,187,85,.8)',letterSpacing:'.1em',textTransform:'uppercase' }}>Online</span>
            </div>
          </div>
          <h2 style={{ fontFamily:"'Lora',serif",fontSize:'clamp(28px,3vw,40px)',fontWeight:600,color:'white',lineHeight:1.08,letterSpacing:'-.025em',margin:0,marginBottom:12 }}>
            Psicologia<br/><span style={{ color:'#EFBB55',fontStyle:'italic' }}>reimaginada.</span>
          </h2>
          <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:13,color:'rgba(255,255,255,.45)',lineHeight:1.7,margin:0,maxWidth:300 }}>
            A plataforma completa para psicólogos que valorizam tempo, segurança e resultado clínico.
          </p>
        </div>

        <div style={{ position:'relative',zIndex:2,display:'flex',flexDirection:'column',gap:8 }}>
          {[
            { icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(239,187,85,.8)" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, text:'Agendamento inteligente de sessões' },
            { icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(239,187,85,.8)" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, text:'Prontuário digital seguro e criptografado' },
            { icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(239,187,85,.8)" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, text:'Relatórios e insights automatizados com IA' },
          ].map((f,i)=>(
            <div key={i} className="rp-feature">
              <div className="rp-icon">{f.icon}</div>
              <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:12,color:'rgba(255,255,255,.7)' }}>{f.text}</span>
            </div>
          ))}
        </div>

        <div style={{ position:'relative',zIndex:2 }}>
          <div style={{ padding:'16px 18px',border:'1px solid rgba(255,255,255,.1)',background:'rgba(255,255,255,.04)',marginBottom:16 }}>
            <div style={{ display:'flex',gap:2,marginBottom:8 }}>
              {[...Array(5)].map((_,i)=>(
                <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill="#EFBB55"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              ))}
            </div>
            <p style={{ fontFamily:"'Lora',serif",fontStyle:'italic',fontSize:13,color:'rgba(255,255,255,.78)',lineHeight:1.55,margin:0,marginBottom:10 }}>
              "O PsicoSync economizou horas da minha semana. A gestão ficou muito mais fluida."
            </p>
            <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:10,color:'#EFBB55',margin:0,letterSpacing:'.05em',textTransform:'uppercase' }}>
              Dra. Ana Beatriz — Psicóloga Clínica, SP
            </p>
          </div>
          <div className="stat-grid">
            {[{n:'500+',l:'Profissionais'},{n:'98%',l:'Satisfação'},{n:'24/7',l:'Suporte'}].map((s,i)=>(
              <div key={i} className="stat-cell">
                <span className="stat-n">{s.n}</span>
                <span className="stat-l">{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}