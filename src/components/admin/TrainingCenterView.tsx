import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  HelpCircle,
  CheckCircle2,
  Trash2,
  Send,
  Bot,
  User,
  RotateCcw,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Check,
  MessageSquare
} from 'lucide-react';
import { UnansweredQuestion } from '../../types/admin';

interface TrainingCenterViewProps {
  onKnowledgeUpdated?: () => void;
}

export const TrainingCenterView: React.FC<TrainingCenterViewProps> = ({ onKnowledgeUpdated }) => {
  const [unanswered, setUnanswered] = useState<UnansweredQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'unanswered' | 'sandbox'>('unanswered');

  // Answer drafting state
  const [selectedQuestion, setSelectedQuestion] = useState<UnansweredQuestion | null>(null);
  const [answerDraft, setAnswerDraft] = useState('');
  const [answerDraftBn, setAnswerDraftBn] = useState('');
  const [categoryDraft, setCategoryDraft] = useState('AI');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Playground / Sandbox state
  const [testInput, setTestInput] = useState('');
  const [testChatMessages, setTestChatMessages] = useState<
    Array<{ role: 'user' | 'bot'; text: string; source?: string; timestamp: string }>
  >([
    {
      role: 'bot',
      text: 'Hello! I am connected to the MARVZ AI live knowledge base. Test questions with me to verify how newly added information and documents are answered.',
      timestamp: 'Ready',
    },
  ]);
  const [testingAi, setTestingAi] = useState(false);

  const fetchUnanswered = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/unanswered');
      if (res.ok) {
        const data = await res.json();
        setUnanswered(data.questions || []);
      }
    } catch (err) {
      console.error('Failed to load unanswered questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnanswered();
  }, []);

  const handleSelectToAnswer = (item: UnansweredQuestion) => {
    setSelectedQuestion(item);
    setAnswerDraft(item.suggestedAnswer || '');
    setAnswerDraftBn('');
    setCategoryDraft('Training');
  };

  const handleApproveAndPublish = async () => {
    if (!selectedQuestion || !answerDraft.trim()) return;

    setSubmittingAnswer(true);
    try {
      const res = await fetch(`/api/admin/unanswered/${selectedQuestion.id}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answer: answerDraft.trim(),
          answerBn: answerDraftBn.trim(),
          category: categoryDraft,
          publishToKb: true,
        }),
      });

      if (res.ok) {
        setSuccessNotice(`Answer approved and published to Knowledge Base! Visitors asking this will now receive the official answer.`);
        setSelectedQuestion(null);
        setAnswerDraft('');
        setAnswerDraftBn('');
        fetchUnanswered();
        if (onKnowledgeUpdated) onKnowledgeUpdated();
      }
    } catch (err) {
      console.error('Approval failed:', err);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleDismissQuestion = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/unanswered/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUnanswered((prev) => prev.filter((u) => u.id !== id));
        if (selectedQuestion?.id === id) setSelectedQuestion(null);
      }
    } catch (err) {
      console.error('Failed to dismiss:', err);
    }
  };

  const handleSendTestMessage = async () => {
    if (!testInput.trim() || testingAi) return;
    const prompt = testInput.trim();
    setTestInput('');

    const newHistory = [
      ...testChatMessages,
      {
        role: 'user' as const,
        text: prompt,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
    setTestChatMessages(newHistory);
    setTestingAi(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          conversationId: 'sandbox-test-thread',
          visitorName: 'Admin Sandbox Tester',
          history: testChatMessages.map((m) => ({
            role: m.role === 'user' ? 'user' : 'model',
            text: m.text,
          })),
        }),
      });

      const data = await res.json();
      setTestChatMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: data.reply || 'No response generated.',
          source: data.source,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      setTestChatMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: 'Error connecting to AI engine in test sandbox.',
          timestamp: 'Error',
        },
      ]);
    } finally {
      setTestingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-500" />
            Chatbot Training Center & AI Playground
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review unanswered visitor queries, write verified answers, and test AI responses in real-time.
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('unanswered')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'unanswered' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Unanswered Queue ({unanswered.filter((u) => u.status === 'Pending Review').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sandbox')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'sandbox' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Test Playground Sandbox</span>
          </button>
        </div>
      </div>

      {successNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successNotice}</span>
          </div>
          <button onClick={() => setSuccessNotice(null)} className="text-emerald-400 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* View 1: Unanswered Questions & Teaching Interface */}
      {activeTab === 'unanswered' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column: Questions List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                Visitor Questions Pending Review
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {unanswered.length} records
              </span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading unanswered questions...</div>
            ) : unanswered.length === 0 ? (
              <div className="py-16 text-center rounded-2xl bg-[#080d1a] border border-slate-800 text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-white">All Visitor Questions Answered!</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  The AI knowledge base has addressed all recent visitor inquiries. Check the Sandbox to test new simulated prompts.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {unanswered.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      selectedQuestion?.id === item.id
                        ? 'bg-red-950/20 border-red-500 shadow-md shadow-red-950/30'
                        : 'bg-[#080d1a] border-slate-800 hover:border-slate-700'
                    }`}
                    onClick={() => handleSelectToAnswer(item)}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2">
                      <span className="px-2 py-0.5 rounded font-mono uppercase bg-slate-900 border border-slate-800 text-amber-400">
                        {item.visitorLanguage}
                      </span>
                      <span>{new Date(item.askedAt).toLocaleDateString()} {new Date(item.askedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <p className="text-xs font-semibold text-white">
                      "{item.question}"
                    </p>

                    {item.suggestedAnswer && (
                      <p className="mt-2 text-[11px] text-slate-400 bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                        <strong className="text-slate-300">Suggested Draft:</strong> {item.suggestedAnswer}
                      </p>
                    )}

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-red-400 text-[11px] font-medium flex items-center gap-1">
                        Click to write answer <ArrowRight className="w-3 h-3" />
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDismissQuestion(item.id);
                        }}
                        className="text-slate-500 hover:text-red-400 p-1"
                        title="Dismiss question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Writing & Approving Box */}
          <div className="p-6 rounded-2xl bg-[#080d1a] border border-slate-800 flex flex-col h-fit">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-red-500" />
              Write Verified Answer & Publish to Chatbot
            </h3>

            {selectedQuestion ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80">
                  <span className="text-[10px] uppercase font-mono text-slate-400">Selected Question:</span>
                  <p className="text-xs font-bold text-white mt-1">"{selectedQuestion.question}"</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Assign Category
                  </label>
                  <select
                    value={categoryDraft}
                    onChange={(e) => setCategoryDraft(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-red-500"
                  >
                    <option value="AI">AI & Machine Learning</option>
                    <option value="Drones">Drone Technology & UAV</option>
                    <option value="Robotics">Robotics & Industrial Automation</option>
                    <option value="Software">Software & Cloud Development</option>
                    <option value="Cybersecurity">Cybersecurity & Defense</option>
                    <option value="Training">Training & Bootcamps</option>
                    <option value="Internships">Internships & Fellowships</option>
                    <option value="Contact">Contact & Office Operations</option>
                    <option value="Custom">Custom Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Official Answer in English *
                  </label>
                  <textarea
                    rows={4}
                    value={answerDraft}
                    onChange={(e) => setAnswerDraft(e.target.value)}
                    placeholder="Enter the official approved answer that the AI will use..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Official Answer in Bengali (বাংলায় উত্তর - ঐচ্ছিক)
                  </label>
                  <textarea
                    rows={3}
                    value={answerDraftBn}
                    onChange={(e) => setAnswerDraftBn(e.target.value)}
                    placeholder="বাংলা ভাষাভাষী ভিজিটরের জন্য উপযুক্ত স্পষ্ট উত্তর..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedQuestion(null)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleApproveAndPublish}
                    disabled={submittingAnswer || !answerDraft.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-semibold shadow-md disabled:opacity-50 transition-all"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{submittingAnswer ? 'Publishing...' : 'Approve & Publish to AI'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-500 text-xs">
                Select an unanswered question from the left panel to compose and approve an official answer.
              </div>
            )}
          </div>

        </div>
      )}

      {/* View 2: Interactive Sandbox & Testing Playground */}
      {activeTab === 'sandbox' && (
        <div className="p-6 rounded-2xl bg-[#080d1a] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bot className="w-4 h-4 text-red-500" />
                Live Pre-Publication AI Sandbox
              </h3>
              <p className="text-xs text-slate-400">
                Directly interact with the AI assistant to test recent document ingests, published FAQs, and system prompt changes.
              </p>
            </div>
            <button
              onClick={() =>
                setTestChatMessages([
                  {
                    role: 'bot',
                    text: 'Sandbox restarted. All live knowledge and uploaded documents are active.',
                    timestamp: 'Reset',
                  },
                ])
              }
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Test Chat</span>
            </button>
          </div>

          {/* Test Messages Stream */}
          <div className="h-96 overflow-y-auto p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3 text-xs">
            {testChatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-start gap-2 max-w-[85%]">
                  {msg.role === 'bot' && (
                    <div className="w-6 h-6 rounded-lg bg-red-600/30 border border-red-500/50 flex items-center justify-center shrink-0 mt-0.5 text-red-400">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`p-3 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-red-600 text-white rounded-tr-xs'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                    {msg.source && (
                      <span className="block mt-1 text-[9px] font-mono text-slate-400 border-t border-slate-800/60 pt-1">
                        Engine: {msg.source}
                      </span>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-slate-300">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-slate-500 mt-0.5 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {testingAi && (
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                <span>Simulating MARVZ AI query response...</span>
              </div>
            )}
          </div>

          {/* Sandbox Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendTestMessage();
            }}
            className="flex items-center gap-2 pt-2"
          >
            <input
              type="text"
              placeholder="Type any test query in English, Bangla, or Banglish (e.g. 'drone pilot certification fees')..."
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
            <button
              type="submit"
              disabled={!testInput.trim() || testingAi}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-semibold shadow-md disabled:opacity-40 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Simulate</span>
            </button>
          </form>

        </div>
      )}

    </div>
  );
};
