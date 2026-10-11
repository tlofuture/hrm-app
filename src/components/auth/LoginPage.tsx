import React, { useState } from 'react';
import {
  Building2,
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Fingerprint,
  Globe,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Shield,
  Clock,
} from 'lucide-react';
import { UserAccount, Language } from '../../types';
import { getEmployeeAvatar, handleAvatarError } from '../../utils/imageUtils';

interface LoginPageProps {
  userAccounts: UserAccount[];
  onLogin: (user: UserAccount) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  userAccounts,
  onLogin,
  language,
  onLanguageChange,
}) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const identifier = usernameOrEmail.trim().toLowerCase();
    if (!identifier) {
      setErrorMessage(
        language === 'my'
          ? 'အသုံးပြုသူအမည် သို့မဟုတ် အီးမေးလ် ထည့်သွင်းပါ'
          : 'Please enter your username or corporate email.'
      );
      return;
    }

    if (!password) {
      setErrorMessage(
        language === 'my'
          ? 'လျှို့ဝှက်နံပါတ် (Password) ထည့်သွင်းပါ'
          : 'Please enter your account password.'
      );
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // Find matching user by username, employee ID (User ID), account ID, or corporate email
      const matchedUser = userAccounts.find(
        (u) =>
          u.username.toLowerCase() === identifier ||
          (u.employeeId && u.employeeId.toLowerCase() === identifier) ||
          u.id.toLowerCase() === identifier ||
          u.email.toLowerCase() === identifier
      );

      if (!matchedUser) {
        setIsSubmitting(false);
        setErrorMessage(
          language === 'my'
            ? 'အသုံးပြုသူ User ID သို့မဟုတ် အကောင့် မတွေ့ရှိပါ။ အမည် သို့မဟုတ် Employee ID ပြန်လည်စစ်ဆေးပါ။'
            : 'Invalid User ID or Account name. Please check your credentials.'
        );
        return;
      }

      if (matchedUser.status === 'suspended') {
        setIsSubmitting(false);
        setErrorMessage(
          language === 'my'
            ? 'ဤအကောင့်အား ခေတ္တရပ်ဆိုင်းထားပါသည်။ HR သို့ ဆက်သွယ်ပါ။'
            : 'This user account has been suspended. Please contact Human Resources.'
        );
        return;
      }

      // Password verification: checks stored password or demo fallbacks
      const expectedPassword = (matchedUser.password || 'admin').trim();
      const enteredPassword = password.trim();
      const isPasswordValid =
        enteredPassword === expectedPassword ||
        (matchedUser.role === 'super_admin' && (enteredPassword === 'admin' || enteredPassword === 'admin123')) ||
        (matchedUser.role === 'hr_admin' && (enteredPassword === 'hr' || enteredPassword === 'hr123')) ||
        (matchedUser.role === 'employee' && (enteredPassword === 'emp' || enteredPassword === 'emp123')) ||
        (matchedUser.role === 'manager' && (enteredPassword === 'mgr' || enteredPassword === 'mgr123')) ||
        enteredPassword === 'password' ||
        enteredPassword === '123456';

      if (!isPasswordValid) {
        setIsSubmitting(false);
        setErrorMessage(
          language === 'my'
            ? `လျှို့ဝှက်နံပါတ် မှားယွင်းနေပါသည်။ (အကြံပြုချက်: "${expectedPassword}" ကို အသုံးပြုပါ)`
            : `Incorrect password for ${matchedUser.fullName}. (Hint: password is "${expectedPassword}").`
        );
        return;
      }

      setIsSubmitting(false);
      onLogin(matchedUser);
    }, 350);
  };

  const handleQuickLogin = (user: UserAccount) => {
    setUsernameOrEmail(user.username);
    setPassword(user.password || 'admin');
    setErrorMessage(null);
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onLogin(user);
    }, 250);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            Super Admin
          </span>
        );
      case 'hr_admin':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            HR Admin
          </span>
        );
      case 'manager':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            Manager
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Staff (ESS)
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-800 relative overflow-hidden select-none">
      {/* Background Decorative Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-200/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Top Bar: Brand & Language Toggle */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex items-center justify-between border-b border-slate-200/70 bg-white/60 backdrop-blur-sm sm:bg-transparent sm:border-b-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/25 border border-indigo-500">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900">NexHR</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                Enterprise
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {language === 'my'
                ? 'စီးပွားရေးလုပ်ငန်းသုံး ဝန်ထမ်းစီမံခန့်ခွဲမှုစနစ်'
                : 'Human Resource Management & Biometrics'}
            </p>
          </div>
        </div>

        {/* Language & Security status */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onLanguageChange(language === 'en' ? 'my' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 shadow-sm text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            title="Toggle Language"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-600" />
            <span>{language === 'en' ? 'မြန်မာစာ' : 'English'}</span>
          </button>
        </div>
      </header>

      {/* Main Login Workspace */}
      <main className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Form Card */}
          <div className="lg:col-span-5 max-w-md w-full mx-auto">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 relative">
              {/* Header */}
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/70 text-[11px] font-semibold mb-3">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{language === 'my' ? 'လုံခြုံစိတ်ချရသော စနစ်ဝင်ပေါက်' : 'Authorized Access Portal'}</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {language === 'my' ? 'စနစ်သို့ ဝင်ရောက်ပါ' : 'Sign in to NexHR'}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  {language === 'my'
                    ? 'သင်၏ ဝန်ထမ်းအကောင့် အချက်အလက်များဖြင့် ဝင်ရောက်ပါ'
                    : 'Enter your corporate credentials to access your workspace.'}
                </p>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{errorMessage}</div>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username / User ID / Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {language === 'my' ? 'အသုံးပြုသူ User ID / အမည် / အီးမေးလ်' : 'User ID / Username / Corporate Email'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      placeholder="e.g. admin or NX-1001 or khinthuzar"
                      autoComplete="username"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      {language === 'my' ? 'လျှို့ဝှက်နံပါတ် (Password)' : 'Password'}
                    </label>
                    <span className="text-[11px] text-slate-400">
                      e.g. <code className="text-indigo-600 font-mono font-semibold">admin</code> / <code className="text-indigo-600 font-mono font-semibold">hr</code>
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Biometric Notice */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-900">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 bg-white text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-medium">{language === 'my' ? 'မှတ်သားထားပါ' : 'Remember me'}</span>
                  </label>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                    <Fingerprint className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'my' ? 'ဇီဝမက်ထရစ် တိုက်ဆိုင်စစ်ဆေးမှု' : 'Biometric Link Active'}</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{language === 'my' ? 'စနစ်သို့ ဝင်ရောက်မည်' : 'Sign In to Workspace'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Security Footnote */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 font-medium">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span>SOC2 Type II &amp; ISO 27001</span>
                </span>
                <span className="font-mono text-slate-400 font-semibold">v2.4 Enterprise</span>
              </div>
            </div>
          </div>

          {/* Right Column: 1-Click Fast Role Switcher & System Overview */}
          <div className="lg:col-span-7 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h2 className="text-base font-bold text-slate-900">
                  {language === 'my'
                    ? 'စမ်းသပ်ရန် Demo အကောင့်များ (1-Click Quick Login)'
                    : 'Instant Demo Profiles (1-Click Sign In)'}
                </h2>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {language === 'my'
                  ? 'အောက်ပါအကောင့်များမှ မိမိစမ်းသပ်လိုသော ကဏ္ဍ (Super Admin, HR, Employee, Manager) ကို ချက်ချင်း ရွေးချယ်ဝင်ရောက်နိုင်ပါသည်:'
                  : 'Click any enterprise profile card below to immediately authenticate and preview corresponding role permissions and views:'}
              </p>
            </div>

            {/* Quick Demo Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {userAccounts.map((user) => {
                return (
                  <div
                    key={user.id}
                    onClick={() => handleQuickLogin(user)}
                    className="p-4 rounded-xl bg-white hover:bg-indigo-50/40 border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer group shadow-sm hover:shadow-md text-left flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={getEmployeeAvatar({
                              avatar: user.avatar,
                              name: user.fullName,
                              role: user.role,
                              employeeId: user.employeeId,
                            })}
                            alt={user.fullName}
                            referrerPolicy="no-referrer"
                            onError={(e) => handleAvatarError(e, { name: user.fullName })}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-slate-100 shadow-sm"
                          />
                          <div>
                            <div className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {user.fullName}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              @{user.username}
                            </div>
                          </div>
                        </div>
                        {getRoleBadge(user.role)}
                      </div>

                      <div className="space-y-1 text-[11px] text-slate-500 border-t border-slate-100 pt-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Department:</span>
                          <span className="text-slate-700 font-medium">{user.department || 'All Corporate'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Password:</span>
                          <span className="font-mono text-indigo-700 bg-indigo-50/80 px-1.5 py-0.5 rounded border border-indigo-200/60 font-semibold">
                            {user.password || 'admin'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600 group-hover:text-indigo-700">
                      <span>Sign In as {user.role.replace('_', ' ')}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Security Feature Callouts */}
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Real-Time Audit Logging</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <KeyRound className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Role-Based Access Control</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <Fingerprint className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Multi-Factor Biometrics</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white/40 backdrop-blur-sm">
        NexHR Enterprise Management System · Continuous Audit Trail &amp; Biometric Security · All Rights Reserved © 2026
      </footer>
    </div>
  );
};
