'use client';

import React, { useState } from 'react';
import { Patient, PatientInput, usePatients } from '../usePatients';
import PatientModal from './PatientModal';

interface PatientsTabProps {
  userId: string;
  onSelectPatient?: (patient: Patient) => void;
}

export default function PatientsTab({ userId, onSelectPatient }: PatientsTabProps) {
  const { patients, loading, error, addPatient, updatePatient, deletePatient } = usePatients(userId);
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = patients.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleSave = async (data: PatientInput) => {
    if (editingPatient) {
      await updatePatient(editingPatient.$id, data);
    } else {
      await addPatient(data);
    }
  };

  const handleDelete = async (patient: Patient) => {
    if (!confirm(`Remover ${patient.name} do diretório?`)) return;
    setDeletingId(patient.$id);
    try {
      await deletePatient(patient.$id);
    } finally {
      setDeletingId(null);
    }
  };

  const openEdit = (patient: Patient, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPatient(patient);
    setShowModal(true);
  };

  const openNew = () => {
    setEditingPatient(null);
    setShowModal(true);
  };

  const statusLabel: Record<string, string> = {
    active: 'Ativo', waiting: 'Aguardando', inactive: 'Inativo',
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: '#9A7040', gap: 12 }}>
      <div style={{ width: 24, height: 24, border: '3px solid #E8D9BE', borderTopColor: '#AD6D15', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      Carregando pacientes...
    </div>
  );

  if (error) return (
    <div style={{ padding: 24, background: '#FEF0EC', borderRadius: 12, color: '#C45A35', textAlign: 'center' }}>
      ⚠️ {error}
    </div>
  );

  return (
    <>
      {showModal && (
        <PatientModal
          patient={editingPatient}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}

      <div style={{ background: 'white', border: '1px solid #E8D9BE', borderRadius: 12, padding: 24 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <h3 style={{ fontFamily: "'Lora', serif", fontSize: 22, color: '#2D1F0A', margin: 0 }}>
            Diretório de Pacientes
            <span style={{ fontSize: 14, fontWeight: 400, color: '#9A7040', marginLeft: 10 }}>
              ({patients.length} total)
            </span>
          </h3>
          <button onClick={openNew} style={btnPrimary}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Novo Paciente
          </button>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <input
            style={{ flex: 1, minWidth: 200, padding: '8px 14px', border: '1px solid #E8D9BE', borderRadius: 8, fontFamily: 'DM Sans, sans-serif', fontSize: 13, outline: 'none' }}
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            style={{ padding: '8px 14px', border: '1px solid #E8D9BE', borderRadius: 8, fontFamily: 'DM Sans, sans-serif', fontSize: 13, outline: 'none', cursor: 'pointer' }}
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="waiting">Aguardando</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>

        {/* Tabela Responsiva */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#9A7040' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <p>{search || filterStatus !== 'all' ? 'Nenhum paciente encontrado.' : 'Nenhum paciente cadastrado ainda.'}</p>
            {!search && filterStatus === 'all' && (
              <button onClick={openNew} style={{ ...btnPrimary, marginTop: 16, margin: '0 auto' }}>Cadastrar primeiro paciente</button>
            )}
          </div>
        ) : (
          <div className="responsive-table-wrapper" style={{ overflowX: 'auto' }}>
            <table className="responsive-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #FAF6EE', textAlign: 'left', fontSize: 11, color: '#9A7040', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '10px 0' }}>Paciente</th>
                  <th style={{ padding: '10px 0' }}>Contato</th>
                  <th style={{ padding: '10px 0' }}>Terapia</th>
                  <th style={{ padding: '10px 0' }}>Próx. Sessão</th>
                  <th style={{ padding: '10px 0' }}>Pendente</th>
                  <th style={{ padding: '10px 0' }}>Status</th>
                  <th style={{ padding: '10px 0' }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(patient => (
                  <tr
                    key={patient.$id}
                    className="responsive-tr"
                    style={{ borderBottom: '1px solid #FAF6EE', cursor: 'pointer', transition: 'background 0.15s' }}
                    onClick={() => onSelectPatient?.(patient)}
                    onMouseEnter={e => { if(window.innerWidth > 768) e.currentTarget.style.background = '#FAF6EE' }}
                    onMouseLeave={e => { if(window.innerWidth > 768) e.currentTarget.style.background = 'transparent' }}
                  >
                    <td style={{ padding: '14px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={avatar}>
                          {patient.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#2D1F0A', fontSize: 14 }}>{patient.name}</div>
                          <div style={{ fontSize: 11, color: '#9A7040' }}>{patient.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 0', fontSize: 13, color: '#5A3E20' }}>
                      <span className="mobile-label">Contato:</span>
                      {patient.phone}
                    </td>
                    <td style={{ padding: '14px 0', fontSize: 13, color: '#5A3E20', maxWidth: 160 }}>
                      <span className="mobile-label">Terapia:</span>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block', verticalAlign: 'bottom' }}>
                        {patient.therapyType || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 0', fontSize: 13, color: '#5A3E20' }}>
                      <span className="mobile-label">Próxima Sessão:</span>
                      {patient.nextSession ? new Date(patient.nextSession).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td style={{ padding: '14px 0' }}>
                      <span className="mobile-label">Pendente:</span>
                      {patient.pendingAmount > 0 ? (
                        <span style={{ color: '#C45A35', fontWeight: 600, fontSize: 13 }}>
                          R$ {patient.pendingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span style={{ color: '#2E9E5B', fontSize: 13 }}>Em dia</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 0' }}>
                      <span className="mobile-label">Status:</span>
                      <span style={{ ...badge, ...badgeColors[patient.status] }}>
                        {statusLabel[patient.status]}
                      </span>
                    </td>
                    <td style={{ padding: '14px 0' }} className="actions-td">
                      <div style={{ display: 'flex', gap: 8 }} className="actions-container">
                        <button style={btnSmall} onClick={e => openEdit(patient, e)}>Editar</button>
                        <button
                          style={{ ...btnSmall, color: '#C45A35', borderColor: '#C45A35' }}
                          disabled={deletingId === patient.$id}
                          onClick={e => { e.stopPropagation(); handleDelete(patient); }}
                        >
                          {deletingId === patient.$id ? '...' : 'Remover'}
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

      <style>{`
        .mobile-label { display: none; font-size: 10px; text-transform: uppercase; color: #9A7040; margin-right: 6px; font-weight: 700; }
        
        @media (max-width: 768px) {
          .responsive-table, .responsive-table thead, .responsive-table tbody, .responsive-table th, .responsive-table td, .responsive-tr {
            display: block;
          }
          .responsive-table thead tr {
            position: absolute;
            top: -9999px;
            left: -9999px;
          }
          .responsive-tr {
            border: 1px solid #E8D9BE !important;
            border-radius: 12px;
            margin-bottom: 16px;
            padding: 16px;
            background: #fff;
          }
          .responsive-table td {
            border: none;
            position: relative;
            padding: 6px 0 !important;
            display: flex;
            align-items: center;
          }
          .mobile-label { display: inline-block; }
          .actions-td { border-top: 1px solid #F0E8D8 !important; margin-top: 8px; padding-top: 12px !important; }
          .actions-container { justify-content: flex-start; width: 100%; }
        }
      `}</style>
    </>
  );
}

const btnPrimary: React.CSSProperties = {
  background: '#2D1F0A', color: '#FAF6EE', border: 'none',
  padding: '10px 18px', fontSize: 12, fontWeight: 600,
  cursor: 'pointer', borderRadius: 6, display: 'flex',
  alignItems: 'center', gap: 8, textTransform: 'uppercase', letterSpacing: '0.05em',
};
const btnSmall: React.CSSProperties = {
  background: 'transparent', border: '1px solid #D9C49A',
  color: '#AD6D15', padding: '4px 10px', fontSize: 11,
  fontWeight: 600, cursor: 'pointer', borderRadius: 4,
  textTransform: 'uppercase', letterSpacing: '0.04em',
};
const avatar: React.CSSProperties = {
  width: 36, height: 36, borderRadius: '50%',
  background: '#F5ECD8', color: '#AD6D15',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 12, fontWeight: 700, flexShrink: 0,
};
const badge: React.CSSProperties = {
  display: 'inline-block', padding: '3px 8px',
  fontSize: 10, fontWeight: 600, borderRadius: 4,
  textTransform: 'uppercase', letterSpacing: '0.05em',
};
const badgeColors: Record<string, React.CSSProperties> = {
  active: { background: '#E8F4EC', color: '#2E9E5B' },
  waiting: { background: '#FEF0EC', color: '#C45A35' },
  inactive: { background: '#F5ECD8', color: '#9A7040' },
};