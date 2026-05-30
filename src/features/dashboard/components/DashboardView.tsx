'use client';

import React, { useState, useEffect } from 'react';

interface DashboardViewProps {
  onLogout?: () => void;
}

interface Patient {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'active' | 'waiting' | 'inactive';
  nextSession: string;
  pendingAmount: number;
  lastSession: string;
  therapyType: string;
}

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  time: string;
  type: 'online' | 'presencial';
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  notes?: string;
}

interface ClinicalNote {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  content: string;
  mood?: string;
  status: 'draft' | 'completed';
}

interface FinancialSummary {
  totalMonth: number;
  received: number;
  pending: number;
  nextReceipts: Array<{ patient: string; amount: number; dueDate: string }>;
}

export default function DashboardView({ onLogout }: DashboardViewProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [notifications, setNotifications] = useState<string[]>([]);

  const [patients, setPatients] = useState<Patient[]>([
    { id: '1', name: 'Mariana Costa', phone: '(11) 98765-4321', email: 'mariana@email.com', status: 'active', nextSession: '2024-01-20 09:00', pendingAmount: 350, lastSession: '2024-01-13', therapyType: 'Terapia Cognitivo-Comportamental' },
    { id: '2', name: 'Carlos Eduardo Silva', phone: '(11) 91234-5678', email: 'carlos@email.com', status: 'active', nextSession: '2024-01-20 10:30', pendingAmount: 0, lastSession: '2024-01-13', therapyType: 'Psicanálise' },
    { id: '3', name: 'Beatriz Almeida', phone: '(11) 99876-5432', email: 'beatriz@email.com', status: 'active', nextSession: '2024-01-20 14:00', pendingAmount: 175, lastSession: '2024-01-13', therapyType: 'Terapia de Casal' },
    { id: '4', name: 'Rafael Souza', phone: '(11) 97654-3210', email: 'rafael@email.com', status: 'waiting', nextSession: '2024-01-21 16:00', pendingAmount: 0, lastSession: '2024-01-06', therapyType: 'Terapia de Casal' },
    { id: '5', name: 'Luciana Vieira', phone: '(11) 96543-2109', email: 'luciana@email.com', status: 'inactive', nextSession: '2024-01-22 11:00', pendingAmount: 525, lastSession: '2024-01-12', therapyType: 'Terapia Cognitivo-Comportamental' },
  ]);

  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: '1', patientId: '1', patientName: 'Mariana Costa', time: '09:00', type: 'online', status: 'confirmed', notes: 'Sessão de acompanhamento' },
    { id: '2', patientId: '2', patientName: 'Carlos Eduardo Silva', time: '10:30', type: 'presencial', status: 'confirmed', notes: 'Trabalho com ansiedade' },
    { id: '3', patientId: '3', patientName: 'Beatriz Almeida', time: '14:00', type: 'online', status: 'confirmed', notes: 'Terapia de casal' },
    { id: '4', patientId: '4', patientName: 'Rafael Souza', time: '16:00', type: 'presencial', status: 'pending', notes: 'Primeira sessão' },
  ]);

  const [clinicalNotes, setClinicalNotes] = useState<ClinicalNote[]>([
    { id: '1', patientId: '1', patientName: 'Mariana Costa', date: '2024-01-13', content: 'Paciente apresentou melhora significativa nos sintomas ansiosos. Continua em tratamento farmacológico acompanhado por psiquiatra.', mood: 'ansiosa', status: 'completed' },
    { id: '2', patientId: '2', patientName: 'Carlos Eduardo Silva', date: '2024-01-13', content: 'Trabalhamos as questões relacionadas ao luto. Paciente demonstrando maior aceitação do processo.', mood: 'triste', status: 'completed' },
  ]);

  const [financialData, setFinancialData] = useState<FinancialSummary>({
    totalMonth: 5250,
    received: 4200,
    pending: 1050,
    nextReceipts: [
      { patient: 'Mariana Costa', amount: 350, dueDate: '2024-01-20' },
      { patient: 'Luciana Vieira', amount: 525, dueDate: '2024-01-25' },
      { patient: 'Beatriz Almeida', amount: 175, dueDate: '2024-01-22' },
    ]
  });

  useEffect(() => {
    setMounted(true);
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const date = new Date().toLocaleDateString('pt-BR', options);
    setCurrentDate(date.charAt(0).toUpperCase() + date.slice(1));
    
    setTimeout(() => {
      setNotifications(['Nova avaliação de paciente recebida', '2 faturas vencem hoje']);
    }, 1000);
  }, []);

  const handleAddClinicalNote = () => {
    if (selectedPatient && currentNote) {
      const newNote: ClinicalNote = {
        id: Date.now().toString(),
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        date: new Date().toISOString().split('T')[0],
        content: currentNote,
        mood: selectedMood,
        status: 'completed'
      };
      setClinicalNotes([newNote, ...clinicalNotes]);
      setCurrentNote('');
      setSelectedMood('');
      setShowNoteModal(false);
     
      setNotifications([`Evolução de ${selectedPatient.name} registrada com sucesso`, ...notifications]);
      setTimeout(() => setNotifications(prev => prev.slice(0, 5)), 5000);
    }
  };

  const handleUpdateAppointmentStatus = (appointmentId: string, newStatus: Appointment['status']) => {
    setAppointments(appointments.map(apt => 
      apt.id === appointmentId ? { ...apt, status: newStatus } : apt
    ));
  };

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  const activePatients = patients.filter(p => p.status === 'active').length;
  const todayAppointments = appointments.filter(a => a.status === 'confirmed').length;
  const pendingAmount = patients.reduce((sum, p) => sum + p.pendingAmount, 0);
  const recoveryRate = ((financialData.received / financialData.totalMonth) * 100).toFixed(1);

  const menuCategories = [
    {
      title: 'Visão Geral',
      items: [
        { id: 'dashboard', label: 'Painel Central', icon: <path d="M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z"/> },
      ]
    },
    {
      title: 'Atendimento Clínico',
      items: [
        { id: 'sala-espera', label: 'Sala de Espera Virtual', icon: <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/> },
        { id: 'teleconsulta', label: 'Teleconsulta Nativa', icon: <path d="M23 7l-7 5 7 5V7zM1 5h15v14H1z"/> },
        { id: 'evolucao', label: 'Evolução & Anotações', icon: <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V8l-6-6z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8"/> },
      ]
    },
    {
      title: 'Gestão de Pacientes',
      items: [
        { id: 'pacientes', label: 'Diretório de Pacientes', icon: <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m8-14a4 4 0 100 8 4 4 0 000-8zm14 14v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75"/> },
        { id: 'prontuarios', label: 'Prontuários Eletrônicos', icon: <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8"/> },
        { id: 'anamnese', label: 'Anamnese & Triagem', icon: <path d="M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/> },
        { id: 'testes', label: 'Testes Psicológicos', icon: <path d="M12 2v20 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/> },
        { id: 'diario', label: 'Diário de Emoções', icon: <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z M7 7h.01"/> },
        { id: 'portal', label: 'Acesso do Paciente', icon: <path d="M2 3h20v14H2z M8 21h8 M12 17v4"/> },
      ]
    },
    {
      title: 'Agenda & Horários',
      items: [
        { id: 'agenda', label: 'Calendário Inteligente', icon: <path d="M3 4h18v18H3z M16 2v4 M8 2v4 M3 10h18"/> },
        { id: 'lista-espera', label: 'Lista de Espera', icon: <path d="M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01"/> },
        { id: 'lembretes', label: 'Lembretes (SMS/Email)', icon: <path d="M22 17H2a3 3 0 003-3V9a7 7 0 0114 0v5a3 3 0 003 3zm-8.27 4a2 2 0 01-3.46 0"/> },
      ]
    },
    {
      title: 'Documentos',
      items: [
        { id: 'laudos', label: 'Laudos & Atestados', icon: <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6"/> },
        { id: 'assinatura', label: 'Assinatura Eletrônica', icon: <path d="M12 20h9 M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/> },
        { id: 'biblioteca', label: 'Materiais & Biblioteca', icon: <path d="M4 19.5A2.5 2.5 0 016.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/> },
      ]
    },
    {
      title: 'Financeiro',
      items: [
        { id: 'resumo-fin', label: 'Resumo Financeiro', icon: <path d="M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/> },
        { id: 'recibos', label: 'Recibos & Notas (NFS-e)', icon: <path d="M4 22h14a2 2 0 002-2V7.5L14.5 2H6a2 2 0 00-2 2v4 M14 2v6h6 M3 15h6 M3 18h6"/> },
        { id: 'cobrancas', label: 'Inadimplência & Pix', icon: <path d="M22 12h-4l-3 9L9 3l-3 9H2"/> },
      ]
    },
    {
      title: 'Administração',
      items: [
        { id: 'supervisao', label: 'Supervisão Clínica', icon: <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75"/> },
        { id: 'relatorios', label: 'Relatórios Estatísticos', icon: <path d="M18 20V10 M12 20V4 M6 20v-6"/> },
        { id: 'configuracoes', label: 'Configurações da Clínica', icon: <path d="M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/> },
      ]
    }
  ];

  return (
    <div className="dash-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        
        /* Animações */
        @keyframes dashFadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes modalFadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        
        .dash-anim { animation: dashFadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards; opacity: 0; }
        .d-1 { animation-delay: 0.1s; } .d-2 { animation-delay: 0.2s; } .d-3 { animation-delay: 0.3s; }
        
        /* Layout Base */
        .dash-container { display: flex; height: 100vh; background: #FAF6EE; font-family: 'DM Sans', sans-serif; overflow: hidden; width: 100%; }
        
        /* Sidebar */
        .dash-sidebar { width: 280px; background: #1A1008; border-right: 1px solid rgba(239,187,85,0.1); display: flex; flex-direction: column; z-index: 50; transition: transform 0.3s ease; flex-shrink: 0; }
        .dash-sidebar-header { padding: 24px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .dash-sidebar-scroll { flex: 1; overflow-y: auto; padding: 16px 0; }
        
        /* Custom Scrollbar for Sidebar */
        .dash-sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .dash-sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .dash-sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(239,187,85,0.2); border-radius: 4px; }
        
        /* Itens do Menu */
        .dash-nav-category { font-size: 10px; color: rgba(255,255,255,0.2); padding: 0 24px; margin: 16px 0 8px 0; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; }
        .dash-nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 24px; color: rgba(255,255,255,0.45); cursor: pointer; transition: all 0.2s; font-size: 13px; font-weight: 500; position: relative; border-left: 3px solid transparent; }
        .dash-nav-item:hover { color: rgba(239,187,85,0.8); background: rgba(255,255,255,0.02); }
        .dash-nav-item.active { color: #EFBB55; background: rgba(239,187,85,0.06); border-left-color: #EFBB55; }
        
        /* Notificações */
        .dash-notification { position: fixed; top: 20px; right: 20px; z-index: 200; animation: slideIn 0.3s ease; max-width: 320px; }
        .dash-notification-item { background: #2D1F0A; color: white; padding: 12px 16px; margin-bottom: 8px; border-radius: 8px; font-size: 13px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-left: 3px solid #EFBB55; }
        
        /* Perfil Footer */
        .dash-profile { padding: 20px 24px; border-top: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.2); }
        
        /* Main Content */
        .dash-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; width: 100%; position: relative; }
        
        /* Header */
        .dash-header { height: 80px; border-bottom: 1px solid #E8D9BE; background: white; display: flex; align-items: center; justify-content: space-between; padding: 0 40px; flex-shrink: 0; }
        .dash-mobile-btn { display: none; background: none; border: none; color: #2D1F0A; cursor: pointer; padding: 8px; margin-left: -8px; }
        
        /* Conteúdo Interno */
        .dash-content { flex: 1; overflow-y: auto; padding: 32px 40px; }
        
        /* Cards & Grid */
        .dash-card { background: white; border: 1px solid #E8D9BE; padding: 24px; transition: transform 0.2s, box-shadow 0.2s; border-radius: 12px; }
        .dash-card:hover { box-shadow: 0 8px 24px rgba(173,109,21,0.06); border-color: #D9C49A; transform: translateY(-2px); }
        
        .dash-kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; }
        .dash-layout-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-top: 24px; }
        
        /* Typography */
        .kpi-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #9A7040; font-weight: 600; }
        .kpi-value { font-family: 'Lora', serif; font-size: 32px; font-weight: 600; color: #2D1F0A; margin: 8px 0; line-height: 1; }
        .kpi-trend { fontSize: '11px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }
        .trend-up { color: #2E9E5B; } .trend-down { color: #C45A35; } .trend-neutral { color: #9A7040; }
        
        /* Listas */
        .dash-list-item { display: flex; align-items: center; justify-content: space-between; padding: 16px 0; border-bottom: 1px solid #FAF6EE; cursor: pointer; transition: background 0.2s; }
        .dash-list-item:hover { background: #FAF6EE; margin-left: -8px; padding-left: 8px; border-radius: 8px; }
        .dash-list-item:last-child { border-bottom: none; padding-bottom: 0; }
        
        /* Botões */
        .btn-action { background: #FAF6EE; border: 1px solid #D9C49A; color: #AD6D15; padding: 8px 14px; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.2s; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
        .btn-action:hover { background: #AD6D15; color: white; border-color: #AD6D15; transform: translateY(-1px); }
        
        .btn-primary { background: #2D1F0A; color: #FAF6EE; border: none; padding: 10px 18px; font-size: 12px; font-weight: 600; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s; text-transform: uppercase; border-radius: 6px; }
        .btn-primary:hover { background: #AD6D15; transform: translateY(-1px); }
        
        .btn-danger { background: #C45A35; color: white; border: none; padding: 8px 14px; font-size: 11px; font-weight: 600; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
        .btn-danger:hover { background: #993C1D; transform: translateY(-1px); }
        
        /* Modal */
        .dash-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 100; display: flex; align-items: center; justify-content: center; }
        .dash-modal { background: white; border-radius: 16px; padding: 32px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto; animation: modalFadeIn 0.3s ease; }
        
        /* Formulários */
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; font-size: 12px; font-weight: 600; color: #2D1F0A; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
        .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 10px 12px; border: 1px solid #E8D9BE; border-radius: 6px; font-family: 'DM Sans', sans-serif; font-size: 14px; transition: border-color 0.2s; }
        .form-group input:focus, .form-group textarea:focus, .form-group select:focus { outline: none; border-color: #AD6D15; }
        
        /* Badges */
        .badge { display: inline-block; padding: 4px 8px; font-size: 10px; font-weight: 600; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.05em; }
        .badge-active { background: #E8F4EC; color: #2E9E5B; }
        .badge-waiting { background: #FEF0EC; color: #C45A35; }
        .badge-inactive { background: #F5ECD8; color: #9A7040; }
        .badge-online { background: #E8F4EC; color: #2E9E5B; }
        .badge-presencial { background: #F5ECD8; color: #AD6D15; }
        
        /* Mood Selector */
        .mood-selector { display: flex; gap: 12px; margin-top: 8px; }
        .mood-option { padding: 8px 12px; border: 1px solid #E8D9BE; border-radius: 8px; cursor: pointer; transition: all 0.2s; font-size: 13px; }
        .mood-option:hover { border-color: #AD6D15; background: #FAF6EE; }
        .mood-option.selected { background: #AD6D15; color: white; border-color: #AD6D15; }
        
        /* Responsividade Extrema */
        @media (max-width: 1024px) {
          .dash-sidebar { position: fixed; height: 100vh; transform: translateX(-100%); }
          .dash-sidebar.open { transform: translateX(0); }
          .dash-mobile-btn { display: flex; align-items: center; }
          .dash-overlay.open { display: block; opacity: 1; }
          .dash-layout-grid { grid-template-columns: 1fr; }
          .dash-header { padding: 0 24px; height: 70px; }
          .dash-content { padding: 24px; }
        }
        
        @media (max-width: 640px) {
          .dash-header { padding: 0 16px; }
          .dash-content { padding: 16px; }
          .dash-header h2 { font-size: 18px !important; }
          .dash-kpi-grid { grid-template-columns: 1fr; }
          .dash-list-item { flex-direction: column; align-items: flex-start; gap: 12px; }
          .dash-list-item > div:last-child { width: 100%; }
          .dash-list-item .btn-action { width: 100%; justify-content: center; }
        }
        
        .dash-overlay { display: none; position: fixed; inset: 0; background: rgba(26, 16, 8, 0.6); backdrop-filter: blur(2px); z-index: 40; opacity: 0; transition: opacity 0.3s ease; }
      `}</style>

      <div className="dash-notification">
        {notifications.map((notif, idx) => (
          <div key={idx} className="dash-notification-item">
            {notif}
          </div>
        ))}
      </div>

      {showPatientModal && selectedPatient && (
        <div className="dash-modal-overlay" onClick={() => setShowPatientModal(false)}>
          <div className="dash-modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: "'Lora', serif", fontSize: 24, color: '#2D1F0A', marginBottom: 20 }}>Prontuário de {selectedPatient.name}</h3>
            
            <div className="form-group">
              <label>Informações Pessoais</label>
              <div style={{ background: '#FAF6EE', padding: 16, borderRadius: 8 }}>
                <p><strong>Telefone:</strong> {selectedPatient.phone}</p>
                <p><strong>Email:</strong> {selectedPatient.email}</p>
                <p><strong>Tipo de Terapia:</strong> {selectedPatient.therapyType}</p>
                <p><strong>Última Sessão:</strong> {new Date(selectedPatient.lastSession).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
            
            <div className="form-group">
              <label>Evoluções Clínicas</label>
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {clinicalNotes.filter(n => n.patientId === selectedPatient.id).map(note => (
                  <div key={note.id} style={{ padding: 12, background: '#FAF6EE', marginBottom: 8, borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: '#9A7040', marginBottom: 4 }}>{note.date}</div>
                    <div style={{ fontSize: 13 }}>{note.content}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <button className="btn-primary" onClick={() => { setShowPatientModal(false); setShowNoteModal(true); }}>
              Adicionar Evolução
            </button>
          </div>
        </div>
      )}

      {showNoteModal && selectedPatient && (
        <div className="dash-modal-overlay" onClick={() => setShowNoteModal(false)}>
          <div className="dash-modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: "'Lora', serif", fontSize: 24, color: '#2D1F0A', marginBottom: 20 }}>Registrar Evolução - {selectedPatient.name}</h3>
            
            <div className="form-group">
              <label>Estado Emocional do Paciente</label>
              <div className="mood-selector">
                {['ansioso', 'triste', 'calmo', 'irritado', 'feliz'].map(mood => (
                  <div key={mood} className={`mood-option ${selectedMood === mood ? 'selected' : ''}`} onClick={() => setSelectedMood(mood)}>
                    {mood}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="form-group">
              <label>Anotações da Sessão</label>
              <textarea 
                rows={6} 
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                placeholder="Descreva o andamento da sessão, intervenções realizadas, progresso do paciente..."
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #E8D9BE', borderRadius: 6, fontFamily: 'DM Sans, sans-serif' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn-action" onClick={() => setShowNoteModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleAddClinicalNote}>Salvar Evolução</button>
            </div>
          </div>
        </div>
      )}

      <div 
        className={`dash-overlay ${isMobileMenuOpen ? 'open' : ''}`} 
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <div className={`dash-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        
        <div className="dash-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: 'rgba(239,187,85,0.15)', border: '1px solid rgba(239,187,85,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#EFBB55"/></svg>
            </div>
            <div>
              <div style={{ fontFamily: "'Lora', serif", fontSize: 16, fontWeight: 600, color: 'white', lineHeight: 1 }}>PsicoSync</div>
              <div style={{ fontSize: 9, color: 'rgba(239,187,85,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 3 }}>Consultório Web</div>
            </div>
          </div>
       
          <button className="dash-mobile-btn" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'white', padding: 0, margin: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="dash-sidebar-scroll">
          {menuCategories.map((category, idx) => (
            <div key={idx}>
              <div className="dash-nav-category">{category.title}</div>
              {category.items.map(item => (
                <div 
                  key={item.id} 
                  className={`dash-nav-item ${activeTab === item.id ? 'active' : ''}`} 
                  onClick={() => handleTabChange(item.id)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {item.icon}
                  </svg>
                  {item.label}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="dash-profile">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EFBB55', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A1008', fontWeight: 600, fontSize: 14, flexShrink: 0 }}>
              DR
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 13, color: 'white', fontWeight: 500, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>Dra. Ana Beatriz</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>CRP 12/34567</div>
            </div>
          </div>
          <button onClick={onLogout} style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s', borderRadius: 6 }}
            onMouseOver={(e) => { e.currentTarget.style.color = '#C45A35'; e.currentTarget.style.borderColor = '#C45A35'; }}
            onMouseOut={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Encerrar Sessão
          </button>
        </div>
      </div>

      <div className="dash-main">
        
        <header className="dash-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button className="dash-mobile-btn" onClick={() => setIsMobileMenuOpen(true)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div>
              <h2 style={{ fontFamily: "'Lora', serif", fontSize: 24, fontWeight: 600, color: '#2D1F0A', margin: 0, lineHeight: 1.2 }}>
                {activeTab === 'dashboard' ? 'Painel de Controle' : menuCategories.flatMap(c => c.items).find(m => m.id === activeTab)?.label}
              </h2>
              <p style={{ fontSize: 12, color: '#9A7040', marginTop: 4 }}>{currentDate}</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5A3E20" strokeWidth="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              {notifications.length > 0 && (
                <span style={{ position: 'absolute', top: -2, right: 0, width: 10, height: 10, background: '#C45A35', borderRadius: '50%', border: '2px solid white' }}></span>
              )}
            </div>
           
            <button className="btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              <span className="hide-on-mobile">Nova Sessão</span>
            </button>
          </div>
        </header>

        <main className="dash-content">
          
          {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
           
              <div className="dash-kpi-grid">
                <div className="dash-card dash-anim d-1">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className="kpi-title">Consultas Hoje</span>
                    <div style={{ color: '#AD6D15', background: '#F5ECD8', padding: 8, borderRadius: '50%' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </div>
                  </div>
                  <div className="kpi-value">{todayAppointments}</div>
                  <div className="kpi-trend trend-neutral">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    {appointments.filter(a => a.status === 'completed').length} já concluídas
                  </div>
                </div>

                <div className="dash-card dash-anim d-2">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className="kpi-title">Pacientes Ativos</span>
                    <div style={{ color: '#2E9E5B', background: '#E8F4EC', padding: 8, borderRadius: '50%' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    </div>
                  </div>
                  <div className="kpi-value">{activePatients}</div>
                  <div className="kpi-trend trend-up">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                    +2 novas avaliações
                  </div>
                </div>

                <div className="dash-card dash-anim d-3">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className="kpi-title">Faturamento Mensal</span>
                    <div style={{ color: '#5A3E20', background: '#E8D9BE', padding: 8, borderRadius: '50%' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                    </div>
                  </div>
                  <div className="kpi-value">R$ {financialData.totalMonth.toLocaleString()}</div>
                  <div className="kpi-trend trend-down">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>
                    {financialData.pending.toLocaleString()} em aberto
                  </div>
                </div>

                <div className="dash-card dash-anim d-3">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className="kpi-title">Taxa de Recuperação</span>
                    <div style={{ color: '#2E9E5B', background: '#E8F4EC', padding: 8, borderRadius: '50%' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>
                    </div>
                  </div>
                  <div className="kpi-value">{recoveryRate}%</div>
                  <div className="kpi-trend trend-up">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                    Meta: 85%
                  </div>
                </div>
              </div>

              
              <div className="dash-layout-grid">
              
                <div className="dash-card dash-anim d-3" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid #FAF6EE', paddingBottom: 16 }}>
                    <h3 style={{ fontFamily: "'Lora', serif", fontSize: 18, color: '#2D1F0A', margin: 0 }}>Próximas Sessões</h3>
                    <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('agenda'); }} style={{ fontSize: 11, color: '#AD6D15', fontWeight: 600, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Abrir Agenda</a>
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    {appointments.map((apt, i) => (
                      <div key={i} className="dash-list-item">
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                          <div style={{ fontSize: 15, fontWeight: 600, color: '#2D1F0A', width: 45, marginTop: 2 }}>{apt.time}</div>
                          <div style={{ width: 3, height: 36, background: apt.type === 'online' ? '#2E9E5B' : '#AD6D15', borderRadius: 2, marginTop: 2 }}></div>
                          <div>
                            <div style={{ fontSize: 15, fontWeight: 600, color: '#2D1F0A', marginBottom: 4 }}>{apt.patientName}</div>
                            <div style={{ fontSize: 12, color: '#9A7040', display: 'flex', alignItems: 'center', gap: 6 }}>
                              {apt.type === 'online' ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg> : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>}
                              {apt.type === 'online' ? 'Teleconsulta' : 'Presencial'} • {apt.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                            </div>
                          </div>
                        </div>
                        <div>
                          {apt.type === 'online' ? (
                            <button className="btn-action" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                              Iniciar
                            </button>
                          ) : (
                            <button className="btn-action" onClick={() => { setSelectedPatient(patients.find(p => p.id === apt.patientId) || null); setShowNoteModal(true); }}>
                              Registrar Evolução
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {/* Tarefas Clínicas */}
                  <div className="dash-card dash-anim d-3">
                    <h3 style={{ fontFamily: "'Lora', serif", fontSize: 18, color: '#2D1F0A', margin: 0, marginBottom: 20, borderBottom: '1px solid #FAF6EE', paddingBottom: 16 }}>Alertas Clínicos</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {patients.filter(p => p.pendingAmount > 0).map(patient => (
                        <div key={patient.id} style={{ padding: 14, background: '#FEF0EC', borderLeft: '3px solid #C45A35', borderRadius: '0 8px 8px 0' }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#993C1D', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pagamento Pendente</div>
                          <div style={{ fontSize: 12, color: '#C45A35', lineHeight: 1.5 }}>
                            {patient.name} - R$ {patient.pendingAmount.toLocaleString()}
                          </div>
                        </div>
                      ))}
                      
                      <div style={{ padding: 14, background: '#F5ECD8', borderLeft: '3px solid #AD6D15', borderRadius: '0 8px 8px 0' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#9A7040', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prontuários Pendentes</div>
                        <div style={{ fontSize: 12, color: '#9A7040', lineHeight: 1.5 }}>
                          {patients.length - clinicalNotes.length} pacientes aguardando evolução
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pacientes em Espera */}
                  <div className="dash-card dash-anim d-3">
                    <h3 style={{ fontFamily: "'Lora', serif", fontSize: 18, color: '#2D1F0A', margin: 0, marginBottom: 20, borderBottom: '1px solid #FAF6EE', paddingBottom: 16 }}>Pacientes em Espera</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {patients.filter(p => p.status === 'waiting').map(patient => (
                        <div key={patient.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                          <div>
                            <div style={{ fontWeight: 600, color: '#2D1F0A' }}>{patient.name}</div>
                            <div style={{ fontSize: 11, color: '#9A7040' }}>{patient.therapyType}</div>
                          </div>
                          <button className="btn-action" onClick={() => setActiveTab('agenda')}>Agendar</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de Pacientes */}
              <div className="dash-card dash-anim d-3">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid #FAF6EE', paddingBottom: 16 }}>
                  <h3 style={{ fontFamily: "'Lora', serif", fontSize: 18, color: '#2D1F0A', margin: 0 }}>Pacientes Recentes</h3>
                  <button className="btn-action" onClick={() => setActiveTab('pacientes')}>Ver Todos</button>
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #FAF6EE', textAlign: 'left', fontSize: 12, color: '#9A7040' }}>
                        <th style={{ padding: '12px 0' }}>Paciente</th>
                        <th style={{ padding: '12px 0' }}>Próxima Sessão</th>
                        <th style={{ padding: '12px 0' }}>Status</th>
                        <th style={{ padding: '12px 0' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.slice(0, 4).map(patient => (
                        <tr key={patient.id} style={{ borderBottom: '1px solid #FAF6EE', cursor: 'pointer' }} onClick={() => { setSelectedPatient(patient); setShowPatientModal(true); }}>
                          <td style={{ padding: '12px 0' }}>
                            <div style={{ fontWeight: 600, color: '#2D1F0A' }}>{patient.name}</div>
                            <div style={{ fontSize: 11, color: '#9A7040' }}>{patient.therapyType}</div>
                          </td>
                          <td style={{ padding: '12px 0', fontSize: 13, color: '#5A3E20' }}>
                            {new Date(patient.nextSession).toLocaleDateString('pt-BR')}
                          </td>
                          <td style={{ padding: '12px 0' }}>
                            <span className={`badge badge-${patient.status}`}>
                              {patient.status === 'active' ? 'Ativo' : patient.status === 'waiting' ? 'Aguardando' : 'Inativo'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 0' }}>
                            <button className="btn-action" style={{ padding: '4px 12px', fontSize: 10 }}>Ver Prontuário</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pacientes' && (
            <div className="dash-anim d-1">
              <div className="dash-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <h3 style={{ fontFamily: "'Lora', serif", fontSize: 22, color: '#2D1F0A', margin: 0 }}>Diretório de Pacientes</h3>
                  <button className="btn-primary">+ Novo Paciente</button>
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #FAF6EE', textAlign: 'left', fontSize: 12, color: '#9A7040' }}>
                        <th style={{ padding: '12px 0' }}>Paciente</th>
                        <th style={{ padding: '12px 0' }}>Contato</th>
                        <th style={{ padding: '12px 0' }}>Tipo de Terapia</th>
                        <th style={{ padding: '12px 0' }}>Próxima Sessão</th>
                        <th style={{ padding: '12px 0' }}>Status</th>
                        <th style={{ padding: '12px 0' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.map(patient => (
                        <tr key={patient.id} style={{ borderBottom: '1px solid #FAF6EE', cursor: 'pointer' }} onClick={() => { setSelectedPatient(patient); setShowPatientModal(true); }}>
                          <td style={{ padding: '12px 0' }}>
                            <div style={{ fontWeight: 600, color: '#2D1F0A' }}>{patient.name}</div>
                          </td>
                          <td style={{ padding: '12px 0', fontSize: 13, color: '#5A3E20' }}>
                            {patient.phone}
                          </td>
                          <td style={{ padding: '12px 0', fontSize: 13, color: '#5A3E20' }}>
                            {patient.therapyType}
                          </td>
                          <td style={{ padding: '12px 0', fontSize: 13, color: '#5A3E20' }}>
                            {new Date(patient.nextSession).toLocaleDateString('pt-BR')}
                          </td>
                          <td style={{ padding: '12px 0' }}>
                            <span className={`badge badge-${patient.status}`}>
                              {patient.status === 'active' ? 'Ativo' : patient.status === 'waiting' ? 'Aguardando' : 'Inativo'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 0' }}>
                            <button className="btn-action" style={{ padding: '4px 12px', fontSize: 10 }} onClick={(e) => { e.stopPropagation(); setSelectedPatient(patient); setShowNoteModal(true); }}>
                              Registrar Evolução
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'evolucao' && (
            <div className="dash-anim d-1">
              <div className="dash-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <h3 style={{ fontFamily: "'Lora', serif", fontSize: 22, color: '#2D1F0A', margin: 0 }}>Evoluções Clínicas</h3>
                  <button className="btn-primary" onClick={() => { if(patients[0]) { setSelectedPatient(patients[0]); setShowNoteModal(true); } }}>+ Nova Evolução</button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {clinicalNotes.map(note => (
                    <div key={note.id} style={{ padding: 20, background: '#FAF6EE', borderRadius: 12, border: '1px solid #E8D9BE' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 600, color: '#2D1F0A' }}>{note.patientName}</div>
                          <div style={{ fontSize: 12, color: '#9A7040', marginTop: 4 }}>{new Date(note.date).toLocaleDateString('pt-BR')}</div>
                        </div>
                        {note.mood && (
                          <span className="badge badge-active" style={{ background: '#F5ECD8', color: '#AD6D15' }}>
                            Estado: {note.mood}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 14, color: '#5A3E20', lineHeight: 1.6 }}>{note.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'resumo-fin' && (
            <div className="dash-anim d-1">
              <div className="dash-card">
                <h3 style={{ fontFamily: "'Lora', serif", fontSize: 22, color: '#2D1F0A', marginBottom: 24 }}>Resumo Financeiro</h3>
                
                <div className="dash-kpi-grid" style={{ marginBottom: 32 }}>
                  <div style={{ padding: 20, background: '#FAF6EE', borderRadius: 12 }}>
                    <div className="kpi-title">Faturamento Total</div>
                    <div className="kpi-value">R$ {financialData.totalMonth.toLocaleString()}</div>
                  </div>
                  <div style={{ padding: 20, background: '#FAF6EE', borderRadius: 12 }}>
                    <div className="kpi-title">Recebido</div>
                    <div className="kpi-value" style={{ color: '#2E9E5B' }}>R$ {financialData.received.toLocaleString()}</div>
                  </div>
                  <div style={{ padding: 20, background: '#FAF6EE', borderRadius: 12 }}>
                    <div className="kpi-title">Pendente</div>
                    <div className="kpi-value" style={{ color: '#C45A35' }}>R$ {financialData.pending.toLocaleString()}</div>
                  </div>
                </div>
                
                <h4 style={{ fontSize: 16, color: '#2D1F0A', marginBottom: 16 }}>Próximos Recebimentos</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {financialData.nextReceipts.map((receipt, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: '#FAF6EE', borderRadius: 8 }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{receipt.patient}</div>
                        <div style={{ fontSize: 12, color: '#9A7040' }}>Vence em {new Date(receipt.dueDate).toLocaleDateString('pt-BR')}</div>
                      </div>
                      <div style={{ fontWeight: 600, color: '#AD6D15' }}>R$ {receipt.amount.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'dashboard' && activeTab !== 'pacientes' && activeTab !== 'evolucao' && activeTab !== 'resumo-fin' && (
            <div className="dash-anim d-1" style={{ height: '100%', minHeight: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9A7040', textAlign: 'center', background: 'white', border: '1px dashed #D9C49A', borderRadius: 12, padding: 24 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#FAF6EE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, color: '#AD6D15' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  {menuCategories.flatMap(c => c.items).find(m => m.id === activeTab)?.icon}
                </svg>
              </div>
              <h3 style={{ fontFamily: "'Lora', serif", fontSize: 24, color: '#2D1F0A', margin: 0, marginBottom: 12 }}>
                {menuCategories.flatMap(c => c.items).find(m => m.id === activeTab)?.label}
              </h3>
              <p style={{ fontSize: 14, maxWidth: 420, lineHeight: 1.6, color: '#5A3E20' }}>
                O módulo de <strong>{menuCategories.flatMap(c => c.items).find(m => m.id === activeTab)?.label.toLowerCase()}</strong> está sendo desenvolvido. Em breve você poderá gerenciar estes dados integrados ao Appwrite.
              </p>
              <button onClick={() => setActiveTab('dashboard')} className="btn-action" style={{ marginTop: 24 }}>
                Voltar ao Painel Central
              </button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}