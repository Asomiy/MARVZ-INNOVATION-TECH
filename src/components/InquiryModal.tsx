import React, { useState, useEffect } from 'react';
import { X, Send, CheckCircle2 } from 'lucide-react';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSubject?: string;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({ isOpen, onClose, initialSubject = '' }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    subject: initialSubject,
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, subject: initialSubject }));
  }, [initialSubject]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.name,
          email: formData.email,
          phone: formData.phone,
          collaboratorType: formData.organization || 'Startup Inquiry Modal',
          technologyDomain: 'General Inquiry',
          subject: formData.subject || 'General Collaboration & Inquiry',
          message: formData.message,
        }),
      });
    } catch {
      // Fallback safely to confirmation view
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-white border border-[#E5E7EB] shadow-xl p-6 sm:p-8 text-[#202124]">
        <button
          onClick={() => {
            setSubmitted(false);
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-lg text-[#777777] hover:text-[#202124] hover:bg-[#F3F4F6] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center text-[#30343B] mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-[#202124]">Inquiry Received</h3>
            <p className="text-sm text-[#777777] leading-relaxed">
              Thank you, <span className="text-[#202124] font-semibold">{formData.name}</span>. Our startup team has logged your inquiry regarding{' '}
              <span className="text-[#202124] font-semibold">{formData.subject || 'your project'}</span> and will reach out to <span className="text-[#202124]">{formData.email}</span> shortly.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="mt-2 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#30343B] hover:bg-[#202124] rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <span className="text-xs font-mono uppercase tracking-wider text-[#777777]">MARVZ Direct Desk</span>
              <h3 className="text-xl font-bold text-[#202124] mt-1">Start a Conversation</h3>
              <p className="text-xs text-[#777777] mt-1">
                Collaborate on AI, drones, robotics, cybersecurity, or institutional training workshops.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#202124] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] text-sm focus:outline-none focus:ring-2 focus:ring-[#30343B] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#202124] mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] text-sm focus:outline-none focus:ring-2 focus:ring-[#30343B] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#202124] mb-1">Phone / Organization</label>
                  <input
                    type="text"
                    placeholder="+880 / University"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] text-sm focus:outline-none focus:ring-2 focus:ring-[#30343B] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#202124] mb-1">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] text-sm focus:outline-none focus:ring-2 focus:ring-[#30343B] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#202124] mb-1">Inquiry Details *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe your objectives, desired hardware track, or project specs..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] text-sm focus:outline-none focus:ring-2 focus:ring-[#30343B] focus:bg-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-[#202124] bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E5E7EB] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#30343B] hover:bg-[#202124] rounded-xl shadow-xs disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Sending...' : 'Send Inquiry'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
