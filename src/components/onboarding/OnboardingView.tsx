import React, { useState } from 'react';
import {
  UserCheck,
  CheckCircle2,
  Clock,
  FileText,
  Laptop,
  BookOpen,
  Award,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import { OnboardingCase, OnboardingChecklistItem } from '../../types';
import { translations } from '../../utils/translations';

interface OnboardingViewProps {
  onboardingCases: OnboardingCase[];
  onToggleTask: (caseId: string, taskId: string) => void;
  onVerifyTaskByHR: (caseId: string, taskId: string) => void;
  onGraduateNewHire: (onboardingCase: OnboardingCase) => void;
  language: 'en' | 'my';
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  onboardingCases,
  onToggleTask,
  onVerifyTaskByHR,
  onGraduateNewHire,
  language,
}) => {
  const t = translations[language];
  const [activeCaseId, setActiveCaseId] = useState<string>(
    onboardingCases[0]?.id || ''
  );

  const activeCase =
    onboardingCases.find((c) => c.id === activeCaseId) || onboardingCases[0];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'documentation':
        return <FileText className="w-4 h-4 text-amber-600" />;
      case 'it_setup':
        return <Laptop className="w-4 h-4 text-indigo-600" />;
      case 'training':
        return <BookOpen className="w-4 h-4 text-emerald-600" />;
      default:
        return <UserCheck className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {t.onboardingTitle}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t.onboardingSubtitle}
          </p>
        </div>
      </div>

      {/* Main Grid: Onboarding Cases List on Left, Active Case Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: New Hire Cases List */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
            {t.activeOnboardings} ({onboardingCases.length})
          </div>

          {onboardingCases.map((c) => {
            const isSelected = c.id === (activeCase?.id || '');
            const completedCount = c.checklist.filter((item) => item.completed).length;
            const progress = Math.round((completedCount / c.checklist.length) * 100);

            return (
              <div
                key={c.id}
                onClick={() => setActiveCaseId(c.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                  isSelected
                    ? 'bg-indigo-50/50 border-indigo-500 ring-2 ring-indigo-500/10 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {c.employeeName}
                    </h3>
                    <p className="text-xs text-indigo-600 font-medium">
                      {c.role}
                    </p>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-700 tabular-nums">
                    {progress}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Start: {c.startDate}</span>
                  <span>Mentor: {c.mentor}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column (2 Cols): Active Onboarding Detail & Interactive Checklist */}
        {activeCase ? (
          <div className="lg:col-span-2 space-y-5">
            {/* Header Card */}
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">
                      {activeCase.employeeName}
                    </h2>
                    <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {activeCase.department}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activeCase.role} · Started on {activeCase.startDate}
                  </p>
                </div>

                {/* Graduate button */}
                <button
                  onClick={() => onGraduateNewHire(activeCase)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors whitespace-nowrap"
                >
                  <Award className="w-4 h-4" />
                  <span>{t.graduateEmployee}</span>
                </button>
              </div>

              {/* Progress Summary Ribbon */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl text-center text-xs">
                <div>
                  <div className="text-[11px] text-slate-500">Total Checklist</div>
                  <div className="font-mono font-bold text-slate-800 text-sm mt-0.5 tabular-nums">
                    {activeCase.checklist.length} items
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">Tasks Completed</div>
                  <div className="font-mono font-bold text-emerald-600 text-sm mt-0.5 tabular-nums">
                    {activeCase.checklist.filter((i) => i.completed).length} items
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">HR Compliance Verified</div>
                  <div className="font-mono font-bold text-indigo-600 text-sm mt-0.5 tabular-nums">
                    {activeCase.checklist.filter((i) => i.verifiedByHR).length} items
                  </div>
                </div>
              </div>
            </div>

            {/* Checklist items list */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  {language === 'my'
                    ? 'အလုပ်စတင်ခြင်း စစ်ဆေးရမည့် အဆင့်များ'
                    : 'Mandatory Onboarding Milestones'}
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  {language === 'my'
                    ? 'အမှန်ခြစ်၍ ပြီးစီးကြောင်း သတ်မှတ်နိုင်ပါသည်'
                    : 'Click checkbox to mark task completion'}
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {activeCase.checklist.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 sm:px-6 flex items-start justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => onToggleTask(activeCase.id, item.id)}
                        className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                      />

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="p-1 bg-slate-100 rounded-md">
                            {getCategoryIcon(item.category)}
                          </span>
                          <span
                            className={`text-xs font-semibold ${
                              item.completed
                                ? 'text-slate-800 line-through opacity-70'
                                : 'text-slate-900'
                            }`}
                          >
                            {language === 'my' ? item.titleMyanmar : item.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 capitalize">
                          Category: {item.category.replace('_', ' ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.verifiedByHR ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>HR Verified</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onVerifyTaskByHR(activeCase.id, item.id)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:text-indigo-700 bg-slate-100 hover:bg-indigo-50 rounded-md transition-colors"
                        >
                          {t.verifyDocument}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
