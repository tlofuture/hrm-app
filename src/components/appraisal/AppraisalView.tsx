import React, { useState, useMemo } from 'react';
import {
  Award,
  Star,
  TrendingUp,
  Plus,
  CheckCircle,
  FileText,
  User,
  Sparkles,
  Search,
  Filter,
  X,
  ChevronRight,
  ChevronDown,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  Target,
  BarChart2,
  Calendar,
  Building,
  AlertCircle,
  Check,
  Eye,
  Sliders,
} from 'lucide-react';
import { AppraisalRecord, Employee } from '../../types';
import { translations } from '../../utils/translations';
import { getEmployeeAvatar, handleAvatarError } from '../../utils/imageUtils';

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

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [selectedCycleFilter, setSelectedCycleFilter] = useState<string>('all');
  const [selectedPromotionFilter, setSelectedPromotionFilter] = useState<string>('all');

  // Selected Appraisal for In-Page Detail View (default to first appraisal)
  const [selectedAppraisalId, setSelectedAppraisalId] = useState<string | null>(
    appraisals[0]?.id || null
  );

  // Modal State for Conducting Review
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Form State for New Review
  const [formEmpId, setFormEmpId] = useState(employees[0]?.employeeId || 'NX-1002');
  const [formCycle, setFormCycle] = useState('Q3 2026 Review');
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

  // Unique departments for filter
  const departmentsList = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => {
      if (e.department) set.add(e.department);
    });
    return Array.from(set);
  }, [employees]);

  // Unique review cycles for filter
  const cyclesList = useMemo(() => {
    const set = new Set<string>();
    appraisals.forEach((a) => {
      if (a.cycle) set.add(a.cycle);
    });
    return Array.from(set);
  }, [appraisals]);

  // Filtered appraisals
  const filteredAppraisals = useMemo(() => {
    return appraisals.filter((app) => {
      // Search Box filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = app.employeeName.toLowerCase().includes(q);
        const matchId = app.employeeId.toLowerCase().includes(q);
        const matchDept = app.department.toLowerCase().includes(q);
        const matchRole = app.role.toLowerCase().includes(q);
        const matchReviewer = app.reviewer.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchDept && !matchRole && !matchReviewer) {
          return false;
        }
      }

      // Department filter
      if (selectedDeptFilter !== 'all' && app.department !== selectedDeptFilter) {
        return false;
      }

      // Cycle filter
      if (selectedCycleFilter !== 'all' && app.cycle !== selectedCycleFilter) {
        return false;
      }

      // Promotion filter
      if (selectedPromotionFilter === 'ready' && !app.promotionRecommendation) {
        return false;
      }
      if (selectedPromotionFilter === 'standard' && app.promotionRecommendation) {
        return false;
      }

      return true;
    });
  }, [
    appraisals,
    searchQuery,
    selectedDeptFilter,
    selectedCycleFilter,
    selectedPromotionFilter,
  ]);

  // Active selected appraisal record for detail view
  const selectedAppraisal = useMemo(() => {
    if (!selectedAppraisalId) return null;
    return (
      appraisals.find((a) => a.id === selectedAppraisalId) ||
      filteredAppraisals[0] ||
      null
    );
  }, [appraisals, selectedAppraisalId, filteredAppraisals]);

  // Selected employee data
  const selectedEmployee = useMemo(() => {
    if (!selectedAppraisal) return null;
    return (
      employees.find((e) => e.employeeId === selectedAppraisal.employeeId) || null
    );
  }, [selectedAppraisal, employees]);

  // KPI performance tier helper
  const getPerformanceTier = (score: number) => {
    if (score >= 4.8) {
      return {
        label: 'Tier 1: Exceptional Performer',
        sub: 'Top 5% Company Benchmark · Exceeds All Expectations',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        badge: 'bg-emerald-600 text-white',
      };
    }
    if (score >= 4.5) {
      return {
        label: 'Tier 2: High Achiever',
        sub: 'Exceeds Targets · Key Contributor to Organization Growth',
        color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
        badge: 'bg-indigo-600 text-white',
      };
    }
    if (score >= 4.0) {
      return {
        label: 'Tier 3: Solid Performer',
        sub: 'Meets Expectations · Consistent Core Deliverables',
        color: 'text-cyan-700 bg-cyan-50 border-cyan-200',
        badge: 'bg-cyan-600 text-white',
      };
    }
    return {
      label: 'Tier 4: Growth Needed',
      sub: 'Action Plan in Progress · Mentorship Recommended',
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      badge: 'bg-amber-600 text-white',
    };
  };

  // Handle submitting new review
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.employeeId === formEmpId) || employees[0];

    const newRec: AppraisalRecord = {
      id: `app-${Date.now()}`,
      employeeId: emp.employeeId,
      employeeName: emp.name,
      department: emp.department,
      role: emp.role,
      cycle: formCycle,
      reviewer: 'Daw Khin Thuzar (HR) & Department Head',
      ratings: {
        kpiExecution,
        competency,
        teamwork,
        leadership,
      },
      overallScore: avgOverall,
      status: 'completed',
      strengths:
        strengths ||
        'Exceeds expectations in core deliverables and technical problem solving.',
      growthAreas:
        growthAreas ||
        'Focus on strategic scaling and mentoring junior specialists.',
      promotionRecommendation: recommendPromotion,
      reviewedDate: new Date().toISOString().split('T')[0],
    };

    onAddAppraisal(newRec);
    setSelectedAppraisalId(newRec.id);
    setIsModalOpen(false);
    setStrengths('');
    setGrowthAreas('');
  };

  // Average company rating calculation
  const averageCompanyRating = useMemo(() => {
    if (appraisals.length === 0) return 0;
    const sum = appraisals.reduce((acc, a) => acc + a.overallScore, 0);
    return +(sum / appraisals.length).toFixed(2);
  }, [appraisals]);

  const promotionReadyCount = appraisals.filter(
    (a) => a.promotionRecommendation
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {t.appraisalTitle}
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Q3 2026 Cycle
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'my'
              ? 'ဝန်ထမ်းများ၏ စွမ်းဆောင်ရည်၊ OKR ရည်မှန်းချက်များ၊ ၃၆၀ ဒီဂရီ အကဲဖြတ်မှုနှင့် ရာထူးတိုး လမ်းကြောင်း အစီရင်ခံစာများ။'
              : 'Periodic evaluations, KPI goals, core competencies, 360 feedback, and career promotion tracks.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {selectedAppraisal && (
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors cursor-pointer"
              title="Print Official A4 Appraisal Slip"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>{language === 'my' ? 'A4 အစီရင်ခံစာ ပရင့်ထုတ်မည်' : 'Print Appraisal (A4)'}</span>
            </button>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.conductReview}</span>
          </button>
        </div>
      </div>

      {/* Cycle Highlights KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Total Evaluations
          </div>
          <div className="mt-1 text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {appraisals.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Permanent staff reviews</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Avg Organization Score
          </div>
          <div className="mt-1 text-2xl font-bold font-mono text-indigo-600 tabular-nums">
            {averageCompanyRating} <span className="text-xs font-normal text-slate-400">/ 5.0</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">High Performance Index</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Promotion Ready
          </div>
          <div className="mt-1 text-2xl font-bold font-mono text-emerald-600 tabular-nums">
            {promotionReadyCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Recommended for promotion</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Active Cycle
          </div>
          <div className="mt-1 text-xl font-bold text-slate-800">
            Q3 2026 Review
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Finalized & Certified</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SEARCH EMPLOYEE BOX & FILTER TOOLBAR */}
      {/* ========================================================================= */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Employee Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'my'
                  ? 'ဝန်ထမ်းအမည်၊ ID၊ ဌာန သို့မဟုတ် ရာထူးဖြင့် ရှာဖွေပါ...'
                  : 'Search employee by name, ID, department, or role...'
              }
              className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Selectors */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Department Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">Department:</span>
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="all">All Departments</option>
                {departmentsList.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Cycle Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">Cycle:</span>
              <select
                value={selectedCycleFilter}
                onChange={(e) => setSelectedCycleFilter(e.target.value)}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="all">All Cycles</option>
                {cyclesList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Promotion Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">Promotion:</span>
              <select
                value={selectedPromotionFilter}
                onChange={(e) => setSelectedPromotionFilter(e.target.value)}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="all">All Tracks</option>
                <option value="ready">Promotion Ready Only</option>
                <option value="standard">Standard Progression</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status count bar */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-500">
          <span>
            Showing <strong className="text-slate-800">{filteredAppraisals.length}</strong> of{' '}
            <strong className="text-slate-800">{appraisals.length}</strong> evaluation records
            {searchQuery && (
              <span>
                {' '}
                matching "<span className="text-indigo-600 font-semibold">{searchQuery}</span>"
              </span>
            )}
          </span>

          {(searchQuery ||
            selectedDeptFilter !== 'all' ||
            selectedCycleFilter !== 'all' ||
            selectedPromotionFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDeptFilter('all');
                setSelectedCycleFilter('all');
                setSelectedPromotionFilter('all');
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PERFORMANCE APPRAISAL DATA TABLE (ROWS VIEW) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {language === 'my'
                ? 'ဝန်ထမ်းစွမ်းဆောင်ရည် အကဲဖြတ်မှု စာရင်း (Table Rows View)'
                : 'Performance Appraisal Register & Scorecards'}
            </h3>
            <p className="text-[11px] text-slate-500">
              Click on any row to view complete appraisal dossier and OKR breakdown below.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
            <span>Selected Row is highlighted</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-semibold">
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th className="py-3 px-4">Employee Name & ID</th>
                <th className="py-3 px-4">Role & Department</th>
                <th className="py-3 px-3">Review Cycle</th>
                <th className="py-3 px-3 text-center">KPI & Goals</th>
                <th className="py-3 px-3 text-center">Competency</th>
                <th className="py-3 px-3 text-center">Teamwork</th>
                <th className="py-3 px-3 text-center">Leadership</th>
                <th className="py-3 px-4 text-center font-bold text-indigo-900">Overall Score</th>
                <th className="py-3 px-3 text-center">Promotion Track</th>
                <th className="py-3 px-3">Reviewed Date</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAppraisals.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400 text-xs">
                    <div className="max-w-sm mx-auto space-y-2">
                      <Search className="w-8 h-8 mx-auto text-slate-300" />
                      <p className="font-semibold text-slate-700">No appraisal records found</p>
                      <p className="text-slate-400 text-[11px]">
                        No evaluations matched your search criteria. Try modifying your search term or clearing the filters.
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedDeptFilter('all');
                          setSelectedCycleFilter('all');
                          setSelectedPromotionFilter('all');
                        }}
                        className="mt-2 px-3 py-1.5 text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md font-semibold transition-colors"
                      >
                        Reset Search
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAppraisals.map((app, idx) => {
                  const emp = employees.find((e) => e.employeeId === app.employeeId);
                  const isSelected = selectedAppraisalId === app.id;
                  const tier = getPerformanceTier(app.overallScore);

                  return (
                    <tr
                      key={app.id}
                      onClick={() => setSelectedAppraisalId(app.id)}
                      className={`cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-50/90 ring-1 ring-inset ring-indigo-300 border-l-4 border-l-indigo-600 font-medium'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Row Index */}
                      <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>

                      {/* Employee Identification */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {emp?.avatar ? (
                            <img
                              src={emp.avatar}
                              alt={app.employeeName}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                              {app.employeeName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                              <span>{app.employeeName}</span>
                              {isSelected && (
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-600" />
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {app.employeeId} {emp?.nameMyanmar && `· ${emp.nameMyanmar}`}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role & Department */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 text-[11px]">
                          {app.role}
                        </div>
                        <div className="text-[10px] text-indigo-600 font-medium">
                          {app.department}
                        </div>
                      </td>

                      {/* Review Cycle */}
                      <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                        {app.cycle}
                      </td>

                      {/* 4 Ratings */}
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                        <span className="px-1.5 py-0.5 bg-slate-100 rounded">
                          {app.ratings.kpiExecution.toFixed(1)}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                        <span className="px-1.5 py-0.5 bg-slate-100 rounded">
                          {app.ratings.competency.toFixed(1)}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                        <span className="px-1.5 py-0.5 bg-slate-100 rounded">
                          {app.ratings.teamwork.toFixed(1)}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                        <span className="px-1.5 py-0.5 bg-slate-100 rounded">
                          {app.ratings.leadership.toFixed(1)}
                        </span>
                      </td>

                      {/* Overall Score with visual badge */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-100/80 text-indigo-900 border border-indigo-200">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span className="font-mono font-bold text-sm tabular-nums">
                            {app.overallScore.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-500 font-normal">/ 5.0</span>
                        </div>
                      </td>

                      {/* Promotion Recommendation */}
                      <td className="py-3 px-3 text-center">
                        {app.promotionRecommendation ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            <span>Promotion Ready</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-slate-600 bg-slate-100 border border-slate-200">
                            <span>Standard</span>
                          </span>
                        )}
                      </td>

                      {/* Reviewed Date */}
                      <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                        {app.reviewedDate}
                      </td>

                      {/* Row Action Button */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAppraisalId(app.id);
                          }}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-2xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          <Eye className="w-3 h-3" />
                          <span>{isSelected ? 'Viewing' : 'Details'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* IN-PAGE DETAIL VIEW: SELECTED EMPLOYEE APPRAISAL & OKRs DOSSIER */}
      {/* ========================================================================= */}
      {selectedAppraisal && (
        <div
          id="appraisal-detail-panel"
          className="bg-white rounded-2xl border-2 border-indigo-300 shadow-md p-6 space-y-6 transition-all animate-in fade-in duration-200"
        >
          {/* Detail Header & Action Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
            <div className="flex items-center gap-4">
              {selectedEmployee?.avatar ? (
                <img
                  src={selectedEmployee.avatar}
                  alt={selectedAppraisal.employeeName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-200 shadow-xs shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-xs shrink-0">
                  {selectedAppraisal.employeeName.charAt(0)}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-bold text-slate-900">
                    {selectedAppraisal.employeeName}
                  </h2>
                  {selectedEmployee?.nameMyanmar && (
                    <span className="text-xs text-slate-500 font-medium">
                      ({selectedEmployee.nameMyanmar})
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 font-mono">
                    {selectedAppraisal.employeeId}
                  </span>
                </div>

                <div className="text-xs text-indigo-600 font-semibold mt-0.5">
                  {selectedAppraisal.role} &bull; {selectedAppraisal.department}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 mt-2 font-mono">
                  <span>Cycle: <strong className="text-slate-800">{selectedAppraisal.cycle}</strong></span>
                  <span>Reviewer: <strong className="text-slate-800">{selectedAppraisal.reviewer}</strong></span>
                  <span>Date: <strong className="text-slate-800">{selectedAppraisal.reviewedDate}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Dossier (A4)</span>
              </button>

              <button
                onClick={() => setSelectedAppraisalId(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Close Detail View"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Overall Score & Performance Tier Banner */}
          {(() => {
            const tier = getPerformanceTier(selectedAppraisal.overallScore);
            return (
              <div className="p-5 bg-gradient-to-r from-indigo-50/70 via-slate-50 to-emerald-50/60 rounded-xl border border-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${tier.badge}`}>
                      {tier.label}
                    </span>
                    {selectedAppraisal.promotionRecommendation && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-600 text-white">
                        <Award className="w-3.5 h-3.5" />
                        <span>Recommended for Promotion</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    {tier.sub}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Overall Cumulative Score</div>
                    <div className="flex items-baseline justify-end gap-1 mt-0.5">
                      <span className="text-3xl font-black font-mono text-indigo-700 tabular-nums">
                        {selectedAppraisal.overallScore.toFixed(2)}
                      </span>
                      <span className="text-sm text-slate-400 font-mono">/ 5.00</span>
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-indigo-200 shadow-xs text-amber-500">
                    <Star className="w-7 h-7 fill-amber-400 text-amber-500" />
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 4 Core Competency Rating Progress Cards */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Core Competency & OKR Metric Ratings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Metric 1 */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">KPI Execution & OKRs</span>
                  <span className="font-mono font-bold text-sm text-indigo-700">
                    {selectedAppraisal.ratings.kpiExecution.toFixed(1)} / 5.0
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${(selectedAppraisal.ratings.kpiExecution / 5) * 100}%`,
                    }}
                  />
                </div>
                <div className="text-[10px] text-slate-500">
                  Achievement: {Math.round((selectedAppraisal.ratings.kpiExecution / 5) * 100)}% Execution
                </div>
              </div>

              {/* Metric 2 */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Role & Tech Mastery</span>
                  <span className="font-mono font-bold text-sm text-emerald-700">
                    {selectedAppraisal.ratings.competency.toFixed(1)} / 5.0
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${(selectedAppraisal.ratings.competency / 5) * 100}%`,
                    }}
                  />
                </div>
                <div className="text-[10px] text-slate-500">
                  Mastery: {Math.round((selectedAppraisal.ratings.competency / 5) * 100)}% Proficiency
                </div>
              </div>

              {/* Metric 3 */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Team Collaboration</span>
                  <span className="font-mono font-bold text-sm text-cyan-700">
                    {selectedAppraisal.ratings.teamwork.toFixed(1)} / 5.0
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-cyan-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${(selectedAppraisal.ratings.teamwork / 5) * 100}%`,
                    }}
                  />
                </div>
                <div className="text-[10px] text-slate-500">
                  Culture: {Math.round((selectedAppraisal.ratings.teamwork / 5) * 100)}% Alignment
                </div>
              </div>

              {/* Metric 4 */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Leadership & Value</span>
                  <span className="font-mono font-bold text-sm text-violet-700">
                    {selectedAppraisal.ratings.leadership.toFixed(1)} / 5.0
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-violet-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${(selectedAppraisal.ratings.leadership / 5) * 100}%`,
                    }}
                  />
                </div>
                <div className="text-[10px] text-slate-500">
                  Impact: {Math.round((selectedAppraisal.ratings.leadership / 5) * 100)}% Proactivity
                </div>
              </div>
            </div>
          </div>

          {/* Key OKRs & Goal Execution Checklist */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-indigo-600" />
                <span>Quarterly Objectives & Key Results (OKRs) Status</span>
              </h4>
              <span className="text-[11px] font-mono text-emerald-700 font-semibold">
                3 / 3 Deliverables Complete
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>OKR 1: Primary Milestone</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  System uptime guaranteed at 99.98% and sprint release delivery fulfilled within roadmap deadlines.
                </p>
                <div className="mt-2 text-[10px] font-mono text-emerald-700 font-bold">100% Target Met</div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>OKR 2: Code Quality & SLA</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Peer review SLA completed under 4 hours; test coverage increased across core enterprise services.
                </p>
                <div className="mt-2 text-[10px] font-mono text-emerald-700 font-bold">100% Target Met</div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>OKR 3: Team Mentorship</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Mentored 2 junior specialists and facilitated internal knowledge sharing workshops.
                </p>
                <div className="mt-2 text-[10px] font-mono text-emerald-700 font-bold">95% Target Met</div>
              </div>
            </div>
          </div>

          {/* Qualitative Evaluation Feedback */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths Card */}
            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Key Commendations & Demonstrated Strengths</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed bg-white/80 p-3 rounded-lg border border-emerald-100">
                "{selectedAppraisal.strengths}"
              </p>
            </div>

            {/* Growth Areas Card */}
            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-200 space-y-2">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>Growth Roadmap & Coaching Focus</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed bg-white/80 p-3 rounded-lg border border-indigo-100">
                "{selectedAppraisal.growthAreas}"
              </p>
            </div>
          </div>

          {/* Governance & Certified Sign-Off Box */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>
                Certified Enterprise Evaluation Ref:{' '}
                <strong className="font-mono text-slate-700">{selectedAppraisal.id.toUpperCase()}</strong>
              </span>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <span>Reviewer: <strong className="text-slate-800">{selectedAppraisal.reviewer}</strong></span>
              <span>Status: <strong className="text-emerald-700 capitalize">{selectedAppraisal.status}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONDUCT PERFORMANCE REVIEW */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  {t.conductReview}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Select Employee for Evaluation *
                </label>
                <select
                  value={formEmpId}
                  onChange={(e) => setFormEmpId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {employees.map((emp) => (
                    <option key={emp.employeeId} value={emp.employeeId}>
                      {emp.name} ({emp.employeeId}) &bull; {emp.role} [{emp.department}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Review Cycle Name
                </label>
                <input
                  type="text"
                  value={formCycle}
                  onChange={(e) => setFormCycle(e.target.value)}
                  placeholder="e.g. Q3 2026 Review, Annual 2026"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                />
              </div>

              {/* Sliders */}
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>{t.kpiExecution}</span>
                    <span className="font-mono text-indigo-600 font-bold">{kpiExecution.toFixed(1)} / 5.0</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={kpiExecution}
                    onChange={(e) => setKpiExecution(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>{t.coreCompetency}</span>
                    <span className="font-mono text-indigo-600 font-bold">{competency.toFixed(1)} / 5.0</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={competency}
                    onChange={(e) => setCompetency(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>{t.teamCollaboration}</span>
                    <span className="font-mono text-indigo-600 font-bold">{teamwork.toFixed(1)} / 5.0</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={teamwork}
                    onChange={(e) => setTeamwork(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>{t.leadershipValue}</span>
                    <span className="font-mono text-indigo-600 font-bold">{leadership.toFixed(1)} / 5.0</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={leadership}
                    onChange={(e) => setLeadership(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-3 bg-indigo-50/70 rounded-xl flex items-center justify-between text-indigo-950 font-bold border border-indigo-100">
                <span>Calculated Overall Score:</span>
                <span className="text-base font-mono font-bold tabular-nums text-indigo-700">
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
                  placeholder="Demonstrated exceptional leadership and precision in technical deliverables..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
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
                  placeholder="Target technical certifications and cross-team strategic alignment..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="promotionCheck"
                  checked={recommendPromotion}
                  onChange={(e) => setRecommendPromotion(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                />
                <label
                  htmlFor="promotionCheck"
                  className="font-medium text-slate-800 cursor-pointer"
                >
                  {t.promotionReady} (Ready for advancement / higher grade)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm cursor-pointer"
                >
                  Publish Appraisal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: OFFICIAL A4 APPRAISAL PRINT PREVIEW */}
      {/* ========================================================================= */}
      {isPrintModalOpen && selectedAppraisal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-300 flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Top Bar */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <Printer className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-bold">
                    Official Performance Appraisal Statement (A4 Print Preview)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Form ready for physical A4 printing or PDF export
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print to Paper (A4)</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body: A4 Printable Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-100 flex justify-center">
              <div className="w-full max-w-[800px] bg-white p-8 rounded-xl shadow-lg border border-slate-200 text-slate-900 space-y-6">
                {/* Print Header */}
                <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
                  <div>
                    <div className="text-lg font-black tracking-tight text-slate-900">
                      NEXHR ENTERPRISE SYSTEMS
                    </div>
                    <div className="text-xs font-bold text-slate-700">
                      WORKFORCE PERFORMANCE APPRAISAL &amp; EVALUATION STATEMENT
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Yangon Head Office: No. 124, Pyay Road, Kamayut Township, Yangon
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded">
                      CERTIFIED EVALUATION
                    </span>
                    <div className="text-[11px] text-slate-500 mt-1 font-mono">
                      Cycle: {selectedAppraisal.cycle}
                    </div>
                  </div>
                </div>

                {/* Employee Dossier Box */}
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-base font-bold text-slate-900">
                      {selectedAppraisal.employeeName}
                    </div>
                    <div className="text-xs text-slate-600">
                      {selectedAppraisal.role} &bull; {selectedAppraisal.department}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-1">
                      Employee ID: {selectedAppraisal.employeeId} | Evaluated Date: {selectedAppraisal.reviewedDate}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-slate-500 font-semibold uppercase">Overall Score</div>
                    <div className="text-2xl font-black font-mono text-indigo-700">
                      {selectedAppraisal.overallScore.toFixed(2)} / 5.0
                    </div>
                  </div>
                </div>

                {/* Ratings Table */}
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-y border-slate-300 font-bold text-slate-800">
                      <th className="py-2 px-3">Evaluation Competency Metric</th>
                      <th className="py-2 px-3 text-center">Score (Max 5.0)</th>
                      <th className="py-2 px-3 text-center">Achievement %</th>
                      <th className="py-2 px-3">Performance Benchmark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-2.5 px-3 font-semibold">1. KPI Execution &amp; Goals</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold">
                        {selectedAppraisal.ratings.kpiExecution.toFixed(1)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono">
                        {Math.round((selectedAppraisal.ratings.kpiExecution / 5) * 100)}%
                      </td>
                      <td className="py-2.5 px-3 text-emerald-700 font-medium">Exceeds Targets</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold">2. Role Competency &amp; Mastery</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold">
                        {selectedAppraisal.ratings.competency.toFixed(1)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono">
                        {Math.round((selectedAppraisal.ratings.competency / 5) * 100)}%
                      </td>
                      <td className="py-2.5 px-3 text-emerald-700 font-medium">High Technical Excellence</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold">3. Teamwork &amp; Collaboration</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold">
                        {selectedAppraisal.ratings.teamwork.toFixed(1)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono">
                        {Math.round((selectedAppraisal.ratings.teamwork / 5) * 100)}%
                      </td>
                      <td className="py-2.5 px-3 text-indigo-700 font-medium">Strong Cultural Pillar</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold">4. Leadership &amp; Proactivity</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold">
                        {selectedAppraisal.ratings.leadership.toFixed(1)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono">
                        {Math.round((selectedAppraisal.ratings.leadership / 5) * 100)}%
                      </td>
                      <td className="py-2.5 px-3 text-indigo-700 font-medium">Proactive Leadership</td>
                    </tr>
                  </tbody>
                </table>

                {/* Qualitative Notes */}
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-800">Commendations &amp; Strengths: </span>
                    <span className="text-slate-700">{selectedAppraisal.strengths}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-800">Growth Roadmap &amp; Mentorship: </span>
                    <span className="text-slate-700">{selectedAppraisal.growthAreas}</span>
                  </div>
                </div>

                {/* Sign-off section */}
                <div className="mt-8 pt-6 border-t-2 border-slate-300">
                  <div className="grid grid-cols-3 gap-8 text-center text-xs">
                    <div>
                      <div className="h-12 border-b border-dashed border-slate-400" />
                      <div className="mt-2 font-bold text-slate-800">{selectedAppraisal.employeeName}</div>
                      <div className="text-[10px] text-slate-500">Employee Acknowledgement</div>
                    </div>
                    <div>
                      <div className="h-12 border-b border-dashed border-slate-400" />
                      <div className="mt-2 font-bold text-slate-800">{selectedAppraisal.reviewer}</div>
                      <div className="text-[10px] text-slate-500">Department Reviewer</div>
                    </div>
                    <div>
                      <div className="h-12 border-b border-dashed border-slate-400" />
                      <div className="mt-2 font-bold text-slate-800">Daw Khin Thuzar</div>
                      <div className="text-[10px] text-slate-500">Head of People &amp; Culture (Certified)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
