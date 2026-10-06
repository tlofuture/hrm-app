import React, { useState } from 'react';
import {
  X,
  Mail,
  Send,
  CheckCircle,
  Clock,
  Filter,
  Eye,
  FileText,
  DollarSign,
  Calendar,
  Award,
  Sparkles,
} from 'lucide-react';
import { EmailNotification, EmailNotificationCategory } from '../../types';
import { translations } from '../../utils/translations';

interface EmailNotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  emails: EmailNotification[];
  onTriggerTestEmail: () => void;
  language: 'en' | 'my';
}

export const EmailNotificationDrawer: React.FC<EmailNotificationDrawerProps> = ({
  isOpen,
  onClose,
  emails,
  onTriggerTestEmail,
  language,
}) => {
  const t = translations[language];
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeEmail, setActiveEmail] = useState<EmailNotification | null>(null);

  if (!isOpen) return null;

  const filteredEmails = emails.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const getCategoryIcon = (category: EmailNotificationCategory) => {
    switch (category) {
      case 'payroll':
        return <DollarSign className="w-3.5 h-3.5 text-emerald-600" />;
      case 'leave':
        return <Calendar className="w-3.5 h-3.5 text-blue-600" />;
      case 'recruitment':
        return <Mail className="w-3.5 h-3.5 text-amber-600" />;
      case 'appraisal':
        return <Award className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t.emailTitle}</h3>
              <p className="text-xs text-slate-500 font-medium">
                {emails.length} {language === 'my' ? 'စောင် ပေးပို့ပြီး' : 'Automated Dispatches'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Bar & Category Filters */}
        <div className="p-4 border-b border-slate-100 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              {language === 'my' ? 'ကဏ္ဍအလိုက် စစ်ထုတ်ရန်' : 'Filter Category'}
            </span>
            <button
              onClick={onTriggerTestEmail}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t.triggerSimulatedEmail}</span>
            </button>
          </div>

          {/* Filter Pills / Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {['all', 'payroll', 'leave', 'recruitment', 'appraisal'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Email Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredEmails.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
              {language === 'my' ? 'အီးမေးလ်မှတ်တမ်း မရှိသေးပါ။' : 'No email dispatches in this category.'}
            </div>
          ) : (
            filteredEmails.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveEmail(item)}
                className="group p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/20 cursor-pointer transition-all space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="p-1 bg-slate-100 rounded-md">
                      {getCategoryIcon(item.category)}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {item.recipientName}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      &lt;{item.to}&gt;
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                    {item.sentAt.slice(11, 16)}
                  </span>
                </div>

                <div className="text-xs font-medium text-slate-800 line-clamp-1">
                  {item.subject}
                </div>

                <p className="text-xs text-slate-500 line-clamp-2">
                  {item.preview}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <CheckCircle className="w-3 h-3" />
                    <span>Delivered via Gateway</span>
                  </span>
                  <span className="text-indigo-600 font-medium group-hover:underline flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {language === 'my' ? 'ဖတ်ရှုရန်' : 'View'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Email Detailed Preview Modal */}
        {activeEmail && (
          <div className="absolute inset-0 z-50 bg-white flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  {language === 'my' ? 'ပေးပို့ခဲ့သော အီးမေးလ်' : 'Dispatched Email Preview'}
                </h4>
              </div>
              <button
                onClick={() => setActiveEmail(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="space-y-1.5 border-b border-slate-100 pb-4 text-xs">
                <div className="flex">
                  <span className="w-20 text-slate-400 font-medium">{t.recipient}:</span>
                  <span className="font-semibold text-slate-800">
                    {activeEmail.recipientName} &lt;{activeEmail.to}&gt;
                  </span>
                </div>
                <div className="flex">
                  <span className="w-20 text-slate-400 font-medium">{t.subject}:</span>
                  <span className="font-semibold text-slate-900">
                    {activeEmail.subject}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-20 text-slate-400 font-medium">{t.sentAt}:</span>
                  <span className="font-mono text-slate-600 tabular-nums">
                    {activeEmail.sentAt}
                  </span>
                </div>
              </div>

              {/* Rendered HTML content */}
              <div
                className="prose prose-sm max-w-none text-xs text-slate-700 bg-slate-50/70 p-4 rounded-xl border border-slate-200"
                dangerouslySetInnerHTML={{ __html: activeEmail.htmlContent }}
              />
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setActiveEmail(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
              >
                {language === 'my' ? 'ပိတ်မည်' : 'Back to List'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
