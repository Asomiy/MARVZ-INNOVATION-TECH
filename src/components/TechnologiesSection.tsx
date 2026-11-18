import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, X, Cpu, Shield, Plane, Bot, Radio, Code2 } from 'lucide-react';
import { CORE_TECHNOLOGIES, TechnologyCard } from '../data/companyData';
import { SafeImage } from './SafeImage';
import { WebsiteServiceItem } from '../types/admin';
import { TechBackdrop } from './TechBackdrop';
import { ServiceTechIllustration } from './ServiceTechIllustration';
import { Reveal } from './Reveal';
import { CountUpNumber } from './CountUpNumber';

interface TechnologiesSectionProps {
  services?: WebsiteServiceItem[];
  onOpenInquiry: (initialSubject?: string) => void;
}

export const TechnologiesSection: React.FC<TechnologiesSectionProps> = ({ services, onOpenInquiry }) => {
  const [selectedTech, setSelectedTech] = useState<TechnologyCard | null>(null);
  const displayedServices: TechnologyCard[] = services?.length ? services : CORE_TECHNOLOGIES;

  const getDomainIcon = (id: string) => {
    switch (id) {
      case 'ai-ml':
        return <Cpu className="w-4 h-4 text-[#30343B]" />;
      case 'cybersecurity':
        return <Shield className="w-4 h-4 text-[#30343B]" />;
      case 'drone-tech':
        return <Plane className="w-4 h-4 text-[#30343B]" />;
      case 'robotics':
        return <Bot className="w-4 h-4 text-[#30343B]" />;
      case 'iot':
        return <Radio className="w-4 h-4 text-[#30343B]" />;
      case 'software':
        return <Code2 className="w-4 h-4 text-[#30343B]" />;
      default:
        return <Cpu className="w-4 h-4 text-[#30343B]" />;
    }
  };

  return (
    <section id="technologies" className="relative overflow-hidden py-20 bg-[#FAFAFB] text-[#202124] border-b border-[#E5E7EB]">
      <TechBackdrop variant="cyber-network" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-3xl">
              <div className="text-xs font-mono uppercase tracking-wider text-[#777777] mb-2 font-semibold">
                02. <CountUpNumber value={displayedServices.length} /> Core Technology Divisions
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202124] tracking-tight leading-tight">
                Explore Our Technology
              </h2>
              <p className="mt-4 text-base sm:text-lg text-[#777777] leading-relaxed">
                We operate as an interconnected technology ecosystem—where aerial drone avionics, industrial robotics,
                embedded IoT, artificial intelligence, and cybersecurity converge into unified engineering solutions.
              </p>
            </div>

            <div className="shrink-0">
              <button
                onClick={() => onOpenInquiry('Technology Ecosystem Consultation')}
                className="group inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#30343B] hover:bg-[#202124] rounded-xl hover:-translate-y-0.5 transition-all duration-300 shadow-xs hover:shadow-md"
              >
                <span>Discuss Technical Specs</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </Reveal>

        {/* Technology Cards with Unique Architectural Illustrations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedServices.map((tech, index) => {
            const hasCustomUpload = Boolean(tech.imageUrl && tech.imageUrl.startsWith('/uploads/'));
            return (
              <Reveal key={tech.id} delayMs={index * 70} className="h-full">
                <div className="group h-full rounded-2xl bg-white border border-[#E5E7EB] hover:border-[#30343B]/45 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1">
                  {/* Unique Technology Illustration Header */}
                  <div className="relative aspect-[2/1] overflow-hidden bg-[#FAFAFB] border-b border-[#E5E7EB]">
                    {hasCustomUpload ? (
                      <SafeImage
                        src={tech.imageUrl}
                        alt={tech.altText}
                        fallbackTitle={tech.title}
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="w-full h-full transition-transform duration-500 ease-out group-hover:scale-[1.02]">
                        <ServiceTechIllustration id={tech.id} title={tech.title} />
                      </div>
                    )}
                    {/* Clean White Domain Icon Badge */}
                    <div className="absolute top-3.5 left-3.5 p-2 rounded-xl bg-white/95 border border-[#E5E7EB] shadow-xs transition-transform duration-300 group-hover:scale-110">
                      {getDomainIcon(tech.id)}
                    </div>
                    <div className="absolute top-3.5 right-3.5 px-2.5 py-1 rounded-md bg-white/95 border border-[#E5E7EB] text-[10px] font-mono font-semibold text-[#777777] tracking-wider tabular-nums">
                      0{index + 1}
                    </div>
                  </div>

              {/* Card Content */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                <div>
                  <div className="text-[11px] font-mono text-[#777777] uppercase tracking-wider">
                    {tech.tagline}
                  </div>
                  <h3 className="text-xl font-bold text-[#202124] leading-snug mt-1">
                    {tech.title}
                  </h3>

                  <p className="mt-2.5 text-xs sm:text-sm text-[#777777] leading-relaxed">
                    {tech.description}
                  </p>

                  {/* Key Topics List */}
                  <div className="mt-4 pt-4 border-t border-[#E5E7EB] space-y-1.5">
                    {tech.keyTopics.slice(0, 3).map((topic, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#202124]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#30343B] shrink-0" />
                        <span className="truncate">{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Action Link */}
                <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between">
                  <button
                    onClick={() => setSelectedTech(tech)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#30343B] hover:text-[#202124] transition-colors"
                  >
                    <span>Explore More</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <button
                    onClick={() => onOpenInquiry(`Inquiry regarding ${tech.title}`)}
                    className="text-xs text-[#777777] hover:text-[#202124] transition-colors"
                  >
                    Inquire →
                  </button>
                </div>
              </div>
            </div>
              </Reveal>
            );
          })}
        </div>
      </div>

      {/* Technology Detail Modal */}
      {selectedTech && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-[#E5E7EB] shadow-xl p-6 sm:p-8 text-[#202124] animate-marvz-panel-in">
            <button
              onClick={() => setSelectedTech(null)}
              className="absolute top-5 right-5 p-2 rounded-lg text-[#777777] hover:text-[#202124] hover:bg-[#F3F4F6] transition-colors"
              aria-label="Close technology details"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB]">
                {getDomainIcon(selectedTech.id)}
              </div>
              <div>
                <span className="text-xs font-mono text-[#777777] uppercase tracking-wider">
                  Technology Domain
                </span>
                <h3 className="text-2xl font-bold text-[#202124]">
                  {selectedTech.title}
                </h3>
              </div>
            </div>

            <div className="relative rounded-xl overflow-hidden aspect-[16/9] mb-6 border border-[#E5E7EB] bg-[#F3F4F6]">
              <SafeImage
                src={selectedTech.imageUrl}
                alt={selectedTech.altText}
                fallbackTitle={selectedTech.title}
                className="w-full h-full object-cover"
              />
            </div>

            <p className="text-sm text-[#777777] leading-relaxed mb-6">
              {selectedTech.description}
            </p>

            {/* Key Topics */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#202124] mb-3">
                Core Competencies & Modules
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedTech.keyTopics.map((topic, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2.5 rounded-lg bg-[#F3F4F6] border border-[#E5E7EB] text-xs text-[#202124]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#30343B] shrink-0" />
                    <span>{topic}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Real Applications */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#202124] mb-3">
                Real-World Applications & Use Cases
              </h4>
              <div className="space-y-2">
                {selectedTech.applications.map((app, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-[#F3F4F6] border border-[#E5E7EB] text-xs text-[#202124]"
                  >
                    {app}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={() => setSelectedTech(null)}
                className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-[#202124] bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E5E7EB] rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const title = selectedTech.title;
                  setSelectedTech(null);
                  onOpenInquiry(`Collaboration or Training in ${title}`);
                }}
                className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold text-white bg-[#30343B] hover:bg-[#202124] rounded-xl shadow-xs transition-colors"
              >
                Inquire for This Domain
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
