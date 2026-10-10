export type Language = 'en' | 'my';

export type UserRole = 'super_admin' | 'hr_admin' | 'manager' | 'employee';

export interface UserAccount {
  id: string;
  username: string;
  fullName: string;
  email: string;
  password?: string;
  role: UserRole;
  employeeId?: string; // Linked employee ID (e.g. NX-1002)
  department?: string;
  status: 'active' | 'suspended';
  lastLogin?: string;
  createdAt: string;
  avatar?: string;
  permissions: string[];
}

export interface TursoDatabaseConfig {
  url: string; // e.g. libsql://hr-db-user.turso.io or https://...
  authToken: string;
  isConnected: boolean;
  lastSyncTime?: string;
  autoSyncEnabled: boolean;
  databaseName?: string;
}

export interface TursoQueryResult {
  columns: string[];
  rows: (string | number | boolean | null)[][];
  rowsAffected?: number;
  executionTimeMs?: number;
  error?: string;
}

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  nameMyanmar: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  nrcNumber: string; // Myanmar National Registration Card
  joinDate: string;
  avatar: string;
  baseSalaryMMK: number;
  status: 'active' | 'probation' | 'onboarding';
  
  // Demographics & Personal Details
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  bloodType?: string;
  maritalStatus?: 'single' | 'married' | 'divorced';
  nationality?: string;
  address?: string;
  townshipCity?: string;
  personalEmail?: string;
  passportNumber?: string;

  // Employment & Roster
  assignedShift?: string;
  salaryGrade?: string;
  allowanceTransportMMK?: number;
  allowanceMealMMK?: number;
  reportingManager?: string;
  workLocation?: string;
  employmentType?: 'permanent' | 'probation' | 'contract' | 'intern';
  probationEndDate?: string;

  // Statutory Tax & Social Security
  ssbNumber?: string;
  taxTINNumber?: string;

  // Banking
  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };

  // Contacts
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  secondaryEmergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };

  // Biometrics & Security
  biometrics: {
    fingerprintEnrolled: boolean;
    irisEnrolled: boolean;
    securityPin: string;
    keycardNumber?: string;
  };

  // Education & Professional
  educationDegree?: string;
  educationInstitute?: string;
  experienceYears?: number;

  // Photos & Credential Documents
  licensePhoto?: string; // Driver's license / professional license photo (base64 image data URL)
  certificatePhotos?: EmployeeCertificate[]; // Degree & training certificate photos
}

export interface EmployeeCertificate {
  id: string;
  title: string;
  issuingOrganization?: string;
  issueDate?: string;
  photoUrl: string; // Base64 image data URL
}

export interface RecruitmentJob {
  id: string;
  title: string;
  department: string;
  type: 'Full-time' | 'Remote' | 'Hybrid';
  location: string;
  openings: number;
  applicantsCount: number;
  salaryRangeMMK: string;
  status: 'active' | 'draft' | 'closed';
  postedDate: string;
  description: string;
  requirements: string[];
}

export type CandidateStage = 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';

export interface Candidate {
  id: string;
  jobId: string;
  jobTitle: string;
  name: string;
  email: string;
  phone: string;
  experienceYears: number;
  appliedDate: string;
  currentStage: CandidateStage;
  rating: number; // 1 to 5
  scores: {
    technical: number;
    communication: number;
    culturalFit: number;
  };
  interviewNotes?: string;
  resumeFileName: string;
  expectedSalaryMMK: number;
}

export interface OnboardingChecklistItem {
  id: string;
  title: string;
  titleMyanmar: string;
  category: 'documentation' | 'it_setup' | 'orientation' | 'training';
  completed: boolean;
  verifiedByHR: boolean;
  notes?: string;
}

export interface OnboardingCase {
  id: string;
  candidateId?: string;
  employeeName: string;
  role: string;
  department: string;
  email: string;
  startDate: string;
  mentor: string;
  progress: number;
  status: 'in_progress' | 'completed';
  checklist: OnboardingChecklistItem[];
}

export type AttendanceMethod = 'fingerprint' | 'eye_scan' | 'mobile' | 'manual';
export type AttendanceStatus = 'present' | 'late' | 'half_day' | 'absent';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string; // YYYY-MM-DD
  clockInTime: string; // HH:mm:ss
  clockOutTime?: string;
  method: AttendanceMethod;
  status: AttendanceStatus;
  location: string;
  overtimeHours: number;
  biometricConfidence: number; // e.g. 98.7%
}

