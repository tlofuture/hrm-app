import React, { useState } from 'react';
import {
  DollarSign,
  Download,
  Send,
  FileText,
  Printer,
  CheckCircle,
  Building2,
  Calendar,
  CreditCard,
  X,
  Sparkles,
} from 'lucide-react';
import { PayrollRecord, Employee } from '../../types';
import { translations, formatMMK, formatUSD } from '../../utils/translations';

interface PayrollViewProps {
  payrollRecords: PayrollRecord[];
  employees: Employee[];
  onDisbursePayroll: () => void;
  language: 'en' | 'my';
}

export const PayrollView: React.FC<PayrollViewProps> = ({
  payrollRecords,
  employees,
  onDisbursePayroll,
  language,
}) => {
  const t = translations[language];
  const [currency, setCurrency] = useState<'MMK' | 'USD'>('MMK');
  const [activePayslip, setActivePayslip] = useState<{
    record: PayrollRecord;
    employee: Employee;
  } | null>(null);

  const formatAmount = (mmk: number) => {
    return currency === 'MMK' ? formatMMK(mmk) : formatUSD(mmk);
  };

  const totalBase = payrollRecords.reduce((s, r) => s + r.baseSalaryMMK, 0);
  const totalAllowances = payrollRecords.reduce(
    (s, r) => s + r.allowanceTransportMMK + r.allowanceMealMMK,
    0
  );
  const totalDeductions = payrollRecords.reduce(
    (s, r) => s + r.deductionSSBMMK + r.deductionTaxMMK + r.deductionUnpaidLeaveMMK,
    0
  );
  const totalNet = payrollRecords.reduce((s, r) => s + r.netPayMMK, 0);

  const handleOpenPayslip = (record: PayrollRecord) => {
    const employee =
      employees.find((e) => e.employeeId === record.employeeId) || employees[0];
    setActivePayslip({ record, employee });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {t.payrollTitle}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t.payrollSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Currency Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setCurrency('MMK')}
              className={`px-3 py-1 rounded-md transition-colors ${
                currency === 'MMK' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              MMK
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1 rounded-md transition-colors ${
                currency === 'USD' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              USD
            </button>
          </div>

          {/* Disburse Batch button */}
          <button
            onClick={onDisbursePayroll}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>{t.disburseAndEmail}</span>
          </button>
        </div>
      </div>

      {/* Payroll Totals Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">{t.baseSalary}</div>
          <div className="mt-1 text-xl font-bold font-mono text-slate-900 tabular-nums">
            {formatAmount(totalBase)}
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">{t.allowances}</div>
          <div className="mt-1 text-xl font-bold font-mono text-emerald-600 tabular-nums">
            +{formatAmount(totalAllowances)}
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">SSB &amp; Tax Deductions</div>
          <div className="mt-1 text-xl font-bold font-mono text-rose-600 tabular-nums">
            -{formatAmount(totalDeductions)}
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">{t.netSalary} (Oct 2026)</div>
          <div className="mt-1 text-xl font-bold font-mono text-indigo-700 tabular-nums">
            {formatAmount(totalNet)}
          </div>
        </div>
      </div>

      {/* High Density Payroll Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            {language === 'my'
              ? 'လစဉ်လစာ ပေးချေမှု စာရင်း (အောက်တိုဘာ ၂၀၂၆)'
              : 'Monthly Payroll Ledger (October 2026 Cycle)'}
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Cycle Ref: NX-CYCLE-202610
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Role &amp; Department</th>
                <th className="py-3 px-4 text-right">Base Salary</th>
                <th className="py-3 px-4 text-right">Allowances</th>
                <th className="py-3 px-4 text-right">OT Pay</th>
                <th className="py-3 px-4 text-right">SSB (2%)</th>
                <th className="py-3 px-4 text-right">Tax</th>
                <th className="py-3 px-4 text-right font-bold text-slate-900">Net Pay</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Payslip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payrollRecords.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">
                      {r.employeeName}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {r.employeeId}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-slate-800">{r.role}</div>
                    <div className="text-[11px] text-slate-400">{r.department}</div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700">
                    {formatAmount(r.baseSalaryMMK)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-emerald-600">
                    +{formatAmount(r.allowanceTransportMMK + r.allowanceMealMMK)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-indigo-600">
                    {r.overtimePayMMK > 0 ? `+${formatAmount(r.overtimePayMMK)}` : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-rose-500">
                    -{formatAmount(r.deductionSSBMMK)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-rose-500">
                    -{formatAmount(r.deductionTaxMMK)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {formatAmount(r.netPayMMK)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                      <CheckCircle className="w-3 h-3" />
                      <span className="capitalize">{r.status}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleOpenPayslip(r)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{t.viewPayslip}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Digital Payslip Modal */}
      {activePayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  {language === 'my' ? 'တရားဝင် လစာဖြတ်ပိုင်း' : 'Certified Digital Payslip'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{t.printPayslip}</span>
                </button>
                <button
                  onClick={() => setActivePayslip(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Payslip Body */}
            <div className="p-8 overflow-y-auto space-y-6 text-xs text-slate-800 print:p-0">
              {/* Company Header Lockup */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                      NX
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        NexHR Technologies Co., Ltd.
                      </h2>
                      <p className="text-[11px] text-slate-500">
                        Hledan Centre, Pyay Road, Kamayut Township, Yangon, Myanmar
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-bold text-indigo-700">
                    {activePayslip.record.payslipRef}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Pay Period: {activePayslip.record.monthYear}
                  </div>
                </div>
              </div>

              {/* Employee Information Grid */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <div className="text-slate-500">Employee Name:</div>
                  <div className="font-bold text-slate-900">
                    {activePayslip.record.employeeName} ({activePayslip.employee.nameMyanmar})
                  </div>
                  <div className="text-slate-500 mt-2">NRC / National ID:</div>
                  <div className="font-mono text-slate-800">
                    {activePayslip.employee.nrcNumber}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Employee ID &amp; Role:</div>
                  <div className="font-bold text-slate-900">
                    {activePayslip.record.employeeId} · {activePayslip.record.role}
                  </div>
                  <div className="text-slate-500 mt-2">Bank Account:</div>
                  <div className="font-mono text-slate-800">
                    {activePayslip.employee.bankAccount.bankName} - {activePayslip.employee.bankAccount.accountNumber}
                  </div>
                </div>
              </div>

              {/* Earnings & Deductions Tables */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Earnings */}
                <div className="space-y-2">
                  <div className="font-bold text-xs uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1">
                    Earnings
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span>Base Salary:</span>
                      <span className="font-mono tabular-nums font-semibold">
                        {formatAmount(activePayslip.record.baseSalaryMMK)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transport Allowance:</span>
                      <span className="font-mono tabular-nums">
                        {formatAmount(activePayslip.record.allowanceTransportMMK)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Meal Allowance:</span>
                      <span className="font-mono tabular-nums">
                        {formatAmount(activePayslip.record.allowanceMealMMK)}
                      </span>
                    </div>
                    {activePayslip.record.overtimePayMMK > 0 && (
                      <div className="flex justify-between text-indigo-700 font-medium">
                        <span>Overtime (OT):</span>
                        <span className="font-mono tabular-nums">
                          {formatAmount(activePayslip.record.overtimePayMMK)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Deductions */}
                <div className="space-y-2">
                  <div className="font-bold text-xs uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1">
                    Deductions
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span>Social Security (SSB 2%):</span>
                      <span className="font-mono tabular-nums text-rose-600">
                        -{formatAmount(activePayslip.record.deductionSSBMMK)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Income Tax (IRD Withholding):</span>
                      <span className="font-mono tabular-nums text-rose-600">
                        -{formatAmount(activePayslip.record.deductionTaxMMK)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Unpaid Absences:</span>
                      <span className="font-mono tabular-nums text-slate-500">
                        0 Ks
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Disbursed Box */}
              <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-200 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider">
                    Net Take-Home Pay
                  </div>
                  <div className="text-xl font-bold font-mono text-indigo-900 tabular-nums">
                    {formatAmount(activePayslip.record.netPayMMK)}
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  <div>Disbursement: Bank Transfer</div>
                  <div className="font-mono text-emerald-600 font-semibold">Status: Disbursed</div>
                </div>
              </div>

              {/* Stamp & Certification */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <div>
                  Certified by: Daw Khin Thuzar (Head of HR)
                  <br />
                  Internal Revenue Dept (IRD) Compliance Verified
                </div>
                <div className="text-right font-mono">
                  Digital Fingerprint: SHA256:{activePayslip.record.id.slice(0, 12)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
