import React, { useState } from 'react';
import {
  Users,
  Plus,
  Shield,
  Key,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  UserCheck,
  Search,
  Filter,
  Lock,
  Unlock,
  X,
  Sparkles,
} from 'lucide-react';
import { UserAccount, UserRole, Employee } from '../../types';

interface UserAccountsSetupTabProps {
  userAccounts: UserAccount[];
  onUpdateUserAccounts: (accounts: UserAccount[]) => void;
  employees: Employee[];
  language: 'en' | 'my';
}

const AVAILABLE_PERMISSIONS = [
  { id: 'all_access', label: 'Full System Administrator Access (All Modules)' },
  { id: 'employee_manage', label: 'Manage Employees & Onboarding' },
  { id: 'payroll_run', label: 'Calculate & Disburse Monthly Payroll' },
  { id: 'salary_config', label: 'Edit Salary Grades & Tax Settings' },
  { id: 'leave_approve', label: 'Review & Approve Leave Applications' },
  { id: 'attendance_audit', label: 'Monitor Biometric Attendance & Audits' },
  { id: 'recruitment_pipeline', label: 'Recruitment & Job Postings Management' },
  { id: 'appraisal_conduct', label: 'Conduct Performance Appraisals' },
  { id: 'turso_cloud_sync', label: 'Turso Cloud Database Management & Sync' },
  { id: 'ess_portal', label: 'Employee Self-Service (ESS) Personal Access' },
];

