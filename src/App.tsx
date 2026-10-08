import React, { useState, useEffect } from 'react';
import {
  Employee,
  RecruitmentJob,
  Candidate,
  CandidateStage,
  OnboardingCase,
  AttendanceRecord,
  LeaveRequest,
  LeaveBalance,
  PayrollRecord,
  AppraisalRecord,
  EmailNotification,
  Language,
  UserRole,
  UserAccount,
  TursoDatabaseConfig,
  DepartmentSetupItem,
  LeaveSetupItem,
  DutyShiftSetupItem,
  SalarySetupConfig,
  PositionSetupItem,
  BiometricDeviceSetupItem,
} from './types';
import { StorageService } from './utils/storage';
import { translations, formatMMK } from './utils/translations';
import {
  directSaveEmployeeToTurso,
  directDeleteEmployeeFromTurso,
  directSaveAttendanceToTurso,
  directSaveUserAccountToTurso,
  directDeleteUserAccountFromTurso,
  directSaveDepartmentToTurso,
  directDeleteDepartmentFromTurso,
  directSaveDutyShiftToTurso,
  directDeleteDutyShiftFromTurso,
  directSavePositionToTurso,
  directDeletePositionFromTurso,
  directSaveLeaveTypeToTurso,
  directDeleteLeaveTypeFromTurso,
  directSaveLeaveRequestToTurso,
  directSaveLeaveBalanceToTurso,
  directSaveBiometricDeviceToTurso,
  directDeleteBiometricDeviceFromTurso,
  directSaveSalaryConfigToTurso,
  fetchAllFromTurso,
} from './utils/turso';
import { Header } from './components/common/Header';
import { BiometricScannerModal } from './components/common/BiometricScannerModal';
import { EmailNotificationDrawer } from './components/common/EmailNotificationDrawer';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { RecruitmentView } from './components/recruitment/RecruitmentView';
import { OnboardingView } from './components/onboarding/OnboardingView';
import { AttendanceView } from './components/attendance/AttendanceView';
import { PayrollView } from './components/payroll/PayrollView';
import { LeaveView } from './components/leave/LeaveView';
import { AppraisalView } from './components/appraisal/AppraisalView';
import { EmployeePortalView } from './components/ess/EmployeePortalView';
import { EmployeeSetupPage } from './components/employee/EmployeeSetupPage';
import { SetupMenuView } from './components/setup/SetupMenuView';
import { MobileAppFrame } from './components/mobile/MobileAppFrame';
import { FileText, Printer, X } from 'lucide-react';

