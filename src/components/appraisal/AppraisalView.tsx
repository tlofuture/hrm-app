import React, { useState } from 'react';
import {
  Award,
  Star,
  TrendingUp,
  Plus,
  CheckCircle,
  FileText,
  User,
  Sparkles,
} from 'lucide-react';
import { AppraisalRecord, Employee } from '../../types';
import { translations } from '../../utils/translations';

interface AppraisalViewProps {
  appraisals: AppraisalRecord[];
  employees: Employee[];
  onAddAppraisal: (newAppraisal: AppraisalRecord) => void;
  language: 'en' | 'my';
}

export const AppraisalView: React.FC<AppraisalViewProps> = ({
  appraisals,
  employees,
  onAddAppraisal,
  language,
}) => {
  const t = translations[language];
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.employeeId || 'NX-1002');
  const [kpiExecution, setKpiExecution] = useState(4.8);
  const [competency, setCompetency] = useState(4.7);
  const [teamwork, setTeamwork] = useState(4.6);
  const [leadership, setLeadership] = useState(4.5);
  const [strengths, setStrengths] = useState('');
  const [growthAreas, setGrowthAreas] = useState('');
  const [recommendPromotion, setRecommendPromotion] = useState(true);

  const avgOverall = +(
    (kpiExecution + competency + teamwork + leadership) / 4
  ).toFixed(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.employeeId === selectedEmpId) || employees[0];

    const newRec: AppraisalRecord = {
      id: `app-${Date.now()}`,
      employeeId: emp.employeeId,
      employeeName: emp.name,
      department: emp.department,
      role: emp.role,
      cycle: 'Q3 2026 Review',
      reviewer: 'Daw Khin Thuzar (HR) & Department Head',
      ratings: {
        kpiExecution,
        competency,
        teamwork,
        leadership,
      },
      overallScore: avgOverall,
      status: 'completed',
      strengths: strengths || 'Exceeds expectations in core deliverables and technical problem solving.',
      growthAreas: growthAreas || 'Focus on strategic scaling and mentoring junior specialists.',
      promotionRecommendation: recommendPromotion,
      reviewedDate: new Date().toISOString().split('T')[0],
    };

    onAddAppraisal(newRec);
    setIsModalOpen(false);
    setStrengths('');
    setGrowthAreas('');
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {t.appraisalTitle}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t.appraisalSubtitle}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{t.conductReview}</span>
        </button>
      </div>

      {/* Cycle Highlights Card */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-700">
            Active Review Cycle: Q3 2026 Evaluation
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            {language === 'my'
              ? 'ဝန်ထမ်းစွမ်းဆောင်ရည် အကဲဖြတ်မှုနှင့် ရာထူးတိုးလမ်းကြောင်း'
              : 'Workforce Performance Benchmarking & Growth Matrix'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluated on OKR execution, leadership competence, and organization values.
          </p>
        </div>

        <div className="flex items-center gap-6 text-xs">
          <div>
            <div className="text-slate-400">Total Reviewed</div>
            <div className="font-mono text-xl font-bold text-slate-900 tabular-nums">
              {appraisals.length}
            </div>
          </div>
          <div>
            <div className="text-slate-400">Avg Company Rating</div>
            <div className="font-mono text-xl font-bold text-indigo-600 tabular-nums">
              4.68 / 5.0
            </div>
          </div>
        </div>
      </div>

      {/* Appraisal Records Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {appraisals.map((app) => (
          <div
            key={app.id}
            className="p-6 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 transition-all space-y-4 shadow-xs"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {app.employeeName}
                </h3>
                <p className="text-xs text-indigo-600 font-medium">
                  {app.role} · {app.department}
                </p>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Reviewer: {app.reviewer} · {app.reviewedDate}
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold font-mono text-indigo-700 tabular-nums">
                  {app.overallScore}
                </div>
                <div className="text-[10px] text-slate-400">out of 5.0</div>
              </div>
            </div>

            {/* Rating categories breakdown */}
            <div className="grid grid-cols-4 gap-2 p-3 bg-slate-50 rounded-xl text-center text-xs">
              <div>
                <div className="text-[10px] text-slate-500">KPIs</div>
                <div className="font-mono font-bold text-slate-800 tabular-nums mt-0.5">
                  {app.ratings.kpiExecution}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">Competency</div>
                <div className="font-mono font-bold text-slate-800 tabular-nums mt-0.5">
                  {app.ratings.competency}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">Teamwork</div>
                <div className="font-mono font-bold text-slate-800 tabular-nums mt-0.5">
                  {app.ratings.teamwork}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">Leadership</div>
                <div className="font-mono font-bold text-slate-800 tabular-nums mt-0.5">
                  {app.ratings.leadership}
                </div>
              </div>
            </div>

            {/* Strengths & Growth Areas */}
            <div className="space-y-2 text-xs">
              <div>
                <span className="font-semibold text-slate-700">Key Strengths: </span>
                <span className="text-slate-600">{app.strengths}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-700">Growth Roadmap: </span>
                <span className="text-slate-600">{app.growthAreas}</span>
              </div>
            </div>

            {/* Promotion tag */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              {app.promotionRecommendation ? (
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{t.promotionReady}</span>
                </span>
              ) : (
                <span className="text-slate-500 text-[11px]">Standard Progression</span>
              )}
              <span className="text-slate-400 font-mono text-[11px]">
                Cycle: {app.cycle}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Conduct Review */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                {t.conductReview}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Select Employee *
                </label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                >
                  {employees.map((emp) => (
                    <option key={emp.employeeId} value={emp.employeeId}>
                      {emp.name} ({emp.employeeId}) · {emp.department}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sliders */}
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>{t.kpiExecution}</span>
                    <span className="font-mono">{kpiExecution.toFixed(1)} / 5.0</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={kpiExecution}
                    onChange={(e) => setKpiExecution(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>{t.coreCompetency}</span>
                    <span className="font-mono">{competency.toFixed(1)} / 5.0</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={competency}
                    onChange={(e) => setCompetency(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>{t.teamCollaboration}</span>
                    <span className="font-mono">{teamwork.toFixed(1)} / 5.0</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={teamwork}
                    onChange={(e) => setTeamwork(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>{t.leadershipValue}</span>
                    <span className="font-mono">{leadership.toFixed(1)} / 5.0</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={leadership}
                    onChange={(e) => setLeadership(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>

              <div className="p-3 bg-indigo-50/60 rounded-xl flex items-center justify-between text-indigo-900 font-semibold">
                <span>Calculated Overall Score:</span>
                <span className="text-base font-mono font-bold tabular-nums">
                  {avgOverall} / 5.0
                </span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Key Strengths &amp; Commendations
                </label>
                <textarea
                  rows={2}
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  placeholder="Demonstrated exceptional leadership and precision in deliveries..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Growth Roadmap &amp; Mentorship Focus
                </label>
                <textarea
                  rows={2}
                  value={growthAreas}
                  onChange={(e) => setGrowthAreas(e.target.value)}
                  placeholder="Target technical certifications and cross-team alignment..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="promotionCheck"
                  checked={recommendPromotion}
                  onChange={(e) => setRecommendPromotion(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <label
                  htmlFor="promotionCheck"
                  className="font-medium text-slate-800 cursor-pointer"
                >
                  {t.promotionReady}
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Publish Appraisal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
