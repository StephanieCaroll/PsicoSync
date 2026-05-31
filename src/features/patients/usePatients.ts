import { useState, useEffect, useCallback } from 'react';
import { databases, DATABASE_ID, PATIENTS_COLLECTION_ID } from '@/lib/appwrite';
import { Query, ID } from 'appwrite';

export interface Patient {
  $id: string;
  name: string;
  phone: string;
  email: string;
  cpf: string;
  birthDate: string;
  therapyType: string;
  frequency: string;
  modality: string;
  referredBy: string;
  sessionValue: number;
  insurance: string;
  pendingAmount: number;
  status: 'active' | 'waiting' | 'inactive';
  nextSession: string;
  lastSession: string;
  evolution: string[]; 
  userId: string;
}
export type PatientInput = Omit<Patient, '$id' | 'userId'>;

export function usePatients(userId: string) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await databases.listDocuments(
        DATABASE_ID,
        PATIENTS_COLLECTION_ID,
        [Query.equal('userId', userId), Query.orderDesc('$createdAt')]
      );
      setPatients(res.documents as unknown as Patient[]);
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar pacientes');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const addPatient = async (data: PatientInput): Promise<Patient> => {
    const doc = await databases.createDocument(
      DATABASE_ID,
      PATIENTS_COLLECTION_ID,
      ID.unique(),
      { ...data, userId }
    );
    const newPatient = doc as unknown as Patient;
    setPatients(prev => [newPatient, ...prev]);
    return newPatient;
  };

  const updatePatient = async (id: string, data: Partial<PatientInput>): Promise<Patient> => {
    const doc = await databases.updateDocument(
      DATABASE_ID,
      PATIENTS_COLLECTION_ID,
      id,
      data
    );
    const updated = doc as unknown as Patient;
    setPatients(prev => prev.map(p => p.$id === id ? updated : p));
    return updated;
  };

  const deletePatient = async (id: string): Promise<void> => {
    await databases.deleteDocument(DATABASE_ID, PATIENTS_COLLECTION_ID, id);
    setPatients(prev => prev.filter(p => p.$id !== id));
  };

  return { patients, loading, error, addPatient, updatePatient, deletePatient, refetch: fetchPatients };
}