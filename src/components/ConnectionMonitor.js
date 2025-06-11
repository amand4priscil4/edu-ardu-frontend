import React, { useState, useEffect } from 'react';

const ConnectionMonitor = () => {
  const [connections, setConnections] = useState({
    backend: { status: 'disconnected', url: 'http://localhost:3000', lastCheck: null },
    robotTTS: {
      status: 'disconnected',
      url: 'https://robot-mouth-pwa.vercel.app',
      lastCheck: null
    },
    arduino: { status: 'disconnected', port: 'Unknown', lastCheck: null },
    ai: { status: 'disconnected', provider: 'Unknown', lastCheck: null }
  });

  const [logs, setLogs] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [testResults, setTestResults] = useState({});

  // Adicionar log
  const addLog = (message, type = 'info', component = 'system') => {
    const timestamp = new Date().toLocaleTimeString();
    const newLog = {
      id: Date.now(),
      timestamp,
      message,
      type, // info, success, error, warning
      component
    };

    setLogs(prev => [newLog, ...prev.slice(0, 49)]); // Manter últimos 50 logs
  };

  // Verificar conexão com backend
  const checkBackend = async () => {
    try {
      const response = await fetch('http://localhost:3000/health', {
        method: 'GET',
        timeout: 5000
      });

      if (response.ok) {
        setConnections(prev => ({
          ...prev,
          backend: { ...prev.backend, status: 'connected', lastCheck: new Date() }
        }));
        addLog('✅ Backend conectado', 'success', 'backend');
        return true;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      setConnections(prev => ({
        ...prev,
        backend: { ...prev.backend, status: 'disconnected', lastCheck: new Date() }
      }));
      addLog(`❌ Backend falhou: ${error.message}`, 'error', 'backend');
      return false;
    }
  };

  // Verificar conexão com PWA do robô
  const checkRobotTTS = async () => {
    try {
      const response = await fetch('https://robot-mouth-pwa.vercel.app/api/health', {
        method: 'GET',
        timeout: 5000
      });

      if (response.ok) {
        setConnections(prev => ({
          ...prev,
          robotTTS: { ...prev.robotTTS, status: 'connected', lastCheck: new Date() }
        }));
        addLog('✅ PWA Robô conectado', 'success', 'robot');
        return true;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      setConnections(prev => ({
        ...prev,
        robotTTS: { ...prev.robotTTS, status: 'disconnected', lastCheck: new Date() }
      }));
      addLog(`❌ PWA Robô falhou: ${error.message}`, 'error', 'robot');
      return false;
    }
  };

  // Verificar status do Arduino
  const checkArduino = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/robot/status', {
        method: 'GET',
        timeout: 5000
      });

      if (response.ok) {
        const data = await response.json();
        const isConnected = data.connected;

        setConnections(prev => ({
          ...prev,
          arduino: {
            ...prev.arduino,
            status: isConnected ? 'connected' : 'disconnected',
            port: data.devicePath || 'Unknown',
            lastCheck: new Date()
          }
        }));

        addLog(
          isConnected ? '✅ Arduino conectado' : '⚠️ Arduino desconectado',
          isConnected ? 'success' : 'warning',
          'arduino'
        );
        return isConnected;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      setConnections(prev => ({
        ...prev,
        arduino: { ...prev.arduino, status: 'error', lastCheck: new Date() }
      }));
      addLog(`❌ Erro Arduino: ${error.message}`, 'error', 'arduino');
      return false;
    }
  };

  // Verificar status da IA
  const checkAI = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/ai/status', {
        method: 'GET',
        timeout: 5000
      });

      if (response.ok) {
        const data = await response.json();

        setConnections(prev => ({
          ...prev,
          ai: {
            ...prev.ai,
            status: 'connected',
            provider: data.ai?.provider || 'Unknown',
            lastCheck: new Date()
          }
        }));

        addLog(`✅ IA conectada (${data.ai?.provider})`, 'success', 'ai');
        return true;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      setConnections(prev => ({
        ...prev,
        ai: { ...prev.ai, status: 'disconnected', lastCheck: new Date() }
      }));
      addLog(`❌ IA falhou: ${error.message}`, 'error', 'ai');
      return false;
    }
  };

  // Verificar todas as conexões
  const checkAllConnections = async () => {
    addLog('🔍 Iniciando verificação completa...', 'info', 'system');

    const results = await Promise.allSettled([
      checkBackend(),
      checkRobotTTS(),
      checkArduino(),
      checkAI()
    ]);

    const summary = results.map((result, index) => {
      const components = ['backend', 'robotTTS', 'arduino', 'ai'];
      return {
        component: components[index],
        success: result.status === 'fulfilled' && result.value
      };
    });

    const successCount = summary.filter(r => r.success).length;
    addLog(
      `📊 Verificação completa: ${successCount}/4 sistemas conectados`,
      successCount === 4 ? 'success' : successCount >= 2 ? 'warning' : 'error',
      'system'
    );

    return summary;
  };

  // Teste completo do fluxo
  const testCompleteFlow = async () => {
    addLog('🧪 Iniciando teste do fluxo completo...', 'info', 'test');
    setTestResults({});

    try {
      // 1. Teste da IA
      addLog('1️⃣ Testando IA...', 'info', 'test');
      const aiResponse = await fetch('http://localhost:3000/api/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Teste do sistema completo' })
      });

      if (!aiResponse.ok) throw new Error('IA não respondeu');

      const aiData = await aiResponse.json();
      setTestResults(prev => ({ ...prev, ai: '✅ Funcionando' }));
      addLog('✅ IA respondeu corretamente', 'success', 'test');

      // 2. Teste do TTS
      addLog('2️⃣ Testando TTS do robô...', 'info', 'test');
      const ttsResponse = await fetch('https://robot-mouth-pwa.vercel.app/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Teste de integração do sistema Edu-Ardu',
          source: 'connection-monitor'
        })
      });

      if (!ttsResponse.ok) throw new Error('TTS não aceitou comando');

      setTestResults(prev => ({ ...prev, tts: '✅ Comando enviado' }));
      addLog('✅ TTS aceitou comando', 'success', 'test');

      // 3. Teste do Arduino (se conectado)
      if (connections.arduino.status === 'connected') {
        addLog('3️⃣ Testando Arduino...', 'info', 'test');
        const arduinoResponse = await fetch('http://localhost:3000/api/robot/test', {
          method: 'POST'
        });

        if (arduinoResponse.ok) {
          setTestResults(prev => ({ ...prev, arduino: '✅ Respondendo' }));
          addLog('✅ Arduino respondeu ao teste', 'success', 'test');
        } else {
          setTestResults(prev => ({ ...prev, arduino: '⚠️ Não responde' }));
          addLog('⚠️ Arduino não respondeu', 'warning', 'test');
        }
      } else {
        setTestResults(prev => ({ ...prev, arduino: '❌ Desconectado' }));
      }

      addLog('🎉 Teste completo finalizado!', 'success', 'test');
    } catch (error) {
      addLog(`❌ Teste falhou: ${error.message}`, 'error', 'test');
      setTestResults(prev => ({ ...prev, error: error.message }));
    }
  };

  // Monitoramento automático
  useEffect(() => {
    let interval;

    if (isMonitoring) {
      // Verificação inicial
      checkAllConnections();

      // Verificação a cada 30 segundos
      interval = setInterval(checkAllConnections, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMonitoring]);

  // Verificação inicial
  useEffect(() => {
    checkAllConnections();
  }, []);

  const getStatusColor = status => {
    switch (status) {
      case 'connected':
        return '#28a745';
      case 'disconnected':
        return '#dc3545';
      case 'error':
        return '#fd7e14';
      default:
        return '#6c757d';
    }
  };

  const getStatusIcon = status => {
    switch (status) {
      case 'connected':
        return '✅';
      case 'disconnected':
        return '❌';
      case 'error':
        return '⚠️';
      default:
        return '❓';
    }
  };

  const getLogIcon = type => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📝';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        width: '400px',
        maxHeight: '80vh',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: '1px solid #e9ecef',
        zIndex: 1000,
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '16px 20px',
          borderRadius: '12px 12px 0 0'
        }}
      >
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>🔍 Monitor de Conexões</h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
          Sistema Edu-Ardu + Robô TTS
        </p>
      </div>

      {/* Status Cards */}
      <div style={{ padding: '20px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '20px'
          }}
        >
          {/* Backend */}
          <div
            style={{
              padding: '12px',
              border: `2px solid ${getStatusColor(connections.backend.status)}`,
              borderRadius: '8px',
              background: '#f8f9fa'
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6c757d' }}>BACKEND</div>
            <div style={{ fontSize: '14px', marginTop: '4px' }}>
              {getStatusIcon(connections.backend.status)} {connections.backend.status}
            </div>
            <div style={{ fontSize: '10px', color: '#6c757d', marginTop: '2px' }}>
              localhost:3000
            </div>
          </div>

          {/* Robot TTS */}
          <div
            style={{
              padding: '12px',
              border: `2px solid ${getStatusColor(connections.robotTTS.status)}`,
              borderRadius: '8px',
              background: '#f8f9fa'
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6c757d' }}>ROBÔ TTS</div>
            <div style={{ fontSize: '14px', marginTop: '4px' }}>
              {getStatusIcon(connections.robotTTS.status)} {connections.robotTTS.status}
            </div>
            <div style={{ fontSize: '10px', color: '#6c757d', marginTop: '2px' }}>vercel.app</div>
          </div>

          {/* Arduino */}
          <div
            style={{
              padding: '12px',
              border: `2px solid ${getStatusColor(connections.arduino.status)}`,
              borderRadius: '8px',
              background: '#f8f9fa'
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6c757d' }}>ARDUINO</div>
            <div style={{ fontSize: '14px', marginTop: '4px' }}>
              {getStatusIcon(connections.arduino.status)} {connections.arduino.status}
            </div>
            <div style={{ fontSize: '10px', color: '#6c757d', marginTop: '2px' }}>
              {connections.arduino.port}
            </div>
          </div>

          {/* AI */}
          <div
            style={{
              padding: '12px',
              border: `2px solid ${getStatusColor(connections.ai.status)}`,
              borderRadius: '8px',
              background: '#f8f9fa'
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6c757d' }}>IA</div>
            <div style={{ fontSize: '14px', marginTop: '4px' }}>
              {getStatusIcon(connections.ai.status)} {connections.ai.status}
            </div>
            <div style={{ fontSize: '10px', color: '#6c757d', marginTop: '2px' }}>
              {connections.ai.provider}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <button
            onClick={checkAllConnections}
            style={{
              background: '#007bff',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            🔄 Verificar Tudo
          </button>

          <button
            onClick={() => setIsMonitoring(!isMonitoring)}
            style={{
              background: isMonitoring ? '#dc3545' : '#28a745',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            {isMonitoring ? '⏹️ Parar' : '▶️ Monitorar'}
          </button>

          <button
            onClick={testCompleteFlow}
            style={{
              background: '#ffc107',
              color: '#212529',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            🧪 Teste Completo
          </button>

          <button
            onClick={() => setLogs([])}
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            🗑️ Limpar Logs
          </button>
        </div>

        {/* Test Results */}
        {Object.keys(testResults).length > 0 && (
          <div
            style={{
              background: '#e9ecef',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px'
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>
              🧪 RESULTADOS DO TESTE
            </div>
            {Object.entries(testResults).map(([key, value]) => (
              <div key={key} style={{ fontSize: '12px', marginBottom: '4px' }}>
                <strong>{key.toUpperCase()}:</strong> {value}
              </div>
            ))}
          </div>
        )}

        {/* Logs */}
        <div
          style={{
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            maxHeight: '200px',
            overflow: 'auto'
          }}
        >
          <div
            style={{
              background: '#f8f9fa',
              padding: '8px 12px',
              borderBottom: '1px solid #e9ecef',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            📋 LOGS ({logs.length})
          </div>

          <div style={{ padding: '8px' }}>
            {logs.length === 0 ? (
              <div
                style={{ fontSize: '12px', color: '#6c757d', textAlign: 'center', padding: '20px' }}
              >
                Nenhum log ainda...
              </div>
            ) : (
              logs.map(log => (
                <div
                  key={log.id}
                  style={{
                    fontSize: '11px',
                    marginBottom: '4px',
                    padding: '4px 6px',
                    borderRadius: '4px',
                    background:
                      log.type === 'error'
                        ? '#f8d7da'
                        : log.type === 'success'
                        ? '#d1edff'
                        : log.type === 'warning'
                        ? '#fff3cd'
                        : '#e2e3e5'
                  }}
                >
                  <span style={{ color: '#6c757d' }}>{log.timestamp}</span>
                  <span
                    style={{
                      margin: '0 6px',
                      fontSize: '10px',
                      background: '#fff',
                      padding: '1px 4px',
                      borderRadius: '2px'
                    }}
                  >
                    {log.component.toUpperCase()}
                  </span>
                  {getLogIcon(log.type)} {log.message}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionMonitor;
