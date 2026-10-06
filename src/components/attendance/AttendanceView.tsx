import React, { useState } from 'react';
import {
  Fingerprint,
  Eye,
  Clock,
  MapPin,
  Calendar,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Building,
} from 'lucide-react';
import { AttendanceRecord, Employee } from '../../types';
import { translations } from '../../utils/translations';

interface AttendanceViewProps {
  attendanceRecords: AttendanceRecord[];
  employees: Employee[];
  onOpenBiometric: () => void;
  language: 'en' | 'my';
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  attendanceRecords,
  employees,
  onOpenBiometric,
  language,
}) => {
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  const filteredRecords = attendanceRecords.filter((rec) => {
    const matchSearch =
      rec.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchMethod = methodFilter === 'all' || rec.method === methodFilter;
    return matchSearch && matchMethod;
  });

  const presentCount = attendanceRecords.filter((r) => r.status === 'present').length;
  const lateCount = attendanceRecords.filter((r) => r.status === 'late').length;
  const totalOtHours = attendanceRecords.reduce((sum, r) => sum + r.overtimeHours, 0);

  const handleExportCSV = () => {
    const headers = 'RecordID,EmployeeID,Name,Department,Date,ClockIn,ClockOut,Method,Confidence,Status,Location\n';
    const rows = filteredRecords
      .map(
        (r) =>
          `"${r.id}","${r.employeeId}","${r.employeeName}","${r.department}","${r.date}","${r.clockInTime}","${
            r.clockOutTime || 'Active'
          }","${r.method}","${r.biometricConfidence}%","${r.status}","${r.location}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NexHR_Attendance_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {t.attendanceTitle}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t.attendanceSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>{t.exportAttendance}</span>
          </button>

          <button
            onClick={onOpenBiometric}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            <Fingerprint className="w-4 h-4" />
            <span>{t.scanBiometric}</span>
          </button>
        </div>
      </div>

      {/* Terminal Hardware Banner Card */}
      <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Biometric Hardware Station: Live & Online</span>
          </div>
          <h2 className="text-lg font-bold">
            {language === 'my'
              ? 'လုပ်ငန်းခွင် ဇီဝမက်ထရစ် တိုက်ရိုက် ရုံးတက်စက်'
              : 'Enterprise Dual Biometric Authentication Terminal'}
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            {language === 'my'
              ? 'Capacitive Fingerprint Sensor နှင့် High-resolution Ocular Retina Scan တို့ဖြင့် တိကျသော ရုံးတက်ချိန်၊ တည်နေရာနှင့် အချိန်ပိုမှတ်တမ်းများကို စက္ကန့်ပိုင်းအတွင်း မှတ်တမ်းတင်ပေးပါသည်။'
              : 'Enforces zero-spoof attendance logging with cryptographic biometric template hashing, anti-buddy punching, and GPS geofence locking.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenBiometric}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
          >
            <Fingerprint className="w-4 h-4" />
            <span>{language === 'my' ? 'လက်ဗွေ စကင်ဖတ်မည်' : 'Scan Fingerprint'}</span>
          </button>
          <button
            onClick={onOpenBiometric}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md shadow-cyan-600/30 transition-all hover:scale-105 active:scale-95"
          >
            <Eye className="w-4 h-4" />
            <span>{language === 'my' ? 'မျက်လုံး စကင်ဖတ်မည်' : 'Scan Retina / Iris'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Total Clock-Ins Today</div>
          <div className="mt-1 text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {attendanceRecords.length}
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">On-Time Attendance</div>
          <div className="mt-1 text-2xl font-bold font-mono text-emerald-600 tabular-nums">
            {presentCount}
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Late Marks (&gt;09:15)</div>
          <div className="mt-1 text-2xl font-bold font-mono text-amber-600 tabular-nums">
            {lateCount}
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Accumulated OT Hours</div>
          <div className="mt-1 text-2xl font-bold font-mono text-indigo-600 tabular-nums">
            {totalOtHours} hrs
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={language === 'my' ? 'ဝန်ထမ်းအမည်၊ ဌာန ရှာရန်...' : 'Search employee, ID, dept...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Method:</span>
          {['all', 'fingerprint', 'eye_scan'].map((m) => (
            <button
              key={m}
              onClick={() => setMethodFilter(m)}
              className={`px-3 py-1 rounded-md font-medium capitalize transition-colors ${
                methodFilter === m
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {m.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* High Density Attendance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Clock In</th>
                <th className="py-3 px-4">Clock Out</th>
                <th className="py-3 px-4">Biometric Method</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Terminal / Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">
                        {r.employeeName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {r.employeeId}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{r.department}</td>
                    <td className="py-3.5 px-4 font-mono tabular-nums text-slate-700">
                      {r.date}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 tabular-nums">
                      {r.clockInTime}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 tabular-nums">
                      {r.clockOutTime || '— (Active)'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                        {r.method === 'fingerprint' ? (
                          <Fingerprint className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Eye className="w-3.5 h-3.5 text-cyan-600" />
                        )}
                        <span className="capitalize">{r.method.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-600 font-medium tabular-nums">
                      {r.biometricConfidence}%
                    </td>
                    <td className="py-3.5 px-4">
                      {r.status === 'present' ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Present</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Late</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px] max-w-xs truncate">
                      {r.location}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
