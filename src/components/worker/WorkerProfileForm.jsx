import React, { useState } from 'react';
import { User, Globe, Briefcase, Calendar, GraduationCap, Phone, MapPin, AlertCircle, ArrowRight, ArrowLeft, Save, Info, ShieldCheck } from 'lucide-react';
import { Button } from '../common/Button';
import { useLanguage } from '../../context/LanguageContext';

export const WorkerProfileForm = ({
  formData,
  onUpdateFormData,
  onNext,
  onBack,
  onSaveDraft
}) => {
  const { language, t } = useLanguage();
  const [errors, setErrors] = useState({});

  // Official NSQF Qualifications - Preserved in source wording
  const tradeOptions = [
    { id: "QP-ELE-6001", title: "Domestic Electrician", sector: "Electrical & Electronics" },
    { id: "QP-SOL-0101", title: "Solar PV Installer (Suryamitra)", sector: "Green Jobs" },
    { id: "QP-WEL-3102", title: "Automotive MIG / TIG Welder", sector: "Automotive & Manufacturing" },
    { id: "QP-HSS-5101", title: "General Duty Assistant (Healthcare)", sector: "Healthcare" },
    { id: "QP-PLM-0104", title: "Plumber (General)", sector: "Plumbing" },
    { id: "QP-GAR-1002", title: "Tailor / Garment Maker", sector: "Apparel & Textiles" },
    { id: "QP-CAR-2001", title: "Carpenter & Woodcraft", sector: "Construction" },
    { id: "QP-MAS-3001", title: "Mason / Concrete Finisher", sector: "Construction" }
  ];

  const trainingOptions = [
    { key: "trainingInformal", label: t('trainingInformal') },
    { key: "trainingSelfTaught", label: t('trainingSelfTaught') },
    { key: "trainingShortTerm", label: t('trainingShortTerm') },
    { key: "otherVocational", label: language === 'hi' ? 'आईटीआई / अल्पकालिक कोर्स' : 'Vocational / ITI course' }
  ];

  const languages = [
    { code: "hi", label: "हिन्दी (Hindi)" },
    { code: "en", label: "English" },
    { code: "bn", label: "বাংলা (Bengali)" },
    { code: "ta", label: "தமிழ் (Tamil)" },
    { code: "te", label: "తెలుగు (Telugu)" },
    { code: "mr", label: "मराठी (Marathi)" }
  ];

  const handleChange = (field, value) => {
    onUpdateFormData({ [field]: value });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName || !formData.fullName.trim()) {
      newErrors.fullName = language === 'hi'
        ? "कृपया अपना पूरा नाम दर्ज करें जैसा कि प्रमाण पत्र पर चाहिए।"
        : "Please enter your full name as you wish it to appear on certification.";
    }
    if (!formData.trade) {
      newErrors.trade = language === 'hi'
        ? "कृपया अपना प्राथमिक ट्रेड या काम चुनें।"
        : "Please select your primary trade or craft.";
    }
    if (!formData.yearsExperience || formData.yearsExperience < 1) {
      newErrors.yearsExperience = language === 'hi'
        ? "कृपया अनुभव के वर्ष दर्ज करें (RPL के लिए न्यूनतम 1 वर्ष)।"
        : "Please enter your years of practical experience (minimum 1 year for RPL).";
    }
    if (!formData.workActivities || !formData.workActivities.trim()) {
      newErrors.workActivities = language === 'hi'
        ? "कृपया अपने मुख्य कार्य या दैनिक गतिविधियों का विवरण दें।"
        : "Please list the primary tasks or work activities you perform.";
    }
    if (!formData.hasConsent) {
      newErrors.hasConsent = language === 'hi'
        ? "RPL मूल्यांकन हेतु अनुभव विवरण उपयोग करने की सहमति देना आवश्यक है।"
        : "You must give your consent to process your experience for RPL assessment.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = (e) => {
    e.preventDefault();
    if (validate()) {
      onNext();
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="border-b border-slate-100 pb-3">
        <span className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
          {t('step1Profile')} • {t('profileHeaderTitle')}
        </span>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
          {t('profileHeaderTitle')}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {t('profileHeaderSubtitle')}
        </p>
      </div>

      <form onSubmit={handleContinue} className="space-y-4 text-xs">
        
        {/* Full Name */}
        <div>
          <label className="font-bold text-slate-800 block mb-1">
            {t('fullNameLabel')} <span className="text-rose-500">{t('requiredStar')}</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={formData.fullName || ''}
              onChange={(e) => handleChange('fullName', e.target.value)}
              placeholder={t('fullNamePlaceholder')}
              className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
                errors.fullName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              }`}
            />
          </div>
          {errors.fullName && (
            <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {errors.fullName}
            </p>
          )}
        </div>

        {/* Preferred Language & Trade Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Preferred Language */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">
              {language === 'hi' ? 'मौखिक परीक्षा की भाषा' : 'Preferred Language for Evaluation'} <span className="text-rose-500">{t('requiredStar')}</span>
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <select
                value={formData.preferredLanguage || 'hi'}
                onChange={(e) => handleChange('preferredLanguage', e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white cursor-pointer"
              >
                {languages.map(l => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {language === 'hi' ? 'परीक्षक इसी भाषा में मौखिक प्रश्न पूछेंगे।' : 'Assessor will conduct viva and oral questioning in this language.'}
            </p>
          </div>

          {/* Trade or Skill - Kept Faithful to Official NSQF Standard */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">
              {t('tradeLabel')} <span className="text-rose-500">{t('requiredStar')}</span>
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <select
                value={formData.trade || ''}
                onChange={(e) => handleChange('trade', e.target.value)}
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white cursor-pointer ${
                  errors.trade ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                }`}
              >
                <option value="">{language === 'hi' ? 'अपना प्राथमिक ट्रेड चुनें...' : 'Select your job role / trade...'}</option>
                {tradeOptions.map(t => (
                  <option key={t.id} value={t.title}>
                    {t.title} ({t.sector})
                  </option>
                ))}
              </select>
            </div>
            {errors.trade && (
              <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {errors.trade}
              </p>
            )}
          </div>
        </div>

        {/* Years of Experience & Previous Training */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="font-bold text-slate-800 block mb-1">
              {t('yearsExpLabel')} <span className="text-rose-500">{t('requiredStar')}</span>
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="number"
                min="1"
                max="40"
                value={formData.yearsExperience || ''}
                onChange={(e) => handleChange('yearsExperience', Number(e.target.value))}
                placeholder="e.g. 6"
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.yearsExperience ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                }`}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {t('yearsExpHelper')}
            </p>
            {errors.yearsExperience && (
              <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {errors.yearsExperience}
              </p>
            )}
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1">
              {t('trainingBackgroundLabel')}
            </label>
            <div className="relative">
              <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <select
                value={formData.previousTraining || trainingOptions[0].label}
                onChange={(e) => handleChange('previousTraining', e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white cursor-pointer"
              >
                {trainingOptions.map((opt, i) => (
                  <option key={i} value={opt.label}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Work Activities Performed */}
        <div>
          <label className="font-bold text-slate-800 block mb-1">
            {t('workActivitiesLabel')} <span className="text-rose-500">{t('requiredStar')}</span>
          </label>
          <textarea
            rows="3"
            value={formData.workActivities || ''}
            onChange={(e) => handleChange('workActivities', e.target.value)}
            placeholder={t('workActivitiesPlaceholder')}
            className={`w-full p-3 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 ${
              errors.workActivities ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
            }`}
          />
          {errors.workActivities && (
            <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {errors.workActivities}
            </p>
          )}
        </div>

        {/* Contact Details */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-3">
          <span className="text-[11px] font-bold text-slate-600 block uppercase tracking-wider">
            {language === 'hi' ? 'संपर्क जानकारी (परीक्षक शेड्यूलिंग हेतु)' : 'Contact Details (For Assessor Scheduling)'}
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-700 block mb-1">
                {t('phoneLabel')}
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder={t('phonePlaceholder')}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-700 block mb-1">
                {t('locationLabel')}
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder={t('locationPlaceholder')}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400">
            {t('privacyNote')}
          </p>
        </div>

        {/* Official Standards Grounding Disclaimer */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>{t('criteriaLanguageDisclaimer')}</span>
        </div>

        {/* Consent Checkbox */}
        <div className={`p-3.5 rounded-2xl border transition-all ${
          errors.hasConsent ? 'bg-rose-50/50 border-rose-300 ring-2 ring-rose-200' : 'bg-teal-50/50 border-teal-200'
        }`}>
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(formData.hasConsent)}
              onChange={(e) => handleChange('hasConsent', e.target.checked)}
              className="mt-0.5 w-4 h-4 text-teal-600 rounded focus:ring-teal-500 border-slate-300 cursor-pointer"
            />
            <div className="text-[11px] text-slate-700 leading-relaxed">
              <strong className="text-slate-900 block font-bold mb-0.5">
                {t('consentTitle')}:
              </strong>
              {t('consentText')}
            </div>
          </label>
          {errors.hasConsent && (
            <p className="text-rose-600 text-[11px] mt-2 font-medium flex items-center gap-1 pl-6">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {errors.hasConsent}
            </p>
          )}
        </div>

        {/* Form Action Buttons */}
        <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 border-t border-slate-100">
          <Button
            variant="outline"
            size="md"
            onClick={onBack}
            icon={ArrowLeft}
            className="w-full sm:w-auto"
          >
            {t('backStep')}
          </Button>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="md"
              onClick={onSaveDraft}
              icon={Save}
              className="flex-1 sm:flex-none"
            >
              {t('saveDraft')}
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              icon={ArrowRight}
              className="flex-1 sm:flex-none"
            >
              {t('nextStep')}: {t('step2Skills')}
            </Button>
          </div>
        </div>

      </form>
    </div>
  );
};
