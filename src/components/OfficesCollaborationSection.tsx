import React from 'react';
import {
  Building2,
  FlaskConical,
  ArrowRight,
  Cpu,
  Plane,
  Bot,
  Shield,
  Code2,
  MapPin,
  Landmark,
  ExternalLink,
  Navigation,
  Sparkles,
} from 'lucide-react';
import { SafeImage } from './SafeImage';
import { TechBackdrop } from './TechBackdrop';
import { Reveal } from './Reveal';
import { CountUpNumber } from './CountUpNumber';

interface OfficesCollaborationSectionProps {
  onOpenInquiry: (initialSubject?: string) => void;
}

const BANANI_OFFICE = {
  title: 'Operational Office – Banani DOHS',
  kicker: '01 · Operational Office · Banani DOHS',
  address: '92/A, Banani DOHS, Dhaka-1213, Bangladesh.',
  description:
    'Dhaka operational office managing corporate coordination, client relations, administrative operations, and executive communications.',
  image: '/assets/tech/corporate-office.jpg',
  imageAlt: 'MARVZ & INNOVATION TECH Operational Office in Banani DOHS, Dhaka',
  fallbackTitle: 'Banani DOHS Operational Office',
  googleMapsUrl:
    'https://www.google.com/maps/search/?api=1&query=92%2FA%2C+Banani+DOHS%2C+Dhaka-1213%2C+Bangladesh',
  directionsUrl:
    'https://www.google.com/maps/dir/?api=1&destination=92%2FA%2C+Banani+DOHS%2C+Dhaka-1213%2C+Bangladesh',
  functions: [
    'Corporate Coordination',
    'Client & Partner Relations',
    'Administrative Operations',
    'Executive Communication',
  ],
  inquirySubject: 'Operational Office – Banani DOHS Inquiry',
};

const SHEWRAPARA_OFFICE = {
  title: 'Operational Office – West Shewrapara',
  kicker: '02 · Operational Office · West Shewrapara',
  address:
    '3rd Floor, House No. 756, Aysha Tower, West Shewrapara, Near Metro Pillar 304, Dhaka-1216, Bangladesh.',
  description:
    'Operational hub coordinating engineering project delivery, business development, hands-on technical workshops, and client consultations.',
  image: '/assets/tech/ai-workstation.jpg',
  imageAlt: 'MARVZ & INNOVATION TECH Operational Office at Aysha Tower, West Shewrapara, Dhaka',
  fallbackTitle: 'West Shewrapara Operational Office',
  googleMapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Aysha+Tower%2C+House+No.+756%2C+West+Shewrapara%2C+Dhaka-1216%2C+Bangladesh',
  directionsUrl:
    'https://www.google.com/maps/dir/?api=1&destination=Aysha+Tower%2C+House+No.+756%2C+West+Shewrapara%2C+Dhaka-1216%2C+Bangladesh',
  functions: [
    'Operational Headquarters',
    'Business Development & Coordination',
    'Client & Training Consultations',
    'Engineering Project Delivery',
  ],
  inquirySubject: 'Operational Office – West Shewrapara Inquiry',
};

const RD_HIGHLIGHTS = [
  {
    title: 'Artificial Intelligence (AI)',
    detail: 'Applied computer vision, machine learning models, predictive analytics, and edge inference.',
    icon: Cpu,
  },
  {
    title: 'Robotics',
    detail: 'Autonomous robotic platforms, robotic manipulators, control systems, and mechatronics.',
    icon: Bot,
  },
  {
    title: 'Drone Technology',
    detail: 'Custom UAV airframes, ArduPilot/PX4 avionics integration, telemetry, and flight testing.',
    icon: Plane,
  },
  {
    title: 'Software Development',
    detail: 'Full-stack enterprise platforms, real-time telemetry dashboards, cloud APIs, and mobile apps.',
    icon: Code2,
  },
  {
    title: 'Cybersecurity',
    detail: 'Vulnerability assessment, penetration testing, secure architecture hardening, and threat defense.',
    icon: Shield,
  },
  {
    title: 'Technology Research',
    detail: 'Rapid hardware-software prototyping, embedded IoT instrumentation, and applied innovation.',
    icon: Sparkles,
  },
];

