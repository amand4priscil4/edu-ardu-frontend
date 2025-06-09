import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Dialog,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Paper,
  CircularProgress,
  Fab,
  AppBar,
  Toolbar,
  Chip,
  InputAdornment,
  Alert,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Send,
  Close,
  Psychology,
  Clear,
  Chat as ChatIcon,
  Wifi,
  WifiOff,
  Mic,
  MicOff,
  VolumeUp,
  VolumeOff
} from '@mui/icons-material';
import apiService, { wakeUpAPI, monitorAPIHealth } from '../services/apiService';
import voiceService from '../services/voiceService';

const ChatAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => 'session_' + Math.random().toString(36).substr(2, 9));
  const [apiStatus, setApiStatus] = useState({ isHealthy: false, checking: true });
  const [error, setError] = useState('');
  const [isWakingUp, setIsWakingUp] = useState(false);
  
  // Estados de voz
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [micPermission, setMicPermission] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [voiceSupport, setVoiceSupport] = useState({ recognition: false, synthesis: false });
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const formatTimestamp = useCallback((timestamp) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const addSystemMessage = useCallback((text, type = 'info') => {
    const systemMessage = {
      id: Date.now(),
      text,
      sender: 'system',
      timestamp: new Date(),
      type
    };
    setMessages(prev => [...prev, systemMessage]);
  }, []);

  const addWelcomeMessage = useCallback(() => {
    const welcomeMessage = {
      id: 'welcome',
      text: '👋 Olá! Eu sou o Edu-Ardu, seu robô assistente especializado em robótica! Você pode falar comigo usando o microfone ou escrever. Como posso te ajudar hoje? 🤖⚡',
      sender: 'ai',
      timestamp: new Date(),
      type: 'welcome'
    };
    setMessages([welcomeMessage]);
  }, []);

  // Inicialização de voz
  useEffect(() => {
    const initVoice = async () => {
      const support = voiceService.getStatus();
      setVoiceSupport(support.isSupported);
      
      if (support.isSupported.recognition) {
        const hasPermission = await voiceService.requestMicrophonePermission();
        setMicPermission(hasPermission);
        
        if (!hasPermission) {
          addSystemMessage('⚠️ Permissão de microfone negada. Você pode digitar normalmente!', 'warning');
        }
      }

      // Configura callback para texto parcial
      voiceService.onInterimResult = (text) => {
        setInterimText(text);
      };
    };

    if (isOpen) {
      initVoice();
    }
  }, [isOpen, addSystemMessage]);

  const handleWakeUpAPI = useCallback(async () => {
    setIsWakingUp(true);
    setError('Acordando API do Render... Isso pode levar até 30 segundos.');
    
    try {
      const success = await wakeUpAPI();
      if (success) {
        setApiStatus({ isHealthy: true, checking: false });
        setError('');
        addSystemMessage('✅ API conectada com sucesso!', 'success');
      } else {
        setError('Falha ao acordar a API. Tente novamente.');
      }
    } catch (error) {
      setError('Erro ao acordar API: ' + error.message);
    } finally {
      setIsWakingUp(false);
    }
  }, [addSystemMessage]);

  const checkAPIHealth = useCallback(async () => {
    setApiStatus({ isHealthy: false, checking: true });
    
    try {
      const health = await monitorAPIHealth();
      setApiStatus({
        isHealthy: health.isHealthy,
        checking: false,
        responseTime: health.responseTime
      });

      if (!health.isHealthy) {
        setError('API está offline. Tentando acordar...');
        await handleWakeUpAPI();
      }
    } catch (error) {
      setApiStatus({ isHealthy: false, checking: false });
      setError('Erro ao verificar status da API');
    }
  }, [handleWakeUpAPI]);

  const clearChat = useCallback(async () => {
    try {
      // Para qualquer fala em andamento
      voiceService.stopSpeaking();
      
      await apiService.clearChatHistory(sessionId);
      setMessages([]);
      addWelcomeMessage();
      setError('');
    } catch (error) {
      setError('Erro ao limpar conversa');
    }
  }, [sessionId, addWelcomeMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Monitora saúde da API ao abrir o chat
  useEffect(() => {
    if (isOpen) {
      checkAPIHealth();
      if (messages.length === 0) {
        addWelcomeMessage();
      }
    }
  }, [isOpen, checkAPIHealth, messages.length, addWelcomeMessage]);

  // Inicia gravação de voz
  const handleStartListening = async () => {
    if (!voiceSupport.recognition) {
      setError('Reconhecimento de voz não suportado neste navegador');
      return;
    }

    if (!micPermission) {
      setError('Permissão de microfone necessária');
      return;
    }

    try {
      setIsListening(true);
      setInterimText('');
      setError('');

      const transcript = await voiceService.startListening();
      
      if (transcript) {
        setCurrentMessage(transcript);
        setInterimText('');
        // Auto-enviar após 1 segundo (para criança não precisar clicar)
        setTimeout(() => {
          if (transcript.trim()) {
            handleSendMessage(transcript);
          }
        }, 1000);
      }
    } catch (error) {
      setError(error.message);
      setInterimText('');
    } finally {
      setIsListening(false);
    }
  };

  // Para gravação de voz
  const handleStopListening = () => {
    voiceService.stopListening();
    setIsListening(false);
    setInterimText('');
  };

  // Para/inicia fala
  const handleToggleSpeech = () => {
    if (isSpeaking) {
      voiceService.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setVoiceEnabled(!voiceEnabled);
    }
  };

  const handleSendMessage = async (messageText = null) => {
    const textToSend = messageText || currentMessage;
    if (!textToSend.trim() || isTyping) return;

    // Verifica se API está saudável
    if (!apiStatus.isHealthy) {
      setError('API não está disponível. Clique no ícone de WiFi para reconectar.');
      return;
    }

    const userMessage = {
      id: Date.now(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    if (!messageText) setCurrentMessage('');
    setIsTyping(true);
    setError('');

    try {
      const result = await apiService.sendChatMessage(
        textToSend,
        sessionId,
        'robotics_education'
      );

      if (result.success) {
        const aiMessage = {
          id: Date.now() + 1,
          text: result.data.response,
          sender: 'ai',
          timestamp: new Date(),
          model: result.data.model || 'AI Assistant',
          provider: result.data.provider
        };

        setMessages(prev => [...prev, aiMessage]);

        // Fala a resposta automaticamente se habilitado
        if (voiceEnabled && voiceSupport.synthesis) {
          try {
            setIsSpeaking(true);
            await voiceService.speak(result.data.response);
          } catch (voiceError) {
            console.warn('Erro na síntese de voz:', voiceError);
          } finally {
            setIsSpeaking(false);
          }
        }
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);

      const errorMessage = {
        id: Date.now() + 1,
        text: `Desculpe, houve um erro: ${error.message}. Tente novamente! 😊`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'error'
      };

      setMessages(prev => [...prev, errorMessage]);
      setError(error.message);
      
      // Re-verifica saúde da API em caso de erro
      checkAPIHealth();
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Componente para bolhas de mensagem otimizado
  const MessageBubble = useCallback(({ message }) => {
    const isUser = message.sender === 'user';
    const isSystem = message.sender === 'system';
    const isWelcome = message.type === 'welcome';
    const isError = message.type === 'error';
    const isSuccess = message.type === 'success';

    let backgroundColor = '#f5f5f5';
    let textColor = 'inherit';

    if (isUser) {
      backgroundColor = '#9C27B0';
      textColor = 'white';
    } else if (isSystem) {
      if (isSuccess) backgroundColor = '#E8F5E8';
      else if (isError) backgroundColor = '#FFEBEE';
      else backgroundColor = '#E3F2FD';
    } else if (isWelcome) {
      backgroundColor = '#E8F5E8';
    } else if (isError) {
      backgroundColor = '#FFEBEE';
    }

    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          mb: 2,
          px: 2
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            flexDirection: isUser ? 'row-reverse' : 'row',
            maxWidth: '80%'
          }}
        >
          {!isUser && (
            <Avatar
              sx={{
                bgcolor: isSystem 
                  ? (isSuccess ? '#4CAF50' : isError ? '#f44336' : '#2196F3')
                  : isWelcome ? '#4CAF50' 
                  : isError ? '#f44336' 
                  : '#9C27B0',
                width: 32,
                height: 32,
                mr: isUser ? 0 : 1,
                ml: isUser ? 1 : 0
              }}
            >
              <Psychology sx={{ fontSize: 18 }} />
            </Avatar>
          )}

          <Paper
            elevation={2}
            sx={{
              px: 2,
              py: 1.5,
              backgroundColor,
              color: textColor,
              borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              wordBreak: 'break-word'
            }}
          >
            <Typography variant="body1" sx={{ mb: 0.5 }}>
              {message.text}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                opacity: 0.7,
                display: 'block',
                textAlign: isUser ? 'right' : 'left'
              }}
            >
              {formatTimestamp(message.timestamp)}
              {message.model && ` • ${message.model}`}
              {message.provider && ` • ${message.provider}`}
            </Typography>
          </Paper>
        </Box>
      </Box>
    );
  }, [formatTimestamp]);

  // Componente para indicador de digitação otimizado
  const TypingIndicator = useCallback(() => (
    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2, px: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Avatar sx={{ bgcolor: '#9C27B0', width: 32, height: 32, mr: 1 }}>
          <Psychology sx={{ fontSize: 18 }} />
        </Avatar>
        <Paper
          elevation={1}
          sx={{
            px: 2,
            py: 1,
            backgroundColor: '#f5f5f5',
            borderRadius: '18px 18px 18px 4px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <CircularProgress size={16} sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {isSpeaking ? 'Falando...' : 'Processando...'}
          </Typography>
        </Paper>
      </Box>
    </Box>
  ), [isSpeaking]);

  return (
    <>
      {/* Botão flutuante */}
      <Fab
        color="secondary"
        onClick={() => setIsOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(135deg, #9C27B0 0%, #E91E63 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #7B1FA2 0%, #C2185B 100%)',
            transform: 'scale(1.1)',
          },
          transition: 'all 0.3s ease',
          zIndex: 1000
        }}
      >
        <ChatIcon />
      </Fab>

      {/* Modal de tela cheia */}
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        fullScreen
        PaperProps={{
          sx: {
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            m: 0,
            borderRadius: 0
          }
        }}
      >
        {/* Header */}
        <AppBar 
          position="static" 
          sx={{ 
            background: 'linear-gradient(135deg, #9C27B0 0%, #E91E63 100%)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}
        >
          <Toolbar>
            <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', mr: 2 }}>
              <Psychology />
            </Avatar>

            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" component="h1">
                Edu-Ardu 🤖 - Seu Robô Assistente
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  {apiStatus.checking ? 'Verificando conexão...' :
                   apiStatus.isHealthy ? 'Conectado' : 'Desconectado'}
                </Typography>
                {apiStatus.responseTime && (
                  <Chip 
                    label={`${apiStatus.responseTime}ms`} 
                    size="small" 
                    sx={{ 
                      height: 16, 
                      fontSize: '0.7rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white'
                    }} 
                  />
                )}
              </Box>
            </Box>

            {/* Controles de voz */}
            <FormControlLabel
              control={
                <Switch
                  checked={voiceEnabled}
                  onChange={(e) => setVoiceEnabled(e.target.checked)}
                  size="small"
                  sx={{ 
                    '& .MuiSwitch-switchBase.Mui-checked': { color: 'white' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: 'rgba(255,255,255,0.3)' }
                  }}
                />
              }
              label={
                <Typography variant="caption" sx={{ color: 'white' }}>
                  Voz
                </Typography>
              }
              sx={{ mr: 1 }}
            />

            <Tooltip title={isSpeaking ? "Parar fala" : voiceEnabled ? "Voz ativada" : "Voz desativada"}>
              <IconButton onClick={handleToggleSpeech} sx={{ color: 'white', mr: 1 }}>
                {isSpeaking ? <VolumeOff /> : voiceEnabled ? <VolumeUp /> : <VolumeOff />}
              </IconButton>
            </Tooltip>

            {/* Status da API */}
            <IconButton 
              onClick={checkAPIHealth} 
              sx={{ color: 'white', mr: 1 }}
              disabled={apiStatus.checking || isWakingUp}
              title="Verificar conexão da API"
            >
              {apiStatus.checking || isWakingUp ? (
                <CircularProgress size={20} sx={{ color: 'white' }} />
              ) : apiStatus.isHealthy ? (
                <Wifi />
              ) : (
                <WifiOff />
              )}
            </IconButton>

            <IconButton onClick={clearChat} sx={{ color: 'white', mr: 1 }} title="Limpar conversa">
              <Clear />
            </IconButton>

            <IconButton onClick={() => setIsOpen(false)} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Alert de erro */}
        {error && (
          <Alert 
            severity="warning" 
            onClose={() => setError('')}
            sx={{ m: 1 }}
            action={
              !apiStatus.isHealthy && (
                <IconButton
                  color="inherit"
                  size="small"
                  onClick={handleWakeUpAPI}
                  disabled={isWakingUp}
                >
                  {isWakingUp ? <CircularProgress size={16} /> : <Wifi />}
                </IconButton>
              )
            }
          >
            {error}
          </Alert>
        )}

        {/* Indicador de escuta */}
        {isListening && (
          <Box sx={{ 
            backgroundColor: '#E3F2FD', 
            p: 2, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderBottom: '1px solid #e0e0e0'
          }}>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography variant="body2" color="primary">
              🎤 Escutando... {interimText && `"${interimText}"`}
            </Typography>
          </Box>
        )}

        {/* Messages Area */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            py: 2,
            backgroundColor: '#fafafa',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {messages.map(message => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </Box>

        {/* Input Area */}
        <Box
          sx={{
            p: 2,
            backgroundColor: 'white',
            borderTop: '1px solid #e0e0e0',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
          }}
        >
          <TextField
            ref={inputRef}
            fullWidth
            multiline
            maxRows={4}
            value={currentMessage}
            onChange={e => setCurrentMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              apiStatus.isHealthy 
                ? "Digite ou fale sua mensagem..." 
                : "Conecte-se à API para enviar mensagens..."
            }
            disabled={isTyping || !apiStatus.isHealthy || isWakingUp}
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: voiceSupport.recognition && (
                <InputAdornment position="start">
                  <Tooltip title={isListening ? "Parar gravação (clique)" : micPermission ? "Gravar mensagem de voz" : "Permissão de microfone necessária"}>
                    <IconButton
                      onClick={isListening ? handleStopListening : handleStartListening}
                      disabled={!micPermission || isTyping || !apiStatus.isHealthy}
                      sx={{
                        color: isListening ? '#f44336' : micPermission ? '#4CAF50' : '#9E9E9E',
                        '&:hover': {
                          backgroundColor: isListening ? 'rgba(244, 67, 54, 0.1)' : 'rgba(76, 175, 80, 0.1)'
                        }
                      }}
                    >
                      {isListening ? <MicOff /> : <Mic />}
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => handleSendMessage()}
                    disabled={!currentMessage.trim() || isTyping || !apiStatus.isHealthy}
                    color="primary"
                    sx={{
                      backgroundColor: currentMessage.trim() && apiStatus.isHealthy ? '#9C27B0' : 'transparent',
                      color: currentMessage.trim() && apiStatus.isHealthy ? 'white' : 'inherit',
                      '&:hover': {
                        backgroundColor: currentMessage.trim() && apiStatus.isHealthy ? '#7B1FA2' : 'rgba(0, 0, 0, 0.04)'
                      }
                    }}
                  >
                    <Send sx={{ fontSize: 20 }} />
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                borderRadius: 3,
                backgroundColor: '#f8f9fa'
              }
            }}
          />

          {/* Status e instruções */}
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {voiceSupport.recognition 
                ? "🎤 Clique no microfone para falar • Enter para enviar" 
                : "Digite sua mensagem • Enter para enviar"}
              {!apiStatus.isHealthy && ' • API offline'}
            </Typography>
            
            {voiceSupport.synthesis && (
              <Typography variant="caption" color="text.secondary">
                {voiceEnabled ? "🔊 Respostas faladas" : "🔇 Só texto"}
              </Typography>
            )}
          </Box>

          {/* Indicadores de suporte */}
          {!voiceSupport.recognition && !voiceSupport.synthesis && (
            <Alert severity="info" sx={{ mt: 1 }}>
              Este navegador não suporta funcionalidades de voz. Use um navegador moderno como Chrome, Firefox ou Safari.
            </Alert>
          )}
        </Box>
      </Dialog>
    </>
  );
};

export default ChatAI;