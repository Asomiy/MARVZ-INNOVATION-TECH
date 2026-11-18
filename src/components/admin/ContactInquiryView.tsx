import React, { useState, useEffect, useMemo } from 'react';
import {
  Mail,
  Search,
  Send,
  Trash2,
  Phone,
  Clock,
  CheckCircle2,
  MessageSquare,
  Download,
  Building2,
  Filter,
  AlertTriangle,
  RefreshCw,
  Archive,
  Eye,
  MailCheck,
  MailWarning,
  X,
} from 'lucide-react';
import { ContactMessage, ContactMessageStatus } from '../../types/admin';
import { adminFetch } from '../../utils/adminApi';

interface ContactInquiryViewProps {
  onRefreshStats?: () => void;
}

interface EmailConfigInfo {
  configured: boolean;
  recipientConfigured: boolean;
  recipientEmail: string | null;
  smtpHost: string | null;
  smtpPort: number;
}

const ITEMS_PER_PAGE = 8;

const STANDARD_CATEGORIES = [
  'Student / Independent Builder',
  'University / Educational Institution',
  'Startup / Tech Founder',
  'Company / Enterprise Team',
];

function escapeCsvCell(val: unknown): string {
  const str = String(val ?? '').replace(/\r\n/g, '\n');
  return `"${str.replace(/"/g, '""')}"`;
}

