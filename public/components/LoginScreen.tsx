"use client";
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Shield,
  Key,
  LogIn,
  Fingerprint,
  Brain
} from 'lucide-react';
import Image from 'next/image';
import Swal from 'sweetalert2';

const COLORS = {
  terracota: '#c08267',
  verdeMusgo: '#96a07e',
  begeFundo: '#fdfcf8',
  texto: '#4a443f',
  cardBranco: '#ffffff',
  preto: '#1a1a1a',
  sucesso: '#10b981',
  alerta: '#f59e0b',
  perigo: '#ef4444',
  info: '#3b82f6',
  branco: '#ffffff'
};

interface LoginScreenProps {
  onLoginSuccess: () => void;
  darkMode?: boolean;
}

export default function LoginScreen({ onLoginSuccess, darkMode = false }: LoginScreenProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [rememberMe, setRememberMe] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Configurações de segurança (variáveis de ambiente)
  const APP_PASSWORD = process.env.NEXT_PUBLIC_APP_PASSWORD || 'psico2024'; 
  const MAX_ATTEMPTS = parseInt(process.env.NEXT_PUBLIC_MAX_ATTEMPTS || '3');
  const BLOCK_TIME = parseInt(process.env.NEXT_PUBLIC_BLOCK_TIME || '30000');
  
  // Verificar se já está logado (com localStorage)
  useEffect(() => {
    const savedLogin = localStorage.getItem('psicosync-login');
    if (savedLogin === 'true') {
      onLoginSuccess();
    }
  }, [onLoginSuccess]);

  useEffect(() => {
    if (passwordRef.current) {
      passwordRef.current.focus();
    }
  }, []);

  const showAlert = (title: string, text: string, icon: 'success' | 'error' | 'warning' | 'info') => {
    return Swal.fire({
      title,
      text,
      icon,
      confirmButtonColor: COLORS.verdeMusgo,
      background: darkMode ? '#1e1e1e' : COLORS.cardBranco,
      color: darkMode ? COLORS.branco : COLORS.preto,
      confirmButtonText: 'OK'
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      showAlert('Atenção', 'Por favor, digite a senha de acesso.', 'warning');
      return;
    }

    setLoading(true);
    
    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, 800));

    if (password === APP_PASSWORD) {
      // Login bem-sucedido
      if (rememberMe) {
        localStorage.setItem('psicosync-login', 'true');
      }
      sessionStorage.setItem('psicosync-login', 'true');
      
      showAlert('Acesso Concedido', 'Bem-vinda ao PsicoSync!', 'success').then(() => {
        onLoginSuccess();
      });
    } else {
      // Login falhou
      const attempts = loginAttempts + 1;
      setLoginAttempts(attempts);
      
      if (attempts >= MAX_ATTEMPTS) {
        showAlert('Acesso Bloqueado', 
          `Muitas tentativas incorretas. Por segurança, aguarde ${BLOCK_TIME/1000} segundos antes de tentar novamente.`, 
          'error'
        );
        
        // Bloquear temporariamente
        setTimeout(() => {
          setLoginAttempts(0);
          showAlert('Bloqueio Removido', 'Você pode tentar novamente.', 'info');
        }, BLOCK_TIME);
      } else {
        showAlert('Senha Incorreta', 
          `Tentativa ${attempts} de ${MAX_ATTEMPTS}. Verifique a senha e tente novamente.`, 
          'error'
        );
      }
    }
    
    setLoading(false);
  };

  const handleForgotPassword = () => {
    Swal.fire({
      title: 'Recuperar Acesso',
      html: `
        <div style="text-align: left; color: ${darkMode ? '#e0e0e0' : COLORS.preto};">
          <p>Para acessar o sistema PsicoSync, entre em contato com o administrador:</p>
          <p><strong>Dra. Tatiane Oliveira</strong></p>
          <p>E-mail: stephaniecarolinedev@gmail.com</p>
          <p>Telefone: (81) 9630-6876</p>
          <hr style="border-color: ${darkMode ? '#3d3d3d' : '#e0e0e0'};">
          <p><small>Esta aplicação está protegida por senha de acesso.</small></p>
        </div>
      `,
      width: '500px',
      background: darkMode ? '#1e1e1e' : 'white',
      color: darkMode ? '#e0e0e0' : COLORS.preto,
      confirmButtonColor: COLORS.verdeMusgo,
      confirmButtonText: 'Entendi'
    });
  };

  const handleQuickAccess = () => {
    showAlert('Informação', 'Por segurança, a senha não pode ser preenchida automaticamente. Entre em contato com o administrador se precisar de acesso.', 'info');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: darkMode ? '#121212' : COLORS.begeFundo,
      padding: '1rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `radial-gradient(${darkMode ? 'rgba(150, 160, 126, 0.1)' : 'rgba(192, 130, 103, 0.05)'} 2px, transparent 2px)`,
        backgroundSize: '40px 40px',
        opacity: 0.3
      }}></div>

      {/*Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: darkMode ? '#1e1e1e' : COLORS.cardBranco,
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          padding: '3rem 2.5rem',
          position: 'relative',
          zIndex: 10,
          border: `1px solid ${darkMode ? '#2d2d2d' : '#e0e0e0'}`
        }}
      >
        {/*Elementos */}
        <div style={{
          position: 'absolute',
          top: '-30px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80px',
          height: '80px',
          backgroundColor: COLORS.terracota,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 30px rgba(192, 130, 103, 0.3)',
          border: `4px solid ${darkMode ? '#1e1e1e' : COLORS.cardBranco}`
        }}>
          <Brain size={36} color="white" />
        </div>

        {/* Logo e Titulo */}
        <div className="text-center mb-8 pt-4">
          <div className="d-flex justify-content-center mb-4">
            <Image 
              src="/favicon.ico" 
              alt="PsicoSync Logo" 
              width={80} 
              height={80} 
              className="rounded-4 shadow-sm"
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
          <h2 className="fw-bold mb-2" style={{ 
            color: darkMode ? '#e0e0e0' : COLORS.terracota,
            fontSize: '2rem'
          }}>
            PsicoSync
          </h2>
          <p style={{ 
            color: darkMode ? '#a0a0a0' : COLORS.texto,
            opacity: 0.7,
            fontSize: '0.95rem'
          }}>
            Sistema Clínico de Psicologia
          </p>
          <div className="badge rounded-pill px-3 py-1 mt-2" style={{ 
            backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo, 
            color: COLORS.verdeMusgo, 
            fontSize: '0.7rem',
            fontWeight: 600,
            border: `1px solid ${darkMode ? '#3d3d3d' : '#e0e0e0'}`
          }}>
            ACESSO RESTRITO
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="form-label d-flex align-items-center gap-2 mb-2" style={{ 
              color: darkMode ? '#e0e0e0' : COLORS.preto,
              fontWeight: 500
            }}>
              <User size={18} />
              Acesso Restrito
            </label>
            <div className="input-group" style={{
              borderRadius: '12px',
              overflow: 'hidden',
              border: `1px solid ${darkMode ? '#3d3d3d' : '#e0e0e0'}`
            }}>
              <span className="input-group-text border-0" style={{ 
                backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo,
                color: darkMode ? '#e0e0e0' : COLORS.preto
              }}>
                <Key size={20} />
              </span>
              <input
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                className="form-control border-0 py-3"
                placeholder="Digite a senha de acesso"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ 
                  backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo,
                  color: darkMode ? '#e0e0e0' : COLORS.preto
                }}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="btn border-0"
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo,
                  color: darkMode ? '#e0e0e0' : COLORS.preto
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <small style={{ 
              color: darkMode ? '#a0a0a0' : COLORS.texto,
              opacity: 0.6,
              fontSize: '0.85rem'
            }}>
              Acesso exclusivo para profissionais autorizados
            </small>
          </div>

          {/* Checkbox */}
          <div className="mb-4">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo,
                  borderColor: COLORS.verdeMusgo,
                  cursor: 'pointer'
                }}
              />
              <label 
                className="form-check-label" 
                htmlFor="rememberMe"
                style={{ 
                  color: darkMode ? '#e0e0e0' : COLORS.preto,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Lembrar-me neste dispositivo
              </label>
            </div>
          </div>

          {/* Login Botão */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="btn w-100 py-3 rounded-pill fw-bold border-0 shadow-lg mb-3 d-flex align-items-center justify-content-center gap-2"
            style={{ 
              backgroundColor: COLORS.verdeMusgo,
              color: 'white',
              fontSize: '1.1rem'
            }}
          >
            {loading ? (
              <>
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Carregando...</span>
                </div>
                <span>VERIFICANDO...</span>
              </>
            ) : (
              <>
                <LogIn size={20} />
                <span>ACESSAR SISTEMA</span>
              </>
            )}
          </motion.button>

          {/* Esqueceu a senha */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="btn btn-link p-0"
              style={{ 
                color: darkMode ? '#a0a0a0' : COLORS.texto,
                textDecoration: 'none',
                fontSize: '0.9rem'
              }}
            >
              Esqueceu a senha ou precisa de acesso?
            </button>
          </div>
        </form>

        {/*Info */}
        <div className="mt-5 pt-4 border-top" style={{ borderColor: darkMode ? '#2d2d2d' : '#e0e0e0' }}>
          <div className="d-flex align-items-center gap-2 justify-content-center">
            <Lock size={14} color={darkMode ? '#a0a0a0' : COLORS.texto} />
            <small style={{ 
              color: darkMode ? '#a0a0a0' : COLORS.texto,
              opacity: 0.6,
              fontSize: '0.8rem'
            }}>
              Sistema protegido • Acesso registrado • {new Date().getFullYear()}
            </small>
          </div>
        </div>
      </motion.div>

      {/* animaçãp */}
      <AnimatePresence>
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0.1, 0.2, 0.1],
              scale: [1, 1.2, 1],
              x: [0, Math.random() * 100 - 50, 0],
              y: [0, Math.random() * 100 - 50, 0]
            }}
            transition={{ 
              duration: 5 + i,
              repeat: Infinity,
              delay: i * 0.5
            }}
            style={{
              position: 'absolute',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${COLORS.terracota}20, transparent 70%)`,
              zIndex: 1
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}