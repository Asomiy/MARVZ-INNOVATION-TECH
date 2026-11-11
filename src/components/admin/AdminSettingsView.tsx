import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  Sparkles,
  Sliders,
  Globe,
  Palette,
  Shield,
  Bot,
  Users,
  Building,
  RefreshCw,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { ControlCenterSettings } from '../../types/admin';

export const AdminSettingsView: React.FC = () => {
  const [settings, setSettings] = useState<ControlCenterSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings || saving) return;

    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setNotice('Settings saved successfully! Chatbot widget and API system prompt updated.');
        setTimeout(() => setNotice(null), 4000);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading Control Center settings...</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-red-500" />
            MARVZ AI Assistant Configuration & Brand Governance
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure chatbot identity, multilingual behavior, AI model parameters, and team permissions.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-semibold shadow-lg shadow-red-950/50 disabled:opacity-50 transition-all self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Changes...' : 'Save Configuration'}</span>
        </button>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        
        {/* Card 1: Chatbot Identity & Greeting */}
        <div className="p-6 rounded-2xl bg-[#080d1a] border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Bot className="w-4 h-4 text-red-500" />
            Chatbot Identity & Visitor Greetings
          </h3>

          <div>
            <label className="block font-semibold text-slate-300 uppercase mb-1">
              Chatbot Display Name
            </label>
            <input
              type="text"
              value={settings.chatbotName}
              onChange={(e) => setSettings({ ...settings, chatbotName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 uppercase mb-1">
              Welcome Greeting (English)
            </label>
            <textarea
              rows={2}
              value={settings.welcomeMessage}
              onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 uppercase mb-1">
              Welcome Greeting (Bengali / বাংলা)
            </label>
            <textarea
              rows={2}
              value={settings.welcomeMessageBn || ''}
              onChange={(e) => setSettings({ ...settings, welcomeMessageBn: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="pt-2 border-t border-slate-800/80">
            <h4 className="font-semibold text-slate-300 mb-2">Enabled Interactive Features</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableQuickReplies}
                  onChange={(e) => setSettings({ ...settings, enableQuickReplies: e.target.checked })}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-slate-900 border-slate-700"
                />
                <span>Display Quick Reply Suggestion Chips in Chat</span>
              </label>

              <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableLeadFormPrompt}
                  onChange={(e) => setSettings({ ...settings, enableLeadFormPrompt: e.target.checked })}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-slate-900 border-slate-700"
                />
                <span>Show "Request Consultation / Quote" Card after inquiries</span>
              </label>

              <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableHumanEscalation}
                  onChange={(e) => setSettings({ ...settings, enableHumanEscalation: e.target.checked })}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-slate-900 border-slate-700"
                />
                <span>Show Direct WhatsApp & Hotline Human Escalation Buttons</span>
              </label>
            </div>
          </div>
        </div>

        {/* Card 2: AI Engine & Multilingual Model Configuration */}
        <div className="p-6 rounded-2xl bg-[#080d1a] border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-red-500" />
            AI Model & Multilingual Parameters
          </h3>

          <div>
            <label className="block font-semibold text-slate-300 uppercase mb-1">
              Active Gemini Foundation Model
            </label>
            <select
              value={settings.aiModel}
              onChange={(e) => setSettings({ ...settings, aiModel: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:outline-none focus:border-red-500"
            >
              <option value="gemini-3.8-flash">gemini-3.8-flash (Recommended: Low latency, Multilingual)</option>
              <option value="gemini-2.5-pro">gemini-2.5-pro (Deep reasoning)</option>
              <option value="gemini-2.5-flash">gemini-2.5-flash (Standard)</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-300 uppercase">
                Model Temperature: {settings.temperature}
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {settings.temperature < 0.4 ? 'Strict & Deterministic' : 'Creative & Conversational'}
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={settings.temperature}
              onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
              className="w-full accent-red-600"
            />
          </div>

          <div className="pt-2 border-t border-slate-800/80">
            <h4 className="font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-blue-400" />
              Language Support Governance
            </h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableEnglish}
                  onChange={(e) => setSettings({ ...settings, enableEnglish: e.target.checked })}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-slate-900 border-slate-700"
                />
                <span>Enable Professional English Responses</span>
              </label>

              <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableBangla}
                  onChange={(e) => setSettings({ ...settings, enableBangla: e.target.checked })}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-slate-900 border-slate-700"
                />
                <span>Enable Native Bengali (বাংলা) & Banglish Auto-Detection</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 uppercase mb-1">
              Admin System Prompt Instruction Override (Optional)
            </label>
            <textarea
              rows={3}
              value={settings.systemInstructionOverride || ''}
              onChange={(e) => setSettings({ ...settings, systemInstructionOverride: e.target.value })}
              placeholder="e.g. Always emphasize our upcoming March 2026 Drone Aviation intake deadline..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-[11px] font-mono"
            />
          </div>
        </div>

        {/* Card 3: Brand Visuals & Contact Telemetry */}
        <div className="p-6 rounded-2xl bg-[#080d1a] border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Palette className="w-4 h-4 text-red-500" />
            Brand Theme & Official Company Contact Info
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 uppercase mb-1">
                Primary Brand Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.brandPrimaryColor}
                  onChange={(e) => setSettings({ ...settings, brandPrimaryColor: e.target.value })}
                  className="w-9 h-9 rounded-lg cursor-pointer bg-slate-900 border border-slate-700 p-0.5"
                />
                <input
                  type="text"
                  value={settings.brandPrimaryColor}
                  onChange={(e) => setSettings({ ...settings, brandPrimaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 uppercase mb-1">
                Accent Glow Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.brandAccentColor}
                  onChange={(e) => setSettings({ ...settings, brandAccentColor: e.target.value })}
                  className="w-9 h-9 rounded-lg cursor-pointer bg-slate-900 border border-slate-700 p-0.5"
                />
                <input
                  type="text"
                  value={settings.brandAccentColor}
                  onChange={(e) => setSettings({ ...settings, brandAccentColor: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block font-semibold text-slate-300 uppercase mb-1">
                Official Support Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 uppercase mb-1">
                  Hotline Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={settings.contactPhone}
                    onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase mb-1">
                  WhatsApp Hotline
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={settings.contactWhatsApp}
                    onChange={(e) => setSettings({ ...settings, contactWhatsApp: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 uppercase mb-1">
                Headquarters Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={settings.officeLocation}
                  onChange={(e) => setSettings({ ...settings, officeLocation: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Role-Based Admin Access & Security */}
        <div className="p-6 rounded-2xl bg-[#080d1a] border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-red-500" />
            Role-Based Admin Access & Permissions
          </h3>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Engr. Zamil Rahman</div>
                <div className="text-[10px] text-slate-400">admin@marvztech.com</div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 font-bold uppercase">
                Super Admin
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Admissions & Syllabus Lead</div>
                <div className="text-[10px] text-slate-400">editor@marvztech.com</div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 uppercase">
                Knowledge Editor
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Support Desk Dispatch</div>
                <div className="text-[10px] text-slate-400">support@marvztech.com</div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                Support Agent
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300">Security Credentials:</div>
            <p>Access requires verified session token. System PIN: <code className="text-red-400 font-mono">marvz2026</code></p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold shadow-md"
            >
              {saving ? 'Updating...' : 'Save Settings'}
            </button>
          </div>
        </div>

      </form>

    </div>
  );
};
