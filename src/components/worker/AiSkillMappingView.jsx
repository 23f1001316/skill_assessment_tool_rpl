import React, { useState } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, ArrowRight, UserCheck, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProgressBar } from '../common/ProgressBar';
import { Button } from '../common/Button';
import { HumanInTheLoopBanner } from '../common/HumanInTheLoopBanner';

export const AiSkillMappingView = ({ onNavigateToStatus }) => {
  const { activeCandidate, runAiPreAssessment } = useApp();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const aiSummary = activeCandidate?.aiSummary || {
    readinessScore: 78,
    predictedNsqfLevel: activeCandidate?.nsqfLevel || 4,
    qualificationMatch: activeCandidate?.currentRoleName || 'Domestic Electrician',
    nosReadiness: [],
    humanAssessorRecommendation: 'Evidence collected. Awaiting assessor review.'
  };

  const handleRefreshAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      runAiPreAssessment(activeCandidate.id);
      setIsAnalyzing(false);
    }, 1000);
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-400/20 text-teal-200 border border-teal-400/30 px-2 py-0.5 rounded-full inline-flex items-center gap-1 mb-1.5">
              <Sparkles className="w-3 h-3 text-amber-300" />
              Automated Pre-Screening
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">
              AI Skill Readiness: {aiSummary.readinessScore}%
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-md">
              Evidence aligned against <strong>{aiSummary.qualificationMatch}</strong> (NSQF Level {aiSummary.predictedNsqfLevel}).
            </p>
          </div>

          <button
            onClick={handleRefreshAnalysis}
            disabled={isAnalyzing}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1 text-xs font-semibold"
            title="Re-run AI Analysis"
          >
            <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Big Progress Bar */}
        <div className="mt-4 pt-3 border-t border-teal-700/60">
          <ProgressBar
            value={aiSummary.readinessScore}
            max={100}
            color="emerald"
            size="md"
          />
          <div className="flex justify-between items-center text-[11px] text-teal-200 mt-1.5 font-medium">
            <span>Threshold for Assessor Exam: 70%</span>
            <span className="font-bold text-white">
              {aiSummary.readinessScore >= 70 ? '✓ Ready for Assessor' : 'Needs More Evidence'}
            </span>
          </div>
        </div>
      </div>

      {/* Human In The Loop standard reminder */}
      <HumanInTheLoopBanner compact />

      {/* NOS-by-NOS Competency Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center justify-between">
          <span>National Occupational Standards (NOS) Mapping</span>
          <span className="text-xs text-slate-400 font-normal">NSQF Aligned</span>
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          AI matches evidence against official QP criteria:
        </p>

        <div className="space-y-3">
          {aiSummary.nosReadiness?.map((item, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs">
              <div className="flex justify-between items-start mb-1.5 gap-2">
                <div>
                  <span className="font-bold text-teal-800 bg-teal-100/70 px-1.5 py-0.5 rounded text-[10px] mr-1.5">
                    {item.nosCode}
                  </span>
                  <span className="font-semibold text-slate-800">{item.nosTitle}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  item.readiness >= 80
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {item.readiness}% Match
                </span>
              </div>
              <ProgressBar
                value={item.readiness}
                max={100}
                color={item.readiness >= 80 ? 'teal' : 'amber'}
                size="sm"
              />
              <p className="text-[11px] text-slate-500 mt-1.5">
                Status: <strong className="text-slate-700">{item.status}</strong>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Assessor Recommendation Preview */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-xs">
        <div className="flex items-center gap-2 mb-1.5 text-amber-900 font-bold">
          <UserCheck className="w-4 h-4 text-amber-700" />
          <span>AI Advisory for Authorised Assessor:</span>
        </div>
        <p className="text-amber-950 leading-relaxed font-normal">
          {aiSummary.humanAssessorRecommendation}
        </p>
        <div className="mt-2.5 pt-2 border-t border-amber-200/80 flex items-center justify-between text-[11px] text-amber-800">
          <span>Note: Advisory is purely indicative. Assessor evaluates autonomously.</span>
        </div>
      </div>

      {/* CTA to Schedule or View Status */}
      <div className="pt-1">
        <Button
          variant="primary"
          fullWidth
          onClick={onNavigateToStatus}
          icon={ArrowRight}
        >
          View Assessment Timeline & Status
        </Button>
      </div>

    </div>
  );
};
