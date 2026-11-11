import React from 'react';
import { Target, Compass, Sparkles, Layers, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import { SafeImage } from './SafeImage';

interface AboutSectionProps {
  onOpenInquiry: (initialSubject?: string) => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onOpenInquiry }) => {
  const startupFoundations = [
    {
      title: 'Problem-First Engineering',
      desc: 'We start with tangible engineering bottlenecks—like sensor drift in drones, high inference latency on edge nodes, or industrial inspection hazards—and engineer physical solutions.'
    },
    {
      title: 'Physical Hardware Validation',
      desc: 'Modern software is most impactful when anchored in physical reality. We fabricate circuit prototypes, flash microcontrollers, tune motors, and command robotic manipulators directly.'
    },
    {
      title: 'Hands-On Skill Cultivation',
      desc: 'We replace outdated theoretical lectures with immersive, hardware-integrated bootcamps where participants build real projects from component level.'
    },
    {
      title: 'Open Collaborative Ecosystem',
      desc: 'As a new-generation startup, we actively collaborate with students, universities, researchers, and enterprises to co-develop prototypes and advance technical skills.'
    }
  ];

  return (
    <section id="about" className="py-20 bg-[#F3F6FA] text-[#081426] relative border-b border-slate-200 overflow-hidden">
      
      {/* Subtle Microcontroller & Circuit Technology Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=2000&q=80"
          alt="Microcontroller and circuit engineering background"
          className="w-full h-full object-cover object-center opacity-[0.06]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#F3F6FA]/95 via-[#F3F6FA]/85 to-[#F3F6FA]/95" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="text-xs font-mono uppercase tracking-wider text-[#2563EB] mb-2 font-semibold">
            01. Startup Identity
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#081426] tracking-tight leading-tight">
            Who We Are
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-700 leading-relaxed">
            MARVZ & INNOVATION TECH is an emerging technology startup dedicated to exploring next-generation technologies, delivering practical engineering education, and building practical technology-driven solutions.
          </p>
        </div>

        {/* 2-Column Story: Mission & Authentic Startup Collaboration Photo */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          
          {/* Left: Startup Narrative */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="text-2xl font-bold text-[#081426] leading-snug">
              Pioneering Emerging Technologies with a Fresh, Hands-On Approach
            </h3>
            
            <p className="text-sm text-slate-700 leading-relaxed">
              We are not an old-fashioned training institute or a slow-moving legacy enterprise. We are an ambitious, agile startup built by technologists who believe that the best way to understand the future is to engineer it hands-on.
            </p>

            <p className="text-sm text-slate-700 leading-relaxed">
              From calibrating custom multi-rotor flight controllers and tuning robotic kinematics to deploying edge machine learning models and stress-testing cyber defense protocols, our work focuses on genuine technical competence.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button
                onClick={() => onOpenInquiry('Startup Partnership Discussion')}
                className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white bg-[#2563EB] hover:bg-[#1d4ed8] rounded-xl transition-all shadow-md"
              >
                <span>Partner with Our Startup</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-xs text-slate-600 font-mono font-medium">
                Think Beyond. Build Tomorrow.
              </div>
            </div>
          </div>

          {/* Right: Authentic Real Photo of Workshop & Collaboration */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-slate-300 shadow-xl bg-white aspect-[4/3]">
              <SafeImage
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80"
                alt="Engineers and students collaborating around technology workstation"
                fallbackTitle="Collaborative Technology Environment"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#081426]/90 via-[#081426]/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 text-xs shadow-md">
                <span className="font-bold text-[#081426]">Authentic Collaboration</span>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Mentors, builders, and innovators co-developing hardware and software projects.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* 4 Startup Foundations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {startupFoundations.map((found, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-[#2563EB] transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
            >
              <div>
                <div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center font-mono text-xs font-bold mb-4">
                  0{idx + 1}
                </div>
                <h4 className="text-base font-bold text-[#081426] group-hover:text-[#2563EB] transition-colors mb-2">
                  {found.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {found.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
