import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Calendar,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Sparkles,
  ClipboardCheck,
  FileSearch,
  Eye,
  Check
} from 'lucide-react';
import { StatusBadge, NsqfBadge } from '../common/Badge';
import { Button } from '../common/Button';

export const AssessorDashboard = ({
  candidates = [],
  activeAssessor,
  evaluations = {},
  onSelectCandidate,
  onNavigateTab
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [evidenceFilter, setEvidenceFilter] = useState('ALL');

  // Compute metrics
  const metrics = useMemo(() => {
    let assigned = 0;
    let pendingReview = 0;
    let inProgress = 0;
    let awaitingSignoff = 0;
    let completed = 0;

    candidates.forEach(c => {
      const evalData = evaluations[c.id];
      const status = evalData?.status || c.status;

      assigned++;
      if (status === 'SUBMITTED' || status === 'assigned') {
        pendingReview++;
      } else if (status === 'IN_REVIEW' || status === 'in_progress') {
        inProgress++;
      } else if (status === 'AWAITING_SIGNOFF' || status === 'submitted_review') {
        awaitingSignoff++;
      } else if (status === 'COMPETENT' || status === 'completed' || status === 'BRIDGE_REQUIRED') {
        completed++;
      }
    });

    return { assigned, pendingReview, inProgress, awaitingSignoff, completed };
  }, [candidates, evaluations]);

  // Extract unique sectors/trades for filter dropdown
  const availableSectors = useMemo(() => {
    const sectors = new Set();
    candidates.forEach(c => {
      if (c.currentRoleName) sectors.add(c.currentRoleName);
    });
    return Array.from(sectors);
  }, [candidates]);

  // Filter candidates
  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      const evalData = evaluations[c.id];
      const currentStatus = evalData?.status || c.status;

      // Search match
      const query = searchQuery.toLowerCase().trim();
      if (query) {
        const matchesName = c.name?.toLowerCase().includes(query);
        const matchesId = c.id?.toLowerCase().includes(query);
        const matchesRole = c.currentRoleName?.toLowerCase().includes(query);
        const matchesQual = (c.targetQualificationCode || c.qualificationId || '').toLowerCase().includes(query);
        if (!matchesName && !matchesId && !matchesRole && !matchesQual) return false;
      }

      // Status match
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'PENDING' && currentStatus !== 'SUBMITTED' && currentStatus !== 'assigned') return false;
        if (statusFilter === 'IN_PROGRESS' && currentStatus !== 'IN_REVIEW' && currentStatus !== 'in_progress') return false;
        if (statusFilter === 'AWAITING_SIGNOFF' && currentStatus !== 'AWAITING_SIGNOFF' && currentStatus !== 'submitted_review') return false;
        if (statusFilter === 'COMPLETED' && currentStatus !== 'COMPETENT' && currentStatus !== 'completed' && currentStatus !== 'BRIDGE_REQUIRED') return false;
      }

      // Sector/trade match
      if (sectorFilter !== 'ALL' && c.currentRoleName !== sectorFilter) {
        return false;
      }

      // Evidence status filter
      if (evidenceFilter !== 'ALL') {
        const evList = c.evidenceList || [];
        const reviews = evalData?.evidenceReviews || {};
        const reviewedCount = evList.filter(e => reviews[e.id]?.status === 'REVIEWED').length;
        const insufficientCount = evList.filter(e => reviews[e.id]?.status === 'INSUFFICIENT' || reviews[e.id]?.status === 'REQUIRES_VERIFICATION').length;

        if (evidenceFilter === 'REVIEWED' && (reviewedCount === 0 || reviewedCount < evList.length)) return false;
        if (evidenceFilter === 'PENDING' && reviewedCount === evList.length) return false;
        if (evidenceFilter === 'INSUFFICIENT' && insufficientCount === 0) return false;
      }

      return true;
    });
  }, [candidates, evaluations, searchQuery, statusFilter, sectorFilter, evidenceFilter]);

  const getEvidenceReviewSummary = (candidate) => {
    const evList = candidate.evidenceList || [];
    if (evList.length === 0) return { label: 'No evidence uploaded', color: 'slate' };

    const reviews = evaluations[candidate.id]?.evidenceReviews || {};
    let reviewedCount = 0;
    let insufficientCount = 0;
    let pendingCount = 0;

    evList.forEach(ev => {
      const rev = reviews[ev.id];
      if (!rev || rev.status === 'PENDING') pendingCount++;
      else if (rev.status === 'REVIEWED') reviewedCount++;
      else if (rev.status === 'INSUFFICIENT' || rev.status === 'REQUIRES_VERIFICATION') insufficientCount++;
    });

    if (insufficientCount > 0) {
      return {
        label: `${insufficientCount} Item${insufficientCount > 1 ? 's' : ''} Flagged / Action Required`,
        color: 'amber',
        reviewedRatio: `${reviewedCount}/${evList.length} Reviewed`
      };
    }
    if (reviewedCount === evList.length) {
      return {
        label: `All ${evList.length} Evidence Items Reviewed`,
        color: 'emerald',
        reviewedRatio: `${reviewedCount}/${evList.length} Reviewed`
      };
    }
    return {
      label: `${pendingCount} Evidence Item${pendingCount > 1 ? 's' : ''} Pending Review`,
      color: 'sky',
      reviewedRatio: `${reviewedCount}/${evList.length} Reviewed`
    };
  };

  return (
    <div className="space-y-4">
      {/* Assessor Identity & Center Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-6 border border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-600 flex items-center justify-center font-bold text-white shadow-md flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold text-sky-400 bg-sky-950 border border-sky-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  NSDC Authorized Assessor
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {activeAssessor?.badgeNumber || 'NSDC-ASSESS-8841'}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-white mt-0.5">
                {activeAssessor?.name || 'Er. Vikram Sharma'}
              </h1>
              <p className="text-xs text-slate-400">
                {activeAssessor?.centerName || 'Government ITI Alambagh, Lucknow'}
              </p>
            </div>
          </div>

          <div className="bg-slate-800/90 px-3.5 py-2.5 rounded-2xl border border-slate-700/80 text-xs">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Candidate Queue</span>
            <span className="text-lg font-black text-sky-300">{candidates.length} Workers Assigned</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            statusFilter === 'ALL'
              ? 'bg-sky-50 border-sky-300 shadow-2xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Assigned Total</span>
          <span className="text-xl font-black text-slate-900 mt-0.5 block">{metrics.assigned}</span>
          <span className="text-[10px] text-slate-400">Applications</span>
        </button>

        <button
          onClick={() => setStatusFilter('PENDING')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            statusFilter === 'PENDING'
              ? 'bg-amber-50 border-amber-300 shadow-2xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-bold text-amber-700 uppercase block">Pending Reviews</span>
          <span className="text-xl font-black text-amber-900 mt-0.5 block">{metrics.pendingReview}</span>
          <span className="text-[10px] text-amber-600">Awaiting Assessor</span>
        </button>

        <button
          onClick={() => setStatusFilter('IN_PROGRESS')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            statusFilter === 'IN_PROGRESS'
              ? 'bg-sky-50 border-sky-300 shadow-2xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-bold text-sky-700 uppercase block">In Progress</span>
          <span className="text-xl font-black text-sky-900 mt-0.5 block">{metrics.inProgress}</span>
          <span className="text-[10px] text-sky-600">Under Assessment</span>
        </button>

        <button
          onClick={() => setStatusFilter('AWAITING_SIGNOFF')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            statusFilter === 'AWAITING_SIGNOFF'
              ? 'bg-indigo-50 border-indigo-300 shadow-2xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-bold text-indigo-700 uppercase block">Awaiting Sign-off</span>
          <span className="text-xl font-black text-indigo-900 mt-0.5 block">{metrics.awaitingSignoff}</span>
          <span className="text-[10px] text-indigo-600">Review Summary Ready</span>
        </button>

        <button
          onClick={() => setStatusFilter('COMPLETED')}
          className={`p-3 rounded-2xl border text-left transition-all col-span-2 sm:col-span-1 ${
            statusFilter === 'COMPLETED'
              ? 'bg-emerald-50 border-emerald-300 shadow-2xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-bold text-emerald-700 uppercase block">Completed</span>
          <span className="text-xl font-black text-emerald-900 mt-0.5 block">{metrics.completed}</span>
          <span className="text-[10px] text-emerald-600">Decisions Recorded</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-2.5">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by worker name, ID, trade, or qualification code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Trade Filter */}
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none text-slate-700 cursor-pointer"
          >
            <option value="ALL">All Declared Trades</option>
            {availableSectors.map(trade => (
              <option key={trade} value={trade}>{trade}</option>
            ))}
          </select>

          {/* Evidence Filter */}
          <select
            value={evidenceFilter}
            onChange={(e) => setEvidenceFilter(e.target.value)}
            className="py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none text-slate-700 cursor-pointer"
          >
            <option value="ALL">All Evidence Statuses</option>
            <option value="REVIEWED">All Evidence Reviewed</option>
            <option value="PENDING">Evidence Pending Review</option>
            <option value="INSUFFICIENT">Flagged / Insufficient</option>
          </select>
        </div>
      </div>

      {/* Candidate Applications List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-600">
            Assigned Applications ({filteredCandidates.length})
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            Tap card or action button to enter workflow
          </span>
        </div>

        {filteredCandidates.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-2">
            <AlertTriangle className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">No applications found</h4>
            <p className="text-xs text-slate-500">
              Try adjusting your search criteria or clear status filters.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setSectorFilter('ALL');
                setEvidenceFilter('ALL');
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          filteredCandidates.map(c => {
            const evalData = evaluations[c.id];
            const evidenceStatus = getEvidenceReviewSummary(c);
            const reviewedCriteriaCount = Object.values(evalData?.criteriaAssessments || {}).filter(
              item => item.outcome && item.outcome !== 'NOT_ASSESSED'
            ).length;
            const lastUpdated = evalData?.updatedAt
              ? new Date(evalData.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
              : (c.assessmentRecord?.evaluatedAt
                ? new Date(c.assessmentRecord.evaluatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                : '12 Oct 2026');

            return (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-sky-300 transition-all space-y-3 text-xs"
              >
                {/* Top strip: Worker ID, Demo Tag, Status */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {c.id}
                    </span>
                    {c.isDemoRecord && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                        Demo Record
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Updated: {lastUpdated}
                    </span>
                  </div>

                  <StatusBadge status={evalData?.status || c.status} />
                </div>

                {/* Worker Profile Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{c.name}</h3>
                      <NsqfBadge level={c.nsqfLevel || 4} />
                    </div>
                    <p className="text-xs text-slate-600">
                      <strong>Trade:</strong> {c.currentRoleName} • {c.yearsExperience} yrs exp • {c.location}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      <strong>Target QP:</strong> {c.confirmedQualification?.title || c.targetQualificationCode || c.currentRoleName}
                    </p>
                  </div>
                </div>

                {/* Evidence & Assessment Progress Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {/* Evidence Status */}
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      evidenceStatus.color === 'emerald' ? 'bg-emerald-500' :
                      evidenceStatus.color === 'amber' ? 'bg-amber-500' : 'bg-sky-500'
                    }`} />
                    <div className="truncate">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Evidence Status</span>
                      <span className="text-xs font-medium text-slate-800 truncate block">
                        {evidenceStatus.label}
                      </span>
                    </div>
                  </div>

                  {/* Criteria Evaluated Progress */}
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Criteria Reviewed</span>
                    <span className="text-xs font-semibold text-slate-800">
                      {reviewedCriteriaCount > 0
                        ? `${reviewedCriteriaCount} Criteria Evaluated`
                        : 'Assessment not started'}
                    </span>
                  </div>
                </div>

                {/* Quick Workflow Action Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onSelectCandidate(c.id);
                      onNavigateTab('review');
                    }}
                    icon={FileSearch}
                  >
                    Review Profile & QP
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      onSelectCandidate(c.id);
                      onNavigateTab('competencies');
                    }}
                    icon={ClipboardCheck}
                  >
                    Assess Competencies
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onSelectCandidate(c.id);
                      onNavigateTab('evidence');
                    }}
                    icon={FileText}
                  >
                    Manage Evidence ({c.evidenceList?.length || 0})
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      onSelectCandidate(c.id);
                      onNavigateTab('summary');
                    }}
                    icon={ShieldCheck}
                  >
                    Summary Dossier
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
