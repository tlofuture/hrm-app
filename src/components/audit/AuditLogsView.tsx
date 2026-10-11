import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Download,
  Printer,
  Trash2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  User,
  Fingerprint,
  Calendar,
  Banknote,
  Users,
  Award,
  Settings,
  Lock,
  FileText,
  X,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { AuditLog, AuditActionType, AuditModule, Language, UserAccount } from '../../types';
import { getEmployeeAvatar, handleAvatarError } from '../../utils/imageUtils';

interface AuditLogsViewProps {
  auditLogs: AuditLog[];
  onClearLogs?: () => void;
  currentUser: UserAccount;
  language: Language;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({
  auditLogs,
  onClearLogs,
  currentUser,
  language,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
  const [inspectingLog, setInspectingLog] = useState<AuditLog | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      // Module filter
      if (selectedModule !== 'all' && log.module !== selectedModule) {
        return false;
      }

      // Action filter
      if (selectedAction !== 'all' && log.action !== selectedAction) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && log.status !== selectedStatus) {
        return false;
      }

      // Date range filter
      if (selectedDateRange !== 'all') {
        const logDate = log.timestamp.split(' ')[0];
        const today = new Date().toISOString().split('T')[0];
        if (selectedDateRange === 'today' && logDate !== today) {
          return false;
        }
        if (selectedDateRange === 'week') {
          const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
          if (logDate < sevenDaysAgo) return false;
        }
        if (selectedDateRange === 'month') {
          const currentMonth = today.slice(0, 7);
          if (!logDate.startsWith(currentMonth)) return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = log.userName.toLowerCase().includes(query);
        const matchesAction = log.action.toLowerCase().includes(query);
        const matchesModule = log.module.toLowerCase().includes(query);
        const matchesDesc = log.description.toLowerCase().includes(query);
        const matchesTarget = log.targetId?.toLowerCase().includes(query);
        const matchesIp = log.ipAddress.toLowerCase().includes(query);
        const matchesUserRole = log.userRole.toLowerCase().includes(query);

        if (!matchesName && !matchesAction && !matchesModule && !matchesDesc && !matchesTarget && !matchesIp && !matchesUserRole) {
          return false;
        }
      }

      return true;
    });
  }, [auditLogs, selectedModule, selectedAction, selectedStatus, selectedDateRange, searchQuery]);

  // Key KPI stats
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = auditLogs.filter((l) => l.timestamp.startsWith(today));
    const authLogs = auditLogs.filter((l) => l.module === 'Authentication');
    const criticalLogs = auditLogs.filter((l) =>
      ['DELETE', 'DISBURSE', 'APPROVE', 'CONFIG_CHANGE'].includes(l.action)
    );
    const failureLogs = auditLogs.filter((l) => l.status === 'failure' || l.status === 'warning');

    return {
      total: auditLogs.length,
      todayCount: todayLogs.length,
      authCount: authLogs.length,
      criticalCount: criticalLogs.length,
      failures: failureLogs.length,
    };
  }, [auditLogs]);

  const handleCopyJSON = (log: AuditLog) => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'User Name', 'Role', 'Action', 'Module', 'Description', 'Target ID', 'IP Address', 'Status'];
    const rows = filteredLogs.map((log) => [
      log.id,
      log.timestamp,
      `"${log.userName.replace(/"/g, '""')}"`,
      log.userRole,
      log.action,
      log.module,
      `"${log.description.replace(/"/g, '""')}"`,
      log.targetId || '',
      log.ipAddress,
      log.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nexhr_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadge = (action: AuditActionType) => {
    switch (action) {
      case 'CREATE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">CREATE</span>;
      case 'APPROVE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">APPROVE</span>;
      case 'UPDATE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">UPDATE</span>;
      case 'CONFIG_CHANGE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">CONFIG</span>;
      case 'DELETE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">DELETE</span>;
      case 'REJECT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">REJECT</span>;
      case 'LOGIN':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">LOGIN</span>;
      case 'LOGOUT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">LOGOUT</span>;
      case 'SCAN':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-200">BIOMETRIC</span>;
      case 'DISBURSE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">DISBURSE</span>;
      case 'EXPORT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">EXPORT</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">{action}</span>;
    }
  };

  const getModuleIcon = (module: AuditModule) => {
    switch (module) {
      case 'Authentication':
        return <Lock className="w-3.5 h-3.5 text-blue-600" />;
      case 'Attendance':
        return <Fingerprint className="w-3.5 h-3.5 text-cyan-600" />;
      case 'Leave':
        return <Calendar className="w-3.5 h-3.5 text-amber-600" />;
      case 'Payroll':
        return <Banknote className="w-3.5 h-3.5 text-purple-600" />;
      case 'Employees':
        return <Users className="w-3.5 h-3.5 text-indigo-600" />;
      case 'Appraisal':
        return <Award className="w-3.5 h-3.5 text-rose-600" />;
      case 'Setup':
        return <Settings className="w-3.5 h-3.5 text-slate-600" />;
      case 'Security':
        return <ShieldAlert className="w-3.5 h-3.5 text-red-600" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {language === 'my'
                ? 'လုပ်ဆောင်ချက် စစ်ဆေးရေးမှတ်တမ်း (Audit Logs)'
                : 'Enterprise System Audit Logs & Activity Trail'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            {language === 'my'
              ? 'စနစ်အတွင်း ဝန်ထမ်း၊ HR နှင့် Admin များ ဆောင်ရွက်ခဲ့သော အကောင့်ဝင်ရောက်မှု၊ ခွင့်ပြုချက်၊ လစာပေးချေမှု၊ ဇီဝမက်ထရစ်ရုံးတက်စစ်ဆေးမှုနှင့် ပြင်ဆင်မှုအားလုံးကို စက္ကန့်မလပ် မှတ်တမ်းတင်ထားပါသည်။'
              : 'Immutable record of every security event, biometric clock-in, leave approval, employee edit, and payroll action across NexHR.'}
          </p>
        </div>

        {/* Global Export & Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            title="Export filtered records to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            title="Open printable A4 audit format"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print A4 Audit</span>
          </button>

          {currentUser.role === 'super_admin' && onClearLogs && (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 shadow-2xs transition-colors cursor-pointer"
              title="Reset Audit Logs"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              <span>Reset Logs</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Events Logged</span>
            <FileText className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {stats.total}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Continuous ledger</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Actions Today</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-600 tabular-nums">
            {stats.todayCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Live active sessions</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Authentication Events</span>
            <Lock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-blue-600 tabular-nums">
            {stats.authCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Logins &amp; tokens</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>High-Impact Operations</span>
            <ShieldCheck className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-purple-600 tabular-nums">
            {stats.criticalCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Approvals &amp; Payroll</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={
                language === 'my'
                  ? 'အမည်၊ လုပ်ဆောင်ချက်၊ ဌာန၊ IP ဖြင့် ရှာရန်...'
                  : 'Search by actor, action, module, IP...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Dropdown Filters */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto text-xs">
            {/* Module Filter */}
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium cursor-pointer"
            >
              <option value="all">All Modules</option>
              <option value="Authentication">Authentication</option>
              <option value="Attendance">Attendance &amp; Biometrics</option>
              <option value="Leave">Leave Management</option>
              <option value="Payroll">Payroll</option>
              <option value="Employees">Employees</option>
              <option value="Appraisal">Appraisal</option>
              <option value="Setup">Setup &amp; Config</option>
            </select>

            {/* Action Filter */}
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium cursor-pointer"
            >
              <option value="all">All Actions</option>
              <option value="LOGIN">LOGIN</option>
              <option value="LOGOUT">LOGOUT</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="APPROVE">APPROVE</option>
              <option value="REJECT">REJECT</option>
              <option value="SCAN">SCAN</option>
              <option value="DISBURSE">DISBURSE</option>
              <option value="EXPORT">EXPORT</option>
              <option value="CONFIG_CHANGE">CONFIG_CHANGE</option>
            </select>

            {/* Date Range */}
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="today">Today Only</option>
              <option value="week">Past 7 Days</option>
              <option value="month">This Month</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="failure">Failure</option>
            </select>
          </div>
        </div>

        {/* Filter Summary & Quick Reset */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <div>
            Showing <span className="font-bold text-slate-800">{filteredLogs.length}</span> of{' '}
            <span className="font-bold text-slate-800">{auditLogs.length}</span> recorded actions
          </div>
          {(selectedModule !== 'all' ||
            selectedAction !== 'all' ||
            selectedStatus !== 'all' ||
            selectedDateRange !== 'all' ||
            searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedModule('all');
                setSelectedAction('all');
                setSelectedStatus('all');
                setSelectedDateRange('all');
                setSearchQuery('');
              }}
              className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
            >
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-3 w-12 text-center">#</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User / Actor</th>
                <th className="py-3 px-3">Module</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-4">Description &amp; Target</th>
                <th className="py-3 px-4">Terminal / IP</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium text-slate-600">No matching audit events found</p>
                    <p className="text-xs text-slate-400 mt-1">Try broadening your search or resetting filters</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => (
                  <tr
                    key={log.id}
                    onClick={() => setInspectingLog(log)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    {/* Index */}
                    <td className="py-3 px-3 text-center font-mono text-slate-400">
                      {index + 1}
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-4 font-mono text-slate-700 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{log.timestamp}</span>
                      </div>
                    </td>

                    {/* Actor */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={getEmployeeAvatar({
                            avatar: log.userAvatar,
                            name: log.userName,
                            role: log.userRole,
                          })}
                          alt={log.userName}
                          referrerPolicy="no-referrer"
                          onError={(e) => handleAvatarError(e, { name: log.userName })}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200 bg-slate-100 shrink-0"
                        />
                        <div>
                          <div className="font-semibold text-slate-900 leading-tight">
                            {log.userName}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {log.userRole.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Module */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                        {getModuleIcon(log.module)}
                        <span>{log.module}</span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>

                    {/* Description & Target */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800 leading-snug">
                        {log.description}
                      </div>
                      {log.targetId && (
                        <div className="text-[10px] font-mono text-indigo-600 mt-0.5">
                          Target: {log.targetId}
                        </div>
                      )}
                    </td>

                    {/* Terminal / IP */}
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {log.ipAddress}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {log.status === 'success' ? (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-2.5 h-2.5" />
                          <span>Success</span>
                        </span>
                      ) : log.status === 'warning' ? (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>Warn</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200">
                          <XCircle className="w-2.5 h-2.5" />
                          <span>Failed</span>
                        </span>
                      )}
                    </td>

                    {/* Details button */}
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectingLog(log);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="View Full Metadata"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Event Detail Inspection Modal */}
      {inspectingLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Audit Event Dossier: {inspectingLog.id}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {inspectingLog.timestamp} · IP {inspectingLog.ipAddress}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingLog(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 overflow-y-auto text-xs">
              {/* Actor & Action Lockup */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    Actor Identity
                  </span>
                  {getActionBadge(inspectingLog.action)}
                </div>
                <div className="flex items-center gap-3">
                  <img
                    src={getEmployeeAvatar({
                      avatar: inspectingLog.userAvatar,
                      name: inspectingLog.userName,
                      role: inspectingLog.userRole,
                    })}
                    alt={inspectingLog.userName}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{inspectingLog.userName}</div>
                    <div className="text-slate-500 font-mono">
                      Role: {inspectingLog.userRole} · User ID: {inspectingLog.userId}
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Description */}
              <div className="space-y-1.5">
                <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  Event Description &amp; Scope
                </span>
                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-slate-800 font-medium">
                  {inspectingLog.description}
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-slate-400 text-[10px] font-semibold uppercase">Module</div>
                  <div className="font-bold text-slate-800 mt-0.5">{inspectingLog.module}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-slate-400 text-[10px] font-semibold uppercase">Target Entity</div>
                  <div className="font-bold text-slate-800 font-mono mt-0.5">{inspectingLog.targetId || 'N/A'}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-slate-400 text-[10px] font-semibold uppercase">Execution Status</div>
                  <div className="font-bold text-emerald-700 capitalize mt-0.5">{inspectingLog.status}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-slate-400 text-[10px] font-semibold uppercase">Origin IP Address</div>
                  <div className="font-bold text-slate-800 font-mono mt-0.5">{inspectingLog.ipAddress}</div>
                </div>
              </div>

              {/* JSON Metadata Viewer */}
              {inspectingLog.details && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                      Extended Payload (JSON)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyJSON(inspectingLog)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied ? 'Copied!' : 'Copy JSON'}</span>
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                    {JSON.stringify(inspectingLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setInspectingLog(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal to Clear Logs */}
      {showClearConfirm && onClearLogs && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Clear Audit Logs?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to purge current audit logs? This action cannot be reversed.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearLogs();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-xs"
              >
                Yes, Purge Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print-Ready A4 Landscape Modal */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-5xl w-full p-8 shadow-2xl space-y-6 my-auto text-slate-900">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-800">
                  Audit Trail Report (A4 Format)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700"
                >
                  Print Report
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Official Report Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-950">
                  NexHR ENTERPRISE HR &amp; BIOMETRIC SYSTEM
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  Official Security Audit Trail &amp; Compliance Activity Log
                </p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  SOC 2 Type II / ISO 27001 Access Verification Report
                </p>
              </div>
              <div className="text-right text-xs">
                <div className="font-bold font-mono">CONFIDENTIAL</div>
                <div className="text-slate-500 text-[11px]">
                  Generated: {new Date().toISOString().replace('T', ' ').slice(0, 19)}
                </div>
                <div className="text-slate-500 text-[11px]">Auditor: {currentUser.fullName}</div>
              </div>
            </div>

            {/* Report Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 font-bold">
                    <th className="py-2 px-2">#</th>
                    <th className="py-2 px-2">Timestamp</th>
                    <th className="py-2 px-2">User / Role</th>
                    <th className="py-2 px-2">Module</th>
                    <th className="py-2 px-2">Action</th>
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-2 font-mono">Terminal IP</th>
                    <th className="py-2 px-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredLogs.slice(0, 25).map((log, i) => (
                    <tr key={log.id}>
                      <td className="py-1.5 px-2 font-mono text-slate-400">{i + 1}</td>
                      <td className="py-1.5 px-2 font-mono">{log.timestamp}</td>
                      <td className="py-1.5 px-2 font-semibold">{log.userName} ({log.userRole})</td>
                      <td className="py-1.5 px-2">{log.module}</td>
                      <td className="py-1.5 px-2 font-bold">{log.action}</td>
                      <td className="py-1.5 px-3">{log.description}</td>
                      <td className="py-1.5 px-2 font-mono text-slate-600">{log.ipAddress}</td>
                      <td className="py-1.5 px-2 text-center font-bold text-emerald-700 capitalize">{log.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Sign-off Blocks */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-300 text-center text-xs">
              <div>
                <div className="h-10 border-b border-slate-400" />
                <div className="font-bold mt-1 text-slate-800">System Administrator</div>
                <div className="text-[10px] text-slate-500">Security Verification</div>
              </div>
              <div>
                <div className="h-10 border-b border-slate-400" />
                <div className="font-bold mt-1 text-slate-800">HR Department Head</div>
                <div className="text-[10px] text-slate-500">Executive Approval</div>
              </div>
              <div>
                <div className="h-10 border-b border-slate-400" />
                <div className="font-bold mt-1 text-slate-800">Internal Audit Lead</div>
                <div className="text-[10px] text-slate-500">Compliance Attestation</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
