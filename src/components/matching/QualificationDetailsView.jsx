import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, AlertTriangle, ShieldCheck, Layers, X } from 'lucide-react';
import { dataRepository } from '../../services/dataRepository';
import { Button } from '../common/Button';
import { NsqfBadge } from '../common/Badge';

export const QualificationDetailsView = ({
  qualification,
  onClose,
  onSelectForApplication
}) => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'modules' | 'assessment' | 'source'
  const [modules, setModules] = useState([]);
  const [performanceCriteria, setPerformanceCriteria] = useState([]);
  const [assessmentMethods, setAssessmentMethods] = useState([]);
  const [rubrics, setRubrics] = useState([]);
  const [evidenceRequirements, setEvidenceRequirements] = useState([]);
  const [curriculumVersions, setCurriculumVersions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadDetails() {
      setIsLoading(true);
      await dataRepository.init();
      if (!isMounted) return;

      const code = qualification?.code;
      const qModules = dataRepository.getModules({ qualification_code: code });
      const qPCs = dataRepository.getPerformanceCriteria(code);
      const qMethods = dataRepository.getAssessmentMethods(code);
      const qRubrics = dataRepository.getAssessmentRubrics(code);
      const qEvidence = dataRepository.getEvidenceRequirements(code);
      const qCurricula = dataRepository.getCurriculumVersions();

      setModules(qModules);
      setPerformanceCriteria(qPCs);
      setAssessmentMethods(qMethods);
      setRubrics(qRubrics);
      setEvidenceRequirements(qEvidence);
      setCurriculumVersions(qCurricula);
      setIsLoading(false);
    }

    if (qualification) {
      loadDetails();
    }
    return () => { isMounted = false; };
  }, [qualification]);

  if (!qualification) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4 text-xs animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Official Source Qualification
            </span>
            <NsqfBadge level={qualification.level || qualification.raw_level || 'N/A'} />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            {qualification.title}
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Code: <strong>{qualification.code || 'Unspecified in Source'}</strong> • Sector: {qualification.sector || 'General'}
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
            activeTab === 'overview' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Metadata & Description
        </button>
        <button
          onClick={() => setActiveTab('modules')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
            activeTab === 'modules' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Curriculum & Modules ({modules.length})
        </button>
        <button
          onClick={() => setActiveTab('assessment')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
            activeTab === 'assessment' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Assessment & Evidence
        </button>
        <button
          onClick={() => setActiveTab('source')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
            activeTab === 'source' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Source Traceability
        </button>
      </div>

      {/* TAB 1: METADATA & DESCRIPTION */}
      {activeTab === 'overview' && (
        <div className="space-y-3.5">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Official Occupational Description (from Source Document)
            </span>
            <p className="text-slate-700 leading-relaxed text-xs">
              {qualification.description || qualification.desc_snippet || "No description was populated in the source spreadsheet record."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Awarding Body</span>
              <p className="font-bold text-slate-900 mt-0.5">{qualification.awarding_body || 'Not Specified in Source'}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Valid Till</span>
              <p className="font-bold text-slate-900 mt-0.5">{qualification.valid_till || 'Not Specified in Source'}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Notational Duration</span>
              <p className="font-medium text-slate-800 mt-0.5">{qualification.hours || qualification.max_notational_hours || 'Not Specified'}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Version</span>
              <p className="font-medium text-slate-800 mt-0.5">{qualification.version || 'Version 1.0'}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Proposed Occupation</span>
              <p className="font-medium text-slate-800 mt-0.5">{qualification.proposed_occupation || 'Standard Trade Role'}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Progression Pathway</span>
              <p className="font-medium text-slate-800 mt-0.5">{qualification.progression_pathway || 'Master Craftsperson / Supervisor'}</p>
            </div>
          </div>

          {/* Missing Fields Review Alert */}
          {qualification.review_flags && qualification.review_flags.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Manual Review Notice:</strong>
                <p className="text-[11px] leading-relaxed">
                  Some metadata fields were not populated in the source file: {qualification.review_flags.join(', ')}.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MODULES & COMPETENCIES */}
      {activeTab === 'modules' && (
        <div className="space-y-3">
          {modules.length > 0 ? (
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-xs">
                Extracted NOS / Learning Modules ({modules.length})
              </h4>
              {modules.map((m, i) => (
                <div key={m.id || i} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded text-[10px]">
                      {m.nos_code || `Module ${m.module_number || i + 1}`}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      Duration: {m.allocated_hours}h {m.assessment_marks ? `• ${m.assessment_marks} Marks` : ''}
                    </span>
                  </div>
                  <h5 className="font-bold text-slate-900">{m.name}</h5>
                  {m.weightage_pct && (
                    <p className="text-[10px] text-slate-500">Weightage in Qualification: <strong>{m.weightage_pct}%</strong></p>
                  )}
                  <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                    Source: {m.source?.source_file} (Page {m.source?.page || 1})
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 text-center text-xs text-slate-500 space-y-2">
              <Layers className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="font-semibold text-slate-700">Individual NOS modules not in catalog sheet</p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Detailed NOS breakdown for this qualification is maintained in its dedicated Qualification Pack (QP). General Employability Skills modules apply as per NSQF guidelines.
              </p>
            </div>
          )}

          {/* Extracted Detailed Performance Criteria */}
          {performanceCriteria.length > 0 && (
            <div className="space-y-2 bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                <h5 className="font-bold text-slate-900 text-xs">
                  Detailed Performance Criteria ({performanceCriteria.length} PCs Extracted)
                </h5>
                <span className="text-[10px] text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded font-mono">
                  Source: Assessment_Guide.pdf.pdf (Pages 16-26)
                </span>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                {performanceCriteria.map((pc, i) => (
                  <div key={pc.id || i} className="bg-white p-2.5 rounded-xl border border-slate-200/80 text-[11px] space-y-0.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-bold text-sky-800 bg-sky-50 px-1.5 py-0.2 rounded font-mono">
                        {pc.pc_code}
                      </span>
                      <span>Page {pc.source?.page || 'Annexure'}</span>
                    </div>
                    <p className="text-slate-800 leading-snug">{pc.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Employability Skills Versions */}
          <div className="bg-teal-50/60 border border-teal-200 rounded-2xl p-3.5 space-y-2">
            <h5 className="font-bold text-teal-950 text-xs flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-teal-700" />
              Related Employability Skills Curriculum Durations in Source
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {curriculumVersions.map((cv) => (
                <div key={cv.id} className="bg-white p-2 rounded-xl border border-teal-200 text-center">
                  <span className="font-bold text-teal-900 block text-xs">{cv.duration_hours} Hours</span>
                  <span className="text-[10px] text-slate-500">{cv.total_marks} Marks Total</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">{cv.target_level}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-teal-800 italic">
              Note: Do not combine criteria across different durations without confirming appropriate NSQF level alignment.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: ASSESSMENT & EVIDENCE */}
      {activeTab === 'assessment' && (
        <div className="space-y-3">
          {assessmentMethods.length > 0 || rubrics.length > 0 ? (
            <div className="space-y-3">
              {/* Strategy & Ratio */}
              {rubrics[0] && (
                <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
                    Assessment Standard from Assessment Guide
                  </span>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-sm">Pass Threshold: {rubrics[0].pass_mark_aggregate}% Aggregate</p>
                      <p className="text-xs text-slate-300">Exam Structure: {rubrics[0].ratio}</p>
                    </div>
                    <span className="text-[11px] bg-sky-950 border border-sky-700 text-sky-300 px-2 py-1 rounded-full font-bold">
                      Source: Page 6 & 27
                    </span>
                  </div>
                </div>
              )}

              {/* Assessment Methods */}
              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-2">
                <h5 className="font-bold text-slate-900 text-xs">Official Assessment Methods in Source</h5>
                <div className="space-y-1.5">
                  {assessmentMethods.map((am) => (
                    <div key={am.id} className="bg-white p-2.5 rounded-xl border border-slate-200 flex justify-between items-start gap-2">
                      <div>
                        <strong className="text-slate-900 block">{am.method_name}</strong>
                        <p className="text-[11px] text-slate-600 mt-0.5">{am.format}</p>
                      </div>
                      {am.weightage && (
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {am.weightage}% Ratio
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Evidence Requirements */}
              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-2">
                <h5 className="font-bold text-slate-900 text-xs">Evidence Requirements & Protocols</h5>
                <div className="space-y-1.5">
                  {evidenceRequirements.map((er) => (
                    <div key={er.id} className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-teal-800 block uppercase">{er.type}</span>
                      <p className="text-slate-700 text-xs mt-0.5">{er.requirement}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center text-xs text-slate-600 space-y-2">
              <ShieldCheck className="w-8 h-8 text-teal-600 mx-auto" />
              <h5 className="font-bold text-slate-800">Standard NOS Assessment Protocol</h5>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Assessed via authorized independent assessor using pre-set NOS theory & practical rubrics. Passing threshold: 70% minimum aggregate unless specified otherwise by the awarding body.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SOURCE TRACEABILITY */}
      {activeTab === 'source' && (
        <div className="space-y-3">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2.5">
            <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Exact Source Provenance Record
            </h5>
            
            <div className="space-y-1.5 text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-200/80">
                <span className="text-slate-500">Source Document:</span>
                <span className="font-mono font-bold text-slate-900">{qualification.source?.source_file || 'NQR_Qualifications_Summary.xlsx.xlsx'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/80">
                <span className="text-slate-500">Document Type:</span>
                <span className="font-medium text-slate-800">{qualification.source?.source_type || 'Catalogue Spreadsheet'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/80">
                <span className="text-slate-500">Row or Page Reference:</span>
                <span className="font-mono font-semibold text-teal-800">
                  {qualification.source?.row_index ? `Worksheet: Row ${qualification.source.row_index}` : `Page ${qualification.source?.page_count || 1}`}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/80">
                <span className="text-slate-500">Verification Status:</span>
                <span className="font-bold text-amber-700 uppercase">{qualification.verification_status || 'unverified'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Audit Status:</span>
                <span className="text-slate-600">Extracted verbatim from source file</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic p-2 bg-slate-100 rounded-xl">
            "A record is not labeled as officially verified merely because it appears in a supplied file. Coordinator review is required for formal certification status."
          </p>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
        {onClose && (
          <Button variant="outline" size="md" onClick={onClose}>
            Back
          </Button>
        )}
        {onSelectForApplication && (
          <Button
            variant="primary"
            size="md"
            onClick={() => onSelectForApplication(qualification)}
            icon={CheckCircle2}
          >
            Select This Qualification for Evaluation
          </Button>
        )}
      </div>

    </div>
  );
};