export const ContactInquiryView: React.FC<ContactInquiryViewProps> = ({ onRefreshStats }) => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [emailConfig, setEmailConfig] = useState<EmailConfigInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ContactMessageStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [replyDraft, setReplyDraft] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [actionBanner, setActionBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<ContactMessage | null>(null);
  const [deleting, setDeleting] = useState(false);

  const showBanner = (type: 'success' | 'error', text: string) => {
    setActionBanner({ type, text });
    setTimeout(() => setActionBanner(null), 5000);
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/contacts');
      if (res.ok) {
        const data = await res.json();
        const list: ContactMessage[] = (data.messages || []).slice().sort(
          (a: ContactMessage, b: ContactMessage) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setMessages(list);
        if (data.emailConfig) {
          setEmailConfig(data.emailConfig);
        }
        if (!selectedId && list.length > 0) {
          setSelectedId(list[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch contact messages:', err);
      showBanner('error', 'Could not load contact messages from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const unreadCount = useMemo(
    () => messages.filter((m) => m.status === 'New').length,
    [messages]
  );

  const availableCategories = useMemo(() => {
    const set = new Set<string>(STANDARD_CATEGORIES);
    messages.forEach((m) => {
      if (m.collaboratorType) set.add(m.collaboratorType);
    });
    return Array.from(set);
  }, [messages]);

  const handleStatusChange = async (id: string, status: ContactMessageStatus) => {
    try {
      const res = await adminFetch(`/api/admin/contacts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status.');
      setMessages((prev) => prev.map((m) => (m.id === id ? data.contactMessage : m)));
      if (onRefreshStats) onRefreshStats();
      showBanner('success', `Marked inquiry as "${status}".`);
    } catch (err: any) {
      showBanner('error', err.message || 'Status update failed.');
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !replyDraft.trim() || sendingReply) return;

    setSendingReply(true);
    try {
      const res = await adminFetch(`/api/admin/contacts/${selectedId}/reply`, {
        method: 'POST',
        body: JSON.stringify({ message: replyDraft.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send reply.');

      setMessages((prev) => prev.map((m) => (m.id === selectedId ? data.contactMessage : m)));
      setReplyDraft('');
      if (onRefreshStats) onRefreshStats();
      showBanner(
        'success',
        data.emailSent
          ? 'Reply emailed directly to the visitor and logged in database.'
          : 'Reply logged in database and status marked Replied (configure SMTP to also dispatch outbound emails).'
      );
    } catch (err: any) {
      showBanner('error', err.message || 'Failed to send reply.');
    } finally {
      setSendingReply(false);
    }
  };

  const handleResendNotification = async (id: string) => {
    if (resendingEmail) return;
    setResendingEmail(true);
    try {
      const res = await adminFetch(`/api/admin/contacts/${id}/resend-email`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.contactMessage) {
        setMessages((prev) => prev.map((m) => (m.id === id ? data.contactMessage : m)));
      }
      if (data.success) {
        showBanner('success', 'Official email notification dispatched successfully.');
      } else {
        showBanner(
          'error',
          data.emailDelivery?.error || 'Could not send email. Verify SMTP credentials on the server.'
        );
      }
    } catch {
      showBanner('error', 'Failed to reach email dispatch endpoint.');
    } finally {
      setResendingEmail(false);
    }
  };

  const confirmDeleteMessage = async () => {
    if (!deleteCandidate || deleting) return;
    setDeleting(true);
    try {
      const res = await adminFetch(`/api/admin/contacts/${deleteCandidate.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete message.');
      }
      const remaining = messages.filter((m) => m.id !== deleteCandidate.id);
      setMessages(remaining);
      if (selectedId === deleteCandidate.id) {
        setSelectedId(remaining[0]?.id || null);
      }
      if (onRefreshStats) onRefreshStats();
      showBanner('success', `Deleted inquiry from ${deleteCandidate.fullName}.`);
      setDeleteCandidate(null);
    } catch (err: any) {
      showBanner('error', err.message || 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return messages.filter((m) => {
      const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || m.collaboratorType === categoryFilter;
      const matchesQuery =
        !q ||
        m.fullName.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.technologyDomain.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q);
      return matchesStatus && matchesCategory && matchesQuery;
    });
  }, [messages, statusFilter, categoryFilter, searchQuery]);

  const exportCSV = () => {
    const headers = [
      'ID',
      'Full Name',
      'Email',
      'Phone / WhatsApp',
      'Inquiry Category',
      'Technology Domain',
      'Subject',
      'Message',
      'Status',
      'Company Email Status',
      'Submitted At',
    ];
    const rows = filtered.map((m) => [
      escapeCsvCell(m.id),
      escapeCsvCell(m.fullName),
      escapeCsvCell(m.email),
      escapeCsvCell(m.phone),
      escapeCsvCell(m.collaboratorType),
      escapeCsvCell(m.technologyDomain),
      escapeCsvCell(m.subject),
      escapeCsvCell(m.message),
      escapeCsvCell(m.status),
      escapeCsvCell(m.companyEmailStatus || 'pending'),
      escapeCsvCell(new Date(m.createdAt).toLocaleString()),
    ]);
    const csvContent = '\uFEFF' + [headers.map(escapeCsvCell).join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MARVZ_Contact_Messages_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const selectedMsg = messages.find((m) => m.id === selectedId) || null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-xl font-bold text-[#202124] flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#DC2626]" />
              Contact Messages / Inquiry Management
            </h2>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-red-50 text-[#DC2626] border border-red-200 font-semibold">
              {unreadCount} unread
            </span>
          </div>
          <p className="text-xs text-[#777777] mt-1">
            Review visitor contact inquiries stored in SQLite, track official email notifications, filter by category, and send replies.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={fetchMessages}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] text-xs font-semibold transition-colors"
            title="Refresh Contact Inbox"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#777777] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#30343B] hover:bg-[#202124] text-white text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV ({filtered.length})</span>
          </button>
        </div>
      </div>

      {/* SMTP Configuration Status Bar */}
      {emailConfig && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex flex-wrap items-center justify-between gap-3 ${
            emailConfig.configured
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {emailConfig.configured ? (
              <MailCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            ) : (
              <MailWarning className="w-4 h-4 text-amber-700 shrink-0" />
            )}
            <span>
              {emailConfig.configured ? (
                <>
                  <strong>SMTP Email Delivery Active:</strong> Submissions notify{' '}
                  <span className="font-mono font-semibold">{emailConfig.recipientEmail}</span> via{' '}
                  <span className="font-mono">{emailConfig.smtpHost}</span>.
                </>
              ) : (
                <>
                  <strong>SMTP Email Credentials Pending:</strong> Inquiries are being saved to SQLite for{' '}
                  <span className="font-mono font-semibold">{emailConfig.recipientEmail || 'company inbox'}</span>. Set{' '}
                  <span className="font-mono">SMTP_HOST</span>, <span className="font-mono">SMTP_USER</span>, and{' '}
                  <span className="font-mono">SMTP_PASS</span> in server environment variables to send live emails.
                </>
              )}
            </span>
          </div>
        </div>
      )}

      {actionBanner && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            actionBanner.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <span>{actionBanner.text}</span>
          <button type="button" onClick={() => setActionBanner(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs space-y-3 text-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[#777777] absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by visitor name, email, subject, or technology domain..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] placeholder-[#777777] focus:outline-none focus:bg-white focus:border-[#30343B]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#777777] shrink-0" />
            <select
              aria-label="Filter by inquiry category"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] font-medium focus:outline-none focus:bg-white focus:border-[#30343B]"
            >
              <option value="all">All Inquiry Categories</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          {(['all', 'New', 'Read', 'Replied', 'Archived'] as const).map((st) => {
            const countForStatus =
              st === 'all' ? messages.length : messages.filter((m) => m.status === st).length;
            return (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  statusFilter === st
                    ? 'bg-[#30343B] text-white'
                    : 'bg-[#F3F4F6] text-[#777777] hover:text-[#202124] border border-[#E5E7EB]'
                }`}
              >
                {st === 'all' ? `All (${countForStatus})` : `${st} (${countForStatus})`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Two-Pane Inbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs flex flex-col overflow-hidden">
          <div className="divide-y divide-[#E5E7EB] flex-1">
            {loading ? (
              <div className="p-10 text-center text-xs text-[#777777]">Loading contact inquiries...</div>
            ) : paginated.length === 0 ? (
              <div className="p-10 text-center text-xs text-[#777777]">
                No contact inquiries match your current search or filters.
              </div>
            ) : (
              paginated.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setSelectedId(m.id)}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedId === m.id ? 'bg-[#F3F4F6] border-l-4 border-l-[#DC2626]' : 'hover:bg-[#F3F4F6]/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-xs text-[#202124] truncate">{m.fullName}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 ${
                        m.status === 'New'
                          ? 'bg-red-50 text-[#DC2626] border-red-200 font-semibold'
                          : m.status === 'Read'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : m.status === 'Replied'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-[#F3F4F6] text-[#777777] border-[#E5E7EB]'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-[#30343B] truncate mb-1">{m.subject}</div>
                  <p className="text-[11px] text-[#777777] line-clamp-2">{m.message}</p>
                  <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-[#777777] font-mono">
                    <span className="truncate">{m.technologyDomain}</span>
                    <span className="shrink-0">{new Date(m.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="px-4 py-2.5 border-t border-[#E5E7EB] flex items-center justify-between text-[11px] text-[#777777]">
              <span>
                Page {currentPage}/{totalPages}
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-2.5 py-1 rounded bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-2.5 py-1 rounded bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Detail & Reply Composer (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs flex flex-col justify-between min-h-[480px] text-xs overflow-hidden">
          {selectedMsg ? (
            <>
              <div className="p-6 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-[#E5E7EB]">
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono text-[#777777] mb-1">ID: {selectedMsg.id}</div>
                    <h3 className="text-base font-bold text-[#202124]">{selectedMsg.subject}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[#777777]">
                      <span className="text-[#202124] font-semibold">{selectedMsg.fullName}</span>
                      <a href={`mailto:${selectedMsg.email}`} className="text-[#DC2626] hover:underline font-medium">
                        {selectedMsg.email}
                      </a>
                      {selectedMsg.phone && (
                        <a
                          href={`tel:${selectedMsg.phone.replace(/[^+\d]/g, '')}`}
                          className="flex items-center gap-1 font-mono text-[#30343B] hover:underline"
                        >
                          <Phone className="w-3 h-3" /> {selectedMsg.phone}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      aria-label="Message status"
                      value={selectedMsg.status}
                      onChange={(e) =>
                        handleStatusChange(selectedMsg.id, e.target.value as ContactMessageStatus)
                      }
                      className="bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-[#30343B]"
                    >
                      <option value="New">New</option>
                      <option value="Read">Read</option>
                      <option value="Replied">Replied</option>
                      <option value="Archived">Archived</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => setDeleteCandidate(selectedMsg)}
                      className="p-2 rounded-lg bg-[#F3F4F6] border border-[#E5E7EB] text-[#777777] hover:text-red-700 hover:bg-red-50 transition-colors"
                      title="Delete Inquiry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Quick Status Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedMsg.id, 'Read')}
                    disabled={selectedMsg.status === 'Read'}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E5E7EB] text-[11px] font-medium text-[#202124] disabled:opacity-50"
                  >
                    <Eye className="w-3 h-3" /> Mark Read
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedMsg.id, 'Archived')}
                    disabled={selectedMsg.status === 'Archived'}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E5E7EB] text-[11px] font-medium text-[#202124] disabled:opacity-50"
                  >
                    <Archive className="w-3 h-3" /> Archive
                  </button>
                  <span
                    className={`ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-mono ${
                      selectedMsg.companyEmailStatus === 'sent'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : selectedMsg.companyEmailStatus === 'failed'
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : 'bg-amber-50 border-amber-200 text-amber-800'
                    }`}
                  >
                    {selectedMsg.companyEmailStatus === 'sent'
                      ? 'Company Email Sent'
                      : selectedMsg.companyEmailStatus === 'failed'
                      ? 'Email Failed'
                      : 'Email Pending SMTP'}
                  </span>
                  {selectedMsg.companyEmailStatus !== 'sent' && (
                    <button
                      type="button"
                      onClick={() => handleResendNotification(selectedMsg.id)}
                      disabled={resendingEmail}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-[#F3F4F6] border border-[#E5E7EB] text-[11px] font-semibold text-[#30343B]"
                    >
                      <RefreshCw className={`w-3 h-3 ${resendingEmail ? 'animate-spin' : ''}`} />
                      <span>Send Email</span>
                    </button>
                  )}
                </div>

                {/* Visitor Metadata Tags */}
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="px-2.5 py-1 rounded-md bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-[#777777]" /> {selectedMsg.collaboratorType}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-[#F3F4F6] border border-[#E5E7EB] text-[#30343B]">
                    {selectedMsg.technologyDomain}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-[#F3F4F6] border border-[#E5E7EB] text-[#777777] flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {new Date(selectedMsg.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#FAFAFB] border border-[#E5E7EB] border-l-4 border-l-[#DC2626] text-[#202124] leading-relaxed whitespace-pre-line">
                  {selectedMsg.message}
                </div>

                {/* Previous Replies Thread */}
                {selectedMsg.replies.length > 0 && (
                  <div className="space-y-2.5 pt-2">
                    <div className="text-[11px] font-mono uppercase text-[#777777]">
                      Official Replies ({selectedMsg.replies.length})
                    </div>
                    {selectedMsg.replies.map((rep) => (
                      <div
                        key={rep.id}
                        className="p-3.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-[#202124] flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            <span>{rep.senderName}</span>
                            {rep.emailSent && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800">
                                Emailed
                              </span>
                            )}
                          </span>
                          <span className="text-[#777777] font-mono">
                            {new Date(rep.sentAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[#202124] whitespace-pre-line">{rep.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reply Composer */}
              <form
                onSubmit={handleSendReply}
                className="p-4 border-t border-[#E5E7EB] bg-[#F3F4F6] space-y-2.5"
              >
                <label className="block font-semibold text-[#202124] uppercase">
                  Reply to {selectedMsg.fullName}
                </label>
                <textarea
                  rows={3}
                  required
                  value={replyDraft}
                  onChange={(e) => setReplyDraft(e.target.value)}
                  placeholder={`Write response to ${selectedMsg.fullName} (${selectedMsg.email})...`}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E7EB] text-[#202124] placeholder-[#777777] focus:outline-none focus:border-[#30343B]"
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-[#777777]">
                    {emailConfig?.configured
                      ? 'Sends email directly via SMTP and marks inquiry as Replied.'
                      : 'Logs reply in database and marks inquiry as Replied.'}
                  </span>
                  <button
                    type="submit"
                    disabled={sendingReply || !replyDraft.trim()}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#30343B] hover:bg-[#202124] text-white font-semibold disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{sendingReply ? 'Sending Reply...' : 'Send Reply'}</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-[#777777]">
              <MessageSquare className="w-8 h-8 mb-2 text-[#777777]" />
              Select an inquiry from the inbox list to inspect details and respond.
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white border border-[#E5E7EB] shadow-xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-[#DC2626] shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#202124]">Delete Contact Inquiry?</h4>
                <p className="text-xs text-[#777777] mt-1 leading-relaxed">
                  Are you sure you want to permanently delete the inquiry from{' '}
                  <span className="font-semibold text-[#202124]">{deleteCandidate.fullName}</span>? This cannot be
                  undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] text-xs font-medium text-[#202124]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDeleteMessage}
                className="px-4 py-2 rounded-xl bg-[#DC2626] hover:bg-red-700 text-xs font-semibold text-white disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
