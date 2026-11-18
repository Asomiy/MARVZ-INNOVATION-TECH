import React from 'react';
import { ArrowRight } from 'lucide-react';
import { SafeImage } from './SafeImage';
import { WebsiteContentConfig } from '../types/admin';
import { TechBackdrop } from './TechBackdrop';
import { Reveal } from './Reveal';

interface AboutSectionProps {
  content?: WebsiteContentConfig;
  onOpenInquiry: (initialSubject?: string) => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ content, onOpenInquiry }) => {
  const startupFoundations = [
    {
      title: 'Problem-First Engineering',
      desc: 'We start with tangible engineering bottlenecks—like sensor drift in drones, high inference latency on edge nodes, or industrial inspection hazards—and engineer physical solutions.',
    },
    {
      title: 'Physical Hardware Validation',
      desc: 'Modern software is most impactful when anchored in physical reality. We fabricate circuit prototypes, flash microcontrollers, tune motors, and command robotic manipulators directly.',
    },
    {
      title: 'Hands-On Skill Cultivation',
      desc: 'We replace outdated theoretical lectures with immersive, hardware-integrated bootcamps where participants build real projects from component level.',
    },
    {
      title: 'Open Collaborative Ecosystem',
      desc: 'As a new-generation startup, we actively collaborate with students, universities, researchers, and enterprises to co-develop prototypes and advance technical skills.',
    },
  ];

  return (
    <section id="about" className="relative overflow-hidden py-20 bg-[#FFFFFF] text-[#202124] border-b border-[#E5E7EB]">
      <TechBackdrop variant="robotics" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <Reveal>
          <div className="max-w-3xl mb-16">
            <div className="text-xs font-mono uppercase tracking-wider text-[#777777] mb-2 font-semibold">
              01. Startup Identity
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202124] tracking-tight leading-tight">
              {content?.aboutHeading || 'Who We Are'}
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[#777777] leading-relaxed">
              {content?.aboutDescription ||
                'MARVZ & INNOVATION TECH is an emerging technology startup dedicated to exploring next-generation technologies, delivering practical engineering education, and building practical technology-driven solutions.'}
            </p>
          </div>
        </Reveal>

        {/* 2-Column Story: Mission & Authentic Startup Collaboration Photo */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          {/* Left: Startup Narrative */}
          <Reveal delayMs={60} className="lg:col-span-7 space-y-6">
            <h3 className="text-2xl font-bold text-[#202124] leading-snug">
              {content?.aboutSubheading || 'Pioneering Emerging Technologies with a Fresh, Hands-On Approach'}
            </h3>

            <p className="text-sm text-[#777777] leading-relaxed">
              We are not an old-fashioned training institute or a slow-moving legacy enterprise. We are an ambitious,
              agile startup built by technologists who believe that the best way to understand the future is to
              engineer it hands-on.
            </p>

            <p className="text-sm text-[#777777] leading-relaxed">
              From calibrating custom multi-rotor flight controllers and tuning robotic kinematics to deploying edge
              machine learning models and stress-testing cyber defense protocols, our work focuses on genuine technical
              competence.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button
                onClick={() => onOpenInquiry('Startup Partnership Discussion')}
                className="group inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white bg-[#30343B] hover:bg-[#202124] rounded-xl hover:-translate-y-0.5 transition-all duration-300 shadow-xs hover:shadow-md"
              >
                <span>Partner with Our Startup</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              <div className="text-xs text-[#777777] font-mono font-medium">
                {content?.heroTagline || 'Think Beyond. Build Tomorrow.'}
              </div>
            </div>
          </Reveal>

          {/* Right: Authentic Real Photo of Workshop & Collaboration */}
          <Reveal delayMs={120} className="lg:col-span-5">
            <div className="group relative rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-md hover:shadow-lg transition-shadow duration-300 bg-[#F3F4F6] aspect-[4/3]">
              <SafeImage
                src={content?.aboutImageUrl || '/assets/tech/robotics-arm.jpg'}
                alt="Precision 6-axis robotics manipulator and embedded engineering station at MARVZ laboratory"
                fallbackTitle="Collaborative Technology Environment"
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              />
              <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-white/95 backdrop-blur-xs border border-[#E5E7EB] text-xs shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5">
                <span className="font-bold text-[#202124]">Authentic Collaboration</span>
                <p className="text-[#777777] text-[11px] mt-0.5">
                  Mentors, builders, and innovators co-developing hardware and software projects.
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* 4 Startup Foundations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {startupFoundations.map((found, idx) => (
            <Reveal key={idx} delayMs={idx * 70} className="h-full">
              <div className="group h-full p-6 rounded-2xl bg-[#F3F4F6] border border-[#E5E7EB] hover:bg-white hover:border-[#30343B]/35 hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col justify-between shadow-xs">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E7EB] text-[#30343B] flex items-center justify-center font-mono text-xs font-bold mb-4 shadow-xs transition-transform duration-300 group-hover:scale-110">
                    0{idx + 1}
                  </div>
                  <h4 className="text-base font-bold text-[#202124] mb-2">
                    {found.title}
                  </h4>
                  <p className="text-xs text-[#777777] leading-relaxed">
                    {found.desc}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
