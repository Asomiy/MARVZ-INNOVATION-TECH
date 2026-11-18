import React from 'react';
import {
  Users,
  MessageSquare,
  Activity,
  FileCheck2,
  Briefcase,
  GraduationCap,
  Mail,
  ArrowUpRight,
  ShieldAlert,
  Sparkles,
  BookOpen,
  Clock,
  MapPin,
  Globe,
} from 'lucide-react';
import { AdminOverviewStats, AdminRole } from '../../types/admin';
import { canRoleAccessTab } from '../../utils/adminApi';

interface AdminDashboardViewProps {
  stats: AdminOverviewStats | null;
  loading: boolean;
  userRole?: AdminRole;
  onNavigate: (tab: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  stats,
  loading,
  userRole = 'Super Admin',
  onNavigate,
}) => {
  if (loading || !stats) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#30343B] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#777777] font-mono">Loading MARVZ Operations & Telemetry...</p>
        </div>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Total Website Visitors',
      value: stats.totalVisitors.toLocaleString(),
      change: 'Live tracked sessions',
      icon: Users,
      visible: true,
    },
    {
      title: 'Total Inquiries & Leads',
      value: stats.totalInquiries.toLocaleString(),
      change: `${stats.leadConversionRate} CRM conversion`,
      icon: FileCheck2,
      action: 'Open Leads CRM',
      onAction: () => onNavigate('leads'),
      visible: canRoleAccessTab(userRole, 'leads'),
    },
    {
      title: 'Internship Applications',
      value: stats.internshipApplicationsCount.toString(),
      change: `${stats.pendingInternshipsCount} awaiting decision`,
      icon: Briefcase,
      badge: stats.pendingInternshipsCount > 0 ? `${stats.pendingInternshipsCount} Pending` : undefined,
      action: 'Review Applicants',
      onAction: () => onNavigate('internships'),
      visible: canRoleAccessTab(userRole, 'internships'),
    },
    {
      title: 'Training Registrations',
      value: stats.trainingRegistrationsCount.toString(),
      change: `Paid: ${stats.paidTrainingCount} • BDT ${stats.trainingRevenueBDT.toLocaleString()}`,
      icon: GraduationCap,
      action: 'Manage Courses & Fees',
      onAction: () => onNavigate('programs'),
      visible: canRoleAccessTab(userRole, 'programs'),
    },
    {
      title: 'Contact Messages',
      value: stats.contactMessagesCount.toString(),
      change: `${stats.unreadContactMessagesCount} unread new messages`,
      icon: Mail,
      action: 'Open Contact Inbox',
      onAction: () => onNavigate('contacts'),
      visible: canRoleAccessTab(userRole, 'contacts'),
    },
    {
      title: 'AI Chats & Unanswered',
      value: `${stats.totalConversations}`,
      change: `${stats.activeConversations} active • ${stats.unansweredQuestionsCount} unanswered`,
      icon: MessageSquare,
      action: canRoleAccessTab(userRole, 'livechat')
        ? 'Live Chat Monitor'
        : canRoleAccessTab(userRole, 'training')
        ? 'AI Training Center'
        : undefined,
      onAction: () =>
        onNavigate(canRoleAccessTab(userRole, 'livechat') ? 'livechat' : 'training'),
      visible: canRoleAccessTab(userRole, 'livechat') || canRoleAccessTab(userRole, 'training'),
    },
  ].filter((kpi) => kpi.visible);

  const maxMonthlyVal = Math.max(
    10,
    ...stats.monthlyMetrics.flatMap((m) => [m.inquiries, m.trainings, m.internships])
  );

  return (
    <div className="space-y-6">
      {/* Unanswered Alert Banner */}
      {stats.unansweredQuestionsCount > 0 && canRoleAccessTab(userRole, 'training') && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#202124]">
                {stats.unansweredQuestionsCount} Unanswered Visitor Questions Awaiting Review
              </h4>
              <p className="text-xs text-[#777777]">
                Train the MARVZ AI Assistant in the Training Center so visitor questions are answered automatically.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('training')}
            className="px-4 py-2 rounded-xl bg-[#30343B] hover:bg-[#202124] text-white text-xs font-semibold whitespace-nowrap self-start sm:self-auto transition-colors"
          >
            Open AI Training Center
          </button>
        </div>
      )}

      {/* 6 White Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs hover:border-[#30343B]/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[#777777] uppercase tracking-wider">
                  {kpi.title}
                </span>
                <div className="w-8 h-8 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center text-[#30343B]">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold text-[#202124] tracking-tight tabular-nums">{kpi.value}</div>
                {kpi.badge && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                    {kpi.badge}
                  </span>
                )}
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-[#777777] gap-2">
                <span className="truncate">{kpi.change}</span>
                {kpi.action && (
                  <button
                    onClick={kpi.onAction}
                    className="text-[#30343B] hover:text-[#202124] font-semibold text-[11px] shrink-0 underline"
                  >
                    {kpi.action}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Analytics & Recent Activities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Monthly Growth + Recent Activities */}
        <div className="lg:col-span-8 space-y-6">
          {/* Monthly Applications & Inquiries Chart */}
          <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#202124] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#30343B]" />
                  Monthly Inquiries, Training Enrollments & Internships
                </h3>
                <p className="text-xs text-[#777777]">
                  Cross-module corporate growth trajectory including live database submissions
                </p>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-[#777777]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#202124] inline-block" /> Inquiries
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#777777] inline-block" /> Training
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#D1D5DB] inline-block" /> Internships
                </span>
              </div>
            </div>

            <div className="h-44 flex items-end justify-between gap-4 pt-4 px-2">
              {stats.monthlyMetrics.map((m, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center gap-1 h-32">
                    <div
                      style={{ height: `${Math.max(8, (m.inquiries / maxMonthlyVal) * 100)}%` }}
                      className="w-3 sm:w-4 rounded-t bg-[#202124] hover:bg-[#30343B] transition-colors"
                      title={`Inquiries: ${m.inquiries}`}
                    />
                    <div
                      style={{ height: `${Math.max(8, (m.trainings / maxMonthlyVal) * 100)}%` }}
                      className="w-3 sm:w-4 rounded-t bg-[#777777] hover:bg-[#555555] transition-colors"
                      title={`Trainings: ${m.trainings}`}
                    />
                    <div
                      style={{ height: `${Math.max(8, (m.internships / maxMonthlyVal) * 100)}%` }}
                      className="w-3 sm:w-4 rounded-t bg-[#D1D5DB] hover:bg-[#9CA3AF] transition-colors"
                      title={`Internships: ${m.internships}`}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-[#777777]">{m.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activities Audit Feed */}
          <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#202124] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#30343B]" />
                Recent System & Administrative Activities
              </h3>
              <span className="text-[11px] font-mono text-[#777777]">
                Latest {stats.recentActivities.length} events
              </span>
            </div>

            <div className="space-y-2.5">
              {stats.recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white text-[#30343B] border border-[#E5E7EB]">
                        {act.type}
                      </span>
                      <span className="font-bold text-[#202124]">{act.title}</span>
                    </div>
                    <p className="text-[#777777] text-[11px]">{act.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-[#202124] font-semibold">{act.actor}</div>
                    <div className="text-[10px] text-[#777777] font-mono">
                      {new Date(act.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Top FAQs + Quick Operations Dock */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#202124] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#30343B]" />
                Top Visitor Questions
              </h3>
              {canRoleAccessTab(userRole, 'kb') && (
                <button
                  onClick={() => onNavigate('kb')}
                  className="text-xs text-[#30343B] hover:text-[#202124] font-semibold underline"
                >
                  Manage FAQs
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {stats.faqHitList.map((faq, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB]"
                >
                  <div className="flex items-center justify-between text-[10px] text-[#777777] mb-1">
                    <span className="px-2 py-0.5 rounded bg-white border border-[#E5E7EB] text-[#30343B] font-mono uppercase">
                      {faq.category}
                    </span>
                    <span className="font-mono text-[#202124] tabular-nums">{faq.count} hits</span>
                  </div>
                  <p className="text-xs text-[#202124] font-medium line-clamp-2">{faq.question}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs space-y-2.5">
            <h4 className="text-sm font-bold text-[#202124] flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-[#30343B]" />
              Quick Control Actions
            </h4>

            {canRoleAccessTab(userRole, 'content') && (
              <button
                onClick={() => onNavigate('content')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E5E7EB] text-xs font-semibold text-[#202124] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-[#30343B]" /> Edit Website & Services
                </span>
                <ArrowUpRight className="w-4 h-4 text-[#777777]" />
              </button>
            )}

            {canRoleAccessTab(userRole, 'internships') && (
              <button
                onClick={() => onNavigate('internships')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E5E7EB] text-xs font-semibold text-[#202124] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-[#30343B]" /> Approve Internships
                </span>
                <ArrowUpRight className="w-4 h-4 text-[#777777]" />
              </button>
            )}

            {canRoleAccessTab(userRole, 'programs') && (
              <button
                onClick={() => onNavigate('programs')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E5E7EB] text-xs font-semibold text-[#202124] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-[#30343B]" /> Training Fees & Seats
                </span>
                <ArrowUpRight className="w-4 h-4 text-[#777777]" />
              </button>
            )}

            {canRoleAccessTab(userRole, 'location') && (
              <button
                onClick={() => onNavigate('location')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E5E7EB] text-xs font-semibold text-[#202124] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#30343B]" /> Dhaka HQ Map & Address
                </span>
                <ArrowUpRight className="w-4 h-4 text-[#777777]" />
              </button>
            )}

            {canRoleAccessTab(userRole, 'contacts') && (
              <button
                onClick={() => onNavigate('contacts')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E5E7EB] text-xs font-semibold text-[#202124] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#30343B]" /> Open Contact Inbox
                </span>
                <ArrowUpRight className="w-4 h-4 text-[#777777]" />
              </button>
            )}

            {canRoleAccessTab(userRole, 'kb') && (
              <button
                onClick={() => onNavigate('kb')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E5E7EB] text-xs font-semibold text-[#202124] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#30343B]" /> AI Knowledge Base
                </span>
                <ArrowUpRight className="w-4 h-4 text-[#777777]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
