import {
  Employee,
  RecruitmentJob,
  Candidate,
  OnboardingCase,
  AttendanceRecord,
  LeaveRequest,
  LeaveBalance,
  PayrollRecord,
  AppraisalRecord,
  EmailNotification,
  DepartmentSetupItem,
  LeaveSetupItem,
  DutyShiftSetupItem,
  SalarySetupConfig,
  PositionSetupItem,
  BiometricDeviceSetupItem,
  UserAccount,
  TursoDatabaseConfig,
} from '../types';
import {
  INITIAL_EMPLOYEES,
  INITIAL_JOBS,
  INITIAL_CANDIDATES,
  INITIAL_ONBOARDING_CASES,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_LEAVE_BALANCES,
  INITIAL_PAYROLL,
  INITIAL_APPRAISALS,
  INITIAL_EMAILS,
  INITIAL_DEPARTMENTS,
  INITIAL_LEAVE_SETUP,
  INITIAL_DUTY_SHIFTS,
  INITIAL_SALARY_CONFIG,
  INITIAL_POSITIONS,
  INITIAL_BIOMETRIC_DEVICES,
  INITIAL_USER_ACCOUNTS,
} from '../data/mockData';

const DEFAULT_TURSO_CONFIG: TursoDatabaseConfig = {
  url: 'libsql://hrm-database-theinlwinoo.aws-ap-northeast-1.turso.io',
  authToken:
    'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTEyOTY1MjksImlkIjoiMDFhMTExOTctMzAwMS03MzU0LWJiYzYtYjEyMzVkZmI4MjRhIiwia2lkIjoidU9kRnhXVklVZjFBNGctc2o5aWNiTUl1cVUxXzh0d3k4QkVRck5Xcjh4WSIsInJpZCI6IjJmZTkwOGRkLWZkNTItNDAzNC04ODkyLTQyNDNmODdhNjA0NCJ9.O-X8qHX8SBXrZ370sCxJfc_9oyhevd01h09xx3q3BBLvi9XCPOF0JMTpcaP3GBdXSBVLATMBgDNpJw8XG3eRDw',
  isConnected: true,
  lastSyncTime: '2026-10-06 14:48:07',
  autoSyncEnabled: true,
  databaseName: 'hrm-database-theinlwinoo',
};

const STORAGE_KEYS = {
  EMPLOYEES: 'nexhr_employees_v1',
  JOBS: 'nexhr_jobs_v1',
  CANDIDATES: 'nexhr_candidates_v1',
  ONBOARDING: 'nexhr_onboarding_v1',
  ATTENDANCE: 'nexhr_attendance_v1',
  LEAVES: 'nexhr_leaves_v1',
  LEAVE_BALANCES: 'nexhr_leave_balances_v1',
  PAYROLL: 'nexhr_payroll_v1',
  APPRAISALS: 'nexhr_appraisals_v1',
  EMAILS: 'nexhr_emails_v1',
  LANGUAGE: 'nexhr_lang_v1',
  DEPARTMENTS: 'nexhr_departments_v1',
  LEAVE_SETUP: 'nexhr_leave_setup_v1',
  DUTY_SHIFTS: 'nexhr_duty_shifts_v1',
  SALARY_CONFIG: 'nexhr_salary_config_v1',
  POSITIONS: 'nexhr_positions_v1',
  DEVICES: 'nexhr_devices_v1',
  USER_ACCOUNTS: 'nexhr_user_accounts_v1',
  TURSO_CONFIG: 'nexhr_turso_config_v1',
  CURRENT_USER: 'nexhr_current_user_v1',
};

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('Storage error', e);
  }
}

