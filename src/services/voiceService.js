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
      pitch: 0.9,  // Tom masculino (mais grave)
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
      
      // Procura voz masculina em português brasileiro para Edu-Ardu 🤖
      const preferredVoices = [
        'Google português do Brasil',
        'Microsoft Daniel - Portuguese (Brazil)', 
        'Microsoft Helio - Portuguese (Brazil)',
        'Daniel',
        'Helio',
        'Ricardo',
        'João'
      ];

      let selectedVoice = null;

      // Tenta encontrar voz masculina preferida
      for (const voiceName of preferredVoices) {
        selectedVoice = voices.find(voice => 
          voice.name.includes(voiceName) || 
          (voice.lang.includes('pt-BR') && 
           (voice.name.toLowerCase().includes('male') || 
            voice.name.toLowerCase().includes('daniel') ||
            voice.name.toLowerCase().includes('helio') ||
            voice.name.toLowerCase().includes('ricardo')))
        );
        if (selectedVoice) break;
      }

      // Se não encontrar voz masculina específica, procura qualquer voz masculina em português
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => 
          voice.lang.includes('pt-BR') && 
          !voice.name.toLowerCase().includes('female') &&
          !voice.name.toLowerCase().includes('maria') &&
          !voice.name.toLowerCase().includes('fernanda') &&
          !voice.name.toLowerCase().includes('luciana')
        );
      }

      // Se ainda não encontrar, usa qualquer voz em português
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => voice.lang.includes('pt-BR'));
      }

      // Se ainda não encontrar, usa voz padrão
      if (!selectedVoice && voices.length > 0) {
        selectedVoice = voices[0];
      }

      this.speechConfig.voice = selectedVoice;
      console.log('🤖 Voz do Edu-Ardu:', selectedVoice?.name || 'Padrão do sistema');
    };

    // Algumas vezes as vozes demoram para carregar
    if (this.synthesis.getVoices().length > 0) {
      setVoices();
    } else {
      this.synthesis.addEventListener('voiceschanged', setVoices);
    }
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
   * Fala um texto (Text to Speech)
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
      
      // Aplica configurações
      utterance.lang = this.speechConfig.language;
      utterance.rate = options.rate || this.speechConfig.rate;
      utterance.pitch = options.pitch || this.speechConfig.pitch;
      utterance.volume = options.volume || this.speechConfig.volume;
      
      if (this.speechConfig.voice) {
        utterance.voice = this.speechConfig.voice;
      }

      utterance.onstart = () => {
        console.log('🔊 Começou a falar:', cleanText.substring(0, 50) + '...');
      };

      utterance.onend = () => {
        console.log('🔊 Terminou de falar');
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
}

// Instância singleton
const voiceService = new VoiceService();

export default voiceService;