"use client";
import { useState, useEffect, useRef } from 'react';
import { Client, Databases, ID, Query, Models } from 'appwrite';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  History, 
  LayoutDashboard, 
  User, 
  ClipboardList,
  ChevronRight,
  Timer,
  FileText,
  LogOut,
  Menu,
  X,
  Edit,
  Trash2,
  Search,
  Download,
  Printer,
  Bell,
  Settings,
  Eye,
  EyeOff,
  Calendar,
  BarChart3,
  Users,
  Clock3,
  Plus,
  Copy,
  Volume2,
  Pause,
  Play,
  RefreshCw,
  Star,
  TrendingUp,
  Check,
  AlertCircle,
  Save,
  Upload,
  VolumeX,
  Target,
  CheckCircle
} from 'lucide-react';
import Image from 'next/image';
import Swal from 'sweetalert2';
import LoginScreen from '../public/components/LoginScreen';

interface Sessao extends Models.Document {
  paciente_nome: string;
  anotacoes: string;
  duracao: number;
  prioridade?: 'baixa' | 'media' | 'alta';
  status?: 'concluida' | 'pendente' | 'cancelada';
  emocao_detectada?: string;
  progresso?: number;
  session_notes?: string;
  session_template?: string;
}

const COLORS = {
  terracota: '#c08267',
  verdeMusgo: '#96a07e',
  begeFundo: '#fdfcf8',
  texto: '#4a443f',
  cardBranco: '#ffffff',
  preto: '#1a1a1a',
  sucesso: '#10b981',
  alerta: '#f59e0b',
  perigo: '#ef4444',
  info: '#3b82f6',
  branco: '#ffffff'
};

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1') 
    .setProject('694ddf970028f59e8009'); 

const databases = new Databases(client);
const DB_ID = '694ddfd0001add22bb73';
const COLL_ID = '694ddff70010eece624a';

