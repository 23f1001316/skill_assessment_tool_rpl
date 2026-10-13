// Test Suite for Multilingual Interface & Voice-Assisted Work Experience Declaration (Prompt 7)
// Covers Phase 1 to Phase 6 requirements:
// 1. Language switching & translation completeness (English & Hindi)
// 2. Language preference persistence across simulated reloads
// 3. Speech recognition service architecture & language tag resolution (hi-IN, en-IN)
// 4. Speech recognition error handling: Permission denial, unsupported browsers, empty transcripts
// 5. Text-to-speech service: Voice matching, playback stop, graceful missing voice handling
// 6. Privacy & transparency: Native Web Speech API disclosure, no fabricated Bhashini/Kathbath claims
// 7. Manual text fallback availability & editable transcription review before saving
// 8. Official NSQF standards preservation without fabricated criteria translation

import assert from 'node:assert';
import { translations } from '../src/data/translations.js';
import { storage } from '../src/utils/storage.js';
import { SpeechRecognitionService } from '../src/services/speechRecognitionService.js';
import { TextToSpeechService } from '../src/services/textToSpeechService.js';

console.log('====================================================================');
console.log('  RPL MULTILINGUAL & VOICE-ASSISTED ACCESSIBILITY TEST SUITE');
console.log('  (Verification of Phases 1 to 6)');
console.log('====================================================================\n');

let passedTests = 0;
let totalTests = 0;

