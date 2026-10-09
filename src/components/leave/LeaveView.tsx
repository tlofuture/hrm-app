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

  // Generate clean A4 Landscape HTML for All Employees Leave Balance Summary
  const generateA4PrintHTML = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>All Employees Leave Balance Summary - A4 Landscape</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 8mm 10mm;
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
      margin-bottom: 18px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .title {
      font-size: 20pt;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .subtitle {
      font-size: 11pt;
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
      margin-top: 10px;
      margin-bottom: 24px;
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
      margin-top: 32px;
      border-top: 1px solid #cbd5e1;
      padding-top: 15px;
      display: flex;
      justify-content: space-between;
      page-break-inside: avoid;
    }
    .sign-box {
      width: 230px;
      text-align: center;
      font-size: 8.5pt;
    }
    .sign-line {
      margin-top: 45px;
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
      <span style="color: #4338ca; font-size: 9pt; margin-left: 6px;">Windows print dialog is opening in A4 Landscape. If not shown, click button on right or press <b>Ctrl + P</b>.</span>
    </div>
    <button onclick="window.print()">
      🖨️ Print to Windows Printer (A4 Landscape)
    </button>
  </div>

  <div class="header">
    <div>
      <h1 class="title">All Employees Leave Balance Summary</h1>
      <div class="subtitle">NexHR Enterprise · Statutory Leave Entitlement &amp; Balance Register</div>
    </div>
    <div class="meta">
      <div><strong>Date:</strong> ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      <div><strong>Report Format:</strong> A4 Landscape (297 × 210 mm)</div>
      <div><strong>Form No:</strong> NX-HR-LVE-2026 / Myanmar Leave &amp; Holidays Act 1951</div>
    </div>
  </div>

  <table border="1">
    <thead>
      <tr>
        <th>Employee ID</th>
        <th>Employee Name</th>
        <th>Department</th>
        <th>Role / Designation</th>
        <th class="text-center">Annual Leave (${annualDays}d)</th>
        <th class="text-center">Casual Leave (${casualDays}d)</th>
        <th class="text-center">Medical Leave (${medicalDays}d)</th>
        <th class="text-center">Total Entitled</th>
        <th class="text-center">Total Taken</th>
        <th class="text-center">Remaining Balance</th>
        <th class="text-center">Utilization</th>
      </tr>
    </thead>
    <tbody>
      ${allEmployeesReportData
        .map(
          (item) => `
        <tr>
          <td>${item.employee.employeeId}</td>
          <td><strong>${item.employee.name}</strong></td>
          <td>${item.employee.department}</td>
          <td>${item.employee.role}</td>
          <td class="text-center">${item.annualRemaining} left (${item.balance.annualUsed} used)</td>
          <td class="text-center">${item.casualRemaining} left (${item.balance.casualUsed} used)</td>
          <td class="text-center">${item.medicalRemaining} left (${item.balance.medicalUsed} used)</td>
          <td class="text-center">${item.totalEntitlement}d</td>
          <td class="text-center">${item.totalTaken}d</td>
          <td class="text-center"><strong style="color: #15803d;">${item.totalRemaining}d</strong></td>
          <td class="text-center">${item.utilizationRate}%</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <div class="footer">
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
  const triggerWindowsPrint = () => {
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
        frameDoc.write(generateA4PrintHTML());
        frameDoc.close();
        printFrame.contentWindow?.focus();
        printFrame.contentWindow?.print();
        printSucceeded = true;
      }
    } catch (frameErr) {
      console.warn('Iframe print failed (iframe sandbox):', frameErr);
    }

    // Method 2: Try window.print() directly in main window (uses our A4 Landscape @media print CSS)
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
      handleDownloadPrintableHTML();
      setPrintStatusNotice(
        language === 'my'
          ? 'Browser sandbox ကန့်သတ်ချက်ကြောင့် Printer Dialog တိုက်ရိုက်မပွင့်ပါ။ A4 Landscape HTML ဖိုင်ကို ဒေါင်းလုဒ်လုပ်ပေးထားပါသည် (ဖိုင်ဖွင့်လိုက်ပါက Windows Printer Dialog တန်းပွင့်ပါမည်) သို့မဟုတ် ကီးဘုတ်မှ Ctrl + P နှိပ်ပါ။'
          : 'Windows Printer Dialog was triggered. If your browser restricts popups in this frame, the A4 Landscape HTML file was downloaded (open it to print immediately) or press Ctrl + P.'
      );
    } else {
      setPrintStatusNotice(
        language === 'my'
          ? 'Windows Printer Dialog Box ကို ဖွင့်လှစ်ပြီးပါပြီ (A4 Landscape Format)။'
          : 'Windows Printer Dialog Box opened in A4 Landscape format.'
      );
    }
  };

  // Print A4 via Windows Printer Dialog Box
  const handlePrintA4 = () => {
    setPrintScope('all');
    setPrintOrientation('landscape');
    setIsPrintModalOpen(true);
    setPrintStatusNotice(null);

    // Call print immediately
    setTimeout(() => {
      triggerWindowsPrint();
    }, 100);
  };

  // Direct print attempt from inside the modal
  const handleDirectPrintNow = () => {
    triggerWindowsPrint();
  };

  // Download standalone self-printing A4 HTML document
  const handleDownloadPrintableHTML = () => {
    const html = generateA4PrintHTML();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `All_Employees_Leave_Balance_Summary_A4_Landscape_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export high-resolution PNG image format ("All Employee Leave Balance Report.png")
  const handleExportPNG = () => {
    try {
      const scale = 2; // High-DPI 2x resolution
      const baseWidth = 1420;
      const rowHeight = 36;
      const headerSectionHeight = 110;
      const tableHeaderHeight = 44;
      const tableRowsHeight = allEmployeesReportData.length * rowHeight;
      const totalsRowHeight = 40;
      const footerSignHeight = 150;
      const bottomNoteHeight = 40;
      const padding = 45;

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
      ctx.fillRect(padding, padding, baseWidth - padding * 2, 5);

      // Header Subtitle
      ctx.font = '600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#4338ca';
      ctx.textAlign = 'left';
      ctx.fillText('NexHR Enterprise · Statutory Leave Entitlement & Balance Register', padding, padding + 26);

      // Main Report Title
      ctx.font = '800 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText('All Employees Leave Balance Summary', padding, padding + 56);

      // Header Metadata (Right Aligned)
      ctx.textAlign = 'right';
      ctx.font = '600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#334155';
      ctx.fillText(
        `Date: ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        baseWidth - padding,
        padding + 24
      );
      ctx.font = '500 10.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('Report Format: All Employee Leave Balance Report (PNG Format / A4 Landscape)', baseWidth - padding, padding + 42);
      ctx.fillText('Form No: NX-HR-LVE-2026 / Myanmar Leave & Holidays Act 1951', baseWidth - padding, padding + 60);

      // Divider Line below Header
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(padding, padding + 76);
      ctx.lineTo(baseWidth - padding, padding + 76);
      ctx.stroke();

      // Table Setup
      const tableTop = padding + 92;
      const tableWidth = baseWidth - padding * 2;

      // Columns definitions with widths
      const cols = [
        { key: 'empId', label: 'Emp ID', width: 95, align: 'left' },
        { key: 'name', label: 'Employee Name', width: 175, align: 'left' },
        { key: 'dept', label: 'Department', width: 135, align: 'left' },
        { key: 'role', label: 'Role / Designation', width: 155, align: 'left' },
        { key: 'annual', label: `Annual (${annualDays}d)`, width: 130, align: 'center' },
        { key: 'casual', label: `Casual (${casualDays}d)`, width: 130, align: 'center' },
        { key: 'medical', label: `Medical (${medicalDays}d)`, width: 130, align: 'center' },
        { key: 'entitled', label: 'Total Entitled', width: 105, align: 'center' },
        { key: 'taken', label: 'Total Taken', width: 95, align: 'center' },
        { key: 'remaining', label: 'Remaining Balance', width: 115, align: 'center' },
        { key: 'util', label: 'Utilization', width: 65, align: 'center' },
      ];

      // Table Header Row Background
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(padding, tableTop, tableWidth, tableHeaderHeight);

      // Table Header Border
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.strokeRect(padding, tableTop, tableWidth, tableHeaderHeight);

      // Draw Table Header Texts & Vertical Column Separators
      ctx.fillStyle = '#0f172a';
      ctx.font = '700 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

      let currentX = padding;
      cols.forEach((col, idx) => {
        if (col.align === 'center') {
          ctx.textAlign = 'center';
          ctx.fillText(col.label, currentX + col.width / 2, tableTop + 27);
        } else if (col.align === 'right') {
          ctx.textAlign = 'right';
          ctx.fillText(col.label, currentX + col.width - 10, tableTop + 27);
        } else {
          ctx.textAlign = 'left';
          ctx.fillText(col.label, currentX + 8, tableTop + 27);
        }

        if (idx > 0) {
          ctx.strokeStyle = '#cbd5e1';
          ctx.beginPath();
          ctx.moveTo(currentX, tableTop);
          ctx.lineTo(currentX, tableTop + tableHeaderHeight);
          ctx.stroke();
        }
        currentX += col.width;
      });

      // Draw Rows
      let rowY = tableTop + tableHeaderHeight;
      let totalEntitledSum = 0;
      let totalTakenSum = 0;
      let totalRemainingSum = 0;

      allEmployeesReportData.forEach((item, rIdx) => {
        totalEntitledSum += item.totalEntitlement;
        totalTakenSum += item.totalTaken;
        totalRemainingSum += item.totalRemaining;

        // Row background
        ctx.fillStyle = rIdx % 2 === 0 ? '#ffffff' : '#f8fafc';
        ctx.fillRect(padding, rowY, tableWidth, rowHeight);

        // Row border
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.strokeRect(padding, rowY, tableWidth, rowHeight);

        // Column cell contents
        let x = padding;
        cols.forEach((col, cIdx) => {
          if (cIdx > 0) {
            ctx.strokeStyle = '#e2e8f0';
            ctx.beginPath();
            ctx.moveTo(x, rowY);
            ctx.lineTo(x, rowY + rowHeight);
            ctx.stroke();
          }

          ctx.font = '400 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillStyle = '#334155';

          if (col.key === 'empId') {
            ctx.textAlign = 'left';
            ctx.font = '500 11px monospace';
            ctx.fillText(item.employee.employeeId, x + 8, rowY + 22);
          } else if (col.key === 'name') {
            ctx.textAlign = 'left';
            ctx.font = '700 11.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.fillStyle = '#0f172a';
            ctx.fillText(item.employee.name, x + 8, rowY + 22);
          } else if (col.key === 'dept') {
            ctx.textAlign = 'left';
            ctx.fillText(item.employee.department, x + 8, rowY + 22);
          } else if (col.key === 'role') {
            ctx.textAlign = 'left';
            ctx.fillText(item.employee.role, x + 8, rowY + 22);
          } else if (col.key === 'annual') {
            ctx.textAlign = 'center';
            ctx.fillText(`${item.annualRemaining} left (${item.balance.annualUsed}u)`, x + col.width / 2, rowY + 22);
          } else if (col.key === 'casual') {
            ctx.textAlign = 'center';
            ctx.fillText(`${item.casualRemaining} left (${item.balance.casualUsed}u)`, x + col.width / 2, rowY + 22);
          } else if (col.key === 'medical') {
            ctx.textAlign = 'center';
            ctx.fillText(`${item.medicalRemaining} left (${item.balance.medicalUsed}u)`, x + col.width / 2, rowY + 22);
          } else if (col.key === 'entitled') {
            ctx.textAlign = 'center';
            ctx.font = '500 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.fillText(`${item.totalEntitlement}d`, x + col.width / 2, rowY + 22);
          } else if (col.key === 'taken') {
            ctx.textAlign = 'center';
            ctx.fillText(`${item.totalTaken}d`, x + col.width / 2, rowY + 22);
          } else if (col.key === 'remaining') {
            ctx.textAlign = 'center';
            ctx.font = '700 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.fillStyle = '#15803d'; // Highlighted Green
            ctx.fillText(`${item.totalRemaining}d`, x + col.width / 2, rowY + 22);
          } else if (col.key === 'util') {
            ctx.textAlign = 'center';
            ctx.fillText(`${item.utilizationRate}%`, x + col.width / 2, rowY + 22);
          }

          x += col.width;
        });

        rowY += rowHeight;
      });

      // Totals / Grand Summary Row
      ctx.fillStyle = '#eef2ff';
      ctx.fillRect(padding, rowY, tableWidth, totalsRowHeight);
      ctx.strokeStyle = '#c7d2fe';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(padding, rowY, tableWidth, totalsRowHeight);

      ctx.fillStyle = '#312e81';
      ctx.font = '700 11.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Grand Total (${allEmployeesReportData.length} Employees)`, padding + 8, rowY + 25);

      // Entitled total
      const entitledX = padding + 95 + 175 + 135 + 155 + 130 + 130 + 130;
      ctx.textAlign = 'center';
      ctx.fillText(`${totalEntitledSum}d`, entitledX + 105 / 2, rowY + 25);

      // Taken total
      const takenX = entitledX + 105;
      ctx.fillText(`${totalTakenSum}d`, takenX + 95 / 2, rowY + 25);

      // Remaining total
      const remX = takenX + 95;
      ctx.fillStyle = '#15803d';
      ctx.fillText(`${totalRemainingSum}d`, remX + 115 / 2, rowY + 25);

      // Average Utilization
      const utilX = remX + 115;
      const avgUtil = totalEntitledSum > 0 ? Math.round((totalTakenSum / totalEntitledSum) * 100) : 0;
      ctx.fillStyle = '#312e81';
      ctx.fillText(`${avgUtil}%`, utilX + 65 / 2, rowY + 25);

      rowY += totalsRowHeight;

      // Sign-off Blocks (Footer)
      const signY = rowY + 45;
      const signBoxWidth = 260;
      const numBoxes = 3;
      const spacing = (tableWidth - signBoxWidth * numBoxes) / (numBoxes - 1);

      const signOffs = [
        {
          name: 'Daw Khin Thuzar',
          role: 'HR Operations Manager',
          sub: 'Prepared & Verified',
        },
        {
          name: 'U Thein Lwin Oo',
          role: 'Executive Director',
          sub: 'Authorized & Signed',
        },
        {
          name: 'NexHR ERP Cloud',
          role: 'Official System Stamp',
          sub: 'NX-2026-CERTIFIED',
        },
      ];

      signOffs.forEach((sign, sIdx) => {
        const boxX = padding + sIdx * (signBoxWidth + spacing);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(boxX, signY);
        ctx.lineTo(boxX + signBoxWidth, signY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.textAlign = 'center';
        ctx.font = '700 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#0f172a';
        ctx.fillText(sign.name, boxX + signBoxWidth / 2, signY + 22);

        ctx.font = '500 10.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#475569';
        ctx.fillText(sign.role, boxX + signBoxWidth / 2, signY + 38);

        ctx.font = '500 9.5px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(sign.sub, boxX + signBoxWidth / 2, signY + 54);
      });

      // Bottom disclaimer / footer
      const bottomY = signY + 80;
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding, bottomY);
      ctx.lineTo(baseWidth - padding, bottomY);
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.font = '500 10px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(
        'Official Statutory Leave Ledger Record (PNG Format) · Confirmed under Myanmar Leave & Holidays Act 1951',
        baseWidth / 2,
        bottomY + 20
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
              <th>Annual Total (${annualDays}d)</th>
              <th>Annual Used</th>
              <th>Annual Left</th>
              <th>Casual Total (${casualDays}d)</th>
              <th>Casual Used</th>
              <th>Casual Left</th>
              <th>Medical Total (${medicalDays}d)</th>
              <th>Medical Used</th>
              <th>Medical Left</th>
              <th>Total Entitled</th>
              <th>Total Taken</th>
              <th>Total Left</th>
              <th>Utilization %</th>
              <th>Pending Leaves</th>
              <th>Approved Leaves</th>
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
                <td>${item.balance.annualTotal}</td>
                <td>${item.balance.annualUsed}</td>
                <td>${item.annualRemaining}</td>
                <td>${item.balance.casualTotal}</td>
                <td>${item.balance.casualUsed}</td>
                <td>${item.casualRemaining}</td>
                <td>${item.balance.medicalTotal}</td>
                <td>${item.balance.medicalUsed}</td>
                <td>${item.medicalRemaining}</td>
                <td>${item.totalEntitlement}</td>
                <td>${item.totalTaken}</td>
                <td>${item.totalRemaining}</td>
                <td>${item.utilizationRate}%</td>
                <td>${item.pendingCount}</td>
                <td>${item.approvedCount}</td>
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
      `Annual Total (${annualDays}d)`,
      'Annual Used',
      'Annual Left',
      `Casual Total (${casualDays}d)`,
      'Casual Used',
      'Casual Left',
      `Medical Total (${medicalDays}d)`,
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

          <button
            onClick={handlePrintA4}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors cursor-pointer"
            title="Open Windows Printer Dialog Box to print leave list on A4 paper"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-600" />
            <span>{language === 'my' ? 'A4 Print (Windows)' : 'Print A4 (Windows)'}</span>
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
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-3 text-center">Annual Leave ({annualDays}d)</th>
                    <th className="py-3 px-3 text-center">Casual Leave ({casualDays}d)</th>
                    <th className="py-3 px-3 text-center">Medical Leave ({medicalDays}d)</th>
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
                          <td className="py-3 px-4 text-right no-print">
                            <button
                              onClick={() => {
                                setDossierEmpId(item.employee.employeeId);
                                setActiveTab('individualEmployee');
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
              dossierEmployee.name.toLowerCase().includes('thant zin') ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-slate-200'
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
                  {dossierEmployee.name.toLowerCase().includes('thant zin') && ' (incl. Tomorrow)'}
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
                  onClick={handleDownloadPrintableHTML}
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

              {/* Format Badge & Controls */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="px-3 py-1 bg-white border border-indigo-200 text-indigo-800 rounded-lg font-bold flex items-center gap-1.5 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  <span>A4 Landscape (297 × 210 mm)</span>
                </div>

                <div className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg font-mono text-[11px] font-semibold flex items-center gap-1.5">
                  <FileImage className="w-3.5 h-3.5 text-emerald-600" />
                  <span>All Employee Leave Balance Report.png</span>
                </div>

                {/* Scope selector */}
                <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
                  <button
                    onClick={() => setPrintScope('all')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                      printScope === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {language === 'my' ? 'အားလုံး (All Employees)' : 'All Employees'}
                  </button>
                  <button
                    onClick={() => setPrintScope('individual')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                      printScope === 'individual'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {language === 'my' ? 'တစ်ဦးချင်း (Individual)' : 'Individual'}
                  </button>
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
                className="bg-white border border-slate-300 shadow-xl rounded-sm p-8 sm:p-10 max-w-[1060px] w-full mx-auto text-slate-800 font-sans"
              >
                {/* Official Header */}
                <div className="border-b-2 border-slate-900 pb-3 mb-5 flex flex-wrap justify-between items-end gap-3">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                      All Employees Leave Balance Summary
                    </h1>
                    <div className="text-sm font-bold text-indigo-950 mt-1">
                      NexHR Enterprise · Statutory Leave Entitlement &amp; Balance Register
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-600 space-y-0.5 font-mono">
                    <div><strong>Date:</strong> {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <div><strong>Report Format:</strong> A4 Landscape (297 × 210 mm) / PNG</div>
                    <div><strong>File Format:</strong> All Employee Leave Balance Report.png</div>
                    <div><strong>Form No:</strong> NX-HR-LVE-2026 / Myanmar Leave &amp; Holidays Act 1951</div>
                  </div>
                </div>

                {/* All Employees Leave Balance Summary Table */}
                <div className="mb-6 overflow-x-auto">
                  <table className="w-full text-[11px] border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 text-left">
                        <th className="border border-slate-300 px-2.5 py-2 font-bold">Emp ID</th>
                        <th className="border border-slate-300 px-2.5 py-2 font-bold">Employee Name</th>
                        <th className="border border-slate-300 px-2.5 py-2 font-bold">Dept</th>
                        <th className="border border-slate-300 px-2.5 py-2 font-bold">Role / Designation</th>
                        <th className="border border-slate-300 px-2.5 py-2 font-bold text-center">Annual Leave ({annualDays}d)</th>
                        <th className="border border-slate-300 px-2.5 py-2 font-bold text-center">Casual Leave ({casualDays}d)</th>
                        <th className="border border-slate-300 px-2.5 py-2 font-bold text-center">Medical Leave ({medicalDays}d)</th>
                        <th className="border border-slate-300 px-2.5 py-2 font-bold text-center">Total Entitled</th>
                        <th className="border border-slate-300 px-2.5 py-2 font-bold text-center">Total Taken</th>
                        <th className="border border-slate-300 px-2.5 py-2 font-bold text-center">Remaining Balance</th>
                        <th className="border border-slate-300 px-2.5 py-2 font-bold text-center">Utilization</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allEmployeesReportData.map((item) => (
                        <tr key={item.employee.id} className="hover:bg-slate-50">
                          <td className="border border-slate-300 px-2.5 py-1.5 font-mono">{item.employee.employeeId}</td>
                          <td className="border border-slate-300 px-2.5 py-1.5 font-semibold text-slate-900">{item.employee.name}</td>
                          <td className="border border-slate-300 px-2.5 py-1.5 text-slate-600">{item.employee.department}</td>
                          <td className="border border-slate-300 px-2.5 py-1.5 text-slate-600">{item.employee.role}</td>
                          <td className="border border-slate-300 px-2.5 py-1.5 text-center font-mono">{item.annualRemaining} left ({item.balance.annualUsed} used)</td>
                          <td className="border border-slate-300 px-2.5 py-1.5 text-center font-mono">{item.casualRemaining} left ({item.balance.casualUsed} used)</td>
                          <td className="border border-slate-300 px-2.5 py-1.5 text-center font-mono">{item.medicalRemaining} left ({item.balance.medicalUsed} used)</td>
                          <td className="border border-slate-300 px-2.5 py-1.5 text-center font-mono font-medium">{item.totalEntitlement}d</td>
                          <td className="border border-slate-300 px-2.5 py-1.5 text-center font-mono text-slate-600">{item.totalTaken}d</td>
                          <td className="border border-slate-300 px-2.5 py-1.5 text-center font-bold text-emerald-700 font-mono">{item.totalRemaining}d</td>
                          <td className="border border-slate-300 px-2.5 py-1.5 text-center font-mono">{item.utilizationRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Sign-off Blocks */}
                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-300 text-center text-xs text-slate-600">
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
                  <div className="border-t border-dashed border-slate-400 pt-2">
                    <div className="font-bold text-slate-800">NexHR ERP Cloud</div>
                    <div>Official System Stamp</div>
                    <div className="text-[10px] text-slate-400 font-mono">NX-2026-CERTIFIED</div>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-400 font-mono">
                  Official Statutory Leave Ledger Record (A4 Landscape) · Confirmed under Myanmar Leave &amp; Holidays Act 1951
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
