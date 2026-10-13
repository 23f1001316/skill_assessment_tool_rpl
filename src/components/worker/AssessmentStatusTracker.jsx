import React from 'react';
import { CheckCircle2, Clock, Calendar, UserCheck, AlertTriangle, Award, MapPin, ShieldAlert, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge, NsqfBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { HumanInTheLoopBanner } from '../common/HumanInTheLoopBanner';

export const AssessmentStatusTracker = ({ onOpenCertificate, onOpenAiReview }) => {
  const { activeCandidate, assessors } = useApp();

  const assignedAssessor = assessors.find(a => a.id === activeCandidate?.assignedAssessorId);
  const status = activeCandidate?.status || 'SUBMITTED';
  const assessmentRecord = activeCandidate?.assessmentRecord;

  // Timeline steps
  const steps = [
    {
      id: 'step1',
      title: 'Application & Profile Submitted',
      desc: 'Worker details, trade selection and work activity declared.',
      isDone: true,
      date: 'Completed'
    },
    {
      id: 'step2',
      title: 'Work Evidence Uploaded & AI Pre-screened',
      desc: `${activeCandidate?.evidenceList?.length || 0} artifacts analyzed against National Occupational Standards.`,
      isDone: status !== 'DRAFT',
      date: status !== 'DRAFT' ? 'Processed' : 'Pending'
    },
    {
      id: 'step3',
      title: 'Certified Assessor Allocated',
      desc: assignedAssessor 
        ? `${assignedAssessor.name} (${assignedAssessor.badgeNumber}) at ${activeCandidate?.targetCenter || 'Govt ITI'}.`
        : 'Assessor assignment in progress by RPL coordinator.',
      isDone: Boolean(assignedAssessor),
      date: assignedAssessor ? 'Assigned' : 'Awaiting Allocation'
    },
    {
      id: 'step4',
      title: 'Practical Examination & NOS Rubric Assessment',
      desc: assessmentRecord 
        ? `Practical exam conducted. Score: ${assessmentRecord.finalWeightedScore}%.`
        : 'In-person practical evaluation at assessment center.',
      isDone: Boolean(assessmentRecord),
      date: assessmentRecord ? 'Evaluated' : 'Scheduled'
    },
    {
      id: 'step5',
      title: 'Official Certification Sign-Off',
      desc: status === 'COMPETENT'
        ? 'Assessor signed declaration: Candidate is certified under NSQF Level 4.'
        : status === 'BRIDGE_REQUIRED'
        ? 'Assessor recommended 16 hours of targeted bridge training.'
        : 'Awaiting assessor evaluation verdict.',
      isDone: status === 'COMPETENT' || status === 'BRIDGE_REQUIRED',
      date: status === 'COMPETENT' ? 'Awarded' : status === 'BRIDGE_REQUIRED' ? 'Action Required' : 'Pending'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Current Status Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Application Ref: {activeCandidate?.id || 'CAND-2026-001'}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              {activeCandidate?.name}
            </h2>
            <p className="text-xs text-slate-500">
              {activeCandidate?.currentRoleName} • {activeCandidate?.yearsExperience} years experience
            </p>
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Center & Assessor details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
            <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-400 block font-semibold">Assessment Center</span>
              <span className="font-semibold text-slate-800 truncate block">
                {activeCandidate?.targetCenter || 'Govt ITI Alambagh, Lucknow'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
            <UserCheck className="w-4 h-4 text-sky-600 flex-shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-400 block font-semibold">Assigned Evaluator</span>
              <span className="font-semibold text-slate-800 truncate block">
                {assignedAssessor?.name || 'Assessor Allocation Pending'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Human-In-The-Loop Standard Note */}
      <HumanInTheLoopBanner compact />

      {/* Decision Summary if Evaluated */}
      {status === 'COMPETENT' && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Certified Competent!</span>
            </div>
            <NsqfBadge level={activeCandidate?.nsqfLevel || 4} />
          </div>
          <p className="text-emerald-950 font-normal leading-relaxed">
            {assessmentRecord?.assessorRemarks || "Assessor confirmed practical competence on all core NOS dimensions."}
          </p>
          <div className="pt-2 border-t border-emerald-200 flex justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenCertificate}
              icon={Award}
            >
              View & Download RPL Skill Card
            </Button>
          </div>
        </div>
      )}

      {status === 'BRIDGE_REQUIRED' && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 text-xs space-y-2.5">
          <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <span>Targeted Bridge Training Recommended</span>
          </div>
          <p className="text-rose-950 leading-relaxed font-normal">
            {assessmentRecord?.assessorRemarks || "The assessor identified a specific gap before certification can be granted."}
          </p>
          <div className="p-2.5 bg-white/80 rounded-xl border border-rose-200 text-rose-900 font-medium">
            <strong>Next Step:</strong> Complete 12-16 hours of free practical bridge training module at your local ITI center, then request a free re-assessment.
          </div>
        </div>
      )}

      {/* Stepper Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4">
          Assessment Progress Milestones
        </h3>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {steps.map((st, idx) => {
            return (
              <div key={st.id} className="relative group">
                {/* Step Circle Indicator */}
                <div className={`absolute -left-[27px] top-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs transition-colors ${
                  st.isDone
                    ? 'bg-teal-600 border-teal-600 text-white font-bold'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}>
                  {st.isDone ? '✓' : idx + 1}
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-xs sm:text-sm font-bold ${st.isDone ? 'text-slate-900' : 'text-slate-500'}`}>
                      {st.title}
                    </h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      st.isDone ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {st.date}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Secondary CTAs */}
      <div className="flex flex-col sm:flex-row gap-2 pt-1">
        <Button
          variant="outline"
          size="md"
          fullWidth
          onClick={onOpenAiReview}
          icon={Sparkles}
        >
          View AI Skill Pre-Assessment Report
        </Button>
      </div>

    </div>
  );
};
