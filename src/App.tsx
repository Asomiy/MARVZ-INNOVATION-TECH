/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { CinematicAnimationSection } from './components/CinematicAnimationSection';
import { AboutSection } from './components/AboutSection';
import { LeadershipTeamSection } from './components/LeadershipTeamSection';
import { TechnologiesSection } from './components/TechnologiesSection';
import { OfficesCollaborationSection } from './components/OfficesCollaborationSection';
import { EcosystemClientsSection } from './components/EcosystemClientsSection';
import { WhatWeDoSection } from './components/WhatWeDoSection';
import { BrandedLoader } from './components/BrandedLoader';
import { InnovationInActionSection } from './components/InnovationInActionSection';
import { LearnExperimentSection } from './components/LearnExperimentSection';
import { ContactCollaborationSection } from './components/ContactCollaborationSection';
import { InquiryModal } from './components/InquiryModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { InternshipTrainingModal } from './components/InternshipTrainingModal';
import { MarvzChatbot } from './components/chatbot/MarvzChatbot';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLoginView } from './components/admin/AdminLoginView';
import {
  clearAdminAuthSession,
  getAdminToken,
  setInMemoryCsrfToken,
} from './utils/adminApi';
import {
  AdminUser,
  LocationConfig,
  TrainingProgram,
  WebsiteContentConfig,
} from './types/admin';
import { CORE_TECHNOLOGIES, STARTUP_INFO } from './data/companyData';
import { MessageSquare, ArrowUp, AlertTriangle } from 'lucide-react';

const DEFAULT_LOCATION: LocationConfig = {
  officeName: 'MARVZ & INNOVATION TECH — Headquarters',
  officeAddress:
    '3rd Floor, House No. 756, Aysha Tower, West Shewrapara, Near Metro Pillar 304, Dhaka-1216, Bangladesh.',
  landmarkNote: 'Near Dhaka Metro Rail Pillar 304, West Shewrapara',
  cityCountry: 'Dhaka-1216, Bangladesh',
  contactPhone: '+8801775551987',
  contactWhatsApp: '+8801775551987',
  contactEmail: 'marvzinnovationtech@gmail.com',
  workingHours: 'Sat – Thu: 9:30 AM – 6:30 PM (BST)',
  mapSearchQuery: 'Aysha Tower, House 756, West Shewrapara, Dhaka 1216, Bangladesh',
  googleMapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Aysha+Tower+House+756+West+Shewrapara+Dhaka+1216+Bangladesh',
  directionsUrl:
    'https://www.google.com/maps/dir/?api=1&destination=Aysha+Tower+House+756+West+Shewrapara+Dhaka+1216+Bangladesh',
  updatedAt: new Date().toISOString(),
};

const DEFAULT_CONTENT: WebsiteContentConfig = {
  heroHeadline: 'Building Tomorrow',
  heroHighlight: 'Through Technology.',
  heroTagline: STARTUP_INFO.tagline,
  heroDescription: STARTUP_INFO.heroDescription,
  heroImageUrl: '/assets/tech/hero-ai-lab.jpg',
  heroSecondaryImageUrl: '/assets/tech/uav-prototype.jpg',
  announcementEnabled: false,
  announcementText: '',
  aboutHeading: 'Who We Are',
  aboutSubheading: 'Engineering-Led Research, Prototyping & Technical Training',
  aboutDescription:
    'MARVZ & INNOVATION TECH is an emerging technology startup dedicated to exploring next-generation technologies, delivering practical engineering education, and building practical technology-driven solutions.',
  aboutImageUrl: '/assets/tech/robotics-arm.jpg',
  services: CORE_TECHNOLOGIES,
  uploadedAssets: [],
  updatedAt: new Date().toISOString(),
};

const isAdminPath = (pathname: string) =>
  pathname === '/admin' || pathname.startsWith('/admin/');