const INSTITUTIONAL_ENGAGEMENTS = [
  {
    id: 'dhaka-cantonment',
    name: 'Dhaka Cantonment',
    region: 'Dhaka, Bangladesh',
    engagementType: 'Institutional Engagement',
    summary:
      'Collaborative technology-driven initiatives, practical engineering demonstrations, and structured professional development sessions.',
    focusAreas: [
      { label: 'AI & Software Systems', icon: Cpu },
      { label: 'Cybersecurity Awareness', icon: Shield },
      { label: 'Technical Skill Building', icon: Code2 },
    ],
  },
  {
    id: 'bogura-cantonment',
    name: 'Bogura Cantonment',
    region: 'Bogura, Bangladesh',
    engagementType: 'Institutional Engagement',
    summary:
      'Collaborative work centered on emerging technology exploration, applied robotics and UAV initiatives, and professional capability development.',
    focusAreas: [
      { label: 'Drone & UAV Initiatives', icon: Plane },
      { label: 'Robotics & Automation', icon: Bot },
      { label: 'Applied Innovation', icon: FlaskConical },
    ],
  },
];

export const OfficesCollaborationSection: React.FC<OfficesCollaborationSectionProps> = ({
  onOpenInquiry,
}) => {
  const corporateOffices = [BANANI_OFFICE, SHEWRAPARA_OFFICE];

  return (
    <>
      {/* 1. Corporate Office Locations (Both Offices in Separate Cards) */}
      <section
        id="offices-collaboration"
        className="relative overflow-hidden py-20 bg-[#FFFFFF] text-[#202124] border-b border-[#E5E7EB]"
      >
        <TechBackdrop variant="robotics" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
              <div className="max-w-3xl">
                <div className="text-xs font-mono uppercase tracking-wider text-[#777777] mb-2 font-semibold">
                  Operational Infrastructure · <CountUpNumber value={corporateOffices.length} /> Dhaka Offices
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202124] tracking-tight leading-tight text-balance">
                  MARVZ &amp; INNOVATION TECH – Office Locations
                </h2>
                <p className="mt-4 text-base sm:text-lg text-[#777777] leading-relaxed">
                  MARVZ &amp; INNOVATION TECH operates across two dedicated operational offices in Dhaka—Banani DOHS and
                  West Shewrapara—supporting client coordination, business operations, and project delivery.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <a
                  href="#rd-office"
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#202124] bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E5E7EB] rounded-xl hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap shrink-0"
                >
                  <FlaskConical className="w-4 h-4 text-[#30343B]" />
                  <span>R&amp;D Office</span>
                </a>
                <a
                  href="#find-our-office"
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#30343B] hover:bg-[#202124] rounded-xl hover:-translate-y-0.5 transition-all duration-300 shadow-xs hover:shadow-md whitespace-nowrap shrink-0"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Interactive Office Map</span>
                </a>
              </div>
            </div>
          </Reveal>

          {/* Two Separate Corporate Office Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {corporateOffices.map((office, idx) => (
              <Reveal key={office.title} delayMs={idx * 90} className="h-full">
                <article className="group h-full rounded-2xl bg-[#FAFAFB] hover:bg-white border border-[#E5E7EB] hover:border-[#30343B]/45 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1">
                  <div className="relative aspect-[16/9] overflow-hidden bg-[#F3F4F6] border-b border-[#E5E7EB]">
                    <SafeImage
                      src={office.image}
                      alt={office.imageAlt}
                      fallbackTitle={office.fallbackTitle}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                  </div>

                  <div className="p-7 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono text-[#777777] font-semibold">
                        <Building2 className="w-3.5 h-3.5 text-[#30343B]" />
                        <span>{office.kicker}</span>
                      </div>
                      <h3 className="mt-1.5 text-xl sm:text-2xl font-bold text-[#202124] tracking-tight">
                        {office.title}
                      </h3>
                      <p className="mt-2 text-xs sm:text-sm text-[#777777] leading-relaxed">
                        {office.description}
                      </p>
                    </div>

                    {/* Official Address Box */}
                    <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] space-y-2.5">
                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-[#30343B] shrink-0 mt-0.5" />
                        <p className="text-sm font-semibold text-[#202124] leading-relaxed">
                          {office.address}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 pt-1 pl-6">
                        <a
                          href={office.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#30343B] hover:text-[#202124] underline"
                        >
                          <span>Open in Google Maps</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <span className="text-[#E5E7EB]" aria-hidden="true">
                          |
                        </span>
                        <a
                          href={office.directionsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#30343B] hover:text-[#202124] underline"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Get Directions</span>
                        </a>
                      </div>
                    </div>

                    {/* Key Functions */}
                    <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {office.functions.map((item) => (
                        <div
                          key={item}
                          className="px-3 py-2.5 rounded-xl bg-white border border-[#E5E7EB] text-xs font-medium text-[#202124]"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-5 border-t border-[#E5E7EB] flex items-center justify-between gap-4">
                    <span className="text-xs font-mono text-[#777777]">
                      {idx === 0 ? 'Dhaka-1213 · Banani DOHS' : 'Dhaka-1216 · West Shewrapara'}
                    </span>
                    <button
                      onClick={() => onOpenInquiry(office.inquirySubject)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#30343B] hover:text-[#202124] transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>Coordinate with Office</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Separate Research & Development (R&D) Office Section */}
      <section
        id="rd-office"
        className="relative overflow-hidden py-20 bg-[#F3F4F6] text-[#202124] border-b border-[#E5E7EB]"
      >
        <TechBackdrop variant="cyber-network" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div className="max-w-3xl">
                <div className="text-xs font-mono uppercase tracking-wider text-[#777777] mb-2 font-semibold">
                  Engineering &amp; Innovation Lab · <CountUpNumber value={RD_HIGHLIGHTS.length} /> Core Disciplines
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202124] tracking-tight leading-tight text-balance">
                  Research &amp; Development (R&amp;D) Office
                </h2>
                <p className="mt-4 text-base sm:text-lg text-[#777777] leading-relaxed">
                  A dedicated facility for AI, Robotics, Drone Technology, Software Development, Cybersecurity, and
                  Technology Research.
                </p>
              </div>

              <button
                onClick={() => onOpenInquiry('R&D Office & Technical Collaboration')}
                className="group inline-flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white bg-[#30343B] hover:bg-[#202124] rounded-xl hover:-translate-y-0.5 transition-all duration-300 shadow-xs hover:shadow-md whitespace-nowrap shrink-0 self-start md:self-auto"
              >
                <span>Discuss R&amp;D Project</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          </Reveal>

          <Reveal delayMs={80}>
            <div className="rounded-3xl bg-white border border-[#E5E7EB] shadow-xs hover:shadow-md transition-shadow duration-300 overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
              {/* Left R&D Lab Image with Subtle Rotating Technical Overlay */}
              <div className="group lg:col-span-5 relative min-h-[260px] lg:min-h-full bg-[#FAFAFB] border-b lg:border-b-0 lg:border-r border-[#E5E7EB] overflow-hidden">
                <SafeImage
                  src="/assets/tech/rd-lab.jpg"
                  alt="MARVZ & INNOVATION TECH Research and Development Laboratory with AI workstations, robotics arm, and UAV prototypes"
                  fallbackTitle="Research & Development Office"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
                {/* Subtle Rotating Precision Reticle Accent */}
                <svg
                  viewBox="0 0 120 120"
                  fill="none"
                  aria-hidden="true"
                  className="absolute top-4 right-4 w-16 h-16 pointer-events-none opacity-85"
                >
                  <circle cx="60" cy="60" r="52" fill="#FFFFFF" fillOpacity="0.82" />
                  <circle
                    cx="60"
                    cy="60"
                    r="44"
                    stroke="#30343B"
                    strokeOpacity="0.28"
                    strokeWidth="1.25"
                    strokeDasharray="6 5"
                    className="animate-marvz-spin-slow"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="28"
                    stroke="#DC2626"
                    strokeOpacity="0.32"
                    strokeWidth="1.2"
                    strokeDasharray="8 6"
                    className="animate-marvz-spin-reverse"
                  />
                  <circle cx="60" cy="60" r="3.5" fill="#DC2626" fillOpacity="0.5" className="animate-marvz-node-breathe" />
                </svg>
              </div>

              {/* Right 6 R&D Pillars */}
              <div className="relative lg:col-span-7 p-7 sm:p-10 flex flex-col justify-between space-y-6">
                {/* Subtle Animated Circuit Trace Along Top-Right Edge */}
                <svg
                  viewBox="0 0 320 60"
                  fill="none"
                  aria-hidden="true"
                  className="hidden sm:block absolute top-4 right-6 w-64 h-12 pointer-events-none opacity-75"
                >
                  <path d="M10 30 H120 L145 12 H295" stroke="#CBD5E1" strokeWidth="1.2" />
                  <path d="M10 30 H120 L145 12 H295" stroke="#30343B" strokeOpacity="0.22" strokeWidth="1.2" className="animate-marvz-dash-flow" />
                  <circle cx="295" cy="12" r="3" fill="#DC2626" fillOpacity="0.45" className="animate-marvz-node-breathe" />
                </svg>

                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-[#777777] font-semibold">
                    <FlaskConical className="w-4 h-4 text-[#30343B]" />
                    <span>Specialized Research Divisions</span>
                  </div>
                  <h3 className="mt-2 text-2xl font-bold text-[#202124] tracking-tight">
                    Applied Technology, Prototyping &amp; Systems Engineering
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {RD_HIGHLIGHTS.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <Reveal key={item.title} delayMs={idx * 55}>
                        <div className="group h-full p-4 rounded-2xl bg-[#FAFAFB] hover:bg-white border border-[#E5E7EB] hover:border-[#30343B]/40 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center shrink-0 text-[#30343B] transition-transform duration-300 group-hover:scale-110">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-[#202124] leading-snug">{item.title}</h4>
                              <p className="mt-1 text-xs text-[#777777] leading-relaxed">{item.detail}</p>
                            </div>
                          </div>
                        </div>
                      </Reveal>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-4 text-xs text-[#777777]">
                  <span className="font-mono">Prototype Testing · Avionics · Full-Stack · Infosec</span>
                  <a
                    href="#find-our-office"
                    className="inline-flex items-center gap-1.5 font-semibold text-[#30343B] hover:text-[#202124] underline"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>View Dhaka Office Coordinates</span>
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 3. Institutional Collaborations & Engagements */}
      <section
        id="institutional-collaborations"
        className="relative overflow-hidden py-20 bg-[#FFFFFF] text-[#202124] border-b border-[#E5E7EB]"
      >
        <TechBackdrop variant="cloud-relay" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <Reveal>
            <div className="max-w-3xl mb-14">
              <div className="text-xs font-mono uppercase tracking-wider text-[#777777] mb-2 font-semibold">
                Technology Initiatives &amp; Engagement
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202124] tracking-tight leading-tight text-balance">
                Our Institutional Collaborations
              </h2>
              <p className="mt-4 text-base sm:text-lg text-[#777777] leading-relaxed">
                MARVZ &amp; INNOVATION TECH is engaged in collaborative work and institutional engagements with Dhaka
                Cantonment and Bogura Cantonment, focusing on technology-driven initiatives, innovation, and professional
                development.
              </p>
            </div>
          </Reveal>

          {/* Institutional Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {INSTITUTIONAL_ENGAGEMENTS.map((inst, idx) => (
              <Reveal key={inst.id} delayMs={idx * 90} className="h-full">
                <div className="group h-full p-7 sm:p-8 rounded-2xl bg-[#FAFAFB] hover:bg-white border border-[#E5E7EB] hover:border-[#30343B]/45 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-xs hover:shadow-md hover:-translate-y-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white border border-[#E5E7EB] flex items-center justify-center shrink-0 text-[#30343B] transition-transform duration-300 group-hover:scale-105">
                          <Landmark className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[11px] font-mono uppercase tracking-wider text-[#777777] font-semibold">
                            {inst.engagementType}
                          </span>
                          <h3 className="text-2xl font-bold text-[#202124] tracking-tight mt-0.5">
                            {inst.name}
                          </h3>
                        </div>
                      </div>

                      <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-[#777777] shrink-0">
                        <MapPin className="w-3.5 h-3.5 text-[#30343B]" />
                        <span>{inst.region}</span>
                      </div>
                    </div>

                    <p className="text-sm text-[#777777] leading-relaxed">{inst.summary}</p>

                    {/* Initiative Focus Blocks */}
                    <div className="pt-4 border-t border-[#E5E7EB] grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {inst.focusAreas.map((area) => {
                        const AreaIcon = area.icon;
                        return (
                          <div
                            key={area.label}
                            className="p-3 rounded-xl bg-white border border-[#E5E7EB] flex items-center gap-2.5 text-xs font-medium text-[#202124]"
                          >
                            <AreaIcon className="w-4 h-4 text-[#30343B] shrink-0" />
                            <span className="leading-snug">{area.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                    <span className="font-mono text-[#777777]">Innovation &amp; Professional Development</span>
                    <button
                      onClick={() => onOpenInquiry(`Institutional Engagement Inquiry: ${inst.name}`)}
                      className="inline-flex items-center gap-1.5 font-semibold text-[#30343B] hover:text-[#202124] transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>Inquire</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

