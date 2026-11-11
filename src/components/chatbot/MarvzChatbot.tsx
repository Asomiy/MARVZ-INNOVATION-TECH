import React, { useState } from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';
import { ChatWindow } from './ChatWindow';
import { LeadCaptureModal } from './LeadCaptureModal';
import { KnowledgeBaseModal } from './KnowledgeBaseModal';
import { AdminDashboardModal } from './AdminDashboardModal';

interface MarvzChatbotProps {
  onOpenControlCenter?: () => void;
}

export const MarvzChatbot: React.FC<MarvzChatbotProps> = ({ onOpenControlCenter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isKbOpen, setIsKbOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadCategory, setLeadCategory] = useState('Services');

  const handleOpenLeadModal = (category: string = 'Services') => {
    setLeadCategory(category);
    setIsLeadModalOpen(true);
  };

  const handleAskQuestionFromKb = (question: string) => {
    setIsOpen(true);
    // Find input and submit via event or state
    setTimeout(() => {
      const input = document.querySelector('input[placeholder*="Ask about"]') as HTMLInputElement;
      if (input) {
        input.value = question;
        const form = input.closest('form');
        if (form) {
          form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
      }
    }, 200);
  };

  return (
    <>
      {/* Floating Chat Trigger Button (Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
        
        {/* Floating Notification / Greeting Pill (Shown when chat is closed) */}
        {!isOpen && (
          <div
            onClick={() => setIsOpen(true)}
            className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#090f1f]/95 border border-red-500/40 text-xs text-slate-200 shadow-2xl backdrop-blur-md cursor-pointer hover:border-red-400 hover:text-white transition-all transform hover:-translate-y-0.5 group"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">MARVZ AI Online</span>
            <span className="text-slate-400">| How can I help you today?</span>
            <Sparkles className="w-3.5 h-3.5 text-red-400 group-hover:rotate-12 transition-transform" />
          </div>
        )}

        {/* Main Circular Floating Launcher */}
        <div className="relative group">
          
          {/* Subtle glowing ambient pulse */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-red-600 via-red-500 to-red-700 opacity-60 blur-md group-hover:opacity-100 transition-opacity animate-pulse" />

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl border transition-all duration-300 focus:outline-none ${
              isOpen
                ? 'bg-gradient-to-br from-slate-900 to-[#070b15] border-red-500 text-white rotate-90 scale-95'
                : 'bg-gradient-to-br from-red-600 via-red-700 to-red-950 border-red-400 text-white hover:scale-105'
            }`}
            aria-label={isOpen ? 'Close MARVZ AI Assistant' : 'Open MARVZ AI Assistant'}
            title="MARVZ AI Assistant"
          >
            {isOpen ? (
              <span className="text-xl font-bold">✕</span>
            ) : (
              <div className="relative flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white drop-shadow" />
                <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#090f1f] animate-ping" />
                <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#090f1f]" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* The Interactive Chat Window */}
      <ChatWindow
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onOpenKnowledgeBase={() => setIsKbOpen(true)}
        onOpenAdmin={() => {
          if (onOpenControlCenter) {
            onOpenControlCenter();
          } else {
            setIsAdminOpen(true);
          }
        }}
        onOpenLeadModal={handleOpenLeadModal}
      />

      {/* Modal: Knowledge Base & FAQs */}
      <KnowledgeBaseModal
        isOpen={isKbOpen}
        onClose={() => setIsKbOpen(false)}
        onAskQuestion={handleAskQuestionFromKb}
      />

      {/* Modal: Admin Inquiries Dashboard */}
      <AdminDashboardModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      {/* Modal: Lead & Requirement Capture Form */}
      <LeadCaptureModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        defaultCategory={leadCategory}
      />
    </>
  );
};
