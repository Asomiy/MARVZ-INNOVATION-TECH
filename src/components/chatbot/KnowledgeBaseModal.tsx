import React, { useState } from 'react';
import { X, Search, BookOpen, Send, Sparkles } from 'lucide-react';
import { KNOWLEDGE_BASE_FAQS, FAQItem } from './chatbotKnowledge';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#090e1b] border border-red-500/30 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                MARVZ AI Knowledge Base & FAQs
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-mono">Bilingual EN / বাং</span>
              </h3>
              <p className="text-xs text-slate-400">
                Verified information & curriculum guides from our technical teams
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/60 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search topics, courses, drone specs, AI workflows, or contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-medium ${
                  selectedCategory === cat.id
                    ? 'bg-red-600 text-white shadow-md shadow-red-900/50'
                    : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {filteredFaqs.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Sparkles className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-sm">No matching topics found.</p>
              <button
                onClick={() => {
                  onAskQuestion(searchQuery || 'What are the main services of MARVZ?');
                  onClose();
                }}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-500 transition-colors"
              >
                Ask MARVZ AI Directly
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq) => (
              <div
                key={faq.id}
                className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-colors group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-900/50">
                      {faq.category}
                    </span>
                    <h4 className="text-sm font-semibold text-white mt-1.5 group-hover:text-red-400 transition-colors">
                      {faq.question}
                    </h4>
                    {faq.questionBn && (
                      <p className="text-xs text-slate-400 mt-0.5 font-medium">
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
                    className="shrink-0 p-2 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white transition-all shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                  <p>{faq.answer}</p>
                  {faq.answerBn && (
                    <p className="mt-2 text-slate-400 border-l-2 border-red-500/40 pl-2">
                      {faq.answerBn}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400 px-5">
          <span>{filteredFaqs.length} verified topics available</span>
          <span className="text-slate-500">Updated weekly by MARVZ Research Lab</span>
        </div>

      </div>
    </div>
  );
};
