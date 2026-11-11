import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Sparkles,
  MessageSquare,
  FileCheck2,
  FileText,
  Settings,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Menu,
  X,
  Bell,
  RefreshCw,
  Search,
  Globe
} from 'lucide-react';
import { AdminUser, AdminOverviewStats } from '../../types/admin';
import { AdminDashboardView } from './AdminDashboardView';
import { KnowledgeBaseView } from './KnowledgeBaseView';
import { TrainingCenterView } from './TrainingCenterView';
import { LiveChatMonitoringView } from './LiveChatMonitoringView';
import { LeadManagementView } from './LeadManagementView';
import { DocumentIngestionView } from './DocumentIngestionView';
import { AdminSettingsView } from './AdminSettingsView';

interface AdminLayoutProps {
  user: AdminUser;
  onLogout: () => void;
  onBackToWebsite: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  user,
  onLogout,
  onBackToWebsite,
}) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<AdminOverviewStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/overview');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Telemetry Dashboard',
      icon: LayoutDashboard,
      badge: stats ? `${stats.totalConversations}` : undefined,
    },
    {
      id: 'kb',
      label: 'Knowledge Base',
      icon: BookOpen,
      badge: 'Manage',
    },
    {
      id: 'training',
      label: 'Training Center',
      icon: Sparkles,
      badge: stats?.unansweredQuestionsCount ? `${stats.unansweredQuestionsCount} new` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    {
      id: 'livechat',
      label: 'Live Chat Monitor',
      icon: MessageSquare,
      badge: stats?.activeConversations ? `${stats.activeConversations} live` : undefined,
      badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
    },
    {
      id: 'leads',
      label: 'Lead Management',
      icon: FileCheck2,
      badge: stats?.totalInquiries ? `${stats.totalInquiries}` : undefined,
    },
    {
      id: 'documents',
      label: 'Document Ingestion',
      icon: FileText,
      badge: 'PDF/DOC',
    },
    {
      id: 'settings',
      label: 'Settings & Identity',
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-[#060a14] text-slate-100 flex overflow-hidden font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-[#080d1a] border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 flex flex-col h-full">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3 pb-5 border-b border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-red-500/40 p-1 flex items-center justify-center shrink-0 shadow-md">
              <img
                src="/assets/aistudio/Capture.JPG11_7f7b0bf9.JPG"
                alt="MARVZ Logo"
                className="w-full h-full object-contain filter drop-shadow"
              />
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-wider flex items-center gap-1.5">
                MARVZ AI
                <span className="text-[9px] px-1.5 py-0.2 rounded font-mono uppercase bg-red-600/30 text-red-300 border border-red-500/40">
                  CTRL
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Control Center v2.6
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-5 space-y-1.5 flex-1 overflow-y-auto pr-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-950/50'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-red-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        isActive
                          ? 'bg-white/20 text-white border-white/30'
                          : item.badgeColor || 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Profile & Website Action Dock */}
          <div className="pt-4 border-t border-slate-800/80 space-y-3">
            
            <button
              onClick={onBackToWebsite}
              className="w-full flex items-center justify-center gap-2 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Back to Public Website</span>
            </button>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 font-bold text-xs shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-white truncate">{user.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{user.role}</div>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors"
                title="Logout from Admin Panel"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 px-6 bg-[#080d1a]/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
                Live Sync Engine Active
              </span>
            </div>
          </div>

          {/* Right Header Badges & Actions */}
          <div className="flex items-center gap-3">
            
            <button
              onClick={fetchStats}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition-colors"
              title="Refresh Telemetry"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">Sync Data</span>
            </button>

            <button
              onClick={() => setActiveTab('training')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/50 border border-red-500/40 text-red-300 hover:bg-red-900/60 text-xs font-semibold transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-red-400" />
              <span>AI Playground</span>
            </button>

            <button
              onClick={onBackToWebsite}
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
            >
              <span>Live Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

        </header>

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && (
            <AdminDashboardView
              stats={stats}
              loading={statsLoading}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'kb' && (
            <KnowledgeBaseView onRefreshStats={fetchStats} />
          )}

          {activeTab === 'training' && (
            <TrainingCenterView onKnowledgeUpdated={fetchStats} />
          )}

          {activeTab === 'livechat' && (
            <LiveChatMonitoringView />
          )}

          {activeTab === 'leads' && (
            <LeadManagementView />
          )}

          {activeTab === 'documents' && (
            <DocumentIngestionView onKnowledgeUpdated={fetchStats} />
          )}

          {activeTab === 'settings' && (
            <AdminSettingsView />
          )}
        </main>

      </div>

    </div>
  );
};
