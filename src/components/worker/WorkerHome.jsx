import React, { useState, useEffect } from 'react';
import { Award, ArrowRight, CheckCircle2, Clock, Sparkles, FileText, ChevronRight, HelpCircle, ShieldCheck, UserCheck, Play, Briefcase, Volume2, VolumeX, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { StatusBadge, NsqfBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { ProgressBar } from '../common/ProgressBar';
import { HumanInTheLoopBanner } from '../common/HumanInTheLoopBanner';
import { textToSpeechService } from '../../services/textToSpeechService';

export const WorkerHome = ({
  onStartApplication,
  onContinueApplication,
  onViewStatus,
  onViewMatching,
  applicationData,
  currentStep
}) => {
  const { activeCandidate, candidates, setActiveCandidateId } = useApp();
  const { language, t } = useLanguage();
  const [isReadingSteps, setIsReadingSteps] = useState(false);

  useEffect(() => {
    return () => {
      textToSpeechService.stop();
    };
  }, []);

  const isCompleted = activeCandidate?.status === 'COMPETENT';
  const isSubmitted = activeCandidate?.status === 'SUBMITTED' || activeCandidate?.status === 'IN_REVIEW';
  const hasDraft = Boolean(applicationData?.fullName || activeCandidate?.name);

  // Compute overall progress percentage for the 4 application wizard steps
  const stepNumber = currentStep || 1;
  const progressPercent = isCompleted ? 100 : isSubmitted ? 100 : Math.round(((stepNumber) / 4) * 100);

  const handleToggleReadSteps = () => {
    if (isReadingSteps) {
      textToSpeechService.stop();
      setIsReadingSteps(false);
      return;
    }

    const stepsNarration = language === 'hi'
      ? 'कौशल सेतु RPL प्रक्रिया 4 सरल चरणों में: पहला चरण: अपनी प्रोफ़ाइल भरें और दैनिक कार्य घोषित करें। दूसरा चरण: अपने काम के फोटो या वॉइस रिकॉर्डिंग जोड़ें। तीसरा चरण: AI आपके काम को राष्ट्रीय व्यावसायिक मानकों से मिलाएगा। चौथा चरण: अधिकृत परीक्षक द्वारा प्रायोगिक परीक्षा लेकर सरकारी प्रमाण पत्र दिया जाएगा।'
      : 'KaushalSetu RPL certification in four simple steps. Step 1: Share your practical work experience and tools used. Step 2: Upload photos or voice notes of your work. Step 3: AI matches your competencies with National Occupational Standards. Step 4: Certified human assessor conducts practical exam and awards official certification.';

    textToSpeechService.speak(stepsNarration, {
      language,
      onStart: () => setIsReadingSteps(true),
      onEnd: () => setIsReadingSteps(false),
      onError: () => setIsReadingSteps(false)
    });
  };

  return (
    <div className="space-y-4">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-36 h-36 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="inline-flex items-center gap-1.5 bg-teal-500/20 text-teal-200 border border-teal-400/30 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>{t('rplAssessmentBadge')}</span>
          </div>
          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-300 font-mono">
            ID: {activeCandidate?.id || 'CAND-2026-001'}
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          {t('welcomeWorker')}, {activeCandidate?.name || (language === 'hi' ? 'कारीगर साथी' : 'Worker')}!
        </h1>
        <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-lg leading-relaxed">
          {t('workerHeroSubtitle')}
        </p>

        {/* Quick Candidate Switcher for Demo */}
        <div className="mt-4 pt-3 border-t border-teal-700/60 flex items-center justify-between text-xs">
          <span className="text-teal-200/90 text-[11px]">{t('activeProfileLabel')}:</span>
          <select
            value={activeCandidate?.id}
            onChange={(e) => {
              if (e.target.value === 'NEW_CANDIDATE') {
                onStartApplication();
              } else {
                setActiveCandidateId(e.target.value);
              }
            }}
            className="bg-teal-950/80 border border-teal-600/50 text-white text-[11px] rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
          >
            <option value="NEW_CANDIDATE" className="bg-teal-900 font-bold text-amber-300">
              + {language === 'hi' ? 'नया कारीगर पंजीकरण करें' : 'Register New Worker'}
            </option>
            {candidates.map((c) => (
              <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                {c.name || (language === 'hi' ? 'नया कारीगर' : 'New Candidate')} — {c.currentRoleName || (language === 'hi' ? 'नया आवेदन' : 'Draft')} ({c.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assessment Application Status & Progress Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {t('applicationStatusLabel')}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {activeCandidate?.currentRoleName || 'General Craftsperson'}
              </h2>
              <NsqfBadge level={activeCandidate?.nsqfLevel || 4} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('yearsExpLabel')}: {activeCandidate?.yearsExperience || 5} • {activeCandidate?.location || 'Lucknow, UP'}
            </p>
          </div>
          <StatusBadge status={activeCandidate?.status || 'DRAFT'} />
        </div>

        {/* Application Progress Bar */}
        <div className="mt-3 pt-3 border-t border-slate-100">
          <ProgressBar
            value={progressPercent}
            max={100}
            label={isCompleted ? t('statusCompetent') : isSubmitted ? t('statusSubmitted') : t('stepProgressText', { step: stepNumber })}
            valueText={`${progressPercent}%`}
            color={isCompleted ? "emerald" : "teal"}
            size="md"
          />
        </div>

        {/* Action Buttons: Start, Continue, View Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 pt-1">
          {(!isSubmitted && !isCompleted) ? (
            <>
              <Button
                variant="primary"
                size="md"
                onClick={onContinueApplication}
                icon={Play}
                fullWidth
              >
                {hasDraft ? t('continueAppBtn') : t('startNewAppBtn')}
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={onStartApplication}
                icon={FileText}
                fullWidth
              >
                {t('startNewAppBtn')}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="primary"
                size="md"
                onClick={onViewStatus}
                icon={CheckCircle2}
                fullWidth
              >
                {t('viewStatusBtn')}
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={onStartApplication}
                icon={FileText}
                fullWidth
              >
                {t('startNewAppBtn')}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Human In The Loop Mandate Notice */}
      <HumanInTheLoopBanner compact />

      {/* Simple Explanation of the RPL Process with Read Aloud option */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
              ?
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                {language === 'hi' ? 'RPL प्रमाणन कैसे काम करता है?' : 'How RPL Certification Works'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'hi' ? '4 सरल चरणों में पूर्व अनुभव की मान्यता' : 'Recognition of Prior Learning in 4 simple steps'}
              </p>
            </div>
          </div>

          {/* Accessible Read Aloud Audio Control */}
          <button
            type="button"
            onClick={handleToggleReadSteps}
            className={`min-h-[44px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 ${
              isReadingSteps
                ? 'bg-rose-50 border-rose-300 text-rose-700 ring-2 ring-rose-200 animate-pulse'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
            aria-label={isReadingSteps ? t('stopReadingBtn') : t('readAloudBtn')}
            title={isReadingSteps ? t('stopReadingBtn') : t('readAloudBtn')}
          >
            {isReadingSteps ? (
              <VolumeX className="w-4 h-4 text-rose-600" />
            ) : (
              <Volume2 className="w-4 h-4 text-teal-600" />
            )}
            <span className="hidden sm:inline">{isReadingSteps ? t('stopReadingBtn') : t('readAloudBtn')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 flex gap-2.5">
            <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
              1
            </span>
            <div>
              <h4 className="font-bold text-slate-900">
                {language === 'hi' ? 'कार्य अनुभव साझा करें' : 'Share Your Experience'}
              </h4>
              <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                {language === 'hi'
                  ? 'अपनी प्रोफ़ाइल भरें और दैनिक औजार, काम व कदमों का विवरण बोलकर या लिखकर दें।'
                  : 'Fill your profile and declare the tools, jobs, and tasks you perform in your own words.'}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 flex gap-2.5">
            <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
              2
            </span>
            <div>
              <h4 className="font-bold text-slate-900">
                {language === 'hi' ? 'काम के साक्ष्य जोड़ें' : 'Upload Work Samples'}
              </h4>
              <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                {language === 'hi'
                  ? 'तैयार काम के फोटो अपलोड करें या अपनी भाषा में छोटा वॉइस नोट जोड़ें।'
                  : 'Add photos of finished work or record a short voice description in your mother tongue.'}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 flex gap-2.5">
            <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
              3
            </span>
            <div>
              <h4 className="font-bold text-slate-900">
                {language === 'hi' ? 'AI कौशल पूर्व-परीक्षण' : 'AI Pre-Screening'}
              </h4>
              <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                {language === 'hi'
                  ? 'AI आपके काम को राष्ट्रीय व्यावसायिक मानकों (NOS) से व्यवस्थित करता है।'
                  : 'AI organizes evidence against National Occupational Standards (NOS) and identifies target NSQF levels.'}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 flex gap-2.5">
            <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
              4
            </span>
            <div>
              <h4 className="font-bold text-slate-900">
                {language === 'hi' ? 'मानव परीक्षक द्वारा परीक्षा' : 'Assessor Practical Exam'}
              </h4>
              <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                {language === 'hi'
                  ? 'अधिकृत परीक्षक प्रायोगिक परीक्षा लेकर सरकारी RPL प्रमाण पत्र जारी करता है।'
                  : 'A certified human assessor conducts a hands-on test at an ITI center and awards your official certificate.'}
              </p>
            </div>
          </div>

        </div>

        {/* Reassurance text */}
        <p className="text-[11px] text-slate-500 mt-3 pt-2.5 border-t border-slate-100 italic text-center">
          {language === 'hi'
            ? 'किसी स्कूल डिग्री की अनिवार्यता नहीं। केवल आपका व्यावहारिक हुनर और हाथ का काम महत्वपूर्ण है।'
            : 'No formal school degrees required. Only your practical skills and hands-on competence matter.'}
        </p>
      </div>

      {/* Official Standards Grounding Disclaimer */}
      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>{t('criteriaLanguageDisclaimer')}</span>
      </div>

      {/* Direct Link to Source-Grounded Qualification Matching */}
      {onViewMatching && (
        <div 
          onClick={onViewMatching}
          className="bg-gradient-to-r from-teal-50 to-sky-50 hover:from-teal-100/70 hover:to-sky-100/70 border border-teal-200/90 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer transition-all shadow-2xs group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  {language === 'hi' ? 'AI योग्यता मिलान' : 'AI Qualification Matching'}
                </h4>
                <span className="text-[10px] font-bold text-teal-800 bg-teal-100/80 px-1.5 py-0.2 rounded">
                  2,815 NQR Catalogue
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                {language === 'hi' ? 'घोषित कार्यों को आधिकारिक NSQF योग्यता पैक व पाठ्यचर्या से मिलाएं' : 'Match your declared tasks against official NSQF qualification packs & curriculum criteria'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-teal-600 group-hover:translate-x-0.5 transition-transform" />
        </div>
      )}

      {/* Direct Quick Link to Status Timeline */}
      <div 
        onClick={onViewStatus}
        className="bg-teal-50/80 hover:bg-teal-100/70 border border-teal-200 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-teal-950 text-xs sm:text-sm">
              {language === 'hi' ? 'परीक्षक मूल्यांकन व प्रमाण पत्र देखें' : 'Check Assessor Evaluation & Certificate'}
            </h4>
            <p className="text-[11px] text-teal-700">
              {language === 'hi' ? 'परीक्षा केंद्र, प्रगति समयसीमा और डिजिटल स्किल बैज देखें' : 'View milestone timeline, practical test center & digital skill badge'}
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-teal-600" />
      </div>

    </div>
  );
};
