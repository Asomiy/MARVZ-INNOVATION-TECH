import React, { useState } from 'react';
import { Lightbulb, Microscope, Rocket, Users, FlaskConical, Atom, ArrowRight, Check } from 'lucide-react';

interface InnovationSectionProps {
  onOpenInquiry: (initialSubject?: string) => void;
  setActiveTab: (tab: string) => void;
}

export const InnovationSection: React.FC<InnovationSectionProps> = ({ onOpenInquiry, setActiveTab }) => {
  const [activeTab, setActiveFocus] = useState<number>(0);

  const researchFocusAreas = [
    {
      title: 'Autonomous Swarm Robotics & Aerial Mapping',
      icon: Rocket,
      desc: 'Investigating decentralized coordination algorithms for multi-UAV reconnaissance and obstacle avoidance in communication-constrained areas.',
      deliverables: ['Custom PX4 Swarm Firmware', 'Decentralized Mesh Protocol', 'Point-Cloud Reconstruction']
    },
    {
      title: 'Quantized Edge AI for Industrial IoT',
      icon: Atom,
      desc: 'Developing sub-10ms neural defect classification models optimized for low-power ARM microcontrollers and solar-powered edge field nodes.',
      deliverables: ['Int8 Quantization Pipelines', 'Zero-Cloud Offline Inference', 'Hardware Acceleration Engine']
    },
    {
      title: 'Zero-Trust Cyber Range Simulation',
      icon: FlaskConical,
      desc: 'Automating multi-stage threat actor emulation, testing defenses against lateral movement, kernel exploitation, and supply chain attacks.',
      deliverables: ['Sandboxed Exploit Labs', 'Continuous Posture Auditing', 'Kernel eBPF Telemetry']
    },
    {
      title: 'STEM Innovation & Youth Engineering Incubation',
      icon: Users,
      desc: 'Bridging early educational curiosity with real engineering tooling through hands-on robotics kits, 3D printing labs, and drone assembly.',
      deliverables: ['School Tech Workshops', 'Annual Student Hackathons', 'Mentorship for STEM Projects']
    }
  ];

  return (
    <section className="py-20 bg-[#071426] relative border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="text-xs font-mono uppercase tracking-wider text-[#00D4FF] mb-2">
            04. Innovation, R&D & STEM
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Research & Innovation Ecosystem
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            We don't simply teach technology—we actively research, prototype, and build it. Our Innovation Labs serve as an incubator for industrial breakthroughs, student prototypes, and community STEM education.
          </p>
        </div>

        {/* 2-Column Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch mb-16">
          
          {/* Left: Tab selectors for research focus areas */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
            {researchFocusAreas.map((area, index) => {
              const Icon = area.icon;
              const isSelected = activeTab === index;
              return (
                <button
                  key={index}
                  onClick={() => setActiveFocus(index)}
                  className={`p-5 rounded-xl text-left transition-all border ${
                    isSelected
                      ? 'bg-[#0B1020] border-[#087CFF] shadow-lg shadow-[#087CFF]/10'
                      : 'bg-[#0B1020]/50 border-slate-800/80 hover:border-slate-700 hover:bg-[#0B1020]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-[#087CFF] text-white' : 'bg-slate-800 text-slate-400'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-snug">
                        {area.title}
                      </h4>
                      <div className="text-[11px] text-[#00D4FF] font-mono mt-0.5">
                        Lab Division 0{index + 1}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Active Research Area Spotlight Panel */}
          <div className="lg:col-span-7 p-8 rounded-2xl bg-[#0B1020] border border-slate-800 flex flex-col justify-between">
            <div className="space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="text-xs font-mono text-[#00D4FF] uppercase tracking-wider">
                  Active Research Initiative
                </span>
                <span className="text-xs text-slate-400">
                  MARVZ Applied Lab
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white leading-tight">
                {researchFocusAreas[activeTab].title}
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed">
                {researchFocusAreas[activeTab].desc}
              </p>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Key Research Deliverables & Infrastructure
                </h4>
                <div className="space-y-2">
                  {researchFocusAreas[activeTab].deliverables.map((d, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-3 rounded-lg bg-[#071426] border border-slate-800/80 text-xs text-slate-200">
                      <Check className="w-4 h-4 text-[#00D4FF] shrink-0" />
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="pt-8 border-t border-slate-800/80 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-slate-400">
                Interested in co-sponsoring or collaborating on this research?
              </span>
              <button
                onClick={() => onOpenInquiry(`Research Collaboration: ${researchFocusAreas[activeTab].title}`)}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#087CFF] to-[#0070e6] rounded-lg shadow-sm"
              >
                Inquire for Collaboration
              </button>
            </div>

          </div>

        </div>

        {/* 3 Pillars of Innovation: Labs, STEM & Tech Transfer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-[#0B1020] border border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-[#087CFF]/15 text-[#00D4FF] flex items-center justify-center mb-4">
              <Microscope className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Prototyping Labs</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Equipped with 3D SLA printers, precision CNC routing, logic analyzers, and motor dynamometers, enabling students and partners to build physical hardware prototypes.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#0B1020] border border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-[#087CFF]/15 text-[#00D4FF] flex items-center justify-center mb-4">
              <Lightbulb className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">STEM Education Outreach</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Empowering primary and secondary school students with foundational algorithmic thinking, robotics kits, and introductory aerial mechanics.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#0B1020] border border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-[#087CFF]/15 text-[#00D4FF] flex items-center justify-center mb-4">
              <Rocket className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Industry Technology Transfer</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Assisting regional industrial firms with evaluating automated quality control, drone perimeter security, and edge intelligence migrations.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
