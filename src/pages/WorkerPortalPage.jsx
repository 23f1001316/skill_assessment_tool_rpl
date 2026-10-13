import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { WorkerHome } from '../components/worker/WorkerHome';
import { WorkerProfileForm } from '../components/worker/WorkerProfileForm';
import { ExperienceDeclarationForm } from '../components/worker/ExperienceDeclarationForm';
import { EvidenceUploadSection } from '../components/worker/EvidenceUploadSection';
import { ApplicationSummaryView } from '../components/worker/ApplicationSummaryView';
import { AssessmentStatusTracker } from '../components/worker/AssessmentStatusTracker';
import { DigitalSkillCertificate } from '../components/worker/DigitalSkillCertificate';
import { AiSkillMappingView } from '../components/worker/AiSkillMappingView';
import { VoiceWorkLogModal } from '../components/worker/VoiceWorkLogModal';
import { EvidenceUploader } from '../components/worker/EvidenceUploader';
import { BottomNav } from '../components/layout/BottomNav';
import { qualificationMatchingService } from '../services/qualificationMatchingService';
import { QualificationMatchingResults } from '../components/matching/QualificationMatchingResults';
import { offlineDbService } from '../services/offlineDb';
import { syncService } from '../services/syncService';
import { Button } from '../components/common/Button';
import { CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';

const DRAFT_STORAGE_KEY = 'kaushalsetu_worker_application_draft_v1';

export const WorkerPortalPage = () => {
  const { activeCandidate, updateCandidate, runAiPreAssessment, registerNewCandidate } = useApp();
  const { t, language } = useLanguage();

  // Screens: 'home' | 'profile' | 'experience' | 'matching' | 'evidence' | 'summary' | 'status' | 'ai_review' | 'certificate'
  const [currentScreen, setCurrentScreen] = useState(() => (!activeCandidate?.name ? 'profile' : 'home'));

  // Matching state
  const [matchingResults, setMatchingResults] = useState(null);
  const [isMatchingLoading, setIsMatchingLoading] = useState(false);

  // Modals
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState(null);

  // Application Draft State with LocalStorage persistence
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.candidateId === activeCandidate?.id && parsed.formData) {
          return parsed.formData;
        }
      }
    } catch {}

    return {
      fullName: activeCandidate?.name || '',
      preferredLanguage: activeCandidate?.language || language || 'hi',
      trade: activeCandidate?.currentRoleName || '',
      yearsExperience: activeCandidate?.yearsExperience || 1,
      previousTraining: 'Informal apprenticeship (Learned under Master/Ustad)',
      workActivities: activeCandidate?.currentRoleName ? `Practical field work in ${activeCandidate.currentRoleName}` : '',
      phone: activeCandidate?.phone || '',
      location: activeCandidate?.location || '',
      hasConsent: Boolean(activeCandidate?.hasConsent)
    };
  });

  const [declaredSkills, setDeclaredSkills] = useState(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.candidateId === activeCandidate?.id && parsed.declaredSkills) {
          return parsed.declaredSkills;
        }
      }
    } catch {}

    // Only supply pre-existing electrical skills for demo candidate Ramesh Kumar
    if (activeCandidate?.id === 'CAND-2026-001') {
      return [
        {
          id: 'sk-1',
          title: 'Three-Phase MCB Panel Dressing & Circuit Protection',
          tools: 'Neon tester, 40A RCCB, 16A MCB Type-C, DIN rail, crimper, insulated pliers',
          description: 'Install and terminate three-phase distribution box. Route color-coded phase lines (Red, Yellow, Blue) through PVC trunking and connect RCCB with 30mA sensitivity for shock protection.',
          frequency: 'Daily / Regular Work'
        },
        {
          id: 'sk-2',
          title: 'Earthing Pit Resistance Measurement & Maintenance',
          tools: 'Digital earth tester, multimeter, salt and charcoal, copper electrode',
          description: 'Inspect earth electrode pit, pour water with salt/charcoal mix, measure loop resistance ensuring reading stays below 3 ohms according to IS safety regulations.',
          frequency: 'Weekly Projects'
        }
      ];
    }
    return [];
  });

  const [evidenceList, setEvidenceList] = useState(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.candidateId === activeCandidate?.id && parsed.evidenceList) {
          return parsed.evidenceList;
        }
      }
    } catch {}

    return activeCandidate?.evidenceList?.map(ev => ({
      id: ev.id,
      fileName: ev.title,
      fileSize: '2.1 MB',
      type: ev.type === 'audio' ? 'Voice Audio Narrative' : 'Photo of Completed Work',
      relatedSkill: activeCandidate?.currentRoleName || 'General Skill',
      description: ev.aiAnalysis?.qualityAssessment || (ev.transcript ? `Voice note: "${ev.transcript.substring(0, 70)}..."` : 'Field work evidence artifact.'),
      url: ev.url || null,
      uploadDate: ev.date || 'Recent',
      verificationStatus: 'Pending Review'
    })) || [];
  });

  // Hydrate draft from IndexedDB (Dexie) if exists
  useEffect(() => {
    let isMounted = true;
    async function hydrateDraft() {
      if (!activeCandidate?.id) return;
      try {
        const draft = await offlineDbService.getWorkerDraft(activeCandidate.id);
        if (draft && isMounted) {
          if (draft.formData) setFormData(prev => ({ ...prev, ...draft.formData }));
          if (draft.declaredSkills && draft.declaredSkills.length > 0) setDeclaredSkills(draft.declaredSkills);
          if (draft.evidenceList && draft.evidenceList.length > 0) setEvidenceList(draft.evidenceList);
        }
      } catch (err) {
        console.warn('[WorkerPortal] Failed to hydrate draft from IndexedDB:', err);
      }
    }
    hydrateDraft();
    return () => { isMounted = false; };
  }, [activeCandidate?.id]);

  // Sync draft changes to IndexedDB and LocalStorage so refreshing the page never erases data
  useEffect(() => {
    try {
      const payload = { candidateId: activeCandidate?.id, formData, declaredSkills, evidenceList };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
      offlineDbService.saveWorkerDraft(activeCandidate?.id, payload);
    } catch (e) {
      console.error('Failed to auto-save application draft', e);
    }
  }, [formData, declaredSkills, evidenceList, activeCandidate?.id]);

  // When activeCandidate changes, update form data if needed
  useEffect(() => {
    if (!activeCandidate) return;

    if (!activeCandidate.name) {
      setFormData({
        fullName: '',
        preferredLanguage: activeCandidate.language || language || 'hi',
        trade: '',
        yearsExperience: 1,
        previousTraining: 'Informal apprenticeship (Learned under Master/Ustad)',
        workActivities: '',
        phone: '',
        location: '',
        hasConsent: false
      });
      setDeclaredSkills([]);
      setEvidenceList([]);
      setCurrentScreen('profile');
    } else {
      setFormData({
        fullName: activeCandidate.name,
        preferredLanguage: activeCandidate.language || language || 'hi',
        trade: activeCandidate.currentRoleName || '',
        yearsExperience: activeCandidate.yearsExperience || 1,
        previousTraining: 'Informal apprenticeship (Learned under Master/Ustad)',
        workActivities: activeCandidate.workActivities || (activeCandidate.currentRoleName ? `Practical field work in ${activeCandidate.currentRoleName}` : ''),
        phone: activeCandidate.phone || '',
        location: activeCandidate.location || '',
        hasConsent: Boolean(activeCandidate.hasConsent)
      });
      if (activeCandidate.evidenceList) {
        setEvidenceList(activeCandidate.evidenceList.map(ev => ({
          id: ev.id,
          fileName: ev.title,
          fileSize: '2.1 MB',
          type: ev.type === 'audio' ? 'Voice Audio Narrative' : 'Photo of Completed Work',
          relatedSkill: activeCandidate.currentRoleName || 'General Skill',
          description: ev.aiAnalysis?.qualityAssessment || (ev.transcript ? `Voice note: "${ev.transcript.substring(0, 70)}..."` : 'Field work evidence artifact.'),
          url: ev.url || null,
          uploadDate: ev.date || 'Recent',
          verificationStatus: 'Pending Review'
        })));
      }
    }
  }, [activeCandidate?.id]);

  const showToast = (message) => {
    setFeedbackToast(message);
    setTimeout(() => {
      setFeedbackToast(null);
    }, 3500);
  };

  const handleUpdateFormData = (fields) => {
    setFormData(prev => ({ ...prev, ...fields }));
  };

  const handleSaveDraft = () => {
    const isOnline = syncService.isOnline();
    offlineDbService.saveWorkerDraft(activeCandidate?.id, { formData, declaredSkills, evidenceList });
    syncService.enqueueOperation({
      entityType: 'WORKER_DRAFT',
      entityId: activeCandidate?.id || 'CAND-2026-001',
      action: 'UPSERT',
      payload: { ...formData, declaredSkills, evidenceList }
    }).catch(() => {});

    if (!isOnline) {
      showToast("Saved to device storage only • Not submitted to server while offline.");
    } else {
      showToast("Application progress saved to device & queued for synchronization.");
    }
  };

  const handleStartFreshApplication = () => {
    registerNewCandidate();
    showToast(language === 'hi' ? "नया कारीगर पंजीकरण शुरू हुआ।" : "New worker registration started. Please enter your profile details.");
  };

  const handleSubmitApplication = () => {
    const isOnline = syncService.isOnline();
    // Submit application to active candidate in context
    const updatedCandidate = {
      ...activeCandidate,
      name: formData.fullName || (language === 'hi' ? 'कारीगर साथी' : 'Craftsperson'),
      currentRoleName: formData.trade || 'General Craftsperson',
      yearsExperience: formData.yearsExperience || 1,
      location: formData.location || 'India',
      phone: formData.phone || '',
      language: formData.preferredLanguage || language || 'hi',
      status: 'SUBMITTED',
      hasConsent: true,
      evidenceList: evidenceList.map(ev => ({
        id: ev.id,
        title: ev.fileName,
        type: ev.type?.includes('Audio') ? 'audio' : 'photo',
        date: new Date().toISOString().split('T')[0]
      }))
    };

    if (activeCandidate?.id) {
      updateCandidate(activeCandidate.id, updatedCandidate);
      runAiPreAssessment(activeCandidate.id);

      offlineDbService.saveWorkerDraft(activeCandidate.id, {
        formData,
        declaredSkills,
        evidenceList,
        status: 'SUBMITTED'
      });

      syncService.enqueueOperation({
        entityType: 'WORKER_SUBMIT',
        entityId: activeCandidate.id,
        action: 'SUBMIT',
        payload: {
          fullName: formData.fullName,
          trade: formData.trade,
          yearsExperience: formData.yearsExperience,
          location: formData.location,
          evidenceList
        }
      }).catch(() => {});
    }

    setCurrentScreen('status');
    if (!isOnline) {
      showToast("Saved to device storage! Application will be synchronized once connectivity is restored.");
    } else {
      showToast("Application submitted successfully (SIH Demo Mode)!");
    }
  };

  // Trigger qualification matching against official source catalogue
  const runMatching = async () => {
    setIsMatchingLoading(true);
    try {
      const res = await qualificationMatchingService.matchQualifications({
        trade: formData.trade,
        workActivities: formData.workActivities,
        declaredSkills
      });
      setMatchingResults(res);
    } catch (e) {
      console.error('Matching failed', e);
    } finally {
      setIsMatchingLoading(false);
    }
  };

  useEffect(() => {
    if (currentScreen === 'matching') {
      runMatching();
    }
  }, [currentScreen, formData.trade, formData.workActivities, declaredSkills]);

  // Stepper tabs bar when in application flow (screens 2, 3, 4, 5, 6)
  const isFormWizard = ['profile', 'experience', 'matching', 'evidence', 'summary'].includes(currentScreen);
  const wizardSteps = [
    { id: 'profile', label: t('step1Profile') },
    { id: 'experience', label: t('step2Skills') },
    { id: 'matching', label: t('step3Matching') },
    { id: 'evidence', label: t('step4Evidence') },
    { id: 'summary', label: t('step5Summary') }
  ];

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-teal-900 text-white text-xs px-4 py-2.5 rounded-2xl shadow-xl border border-teal-600 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Screen Breadcrumb / Wizard Header */}
      {isFormWizard && (
        <div className="bg-white rounded-2xl border border-slate-200 p-2.5 shadow-2xs">
          <div className="flex items-center justify-between gap-1 overflow-x-auto text-xs py-0.5">
            {wizardSteps.map((ws, i) => {
              const isActive = currentScreen === ws.id;
              const isPast = wizardSteps.findIndex(s => s.id === currentScreen) > i;
              return (
                <button
                  key={ws.id}
                  onClick={() => setCurrentScreen(ws.id)}
                  className={`px-2.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-xs'
                      : isPast
                      ? 'text-teal-800 bg-teal-50 hover:bg-teal-100'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <span>{ws.label}</span>
                  {isPast && <span className="text-[10px]">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation Bar when in View Sub-Screens (e.g. Status, AI Review, Certificate) */}
      {!isFormWizard && currentScreen !== 'home' && (
        <div className="flex items-center justify-between bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-2xs text-xs">
          <button
            onClick={() => setCurrentScreen('home')}
            className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1"
          >
            ← {language === 'hi' ? 'श्रमिक पोर्टल होम' : 'Back to Worker Home'}
          </button>
          <div className="flex gap-1.5">
            <button
              onClick={() => setCurrentScreen('status')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                currentScreen === 'status' ? 'bg-teal-100 text-teal-800' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {t('statusTrackerTitle')}
            </button>
            <button
              onClick={() => setCurrentScreen('ai_review')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                currentScreen === 'ai_review' ? 'bg-teal-100 text-teal-800' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {t('aiAnalysis')}
            </button>
            {activeCandidate?.status === 'COMPETENT' && (
              <button
                onClick={() => setCurrentScreen('certificate')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  currentScreen === 'certificate' ? 'bg-amber-100 text-amber-800' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {t('myCertificate')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* RENDER CURRENT SCREEN */}

      {/* Screen 1: Worker Home */}
      {currentScreen === 'home' && (
        <WorkerHome
          onStartApplication={handleStartFreshApplication}
          onContinueApplication={() => setCurrentScreen('profile')}
          onViewStatus={() => setCurrentScreen('status')}
          onViewMatching={() => setCurrentScreen('matching')}
          applicationData={formData}
          currentStep={1}
        />
      )}

      {/* Screen 2: Worker Profile */}
      {currentScreen === 'profile' && (
        <WorkerProfileForm
          formData={formData}
          onUpdateFormData={handleUpdateFormData}
          onNext={() => setCurrentScreen('experience')}
          onBack={() => setCurrentScreen('home')}
          onSaveDraft={handleSaveDraft}
        />
      )}

      {/* Screen 3: Experience Declaration */}
      {currentScreen === 'experience' && (
        <ExperienceDeclarationForm
          declaredSkills={declaredSkills}
          onUpdateSkills={setDeclaredSkills}
          onNext={() => setCurrentScreen('matching')}
          onBack={() => setCurrentScreen('profile')}
          onSaveDraft={handleSaveDraft}
        />
      )}

      {/* Screen 4: Qualification Matching Results (Source Grounded) */}
      {currentScreen === 'matching' && (
        <div className="space-y-4">
          <QualificationMatchingResults
            suggestions={matchingResults?.suggestions || []}
            totalEvaluated={matchingResults?.totalEvaluated || 2815}
            noMatchReason={matchingResults?.noMatchReason || (isMatchingLoading ? 'Analyzing declared tasks against 2,815 qualifications...' : null)}
            onSelectQualification={(selectedQual) => {
              setFormData(prev => ({
                ...prev,
                trade: selectedQual.title,
                selectedQualification: selectedQual
              }));
              showToast(`Target Qualification Pack set to "${selectedQual.title}" (${selectedQual.code || 'NSQF L' + (selectedQual.level || '4')})`);
              setCurrentScreen('evidence');
            }}
            onBrowseAll={() => setCurrentScreen('evidence')}
          />

          {/* Stepper Navigation Footer for Matching */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <Button
              variant="outline"
              size="md"
              onClick={() => setCurrentScreen('experience')}
              icon={ArrowLeft}
              className="w-full sm:w-auto"
            >
              Back to Skills Declaration
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setCurrentScreen('evidence')}
              icon={ArrowRight}
              className="w-full sm:w-auto"
            >
              Next: Upload Evidence
            </Button>
          </div>
        </div>
      )}

      {/* Screen 5: Evidence Upload */}
      {currentScreen === 'evidence' && (
        <EvidenceUploadSection
          evidenceList={evidenceList}
          declaredSkills={declaredSkills}
          onUpdateEvidence={setEvidenceList}
          onNext={() => setCurrentScreen('summary')}
          onBack={() => setCurrentScreen('matching')}
          onSaveDraft={handleSaveDraft}
        />
      )}

      {/* Screen 6: Application Summary */}
      {currentScreen === 'summary' && (
        <ApplicationSummaryView
          formData={formData}
          declaredSkills={declaredSkills}
          evidenceList={evidenceList}
          onEditSection={(stepNumber) => {
            if (stepNumber === 1) setCurrentScreen('profile');
            else if (stepNumber === 2) setCurrentScreen('experience');
            else if (stepNumber === 3) setCurrentScreen('matching');
            else if (stepNumber === 4) setCurrentScreen('evidence');
          }}
          onSubmitApplication={handleSubmitApplication}
          onBack={() => setCurrentScreen('evidence')}
          onSaveDraft={handleSaveDraft}
        />
      )}

      {/* Screen 6: Assessment Status & Timeline */}
      {currentScreen === 'status' && (
        <AssessmentStatusTracker
          onOpenCertificate={() => setCurrentScreen('certificate')}
          onOpenAiReview={() => setCurrentScreen('ai_review')}
        />
      )}

      {/* Screen 7: AI Skill Pre-Assessment Report */}
      {currentScreen === 'ai_review' && (
        <AiSkillMappingView
          onNavigateToStatus={() => setCurrentScreen('status')}
        />
      )}

      {/* Screen 8: Digital Skill Certificate */}
      {currentScreen === 'certificate' && (
        <DigitalSkillCertificate
          candidate={activeCandidate}
          onClose={() => setCurrentScreen('status')}
        />
      )}

      {/* Bottom Nav for Mobile Tab Switching */}
      <BottomNav
        activeTab={
          currentScreen === 'home'
            ? 'overview'
            : currentScreen === 'evidence'
            ? 'evidence'
            : currentScreen === 'ai_review'
            ? 'ai'
            : currentScreen === 'status' || currentScreen === 'certificate'
            ? 'status'
            : 'overview'
        }
        onTabChange={(tabId) => {
          if (tabId === 'overview') setCurrentScreen('home');
          else if (tabId === 'evidence') setCurrentScreen('evidence');
          else if (tabId === 'ai') setCurrentScreen('ai_review');
          else if (tabId === 'status') setCurrentScreen('status');
        }}
      />

      {/* Modals for voice log and camera upload */}
      <VoiceWorkLogModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
      />
      <EvidenceUploader
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
      />

    </div>
  );
};
