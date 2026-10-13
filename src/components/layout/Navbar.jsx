import React from 'react';
import { Award, ShieldCheck, User, Users, ChevronDown, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { SyncStatusBar } from '../common/SyncStatusBar';

export const Navbar = () => {
  const { activeRole, setActiveRole, activeCandidate, activeAssessor } = useApp();
  const { t } = useLanguage();

  const getRoleHeaderInfo = () => {
    switch (activeRole) {
      case 'worker':
        return {
          title: activeCandidate?.name || 'Worker',
          subtitle: `${activeCandidate?.currentRoleName || 'Candidate'} • L${activeCandidate?.nsqfLevel || 4}`,
          icon: User,
          badgeColor: 'bg-teal-100 text-teal-800'
        };
      case 'assessor':
        return {
          title: activeAssessor?.name || 'Assessor',
          subtitle: `${activeAssessor?.badgeNumber || 'NSDC-CERT'} • Evaluator`,
          icon: ShieldCheck,
          badgeColor: 'bg-sky-100 text-sky-800'
        };
      case 'coordinator':
        return {
          title: 'Dr. Priya Nair',
          subtitle: 'RPL Scheme Director',
          icon: Users,
          badgeColor: 'bg-indigo-100 text-indigo-800'
        };
      default:
        return null;
    }
  };

  const roleInfo = getRoleHeaderInfo();

  return (
    <header className="bg-white border-b border-slate-200 px-3.5 sm:px-6 py-2.5 sm:py-3 sticky top-[41px] z-30 shadow-2xs">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <div 
          onClick={() => setActiveRole('welcome')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight leading-none">
                Kaushal<span className="text-teal-600">Setu</span>
              </h1>
              <span className="text-[10px] bg-teal-50 text-teal-700 font-bold px-1.5 py-0.5 rounded border border-teal-200/60 uppercase">
                RPL
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5 hidden xs:block">
              SIH 2026 • AI-Assisted Assessment
            </p>
          </div>
        </div>

        {/* Sync & Connectivity Status Indicator */}
        <SyncStatusBar />

        {/* Current Role Persona indicator */}
        {roleInfo ? (
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-900 flex items-center justify-end gap-1">
                <span>{roleInfo.title}</span>
                <CheckCircle className="w-3.5 h-3.5 text-teal-600 inline" />
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {roleInfo.subtitle}
              </div>
            </div>
            <button
              onClick={() => setActiveRole('welcome')}
              className={`p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5 hover:bg-slate-50 transition-colors ${roleInfo.badgeColor}`}
              title="Change active persona"
            >
              <roleInfo.icon className="w-4 h-4" />
              <span className="text-xs font-bold hidden sm:inline">Switch</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setActiveRole('worker')}
            className="text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold px-3 py-1.5 rounded-xl transition-all shadow-xs"
          >
            Launch Prototype
          </button>
        )}
      </div>
    </header>
  );
};