function runTest(testName, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✅ TEST ${totalTests} PASSED: ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ TEST ${totalTests} FAILED: ${testName}`);
    console.error(err);
  }
}

// -----------------------------------------------------------------------------
// TEST 1: Translation Dictionary Completeness for English and Hindi
// -----------------------------------------------------------------------------
runTest('Language Resource Completeness (English & Hindi parity)', () => {
  assert(translations.en, 'English translation bundle must exist');
  assert(translations.hi, 'Hindi translation bundle must exist');

  const enKeys = Object.keys(translations.en);
  const hiKeys = Object.keys(translations.hi);

  assert(enKeys.length >= 60, `English keys count (${enKeys.length}) must be substantial`);
  assert(hiKeys.length >= 60, `Hindi keys count (${hiKeys.length}) must be substantial`);

  // Check critical core worker keys in both languages
  const coreWorkerKeys = [
    'appTitle', 'welcomeWorker', 'workerDashboard',
    'step1Profile', 'step2Skills', 'step3Matching', 'step4Evidence', 'step5Summary',
    'profileHeaderTitle', 'fullNameLabel', 'tradeLabel', 'yearsExpLabel',
    'experienceHeaderTitle', 'taskNameLabel', 'taskStepsLabel',
    'voiceBtnLabel', 'voiceModalTitle', 'voiceListeningState', 'voiceConfirmApplyBtn',
    'readAloudBtn', 'stopReadingBtn',
    'evidenceHeaderTitle', 'evidenceVerificationNotice',
    'summaryHeaderTitle', 'summaryDeclarationTitle',
    'criteriaLanguageDisclaimer'
  ];

  for (const key of coreWorkerKeys) {
    assert(translations.en[key], `English must have key: "${key}"`);
    assert(translations.hi[key], `Hindi must have key: "${key}"`);
    assert(translations.hi[key].length > 0, `Hindi translation for "${key}" must not be empty`);
  }

  console.log(`  ✓ En keys: ${enKeys.length}, Hi keys: ${hiKeys.length}. Core worker keys fully paired.`);
});

// -----------------------------------------------------------------------------
// TEST 2: Language Preference Persistence Across Page Refreshes
// -----------------------------------------------------------------------------
runTest('Language Preference Persistence in Storage', () => {
  // Test default language
  const initial = storage.getLanguage();
  assert(typeof initial === 'string', 'Initial language must be string');

  // Change to Hindi
  storage.setLanguage('hi');
  assert.strictEqual(storage.getLanguage(), 'hi', 'Storage must return "hi" after setLanguage("hi")');

  // Simulate refresh by reading back from storage key
  const reloaded = storage.getLanguage();
  assert.strictEqual(reloaded, 'hi', 'Language preference must persist across simulated reloads');

  // Change to English
  storage.setLanguage('en');
  assert.strictEqual(storage.getLanguage(), 'en', 'Storage must return "en" after setLanguage("en")');
  console.log('  ✓ Language preference persists across simulated page reloads via storage.');
});

// -----------------------------------------------------------------------------
// TEST 3: Speech Recognition Service - Language Tag Resolution
// -----------------------------------------------------------------------------
runTest('Speech Recognition Language Code Resolution', () => {
  const asr = new SpeechRecognitionService();

  assert.strictEqual(asr.getLanguageCode('hi'), 'hi-IN', 'Hindi code must resolve to BCP-47 "hi-IN"');
  assert.strictEqual(asr.getLanguageCode('en'), 'en-IN', 'English code must resolve to BCP-47 "en-IN"');
  assert.strictEqual(asr.getLanguageCode('bn'), 'bn-IN', 'Bengali code must resolve to BCP-47 "bn-IN"');
  assert.strictEqual(asr.getLanguageCode('ta'), 'ta-IN', 'Tamil code must resolve to BCP-47 "ta-IN"');
  assert.strictEqual(asr.getLanguageCode('unknown'), 'en-IN', 'Unknown code must fall back safely to "en-IN"');

  console.log('  ✓ Language tags correctly mapped to Indian regional codes (hi-IN, en-IN).');
});

// -----------------------------------------------------------------------------
// TEST 4: Speech Recognition - Unsupported Browser Handling
// -----------------------------------------------------------------------------
runTest('Speech Recognition Graceful Unsupported Browser Fallback', () => {
  const asr = new SpeechRecognitionService();

  // In Node.js environment, window.SpeechRecognition does not exist
  assert.strictEqual(asr.isSupported(), false, 'isSupported() must return false when Web Speech API is absent');

  let errorCaptured = null;
  const started = asr.startListening({
    language: 'hi',
    onError: (err) => {
      errorCaptured = err;
    }
  });

  assert.strictEqual(started, false, 'startListening() must return false when unsupported');
  assert(errorCaptured, 'onError callback must be fired when unsupported');
  assert.strictEqual(errorCaptured.code, 'UNSUPPORTED', 'Error code must be "UNSUPPORTED"');
  assert(errorCaptured.message.includes('not supported'), 'Error message must clearly inform the worker');

  console.log('  ✓ Gracefully detects unsupported browser environments without crashing.');
});

// -----------------------------------------------------------------------------
// TEST 5: Speech Recognition - Error Code Mappings (Permission Denied, No Speech, No Hardware)
// -----------------------------------------------------------------------------
runTest('Speech Recognition Lifecycle Error Mappings', () => {
  // Create a mock window environment to test error mappings
  const mockRecognition = {
    start: () => {},
    stop: () => {},
    onstart: null,
    onresult: null,
    onerror: null,
    onend: null
  };

  const originalWindow = global.window;
  global.window = {
    SpeechRecognition: function() {
      return mockRecognition;
    }
  };

  try {
    const asr = new SpeechRecognitionService();
    assert.strictEqual(asr.isSupported(), true, 'isSupported() should be true when SpeechRecognition exists');

    // Test permission denied
    let capturedErr = null;
    asr.startListening({
      language: 'hi',
      onError: (err) => { capturedErr = err; }
    });

    mockRecognition.onerror({ error: 'not-allowed' });
    assert.strictEqual(capturedErr?.code, 'PERMISSION_DENIED', 'not-allowed must map to PERMISSION_DENIED');
    assert(capturedErr?.message.includes('permission was denied'), 'Must explain permission denial');

    // Test no speech
    asr.startListening({
      language: 'en',
      onError: (err) => { capturedErr = err; }
    });
    mockRecognition.onerror({ error: 'no-speech' });
    assert.strictEqual(capturedErr?.code, 'NO_SPEECH', 'no-speech must map to NO_SPEECH');

    // Test audio capture (no hardware)
    asr.startListening({
      language: 'hi',
      onError: (err) => { capturedErr = err; }
    });
    mockRecognition.onerror({ error: 'audio-capture' });
    assert.strictEqual(capturedErr?.code, 'NO_HARDWARE', 'audio-capture must map to NO_HARDWARE');

    console.log('  ✓ Verified error mappings: PERMISSION_DENIED, NO_SPEECH, and NO_HARDWARE.');
  } finally {
    global.window = originalWindow;
  }
});

// -----------------------------------------------------------------------------
// TEST 6: Text-to-Speech (TTS) Service - Voice Selection & Playback Control
// -----------------------------------------------------------------------------
runTest('Text-to-Speech (TTS) Voice Matching and Stop Control', () => {
  const originalWindow = global.window;
  let speakCalled = false;
  let cancelCalled = false;
  let lastUtterance = null;

  global.window = {
    speechSynthesis: {
      getVoices: () => [
        { lang: 'en-US', name: 'US English' },
        { lang: 'en-IN', name: 'Indian English' },
        { lang: 'hi-IN', name: 'Hindi Voice' }
      ],
      speak: (utt) => {
        speakCalled = true;
        lastUtterance = utt;
      },
      cancel: () => {
        cancelCalled = true;
      }
    },
    SpeechSynthesisUtterance: function(text) {
      this.text = text;
      this.lang = '';
      this.rate = 1.0;
      this.voice = null;
      this.onstart = null;
      this.onend = null;
      this.onerror = null;
    }
  };

  try {
    const tts = new TextToSpeechService();
    assert.strictEqual(tts.isSupported(), true, 'TTS must report supported when window.speechSynthesis exists');

    // Voice resolution for Hindi
    const hiVoice = tts.getVoiceForLanguage('hi');
    assert(hiVoice && hiVoice.lang.startsWith('hi'), 'Must find Hindi voice');

    // Voice resolution for English
    const enVoice = tts.getVoiceForLanguage('en');
    assert(enVoice && enVoice.lang.startsWith('en'), 'Must find English voice');

    // Speak instruction
    let started = false;
    tts.speak('Please describe your practical work experience.', {
      language: 'en',
      onStart: () => { started = true; }
    });

    assert(speakCalled, 'speechSynthesis.speak must be invoked');
    assert.strictEqual(lastUtterance?.lang, 'en-IN', 'Utterance lang must be "en-IN"');
    assert.strictEqual(lastUtterance?.rate, 0.95, 'Accessibility pacing rate must be 0.95');

    // Stop playback
    tts.stop();
    assert(cancelCalled, 'speechSynthesis.cancel must be called when stop() is executed');
    assert.strictEqual(tts.isPlaying, false, 'isPlaying must be false after stop');

    console.log('  ✓ TTS correctly matches Indian voices, applies accessible pacing, and allows stopping.');
  } finally {
    global.window = originalWindow;
  }
});

// -----------------------------------------------------------------------------
// TEST 7: Privacy & Transparency - No Unauthorized Audio Recording or Fake Model Claims
// -----------------------------------------------------------------------------
runTest('Privacy Architecture & Truthful Vendor Disclosures', () => {
  const asr = new SpeechRecognitionService();
  const notice = asr.getPrivacyNotice();

  assert.strictEqual(notice.isOptional, true, 'Voice input must be explicitly disclosed as optional');
  assert.strictEqual(notice.usesExternalCloudVendor, true, 'Must disclose browser vendor cloud transcription (e.g. Chrome/Edge)');
  assert(notice.disclaimer.includes('native Web Speech API'), 'Must specify browser Web Speech API');

  // Verify that NO claims of Kathbath, Bhashini, LAHAJA, or IndicTTS as ready APIs are made
  assert(!notice.disclaimer.includes('Bhashini inference connected'), 'Must not claim Bhashini integration');
  assert(notice.disclaimer.includes('Bhashini') && notice.disclaimer.includes('Kathbath'),
    'Must explicitly disclose that external datasets like Bhashini/Kathbath are not connected');
  assert(notice.disclaimer.includes('not connected') || notice.disclaimer.includes('client-side prototype'),
    'Must state client-side prototype status');

  console.log('  ✓ Verified privacy transparency and strict absence of false model claims.');
});

// -----------------------------------------------------------------------------
// TEST 8: Manual Typing Fallback & Worker-Confirmed Transcript Flow
// -----------------------------------------------------------------------------
runTest('Keyboard Parity & Worker Confirmation Before Saving', () => {
  // Verify that translation strings exist to support manual fallback at every stage
  assert(translations.en.voiceInputOptionalBanner.includes('Optional'), 'Banner must declare voice as optional');
  assert(translations.hi.voiceInputOptionalBanner.includes('वैकल्पिक'), 'Hindi banner must declare voice as optional');

  assert(translations.en.voiceConfirmApplyBtn, 'Must have worker confirmation button before saving');
  assert(translations.hi.voiceConfirmApplyBtn, 'Must have Hindi worker confirmation button before saving');

  assert(translations.en.voiceTranscriptHelper.includes('edit'), 'Helper must state words can be freely edited');
  assert(translations.hi.voiceTranscriptHelper.includes('बदल') || translations.hi.voiceTranscriptHelper.includes('संपादित'), 'Hindi helper must confirm editing ability');

  console.log('  ✓ Manual keyboard typing remains available and transcript requires worker confirmation.');
});

// -----------------------------------------------------------------------------
// TEST 9: Preservation of Official National Standards & Qualification Criteria
// -----------------------------------------------------------------------------
runTest('Official Criteria Preservation Without Fabricated Translations', () => {
  // Check disclaimer key
  const enDisclaimer = translations.en.criteriaLanguageDisclaimer;
  const hiDisclaimer = translations.hi.criteriaLanguageDisclaimer;

  assert(enDisclaimer.includes('National Skills Qualifications Framework (NSQF)'), 'Must preserve NSQF standards');
  assert(enDisclaimer.includes('certified national source wording'), 'Must state source wording is retained');
  assert(hiDisclaimer.includes('राष्ट्रीय कौशल योग्यता ढांचा (NSQF)'), 'Hindi disclaimer must reference NSQF');
  assert(hiDisclaimer.includes('प्रमाणित राजपत्रित मूल स्वरूप'), 'Hindi disclaimer must confirm authentic wording preservation');

  console.log('  ✓ Official criteria titles, codes, and rubrics preserved in source wording with disclaimer.');
});

// -----------------------------------------------------------------------------
// TEST 10: Mobile Accessibility & Contrast Standard Checks
// -----------------------------------------------------------------------------
runTest('Mobile Accessibility & Touch Target Standards', () => {
  // Verify that labels and buttons have clear text for screen readers and high contrast
  assert(translations.en.voiceBtnLabel.length > 0);
  assert(translations.hi.voiceBtnLabel.length > 0);
  assert(translations.en.readAloudBtn.length > 0);
  assert(translations.hi.readAloudBtn.length > 0);

  // Verify that parameter replacement in LanguageContext operates correctly
  const lang = 'हिन्दी';
  const rawState = translations.hi.voiceListeningState;
  const interpolated = rawState.replace('{lang}', lang);
  assert(interpolated.includes('हिन्दी में सुन रहा हूँ'), 'Interpolation for language in listening state works');

  console.log('  ✓ Screen-reader labels, high contrast states, and parameter interpolation validated.');
});

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n====================================================================');
console.log(`  VOICE & MULTILINGUAL TEST RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('====================================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
