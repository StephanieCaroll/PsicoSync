'use client';

import React, { useMemo } from 'react';

interface Patient {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  pendingAmount?: number;
}

interface ResumoFinanceiroTabProps {
  patients: Patient[];
  pendingTotal: number;
  financialTotalMonth: number;
}

export default function ResumoFinanceiroTab({ patients, pendingTotal, financialTotalMonth }: ResumoFinanceiroTabProps) {
  const financialReceived = Math.max(0, financialTotalMonth - pendingTotal);

  const inDebtPatients = useMemo(() => {
    return patients.filter(p => (p.pendingAmount || 0) > 0).sort((a, b) => (b.pendingAmount || 0) - (a.pendingAmount || 0));
  }, [patients]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
        <div style={{ background: '#fff', border: '1px solid #E8D9BE', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#9A7040', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Faturamento Estimado</div>
          <div style={{ fontSize: 28, fontWeight: 600, color: '#2D1F0A', marginTop: 8 }}>R$ {financialTotalMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </div>
        <div style={{ background: '#E8F4EC', border: '1px solid #A8D8B9', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#2E9E5B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sessões Pagas (Recebido)</div>
          <div style={{ fontSize: 28, fontWeight: 600, color: '#1A6E3F', marginTop: 8 }}>R$ {financialReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </div>
        <div style={{ background: '#FEF0EC', border: '1px solid #F0C0A8', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#C45A35', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sessões a Receber (Pendente)</div>
          <div style={{ fontSize: 28, fontWeight: 600, color: '#993C1D', marginTop: 8 }}>R$ {pendingTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #E8D9BE', borderRadius: 12, padding: 24 }}>
        <h3 style={{ fontFamily: 'Lora, serif', fontSize: 20, color: '#2D1F0A', margin: '0 0 20px 0' }}>Fechamento Mensal & Cobranças</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {inDebtPatients.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#9A7040', background: '#FDFAF5', borderRadius: 8 }}>
              Nenhum paciente com pagamentos pendentes! 🎉
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #F0E8D8', color: '#9A7040', fontSize: 12, textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 8px' }}>Paciente</th>
                  <th style={{ padding: '12px 8px' }}>Contato</th>
                  <th style={{ padding: '12px 8px' }}>Valor Devido</th>
                </tr>
              </thead>
              <tbody>
                {inDebtPatients.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #F0E8D8' }}>
                    <td style={{ padding: '16px 8px', fontWeight: 600, color: '#5A3E20' }}>{p.name}</td>
                    <td style={{ padding: '16px 8px', fontSize: 13, color: '#9A7040' }}>{p.phone || p.email || 'Sem contato'}</td>
                    <td style={{ padding: '16px 8px', fontWeight: 700, color: '#C45A35' }}>
                      R$ {p.pendingAmount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}