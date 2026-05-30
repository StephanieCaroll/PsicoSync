'use client';

import React, { useState } from 'react';
import LoginScreen from '../features/auth/components/LoginScreen';
import RegisterScreen from '../features/auth/components/RegisterScreen';

type Route = 'login' | 'register' | 'dashboard';

export default function Home() {
 const [currentRoute, setCurrentRoute] = useState<Route>('login');

  if (currentRoute === 'login') {
    return (
      <LoginScreen 
        onLogin={() => setCurrentRoute('dashboard')} 
        onNavigateToRegister={() => setCurrentRoute('register')} 
      />
    );
  }

  if (currentRoute === 'register') {
    return (
      <RegisterScreen 
        onRegister={() => setCurrentRoute('dashboard')} 
        onNavigateToLogin={() => setCurrentRoute('login')} 
      />
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', background: '#FAF6EE', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '16px', border: '1px solid #E8D9BE', textAlign: 'center', maxWidth: '400px', boxShadow: '0 10px 30px rgba(45,31,10,0.05)' }}>
        
        <div style={{ width: 48, height: 48, background: '#2D1F0A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="rgba(239,187,85,0.85)"/>
          </svg>
        </div>
        
        <h1 style={{ fontFamily: "'Lora', serif", fontSize: '24px', color: '#2D1F0A', marginBottom: '8px' }}>
          Acesso Liberado
        </h1>
        <p style={{ fontSize: '14px', color: '#9A7040', marginBottom: '24px', lineHeight: '1.6' }}>
          Bem-vindo ao PsicoSync. Seu ambiente de trabalho está pronto para uso.
        </p>

        <button 
          onClick={() => setCurrentRoute('login')}
          style={{ width: '100%', padding: '12px 20px', background: 'transparent', color: '#AD6D15', border: '1.5px solid #D9C49A', fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 500, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all .2s' }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = '#AD6D15'; e.currentTarget.style.background = '#F5ECD8'; }}
          onMouseOut={(e) => { e.currentTarget.style.borderColor = '#D9C49A'; e.currentTarget.style.background = 'transparent'; }}
        >
          Encerrar Sessão
        </button>
      </div>
    </div>
  );
}