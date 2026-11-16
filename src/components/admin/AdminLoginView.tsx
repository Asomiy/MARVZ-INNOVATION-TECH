import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail } from 'lucide-react';
import { AdminRole, AdminUser } from '../../types/admin';

interface AdminLoginViewProps {
  onLoginSuccess: (user: AdminUser) => void;
  onBackToWebsite: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  onLoginSuccess,
  onBackToWebsite,
}) => {
  const [email, setEmail] = useState('admin@marvztech.com');
  const [password, setPassword] = useState('marvz2026');
  const [role, setRole] = useState<AdminRole>('Super Admin');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials. Default password is "marvz2026".');
      }

      localStorage.setItem('marvz_admin_token', data.token);
      localStorage.setItem('marvz_admin_user', JSON.stringify(data.user));
      onLoginSuccess(data.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRoleSelect = (chosenRole: AdminRole, chosenEmail: string) => {
    setRole(chosenRole);
    setEmail(chosenEmail);
    setPassword('marvz2026');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-2xl shadow-md p-8">
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
          <p className="text-xs text-[#777777] mt-1">
            Corporate CMS, Internships, Training Finance, Dhaka Location & AI Operations
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
            {errorMsg}
          </div>
        )}

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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] placeholder-[#777777] text-xs focus:outline-none focus:bg-white focus:border-[#30343B]"
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
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] placeholder-[#777777] text-xs focus:outline-none focus:bg-white focus:border-[#30343B]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#202124] uppercase tracking-wider mb-1">
              Account Role Reference
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as AdminRole)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] text-xs focus:outline-none focus:bg-white focus:border-[#30343B]"
            >
              <option value="Super Admin">Super Admin (Full Governance)</option>
              <option value="Content Manager">Content Manager (Website CMS & KB)</option>
              <option value="HR & Training Coordinator">HR & Training Coordinator</option>
              <option value="Support Agent">Support Agent (Inbox & Live Chats)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#30343B] hover:bg-[#202124] text-white font-semibold text-xs transition-colors disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Sign In to Admin Dashboard'}</span>
          </button>
        </form>

        {/* Quick Demo Accounts */}
        <div className="mt-6 pt-5 border-t border-[#E5E7EB] space-y-2">
          <div className="text-[11px] font-medium text-[#777777] text-center">
            Quick Role Presets (Password: <span className="font-mono text-[#202124] font-semibold">marvz2026</span>):
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            <button
              type="button"
              onClick={() => handleQuickRoleSelect('Super Admin', 'admin@marvztech.com')}
              className="p-2 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#202124] border border-[#E5E7EB] transition-colors font-mono text-center"
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickRoleSelect('Content Manager', 'editor@marvztech.com')}
              className="p-2 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#202124] border border-[#E5E7EB] transition-colors font-mono text-center"
            >
              Content Manager
            </button>
            <button
              type="button"
              onClick={() => handleQuickRoleSelect('HR & Training Coordinator', 'coordinator@marvztech.com')}
              className="p-2 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#202124] border border-[#E5E7EB] transition-colors font-mono text-center"
            >
              HR & Training
            </button>
            <button
              type="button"
              onClick={() => handleQuickRoleSelect('Support Agent', 'support@marvztech.com')}
              className="p-2 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#202124] border border-[#E5E7EB] transition-colors font-mono text-center"
            >
              Support Agent
            </button>
          </div>
        </div>

        <div className="mt-5 text-center">
          <button
            onClick={onBackToWebsite}
            className="text-xs text-[#777777] hover:text-[#202124] transition-colors"
          >
            ← Return to MARVZ & INNOVATION TECH Website
          </button>
        </div>
      </div>
    </div>
  );
};
