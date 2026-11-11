import React, { useState } from 'react';
import { ArrowRight, Check, Wrench, GraduationCap, Microscope, Rocket } from 'lucide-react';
import { BUSINESS_PILLARS, BusinessPillar } from '../data/companyData';

interface WhatWeDoSectionProps {
  onOpenInquiry: (initialSubject?: string) => void;
}

export const WhatWeDoSection: React.FC<WhatWeDoSectionProps> = ({ onOpenInquiry }) => {
  const [activePillarIndex, setActivePillarIndex] = useState<number>(0);

  const getPillarIcon = (num: string) => {
    switch (num) {
      case '01': return <GraduationCap className="w-6 h-6 text-[#06B6D4]" />;
      case '02': return <Wrench className="w-6 h-6 text-[#06B6D4]" />;
      case '03': return <Microscope className="w-6 h-6 text-[#06B6D4]" />;
      default: return <Rocket className="w-6 h-6 text-[#06B6D4]" />;
    }
  };

  return (
    <section id="what-we-do" className="py-20 bg-[#081426] relative border-b border-slate-800/80 overflow-hidden">
      
      {/* Authentic Industrial Robotics & Mechatronics Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=2000&q=80"
          alt="Industrial collaborative robotics arm calibration background"
          className="w-full h-full object-cover object-center opacity-15"
          referrerPolicy="no-referrer"
        />
        {/* Dark Navy Scrim for optimal contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#081426]/95 via-[#081426]/85 to-[#081426]/95" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="text-xs font-mono uppercase tracking-wider text-[#06B6D4] mb-2">
            03. Core Business Pillars
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            What We Do
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            Our startup model is structured around three interconnected operational pillars: empowering engineers through rigorous technical education, engineering custom physical solutions, and pioneering emerging tech research.
          </p>
        </div>

        {/* 3 Main Pillars Display */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {BUSINESS_PILLARS.map((pillar, idx) => (
            <div
              key={pillar.number}
              className="p-8 rounded-2xl bg-[#0c1a30] border border-slate-800 hover:border-[#2563EB]/50 transition-all flex flex-col justify-between group shadow-xl"
            >
              <div className="space-y-6">
                
                {/* Number & Icon Lockup */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <span className="text-3xl font-mono font-extrabold text-[#06B6D4]">
                    {pillar.number}
                  </span>
                  <div className="p-3 rounded-xl bg-[#081426] border border-slate-700/80">
                    {getPillarIcon(pillar.number)}
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-[#06B6D4] transition-colors leading-snug">
                    {pillar.title}
                  </h3>
                  <div className="text-xs font-medium text-slate-400 mt-1">
                    {pillar.subtitle}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {pillar.description}
                </p>

                {/* Bullets List */}
                <div className="space-y-2 pt-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Key Highlights
                  </div>
                  {pillar.bullets.map((b, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <Check className="w-3.5 h-3.5 text-[#06B6D4] shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{b}</span>
                    </div>
                  ))}
                </div>

                {/* Capabilities tags */}
                <div className="pt-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Core Capabilities
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {pillar.capabilities.map((cap, i) => (
                      <span key={i} className="text-[11px] text-slate-300 bg-[#081426] px-2.5 py-1 rounded-lg border border-slate-800">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Action */}
              <div className="pt-6 border-t border-slate-800/80 mt-6">
                <button
                  onClick={() => onOpenInquiry(`Inquiry: Pillar ${pillar.number} - ${pillar.title}`)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white bg-[#2563EB] hover:bg-[#1d4ed8] rounded-xl transition-colors shadow-md"
                >
                  <span>Inquire for {pillar.title}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
