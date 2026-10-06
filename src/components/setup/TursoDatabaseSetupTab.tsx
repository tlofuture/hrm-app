import React, { useState } from 'react';
import {
  Database,
  Cloud,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  Play,
  Terminal,
  Server,
  Layers,
  Key,
  Globe,
  Save,
  Check,
  Table,
  Sparkles,
  ExternalLink,
  Info,
} from 'lucide-react';
import {
  TursoDatabaseConfig,
  TursoQueryResult,
  Employee,
  DepartmentSetupItem,
  PositionSetupItem,
  DutyShiftSetupItem,
  LeaveSetupItem,
  BiometricDeviceSetupItem,
  UserAccount,
  AttendanceRecord,
  PayrollRecord,
  LeaveRequest,
  RecruitmentJob,
  Candidate,
  OnboardingCase,
  AppraisalRecord,
} from '../../types';
import {
  TURSO_DDL_SCRIPT,
  testTursoConnection,
  executeTursoSql,
  runTursoMigrations,
  syncAllLocalToTursoCloud,
} from '../../utils/turso';

interface TursoDatabaseSetupTabProps {
  tursoConfig: TursoDatabaseConfig;
  onUpdateTursoConfig: (config: TursoDatabaseConfig) => void;
  // All system data for full direct cloud sync
  allData: {
    employees: Employee[];
    departments: DepartmentSetupItem[];
    positions: PositionSetupItem[];
    dutyShifts: DutyShiftSetupItem[];
    leaveSetupList: LeaveSetupItem[];
    devices: BiometricDeviceSetupItem[];
    userAccounts: UserAccount[];
    attendance: AttendanceRecord[];
    payroll: PayrollRecord[];
    leaves: LeaveRequest[];
    jobs: RecruitmentJob[];
    candidates: Candidate[];
    onboardingCases: OnboardingCase[];
    appraisals: AppraisalRecord[];
  };
  language: 'en' | 'my';
}

const PRESET_QUERIES = [
  {
    name: 'All Employees',
    sql: 'SELECT employee_id, name, role, department, base_salary_mmk, status FROM employees LIMIT 10;',
  },
  {
    name: 'Today Attendance',
    sql: 'SELECT employee_name, clock_in_time, method, status, location FROM attendance_records ORDER BY clock_in_time DESC LIMIT 10;',
  },
  {
    name: 'User Accounts',
    sql: 'SELECT username, full_name, role, employee_id, status FROM user_accounts;',
  },
  {
    name: 'Departments & Budget',
    sql: 'SELECT code, name, head_of_department, annual_budget_mmk, total_employees FROM departments;',
  },
  {
    name: 'Payroll Summary',
    sql: 'SELECT employee_name, month_year, base_salary_mmk, net_pay_mmk, status FROM payroll_records LIMIT 10;',
  },
  {
    name: 'Table Counts',
    sql: 'SELECT "employees" as table_name, count(*) as count FROM employees UNION ALL SELECT "attendance_records", count(*) FROM attendance_records UNION ALL SELECT "user_accounts", count(*) FROM user_accounts;',
  },
];

