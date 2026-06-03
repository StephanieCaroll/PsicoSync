
'use client';

import { useState, useEffect, useCallback } from 'react';
import { ID, Query } from 'appwrite';
import { databases, DATABASE_ID } from '@/lib/appwrite';

export const SESSIONS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_SESSIONS_COLLECTION_ID || '';

export type SessionStatus =
  | 'confirmada'
  | 'realizada'
  | 'faltou'
  | 'desmarcada'
  | 'aguardando';

export type SessionType = 'presencial' | 'online';

export type RecurrenceType = 'none' | 'weekly' | 'biweekly' | 'monthly';

export interface Session {
  $id: string;
  userId: string;
  patientId: string;
  patientName: string;
  date: string;          
  startTime: string;    
  endTime: string;       
  status: SessionStatus;
  type: SessionType;
  notes?: string;
  isRecurring: boolean;
  recurrenceType: RecurrenceType;
  recurrenceDays?: string;  
  recurrenceEndDate?: string;
  recurrenceGroupId?: string;
}

export interface SessionInput {
  patientId: string;
  patientName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: SessionStatus;
  type: SessionType;
  notes?: string;
  isRecurring: boolean;
  recurrenceType: RecurrenceType;
  recurrenceDays?: number[];
  recurrenceEndDate?: string;
}

function addWeeks(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n * 7);
  return d.toISOString().slice(0, 10);
}

function addMonths(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  d.setUTCMonth(d.getUTCMonth() + n);
  return d.toISOString().slice(0, 10);
}

function generateRecurringDates(input: SessionInput): string[] {
  const dates: string[] = [input.date];
  if (!input.isRecurring || input.recurrenceType === 'none') return dates;

  const endDate = input.recurrenceEndDate
    ? new Date(input.recurrenceEndDate + 'T12:00:00Z')
    : (() => { const d = new Date(input.date + 'T12:00:00Z'); d.setUTCMonth(d.getUTCMonth() + 3); return d; })();

  let current = input.date;
  let safety = 0;

  while (safety < 200) {
    safety++;
    let next = '';
    if (input.recurrenceType === 'weekly')   next = addWeeks(current, 1);
    if (input.recurrenceType === 'biweekly') next = addWeeks(current, 2);
    if (input.recurrenceType === 'monthly')  next = addMonths(current, 1);
    if (!next) break;
    if (new Date(next + 'T12:00:00Z') > endDate) break;
    dates.push(next);
    current = next;
  }

  return dates;
}

export function useAgenda(userId: string) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    if (!userId || !SESSIONS_COLLECTION_ID) {
      setSessions([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await databases.listDocuments(
        DATABASE_ID,
        SESSIONS_COLLECTION_ID,
        [Query.equal('userId', userId), Query.limit(500), Query.orderAsc('date')],
      );
      
      const parsed = res.documents.map(d => ({
        ...d,
        isRecurring: d.isRecurring === true || d.isRecurring === 'true'
      })) as unknown as Session[];
      setSessions(parsed);
    } catch (err: any) {
      setError(err.message ?? 'Erro ao carregar sessões');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  const addSession = useCallback(
    async (input: SessionInput) => {
      if (!userId || !SESSIONS_COLLECTION_ID) return;

      const dates  = generateRecurringDates(input);
      const groupId = input.isRecurring ? ID.unique() : undefined;

      const created: Session[] = [];
      for (const date of dates) {
        const doc = await databases.createDocument(
          DATABASE_ID,
          SESSIONS_COLLECTION_ID,
          ID.unique(),
          {
            userId,
            patientId:         input.patientId,
            patientName:       input.patientName,
            date,
            startTime:         input.startTime,
            endTime:           input.endTime,
            status:            input.status,
            type:              input.type,
            notes:             input.notes ?? '',
            isRecurring:       input.isRecurring ? 'true' : 'false',
            recurrenceType:    input.recurrenceType,
            recurrenceDays:    input.recurrenceDays
              ? JSON.stringify(input.recurrenceDays)
              : '',
            recurrenceEndDate: input.recurrenceEndDate ?? '',
            recurrenceGroupId: groupId ?? '',
          },
        );
        
        created.push({
          ...doc,
          isRecurring: input.isRecurring
        } as unknown as Session);
      }

      setSessions(prev => [...prev, ...created].sort((a, b) =>
        a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime),
      ));
      return created[0];
    },
    [userId],
  );

  const updateSession = useCallback(
    async (id: string, data: Partial<SessionInput>) => {
      if (!SESSIONS_COLLECTION_ID) return;
      const payload: Record<string, unknown> = { ...data };
      if (data.recurrenceDays) payload.recurrenceDays = JSON.stringify(data.recurrenceDays);
      if (typeof data.isRecurring === 'boolean') {
        payload.isRecurring = data.isRecurring ? 'true' : 'false';
      }

      const doc = await databases.updateDocument(
        DATABASE_ID, SESSIONS_COLLECTION_ID, id, payload,
      );
      setSessions(prev =>
        prev.map(s => s.$id === id ? { 
          ...s, 
          ...(doc as unknown as Session),
          isRecurring: doc.isRecurring === true || doc.isRecurring === 'true'
        } : s),
      );
    },
    [],
  );

  const updateStatus = useCallback(
    async (id: string, status: SessionStatus) => updateSession(id, { status } as any),
    [updateSession],
  );

  const deleteSession = useCallback(
    async (id: string) => {
      if (!SESSIONS_COLLECTION_ID) return;
      await databases.deleteDocument(DATABASE_ID, SESSIONS_COLLECTION_ID, id);
      setSessions(prev => prev.filter(s => s.$id !== id));
    },
    [],
  );

  const deleteRecurringGroup = useCallback(
    async (groupId: string) => {
      const toDelete = sessions.filter(s => s.recurrenceGroupId === groupId);
      for (const s of toDelete) {
        await databases.deleteDocument(DATABASE_ID, SESSIONS_COLLECTION_ID, s.$id);
      }
      setSessions(prev => prev.filter(s => s.recurrenceGroupId !== groupId));
    },
    [sessions],
  );

  const sessionsForDate = useCallback(
    (date: string) =>
      sessions
        .filter(s => s.date === date)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [sessions],
  );

  const sessionsInRange = useCallback(
    (from: string, to: string) =>
      sessions
        .filter(s => s.date >= from && s.date <= to)
        .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)),
    [sessions],
  );

  return {
    sessions,
    loading,
    error,
    reload: loadSessions,
    addSession,
    updateSession,
    updateStatus,
    deleteSession,
    deleteRecurringGroup,
    sessionsForDate,
    sessionsInRange,
  };
}