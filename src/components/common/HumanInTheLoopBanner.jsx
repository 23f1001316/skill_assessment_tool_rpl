import React from 'react';
import { ShieldAlert, UserCheck, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const HumanInTheLoopBanner = ({ compact = false }) => {
  const { t } = useLanguage();

  if (compact) {
    return (
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-2.5 flex items-center gap-2 text-xs text-teal-900 shadow-xs">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[10px]">
          HITL
        </span>
        <p className="flex-1 leading-tight font-medium">
          <strong className="text-teal-950 font-bold">Human-in-the-Loop Standard:</strong> AI recommends; only certified assessors award RPL certifications.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl p-4 shadow-sm border border-teal-700/50 relative overflow-hidden">
      <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-28 h-28 bg-teal-500/10 rounded-full blur-xl pointer-events-none" />
      <div className="flex items-start gap-3">
        <div className="p-2.5 bg-teal-500/20 text-teal-300 rounded-xl flex-shrink-0 mt-0.5 border border-teal-400/30">
          <UserCheck className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="bg-teal-400/20 text-teal-200 border border-teal-400/30 text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
              SIH 2026 PS 26242 Compliance
            </span>
            <span className="text-teal-300/80 text-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" /> AI-Assisted • Assessor Certified
            </span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-normal">
            {t('humanInTheLoopDisclaimer')}
          </p>
        </div>
      </div>
    </div>
  );
};
