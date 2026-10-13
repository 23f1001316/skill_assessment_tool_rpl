import React, { useState } from 'react';
import { Award, CheckCircle2, AlertTriangle, ExternalLink, Sparkles, HelpCircle, FileText, ChevronRight, Search, ShieldCheck, Info } from 'lucide-react';
import { Button } from '../common/Button';
import { NsqfBadge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { QualificationDetailsView } from './QualificationDetailsView';
import { useLanguage } from '../../context/LanguageContext';

export const QualificationMatchingResults = ({
  suggestions = [],
  totalEvaluated = 0,
  noMatchReason = null,
  onSelectQualification,
  onBrowseAll
}) => {
  const { language, t } = useLanguage();
  const [selectedDetailQual, setSelectedDetailQual] = useState(null);

  if (noMatchReason) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-6 text-center space-y-4 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">
            {language === 'hi' ? 'कोई उपयुक्त योग्यता नहीं मिली' : 'No Suitable Qualification Match Found'}
          </h3>
          <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto leading-relaxed">
            {noMatchReason}
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-[11px] text-slate-500 max-w-sm mx-auto">
          We evaluated all {totalEvaluated} official qualifications in the catalogue and refrained from forcing an unrelated qualification.
        </div>

        {onBrowseAll && (
          <div className="pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={onBrowseAll}
              icon={Search}
            >
              {language === 'hi' ? 'संपूर्ण NQR सूची खोजें' : 'Search Full NQR Qualifications Directory'}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 text-xs">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl p-4 shadow-sm border border-teal-700/50">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-teal-300 font-semibold text-[11px] mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{language === 'hi' ? 'प्रामाणिक स्रोत-आधारित योग्यता मिलान' : 'Source-Grounded Qualification Matching'}</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              {suggestions.length} {language === 'hi' ? 'प्रासंगिक योग्यताएं सुझाई गईं' : 'Relevant Qualifications Suggested'}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              {language === 'hi' ? '2,815 आधिकारिक राष्ट्रीय योग्यता पैक्स से मूल्यांकन।' : 'Evaluated against 2,815 official qualifications and curriculum files.'}
            </p>
          </div>
          <span className="text-[10px] bg-teal-500/20 text-teal-200 border border-teal-400/30 px-2 py-0.5 rounded-full font-mono">
            {totalEvaluated} Scanned
          </span>
        </div>

        <div className="mt-3 pt-2.5 border-t border-teal-700/60 text-[10px] text-teal-200 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            <strong>Note:</strong> Match scores represent algorithmic text-overlap estimates based on your declared tasks. They are advisory and do not represent an official certification award.
          </span>
        </div>
      </div>

      {/* Official Standards Grounding Disclaimer */}
      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>{t('criteriaLanguageDisclaimer')}</span>
      </div>

      {/* Suggested Qualifications Cards */}
      <div className="space-y-3">
        {suggestions.map((item, idx) => {
          const qual = item.qualification;
          const score = item.matchScore;

          return (
            <div
              key={qual.id || idx}
              className="bg-white rounded-2xl border-2 border-slate-200 hover:border-teal-400 transition-all p-4 shadow-xs space-y-3"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold text-teal-900 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                      Suggestion #{idx + 1}
                    </span>
                    <NsqfBadge level={qual.level || qual.raw_level || 'N/A'} />
                    {qual.code && (
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {qual.code}
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">
                    {qual.title}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Sector: <strong>{qual.sector || 'General'}</strong> • Awarding Body: {qual.awarding_body || 'National Council'}
                  </p>
                </div>

                {/* Match Score Badge */}
                <div className="text-right flex-shrink-0">
                  <span className={`text-base font-black ${
                    score >= 70 ? 'text-emerald-600' : 'text-teal-600'
                  }`}>
                    {score}%
                  </span>
                  <span className="text-[10px] text-slate-400 block font-medium">Match Score</span>
                </div>
              </div>

              {/* Match Score Progress Bar */}
              <ProgressBar
                value={score}
                max={100}
                color={score >= 70 ? 'emerald' : 'teal'}
                size="sm"
              />

              {/* Why This Was Suggested: Matching Terms & Competencies */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                <strong className="text-slate-800 text-[11px] block">
                  Why this qualification was suggested:
                </strong>
                
                {item.matchedTerms && item.matchedTerms.length > 0 && (
                  <div className="flex flex-wrap gap-1 items-center">
                    <span className="text-[10px] text-slate-500">Matched terms:</span>
                    {item.matchedTerms.map((term, tIdx) => (
                      <span key={tIdx} className="text-[10px] bg-teal-100 text-teal-900 font-bold px-1.5 py-0.2 rounded">
                        ✓ {term}
                      </span>
                    ))}
                  </div>
                )}

                {item.matchedCompetencies && item.matchedCompetencies.length > 0 && (
                  <div className="pt-1 border-t border-slate-200/80 space-y-1">
                    <span className="text-[10px] text-slate-500 block">Matched Competency Description:</span>
                    {item.matchedCompetencies.map((c, cIdx) => (
                      <p key={cIdx} className="text-[11px] text-slate-700 italic bg-white p-1.5 rounded border border-slate-200/60">
                        "{c.description}"
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Source Provenance Footnote */}
              <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 gap-1">
                <span>Source: <strong>{item.sourceTrace?.file}</strong> ({item.sourceTrace?.location})</span>
                <span className="text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                  Status: {qual.verification_status || 'unverified'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDetailQual(qual)}
                  icon={ExternalLink}
                >
                  View Full Details
                </Button>
                {onSelectQualification && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onSelectQualification(qual)}
                    icon={CheckCircle2}
                  >
                    Select for Application
                  </Button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal for full detail view */}
      {selectedDetailQual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl">
            <QualificationDetailsView
              qualification={selectedDetailQual}
              onClose={() => setSelectedDetailQual(null)}
              onSelectForApplication={(q) => {
                if (onSelectQualification) onSelectQualification(q);
                setSelectedDetailQual(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