export type LeaveType = 'annual' | 'casual' | 'medical' | 'maternity' | 'paternity' | 'unpaid';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  appliedDate: string;
  status: LeaveStatus;
  reviewedBy?: string;
  managerComment?: string;
  emergencyPhone: string;
}

export interface LeaveBalance {
  annualTotal: number;
  annualUsed: number;
  casualTotal: number;
  casualUsed: number;
  medicalTotal: number;
  medicalUsed: number;
  maternityTotal: number;
  maternityUsed: number;
}

export interface PayrollRecord {
  id: string;
  monthYear: string; // e.g. "October 2026"
  employeeId: string;
  employeeName: string;
  role: string;
  department: string;
  baseSalaryMMK: number;
  allowanceTransportMMK: number;
  allowanceMealMMK: number;
  overtimePayMMK: number;
  deductionSSBMMK: number; // 2% Social Security Board
  deductionTaxMMK: number; // Income Tax
  deductionUnpaidLeaveMMK: number;
  netPayMMK: number;
  status: 'draft' | 'processed' | 'paid';
  paymentDate?: string;
  payslipRef: string;
}

export interface AppraisalRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  role: string;
  cycle: string; // "Q3 2026" or "Annual 2026"
  reviewer: string;
  ratings: {
    kpiExecution: number; // 1-5
    competency: number;
    teamwork: number;
    leadership: number;
  };
  overallScore: number; // avg out of 5
  status: 'draft' | 'submitted' | 'completed';
  strengths: string;
  growthAreas: string;
  promotionRecommendation: boolean;
  reviewedDate: string;
}

export type EmailNotificationCategory =
  | 'recruitment'
  | 'onboarding'
  | 'attendance'
  | 'payroll'
  | 'leave'
  | 'appraisal';

export interface EmailNotification {
  id: string;
  to: string;
  recipientName: string;
  category: EmailNotificationCategory;
  subject: string;
  preview: string;
  htmlContent: string;
  sentAt: string;
  status: 'delivered' | 'opened';
}

// ================= SETUP MENU DATA STRUCTURES =================
export interface DepartmentSetupItem {
  id: string;
  code: string;
  name: string;
  nameMyanmar: string;
  headOfDepartment: string;
  headEmail: string;
  annualBudgetMMK: number;
  totalEmployees: number;
  status: 'active' | 'inactive';
}

export interface LeaveSetupItem {
  id: string;
  leaveType: string;
  title: string;
  titleMyanmar: string;
  defaultDays: number;
  isPaid: boolean;
  carryForwardMaxDays: number;
  requireMedicalCertificate: boolean;
  minDaysNotice: number;
  description: string;
}

export interface DutyShiftSetupItem {
  id: string;
  shiftCode: string;
  name: string;
  nameMyanmar: string;
  startTime: string; // "09:00"
  endTime: string; // "17:30"
  gracePeriodMinutes: number; // e.g. 15 mins
  breakDurationMinutes: number; // 60 mins
  otMinimumMinutes: number; // 30 mins
  isNightShift: boolean;
  activeDays: string[];
  assignedEmployeesCount: number;
}

export interface SalaryGradeTier {
  grade: string;
  title: string;
  minBaseMMK: number;
  maxBaseMMK: number;
  defaultTransportMMK: number;
  defaultMealMMK: number;
}

export interface SalarySetupConfig {
  tiers: SalaryGradeTier[];
  ssbEmployeePercent: number; // 2%
  ssbEmployerPercent: number; // 3%
  ssbSalaryCapMMK: number; // 300,000 MMK cap (6,000 Ks employee deduction)
  taxPersonalExemptionMMK: number;
  overtimeHourlyMultiplier: number; // 1.5x
  currency: 'MMK' | 'USD';
  payrollCutoffDay: number;
  payDisbursementDay: number;
}

export interface PositionSetupItem {
  id: string;
  code: string;
  title: string;
  titleMyanmar: string;
  department: string;
  level: 'Entry' | 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Executive';
  salaryGrade: string;
  minExperienceYears: number;
  responsibilities: string[];
}

export interface BiometricDeviceSetupItem {
  id: string;
  terminalName: string;
  location: string;
  ipAddress: string;
  deviceType: 'Fingerprint + Retina' | 'Optical Retina' | 'Fingerprint';
  status: 'online' | 'offline';
  geofenceRadiusMeters: number;
  lastSyncTime: string;
}

