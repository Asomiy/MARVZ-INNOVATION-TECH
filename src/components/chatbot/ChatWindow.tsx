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
  Globe
} from 'lucide-react';
import { QUICK_REPLIES, QuickReply } from './chatbotKnowledge';

interface Message {
  id: string;
  role: 'bot' | 'user' | 'agent';
  agentName?: string;
  text: string;
  timestamp: string;
  language?: 'English' | 'Bangla' | 'Banglish';
  showEscalation?: boolean;
  showLeadFormTrigger?: boolean;
}

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenKnowledgeBase: () => void;
  onOpenAdmin: () => void;
  onOpenLeadModal: (category?: string) => void;
}

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
    welcomeMessage: 'Hello! Welcome to MARVZ & INNOVATION TECH. How can I assist you today?',
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

  // Initialize or restore conversation ID
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
          // Set initial greeting
          setMessages([
            {
              id: 'msg-init',
              role: 'bot',
              text: data.welcomeMessage || "Hello! Welcome to **MARVZ & INNOVATION TECH**. How can I assist you today?",
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              language: 'English',
            },
          ]);
        }
      })
      .catch(() => {
        setMessages([
          {
            id: 'msg-init',
            role: 'bot',
            text: "Hello! Welcome to **MARVZ & INNOVATION TECH**. How can I assist you today?",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            language: 'English',
          },
        ]);
      });
  }, []);

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
            // Check if there are agent messages not in our current state
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
        text: `Thank you for reaching out! You can speak directly with our engineering advisory desk via WhatsApp at **${config.contactWhatsApp}** or submit your inquiry below.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        showEscalation: true,
        showLeadFormTrigger: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickReply = (qr: QuickReply) => {
    handleSendMessage(qr.prompt);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'msg-init-reset',
        role: 'bot',
        text: config.welcomeMessage || "Hello! Welcome to **MARVZ & INNOVATION TECH**. How can I assist you today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
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
    <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[600px] max-h-[calc(100vh-6rem)] bg-[#070b15] border border-red-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slideUp">
      
      {/* Top Header */}
      <div className="p-3.5 bg-gradient-to-r from-red-950/80 via-[#0a0f20] to-[#0a0f20] border-b border-red-500/30 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-red-500/50 flex items-center justify-center overflow-hidden shadow-md shadow-red-950/60 p-1">
              <img
                src="/assets/aistudio/Capture.JPG11_7f7b0bf9.JPG"
                alt="MARVZ Logo"
                className="w-full h-full object-contain filter drop-shadow"
              />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#070b15]" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white tracking-wide">{config.chatbotName}</h3>
              <span className="text-[9px] px-1.5 py-0.2 rounded font-mono uppercase bg-red-600/30 text-red-300 border border-red-500/40">
                PRO
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Autonomous Support & R&D Desk</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 text-slate-400">
          <button
            onClick={onOpenKnowledgeBase}
            className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors"
            title="Browse Knowledge Base & FAQs"
            aria-label="Browse Knowledge Base"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenAdmin}
            className="p-1.5 rounded-lg text-red-400 hover:text-white hover:bg-red-600/30 transition-colors border border-red-500/30 bg-red-950/40"
            title="Open MARVZ AI Control Center Dashboard"
            aria-label="Open AI Control Center"
          >
            <Shield className="w-4 h-4 text-red-400" />
          </button>

          <button
            onClick={handleResetChat}
            className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors"
            title="Clear & Restart Conversation"
            aria-label="Restart Conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-red-600/20 transition-colors ml-1"
            title="Close Assistant"
            aria-label="Close Assistant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Language Preference Banner */}
      <div className="px-3.5 py-1.5 bg-[#090e1c] border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <Globe className="w-3 h-3 text-red-400" />
          <span>Language:</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSelectedLang('auto')}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
              selectedLang === 'auto' ? 'bg-red-600 text-white font-bold' : 'hover:text-slate-200'
            }`}
          >
            Auto Detect
          </button>
          <button
            onClick={() => setSelectedLang('en')}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
              selectedLang === 'en' ? 'bg-red-600 text-white font-bold' : 'hover:text-slate-200'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setSelectedLang('bn')}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
              selectedLang === 'bn' ? 'bg-red-600 text-white font-bold' : 'hover:text-slate-200'
            }`}
          >
            বাংলা
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs text-slate-200">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-start gap-2 max-w-[88%]">
              {msg.role === 'bot' && (
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-red-600 to-red-950 border border-red-500/40 flex items-center justify-center shrink-0 mt-0.5 shadow-sm text-white">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              {msg.role === 'agent' && (
                <div className="w-6 h-6 rounded-lg bg-blue-600 border border-blue-400 flex items-center justify-center shrink-0 mt-0.5 text-white">
                  <Headphones className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`p-3 rounded-2xl leading-relaxed text-xs ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white rounded-tr-xs shadow-md shadow-red-950/40'
                    : msg.role === 'agent'
                    ? 'bg-blue-950 border border-blue-500/50 text-blue-100 rounded-tl-xs shadow-md'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-xs shadow-sm'
                }`}
              >
                {msg.role === 'agent' && (
                  <div className="text-[10px] font-bold text-blue-300 mb-1 flex items-center gap-1">
                    <Headphones className="w-3 h-3 text-blue-400" />
                    {msg.agentName || 'MARVZ Engineering Agent'}
                  </div>
                )}

                {formatMessageText(msg.text)}

                {/* Inline Escalation Card if triggered */}
                {msg.showEscalation && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-2">
                    <p className="font-semibold text-white flex items-center gap-1.5 text-[11px]">
                      <Headphones className="w-3.5 h-3.5 text-red-400" />
                      Direct Human Support Options:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={`https://wa.me/${config.contactWhatsApp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider transition-colors"
                      >
                        <MessageCircle className="w-3 h-3" />
                        WhatsApp Desk
                      </a>
                      <a
                        href={`tel:${config.contactPhone.replace(/[^0-9+]/g, '')}`}
                        className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold uppercase tracking-wider transition-colors"
                      >
                        Call Hotline
                      </a>
                    </div>
                  </div>
                )}

                {/* Inline Lead Form Trigger Card */}
                {msg.showLeadFormTrigger && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                    <button
                      onClick={() => onOpenLeadModal('Services')}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white text-[11px] font-semibold shadow-md transition-all group"
                    >
                      <FileCheck2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                      <span>Book Consultation / Request Quote</span>
                    </button>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-slate-300">
                  <User className="w-3.5 h-3.5" />
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

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-6 h-6 rounded-lg bg-red-950 border border-red-500/30 flex items-center justify-center shrink-0 text-red-400">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">MARVZ AI is generating...</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reply Suggestions */}
      {showQuickReplies && config.enableQuickReplies && (
        <div className="px-3 py-2 bg-[#090d19] border-t border-slate-800/80 shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
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
                onClick={() => handleQuickReply(qr)}
                className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-red-900/60 text-slate-300 hover:text-white border border-slate-800 hover:border-red-500/50 text-[11px] whitespace-nowrap transition-all shadow-xs"
              >
                {qr.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer Input Area */}
      <div className="p-3 bg-[#080c18] border-t border-slate-800/90 shrink-0">
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
                  : 'Ask about AI, software, drones, training, fees...'
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="p-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-red-950/50 transition-all shrink-0"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 px-1">
          <span>Powered by Gemini 3.8 Flash & MARVZ Knowledge Core</span>
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
