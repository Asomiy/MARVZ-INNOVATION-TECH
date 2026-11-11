import React from 'react';
import { Mail, MapPin, Phone, MessageSquare, ArrowRight } from 'lucide-react';
import { STARTUP_INFO } from '../data/companyData';
import { BrandLogo } from './BrandLogo';

interface FooterProps {
  setActiveTab: (tab: string) => void;
  onOpenInquiry: (initialSubject?: string) => void;
  onOpenWhatsApp: () => void;
  onOpenControlCenter?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab, onOpenInquiry, onOpenWhatsApp, onOpenControlCenter }) => {
  const currentYear = new Date().getFullYear();

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
    <footer className="bg-[#050D1A] text-slate-300 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-slate-800/80">
          
          {/* Column 1: Brand Info & Positioning */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo size="md" showText={true} showTagline={true} />

            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              An emerging technology startup exploring next-generation technologies, engineering custom prototypes, and delivering hands-on technical education across drones, robotics, AI, cybersecurity, and IoT.
            </p>

            <div className="pt-2 text-xs font-mono text-[#06B6D4]">
              {STARTUP_INFO.tagline}
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenWhatsApp}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 hover:bg-emerald-900/50 rounded-xl transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Advisory Desk</span>
              </button>
            </div>
          </div>

          {/* Column 2: Technology Divisions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Core Technologies
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button onClick={() => handleNav('technologies')} className="hover:text-[#06B6D4] transition-colors text-left">
                  Artificial Intelligence & ML
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('technologies')} className="hover:text-[#06B6D4] transition-colors text-left">
                  Cybersecurity & Defense
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('technologies')} className="hover:text-[#06B6D4] transition-colors text-left">
                  Drone Technology & UAV
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('technologies')} className="hover:text-[#06B6D4] transition-colors text-left">
                  Robotics & Automation
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('technologies')} className="hover:text-[#06B6D4] transition-colors text-left">
                  IoT & Smart Embedded Systems
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('technologies')} className="hover:text-[#06B6D4] transition-colors text-left">
                  Software Engineering
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button onClick={() => handleNav('home')} className="hover:text-white transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('about')} className="hover:text-white transition-colors">
                  About MARVZ
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('technologies')} className="hover:text-white transition-colors">
                  Technologies
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('what-we-do')} className="hover:text-white transition-colors">
                  What We Do
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('projects')} className="hover:text-white transition-colors">
                  Projects & Prototypes
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('training')} className="hover:text-white transition-colors">
                  Hands-On Training
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('contact')} className="hover:text-white transition-colors">
                  Contact & Collaborate
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Startup Communications */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Communications
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#2563EB] shrink-0" />
                <span className="text-xs text-slate-300">hello@marvztech.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#2563EB] shrink-0" />
                <span className="text-xs text-slate-300">+1 (800) 542-MARVZ</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                <span className="text-xs leading-relaxed text-slate-400">
                  MARVZ Startup Innovation Labs<br />
                  Tech & Engineering Hub
                </span>
              </li>
              <li className="pt-2">
                <button
                  onClick={() => onOpenInquiry('Startup Collaboration Consultation')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#06B6D4] hover:text-white transition-colors"
                >
                  <span>Start a Conversation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {currentYear} MARVZ & INNOVATION TECH. Think Beyond. Build Tomorrow.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-slate-400">Emerging Technology Startup</span>
            <span aria-hidden="true">·</span>
            <button onClick={() => handleNav('about')} className="hover:text-slate-400 transition-colors">
              Startup Philosophy
            </button>
            <span aria-hidden="true">·</span>
            <button onClick={() => handleNav('contact')} className="hover:text-slate-400 transition-colors">
              Collaborate
            </button>
            {onOpenControlCenter && (
              <>
                <span aria-hidden="true">·</span>
                <button
                  onClick={onOpenControlCenter}
                  className="text-red-400 hover:text-red-300 font-semibold transition-colors flex items-center gap-1"
                >
                  MARVZ AI Control Center
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
