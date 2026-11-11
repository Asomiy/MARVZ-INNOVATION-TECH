import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, Sparkles, Building2, UserCheck } from 'lucide-react';
import { AdminUser } from '../../types/admin';

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
  const [role, setRole] = useState<'Super Admin' | 'Knowledge Editor' | 'Support Agent'>('Super Admin');
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
        body: JSON.stringify({ email, password, role }),
      });

      if (!res.ok) {
        throw new Error('Invalid credentials. Password is "marvz2026".');
      }

      const data = await res.json();
      localStorage.setItem('marvz_admin_token', data.token);
      localStorage.setItem('marvz_admin_user', JSON.stringify(data.user));
      onLoginSuccess(data.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRoleLogin = (chosenRole: 'Super Admin' | 'Knowledge Editor' | 'Support Agent', chosenEmail: string) => {
    setRole(chosenRole);
    setEmail(chosenEmail);
    setPassword('marvz2026');
  };

  return (
    <div className="min-h-screen bg-[#060a14] flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-red-600/30">
      
      {/* Background ambient red glow */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-[#090e1d] border border-red-500/30 rounded-3xl shadow-2xl p-8 relative z-10">
        
        {/* Logo & Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-red-500/50 p-2 shadow-xl shadow-red-950/50 mb-3">
            <img
              src="/assets/aistudio/Capture.JPG11_7f7b0bf9.JPG"
              alt="MARVZ Logo"
              className="w-full h-full object-contain filter drop-shadow"
            />
          </div>

          <h1 className="text-xl font-extrabold text-white tracking-tight">
            MARVZ AI Control Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise Chatbot Telemetry, Knowledge Training & Live Human Operations
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Security Access Key / Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Select Role Privileges
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-red-500"
            >
              <option value="Super Admin">Super Admin (Full Governance)</option>
              <option value="Knowledge Editor">Knowledge Editor (FAQs & Training)</option>
              <option value="Support Agent">Support Agent (Live Chats & Leads)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs shadow-lg shadow-red-950/60 transition-all"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Enter MARVZ AI Control Center</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Access Roles */}
        <div className="mt-6 pt-5 border-t border-slate-800 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 text-center">
            Quick 1-Click Role Login:
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-[10px]">
            <button
              onClick={() => handleQuickRoleLogin('Super Admin', 'admin@marvztech.com')}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-red-500/50 transition-colors font-mono text-center"
            >
              Super Admin
            </button>
            <button
              onClick={() => handleQuickRoleLogin('Knowledge Editor', 'editor@marvztech.com')}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-red-500/50 transition-colors font-mono text-center"
            >
              KB Editor
            </button>
            <button
              onClick={() => handleQuickRoleLogin('Support Agent', 'support@marvztech.com')}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-red-500/50 transition-colors font-mono text-center"
            >
              Live Agent
            </button>
          </div>
        </div>

        {/* Back to Website */}
        <div className="mt-5 text-center">
          <button
            onClick={onBackToWebsite}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            ← Return to MARVZ & INNOVATION TECH Website
          </button>
        </div>

      </div>

    </div>
  );
};
