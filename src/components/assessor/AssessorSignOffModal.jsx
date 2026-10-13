import React, { useState } from 'react';
import { ShieldCheck, Award, AlertTriangle, Check, X, FileSignature } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';

export const AssessorSignOffModal = ({
  isOpen,
  onClose,
  candidate,
  finalScore,
  rubricScores,
  checklistResults,
  onFinalSubmit
}) => {
  const { activeAssessor } = useApp();
  const [verdict, setVerdict] = useState(finalScore >= 70 ? 'COMPETENT' : 'BRIDGE_REQUIRED');
  const [remarks, setRemarks] = useState(
    finalScore >= 70
      ? 'Demonstrated strong practical dexterity, adhered to safety isolation protocol, and cleanly terminated MCB circuits. Recommended for Level 4 certification.'
      : 'Candidate displayed good basic handling but struggled with loop impedance testing and PPE consistency. Recommended for 16-hour bridge training module.'
  );
  const [declarationChecked, setDeclarationChecked] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!declarationChecked) {
      setError('You must confirm the official Assessor Human-in-the-Loop declaration before submitting.');
      return;
    }

    onFinalSubmit({
      verdict,
      finalWeightedScore: finalScore,
      rubricScores,
      checklistResults,
      assessorRemarks: remarks
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Assessor Sign-Off"
      subtitle={`Final decision for ${candidate?.name} (${candidate?.currentRoleName})`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4 text-xs">
        
        {/* Score & Verdict Selection */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider block">
              Evaluation Outcome
            </span>
            <p className="text-xl font-black mt-0.5">{finalScore}% Score</p>
            <p className="text-[11px] text-slate-400">Assessor: {activeAssessor?.name}</p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setVerdict('COMPETENT')}
              className={`px-3 py-2 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 ${
                verdict === 'COMPETENT'
                  ? 'bg-emerald-500 text-slate-950 shadow-md ring-2 ring-emerald-300'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Award className="w-4 h-4" />
              Competent
            </button>
            <button
              type="button"
              onClick={() => setVerdict('BRIDGE_REQUIRED')}
              className={`px-3 py-2 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 ${
                verdict === 'BRIDGE_REQUIRED'
                  ? 'bg-rose-500 text-white shadow-md ring-2 ring-rose-300'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Bridge Training
            </button>
          </div>
        </div>

        {/* Detailed Remarks */}
        <div>
          <label className="font-bold text-slate-800 block mb-1">
            Assessor Practical Observations & Feedback <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows="3"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Document observed practical competencies, safety discipline, and areas for improvement..."
            className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Human-in-the-loop Legal Declaration */}
        <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={declarationChecked}
              onChange={(e) => setDeclarationChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-sky-600 rounded focus:ring-sky-500 border-slate-300 cursor-pointer"
            />
            <div className="text-[11px] text-sky-950 leading-relaxed">
              <strong className="block font-bold text-sky-900 mb-0.5">
                Official NSDC Assessor Declaration:
              </strong>
              I certify that I have conducted this assessment in person, evaluated practical tool usage against the official NOS rubric, and verified the candidate's identity. <strong>This decision is made autonomously without delegation to automated AI algorithms.</strong>
            </div>
          </label>
          {error && (
            <p className="text-rose-600 text-xs mt-2 font-medium flex items-center gap-1 pl-6">
              <AlertTriangle className="w-3.5 h-3.5" /> {error}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
          <Button variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={handleSubmit}
            icon={FileSignature}
          >
            Sign & Submit Verdict
          </Button>
        </div>

      </div>
    </Modal>
  );
};
