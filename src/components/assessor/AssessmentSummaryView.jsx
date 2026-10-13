import React, { useState, useEffect } from 'react';
import {
  FileText,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Save,
  Send,
  RotateCcw,
  Award,
  Layers,
  Paperclip,
  User,
  BookOpen,
  Info,
  History,
  FileSignature
} from 'lucide-react';
import { Button } from '../common/Button';
import { NsqfBadge, StatusBadge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import {
  assessorAssessmentService,
  PROVISIONAL_RUBRIC,
  EVIDENCE_STATUSES
} from '../../services/assessorAssessmentService';

export const AssessmentSummaryView = ({
  candidate,
  evaluation,
  activeAssessor,
  onSaveDraft,
  onSubmitForReview,
  onReturnForEvidence,
  onRecordAuthorisedDecision,
  onNavigateTab
}) => {
  const [recommendation, setRecommendation] = useState(
    evaluation?.recommendation || 'RECOMMEND_COMPETENT'
  );
  const [rationale, setRationale] = useState(
    evaluation?.recommendationRationale ||
    'Based on practical observations, work artifacts, and adherence to safety protocols, candidate demonstrates adequate foundational competency.'
  );
  const [assessorNotes, setAssessorNotes] = useState(
    evaluation?.assessorNotes || ''
  );
  const [criteriaData, setCriteriaData] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const activeQualification = evaluation?.qualification || candidate?.confirmedQualification;
  const qualCode = activeQualification?.code || candidate?.targetQualificationCode || '2022/OAFM/MEPSC/06022';
  const qualId = activeQualification?.id || candidate?.qualificationId;

  useEffect(() => {
    let isMounted = true;
    async function loadCriteria() {
      const res = await assessorAssessmentService.getApplicableCriteria(
        qualCode,
        qualId,
        evaluation?.curriculumVersion || null
      );
      if (isMounted) {
        setCriteriaData(res);
      }
    }
    loadCriteria();
    return () => { isMounted = false; };
  }, [qualCode, qualId, evaluation?.curriculumVersion]);

  // Statistics
  const criteriaAssessments = evaluation?.criteriaAssessments || {};
  const totalCriteria = criteriaData?.criteria?.length || 0;
  const reviewedCriteria = Object.values(criteriaAssessments).filter(
    c => c && c.outcome && c.outcome !== 'NOT_ASSESSED'
  ).length;
  const unreviewedCount = Math.max(0, totalCriteria - reviewedCriteria);
  const progressPercent = totalCriteria > 0 ? Math.round((reviewedCriteria / totalCriteria) * 100) : 0;

  const evidenceList = candidate?.evidenceList || [];
  const evidenceReviews = evaluation?.evidenceReviews || {};
  const insufficientEvidenceCount = evidenceList.filter(
    e => evidenceReviews[e.id]?.status === 'INSUFFICIENT' || evidenceReviews[e.id]?.status === 'REQUIRES_VERIFICATION'
  ).length;

  const isSourceVerified = criteriaData?.isSourceVerified && criteriaData?.hasOfficialRubric;

  const handleSaveDraftClick = () => {
    onSaveDraft({ notes: assessorNotes, recommendation, rationale });
    setToastMessage('Draft assessment summary saved to persistent storage.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSubmitForReviewClick = (e) => {
    e.preventDefault();
    if (!rationale.trim()) return;
    onSubmitForReview({ notes: assessorNotes, recommendation, rationale });
    setToastMessage('Assessment successfully submitted for Authorised Human Review.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleReturnForEvidenceClick = () => {
    onReturnForEvidence(rationale);
    setToastMessage('Application returned to candidate for additional practical evidence.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRecordOfficialDecisionClick = () => {
    onRecordAuthorisedDecision({
      recommendation,
      rationale,
      assessorNotes,
      decisionTime: new Date().toISOString()
    });
    setToastMessage('Authorised Assessor Decision recorded in candidate record.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-2xl shadow-xl border border-sky-500 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-sky-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Dossier Summary Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-6 border border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold text-sky-400 bg-sky-950 border border-sky-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Assessment Summary Dossier
              </span>
              <span className="font-mono text-slate-400 text-[11px]">
                Ref: {candidate.id}
              </span>
              <StatusBadge status={evaluation?.status || candidate.status} />
            </div>
            <h1 className="text-lg sm:text-xl font-black text-white mt-1">
              {candidate.name} — {activeQualification?.title || candidate.currentRoleName}
            </h1>
            <p className="text-xs text-slate-400">
              Assessor: <strong>{activeAssessor?.name}</strong> ({activeAssessor?.badgeNumber}) • Center: {candidate.targetCenter || 'ITI Alambagh'}
            </p>
          </div>

          <div className="bg-slate-800/90 p-3.5 rounded-2xl border border-slate-700/80 text-xs min-w-[180px]">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Review Progress</span>
            <span className="text-base font-extrabold text-sky-300">
              {reviewedCriteria} / {totalCriteria} Criteria Reviewed
            </span>
            <ProgressBar
              value={progressPercent}
              max={100}
              color="sky"
              size="sm"
            />
            <span className="text-[9px] text-slate-400 block mt-1 text-right">
              {progressPercent}% Criteria Scrutinized
            </span>
          </div>
        </div>

        {/* Qualification & Source Metadata Strip */}
        <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-300 text-[11px]">
          <div>
            <span className="text-slate-500 uppercase text-[10px] font-semibold block">Qualification Pack</span>
            <span className="text-white font-bold">{activeQualification?.code || 'UNSPECIFIED'} (Level {activeQualification?.level || 4})</span>
            <span className="text-slate-400 block text-[10px]">{activeQualification?.sector || 'Skill Sector'}</span>
          </div>

          <div>
            <span className="text-slate-500 uppercase text-[10px] font-semibold block">Curriculum Version</span>
            <span className="text-white font-bold">
              {evaluation?.curriculumVersion || 'Standard Model Curriculum'}
            </span>
            <span className="text-slate-400 block text-[10px]">
              {criteriaData?.sourceReference || 'NQR Catalogue Spec'}
            </span>
          </div>

          <div>
            <span className="text-slate-500 uppercase text-[10px] font-semibold block">Source Document</span>
            <span className="text-white font-bold truncate block">
              {criteriaData?.sourceFile || 'NQR Qualifications Excel'}
            </span>
            <span className="text-slate-400 block text-[10px]">
              {criteriaData?.sourceType || 'Master Source'}
            </span>
          </div>
        </div>
      </div>

      {/* Source Verification Warning / Status */}
      {!criteriaData?.isSourceVerified && (
        <div className="p-4 rounded-3xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-xs uppercase tracking-wider text-amber-900">
              Source Verification Required — Authorised Review Mandatory
            </h4>
            <p className="text-[11px] leading-relaxed text-amber-900">
              Granular Annexure performance criteria are unverified from supplied files for this qualification. This assessment summary is provisional and <strong>cannot issue an official pass/fail mark or certificate</strong>. Final determination requires authorized review by the Assessment Body.
            </p>
          </div>
        </div>
      )}

      {/* Outstanding Evidence or Incomplete Criteria Alert */}
      {(unreviewedCount > 0 || insufficientEvidenceCount > 0) && (
        <div className="p-4 rounded-3xl bg-sky-50 border border-sky-200 text-sky-950 space-y-2">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-sky-700" />
            <h4 className="font-bold text-xs uppercase tracking-wider text-sky-900">
              Outstanding Items in Application Dossier
            </h4>
          </div>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-sky-900">
            {unreviewedCount > 0 && (
              <li>
                <strong>{unreviewedCount} Performance Criteria</strong> have not been evaluated yet ({reviewedCriteria} of {totalCriteria} reviewed).
              </li>
            )}
            {insufficientEvidenceCount > 0 && (
              <li>
                <strong>{insufficientEvidenceCount} Evidence Artifact(s)</strong> are marked as Insufficient or Require In-Person Verification.
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Criterion-Level Outcomes & Evidence Breakdown */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Competencies & Performance Criteria Outcomes
            </h3>
            <p className="text-slate-500 text-[11px]">
              Summary of assessor findings, evidence links, and observation notes.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateTab('competencies')}
          >
            Edit Criteria
          </Button>
        </div>

        <div className="space-y-2">
          {(criteriaData?.criteria || []).map((crit) => {
            const evalItem = criteriaAssessments[crit.id] || {};
            const outcome = evalItem.outcome || 'NOT_ASSESSED';
            const rubConfig = PROVISIONAL_RUBRIC[outcome] || PROVISIONAL_RUBRIC.NOT_ASSESSED;
            const linkedEv = evalItem.linkedEvidenceIds || [];

            return (
              <div
                key={crit.id}
                className="p-3 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded text-[10px]">
                        {crit.code}
                      </span>
                      <span className="text-[10px] text-slate-500">{crit.associatedModule}</span>
                    </div>
                    <p className="font-medium text-slate-800 text-xs mt-1">
                      {crit.description}
                    </p>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                    outcome === 'DEMONSTRATED'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : outcome === 'PARTIALLY_DEMONSTRATED'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : outcome === 'NOT_DEMONSTRATED'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {rubConfig.label}
                  </span>
                </div>

                {/* Evidence & Notes strip */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/60 text-[10px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Paperclip className="w-3 h-3 text-slate-400" />
                    <span>
                      {linkedEv.length > 0 ? `${linkedEv.length} Evidence Artifact(s) Linked` : 'No evidence linked'}
                    </span>
                  </div>

                  {evalItem.observations && (
                    <span className="italic text-slate-600 max-w-sm truncate">
                      Obs: "{evalItem.observations}"
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Assessor Recommendation & Rationale Form */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">
            Assessor Recommendation & Rationale
          </h3>
          <p className="text-slate-500 text-[11px] mt-0.5">
            Submit your professional recommendation for authorised human review.
          </p>
        </div>

        {/* Recommendation Selector */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-800 text-xs block">
            Assessor Recommendation:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { id: 'RECOMMEND_COMPETENT', label: 'Recommend Authorised Sign-Off (Competent)' },
              { id: 'RECOMMEND_GAP_TRAINING', label: 'Recommend Bridge / Gap Training' },
              { id: 'RECOMMEND_ADDITIONAL_EVIDENCE', label: 'Recommend Additional Practical Evidence' },
              { id: 'SOURCE_VERIFICATION_PENDING', label: 'Pending Source Verification of Standards' }
            ].map(opt => (
              <label
                key={opt.id}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                  recommendation === opt.id
                    ? 'bg-sky-50 border-sky-400 text-sky-950 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="assessorRecommendation"
                  value={opt.id}
                  checked={recommendation === opt.id}
                  onChange={(e) => setRecommendation(e.target.value)}
                  className="w-4 h-4 text-sky-600 focus:ring-sky-500"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Professional Rationale Textarea */}
        <div className="space-y-1">
          <label className="font-bold text-slate-800 text-xs block">
            Professional Recommendation Rationale (Mandatory):
          </label>
          <textarea
            rows={3}
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            placeholder="Document the technical rationale supporting your recommendation..."
            className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            required
          />
        </div>

        {/* General Assessor Notes */}
        <div className="space-y-1">
          <label className="font-bold text-slate-800 text-xs block">
            Confidential Assessor Notes (Optional):
          </label>
          <textarea
            rows={2}
            value={assessorNotes}
            onChange={(e) => setAssessorNotes(e.target.value)}
            placeholder="Internal notes for scheme coordinator or review committee..."
            className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Summary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <Button
            variant="outline"
            size="md"
            onClick={handleSaveDraftClick}
            icon={Save}
          >
            Save Summary Draft
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={handleReturnForEvidenceClick}
            icon={RotateCcw}
          >
            Return for Additional Evidence
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleSubmitForReviewClick}
            icon={Send}
          >
            Submit for Authorised Review
          </Button>

          {isSourceVerified && (
            <Button
              variant="secondary"
              size="md"
              onClick={handleRecordOfficialDecisionClick}
              icon={FileSignature}
            >
              Record Authorised Decision
            </Button>
          )}
        </div>
      </div>

      {/* Revision History & Change Log (Auditability) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-slate-500" />
          <h3 className="font-bold text-slate-900 text-sm">
            Assessment Dossier Revision History ({evaluation?.revisionHistory?.length || 0})
          </h3>
        </div>
        <p className="text-slate-500 text-[11px]">
          Auditable change history preserving previous observations without silent overwrites.
        </p>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {(evaluation?.revisionHistory || []).map((rev, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-start justify-between gap-2"
            >
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800">{rev.action}</span>
                <p className="text-[11px] text-slate-600">{rev.summary}</p>
                <span className="text-[10px] text-slate-400">Actor: {rev.actor}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                {new Date(rev.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
