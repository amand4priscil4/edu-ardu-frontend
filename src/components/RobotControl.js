import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  AppBar,
  Toolbar,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack,
  KeyboardArrowUp,
  KeyboardArrowDown,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Stop,
  Usb,
  Refresh,
  SmartToy,
  Wifi,
  WifiOff,
  Speed,
  Link,
  LinkOff,
} from '@mui/icons-material';
import io from 'socket.io-client';
import axios from 'axios';

const API_BASE_URL = 'https://api-ea-qrta.onrender.com';

const RobotControl = ({ onBack }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availablePorts, setAvailablePorts] = useState([]);
  const [selectedPort, setSelectedPort] = useState('');
  const [speed, setSpeed] = useState(200);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    // Inicializa Socket.IO
    const newSocket = io(`${API_BASE_URL}/robot`);
    setSocket(newSocket);

    // Event listeners
    newSocket.on('status', (data) => {
      setConnected(data.connected);
    });

    newSocket.on('command_result', (data) => {
      setIsMoving(data.command?.action !== 'stop');
      setError('');
    });

    newSocket.on('emergency_stop', () => {
      setIsMoving(false);
      setError('');
    });

    newSocket.on('error', (data) => {
      setError(data.message);
      setIsMoving(false);
    });

    newSocket.on('arduino_data', (data) => {
      console.log('Arduino data:', data);
    });

    // Cleanup
    return () => {
      newSocket.close();
    };
  }, []);

  const fetchAvailablePorts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/robot/ports`);
      setAvailablePorts(response.data.ports || []);
      if (response.data.ports?.length === 1) {
        setSelectedPort(response.data.ports[0].path);
      }
    } catch (error) {
      setError('Erro ao buscar portas USB');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!selectedPort) {
      setError('Selecione uma porta USB');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post(`${API_BASE_URL}/api/robot/connect`, {
        portPath: selectedPort,
        baudRate: 9600,
      });

      if (response.data.success) {
        setConnected(true);
        setConnectDialogOpen(false);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao conectar');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/robot/disconnect`);
      setConnected(false);
      setIsMoving(false);
    } catch (error) {
      setError('Erro ao desconectar');
    }
  };

  const sendMovementCommand = (action) => {
    if (!connected) {
      setError('Arduino não conectado');
      return;
    }

    const command = {
      action,
      speed: action === 'stop' ? undefined : speed,
    };

    if (socket) {
      socket.emit('movement', command);
      setIsMoving(action !== 'stop');
    }
  };

  const handleEmergencyStop = () => {
    if (socket) {
      socket.emit('emergency_stop');
    }
    setIsMoving(false);
  };

  const MovementButton = ({ direction, icon, color, action }) => (
    <IconButton
      size="large"
      disabled={!connected}
      onMouseDown={() => sendMovementCommand(action)}
      onMouseUp={() => sendMovementCommand('stop')}
      onTouchStart={() => sendMovementCommand(action)}
      onTouchEnd={() => sendMovementCommand('stop')}
      sx={{
        backgroundColor: color,
        color: 'white',
        width: 80,
        height: 80,
        fontSize: 32,
        '&:hover': {
          backgroundColor: color,
          transform: 'scale(1.1)',
        },
        '&:disabled': {
          backgroundColor: 'grey.300',
          color: 'grey.500',
        },
        '&:active': {
          transform: 'scale(0.95)',
        },
      }}
    >
      {icon}
    </IconButton>
  );

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <AppBar 
        position="static" 
        elevation={0} 
        sx={{ 
          backgroundColor: 'transparent',
          mb: 3,
        }}
      >
        <Toolbar sx={{ px: 0 }}>
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
          
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <img 
              src="/logo.png" 
              alt="EduArdu" 
              style={{ 
                width: 32, 
                height: 32, 
                marginRight: 8,
                filter: 'brightness(0) invert(1)' // Torna branco se necessário
              }} 
            />
          </Box>
          
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 600, flex: 1 }}>
            Controle do Robô
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              icon={connected ? <Wifi /> : <WifiOff />}
              label={connected ? 'Conectado' : 'Desconectado'}
              color={connected ? 'success' : 'error'}
              variant="filled"
            />
            <Chip
              icon={<Usb />}
              label="USB"
              color="info"
              variant="outlined"
              sx={{ color: 'white', borderColor: 'white' }}
            />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 3 }}>
        {/* Connection Panel */}
        <Box>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <Link sx={{ mr: 1 }} />
                Conexão
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {!connected ? (
                  <>
                    <Button
                      variant="contained"
                      startIcon={<Usb />}
                      onClick={() => {
                        setConnectDialogOpen(true);
                        fetchAvailablePorts();
                      }}
                      disabled={loading}
                      sx={{ 
                        backgroundColor: '#4CAF50',
                        '&:hover': { backgroundColor: '#45a049' }
                      }}
                    >
                      {loading ? <CircularProgress size={20} /> : 'Conectar Arduino'}
                    </Button>
                    
                    <Typography variant="body2" color="text.secondary">
                      Conecte seu Arduino via USB para controlar o robô em tempo real.
                    </Typography>
                  </>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      startIcon={<LinkOff />}
                      onClick={handleDisconnect}
                      color="error"
                    >
                      Desconectar
                    </Button>
                    
                    <Box sx={{ p: 2, backgroundColor: 'success.light', borderRadius: 1 }}>
                      <Typography variant="body2" color="success.dark">
                        ✓ Arduino conectado e pronto para receber comandos
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Speed Control */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <Speed sx={{ mr: 1 }} />
                Velocidade
              </Typography>
              
              <Box sx={{ px: 1 }}>
                <Slider
                  value={speed}
                  onChange={(e, value) => setSpeed(value)}
                  min={50}
                  max={255}
                  marks={[
                    { value: 50, label: 'Lento' },
                    { value: 150, label: 'Médio' },
                    { value: 255, label: 'Rápido' },
                  ]}
                  valueLabelDisplay="auto"
                  disabled={!connected}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Velocidade atual: {speed}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Movement Controls */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <SmartToy sx={{ mr: 1 }} />
                Controles de Movimento
                {isMoving && (
                  <Chip
                    label="Movendo"
                    color="primary"
                    size="small"
                    sx={{ ml: 2 }}
                  />
                )}
              </Typography>

              {/* Movement Pad */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  mb: 3,
                }}
              >
                {/* Forward */}
                <MovementButton
                  direction="forward"
                  icon={<KeyboardArrowUp />}
                  color="#2196F3"
                  action="forward"
                />

                {/* Left, Stop, Right */}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <MovementButton
                    direction="left"
                    icon={<KeyboardArrowLeft />}
                    color="#FF9800"
                    action="left"
                  />

                  <IconButton
                    size="large"
                    onClick={handleEmergencyStop}
                    disabled={!connected}
                    sx={{
                      backgroundColor: '#F44336',
                      color: 'white',
                      width: 80,
                      height: 80,
                      fontSize: 32,
                      '&:hover': {
                        backgroundColor: '#D32F2F',
                        transform: 'scale(1.1)',
                      },
                      '&:disabled': {
                        backgroundColor: 'grey.300',
                        color: 'grey.500',
                      },
                    }}
                  >
                    <Stop />
                  </IconButton>

                  <MovementButton
                    direction="right"
                    icon={<KeyboardArrowRight />}
                    color="#9C27B0"
                    action="right"
                  />
                </Box>

                {/* Backward */}
                <MovementButton
                  direction="backward"
                  icon={<KeyboardArrowDown />}
                  color="#4CAF50"
                  action="backward"
                />
              </Box>

              {/* Instructions */}
              <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                <Typography variant="body2" color="text.secondary">
                  💡 <strong>Como usar:</strong>
                  <br />
                  • Mantenha pressionado os botões de direção para mover
                  • O robô para automaticamente quando você solta
                  • Use o botão STOP para parada de emergência
                  • Ajuste a velocidade no painel lateral
                </Typography>
              </Paper>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Connect Dialog */}
      <Dialog
        open={connectDialogOpen}
        onClose={() => setConnectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Usb sx={{ mr: 1 }} />
            Conectar Arduino
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Porta USB</InputLabel>
              <Select
                value={selectedPort}
                onChange={(e) => setSelectedPort(e.target.value)}
                label="Porta USB"
              >
                {availablePorts.map((port) => (
                  <MenuItem key={port.path} value={port.path}>
                    {port.path} {port.manufacturer && `- ${port.manufacturer}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {availablePorts.length === 0 && !loading && (
              <Alert severity="warning">
                Nenhuma porta USB detectada. Verifique se o Arduino está conectado.
              </Alert>
            )}

            <Button
              startIcon={<Refresh />}
              onClick={fetchAvailablePorts}
              disabled={loading}
            >
              Atualizar Portas
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConnectDialogOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleConnect}
            variant="contained"
            disabled={!selectedPort || loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Conectar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RobotControl;