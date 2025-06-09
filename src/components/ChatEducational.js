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
  CircularProgress,
  Alert
} from '@mui/material';
import { ArrowBack, Stars, EmojiEvents, SmartToy } from '@mui/icons-material';
import apiService from '../services/apiService';

const ChatEducational = ({ onBack, lessonType = 'introduction' }) => {
  // Gera userId uma única vez usando useRef
  const userIdRef = useRef('user_' + Math.random().toString(36).substr(2, 9));
  const [messages, setMessages] = useState([]);
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

  // Inicializa conversa educacional
  useEffect(() => {
    const startConversation = async () => {
      setIsLoading(true);
      setError('');

      try {
        // Mapeia tipo de lição para idade apropriada
        const lessonTypeMap = {
          'introduction': { age: 10, interests: ['robótica básica'], difficultyLevel: 'beginner' },
          'sensors': { age: 11, interests: ['sensores', 'Arduino'], difficultyLevel: 'beginner' },
          'programming': { age: 12, interests: ['programação', 'robótica'], difficultyLevel: 'intermediate' },
          'projects': { age: 12, interests: ['projetos práticos', 'Arduino'], difficultyLevel: 'intermediate' }
        };

        const userProfile = lessonTypeMap[lessonType] || lessonTypeMap['introduction'];

        console.log('🎓 Iniciando chat educacional:', userProfile);

        const result = await apiService.startEducationalChat(
          userIdRef.current,
          userProfile.age,
          userProfile.interests,
          userProfile.difficultyLevel
        );

        if (result.success) {
          setConversationId(result.data.conversationId);
          
          // Mensagem de boas-vindas do Edu-Ardu
          const welcomeMessage = {
            type: 'edu_ardu',
            content: result.data.welcomeMessage || '👋 Olá! Eu sou o Edu-Ardu, seu robô tutor! Vamos aprender robótica juntos? 🤖⚡',
            timestamp: new Date(),
            options: result.data.initialOptions || [
              { id: 'start', label: 'Vamos começar!', type: 'primary' },
              { id: 'explain', label: 'Me explique mais sobre robótica', type: 'secondary' }
            ]
          };

          setMessages([welcomeMessage]);
          
          if (result.data.progress) {
            setProgress(result.data.progress);
          }
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('❌ Erro ao iniciar conversa:', error);
        setError('Erro ao conectar com Edu-Ardu. Tente novamente.');
        
        // Fallback: mensagem offline
        const offlineMessage = {
          type: 'edu_ardu',
          content: '👋 Olá! Eu sou o Edu-Ardu! Parece que estou com problemas de conexão, mas posso te ajudar de forma básica. O que você gostaria de aprender sobre robótica? 🤖',
          timestamp: new Date(),
          options: [
            { id: 'sensors', label: 'Sensores', type: 'primary' },
            { id: 'motors', label: 'Motores', type: 'primary' },
            { id: 'arduino', label: 'Arduino', type: 'primary' },
            { id: 'basic', label: 'Conceitos básicos', type: 'secondary' }
          ]
        };
        setMessages([offlineMessage]);
      } finally {
        setIsLoading(false);
      }
    };

    startConversation();
  }, [lessonType]);

  const handleOptionClick = async (option) => {
    if (isEduArduThinking) return;

    // Adiciona mensagem do usuário imediatamente na interface
    const userMessage = {
      type: 'user',
      content: option.label,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsEduArduThinking(true);
    setError('');

    try {
      if (conversationId) {
        // Usa API educacional se disponível
        const result = await apiService.sendEducationalMessage(
          conversationId,
          option.label,
          'option_selection'
        );

        if (result.success) {
          const eduArduMessage = {
            type: 'edu_ardu',
            content: result.data.response,
            timestamp: new Date(),
            options: result.data.options || []
          };

          setMessages(prev => [...prev, eduArduMessage]);
          
          if (result.data.progress) {
            setProgress(result.data.progress);
          }

          // Verifica se ganhou badges
          if (result.data.badges && result.data.badges.length > 0) {
            setNewBadges(result.data.badges);
            setTimeout(() => setNewBadges([]), 3000);
          }
        } else {
          throw new Error(result.error);
        }
      } else {
        // Fallback: usa chat IA normal
        const sessionId = 'educational_' + userIdRef.current;
        
        const contextualMessage = `Como Edu-Ardu, robô educacional para crianças, responda sobre "${option.label}" de forma didática e divertida com emojis. Máximo 3 frases.`;
        
        const result = await apiService.sendChatMessage(
          contextualMessage,
          sessionId,
          'robotics_education'
        );

        if (result.success) {
          const eduArduMessage = {
            type: 'edu_ardu',
            content: result.data.response,
            timestamp: new Date(),
            options: generateFollowUpOptions(option.id)
          };

          setMessages(prev => [...prev, eduArduMessage]);
        } else {
          throw new Error(result.error);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      setError('Erro ao se comunicar com Edu-Ardu. Tente novamente.');
      
      // Mensagem de erro amigável
      const errorMessage = {
        type: 'edu_ardu',
        content: 'Ops! Tive um probleminha técnico 🔧 Mas posso tentar responder de outra forma. O que mais você gostaria de saber? 🤖',
        timestamp: new Date(),
        options: [
          { id: 'retry', label: 'Tentar novamente', type: 'primary' },
          { id: 'basic', label: 'Pergunta mais simples', type: 'secondary' }
        ]
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsEduArduThinking(false);
    }
  };

  // Gera opções de follow-up baseadas no tópico
  const generateFollowUpOptions = (topicId) => {
    const followUpMap = {
      'sensors': [
        { id: 'ultrasonic', label: 'Sensor ultrassônico', type: 'primary' },
        { id: 'light', label: 'Sensor de luz', type: 'primary' },
        { id: 'temperature', label: 'Sensor de temperatura', type: 'secondary' }
      ],
      'motors': [
        { id: 'servo', label: 'Servo motor', type: 'primary' },
        { id: 'dc', label: 'Motor DC', type: 'primary' },
        { id: 'stepper', label: 'Motor de passo', type: 'secondary' }
      ],
      'arduino': [
        { id: 'pins', label: 'Pinos do Arduino', type: 'primary' },
        { id: 'code', label: 'Como programar', type: 'primary' },
        { id: 'projects', label: 'Projetos legais', type: 'secondary' }
      ],
      'basic': [
        { id: 'what_robot', label: 'O que é um robô?', type: 'primary' },
        { id: 'how_works', label: 'Como robôs funcionam?', type: 'primary' },
        { id: 'examples', label: 'Exemplos de robôs', type: 'secondary' }
      ],
      'default': [
        { id: 'more', label: 'Conte mais!', type: 'primary' },
        { id: 'example', label: 'Me dê um exemplo', type: 'primary' },
        { id: 'next', label: 'Próximo tópico', type: 'secondary' }
      ]
    };

    return followUpMap[topicId] || followUpMap['default'];
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
                backgroundColor: 'rgba(156, 39, 176, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              <SmartToy sx={{ color: '#9C27B0' }} />
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
            backgroundColor: 'rgba(156, 39, 176, 0.2)',
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }}
        >
          <SmartToy sx={{ color: '#9C27B0' }} />
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
            Edu-Ardu está processando...
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
            option.type === 'primary' ? '2px solid #9C27B0' : '1px solid rgba(156, 39, 176, 0.3)',
          borderRadius: 3,
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            backgroundColor: option.type === 'primary' ? '#9C27B0' : 'rgba(255, 255, 255, 0.95)',
            color: option.type === 'primary' ? 'white' : 'inherit',
            boxShadow: '0 8px 25px rgba(156, 39, 176, 0.3)'
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
              backgroundColor: 'rgba(156, 39, 176, 0.2)'
            }}
          >
            <SmartToy sx={{ color: '#9C27B0' }} />
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
              Edu-Ardu 🤖
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

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="warning" 
          onClose={() => setError('')}
          sx={{ m: 1 }}
        >
          {error}
        </Alert>
      )}

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
                  🤖 Como você responderia?
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
    </Container>
  );
};

export default ChatEducational;