import React, { useState } from 'react';
import { TechAnimationViewer } from './animation3d/TechAnimationViewer';
import { Sparkles, Play, Maximize2, Shield, Bot, Plane, Cpu, Code2 } from 'lucide-react';

export const CinematicAnimationSection: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section id="cinematic" className="relative bg-[#050508] border-b border-red-950/60 overflow-hidden">
      
      {/* Background ambient red glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-red-600/10 blur-[140px] pointer-events-none rounded-full" />

      {/* Section Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-red-950/40">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-red-500 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>3D Commercial Motion Experience · 60 FPS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Interactive 3D Technology Showcase
            </h2>
            <p className="mt-2 text-sm text-slate-400 max-w-2xl leading-relaxed">
              Experience the convergence of AI neural computing, cybersecurity shields, autonomous drone avionics, and articulated robotics in real-time 3D motion graphics.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-500 rounded-xl shadow-lg shadow-red-600/25 transition-all"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Theater Fullscreen</span>
            </button>
          </div>
        </div>
      </div>

      {/* Embedded 3D Scene Viewport */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative z-10">
        <div className="rounded-3xl overflow-hidden border border-red-900/40 shadow-2xl shadow-red-950/50 bg-[#080C14]">
          <TechAnimationViewer isStandalone={false} />
        </div>

        {/* Feature Pills under the animation */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-3 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/40 border border-slate-800">
            <Cpu className="w-4 h-4 text-red-500 shrink-0" />
            <span className="text-slate-300">01. Neural Networks</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/40 border border-slate-800">
            <Shield className="w-4 h-4 text-red-500 shrink-0" />
            <span className="text-slate-300">02. Cyber Shield</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/40 border border-slate-800">
            <Plane className="w-4 h-4 text-red-500 shrink-0" />
            <span className="text-slate-300">03. Drone Avionics</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/40 border border-slate-800">
            <Bot className="w-4 h-4 text-red-500 shrink-0" />
            <span className="text-slate-300">04. Articulated Robotics</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/40 border border-slate-800 col-span-2 md:col-span-1">
            <Code2 className="w-4 h-4 text-red-500 shrink-0" />
            <span className="text-slate-300">05. Cloud Synthesis</span>
          </div>
        </div>
      </div>

      {/* Fullscreen Theater Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in duration-300">
          <TechAnimationViewer
            isStandalone={true}
            onClose={() => setIsModalOpen(false)}
          />
        </div>
      )}

    </section>
  );
};
