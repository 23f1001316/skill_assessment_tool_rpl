import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  FileCheck, 
  ShieldAlert, 
  Database, 
  ArrowRight, 
  AlertCircle, 
  FileText,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { dataRepository } from '../../services/dataRepository';
import { Button } from '../common/Button';

export const CoordinatorDashboardView = ({ onNavigateTab }) => {
  const { candidates, assessors, auditLogs } = useApp();
  const [verificationStats, setVerificationStats] = useState({
    total: 2815,
    extracted: 2812,
    reviewed: 0,
    verified: 0,
    requires_review: 3
  });
  const [activityFilter, setActivityFilter] = useState('ALL'); // 'ALL' | 'ASSESSMENT' | 'EVIDENCE' | 'ALLOCATION'

  useEffect(() => {
    async function loadStats() {
      await dataRepository.init();
      const stats = dataRepository.getVerificationStats();
      const issues = dataRepository.getExtractionReviewIssues().filter(i => i.status !== 'resolved');
      setVerificationStats({
        ...stats,
        requires_review: Math.max(stats.requires_review, issues.length)
      });
    }
    loadStats();
  }, []);

  // Dynamic calculations from actual stored records
  const totalApplications = candidates.length;
  
  // Applications awaiting review: SUBMITTED or DRAFT or unallocated
  const awaitingReview = candidates.filter(
    c => c.status === 'SUBMITTED' || c.status === 'DRAFT' || !c.assignedAssessorId
  ).length;

  // Assessments in progress: assigned to assessor & active evaluation in progress
  const assessmentsInProgress = candidates.filter(
    c => c.status === 'IN_REVIEW'
  ).length;

  // Assessments awaiting authorised review: evaluation submitted by assessor awaiting coordinator sign-off
  const awaitingAuthorisedReview = candidates.filter(
    c => c.status === 'AWAITING_AUTHORISED_REVIEW' || 
         (c.assessmentRecord && !c.assessmentRecord.authorisedAt && c.status !== 'COMPETENT' && c.status !== 'BRIDGE_REQUIRED')
  ).length;

  // Completed assessment records: certified competent or bridge training mandated with final record
  const completedAssessments = candidates.filter(
    c => c.status === 'COMPETENT' || c.status === 'BRIDGE_REQUIRED' || (c.assessmentRecord?.verdict && c.assessmentRecord?.authorisedAt)
  ).length;

  // Qualification records requiring source verification
  const qualsRequiringVerification = verificationStats.requires_review;

  // Filtered recent activity
  const filteredActivities = auditLogs.filter(log => {
    if (activityFilter === 'ALL') return true;
    if (activityFilter === 'ASSESSMENT') {
      return log.action.includes('ASSESSMENT') || log.action.includes('COMPETENT') || log.action.includes('BRIDGE');
    }
    if (activityFilter === 'EVIDENCE') {
      return log.action.includes('EVIDENCE') || log.action.includes('PRE_ASSESSMENT');
    }
    if (activityFilter === 'ALLOCATION') {
      return log.action.includes('ALLOCAT');
    }
    return true;
  });

  return (
    <div className="space-y-5 text-xs">
      
      {/* 6 Key Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Card 1: Total Applications */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('applications', { status: 'ALL' })}
          className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Apps</span>
            <Users className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-0.5">{totalApplications}</p>
          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
            <span>Enrolled cohort</span>
            <span className="font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform">→</span>
          </div>
        </div>

        {/* Card 2: Applications Awaiting Review */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('applications', { status: 'AWAITING_REVIEW' })}
          className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Awaiting Intake</span>
            <Clock className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-amber-600 mt-0.5">{awaitingReview}</p>
          <div className="mt-1 flex items-center justify-between text-[10px] text-amber-700">
            <span>Pending allocation</span>
            <span className="font-semibold group-hover:translate-x-0.5 transition-transform">→</span>
          </div>
        </div>

        {/* Card 3: Assessments in Progress */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('applications', { status: 'IN_REVIEW' })}
          className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs hover:border-sky-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-sky-600 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">In Evaluation</span>
            <TrendingUp className="w-4 h-4 text-sky-500 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-sky-600 mt-0.5">{assessmentsInProgress}</p>
          <div className="mt-1 flex items-center justify-between text-[10px] text-sky-700">
            <span>With Assessors</span>
            <span className="font-semibold group-hover:translate-x-0.5 transition-transform">→</span>
          </div>
        </div>

        {/* Card 4: Assessments Awaiting Authorised Review */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('applications', { status: 'AWAITING_AUTHORISED_REVIEW' })}
          className="bg-purple-50/70 p-3.5 rounded-2xl border border-purple-200 shadow-2xs hover:shadow-xs hover:border-purple-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-purple-700 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Awaiting Sign-off</span>
            <ShieldAlert className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-purple-800 mt-0.5">{awaitingAuthorisedReview}</p>
          <div className="mt-1 flex items-center justify-between text-[10px] text-purple-700 font-semibold">
            <span>Coordinator Action</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </div>
        </div>

        {/* Card 5: Completed Assessment Records */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('applications', { status: 'COMPLETED' })}
          className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Completed</span>
            <FileCheck className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-0.5">{completedAssessments}</p>
          <div className="mt-1 flex items-center justify-between text-[10px] text-emerald-700">
            <span>Certified & Bridge</span>
            <span className="font-semibold group-hover:translate-x-0.5 transition-transform">→</span>
          </div>
        </div>

        {/* Card 6: Qualification Records Requiring Source Verification */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('data_review', { status: 'requires_review' })}
          className="bg-rose-50/60 p-3.5 rounded-2xl border border-rose-200 shadow-2xs hover:shadow-xs hover:border-rose-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-rose-700 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Audit Flags</span>
            <AlertCircle className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-rose-700 mt-0.5">{qualsRequiringVerification}</p>
          <div className="mt-1 flex items-center justify-between text-[10px] text-rose-800 font-semibold">
            <span>Source Discrepancies</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </div>
        </div>

      </div>

      {/* Operational Quick Actions Bar */}
      <div className="bg-slate-900 text-white p-4 rounded-3xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/60 border border-indigo-400/40 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4 text-indigo-300" />
          </div>
          <div>
            <span className="font-bold text-white text-xs block">Operational Management Hub</span>
            <span className="text-[11px] text-slate-400">
              {totalApplications} Applications enrolled • {assessors.length} Certified Evaluators online
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigateTab && onNavigateTab('applications')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-[11px] border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>Manage Applications</span>
          </button>
          
          <button
            onClick={() => onNavigateTab && onNavigateTab('data_review')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-[11px] border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5 text-teal-400" />
            <span>Audit Qualifications</span>
          </button>

          <button
            onClick={() => onNavigateTab && onNavigateTab('reports')}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Reports</span>
          </button>
        </div>
      </div>

      {/* Pending Action Banner (If assessments await coordinator review) */}
      {awaitingAuthorisedReview > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 border border-purple-300 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-4 h-4 text-purple-700" />
            </div>
            <div>
              <h4 className="font-bold text-purple-900 text-xs">
                {awaitingAuthorisedReview} Assessment Record Awaiting Authorised Sign-Off
              </h4>
              <p className="text-[11px] text-purple-700 mt-0.5">
                Certified Assessor completed physical viva rubric evaluation. Dual coordinator verification required before NSQF RPL certificate issuance.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => onNavigateTab && onNavigateTab('applications', { status: 'AWAITING_AUTHORISED_REVIEW' })}
            icon={ArrowRight}
            className="bg-purple-700 hover:bg-purple-800 self-end sm:self-auto"
          >
            Review & Sign Off
          </Button>
        </div>
      )}

      {/* Recent Activity Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3.5">
        
        {/* Header & Activity Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span>Recent Scheme Activity</span>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-semibold">
                {filteredActivities.length} Events
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Live chronological stream of candidate registrations, AI pre-screens, assessor marks, and governance sign-offs.
            </p>
          </div>

          {/* Activity Filters */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto text-[11px]">
            <button
              onClick={() => setActivityFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                activityFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActivityFilter('ASSESSMENT')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                activityFilter === 'ASSESSMENT' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Assessments
            </button>
            <button
              onClick={() => setActivityFilter('EVIDENCE')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                activityFilter === 'EVIDENCE' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Evidence / AI
            </button>
            <button
              onClick={() => setActivityFilter('ALLOCATION')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                activityFilter === 'ALLOCATION' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Allocation
            </button>
          </div>
        </div>

        {/* Activity Stream */}
        {filteredActivities.length > 0 ? (
          <div className="space-y-2.5">
            {filteredActivities.map((log) => {
              const isComp = log.action.includes('COMPETENT');
              const isBridge = log.action.includes('BRIDGE');
              const isAlloc = log.action.includes('ALLOCAT');
              const isSignoff = log.action.includes('AUTHORIS');

              return (
                <div
                  key={log.id}
                  className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 hover:bg-slate-100/70 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                        isComp
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : isBridge
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : isSignoff
                          ? 'bg-purple-100 text-purple-800 border-purple-300'
                          : isAlloc
                          ? 'bg-sky-100 text-sky-800 border-sky-300'
                          : 'bg-slate-200 text-slate-800 border-slate-300'
                      }`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      <strong className="text-slate-900 font-semibold">{log.candidateName}</strong>
                      <span className="text-[10px] text-slate-400 font-mono">({log.candidateId})</span>
                    </div>

                    <p className="text-slate-700 text-[11px] leading-relaxed">
                      {log.details}
                    </p>

                    <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-0.5">
                      <span>Actor: <strong className="text-slate-600">{log.actor}</strong></span>
                      <span>•</span>
                      <span className="font-mono">{log.hash}</span>
                    </div>
                  </div>

                  <div className="self-end sm:self-center flex-shrink-0 text-right">
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {new Date(log.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Useful Empty State */
          <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl space-y-2.5">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">No Activity Events Found</h4>
            <p className="text-slate-500 text-xs max-w-sm mx-auto">
              There are currently no recorded audit logs matching the "{activityFilter}" category. Activity records are automatically created as candidates submit evidence and assessors conduct evaluations.
            </p>
            <button
              onClick={() => setActivityFilter('ALL')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold underline"
            >
              Reset Activity Filter to All
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
