import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Drawer,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Paper,
  Fade,
  CircularProgress,
  Fab,
  AppBar,
  Toolbar,
  Chip,
  InputAdornment,
  Switch,
  FormControlLabel,
  Tooltip,
  Alert,
  Button,
  Slider,
  Grid,
  Collapse
} from '@mui/material';
import {
  Send,
  Close,
  Psychology,
  Clear,
  Chat as ChatIcon,
  VolumeUp,
  VolumeOff,
  Stop,
  Replay,
  Settings,
  Mic
} from '@mui/icons-material';
import axios from 'axios';

// Constantes
const API_BASE_URL = 'http://localhost:3000';
const ROBOT_TTS_URL = 'https://robot-mouth-pwa.vercel.app';

// ==================== SERVIÇO TTS ====================
class RobotTTSService {
  constructor() {
    this.robotUrl = ROBOT_TTS_URL;
    this.isConnected = false;
    this.maxRetries = 3;
    this.timeout = 5000;
  }

  async checkConnection() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(`${this.robotUrl}/api/health`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      this.isConnected = response.ok;
      return this.isConnected;
    } catch (error) {
      this.isConnected = false;
      return false;
    }
  }

  async speak(text, config = {}) {
    if (!text || text.trim().length === 0) return false;

    const cleanText = this.cleanText(text);
    const payload = {
      text: cleanText,
      config: {
        rate: config.rate || 0.85,
        pitch: config.pitch || 0.8,
        volume: config.volume || 1.0
      },
      timestamp: new Date().toISOString(),
      source: 'edu-ardu-frontend'
    };

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(`${this.robotUrl}/api/speak`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'EduArdu-Frontend/1.0'
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          console.log(`✅ TTS enviado na tentativa ${attempt}`);
          return true;
        }
      } catch (error) {
        console.warn(`❌ Tentativa ${attempt} falhou:`, error.message);
        if (attempt < this.maxRetries) {
          await this.sleep(1000 * attempt);
        }
      }
    }
    
    return false;
  }

  async stop() {
    try {
      const response = await fetch(`${this.robotUrl}/api/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  cleanText(text) {
    return text
      .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
      .replace(/[*_`#]/g, '')
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '. ')
      .replace(/[.]{2,}/g, '.')
      .trim();
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  estimateSpeechDuration(text) {
    const words = text.split(' ').length;
    const duration = (words / 150) * 60 * 1000;
    return Math.min(Math.max(duration, 2000), 20000);
  }
}

// ==================== HOOK TTS ====================
function useRobotTTS() {
  const [ttsService] = useState(() => new RobotTTSService());
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState('');
  const [lastMessage, setLastMessage] = useState('');

  const checkConnection = async () => {
    const connected = await ttsService.checkConnection();
    setIsConnected(connected);
    setError(connected ? '' : 'Robô desconectado');
    return connected;
  };

  const speak = async (text, config) => {
    if (!text) return false;
    
    setIsSpeaking(true);
    setError('');
    setLastMessage(text);
    
    const success = await ttsService.speak(text, config);
    
    if (success) {
      const duration = ttsService.estimateSpeechDuration(text);
      setTimeout(() => setIsSpeaking(false), duration);
    } else {
      setIsSpeaking(false);
      setError('Falha ao enviar para robô');
    }
    
    return success;
  };

  const stop = async () => {
    const stopped = await ttsService.stop();
    setIsSpeaking(false);
    return stopped;
  };

  const repeat = async (config) => {
    if (lastMessage) {
      return await speak(lastMessage, config);
    }
    return false;
  };

  return { isConnected, isSpeaking, error, lastMessage, checkConnection, speak, stop, repeat };
}

// ==================== COMPONENTE PRINCIPAL ====================
const ChatAI = () => {
  // Estados principais
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => 'session_' + Math.random().toString(36).substr(2, 9));
  
  // Estados TTS
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [voiceConfig, setVoiceConfig] = useState({
    rate: 0.85,
    pitch: 0.8,
    volume: 1.0
  });

  // Hooks
  const robot = useRobotTTS();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Verificar conexão robô
  useEffect(() => {
    if (isOpen && ttsEnabled) {
      robot.checkConnection();
      const interval = setInterval(robot.checkConnection, 30000);
      return () => clearInterval(interval);
    }
  }, [isOpen, ttsEnabled, robot]);

  // Mensagem de boas vindas
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        id: 'welcome',
        text: '👋 Olá! Eu sou sua assistente de IA do Edu-Ardu. Posso ajudar com dúvidas sobre robótica, programação, eletrônica e muito mais. Minhas respostas serão faladas pelo robô automaticamente!',
        sender: 'ai',
        timestamp: new Date(),
        type: 'welcome'
      };
      setMessages([welcomeMessage]);
      
      if (ttsEnabled) {
        setTimeout(() => robot.speak(welcomeMessage.text, voiceConfig), 1000);
      }
    }
  }, [isOpen, ttsEnabled, robot, voiceConfig, messages.length]);

  // ==================== FUNÇÃO PRINCIPAL ====================
  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: currentMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = currentMessage;
    setCurrentMessage('');
    setIsTyping(true);

    try {
      // Chama API da IA
      const response = await axios.post(`${API_BASE_URL}/api/ai/chat`, {
        message: messageText,
        sessionId: sessionId,
        context: 'robotics_education'
      });

      const aiMessage = {
        id: Date.now() + 1,
        text: response.data.response,
        sender: 'ai',
        timestamp: new Date(),
        model: response.data.model || 'AI Assistant',
        ttsStatus: 'pending'
      };

      setMessages(prev => [...prev, aiMessage]);

      // Enviar para robô falar
      if (ttsEnabled && response.data.response) {
        const ttsSuccess = await robot.speak(response.data.response, voiceConfig);
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessage.id 
            ? { ...msg, ttsStatus: ttsSuccess ? 'sent' : 'failed' }
            : msg
        ));
      }

    } catch (error) {
      console.error('Erro:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Desculpe, houve um erro ao processar sua mensagem. Verifique sua conexão e tente novamente.',
        sender: 'ai',
        timestamp: new Date(),
        type: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // ==================== FUNÇÕES AUXILIARES ====================
  const clearChat = () => {
    setMessages([]);
    robot.stop();
  };

  const testRobot = async () => {
    const testMessage = 'Olá! Este é um teste do sistema de voz do robô Edu-Ardu. Estou funcionando perfeitamente!';
    await robot.speak(testMessage, voiceConfig);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTTSIcon = (ttsStatus) => {
    switch (ttsStatus) {
      case 'sent': return '🔊';
      case 'failed': return '❌';
      case 'pending': return '⏳';
      default: return '';
    }
  };

  // ==================== RENDER ====================
  return (
    <>
      {/* Botão flutuante */}
      {!isOpen && (
        <Fab
          color="primary"
          aria-label="chat"
          onClick={() => setIsOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #1976D2 30%, #0288D1 90%)',
            }
          }}
        >
          <ChatIcon />
        </Fab>
      )}

      {/* Drawer do Chat */}
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 400, md: 450 } }
        }}
      >
        {/* Header do Chat */}
        <AppBar position="static" elevation={0}>
          <Toolbar>
            <Avatar sx={{ mr: 2, bgcolor: 'white', color: 'primary.main' }}>
              <Psychology />
            </Avatar>
            
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6">
                IA + Robô Edu-Ardu
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                <Chip
                  size="small"
                  label="Robótica"
                  color="secondary"
                  variant="outlined"
                />
                <Chip
                  size="small"
                  icon={robot.isConnected ? <VolumeUp /> : <VolumeOff />}
                  label={robot.isConnected ? 'Robô OK' : 'Robô Off'}
                  color={robot.isConnected ? 'success' : 'error'}
                  variant="filled"
                />
              </Box>
            </Box>

            <Tooltip title="Configurações TTS">
              <IconButton 
                color="inherit" 
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Fechar">
              <IconButton color="inherit" onClick={() => setIsOpen(false)}>
                <Close />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        {/* Alerta de erro TTS */}
        {robot.error && (
          <Alert 
            severity="warning" 
            sx={{ m: 1 }}
            onClose={() => robot.setError && robot.setError('')}
          >
            {robot.error}
          </Alert>
        )}

        {/* Configurações TTS */}
        <Collapse in={showSettings}>
          <Paper sx={{ m: 1, p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              🎛️ Configurações do Robô
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={ttsEnabled}
                  onChange={(e) => setTtsEnabled(e.target.checked)}
                  color="primary"
                />
              }
              label="Ativar fala do robô"
            />

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="caption">
                  Velocidade: {voiceConfig.rate}
                </Typography>
                <Slider
                  value={voiceConfig.rate}
                  onChange={(_, value) => setVoiceConfig(prev => ({ ...prev, rate: value }))}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="caption">
                  Tom: {voiceConfig.pitch}
                </Typography>
                <Slider
                  value={voiceConfig.pitch}
                  onChange={(_, value) => setVoiceConfig(prev => ({ ...prev, pitch: value }))}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="caption">
                  Volume: {voiceConfig.volume}
                </Typography>
                <Slider
                  value={voiceConfig.volume}
                  onChange={(_, value) => setVoiceConfig(prev => ({ ...prev, volume: value }))}
                  min={0.1}
                  max={1.0}
                  step={0.1}
                  size="small"
                />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<VolumeUp />}
                onClick={testRobot}
                disabled={!robot.isConnected}
              >
                Testar
              </Button>
              
              <Button
                size="small"
                variant="outlined"
                startIcon={<Stop />}
                onClick={robot.stop}
                disabled={!robot.isSpeaking}
                color="error"
              >
                Parar
              </Button>

              <Button
                size="small"
                variant="outlined"
                startIcon={<Replay />}
                onClick={() => robot.repeat(voiceConfig)}
                disabled={!robot.lastMessage || !robot.isConnected}
              >
                Repetir
              </Button>
            </Box>

            <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
              {robot.isConnected ? '✅ Conectado ao robô' : '❌ Robô desconectado'}
            </Typography>
          </Paper>
        </Collapse>

        {/* Área de mensagens */}
        <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
            {messages.map((message) => (
              <Fade in key={message.id}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                    mb: 1
                  }}
                >
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      maxWidth: '85%',
                      bgcolor: message.sender === 'user' 
                        ? 'primary.main' 
                        : message.type === 'error' 
                          ? 'error.light'
                          : 'grey.100',
                      color: message.sender === 'user' ? 'white' : 'text.primary'
                    }}
                  >
                    <Typography variant="body2">
                      {message.text}
                    </Typography>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mt: 1 
                    }}>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        {formatTimestamp(message.timestamp)}
                      </Typography>
                      
                      {message.sender === 'ai' && ttsEnabled && (
                        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                          {getTTSIcon(message.ttsStatus)}
                          
                          {robot.isSpeaking && message.id === messages[messages.length - 1]?.id && (
                            <Chip 
                              size="small" 
                              icon={<Mic />} 
                              label="Falando"
                              color="primary"
                              variant="filled"
                              sx={{ fontSize: '10px' }}
                            />
                          )}
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </Box>
              </Fade>
            ))}

            {/* Indicador de digitação */}
            {isTyping && (
              <Fade in>
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
                  <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.100' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={16} />
                      <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                        {robot.isSpeaking ? 'IA pensando e robô falando...' : 'IA pensando...'}
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              </Fade>
            )}

            <div ref={messagesEndRef} />
          </Box>

          {/* Área de input */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Clear />}
                onClick={clearChat}
              >
                Limpar
              </Button>
              
              {robot.isSpeaking && (
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<Stop />}
                  onClick={robot.stop}
                >
                  Parar Robô
                </Button>
              )}

              <Button
                size="small"
                variant="outlined"
                startIcon={<VolumeUp />}
                onClick={robot.checkConnection}
              >
                Testar Robô
              </Button>
            </Box>

            <TextField
              ref={inputRef}
              fullWidth
              multiline
              maxRows={3}
              placeholder="Digite sua pergunta sobre robótica, programação..."
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isTyping}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={handleSendMessage}
                      disabled={isTyping || !currentMessage.trim()}
                      color="primary"
                    >
                      <Send />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'center', opacity: 0.7 }}>
              {ttsEnabled 
                ? (robot.isConnected ? '🤖 Respostas serão faladas pelo robô' : '⚠️ Robô desconectado') 
                : 'Fala do robô desabilitada'
              }
            </Typography>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