export const UserAccountsSetupTab: React.FC<UserAccountsSetupTabProps> = ({
  userAccounts,
  onUpdateUserAccounts,
  employees,
  language,
}) => {
  const isMy = language === 'my';
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form State
  const [formUsername, setFormUsername] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('employee');
  const [formEmployeeId, setFormEmployeeId] = useState('');
  const [formDepartment, setFormDepartment] = useState('Engineering');
  const [formStatus, setFormStatus] = useState<'active' | 'suspended'>('active');
  const [formPermissions, setFormPermissions] = useState<string[]>([
    'ess_portal',
  ]);

  // Open modal for new user
  const handleOpenNewUser = () => {
    setEditingUserId(null);
    setFormUsername('');
    setFormFullName('');
    setFormEmail('');
    setFormPassword('pass1234');
    setFormRole('employee');
    setFormEmployeeId(employees[0]?.employeeId || '');
    setFormDepartment(employees[0]?.department || 'Engineering');
    setFormStatus('active');
    setFormPermissions(['ess_portal', 'view_my_payslip', 'apply_my_leave']);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditUser = (user: UserAccount) => {
    setEditingUserId(user.id);
    setFormUsername(user.username);
    setFormFullName(user.fullName);
    setFormEmail(user.email);
    setFormPassword('');
    setFormRole(user.role);
    setFormEmployeeId(user.employeeId || '');
    setFormDepartment(user.department || '');
    setFormStatus(user.status);
    setFormPermissions(user.permissions || []);
    setIsModalOpen(true);
  };

  const handleTogglePermission = (permId: string) => {
    if (formPermissions.includes(permId)) {
      setFormPermissions(formPermissions.filter((p) => p !== permId));
    } else {
      setFormPermissions([...formPermissions, permId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUsername.trim() || !formFullName.trim()) return;

    if (editingUserId) {
      // Update
      const updated = userAccounts.map((u) => {
        if (u.id === editingUserId) {
          return {
            ...u,
            username: formUsername.trim().toLowerCase(),
            fullName: formFullName.trim(),
            email: formEmail.trim(),
            role: formRole,
            employeeId: formEmployeeId || undefined,
            department: formDepartment,
            status: formStatus,
            permissions: formPermissions,
          };
        }
        return u;
      });
      onUpdateUserAccounts(updated);
    } else {
      // Create
      const newUser: UserAccount = {
        id: `usr-${Date.now()}`,
        username: formUsername.trim().toLowerCase(),
        fullName: formFullName.trim(),
        email: formEmail.trim(),
        password: formPassword || 'pass1234',
        role: formRole,
        employeeId: formEmployeeId || undefined,
        department: formDepartment,
        status: formStatus,
        createdAt: new Date().toISOString().split('T')[0],
        permissions: formPermissions,
      };
      onUpdateUserAccounts([newUser, ...userAccounts]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (userAccounts.length <= 1) {
      alert('Cannot delete the last remaining user account.');
      return;
    }
    onUpdateUserAccounts(userAccounts.filter((u) => u.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    const updated = userAccounts.map((u) => {
      if (u.id === id) {
        return {
          ...u,
          status: u.status === 'active' ? ('suspended' as const) : ('active' as const),
        };
      }
      return u;
    });
    onUpdateUserAccounts(updated);
  };

  // Filter
  const filteredUsers = userAccounts.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <Shield className="w-3 h-3 text-purple-600" />
            Super Admin
          </span>
        );
      case 'hr_admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <UserCheck className="w-3 h-3 text-indigo-600" />
            HR Admin
          </span>
        );
      case 'manager':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            Manager
          </span>
        );
      case 'employee':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Employee (ESS)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-semibold tracking-wider text-indigo-300 uppercase">
              {isMy ? 'လုံခြုံရေးနှင့် သုံးစွဲသူအကောင့်များ' : 'Access Control & Authentication'}
            </span>
          </div>
          <h2 className="text-xl font-bold">
            {isMy
              ? 'အသုံးပြုသူ အကောင့်များနှင့် လုပ်ပိုင်ခွင့်များ စီမံခြင်း'
              : 'User Accounts & Role-Based Access Control (RBAC)'}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            {isMy
              ? 'HR Admin၊ Manager နှင့် ဝန်ထမ်းများအတွက် စနစ်သုံး အကောင့်များ ဖွင့်လှစ်ခြင်း၊ စကားဝှက် သတ်မှတ်ခြင်းနှင့် သက်ဆိုင်ရာ ဝန်ထမ်း ID ချိတ်ဆက်ခြင်း။'
              : 'Provision login credentials, assign system roles (Super Admin, HR Manager, Department Head, Employee), link to Employee IDs, and configure permission scopes.'}
          </p>
        </div>
        <button
          onClick={handleOpenNewUser}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg transition-all transform active:scale-95 whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isMy ? 'အသုံးပြုသူ အကောင့်အသစ် ဖွင့်မည်' : 'Create User Account'}</span>
        </button>
      </div>

      {/* Filter and Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isMy ? 'အမည်၊ အကောင့် သို့မဟုတ် အီးမေးလ် ရှာရန်...' : 'Search username, name, email...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium"
            >
              <option value="all">{isMy ? 'ရာထူး အားလုံး' : 'All Roles'}</option>
              <option value="super_admin">Super Admin</option>
              <option value="hr_admin">HR Admin</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500 font-medium w-full sm:w-auto justify-end">
          <span>
            {isMy ? 'စုစုပေါင်း အကောင့်' : 'Total Users'}:{' '}
            <strong className="text-slate-900">{userAccounts.length}</strong>
          </span>
          <span className="text-slate-300">|</span>
          <span>
            Active:{' '}
            <strong className="text-emerald-600">
              {userAccounts.filter((u) => u.status === 'active').length}
            </strong>
          </span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">User / Account</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Linked Employee</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => {
                const linkedEmp = employees.find(
                  (e) => e.employeeId === user.employeeId
                );
                return (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase overflow-hidden border border-indigo-200 shrink-0">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.username}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            user.username.slice(0, 2)
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">@{user.username}</div>
                          <div className="text-[11px] text-slate-400 font-sans">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {user.fullName}
                    </td>
                    <td className="py-3 px-4">{getRoleBadge(user.role)}</td>
                    <td className="py-3 px-4">
                      {user.employeeId ? (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 font-mono text-[11px]">
                          <span>{user.employeeId}</span>
                          {linkedEmp && (
                            <span className="text-slate-500 font-sans font-normal truncate max-w-[100px]">
                              ({linkedEmp.name})
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">None (System)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {user.department || '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors ${
                          user.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        }`}
                        title="Click to toggle status"
                      >
                        {user.status === 'active' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3" />
                            <span>Suspended</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {user.lastLogin || 'Never'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditUser(user)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          title="Edit User"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Permission Guidance Matrix */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
          {isMy ? 'လုပ်ပိုင်ခွင့် အဆင့်များ ဖော်ပြချက်' : 'Role Hierarchy & Permission Matrix'}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-white p-3.5 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-1.5 font-bold text-purple-800">
              <Shield className="w-4 h-4" />
              <span>Super Admin</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Full access to Turso Cloud DB sync, system setup, user provisioning, global salary configuration, and audit logs.
            </p>
          </div>
          <div className="bg-white p-3.5 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-1.5 font-bold text-indigo-800">
              <UserCheck className="w-4 h-4" />
              <span>HR Admin</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Manages employee profiles, recruitment pipelines, onboarding workflows, leave reviews, and monthly payroll disbursement.
            </p>
          </div>
          <div className="bg-white p-3.5 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-1.5 font-bold text-amber-800">
              <Users className="w-4 h-4" />
              <span>Manager</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Approves team leave requests, reviews department attendance logs, and completes employee performance appraisals.
            </p>
          </div>
          <div className="bg-white p-3.5 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-1.5 font-bold text-slate-800">
              <Key className="w-4 h-4" />
              <span>Employee (ESS)</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Secure Employee Self-Service: view certified payslips, apply for leaves, biometric clock-in, and view profile dossier.
            </p>
          </div>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  {editingUserId
                    ? isMy
                      ? 'အသုံးပြုသူ အကောင့် ပြင်ဆင်မည်'
                      : 'Edit User Account'
                    : isMy
                    ? 'အသုံးပြုသူ အကောင့်အသစ် ဖွင့်မည်'
                    : 'Create New User Account'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Username <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-mono">@</span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. thantzin"
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:border-indigo-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    System Role <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                  >
                    <option value="employee">Employee (ESS Only)</option>
                    <option value="manager">Department Manager</option>
                    <option value="hr_admin">HR Administrator</option>
                    <option value="super_admin">Super Administrator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ko Thant Zin"
                    value={formFullName}
                    onChange={(e) => setFormFullName(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. thantzin@nexhr.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Link to Employee ID
                  </label>
                  <select
                    value={formEmployeeId}
                    onChange={(e) => {
                      setFormEmployeeId(e.target.value);
                      const emp = employees.find((x) => x.employeeId === e.target.value);
                      if (emp) {
                        setFormDepartment(emp.department);
                        if (!formFullName) setFormFullName(emp.name);
                        if (!formEmail) setFormEmail(emp.email);
                      }
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                  >
                    <option value="">None (System / Admin Only)</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.employeeId}>
                        {emp.employeeId} - {emp.name} ({emp.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    placeholder="e.g. Engineering"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              {!editingUserId && (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Initial Password / Temporary PIN
                  </label>
                  <input
                    type="password"
                    placeholder="Leave blank for default (pass1234)"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              )}

              {/* Permissions Checkbox Grid */}
              <div>
                <label className="font-semibold text-slate-700 block mb-2">
                  Granular Permissions Checklist
                </label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto p-3 bg-slate-50 rounded-xl border border-slate-200">
                  {AVAILABLE_PERMISSIONS.map((perm) => (
                    <label
                      key={perm.id}
                      className="flex items-center gap-2 cursor-pointer hover:bg-slate-100/70 p-1 rounded-md text-[11px]"
                    >
                      <input
                        type="checkbox"
                        checked={formPermissions.includes(perm.id)}
                        onChange={() => handleTogglePermission(perm.id)}
                        className="rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-slate-700">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  {editingUserId ? 'Save Changes' : 'Create User Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
