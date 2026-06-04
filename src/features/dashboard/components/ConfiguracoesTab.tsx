'use client';

import React, { useState, useEffect, useCallback } from 'react';

function useSettingString(key: string, defaultValue: string): [string, (val: string) => void] {
  const [state, setState] = useState(defaultValue);

  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved) setState(saved);
  }, [key]);

  const setValue = useCallback((val: string) => {
    setState(val);
    localStorage.setItem(key, val);
  }, [key]);

  return [state, setValue];
}

function useSettingBool(key: string, defaultValue: boolean): [boolean, (val: boolean) => void] {
  const [state, setState] = useState(defaultValue);

  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved !== null) setState(saved === 'true');
  }, [key]);

  const setValue = useCallback((val: boolean) => {
    setState(val);
    localStorage.setItem(key, String(val));
  }, [key]);

  return [state, setValue];
}

export default function ConfiguracoesTab() {
  const [isMounted, setIsMounted] = useState(false);

  const [theme, setTheme] = useSettingString('psico_theme', 'light');
  const [primaryColor, setPrimaryColor] = useSettingString('psico_color', '#AD6D15');
  const [animations, setAnimations] = useSettingBool('psico_anim', true);
  const [compactMode, setCompactMode] = useSettingBool('psico_compact', false);
  const [fontSize, setFontSize] = useSettingString('psico_fontSize', 'md');
  
  const [hideFinancials, setHideFinancials] = useSettingBool('psico_hideFinancials', false);
  const [maskPatientNames, setMaskPatientNames] = useSettingBool('psico_maskNames', false);
  const [twoFactorAuth, setTwoFactorAuth] = useSettingBool('psico_2fa', false);
  const [sessionTimeout, setSessionTimeout] = useSettingString('psico_timeout', '30');
  const [shareDataWithSupport, setShareDataWithSupport] = useSettingBool('psico_supportData', false);
  
  const [emailNotifications, setEmailNotifications] = useSettingBool('psico_notif_email', true);
  const [pushNotifications, setPushNotifications] = useSettingBool('psico_notif_push', true);
  const [notificationSound, setNotificationSound] = useSettingBool('psico_notif_sound', true);
  const [alertNewAppointment, setAlertNewAppointment] = useSettingBool('psico_notif_newAppt', true);
  const [paymentReminders, setPaymentReminders] = useSettingBool('psico_notif_payment', true);
  const [dailySummary, setDailySummary] = useSettingBool('psico_notif_dailySum', false);

  const [defaultSessionDuration, setDefaultSessionDuration] = useSettingString('psico_session_duration', '50');
  const [sessionInterval, setSessionInterval] = useSettingString('psico_session_interval', '10');
  const [delayTolerance, setDelayTolerance] = useSettingString('psico_delay_tolerance', '15');
  const [telehealthProvider, setTelehealthProvider] = useSettingString('psico_telehealth', 'native');
  const [syncGoogleCalendar, setSyncGoogleCalendar] = useSettingBool('psico_sync_gcal', false);

  const [autoBilling, setAutoBilling] = useSettingBool('psico_auto_billing', false);
  const [autoReceipts, setAutoReceipts] = useSettingBool('psico_auto_receipts', true);

  const [autoBackup, setAutoBackup] = useSettingBool('psico_auto_backup', true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.style.setProperty('filter', 'invert(0.92) hue-rotate(180deg)');
      document.documentElement.style.setProperty('background-color', '#121212');
    } else {
      document.documentElement.style.removeProperty('filter');
      document.documentElement.style.removeProperty('background-color');
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', primaryColor);
  }, [primaryColor]);

  const colorOptions = [
    { name: 'Ouro', hex: '#AD6D15' },
    { name: 'Azul Psiquê', hex: '#2B6CB0' },
    { name: 'Verde Sereno', hex: '#2F855A' },
    { name: 'Roxo Terapia', hex: '#6B46C1' },
    { name: 'Gelo Clínico', hex: '#4A5568' },
    { name: 'Rosa Empatia', hex: '#D53F8C' },
    { name: 'Vinho', hex: '#702459' },
  ];

  if (!isMounted) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#9A7040' }}>Carregando preferências...</div>;
  }

  const Section = ({ title, description, children }: { title: string, description: string, children: React.ReactNode }) => (
    <div style={{ marginBottom: 32 }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#2D1F0A', margin: '0 0 6px 0', fontFamily: 'Lora, serif' }}>{title}</h3>
        <p style={{ fontSize: 13, color: '#9A7040', margin: 0 }}>{description}</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        {children}
      </div>
    </div>
  );

  const Toggle = ({ label, desc, checked, onChange }: { label: string, desc: string, checked: boolean, onChange: (val: boolean) => void }) => (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', padding: '16px', border: '1px solid #E8D9BE', borderRadius: 12, background: '#fff', transition: 'all 0.2s', boxShadow: checked ? `0 0 0 1.5px ${primaryColor}` : 'none' }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ width: 18, height: 18, accentColor: primaryColor, marginTop: 2, cursor: 'pointer' }} />
      <div>
        <strong style={{ fontSize: 14, color: '#2D1F0A', display: 'block', marginBottom: 4 }}>{label}</strong>
        <span style={{ fontSize: 12, color: '#9A7040', lineHeight: 1.4, display: 'block' }}>{desc}</span>
      </div>
    </label>
  );

  const SelectMenu = ({ label, desc, value, onChange, options }: { label: string, desc: string, value: string, onChange: (val: string) => void, options: {label: string, value: string}[] }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '16px', border: '1px solid #E8D9BE', borderRadius: 12, background: '#fff' }}>
      <div>
        <strong style={{ fontSize: 14, color: '#2D1F0A', display: 'block', marginBottom: 4 }}>{label}</strong>
        <span style={{ fontSize: 12, color: '#9A7040', lineHeight: 1.4, display: 'block' }}>{desc}</span>
      </div>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid #D9C49A', outline: 'none', background: '#FDFAF5', color: '#5A3E20', fontFamily: 'inherit', fontSize: 13, marginTop: 4, cursor: 'pointer' }}>
        {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );

  return (
    <div style={{ background: '#fff', border: '1px solid #E8D9BE', borderRadius: 16, padding: '32px clamp(16px, 4vw, 40px)', display: 'flex', flexDirection: 'column', gap: 16 }}>
      
      <div style={{ borderBottom: '1px solid #F0E8D8', paddingBottom: 24, marginBottom: 8 }}>
        <h2 style={{ fontFamily: 'Lora, serif', fontSize: 26, fontWeight: 700, color: '#2D1F0A', margin: '0 0 8px 0' }}>Configurações do Sistema</h2>
        <p style={{ color: '#9A7040', fontSize: 14, margin: 0, lineHeight: 1.5 }}>
          Personalize a interface do PsicoSync para se adaptar ao seu estilo de trabalho. 
          Todas as alterações são salvas automaticamente e aplicadas em tempo real.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>

        <Section title="Aparência e Cores" description="Ajuste como o PsicoSync é exibido na sua tela.">
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 8 }}>
            <button onClick={() => setTheme('light')} style={{
              flex: 1, minWidth: 150, padding: 20, borderRadius: 12, cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
              border: theme === 'light' ? `2px solid ${primaryColor}` : '2px solid #E8D9BE',
              background: theme === 'light' ? `${primaryColor}15` : '#fff',
            }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>☀️</div>
              <strong style={{ display: 'block', color: '#2D1F0A', fontSize: 14 }}>Modo Claro</strong>
              <span style={{ color: '#9A7040', fontSize: 12 }}>Aparência padrão</span>
            </button>
            
            <button onClick={() => setTheme('dark')} style={{
              flex: 1, minWidth: 150, padding: 20, borderRadius: 12, cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
              border: theme === 'dark' ? `2px solid ${primaryColor}` : '2px solid #E8D9BE',
              background: theme === 'dark' ? '#1A1008' : '#fff',
              color: theme === 'dark' ? '#fff' : 'inherit'
            }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>🌙</div>
              <strong style={{ display: 'block', color: theme === 'dark' ? '#fff' : '#2D1F0A', fontSize: 14 }}>Modo Escuro</strong>
              <span style={{ color: theme === 'dark' ? '#D9C49A' : '#9A7040', fontSize: 12 }}>Descanso visual</span>
            </button>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: '#2D1F0A', marginBottom: 12 }}>Cor de Destaque Primária</h4>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {colorOptions.map((c) => (
                <button key={c.hex} onClick={() => setPrimaryColor(c.hex)} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 20, cursor: 'pointer', transition: 'all 0.2s',
                  border: primaryColor === c.hex ? `2px solid ${c.hex}` : '1px solid #E8D9BE',
                  background: primaryColor === c.hex ? `${c.hex}15` : '#fff'
                }}>
                  <span style={{ width: 16, height: 16, borderRadius: '50%', background: c.hex, display: 'inline-block' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#2D1F0A' }}>{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Acessibilidade & Interface" description="Melhore a legibilidade e a velocidade do sistema.">
          <Toggle label="Habilitar Animações" desc="Desative para navegação instantânea entre modais e pop-ups sem efeitos visuais." checked={animations} onChange={setAnimations} />
          <Toggle label="Modo de Interface Compacto" desc="Reduz o espaçamento de tabelas e listas para exibir mais informações na tela." checked={compactMode} onChange={setCompactMode} />
          <SelectMenu label="Tamanho da Fonte Global" desc="Ajuste o tamanho dos textos de leitura no sistema." value={fontSize} onChange={setFontSize} options={[
            {label: 'Pequena', value: 'sm'},
            {label: 'Média (Padrão)', value: 'md'},
            {label: 'Grande', value: 'lg'}
          ]} />
        </Section>

        <Section title="Privacidade e Segurança" description="Gerencie a proteção dos dados dos seus pacientes e da sua conta.">
          <Toggle label="Ocultar Valores Financeiros" desc="Os valores iniciarão ocultos por padrão (Modo Privacidade)." checked={hideFinancials} onChange={setHideFinancials} />
          <Toggle label="Mascarar Nomes de Pacientes" desc="Exibir apenas as iniciais nas listas para maior discrição." checked={maskPatientNames} onChange={setMaskPatientNames} />
          <Toggle label="Autenticação de Dois Fatores (2FA)" desc="Exigir código por e-mail/SMS ao fazer login em novos dispositivos." checked={twoFactorAuth} onChange={setTwoFactorAuth} />
          <SelectMenu label="Timeout de Sessão Automático" desc="Desconectar automaticamente após inatividade." value={sessionTimeout} onChange={setSessionTimeout} options={[
            {label: 'Após 15 minutos', value: '15'},
            {label: 'Após 30 minutos', value: '30'},
            {label: 'Após 1 hora', value: '60'},
            {label: 'Nunca (Não recomendado)', value: 'never'}
          ]} />
          <Toggle label="Compartilhar Dados Analíticos" desc="Ajuda a melhorar o sistema enviando dados anônimos de uso e erros." checked={shareDataWithSupport} onChange={setShareDataWithSupport} />
        </Section>

        <Section title="Notificações e Avisos" description="Defina como e quando você quer ser avisado.">
          <Toggle label="Notificações por E-mail" desc="Receber resumos semanais e alertas críticos." checked={emailNotifications} onChange={setEmailNotifications} />
          <Toggle label="Notificações Push" desc="Exibir pop-ups no navegador (novos agendamentos, etc)." checked={pushNotifications} onChange={setPushNotifications} />
          <Toggle label="Som de Notificação" desc="Tocar um alerta sonoro discreto ao receber push." checked={notificationSound} onChange={setNotificationSound} />
          <Toggle label="Alerta de Nova Consulta" desc="Ser notificado quando um paciente agendar ou cancelar via Portal." checked={alertNewAppointment} onChange={setAlertNewAppointment} />
          <Toggle label="Lembrete de Inadimplência" desc="Avisar na Dashboard se houverem faturas vencidas." checked={paymentReminders} onChange={setPaymentReminders} />
          <Toggle label="Resumo Diário (Briefing)" desc="Receber um email matinal com os pacientes do dia e aniversariantes." checked={dailySummary} onChange={setDailySummary} />
        </Section>

        <Section title="Agenda e Consultas" description="Padrões para geração de horários e atendimento.">
          <SelectMenu label="Duração Padrão da Sessão" desc="Tempo base bloqueado na agenda." value={defaultSessionDuration} onChange={setDefaultSessionDuration} options={[
            {label: '30 minutos', value: '30'},
            {label: '45 minutos', value: '45'},
            {label: '50 minutos (Padrão)', value: '50'},
            {label: '60 minutos', value: '60'}
          ]} />
          <SelectMenu label="Intervalo Entre Sessões" desc="Respiro automático gerado entre pacientes." value={sessionInterval} onChange={setSessionInterval} options={[
            {label: 'Nenhum', value: '0'},
            {label: '10 minutos', value: '10'},
            {label: '15 minutos', value: '15'},
            {label: '30 minutos', value: '30'}
          ]} />
          <SelectMenu label="Tolerância de Atraso" desc="Tempo máximo aguardando o paciente." value={delayTolerance} onChange={setDelayTolerance} options={[
            {label: '5 minutos', value: '5'},
            {label: '10 minutos', value: '10'},
            {label: '15 minutos (Padrão)', value: '15'}
          ]} />
          <SelectMenu label="Provedor de Teleconsulta" desc="Sistema de vídeo padrão ao clicar na consulta." value={telehealthProvider} onChange={setTelehealthProvider} options={[
            {label: 'Nativo PsicoSync (Seguro)', value: 'native'},
            {label: 'Google Meet', value: 'meet'},
            {label: 'Zoom', value: 'zoom'},
            {label: 'Skype', value: 'skype'}
          ]} />
          <Toggle label="Sincronizar Google Calendar" desc="Espelhar atendimentos no seu calendário pessoal." checked={syncGoogleCalendar} onChange={setSyncGoogleCalendar} />
        </Section>

        <Section title="Faturamento Automático" description="Automatize recebimentos e notas fiscais.">
          <Toggle label="Gerar Cobranças Auto" desc="Criar fatura para o paciente 24h antes da sessão." checked={autoBilling} onChange={setAutoBilling} />
          <Toggle label="Envio Automático de Recibos" desc="Mandar recibo PDF por e-mail assim que baixar o pagamento." checked={autoReceipts} onChange={setAutoReceipts} />
        </Section>

        <Section title="Sistema e Gerenciamento de Dados" description="Faça backup e limpeza do seu sistema local.">
          <Toggle label="Backup Automático em Nuvem" desc="Habilitar sincronização contínua dos seus prontuários." checked={autoBackup} onChange={setAutoBackup} />
          
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 12 }}>
            <button style={{ padding: '12px 24px', background: primaryColor, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.2s' }}
              onMouseOver={e => e.currentTarget.style.opacity = '0.9'} onMouseOut={e => e.currentTarget.style.opacity = '1'}>
              📥 Exportar Backup Manual (JSON)
            </button>
            <button style={{ padding: '12px 24px', background: '#FEF0EC', border: '1px solid #F0C0A8', color: '#C45A35', borderRadius: 8, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseOver={e => e.currentTarget.style.background = '#FADBD2'} onMouseOut={e => e.currentTarget.style.background = '#FEF0EC'}>
              🗑 Limpar Cache Local (Resolver Lentidão)
            </button>
          </div>
        </Section>

      </div>
    </div>
  );
}