import React from 'react';
import { Sparkles, Camera, Volume2, ShieldAlert, CheckCircle2, AlertTriangle, ExternalLink, Wrench } from 'lucide-react';
import { HumanInTheLoopBanner } from '../common/HumanInTheLoopBanner';

export const AiEvidenceInspector = ({ candidate }) => {
  const evidenceList = candidate?.evidenceList || [];
  const aiSummary = candidate?.aiSummary;

  return (
    <div className="space-y-4">
      {/* Human in the loop standard reminder */}
      <HumanInTheLoopBanner compact />

      {/* AI Pre-Screening Summary Box */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block mb-1">
              AI Multi-Modal Pre-Assessment
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Candidate Evidentiary Readiness: {aiSummary?.readinessScore || 85}%
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-md">
              Target QP: <strong>{candidate?.currentRoleName}</strong> (NSQF Level {candidate?.nsqfLevel || 4})
            </p>
          </div>
          <span className="text-[11px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2.5 py-1 rounded-full">
            {evidenceList.length} Artifacts Inspected
          </span>
        </div>

        <div className="mt-3.5 pt-3 border-t border-slate-800 text-xs text-slate-300 space-y-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Suggested Assessor Viva Prompts:
          </span>
          <p className="text-xs text-slate-200 leading-relaxed italic bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
            "{aiSummary?.humanAssessorRecommendation || "Verify tool handling and safe isolation protocols during hands-on evaluation."}"
          </p>
        </div>
      </div>

      {/* List of Evidence Artifacts with AI feature breakdown */}
      <div className="space-y-3">
        <h4 className="font-bold text-slate-900 text-xs sm:text-sm px-1">
          Scrutinize Submitted Artifacts ({evidenceList.length})
        </h4>

        {evidenceList.map((ev, idx) => (
          <div
            key={ev.id || idx}
            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs text-xs space-y-3"
          >
            <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {ev.type === 'audio' ? (
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                    <Volume2 className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
                    <Camera className="w-4 h-4" />
                  </div>
                )}
                <div>
                  <h5 className="font-bold text-slate-900 text-xs sm:text-sm">{ev.title}</h5>
                  <span className="text-[10px] text-slate-400">{ev.date} • {ev.type}</span>
                </div>
              </div>

              <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                AI Confidence: {ev.aiAnalysis?.confidence || 90}%
              </span>
            </div>

            {/* Photo Preview if image */}
            {ev.url && (
              <div className="relative rounded-xl overflow-hidden max-h-48 border border-slate-200">
                <img src={ev.url} alt={ev.title} className="w-full h-48 object-cover" />
                <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                  Artifact #{idx + 1}
                </div>
              </div>
            )}

            {/* Audio Transcript if voice */}
            {ev.transcript && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Original Voice Transcript:</span>
                  <p className="text-slate-800 italic mt-0.5">"{ev.transcript}"</p>
                </div>
                {ev.translatedTranscript && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[10px] font-bold text-teal-700 uppercase">English Translation:</span>
                    <p className="text-teal-950 mt-0.5">"{ev.translatedTranscript}"</p>
                  </div>
                )}
              </div>
            )}

            {/* AI Detected Tool Tags */}
            <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-[11px]">
                <Wrench className="w-3.5 h-3.5 text-teal-600" />
                <span>Detected Tools & Component Signals:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {(ev.aiAnalysis?.detectedTools || ev.aiAnalysis?.extractedKeywords || ['General Tools']).map((tool, i) => (
                  <span key={i} className="text-[10px] bg-white border border-slate-200 text-slate-800 font-medium px-2 py-0.5 rounded-md">
                    ✓ {tool}
                  </span>
                ))}
              </div>
            </div>

            {/* Safety Warning Flags */}
            {ev.aiAnalysis?.safetyWarning && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2 text-[11px]">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span><strong>Safety Flag:</strong> {ev.aiAnalysis.safetyWarning}</span>
              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
};