// ==================== FUNÇÕES DE DEBUG GLOBAIS ====================
window.testRobotTTS = async (text) => {
  const tts = new RobotTTSService();
  const connected = await tts.checkConnection();
  
  if (connected) {
    console.log('🧪 Testando TTS:', text);
    const success = await tts.speak(text || 'Teste do robô Edu-Ardu');
    console.log(success ? '✅ Sucesso' : '❌ Falhou');
  } else {
    console.log('❌ Robô desconectado');
  }
};

window.checkRobotStatus = async () => {
  const tts = new RobotTTSService();
  const connected = await tts.checkConnection();
  console.log('🤖 Robô:', connected ? 'Conectado ✅' : 'Desconectado ❌');
  return connected;
};

window.checkAllSystems = async () => {
  console.log('🔍 Verificando todas as conexões...\n');
  
  const results = {
    backend: false,
    robotTTS: false,
    ai: false
  };

  // Backend
  try {
    const backendResponse = await fetch(`${API_BASE_URL}/health`);
    results.backend = backendResponse.ok;
    console.log(results.backend ? '✅ Backend: CONECTADO' : '❌ Backend: FALHA');
  } catch (error) {
    console.log('❌ Backend: ERRO -', error.message);
  }

  // Robot TTS
  try {
    const robotResponse = await fetch(`${ROBOT_TTS_URL}/api/health`);
    results.robotTTS = robotResponse.ok;
    console.log(results.robotTTS ? '✅ PWA Robô: CONECTADO' : '❌ PWA Robô: FALHA');
  } catch (error) {
    console.log('❌ PWA Robô: ERRO -', error.message);
  }

  // IA
  try {
    const aiResponse = await fetch(`${API_BASE_URL}/api/ai/status`);
    results.ai = aiResponse.ok;
    console.log(results.ai ? '✅ IA: CONECTADA' : '❌ IA: FALHA');
  } catch (error) {
    console.log('❌ IA: ERRO -', error.message);
  }

  const connected = Object.values(results).filter(Boolean).length;
  console.log(`\n📊 RESUMO: ${connected}/3 sistemas conectados`);
  
  return results;
};

