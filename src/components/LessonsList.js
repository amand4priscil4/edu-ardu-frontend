import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  LinearProgress,
  Chip,
  Avatar,
  Button,
} from '@mui/material';
import {
  ArrowBack,
  Psychology,
  SmartToy,
  Memory,
  PlayArrow,
  CheckCircle,
  Schedule,
  School,
} from '@mui/icons-material';
import LessonViewer from './LessonViewer';

const LessonsList = ({ onBack }) => {
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);

  const lessons = [
    {
      id: 1,
      title: 'Pensamento Computacional',
      subtitle: 'Aprenda a pensar como um programador',
      description: 'Desenvolva habilidades de decomposição, reconhecimento de padrões, abstração e algoritmos.',
      duration: '15 min',
      difficulty: 'Iniciante',
      icon: <Psychology sx={{ fontSize: 40 }} />,
      color: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)',
      topics: ['Decomposição', 'Padrões', 'Abstração', 'Algoritmos'],
    },
    {
      id: 2,
      title: 'Robótica Básica',
      subtitle: 'Fundamentos da robótica educacional',
      description: 'Conheça os conceitos essenciais, tipos de robôs, sensores e atuadores.',
      duration: '20 min',
      difficulty: 'Iniciante',
      icon: <SmartToy sx={{ fontSize: 40 }} />,
      color: 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)',
      topics: ['Tipos de Robôs', 'Sensores', 'Atuadores', 'Aplicações'],
    },
    {
      id: 3,
      title: 'Introdução ao Arduino',
      subtitle: 'Primeiros passos com Arduino',
      description: 'Aprenda sobre a placa Arduino, programação básica e componentes eletrônicos.',
      duration: '25 min',
      difficulty: 'Iniciante',
      icon: <Memory sx={{ fontSize: 40 }} />,
      color: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
      topics: ['Placa Arduino', 'IDE', 'Componentes', 'Primeiro Projeto'],
    },
  ];

  const LessonCard = ({ lesson }) => {
    const isCompleted = completedLessons.includes(lesson.id);

    return (
      <Card
        sx={{
          background: lesson.color,
          color: 'white',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'visible',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
          },
          transition: 'all 0.3s ease',
        }}
        onClick={() => setSelectedLesson(lesson)}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Avatar
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                width: 64,
                height: 64,
              }}
            >
              {lesson.icon}
            </Avatar>
            
            {isCompleted && (
              <CheckCircle 
                sx={{ 
                  color: '#4CAF50',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  fontSize: 28 
                }} 
              />
            )}
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            {lesson.title}
          </Typography>
          
          <Typography variant="body2" sx={{ opacity: 0.9, mb: 3 }}>
            {lesson.subtitle}
          </Typography>

          <Typography variant="body2" sx={{ opacity: 0.8, mb: 3, lineHeight: 1.6 }}>
            {lesson.description}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
            {lesson.topics.map((topic, index) => (
              <Chip
                key={index}
                label={topic}
                size="small"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontSize: '0.75rem',
                }}
              />
            ))}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Schedule sx={{ fontSize: 16 }} />
                <Typography variant="caption">{lesson.duration}</Typography>
              </Box>
              
              <Chip
                label={lesson.difficulty}
                size="small"
                sx={{
                  backgroundColor: 'rgba(76, 175, 80, 0.9)',
                  color: 'white',
                  fontSize: '0.7rem',
                }}
              />
            </Box>

            <Button
              variant="contained"
              startIcon={<PlayArrow />}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                },
                textTransform: 'none',
                fontWeight: 500,
              }}
            >
              {isCompleted ? 'Revisar' : 'Iniciar'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (selectedLesson) {
    return (
      <LessonViewer
        lesson={selectedLesson}
        onBack={() => setSelectedLesson(null)}
        onComplete={(lessonId) => {
          if (!completedLessons.includes(lessonId)) {
            setCompletedLessons([...completedLessons, lessonId]);
          }
          setSelectedLesson(null);
        }}
        isCompleted={completedLessons.includes(selectedLesson.id)}
      />
    );
  }

  const progressPercentage = (completedLessons.length / lessons.length) * 100;

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header */}
      <AppBar 
        position="static" 
        elevation={0} 
        sx={{ 
          backgroundColor: 'transparent',
          mb: 3,
        }}
      >
        <Toolbar sx={{ px: 0, minHeight: { xs: 48, md: 64 } }}>
          <IconButton
            onClick={onBack}
            sx={{ 
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              mr: 2,
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
            }}
          >
            <ArrowBack />
          </IconButton>
          
          <School sx={{ mr: 2, color: 'white' }} />
          
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 600, flex: 1 }}>
            Lições Interativas
          </Typography>

          <Chip
            label={`${completedLessons.length}/${lessons.length} Concluídas`}
            color="success"
            variant="filled"
            sx={{ 
              backgroundColor: 'rgba(76, 175, 80, 0.9)',
              color: 'white',
            }}
          />
        </Toolbar>
      </AppBar>

      {/* Progress Overview */}
      <Card sx={{ mb: 4, backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976D2' }}>
              Seu Progresso
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976D2' }}>
              {Math.round(progressPercentage)}%
            </Typography>
          </Box>
          
          <LinearProgress
            variant="determinate"
            value={progressPercentage}
            sx={{
              height: 12,
              borderRadius: 6,
              backgroundColor: 'rgba(25, 118, 210, 0.1)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#1976D2',
                borderRadius: 6,
              },
            }}
          />
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Continue aprendendo! Você está indo muito bem.
          </Typography>
        </CardContent>
      </Card>

      {/* Lessons Grid */}
      <Typography variant="h6" sx={{ color: 'white', mb: 3, fontWeight: 600 }}>
        Currículo de Robótica Educacional
      </Typography>
      
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(auto-fit, minmax(350px, 1fr))' },
        gap: 3,
        mb: 4 
      }}>
        {lessons.map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} />
        ))}
      </Box>

      {/* Call to Action */}
      {completedLessons.length === lessons.length && (
        <Card sx={{ 
          background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)', 
          color: 'white',
          textAlign: 'center'
        }}>
          <CardContent sx={{ p: 4 }}>
            <CheckCircle sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Parabéns! 🎉
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Você completou todas as lições! Agora está pronto para controlar seu robô Arduino.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={onBack}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                },
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Ir para Controle do Robô
            </Button>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default LessonsList;