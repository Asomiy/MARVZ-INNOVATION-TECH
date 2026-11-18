import React, { useState, useRef, useEffect } from 'react';
import { X, Send, MessageSquare, CheckCheck, Phone } from 'lucide-react';

const WHATSAPP_NUMBER = '+8801775551987';
const WA_URL = 'https://wa.me/8801775551987';
const TEL_URL = 'tel:+8801775551987';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'visitor' | 'marvz';
  text: string;
  time: string;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'marvz',
      text: "Hello! Welcome to MARVZ & INNOVATION TECH's instant advisory line. How can our engineering team assist you today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages]);

  if (!isOpen) return null;

  const quickReplies = [
    'Upcoming Drone & UAV training batch?',
    'Interested in a Robotics prototype collab',
    'Corporate Cybersecurity workshop details',
    'How to partner as an educational institute?',
  ];

  const handleSend = (text: string = inputText) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'visitor',
      text: trimmed,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    setTimeout(() => {
      let replyText = "Thank you for reaching out! One of our startup engineering mentors is reviewing your query and will respond shortly. Would you like us to reserve a workshop seat or set up a demo call?";

      if (trimmed.toLowerCase().includes('drone') || trimmed.toLowerCase().includes('uav')) {
        replyText = 'Great choice! Our next Hands-On Drone Avionics & Autonomous Flight cohort starts next month. You will build and calibrate a quadcopter from individual components. Shall I reserve a seat for you?';
      } else if (trimmed.toLowerCase().includes('robotics') || trimmed.toLowerCase().includes('prototype')) {
        replyText = 'We actively collaborate on ROS 2 and industrial robotics prototypes! Share a brief overview of your mechanical/automation requirements and we will arrange an engineering review.';
      } else if (trimmed.toLowerCase().includes('cyber')) {
        replyText = 'Our Cybersecurity Red Team workshops run on real, isolated penetration testing lab environments. Ideal for students and corporate IT defense teams.';
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'marvz',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl bg-white border border-[#E5E7EB] shadow-xl overflow-hidden flex flex-col h-[540px] max-h-[85vh] text-[#202124]">
        {/* Header */}
        <div className="bg-[#30343B] px-5 py-4 flex items-center justify-between border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open WhatsApp chat"
              className="w-10 h-10 rounded-full bg-white text-[#30343B] flex items-center justify-center shadow-xs hover:bg-[#F3F4F6] transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
            </a>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                MARVZ Advisory Line
              </h4>
              <a
                href={WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-white/85 hover:text-white font-mono hover:underline"
              >
                {WHATSAPP_NUMBER}
              </a>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close WhatsApp simulator"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#F3F4F6]">
          <div className="text-center">
            <span className="text-[10px] font-mono text-[#777777] bg-white px-2.5 py-1 rounded border border-[#E5E7EB]">
              MARVZ Instant Messaging Line
            </span>
          </div>

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'visitor' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs ${
                  msg.sender === 'visitor'
                    ? 'bg-[#30343B] text-white rounded-tr-none'
                    : 'bg-white text-[#202124] border border-[#E5E7EB] rounded-tl-none'
                }`}
              >
                <p>{msg.text}</p>
                <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${msg.sender === 'visitor' ? 'text-white/70' : 'text-[#777777]'}`}>
                  <span>{msg.time}</span>
                  {msg.sender === 'visitor' && <CheckCheck className="w-3 h-3" />}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Reply Chips */}
        <div className="px-3 py-2 bg-white border-t border-[#E5E7EB] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {quickReplies.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="shrink-0 text-[11px] font-medium text-[#202124] bg-[#F3F4F6] hover:bg-[#E5E7EB] px-2.5 py-1 rounded-full border border-[#E5E7EB] transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-white border-t border-[#E5E7EB] flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Write your message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-2 text-xs text-[#202124] bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#30343B] focus:bg-white"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-[#30343B] hover:bg-[#202124] disabled:bg-[#E5E7EB] disabled:text-[#777777] text-white transition-colors"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Bottom Direct Clickable Links */}
        <div className="px-4 py-2 bg-[#F3F4F6] border-t border-[#E5E7EB] text-center text-[10px] text-[#777777] flex items-center justify-center gap-3">
          <a href={TEL_URL} className="inline-flex items-center gap-1 text-[#202124] hover:underline font-medium">
            <Phone className="w-3 h-3 text-[#30343B]" />
            <span>Call: {WHATSAPP_NUMBER}</span>
          </a>
          <span aria-hidden="true">·</span>
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#202124] hover:underline font-medium"
          >
            <MessageSquare className="w-3 h-3 text-[#30343B]" />
            <span>Open WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
