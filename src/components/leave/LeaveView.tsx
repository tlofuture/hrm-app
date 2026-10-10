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
  FileImage,
  X,
} from 'lucide-react';
import { LeaveRequest, LeaveBalance, Employee, LeaveType, LeaveStatus, LeaveSetupItem } from '../../types';
import { translations } from '../../utils/translations';
import { StorageService } from '../../utils/storage';

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
  leaveSetupList?: LeaveSetupItem[];
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
  leaveSetupList,
}) => {
  const t = translations[language];

  // Dynamically obtain entitlement days & policies from "Statutory & Corporate Leave Policies" (Setup & Settings)
  const activeLeavePolicies = useMemo(() => {
    if (leaveSetupList && leaveSetupList.length > 0) {
      return leaveSetupList;
    }
    return StorageService.getLeaveSetup();
  }, [leaveSetupList]);

  const annualPolicy = activeLeavePolicies.find((p) => p.leaveType === 'annual');
  const casualPolicy = activeLeavePolicies.find((p) => p.leaveType === 'casual');
  const medicalPolicy = activeLeavePolicies.find((p) => p.leaveType === 'medical');
  const maternityPolicy = activeLeavePolicies.find((p) => p.leaveType === 'maternity');
  const paternityPolicy = activeLeavePolicies.find((p) => p.leaveType === 'paternity');
  const unpaidPolicy = activeLeavePolicies.find((p) => p.leaveType === 'unpaid');

  // Policy default days from Statutory & Corporate Leave Policies (Setup & Settings)
  const annualDays = annualPolicy ? annualPolicy.defaultDays : 10;
  const casualDays = casualPolicy ? casualPolicy.defaultDays : 6;
  const medicalDays = medicalPolicy ? medicalPolicy.defaultDays : 10;
  const maternityDays = maternityPolicy ? maternityPolicy.defaultDays : 84;
  const paternityDays = paternityPolicy ? paternityPolicy.defaultDays : 15;
  const unpaidDays = unpaidPolicy ? unpaidPolicy.defaultDays : 30;

  // Two Primary Tabs: 1. All Employee | 2. Individual Employee
  const [activeTab, setActiveTab] = useState<'allEmployees' | 'individualEmployee'>('allEmployees');

  // Status Filter Tabs: 'all' | 'approved' | 'pending' | 'rejected' (3. Approved, 4. Pending, 5. Reject)
  const [statusTab, setStatusTab] = useState<'all' | LeaveStatus>('all');

  // Search by Search Box
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Employee for Individual Dossier (Defaults to current employee or first employee, NO hardcoded name in tab)
  const defaultSelectedEmpId = useMemo(() => {
    return currentEmployeeId || employees[0]?.employeeId || 'NX-1002';
  }, [employees, currentEmployeeId]);

  const [dossierEmpId, setDossierEmpId] = useState<string>(defaultSelectedEmpId);

  // Modals state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [reviewModalLeave, setReviewModalLeave] = useState<LeaveRequest | null>(null);
  const [managerComment, setManagerComment] = useState('');

  // A4 Windows Print Preview Modal State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printReportType, setPrintReportType] = useState<'all-summary' | 'all-detailed' | 'individual-detailed'>('all-summary');
  const [printSelectedEmpId, setPrintSelectedEmpId] = useState<string>(dossierEmpId || employees[0]?.employeeId || 'NX-1002');
  const [printScope, setPrintScope] = useState<'all' | 'individual'>('all');
  const [printOrientation, setPrintOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [printStatusNotice, setPrintStatusNotice] = useState<string | null>(null);

  // Additional Filters for Applications & Balance Tables
  const [appTypeFilter, setAppTypeFilter] = useState<'all' | LeaveType>('all');
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

  // Helper: Get Leave Balance for an employee (dynamically calibrated with Statutory & Corporate Leave Policies from Setup & Settings)
  const getEmployeeBalance = (empId: string): LeaveBalance => {
    const raw = leaveBalances[empId];
    if (raw) {
      return {
        ...raw,
        annualTotal: annualDays,
        casualTotal: casualDays,
        medicalTotal: medicalDays,
        maternityTotal: raw.maternityTotal > 0 ? maternityDays : 0,
      };
    }
    return {
      annualTotal: annualDays,
      annualUsed: 0,
      casualTotal: casualDays,
      casualUsed: 0,
      medicalTotal: medicalDays,
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

  // Filtered Applications for All Employees Ledger
  const filteredLeaves = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return leaves.filter((l) => {
      const matchSearch =
        !q ||
        l.employeeName.toLowerCase().includes(q) ||
        l.employeeId.toLowerCase().includes(q) ||
        l.department.toLowerCase().includes(q) ||
        l.reason.toLowerCase().includes(q) ||
        l.startDate.includes(q) ||
        l.endDate.includes(q);

      const matchStatus = statusTab === 'all' || l.status === statusTab;
      const matchType = appTypeFilter === 'all' || l.leaveType === appTypeFilter;

      return matchSearch && matchStatus && matchType;
    });
  }, [leaves, searchQuery, statusTab, appTypeFilter]);

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
      const empApprovedLeaves = leaves.filter((l) => l.employeeId === emp.employeeId && l.status === 'approved');

      const annualRemaining = Math.max(0, annualDays - bal.annualUsed);
      const casualRemaining = Math.max(0, casualDays - bal.casualUsed);
      const medicalRemaining = Math.max(0, medicalDays - bal.medicalUsed);

      const maternityApprovedDays = empApprovedLeaves
        .filter((l) => l.leaveType === 'maternity')
        .reduce((sum, l) => sum + l.daysCount, 0);
      const maternityUsed = Math.max(bal.maternityUsed || 0, maternityApprovedDays);
      const maternityRemaining = Math.max(0, maternityDays - maternityUsed);

      const paternityApprovedDays = empApprovedLeaves
        .filter((l) => l.leaveType === 'paternity')
        .reduce((sum, l) => sum + l.daysCount, 0);
      const paternityUsed = paternityApprovedDays;
      const paternityRemaining = Math.max(0, paternityDays - paternityUsed);

      const unpaidApprovedDays = empApprovedLeaves
        .filter((l) => l.leaveType === 'unpaid')
        .reduce((sum, l) => sum + l.daysCount, 0);
      const unpaidUsed = unpaidApprovedDays;
      const unpaidRemaining = Math.max(0, unpaidDays - unpaidUsed);

      const totalEntitlement = bal.annualTotal + bal.casualTotal + bal.medicalTotal + (bal.maternityTotal > 0 ? bal.maternityTotal : 0);
      const totalTaken = bal.annualUsed + bal.casualUsed + bal.medicalUsed + bal.maternityUsed;
      const totalRemaining = Math.max(0, totalEntitlement - totalTaken);
      const utilizationRate = totalEntitlement > 0 ? Math.round((totalTaken / totalEntitlement) * 100) : 0;

      // Pending Leaves Count for this employee
      const empPendingCount = leaves.filter((l) => l.employeeId === emp.employeeId && l.status === 'pending').length;
      const empApprovedCount = empApprovedLeaves.length;

      return {
        employee: emp,
        balance: bal,
        annualRemaining,
        casualRemaining,
        medicalRemaining,
        maternityUsed,
        maternityRemaining,
        paternityUsed,
        paternityRemaining,
        unpaidUsed,
        unpaidRemaining,
        totalEntitlement,
        totalTaken,
        totalRemaining,
        utilizationRate,
        pendingCount: empPendingCount,
        approvedCount: empApprovedCount,
      };
    });
  }, [employees, leaveBalances, leaves, annualDays, casualDays, medicalDays, maternityDays, paternityDays, unpaidDays]);

  // Filtered Report Data
  const filteredReportData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allEmployeesReportData.filter((item) => {
      const matchSearch =
        !q ||
        item.employee.name.toLowerCase().includes(q) ||
        (item.employee.nameMyanmar && item.employee.nameMyanmar.toLowerCase().includes(q)) ||
        item.employee.employeeId.toLowerCase().includes(q) ||
        item.employee.department.toLowerCase().includes(q);

      const matchDept = reportDeptFilter === 'all' || item.employee.department === reportDeptFilter;

      let matchUsage = true;
      if (reportUsageFilter === 'high') matchUsage = item.utilizationRate >= 50;
      else if (reportUsageFilter === 'moderate') matchUsage = item.utilizationRate >= 20 && item.utilizationRate < 50;
      else if (reportUsageFilter === 'low') matchUsage = item.utilizationRate < 20;

      // Status Filter matching on employee balances
      let matchStatus = true;
      if (statusTab === 'pending') {
        matchStatus = item.pendingCount > 0;
      } else if (statusTab === 'approved') {
        matchStatus = item.approvedCount > 0;
      } else if (statusTab === 'rejected') {
        const empRejectedCount = leaves.filter((l) => l.employeeId === item.employee.employeeId && l.status === 'rejected').length;
        matchStatus = empRejectedCount > 0;
      }

      return matchSearch && matchDept && matchUsage && matchStatus;
    });
  }, [allEmployeesReportData, searchQuery, reportDeptFilter, reportUsageFilter, statusTab, leaves]);

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

  // Filtered Dossier Leaves by statusTab and searchQuery
  const filteredDossierLeaves = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return dossierEmployeeLeaves.filter((l) => {
      const matchSearch =
        !q ||
        l.reason.toLowerCase().includes(q) ||
        l.startDate.includes(q) ||
        l.endDate.includes(q) ||
        l.leaveType.toLowerCase().includes(q);

      const matchStatus = statusTab === 'all' || l.status === statusTab;

      return matchSearch && matchStatus;
    });
  }, [dossierEmployeeLeaves, searchQuery, statusTab]);

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

  // Selected Print Employee for Individual Detailed Dossier
  const printEmployee = useMemo(() => {
    return employees.find((e) => e.employeeId === printSelectedEmpId) || dossierEmployee || employees[0];
  }, [employees, printSelectedEmpId, dossierEmployee]);

  const printEmployeeBalance = useMemo(() => {
    return getEmployeeBalance(printEmployee.employeeId);
  }, [printEmployee]);

  const printEmployeeLeaves = useMemo(() => {
    return leaves.filter((l) => l.employeeId === printEmployee.employeeId);
  }, [leaves, printEmployee]);

  // Generate comprehensive A4 Printable HTML for:
  // 1. 'all-summary': All Employees Leave Balance Summary (A4 Landscape, matching PNG format)
  // 2. 'all-detailed': All Employees Detailed Leave Report include date (A4 Landscape)
  // 3. 'individual-detailed': Each Employee Detailed Leave Report include date & balances (A4 Portrait)
  const generateA4PrintHTML = (
    reportType: 'all-summary' | 'all-detailed' | 'individual-detailed' = printReportType,
    targetEmpId: string = printSelectedEmpId
  ) => {
    const isLandscape = reportType !== 'individual-detailed';
    const targetEmp = employees.find((e) => e.employeeId === targetEmpId) || printEmployee;
    const targetBal = getEmployeeBalance(targetEmp.employeeId);
    const targetLeaves = leaves.filter((l) => l.employeeId === targetEmp.employeeId);

    const targetMaternityUsed = targetBal.maternityUsed || targetLeaves.filter((l) => l.leaveType === 'maternity' && l.status === 'approved').reduce((s, l) => s + l.daysCount, 0);
    const targetMaternityRemaining = Math.max(0, maternityDays - targetMaternityUsed);
    const targetPaternityUsed = targetLeaves.filter((l) => l.leaveType === 'paternity' && l.status === 'approved').reduce((s, l) => s + l.daysCount, 0);
    const targetPaternityRemaining = Math.max(0, paternityDays - targetPaternityUsed);
    const targetUnpaidUsed = targetLeaves.filter((l) => l.leaveType === 'unpaid' && l.status === 'approved').reduce((s, l) => s + l.daysCount, 0);
    const targetUnpaidRemaining = Math.max(0, unpaidDays - targetUnpaidUsed);

    const reportTitle =
      reportType === 'all-summary'
        ? 'All Employees Leave Balance Summary'
        : reportType === 'all-detailed'
        ? 'All Employees Detailed Leave Applications & Dates Audit Report'
        : `Individual Employee Leave Dossier & Statement — ${targetEmp.name} (${targetEmp.employeeId})`;

    const reportSubtitle =
      reportType === 'all-summary'
        ? 'NexHR Enterprise · Statutory Leave Entitlement & Balance Register'
        : reportType === 'all-detailed'
        ? 'NexHR Enterprise · Complete Statutory Leave Register With Detailed Dates & Approvals'
        : 'NexHR Enterprise · Comprehensive Statutory Leave Ledger, Balance Audit & Historical Date Log';

    const pageOrientation = isLandscape ? 'A4 landscape' : 'A4 portrait';

    // 1. Body for All Employees Leave Balance Summary (16 columns matching PNG)
    const summaryTableHTML = `
      <table border="1">
        <thead>
          <tr>
            <th rowspan="2" style="vertical-align: middle; padding: 6px 8px; text-align: left;">Employee ID</th>
            <th rowspan="2" style="vertical-align: middle; padding: 6px 8px; text-align: left;">Name</th>
            <th rowspan="2" style="vertical-align: middle; padding: 6px 8px; text-align: left;">Department</th>
            <th rowspan="2" style="vertical-align: middle; padding: 6px 8px; text-align: left;">Role</th>
            <th colspan="2" class="text-center" style="padding: 6px 4px;">Annual (${annualDays}d)</th>
            <th colspan="2" class="text-center" style="padding: 6px 4px;">Casual (${casualDays}d)</th>
            <th colspan="2" class="text-center" style="padding: 6px 4px;">Medical (${medicalDays}d)</th>
            <th colspan="2" class="text-center" style="padding: 6px 4px;">Statutory Maternity(${maternityDays}d)</th>
            <th colspan="2" class="text-center" style="padding: 6px 4px;">Paternity Support (${paternityDays}d)</th>
            <th colspan="2" class="text-center" style="padding: 6px 4px;">Unpaid (${unpaidDays}d)</th>
          </tr>
          <tr>
            <th class="text-center" style="padding: 4px 6px; font-size: 7.5pt;">Used</th>
            <th class="text-center" style="padding: 4px 6px; font-size: 7.5pt;">Left</th>
            <th class="text-center" style="padding: 4px 6px; font-size: 7.5pt;">Used</th>
            <th class="text-center" style="padding: 4px 6px; font-size: 7.5pt;">Left</th>
            <th class="text-center" style="padding: 4px 6px; font-size: 7.5pt;">Used</th>
            <th class="text-center" style="padding: 4px 6px; font-size: 7.5pt;">Left</th>
            <th class="text-center" style="padding: 4px 6px; font-size: 7.5pt;">Used</th>
            <th class="text-center" style="padding: 4px 6px; font-size: 7.5pt;">Left</th>
            <th class="text-center" style="padding: 4px 6px; font-size: 7.5pt;">Used</th>
            <th class="text-center" style="padding: 4px 6px; font-size: 7.5pt;">Left</th>
            <th class="text-center" style="padding: 4px 6px; font-size: 7.5pt;">Used</th>
            <th class="text-center" style="padding: 4px 6px; font-size: 7.5pt;">Left</th>
          </tr>
        </thead>
        <tbody>
          ${allEmployeesReportData
            .map(
              (item) => `
            <tr>
              <td style="font-family: monospace;">${item.employee.employeeId}</td>
              <td><strong>${item.employee.name}</strong></td>
              <td>${item.employee.department}</td>
              <td>${item.employee.role}</td>
              <td class="text-center" style="font-family: monospace;">${item.balance.annualUsed}</td>
              <td class="text-center" style="font-family: monospace; font-weight: bold; color: #15803d;">${item.annualRemaining}</td>
              <td class="text-center" style="font-family: monospace;">${item.balance.casualUsed}</td>
              <td class="text-center" style="font-family: monospace; font-weight: bold; color: #15803d;">${item.casualRemaining}</td>
              <td class="text-center" style="font-family: monospace;">${item.balance.medicalUsed}</td>
              <td class="text-center" style="font-family: monospace; font-weight: bold; color: #15803d;">${item.medicalRemaining}</td>
              <td class="text-center" style="font-family: monospace;">${item.maternityUsed}</td>
              <td class="text-center" style="font-family: monospace; font-weight: bold; color: #15803d;">${item.maternityRemaining}</td>
              <td class="text-center" style="font-family: monospace;">${item.paternityUsed}</td>
              <td class="text-center" style="font-family: monospace; font-weight: bold; color: #15803d;">${item.paternityRemaining}</td>
              <td class="text-center" style="font-family: monospace;">${item.unpaidUsed}</td>
              <td class="text-center" style="font-family: monospace; font-weight: bold; color: #15803d;">${item.unpaidRemaining}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `;

    // 2. Body for All Employees Detailed Leave Report (including exact dates)
    const allDetailedTableHTML = `
      <div style="display: flex; gap: 12px; margin-bottom: 14px; font-size: 8.5pt;">
        <div style="background: #f1f5f9; padding: 6px 12px; border-radius: 6px; border: 1px solid #cbd5e1;">
          <strong>Total Applications:</strong> ${leaves.length} records
        </div>
        <div style="background: #f0fdf4; padding: 6px 12px; border-radius: 6px; border: 1px solid #bbf7d0; color: #166534;">
          <strong>Approved:</strong> ${leaves.filter((l) => l.status === 'approved').length} requests (${leaves.filter((l) => l.status === 'approved').reduce((s, l) => s + l.daysCount, 0)} days total)
        </div>
        <div style="background: #fffbeb; padding: 6px 12px; border-radius: 6px; border: 1px solid #fde68a; color: #92400e;">
          <strong>Pending:</strong> ${leaves.filter((l) => l.status === 'pending').length} requests
        </div>
        <div style="background: #fef2f2; padding: 6px 12px; border-radius: 6px; border: 1px solid #fecaca; color: #991b1b;">
          <strong>Rejected:</strong> ${leaves.filter((l) => l.status === 'rejected').length} requests
        </div>
      </div>

      <table border="1">
        <thead>
          <tr>
            <th style="width: 32px; text-align: center;">#</th>
            <th style="width: 80px;">Ref ID</th>
            <th style="width: 140px;">Employee</th>
            <th style="width: 110px;">Department</th>
            <th style="width: 90px;">Leave Type</th>
            <th style="width: 85px;" class="text-center">Start Date</th>
            <th style="width: 85px;" class="text-center">End Date</th>
            <th style="width: 50px;" class="text-center">Days</th>
            <th style="width: 80px;" class="text-center">Applied Date</th>
            <th>Reason &amp; Emergency Contact</th>
            <th style="width: 75px;" class="text-center">Status</th>
            <th style="width: 130px;">HR Approver &amp; Remarks</th>
          </tr>
        </thead>
        <tbody>
          ${leaves
            .map(
              (l, idx) => `
            <tr>
              <td class="text-center" style="font-family: monospace; color: #64748b;">${idx + 1}</td>
              <td style="font-family: monospace; font-size: 8pt; font-weight: bold;">${l.id}</td>
              <td>
                <strong>${l.employeeName}</strong>
                <div style="font-size: 7.5pt; color: #64748b; font-family: monospace;">${l.employeeId}</div>
              </td>
              <td>${l.department}</td>
              <td>
                <span style="font-weight: 600; text-transform: capitalize;">${l.leaveType}</span>
              </td>
              <td class="text-center" style="font-family: monospace; font-weight: 700; color: #1e293b;">
                ${l.startDate}
              </td>
              <td class="text-center" style="font-family: monospace; font-weight: 700; color: #1e293b;">
                ${l.endDate}
              </td>
              <td class="text-center" style="font-family: monospace; font-weight: 800; font-size: 9pt;">
                ${l.daysCount}d
              </td>
              <td class="text-center" style="font-family: monospace; font-size: 8pt; color: #475569;">
                ${l.appliedDate}
              </td>
              <td>
                <div style="font-style: italic;">"${l.reason}"</div>
                ${l.emergencyPhone ? `<div style="font-size: 7.5pt; color: #64748b; margin-top: 2px;">📞 ${l.emergencyPhone}</div>` : ''}
              </td>
              <td class="text-center">
                <span style="
                  font-weight: bold;
                  font-size: 7.5pt;
                  padding: 2px 6px;
                  border-radius: 4px;
                  text-transform: uppercase;
                  ${
                    l.status === 'approved'
                      ? 'background: #dcfce7; color: #15803d; border: 1px solid #86efac;'
                      : l.status === 'rejected'
                      ? 'background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5;'
                      : 'background: #fef3c7; color: #b45309; border: 1px solid #fde68a;'
                  }
                ">
                  ${l.status}
                </span>
              </td>
              <td>
                ${l.reviewedBy ? `<strong>${l.reviewedBy}</strong>` : '<span style="color: #94a3b8; font-style: italic;">Pending Review</span>'}
                ${l.managerComment ? `<div style="font-size: 7.5pt; color: #475569; font-style: italic;">"${l.managerComment}"</div>` : ''}
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `;

    // 3. Body for Each Employee Detailed Leave Dossier & Statement (A4 Portrait)
    const individualDetailedHTML = `
      <!-- Employee Profile Summary Box -->
      <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 12px 16px; margin-bottom: 18px;">
        <table style="width: 100%; border-collapse: collapse; border: none; margin: 0; font-size: 8.5pt;">
          <tbody>
            <tr style="background: transparent;">
              <td style="border: none; padding: 3px 6px; width: 50%;">
                <strong style="color: #475569;">Employee Name:</strong>
                <span style="font-size: 11pt; font-weight: 800; color: #0f172a; margin-left: 6px;">${targetEmp.name}</span>
                ${targetEmp.nameMyanmar ? `<span style="color: #4338ca; font-size: 9pt; margin-left: 4px;">(${targetEmp.nameMyanmar})</span>` : ''}
              </td>
              <td style="border: none; padding: 3px 6px; width: 50%;">
                <strong style="color: #475569;">Employee ID:</strong>
                <span style="font-family: monospace; font-weight: 700; color: #1e1b4b; background: #e0e7ff; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">${targetEmp.employeeId}</span>
              </td>
            </tr>
            <tr style="background: transparent;">
              <td style="border: none; padding: 3px 6px;">
                <strong style="color: #475569;">Department:</strong>
                <span style="font-weight: 600; margin-left: 6px;">${targetEmp.department}</span>
              </td>
              <td style="border: none; padding: 3px 6px;">
                <strong style="color: #475569;">Role / Designation:</strong>
                <span style="font-weight: 600; margin-left: 6px;">${targetEmp.role}</span>
              </td>
            </tr>
            <tr style="background: transparent;">
              <td style="border: none; padding: 3px 6px;">
                <strong style="color: #475569;">Date of Joining:</strong>
                <span style="font-family: monospace; margin-left: 6px;">${targetEmp.joinDate}</span>
              </td>
              <td style="border: none; padding: 3px 6px;">
                <strong style="color: #475569;">NRC Number:</strong>
                <span style="font-family: monospace; margin-left: 6px;">${targetEmp.nrcNumber}</span>
              </td>
            </tr>
            <tr style="background: transparent;">
              <td style="border: none; padding: 3px 6px;">
                <strong style="color: #475569;">Reporting Manager:</strong>
                <span style="margin-left: 6px;">${targetEmp.reportingManager || 'Daw Khin Thuzar'}</span>
              </td>
              <td style="border: none; padding: 3px 6px;">
                <strong style="color: #475569;">Contact Phone:</strong>
                <span style="font-family: monospace; margin-left: 6px;">${targetEmp.phone}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Section 1: Statutory & Corporate Leave Entitlement & Balance Status -->
      <h3 style="font-size: 10pt; font-weight: 800; color: #1e1b4b; margin: 12px 0 6px 0; border-left: 4px solid #4338ca; padding-left: 8px;">
        1. Statutory Leave Entitlement &amp; Current Balance Status
      </h3>
      <table border="1" style="margin-bottom: 20px;">
        <thead>
          <tr>
            <th>Statutory Leave Category</th>
            <th class="text-center" style="width: 85px;">Entitlement</th>
            <th class="text-center" style="width: 85px;">Days Taken</th>
            <th class="text-center" style="width: 95px;">Remaining Balance</th>
            <th>Governing Labor Statute / Policy Rule</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Annual Leave</strong></td>
            <td class="text-center" style="font-family: monospace;">${annualDays} days</td>
            <td class="text-center" style="font-family: monospace;">${targetBal.annualUsed} days</td>
            <td class="text-center" style="font-family: monospace; font-weight: 800; color: #15803d; font-size: 9.5pt;">${Math.max(0, targetBal.annualTotal - targetBal.annualUsed)} days</td>
            <td style="font-size: 8pt; color: #475569;">Myanmar Leave &amp; Holidays Act 1951, Section 4 (Earned Paid)</td>
          </tr>
          <tr>
            <td><strong>Casual Leave</strong></td>
            <td class="text-center" style="font-family: monospace;">${casualDays} days</td>
            <td class="text-center" style="font-family: monospace;">${targetBal.casualUsed} days</td>
            <td class="text-center" style="font-family: monospace; font-weight: 800; color: #15803d; font-size: 9.5pt;">${Math.max(0, targetBal.casualTotal - targetBal.casualUsed)} days</td>
            <td style="font-size: 8pt; color: #475569;">Myanmar Leave &amp; Holidays Act 1951, Section 5 (Max 3 consecutive)</td>
          </tr>
          <tr>
            <td><strong>Medical Leave</strong></td>
            <td class="text-center" style="font-family: monospace;">${medicalDays} days</td>
            <td class="text-center" style="font-family: monospace;">${targetBal.medicalUsed} days</td>
            <td class="text-center" style="font-family: monospace; font-weight: 800; color: #15803d; font-size: 9.5pt;">${Math.max(0, targetBal.medicalTotal - targetBal.medicalUsed)} days</td>
            <td style="font-size: 8pt; color: #475569;">Myanmar Leave &amp; Holidays Act 1951, Section 6 (Doctor Cert / SSB)</td>
          </tr>
          <tr>
            <td><strong>Statutory Maternity Leave</strong></td>
            <td class="text-center" style="font-family: monospace;">${maternityDays} days</td>
            <td class="text-center" style="font-family: monospace;">${targetMaternityUsed} days</td>
            <td class="text-center" style="font-family: monospace; font-weight: 800; color: #15803d; font-size: 9.5pt;">${targetMaternityRemaining} days</td>
            <td style="font-size: 8pt; color: #475569;">Myanmar Social Security Law 2012 (Female entitlement 14 weeks)</td>
          </tr>
          <tr>
            <td><strong>Paternity Support Leave</strong></td>
            <td class="text-center" style="font-family: monospace;">${paternityDays} days</td>
            <td class="text-center" style="font-family: monospace;">${targetPaternityUsed} days</td>
            <td class="text-center" style="font-family: monospace; font-weight: 800; color: #15803d; font-size: 9.5pt;">${targetPaternityRemaining} days</td>
            <td style="font-size: 8pt; color: #475569;">NexHR Corporate Family Support Policy 2026</td>
          </tr>
          <tr>
            <td><strong>Unpaid Leave</strong></td>
            <td class="text-center" style="font-family: monospace;">${unpaidDays} days</td>
            <td class="text-center" style="font-family: monospace;">${targetUnpaidUsed} days</td>
            <td class="text-center" style="font-family: monospace; font-weight: 800; color: #15803d; font-size: 9.5pt;">${targetUnpaidRemaining} days</td>
            <td style="font-size: 8pt; color: #475569;">Without pay by management discretionary approval</td>
          </tr>
          <tr style="background: #eef2ff; font-weight: bold;">
            <td>Total Statutory Paid Leaves</td>
            <td class="text-center" style="font-family: monospace;">${targetBal.annualTotal + targetBal.casualTotal + targetBal.medicalTotal} days</td>
            <td class="text-center" style="font-family: monospace; color: #4338ca;">${targetBal.annualUsed + targetBal.casualUsed + targetBal.medicalUsed} days</td>
            <td class="text-center" style="font-family: monospace; color: #15803d; font-size: 10pt;">
              ${Math.max(0, targetBal.annualTotal + targetBal.casualTotal + targetBal.medicalTotal - (targetBal.annualUsed + targetBal.casualUsed + targetBal.medicalUsed))} days
            </td>
            <td>Net statutory leave availability for current calendar year</td>
          </tr>
        </tbody>
      </table>

      <!-- Section 2: Detailed Leave Application & History Log (Include All Dates) -->
      <h3 style="font-size: 10pt; font-weight: 800; color: #1e1b4b; margin: 16px 0 6px 0; border-left: 4px solid #4338ca; padding-left: 8px;">
        2. Detailed Leave Application &amp; Attendance History (With Full Dates)
      </h3>
      ${
        targetLeaves.length === 0
          ? `<div style="padding: 18px; text-align: center; color: #64748b; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; font-size: 8.5pt;">
               No leave records on file for this employee in the current calendar year.
             </div>`
          : `
            <table border="1">
              <thead>
                <tr>
                  <th style="width: 75px;">Ref ID</th>
                  <th style="width: 80px;">Leave Type</th>
                  <th style="width: 85px;" class="text-center">Start Date</th>
                  <th style="width: 85px;" class="text-center">End Date</th>
                  <th style="width: 45px;" class="text-center">Days</th>
                  <th style="width: 80px;" class="text-center">Applied Date</th>
                  <th>Reason &amp; Purpose</th>
                  <th style="width: 75px;" class="text-center">Status</th>
                  <th style="width: 120px;">HR Approver &amp; Remarks</th>
                </tr>
              </thead>
              <tbody>
                ${targetLeaves
                  .map(
                    (l) => `
                  <tr>
                    <td style="font-family: monospace; font-weight: bold; font-size: 8pt;">${l.id}</td>
                    <td><strong style="text-transform: capitalize;">${l.leaveType}</strong></td>
                    <td class="text-center" style="font-family: monospace; font-weight: 700; color: #0f172a;">${l.startDate}</td>
                    <td class="text-center" style="font-family: monospace; font-weight: 700; color: #0f172a;">${l.endDate}</td>
                    <td class="text-center" style="font-family: monospace; font-weight: 800; font-size: 9pt;">${l.daysCount}d</td>
                    <td class="text-center" style="font-family: monospace; font-size: 8pt; color: #475569;">${l.appliedDate}</td>
                    <td style="font-style: italic;">"${l.reason}"</td>
                    <td class="text-center">
                      <span style="
                        font-weight: bold;
                        font-size: 7.5pt;
                        padding: 2px 6px;
                        border-radius: 4px;
                        text-transform: uppercase;
                        ${
                          l.status === 'approved'
                            ? 'background: #dcfce7; color: #15803d; border: 1px solid #86efac;'
                            : l.status === 'rejected'
                            ? 'background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5;'
                            : 'background: #fef3c7; color: #b45309; border: 1px solid #fde68a;'
                        }
                      ">
                        ${l.status}
                      </span>
                    </td>
                    <td>
                      ${l.reviewedBy ? `<strong>${l.reviewedBy}</strong>` : '<span style="color: #94a3b8; font-style: italic;">Pending Review</span>'}
                      ${l.managerComment ? `<div style="font-size: 7.5pt; color: #475569; font-style: italic;">"${l.managerComment}"</div>` : ''}
                    </td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          `
      }
    `;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${reportTitle} - ${isLandscape ? 'A4 Landscape' : 'A4 Portrait'}</title>
  <style>
    @page {
      size: ${pageOrientation};
      margin: ${isLandscape ? '8mm 10mm' : '10mm 12mm'};
    }
    * {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    body {
      margin: 0;
      padding: 16px;
      color: #0f172a;
      background: #ffffff;
      font-size: 9pt;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .no-print-toolbar {
      background: #eef2ff;
      border: 1px solid #c7d2fe;
      padding: 12px 18px;
      border-radius: 8px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }
    .no-print-toolbar button {
      background: #4338ca;
      color: white;
      border: none;
      padding: 9px 20px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 10pt;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.15s ease;
    }
    .no-print-toolbar button:hover {
      background: #3730a3;
    }
    @media print {
      .no-print-toolbar {
        display: none !important;
      }
      body {
        padding: 0 !important;
      }
    }
    .header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .title {
      font-size: ${isLandscape ? '19pt' : '17pt'};
      font-weight: 800;
      color: #0f172a;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .subtitle {
      font-size: 10pt;
      font-weight: 700;
      color: #312e81;
      margin-top: 4px;
    }
    .meta {
      text-align: right;
      font-size: 8.5pt;
      color: #475569;
      line-height: 1.5;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      margin-bottom: 20px;
      font-size: 8.5pt;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 6px 8px;
      text-align: left;
    }
    th {
      background-color: #f1f5f9;
      color: #0f172a;
      font-weight: 700;
      font-size: 8pt;
      text-transform: uppercase;
    }
    tr:nth-child(even) td {
      background-color: #f8fafc;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .footer {
      margin-top: 28px;
      border-top: 1px solid #cbd5e1;
      padding-top: 15px;
      display: flex;
      justify-content: space-between;
      page-break-inside: avoid;
    }
    .sign-box {
      width: ${reportType === 'individual-detailed' ? '180px' : '230px'};
      text-align: center;
      font-size: 8.5pt;
    }
    .sign-line {
      margin-top: 40px;
      border-top: 1px dashed #64748b;
      padding-top: 5px;
      color: #475569;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="no-print-toolbar">
    <div>
      <strong style="color: #312e81; font-size: 10pt;">🖨️ Windows Printer Dialog Box:</strong>
      <span style="color: #4338ca; font-size: 9pt; margin-left: 6px;">Windows print dialog is opening in ${isLandscape ? 'A4 Landscape' : 'A4 Portrait'}. If not shown, click button on right or press <b>Ctrl + P</b>.</span>
    </div>
    <button onclick="window.print()">
      🖨️ Print to Windows Printer (${isLandscape ? 'A4 Landscape' : 'A4 Portrait'})
    </button>
  </div>

  <div class="header">
    <div>
      <h1 class="title">${reportTitle}</h1>
      <div class="subtitle">${reportSubtitle}</div>
    </div>
    <div class="meta">
      <div><strong>Date:</strong> ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      <div><strong>Report Format:</strong> ${isLandscape ? 'A4 Landscape (297 × 210 mm)' : 'A4 Portrait (210 × 297 mm)'}</div>
      <div><strong>Form No:</strong> ${reportType === 'individual-detailed' ? 'NX-HR-IND-LVE-2026' : 'NX-HR-LVE-2026'} / Myanmar Leave &amp; Holidays Act 1951</div>
    </div>
  </div>

  ${
    reportType === 'all-summary'
      ? summaryTableHTML
      : reportType === 'all-detailed'
      ? allDetailedTableHTML
      : individualDetailedHTML
  }

  <div class="footer">
    ${
      reportType === 'individual-detailed'
        ? `
        <div class="sign-box">
          <div class="sign-line">Employee Signature<br/><strong>${targetEmp.name}</strong></div>
        </div>
      `
        : ''
    }
    <div class="sign-box">
      <div class="sign-line">Prepared By: Daw Khin Thuzar<br/>HR Operations Manager</div>
    </div>
    <div class="sign-box">
      <div class="sign-line">Verified &amp; Approved By:<br/>Executive Director</div>
    </div>
    <div class="sign-box">
      <div class="sign-line">Official System Stamp<br/>NexHR Cloud ERP</div>
    </div>
  </div>

  <div style="margin-top: 15px; text-align: center; font-size: 7.5pt; color: #94a3b8; font-family: monospace;">
    Certified Official Document · Confirmed Under Myanmar Leave &amp; Holidays Act 1951 &amp; SSB Law 2012 · Generated by NexHR ERP
  </div>

  <script>
    window.addEventListener('load', function() {
      setTimeout(function() {
        try {
          window.focus();
          window.print();
        } catch (e) {
          console.warn('Auto print failed:', e);
        }
      }, 350);
    });
  </script>
</body>
</html>`;
  };

  // Dedicated helper to trigger Windows Print Dialog Box reliably
  const triggerWindowsPrint = (
    reportType: 'all-summary' | 'all-detailed' | 'individual-detailed' = printReportType,
    targetEmpId: string = printSelectedEmpId
  ) => {
    let printSucceeded = false;

    // Method 1: Inject printable HTML into a hidden iframe and trigger native print dialog
    try {
      let printFrame = document.getElementById('a4-landscape-print-frame') as HTMLIFrameElement;
      if (!printFrame) {
        printFrame = document.createElement('iframe');
        printFrame.id = 'a4-landscape-print-frame';
        printFrame.style.position = 'fixed';
        printFrame.style.right = '0';
        printFrame.style.bottom = '0';
        printFrame.style.width = '1px';
        printFrame.style.height = '1px';
        printFrame.style.opacity = '0.01';
        printFrame.style.border = 'none';
        printFrame.style.pointerEvents = 'none';
        document.body.appendChild(printFrame);
      }

      const frameDoc = printFrame.contentDocument || printFrame.contentWindow?.document;
      if (frameDoc) {
        frameDoc.open();
        frameDoc.write(generateA4PrintHTML(reportType, targetEmpId));
        frameDoc.close();
        printFrame.contentWindow?.focus();
        printFrame.contentWindow?.print();
        printSucceeded = true;
      }
    } catch (frameErr) {
      console.warn('Iframe print failed (iframe sandbox):', frameErr);
    }

    // Method 2: Try window.print() directly in main window
    if (!printSucceeded) {
      try {
        window.focus();
        window.print();
        printSucceeded = true;
      } catch (winErr) {
        console.warn('Direct window.print() failed:', winErr);
      }
    }

    // Method 3: Fallback if browser/sandbox blocks interactive print dialogs
    if (!printSucceeded) {
      handleDownloadPrintableHTML(reportType, targetEmpId);
      setPrintStatusNotice(
        language === 'my'
          ? 'Browser sandbox ကန့်သတ်ချက်ကြောင့် Printer Dialog တိုက်ရိုက်မပွင့်ပါ။ A4 HTML ဖိုင်ကို ဒေါင်းလုဒ်လုပ်ပေးထားပါသည် (ဖိုင်ဖွင့်လိုက်ပါက Windows Printer Dialog တန်းပွင့်ပါမည်) သို့မဟုတ် ကီးဘုတ်မှ Ctrl + P နှိပ်ပါ။'
          : 'Windows Printer Dialog was triggered. If your browser restricts popups in this frame, the A4 HTML file was downloaded (open it to print immediately) or press Ctrl + P.'
      );
    } else {
      const modeText =
        reportType === 'all-summary'
          ? 'All Employees Leave Balance Summary (A4 Landscape)'
          : reportType === 'all-detailed'
          ? 'All Employees Detailed Leave Report (A4 Landscape)'
          : 'Each Employee Detailed Leave Statement (A4 Portrait)';

      setPrintStatusNotice(
        language === 'my'
          ? `Windows Printer Dialog Box ကို ဖွင့်လှစ်ပြီးပါပြီ (${modeText})။`
          : `Windows Printer Dialog Box opened in ${modeText}.`
      );
    }
  };

  // Print Handlers:
  // 1. Balance Summary (A4 Landscape)
  const handlePrintBalanceSummary = () => {
    setPrintReportType('all-summary');
    setPrintScope('all');
    setPrintOrientation('landscape');
    setIsPrintModalOpen(true);
    setPrintStatusNotice(null);
    setTimeout(() => {
      triggerWindowsPrint('all-summary');
    }, 120);
  };

  // 2. All Employees Detailed Leave Report with Dates (A4 Landscape)
  const handlePrintAllDetailed = () => {
    setPrintReportType('all-detailed');
    setPrintScope('all');
    setPrintOrientation('landscape');
    setIsPrintModalOpen(true);
    setPrintStatusNotice(null);
    setTimeout(() => {
      triggerWindowsPrint('all-detailed');
    }, 120);
  };

  // 3. Each Employee Detailed Leave Dossier with Dates & Balances (A4 Portrait)
  const handlePrintIndividualDetailed = (empId?: string) => {
    const target = empId || dossierEmpId || employees[0]?.employeeId || 'NX-1002';
    setPrintReportType('individual-detailed');
    setPrintSelectedEmpId(target);
    setPrintScope('individual');
    setPrintOrientation('portrait');
    setIsPrintModalOpen(true);
    setPrintStatusNotice(null);
    setTimeout(() => {
      triggerWindowsPrint('individual-detailed', target);
    }, 120);
  };

  // Default Print Trigger
  const handlePrintA4 = () => {
    if (activeTab === 'individualEmployee') {
      handlePrintIndividualDetailed(dossierEmpId);
    } else {
      handlePrintBalanceSummary();
    }
  };

  // Direct print attempt from inside the modal
  const handleDirectPrintNow = () => {
    triggerWindowsPrint(printReportType, printSelectedEmpId);
  };

  // Download standalone self-printing A4 HTML document
  const handleDownloadPrintableHTML = (
    reportType: 'all-summary' | 'all-detailed' | 'individual-detailed' = printReportType,
    targetEmpId: string = printSelectedEmpId
  ) => {
    const html = generateA4PrintHTML(reportType, targetEmpId);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filePrefix =
      reportType === 'all-summary'
        ? 'All_Employees_Leave_Balance_Summary_A4_Landscape'
        : reportType === 'all-detailed'
        ? 'All_Employees_Detailed_Leave_Report_A4_Landscape'
        : `Employee_${targetEmpId}_Detailed_Leave_Statement_A4_Portrait`;
    link.download = `${filePrefix}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export high-resolution PNG image format ("All Employee Leave Balance Report.png")
  const handleExportPNG = () => {
    try {
      const scale = 2; // High-DPI 2x resolution
      const baseWidth = 1480;
      const rowHeight = 32;
      const headerSectionHeight = 110;
      const tableHeaderHeight = 54; // 2 tiers: 28px + 26px
      const tableRowsHeight = allEmployeesReportData.length * rowHeight;
      const totalsRowHeight = 36;
      const footerSignHeight = 140;
      const bottomNoteHeight = 35;
      const padding = 40;

      const baseHeight =
        padding +
        headerSectionHeight +
        tableHeaderHeight +
        tableRowsHeight +
        totalsRowHeight +
        footerSignHeight +
        bottomNoteHeight +
        padding;

      const canvas = document.createElement('canvas');
      canvas.width = baseWidth * scale;
      canvas.height = baseHeight * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.scale(scale, scale);

      // Clean White Paper Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, baseWidth, baseHeight);

      // Top Decorative Header Bar
      ctx.fillStyle = '#312e81';
      ctx.fillRect(padding, padding, baseWidth - padding * 2, 4);

      // Header Subtitle
      ctx.font = '600 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#4338ca';
      ctx.textAlign = 'left';
      ctx.fillText('NexHR Enterprise · Statutory Leave Entitlement & Balance Register', padding, padding + 24);

      // Main Report Title
      ctx.font = '800 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText('All Employees Leave Balance Summary', padding, padding + 52);

      // Header Metadata (Right Aligned)
      ctx.textAlign = 'right';
      ctx.font = '600 10.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#334155';
      ctx.fillText(
        `Date: ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        baseWidth - padding,
        padding + 22
      );
      ctx.font = '500 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('Report Format: All Employee Leave Balance Report (PNG Format / A4 Landscape)', baseWidth - padding, padding + 38);
      ctx.fillText('File: All Employee Leave Balance Report.png · Form No: NX-HR-LVE-2026', baseWidth - padding, padding + 54);

      // Divider Line below Header
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(padding, padding + 70);
      ctx.lineTo(baseWidth - padding, padding + 70);
      ctx.stroke();

      // Table Setup
      const tableTop = padding + 84;
      const tableWidth = baseWidth - padding * 2;

      // Table Column widths exactly matching layout in All Employee Leave Balance Report.png:
      // Employee ID (110), Name (180), Department (140), Role (140)
      // Annual (Used 65, Left 65 = 130)
      // Casual (Used 65, Left 65 = 130)
      // Medical (Used 65, Left 65 = 130)
      // Statutory Maternity (Used 80, Left 80 = 160)
      // Paternity Support (Used 75, Left 75 = 150)
      // Unpaid (Used 65, Left 65 = 130)
      // Total = 110+180+140+140+130+130+130+160+150+130 = 1400px (fits 1480 with 40 padding on each side)
      const colEmpId = 110;
      const colName = 180;
      const colDept = 140;
      const colRole = 140;

      const leaveCols = [
        { key: 'annual', label: `Annual (${annualDays}d)`, usedWidth: 65, leftWidth: 65 },
        { key: 'casual', label: `Casual (${casualDays}d)`, usedWidth: 65, leftWidth: 65 },
        { key: 'medical', label: `Medical (${medicalDays}d)`, usedWidth: 65, leftWidth: 65 },
        { key: 'maternity', label: `Statutory Maternity(${maternityDays}d)`, usedWidth: 80, leftWidth: 80 },
        { key: 'paternity', label: `Paternity Support (${paternityDays}d)`, usedWidth: 75, leftWidth: 75 },
        { key: 'unpaid', label: `Unpaid (${unpaidDays}d)`, usedWidth: 65, leftWidth: 65 },
      ];

      // Draw Header Background
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(padding, tableTop, tableWidth, tableHeaderHeight);

      // Draw Outer Header Border
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      ctx.strokeRect(padding, tableTop, tableWidth, tableHeaderHeight);

      // Horizontal separator between Tier 1 and Tier 2 (only across leave columns)
      const leaveStartX = padding + colEmpId + colName + colDept + colRole;
      ctx.beginPath();
      ctx.moveTo(leaveStartX, tableTop + 28);
      ctx.lineTo(padding + tableWidth, tableTop + 28);
      ctx.stroke();

      // Tier 1 Header texts:
      ctx.fillStyle = '#0f172a';
      ctx.font = '700 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

      // 1. Employee ID
      ctx.textAlign = 'center';
      ctx.fillText('Employee ID', padding + colEmpId / 2, tableTop + 32);

      // 2. Name
      ctx.fillText('Name', padding + colEmpId + colName / 2, tableTop + 32);

      // 3. Department
      ctx.fillText('Department', padding + colEmpId + colName + colDept / 2, tableTop + 32);

      // 4. Role
      ctx.fillText('Role', padding + colEmpId + colName + colDept + colRole / 2, tableTop + 32);

      // Vertical line after first 4 basic columns
      ctx.strokeStyle = '#94a3b8';
      [
        padding + colEmpId,
        padding + colEmpId + colName,
        padding + colEmpId + colName + colDept,
        leaveStartX,
      ].forEach((x) => {
        ctx.beginPath();
        ctx.moveTo(x, tableTop);
        ctx.lineTo(x, tableTop + tableHeaderHeight);
        ctx.stroke();
      });

      // Draw Leave Group Headers (Tier 1) and subheaders (Tier 2: Used | Left)
      let currentX = leaveStartX;
      leaveCols.forEach((lCol) => {
        const groupWidth = lCol.usedWidth + lCol.leftWidth;

        // Tier 1 Group Header
        ctx.font = '700 10.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'center';
        ctx.fillText(lCol.label, currentX + groupWidth / 2, tableTop + 19);

        // Tier 2: Used & Left
        ctx.font = '600 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#475569';
        ctx.fillText('Used', currentX + lCol.usedWidth / 2, tableTop + 45);
        ctx.fillText('Left', currentX + lCol.usedWidth + lCol.leftWidth / 2, tableTop + 45);

        // Sub-column separator line
        ctx.strokeStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.moveTo(currentX + lCol.usedWidth, tableTop + 28);
        ctx.lineTo(currentX + lCol.usedWidth, tableTop + tableHeaderHeight);
        ctx.stroke();

        currentX += groupWidth;

        // Group separator line
        ctx.strokeStyle = '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(currentX, tableTop);
        ctx.lineTo(currentX, tableTop + tableHeaderHeight);
        ctx.stroke();
      });

      // Draw Rows
      let rowY = tableTop + tableHeaderHeight;

      allEmployeesReportData.forEach((item, rIdx) => {
        // Row background
        ctx.fillStyle = rIdx % 2 === 0 ? '#ffffff' : '#f8fafc';
        ctx.fillRect(padding, rowY, tableWidth, rowHeight);

        // Row border
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.strokeRect(padding, rowY, tableWidth, rowHeight);

        // Cell 1: Employee ID
        ctx.font = '500 10.5px monospace';
        ctx.fillStyle = '#1e293b';
        ctx.textAlign = 'center';
        ctx.fillText(item.employee.employeeId, padding + colEmpId / 2, rowY + 20);

        // Cell 2: Name
        ctx.font = '700 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'left';
        ctx.fillText(item.employee.name, padding + colEmpId + 8, rowY + 20);

        // Cell 3: Department
        ctx.font = '400 10.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#475569';
        ctx.fillText(item.employee.department, padding + colEmpId + colName + 8, rowY + 20);

        // Cell 4: Role
        ctx.fillText(item.employee.role, padding + colEmpId + colName + colDept + 8, rowY + 20);

        // Vertical lines for basic columns
        ctx.strokeStyle = '#e2e8f0';
        [
          padding + colEmpId,
          padding + colEmpId + colName,
          padding + colEmpId + colName + colDept,
          leaveStartX,
        ].forEach((x) => {
          ctx.beginPath();
          ctx.moveTo(x, rowY);
          ctx.lineTo(x, rowY + rowHeight);
          ctx.stroke();
        });

        // Cell values for each leave type
        let x = leaveStartX;
        const leaveValues = [
          { used: item.balance.annualUsed, left: item.annualRemaining, uW: 65, lW: 65 },
          { used: item.balance.casualUsed, left: item.casualRemaining, uW: 65, lW: 65 },
          { used: item.balance.medicalUsed, left: item.medicalRemaining, uW: 65, lW: 65 },
          { used: item.maternityUsed, left: item.maternityRemaining, uW: 80, lW: 80 },
          { used: item.paternityUsed, left: item.paternityRemaining, uW: 75, lW: 75 },
          { used: item.unpaidUsed, left: item.unpaidRemaining, uW: 65, lW: 65 },
        ];

        leaveValues.forEach((lVal) => {
          // Used
          ctx.font = '500 10.5px monospace';
          ctx.fillStyle = '#475569';
          ctx.textAlign = 'center';
          ctx.fillText(String(lVal.used), x + lVal.uW / 2, rowY + 20);

          // Sub-separator
          ctx.strokeStyle = '#e2e8f0';
          ctx.beginPath();
          ctx.moveTo(x + lVal.uW, rowY);
          ctx.lineTo(x + lVal.uW, rowY + rowHeight);
          ctx.stroke();

          // Left
          ctx.font = '700 10.5px monospace';
          ctx.fillStyle = '#15803d'; // Green
          ctx.fillText(String(lVal.left), x + lVal.uW + lVal.lW / 2, rowY + 20);

          x += lVal.uW + lVal.lW;

          // Group separator
          ctx.strokeStyle = '#cbd5e1';
          ctx.beginPath();
          ctx.moveTo(x, rowY);
          ctx.lineTo(x, rowY + rowHeight);
          ctx.stroke();
        });

        rowY += rowHeight;
      });

      // Totals / Summary Row
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(padding, rowY, tableWidth, totalsRowHeight);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.strokeRect(padding, rowY, tableWidth, totalsRowHeight);

      ctx.fillStyle = '#0f172a';
      ctx.font = '700 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Workforce Total (${allEmployeesReportData.length} Permanent Staff)`, padding + 12, rowY + 23);

      // Vertical line before leaves in totals
      ctx.strokeStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(leaveStartX, rowY);
      ctx.lineTo(leaveStartX, rowY + totalsRowHeight);
      ctx.stroke();

      // Compute sums
      const sumAnnualUsed = allEmployeesReportData.reduce((acc, i) => acc + i.balance.annualUsed, 0);
      const sumAnnualLeft = allEmployeesReportData.reduce((acc, i) => acc + i.annualRemaining, 0);
      const sumCasualUsed = allEmployeesReportData.reduce((acc, i) => acc + i.balance.casualUsed, 0);
      const sumCasualLeft = allEmployeesReportData.reduce((acc, i) => acc + i.casualRemaining, 0);
      const sumMedicalUsed = allEmployeesReportData.reduce((acc, i) => acc + i.balance.medicalUsed, 0);
      const sumMedicalLeft = allEmployeesReportData.reduce((acc, i) => acc + i.medicalRemaining, 0);
      const sumMaternityUsed = allEmployeesReportData.reduce((acc, i) => acc + i.maternityUsed, 0);
      const sumMaternityLeft = allEmployeesReportData.reduce((acc, i) => acc + i.maternityRemaining, 0);
      const sumPaternityUsed = allEmployeesReportData.reduce((acc, i) => acc + i.paternityUsed, 0);
      const sumPaternityLeft = allEmployeesReportData.reduce((acc, i) => acc + i.paternityRemaining, 0);
      const sumUnpaidUsed = allEmployeesReportData.reduce((acc, i) => acc + i.unpaidUsed, 0);
      const sumUnpaidLeft = allEmployeesReportData.reduce((acc, i) => acc + i.unpaidRemaining, 0);

      const totalLeaveSums = [
        { u: sumAnnualUsed, l: sumAnnualLeft, uW: 65, lW: 65 },
        { u: sumCasualUsed, l: sumCasualLeft, uW: 65, lW: 65 },
        { u: sumMedicalUsed, l: sumMedicalLeft, uW: 65, lW: 65 },
        { u: sumMaternityUsed, l: sumMaternityLeft, uW: 80, lW: 80 },
        { u: sumPaternityUsed, l: sumPaternityLeft, uW: 75, lW: 75 },
        { u: sumUnpaidUsed, l: sumUnpaidLeft, uW: 65, lW: 65 },
      ];

      let totX = leaveStartX;
      totalLeaveSums.forEach((ts) => {
        ctx.font = '700 10.5px monospace';
        ctx.fillStyle = '#334155';
        ctx.textAlign = 'center';
        ctx.fillText(String(ts.u), totX + ts.uW / 2, rowY + 23);

        ctx.fillStyle = '#15803d';
        ctx.fillText(String(ts.l), totX + ts.uW + ts.lW / 2, rowY + 23);

        totX += ts.uW + ts.lW;

        ctx.strokeStyle = '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(totX, rowY);
        ctx.lineTo(totX, rowY + totalsRowHeight);
        ctx.stroke();
      });

      rowY += totalsRowHeight;

      // Sign-off Blocks (Footer)
      const signY = rowY + 36;
      const boxWidth = 240;
      const boxGap = (tableWidth - boxWidth * 3) / 2;

      // Box 1: Prepared By
      const b1X = padding;
      ctx.textAlign = 'center';
      ctx.font = '700 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText('Daw Khin Thuzar', b1X + boxWidth / 2, signY + 35);
      ctx.font = '500 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('HR Operations Manager (Prepared)', b1X + boxWidth / 2, signY + 50);

      ctx.strokeStyle = '#94a3b8';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(b1X + 20, signY + 18);
      ctx.lineTo(b1X + boxWidth - 20, signY + 18);
      ctx.stroke();
      ctx.setLineDash([]);

      // Box 2: Verified By
      const b2X = padding + boxWidth + boxGap;
      ctx.font = '700 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText('U Thein Lwin Oo', b2X + boxWidth / 2, signY + 35);
      ctx.font = '500 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('Executive Director (Authorized & Signed)', b2X + boxWidth / 2, signY + 50);

      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(b2X + 20, signY + 18);
      ctx.lineTo(b2X + boxWidth - 20, signY + 18);
      ctx.stroke();
      ctx.setLineDash([]);

      // Box 3: System Stamp
      const b3X = padding + (boxWidth + boxGap) * 2;
      ctx.font = '700 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText('NexHR ERP Cloud Enterprise', b3X + boxWidth / 2, signY + 35);
      ctx.font = '500 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('Official System Stamp · NX-2026-CERTIFIED', b3X + boxWidth / 2, signY + 50);

      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(b3X + 20, signY + 18);
      ctx.lineTo(b3X + boxWidth - 20, signY + 18);
      ctx.stroke();
      ctx.setLineDash([]);

      // Bottom Statutory Ledger Note
      const bottomY = signY + 75;
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding, bottomY);
      ctx.lineTo(baseWidth - padding, bottomY);
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.font = '500 10px monospace';
      ctx.fillStyle = '#64748b';
      ctx.fillText(
        'Official Statutory Leave Ledger Record (PNG Format) · Confirmed under Myanmar Leave & Holidays Act 1951',
        baseWidth / 2,
        bottomY + 18
      );

      // Convert to blob and trigger download as "All Employee Leave Balance Report.png"
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'All Employee Leave Balance Report.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setPrintStatusNotice(
          language === 'my'
            ? 'All Employee Leave Balance Report.png ဖိုင်ကို အောင်မြင်စွာ ဒေါင်းလုဒ်လုပ်ပြီးပါပြီ (High-Res PNG Format)။'
            : "Successfully downloaded 'All Employee Leave Balance Report.png' (High-Resolution PNG format)."
        );
      }, 'image/png');
    } catch (err) {
      console.error('Error generating PNG report:', err);
      setPrintStatusNotice(
        language === 'my'
          ? 'PNG ဖိုင် ထုတ်ယူရာတွင် အမှားဖြစ်ပေါ်ပါသည်'
          : 'Failed to generate PNG report file.'
      );
    }
  };

  const handleExportExcel = () => {
    const title =
      activeTab === 'allEmployees'
        ? 'NexHR_All_Employees_Leave_Report'
        : `NexHR_Leave_Report_${dossierEmployee.name.replace(/\s+/g, '_')}`;

    const content = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8"/>
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
        <x:Name>Leave Report</x:Name>
        <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
        </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        <style>
          th { background-color: #312e81; color: #ffffff; font-weight: bold; padding: 6px; }
          td { padding: 5px; }
        </style>
      </head>
      <body>
        <h2>NexHR Leave Management &amp; Entitlement Ledger</h2>
        <p>Report Date: ${new Date().toLocaleDateString('en-GB')} | Scope: ${activeTab === 'allEmployees' ? 'All Employees' : dossierEmployee.name}</p>
        <table border="1" style="border-collapse: collapse;">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Role</th>
              <th>Annual Used</th>
              <th>Annual Left (${annualDays}d)</th>
              <th>Casual Used</th>
              <th>Casual Left (${casualDays}d)</th>
              <th>Medical Used</th>
              <th>Medical Left (${medicalDays}d)</th>
              <th>Maternity Used</th>
              <th>Maternity Left (${maternityDays}d)</th>
              <th>Paternity Used</th>
              <th>Paternity Left (${paternityDays}d)</th>
              <th>Unpaid Used</th>
              <th>Unpaid Left (${unpaidDays}d)</th>
            </tr>
          </thead>
          <tbody>
            ${allEmployeesReportData
              .map(
                (item) => `
              <tr>
                <td>${item.employee.employeeId}</td>
                <td>${item.employee.name}</td>
                <td>${item.employee.department}</td>
                <td>${item.employee.role}</td>
                <td>${item.balance.annualUsed}</td>
                <td>${item.annualRemaining}</td>
                <td>${item.balance.casualUsed}</td>
                <td>${item.casualRemaining}</td>
                <td>${item.balance.medicalUsed}</td>
                <td>${item.medicalRemaining}</td>
                <td>${item.maternityUsed}</td>
                <td>${item.maternityRemaining}</td>
                <td>${item.paternityUsed}</td>
                <td>${item.paternityRemaining}</td>
                <td>${item.unpaidUsed}</td>
                <td>${item.unpaidRemaining}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
        <br/>
        <h3>Leave Applications Register</h3>
        <table border="1" style="border-collapse: collapse;">
          <thead>
            <tr>
              <th>ID</th>
              <th>Employee Name</th>
              <th>Leave Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Days</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Approver / Comment</th>
            </tr>
          </thead>
          <tbody>
            ${(activeTab === 'allEmployees' ? filteredLeaves : filteredDossierLeaves)
              .map(
                (l) => `
              <tr>
                <td>${l.id}</td>
                <td>${l.employeeName}</td>
                <td>${l.leaveType}</td>
                <td>${l.startDate}</td>
                <td>${l.endDate}</td>
                <td>${l.daysCount}</td>
                <td>${l.reason}</td>
                <td>${l.status.toUpperCase()}</td>
                <td>${l.reviewedBy ? `${l.reviewedBy} - ${l.managerComment || ''}` : 'Pending'}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    const blob = new Blob([content], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}_${new Date().toISOString().split('T')[0]}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Employee ID',
      'Name',
      'Department',
      'Role',
      'Annual Used',
      `Annual Left (${annualDays}d)`,
      'Casual Used',
      `Casual Left (${casualDays}d)`,
      'Medical Used',
      `Medical Left (${medicalDays}d)`,
      'Maternity Used',
      `Maternity Left (${maternityDays}d)`,
      'Paternity Used',
      `Paternity Left (${paternityDays}d)`,
      'Unpaid Used',
      `Unpaid Left (${unpaidDays}d)`,
    ];

    const rows = allEmployeesReportData.map((item) => [
      item.employee.employeeId,
      `"${item.employee.name}"`,
      `"${item.employee.department}"`,
      `"${item.employee.role}"`,
      item.balance.annualUsed,
      item.annualRemaining,
      item.balance.casualUsed,
      item.casualRemaining,
      item.balance.medicalUsed,
      item.medicalRemaining,
      item.maternityUsed,
      item.maternityRemaining,
      item.paternityUsed,
      item.paternityRemaining,
      item.unpaidUsed,
      item.unpaidRemaining,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NexHR_Leave_Balance_Report_All_Employees_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Print Stylesheet for Windows Printer Dialog Box A4 output */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 12mm 10mm;
          }
          body {
            background: white !important;
            color: #0f172a !important;
            font-size: 11px !important;
          }
          header, nav, aside, .no-print, button, input, select {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .print-container {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          th, td {
            border: 1px solid #94a3b8 !important;
            padding: 6px 8px !important;
            font-size: 9pt !important;
          }
          th {
            background-color: #f1f5f9 !important;
            color: #0f172a !important;
            font-weight: 700 !important;
          }
        }
        @media screen {
          .print-only {
            display: none !important;
          }
        }
      `}</style>

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
                  ? 'ဝန်ထမ်းအားလုံးနှင့် တစ်ဦးချင်းစီအတွက် တိကျသော ခွင့်လက်ကျန်စာရင်း၊ A4 ပုံနှိပ်ခြင်းနှင့် Excel/CSV ထုတ်ယူခြင်း'
                  : 'Statutory leave balances, real-time approval workflow, A4 printing, and Excel/CSV export'}
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 no-print">
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

          {/* A4 Print Buttons */}
          <button
            onClick={handlePrintBalanceSummary}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors cursor-pointer"
            title="Print All Employees Leave Balance Summary on A4 Landscape paper (matches All Employee Leave Balance Report.png)"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-600" />
            <span>{language === 'my' ? 'ခွင့်လက်ကျန် A4 ပုံနှိပ်မည်' : 'Print Balance Summary (A4)'}</span>
          </button>

          <button
            onClick={handlePrintAllDetailed}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors cursor-pointer"
            title="Print complete detailed leave applications report with dates for all employees on A4 Landscape paper"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>{language === 'my' ? 'ခွင့်မှတ်တမ်းအသေးစိတ် A4 ပုံနှိပ်မည်' : 'Print Detail All Leave Report (A4)'}</span>
          </button>

          <button
            onClick={handleExportPNG}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 border border-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            title="Download report in PNG file format ('All Employee Leave Balance Report.png')"
          >
            <FileImage className="w-3.5 h-3.5 text-white" />
            <span>{language === 'my' ? 'PNG ထုတ်ယူမည် (.png)' : 'Export PNG (.png)'}</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors"
            title="Download Leave Report as Excel (.xls) file"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'my' ? 'Excel ထုတ်ယူမည်' : 'Export Excel'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors"
            title="Download complete Leave Report as CSV file"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>{language === 'my' ? 'CSV ထုတ်ယူမည်' : 'Export CSV'}</span>
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

      {/* 2. Primary Module Navigation Tabs: Exactly 2 Tabs as requested:
             1. All Employee
             2. Individual Employee (without word "Ko Thant Zin") */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3 no-print">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('allEmployees')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'allEmployees'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>{language === 'my' ? '၁။ ဝန်ထမ်းအားလုံး (All Employee)' : '1. All Employee'}</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-emerald-300 font-mono">
              {employees.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('individualEmployee')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'individualEmployee'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4 text-indigo-400" />
            <span>{language === 'my' ? '၂။ ဝန်ထမ်းတစ်ဦးချင်း (Individual Employee)' : '2. Individual Employee'}</span>
          </button>
        </div>
      </div>

      {/* 3. Search Box & Status Filter Tabs:
             - Search Box (Search by Search Box)
             - 3. Approved
             - 4. Pending
             - 5. Reject */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'my'
                  ? 'အမည်၊ ID၊ ဌာန သို့မဟုတ် ခွင့်အကြောင်းပြချက်ဖြင့် ရှာဖွေပါ...'
                  : 'Search by employee name, ID, department, or reason...'
              }
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
            />
          </div>

          {/* Status Sub-Tabs: 3. Approved, 4. Pending, 5. Reject */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setStatusTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                statusTab === 'all'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{language === 'my' ? 'အားလုံး (All)' : 'All'}</span>
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono">
                {leaves.length}
              </span>
            </button>

            <button
              onClick={() => setStatusTab('approved')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                statusTab === 'approved'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{language === 'my' ? '၃။ ခွင့်ပြုပြီး (3. Approved)' : '3. Approved'}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  statusTab === 'approved' ? 'bg-emerald-700 text-white' : 'bg-emerald-200/80 text-emerald-900'
                }`}
              >
                {executiveKPIs.totalApprovedRequests}
              </span>
            </button>

            <button
              onClick={() => setStatusTab('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                statusTab === 'pending'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{language === 'my' ? '၄။ ဆိုင်းငံ့ (4. Pending)' : '4. Pending'}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  statusTab === 'pending' ? 'bg-amber-700 text-white' : 'bg-amber-200 text-amber-900'
                }`}
              >
                {executiveKPIs.totalPendingRequests}
              </span>
            </button>

            <button
              onClick={() => setStatusTab('rejected')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                statusTab === 'rejected'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>{language === 'my' ? '၅။ ငြင်းပယ် (5. Reject)' : '5. Reject'}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  statusTab === 'rejected' ? 'bg-rose-700 text-white' : 'bg-rose-200 text-rose-900'
                }`}
              >
                {leaves.filter((l) => l.status === 'rejected').length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW MODE 1: ALL EMPLOYEES LEAVE BALANCE REPORT & APPLICATIONS */}
      {/* ========================================================================= */}
      {activeTab === 'allEmployees' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Print Only Header */}
          <div className="print-only mb-6 border-b-2 border-slate-900 pb-3">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-xl font-bold text-slate-900">NexHR — Leave Management &amp; Entitlement Ledger</h1>
                <p className="text-xs text-slate-600">All Employees Statutory Leave Balances &amp; Applications Report</p>
              </div>
              <div className="text-right text-xs text-slate-600 font-mono">
                <div>Printed: {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString()}</div>
                <div>Status Filter: {statusTab.toUpperCase()} | Total Staff: {employees.length}</div>
              </div>
            </div>
          </div>

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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-[11px]">
                    <th rowSpan={2} className="py-2.5 px-3 border-r border-slate-200">Employee</th>
                    <th colSpan={2} className="py-1 px-2 text-center border-r border-slate-200">Annual ({annualDays}d)</th>
                    <th colSpan={2} className="py-1 px-2 text-center border-r border-slate-200">Casual ({casualDays}d)</th>
                    <th colSpan={2} className="py-1 px-2 text-center border-r border-slate-200">Medical ({medicalDays}d)</th>
                    <th colSpan={2} className="py-1 px-2 text-center border-r border-slate-200">Maternity ({maternityDays}d)</th>
                    <th colSpan={2} className="py-1 px-2 text-center border-r border-slate-200">Paternity ({paternityDays}d)</th>
                    <th colSpan={2} className="py-1 px-2 text-center border-r border-slate-200">Unpaid ({unpaidDays}d)</th>
                    <th rowSpan={2} className="py-2.5 px-3 text-center border-r border-slate-200">Requests</th>
                    <th rowSpan={2} className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px]">
                    <th className="py-1 px-2 text-center font-mono">Used</th>
                    <th className="py-1 px-2 text-center font-mono font-bold text-emerald-700 border-r border-slate-200">Left</th>
                    <th className="py-1 px-2 text-center font-mono">Used</th>
                    <th className="py-1 px-2 text-center font-mono font-bold text-emerald-700 border-r border-slate-200">Left</th>
                    <th className="py-1 px-2 text-center font-mono">Used</th>
                    <th className="py-1 px-2 text-center font-mono font-bold text-emerald-700 border-r border-slate-200">Left</th>
                    <th className="py-1 px-2 text-center font-mono">Used</th>
                    <th className="py-1 px-2 text-center font-mono font-bold text-emerald-700 border-r border-slate-200">Left</th>
                    <th className="py-1 px-2 text-center font-mono">Used</th>
                    <th className="py-1 px-2 text-center font-mono font-bold text-emerald-700 border-r border-slate-200">Left</th>
                    <th className="py-1 px-2 text-center font-mono">Used</th>
                    <th className="py-1 px-2 text-center font-mono font-bold text-emerald-700 border-r border-slate-200">Left</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReportData.length === 0 ? (
                    <tr>
                      <td colSpan={15} className="py-8 text-center text-slate-400 text-xs">
                        No employees found matching current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredReportData.map((item) => {
                      return (
                        <tr
                          key={item.employee.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          {/* Employee Identity */}
                          <td className="py-2.5 px-3 border-r border-slate-100">
                            <div className="flex items-center gap-2">
                              <img
                                src={item.employee.avatar}
                                alt={item.employee.name}
                                className="w-7 h-7 rounded-full object-cover border border-slate-200 bg-slate-100 shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(item.employee.name);
                                }}
                              />
                              <div>
                                <div className="font-semibold text-slate-900 text-xs flex items-center gap-1">
                                  <span>{item.employee.name}</span>
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {item.employee.employeeId} · {item.employee.department}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Annual */}
                          <td className="py-2 px-2 text-center font-mono text-slate-600">{item.balance.annualUsed}</td>
                          <td className="py-2 px-2 text-center font-mono font-bold text-emerald-700 border-r border-slate-100">{item.annualRemaining}</td>

                          {/* Casual */}
                          <td className="py-2 px-2 text-center font-mono text-slate-600">{item.balance.casualUsed}</td>
                          <td className="py-2 px-2 text-center font-mono font-bold text-emerald-700 border-r border-slate-100">{item.casualRemaining}</td>

                          {/* Medical */}
                          <td className="py-2 px-2 text-center font-mono text-slate-600">{item.balance.medicalUsed}</td>
                          <td className="py-2 px-2 text-center font-mono font-bold text-emerald-700 border-r border-slate-100">{item.medicalRemaining}</td>

                          {/* Maternity */}
                          <td className="py-2 px-2 text-center font-mono text-slate-600">{item.maternityUsed}</td>
                          <td className="py-2 px-2 text-center font-mono font-bold text-emerald-700 border-r border-slate-100">{item.maternityRemaining}</td>

                          {/* Paternity */}
                          <td className="py-2 px-2 text-center font-mono text-slate-600">{item.paternityUsed}</td>
                          <td className="py-2 px-2 text-center font-mono font-bold text-emerald-700 border-r border-slate-100">{item.paternityRemaining}</td>

                          {/* Unpaid */}
                          <td className="py-2 px-2 text-center font-mono text-slate-600">{item.unpaidUsed}</td>
                          <td className="py-2 px-2 text-center font-mono font-bold text-emerald-700 border-r border-slate-100">{item.unpaidRemaining}</td>

                          {/* Requests status */}
                          <td className="py-2.5 px-3 text-center border-r border-slate-100">
                            {item.pendingCount > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                <Clock className="w-3 h-3" />
                                <span>{item.pendingCount} Pending</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                                <CheckCircle className="w-3 h-3 text-emerald-600" />
                                <span>{item.approvedCount} Done</span>
                              </span>
                            )}
                          </td>

                          {/* Action */}
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => {
                                setDossierEmpId(item.employee.employeeId);
                                setActiveTab('individualEmployee');
                              }}
                              className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            >
                              View &rarr;
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

          {/* Master Leave Applications Ledger for All Employees */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>
                    {language === 'my'
                      ? 'ခွင့်တောင်းဆိုလွှာများနှင့် ခွင့်ပြုချက်များ (Applications & Approval Register)'
                      : 'Leave Applications & Approval Register'}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {statusTab !== 'all'
                    ? `Filtered by: ${statusTab.toUpperCase()} (${filteredLeaves.length} records)`
                    : 'All submitted requests with real-time HR approval actions'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintAllDetailed}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
                  title="Print all employee detailed leave report with dates on A4 format"
                >
                  <Printer className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{language === 'my' ? 'ခွင့်မှတ်တမ်း A4 ပုံနှိပ်မည်' : 'Print Detailed Report (A4)'}</span>
                </button>
                <span className="text-xs text-slate-500 font-mono">
                  Showing {filteredLeaves.length} of {leaves.length} records
                </span>
              </div>
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
                    <th className="py-3 px-4 text-right no-print">Actions</th>
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
                      return (
                        <tr
                          key={leave.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <span>{leave.employeeName}</span>
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

                          <td className="py-3.5 px-4 text-right no-print">
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
                                  setActiveTab('individualEmployee');
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
      {/* VIEW MODE 2: INDIVIDUAL EMPLOYEE BALANCE DOSSIER (EACH EMPLOYEE) */}
      {/* ========================================================================= */}
      {activeTab === 'individualEmployee' && dossierEmployee && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Print Only Header for Individual Profile */}
          <div className="print-only mb-6 border-b-2 border-slate-900 pb-3">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-xl font-bold text-slate-900">NexHR — Individual Employee Leave Ledger</h1>
                <p className="text-xs text-slate-600">Employee: {dossierEmployee.name} ({dossierEmployee.employeeId}) — {dossierEmployee.department}</p>
              </div>
              <div className="text-right text-xs text-slate-600 font-mono">
                <div>Printed: {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString()}</div>
                <div>Status Filter: {statusTab.toUpperCase()}</div>
              </div>
            </div>
          </div>

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
                onClick={() => handlePrintIndividualDetailed(dossierEmpId)}
                className="px-3 py-1.5 bg-white text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold hover:bg-indigo-50 transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
                title="Print complete individual leave statement & history for this employee on A4 paper"
              >
                <Printer className="w-3.5 h-3.5 text-indigo-600" />
                <span>{language === 'my' ? 'ခွင့်စာရင်း A4 ပုံနှိပ်မည်' : 'Print Statement (A4)'}</span>
              </button>
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
                <span className="text-[10px] font-mono text-slate-400">Section 4 ({annualDays}d Paid)</span>
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
              'border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">{t.casualLeave}</span>
                <span className="text-[10px] font-mono text-slate-400">Section 5 ({casualDays}d Paid)</span>
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
                  
                </span>
                <span>Max 3 consecutive</span>
              </div>
            </div>

            {/* 3. Medical Leave */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">{t.medicalLeave}</span>
                <span className="text-[10px] font-mono text-slate-400">Section 6 ({medicalDays}d Paid)</span>
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
                {filteredDossierLeaves.length} record{filteredDossierLeaves.length !== 1 ? 's' : ''} on file
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                    <th className="py-3 px-4">Leave Type</th>
                    <th className="py-3 px-4">Duration &amp; Dates</th>
                    <th className="py-3 px-3 text-center">Days</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Emergency Phone</th>
                    <th className="py-3 px-4">Review Status</th>
                    <th className="py-3 px-4">Remarks &amp; Approver</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDossierLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                        No leave requests found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredDossierLeaves.map((leave) => {
                      return (
                        <tr
                          key={leave.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="py-3.5 px-4 font-semibold text-slate-900 capitalize flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-indigo-500" />
                            <span>{leave.leaveType} Leave</span>
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

      {/* ========================================================================= */}
      {/* MODAL: WINDOWS PRINT PREVIEW & A4 PRINTER DIALOG */}
      {/* ========================================================================= */}
      {isPrintModalOpen && (
        <div className="print-modal-container fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
          <div className="print-modal-box w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[96vh]">
            {/* Modal Header (hidden in print) */}
            <div className="no-print px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-xs">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {language === 'my'
                      ? 'ဝန်ထမ်းအားလုံး ခွင့်လက်ကျန် အနှစ်ချုပ် (A4 Landscape Print)'
                      : 'All Employees Leave Balance Summary (A4 Landscape Print)'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'my'
                      ? 'A4 Landscape အလျားလိုက် (297 × 210 mm) · တရားဝင် ခွင့်လက်ကျန် စာရင်းချုပ်'
                      : 'Standard A4 Landscape (297 × 210 mm) · Statutory Leave Balance Summary'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action Toolbar inside modal (hidden in print) */}
            <div className="no-print px-6 py-3 bg-indigo-50/60 border-b border-indigo-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
              {/* Primary action buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleDirectPrintNow}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
                  title="Open Windows Printer Dialog Box to print this A4 document"
                >
                  <Printer className="w-4 h-4" />
                  <span>{language === 'my' ? 'Print to Windows Printer (A4)' : 'Print to Windows Printer (A4)'}</span>
                </button>

                <button
                  onClick={handleExportPNG}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
                  title="Download report in PNG file format ('All Employee Leave Balance Report.png')"
                >
                  <FileImage className="w-4 h-4" />
                  <span>{language === 'my' ? 'PNG ထုတ်ယူမည် (.png)' : 'Export PNG (.png)'}</span>
                </button>

                <button
                  onClick={() => handleDownloadPrintableHTML()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
                  title="Download standalone A4 HTML file that auto-opens print dialog in any browser"
                >
                  <Download className="w-4 h-4 text-indigo-600" />
                  <span>{language === 'my' ? 'A4 ဖိုင် ဒေါင်းလုဒ် (.HTML)' : 'Download A4 HTML'}</span>
                </button>

                <button
                  onClick={handleExportExcel}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
                  title="Export records to Excel spreadsheet"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Excel (.xls)</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
                  title="Export records to CSV"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  <span>CSV</span>
                </button>
              </div>

              {/* Report Type Selector & Controls */}
              <div className="flex flex-wrap items-center gap-2.5 text-xs">
                {/* 3 Dedicated Report Tabs */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => {
                      setPrintReportType('all-summary');
                      setPrintScope('all');
                      setPrintOrientation('landscape');
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      printReportType === 'all-summary'
                        ? 'bg-white text-indigo-950 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileImage className="w-3.5 h-3.5 text-emerald-600" />
                    <span>1. Leave Balance Summary (A4 Landscape)</span>
                  </button>

                  <button
                    onClick={() => {
                      setPrintReportType('all-detailed');
                      setPrintScope('all');
                      setPrintOrientation('landscape');
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      printReportType === 'all-detailed'
                        ? 'bg-white text-indigo-950 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>2. All Employee Detail Report with Dates (A4 Landscape)</span>
                  </button>

                  <button
                    onClick={() => {
                      setPrintReportType('individual-detailed');
                      setPrintScope('individual');
                      setPrintOrientation('portrait');
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      printReportType === 'individual-detailed'
                        ? 'bg-white text-indigo-950 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                    <span>3. Each Employee Detail Report (A4 Portrait)</span>
                  </button>
                </div>

                {/* When Individual is selected, show Employee dropdown */}
                {printReportType === 'individual-detailed' && (
                  <div className="flex items-center gap-1.5 bg-white border border-indigo-200 px-2 py-1 rounded-xl shadow-2xs">
                    <span className="text-[11px] font-semibold text-indigo-950">Employee:</span>
                    <select
                      value={printSelectedEmpId}
                      onChange={(e) => setPrintSelectedEmpId(e.target.value)}
                      className="text-xs font-bold text-slate-800 bg-transparent border-none focus:outline-none cursor-pointer"
                    >
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.employeeId}>
                          {emp.name} ({emp.employeeId}) · {emp.department}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Paper Orientation Badge */}
                <div className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg font-mono text-[11px] font-semibold flex items-center gap-1.5 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    {printReportType === 'individual-detailed'
                      ? 'A4 Portrait (210 × 297 mm)'
                      : 'A4 Landscape (297 × 210 mm)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Notice / Status Tip */}
            {printStatusNotice && (
              <div className="no-print px-6 py-2.5 bg-indigo-50 border-b border-indigo-200 text-indigo-900 text-xs flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>{printStatusNotice}</span>
                </div>
                <button
                  onClick={() => setPrintStatusNotice(null)}
                  className="text-indigo-600 hover:text-indigo-800 text-xs underline font-medium ml-2 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Scrollable A4 Document Paper Sheet Preview */}
            <div className="p-6 sm:p-8 bg-slate-200/80 overflow-y-auto flex-1">
              <div
                id="printable-a4-sheet"
                className={`bg-white border border-slate-300 shadow-xl rounded-sm p-8 sm:p-10 mx-auto text-slate-800 font-sans ${
                  printReportType === 'individual-detailed' ? 'max-w-[850px] w-full' : 'max-w-[1120px] w-full'
                }`}
              >
                {/* Official Report Header */}
                <div className="border-b-2 border-slate-900 pb-3 mb-5 flex flex-wrap justify-between items-end gap-3">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                      {printReportType === 'all-summary'
                        ? 'All Employees Leave Balance Summary'
                        : printReportType === 'all-detailed'
                        ? 'All Employees Detailed Leave Applications & Dates Audit Report'
                        : `Individual Employee Leave Dossier & Statement — ${printEmployee.name}`}
                    </h1>
                    <div className="text-sm font-bold text-indigo-950 mt-1">
                      {printReportType === 'all-summary'
                        ? 'NexHR Enterprise · Statutory Leave Entitlement & Balance Register'
                        : printReportType === 'all-detailed'
                        ? 'NexHR Enterprise · Complete Statutory Leave Register With Detailed Dates & Approvals'
                        : 'NexHR Enterprise · Comprehensive Statutory Leave Ledger, Balance Audit & Historical Date Log'}
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-600 space-y-0.5 font-mono">
                    <div><strong>Date:</strong> {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <div><strong>Report Format:</strong> {printReportType === 'individual-detailed' ? 'A4 Portrait (210 × 297 mm)' : 'A4 Landscape (297 × 210 mm)'}</div>
                    <div><strong>Form No:</strong> {printReportType === 'individual-detailed' ? 'NX-HR-IND-LVE-2026' : 'NX-HR-LVE-2026'} / Myanmar Leave &amp; Holidays Act 1951</div>
                  </div>
                </div>

                {/* ============================================================== */}
                {/* 1. REPORT VIEW 1: All Employees Leave Balance Summary (16 columns) */}
                {/* ============================================================== */}
                {printReportType === 'all-summary' && (
                  <div className="mb-6 overflow-x-auto">
                    <table className="w-full text-[11px] border-collapse border border-slate-300">
                      <thead>
                        <tr className="bg-slate-100 text-slate-800 text-left">
                          <th rowSpan={2} className="border border-slate-300 px-2 py-1.5 font-bold">Employee ID</th>
                          <th rowSpan={2} className="border border-slate-300 px-2 py-1.5 font-bold">Name</th>
                          <th rowSpan={2} className="border border-slate-300 px-2 py-1.5 font-bold">Department</th>
                          <th rowSpan={2} className="border border-slate-300 px-2 py-1.5 font-bold">Role</th>
                          <th colSpan={2} className="border border-slate-300 px-2 py-1.5 font-bold text-center">Annual ({annualDays}d)</th>
                          <th colSpan={2} className="border border-slate-300 px-2 py-1.5 font-bold text-center">Casual ({casualDays}d)</th>
                          <th colSpan={2} className="border border-slate-300 px-2 py-1.5 font-bold text-center">Medical ({medicalDays}d)</th>
                          <th colSpan={2} className="border border-slate-300 px-2 py-1.5 font-bold text-center">Statutory Maternity({maternityDays}d)</th>
                          <th colSpan={2} className="border border-slate-300 px-2 py-1.5 font-bold text-center">Paternity Support ({paternityDays}d)</th>
                          <th colSpan={2} className="border border-slate-300 px-2 py-1.5 font-bold text-center">Unpaid ({unpaidDays}d)</th>
                        </tr>
                        <tr className="bg-slate-100 text-slate-700 text-center text-[10px]">
                          <th className="border border-slate-300 px-1.5 py-1 font-semibold">Used</th>
                          <th className="border border-slate-300 px-1.5 py-1 font-semibold">Left</th>
                          <th className="border border-slate-300 px-1.5 py-1 font-semibold">Used</th>
                          <th className="border border-slate-300 px-1.5 py-1 font-semibold">Left</th>
                          <th className="border border-slate-300 px-1.5 py-1 font-semibold">Used</th>
                          <th className="border border-slate-300 px-1.5 py-1 font-semibold">Left</th>
                          <th className="border border-slate-300 px-1.5 py-1 font-semibold">Used</th>
                          <th className="border border-slate-300 px-1.5 py-1 font-semibold">Left</th>
                          <th className="border border-slate-300 px-1.5 py-1 font-semibold">Used</th>
                          <th className="border border-slate-300 px-1.5 py-1 font-semibold">Left</th>
                          <th className="border border-slate-300 px-1.5 py-1 font-semibold">Used</th>
                          <th className="border border-slate-300 px-1.5 py-1 font-semibold">Left</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allEmployeesReportData.map((item) => (
                          <tr key={item.employee.id} className="hover:bg-slate-50">
                            <td className="border border-slate-300 px-2 py-1.5 font-mono text-[10.5px]">{item.employee.employeeId}</td>
                            <td className="border border-slate-300 px-2 py-1.5 font-semibold text-slate-900">{item.employee.name}</td>
                            <td className="border border-slate-300 px-2 py-1.5 text-slate-600">{item.employee.department}</td>
                            <td className="border border-slate-300 px-2 py-1.5 text-slate-600">{item.employee.role}</td>
                            <td className="border border-slate-300 px-1.5 py-1.5 text-center font-mono">{item.balance.annualUsed}</td>
                            <td className="border border-slate-300 px-1.5 py-1.5 text-center font-mono font-bold text-emerald-700">{item.annualRemaining}</td>
                            <td className="border border-slate-300 px-1.5 py-1.5 text-center font-mono">{item.balance.casualUsed}</td>
                            <td className="border border-slate-300 px-1.5 py-1.5 text-center font-mono font-bold text-emerald-700">{item.casualRemaining}</td>
                            <td className="border border-slate-300 px-1.5 py-1.5 text-center font-mono">{item.balance.medicalUsed}</td>
                            <td className="border border-slate-300 px-1.5 py-1.5 text-center font-mono font-bold text-emerald-700">{item.medicalRemaining}</td>
                            <td className="border border-slate-300 px-1.5 py-1.5 text-center font-mono">{item.maternityUsed}</td>
                            <td className="border border-slate-300 px-1.5 py-1.5 text-center font-mono font-bold text-emerald-700">{item.maternityRemaining}</td>
                            <td className="border border-slate-300 px-1.5 py-1.5 text-center font-mono">{item.paternityUsed}</td>
                            <td className="border border-slate-300 px-1.5 py-1.5 text-center font-mono font-bold text-emerald-700">{item.paternityRemaining}</td>
                            <td className="border border-slate-300 px-1.5 py-1.5 text-center font-mono">{item.unpaidUsed}</td>
                            <td className="border border-slate-300 px-1.5 py-1.5 text-center font-mono font-bold text-emerald-700">{item.unpaidRemaining}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* ============================================================== */}
                {/* 2. REPORT VIEW 2: All Employees Detailed Leave Report (With Dates) */}
                {/* ============================================================== */}
                {printReportType === 'all-detailed' && (
                  <div className="mb-6 space-y-4">
                    {/* Summary metrics header */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="text-[10px] text-slate-500 font-medium">Total Applications</div>
                        <div className="text-base font-bold text-slate-900 font-mono mt-0.5">{leaves.length} records</div>
                      </div>
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <div className="text-[10px] text-emerald-700 font-medium">Approved Leaves</div>
                        <div className="text-base font-bold text-emerald-800 font-mono mt-0.5">
                          {leaves.filter((l) => l.status === 'approved').length} requests ({leaves.filter((l) => l.status === 'approved').reduce((s, l) => s + l.daysCount, 0)}d)
                        </div>
                      </div>
                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="text-[10px] text-amber-700 font-medium">Pending Review</div>
                        <div className="text-base font-bold text-amber-800 font-mono mt-0.5">
                          {leaves.filter((l) => l.status === 'pending').length} requests
                        </div>
                      </div>
                      <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg">
                        <div className="text-[10px] text-rose-700 font-medium">Rejected</div>
                        <div className="text-base font-bold text-rose-800 font-mono mt-0.5">
                          {leaves.filter((l) => l.status === 'rejected').length} requests
                        </div>
                      </div>
                    </div>

                    {/* Detailed Records Table with Dates */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-[11px] border-collapse border border-slate-300">
                        <thead>
                          <tr className="bg-slate-100 text-slate-800 text-left font-bold">
                            <th className="border border-slate-300 px-2 py-1.5 text-center w-8">#</th>
                            <th className="border border-slate-300 px-2 py-1.5 w-20">Ref ID</th>
                            <th className="border border-slate-300 px-2 py-1.5">Employee</th>
                            <th className="border border-slate-300 px-2 py-1.5">Department</th>
                            <th className="border border-slate-300 px-2 py-1.5">Leave Type</th>
                            <th className="border border-slate-300 px-2 py-1.5 text-center font-bold text-slate-900">Start Date</th>
                            <th className="border border-slate-300 px-2 py-1.5 text-center font-bold text-slate-900">End Date</th>
                            <th className="border border-slate-300 px-2 py-1.5 text-center font-bold">Days</th>
                            <th className="border border-slate-300 px-2 py-1.5 text-center">Applied Date</th>
                            <th className="border border-slate-300 px-2 py-1.5">Reason &amp; Emergency Phone</th>
                            <th className="border border-slate-300 px-2 py-1.5 text-center">Status</th>
                            <th className="border border-slate-300 px-2 py-1.5">HR Approver &amp; Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leaves.map((l, idx) => (
                            <tr key={l.id} className="hover:bg-slate-50">
                              <td className="border border-slate-300 px-2 py-1.5 text-center font-mono text-slate-500">{idx + 1}</td>
                              <td className="border border-slate-300 px-2 py-1.5 font-mono font-bold text-slate-900 text-[10px]">{l.id}</td>
                              <td className="border border-slate-300 px-2 py-1.5">
                                <div className="font-bold text-slate-900">{l.employeeName}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{l.employeeId}</div>
                              </td>
                              <td className="border border-slate-300 px-2 py-1.5 text-slate-600">{l.department}</td>
                              <td className="border border-slate-300 px-2 py-1.5 font-semibold capitalize text-slate-800">{l.leaveType}</td>
                              <td className="border border-slate-300 px-2 py-1.5 text-center font-mono font-bold text-slate-900">{l.startDate}</td>
                              <td className="border border-slate-300 px-2 py-1.5 text-center font-mono font-bold text-slate-900">{l.endDate}</td>
                              <td className="border border-slate-300 px-2 py-1.5 text-center font-mono font-bold text-slate-900">{l.daysCount}d</td>
                              <td className="border border-slate-300 px-2 py-1.5 text-center font-mono text-slate-500 text-[10px]">{l.appliedDate}</td>
                              <td className="border border-slate-300 px-2 py-1.5">
                                <div className="text-slate-700 italic">"{l.reason}"</div>
                                {l.emergencyPhone && (
                                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">📞 {l.emergencyPhone}</div>
                                )}
                              </td>
                              <td className="border border-slate-300 px-2 py-1.5 text-center">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    l.status === 'approved'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : l.status === 'rejected'
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {l.status}
                                </span>
                              </td>
                              <td className="border border-slate-300 px-2 py-1.5 text-slate-700">
                                {l.reviewedBy ? (
                                  <div>
                                    <div className="font-semibold text-slate-900">{l.reviewedBy}</div>
                                    {l.managerComment && (
                                      <div className="text-[10px] text-slate-500 italic mt-0.5">"{l.managerComment}"</div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic text-[10px]">Pending Review</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ============================================================== */}
                {/* 3. REPORT VIEW 3: Each Employee Detailed Statement (With Dates & Balances) */}
                {/* ============================================================== */}
                {printReportType === 'individual-detailed' && (
                  <div className="mb-6 space-y-5">
                    {/* Employee Profile Information Card */}
                    <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 font-medium">Employee Name:</span>
                        <div className="text-base font-bold text-slate-900 mt-0.5">
                          {printEmployee.name} {printEmployee.nameMyanmar && <span className="text-indigo-600 text-xs font-normal">({printEmployee.nameMyanmar})</span>}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Employee ID:</span>
                        <div className="text-sm font-mono font-bold text-indigo-700 mt-0.5">{printEmployee.employeeId}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Department &amp; Role:</span>
                        <div className="font-semibold text-slate-800 mt-0.5">{printEmployee.department} · {printEmployee.role}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Date of Joining:</span>
                        <div className="font-mono text-slate-700 mt-0.5">{printEmployee.joinDate}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">NRC Number:</span>
                        <div className="font-mono text-slate-700 mt-0.5">{printEmployee.nrcNumber}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Reporting Manager:</span>
                        <div className="font-semibold text-slate-800 mt-0.5">{printEmployee.reportingManager || 'Daw Khin Thuzar'}</div>
                      </div>
                    </div>

                    {/* Section 1: Statutory Entitlement & Current Balance */}
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 border-l-2 border-indigo-600 pl-2">
                        1. Statutory Leave Entitlement &amp; Current Balance Status
                      </h3>
                      <table className="w-full text-[11px] border-collapse border border-slate-300">
                        <thead>
                          <tr className="bg-slate-100 text-slate-800 text-left font-bold">
                            <th className="border border-slate-300 px-2 py-1.5">Statutory Leave Type</th>
                            <th className="border border-slate-300 px-2 py-1.5 text-center w-24">Entitlement</th>
                            <th className="border border-slate-300 px-2 py-1.5 text-center w-24">Days Taken</th>
                            <th className="border border-slate-300 px-2 py-1.5 text-center w-28">Remaining Balance</th>
                            <th className="border border-slate-300 px-2 py-1.5">Labor Statute / Policy Rule</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-slate-300 px-2 py-1.5 font-bold">Annual Leave</td>
                            <td className="border border-slate-300 px-2 py-1.5 text-center font-mono">{annualDays} days</td>
                            <td className="border border-slate-300 px-2 py-1.5 text-center font-mono">{printEmployeeBalance.annualUsed} days</td>
                            <td className="border border-slate-300 px-2 py-1.5 text-center font-mono font-bold text-emerald-700">
                              {Math.max(0, printEmployeeBalance.annualTotal - printEmployeeBalance.annualUsed)} days
                            </td>
                            <td className="border border-slate-300 px-2 py-1.5 text-slate-500 text-[10px]">Myanmar Leave &amp; Holidays Act 1951, Section 4</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-300 px-2 py-1.5 font-bold">Casual Leave</td>
                            <td className="border border-slate-300 px-2 py-1.5 text-center font-mono">{casualDays} days</td>
                            <td className="border border-slate-300 px-2 py-1.5 text-center font-mono">{printEmployeeBalance.casualUsed} days</td>
                            <td className="border border-slate-300 px-2 py-1.5 text-center font-mono font-bold text-emerald-700">
                              {Math.max(0, printEmployeeBalance.casualTotal - printEmployeeBalance.casualUsed)} days
                            </td>
                            <td className="border border-slate-300 px-2 py-1.5 text-slate-500 text-[10px]">Myanmar Leave &amp; Holidays Act 1951, Section 5</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-300 px-2 py-1.5 font-bold">Medical Leave</td>
                            <td className="border border-slate-300 px-2 py-1.5 text-center font-mono">{medicalDays} days</td>
                            <td className="border border-slate-300 px-2 py-1.5 text-center font-mono">{printEmployeeBalance.medicalUsed} days</td>
                            <td className="border border-slate-300 px-2 py-1.5 text-center font-mono font-bold text-emerald-700">
                              {Math.max(0, printEmployeeBalance.medicalTotal - printEmployeeBalance.medicalUsed)} days
                            </td>
                            <td className="border border-slate-300 px-2 py-1.5 text-slate-500 text-[10px]">Myanmar Leave &amp; Holidays Act 1951, Section 6</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-300 px-2 py-1.5 font-bold">Statutory Maternity Leave</td>
                            <td className="border border-slate-300 px-2 py-1.5 text-center font-mono">{maternityDays} days</td>
                            <td className="border border-slate-300 px-2 py-1.5 text-center font-mono">{printEmployeeBalance.maternityUsed} days</td>
                            <td className="border border-slate-300 px-2 py-1.5 text-center font-mono font-bold text-emerald-700">
                              {Math.max(0, printEmployeeBalance.maternityTotal - printEmployeeBalance.maternityUsed)} days
                            </td>
                            <td className="border border-slate-300 px-2 py-1.5 text-slate-500 text-[10px]">Social Security Law 2012 (Female staff)</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-300 px-2 py-1.5 font-bold">Paternity Support Leave</td>
                            <td className="border border-slate-300 px-2 py-1.5 text-center font-mono">{paternityDays} days</td>
                            <td className="border border-slate-300 px-2 py-1.5 text-center font-mono">
                              {printEmployeeLeaves.filter((l) => l.leaveType === 'paternity' && l.status === 'approved').reduce((s, l) => s + l.daysCount, 0)} days
                            </td>
                            <td className="border border-slate-300 px-2 py-1.5 text-center font-mono font-bold text-emerald-700">
                              {Math.max(0, paternityDays - printEmployeeLeaves.filter((l) => l.leaveType === 'paternity' && l.status === 'approved').reduce((s, l) => s + l.daysCount, 0))} days
                            </td>
                            <td className="border border-slate-300 px-2 py-1.5 text-slate-500 text-[10px]">NexHR Family Support Policy</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-300 px-2 py-1.5 font-bold">Unpaid Leave</td>
                            <td className="border border-slate-300 px-2 py-1.5 text-center font-mono">{unpaidDays} days</td>
                            <td className="border border-slate-300 px-2 py-1.5 text-center font-mono">
                              {printEmployeeLeaves.filter((l) => l.leaveType === 'unpaid' && l.status === 'approved').reduce((s, l) => s + l.daysCount, 0)} days
                            </td>
                            <td className="border border-slate-300 px-2 py-1.5 text-center font-mono font-bold text-emerald-700">
                              {Math.max(0, unpaidDays - printEmployeeLeaves.filter((l) => l.leaveType === 'unpaid' && l.status === 'approved').reduce((s, l) => s + l.daysCount, 0))} days
                            </td>
                            <td className="border border-slate-300 px-2 py-1.5 text-slate-500 text-[10px]">Company Discretionary Leave</td>
                          </tr>
                          <tr className="bg-indigo-50/50 font-bold">
                            <td className="border border-slate-300 px-2 py-1.5 text-indigo-950">Total Paid Statutory Leave</td>
                            <td className="border border-slate-300 px-2 py-1.5 text-center font-mono text-indigo-950">
                              {printEmployeeBalance.annualTotal + printEmployeeBalance.casualTotal + printEmployeeBalance.medicalTotal} days
                            </td>
                            <td className="border border-slate-300 px-2 py-1.5 text-center font-mono text-indigo-950">
                              {printEmployeeBalance.annualUsed + printEmployeeBalance.casualUsed + printEmployeeBalance.medicalUsed} days
                            </td>
                            <td className="border border-slate-300 px-2 py-1.5 text-center font-mono text-emerald-800 text-xs">
                              {Math.max(
                                0,
                                printEmployeeBalance.annualTotal +
                                  printEmployeeBalance.casualTotal +
                                  printEmployeeBalance.medicalTotal -
                                  (printEmployeeBalance.annualUsed + printEmployeeBalance.casualUsed + printEmployeeBalance.medicalUsed)
                              )} days
                            </td>
                            <td className="border border-slate-300 px-2 py-1.5 text-slate-500 text-[10px]">Net annual statutory leave availability</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Section 2: Detailed Leave Application & History with Dates */}
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 border-l-2 border-indigo-600 pl-2">
                        2. Detailed Leave Application &amp; Attendance History (With Full Dates)
                      </h3>
                      {printEmployeeLeaves.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-xs">
                          No historical leave applications recorded for this employee in the current calendar year.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-[11px] border-collapse border border-slate-300">
                            <thead>
                              <tr className="bg-slate-100 text-slate-800 text-left font-bold">
                                <th className="border border-slate-300 px-2 py-1.5 w-20">Ref ID</th>
                                <th className="border border-slate-300 px-2 py-1.5">Leave Type</th>
                                <th className="border border-slate-300 px-2 py-1.5 text-center font-bold text-slate-900">Start Date</th>
                                <th className="border border-slate-300 px-2 py-1.5 text-center font-bold text-slate-900">End Date</th>
                                <th className="border border-slate-300 px-2 py-1.5 text-center font-bold">Days</th>
                                <th className="border border-slate-300 px-2 py-1.5 text-center">Applied Date</th>
                                <th className="border border-slate-300 px-2 py-1.5">Reason</th>
                                <th className="border border-slate-300 px-2 py-1.5 text-center">Status</th>
                                <th className="border border-slate-300 px-2 py-1.5">Approver &amp; Remarks</th>
                              </tr>
                            </thead>
                            <tbody>
                              {printEmployeeLeaves.map((l) => (
                                <tr key={l.id} className="hover:bg-slate-50">
                                  <td className="border border-slate-300 px-2 py-1.5 font-mono font-bold text-slate-900 text-[10px]">{l.id}</td>
                                  <td className="border border-slate-300 px-2 py-1.5 font-bold capitalize text-slate-800">{l.leaveType}</td>
                                  <td className="border border-slate-300 px-2 py-1.5 text-center font-mono font-bold text-slate-900">{l.startDate}</td>
                                  <td className="border border-slate-300 px-2 py-1.5 text-center font-mono font-bold text-slate-900">{l.endDate}</td>
                                  <td className="border border-slate-300 px-2 py-1.5 text-center font-mono font-bold text-slate-900">{l.daysCount}d</td>
                                  <td className="border border-slate-300 px-2 py-1.5 text-center font-mono text-slate-500 text-[10px]">{l.appliedDate}</td>
                                  <td className="border border-slate-300 px-2 py-1.5 italic text-slate-700">"{l.reason}"</td>
                                  <td className="border border-slate-300 px-2 py-1.5 text-center">
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                        l.status === 'approved'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : l.status === 'rejected'
                                          ? 'bg-rose-100 text-rose-800'
                                          : 'bg-amber-100 text-amber-800'
                                      }`}
                                    >
                                      {l.status}
                                    </span>
                                  </td>
                                  <td className="border border-slate-300 px-2 py-1.5 text-slate-700">
                                    {l.reviewedBy ? (
                                      <div>
                                        <div className="font-semibold text-slate-900">{l.reviewedBy}</div>
                                        {l.managerComment && (
                                          <div className="text-[10px] text-slate-500 italic mt-0.5">"{l.managerComment}"</div>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-slate-400 italic text-[10px]">Pending Review</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sign-off Blocks */}
                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-300 text-center text-xs text-slate-600">
                  {printReportType === 'individual-detailed' && (
                    <div className="border-t border-dashed border-slate-400 pt-2">
                      <div className="font-bold text-slate-800">{printEmployee.name}</div>
                      <div>Employee Signature</div>
                      <div className="text-[10px] text-slate-400">Acknowledged &amp; Certified</div>
                    </div>
                  )}
                  <div className="border-t border-dashed border-slate-400 pt-2">
                    <div className="font-bold text-slate-800">Daw Khin Thuzar</div>
                    <div>HR Operations Manager</div>
                    <div className="text-[10px] text-slate-400">Prepared &amp; Verified</div>
                  </div>
                  <div className="border-t border-dashed border-slate-400 pt-2">
                    <div className="font-bold text-slate-800">U Thein Lwin Oo</div>
                    <div>Executive Director</div>
                    <div className="text-[10px] text-slate-400">Authorized &amp; Signed</div>
                  </div>
                  {printReportType !== 'individual-detailed' && (
                    <div className="border-t border-dashed border-slate-400 pt-2">
                      <div className="font-bold text-slate-800">NexHR ERP Cloud</div>
                      <div>Official System Stamp</div>
                      <div className="text-[10px] text-slate-400 font-mono">NX-2026-CERTIFIED</div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-400 font-mono">
                  Official Statutory Leave Ledger Record ({printReportType === 'individual-detailed' ? 'A4 Portrait' : 'A4 Landscape'}) · Confirmed under Myanmar Leave &amp; Holidays Act 1951
                </div>
              </div>
            </div>

            {/* Modal Bottom Footer (hidden in print) */}
            <div className="no-print px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="text-xs text-slate-500">
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px] text-slate-700 shadow-2xs">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px] text-slate-700 shadow-2xs">P</kbd> opens Windows Printer Dialog
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="px-4 py-2 font-semibold text-xs text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleExportPNG}
                  className="inline-flex items-center gap-1.5 px-4 py-2 font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
                  title="Download All Employee Leave Balance Report.png"
                >
                  <FileImage className="w-4 h-4" />
                  <span>{language === 'my' ? 'PNG ထုတ်ယူမည် (.png)' : 'Export PNG (.png)'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDirectPrintNow}
                  className="inline-flex items-center gap-1.5 px-4 py-2 font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print to Windows Printer (A4)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
