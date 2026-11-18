import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Check,
  X as XIcon,
} from 'lucide-react';
import { AdminUser } from '../../types/admin';
import {
  evaluatePasswordStrength,
  setAdminAuthSession,
} from '../../utils/adminApi';

type AuthMode = 'login' | 'setup' | 'forgot' | 'reset';

interface AdminLoginViewProps {
  onLoginSuccess: (user: AdminUser) => void;
  onBackToWebsite: () => void;
}

const PasswordStrengthChecklist: React.FC<{ password: string }> = ({ password }) => {
  const rules = evaluatePasswordStrength(password);
  const items = [
    { ok: rules.minLength, label: 'Minimum 8 characters' },
    { ok: rules.uppercase, label: 'Uppercase letter (A-Z)' },
    { ok: rules.lowercase, label: 'Lowercase letter (a-z)' },
    { ok: rules.number, label: 'Numeric digit (0-9)' },
    { ok: rules.special, label: 'Special character (!@#$...)' },
  ];

  return (
    <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-1.5">
      <div className="text-[10px] font-mono uppercase tracking-wider text-[#555555] font-semibold">
        Password Security Requirements
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
        {items.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-1.5 text-[11px] ${
              item.ok ? 'text-emerald-700 font-medium' : 'text-[#777777]'
            }`}
          >
            {item.ok ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <XIcon className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
            )}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  onLoginSuccess,
  onBackToWebsite,
}) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetTokenOrCode, setResetTokenOrCode] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [needsSetupNotice, setNeedsSetupNotice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Support direct password-reset deep links from email (?mode=reset&email=...&token=...)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlMode = params.get('mode');
      const urlEmail = params.get('email');
      const urlToken = params.get('token');
      if (urlMode === 'reset') {
        setMode('reset');
        if (urlEmail) setEmail(urlEmail);
        if (urlToken) setResetTokenOrCode(urlToken);
      } else if (urlMode === 'setup') {
        setMode('setup');
        if (urlEmail) setEmail(urlEmail);
      }
    } catch {
      // ignore URL parsing issues
    }
  }, []);

  const checkAccountSetupStatus = async (candidateEmail: string) => {
    const trimmed = candidateEmail.trim();
    if (!trimmed || !trimmed.includes('@')) {
      setNeedsSetupNotice(false);
      return;
    }
    try {
      const res = await fetch('/api/admin/auth/account-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      if (res.ok) {
        const data = await res.json();
        setNeedsSetupNotice(Boolean(data.needsPasswordSetup));
      }
    } catch {
      // ignore passive lookup failure
    }
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setErrorMsg('');
    setSuccessMsg('');
    setPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          rememberMe,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.code === 'PASSWORD_SETUP_REQUIRED' || data.needsPasswordSetup) {
          setNeedsSetupNotice(true);
          setMode('setup');
          setPassword('');
          setErrorMsg(
            data.error ||
              'No password has been set for this admin account yet. Create your password below.'
          );
          return;
        }
        throw new Error(data.error || 'Invalid credentials or inactive admin account.');
      }

      setAdminAuthSession({
        token: data.token,
        csrfToken: data.csrfToken,
        user: data.user,
        rememberMe,
      });
      onLoginSuccess(data.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFirstTimeSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }

    const strength = evaluatePasswordStrength(newPassword);
    if (!strength.isValid) {
      setErrorMsg('Please satisfy all 5 password security requirements before continuing.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/auth/setup-password', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          newPassword,
          confirmPassword,
          rememberMe,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to configure initial password.');
      }

      setAdminAuthSession({
        token: data.token,
        csrfToken: data.csrfToken,
        user: data.user,
        rememberMe,
      });
      onLoginSuccess(data.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to complete password setup.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/admin/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Unable to send password reset email.');
      }
      setMode('reset');
      setSuccessMsg(
        data.message ||
          'Verification code and reset link sent. Check your inbox and enter the code below.'
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Password recovery request failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }

    const strength = evaluatePasswordStrength(newPassword);
    if (!strength.isValid) {
      setErrorMsg('Please satisfy all 5 password security requirements.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          tokenOrCode: resetTokenOrCode.trim(),
          newPassword,
          confirmPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password.');
      }

      // Clean reset URL query parameters if present
      if (window.location.search) {
        window.history.replaceState(null, '', window.location.pathname);
      }

      setMode('login');
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setResetTokenOrCode('');
      setNeedsSetupNotice(false);
      setSuccessMsg(
        data.message || 'Password reset complete. You may now sign in with your new password.'
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  const subtitleByMode: Record<AuthMode, string> = {
    login: 'Corporate CMS, Internships, Training Finance, Dhaka Location & AI Operations',
    setup: 'First-Time Administrator Activation — Create a strong personal password',
    forgot: 'Password Recovery — Verify your registered administrator email address',
    reset: 'Verify Code & Set New Password — Prior active sessions will be invalidated',
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
        <div className="h-1.5 w-full bg-[#DC2626]" />
        <div className="p-7 sm:p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#181B20] border border-[#E5E7EB] p-2 shadow-xs mb-3 flex items-center justify-center">
              <img
                src="/assets/aistudio/Capture.JPG11_7f7b0bf9.JPG"
                alt="MARVZ Logo"
                className="w-full h-full object-contain"
              />
            </div>

            <h1 className="text-xl font-bold text-[#202124] tracking-tight">
              MARVZ Admin Panel & AI Control Center
            </h1>
            <p className="text-xs text-[#6B7280] mt-1">{subtitleByMode[mode]}</p>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div
              role="status"
              className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'login' && needsSetupNotice && (
            <div className="p-3 mb-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
              <div className="font-semibold">First-Time Password Setup Required</div>
              <p className="text-[11px] text-amber-800">
                This administrator account is active and ready, but does not have a password configured yet.
              </p>
              <button
                type="button"
                onClick={() => switchMode('setup')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#202124] hover:bg-[#30343B] text-white font-semibold text-[11px] transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Set Your Password</span>
              </button>
            </div>
          )}

          {/* MODE 1: SIGN IN */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#202124] uppercase tracking-wider mb-1">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#777777]" />
                  <input
                    type="email"
                    required
                    autoComplete="username"
                    placeholder="admin@marvztech.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (needsSetupNotice) setNeedsSetupNotice(false);
                    }}
                    onBlur={(e) => checkAccountSetupStatus(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] placeholder-[#777777] text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]/30 focus:bg-white focus:border-[#30343B]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#202124] uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#777777]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="Enter administrator password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] placeholder-[#777777] text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]/30 focus:bg-white focus:border-[#30343B]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-2.5 p-0.5 text-[#777777] hover:text-[#202124] rounded"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-0.5">
                <label className="inline-flex items-center gap-2 text-[#4B5563] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#D1D5DB] accent-[#DC2626]"
                  />
                  <span>Remember Me</span>
                </label>

                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="text-[#DC2626] hover:text-[#B91C1C] font-semibold transition-colors whitespace-nowrap"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#202124] hover:bg-[#DC2626] text-white font-semibold text-xs transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{loading ? 'Authenticating...' : 'Sign In to Admin Dashboard'}</span>
              </button>

              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => switchMode('setup')}
                  className="text-[11px] font-medium text-[#555555] hover:text-[#202124] underline underline-offset-2"
                >
                  First-time admin activation? Set Your Password
                </button>
              </div>
            </form>
          )}

          {/* MODE 2: FIRST-TIME PASSWORD SETUP */}
          {mode === 'setup' && (
            <form onSubmit={handleFirstTimeSetup} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#202124] uppercase tracking-wider mb-1">
                  Authorized Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#777777]" />
                  <input
                    type="email"
                    required
                    placeholder="admin@marvztech.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] placeholder-[#777777] text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]/30 focus:bg-white focus:border-[#30343B]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#202124] uppercase tracking-wider mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#777777]" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] placeholder-[#777777] text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]/30 focus:bg-white focus:border-[#30343B]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                    className="absolute right-3 top-2.5 p-0.5 text-[#777777] hover:text-[#202124]"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#202124] uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#777777]" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] placeholder-[#777777] text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]/30 focus:bg-white focus:border-[#30343B]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    className="absolute right-3 top-2.5 p-0.5 text-[#777777] hover:text-[#202124]"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <PasswordStrengthChecklist password={newPassword} />

              <label className="inline-flex items-center gap-2 text-[#4B5563] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#D1D5DB] accent-[#DC2626]"
                />
                <span>Keep me signed in on this device</span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold text-xs transition-colors disabled:opacity-50"
              >
                <KeyRound className="w-4 h-4" />
                <span>{loading ? 'Saving Password...' : 'Set Your Password & Sign In'}</span>
              </button>

              <button
                type="button"
                onClick={() => switchMode('login')}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-[#6B7280] hover:text-[#202124] font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
            </form>
          )}

          {/* MODE 3: FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#202124] uppercase tracking-wider mb-1">
                  Registered Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#777777]" />
                  <input
                    type="email"
                    required
                    placeholder="admin@marvztech.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] placeholder-[#777777] text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]/30 focus:bg-white focus:border-[#30343B]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#202124] hover:bg-[#DC2626] text-white font-semibold text-xs transition-colors disabled:opacity-50"
              >
                <Mail className="w-4 h-4" />
                <span>{loading ? 'Sending Verification...' : 'Send Password Reset Email'}</span>
              </button>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="inline-flex items-center gap-1.5 text-[#6B7280] hover:text-[#202124] font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('reset')}
                  className="text-[#DC2626] hover:text-[#B91C1C] font-semibold"
                >
                  Already have a code?
                </button>
              </div>
            </form>
          )}

          {/* MODE 4: RESET PASSWORD WITH VERIFICATION TOKEN OR CODE */}
          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#202124] uppercase tracking-wider mb-1">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#777777]" />
                  <input
                    type="email"
                    required
                    placeholder="admin@marvztech.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]/30 focus:bg-white focus:border-[#30343B]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#202124] uppercase tracking-wider mb-1">
                  Verification Code or Reset Token
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter 8-character code from email"
                  value={resetTokenOrCode}
                  onChange={(e) => setResetTokenOrCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]/30 focus:bg-white focus:border-[#30343B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#202124] uppercase tracking-wider mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#777777]" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    placeholder="Enter new strong password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]/30 focus:bg-white focus:border-[#30343B]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                    className="absolute right-3 top-2.5 p-0.5 text-[#777777] hover:text-[#202124]"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#202124] uppercase tracking-wider mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#777777]" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]/30 focus:bg-white focus:border-[#30343B]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    className="absolute right-3 top-2.5 p-0.5 text-[#777777] hover:text-[#202124]"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <PasswordStrengthChecklist password={newPassword} />

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold text-xs transition-colors disabled:opacity-50"
              >
                <KeyRound className="w-4 h-4" />
                <span>{loading ? 'Resetting Password...' : 'Reset Password & Continue'}</span>
              </button>

              <button
                type="button"
                onClick={() => switchMode('login')}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-[#6B7280] hover:text-[#202124] font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
            </form>
          )}

          <div className="mt-5 pt-4 border-t border-[#E5E7EB] text-[11px] text-[#777777] text-center">
            Protected administrative portal. Passwords are encrypted with bcrypt and verified server-side.
          </div>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={onBackToWebsite}
              className="text-xs text-[#777777] hover:text-[#202124] transition-colors"
            >
              ← Return to MARVZ & INNOVATION TECH Website
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
