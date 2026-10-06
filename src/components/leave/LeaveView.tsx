import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  User,
  Phone,
  FileText,
} from 'lucide-react';
import { LeaveRequest, LeaveBalance, Employee, LeaveType } from '../../types';
import { translations } from '../../utils/translations';

interface LeaveViewProps {
  leaves: LeaveRequest[];
  leaveBalances: Record<string, LeaveBalance>;
  employees: Employee[];
  currentEmployeeId: string;
  onApplyLeave: (newLeave: Omit<LeaveRequest, 'id' | 'appliedDate' | 'status'>) => void;
  onReviewLeave: (leaveId: string, status: 'approved' | 'rejected', comment: string) => void;
  language: 'en' | 'my';
}

export const LeaveView: React.FC<LeaveViewProps> = ({
  leaves,
  leaveBalances,
  employees,
  currentEmployeeId,
  onApplyLeave,
  onReviewLeave,
  language,
}) => {
  const t = translations[language];
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [reviewModalLeave, setReviewModalLeave] = useState<LeaveRequest | null>(null);
  const [managerComment, setManagerComment] = useState('');

  // Apply Form State
  const [leaveType, setLeaveType] = useState<LeaveType>('annual');
  const [startDate, setStartDate] = useState('2026-10-14');
  const [endDate, setEndDate] = useState('2026-10-15');
  const [reason, setReason] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('+95 9 791 234 567');

  const currentEmp = employees.find((e) => e.employeeId === currentEmployeeId) || employees[0];
  const currentBalance = leaveBalances[currentEmp.employeeId] || {
    annualTotal: 14,
    annualUsed: 3,
    casualTotal: 6,
    casualUsed: 1,
    medicalTotal: 10,
    medicalUsed: 0,
    maternityTotal: 84,
    maternityUsed: 0,
  };

  const calculateDays = () => {
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diffTime = Math.abs(e.getTime() - s.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return isNaN(diffDays) ? 1 : diffDays;
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    onApplyLeave({
      employeeId: currentEmp.employeeId,
      employeeName: currentEmp.name,
      department: currentEmp.department,
      leaveType,
      startDate,
      endDate,
      daysCount: calculateDays(),
      reason,
      emergencyPhone,
    });

    setIsApplyModalOpen(false);
    setReason('');
  };

  const handleApprove = () => {
    if (!reviewModalLeave) return;
    onReviewLeave(reviewModalLeave.id, 'approved', managerComment || 'Approved by HR');
    setReviewModalLeave(null);
    setManagerComment('');
  };

  const handleReject = () => {
    if (!reviewModalLeave) return;
    onReviewLeave(reviewModalLeave.id, 'rejected', managerComment || 'Declined due to scheduling constraints');
    setReviewModalLeave(null);
    setManagerComment('');
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {t.leaveTitle}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t.leaveSubtitle}
          </p>
        </div>

        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{t.applyLeave}</span>
        </button>
      </div>

      {/* Leave Balances Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Annual Leave */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">{t.annualLeave}</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {currentBalance.annualTotal - currentBalance.annualUsed}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              / {currentBalance.annualTotal} days
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {currentBalance.annualUsed} days taken this year
          </div>
        </div>

        {/* Casual Leave */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">{t.casualLeave}</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {currentBalance.casualTotal - currentBalance.casualUsed}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              / {currentBalance.casualTotal} days
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {currentBalance.casualUsed} days taken
          </div>
        </div>

        {/* Medical Leave */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">{t.medicalLeave}</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {currentBalance.medicalTotal - currentBalance.medicalUsed}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              / {currentBalance.medicalTotal} days
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Full pay with medical slip
          </div>
        </div>

        {/* Maternity/Paternity */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">{t.maternityLeave}</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {currentBalance.maternityTotal - currentBalance.maternityUsed}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              / {currentBalance.maternityTotal} days
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Per Myanmar Labor Standard
          </div>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            {language === 'my'
              ? 'ခွင့်လျှောက်ထားမှု မှတ်တမ်းနှင့် ခွင့်ပြုချက်များ'
              : 'Leave Applications & Approvals Ledger'}
          </h3>
          <span className="text-xs text-slate-500">
            {leaves.filter((l) => l.status === 'pending').length} Pending Review
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Leave Type</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4 text-center">Days</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaves.map((leave) => (
                <tr key={leave.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">
                      {leave.employeeName}
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
                  <td className="py-3.5 px-4 font-mono text-slate-700 tabular-nums">
                    {leave.startDate} → {leave.endDate}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-900 tabular-nums">
                    {leave.daysCount} d
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                    {leave.reason}
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
                  <td className="py-3.5 px-4 text-right">
                    {leave.status === 'pending' ? (
                      <button
                        onClick={() => setReviewModalLeave(leave)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                      >
                        Review
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">
                        {leave.reviewedBy || 'Processed'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Apply Leave */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">{t.applyLeave}</h3>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Leave Category
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="annual">{t.annualLeave} (14 days max)</option>
                  <option value="casual">{t.casualLeave} (6 days max)</option>
                  <option value="medical">{t.medicalLeave} (10 days max)</option>
                  <option value="maternity">{t.maternityLeave} (84 days max)</option>
                  <option value="unpaid">{t.unpaidLeave}</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Reason for Absence *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide brief reason for HR and manager approval..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Emergency Contact Phone Number
                </label>
                <input
                  type="text"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Review / Approve Leave */}
      {reviewModalLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
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
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Applicant:</span>
                  <span className="font-bold text-slate-800">
                    {reviewModalLeave.employeeName} ({reviewModalLeave.department})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Type &amp; Duration:</span>
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
                <div className="pt-1 text-slate-700 italic">
                  "{reviewModalLeave.reason}"
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Manager / HR Decision Comments
                </label>
                <textarea
                  rows={2}
                  value={managerComment}
                  onChange={(e) => setManagerComment(e.target.value)}
                  placeholder="e.g. Approved. Have a good break!"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
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
                  className="px-4 py-2 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                >
                  {t.approveLeave}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
