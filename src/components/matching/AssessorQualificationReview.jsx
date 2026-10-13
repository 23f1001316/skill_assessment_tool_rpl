import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Search } from 'lucide-react';
import { Button } from '../common/Button';
import { NsqfBadge } from '../common/Badge';
import { dataRepository } from '../../services/dataRepository';

export const AssessorQualificationReview = ({
  candidate,
  suggestedQualifications = [],
  onConfirmQualification,
  onRequestClarification,
  onFlagSourceRecord
}) => {
  const [selectedQualId, setSelectedQualId] = useState(
    suggestedQualifications[0]?.qualification?.id || candidate?.qualificationId || ''
  );
  const [rationale, setRationale] = useState(
    'Reviewed declared practical experience and work evidence. Confirmed qualification alignment under NSQF criteria.'
  );
  const [actionType, setActionType] = useState('CONFIRM'); // 'CONFIRM' | 'CHANGE' | 'CLARIFY' | 'FLAG'
  const [clarificationNotes, setClarificationNotes] = useState('');
  const [flagReason, setFlagReason] = useState('');
  const [manualSearchQuery, setManualSearchQuery] = useState('');
  const [manualSearchResults, setManualSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSearchCatalogue = (e) => {
    e.preventDefault();
    if (!manualSearchQuery.trim()) return;
    setIsSearching(true);
    const results = dataRepository.getQualifications({ search: manualSearchQuery }).slice(0, 5);
    setManualSearchResults(results);
    setIsSearching(false);
  };

  const handleActionSubmit = (e) => {
    e.preventDefault();
    if (actionType === 'CONFIRM') {
      const chosen = suggestedQualifications.find(s => s.qualification.id === selectedQualId)?.qualification
        || manualSearchResults.find(q => q.id === selectedQualId)
        || { id: selectedQualId, title: candidate.currentRoleName };
      onConfirmQualification(chosen, rationale);
    } else if (actionType === 'CLARIFY') {
      onRequestClarification(clarificationNotes);
    } else if (actionType === 'FLAG') {
      onFlagSourceRecord(selectedQualId, flagReason);
    }
    setIsSubmitted(true);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4 text-xs">
      {/* Header */}
      <div className="border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Assessor Qualification Determination
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            Candidate: {candidate?.name}
          </span>
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
          Validate Qualification Pack for Assessment
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          AI matching suggestions are strictly advisory. The authorized assessor independently selects the qualification to assess.
        </p>
      </div>

      {/* Human In The Loop Mandate Alert */}
      <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-sky-700 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <strong>Mandatory Standard:</strong> A matching suggestion must never automatically approve a qualification, determine competence, or award certification. All choices require authorized assessor confirmation.
        </p>
      </div>

      {isSubmitted ? (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <h4 className="font-bold text-emerald-950 text-sm">Assessor Determination Recorded</h4>
          <p className="text-xs text-emerald-800">
            Your decision and rationale have been logged in the candidate's assessment dossier and audit trail.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSubmitted(false)}
          >
            Edit Assessor Decision
          </Button>
        </div>
      ) : (
        <form onSubmit={handleActionSubmit} className="space-y-4">
          
          {/* Action Mode Radio Selector */}
          <div>
            <label className="font-bold text-slate-800 block mb-1.5">
              Assessor Action:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setActionType('CONFIRM')}
                className={`p-2 rounded-xl border text-center transition-all ${
                  actionType === 'CONFIRM'
                    ? 'bg-sky-600 text-white font-bold border-sky-600'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                1. Confirm Suggestion
              </button>

              <button
                type="button"
                onClick={() => setActionType('CHANGE')}
                className={`p-2 rounded-xl border text-center transition-all ${
                  actionType === 'CHANGE'
                    ? 'bg-sky-600 text-white font-bold border-sky-600'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                2. Select Other QP
              </button>

              <button
                type="button"
                onClick={() => setActionType('CLARIFY')}
                className={`p-2 rounded-xl border text-center transition-all ${
                  actionType === 'CLARIFY'
                    ? 'bg-sky-600 text-white font-bold border-sky-600'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                3. Ask Clarification
              </button>

              <button
                type="button"
                onClick={() => setActionType('FLAG')}
                className={`p-2 rounded-xl border text-center transition-all ${
                  actionType === 'FLAG'
                    ? 'bg-sky-600 text-white font-bold border-sky-600'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                4. Flag Record
              </button>
            </div>
          </div>

          {/* ACTION 1: CONFIRM SUGGESTION */}
          {actionType === 'CONFIRM' && (
            <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <span className="font-bold text-slate-800 block text-xs">
                Select from Suggested Qualifications:
              </span>
              {suggestedQualifications.map((s, idx) => {
                const q = s.qualification;
                const isSelected = selectedQualId === q.id;
                return (
                  <label
                    key={q.id || idx}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-300' : 'bg-white border-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="qual_choice"
                      checked={isSelected}
                      onChange={() => setSelectedQualId(q.id)}
                      className="mt-1 text-sky-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900">{q.title}</strong>
                        <NsqfBadge level={q.level || 'N/A'} />
                        <span className="text-[10px] text-teal-700 font-bold">{s.matchScore}% match</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Code: {q.code || 'Unspecified'} • Awarding Body: {q.awarding_body || 'National Council'}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          )}

          {/* ACTION 2: SEARCH CATALOGUE MANUALLY */}
          {actionType === 'CHANGE' && (
            <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <span className="font-bold text-slate-800 block text-xs">
                Search Official NQR Catalogue (2,815 Qualifications):
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualSearchQuery}
                  onChange={(e) => setManualSearchQuery(e.target.value)}
                  placeholder="e.g. Welder, Electrician, Carpenter, Healthcare..."
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                />
                <Button variant="secondary" size="sm" onClick={handleSearchCatalogue} disabled={isSearching}>
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
              </div>

              {manualSearchResults.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  {manualSearchResults.map((q) => (
                    <label
                      key={q.id}
                      className={`flex items-start gap-2 p-2 rounded-xl border cursor-pointer ${
                        selectedQualId === q.id ? 'bg-sky-50 border-sky-400' : 'bg-white border-slate-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="manual_qual"
                        checked={selectedQualId === q.id}
                        onChange={() => setSelectedQualId(q.id)}
                        className="mt-0.5 text-sky-600"
                      />
                      <div>
                        <strong className="text-slate-900 block">{q.title}</strong>
                        <span className="text-[10px] text-slate-500">{q.code} • NSQF Level {q.level || 'N/A'} • {q.sector}</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ACTION 3: CLARIFICATION */}
          {actionType === 'CLARIFY' && (
            <div className="space-y-2 bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200">
              <span className="font-bold text-amber-950 block text-xs">
                Specify Clarification Required from Worker:
              </span>
              <textarea
                rows="3"
                value={clarificationNotes}
                onChange={(e) => setClarificationNotes(e.target.value)}
                placeholder="e.g. Please provide additional photographic evidence of high-voltage testing or describe your experience with three-phase motor starters..."
                className="w-full p-2.5 rounded-xl border border-amber-300 bg-white text-xs"
              />
            </div>
          )}

          {/* ACTION 4: FLAG RECORD */}
          {actionType === 'FLAG' && (
            <div className="space-y-2 bg-rose-50/70 p-3.5 rounded-2xl border border-rose-200">
              <span className="font-bold text-rose-950 block text-xs">
                Flag Source Record for Coordinator Review:
              </span>
              <textarea
                rows="3"
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                placeholder="e.g. Conflicting NSQF level noted between NQR spreadsheet and curriculum PDF, or missing valid till date..."
                className="w-full p-2.5 rounded-xl border border-rose-300 bg-white text-xs"
              />
            </div>
          )}

          {/* Assessor Rationale Textarea */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">
              Assessor Professional Rationale <span className="text-rose-500">*</span>:
            </label>
            <textarea
              rows="2"
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="State the technical and experiential reasons for your determination..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Submit Action */}
          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              variant="secondary"
              size="md"
              icon={ShieldCheck}
            >
              Save Assessor Determination
            </Button>
          </div>

        </form>
      )}

    </div>
  );
};
