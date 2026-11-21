import React from 'react';
import { Phone, Mail, MapPin, MessageCircle, Award } from 'lucide-react';
import { TechBackdrop } from './TechBackdrop';
import { Reveal } from './Reveal';

interface ExecutiveProfile {
  id: string;
  name: string;
  designation: string;
  qualification?: string;
  phoneDisplay: string;
  phoneTel: string;
  whatsAppNumber: string;
  emails: string[];
  officeAddress: string;
  imageUrl: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
}

interface TeamMemberProfile {
  id: string;
  name: string;
  imageUrl: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  imageFit: 'cover-top' | 'contain-bottom';
}

const TOP_MANAGEMENT_PROFILES: ExecutiveProfile[] = [
  {
    id: 'md-ibna-zahan',
    name: 'Md. Ibna Zahan',
    designation: 'Managing Partner',
    qualification: 'M.Sc in CSE (CEH, ITIL, CCNP)',
    phoneDisplay: '+88 01776057078',
    phoneTel: '+8801776057078',
    whatsAppNumber: '8801776057078',
    emails: ['ibzprince@gmail.com', 'marvzinnovationtech@gmail.com'],
    officeAddress:
      '3rd Floor, House #756, Aysha Tower, West Shewrapara, Metro Pillar #304, Dhaka-1216.',
    imageUrl: '/assets/aistudio/image_eb48400e.png',
    imageAlt: 'Md. Ibna Zahan, Managing Partner of MARVZ & INNOVATION TECH',
    imageWidth: 450,
    imageHeight: 570,
  },
  {
    id: 'nafisa-tabassum',
    name: 'Nafisa Tabassum',
    designation: 'Executive Partner & CEO',
    phoneDisplay: '+88 01775551987',
    phoneTel: '+8801775551987',
    whatsAppNumber: '8801775551987',
    emails: ['juenaaldin@gmail.com', 'marvzinnovationtech@gmail.com'],
    officeAddress:
      '3rd Floor, House #756, Aysha Tower, West Shewrapara, Metro Pillar #304, Dhaka-1216.',
    imageUrl: '/assets/aistudio/image_5c8192ff.png',
    imageAlt: 'Nafisa Tabassum, Executive Partner & CEO of MARVZ & INNOVATION TECH',
    imageWidth: 1086,
    imageHeight: 1448,
  },
];

const TEAM_MEMBERS: TeamMemberProfile[] = [
  {
    id: 'akm-azad',
    name: 'A K M Azad',
    imageUrl: '/assets/aistudio/image_32ac750d.png',
    imageAlt: 'A K M Azad — MARVZ & INNOVATION TECH Team Member',
    imageWidth: 1167,
    imageHeight: 1347,
    imageFit: 'contain-bottom',
  },
  {
    id: 'soahib-al-kawsar',
    name: 'Soahib Al Kawsar',
    imageUrl: '/assets/aistudio/image_8fe61ebb.png',
    imageAlt: 'Soahib Al Kawsar — MARVZ & INNOVATION TECH Team Member',
    imageWidth: 449,
    imageHeight: 567,
    imageFit: 'contain-bottom',
  },
  {
    id: 'amiya-sharma',
    name: 'Amiya Sharma',
    imageUrl: '/assets/aistudio/image_c1f4040d.png',
    imageAlt: 'Amiya Sharma — MARVZ & INNOVATION TECH Team Member',
    imageWidth: 1254,
    imageHeight: 1254,
    imageFit: 'contain-bottom',
  },
];

