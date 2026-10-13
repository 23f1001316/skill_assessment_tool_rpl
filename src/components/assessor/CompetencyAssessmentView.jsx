import React, { useState, useEffect, useMemo } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  Paperclip,
  Save,
  Flag,
  ChevronDown,
  ChevronUp,
  Search,
  BookOpen,
  ArrowRight,
  Info,
  Layers
} from 'lucide-react';
import { Button } from '../common/Button';
import { ProgressBar } from '../common/ProgressBar';
import {
  assessorAssessmentService,
  PROVISIONAL_RUBRIC
} from '../../services/assessorAssessmentService';
import { dataRepository } from '../../services/dataRepository';

export const CompetencyAssessmentView = ({
  candidate,
  evaluation,
  activeAssessor,
  onUpdateCriterion,
  onSaveDraft,
  onProceedToSummary,
  onNavigateTab
}) => {
  const [criteriaData, setCriteriaData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCurriculumId, setSelectedCurriculumId] = useState('');
  const [availableCurricula, setAvailableCurricula] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expandedCriteria, setExpandedCriteria] = useState({});
  const [toastMessage, setToastMessage] = useState(null);

  const activeQualification = evaluation?.qualification || candidate?.confirmedQualification;
  const qualCode = activeQualification?.code || candidate?.targetQualificationCode || '2022/OAFM/MEPSC/06022';
  const qualId = activeQualification?.id || candidate?.qualificationId;

  // Load criteria & curricula on mount or when qual changes
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      await dataRepository.init();
      const curricula = dataRepository.getCurriculumVersions();
      if (isMounted) {
        setAvailableCurricula(curricula || []);
      }

      const res = await assessorAssessmentService.getApplicableCriteria(
        qualCode,
        qualId,
        selectedCurriculumId || null
      );

      if (isMounted) {
        setCriteriaData(res);
        // Expand first 3 by default
        const initialExpanded = {};
        res.criteria.slice(0, 3).forEach(c => { initialExpanded[c.id] = true; });
        setExpandedCriteria(initialExpanded);
        setIsLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [qualCode, qualId, selectedCurriculumId]);

  // Modules list for filtering
  const moduleList = useMemo(() => {
    if (!criteriaData?.criteria) return [];
    const modules = new Set();
    criteriaData.criteria.forEach(c => {
      if (c.associatedModule) modules.add(c.associatedModule);
    });
    return Array.from(modules);
  }, [criteriaData]);

  // Compute progress ratio (Proportion of criteria reviewed)
  const progressStats = useMemo(() => {
    const totalCount = criteriaData?.criteria?.length || 0;
    const reviewedCount = (criteriaData?.criteria || []).filter(c => {
      const assessment = evaluation?.criteriaAssessments?.[c.id];
      return assessment && assessment.outcome && assessment.outcome !== 'NOT_ASSESSED';
    }).length;

    const percentage = totalCount > 0 ? Math.round((reviewedCount / totalCount) * 100) : 0;
    return { reviewedCount, totalCount, percentage };
  }, [criteriaData, evaluation]);

  // Filter criteria list
  const filteredCriteria = useMemo(() => {
    if (!criteriaData?.criteria) return [];
    return criteriaData.criteria.filter(c => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesCode = c.code?.toLowerCase().includes(query);
        const matchesDesc = c.description?.toLowerCase().includes(query);
        const matchesMod = c.associatedModule?.toLowerCase().includes(query);
        if (!matchesCode && !matchesDesc && !matchesMod) return false;
      }

      // Module filter
      if (selectedModule !== 'ALL' && c.associatedModule !== selectedModule) {
        return false;
      }

      // Outcome Status filter
      if (statusFilter !== 'ALL') {
        const currentOutcome = evaluation?.criteriaAssessments?.[c.id]?.outcome || 'NOT_ASSESSED';
        if (statusFilter !== currentOutcome) return false;
      }

      return true;
    });
  }, [criteriaData, searchQuery, selectedModule, statusFilter, evaluation]);

  const handleOutcomeChange = (criterionId, outcome) => {
    const current = evaluation?.criteriaAssessments?.[criterionId] || {};
    onUpdateCriterion(criterionId, {
      outcome,
      observations: current.observations || '',
      linkedEvidenceIds: current.linkedEvidenceIds || [],
      insufficientFlag: current.insufficientFlag || false,
      insufficientReason: current.insufficientReason || '',
      assessorInfo: activeAssessor
    });

    setToastMessage(`Criterion marked as "${PROVISIONAL_RUBRIC[outcome]?.label || outcome}"`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleObservationsChange = (criterionId, observations) => {
    const current = evaluation?.criteriaAssessments?.[criterionId] || {};
    onUpdateCriterion(criterionId, {
      ...current,
      observations,
      assessorInfo: activeAssessor
    });
  };

  const handleToggleEvidenceLink = (criterionId, evidenceId) => {
    const current = evaluation?.criteriaAssessments?.[criterionId] || {};
    const existingLinks = current.linkedEvidenceIds || [];
    const newLinks = existingLinks.includes(evidenceId)
      ? existingLinks.filter(id => id !== evidenceId)
      : [...existingLinks, evidenceId];

    onUpdateCriterion(criterionId, {
      ...current,
      linkedEvidenceIds: newLinks,
      assessorInfo: activeAssessor
    });
  };

  const handleToggleInsufficient = (criterionId) => {
    const current = evaluation?.criteriaAssessments?.[criterionId] || {};
    const newFlag = !current.insufficientFlag;
    onUpdateCriterion(criterionId, {
      ...current,
      insufficientFlag: newFlag,
      insufficientReason: newFlag ? (current.insufficientReason || 'Evidence does not clearly demonstrate hands-on standard') : '',
      assessorInfo: activeAssessor
    });
  };

  const handleInsufficientReasonChange = (criterionId, reason) => {
    const current = evaluation?.criteriaAssessments?.[criterionId] || {};
    onUpdateCriterion(criterionId, {
      ...current,
      insufficientReason: reason,
      assessorInfo: activeAssessor
    });
  };

  const toggleExpand = (id) => {
    setExpandedCriteria(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-4 text-xs pb-16 sm:pb-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-2xl shadow-xl border border-sky-500 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-sky-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner: Qualification & Source Grounding */}
      <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold text-sky-400 bg-sky-950 border border-sky-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Competency Assessment Matrix
              </span>
              <span className="font-mono text-slate-400 text-[11px]">
                {activeQualification?.code || 'NO_CODE'}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white mt-1">
              {activeQualification?.title || candidate.currentRoleName}
            </h2>
            <p className="text-xs text-slate-400">
              Sector: {activeQualification?.sector || 'Skill Development'} • Level {activeQualification?.level || 4}
            </p>
          </div>

          <div className="bg-slate-800/90 p-3 rounded-2xl border border-slate-700/80 text-xs min-w-[200px]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Criteria Reviewed</span>
              <span className="font-extrabold text-sky-300">
                {progressStats.reviewedCount} / {progressStats.totalCount} ({progressStats.percentage}%)
              </span>
            </div>
            <ProgressBar
              value={progressStats.percentage}
              max={100}
              color="sky"
              size="sm"
            />
            <span className="text-[9px] text-slate-400 block mt-1 text-right">
              Proportion of criteria reviewed (Not a pass/fail mark)
            </span>
          </div>
        </div>

        {/* Source Grounding Citation */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            <span>
              Source File: <strong className="text-white">{criteriaData?.sourceFile || 'NQR Catalogue'}</strong>
              {criteriaData?.sourceReference ? ` (${criteriaData.sourceReference})` : ''}
            </span>
          </div>

          {!criteriaData?.isSourceVerified && (
            <span className="text-amber-400 bg-amber-950/80 border border-amber-800 px-2 py-0.5 rounded-md font-bold text-[10px]">
              Source verification required — Provisional Rubric Active
            </span>
          )}
        </div>
      </div>

      {/* Curriculum Duration Selector (Keep 30, 60, 90, 120 Hours separate) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-600" />
            <span className="font-bold text-slate-800 text-xs">
              Employability Skills & Curriculum Version:
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            Strictly maintains independent 30h, 60h, 90h, 120h tracks
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedCurriculumId('')}
            className={`py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all ${
              selectedCurriculumId === ''
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Domain Standards Only
          </button>
          {availableCurricula.map(curr => (
            <button
              key={curr.id}
              type="button"
              onClick={() => setSelectedCurriculumId(curr.id)}
              className={`py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all ${
                selectedCurriculumId === curr.id
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {curr.duration_hours}h ES Curriculum
            </button>
          ))}
        </div>
      </div>

      {/* Provisional Rubric Policy Advisory */}
      <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 space-y-1">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-500" />
          <span className="font-bold text-slate-800">
            Evaluation Rubric: {criteriaData?.hasOfficialRubric ? 'Official Source Rubric' : 'Provisional — requires authorised review'}
          </span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-600">
          {criteriaData?.hasOfficialRubric ? (
            `Official rubric from Assessment_Guide.pdf.pdf: ${criteriaData.officialRubric?.ratio || '40% Theory : 60% Practical'}, ${criteriaData.officialRubric?.pass_mark_aggregate}% pass threshold.`
          ) : (
            'The source documents do not define an official numerical scoring rubric for this trade. The provisional rubric records assessor observations only. It does NOT convert into pass/fail outcomes or certification eligibility.'
          )}
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search criteria text or PC code (e.g. PC10, wiring, safety)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
            />
          </div>

          {/* Module Selector */}
          {moduleList.length > 0 && (
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none text-slate-700 cursor-pointer max-w-[200px]"
            >
              <option value="ALL">All Modules ({moduleList.length})</option>
              {moduleList.map(mod => (
                <option key={mod} value={mod}>{mod}</option>
              ))}
            </select>
          )}

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none text-slate-700 cursor-pointer"
          >
            <option value="ALL">All Rubric States</option>
            <option value="NOT_ASSESSED">Not Assessed</option>
            <option value="NOT_DEMONSTRATED">Not Demonstrated</option>
            <option value="PARTIALLY_DEMONSTRATED">Partially Demonstrated</option>
            <option value="DEMONSTRATED">Demonstrated</option>
          </select>
        </div>
      </div>

      {/* Criteria Cards List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="font-bold text-slate-700">
            Applicable Criteria ({filteredCriteria.length} of {criteriaData?.criteria?.length || 0})
          </span>
          <span className="text-slate-400 text-[11px]">
            Tap card header to collapse/expand
          </span>
        </div>

        {isLoading ? (
          <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center text-slate-500">
            <ClipboardCheck className="w-6 h-6 animate-pulse mx-auto mb-2 text-sky-600" />
            <span>Loading competency criteria from extracted data repository...</span>
          </div>
        ) : filteredCriteria.length === 0 ? (
          <div className="p-6 bg-white rounded-3xl border border-slate-200 text-center text-slate-500">
            No criteria match your filter criteria.
          </div>
        ) : (
          filteredCriteria.map((criterion) => {
            const currentEval = evaluation?.criteriaAssessments?.[criterion.id] || {};
            const outcome = currentEval.outcome || 'NOT_ASSESSED';
            const isExpanded = Boolean(expandedCriteria[criterion.id]);
            const linkedEvIds = currentEval.linkedEvidenceIds || [];
            const isInsufficient = Boolean(currentEval.insufficientFlag);

            const outcomeConfig = PROVISIONAL_RUBRIC[outcome] || PROVISIONAL_RUBRIC.NOT_ASSESSED;

            return (
              <div
                key={criterion.id}
                className={`bg-white rounded-2xl border transition-all shadow-xs ${
                  outcome === 'DEMONSTRATED'
                    ? 'border-emerald-300'
                    : outcome === 'PARTIALLY_DEMONSTRATED'
                    ? 'border-amber-300'
                    : outcome === 'NOT_DEMONSTRATED'
                    ? 'border-rose-300'
                    : 'border-slate-200'
                }`}
              >
                {/* Criterion Card Header (Always Visible) */}
                <div
                  onClick={() => toggleExpand(criterion.id)}
                  className="p-3.5 flex items-start justify-between gap-3 cursor-pointer select-none hover:bg-slate-50/60 rounded-2xl transition-colors"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                        {criterion.code}
                      </span>
                      <span className="text-[10px] text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded truncate max-w-[220px]">
                        {criterion.associatedModule}
                      </span>
                      {criterion.sourcePage && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          Page {criterion.sourcePage}
                        </span>
                      )}
                      {isInsufficient && (
                        <span className="text-[9px] font-bold text-amber-700 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Flag className="w-2.5 h-2.5" /> Flagged Insufficient
                        </span>
                      )}
                    </div>

                    <p className="font-semibold text-slate-900 text-xs line-clamp-2">
                      {criterion.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      outcome === 'DEMONSTRATED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : outcome === 'PARTIALLY_DEMONSTRATED'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : outcome === 'NOT_DEMONSTRATED'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {outcomeConfig.label}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Assessment Controls */}
                {isExpanded && (
                  <div className="p-3.5 pt-0 space-y-3.5 border-t border-slate-100 mt-1">
                    {/* Source Information & Assessment Method */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-[11px]">
                      <div className="flex items-center justify-between text-slate-500 flex-wrap gap-1">
                        <span><strong>Source:</strong> {criterion.sourceFile} (Page/Row: {criterion.sourcePage || criterion.sourceRow || 'N/A'})</span>
                        <span><strong>Assessment Method:</strong> {criterion.assessmentMethod}</span>
                      </div>
                      {criterion.weightage && (
                        <span className="text-slate-600 block">
                          <strong>Module Weightage:</strong> {criterion.weightage}%
                        </span>
                      )}
                    </div>

                    {/* Outcome Rubric Selector Buttons */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="font-bold text-slate-800 text-xs">
                          Criterion Outcome:
                        </label>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {criterion.isProvisional ? 'Provisional — requires authorised review' : 'Source Criterion'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {Object.values(PROVISIONAL_RUBRIC).map((rub) => {
                          const isCurrent = outcome === rub.key;
                          return (
                            <button
                              key={rub.key}
                              type="button"
                              onClick={() => handleOutcomeChange(criterion.id, rub.key)}
                              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border ${
                                isCurrent
                                  ? rub.key === 'DEMONSTRATED'
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                    : rub.key === 'PARTIALLY_DEMONSTRATED'
                                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                    : rub.key === 'NOT_DEMONSTRATED'
                                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                                    : 'bg-slate-700 text-white border-slate-700 shadow-xs'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              {rub.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Assessor Observation Notes */}
                    <div>
                      <label className="font-bold text-slate-800 text-xs block mb-1">
                        Assessor Observation Notes:
                      </label>
                      <textarea
                        rows={2}
                        value={currentEval.observations || ''}
                        onChange={(e) => handleObservationsChange(criterion.id, e.target.value)}
                        placeholder="Record hands-on observations, technique notes, tool handling, or viva response..."
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                      />
                    </div>

                    {/* Link Uploaded Evidence Items */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-slate-800 text-xs flex items-center gap-1">
                          <Paperclip className="w-3.5 h-3.5 text-sky-600" />
                          Link Evidence Files ({linkedEvIds.length} Linked):
                        </label>
                        <button
                          type="button"
                          onClick={() => onNavigateTab('evidence')}
                          className="text-[11px] text-sky-600 hover:underline font-semibold cursor-pointer"
                        >
                          View Full Evidence Tab
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {(candidate.evidenceList || []).map((ev) => {
                          const isLinked = linkedEvIds.includes(ev.id);
                          return (
                            <label
                              key={ev.id}
                              className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                                isLinked
                                  ? 'bg-sky-50/80 border-sky-300 text-sky-950 font-medium'
                                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isLinked}
                                onChange={() => handleToggleEvidenceLink(criterion.id, ev.id)}
                                className="w-3.5 h-3.5 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
                              />
                              <span className="truncate flex-1">
                                {ev.title} ({ev.type})
                              </span>
                              {ev.date && (
                                <span className="text-[10px] text-slate-400">{ev.date}</span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Flag Insufficient / Unclear Evidence */}
                    <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isInsufficient}
                          onChange={() => handleToggleInsufficient(criterion.id)}
                          className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-amber-300"
                        />
                        <span className="font-bold text-amber-900 text-xs flex items-center gap-1">
                          <Flag className="w-3.5 h-3.5 text-amber-600" />
                          Flag Insufficient or Unclear Evidence for this Criterion
                        </span>
                      </label>

                      {isInsufficient && (
                        <div>
                          <label className="text-[11px] font-semibold text-amber-950 block mb-1">
                            Reason for Insufficiency (Mandatory):
                          </label>
                          <input
                            type="text"
                            value={currentEval.insufficientReason || ''}
                            onChange={(e) => handleInsufficientReasonChange(criterion.id, e.target.value)}
                            placeholder="State reason (e.g. photo angle does not verify PPE or tool isolation)..."
                            className="w-full p-2 rounded-lg border border-amber-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Sticky Bottom Action Bar for Mobile Touch */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-lg flex items-center justify-between gap-3 max-w-lg mx-auto sm:relative sm:max-w-none sm:border-0 sm:shadow-none sm:p-0 sm:bg-transparent">
        <div className="text-xs">
          <span className="text-[10px] text-slate-400 block font-semibold">Reviewed</span>
          <span className="font-extrabold text-slate-800">
            {progressStats.reviewedCount} / {progressStats.totalCount} Criteria
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSaveDraft}
            icon={Save}
          >
            Save Draft
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onProceedToSummary}
            icon={ArrowRight}
          >
            Review Summary
          </Button>
        </div>
      </div>
    </div>
  );
};
