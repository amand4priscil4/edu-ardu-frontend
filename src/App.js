import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import Dashboard from './components/Dashboard';
import ChatAI from './components/ChatAI';

// Tema customizado com as cores da interface
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976D2', // Azul principal
      light: '#42A5F5',
      dark: '#1565C0',
    },
    secondary: {
      main: '#FF9800', // Laranja
    },
    background: {
      default: 'linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)',
      paper: 'rgba(255, 255, 255, 0.95)',
    },
    success: {
      main: '#4CAF50', // Verde
    },
    error: {
      main: '#E91E63', // Rosa
    },
    warning: {
      main: '#9C27B0', // Roxo
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      color: '#fff',
    },
    h6: {
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)',
          padding: { xs: 0.5, sm: 1, md: 2, lg: 3 },
          position: 'relative',
        }}
      >
        <Dashboard />
        
        {/* Chat IA - Botão flutuante sempre visível */}
        <ChatAI />
      </Box>
    </ThemeProvider>
  );
}

export default App;