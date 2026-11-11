import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, X, Cpu, Shield, Plane, Bot, Radio, Code2 } from 'lucide-react';
import { CORE_TECHNOLOGIES, TechnologyCard } from '../data/companyData';
import { SafeImage } from './SafeImage';

interface TechnologiesSectionProps {
  onOpenInquiry: (initialSubject?: string) => void;
}

export const TechnologiesSection: React.FC<TechnologiesSectionProps> = ({ onOpenInquiry }) => {
  const [selectedTech, setSelectedTech] = useState<TechnologyCard | null>(null);

  const getDomainIcon = (id: string) => {
    switch (id) {
      case 'ai-ml': return <Cpu className="w-5 h-5 text-[#06B6D4]" />;
      case 'cybersecurity': return <Shield className="w-5 h-5 text-[#06B6D4]" />;
      case 'drone-tech': return <Plane className="w-5 h-5 text-[#06B6D4]" />;
      case 'robotics': return <Bot className="w-5 h-5 text-[#06B6D4]" />;
      case 'iot': return <Radio className="w-5 h-5 text-[#06B6D4]" />;
      case 'software': return <Code2 className="w-5 h-5 text-[#06B6D4]" />;
      default: return <Cpu className="w-5 h-5 text-[#06B6D4]" />;
    }
  };

  return (
    <section id="technologies" className="py-20 bg-[#0B1020] relative border-b border-slate-800/80 overflow-hidden">
      
      {/* Authentic AI & Neural Research Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=2000&q=80"
          alt="AI research and computer vision workstation background"
          className="w-full h-full object-cover object-center opacity-20"
          referrerPolicy="no-referrer"
        />
        {/* Dark Navy Scrim for optimal contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#081426]/95 via-[#0B1020]/90 to-[#081426]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(#06B6D4_1px,transparent_1px)] [background-size:40px_40px] opacity-10" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-3xl">
            <div className="text-xs font-mono uppercase tracking-wider text-[#06B6D4] mb-2">
              02. Core Technology Divisions
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Explore Our Technology
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
              We operate as an interconnected technology ecosystem—where aerial drone avionics, industrial robotics, embedded IoT, artificial intelligence, and cybersecurity converge into unified engineering solutions.
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => onOpenInquiry('Technology Ecosystem Consultation')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#2563EB] hover:bg-[#1d4ed8] rounded-xl transition-all shadow-md"
            >
              <span>Discuss Technical Specs</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 6 Technology Image Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {CORE_TECHNOLOGIES.map((tech) => (
            <div
              key={tech.id}
              className="group rounded-2xl bg-[#0c1a30] border border-slate-800 hover:border-[#2563EB]/50 transition-all duration-300 flex flex-col overflow-hidden shadow-lg hover:shadow-2xl"
            >
              {/* Real Photograph from Unsplash */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                <SafeImage
                  src={tech.imageUrl}
                  alt={tech.altText}
                  fallbackTitle={tech.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c1a30] via-[#0c1a30]/30 to-transparent" />
                
                {/* Domain Icon Floating Badge */}
                <div className="absolute top-4 left-4 p-2.5 rounded-xl bg-[#081426]/90 backdrop-blur-md border border-white/10 shadow-md">
                  {getDomainIcon(tech.id)}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                <div>
                  <div className="text-[11px] font-mono text-[#06B6D4] uppercase tracking-wider">
                    {tech.tagline}
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-[#06B6D4] transition-colors leading-snug mt-1">
                    {tech.title}
                  </h3>

                  <p className="mt-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {tech.description}
                  </p>

                  {/* Key Topics List */}
                  <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-1.5">
                    {tech.keyTopics.slice(0, 3).map((topic, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#06B6D4] shrink-0" />
                        <span className="truncate">{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Action Link */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedTech(tech)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#06B6D4] hover:text-white transition-colors"
                  >
                    <span>Explore More</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onOpenInquiry(`Inquiry regarding ${tech.title}`)}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Inquire →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Technology Detail Modal */}
      {selectedTech && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0c1a30] border border-slate-700 shadow-2xl p-6 sm:p-8">
            
            <button
              onClick={() => setSelectedTech(null)}
              className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close technology details"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-[#2563EB]/15 border border-[#2563EB]/30">
                {getDomainIcon(selectedTech.id)}
              </div>
              <div>
                <span className="text-xs font-mono text-[#06B6D4] uppercase tracking-wider">
                  Technology Domain
                </span>
                <h3 className="text-2xl font-bold text-white">
                  {selectedTech.title}
                </h3>
              </div>
            </div>

            {/* Authentic Photography Preview */}
            <div className="relative rounded-xl overflow-hidden aspect-[16/9] mb-6 border border-slate-800">
              <SafeImage
                src={selectedTech.imageUrl}
                alt={selectedTech.altText}
                fallbackTitle={selectedTech.title}
                className="w-full h-full object-cover"
              />
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              {selectedTech.description}
            </p>

            {/* Key Topics */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Core Competencies & Modules
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedTech.keyTopics.map((topic, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-[#081426] border border-slate-800 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-[#06B6D4] shrink-0" />
                    <span>{topic}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Real Applications */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Real-World Applications & Use Cases
              </h4>
              <div className="space-y-2">
                {selectedTech.applications.map((app, i) => (
                  <div key={i} className="p-3 rounded-lg bg-[#081426] border border-slate-800 text-xs text-slate-300">
                    {app}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={() => setSelectedTech(null)}
                className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const title = selectedTech.title;
                  setSelectedTech(null);
                  onOpenInquiry(`Collaboration or Training in ${title}`);
                }}
                className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] rounded-xl shadow-md"
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
