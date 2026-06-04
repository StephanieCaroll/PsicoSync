'use client';

import React from 'react';

const TabContainer = ({ title, description, children }: { title: string, description: string, children: React.ReactNode }) => (
  <div style={{ background: '#fff', border: '1px solid #E8D9BE', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
    <div>
      <h3 style={{ fontFamily: 'Lora, serif', fontSize: 20, color: '#2D1F0A', margin: '0 0 8px 0' }}>{title}</h3>
      <p style={{ color: '#9A7040', fontSize: 13, margin: 0 }}>{description}</p>
    </div>
    <div style={{ borderTop: '1px solid #F0E8D8', paddingTop: 16 }}>
      {children}
    </div>
  </div>
);

export function SalaEsperaTab() {
  return (
    <TabContainer title="Sala de Espera Virtual" description="Acompanhe se há pacientes que já ingressaram no link e aguardam o início do atendimento online.">
      <div style={{ padding: 20, background: '#FDFAF5', borderRadius: 8, border: '1px dashed #D9C49A', textAlign: 'center', color: '#9A7040', fontSize: 14 }}>
        <p>Nenhum paciente aguardando no momento.</p>
        <button style={{ padding: '10px 20px', background: '#AD6D15', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', marginTop: 10, fontWeight: 600 }}>Atualizar Status</button>
      </div>
    </TabContainer>
  );
}

export function TeleconsultaTab() {
  return (
    <TabContainer title="Teleconsulta Nativa" description="Inicie a videochamada com máxima segurança sem precisar de links externos (Zoom, Meet).">
      <div style={{ height: 350, background: '#1A1008', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexDirection: 'column' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#EFBB55" strokeWidth="2" style={{ marginBottom: 16 }}>
          <path d="M23 7l-7 5 7 5V7z" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>Câmera e Microfone aguardando permissão...</p>
        <button style={{ padding: '12px 24px', background: '#2E9E5B', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', marginTop: 16, fontSize: 14, fontWeight: 700 }}>
          Iniciar Videochamada
        </button>
      </div>
    </TabContainer>
  );
}

export function AnamneseTab({ patients }: { patients: any[] }) {
  return (
    <TabContainer title="Anamnese & Triagem" description="Envie questionários iniciais estruturados e vincule diretamente à ficha do paciente.">
      <select style={{ padding: '12px 14px', width: '100%', borderRadius: 8, border: '1.5px solid #E8D9BE', marginBottom: 16, outline: 'none', color: '#2D1F0A' }}>
        <option value="">Selecione o paciente para triagem...</option>
        {patients?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <button style={{ padding: 20, textAlign: 'left', background: '#fff', border: '1.5px solid #E8D9BE', borderRadius: 12, cursor: 'pointer' }}>
          <strong style={{ color: '#2D1F0A', fontSize: 15 }}>Anamnese Adulto</strong>
          <p style={{ margin: '6px 0 0 0', fontSize: 12, color: '#9A7040', lineHeight: 1.5 }}>Histórico familiar, queixa principal, padrão de sono e funcionamento social.</p>
        </button>
        <button style={{ padding: 20, textAlign: 'left', background: '#fff', border: '1.5px solid #E8D9BE', borderRadius: 12, cursor: 'pointer' }}>
          <strong style={{ color: '#2D1F0A', fontSize: 15 }}>Anamnese Infantil</strong>
          <p style={{ margin: '6px 0 0 0', fontSize: 12, color: '#9A7040', lineHeight: 1.5 }}>Gestação, marcos do desenvolvimento, dinâmica dos pais e vida escolar.</p>
        </button>
      </div>
    </TabContainer>
  );
}

export function TestesTab({ patients }: { patients: any[] }) {
  return (
    <TabContainer title="Testes Psicológicos & Escalas" description="Registro de aplicação de BDI (Depressão), BAI (Ansiedade), HTP, entre outros.">
      <div style={{ padding: 30, background: '#FDFAF5', borderRadius: 8, border: '1px dashed #D9C49A', textAlign: 'center', color: '#9A7040' }}>
        <p style={{ fontSize: 14 }}>Selecione um paciente para registrar um laudo de teste ou verificar resultados antigos.</p>
        <button style={{ padding: '10px 20px', background: '#AD6D15', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', marginTop: 16, fontWeight: 600 }}>+ Aplicar Novo Teste</button>
      </div>
    </TabContainer>
  );
}

export function DiarioTab({ patients }: { patients: any[] }) {
  return (
    <TabContainer title="Diário de Emoções (RPD)" description="Acompanhe o Registro de Pensamentos Disfuncionais e diários preenchidos remotamente pelos seus pacientes.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <div style={{ background: '#FEF0EC', border: '1px solid #F0C0A8', padding: 20, borderRadius: 12 }}>
          <strong style={{ color: '#C45A35', fontSize: 14 }}>Crise de Ansiedade</strong>
          <p style={{ fontSize: 13, margin: '8px 0', color: '#993C1D', fontStyle: 'italic' }}>"Tive uma crise muito forte hoje antes da reunião de alinhamento."</p>
          <span style={{ fontSize: 11, color: '#C45A35', fontWeight: 600 }}>João Silva - Hoje às 10:00</span>
        </div>
        <div style={{ background: '#E8F4EC', border: '1px solid #A8D8B9', padding: 20, borderRadius: 12 }}>
          <strong style={{ color: '#1A6E3F', fontSize: 14 }}>Tranquilidade</strong>
          <p style={{ fontSize: 13, margin: '8px 0', color: '#2E9E5B', fontStyle: 'italic' }}>"Consegui dormir a noite inteira e acordei disposta."</p>
          <span style={{ fontSize: 11, color: '#2E9E5B', fontWeight: 600 }}>Maria Souza - Ontem às 08:00</span>
        </div>
      </div>
    </TabContainer>
  );
}

export function PortalTab() {
  return (
    <TabContainer title="Configurações do Portal do Paciente" description="Gerencie as permissões daquilo que o seu paciente pode ver quando faz login.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#2D1F0A', fontSize: 14, cursor: 'pointer' }}><input type="checkbox" defaultChecked style={{ width: 18, height: 18, accentColor: '#AD6D15' }} /> Permitir que pacientes remarquem/cancelem consultas</label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#2D1F0A', fontSize: 14, cursor: 'pointer' }}><input type="checkbox" defaultChecked style={{ width: 18, height: 18, accentColor: '#AD6D15' }} /> Mostrar histórico financeiro e recibos liberados</label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#2D1F0A', fontSize: 14, cursor: 'pointer' }}><input type="checkbox" defaultChecked style={{ width: 18, height: 18, accentColor: '#AD6D15' }} /> Habilitar ferramenta "Meu Diário" para todos os ativos</label>
      </div>
    </TabContainer>
  );
}

export function ListaEsperaTab() {
  return (
    <TabContainer title="Fila & Lista de Espera" description="Administre interessados na terapia que estão aguardando disponibilidade na sua agenda.">
      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #F0E8D8', color: '#9A7040', fontSize: 12, textTransform: 'uppercase' }}>
            <th style={{ padding: '12px 8px' }}>Nome / Interessado</th>
            <th style={{ padding: '12px 8px' }}>Contato</th>
            <th style={{ padding: '12px 8px' }}>Janela de Horário</th>
            <th style={{ padding: '12px 8px' }}>Urgência</th>
          </tr>
        </thead>
        <tbody>
          <tr><td colSpan={4} style={{ padding: 30, textAlign: 'center', color: '#9A7040', fontSize: 13 }}>Nenhuma pessoa na lista de espera.</td></tr>
        </tbody>
      </table>
      <button style={{ padding: '10px 20px', background: '#AD6D15', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', marginTop: 10, fontWeight: 600, width: 'fit-content' }}>+ Adicionar Ficha</button>
    </TabContainer>
  );
}

export function LembretesTab() {
  return (
    <TabContainer title="Lembretes Automáticos" description="Automatize mensagens de WhatsApp, Email e SMS para diminuir faltas.">
      <div style={{ background: '#FDFAF5', padding: 24, borderRadius: 12, border: '1px solid #E8D9BE' }}>
        <strong style={{ color: '#2D1F0A', display: 'block', marginBottom: 12, fontSize: 15 }}>Template Padrão (24h antes)</strong>
        <textarea readOnly style={{ width: '100%', padding: 14, borderRadius: 8, border: '1.5px solid #D9C49A', background: '#fff', resize: 'vertical', color: '#5A3E20', fontFamily: 'inherit', fontSize: 14 }} rows={4} value={"Olá {NOME_PACIENTE}, passando para confirmar nossa sessão de terapia agendada para amanhã, dia {DATA} às {HORARIO}.\n\nPara cancelar ou reagendar sem custos, por favor avise em até 24h. Responda 'OK' para confirmar."} />
      </div>
    </TabContainer>
  );
}

export function AssinaturaTab() {
  return (
    <TabContainer title="Assinatura Eletrônica de Termos" description="Despache seu Contrato Terapêutico via link para que o paciente assine com validade digital.">
      <div style={{ padding: 40, background: '#FDFAF5', borderRadius: 12, border: '1px dashed #D9C49A', textAlign: 'center', color: '#9A7040' }}>
        <p style={{ fontSize: 14, marginBottom: 20 }}>Nenhum contrato pendente. Faça o upload do seu Termo de Consentimento.</p>
        <button style={{ padding: '10px 24px', background: '#2D1F0A', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Fazer Upload do Contrato (PDF)</button>
      </div>
    </TabContainer>
  );
}

export function BibliotecaTab() {
  return (
    <TabContainer title="Biblioteca Clínica de Apoio" description="Acervo pessoal de e-books, áudios de mindfulness e exercícios cognitivos para distribuir para os pacientes.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div style={{ border: '1.5px solid #E8D9BE', borderRadius: 12, padding: 20, textAlign: 'center', background: '#fff' }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>📄</div>
          <strong style={{ fontSize: 14, color: '#2D1F0A' }}>E-book: Lidando com a Ansiedade</strong>
          <p style={{ fontSize: 12, color: '#9A7040', margin: '8px 0 0 0' }}>Repassado 12 vezes</p>
        </div>
        <button style={{ border: '1.5px dashed #AD6D15', borderRadius: 12, padding: 20, background: '#FDF5E6', cursor: 'pointer', color: '#AD6D15', fontWeight: 700, fontSize: 14 }}>
          + Adicionar Material
        </button>
      </div>
    </TabContainer>
  );
}

export function RecibosTab({ patients }: { patients: any[] }) { return <TabContainer title="Central de Recibos" description="Gere os recibos para reembolso no convênio de forma automática."><p>Módulo de Recibos.</p></TabContainer> }
export function CobrancasTab({ patients }: { patients: any[] }) { return <TabContainer title="Controle de Inadimplência" description="Acompanhe as sessões do paciente e cobre via Pix se necessário."><p>Módulo de Cobranças.</p></TabContainer> }
export function SupervisaoTab() { return <TabContainer title="Supervisão Clínica" description="Registre anotações sobre os casos difíceis com seu supervisor."><p>Módulo de Supervisão.</p></TabContainer> }