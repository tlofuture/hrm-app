import React, { useState } from 'react';
import {
  Settings,
  Building,
  Calendar,
  Clock,
  DollarSign,
  Briefcase,
  Fingerprint,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Shield,
  HelpCircle,
  Save,
  X,
  Search,
  Users,
  Database,
} from 'lucide-react';
import {
  DepartmentSetupItem,
  LeaveSetupItem,
  DutyShiftSetupItem,
  SalarySetupConfig,
  PositionSetupItem,
  BiometricDeviceSetupItem,
  UserAccount,
  TursoDatabaseConfig,
  Employee,
  AttendanceRecord,
  PayrollRecord,
  LeaveRequest,
  RecruitmentJob,
  Candidate,
  OnboardingCase,
  AppraisalRecord,
} from '../../types';
import { translations, formatMMK } from '../../utils/translations';
import { UserAccountsSetupTab } from './UserAccountsSetupTab';
import { TursoDatabaseSetupTab } from './TursoDatabaseSetupTab';

interface SetupMenuViewProps {
  departments: DepartmentSetupItem[];
  onUpdateDepartments: (items: DepartmentSetupItem[]) => void;
  leaveSetupList: LeaveSetupItem[];
  onUpdateLeaveSetup: (items: LeaveSetupItem[]) => void;
  dutyShifts: DutyShiftSetupItem[];
  onUpdateDutyShifts: (items: DutyShiftSetupItem[]) => void;
  salaryConfig: SalarySetupConfig;
  onUpdateSalaryConfig: (config: SalarySetupConfig) => void;
  positions: PositionSetupItem[];
  onUpdatePositions: (items: PositionSetupItem[]) => void;
  devices: BiometricDeviceSetupItem[];
  onUpdateDevices: (items: BiometricDeviceSetupItem[]) => void;
  userAccounts: UserAccount[];
  onUpdateUserAccounts: (items: UserAccount[]) => void;
  tursoConfig: TursoDatabaseConfig;
  onUpdateTursoConfig: (config: TursoDatabaseConfig) => void;
  employees: Employee[];
  attendance: AttendanceRecord[];
  payroll: PayrollRecord[];
  leaves: LeaveRequest[];
  jobs: RecruitmentJob[];
  candidates: Candidate[];
  onboardingCases: OnboardingCase[];
  appraisals: AppraisalRecord[];
  language: 'en' | 'my';
}

