import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Phone,
  FileText,
  Search,
  Filter,
  Download,
  Printer,
  RefreshCw,
  TrendingUp,
  Award,
  ShieldCheck,
  ChevronRight,
  Info,
  CalendarCheck,
  Building,
  Check,
  FileSpreadsheet,
} from 'lucide-react';
import { LeaveRequest, LeaveBalance, Employee, LeaveType, LeaveStatus } from '../../types';
import { translations } from '../../utils/translations';

interface LeaveViewProps {
  leaves: LeaveRequest[];
  leaveBalances: Record<string, LeaveBalance>;
  employees: Employee[];
  currentEmployeeId: string;
  onApplyLeave: (newLeave: Omit<LeaveRequest, 'id' | 'appliedDate' | 'status'>) => void;
  onReviewLeave: (leaveId: string, status: 'approved' | 'rejected', comment: string) => void;
  language: 'en' | 'my';
  onSyncFromTurso?: () => void;
  isSyncingTurso?: boolean;
}

export const LeaveView: React.FC<LeaveViewProps> = ({
  leaves,
  leaveBalances,
  employees,
  currentEmployeeId,
  onApplyLeave,
  onReviewLeave,
  language,
  onSyncFromTurso,
  isSyncingTurso = false,
}) => {
  const t = translations[language];

  // View Mode: 'applications' | 'companyReport' | 'individualDossier'
  const [activeViewMode, setActiveViewMode] = useState<'applications' | 'companyReport' | 'individualDossier'>('companyReport');

  // Selected Employee for Individual Dossier (Defaults to Ko Thant Zin if present, otherwise currentEmployeeId)
  const defaultSelectedEmpId = useMemo(() => {
    const koThantZin = employees.find((e) => e.name.toLowerCase().includes('thant zin'));
    if (koThantZin) return koThantZin.employeeId;
    return currentEmployeeId || employees[0]?.employeeId || 'NX-1002';
  }, [employees, currentEmployeeId]);

  const [dossierEmpId, setDossierEmpId] = useState<string>(defaultSelectedEmpId);

  // Modals state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [reviewModalLeave, setReviewModalLeave] = useState<LeaveRequest | null>(null);
  const [managerComment, setManagerComment] = useState('');

  // Filters for Applications Table
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState<'all' | LeaveStatus>('all');
  const [appTypeFilter, setAppTypeFilter] = useState<'all' | LeaveType>('all');

  // Filters for All Employees Balance Report
  const [reportSearch, setReportSearch] = useState('');
  const [reportDeptFilter, setReportDeptFilter] = useState<string>('all');
  const [reportUsageFilter, setReportUsageFilter] = useState<'all' | 'high' | 'moderate' | 'low'>('all');

  // Apply Form State
  const [formApplicantEmpId, setFormApplicantEmpId] = useState<string>(currentEmployeeId || employees[0]?.employeeId || 'NX-1002');
  const [formLeaveType, setFormLeaveType] = useState<LeaveType>('casual');
  const [formStartDate, setFormStartDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [formEndDate, setFormEndDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [formReason, setFormReason] = useState('');
  const [formEmergencyPhone, setFormEmergencyPhone] = useState('+95 9 791 234 567');

  // Selected Dossier Employee object
  const dossierEmployee = employees.find((e) => e.employeeId === dossierEmpId) || employees[0];

  // Helper: Get Leave Balance for an employee (falls back to sensible statutory standard)
  const getEmployeeBalance = (empId: string): LeaveBalance => {
    if (leaveBalances[empId]) {
      return leaveBalances[empId];
    }
    return {
      annualTotal: 14,
      annualUsed: 0,
      casualTotal: 6,
      casualUsed: 0,
      medicalTotal: 10,
      medicalUsed: 0,
      maternityTotal: 0,
      maternityUsed: 0,
    };
  };

  // Helper: Calculate Day Count
  const calculateDays = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return 1;
    const diffTime = Math.max(0, e.getTime() - s.getTime());
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
  };

  // Filtered Applications
  const filteredLeaves = useMemo(() => {
    return leaves.filter((l) => {
      const matchSearch =
        !appSearch ||
        l.employeeName.toLowerCase().includes(appSearch.toLowerCase()) ||
        l.employeeId.toLowerCase().includes(appSearch.toLowerCase()) ||
        l.department.toLowerCase().includes(appSearch.toLowerCase()) ||
        l.reason.toLowerCase().includes(appSearch.toLowerCase());

      const matchStatus = appStatusFilter === 'all' || l.status === appStatusFilter;
      const matchType = appTypeFilter === 'all' || l.leaveType === appTypeFilter;

      return matchSearch && matchStatus && matchType;
    });
  }, [leaves, appSearch, appStatusFilter, appTypeFilter]);

  // Unique Departments
  const departments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => {
      if (e.department) set.add(e.department);
    });
    return Array.from(set);
  }, [employees]);

  // Master Data Calculation for All Employees Report
  const allEmployeesReportData = useMemo(() => {
    return employees.map((emp) => {
      const bal = getEmployeeBalance(emp.employeeId);
      const annualRemaining = Math.max(0, bal.annualTotal - bal.annualUsed);
      const casualRemaining = Math.max(0, bal.casualTotal - bal.casualUsed);
      const medicalRemaining = Math.max(0, bal.medicalTotal - bal.medicalUsed);
      const maternityRemaining = Math.max(0, bal.maternityTotal - bal.maternityUsed);

      const totalEntitlement = bal.annualTotal + bal.casualTotal + bal.medicalTotal + (bal.maternityTotal > 0 ? bal.maternityTotal : 0);
      const totalTaken = bal.annualUsed + bal.casualUsed + bal.medicalUsed + bal.maternityUsed;
      const totalRemaining = Math.max(0, totalEntitlement - totalTaken);
      const utilizationRate = totalEntitlement > 0 ? Math.round((totalTaken / totalEntitlement) * 100) : 0;

      // Pending Leaves Count for this employee
      const empPendingCount = leaves.filter((l) => l.employeeId === emp.employeeId && l.status === 'pending').length;
      const empApprovedCount = leaves.filter((l) => l.employeeId === emp.employeeId && l.status === 'approved').length;

      return {
        employee: emp,
        balance: bal,
        annualRemaining,
        casualRemaining,
        medicalRemaining,
        maternityRemaining,
        totalEntitlement,
        totalTaken,
        totalRemaining,
        utilizationRate,
        pendingCount: empPendingCount,
        approvedCount: empApprovedCount,
      };
    });
  }, [employees, leaveBalances, leaves]);

  // Filtered Report Data
  const filteredReportData = useMemo(() => {
    return allEmployeesReportData.filter((item) => {
      const matchSearch =
        !reportSearch ||
        item.employee.name.toLowerCase().includes(reportSearch.toLowerCase()) ||
        (item.employee.nameMyanmar && item.employee.nameMyanmar.includes(reportSearch)) ||
        item.employee.employeeId.toLowerCase().includes(reportSearch.toLowerCase()) ||
        item.employee.department.toLowerCase().includes(reportSearch.toLowerCase());

      const matchDept = reportDeptFilter === 'all' || item.employee.department === reportDeptFilter;

      let matchUsage = true;
      if (reportUsageFilter === 'high') matchUsage = item.utilizationRate >= 50;
      else if (reportUsageFilter === 'moderate') matchUsage = item.utilizationRate >= 20 && item.utilizationRate < 50;
      else if (reportUsageFilter === 'low') matchUsage = item.utilizationRate < 20;

      return matchSearch && matchDept && matchUsage;
    });
  }, [allEmployeesReportData, reportSearch, reportDeptFilter, reportUsageFilter]);

  // Executive KPI Aggregations across all employees
  const executiveKPIs = useMemo(() => {
    const totalStaff = allEmployeesReportData.length;
    let totalEntitledSum = 0;
    let totalTakenSum = 0;
    let totalAnnualSum = 0;
    let totalCasualSum = 0;
    let totalMedicalSum = 0;

    allEmployeesReportData.forEach((item) => {
      totalEntitledSum += item.totalEntitlement;
      totalTakenSum += item.totalTaken;
      totalAnnualSum += item.balance.annualUsed;
      totalCasualSum += item.balance.casualUsed;
      totalMedicalSum += item.balance.medicalUsed;
    });

    const overallRate = totalEntitledSum > 0 ? Math.round((totalTakenSum / totalEntitledSum) * 100) : 0;
    const totalPendingRequests = leaves.filter((l) => l.status === 'pending').length;
    const totalApprovedRequests = leaves.filter((l) => l.status === 'approved').length;

    return {
      totalStaff,
      totalEntitledSum,
      totalTakenSum,
      totalRemainingSum: Math.max(0, totalEntitledSum - totalTakenSum),
      overallRate,
      totalAnnualSum,
      totalCasualSum,
      totalMedicalSum,
      totalPendingRequests,
      totalApprovedRequests,
    };
  }, [allEmployeesReportData, leaves]);

  // Dossier Selected Employee Leaves List
  const dossierEmployeeLeaves = useMemo(() => {
    return leaves.filter((l) => l.employeeId === dossierEmployee.employeeId);
  }, [leaves, dossierEmployee]);

  const dossierEmployeeBalance = getEmployeeBalance(dossierEmployee.employeeId);

  // Form Submit Handler
  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formReason.trim()) return;

    const applicant = employees.find((e) => e.employeeId === formApplicantEmpId) || dossierEmployee;

    onApplyLeave({
      employeeId: applicant.employeeId,
      employeeName: applicant.name,
      department: applicant.department,
      leaveType: formLeaveType,
      startDate: formStartDate,
      endDate: formEndDate,
      daysCount: calculateDays(formStartDate, formEndDate),
      reason: formReason.trim(),
      emergencyPhone: formEmergencyPhone.trim() || applicant.phone,
    });

    setIsApplyModalOpen(false);
    setFormReason('');
  };

  // Review Approvals
  const handleApprove = () => {
    if (!reviewModalLeave) return;
    onReviewLeave(
      reviewModalLeave.id,
      'approved',
      managerComment.trim() || (language === 'my' ? 'ခွင့်ပြုချက် ရရှိပါသည် (HR အတည်ပြုပြီး)' : 'Approved by HR Manager Daw Khin Thuzar')
    );
    setReviewModalLeave(null);
    setManagerComment('');
  };

  const handleReject = () => {
    if (!reviewModalLeave) return;
    onReviewLeave(
      reviewModalLeave.id,
      'rejected',
      managerComment.trim() || (language === 'my' ? 'ရုံးလုပ်ငန်း အစီအစဉ်အရ ခွင့်မပြုနိုင်ပါ' : 'Declined due to operational coverage requirements')
    );
    setReviewModalLeave(null);
    setManagerComment('');
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Employee ID',
      'Name',
      'Department',
      'Role',
      'Annual Total',
      'Annual Used',
      'Annual Left',
      'Casual Total',
      'Casual Used',
      'Casual Left',
      'Medical Total',
      'Medical Used',
      'Medical Left',
      'Maternity Total',
      'Maternity Used',
      'Maternity Left',
      'Total Entitled',
      'Total Taken',
      'Total Left',
      'Utilization %',
      'Pending Requests',
    ];

    const rows = allEmployeesReportData.map((item) => [
      item.employee.employeeId,
      `"${item.employee.name}"`,
      `"${item.employee.department}"`,
      `"${item.employee.role}"`,
      item.balance.annualTotal,
      item.balance.annualUsed,
      item.annualRemaining,
      item.balance.casualTotal,
      item.balance.casualUsed,
      item.casualRemaining,
      item.balance.medicalTotal,
      item.balance.medicalUsed,
      item.medicalRemaining,
      item.balance.maternityTotal,
      item.balance.maternityUsed,
      item.maternityRemaining,
      item.totalEntitlement,
      item.totalTaken,
      item.totalRemaining,
      `${item.utilizationRate}%`,
      item.pendingCount,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NexHR_Leave_Balance_Report_All_Employees_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Top Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-sm">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {language === 'my' ? 'ခွင့်စီမံခန့်ခွဲမှုနှင့် ခွင့်လက်ကျန် အစီရင်ခံစာ' : 'Leave Management & Entitlement Ledger'}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'my'
                  ? 'ဝန်ထမ်းအားလုံးနှင့် တစ်ဦးချင်းစီအတွက် တိကျသော ခွင့်လက်ကျန်စာရင်းနှင့် Turso Cloud တိုက်ရိုက်ချိတ်ဆက်မှု'
                  : 'Statutory leave balances, real-time approval workflow, and comprehensive entitlement reports'}
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {onSyncFromTurso && (
            <button
              onClick={onSyncFromTurso}
              disabled={isSyncingTurso}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors disabled:opacity-50"
              title="Synchronize real-time leave data with Turso Cloud SQLite database"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isSyncingTurso ? 'animate-spin' : ''}`} />
              <span>{isSyncingTurso ? 'Syncing...' : 'Sync Turso Cloud'}</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors"
            title="Download complete Leave Balance Report for all employees as CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'my' ? 'Excel / CSV ထုတ်ယူမည်' : 'Export CSV'}</span>
          </button>

          <button
            onClick={() => {
              setFormApplicantEmpId(dossierEmpId);
              setIsApplyModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'my' ? 'ခွင့်လျှောက်ထားမည်' : 'Apply for Leave'}</span>
          </button>
        </div>
      </div>

      {/* 2. Primary Module Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveViewMode('companyReport')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeViewMode === 'companyReport'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>{language === 'my' ? '၁။ ဝန်ထမ်းအားလုံး ခွင့်လက်ကျန် အစီရင်ခံစာ' : '1. All Employees Leave Balance Report'}</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-emerald-300 font-mono">
            {employees.length}
          </span>
        </button>

        <button
          onClick={() => setActiveViewMode('individualDossier')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeViewMode === 'individualDossier'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4 text-indigo-400" />
          <span>{language === 'my' ? '၂။ ဝန်ထမ်းတစ်ဦးချင်းစီ၏ ခွင့်အသေးစိတ်' : '2. Individual Employee Balance Dossier'}</span>
          {dossierEmployee && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-900/60 text-indigo-200 font-medium">
              {dossierEmployee.name}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveViewMode('applications')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeViewMode === 'applications'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-400" />
          <span>{language === 'my' ? '၃။ ခွင့်တောင်းဆိုလွှာများနှင့် ခွင့်ပြုချက်များ' : '3. Applications & Approval Ledger'}</span>
          {executiveKPIs.totalPendingRequests > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-slate-950 font-bold font-mono">
              {executiveKPIs.totalPendingRequests}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VIEW MODE 1: COMPANY-WIDE LEAVE BALANCE REPORT (ALL EMPLOYEES) */}
      {/* ========================================================================= */}
      {activeViewMode === 'companyReport' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Executive Overview KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
                Total Entitlement Pool
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-slate-900">
                {executiveKPIs.totalEntitledSum} <span className="text-xs font-sans text-slate-500">days</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                Across {executiveKPIs.totalStaff} permanent staff
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
                Total Days Taken
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-indigo-600">
                {executiveKPIs.totalTakenSum} <span className="text-xs font-sans text-slate-500">days</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                Approved leaves to date
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
                Total Days Remaining
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-emerald-600">
                {executiveKPIs.totalRemainingSum} <span className="text-xs font-sans text-slate-500">days</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                Available for staff utilization
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
                Utilization Rate
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-slate-900">
                {executiveKPIs.overallRate}%
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Healthy Work-Life Ratio</span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
                Pending HR Review
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-amber-600">
                {executiveKPIs.totalPendingRequests}
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                {executiveKPIs.totalApprovedRequests} already approved
              </div>
            </div>
          </div>

          {/* Master Table Filter Bar */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative w-full">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={reportSearch}
                    onChange={(e) => setReportSearch(e.target.value)}
                    placeholder="Search by Employee Name, ID, or Department..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-500">Department:</span>
                  <select
                    value={reportDeptFilter}
                    onChange={(e) => setReportDeptFilter(e.target.value)}
                    className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="all">All Departments</option>
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-500">Utilization:</span>
                  <select
                    value={reportUsageFilter}
                    onChange={(e) => setReportUsageFilter(e.target.value as any)}
                    className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="all">All Usage Levels</option>
                    <option value="high">High Usage (≥ 50%)</option>
                    <option value="moderate">Moderate (20% – 49%)</option>
                    <option value="low">Low Usage (&lt; 20%)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Master All Employees Balance Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {language === 'my'
                    ? 'ဝန်ထမ်းအားလုံး၏ ခွင့်လက်ကျန် အသေးစိတ် စာရင်းချုပ်'
                    : 'Master Statutory Leave Balance & Entitlement Register'}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Synchronized live with Turso Database table: <code className="font-mono text-indigo-600">leave_balances</code>
                </p>
              </div>

              <span className="text-xs text-slate-500 font-mono">
                Showing {filteredReportData.length} of {employees.length} employees
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-3 text-center">Annual Leave (14d)</th>
                    <th className="py-3 px-3 text-center">Casual Leave (6d)</th>
                    <th className="py-3 px-3 text-center">Medical Leave (10d)</th>
                    <th className="py-3 px-3 text-center">Total Entitled</th>
                    <th className="py-3 px-3 text-center">Total Taken</th>
                    <th className="py-3 px-3 text-center">Total Remaining</th>
                    <th className="py-3 px-4 text-center">Utilization</th>
                    <th className="py-3 px-4 text-center">Requests</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReportData.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-400 text-xs">
                        No employees found matching current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredReportData.map((item) => {
                      const isKoThantZin = item.employee.name.toLowerCase().includes('thant zin');
                      return (
                        <tr
                          key={item.employee.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isKoThantZin ? 'bg-indigo-50/30' : ''
                          }`}
                        >
                          {/* Employee Identity */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={item.employee.avatar}
                                alt={item.employee.name}
                                className="w-8 h-8 rounded-full object-cover border border-slate-200 bg-slate-100 shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(item.employee.name);
                                }}
                              />
                              <div>
                                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                  <span>{item.employee.name}</span>
                                  {isKoThantZin && (
                                    <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-700 rounded-md text-[10px] font-bold">
                                      Tomorrow Approved
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {item.employee.employeeId} · {item.employee.department}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Annual Leave */}
                          <td className="py-3 px-3 text-center font-mono">
                            <div className="font-bold text-slate-900">
                              {item.annualRemaining} <span className="text-[10px] text-slate-400 font-normal">left</span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {item.balance.annualUsed} / {item.balance.annualTotal}d
                            </div>
                          </td>

                          {/* Casual Leave */}
                          <td className="py-3 px-3 text-center font-mono">
                            <div className={`font-bold ${isKoThantZin ? 'text-indigo-600' : 'text-slate-900'}`}>
                              {item.casualRemaining} <span className="text-[10px] text-slate-400 font-normal">left</span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {item.balance.casualUsed} / {item.balance.casualTotal}d
                            </div>
                          </td>

                          {/* Medical Leave */}
                          <td className="py-3 px-3 text-center font-mono">
                            <div className="font-bold text-slate-900">
                              {item.medicalRemaining} <span className="text-[10px] text-slate-400 font-normal">left</span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {item.balance.medicalUsed} / {item.balance.medicalTotal}d
                            </div>
                          </td>

                          {/* Total Entitled */}
                          <td className="py-3 px-3 text-center font-mono font-medium text-slate-700">
                            {item.totalEntitlement}d
                          </td>

                          {/* Total Taken */}
                          <td className="py-3 px-3 text-center font-mono font-bold text-indigo-700">
                            {item.totalTaken}d
                          </td>

                          {/* Total Remaining */}
                          <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">
                            {item.totalRemaining}d
                          </td>

                          {/* Utilization Bar */}
                          <td className="py-3 px-4 text-center">
                            <div className="w-24 mx-auto space-y-1">
                              <div className="flex justify-between text-[10px] font-mono">
                                <span>{item.utilizationRate}%</span>
                                <span className="text-slate-400">{item.totalTaken}d</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    item.utilizationRate > 50
                                      ? 'bg-amber-500'
                                      : item.utilizationRate > 25
                                      ? 'bg-indigo-500'
                                      : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${Math.min(100, item.utilizationRate)}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Requests status */}
                          <td className="py-3 px-4 text-center">
                            {item.pendingCount > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                <Clock className="w-3 h-3" />
                                <span>{item.pendingCount} Pending</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>{item.approvedCount} Approved</span>
                              </span>
                            )}
                          </td>

                          {/* Action Button */}
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setDossierEmpId(item.employee.employeeId);
                                setActiveViewMode('individualDossier');
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                              <span>View Dossier</span>
                              <ChevronRight className="w-3.5 h-3.5" />
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 2: INDIVIDUAL EMPLOYEE BALANCE DOSSIER (EACH EMPLOYEE) */}
      {/* ========================================================================= */}
      {activeViewMode === 'individualDossier' && dossierEmployee && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Employee Selector Bar */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              <span className="font-semibold text-xs text-slate-800">
                {language === 'my' ? 'ဝန်ထမ်း ရွေးချယ်ရန်:' : 'Select Employee for Detailed Balance Audit:'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={dossierEmpId}
                onChange={(e) => setDossierEmpId(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-600"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.employeeId}>
                    {emp.name} ({emp.employeeId}) · {emp.department}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  setFormApplicantEmpId(dossierEmpId);
                  setIsApplyModalOpen(true);
                }}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Apply For {dossierEmployee.name.split(' ')[0]}</span>
              </button>
            </div>
          </div>

          {/* Dossier Employee Hero Profile Card */}
          <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <img
                src={dossierEmployee.avatar}
                alt={dossierEmployee.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-400/50 shadow-md bg-white shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(dossierEmployee.name);
                }}
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">{dossierEmployee.name}</h2>
                  {dossierEmployee.nameMyanmar && (
                    <span className="text-xs text-indigo-300 font-medium">({dossierEmployee.nameMyanmar})</span>
                  )}
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-indigo-600/60 text-white border border-indigo-500/40">
                    {dossierEmployee.employeeId}
                  </span>
                </div>
                <div className="text-xs text-slate-300">
                  {dossierEmployee.role} · <span className="text-indigo-200">{dossierEmployee.department}</span> · Reporting to {dossierEmployee.reportingManager || 'Daw Khin Thuzar'}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-3">
                  <span>Joined: {dossierEmployee.joinDate}</span>
                  <span>NRC: {dossierEmployee.nrcNumber}</span>
                  <span>Contact: {dossierEmployee.phone}</span>
                </div>
              </div>
            </div>

            {/* Total Balance Quick Gauge */}
            <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/10 flex items-center gap-4 shrink-0">
              <div className="text-center">
                <div className="text-[10px] text-slate-300 uppercase tracking-wider">Total Entitlement</div>
                <div className="text-xl font-bold font-mono text-white mt-0.5">
                  {dossierEmployeeBalance.annualTotal + dossierEmployeeBalance.casualTotal + dossierEmployeeBalance.medicalTotal}d
                </div>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <div className="text-[10px] text-amber-300 uppercase tracking-wider">Days Taken</div>
                <div className="text-xl font-bold font-mono text-amber-300 mt-0.5">
                  {dossierEmployeeBalance.annualUsed + dossierEmployeeBalance.casualUsed + dossierEmployeeBalance.medicalUsed}d
                </div>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <div className="text-[10px] text-emerald-300 uppercase tracking-wider">Remaining</div>
                <div className="text-xl font-bold font-mono text-emerald-300 mt-0.5">
                  {Math.max(
                    0,
                    dossierEmployeeBalance.annualTotal +
                      dossierEmployeeBalance.casualTotal +
                      dossierEmployeeBalance.medicalTotal -
                      (dossierEmployeeBalance.annualUsed +
                        dossierEmployeeBalance.casualUsed +
                        dossierEmployeeBalance.medicalUsed)
                  )}d
                </div>
              </div>
            </div>
          </div>

          {/* 4-Category Statutory Leave Meter Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 1. Annual Leave */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">{t.annualLeave}</span>
                <span className="text-[10px] font-mono text-slate-400">Section 4 (1951 Act)</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-indigo-700">
                  {Math.max(0, dossierEmployeeBalance.annualTotal - dossierEmployeeBalance.annualUsed)}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  / {dossierEmployeeBalance.annualTotal} days remaining
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      (dossierEmployeeBalance.annualUsed / dossierEmployeeBalance.annualTotal) * 100
                    )}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>{dossierEmployeeBalance.annualUsed} days taken</span>
                <span>Carryover max 3d</span>
              </div>
            </div>

            {/* 2. Casual Leave */}
            <div className={`p-4 bg-white rounded-xl border shadow-xs space-y-3 ${
              dossierEmployee.name.toLowerCase().includes('thant zin') ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">{t.casualLeave}</span>
                <span className="text-[10px] font-mono text-slate-400">Section 5 (6d Paid)</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-emerald-700">
                  {Math.max(0, dossierEmployeeBalance.casualTotal - dossierEmployeeBalance.casualUsed)}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  / {dossierEmployeeBalance.casualTotal} days remaining
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      (dossierEmployeeBalance.casualUsed / dossierEmployeeBalance.casualTotal) * 100
                    )}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span className="font-semibold text-indigo-700">
                  {dossierEmployeeBalance.casualUsed} days taken
                  {dossierEmployee.name.toLowerCase().includes('thant zin') && ' (incl. Tomorrow)'}
                </span>
                <span>Max 3 consecutive</span>
              </div>
            </div>

            {/* 3. Medical Leave */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">{t.medicalLeave}</span>
                <span className="text-[10px] font-mono text-slate-400">Section 6 (10d Paid)</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-blue-700">
                  {Math.max(0, dossierEmployeeBalance.medicalTotal - dossierEmployeeBalance.medicalUsed)}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  / {dossierEmployeeBalance.medicalTotal} days remaining
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      (dossierEmployeeBalance.medicalUsed / dossierEmployeeBalance.medicalTotal) * 100
                    )}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>{dossierEmployeeBalance.medicalUsed} days taken</span>
                <span>SSB Clinic Slip req.</span>
              </div>
            </div>

            {/* 4. Maternity/Paternity */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">{t.maternityLeave}</span>
                <span className="text-[10px] font-mono text-slate-400">SSB 2012 Law</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-purple-700">
                  {Math.max(0, dossierEmployeeBalance.maternityTotal - dossierEmployeeBalance.maternityUsed)}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  / {dossierEmployeeBalance.maternityTotal} days
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${
                      dossierEmployeeBalance.maternityTotal > 0
                        ? Math.min(
                            100,
                            (dossierEmployeeBalance.maternityUsed / dossierEmployeeBalance.maternityTotal) * 100
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>{dossierEmployeeBalance.maternityUsed} days taken</span>
                <span>84d standard</span>
              </div>
            </div>
          </div>

          {/* Dossier Employee History Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Leave Application History for {dossierEmployee.name} ({dossierEmployee.employeeId})
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Complete historical log of approved, upcoming, and pending leaves for this profile
                </p>
              </div>

              <span className="text-xs text-slate-500 font-mono">
                {dossierEmployeeLeaves.length} record{dossierEmployeeLeaves.length !== 1 ? 's' : ''} on file
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                    <th className="py-3 px-4">Leave Type</th>
                    <th className="py-3 px-4">Duration & Dates</th>
                    <th className="py-3 px-3 text-center">Days</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Emergency Phone</th>
                    <th className="py-3 px-4">Review Status</th>
                    <th className="py-3 px-4">Remarks & Approver</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dossierEmployeeLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                        No leave requests submitted by this employee yet.
                      </td>
                    </tr>
                  ) : (
                    dossierEmployeeLeaves.map((leave) => {
                      const isTomorrow = leave.startDate === '2026-10-09';
                      return (
                        <tr
                          key={leave.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isTomorrow ? 'bg-emerald-50/40' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4 font-semibold text-slate-900 capitalize flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-indigo-500" />
                            <span>{leave.leaveType} Leave</span>
                            {isTomorrow && (
                              <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                Tomorrow (Approved)
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 font-mono text-slate-700">
                            {leave.startDate} → {leave.endDate}
                          </td>

                          <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-900">
                            {leave.daysCount} d
                          </td>

                          <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate">
                            "{leave.reason}"
                          </td>

                          <td className="py-3.5 px-4 font-mono text-slate-500">
                            {leave.emergencyPhone}
                          </td>

                          <td className="py-3.5 px-4">
                            {leave.status === 'approved' ? (
                              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                                <CheckCircle className="w-3 h-3" />
                                <span>Approved</span>
                              </span>
                            ) : leave.status === 'rejected' ? (
                              <span className="inline-flex items-center gap-1 font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md text-[11px]">
                                <XCircle className="w-3 h-3" />
                                <span>Rejected</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md text-[11px]">
                                <Clock className="w-3 h-3" />
                                <span>Pending</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                            {leave.reviewedBy ? (
                              <div>
                                <span className="font-medium text-slate-800">{leave.reviewedBy}</span>
                                {leave.managerComment && (
                                  <div className="text-slate-500 italic text-[10px]">
                                    "{leave.managerComment}"
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400">Pending HR Action</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 3: LEAVE APPLICATIONS & APPROVALS LEDGER */}
      {/* ========================================================================= */}
      {activeViewMode === 'applications' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Top Quick Status Metric Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium">Total Applications</div>
              <div className="mt-1 text-xl font-bold font-mono text-slate-900">{leaves.length}</div>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs">
              <div className="text-[11px] text-amber-700 font-medium">Pending Review</div>
              <div className="mt-1 text-xl font-bold font-mono text-amber-700">{executiveKPIs.totalPendingRequests}</div>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
              <div className="text-[11px] text-emerald-700 font-medium">Approved Leaves</div>
              <div className="mt-1 text-xl font-bold font-mono text-emerald-700">{executiveKPIs.totalApprovedRequests}</div>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium">Rejected / Cancelled</div>
              <div className="mt-1 text-xl font-bold font-mono text-slate-500">
                {leaves.filter((l) => l.status === 'rejected').length}
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={appSearch}
                onChange={(e) => setAppSearch(e.target.value)}
                placeholder="Search applications by employee, reason, or date..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={appStatusFilter}
                onChange={(e) => setAppStatusFilter(e.target.value as any)}
                className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={appTypeFilter}
                onChange={(e) => setAppTypeFilter(e.target.value as any)}
                className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <option value="all">All Leave Types</option>
                <option value="annual">Annual Leave</option>
                <option value="casual">Casual Leave</option>
                <option value="medical">Medical Leave</option>
                <option value="maternity">Maternity Leave</option>
                <option value="unpaid">Unpaid Leave</option>
              </select>
            </div>
          </div>

          {/* Applications Ledger Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900">
                {language === 'my'
                  ? 'ခွင့်လျှောက်ထားမှု မှတ်တမ်းနှင့် ခွင့်ပြုချက်များ'
                  : 'Leave Applications & Approvals Ledger'}
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                {filteredLeaves.length} record{filteredLeaves.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Leave Type</th>
                    <th className="py-3 px-4">Duration &amp; Dates</th>
                    <th className="py-3 px-3 text-center">Days</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">HR Approver &amp; Comment</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                        No leave records found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredLeaves.map((leave) => {
                      const isTomorrow = leave.startDate === '2026-10-09';
                      return (
                        <tr
                          key={leave.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isTomorrow && leave.status === 'approved' ? 'bg-emerald-50/30' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <span>{leave.employeeName}</span>
                              {leave.employeeName.toLowerCase().includes('thant zin') && isTomorrow && (
                                <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-bold">
                                  Approved for Tomorrow
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {leave.employeeId} · {leave.department}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-medium text-slate-800 capitalize">
                              {leave.leaveType}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-mono text-slate-700">
                            {leave.startDate} → {leave.endDate}
                          </td>

                          <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-900">
                            {leave.daysCount} d
                          </td>

                          <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                            "{leave.reason}"
                          </td>

                          <td className="py-3.5 px-4">
                            {leave.status === 'approved' ? (
                              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                                <CheckCircle className="w-3 h-3" />
                                <span>Approved</span>
                              </span>
                            ) : leave.status === 'rejected' ? (
                              <span className="inline-flex items-center gap-1 font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md text-[11px]">
                                <XCircle className="w-3 h-3" />
                                <span>Rejected</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md text-[11px]">
                                <Clock className="w-3 h-3" />
                                <span>Pending</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                            {leave.reviewedBy ? (
                              <div>
                                <span className="font-medium text-slate-800">{leave.reviewedBy}</span>
                                {leave.managerComment && (
                                  <div className="text-slate-500 italic text-[10px]">
                                    "{leave.managerComment}"
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400">Awaiting HR Review</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            {leave.status === 'pending' ? (
                              <button
                                onClick={() => setReviewModalLeave(leave)}
                                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                              >
                                Review &amp; Approve
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setDossierEmpId(leave.employeeId);
                                  setActiveViewMode('individualDossier');
                                }}
                                className="text-[11px] text-slate-400 hover:text-indigo-600 font-medium"
                              >
                                View Balance
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: APPLY FOR LEAVE */}
      {/* ========================================================================= */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">{t.applyLeave}</h3>
              </div>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="p-6 space-y-4 text-xs">
              {/* Applicant Selector */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Applicant Employee Profile *
                </label>
                <select
                  value={formApplicantEmpId}
                  onChange={(e) => setFormApplicantEmpId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-xs"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.employeeId}>
                      {emp.name} ({emp.employeeId}) · {emp.department}
                    </option>
                  ))}
                </select>
              </div>

              {/* Leave Category */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700">
                    Leave Category *
                  </label>
                  {(() => {
                    const b = getEmployeeBalance(formApplicantEmpId);
                    if (formLeaveType === 'annual') return <span className="text-[10px] text-indigo-600 font-mono">{b.annualTotal - b.annualUsed}d remaining</span>;
                    if (formLeaveType === 'casual') return <span className="text-[10px] text-emerald-600 font-mono">{b.casualTotal - b.casualUsed}d remaining</span>;
                    if (formLeaveType === 'medical') return <span className="text-[10px] text-blue-600 font-mono">{b.medicalTotal - b.medicalUsed}d remaining</span>;
                    return null;
                  })()}
                </div>
                <select
                  value={formLeaveType}
                  onChange={(e) => setFormLeaveType(e.target.value as LeaveType)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-xs"
                >
                  <option value="casual">{t.casualLeave} (6 days max statutory)</option>
                  <option value="annual">{t.annualLeave} (14 days max statutory)</option>
                  <option value="medical">{t.medicalLeave} (10 days max with SSB)</option>
                  <option value="maternity">{t.maternityLeave} (84 days max)</option>
                  <option value="unpaid">{t.unpaidLeave}</option>
                </select>
              </div>

              {/* Date Pickers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formEndDate}
                    min={formStartDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs"
                  />
                </div>
              </div>

              {/* Duration calculation banner */}
              <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-between text-indigo-900 font-mono text-xs">
                <span>Total Days Requested:</span>
                <span className="font-bold text-indigo-700">{calculateDays(formStartDate, formEndDate)} Day(s)</span>
              </div>

              {/* Reason */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Reason for Absence *
                </label>
                <div className="flex flex-wrap gap-1 pb-1">
                  {['Family Case', 'Medical Appointment', 'Personal Urgent Matter', 'Annual Holiday'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFormReason(preset)}
                      className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 hover:bg-slate-200"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
                <textarea
                  required
                  rows={2}
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  placeholder="Provide reason for absence..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              {/* Emergency Phone */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Emergency Contact Phone Number
                </label>
                <input
                  type="text"
                  value={formEmergencyPhone}
                  onChange={(e) => setFormEmergencyPhone(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  Submit Application &amp; Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REVIEW / APPROVE LEAVE APPLICATION */}
      {/* ========================================================================= */}
      {reviewModalLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                Review Leave Application
              </h3>
              <button
                onClick={() => setReviewModalLeave(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Applicant:</span>
                  <span className="font-bold text-slate-800">
                    {reviewModalLeave.employeeName} ({reviewModalLeave.employeeId})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Department:</span>
                  <span className="text-slate-700 font-medium">{reviewModalLeave.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Category &amp; Duration:</span>
                  <span className="font-medium text-slate-800 capitalize">
                    {reviewModalLeave.leaveType} · {reviewModalLeave.daysCount} Day(s)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Dates:</span>
                  <span className="font-mono text-slate-800">
                    {reviewModalLeave.startDate} to {reviewModalLeave.endDate}
                  </span>
                </div>
                <div className="pt-1.5 border-t border-slate-200 text-slate-700 italic">
                  "{reviewModalLeave.reason}"
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Manager / HR Decision Remarks
                </label>
                <textarea
                  rows={2}
                  value={managerComment}
                  onChange={(e) => setManagerComment(e.target.value)}
                  placeholder="e.g. Approved. Enjoy your time off!"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px] text-indigo-800 flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  Approving will automatically update the Turso Cloud Database (<code className="font-mono">leave_requests</code> and <code className="font-mono">leave_balances</code> tables) and notify the employee via email.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleReject}
                  className="px-4 py-2 font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                >
                  {t.rejectLeave}
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  className="px-4 py-2 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
                >
                  {t.approveLeave}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
