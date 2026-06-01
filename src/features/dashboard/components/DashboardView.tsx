'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PatientsTab from '@/features/patients/components/PatientsTab';
import { Patient as AppwritePatient } from '@/features/patients/usePatients';
import { getCurrentUser } from '@/lib/auth';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';

interface DashboardViewProps {
  onLogout?: () => void;
  userId: string;
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
  evolution?: string[];
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
  topics?: string[];
  intervention?: string;
  nextSteps?: string;
  status: 'draft' | 'completed';
}

interface FinancialSummary {
  totalMonth: number;
  received: number;
  pending: number;
  nextReceipts: Array<{ patient: string; amount: number; dueDate: string }>;
}

interface AppNotification {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

export default function DashboardView({ onLogout, userId }: DashboardViewProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentDate, setCurrentDate] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [editingNote, setEditingNote] = useState<ClinicalNote | null>(null);
  
  // Estados para Evolução Melhorada
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [selectedMood, setSelectedMood] = useState('Estável');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const [noteDate, setNoteDate] = useState(today);
  
  // Novos campos para evolução profissional
  const [sessionNumber, setSessionNumber] = useState<number>(1);
  const [sessionTopics, setSessionTopics] = useState<string[]>([]);
  const [currentTopic, setCurrentTopic] = useState('');
  const [interventionUsed, setInterventionUsed] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [sessionDuration, setSessionDuration] = useState(50);
  const [isTelehealth, setIsTelehealth] = useState(false);
  
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const [userName, setUserName] = useState('Carregando...');
  const [userInitials, setUserInitials] = useState('');
  const [userCrp, setUserCrp] = useState('');

