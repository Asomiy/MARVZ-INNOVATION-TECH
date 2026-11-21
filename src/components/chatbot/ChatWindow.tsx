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
  MessageCircle,
  FileCheck2,
  ChevronDown,
  Globe,
  ArrowRight,
  HelpCircle,
  PhoneCall,
  GripVertical
} from 'lucide-react';
import { SUGGESTED_QUESTIONS, QUICK_REPLIES } from './chatbotKnowledge';
import { useDraggablePosition, Position } from './useDraggablePosition';

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
  isStreaming?: boolean;
}

interface ChatWindowProps {
  isOpen: boolean;
  launcherPos?: Position;
  onClose: () => void;
  onOpenKnowledgeBase: () => void;
  onOpenLeadModal: (category?: string) => void;
}

const DEFAULT_WELCOME = "Hello! Welcome to MARVZ & INNOVATION TECH. How can I help you today?";

export const ChatWindow: React.FC<ChatWindowProps> = ({
  isOpen,
  launcherPos,
  onClose,
  onOpenKnowledgeBase,
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
    contactWhatsApp: '+8801775551987',
    contactPhone: '+8801775551987',
    enableQuickReplies: true,
    enableLeadFormPrompt: true,
    enableHumanEscalation: true,
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasServerThread, setHasServerThread] = useState(false);
  const [selectedLang, setSelectedLang] = useState<'auto' | 'en' | 'bn'>('auto');
  const [showQuickReplies, setShowQuickReplies] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const serverMsgCountRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    position: windowPos,
    isDragging: isWindowDragging,
    handlePointerDown: handleWindowPointerDown,
  } = useDraggablePosition({
    elementRef: windowRef,
    storageKey: 'marvz_chatbot_window_pos',
    fallbackSize: { width: 400, height: 580 },
    edgePadding: 8,
    isActive: isOpen,
    ignoreSelector: 'button, a, input, textarea, select, [data-no-drag="true"]',
    getInitialPosition: ({ width, height, viewportWidth, viewportHeight }) => {
      if (launcherPos) {
        const isRightHalf = launcherPos.x > viewportWidth / 2;
        const preferredX = isRightHalf ? launcherPos.x + 56 - width : launcherPos.x;
        const hasSpaceAbove = launcherPos.y - height - 12 >= 8;
        const preferredY = hasSpaceAbove
          ? launcherPos.y - height - 12
          : launcherPos.y + 84;
        return { x: preferredX, y: preferredY };
      }
      return {
        x: viewportWidth - width - 24,
        y: viewportHeight - height - 96,
      };
    },
  });

  // Initialize or restore conversation ID, cached config, and history efficiently
  useEffect(() => {
    let convId = sessionStorage.getItem('marvz_visitor_conv_id');
    if (!convId) {
      convId = `conv-${Date.now()}`;
      sessionStorage.setItem('marvz_visitor_conv_id', convId);
    }
    setConversationId(convId);

    const serverThreadExists = sessionStorage.getItem('marvz_has_server_thread') === '1';
    setHasServerThread(serverThreadExists);

    // Load cached visitor config immediately; only revalidate if older than 5 minutes
    const cachedCfgRaw = sessionStorage.getItem('marvz_visitor_config_v1');
    let shouldFetchConfig = true;
    if (cachedCfgRaw) {
      try {
        const parsedCfg = JSON.parse(cachedCfgRaw);
        if (parsedCfg?.data) {
          setConfig(parsedCfg.data);
          if (Date.now() - (parsedCfg.cachedAt || 0) < 5 * 60 * 1000) {
            shouldFetchConfig = false;
          }
        }
      } catch {
        // Ignore malformed cache
      }
    }

    if (shouldFetchConfig) {
      fetch('/api/visitor/config')
        .then((res) => {
          const contentType = res.headers.get('content-type') || '';
          return res.ok && contentType.includes('application/json') ? res.json() : null;
        })
        .then((data) => {
          if (data) {
            setConfig(data);
            try {
              sessionStorage.setItem(
                'marvz_visitor_config_v1',
                JSON.stringify({ data, cachedAt: Date.now() })
              );
            } catch {
              // Ignore quota errors
            }
          }
        })
        .catch(() => {});
    }

    // Restore saved session history synchronously (instant load)
    const savedHistory = sessionStorage.getItem('marvz_chat_history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed.map((m: Message) => ({ ...m, isStreaming: false })));
          return;
        }
      } catch {
        // Fallback to server history or welcome
      }
    }

    // If an active thread exists on server without local cache, hydrate from lightweight endpoint
    if (serverThreadExists) {
      fetch(`/api/conversations/${convId}/history?limit=30`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.messages?.length > 0) {
            serverMsgCountRef.current = data.count || data.messages.length;
            setMessages(
              data.messages.map((m: any) => ({
                id: m.id,
                role: m.sender === 'visitor' ? 'user' : m.sender === 'agent' ? 'agent' : 'bot',
                agentName: m.agentName,
                text: m.text,
                timestamp: m.timestamp,
                language: m.language,
                showEscalation: m.flagHuman,
              }))
            );
            return;
          }
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
        })
        .catch(() => {});
      return;
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

  // Save history to sessionStorage only when not mid-stream (avoids redundant serialization per token)
  useEffect(() => {
    if (messages.length > 0 && !isStreaming) {
      try {
        sessionStorage.setItem('marvz_chat_history', JSON.stringify(messages.slice(-40)));
      } catch {
        // Ignore storage errors
      }
    }
  }, [messages, isStreaming]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages, isTyping]);

  // Lightweight delta polling only when a server thread exists and chat is idle
  useEffect(() => {
    if (!isOpen || !conversationId || !hasServerThread || isTyping || isStreaming) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/conversations/${conversationId}/poll?after=${serverMsgCountRef.current}`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (data.unchanged) return;

        serverMsgCountRef.current = data.count || data.messages?.length || 0;
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
      } catch {
        // Silently skip poll errors
      }
    }, 8000);

    return () => clearInterval(pollInterval);
  }, [isOpen, conversationId, hasServerThread, isTyping, isStreaming]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const raw = textToSend || inputText || inputRef.current?.value || '';
    if (!raw.trim() || isTyping || isStreaming) return;

    const userText = raw.trim();
    setInputText('');

    const newUserMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const historyPayload = messages
      .filter((m) => !m.isInitialWelcome)
      .slice(-6)
      .map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        text: m.text,
      }));

    setMessages((prev) => [...prev, newUserMsg]);
    setIsTyping(true);

    const isHumanTrigger = /human|agent|contact|call|whatsapp|person|সরাসরি|কথা/i.test(userText);
    const isLeadTrigger = /quote|price|cost|admission|enroll|course|intern|hire|build|প্রজেক্ট|ভর্তি|কোর্স/i.test(
      userText
    );

    let finalPrompt = userText;
    if (selectedLang === 'bn' && !/[\u0980-\u09FF]/.test(userText)) {
      finalPrompt = `${userText} (Please reply in Bangla)`;
    }

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const botMsgId = `msg-bot-${Date.now()}`;
    let streamMessageCreated = false;
    let accumulatedText = '';

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: finalPrompt,
          conversationId,
          history: historyPayload,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Streaming unavailable');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let sseBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        sseBuffer += decoder.decode(value, { stream: true });
        const events = sseBuffer.split('\n\n');
        sseBuffer = events.pop() || '';

        for (const rawEvent of events) {
          const lines = rawEvent.split('\n');
          for (const line of lines) {
            if (!line.startsWith('data:')) continue;
            const jsonStr = line.slice(5).trim();
            if (!jsonStr) continue;

            let evt: any;
            try {
              evt = JSON.parse(jsonStr);
            } catch {
              continue;
            }

            if (evt.type === 'meta') {
              if (evt.conversationId && evt.conversationId !== conversationId) {
                setConversationId(evt.conversationId);
                sessionStorage.setItem('marvz_visitor_conv_id', evt.conversationId);
              }
              setHasServerThread(true);
              sessionStorage.setItem('marvz_has_server_thread', '1');
            } else if (evt.type === 'delta' && evt.text) {
              accumulatedText += evt.text;
              if (!streamMessageCreated) {
                streamMessageCreated = true;
                setIsTyping(false);
                setIsStreaming(true);
                const timestamp = new Date().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                setMessages((prev) => [
                  ...prev,
                  {
                    id: botMsgId,
                    role: 'bot',
                    text: accumulatedText,
                    timestamp,
                    isStreaming: true,
                  },
                ]);
              } else {
                setMessages((prev) =>
                  prev.map((m) => (m.id === botMsgId ? { ...m, text: accumulatedText } : m))
                );
              }
            } else if (evt.type === 'done') {
              if (typeof evt.messageCount === 'number') {
                serverMsgCountRef.current = evt.messageCount;
              }
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === botMsgId
                    ? {
                        ...m,
                        text: accumulatedText || evt.reply || m.text,
                        language: evt.language,
                        showEscalation: isHumanTrigger && config.enableHumanEscalation,
                        showLeadFormTrigger: isLeadTrigger && config.enableLeadFormPrompt,
                        isStreaming: false,
                      }
                    : m
                )
              );
            } else if (evt.type === 'error') {
              throw new Error(evt.error || 'Stream error');
            }
          }
        }
      }

      if (!streamMessageCreated) {
        // Fallback if stream closed with no delta frames
        const fallbackRes = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: finalPrompt,
            conversationId,
            history: historyPayload,
          }),
        });
        if (!fallbackRes.ok) throw new Error('Chat request failed');
        const data = await fallbackRes.json();
        serverMsgCountRef.current = data.messageCount || serverMsgCountRef.current + 2;
        setHasServerThread(true);
        sessionStorage.setItem('marvz_has_server_thread', '1');
        setMessages((prev) => [
          ...prev,
          {
            id: botMsgId,
            role: 'bot',
            text:
              data.reply ||
              'I am here to assist you with MARVZ & INNOVATION TECH. Feel free to ask about our software, AI, drone, robotics, or training services.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            language: data.language,
            showEscalation: isHumanTrigger && config.enableHumanEscalation,
            showLeadFormTrigger: isLeadTrigger && config.enableLeadFormPrompt,
          },
        ]);
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      console.error('Chat error:', err);
      const fallbackText = `Thank you for reaching out! You can speak directly with our engineering advisory desk via WhatsApp at **${config.contactWhatsApp}** or phone at **${config.contactPhone}**.`;
      if (streamMessageCreated) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botMsgId
              ? {
                  ...m,
                  text: accumulatedText || fallbackText,
                  isStreaming: false,
                }
              : m
          )
        );
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-err-${Date.now()}`,
            role: 'bot',
            text: fallbackText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            showEscalation: true,
            showLeadFormTrigger: true,
          },
        ]);
      }
    } finally {
      setIsTyping(false);
      setIsStreaming(false);
    }
  };

  const handleQuickQuestionClick = (question: string) => {
    handleSendMessage(question);
  };

  const handleEscalateToHuman = () => {
    handleSendMessage('I would like to speak directly with a human advisor or customer support specialist.');
  };

  const handleResetChat = () => {
    abortControllerRef.current?.abort();
    setIsTyping(false);
    setIsStreaming(false);

    const newConvId = `conv-${Date.now()}`;
    setConversationId(newConvId);
    setHasServerThread(false);
    serverMsgCountRef.current = 0;
    sessionStorage.setItem('marvz_visitor_conv_id', newConvId);
    sessionStorage.removeItem('marvz_has_server_thread');

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

  const formatMessageText = (text: string, isUser: boolean) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const strongClass = isUser ? 'text-white font-bold' : 'text-[#202124] font-semibold';
      const formatted = line.replace(/\*\*(.*?)\*\*/g, `<strong class="${strongClass}">$1</strong>`);
      
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1 pl-1">
            <span className={`${isUser ? 'text-white/80' : 'text-[#30343B]'} font-bold shrink-0 mt-0.5`}>•</span>
            <span dangerouslySetInnerHTML={{ __html: formatted.replace(/^[•\-]\s*/, '') }} />
          </div>
        );
      }

      if (line.match(/^\d+\.\s/)) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1 pl-1">
            <span className={`${isUser ? 'text-white/80' : 'text-[#30343B]'} font-bold font-mono text-xs shrink-0 mt-0.5`}>
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
    <div
      ref={windowRef}
      style={{ left: `${windowPos.x}px`, top: `${windowPos.y}px` }}
      className={`fixed z-[48] w-[min(360px,calc(100vw-24px))] sm:w-[400px] h-[min(520px,calc(100vh-108px))] sm:h-[min(590px,calc(100vh-48px))] bg-white border rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[#202124] animate-marvz-panel-in ${
        isWindowDragging
          ? 'border-[#30343B] ring-2 ring-[#30343B]/20'
          : 'border-[#E5E7EB]'
      }`}
    >
      
      {/* Top Draggable Header - Deep Charcoal with Grip Indicator & Crisp Branding */}
      <div
        onPointerDown={handleWindowPointerDown}
        className={`bg-[#30343B] border-b border-[#202124] shrink-0 text-white touch-none select-none ${
          isWindowDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        title="Drag header to move chat window anywhere"
      >
        {/* Subtle Top Center Drag Pill Indicator */}
        <div className="pt-1.5 pb-0.5 flex justify-center" aria-hidden="true">
          <span className="w-9 h-1 rounded-full bg-white/30" />
        </div>

        <div className="px-3.5 pb-3 pt-1 flex items-center justify-between gap-2">
          {/* Drag Grip + Assistant Avatar & Online Badge */}
          <div className="flex items-center gap-2 min-w-0">
            <GripVertical
              className="w-4 h-4 text-white/55 shrink-0"
              aria-hidden="true"
            />
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-xl bg-[#181B20] border border-white/15 flex items-center justify-center overflow-hidden p-1">
                <img
                  src="/assets/aistudio/Capture.JPG11_7f7b0bf9.JPG"
                  alt="MARVZ Logo"
                  className="w-full h-full object-contain pointer-events-none"
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#30343B]" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-white tracking-tight truncate">
                  {config.chatbotName}
                </h3>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-mono uppercase bg-white/15 text-white border border-white/15 shrink-0">
                  AI
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-white/75 truncate">
                <span className="text-emerald-400 font-medium">● Online</span>
                <span className="hidden sm:inline">| Drag header to move</span>
              </div>
            </div>
          </div>

          {/* Action Controls & Escalation (Excluded from drag) */}
          <div className="flex items-center gap-0.5 text-white/75 shrink-0">
            <button
              onClick={handleEscalateToHuman}
              className="p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Talk to Human Support Specialist"
              aria-label="Escalate to Human Support"
            >
              <Headphones className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenKnowledgeBase}
              className="p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Browse Knowledge Base & FAQs"
              aria-label="Browse Knowledge Base"
            >
              <BookOpen className="w-4 h-4" />
            </button>

            <button
              onClick={handleResetChat}
              className="p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Clear & Restart Session"
              aria-label="Restart Conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors ml-0.5 cursor-pointer"
              title="Close Chat"
              aria-label="Close Assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Language Preference Banner - Auto / English / বাংলা */}
      <div className="px-3.5 py-2 bg-white border-b border-[#E5E7EB] flex items-center justify-between text-[11px] text-[#777777]">
        <div className="flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-[#30343B]" />
          <span className="font-medium text-[#202124]">Language:</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSelectedLang('auto')}
            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors ${
              selectedLang === 'auto' ? 'bg-[#30343B] text-white' : 'text-[#777777] hover:text-[#202124] hover:bg-[#F3F4F6]'
            }`}
          >
            Auto Detect
          </button>
          <button
            onClick={() => setSelectedLang('en')}
            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors ${
              selectedLang === 'en' ? 'bg-[#30343B] text-white' : 'text-[#777777] hover:text-[#202124] hover:bg-[#F3F4F6]'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setSelectedLang('bn')}
            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors ${
              selectedLang === 'bn' ? 'bg-[#30343B] text-white' : 'text-[#777777] hover:text-[#202124] hover:bg-[#F3F4F6]'
            }`}
          >
            বাংলা
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-[#F3F4F6] text-[#202124]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-start gap-2.5 max-w-[88%]">
              
              {/* Bot Avatar */}
              {msg.role === 'bot' && (
                <div className="w-7 h-7 rounded-lg bg-[#30343B] flex items-center justify-center shrink-0 mt-0.5 text-white p-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Human Agent Avatar */}
              {msg.role === 'agent' && (
                <div className="w-7 h-7 rounded-lg bg-[#202124] flex items-center justify-center shrink-0 mt-0.5 text-white">
                  <Headphones className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl leading-relaxed text-xs ${
                  msg.role === 'user'
                    ? 'bg-[#30343B] text-white rounded-tr-xs shadow-xs'
                    : msg.role === 'agent'
                    ? 'bg-white border border-[#30343B]/30 text-[#202124] rounded-tl-xs shadow-xs'
                    : 'bg-white border border-[#E5E7EB] text-[#202124] rounded-tl-xs shadow-xs'
                }`}
              >
                {msg.role === 'agent' && (
                  <div className="text-[10px] font-bold text-[#30343B] mb-1 flex items-center gap-1">
                    <Headphones className="w-3 h-3 text-[#30343B]" />
                    {msg.agentName || 'MARVZ Engineering Executive'}
                  </div>
                )}

                {formatMessageText(msg.text, msg.role === 'user')}
                {msg.isStreaming && (
                  <span className="inline-block ml-1 text-[10px] font-mono text-[#777777]">▍</span>
                )}

                {/* Initial Welcome Suggested Questions Card */}
                {msg.isInitialWelcome && (
                  <div className="mt-3.5 pt-3 border-t border-[#E5E7EB] space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#30343B]">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Suggested Questions:</span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      {SUGGESTED_QUESTIONS.map((sq, sIdx) => (
                        <button
                          key={sq.id}
                          onClick={() => handleQuickQuestionClick(sq.question)}
                          className="flex items-center justify-between text-left p-2 rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E5E7EB] text-[#202124] transition-colors group"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full bg-white border border-[#E5E7EB] text-[#30343B] flex items-center justify-center font-mono text-[9px] font-bold">
                              {sIdx + 1}
                            </span>
                            <span className="text-[11px] font-medium">{sq.question}</span>
                          </div>
                          <ArrowRight className="w-3 h-3 text-[#777777] group-hover:text-[#202124] transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Inline Escalation Card if triggered */}
                {msg.showEscalation && (
                  <div className="mt-3 pt-2.5 border-t border-[#E5E7EB] space-y-2">
                    <p className="font-semibold text-[#202124] flex items-center gap-1.5 text-[11px]">
                      <Headphones className="w-3.5 h-3.5 text-[#30343B]" />
                      Direct Human Support Options:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={`https://wa.me/${config.contactWhatsApp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        WhatsApp Desk
                      </a>
                      <a
                        href={`tel:${config.contactPhone.replace(/[^0-9+]/g, '')}`}
                        className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E5E7EB] text-[#202124] text-[10px] font-bold uppercase tracking-wider transition-colors"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-[#30343B]" />
                        Call Hotline
                      </a>
                    </div>
                  </div>
                )}

                {/* Inline Lead Form Trigger Card */}
                {msg.showLeadFormTrigger && (
                  <div className="mt-3 pt-2.5 border-t border-[#E5E7EB]">
                    <button
                      onClick={() => onOpenLeadModal('Services')}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#30343B] hover:bg-[#202124] text-white text-[11px] font-semibold transition-colors"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>Book Consultation / Request Quote</span>
                    </button>
                  </div>
                )}
              </div>

              {/* User Avatar */}
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center shrink-0 mt-0.5 text-[#30343B]">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-[#777777]">
              <span>{msg.timestamp}</span>
              {msg.language && (
                <span className="font-mono text-[#30343B]">[{msg.language}]</span>
              )}
            </div>
          </div>
        ))}

        {/* Lightweight typing indicator while awaiting first streamed token */}
        {isTyping && (
          <div className="flex items-center gap-2 text-[#777777]">
            <div className="w-7 h-7 rounded-lg bg-[#30343B] flex items-center justify-center shrink-0 text-white p-1">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="px-3 py-2 rounded-2xl rounded-tl-xs bg-white border border-[#E5E7EB] flex items-center gap-2 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#30343B]" />
              <span className="text-[11px] font-medium text-[#202124]">MARVZ AI is typing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reply Suggestions Bar */}
      {showQuickReplies && config.enableQuickReplies && (
        <div className="px-3 py-2 bg-white border-t border-[#E5E7EB] shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-[#777777] uppercase tracking-wider">
              Quick Suggestions
            </span>
            <button
              onClick={() => setShowQuickReplies(false)}
              className="text-[10px] text-[#777777] hover:text-[#202124] flex items-center gap-0.5 transition-colors"
            >
              Hide <ChevronDown className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {QUICK_REPLIES.map((qr) => (
              <button
                key={qr.id}
                onClick={() => handleQuickQuestionClick(qr.prompt)}
                className="px-3 py-1 rounded-full bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#202124] border border-[#E5E7EB] text-[11px] whitespace-nowrap transition-colors"
              >
                {qr.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer Input Area */}
      <div className="p-3 bg-white border-t border-[#E5E7EB] shrink-0">
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] placeholder-[#777777] text-xs focus:outline-none focus:bg-white focus:border-[#30343B] focus:ring-1 focus:ring-[#30343B] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || isTyping || isStreaming}
            className="p-2.5 rounded-xl bg-[#30343B] hover:bg-[#202124] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#777777] px-1">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#30343B]" />
            MARVZ Official AI Assistant
          </span>
          <button
            onClick={() => onOpenLeadModal('Services')}
            className="text-[#30343B] hover:text-[#202124] underline font-medium"
          >
            Request Callback
          </button>
        </div>
      </div>

    </div>
  );
};
