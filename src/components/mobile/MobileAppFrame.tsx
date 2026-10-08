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
  X,
  Send,
  Check,
  AlertCircle,
  Plus,
  Clock3,
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
  onApplyLeave?: () => void;
  onSubmitLeave?: (newLeave: Omit<LeaveRequest, 'id' | 'appliedDate' | 'status'>) => void;
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
  onSubmitLeave,
  onViewPayslip,
  onSwitchToWeb,
  onNavigateSetup,
  language,
}) => {
  const t = translations[language];
  const [mobileTab, setMobileTab] = useState<'home' | 'attendance' | 'leaves' | 'payslip' | 'profile'>('home');

  // Mobile Leave Application Modal State
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveRequest['leaveType']>('annual');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState(
    currentEmployee.emergencyContact?.phone || currentEmployee.phone || '+95 9 '
  );
  const [mobileToast, setMobileToast] = useState<string | null>(null);

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

  // Compute Days Count
  const computedDays = (() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;
    const diff = Math.max(0, end.getTime() - start.getTime());
    return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)) + 1);
  })();

  const handleSubmitLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmitLeave) {
      onSubmitLeave({
        employeeId: currentEmployee.employeeId,
        employeeName: currentEmployee.name,
        department: currentEmployee.department,
        leaveType,
        startDate,
        endDate,
        daysCount: computedDays,
        reason: reason.trim() || (language === 'my' ? 'ခွင့်တိုင်ကြားလွှာ' : 'Personal Leave Request'),
        emergencyPhone: emergencyPhone.trim() || currentEmployee.phone,
      });
    } else if (onApplyLeave) {
      onApplyLeave();
    }

    setMobileToast(
      language === 'my'
        ? 'ခွင့်တောင်းဆိုမှု အောင်မြင်စွာ တင်ပြပြီးပါပြီ (HR သို့ အကြောင်းကြားပြီး)'
        : 'Leave request submitted! HR notified.'
    );
    setTimeout(() => setMobileToast(null), 3500);
    setIsLeaveModalOpen(false);
    setMobileTab('leaves');
    setReason('');
  };

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
                      onClick={() => setIsLeaveModalOpen(true)}
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
                  <h3 className="font-bold text-slate-900 text-sm">
                    {language === 'my' ? 'ခွင့်လက်ကျန်နှင့် တောင်းဆိုမှု' : t.leaveBalance}
                  </h3>
                  <button
                    onClick={() => setIsLeaveModalOpen(true)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-lg font-semibold text-[11px] shadow-sm flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{language === 'my' ? 'ခွင့်တောင်းမည်' : 'Apply Leave'}</span>
                  </button>
                </div>

                {/* Hero Mobile Leave CTA Button */}
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(true)}
                  className="w-full p-3.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900 text-white rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-between text-left group active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white">
                        {language === 'my' ? 'ခွင့်တောင်းဆိုလွှာ အသစ်တင်မည်' : 'Submit Leave Request'}
                      </div>
                      <div className="text-[10px] text-indigo-200">
                        {language === 'my' ? 'ဖုန်းမှ တိုက်ရိုက် HR ထံ တင်ပြပါ' : 'Instant phone submission with auto HR notification'}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>

                {/* 4-Grid Leave Balance Summary */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Annual Leave</span>
                      <span className="text-[10px] font-mono text-indigo-600">
                        {myBalance.annualTotal}d total
                      </span>
                    </div>
                    <div className="text-base font-bold font-mono text-indigo-700 mt-1">
                      {Math.max(0, myBalance.annualTotal - myBalance.annualUsed)} days left
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Casual Leave</span>
                      <span className="text-[10px] font-mono text-emerald-600">
                        {myBalance.casualTotal}d total
                      </span>
                    </div>
                    <div className="text-base font-bold font-mono text-emerald-700 mt-1">
                      {Math.max(0, myBalance.casualTotal - myBalance.casualUsed)} days left
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Medical Leave</span>
                      <span className="text-[10px] font-mono text-blue-600">
                        {myBalance.medicalTotal}d total
                      </span>
                    </div>
                    <div className="text-base font-bold font-mono text-blue-700 mt-1">
                      {Math.max(0, myBalance.medicalTotal - myBalance.medicalUsed)} days left
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Maternity/Other</span>
                      <span className="text-[10px] font-mono text-purple-600">
                        {myBalance.maternityTotal}d
                      </span>
                    </div>
                    <div className="text-base font-bold font-mono text-purple-700 mt-1">
                      {Math.max(0, myBalance.maternityTotal - myBalance.maternityUsed)} days left
                    </div>
                  </div>
                </div>

                {/* History of Requests */}
                <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 text-xs">
                      {language === 'my' ? 'မကြာသေးမီက ခွင့်တောင်းဆိုချက်များ' : 'Recent Leave History'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {myLeaves.length} record{myLeaves.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {myLeaves.length === 0 ? (
                      <div className="p-4 text-center text-[11px] text-slate-400 bg-slate-50 rounded-lg">
                        {language === 'my' ? 'ခွင့်တောင်းဆိုထားမှု မရှိသေးပါ' : 'No leave requests submitted yet'}
                      </div>
                    ) : (
                      myLeaves.map((l) => (
                        <div
                          key={l.id}
                          className="p-2.5 bg-slate-50/80 hover:bg-slate-100/70 border border-slate-100 rounded-xl text-[11px] space-y-1.5 transition-colors"
                        >
                          <div className="flex items-center justify-between font-semibold">
                            <span className="capitalize text-slate-900 font-medium">
                              {l.leaveType} Leave · <span className="font-mono text-indigo-600">{l.daysCount}d</span>
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-semibold ${
                                l.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : l.status === 'rejected'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {l.status}
                            </span>
                          </div>
                          <div className="text-slate-500 font-mono text-[10px]">
                            {l.startDate} to {l.endDate}
                          </div>
                          {l.reason && (
                            <div className="text-slate-600 italic text-[10px] truncate">
                              "{l.reason}"
                            </div>
                          )}
                        </div>
                      ))
                    )}
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

          {/* Floating Mobile Notification Toast */}
          {mobileToast && (
            <div className="absolute top-16 left-3 right-3 z-50 bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 text-xs animate-in fade-in slide-in-from-top-4 duration-200">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <div className="flex-1 font-medium leading-tight">
                {mobileToast}
              </div>
              <button
                onClick={() => setMobileToast(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* IN-APP MOBILE LEAVE APPLICATION MODAL (BOTTOM-SHEET) */}
          {isLeaveModalOpen && (
            <div className="absolute inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
              <div className="bg-white rounded-t-3xl max-h-[90%] flex flex-col shadow-2xl border-t border-slate-200 overflow-hidden animate-in slide-in-from-bottom duration-300">
                {/* Modal Top Header */}
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">
                        {language === 'my' ? 'ခွင့်တောင်းဆိုလွှာ တင်ပြမည်' : 'Submit Leave Request'}
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        {currentEmployee.name} ({currentEmployee.employeeId})
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsLeaveModalOpen(false)}
                    className="w-7 h-7 rounded-full bg-slate-200/70 text-slate-500 hover:text-slate-700 flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmitLeave} className="p-4 overflow-y-auto space-y-3.5 text-xs flex-1">
                  {/* Field 1: Leave Type */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 block text-[11px]">
                      {language === 'my' ? 'ခွင့်အမျိုးအစား ရွေးချယ်ပါ' : 'Select Leave Category *'}
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(
                        [
                          {
                            key: 'annual',
                            label: language === 'my' ? 'လုပ်သက်ခွင့်' : 'Annual',
                            left: Math.max(0, myBalance.annualTotal - myBalance.annualUsed),
                          },
                          {
                            key: 'casual',
                            label: language === 'my' ? 'အရေးပေါ်' : 'Casual',
                            left: Math.max(0, myBalance.casualTotal - myBalance.casualUsed),
                          },
                          {
                            key: 'medical',
                            label: language === 'my' ? 'ဆေးခွင့်' : 'Medical',
                            left: Math.max(0, myBalance.medicalTotal - myBalance.medicalUsed),
                          },
                          {
                            key: 'maternity',
                            label: language === 'my' ? 'မီးဖွားခွင့်' : 'Maternity',
                            left: Math.max(0, myBalance.maternityTotal - myBalance.maternityUsed),
                          },
                          {
                            key: 'unpaid',
                            label: language === 'my' ? 'လစာမဲ့ခွင့်' : 'Unpaid',
                            left: null,
                          },
                        ] as const
                      ).map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setLeaveType(item.key as any)}
                          className={`p-2 rounded-xl border text-center transition-all ${
                            leaveType === item.key
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <div className="font-semibold text-[11px] truncate">{item.label}</div>
                          {item.left !== null && (
                            <div
                              className={`text-[9px] mt-0.5 ${
                                leaveType === item.key ? 'text-indigo-200' : 'text-slate-400'
                              }`}
                            >
                              {item.left}d left
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Field 2: Date Range */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700 text-[11px]">
                        {language === 'my' ? 'ခွင့်ကာလ (ရက်စွဲ)' : 'Date Range & Duration'}
                      </span>
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 font-bold rounded-md text-[10px] font-mono">
                        {computedDays} {computedDays === 1 ? 'Day' : 'Days'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-500 block mb-1">
                          {language === 'my' ? 'စတင်မည့်ရက်' : 'Start Date'}
                        </span>
                        <input
                          type="date"
                          required
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block mb-1">
                          {language === 'my' ? 'ပြီးဆုံးမည့်ရက်' : 'End Date'}
                        </span>
                        <input
                          type="date"
                          required
                          value={endDate}
                          min={startDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Field 3: Reason with Quick Chips */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-slate-700 block text-[11px]">
                        {language === 'my' ? 'ခွင့်ယူရသည့် အကြောင်းအရင်း *' : 'Reason for Leave *'}
                      </label>
                      <span className="text-[10px] text-slate-400">Quick Presets</span>
                    </div>

                    {/* Quick reason chips */}
                    <div className="flex flex-wrap gap-1 pb-1">
                      {[
                        { labelEn: 'Family Matter', labelMy: 'မိသားစုကိစ္စ' },
                        { labelEn: 'Medical Checkup', labelMy: 'ဆေးခန်းပြရန်' },
                        { labelEn: 'Annual Vacation', labelMy: 'နှစ်စဉ်အနားယူခွင့်' },
                        { labelEn: 'Urgent Affair', labelMy: 'အရေးပေါ်ကိစ္စ' },
                      ].map((chip) => (
                        <button
                          key={chip.labelEn}
                          type="button"
                          onClick={() =>
                            setReason(language === 'my' ? chip.labelMy : chip.labelEn)
                          }
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-[10px] transition-colors"
                        >
                          + {language === 'my' ? chip.labelMy : chip.labelEn}
                        </button>
                      ))}
                    </div>

                    <textarea
                      required
                      rows={2}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder={
                        language === 'my'
                          ? 'ခွင့်ယူရသည့် အကြောင်းအရာကို ရေးသားပါ...'
                          : 'State your reason for taking time off...'
                      }
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs resize-none focus:bg-white focus:border-indigo-500"
                    />
                  </div>

                  {/* Field 4: Emergency Contact Phone */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block text-[11px]">
                      {language === 'my' ? 'အရေးပေါ် ဆက်သွယ်ရန် ဖုန်းနံပါတ်' : 'Emergency Contact Phone *'}
                    </label>
                    <input
                      type="tel"
                      required
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="+95 9 123 456 789"
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                    />
                  </div>

                  {/* Notice Box */}
                  <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-[10px] text-indigo-800 space-y-0.5">
                    <div className="font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      <span>
                        {language === 'my'
                          ? 'တိုက်ရိုက် အကြောင်းကြားမှု'
                          : 'Instant Workflow & Notification'}
                      </span>
                    </div>
                    <p className="text-indigo-600/90 leading-tight">
                      {language === 'my'
                        ? 'တင်ပြချက်ကို HR မန်နေဂျာ ဒေါ်ခင်သူဇာ ထံသို့ အလိုအလျောက် ပေးပို့မည်ဖြစ်ပြီး Turso Cloud Database သို့ တိုက်ရိုက်သိမ်းဆည်းပါမည်။'
                        : 'Your manager Daw Khin Thuzar will receive immediate notice and it will be persisted to Turso Cloud Database.'}
                    </p>
                  </div>

                  {/* Modal Action Buttons */}
                  <div className="flex items-center gap-2 pt-1 pb-4">
                    <button
                      type="button"
                      onClick={() => setIsLeaveModalOpen(false)}
                      className="w-1/3 py-2.5 text-center font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                      {language === 'my' ? 'မလုပ်တော့ပါ' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>
                        {language === 'my' ? 'ခွင့်တောင်းဆိုလွှာ တင်မည်' : 'Submit Leave Request'}
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
