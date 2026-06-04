'use client';

import React, { useState } from 'react';

interface Patient {
  id: string;
  name: string;
  cpf?: string;
}

interface DocumentosTabProps {
  patients: Patient[];
  userName: string;
  userCrp: string;
}

const TEMPLATES = [
  {
    id: 'atestado',
    name: 'Atestado Psicológico',
    content: `Atesto para os devidos fins que o(a) paciente {NOME_PACIENTE}, inscrito(a) no CPF sob o nº {CPF_PACIENTE}, encontra-se em acompanhamento psicológico sob meus cuidados profissionais.

Por motivo de saúde, o(a) paciente necessita de {DIAS} dias de afastamento de suas atividades laborais, a partir da presente data.

São Paulo, {DATA_ATUAL}.

________________________________________________
{NOME_PROFISSIONAL}
Psicólogo(a) - CRP {CRP_PROFISSIONAL}`,
  },
  {
    id: 'recibo',
    name: 'Recibo de Pagamento',
    content: `RECIBO - R$ {VALOR}

Recebi de {NOME_PACIENTE}, inscrito(a) no CPF sob o nº {CPF_PACIENTE}, a importância de R$ {VALOR} ({VALOR_EXTENSO}) referente a sessões de psicoterapia realizadas no mês vigente.

São Paulo, {DATA_ATUAL}.

________________________________________________
{NOME_PROFISSIONAL}
Psicólogo(a) - CRP {CRP_PROFISSIONAL}`,
  },
  {
    id: 'encaminhamento',
    name: 'Encaminhamento Médico',
    content: `Encaminhamento Psicológico

Ao(À) colega médico(a) Psiquiatra,

Encaminho o(a) paciente {NOME_PACIENTE}, para avaliação psiquiátrica. O(a) paciente encontra-se em acompanhamento psicoterápico e apresenta sintomas que sugerem a necessidade de avaliação medicamentosa.

Fico à disposição para discussão do caso.

São Paulo, {DATA_ATUAL}.

________________________________________________
{NOME_PROFISSIONAL}
Psicólogo(a) - CRP {CRP_PROFISSIONAL}`,
  }
];

export default function DocumentosTab({ patients, userName, userCrp }: DocumentosTabProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [generatedText, setGeneratedText] = useState('');

  const handleGenerate = () => {
    const patient = patients.find(p => p.id === selectedPatientId);
    if (!patient) {
      alert('Por favor, selecione um paciente.');
      return;
    }

    const today = new Date().toLocaleDateString('pt-BR');
    let text = selectedTemplate.content
      .replace(/{NOME_PACIENTE}/g, patient.name)
      .replace(/{CPF_PACIENTE}/g, patient.cpf || '___.___.___-__')
      .replace(/{NOME_PROFISSIONAL}/g, userName)
      .replace(/{CRP_PROFISSIONAL}/g, userCrp)
      .replace(/{DATA_ATUAL}/g, today);
    
    setGeneratedText(text);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Impressão - ${selectedTemplate.name}</title>
            <style>body { font-family: 'Arial', sans-serif; padding: 40px; color: #333; line-height: 1.6; white-space: pre-wrap; }</style>
          </head>
          <body>${generatedText}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div style={{ display: 'flex', gap: 24, flexDirection: 'row', flexWrap: 'wrap' }}>
      <div style={{ flex: '1 1 300px', background: '#fff', border: '1px solid #E8D9BE', borderRadius: 12, padding: 24 }}>
        <h3 style={{ fontFamily: 'Lora, serif', fontSize: 20, color: '#2D1F0A', margin: '0 0 20px 0' }}>Gerar Documento</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9A7040', textTransform: 'uppercase', marginBottom: 6 }}>Template</label>
            <select style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E8D9BE', borderRadius: 8, fontSize: 13, outline: 'none' }} value={selectedTemplate.id} onChange={e => setSelectedTemplate(TEMPLATES.find(t => t.id === e.target.value)!)}>
              {TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9A7040', textTransform: 'uppercase', marginBottom: 6 }}>Paciente</label>
            <select style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E8D9BE', borderRadius: 8, fontSize: 13, outline: 'none' }} value={selectedPatientId} onChange={e => setSelectedPatientId(e.target.value)}>
              <option value="">Selecione um paciente...</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <button onClick={handleGenerate} style={{ background: '#AD6D15', color: '#fff', border: 'none', padding: '12px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', marginTop: 8 }}>
            Preencher Documento
          </button>
        </div>
      </div>
      <div style={{ flex: '2 1 400px', background: '#FDFAF5', border: '1px solid #E8D9BE', borderRadius: 12, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'Lora, serif', fontSize: 20, color: '#2D1F0A', margin: 0 }}>Visualização</h3>
          {generatedText && <button onClick={handlePrint} style={{ background: '#2D1F0A', color: '#FAF6EE', border: 'none', padding: '8px 16px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase' }}>Imprimir / PDF</button>}
        </div>
        {generatedText ? (
          <textarea value={generatedText} onChange={e => setGeneratedText(e.target.value)} style={{ width: '100%', height: 400, padding: 16, border: '1px solid #E8D9BE', borderRadius: 8, background: '#fff', fontFamily: 'Arial, sans-serif', fontSize: 14, lineHeight: 1.6, color: '#333', resize: 'vertical', boxSizing: 'border-box' }} />
        ) : (
          <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #D9C49A', borderRadius: 8 }}>
            <p style={{ color: '#9A7040', fontSize: 13 }}>Configure as opções ao lado e clique em "Preencher Documento".</p>
          </div>
        )}
      </div>
    </div>
  );
}