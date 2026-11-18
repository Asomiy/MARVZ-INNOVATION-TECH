import React, { useState, useEffect } from 'react';
import { X, Send, CheckCircle2, Loader2 } from 'lucide-react';

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
    collaboratorType: 'Student / Independent Builder',
    technologyDomain: 'Drone Technology & UAV Engineering',
    subject: initialSubject || 'General Collaboration & Inquiry',
    message: '',
    website: '',
  });
  const [submittedSnapshot, setSubmittedSnapshot] = useState<{ name: string; email: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      subject: initialSubject || 'General Collaboration & Inquiry',
    }));
  }, [initialSubject]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setErrorMsg('');

    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedMessage = formData.message.trim();

    if (trimmedName.length < 2) {
      setErrorMsg('Please enter your full name (at least 2 characters).');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmedEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (trimmedMessage.length < 5) {
      setErrorMsg('Please describe your project, goal, or inquiry (at least 5 characters).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: trimmedName,
          email: trimmedEmail,
          phone: formData.phone.trim(),
          collaboratorType: formData.collaboratorType,
          technologyDomain: formData.technologyDomain,
          subject: formData.subject.trim() || 'General Collaboration & Inquiry',
          message: trimmedMessage,
          website: formData.website,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit inquiry. Please try again.');
      }

      setSubmittedSnapshot({ name: trimmedName, email: trimmedEmail });
      setFormData({
        name: '',
        email: '',
        phone: '',
        collaboratorType: 'Student / Independent Builder',
        technologyDomain: 'Drone Technology & UAV Engineering',
        subject: initialSubject || 'General Collaboration & Inquiry',
        message: '',
        website: '',
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error while submitting your inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-white border border-[#E5E7EB] shadow-xl p-6 sm:p-8 text-[#202124] animate-marvz-panel-in">
        <button
          type="button"
          onClick={() => {
            setSubmittedSnapshot(null);
            setErrorMsg('');
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-lg text-[#777777] hover:text-[#202124] hover:bg-[#F3F4F6] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedSnapshot ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center text-emerald-700 mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-[#202124]">Inquiry Submitted</h3>
            <p className="text-sm text-[#202124] font-medium leading-relaxed">
              Thank you for contacting MARVZ &amp; INNOVATION TECH! Your message has been submitted successfully. Our
              team will get back to you soon.
            </p>
            <p className="text-xs text-[#777777]">
              Submitted by <span className="font-semibold text-[#202124]">{submittedSnapshot.name}</span> ({submittedSnapshot.email})
            </p>
            <button
              type="button"
              onClick={() => {
                setSubmittedSnapshot(null);
                onClose();
              }}
              className="mt-2 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#30343B] hover:bg-[#202124] rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-5">
              <span className="text-xs font-mono uppercase tracking-wider text-[#777777]">MARVZ Direct Desk</span>
              <h3 className="text-xl font-bold text-[#202124] mt-1">Start a Conversation</h3>
              <p className="text-xs text-[#777777] mt-1">
                Collaborate on AI, drones, robotics, cybersecurity, or institutional training workshops.
              </p>
            </div>

            {errorMsg && (
              <div role="alert" className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="hidden"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#202124] mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] text-sm focus:outline-none focus:ring-2 focus:ring-[#30343B] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#202124] mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] text-sm focus:outline-none focus:ring-2 focus:ring-[#30343B] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#202124] mb-1">Phone / WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="+880 17XX-XXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] text-sm focus:outline-none focus:ring-2 focus:ring-[#30343B] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#202124] mb-1">Reaching Out As</label>
                  <select
                    value={formData.collaboratorType}
                    onChange={(e) => setFormData({ ...formData, collaboratorType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] text-xs focus:outline-none focus:ring-2 focus:ring-[#30343B] focus:bg-white"
                  >
                    <option value="Student / Independent Builder">Student / Independent Builder</option>
                    <option value="University / Educational Institution">University / Educational Institution</option>
                    <option value="Startup / Tech Founder">Startup / Tech Founder</option>
                    <option value="Company / Enterprise Team">Company / Enterprise Team</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#202124] mb-1">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] text-sm focus:outline-none focus:ring-2 focus:ring-[#30343B] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#202124] mb-1">Technology Domain</label>
                  <select
                    value={formData.technologyDomain}
                    onChange={(e) => setFormData({ ...formData, technologyDomain: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] text-xs focus:outline-none focus:ring-2 focus:ring-[#30343B] focus:bg-white"
                  >
                    <option value="Drone Technology & UAV Engineering">Drone Technology & UAV Engineering</option>
                    <option value="Robotics & Industrial Automation">Robotics & Industrial Automation</option>
                    <option value="Artificial Intelligence & Machine Learning">Artificial Intelligence & Machine Learning</option>
                    <option value="Cybersecurity & Digital Defense">Cybersecurity & Digital Defense</option>
                    <option value="IoT & Smart Embedded Systems">IoT & Smart Embedded Systems</option>
                    <option value="Software & Cloud Engineering">Software & Cloud Engineering</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#202124] mb-1">Inquiry Details *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe your objectives, desired hardware track, or project specs..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] text-sm focus:outline-none focus:ring-2 focus:ring-[#30343B] focus:bg-white"
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
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{submitting ? 'Sending...' : 'Send Message to MARVZ'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
