import React, { useState } from 'react';
import { Menu, X, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenInquiry: (initialSubject?: string) => void;
  onOpenControlCenter?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenInquiry, onOpenControlCenter }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'cinematic', label: '3D Animation' },
    { id: 'about', label: 'About' },
    { id: 'technologies', label: 'Technologies' },
    { id: 'what-we-do', label: 'What We Do' },
    { id: 'projects', label: 'Projects' },
    { id: 'training', label: 'Training' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);

    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#081426]/95 backdrop-blur-md border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-20">
          
          {/* Zone 1: Official MARVZ & INNOVATION TECH Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded-lg"
            aria-label="MARVZ & INNOVATION TECH Home"
          >
            <BrandLogo size="md" showText={true} />
          </button>

          {/* Zone 2: Single-line navigation links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-300">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`whitespace-nowrap shrink-0 transition-colors py-1 relative ${
                  activeTab === item.id
                    ? 'text-white font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {item.label}
                {activeTab === item.id && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#2563EB] to-[#06B6D4] rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Zone 3: Actions - AI Control Center & Let's Talk */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            {onOpenControlCenter && (
              <button
                onClick={onOpenControlCenter}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-200 bg-red-950/60 hover:bg-red-900/60 border border-red-500/40 rounded-xl transition-all whitespace-nowrap shrink-0 hover:text-white"
                title="Open MARVZ AI Control Center Admin Dashboard"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                <span>AI Control Center</span>
              </button>
            )}

            <button
              onClick={() => onOpenInquiry('General Collaboration & Inquiry')}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#2563EB] hover:bg-[#1d4ed8] rounded-xl shadow-lg shadow-[#2563EB]/25 hover:shadow-xl transition-all whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#06B6D4]"
            >
              <span>Let's Talk</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-[#081426] px-4 pt-3 pb-6">
          <div className="pb-3 mb-2 border-b border-slate-800/80">
            <BrandLogo size="sm" showText={true} />
          </div>
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? 'bg-[#2563EB]/15 text-[#06B6D4] font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="pt-4 border-t border-slate-800 mt-2 space-y-2">
              {onOpenControlCenter && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenControlCenter();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-red-200 bg-red-950/60 border border-red-500/40 rounded-xl"
                >
                  <ShieldCheck className="w-4 h-4 text-red-400" />
                  <span>MARVZ AI Control Center</span>
                </button>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenInquiry('General Collaboration & Inquiry');
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] rounded-xl shadow-md"
              >
                <span>Let's Talk</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
