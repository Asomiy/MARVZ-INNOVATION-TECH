import React, { useState } from 'react';
import { 
  Mail, Phone, MapPin, MessageSquare, Send, CheckCircle2, 
  ChevronDown, ChevronUp, Clock, HelpCircle, ArrowRight, Sparkles, Building2, Users
} from 'lucide-react';
import { COLLABORATION_MODELS, FAQS } from '../data/companyData';

interface ContactCollaborationSectionProps {
  onOpenWhatsApp: () => void;
  onOpenInquiry: (initialSubject?: string) => void;
}

export const ContactCollaborationSection: React.FC<ContactCollaborationSectionProps> = ({ 
  onOpenWhatsApp, 
  onOpenInquiry 
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    collaboratorType: 'Student / Independent Builder',
    technologyDomain: 'Drone Technology & UAV Engineering',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!formData.message.trim()) {
      setErrorMsg('Please write a short note about your goals or project.');
      return;
    }

    // Record submission into localStorage for persistent client-side tracking
    try {
      const existing = JSON.parse(localStorage.getItem('marvz_startup_inquiries') || '[]');
      existing.push({
        ...formData,
        date: new Date().toISOString()
      });
      localStorage.setItem('marvz_startup_inquiries', JSON.stringify(existing));
    } catch (err) {
      // ignore
    }

    setSubmitted(true);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <section id="contact" className="py-20 bg-[#0B1020] relative overflow-hidden">
      
      {/* Authentic Technology Collaboration & Research Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=2000&q=80"
          alt="Engineering laboratory collaboration background"
          className="w-full h-full object-cover object-center opacity-15"
          referrerPolicy="no-referrer"
        />
        {/* Dark Navy Scrim for optimal contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1020]/95 via-[#081426]/90 to-[#0B1020]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(#2563EB_1px,transparent_1px)] [background-size:36px_36px] opacity-10" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="text-xs font-mono uppercase tracking-wider text-[#06B6D4] mb-2">
            06. Connect & Collaborate
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Let's Build Something Innovative
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            Whether you are an aspiring engineer wanting to master physical hardware, an educational institution looking to launch cutting-edge tech labs, or a company seeking exploratory prototypes—we want to collaborate with you.
          </p>
        </div>

        {/* 4 Collaboration Pathways */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {COLLABORATION_MODELS.map((model, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-[#0c1a30] border border-slate-800 hover:border-[#2563EB]/50 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="text-[11px] font-mono text-[#06B6D4] uppercase tracking-wider mb-2">
                  {model.tag}
                </div>
                <h4 className="text-base font-bold text-white mb-2 group-hover:text-[#06B6D4] transition-colors">
                  {model.title}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {model.desc}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80">
                <button
                  onClick={() => onOpenInquiry(`Collaboration: ${model.title}`)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#06B6D4] hover:text-white transition-colors"
                >
                  <span>Select Pathway</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 2-Column Split: Form + Direct Channels & WhatsApp Desk */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
          
          {/* Left: Interactive Form */}
          <div className="lg:col-span-7 p-8 rounded-2xl bg-[#0c1a30] border border-slate-800 shadow-xl">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white">Message Transmitted</h3>
                <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  Thank you, <span className="text-white font-semibold">{formData.fullName}</span>. Our startup engineering and advisory desk will review your message and reply via <span className="text-[#06B6D4]">{formData.email}</span> within 24 business hours.
                </p>
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        fullName: '',
                        email: '',
                        phone: '',
                        collaboratorType: 'Student / Independent Builder',
                        technologyDomain: 'Drone Technology & UAV Engineering',
                        message: ''
                      });
                    }}
                    className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg"
                  >
                    Send Another Note
                  </button>
                  <button
                    onClick={onOpenWhatsApp}
                    className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-800 rounded-lg"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Chat on WhatsApp</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="border-b border-slate-800 pb-3 mb-2">
                  <h3 className="text-lg font-bold text-white">Start a Conversation</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Tell us about your learning ambitions, hardware project ideas, or partnership proposals.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maya Lin"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#081426] border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="maya@domain.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#081426] border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Phone / WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 019-4820"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#081426] border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      I am reaching out as:
                    </label>
                    <select
                      value={formData.collaboratorType}
                      onChange={(e) => setFormData({ ...formData, collaboratorType: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#081426] border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    >
                      <option value="Student / Independent Builder">Student / Independent Builder</option>
                      <option value="University / Educational Institution">University / Educational Institution</option>
                      <option value="Startup / Tech Founder">Startup / Tech Founder</option>
                      <option value="Company / Enterprise Team">Company / Enterprise Team</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Primary Technology Domain:
                  </label>
                  <select
                    value={formData.technologyDomain}
                    onChange={(e) => setFormData({ ...formData, technologyDomain: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#081426] border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  >
                    <option value="Drone Technology & UAV Engineering">Drone Technology & UAV Engineering</option>
                    <option value="Robotics & Industrial Automation">Robotics & Industrial Automation</option>
                    <option value="Artificial Intelligence & Machine Learning">Artificial Intelligence & Machine Learning</option>
                    <option value="Cybersecurity & Digital Defense">Cybersecurity & Digital Defense</option>
                    <option value="IoT & Smart Embedded Systems">IoT & Smart Embedded Systems</option>
                    <option value="Software & Cloud Engineering">Software & Cloud Engineering</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Project, Goal, or Workshop Inquiry *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us what you want to build, learn, or collaborate on..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#081426] border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] hover:bg-[#1d4ed8] rounded-xl shadow-lg shadow-[#2563EB]/25 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Message to MARVZ</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right: Direct Channels & WhatsApp Desk */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* WhatsApp Box */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-[#0c1a30] to-[#0c1a30] border border-emerald-800/40 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">WhatsApp Advisory Line</h4>
                  <p className="text-xs text-emerald-400 font-mono">Immediate Contact</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Have questions about workshop seat dates, drone flight test ranges, or partnership terms? Connect instantly with our startup desk.
              </p>
              <button
                onClick={onOpenWhatsApp}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors shadow-sm"
              >
                <span>Launch WhatsApp Chat</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Direct Contact Info */}
            <div className="p-6 rounded-2xl bg-[#0c1a30] border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Direct Communications
              </h4>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#2563EB] shrink-0" />
                  <div>
                    <span className="text-slate-400">Startup Inquiries: </span>
                    <a href="mailto:hello@marvztech.com" className="text-white hover:text-[#06B6D4]">
                      hello@marvztech.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#2563EB] shrink-0" />
                  <div>
                    <span className="text-slate-400">Direct Desk: </span>
                    <span className="text-white">+1 (800) 542-MARVZ</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2 border-t border-slate-800">
                  <Clock className="w-4 h-4 text-[#06B6D4] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white font-medium">Response Hours</span>
                    <p className="text-slate-400 mt-0.5">
                      Monday – Saturday: 09:00 AM – 06:00 PM<br />
                      Technical reviews conducted daily.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Startup FAQ Accordion */}
        <div className="pt-16 border-t border-slate-800">
          <div className="max-w-3xl mx-auto mb-10 text-center">
            <div className="text-xs font-mono uppercase tracking-wider text-[#06B6D4] mb-2 flex items-center justify-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Clarity & Questions</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              Frequently Asked Questions
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Everything you need to know about our technology startup and how to get involved.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl bg-[#0c1a30] border border-slate-800 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-5 text-left text-sm font-semibold text-white hover:text-[#06B6D4] transition-colors focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#06B6D4] shrink-0 ml-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-4" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Final Bold Call to Action Banner */}
        <div className="mt-20 p-8 sm:p-12 rounded-2xl bg-gradient-to-r from-[#0c1a30] via-[#102444] to-[#0c1a30] border border-[#2563EB]/40 text-center shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#06B6D4]">
              Think Beyond. Build Tomorrow.
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to Build the Future with Us?
            </h3>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Join MARVZ & INNOVATION TECH as an engineering learner, collaborative partner, or prototyping innovator.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onOpenInquiry('General Collaboration Discussion')}
                className="w-full sm:w-auto px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] hover:bg-[#1d4ed8] rounded-xl shadow-lg shadow-[#2563EB]/25 transition-all"
              >
                Let's Collaborate
              </button>
              <button
                onClick={onOpenWhatsApp}
                className="w-full sm:w-auto px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/60 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