export default function App() {
  // Application Data States (persisted via StorageService)
  const [employees, setEmployees] = useState<Employee[]>(StorageService.getEmployees);
  const [jobs, setJobs] = useState<RecruitmentJob[]>(StorageService.getJobs);
  const [candidates, setCandidates] = useState<Candidate[]>(StorageService.getCandidates);
  const [onboardingCases, setOnboardingCases] = useState<OnboardingCase[]>(StorageService.getOnboardingCases);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(StorageService.getAttendance);
  const [leaves, setLeaves] = useState<LeaveRequest[]>(StorageService.getLeaves);
  const [leaveBalances, setLeaveBalances] = useState<Record<string, LeaveBalance>>(StorageService.getLeaveBalances);
  const [payroll, setPayroll] = useState<PayrollRecord[]>(StorageService.getPayroll);
  const [appraisals, setAppraisals] = useState<AppraisalRecord[]>(StorageService.getAppraisals);
  const [emails, setEmails] = useState<EmailNotification[]>(StorageService.getEmails);

  // Setup Master States
  const [departments, setDepartments] = useState<DepartmentSetupItem[]>(StorageService.getDepartments);
  const [leaveSetupList, setLeaveSetupList] = useState<LeaveSetupItem[]>(StorageService.getLeaveSetup);
  const [dutyShifts, setDutyShifts] = useState<DutyShiftSetupItem[]>(StorageService.getDutyShifts);
  const [salaryConfig, setSalaryConfig] = useState<SalarySetupConfig>(StorageService.getSalaryConfig);
  const [positions, setPositions] = useState<PositionSetupItem[]>(StorageService.getPositions);
  const [devices, setDevices] = useState<BiometricDeviceSetupItem[]>(StorageService.getDevices);
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(StorageService.getUserAccounts);
  const [tursoConfig, setTursoConfig] = useState<TursoDatabaseConfig>(StorageService.getTursoConfig);

  // Active User & Auth State
  const [currentUser, setCurrentUser] = useState<UserAccount>(StorageService.getCurrentUser);
  const [currentRole, setCurrentRole] = useState<UserRole>(() => StorageService.getCurrentUser().role);
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string>(
    () => StorageService.getCurrentUser().employeeId || 'NX-1002'
  );

  // App UI States
  const [language, setLanguage] = useState<Language>('en');
  const [isMobileMode, setIsMobileMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Turso Cloud Sync State
  const [isSyncingTurso, setIsSyncingTurso] = useState(false);
  const [syncStatusToast, setSyncStatusToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Central Sync Engine: Pulls live data from Turso Cloud Database
  const handleSyncFromTurso = async (silent = false) => {
    if (!tursoConfig.url || !tursoConfig.authToken) return;
    try {
      setIsSyncingTurso(true);
      const data = await fetchAllFromTurso(tursoConfig.url, tursoConfig.authToken);

      let fetchedCount = 0;
      if (data.employees && data.employees.length > 0) {
        setEmployees(data.employees);
        StorageService.setEmployees(data.employees);
        fetchedCount = data.employees.length;
      }
      if (data.departments && data.departments.length > 0) {
        setDepartments(data.departments);
        StorageService.setDepartments(data.departments);
      }
      if (data.positions && data.positions.length > 0) {
        setPositions(data.positions);
        StorageService.setPositions(data.positions);
      }
      if (data.dutyShifts && data.dutyShifts.length > 0) {
        setDutyShifts(data.dutyShifts);
        StorageService.setDutyShifts(data.dutyShifts);
      }
      if (data.leaveSetupList && data.leaveSetupList.length > 0) {
        setLeaveSetupList(data.leaveSetupList);
        StorageService.setLeaveSetup(data.leaveSetupList);
      }
      if (data.devices && data.devices.length > 0) {
        setDevices(data.devices);
        StorageService.setDevices(data.devices);
      }
      if (data.salaryConfig && data.salaryConfig.tiers && data.salaryConfig.tiers.length > 0) {
        setSalaryConfig(data.salaryConfig);
        StorageService.setSalaryConfig(data.salaryConfig);
      }
      if (data.userAccounts && data.userAccounts.length > 0) {
        setUserAccounts(data.userAccounts);
        StorageService.setUserAccounts(data.userAccounts);
      }
      if (data.leaves && data.leaves.length > 0) {
        setLeaves(data.leaves);
        StorageService.setLeaves(data.leaves);
      }
      if (data.leaveBalances && Object.keys(data.leaveBalances).length > 0) {
        setLeaveBalances(data.leaveBalances);
        StorageService.setLeaveBalances(data.leaveBalances);
      }

      if (!silent) {
        setSyncStatusToast({
          message: `Synced with Turso Cloud: ${fetchedCount} employees & master setup data active!`,
          type: 'success',
        });
        setTimeout(() => setSyncStatusToast(null), 4000);
      }
    } catch (err: any) {
      console.warn('Sync from Turso failed:', err);
      if (!silent) {
        setSyncStatusToast({
          message: `Turso Cloud sync error: ${err.message || String(err)}`,
          type: 'error',
        });
        setTimeout(() => setSyncStatusToast(null), 4000);
      }
    } finally {
      setIsSyncingTurso(false);
    }
  };

  // Automatically fetch latest data from Turso Cloud when app mounts (essential for Vercel & cross-device updates)
  useEffect(() => {
    if (tursoConfig.url && tursoConfig.authToken) {
      handleSyncFromTurso(true);
    }
  }, []);

  // Modals
  const [isBiometricOpen, setIsBiometricOpen] = useState(false);
  const [isEmailDrawerOpen, setIsEmailDrawerOpen] = useState(false);
  const [activePayslipModal, setActivePayslipModal] = useState<PayrollRecord | null>(null);

  // Handler: Add Attendance from Biometric Terminal
  const handleRecordAttendance = (newRecord: AttendanceRecord) => {
    const updated = [newRecord, ...attendance];
    setAttendance(updated);
    StorageService.setAttendance(updated);

    // Direct Cloud Save to Turso Database
    if (tursoConfig.autoSyncEnabled && tursoConfig.url) {
      directSaveAttendanceToTurso(newRecord, tursoConfig.url, tursoConfig.authToken).catch((err) =>
        console.warn('Background Turso attendance sync:', err)
      );
    }

    // Send automated notification
    const emp = employees.find((e) => e.employeeId === newRecord.employeeId) || employees[0];
    const newEmail = StorageService.addEmailNotification({
      to: emp.email,
      recipientName: emp.name,
      category: 'attendance',
      subject: `Biometric Attendance Verified: ${newRecord.method.replace('_', ' ')} (${newRecord.clockInTime})`,
      preview: `Your attendance was securely recorded with ${newRecord.biometricConfidence}% confidence at ${newRecord.location}.`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #334155;">
          <h2 style="color: #0f172a;">Biometric Clock-In Confirmed</h2>
          <p>Dear <strong>${emp.name}</strong>,</p>
          <p>Your biometric attendance stamp was confirmed and recorded by the gate terminal.</p>
          <ul>
            <li><strong>Timestamp:</strong> ${newRecord.date} at ${newRecord.clockInTime}</li>
            <li><strong>Method:</strong> ${newRecord.method}</li>
            <li><strong>Terminal Location:</strong> ${newRecord.location}</li>
            <li><strong>Cryptographic Confidence:</strong> ${newRecord.biometricConfidence}%</li>
            <li><strong>Status:</strong> ${newRecord.status.toUpperCase()}</li>
          </ul>
          <p style="color: #64748b; font-size: 12px;">NexHR Automated Biometric Gateway</p>
        </div>
      `,
    });
    setEmails(StorageService.getEmails());
  };

  // Handler: Disburse Payroll
  const handleDisbursePayroll = () => {
    const updatedPayroll = payroll.map((p) => ({
      ...p,
      status: 'paid' as const,
      paymentDate: new Date().toISOString().split('T')[0],
    }));
    setPayroll(updatedPayroll);
    StorageService.setPayroll(updatedPayroll);

    // Batch send automated payslips via email to every employee
    employees.forEach((emp) => {
      const rec = updatedPayroll.find((p) => p.employeeId === emp.employeeId);
      if (rec) {
        StorageService.addEmailNotification({
          to: emp.email,
          recipientName: emp.name,
          category: 'payroll',
          subject: `Monthly Payslip Disbursed - ${rec.monthYear} (${rec.payslipRef})`,
          preview: `Your official net salary of ${formatMMK(rec.netPayMMK)} has been processed and deposited.`,
          htmlContent: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #334155;">
              <h2 style="color: #0f172a;">Monthly Salary Disbursement Notice</h2>
              <p>Dear <strong>${emp.name}</strong>,</p>
              <p>Finance & Accounts has completed the monthly payroll distribution for <strong>${rec.monthYear}</strong>.</p>
              <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
                <tr><td style="padding: 6px; border-bottom: 1px solid #e2e8f0;">Base Salary</td><td style="text-align: right; font-weight: bold;">${formatMMK(rec.baseSalaryMMK)}</td></tr>
                <tr><td style="padding: 6px; border-bottom: 1px solid #e2e8f0;">Total Allowances</td><td style="text-align: right; color: #16a34a;">+${formatMMK(rec.allowanceTransportMMK + rec.allowanceMealMMK)}</td></tr>
                <tr><td style="padding: 6px; border-bottom: 1px solid #e2e8f0;">Overtime (OT)</td><td style="text-align: right; color: #4f46e5;">+${formatMMK(rec.overtimePayMMK)}</td></tr>
                <tr><td style="padding: 6px; border-bottom: 1px solid #e2e8f0;">Deductions (SSB + Tax)</td><td style="text-align: right; color: #dc2626;">-${formatMMK(rec.deductionSSBMMK + rec.deductionTaxMMK)}</td></tr>
                <tr style="background: #f1f5f9;"><td style="padding: 8px; font-weight: bold;">Net Payable Deposited</td><td style="text-align: right; font-weight: bold; color: #0f172a;">${formatMMK(rec.netPayMMK)}</td></tr>
              </table>
              <p>You can view and print your digitally certified slip inside the Employee Self-Service (ESS) Portal.</p>
              <p style="color: #64748b; font-size: 12px;">NexHR Enterprise Finance Automation</p>
            </div>
          `,
        });
      }
    });

    setEmails(StorageService.getEmails());
  };

  // Handler: Apply Leave
  const handleApplyLeave = (newLeave: Omit<LeaveRequest, 'id' | 'appliedDate' | 'status'>) => {
    const created: LeaveRequest = {
      ...newLeave,
      id: `lev-${Date.now()}`,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'pending',
    };
    const updated = [created, ...leaves];
    setLeaves(updated);
    StorageService.setLeaves(updated);

    // Notification
    StorageService.addEmailNotification({
      to: 'khinthuzar@nexhr.com',
      recipientName: 'Daw Khin Thuzar (HR)',
      category: 'leave',
      subject: `New Leave Application: ${created.employeeName} (${created.leaveType.toUpperCase()} - ${created.daysCount} Days)`,
      preview: `${created.employeeName} applied for leave from ${created.startDate} to ${created.endDate}.`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #334155;">
          <h2 style="color: #0f172a;">Leave Request Pending Review</h2>
          <p><strong>Employee:</strong> ${created.employeeName} (${created.department})</p>
          <p><strong>Duration:</strong> ${created.startDate} to ${created.endDate} (${created.daysCount} days)</p>
          <p><strong>Reason:</strong> ${created.reason}</p>
          <p><strong>Emergency Contact:</strong> ${created.emergencyPhone}</p>
          <p>Please log in to the NexHR Management Dashboard to review and approve.</p>
        </div>
      `,
    });

    // Direct Cloud Save to Turso Database
    if (tursoConfig.autoSyncEnabled && tursoConfig.url) {
      directSaveLeaveRequestToTurso(created, tursoConfig.url, tursoConfig.authToken).catch((err) =>
        console.warn('Background Turso leave sync:', err)
      );
    }

    setEmails(StorageService.getEmails());
  };

  // Handler: Review Leave
  const handleReviewLeave = (leaveId: string, status: 'approved' | 'rejected', comment: string) => {
    const updated = leaves.map((l) =>
      l.id === leaveId
        ? {
            ...l,
            status,
            reviewedBy: 'Daw Khin Thuzar (HR)',
            managerComment: comment,
          }
        : l
    );
    setLeaves(updated);
    StorageService.setLeaves(updated);

    const leave = leaves.find((l) => l.id === leaveId);
    if (leave) {
      // Update leave balance if approved
      if (status === 'approved') {
        const balances = { ...leaveBalances };
        const b = balances[leave.employeeId] || {
          annualTotal: 14,
          annualUsed: 0,
          casualTotal: 6,
          casualUsed: 0,
          medicalTotal: 10,
          medicalUsed: 0,
          maternityTotal: 84,
          maternityUsed: 0,
        };
        if (leave.leaveType === 'annual') b.annualUsed += leave.daysCount;
        if (leave.leaveType === 'casual') b.casualUsed += leave.daysCount;
        if (leave.leaveType === 'medical') b.medicalUsed += leave.daysCount;
        balances[leave.employeeId] = b;
        setLeaveBalances(balances);
        StorageService.setLeaveBalances(balances);

        // Direct Cloud Save to Turso Database
        if (tursoConfig.autoSyncEnabled && tursoConfig.url) {
          directSaveLeaveBalanceToTurso(leave.employeeId, b, tursoConfig.url, tursoConfig.authToken).catch((err) =>
            console.warn('Background Turso leave balance sync:', err)
          );
        }
      }

      // Direct Cloud Save of reviewed leave to Turso Database
      if (tursoConfig.autoSyncEnabled && tursoConfig.url) {
        const reviewed = updated.find((l) => l.id === leaveId);
        if (reviewed) {
          directSaveLeaveRequestToTurso(reviewed, tursoConfig.url, tursoConfig.authToken).catch((err) =>
            console.warn('Background Turso leave review sync:', err)
          );
        }
      }

      // Notify employee
      const emp = employees.find((e) => e.employeeId === leave.employeeId);
      if (emp) {
        StorageService.addEmailNotification({
          to: emp.email,
          recipientName: emp.name,
          category: 'leave',
          subject: `Leave Application ${status.toUpperCase()}: ${leave.leaveType.toUpperCase()} (${leave.daysCount} Days)`,
          preview: `Your leave request for ${leave.startDate} to ${leave.endDate} has been ${status}.`,
          htmlContent: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #334155;">
              <h2 style="color: ${status === 'approved' ? '#16a34a' : '#dc2626'};">Leave Application ${status.toUpperCase()}</h2>
              <p>Dear <strong>${emp.name}</strong>,</p>
              <p>Your request for <strong>${leave.daysCount} days of ${leave.leaveType} leave</strong> (${leave.startDate} to ${leave.endDate}) has been <strong>${status}</strong> by HR.</p>
              <p><strong>Manager Remarks:</strong> ${comment}</p>
              <p style="color: #64748b; font-size: 12px;">NexHR Leave Management Service</p>
            </div>
          `,
        });
        setEmails(StorageService.getEmails());
      }
    }
  };

  // Handler: Save Employee (Create or Edit)
  const handleSaveEmployee = (emp: Employee) => {
    const exists = employees.some((e) => e.id === emp.id);
    let updated: Employee[];
    if (exists) {
      updated = employees.map((e) => (e.id === emp.id ? emp : e));
    } else {
      updated = [emp, ...employees];
      // ensure leave balance exists
      if (!leaveBalances[emp.employeeId]) {
        const updatedBalances = {
          ...leaveBalances,
          [emp.employeeId]: {
            annualTotal: 14,
            annualUsed: 0,
            casualTotal: 6,
            casualUsed: 0,
            medicalTotal: 10,
            medicalUsed: 0,
            maternityTotal: 84,
            maternityUsed: 0,
          },
        };
        setLeaveBalances(updatedBalances);
        StorageService.setLeaveBalances(updatedBalances);
      }
    }
    setEmployees(updated);
    StorageService.setEmployees(updated);

    // Direct Cloud Save to Turso Database
    if (tursoConfig.autoSyncEnabled && tursoConfig.url) {
      directSaveEmployeeToTurso(emp, tursoConfig.url, tursoConfig.authToken).catch((err) =>
        console.warn('Background Turso employee sync:', err)
      );
    }
  };

  // Handler: Delete Employee
  const handleDeleteEmployee = (id: string) => {
    const updated = employees.filter((e) => e.id !== id);
    setEmployees(updated);
    StorageService.setEmployees(updated);

    // Direct Cloud Delete in Turso Database
    if (tursoConfig.autoSyncEnabled && tursoConfig.url) {
      directDeleteEmployeeFromTurso(id, tursoConfig.url, tursoConfig.authToken).catch((err) =>
        console.warn('Background Turso employee delete:', err)
      );
    }
  };

  // Handler: Select / Switch Active User Account
  const handleSelectUser = (user: UserAccount) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    if (user.employeeId) {
      setCurrentEmployeeId(user.employeeId);
    }
    StorageService.setCurrentUser(user);
  };

  // Handler: Update User Accounts
  const handleUpdateUserAccounts = (items: UserAccount[]) => {
    const deleted = userAccounts.filter((u) => !items.some((i) => i.id === u.id));
    setUserAccounts(items);
    StorageService.setUserAccounts(items);
    if (tursoConfig.autoSyncEnabled && tursoConfig.url) {
      deleted.forEach((u) =>
        directDeleteUserAccountFromTurso(u.id, tursoConfig.url, tursoConfig.authToken).catch(() => {})
      );
      items.forEach((u) =>
        directSaveUserAccountToTurso(u, tursoConfig.url, tursoConfig.authToken).catch(() => {})
      );
    }
    // If current user was edited, update currentUser state
    const currentStillExists = items.find((u) => u.id === currentUser.id);
    if (currentStillExists) {
      setCurrentUser(currentStillExists);
      StorageService.setCurrentUser(currentStillExists);
    }
  };

  // Handler: Update Turso Database Config
  const handleUpdateTursoConfig = (cfg: TursoDatabaseConfig) => {
    setTursoConfig(cfg);
    StorageService.setTursoConfig(cfg);
  };

  // Handler: Add Job
  const handleAddJob = (job: RecruitmentJob) => {
    const updated = [job, ...jobs];
    setJobs(updated);
    StorageService.setJobs(updated);
  };

  // Handler: Update Candidate Stage
  const handleUpdateCandidateStage = (candidateId: string, newStage: CandidateStage) => {
    const updated = candidates.map((c) =>
      c.id === candidateId ? { ...c, currentStage: newStage } : c
    );
    setCandidates(updated);
    StorageService.setCandidates(updated);
  };

  // Handler: Update Candidate Scores
  const handleUpdateCandidateScores = (
    candidateId: string,
    scores: { technical: number; communication: number; culturalFit: number },
    notes: string
  ) => {
    const avg = +(
      (scores.technical + scores.communication + scores.culturalFit) / 3
    ).toFixed(1);
    const updated = candidates.map((c) =>
      c.id === candidateId
        ? {
            ...c,
            scores,
            rating: avg,
            interviewNotes: notes,
          }
        : c
    );
    setCandidates(updated);
    StorageService.setCandidates(updated);
  };

  // Handler: Hire Candidate -> Creates Onboarding Case & Dispatches Email
  const handleHireCandidate = (candidate: Candidate) => {
    // 1. Update candidate stage
    handleUpdateCandidateStage(candidate.id, 'hired');

    // 2. Create Onboarding Case
    const newOnboarding: OnboardingCase = {
      id: `onb-${Date.now()}`,
      candidateId: candidate.id,
      employeeName: candidate.name,
      role: candidate.jobTitle,
      department: 'Engineering',
      email: candidate.email,
      startDate: '2026-10-15',
      mentor: 'Daw Khin Thuzar (HR)',
      progress: 20,
      status: 'in_progress',
      checklist: [
        {
          id: `chk-1-${Date.now()}`,
          title: 'NRC and National Credentials Verification',
          titleMyanmar: 'နိုင်ငံသားစိစစ်ရေးကတ်ပြားနှင့် အထောက်အထားများ စစ်ဆေးခြင်း',
          category: 'documentation',
          completed: true,
          verifiedByHR: true,
        },
        {
          id: `chk-2-${Date.now()}`,
          title: 'Sign Employment Agreement & Code of Conduct',
          titleMyanmar: 'အလုပ်ခန့်အပ်မှု စာချုပ်နှင့် လျှို့ဝှက်ချက်ထိန်းသိမ်းမှု စာချုပ် လက်မှတ်ထိုးခြင်း',
          category: 'documentation',
          completed: false,
          verifiedByHR: false,
        },
        {
          id: `chk-3-${Date.now()}`,
          title: 'Biometric Enrollment (Fingerprint & Optical Retina Registration)',
          titleMyanmar: 'ဇီဝမက်ထရစ် မှတ်ပုံတင်ခြင်း - လက်ဗွေနှင့် မျက်ဝန်း စကင်သွင်းခြင်း',
          category: 'it_setup',
          completed: false,
          verifiedByHR: false,
        },
        {
          id: `chk-4-${Date.now()}`,
          title: 'Laptop & Corporate Security Credentials Handover',
          titleMyanmar: 'ရုံးသုံး ကွန်ပျူတာနှင့် လုံခြုံရေးအကောင့်များ ထုတ်ပေးခြင်း',
          category: 'it_setup',
          completed: false,
          verifiedByHR: false,
        },
      ],
    };

    const updatedOnb = [newOnboarding, ...onboardingCases];
    setOnboardingCases(updatedOnb);
    StorageService.setOnboardingCases(updatedOnb);

    // 3. Dispatch automated Offer Letter & Welcome Email
    StorageService.addEmailNotification({
      to: candidate.email,
      recipientName: candidate.name,
      category: 'recruitment',
      subject: `Official Employment Offer: ${candidate.jobTitle} at NexHR Enterprise`,
      preview: `We are delighted to welcome you to the team. Please complete your onboarding steps.`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #334155;">
          <h2 style="color: #0f172a;">Welcome to NexHR Enterprise!</h2>
          <p>Dear <strong>${candidate.name}</strong>,</p>
          <p>Following your interview evaluations (Score: ${candidate.rating}/5.0), we are thrilled to formally offer you the role of <strong>${candidate.jobTitle}</strong>.</p>
          <p>Your onboarding workspace has been created with assigned mentor <strong>Daw Khin Thuzar</strong>.</p>
          <p>Please log in to submit your credentials and schedule your biometric enrollment.</p>
          <p style="color: #64748b; font-size: 12px;">Human Resources Department, NexHR Enterprise</p>
        </div>
      `,
    });
    setEmails(StorageService.getEmails());
    setActiveTab('onboarding');
  };

  // Handler: Toggle Onboarding task
  const handleToggleOnboardingTask = (caseId: string, taskId: string) => {
    const updated = onboardingCases.map((c) => {
      if (c.id !== caseId) return c;
      const updatedChecklist = c.checklist.map((item) =>
        item.id === taskId ? { ...item, completed: !item.completed } : item
      );
      const completedCount = updatedChecklist.filter((i) => i.completed).length;
      return {
        ...c,
        checklist: updatedChecklist,
        progress: Math.round((completedCount / updatedChecklist.length) * 100),
      };
    });
    setOnboardingCases(updated);
    StorageService.setOnboardingCases(updated);
  };

  // Handler: Verify Onboarding task
  const handleVerifyOnboardingTask = (caseId: string, taskId: string) => {
    const updated = onboardingCases.map((c) => {
      if (c.id !== caseId) return c;
      const updatedChecklist = c.checklist.map((item) =>
        item.id === taskId ? { ...item, verifiedByHR: true, completed: true } : item
      );
      const completedCount = updatedChecklist.filter((i) => i.completed).length;
      return {
        ...c,
        checklist: updatedChecklist,
        progress: Math.round((completedCount / updatedChecklist.length) * 100),
      };
    });
    setOnboardingCases(updated);
    StorageService.setOnboardingCases(updated);
  };

  // Handler: Graduate New Hire to Active Staff
  const handleGraduateNewHire = (onbCase: OnboardingCase) => {
    // Check if already in employees
    const exists = employees.some((e) => e.name === onbCase.employeeName);
    if (!exists) {
      const newEmp: Employee = {
        id: `emp-${Date.now()}`,
        employeeId: `NX-${1000 + employees.length + 1}`,
        name: onbCase.employeeName,
        nameMyanmar: onbCase.employeeName,
        role: onbCase.role,
        department: onbCase.department,
        email: onbCase.email,
        phone: '+95 9 799 000 111',
        nrcNumber: '12/DAGAMA(N)990011',
        joinDate: onbCase.startDate,
        avatar: '/src/assets/images/avatar_lead_engineer_1791292472793.jpg',
        baseSalaryMMK: 3000000,
        status: 'active',
        bankAccount: {
          bankName: 'KBZ Bank',
          accountNumber: '001-902-887766',
          accountName: onbCase.employeeName,
        },
        emergencyContact: {
          name: 'Contact Person',
          relationship: 'Family',
          phone: '+95 9 799 111 222',
        },
        biometrics: {
          fingerprintEnrolled: true,
          irisEnrolled: true,
          securityPin: '5566',
        },
      };

      const updatedEmps = [...employees, newEmp];
      setEmployees(updatedEmps);
      StorageService.setEmployees(updatedEmps);
    }

    // Update case status
    const updatedCases = onboardingCases.map((c) =>
      c.id === onbCase.id ? { ...c, status: 'completed' as const, progress: 100 } : c
    );
    setOnboardingCases(updatedCases);
    StorageService.setOnboardingCases(updatedCases);

    // Automated Graduation Email
    StorageService.addEmailNotification({
      to: onbCase.email,
      recipientName: onbCase.employeeName,
      category: 'onboarding',
      subject: `Congratulations on Completing Onboarding! Welcome to Active Staff`,
      preview: `You have successfully completed all onboarding compliance and are now an active employee.`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #334155;">
          <h2 style="color: #0f172a;">Welcome to Active Staff at NexHR!</h2>
          <p>Dear <strong>${onbCase.employeeName}</strong>,</p>
          <p>We are delighted to announce that all your onboarding milestones and biometric credentials have been verified by HR.</p>
          <p>Your official Employee ID has been provisioned and your Employee Self-Service (ESS) portal is fully unlocked.</p>
          <p style="color: #64748b; font-size: 12px;">Human Resources Department, NexHR Enterprise</p>
        </div>
      `,
    });
    setEmails(StorageService.getEmails());
  };

  // Handler: Add Appraisal
  const handleAddAppraisal = (newApp: AppraisalRecord) => {
    const updated = [newApp, ...appraisals];
    setAppraisals(updated);
    StorageService.setAppraisals(updated);

    // Notify employee
    const emp = employees.find((e) => e.employeeId === newApp.employeeId);
    if (emp) {
      StorageService.addEmailNotification({
        to: emp.email,
        recipientName: emp.name,
        category: 'appraisal',
        subject: `Performance Appraisal Completed: ${newApp.cycle} (Score: ${newApp.overallScore}/5.0)`,
        preview: `Your review results have been submitted by ${newApp.reviewer}.`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #334155;">
            <h2 style="color: #0f172a;">Performance Appraisal Results Available</h2>
            <p>Dear <strong>${emp.name}</strong>,</p>
            <p>Your performance evaluation for <strong>${newApp.cycle}</strong> has been finalized with an overall score of <strong>${newApp.overallScore} / 5.0</strong>.</p>
            <p><strong>Strengths:</strong> ${newApp.strengths}</p>
            <p><strong>Growth Areas:</strong> ${newApp.growthAreas}</p>
            <p>You can review detailed competencies and discussion notes in your ESS portal.</p>
            <p style="color: #64748b; font-size: 12px;">Performance & People Team, NexHR Enterprise</p>
          </div>
        `,
      });
      setEmails(StorageService.getEmails());
    }
  };

  // Handler: Trigger Test Email from drawer
  const handleTriggerTestEmail = () => {
    StorageService.addEmailNotification({
      to: 'thantzin@nexhr.com',
      recipientName: 'Ko Thant Zin',
      category: 'payroll',
      subject: `Automated System Notification Test - Gateway Status Nominal`,
      preview: `This is a test notification verifying the live automated email dispatch engine.`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #334155;">
          <h2 style="color: #0f172a;">Automated Email Dispatcher Test</h2>
          <p>Hello <strong>Ko Thant Zin</strong>,</p>
          <p>This automated message confirms that the NexHR notification gateway is online, healthy, and delivering notifications across recruitment, payroll, attendance, and leave workflows.</p>
          <p style="color: #64748b; font-size: 12px;">NexHR Notification Gateway · ${new Date().toLocaleTimeString()}</p>
        </div>
      `,
    });
    setEmails(StorageService.getEmails());
  };

  const currentEmployee =
    employees.find((e) => e.employeeId === currentEmployeeId) || employees[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Top Bar Contract compliant Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        isMobileMode={isMobileMode}
        onToggleMobileMode={setIsMobileMode}
        language={language}
        onLanguageChange={setLanguage}
        onOpenBiometric={() => setIsBiometricOpen(true)}
        onOpenEmailDrawer={() => setIsEmailDrawerOpen(true)}
        unreadEmailCount={emails.length}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentUser={currentUser}
        userAccounts={userAccounts}
        onSelectUser={handleSelectUser}
        tursoConnected={tursoConfig.isConnected}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {isMobileMode ? (
          /* MOBILE TOUCH-FIRST APP MODE */
          <MobileAppFrame
            currentEmployee={currentEmployee}
            employees={employees}
            attendanceRecords={attendance}
            payrollRecords={payroll}
            leaveRequests={leaves}
            leaveBalances={leaveBalances}
            appraisalRecords={appraisals}
            onOpenBiometric={() => setIsBiometricOpen(true)}
            onOpenEmailDrawer={() => setIsEmailDrawerOpen(true)}
            unreadEmailCount={emails.length}
            onApplyLeave={() => setActiveTab('leave')}
            onSubmitLeave={handleApplyLeave}
            onViewPayslip={(record) => setActivePayslipModal(record)}
            onSwitchToWeb={() => setIsMobileMode(false)}
            onNavigateSetup={() => {
              setIsMobileMode(false);
              setActiveTab('setup');
            }}
            language={language}
          />
        ) : (
          /* DESKTOP WEB DASHBOARD MODE */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {activeTab === 'overview' && (
              <OverviewDashboard
                employees={employees}
                attendance={attendance}
                leaves={leaves}
                jobs={jobs}
                payroll={payroll}
                onNavigateTab={setActiveTab}
                onOpenBiometric={() => setIsBiometricOpen(true)}
                language={language}
              />
            )}

            {activeTab === 'recruitment' && (
              <RecruitmentView
                jobs={jobs}
                candidates={candidates}
                onAddJob={handleAddJob}
                onUpdateCandidateStage={handleUpdateCandidateStage}
                onUpdateCandidateScores={handleUpdateCandidateScores}
                onHireCandidate={handleHireCandidate}
                language={language}
              />
            )}

            {activeTab === 'onboarding' && (
              <OnboardingView
                onboardingCases={onboardingCases}
                onToggleTask={handleToggleOnboardingTask}
                onVerifyTaskByHR={handleVerifyOnboardingTask}
                onGraduateNewHire={handleGraduateNewHire}
                language={language}
              />
            )}

            {activeTab === 'employees' && (
              <EmployeeSetupPage
                employees={employees}
                departments={departments}
                dutyShifts={dutyShifts}
                positions={positions}
                salaryConfig={salaryConfig}
                onSaveEmployee={handleSaveEmployee}
                onDeleteEmployee={handleDeleteEmployee}
                language={language}
                onSyncFromTurso={() => handleSyncFromTurso(false)}
                isSyncingTurso={isSyncingTurso}
              />
            )}

            {activeTab === 'attendance' && (
              <AttendanceView
                attendanceRecords={attendance}
                employees={employees}
                onOpenBiometric={() => setIsBiometricOpen(true)}
                language={language}
              />
            )}

            {activeTab === 'payroll' && (
              <PayrollView
                payrollRecords={payroll}
                employees={employees}
                onDisbursePayroll={handleDisbursePayroll}
                language={language}
              />
            )}

            {activeTab === 'leave' && (
              <LeaveView
                leaves={leaves}
                leaveBalances={leaveBalances}
                employees={employees}
                currentEmployeeId={currentEmployeeId}
                onApplyLeave={handleApplyLeave}
                onReviewLeave={handleReviewLeave}
                language={language}
                onSyncFromTurso={() => handleSyncFromTurso(false)}
                isSyncingTurso={isSyncingTurso}
              />
            )}

            {activeTab === 'appraisal' && (
              <AppraisalView
                appraisals={appraisals}
                employees={employees}
                onAddAppraisal={handleAddAppraisal}
                language={language}
              />
            )}

            {activeTab === 'ess' && (
              <EmployeePortalView
                employees={employees}
                currentEmployeeId={currentEmployeeId}
                onSelectEmployee={setCurrentEmployeeId}
                attendanceRecords={attendance}
                payrollRecords={payroll}
                leaveRequests={leaves}
                leaveBalances={leaveBalances}
                appraisalRecords={appraisals}
                onOpenBiometric={() => setIsBiometricOpen(true)}
                onApplyLeave={() => setActiveTab('leave')}
                onViewPayslip={(record) => setActivePayslipModal(record)}
                language={language}
              />
            )}

            {activeTab === 'setup' && (
              <SetupMenuView
                departments={departments}
                onUpdateDepartments={(items) => {
                  const deleted = departments.filter((d) => !items.some((i) => i.id === d.id));
                  setDepartments(items);
                  StorageService.setDepartments(items);
                  if (tursoConfig.autoSyncEnabled && tursoConfig.url) {
                    deleted.forEach((d) =>
                      directDeleteDepartmentFromTurso(d.id, tursoConfig.url, tursoConfig.authToken).catch(() => {})
                    );
                    items.forEach((d) =>
                      directSaveDepartmentToTurso(d, tursoConfig.url, tursoConfig.authToken).catch(() => {})
                    );
                  }
                }}
                leaveSetupList={leaveSetupList}
                onUpdateLeaveSetup={(items) => {
                  const deleted = leaveSetupList.filter((l) => !items.some((i) => i.id === l.id));
                  setLeaveSetupList(items);
                  StorageService.setLeaveSetup(items);
                  if (tursoConfig.autoSyncEnabled && tursoConfig.url) {
                    deleted.forEach((l) =>
                      directDeleteLeaveTypeFromTurso(l.id, tursoConfig.url, tursoConfig.authToken).catch(() => {})
                    );
                    items.forEach((l) =>
                      directSaveLeaveTypeToTurso(l, tursoConfig.url, tursoConfig.authToken).catch(() => {})
                    );
                  }
                }}
                dutyShifts={dutyShifts}
                onUpdateDutyShifts={(items) => {
                  const deleted = dutyShifts.filter((s) => !items.some((i) => i.id === s.id));
                  setDutyShifts(items);
                  StorageService.setDutyShifts(items);
                  if (tursoConfig.autoSyncEnabled && tursoConfig.url) {
                    deleted.forEach((s) =>
                      directDeleteDutyShiftFromTurso(s.id, tursoConfig.url, tursoConfig.authToken).catch(() => {})
                    );
                    items.forEach((s) =>
                      directSaveDutyShiftToTurso(s, tursoConfig.url, tursoConfig.authToken).catch(() => {})
                    );
                  }
                }}
                salaryConfig={salaryConfig}
                onUpdateSalaryConfig={(cfg) => {
                  setSalaryConfig(cfg);
                  StorageService.setSalaryConfig(cfg);
                  if (tursoConfig.autoSyncEnabled && tursoConfig.url) {
                    directSaveSalaryConfigToTurso(cfg, tursoConfig.url, tursoConfig.authToken).catch(() => {});
                  }
                }}
                positions={positions}
                onUpdatePositions={(items) => {
                  const deleted = positions.filter((p) => !items.some((i) => i.id === p.id));
                  setPositions(items);
                  StorageService.setPositions(items);
                  if (tursoConfig.autoSyncEnabled && tursoConfig.url) {
                    deleted.forEach((p) =>
                      directDeletePositionFromTurso(p.id, tursoConfig.url, tursoConfig.authToken).catch(() => {})
                    );
                    items.forEach((p) =>
                      directSavePositionToTurso(p, tursoConfig.url, tursoConfig.authToken).catch(() => {})
                    );
                  }
                }}
                devices={devices}
                onUpdateDevices={(items) => {
                  const deleted = devices.filter((dev) => !items.some((i) => i.id === dev.id));
                  setDevices(items);
                  StorageService.setDevices(items);
                  if (tursoConfig.autoSyncEnabled && tursoConfig.url) {
                    deleted.forEach((dev) =>
                      directDeleteBiometricDeviceFromTurso(dev.id, tursoConfig.url, tursoConfig.authToken).catch(() => {})
                    );
                    items.forEach((dev) =>
                      directSaveBiometricDeviceToTurso(dev, tursoConfig.url, tursoConfig.authToken).catch(() => {})
                    );
                  }
                }}
                userAccounts={userAccounts}
                onUpdateUserAccounts={handleUpdateUserAccounts}
                tursoConfig={tursoConfig}
                onUpdateTursoConfig={handleUpdateTursoConfig}
                employees={employees}
                attendance={attendance}
                payroll={payroll}
                leaves={leaves}
                jobs={jobs}
                candidates={candidates}
                onboardingCases={onboardingCases}
                appraisals={appraisals}
                language={language}
                onSyncFromTurso={() => handleSyncFromTurso(false)}
                isSyncingTurso={isSyncingTurso}
              />
            )}
          </div>
        )}
      </main>

      {/* Biometric Interactive Scanner Terminal Modal */}
      <BiometricScannerModal
        isOpen={isBiometricOpen}
        onClose={() => setIsBiometricOpen(false)}
        employees={employees}
        selectedEmployeeId={currentEmployeeId}
        onRecordAttendance={handleRecordAttendance}
        language={language}
      />

      {/* Automated Email Notification Drawer */}
      <EmailNotificationDrawer
        isOpen={isEmailDrawerOpen}
        onClose={() => setIsEmailDrawerOpen(false)}
        emails={emails}
        onTriggerTestEmail={handleTriggerTestEmail}
        language={language}
      />

      {/* Global Digital Payslip Viewer Modal (for Mobile or direct clicks) */}
      {activePayslipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Official Payslip: {activePayslipModal.monthYear}
                </h3>
              </div>
              <button
                onClick={() => setActivePayslipModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-slate-700">
                <div className="flex justify-between font-semibold">
                  <span>Employee:</span>
                  <span>{activePayslipModal.employeeName} ({activePayslipModal.employeeId})</span>
                </div>
                <div className="flex justify-between">
                  <span>Ref:</span>
                  <span className="font-mono">{activePayslipModal.payslipRef}</span>
                </div>
              </div>

              <div className="space-y-1.5 divide-y divide-slate-100">
                <div className="flex justify-between pt-1">
                  <span>Base Salary:</span>
                  <span className="font-mono font-medium">{formatMMK(activePayslipModal.baseSalaryMMK)}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>Allowances:</span>
                  <span className="font-mono text-emerald-600">
                    +{formatMMK(activePayslipModal.allowanceTransportMMK + activePayslipModal.allowanceMealMMK)}
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>Deductions (SSB + Tax):</span>
                  <span className="font-mono text-rose-500">
                    -{formatMMK(activePayslipModal.deductionSSBMMK + activePayslipModal.deductionTaxMMK)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 font-bold text-slate-900 text-sm">
                  <span>Net Disbursed:</span>
                  <span className="font-mono text-indigo-700">{formatMMK(activePayslipModal.netPayMMK)}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
                <button
                  onClick={() => setActivePayslipModal(null)}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Real-time Turso Cloud Sync Toast Notification */}
      {syncStatusToast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2 text-xs font-semibold transition-all duration-300 ${
            syncStatusToast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-emerald-500/10'
              : 'bg-rose-50 text-rose-800 border-rose-200 shadow-rose-500/10'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              syncStatusToast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'
            }`}
          />
          <span>{syncStatusToast.message}</span>
        </div>
      )}
    </div>
  );
}