export const SetupMenuView: React.FC<SetupMenuViewProps> = ({
  departments,
  onUpdateDepartments,
  leaveSetupList,
  onUpdateLeaveSetup,
  dutyShifts,
  onUpdateDutyShifts,
  salaryConfig,
  onUpdateSalaryConfig,
  positions,
  onUpdatePositions,
  devices,
  onUpdateDevices,
  userAccounts,
  onUpdateUserAccounts,
  tursoConfig,
  onUpdateTursoConfig,
  employees,
  attendance,
  payroll,
  leaves,
  jobs,
  candidates,
  onboardingCases,
  appraisals,
  language,
}) => {
  const t = translations[language];
  const [activeSetupTab, setActiveSetupTab] = useState<
    'department' | 'leave' | 'shift' | 'salary' | 'position' | 'device' | 'users' | 'turso'
  >('department');

  // Modals state
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isPosModalOpen, setIsPosModalOpen] = useState(false);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);

  // Department Form
  const [deptCode, setDeptCode] = useState('');
  const [deptName, setDeptName] = useState('');
  const [deptNameMy, setDeptNameMy] = useState('');
  const [deptHead, setDeptHead] = useState('');
  const [deptBudget, setDeptBudget] = useState(50000000);

  // Leave Form
  const [leaveTitle, setLeaveTitle] = useState('');
  const [leaveTitleMy, setLeaveTitleMy] = useState('');
  const [leaveDays, setLeaveDays] = useState(14);
  const [leaveIsPaid, setLeaveIsPaid] = useState(true);
  const [leaveCarry, setLeaveCarry] = useState(0);
  const [leaveMedCert, setLeaveMedCert] = useState(false);
  const [leaveDesc, setLeaveDesc] = useState('');

  // Shift Form
  const [shiftCode, setShiftCode] = useState('');
  const [shiftName, setShiftName] = useState('');
  const [shiftStart, setShiftStart] = useState('08:30');
  const [shiftEnd, setShiftEnd] = useState('17:30');
  const [shiftGrace, setShiftGrace] = useState(15);
  const [shiftNight, setShiftNight] = useState(false);

  // Position Form
  const [posCode, setPosCode] = useState('');
  const [posTitle, setPosTitle] = useState('');
  const [posTitleMy, setPosTitleMy] = useState('');
  const [posDept, setPosDept] = useState('Engineering');
  const [posLevel, setPosLevel] = useState<'Entry' | 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Executive'>('Senior');
  const [posGrade, setPosGrade] = useState('E4');
  const [posExp, setPosExp] = useState(4);

  // Device Form
  const [devName, setDevName] = useState('');
  const [devLocation, setDevLocation] = useState('');
  const [devIp, setDevIp] = useState('192.168.1.110');
  const [devType, setDevType] = useState<'Fingerprint + Retina' | 'Optical Retina' | 'Fingerprint'>('Fingerprint + Retina');

  // Salary Local Edit State
  const [currentSalaryConfig, setCurrentSalaryConfig] = useState<SalarySetupConfig>(salaryConfig);
  const [salarySavedNotification, setSalarySavedNotification] = useState(false);

  // Handlers
  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim()) return;
    const newItem: DepartmentSetupItem = {
      id: `dept-${Date.now()}`,
      code: deptCode || `DEPT-${Date.now().toString().slice(-3)}`,
      name: deptName,
      nameMyanmar: deptNameMy || deptName,
      headOfDepartment: deptHead || 'Pending Appointment',
      headEmail: 'admin@nexhr.com',
      annualBudgetMMK: Number(deptBudget),
      totalEmployees: 0,
      status: 'active',
    };
    onUpdateDepartments([...departments, newItem]);
    setIsDeptModalOpen(false);
    setDeptName('');
    setDeptCode('');
  };

  const handleDeleteDepartment = (id: string) => {
    onUpdateDepartments(departments.filter((d) => d.id !== id));
  };

  const handleAddLeaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveTitle.trim()) return;
    const newItem: LeaveSetupItem = {
      id: `lvs-${Date.now()}`,
      leaveType: leaveTitle.toLowerCase().replace(/\s+/g, '_'),
      title: leaveTitle,
      titleMyanmar: leaveTitleMy || leaveTitle,
      defaultDays: Number(leaveDays),
      isPaid: leaveIsPaid,
      carryForwardMaxDays: Number(leaveCarry),
      requireMedicalCertificate: leaveMedCert,
      minDaysNotice: 1,
      description: leaveDesc || 'Official leave policy category.',
    };
    onUpdateLeaveSetup([...leaveSetupList, newItem]);
    setIsLeaveModalOpen(false);
    setLeaveTitle('');
  };

  const handleDeleteLeaveRule = (id: string) => {
    onUpdateLeaveSetup(leaveSetupList.filter((l) => l.id !== id));
  };

  const handleAddShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftName.trim()) return;
    const newItem: DutyShiftSetupItem = {
      id: `shf-${Date.now()}`,
      shiftCode: shiftCode || `SHIFT-${Date.now().toString().slice(-3)}`,
      name: shiftName,
      nameMyanmar: shiftName,
      startTime: shiftStart,
      endTime: shiftEnd,
      gracePeriodMinutes: Number(shiftGrace),
      breakDurationMinutes: 60,
      otMinimumMinutes: 30,
      isNightShift: shiftNight,
      activeDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      assignedEmployeesCount: 0,
    };
    onUpdateDutyShifts([...dutyShifts, newItem]);
    setIsShiftModalOpen(false);
    setShiftName('');
  };

  const handleDeleteShift = (id: string) => {
    onUpdateDutyShifts(dutyShifts.filter((s) => s.id !== id));
  };

  const handleAddPosition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!posTitle.trim()) return;
    const newItem: PositionSetupItem = {
      id: `pos-${Date.now()}`,
      code: posCode || `POS-${Date.now().toString().slice(-3)}`,
      title: posTitle,
      titleMyanmar: posTitleMy || posTitle,
      department: posDept,
      level: posLevel,
      salaryGrade: posGrade,
      minExperienceYears: Number(posExp),
      responsibilities: ['Role deliverables & collaboration'],
    };
    onUpdatePositions([...positions, newItem]);
    setIsPosModalOpen(false);
    setPosTitle('');
  };

  const handleDeletePosition = (id: string) => {
    onUpdatePositions(positions.filter((p) => p.id !== id));
  };

  const handleAddDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!devName.trim()) return;
    const newItem: BiometricDeviceSetupItem = {
      id: `dev-${Date.now()}`,
      terminalName: devName,
      location: devLocation || 'Yangon HQ Main Building',
      ipAddress: devIp,
      deviceType: devType,
      status: 'online',
      geofenceRadiusMeters: 50,
      lastSyncTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    onUpdateDevices([...devices, newItem]);
    setIsDeviceModalOpen(false);
    setDevName('');
  };

  const handleDeleteDevice = (id: string) => {
    onUpdateDevices(devices.filter((d) => d.id !== id));
  };

  const handleSaveSalaryConfig = () => {
    onUpdateSalaryConfig(currentSalaryConfig);
    setSalarySavedNotification(true);
    setTimeout(() => setSalarySavedNotification(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-1">
            <Settings className="w-3.5 h-3.5" />
            <span>Master Data &amp; Policy Configurations</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {t.setupMenuTitle}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.setupMenuSubtitle}
          </p>
        </div>
      </div>

      {/* Setup Sub-Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveSetupTab('department')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeSetupTab === 'department'
              ? 'bg-slate-900 text-white font-semibold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>{t.deptSetup} ({departments.length})</span>
        </button>

        <button
          onClick={() => setActiveSetupTab('leave')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeSetupTab === 'leave'
              ? 'bg-slate-900 text-white font-semibold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{t.leaveSetup} ({leaveSetupList.length})</span>
        </button>

        <button
          onClick={() => setActiveSetupTab('shift')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeSetupTab === 'shift'
              ? 'bg-slate-900 text-white font-semibold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{t.shiftSetup} ({dutyShifts.length})</span>
        </button>

        <button
          onClick={() => setActiveSetupTab('salary')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeSetupTab === 'salary'
              ? 'bg-slate-900 text-white font-semibold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>{t.salarySetup}</span>
        </button>

        <button
          onClick={() => setActiveSetupTab('position')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeSetupTab === 'position'
              ? 'bg-slate-900 text-white font-semibold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>{t.positionSetup} ({positions.length})</span>
        </button>

        <button
          onClick={() => setActiveSetupTab('device')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeSetupTab === 'device'
              ? 'bg-slate-900 text-white font-semibold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Fingerprint className="w-4 h-4" />
          <span>{t.deviceSetup} ({devices.length})</span>
        </button>

        <button
          onClick={() => setActiveSetupTab('users')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeSetupTab === 'users'
              ? 'bg-slate-900 text-white font-semibold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{t.usersSetup} ({userAccounts.length})</span>
        </button>

        <button
          onClick={() => setActiveSetupTab('turso')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeSetupTab === 'turso'
              ? 'bg-emerald-900 text-white font-semibold shadow-xs'
              : 'text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100'
          }`}
        >
          <Database className="w-4 h-4 text-emerald-500" />
          <span>{t.tursoSetup}</span>
        </button>
      </div>

      {/* 1. DEPARTMENT SETUP VIEW */}
      {activeSetupTab === 'department' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {language === 'my' ? 'ဌာနများ စာရင်းနှင့် ဘတ်ဂျက်' : 'Organization Departments & Operating Budgets'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'my' ? 'ကုမ္ပဏီအတွင်း ဖွဲ့စည်းထားသော ဌာနများ၊ ဌာနမှူးများနှင့် နှစ်စဉ်ဘတ်ဂျက်' : 'Define business units, department heads, and fiscal resource allocations.'}
              </p>
            </div>
            <button
              onClick={() => setIsDeptModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addDepartment}</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-3 px-4">Dept Code</th>
                    <th className="py-3 px-4">Department Name</th>
                    <th className="py-3 px-4">Head of Department</th>
                    <th className="py-3 px-4 text-right">Annual Budget</th>
                    <th className="py-3 px-4 text-center">Employees</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {departments.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                        {d.code}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{d.name}</div>
                        <div className="text-[11px] text-slate-500">{d.nameMyanmar}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {d.headOfDepartment}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">
                        {formatMMK(d.annualBudgetMMK)}
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        {d.totalEmployees}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-md font-semibold text-[11px] text-emerald-700 bg-emerald-50 capitalize">
                          {d.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteDepartment(d.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete Department"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. LEAVE SETUP VIEW */}
      {activeSetupTab === 'leave' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {language === 'my' ? 'ခွင့်မူဝါဒနှင့် စည်းမျဉ်းများ' : 'Statutory & Corporate Leave Policies'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'my' ? 'မြန်မာနိုင်ငံ အလုပ်သမားဥပဒေအရ ခွင့်ရက်ခွင့်ပြုချက်များနှင့် ကုမ္ပဏီစည်းမျဉ်းများ' : 'Configure entitlements, paid status, carry-over caps, and documentation requirements.'}
              </p>
            </div>
            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addLeaveType}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leaveSetupList.map((lv) => (
              <div
                key={lv.id}
                className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{lv.title}</h4>
                    <p className="text-xs text-indigo-600 font-medium">{lv.titleMyanmar}</p>
                  </div>
                  <span className="font-mono text-base font-bold text-slate-900 tabular-nums">
                    {lv.defaultDays}d
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">
                  {lv.description}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Compensation:</span>
                    <span className={`font-semibold ${lv.isPaid ? 'text-emerald-600' : 'text-slate-600'}`}>
                      {lv.isPaid ? 'Fully Paid' : 'Unpaid'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Carry Forward Max:</span>
                    <span className="font-mono">{lv.carryForwardMaxDays} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Doctor Slip Required:</span>
                    <span>{lv.requireMedicalCertificate ? 'Yes (Mandatory)' : 'No'}</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleDeleteLeaveRule(lv.id)}
                    className="text-xs text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. DUTY SHIFT SETUP VIEW */}
      {activeSetupTab === 'shift' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {language === 'my' ? 'အလုပ်ချိန်အဆိုင်းများ (Duty Shifts)' : 'Work Rosters & Shift Schedules'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'my' ? 'ရုံးတက်ဆင်းချိန်များ၊ နောက်ကျခွင့်မိနစ်နှင့် အချိန်ပို စည်းမျဉ်းများ' : 'Set core business hours, grace periods before late marks, and shift differentials.'}
              </p>
            </div>
            <button
              onClick={() => setIsShiftModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addShift}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dutyShifts.map((shf) => (
              <div
                key={shf.id}
                className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-indigo-700">
                      {shf.shiftCode}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                      {shf.name}
                    </h4>
                    <p className="text-xs text-slate-500">{shf.nameMyanmar}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-slate-100 text-slate-800">
                    {shf.startTime} - {shf.endTime}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-lg text-center text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400">Grace (Late)</div>
                    <div className="font-mono font-bold text-slate-800 tabular-nums">
                      {shf.gracePeriodMinutes} mins
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Lunch Break</div>
                    <div className="font-mono font-bold text-slate-800 tabular-nums">
                      {shf.breakDurationMinutes} mins
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Staff Assigned</div>
                    <div className="font-mono font-bold text-indigo-600 tabular-nums">
                      {shf.assignedEmployeesCount}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-1">
                    {shf.activeDays.map((d) => (
                      <span key={d} className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-mono text-slate-700">
                        {d}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => handleDeleteShift(shf.id)}
                    className="text-xs text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. SALARY SETUP VIEW */}
      {activeSetupTab === 'salary' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {language === 'my' ? 'လစာနှင့် ထောက်ပံ့ကြေး ဖွဲ့စည်းပုံ သတ်မှတ်ချက်' : 'Compensation Grades & Statutory Withholding Configuration'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'my' ? 'ရာထူးအဆင့်အလိုက် လစာဘောင်များ၊ လူမှုဖူလုံရေး (SSB) နှင့် အခွန်စည်းမျဉ်းများ' : 'Configure compensation salary bands, Social Security Board rules, and overtime parameters.'}
              </p>
            </div>
            <button
              onClick={handleSaveSalaryConfig}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Save Policy Settings</span>
            </button>
          </div>

          {salarySavedNotification && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Salary compensation configuration saved and applied across payroll.</span>
            </div>
          )}

          {/* Statutory Regulations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                <Shield className="w-4 h-4 text-indigo-600" />
                <span>Social Security Board (SSB) Rules</span>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-slate-500 block mb-1">Employee Deduction (%)</label>
                  <input
                    type="number"
                    value={currentSalaryConfig.ssbEmployeePercent}
                    onChange={(e) =>
                      setCurrentSalaryConfig({ ...currentSalaryConfig, ssbEmployeePercent: Number(e.target.value) })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">SSB Statutory Cap (MMK)</label>
                  <input
                    type="number"
                    value={currentSalaryConfig.ssbSalaryCapMMK}
                    onChange={(e) =>
                      setCurrentSalaryConfig({ ...currentSalaryConfig, ssbSalaryCapMMK: Number(e.target.value) })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Standard: 300,000 Ks cap $\rightarrow$ Max deduction 6,000 Ks
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Overtime &amp; Rate Multipliers</span>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-slate-500 block mb-1">Weekday OT Multiplier</label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentSalaryConfig.overtimeHourlyMultiplier}
                    onChange={(e) =>
                      setCurrentSalaryConfig({ ...currentSalaryConfig, overtimeHourlyMultiplier: Number(e.target.value) })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">Annual Tax Exemption (MMK)</label>
                  <input
                    type="number"
                    value={currentSalaryConfig.taxPersonalExemptionMMK}
                    onChange={(e) =>
                      setCurrentSalaryConfig({ ...currentSalaryConfig, taxPersonalExemptionMMK: Number(e.target.value) })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Payroll Cutoff Calendar</span>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-slate-500 block mb-1">Attendance Cutoff Day of Month</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={currentSalaryConfig.payrollCutoffDay}
                    onChange={(e) =>
                      setCurrentSalaryConfig({ ...currentSalaryConfig, payrollCutoffDay: Number(e.target.value) })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">Salary Disbursement Day</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={currentSalaryConfig.payDisbursementDay}
                    onChange={(e) =>
                      setCurrentSalaryConfig({ ...currentSalaryConfig, payDisbursementDay: Number(e.target.value) })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Salary Grade Bands Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">
                Corporate Salary Grades &amp; Standard Allowances
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-3 px-4">Grade</th>
                    <th className="py-3 px-4">Title Band</th>
                    <th className="py-3 px-4 text-right">Min Base (MMK)</th>
                    <th className="py-3 px-4 text-right">Max Base (MMK)</th>
                    <th className="py-3 px-4 text-right">Transport Allowance</th>
                    <th className="py-3 px-4 text-right">Meal Allowance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentSalaryConfig.tiers.map((tier) => (
                    <tr key={tier.grade} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                        {tier.grade}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {tier.title}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                        {formatMMK(tier.minBaseMMK)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                        {formatMMK(tier.maxBaseMMK)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-600">
                        +{formatMMK(tier.defaultTransportMMK)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-600">
                        +{formatMMK(tier.defaultMealMMK)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. POSITION SETUP VIEW */}
      {activeSetupTab === 'position' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {language === 'my' ? 'ရာထူးအဆင့်ဆင့် စီမံသတ်မှတ်ခြင်း' : 'Job Hierarchy & Designation Catalog'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'my' ? 'ရာထူးအမည်များ၊ အဆင့်၊ ဌာနနှင့် သက်ဆိုင်ရာ လစာအဆင့်' : 'Standardize organizational roles, required experience, and salary grade mappings.'}
              </p>
            </div>
            <button
              onClick={() => setIsPosModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addPosition}</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-3 px-4">Position Code</th>
                    <th className="py-3 px-4">Title Designation</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4 text-center">Seniority Level</th>
                    <th className="py-3 px-4 text-center">Salary Grade</th>
                    <th className="py-3 px-4 text-center">Min Exp</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {positions.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                        {p.code}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{p.title}</div>
                        <div className="text-[11px] text-slate-500">{p.titleMyanmar}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">{p.department}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-800">
                          {p.level}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                        {p.salaryGrade}
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        {p.minExperienceYears} yrs
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeletePosition(p.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete Position"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. BIOMETRIC DEVICE SETUP VIEW */}
      {activeSetupTab === 'device' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {language === 'my' ? 'ဇီဝမက်ထရစ် စက်ပစ္စည်းများ ချိတ်ဆက်မှု' : 'Biometric Sensor Stations & Network Terminals'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'my' ? 'ရုံးချုပ်နှင့် ဌာနခွဲများရှိ လက်ဗွေရာနှင့် မျက်ဝန်းစကင်ဖတ်စက်များ၏ ကွန်ရက်အခြေအနေ' : 'Manage capacitive fingerprint terminals, retinal HUD cameras, and GPS geofence zones.'}
              </p>
            </div>
            <button
              onClick={() => setIsDeviceModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addDevice}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {devices.map((dev) => (
              <div
                key={dev.id}
                className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
                      <Fingerprint className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {dev.terminalName}
                      </h4>
                      <p className="text-xs text-slate-500">{dev.location}</p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{dev.status.toUpperCase()}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-lg text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">IP / Network Host</span>
                    <span className="font-mono font-medium text-slate-800">{dev.ipAddress}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Sensor Modality</span>
                    <span className="font-medium text-slate-800">{dev.deviceType}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 text-slate-500">
                  <span>Geofence: {dev.geofenceRadiusMeters}m radius</span>
                  <button
                    onClick={() => handleDeleteDevice(dev.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. USER ACCOUNTS & RBAC SETUP VIEW */}
      {activeSetupTab === 'users' && (
        <UserAccountsSetupTab
          userAccounts={userAccounts}
          onUpdateUserAccounts={onUpdateUserAccounts}
          employees={employees}
          language={language}
        />
      )}

      {/* 8. TURSO CLOUD DATABASE & SQL SCHEMA VIEW */}
      {activeSetupTab === 'turso' && (
        <TursoDatabaseSetupTab
          tursoConfig={tursoConfig}
          onUpdateTursoConfig={onUpdateTursoConfig}
          allData={{
            employees,
            departments,
            positions,
            dutyShifts,
            leaveSetupList,
            devices,
            userAccounts,
            attendance,
            payroll,
            leaves,
            jobs,
            candidates,
            onboardingCases,
            appraisals,
          }}
          language={language}
        />
      )}

      {/* MODAL 1: ADD DEPARTMENT */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">{t.addDepartment}</h3>
              <button onClick={() => setIsDeptModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddDepartment} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Department Name (English) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Quality Assurance & Testing"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Department Name (မြန်မာဘာသာ)</label>
                <input
                  type="text"
                  placeholder="e.g. အရည်အသွေးစစ်ဆေးရေးဌာန"
                  value={deptNameMy}
                  onChange={(e) => setDeptNameMy(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Dept Code</label>
                  <input
                    type="text"
                    placeholder="DEPT-QA"
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Head of Dept</label>
                  <input
                    type="text"
                    placeholder="Daw Nilar Win"
                    value={deptHead}
                    onChange={(e) => setDeptHead(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Annual Budget (MMK)</label>
                <input
                  type="number"
                  value={deptBudget}
                  onChange={(e) => setDeptBudget(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD LEAVE RULE */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">{t.addLeaveType}</h3>
              <button onClick={() => setIsLeaveModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddLeaveRule} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Leave Policy Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Study & Exam Leave"
                  value={leaveTitle}
                  onChange={(e) => setLeaveTitle(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Title (မြန်မာဘာသာ)</label>
                <input
                  type="text"
                  placeholder="စာမေးပွဲဖြေဆိုခွင့်"
                  value={leaveTitleMy}
                  onChange={(e) => setLeaveTitleMy(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Days Per Year</label>
                  <input
                    type="number"
                    value={leaveDays}
                    onChange={(e) => setLeaveDays(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Carry Forward Max</label>
                  <input
                    type="number"
                    value={leaveCarry}
                    onChange={(e) => setLeaveCarry(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={leaveIsPaid}
                    onChange={(e) => setLeaveIsPaid(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="font-medium text-slate-800">Fully Paid Leave</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={leaveMedCert}
                    onChange={(e) => setLeaveMedCert(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="font-medium text-slate-800">Doctor / Medical Slip Required</span>
                </label>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={leaveDesc}
                  onChange={(e) => setLeaveDesc(e.target.value)}
                  placeholder="Permitted for academic exams and professional certifications..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD SHIFT */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">{t.addShift}</h3>
              <button onClick={() => setIsShiftModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddShift} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Shift Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Afternoon Support Shift"
                  value={shiftName}
                  onChange={(e) => setShiftName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Start Time</label>
                  <input
                    type="time"
                    value={shiftStart}
                    onChange={(e) => setShiftStart(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">End Time</label>
                  <input
                    type="time"
                    value={shiftEnd}
                    onChange={(e) => setShiftEnd(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Late Grace (Minutes)</label>
                  <input
                    type="number"
                    value={shiftGrace}
                    onChange={(e) => setShiftGrace(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Shift Code</label>
                  <input
                    type="text"
                    placeholder="SHIFT-AFT"
                    value={shiftCode}
                    onChange={(e) => setShiftCode(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shiftNight}
                  onChange={(e) => setShiftNight(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="font-medium text-slate-800">Is Night Shift (Crosses Midnight)</span>
              </label>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsShiftModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Add Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD POSITION */}
      {isPosModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">{t.addPosition}</h3>
              <button onClick={() => setIsPosModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddPosition} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Job Title (English) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead Security Architect"
                  value={posTitle}
                  onChange={(e) => setPosTitle(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Job Title (မြန်မာဘာသာ)</label>
                <input
                  type="text"
                  placeholder="ဦးဆောင် လုံခြုံရေး ဗိသုကာပညာရှင်"
                  value={posTitleMy}
                  onChange={(e) => setPosTitleMy(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Department</label>
                  <select
                    value={posDept}
                    onChange={(e) => setPosDept(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Seniority Level</label>
                  <select
                    value={posLevel}
                    onChange={(e) => setPosLevel(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Entry">Entry</option>
                    <option value="Junior">Junior</option>
                    <option value="Mid">Mid</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Salary Grade</label>
                  <select
                    value={posGrade}
                    onChange={(e) => setPosGrade(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  >
                    {currentSalaryConfig.tiers.map((t) => (
                      <option key={t.grade} value={t.grade}>
                        {t.grade} ({t.title})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Min Experience (Years)</label>
                  <input
                    type="number"
                    value={posExp}
                    onChange={(e) => setPosExp(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPosModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Create Position
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: ADD DEVICE */}
      {isDeviceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">{t.addDevice}</h3>
              <button onClick={() => setIsDeviceModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddDevice} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Terminal Device Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Level 2 Warehouse Fingerprint Terminal"
                  value={devName}
                  onChange={(e) => setDevName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Physical Location</label>
                <input
                  type="text"
                  placeholder="Yangon HQ - Ground Gate 02"
                  value={devLocation}
                  onChange={(e) => setDevLocation(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">IP Address</label>
                  <input
                    type="text"
                    value={devIp}
                    onChange={(e) => setDevIp(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Device Modality</label>
                  <select
                    value={devType}
                    onChange={(e) => setDevType(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Fingerprint + Retina">Fingerprint + Retina</option>
                    <option value="Optical Retina">Optical Retina</option>
                    <option value="Fingerprint">Fingerprint</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDeviceModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Connect Terminal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
