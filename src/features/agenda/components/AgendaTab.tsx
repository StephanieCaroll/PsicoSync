'use client';

import React, { useState, useMemo, useCallback } from 'react';
import SessionModal from './SessionModal';
import { useAgenda, Session, SessionStatus, SessionType, RecurrenceType } from '../hooks/useAgenda';
import styles from './AgendaTab.module.css';

interface Patient {
  id: string;
  name: string;
  therapyType?: string;
}

interface Appointment {
  id: string;
  patientId: string;
  patientName?: string;
  time: string;
  date?: string;
  type?: string;
}

interface AgendaTabProps {
  userId: string;
  patients: Patient[];
  appointments?: Appointment[];
}

const WEEK_DAYS  = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const WEEK_FULL  = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
const MONTHS_PT  = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const HOURS      = Array.from({ length: 14 }, (_, i) => i + 7); // 07:00 – 20:00

const STATUS_CONFIG: Record<SessionStatus, { label: string; color: string; bg: string; border: string }> = {
  confirmada: { label: 'Confirmada',  color: '#2E9E5B', bg: '#E8F4EC', border: '#A8D8B9' },
  aguardando: { label: 'Aguardando',  color: '#AD6D15', bg: '#FDF5E6', border: '#D9C49A' },
  realizada:  { label: 'Realizada',   color: '#5A7ABF', bg: '#EEF2FA', border: '#A8BCE8' },
  faltou:     { label: 'Faltou',      color: '#C45A35', bg: '#FEF0EC', border: '#F0C0A8' },
  desmarcada: { label: 'Desmarcada',  color: '#9A7040', bg: '#F5ECD8', border: '#D9C49A' },
};

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

function getWeekStart(d: Date) {
  const day = new Date(d);
  day.setDate(d.getDate() - d.getDay()); 
  return day;
}

function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
}

function getMonthDays(year: number, month: number): (Date | null)[] {
  const first  = new Date(year, month, 1);
  const last   = new Date(year, month + 1, 0);
  const prefix = Array.from({ length: first.getDay() }, () => null);
  const days   = Array.from({ length: last.getDate() }, (_, i) => new Date(year, month, i + 1));
  return [...prefix, ...days];
}

