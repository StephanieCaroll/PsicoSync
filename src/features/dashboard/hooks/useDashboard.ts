import { useState, useEffect, useCallback } from 'react';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { getCurrentUser } from '@/lib/auth';
import type { ClinicalNote } from '@/features/patients/components/EvolutionModal';
import { useEvolutions } from '@/features/patients/useEvolutions';

/* ── Local types ── */
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
  evolution?: string[];
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  time: string;
  type: 'online' | 'presencial';
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  notes?: string;
}

export interface AppNotification {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

const DB_ID  = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ?? '';
const COL_ID = process.env.NEXT_PUBLIC_APPWRITE_PATIENTS_COLLECTION_ID ?? '';

/* ── Static appointments (replace with Appwrite when you add that collection) ── */
const STATIC_APPOINTMENTS: Appointment[] = [
  { id: '1', patientId: '1', patientName: 'Mariana Costa',        time: '09:00', type: 'online',     status: 'confirmed' },
  { id: '2', patientId: '2', patientName: 'Carlos Eduardo Silva', time: '10:30', type: 'presencial', status: 'confirmed' },
  { id: '3', patientId: '3', patientName: 'Beatriz Almeida',      time: '14:00', type: 'online',     status: 'confirmed' },
  { id: '4', patientId: '4', patientName: 'Rafael Souza',         time: '16:00', type: 'presencial', status: 'pending'   },
];

export function useDashboard() {
  /* ── User ── */
  const [userName, setUserName]       = useState('Carregando...');
  const [userInitials, setUserInitials] = useState('');
  const [userCrp, setUserCrp]         = useState('');

  /* ── Data ── */
  const [patients, setPatients]           = useState<Patient[]>([]);
  const [appointments]                    = useState<Appointment[]>(STATIC_APPOINTMENTS);
  const [isLoadingPatients, setLoadingPt] = useState(true);

  /* ── Evolutions hook ── */
  const evolutions = useEvolutions();

  /* ── Financial (derived from patients) ── */
  const [pendingTotal, setPendingTotal] = useState(0);

  /* ── Notifications ── */
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  /* ── UI state ── */
  const [activeTab, setActiveTab]               = useState('dashboard');
  const [isMobileMenuOpen, setMobileMenuOpen]   = useState(false);
  const [currentDate, setCurrentDate]           = useState('');

  /* ── Modal state ── */
  const [selectedPatient, setSelectedPatient]   = useState<Patient | null>(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showNoteModal, setShowNoteModal]       = useState(false);
  const [editingNote, setEditingNote]           = useState<ClinicalNote | null>(null);

  /* ── Init ── */
  useEffect(() => {
    const opts: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const d = new Date().toLocaleDateString('pt-BR', opts);
    setCurrentDate(d.charAt(0).toUpperCase() + d.slice(1));

    (async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setUserName(user.name);
          const parts = user.name.trim().split(' ');
          const initials = parts.length > 1
            ? `${parts[0][0]}${parts[parts.length - 1][0]}`
            : parts[0].substring(0, 2);
          setUserInitials(initials.toUpperCase());
          const u = user as any;
          setUserCrp(u.crp || u.prefs?.crp || 'Psicólogo(a) CRP 00/00000');
        }
      } catch {
        setUserName('Usuário');
        setUserInitials('US');
        setUserCrp('Profissional de Saúde');
      }
    })();
  }, []);

  /* ── Fetch patients ── */
  useEffect(() => {
    if (!DB_ID || !COL_ID) { setLoadingPt(false); return; }
    (async () => {
      setLoadingPt(true);
      try {
        const res = await databases.listDocuments(DB_ID, COL_ID, [
          Query.orderDesc('$createdAt'),
          Query.limit(200),
        ]);
        const list: Patient[] = res.documents.map(doc => ({
          id:            doc.$id,
          name:          doc.name ?? 'Sem Nome',
          phone:         doc.phone ?? '',
          email:         doc.email ?? '',
          status:        doc.status ?? 'active',
          nextSession:   doc.nextSession ?? '',
          pendingAmount: doc.pendingAmount ?? 0,
          lastSession:   doc.lastSession ?? '',
          therapyType:   doc.therapyType ?? '',
        }));
        setPatients(list);

        const pending = list.reduce((acc, p) => acc + (Number(p.pendingAmount) || 0), 0);
        setPendingTotal(pending);

        /* Build patientMap and fetch all evolutions */
        const pMap: Record<string, string> = {};
        list.forEach(p => { pMap[p.id] = p.name; });
        await evolutions.fetchAll(pMap);
      } catch (err) {
        console.error('useDashboard: fetch patients:', err);
      } finally {
        setLoadingPt(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [DB_ID, COL_ID]);

  /* ── Notifications ── */
  const addNotification = useCallback((text: string, type: AppNotification['type'] = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setNotifications(prev => [...prev, { id, text, type }]);
    setTimeout(() => removeNotification(id), 6000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  /* ── Modal helpers ── */
  const openPatientModal = useCallback((p: Patient) => {
    setSelectedPatient(p);
    setShowPatientModal(true);
  }, []);

  const openNewNoteModal = useCallback((p: Patient) => {
    setSelectedPatient(p);
    setEditingNote(null);
    setShowPatientModal(false);
    setShowNoteModal(true);
  }, []);

  const openEditNoteModal = useCallback((note: ClinicalNote) => {
    const p = patients.find(x => x.id === note.patientId) ?? null;
    setSelectedPatient(p);
    setEditingNote(note);
    setShowPatientModal(false);
    setShowNoteModal(true);
  }, [patients]);

  const closeModals = useCallback(() => {
    setShowNoteModal(false);
    setShowPatientModal(false);
    setEditingNote(null);
  }, []);

  /* ── Save evolution ── */
  const handleSaveNote = useCallback(async (
    raw: Omit<ClinicalNote, 'patientName' | 'status'>
  ) => {
    if (!selectedPatient) return;
    const name = selectedPatient.name;

    let result: ClinicalNote | null;
    if (editingNote) {
      result = await evolutions.updateNote(raw, name);
      if (result) addNotification(`Evolução de ${name} atualizada!`, 'success');
      else        addNotification('Erro ao atualizar evolução.', 'error');
    } else {
      result = await evolutions.createNote(raw, name);
      if (result) addNotification(`Evolução de ${name} salva!`, 'success');
      else        addNotification('Erro ao salvar evolução.', 'error');
    }

    setShowNoteModal(false);
    setEditingNote(null);
    if (result) setShowPatientModal(true);
  }, [selectedPatient, editingNote, evolutions, addNotification]);

  /* ── Delete evolution ── */
  const handleDeleteNote = useCallback(async (noteId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta evolução?')) return;
    const ok = await evolutions.deleteNote(noteId);
    if (ok)  addNotification('Evolução excluída.', 'info');
    else     addNotification('Erro ao excluir evolução.', 'error');
  }, [evolutions, addNotification]);

  /* ── Derived KPIs ── */
  const activePatients   = patients.filter(p => p.status === 'active').length;
  const todayAppointments = appointments.filter(a => a.status === 'confirmed').length;

  return {
    /* user */
    userName, userInitials, userCrp,
    /* data */
    patients, appointments, pendingTotal,
    isLoadingPatients,
    notes: evolutions.notes,
    notesForPatient: evolutions.notesForPatient,
    notesLoading: evolutions.loading,
    /* ui */
    activeTab, setActiveTab,
    isMobileMenuOpen, setMobileMenuOpen,
    currentDate,
    /* modals */
    selectedPatient,
    showPatientModal, setShowPatientModal,
    showNoteModal, setShowNoteModal,
    editingNote,
    openPatientModal,
    openNewNoteModal,
    openEditNoteModal,
    closeModals,
    handleSaveNote,
    handleDeleteNote,
    /* notifications */
    notifications,
    addNotification,
    removeNotification,
    /* kpis */
    activePatients,
    todayAppointments,
  };
}