import React from 'react';
import { ArrowRight, ArrowUpRight, Cpu, Zap, Compass, Terminal, Shield, Bot, Plane, Sparkles } from 'lucide-react';
import { STARTUP_INFO } from '../data/companyData';
import { SafeImage } from './SafeImage';

interface HeroSectionProps {
  onOpenInquiry: (initialSubject?: string) => void;
  onExploreTechnologies: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenInquiry, onExploreTechnologies }) => {
  return (
    <section className="relative overflow-hidden bg-[#0B1020] pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-800/80">
      
      {/* 1. Stunning Full-Width Technology Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=2000&q=80"
          alt="Professional drone flight testing and aeronautical engineering background"
          className="w-full h-full object-cover object-center opacity-30 scale-105"
          referrerPolicy="no-referrer"
        />
        {/* Sophisticated Dark Navy Gradient Scrim to guarantee text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#081426]/95 via-[#0B1020]/90 to-[#081426]/85 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#2563EB_1px,transparent_1px)] [background-size:36px_36px] opacity-15" />
      </div>

      {/* Subtle architectural ambient lighting */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-gradient-to-br from-[#2563EB]/20 via-[#06B6D4]/15 to-transparent blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-10 w-[400px] h-[300px] bg-[#2563EB]/15 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Asymmetrical Editorial Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Startup Editorial Headline & Story */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Startup Tagline Kicker with Official Emblem */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#081426] border border-slate-700/80 p-0.5 shrink-0 shadow-sm">
                <img
                  src="/assets/aistudio/Capture.JPG11_7f7b0bf9.JPG"
                  alt="MARVZ Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#06B6D4]">
                <span>MARVZ & INNOVATION TECH</span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-300">{STARTUP_INFO.tagline}</span>
              </div>
            </div>

            {/* Bold Startup Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08] text-balance">
              Building Tomorrow{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] via-[#06B6D4] to-white">
                Through Technology.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              {STARTUP_INFO.heroDescription}
            </p>

            {/* Primary Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <button
                onClick={onExploreTechnologies}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-[#2563EB] hover:bg-[#1d4ed8] rounded-xl shadow-lg shadow-[#2563EB]/25 hover:shadow-xl transition-all whitespace-nowrap shrink-0"
              >
                <span>Explore Our Technologies</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('cinematic');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl shadow-lg shadow-red-600/30 transition-all whitespace-nowrap shrink-0"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Watch 3D Showcase</span>
              </button>

              <button
                onClick={() => onOpenInquiry('Startup Collaboration & Partnership')}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-slate-200 bg-[#0c1a30] hover:bg-[#122340] border border-slate-700 hover:border-slate-500 rounded-xl transition-all whitespace-nowrap shrink-0"
              >
                <span>Let's Collaborate</span>
                <ArrowUpRight className="w-4 h-4 text-[#06B6D4]" />
              </button>
            </div>

            {/* Startup Personality & Focus Tags (clean text separators, no pill badges) */}
            <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-mono text-slate-400">
              <span className="text-[#06B6D4]">Focus:</span>
              <span>Autonomous UAVs</span>
              <span aria-hidden="true">·</span>
              <span>Industrial Robotics</span>
              <span aria-hidden="true">·</span>
              <span>Applied AI</span>
              <span aria-hidden="true">·</span>
              <span>Cyber Defense</span>
              <span aria-hidden="true">·</span>
              <span>Smart IoT</span>
            </div>

          </div>

          {/* Right Column: Authentic Technology Photography in Asymmetrical Editorial Frame */}
          <div className="lg:col-span-5">
            <div className="relative">
              
              {/* Main Image Frame (Real electronics & robotics workbench from Unsplash) */}
              <div className="rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-[#0c1a30] aspect-[4/3] sm:aspect-[16/11] relative group">
                <SafeImage
                  src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80"
                  alt="Real electronics engineer working with precision testing equipment and oscilloscope"
                  fallbackTitle="Hardware Prototyping Laboratory"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Contrast overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#081426] via-[#081426]/20 to-transparent pointer-events-none" />

                {/* Overlaid Editorial Note */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-[#081426]/90 backdrop-blur-md border border-white/10 text-xs">
                  <div className="flex items-center justify-between text-white font-semibold mb-1">
                    <span>Hands-On Engineering</span>
                    <span className="text-[#06B6D4] font-mono text-[11px]">Real Hardware</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Zero simulation shortcuts. We build, program, and iterate with real microcontrollers, drone avionics, and sensory systems.
                  </p>
                </div>
              </div>

              {/* Secondary Floating Authentic Photo (Drone in workshop) */}
              <div className="hidden sm:block absolute -top-6 -right-6 w-36 h-28 rounded-xl overflow-hidden border-2 border-slate-700 shadow-xl bg-[#081426]">
                <SafeImage
                  src="https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=400&q=80"
                  alt="Real drone quadcopter assembly with carbon fiber propellers"
                  fallbackTitle="UAV Engineering"
                  className="w-full h-full object-cover"
                />
              </div>

            </div>
          </div>

        </div>

        {/* 3 Quick Startup Proposition Strips */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-slate-800/80">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-[#0c1a30]/60 border border-slate-800">
            <div className="p-2.5 rounded-lg bg-[#2563EB]/15 text-[#06B6D4] shrink-0">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Physical Hardware Integration</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Working with real carbon-fiber multi-rotors, robotic manipulators, and embedded test benches.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-[#0c1a30]/60 border border-slate-800">
            <div className="p-2.5 rounded-lg bg-[#2563EB]/15 text-[#06B6D4] shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Rapid Prototyping Mindset</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Accelerating the journey from technical concept to operational hardware deployment.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-[#0c1a30]/60 border border-slate-800">
            <div className="p-2.5 rounded-lg bg-[#2563EB]/15 text-[#06B6D4] shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Interconnected Ecosystem</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Fusing AI, cybersecurity, and IoT into coherent, multi-disciplinary engineering capabilities.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