function fmtDate(d: Date) {
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function SessionCard({
  session,
  compact = false,
  onClick,
  onStatusChange,
}: {
  session: Session;
  compact?: boolean;
  onClick: () => void;
  onStatusChange: (id: string, status: SessionStatus) => void;
}) {
  const cfg = STATUS_CONFIG[session.status];
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className={styles.sessionCard}
      style={{ background: cfg.bg, borderLeft: `3px solid ${cfg.color}`, borderRadius: 8 }}
      onClick={e => { e.stopPropagation(); onClick(); }}
    >
      <div className={styles.sessionCardInner}>
        <div className={styles.sessionCardTime} style={{ color: cfg.color }}>
          {session.startTime}
          {!compact && session.endTime ? ` – ${session.endTime}` : ''}
        </div>
        <div className={styles.sessionCardName} title={session.patientName}>
          {session.patientName}
        </div>
        {!compact && (
          <div className={styles.sessionCardType}>
            {session.type === 'online' ? '🖥' : '🏥'} {session.type === 'online' ? 'Online' : 'Presencial'}
            {session.isRecurring && ' · 🔁'}
          </div>
        )}
        <div
          className={styles.sessionCardStatus}
          style={{ color: cfg.color, background: `${cfg.color}18`, border: `1px solid ${cfg.border}` }}
          onClick={e => { e.stopPropagation(); setShowMenu(v => !v); }}
        >
          {cfg.label}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {showMenu && (
        <div className={styles.statusMenu} onClick={e => e.stopPropagation()}>
          {(Object.entries(STATUS_CONFIG) as [SessionStatus, typeof STATUS_CONFIG[SessionStatus]][]).map(([key, val]) => (
            <button
              key={key}
              className={styles.statusMenuItem}
              style={{ color: val.color }}
              onClick={() => { onStatusChange(session.$id, key); setShowMenu(false); }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: val.color, display: 'inline-block' }} />
              {val.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function WeekView({
  weekDays,
  sessionsInRange,
  today,
  onSlotClick,
  onSessionClick,
  onStatusChange,
}: {
  weekDays: Date[];
  sessionsInRange: Session[];
  today: string;
  onSlotClick: (date: string, time: string) => void;
  onSessionClick: (session: Session) => void;
  onStatusChange: (id: string, status: SessionStatus) => void;
}) {
  const byDateHour: Record<string, Session[]> = {};
  sessionsInRange.forEach(s => {
    const h = parseInt(s.startTime.split(':')[0], 10);
    const key = `${s.date}-${h}`;
    if (!byDateHour[key]) byDateHour[key] = [];
    byDateHour[key].push(s);
  });

  return (
    <div className={styles.weekGrid}>
      <div className={styles.weekHeader}>
        <div className={styles.weekTimeGutter} />
        {weekDays.map((d, i) => {
          const ds     = toDateStr(d);
          const isToday = ds === today;
          return (
            <div key={i} className={`${styles.weekDayHeader} ${isToday ? styles.weekDayHeaderToday : ''}`}>
              <span className={styles.weekDayName}>{WEEK_DAYS[d.getDay()]}</span>
              <span className={`${styles.weekDayNum} ${isToday ? styles.weekDayNumToday : ''}`}>
                {d.getDate()}
              </span>
            </div>
          );
        })}
      </div>

      <div className={styles.weekBody}>
        {HOURS.map(h => (
          <div key={h} className={styles.weekRow}>
            <div className={styles.weekTimeLabel}>
              {String(h).padStart(2, '0')}:00
            </div>
            {weekDays.map((d, di) => {
              const ds   = toDateStr(d);
              const key  = `${ds}-${h}`;
              const sess = byDateHour[key] ?? [];
              const isToday = ds === today;
              return (
                <div
                  key={di}
                  className={`${styles.weekCell} ${isToday ? styles.weekCellToday : ''}`}
                  onClick={() => onSlotClick(ds, `${String(h).padStart(2, '0')}:00`)}
                >
                  {sess.map(s => (
                    <SessionCard
                      key={s.$id}
                      session={s}
                      compact={sess.length > 1}
                      onClick={() => onSessionClick(s)}
                      onStatusChange={onStatusChange}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthView({
  year,
  month,
  sessions,
  today,
  onDayClick,
  onSessionClick,
  onStatusChange,
}: {
  year: number;
  month: number;
  sessions: Session[];
  today: string;
  onDayClick: (date: string) => void;
  onSessionClick: (session: Session) => void;
  onStatusChange: (id: string, status: SessionStatus) => void;
}) {
  const cells = getMonthDays(year, month);

  const byDate: Record<string, Session[]> = {};
  sessions.forEach(s => {
    if (!byDate[s.date]) byDate[s.date] = [];
    byDate[s.date].push(s);
  });

  return (
    <div className={styles.monthGrid}>
      {WEEK_DAYS.map(d => (
        <div key={d} className={styles.monthDayName}>{d}</div>
      ))}

      {cells.map((d, i) => {
        if (!d) return <div key={`empty-${i}`} className={styles.monthCellEmpty} />;
        const ds      = toDateStr(d);
        const isToday = ds === today;
        const sess    = byDate[ds] ?? [];
        const MAX     = 3;
        return (
          <div
            key={ds}
            className={`${styles.monthCell} ${isToday ? styles.monthCellToday : ''}`}
            onClick={() => onDayClick(ds)}
          >
            <div className={`${styles.monthDayNum} ${isToday ? styles.monthDayNumToday : ''}`}>
              {d.getDate()}
            </div>
            <div className={styles.monthSessions}>
              {sess.slice(0, MAX).map(s => {
                const cfg = STATUS_CONFIG[s.status];
                return (
                  <div
                    key={s.$id}
                    className={styles.monthSessionDot}
                    style={{ background: cfg.bg, borderLeft: `3px solid ${cfg.color}`, color: cfg.color }}
                    onClick={e => { e.stopPropagation(); onSessionClick(s); }}
                    title={`${s.startTime} ${s.patientName}`}
                  >
                    <span className={styles.monthSessionTime}>{s.startTime}</span>
                    <span className={styles.monthSessionName}>{s.patientName}</span>
                  </div>
                );
              })}
              {sess.length > MAX && (
                <div className={styles.monthSessionMore}>+{sess.length - MAX} mais</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ListView({
  sessions,
  onSessionClick,
  onStatusChange,
  onNewSession,
}: {
  sessions: Session[];
  onSessionClick: (s: Session) => void;
  onStatusChange: (id: string, status: SessionStatus) => void;
  onNewSession: () => void;
}) {
  const grouped: Record<string, Session[]> = {};
  sessions.forEach(s => {
    if (!grouped[s.date]) grouped[s.date] = [];
    grouped[s.date].push(s);
  });
  const sortedDates = Object.keys(grouped).sort();

  if (sortedDates.length === 0) {
    return (
      <div className={styles.emptyState}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D9C49A" strokeWidth="1.2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <p style={{ fontFamily: 'Lora, serif', fontSize: 16, color: '#5A3E20', fontWeight: 600 }}>Nenhuma sessão neste período</p>
        <p style={{ fontSize: 13, color: '#9A7040' }}>Clique em "+ Nova Sessão" para agendar.</p>
        <button onClick={onNewSession} style={btnPrimary}>+ Nova Sessão</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {sortedDates.map(date => {
        const d = new Date(date + 'T12:00:00Z');
        const weekday = WEEK_FULL[d.getUTCDay()];
        const dateFormatted = d.toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: 'long', year: 'numeric' });
        return (
          <div key={date}>
            <div className={styles.listDateHeader}>
              <span className={styles.listWeekday}>{weekday}</span>
              <span className={styles.listDate}>{dateFormatted}</span>
              <div className={styles.listDateLine} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {grouped[date].map(s => {
                const cfg = STATUS_CONFIG[s.status] || STATUS_CONFIG['confirmada'];
                return (
                  <div
                    key={s.$id}
                    className={styles.listItem}
                    style={{ borderLeft: `4px solid ${cfg.color}` }}
                    onClick={() => onSessionClick(s)}
                  >
                    <div className={styles.listItemTime} style={{ color: cfg.color }}>
                      {s.startTime}
                      {s.endTime && <span style={{ opacity: 0.6, fontSize: 11 }}> – {s.endTime}</span>}
                    </div>
                    <div className={styles.listItemInfo}>
                      <div className={styles.listItemName}>{s.patientName}</div>
                      <div className={styles.listItemMeta}>
                        {s.type === 'online' ? '🖥 Online' : '🏥 Presencial'}
                        {s.isRecurring && ' · 🔁 Recorrente'}
                        {s.notes && ` · ${s.notes.substring(0, 40)}…`}
                      </div>
                    </div>
                    <div
                      className={styles.listItemBadge}
                      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
                    >
                      {cfg.label}
                    </div>
                    <div className={styles.listItemActions}>
                      {(Object.entries(STATUS_CONFIG) as [SessionStatus, typeof STATUS_CONFIG[SessionStatus]][])
                        .filter(([k]) => k !== s.status)
                        .map(([k, v]) => (
                          <button
                            key={k}
                            className={styles.listStatusBtn}
                            style={{ color: v.color }}
                            onClick={e => { e.stopPropagation(); onStatusChange(s.$id, k); }}
                            title={v.label}
                          >
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: v.color, display: 'inline-block' }} />
                            {v.label}
                          </button>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AgendaTab({ userId, patients, appointments = [] }: AgendaTabProps) {
  const agenda = useAgenda(userId);

  const today    = toDateStr(new Date());
  const [view, setView]               = useState<'week' | 'month' | 'list'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal]     = useState(false);
  const [editSession, setEditSession] = useState<Session | null>(null);
  const [defaultDate, setDefaultDate] = useState('');
  const [defaultTime, setDefaultTime] = useState('');
  const [filterStatus, setFilterStatus] = useState<SessionStatus | 'all'>('all');
  const [deletingId, setDeletingId]   = useState<string | null>(null);
  const weekStart = useMemo(() => getWeekStart(currentDate), [currentDate]);
  const weekDays  = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const year      = currentDate.getFullYear();
  const month     = currentDate.getMonth();

  const navigate = (dir: 1 | -1) => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      if (view === 'week')  d.setDate(d.getDate() + dir * 7);
      if (view === 'month') d.setMonth(d.getMonth() + dir);
      if (view === 'list')  d.setMonth(d.getMonth() + dir);
      return d;
    });
  };

  const goToday = () => setCurrentDate(new Date());

  const rangeFrom = useMemo(() => {
    if (view === 'week')  return toDateStr(weekDays[0]);
    if (view === 'month') return toDateStr(new Date(year, month, 1));
    const d = new Date(currentDate); d.setDate(1);
    return toDateStr(d);
  }, [view, weekDays, year, month, currentDate]);

  const rangeTo = useMemo(() => {
    if (view === 'week')  return toDateStr(weekDays[6]);
    if (view === 'month') return toDateStr(new Date(year, month + 1, 0));
    const d = new Date(currentDate); d.setMonth(d.getMonth() + 1); d.setDate(0);
    return toDateStr(d);
  }, [view, weekDays, year, month, currentDate]);

  const visibleSessions = useMemo(() => {
    let s = agenda.sessionsInRange ? agenda.sessionsInRange(rangeFrom, rangeTo) : [];
    
    const mappedAppointments: Session[] = appointments.map(apt => {
      const h = parseInt(apt.time.split(':')[0] || '0', 10);
      return {
        $id: apt.id,
        userId,
        patientId: apt.patientId,
        patientName: apt.patientName || patients.find(p => p.id === apt.patientId)?.name || 'Paciente',
        date: apt.date || today,
        startTime: apt.time,
        endTime: `${String(h + 1).padStart(2, '0')}:00`,
        status: 'confirmada',
        type: (apt.type as SessionType) || 'presencial',
        notes: '',
        isRecurring: false,
        recurrenceType: 'none',
        recurrenceDays: '',
        recurrenceEndDate: ''
      };
    });

    const existingIds = new Set(s.map(x => x.$id));
    mappedAppointments.forEach(ma => {
      if (!existingIds.has(ma.$id) && ma.date >= rangeFrom && ma.date <= rangeTo) {
        s.push(ma);
      }
    });

    if (filterStatus !== 'all') s = s.filter(x => x.status === filterStatus);
    return s.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [agenda, rangeFrom, rangeTo, filterStatus, appointments, patients, today, userId]);

  const weekSessions = useMemo(() => {
    return visibleSessions.filter(s => s.date >= toDateStr(weekDays[0]) && s.date <= toDateStr(weekDays[6]));
  }, [visibleSessions, weekDays]);

  const kpis = useMemo(() => ({
    total:      weekSessions.length,
    realizadas: weekSessions.filter(s => s.status === 'realizada').length,
    faltou:     weekSessions.filter(s => s.status === 'faltou').length,
    pendentes:  weekSessions.filter(s => ['confirmada','aguardando'].includes(s.status)).length,
  }), [weekSessions]);

  const openNew = (date = '', time = '') => {
    setEditSession(null);
    setDefaultDate(date);
    setDefaultTime(time);
    setShowModal(true);
  };

  const openEdit = (s: Session) => {
    setEditSession(s);
    setShowModal(true);
  };

  const handleSave = useCallback(async (data: any) => {
    if (editSession && agenda.updateSession) {
      await agenda.updateSession(editSession.$id, data);
    } else if (agenda.addSession) {
      await agenda.addSession(data);
    }
    setShowModal(false);
  }, [editSession, agenda]);

  const handleDelete = async (s: Session) => {
    if (!confirm(`Remover sessão de ${s.patientName} em ${s.date}?`)) return;
    setDeletingId(s.$id);
    try { 
      if (agenda.deleteSession) await agenda.deleteSession(s.$id); 
    } finally { 
      setDeletingId(null); 
      setShowModal(false); 
    }
  };

  const title = useMemo(() => {
    if (view === 'week') {
      const from = weekDays[0];
      const to   = weekDays[6];
      if (from.getMonth() === to.getMonth())
        return `${from.getDate()} – ${to.getDate()} de ${MONTHS_PT[from.getMonth()]} ${from.getFullYear()}`;
      return `${fmtDate(from)} – ${fmtDate(to)} de ${from.getFullYear()}`;
    }
    return `${MONTHS_PT[month]} ${year}`;
  }, [view, weekDays, month, year]);

  return (
    <>
      {showModal && (
        <SessionModal
          session={editSession}
          patients={patients}
          defaultDate={defaultDate}
          defaultTime={defaultTime}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}

      <div className={styles.wrapper}>

        <div className={styles.kpiBar}>
          {[
            { label: 'Esta Semana',  value: kpis.total,      color: '#AD6D15', bg: '#F5ECD8' },
            { label: 'Realizadas',   value: kpis.realizadas,  color: '#5A7ABF', bg: '#EEF2FA' },
            { label: 'Pendentes',    value: kpis.pendentes,   color: '#2E9E5B', bg: '#E8F4EC' },
            { label: 'Faltas',       value: kpis.faltou,      color: '#C45A35', bg: '#FEF0EC' },
          ].map(k => (
            <div key={k.label} className={styles.kpiCard} style={{ background: k.bg }}>
              <div className={styles.kpiValue} style={{ color: k.color }}>{k.value}</div>
              <div className={styles.kpiLabel} style={{ color: k.color }}>{k.label}</div>
            </div>
          ))}
        </div>

        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <button className={styles.btnToday} onClick={goToday}>Hoje</button>
            <div className={styles.navGroup}>
              <button className={styles.navBtn} onClick={() => navigate(-1)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <span className={styles.navTitle}>{title}</span>
              <button className={styles.navBtn} onClick={() => navigate(1)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>
          </div>

          <div className={styles.toolbarRight}>
          
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className={styles.filterSelect}
            >
              <option value="all">Todos os status</option>
              {(Object.entries(STATUS_CONFIG) as [SessionStatus, any][]).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>

            <div className={styles.viewToggle}>
              {(['week', 'month', 'list'] as const).map(v => (
                <button
                  key={v}
                  className={`${styles.viewBtn} ${view === v ? styles.viewBtnActive : ''}`}
                  onClick={() => setView(v)}
                >
                  {v === 'week' ? 'Semana' : v === 'month' ? 'Mês' : 'Lista'}
                </button>
              ))}
            </div>

            <button className={styles.btnNew} onClick={() => openNew()}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nova Sessão
            </button>
          </div>
        </div>

        <div className={styles.calendarArea}>
          {view === 'week' && (
            <WeekView
              weekDays={weekDays}
              sessionsInRange={visibleSessions}
              today={today}
              onSlotClick={(d, t) => openNew(d, t)}
              onSessionClick={openEdit}
              onStatusChange={agenda.updateStatus || (() => {})}
            />
          )}

          {view === 'month' && (
            <MonthView
              year={year}
              month={month}
              sessions={visibleSessions}
              today={today}
              onDayClick={d => openNew(d)}
              onSessionClick={openEdit}
              onStatusChange={agenda.updateStatus || (() => {})}
            />
          )}

          {view === 'list' && (
            <div className={styles.listWrapper}>
              <ListView
                sessions={visibleSessions}
                onSessionClick={openEdit}
                onStatusChange={agenda.updateStatus || (() => {})}
                onNewSession={() => openNew()}
              />
            </div>
          )}
        </div>

      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

const btnPrimary: React.CSSProperties = {
  background: '#2D1F0A', color: '#FAF6EE', border: 'none',
  padding: '10px 20px', fontSize: 12, fontWeight: 600,
  cursor: 'pointer', borderRadius: 8, marginTop: 16,
  textTransform: 'uppercase', letterSpacing: '0.05em',
};