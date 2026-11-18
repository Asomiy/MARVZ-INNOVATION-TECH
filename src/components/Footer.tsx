import React from 'react';
import { Mail, MapPin, Phone, MessageSquare, ArrowRight, ExternalLink, Navigation } from 'lucide-react';
import { STARTUP_INFO } from '../data/companyData';
import { BrandLogo } from './BrandLogo';
import { LocationConfig } from '../types/admin';
import { TechBackdrop } from './TechBackdrop';

interface FooterProps {
  location: LocationConfig;
  setActiveTab: (tab: string) => void;
  onOpenInquiry: (initialSubject?: string) => void;
  onOpenWhatsApp: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  location,
  setActiveTab,
  onOpenInquiry,
  onOpenWhatsApp,
}) => {
  const currentYear = new Date().getFullYear();
  const contactEmail = (location.contactEmail || 'marvzinnovationtech@gmail.com').trim();
  const contactPhone = location.contactPhone || '+8801775551987';
  const contactWhatsApp = location.contactWhatsApp || '+8801775551987';
  const telHref = `tel:${contactPhone.replace(/[^+\d]/g, '')}`;
  const waHref = `https://wa.me/${contactWhatsApp.replace(/[^\d]/g, '')}`;

  const handleNav = (tabId: string) => {
    setActiveTab(tabId);
    const el = document.getElementById(tabId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative overflow-hidden bg-[#FFFFFF] text-[#202124] border-t border-[#E5E7EB]">
      <TechBackdrop variant="footer" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-[#E5E7EB]">
          {/* Column 1: Brand Info & Positioning */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo size="md" showText={true} showTagline={true} />

            <p className="text-sm text-[#777777] max-w-sm leading-relaxed">
              An emerging technology startup exploring next-generation technologies, engineering custom prototypes, and
              delivering hands-on technical education across drones, robotics, AI, cybersecurity, and IoT.
            </p>

            <div className="pt-1 text-xs font-medium text-[#30343B]">{STARTUP_INFO.tagline}</div>

            <div className="pt-2 flex flex-wrap items-center gap-2">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#202124] bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E5E7EB] rounded-lg shadow-xs transition-colors duration-150"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#30343B]" />
                <span>WhatsApp Desk</span>
              </a>
              <a
                href={`mailto:${contactEmail}`}
                aria-label={`Email ${contactEmail}`}
                title={contactEmail}
                className="p-2 text-[#30343B] hover:text-[#202124] bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E5E7EB] rounded-lg shadow-xs transition-colors duration-150"
              >
                <Mail className="w-3.5 h-3.5" />
              </a>
              <a
                href={telHref}
                aria-label={`Call ${contactPhone}`}
                title={contactPhone}
                className="p-2 text-[#30343B] hover:text-[#202124] bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E5E7EB] rounded-lg shadow-xs transition-colors duration-150"
              >
                <Phone className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Column 2: Technology Divisions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#202124]">Core Technologies</h4>
            <ul className="space-y-2 text-sm text-[#777777]">
              <li>
                <button onClick={() => handleNav('technologies')} className="hover:text-[#202124] transition-colors text-left">
                  Artificial Intelligence & ML
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('technologies')} className="hover:text-[#202124] transition-colors text-left">
                  Cybersecurity & Defense
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('technologies')} className="hover:text-[#202124] transition-colors text-left">
                  Drone Technology & UAV
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('technologies')} className="hover:text-[#202124] transition-colors text-left">
                  Robotics & Automation
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('technologies')} className="hover:text-[#202124] transition-colors text-left">
                  IoT & Smart Embedded Systems
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('technologies')} className="hover:text-[#202124] transition-colors text-left">
                  Software Engineering
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#202124]">Navigation</h4>
            <ul className="space-y-2 text-sm text-[#777777]">
              <li>
                <button onClick={() => handleNav('home')} className="hover:text-[#202124] transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('about')} className="hover:text-[#202124] transition-colors">
                  About MARVZ
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('technologies')} className="hover:text-[#202124] transition-colors">
                  Technologies
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('offices-collaboration')} className="hover:text-[#202124] transition-colors text-left">
                  Offices &amp; Collaboration
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('ecosystem')} className="hover:text-[#202124] transition-colors text-left">
                  Clients &amp; Ecosystem
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('what-we-do')} className="hover:text-[#202124] transition-colors">
                  What We Do
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('projects')} className="hover:text-[#202124] transition-colors">
                  Projects & Prototypes
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('training')} className="hover:text-[#202124] transition-colors">
                  Hands-On Training
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('find-our-office')} className="hover:text-[#202124] transition-colors">
                  Find Our Office
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Official Dhaka Office & Communications */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#202124]">Office & Contact</h4>
            <ul className="space-y-3 text-sm text-[#777777]">
              <li>
                <a
                  href={`mailto:${contactEmail}`}
                  aria-label={`Email ${contactEmail}`}
                  title={`Email ${contactEmail}`}
                  className="inline-flex items-center gap-2.5 text-xs text-[#202124] hover:underline"
                >
                  <Mail className="w-4 h-4 text-[#30343B] shrink-0" />
                  <span className="break-all">{contactEmail}</span>
                </a>
              </li>
              <li>
                <a
                  href={telHref}
                  className="inline-flex items-center gap-2.5 text-xs text-[#202124] hover:underline"
                >
                  <Phone className="w-4 h-4 text-[#30343B] shrink-0" />
                  <span>{contactPhone}</span>
                </a>
              </li>
              <li>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 text-xs text-[#202124] hover:underline"
                >
                  <MessageSquare className="w-4 h-4 text-[#30343B] shrink-0" />
                  <span>WhatsApp: {contactWhatsApp}</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#30343B] shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed text-[#777777] space-y-1">
                  <div className="font-semibold text-[#202124]">
                    Operational Office – Banani DOHS
                  </div>
                  <p className="text-[#777777]">92/A, Banani DOHS, Dhaka-1213, Bangladesh.</p>
                  <div className="flex flex-wrap items-center gap-3 pt-0.5">
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=92%2FA%2C+Banani+DOHS%2C+Dhaka-1213%2C+Bangladesh"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#30343B] hover:text-[#202124] underline"
                    >
                      <span>Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href="https://www.google.com/maps/dir/?api=1&destination=92%2FA%2C+Banani+DOHS%2C+Dhaka-1213%2C+Bangladesh"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#30343B] hover:text-[#202124] underline"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Directions</span>
                    </a>
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-2.5 pt-1 border-t border-[#E5E7EB]">
                <MapPin className="w-4 h-4 text-[#30343B] shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed text-[#777777] space-y-1">
                  <div className="font-semibold text-[#202124]">
                    Operational Office – West Shewrapara
                  </div>
                  <p className="text-[#777777]">{location.officeAddress}</p>
                  <div className="flex flex-wrap items-center gap-3 pt-0.5">
                    <a
                      href={location.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#30343B] hover:text-[#202124] underline"
                    >
                      <span>Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href={location.directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#30343B] hover:text-[#202124] underline"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Directions</span>
                    </a>
                  </div>
                </div>
              </li>
              <li className="pt-1">
                <button
                  onClick={() => onOpenInquiry('Startup Collaboration Consultation')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#30343B] hover:text-[#202124] transition-colors"
                >
                  <span>Start a Conversation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#777777]">
          <p>© {currentYear} MARVZ & INNOVATION TECH. Think Beyond. Build Tomorrow.</p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span>Banani DOHS &amp; West Shewrapara, Dhaka, Bangladesh</span>
            <span aria-hidden="true">·</span>
            <button onClick={() => handleNav('about')} className="hover:text-[#202124] transition-colors">
              Startup Philosophy
            </button>
            <span aria-hidden="true">·</span>
            <button onClick={() => handleNav('find-our-office')} className="hover:text-[#202124] transition-colors">
              Office Map
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
