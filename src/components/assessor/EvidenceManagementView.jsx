import React, { useState } from 'react';
import {
  FileText,
  Camera,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ShieldAlert,
  ShieldCheck,
  Eye,
  Clock,
  ArrowRight,
  Save,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { Button } from '../common/Button';
import { EVIDENCE_STATUSES } from '../../services/assessorAssessmentService';

export const EvidenceManagementView = ({
  candidate,
  evaluation,
  activeAssessor,
  onUpdateEvidenceStatus,
  onNavigateTab
}) => {
  const [activeModalEvidence, setActiveModalEvidence] = useState(null);
  const [modalStatus, setModalStatus] = useState('');
  const [modalReason, setModalReason] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const evidenceList = candidate?.evidenceList || [];
  const reviews = evaluation?.evidenceReviews || {};

  const handleOpenStatusModal = (evidence, targetStatus) => {
    if (targetStatus === 'REVIEWED') {
      // Reviewed doesn't mandate a reason, can save directly
      onUpdateEvidenceStatus(evidence.id, 'REVIEWED', '', activeAssessor);
      setToastMessage(`Evidence "${evidence.title}" marked as Reviewed.`);
      setTimeout(() => setToastMessage(null), 2500);
      return;
    }

    // Insufficient or Requires Verification mandates a reason
    const existingReview = reviews[evidence.id];
    setActiveModalEvidence(evidence);
    setModalStatus(targetStatus);
    setModalReason(existingReview?.reason || '');
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    if (!modalReason.trim()) return;

    onUpdateEvidenceStatus(activeModalEvidence.id, modalStatus, modalReason.trim(), activeAssessor);
    setToastMessage(`Evidence "${activeModalEvidence.title}" status updated to ${EVIDENCE_STATUSES[modalStatus]?.label || modalStatus}.`);
    setTimeout(() => setToastMessage(null), 2500);
    setActiveModalEvidence(null);
  };

  // Find which criteria cite this evidence item
  const getLinkedCriteriaForEvidence = (evidenceId) => {
    const criteriaAssessments = evaluation?.criteriaAssessments || {};
    const linked = [];
    Object.entries(criteriaAssessments).forEach(([critId, data]) => {
      if (data.linkedEvidenceIds && data.linkedEvidenceIds.includes(evidenceId)) {
        linked.push(critId);
      }
    });
    return linked;
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

      {/* Mandatory Regulatory Rule Banner */}
      <div className="p-4 rounded-3xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-3 shadow-xs">
        <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-xs uppercase tracking-wider text-amber-900">
            Mandatory Regulatory Standard: Document Authenticity vs Skill Competence
          </h4>
          <p className="text-[11px] leading-relaxed text-amber-900">
            Never state that an uploaded certificate, photograph, or document is authentic merely because it was uploaded or reviewed. Upload review confirms evidentiary submission only. Document review does <strong>NOT</strong> attest official authenticity or practical skill competence without physical in-person assessor verification.
          </p>
        </div>
      </div>

      {/* Header Overview */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">
            Evidence Scrutiny Dossier
          </span>
          <h2 className="text-base font-bold text-slate-900 mt-0.5">
            Submitted Artifacts for {candidate.name} ({evidenceList.length} Items)
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Trade: {candidate.currentRoleName} • Target Center: {candidate.targetCenter || 'ITI Alambagh'}
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => onNavigateTab('competencies')}
          icon={ArrowRight}
        >
          Return to Competency Matrix
        </Button>
      </div>

      {/* List of Evidence Items */}
      <div className="space-y-3">
        {evidenceList.length === 0 ? (
          <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center text-slate-500">
            <FileText className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <h4 className="font-bold text-slate-800 text-sm">No evidence uploaded yet</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              The worker has not submitted photos, audio narratives, or documents for this application.
            </p>
          </div>
        ) : (
          evidenceList.map((ev, idx) => {
            const review = reviews[ev.id] || { status: 'PENDING', reason: '' };
            const statusConfig = EVIDENCE_STATUSES[review.status] || EVIDENCE_STATUSES.PENDING;
            const linkedCriteria = getLinkedCriteriaForEvidence(ev.id);

            return (
              <div
                key={ev.id || idx}
                className={`bg-white rounded-2xl border transition-all p-4 shadow-xs space-y-3 ${
                  review.status === 'REVIEWED'
                    ? 'border-emerald-300'
                    : review.status === 'INSUFFICIENT'
                    ? 'border-amber-300'
                    : review.status === 'REQUIRES_VERIFICATION'
                    ? 'border-purple-300'
                    : 'border-slate-200'
                }`}
              >
                {/* Evidence Item Top Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    {ev.type === 'audio' ? (
                      <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0">
                        <Volume2 className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center flex-shrink-0">
                        <Camera className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{ev.title}</h4>
                      <span className="text-[10px] text-slate-400">
                        {ev.type?.toUpperCase()} • Uploaded: {ev.date || 'Recent'}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                    review.status === 'REVIEWED'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : review.status === 'INSUFFICIENT'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : review.status === 'REQUIRES_VERIFICATION'
                      ? 'bg-purple-50 text-purple-800 border-purple-300'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {statusConfig.label}
                  </span>
                </div>

                {/* Preview Thumbnail / Photo */}
                {ev.url && (
                  <div className="relative rounded-xl overflow-hidden max-h-56 border border-slate-200 bg-slate-900">
                    <img
                      src={ev.url}
                      alt={ev.title}
                      className="w-full h-56 object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                      Artifact ID: {ev.id}
                    </div>
                  </div>
                )}

                {/* Audio Transcript / Description */}
                {(ev.transcript || ev.description) && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Worker-Provided Description / Narrative:
                    </span>
                    <p className="text-slate-800 text-xs leading-relaxed italic">
                      "{ev.translatedTranscript || ev.transcript || ev.description}"
                    </p>
                  </div>
                )}

                {/* Related Competency / AI NOS Alignment */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Related Competency Alignment:</span>
                    <span className="font-semibold text-slate-800">
                      {ev.aiAnalysis?.nosAlignment || 'Domain Practical Standard'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Linked in Criteria:</span>
                    <span className="font-semibold text-slate-800">
                      {linkedCriteria.length > 0 ? `${linkedCriteria.length} Performance Criteria` : 'Not yet linked'}
                    </span>
                  </div>
                </div>

                {/* Assessor Existing Reason if insufficient or verification */}
                {review.reason && (
                  <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-950 text-xs">
                    <span className="text-[10px] uppercase font-bold text-amber-800 block">
                      Assessor Note / Reason:
                    </span>
                    <p className="mt-0.5 font-medium">{review.reason}</p>
                  </div>
                )}

                {/* Assessor Review Status Actions */}
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Record Assessor Scrutiny Action:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenStatusModal(ev, 'REVIEWED')}
                      className={`py-2 px-3 rounded-xl font-bold transition-all border ${
                        review.status === 'REVIEWED'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50'
                      }`}
                    >
                      ✓ Mark as Reviewed
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenStatusModal(ev, 'INSUFFICIENT')}
                      className={`py-2 px-3 rounded-xl font-bold transition-all border ${
                        review.status === 'INSUFFICIENT'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-white text-amber-800 border-amber-300 hover:bg-amber-50'
                      }`}
                    >
                      ⚠ Insufficient Evidence
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenStatusModal(ev, 'REQUIRES_VERIFICATION')}
                      className={`py-2 px-3 rounded-xl font-bold transition-all border ${
                        review.status === 'REQUIRES_VERIFICATION'
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-white text-purple-800 border-purple-300 hover:bg-purple-50'
                      }`}
                    >
                      🔍 Requires In-Person Verification
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Mandatory Reason Modal for Insufficient or Requires Verification */}
      {activeModalEvidence && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  {modalStatus === 'INSUFFICIENT' ? 'Mandate Insufficient Evidence Reason' : 'Mandate In-Person Verification Reason'}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalEvidence(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Artifact: <strong>{activeModalEvidence.title}</strong>
            </p>

            <form onSubmit={handleSaveModal} className="space-y-3">
              <div>
                <label className="font-bold text-slate-800 text-xs block mb-1">
                  Reason for {modalStatus === 'INSUFFICIENT' ? 'Insufficiency' : 'Verification Requirement'} (Mandatory):
                </label>
                <textarea
                  rows={3}
                  value={modalReason}
                  onChange={(e) => setModalReason(e.target.value)}
                  placeholder="State the exact deficiency or requirement (e.g. 'Photo does not show safety gloves or circuit tester', 'Need original physical marksheet/certificate at center')..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setActiveModalEvidence(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={!modalReason.trim()}
                >
                  Save Status & Reason
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
