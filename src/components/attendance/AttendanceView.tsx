import React, { useState, useMemo } from 'react';
import {
  Fingerprint,
  Eye,
  Smartphone,
  Clock,
  MapPin,
  Calendar,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Building,
  Printer,
  ChevronRight,
  HelpCircle,
  FileText,
  User,
  Filter,
  Sparkles,
  Info,
  RotateCcw,
  X,
  ExternalLink,
  ShieldCheck,
  Navigation,
  Check,
  TrendingUp,
  Award,
} from 'lucide-react';
import { AttendanceRecord, Employee, AttendanceMethod } from '../../types';
import { translations } from '../../utils/translations';
import { getEmployeeAvatar, handleAvatarError } from '../../utils/imageUtils';

interface AttendanceViewProps {
  attendanceRecords: AttendanceRecord[];
  employees: Employee[];
  onOpenBiometric: (
    method?: AttendanceMethod,
    action?: 'clock_in' | 'clock_out',
    empId?: string
  ) => void;
  language: 'en' | 'my';
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  attendanceRecords,
  employees,
  onOpenBiometric,
  language,
}) => {
  const t = translations[language];

  // Primary Tab Modes: 'all_employees' | 'individual_employee' | 'how_it_works'
  const [activeTab, setActiveTab] = useState<'all_employees' | 'individual_employee' | 'how_it_works'>('all_employees');

  // Filter States: From Date & To Date
  // Default range: 2026-10-01 to 2026-10-10
  const [fromDate, setFromDate] = useState<string>('2026-10-01');
  const [toDate, setToDate] = useState<string>('2026-10-10');

  // Search & Method / Status Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Individual Employee Tab Selection
  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[1]?.employeeId || 'NX-1002'); // Default Ko Thant Zin

  // Guide accordion toggle
  const [showHowItWorksBanner, setShowHowItWorksBanner] = useState<boolean>(true);

  // Print Modal State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [printReportType, setPrintReportType] = useState<'all' | 'individual'>('all');

  // Helper: Calculate duration between Clock In and Clock Out
  const calculateWorkDuration = (clockIn: string, clockOut?: string) => {
    if (!clockOut) return { text: 'In Progress', hours: 0, minutes: 0 };
    const [inH, inM] = clockIn.split(':').map(Number);
    const [outH, outM] = clockOut.split(':').map(Number);
    const inTotal = inH * 60 + inM;
    const outTotal = outH * 60 + outM;
    const diff = Math.max(0, outTotal - inTotal);
    const hrs = Math.floor(diff / 60);
    const mins = diff % 60;
    return {
      text: `${hrs}h ${mins}m`,
      hours: +(diff / 60).toFixed(2),
      minutes: diff,
    };
  };

  // Helper: Day of week formatter
  const getDayOfWeek = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    } catch {
      return '';
    }
  };

  // Quick Date Range Presets
  const handleSetPreset = (preset: 'today' | 'this_week' | 'this_month' | 'all') => {
    if (preset === 'today') {
      setFromDate('2026-10-10');
      setToDate('2026-10-10');
    } else if (preset === 'this_week') {
      setFromDate('2026-10-05');
      setToDate('2026-10-10');
    } else if (preset === 'this_month') {
      setFromDate('2026-10-01');
      setToDate('2026-10-31');
    } else if (preset === 'all') {
      setFromDate('');
      setToDate('');
    }
  };

  // Filter attendance records by Date Range, Search Query, Method, Status
  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter((rec) => {
      // Date Range Filter
      if (fromDate && rec.date < fromDate) return false;
      if (toDate && rec.date > toDate) return false;

      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = rec.employeeName.toLowerCase().includes(q);
        const matchId = rec.employeeId.toLowerCase().includes(q);
        const matchDept = rec.department.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchDept) return false;
      }

      // Method Filter
      if (methodFilter !== 'all' && rec.method !== methodFilter) return false;

      // Status Filter
      if (statusFilter === 'present' && rec.status !== 'present') return false;
      if (statusFilter === 'late' && rec.status !== 'late') return false;
      if (statusFilter === 'active' && rec.clockOutTime) return false;
      if (statusFilter === 'completed' && !rec.clockOutTime) return false;

      return true;
    });
  }, [attendanceRecords, fromDate, toDate, searchQuery, methodFilter, statusFilter]);

  // Selected Employee Records (for Individual Tab)
  const selectedEmployeeRecords = useMemo(() => {
    return attendanceRecords.filter((rec) => {
      if (rec.employeeId !== selectedEmpId) return false;
      if (fromDate && rec.date < fromDate) return false;
      if (toDate && rec.date > toDate) return false;
      return true;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [attendanceRecords, selectedEmpId, fromDate, toDate]);

  const selectedEmployee = employees.find((e) => e.employeeId === selectedEmpId) || employees[0];

  // Aggregate KPI metrics for All Employees
  const totalPunches = filteredRecords.length;
  const presentCount = filteredRecords.filter((r) => r.status === 'present').length;
  const lateCount = filteredRecords.filter((r) => r.status === 'late').length;
  const activeCount = filteredRecords.filter((r) => !r.clockOutTime).length;
  const completedCount = filteredRecords.filter((r) => !!r.clockOutTime).length;
  const totalOtHours = filteredRecords.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);
  const onTimePercentage = totalPunches > 0 ? Math.round((presentCount / totalPunches) * 100) : 100;

  // Aggregate KPI metrics for Individual Employee
  const indTotalDays = selectedEmployeeRecords.length;
  const indPresentCount = selectedEmployeeRecords.filter((r) => r.status === 'present').length;
  const indLateCount = selectedEmployeeRecords.filter((r) => r.status === 'late').length;
  const indTotalOt = selectedEmployeeRecords.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);
  const indTotalWorkHours = selectedEmployeeRecords.reduce((sum, r) => {
    const { hours } = calculateWorkDuration(r.clockInTime, r.clockOutTime);
    return sum + hours;
  }, 0);
  const indPunctualityScore = indTotalDays > 0 ? Math.round((indPresentCount / indTotalDays) * 100) : 100;

  // Export CSV
  const handleExportCSV = (exportType: 'all' | 'individual') => {
    const recordsToExport = exportType === 'all' ? filteredRecords : selectedEmployeeRecords;
    const headers = 'RecordID,Date,DayOfWeek,EmployeeID,EmployeeName,Department,CheckInTime,CheckOutTime,WorkDuration,Method,Confidence,Status,OvertimeHours,Location\n';
    const rows = recordsToExport
      .map((r) => {
        const day = getDayOfWeek(r.date);
        const { text: dur } = calculateWorkDuration(r.clockInTime, r.clockOutTime);
        return `"${r.id}","${r.date}","${day}","${r.employeeId}","${r.employeeName}","${r.department}","${r.clockInTime}","${
          r.clockOutTime || 'Active'
        }","${dur}","${r.method}","${r.biometricConfidence}%","${r.status}","${r.overtimeHours || 0}","${r.location}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName =
      exportType === 'all'
        ? `NexHR_Attendance_Report_All_Employees_${fromDate || 'All'}_to_${toDate || 'All'}.csv`
        : `NexHR_Timesheet_${selectedEmployee.name.replace(/\s+/g, '_')}_${fromDate || 'All'}_to_${toDate || 'All'}.csv`;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Trigger browser print
  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Print-specific style block */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-attendance-area, #printable-attendance-area * {
            visibility: visible !important;
          }
          #printable-attendance-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 10mm !important;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
        }
      `}</style>

      {/* Top Header & Global Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {language === 'my'
                ? 'ရုံးတက်/ရုံးဆင်း စစ်ဆေးမှုနှင့် အစီရင်ခံစာစနစ်'
                : 'Employee Check-In & Check-Out Management'}
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Live Terminal 3-Way
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'my'
              ? 'မိုဘိုင်းလ်ဖုန်း (GPS Geofence)၊ လက်ဗွေစကင်ဖတ်စက် (Fingerprint) နှင့် မျက်လုံး/မျက်ဝန်းစကင် (Retina/Iris) မှတ်တမ်းများကို ရက်စွဲအလိုက် စစ်ဆေးထုတ်ယူခြင်း။'
              : 'Multi-biometric verification logs across Mobile GPS Geofencing, Fingerprint Turnstile Terminals, and Contactless Retina / Iris Eye Scanners.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Guide Toggle */}
          <button
            onClick={() => setShowHowItWorksBanner(!showHowItWorksBanner)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            <span>{language === 'my' ? 'အသုံးပြုပုံ လမ်းညွှန်' : 'How Check-In/Out Works'}</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={() => handleExportCSV(activeTab === 'individual_employee' ? 'individual' : 'all')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>{language === 'my' ? 'CSV ထုတ်ယူမည်' : 'Export CSV'}</span>
          </button>

          {/* Print A4 Report */}
          <button
            onClick={() => {
              setPrintReportType(activeTab === 'individual_employee' ? 'individual' : 'all');
              setIsPrintModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>{language === 'my' ? 'A4 အစီရင်ခံစာ ပရင့်ထုတ်မည်' : 'Print A4 Report'}</span>
          </button>

          {/* Live Scanner Station Trigger */}
          <button
            onClick={() => onOpenBiometric('fingerprint', 'clock_in')}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all hover:shadow-indigo-600/30"
          >
            <Sparkles className="w-4 h-4" />
            <span>{language === 'my' ? 'တိုက်ရိုက် စကင်ဖတ်မည်' : 'Launch Scanner Terminal'}</span>
          </button>
        </div>
      </div>

      {/* 3-Method Educational Banner: How Employee Check In and Check Out */}
      {showHowItWorksBanner && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Enterprise Multi-Modal Attendance Architecture</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-2">
                {language === 'my'
                  ? 'မိုဘိုင်းလ်ဖုန်း၊ လက်ဗွေစက်နှင့် မျက်လုံးစကင်ဖတ်စက်တို့ဖြင့် ရုံးတက်/ရုံးဆင်း ပြုလုပ်ပုံ အဆင့်ဆင့်'
                  : 'How Employees Check In and Check Out by Mobile Phone, Fingerprint Machine, & Eye Scanner'}
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl">
                {language === 'my'
                  ? 'NexHR သည် စနစ် ၃ မျိုးစလုံးဖြင့် တစ်ပြိုင်နက် ချိတ်ဆက်ထားပြီး Anti-spoofing စနစ်၊ Geofencing နှင့် အလိုအလျောက် အချိန်ပို (OT) တွက်ချက်မှုများဖြင့် စက္ကန့်ပိုင်းအတွင်း တိုက်ရိုက်မှတ်တမ်းတင်ပေးပါသည်။'
                  : 'NexHR automatically integrates three cryptographic authentication channels with anti-buddy punching, GPS geofencing, and sub-second verification.'}
              </p>
            </div>
            <button
              onClick={() => setShowHowItWorksBanner(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/80 transition-colors"
              title="Dismiss Guide"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
            {/* 1. Mobile Phone */}
            <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 hover:border-indigo-400/60 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800">
                    Method 1: Mobile App
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-white mt-3">
                  1. Mobile Phone (GPS Geofence)
                </h3>
                <ul className="text-xs text-slate-300 mt-2 space-y-2">
                  <li className="flex items-start gap-1.5">
                    <span className="text-indigo-400 font-bold">①</span>
                    <span><strong>Open Mobile App:</strong> Employee opens NexHR ESS on iOS or Android smartphone.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-indigo-400 font-bold">②</span>
                    <span><strong>GPS Geofence Check:</strong> System verifies device location within 50m of Yangon HQ.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-indigo-400 font-bold">③</span>
                    <span><strong>One-Tap Punch:</strong> Tap "Clock In" / "Clock Out" with face ID / biometric tap.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-indigo-400 font-bold">④</span>
                    <span><strong>Live Sync:</strong> Encrypted GPS coordinates & device ID logged instantly to HR database.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-700">
                <button
                  onClick={() => onOpenBiometric('mobile', 'clock_in')}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Try Mobile Check-In/Out</span>
                </button>
              </div>
            </div>

            {/* 2. Fingerprint Machine */}
            <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 hover:border-emerald-400/60 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                    <Fingerprint className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                    Method 2: Office Terminal
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-white mt-3">
                  2. Fingerprint Machine (Turnstile)
                </h3>
                <ul className="text-xs text-slate-300 mt-2 space-y-2">
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">①</span>
                    <span><strong>Approach Station:</strong> Employee arrives at Ground Gate turnstile or office wall reader.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">②</span>
                    <span><strong>Place Registered Finger:</strong> Lightly press enrolled index finger or thumb on optical prism.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">③</span>
                    <span><strong>Minutiae Match:</strong> 60+ ridge patterns hashed & verified against database in &lt;0.5s.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">④</span>
                    <span><strong>Gate Release:</strong> Green LED chimes, turnstile unlocks, exact check-in/out timestamp logged.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-700">
                <button
                  onClick={() => onOpenBiometric('fingerprint', 'clock_in')}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <Fingerprint className="w-3.5 h-3.5" />
                  <span>Try Fingerprint Check-In/Out</span>
                </button>
              </div>
            </div>

            {/* 3. Eye Scanner */}
            <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 hover:border-cyan-400/60 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg">
                    <Eye className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                    Method 3: Optical Sensor
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-white mt-3">
                  3. Eye Scanner (Retina / Iris)
                </h3>
                <ul className="text-xs text-slate-300 mt-2 space-y-2">
                  <li className="flex items-start gap-1.5">
                    <span className="text-cyan-400 font-bold">①</span>
                    <span><strong>Stand in Target Zone:</strong> Position face 20–40 cm in front of high-res ocular lens unit.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-cyan-400 font-bold">②</span>
                    <span><strong>Near-Infrared Scan:</strong> Safe optical sensor captures 240+ unique iris striae & crypts.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-cyan-400 font-bold">③</span>
                    <span><strong>Contactless Assurance:</strong> Zero touch (100% hygienic) with 99.8% precision score.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-cyan-400 font-bold">④</span>
                    <span><strong>Instant Punch:</strong> Terminal sounds confirmation tone; shift punch recorded with zero error.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-700">
                <button
                  onClick={() => onOpenBiometric('eye_scan', 'clock_in')}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Try Eye Scanner Check-In/Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main View Mode Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('all_employees')}
          className={`flex items-center gap-2 py-3 px-5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'all_employees'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>{language === 'my' ? 'ဝန်ထမ်းအားလုံး အစီရင်ခံစာ (All Employees)' : 'All Employees Check-In & Check-Out Report'}</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-800 font-mono">
            {filteredRecords.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('individual_employee')}
          className={`flex items-center gap-2 py-3 px-5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'individual_employee'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <User className="w-4 h-4" />
          <span>{language === 'my' ? 'ဝန်ထမ်းတစ်ဦးချင်းစီ အစီရင်ခံစာ (Each Employee)' : 'Each Employee Timesheet Report'}</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 font-mono">
            {selectedEmployeeRecords.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('how_it_works')}
          className={`flex items-center gap-2 py-3 px-5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'how_it_works'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Info className="w-4 h-4" />
          <span>{language === 'my' ? 'စက်ပစ္စည်းနှင့် နည်းပညာ ရှင်းလင်းချက်' : 'Device Specifications & Terminal Station'}</span>
        </button>
      </div>

      {/* Date Filter & Toolbar Card */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* FROM DATE & TO DATE Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>{language === 'my' ? 'ရက်စွဲအပိုင်းအခြား စစ်ထုတ်ရန်:' : 'Date Filter Range:'}</span>
            </div>

            {/* From Date Picker */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500">From:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="text-xs bg-transparent border-0 focus:outline-none font-mono text-slate-900 cursor-pointer"
              />
            </div>

            {/* To Date Picker */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500">To:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="text-xs bg-transparent border-0 focus:outline-none font-mono text-slate-900 cursor-pointer"
              />
            </div>

            {/* Quick Presets Buttons */}
            <div className="flex items-center gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => handleSetPreset('today')}
                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handleSetPreset('this_week')}
                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
              >
                This Week
              </button>
              <button
                type="button"
                onClick={() => handleSetPreset('this_month')}
                className="px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium transition-colors"
              >
                Oct 2026
              </button>
              <button
                type="button"
                onClick={() => handleSetPreset('all')}
                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
              >
                All Dates
              </button>
            </div>
          </div>

          {/* Search Query */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={language === 'my' ? 'ဝန်ထမ်းအမည်၊ ID၊ ဌာန ရှာဖွေရန်...' : 'Search employee, ID, department...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
          </div>
        </div>

        {/* Method & Status Secondary Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 font-medium">{language === 'my' ? 'စနစ်နည်းလမ်း:' : 'Method:'}</span>
            {[
              { id: 'all', label: 'All Methods' },
              { id: 'mobile', label: '📱 Mobile Phone' },
              { id: 'fingerprint', label: '👆 Fingerprint' },
              { id: 'eye_scan', label: '👁️ Eye Scanner' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMethodFilter(m.id)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  methodFilter === m.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 font-medium">{language === 'my' ? 'အခြေအနေ:' : 'Status:'}</span>
            {[
              { id: 'all', label: 'All Status' },
              { id: 'present', label: 'On-Time' },
              { id: 'late', label: 'Late' },
              { id: 'active', label: 'In Progress (Active)' },
              { id: 'completed', label: 'Completed Shifts' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setStatusFilter(s.id)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  statusFilter === s.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: ALL EMPLOYEES CHECK-IN & CHECK-OUT REPORT */}
      {/* ======================================================== */}
      {activeTab === 'all_employees' && (
        <div className="space-y-5">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="p-3.5 bg-white rounded-xl border border-slate-200">
              <div className="text-[11px] text-slate-500 font-medium">Total Punches</div>
              <div className="mt-1 text-xl font-bold font-mono text-slate-900 tabular-nums">
                {totalPunches}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">In selected range</div>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-slate-200">
              <div className="text-[11px] text-slate-500 font-medium">Completed Shifts</div>
              <div className="mt-1 text-xl font-bold font-mono text-emerald-600 tabular-nums">
                {completedCount}
              </div>
              <div className="text-[10px] text-emerald-700 font-medium mt-0.5">In & Out Logged</div>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-slate-200">
              <div className="text-[11px] text-slate-500 font-medium">Active (On Duty)</div>
              <div className="mt-1 text-xl font-bold font-mono text-cyan-600 tabular-nums">
                {activeCount}
              </div>
              <div className="text-[10px] text-cyan-700 font-medium mt-0.5">Awaiting Clock-Out</div>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-slate-200">
              <div className="text-[11px] text-slate-500 font-medium">On-Time Rate</div>
              <div className="mt-1 text-xl font-bold font-mono text-indigo-600 tabular-nums">
                {onTimePercentage}%
              </div>
              <div className="text-[10px] text-indigo-700 font-medium mt-0.5">{presentCount} on-time arrivals</div>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-slate-200">
              <div className="text-[11px] text-slate-500 font-medium">Late Marks</div>
              <div className="mt-1 text-xl font-bold font-mono text-amber-600 tabular-nums">
                {lateCount}
              </div>
              <div className="text-[10px] text-amber-700 font-medium mt-0.5">&gt;09:15 arrival</div>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-slate-200">
              <div className="text-[11px] text-slate-500 font-medium">Overtime Hours</div>
              <div className="mt-1 text-xl font-bold font-mono text-violet-600 tabular-nums">
                {totalOtHours.toFixed(1)} hrs
              </div>
              <div className="text-[10px] text-violet-700 font-medium mt-0.5">Accumulated OT</div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {language === 'my'
                    ? 'ရုံးတက်/ရုံးဆင်း စာရင်းချုပ် မှတ်တမ်း'
                    : 'All Employees Check-In & Check-Out Register'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Showing {filteredRecords.length} records from{' '}
                  <span className="font-mono font-semibold text-slate-700">{fromDate || 'Beginning'}</span> to{' '}
                  <span className="font-mono font-semibold text-slate-700">{toDate || 'Latest'}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setPrintReportType('all');
                    setIsPrintModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Print A4 Landscape</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-semibold">
                    <th className="py-3 px-3 w-10 text-center">#</th>
                    <th className="py-3 px-3">Date & Day</th>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-3">Department</th>
                    <th className="py-3 px-3 text-emerald-800">Check In Time</th>
                    <th className="py-3 px-3 text-cyan-800">Check Out Time</th>
                    <th className="py-3 px-3">Work Duration</th>
                    <th className="py-3 px-3">Method Used</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-2 text-right">OT (Hrs)</th>
                    <th className="py-3 px-4">Terminal / Geofence Location</th>
                    <th className="py-3 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-12 text-center text-slate-400 text-xs">
                        <div className="max-w-sm mx-auto space-y-2">
                          <Calendar className="w-8 h-8 mx-auto text-slate-300" />
                          <p className="font-medium text-slate-600">No attendance records match the current filters.</p>
                          <p className="text-[11px] text-slate-400">
                            Try expanding the From/To Date range or clearing search criteria.
                          </p>
                          <button
                            onClick={() => handleSetPreset('all')}
                            className="mt-2 px-3 py-1 text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md font-semibold"
                          >
                            Reset Date Range
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((r, idx) => {
                      const emp = employees.find((e) => e.employeeId === r.employeeId);
                      const { text: durationText } = calculateWorkDuration(r.clockInTime, r.clockOutTime);
                      const dayOfWeek = getDayOfWeek(r.date);

                      return (
                        <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-mono font-medium text-slate-800 tabular-nums">
                              {r.date}
                            </div>
                            <div className="text-[10px] text-slate-400 font-semibold uppercase">
                              {dayOfWeek}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={getEmployeeAvatar(emp || { employeeId: r.employeeId, name: r.employeeName })}
                                alt={r.employeeName}
                                referrerPolicy="no-referrer"
                                onError={(e) => handleAvatarError(e, emp || { employeeId: r.employeeId, name: r.employeeName })}
                                className="w-7 h-7 rounded-full object-cover border border-slate-200"
                              />
                              <div>
                                <div className="font-semibold text-slate-900 leading-tight">
                                  {r.employeeName}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {r.employeeId}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-slate-600 text-[11px] font-medium">
                            {r.department}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-mono font-bold text-emerald-700 bg-emerald-50/70 px-2 py-0.5 rounded border border-emerald-200/60 tabular-nums">
                              {r.clockInTime}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            {r.clockOutTime ? (
                              <span className="font-mono font-bold text-cyan-800 bg-cyan-50/70 px-2 py-0.5 rounded border border-cyan-200/60 tabular-nums">
                                {r.clockOutTime}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px] animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span>Active</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-700 font-medium">
                            {durationText}
                          </td>
                          <td className="py-3 px-3">
                            {r.method === 'mobile' ? (
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium text-[11px]">
                                <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Mobile GPS</span>
                              </div>
                            ) : r.method === 'fingerprint' ? (
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium text-[11px]">
                                <Fingerprint className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Fingerprint</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700 border border-cyan-200 font-medium text-[11px]">
                                <Eye className="w-3.5 h-3.5 text-cyan-600" />
                                <span>Eye Scanner</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            {r.status === 'present' ? (
                              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>On-Time</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md text-[11px]">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Late</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-right font-mono text-slate-700 tabular-nums">
                            {r.overtimeHours > 0 ? (
                              <span className="text-violet-700 font-bold">+{r.overtimeHours}h</span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-[11px] max-w-xs truncate" title={r.location}>
                            {r.location}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {!r.clockOutTime ? (
                              <button
                                onClick={() => onOpenBiometric(r.method, 'clock_out', r.employeeId)}
                                className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold shadow-2xs transition-colors"
                              >
                                Clock Out
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400">Done</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: EACH EMPLOYEE CHECK-IN & CHECK-OUT REPORT */}
      {/* ======================================================== */}
      {activeTab === 'individual_employee' && (
        <div className="space-y-5">
          {/* Employee Selector Bar */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700 shrink-0">
                {language === 'my' ? 'စစ်ဆေးမည့် ဝန်ထမ်းရွေးချယ်ရန်:' : 'Select Employee for Timesheet:'}
              </label>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {employees.map((emp) => (
                  <option key={emp.employeeId} value={emp.employeeId}>
                    {emp.name} ({emp.employeeId}) — {emp.role} [{emp.department}]
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setPrintReportType('individual');
                  setIsPrintModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Employee Timesheet (A4)</span>
              </button>
              <button
                onClick={() => handleExportCSV('individual')}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Employee Dossier Header Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-5 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <img
                  src={getEmployeeAvatar(selectedEmployee)}
                  alt={selectedEmployee.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => handleAvatarError(e, selectedEmployee)}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-100 shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">
                      {selectedEmployee.name}
                    </h2>
                    {selectedEmployee.nameMyanmar && (
                      <span className="text-xs text-slate-500 font-medium">
                        ({selectedEmployee.nameMyanmar})
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-indigo-600 font-semibold mt-0.5">
                    {selectedEmployee.role} &bull; {selectedEmployee.department}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-2 font-mono">
                    <span>ID: <strong className="text-slate-800">{selectedEmployee.employeeId}</strong></span>
                    <span>NRC: <strong className="text-slate-800">{selectedEmployee.nrcNumber}</strong></span>
                    <span>Joined: <strong className="text-slate-800">{selectedEmployee.joinDate}</strong></span>
                    <span>Shift: <strong className="text-slate-800">09:00 - 18:00 (Standard)</strong></span>
                  </div>
                </div>
              </div>

              {/* Quick Biometric Enrolled Badges */}
              <div className="flex flex-wrap md:flex-col items-end gap-2 text-xs">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                  <Fingerprint className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Fingerprint: Enrolled</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-50 text-cyan-700 border border-cyan-200 font-medium">
                  <Eye className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Retina/Iris: Enrolled</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
                  <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Mobile App: Linked</span>
                </div>
              </div>
            </div>

            {/* Individual Employee Metrics within Selected Date Range */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-5">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-500 font-medium uppercase">Logged Days</div>
                <div className="mt-1 text-lg font-bold font-mono text-slate-900">{indTotalDays} Days</div>
                <div className="text-[10px] text-slate-400 mt-0.5">In date range</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-500 font-medium uppercase">Total Work Hours</div>
                <div className="mt-1 text-lg font-bold font-mono text-indigo-600">{indTotalWorkHours.toFixed(1)} hrs</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Accumulated shift</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-500 font-medium uppercase">Punctuality Score</div>
                <div className="mt-1 text-lg font-bold font-mono text-emerald-600">{indPunctualityScore}%</div>
                <div className="text-[10px] text-emerald-700 font-medium mt-0.5">{indPresentCount} On-time</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-500 font-medium uppercase">Late Marks</div>
                <div className="mt-1 text-lg font-bold font-mono text-amber-600">{indLateCount}</div>
                <div className="text-[10px] text-amber-700 font-medium mt-0.5">&gt;09:15 Arrival</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-500 font-medium uppercase">Overtime (OT)</div>
                <div className="mt-1 text-lg font-bold font-mono text-violet-600">{indTotalOt.toFixed(1)} hrs</div>
                <div className="text-[10px] text-violet-700 font-medium mt-0.5">Approved OT</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-500 font-medium uppercase">Avg Check-In</div>
                <div className="mt-1 text-lg font-bold font-mono text-slate-800">
                  {selectedEmployeeRecords[0]?.clockInTime ? selectedEmployeeRecords[0].clockInTime.slice(0, 5) : '08:50'}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Target: 09:00</div>
              </div>
            </div>
          </div>

          {/* Individual Timesheet Log Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {selectedEmployee.name} — Individual Daily Punch Timesheet
                </h3>
                <p className="text-[11px] text-slate-500">
                  Showing punches between {fromDate || 'Start'} and {toDate || 'Latest'}
                </p>
              </div>

              <button
                onClick={() => {
                  setPrintReportType('individual');
                  setIsPrintModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Print Individual Statement (A4)</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-semibold">
                    <th className="py-3 px-3 w-10 text-center">#</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Day</th>
                    <th className="py-3 px-4 text-emerald-800">Check In Time</th>
                    <th className="py-3 px-4 text-cyan-800">Check Out Time</th>
                    <th className="py-3 px-4">Working Hours</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Method</th>
                    <th className="py-3 px-4">Terminal / Location</th>
                    <th className="py-3 px-3 text-right">OT Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedEmployeeRecords.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400 text-xs">
                        No attendance records found for {selectedEmployee.name} in this date range.
                      </td>
                    </tr>
                  ) : (
                    selectedEmployeeRecords.map((r, idx) => {
                      const { text: durationText } = calculateWorkDuration(r.clockInTime, r.clockOutTime);
                      const dayOfWeek = getDayOfWeek(r.date);

                      return (
                        <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-3 font-mono font-medium text-slate-900 tabular-nums">
                            {r.date}
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-500 uppercase text-[11px]">
                            {dayOfWeek}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 tabular-nums">
                              {r.clockInTime}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {r.clockOutTime ? (
                              <span className="font-mono font-bold text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded border border-cyan-200 tabular-nums">
                                {r.clockOutTime}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px] animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span>Active</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                            {durationText}
                          </td>
                          <td className="py-3 px-3">
                            {r.status === 'present' ? (
                              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>On-Time</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md text-[11px]">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Late</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                              {r.method === 'mobile' ? (
                                <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                              ) : r.method === 'fingerprint' ? (
                                <Fingerprint className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Eye className="w-3.5 h-3.5 text-cyan-600" />
                              )}
                              <span className="capitalize">{r.method.replace('_', ' ')}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-[11px]">
                            {r.location}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-semibold text-slate-700">
                            {r.overtimeHours > 0 ? (
                              <span className="text-violet-700">+{r.overtimeHours}h</span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: DEVICE SPECIFICATIONS & TERMINAL STATION */}
      {/* ======================================================== */}
      {activeTab === 'how_it_works' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900">
              Technical Specifications & Biometric Infrastructure
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Architecture details of all three supported employee Check-In and Check-Out channels.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {/* Card 1 */}
              <div className="p-5 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-600 text-white rounded-xl">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Mobile Phone Channel</h3>
                    <p className="text-[11px] text-slate-500">iOS & Android ESS App</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-slate-700 pt-2 border-t border-indigo-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Security Type:</span>
                    <span className="font-semibold">GPS Geofence + Device ID</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Geofence Radius:</span>
                    <span className="font-semibold">50 meters around HQ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Anti-Spoofing:</span>
                    <span className="font-semibold">Mock-Location Detector</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Verification Speed:</span>
                    <span className="font-semibold">&lt; 0.3 seconds</span>
                  </div>
                </div>
                <button
                  onClick={() => onOpenBiometric('mobile', 'clock_in')}
                  className="w-full mt-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Test Mobile Punch
                </button>
              </div>

              {/* Card 2 */}
              <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
                    <Fingerprint className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Fingerprint Terminal</h3>
                    <p className="text-[11px] text-slate-500">Ground Floor Turnstiles</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-slate-700 pt-2 border-t border-emerald-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sensor Type:</span>
                    <span className="font-semibold">500 DPI Capacitive Prism</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">False Accept Rate:</span>
                    <span className="font-semibold">&lt; 0.0001%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Anti-Buddy Punch:</span>
                    <span className="font-semibold">Live Subdermal Detection</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Verification Speed:</span>
                    <span className="font-semibold">&lt; 0.5 seconds</span>
                  </div>
                </div>
                <button
                  onClick={() => onOpenBiometric('fingerprint', 'clock_in')}
                  className="w-full mt-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Test Fingerprint Scan
                </button>
              </div>

              {/* Card 3 */}
              <div className="p-5 rounded-xl border border-cyan-200 bg-cyan-50/40 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-cyan-600 text-white rounded-xl">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Eye Scanner (Iris)</h3>
                    <p className="text-[11px] text-slate-500">Level 4 Tech Lab Unit</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-slate-700 pt-2 border-t border-cyan-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Optical Sensor:</span>
                    <span className="font-semibold">Dual NIR Infrared Ocular</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Contactless Distance:</span>
                    <span className="font-semibold">20 to 40 cm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Biometric Points:</span>
                    <span className="font-semibold">240+ Degrees of Freedom</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Verification Speed:</span>
                    <span className="font-semibold">&lt; 0.8 seconds</span>
                  </div>
                </div>
                <button
                  onClick={() => onOpenBiometric('eye_scan', 'clock_in')}
                  className="w-full mt-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Test Eye Scanner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PRINT PREVIEW & PRINTABLE MODAL */}
      {/* ======================================================== */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-300 flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Top Bar */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <Printer className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-bold">
                    Official A4 Attendance & Punctuality Report Printout
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Form ready for physical A4 landscape printing or PDF saving
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Switcher in modal */}
                <div className="flex bg-slate-800 rounded-lg p-0.5 text-xs">
                  <button
                    onClick={() => setPrintReportType('all')}
                    className={`px-3 py-1 rounded font-semibold transition-colors ${
                      printReportType === 'all'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    All Employees
                  </button>
                  <button
                    onClick={() => setPrintReportType('individual')}
                    className={`px-3 py-1 rounded font-semibold transition-colors ${
                      printReportType === 'individual'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {selectedEmployee.name}
                  </button>
                </div>

                <button
                  onClick={handleTriggerPrint}
                  className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print to Paper (A4)</span>
                </button>

                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body: A4 Printable Document Container */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-100 flex justify-center">
              <div
                id="printable-attendance-area"
                className="w-full max-w-[1020px] bg-white p-8 rounded-xl shadow-lg border border-slate-200 text-slate-900"
              >
                {/* REPORT HEADER */}
                <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
                  <div>
                    <div className="text-xl font-black tracking-tight text-slate-900">
                      NEXHR ENTERPRISE SYSTEMS
                    </div>
                    <div className="text-xs font-semibold text-slate-600">
                      HUMAN RESOURCES & ATTENDANCE RECORDING DIVISION
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Yangon Head Office: No. 124, Pyay Road, Kamayut Township, Yangon, Myanmar
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded">
                      {printReportType === 'all'
                        ? 'ALL EMPLOYEES ATTENDANCE REGISTER'
                        : 'INDIVIDUAL ATTENDANCE & TIMESHEET STATEMENT'}
                    </span>
                    <div className="text-[11px] text-slate-500 mt-1 font-mono">
                      Generated: {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString()}
                    </div>
                    <div className="text-[11px] font-semibold text-indigo-700">
                      Filter Range: {fromDate || 'Start'} to {toDate || 'Latest'}
                    </div>
                  </div>
                </div>

                {/* IF INDIVIDUAL: EMPLOYEE DOSSIER HEADER */}
                {printReportType === 'individual' && (
                  <div className="my-4 p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        {selectedEmployee.name} ({selectedEmployee.nameMyanmar})
                      </div>
                      <div className="text-xs text-slate-600">
                        {selectedEmployee.role} &bull; {selectedEmployee.department}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-1">
                        Employee ID: {selectedEmployee.employeeId} | NRC: {selectedEmployee.nrcNumber} | Joined: {selectedEmployee.joinDate}
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <div className="font-semibold text-slate-700">Days Logged: {indTotalDays} Days</div>
                      <div className="font-semibold text-emerald-700">Punctuality Score: {indPunctualityScore}%</div>
                      <div className="font-semibold text-violet-700">Total Work Hours: {indTotalWorkHours.toFixed(1)} hrs</div>
                    </div>
                  </div>
                )}

                {/* REPORT TABLE */}
                <div className="mt-4">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 border-y border-slate-300 font-bold text-slate-800">
                        <th className="py-2 px-2 text-center w-8">#</th>
                        <th className="py-2 px-2">Date</th>
                        <th className="py-2 px-2">Day</th>
                        {printReportType === 'all' && (
                          <>
                            <th className="py-2 px-3">Employee Name</th>
                            <th className="py-2 px-2">ID</th>
                            <th className="py-2 px-2">Dept</th>
                          </>
                        )}
                        <th className="py-2 px-2 text-emerald-800">Clock In</th>
                        <th className="py-2 px-2 text-cyan-800">Clock Out</th>
                        <th className="py-2 px-2">Duration</th>
                        <th className="py-2 px-2">Method</th>
                        <th className="py-2 px-2">Status</th>
                        <th className="py-2 px-2 text-right">OT</th>
                        <th className="py-2 px-3">Terminal / Location</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {(printReportType === 'all' ? filteredRecords : selectedEmployeeRecords).map((r, i) => {
                        const { text: dur } = calculateWorkDuration(r.clockInTime, r.clockOutTime);
                        return (
                          <tr key={r.id} className="text-slate-800">
                            <td className="py-2 px-2 text-center text-slate-500 font-mono">{i + 1}</td>
                            <td className="py-2 px-2 font-mono">{r.date}</td>
                            <td className="py-2 px-2 font-semibold uppercase">{getDayOfWeek(r.date)}</td>
                            {printReportType === 'all' && (
                              <>
                                <td className="py-2 px-3 font-semibold">{r.employeeName}</td>
                                <td className="py-2 px-2 font-mono text-slate-500">{r.employeeId}</td>
                                <td className="py-2 px-2 text-slate-600">{r.department}</td>
                              </>
                            )}
                            <td className="py-2 px-2 font-mono font-bold text-emerald-700">{r.clockInTime}</td>
                            <td className="py-2 px-2 font-mono font-bold text-cyan-800">{r.clockOutTime || 'Active'}</td>
                            <td className="py-2 px-2 font-mono">{dur}</td>
                            <td className="py-2 px-2 capitalize">{r.method.replace('_', ' ')}</td>
                            <td className="py-2 px-2 font-semibold">
                              {r.status === 'present' ? 'On-Time' : 'Late'}
                            </td>
                            <td className="py-2 px-2 text-right font-mono">
                              {r.overtimeHours > 0 ? `+${r.overtimeHours}h` : '—'}
                            </td>
                            <td className="py-2 px-3 text-slate-500 text-[10px] truncate max-w-xs">{r.location}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* REPORT FOOTER & SIGN-OFFS */}
                <div className="mt-8 pt-6 border-t-2 border-slate-300">
                  <div className="grid grid-cols-3 gap-8 text-center text-xs">
                    <div>
                      <div className="h-14 border-b border-dashed border-slate-400" />
                      <div className="mt-2 font-semibold text-slate-800">
                        {printReportType === 'individual' ? selectedEmployee.name : 'Prepared By: HR Specialist'}
                      </div>
                      <div className="text-[10px] text-slate-500">Employee Signature & Date</div>
                    </div>

                    <div>
                      <div className="h-14 border-b border-dashed border-slate-400" />
                      <div className="mt-2 font-semibold text-slate-800">Department Supervisor</div>
                      <div className="text-[10px] text-slate-500">Verification & Punch Audit</div>
                    </div>

                    <div>
                      <div className="h-14 border-b border-dashed border-slate-400" />
                      <div className="mt-2 font-semibold text-slate-800">Daw Khin Thuzar</div>
                      <div className="text-[10px] text-slate-500">Head of People & Culture (Approved)</div>
                    </div>
                  </div>

                  <div className="mt-6 text-center text-[10px] text-slate-400 font-mono">
                    This document is an authentic certified extract from the NexHR Cryptographic Attendance Register. Page 1 of 1 &bull; ISO-27001 Certified.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
