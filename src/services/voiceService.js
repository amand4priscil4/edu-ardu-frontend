/**
 * Serviço para Speech Recognition (fala → texto) e Speech Synthesis (texto → fala)
 */

class VoiceService {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.isSupported = this.checkSupport();
    this.currentUtterance = null;
    
    // Configurações para Edu-Ardu (robô masculino)
    this.speechConfig = {
      language: 'pt-BR',
      voice: null, // Será definido automaticamente (masculina)
      rate: 0.9,   // Velocidade adequada para crianças
      pitch: 0.8,  // Tom bem mais grave (masculino)
      volume: 1
    };

    this.setupRecognition();
    this.setupVoices();
  }

  /**
   * Verifica suporte do navegador
   */
  checkSupport() {
    const hasRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    const hasSynthesis = 'speechSynthesis' in window;
    
    return {
      recognition: hasRecognition,
      synthesis: hasSynthesis,
      full: hasRecognition && hasSynthesis
    };
  }

  /**
   * Configura o Speech Recognition
   */
  setupRecognition() {
    if (!this.isSupported.recognition) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    // Configurações otimizadas para crianças
    this.recognition.continuous = false;          // Para quando detecta pausa
    this.recognition.interimResults = true;       // Mostra resultado parcial
    this.recognition.lang = 'pt-BR';             // Português brasileiro
    this.recognition.maxAlternatives = 1;        // Uma alternativa
  }

  /**
   * Configura vozes disponíveis
   */
  setupVoices() {
    if (!this.isSupported.synthesis) return;

    const setVoices = () => {
      const voices = this.synthesis.getVoices();
      
      console.log('🎤 Vozes disponíveis:', voices.map(v => ({ name: v.name, lang: v.lang })));
      
      // Procura voz masculina em português brasileiro para Edu-Ardu 🤖
      const maleVoices = [
        // Nomes específicos masculinos
        'Microsoft Daniel',
        'Microsoft Helio', 
        'Daniel',
        'Helio',
        'Ricardo',
        'João',
        'Carlos',
        'Bruno',
        'Paulo',
        // Google com indicação masculina
        'Google português do Brasil (male)',
        'Google português do Brasil masculino'
      ];

      let selectedVoice = null;

      // 1. Tenta encontrar voz masculina específica por nome
      for (const voiceName of maleVoices) {
        selectedVoice = voices.find(voice => 
          voice.name.toLowerCase().includes(voiceName.toLowerCase())
        );
        if (selectedVoice) {
          console.log('🤖 Voz masculina encontrada por nome:', selectedVoice.name);
          break;
        }
      }

      // 2. Se não encontrar, procura por vozes que NÃO são femininas
      if (!selectedVoice) {
        const femaleIndicators = ['maria', 'fernanda', 'luciana', 'ana', 'female', 'feminino'];
        selectedVoice = voices.find(voice => 
          voice.lang.includes('pt-BR') && 
          !femaleIndicators.some(indicator => 
            voice.name.toLowerCase().includes(indicator)
          )
        );
        
        if (selectedVoice) {
          console.log('🤖 Voz não-feminina encontrada:', selectedVoice.name);
        }
      }

      // 3. Se ainda não encontrar, usa qualquer voz em português
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => voice.lang.includes('pt-BR'));
        if (selectedVoice) {
          console.log('🤖 Usando voz padrão PT-BR:', selectedVoice.name);
        }
      }

      // 4. Última opção: voz padrão do sistema
      if (!selectedVoice && voices.length > 0) {
        selectedVoice = voices[0];
        console.log('🤖 Usando voz padrão do sistema:', selectedVoice.name);
      }

      this.speechConfig.voice = selectedVoice;
      console.log('🤖 Voz final do Edu-Ardu:', selectedVoice?.name || 'Nenhuma encontrada');
      
      // Lista todas as vozes PT-BR disponíveis para debug
      const ptBrVoices = voices.filter(v => v.lang.includes('pt-BR'));
      console.log('📋 Todas as vozes PT-BR:', ptBrVoices.map(v => v.name));
    };

    // Algumas vezes as vozes demoram para carregar
    if (this.synthesis.getVoices().length > 0) {
      setVoices();
    } else {
      this.synthesis.addEventListener('voiceschanged', setVoices);
      // Timeout de segurança
      setTimeout(setVoices, 1000);
    }
  }

  /**
   * Força seleção de voz masculina
   */
  selectMaleVoice() {
    const voices = this.synthesis.getVoices();
    
    // Lista específica de vozes masculinas conhecidas
    const definitelyMaleVoices = [
      'Daniel',
      'Helio', 
      'Ricardo',
      'João',
      'Carlos',
      'Bruno',
      'Paulo',
      'Google US English Male',
      'Microsoft David',
      'Microsoft Mark'
    ];

    // Procura por vozes definitivamente masculinas
    for (const maleName of definitelyMaleVoices) {
      const voice = voices.find(v => 
        v.name.toLowerCase().includes(maleName.toLowerCase())
      );
      if (voice) {
        this.speechConfig.voice = voice;
        console.log('✅ Voz masculina forçada:', voice.name);
        return voice;
      }
    }

    // Se não encontrar, tenta configuração manual
    const ptVoices = voices.filter(v => v.lang.includes('pt'));
    console.log('🔍 Vozes portuguesas encontradas:', ptVoices.map(v => ({
      name: v.name,
      lang: v.lang,
      gender: this.guessVoiceGender(v.name)
    })));

    return null;
  }

  /**
   * Tenta adivinhar o gênero da voz pelo nome
   */
  guessVoiceGender(voiceName) {
    const name = voiceName.toLowerCase();
    
    const femaleNames = ['maria', 'ana', 'fernanda', 'luciana', 'sofia', 'female', 'feminino'];
    const maleNames = ['daniel', 'joão', 'carlos', 'bruno', 'paulo', 'ricardo', 'helio', 'male', 'masculino'];
    
    if (femaleNames.some(fn => name.includes(fn))) return 'female';
    if (maleNames.some(mn => name.includes(mn))) return 'male';
    
    return 'unknown';
  }

  /**
   * Inicia escuta (Speech to Text)
   */
  startListening() {
    return new Promise((resolve, reject) => {
      if (!this.isSupported.recognition) {
        reject(new Error('Speech Recognition não suportado neste navegador'));
        return;
      }

      if (this.isListening) {
        reject(new Error('Já está escutando'));
        return;
      }

      let finalTranscript = '';
      let interimTranscript = '';

      this.recognition.onstart = () => {
        this.isListening = true;
        console.log('🎤 Começou a escutar...');
      };

      this.recognition.onresult = (event) => {
        interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Callback para mostrar texto parcial em tempo real
        if (this.onInterimResult) {
          this.onInterimResult(interimTranscript);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        console.log('🎤 Parou de escutar');
        
        if (finalTranscript.trim()) {
          resolve(finalTranscript.trim());
        } else {
          reject(new Error('Nenhum texto foi reconhecido'));
        }
      };

      this.recognition.onerror = (event) => {
        this.isListening = false;
        let errorMessage = 'Erro no reconhecimento de voz';
        
        switch (event.error) {
          case 'not-allowed':
            errorMessage = 'Permissão de microfone negada';
            break;
          case 'no-speech':
            errorMessage = 'Nenhuma fala detectada';
            break;
          case 'audio-capture':
            errorMessage = 'Microfone não encontrado';
            break;
          case 'network':
            errorMessage = 'Erro de rede';
            break;
          default:
            errorMessage = 'Erro desconhecido no reconhecimento de voz';
            break;
        }
        
        reject(new Error(errorMessage));
      };

      this.recognition.start();
    });
  }

  /**
   * Para a escuta
   */
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  /**
   * Fala um texto (Text to Speech) com configurações masculinas
   */
  speak(text, options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.isSupported.synthesis) {
        reject(new Error('Speech Synthesis não suportado neste navegador'));
        return;
      }

      // Para qualquer fala anterior
      this.stopSpeaking();

      // Remove emojis e caracteres especiais para melhor pronúncia
      const cleanText = text.replace(/[🤖⚡🔧👀👂🤔✨🎉🚀💬🎯]/g, '');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      // Força configurações masculinas
      utterance.lang = this.speechConfig.language;
      utterance.rate = options.rate || this.speechConfig.rate;
      utterance.pitch = options.pitch || 0.7; // FORÇAR tom mais grave
      utterance.volume = options.volume || this.speechConfig.volume;
      
      // Tenta forçar voz masculina se disponível
      if (!this.speechConfig.voice) {
        this.selectMaleVoice();
      }
      
      if (this.speechConfig.voice) {
        utterance.voice = this.speechConfig.voice;
        console.log('🎤 Usando voz:', this.speechConfig.voice.name, 'Pitch:', utterance.pitch);
      } else {
        console.warn('⚠️ Nenhuma voz específica definida, usando padrão');
      }

      utterance.onstart = () => {
        console.log('🔊 Edu-Ardu falando:', cleanText.substring(0, 50) + '...');
        console.log('🎛️ Configurações: Voice=', utterance.voice?.name, 'Pitch=', utterance.pitch, 'Rate=', utterance.rate);
      };

      utterance.onend = () => {
        console.log('🔊 Edu-Ardu terminou de falar');
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('Erro na síntese de voz:', event.error);
        this.currentUtterance = null;
        reject(new Error('Erro ao reproduzir áudio'));
      };

      this.currentUtterance = utterance;
      this.synthesis.speak(utterance);
    });
  }

  /**
   * Para a fala atual
   */
  stopSpeaking() {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }
    this.currentUtterance = null;
  }

  /**
   * Verifica se está falando
   */
  isSpeaking() {
    return this.synthesis.speaking;
  }

  /**
   * Solicita permissão de microfone
   */
  async requestMicrophonePermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Para o stream imediatamente, só queríamos a permissão
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Permissão de microfone negada:', error);
      return false;
    }
  }

  /**
   * Obtém status do serviço
   */
  getStatus() {
    return {
      isSupported: this.isSupported,
      isListening: this.isListening,
      isSpeaking: this.isSpeaking(),
      hasVoice: !!this.speechConfig.voice,
      voiceName: this.speechConfig.voice?.name || 'Padrão',
      language: this.speechConfig.language
    };
  }

  /**
   * Lista vozes disponíveis
   */
  getAvailableVoices() {
    if (!this.isSupported.synthesis) return [];
    
    return this.synthesis.getVoices()
      .filter(voice => voice.lang.includes('pt'))
      .map(voice => ({
        name: voice.name,
        lang: voice.lang,
        gender: voice.name.toLowerCase().includes('female') ? 'female' : 'male'
      }));
  }

  /**
   * Altera configurações de voz
   */
  updateVoiceSettings(settings) {
    if (settings.rate !== undefined) {
      this.speechConfig.rate = Math.max(0.1, Math.min(2, settings.rate));
    }
    if (settings.pitch !== undefined) {
      this.speechConfig.pitch = Math.max(0, Math.min(2, settings.pitch));
    }
    if (settings.volume !== undefined) {
      this.speechConfig.volume = Math.max(0, Math.min(1, settings.volume));
    }
  }

  /**
   * Testa diferentes vozes masculinas
   */
  testMaleVoices() {
    const voices = this.synthesis.getVoices();
    const ptVoices = voices.filter(v => v.lang.includes('pt'));
    
    console.log('🧪 Testando vozes masculinas disponíveis:');
    ptVoices.forEach((voice, index) => {
      console.log(`${index + 1}. ${voice.name} (${voice.lang}) - ${this.guessVoiceGender(voice.name)}`);
    });

    return ptVoices;
  }

  /**
   * Define voz por índice (para teste manual)
   */
  setVoiceByIndex(index) {
    const voices = this.synthesis.getVoices();
    const ptVoices = voices.filter(v => v.lang.includes('pt'));
    
    if (index >= 0 && index < ptVoices.length) {
      this.speechConfig.voice = ptVoices[index];
      console.log('✅ Voz alterada para:', ptVoices[index].name);
      return ptVoices[index];
    }
    
    return null;
  }

  /**
   * Teste rápido de voz masculina
   */
  async testMaleVoice() {
    console.log('🎤 Testando voz do Edu-Ardu...');
    try {
      await this.speak('Olá! Eu sou o Edu-Ardu, seu robô assistente!', { pitch: 0.6 });
    } catch (error) {
      console.error('Erro no teste de voz:', error);
    }
  }
}

// Instância singleton
const voiceService = new VoiceService();

export default voiceService;