import React, { useState } from 'react';
import { X, Send, CheckCircle2, AlertCircle, Building2, User, Mail, Phone, FileText } from 'lucide-react';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: string;
  onLeadSubmitted?: (leadName: string) => void;
}

export const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({
  isOpen,
  onClose,
  defaultCategory = 'Services',
  onLeadSubmitted,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: defaultCategory,
    requirements: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!formData.email.trim() && !formData.phone.trim()) {
      setErrorMsg('Please provide either an email address or a phone number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          source: 'Chatbot Modal',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record inquiry. Please try again.');
      }

      setIsSuccess(true);
      if (onLeadSubmitted) {
        onLeadSubmitted(formData.name);
      }

      setTimeout(() => {
        setIsSuccess(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          category: defaultCategory,
          requirements: '',
        });
        onClose();
      }, 2200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please connect via WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center text-[#30343B]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#202124]">
                Consultation & Project Inquiry
              </h3>
              <p className="text-xs text-[#777777]">
                Direct connection with MARVZ & INNOVATION TECH engineering leads
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#777777] hover:text-[#202124] hover:bg-[#F3F4F6] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success State */}
        {isSuccess ? (
          <div className="py-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-[#202124] mb-2">Inquiry Confirmed</h4>
            <p className="text-sm text-[#777777] max-w-sm">
              Thank you, <strong className="text-[#202124]">{formData.name}</strong>. Our engineering advisory team has received your brief and will connect with you within 2-4 business hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#202124] uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-[#777777]" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan / আরিফ চৌধুরী"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] placeholder-[#777777] text-sm focus:outline-none focus:bg-white focus:border-[#30343B] focus:ring-1 focus:ring-[#30343B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#202124] uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#777777]" />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] placeholder-[#777777] text-sm focus:outline-none focus:bg-white focus:border-[#30343B] focus:ring-1 focus:ring-[#30343B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] uppercase tracking-wider mb-1.5">
                  Phone / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-[#777777]" />
                  <input
                    type="tel"
                    placeholder="+880 1711-000000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] placeholder-[#777777] text-sm focus:outline-none focus:bg-white focus:border-[#30343B] focus:ring-1 focus:ring-[#30343B]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202124] uppercase tracking-wider mb-1.5">
                Area of Interest *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] text-sm focus:outline-none focus:bg-white focus:border-[#30343B] focus:ring-1 focus:ring-[#30343B]"
              >
                <option value="Services">Enterprise Software & AI Development</option>
                <option value="Training">Hands-on IT Training & Certification</option>
                <option value="Internships">Internship & Research Fellowship</option>
                <option value="Consulting">Drone & Industrial Robotics Engineering</option>
                <option value="Partnerships">Institutional & Academic Partnership</option>
                <option value="Other">General Technical Inquiry</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202124] uppercase tracking-wider mb-1.5">
                Project Requirements / Message
              </label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-3 w-4 h-4 text-[#777777]" />
                <textarea
                  rows={3}
                  placeholder="Tell us what you'd like to build, learn, or research..."
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] placeholder-[#777777] text-sm focus:outline-none focus:bg-white focus:border-[#30343B] focus:ring-1 focus:ring-[#30343B]"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#202124] text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#30343B] hover:bg-[#202124] text-white text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Requirement</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
