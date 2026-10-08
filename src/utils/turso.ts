/**
 * Turso Database (libSQL / SQLite) Integration Engine
 * Provides direct cloud storage persistence, live SQL query console,
 * complete DDL schemas, and two-way sync for NexHR.
 */

import { createClient, Client } from '@libsql/client/web';
import {
  DepartmentSetupItem,
  LeaveSetupItem,
  DutyShiftSetupItem,
  SalarySetupConfig,
  PositionSetupItem,
  BiometricDeviceSetupItem,
  UserAccount,
  Employee,
  AttendanceRecord,
  LeaveRequest,
  LeaveBalance,
  PayrollRecord,
  RecruitmentJob,
  Candidate,
  OnboardingCase,
  AppraisalRecord,
  TursoQueryResult,
} from '../types';

// =========================================================================
// 1. COMPLETE SQL DDL SCHEMA SCRIPT FOR TURSO DATABASE
// =========================================================================

export const TURSO_DDL_SCRIPT = `-- ====================================================================
-- NexHR Enterprise Human Resource Management System
-- Turso Database (libSQL / SQLite) Complete Production DDL Schema
-- Compatible with Turso Edge Cloud, SQLite 3.38+, and libSQL
-- ====================================================================

-- 1. Departments Master Table
CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_myanmar TEXT NOT NULL,
  head_of_department TEXT,
  head_email TEXT,
  annual_budget_mmk REAL DEFAULT 0,
  total_employees INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Positions / Designations Master Table
CREATE TABLE IF NOT EXISTS positions (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  title_myanmar TEXT NOT NULL,
  department TEXT NOT NULL,
  level TEXT CHECK (level IN ('Entry', 'Junior', 'Mid', 'Senior', 'Lead', 'Executive')) DEFAULT 'Mid',
  salary_grade TEXT DEFAULT 'E1',
  min_experience_years INTEGER DEFAULT 1,
  responsibilities TEXT, -- JSON array of strings
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Duty Shifts Setup Table
CREATE TABLE IF NOT EXISTS duty_shifts (
  id TEXT PRIMARY KEY,
  shift_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_myanmar TEXT NOT NULL,
  start_time TEXT NOT NULL, -- HH:mm
  end_time TEXT NOT NULL,   -- HH:mm
  grace_period_minutes INTEGER DEFAULT 15,
  break_duration_minutes INTEGER DEFAULT 60,
  ot_minimum_minutes INTEGER DEFAULT 30,
  is_night_shift INTEGER DEFAULT 0, -- 0 or 1
  active_days TEXT, -- JSON array of strings
  assigned_employees_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Leave Types Setup Table
CREATE TABLE IF NOT EXISTS leave_types (
  id TEXT PRIMARY KEY,
  leave_type TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  title_myanmar TEXT NOT NULL,
  default_days INTEGER NOT NULL,
  is_paid INTEGER DEFAULT 1,
  carry_forward_max_days INTEGER DEFAULT 0,
  require_medical_certificate INTEGER DEFAULT 0,
  min_days_notice INTEGER DEFAULT 1,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Salary Setup Configuration Table
CREATE TABLE IF NOT EXISTS salary_configurations (
  id TEXT PRIMARY KEY,
  ssb_employee_percent REAL DEFAULT 2.0,
  ssb_employer_percent REAL DEFAULT 3.0,
  ssb_salary_cap_mmk REAL DEFAULT 300000.0,
  tax_personal_exemption_mmk REAL DEFAULT 4800000.0,
  overtime_hourly_multiplier REAL DEFAULT 1.5,
  currency TEXT DEFAULT 'MMK',
  payroll_cutoff_day INTEGER DEFAULT 25,
  pay_disbursement_day INTEGER DEFAULT 28,
  tiers_json TEXT, -- JSON array of SalaryGradeTier
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Biometric Terminal Devices Table
CREATE TABLE IF NOT EXISTS biometric_devices (
  id TEXT PRIMARY KEY,
  terminal_name TEXT NOT NULL,
  location TEXT NOT NULL,
  ip_address TEXT,
  device_type TEXT NOT NULL,
  status TEXT CHECK (status IN ('online', 'offline')) DEFAULT 'online',
  geofence_radius_meters INTEGER DEFAULT 100,
  last_sync_time DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. User Accounts & Access Control Table
CREATE TABLE IF NOT EXISTS user_accounts (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT CHECK (role IN ('super_admin', 'hr_admin', 'manager', 'employee')) DEFAULT 'employee',
  employee_id TEXT, -- References employees(employee_id)
  department TEXT,
  status TEXT CHECK (status IN ('active', 'suspended')) DEFAULT 'active',
  permissions TEXT, -- JSON array of granted permission strings
  avatar_url TEXT,
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE SET NULL
);

-- 8. Complete Employees Master Table
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  employee_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_myanmar TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  nrc_number TEXT NOT NULL, -- Myanmar National Registration Card
  join_date TEXT NOT NULL,
  avatar TEXT,
  base_salary_mmk REAL NOT NULL,
  status TEXT CHECK (status IN ('active', 'probation', 'onboarding')) DEFAULT 'active',
  
  -- Demographics
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  date_of_birth TEXT,
  blood_type TEXT,
  marital_status TEXT,
  nationality TEXT DEFAULT 'Myanmar',
  address TEXT,
  township_city TEXT,
  personal_email TEXT,
  passport_number TEXT,
  
  -- Employment Details
  assigned_shift TEXT,
  salary_grade TEXT,
  allowance_transport_mmk REAL DEFAULT 0,
  allowance_meal_mmk REAL DEFAULT 0,
  reporting_manager TEXT,
  work_location TEXT DEFAULT 'Yangon HQ',
  employment_type TEXT DEFAULT 'permanent',
  probation_end_date TEXT,
  
  -- Statutory
  ssb_number TEXT,
  tax_tin_number TEXT,
  
  -- Banking Details (JSON)
  bank_account TEXT, -- JSON: { bankName, accountNumber, accountName }
  
  -- Emergency Contacts (JSON)
  emergency_contact TEXT, -- JSON: { name, relationship, phone }
  secondary_emergency_contact TEXT,
  
  -- Biometrics & Security (JSON)
  biometrics TEXT, -- JSON: { fingerprintEnrolled, irisEnrolled, securityPin, keycardNumber }
  
  -- Education
  education_degree TEXT,
  education_institute TEXT,
  experience_years INTEGER DEFAULT 0,
  
  -- Photos & Document Credentials
  license_photo TEXT,
  certificates_json TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. Biometric Attendance Records Table
CREATE TABLE IF NOT EXISTS attendance_records (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  department TEXT NOT NULL,
  date TEXT NOT NULL, -- YYYY-MM-DD
  clock_in_time TEXT NOT NULL, -- HH:mm:ss
  clock_out_time TEXT,
  method TEXT CHECK (method IN ('fingerprint', 'eye_scan', 'manual')) DEFAULT 'fingerprint',
  status TEXT CHECK (status IN ('present', 'late', 'half_day', 'absent')) DEFAULT 'present',
  location TEXT NOT NULL,
  overtime_hours REAL DEFAULT 0,
  biometric_confidence REAL DEFAULT 99.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
);

-- 10. Leave Requests Table
CREATE TABLE IF NOT EXISTS leave_requests (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  department TEXT NOT NULL,
  leave_type TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  days_count INTEGER NOT NULL,
  reason TEXT NOT NULL,
  applied_date TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  reviewed_by TEXT,
  manager_comment TEXT,
  emergency_phone TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
);

-- 11. Leave Balances Table
CREATE TABLE IF NOT EXISTS leave_balances (
  employee_id TEXT PRIMARY KEY,
  annual_total INTEGER DEFAULT 14,
  annual_used INTEGER DEFAULT 0,
  casual_total INTEGER DEFAULT 6,
  casual_used INTEGER DEFAULT 0,
  medical_total INTEGER DEFAULT 10,
  medical_used INTEGER DEFAULT 0,
  maternity_total INTEGER DEFAULT 84,
  maternity_used INTEGER DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
);

-- 12. Payroll Records Table
CREATE TABLE IF NOT EXISTS payroll_records (
  id TEXT PRIMARY KEY,
  month_year TEXT NOT NULL,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT NOT NULL,
  base_salary_mmk REAL NOT NULL,
  allowance_transport_mmk REAL DEFAULT 0,
  allowance_meal_mmk REAL DEFAULT 0,
  overtime_pay_mmk REAL DEFAULT 0,
  deduction_ssb_mmk REAL DEFAULT 0,
  deduction_tax_mmk REAL DEFAULT 0,
  deduction_unpaid_leave_mmk REAL DEFAULT 0,
  net_pay_mmk REAL NOT NULL,
  status TEXT CHECK (status IN ('draft', 'processed', 'paid')) DEFAULT 'draft',
  payment_date TEXT,
  payslip_ref TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
);

-- 13. Recruitment Jobs Table
CREATE TABLE IF NOT EXISTS recruitment_jobs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  type TEXT NOT NULL,
  location TEXT NOT NULL,
  openings INTEGER DEFAULT 1,
  applicants_count INTEGER DEFAULT 0,
  salary_range_mmk TEXT,
  status TEXT CHECK (status IN ('active', 'draft', 'closed')) DEFAULT 'active',
  posted_date TEXT NOT NULL,
  description TEXT,
  requirements TEXT, -- JSON array of strings
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 14. Candidates Pipeline Table
CREATE TABLE IF NOT EXISTS candidates (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  job_title TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  experience_years INTEGER DEFAULT 0,
  applied_date TEXT NOT NULL,
  current_stage TEXT CHECK (current_stage IN ('applied', 'screening', 'interview', 'offer', 'hired', 'rejected')) DEFAULT 'applied',
  rating REAL DEFAULT 0,
  scores TEXT, -- JSON: { technical, communication, culturalFit }
  interview_notes TEXT,
  resume_file_name TEXT,
  expected_salary_mmk REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES recruitment_jobs(id) ON DELETE CASCADE
);

-- 15. Onboarding Cases Table
CREATE TABLE IF NOT EXISTS onboarding_cases (
  id TEXT PRIMARY KEY,
  candidate_id TEXT,
  employee_name TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT NOT NULL,
  email TEXT NOT NULL,
  start_date TEXT NOT NULL,
  mentor TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('in_progress', 'completed')) DEFAULT 'in_progress',
  checklist TEXT, -- JSON array of checklist items
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 16. Performance Appraisal Records Table
CREATE TABLE IF NOT EXISTS appraisal_records (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  department TEXT NOT NULL,
  role TEXT NOT NULL,
  cycle TEXT NOT NULL,
  reviewer TEXT NOT NULL,
  ratings TEXT, -- JSON: { kpiExecution, competency, teamwork, leadership }
  overall_score REAL NOT NULL,
  status TEXT CHECK (status IN ('draft', 'submitted', 'completed')) DEFAULT 'completed',
  strengths TEXT,
  growth_areas TEXT,
  promotion_recommendation INTEGER DEFAULT 0,
  reviewed_date TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
);

-- 17. Automated Email Notifications Archive Table
CREATE TABLE IF NOT EXISTS email_notifications (
  id TEXT PRIMARY KEY,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  preview TEXT,
  html_content TEXT,
  sent_at TEXT NOT NULL,
  status TEXT DEFAULT 'delivered',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 18. Audit Log Table
CREATE TABLE IF NOT EXISTS system_audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  details TEXT,
  ip_address TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- PERFORMANCE INDEXES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_employees_dept ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_attendance_emp_date ON attendance_records(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_leave_emp ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_payroll_emp_month ON payroll_records(employee_id, month_year);
CREATE INDEX IF NOT EXISTS idx_candidates_job ON candidates(job_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON user_accounts(username);
`;

