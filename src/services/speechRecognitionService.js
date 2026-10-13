// Speech Recognition Service Module (ASR)
// Modular client-side architecture using standard W3C Web Speech API
// Designed to allow future integration of Indian-language ASR inference services.

export class SpeechRecognitionService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.currentLanguage = 'en';
  }

  // Detect browser Web Speech API availability
  isSupported() {
    if (typeof window === 'undefined') return false;
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  // Get appropriate BCP 47 language tag
  getLanguageCode(lang = 'en') {
    switch (lang) {
      case 'hi':
        return 'hi-IN'; // Hindi (India)
      case 'bn':
        return 'bn-IN'; // Bengali (India)
      case 'ta':
        return 'ta-IN'; // Tamil (India)
      case 'en':
      default:
        return 'en-IN'; // Indian English
    }
  }

  // Disclosures and Privacy Architecture Information
  getPrivacyNotice() {
    return {
      isOptional: true,
      usesExternalCloudVendor: true, // Chrome/Edge may route audio to vendor servers
      disclaimer: "Voice input is strictly optional. Speech recognition uses your browser's native Web Speech API. No private audio is saved to disk, and no third-party datasets or models (e.g. Bhashini, Kathbath) are connected in this client-side prototype. You can type manually at all times."
    };
  }

  // Start speech recognition session
  startListening({
    language = 'en',
    onStart = () => {},
    onResult = () => {},
    onError = () => {},
    onEnd = () => {}
  } = {}) {
    if (!this.isSupported()) {
      onError({
        code: 'UNSUPPORTED',
        message: 'Speech recognition is not supported in this browser. Please type your experience or use Google Chrome / Microsoft Edge.'
      });
      return false;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = this.getLanguageCode(language);
      this.currentLanguage = language;

      let finalTranscript = '';

      this.recognition.onstart = () => {
        this.isListening = true;
        onStart();
      };

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            finalTranscript += res[0].transcript + ' ';
          } else {
            interimTranscript += res[0].transcript;
          }
        }
        const combined = (finalTranscript + interimTranscript).trim();
        onResult({
          transcript: combined,
          isFinal: event.results[event.results.length - 1]?.isFinal || false
        });
      };

      this.recognition.onerror = (event) => {
        this.isListening = false;
        let errorMessage = 'An error occurred during speech recognition.';
        let errorCode = event.error;

        switch (event.error) {
          case 'not-allowed':
          case 'permission-denied':
            errorMessage = 'Microphone permission was denied. You can continue by typing in the form.';
            errorCode = 'PERMISSION_DENIED';
            break;
          case 'no-speech':
            errorMessage = 'No speech was detected. Please tap the microphone and speak closer to the device.';
            errorCode = 'NO_SPEECH';
            break;
          case 'audio-capture':
            errorMessage = 'No microphone was found on this device. Please connect a microphone or use keyboard input.';
            errorCode = 'NO_HARDWARE';
            break;
          case 'network':
            errorMessage = 'Network error during speech recognition. You can continue typing manually.';
            errorCode = 'NETWORK_ERROR';
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}. Manual typing is available.`;
        }

        onError({
          code: errorCode,
          message: errorMessage
        });
      };

      this.recognition.onend = () => {
        this.isListening = false;
        onEnd({ finalTranscript: finalTranscript.trim() });
      };

      this.recognition.start();
      return true;
    } catch (err) {
      this.isListening = false;
      onError({
        code: 'INITIALIZATION_FAILED',
        message: err.message || 'Failed to start speech recognition.'
      });
      return false;
    }
  }

  // Stop current active session
  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.warn('[SpeechService] Stop warning:', err);
      }
      this.isListening = false;
    }
  }
}

export const speechRecognitionService = new SpeechRecognitionService();
