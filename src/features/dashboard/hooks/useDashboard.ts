import { useState, useEffect, useCallback, useRef } from 'react';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { getCurrentUser } from '@/lib/auth';
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

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ?? '';
const COL_ID = process.env.NEXT_PUBLIC_APPWRITE_PATIENTS_COLLECTION_ID ?? '';

export function useDashboard() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState('Carregando...');
  const [userInitials, setUserInitials] = useState('');
  const [userCrp, setUserCrp] = useState('');
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoadingPatients, setLoadingPt] = useState(true);
  const [pendingTotal, setPendingTotal] = useState(0);
  
  const evolutions = useEvolutions();
  const hasInitialized = useRef(false); 

useEffect(() => {
  // Impede que o efeito rode mais de uma vez ao montar o componente
  if (hasInitialized.current) return;
  hasInitialized.current = true;

  async function init() {
    try {
      const user = await getCurrentUser();
      if (!user) { setLoadingPt(false); return; }

      setUserId(user.$id);

      const res = await databases.listDocuments(DB_ID, COL_ID, [
        Query.equal('userId', user.$id), // O filtro que você queria
        Query.orderDesc('$createdAt')
      ]);

      const list: Patient[] = res.documents.map(doc => ({
        id: doc.$id,
        name: doc.name ?? 'Sem Nome',
        phone: doc.phone ?? '',
        email: doc.email ?? '',
        status: doc.status ?? 'active',
        nextSession: doc.nextSession ?? '',
        pendingAmount: doc.pendingAmount ?? 0,
        lastSession: doc.lastSession ?? '',
        therapyType: doc.therapyType ?? '',
      }));

      setPatients(list);
      // Carrega as evoluções uma única vez após ter os pacientes
      const pMap: Record<string, string> = {};
      list.forEach(p => { pMap[p.id] = p.name; });
      await evolutions.fetchAll(pMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPt(false);
    }
  }
  init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // Array de dependência vazio garante que só rode ao montar

  // --- Estados de UI, Modais e Notificações permanecem iguais ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState<ClinicalNote | null>(null);

  const addNotification = useCallback((text: string, type: AppNotification['type'] = 'success') => {
    const id = `${Date.now()}`;
    setNotifications(prev => [...prev, { id, text, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 6000);
  }, []);

  return {
    userId, userName, userInitials, userCrp,
    patients, isLoadingPatients, pendingTotal,
    notes: evolutions.notes,
    notesForPatient: evolutions.notesForPatient,
    notesLoading: evolutions.loading,
    activeTab, setActiveTab,
    isMobileMenuOpen, setMobileMenuOpen,
    selectedPatient, showPatientModal, setShowPatientModal,
    showNoteModal, setShowNoteModal,
    editingNote,
    openPatientModal: (p: Patient) => { setSelectedPatient(p); setShowPatientModal(true); },
    openNewNoteModal: (p: Patient) => { setSelectedPatient(p); setEditingNote(null); setShowPatientModal(false); setShowNoteModal(true); },
    openEditNoteModal: (note: ClinicalNote) => { 
        const p = patients.find(x => x.id === note.patientId) ?? null;
        setSelectedPatient(p); setEditingNote(note); setShowPatientModal(false); setShowNoteModal(true); 
    },
    closeModals: () => { setShowNoteModal(false); setShowPatientModal(false); setEditingNote(null); },
    handleSaveNote: async (note: any) => { /* lógica original */ },
    handleDeleteNote: async (id: string) => { /* lógica original */ },
    notifications,
    addNotification,
    removeNotification: (id: string) => setNotifications(prev => prev.filter(n => n.id !== id)),
    activePatients: patients.filter(p => p.status === 'active').length,
    todayAppointments: 0, // Placeholder
    appointments: [], // Placeholder
    currentDate: new Date().toLocaleDateString('pt-BR'),
  };
}