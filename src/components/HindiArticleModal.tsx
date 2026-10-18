import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  BookOpen, 
  Calendar, 
  Award, 
  FileText, 
  ShieldCheck, 
  Clock, 
  HelpCircle, 
  AlertCircle,
  Edit3,
  Save,
  Printer
} from 'lucide-react';
import { HindiRecruitmentArticle } from '../types/automation';

interface HindiArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: HindiRecruitmentArticle | null;
  onSaveArticle?: (updated: HindiRecruitmentArticle) => void;
  isAdmin?: boolean;
}

export const HindiArticleModal: React.FC<HindiArticleModalProps> = ({
  isOpen,
  onClose,
  article,
  onSaveArticle,
  isAdmin = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editOverview, setEditOverview] = useState('');
  const [editMarkdown, setEditMarkdown] = useState('');

  if (!isOpen || !article) return null;

  const handleStartEdit = () => {
    setEditTitle(article.title);
    setEditOverview(article.overview);
    setEditMarkdown(article.fullArticleMarkdown);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!onSaveArticle) return;
    const updated: HindiRecruitmentArticle = {
      ...article,
      title: editTitle,
      overview: editOverview,
      fullArticleMarkdown: editMarkdown,
      updatedAt: new Date().toISOString(),
    };
    onSaveArticle(updated);
    setIsEditing(false);
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(article.fullArticleMarkdown || article.overview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-label="Hindi Recruitment Article">
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity" onClick={onClose} />
      
      <div className="min-h-full flex items-center justify-center p-2.5 sm:p-4">
        <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
          
          {/* Header Bar */}
          <div className="bg-slate-900 text-white p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white tracking-wide uppercase">
                    हिंदी भर्ती मार्गदर्शन
                  </span>
                  <span className="text-slate-400 text-xs font-mono hidden sm:inline">
                    Slug: {article.slug}
                  </span>
                </div>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight truncate mt-0.5">
                  {article.title}
                </h2>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              {isAdmin && !isEditing && (
                <button
                  onClick={handleStartEdit}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
                  title="Edit Hindi article text"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Edit Article</span>
                </button>
              )}

              {isEditing && (
                <button
                  onClick={handleSave}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              )}

              <button
                onClick={handleCopyMarkdown}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
                title="Copy formatted Hindi text"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer hidden sm:inline-flex"
                title="Print Article"
              >
                <Printer className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Article Body Content */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-slate-800 leading-relaxed text-sm">
            
            {/* Meta Description Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-amber-950">आधिकारिक स्रोत से सत्यापित सारांश:</span>
                <p className="text-amber-900 leading-relaxed">{article.metaDescription}</p>
                <div className="text-[10px] text-amber-800/80 font-mono pt-1">
                  स्रोत संदर्भ: {article.officialNoticeSource}
                </div>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Article Headline (Title)</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full text-sm font-semibold p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">भर्ती सारांश (Overview)</label>
                  <textarea
                    rows={4}
                    value={editOverview}
                    onChange={(e) => setEditOverview(e.target.value)}
                    className="w-full text-sm p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Article Markdown</label>
                  <textarea
                    rows={12}
                    value={editMarkdown}
                    onChange={(e) => setEditMarkdown(e.target.value)}
                    className="w-full font-mono text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>
            ) : (
              <>
                {/* 1. Overview */}
                <section className="space-y-2">
                  <h3 className="text-base font-bold text-slate-900 border-l-3 border-l-red-600 pl-2.5">
                    1. भर्ती का संक्षिप्त विवरण (Recruitment Overview)
                  </h3>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line text-sm sm:text-[15px]">
                    {article.overview}
                  </p>
                </section>

                {/* 2. Important Dates Grid */}
                <section className="space-y-2">
                  <h3 className="text-base font-bold text-slate-900 border-l-3 border-l-blue-600 pl-2.5 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>2. महत्वपूर्ण तिथियां (Important Dates)</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {article.importantDatesHindi.map((dateItem, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-2">
                        <span className="text-xs text-slate-600 font-medium">{dateItem.label}:</span>
                        <span className="text-xs font-bold text-slate-950 font-mono">{dateItem.date}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 3. Vacancy & Reservation Details */}
                <section className="space-y-2">
                  <h3 className="text-base font-bold text-slate-900 border-l-3 border-l-emerald-600 pl-2.5 flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>3. पदों का विवरण एवं आरक्षण (Vacancy Details)</span>
                  </h3>
                  <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 text-xs sm:text-sm text-emerald-950 leading-relaxed">
                    {article.vacancyDetailsHindi}
                  </div>
                </section>

                {/* 4. Eligibility & 5. Age Limit */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <section className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-slate-700" />
                      <span>4. शैक्षणिक योग्यता (Eligibility)</span>
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {article.eligibilityCriteriaHindi}
                    </p>
                  </section>

                  <section className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-700" />
                      <span>5. आयु सीमा एवं छूट (Age Limit)</span>
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {article.ageLimitHindi}
                    </p>
                  </section>
                </div>

                {/* 6. Application Fee & 7. Selection Process */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <section className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      6. आवेदन शुल्क विवरण (Application Fee)
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {article.applicationFeeHindi}
                    </p>
                  </section>

                  <section className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      7. चयन प्रक्रिया (Selection Process)
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {article.selectionProcessHindi}
                    </p>
                  </section>
                </div>

                {/* 8. Salary */}
                <section className="space-y-1 bg-amber-50/50 border border-amber-200 rounded-xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950">
                    8. वेतनमान (Pay Scale)
                  </h4>
                  <p className="text-xs sm:text-sm text-amber-900 font-semibold">
                    {article.salaryHindi}
                  </p>
                </section>

                {/* 9. How to Apply */}
                <section className="space-y-2">
                  <h3 className="text-base font-bold text-slate-900 border-l-3 border-l-red-600 pl-2.5">
                    9. ऑनलाइन आवेदन कैसे करें (Step-by-Step Procedure)
                  </h3>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                    {article.howToApplyHindi.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800">
                        <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="leading-relaxed flex-1">{step}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 10. Required Documents */}
                <section className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    10. आवश्यक दस्तावेज (Important Documents)
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    {article.importantDocumentsHindi.map((doc, idx) => (
                      <li key={idx} className="leading-relaxed">{doc}</li>
                    ))}
                  </ul>
                </section>

                {/* 11. Important Official Links */}
                <section className="space-y-2">
                  <h3 className="text-base font-bold text-slate-900 border-l-3 border-l-blue-600 pl-2.5 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-blue-600" />
                    <span>11. महत्वपूर्ण आधिकारिक लिंक्स (Important Links)</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {article.importantLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white hover:bg-slate-50 border border-slate-300 hover:border-blue-500 rounded-xl p-3 flex items-center justify-between gap-2 transition-all shadow-2xs group"
                      >
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700 block truncate">
                            {link.title}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono block truncate">
                            {link.url}
                          </span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
                      </a>
                    ))}
                  </div>
                </section>

                {/* 12. FAQs */}
                {article.faqs && article.faqs.length > 0 && (
                  <section className="space-y-2">
                    <h3 className="text-base font-bold text-slate-900 border-l-3 border-l-amber-500 pl-2.5 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-amber-600" />
                      <span>13. अक्सर पूछे जाने वाले प्रश्न (FAQs)</span>
                    </h3>
                    <div className="space-y-2">
                      {article.faqs.map((faq, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
                          <p className="text-xs sm:text-sm font-bold text-slate-900">प्र: {faq.question}</p>
                          <p className="text-xs text-slate-600 leading-relaxed">उ: {faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 14. Disclaimer */}
                <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-500 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <span className="font-bold text-slate-700">अस्वीकरण (Disclaimer): </span>
                    {article.disclaimer}
                  </p>
                </div>
              </>
            )}

          </div>

          {/* Footer Bar */}
          <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
            <span>अंतिम अद्यतन: {new Date(article.updatedAt).toLocaleDateString('hi-IN')}</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              बंद करें (Close)
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