export const StorageService = {
  getEmployees: (): Employee[] => safeGet(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES),
  setEmployees: (data: Employee[]) => safeSet(STORAGE_KEYS.EMPLOYEES, data),

  getJobs: (): RecruitmentJob[] => safeGet(STORAGE_KEYS.JOBS, INITIAL_JOBS),
  setJobs: (data: RecruitmentJob[]) => safeSet(STORAGE_KEYS.JOBS, data),

  getCandidates: (): Candidate[] => safeGet(STORAGE_KEYS.CANDIDATES, INITIAL_CANDIDATES),
  setCandidates: (data: Candidate[]) => safeSet(STORAGE_KEYS.CANDIDATES, data),

  getOnboardingCases: (): OnboardingCase[] => safeGet(STORAGE_KEYS.ONBOARDING, INITIAL_ONBOARDING_CASES),
  setOnboardingCases: (data: OnboardingCase[]) => safeSet(STORAGE_KEYS.ONBOARDING, data),

  getAttendance: (): AttendanceRecord[] => {
    const stored = safeGet<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
    if (!stored || stored.length < 8) {
      safeSet(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
      return INITIAL_ATTENDANCE;
    }
    return stored;
  },
  setAttendance: (data: AttendanceRecord[]) => safeSet(STORAGE_KEYS.ATTENDANCE, data),

  getLeaves: (): LeaveRequest[] => safeGet(STORAGE_KEYS.LEAVES, INITIAL_LEAVE_REQUESTS),
  setLeaves: (data: LeaveRequest[]) => safeSet(STORAGE_KEYS.LEAVES, data),

  getLeaveBalances: (): Record<string, LeaveBalance> => safeGet(STORAGE_KEYS.LEAVE_BALANCES, INITIAL_LEAVE_BALANCES),
  setLeaveBalances: (data: Record<string, LeaveBalance>) => safeSet(STORAGE_KEYS.LEAVE_BALANCES, data),

  getPayroll: (): PayrollRecord[] => safeGet(STORAGE_KEYS.PAYROLL, INITIAL_PAYROLL),
  setPayroll: (data: PayrollRecord[]) => safeSet(STORAGE_KEYS.PAYROLL, data),

  getAppraisals: (): AppraisalRecord[] => {
    const stored = safeGet<AppraisalRecord[]>(STORAGE_KEYS.APPRAISALS, INITIAL_APPRAISALS);
    if (!stored || stored.length < 4) {
      safeSet(STORAGE_KEYS.APPRAISALS, INITIAL_APPRAISALS);
      return INITIAL_APPRAISALS;
    }
    return stored;
  },
  setAppraisals: (data: AppraisalRecord[]) => safeSet(STORAGE_KEYS.APPRAISALS, data),

  getEmails: (): EmailNotification[] => safeGet(STORAGE_KEYS.EMAILS, INITIAL_EMAILS),
  setEmails: (data: EmailNotification[]) => safeSet(STORAGE_KEYS.EMAILS, data),

  getDepartments: (): DepartmentSetupItem[] => safeGet(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS),
  setDepartments: (data: DepartmentSetupItem[]) => safeSet(STORAGE_KEYS.DEPARTMENTS, data),

  getLeaveSetup: (): LeaveSetupItem[] => safeGet(STORAGE_KEYS.LEAVE_SETUP, INITIAL_LEAVE_SETUP),
  setLeaveSetup: (data: LeaveSetupItem[]) => safeSet(STORAGE_KEYS.LEAVE_SETUP, data),

  getDutyShifts: (): DutyShiftSetupItem[] => safeGet(STORAGE_KEYS.DUTY_SHIFTS, INITIAL_DUTY_SHIFTS),
  setDutyShifts: (data: DutyShiftSetupItem[]) => safeSet(STORAGE_KEYS.DUTY_SHIFTS, data),

  getSalaryConfig: (): SalarySetupConfig => safeGet(STORAGE_KEYS.SALARY_CONFIG, INITIAL_SALARY_CONFIG),
  setSalaryConfig: (data: SalarySetupConfig) => safeSet(STORAGE_KEYS.SALARY_CONFIG, data),

  getPositions: (): PositionSetupItem[] => safeGet(STORAGE_KEYS.POSITIONS, INITIAL_POSITIONS),
  setPositions: (data: PositionSetupItem[]) => safeSet(STORAGE_KEYS.POSITIONS, data),

  getDevices: (): BiometricDeviceSetupItem[] => safeGet(STORAGE_KEYS.DEVICES, INITIAL_BIOMETRIC_DEVICES),
  setDevices: (data: BiometricDeviceSetupItem[]) => safeSet(STORAGE_KEYS.DEVICES, data),

  getUserAccounts: (): UserAccount[] => safeGet(STORAGE_KEYS.USER_ACCOUNTS, INITIAL_USER_ACCOUNTS),
  setUserAccounts: (data: UserAccount[]) => safeSet(STORAGE_KEYS.USER_ACCOUNTS, data),

  getTursoConfig: (): TursoDatabaseConfig => safeGet(STORAGE_KEYS.TURSO_CONFIG, DEFAULT_TURSO_CONFIG),
  setTursoConfig: (data: TursoDatabaseConfig) => safeSet(STORAGE_KEYS.TURSO_CONFIG, data),

  getCurrentUser: (): UserAccount => {
    const list = safeGet(STORAGE_KEYS.USER_ACCOUNTS, INITIAL_USER_ACCOUNTS);
    const saved = safeGet<UserAccount | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (saved && list.some((u) => u.id === saved.id)) return saved;
    return list[1] || list[0]; // Default Daw Khin Thuzar (HR Admin) or Super Admin
  },
  setCurrentUser: (user: UserAccount) => safeSet(STORAGE_KEYS.CURRENT_USER, user),

  addEmailNotification: (notification: Omit<EmailNotification, 'id' | 'sentAt' | 'status'>): EmailNotification => {
    const list = safeGet(STORAGE_KEYS.EMAILS, INITIAL_EMAILS);
    const newEmail: EmailNotification = {
      ...notification,
      id: `eml-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sentAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      status: 'delivered',
    };
    safeSet(STORAGE_KEYS.EMAILS, [newEmail, ...list]);
    return newEmail;
  },
};
