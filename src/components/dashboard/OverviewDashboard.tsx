import React from 'react';
import {
  Users,
  Clock,
  Calendar,
  Briefcase,
  DollarSign,
  Fingerprint,
  ChevronRight,
  TrendingUp,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  PlusCircle,
  Settings,
} from 'lucide-react';
import {
  Employee,
  AttendanceRecord,
  LeaveRequest,
  RecruitmentJob,
  PayrollRecord,
} from '../../types';
import { translations, formatMMK } from '../../utils/translations';

interface OverviewDashboardProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  jobs: RecruitmentJob[];
  payroll: PayrollRecord[];
  onNavigateTab: (tab: string) => void;
  onOpenBiometric: () => void;
  language: 'en' | 'my';
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  employees,
  attendance,
  leaves,
  jobs,
  payroll,
  onNavigateTab,
  onOpenBiometric,
  language,
}) => {
  const t = translations[language];

  // Computations
  const totalEmployees = employees.length;
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter((a) => a.date === todayDateStr);
  const presentCount = todayAttendance.filter((a) => a.status === 'present' || a.status === 'late').length;
  const attendanceRate = totalEmployees > 0 ? Math.round((presentCount / totalEmployees) * 100) : 0;
  const pendingLeavesCount = leaves.filter((l) => l.status === 'pending').length;
  const activeJobsCount = jobs.filter((j) => j.status === 'active').length;
  const totalPayrollBudget = payroll.reduce((acc, curr) => acc + curr.netPayMMK, 0);

  return (
    <div className="space-y-8">
      {/* Editorial Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {language === 'my' ? 'HR စီမံခန့်ခွဲမှု ခြုံငုံသုံးသပ်ချက်' : 'Executive HR Operations Overview'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'my'
              ? 'ဝန်ထမ်းအင်အား၊ ဇီဝမက်ထရစ်ရုံးတက်မှတ်တမ်း၊ ခွင့်တောင်းခံမှုနှင့် လစာငွေစာရင်း အကျဉ်းချုပ်'
              : 'Real-time workforce intelligence, biometric attendance terminal, and active human capital metrics.'}
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenBiometric}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            <Fingerprint className="w-4 h-4" />
            <span>{t.scanBiometric}</span>
          </button>
          <button
            onClick={() => onNavigateTab('payroll')}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors"
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>{t.processPayroll}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row (Zero-pill, high density, tabular numerals) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Metric 1: Headcount */}
        <div
          onClick={() => onNavigateTab('employees')}
          className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t.activeEmployees}</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
            {totalEmployees}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
            <span>4 Departments</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-600 font-medium">+1 new this week</span>
          </div>
        </div>

        {/* Metric 2: Today Attendance Rate */}
        <div
          onClick={() => onNavigateTab('attendance')}
          className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t.todayPresent}</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
            {attendanceRate}%
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
            <span>{presentCount} of {totalEmployees} present</span>
            <span aria-hidden="true">·</span>
            <span>Biometric live</span>
          </div>
        </div>

        {/* Metric 3: Pending Leaves */}
        <div
          onClick={() => onNavigateTab('leave')}
          className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t.pendingLeaves}</span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
            {pendingLeavesCount}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className={pendingLeavesCount > 0 ? 'text-amber-600 font-medium' : 'text-slate-500'}>
              {pendingLeavesCount > 0 ? 'Needs review' : 'All clear'}
            </span>
            <span aria-hidden="true">·</span>
            <span>Leave workflow</span>
          </div>
        </div>

        {/* Metric 4: Open Job Openings */}
        <div
          onClick={() => onNavigateTab('recruitment')}
          className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t.openJobs}</span>
            <Briefcase className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
            {activeJobsCount}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
            <span>51 applicants</span>
            <span aria-hidden="true">·</span>
            <span>Talent pool</span>
          </div>
        </div>

        {/* Metric 5: Payroll Budget */}
        <div
          onClick={() => onNavigateTab('payroll')}
          className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t.payrollBudget}</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
            {formatMMK(totalPayrollBudget)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="text-emerald-600 font-medium">Disbursed</span>
            <span aria-hidden="true">·</span>
            <span>4 Payslips</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Live Attendance & Biometric Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-semibold text-slate-900">
                  {t.liveAttendance}
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('attendance')}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>{language === 'my' ? 'မှတ်တမ်းအပြည့်အစုံ' : 'View Full Logs'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {todayAttendance.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  {language === 'my'
                    ? 'ယနေ့အတွက် ဇီဝမက်ထရစ် ရုံးတက်မှတ်တမ်း မရှိသေးပါ။'
                    : 'No attendance records clocked in today.'}
                </div>
              ) : (
                todayAttendance.map((rec) => (
                  <div
                    key={rec.id}
                    className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/60 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                        {rec.method === 'fingerprint' ? (
                          <Fingerprint className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Eye className="w-4 h-4 text-cyan-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">
                          {rec.employeeName}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                          <span>{rec.department}</span>
                          <span aria-hidden="true">·</span>
                          <span className="capitalize">{rec.method.replace('_', ' ')}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{rec.biometricConfidence}% confidence</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-medium text-slate-900 tabular-nums">
                        {rec.clockInTime}
                      </div>
                      <div className="text-[11px] font-medium mt-0.5">
                        {rec.status === 'present' ? (
                          <span className="text-emerald-600">On Time</span>
                        ) : rec.status === 'late' ? (
                          <span className="text-amber-600">Late</span>
                        ) : (
                          <span className="text-slate-500">{rec.status}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Shortcuts & Fast Execution Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-xs font-semibold text-slate-900 mb-3 uppercase tracking-wider">
              {t.quickActions}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <button
                onClick={onOpenBiometric}
                className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/20 text-center transition-all group"
              >
                <Fingerprint className="w-5 h-5 text-indigo-600 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-slate-800">
                  {language === 'my' ? 'လက်ဗွေ/မျက်လုံး' : 'Terminal Scan'}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Clock In/Out</span>
              </button>

              <button
                onClick={() => onNavigateTab('recruitment')}
                className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/20 text-center transition-all group"
              >
                <PlusCircle className="w-5 h-5 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-slate-800">
                  {language === 'my' ? 'အလုပ်ခေါ်ယူမည်' : 'Post Job'}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">ATS Pipeline</span>
              </button>

              <button
                onClick={() => onNavigateTab('leave')}
                className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/20 text-center transition-all group"
              >
                <Calendar className="w-5 h-5 text-amber-600 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-slate-800">
                  {language === 'my' ? 'ခွင့်စိစစ်မည်' : 'Review Leaves'}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">{pendingLeavesCount} Pending</span>
              </button>

              <button
                onClick={() => onNavigateTab('appraisal')}
                className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/20 text-center transition-all group"
              >
                <TrendingUp className="w-5 h-5 text-purple-600 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-slate-800">
                  {language === 'my' ? 'စွမ်းဆောင်ရည်' : 'Appraisal'}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Q3 Review</span>
              </button>

              <button
                onClick={() => onNavigateTab('setup')}
                className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/20 text-center transition-all group col-span-2 sm:col-span-1"
              >
                <Settings className="w-5 h-5 text-slate-700 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-slate-800">
                  {language === 'my' ? 'အခြေခံသတ်မှတ်' : 'Setup Menu'}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Policies &amp; Master</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Pending Approvals & Recruitment Highlights */}
        <div className="space-y-6">
          {/* Pending Leaves Mini Queue */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-900">
                {t.pendingLeaves}
              </h3>
              <button
                onClick={() => onNavigateTab('leave')}
                className="text-xs text-indigo-600 hover:underline font-medium"
              >
                {language === 'my' ? 'အားလုံးကြည့်' : 'Manage'}
              </button>
            </div>

            <div className="space-y-3">
              {leaves
                .filter((l) => l.status === 'pending')
                .slice(0, 3)
                .map((leave) => (
                  <div
                    key={leave.id}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">
                        {leave.employeeName}
                      </span>
                      <span className="text-amber-600 font-medium capitalize">
                        {leave.leaveType} ({leave.daysCount}d)
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] line-clamp-1">
                      {leave.reason}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{leave.startDate} to {leave.endDate}</span>
                      <button
                        onClick={() => onNavigateTab('leave')}
                        className="text-indigo-600 hover:underline font-medium"
                      >
                        Action &rarr;
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Active Job Postings Mini List */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-900">
                {t.openJobs}
              </h3>
              <button
                onClick={() => onNavigateTab('recruitment')}
                className="text-xs text-indigo-600 hover:underline font-medium"
              >
                {language === 'my' ? 'စီမံမည်' : 'View ATS'}
              </button>
            </div>

            <div className="space-y-3">
              {jobs.slice(0, 3).map((job) => (
                <div
                  key={job.id}
                  onClick={() => onNavigateTab('recruitment')}
                  className="p-3 rounded-lg hover:bg-slate-50 border border-slate-100 cursor-pointer transition-colors text-xs"
                >
                  <div className="font-semibold text-slate-900">
                    {job.title}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span>{job.department}</span>
                    <span aria-hidden="true">·</span>
                    <span>{job.type}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium text-indigo-600">{job.applicantsCount} applicants</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
