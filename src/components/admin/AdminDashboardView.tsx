import React from 'react';
import {
  Users,
  MessageSquare,
  Activity,
  FileCheck2,
  HelpCircle,
  TrendingUp,
  ArrowUpRight,
  ShieldAlert,
  Sparkles,
  BookOpen,
  Send,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { AdminOverviewStats } from '../../types/admin';

interface AdminDashboardViewProps {
  stats: AdminOverviewStats | null;
  loading: boolean;
  onNavigate: (tab: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  stats,
  loading,
  onNavigate,
}) => {
  if (loading || !stats) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Loading MARVZ AI Control Center telemetry...</p>
        </div>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Total Website Visitors',
      value: stats.totalVisitors.toLocaleString(),
      change: '+14.2% this week',
      icon: Users,
      color: 'from-blue-500/20 to-blue-600/5',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400',
    },
    {
      title: 'Total Conversations',
      value: stats.totalConversations.toLocaleString(),
      change: '+22.5% AI automated',
      icon: MessageSquare,
      color: 'from-red-600/20 to-red-700/5',
      borderColor: 'border-red-500/30',
      iconColor: 'text-red-400',
    },
    {
      title: 'Active Conversations',
      value: stats.activeConversations.toString(),
      change: 'Real-time live threads',
      icon: Activity,
      color: 'from-emerald-500/20 to-emerald-600/5',
      borderColor: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
      badge: 'Live',
    },
    {
      title: 'Customer Inquiries & Leads',
      value: stats.totalInquiries.toLocaleString(),
      change: `${stats.leadConversionRate} conversion rate`,
      icon: FileCheck2,
      color: 'from-purple-500/20 to-purple-600/5',
      borderColor: 'border-purple-500/30',
      iconColor: 'text-purple-400',
    },
    {
      title: 'Unanswered Questions',
      value: stats.unansweredQuestionsCount.toString(),
      change: stats.unansweredQuestionsCount > 0 ? 'Requires admin review' : 'All clear',
      icon: HelpCircle,
      color: stats.unansweredQuestionsCount > 0 ? 'from-amber-500/20 to-amber-600/5' : 'from-slate-800/40 to-slate-900/10',
      borderColor: stats.unansweredQuestionsCount > 0 ? 'border-amber-500/40' : 'border-slate-800',
      iconColor: stats.unansweredQuestionsCount > 0 ? 'text-amber-400' : 'text-slate-400',
      action: stats.unansweredQuestionsCount > 0 ? 'Review in Training Center' : undefined,
      onAction: () => onNavigate('training'),
    },
    {
      title: 'Lead Conversion Rate',
      value: stats.leadConversionRate,
      change: 'Inquiry to Client',
      icon: TrendingUp,
      color: 'from-cyan-500/20 to-cyan-600/5',
      borderColor: 'border-cyan-500/30',
      iconColor: 'text-cyan-400',
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner Alert for Unanswered Questions or Support Flags */}
      {stats.unansweredQuestionsCount > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#130f08] to-[#0d0905] border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                {stats.unansweredQuestionsCount} Unanswered Visitor Questions Awaiting Verification
              </h4>
              <p className="text-xs text-slate-300">
                Visitors asked queries that need official review. Train the AI now to automate answers in English & Bangla.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('training')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-semibold shadow-md whitespace-nowrap self-start sm:self-auto transition-all"
          >
            Open Training Center
          </button>
        </div>
      )}

      {/* 6 Key Telemetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl bg-gradient-to-br ${kpi.color} border ${kpi.borderColor} backdrop-blur-md relative overflow-hidden transition-all hover:border-slate-600 group`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {kpi.title}
                </span>
                <div className={`w-8 h-8 rounded-xl bg-slate-900/80 border border-slate-700/60 flex items-center justify-center ${kpi.iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-extrabold text-white tracking-tight">
                  {kpi.value}
                </div>
                {kpi.badge && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                    {kpi.badge}
                  </span>
                )}
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                <span>{kpi.change}</span>
                {kpi.action && (
                  <button
                    onClick={kpi.onAction}
                    className="text-amber-400 hover:text-amber-300 font-semibold underline text-[11px]"
                  >
                    {kpi.action}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Interactive Conversation Analytics & Most Frequently Asked Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Trend Chart & Lead Conversion Funnel */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Conversation Trend Visualizer */}
          <div className="p-6 rounded-2xl bg-[#080d1a] border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-red-500" />
                  Weekly AI Automation vs. Human Assistance Volume
                </h3>
                <p className="text-xs text-slate-400">
                  Autonomous resolution rate stands at 84% without human hand-off
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/50">
                84% AI Autonomy
              </span>
            </div>

            {/* Visual Bar Graph */}
            <div className="pt-4 pb-2">
              <div className="h-44 flex items-end justify-between gap-3 px-2">
                {stats.conversationTrends.map((trend, i) => {
                  const total = trend.botOnly + trend.humanAssisted;
                  const maxHeight = 72; // max height scale
                  const botHeight = (trend.botOnly / maxHeight) * 100;
                  const humanHeight = (trend.humanAssisted / maxHeight) * 100;

                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                        {total}
                      </div>
                      <div className="w-full max-w-[32px] h-32 flex flex-col justify-end gap-1">
                        <div
                          style={{ height: `${botHeight}%` }}
                          className="w-full rounded-t-md bg-gradient-to-t from-red-700 to-red-500 shadow-sm transition-all group-hover:brightness-125"
                          title={`AI Bot: ${trend.botOnly} chats`}
                        />
                        <div
                          style={{ height: `${humanHeight}%` }}
                          className="w-full rounded-b-md bg-slate-700 transition-all group-hover:bg-slate-600"
                          title={`Human Assisted: ${trend.humanAssisted} chats`}
                        />
                      </div>
                      <span className="text-xs font-mono text-slate-400">{trend.date}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-center gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-red-600" />
                  <span>Autonomous AI Responses</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-slate-700" />
                  <span>Human Hand-off / Escalated</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lead Funnel Pipeline Breakdown */}
          <div className="p-6 rounded-2xl bg-[#080d1a] border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-purple-400" />
                Lead Pipeline & Qualification Distribution
              </h3>
              <button
                onClick={() => onNavigate('leads')}
                className="text-xs text-red-400 hover:text-red-300 font-medium flex items-center gap-1"
              >
                Open Full CRM <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded">
                  New
                </span>
                <div className="text-2xl font-bold text-white mt-2">
                  {stats.leadsByStatus['New'] || 0}
                </div>
                <span className="text-[11px] text-slate-400">Needs Contact</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded">
                  Contacted
                </span>
                <div className="text-2xl font-bold text-white mt-2">
                  {stats.leadsByStatus['Contacted'] || 0}
                </div>
                <span className="text-[11px] text-slate-400">Discovery Sent</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded">
                  Interested
                </span>
                <div className="text-2xl font-bold text-white mt-2">
                  {stats.leadsByStatus['Interested'] || 0}
                </div>
                <span className="text-[11px] text-slate-400">Proposal Stage</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">
                  Converted
                </span>
                <div className="text-2xl font-bold text-white mt-2">
                  {stats.leadsByStatus['Converted'] || 0}
                </div>
                <span className="text-[11px] text-slate-400">Won Client</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Col: Top FAQs & Fast Action Center */}
        <div className="space-y-6">
          
          {/* Most Frequently Asked Questions List */}
          <div className="p-6 rounded-2xl bg-[#080d1a] border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Most Frequently Asked Questions
              </h3>
              <button
                onClick={() => onNavigate('kb')}
                className="text-xs text-red-400 hover:text-red-300 font-medium"
              >
                Manage FAQs
              </button>
            </div>

            <div className="space-y-3">
              {stats.faqHitList.map((faq, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-red-300 font-mono uppercase">
                      {faq.category}
                    </span>
                    <span className="font-semibold text-slate-300 font-mono">
                      {faq.count} inquiries
                    </span>
                  </div>
                  <p className="text-xs text-white font-medium line-clamp-2">
                    {faq.question}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action Dock */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-red-950/40 via-slate-900 to-slate-900 border border-red-500/30 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-red-400" />
              Direct Administrative Operations
            </h4>
            <p className="text-xs text-slate-300">
              Immediate controls for company knowledge, active conversations, and live testing:
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => onNavigate('training')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-all group"
              >
                <span>Open AI Training Playground</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
              </button>

              <button
                onClick={() => onNavigate('livechat')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-all group"
              >
                <span>Monitor Active Live Chats</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
              </button>

              <button
                onClick={() => onNavigate('documents')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-all group"
              >
                <span>Ingest PDF, DOCX, TXT Documents</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
              </button>

              <button
                onClick={() => onNavigate('settings')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-all group"
              >
                <span>Customize Chatbot Name & Prompts</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
