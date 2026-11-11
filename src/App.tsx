/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { CinematicAnimationSection } from './components/CinematicAnimationSection';
import { AboutSection } from './components/AboutSection';
import { TechnologiesSection } from './components/TechnologiesSection';
import { WhatWeDoSection } from './components/WhatWeDoSection';
import { InnovationInActionSection } from './components/InnovationInActionSection';
import { LearnExperimentSection } from './components/LearnExperimentSection';
import { ContactCollaborationSection } from './components/ContactCollaborationSection';
import { InquiryModal } from './components/InquiryModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { MarvzChatbot } from './components/chatbot/MarvzChatbot';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLoginView } from './components/admin/AdminLoginView';
import { AdminUser } from './types/admin';
import { MessageSquare, ArrowUp } from 'lucide-react';

export default function App() {
  const [viewMode, setViewMode] = useState<'website' | 'admin'>('website');
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  const [activeTab, setActiveTab] = useState<string>('home');
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [inquirySubject, setInquirySubject] = useState('General Collaboration & Inquiry');
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Check initial path & stored admin session
  useEffect(() => {
    if (window.location.pathname === '/admin') {
      setViewMode('admin');
    }

    const storedUser = localStorage.getItem('marvz_admin_user');
    if (storedUser) {
      try {
        setAdminUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('marvz_admin_user');
      }
    }

    const handlePopState = () => {
      if (window.location.pathname === '/admin') {
        setViewMode('admin');
      } else {
        setViewMode('website');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOpenControlCenter = () => {
    setViewMode('admin');
    window.history.pushState(null, '', '/admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToWebsite = () => {
    setViewMode('website');
    window.history.pushState(null, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    localStorage.removeItem('marvz_admin_token');
    localStorage.removeItem('marvz_admin_user');
    setAdminUser(null);
  };

  const handleOpenInquiry = (subject: string = 'General Collaboration & Inquiry') => {
    setInquirySubject(subject);
    setIsInquiryOpen(true);
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExploreTechnologies = () => {
    setActiveTab('technologies');
    const el = document.getElementById('technologies');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // If in Admin Control Center mode
  if (viewMode === 'admin') {
    if (!adminUser) {
      return (
        <AdminLoginView
          onLoginSuccess={(user) => setAdminUser(user)}
          onBackToWebsite={handleBackToWebsite}
        />
      );
    }
    return (
      <AdminLayout
        user={adminUser}
        onLogout={handleLogout}
        onBackToWebsite={handleBackToWebsite}
      />
    );
  }

  // Public Corporate Website View
  return (
    <div className="min-h-screen flex flex-col bg-[#081426] text-slate-100 font-sans selection:bg-[#2563EB]/30 selection:text-white">
      
      {/* Sticky Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenInquiry={handleOpenInquiry}
        onOpenControlCenter={handleOpenControlCenter}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* A. Hero – The Future Starts Here */}
        <HeroSection
          onOpenInquiry={handleOpenInquiry}
          onExploreTechnologies={handleExploreTechnologies}
        />

        {/* 3D Cinematic Commercial & Motion Graphics Showcase */}
        <CinematicAnimationSection />

        {/* B. Who We Are – Startup Identity */}
        <AboutSection
          onOpenInquiry={handleOpenInquiry}
        />

        {/* C. Explore Our Technology – 6 Image Cards */}
        <TechnologiesSection
          onOpenInquiry={handleOpenInquiry}
        />

        {/* D. What We Do – 3 Main Business Pillars */}
        <WhatWeDoSection
          onOpenInquiry={handleOpenInquiry}
        />

        {/* E. Innovation in Action – Project & Prototyping Showcase */}
        <InnovationInActionSection
          onOpenInquiry={handleOpenInquiry}
        />

        {/* F. Learn. Experiment. Innovate. – Hands-on workshops & physical hardware */}
        <LearnExperimentSection
          onOpenInquiry={handleOpenInquiry}
        />

        {/* G. Let's Build Something Innovative – Contact, Collaboration & FAQ */}
        <ContactCollaborationSection
          onOpenWhatsApp={() => setIsWhatsAppOpen(true)}
          onOpenInquiry={handleOpenInquiry}
        />

      </main>

      {/* Secondary Floating Actions (WhatsApp Advisory & Scroll Top) */}
      <div className="fixed bottom-24 right-6 z-30 flex flex-col items-end gap-2.5">
        <button
          onClick={() => setIsWhatsAppOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 group"
          title="WhatsApp Advisory Line"
          aria-label="Open WhatsApp Advisory Line"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">WhatsApp Desk</span>
        </button>

        {showScrollTop && (
          <button
            onClick={handleScrollToTop}
            className="p-2.5 rounded-full bg-[#0c1a30]/90 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 shadow-md transition-colors"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* MARVZ AI Assistant Autonomous Customer Support Chatbot Widget */}
      <MarvzChatbot onOpenControlCenter={handleOpenControlCenter} />

      {/* Corporate Footer */}
      <Footer
        setActiveTab={setActiveTab}
        onOpenInquiry={handleOpenInquiry}
        onOpenWhatsApp={() => setIsWhatsAppOpen(true)}
        onOpenControlCenter={handleOpenControlCenter}
      />

      {/* Reusable Modals */}
      <InquiryModal
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        initialSubject={inquirySubject}
      />

      <WhatsAppModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
      />

    </div>
  );
}
