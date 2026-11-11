import React, { useState } from 'react';
import { Sparkles, Wrench, Layers, Clock, ArrowRight, CheckCircle2, Shield, Plane, Bot } from 'lucide-react';
import { WORKSHOP_TRACKS, WorkshopTrack } from '../data/companyData';
import { SafeImage } from './SafeImage';

interface LearnExperimentSectionProps {
  onOpenInquiry: (initialSubject?: string) => void;
}

export const LearnExperimentSection: React.FC<LearnExperimentSectionProps> = ({ onOpenInquiry }) => {
  return (
    <section id="training" className="py-20 bg-[#F3F6FA] text-[#081426] relative border-b border-slate-200 overflow-hidden">
      
      {/* Authentic Hardware Engineering Workbench Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=2000&q=80"
          alt="Hardware engineering workbench background"
          className="w-full h-full object-cover object-center opacity-[0.08]"
          referrerPolicy="no-referrer"
        />
        {/* Soft light scrim ensuring maximum legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#F3F6FA]/90 via-[#F3F6FA]/80 to-[#F3F6FA]/90" />
        <div className="absolute inset-0 bg-[radial-gradient(#2563EB_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.05]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-3xl">
            <div className="text-xs font-mono uppercase tracking-wider text-[#2563EB] mb-2 font-semibold">
              05. Hands-On Engineering Experiences
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#081426] tracking-tight leading-tight">
              Learn. Experiment. Innovate.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-700 leading-relaxed">
              Step into an authentic engineering laboratory where you learn by soldering circuit components, configuring autonomous drone avionics, writing microcontroller firmware, and diagnosing real hardware signals.
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => onOpenInquiry('Host Workshop or Request Cohort')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#2563EB] hover:bg-[#1d4ed8] rounded-xl transition-all shadow-md"
            >
              <span>Host Workshop at Your Institution</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2-Column Split: Lab Methodology & Authentic Laboratory Photography */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-16">
          
          {/* Left: 3 Principles of Learning at MARVZ */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="text-2xl font-bold text-[#081426]">
              No Slides. Real Engineering on Physical Hardware.
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                <h4 className="text-sm font-bold text-[#081426] mb-1">
                  1. Component-Level Fabrication
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Understand every wire, resistor, and ESC. Participants solder power boards, balance motors, and inspect signals using digital oscilloscopes.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                <h4 className="text-sm font-bold text-[#081426] mb-1">
                  2. Open Firmware & Flight Stacks
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Program modern industry standards like PX4, ArduPilot, FreeRTOS, and ROS 2 rather than locked proprietary consumer gadgets.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                <h4 className="text-sm font-bold text-[#081426] mb-1">
                  3. Field Calibration & Testing
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Test your autonomous flight missions and robotics kinematics on designated testing fixtures, tracking PID errors and telemetry drift in real time.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Authentic Real Photo of Workbench & Circuitry */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-slate-300 shadow-xl bg-white aspect-[4/3]">
              <SafeImage
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1000&q=80"
                alt="Real engineers prototyping with electronic components and measurement devices in lab"
                fallbackTitle="Physical Prototyping Benches"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#081426]/90 via-[#081426]/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 text-xs shadow-md">
                <span className="font-bold text-[#081426]">Active Testing Bench</span>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Real oscilloscopes, logic analyzers, and motor dynamometers.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* 4 Intensive Workshop Tracks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {WORKSHOP_TRACKS.map((track) => (
            <div
              key={track.id}
              className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-[#2563EB] transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#2563EB] uppercase tracking-wider font-semibold">{track.level}</span>
                  <span className="text-slate-500">{track.duration}</span>
                </div>

                <h4 className="text-lg font-bold text-[#081426] group-hover:text-[#2563EB] transition-colors leading-snug">
                  {track.title}
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {track.description}
                </p>

                <div className="pt-2">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Hardware Equipment & Tools
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {track.hardwareTools.map((tool, idx) => (
                      <span key={idx} className="text-[11px] text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 mt-6 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono">
                  {track.format}
                </span>

                <button
                  onClick={() => onOpenInquiry(`Workshop Registration: ${track.title}`)}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#2563EB] hover:bg-[#1d4ed8] rounded-xl transition-colors shadow-sm"
                >
                  Inquire for Seat
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
