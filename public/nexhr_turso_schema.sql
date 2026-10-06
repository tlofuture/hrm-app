-- ====================================================================
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