window.testFullFlow = async () => {
  console.log('🧪 Testando fluxo completo: Chat IA → TTS Robô\n');

  try {
    // Teste IA
    console.log('1️⃣ Testando resposta da IA...');
    const aiResponse = await axios.post(`${API_BASE_URL}/api/ai/chat`, {
      message: 'Olá, este é um teste do sistema completo',
      sessionId: 'test_' + Date.now(),
      context: 'robotics_education'
    });

    console.log('✅ IA respondeu:', aiResponse.data.response.substring(0, 100) + '...');

    // Teste TTS
    console.log('2️⃣ Enviando resposta da IA para o robô falar...');
    const ttsResponse = await fetch(`${ROBOT_TTS_URL}/api/speak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: aiResponse.data.response,
        config: { rate: 0.85, pitch: 0.8, volume: 1.0 },
        source: 'test-full-flow'
      })
    });

    if (!ttsResponse.ok) throw new Error('TTS rejeitou comando');

    const ttsData = await ttsResponse.json();
    console.log('✅ TTS aceito:', ttsData.message);

    console.log('\n🎉 TESTE COMPLETO BEM-SUCEDIDO!');
    console.log('💬 A IA respondeu e o robô deve estar falando agora');

    return { success: true, aiResponse: aiResponse.data.response };

  } catch (error) {
    console.log('\n❌ TESTE FALHOU:', error.message);
    return { success: false, error: error.message };
  }
};

// Log de inicialização
console.log(`
🚀 CHAT IA + TTS ROBÔ CARREGADO
===============================

✅ Material-UI components imported
✅ Axios configured
✅ TTS automático funcional
✅ Interface responsiva completa

Funções de teste no console:
- testRobotTTS('seu texto aqui')
- checkRobotStatus()
- checkAllSystems()
- testFullFlow()

🎯 Sistema pronto para uso!
`);

export default ChatAI;