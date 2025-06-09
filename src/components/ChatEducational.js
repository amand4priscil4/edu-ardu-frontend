import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Avatar,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  IconButton,
  AppBar,
  Toolbar,
  Fade,
  Grow,
  CircularProgress
} from '@mui/material';
import { ArrowBack, Stars, EmojiEvents, SmartToy } from '@mui/icons-material';
import io from 'socket.io-client';

const API_BASE_URL = 'http://localhost:3000';

const ChatEducational = ({ onBack, lessonType = 'introduction' }) => {
  // Gera userId uma única vez usando useRef
  const userIdRef = useRef('user_' + Math.random().toString(36).substr(2, 9));
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [progress, setProgress] = useState({
    totalSteps: 0,
    completedSteps: 0,
    correctAnswers: 0,
    badges: []
  });
  const [isEduArduThinking, setIsEduArduThinking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [newBadges, setNewBadges] = useState([]);
  const messagesEndRef = useRef(null);

  // Auto scroll para última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isEduArduThinking]);

  useEffect(() => {
    // Inicializa WebSocket
    const newSocket = io(`${API_BASE_URL}/chat`);
    setSocket(newSocket);

    console.log('Conectando ao WebSocket do chat...');

    // Event listeners do WebSocket
    newSocket.on('connect', () => {
      console.log('Conectado ao WebSocket do chat');
    });

    newSocket.on('conversation_started', data => {
      console.log('Conversa iniciada:', data);
      setConversationId(data.conversationId);
      setMessages([data.message]);
      setProgress(data.progress);
      setIsLoading(false);
    });

    newSocket.on('edu_ardu_thinking', data => {
      console.log('Edu-Ardu pensando:', data.thinking);
      setIsEduArduThinking(data.thinking);
    });

    newSocket.on('edu_ardu_response', data => {
      console.log('Resposta do Edu-Ardu:', data);
      setMessages(prev => [...prev, data.message]);
      setProgress(data.progress);
      setIsEduArduThinking(false);
    });

    newSocket.on('badge_earned', data => {
      console.log('Badge ganho:', data);
      setNewBadges(data.badges);
      setTimeout(() => setNewBadges([]), 3000);
    });

    newSocket.on('error', data => {
      console.error('Erro do WebSocket:', data);
      setError(data.message);
      setIsEduArduThinking(false);
      setIsLoading(false);
    });

    newSocket.on('disconnect', () => {
      console.log('Desconectado do WebSocket do chat');
    });

    // Inicia conversa após conexão
    const startConversation = () => {
      console.log('Iniciando conversa...');
      setIsLoading(true);
      newSocket.emit('start_conversation', {
        userId: userIdRef.current,
        lessonType: lessonType
      });
    };

    // Aguarda conexão antes de iniciar conversa
    if (newSocket.connected) {
      startConversation();
    } else {
      newSocket.on('connect', startConversation);
    }

    return () => {
      console.log('Cleanup do WebSocket');
      newSocket.off('connect');
      newSocket.off('conversation_started');
      newSocket.off('edu_ardu_thinking');
      newSocket.off('edu_ardu_response');
      newSocket.off('badge_earned');
      newSocket.off('error');
      newSocket.off('disconnect');
      newSocket.close();
    };
  }, [lessonType, userIdRef]);

  const handleOptionClick = option => {
    if (!socket || !conversationId) return;

    // Adiciona mensagem do usuário imediatamente na interface
    const userMessage = {
      type: 'user',
      content: option.label, // Mostra o texto da opção, não o ID
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // Envia resposta via WebSocket
    socket.emit('send_message', {
      conversationId: conversationId,
      userChoice: option.id,
      userText: option.label
    });
  };

  const MessageBubble = ({ message, isEduArdu = false }) => (
    <Fade in timeout={500}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: isEduArdu ? 'flex-start' : 'flex-end',
          mb: 2,
          px: 2
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            maxWidth: '80%',
            ...(isEduArdu ? {} : { flexDirection: 'row-reverse' })
          }}
        >
          {/* Avatar */}
          {isEduArdu && (
            <Avatar
              sx={{
                width: 40,
                height: 40,
                mr: 1,
                backgroundColor: 'transparent',
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }}
              src="/logo.png"
            >
              <SmartToy />
            </Avatar>
          )}

          {/* Message Content */}
          <Box
            sx={{
              backgroundColor: isEduArdu
                ? 'rgba(255, 255, 255, 0.95)'
                : 'linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)',
              color: isEduArdu ? '#333' : 'white',
              borderRadius: isEduArdu ? '20px 20px 20px 5px' : '20px 20px 5px 20px',
              px: 3,
              py: 2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              position: 'relative'
            }}
          >
            <Typography
              variant="body1"
              sx={{
                lineHeight: 1.5,
                fontSize: '1rem'
              }}
            >
              {message.content}
            </Typography>

            {/* Timestamp */}
            <Typography
              variant="caption"
              sx={{
                opacity: 0.7,
                fontSize: '0.75rem',
                display: 'block',
                textAlign: 'right',
                mt: 0.5
              }}
            >
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Fade>
  );

  const TypingIndicator = () => (
    <Fade in>
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, mb: 2 }}>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            mr: 1,
            backgroundColor: 'transparent',
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }}
          src="/logo.png"
        >
          <SmartToy />
        </Avatar>
        <Box
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px 20px 20px 5px',
            px: 3,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <CircularProgress size={16} />
          <Typography variant="body2" color="text.secondary">
            Edu-Ardu está pensando...
          </Typography>
        </Box>
      </Box>
    </Fade>
  );

  const OptionCard = ({ option, index }) => (
    <Grow in timeout={500 + index * 100}>
      <Card
        onClick={() => handleOptionClick(option)}
        sx={{
          mb: 1.5,
          cursor: 'pointer',
          backgroundColor:
            option.type === 'primary' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.8)',
          border:
            option.type === 'primary' ? '2px solid #1976D2' : '1px solid rgba(25, 118, 210, 0.3)',
          borderRadius: 3,
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            backgroundColor: option.type === 'primary' ? '#1976D2' : 'rgba(255, 255, 255, 0.95)',
            color: option.type === 'primary' ? 'white' : 'inherit',
            boxShadow: '0 8px 25px rgba(25, 118, 210, 0.3)'
          }
        }}
      >
        <CardContent sx={{ py: 2, px: 3 }}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: option.type === 'primary' ? 600 : 500,
              textAlign: 'center'
            }}
          >
            {option.label}
          </Typography>
        </CardContent>
      </Card>
    </Grow>
  );

  const getCurrentOptions = () => {
    const lastMessage = messages[messages.length - 1];
    return lastMessage?.type === 'edu_ardu' ? lastMessage.options || [] : [];
  };

  const progressPercentage =
    progress.totalSteps > 0 ? (progress.completedSteps / progress.totalSteps) * 100 : 0;

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        height: '100vh',
        background: 'linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}>
        <Toolbar sx={{ minHeight: { xs: 56, md: 64 } }}>
          <IconButton
            onClick={onBack}
            sx={{
              color: 'white',
              mr: 1
            }}
          >
            <ArrowBack />
          </IconButton>

          <Avatar
            sx={{
              width: 40,
              height: 40,
              mr: 2,
              backgroundColor: 'transparent'
            }}
            src="/logo.png"
          >
            <SmartToy />
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
              Edu-Ardu
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Seu tutor de robótica
            </Typography>
          </Box>

          {/* Progress Info */}
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" sx={{ color: 'white', display: 'block' }}>
              {progress.completedSteps}/{progress.totalSteps || '?'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {progress.badges.map((badge, index) => (
                <Chip
                  key={index}
                  icon={<EmojiEvents />}
                  label={badge}
                  size="small"
                  sx={{
                    backgroundColor: '#FFD700',
                    color: '#333',
                    fontSize: '0.7rem'
                  }}
                />
              ))}
            </Box>
          </Box>
        </Toolbar>

        {/* Progress Bar */}
        {progress.totalSteps > 0 && (
          <LinearProgress
            variant="determinate"
            value={progressPercentage}
            sx={{
              height: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#FFD700'
              }
            }}
          />
        )}
      </AppBar>

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          py: 2,
          position: 'relative'
        }}
      >
        {isLoading ? (
          <Box
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50%' }}
          >
            <CircularProgress sx={{ color: 'white' }} />
            <Typography sx={{ color: 'white', ml: 2 }}>Conectando com Edu-Ardu...</Typography>
          </Box>
        ) : (
          <>
            {/* Messages */}
            {messages.map((message, index) => (
              <MessageBubble
                key={index}
                message={message}
                isEduArdu={message.type === 'edu_ardu'}
              />
            ))}

            {/* Typing Indicator */}
            {isEduArduThinking && <TypingIndicator />}

            {/* Options */}
            {!isEduArduThinking && getCurrentOptions().length > 0 && (
              <Box sx={{ px: 2, mt: 2 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    mb: 2,
                    textAlign: 'center',
                    fontWeight: 500
                  }}
                >
                  Como você responderia?
                </Typography>
                {getCurrentOptions().map((option, index) => (
                  <OptionCard key={option.id} option={option} index={index} />
                ))}
              </Box>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      {/* New Badges Notification */}
      {newBadges.length > 0 && (
        <Fade in>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'rgba(255, 215, 0, 0.95)',
              color: '#333',
              borderRadius: 4,
              p: 3,
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              zIndex: 1000
            }}
          >
            <Stars sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              🎉 Nova Conquista!
            </Typography>
            <Typography variant="body2">Você ganhou: {newBadges.join(', ')}</Typography>
          </Box>
        </Fade>
      )}

      {/* Error Message */}
      {error && (
        <Box sx={{ p: 2, backgroundColor: 'rgba(244, 67, 54, 0.9)' }}>
          <Typography variant="body2" sx={{ color: 'white', textAlign: 'center' }}>
            {error}
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default ChatEducational;
