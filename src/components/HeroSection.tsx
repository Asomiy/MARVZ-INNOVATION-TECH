import React from 'react';
import { ArrowRight, ArrowUpRight, Zap, Compass, Plane, Layers } from 'lucide-react';
import { STARTUP_INFO } from '../data/companyData';
import { SafeImage } from './SafeImage';
import { WebsiteContentConfig } from '../types/admin';
import { TechBackdrop } from './TechBackdrop';

interface HeroSectionProps {
  content?: WebsiteContentConfig;
  onOpenInquiry: (initialSubject?: string) => void;
  onExploreTechnologies: () => void;
  onOpenInternshipModal?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  content,
  onOpenInquiry,
  onExploreTechnologies,
}) => {
  const headline = content?.heroHeadline || 'Building Tomorrow';
  const highlight = content?.heroHighlight || 'Through Technology.';
  const tagline = content?.heroTagline || STARTUP_INFO.tagline;
  const description = content?.heroDescription || STARTUP_INFO.heroDescription;
  const heroMainImg = content?.heroImageUrl || '/assets/tech/hero-ai-lab.jpg';
  const heroSecondaryImg = content?.heroSecondaryImageUrl || '/assets/tech/uav-prototype.jpg';

  return (
    <section id="home" className="relative overflow-hidden bg-[#FFFFFF] pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-[#E5E7EB]">
      <TechBackdrop variant="hero" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Asymmetrical Editorial Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left Column: Startup Editorial Headline & Story */}
          <div className="lg:col-span-7 space-y-6">
            {/* Startup Tagline Kicker with Official Emblem */}
            <div
              className="flex items-center gap-3 animate-marvz-hero-in"
              style={{ animationDelay: '0ms' }}
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#181B20] border border-[#E5E7EB] p-0.5 shrink-0 shadow-xs transition-transform duration-300 hover:scale-105">
                <img
                  src="/assets/aistudio/Capture.JPG11_7f7b0bf9.JPG"
                  alt="MARVZ Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#777777]">
                <span className="font-semibold text-[#202124]">MARVZ &amp; INNOVATION TECH</span>
                <span aria-hidden="true">·</span>
                <span>{tagline}</span>
              </div>
            </div>

            {/* Bold Startup Headline + Subtle Animated Crimson-Charcoal Accent Line */}
            <div
              className="space-y-3 animate-marvz-hero-in"
              style={{ animationDelay: '80ms' }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#202124] leading-[1.08] text-balance">
                {headline}{' '}
                <span className="text-[#777777]">
                  {highlight}
                </span>
              </h1>
              <div className="w-24 h-[2px] rounded-full animate-marvz-crimson-line opacity-80" aria-hidden="true" />
            </div>

            {/* Supporting Text */}
            <p
              className="text-base sm:text-lg text-[#777777] max-w-2xl leading-relaxed animate-marvz-hero-in"
              style={{ animationDelay: '150ms' }}
            >
              {description}
            </p>

            {/* Primary Action Buttons */}
            <div
              className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 animate-marvz-hero-in"
              style={{ animationDelay: '210ms' }}
            >
              <button
                onClick={onExploreTechnologies}
                className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-[#30343B] hover:bg-[#202124] rounded-xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] whitespace-nowrap shrink-0"
              >
                <span>Explore Our Technologies</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('cinematic');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-[#202124] bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E5E7EB] hover:border-[#30343B]/30 rounded-xl hover:-translate-y-0.5 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] whitespace-nowrap shrink-0"
              >
                <Layers className="w-4 h-4 text-[#30343B] transition-transform duration-300 group-hover:scale-110" />
                <span>System Architecture</span>
              </button>

              <button
                onClick={() => onOpenInquiry('Startup Collaboration & Partnership')}
                className="group inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-[#202124] bg-white hover:bg-[#F3F4F6] border border-[#E5E7EB] hover:border-[#30343B]/30 rounded-xl hover:-translate-y-0.5 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] whitespace-nowrap shrink-0"
              >
                <span>Let&apos;s Collaborate</span>
                <ArrowUpRight className="w-4 h-4 text-[#777777] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#202124]" />
              </button>
            </div>

            {/* Startup Personality & Focus Tags */}
            <div
              className="pt-6 border-t border-[#E5E7EB] flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-mono text-[#777777] animate-marvz-hero-in"
              style={{ animationDelay: '270ms' }}
            >
              <span className="font-semibold text-[#202124]">Focus:</span>
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

          {/* Right Column: Authentic Technology Photography in Clean White Frame */}
          <div
            className="lg:col-span-5 animate-marvz-hero-in"
            style={{ animationDelay: '160ms' }}
          >
            <div className="relative">
              {/* Subtle Ambient Crimson/Ash Glow Behind Main Frame */}
              <div
                aria-hidden="true"
                className="absolute -inset-3 rounded-3xl bg-gradient-to-tr from-[#DC2626]/[0.06] via-transparent to-[#30343B]/[0.06] blur-xl pointer-events-none"
              />

              {/* Main Image Frame */}
              <div className="group relative rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-md hover:shadow-lg transition-shadow duration-300 bg-[#F3F4F6] aspect-[4/3] sm:aspect-[16/11]">
                <SafeImage
                  src={heroMainImg}
                  alt="MARVZ AI edge compute hardware, autonomous quadcopter UAV, and precision oscilloscope workbench"
                  fallbackTitle="Hardware Prototyping Laboratory"
                  priority={true}
                  className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />

                {/* Overlaid White Editorial Note */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-white/95 backdrop-blur-xs border border-[#E5E7EB] text-xs shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5">
                  <div className="flex items-center justify-between text-[#202124] font-semibold mb-1">
                    <span>Hands-On Engineering</span>
                    <span className="text-[#777777] font-mono text-[11px]">Real Hardware</span>
                  </div>
                  <p className="text-[#777777] text-[11px] leading-relaxed">
                    Zero simulation shortcuts. We build, program, and iterate with real microcontrollers, drone avionics, and sensory systems.
                  </p>
                </div>
              </div>

              {/* Secondary Static Authentic Photo with Subtle Hover Float */}
              <div className="hidden sm:block absolute -top-5 -right-5 w-36 h-28 rounded-xl overflow-hidden border-2 border-white shadow-md bg-[#F3F4F6] animate-marvz-float-y">
                <SafeImage
                  src={heroSecondaryImg}
                  alt="Real drone quadcopter assembly with carbon fiber propellers"
                  fallbackTitle="UAV Engineering"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3 Quick Startup Proposition Strips */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-[#E5E7EB]">
          <div className="group flex items-start gap-4 p-5 rounded-2xl bg-[#F3F4F6] hover:bg-white border border-[#E5E7EB] hover:border-[#30343B]/35 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className="p-2.5 rounded-xl bg-white border border-[#E5E7EB] text-[#30343B] shrink-0 shadow-xs transition-transform duration-300 group-hover:scale-110">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#202124]">Physical Hardware Integration</h4>
              <p className="text-xs text-[#777777] mt-1 leading-relaxed">
                Working with real carbon-fiber multi-rotors, robotic manipulators, and embedded test benches.
              </p>
            </div>
          </div>

          <div className="group flex items-start gap-4 p-5 rounded-2xl bg-[#F3F4F6] hover:bg-white border border-[#E5E7EB] hover:border-[#30343B]/35 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className="p-2.5 rounded-xl bg-white border border-[#E5E7EB] text-[#30343B] shrink-0 shadow-xs transition-transform duration-300 group-hover:scale-110">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#202124]">Rapid Prototyping Mindset</h4>
              <p className="text-xs text-[#777777] mt-1 leading-relaxed">
                Accelerating the journey from technical concept to operational hardware deployment.
              </p>
            </div>
          </div>

          <div className="group flex items-start gap-4 p-5 rounded-2xl bg-[#F3F4F6] hover:bg-white border border-[#E5E7EB] hover:border-[#30343B]/35 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className="p-2.5 rounded-xl bg-white border border-[#E5E7EB] text-[#30343B] shrink-0 shadow-xs transition-transform duration-300 group-hover:scale-110">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#202124]">Interconnected Ecosystem</h4>
              <p className="text-xs text-[#777777] mt-1 leading-relaxed">
                Fusing AI, cybersecurity, and IoT into coherent, multi-disciplinary engineering capabilities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
