import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  Sliders,
  Globe,
  Shield,
  Bot,
  UserCheck,
  KeyRound,
  Plus,
  Trash2,
  LogOut,
  X,
} from 'lucide-react';
import { AdminRole, AdminUser, ControlCenterSettings } from '../../types/admin';
import { adminFetch } from '../../utils/adminApi';

interface AdminSettingsViewProps {
  currentUser: AdminUser;
  onUserUpdated: (user: AdminUser) => void;
  onLogout: () => void;
}

export const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({
  currentUser,
  onUserUpdated,
  onLogout,
}) => {
  const [settings, setSettings] = useState<ControlCenterSettings | null>(null);
  const [teamUsers, setTeamUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile state
  const [profileForm, setProfileForm] = useState({
    name: currentUser.name,
    phone: currentUser.phone || '',
    department: currentUser.department || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Add admin user modal
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    role: 'Content Manager' as AdminRole,
    department: 'Operations',
    password: '',
  });

  const showNotice = (type: 'success' | 'error', text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 4500);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [setRes, usrRes] = await Promise.all([
        adminFetch('/api/admin/settings'),
        adminFetch('/api/admin/users'),
      ]);
      if (setRes.ok) {
        const sd = await setRes.json();
        setSettings(sd.settings);
      }
      if (usrRes.ok) {
        const ud = await usrRes.json();
        setTeamUsers(ud.users || []);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings || saving) return;

    setSaving(true);
    try {
      const res = await adminFetch('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        showNotice('success', 'AI Assistant configuration saved and applied to live chatbot.');
      }
    } catch {
      showNotice('error', 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await adminFetch('/api/admin/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile.');
      localStorage.setItem('marvz_admin_user', JSON.stringify(data.user));
      onUserUpdated(data.user);
      setTeamUsers((prev) => prev.map((u) => (u.id === data.user.id ? data.user : u)));
      showNotice('success', 'Admin profile updated.');
    } catch (err: any) {
      showNotice('error', err.message || 'Profile update failed.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showNotice('error', 'New password and confirmation do not match.');
      return;
    }
    setChangingPassword(true);
    try {
      const res = await adminFetch('/api/admin/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showNotice('success', 'Account password changed successfully.');
    } catch (err: any) {
      showNotice('error', err.message || 'Password change failed.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminFetch('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(newUserForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create admin user.');
      setTeamUsers((prev) => [...prev, data.user]);
      setIsAddUserOpen(false);
      setNewUserForm({
        name: '',
        email: '',
        role: 'Content Manager',
        department: 'Operations',
        password: '',
      });
      showNotice('success', `Created admin account for ${data.user.email}.`);
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to create user.');
    }
  };

  const handleUpdateUserRole = async (id: string, role: AdminRole) => {
    try {
      const res = await adminFetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update denied.');
      setTeamUsers((prev) => prev.map((u) => (u.id === id ? data.user : u)));
      showNotice('success', 'Updated team member role.');
    } catch (err: any) {
      showNotice('error', err.message || 'Role update failed.');
    }
  };

  const handleDeleteUser = async (id: string, email: string) => {
    if (!confirm(`Delete admin account "${email}"?`)) return;
    try {
      const res = await adminFetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete denied.');
      setTeamUsers((prev) => prev.filter((u) => u.id !== id));
      showNotice('success', `Removed admin account ${email}.`);
    } catch (err: any) {
      showNotice('error', err.message || 'Delete failed.');
    }
  };

  if (loading || !settings) {
    return (
      <div className="p-8 text-center text-xs text-[#777777]">
        Loading Admin & AI Settings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <h2 className="text-xl font-bold text-[#202124] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#30343B]" />
            Admin Account Security, RBAC Users & AI Configuration
          </h2>
          <p className="text-xs text-[#777777] mt-1">
            Manage your profile, update your password, govern team roles, and fine-tune MARVZ AI parameters.
          </p>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-red-50 border border-[#E5E7EB] hover:border-red-200 text-[#202124] hover:text-red-700 text-xs font-semibold transition-colors self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out Session</span>
        </button>
      </div>

      {notice && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            notice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notice.text}</span>
          </div>
          <button onClick={() => setNotice(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Row 1: Profile & Change Password */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* Profile Card */}
        <form
          onSubmit={handleSaveProfile}
          className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#202124] flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#30343B]" />
              My Admin Profile
            </h3>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-[#F3F4F6] text-[#30343B] border border-[#E5E7EB] uppercase">
              {currentUser.role}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#202124] uppercase mb-1">Full Name</label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#202124] uppercase mb-1">Account Email</label>
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#777777] cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#202124] uppercase mb-1">Phone</label>
              <input
                type="text"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#202124] uppercase mb-1">Department</label>
              <input
                type="text"
                value={profileForm.department}
                onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#30343B] hover:bg-[#202124] text-white font-semibold transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingProfile ? 'Saving...' : 'Update Profile'}</span>
            </button>
          </div>
        </form>

        {/* Change Password Card */}
        <form
          onSubmit={handleChangePassword}
          className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs space-y-4"
        >
          <h3 className="text-sm font-bold text-[#202124] flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#30343B]" />
            Change Account Password
          </h3>

          <div>
            <label className="block font-semibold text-[#202124] uppercase mb-1">Current Password *</label>
            <input
              type="password"
              required
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#202124] uppercase mb-1">
                New Password (min 6 chars) *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#202124] uppercase mb-1">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={changingPassword}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#30343B] hover:bg-[#202124] text-white font-semibold transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{changingPassword ? 'Updating...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Row 2: Role-Based Team Access */}
      <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs space-y-4 text-xs">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#202124] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#30343B]" />
              Role-Based Admin Team Governance ({teamUsers.length})
            </h3>
            <p className="text-[#777777] text-[11px] mt-0.5">
              Only Super Admins can add, modify roles, or remove team members.
            </p>
          </div>

          {currentUser.role === 'Super Admin' && (
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#30343B] hover:bg-[#202124] text-white font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Admin User</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {teamUsers.map((u) => (
            <div
              key={u.id}
              className="p-4 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="font-bold text-[#202124] truncate">{u.name}</div>
                <div className="text-[11px] text-[#777777] truncate">{u.email}</div>
                <div className="text-[10px] text-[#777777] font-mono truncate">{u.department}</div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <select
                  disabled={currentUser.role !== 'Super Admin' || u.id === currentUser.id}
                  value={u.role}
                  onChange={(e) => handleUpdateUserRole(u.id, e.target.value as AdminRole)}
                  className="bg-white border border-[#E5E7EB] text-[#202124] rounded-lg px-2 py-1 text-[11px] disabled:opacity-60"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Content Manager">Content Manager</option>
                  <option value="HR & Training Coordinator">HR & Training Coordinator</option>
                  <option value="Knowledge Editor">Knowledge Editor</option>
                  <option value="Support Agent">Support Agent</option>
                </select>

                {currentUser.role === 'Super Admin' && u.id !== currentUser.id && (
                  <button
                    onClick={() => handleDeleteUser(u.id, u.email)}
                    className="p-1.5 rounded-lg bg-white hover:bg-red-50 border border-[#E5E7EB] text-[#777777] hover:text-red-700 transition-colors"
                    title="Delete User"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 3: AI Chatbot Identity & Model Settings */}
      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#202124] flex items-center gap-2">
            <Bot className="w-4 h-4 text-[#30343B]" />
            Chatbot Identity & Greetings
          </h3>

          <div>
            <label className="block font-semibold text-[#202124] uppercase mb-1">Chatbot Display Name</label>
            <input
              type="text"
              value={settings.chatbotName}
              onChange={(e) => setSettings({ ...settings, chatbotName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#202124] uppercase mb-1">Welcome Greeting (English)</label>
            <textarea
              rows={2}
              value={settings.welcomeMessage}
              onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#202124] uppercase mb-1">Welcome Greeting (Bengali)</label>
            <textarea
              rows={2}
              value={settings.welcomeMessageBn || ''}
              onChange={(e) => setSettings({ ...settings, welcomeMessageBn: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-[#E5E7EB]">
            <label className="flex items-center gap-2.5 text-[#202124] cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableQuickReplies}
                onChange={(e) => setSettings({ ...settings, enableQuickReplies: e.target.checked })}
                className="w-4 h-4 rounded accent-[#30343B]"
              />
              <span>Display Quick Reply Suggestion Chips in Chat</span>
            </label>
            <label className="flex items-center gap-2.5 text-[#202124] cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableLeadFormPrompt}
                onChange={(e) => setSettings({ ...settings, enableLeadFormPrompt: e.target.checked })}
                className="w-4 h-4 rounded accent-[#30343B]"
              />
              <span>Show Consultation CTA Card after inquiries</span>
            </label>
            <label className="flex items-center gap-2.5 text-[#202124] cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableHumanEscalation}
                onChange={(e) => setSettings({ ...settings, enableHumanEscalation: e.target.checked })}
                className="w-4 h-4 rounded accent-[#30343B]"
              />
              <span>Enable Human Escalation Buttons</span>
            </label>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#202124] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#30343B]" />
            AI Model & Multilingual Governance
          </h3>

          <div>
            <label className="block font-semibold text-[#202124] uppercase mb-1">Active Gemini Model</label>
            <select
              value={settings.aiModel}
              onChange={(e) => setSettings({ ...settings, aiModel: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] font-mono focus:outline-none focus:bg-white focus:border-[#30343B]"
            >
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra-Fast Recommended)</option>
              <option value="gemini-4-hydrogen">gemini-4-hydrogen (Balanced Speed &amp; Depth)</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="font-semibold text-[#202124] uppercase">
                Temperature: {settings.temperature}
              </label>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={settings.temperature}
              onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
              className="w-full accent-[#30343B]"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-[#E5E7EB]">
            <div className="font-semibold text-[#202124] flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-[#30343B]" /> Languages
            </div>
            <label className="flex items-center gap-2 text-[#202124] cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableEnglish}
                onChange={(e) => setSettings({ ...settings, enableEnglish: e.target.checked })}
                className="w-4 h-4 rounded accent-[#30343B]"
              />
              <span>English Support</span>
            </label>
            <label className="flex items-center gap-2 text-[#202124] cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableBangla}
                onChange={(e) => setSettings({ ...settings, enableBangla: e.target.checked })}
                className="w-4 h-4 rounded accent-[#30343B]"
              />
              <span>Bengali (বাংলা) & Banglish Auto-Detection</span>
            </label>
          </div>

          <div>
            <label className="block font-semibold text-[#202124] uppercase mb-1">
              System Instruction Override
            </label>
            <textarea
              rows={2}
              value={settings.systemInstructionOverride || ''}
              onChange={(e) =>
                setSettings({ ...settings, systemInstructionOverride: e.target.value })
              }
              className="w-full px-3.5 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] font-mono text-[11px] focus:outline-none focus:bg-white focus:border-[#30343B]"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#30343B] hover:bg-[#202124] text-white font-semibold disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save AI Settings'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Add Admin User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl p-6 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] mb-4">
              <h3 className="text-base font-bold text-[#202124]">Create Team Admin Account</h3>
              <button onClick={() => setIsAddUserOpen(false)} className="text-[#777777] hover:text-[#202124]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-[#202124] uppercase mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#202124] uppercase mb-1">Work Email *</label>
                <input
                  type="email"
                  required
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#202124] uppercase mb-1">Role *</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as AdminRole })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                  >
                    <option value="Content Manager">Content Manager</option>
                    <option value="HR & Training Coordinator">HR & Training Coordinator</option>
                    <option value="Knowledge Editor">Knowledge Editor</option>
                    <option value="Support Agent">Support Agent</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#202124] uppercase mb-1">Department</label>
                  <input
                    type="text"
                    value={newUserForm.department}
                    onChange={(e) => setNewUserForm({ ...newUserForm, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-[#202124] uppercase mb-1">
                  Initial Password (min 6 chars) *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                />
              </div>
              <div className="pt-3 border-t border-[#E5E7EB] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#202124] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#30343B] hover:bg-[#202124] text-white font-semibold"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
