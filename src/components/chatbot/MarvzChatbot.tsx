import React, { useState, useRef } from 'react';
import { MessageSquare, Sparkles, GripHorizontal, GripVertical } from 'lucide-react';
import { ChatWindow } from './ChatWindow';
import { LeadCaptureModal } from './LeadCaptureModal';
import { KnowledgeBaseModal } from './KnowledgeBaseModal';
import { AdminDashboardModal } from './AdminDashboardModal';
import { useDraggablePosition } from './useDraggablePosition';

interface MarvzChatbotProps {
  onOpenControlCenter?: () => void;
}

export const MarvzChatbot: React.FC<MarvzChatbotProps> = ({ onOpenControlCenter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isKbOpen, setIsKbOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadCategory, setLeadCategory] = useState('Services');

  const launcherRef = useRef<HTMLDivElement>(null);

  const {
    position: launcherPos,
    isDragging: isLauncherDragging,
    handlePointerDown: handleLauncherPointerDown,
    wasJustDragged: wasLauncherJustDragged,
  } = useDraggablePosition({
    elementRef: launcherRef,
    storageKey: 'marvz_chatbot_launcher_pos',
    fallbackSize: { width: 56, height: 76 },
    edgePadding: 8,
    isActive: true,
    getInitialPosition: ({ width, height, viewportWidth, viewportHeight }) => ({
      x: viewportWidth - width - 24,
      y: viewportHeight - height - 24,
    }),
  });

  const handleOpenLeadModal = (category: string = 'Services') => {
    setLeadCategory(category);
    setIsLeadModalOpen(true);
  };

  const handleAskQuestionFromKb = (question: string) => {
    setIsOpen(true);
    setTimeout(() => {
      const input = document.querySelector(
        'input[placeholder*="Type your question"], input[placeholder*="আপনার প্রশ্ন"]'
      ) as HTMLInputElement;
      if (input) {
        input.value = question;
        const form = input.closest('form');
        if (form) {
          form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
      }
    }, 200);
  };

  const isLauncherOnLeftHalf =
    typeof window !== 'undefined' && launcherPos.x < window.innerWidth / 2;

  return (
    <>
      {/* Draggable Floating Chat Launcher (Freely repositionable across entire viewport) */}
      <div
        ref={launcherRef}
        style={{ left: `${launcherPos.x}px`, top: `${launcherPos.y}px` }}
        className={`fixed z-[45] flex flex-col items-center touch-none select-none ${
          isLauncherDragging ? 'cursor-grabbing' : ''
        }`}
      >
        {/* Small Visual Drag Handle / Move Indicator */}
        <div
          onPointerDown={handleLauncherPointerDown}
          className={`mb-1 px-2 py-0.5 rounded-full bg-white border shadow-sm flex items-center justify-center transition-colors duration-150 touch-none ${
            isLauncherDragging
              ? 'cursor-grabbing border-[#30343B] text-[#202124]'
              : 'cursor-grab border-[#E5E7EB] text-[#777777] hover:text-[#202124] hover:border-[#30343B]/40'
          }`}
          title="Drag to move chatbot anywhere"
          aria-label="Drag handle to move chatbot"
        >
          <GripHorizontal className="w-3.5 h-3.5" />
        </div>

        {/* Circular Launcher Button + Adaptive Greeting Pill */}
        <div className="relative flex items-center">
          {/* Floating Greeting Pill (Auto-flips side so it stays inside screen) */}
          {!isOpen && !isLauncherDragging && (
            <div
              onPointerDown={handleLauncherPointerDown}
              onClick={(e) => {
                if (wasLauncherJustDragged()) {
                  e.preventDefault();
                  e.stopPropagation();
                  return;
                }
                setIsOpen(true);
              }}
              className={`hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E5E7EB] text-xs text-[#202124] shadow-md cursor-pointer hover:bg-[#F3F4F6] transition-colors duration-150 whitespace-nowrap absolute top-1/2 -translate-y-1/2 touch-none ${
                isLauncherOnLeftHalf ? 'left-full ml-3' : 'right-full mr-3'
              }`}
              title="Click to chat or drag to reposition"
            >
              <GripVertical className="w-3.5 h-3.5 text-[#777777] shrink-0" />
              <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
              <span className="font-semibold text-[#202124]">MARVZ AI Online</span>
              <span className="text-[#777777]">| How can I help you today?</span>
              <Sparkles className="w-3.5 h-3.5 text-[#30343B] shrink-0" />
            </div>
          )}

          {/* Main Circular Floating Launcher */}
          <button
            type="button"
            onPointerDown={handleLauncherPointerDown}
            onClick={(e) => {
              if (wasLauncherJustDragged()) {
                e.preventDefault();
                e.stopPropagation();
                return;
              }
              setIsOpen((prev) => !prev);
            }}
            className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg border transition-colors duration-150 focus:outline-none touch-none ${
              isLauncherDragging ? 'cursor-grabbing ring-2 ring-[#30343B]/25' : 'cursor-grab active:cursor-grabbing'
            } ${
              isOpen
                ? 'bg-white border-[#E5E7EB] text-[#202124] hover:bg-[#F3F4F6]'
                : 'bg-[#30343B] border-[#30343B] text-white hover:bg-[#202124]'
            }`}
            aria-label={
              isOpen
                ? 'Close MARVZ AI Assistant (or drag to move)'
                : 'Open MARVZ AI Assistant (or drag to move)'
            }
            title="Click to toggle chat, or drag to move anywhere"
          >
            {isOpen ? (
              <span className="text-lg font-bold">✕</span>
            ) : (
              <div className="relative flex items-center justify-center pointer-events-none">
                <MessageSquare className="w-6 h-6 text-white" />
                <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* The Interactive Draggable Chat Window */}
      <ChatWindow
        isOpen={isOpen}
        launcherPos={launcherPos}
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
