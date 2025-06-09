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
  InputAdornment
} from '@mui/material';
import {
  Send,
  Close,
  Psychology,
  Clear,
  Chat as ChatIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const ChatAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => 'session_' + Math.random().toString(36).substr(2, 9));
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
      // Mensagem de boas-vindas quando abre pela primeira vez
      const welcomeMessage = {
        id: 'welcome',
        text: '👋 Olá! Eu sou sua assistente de IA. Posso ajudar com dúvidas sobre robótica, programação, eletrônica ou qualquer outro assunto. Como posso te ajudar hoje?',
        sender: 'ai',
        timestamp: new Date(),
        type: 'welcome'
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: currentMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/ai/chat`, {
        message: currentMessage,
        sessionId: sessionId,
        context: 'robotics_education' // Contexto para focar em robótica
      });

      const aiMessage = {
        id: Date.now() + 1,
        text: response.data.response,
        sender: 'ai',
        timestamp: new Date(),
        model: response.data.model || 'AI Assistant'
      };

      setMessages(prev => [...prev, aiMessage]);
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
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const MessageBubble = ({ message }) => {
    const isAI = message.sender === 'ai';

    return (
      <Fade in timeout={300}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: isAI ? 'flex-start' : 'flex-end',
            mb: 2,
            px: 2
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              maxWidth: '80%',
              ...(isAI ? {} : { flexDirection: 'row-reverse' })
            }}
          >
            {/* Avatar */}
            {isAI && (
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  mr: 1,
                  backgroundColor: message.type === 'error' ? '#f44336' : '#9C27B0'
                }}
              >
                <Psychology sx={{ fontSize: 18 }} />
              </Avatar>
            )}

            {/* Message Bubble */}
            <Paper
              elevation={2}
              sx={{
                backgroundColor: isAI
                  ? message.type === 'error'
                    ? '#ffebee'
                    : '#f5f5f5'
                  : 'linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)',
                color: isAI ? '#333' : 'white',
                borderRadius: isAI ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
                px: 2,
                py: 1.5,
                position: 'relative',
                border: message.type === 'welcome' ? '2px solid #9C27B0' : 'none'
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  lineHeight: 1.4,
                  whiteSpace: 'pre-wrap',
                  fontSize: '0.9rem'
                }}
              >
                {message.text}
              </Typography>

              {/* Timestamp */}
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.7,
                  fontSize: '0.7rem',
                  display: 'block',
                  textAlign: 'right',
                  mt: 0.5
                }}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Typography>

              {/* Model info for AI messages */}
              {isAI && message.model && (
                <Chip
                  label={message.model}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: 8,
                    fontSize: '0.6rem',
                    height: 16
                  }}
                />
              )}
            </Paper>
          </Box>
        </Box>
      </Fade>
    );
  };

  const TypingIndicator = () => (
    <Fade in>
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, mb: 2 }}>
        <Avatar
          sx={{
            width: 32,
            height: 32,
            mr: 1,
            backgroundColor: '#9C27B0'
          }}
        >
          <Psychology sx={{ fontSize: 18 }} />
        </Avatar>
        <Paper
          sx={{
            backgroundColor: '#f5f5f5',
            borderRadius: '18px 18px 18px 4px',
            px: 2,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <CircularProgress size={12} />
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
            Pensando...
          </Typography>
        </Paper>
      </Box>
    </Fade>
  );

  const clearChat = () => {
    setMessages([]);
    setCurrentMessage('');
  };

  return (
    <>
      {/* Floating Action Button */}
      <Fab
        color="secondary"
        onClick={() => setIsOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: '#9C27B0',
          '&:hover': {
            backgroundColor: '#7B1FA2',
            transform: 'scale(1.1)'
          },
          transition: 'all 0.2s ease',
          zIndex: 1000,
          boxShadow: '0 8px 32px rgba(156, 39, 176, 0.3)'
        }}
      >
        <ChatIcon />
      </Fab>

      {/* Chat Drawer */}
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 400, md: 450 },
            backgroundColor: '#fafafa'
          }
        }}
      >
        {/* Header */}
        <AppBar
          position="static"
          elevation={0}
          sx={{
            backgroundColor: '#9C27B0',
            color: 'white'
          }}
        >
          <Toolbar sx={{ minHeight: 64 }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                mr: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.2)'
              }}
            >
              <Psychology />
            </Avatar>

            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Assistente IA
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Pronto para ajudar com suas dúvidas
              </Typography>
            </Box>

            <IconButton onClick={clearChat} sx={{ color: 'white', mr: 1 }} title="Limpar conversa">
              <Clear />
            </IconButton>

            <IconButton onClick={() => setIsOpen(false)} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Messages Area */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            py: 2,
            backgroundColor: 'white',
            minHeight: 'calc(100vh - 128px)'
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
            borderTop: '1px solid #e0e0e0'
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
            placeholder="Digite sua mensagem..."
            disabled={isTyping}
            variant="outlined"
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleSendMessage}
                    disabled={!currentMessage.trim() || isTyping}
                    color="primary"
                    sx={{
                      backgroundColor: currentMessage.trim() ? '#9C27B0' : 'transparent',
                      color: currentMessage.trim() ? 'white' : 'inherit',
                      '&:hover': {
                        backgroundColor: currentMessage.trim() ? '#7B1FA2' : 'rgba(0, 0, 0, 0.04)'
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

          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Pressione Enter para enviar • Shift + Enter para nova linha
          </Typography>
        </Box>
      </Drawer>
    </>
  );
};

export default ChatAI;