export const LeadershipTeamSection: React.FC = () => {
  return (
    <>
      {/* SECTION 1: TOP MANAGEMENT */}
      <section
        id="top-management"
        className="relative overflow-hidden py-20 bg-[#F3F4F6] text-[#202124] border-b border-[#E5E7EB]"
      >
        <TechBackdrop variant="architecture" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="max-w-3xl mb-14">
              <div className="text-xs font-mono uppercase tracking-wider text-[#DC2626] mb-2 font-semibold">
                Executive Leadership
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202124] tracking-tight leading-tight">
                TOP MANAGEMENT
              </h2>
              <p className="mt-3 text-base sm:text-lg text-[#777777] leading-relaxed">
                Guiding strategic direction, engineering excellence, and institutional partnerships at MARVZ &amp; INNOVATION TECH.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {TOP_MANAGEMENT_PROFILES.map((exec, idx) => (
              <Reveal key={exec.id} delayMs={idx * 80} className="h-full">
                <article className="group h-full rounded-2xl bg-white border border-[#E5E7EB] hover:border-[#DC2626]/40 shadow-xs hover:shadow-md transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden flex flex-col">
                  {/* Subtle MARVZ corporate red top hairline */}
                  <div className="h-[2px] w-full bg-[#DC2626]" aria-hidden="true" />

                  <div className="p-5 sm:p-6 flex-1 grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
                    {/* Original Executive Portrait Frame */}
                    <div className="sm:col-span-5">
                      <div className="aspect-[4/5] w-full max-w-[260px] mx-auto sm:max-w-none rounded-xl bg-white border border-[#E5E7EB] overflow-hidden flex items-end justify-center">
                        <img
                          src={exec.imageUrl}
                          alt={exec.imageAlt}
                          width={exec.imageWidth}
                          height={exec.imageHeight}
                          loading="eager"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain object-bottom transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                        />
                      </div>
                    </div>

                    {/* Executive Details & Direct Contact Actions */}
                    <div className="sm:col-span-7 flex flex-col justify-between h-full space-y-4">
                      <div className="space-y-2">
                        <div className="text-xs font-mono uppercase tracking-wider text-[#DC2626] font-semibold">
                          {exec.designation}
                        </div>
                        <h3 className="text-2xl font-extrabold text-[#202124] tracking-tight leading-snug">
                          {exec.name}
                        </h3>
                        {exec.qualification && (
                          <div className="inline-flex items-start gap-2 text-xs font-medium text-[#30343B] pt-0.5">
                            <Award className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                            <span>{exec.qualification}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-[#E5E7EB] space-y-2.5 text-xs">
                        {/* Clickable Phone & WhatsApp Action */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <a
                            href={`tel:${exec.phoneTel}`}
                            className="inline-flex items-center gap-2 font-semibold text-[#202124] hover:text-[#DC2626] transition-colors tabular-nums"
                          >
                            <Phone className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
                            <span>{exec.phoneDisplay}</span>
                          </a>

                          <a
                            href={`https://wa.me/${exec.whatsAppNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Chat with ${exec.name} on WhatsApp`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#30343B] hover:bg-[#DC2626] text-white text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        </div>

                        {/* Clickable Emails */}
                        <div className="space-y-1.5">
                          {exec.emails.map((email) => (
                            <a
                              key={email}
                              href={`mailto:${email}`}
                              className="flex items-center gap-2 text-[#30343B] hover:text-[#DC2626] transition-colors break-all"
                            >
                              <Mail className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
                              <span className="underline decoration-[#E5E7EB] underline-offset-2 hover:decoration-[#DC2626]">
                                {email}
                              </span>
                            </a>
                          ))}
                        </div>

                        {/* Office Address */}
                        <div className="pt-2 border-t border-[#E5E7EB] flex items-start gap-2 text-[#777777] leading-relaxed">
                          <MapPin className="w-3.5 h-3.5 text-[#DC2626] shrink-0 mt-0.5" />
                          <span>{exec.officeAddress}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2: TEAM MEMBERS */}
      <section
        id="meet-our-team"
        className="relative overflow-hidden py-20 bg-[#FFFFFF] text-[#202124] border-b border-[#E5E7EB]"
      >
        <TechBackdrop variant="robotics" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="max-w-3xl mb-14">
              <div className="text-xs font-mono uppercase tracking-wider text-[#DC2626] mb-2 font-semibold">
                Team Members
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202124] tracking-tight leading-tight">
                MEET OUR TEAM
              </h2>
              <p className="mt-3 text-base sm:text-lg font-medium text-[#777777] leading-relaxed">
                &ldquo;Driven by Passion, United by Innovation.&rdquo;
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {TEAM_MEMBERS.map((member, idx) => (
              <Reveal key={member.id} delayMs={idx * 70} className="h-full">
                <article className="group h-full rounded-2xl bg-white border border-[#E5E7EB] hover:border-[#DC2626]/40 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden flex flex-col">
                  {/* Portrait Frame */}
                  <div className="p-3 pb-0">
                    <div className="aspect-[4/5] w-full rounded-xl bg-white border border-[#E5E7EB] overflow-hidden flex items-end justify-center">
                      <img
                        src={member.imageUrl}
                        alt={member.imageAlt}
                        width={member.imageWidth}
                        height={member.imageHeight}
                        loading="eager"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className={`w-full h-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] ${
                          member.imageFit === 'cover-top'
                            ? 'object-cover object-top'
                            : 'object-contain object-bottom'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Clean Member Name Card Footer */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="h-[2px] w-10 bg-[#DC2626] mb-3 transition-all duration-300 group-hover:w-16" aria-hidden="true" />
                      <h3 className="text-lg sm:text-xl font-bold text-[#202124] tracking-tight">
                        {member.name}
                      </h3>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
