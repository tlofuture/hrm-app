import React, { useState } from 'react';
import {
  Home,
  Clock,
  Calendar,
  DollarSign,
  User,
  Fingerprint,
  Eye,
  Bell,
  ChevronRight,
  Shield,
  CheckCircle,
  Sparkles,
  MapPin,
  FileText,
  Lock,
  Settings,
} from 'lucide-react';
import {
  Employee,
  AttendanceRecord,
  PayrollRecord,
  LeaveRequest,
  LeaveBalance,
  AppraisalRecord,
} from '../../types';
import { translations, formatMMK } from '../../utils/translations';

interface MobileAppFrameProps {
  currentEmployee: Employee;
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  payrollRecords: PayrollRecord[];
  leaveRequests: LeaveRequest[];
  leaveBalances: Record<string, LeaveBalance>;
  appraisalRecords: AppraisalRecord[];
  onOpenBiometric: () => void;
  onOpenEmailDrawer: () => void;
  unreadEmailCount: number;
  onApplyLeave: () => void;
  onViewPayslip: (record: PayrollRecord) => void;
  onSwitchToWeb: () => void;
  onNavigateSetup?: () => void;
  language: 'en' | 'my';
}

export const MobileAppFrame: React.FC<MobileAppFrameProps> = ({
  currentEmployee,
  employees,
  attendanceRecords,
  payrollRecords,
  leaveRequests,
  leaveBalances,
  appraisalRecords,
  onOpenBiometric,
  onOpenEmailDrawer,
  unreadEmailCount,
  onApplyLeave,
  onViewPayslip,
  onSwitchToWeb,
  onNavigateSetup,
  language,
}) => {
  const t = translations[language];
  const [mobileTab, setMobileTab] = useState<'home' | 'attendance' | 'leaves' | 'payslip' | 'profile'>('home');

  const myAttendance = attendanceRecords.filter((a) => a.employeeId === currentEmployee.employeeId);
  const myPayroll = payrollRecords.filter((p) => p.employeeId === currentEmployee.employeeId);
  const myLeaves = leaveRequests.filter((l) => l.employeeId === currentEmployee.employeeId);
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

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = myAttendance.find((a) => a.date === todayStr);

  return (
    <div className="flex flex-col items-center justify-center py-4 px-2 sm:px-4 min-h-[calc(100vh-4rem)] bg-slate-100">
      {/* Mobile Device Mockup Container */}
      <div className="relative w-full max-w-[400px] h-[780px] bg-slate-900 rounded-[44px] p-3 shadow-2xl ring-1 ring-slate-800 flex flex-col overflow-hidden">
        {/* Phone Notch & Speaker Pill */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-slate-900 rounded-b-2xl z-50 flex items-center justify-center">
          <div className="w-12 h-1 bg-slate-800 rounded-full" />
        </div>

        {/* Inner Phone Screen */}
        <div className="relative w-full h-full bg-slate-50 rounded-[36px] overflow-hidden flex flex-col text-slate-900 select-none">
          {/* Status Bar */}
          <div className="pt-2 px-6 pb-1 flex items-center justify-between text-[11px] font-semibold text-slate-700 bg-white border-b border-slate-100 shrink-0">
            <span className="font-mono">09:41</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono">5G</span>
              <div className="w-5 h-2.5 border border-slate-400 rounded-xs p-0.5 flex items-center">
                <div className="w-full h-full bg-slate-700 rounded-xs" />
              </div>
            </div>
          </div>

          {/* Mobile Top App Bar */}
          <div className="px-5 py-3 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <img
                src={currentEmployee.avatar}
                alt={currentEmployee.name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(currentEmployee.name);
                }}
                className="w-9 h-9 rounded-full object-cover border border-indigo-200 bg-indigo-50"
              />
              <div>
                <h3 className="text-xs font-bold text-slate-900 leading-tight">
                  {currentEmployee.name}
                </h3>
                <p className="text-[10px] text-slate-500">
                  {currentEmployee.role}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenEmailDrawer}
                className="relative p-1.5 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100"
              >
                <Bell className="w-4 h-4" />
                {unreadEmailCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-600 rounded-full" />
                )}
              </button>
            </div>
          </div>

          {/* Scrollable Mobile Body Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
            {/* TAB: HOME */}
            {mobileTab === 'home' && (
              <div className="space-y-4">
                {/* Biometric Quick Clock-In Card */}
                <div className="p-4 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl shadow-md space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-indigo-300 font-semibold tracking-wide uppercase">
                      Today's Biometric Status
                    </span>
                    <span className="text-[11px] font-mono text-cyan-300">
                      Yangon HQ Geofence
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-bold font-mono">
                        {todayRecord ? todayRecord.clockInTime : 'Not Clocked In'}
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        {todayRecord
                          ? `Verified via ${todayRecord.method.replace('_', ' ')} (${todayRecord.biometricConfidence}%)`
                          : 'Touch scanner below to record shift'}
                      </p>
                    </div>

                    <button
                      onClick={onOpenBiometric}
                      className="p-3 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/30 transition-transform active:scale-95"
                    >
                      <Fingerprint className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Quick 2-Column Summary Cards */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div
                    onClick={() => setMobileTab('leaves')}
                    className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs cursor-pointer"
                  >
                    <div className="text-slate-500 text-[11px]">Leave Remaining</div>
                    <div className="mt-1 text-lg font-bold font-mono text-indigo-700">
                      {myBalance.annualTotal - myBalance.annualUsed}d
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Annual balance</div>
                  </div>

                  <div
                    onClick={() => setMobileTab('payslip')}
                    className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs cursor-pointer"
                  >
                    <div className="text-slate-500 text-[11px]">Latest Payslip</div>
                    <div className="mt-1 text-base font-bold font-mono text-emerald-600 truncate">
                      {formatMMK(myPayroll[0]?.netPayMMK || 0)}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Oct 2026 Ready</div>
                  </div>
                </div>

                {/* Quick Action List */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden text-xs">
                  <div className="px-4 py-2.5 font-semibold text-slate-800 border-b border-slate-100 text-[11px] uppercase tracking-wider">
                    Quick Mobile Actions
                  </div>
                  <div className="divide-y divide-slate-100">
                    <button
                      onClick={onOpenBiometric}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <Fingerprint className="w-4 h-4 text-emerald-600" />
                        <span className="font-medium text-slate-800">
                          {t.quickClockIn}
                        </span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    <button
                      onClick={onApplyLeave}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-slate-800">
                          {t.applyLeave}
                        </span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    <button
                      onClick={() => setMobileTab('payslip')}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-indigo-600" />
                        <span className="font-medium text-slate-800">
                          {t.viewPayslip}
                        </span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    <button
                      onClick={() => {
                        if (onNavigateSetup) {
                          onNavigateSetup();
                        } else {
                          onSwitchToWeb();
                        }
                      }}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <Settings className="w-4 h-4 text-slate-700" />
                        <span className="font-medium text-slate-800">
                          {t.navSetup}
                        </span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>
                </div>

                {/* Company Announcements / Holidays */}
                <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs space-y-1">
                  <span className="font-semibold text-indigo-900 block">
                    Upcoming Public Holiday
                  </span>
                  <p className="text-[11px] text-indigo-700">
                    Thadingyut Full Moon Holiday: Oct 25 – 27, 2026. Official company holiday.
                  </p>
                </div>
              </div>
            )}

            {/* TAB: ATTENDANCE */}
            {mobileTab === 'attendance' && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">Attendance Logs</h3>
                  <button
                    onClick={onOpenBiometric}
                    className="px-3 py-1 bg-indigo-600 text-white rounded-lg font-semibold text-[11px]"
                  >
                    Scan Now
                  </button>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
                  {myAttendance.map((rec) => (
                    <div key={rec.id} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-900 font-mono text-[11px]">
                          {rec.date}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {rec.clockInTime} · {rec.method}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-emerald-600 text-[11px]">
                          {rec.status}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {rec.biometricConfidence}% match
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: LEAVES */}
            {mobileTab === 'leaves' && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">{t.leaveBalance}</h3>
                  <button
                    onClick={onApplyLeave}
                    className="px-3 py-1 bg-indigo-600 text-white rounded-lg font-semibold text-[11px]"
                  >
                    Apply
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <div className="text-[11px] text-slate-400">Annual Leave</div>
                    <div className="text-base font-bold font-mono text-slate-900 mt-1">
                      {myBalance.annualTotal - myBalance.annualUsed} / {myBalance.annualTotal}d
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <div className="text-[11px] text-slate-400">Casual Leave</div>
                    <div className="text-base font-bold font-mono text-slate-900 mt-1">
                      {myBalance.casualTotal - myBalance.casualUsed} / {myBalance.casualTotal}d
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs space-y-2">
                  <div className="font-semibold text-slate-900 text-xs">Recent Leave Requests</div>
                  <div className="space-y-2">
                    {myLeaves.map((l) => (
                      <div key={l.id} className="p-2.5 bg-slate-50 rounded-lg text-[11px] space-y-1">
                        <div className="flex justify-between font-semibold">
                          <span className="capitalize">{l.leaveType} ({l.daysCount}d)</span>
                          <span className="text-amber-600 capitalize">{l.status}</span>
                        </div>
                        <div className="text-slate-500 font-mono">{l.startDate} to {l.endDate}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PAYSLIP */}
            {mobileTab === 'payslip' && (
              <div className="space-y-4 text-xs">
                <h3 className="font-bold text-slate-900 text-sm">Monthly Payslips</h3>
                <div className="space-y-3">
                  {myPayroll.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-slate-900">{p.monthYear}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Ref: {p.payslipRef}
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          Disbursed
                        </span>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-lg space-y-1 text-[11px]">
                        <div className="flex justify-between">
                          <span>Base Salary:</span>
                          <span className="font-mono">{formatMMK(p.baseSalaryMMK)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Allowances:</span>
                          <span className="font-mono text-emerald-600">
                            +{formatMMK(p.allowanceTransportMMK + p.allowanceMealMMK)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>SSB &amp; Tax:</span>
                          <span className="font-mono text-rose-500">
                            -{formatMMK(p.deductionSSBMMK + p.deductionTaxMMK)}
                          </span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-slate-900">
                          <span>Net Pay:</span>
                          <span className="font-mono text-indigo-700">
                            {formatMMK(p.netPayMMK)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onViewPayslip(p)}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-center"
                      >
                        View Official Slip
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: PROFILE */}
            {mobileTab === 'profile' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <div className="font-bold text-slate-900 text-sm">Personal Info</div>
                  <div className="space-y-2 divide-y divide-slate-100 text-[11px]">
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-500">NRC Number:</span>
                      <span className="font-mono font-medium">{currentEmployee.nrcNumber}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-500">Bank Account:</span>
                      <span className="font-mono font-medium">
                        {currentEmployee.bankAccount.bankName}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-500">Account No:</span>
                      <span className="font-mono">{currentEmployee.bankAccount.accountNumber}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-500">Emergency Contact:</span>
                      <span>{currentEmployee.emergencyContact.name}</span>
                    </div>
                  </div>
                </div>

                {onNavigateSetup && (
                  <button
                    onClick={onNavigateSetup}
                    className="w-full py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>System Setup & Turso Database</span>
                  </button>
                )}

                <button
                  onClick={onSwitchToWeb}
                  className="w-full py-2 text-xs font-semibold text-slate-700 bg-slate-200/80 rounded-xl hover:bg-slate-300 transition-colors"
                >
                  Switch to Desktop Web Dashboard
                </button>
              </div>
            )}
          </div>

          {/* Fixed Mobile Bottom Tab Bar (Pattern 1) */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 grid grid-cols-5 items-center px-1 z-40">
            <button
              onClick={() => setMobileTab('home')}
              className={`flex flex-col items-center justify-center py-1 transition-colors ${
                mobileTab === 'home' ? 'text-indigo-600 font-bold' : 'text-slate-400'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Home</span>
            </button>

            <button
              onClick={() => setMobileTab('attendance')}
              className={`flex flex-col items-center justify-center py-1 transition-colors ${
                mobileTab === 'attendance' ? 'text-indigo-600 font-bold' : 'text-slate-400'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Punch</span>
            </button>

            {/* Center Biometric CTA Button */}
            <button
              onClick={onOpenBiometric}
              className="flex flex-col items-center justify-center -mt-5"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 ring-4 ring-white">
                <Fingerprint className="w-6 h-6 animate-pulse" />
              </div>
              <span className="text-[10px] font-bold text-indigo-600 mt-1">Scan</span>
            </button>

            <button
              onClick={() => setMobileTab('leaves')}
              className={`flex flex-col items-center justify-center py-1 transition-colors ${
                mobileTab === 'leaves' ? 'text-indigo-600 font-bold' : 'text-slate-400'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Leaves</span>
            </button>

            <button
              onClick={() => setMobileTab('profile')}
              className={`flex flex-col items-center justify-center py-1 transition-colors ${
                mobileTab === 'profile' ? 'text-indigo-600 font-bold' : 'text-slate-400'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
