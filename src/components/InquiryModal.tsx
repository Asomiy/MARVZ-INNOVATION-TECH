import React, { useState } from 'react';
import { X, Send, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSubject?: string;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({ isOpen, onClose, initialSubject = 'General Application' }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState(initialSubject);
  const [timeframe, setTimeframe] = useState('Next Available Cohort');
  const [experienceLevel, setExperienceLevel] = useState('Intermediate');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    try {
      const existing = JSON.parse(localStorage.getItem('marvz_inquiries') || '[]');
      existing.push({
        fullName,
        email,
        phone,
        subject,
        timeframe,
        experienceLevel,
        notes,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('marvz_inquiries', JSON.stringify(existing));
    } catch (e) {
      // ignore
    }

    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0c1a30] border border-slate-700 shadow-2xl p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-10 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white">Application Recorded</h3>
            <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
              We have received your note for <strong className="text-white">{subject}</strong>. A MARVZ startup engineer will connect with you via email at <span className="text-[#06B6D4]">{email}</span>.
            </p>
            <div className="pt-4">
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#2563EB] hover:bg-[#3b82f6] rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-2">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#081426] border border-slate-700/80 p-0.5 shrink-0 flex items-center justify-center">
                <img
                  src="/assets/aistudio/Capture.JPG11_7f7b0bf9.JPG"
                  alt="MARVZ Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-[11px] font-mono text-[#06B6D4] uppercase tracking-wider">
                  MARVZ Startup Collaboration
                </span>
                <h3 className="text-xl font-bold text-white">
                  Start a Technical Conversation
                </h3>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Program / Inquiry Focus *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-[#071426] border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#087CFF]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Miller"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#071426] border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#087CFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="jordan@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#071426] border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#087CFF]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Phone / WhatsApp
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#071426] border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#087CFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Preferred Cohort Timeframe
                </label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#071426] border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#087CFF]"
                >
                  <option value="Next Available Cohort">Next Available Cohort</option>
                  <option value="Within 30 Days">Within 30 Days</option>
                  <option value="Weekend Bootcamp Only">Weekend Bootcamp Only</option>
                  <option value="Custom Enterprise Schedule">Custom Enterprise Schedule</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Background / Prior Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-[#071426] border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#087CFF]"
              >
                <option value="Beginner (Foundations)">Beginner (Seeking foundational hardware/coding skills)</option>
                <option value="Intermediate">Intermediate (Have basic coding or engineering background)</option>
                <option value="Advanced / Professional">Advanced (Practicing engineer looking to specialize)</option>
                <option value="Corporate Team">Corporate Engineering Team</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Specific Learning Goals or Project Requirements
              </label>
              <textarea
                rows={3}
                placeholder="Mention specific areas such as drone flight calibration, neural networks, or hardware lab access..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-[#071426] border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#087CFF]"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#087CFF] to-[#0070e6] hover:from-[#0983ff] hover:to-[#087CFF] rounded-lg shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Application</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
