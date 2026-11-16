import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Send,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  HelpCircle,
  ArrowRight,
  Navigation,
  ExternalLink,
  Building2,
  Loader2,
  Briefcase,
} from 'lucide-react';
import { COLLABORATION_MODELS, FAQS } from '../data/companyData';
import { LocationConfig } from '../types/admin';
import { OfficeLocationMap } from './OfficeLocationMap';
import { TechBackdrop } from './TechBackdrop';

interface ContactCollaborationSectionProps {
  location: LocationConfig;
  onOpenWhatsApp: () => void;
  onOpenInquiry: (initialSubject?: string) => void;
  onOpenInternshipModal?: () => void;
}

export const ContactCollaborationSection: React.FC<ContactCollaborationSectionProps> = ({
  location,
  onOpenWhatsApp,
  onOpenInquiry,
  onOpenInternshipModal,
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    collaboratorType: 'Student / Independent Builder',
    technologyDomain: 'Drone Technology & UAV Engineering',
    subject: 'General Project & Collaboration Inquiry',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleSubmit = async (e: React.FormEvent) => {
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

    setSubmitting(true);
    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to transmit message.');
      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <section id="contact" className="relative overflow-hidden py-20 bg-[#FAFAFB] text-[#202124]">
      <TechBackdrop variant="cloud-relay" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="text-xs font-mono uppercase tracking-wider text-[#777777] mb-2 font-semibold">
            06. Connect & Visit Us
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202124] tracking-tight leading-tight">
            Let's Build Something Innovative
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#777777] leading-relaxed">
            Whether you are an aspiring engineer wanting to master physical hardware, an educational institution looking to
            launch cutting-edge tech labs, or a company seeking exploratory prototypes—visit our Dhaka headquarters or
            reach out below.
          </p>
        </div>

        {/* Dedicated Find Our Office / Google Maps Location Showcase */}
        <div
          id="find-our-office"
          className="mb-16 p-6 sm:p-8 rounded-3xl bg-white border border-[#E5E7EB] shadow-sm"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Office Address & Directions Info */}
            <div className="lg:col-span-5 space-y-5">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#777777] mb-2 font-semibold">
                  <Building2 className="w-4 h-4 text-[#30343B]" />
                  <span>Find Our Office</span>
                </div>
                <h3 className="text-2xl font-extrabold text-[#202124]">{location.officeName}</h3>
                <p className="text-xs text-[#777777] mt-1">{location.landmarkNote}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F3F4F6] border border-[#E5E7EB] space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#30343B] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                      Official Office Address
                    </div>
                    <p className="text-sm font-semibold text-[#202124] leading-relaxed mt-1">
                      {location.officeAddress}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-[#E5E7EB] text-xs text-[#202124]">
                  <Phone className="w-4 h-4 text-[#30343B] shrink-0" />
                  <span>{location.contactPhone}</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-[#202124]">
                  <Mail className="w-4 h-4 text-[#30343B] shrink-0" />
                  <a href={`mailto:${location.contactEmail}`} className="hover:underline">
                    {location.contactEmail}
                  </a>
                </div>

                <div className="flex items-center gap-3 text-xs text-[#777777]">
                  <Clock className="w-4 h-4 text-[#30343B] shrink-0" />
                  <span>{location.workingHours}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href={location.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white bg-[#30343B] hover:bg-[#202124] rounded-xl shadow-xs transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Get Directions</span>
                </a>

                <a
                  href={location.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-semibold text-[#202124] bg-white hover:bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl transition-colors"
                >
                  <span>Open Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#30343B]" />
                </a>
              </div>
            </div>

            {/* Right Interactive Google Maps Canvas */}
            <div className="lg:col-span-7">
              <OfficeLocationMap location={location} heightClass="h-[340px] sm:h-[400px]" />
            </div>
          </div>
        </div>

        {/* 4 Collaboration Pathways */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {COLLABORATION_MODELS.map((model, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white border border-[#E5E7EB] hover:border-[#30343B]/40 transition-colors flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="text-[11px] font-mono text-[#777777] uppercase tracking-wider mb-2">
                  {model.tag}
                </div>
                <h4 className="text-base font-bold text-[#202124] mb-2">
                  {model.title}
                </h4>
                <p className="text-xs text-[#777777] leading-relaxed">{model.desc}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#E5E7EB]">
                <button
                  onClick={() => onOpenInquiry(`Collaboration: ${model.title}`)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#30343B] hover:text-[#202124] transition-colors"
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
          {/* Left: Interactive Contact Form Connected to Backend */}
          <div className="lg:col-span-7 p-8 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center text-[#30343B] mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-[#202124]">Message Transmitted</h3>
                <p className="text-sm text-[#777777] max-w-md mx-auto leading-relaxed">
                  Thank you, <span className="text-[#202124] font-semibold">{formData.fullName}</span>. Our Dhaka HQ
                  engineering and advisory desk has received your message and will reply via{' '}
                  <span className="text-[#202124] font-medium">{formData.email}</span> promptly.
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
                        subject: 'General Project & Collaboration Inquiry',
                        message: '',
                      });
                    }}
                    className="px-4 py-2 text-xs font-medium text-[#202124] bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E5E7EB] rounded-lg"
                  >
                    Send Another Note
                  </button>
                  <button
                    onClick={onOpenWhatsApp}
                    className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#30343B] hover:bg-[#202124] rounded-lg"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Chat on WhatsApp</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="border-b border-[#E5E7EB] pb-3 mb-2">
                  <h3 className="text-lg font-bold text-[#202124]">Start a Conversation</h3>
                  <p className="text-xs text-[#777777] mt-1">
                    Tell us about your learning ambitions, hardware project ideas, or partnership proposals.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#202124] mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maya Lin"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] placeholder-[#777777] text-sm focus:outline-none focus:ring-2 focus:ring-[#30343B] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#202124] mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="maya@domain.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] placeholder-[#777777] text-sm focus:outline-none focus:ring-2 focus:ring-[#30343B] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#202124] mb-1">Phone / WhatsApp Number</label>
                    <input
                      type="tel"
                      placeholder="+880 17XX-XXXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] placeholder-[#777777] text-sm focus:outline-none focus:ring-2 focus:ring-[#30343B] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#202124] mb-1">I am reaching out as:</label>
                    <select
                      value={formData.collaboratorType}
                      onChange={(e) => setFormData({ ...formData, collaboratorType: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] text-sm focus:outline-none focus:ring-2 focus:ring-[#30343B] focus:bg-white"
                    >
                      <option value="Student / Independent Builder">Student / Independent Builder</option>
                      <option value="University / Educational Institution">University / Educational Institution</option>
                      <option value="Startup / Tech Founder">Startup / Tech Founder</option>
                      <option value="Company / Enterprise Team">Company / Enterprise Team</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#202124] mb-1">Subject / Inquiry Topic</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] text-sm focus:outline-none focus:ring-2 focus:ring-[#30343B] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#202124] mb-1">Primary Technology Domain:</label>
                    <select
                      value={formData.technologyDomain}
                      onChange={(e) => setFormData({ ...formData, technologyDomain: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] text-sm focus:outline-none focus:ring-2 focus:ring-[#30343B] focus:bg-white"
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
                  <label className="block text-xs font-medium text-[#202124] mb-1">
                    Project, Goal, or Workshop Inquiry *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us what you want to build, learn, or collaborate on..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] placeholder-[#777777] text-sm focus:outline-none focus:ring-2 focus:ring-[#30343B] focus:bg-white"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-white bg-[#30343B] hover:bg-[#202124] rounded-xl shadow-xs transition-colors disabled:opacity-60"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>{submitting ? 'Sending Message...' : 'Send Message to MARVZ'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right: Direct Channels, WhatsApp & Internship CTA */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#30343B] flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#202124]">WhatsApp Advisory Line</h4>
                  <p className="text-xs text-[#777777] font-mono">Immediate Contact · {location.contactWhatsApp}</p>
                </div>
              </div>
              <p className="text-xs text-[#777777] leading-relaxed mb-4">
                Have questions about workshop seat dates, drone flight test ranges, or partnership terms? Connect
                instantly with our startup desk.
              </p>
              <button
                onClick={onOpenWhatsApp}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#30343B] hover:bg-[#202124] rounded-xl transition-colors"
              >
                <span>Launch WhatsApp Chat</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] space-y-4 shadow-xs">
              <h4 className="text-xs font-bold text-[#202124] uppercase tracking-wider">Direct Communications</h4>

              <div className="space-y-3 text-xs text-[#777777]">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#30343B] shrink-0" />
                  <div>
                    <span>Startup Inquiries: </span>
                    <a href={`mailto:${location.contactEmail}`} className="text-[#202124] font-medium hover:underline">
                      {location.contactEmail}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#30343B] shrink-0" />
                  <div>
                    <span>Direct Desk: </span>
                    <span className="text-[#202124] font-medium">{location.contactPhone}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2 border-t border-[#E5E7EB]">
                  <MapPin className="w-4 h-4 text-[#30343B] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[#202124] font-semibold">Dhaka Headquarters</span>
                    <p className="text-[#777777] mt-0.5 leading-relaxed">{location.officeAddress}</p>
                    <a
                      href={location.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#30343B] hover:text-[#202124] font-semibold mt-1 underline"
                    >
                      <span>View on Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {onOpenInternshipModal && (
              <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-[#202124]">
                  <Briefcase className="w-4 h-4 text-[#30343B]" />
                  <span>Students & Fresh Graduates</span>
                </div>
                <p className="text-xs text-[#777777] leading-relaxed">
                  Apply for our 3-month & 6-month hands-on Engineering Internships and Research Fellowships in Dhaka.
                </p>
                <button
                  onClick={onOpenInternshipModal}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#202124] bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E5E7EB] rounded-xl transition-colors"
                >
                  <span>Apply for Internship</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Startup FAQ Accordion */}
        <div className="pt-16 border-t border-[#E5E7EB]">
          <div className="max-w-3xl mx-auto mb-10 text-center">
            <div className="text-xs font-mono uppercase tracking-wider text-[#777777] mb-2 flex items-center justify-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-[#30343B]" />
              <span>Clarity & Questions</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#202124]">Frequently Asked Questions</h3>
            <p className="text-xs sm:text-sm text-[#777777] mt-2">
              Everything you need to know about our technology startup and how to get involved.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl bg-white border border-[#E5E7EB] overflow-hidden shadow-xs"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-5 text-left text-sm font-semibold text-[#202124] hover:bg-[#F3F4F6]/50 transition-colors focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#30343B] shrink-0 ml-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#777777] shrink-0 ml-4" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-[#777777] leading-relaxed border-t border-[#E5E7EB] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Final Bold Call to Action Banner */}
        <div className="mt-20 p-8 sm:p-12 rounded-2xl bg-white border border-[#E5E7EB] text-center shadow-sm">
          <div className="max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#777777]">
              Think Beyond. Build Tomorrow.
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#202124] tracking-tight">
              Ready to Build the Future with Us?
            </h3>
            <p className="text-sm sm:text-base text-[#777777] leading-relaxed">
              Join MARVZ & INNOVATION TECH at our West Shewrapara Innovation Hub in Dhaka.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onOpenInquiry('General Collaboration Discussion')}
                className="w-full sm:w-auto px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#30343B] hover:bg-[#202124] rounded-xl shadow-xs transition-colors"
              >
                Let's Collaborate
              </button>
              <a
                href={location.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#202124] bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E5E7EB] rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4 text-[#30343B]" />
                <span>Directions to Office</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
