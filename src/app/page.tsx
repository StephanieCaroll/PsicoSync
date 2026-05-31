'use client';

import React, { useState, useEffect } from 'react';
import LoginScreen from '@/features/auth/components/LoginScreen';
import RegisterScreen from '@/features/auth/components/RegisterScreen';
import DashboardView from '@/features/dashboard/components/DashboardView';
import { getCurrentUser, logoutUser } from '@/lib/auth';
import { account } from '@/lib/appwrite';

type ViewState = 'loading' | 'login' | 'register' | 'dashboard';

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewState>('loading');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        const appwriteUser = await account.get();
        setUserId(appwriteUser.$id);
        setCurrentView('dashboard');
      } else {
        setCurrentView('login');
      }
    } catch {
      setCurrentView('login');
    }
  };

  const handleLoginSuccess = async () => {
    try {
      const user = await account.get();
      setUserId(user.$id);
    } catch {}
    setCurrentView('dashboard');
  };

  const handleRegisterSuccess = async () => {
    try {
      const user = await account.get();
      setUserId(user.$id);
    } catch {}
    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    setCurrentView('loading');
    await logoutUser();
    setUserId('');
    setCurrentView('login');
  };

  if (currentView === 'loading') {
    return (
      <div style={{
        height: '100vh', display: 'flex', justifyContent: 'center',
        alignItems: 'center', background: '#FAF6EE',
        fontFamily: "'DM Sans', sans-serif", color: '#9A7040',
        flexDirection: 'column', gap: 16,
      }}>
        <div style={{
          width: 24, height: 24,
          border: '3px solid rgba(173,109,21,0.2)',
          borderTopColor: '#AD6D15', borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
          Carregando sessão...
        </span>
      </div>
    );
  }

  if (currentView === 'dashboard') {
    return <DashboardView onLogout={handleLogout} userId={userId} />;
  }

  if (currentView === 'register') {
    return (
      <RegisterScreen
        onRegister={handleRegisterSuccess}
        onNavigateToLogin={() => setCurrentView('login')}
      />
    );
  }

  return (
    <LoginScreen
      onLogin={handleLoginSuccess}
      onNavigateToRegister={() => setCurrentView('register')}
    />
  );
}