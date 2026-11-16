import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Globe,
  Briefcase,
  GraduationCap,
  Mail,
  MapPin,
  FileCheck2,
  BookOpen,
  Sparkles,
  MessageSquare,
  FileText,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  RefreshCw,
} from 'lucide-react';
import { AdminUser, AdminOverviewStats } from '../../types/admin';
import { adminFetch } from '../../utils/adminApi';
import { AdminDashboardView } from './AdminDashboardView';
import { WebsiteContentView } from './WebsiteContentView';
import { InternshipManagementView } from './InternshipManagementView';
import { TrainingManagementView } from './TrainingManagementView';
import { ContactInquiryView } from './ContactInquiryView';
import { LocationManagementView } from './LocationManagementView';
import { KnowledgeBaseView } from './KnowledgeBaseView';
import { TrainingCenterView } from './TrainingCenterView';
import { LiveChatMonitoringView } from './LiveChatMonitoringView';
import { LeadManagementView } from './LeadManagementView';
import { DocumentIngestionView } from './DocumentIngestionView';
import { AdminSettingsView } from './AdminSettingsView';

interface AdminLayoutProps {
  user: AdminUser;
  onUserUpdated: (user: AdminUser) => void;
  onLogout: () => void;
  onBackToWebsite: () => void;
  onSiteDataChanged: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  user,
  onUserUpdated,
  onLogout,
  onBackToWebsite,
  onSiteDataChanged,
}) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<AdminOverviewStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await adminFetch('/api/admin/overview');
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
    const interval = setInterval(fetchStats, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOutClick = async () => {
    try {
      await adminFetch('/api/admin/auth/logout', { method: 'POST' });
    } catch {
      // ignore network errors on logout
    }
    onLogout();
  };

  const coreNavItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'content',
      label: 'Website Content',
      icon: Globe,
    },
    {
      id: 'internships',
      label: 'Internships',
      icon: Briefcase,
      badge: stats?.pendingInternshipsCount ? `${stats.pendingInternshipsCount}` : undefined,
      badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
    },
    {
      id: 'programs',
      label: 'Training & Fees',
      icon: GraduationCap,
      badge: stats?.trainingRegistrationsCount ? `${stats.trainingRegistrationsCount}` : undefined,
    },
    {
      id: 'contacts',
      label: 'Contact Inbox',
      icon: Mail,
      badge: stats?.unreadContactMessagesCount ? `${stats.unreadContactMessagesCount} new` : undefined,
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      id: 'leads',
      label: 'CRM Leads',
      icon: FileCheck2,
      badge: stats?.totalInquiries ? `${stats.totalInquiries}` : undefined,
    },
    {
      id: 'location',
      label: 'Office Location',
      icon: MapPin,
    },
    {
      id: 'settings',
      label: 'Admin Settings',
      icon: Settings,
    },
  ];

  const aiNavItems = [
    {
      id: 'kb',
      label: 'AI Knowledge Base',
      icon: BookOpen,
    },
    {
      id: 'training',
      label: 'AI Training Center',
      icon: Sparkles,
      badge: stats?.unansweredQuestionsCount ? `${stats.unansweredQuestionsCount} new` : undefined,
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      id: 'livechat',
      label: 'Live Chat Monitor',
      icon: MessageSquare,
      badge: stats?.activeConversations ? `${stats.activeConversations}` : undefined,
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    {
      id: 'documents',
      label: 'Document Ingestion',
      icon: FileText,
    },
  ];

  const renderNavGroup = (items: typeof coreNavItems, groupTitle: string) => (
    <div className="space-y-1">
      <div className="px-3 pt-2 pb-1 text-[10px] font-mono uppercase tracking-widest text-[#777777]">
        {groupTitle}
      </div>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors group ${
              isActive
                ? 'bg-[#F3F4F6] text-[#202124] font-semibold border border-[#E5E7EB]'
                : 'text-[#777777] font-medium hover:text-[#202124] hover:bg-[#F3F4F6]/70 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#202124]' : 'text-[#777777] group-hover:text-[#202124]'}`} />
              <span className="truncate">{item.label}</span>
            </div>
            {item.badge && (
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-md border shrink-0 ${
                  isActive
                    ? 'bg-white text-[#202124] border-[#E5E7EB]'
                    : (item as any).badgeColor || 'bg-[#F3F4F6] text-[#777777] border-[#E5E7EB]'
                }`}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#202124] flex overflow-hidden font-sans">
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* White Sidebar with Ash Grey active menu highlight */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-[#E5E7EB] flex flex-col justify-between transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 flex flex-col h-full">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 pb-4 border-b border-[#E5E7EB]">
            <div className="w-10 h-10 rounded-xl bg-[#181B20] border border-[#E5E7EB] p-1 flex items-center justify-center shrink-0">
              <img
                src="/assets/aistudio/Capture.JPG11_7f7b0bf9.JPG"
                alt="MARVZ Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="text-xs font-bold text-[#202124] tracking-wider flex items-center gap-1.5">
                MARVZ ADMIN
                <span className="text-[9px] px-1.5 py-0.5 rounded font-mono uppercase bg-[#F3F4F6] text-[#30343B] border border-[#E5E7EB]">
                  PRO
                </span>
              </div>
              <div className="text-[10px] text-[#777777] font-mono">Operations & AI Suite</div>
            </div>
          </div>

          {/* Navigation Groups */}
          <nav className="mt-3 space-y-4 flex-1 overflow-y-auto pr-1">
            {renderNavGroup(coreNavItems, 'Corporate Operations')}
            {renderNavGroup(aiNavItems, 'MARVZ AI Control Center')}
          </nav>

          {/* Bottom User Card */}
          <div className="pt-4 border-t border-[#E5E7EB] space-y-2.5">
            <button
              onClick={onBackToWebsite}
              className="w-full flex items-center justify-center gap-2 p-2 rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#202124] text-xs font-semibold border border-[#E5E7EB] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Public Website</span>
            </button>

            <div className="p-3 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-[#30343B] flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-[#202124] truncate">{user.name}</div>
                  <div className="text-[10px] text-[#777777] truncate">{user.role}</div>
                </div>
              </div>

              <button
                onClick={handleSignOutClick}
                className="p-1.5 rounded-lg text-[#777777] hover:text-red-700 hover:bg-white transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 px-6 bg-white border-b border-[#E5E7EB] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span className="text-xs font-mono text-[#202124] uppercase tracking-wider font-medium">
                MARVZ Dhaka HQ Operations Live
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchStats}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F3F4F6] border border-[#E5E7EB] hover:bg-[#E5E7EB] text-xs text-[#202124] font-medium transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#777777]" />
              <span className="hidden md:inline">Sync</span>
            </button>

            <button
              onClick={onBackToWebsite}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#30343B] hover:bg-[#202124] text-white text-xs font-semibold transition-colors"
            >
              <span>Public Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F3F4F6]">
          {activeTab === 'dashboard' && (
            <AdminDashboardView stats={stats} loading={statsLoading} onNavigate={setActiveTab} />
          )}
          {activeTab === 'content' && (
            <WebsiteContentView onContentUpdated={onSiteDataChanged} />
          )}
          {activeTab === 'internships' && (
            <InternshipManagementView onRefreshStats={fetchStats} />
          )}
          {activeTab === 'programs' && (
            <TrainingManagementView
              onRefreshStats={fetchStats}
              onSiteDataUpdated={onSiteDataChanged}
            />
          )}
          {activeTab === 'contacts' && (
            <ContactInquiryView onRefreshStats={fetchStats} />
          )}
          {activeTab === 'leads' && <LeadManagementView />}
          {activeTab === 'location' && (
            <LocationManagementView onLocationUpdated={onSiteDataChanged} />
          )}
          {activeTab === 'kb' && <KnowledgeBaseView onRefreshStats={fetchStats} />}
          {activeTab === 'training' && <TrainingCenterView onKnowledgeUpdated={fetchStats} />}
          {activeTab === 'livechat' && <LiveChatMonitoringView />}
          {activeTab === 'documents' && <DocumentIngestionView onKnowledgeUpdated={fetchStats} />}
          {activeTab === 'settings' && (
            <AdminSettingsView
              currentUser={user}
              onUserUpdated={onUserUpdated}
              onLogout={handleSignOutClick}
            />
          )}
        </main>
      </div>
    </div>
  );
};
