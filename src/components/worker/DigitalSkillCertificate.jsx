import React, { useRef } from 'react';
import { Award, ShieldCheck, CheckCircle2, Download, Printer, QrCode, ExternalLink, User } from 'lucide-react';
import { Button } from '../common/Button';
import { NsqfBadge } from '../common/Badge';

export const DigitalSkillCertificate = ({ candidate, onClose }) => {
  const cert = candidate?.assessmentRecord;
  const isCompetent = candidate?.status === 'COMPETENT' && cert?.verdict === 'COMPETENT';

  const handlePrint = () => {
    window.print();
  };

  if (!isCompetent) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center space-y-3">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
          <Award className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-slate-900 text-base">Certification Pending</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Official RPL certification is awarded only after a certified assessor conducts the physical practical exam and verifies your evidence.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Printable Certificate Frame */}
      <div className="bg-gradient-to-b from-amber-50/50 via-white to-amber-50/30 rounded-3xl p-5 sm:p-7 border-4 border-amber-300 shadow-md relative overflow-hidden">
        {/* Subtle decorative security watermark */}
        <div className="absolute inset-0 border-2 border-dashed border-amber-200/60 m-2 rounded-2xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-400/5 rounded-full blur-xl pointer-events-none" />

        {/* Certificate Header */}
        <div className="text-center relative z-10 pb-4 border-b border-amber-200">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-bold mb-2">
            <Award className="w-4 h-4 text-amber-700" />
            National Skills Qualifications Framework (NSQF)
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
            Recognition of Prior Learning (RPL)
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Skill Certificate of Competence • SIH 2026 PS 26242
          </p>
        </div>

        {/* Candidate Recipient Body */}
        <div className="py-5 text-center relative z-10 space-y-2">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
            This is to certify that
          </p>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
            {candidate.name}
          </h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            has been independently evaluated by an authorised assessor and demonstrated practical competence in
          </p>

          <div className="bg-amber-100/70 border border-amber-300 text-amber-950 font-bold text-sm sm:text-base py-2.5 px-4 rounded-xl inline-block shadow-2xs mt-1">
            {candidate.currentRoleName || "Domestic Electrician"}
          </div>

          <div className="pt-2 flex items-center justify-center gap-2">
            <NsqfBadge level={candidate.nsqfLevel || 4} />
            <span className="text-xs text-slate-600 bg-white border border-slate-200 px-2.5 py-0.5 rounded-md font-medium">
              Score: <strong>{cert.finalWeightedScore}%</strong>
            </span>
          </div>
        </div>

        {/* Signatures & Verification Grid */}
        <div className="pt-4 border-t border-amber-200 grid grid-cols-2 gap-3 text-left relative z-10 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Certificate ID:</span>
            <p className="font-mono font-bold text-slate-800 text-[11px] truncate">
              {cert.certificateId || "RPL-2026-ELE-09428"}
            </p>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase mt-2">Issued On:</span>
            <p className="font-semibold text-slate-700 text-[11px]">
              {cert.certificateIssueDate || "10 Oct 2026"}
            </p>
          </div>

          <div className="text-right flex flex-col justify-between items-end">
            <div className="w-12 h-12 bg-white border border-amber-300 rounded-lg p-1 flex items-center justify-center shadow-2xs">
              <QrCode className="w-10 h-10 text-slate-800" />
            </div>
            <div className="mt-2 text-right">
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Authorized Assessor</p>
              <p className="text-[11px] font-bold text-teal-800">
                {cert.assessorName || "Er. Vikram Sharma"}
              </p>
              <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded font-medium">
                ✓ Digitally Signed & Verified
              </span>
            </div>
          </div>
        </div>

        {/* Human-in-the-Loop Stamp */}
        <div className="mt-4 pt-2.5 border-t border-dashed border-amber-200 flex items-center justify-between text-[10px] text-slate-500">
          <span className="flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
            Human Assessor Validated (Zero Autonomous Certification)
          </span>
          <span className="font-mono text-slate-400">Verifiable Credential</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="md"
          fullWidth
          onClick={handlePrint}
          icon={Printer}
        >
          Print / Save PDF
        </Button>
        {onClose && (
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={onClose}
          >
            Back to Dashboard
          </Button>
        )}
      </div>
    </div>
  );
};
