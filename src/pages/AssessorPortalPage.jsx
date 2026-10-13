import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AssessorDashboard } from '../components/assessor/AssessorDashboard';
import { CandidateReviewView } from '../components/assessor/CandidateReviewView';
import { CompetencyAssessmentView } from '../components/assessor/CompetencyAssessmentView';
import { EvidenceManagementView } from '../components/assessor/EvidenceManagementView';
import { AssessmentSummaryView } from '../components/assessor/AssessmentSummaryView';
import { assessorAssessmentService } from '../services/assessorAssessmentService';
import { BottomNav } from '../components/layout/BottomNav';
import { StatusBadge, NsqfBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  Users,
  FileSearch,
  ClipboardCheck,
  FolderPlus,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const AssessorPortalPage = () => {
  const {
    candidates,
    activeAssessor,
    updateCandidate,
    recordAssessorQualificationDecision,
    submitAssessorAssessment
  } = useApp();

  const [selectedCandidateId, setSelectedCandidateId] = useState('CAND-2026-002'); // Sunita Devi (default)
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'review' | 'competencies' | 'evidence' | 'summary'
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const [allEvaluations, setAllEvaluations] = useState({});
  const [toastMessage, setToastMessage] = useState(null);

  const selectedCandidate = candidates.find(c => c.id === selectedCandidateId) || candidates[0];

  // Load evaluation whenever selected candidate changes
  useEffect(() => {
    let isMounted = true;
    async function loadCandidateEvaluation() {
      if (!selectedCandidate) return;
      const evaluation = await assessorAssessmentService.getEvaluation(
        selectedCandidate.id,
        selectedCandidate
      );
      if (isMounted) {
        setCurrentEvaluation(evaluation);
        setAllEvaluations(assessorAssessmentService.evaluations || {});
      }
    }
    loadCandidateEvaluation();
    return () => { isMounted = false; };
  }, [selectedCandidate?.id]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Confirm Qualification
  const handleConfirmQualification = async (qualification, rationale) => {
    recordAssessorQualificationDecision(selectedCandidate.id, {
      actionType: 'CONFIRMED',
      qualification,
      rationale
    });

    const updated = await assessorAssessmentService.setConfirmedQualification(
      selectedCandidate.id,
      qualification,
      rationale,
      activeAssessor
    );
    setCurrentEvaluation({ ...updated });
    setAllEvaluations({ ...assessorAssessmentService.evaluations });
    showToast(`Confirmed qualification "${qualification.title}" for assessment.`);
  };

  // 2. Request Clarification
  const handleRequestClarification = (notes) => {
    recordAssessorQualificationDecision(selectedCandidate.id, {
      actionType: 'REQUESTED_CLARIFICATION',
      qualification: selectedCandidate.confirmedQualification,
      rationale: notes
    });
    updateCandidate(selectedCandidate.id, { status: 'IN_REVIEW' });
    showToast('Clarification request sent to candidate.');
  };

  // 3. Return for Correction
  const handleReturnForCorrection = (notes) => {
    recordAssessorQualificationDecision(selectedCandidate.id, {
      actionType: 'RETURNED_FOR_CORRECTION',
      qualification: selectedCandidate.confirmedQualification,
      rationale: notes
    });
    updateCandidate(selectedCandidate.id, { status: 'SUBMITTED' });
    showToast('Application returned for correction.');
  };

  // 4. Update Criterion Evaluation
  const handleUpdateCriterion = (criterionId, criterionData) => {
    const updated = assessorAssessmentService.updateCriterionEvaluation(
      selectedCandidate.id,
      criterionId,
      criterionData
    );
    if (updated) {
      setCurrentEvaluation({ ...assessorAssessmentService.evaluations[selectedCandidate.id] });
      setAllEvaluations({ ...assessorAssessmentService.evaluations });
    }
  };

  // 5. Update Evidence Status
  const handleUpdateEvidenceStatus = (evidenceId, status, reason) => {
    assessorAssessmentService.updateEvidenceReview(
      selectedCandidate.id,
      evidenceId,
      status,
      reason,
      activeAssessor
    );
    setCurrentEvaluation({ ...assessorAssessmentService.evaluations[selectedCandidate.id] });
    setAllEvaluations({ ...assessorAssessmentService.evaluations });
  };

  // 6. Save Draft Summary
  const handleSaveDraft = (summaryData) => {
    const updated = assessorAssessmentService.saveDraftSummary(
      selectedCandidate.id,
      summaryData || {},
      activeAssessor
    );
    setCurrentEvaluation({ ...updated });
    setAllEvaluations({ ...assessorAssessmentService.evaluations });
    showToast('Assessment draft saved successfully.');
  };

  // 7. Submit for Authorised Review
  const handleSubmitForReview = (summaryData) => {
    const updated = assessorAssessmentService.submitForAuthorisedReview(
      selectedCandidate.id,
      summaryData,
      activeAssessor
    );
    updateCandidate(selectedCandidate.id, { status: 'AWAITING_SIGNOFF' });
    setCurrentEvaluation({ ...updated });
    setAllEvaluations({ ...assessorAssessmentService.evaluations });
    showToast('Assessment submitted for Authorised Human Review.');
  };

  // 8. Return for Additional Evidence
  const handleReturnForEvidence = (rationale) => {
    updateCandidate(selectedCandidate.id, { status: 'IN_REVIEW' });
    showToast('Returned to candidate with instructions for additional practical evidence.');
  };

  // 9. Record Official Authorised Decision
  const handleRecordAuthorisedDecision = (decisionData) => {
    const isCompetent = decisionData.recommendation === 'RECOMMEND_COMPETENT';
    submitAssessorAssessment(selectedCandidate.id, {
      verdict: isCompetent ? 'COMPETENT' : 'BRIDGE_REQUIRED',
      finalWeightedScore: 85,
      rubricScores: {},
      checklistResults: {},
      assessorRemarks: decisionData.rationale
    });
    showToast(isCompetent ? 'Candidate declared COMPETENT. Authorised decision recorded.' : 'Candidate assigned BRIDGE TRAINING.');
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-2xl shadow-xl border border-sky-500 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-sky-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Candidate Quick Selector Strip (Visible across all tabs except full queue view) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 flex-shrink-0">
            {selectedCandidate?.name?.charAt(0)}
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="font-bold text-slate-900 truncate">{selectedCandidate?.name}</h2>
              {selectedCandidate?.isDemoRecord && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded-full">
                  Demo
                </span>
              )}
              <NsqfBadge level={selectedCandidate?.nsqfLevel || 4} />
            </div>
            <p className="text-[11px] text-slate-500 truncate">
              {selectedCandidate?.currentRoleName} • {selectedCandidate?.id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <select
            value={selectedCandidateId}
            onChange={(e) => setSelectedCandidateId(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer max-w-[200px] truncate"
          >
            {candidates.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.currentRoleName})
              </option>
            ))}
          </select>

          <StatusBadge status={currentEvaluation?.status || selectedCandidate?.status} />
        </div>
      </div>

      {/* Desktop & Tablet Top Tab Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-1.5 flex gap-1 shadow-2xs text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'dashboard'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Queue & KPIs</span>
        </button>

        <button
          onClick={() => setActiveTab('review')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'review'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileSearch className="w-4 h-4" />
          <span>Candidate Review</span>
        </button>

        <button
          onClick={() => setActiveTab('competencies')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'competencies'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>Competency Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('evidence')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'evidence'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FolderPlus className="w-4 h-4" />
          <span>Evidence ({selectedCandidate?.evidenceList?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('summary')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'summary'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Summary Dossier</span>
        </button>
      </div>

      {/* Main Tab Views */}

      {/* Tab 1: Assessor Dashboard (Phase 1) */}
      {activeTab === 'dashboard' && (
        <AssessorDashboard
          candidates={candidates}
          activeAssessor={activeAssessor}
          evaluations={allEvaluations}
          onSelectCandidate={(id) => setSelectedCandidateId(id)}
          onNavigateTab={(tab) => setActiveTab(tab)}
        />
      )}

      {/* Tab 2: Candidate Review (Phase 2) */}
      {activeTab === 'review' && (
        <CandidateReviewView
          candidate={selectedCandidate}
          evaluation={currentEvaluation}
          activeAssessor={activeAssessor}
          onConfirmQualification={handleConfirmQualification}
          onRequestClarification={handleRequestClarification}
          onReturnForCorrection={handleReturnForCorrection}
          onSaveDraft={(rationale) => handleSaveDraft({ rationale })}
          onProceedToAssessment={() => setActiveTab('competencies')}
        />
      )}

      {/* Tab 3: Competency Assessment Matrix (Phase 3) */}
      {activeTab === 'competencies' && (
        <CompetencyAssessmentView
          candidate={selectedCandidate}
          evaluation={currentEvaluation}
          activeAssessor={activeAssessor}
          onUpdateCriterion={handleUpdateCriterion}
          onSaveDraft={() => handleSaveDraft({})}
          onProceedToSummary={() => setActiveTab('summary')}
          onNavigateTab={(tab) => setActiveTab(tab)}
        />
      )}

      {/* Tab 4: Evidence Management (Phase 4) */}
      {activeTab === 'evidence' && (
        <EvidenceManagementView
          candidate={selectedCandidate}
          evaluation={currentEvaluation}
          activeAssessor={activeAssessor}
          onUpdateEvidenceStatus={handleUpdateEvidenceStatus}
          onNavigateTab={(tab) => setActiveTab(tab)}
        />
      )}

      {/* Tab 5: Assessment Summary Dossier (Phase 5) */}
      {activeTab === 'summary' && (
        <AssessmentSummaryView
          candidate={selectedCandidate}
          evaluation={currentEvaluation}
          activeAssessor={activeAssessor}
          onSaveDraft={handleSaveDraft}
          onSubmitForReview={handleSubmitForReview}
          onReturnForEvidence={handleReturnForEvidence}
          onRecordAuthorisedDecision={handleRecordAuthorisedDecision}
          onNavigateTab={(tab) => setActiveTab(tab)}
        />
      )}

      {/* Mobile Sticky Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId)}
      />
    </div>
  );
};
