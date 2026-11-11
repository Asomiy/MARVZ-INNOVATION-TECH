import React, { useState } from 'react';
import { ArrowUpRight, X, Cpu, Layers, Activity } from 'lucide-react';
import { PROJECT_SHOWCASE, ProjectShowcase } from '../data/companyData';
import { SafeImage } from './SafeImage';

interface InnovationInActionSectionProps {
  onOpenInquiry: (initialSubject?: string) => void;
}

export const InnovationInActionSection: React.FC<InnovationInActionSectionProps> = ({ onOpenInquiry }) => {
  const [activeProject, setActiveProject] = useState<ProjectShowcase | null>(null);

  return (
    <section id="projects" className="py-20 bg-[#0B1020] relative border-b border-slate-800/80 overflow-hidden">
      
      {/* Authentic Server Infrastructure & Network Defense Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=2000&q=80"
          alt="Server infrastructure and cyber defense background"
          className="w-full h-full object-cover object-center opacity-15"
          referrerPolicy="no-referrer"
        />
        {/* Dark Navy Scrim for optimal contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1020]/95 via-[#0c1a30]/90 to-[#0B1020]/95" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-3xl">
            <div className="text-xs font-mono uppercase tracking-wider text-[#06B6D4] mb-2">
              04. Project & Prototyping Showcase
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Innovation in Action
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
              Explore concrete engineering implementations and prototype architectures across drone avionics, precision mechatronics, low-power IoT telemetry, and network security.
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => onOpenInquiry('Custom Prototype or Project Collaboration')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#2563EB] hover:bg-[#1d4ed8] rounded-xl transition-all shadow-md"
            >
              <span>Commission a Prototype</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Portfolio Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {PROJECT_SHOWCASE.map((proj) => (
            <div
              key={proj.id}
              className="group rounded-2xl bg-[#0c1a30] border border-slate-800 hover:border-[#2563EB]/50 transition-all duration-300 flex flex-col overflow-hidden shadow-lg"
            >
              {/* Authentic Photo */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                <SafeImage
                  src={proj.imageUrl}
                  alt={proj.altText}
                  fallbackTitle={proj.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c1a30] via-[#0c1a30]/30 to-transparent" />
                
                {/* Domain Pill */}
                <div className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-[#081426]/90 backdrop-blur-md border border-white/10 text-xs font-mono text-[#06B6D4]">
                  {proj.domain}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-[#06B6D4] transition-colors leading-snug">
                    {proj.title}
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {proj.overview}
                  </p>

                  <div className="mt-3 p-3 rounded-lg bg-[#081426] border border-slate-800/80 text-xs text-slate-400">
                    <strong className="text-slate-200">Engineering Focus: </strong>
                    {proj.focus}
                  </div>

                  {/* Stack */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {proj.stack.map((s, idx) => (
                      <span key={idx} className="text-[11px] text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded border border-slate-700/60">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => setActiveProject(proj)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#06B6D4] hover:text-white transition-colors"
                  >
                    <span>Inspect Architecture</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onOpenInquiry(`Prototype Discussion: ${proj.title}`)}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Collaborate →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Project Detail Modal */}
      {activeProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0c1a30] border border-slate-700 shadow-2xl p-6 sm:p-8">
            
            <button
              onClick={() => setActiveProject(null)}
              className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close project modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-xs font-mono text-[#06B6D4] uppercase tracking-wider mb-2">
              Technology Reference · {activeProject.domain}
            </div>

            <h3 className="text-2xl font-bold text-white mb-3 leading-snug">
              {activeProject.title}
            </h3>

            {/* Photo preview */}
            <div className="aspect-[16/9] rounded-xl overflow-hidden mb-6 border border-slate-800">
              <SafeImage
                src={activeProject.imageUrl}
                alt={activeProject.altText}
                fallbackTitle={activeProject.title}
                className="w-full h-full object-cover"
              />
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              {activeProject.overview}
            </p>

            <div className="p-4 rounded-xl bg-[#081426] border border-slate-800 mb-6 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-[#06B6D4]">
                Technical Focus & Goals
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeProject.focus}
              </p>
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Hardware, Firmware & Tooling Stack
              </h4>
              <div className="flex flex-wrap gap-2">
                {activeProject.stack.map((item, idx) => (
                  <span key={idx} className="text-xs text-slate-200 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={() => setActiveProject(null)}
                className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const title = activeProject.title;
                  setActiveProject(null);
                  onOpenInquiry(`Consultation regarding ${title}`);
                }}
                className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] rounded-xl shadow-md"
              >
                Inquire About Similar Solution
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};