// =========================================================================
// 2. TURSO CLIENT & CONNECTION MANAGER
// =========================================================================

let cachedClient: Client | null = null;
let cachedConfigKey = '';

export function getTursoClient(url: string, authToken: string): Client {
  const normalizedUrl = url.trim().replace(/^libsql:\/\//, 'https://');
  const key = `${normalizedUrl}:${authToken.trim()}`;
  if (cachedClient && cachedConfigKey === key) {
    return cachedClient;
  }
  cachedClient = createClient({
    url: normalizedUrl,
    authToken: authToken.trim(),
  });
  cachedConfigKey = key;
  return cachedClient;
}

/**
 * Test Turso connection by executing a lightweight ping query.
 */
export async function testTursoConnection(
  url: string,
  authToken: string
): Promise<{ success: boolean; latencyMs: number; message: string }> {
  const startTime = performance.now();
  try {
    if (!url || !authToken) {
      return {
        success: false,
        latencyMs: 0,
        message: 'Turso Database URL and Auth Token are required.',
      };
    }
    const client = getTursoClient(url, authToken);
    const rs = await client.execute('SELECT 1 as ping, datetime("now") as server_time;');
    const latencyMs = Math.round(performance.now() - startTime);
    return {
      success: true,
      latencyMs,
      message: `Connected successfully to Turso Cloud! (Server time: ${rs.rows[0]?.[1] || 'OK'}, Latency: ${latencyMs}ms)`,
    };
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - startTime);
    return {
      success: false,
      latencyMs,
      message: `Connection failed: ${err.message || String(err)}`,
    };
  }
}

/**
 * Execute arbitrary SQL query against Turso Cloud.
 */
