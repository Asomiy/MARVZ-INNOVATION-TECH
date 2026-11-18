import React, { useState } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenInquiry: (initialSubject?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenInquiry,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'cinematic', label: 'Architecture' },
    { id: 'about', label: 'About' },
    { id: 'technologies', label: 'Technologies' },
    { id: 'offices-collaboration', label: 'Offices & Collaboration' },
    { id: 'what-we-do', label: 'What We Do' },
    { id: 'projects', label: 'Projects' },
    { id: 'training', label: 'Training' },
    { id: 'find-our-office', label: 'Office' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Official Brand Logo (Top-Left Corner) */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center text-left focus:outline-none shrink-0"
            aria-label="MARVZ & INNOVATION TECH Home"
          >
            <BrandLogo size="md" showText={true} showTagline={true} />
          </button>

          {/* Desktop Single-Line Navigation */}
          <nav className="hidden xl:flex items-center gap-0.5 2xl:gap-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative px-2 2xl:px-2.5 py-1.5 text-[12px] 2xl:text-[13px] font-medium transition-all duration-200 rounded-md whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#30343B] ${
                    isActive
                      ? 'text-[#202124] bg-[#F3F4F6] font-semibold'
                      : 'text-[#777777] hover:text-[#202124] hover:bg-[#F3F4F6]/60'
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute bottom-0 left-2 right-2 h-[2px] bg-[#30343B] rounded-full transition-all duration-250 origin-center ${
                      isActive ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          {/* Right Primary CTA */}
          <div className="hidden xl:flex items-center gap-2 shrink-0">
            <button
              onClick={() => onOpenInquiry('General Collaboration & Inquiry')}
              className="group flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#30343B] hover:bg-[#202124] rounded-lg shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#30343B] whitespace-nowrap shrink-0"
            >
              <span>Let&apos;s Talk</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>

          {/* Mobile/Tablet Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg text-[#202124] hover:bg-[#F3F4F6] transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer with Official Logo */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-[#E5E7EB] px-4 pt-3 pb-5 space-y-1.5 shadow-md animate-marvz-panel-in">
          <div className="pb-3 mb-2 border-b border-[#E5E7EB] flex items-center justify-between">
            <BrandLogo size="sm" showText={true} showTagline={true} />
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#F3F4F6] text-[#202124] font-semibold border border-[#E5E7EB]'
                    : 'text-[#777777] hover:text-[#202124] hover:bg-[#F3F4F6]'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          <div className="pt-3 flex flex-col gap-2 border-t border-[#E5E7EB] mt-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenInquiry('General Collaboration & Inquiry');
              }}
              className="w-full py-2.5 text-sm font-semibold text-white bg-[#30343B] hover:bg-[#202124] rounded-lg transition-colors"
            >
              Let's Talk
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
