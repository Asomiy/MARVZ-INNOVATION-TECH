import React from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { BUSINESS_PILLARS } from '../data/companyData';
import { TechBackdrop } from './TechBackdrop';
import { Reveal } from './Reveal';

interface WhatWeDoSectionProps {
  onOpenInquiry: (initialSubject?: string) => void;
}

export const WhatWeDoSection: React.FC<WhatWeDoSectionProps> = ({ onOpenInquiry }) => {
  return (
    <section id="what-we-do" className="relative overflow-hidden py-20 bg-[#FFFFFF] text-[#202124] border-b border-[#E5E7EB]">
      <TechBackdrop variant="blockchain" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <Reveal>
          <div className="max-w-3xl mb-16">
            <div className="text-xs font-mono uppercase tracking-wider text-[#777777] mb-2 font-semibold">
              03. Core Value Propositions
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202124] tracking-tight leading-tight">
              What We Do
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[#777777] leading-relaxed">
              As a multi-disciplinary technology startup, our capabilities focus on three interconnected operational
              pillars that transform curious builders into industry-ready pioneers.
            </p>
          </div>
        </Reveal>

        {/* 3 Main Business Pillar Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {BUSINESS_PILLARS.map((pillar, idx) => (
            <Reveal key={pillar.number} delayMs={idx * 80} className="h-full">
              <div className="group h-full p-8 rounded-2xl bg-[#F3F4F6] border border-[#E5E7EB] hover:bg-white hover:border-[#30343B]/40 hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col justify-between shadow-xs hover:shadow-md">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-2xl font-extrabold font-mono text-[#30343B] transition-transform duration-300 group-hover:scale-105">
                      {pillar.number}
                    </span>
                    <span className="text-[11px] font-mono text-[#777777] uppercase tracking-wider">
                      Startup Pillar
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#202124] leading-snug mb-3">
                    {pillar.title}
                  </h3>

                  <p className="text-sm text-[#777777] leading-relaxed mb-6">
                    {pillar.description}
                  </p>

                  <div className="space-y-2.5 pt-4 border-t border-[#E5E7EB]">
                    {pillar.bullets.map((h, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-[#202124]">
                        <Check className="w-4 h-4 text-[#30343B] shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 mt-6 border-t border-[#E5E7EB]">
                  <button
                    onClick={() => onOpenInquiry(`Pillar Discussion: ${pillar.title}`)}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[#30343B] hover:text-[#202124] transition-colors"
                  >
                    <span>Collaborate on this Pillar</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

