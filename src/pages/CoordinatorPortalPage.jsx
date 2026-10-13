import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  ShieldCheck, 
  ScrollText, 
  BookOpen, 
  CheckCircle2, 
  Database,
  BarChart3
} from 'lucide-react';
import { NsqfBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { BottomNav } from '../components/layout/BottomNav';
import { QUALIFICATIONS } from '../data/qualifications';
import { HumanInTheLoopBanner } from '../components/common/HumanInTheLoopBanner';
import { CoordinatorDashboardView } from '../components/coordinator/CoordinatorDashboardView';
import { ApplicationManagementView } from '../components/coordinator/ApplicationManagementView';
import { DataReviewAdminView } from '../components/coordinator/DataReviewAdminView';
import { CoordinatorReportsView } from '../components/coordinator/CoordinatorReportsView';

export const CoordinatorPortalPage = () => {
  const { candidates, assessors, auditLogs, allocateAssessor } = useApp();
  
  // Navigation tabs: 'dashboard' | 'applications' | 'data_review' | 'reports' | 'allocation' | 'audit' | 'registry'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [appFilter, setAppFilter] = useState({});
  const [dataReviewFilter, setDataReviewFilter] = useState('ALL');

  const [selectedCandidateToAssign, setSelectedCandidateToAssign] = useState(candidates[3]?.id || candidates[0]?.id);
  const [selectedAssessorForAssign, setSelectedAssessorForAssign] = useState(assessors[0]?.id);
  const [toastMessage, setToastMessage] = useState(null);

  const handleNavigateTab = (tab, filters = {}) => {
    setActiveTab(tab);
    if (tab === 'applications' && filters) {
      setAppFilter(filters);
    }
    if (tab === 'data_review' && filters.status) {
      setDataReviewFilter(filters.status);
    }
  };

  const handleAssign = (e) => {
    e.preventDefault();
    allocateAssessor(selectedCandidateToAssign, selectedAssessorForAssign);
    const cand = candidates.find(c => c.id === selectedCandidateToAssign);
    const assessor = assessors.find(a => a.id === selectedAssessorForAssign);
    setToastMessage(`Allocated ${cand?.name} to Assessor ${assessor?.name}!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-2xl shadow-xl border border-indigo-500 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-6 border border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950 border border-indigo-800 px-2 py-0.5 rounded-full uppercase">
                  RPL Program Operations
                </span>
                <span className="text-[11px] text-slate-400">
                  SIH 2026 PS 26242
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-white mt-0.5">
                Scheme Coordinator Center
              </h1>
              <p className="text-xs text-slate-400">
                Dr. Priya Nair • National Skill Development Authority
              </p>
            </div>
          </div>

          <div className="bg-slate-800/80 px-3 py-2 rounded-2xl border border-slate-700 text-xs flex items-center gap-2 self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Dual Governance</span>
              <span className="font-bold text-white">Assessor + Coordinator Verification</span>
            </div>
          </div>
        </div>
      </div>

      {/* Human in the loop standard banner */}
      <HumanInTheLoopBanner compact />

      {/* Navigation Tabs Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-1.5 flex gap-1 shadow-2xs text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold whitespace-nowrap transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('applications')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold whitespace-nowrap transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'applications' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Applications</span>
        </button>

        <button
          onClick={() => setActiveTab('data_review')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold whitespace-nowrap transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'data_review' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Qualification Data Review</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold whitespace-nowrap transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'reports' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Reports & Export</span>
        </button>

        <button
          onClick={() => setActiveTab('allocation')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold whitespace-nowrap transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'allocation' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Allocate</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold whitespace-nowrap transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'audit' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ScrollText className="w-4 h-4" />
          <span>Audit Trail</span>
        </button>

        <button
          onClick={() => setActiveTab('registry')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold whitespace-nowrap transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'registry' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>QP Registry</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: ADMIN DASHBOARD (PHASE 1)
      ========================================================================== */}
      {activeTab === 'dashboard' && (
        <CoordinatorDashboardView onNavigateTab={handleNavigateTab} />
      )}

      {/* =========================================================================
          TAB 2: APPLICATION MANAGEMENT (PHASE 2)
      ========================================================================== */}
      {activeTab === 'applications' && (
        <ApplicationManagementView initialFilter={appFilter} />
      )}

      {/* =========================================================================
          TAB 3: QUALIFICATION DATA REVIEW (PHASE 3)
      ========================================================================== */}
      {activeTab === 'data_review' && (
        <DataReviewAdminView initialStatusFilter={dataReviewFilter} />
      )}

      {/* =========================================================================
          TAB 4: REPORTS & CSV EXPORT (PHASE 4)
      ========================================================================== */}
      {activeTab === 'reports' && (
        <CoordinatorReportsView />
      )}

      {/* =========================================================================
          TAB 5: ALLOCATE ASSESSORS (RETAINED & ENHANCED)
      ========================================================================== */}
      {activeTab === 'allocation' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4 text-xs">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Assign Candidate to Certified Assessor</h3>
            <p className="text-slate-500 mt-0.5">
              Pair candidates with qualified industry evaluators based on trade expertise and authorized examination centers.
            </p>
          </div>

          <form onSubmit={handleAssign} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Select Candidate:</label>
                <select
                  value={selectedCandidateToAssign}
                  onChange={(e) => setSelectedCandidateToAssign(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none"
                >
                  {candidates.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.currentRoleName} - {c.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Assign Certified Assessor:</label>
                <select
                  value={selectedAssessorForAssign}
                  onChange={(e) => setSelectedAssessorForAssign(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none"
                >
                  {assessors.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.qualificationSector} - {a.centerName})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                variant="secondary"
                size="md"
                icon={UserCheck}
              >
                Confirm Assessor Assignment
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          TAB 6: AUDIT TRAIL (RETAINED & ENHANCED)
      ========================================================================== */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Tamper-Evident Assessment Audit Trail</h3>
              <p className="text-slate-500">Cryptographically referenced log guaranteeing non-autonomous human certification</p>
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
              {auditLogs.length} Records
            </span>
          </div>

          <div className="space-y-2.5">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5"
              >
                <div className="flex items-center justify-between text-[11px] gap-2">
                  <span className="font-bold text-slate-900">{log.action}</span>
                  <span className="text-slate-400 font-mono text-[10px]">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(log.timestamp).toLocaleDateString('en-GB')}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed">{log.details}</p>
                <div className="pt-1.5 border-t border-slate-200/80 flex flex-wrap items-center justify-between text-[10px] text-slate-500 gap-1">
                  <span>Actor: <strong>{log.actor}</strong></span>
                  <span className="font-mono text-slate-400">{log.hash}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 7: QP REGISTRY (RETAINED)
      ========================================================================== */}
      {activeTab === 'registry' && (
        <div className="space-y-3 text-xs">
          {QUALIFICATIONS.map((qp) => (
            <div key={qp.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                    {qp.code}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm mt-1">{qp.title}</h4>
                </div>
                <NsqfBadge level={qp.nsqfLevel} />
              </div>
              <p className="text-slate-600 leading-relaxed">{qp.description}</p>
              
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  National Occupational Standards (NOS):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {qp.nosList.map((nos) => (
                    <div key={nos.code} className="bg-slate-50 p-2 rounded-lg border border-slate-200/70">
                      <span className="font-bold text-slate-800 text-[11px] block">{nos.code}: {nos.title}</span>
                      <span className="text-[10px] text-slate-500">Weightage: {nos.weightage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId)}
      />
    </div>
  );
};
