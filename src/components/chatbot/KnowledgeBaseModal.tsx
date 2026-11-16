import React, { useState } from 'react';
import { X, Search, BookOpen, Send, Sparkles } from 'lucide-react';
import { KNOWLEDGE_BASE_FAQS } from './chatbotKnowledge';

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAskQuestion: (question: string) => void;
}

export const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({
  isOpen,
  onClose,
  onAskQuestion,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Topics' },
    { id: 'AI', label: 'AI & ML' },
    { id: 'Drones', label: 'Drones & UAV' },
    { id: 'Robotics', label: 'Robotics & IoT' },
    { id: 'Software', label: 'Software & Apps' },
    { id: 'Cybersecurity', label: 'Cybersecurity' },
    { id: 'Training', label: 'Training Labs' },
    { id: 'Internships', label: 'Internships' },
    { id: 'Contact', label: 'HQ & Contact' },
  ];

  const filteredFaqs = KNOWLEDGE_BASE_FAQS.filter((faq) => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesCategory;

    const matchesQuery =
      faq.question.toLowerCase().includes(query) ||
      (faq.questionBn && faq.questionBn.includes(query)) ||
      faq.answer.toLowerCase().includes(query) ||
      (faq.answerBn && faq.answerBn.includes(query)) ||
      faq.tags.some((t) => t.toLowerCase().includes(query));

    return matchesCategory && matchesQuery;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center text-[#30343B]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#202124] flex items-center gap-2">
                MARVZ AI Knowledge Base & FAQs
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#F3F4F6] border border-[#E5E7EB] text-[#30343B] font-mono">
                  Bilingual EN / বাং
                </span>
              </h3>
              <p className="text-xs text-[#777777]">
                Verified information & curriculum guides from our technical teams
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#777777] hover:text-[#202124] hover:bg-[#F3F4F6] transition-colors"
            aria-label="Close knowledge base"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-4 border-b border-[#E5E7EB] bg-[#F3F4F6] space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#777777]" />
            <input
              type="text"
              placeholder="Search topics, courses, drone specs, AI workflows, or contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E5E7EB] text-sm text-[#202124] placeholder-[#777777] focus:outline-none focus:border-[#30343B] focus:ring-1 focus:ring-[#30343B]"
            />
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium ${
                  selectedCategory === cat.id
                    ? 'bg-[#30343B] text-white'
                    : 'bg-white border border-[#E5E7EB] text-[#777777] hover:text-[#202124] hover:bg-[#E5E7EB]/60'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white">
          {filteredFaqs.length === 0 ? (
            <div className="py-12 text-center text-[#777777]">
              <Sparkles className="w-8 h-8 mx-auto text-[#777777] mb-2" />
              <p className="text-sm text-[#202124]">No matching topics found.</p>
              <button
                onClick={() => {
                  onAskQuestion(searchQuery || 'What are the main services of MARVZ?');
                  onClose();
                }}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#30343B] text-white text-xs font-semibold hover:bg-[#202124] transition-colors"
              >
                Ask MARVZ AI Directly
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq) => (
              <div
                key={faq.id}
                className="p-4 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] hover:border-[#30343B]/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#30343B] bg-white px-2 py-0.5 rounded border border-[#E5E7EB]">
                      {faq.category}
                    </span>
                    <h4 className="text-sm font-semibold text-[#202124] mt-1.5">
                      {faq.question}
                    </h4>
                    {faq.questionBn && (
                      <p className="text-xs text-[#777777] mt-0.5 font-medium">
                        {faq.questionBn}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      onAskQuestion(faq.question);
                      onClose();
                    }}
                    title="Ask AI this question in chat"
                    className="shrink-0 p-2 rounded-lg bg-white border border-[#E5E7EB] hover:bg-[#30343B] text-[#30343B] hover:text-white transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="mt-3 pt-3 border-t border-[#E5E7EB] text-xs text-[#202124] leading-relaxed">
                  <p>{faq.answer}</p>
                  {faq.answerBn && (
                    <p className="mt-2 pt-2 border-t border-[#E5E7EB] text-[#777777]">
                      {faq.answerBn}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#E5E7EB] bg-[#F3F4F6] flex items-center justify-between text-xs text-[#777777] px-5">
          <span>{filteredFaqs.length} verified topics available</span>
          <span>Updated weekly by MARVZ Research Lab</span>
        </div>

      </div>
    </div>
  );
};
