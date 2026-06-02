import { useState, useEffect, useCallback, useRef } from 'react';
import { databases, account } from '@/lib/appwrite';
import { Query } from 'appwrite';
import type { ClinicalNote } from '@/features/patients/components/EvolutionModal';
import { useEvolutions } from '@/features/patients/useEvolutions';

export interface Patient {
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

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  time: string;
  type: 'online' | 'presencial';
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
}

export interface AppNotification {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

const DB_ID           = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ?? '';
const PATIENTS_COL    = process.env.NEXT_PUBLIC_APPWRITE_PATIENTS_COLLECTION_ID ?? '';
const PSYCHOLOGISTS_COL = process.env.NEXT_PUBLIC_APPWRITE_PSYCHOLOGISTS_COLLECTION_ID
  ?? process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID  
  ?? '';

function buildInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function useDashboard() {
  // ── Dados do psicólogo logado ──
  const [userId,        setUserId]        = useState<string | null>(null);
  const [userName,      setUserName]      = useState('Carregando...');
  const [userInitials,  setUserInitials]  = useState('');
  const [userCrp,       setUserCrp]       = useState('');
  const [userSpecialty, setUserSpecialty] = useState('');

  // ── Pacientes ──
  const [patients,          setPatients]    = useState<Patient[]>([]);
  const [isLoadingPatients, setLoadingPt]   = useState(true);
  const [pendingTotal,      setPendingTotal] = useState(0);

  const evolutions     = useEvolutions();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    async function init() {
      try {
      
        const user = await account.get().catch(() => null);
        if (!user) { setLoadingPt(false); return; }

        setUserId(user.$id);

        if (PSYCHOLOGISTS_COL) {
          try {
            const profileRes = await databases.listDocuments(DB_ID, PSYCHOLOGISTS_COL, [
              Query.equal('userId', user.$id),
              Query.limit(1),
            ]);

            if (profileRes.documents.length > 0) {
              const doc = profileRes.documents[0];
              const name      = (doc.name      as string) || user.name || 'Profissional';
              const crp       = (doc.crp       as string) || '';
              const specialty = (doc.specialty as string) || '';

              setUserName(name);
              setUserInitials(buildInitials(name));
              setUserCrp(crp ? `CRP ${crp}` : 'CRP não informado');
              setUserSpecialty(specialty);
            } else {
            
              const name = user.name || 'Profissional';
              setUserName(name);
              setUserInitials(buildInitials(name));
              setUserCrp('CRP não informado');
            }
          } catch (profileErr) {
            console.warn('Erro ao buscar perfil do psicólogo:', profileErr);
          
            const name = user.name || 'Profissional';
            setUserName(name);
            setUserInitials(buildInitials(name));
          }
        } else {
         
          const name = user.name || 'Profissional';
          setUserName(name);
          setUserInitials(buildInitials(name));
          console.warn(
            'NEXT_PUBLIC_APPWRITE_PSYCHOLOGISTS_COLLECTION_ID não está definido. ' +
            'O CRP e a especialidade não serão exibidos.',
          );
        }

        const res = await databases.listDocuments(DB_ID, PATIENTS_COL, [
          Query.equal('userId', user.$id),
          Query.orderDesc('$createdAt'),
        ]);

        const list: Patient[] = res.documents.map(doc => ({
          id:            doc.$id,
          name:          doc.name          ?? 'Sem Nome',
          phone:         doc.phone         ?? '',
          email:         doc.email         ?? '',
          status:        doc.status        ?? 'active',
          nextSession:   doc.nextSession   ?? '',
          pendingAmount: doc.pendingAmount ?? 0,
          lastSession:   doc.lastSession   ?? '',
          therapyType:   doc.therapyType   ?? '',
        }));

        setPatients(list);

        const pending = list.reduce((acc, p) => acc + (p.pendingAmount ?? 0), 0);
        setPendingTotal(pending);

        const pMap: Record<string, string> = {};
        list.forEach(p => { pMap[p.id] = p.name; });
        await evolutions.fetchAll(pMap);
      } catch (err) {
        console.error('Erro na inicialização do dashboard:', err);
      } finally {
        setLoadingPt(false);
      }
    }

    init();
   
  }, []);

  // ── UI / Modal / Notificações ──
  const [activeTab,       setActiveTab]       = useState('dashboard');
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications,   setNotifications]   = useState<AppNotification[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showNoteModal,    setShowNoteModal]    = useState(false);
  const [editingNote,      setEditingNote]      = useState<ClinicalNote | null>(null);

  const addNotification = useCallback((text: string, type: AppNotification['type'] = 'success') => {
    const id = `${Date.now()}`;
    setNotifications(prev => [...prev, { id, text, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 6000);
  }, []);

  return {
    // Perfil
    userId,
    userName,
    userInitials,
    userCrp,
    userSpecialty,

    // Pacientes
    patients,
    isLoadingPatients,
    pendingTotal,

    // Evoluções
    notes:            evolutions.notes,
    notesForPatient:  evolutions.notesForPatient,
    notesLoading:     evolutions.loading,

    // UI
    activeTab, setActiveTab,
    isMobileMenuOpen, setMobileMenuOpen,

    // Modais
    selectedPatient,
    showPatientModal, setShowPatientModal,
    showNoteModal,    setShowNoteModal,
    editingNote,

    openPatientModal: (p: Patient) => {
      setSelectedPatient(p);
      setShowPatientModal(true);
    },
    openNewNoteModal: (p: Patient) => {
      setSelectedPatient(p);
      setEditingNote(null);
      setShowPatientModal(false);
      setShowNoteModal(true);
    },
    openEditNoteModal: (note: ClinicalNote) => {
      const p = patients.find(x => x.id === note.patientId) ?? null;
      setSelectedPatient(p);
      setEditingNote(note);
      setShowPatientModal(false);
      setShowNoteModal(true);
    },
    closeModals: () => {
      setShowNoteModal(false);
      setShowPatientModal(false);
      setEditingNote(null);
    },

    handleSaveNote: async (note: any) => {
      if (!selectedPatient) return;
      try {
        if (note.id) {
          await evolutions.updateNote(note, selectedPatient.name);
        } else {
          await evolutions.createNote(note, selectedPatient.name);
        }
        addNotification('Evolução salva com sucesso!', 'success');
      } catch (err) {
        console.error('Erro ao salvar evolução:', err);
        addNotification('Erro ao salvar a evolução.', 'error');
      }
    },
    handleDeleteNote: async (id: string) => {
      await evolutions.deleteNote(id);
      addNotification('Evolução excluída com sucesso!', 'success');
    },

    // Notificações
    notifications,
    addNotification,
    removeNotification: (id: string) =>
      setNotifications(prev => prev.filter(n => n.id !== id)),

    // Derivados
    activePatients:    patients.filter(p => p.status === 'active').length,
    todayAppointments: 0,
    appointments:      [] as Appointment[],
    currentDate:       new Date().toLocaleDateString('pt-BR', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    }),
  };
}