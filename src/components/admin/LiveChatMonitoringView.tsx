import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  AlertTriangle,
  Send,
  User,
  Bot,
  Headphones,
  CheckCircle2,
  Clock,
  Shield,
  RefreshCw,
  Search,
  Filter,
  Phone,
  Mail
} from 'lucide-react';
import { ConversationThread } from '../../types/admin';

export const LiveChatMonitoringView: React.FC = () => {
  const [conversations, setConversations] = useState<ConversationThread[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [agentName, setAgentName] = useState('Engr. Zamil (Director)');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/admin/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
        if (!selectedConvId && data.conversations?.length > 0) {
          setSelectedConvId(data.conversations[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load live chats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    // Auto-poll live chats every 6 seconds
    const interval = setInterval(fetchConversations, 6000);
    return () => clearInterval(interval);
  }, []);

  const selectedConv = conversations.find((c) => c.id === selectedConvId);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConv || !replyText.trim() || sendingReply) return;

    setSendingReply(true);
    try {
      const res = await fetch(`/api/admin/conversations/${selectedConv.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: replyText.trim(),
          agentName,
        }),
      });

      if (res.ok) {
        setReplyText('');
        fetchConversations();
      }
    } catch (err) {
      console.error('Failed to send agent reply:', err);
    } finally {
      setSendingReply(false);
    }
  };

  const handleUpdateStatus = async (convId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/conversations/${convId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchConversations();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const matchesFilter =
      statusFilter === 'all' ||
      (statusFilter === 'support' && c.status === 'Needs Human Support') ||
      (statusFilter === 'joined' && c.status === 'Human Joined') ||
      (statusFilter === 'bot' && c.status === 'Bot Handling') ||
      (statusFilter === 'resolved' && c.status === 'Resolved');

    const query = searchQuery.toLowerCase();
    const matchesQuery =
      !query ||
      c.visitorName.toLowerCase().includes(query) ||
      (c.visitorEmail && c.visitorEmail.toLowerCase().includes(query)) ||
      c.messages.some((m) => m.text.toLowerCase().includes(query));

    return matchesFilter && matchesQuery;
  });

  const needsSupportCount = conversations.filter((c) => c.status === 'Needs Human Support').length;

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-red-500" />
            Live Chat Monitoring & Human Support Dispatch
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Observe real-time visitor discussions with MARVZ AI and intervene with live agent replies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {needsSupportCount > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/80 border border-red-500 text-xs font-bold text-red-300 animate-pulse">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              {needsSupportCount} Need Human Agent!
            </span>
          )}

          <button
            onClick={fetchConversations}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh Conversations"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Two-Pane Chat Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[650px]">
        
        {/* Left Pane (4 cols): Thread Selector */}
        <div className="lg:col-span-4 rounded-2xl bg-[#080d1a] border border-slate-800 flex flex-col overflow-hidden">
          
          {/* Filter Bar */}
          <div className="p-3.5 border-b border-slate-800 space-y-2 bg-slate-900/60">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search visitor, email, messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center gap-1 text-[11px] overflow-x-auto pb-0.5 scrollbar-none">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                  statusFilter === 'all' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({conversations.length})
              </button>
              <button
                onClick={() => setStatusFilter('support')}
                className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                  statusFilter === 'support' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Needs Human ({needsSupportCount})
              </button>
              <button
                onClick={() => setStatusFilter('bot')}
                className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                  statusFilter === 'bot' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Bot Active
              </button>
            </div>
          </div>

          {/* Conversations Scroll List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading threads...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No active conversations found.</div>
            ) : (
              filteredConversations.map((c) => {
                const isSelected = c.id === selectedConvId;
                const lastMsg = c.messages[c.messages.length - 1];

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedConvId(c.id)}
                    className={`p-3 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-slate-900 border-red-500/80 shadow-md'
                        : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white truncate max-w-[150px]">
                        {c.visitorName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(c.lastActivity).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 truncate mb-2">
                      {lastMsg ? `${lastMsg.sender === 'visitor' ? 'Visitor' : 'AI'}: ${lastMsg.text}` : 'Empty'}
                    </p>

                    <div className="flex items-center justify-between text-[10px]">
                      <span
                        className={`px-2 py-0.5 rounded font-mono uppercase tracking-wider ${
                          c.status === 'Needs Human Support'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-bold'
                            : c.status === 'Human Joined'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            : c.status === 'Resolved'
                            ? 'bg-slate-800 text-slate-400'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {c.status}
                      </span>

                      <span className="text-slate-500 font-mono">
                        {c.messages.length} msgs
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane (8 cols): Active Chat Transcript & Agent Reply Box */}
        <div className="lg:col-span-8 rounded-2xl bg-[#080d1a] border border-slate-800 flex flex-col overflow-hidden">
          {selectedConv ? (
            <>
              {/* Transcript Header */}
              <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-950 flex items-center justify-center text-white font-bold text-sm">
                    {selectedConv.visitorName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      {selectedConv.visitorName}
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {selectedConv.visitorLanguage}
                      </span>
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      {selectedConv.visitorEmail && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-500" />
                          {selectedConv.visitorEmail}
                        </span>
                      )}
                      {selectedConv.visitorPhone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-500" />
                          {selectedConv.visitorPhone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Switcher */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Status:</span>
                  <select
                    value={selectedConv.status}
                    onChange={(e) => handleUpdateStatus(selectedConv.id, e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-red-500"
                  >
                    <option value="Bot Handling">Bot Handling</option>
                    <option value="Needs Human Support">Needs Human Support</option>
                    <option value="Human Joined">Human Joined</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>

              {/* Message Transcript */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3.5 text-xs">
                {selectedConv.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'visitor'
                        ? 'items-start'
                        : msg.sender === 'agent'
                        ? 'items-end'
                        : 'items-start pl-4'
                    }`}
                  >
                    <div className="flex items-start gap-2 max-w-[85%]">
                      {msg.sender === 'visitor' && (
                        <div className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                          <User className="w-3.5 h-3.5" />
                        </div>
                      )}

                      {msg.sender === 'bot' && (
                        <div className="w-6 h-6 rounded-md bg-red-950 border border-red-500/40 text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <div
                        className={`p-3.5 rounded-2xl leading-relaxed ${
                          msg.sender === 'visitor'
                            ? 'bg-slate-900 border border-slate-800 text-white rounded-tl-xs'
                            : msg.sender === 'agent'
                            ? 'bg-gradient-to-r from-blue-700 to-blue-800 text-white rounded-tr-xs shadow-md'
                            : 'bg-slate-950/80 border border-slate-800/80 text-slate-300 rounded-tl-xs'
                        }`}
                      >
                        {msg.sender === 'agent' && (
                          <div className="text-[10px] font-bold text-blue-200 mb-1 flex items-center gap-1">
                            <Headphones className="w-3 h-3" />
                            {msg.agentName || 'Engineering Agent'}
                          </div>
                        )}

                        <p className="whitespace-pre-line">{msg.text}</p>

                        {msg.flagHuman && (
                          <div className="mt-2 text-[10px] text-amber-300 bg-amber-950/60 p-1.5 rounded flex items-center gap-1 border border-amber-800/40 font-semibold">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            Visitor requested human contact
                          </div>
                        )}
                      </div>

                      {msg.sender === 'agent' && (
                        <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                          <Headphones className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <span className="text-[10px] text-slate-500 mt-0.5 px-1 font-mono">
                      {msg.timestamp}
                    </span>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="p-3 border-t border-slate-800 bg-slate-950/90 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Headphones className="w-3.5 h-3.5 text-blue-400" />
                    Replying as:
                  </span>
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-xs text-white w-48 text-right"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type official reply directly to this visitor's screen..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim() || sendingReply}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-xs font-semibold shadow-md disabled:opacity-40 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send to Visitor</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
              Select a conversation from the left pane to monitor or intervene.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
