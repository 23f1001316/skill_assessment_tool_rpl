import React from 'react';
import { Smartphone, Monitor } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AppContainer = ({ children }) => {
  const { viewMode, setViewMode } = useApp();

  if (viewMode === 'mobile') {
    return (
      <div className="min-h-screen bg-slate-900 py-4 sm:py-8 px-2 sm:px-4 flex flex-col items-center justify-start">
        {/* Device Mode Switcher bar above simulator */}
        <div className="w-full max-w-[420px] mb-2 flex items-center justify-between text-xs text-slate-400 px-2">
          <span className="flex items-center gap-1.5 font-medium">
            <Smartphone className="w-3.5 h-3.5 text-teal-400" />
            390px Mobile Viewport Simulator
          </span>
          <button
            onClick={() => setViewMode('full')}
            className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700 hover:border-teal-500 transition-colors"
          >
            <Monitor className="w-3 h-3" /> Switch to Full Screen
          </button>
        </div>

        {/* Mobile Device Bezel Frame */}
        <div className="w-full max-w-[420px] bg-slate-950 rounded-[44px] p-2.5 sm:p-3 shadow-2xl border-[4px] border-slate-700/80 relative overflow-hidden transition-all">
          {/* Dynamic Island / Speaker notch simulation */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full z-50 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-800 mr-2" />
            <div className="w-2 h-2 rounded-full bg-slate-800/60" />
          </div>

          {/* Screen Content */}
          <div className="bg-slate-50 rounded-[34px] overflow-hidden min-h-[760px] max-h-[85vh] overflow-y-auto flex flex-col relative border border-slate-300/40">
            {children}
          </div>
        </div>

        <p className="text-[11px] text-slate-500 mt-3 text-center">
          Optimized for touchscreens & 360px–430px mobile displays • SIH 2026 PS 26242
        </p>
      </div>
    );
  }

  // Full Screen Responsive View
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-6 pb-20 sm:pb-8">
        {children}
      </main>
    </div>
  );
};
