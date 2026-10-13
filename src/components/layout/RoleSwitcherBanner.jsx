import React from 'react';
import { User, ShieldCheck, LayoutDashboard, RotateCcw, Smartphone, Monitor } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LanguageSelector } from '../common/LanguageSelector';

export const RoleSwitcherBanner = () => {
  const { activeRole, setActiveRole, resetDemoData, viewMode, setViewMode } = useApp();

  return (
    <div className="bg-slate-900 text-slate-200 border-b border-slate-800 text-xs py-2 px-3 sm:px-4 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Role Selector Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 border border-amber-800/80 px-2 py-0.5 rounded-md uppercase tracking-wider mr-1 hidden sm:inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Demo Role Switcher (Simulated)
          </span>
          <button
            onClick={() => setActiveRole('welcome')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              activeRole === 'welcome'
                ? 'bg-slate-700 text-white font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Welcome
          </button>
          <button
            onClick={() => setActiveRole('worker')}
            title="Candidate / Worker Experience (Demo Persona)"
            className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors ${
              activeRole === 'worker'
                ? 'bg-teal-600 text-white font-bold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Worker (Demo)</span>
          </button>
          <button
            onClick={() => setActiveRole('assessor')}
            title="Certified Assessor Workbench (Demo Persona)"
            className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors ${
              activeRole === 'assessor'
                ? 'bg-sky-600 text-white font-bold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Assessor (Demo)</span>
          </button>
          <button
            onClick={() => setActiveRole('coordinator')}
            title="Scheme Coordinator / Admin Section (Demo Persona)"
            className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors ${
              activeRole === 'coordinator'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Coordinator (Demo)</span>
          </button>
        </div>

        {/* Right Tools: View Mode Toggle & Reset Data */}
        <div className="flex items-center gap-2">
          {/* Mobile frame vs Full Screen toggle */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setViewMode('mobile')}
              title="Mobile Device Simulator (390px)"
              className={`p-1.5 rounded-md flex items-center gap-1 transition-all ${
                viewMode === 'mobile'
                  ? 'bg-teal-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium hidden md:inline">Mobile Frame</span>
            </button>
            <button
              onClick={() => setViewMode('full')}
              title="Full Responsive View"
              className={`p-1.5 rounded-md flex items-center gap-1 transition-all ${
                viewMode === 'full'
                  ? 'bg-teal-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium hidden md:inline">Full Screen</span>
            </button>
          </div>

          <LanguageSelector compact />

          <button
            onClick={resetDemoData}
            title="Reset to fresh demo sample state"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[11px]">Reset Data</span>
          </button>
        </div>

      </div>
    </div>
  );
};
