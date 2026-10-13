import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Eye, 
  UserCheck, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  ChevronRight, 
  Clock, 
  Lock, 
  ShieldAlert 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge, NsqfBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

export const ApplicationManagementView = ({ initialFilter = {} }) => {
  const { 
    candidates, 
    assessors, 
    auditLogs, 
    allocateAssessor, 
    authorizeAssessmentRecord 
  } = useApp();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialFilter.status || 'ALL');
  const [qualFilter, setQualFilter] = useState('ALL');
  const [assessmentStatusFilter, setAssessmentStatusFilter] = useState('ALL');
  const [assessorFilter, setAssessorFilter] = useState('ALL');
  const [evidenceFilter, setEvidenceFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL'); // 'ALL' | '7d' | '30d' | '90d'

  // Application Detail Modal
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [detailTab, setDetailTab] = useState('overview'); // 'overview' | 'assessment' | 'evidence' | 'history'
  const [reassignAssessorId, setReassignAssessorId] = useState('');
  const [coordinatorAuthRemarks, setCoordinatorAuthRemarks] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Distinct Qualifications for filter
  const distinctQualifications = useMemo(() => {
    const map = new Map();
    candidates.forEach(c => {
      const label = c.currentRoleName || c.qualificationId;
      if (!map.has(label)) {
        map.set(label, { id: c.qualificationId, title: label });
      }
    });
    return Array.from(map.values());
  }, [candidates]);

  // Filter application records
  const filteredCandidates = useMemo(() => {
    const now = new Date();

    return candidates.filter(cand => {
      // 1. Search Query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = cand.name?.toLowerCase().includes(q);
        const matchesId = cand.id?.toLowerCase().includes(q);
        const matchesRole = cand.currentRoleName?.toLowerCase().includes(q);
        const matchesLoc = cand.location?.toLowerCase().includes(q);
        const matchesQual = cand.qualificationId?.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesRole && !matchesLoc && !matchesQual) {
          return false;
        }
      }

      // 2. Application Status
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'AWAITING_REVIEW') {
          if (cand.status !== 'SUBMITTED' && cand.status !== 'DRAFT' && cand.assignedAssessorId) {
            return false;
          }
        } else if (statusFilter === 'COMPLETED') {
          if (cand.status !== 'COMPETENT' && cand.status !== 'BRIDGE_REQUIRED') {
            return false;
          }
        } else if (cand.status !== statusFilter) {
          return false;
        }
      }

      // 3. Selected Qualification
      if (qualFilter !== 'ALL') {
        if (cand.currentRoleName !== qualFilter && cand.qualificationId !== qualFilter) {
          return false;
        }
      }

      // 4. Assessment Status
      if (assessmentStatusFilter !== 'ALL') {
        if (assessmentStatusFilter === 'UNASSIGNED' && cand.assignedAssessorId) return false;
        if (assessmentStatusFilter === 'IN_PROGRESS' && cand.status !== 'IN_REVIEW') return false;
        if (assessmentStatusFilter === 'AWAITING_AUTHORISATION' && cand.status !== 'AWAITING_AUTHORISED_REVIEW') return false;
        if (assessmentStatusFilter === 'COMPETENT' && cand.status !== 'COMPETENT') return false;
        if (assessmentStatusFilter === 'BRIDGE_REQUIRED' && cand.status !== 'BRIDGE_REQUIRED') return false;
      }

      // 5. Assessor Filter
      if (assessorFilter !== 'ALL') {
        if (assessorFilter === 'UNASSIGNED') {
          if (cand.assignedAssessorId) return false;
        } else if (cand.assignedAssessorId !== assessorFilter) {
          return false;
        }
      }

      // 6. Evidence Review Status
      if (evidenceFilter !== 'ALL') {
        const evStatus = cand.evidenceReviewStatus || (cand.evidenceList?.length ? 'Pending Review' : 'No Evidence');
        if (!evStatus.toLowerCase().includes(evidenceFilter.toLowerCase())) {
          return false;
        }
      }

      // 7. Date Filter
      if (dateFilter !== 'ALL' && cand.submittedAt) {
        const subDate = new Date(cand.submittedAt);
        const diffDays = (now - subDate) / (1000 * 60 * 60 * 24);
        if (dateFilter === '7d' && diffDays > 7) return false;
        if (dateFilter === '30d' && diffDays > 30) return false;
        if (dateFilter === '90d' && diffDays > 90) return false;
      }

      return true;
    });
  }, [
    candidates, 
    searchQuery, 
    statusFilter, 
    qualFilter, 
    assessmentStatusFilter, 
    assessorFilter, 
    evidenceFilter, 
    dateFilter
  ]);

  const handleOpenDetail = (cand) => {
    setSelectedCandidate(cand);
    setDetailTab('overview');
    setReassignAssessorId(cand.assignedAssessorId || assessors[0]?.id || '');
    setCoordinatorAuthRemarks('');
  };

  const handleReassign = (e) => {
    e.preventDefault();
    if (!selectedCandidate || !reassignAssessorId) return;
    allocateAssessor(selectedCandidate.id, reassignAssessorId);
    const assessor = assessors.find(a => a.id === reassignAssessorId);
    showToast(`Assigned ${selectedCandidate.name} to Assessor ${assessor?.name}!`);
    // Update active modal candidate reference
    setSelectedCandidate(prev => ({
      ...prev,
      assignedAssessorId: reassignAssessorId,
      status: prev.status === 'SUBMITTED' ? 'IN_REVIEW' : prev.status
    }));
  };

  const handleAuthorizeReview = () => {
    if (!selectedCandidate) return;
    authorizeAssessmentRecord(selectedCandidate.id, coordinatorAuthRemarks);
    showToast(`Authorised assessment record for ${selectedCandidate.name}! Certificate issued.`);
    setSelectedCandidate(prev => ({
      ...prev,
      status: prev.assessmentRecord?.verdict === 'COMPETENT' ? 'COMPETENT' : 'BRIDGE_REQUIRED',
      assessmentRecord: {
        ...prev.assessmentRecord,
        status: 'AUTHORISED',
        authorisedAt: new Date().toISOString(),
        authorisedBy: 'Dr. Priya Nair (Scheme Coordinator)'
      }
    }));
  };

  // Masking helpers for sensitive worker privacy
  const getMaskedPhone = (phone) => {
    if (!phone) return 'Not Provided';
    return phone.replace(/(\+91\s\d{5}\s)\d{5}/, '$1XXXXX');
  };

  // Candidate timeline events from audit logs
  const candidateHistory = useMemo(() => {
    if (!selectedCandidate) return [];
    return auditLogs.filter(log => log.candidateId === selectedCandidate.id);
  }, [selectedCandidate, auditLogs]);

  return (
    <div className="space-y-4 text-xs">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-2xl shadow-xl border border-indigo-500 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & PII Protection Notice */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                RPL Application Roster
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {filteredCandidates.length} of {candidates.length} Applications Displayed
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
              Application Management & Assessment Oversight
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review enrolled candidates, monitor assessor evaluations, verify evidence status, and authorize final RPL outcomes.
            </p>
          </div>

          {/* Privacy Shield Indicator */}
          <div className="bg-amber-50 border border-amber-200/80 px-3 py-2 rounded-2xl flex items-center gap-2 self-start sm:self-auto text-amber-900">
            <Lock className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider block">Privacy Guard Active</span>
              <span className="text-[11px] text-amber-800">Aadhaar & Contact Details Masked</span>
            </div>
          </div>
        </div>

        {/* Multi-filter Toolbar */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2.5">
          
          {/* Row 1: Search & Quick Reset */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidate name, ID, phone, trade, or district..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setQualFilter('ALL');
                setAssessmentStatusFilter('ALL');
                setAssessorFilter('ALL');
                setEvidenceFilter('ALL');
                setDateFilter('ALL');
              }}
              className="px-3 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-200/60 font-semibold text-xs whitespace-nowrap transition-colors flex items-center justify-center gap-1"
            >
              Reset Filters
            </button>
          </div>

          {/* Row 2: Specific Dropdown Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            
            {/* 1. Application Status */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                App Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-2 py-1.5 rounded-xl border border-slate-300 bg-white text-[11px] font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUBMITTED">Submitted / AI Intake</option>
                <option value="IN_REVIEW">Under Assessor Review</option>
                <option value="AWAITING_AUTHORISED_REVIEW">Awaiting Sign-Off</option>
                <option value="COMPETENT">Certified Competent</option>
                <option value="BRIDGE_REQUIRED">Bridge Mandated</option>
              </select>
            </div>

            {/* 2. Selected Qualification */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                Trade / QP
              </label>
              <select
                value={qualFilter}
                onChange={(e) => setQualFilter(e.target.value)}
                className="w-full px-2 py-1.5 rounded-xl border border-slate-300 bg-white text-[11px] font-medium"
              >
                <option value="ALL">All Trades</option>
                {distinctQualifications.map(q => (
                  <option key={q.id} value={q.title}>{q.title}</option>
                ))}
              </select>
            </div>

            {/* 3. Assessment Status */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                Evaluation Stage
              </label>
              <select
                value={assessmentStatusFilter}
                onChange={(e) => setAssessmentStatusFilter(e.target.value)}
                className="w-full px-2 py-1.5 rounded-xl border border-slate-300 bg-white text-[11px] font-medium"
              >
                <option value="ALL">All Stages</option>
                <option value="UNASSIGNED">Pending Assessor</option>
                <option value="IN_PROGRESS">Evaluation In Progress</option>
                <option value="AWAITING_AUTHORISATION">Awaiting Authorisation</option>
                <option value="COMPETENT">Passed (Competent)</option>
                <option value="BRIDGE_REQUIRED">Bridge Training</option>
              </select>
            </div>

            {/* 4. Assessor Filter */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                Assigned Assessor
              </label>
              <select
                value={assessorFilter}
                onChange={(e) => setAssessorFilter(e.target.value)}
                className="w-full px-2 py-1.5 rounded-xl border border-slate-300 bg-white text-[11px] font-medium"
              >
                <option value="ALL">All Assessors</option>
                <option value="UNASSIGNED">Unassigned Only</option>
                {assessors.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            {/* 5. Evidence Review Status */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                Evidence Review
              </label>
              <select
                value={evidenceFilter}
                onChange={(e) => setEvidenceFilter(e.target.value)}
                className="w-full px-2 py-1.5 rounded-xl border border-slate-300 bg-white text-[11px] font-medium"
              >
                <option value="ALL">All Evidence States</option>
                <option value="Pending">Pending Review</option>
                <option value="AI Pre-screened">AI Pre-screened</option>
                <option value="Assessor">Assessor Evaluated</option>
              </select>
            </div>

            {/* 6. Date Filter */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                Submission Date
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-2 py-1.5 rounded-xl border border-slate-300 bg-white text-[11px] font-medium"
              >
                <option value="ALL">All Dates</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>

          </div>

        </div>

      </div>

      {/* Responsive View: Desktop Table + Mobile Cards */}
      <div className="space-y-3">
        
        {/* DESKTOP TABLE (Hidden on Mobile) */}
        <div className="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 text-slate-600 font-bold text-[11px] border-b border-slate-200 uppercase tracking-wider">
                <th className="py-3 px-3.5">Candidate / Application</th>
                <th className="py-3 px-3">Trade / Qualification</th>
                <th className="py-3 px-3">Application Status</th>
                <th className="py-3 px-3">Assigned Assessor</th>
                <th className="py-3 px-3">Evidence State</th>
                <th className="py-3 px-3">Score / Result</th>
                <th className="py-3 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredCandidates.length > 0 ? (
                filteredCandidates.map(cand => {
                  const assessor = assessors.find(a => a.id === cand.assignedAssessorId);
                  const isAwaitingAuth = cand.status === 'AWAITING_AUTHORISED_REVIEW';

                  return (
                    <tr 
                      key={cand.id} 
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                      onClick={() => handleOpenDetail(cand)}
                    >
                      {/* 1. Candidate Info */}
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-900">{cand.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                          <span>{cand.id}</span>
                          <span>•</span>
                          <span>{cand.location}</span>
                        </div>
                      </td>

                      {/* 2. Trade */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{cand.currentRoleName}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <NsqfBadge level={cand.nsqfLevel || 4} />
                          <span className="text-[10px] text-slate-400 font-mono">
                            {cand.yearsExperience} yrs exp
                          </span>
                        </div>
                      </td>

                      {/* 3. Status */}
                      <td className="py-3 px-3">
                        <StatusBadge status={cand.status} />
                      </td>

                      {/* 4. Assessor */}
                      <td className="py-3 px-3">
                        {assessor ? (
                          <div>
                            <div className="font-medium text-slate-900">{assessor.name}</div>
                            <div className="text-[10px] text-slate-400">{assessor.centerName?.split(',')[0]}</div>
                          </div>
                        ) : (
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-200">
                            Pending Assignment
                          </span>
                        )}
                      </td>

                      {/* 5. Evidence */}
                      <td className="py-3 px-3">
                        <span className="text-[11px] font-medium text-slate-700">
                          {cand.evidenceList?.length || 0} Artifacts
                        </span>
                        <div className="text-[10px] text-slate-400">
                          {cand.evidenceReviewStatus || 'AI Pre-screened'}
                        </div>
                      </td>

                      {/* 6. Score / Result */}
                      <td className="py-3 px-3">
                        {cand.assessmentRecord ? (
                          <div>
                            <div className="font-bold text-slate-900">
                              {cand.assessmentRecord.finalWeightedScore}% Score
                            </div>
                            <div className="text-[10px] font-bold text-emerald-700">
                              {cand.assessmentRecord.verdict}
                            </div>
                          </div>
                        ) : cand.aiSummary ? (
                          <div className="text-[11px] text-slate-500">
                            AI Readiness: <strong className="text-slate-800">{cand.aiSummary.readinessScore}%</strong>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">Awaiting Testing</span>
                        )}
                      </td>

                      {/* 7. Action Button */}
                      <td className="py-3 px-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetail(cand);
                          }}
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ml-auto ${
                            isAwaitingAuth
                              ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isAwaitingAuth ? 'Authorise' : 'Inspect'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No applications matched your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARD LIST (Visible on small screens) */}
        <div className="md:hidden space-y-2.5">
          {filteredCandidates.length > 0 ? (
            filteredCandidates.map(cand => {
              const assessor = assessors.find(a => a.id === cand.assignedAssessorId);
              const isAwaitingAuth = cand.status === 'AWAITING_AUTHORISED_REVIEW';

              return (
                <div
                  key={cand.id}
                  onClick={() => handleOpenDetail(cand)}
                  className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs space-y-2.5 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 text-sm">{cand.name}</strong>
                        <span className="text-[10px] font-mono text-slate-400">{cand.id}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {cand.currentRoleName} • {cand.yearsExperience} yrs exp
                      </p>
                    </div>
                    <StatusBadge status={cand.status} />
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <div>
                      <span>Assessor: </span>
                      <strong className="text-slate-800">
                        {assessor ? assessor.name : 'Pending Allocation'}
                      </strong>
                    </div>

                    <div className="flex items-center gap-1 text-indigo-600 font-bold">
                      <span>{isAwaitingAuth ? 'Authorise Sign-Off' : 'Inspect'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-500">
              No applications match the search and filter settings.
            </div>
          )}
        </div>

      </div>

      {/* =========================================================================
          APPLICATION DETAIL & AUDIT MODAL
      ========================================================================== */}
      {selectedCandidate && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedCandidate(null)}
          title={`Application Dossier • ${selectedCandidate.name}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4 text-xs">
            
            {/* Modal Header Summary */}
            <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                    {selectedCandidate.id}
                  </span>
                  <NsqfBadge level={selectedCandidate.nsqfLevel || 4} />
                  <span className="text-[10px] text-slate-400">
                    Enrolled: {selectedCandidate.submittedAt ? new Date(selectedCandidate.submittedAt).toLocaleDateString('en-GB') : 'Recent'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{selectedCandidate.name}</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Target Trade: <strong>{selectedCandidate.currentRoleName}</strong> ({selectedCandidate.qualificationId})
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <StatusBadge status={selectedCandidate.status} />
              </div>
            </div>

            {/* Privacy Shield Notice */}
            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl flex items-center justify-between text-[11px] text-slate-600">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Masked Aadhaar: <strong className="font-mono text-slate-800">{selectedCandidate.aadhaarMasked || 'XXXX-XXXX-4819'}</strong></span>
                <span>•</span>
                <span>Contact: <strong className="font-mono text-slate-800">{getMaskedPhone(selectedCandidate.phone)}</strong></span>
              </div>
              <span className="text-[10px] font-semibold text-slate-400">Location: {selectedCandidate.location}</span>
            </div>

            {/* Modal Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setDetailTab('overview')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                  detailTab === 'overview' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Overview & Intake
              </button>
              <button
                onClick={() => setDetailTab('assessment')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                  detailTab === 'assessment' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Assessment Status
              </button>
              <button
                onClick={() => setDetailTab('evidence')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                  detailTab === 'evidence' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Evidence ({selectedCandidate.evidenceList?.length || 0})
              </button>
              <button
                onClick={() => setDetailTab('history')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                  detailTab === 'history' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Audit History ({candidateHistory.length})
              </button>
            </div>

            {/* TAB 1: OVERVIEW & INTAKE */}
            {detailTab === 'overview' && (
              <div className="space-y-3.5">
                
                {/* Candidate Background */}
                <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs">Work Profile & Informal Background</h4>
                  <div className="grid grid-cols-2 gap-3 text-slate-700">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Years of Experience</span>
                      <p className="font-bold mt-0.5">{selectedCandidate.yearsExperience} Years</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Testing Center</span>
                      <p className="font-bold mt-0.5">{selectedCandidate.targetCenter || 'Regional Skill Center'}</p>
                    </div>
                  </div>
                </div>

                {/* AI Pre-Assessment Screening Summary */}
                {selectedCandidate.aiSummary && (
                  <div className="bg-teal-50/60 border border-teal-200 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-teal-950 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-teal-600" />
                        AI Pre-Screening Analysis (Advisory)
                      </span>
                      <span className="font-black text-teal-800 text-sm">
                        {selectedCandidate.aiSummary.readinessScore}% Readiness
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed text-[11px]">
                      {selectedCandidate.aiSummary.humanAssessorRecommendation}
                    </p>

                    {/* NOS Readiness Preview */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      {selectedCandidate.aiSummary.nosReadiness?.map(nos => (
                        <div key={nos.nosCode} className="bg-white/80 p-2 rounded-lg border border-teal-100 flex items-center justify-between">
                          <span className="font-medium text-slate-800 text-[10px]">{nos.nosCode}: {nos.nosTitle}</span>
                          <span className="font-bold text-teal-700 text-[10px]">{nos.readiness}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reallocate Assessor Form */}
                <form onSubmit={handleReassign} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    Assessor Allocation / Reassignment
                  </h4>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={reassignAssessorId}
                      onChange={(e) => setReassignAssessorId(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs"
                    >
                      {assessors.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.qualificationSector} • {a.centerName})
                        </option>
                      ))}
                    </select>

                    <Button
                      type="submit"
                      variant="secondary"
                      size="sm"
                      icon={UserCheck}
                    >
                      Update Assessor
                    </Button>
                  </div>
                </form>

              </div>
            )}

            {/* TAB 2: CURRENT ASSESSMENT STATUS */}
            {detailTab === 'assessment' && (
              <div className="space-y-3.5">
                
                {/* Authorisation Banner if awaiting sign-off */}
                {selectedCandidate.status === 'AWAITING_AUTHORISED_REVIEW' && (
                  <div className="bg-purple-50 border-2 border-purple-300 rounded-2xl p-4 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <ShieldAlert className="w-5 h-5 text-purple-700 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-purple-900 text-sm">
                          Assessor Submitted Evaluation • Dual Authorisation Required
                        </h4>
                        <p className="text-purple-800 text-xs leading-relaxed mt-0.5">
                          Assessor {selectedCandidate.assessmentRecord?.assessorName} completed the practical NOS examination. The candidate was evaluated as <strong>{selectedCandidate.assessmentRecord?.verdict}</strong> with score <strong>{selectedCandidate.assessmentRecord?.finalWeightedScore}%</strong>. As Scheme Coordinator, please audit the record and confirm certification.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1 border-t border-purple-200">
                      <label className="font-bold text-purple-950 block">Coordinator Audit Verification Notes:</label>
                      <input
                        type="text"
                        value={coordinatorAuthRemarks}
                        onChange={(e) => setCoordinatorAuthRemarks(e.target.value)}
                        placeholder="e.g. Audited against NCVET assessment rubric. Certificate generation approved."
                        className="w-full px-3 py-2 rounded-xl border border-purple-300 bg-white text-xs"
                      />

                      <div className="flex justify-end pt-1">
                        <Button
                          variant="primary"
                          size="md"
                          onClick={handleAuthorizeReview}
                          icon={ShieldCheck}
                          className="bg-purple-700 hover:bg-purple-800 text-white font-bold"
                        >
                          Confirm & Authorise RPL Certification
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Assessor Evaluation Record if completed */}
                {selectedCandidate.assessmentRecord ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Official Examination Record
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-0.5">
                          Evaluated by {selectedCandidate.assessmentRecord.assessorName}
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-slate-900">
                          {selectedCandidate.assessmentRecord.finalWeightedScore}%
                        </span>
                        <span className="text-[10px] block font-bold text-emerald-700 uppercase">
                          {selectedCandidate.assessmentRecord.verdict}
                        </span>
                      </div>
                    </div>

                    {/* Rubric Dimension Scores */}
                    {selectedCandidate.assessmentRecord.rubricScores && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        {Object.entries(selectedCandidate.assessmentRecord.rubricScores).map(([k, v]) => (
                          <div key={k} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
                            <span className="text-[10px] text-slate-400 uppercase font-semibold block">{k.replace('rubric-', '')}</span>
                            <span className="text-base font-bold text-slate-800">{v} / 4</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Remarks */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Assessor Official Verdict & Remarks:</span>
                      <p className="text-slate-800 italic leading-relaxed">
                        "{selectedCandidate.assessmentRecord.assessorRemarks}"
                      </p>
                    </div>

                    {/* Digital Signature & Certificate */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                      <span className="font-mono text-[10px]">
                        Sig: {selectedCandidate.assessmentRecord.digitalSignature}
                      </span>
                      {selectedCandidate.assessmentRecord.certificateId && (
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded text-[10px]">
                          Certificate: {selectedCandidate.assessmentRecord.certificateId}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center space-y-1.5">
                    <Clock className="w-5 h-5 text-slate-400 mx-auto" />
                    <h4 className="font-bold text-slate-800">Assessor Examination Not Yet Completed</h4>
                    <p className="text-slate-500 text-xs max-w-sm mx-auto">
                      Candidate has been scheduled or is undergoing practical demonstration. The certified assessor will submit scores through the NOS examination rubric.
                    </p>
                  </div>
                )}

              </div>
            )}

            {/* TAB 3: WORK EVIDENCE */}
            {detailTab === 'evidence' && (
              <div className="space-y-3">
                {selectedCandidate.evidenceList?.length > 0 ? (
                  selectedCandidate.evidenceList.map((ev, idx) => (
                    <div key={ev.id || idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 text-xs">{ev.title}</strong>
                        <span className="text-[10px] uppercase font-bold text-slate-500 bg-white px-2 py-0.5 rounded border">
                          {ev.type}
                        </span>
                      </div>

                      {ev.aiAnalysis && (
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 space-y-1">
                          <span className="text-[10px] text-teal-800 font-bold block">
                            AI Feature Extraction: {ev.aiAnalysis.nosAlignment} ({ev.aiAnalysis.confidence}% confidence)
                          </span>
                          {ev.aiAnalysis.detectedTools && (
                            <div className="flex flex-wrap gap-1">
                              {ev.aiAnalysis.detectedTools.map((tool, tIdx) => (
                                <span key={tIdx} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">
                                  {tool}
                                </span>
                              ))}
                            </div>
                          )}
                          {ev.aiAnalysis.safetyWarning && (
                            <div className="text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded flex items-center gap-1 mt-1">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>{ev.aiAnalysis.safetyWarning}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-6">No evidence attached yet.</p>
                )}
              </div>
            )}

            {/* TAB 4: AUDIT HISTORY */}
            {detailTab === 'history' && (
              <div className="space-y-2">
                {candidateHistory.length > 0 ? (
                  candidateHistory.map(log => (
                    <div key={log.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-900">{log.action}</span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed text-[11px]">{log.details}</p>
                      <div className="text-[10px] text-slate-400 pt-0.5 flex justify-between">
                        <span>Actor: <strong>{log.actor}</strong></span>
                        <span className="font-mono">{log.hash}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-6">No audit history recorded for this candidate.</p>
                )}
              </div>
            )}

            {/* Close Button */}
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCandidate(null)}
              >
                Close Dossier
              </Button>
            </div>

          </div>
        </Modal>
      )}

    </div>
  );
};
