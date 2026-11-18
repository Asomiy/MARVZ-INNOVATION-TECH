import React, { useState } from 'react';
import {
  Building2,
  Landmark,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  ArrowRight,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { TechBackdrop } from './TechBackdrop';
import { Reveal } from './Reveal';
import { CountUpNumber } from './CountUpNumber';
import { ProfileSlideshow } from './ProfileSlideshow';
import { RECOGNITION_PARTNERSHIPS_SLIDESHOW } from '../data/profileSlideshowData';

interface EcosystemClientsSectionProps {
  onOpenInquiry: (initialSubject?: string) => void;
}

type EcosystemCategory =
  | 'All'
  | 'Government & Technology Initiatives'
  | 'Industry Associations'
  | 'Skills Development & Technical Organizations';

interface EcosystemOrganization {
  id: string;
  acronym: string;
  name: string;
  category: Exclude<EcosystemCategory, 'All'>;
  sectorFocus: string;
  summary: string;
  badgeCode: string;
}

const ECOSYSTEM_ORGANIZATIONS: EcosystemOrganization[] = [
  // Government & Technology Initiatives (12)
  {
    id: 'edge',
    acronym: 'EDGE',
    name: 'Enhancing Digital Government and Economy (EDGE)',
    category: 'Government & Technology Initiatives',
    sectorFocus: 'Digital Transformation & R&D Ecosystem',
    summary:
      'National digital economy program advancing frontier technology capacity, research enablement, and university-industry engineering initiatives.',
    badgeCode: 'GOV · 01',
  },
  {
    id: 'ict-division',
    acronym: 'ICT Division',
    name: 'Information and Communication Technology Division',
    category: 'Government & Technology Initiatives',
    sectorFocus: 'National ICT Policy & Innovation',
    summary:
      'Principal ministry division guiding national software, emerging technology, cybersecurity, and digital innovation strategies across Bangladesh.',
    badgeCode: 'GOV · 02',
  },
  {
    id: 'ncsa',
    acronym: 'NCSA',
    name: 'National Cyber Security Agency (NCSA)',
    category: 'Government & Technology Initiatives',
    sectorFocus: 'Cyber Defense & Security Standards',
    summary:
      'National regulatory body overseeing critical information infrastructure protection, cyber resilience, and defensive security frameworks.',
    badgeCode: 'GOV · 03',
  },
  {
    id: 'asset',
    acronym: 'ASSET',
    name: 'Accelerating and Strengthening Skills for Economic Transformation (ASSET)',
    category: 'Government & Technology Initiatives',
    sectorFocus: 'Industry-Aligned Technical Training',
    summary:
      'Flagship workforce modernization initiative focused on industry-driven technical skill development and youth engineering readiness.',
    badgeCode: 'GOV · 04',
  },
  {
    id: 'caab',
    acronym: 'CAAB',
    name: 'Civil Aviation Authority of Bangladesh (CAAB)',
    category: 'Government & Technology Initiatives',
    sectorFocus: 'UAV Airspace & Aviation Regulation',
    summary:
      'National civil aviation regulator governing airspace compliance, unmanned aircraft guidelines, and safe drone operational protocols.',
    badgeCode: 'GOV · 05',
  },
  {
    id: 'bcc',
    acronym: 'BCC',
    name: 'Bangladesh Computer Council (BCC)',
    category: 'Government & Technology Initiatives',
    sectorFocus: 'National Computing Infrastructure',
    summary:
      'Statutory body promoting ICT standards, national data systems, technical capacity building, and public-sector digital engineering.',
    badgeCode: 'GOV · 06',
  },
  {
    id: 'bhtpa',
    acronym: 'BHTPA',
    name: 'Bangladesh Hi-Tech Park Authority (BHTPA)',
    category: 'Government & Technology Initiatives',
    sectorFocus: 'Technology Parks & Hardware Incubation',
    summary:
      'Authority fostering high-tech incubation hubs, electronics R&D zones, and technology enterprise growth nationwide.',
    badgeCode: 'GOV · 07',
  },
  {
    id: 'a2i',
    acronym: 'a2i',
    name: 'Aspire to Innovate (a2i)',
    category: 'Government & Technology Initiatives',
    sectorFocus: 'Civic Innovation & Applied Tech',
    summary:
      'Public-sector innovation program accelerating citizen-centric digital services, AI adoption, and technology prototyping.',
    badgeCode: 'GOV · 08',
  },
  {
    id: 'doict',
    acronym: 'DoICT',
    name: 'Department of ICT (DoICT)',
    category: 'Government & Technology Initiatives',
    sectorFocus: 'Digital Infrastructure & District Outreach',
    summary:
      'Implementing department expanding ICT labs, grassroots technical education, and digital governance networks across districts.',
    badgeCode: 'GOV · 10',
  },
  {
    id: 'startup-bd',
    acronym: 'Startup BD',
    name: 'Startup Bangladesh Limited',
    category: 'Government & Technology Initiatives',
    sectorFocus: 'Venture Ecosystem & Deep-Tech Growth',
    summary:
      'Flagship venture capital entity supporting early-stage technology founders, scalable software platforms, and hardware startups.',
    badgeCode: 'GOV · 11',
  },
  {
    id: 'bdccl',
    acronym: 'BDCCL',
    name: 'Bangladesh Data Center Company Limited (BDCCL)',
    category: 'Government & Technology Initiatives',
    sectorFocus: 'Tier-IV Cloud & Sovereign Hosting',
    summary:
      'National data center operator providing high-availability cloud infrastructure and sovereign hosting capabilities.',
    badgeCode: 'GOV · 12',
  },

  // Industry Associations (4)
  {
    id: 'basis',
    acronym: 'BASIS',
    name: 'Bangladesh Association of Software and Information Services (BASIS)',
    category: 'Industry Associations',
    sectorFocus: 'Software & IT Services Ecosystem',
    summary:
      'Apex trade body representing software engineering, AI product builders, and IT-enabled service companies in Bangladesh.',
    badgeCode: 'ASSOC · 01',
  },
  {
    id: 'bacco',
    acronym: 'BACCO',
    name: 'Bangladesh Association of Contact Center & Outsourcing (BACCO)',
    category: 'Industry Associations',
    sectorFocus: 'Managed Services & BPO Technology',
    summary:
      'National industry association advancing IT outsourcing, enterprise support operations, and digital service exports.',
    badgeCode: 'ASSOC · 02',
  },

  // Skills Development & Technical Organizations (2)
  {
    id: 'nsda',
    acronym: 'NSDA',
    name: 'National Skills Development Authority (NSDA)',
    category: 'Skills Development & Technical Organizations',
    sectorFocus: 'National Competency Frameworks',
    summary:
      'National authority harmonizing competency-based technical training curricula, industry certifications, and assessor standards.',
    badgeCode: 'SKILL · 01',
  },
  {
    id: 'bteb',
    acronym: 'BTEB',
    name: 'Bangladesh Technical Education Board (BTEB)',
    category: 'Skills Development & Technical Organizations',
    sectorFocus: 'Technical & Vocational Accreditation',
    summary:
      'Statutory education board overseeing technical and vocational engineering curricula, examinations, and skills accreditation.',
    badgeCode: 'SKILL · 02',
  },
];

const INSTITUTIONAL_ENGAGEMENT_ORGS = [
  {
    id: 'inst-dhaka',
    acronym: 'DC',
    name: 'Dhaka Cantonment',
    location: 'Dhaka, Bangladesh',
    status: 'Institutional Engagement',
    summary:
      'Collaborative technology-driven initiatives, practical engineering demonstrations, and structured professional development sessions.',
  },
  {
    id: 'inst-bogura',
    acronym: 'BC',
    name: 'Bogura Cantonment',
    location: 'Bogura, Bangladesh',
    status: 'Institutional Engagement',
    summary:
      'Collaborative work centered on emerging technology exploration, applied robotics and UAV initiatives, and capability building.',
  },
];

const FILTER_CATEGORIES: EcosystemCategory[] = [
  'All',
  'Government & Technology Initiatives',
  'Industry Associations',
  'Skills Development & Technical Organizations',
];

const CATEGORY_ICON_MAP: Record<Exclude<EcosystemCategory, 'All'>, React.ComponentType<{ className?: string }>> = {
  'Government & Technology Initiatives': Landmark,
  'Industry Associations': Briefcase,
  'Skills Development & Technical Organizations': GraduationCap,
};

export const EcosystemClientsSection: React.FC<EcosystemClientsSectionProps> = ({ onOpenInquiry }) => {
  const [selectedCategory, setSelectedCategory] = useState<EcosystemCategory>('All');

  const filteredOrgs =
    selectedCategory === 'All'
      ? ECOSYSTEM_ORGANIZATIONS
      : ECOSYSTEM_ORGANIZATIONS.filter((org) => org.category === selectedCategory);

  return (
    <section
      id="ecosystem"
      className="relative overflow-hidden py-20 bg-[#F3F4F6] text-[#202124] border-b border-[#E5E7EB]"
    >
      <TechBackdrop variant="architecture" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Section Header */}
        <Reveal>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <div className="text-xs font-mono uppercase tracking-wider text-[#777777] mb-2 font-semibold">
                Clients, Engagements &amp; National Tech Landscape
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202124] tracking-tight leading-tight text-balance">
                Our Clients, Institutional Engagements &amp; Industry Ecosystem
              </h2>
              <p className="mt-4 text-base sm:text-lg text-[#777777] leading-relaxed">
                Clear distinction between verified client engagements, active or prospective institutional engagements, and
                the national technology, regulatory, association, and skills organizations shaping our engineering standards.
              </p>
            </div>

            <button
              onClick={() => onOpenInquiry('Institutional & Ecosystem Collaboration')}
              className="group inline-flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white bg-[#30343B] hover:bg-[#202124] rounded-xl hover:-translate-y-0.5 transition-all duration-300 shadow-xs hover:shadow-md whitespace-nowrap shrink-0 self-start lg:self-auto"
            >
              <span>Explore Collaboration</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </Reveal>

        {/* Tier Separation Row: Confirmed Clients vs Institutional Engagements */}
        <Reveal delayMs={70}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Tier 1: Confirmed Clients (Strict Authorization Policy) */}
          <div className="lg:col-span-5 p-7 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-mono uppercase tracking-wider text-[#777777] font-semibold">
                  01 · Verified Portfolio
                </span>
                <ShieldCheck className="w-4 h-4 text-[#30343B] shrink-0" />
              </div>
              <h3 className="text-xl font-bold text-[#202124] tracking-tight">Confirmed Clients</h3>
              <p className="text-sm text-[#777777] leading-relaxed">
                MARVZ &amp; INNOVATION TECH maintains strict confidentiality and trademark integrity. Confirmed
                enterprise and public-sector client logos or names are published here exclusively with formal written
                authorization and disclosure clearance.
              </p>
            </div>

            <div className="pt-4 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-[#777777]">
                <CheckCircle2 className="w-4 h-4 text-[#30343B] shrink-0" />
                <span>NDA &amp; Authorization Verified Only</span>
              </div>
              <button
                onClick={() => onOpenInquiry('Enterprise Client Project & Proposal Request')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#30343B] hover:text-[#202124] transition-colors whitespace-nowrap shrink-0"
              >
                <span>Request Client Brief</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Tier 2: Institutional Engagements (Dhaka Cantonment & Bogura Cantonment) */}
          <div className="lg:col-span-7 p-7 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-mono uppercase tracking-wider text-[#777777] font-semibold">
                  02 · Institutional Engagements (Active &amp; Prospective)
                </span>
                <Landmark className="w-4 h-4 text-[#30343B] shrink-0" />
              </div>
              <h3 className="text-xl font-bold text-[#202124] tracking-tight">Institutional Engagements</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {INSTITUTIONAL_ENGAGEMENT_ORGS.map((inst) => (
                  <div
                    key={inst.id}
                    className="group p-4 rounded-xl bg-[#FAFAFB] hover:bg-white border border-[#E5E7EB] hover:border-[#30343B]/40 transition-all duration-200 flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center shrink-0 font-mono text-xs font-bold text-[#30343B]">
                        {inst.acronym}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-[#202124] leading-snug">{inst.name}</h4>
                        <div className="mt-0.5 text-[11px] font-mono text-[#777777]">
                          {inst.status} · {inst.location}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-[#777777] leading-relaxed">{inst.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between gap-4 text-xs text-[#777777]">
              <span>Technology initiatives, demonstrations &amp; professional development</span>
              <a
                href="#institutional-collaborations"
                className="font-semibold text-[#30343B] hover:text-[#202124] underline whitespace-nowrap shrink-0"
              >
                View Details
              </a>
            </div>
          </div>
          </div>
        </Reveal>

        {/* Slideshow 5: Recognition & Partnerships (PDF Page 8, 3 Original Photos) */}
        <Reveal delayMs={85}>
          <div
            id={RECOGNITION_PARTNERSHIPS_SLIDESHOW.sectionAnchor}
            className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              <div className="lg:col-span-5 space-y-4">
                <div className="text-xs font-mono uppercase tracking-wider text-[#DC2626] font-semibold">
                  {RECOGNITION_PARTNERSHIPS_SLIDESHOW.eyebrow}
                </div>
                <h3 className="text-2xl font-extrabold text-[#202124] tracking-tight leading-tight">
                  {RECOGNITION_PARTNERSHIPS_SLIDESHOW.title}
                </h3>
                <p className="text-sm text-[#777777] leading-relaxed">
                  {RECOGNITION_PARTNERSHIPS_SLIDESHOW.subtitle}
                </p>

                <ul className="space-y-2 text-xs text-[#202124] pt-1">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                    <span>Institutional exchange with defense &amp; technology leadership</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                    <span>International technical delegations reviewing MARVZ UAV &amp; robotics hardware</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                    <span>Collaborative technology showcases alongside academic and institutional partners</span>
                  </li>
                </ul>

                <div className="pt-2">
                  <button
                    onClick={() => onOpenInquiry('Institutional & International Partnership Inquiry')}
                    className="group inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#30343B] hover:bg-[#202124] rounded-xl transition-all duration-300 shadow-xs"
                  >
                    <span>Discuss Institutional Partnership</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7">
                <ProfileSlideshow
                  slides={RECOGNITION_PARTNERSHIPS_SLIDESHOW.slides}
                  aspectClassName="aspect-[16/10]"
                  compact={true}
                  ariaLabel="Recognition and Partnerships Slideshow"
                />
              </div>
            </div>
          </div>
        </Reveal>

        {/* Tier 3: Industry & Government Ecosystem Directory */}
        <Reveal delayMs={100}>
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-[#777777] font-semibold">
                  03 · Industry &amp; Government Ecosystem Reference (<CountUpNumber value={ECOSYSTEM_ORGANIZATIONS.length} /> Organizations)
                </div>
              <h3 className="mt-1 text-2xl font-bold text-[#202124] tracking-tight">
                Government Initiatives, Associations &amp; Skills Authorities
              </h3>
            </div>

            {/* Interactive Category Filter Tabs */}
            <div
              className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white border border-[#E5E7EB] rounded-xl shadow-xs"
              role="tablist"
              aria-label="Filter ecosystem organizations by category"
            >
              {FILTER_CATEGORIES.map((category) => {
                const isActive = selectedCategory === category;
                const count =
                  category === 'All'
                    ? ECOSYSTEM_ORGANIZATIONS.length
                    : ECOSYSTEM_ORGANIZATIONS.filter((o) => o.category === category).length;
                const shortLabel =
                  category === 'All'
                    ? 'All'
                    : category === 'Government & Technology Initiatives'
                      ? 'Govt & Tech'
                      : category === 'Industry Associations'
                        ? 'Associations'
                        : 'Skills & Technical';
                return (
                  <button
                    key={category}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 tabular-nums ${
                      isActive
                        ? 'bg-[#30343B] text-white shadow-xs'
                        : 'text-[#777777] hover:text-[#202124] hover:bg-[#F3F4F6]'
                    }`}
                  >
                    {shortLabel} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Transparent Non-Affiliation / Verification Notice */}
          <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] flex items-start gap-3 text-xs text-[#777777] leading-relaxed">
            <Info className="w-4 h-4 text-[#30343B] shrink-0 mt-0.5" />
            <p>
              <strong className="text-[#202124]">Ecosystem Transparency Notice:</strong> The organizations listed below
              represent key national technology initiatives, industry associations, and technical
              skills boards within Bangladesh&apos;s ICT ecosystem. Listing reflects sector alignment, regulatory
              compliance awareness, and standards orientation—not an implied client contract, sponsorship, or official
              endorsement without separate written authorization.
            </p>
          </div>

          {/* Clean Responsive Organization Cards Grid */}
          <div key={selectedCategory} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-marvz-panel-in">
            {filteredOrgs.map((org) => {
              const CategoryIcon = CATEGORY_ICON_MAP[org.category] || Building2;
              return (
                <article
                  key={org.id}
                  className="group p-6 rounded-2xl bg-white border border-[#E5E7EB] hover:border-[#30343B]/45 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-xs hover:shadow-md hover:-translate-y-1 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-start justify-between gap-3">
                      {/* Minimal Corporate Monogram Mark (Avoids Unauthorized Third-Party Trademarks) */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-[#F3F4F6] group-hover:bg-[#30343B] border border-[#E5E7EB] group-hover:border-[#30343B] flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105">
                          <span className="font-mono text-[11px] font-bold tracking-tight text-[#202124] group-hover:text-white text-center px-1 leading-tight transition-colors duration-300">
                            {org.acronym}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="text-[11px] font-mono text-[#777777] flex items-center gap-1.5">
                            <CategoryIcon className="w-3 h-3 text-[#30343B] shrink-0" />
                            <span className="truncate">{org.badgeCode}</span>
                          </div>
                          <h4 className="text-sm font-bold text-[#202124] leading-snug mt-0.5">{org.name}</h4>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-[#777777] leading-relaxed">{org.summary}</p>
                  </div>

                  <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between gap-2 text-[11px] text-[#777777]">
                    <span className="truncate font-medium text-[#30343B]">{org.sectorFocus}</span>
                    <span className="font-mono shrink-0">Ecosystem</span>
                  </div>
                </article>
              );
            })}
          </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
