'use client';

import React from 'react';

interface Patient {
  id: string;
  name: string;
  status?: string;
}

interface Appointment {
  id: string;
  patientId: string;
  date?: string;
  type?: string;
}

interface RelatoriosTabProps {
  patients: Patient[];
  appointments: Appointment[];
}

export default function RelatoriosTab({ patients, appointments }: RelatoriosTabProps) {
  const activeCount = patients.filter(p => p.status === 'active').length;
  const inactiveCount = patients.filter(p => p.status === 'inactive').length;
  const waitingCount = patients.filter(p => p.status === 'waiting').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
        <div style={{ background: '#fff', border: '1px solid #E8D9BE', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#9A7040', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pacientes Ativos</div>
          <div style={{ fontSize: 28, fontWeight: 600, color: '#2D1F0A', marginTop: 8 }}>{activeCount}</div>
        </div>
        <div style={{ background: '#FEF0EC', border: '1px solid #F0C0A8', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#C45A35', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Taxa de Evasão (Inativos)</div>
          <div style={{ fontSize: 28, fontWeight: 600, color: '#993C1D', marginTop: 8 }}>{inactiveCount}</div>
        </div>
        <div style={{ background: '#E8F4EC', border: '1px solid #A8D8B9', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#2E9E5B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lista de Espera</div>
          <div style={{ fontSize: 28, fontWeight: 600, color: '#1A6E3F', marginTop: 8 }}>{waitingCount}</div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #E8D9BE', borderRadius: 12, padding: 24 }}>
        <h3 style={{ fontFamily: 'Lora, serif', fontSize: 20, color: '#2D1F0A', margin: '0 0 20px 0' }}>Origem dos Pacientes & Evolução de Sessões</h3>
        <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #D9C49A', borderRadius: 8, background: '#FDFAF5', textAlign: 'center', padding: 20 }}>
          <p style={{ color: '#9A7040', fontSize: 13 }}>Os gráficos estatísticos (Instagram, Indicação, Google e Crescimento Mensal) serão renderizados aqui utilizando uma biblioteca como Chart.js ou Recharts.</p>
        </div>
      </div>
    </div>
  );
}