export default function PsicoSync() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sessao' | 'historico'>('dashboard');
  const [paciente, setPaciente] = useState('');
  const [anotacoes, setAnotacoes] = useState('');
  const [segundos, setSegundos] = useState(50 * 60);
  const [ativo, setAtivo] = useState(false);
  const [historico, setHistorico] = useState<Sessao[]>([]);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const [editingSession, setEditingSession] = useState<Sessao | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterPriority, setFilterPriority] = useState<string>('todos');
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<any[]>([
    { id: 1, message: 'Consulta com João amanhã às 14h', type: 'info', read: false },
    { id: 2, message: 'Maria completou 10 sessões!', type: 'sucesso', read: true }
  ]);
  const [sessionNotes, setSessionNotes] = useState('');
  const [emotionalState, setEmotionalState] = useState('');
  const [progressLevel, setProgressLevel] = useState(50);
  const [showStatistics, setShowStatistics] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [sessionTemplate, setSessionTemplate] = useState('padrao');
  const [reminderTime, setReminderTime] = useState('15');
  const [darkMode, setDarkMode] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  
  const [monthlyGoal, setMonthlyGoal] = useState(40);
  const [editingGoal, setEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState('40');

  const audioRef = useRef<HTMLAudioElement>(null);
  const recognitionRef = useRef<any>(null);
  const goalInputRef = useRef<HTMLInputElement>(null);

  const showAlert = (title: string, text: string, icon: 'success' | 'error' | 'warning' | 'info' | 'question' = 'success') => {
    return Swal.fire({
      title,
      text,
      icon,
      confirmButtonColor: COLORS.verdeMusgo,
      background: darkMode ? '#2d2d2d' : COLORS.cardBranco,
      color: darkMode ? COLORS.branco : COLORS.preto,
      confirmButtonText: 'OK'
    });
  };

  const showConfirm = (title: string, text: string, confirmText = 'Sim', cancelText = 'Cancelar') => {
    return Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: COLORS.perigo,
      cancelButtonColor: darkMode ? '#3d3d3d' : COLORS.begeFundo,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      background: darkMode ? '#2d2d2d' : COLORS.cardBranco,
      color: darkMode ? COLORS.branco : COLORS.preto,
    });
  };

  const showSessionDetails = (sessao: Sessao) => {
    Swal.fire({
      title: `Detalhes da Sessão - ${sessao.paciente_nome}`,
      html: `
        <div style="text-align: left; color: ${darkMode ? '#e0e0e0' : COLORS.preto};">
          <p><strong>Data:</strong> ${new Date(sessao.$createdAt).toLocaleString('pt-BR')}</p>
          <p><strong>Duração:</strong> ${Math.floor(sessao.duracao/60)} minutos</p>
          <p><strong>Status:</strong> ${sessao.status || 'Não definido'}</p>
          <p><strong>Prioridade:</strong> ${sessao.prioridade || 'Não definida'}</p>
          <p><strong>Estado Emocional:</strong> ${sessao.emocao_detectada || 'Não registrado'}</p>
          <p><strong>Progresso:</strong> ${sessao.progresso || 50}%</p>
          <p><strong>Template:</strong> ${sessao.session_template || 'Padrão'}</p>
          <hr style="border-color: ${darkMode ? '#3d3d3d' : '#e0e0e0'};">
          <p><strong>Anotações:</strong></p>
          <div style="max-height: 200px; overflow-y: auto; padding: 10px; background: ${darkMode ? '#2d2d2d' : '#f5f5f5'}; border-radius: 5px; border: 1px solid ${darkMode ? '#3d3d3d' : '#e0e0e0'};">
            ${sessao.anotacoes || 'Nenhuma anotação'}
          </div>
          ${sessao.session_notes ? `
            <hr style="border-color: ${darkMode ? '#3d3d3d' : '#e0e0e0'}; margin: 15px 0;">
            <p><strong>Notas de Áudio:</strong></p>
            <div style="max-height: 150px; overflow-y: auto; padding: 10px; background: ${darkMode ? '#2d2d2d' : '#f5f5f5'}; border-radius: 5px; border: 1px solid ${darkMode ? '#3d3d3d' : '#e0e0e0'};">
              ${sessao.session_notes}
            </div>
          ` : ''}
        </div>
      `,
      width: isMobile ? '90%' : '700px',
      background: darkMode ? '#1e1e1e' : 'white',
      color: darkMode ? '#e0e0e0' : COLORS.preto,
      confirmButtonColor: COLORS.verdeMusgo,
      confirmButtonText: 'Fechar'
    });
  };

  const handleLogout = () => {
    showConfirm(
      'Sair do Sistema',
      'Deseja realmente sair do PsicoSync?',
      'Sim, Sair',
      'Cancelar'
    ).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('psicosync-login');
        sessionStorage.removeItem('psicosync-login');
        setIsAuthenticated(false);
        showAlert('Sessão Encerrada', 'Você saiu do sistema com segurança.', 'success');
      }
    });
  };

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      if (!mobile) setMobileMenuOpen(false);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setVoiceSupported(true);
      recognitionRef.current = new ((window as any).webkitSpeechRecognition || (window as any).SpeechRecognition)();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'pt-BR';
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSessionNotes(prev => prev + ' ' + transcript);
        showAlert('Nota de Áudio', 'Transcrição concluída!', 'success');
      };
      
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        showAlert('Erro', 'Erro ao gravar áudio. Tente novamente.', 'error');
        setIsRecording(false);
      };
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      carregarDados();
     
      const savedGoal = localStorage.getItem('psico-monthly-goal');
      if (savedGoal) {
        setMonthlyGoal(parseInt(savedGoal));
        setTempGoal(savedGoal);
      }
    }
  }, [isAuthenticated]);

  const carregarDados = async () => {
    try {
      const res = await databases.listDocuments<Sessao>(DB_ID, COLL_ID, [Query.orderDesc('$createdAt')]);
      setHistorico(res.documents);
    } catch (e) { 
      console.error("Erro ao carregar banco:", e);
      showAlert('Erro', 'Não foi possível carregar as sessões. Verifique sua conexão.', 'error');
    }
  };

  useEffect(() => {
    let timer: any;
    if (ativo && segundos > 0) {
      timer = setInterval(() => setSegundos(s => s - 1), 1000);
    } else if (segundos === 0 && ativo) {
      setAtivo(false);
      showAlert('Tempo Esgotado', 'O tempo da sessão terminou!', 'warning');
    }
    return () => clearInterval(timer);
  }, [ativo, segundos]);

  useEffect(() => {
    if (editingGoal && goalInputRef.current) {
      goalInputRef.current.focus();
      goalInputRef.current.select();
    }
  }, [editingGoal]);

  const finalizarSessao = async () => {
    if (!paciente.trim()) {
      showAlert('Atenção', 'Por favor, identifique o paciente.', 'warning');
      return;
    }
    
    setLoading(true);
    try {
      const sessionData = {
        paciente_nome: paciente,
        anotacoes: anotacoes,
        duracao: (50 * 60) - segundos,
        status: 'concluida',
        prioridade: emotionalState ? 'alta' : 'media',
        emocao_detectada: emotionalState,
        progresso: progressLevel,
        session_notes: sessionNotes,
        session_template: sessionTemplate,
        $createdAt: new Date().toISOString()
      };

      await databases.createDocument(DB_ID, COLL_ID, ID.unique(), sessionData);
      
      showAlert('Sucesso', 'Sessão arquivada com sucesso!', 'success');
      resetSessionForm();
      await carregarDados();
      setActiveTab('dashboard');
    } catch (e) { 
      showAlert('Erro', 'Não foi possível salvar a sessão. Verifique sua conexão.', 'error');
    }
    setLoading(false);
  };

  const resetSessionForm = () => {
    setPaciente('');
    setAnotacoes('');
    setSessionNotes('');
    setSegundos(50 * 60);
    setAtivo(false);
    setEmotionalState('');
    setProgressLevel(50);
    setSessionTemplate('padrao');
    setEditingSession(null);
  };

  const editarSessao = async (sessao: Sessao) => {
    setEditingSession(sessao);
    setPaciente(sessao.paciente_nome);
    setAnotacoes(sessao.anotacoes);
    setSessionNotes(sessao.session_notes || '');
    setEmotionalState(sessao.emocao_detectada || '');
    setProgressLevel(sessao.progresso || 50);
    setSessionTemplate(sessao.session_template || 'padrao');
    setActiveTab('sessao');
    setSegundos(50 * 60);
  };

  const salvarEdicao = async () => {
    if (!editingSession) return;
    
    setLoading(true);
    try {
      await databases.updateDocument(DB_ID, COLL_ID, editingSession.$id, {
        paciente_nome: paciente,
        anotacoes: anotacoes,
        emocao_detectada: emotionalState,
        progresso: progressLevel,
        session_notes: sessionNotes,
        session_template: sessionTemplate
      });
      
      showAlert('Sucesso', 'Sessão atualizada com sucesso!', 'success');
      setEditingSession(null);
      resetSessionForm();
      await carregarDados();
      setActiveTab('historico');
    } catch (e) {
      showAlert('Erro', 'Não foi possível atualizar a sessão.', 'error');
    }
    setLoading(false);
  };

  const excluirSessao = async (id: string, nome: string) => {
    const result = await showConfirm(
      'Excluir Sessão',
      `Tem certeza que deseja excluir a sessão de ${nome}? Esta ação não pode ser desfeita.`,
      'Excluir',
      'Cancelar'
    );
    
    if (result.isConfirmed) {
      try {
        await databases.deleteDocument(DB_ID, COLL_ID, id);
        showAlert('Sucesso', 'Sessão excluída com sucesso!', 'success');
        await carregarDados();
      } catch (e) {
        showAlert('Erro', 'Não foi possível excluir a sessão.', 'error');
      }
    }
  };

  const excluirMultiplasSessoes = async () => {
    if (selectedSessions.length === 0) return;
    
    const result = await showConfirm(
      'Excluir Múltiplas Sessões',
      `Deseja excluir ${selectedSessions.length} sessões selecionadas? Esta ação não pode ser desfeita.`,
      `Excluir ${selectedSessions.length} Sessões`,
      'Cancelar'
    );
    
    if (result.isConfirmed) {
      setLoading(true);
      try {
        for (const id of selectedSessions) {
          await databases.deleteDocument(DB_ID, COLL_ID, id);
        }
        showAlert('Sucesso', `${selectedSessions.length} sessões excluídas com sucesso!`, 'success');
        setSelectedSessions([]);
        await carregarDados();
      } catch (e) {
        showAlert('Erro', 'Não foi possível excluir as sessões.', 'error');
      }
      setLoading(false);
    }
  };

  const filteredHistorico = historico.filter(sessao => {
    const matchesSearch = sessao.paciente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sessao.anotacoes.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'todos' || sessao.status === filterStatus;
    const matchesPriority = filterPriority === 'todos' || sessao.prioridade === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const iniciarGravacaoAudio = () => {
    if (!voiceSupported) {
      showAlert('Não Suportado', 'Seu navegador não suporta gravação de áudio.', 'warning');
      return;
    }
    
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        showAlert('Gravando', 'Fale agora...', 'info');
      } catch (e) {
        showAlert('Erro', 'Não foi possível iniciar a gravação.', 'error');
      }
    }
  };

  const exportarDados = async (format: 'pdf' | 'csv' | 'json') => {
    const data = filteredHistorico;
    
    if (data.length === 0) {
      showAlert('Sem Dados', 'Não há dados para exportar.', 'warning');
      return;
    }
    
    let content = '';
    
    switch(format) {
      case 'csv':
        content = 'Data,Paciente,Duração,Status,Prioridade,Progresso,Emoção,Template\n';
        data.forEach(s => {
          content += `"${new Date(s.$createdAt).toLocaleDateString('pt-BR')}","${s.paciente_nome}","${Math.floor(s.duracao/60)}min","${s.status || 'N/A'}","${s.prioridade || 'N/A'}","${s.progresso || 0}%","${s.emocao_detectada || 'N/A'}","${s.session_template || 'padrao'}"\n`;
        });
        break;
      case 'json':
        content = JSON.stringify(data, null, 2);
        break;
      case 'pdf':
        showAlert('PDF', `Gerando PDF com ${data.length} sessões...`, 'info');
        return;
    }
    
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sessoes-psico-${new Date().toISOString().split('T')[0]}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    
    showAlert('Exportado', `Dados exportados com sucesso! (${data.length} sessões)`, 'success');
  };

  const toggleSessionSelection = (id: string) => {
    setSelectedSessions(prev => 
      prev.includes(id) 
        ? prev.filter(sId => sId !== id)
        : [...prev, id]
    );
  };

  const calcularEstatisticas = () => {
    const totalSessoes = historico.length;
    const totalHoras = historico.reduce((acc, s) => acc + s.duracao, 0) / 3600;
    const pacientesUnicos = [...new Set(historico.map(s => s.paciente_nome))].length;
    const mediaDuracao = totalSessoes > 0 ? totalHoras / totalSessoes : 0;
    const sessoesHoje = historico.filter(s => 
      new Date(s.$createdAt).toDateString() === new Date().toDateString()
    ).length;
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const sessoesEsteMes = historico.filter(s => {
      const sessaoDate = new Date(s.$createdAt);
      return sessaoDate.getMonth() === currentMonth && 
             sessaoDate.getFullYear() === currentYear;
    }).length;
    
    const progressoMensal = monthlyGoal > 0 ? (sessoesEsteMes / monthlyGoal) * 100 : 0;
    
    return {
      totalSessoes,
      totalHoras: totalHoras.toFixed(1),
      pacientesUnicos,
      mediaDuracao: mediaDuracao.toFixed(1),
      sessoesHoje,
      sessoesEsteMes,
      progressoMensal: progressoMensal.toFixed(1)
    };
  };

  const stats = calcularEstatisticas();

  const iniciarEdicaoMeta = () => {
    setTempGoal(monthlyGoal.toString());
    setEditingGoal(true);
  };

  const salvarMeta = () => {
    const novaMeta = parseInt(tempGoal);
    if (isNaN(novaMeta) || novaMeta <= 0) {
      showAlert('Erro', 'Por favor, insira um número válido maior que 0.', 'error');
      return;
    }
    
    setMonthlyGoal(novaMeta);
    localStorage.setItem('psico-monthly-goal', novaMeta.toString());
    setEditingGoal(false);
    showAlert('Meta Atualizada', `Meta mensal definida para ${novaMeta} sessões.`, 'success');
  };

  const cancelarEdicaoMeta = () => {
    setEditingGoal(false);
    setTempGoal(monthlyGoal.toString());
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('psico-dark-mode', newDarkMode.toString());
  };

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('psico-dark-mode');
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true');
    }
  }, []);

  const progressoBarra = Math.min(parseFloat(stats.progressoMensal), 100);

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} darkMode={darkMode} />;
  }

  return (
    <div style={{ 
      backgroundColor: darkMode ? '#121212' : COLORS.begeFundo, 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      color: darkMode ? '#e0e0e0' : COLORS.preto,
      transition: 'background-color 0.3s ease, color 0.3s ease'
    }}>
      
      {/* --- HEADER MOBILE --- */}
      {isMobile && (
        <header style={{ 
          backgroundColor: darkMode ? '#1e1e1e' : COLORS.cardBranco, 
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          borderBottom: `1px solid ${darkMode ? '#2d2d2d' : '#e0e0e0'}`
        }}>
          <div className="d-flex align-items-center gap-3">
            <Image src="/logo.jpeg" alt="Logo" width={40} height={40} className="rounded-3 shadow-sm" style={{ objectFit: 'cover' }} />
            <div>
              <h6 className="m-0 fw-bold" style={{ color: COLORS.terracota }}>PsicoSync</h6>
              <small style={{ color: darkMode ? '#a0a0a0' : '#666666', fontSize: '0.7rem' }}>Dra. Tatiane Oliveira</small>
            </div>
          </div>
          
          <div className="d-flex align-items-center gap-2">
            <button 
              className="btn p-2 position-relative" 
              onClick={() => setShowStatistics(!showStatistics)}
              style={{ color: darkMode ? '#e0e0e0' : COLORS.preto }}
            >
              <Bell size={20} />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn border-0 p-2"
              style={{ color: COLORS.terracota }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </header>
      )}

      {/* --- MENU DE NOTIFICAÇÕES --- */}
      <AnimatePresence>
        {showStatistics && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'absolute',
              top: isMobile ? '60px' : '20px',
              right: isMobile ? '20px' : '80px',
              width: isMobile ? '90%' : '350px',
              backgroundColor: darkMode ? '#1e1e1e' : 'white',
              borderRadius: '15px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              zIndex: 1001,
              padding: '1.5rem',
              border: `1px solid ${darkMode ? '#2d2d2d' : '#e0e0e0'}`
            }}
          >
            <h6 className="fw-bold mb-3" style={{ color: darkMode ? '#e0e0e0' : COLORS.preto }}>Estatísticas Rápidas</h6>
            <div className="row g-2 mb-3">
              <div className="col-6">
                <div className="p-3 rounded-3" style={{ backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo }}>
                  <small className="d-block opacity-50">Sessões Hoje</small>
                  <h4 className="fw-bold m-0" style={{ color: darkMode ? '#e0e0e0' : COLORS.preto }}>{stats.sessoesHoje}</h4>
                </div>
              </div>
              <div className="col-6">
                <div className="p-3 rounded-3" style={{ backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo }}>
                  <small className="d-block opacity-50">Média Duração</small>
                  <h4 className="fw-bold m-0" style={{ color: darkMode ? '#e0e0e0' : COLORS.preto }}>{stats.mediaDuracao}h</h4>
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-between">
              <button 
                className="btn btn-sm"
                onClick={() => setShowStatistics(false)}
                style={{ 
                  backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo,
                  color: darkMode ? '#e0e0e0' : COLORS.preto
                }}
              >
                Fechar
              </button>
              <button 
                className="btn btn-sm" 
                style={{ 
                  backgroundColor: COLORS.verdeMusgo, 
                  color: 'white'
                }}
                onClick={() => setActiveTab('dashboard')}
              >
                Ver Dashboard
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="d-flex flex-grow-1">
        {/* --- SIDEBAR DESKTOP --- */}
        {!isMobile && (
          <aside style={{ 
            width: '280px', 
            backgroundColor: darkMode ? '#1e1e1e' : COLORS.cardBranco, 
            boxShadow: '4px 0 15px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            padding: '2rem 1.2rem',
            position: 'fixed',
            height: '100vh',
            zIndex: 100,
            borderRight: `1px solid ${darkMode ? '#2d2d2d' : '#e0e0e0'}`
          }}>
            <div className="text-center mb-5" style={{ padding: '0 0.5rem' }}>
              <div className="d-flex flex-column align-items-center justify-content-center">
                <Image 
                  src="/logo.jpeg" 
                  alt="Logo" 
                  width={90} 
                  height={80} 
                  className="rounded-4 mb-3 shadow-sm" 
                  style={{ objectFit: 'cover' }} 
                />
                <h5 className="fw-bold mt-2 mb-2" style={{ color: COLORS.terracota }}>PsicoSync</h5>
                <div className="badge rounded-pill px-3 py-1 mb-3" style={{ 
                  backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo, 
                  color: COLORS.verdeMusgo, 
                  fontSize: '0.7rem',
                  fontWeight: 600
                }}>
                  DRA. TATIANE OLIVEIRA
                </div>
                
                {/* Dark Mode */}
                <button 
                  onClick={toggleDarkMode}
                  className="btn btn-sm mb-3 d-flex align-items-center gap-2 justify-content-center"
                  style={{ 
                    backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo,
                    color: darkMode ? '#e0e0e0' : COLORS.preto,
                    width: '100%',
                    border: `1px solid ${darkMode ? '#3d3d3d' : '#e0e0e0'}`
                  }}
                >
                  {darkMode ? <Eye size={16} /> : <EyeOff size={16} />}
                  {darkMode ? 'Modo Claro' : 'Modo Escuro'}
                </button>
              </div>
            </div>

            <nav className="d-flex flex-column gap-2 flex-grow-1">
              <MenuButton 
                active={activeTab === 'dashboard'} 
                onClick={() => setActiveTab('dashboard')} 
                icon={<LayoutDashboard size={20}/>} 
                label="Dashboard" 
                darkMode={darkMode}
              />
              <MenuButton 
                active={activeTab === 'sessao'} 
                onClick={() => {
                  setActiveTab('sessao');
                  setEditingSession(null);
                  resetSessionForm();
                }} 
                icon={<Timer size={20}/>} 
                label="Atendimento" 
                darkMode={darkMode}
              />
              <MenuButton 
                active={activeTab === 'historico'} 
                onClick={() => setActiveTab('historico')} 
                icon={<History size={20}/>} 
                label="Histórico" 
                darkMode={darkMode}
              />
              <MenuButton 
                active={false} 
                onClick={() => setShowStatistics(!showStatistics)} 
                icon={<BarChart3 size={20}/>} 
                label="Estatísticas" 
                darkMode={darkMode}
              />
              <MenuButton 
                active={false} 
                onClick={() => setShowQuickActions(!showQuickActions)} 
                icon={<Settings size={20}/>} 
                label="Configurações" 
                darkMode={darkMode}
              />
            </nav>

            <div className="mt-auto">
              <div className="mb-3">
                <small className="opacity-50 d-block mb-2" style={{ color: darkMode ? '#a0a0a0' : COLORS.preto }}>
                  Lembretes Automáticos
                </small>
                <select 
                  className="form-control form-control-sm"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  style={{ 
                    backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo,
                    border: `1px solid ${darkMode ? '#3d3d3d' : '#e0e0e0'}`,
                    color: darkMode ? '#e0e0e0' : COLORS.preto
                  }}
                >
                  <option value="5">5 minutos antes</option>
                  <option value="15">15 minutos antes</option>
                  <option value="30">30 minutos antes</option>
                  <option value="60">1 hora antes</option>
                </select>
              </div>
              
              <button 
                className="btn d-flex align-items-center gap-2 opacity-50 border-0 p-3 text-start w-100"
                onClick={handleLogout}
                style={{ color: darkMode ? '#a0a0a0' : COLORS.preto }}
              >
                <LogOut size={18} />
                <span className="fw-bold">Sair</span>
              </button>
            </div>
          </aside>
        )}

        {/* --- MENU MOBILE --- */}
        <AnimatePresence>
          {isMobile && mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  zIndex: 999,
                  backdropFilter: 'blur(2px)'
                }}
                onClick={() => setMobileMenuOpen(false)}
              />
              
              <motion.aside
                key="mobile-menu"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ 
                  type: 'tween',
                  duration: 0.3,
                  ease: 'easeOut'
                }}
                style={{ 
                  position: 'fixed',
                  top: 0,
                  right: 0,
                  width: '85%',
                  maxWidth: '320px',
                  height: '100vh',
                  backgroundColor: darkMode ? '#1e1e1e' : COLORS.cardBranco,
                  zIndex: 1000,
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
                  borderLeft: `1px solid ${darkMode ? '#2d2d2d' : '#e0e0e0'}`
                }}
              >
                {/* Cabeçalho do menu mobile */}
                <div style={{
                  padding: '1.5rem',
                  borderBottom: `1px solid ${darkMode ? '#2d2d2d' : COLORS.begeFundo}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div className="d-flex align-items-center gap-3">
                    <Image src="/logo.jpeg" alt="Logo" width={50} height={50} className="rounded-3 shadow-sm" style={{ objectFit: 'cover' }} />
                    <div>
                      <h6 className="m-0 fw-bold" style={{ color: COLORS.terracota }}>PsicoSync</h6>
                      <small style={{ color: darkMode ? '#a0a0a0' : COLORS.preto, opacity: 0.6, fontSize: '0.75rem' }}>
                        Dra. Tatiane Oliveira
                      </small>
                    </div>
                  </div>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn border-0 p-2"
                    style={{ color: COLORS.terracota }}
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Conteúdo do menu mobile */}
                <div style={{ 
                  padding: '1.5rem',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  overflowY: 'auto'
                }}>
                  <nav className="d-flex flex-column gap-2 flex-grow-1">
                    <MobileMenuButton 
                      active={activeTab === 'dashboard'} 
                      onClick={() => {
                        setActiveTab('dashboard');
                        setMobileMenuOpen(false);
                      }} 
                      icon={<LayoutDashboard size={22}/>} 
                      label="Dashboard" 
                      darkMode={darkMode}
                    />
                    <MobileMenuButton 
                      active={activeTab === 'sessao'} 
                      onClick={() => {
                        setActiveTab('sessao');
                        setMobileMenuOpen(false);
                        setEditingSession(null);
                        resetSessionForm();
                      }} 
                      icon={<Timer size={22}/>} 
                      label="Atendimento" 
                      darkMode={darkMode}
                    />
                    <MobileMenuButton 
                      active={activeTab === 'historico'} 
                      onClick={() => {
                        setActiveTab('historico');
                        setMobileMenuOpen(false);
                      }} 
                      icon={<History size={22}/>} 
                      label="Histórico" 
                      darkMode={darkMode}
                    />
                    
                    <div className="mt-4 pt-3 border-top" style={{ borderColor: darkMode ? '#2d2d2d' : COLORS.begeFundo }}>
                      <small className="opacity-50 d-block mb-2" style={{ color: darkMode ? '#a0a0a0' : COLORS.preto }}>
                        Configurações Rápidas
                      </small>
                      <button 
                        onClick={toggleDarkMode}
                        className="btn d-flex align-items-center gap-2 w-100 p-3 rounded-4 mb-2"
                        style={{ 
                          backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo,
                          color: darkMode ? '#e0e0e0' : COLORS.preto,
                          border: `1px solid ${darkMode ? '#3d3d3d' : '#e0e0e0'}`
                        }}
                      >
                        {darkMode ? <Eye size={18} /> : <EyeOff size={18} />}
                        {darkMode ? 'Modo Claro' : 'Modo Escuro'}
                      </button>
                    </div>
                  </nav>

                  <div style={{ 
                    marginTop: 'auto',
                    paddingTop: '1.5rem',
                    borderTop: `1px solid ${darkMode ? '#2d2d2d' : COLORS.begeFundo}`
                  }}>
                    <button className="btn d-flex align-items-center justify-content-center gap-2 w-100 p-3 rounded-4"
                            onClick={handleLogout}
                            style={{ 
                              backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo,
                              color: darkMode ? '#e0e0e0' : COLORS.preto,
                              border: `1px solid ${darkMode ? '#3d3d3d' : '#e0e0e0'}`
                            }}>
                      <LogOut size={20} />
                      <span className="fw-bold">Sair da Conta</span>
                    </button>
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showQuickActions && !isMobile && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              style={{
                position: 'fixed',
                top: '100px',
                left: '300px',
                width: '300px',
                backgroundColor: darkMode ? '#1e1e1e' : 'white',
                borderRadius: '15px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                zIndex: 1001,
                padding: '1.5rem',
                border: `1px solid ${darkMode ? '#2d2d2d' : '#e0e0e0'}`
              }}
            >
              <h6 className="fw-bold mb-3" style={{ color: darkMode ? '#e0e0e0' : COLORS.preto }}>Ações Rápidas</h6>
              <div className="d-grid gap-2">
                <button className="btn d-flex align-items-center gap-2 p-3 rounded-3" 
                        style={{ 
                          backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo,
                          color: darkMode ? '#e0e0e0' : COLORS.preto,
                          border: `1px solid ${darkMode ? '#3d3d3d' : '#e0e0e0'}`
                        }}
                        onClick={() => exportarDados('csv')}>
                  <Download size={18} /> Exportar CSV
                </button>
                <button className="btn d-flex align-items-center gap-2 p-3 rounded-3"
                        style={{ 
                          backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo,
                          color: darkMode ? '#e0e0e0' : COLORS.preto,
                          border: `1px solid ${darkMode ? '#3d3d3d' : '#e0e0e0'}`
                        }}
                        onClick={() => exportarDados('json')}>
                  <Printer size={18} /> Exportar JSON
                </button>
                <button className="btn d-flex align-items-center gap-2 p-3 rounded-3"
                        style={{ 
                          backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo,
                          color: darkMode ? '#e0e0e0' : COLORS.preto,
                          border: `1px solid ${darkMode ? '#3d3d3d' : '#e0e0e0'}`
                        }}
                        onClick={() => {
                          setSearchTerm('');
                          setFilterStatus('todos');
                          setFilterPriority('todos');
                          showAlert('Filtros Limpos', 'Todos os filtros foram resetados.', 'success');
                        }}>
                  <RefreshCw size={18} /> Limpar Filtros
                </button>
                <button className="btn d-flex align-items-center gap-2 p-3 rounded-3"
                        style={{ 
                          backgroundColor: selectedSessions.length > 0 ? COLORS.perigo : (darkMode ? '#2d2d2d' : COLORS.begeFundo),
                          color: selectedSessions.length > 0 ? 'white' : (darkMode ? '#e0e0e0' : COLORS.preto),
                          border: `1px solid ${darkMode ? '#3d3d3d' : '#e0e0e0'}`
                        }}
                        onClick={excluirMultiplasSessoes}
                        disabled={selectedSessions.length === 0}>
                  <Trash2 size={18} /> Excluir ({selectedSessions.length})
                </button>
              </div>
              <button 
                className="btn btn-sm w-100 mt-3"
                onClick={() => setShowQuickActions(false)}
                style={{ 
                  backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo,
                  color: darkMode ? '#e0e0e0' : COLORS.preto
                }}
              >
                Fechar
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- CONTEÚDO PRINCIPAL --- */}
        <main style={{ 
          marginLeft: isMobile ? 0 : '280px', 
          flex: 1, 
          padding: isMobile ? '1.5rem 1rem' : '2.5rem',
          width: '100%',
          maxWidth: '100%',
          overflowX: 'hidden'
        }}>
          <AnimatePresence mode="wait">
            
            {/* DASHBOARD */}
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard" 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 10 }} 
                transition={{ duration: 0.3 }}
              >
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 mb-md-5 gap-3">
                  <div className="flex-grow-1">
                    <h2 className="fw-bold mb-2" style={{ color: darkMode ? '#e0e0e0' : COLORS.preto }}>Painel de Controle</h2>
                    <p className="mb-0" style={{ 
                      color: darkMode ? '#a0a0a0' : COLORS.preto, 
                      opacity: 0.7 
                    }}>
                      Resumo completo das atividades clínicas
                    </p>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    <button className="btn d-flex align-items-center gap-2"
                            style={{ 
                              backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo,
                              color: darkMode ? '#e0e0e0' : COLORS.preto,
                              border: `1px solid ${darkMode ? '#3d3d3d' : '#e0e0e0'}`
                            }}
                            onClick={() => exportarDados('pdf')}>
                      <Download size={16} /> Relatório
                    </button>
                    <button className="btn d-flex align-items-center gap-2"
                            style={{ 
                              backgroundColor: COLORS.terracota,
                              color: 'white',
                              border: 'none'
                            }}
                            onClick={() => setActiveTab('sessao')}>
                      <Plus size={16} /> Nova Sessão
                    </button>
                  </div>
                </div>

                <div className="row g-3 g-md-4 mb-4">
                  <StatCard 
                    label="Total de Sessões" 
                    value={stats.totalSessoes} 
                    icon={<Clock3 size={24} color={COLORS.terracota}/>} 
                    trend="+12%"
                    darkMode={darkMode}
                  />
                  <StatCard 
                    label="Pacientes Únicos" 
                    value={stats.pacientesUnicos} 
                    icon={<Users size={24} color={COLORS.verdeMusgo}/>} 
                    trend="+5%"
                    darkMode={darkMode}
                  />
                  <StatCard 
                    label="Horas em Consulta" 
                    value={stats.totalHoras} 
                    icon={<Clock size={24} color={COLORS.info}/>} 
                    trend="+8%"
                    darkMode={darkMode}
                  />
                  <StatCard 
                    label="Sessões Hoje" 
                    value={stats.sessoesHoje} 
                    icon={<Calendar size={24} color={COLORS.sucesso}/>} 
                    darkMode={darkMode}
                  />
                </div>

                {/* Progresso Mensal */}
                <div className="card border-0 shadow-sm p-4 mb-4" style={{ 
                  backgroundColor: darkMode ? '#1e1e1e' : 'white',
                  borderRadius: '20px',
                  border: `1px solid ${darkMode ? '#2d2d2d' : '#e0e0e0'}`
                }}>
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 gap-2">
                    <h6 className="fw-bold m-0 d-flex align-items-center gap-2" style={{ color: darkMode ? '#e0e0e0' : COLORS.preto }}>
                      <Target size={20} color={COLORS.verdeMusgo} />
                      Progresso Mensal
                    </h6>
                    
                    {/* Controles de edição da meta */}
                    <div className="d-flex align-items-center gap-2">
                      {editingGoal ? (
                        <>
                          <div className="input-group input-group-sm" style={{ width: '120px' }}>
                            <input
                              ref={goalInputRef}
                              type="number"
                              className="form-control form-control-sm"
                              value={tempGoal}
                              onChange={(e) => setTempGoal(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') salvarMeta();
                                if (e.key === 'Escape') cancelarEdicaoMeta();
                              }}
                              min="1"
                              max="999"
                              style={{
                                backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo,
                                color: darkMode ? '#e0e0e0' : COLORS.preto,
                                border: `1px solid ${darkMode ? '#3d3d3d' : '#e0e0e0'}`,
                                fontSize: '0.85rem'
                              }}
                            />
                            <span className="input-group-text" style={{
                              backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo,
                              color: darkMode ? '#a0a0a0' : COLORS.preto,
                              border: `1px solid ${darkMode ? '#3d3d3d' : '#e0e0e0'}`,
                              fontSize: '0.85rem'
                            }}>
                              sessões
                            </span>
                          </div>
                          <button 
                            className="btn btn-sm d-flex align-items-center"
                            onClick={salvarMeta}
                            style={{
                              backgroundColor: COLORS.sucesso,
                              color: 'white',
                              padding: '0.25rem 0.5rem'
                            }}
                          >
                            <CheckCircle size={14} />
                          </button>
                          <button 
                            className="btn btn-sm d-flex align-items-center"
                            onClick={cancelarEdicaoMeta}
                            style={{
                              backgroundColor: darkMode ? '#3d3d3d' : COLORS.begeFundo,
                              color: darkMode ? '#e0e0e0' : COLORS.preto,
                              padding: '0.25rem 0.5rem'
                            }}
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="d-flex align-items-center gap-2">
                            <span style={{ 
                              color: darkMode ? '#a0a0a0' : COLORS.preto,
                              fontSize: '0.9rem',
                              fontWeight: 500
                            }}>
                              Meta: {monthlyGoal} sessões/mês
                            </span>
                            <button 
                              className="btn btn-sm p-1"
                              onClick={iniciarEdicaoMeta}
                              style={{
                                backgroundColor: 'transparent',
                                color: darkMode ? '#a0a0a0' : COLORS.preto
                              }}
                              title="Editar meta"
                            >
                              <Edit size={14} />
                            </button>
                          </div>
                          <TrendingUp size={20} color={COLORS.sucesso} />
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="progress" style={{ 
                    height: '12px', 
                    backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo,
                    borderRadius: '6px',
                    overflow: 'hidden'
                  }}>
                    <div 
                      className="progress-bar" 
                      role="progressbar" 
                      style={{ 
                        width: `${progressoBarra}%`, 
                        backgroundColor: progressoBarra >= 100 ? COLORS.sucesso : COLORS.verdeMusgo,
                        borderRadius: '6px',
                        transition: 'width 0.5s ease'
                      }}
                    ></div>
                  </div>
                  
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mt-3 gap-2">
                    <small style={{ 
                      color: darkMode ? '#a0a0a0' : COLORS.preto, 
                      opacity: 0.7,
                      fontSize: '0.85rem'
                    }}>
                      Concluídas: {stats.sessoesEsteMes} de {monthlyGoal} sessões
                    </small>
                    <small className="fw-bold" style={{ 
                      color: progressoBarra >= 100 ? COLORS.sucesso : 
                             progressoBarra >= 75 ? '#f59e0b' : 
                             progressoBarra >= 50 ? COLORS.verdeMusgo : COLORS.perigo,
                      fontSize: '0.95rem'
                    }}>
                      {progressoBarra}% ({stats.sessoesEsteMes}/{monthlyGoal})
                    </small>
                  </div>
                </div>

                <div className="row mt-4">
                  <div className="col-12 col-lg-6 mb-4 mb-lg-0">
                    <h5 className="fw-bold mb-3" style={{ color: darkMode ? '#e0e0e0' : COLORS.preto }}>Últimas Atividades</h5>
                    <div className="rounded-4 p-3 shadow-sm" style={{ 
                      backgroundColor: darkMode ? '#1e1e1e' : 'white',
                      border: `1px solid ${darkMode ? '#2d2d2d' : '#e0e0e0'}`
                    }}>
                      {historico.slice(0, 4).map((item, index) => (
                        <div key={index} className="d-flex align-items-center justify-content-between p-3 border-bottom last-border-0"
                             style={{ borderColor: darkMode ? '#2d2d2d' : 'rgba(0,0,0,0.05)' }}>
                          <div className="d-flex align-items-center gap-3 flex-grow-1">
                            <div className="p-2 rounded-circle d-flex align-items-center justify-content-center" 
                                 style={{ 
                                   backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo,
                                   minWidth: '40px' 
                                 }}>
                              <FileText size={18} color={COLORS.texto} />
                            </div>
                            <div className="flex-grow-1">
                              <p className="m-0 fw-bold" style={{ color: darkMode ? '#e0e0e0' : COLORS.preto }}>{item.paciente_nome}</p>
                              <small style={{ 
                                color: darkMode ? '#a0a0a0' : COLORS.preto, 
                                opacity: 0.6 
                              }}>
                                {new Date(item.$createdAt).toLocaleDateString('pt-BR')}
                              </small>
                            </div>
                          </div>
                          <button 
                            className="btn btn-sm p-1"
                            onClick={() => editarSessao(item)}
                            style={{ 
                              backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo,
                              color: darkMode ? '#e0e0e0' : COLORS.preto
                            }}
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="col-12 col-lg-6">
                    <h5 className="fw-bold mb-3" style={{ color: darkMode ? '#e0e0e0' : COLORS.preto }}>Pacientes em Destaque</h5>
                    <div className="rounded-4 p-3 shadow-sm" style={{ 
                      backgroundColor: darkMode ? '#1e1e1e' : 'white',
                      border: `1px solid ${darkMode ? '#2d2d2d' : '#e0e0e0'}`
                    }}>
                      {historico
                        .filter((_, i) => i < 3)
                        .map((item, index) => (
                          <div key={index} className="d-flex align-items-center justify-content-between p-3 border-bottom last-border-0"
                               style={{ borderColor: darkMode ? '#2d2d2d' : 'rgba(0,0,0,0.05)' }}>
                            <div className="d-flex align-items-center gap-3">
                              <div className="position-relative">
                                <div className="p-2 rounded-circle d-flex align-items-center justify-content-center"
                                     style={{ 
                                       backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo,
                                       width: '40px',
                                       height: '40px'
                                     }}>
                                  <User size={18} color={darkMode ? '#e0e0e0' : COLORS.preto} />
                                </div>
                                {item.prioridade === 'alta' && (
                                  <div className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-white rounded-circle"></div>
                                )}
                              </div>
                              <div>
                                <p className="m-0 fw-bold" style={{ color: darkMode ? '#e0e0e0' : COLORS.preto }}>{item.paciente_nome}</p>
                                <small style={{ 
                                  color: darkMode ? '#a0a0a0' : COLORS.preto, 
                                  opacity: 0.6 
                                }}>
                                  Progresso: {item.progresso || 50}%
                                </small>
                              </div>
                            </div>
                            <Star size={16} fill={index < 2 ? "#ffd700" : "none"} color="#ffd700" />
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ABA: SESSÃO ATIVA */}
            {activeTab === 'sessao' && (
              <motion.div 
                key="sessao" 
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.98 }}
              >
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
                  <div className="flex-grow-1">
                    <h2 className="fw-bold mb-2" style={{ color: darkMode ? '#e0e0e0' : COLORS.preto }}>
                      {editingSession ? 'Editando Sessão' : 'Nova Sessão'}
                    </h2>
                    <p className="mb-0" style={{ 
                      color: darkMode ? '#a0a0a0' : COLORS.preto, 
                      opacity: 0.7 
                    }}>
                      {editingSession ? `Editando sessão de ${editingSession.paciente_nome}` : 'Registre uma nova sessão de atendimento'}
                    </p>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    <button className="btn d-flex align-items-center gap-2"
                            onClick={() => {
                              const textToCopy = `Paciente: ${paciente}\nAnotações: ${anotacoes}\nTempo: ${Math.floor(segundos/60)}min`;
                              navigator.clipboard.writeText(textToCopy);
                              showAlert('Copiado', 'Resumo da sessão copiado!', 'success');
                            }}
                            style={{ 
                              backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo,
                              color: darkMode ? '#e0e0e0' : COLORS.preto,
                              border: `1px solid ${darkMode ? '#3d3d3d' : '#e0e0e0'}`
                            }}>
                      <Copy size={16} /> Copiar
                    </button>
                    {editingSession && (
                      <button className="btn d-flex align-items-center gap-2"
                              onClick={() => {
                                setEditingSession(null);
                                resetSessionForm();
                              }}
                              style={{ 
                                backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo,
                                color: darkMode ? '#e0e0e0' : COLORS.preto,
                                border: `1px solid ${darkMode ? '#3d3d3d' : '#e0e0e0'}`
                              }}>
                        Cancelar Edição
                      </button>
                    )}
                  </div>
                </div>

                <div className="row g-3 g-md-4">
                  {/* Coluna Esquerda - Controles */}
                  <div className="col-12 col-lg-4">
                    <div className="card border-0 shadow-lg p-3 p-md-4 text-center h-100" 
                         style={{ 
                           borderRadius: '25px', 
                           backgroundColor: darkMode ? '#1e1e1e' : 'white',
                           border: `1px solid ${darkMode ? '#2d2d2d' : '#e0e0e0'}`
                         }}>
                      
                      {/* Timer Section */}
                      <div className={`p-3 p-md-4 rounded-4 mb-4 transition-all ${ativo ? 'shadow-sm' : ''}`} 
                           style={{ 
                             backgroundColor: ativo ? (darkMode ? '#2d2d2d' : '#fff') : (darkMode ? '#2d2d2d' : '#fafafa'), 
                             border: ativo ? `2px solid ${COLORS.verdeMusgo}` : `2px solid ${darkMode ? '#3d3d3d' : '#e0e0e0'}`,
                           }}>
                        <small className="fw-bold d-block mb-2" style={{ 
                          color: darkMode ? '#a0a0a0' : COLORS.preto,
                          opacity: 0.5
                        }}>
                          CRONÔMETRO
                        </small>
                        <h1 className="display-4 display-md-3 fw-bold m-0" 
                            style={{ 
                              color: ativo ? COLORS.verdeMusgo : (darkMode ? '#e0e0e0' : COLORS.preto), 
                              fontVariantNumeric: 'tabular-nums',
                              fontSize: isMobile ? '3rem' : '4.5rem'
                            }}>
                          {Math.floor(segundos / 60)}:{(segundos % 60).toString().padStart(2, '0')}
                        </h1>
                      </div>

                      {/* Timer Controls */}
                      <div className="d-flex gap-2 mb-4">
                        <motion.button 
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setAtivo(!ativo)} 
                          className="btn btn-lg flex-grow-1 py-3 rounded-pill fw-bold border-0 shadow d-flex align-items-center justify-content-center gap-2"
                          style={{ 
                            backgroundColor: ativo ? '#ff7e67' : COLORS.terracota, 
                            color: 'white',
                            paddingLeft: '1.5rem',
                            paddingRight: '1.5rem'
                          }}
                        >
                          <div className="d-flex align-items-center justify-content-center" style={{ width: '20px', height: '20px' }}>
                            {ativo ? <Pause size={20} /> : <Play size={20} />}
                          </div>
                          <span>{ativo ? 'PAUSAR' : 'INICIAR'}</span>
                        </motion.button>
                        <button 
                          onClick={() => {
                            setSegundos(50 * 60);
                            showAlert('Timer Resetado', 'Cronômetro resetado para 50 minutos.', 'info');
                          }}
                          className="btn btn-lg p-3 rounded-pill fw-bold border-0 d-flex align-items-center justify-content-center"
                          style={{ 
                            backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo,
                            color: darkMode ? '#e0e0e0' : COLORS.preto,
                            border: `1px solid ${darkMode ? '#3d3d3d' : '#e0e0e0'}`,
                            width: '56px',
                            minWidth: '56px'
                          }}
                        >
                          <RefreshCw size={20} />
                        </button>
                      </div>

                      {/* Patient Info */}
                      <div className="text-start mb-4">
                        <label className="form-label small fw-bold mb-2" style={{ 
                          color: darkMode ? '#a0a0a0' : COLORS.preto,
                          opacity: 0.5
                        }}>
                          IDENTIFICAÇÃO DO PACIENTE
                        </label>
                        <input 
                          className="form-control form-control-lg border-0 rounded-4 p-3" 
                          placeholder="Nome do Paciente"
                          value={paciente}
                          onChange={e => setPaciente(e.target.value)}
                          style={{ 
                            backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo,
                            color: darkMode ? '#e0e0e0' : COLORS.preto,
                            border: `1px solid ${darkMode ? '#3d3d3d' : '#e0e0e0'}`
                          }}
                        />
                      </div>

                      {/* Emotional State */}
                      <div className="text-start mb-4">
                        <label className="form-label small fw-bold mb-2" style={{ 
                          color: darkMode ? '#a0a0a0' : COLORS.preto,
                          opacity: 0.5
                        }}>
                          ESTADO EMOCIONAL DETECTADO
                        </label>
                        <select 
                          className="form-control border-0 rounded-4 p-3"
                          value={emotionalState}
                          onChange={(e) => setEmotionalState(e.target.value)}
                          style={{ 
                            backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo,
                            color: darkMode ? '#e0e0e0' : COLORS.preto,
                            border: `1px solid ${darkMode ? '#3d3d3d' : '#e0e0e0'}`
                          }}
                        >
                          <option value="">Selecione...</option>
                          <option value="calmo">Calmo</option>
                          <option value="ansioso">Ansioso</option>
                          <option value="deprimido">Deprimido</option>
                          <option value="agressivo">Agressivo</option>
                          <option value="euforico">Eufórico</option>
                        </select>
                      </div>

                      {/* Progress Slider */}
                      <div className="text-start mb-4">
                        <label className="form-label small fw-bold mb-2 d-flex justify-content-between" style={{ 
                          color: darkMode ? '#a0a0a0' : COLORS.preto,
                          opacity: 0.5
                        }}>
                          <span>PROGRESSO DO PACIENTE</span>
                          <span style={{ color: COLORS.verdeMusgo }}>{progressLevel}%</span>
                        </label>
                        <input 
                          type="range" 
                          className="form-range" 
                          min="0" 
                          max="100" 
                          value={progressLevel}
                          onChange={(e) => setProgressLevel(parseInt(e.target.value))}
                          style={{ 
                            accentColor: COLORS.verdeMusgo
                          }}
                        />
                      </div>

                      {/* Template Selection */}
                      <div className="text-start">
                        <label className="form-label small fw-bold mb-2" style={{ 
                          color: darkMode ? '#a0a0a0' : COLORS.preto,
                          opacity: 0.5
                        }}>
                          MODELO DE SESSÃO
                        </label>
                        <select 
                          className="form-control border-0 rounded-4 p-3"
                          value={sessionTemplate}
                          onChange={(e) => setSessionTemplate(e.target.value)}
                          style={{ 
                            backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo,
                            color: darkMode ? '#e0e0e0' : COLORS.preto,
                            border: `1px solid ${darkMode ? '#3d3d3d' : '#e0e0e0'}`
                          }}
                        >
                          <option value="padrao">Padrão</option>
                          <option value="primeira">Primeira Consulta</option>
                          <option value="retorno">Retorno</option>
                          <option value="emergencia">Emergência</option>
                          <option value="avaliacao">Avaliação Psicológica</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Coluna Direita - Anotações */}
                  <div className="col-12 col-lg-8">
                    <div className="card border-0 shadow-lg p-4 p-md-5 d-flex flex-column h-100" 
                         style={{ 
                           borderRadius: '25px', 
                           minHeight: isMobile ? '70vh' : '80vh',
                           backgroundColor: darkMode ? '#1e1e1e' : 'white',
                           border: `1px solid ${darkMode ? '#2d2d2d' : '#e0e0e0'}`
                         }}>
                      
                      {/* Header */}
                      <div className="d-flex align-items-center gap-2 mb-4">
                        <div className="p-2 rounded-3 d-flex align-items-center justify-content-center" 
                             style={{ 
                               backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo,
                               minWidth: '40px',
                               border: `1px solid ${darkMode ? '#3d3d3d' : '#e0e0e0'}`
                             }}>
                          <ClipboardList size={20} color={COLORS.terracota}/>
                        </div>
                        <span className="fw-bold" style={{ 
                          letterSpacing: '1px',
                          fontSize: isMobile ? '0.9rem' : '1rem',
                          color: darkMode ? '#e0e0e0' : COLORS.preto
                        }}>
                          EVOLUÇÃO DO PACIENTE
                        </span>
                      </div>

                      {/* audio */}
                      <div className="mb-3">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-2 gap-2">
                          <small className="fw-bold" style={{ 
                            color: darkMode ? '#a0a0a0' : COLORS.preto,
                            opacity: 0.5
                          }}>
                            NOTAS DE ÁUDIO {!voiceSupported && '(Não suportado)'}
                          </small>
                          <button 
                            onClick={iniciarGravacaoAudio}
                            className="btn btn-sm d-flex align-items-center justify-content-center gap-1"
                            style={{ 
                              backgroundColor: isRecording ? COLORS.perigo : (darkMode ? '#2d2d2d' : COLORS.begeFundo),
                              color: isRecording ? 'white' : (darkMode ? '#e0e0e0' : COLORS.preto),
                              border: `1px solid ${darkMode ? '#3d3d3d' : '#e0e0e0'}`,
                              minWidth: '140px'
                            }}
                            disabled={!voiceSupported}
                          >
                            <div className="d-flex align-items-center justify-content-center" style={{ width: '16px', height: '16px' }}>
                              {isRecording ? <Pause size={16} /> : (voiceSupported ? <Volume2 size={16} /> : <VolumeX size={16} />)}
                            </div>
                            <span className="ms-1">
                              {isRecording ? 'Parar' : voiceSupported ? 'Gravar Áudio' : 'Não Suportado'}
                            </span>
                          </button>
                        </div>
                        <textarea 
                          className="form-control border-0 rounded-4 p-3 mb-2" 
                          style={{ 
                            backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo,
                            color: darkMode ? '#e0e0e0' : COLORS.preto,
                            minHeight: '80px',
                            fontSize: '0.9rem',
                            border: `1px solid ${darkMode ? '#3d3d3d' : '#e0e0e0'}`
                          }}
                          placeholder={voiceSupported 
                            ? "Clique no botão acima para gravar notas de áudio ou digite aqui..." 
                            : "Gravação de áudio não suportada neste navegador. Digite suas notas manualmente..."
                          }
                          value={sessionNotes}
                          onChange={(e) => setSessionNotes(e.target.value)}
                        ></textarea>
                      </div>

                      {/* Notas */}
                      <textarea 
                        className="form-control border-0 rounded-4 p-3 p-md-4 flex-grow-1 shadow-inner" 
                        style={{ 
                          resize: 'none', 
                          fontSize: isMobile ? '1rem' : '1.15rem', 
                          lineHeight: '1.6',
                          minHeight: '300px',
                          backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo,
                          color: darkMode ? '#e0e0e0' : COLORS.preto,
                          border: `1px solid ${darkMode ? '#3d3d3d' : '#e0e0e0'}`
                        }}
                        placeholder="Descreva detalhadamente a sessão: queixas, intervenções, observações, planos futuros..."
                        value={anotacoes}
                        onChange={e => setAnotacoes(e.target.value)}
                      ></textarea>

                      {/* Botões */}
                      <div className="d-flex flex-column flex-md-row gap-3 mt-4">
                        <motion.button 
                          whileHover={{ y: -2 }}
                          onClick={editingSession ? salvarEdicao : finalizarSessao}
                          disabled={loading || !paciente.trim()}
                          className="btn btn-lg py-3 rounded-pill fw-bold text-white shadow-lg border-0 flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                          style={{ 
                            backgroundColor: editingSession ? COLORS.info : COLORS.verdeMusgo,
                            opacity: (!paciente.trim() || loading) ? 0.6 : 1
                          }}
                        >
                          <div className="d-flex align-items-center justify-content-center" style={{ width: '20px', height: '20px' }}>
                            {loading ? (
                              <div className="spinner-border spinner-border-sm" role="status">
                                <span className="visually-hidden">Carregando...</span>
                              </div>
                            ) : editingSession ? <Save size={20} /> : <Check size={20} />}
                          </div>
                          <span>
                            {loading ? 'SALVANDO...' : 
                             editingSession ? 'ATUALIZAR SESSÃO' : 'FINALIZAR SESSÃO'}
                          </span>
                        </motion.button>
                        
                        <button 
                          onClick={async () => {
                            if (anotacoes.trim() || sessionNotes.trim()) {
                              const result = await showConfirm(
                                'Limpar Formulário',
                                'Tem certeza que deseja descartar todas as anotações?',
                                'Limpar',
                                'Cancelar'
                              );
                              
                              if (result.isConfirmed) {
                                resetSessionForm();
                                showAlert('Formulário Limpo', 'Todas as anotações foram descartadas.', 'info');
                              }
                            } else {
                              resetSessionForm();
                            }
                          }}
                          className="btn btn-lg py-3 rounded-pill fw-bold border-0 d-flex align-items-center justify-content-center"
                          style={{ 
                            backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo,
                            color: darkMode ? '#e0e0e0' : COLORS.preto,
                            border: `1px solid ${darkMode ? '#3d3d3d' : '#e0e0e0'}`,
                            minWidth: '120px'
                          }}
                        >
                          Limpar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ABA: HISTÓRICO COMPLETO */}
            {activeTab === 'historico' && (
              <motion.div 
                key="historico" 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 mb-md-5 gap-3">
                  <div className="flex-grow-1">
                    <h2 className="fw-bold mb-2" style={{ color: darkMode ? '#e0e0e0' : COLORS.preto }}>Histórico Clínico</h2>
                    <p className="mb-0" style={{ 
                      color: darkMode ? '#a0a0a0' : COLORS.preto, 
                      opacity: 0.7 
                    }}>
                      {filteredHistorico.length} sessões encontradas
                    </p>
                  </div>
                  
                  <div className="d-flex flex-wrap gap-2">
                    {selectedSessions.length > 0 && (
                      <button className="btn d-flex align-items-center gap-2"
                              onClick={excluirMultiplasSessoes}
                              style={{ 
                                backgroundColor: COLORS.perigo,
                                color: 'white',
                                border: 'none'
                              }}>
                        <Trash2 size={16} /> Excluir ({selectedSessions.length})
                      </button>
                    )}
                    
                    <div className="dropdown">
                      <button className="btn d-flex align-items-center gap-2 dropdown-toggle"
                              type="button"
                              data-bs-toggle="dropdown"
                              style={{ 
                                backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo,
                                color: darkMode ? '#e0e0e0' : COLORS.preto,
                                border: `1px solid ${darkMode ? '#3d3d3d' : '#e0e0e0'}`
                              }}>
                        <Download size={16} /> Exportar
                      </button>
                      <ul className="dropdown-menu" style={{ 
                        backgroundColor: darkMode ? '#1e1e1e' : 'white',
                        border: `1px solid ${darkMode ? '#2d2d2d' : '#e0e0e0'}`
                      }}>
                        <li>
                          <button className="dropdown-item" onClick={() => exportarDados('csv')} style={{ 
                            color: darkMode ? '#e0e0e0' : COLORS.preto,
                            backgroundColor: darkMode ? '#1e1e1e' : 'white'
                          }}>
                            CSV
                          </button>
                        </li>
                        <li>
                          <button className="dropdown-item" onClick={() => exportarDados('json')} style={{ 
                            color: darkMode ? '#e0e0e0' : COLORS.preto,
                            backgroundColor: darkMode ? '#1e1e1e' : 'white'
                          }}>
                            JSON
                          </button>
                        </li>
                        <li>
                          <button className="dropdown-item" onClick={() => exportarDados('pdf')} style={{ 
                            color: darkMode ? '#e0e0e0' : COLORS.preto,
                            backgroundColor: darkMode ? '#1e1e1e' : 'white'
                          }}>
                            PDF
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Filtros */}
                <div className="row g-3 mb-4">
                  <div className="col-12 col-md-6">
                    <div className="input-group">
                      <span className="input-group-text border-0" style={{ 
                        backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo,
                        border: `1px solid ${darkMode ? '#3d3d3d' : '#e0e0e0'}`,
                        color: darkMode ? '#e0e0e0' : COLORS.preto
                      }}>
                        <Search size={18} />
                      </span>
                      <input 
                        type="text" 
                        className="form-control border-0" 
                        placeholder="Buscar por paciente ou anotações..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ 
                          backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo,
                          color: darkMode ? '#e0e0e0' : COLORS.preto,
                          border: `1px solid ${darkMode ? '#3d3d3d' : '#e0e0e0'}`
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="col-6 col-md-3">
                    <select 
                      className="form-control border-0"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      style={{ 
                        backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo,
                        color: darkMode ? '#e0e0e0' : COLORS.preto,
                        border: `1px solid ${darkMode ? '#3d3d3d' : '#e0e0e0'}`
                      }}
                    >
                      <option value="todos">Todos Status</option>
                      <option value="concluida">Concluída</option>
                      <option value="pendente">Pendente</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </div>
                  
                  <div className="col-6 col-md-3">
                    <select 
                      className="form-control border-0"
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      style={{ 
                        backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo,
                        color: darkMode ? '#e0e0e0' : COLORS.preto,
                        border: `1px solid ${darkMode ? '#3d3d3d' : '#e0e0e0'}`
                      }}
                    >
                      <option value="todos">Todas Prioridades</option>
                      <option value="baixa">Baixa</option>
                      <option value="media">Média</option>
                      <option value="alta">Alta</option>
                    </select>
                  </div>
                </div>

                {/* Lista de Sessões */}
                <div className="d-flex flex-column gap-3">
                  {filteredHistorico.length === 0 ? (
                    <div className="text-center p-5" style={{ 
                      color: darkMode ? '#a0a0a0' : COLORS.preto, 
                      opacity: 0.5 
                    }}>
                      Nenhuma sessão encontrada com os filtros atuais
                    </div>
                  ) : (
                    filteredHistorico.map((sessao) => (
                      <motion.div 
                        key={sessao.$id}
                        whileHover={{ x: 5 }}
                        className="card border-0 shadow-sm p-3 p-md-4" 
                        style={{ 
                          borderRadius: '20px', 
                          backgroundColor: darkMode ? '#1e1e1e' : 'white',
                          border: `1px solid ${darkMode ? '#2d2d2d' : '#e0e0e0'}`,
                          opacity: selectedSessions.includes(sessao.$id) ? 0.7 : 1
                        }}
                      >
                        <div className="row align-items-center g-3">
                          {/* Checkbox Selection*/}
                          <div className="col-1 d-none d-md-block">
                            <input 
                              type="checkbox" 
                              className="form-check-input"
                              checked={selectedSessions.includes(sessao.$id)}
                              onChange={() => toggleSessionSelection(sessao.$id)}
                              style={{ 
                                width: '20px',
                                height: '20px',
                                cursor: 'pointer',
                                accentColor: COLORS.verdeMusgo
                              }}
                            />
                          </div>
                          
                          {/* Data */}
                          <div className="col-12 col-md-2 mb-2 mb-md-0">
                            <div className="badge p-2 px-3 rounded-pill w-100" 
                                 style={{ 
                                   backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo, 
                                   color: COLORS.terracota,
                                   fontSize: isMobile ? '0.8rem' : '0.9rem',
                                   border: `1px solid ${darkMode ? '#3d3d3d' : '#e0e0e0'}`
                                 }}>
                              {new Date(sessao.$createdAt).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                          
                          {/*Info */}
                          <div className="col-12 col-md-3 mb-2 mb-md-0">
                            <h6 className="fw-bold m-0" style={{ color: darkMode ? '#e0e0e0' : COLORS.preto }}>
                              <User size={16} className="me-2" />
                              {sessao.paciente_nome}
                            </h6>
                            <small className="d-flex align-items-center gap-1" style={{ 
                              color: darkMode ? '#a0a0a0' : COLORS.preto,
                              opacity: 0.6
                            }}>
                              <Clock size={14} />
                              {Math.floor(sessao.duracao / 60)} min
                              {sessao.prioridade && (
                                <span className={`badge ms-2 ${sessao.prioridade === 'alta' ? 'bg-danger' : sessao.prioridade === 'media' ? 'bg-warning' : 'bg-success'}`}>
                                  {sessao.prioridade}
                                </span>
                              )}
                            </small>
                          </div>
                          
                          {/* Notes Preview */}
                          <div className="col-12 col-md-4 d-none d-md-block">
                            <p className="m-0" style={{ 
                              color: darkMode ? '#e0e0e0' : COLORS.preto,
                              opacity: 0.8,
                              fontSize: isMobile ? '0.85rem' : '0.9rem',
                              lineHeight: '1.5'
                            }}>
                              {sessao.anotacoes?.substring(0, 100) || 'Sem notas extras.'}...
                            </p>
                          </div>
                          
                          <div className="col-12 col-md-2">
                            <div className="d-flex gap-2 justify-content-start justify-content-md-end">
                              {/* Checkbox para mobile */}
                              <div className="d-md-none">
                                <input 
                                  type="checkbox" 
                                  className="form-check-input"
                                  checked={selectedSessions.includes(sessao.$id)}
                                  onChange={() => toggleSessionSelection(sessao.$id)}
                                  style={{ 
                                    width: '20px',
                                    height: '20px',
                                    cursor: 'pointer',
                                    accentColor: COLORS.verdeMusgo
                                  }}
                                />
                              </div>
                              
                              <button 
                                className="btn btn-sm p-2 rounded-3"
                                onClick={() => editarSessao(sessao)}
                                style={{ 
                                  backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo,
                                  color: darkMode ? '#e0e0e0' : COLORS.preto,
                                  border: `1px solid ${darkMode ? '#3d3d3d' : '#e0e0e0'}`
                                }}
                                title="Editar"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                className="btn btn-sm p-2 rounded-3"
                                onClick={() => excluirSessao(sessao.$id, sessao.paciente_nome)}
                                style={{ 
                                  backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo,
                                  color: COLORS.perigo,
                                  border: `1px solid ${darkMode ? '#3d3d3d' : '#e0e0e0'}`
                                }}
                                title="Excluir"
                              >
                                <Trash2 size={16} />
                              </button>
                              <button 
                                className="btn btn-sm p-2 rounded-3"
                                onClick={() => showSessionDetails(sessao)}
                                style={{ 
                                  backgroundColor: darkMode ? '#2d2d2d' : COLORS.begeFundo,
                                  color: darkMode ? '#e0e0e0' : COLORS.preto,
                                  border: `1px solid ${darkMode ? '#3d3d3d' : '#e0e0e0'}`
                                }}
                                title="Detalhes"
                              >
                                <Eye size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}


function MenuButton({ active, onClick, icon, label, darkMode }: any) {
  return (
    <motion.button 
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="btn border-0 d-flex align-items-center gap-3 p-3 rounded-4 transition-all"
      style={{ 
        backgroundColor: active ? COLORS.terracota : 'transparent',
        color: active ? 'white' : (darkMode ? '#e0e0e0' : 'inherit'),
        textAlign: 'left'
      }}
    >
      <span style={{ opacity: active ? 1 : 0.7 }}>{icon}</span>
      <span className="fw-bold" style={{ fontSize: '0.95rem' }}>{label}</span>
    </motion.button>
  );
}

function MobileMenuButton({ active, onClick, icon, label, darkMode }: any) {
  return (
    <motion.button 
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="btn border-0 d-flex align-items-center gap-3 p-3 rounded-4 transition-all"
      style={{ 
        backgroundColor: active ? COLORS.terracota : 'transparent',
        color: active ? 'white' : (darkMode ? '#e0e0e0' : 'inherit'),
        textAlign: 'left',
        marginBottom: '0.5rem'
      }}
    >
      <span style={{ 
        opacity: active ? 1 : 0.7,
        width: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {icon}
      </span>
      <span className="fw-bold" style={{ fontSize: '1rem' }}>{label}</span>
    </motion.button>
  );
}

function StatCard({ label, value, icon, trend, darkMode }: any) {
  return (
    <div className="col-12 col-md-6 col-lg-3">
      <motion.div 
        whileHover={{ y: -5 }}
        className="card border-0 shadow-sm p-4 h-100" 
        style={{ 
          borderRadius: '20px', 
          backgroundColor: darkMode ? '#1e1e1e' : 'white',
          border: `1px solid ${darkMode ? '#2d2d2d' : '#e0e0e0'}`
        }}
      >
        <div className="d-flex align-items-center gap-4">
          <div className="p-3 rounded-4 d-flex align-items-center justify-content-center" 
               style={{ 
                 backgroundColor: darkMode ? '#2d2d2d' : 'rgba(255,255,255,0.1)', 
                 minWidth: '60px',
                 border: `1px solid ${darkMode ? '#3d3d3d' : '#e0e0e0'}`
               }}>
            {icon}
          </div>
          <div>
            <h2 className="fw-bold m-0 mb-1" style={{ color: darkMode ? '#e0e0e0' : COLORS.preto }}>{value}</h2>
            <div className="d-flex align-items-center gap-2">
              <small className="fw-bold text-uppercase" style={{ 
                fontSize: '0.75rem', 
                letterSpacing: '1px',
                color: darkMode ? '#a0a0a0' : COLORS.preto,
                opacity: 0.7
              }}>
                {label}
              </small>
              {trend && (
                <small className="badge" style={{ 
                  backgroundColor: trend.includes('+') ? '#10b981' : '#ef4444',
                  color: 'white',
                  fontSize: '0.6rem'
                }}>
                  {trend}
                </small>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}