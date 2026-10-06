import React from 'react';
import {
  Shield,
  Smartphone,
  Laptop,
  Globe,
  Bell,
  Fingerprint,
  UserCheck,
  Building2,
  Database,
  Cloud,
  ChevronDown,
} from 'lucide-react';
import { Language, UserRole, UserAccount } from '../../types';
import { translations } from '../../utils/translations';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  isMobileMode: boolean;
  onToggleMobileMode: (val: boolean) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenBiometric: () => void;
  onOpenEmailDrawer: () => void;
  unreadEmailCount: number;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  currentUser?: UserAccount;
  userAccounts?: UserAccount[];
  onSelectUser?: (user: UserAccount) => void;
  tursoConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  isMobileMode,
  onToggleMobileMode,
  language,
  onLanguageChange,
  onOpenBiometric,
  onOpenEmailDrawer,
  unreadEmailCount,
  activeTab,
  onSelectTab,
  currentUser,
  userAccounts = [],
  onSelectUser,
  tursoConnected = true,
}) => {
  const t = translations[language];
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single Brand element */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-slate-900 leading-none">
                NexHR
              </span>
              <span className="text-[11px] text-slate-500 font-medium mt-0.5">
                {language === 'my' ? 'စီးပွားရေးလုပ်ငန်းသုံး HRM' : 'Enterprise HRM & ESS'}
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Desktop view) */}
          {!isMobileMode && (
            <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-600">
              <button
                onClick={() => onSelectTab('overview')}
                className={`py-1 transition-colors ${
                  activeTab === 'overview'
                    ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                    : 'hover:text-slate-900'
                }`}
              >
                {t.navOverview}
              </button>
              {(currentRole === 'hr_admin' || currentRole === 'super_admin') && (
                <>
                  <button
                    onClick={() => onSelectTab('recruitment')}
                    className={`py-1 transition-colors ${
                      activeTab === 'recruitment'
                        ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    {t.navRecruitment}
                  </button>
                  <button
                    onClick={() => onSelectTab('onboarding')}
                    className={`py-1 transition-colors ${
                      activeTab === 'onboarding'
                        ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    {t.navOnboarding}
                  </button>
                  <button
                    onClick={() => onSelectTab('employees')}
                    className={`py-1 transition-colors ${
                      activeTab === 'employees'
                        ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    {t.navEmployees}
                  </button>
                  <button
                    onClick={() => onSelectTab('payroll')}
                    className={`py-1 transition-colors ${
                      activeTab === 'payroll'
                        ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    {t.navPayroll}
                  </button>
                </>
              )}
              <button
                onClick={() => onSelectTab('attendance')}
                className={`py-1 transition-colors ${
                  activeTab === 'attendance'
                    ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                    : 'hover:text-slate-900'
                }`}
              >
                {t.navAttendance}
              </button>
              <button
                onClick={() => onSelectTab('leave')}
                className={`py-1 transition-colors ${
                  activeTab === 'leave'
                    ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                    : 'hover:text-slate-900'
                }`}
              >
                {t.navLeave}
              </button>
              <button
                onClick={() => onSelectTab('appraisal')}
                className={`py-1 transition-colors ${
                  activeTab === 'appraisal'
                    ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                    : 'hover:text-slate-900'
                }`}
              >
                {t.navAppraisal}
              </button>
              <button
                onClick={() => onSelectTab('ess')}
                className={`py-1 transition-colors ${
                  activeTab === 'ess'
                    ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                    : 'hover:text-slate-900'
                }`}
              >
                {t.navSelfService}
              </button>
              {(currentRole === 'hr_admin' || currentRole === 'super_admin') && (
                <button
                  onClick={() => onSelectTab('setup')}
                  className={`py-1 transition-colors ${
                    activeTab === 'setup'
                      ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                      : 'hover:text-slate-900'
                  }`}
                >
                  {t.navSetup}
                </button>
              )}
            </nav>
          )}

          {/* Zone 3: Actions & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Biometric Quick Trigger */}
            <button
              onClick={onOpenBiometric}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200 shadow-sm"
              title="Open Biometric Scanner Terminal"
            >
              <Fingerprint className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span className="hidden sm:inline">{t.quickClockIn}</span>
            </button>

            {/* Automated Email Notifications Drawer */}
            <button
              onClick={onOpenEmailDrawer}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title={t.notifications}
              aria-label="View Automated Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadEmailCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                </span>
              )}
            </button>

            {/* Web Dashboard vs Mobile Mode Toggle */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
              <button
                onClick={() => onToggleMobileMode(false)}
                className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                  !isMobileMode
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Web Dashboard View"
              >
                <Laptop className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onToggleMobileMode(true)}
                className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                  isMobileMode
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Mobile App View"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Language Switcher */}
            <button
              onClick={() => onLanguageChange(language === 'en' ? 'my' : 'en')}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              title="Toggle Language (မြန်မာ / English)"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{language === 'en' ? 'MY' : 'EN'}</span>
            </button>

              {/* Turso Cloud Database Status */}
              <button
                onClick={() => onSelectTab('setup')}
                className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors shadow-2xs"
                title="Turso Cloud Database: Direct Cloud Sync Active"
              >
                <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden xl:inline font-mono font-bold text-[11px]">Turso DB</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </button>

              {/* User Account Profile & Switcher */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase overflow-hidden shrink-0">
                    {currentUser?.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.username}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      currentUser?.username?.slice(0, 2) || 'AD'
                    )}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[110px]">
                      {currentUser?.fullName || (currentRole === 'hr_admin' ? 'Daw Khin Thuzar' : 'Ko Thant Zin')}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium capitalize">
                      {currentRole === 'super_admin'
                        ? 'Super Admin'
                        : currentRole === 'hr_admin'
                        ? 'HR Admin'
                        : currentRole === 'manager'
                        ? 'Manager'
                        : 'Employee ESS'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        {language === 'my' ? 'လက်ရှိ အကောင့်' : 'Logged In User'}
                      </p>
                      <p className="text-xs font-bold text-slate-900">
                        @{currentUser?.username || 'admin'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {currentUser?.email || 'admin@nexhr.com'}
                      </p>
                    </div>

                    <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {language === 'my' ? 'အကောင့် ပြောင်းလဲရန်' : 'Switch User Account'}
                    </div>

                    <div className="max-h-56 overflow-y-auto space-y-0.5 px-1">
                      {userAccounts.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            if (onSelectUser) onSelectUser(u);
                            onRoleChange(u.role);
                            setIsUserMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors ${
                            currentUser?.id === u.id
                              ? 'bg-indigo-50 text-indigo-900 font-bold'
                              : 'text-slate-700 hover:bg-slate-50 font-medium'
                          }`}
                        >
                          <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0 overflow-hidden">
                            {u.avatar ? (
                              <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              u.username.slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <div className="flex-1 truncate">
                            <div className="truncate">{u.fullName}</div>
                            <div className="text-[10px] text-slate-400 truncate">
                              @{u.username} · {u.role}
                            </div>
                          </div>
                          {currentUser?.id === u.id && (
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="border-t border-slate-100 mt-2 pt-1 px-1">
                      <button
                        onClick={() => {
                          onSelectTab('setup');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full px-2.5 py-1.5 text-left text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>{language === 'my' ? 'အကောင့်များ စီမံခန့်ခွဲရန်' : 'User Accounts & Roles Setup'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
          </div>
        </div>
      </div>
    </header>
  );
};