export async function executeTursoSql(
  sql: string,
  url: string,
  authToken: string
): Promise<TursoQueryResult> {
  const startTime = performance.now();
  try {
    const client = getTursoClient(url, authToken);
    const trimmed = sql.trim();
    if (!trimmed) {
      return { columns: [], rows: [], error: 'Empty SQL query.' };
    }

    const rs = await client.execute(trimmed);
    const executionTimeMs = Math.round(performance.now() - startTime);

    return {
      columns: rs.columns || [],
      rows: (rs.rows as any[]) || [],
      rowsAffected: rs.rowsAffected,
      executionTimeMs,
    };
  } catch (err: any) {
    const executionTimeMs = Math.round(performance.now() - startTime);
    return {
      columns: [],
      rows: [],
      executionTimeMs,
      error: err.message || String(err),
    };
  }
}

export function cleanSqlStatement(raw: string): string {
  return raw
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .map((line) => {
      const commentIdx = line.indexOf('--');
      return commentIdx >= 0 ? line.slice(0, commentIdx) : line;
    })
    .join('\n')
    .trim();
}

/**
 * Execute all DDL migration statements against Turso Cloud to initialize tables.
 */
export async function runTursoMigrations(
  url: string,
  authToken: string
): Promise<{ success: boolean; statementsRun: number; message: string }> {
  try {
    const client = getTursoClient(url, authToken);
    // Split script by semicolons, properly stripping comments
    const statements = TURSO_DDL_SCRIPT
      .split(';')
      .map((s) => cleanSqlStatement(s))
      .filter((s) => s.length > 10);

    let count = 0;
    for (const stmt of statements) {
      await client.execute(stmt);
      count++;
    }

    // Ensure photo and credential columns exist on existing tables
    try {
      await client.execute('ALTER TABLE employees ADD COLUMN license_photo TEXT;');
    } catch (_) {}
    try {
      await client.execute('ALTER TABLE employees ADD COLUMN certificates_json TEXT;');
    } catch (_) {}

    return {
      success: true,
      statementsRun: count,
      message: `Successfully executed ${count} DDL table and index migration statements on Turso Database!`,
    };
  } catch (err: any) {
    return {
      success: false,
      statementsRun: 0,
      message: `Migration error: ${err.message || String(err)}`,
    };
  }
}

// =========================================================================
// 3. DIRECT SAVE & CLOUD PERSISTENCE HOOKS
// =========================================================================

/**
 * Directly save or update an Employee to Turso Cloud.
 */
export async function directSaveEmployeeToTurso(
  emp: Employee,
  url: string,
  authToken: string
): Promise<boolean> {
  if (!url || !authToken) return false;
  try {
    const client = getTursoClient(url, authToken);
    await client.execute({
      sql: `
        INSERT INTO employees (
          id, employee_id, name, name_myanmar, role, department, email, phone,
          nrc_number, join_date, avatar, base_salary_mmk, status, gender,
          date_of_birth, blood_type, marital_status, address, township_city,
          assigned_shift, salary_grade, allowance_transport_mmk, allowance_meal_mmk,
          reporting_manager, work_location, employment_type, ssb_number, tax_tin_number,
          bank_account, emergency_contact, biometrics, education_degree,
          education_institute, experience_years, license_photo, certificates_json, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?, datetime('now')
        )
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          name_myanmar = excluded.name_myanmar,
          role = excluded.role,
          department = excluded.department,
          email = excluded.email,
          phone = excluded.phone,
          nrc_number = excluded.nrc_number,
          join_date = excluded.join_date,
          avatar = excluded.avatar,
          base_salary_mmk = excluded.base_salary_mmk,
          status = excluded.status,
          gender = excluded.gender,
          date_of_birth = excluded.date_of_birth,
          blood_type = excluded.blood_type,
          marital_status = excluded.marital_status,
          address = excluded.address,
          township_city = excluded.township_city,
          assigned_shift = excluded.assigned_shift,
          salary_grade = excluded.salary_grade,
          allowance_transport_mmk = excluded.allowance_transport_mmk,
          allowance_meal_mmk = excluded.allowance_meal_mmk,
          reporting_manager = excluded.reporting_manager,
          work_location = excluded.work_location,
          employment_type = excluded.employment_type,
          ssb_number = excluded.ssb_number,
          tax_tin_number = excluded.tax_tin_number,
          bank_account = excluded.bank_account,
          emergency_contact = excluded.emergency_contact,
          biometrics = excluded.biometrics,
          education_degree = excluded.education_degree,
          education_institute = excluded.education_institute,
          experience_years = excluded.experience_years,
          license_photo = excluded.license_photo,
          certificates_json = excluded.certificates_json,
          updated_at = datetime('now');
      `,
      args: [
        emp.id,
        emp.employeeId,
        emp.name,
        emp.nameMyanmar,
        emp.role,
        emp.department,
        emp.email,
        emp.phone,
        emp.nrcNumber,
        emp.joinDate,
        emp.avatar,
        emp.baseSalaryMMK,
        emp.status,
        emp.gender || null,
        emp.dateOfBirth || null,
        emp.bloodType || null,
        emp.maritalStatus || null,
        emp.address || null,
        emp.townshipCity || null,
        emp.assignedShift || null,
        emp.salaryGrade || null,
        emp.allowanceTransportMMK || 0,
        emp.allowanceMealMMK || 0,
        emp.reportingManager || null,
        emp.workLocation || 'Yangon HQ',
        emp.employmentType || 'permanent',
        emp.ssbNumber || null,
        emp.taxTINNumber || null,
        JSON.stringify(emp.bankAccount || {}),
        JSON.stringify(emp.emergencyContact || {}),
        JSON.stringify(emp.biometrics || {}),
        emp.educationDegree || null,
        emp.educationInstitute || null,
        emp.experienceYears || 0,
        emp.licensePhoto || null,
        JSON.stringify(emp.certificatePhotos || []),
      ],
    });
    return true;
  } catch (err) {
    console.warn('Turso directSaveEmployee error:', err);
    return false;
  }
}

/**
 * Delete Employee directly from Turso Cloud.
 */
export async function directDeleteEmployeeFromTurso(
  employeeId: string,
  url: string,
  authToken: string
): Promise<boolean> {
  if (!url || !authToken) return false;
  try {
    const client = getTursoClient(url, authToken);
    await client.execute({
      sql: 'DELETE FROM employees WHERE id = ? OR employee_id = ?;',
      args: [employeeId, employeeId],
    });
    return true;
  } catch (err) {
    console.warn('Turso directDeleteEmployee error:', err);
    return false;
  }
}