export default function App() {
  const [viewMode, setViewMode] = useState<'website' | 'admin'>(() =>
    isAdminPath(window.location.pathname) ? 'admin' : 'website'
  );
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [checkingSession, setCheckingSession] = useState<boolean>(() =>
    isAdminPath(window.location.pathname)
  );

  const [siteContent, setSiteContent] = useState<WebsiteContentConfig>(DEFAULT_CONTENT);
  const [siteLocation, setSiteLocation] = useState<LocationConfig>(DEFAULT_LOCATION);
  const [trainingPrograms, setTrainingPrograms] = useState<TrainingProgram[]>([]);

  const [activeTab, setActiveTab] = useState<string>('home');
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [inquirySubject, setInquirySubject] = useState('General Collaboration & Inquiry');
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState(false);

  const [portalModal, setPortalModal] = useState<{
    open: boolean;
    mode: 'internship' | 'training';
    programId?: string;
  }>({
    open: false,
    mode: 'training',
  });

  const refreshSiteData = useCallback(async () => {
    try {
      const res = await fetch('/api/public/site-data');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.content) setSiteContent(data.content);
        if (data.location) setSiteLocation(data.location);
        if (Array.isArray(data.trainingPrograms)) setTrainingPrograms(data.trainingPrograms);
      }
    } catch {
      // Static fallback data already initialized cleanly
    }
  }, []);

  const verifyAdminSession = useCallback(async () => {
    setCheckingSession(true);
    try {
      const token = getAdminToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/admin/auth/me', {
        credentials: 'include',
        headers,
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data?.user) {
          setAdminUser(data.user);
          if (data.csrfToken) setInMemoryCsrfToken(data.csrfToken);
          return;
        }
      }
      clearAdminAuthSession();
      setAdminUser(null);
    } catch {
      clearAdminAuthSession();
      setAdminUser(null);
    } finally {
      setCheckingSession(false);
    }
  }, []);

  useEffect(() => {
    refreshSiteData();
    // Dynamically align canonical & og:url tags for SEO
    const currentUrl = window.location.origin + window.location.pathname;
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', currentUrl);
    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) {
      ogUrl = document.createElement('meta');
      ogUrl.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrl);
    }
    ogUrl.setAttribute('content', currentUrl);
  }, [refreshSiteData]);

  // Verify initial /admin route, active server-side session, unauthorized events & GMP quota event
  useEffect(() => {
    if (isAdminPath(window.location.pathname)) {
      setViewMode('admin');
      verifyAdminSession();
    }

    const handlePopState = () => {
      if (isAdminPath(window.location.pathname)) {
        setViewMode('admin');
        verifyAdminSession();
      } else {
        setViewMode('website');
      }
    };

    const handleUnauthorized = () => {
      clearAdminAuthSession();
      setAdminUser(null);
    };

    const handleQuotaExceeded = () => setGmpQuotaExceeded(true);

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('marvz-admin-unauthorized', handleUnauthorized);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('marvz-admin-unauthorized', handleUnauthorized);
      window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    };
  }, [verifyAdminSession]);

  // Redirect unauthenticated visitors on /admin/* subpaths strictly to /admin login
  useEffect(() => {
    if (
      viewMode === 'admin' &&
      !checkingSession &&
      !adminUser &&
      window.location.pathname !== '/admin'
    ) {
      window.history.replaceState(null, '', '/admin');
    }
  }, [viewMode, checkingSession, adminUser]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBackToWebsite = () => {
    setViewMode('website');
    window.history.pushState(null, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    refreshSiteData();
  };

  const handleLogout = () => {
    clearAdminAuthSession();
    setAdminUser(null);
  };

  const handleOpenInquiry = (subject: string = 'General Collaboration & Inquiry') => {
    setInquirySubject(subject);
    setIsInquiryOpen(true);
  };

  const handleOpenInternshipModal = () => {
    setPortalModal({ open: true, mode: 'internship' });
  };

  const handleOpenTrainingRegister = (programId?: string) => {
    setPortalModal({ open: true, mode: 'training', programId });
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

  if (viewMode === 'admin') {
    if (checkingSession) {
      return (
        <div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center p-4">
          <div className="w-8 h-8 border-2 border-[#30343B] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-mono text-[#6B7280]">Verifying Admin Session...</p>
        </div>
      );
    }
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
        onUserUpdated={(updated) => setAdminUser(updated)}
        onLogout={handleLogout}
        onBackToWebsite={handleBackToWebsite}
        onSiteDataChanged={refreshSiteData}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#202124] font-sans selection:bg-[#30343B]/15 selection:text-[#202124]">
      <BrandedLoader />
      {gmpQuotaExceeded && (
        <div
          role="alert"
          className="sticky top-0 z-50 w-full bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs flex items-center justify-center gap-2 text-center"
        >
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            Interactive Google Maps quota notice triggered — showing verified address & direct Google Maps / Directions links.
          </span>
        </div>
      )}

      {/* Sticky Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenInquiry={handleOpenInquiry}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* A. Hero */}
        <HeroSection
          content={siteContent}
          onOpenInquiry={handleOpenInquiry}
          onExploreTechnologies={handleExploreTechnologies}
          onOpenInternshipModal={handleOpenInternshipModal}
        />

        {/* Static Technology Architecture Showcase */}
        <CinematicAnimationSection />

        {/* B. Who We Are – Startup Identity */}
        <AboutSection content={siteContent} onOpenInquiry={handleOpenInquiry} />

        {/* B2. Top Management & Team Members */}
        <LeadershipTeamSection />

        {/* C. Explore Our Technology – Service Cards */}
        <TechnologiesSection services={siteContent.services} onOpenInquiry={handleOpenInquiry} />

        {/* C2. Office Locations, R&D Facility & Institutional Collaborations */}
        <OfficesCollaborationSection onOpenInquiry={handleOpenInquiry} />

        {/* C3. Confirmed Clients Policy, Institutional Engagements & Industry Ecosystem */}
        <EcosystemClientsSection onOpenInquiry={handleOpenInquiry} />

        {/* D. What We Do – 3 Main Business Pillars */}
        <WhatWeDoSection onOpenInquiry={handleOpenInquiry} />

        {/* E. Innovation in Action – Project & Prototyping Showcase */}
        <InnovationInActionSection onOpenInquiry={handleOpenInquiry} />

        {/* F. Learn. Experiment. Innovate. – Hands-on workshops & physical hardware */}
        <LearnExperimentSection
          programs={trainingPrograms}
          onOpenInquiry={handleOpenInquiry}
          onOpenTrainingRegister={handleOpenTrainingRegister}
          onOpenInternshipModal={handleOpenInternshipModal}
        />

        {/* G. Let's Build Something Innovative – Office Map, Contact, Collaboration & FAQ */}
        <ContactCollaborationSection
          location={siteLocation}
          onOpenWhatsApp={() => setIsWhatsAppOpen(true)}
          onOpenInquiry={handleOpenInquiry}
          onOpenInternshipModal={handleOpenInternshipModal}
        />
      </main>

      {/* Secondary Floating Actions (WhatsApp Advisory & Scroll Top) */}
      <div className="fixed bottom-24 right-6 z-30 flex flex-col items-end gap-2.5">
        <button
          onClick={() => setIsWhatsAppOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white hover:bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] text-[11px] font-semibold uppercase tracking-wider shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#30343B]"
          title="WhatsApp Advisory Line"
          aria-label="Open WhatsApp Advisory Line"
        >
          <MessageSquare className="w-3.5 h-3.5 text-[#30343B]" />
          <span className="hidden sm:inline">WhatsApp Desk</span>
        </button>

        {showScrollTop && (
          <button
            onClick={handleScrollToTop}
            className="p-2.5 rounded-full bg-white border border-[#E5E7EB] text-[#202124] hover:bg-[#F3F4F6] shadow-md transition-colors"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* MARVZ AI Assistant Autonomous Customer Support Chatbot Widget */}
      <MarvzChatbot />

      {/* Corporate Footer */}
      <Footer
        location={siteLocation}
        setActiveTab={setActiveTab}
        onOpenInquiry={handleOpenInquiry}
        onOpenWhatsApp={() => setIsWhatsAppOpen(true)}
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

      <InternshipTrainingModal
        isOpen={portalModal.open}
        initialMode={portalModal.mode}
        initialProgramId={portalModal.programId}
        programs={trainingPrograms}
        onClose={() => {
          setPortalModal((prev) => ({ ...prev, open: false }));
          refreshSiteData();
        }}
      />
    </div>
  );
}
