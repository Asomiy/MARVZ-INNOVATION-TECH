import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { ContactMessage, ContactMessageStatus } from '../../types/admin';
import { adminFetch } from '../../utils/adminApi';

interface ContactInquiryViewProps {
  onRefreshStats?: () => void;
}

const ITEMS_PER_PAGE = 6;

export const ContactInquiryView: React.FC<ContactInquiryViewProps> = ({ onRefreshStats }) => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [replyDraft, setReplyDraft] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/contacts');
      if (res.ok) {
        const data = await res.json();
        const list: ContactMessage[] = data.messages || [];
        setMessages(list);
        if (!selectedId && list.length > 0) {
          setSelectedId(list[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch contact messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleStatusChange = async (id: string, status: ContactMessageStatus) => {
    const res = await adminFetch(`/api/admin/contacts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => prev.map((m) => (m.id === id ? data.contactMessage : m)));
      if (onRefreshStats) onRefreshStats();
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
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => prev.map((m) => (m.id === selectedId ? data.contactMessage : m)));
        setReplyDraft('');
        if (onRefreshStats) onRefreshStats();
      }
    } finally {
      setSendingReply(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete contact message from "${name}"?`)) return;
    const res = await adminFetch(`/api/admin/contacts/${id}`, { method: 'DELETE' });
    if (res.ok) {
      const remaining = messages.filter((m) => m.id !== id);
      setMessages(remaining);
      if (selectedId === id) {
        setSelectedId(remaining[0]?.id || null);
      }
      if (onRefreshStats) onRefreshStats();
    }
  };

  const exportCSV = () => {
    const headers = ['Full Name', 'Email', 'Phone', 'Type', 'Domain', 'Subject', 'Status', 'Date'];
    const rows = messages.map((m) => [
      `"${m.fullName}"`,
      `"${m.email}"`,
      `"${m.phone}"`,
      `"${m.collaboratorType}"`,
      `"${m.technologyDomain}"`,
      `"${m.subject.replace(/"/g, '""')}"`,
      `"${m.status}"`,
      `"${new Date(m.createdAt).toLocaleDateString()}"`,
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `MARVZ_Contact_Messages_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = messages.filter((m) => {
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      m.fullName.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q) ||
      m.message.toLowerCase().includes(q) ||
      m.technologyDomain.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const selectedMsg = messages.find((m) => m.id === selectedId) || null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <h2 className="text-xl font-bold text-[#202124] flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#30343B]" />
            Contact Inbox & Inquiry Management
          </h2>
          <p className="text-xs text-[#777777] mt-1">
            Read website contact form submissions, respond with official logged replies, and resolve visitor inquiries.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] text-xs font-semibold self-start sm:self-auto transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-[#777777]" />
          <span>Export Inbox CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-[#777777] absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search inquiries by sender, email, subject, domain..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] placeholder-[#777777] focus:outline-none focus:bg-white focus:border-[#30343B]"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {(['all', 'New', 'In Progress', 'Replied', 'Resolved'] as const).map((st) => (
            <button
              key={st}
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
              {st === 'all' ? `All (${messages.length})` : st}
            </button>
          ))}
        </div>
      </div>

      {/* Two-Pane Inbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs flex flex-col overflow-hidden">
          <div className="divide-y divide-[#E5E7EB] flex-1">
            {loading ? (
              <div className="p-10 text-center text-xs text-[#777777]">Loading inbox messages...</div>
            ) : paginated.length === 0 ? (
              <div className="p-10 text-center text-xs text-[#777777]">No contact inquiries found.</div>
            ) : (
              paginated.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setSelectedId(m.id)}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedId === m.id
                      ? 'bg-[#F3F4F6]'
                      : 'hover:bg-[#F3F4F6]/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-xs text-[#202124] truncate">{m.fullName}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        m.status === 'New'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : m.status === 'Replied'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : m.status === 'Resolved'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-[#F3F4F6] text-[#202124] border-[#E5E7EB]'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-[#30343B] truncate mb-1">{m.subject}</div>
                  <p className="text-[11px] text-[#777777] line-clamp-2">{m.message}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-[#777777] font-mono">
                    <span>{m.technologyDomain}</span>
                    <span>{new Date(m.createdAt).toLocaleDateString()}</span>
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
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-2.5 py-1 rounded bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] disabled:opacity-40"
                >
                  Prev
                </button>
                <button
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
        <div className="lg:col-span-7 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs flex flex-col justify-between min-h-[460px] text-xs overflow-hidden">
          {selectedMsg ? (
            <>
              <div className="p-6 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-[#E5E7EB]">
                  <div>
                    <h3 className="text-base font-bold text-[#202124]">{selectedMsg.subject}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[#777777]">
                      <span className="text-[#202124] font-semibold">{selectedMsg.fullName}</span>
                      <a href={`mailto:${selectedMsg.email}`} className="text-[#30343B] hover:underline font-medium">
                        {selectedMsg.email}
                      </a>
                      {selectedMsg.phone && (
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3" /> {selectedMsg.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedMsg.status}
                      onChange={(e) =>
                        handleStatusChange(selectedMsg.id, e.target.value as ContactMessageStatus)
                      }
                      className="bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#30343B]"
                    >
                      <option value="New">New</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Replied">Replied</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                    <button
                      onClick={() => handleDelete(selectedMsg.id, selectedMsg.fullName)}
                      className="p-2 rounded-lg bg-[#F3F4F6] border border-[#E5E7EB] text-[#777777] hover:text-red-700 hover:bg-red-50 transition-colors"
                      title="Delete Inquiry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

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

                <div className="p-4 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] leading-relaxed whitespace-pre-line">
                  {selectedMsg.message}
                </div>

                {/* Previous Replies Thread */}
                {selectedMsg.replies.length > 0 && (
                  <div className="space-y-2.5 pt-2">
                    <div className="text-[11px] font-mono uppercase text-[#777777]">
                      Official Logged Replies ({selectedMsg.replies.length})
                    </div>
                    {selectedMsg.replies.map((rep) => (
                      <div
                        key={rep.id}
                        className="p-3.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-[#202124] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" /> {rep.senderName}
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
                  Compose & Log Official Reply
                </label>
                <textarea
                  rows={3}
                  required
                  value={replyDraft}
                  onChange={(e) => setReplyDraft(e.target.value)}
                  placeholder={`Write response to ${selectedMsg.fullName} (${selectedMsg.email})...`}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E7EB] text-[#202124] placeholder-[#777777] focus:outline-none focus:border-[#30343B]"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#777777]">
                    Saving marks this message as Replied and logs to Recent Activities.
                  </span>
                  <button
                    type="submit"
                    disabled={sendingReply || !replyDraft.trim()}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#30343B] hover:bg-[#202124] text-white font-semibold disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{sendingReply ? 'Saving Reply...' : 'Send & Log Reply'}</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-[#777777]">
              <MessageSquare className="w-8 h-8 mb-2 text-[#777777]" />
              Select an inquiry from the inbox list to inspect details and log replies.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
