import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const LanguageSelector = ({ compact = false }) => {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'bn', label: 'Bengali', native: 'বাংলা' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்' }
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg p-1 transition-colors">
        <Globe className="w-3.5 h-3.5 text-slate-500 ml-1" />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          aria-label="Select Application Language"
          className="bg-transparent text-xs font-medium text-slate-800 pr-1 py-0.5 focus:outline-none cursor-pointer"
        >
          {languages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.native}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
        <Globe className="w-3.5 h-3.5 text-teal-600" /> Language / भाषा:
      </span>
      <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
        {languages.map((l) => {
          const isActive = language === l.code;
          return (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                isActive
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              {l.native}
            </button>
          );
        })}
      </div>
    </div>
  );
};
