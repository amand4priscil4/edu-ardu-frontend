import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Avatar,
  IconButton,
  AppBar,
  Toolbar,
  Badge,
} from '@mui/material';
import {
  School,
  Chat,
  SportsEsports,
  Analytics,
  PlayArrow,
  SmartToy,
  TrendingUp,
  Home,
  MenuBook,
  Psychology,
  Timeline,
  CloudDone,
  SimCard,
} from '@mui/icons-material';
import RobotControl from './RobotControl';
import LessonsList from './LessonsList';
import ChatEducational from './ChatEducational';

const Dashboard = () => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [userStats] = useState({
    sequencia: 7,
    gemas: 89,
    vidas: 5,
    xpTotal: 450,
    nivel: 3,
    progressoNivel: 75, // Porcentagem para próximo nível
  });

  const handleCardClick = (cardType) => {
    setSelectedCard(cardType);
  };

  const StatCard = ({ icon, value, label, color }) => (
    <Box sx={{ textAlign: 'center', color: 'white' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: { xs: 0.25, md: 0.5 } }}>
        {icon}
        <Typography 
          variant={{ xs: 'h6', md: 'h4' }} 
          sx={{ ml: { xs: 0.5, md: 1 }, fontWeight: 'bold' }}
        >
          {value}
        </Typography>
      </Box>
      <Typography 
        variant={{ xs: 'caption', md: 'body2' }} 
        sx={{ opacity: 0.9, fontSize: { xs: '0.625rem', md: '0.875rem' } }}
      >
        {label}
      </Typography>
    </Box>
  );

  const FeatureCard = ({ title, subtitle, icon, color, badge, onClick, disabled = false }) => (
    <Card
      sx={{
        background: color,
        color: 'white',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.7 : 1,
        height: { xs: '120px', md: '140px' },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        '&:hover': disabled ? {} : {
          transform: 'translateY(-6px)',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.2)',
        },
      }}
      onClick={() => !disabled && onClick()}
    >
      <CardContent sx={{ position: 'relative', p: { xs: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1.5, md: 2 } }}>
          <Box
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              p: { xs: 0.75, md: 1 },
              mr: { xs: 1.5, md: 2 },
            }}
          >
            {icon}
          </Box>
          {badge && (
            <Chip
              label={badge}
              size="small"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 500,
                fontSize: { xs: '0.65rem', md: '0.75rem' },
                height: { xs: 20, md: 24 },
              }}
            />
          )}
        </Box>
        <Typography 
          variant={{ xs: 'subtitle1', md: 'h6' }} 
          sx={{ fontWeight: 600, mb: { xs: 0.25, md: 0.5 } }}
        >
          {title}
        </Typography>
        <Typography 
          variant={{ xs: 'caption', md: 'body2' }} 
          sx={{ opacity: 0.9, fontSize: { xs: '0.7rem', md: '0.875rem' } }}
        >
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );

  if (selectedCard === 'robot') {
    return <RobotControl onBack={() => setSelectedCard(null)} />;
  }

  if (selectedCard === 'lessons') {
    return <LessonsList onBack={() => setSelectedCard(null)} />;
  }

  if (selectedCard === 'chat_lessons') {
    return <ChatEducational onBack={() => setSelectedCard(null)} />;
  }

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header */}
      <AppBar 
        position="static" 
        elevation={0} 
        sx={{ 
          backgroundColor: 'transparent',
          mb: { xs: 2, md: 3 },
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: 0, minHeight: { xs: 48, md: 64 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                backgroundColor: 'transparent',
                mr: { xs: 1, md: 2 },
                width: { xs: 32, md: 48 },
                height: { xs: 32, md: 48 },
              }}
              src="/logo.png"
            >
              <SmartToy />
            </Avatar>
            <Typography variant={{ xs: 'body1', md: 'h6' }} sx={{ color: 'white', fontWeight: 500 }}>
              Edu-Ardu
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: { xs: 1, md: 2 } }}>
            <IconButton sx={{ color: 'white', p: { xs: 0.5, md: 1 } }}>
              <Badge badgeContent={2} color="error">
                <Home sx={{ fontSize: { xs: 20, md: 24 } }} />
              </Badge>
            </IconButton>
            <IconButton sx={{ color: 'white', p: { xs: 0.5, md: 1 } }}>
              <MenuBook sx={{ fontSize: { xs: 20, md: 24 } }} />
            </IconButton>
            <IconButton sx={{ color: 'white', p: { xs: 0.5, md: 1 } }}>
              <Psychology sx={{ fontSize: { xs: 20, md: 24 } }} />
            </IconButton>
            <IconButton sx={{ color: 'white', p: { xs: 0.5, md: 1 } }}>
              <SportsEsports sx={{ fontSize: { xs: 20, md: 24 } }} />
            </IconButton>
            <IconButton sx={{ color: 'white', p: { xs: 0.5, md: 1 } }}>
              <Timeline sx={{ fontSize: { xs: 20, md: 24 } }} />
            </IconButton>
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
              <Chip
                icon={<CloudDone />}
                label="Online"
                size="small"
                sx={{
                  backgroundColor: 'rgba(76, 175, 80, 0.9)',
                  color: 'white',
                  fontSize: '0.75rem',
                }}
              />
              <Chip
                icon={<SimCard />}
                label="Simulação"
                size="small"
                sx={{
                  backgroundColor: 'rgba(156, 39, 176, 0.9)',
                  color: 'white',
                  fontSize: '0.75rem',
                }}
              />
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Welcome Section */}
      <Box sx={{ mb: { xs: 2, md: 4 } }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' }, 
          mb: { xs: 1.5, md: 2 },
          gap: { xs: 2, md: 0 }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Box>
              <Typography 
                variant={{ xs: 'h5', md: 'h4' }} 
                sx={{ color: 'white', fontWeight: 600, mb: { xs: 0.5, md: 1 } }}
              >
                Bem-vindo de volta!
              </Typography>
              <Typography 
                variant={{ xs: 'body2', md: 'body1' }} 
                sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
              >
                Modo offline - Continue aprendendo!
              </Typography>
            </Box>
          </Box>
          
          {/* Stats */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: 'repeat(4, 1fr)', md: 'repeat(4, 1fr)' },
            gap: { xs: 1.5, md: 3 },
            width: { xs: '100%', md: 'auto' },
            maxWidth: { xs: 'none', md: 400 }
          }}>
            <StatCard
              icon={<TrendingUp sx={{ fontSize: { xs: 16, md: 20 } }} />}
              value={userStats.sequencia}
              label="Sequência"
              color="#FF9800"
            />
            <StatCard
              icon={<Badge sx={{ fontSize: { xs: 16, md: 20 } }} />}
              value={userStats.gemas}
              label="Gemas"
              color="#4CAF50"
            />
            <StatCard
              icon={<Badge sx={{ fontSize: { xs: 16, md: 20 } }} />}
              value={userStats.vidas}
              label="Vidas"
              color="#E91E63"
            />
            <StatCard
              icon={<Analytics sx={{ fontSize: { xs: 16, md: 20 } }} />}
              value={userStats.xpTotal}
              label="XP Total"
              color="#2196F3"
            />
          </Box>
        </Box>

        {/* Progress Bar */}
        <Box sx={{ mb: { xs: 0.5, md: 1 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography 
              variant={{ xs: 'body2', md: 'body1' }} 
              sx={{ color: 'white', fontWeight: 500 }}
            >
              Nível {userStats.nivel}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
            >
              50 XP para próximo nível
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={userStats.progressoNivel}
            sx={{
              height: { xs: 6, md: 8 },
              borderRadius: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#FF9800',
                borderRadius: 4,
              },
            }}
          />
        </Box>
      </Box>

      {/* Feature Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <FeatureCard
          title="Lições Estruturadas"
          subtitle="Aprenda robótica passo a passo"
          icon={<School sx={{ fontSize: 24 }} />}
          color="linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)"
          badge="3 lições disponíveis"
          onClick={() => handleCardClick('lessons')}
        />
        
        <FeatureCard
          title="Chat Educacional"
          subtitle="Converse com Edu-Ardu e aprenda!"
          icon={<Chat sx={{ fontSize: 24 }} />}
          color="linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)"
          badge="Chat com interação"
          onClick={() => handleCardClick('chat_lessons')}
        />
        
        <FeatureCard
          title="Controle do Robô"
          subtitle="Controle manual e programação"
          icon={<SportsEsports sx={{ fontSize: 24 }} />}
          color="linear-gradient(135deg, #E91E63 0%, #EC407A 100%)"
          badge="Modo simulação"
          onClick={() => handleCardClick('robot')}
        />
        
        <FeatureCard
          title="Meu Progresso"
          subtitle="Estatísticas e conquistas"
          icon={<Analytics sx={{ fontSize: 24 }} />}
          color="linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)"
          badge="Nível 3"
          onClick={() => alert('Progresso em desenvolvimento')}
        />
      </Box>
    </Container>
  );
};

export default Dashboard;