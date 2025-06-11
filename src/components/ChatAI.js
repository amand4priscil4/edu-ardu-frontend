import React, { useState, useEffect, useRef } from 'react';

const ChatAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => 'session_' + Math.random().toString(36).substr(2, 9));

  // Estados TTS - Conecta diretamente no frontend
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [robotConnected, setRobotConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showTtsSettings, setShowTtsSettings] = useState(false);
  const [voiceConfig, setVoiceConfig] = useState({
    rate: 0.85,
    pitch: 0.8,
    volume: 1.0
  });
  const [ttsError, setTtsError] = useState('');
  const [lastSpokenMessage, setLastSpokenMessage] = useState('');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        id: 'welcome',
        text: '👋 Olá! Eu sou sua assistente de IA do Edu-Ardu. Posso ajudar com dúvidas sobre robótica, programação, eletrônica ou qualquer outro assunto. Minhas respostas podem ser faladas pelo robô automaticamente!',
        sender: 'ai',
        timestamp: new Date(),
        type: 'welcome'
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  // Verifica conexão com robô periodicamente
  useEffect(() => {
    if (isOpen && ttsEnabled) {
      checkRobotConnection();
      const interval = setInterval(checkRobotConnection, 15000); // A cada 15 segundos
      return () => clearInterval(interval);
    }
  }, [isOpen, ttsEnabled]);

  // ==================== FUNÇÕES TTS FRONTEND ====================

  const checkRobotConnection = async () => {
    try {
      const response = await fetch(`${https:/robot-mouth-pwa.vercel.app/}/api/health`, {
        method: 'GET',
        timeout: 5000
      });

      if (response.ok) {
        setRobotConnected(true);
        setTtsError('');
      } else {
        setRobotConnected(false);
        setTtsError('Robô não responde');
      }
    } catch (error) {
      setRobotConnected(false);
      setTtsError('Robô desconectado');
    }
  };

  const sendToRobot = async text => {
    if (!ttsEnabled || !text) return false;

    try {
      const payload = {
        text: text,
        config: voiceConfig,
        timestamp: new Date().toISOString(),
        source: 'edu-ardu-frontend'
      };

      const response = await fetch(`${ROBOT_TTS_URL}/api/speak`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'EduArdu-Frontend/1.0'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Mensagem enviada para robô:', result);

        setIsSpeaking(true);
        setLastSpokenMessage(text);
        setTtsError('');

        // Estima duração da fala (aproximadamente 150 palavras por minuto)
        const words = text.split(' ').length;
        const estimatedDuration = (words / 150) * 60 * 1000; // em ms
        const minDuration = 2000; // mínimo 2 segundos
        const maxDuration = 15000; // máximo 15 segundos

        const duration = Math.min(Math.max(estimatedDuration, minDuration), maxDuration);

        setTimeout(() => {
          setIsSpeaking(false);
        }, duration);

        return true;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Erro ao enviar para robô:', error);
      setTtsError(`Erro: ${error.message}`);
      setIsSpeaking(false);
      return false;
    }
  };

  const stopRobotSpeech = async () => {
    try {
      await fetch(`${ROBOT_TTS_URL}/api/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      setIsSpeaking(false);
      setTtsError('');
    } catch (error) {
      console.warn('Erro ao parar fala:', error);
    }
  };

  const repeatLastMessage = async () => {
    if (lastSpokenMessage) {
      await sendToRobot(lastSpokenMessage);
    }
  };

  const testRobotSpeech = async () => {
    const testText =
      'Olá! Este é um teste do sistema de voz do robô Edu-Ardu. Estou funcionando perfeitamente!';
    await sendToRobot(testText);
  };

  // ==================== FUNÇÃO PRINCIPAL DO CHAT ====================

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
    setTtsError('');

    try {
      // Envia para IA (backend)
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

      // Envia resposta da IA para o robô falar (frontend direto)
      if (ttsEnabled && response.data.response) {
        const ttsSuccess = await sendToRobot(response.data.response);

        // Atualiza status TTS na mensagem
        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiMessage.id ? { ...msg, ttsStatus: ttsSuccess ? 'sent' : 'failed' } : msg
          )
        );
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);

      const errorMessage = {
        id: Date.now() + 1,
        text: 'Desculpe, houve um erro ao processar sua mensagem. Tente novamente em alguns instantes.',
        sender: 'ai',
        timestamp: new Date(),
        type: 'error'
      };

      setMessages(prev => [...prev, errorMessage]);
      setTtsError('Erro na comunicação com IA');
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setTtsError('');
    setIsSpeaking(false);
    setLastSpokenMessage('');
  };

  const formatTimestamp = timestamp => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTTSStatusIcon = ttsStatus => {
    switch (ttsStatus) {
      case 'sent':
        return <CheckCircle fontSize="small" color="success" />;
      case 'failed':
        return <ErrorIcon fontSize="small" color="error" />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Botão flutuante para abrir chat */}
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
              background: 'linear-gradient(45deg, #1976D2 30%, #0288D1 90%)'
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
              <Typography variant="h6">Assistente IA + Robô</Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                <Chip size="small" label="Robótica" color="secondary" variant="outlined" />
                <Chip
                  size="small"
                  icon={robotConnected ? <VolumeUp /> : <VolumeOff />}
                  label={robotConnected ? 'Robô OK' : 'Robô Off'}
                  color={robotConnected ? 'success' : 'error'}
                  variant="filled"
                />
              </Box>
            </Box>

            <Tooltip title="Configurações TTS">
              <IconButton color="inherit" onClick={() => setShowTtsSettings(!showTtsSettings)}>
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
        {ttsError && (
          <Alert severity="warning" sx={{ m: 1 }} onClose={() => setTtsError('')}>
            {ttsError}
          </Alert>
        )}

        {/* Configurações TTS */}
        <Collapse in={showTtsSettings}>
          <Paper sx={{ m: 1, p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              🤖 Configurações do Robô
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={ttsEnabled}
                  onChange={e => setTtsEnabled(e.target.checked)}
                  color="primary"
                />
              }
              label="Ativar Fala do Robô"
            />

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="caption">Velocidade: {voiceConfig.rate}</Typography>
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
                <Typography variant="caption">Tom: {voiceConfig.pitch}</Typography>
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
                <Typography variant="caption">Volume: {voiceConfig.volume}</Typography>
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
                onClick={testRobotSpeech}
                disabled={!robotConnected}
              >
                Testar
              </Button>

              <Button
                size="small"
                variant="outlined"
                startIcon={<Stop />}
                onClick={stopRobotSpeech}
                disabled={!isSpeaking}
                color="error"
              >
                Parar
              </Button>

              <Button
                size="small"
                variant="outlined"
                startIcon={<Replay />}
                onClick={repeatLastMessage}
                disabled={!lastSpokenMessage || !robotConnected}
              >
                Repetir
              </Button>
            </Box>

            <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
              {robotConnected ? '✅ Conectado ao robô' : '❌ Robô desconectado'}
            </Typography>
          </Paper>
        </Collapse>

        {/* Área de mensagens */}
        <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
            {messages.map(message => (
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
                      bgcolor:
                        message.sender === 'user'
                          ? 'primary.main'
                          : message.type === 'error'
                          ? 'error.light'
                          : 'grey.100',
                      color: message.sender === 'user' ? 'white' : 'text.primary'
                    }}
                  >
                    <Typography variant="body2">{message.text}</Typography>

                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mt: 1
                      }}
                    >
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        {formatTimestamp(message.timestamp)}
                      </Typography>

                      {message.sender === 'ai' && (
                        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                          {ttsEnabled && getTTSStatusIcon(message.ttsStatus)}

                          {isSpeaking && message.id === messages[messages.length - 1]?.id && (
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
                        {isSpeaking ? 'IA pensando e robô falando...' : 'IA pensando...'}
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
              <Button size="small" variant="outlined" startIcon={<Clear />} onClick={clearChat}>
                Limpar
              </Button>

              {isSpeaking && (
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<Stop />}
                  onClick={stopRobotSpeech}
                >
                  Parar Robô
                </Button>
              )}

              <Button
                size="small"
                variant="outlined"
                startIcon={<VolumeUp />}
                onClick={checkRobotConnection}
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
              onChange={e => setCurrentMessage(e.target.value)}
              onKeyDown={e => {
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

            <Typography
              variant="caption"
              sx={{ mt: 1, display: 'block', textAlign: 'center', opacity: 0.7 }}
            >
              {ttsEnabled
                ? robotConnected
                  ? '🤖 Respostas serão faladas pelo robô'
                  : '⚠️ Robô desconectado'
                : 'Fala do robô desabilitada'}
            </Typography>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default ChatAI;
