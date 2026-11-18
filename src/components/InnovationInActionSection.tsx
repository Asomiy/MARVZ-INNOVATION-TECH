import React, { useState } from 'react';
import { ArrowRight, X, CheckCircle2, Layers } from 'lucide-react';
import { PROJECT_SHOWCASE, ProjectShowcase } from '../data/companyData';
import { SafeImage } from './SafeImage';
import { TechBackdrop } from './TechBackdrop';
import { Reveal } from './Reveal';
import { ProfileSlideshow } from './ProfileSlideshow';
import { CountUpNumber } from './CountUpNumber';
import {
  DRONE_TECHNOLOGY_SLIDESHOW,
  ROBOTICS_INNOVATION_SLIDESHOW,
} from '../data/profileSlideshowData';

interface InnovationInActionSectionProps {
  onOpenInquiry: (initialSubject?: string) => void;
}

export const InnovationInActionSection: React.FC<InnovationInActionSectionProps> = ({ onOpenInquiry }) => {
  const [selectedProject, setSelectedProject] = useState<ProjectShowcase | null>(null);
  const [activeDomain, setActiveDomain] = useState<string>('All');

  const domains = ['All', ...Array.from(new Set(PROJECT_SHOWCASE.map((p) => p.domain)))];
  const visibleProjects =
    activeDomain === 'All'
      ? PROJECT_SHOWCASE
      : PROJECT_SHOWCASE.filter((p) => p.domain === activeDomain);

  return (
    <section id="projects" className="relative overflow-hidden py-20 bg-[#FAFAFB] text-[#202124] border-b border-[#E5E7EB]">
      <TechBackdrop variant="uav-telemetry" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-3xl">
              <div className="text-xs font-mono uppercase tracking-wider text-[#777777] mb-2 font-semibold">
                04. Prototypes &amp; Applied Experiments
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202124] tracking-tight leading-tight">
                Innovation in Action
              </h2>
              <p className="mt-4 text-base sm:text-lg text-[#777777] leading-relaxed">
                Explore our ongoing experimental prototypes, real-world research hardware, and laboratory demonstrators
                designed and validated in our engineering workspace.
              </p>
            </div>

            <div className="shrink-0">
              <button
                onClick={() => onOpenInquiry('Custom Hardware or R&D Prototype Discussion')}
                className="group inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#30343B] hover:bg-[#202124] rounded-xl hover:-translate-y-0.5 transition-all duration-300 shadow-xs hover:shadow-md"
              >
                <span>Request R&amp;D Collaboration</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </Reveal>

        {/* Clean Portfolio Domain Filter */}
        <Reveal delayMs={60}>
          <div className="flex flex-wrap items-center gap-2 mb-8">
            {domains.map((domain) => {
              const isSelected = activeDomain === domain;
              return (
                <button
                  key={domain}
                  onClick={() => setActiveDomain(domain)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                    isSelected
                      ? 'bg-[#30343B] text-white border-[#30343B] shadow-xs'
                      : 'bg-white text-[#777777] border-[#E5E7EB] hover:text-[#202124] hover:border-[#30343B]/35'
                  }`}
                >
                  {domain}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Showcase Cards Grid */}
        <div key={activeDomain} className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-marvz-panel-in">
          {visibleProjects.map((project, idx) => (
            <Reveal key={project.id} delayMs={idx * 70} className="h-full">
              <div
                onClick={() => setSelectedProject(project)}
                className="group h-full cursor-pointer rounded-2xl bg-white border border-[#E5E7EB] hover:border-[#30343B]/45 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1"
              >
                {/* Photography with Subtle Hover Scale */}
                <div className="relative aspect-[16/10] overflow-hidden bg-[#F3F4F6] border-b border-[#E5E7EB]">
                  <SafeImage
                    src={project.imageUrl}
                    alt={project.altText}
                    fallbackTitle={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                  <div className="absolute top-4 left-4 text-[10px] font-mono font-semibold text-[#202124] bg-white/95 px-2.5 py-1 rounded-md border border-[#E5E7EB] shadow-xs">
                    {project.domain}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#202124] leading-snug">
                      {project.title}
                    </h3>
                    <p className="mt-2 text-xs text-[#777777] leading-relaxed">
                      {project.overview}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                    <span className="font-mono text-[#777777] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#30343B]" />
                      {project.stack[0]}
                    </span>
                    <span className="font-semibold text-[#30343B] flex items-center gap-1">
                      Inspect <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Slideshow 2: Drone Technology Showcase (PDF Pages 4-5, 4 Original Photos) */}
        <div
          id={DRONE_TECHNOLOGY_SLIDESHOW.sectionAnchor}
          className="mt-20 pt-16 border-t border-[#E5E7EB]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <Reveal className="lg:col-span-5 space-y-5">
              <div className="text-xs font-mono uppercase tracking-wider text-[#DC2626] font-semibold">
                {DRONE_TECHNOLOGY_SLIDESHOW.eyebrow}
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#202124] tracking-tight leading-tight">
                {DRONE_TECHNOLOGY_SLIDESHOW.title}
              </h3>
              <p className="text-sm text-[#777777] leading-relaxed">
                {DRONE_TECHNOLOGY_SLIDESHOW.subtitle}
              </p>

              <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] shadow-xs">
                <div className="text-2xl font-extrabold text-[#202124] tabular-nums">
                  <CountUpNumber value={200} suffix="+" />
                </div>
                <div className="text-xs text-[#777777] mt-0.5">
                  Aspiring drone engineers, developers and operators trained through hands-on workshops &amp; R&amp;D
                </div>
              </div>

              <ul className="space-y-2 text-xs text-[#202124]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                  <span>Multi-rotor &amp; fixed-wing airframe assembly, propulsion tuning, and avionics wiring</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                  <span>Radio telemetry links, flight controller calibration, and live field demonstrations</span>
                </li>
              </ul>

              <button
                onClick={() => onOpenInquiry('Drone Technology & UAV Workshop Collaboration')}
                className="group inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#30343B] hover:bg-[#202124] rounded-xl transition-all duration-300 shadow-xs"
              >
                <span>Explore Drone Programs</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </Reveal>

            <Reveal delayMs={80} className="lg:col-span-7">
              <ProfileSlideshow
                slides={DRONE_TECHNOLOGY_SLIDESHOW.slides}
                aspectClassName="aspect-[16/10]"
                ariaLabel="Drone Technology Showcase Slideshow"
              />
            </Reveal>
          </div>
        </div>

        {/* Slideshow 3: Robotics & Science Innovation Showcase (PDF Page 6, 4 Original Photos) */}
        <div
          id={ROBOTICS_INNOVATION_SLIDESHOW.sectionAnchor}
          className="mt-16 pt-16 border-t border-[#E5E7EB]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <Reveal delayMs={60} className="lg:col-span-7 order-2 lg:order-1">
              <ProfileSlideshow
                slides={ROBOTICS_INNOVATION_SLIDESHOW.slides}
                aspectClassName="aspect-[16/10]"
                ariaLabel="Robotics and Science Innovation Slideshow"
              />
            </Reveal>

            <Reveal className="lg:col-span-5 space-y-5 order-1 lg:order-2">
              <div className="text-xs font-mono uppercase tracking-wider text-[#DC2626] font-semibold">
                {ROBOTICS_INNOVATION_SLIDESHOW.eyebrow}
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#202124] tracking-tight leading-tight">
                {ROBOTICS_INNOVATION_SLIDESHOW.title}
              </h3>
              <p className="text-sm text-[#777777] leading-relaxed">
                {ROBOTICS_INNOVATION_SLIDESHOW.subtitle}
              </p>

              <ul className="space-y-2.5 text-xs text-[#202124]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                  <span>Indigenous humanoid robot prototypes showcased at national media &amp; tech exhibitions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                  <span>Mobile robot platforms, Bluetooth/embedded controllers, and actuator systems</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                  <span>Structured electronics, sensors, and microcontroller diagram instruction</span>
                </li>
              </ul>

              <button
                onClick={() => onOpenInquiry('Robotics & Science Innovation Prototype Inquiry')}
                className="group inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#30343B] hover:bg-[#202124] rounded-xl transition-all duration-300 shadow-xs"
              >
                <span>Collaborate on Robotics</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </Reveal>
          </div>
        </div>
      </div>

      {/* Project Inspection Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-[#E5E7EB] shadow-xl p-6 sm:p-8 text-[#202124] animate-marvz-panel-in">
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-5 right-5 p-2 rounded-lg text-[#777777] hover:text-[#202124] hover:bg-[#F3F4F6]"
              aria-label="Close project"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="text-xs font-mono text-[#777777] uppercase tracking-wider">
                {selectedProject.domain}
              </span>
              <h3 className="text-2xl font-bold text-[#202124] mt-1">
                {selectedProject.title}
              </h3>
            </div>

            <div className="relative rounded-xl overflow-hidden aspect-[16/9] mb-6 border border-[#E5E7EB] bg-[#F3F4F6]">
              <SafeImage
                src={selectedProject.imageUrl}
                alt={selectedProject.altText}
                fallbackTitle={selectedProject.title}
                className="w-full h-full object-cover"
              />
            </div>

            <p className="text-sm text-[#777777] leading-relaxed mb-6">
              {selectedProject.overview}
            </p>

            {/* Hardware Stack */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#202124] mb-3">
                Hardware & Technology Stack
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedProject.stack.map((tech, i) => (
                  <span
                    key={i}
                    className="text-xs font-mono text-[#202124] bg-[#F3F4F6] px-3 py-1.5 rounded-lg border border-[#E5E7EB]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Engineering Focus */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#202124] mb-3">
                Engineering Focus
              </h4>
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-[#F3F4F6] border border-[#E5E7EB] text-xs text-[#202124]">
                <CheckCircle2 className="w-4 h-4 text-[#30343B] shrink-0" />
                <span>{selectedProject.focus}</span>
              </div>
            </div>

            <div className="pt-6 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={() => setSelectedProject(null)}
                className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-[#202124] bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E5E7EB] rounded-lg"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  const title = selectedProject.title;
                  setSelectedProject(null);
                  onOpenInquiry(`Interest in Prototype: ${title}`);
                }}
                className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold text-white bg-[#30343B] hover:bg-[#202124] rounded-xl shadow-xs"
              >
                Discuss Similar Engineering Project
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