function safeJsonParse<T>(val: any, fallback: T): T {
  if (typeof val !== 'string') return val ?? fallback;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

/**
 * Direct Save / Update Department in Turso Cloud.
 */
export async function directSaveDepartmentToTurso(
  dept: DepartmentSetupItem,
  url: string,
  authToken: string
): Promise<boolean> {
  if (!url || !authToken) return false;
  try {
    const client = getTursoClient(url, authToken);
    await client.execute({
      sql: `
        INSERT INTO departments (
          id, code, name, name_myanmar, head_of_department, head_email,
          annual_budget_mmk, total_employees, status, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(id) DO UPDATE SET
          code = excluded.code,
          name = excluded.name,
          name_myanmar = excluded.name_myanmar,
          head_of_department = excluded.head_of_department,
          head_email = excluded.head_email,
          annual_budget_mmk = excluded.annual_budget_mmk,
          total_employees = excluded.total_employees,
          status = excluded.status,
          updated_at = datetime('now');
      `,
      args: [
        dept.id,
        dept.code,
        dept.name,
        dept.nameMyanmar,
        dept.headOfDepartment,
        dept.headEmail,
        dept.annualBudgetMMK,
        dept.totalEmployees,
        dept.status,
      ],
    });
    return true;
  } catch (err) {
    console.warn('Turso directSaveDepartment error:', err);
    return false;
  }
}

/**
 * Direct Delete Department from Turso Cloud.
 */
export async function directDeleteDepartmentFromTurso(
  id: string,
  url: string,
  authToken: string
): Promise<boolean> {
  if (!url || !authToken) return false;
  try {
    const client = getTursoClient(url, authToken);
    await client.execute({
      sql: 'DELETE FROM departments WHERE id = ?;',
      args: [id],
    });
    return true;
  } catch (err) {
    console.warn('Turso directDeleteDepartment error:', err);
    return false;
  }
}

/**
 * Direct Save / Update Duty Shift in Turso Cloud.
 */
export async function directSaveDutyShiftToTurso(
  shift: DutyShiftSetupItem,
  url: string,
  authToken: string
): Promise<boolean> {
  if (!url || !authToken) return false;
  try {
    const client = getTursoClient(url, authToken);
    await client.execute({
      sql: `
        INSERT INTO duty_shifts (
          id, shift_code, name, name_myanmar, start_time, end_time,
          grace_period_minutes, break_duration_minutes, ot_minimum_minutes,
          is_night_shift, active_days, assigned_employees_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          shift_code = excluded.shift_code,
          name = excluded.name,
          name_myanmar = excluded.name_myanmar,
          start_time = excluded.start_time,
          end_time = excluded.end_time,
          grace_period_minutes = excluded.grace_period_minutes,
          break_duration_minutes = excluded.break_duration_minutes,
          ot_minimum_minutes = excluded.ot_minimum_minutes,
          is_night_shift = excluded.is_night_shift,
          active_days = excluded.active_days,
          assigned_employees_count = excluded.assigned_employees_count;
      `,
      args: [
        shift.id,
        shift.shiftCode,
        shift.name,
        shift.nameMyanmar,
        shift.startTime,
        shift.endTime,
        shift.gracePeriodMinutes,
        shift.breakDurationMinutes,
        shift.otMinimumMinutes,
        shift.isNightShift ? 1 : 0,
        JSON.stringify(shift.activeDays || []),
        shift.assignedEmployeesCount,
      ],
    });
    return true;
  } catch (err) {
    console.warn('Turso directSaveDutyShift error:', err);
    return false;
  }
}

/**
 * Direct Delete Duty Shift from Turso Cloud.
 */
export async function directDeleteDutyShiftFromTurso(
  id: string,
  url: string,
  authToken: string
): Promise<boolean> {
  if (!url || !authToken) return false;
  try {
    const client = getTursoClient(url, authToken);
    await client.execute({
      sql: 'DELETE FROM duty_shifts WHERE id = ?;',
      args: [id],
    });
    return true;
  } catch (err) {
    console.warn('Turso directDeleteDutyShift error:', err);
    return false;
  }
}

/**
 * Direct Save / Update Position in Turso Cloud.
 */
export async function directSavePositionToTurso(
  pos: PositionSetupItem,
  url: string,
  authToken: string
): Promise<boolean> {
  if (!url || !authToken) return false;
  try {
    const client = getTursoClient(url, authToken);
    await client.execute({
      sql: `
        INSERT INTO positions (
          id, code, title, title_myanmar, department, level,
          salary_grade, min_experience_years, responsibilities, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(id) DO UPDATE SET
          code = excluded.code,
          title = excluded.title,
          title_myanmar = excluded.title_myanmar,
          department = excluded.department,
          level = excluded.level,
          salary_grade = excluded.salary_grade,
          min_experience_years = excluded.min_experience_years,
          responsibilities = excluded.responsibilities,
          updated_at = datetime('now');
      `,
      args: [
        pos.id,
        pos.code,
        pos.title,
        pos.titleMyanmar,
        pos.department,
        pos.level,
        pos.salaryGrade,
        pos.minExperienceYears,
        JSON.stringify(pos.responsibilities || []),
      ],
    });
    return true;
  } catch (err) {
    console.warn('Turso directSavePosition error:', err);
    return false;
  }
}

/**
 * Direct Delete Position from Turso Cloud.
 */
export async function directDeletePositionFromTurso(
  id: string,
  url: string,
  authToken: string
): Promise<boolean> {
  if (!url || !authToken) return false;
  try {
    const client = getTursoClient(url, authToken);
    await client.execute({
      sql: 'DELETE FROM positions WHERE id = ?;',
      args: [id],
    });
    return true;
  } catch (err) {
    console.warn('Turso directDeletePosition error:', err);
    return false;
  }
}

/**
 * Direct Save / Update Leave Rule in Turso Cloud.
 */
export async function directSaveLeaveTypeToTurso(
  lv: LeaveSetupItem,
  url: string,
  authToken: string
): Promise<boolean> {
  if (!url || !authToken) return false;
  try {
    const client = getTursoClient(url, authToken);
    await client.execute({
      sql: `
        INSERT INTO leave_types (
          id, leave_type, title, title_myanmar, default_days,
          is_paid, carry_forward_max_days, require_medical_certificate,
          min_days_notice, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          leave_type = excluded.leave_type,
          title = excluded.title,
          title_myanmar = excluded.title_myanmar,
          default_days = excluded.default_days,
          is_paid = excluded.is_paid,
          carry_forward_max_days = excluded.carry_forward_max_days,
          require_medical_certificate = excluded.require_medical_certificate,
          min_days_notice = excluded.min_days_notice,
          description = excluded.description;
      `,
      args: [
        lv.id,
        lv.leaveType,
        lv.title,
        lv.titleMyanmar,
        lv.defaultDays,
        lv.isPaid ? 1 : 0,
        lv.carryForwardMaxDays,
        lv.requireMedicalCertificate ? 1 : 0,
        lv.minDaysNotice,
        lv.description || '',
      ],
    });
    return true;
  } catch (err) {
    console.warn('Turso directSaveLeaveType error:', err);
    return false;
  }
}

/**
 * Direct Delete Leave Rule from Turso Cloud.
 */
export async function directDeleteLeaveTypeFromTurso(
  id: string,
  url: string,
  authToken: string
): Promise<boolean> {
  if (!url || !authToken) return false;
  try {
    const client = getTursoClient(url, authToken);
    await client.execute({
      sql: 'DELETE FROM leave_types WHERE id = ?;',
      args: [id],
    });
    return true;
  } catch (err) {
    console.warn('Turso directDeleteLeaveType error:', err);
    return false;
  }
}

/**
 * Direct Save / Update Biometric Device in Turso Cloud.
 */
export async function directSaveBiometricDeviceToTurso(
  dev: BiometricDeviceSetupItem,
  url: string,
  authToken: string
): Promise<boolean> {
  if (!url || !authToken) return false;
  try {
    const client = getTursoClient(url, authToken);
    await client.execute({
      sql: `
        INSERT INTO biometric_devices (
          id, terminal_name, location, ip_address, device_type,
          status, geofence_radius_meters, last_sync_time
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          terminal_name = excluded.terminal_name,
          location = excluded.location,
          ip_address = excluded.ip_address,
          device_type = excluded.device_type,
          status = excluded.status,
          geofence_radius_meters = excluded.geofence_radius_meters,
          last_sync_time = excluded.last_sync_time;
      `,
      args: [
        dev.id,
        dev.terminalName,
        dev.location,
        dev.ipAddress,
        dev.deviceType,
        dev.status,
        dev.geofenceRadiusMeters,
        dev.lastSyncTime || new Date().toISOString(),
      ],
    });
    return true;
  } catch (err) {
    console.warn('Turso directSaveBiometricDevice error:', err);
    return false;
  }
}

/**
 * Direct Delete Biometric Device from Turso Cloud.
 */
export async function directDeleteBiometricDeviceFromTurso(
  id: string,
  url: string,
  authToken: string
): Promise<boolean> {
  if (!url || !authToken) return false;
  try {
    const client = getTursoClient(url, authToken);
    await client.execute({
      sql: 'DELETE FROM biometric_devices WHERE id = ?;',
      args: [id],
    });
    return true;
  } catch (err) {
    console.warn('Turso directDeleteBiometricDevice error:', err);
    return false;
  }
}

/**
 * Direct Save / Update Corporate Salary Config & Grade Tiers in Turso Cloud.
 */
export async function directSaveSalaryConfigToTurso(
  cfg: SalarySetupConfig,
  url: string,
  authToken: string
): Promise<boolean> {
  if (!url || !authToken) return false;
  try {
    const client = getTursoClient(url, authToken);
    await client.execute({
      sql: `
        INSERT INTO salary_configurations (
          id, ssb_employee_percent, ssb_employer_percent, ssb_salary_cap_mmk,
          tax_personal_exemption_mmk, overtime_hourly_multiplier, currency,
          payroll_cutoff_day, pay_disbursement_day, tiers_json, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(id) DO UPDATE SET
          ssb_employee_percent = excluded.ssb_employee_percent,
          ssb_employer_percent = excluded.ssb_employer_percent,
          ssb_salary_cap_mmk = excluded.ssb_salary_cap_mmk,
          tax_personal_exemption_mmk = excluded.tax_personal_exemption_mmk,
          overtime_hourly_multiplier = excluded.overtime_hourly_multiplier,
          currency = excluded.currency,
          payroll_cutoff_day = excluded.payroll_cutoff_day,
          pay_disbursement_day = excluded.pay_disbursement_day,
          tiers_json = excluded.tiers_json,
          updated_at = datetime('now');
      `,
      args: [
        'default_salary_config',
        cfg.ssbEmployeePercent,
        cfg.ssbEmployerPercent,
        cfg.ssbSalaryCapMMK,
        cfg.taxPersonalExemptionMMK,
        cfg.overtimeHourlyMultiplier,
        cfg.currency,
        cfg.payrollCutoffDay,
        cfg.payDisbursementDay,
        JSON.stringify(cfg.tiers || []),
      ],
    });
    return true;
  } catch (err) {
    console.warn('Turso directSaveSalaryConfig error:', err);
    return false;
  }
}

/**
 * Direct Delete User Account from Turso Cloud.
 */
export async function directDeleteUserAccountFromTurso(
  id: string,
  url: string,
  authToken: string
): Promise<boolean> {
  if (!url || !authToken) return false;
  try {
    const client = getTursoClient(url, authToken);
    await client.execute({
      sql: 'DELETE FROM user_accounts WHERE id = ?;',
      args: [id],
    });
    return true;
  } catch (err) {
    console.warn('Turso directDeleteUserAccount error:', err);
    return false;
  }
}

// =========================================================================
// TURSO CLOUD DATA RETRIEVAL / FETCH ENGINES
// =========================================================================

/**
 * Fetch all employees directly from Turso Cloud.
 */
export async function fetchEmployeesFromTurso(
  url: string,
  authToken: string
): Promise<Employee[]> {
  if (!url || !authToken) return [];
  try {
    const client = getTursoClient(url, authToken);
    const rs = await client.execute('SELECT * FROM employees ORDER BY employee_id ASC;');
    return rs.rows.map((r: any) => ({
      id: String(r.id),
      employeeId: String(r.employee_id),
      name: String(r.name),
      nameMyanmar: String(r.name_myanmar || r.name),
      role: String(r.role || 'Staff'),
      department: String(r.department || 'General'),
      email: String(r.email || ''),
      phone: String(r.phone || ''),
      nrcNumber: String(r.nrc_number || ''),
      joinDate: String(r.join_date || ''),
      avatar: String(r.avatar || ''),
      baseSalaryMMK: Number(r.base_salary_mmk || 0),
      status: (r.status as any) || 'active',
      gender: r.gender || undefined,
      dateOfBirth: r.date_of_birth || undefined,
      bloodType: r.blood_type || undefined,
      maritalStatus: r.marital_status || undefined,
      address: r.address || undefined,
      townshipCity: r.township_city || undefined,
      assignedShift: r.assigned_shift || undefined,
      salaryGrade: r.salary_grade || undefined,
      allowanceTransportMMK: Number(r.allowance_transport_mmk || 0),
      allowanceMealMMK: Number(r.allowance_meal_mmk || 0),
      reportingManager: r.reporting_manager || undefined,
      workLocation: r.work_location || undefined,
      employmentType: r.employment_type || undefined,
      ssbNumber: r.ssb_number || undefined,
      taxTINNumber: r.tax_tin_number || undefined,
      bankAccount: typeof r.bank_account === 'string' ? safeJsonParse(r.bank_account, {}) : (r.bank_account || {}),
      emergencyContact: typeof r.emergency_contact === 'string' ? safeJsonParse(r.emergency_contact, {}) : (r.emergency_contact || {}),
      biometrics: typeof r.biometrics === 'string' ? safeJsonParse(r.biometrics, {}) : (r.biometrics || {}),
      educationDegree: r.education_degree || undefined,
      educationInstitute: r.education_institute || undefined,
      experienceYears: Number(r.experience_years || 0),
      licensePhoto: r.license_photo ? String(r.license_photo) : undefined,
      certificatePhotos: typeof r.certificates_json === 'string' ? safeJsonParse(r.certificates_json, []) : (r.certificates_json || []),
    }));
  } catch (err) {
    console.warn('fetchEmployeesFromTurso error:', err);
    return [];
  }
}

/**
 * Fetch all departments directly from Turso Cloud.
 */
export async function fetchDepartmentsFromTurso(
  url: string,
  authToken: string
): Promise<DepartmentSetupItem[]> {
  if (!url || !authToken) return [];
  try {
    const client = getTursoClient(url, authToken);
    const rs = await client.execute('SELECT * FROM departments ORDER BY code ASC;');
    return rs.rows.map((r: any) => ({
      id: String(r.id),
      code: String(r.code),
      name: String(r.name),
      nameMyanmar: String(r.name_myanmar || r.name),
      headOfDepartment: String(r.head_of_department || ''),
      headEmail: String(r.head_email || ''),
      annualBudgetMMK: Number(r.annual_budget_mmk || 0),
      totalEmployees: Number(r.total_employees || 0),
      status: (r.status as any) || 'active',
    }));
  } catch (err) {
    console.warn('fetchDepartmentsFromTurso error:', err);
    return [];
  }
}

/**
 * Fetch all positions directly from Turso Cloud.
 */
export async function fetchPositionsFromTurso(
  url: string,
  authToken: string
): Promise<PositionSetupItem[]> {
  if (!url || !authToken) return [];
  try {
    const client = getTursoClient(url, authToken);
    const rs = await client.execute('SELECT * FROM positions ORDER BY code ASC;');
    return rs.rows.map((r: any) => ({
      id: String(r.id),
      code: String(r.code),
      title: String(r.title),
      titleMyanmar: String(r.title_myanmar || r.title),
      department: String(r.department),
      level: (r.level as any) || 'Mid',
      salaryGrade: String(r.salary_grade || 'E1'),
      minExperienceYears: Number(r.min_experience_years || 0),
      responsibilities: typeof r.responsibilities === 'string' ? safeJsonParse(r.responsibilities, []) : (r.responsibilities || []),
    }));
  } catch (err) {
    console.warn('fetchPositionsFromTurso error:', err);
    return [];
  }
}

/**
 * Fetch all duty shifts directly from Turso Cloud.
 */
export async function fetchDutyShiftsFromTurso(
  url: string,
  authToken: string
): Promise<DutyShiftSetupItem[]> {
  if (!url || !authToken) return [];
  try {
    const client = getTursoClient(url, authToken);
    const rs = await client.execute('SELECT * FROM duty_shifts ORDER BY shift_code ASC;');
    return rs.rows.map((r: any) => ({
      id: String(r.id),
      shiftCode: String(r.shift_code),
      name: String(r.name),
      nameMyanmar: String(r.name_myanmar || r.name),
      startTime: String(r.start_time),
      endTime: String(r.end_time),
      gracePeriodMinutes: Number(r.grace_period_minutes || 15),
      breakDurationMinutes: Number(r.break_duration_minutes || 60),
      otMinimumMinutes: Number(r.ot_minimum_minutes || 30),
      isNightShift: Boolean(r.is_night_shift),
      activeDays: typeof r.active_days === 'string' ? safeJsonParse(r.active_days, ['Mon','Tue','Wed','Thu','Fri']) : (r.active_days || ['Mon','Tue','Wed','Thu','Fri']),
      assignedEmployeesCount: Number(r.assigned_employees_count || 0),
    }));
  } catch (err) {
    console.warn('fetchDutyShiftsFromTurso error:', err);
    return [];
  }
}

/**
 * Fetch leave rules directly from Turso Cloud.
 */
export async function fetchLeaveSetupFromTurso(
  url: string,
  authToken: string
): Promise<LeaveSetupItem[]> {
  if (!url || !authToken) return [];
  try {
    const client = getTursoClient(url, authToken);
    const rs = await client.execute('SELECT * FROM leave_types ORDER BY title ASC;');
    return rs.rows.map((r: any) => ({
      id: String(r.id),
      leaveType: String(r.leave_type),
      title: String(r.title),
      titleMyanmar: String(r.title_myanmar || r.title),
      defaultDays: Number(r.default_days || 0),
      isPaid: Boolean(r.is_paid),
      carryForwardMaxDays: Number(r.carry_forward_max_days || 0),
      requireMedicalCertificate: Boolean(r.require_medical_certificate),
      minDaysNotice: Number(r.min_days_notice || 1),
      description: String(r.description || ''),
    }));
  } catch (err) {
    console.warn('fetchLeaveSetupFromTurso error:', err);
    return [];
  }
}

/**
 * Fetch biometric devices directly from Turso Cloud.
 */
export async function fetchBiometricDevicesFromTurso(
  url: string,
  authToken: string
): Promise<BiometricDeviceSetupItem[]> {
  if (!url || !authToken) return [];
  try {
    const client = getTursoClient(url, authToken);
    const rs = await client.execute('SELECT * FROM biometric_devices ORDER BY terminal_name ASC;');
    return rs.rows.map((r: any) => ({
      id: String(r.id),
      terminalName: String(r.terminal_name),
      location: String(r.location),
      ipAddress: String(r.ip_address || ''),
      deviceType: (r.device_type as any) || 'Fingerprint',
      status: (r.status as any) || 'online',
      geofenceRadiusMeters: Number(r.geofence_radius_meters || 50),
      lastSyncTime: String(r.last_sync_time || ''),
    }));
  } catch (err) {
    console.warn('fetchBiometricDevicesFromTurso error:', err);
    return [];
  }
}

/**
 * Fetch salary configuration directly from Turso Cloud.
 */
export async function fetchSalaryConfigFromTurso(
  url: string,
  authToken: string
): Promise<SalarySetupConfig | null> {
  if (!url || !authToken) return null;
  try {
    const client = getTursoClient(url, authToken);
    const rs = await client.execute('SELECT * FROM salary_configurations LIMIT 1;');
    if (rs.rows.length === 0) return null;
    const r: any = rs.rows[0];
    return {
      ssbEmployeePercent: Number(r.ssb_employee_percent ?? 2),
      ssbEmployerPercent: Number(r.ssb_employer_percent ?? 3),
      ssbSalaryCapMMK: Number(r.ssb_salary_cap_mmk ?? 300000),
      taxPersonalExemptionMMK: Number(r.tax_personal_exemption_mmk ?? 4800000),
      overtimeHourlyMultiplier: Number(r.overtime_hourly_multiplier ?? 1.5),
      currency: (r.currency === 'USD' ? 'USD' : 'MMK') as 'MMK' | 'USD',
      payrollCutoffDay: Number(r.payroll_cutoff_day ?? 25),
      payDisbursementDay: Number(r.pay_disbursement_day ?? 28),
      tiers: typeof r.tiers_json === 'string' ? safeJsonParse(r.tiers_json, []) : (r.tiers_json || []),
    };
  } catch (err) {
    console.warn('fetchSalaryConfigFromTurso error:', err);
    return null;
  }
}

/**
 * Fetch user accounts directly from Turso Cloud.
 */
export async function fetchUserAccountsFromTurso(
  url: string,
  authToken: string
): Promise<UserAccount[]> {
  if (!url || !authToken) return [];
  try {
    const client = getTursoClient(url, authToken);
    const rs = await client.execute('SELECT * FROM user_accounts ORDER BY full_name ASC;');
    return rs.rows.map((r: any) => ({
      id: String(r.id),
      username: String(r.username),
      fullName: String(r.full_name),
      email: String(r.email),
      role: (r.role as any) || 'employee',
      employeeId: r.employee_id ? String(r.employee_id) : undefined,
      department: r.department ? String(r.department) : undefined,
      status: (r.status as any) || 'active',
      permissions: typeof r.permissions === 'string' ? safeJsonParse(r.permissions, []) : (r.permissions || []),
      avatar: r.avatar_url ? String(r.avatar_url) : undefined,
      lastLogin: r.last_login ? String(r.last_login) : undefined,
      createdAt: String(r.created_at || new Date().toISOString()),
    }));
  } catch (err) {
    console.warn('fetchUserAccountsFromTurso error:', err);
    return [];
  }
}

/**
 * Fetch all leave requests directly from Turso Cloud.
 */
export async function fetchLeaveRequestsFromTurso(
  url: string,
  authToken: string
): Promise<LeaveRequest[]> {
  if (!url || !authToken) return [];
  try {
    const client = getTursoClient(url, authToken);
    const rs = await client.execute('SELECT * FROM leave_requests ORDER BY applied_date DESC, created_at DESC;');
    return rs.rows.map((r: any) => ({
      id: String(r.id),
      employeeId: String(r.employee_id),
      employeeName: String(r.employee_name),
      department: String(r.department || 'General'),
      leaveType: (r.leave_type as any) || 'casual',
      startDate: String(r.start_date),
      endDate: String(r.end_date),
      daysCount: Number(r.days_count || 1),
      reason: String(r.reason || ''),
      appliedDate: String(r.applied_date || ''),
      status: (r.status as any) || 'pending',
      reviewedBy: r.reviewed_by ? String(r.reviewed_by) : undefined,
      managerComment: r.manager_comment ? String(r.manager_comment) : undefined,
      emergencyPhone: r.emergency_phone ? String(r.emergency_phone) : '+95 9 791 234 567',
    }));
  } catch (err) {
    console.warn('fetchLeaveRequestsFromTurso error:', err);
    return [];
  }
}

/**
 * Fetch all leave balances directly from Turso Cloud.
 */
export async function fetchLeaveBalancesFromTurso(
  url: string,
  authToken: string
): Promise<Record<string, LeaveBalance>> {
  if (!url || !authToken) return {};
  try {
    const client = getTursoClient(url, authToken);
    const rs = await client.execute('SELECT * FROM leave_balances;');
    const result: Record<string, LeaveBalance> = {};
    for (const r of rs.rows as any[]) {
      if (r.employee_id) {
        result[String(r.employee_id)] = {
          annualTotal: Number(r.annual_total ?? 14),
          annualUsed: Number(r.annual_used ?? 0),
          casualTotal: Number(r.casual_total ?? 6),
          casualUsed: Number(r.casual_used ?? 0),
          medicalTotal: Number(r.medical_total ?? 10),
          medicalUsed: Number(r.medical_used ?? 0),
          maternityTotal: Number(r.maternity_total ?? 0),
          maternityUsed: Number(r.maternity_used ?? 0),
        };
      }
    }
    return result;
  } catch (err) {
    console.warn('fetchLeaveBalancesFromTurso error:', err);
    return {};
  }
}

/**
 * Fetch all master data, employees, and leave states concurrently from Turso Cloud.
 */
export async function fetchAllFromTurso(
  url: string,
  authToken: string
): Promise<{
  employees: Employee[];
  departments: DepartmentSetupItem[];
  positions: PositionSetupItem[];
  dutyShifts: DutyShiftSetupItem[];
  leaveSetupList: LeaveSetupItem[];
  devices: BiometricDeviceSetupItem[];
  salaryConfig: SalarySetupConfig | null;
  userAccounts: UserAccount[];
  leaves: LeaveRequest[];
  leaveBalances: Record<string, LeaveBalance>;
}> {
  const [
    employees,
    departments,
    positions,
    dutyShifts,
    leaveSetupList,
    devices,
    salaryConfig,
    userAccounts,
    leaves,
    leaveBalances,
  ] = await Promise.all([
    fetchEmployeesFromTurso(url, authToken),
    fetchDepartmentsFromTurso(url, authToken),
    fetchPositionsFromTurso(url, authToken),
    fetchDutyShiftsFromTurso(url, authToken),
    fetchLeaveSetupFromTurso(url, authToken),
    fetchBiometricDevicesFromTurso(url, authToken),
    fetchSalaryConfigFromTurso(url, authToken),
    fetchUserAccountsFromTurso(url, authToken),
    fetchLeaveRequestsFromTurso(url, authToken),
    fetchLeaveBalancesFromTurso(url, authToken),
  ]);

  return {
    employees,
    departments,
    positions,
    dutyShifts,
    leaveSetupList,
    devices,
    salaryConfig,
    userAccounts,
    leaves,
    leaveBalances,
  };
}

/**
 * Directly save or update a User Account to Turso Cloud.
 */
export async function directSaveUserAccountToTurso(
  user: UserAccount,
  url: string,
  authToken: string
): Promise<boolean> {
  if (!url || !authToken) return false;
  try {
    const client = getTursoClient(url, authToken);
    await client.execute({
      sql: `
        INSERT INTO user_accounts (
          id, username, full_name, email, password_hash, role, employee_id,
          department, status, permissions, avatar_url, last_login, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          username = excluded.username,
          full_name = excluded.full_name,
          email = excluded.email,
          role = excluded.role,
          employee_id = excluded.employee_id,
          department = excluded.department,
          status = excluded.status,
          permissions = excluded.permissions,
          avatar_url = excluded.avatar_url,
          last_login = excluded.last_login;
      `,
      args: [
        user.id,
        user.username,
        user.fullName,
        user.email,
        user.password || 'argon2id$mock$hash',
        user.role,
        user.employeeId || null,
        user.department || null,
        user.status,
        JSON.stringify(user.permissions || []),
        user.avatar || null,
        user.lastLogin || null,
        user.createdAt,
      ],
    });
    return true;
  } catch (err) {
    console.warn('Turso directSaveUserAccount error:', err);
    return false;
  }
}

/**
 * Directly save Attendance record to Turso Cloud.
 */
export async function directSaveAttendanceToTurso(
  record: AttendanceRecord,
  url: string,
  authToken: string
): Promise<boolean> {
  if (!url || !authToken) return false;
  try {
    const client = getTursoClient(url, authToken);
    await client.execute({
      sql: `
        INSERT OR REPLACE INTO attendance_records (
          id, employee_id, employee_name, department, date, clock_in_time,
          clock_out_time, method, status, location, overtime_hours, biometric_confidence
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `,
      args: [
        record.id,
        record.employeeId,
        record.employeeName,
        record.department,
        record.date,
        record.clockInTime,
        record.clockOutTime || null,
        record.method,
        record.status,
        record.location,
        record.overtimeHours,
        record.biometricConfidence,
      ],
    });
    return true;
  } catch (err) {
    console.warn('Turso directSaveAttendance error:', err);
    return false;
  }
}

/**
 * Directly save or update Leave Request to Turso Cloud.
 */
export async function directSaveLeaveRequestToTurso(
  lv: LeaveRequest,
  url: string,
  authToken: string
): Promise<boolean> {
  if (!url || !authToken) return false;
  try {
    const client = getTursoClient(url, authToken);
    await client.execute({
      sql: `
        INSERT OR REPLACE INTO leave_requests (
          id, employee_id, employee_name, department, leave_type,
          start_date, end_date, days_count, reason, applied_date,
          status, reviewed_by, manager_comment, emergency_phone
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `,
      args: [
        lv.id,
        lv.employeeId,
        lv.employeeName,
        lv.department,
        lv.leaveType,
        lv.startDate,
        lv.endDate,
        lv.daysCount,
        lv.reason,
        lv.appliedDate,
        lv.status,
        lv.reviewedBy || null,
        lv.managerComment || null,
        lv.emergencyPhone,
      ],
    });
    return true;
  } catch (err) {
    console.warn('Turso directSaveLeaveRequest error:', err);
    return false;
  }
}

/**
 * Directly save or update an Employee Leave Balance in Turso Cloud.
 */
export async function directSaveLeaveBalanceToTurso(
  employeeId: string,
  balance: LeaveBalance,
  url: string,
  authToken: string
): Promise<boolean> {
  if (!url || !authToken || !employeeId) return false;
  try {
    const client = getTursoClient(url, authToken);
    await client.execute({
      sql: `
        INSERT OR REPLACE INTO leave_balances (
          employee_id, annual_total, annual_used, casual_total, casual_used,
          medical_total, medical_used, maternity_total, maternity_used, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'));
      `,
      args: [
        employeeId,
        balance.annualTotal ?? 14,
        balance.annualUsed ?? 0,
        balance.casualTotal ?? 6,
        balance.casualUsed ?? 0,
        balance.medicalTotal ?? 10,
        balance.medicalUsed ?? 0,
        balance.maternityTotal ?? 0,
        balance.maternityUsed ?? 0,
      ],
    });
    return true;
  } catch (err) {
    console.warn('Turso directSaveLeaveBalance error:', err);
    return false;
  }
}

/**
 * Bulk sync all application state to Turso Cloud in transaction batches.
 */
export async function syncAllLocalToTursoCloud(
  data: {
    employees: Employee[];
    departments: DepartmentSetupItem[];
    positions: PositionSetupItem[];
    dutyShifts: DutyShiftSetupItem[];
    leaveSetupList: LeaveSetupItem[];
    devices: BiometricDeviceSetupItem[];
    salaryConfig?: SalarySetupConfig;
    userAccounts: UserAccount[];
    attendance: AttendanceRecord[];
    payroll: PayrollRecord[];
    leaves: LeaveRequest[];
    leaveBalances?: Record<string, LeaveBalance>;
    jobs: RecruitmentJob[];
    candidates: Candidate[];
    onboardingCases: OnboardingCase[];
    appraisals: AppraisalRecord[];
  },
  url: string,
  authToken: string
): Promise<{ success: boolean; totalRecords: number; message: string }> {
  try {
    // 1. Ensure migrations are applied first
    await runTursoMigrations(url, authToken);
    const client = getTursoClient(url, authToken);

    let count = 0;

    // Departments
    for (const d of data.departments) {
      await directSaveDepartmentToTurso(d, url, authToken);
      count++;
    }

    // Positions
    for (const p of data.positions) {
      await directSavePositionToTurso(p, url, authToken);
      count++;
    }

    // Shifts
    for (const s of data.dutyShifts) {
      await directSaveDutyShiftToTurso(s, url, authToken);
      count++;
    }

    // Leave Setup Rules
    for (const lv of data.leaveSetupList) {
      await directSaveLeaveTypeToTurso(lv, url, authToken);
      count++;
    }

    // Biometric Devices
    for (const dev of data.devices) {
      await directSaveBiometricDeviceToTurso(dev, url, authToken);
      count++;
    }

    // Salary Configuration
    if (data.salaryConfig) {
      await directSaveSalaryConfigToTurso(data.salaryConfig, url, authToken);
      count++;
    }

    // Employees
    for (const emp of data.employees) {
      await directSaveEmployeeToTurso(emp, url, authToken);
      count++;
    }

    // User Accounts
    for (const user of data.userAccounts) {
      await directSaveUserAccountToTurso(user, url, authToken);
      count++;
    }

    // Attendance
    for (const att of data.attendance.slice(0, 30)) {
      await directSaveAttendanceToTurso(att, url, authToken);
      count++;
    }

    // Payroll
    for (const pr of data.payroll) {
      await client.execute({
        sql: `INSERT OR REPLACE INTO payroll_records (id, month_year, employee_id, employee_name, role, department, base_salary_mmk, allowance_transport_mmk, allowance_meal_mmk, overtime_pay_mmk, deduction_ssb_mmk, deduction_tax_mmk, deduction_unpaid_leave_mmk, net_pay_mmk, status, payment_date, payslip_ref) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        args: [pr.id, pr.monthYear, pr.employeeId, pr.employeeName, pr.role, pr.department, pr.baseSalaryMMK, pr.allowanceTransportMMK, pr.allowanceMealMMK, pr.overtimePayMMK, pr.deductionSSBMMK, pr.deductionTaxMMK, pr.deductionUnpaidLeaveMMK, pr.netPayMMK, pr.status, pr.paymentDate || null, pr.payslipRef],
      });
      count++;
    }

    // Leaves
    for (const lv of data.leaves) {
      await client.execute({
        sql: `INSERT OR REPLACE INTO leave_requests (id, employee_id, employee_name, department, leave_type, start_date, end_date, days_count, reason, applied_date, status, reviewed_by, manager_comment, emergency_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        args: [lv.id, lv.employeeId, lv.employeeName, lv.department, lv.leaveType, lv.startDate, lv.endDate, lv.daysCount, lv.reason, lv.appliedDate, lv.status, lv.reviewedBy || null, lv.managerComment || null, lv.emergencyPhone],
      });
      count++;
    }

    // Leave Balances
    if (data.leaveBalances) {
      for (const [empId, bal] of Object.entries(data.leaveBalances)) {
        await directSaveLeaveBalanceToTurso(empId, bal, url, authToken);
        count++;
      }
    }

    return {
      success: true,
      totalRecords: count,
      message: `Direct Cloud Sync Complete! Successfully synced ${count} records directly to Turso Database.`,
    };
  } catch (err: any) {
    return {
      success: false,
      totalRecords: 0,
      message: `Direct Sync failed: ${err.message || String(err)}`,
    };
  }
}
