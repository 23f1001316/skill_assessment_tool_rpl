// Text-To-Speech (TTS) Service Module
// Provides accessible Read Aloud audio playback for instructional prompts.
// Never auto-reads sensitive personal data (Aadhaar, phone, credentials).

export class TextToSpeechService {
  constructor() {
    this.currentUtterance = null;
    this.isPlaying = false;
  }

  isSupported() {
    if (typeof window === 'undefined') return false;
    return Boolean('speechSynthesis' in window && typeof window.SpeechSynthesisUtterance !== 'undefined');
  }

  // Find most suitable voice for the requested language
  getVoiceForLanguage(lang = 'en') {
    if (!this.isSupported()) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const targetPrefix = lang === 'hi' ? 'hi' : 'en';

    // 1. Exact match e.g. 'hi-IN' or 'en-IN'
    const exact = voices.find(v => v.lang.toLowerCase().replace('_', '-').startsWith(targetPrefix));
    if (exact) return exact;

    // 2. Fallback to default voice
    return voices.find(v => v.default) || voices[0] || null;
  }

  // Speak instructional text aloud
  speak(text, {
    language = 'en',
    onStart = () => {},
    onEnd = () => {},
    onError = () => {}
  } = {}) {
    if (!this.isSupported()) {
      onError({
        code: 'UNSUPPORTED',
        message: 'Text-to-speech audio is not supported in this browser.'
      });
      return false;
    }

    if (!text || !text.trim()) return false;

    try {
      // Cancel any ongoing playback first
      window.speechSynthesis.cancel();

      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.95; // Slightly slower pacing for accessibility and clear pronunciation
      utterance.pitch = 1.0;

      const voice = this.getVoiceForLanguage(language);
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        this.isPlaying = true;
        onStart();
      };

      utterance.onend = () => {
        this.isPlaying = false;
        this.currentUtterance = null;
        onEnd();
      };

      utterance.onerror = (event) => {
        this.isPlaying = false;
        this.currentUtterance = null;
        // Benign cancellation is not an error
        if (event.error !== 'canceled' && event.error !== 'interrupted') {
          onError({
            code: 'PLAYBACK_ERROR',
            message: `Playback error: ${event.error || 'Speech synthesis failed'}`
          });
        }
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
      return true;
    } catch (err) {
      this.isPlaying = false;
      onError({
        code: 'TTS_FAILED',
        message: err.message || 'Failed to start text-to-speech.'
      });
      return false;
    }
  }

  // Stop playback immediately
  stop() {
    if (this.isSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch (err) {
        console.warn('[TTSService] Cancel error:', err);
      }
    }
    this.isPlaying = false;
    this.currentUtterance = null;
  }
}

export const textToSpeechService = new TextToSpeechService();
