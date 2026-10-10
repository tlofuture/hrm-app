import React, { useState } from 'react';
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
  LayoutDashboard,
  UserPlus,
  Users,
  Banknote,
  Calendar,
  Award,
  User,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { Language, UserRole, UserAccount } from '../../types';
import { translations } from '../../utils/translations';
import { getEmployeeAvatar } from '../../utils/imageUtils';

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
  onSyncFromTurso?: () => Promise<void>;
  isSyncingTurso?: boolean;
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
  onSyncFromTurso,
  isSyncingTurso,
}) => {
  const t = translations[language];
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'overview', label: t.navOverview, icon: LayoutDashboard },
    { id: 'recruitment', label: t.navRecruitment, icon: UserPlus },
    { id: 'onboarding', label: t.navOnboarding, icon: UserCheck },
    { id: 'employees', label: t.navEmployees, icon: Users },
    { id: 'payroll', label: t.navPayroll, icon: Banknote },
    { id: 'attendance', label: t.navAttendance, icon: Fingerprint },
    { id: 'leave', label: t.navLeave, icon: Calendar },
    { id: 'appraisal', label: t.navAppraisal, icon: Award },
    { id: 'ess', label: t.navSelfService, icon: User },
    { id: 'setup', label: t.navSetup, icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single Brand element */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab('overview')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-700 transition-colors">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-slate-900 leading-none group-hover:text-indigo-600 transition-colors">
                  NexHR
                </span>
                <span className="text-[11px] text-slate-500 font-medium mt-0.5">
                  {language === 'my' ? 'စီးပွားရေးလုပ်ငန်းသုံး HRM' : 'Enterprise HRM & ESS'}
                </span>
              </div>
            </button>
          </div>

          {/* Zone 3: Actions & Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
              title="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            {/* Biometric Quick Trigger */}
            <button
              onClick={onOpenBiometric}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200 shadow-2xs cursor-pointer"
              title="Open Biometric Scanner Terminal"
            >
              <Fingerprint className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span className="hidden sm:inline">{t.quickClockIn}</span>
            </button>

            {/* Automated Email Notifications Drawer */}
            <button
              onClick={onOpenEmailDrawer}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
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
              className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              title="Toggle Language (မြန်မာ / English)"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{language === 'en' ? 'MY' : 'EN'}</span>
            </button>

            {/* Turso Cloud Database Status & Sync Trigger */}
            <button
              onClick={() => {
                if (onSyncFromTurso) {
                  onSyncFromTurso();
                } else {
                  onSelectTab('setup');
                }
              }}
              disabled={isSyncingTurso}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              title="Turso Cloud Database: Click to Sync Live Data"
            >
              <Cloud className={`w-3.5 h-3.5 text-emerald-600 ${isSyncingTurso ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline font-mono font-bold text-[11px]">
                {isSyncingTurso ? 'Syncing...' : 'Turso DB'}
              </span>
              <span className={`w-1.5 h-1.5 rounded-full ${tursoConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            </button>

            {/* User Account Profile & Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 pl-2 pr-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all text-left"
              >
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase overflow-hidden shrink-0">
                  <img
                    src={getEmployeeAvatar({
                      avatar: currentUser?.avatar,
                      name: currentUser?.fullName,
                      role: currentUser?.role,
                      employeeId: currentUser?.employeeId,
                    })}
                    alt={currentUser?.fullName || 'User'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80';
                    }}
                  />
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
                          <img
                            src={getEmployeeAvatar({
                              avatar: u.avatar,
                              name: u.fullName,
                              role: u.role,
                              employeeId: u.employeeId,
                            })}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80';
                            }}
                          />
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

      {/* Primary Main Menu Navigation Bar */}
      {!isMobileMode && (
        <nav aria-label="Main Navigation" className="bg-slate-50/90 backdrop-blur-xs border-t border-slate-200 px-4 sm:px-6 lg:px-8 py-1.5 overflow-x-auto no-scrollbar shadow-2xs">
          <div className="max-w-7xl mx-auto flex items-center gap-1.5 min-w-max">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* Mobile Drawer Navigation (When hamburger button is clicked) */}
      {isMobileMenuOpen && !isMobileMode && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-3 shadow-lg max-h-[75vh] overflow-y-auto">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
            {language === 'my' ? 'လုပ်ငန်းစဉ် မီနူးများ' : 'All Enterprise Modules'}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className={`p-1 rounded-md ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};

