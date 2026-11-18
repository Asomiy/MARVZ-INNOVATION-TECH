import React from 'react';
import { ArrowRight, Briefcase, GraduationCap } from 'lucide-react';
import { WORKSHOP_TRACKS } from '../data/companyData';
import { TrainingProgram } from '../types/admin';
import { SafeImage } from './SafeImage';
import { TechBackdrop } from './TechBackdrop';
import { Reveal } from './Reveal';

interface LearnExperimentSectionProps {
  programs?: TrainingProgram[];
  onOpenInquiry: (initialSubject?: string) => void;
  onOpenTrainingRegister?: (programId?: string) => void;
  onOpenInternshipModal?: () => void;
}

export const LearnExperimentSection: React.FC<LearnExperimentSectionProps> = ({
  programs,
  onOpenInquiry,
  onOpenTrainingRegister,
  onOpenInternshipModal,
}) => {
  const displayPrograms: Array<
    Partial<TrainingProgram> & {
      id: string;
      title: string;
      level: string;
      duration: string;
      format: string;
      description: string;
      hardwareTools: string[];
    }
  > = programs && programs.length > 0 ? programs : WORKSHOP_TRACKS;

  return (
    <section
      id="training"
      className="relative overflow-hidden py-20 bg-[#FFFFFF] text-[#202124] border-b border-[#E5E7EB]"
    >
      <TechBackdrop variant="coding-lab" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-3xl">
              <div className="text-xs font-mono uppercase tracking-wider text-[#777777] mb-2 font-semibold">
                05. Hands-On Engineering Experiences
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202124] tracking-tight leading-tight">
                Learn. Experiment. Innovate.
              </h2>
              <p className="mt-4 text-base sm:text-lg text-[#777777] leading-relaxed">
                Step into an authentic engineering laboratory at our Dhaka headquarters where you learn by soldering
                circuit components, configuring autonomous drone avionics, writing microcontroller firmware, and diagnosing
                real hardware signals.
              </p>
            </div>

            <div className="shrink-0 flex flex-wrap items-center gap-3">
              {onOpenInternshipModal && (
                <button
                  onClick={onOpenInternshipModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#202124] bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E5E7EB] rounded-xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  <Briefcase className="w-4 h-4 text-[#30343B]" />
                  <span>Apply for Internship</span>
                </button>
              )}
              <button
                onClick={() => onOpenInquiry('Host Workshop or Request Cohort')}
                className="group inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#30343B] hover:bg-[#202124] rounded-xl hover:-translate-y-0.5 transition-all duration-300 shadow-xs hover:shadow-md"
              >
                <span>Host Institution Workshop</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </Reveal>

        {/* 2-Column Split: Lab Methodology & Authentic Laboratory Photography */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-16">
          <Reveal delayMs={60} className="lg:col-span-7 space-y-6">
            <h3 className="text-2xl font-bold text-[#202124]">No Slides. Real Engineering on Physical Hardware.</h3>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] hover:bg-white hover:border-[#30343B]/35 transition-all duration-300">
                <h4 className="text-sm font-bold text-[#202124] mb-1">1. Component-Level Fabrication</h4>
                <p className="text-xs text-[#777777] leading-relaxed">
                  Understand every wire, resistor, and ESC. Participants solder power boards, balance motors, and inspect
                  signals using digital oscilloscopes.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] hover:bg-white hover:border-[#30343B]/35 transition-all duration-300">
                <h4 className="text-sm font-bold text-[#202124] mb-1">2. Open Firmware &amp; Flight Stacks</h4>
                <p className="text-xs text-[#777777] leading-relaxed">
                  Program modern industry standards like PX4, ArduPilot, FreeRTOS, and ROS 2 rather than locked
                  proprietary consumer gadgets.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] hover:bg-white hover:border-[#30343B]/35 transition-all duration-300">
                <h4 className="text-sm font-bold text-[#202124] mb-1">3. Field Calibration &amp; Testing</h4>
                <p className="text-xs text-[#777777] leading-relaxed">
                  Test your autonomous flight missions and robotics kinematics on designated testing fixtures, tracking
                  PID errors and telemetry drift in real time.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delayMs={120} className="lg:col-span-5">
            <div className="group relative rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-md hover:shadow-lg transition-shadow duration-300 bg-[#F3F4F6] aspect-[4/3]">
              <SafeImage
                src="/assets/tech/iot-pcb.jpg"
                alt="Custom embedded microcontroller and RF hardware testing board on white engineering surface"
                fallbackTitle="Physical Prototyping Benches"
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              />
              <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-white/95 backdrop-blur-xs border border-[#E5E7EB] text-xs shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5">
                <span className="font-bold text-[#202124]">Active Testing Bench</span>
                <p className="text-[#777777] text-[11px] mt-0.5">
                  Real oscilloscopes, logic analyzers, and motor dynamometers.
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Live Training Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayPrograms.map((track, idx) => (
            <Reveal key={track.id} delayMs={idx * 70} className="h-full">
              <div className="group h-full p-6 rounded-2xl bg-white border border-[#E5E7EB] hover:border-[#30343B]/45 hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col justify-between shadow-xs hover:shadow-md">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#30343B] uppercase tracking-wider font-semibold">{track.level}</span>
                  <span className="text-[#777777]">{track.duration}</span>
                </div>

                <h4 className="text-lg font-bold text-[#202124] leading-snug">
                  {track.title}
                </h4>

                <p className="text-xs text-[#777777] leading-relaxed">{track.description}</p>

                <div className="pt-2">
                  <div className="text-[11px] font-semibold text-[#202124] uppercase tracking-wider mb-2">
                    Hardware Equipment & Tools
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {track.hardwareTools.map((tool, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] text-[#202124] bg-[#F3F4F6] px-2.5 py-1 rounded border border-[#E5E7EB]"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#E5E7EB] mt-6 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs font-mono text-[#777777] space-y-0.5">
                  {typeof track.price === 'number' && (
                    <div className="font-bold text-[#202124] tabular-nums">
                      {track.currency || 'BDT'} {track.price.toLocaleString()}
                    </div>
                  )}
                  <div className="text-[11px] text-[#777777] flex items-center gap-2">
                    <span>{track.format}</span>
                    {track.seatsAvailable !== undefined && (
                      <span className="text-[#30343B] font-semibold">· {track.seatsAvailable} seats left</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() =>
                    onOpenTrainingRegister
                      ? onOpenTrainingRegister(track.id)
                      : onOpenInquiry(`Workshop Registration: ${track.title}`)
                  }
                  disabled={track.status === 'Closed'}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#30343B] hover:bg-[#202124] disabled:bg-[#D1D5DB] disabled:text-[#777777] rounded-xl transition-colors shadow-xs"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>{track.status === 'Closed' ? 'Batch Full' : 'Register Seat'}</span>
                </button>
              </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Dedicated Internship Fellowship Callout Banner */}
        {onOpenInternshipModal && (
          <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-[#F3F4F6] text-[#202124] border border-[#E5E7EB] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
            <div className="space-y-1.5 max-w-2xl">
              <div className="text-xs font-mono uppercase tracking-wider text-[#777777] font-semibold">
                Dhaka Lab Fellowships · Internships
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#202124]">
                Engineering Internships & Research Fellowships
              </h3>
              <p className="text-xs sm:text-sm text-[#777777] leading-relaxed">
                Gain real R&D mentorship in AI, Drone Engineering, Robotics, Cybersecurity, IoT, and Software Engineering at
                our West Shewrapara lab.
              </p>
            </div>
            <button
              onClick={onOpenInternshipModal}
              className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#30343B] hover:bg-[#202124] text-white text-xs font-semibold uppercase tracking-wider shadow-xs transition-colors"
            >
              <Briefcase className="w-4 h-4" />
              <span>Apply for Internship</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
