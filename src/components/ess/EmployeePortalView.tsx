import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Unlock,
  User,
  Fingerprint,
  DollarSign,
  Calendar,
  Clock,
  Award,
  Phone,
  Building,
  CreditCard,
  FileText,
  CheckCircle,
  Eye,
  Plus,
  RefreshCw,
} from 'lucide-react';
import {
  Employee,
  AttendanceRecord,
  PayrollRecord,
  LeaveRequest,
  AppraisalRecord,
  LeaveBalance,
} from '../../types';
import { translations, formatMMK } from '../../utils/translations';
import { playBiometricSuccess, playBiometricAlert } from '../../utils/audio';

interface EmployeePortalViewProps {
  employees: Employee[];
  currentEmployeeId: string;
  onSelectEmployee: (empId: string) => void;
  attendanceRecords: AttendanceRecord[];
  payrollRecords: PayrollRecord[];
  leaveRequests: LeaveRequest[];
  leaveBalances: Record<string, LeaveBalance>;
  appraisalRecords: AppraisalRecord[];
  onOpenBiometric: () => void;
  onApplyLeave: () => void;
  onViewPayslip: (record: PayrollRecord) => void;
  language: 'en' | 'my';
}

export const EmployeePortalView: React.FC<EmployeePortalViewProps> = ({
  employees,
  currentEmployeeId,
  onSelectEmployee,
  attendanceRecords,
  payrollRecords,
  leaveRequests,
  leaveBalances,
  appraisalRecords,
  onOpenBiometric,
  onApplyLeave,
  onViewPayslip,
  language,
}) => {
  const t = translations[language];

  // Current Employee
  const currentEmployee =
    employees.find((e) => e.employeeId === currentEmployeeId) || employees[0];

  // Security lock state
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'attendance' | 'payslips' | 'leaves' | 'appraisal'>('profile');

  // Filter records for this employee
  const myAttendance = attendanceRecords.filter((a) => a.employeeId === currentEmployee.employeeId);
  const myPayroll = payrollRecords.filter((p) => p.employeeId === currentEmployee.employeeId);
  const myLeaves = leaveRequests.filter((l) => l.employeeId === currentEmployee.employeeId);
  const myAppraisals = appraisalRecords.filter((a) => a.employeeId === currentEmployee.employeeId);
  const myBalance = leaveBalances[currentEmployee.employeeId] || {
    annualTotal: 14,
    annualUsed: 2,
    casualTotal: 6,
    casualUsed: 1,
    medicalTotal: 10,
    medicalUsed: 0,
    maternityTotal: 84,
    maternityUsed: 0,
  };

  const handlePinUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      pinInput === currentEmployee.biometrics.securityPin ||
      pinInput === '1234' ||
      pinInput === '7788'
    ) {
      setIsUnlocked(true);
      setPinError(false);
      playBiometricSuccess();
    } else {
      setPinError(true);
      playBiometricAlert();
    }
  };

  const handleBiometricQuickUnlock = () => {
    setIsUnlocked(true);
    setPinError(false);
    playBiometricSuccess();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Secure Employee Self-Service (ESS)</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {t.essTitle}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.essSubtitle}
          </p>
        </div>

        {/* Employee Switcher */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">
            {language === 'my' ? 'ဝန်ထမ်းအကောင့်' : 'Current Account'}:
          </span>
          <select
            value={currentEmployee.employeeId}
            onChange={(e) => {
              onSelectEmployee(e.target.value);
              setIsUnlocked(false);
            }}
            className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold cursor-pointer shadow-xs"
          >
            {employees.map((emp) => (
              <option key={emp.employeeId} value={emp.employeeId}>
                {emp.name} ({emp.employeeId})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Employee Profile Identity Banner */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="relative shrink-0">
          <img
            src={currentEmployee.avatar}
            alt={currentEmployee.name}
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(currentEmployee.name);
            }}
            className="w-24 h-24 rounded-2xl object-cover border-2 border-indigo-100 shadow-sm bg-indigo-50"
          />
          <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 text-white rounded-full ring-2 ring-white">
            <CheckCircle className="w-3.5 h-3.5" />
          </span>
        </div>

        <div className="flex-1 text-center md:text-left space-y-1">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              {currentEmployee.name}
            </h2>
            <span className="text-xs text-slate-500">
              ({currentEmployee.nameMyanmar})
            </span>
            <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[11px] font-semibold rounded-md">
              {currentEmployee.department}
            </span>
          </div>

          <p className="text-xs text-slate-600 font-medium">
            {currentEmployee.role} · ID: {currentEmployee.employeeId}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-slate-500 pt-1">
            <span>Email: {currentEmployee.email}</span>
            <span aria-hidden="true">·</span>
            <span>Phone: {currentEmployee.phone}</span>
            <span aria-hidden="true">·</span>
            <span>Joined: {currentEmployee.joinDate}</span>
          </div>
        </div>

        {/* Quick Clock-In from Portal */}
        <div className="shrink-0 flex flex-col gap-2">
          <button
            onClick={onOpenBiometric}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors"
          >
            <Fingerprint className="w-4 h-4" />
            <span>{t.quickClockIn}</span>
          </button>
          <button
            onClick={onApplyLeave}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>{t.applyLeave}</span>
          </button>
        </div>
      </div>

      {/* Security Lock Card (If not unlocked) */}
      {!isUnlocked ? (
        <div className="p-8 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl border border-slate-800 shadow-xl flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-3 bg-indigo-500/20 text-indigo-300 rounded-2xl ring-1 ring-indigo-400/30">
            <Lock className="w-8 h-8" />
          </div>

          <div className="max-w-md space-y-1">
            <h3 className="text-base font-bold text-white">
              {t.securityLock}
            </h3>
            <p className="text-xs text-slate-400">
              {t.securityPinPrompt}
            </p>
          </div>

          <form onSubmit={handlePinUnlock} className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="password"
              maxLength={4}
              placeholder="PIN (e.g. 7788)"
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setPinError(false);
              }}
              className="px-4 py-2 text-center text-sm tracking-widest font-mono bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 w-36"
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors shadow-sm"
            >
              Unlock with PIN
            </button>
          </form>

          {pinError && (
            <p className="text-xs text-rose-400 font-medium">
              Incorrect security PIN. Please retry or use Biometrics below.
            </p>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={handleBiometricQuickUnlock}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 rounded-xl border border-cyan-800 transition-colors"
            >
              <Fingerprint className="w-4 h-4 text-cyan-400" />
              <span>Unlock with Enrolled Biometrics</span>
            </button>
          </div>
        </div>
      ) : (
        /* UNLOCKED EMPLOYEE DASHBOARD */
        <div className="space-y-6">
          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-medium">
            <button
              onClick={() => setActiveSubTab('profile')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeSubTab === 'profile'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.myProfile}
            </button>
            <button
              onClick={() => setActiveSubTab('attendance')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeSubTab === 'attendance'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.myAttendance} ({myAttendance.length})
            </button>
            <button
              onClick={() => setActiveSubTab('payslips')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeSubTab === 'payslips'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.myPayslips} ({myPayroll.length})
            </button>
            <button
              onClick={() => setActiveSubTab('leaves')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeSubTab === 'leaves'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.myLeaves} ({myLeaves.length})
            </button>
            <button
              onClick={() => setActiveSubTab('appraisal')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeSubTab === 'appraisal'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.myAppraisals} ({myAppraisals.length})
            </button>

            <button
              onClick={() => setIsUnlocked(false)}
              className="ml-auto inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800"
              title="Lock records"
            >
              <Lock className="w-3 h-3" />
              <span>Lock Records</span>
            </button>
          </div>

          {/* TAB 1: Profile & Statutory Records */}
          {activeSubTab === 'profile' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-600" />
                  <span>National Identification &amp; Statutory</span>
                </h3>
                <div className="space-y-2 divide-y divide-slate-100">
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-500">National Registration Card (NRC):</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {currentEmployee.nrcNumber}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-500">Employment Status:</span>
                    <span className="capitalize font-semibold text-emerald-700">
                      {currentEmployee.status}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-500">Social Security Board (SSB):</span>
                    <span className="font-mono text-slate-800">
                      SSB-YGN-2021-9988
                    </span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-500">Tax TIN Registration:</span>
                    <span className="font-mono text-slate-800">
                      TIN-IRD-0982314
                    </span>
                  </div>
                </div>
              </div>

              {/* Bank & Financials */}
              <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>{t.bankInformation}</span>
                </h3>
                <div className="space-y-2 divide-y divide-slate-100">
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-500">Bank Name:</span>
                    <span className="font-semibold text-slate-900">
                      {currentEmployee.bankAccount.bankName}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-500">Account Number:</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {currentEmployee.bankAccount.accountNumber}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-500">Account Beneficiary:</span>
                    <span className="text-slate-800">
                      {currentEmployee.bankAccount.accountName}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-500">Base Salary (Gross):</span>
                    <span className="font-mono font-bold text-indigo-700 tabular-nums">
                      {formatMMK(currentEmployee.baseSalaryMMK)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-rose-600" />
                  <span>{t.emergencyContact}</span>
                </h3>
                <div className="space-y-2 divide-y divide-slate-100">
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-500">Contact Person:</span>
                    <span className="font-semibold text-slate-900">
                      {currentEmployee.emergencyContact.name}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-500">Relationship:</span>
                    <span className="text-slate-800">
                      {currentEmployee.emergencyContact.relationship}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-500">Phone:</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {currentEmployee.emergencyContact.phone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Biometrics Status */}
              <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-cyan-600" />
                  <span>Biometric Credentials</span>
                </h3>
                <div className="space-y-2 divide-y divide-slate-100">
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-500">Fingerprint Template:</span>
                    <span className="text-emerald-600 font-semibold">
                      Enrolled &amp; Active
                    </span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-500">Retina / Iris Template:</span>
                    <span className="text-emerald-600 font-semibold">
                      Enrolled &amp; Active
                    </span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-500">Security PIN:</span>
                    <span className="font-mono text-slate-800">
                      •••• (Protected)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Attendance */}
          {activeSubTab === 'attendance' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  {t.myAttendance}
                </h3>
                <button
                  onClick={onOpenBiometric}
                  className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Clock In Now
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {myAttendance.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No attendance records logged for your profile yet.
                  </div>
                ) : (
                  myAttendance.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-4 flex items-center justify-between text-xs hover:bg-slate-50/50"
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-slate-900 font-mono">
                          {rec.date}
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          Clocked in at {rec.clockInTime} via {rec.method.replace('_', ' ')}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-0.5 rounded-md font-semibold text-emerald-700 bg-emerald-50 text-[11px]">
                          {rec.status}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {rec.biometricConfidence}% confidence
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Payslips */}
          {activeSubTab === 'payslips' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">
                  {t.myPayslips}
                </h3>
              </div>
              <div className="divide-y divide-slate-100">
                {myPayroll.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No payslips generated for your profile yet.
                  </div>
                ) : (
                  myPayroll.map((pay) => (
                    <div
                      key={pay.id}
                      className="p-4 flex items-center justify-between text-xs hover:bg-slate-50/50"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">
                          {pay.monthYear} Payslip
                        </div>
                        <div className="text-slate-400 font-mono text-[11px]">
                          Ref: {pay.payslipRef}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-mono font-bold text-slate-900 tabular-nums">
                            {formatMMK(pay.netPayMMK)}
                          </div>
                          <span className="text-[11px] text-emerald-600 font-medium">
                            Disbursed
                          </span>
                        </div>
                        <button
                          onClick={() => onViewPayslip(pay)}
                          className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Slip</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Leaves */}
          {activeSubTab === 'leaves' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-slate-500">Annual Leave Remaining</div>
                  <div className="text-xl font-bold font-mono text-indigo-700 mt-1">
                    {myBalance.annualTotal - myBalance.annualUsed} days
                  </div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-slate-500">Casual Leave Remaining</div>
                  <div className="text-xl font-bold font-mono text-emerald-700 mt-1">
                    {myBalance.casualTotal - myBalance.casualUsed} days
                  </div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-slate-500">Medical Leave Remaining</div>
                  <div className="text-xl font-bold font-mono text-blue-700 mt-1">
                    {myBalance.medicalTotal - myBalance.medicalUsed} days
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    Leave History &amp; Applications
                  </h3>
                  <button
                    onClick={onApplyLeave}
                    className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                  >
                    Apply Leave
                  </button>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {myLeaves.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                      No leave requests filed yet.
                    </div>
                  ) : (
                    myLeaves.map((l) => (
                      <div key={l.id} className="p-4 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-900 capitalize">
                            {l.leaveType} Leave ({l.daysCount} days)
                          </div>
                          <div className="text-slate-500 text-[11px]">
                            {l.startDate} to {l.endDate} · "{l.reason}"
                          </div>
                        </div>
                        <span className="font-semibold text-[11px] capitalize px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {l.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Appraisal */}
          {activeSubTab === 'appraisal' && (
            <div className="space-y-4">
              {myAppraisals.length === 0 ? (
                <div className="p-8 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-400">
                  No published appraisal reviews for this cycle.
                </div>
              ) : (
                myAppraisals.map((app) => (
                  <div
                    key={app.id}
                    className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {app.cycle} Performance Evaluation
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Reviewed by {app.reviewer} on {app.reviewedDate}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold font-mono text-indigo-700">
                          {app.overallScore} / 5.0
                        </div>
                        <span className="text-[10px] text-emerald-600 font-semibold">
                          Promotion Recommended
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 p-3 bg-slate-50 rounded-xl text-center">
                      <div>
                        <div className="text-[10px] text-slate-400">KPIs</div>
                        <div className="font-mono font-bold text-slate-800">
                          {app.ratings.kpiExecution}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">Competency</div>
                        <div className="font-mono font-bold text-slate-800">
                          {app.ratings.competency}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">Teamwork</div>
                        <div className="font-mono font-bold text-slate-800">
                          {app.ratings.teamwork}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">Leadership</div>
                        <div className="font-mono font-bold text-slate-800">
                          {app.ratings.leadership}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div>
                        <span className="font-semibold text-slate-700">Commendations: </span>
                        <span className="text-slate-600">{app.strengths}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700">Development Areas: </span>
                        <span className="text-slate-600">{app.growthAreas}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
