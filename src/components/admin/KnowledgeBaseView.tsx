import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Tag,
  Filter,
  Save,
  X,
  AlertCircle,
  GraduationCap,
  Briefcase,
  Phone,
  Sparkles,
  Layers
} from 'lucide-react';
import { FAQItem } from '../../types/admin';

interface KnowledgeBaseViewProps {
  onRefreshStats?: () => void;
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({ onRefreshStats }) => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'faqs' | 'courses' | 'internships' | 'contact'>('faqs');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    questionBn: '',
    answer: '',
    answerBn: '',
    category: 'AI',
    tags: '',
    isPublished: true,
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/kb');
      if (res.ok) {
        const data = await res.json();
        setFaqs(data.faqs || []);
      }
    } catch (err) {
      console.error('Failed to load FAQs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const openAddModal = (defaultCat: string = 'AI') => {
    setEditingFaq(null);
    setFormData({
      question: '',
      questionBn: '',
      answer: '',
      answerBn: '',
      category: defaultCat,
      tags: defaultCat.toLowerCase(),
      isPublished: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (faq: FAQItem) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      questionBn: faq.questionBn || '',
      answer: faq.answer,
      answerBn: faq.answerBn || '',
      category: faq.category,
      tags: faq.tags.join(', '),
      isPublished: faq.isPublished,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      setStatusMessage({ type: 'error', text: 'Please fill in both Question and Answer.' });
      return;
    }

    setSaveLoading(true);
    setStatusMessage(null);

    const payload = {
      question: formData.question,
      questionBn: formData.questionBn,
      answer: formData.answer,
      answerBn: formData.answerBn,
      category: formData.category,
      tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      isPublished: formData.isPublished,
    };

    try {
      const url = editingFaq ? `/api/admin/kb/${editingFaq.id}` : '/api/admin/kb';
      const method = editingFaq ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save knowledge item.');

      setStatusMessage({
        type: 'success',
        text: editingFaq ? 'Knowledge item updated successfully!' : 'New knowledge item added to chatbot!',
      });

      setIsModalOpen(false);
      fetchFaqs();
      if (onRefreshStats) onRefreshStats();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Operation failed.' });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (id: string, question: string) => {
    if (!confirm(`Are you sure you want to delete "${question}" from the knowledge base?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/kb/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFaqs((prev) => prev.filter((f) => f.id !== id));
        if (onRefreshStats) onRefreshStats();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleTogglePublish = async (faq: FAQItem) => {
    try {
      const updatedStatus = !faq.isPublished;
      const res = await fetch(`/api/admin/kb/${faq.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: updatedStatus }),
      });
      if (res.ok) {
        setFaqs((prev) =>
          prev.map((f) => (f.id === faq.id ? { ...f, isPublished: updatedStatus } : f))
        );
      }
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const categories = [
    { id: 'all', label: 'All Knowledge' },
    { id: 'AI', label: 'AI & Machine Learning' },
    { id: 'Drones', label: 'Drone & UAV Tech' },
    { id: 'Robotics', label: 'Robotics & Automation' },
    { id: 'Software', label: 'Software & Cloud' },
    { id: 'Cybersecurity', label: 'Cybersecurity' },
    { id: 'Training', label: 'Training & Bootcamps' },
    { id: 'Internships', label: 'Internships & Careers' },
    { id: 'Contact', label: 'Contact & HQ' },
    { id: 'Custom', label: 'Custom Topics' },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesCategory;

    const matchesQuery =
      faq.question.toLowerCase().includes(query) ||
      (faq.questionBn && faq.questionBn.toLowerCase().includes(query)) ||
      faq.answer.toLowerCase().includes(query) ||
      (faq.answerBn && faq.answerBn.toLowerCase().includes(query)) ||
      faq.tags.some((t) => t.toLowerCase().includes(query));

    return matchesCategory && matchesQuery;
  });

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-red-500" />
            AI Knowledge Base Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Teach and update the chatbot without writing code. Changes immediately take effect in visitor conversations.
          </p>
        </div>

        <button
          onClick={() => openAddModal(selectedCategory === 'all' ? 'AI' : selectedCategory)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-semibold shadow-lg shadow-red-950/40 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Q&A</span>
        </button>
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/40 border-red-500/40 text-red-300'
          }`}
        >
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs for quick domain actions */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-xs overflow-x-auto scrollbar-none">
        <button
          onClick={() => {
            setActiveTab('faqs');
            setSelectedCategory('all');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
            activeTab === 'faqs' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Questions & Answers ({faqs.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('courses');
            setSelectedCategory('Training');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
            activeTab === 'courses' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Courses & Training Labs</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('internships');
            setSelectedCategory('Internships');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
            activeTab === 'internships' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Internship & Recruitment</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('contact');
            setSelectedCategory('Contact');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
            activeTab === 'contact' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Company Contact & Office Info</span>
        </button>
      </div>

      {/* Search & Category Filter Pills */}
      <div className="p-4 rounded-2xl bg-[#080d1a] border border-slate-800 space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search FAQs by question, answer, tag, or Bangla text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-slate-700 text-white shadow-sm border border-slate-600'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* FAQs List Table / Cards */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs font-mono">
            Loading Knowledge Items...
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-[#080d1a] border border-slate-800 text-slate-400">
            <BookOpen className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="text-sm">No knowledge items match your current filter.</p>
            <button
              onClick={() => openAddModal()}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-500"
            >
              <Plus className="w-4 h-4" /> Add Item Now
            </button>
          </div>
        ) : (
          filteredFaqs.map((faq) => (
            <div
              key={faq.id}
              className="p-5 rounded-2xl bg-[#080d1a] border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4 group"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-900/50">
                    {faq.category}
                  </span>
                  
                  {faq.isPublished ? (
                    <span className="text-[10px] flex items-center gap-1 px-2 py-0.5 rounded font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> Live in AI
                    </span>
                  ) : (
                    <span className="text-[10px] flex items-center gap-1 px-2 py-0.5 rounded font-medium bg-slate-800 text-slate-400 border border-slate-700">
                      <XCircle className="w-3 h-3" /> Draft
                    </span>
                  )}

                  <span className="text-[10px] font-mono text-slate-500">
                    Asked {faq.hitCount} times
                  </span>
                  <span className="text-[10px] text-slate-600">
                    • Updated {new Date(faq.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Question */}
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">
                    {faq.question}
                  </h4>
                  {faq.questionBn && (
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      বাংলা: {faq.questionBn}
                    </p>
                  )}
                </div>

                {/* Answer */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed space-y-1.5">
                  <p>{faq.answer}</p>
                  {faq.answerBn && (
                    <p className="text-slate-400 border-l-2 border-red-500/50 pl-2 text-[11px]">
                      বাংলা: {faq.answerBn}
                    </p>
                  )}
                </div>

                {/* Tags */}
                {faq.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <Tag className="w-3 h-3 text-slate-500" />
                    {faq.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="shrink-0 flex items-center gap-2 self-end md:self-start pt-1">
                <button
                  onClick={() => handleTogglePublish(faq)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    faq.isPublished
                      ? 'bg-slate-800 text-slate-400 hover:text-white'
                      : 'bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600 hover:text-white'
                  }`}
                  title={faq.isPublished ? 'Deactivate from Chatbot' : 'Activate in Chatbot'}
                >
                  {faq.isPublished ? 'Unpublish' : 'Publish'}
                </button>

                <button
                  onClick={() => openEditModal(faq)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Edit Knowledge Item"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleDelete(faq.id, faq.question)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-red-600/80 text-slate-300 hover:text-white transition-colors"
                  title="Delete Item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#090f1f] border border-red-500/40 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-red-950/40 to-slate-900">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-red-500" />
                {editingFaq ? 'Edit Knowledge Item' : 'Teach Chatbot New Information'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              
              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-red-500"
                >
                  <option value="AI">Artificial Intelligence & ML</option>
                  <option value="Drones">Drone Technology & UAV Engineering</option>
                  <option value="Robotics">Robotics & Industrial Automation</option>
                  <option value="Software">Software & Cloud Applications</option>
                  <option value="Cybersecurity">Cybersecurity & Ethical Hacking</option>
                  <option value="Training">Training Programs & Courses</option>
                  <option value="Internships">Internships & Career Opportunities</option>
                  <option value="Contact">Company Contact & Office Info</option>
                  <option value="Custom">Custom / General Knowledge</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Primary Question (English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. What are the prerequisites for the Drone Piloting course?"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Question in Bengali (বাংলা প্রশ্ন - ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: ড্রোন পাইলটিং কোর্সে ভর্তির যোগ্যতা কি?"
                  value={formData.questionBn}
                  onChange={(e) => setFormData({ ...formData, questionBn: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Accurate Answer (English) *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide precise details, key dates, prerequisites, and instructions..."
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Answer in Bengali (বাংলা উত্তর - ঐচ্ছিক)
                </label>
                <textarea
                  rows={3}
                  placeholder="বাংলায় স্পষ্ট ও পেশাদার উত্তর দিন..."
                  value={formData.answerBn}
                  onChange={(e) => setFormData({ ...formData, answerBn: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Search Tags (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. drone, pilot, admission, license"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pub-check"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-slate-900 border-slate-700"
                />
                <label htmlFor="pub-check" className="text-slate-300 cursor-pointer font-medium">
                  Make available immediately to live AI chatbot
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saveLoading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold shadow-md disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saveLoading ? 'Saving...' : 'Save Knowledge Item'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
