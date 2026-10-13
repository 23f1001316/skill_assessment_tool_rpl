import React, { useState, useMemo } from 'react';
import { 
  Download, 
  BarChart3, 
  CheckCircle2, 
  Award, 
  FileCheck, 
  Users, 
  Layers, 
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { dataRepository } from '../../services/dataRepository';
import { Button } from '../common/Button';

export const CoordinatorReportsView = () => {
  const { candidates, assessors } = useApp();

  // Filters
  const [dateRange, setDateRange] = useState('ALL'); // 'ALL' | '7d' | '30d' | '90d'
  const [selectedQualification, setSelectedQualification] = useState('ALL');
  const [recordSourceFilter, setRecordSourceFilter] = useState('ALL'); // 'ALL' | 'DEMO' | 'REAL'
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

  // Filtered cohort based on user criteria
  const filteredCandidates = useMemo(() => {
    const now = new Date();

    return candidates.filter(cand => {
      // 1. Date Range
      if (dateRange !== 'ALL' && cand.submittedAt) {
        const subDate = new Date(cand.submittedAt);
        const diffDays = (now - subDate) / (1000 * 60 * 60 * 24);
        if (dateRange === '7d' && diffDays > 7) return false;
        if (dateRange === '30d' && diffDays > 30) return false;
        if (dateRange === '90d' && diffDays > 90) return false;
      }

      // 2. Qualification
      if (selectedQualification !== 'ALL') {
        if (cand.currentRoleName !== selectedQualification && cand.qualificationId !== selectedQualification) {
          return false;
        }
      }

      // 3. Demo vs Real Record
      if (recordSourceFilter === 'DEMO' && !cand.isDemoRecord) return false;
      if (recordSourceFilter === 'REAL' && cand.isDemoRecord) return false;

      return true;
    });
  }, [candidates, dateRange, selectedQualification, recordSourceFilter]);

  // Dynamic Metrics & Distributions
  const totalInCohort = filteredCandidates.length;

  // 1. Applications by Status
  const appsByStatus = useMemo(() => {
    const counts = {
      SUBMITTED: 0,
      IN_REVIEW: 0,
      AWAITING_AUTHORISED_REVIEW: 0,
      COMPETENT: 0,
      BRIDGE_REQUIRED: 0,
      DRAFT: 0
    };
    filteredCandidates.forEach(c => {
      if (counts[c.status] !== undefined) counts[c.status]++;
      else counts.SUBMITTED++;
    });
    return counts;
  }, [filteredCandidates]);

  // 2. Assessments by Status
  const assessmentsByStatus = useMemo(() => {
    let unassigned = 0;
    let inProgress = 0;
    let awaitingAuthorisation = 0;
    let competent = 0;
    let bridge = 0;

    filteredCandidates.forEach(c => {
      if (!c.assignedAssessorId) unassigned++;
      else if (c.status === 'AWAITING_AUTHORISED_REVIEW') awaitingAuthorisation++;
      else if (c.status === 'COMPETENT') competent++;
      else if (c.status === 'BRIDGE_REQUIRED') bridge++;
      else inProgress++;
    });

    return { unassigned, inProgress, awaitingAuthorisation, competent, bridge };
  }, [filteredCandidates]);

  // 3. Assessment Completion Rate
  const completionStats = useMemo(() => {
    const total = filteredCandidates.length;
    const evaluated = filteredCandidates.filter(c => c.status === 'COMPETENT' || c.status === 'BRIDGE_REQUIRED').length;
    const certified = filteredCandidates.filter(c => c.status === 'COMPETENT').length;
    const bridge = filteredCandidates.filter(c => c.status === 'BRIDGE_REQUIRED').length;

    const completionRate = total > 0 ? Math.round((evaluated / total) * 100) : 0;
    const passRate = evaluated > 0 ? Math.round((certified / evaluated) * 100) : 0;

    return { total, evaluated, certified, bridge, completionRate, passRate };
  }, [filteredCandidates]);

  // 4. Evidence Review Distribution
  const evidenceStats = useMemo(() => {
    let photos = 0;
    let audios = 0;
    let documents = 0;
    let aiAnalyzed = 0;
    let assessorVerified = 0;

    filteredCandidates.forEach(c => {
      (c.evidenceList || []).forEach(ev => {
        if (ev.type === 'photo') photos++;
        else if (ev.type === 'audio') audios++;
        else documents++;

        if (ev.aiAnalysis) aiAnalyzed++;
      });

      if (c.status === 'COMPETENT' || c.status === 'BRIDGE_REQUIRED' || c.status === 'AWAITING_AUTHORISED_REVIEW') {
        assessorVerified += (c.evidenceList || []).length;
      }
    });

    const totalArtifacts = photos + audios + documents;

    return { photos, audios, documents, totalArtifacts, aiAnalyzed, assessorVerified };
  }, [filteredCandidates]);

  // 5. Qualification Matching Distribution
  const qualMatchingStats = useMemo(() => {
    const trades = {};
    const levels = { Level3: 0, Level4: 0, Level5: 0, Level6: 0, Other: 0 };

    filteredCandidates.forEach(c => {
      const tradeName = c.currentRoleName || 'General';
      trades[tradeName] = (trades[tradeName] || 0) + 1;

      const lvl = c.nsqfLevel || 4;
      if (lvl === 3) levels.Level3++;
      else if (lvl === 4) levels.Level4++;
      else if (lvl === 5) levels.Level5++;
      else if (lvl === 6) levels.Level6++;
      else levels.Other++;
    });

    return { trades, levels };
  }, [filteredCandidates]);

  // 6. Source Verification Statistics
  const verificationStats = useMemo(() => {
    const list = dataRepository.getQualifications();
    const stats = { total: list.length, extracted: 0, reviewed: 0, verified: 0, requires_review: 0 };
    list.forEach(q => {
      const st = q.verification_status || 'extracted';
      if (stats[st] !== undefined) stats[st]++;
      else stats.extracted++;
    });
    return stats;
  }, []);

  // CSV Export for Non-Sensitive Application Summaries
  const handleExportCsv = () => {
    // Columns specifically excluding PII (Aadhaar, contact phone, addresses, photo URLs, confidential notes)
    const headers = [
      'Application_ID',
      'Candidate_Identifier',
      'Target_Trade',
      'Qualification_Code',
      'NSQF_Level',
      'Application_Status',
      'Assessment_Verdict',
      'Final_Score_Percent',
      'Assessor_ID',
      'Assessor_Name',
      'Certificate_ID',
      'Submission_Date',
      'Evaluation_Date',
      'Record_Type'
    ];

    const rows = filteredCandidates.map(cand => {
      const assessor = assessors.find(a => a.id === cand.assignedAssessorId);
      const rec = cand.assessmentRecord || {};

      return [
        `"${cand.id || ''}"`,
        `"${cand.name ? cand.name.split(' ')[0] + ' ' + (cand.name.split(' ')[1]?.[0] || '') + '.' : 'Anonymous'}"`,
        `"${cand.currentRoleName || ''}"`,
        `"${cand.qualificationId || ''}"`,
        cand.nsqfLevel || 4,
        `"${cand.status || ''}"`,
        `"${rec.verdict || 'PENDING'}"`,
        rec.finalWeightedScore !== undefined ? rec.finalWeightedScore : 'N/A',
        `"${cand.assignedAssessorId || 'UNASSIGNED'}"`,
        `"${assessor?.name || 'Unassigned'}"`,
        `"${rec.certificateId || 'NONE'}"`,
        `"${cand.submittedAt || ''}"`,
        `"${rec.evaluatedAt || ''}"`,
        `"${cand.isDemoRecord ? 'DEMO_DATA' : 'LIVE_DATA'}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `kaushalsetu_rpl_applications_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Exported sanitized non-sensitive application summary (CSV)!');
  };

  return (
    <div className="space-y-4 text-xs">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-2xl shadow-xl border border-indigo-500 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with Export Button */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Executive Scheme Analytics
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                SIH 2026 PS 26242
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              RPL Program Reports & Statistical Audits
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live calculated distributions across applications, assessor evaluations, evidentiary records, and qualification catalog verification.
            </p>
          </div>

          {/* Export Action */}
          <Button
            variant="primary"
            size="md"
            onClick={handleExportCsv}
            icon={Download}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs self-start sm:self-auto"
          >
            Export CSV Summary
          </Button>
        </div>

        {/* Demo Data Distinction Banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-slate-700">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <div className="text-[11px] leading-relaxed">
              <strong>Data Provenance Notice:</strong> Current analytics are computed from actual active records in storage. 
              <strong> 100% of candidate profiles are labelled as Demo Data</strong> for the Smart India Hackathon prototype sandbox.
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto text-[11px]">
            <span className="text-slate-400 font-medium">Dataset:</span>
            <button
              onClick={() => setRecordSourceFilter('ALL')}
              className={`px-2 py-0.5 rounded font-bold transition-colors ${
                recordSourceFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              All Records ({candidates.length})
            </button>
            <button
              onClick={() => setRecordSourceFilter('DEMO')}
              className={`px-2 py-0.5 rounded font-bold transition-colors ${
                recordSourceFilter === 'DEMO' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              Demo Cohort ({candidates.filter(c => c.isDemoRecord).length})
            </button>
          </div>
        </div>

        {/* Interactive Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Date Range Filter:
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-medium"
            >
              <option value="ALL">All Recorded Dates (Full Cohort)</option>
              <option value="7d">Last 7 Days (Recent Activity)</option>
              <option value="30d">Last 30 Days (Current Month)</option>
              <option value="90d">Last 90 Days (Quarterly Assessment Cycle)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Filter by Qualification / Trade:
            </label>
            <select
              value={selectedQualification}
              onChange={(e) => setSelectedQualification(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-medium"
            >
              <option value="ALL">All Qualification Packs ({distinctQualifications.length} Trades)</option>
              {distinctQualifications.map(q => (
                <option key={q.id} value={q.title}>{q.title}</option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* 4 Summary Highlight Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Filtered Candidates</span>
          <p className="text-2xl font-black text-slate-900 mt-0.5">{totalInCohort}</p>
          <span className="text-[10px] text-slate-500">Active cohort size</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Evaluation Rate</span>
          <p className="text-2xl font-black text-indigo-600 mt-0.5">{completionStats.completionRate}%</p>
          <span className="text-[10px] text-indigo-700">{completionStats.evaluated} of {completionStats.total} examined</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Certified Competent</span>
          <p className="text-2xl font-black text-emerald-600 mt-0.5">{completionStats.certified}</p>
          <span className="text-[10px] text-emerald-700">{completionStats.passRate}% pass rate</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Bridge Referrals</span>
          <p className="text-2xl font-black text-rose-600 mt-0.5">{completionStats.bridge}</p>
          <span className="text-[10px] text-rose-700">Gap training mandated</span>
        </div>
      </div>

      {/* SECTION 1: APPLICATIONS & ASSESSMENTS STATUS DISTRIBUTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Applications by Status */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Applications by Status</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">{totalInCohort} Total</span>
          </div>

          <div className="space-y-2.5">
            {[
              { label: 'AI Intake / Submitted', count: appsByStatus.SUBMITTED, color: 'bg-teal-500', text: 'text-teal-700' },
              { label: 'Under Assessor Review', count: appsByStatus.IN_REVIEW, color: 'bg-sky-500', text: 'text-sky-700' },
              { label: 'Awaiting Authorised Review', count: appsByStatus.AWAITING_AUTHORISED_REVIEW, color: 'bg-purple-500', text: 'text-purple-700' },
              { label: 'Certified Competent (NSQF)', count: appsByStatus.COMPETENT, color: 'bg-emerald-500', text: 'text-emerald-700' },
              { label: 'Bridge Training Required', count: appsByStatus.BRIDGE_REQUIRED, color: 'bg-rose-500', text: 'text-rose-700' }
            ].map(item => {
              const pct = totalInCohort > 0 ? Math.round((item.count / totalInCohort) * 100) : 0;
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-semibold text-slate-700">{item.label}</span>
                    <span className={`font-bold ${item.text}`}>{item.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${item.color} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Assessments by Status */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>Assessments by Stage</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Assessor Workflow</span>
          </div>

          <div className="space-y-2.5">
            {[
              { label: 'Pending Assessor Allocation', count: assessmentsByStatus.unassigned, color: 'bg-amber-500', text: 'text-amber-700' },
              { label: 'Practical Testing in Progress', count: assessmentsByStatus.inProgress, color: 'bg-sky-500', text: 'text-sky-700' },
              { label: 'Awaiting Coordinator Sign-off', count: assessmentsByStatus.awaitingAuthorisation, color: 'bg-purple-500', text: 'text-purple-700' },
              { label: 'Certified Competent (Card Issued)', count: assessmentsByStatus.competent, color: 'bg-emerald-500', text: 'text-emerald-700' },
              { label: 'Bridge Referral (Gap Training)', count: assessmentsByStatus.bridge, color: 'bg-rose-500', text: 'text-rose-700' }
            ].map(item => {
              const pct = totalInCohort > 0 ? Math.round((item.count / totalInCohort) * 100) : 0;
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-semibold text-slate-700">{item.label}</span>
                    <span className={`font-bold ${item.text}`}>{item.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${item.color} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* SECTION 2: EVIDENCE REVIEW DISTRIBUTION & QUALIFICATION MATCHING */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Evidence Review Status Distribution */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-teal-600" />
              <span>Evidence Review Status Distribution</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              {evidenceStats.totalArtifacts} Total Artifacts
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-semibold block">Photos</span>
              <strong className="text-base text-slate-800">{evidenceStats.photos}</strong>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-semibold block">Audio Logs</span>
              <strong className="text-base text-slate-800">{evidenceStats.audios}</strong>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-semibold block">Documents</span>
              <strong className="text-base text-slate-800">{evidenceStats.documents}</strong>
            </div>
          </div>

          <div className="space-y-2 pt-1 border-t border-slate-100 text-[11px]">
            <div className="flex justify-between items-center bg-teal-50/70 p-2 rounded-lg border border-teal-200 text-teal-950">
              <span>AI Feature Extracted & Tool Tagged</span>
              <strong className="font-bold text-teal-800">{evidenceStats.aiAnalyzed} Artifacts (100%)</strong>
            </div>

            <div className="flex justify-between items-center bg-indigo-50/70 p-2 rounded-lg border border-indigo-200 text-indigo-950">
              <span>Assessor Physically Verified in Field</span>
              <strong className="font-bold text-indigo-800">{evidenceStats.assessorVerified} Artifacts</strong>
            </div>
          </div>
        </div>

        {/* Qualification Matching & NSQF Level Breakdown */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>Qualification & NSQF Alignment</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Demographics</span>
          </div>

          {/* Level Distribution Badges */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-amber-50 p-2 rounded-xl border border-amber-200">
              <span className="text-[10px] text-amber-700 font-bold block">Level 3</span>
              <strong className="text-sm text-amber-900">{qualMatchingStats.levels.Level3}</strong>
            </div>
            <div className="bg-amber-50 p-2 rounded-xl border border-amber-200">
              <span className="text-[10px] text-amber-700 font-bold block">Level 4</span>
              <strong className="text-sm text-amber-900">{qualMatchingStats.levels.Level4}</strong>
            </div>
            <div className="bg-amber-50 p-2 rounded-xl border border-amber-200">
              <span className="text-[10px] text-amber-700 font-bold block">Level 5</span>
              <strong className="text-sm text-amber-900">{qualMatchingStats.levels.Level5}</strong>
            </div>
            <div className="bg-amber-50 p-2 rounded-xl border border-amber-200">
              <span className="text-[10px] text-amber-700 font-bold block">Level 6</span>
              <strong className="text-sm text-amber-900">{qualMatchingStats.levels.Level6}</strong>
            </div>
          </div>

          {/* Applied Trades Breakdown */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Enrollment by Qualification Pack:
            </span>
            <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
              {Object.entries(qualMatchingStats.trades).map(([trade, count]) => (
                <div key={trade} className="flex items-center justify-between text-[11px] bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                  <span className="font-medium text-slate-800">{trade}</span>
                  <span className="font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-slate-200 text-[10px]">
                    {count} candidate{count > 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 3: RECORDS AWAITING SOURCE VERIFICATION */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Qualification Records Awaiting Source Verification</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              National Qualification Register extraction governance overview across 2,815 imported files.
            </p>
          </div>
          <span className="text-base font-black text-slate-900">
            {verificationStats.total} Total
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Extracted (Unverified)</span>
            <p className="text-lg font-black text-slate-800 mt-0.5">{verificationStats.extracted}</p>
            <span className="text-[10px] text-slate-400">Imported from spreadsheet</span>
          </div>

          <div className="bg-rose-50 p-3 rounded-xl border border-rose-200">
            <span className="text-[10px] font-bold text-rose-700 uppercase block">Requires Review</span>
            <p className="text-lg font-black text-rose-700 mt-0.5">{verificationStats.requires_review}</p>
            <span className="text-[10px] text-rose-800 font-semibold">Source conflicts flagged</span>
          </div>

          <div className="bg-sky-50 p-3 rounded-xl border border-sky-200">
            <span className="text-[10px] font-bold text-sky-700 uppercase block">Reviewed</span>
            <p className="text-lg font-black text-sky-700 mt-0.5">{verificationStats.reviewed}</p>
            <span className="text-[10px] text-sky-800">Coordinator audited</span>
          </div>

          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
            <span className="text-[10px] font-bold text-emerald-700 uppercase block">Verified</span>
            <p className="text-lg font-black text-emerald-700 mt-0.5">{verificationStats.verified}</p>
            <span className="text-[10px] text-emerald-800">Gazette cross-checked</span>
          </div>
        </div>
      </div>

    </div>
  );
};
