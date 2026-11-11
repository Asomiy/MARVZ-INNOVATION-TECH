import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  BookOpen,
  Headphones,
  RotateCcw,
  Shield,
  MessageCircle,
  FileCheck2,
  ChevronDown,
  Globe,
  ArrowRight,
  HelpCircle,
  PhoneCall
} from 'lucide-react';
import { SUGGESTED_QUESTIONS, QUICK_REPLIES, QuickReply } from './chatbotKnowledge';

interface Message {
  id: string;
  role: 'bot' | 'user' | 'agent';
  agentName?: string;
  text: string;
  timestamp: string;
  language?: 'English' | 'Bangla' | 'Banglish';
  showEscalation?: boolean;
  showLeadFormTrigger?: boolean;
  isInitialWelcome?: boolean;
}

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenKnowledgeBase: () => void;
  onOpenAdmin: () => void;
  onOpenLeadModal: (category?: string) => void;
}

const DEFAULT_WELCOME = "Hello! Welcome to MARVZ & INNOVATION TECH. How can I help you today?";

export const ChatWindow: React.FC<ChatWindowProps> = ({
  isOpen,
  onClose,
  onOpenKnowledgeBase,
  onOpenAdmin,
  onOpenLeadModal,
}) => {
  const [conversationId, setConversationId] = useState<string>('');
  const [config, setConfig] = useState<{
    chatbotName: string;
    welcomeMessage: string;
    welcomeMessageBn?: string;
    contactWhatsApp: string;
    contactPhone: string;
    enableQuickReplies: boolean;
    enableLeadFormPrompt: boolean;
    enableHumanEscalation: boolean;
  }>({
    chatbotName: 'MARVZ AI Assistant',
    welcomeMessage: DEFAULT_WELCOME,
    welcomeMessageBn: 'হ্যালো! MARVZ & INNOVATION TECH-এ আপনাকে স্বাগতম। আজ কীভাবে সাহায্য করতে পারি?',
    contactWhatsApp: '+880 1711-000000',
    contactPhone: '+880 1800-MARVZ-TECH',
    enableQuickReplies: true,
    enableLeadFormPrompt: true,
    enableHumanEscalation: true,
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedLang, setSelectedLang] = useState<'auto' | 'en' | 'bn'>('auto');
  const [showQuickReplies, setShowQuickReplies] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize or restore conversation ID and history from sessionStorage
  useEffect(() => {
    let convId = sessionStorage.getItem('marvz_visitor_conv_id');
    if (!convId) {
      convId = `conv-${Date.now()}`;
      sessionStorage.setItem('marvz_visitor_conv_id', convId);
    }
    setConversationId(convId);

    // Fetch dynamic visitor config from backend
    fetch('/api/visitor/config')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setConfig(data);
        }
      })
      .catch(() => {});

    // Restore saved session history if available
    const savedHistory = sessionStorage.getItem('marvz_chat_history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      } catch (e) {
        // Fallback to fresh welcome
      }
    }

    // Default initial greeting message
    setMessages([
      {
        id: 'msg-init',
        role: 'bot',
        text: DEFAULT_WELCOME,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: 'English',
        isInitialWelcome: true,
      },
    ]);
  }, []);

  // Save history to sessionStorage when updated
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem('marvz_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        scrollToBottom();
      }, 150);
    }
  }, [isOpen, messages]);

  // Poll conversation to see if an admin agent replied from the Control Center
  useEffect(() => {
    if (!isOpen || !conversationId) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/conversations/${conversationId}/poll`);
        if (res.ok) {
          const data = await res.json();
          if (data.messages && data.messages.length > 0) {
            const hasAgentMsg = data.messages.some((m: any) => m.sender === 'agent');
            if (hasAgentMsg) {
              const formatted: Message[] = data.messages.map((m: any) => ({
                id: m.id,
                role: m.sender === 'visitor' ? 'user' : m.sender === 'agent' ? 'agent' : 'bot',
                agentName: m.agentName,
                text: m.text,
                timestamp: m.timestamp,
                language: m.language,
                showEscalation: m.flagHuman,
              }));
              setMessages(formatted);
            }
          }
        }
      } catch (err) {
        // Silently skip poll errors
      }
    }, 4500);

    return () => clearInterval(pollInterval);
  }, [isOpen, conversationId]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const raw = textToSend || inputText;
    if (!raw.trim() || isTyping) return;

    const userText = raw.trim();
    setInputText('');

    const newUserMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setIsTyping(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      let finalPrompt = userText;
      if (selectedLang === 'bn' && !/[\u0980-\u09FF]/.test(userText)) {
        finalPrompt = `${userText} (Please reply in Bangla)`;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: finalPrompt,
          conversationId,
          history: historyPayload,
        }),
      });

      if (!response.ok) {
        throw new Error('Server returned an error');
      }

      const data = await response.json();

      const isHumanTrigger = /human|agent|contact|call|whatsapp|person|সরাসরি|কথা/i.test(userText);
      const isLeadTrigger = /quote|price|cost|admission|enroll|course|intern|hire|build|প্রজেক্ট|ভর্তি|কোর্স/i.test(userText);

      const botReplyMsg: Message = {
        id: `msg-bot-${Date.now()}`,
        role: 'bot',
        text: data.reply || "I am here to assist you with MARVZ & INNOVATION TECH. Feel free to ask about our software, AI, drone, robotics, or training services.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: data.language,
        showEscalation: isHumanTrigger && config.enableHumanEscalation,
        showLeadFormTrigger: isLeadTrigger && config.enableLeadFormPrompt,
      };

      setMessages((prev) => [...prev, botReplyMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: Message = {
        id: `msg-err-${Date.now()}`,
        role: 'bot',
        text: `Thank you for reaching out! You can speak directly with our engineering advisory desk via WhatsApp at **${config.contactWhatsApp}** or phone at **${config.contactPhone}**.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        showEscalation: true,
        showLeadFormTrigger: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickQuestionClick = (question: string) => {
    handleSendMessage(question);
  };

  const handleEscalateToHuman = () => {
    handleSendMessage('I would like to speak directly with a human advisor or customer support specialist.');
  };

  const handleResetChat = () => {
    const freshInit: Message[] = [
      {
        id: `msg-reset-${Date.now()}`,
        role: 'bot',
        text: DEFAULT_WELCOME,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: 'English',
        isInitialWelcome: true,
      },
    ];
    setMessages(freshInit);
    sessionStorage.setItem('marvz_chat_history', JSON.stringify(freshInit));
    setShowQuickReplies(true);
  };

  const formatMessageText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
      
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1 pl-1">
            <span className="text-red-500 font-bold shrink-0 mt-0.5">•</span>
            <span dangerouslySetInnerHTML={{ __html: formatted.replace(/^[•\-]\s*/, '') }} />
          </div>
        );
      }

      if (line.match(/^\d+\.\s/)) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1 pl-1">
            <span className="text-red-400 font-bold font-mono text-xs shrink-0 mt-0.5">
              {line.match(/^\d+\./)?.[0]}
            </span>
            <span dangerouslySetInnerHTML={{ __html: formatted.replace(/^\d+\.\s*/, '') }} />
          </div>
        );
      }

      return (
        <p key={idx} className={`${line.trim() === '' ? 'h-2' : 'my-1'}`} dangerouslySetInnerHTML={{ __html: formatted }} />
      );
    });
  };

  return (
    <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[620px] max-h-[calc(100vh-6rem)] bg-[#081426]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.7)] border-t-red-500/40 flex flex-col overflow-hidden animate-slideUp text-slate-100">
      
      {/* Top Header - Glassmorphic Navy with Red Metallic Trims */}
      <div className="p-3.5 bg-gradient-to-r from-red-950/70 via-[#0A162B] to-[#0A162B] border-b border-white/10 flex items-center justify-between shrink-0 relative">
        
        {/* Assistant Avatar & Online Badge */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-[#0B1528] border border-red-500/50 flex items-center justify-center overflow-hidden shadow-lg shadow-red-950/60 p-1">
              <img
                src="/assets/aistudio/Capture.JPG11_7f7b0bf9.JPG"
                alt="MARVZ Logo"
                className="w-full h-full object-contain filter drop-shadow"
              />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#081426] shadow-sm animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white tracking-wide">{config.chatbotName}</h3>
              <span className="text-[9px] px-1.5 py-0.2 rounded font-mono uppercase bg-red-600/30 text-red-300 border border-red-500/40">
                AI ACTIVE
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="text-emerald-400 font-medium">● Online</span>
              <span>| MARVZ & INNOVATION TECH</span>
            </div>
          </div>
        </div>

        {/* Action Controls & Escalation */}
        <div className="flex items-center gap-1 text-slate-400">
          
          <button
            onClick={handleEscalateToHuman}
            className="p-1.5 rounded-lg text-red-400 hover:text-white hover:bg-red-600/20 transition-colors"
            title="Talk to Human Support Specialist"
            aria-label="Escalate to Human Support"
          >
            <Headphones className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenKnowledgeBase}
            className="p-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors"
            title="Browse Knowledge Base & FAQs"
            aria-label="Browse Knowledge Base"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenAdmin}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/5 transition-colors"
            title="Open MARVZ AI Control Center Dashboard"
            aria-label="Open AI Control Center"
          >
            <Shield className="w-4 h-4" />
          </button>

          <button
            onClick={handleResetChat}
            className="p-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors"
            title="Clear & Restart Session"
            aria-label="Restart Conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-red-600/20 transition-colors ml-0.5"
            title="Close Chat"
            aria-label="Close Assistant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Language Preference Banner - Auto / English / বাংলা */}
      <div className="px-3.5 py-1.5 bg-[#071120]/80 border-b border-white/5 flex items-center justify-between text-[11px] text-slate-400 backdrop-blur-sm">
        <div className="flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-red-400" />
          <span className="font-medium">Language:</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSelectedLang('auto')}
            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors ${
              selectedLang === 'auto' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Auto Detect
          </button>
          <button
            onClick={() => setSelectedLang('en')}
            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors ${
              selectedLang === 'en' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setSelectedLang('bn')}
            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors ${
              selectedLang === 'bn' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            বাংলা
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs text-slate-200 scrollbar-thin">
        {messages.map((msg, idx) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-start gap-2.5 max-w-[88%]">
              
              {/* Bot Avatar */}
              {msg.role === 'bot' && (
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-red-600 to-red-950 border border-red-500/50 flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-red-950/50 text-white p-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Human Agent Avatar */}
              {msg.role === 'agent' && (
                <div className="w-7 h-7 rounded-xl bg-blue-600 border border-blue-400 flex items-center justify-center shrink-0 mt-0.5 text-white">
                  <Headphones className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl leading-relaxed text-xs ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white rounded-tr-xs shadow-md shadow-red-950/40 border border-red-500/30'
                    : msg.role === 'agent'
                    ? 'bg-blue-950/90 border border-blue-500/50 text-blue-100 rounded-tl-xs shadow-md'
                    : 'bg-[#0E1E38]/90 border border-white/10 text-slate-100 rounded-tl-xs shadow-sm backdrop-blur-md'
                }`}
              >
                {msg.role === 'agent' && (
                  <div className="text-[10px] font-bold text-blue-300 mb-1 flex items-center gap-1">
                    <Headphones className="w-3 h-3 text-blue-400" />
                    {msg.agentName || 'MARVZ Engineering Executive'}
                  </div>
                )}

                {formatMessageText(msg.text)}

                {/* Initial Welcome Suggested Questions Card */}
                {msg.isInitialWelcome && (
                  <div className="mt-3.5 pt-3 border-t border-white/10 space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-red-400">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Suggested Questions:</span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      {SUGGESTED_QUESTIONS.map((sq, sIdx) => (
                        <button
                          key={sq.id}
                          onClick={() => handleQuickQuestionClick(sq.question)}
                          className="flex items-center justify-between text-left p-2 rounded-xl bg-white/5 hover:bg-red-600/20 border border-white/5 hover:border-red-500/40 text-slate-200 hover:text-white transition-all group"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center font-mono text-[9px] font-bold">
                              {sIdx + 1}
                            </span>
                            <span className="text-[11px] font-medium">{sq.question}</span>
                          </div>
                          <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-red-400 transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Inline Escalation Card if triggered */}
                {msg.showEscalation && (
                  <div className="mt-3 pt-2.5 border-t border-white/10 space-y-2">
                    <p className="font-semibold text-white flex items-center gap-1.5 text-[11px]">
                      <Headphones className="w-3.5 h-3.5 text-red-400" />
                      Direct Human Support Options:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={`https://wa.me/${config.contactWhatsApp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider transition-colors shadow-md"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        WhatsApp Desk
                      </a>
                      <a
                        href={`tel:${config.contactPhone.replace(/[^0-9+]/g, '')}`}
                        className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-[#091529] hover:bg-slate-800 border border-white/10 text-slate-200 text-[10px] font-bold uppercase tracking-wider transition-colors"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
                        Call Hotline
                      </a>
                    </div>
                  </div>
                )}

                {/* Inline Lead Form Trigger Card */}
                {msg.showLeadFormTrigger && (
                  <div className="mt-3 pt-2.5 border-t border-white/10">
                    <button
                      onClick={() => onOpenLeadModal('Services')}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-[11px] font-semibold shadow-md transition-all group"
                    >
                      <FileCheck2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                      <span>Book Consultation / Request Quote</span>
                    </button>
                  </div>
                )}
              </div>

              {/* User Avatar */}
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-slate-300">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-slate-500">
              <span>{msg.timestamp}</span>
              {msg.language && (
                <span className="font-mono text-red-400/80">[{msg.language}]</span>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator: "AI is typing..." */}
        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-7 h-7 rounded-xl bg-red-950 border border-red-500/40 flex items-center justify-center shrink-0 text-red-400">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="p-3 rounded-2xl bg-[#0E1E38]/90 border border-white/10 flex items-center gap-2 shadow-sm backdrop-blur-md">
              <span className="text-[11px] font-medium text-slate-300">AI is typing...</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reply Suggestions Bar */}
      {showQuickReplies && config.enableQuickReplies && (
        <div className="px-3 py-2 bg-[#061021]/90 border-t border-white/10 shrink-0 backdrop-blur-md">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Quick Suggestions
            </span>
            <button
              onClick={() => setShowQuickReplies(false)}
              className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-0.5"
            >
              Hide <ChevronDown className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {QUICK_REPLIES.map((qr) => (
              <button
                key={qr.id}
                onClick={() => handleQuickQuestionClick(qr.prompt)}
                className="px-3 py-1 rounded-full bg-[#0A1830] hover:bg-red-600/30 text-slate-300 hover:text-white border border-white/10 hover:border-red-500/50 text-[11px] whitespace-nowrap transition-all shadow-xs"
              >
                {qr.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer Input Area */}
      <div className="p-3 bg-[#071122] border-t border-white/10 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              placeholder={
                selectedLang === 'bn'
                  ? 'আপনার প্রশ্ন বা প্রজেক্টের বিস্তারিত লিখুন...'
                  : 'Type your question in English or বাংলা...'
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1832] border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="p-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-red-950/60 transition-all shrink-0"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 px-1">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-red-400" />
            Gemini AI Powered • MARVZ Official Assistant
          </span>
          <button
            onClick={() => onOpenLeadModal('Services')}
            className="text-red-400 hover:text-red-300 underline font-medium"
          >
            Request Callback
          </button>
        </div>
      </div>

    </div>
  );
};