export const TursoDatabaseSetupTab: React.FC<TursoDatabaseSetupTabProps> = ({
  tursoConfig,
  onUpdateTursoConfig,
  allData,
  language,
}) => {
  const isMy = language === 'my';

  // Config inputs
  const [urlInput, setUrlInput] = useState(tursoConfig.url);
  const [tokenInput, setTokenInput] = useState(tursoConfig.authToken);
  const [showToken, setShowToken] = useState(false);
  const [autoSync, setAutoSync] = useState(tursoConfig.autoSyncEnabled);

  // Status & Notifications
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latencyMs: number;
    message: string;
  } | null>(null);

  const [syncingCloud, setSyncingCloud] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const [migrating, setMigrating] = useState(false);
  const [migrationMessage, setMigrationMessage] = useState<string | null>(null);

  // SQL Console
  const [sqlQuery, setSqlQuery] = useState(PRESET_QUERIES[0].sql);
  const [queryExecuting, setQueryExecuting] = useState(false);
  const [queryResult, setQueryResult] = useState<TursoQueryResult | null>(null);

  // Schema Viewer Tab
  const [schemaCopied, setSchemaCopied] = useState(false);

  // Handle Save Credentials
  const handleSaveCredentials = () => {
    const updated: TursoDatabaseConfig = {
      ...tursoConfig,
      url: urlInput.trim(),
      authToken: tokenInput.trim(),
      autoSyncEnabled: autoSync,
    };
    onUpdateTursoConfig(updated);
    setTestResult({
      success: true,
      latencyMs: 0,
      message: 'Turso Cloud credentials saved locally! Run "Test Connection" to verify link.',
    });
  };

  // Handle Test Connection
  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    const res = await testTursoConnection(urlInput, tokenInput);
    setTestResult(res);
    setTestingConnection(false);

    if (res.success) {
      onUpdateTursoConfig({
        ...tursoConfig,
        url: urlInput.trim(),
        authToken: tokenInput.trim(),
        isConnected: true,
      });
    }
  };

  // Handle Run Migrations
  const handleRunMigrations = async () => {
    setMigrating(true);
    setMigrationMessage(null);
    const res = await runTursoMigrations(urlInput, tokenInput);
    setMigrationMessage(res.message);
    setMigrating(false);
  };

  // Handle Full Direct Sync
  const handleSyncToTurso = async () => {
    setSyncingCloud(true);
    setSyncMessage(null);
    const res = await syncAllLocalToTursoCloud(allData, urlInput, tokenInput);
    setSyncMessage(res.message);
    setSyncingCloud(false);
    if (res.success) {
      onUpdateTursoConfig({
        ...tursoConfig,
        lastSyncTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        isConnected: true,
      });
    }
  };

  // Handle Execute Custom SQL
  const handleExecuteSql = async () => {
    if (!sqlQuery.trim()) return;
    setQueryExecuting(true);
    const res = await executeTursoSql(sqlQuery, urlInput, tokenInput);
    setQueryResult(res);
    setQueryExecuting(false);
  };

  // Handle Copy Schema Script
  const handleCopySchema = () => {
    navigator.clipboard.writeText(TURSO_DDL_SCRIPT);
    setSchemaCopied(true);
    setTimeout(() => setSchemaCopied(false), 2500);
  };

  // Handle Download .sql file
  const handleDownloadSqlFile = () => {
    const element = document.createElement('a');
    const file = new Blob([TURSO_DDL_SCRIPT], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'nexhr_turso_schema.sql';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 p-6 rounded-2xl text-white shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-semibold tracking-wider text-emerald-300 uppercase">
              {isMy ? 'Turso Cloud ဒေတာဘေ့စ် ချိတ်ဆက်မှု' : 'Turso Edge Cloud Database (libSQL)'}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Direct Cloud Sync Active
            </span>
          </div>
          <h2 className="text-xl font-bold">
            {isMy
              ? 'Turso Database တိုက်ရိုက်သိမ်းဆည်းမှုနှင့် SQL Query ရေးသားချက်များ'
              : 'Turso Cloud Database Persistence & SQL Schema Engine'}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            {isMy
              ? 'စနစ်ဒေတာများ (ဝန်ထမ်း၊ ဌာန၊ ရုံးတက်၊ လစာ) အားလုံးကို Turso Cloud ဒေတာဘေ့စ်သို့ တိုက်ရိုက် သိမ်းဆည်းခြင်းနှင့် အချိန်နှင့်တပြေးညီ SQL Query Run ခြင်း။'
              : 'Direct cloud synchronization to Turso (libSQL at the edge). Includes complete DDL table creation scripts, real-time SQL query console, and instant data migration.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSyncToTurso}
            disabled={syncingCloud}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg transition-all transform active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncingCloud ? 'animate-spin' : ''}`} />
            <span>
              {syncingCloud
                ? isMy
                  ? 'ဒေတာများ ပို့ဆောင်နေပါသည်...'
                  : 'Syncing to Cloud...'
                : isMy
                ? 'Turso Cloud သို့ တိုက်ရိုက် Sync လုပ်မည်'
                : 'Direct Sync to Turso Cloud'}
            </span>
          </button>
        </div>
      </div>

      {/* Connection & Configuration Panel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-xs">
              {isMy ? 'Turso Database ချိတ်ဆက်မှု ဆက်တင်များ' : 'Turso Database Connection Settings'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-emerald-700">
              {isMy ? 'Cloud ချိတ်ဆက်မှု အသင့်ရှိပါသည်' : 'Ready for Cloud Direct Save'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Turso Database URL <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="libsql://your-db-org.turso.io or https://..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs focus:bg-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Example: <code className="text-slate-600">libsql://nexhr-enterprise-db.turso.io</code>
            </p>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Turso Auth Token (JWT) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type={showToken ? 'text' : 'password'}
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="eyJhbGciOiJFZERT..."
                className="w-full pl-9 pr-20 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs focus:bg-white focus:border-emerald-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-2.5 top-2 text-[11px] font-medium text-slate-500 hover:text-slate-800"
              >
                {showToken ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Generated via <code className="text-slate-600">turso db tokens create &lt;db-name&gt;</code>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
            <input
              type="checkbox"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
              className="rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="font-medium">
              {isMy
                ? 'အချက်အလက် ပြင်ဆင်/ထည့်သွင်းတိုင်း Turso Cloud သို့ အလိုအလျောက် တိုက်ရိုက် Save လုပ်မည်'
                : 'Direct Auto-Save: Automatically upsert changes to Turso Cloud on every action'}
            </span>
          </label>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveCredentials}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isMy ? 'ဆက်တင် သိမ်းမည်' : 'Save Config'}</span>
            </button>
            <button
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
              <span>{testingConnection ? 'Testing...' : 'Test Connection'}</span>
            </button>
            <button
              onClick={handleRunMigrations}
              disabled={migrating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <Layers className={`w-3.5 h-3.5 ${migrating ? 'animate-spin' : ''}`} />
              <span>{migrating ? 'Creating...' : 'Run Create Tables in Turso'}</span>
            </button>
          </div>
        </div>

        {/* Status Alerts */}
        {testResult && (
          <div
            className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
              testResult.success
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        {syncMessage && (
          <div className="p-3 rounded-lg text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{syncMessage}</span>
          </div>
        )}

        {migrationMessage && (
          <div className="p-3 rounded-lg text-xs bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-indigo-600" />
            <span>{migrationMessage}</span>
          </div>
        )}
      </div>

      {/* SQL Query Runner / Console */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-md p-5 text-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-xs text-slate-100">
              {isMy ? 'တိုက်ရိုက် SQL Query Run မည့် Console' : 'Interactive SQL Query Runner & Console'}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 mr-1">Presets:</span>
            {PRESET_QUERIES.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => setSqlQuery(preset.sql)}
                className="px-2 py-0.5 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors font-mono"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <textarea
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            rows={4}
            placeholder="Write SQL Query: SELECT * FROM employees WHERE status = 'active';"
            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-emerald-300 focus:outline-hidden focus:border-emerald-500 leading-relaxed resize-y"
          />
          <button
            onClick={handleExecuteSql}
            disabled={queryExecuting}
            className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all transform active:scale-95 disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${queryExecuting ? 'animate-spin' : ''}`} />
            <span>{queryExecuting ? 'Executing...' : 'Run Query'}</span>
          </button>
        </div>

        {/* Query Results Table */}
        {queryResult && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>
                Results:{' '}
                <strong className="text-emerald-400 font-mono">
                  {queryResult.rows.length} rows returned
                </strong>
                {queryResult.rowsAffected !== undefined && (
                  <span className="ml-2">({queryResult.rowsAffected} affected)</span>
                )}
              </span>
              <span className="font-mono text-[11px]">
                Execution: {queryResult.executionTimeMs}ms
              </span>
            </div>

            {queryResult.error ? (
              <div className="p-3 rounded-lg bg-rose-950/70 text-rose-300 border border-rose-800 text-xs font-mono">
                Error: {queryResult.error}
              </div>
            ) : queryResult.rows.length > 0 ? (
              <div className="max-h-64 overflow-auto rounded-lg border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 sticky top-0">
                      {queryResult.columns.map((col, idx) => (
                        <th key={idx} className="py-2 px-3 whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {queryResult.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-900/60 transition-colors">
                        {row.map((val, cIdx) => (
                          <td key={cIdx} className="py-1.5 px-3 whitespace-nowrap">
                            {val === null ? (
                              <span className="text-slate-500 italic">null</span>
                            ) : typeof val === 'object' ? (
                              JSON.stringify(val)
                            ) : (
                              String(val)
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-3 text-center text-xs text-slate-500 bg-slate-950 rounded-lg">
                Query executed successfully with 0 rows returned.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Complete Turso DDL Schema Script Viewer */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-xs">
              {isMy
                ? 'Turso Database အတွက် လိုအပ်သော Table အားလုံး၏ SQL Script အပြည့်အစုံ'
                : 'Turso Database Complete SQL DDL Schema Script (18 Tables)'}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isMy
                ? 'အောက်ပါ SQL Query ကို Turso CLI သို့မဟုတ် Web Shell တွင် တိုက်ရိုက် run ၍ Table များ ဆောက်လုပ်နိုင်ပါသည်။'
                : 'Contains all table definitions, data types, constraints, foreign keys, and indexes for full enterprise HRM compliance.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySchema}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              {schemaCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy SQL</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownloadSqlFile}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors border border-indigo-200"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .sql</span>
            </button>
          </div>
        </div>

        {/* SQL Viewer Box */}
        <div className="relative">
          <pre className="p-4 bg-slate-950 text-slate-200 font-mono text-[11px] rounded-xl overflow-x-auto max-h-96 leading-relaxed select-all">
            {TURSO_DDL_SCRIPT}
          </pre>
        </div>

        {/* Quick Turso Setup Guide */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-600 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Info className="w-4 h-4 text-indigo-600" />
            <span>Turso Quick Setup Guide (CLI Commands)</span>
          </div>
          <p className="text-[11px] text-slate-500">
            You can also provision and initialize your Turso Cloud database directly from your terminal:
          </p>
          <div className="p-2.5 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg space-y-1">
            <div># 1. Install Turso CLI</div>
            <div className="text-slate-300">curl -sSfL https://get.tur.so/install.sh | bash</div>
            <div className="pt-1"># 2. Authenticate & Create Database</div>
            <div className="text-slate-300">turso auth signup</div>
            <div className="text-slate-300">turso db create nexhr-enterprise-db</div>
            <div className="pt-1"># 3. Create Auth Token</div>
            <div className="text-slate-300">turso db tokens create nexhr-enterprise-db</div>
            <div className="pt-1"># 4. Pipe Schema into Turso</div>
            <div className="text-slate-300">turso db shell nexhr-enterprise-db &lt; nexhr_turso_schema.sql</div>
          </div>
        </div>
      </div>
    </div>
  );
};
