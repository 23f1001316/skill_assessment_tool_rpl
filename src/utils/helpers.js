// Helper functions for scoring, formatters, and status styling

export const formatScore = (val) => {
  if (val === null || val === undefined) return 'N/A';
  return `${Math.round(val)}%`;
};

export const getStatusMeta = (status) => {
  switch (status) {
    case 'COMPETENT':
      return {
        label: 'Certified Competent',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        dotClass: 'bg-emerald-500',
        icon: 'CheckCircle2'
      };
    case 'IN_REVIEW':
      return {
        label: 'Assessor Reviewing',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
        dotClass: 'bg-amber-500',
        icon: 'Clock'
      };
    case 'SUBMITTED':
      return {
        label: 'AI Pre-Screened',
        badgeClass: 'bg-teal-100 text-teal-800 border-teal-300',
        dotClass: 'bg-teal-500',
        icon: 'Sparkles'
      };
    case 'BRIDGE_REQUIRED':
      return {
        label: 'Bridge Training Required',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
        dotClass: 'bg-rose-500',
        icon: 'AlertTriangle'
      };
    case 'ASSESSING':
      return {
        label: 'Practical Test in Progress',
        badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        dotClass: 'bg-indigo-500',
        icon: 'UserCheck'
      };
    case 'AWAITING_AUTHORISED_REVIEW':
      return {
        label: 'Awaiting Authorised Review',
        badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
        dotClass: 'bg-purple-500',
        icon: 'ShieldCheck'
      };
    case 'DRAFT':
      return {
        label: 'Draft Application',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
        dotClass: 'bg-slate-400',
        icon: 'FileText'
      };
    default:
      return {
        label: 'Evidence Gathering',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
        dotClass: 'bg-slate-400',
        icon: 'FileText'
      };
  }
};

export const calculateRubricScore = (rubricDimensions, scores) => {
  if (!scores || !rubricDimensions || rubricDimensions.length === 0) return 0;
  let totalScore = 0;
  let totalMaxWeight = 0;

  rubricDimensions.forEach((dim) => {
    const rawScore = scores[dim.id] || 0; // 1 to 4
    // normalize 1-4 to 25%-100%
    const normalized = (rawScore / 4) * dim.weight;
    totalScore += normalized;
    totalMaxWeight += dim.weight;
  });

  return totalMaxWeight > 0 ? Math.round((totalScore / totalMaxWeight) * 100) : 0;
};
