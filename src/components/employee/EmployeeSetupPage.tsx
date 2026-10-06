import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  Fingerprint,
  Building,
  CreditCard,
  Phone,
  Calendar,
  Shield,
  FileText,
  UserCheck,
  Award,
  Clock,
  Printer,
  X,
  Sparkles,
} from 'lucide-react';
import {
  Employee,
  DepartmentSetupItem,
  DutyShiftSetupItem,
  PositionSetupItem,
  SalarySetupConfig,
} from '../../types';
import { translations, formatMMK } from '../../utils/translations';

interface EmployeeSetupPageProps {
  employees: Employee[];
  departments: DepartmentSetupItem[];
  dutyShifts: DutyShiftSetupItem[];
  positions: PositionSetupItem[];
  salaryConfig: SalarySetupConfig;
  onSaveEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: string) => void;
  language: 'en' | 'my';
}

export const EmployeeSetupPage: React.FC<EmployeeSetupPageProps> = ({
  employees,
  departments,
  dutyShifts,
  positions,
  salaryConfig,
  onSaveEmployee,
  onDeleteEmployee,
  language,
}) => {
  const t = translations[language];

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modals state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [dossierEmployee, setDossierEmployee] = useState<Employee | null>(null);
  const [activeFormTab, setActiveFormTab] = useState<'personal' | 'employment' | 'compensation' | 'emergency' | 'biometric'>('personal');

  // Multi-tab Form State
  // Tab 1: Personal & Demographics
  const [formName, setFormName] = useState('');
  const [formNameMy, setFormNameMy] = useState('');
  const [formNrc, setFormNrc] = useState('');
  const [formPassport, setFormPassport] = useState('');
  const [formGender, setFormGender] = useState<'male' | 'female' | 'other'>('male');
  const [formDob, setFormDob] = useState('1995-05-15');
  const [formBloodType, setFormBloodType] = useState('O+');
  const [formMarital, setFormMarital] = useState<'single' | 'married' | 'divorced'>('single');
  const [formPhone, setFormPhone] = useState('+95 9 ');
  const [formPersonalEmail, setFormPersonalEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formTownship, setFormTownship] = useState('Kamayut, Yangon');

  // Tab 2: Employment & Roster
  const [formEmpId, setFormEmpId] = useState('');
  const [formDept, setFormDept] = useState(departments[0]?.name || 'Engineering');
  const [formRole, setFormRole] = useState(positions[0]?.title || 'Software Engineer');
  const [formShift, setFormShift] = useState(dutyShifts[0]?.name || 'General Corporate Day Shift');
  const [formWorkLocation, setFormWorkLocation] = useState('Yangon HQ');
  const [formCorporateEmail, setFormCorporateEmail] = useState('');
  const [formJoinDate, setFormJoinDate] = useState(new Date().toISOString().split('T')[0]);
  const [formStatus, setFormStatus] = useState<'active' | 'probation' | 'onboarding'>('active');
  const [formEmpType, setFormEmpType] = useState<'permanent' | 'probation' | 'contract' | 'intern'>('permanent');
  const [formManager, setFormManager] = useState('Daw Khin Thuzar (HR)');

  // Tab 3: Compensation & Banking
  const [formBaseSalary, setFormBaseSalary] = useState(2500000);
  const [formTransportAllowance, setFormTransportAllowance] = useState(150000);
  const [formMealAllowance, setFormMealAllowance] = useState(120000);
  const [formSalaryGrade, setFormSalaryGrade] = useState('E4');
  const [formBankName, setFormBankName] = useState('KBZ Bank');
  const [formBankAccount, setFormBankAccount] = useState('');
  const [formAccountName, setFormAccountName] = useState('');
  const [formSsbNumber, setFormSsbNumber] = useState('SSB-YGN-2026-');
  const [formTaxTin, setFormTaxTin] = useState('TIN-IRD-');

  // Tab 4: Emergency Contacts & Education
  const [formEmergName, setFormEmergName] = useState('');
  const [formEmergRel, setFormEmergRel] = useState('Spouse');
  const [formEmergPhone, setFormEmergPhone] = useState('+95 9 ');
  const [formSecEmergName, setFormSecEmergName] = useState('');
  const [formSecEmergRel, setFormSecEmergRel] = useState('Parent');
  const [formSecEmergPhone, setFormSecEmergPhone] = useState('');
  const [formDegree, setFormDegree] = useState('Bachelor of Computer Science (B.C.Sc)');
  const [formInstitute, setFormInstitute] = useState('University of Computer Studies, Yangon (UCSY)');
  const [formExpYears, setFormExpYears] = useState(4);

  // Tab 5: Biometrics & Security
  const [formFingerprintEnrolled, setFormFingerprintEnrolled] = useState(true);
  const [formIrisEnrolled, setFormIrisEnrolled] = useState(true);
  const [formSecurityPin, setFormSecurityPin] = useState('1234');
  const [formKeycard, setFormKeycard] = useState('RFID-NX-');

  // Open Editor for Creating
  const handleOpenCreate = () => {
    setEditingEmployeeId(null);
    const nextNum = employees.length + 1;
    setFormEmpId(`NX-${1000 + nextNum}`);
    setFormName('');
    setFormNameMy('');
    setFormNrc('12/DAGAMA(N)');
    setFormPassport('');
    setFormGender('male');
    setFormDob('1996-04-12');
    setFormBloodType('B+');
    setFormMarital('single');
    setFormPhone('+95 9 790 000 000');
    setFormPersonalEmail('');
    setFormAddress('No. 12, Pyay Road, Kamayut Township');
    setFormTownship('Yangon');
    setFormDept(departments[0]?.name || 'Engineering');
    setFormRole(positions[0]?.title || 'Software Engineer');
    setFormShift(dutyShifts[0]?.name || 'General Corporate Day Shift');
    setFormWorkLocation('Yangon HQ');
    setFormCorporateEmail('');
    setFormJoinDate(new Date().toISOString().split('T')[0]);
    setFormStatus('active');
    setFormEmpType('permanent');
    setFormManager('Daw Khin Thuzar');
    setFormBaseSalary(2500000);
    setFormTransportAllowance(150000);
    setFormMealAllowance(120000);
    setFormSalaryGrade('E4');
    setFormBankName('KBZ Bank');
    setFormBankAccount('001-203-9988776');
    setFormAccountName('');
    setFormSsbNumber(`SSB-YGN-2026-${1000 + nextNum}`);
    setFormTaxTin(`TIN-IRD-${202600 + nextNum}`);
    setFormEmergName('');
    setFormEmergRel('Parent');
    setFormEmergPhone('+95 9 790 111 222');
    setFormSecEmergName('');
    setFormSecEmergRel('Sibling');
    setFormSecEmergPhone('');
    setFormDegree('Bachelor of Computer Science (B.C.Sc)');
    setFormInstitute('University of Computer Studies, Yangon (UCSY)');
    setFormExpYears(4);
    setFormFingerprintEnrolled(true);
    setFormIrisEnrolled(true);
    setFormSecurityPin('1234');
    setFormKeycard(`KEY-${1000 + nextNum}`);
    setActiveFormTab('personal');
    setIsEditorOpen(true);
  };

  // Open Editor for Editing
  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployeeId(emp.id);
    setFormEmpId(emp.employeeId);
    setFormName(emp.name);
    setFormNameMy(emp.nameMyanmar || emp.name);
    setFormNrc(emp.nrcNumber);
    setFormPassport(emp.passportNumber || '');
    setFormGender(emp.gender || 'male');
    setFormDob(emp.dateOfBirth || '1995-01-01');
    setFormBloodType(emp.bloodType || 'O+');
    setFormMarital(emp.maritalStatus || 'single');
    setFormPhone(emp.phone);
    setFormPersonalEmail(emp.personalEmail || '');
    setFormAddress(emp.address || '');
    setFormTownship(emp.townshipCity || 'Yangon');
    setFormDept(emp.department);
    setFormRole(emp.role);
    setFormShift(emp.assignedShift || dutyShifts[0]?.name || 'General Corporate Day Shift');
    setFormWorkLocation(emp.workLocation || 'Yangon HQ');
    setFormCorporateEmail(emp.email);
    setFormJoinDate(emp.joinDate);
    setFormStatus(emp.status);
    setFormEmpType(emp.employmentType || 'permanent');
    setFormManager(emp.reportingManager || 'Daw Khin Thuzar');
    setFormBaseSalary(emp.baseSalaryMMK);
    setFormTransportAllowance(emp.allowanceTransportMMK || 150000);
    setFormMealAllowance(emp.allowanceMealMMK || 120000);
    setFormSalaryGrade(emp.salaryGrade || 'E4');
    setFormBankName(emp.bankAccount.bankName);
    setFormBankAccount(emp.bankAccount.accountNumber);
    setFormAccountName(emp.bankAccount.accountName || emp.name);
    setFormSsbNumber(emp.ssbNumber || 'SSB-YGN-2021-9988');
    setFormTaxTin(emp.taxTINNumber || 'TIN-IRD-0982314');
    setFormEmergName(emp.emergencyContact.name);
    setFormEmergRel(emp.emergencyContact.relationship);
    setFormEmergPhone(emp.emergencyContact.phone);
    setFormSecEmergName(emp.secondaryEmergencyContact?.name || '');
    setFormSecEmergRel(emp.secondaryEmergencyContact?.relationship || 'Sibling');
    setFormSecEmergPhone(emp.secondaryEmergencyContact?.phone || '');
    setFormDegree(emp.educationDegree || 'Bachelor Degree');
    setFormInstitute(emp.educationInstitute || 'Yangon University');
    setFormExpYears(emp.experienceYears || 4);
    setFormFingerprintEnrolled(emp.biometrics.fingerprintEnrolled);
    setFormIrisEnrolled(emp.biometrics.irisEnrolled);
    setFormSecurityPin(emp.biometrics.securityPin);
    setFormKeycard(emp.biometrics.keycardNumber || 'KEY-NX-1001');
    setActiveFormTab('personal');
    setIsEditorOpen(true);
  };

  // Save Form
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const targetId = editingEmployeeId || `emp-${Date.now()}`;
    const targetAvatar =
      employees.find((e) => e.id === targetId)?.avatar ||
      '/src/assets/images/avatar_lead_engineer_1791292472793.jpg';

    const saved: Employee = {
      id: targetId,
      employeeId: formEmpId || `NX-${Date.now().toString().slice(-4)}`,
      name: formName,
      nameMyanmar: formNameMy || formName,
      role: formRole,
      department: formDept,
      email: formCorporateEmail || `${formName.toLowerCase().replace(/\s+/g, '')}@nexhr.com`,
      phone: formPhone,
      nrcNumber: formNrc,
      joinDate: formJoinDate,
      avatar: targetAvatar,
      baseSalaryMMK: Number(formBaseSalary),
      status: formStatus,
      gender: formGender,
      dateOfBirth: formDob,
      bloodType: formBloodType,
      maritalStatus: formMarital,
      nationality: 'Myanmar',
      address: formAddress,
      townshipCity: formTownship,
      personalEmail: formPersonalEmail,
      passportNumber: formPassport,
      assignedShift: formShift,
      salaryGrade: formSalaryGrade,
      allowanceTransportMMK: Number(formTransportAllowance),
      allowanceMealMMK: Number(formMealAllowance),
      reportingManager: formManager,
      workLocation: formWorkLocation,
      employmentType: formEmpType,
      ssbNumber: formSsbNumber,
      taxTINNumber: formTaxTin,
      bankAccount: {
        bankName: formBankName,
        accountNumber: formBankAccount,
        accountName: formAccountName || formName,
      },
      emergencyContact: {
        name: formEmergName || 'Family Contact',
        relationship: formEmergRel,
        phone: formEmergPhone,
      },
      secondaryEmergencyContact: formSecEmergName
        ? {
            name: formSecEmergName,
            relationship: formSecEmergRel,
            phone: formSecEmergPhone,
          }
        : undefined,
      biometrics: {
        fingerprintEnrolled: formFingerprintEnrolled,
        irisEnrolled: formIrisEnrolled,
        securityPin: formSecurityPin || '1234',
        keycardNumber: formKeycard,
      },
      educationDegree: formDegree,
      educationInstitute: formInstitute,
      experienceYears: Number(formExpYears),
    };

    onSaveEmployee(saved);
    setIsEditorOpen(false);
  };

  // Filter Employees
  const filteredEmployees = employees.filter((emp) => {
    const matchSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.nrcNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDept = selectedDept === 'all' || emp.department === selectedDept;
    const matchStatus = selectedStatus === 'all' || emp.status === selectedStatus;
    return matchSearch && matchDept && matchStatus;
  });

  const totalPayrollGross = employees.reduce((acc, curr) => acc + curr.baseSalaryMMK, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>Personnel Master Information</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {t.employeeSetupTitle}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.employeeSetupSubtitle}
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addNewEmployee}</span>
        </button>
      </div>

      {/* Metrics Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Total Staff Headcount</div>
          <div className="mt-1 text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {employees.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across 5 departments</div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Permanent Staff</div>
          <div className="mt-1 text-2xl font-bold font-mono text-emerald-600 tabular-nums">
            {employees.filter((e) => e.status === 'active').length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Confirmed full-time</div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Biometric Enrollment</div>
          <div className="mt-1 text-2xl font-bold font-mono text-cyan-600 tabular-nums">
            100%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Fingerprint &amp; Retina Active</div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Monthly Payroll Base</div>
          <div className="mt-1 text-xl font-bold font-mono text-indigo-700 tabular-nums">
            {formatMMK(totalPayrollGross)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">MMK Gross commitment</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={language === 'my' ? 'အမည်၊ ဝန်ထမ်းကုဒ်၊ မှတ်ပုံတင် ရှာရန်...' : 'Search name, ID, NRC, designation...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Dept:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium cursor-pointer"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="probation">Probation</option>
              <option value="onboarding">Onboarding</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">NRC / National ID</th>
                <th className="py-3 px-4">Department &amp; Position</th>
                <th className="py-3 px-4">Duty Shift</th>
                <th className="py-3 px-4 text-right">Base Salary</th>
                <th className="py-3 px-4">Bank &amp; Account</th>
                <th className="py-3 px-4 text-center">Biometrics</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No matching employee records found.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(emp.name);
                          }}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 bg-slate-100"
                        />
                        <div>
                          <div className="font-semibold text-slate-900">{emp.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {emp.employeeId} · {emp.nameMyanmar}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                      {emp.nrcNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900">{emp.role}</div>
                      <div className="text-[11px] text-slate-500">{emp.department}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {emp.assignedShift || 'General Corporate Day Shift'}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-indigo-700 tabular-nums">
                      {formatMMK(emp.baseSalaryMMK)}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{emp.bankAccount.bankName}</div>
                      <div className="text-[11px] font-mono text-slate-400">{emp.bankAccount.accountNumber}</div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1 text-emerald-600" title="Biometrics Enrolled & Verified">
                        <Fingerprint className="w-4 h-4" />
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setDossierEmployee(emp)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          title="View Full Dossier"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          title="Edit Employee"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteEmployee(emp.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete Employee"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MULTI-TAB MODAL: ADD / EDIT EMPLOYEE */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingEmployeeId
                      ? language === 'my' ? 'ဝန်ထမ်းအချက်အလက် ပြင်ဆင်မည်' : 'Edit Employee Master Profile'
                      : language === 'my' ? 'ဝန်ထမ်းသစ် စာရင်းသွင်းမည်' : 'Enroll New Employee Profile'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Comprehensive human capital master registration
                  </p>
                </div>
              </div>
              <button onClick={() => setIsEditorOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sub Tabs within Editor */}
            <div className="flex items-center gap-1 px-6 py-2 border-b border-slate-200 bg-white overflow-x-auto text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveFormTab('personal')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  activeFormTab === 'personal' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                1. {t.tabPersonal}
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('employment')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  activeFormTab === 'employment' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                2. {t.tabEmployment}
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('compensation')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  activeFormTab === 'compensation' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                3. {t.tabCompensation}
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('emergency')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  activeFormTab === 'emergency' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                4. {t.tabEmergency}
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('biometric')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  activeFormTab === 'biometric' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                5. {t.tabBiometric}
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSaveForm} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              {/* TAB 1: PERSONAL & DEMOGRAPHICS */}
              {activeFormTab === 'personal' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Full Name (English) *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ko Thant Zin"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Full Name (မြန်မာအမည်)</label>
                      <input
                        type="text"
                        placeholder="ကိုသန့်ဇင်"
                        value={formNameMy}
                        onChange={(e) => setFormNameMy(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        National Registration Card (NRC / မှတ်ပုံတင်) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="12/DAGAMA(N)089123"
                        value={formNrc}
                        onChange={(e) => setFormNrc(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-medium"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Passport Number (Optional)</label>
                      <input
                        type="text"
                        placeholder="MD123456"
                        value={formPassport}
                        onChange={(e) => setFormPassport(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Gender</label>
                      <select
                        value={formGender}
                        onChange={(e) => setFormGender(e.target.value as any)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={formDob}
                        onChange={(e) => setFormDob(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Blood Type</label>
                      <select
                        value={formBloodType}
                        onChange={(e) => setFormBloodType(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                      >
                        <option value="A+">A+</option>
                        <option value="B+">B+</option>
                        <option value="O+">O+</option>
                        <option value="AB+">AB+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Personal Mobile Phone *</label>
                      <input
                        type="text"
                        required
                        placeholder="+95 9 420 112 334"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Personal Email</label>
                      <input
                        type="email"
                        placeholder="thantzin.personal@gmail.com"
                        value={formPersonalEmail}
                        onChange={(e) => setFormPersonalEmail(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Residential Address (Myanmar)</label>
                    <input
                      type="text"
                      placeholder="No. 14B, Hledan Road, Kamayut Township, Yangon"
                      value={formAddress}
                      onChange={(e) => setFormAddress(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: EMPLOYMENT & SHIFTS */}
              {activeFormTab === 'employment' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Employee ID Code *</label>
                      <input
                        type="text"
                        required
                        value={formEmpId}
                        onChange={(e) => setFormEmpId(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-indigo-700"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Department</label>
                      <select
                        value={formDept}
                        onChange={(e) => setFormDept(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                      >
                        {departments.map((d) => (
                          <option key={d.id} value={d.name}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Position / Designation</label>
                      <select
                        value={formRole}
                        onChange={(e) => setFormRole(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                      >
                        {positions.map((p) => (
                          <option key={p.id} value={p.title}>
                            {p.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Assigned Duty Shift</label>
                      <select
                        value={formShift}
                        onChange={(e) => setFormShift(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                      >
                        {dutyShifts.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name} ({s.startTime}-{s.endTime})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Employment Type</label>
                      <select
                        value={formEmpType}
                        onChange={(e) => setFormEmpType(e.target.value as any)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                      >
                        <option value="permanent">Permanent Full-time</option>
                        <option value="probation">Probation (3 Months)</option>
                        <option value="contract">Fixed Contract</option>
                        <option value="intern">Internship</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Work Location</label>
                      <select
                        value={formWorkLocation}
                        onChange={(e) => setFormWorkLocation(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                      >
                        <option value="Yangon HQ">Yangon HQ (Kamayut)</option>
                        <option value="Mandalay Hub">Mandalay Operations Hub</option>
                        <option value="Remote">Remote (Myanmar)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Corporate Work Email</label>
                      <input
                        type="email"
                        placeholder="name@nexhr.com"
                        value={formCorporateEmail}
                        onChange={(e) => setFormCorporateEmail(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Date of Joining</label>
                      <input
                        type="date"
                        value={formJoinDate}
                        onChange={(e) => setFormJoinDate(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: COMPENSATION & BANK */}
              {activeFormTab === 'compensation' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Base Monthly Salary (MMK) *</label>
                      <input
                        type="number"
                        required
                        value={formBaseSalary}
                        onChange={(e) => setFormBaseSalary(Number(e.target.value))}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-indigo-700"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Transport Allowance (MMK)</label>
                      <input
                        type="number"
                        value={formTransportAllowance}
                        onChange={(e) => setFormTransportAllowance(Number(e.target.value))}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Meal Allowance (MMK)</label>
                      <input
                        type="number"
                        value={formMealAllowance}
                        onChange={(e) => setFormMealAllowance(Number(e.target.value))}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Salary Grade Band</label>
                      <select
                        value={formSalaryGrade}
                        onChange={(e) => setFormSalaryGrade(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                      >
                        {salaryConfig.tiers.map((t) => (
                          <option key={t.grade} value={t.grade}>
                            {t.grade} ({t.title})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Bank Name</label>
                      <select
                        value={formBankName}
                        onChange={(e) => setFormBankName(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                      >
                        <option value="KBZ Bank">KBZ Bank</option>
                        <option value="AYA Bank">AYA Bank</option>
                        <option value="CB Bank">CB Bank</option>
                        <option value="uab bank">uab bank</option>
                        <option value="Yoma Bank">Yoma Bank</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Bank Account Number</label>
                      <input
                        type="text"
                        placeholder="001-209-998877"
                        value={formBankAccount}
                        onChange={(e) => setFormBankAccount(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Social Security Board (SSB Number)
                      </label>
                      <input
                        type="text"
                        placeholder="SSB-YGN-2021-9988"
                        value={formSsbNumber}
                        onChange={(e) => setFormSsbNumber(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Internal Revenue Tax TIN (TIN Number)
                      </label>
                      <input
                        type="text"
                        placeholder="TIN-IRD-0982314"
                        value={formTaxTin}
                        onChange={(e) => setFormTaxTin(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: EMERGENCY CONTACTS & EDUCATION */}
              {activeFormTab === 'emergency' && (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-50 rounded-xl space-y-3 border border-slate-100">
                    <div className="font-bold text-slate-800">Primary Emergency Contact</div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Contact Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="Daw Nwe Nwe"
                          value={formEmergName}
                          onChange={(e) => setFormEmergName(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Relationship</label>
                        <input
                          type="text"
                          placeholder="Mother / Spouse"
                          value={formEmergRel}
                          onChange={(e) => setFormEmergRel(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Emergency Phone *</label>
                        <input
                          type="text"
                          required
                          placeholder="+95 9 420 776 543"
                          value={formEmergPhone}
                          onChange={(e) => setFormEmergPhone(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl space-y-3 border border-slate-100">
                    <div className="font-bold text-slate-800">Secondary Emergency Contact (Optional)</div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Contact Name</label>
                        <input
                          type="text"
                          placeholder="Ko Min Min"
                          value={formSecEmergName}
                          onChange={(e) => setFormSecEmergName(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Relationship</label>
                        <input
                          type="text"
                          placeholder="Sibling"
                          value={formSecEmergRel}
                          onChange={(e) => setFormSecEmergRel(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Phone</label>
                        <input
                          type="text"
                          placeholder="+95 9 420 999 888"
                          value={formSecEmergPhone}
                          onChange={(e) => setFormSecEmergPhone(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Highest Degree / Diploma</label>
                      <input
                        type="text"
                        placeholder="Bachelor of Computer Science (B.C.Sc)"
                        value={formDegree}
                        onChange={(e) => setFormDegree(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">University / Institute</label>
                      <input
                        type="text"
                        placeholder="UCSY, Yangon"
                        value={formInstitute}
                        onChange={(e) => setFormInstitute(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: BIOMETRICS & SECURITY */}
              {activeFormTab === 'biometric' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
                    <div className="flex items-center gap-2 font-bold text-cyan-400">
                      <Fingerprint className="w-5 h-5" />
                      <span>Biometric Hardware Template Provisioning</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Provision cryptographic templates for capacitive fingerprint sensors and ocular retina scanners at corporate gate terminals.
                    </p>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer bg-slate-800 p-3 rounded-lg border border-slate-700">
                        <input
                          type="checkbox"
                          checked={formFingerprintEnrolled}
                          onChange={(e) => setFormFingerprintEnrolled(e.target.checked)}
                          className="w-4 h-4 text-cyan-500 rounded"
                        />
                        <span className="font-medium text-xs">Fingerprint Template Enrolled</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer bg-slate-800 p-3 rounded-lg border border-slate-700">
                        <input
                          type="checkbox"
                          checked={formIrisEnrolled}
                          onChange={(e) => setFormIrisEnrolled(e.target.checked)}
                          className="w-4 h-4 text-cyan-500 rounded"
                        />
                        <span className="font-medium text-xs">Optical Retina Scan Enrolled</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        ESS Security Passcode PIN (4 Digits) *
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        required
                        placeholder="1234"
                        value={formSecurityPin}
                        onChange={(e) => setFormSecurityPin(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-center tracking-widest text-base"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Used to unlock sensitive payslips and personal data in ESS Portal.
                      </span>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        RFID / NFC Keycard Token ID
                      </label>
                      <input
                        type="text"
                        placeholder="KEY-NX-1002"
                        value={formKeycard}
                        onChange={(e) => setFormKeycard(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex gap-2 text-xs">
                  {activeFormTab !== 'personal' && (
                    <button
                      type="button"
                      onClick={() => {
                        const tabs: any[] = ['personal', 'employment', 'compensation', 'emergency', 'biometric'];
                        const idx = tabs.indexOf(activeFormTab);
                        if (idx > 0) setActiveFormTab(tabs[idx - 1]);
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                    >
                      &larr; Previous Tab
                    </button>
                  )}
                  {activeFormTab !== 'biometric' && (
                    <button
                      type="button"
                      onClick={() => {
                        const tabs: any[] = ['personal', 'employment', 'compensation', 'emergency', 'biometric'];
                        const idx = tabs.indexOf(activeFormTab);
                        if (idx < tabs.length - 1) setActiveFormTab(tabs[idx + 1]);
                      }}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg"
                    >
                      Next Tab &rarr;
                    </button>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                  >
                    Save Complete Profile
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW FULL EMPLOYEE DOSSIER */}
      {dossierEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  {language === 'my' ? 'ဝန်ထမ်း ကိုယ်ရေးရာဇဝင် အပြည့်အစုံ' : 'Official Employee Master Dossier'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Dossier</span>
                </button>
                <button onClick={() => setDossierEmployee(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto space-y-6 text-xs text-slate-800">
              {/* Header Profile lockup */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-5">
                <div className="flex items-center gap-4">
                  <img
                    src={dossierEmployee.avatar}
                    alt={dossierEmployee.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(dossierEmployee.name);
                    }}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-100 shadow-sm"
                  />
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {dossierEmployee.name}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {dossierEmployee.nameMyanmar} · ID: {dossierEmployee.employeeId}
                    </p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md font-semibold text-indigo-700 bg-indigo-50 text-[11px]">
                      {dossierEmployee.role} · {dossierEmployee.department}
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono text-[11px] text-slate-500">
                  <div>Status: <span className="font-bold text-emerald-600 uppercase">{dossierEmployee.status}</span></div>
                  <div>Joined: {dossierEmployee.joinDate}</div>
                </div>
              </div>

              {/* Data Grid 1: Identity & Statutory */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="space-y-1.5">
                  <div className="font-semibold text-slate-900 text-xs uppercase tracking-wider mb-2">
                    Identity &amp; Statutory
                  </div>
                  <div><span className="text-slate-500">NRC Number:</span> <span className="font-mono font-bold text-slate-900">{dossierEmployee.nrcNumber}</span></div>
                  <div><span className="text-slate-500">SSB Number:</span> <span className="font-mono">{dossierEmployee.ssbNumber || 'SSB-YGN-2021-9988'}</span></div>
                  <div><span className="text-slate-500">Tax TIN:</span> <span className="font-mono">{dossierEmployee.taxTINNumber || 'TIN-IRD-0982314'}</span></div>
                  <div><span className="text-slate-500">Gender / DOB:</span> <span>{dossierEmployee.gender || 'Male'} ({dossierEmployee.dateOfBirth || '1995-05-15'})</span></div>
                </div>

                <div className="space-y-1.5">
                  <div className="font-semibold text-slate-900 text-xs uppercase tracking-wider mb-2">
                    Employment &amp; Roster
                  </div>
                  <div><span className="text-slate-500">Assigned Shift:</span> <span className="font-medium">{dossierEmployee.assignedShift || 'General Corporate Day Shift'}</span></div>
                  <div><span className="text-slate-500">Work Location:</span> <span>{dossierEmployee.workLocation || 'Yangon HQ'}</span></div>
                  <div><span className="text-slate-500">Corporate Email:</span> <span className="font-mono">{dossierEmployee.email}</span></div>
                  <div><span className="text-slate-500">Reporting Head:</span> <span>{dossierEmployee.reportingManager || 'Daw Khin Thuzar'}</span></div>
                </div>
              </div>

              {/* Data Grid 2: Compensation & Bank */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="space-y-1.5">
                  <div className="font-semibold text-slate-900 text-xs uppercase tracking-wider mb-2">
                    Salary Structure
                  </div>
                  <div><span className="text-slate-500">Base Salary:</span> <span className="font-mono font-bold text-indigo-700">{formatMMK(dossierEmployee.baseSalaryMMK)}</span></div>
                  <div><span className="text-slate-500">Transport:</span> <span className="font-mono text-emerald-600">+{formatMMK(dossierEmployee.allowanceTransportMMK || 150000)}</span></div>
                  <div><span className="text-slate-500">Meal:</span> <span className="font-mono text-emerald-600">+{formatMMK(dossierEmployee.allowanceMealMMK || 120000)}</span></div>
                  <div><span className="text-slate-500">Salary Grade:</span> <span className="font-mono font-bold">{dossierEmployee.salaryGrade || 'E4'}</span></div>
                </div>

                <div className="space-y-1.5">
                  <div className="font-semibold text-slate-900 text-xs uppercase tracking-wider mb-2">
                    Disbursement Banking
                  </div>
                  <div><span className="text-slate-500">Bank Name:</span> <span className="font-medium">{dossierEmployee.bankAccount.bankName}</span></div>
                  <div><span className="text-slate-500">Account Number:</span> <span className="font-mono font-bold">{dossierEmployee.bankAccount.accountNumber}</span></div>
                  <div><span className="text-slate-500">Beneficiary:</span> <span>{dossierEmployee.bankAccount.accountName}</span></div>
                </div>
              </div>

              {/* Data Grid 3: Emergency & Biometrics */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="space-y-1.5">
                  <div className="font-semibold text-slate-900 text-xs uppercase tracking-wider mb-2">
                    Emergency Contact
                  </div>
                  <div><span className="text-slate-500">Name:</span> <span className="font-bold">{dossierEmployee.emergencyContact.name}</span></div>
                  <div><span className="text-slate-500">Relationship:</span> <span>{dossierEmployee.emergencyContact.relationship}</span></div>
                  <div><span className="text-slate-500">Phone:</span> <span className="font-mono">{dossierEmployee.emergencyContact.phone}</span></div>
                </div>

                <div className="space-y-1.5">
                  <div className="font-semibold text-slate-900 text-xs uppercase tracking-wider mb-2">
                    Biometric &amp; Security
                  </div>
                  <div className="flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-emerald-600" />
                    <span>Fingerprint: Enrolled &amp; Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-600" />
                    <span>Retina Scan: Enrolled &amp; Active</span>
                  </div>
                  <div><span className="text-slate-500">Keycard Ref:</span> <span className="font-mono">{dossierEmployee.biometrics.keycardNumber || 'KEY-NX-1002'}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
