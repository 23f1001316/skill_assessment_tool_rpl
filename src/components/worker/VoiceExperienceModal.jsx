import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Square, Sparkles, Check, AlertCircle, RefreshCw, X, Shield, Volume2, Keyboard, Info } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useLanguage } from '../../context/LanguageContext';
import { speechRecognitionService } from '../../services/speechRecognitionService';

export const VoiceExperienceModal = ({ isOpen, onClose, onApplyTranscript }) => {
  const { language, t } = useLanguage();

  // Modal interaction steps: 'intro' | 'listening' | 'review'
  const [modalStep, setModalStep] = useState('intro');
  const [editableTranscript, setEditableTranscript] = useState('');
  const [liveInterim, setLiveInterim] = useState('');
  const [listeningSeconds, setListeningSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);
  const [errorCode, setErrorCode] = useState(null);

  const isBrowserSupported = speechRecognitionService.isSupported();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setModalStep(isBrowserSupported ? 'intro' : 'unsupported');
      setEditableTranscript('');
      setLiveInterim('');
      setListeningSeconds(0);
      setErrorMessage(null);
      setErrorCode(null);
    } else {
      speechRecognitionService.stopListening();
    }
  }, [isOpen, isBrowserSupported]);

  // Live timer while listening
  useEffect(() => {
    let timer;
    if (modalStep === 'listening') {
      timer = setInterval(() => {
        setListeningSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [modalStep]);

  // Step 1: User chooses to start voice input
  const handleStartListening = () => {
    setErrorMessage(null);
    setErrorCode(null);
    setLiveInterim('');
    setListeningSeconds(0);
    setModalStep('listening');

    speechRecognitionService.startListening({
      language,
      onStart: () => {
        // Recognition successfully initiated
      },
      onResult: ({ transcript, isFinal }) => {
        setLiveInterim(transcript);
        if (isFinal) {
          setEditableTranscript(transcript);
        }
      },
      onError: (err) => {
        setErrorCode(err.code);
        setErrorMessage(err.message);
        setModalStep('error');
      },
      onEnd: ({ finalTranscript }) => {
        const text = (finalTranscript || liveInterim || editableTranscript).trim();
        if (text) {
          setEditableTranscript(text);
          setModalStep('review');
        } else if (modalStep === 'listening') {
          setErrorCode('NO_SPEECH');
          setErrorMessage(t('voiceNoSpeechDetected'));
          setModalStep('error');
        }
      }
    });
  };

  // Step 2: Stop listening
  const handleStopListening = () => {
    speechRecognitionService.stopListening();
    const captured = (editableTranscript || liveInterim).trim();
    if (captured) {
      setEditableTranscript(captured);
      setModalStep('review');
    } else {
      setErrorCode('NO_SPEECH');
      setErrorMessage(t('voiceNoSpeechDetected'));
      setModalStep('error');
    }
  };

  // Step 3: Worker confirms & saves the transcript into the form
  const handleConfirmAndApply = () => {
    if (!editableTranscript.trim()) return;
    onApplyTranscript(editableTranscript.trim());
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('voiceModalTitle')}
      subtitle={t('voiceModalSubtitle')}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">

        {/* STEP 1: INTRO & VOLUNTARY CONSENT SCREEN */}
        {modalStep === 'intro' && (
          <div className="space-y-4 text-xs animate-in fade-in duration-200">
            {/* Optional Banner */}
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-3.5 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-teal-900 block font-bold mb-0.5">
                  {t('voiceInputOptionalBanner')}
                </strong>
                <p className="text-teal-800 leading-relaxed text-[11px]">
                  Speaking makes it easier to explain complex wiring, welding, tailoring, or caregiving steps without typing on a small keyboard.
                </p>
              </div>
            </div>

            {/* Privacy Transparency Notice */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-1.5 text-slate-600">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
                <Shield className="w-3.5 h-3.5 text-teal-600" />
                <span>Privacy & Speech Processing Disclosure</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                • <strong>Browser Web Speech API:</strong> Speech is recognized using your device's browser engine. No third-party datasets or models (e.g. Bhashini, Kathbath) are connected in this client-side prototype.<br/>
                • <strong>No Audio Storage:</strong> Raw audio is not saved to disk or broadcast externally.<br/>
                • <strong>Full Control:</strong> You can review and edit every recognized word before adding it to your application.
              </p>
            </div>

            {/* Language Tag Indicator */}
            <div className="flex items-center justify-between bg-slate-100 p-2.5 rounded-xl text-[11px] text-slate-600">
              <span>Recognition Language:</span>
              <span className="font-bold text-teal-800 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                {language === 'hi' ? 'हिन्दी (Hindi - India)' : 'English (India)'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-end">
              <Button
                variant="outline"
                size="md"
                onClick={onClose}
                icon={Keyboard}
                className="w-full sm:w-auto"
              >
                Type with Keyboard Instead
              </Button>
              <button
                type="button"
                onClick={handleStartListening}
                className="min-h-[48px] px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all focus:ring-2 focus:ring-teal-500 focus:outline-none"
                aria-label={t('voiceMicStart')}
              >
                <Mic className="w-4 h-4 text-white" />
                <span>{t('voiceMicStart')}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: ACTIVE LISTENING SCREEN */}
        {modalStep === 'listening' && (
          <div className="py-4 space-y-4 text-center animate-in zoom-in-95 duration-200">
            {/* Pulsing Visual Waveform Container */}
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping" />
              <span className="absolute inset-2 rounded-full bg-rose-500/30 animate-pulse" />
              <button
                type="button"
                onClick={handleStopListening}
                className="min-w-[64px] min-h-[64px] w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white flex items-center justify-center z-10 shadow-lg shadow-rose-600/40 transition-all focus:outline-none focus:ring-4 focus:ring-rose-300"
                aria-label={t('voiceMicStop')}
                title="Tap to finish speaking"
              >
                <Square className="w-6 h-6 fill-current" />
              </button>
            </div>

            <div>
              <div className="text-sm font-bold text-slate-900 flex items-center justify-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span>{t('voiceListeningState', { lang: language === 'hi' ? 'हिन्दी' : 'English' })}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Listening time: <strong>{listeningSeconds}s</strong> • Tap red square when done
              </p>
            </div>

            {/* Live Streaming Transcript Card */}
            <div className="bg-slate-50 border-2 border-dashed border-teal-400/60 rounded-2xl p-4 text-left max-h-40 overflow-y-auto">
              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block mb-1">
                Live Speech Recognition:
              </span>
              <p className="text-xs text-slate-800 leading-relaxed italic">
                {liveInterim || editableTranscript || "Speak now: describe your tools, steps, and safety checks..."}
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={handleStopListening}
              className="w-full bg-rose-600 hover:bg-rose-700 border-rose-600"
            >
              <Square className="w-3.5 h-3.5 mr-1.5 fill-current" />
              {t('voiceMicStop')}
            </Button>
          </div>
        )}

        {/* STEP 3: TRANSCRIPTION REVIEW & EDIT SCREEN */}
        {modalStep === 'review' && (
          <div className="space-y-3.5 text-xs animate-in fade-in duration-200">
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 flex items-start gap-2">
              <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-teal-900 font-bold block">{t('voiceTranscriptPrompt')}</strong>
                <p className="text-teal-800 text-[11px]">{t('voiceTranscriptHelper')}</p>
              </div>
            </div>

            {/* Editable Text Field */}
            <div>
              <label htmlFor="voice-edit-field" className="font-bold text-slate-800 block mb-1">
                Transcribed Work Description (Editable):
              </label>
              <textarea
                id="voice-edit-field"
                rows="4"
                value={editableTranscript}
                onChange={(e) => setEditableTranscript(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white leading-relaxed"
                placeholder="Edit or add any details here..."
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleStartListening}
                className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 p-2 rounded-lg hover:bg-slate-100"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{t('voiceReRecordBtn')}</span>
              </button>

              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="md"
                  onClick={onClose}
                  className="flex-1 sm:flex-none"
                >
                  {t('cancel')}
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  disabled={!editableTranscript.trim()}
                  onClick={handleConfirmAndApply}
                  icon={Check}
                  className="flex-1 sm:flex-none min-h-[44px]"
                >
                  {t('voiceConfirmApplyBtn')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ERROR / PERMISSION DENIED SCREEN */}
        {modalStep === 'error' && (
          <div className="space-y-4 text-xs animate-in fade-in duration-200">
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-rose-900 font-bold block text-sm">
                  {errorCode === 'PERMISSION_DENIED' ? "Microphone Permission Required" : "Speech Input Notice"}
                </strong>
                <p className="text-rose-800 mt-1 leading-relaxed">
                  {errorMessage || t('voiceMicDenied')}
                </p>
                {errorCode === 'PERMISSION_DENIED' && (
                  <p className="text-rose-700 text-[11px] mt-2">
                    To enable: tap the lock or settings icon in your browser's address bar and allow Microphone access.
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <Button
                variant="outline"
                size="md"
                onClick={onClose}
                icon={Keyboard}
              >
                Continue with Keyboard Input
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleStartListening}
                icon={RefreshCw}
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* UNSUPPORTED BROWSER SCREEN */}
        {modalStep === 'unsupported' && (
          <div className="space-y-4 text-xs">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-900 font-bold block text-sm">
                  Browser Compatibility Notice
                </strong>
                <p className="text-amber-800 mt-1 leading-relaxed">
                  {t('voiceBrowserUnsupported')}
                </p>
                <p className="text-amber-700 text-[11px] mt-2">
                  All features remain 100% usable through normal keyboard and touch input.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button
                variant="primary"
                size="md"
                onClick={onClose}
                icon={Keyboard}
              >
                Use Standard Text Input
              </Button>
            </div>
          </div>
        )}

      </div>
    </Modal>
  );
};
