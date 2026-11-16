import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, RefreshCw, Mail, Phone, Clock, Filter, CheckCircle, TrendingUp, Users, MessageSquare } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  requirements: string;
  timestamp: string;
  status: 'New' | 'In Review' | 'Contacted' | 'Closed';
  source: string;
}

interface Analytics {
  totalLeads: number;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
  totalChatInteractions: number;
  recentQueries: Array<{
    id: string;
    timestamp: string;
    userMessage: string;
    language: string;
    categoryDetected: string;
  }>;
}

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'leads' | 'queries'>('leads');

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leads');
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
        setAnalytics(data.analytics || null);
      }
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLeads();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpdateStatus = async (leadId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((lead) => (lead.id === leadId ? { ...lead, status: newStatus as any } : lead))
        );
      }
    } catch (err) {
      console.error('Failed to update lead status:', err);
    }
  };

  const filteredLeads = leads.filter((l) => {
    if (selectedFilter === 'all') return true;
    return l.status.toLowerCase() === selectedFilter.toLowerCase() || l.category.toLowerCase() === selectedFilter.toLowerCase();
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-[#E5E7EB] bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center text-[#30343B]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#202124] flex items-center gap-2">
                MARVZ AI Inquiry & Lead Intelligence
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono">
                  Live Operations
                </span>
              </h3>
              <p className="text-xs text-[#777777]">
                Visitor inquiries, technical consultation leads, and automated conversation logs
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLeads}
              disabled={loading}
              className="p-2 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E5E7EB] text-[#202124] transition-colors"
              title="Refresh leads"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#777777] hover:text-[#202124] hover:bg-[#F3F4F6] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Analytics Highlights */}
        {analytics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#F3F4F6] border-b border-[#E5E7EB] text-xs">
            <div className="p-3 rounded-xl bg-white border border-[#E5E7EB]">
              <div className="flex items-center justify-between text-[#777777] mb-1">
                <span>Total Leads</span>
                <Users className="w-3.5 h-3.5 text-[#30343B]" />
              </div>
              <div className="text-xl font-bold text-[#202124] tabular-nums">{analytics.totalLeads}</div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-[#E5E7EB]">
              <div className="flex items-center justify-between text-[#777777] mb-1">
                <span>Chat Queries</span>
                <MessageSquare className="w-3.5 h-3.5 text-[#30343B]" />
              </div>
              <div className="text-xl font-bold text-[#202124] tabular-nums">{analytics.totalChatInteractions}</div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-[#E5E7EB]">
              <div className="flex items-center justify-between text-[#777777] mb-1">
                <span>Top Interest</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <div className="text-sm font-bold text-emerald-700 truncate">
                {Object.keys(analytics.byCategory)[0] || 'Services'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-[#E5E7EB]">
              <div className="flex items-center justify-between text-[#777777] mb-1">
                <span>Action Required</span>
                <CheckCircle className="w-3.5 h-3.5 text-amber-700" />
              </div>
              <div className="text-xl font-bold text-amber-700 tabular-nums">{analytics.byStatus?.['New'] || 0} New</div>
            </div>
          </div>
        )}

        {/* Nav Tabs & Filters */}
        <div className="px-5 py-3 border-b border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('leads')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'leads'
                  ? 'bg-[#30343B] text-white'
                  : 'bg-[#F3F4F6] text-[#777777] hover:text-[#202124]'
              }`}
            >
              Captured Inquiries ({leads.length})
            </button>
            <button
              onClick={() => setActiveTab('queries')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'queries'
                  ? 'bg-[#30343B] text-white'
                  : 'bg-[#F3F4F6] text-[#777777] hover:text-[#202124]'
              }`}
            >
              Recent Chat Logs
            </button>
          </div>

          {activeTab === 'leads' && (
            <div className="flex items-center gap-2 text-xs">
              <Filter className="w-3.5 h-3.5 text-[#777777]" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-[#30343B]"
              >
                <option value="all">All Leads</option>
                <option value="new">Status: New</option>
                <option value="in review">Status: In Review</option>
                <option value="contacted">Status: Contacted</option>
                <option value="closed">Status: Closed</option>
                <option value="services">Services</option>
                <option value="training">Training</option>
                <option value="internships">Internships</option>
              </select>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 bg-[#F3F4F6]">
          {activeTab === 'leads' ? (
            <div className="space-y-3">
              {filteredLeads.length === 0 ? (
                <div className="py-12 text-center text-[#777777] text-sm">
                  No leads recorded in this filter view.
                </div>
              ) : (
                filteredLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-4 rounded-xl bg-white border border-[#E5E7EB] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[#202124] text-sm">{lead.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase tracking-wider bg-[#F3F4F6] text-[#30343B] border border-[#E5E7EB]">
                          {lead.category}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                          lead.status === 'New'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : lead.status === 'In Review'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : lead.status === 'Contacted'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-[#F3F4F6] text-[#777777] border-[#E5E7EB]'
                        }`}>
                          {lead.status}
                        </span>
                        <span className="text-[10px] text-[#777777] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(lead.timestamp).toLocaleDateString()} {new Date(lead.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-xs text-[#202124] leading-relaxed bg-[#F3F4F6] p-2.5 rounded-lg border border-[#E5E7EB]">
                        "{lead.requirements}"
                      </p>

                      <div className="flex items-center gap-4 text-xs text-[#777777]">
                        {lead.email && (
                          <a
                            href={`mailto:${lead.email}`}
                            className="flex items-center gap-1 hover:text-[#202124] transition-colors"
                          >
                            <Mail className="w-3 h-3" />
                            {lead.email}
                          </a>
                        )}
                        {lead.phone && (
                          <a
                            href={`tel:${lead.phone}`}
                            className="flex items-center gap-1 hover:text-[#202124] transition-colors"
                          >
                            <Phone className="w-3 h-3" />
                            {lead.phone}
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Status Toggle buttons */}
                    <div className="shrink-0 flex items-center gap-1.5 self-end md:self-center">
                      <select
                        value={lead.status}
                        onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                        className="bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-[#30343B]"
                      >
                        <option value="New">Set: New</option>
                        <option value="In Review">Set: In Review</option>
                        <option value="Contacted">Set: Contacted</option>
                        <option value="Closed">Set: Closed</option>
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {analytics?.recentQueries?.length ? (
                analytics.recentQueries.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-white border border-[#E5E7EB] text-xs space-y-1 shadow-xs">
                    <div className="flex items-center justify-between text-[#777777]">
                      <span className="font-mono text-[10px] text-[#30343B]">{log.categoryDetected}</span>
                      <span className="text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="font-semibold text-[#202124]">Visitor: "{log.userMessage}"</div>
                    <div className="text-[10px] text-[#777777] font-mono">Language: {log.language}</div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-[#777777] text-sm">
                  No chat logs recorded yet. Start conversing with MARVZ AI Assistant to populate live analytics.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#E5E7EB] bg-white flex items-center justify-between text-xs text-[#777777] px-5">
          <span>MARVZ Internal CRM & AI Advisory Bridge</span>
          <span className="text-emerald-700 flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            Backend Sync Active
          </span>
        </div>

      </div>
    </div>
  );
};
