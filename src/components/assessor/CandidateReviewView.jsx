import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Search,
  FileSearch,
  FileText,
  User,
  Wrench,
  Camera,
  Volume2,
  Clock,
  ArrowRight,
  Info,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Save,
  RotateCcw,
  Send
} from 'lucide-react';
import { Button } from '../common/Button';
import { NsqfBadge, StatusBadge } from '../common/Badge';
import { dataRepository } from '../../services/dataRepository';
import { qualificationMatchingService } from '../../services/qualificationMatchingService';

export const CandidateReviewView = ({
  candidate,
  evaluation,
  activeAssessor,
  onConfirmQualification,
  onRequestClarification,
  onReturnForCorrection,
  onSaveDraft,
  onProceedToAssessment
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [selectedQualId, setSelectedQualId] = useState(
    evaluation?.qualification?.id || candidate?.confirmedQualification?.id || candidate?.qualificationId || ''
  );
  const [rationale, setRationale] = useState(
    evaluation?.recommendationRationale ||
    'Reviewed declared practical experience, work photos, and trade tasks. Confirmed qualification alignment under NSQF criteria.'
  );
  const [actionTab, setActionTab] = useState('CONFIRM'); // 'CONFIRM' | 'CHOOSE_DIFFERENT' | 'REQUEST_INFO' | 'RETURN_CORRECTION'
  const [clarificationNotes, setClarificationNotes] = useState('');
  const [correctionNotes, setCorrectionNotes] = useState('');
  const [catalogueQuery, setCatalogueQuery] = useState('');
  const [catalogueResults, setCatalogueResults] = useState([]);
  const [isSearchingCatalogue, setIsSearchingCatalogue] = useState(false);
  const [statusNotification, setStatusNotification] = useState(null);

  // Load AI matching suggestions from Prompt 3 service
  useEffect(() => {
    let isMounted = true;
    async function loadMatches() {
      if (!candidate) return;
      setIsLoadingMatches(true);
      try {
        const profile = {
          trade: candidate.currentRoleName,
          workActivities: candidate.currentRoleName,
          declaredSkills: candidate.evidenceList?.map(e => ({
            title: e.title,
            description: e.description || e.title,
            tools: e.aiAnalysis?.detectedTools?.join(', ') || ''
          })) || [],
          yearsExperience: candidate.yearsExperience
        };
        const res = await qualificationMatchingService.matchQualifications(profile);
        if (isMounted) {
          setSuggestions(res.suggestions || []);
          if (!selectedQualId && res.suggestions?.[0]?.qualification?.id) {
            setSelectedQualId(res.suggestions[0].qualification.id);
          }
        }
      } catch (err) {
        console.error('Error matching qualifications:', err);
      } finally {
        if (isMounted) setIsLoadingMatches(false);
      }
    }
    loadMatches();
    return () => { isMounted = false; };
  }, [candidate?.id]);

  // Handle manual catalogue search
  const handleCatalogueSearch = async (e) => {
    e?.preventDefault();
    if (!catalogueQuery.trim()) return;
    setIsSearchingCatalogue(true);
    await dataRepository.init();
    const results = dataRepository.getQualifications({ search: catalogueQuery }).slice(0, 8);
    setCatalogueResults(results);
    setIsSearchingCatalogue(false);
  };

  const handleConfirmQualification = (e) => {
    e.preventDefault();
    let chosenQual = suggestions.find(s => s.qualification.id === selectedQualId)?.qualification
      || catalogueResults.find(q => q.id === selectedQualId);

    if (!chosenQual) {
      chosenQual = evaluation?.qualification || {
        id: selectedQualId,
        title: candidate.currentRoleName,
        code: candidate.targetQualificationCode || 'UNSPECIFIED',
        sector: 'Vocational Training'
      };
    }

    onConfirmQualification(chosenQual, rationale);
    setStatusNotification({
      type: 'success',
      message: `Confirmed qualification "${chosenQual.title}" for assessment. Assessor rationale recorded.`
    });
  };

  const handleRequestClarificationSubmit = (e) => {
    e.preventDefault();
    if (!clarificationNotes.trim()) return;
    onRequestClarification(clarificationNotes);
    setStatusNotification({
      type: 'success',
      message: 'Information request sent to candidate. Status updated.'
    });
    setClarificationNotes('');
  };

  const handleReturnCorrectionSubmit = (e) => {
    e.preventDefault();
    if (!correctionNotes.trim()) return;
    onReturnForCorrection(correctionNotes);
    setStatusNotification({
      type: 'warning',
      message: 'Application returned to coordinator/worker for correction.'
    });
    setCorrectionNotes('');
  };

  const activeQualification = evaluation?.qualification || candidate?.confirmedQualification;

  return (
    <div className="space-y-4 text-xs">
      {/* Status Notification */}
      {statusNotification && (
        <div className={`p-3 rounded-2xl flex items-center justify-between border ${
          statusNotification.type === 'success'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
            : 'bg-amber-50 border-amber-300 text-amber-900'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span className="font-semibold">{statusNotification.message}</span>
          </div>
          <button
            onClick={() => setStatusNotification(null)}
            className="text-xs font-bold underline ml-2 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Human In The Loop Regulatory Notice */}
      <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950 flex items-start gap-2.5">
        <ShieldCheck className="w-5 h-5 text-sky-700 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-xs">Mandatory Human-in-the-Loop Standard</p>
          <p className="text-[11px] leading-relaxed text-sky-900">
            AI match suggestions are strictly exploratory. An AI suggestion is never an assessment result. Only an authorized human assessor can confirm the target qualification and record the assessment rationale.
          </p>
        </div>
      </div>

      {/* 1. Worker Profile Dossier Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-extrabold text-base">
              {candidate.name?.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-900 text-base">{candidate.name}</h2>
                {candidate.isDemoRecord && (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                    Demo Record
                  </span>
                )}
                <NsqfBadge level={candidate.nsqfLevel || 4} />
              </div>
              <p className="text-slate-500 text-xs">
                {candidate.currentRoleName} • {candidate.yearsExperience} Years Practical Experience
              </p>
            </div>
          </div>

          <StatusBadge status={evaluation?.status || candidate.status} />
        </div>

        {/* Worker Demographics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Application ID</span>
            <span className="font-mono font-bold text-slate-800">{candidate.id}</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Aadhaar (Masked)</span>
            <span className="font-mono text-slate-800">{candidate.aadhaarMasked || 'XXXX-XXXX-4819'}</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Location</span>
            <span className="font-medium text-slate-800">{candidate.location || 'Lucknow, UP'}</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Target Assessment Center</span>
            <span className="font-medium text-slate-800 truncate block">{candidate.targetCenter || 'Government ITI'}</span>
          </div>
        </div>

        {/* Declared Skills & Work Activities */}
        <div className="space-y-2 pt-1">
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
            Declared Skills & Practical Work Activities
          </h4>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <p className="text-slate-800 text-xs leading-relaxed">
              <strong>Self-Declared Trade:</strong> {candidate.currentRoleName}
            </p>
            <p className="text-slate-700 text-xs leading-relaxed">
              <strong>Daily Work Activities:</strong> {candidate.workActivities || 'Routine domain tasks, safety equipment inspection, diagnostic measurement, and standard procedure execution at workplace.'}
            </p>
            <p className="text-slate-700 text-xs leading-relaxed">
              <strong>Prior Training / Apprenticeship:</strong> {candidate.priorTraining || 'Informal on-the-job apprenticeship (unorganized sector); no prior formal NSQF credential.'}
            </p>
          </div>
        </div>

        {/* Uploaded Evidence Summary Strip */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
              Uploaded Practical Evidence ({candidate.evidenceList?.length || 0})
            </h4>
            <span className="text-[11px] text-slate-400">
              Reviewed in Evidence Management tab
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(candidate.evidenceList || []).map((ev) => (
              <div
                key={ev.id}
                className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-start gap-2.5"
              >
                {ev.type === 'audio' ? (
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0">
                    <Volume2 className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center flex-shrink-0">
                    <Camera className="w-4 h-4" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 truncate">{ev.title}</span>
                    <span className="text-[10px] text-slate-400 uppercase">{ev.type}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {ev.description || ev.transcript || 'Work evidence file uploaded by candidate'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Source Verification & Unresolved Issues Banner */}
      <div className={`p-4 rounded-3xl border flex items-start gap-3 ${
        activeQualification?.source_file === 'Assessment_Guide.pdf.pdf' || activeQualification?.code === '2022/OAFM/MEPSC/06022'
          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
          : 'bg-amber-50/80 border-amber-200 text-amber-950'
      }`}>
        <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
          activeQualification?.source_file === 'Assessment_Guide.pdf.pdf' || activeQualification?.code === '2022/OAFM/MEPSC/06022'
            ? 'text-emerald-700'
            : 'text-amber-700'
        }`} />
        <div className="space-y-1 flex-1">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <h4 className="font-bold text-xs uppercase tracking-wider">
              {activeQualification?.source_file === 'Assessment_Guide.pdf.pdf' || activeQualification?.code === '2022/OAFM/MEPSC/06022'
                ? 'Source Verified: Assessment Guide Annexure Criteria Available'
                : 'Source Verification Required: Catalog Summary Record Only'}
            </h4>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/70 border border-current">
              {activeQualification?.code || 'NO_CODE'}
            </span>
          </div>

          <p className="text-[11px] leading-relaxed">
            {activeQualification?.source_file === 'Assessment_Guide.pdf.pdf' || activeQualification?.code === '2022/OAFM/MEPSC/06022' ? (
              <>
                Qualification criteria sourced directly from <strong>Assessment_Guide.pdf.pdf</strong> (Pages 16–26, 146 Performance Criteria). Official assessment methods and weightages apply.
              </>
            ) : (
              <>
                This qualification is registered in the NQR Catalogue ({activeQualification?.source_file || 'NQR Excel'}), but granular Annexure criteria were not included in supplied files. Evaluation will use the <strong>Provisional Rubric</strong> requiring authorized review.
              </>
            )}
          </p>
        </div>
      </div>

      {/* 3. AI Qualification Suggestions (Generated by Prompt 3) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <FileSearch className="w-4 h-4 text-sky-600" />
              Source-Grounded Qualification Matching Suggestions
            </h3>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Transparent lexical and competency match generated against the 2,815 qualification catalogue.
            </p>
          </div>
          <span className="text-[11px] text-slate-400 font-semibold">
            {suggestions.length} Matches Found
          </span>
        </div>

        {isLoadingMatches ? (
          <div className="p-6 text-center text-slate-500">
            <Clock className="w-5 h-5 animate-spin mx-auto mb-1 text-sky-600" />
            <span>Evaluating qualification matching algorithms...</span>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="p-4 bg-slate-50 rounded-2xl text-center text-slate-500">
            No automatic matches found. You can manually choose from the full catalogue below.
          </div>
        ) : (
          <div className="space-y-2.5">
            {suggestions.slice(0, 3).map((item, index) => {
              const q = item.qualification;
              const isSelected = selectedQualId === q.id;

              return (
                <div
                  key={q.id || index}
                  onClick={() => setSelectedQualId(q.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-50/70 border-sky-400 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">{q.title}</span>
                        <NsqfBadge level={q.level || 4} />
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {q.code}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        <strong>Sector:</strong> {q.sector || 'Skill Development'} • <strong>Awarding Body:</strong> {q.awarding_body || 'NCVET'}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-sm font-black text-sky-600">{item.matchScore}%</span>
                      <span className="text-[10px] text-slate-400 block">Match Score</span>
                    </div>
                  </div>

                  {/* Factor Breakdown */}
                  <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3 text-[10px] text-slate-500">
                    <span>Title Overlap: <strong>{item.matchingFactors?.titleOverlap || 0}%</strong></span>
                    <span>Sector Fit: <strong>{item.matchingFactors?.sectorMatch ? 'Yes' : 'No'}</strong></span>
                    <span>Level Match: <strong>{item.matchingFactors?.levelFit ? 'Yes' : 'No'}</strong></span>
                    <span className="text-slate-400">Source: {item.sourceReference || 'NQR Catalogue'}</span>
                  </div>

                  {/* Match Explanation */}
                  <p className="text-[11px] text-slate-600 italic mt-1.5 bg-white/80 p-2 rounded-xl border border-slate-100">
                    "{item.explanation}"
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Assessor Action Panel */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">
            Assessor Qualification Determination & Actions
          </h3>
          <p className="text-slate-500 text-[11px] mt-0.5">
            Select the appropriate review action and document your professional rationale.
          </p>
        </div>

        {/* Action Selector Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => setActionTab('CONFIRM')}
            className={`py-2 px-3 rounded-xl font-bold transition-all ${
              actionTab === 'CONFIRM'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Confirm Qualification
          </button>

          <button
            type="button"
            onClick={() => setActionTab('CHOOSE_DIFFERENT')}
            className={`py-2 px-3 rounded-xl font-bold transition-all ${
              actionTab === 'CHOOSE_DIFFERENT'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Choose from Catalogue
          </button>

          <button
            type="button"
            onClick={() => setActionTab('REQUEST_INFO')}
            className={`py-2 px-3 rounded-xl font-bold transition-all ${
              actionTab === 'REQUEST_INFO'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Request Information
          </button>

          <button
            type="button"
            onClick={() => setActionTab('RETURN_CORRECTION')}
            className={`py-2 px-3 rounded-xl font-bold transition-all ${
              actionTab === 'RETURN_CORRECTION'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Return for Correction
          </button>
        </div>

        {/* Tab 1: Confirm Qualification */}
        {actionTab === 'CONFIRM' && (
          <form onSubmit={handleConfirmQualification} className="space-y-3 pt-1">
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Selected Qualification ID:
              </label>
              <input
                type="text"
                value={selectedQualId}
                onChange={(e) => setSelectedQualId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="e.g. 2022/OAFM/MEPSC/06022 or ELE/Q6001"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Assessor Professional Rationale (Mandatory):
              </label>
              <textarea
                rows={3}
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                placeholder="Explain why this qualification pack aligns with candidate's declared hands-on work and submitted evidence..."
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">
                This rationale is permanently recorded in the candidate's assessment audit log.
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button
                variant="primary"
                size="md"
                type="submit"
                icon={CheckCircle2}
              >
                Confirm QP for Assessment
              </Button>

              <Button
                variant="outline"
                size="md"
                type="button"
                onClick={() => onSaveDraft(rationale)}
                icon={Save}
              >
                Save Review Draft
              </Button>

              <Button
                variant="secondary"
                size="md"
                type="button"
                onClick={onProceedToAssessment}
                icon={ArrowRight}
              >
                Proceed to Competency Assessment
              </Button>
            </div>
          </form>
        )}

        {/* Tab 2: Choose from Full 2,815 NQR Catalogue */}
        {actionTab === 'CHOOSE_DIFFERENT' && (
          <div className="space-y-3 pt-1">
            <form onSubmit={handleCatalogueSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search full 2,815 qualification catalogue (e.g. Electrician, Welder, Assistant)..."
                  value={catalogueQuery}
                  onChange={(e) => setCatalogueQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                disabled={isSearchingCatalogue}
              >
                {isSearchingCatalogue ? 'Searching...' : 'Search'}
              </Button>
            </form>

            {catalogueResults.length > 0 && (
              <div className="space-y-2 border-t border-slate-100 pt-2">
                <span className="font-bold text-slate-600 block">
                  Search Results ({catalogueResults.length}):
                </span>
                {catalogueResults.map((q) => (
                  <div
                    key={q.id}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-2 hover:border-sky-300"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{q.title}</span>
                        <NsqfBadge level={q.level || 4} />
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono block">
                        {q.code} • {q.sector}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedQualId(q.id);
                        setActionTab('CONFIRM');
                      }}
                    >
                      Select This QP
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Request Additional Info */}
        {actionTab === 'REQUEST_INFO' && (
          <form onSubmit={handleRequestClarificationSubmit} className="space-y-3 pt-1">
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Clarification Request to Candidate:
              </label>
              <textarea
                rows={3}
                value={clarificationNotes}
                onChange={(e) => setClarificationNotes(e.target.value)}
                placeholder="Specify what missing evidence or skill clarification is needed (e.g. 'Please provide a clear photo of your PPE or multimeter reading')..."
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
            <Button
              variant="primary"
              size="md"
              type="submit"
              icon={Send}
            >
              Send Request to Worker
            </Button>
          </form>
        )}

        {/* Tab 4: Return for Correction */}
        {actionTab === 'RETURN_CORRECTION' && (
          <form onSubmit={handleReturnCorrectionSubmit} className="space-y-3 pt-1">
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Correction Instructions:
              </label>
              <textarea
                rows={3}
                value={correctionNotes}
                onChange={(e) => setCorrectionNotes(e.target.value)}
                placeholder="State the corrections required before this application can proceed to assessment..."
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>
            <Button
              variant="danger"
              size="md"
              type="submit"
              icon={RotateCcw}
            >
              Return Application for Correction
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
