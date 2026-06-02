import { useState, useCallback } from 'react';
import { databases } from '@/lib/appwrite';
import { Query, ID } from 'appwrite';
import type { ClinicalNote } from '@/features/patients/components/EvolutionModal';

/**
 * Appwrite Collection IDs

 * Collection attributes (all required):
 * patientId       → string (index: key)
 * date            → string  (ISO date "YYYY-MM-DD")
 * content         → string  (longtext)
 * mood            → string
 * topics          → string[]  (array)
 * intervention    → string
 * nextSteps       → string
 * sessionNumber   → integer
 * duration        → integer  (minutes)
 * isTelehealth    → boolean

 */

const DB_ID  = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ?? '';
const COL_ID = process.env.NEXT_PUBLIC_APPWRITE_EVOLUTIONS_COLLECTION_ID ?? '';

export type RawNote = Omit<ClinicalNote, 'patientName' | 'status'> & { id?: string };

function docToNote(doc: any, patientName: string): ClinicalNote {
  return {
    id:            doc.$id,
    patientId:     doc.patientId,
    patientName,
    date:          doc.date,
    content:       doc.content,
    mood:          doc.mood,
    topics:        doc.topics ?? [],
    intervention:  doc.intervention ?? '',
    nextSteps:     doc.nextSteps ?? '',
    sessionNumber: doc.sessionNumber ?? undefined,
    duration:      doc.duration ?? undefined,
    isTelehealth:  doc.isTelehealth ?? false,
    status:        'completed',
  };
}

export function useEvolutions() {
  const [notes, setNotes]       = useState<ClinicalNote[]>([]);
  const [loading, setLoading]   = useState(false);

  const fetchForPatient = useCallback(async (patientId: string, patientName: string) => {
    if (!DB_ID || !COL_ID) return;
    setLoading(true);
    try {
      const res = await databases.listDocuments(DB_ID, COL_ID, [
        Query.equal('patientId', patientId),
        Query.orderDesc('date'),
        Query.limit(200),
      ]);
      const fetched = res.documents.map(doc => docToNote(doc, patientName));
      setNotes(fetched);
    } catch (err) {
      console.error('useEvolutions.fetchForPatient:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAll = useCallback(async (
    patientMap: Record<string, string>  // { [patientId]: patientName }
  ) => {
    if (!DB_ID || !COL_ID) return;
    setLoading(true);
    try {
      const res = await databases.listDocuments(DB_ID, COL_ID, [
        Query.orderDesc('date'),
        Query.limit(500),
      ]);
      const fetched = res.documents.map(doc =>
        docToNote(doc, patientMap[doc.patientId] ?? 'Paciente')
      );
      setNotes(fetched);
    } catch (err) {
      console.error('useEvolutions.fetchAll:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── Create ── */
  const createNote = useCallback(async (
    raw: RawNote,
    patientName: string,
  ): Promise<ClinicalNote | null> => {
    if (!DB_ID || !COL_ID) return null;
    try {
      const { id, ...rest } = raw;
      const doc = await databases.createDocument(DB_ID, COL_ID, ID.unique(), {
        patientId:     rest.patientId,
        date:          rest.date,
        content:       rest.content,
        mood:          rest.mood ?? 'Estável',
        topics:        rest.topics ?? [],
        intervention:  rest.intervention ?? '',
        nextSteps:     rest.nextSteps ?? '',
        sessionNumber: rest.sessionNumber ?? 1,
        duration:      rest.duration ?? 50,
        isTelehealth:  rest.isTelehealth ?? false,
      });
      const newNote = docToNote(doc, patientName);
      setNotes(prev => [newNote, ...prev]);
      return newNote;
    } catch (err) {
      console.error('useEvolutions.createNote:', err);
      return null;
    }
  }, []);

  /* ── Update ── */
  const updateNote = useCallback(async (
    raw: RawNote,
    patientName: string,
  ): Promise<ClinicalNote | null> => {
    if (!DB_ID || !COL_ID || !raw.id) return null;
    try {
      // Isola os campos, evitando enviar o id como atributo para atualizar
      const { id, patientId, ...fieldsToUpdate } = raw;
      const doc = await databases.updateDocument(DB_ID, COL_ID, raw.id, {
        date:          fieldsToUpdate.date,
        content:       fieldsToUpdate.content,
        mood:          fieldsToUpdate.mood ?? 'Estável',
        topics:        fieldsToUpdate.topics ?? [],
        intervention:  fieldsToUpdate.intervention ?? '',
        nextSteps:     fieldsToUpdate.nextSteps ?? '',
        sessionNumber: fieldsToUpdate.sessionNumber ?? 1,
        duration:      fieldsToUpdate.duration ?? 50,
        isTelehealth:  fieldsToUpdate.isTelehealth ?? false,
      });
      const updated = docToNote(doc, patientName);
      setNotes(prev => prev.map(n => n.id === raw.id ? updated : n));
      return updated;
    } catch (err) {
      console.error('useEvolutions.updateNote:', err);
      return null;
    }
  }, []);

  /* ── Delete ── */
  const deleteNote = useCallback(async (noteId: string): Promise<boolean> => {
    if (!DB_ID || !COL_ID) return false;
    try {
      await databases.deleteDocument(DB_ID, COL_ID, noteId);
      setNotes(prev => prev.filter(n => n.id !== noteId));
      return true;
    } catch (err) {
      console.error('useEvolutions.deleteNote:', err);
      return false;
    }
  }, []);

  /* ── Derived ── */
  const notesForPatient = useCallback(
    (patientId: string) => notes.filter(n => n.patientId === patientId),
    [notes]
  );

  return {
    notes,
    loading,
    fetchForPatient,
    fetchAll,
    createNote,
    updateNote,
    deleteNote,
    notesForPatient,
  };
}