  // Arrays de Dados Reais
  const [patients, setPatients] = useState<Patient[]>([]);
  const [clinicalNotes, setClinicalNotes] = useState<ClinicalNote[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: '1', patientId: '1', patientName: 'Mariana Costa', time: '09:00', type: 'online', status: 'confirmed', notes: 'Sessão de acompanhamento' },
    { id: '2', patientId: '2', patientName: 'Carlos Eduardo Silva', time: '10:30', type: 'presencial', status: 'confirmed', notes: 'Trabalho com ansiedade' },
    { id: '3', patientId: '3', patientName: 'Beatriz Almeida', time: '14:00', type: 'online', status: 'confirmed', notes: 'Terapia de casal' },
    { id: '4', patientId: '4', patientName: 'Rafael Souza', time: '16:00', type: 'presencial', status: 'pending', notes: 'Primeira sessão' },
  ]);

  const [financialData, setFinancialData] = useState<FinancialSummary>({
    totalMonth: 5250,
    received: 4200,
    pending: 1050,
    nextReceipts: [
      { patient: 'Mariana Costa', amount: 350, dueDate: '2024-01-20' },
      { patient: 'Luciana Vieira', amount: 525, dueDate: '2024-01-25' },
      { patient: 'Beatriz Almeida', amount: 175, dueDate: '2024-01-22' },
    ],
  });

  const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
  const colId = process.env.NEXT_PUBLIC_APPWRITE_PATIENTS_COLLECTION_ID || '';

  const addNotification = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString();
    setNotifications(prev => [...prev, { id, text, type }]);
    
    setTimeout(() => {
      removeNotification(id);
    }, 6000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    setMounted(true);
    const fetchUserData = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setUserName(user.name);
       
          const nameParts = user.name.trim().split(' ');
          let initials = '';
          if (nameParts.length > 1) {
            initials = `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`;
          } else if (nameParts.length === 1) {
            initials = nameParts[0].substring(0, 2);
          }
          setUserInitials(initials.toUpperCase());
          setUserCrp(user.crp || 'Psicólogo(a) CRP 00/00000');
        } else {
          setUserName('Usuário Desconhecido');
          setUserInitials('US');
          setUserCrp('Profissional de Saúde');
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
        setUserName('Usuário');
        setUserInitials('US');
        setUserCrp('Profissional de Saúde');
      }
    };
    fetchUserData();

    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const date = new Date().toLocaleDateString('pt-BR', options);
    setCurrentDate(date.charAt(0).toUpperCase() + date.slice(1));
  }, []);

  useEffect(() => {
    const fetchPatientsAndEvolutions = async () => {
      setIsLoadingData(true);
      try {
        if (!dbId || !colId) return;

        const res = await databases.listDocuments(dbId, colId, [
          Query.orderDesc('$createdAt'),
          Query.limit(100)
        ]);

        const fetchedPatients = res.documents.map(doc => ({
          id: doc.$id,
          name: doc.name || 'Sem Nome',
          phone: doc.phone || '',
          email: doc.email || '',
          status: doc.status || 'active',
          nextSession: doc.nextSession || '',
          pendingAmount: doc.pendingAmount || 0,
          lastSession: doc.lastSession || '',
          therapyType: doc.therapyType || '',
          evolution: doc.evolution || []
        }));

        setPatients(fetchedPatients as Patient[]);

        // Constrói a lista geral de evoluções
        const allNotes: ClinicalNote[] = [];
        fetchedPatients.forEach(pt => {
          if (pt.evolution && Array.isArray(pt.evolution)) {
            pt.evolution.forEach((evStr: string) => {
              try {
                const ev = JSON.parse(evStr);
                allNotes.push({
                  id: ev.id,
                  patientId: pt.id,
                  patientName: pt.name,
                  date: ev.date,
                  content: ev.text,
                  mood: ev.state,
                  topics: ev.topics || [],
                  intervention: ev.intervention || '',
                  nextSteps: ev.nextSteps || '',
                  status: 'completed'
                });
              } catch (e) {
                console.error("Erro ao fazer parse da evolução", e);
              }
            });
          }
        });

        allNotes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setClinicalNotes(allNotes);

        // Calcula finanças
        let totalPendente = 0;
        fetchedPatients.forEach(pt => {
          if (pt.pendingAmount) totalPendente += Number(pt.pendingAmount);
        });
        setFinancialData(prev => ({ ...prev, pending: totalPendente }));

      } catch (error) {
        console.error("Erro ao buscar pacientes:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchPatientsAndEvolutions();
  }, [dbId, colId]);

  // Salvar ou Editar Evolução
  const handleSaveClinicalNote = async () => {
    if (!selectedPatient) return;
    if (!currentNote.trim()) {
      addNotification("Por favor, preencha o texto da evolução.", "error");
      return;
    }

    setIsSavingNote(true);
    try {
      const evolutionData = {
        id: editingNote?.id || Date.now().toString(),
        date: noteDate,
        state: selectedMood,
        text: currentNote,
        topics: sessionTopics,
        intervention: interventionUsed,
        nextSteps: nextSteps,
        sessionNumber: sessionNumber,
        duration: sessionDuration,
        isTelehealth: isTelehealth
      };

      if (dbId && colId) {
        const currentDoc = await databases.getDocument(dbId, colId, selectedPatient.id);
        const currentEvolutions = currentDoc.evolution || [];
        
        let updatedEvolutions;
        if (editingNote) {
          // Editando evolução existente
          updatedEvolutions = currentEvolutions.map((evStr: string) => {
            try {
              const ev = JSON.parse(evStr);
              return ev.id === editingNote.id ? JSON.stringify(evolutionData) : evStr;
            } catch {
              return evStr;
            }
          });
          addNotification(`Evolução de ${selectedPatient.name} atualizada com sucesso!`, "success");
        } else {
          // Nova evolução
          updatedEvolutions = [JSON.stringify(evolutionData), ...currentEvolutions];
          addNotification(`Evolução de ${selectedPatient.name} salva com sucesso!`, "success");
        }
        
        await databases.updateDocument(dbId, colId, selectedPatient.id, {
          evolution: updatedEvolutions
        });

        // Atualiza estado local
        const updatedPatient = { ...selectedPatient, evolution: updatedEvolutions };
        setSelectedPatient(updatedPatient);
        setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
      }

      const newNote: ClinicalNote = {
        id: evolutionData.id,
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        date: evolutionData.date,
        content: evolutionData.text,
        mood: evolutionData.state,
        topics: evolutionData.topics,
        intervention: evolutionData.intervention,
        nextSteps: evolutionData.nextSteps,
        status: 'completed',
      };

      if (editingNote) {
        setClinicalNotes(prev => prev.map(n => n.id === editingNote.id ? newNote : n));
      } else {
        setClinicalNotes(prev => [newNote, ...prev]);
      }
      
      resetNoteForm();
      setShowNoteModal(false);
      setEditingNote(null);
      setShowPatientModal(true);

    } catch (error: any) {
      console.error(error);
      addNotification("Erro ao salvar evolução: " + error.message, "error");
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleEditNote = (note: ClinicalNote) => {
    setEditingNote(note);
    setCurrentNote(note.content);
    setSelectedMood(note.mood || 'Estável');
    setNoteDate(note.date);
    setSessionTopics(note.topics || []);
    setInterventionUsed(note.intervention || '');
    setNextSteps(note.nextSteps || '');
    setShowNoteModal(true);
    setShowPatientModal(false);
  };

  const resetNoteForm = () => {
    setCurrentNote('');
    setSelectedMood('Estável');
    setNoteDate(today);
    setSessionTopics([]);
    setCurrentTopic('');
    setInterventionUsed('');
    setNextSteps('');
    setSessionNumber(1);
    setSessionDuration(50);
    setIsTelehealth(false);
  };

  const handleAddTopic = () => {
    if (currentTopic.trim() && !sessionTopics.includes(currentTopic.trim())) {
      setSessionTopics([...sessionTopics, currentTopic.trim()]);
      setCurrentTopic('');
    }
  };

  const handleRemoveTopic = (topic: string) => {
    setSessionTopics(sessionTopics.filter(t => t !== topic));
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!selectedPatient || !confirm('Tem certeza que deseja excluir esta evolução?')) return;
    
    try {
      if (dbId && colId) {
        const currentDoc = await databases.getDocument(dbId, colId, selectedPatient.id);
        const currentEvolutions = currentDoc.evolution || [];
        const updatedEvolutions = currentEvolutions.filter((evStr: string) => {
          try {
            const ev = JSON.parse(evStr);
            return ev.id !== noteId;
          } catch {
            return true;
          }
        });
        
        await databases.updateDocument(dbId, colId, selectedPatient.id, {
          evolution: updatedEvolutions
        });

        setClinicalNotes(prev => prev.filter(n => n.id !== noteId));
        setSelectedPatient(prev => prev ? { ...prev, evolution: updatedEvolutions } : null);
        addNotification("Evolução excluída com sucesso!", "info");
      }
    } catch (error: any) {
      addNotification("Erro ao excluir evolução: " + error.message, "error");
    }
  };

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  const handleSelectAppwritePatient = (ap: AppwritePatient) => {
    setSelectedPatient({
      id: ap.$id,
      name: ap.name,
      phone: ap.phone,
      email: ap.email,
      status: ap.status as any,
      nextSession: ap.nextSession,
      pendingAmount: ap.pendingAmount,
      lastSession: ap.lastSession,
      therapyType: ap.therapyType,
      evolution: ap.evolution,
    });
    setShowPatientModal(true);
  };

  const activePatients = patients.filter(p => p.status === 'active').length;
  const todayAppointments = appointments.filter(a => a.status === 'confirmed').length;
  const recoveryRate = financialData.totalMonth > 0 ? ((financialData.received / financialData.totalMonth) * 100).toFixed(1) : '0.0';

  const menuCategories = [
    {
      title: 'Visão Geral',
      items: [
        { id: 'dashboard', label: 'Painel Central', icon: <path d="M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z" /> },
      ],
    },
    {
      title: 'Atendimento Clínico',
      items: [
        { id: 'sala-espera', label: 'Sala de Espera Virtual', icon: <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> },
        { id: 'teleconsulta', label: 'Teleconsulta Nativa', icon: <path d="M23 7l-7 5 7 5V7zM1 5h15v14H1z" /> },
        { id: 'evolucao', label: 'Evolução & Anotações', icon: <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V8l-6-6z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" /> },
      ],
    },
    {
      title: 'Gestão de Pacientes',
      items: [
        { id: 'pacientes', label: 'Diretório de Pacientes', icon: <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m8-14a4 4 0 100 8 4 4 0 000-8zm14 14v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75" /> },
        { id: 'prontuarios', label: 'Prontuários Eletrônicos', icon: <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" /> },
        { id: 'anamnese', label: 'Anamnese & Triagem', icon: <path d="M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /> },
        { id: 'testes', label: 'Testes Psicológicos', icon: <path d="M12 2v20 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /> },
        { id: 'diario', label: 'Diário de Emoções', icon: <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z M7 7h.01" /> },
        { id: 'portal', label: 'Acesso do Paciente', icon: <path d="M2 3h20v14H2z M8 21h8 M12 17v4" /> },
      ],
    },
    {
      title: 'Agenda & Horários',
      items: [
        { id: 'agenda', label: 'Calendário Inteligente', icon: <path d="M3 4h18v18H3z M16 2v4 M8 2v4 M3 10h18" /> },
        { id: 'lista-espera', label: 'Lista de Espera', icon: <path d="M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01" /> },
        { id: 'lembretes', label: 'Lembretes (SMS/Email)', icon: <path d="M22 17H2a3 3 0 003-3V9a7 7 0 0114 0v5a3 3 0 003 3zm-8.27 4a2 2 0 01-3.46 0" /> },
      ],
    },
    {
      title: 'Documentos',
      items: [
        { id: 'laudos', label: 'Laudos & Atestados', icon: <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6" /> },
        { id: 'assinatura', label: 'Assinatura Eletrônica', icon: <path d="M12 20h9 M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /> },
        { id: 'biblioteca', label: 'Materiais & Biblioteca', icon: <path d="M4 19.5A2.5 2.5 0 016.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /> },
      ],
    },
    {
      title: 'Financeiro',
      items: [
        { id: 'resumo-fin', label: 'Resumo Financeiro', icon: <path d="M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /> },
        { id: 'recibos', label: 'Recibos & Notas (NFS-e)', icon: <path d="M4 22h14a2 2 0 002-2V7.5L14.5 2H6a2 2 0 00-2 2v4 M14 2v6h6 M3 15h6 M3 18h6" /> },
        { id: 'cobrancas', label: 'Inadimplência & Pix', icon: <path d="M22 12h-4l-3 9L9 3l-3 9H2" /> },
      ],
    },
    {
      title: 'Administração',
      items: [
        { id: 'supervisao', label: 'Supervisão Clínica', icon: <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75" /> },
        { id: 'relatorios', label: 'Relatórios Estatísticos', icon: <path d="M18 20V10 M12 20V4 M6 20v-6" /> },
        { id: 'configuracoes', label: 'Configurações da Clínica', icon: <path d="M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" /> },
      ],
    },
  ];

  const emotionOptions = ['Estável', 'Calmo', 'Ansioso', 'Irritado', 'Triste', 'Eufórico', 'Agressivo', 'Apático', 'Angustiado', 'Deprimido', 'Esperançoso', 'Motivado'];

  const therapyInterventions = [
    'TCC - Reestruturação Cognitiva',
    'TCC - Ativação Comportamental',
    'Psicanálise - Associação Livre',
    'Humanista - Escuta Empática',
    'Gestalt - Aqui e Agora',
    'EMDR - Dessensibilização',
    'Mindfulness',
    'Terapia de Aceitação e Compromisso',
    'Terapia de Casal',
    'Terapia Familiar',
    'Psicoeducação',
    'Técnicas de Relaxamento'
  ];

  // SE NÃO ESTIVER MONTADO, RETORNA NULO
  if (!mounted) return null;

  return (
    <div className="dash-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        
        @keyframes dashFadeUp { 
          from { opacity: 0; transform: translateY(16px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        @keyframes slideIn { 
          from { transform: translateX(100%); opacity: 0; } 
          to { transform: translateX(0); opacity: 1; } 
        }
        @keyframes modalFadeIn { 
          from { opacity: 0; transform: scale(0.95); } 
          to { opacity: 1; transform: scale(1); } 
        }
        @keyframes spin { 
          to { transform: rotate(360deg); } 
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .dash-anim { animation: dashFadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards; opacity: 0; }
        .d-1 { animation-delay: 0.1s; } .d-2 { animation-delay: 0.2s; } .d-3 { animation-delay: 0.3s; }
        
        .dash-container { 
          display: flex; 
          height: 100vh; 
          background: #FAF6EE; 
          font-family: 'DM Sans', sans-serif; 
          overflow: hidden; 
          width: 100%; 
        }
        
        /* Sidebar */
        .dash-sidebar { 
          width: 280px; 
          background: #1A1008; 
          border-right: 1px solid rgba(239,187,85,0.1); 
          display: flex; 
          flex-direction: column; 
          z-index: 50; 
          transition: transform 0.3s ease; 
          flex-shrink: 0; 
        }
        
        @media (max-width: 1024px) {
          .dash-sidebar { 
            position: fixed; 
            height: 100vh; 
            transform: translateX(-100%); 
          }
          .dash-sidebar.open { transform: translateX(0); }
          .dash-layout-grid { grid-template-columns: 1fr; }
          .dash-header { padding: 16px 24px; }
          .dash-content { padding: 24px; }
        }
        
        @media (max-width: 640px) {
          .dash-header { padding: 16px; }
          .dash-content { padding: 16px; }
          .dash-kpi-grid { grid-template-columns: 1fr; }
          .dash-modal { padding: 20px; width: 95%; }
          .dash-modal-content { padding: 20px; }
          .btn-mobile-full { width: 100%; }
          .topics-container { flex-wrap: wrap; }
        }
        
        .dash-sidebar-header { 
          padding: 24px; 
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          border-bottom: 1px solid rgba(255,255,255,0.05); 
        }
        
        .dash-sidebar-scroll { 
          flex: 1; 
          overflow-y: auto; 
          padding: 16px 0; 
        }
        
        .dash-sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .dash-sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .dash-sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(239,187,85,0.2); border-radius: 4px; }
        
        .dash-nav-category { 
          font-size: 10px; 
          color: rgba(255,255,255,0.2); 
          padding: 0 24px; 
          margin: 16px 0 8px 0; 
          letter-spacing: 0.1em; 
          text-transform: uppercase; 
          font-weight: 600; 
        }
        
        .dash-nav-item { 
          display: flex; 
          align-items: center; 
          gap: 12px; 
          padding: 10px 24px; 
          color: rgba(255,255,255,0.45); 
          cursor: pointer; 
          transition: all 0.2s; 
          font-size: 13px; 
          font-weight: 500; 
          position: relative; 
          border-left: 3px solid transparent; 
        }
        
        .dash-nav-item:hover { color: rgba(239,187,85,0.8); background: rgba(255,255,255,0.02); }
        .dash-nav-item.active { color: #EFBB55; background: rgba(239,187,85,0.06); border-left-color: #EFBB55; }
        
        .dash-mobile-btn { 
          display: none; 
          background: none; 
          border: none; 
          color: #2D1F0A; 
          cursor: pointer; 
          padding: 8px; 
        }
        
        @media (max-width: 1024px) {
          .dash-mobile-btn { display: flex; align-items: center; }
        }
        
        .dash-notification { 
          position: fixed; 
          top: 20px; 
          right: 20px; 
          z-index: 2000; 
          display: flex; 
          flex-direction: column; 
          gap: 8px; 
          max-width: 320px; 
        }
        
        .dash-notification-item { 
          display: flex; 
          align-items: flex-start; 
          justify-content: space-between; 
          gap: 12px; 
          padding: 12px 16px; 
          border-radius: 8px; 
          font-size: 13px; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
          animation: slideIn 0.3s ease; 
        }
        
        .dash-notification-success { background: #2E9E5B; color: white; border-left: 3px solid #1A6B3F; }
        .dash-notification-error { background: #C45A35; color: white; border-left: 3px solid #8B3A1F; }
        .dash-notification-info { background: #2D1F0A; color: white; border-left: 3px solid #EFBB55; }
        
        .dash-profile { padding: 20px 24px; border-top: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.2); }
        .dash-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; width: 100%; }
        
        .dash-header { 
          min-height: 80px; 
          border-bottom: 1px solid #E8D9BE; 
          background: white; 
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          padding: 16px 40px; 
          flex-shrink: 0; 
        }
        
        .dash-content { flex: 1; overflow-y: auto; padding: 32px 40px; }
        
        .dash-card { 
          background: white; 
          border: 1px solid #E8D9BE; 
          padding: 24px; 
          transition: transform 0.2s, box-shadow 0.2s; 
          border-radius: 12px; 
        }
        
        .dash-card:hover { 
          box-shadow: 0 8px 24px rgba(173,109,21,0.06); 
          border-color: #D9C49A; 
          transform: translateY(-2px); 
        }
        
        .dash-kpi-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); 
          gap: 20px; 
          margin-bottom: 24px;
        }
        
        .dash-layout-grid { 
          display: grid; 
          grid-template-columns: 2fr 1fr; 
          gap: 24px; 
          margin-top: 24px; 
        }
        
        .kpi-title { 
          font-size: 11px; 
          text-transform: uppercase; 
          letter-spacing: 0.08em; 
          color: #9A7040; 
          font-weight: 600; 
        }
        
        .kpi-value { 
          font-family: 'Lora', serif; 
          font-size: 32px; 
          font-weight: 600; 
          color: #2D1F0A; 
          margin: 8px 0; 
          line-height: 1; 
        }
        
        .btn-action { 
          background: #FAF6EE; 
          border: 1px solid #D9C49A; 
          color: #AD6D15; 
          padding: 8px 14px; 
          font-size: 11px; 
          font-weight: 600; 
          cursor: pointer; 
          transition: all 0.2s; 
          border-radius: 6px; 
          text-transform: uppercase; 
          letter-spacing: 0.05em; 
        }
        
        .btn-action:hover:not(:disabled) { 
          background: #AD6D15; 
          color: white; 
          border-color: #AD6D15; 
          transform: translateY(-1px); 
        }
        
        .btn-primary { 
          background: #2D1F0A; 
          color: #FAF6EE; 
          border: none; 
          padding: 10px 18px; 
          font-size: 12px; 
          font-weight: 600; 
          letter-spacing: 0.05em; 
          display: flex; 
          align-items: center; 
          gap: 8px; 
          cursor: pointer; 
          transition: all 0.2s; 
          text-transform: uppercase; 
          border-radius: 6px; 
        }
        
        .btn-primary:hover:not(:disabled) { background: #AD6D15; transform: translateY(-1px); }
        .btn-primary:disabled { background: #9A7040; cursor: not-allowed; opacity: 0.8; }
        
        .btn-danger { 
          background: #C45A35; 
          color: white; 
          border: none; 
          padding: 8px 14px; 
          font-size: 11px; 
          font-weight: 600; 
          cursor: pointer; 
          transition: all 0.2s; 
          border-radius: 6px; 
          text-transform: uppercase; 
          letter-spacing: 0.05em; 
        }
        
        .btn-danger:hover { background: #8B3A1F; transform: translateY(-1px); }
        
        .btn-secondary { 
          background: transparent; 
          border: 1px solid #D9C49A; 
          color: #9A7040; 
          padding: 8px 14px; 
          font-size: 11px; 
          font-weight: 600; 
          cursor: pointer; 
          transition: all 0.2s; 
          border-radius: 6px; 
          text-transform: uppercase; 
          letter-spacing: 0.05em; 
        }
        
        .dash-overlay { 
          display: none; 
          position: fixed; 
          inset: 0; 
          background: rgba(26,16,8,0.6); 
          backdrop-filter: blur(2px); 
          z-index: 40; 
          opacity: 0; 
          transition: opacity 0.3s ease; 
        }
        
        .dash-overlay.open { display: block; opacity: 1; }
        
        /* Modal Styles */
        .dash-modal-overlay { 
          position: fixed; 
          top: 0; 
          left: 0; 
          right: 0; 
          bottom: 0; 
          background: rgba(0,0,0,0.5); 
          backdrop-filter: blur(4px); 
          z-index: 999999; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          padding: 16px;
        }
        
        .dash-modal { 
          background: white; 
          border-radius: 20px; 
          max-width: 700px; 
          width: 100%; 
          max-height: 90vh; 
          overflow-y: auto; 
          animation: modalFadeIn 0.3s ease; 
        }
        
        .dash-modal-content { padding: 32px; }
        
        @media (max-width: 640px) {
          .dash-modal-content { padding: 20px; }
        }
        
        .form-group { margin-bottom: 20px; }
        
        .form-group label { 
          display: block; 
          font-size: 12px; 
          font-weight: 600; 
          color: #2D1F0A; 
          margin-bottom: 8px; 
          text-transform: uppercase; 
          letter-spacing: 0.05em; 
        }
        
        .form-group input, 
        .form-group textarea, 
        .form-group select { 
          width: 100%; 
          padding: 10px 12px; 
          border: 1px solid #E8D9BE; 
          border-radius: 8px; 
          font-family: 'DM Sans', sans-serif; 
          font-size: 14px; 
          transition: all 0.2s; 
        }
        
        .form-group input:focus, 
        .form-group textarea:focus, 
        .form-group select:focus { 
          outline: none; 
          border-color: #AD6D15; 
          box-shadow: 0 0 0 3px rgba(173,109,21,0.1); 
        }
        
        .badge { 
          display: inline-block; 
          padding: 4px 8px; 
          font-size: 10px; 
          font-weight: 600; 
          border-radius: 4px; 
          text-transform: uppercase; 
          letter-spacing: 0.05em; 
        }
        
        .badge-active { background: #E8F4EC; color: #2E9E5B; }
        .badge-waiting { background: #FEF0EC; color: #C45A35; }
        .badge-inactive { background: #F5ECD8; color: #9A7040; }
        
        .mood-selector { 
          display: flex; 
          gap: 8px; 
          margin-top: 8px; 
          flex-wrap: wrap; 
        }
        
        .mood-option { 
          background: #FDFAF5; 
          border: 1px solid #E8D9BE; 
          color: #9A7040; 
          padding: 8px 14px; 
          border-radius: 20px; 
          font-size: 12px; 
          font-weight: 500; 
          cursor: pointer; 
          transition: all 0.2s; 
        }
        
        .mood-option:hover:not(.selected) { 
          border-color: #AD6D15; 
          color: #5A3E20; 
          background: white; 
        }
        
        .mood-option.selected { 
          background: #2D1F0A; 
          border-color: #2D1F0A; 
          color: #EFBB55; 
        }
        
        .topic-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #FAF6EE;
          border: 1px solid #E8D9BE;
          padding: 4px 10px;
          border-radius: 16px;
          font-size: 12px;
          color: #2D1F0A;
        }
        
        .topic-tag button {
          background: none;
          border: none;
          cursor: pointer;
          color: #C45A35;
          font-size: 14px;
          display: flex;
          align-items: center;
          padding: 0;
        }
        
        .topics-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
        }
        
        .note-card {
          background: #FAF6EE;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 12px;
          transition: all 0.2s;
        }
        
        .note-card:hover {
          background: #F5ECD8;
          transform: translateX(4px);
        }
        
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        
        @media (max-width: 640px) {
          .grid-2 {
            grid-template-columns: 1fr;
          }
        }
        
        .patient-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          background: #FAF6EE;
          padding: 16px;
          border-radius: 12px;
        }
      `}</style>

      {/* MODAL DE PRONTUÁRIO MELHORADO */}
      {showPatientModal && selectedPatient && createPortal(
        <div className="dash-modal-overlay" onClick={() => setShowPatientModal(false)}>
          <div className="dash-modal" onClick={e => e.stopPropagation()}>
            <div className="dash-modal-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ fontFamily: "'Lora', serif", fontSize: 24, color: '#2D1F0A', marginBottom: 4 }}>
                    {selectedPatient.name}
                  </h3>
                  <p style={{ fontSize: 13, color: '#9A7040' }}>
                    {selectedPatient.therapyType || 'Terapia não definida'} • 
                    {selectedPatient.status === 'active' ? ' Em tratamento' : selectedPatient.status === 'waiting' ? ' Aguardando' : ' Inativo'}
                  </p>
                </div>
                <button className="btn-action" onClick={() => setShowPatientModal(false)}>Fechar</button>
              </div>
              
              <div className="patient-info-grid">
                <div>
                  <div style={{ fontSize: 11, color: '#9A7040', marginBottom: 4 }}>Contato</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#2D1F0A' }}>{selectedPatient.phone || 'Não informado'}</div>
                  <div style={{ fontSize: 13, color: '#5A3E20' }}>{selectedPatient.email || 'Não informado'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#9A7040', marginBottom: 4 }}>Sessões</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#2D1F0A' }}>
                    Última: {selectedPatient.lastSession ? new Date(selectedPatient.lastSession).toLocaleDateString('pt-BR') : '—'}
                  </div>
                  <div style={{ fontSize: 13, color: '#5A3E20' }}>
                    Próxima: {selectedPatient.nextSession ? new Date(selectedPatient.nextSession).toLocaleDateString('pt-BR') : 'Não agendada'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#9A7040', marginBottom: 4 }}>Financeiro</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: selectedPatient.pendingAmount > 0 ? '#C45A35' : '#2E9E5B' }}>
                    Pendente: R$ {selectedPatient.pendingAmount?.toLocaleString() || '0'}
                  </div>
                </div>
              </div>
              
              <div className="form-group" style={{ marginTop: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                  <label style={{ marginBottom: 0 }}>Evoluções Clínicas</label>
                  <button 
                    className="btn-primary" 
                    onClick={() => { 
                      setShowPatientModal(false); 
                      resetNoteForm();
                      setEditingNote(null);
                      setShowNoteModal(true); 
                    }}
                    style={{ padding: '6px 12px', fontSize: 11 }}
                  >
                    + Nova Evolução
                  </button>
                </div>
                
                <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                  {clinicalNotes.filter(n => n.patientId === selectedPatient.id).length === 0 && (
                    <div style={{ textAlign: 'center', padding: 40, color: '#9A7040' }}>
                      Nenhuma evolução registrada ainda.
                    </div>
                  )}
                  {clinicalNotes.filter(n => n.patientId === selectedPatient.id).map(note => (
                    <div key={note.id} className="note-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#2D1F0A' }}>
                            {new Date(note.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                          </div>
                          <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                            <span className="badge" style={{ background: '#F5ECD8', color: '#AD6D15' }}>
                              {note.mood}
                            </span>
                            {note.topics && note.topics.slice(0, 2).map(topic => (
                              <span key={topic} style={{ fontSize: 10, color: '#9A7040' }}>#{topic}</span>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button 
                            className="btn-secondary" 
                            onClick={() => handleEditNote(note)}
                            style={{ padding: '4px 10px', fontSize: 10 }}
                          >
                            ✏️ Editar
                          </button>
                          <button 
                            className="btn-danger" 
                            onClick={() => handleDeleteNote(note.id)}
                            style={{ padding: '4px 10px', fontSize: 10 }}
                          >
                            🗑️ Excluir
                          </button>
                        </div>
                      </div>
                      <div style={{ fontSize: 13, lineHeight: 1.6, color: '#5A3E20', marginBottom: 8, whiteSpace: 'pre-wrap' }}>
                        {note.content.length > 200 ? note.content.substring(0, 200) + '...' : note.content}
                      </div>
                      {note.nextSteps && (
                        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #E8D9BE', fontSize: 12, color: '#9A7040' }}>
                          <strong>Próximos passos:</strong> {note.nextSteps}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: 12, marginTop: 16, justifyContent: 'flex-end' }}>
                <button className="btn-primary" onClick={() => { setShowPatientModal(false); resetNoteForm(); setEditingNote(null); setShowNoteModal(true); }}>
                  Adicionar Evolução
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL DE EVOLUÇÃO MELHORADO */}
      {showNoteModal && selectedPatient && createPortal(
        <div className="dash-modal-overlay" onClick={() => { setShowNoteModal(false); resetNoteForm(); setEditingNote(null); }}>
          <div className="dash-modal" onClick={e => e.stopPropagation()}>
            <div className="dash-modal-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ fontFamily: "'Lora', serif", fontSize: 22, color: '#2D1F0A' }}>
                  {editingNote ? 'Editar Evolução' : 'Nova Evolução Clínica'}
                </h3>
                <button 
                  onClick={() => { setShowNoteModal(false); resetNoteForm(); setEditingNote(null); }} 
                  style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#9A7040' }}
                >
                  ×
                </button>
              </div>
              
              <div className="grid-2">
                <div className="form-group">
                  <label>📅 Data da Sessão</label>
                  <input 
                    type="date" 
                    value={noteDate}
                    onChange={e => setNoteDate(e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label>⏱️ Duração (minutos)</label>
                  <select value={sessionDuration} onChange={e => setSessionDuration(Number(e.target.value))}>
                    <option value={30}>30 min</option>
                    <option value={50}>50 min</option>
                    <option value={60}>60 min</option>
                    <option value={90}>90 min</option>
                  </select>
                </div>
              </div>
              
              <div className="grid-2">
                <div className="form-group">
                  <label>🔢 Número da Sessão</label>
                  <input 
                    type="number" 
                    min={1}
                    value={sessionNumber}
                    onChange={e => setSessionNumber(Number(e.target.value))}
                  />
                </div>
                
                <div className="form-group">
                  <label>💻 Modalidade</label>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 8 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 'normal', textTransform: 'none' }}>
                      <input type="radio" checked={!isTelehealth} onChange={() => setIsTelehealth(false)} /> Presencial
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 'normal', textTransform: 'none' }}>
                      <input type="radio" checked={isTelehealth} onChange={() => setIsTelehealth(true)} /> Teleconsulta
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label>😊 Estado Emocional do Paciente</label>
                <div className="mood-selector">
                  {emotionOptions.map(mood => (
                    <button
                      key={mood}
                      type="button"
                      className={`mood-option ${selectedMood === mood ? 'selected' : ''}`}
                      onClick={() => setSelectedMood(mood)}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label>🏷️ Tópicos Abordados</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input 
                    type="text"
                    placeholder="Ex: Ansiedade, Autoestima, Relacionamentos..."
                    value={currentTopic}
                    onChange={e => setCurrentTopic(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleAddTopic()}
                    style={{ flex: 1 }}
                  />
                  <button type="button" className="btn-action" onClick={handleAddTopic}>Adicionar</button>
                </div>
                <div className="topics-container">
                  {sessionTopics.map(topic => (
                    <span key={topic} className="topic-tag">
                      {topic}
                      <button onClick={() => handleRemoveTopic(topic)}>×</button>
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label>🛠️ Intervenções Utilizadas</label>
                <select 
                  value={interventionUsed} 
                  onChange={e => setInterventionUsed(e.target.value)}
                >
                  <option value="">Selecione uma intervenção...</option>
                  {therapyInterventions.map(intervention => (
                    <option key={intervention} value={intervention}>{intervention}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>📝 Evolução da Sessão</label>
                <textarea
                  rows={6}
                  value={currentNote}
                  onChange={e => setCurrentNote(e.target.value)}
                  placeholder={`Descreva:
- Queixa principal do paciente
- Progressos observados
- Resistências ou desafios
- Insights importantes
- Aliança terapêutica
- Observações relevantes`}
                  style={{ resize: 'vertical' }}
                />
              </div>
              
              <div className="form-group">
                <label>📋 Encaminhamentos e Próximos Passos</label>
                <textarea
                  rows={3}
                  value={nextSteps}
                  onChange={e => setNextSteps(e.target.value)}
                  placeholder="Tarefas de casa, agendamento, encaminhamentos, etc."
                  style={{ resize: 'vertical' }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24, flexWrap: 'wrap' }}>
                <button 
                  className="btn-secondary" 
                  onClick={() => { setShowNoteModal(false); resetNoteForm(); setEditingNote(null); }} 
                  disabled={isSavingNote}
                >
                  Cancelar
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleSaveClinicalNote} 
                  disabled={isSavingNote}
                >
                  {isSavingNote ? (
                    <>
                      <div style={{ width: 14, height: 14, border: '2px solid rgba(239,187,85,0.3)', borderTopColor: '#EFBB55', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                      Salvando...
                    </>
                  ) : (
                    editingNote ? 'Atualizar Evolução' : 'Salvar Evolução'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* NOTIFICAÇÕES */}
      <div className="dash-notification">
        {notifications.map((notif) => (
          <div key={notif.id} className={`dash-notification-item dash-notification-${notif.type}`}>
            <span>{notif.text}</span>
            <button 
              onClick={() => removeNotification(notif.id)} 
              style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: '4px' }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className={`dash-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={() => setIsMobileMenuOpen(false)} />

      <div className={`dash-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="dash-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: 'rgba(239,187,85,0.15)', border: '1px solid rgba(239,187,85,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#EFBB55" />
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: "'Lora', serif", fontSize: 16, fontWeight: 600, color: 'white', lineHeight: 1 }}>PsicoSync</div>
              <div style={{ fontSize: 9, color: 'rgba(239,187,85,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 3 }}>Consultório Web</div>
            </div>
          </div>
          <button className="dash-mobile-btn" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'white' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EFBB55', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A1008', fontWeight: 600, fontSize: 14 }}>
              {userInitials}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 13, color: 'white', fontWeight: 500 }}>{userName}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{userCrp}</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            style={{ width: '100%', padding: 10, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 6 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Encerrar Sessão
          </button>
        </div>
      </div>

      <div className="dash-main">
        <header className="dash-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button className="dash-mobile-btn" onClick={() => setIsMobileMenuOpen(true)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div>
              <h2 style={{ fontFamily: "'Lora', serif", fontSize: 24, fontWeight: 600, color: '#2D1F0A', margin: 0 }}>
                {activeTab === 'dashboard' ? 'Painel de Controle' : menuCategories.flatMap(c => c.items).find(m => m.id === activeTab)?.label}
              </h2>
              <p style={{ fontSize: 12, color: '#9A7040', marginTop: 4 }}>{currentDate}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5A3E20" strokeWidth="1.8">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {notifications.length > 0 && (
                <span style={{ position: 'absolute', top: -2, right: 0, width: 10, height: 10, background: '#C45A35', borderRadius: '50%', border: '2px solid white' }} />
              )}
            </div>
            
            <button className="btn-primary" onClick={() => handleTabChange('pacientes')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span className="hide-on-mobile">Novo Paciente</span>
            </button>
          </div>
        </header>

        <main className="dash-content">
          {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* KPIs */}
              <div className="dash-kpi-grid">
                <div className="dash-card dash-anim d-1">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="kpi-title">Consultas Hoje</span>
                    <div style={{ color: '#AD6D15', background: '#F5ECD8', padding: 8, borderRadius: '50%' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                  </div>
                  <div className="kpi-value">{todayAppointments}</div>
                </div>
                <div className="dash-card dash-anim d-2">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="kpi-title">Pacientes Ativos</span>
                    <div style={{ color: '#2E9E5B', background: '#E8F4EC', padding: 8, borderRadius: '50%' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                  </div>
                  <div className="kpi-value">{isLoadingData ? '...' : patients.length}</div>
                </div>
                <div className="dash-card dash-anim d-3">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="kpi-title">Faturamento Mensal</span>
                    <div style={{ color: '#5A3E20', background: '#E8D9BE', padding: 8, borderRadius: '50%' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    </div>
                  </div>
                  <div className="kpi-value">R$ {financialData.totalMonth.toLocaleString()}</div>
                </div>
                <div className="dash-card dash-anim d-3">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="kpi-title">Taxa de Recuperação</span>
                    <div style={{ color: '#2E9E5B', background: '#E8F4EC', padding: 8, borderRadius: '50%' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                      </svg>
                    </div>
                  </div>
                  <div className="kpi-value">{recoveryRate}%</div>
                </div>
              </div>

              {/* Próximas Sessões */}
              <div className="dash-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                  <h3 style={{ fontFamily: "'Lora', serif", fontSize: 18, color: '#2D1F0A', margin: 0 }}>Próximas Sessões</h3>
                  <button className="btn-action" onClick={() => handleTabChange('agenda')}>Ver Agenda Completa</button>
                </div>
                {appointments.map((apt, i) => (
                  <div key={i} className="dash-list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #FAF6EE', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: '#2D1F0A', minWidth: 45 }}>{apt.time}</div>
                      <div style={{ width: 3, height: 30, background: apt.type === 'online' ? '#2E9E5B' : '#AD6D15', borderRadius: 2 }} />
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: '#2D1F0A' }}>{apt.patientName}</div>
                        <div style={{ fontSize: 12, color: '#9A7040' }}>{apt.type === 'online' ? 'Teleconsulta' : 'Presencial'}</div>
                      </div>
                    </div>
                    <button className="btn-action" onClick={() => {
                      const p = patients.find(x => x.id === apt.patientId);
                      if (p) {
                        setSelectedPatient(p);
                        resetNoteForm();
                        setEditingNote(null);
                        setShowNoteModal(true);
                      }
                    }}>
                      Registrar Evolução
                    </button>
                  </div>
                ))}
              </div>

              {/* Acesso Rápido */}
              <div className="dash-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                  <h3 style={{ fontFamily: "'Lora', serif", fontSize: 18, color: '#2D1F0A', margin: 0 }}>Pacientes Recentes</h3>
                  <button className="btn-action" onClick={() => handleTabChange('pacientes')}>Ver Todos</button>
                </div>
                {isLoadingData ? (
                  <p>Carregando...</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #FAF6EE', textAlign: 'left', fontSize: 12, color: '#9A7040' }}>
                          <th style={{ padding: '12px 0' }}>Paciente</th>
                          <th style={{ padding: '12px 0' }}>Status</th>
                          <th style={{ padding: '12px 0' }}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patients.slice(0, 5).map(pt => (
                          <tr key={pt.id} style={{ borderBottom: '1px solid #FAF6EE' }}>
                            <td style={{ padding: '12px 0' }}>
                              <div style={{ fontWeight: 600, color: '#2D1F0A' }}>{pt.name}</div>
                              <div style={{ fontSize: 11, color: '#9A7040' }}>{pt.therapyType || 'Terapia'}</div>
                            </td>
                            <td style={{ padding: '12px 0' }}>
                              <span className={`badge badge-${pt.status}`}>
                                {pt.status === 'active' ? 'Ativo' : pt.status === 'waiting' ? 'Aguardando' : 'Inativo'}
                              </span>
                             </td>
                            <td style={{ padding: '12px 0' }}>
                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                <button className="btn-action" style={{ padding: '6px 12px', fontSize: 10 }} onClick={() => { setSelectedPatient(pt); resetNoteForm(); setEditingNote(null); setShowNoteModal(true); }}>
                                  + Evolução
                                </button>
                                <button className="btn-primary" style={{ padding: '6px 12px', fontSize: 10 }} onClick={() => { setSelectedPatient(pt); setShowPatientModal(true); }}>
                                  Prontuário
                                </button>
                              </div>
                             </td>
                           </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'pacientes' && (
            <PatientsTab userId={userId} onSelectPatient={handleSelectAppwritePatient} />
          )}

          {activeTab === 'resumo-fin' && (
            <div className="dash-card">
              <h3 style={{ fontFamily: "'Lora', serif", fontSize: 22, color: '#2D1F0A', marginBottom: 24 }}>Resumo Financeiro</h3>
              <div className="dash-kpi-grid">
                {[
                  { label: 'Faturamento Total', value: `R$ ${financialData.totalMonth.toLocaleString()}`, color: '#2D1F0A' },
                  { label: 'Recebido', value: `R$ ${financialData.received.toLocaleString()}`, color: '#2E9E5B' },
                  { label: 'Pendente', value: `R$ ${financialData.pending.toLocaleString()}`, color: '#C45A35' },
                ].map(item => (
                  <div key={item.label} style={{ padding: 20, background: '#FAF6EE', borderRadius: 12 }}>
                    <div className="kpi-title">{item.label}</div>
                    <div className="kpi-value" style={{ color: item.color }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab !== 'dashboard' && activeTab !== 'pacientes' && activeTab !== 'resumo-fin' && (
            <div className="dash-card" style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ width: 80, height: 80, background: '#FAF6EE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#AD6D15" strokeWidth="1.5">
                  {menuCategories.flatMap(c => c.items).find(m => m.id === activeTab)?.icon}
                </svg>
              </div>
              <h3 style={{ fontFamily: "'Lora', serif", fontSize: 24, color: '#2D1F0A', marginBottom: 12 }}>
                {menuCategories.flatMap(c => c.items).find(m => m.id === activeTab)?.label}
              </h3>
              <p style={{ color: '#9A7040', maxWidth: 400, margin: '0 auto' }}>
                Este módulo está em desenvolvimento e em breve estará disponível.
              </p>
              <button onClick={() => handleTabChange('dashboard')} className="btn-action" style={{ marginTop: 24 }}>
                Voltar ao Painel
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}