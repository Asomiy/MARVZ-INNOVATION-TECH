import React, { useState } from 'react';
import { Cpu, Shield, Plane, Bot, Cloud, CheckCircle2, ArrowRight } from 'lucide-react';
import { SafeImage } from './SafeImage';
import { TechBackdrop } from './TechBackdrop';

const ARCHITECTURE_DOMAINS = [
  {
    id: 'ai',
    label: 'Neural AI',
    title: 'Edge AI & Computer Vision Inference Pipelines',
    subtitle: 'Applied Machine Intelligence',
    description:
      'Production-grade neural networks trained for visual defect inspection, predictive diagnostics, and low-latency telemetry analysis on embedded ARM and Jetson compute hardware.',
    imageUrl: '/assets/tech/ai-workstation.jpg',
    specs: [
      'Quantized INT8 inference models for sub-15ms edge execution',
      'Multi-camera object detection and tracking pipelines',
      'Automated anomaly detection across industrial telemetry streams',
    ],
    icon: Cpu,
  },
  {
    id: 'cyber',
    label: 'Cyber Defense',
    title: 'Zero-Trust Network & Embedded Security Architecture',
    subtitle: 'Digital & Hardware Resilience',
    description:
      'Comprehensive security engineering spanning penetration testing, hardware firmware auditing, encrypted telemetry links, and enterprise zero-trust perimeter defense.',
    imageUrl: '/assets/tech/cyber-rack.jpg',
    specs: [
      'Hardware-backed key attestation & TLS mutual authentication',
      'Network traffic inspection & vulnerability hardening',
      'Automated incident telemetry & audit readiness',
    ],
    icon: Shield,
  },
  {
    id: 'uav',
    label: 'UAV Avionics',
    title: 'Autonomous Multi-Rotor & Flight Control Systems',
    subtitle: 'Aerial Engineering & Mapping',
    description:
      'Custom carbon-fiber airframes calibrated with PX4 and ArduPilot flight stacks, RTK-GPS positioning, LiDAR obstacle avoidance, and automated photogrammetry missions.',
    imageUrl: '/assets/tech/uav-prototype.jpg',
    specs: [
      'Dual-redundant IMU and barometric sensor fusion',
      'Waypoint mission automation & real-time MAVLink telemetry',
      'High-payload aerial survey & agricultural inspection rigs',
    ],
    icon: Plane,
  },
  {
    id: 'robotics',
    label: 'Robotics',
    title: '6-DOF Robotic Kinematics & Industrial Automation',
    subtitle: 'Mechatronics & Control Loops',
    description:
      'Precision closed-loop motor control, ROS 2 navigation stacks, and programmable robotic manipulators engineered for assembly, sorting, and automated laboratory workflows.',
    imageUrl: '/assets/tech/robotics-arm.jpg',
    specs: [
      'Inverse kinematics motion planning with ROS 2 & MoveIt',
      'PID-tuned BLDC actuators & industrial PLC interfacing',
      'Force-feedback gripper calibration and safety interlocks',
    ],
    icon: Bot,
  },
  {
    id: 'cloud',
    label: 'IoT & Cloud',
    title: 'Connected Field Sensors & Scalable Cloud Platforms',
    subtitle: 'Full-Stack Distributed Systems',
    description:
      'End-to-end LoRaWAN, MQTT, and cellular IoT sensor networks streaming securely into scalable cloud APIs, operational dashboards, and enterprise mobile interfaces.',
    imageUrl: '/assets/tech/iot-pcb.jpg',
    specs: [
      'Low-power STM32 / ESP32 nodes with over-the-air firmware updates',
      'High-throughput MQTT brokers and time-series data pipelines',
      'Clean enterprise web & mobile monitoring dashboards',
    ],
    icon: Cloud,
  },
];

export const CinematicAnimationSection: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>('ai');
  const activeDomain =
    ARCHITECTURE_DOMAINS.find((d) => d.id === selectedId) || ARCHITECTURE_DOMAINS[0];
  const ActiveIcon = activeDomain.icon;

  return (
    <section
      id="cinematic"
      className="relative overflow-hidden py-20 bg-[#FAFAFB] text-[#202124] border-b border-[#E5E7EB]"
    >
      <TechBackdrop variant="architecture" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Clean Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-[#777777] font-semibold">
              Technology Architecture · Core Engineering Stack
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#202124]">
              Integrated Systems Built From Silicon to Cloud
            </h2>
            <p className="text-sm sm:text-base text-[#777777] leading-relaxed">
              Inspect how MARVZ & INNOVATION TECH unifies embedded hardware, autonomous avionics,
              machine intelligence, and enterprise software into cohesive engineering platforms.
            </p>
          </div>

          <div className="text-xs font-mono text-[#777777] shrink-0">
            5 Core Engineering Layers
          </div>
        </div>

        {/* Clean Segmented Domain Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {ARCHITECTURE_DOMAINS.map((domain) => {
            const Icon = domain.icon;
            const isSelected = domain.id === selectedId;
            return (
              <button
                key={domain.id}
                onClick={() => setSelectedId(domain.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors duration-150 border ${
                  isSelected
                    ? 'bg-[#30343B] text-white border-[#30343B] shadow-xs'
                    : 'bg-white text-[#777777] border-[#E5E7EB] hover:text-[#202124] hover:bg-white/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{domain.label}</span>
              </button>
            );
          })}
        </div>

        {/* Clean White Static Architecture Showcase Panel (Zero Video / Motion Loops) */}
        <div className="rounded-2xl bg-white border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left Static Visual */}
            <div className="lg:col-span-6 bg-[#F3F4F6] aspect-[16/10] lg:aspect-auto lg:min-h-[380px] relative border-b lg:border-b-0 lg:border-r border-[#E5E7EB]">
              <SafeImage
                src={activeDomain.imageUrl}
                alt={activeDomain.title}
                fallbackTitle={activeDomain.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right Technical Specifications */}
            <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-wider text-[#777777]">
                  <span className="p-2 rounded-lg bg-[#F3F4F6] border border-[#E5E7EB] text-[#30343B]">
                    <ActiveIcon className="w-4 h-4" />
                  </span>
                  <span>{activeDomain.subtitle}</span>
                </div>

                <h3 className="text-2xl font-bold text-[#202124] leading-snug">
                  {activeDomain.title}
                </h3>

                <p className="text-sm text-[#777777] leading-relaxed">
                  {activeDomain.description}
                </p>

                <div className="pt-2 space-y-2.5">
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#202124]">
                    Key Architectural Capabilities
                  </div>
                  {activeDomain.specs.map((spec, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-xs text-[#202124]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#30343B] shrink-0 mt-0.5" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between">
                <span className="text-xs text-[#777777]">
                  Built & validated at MARVZ Dhaka Labs
                </span>
                <button
                  onClick={() => {
                    const el = document.getElementById('technologies');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#30343B] hover:text-[#202124]"
                >
                  <span>View All Divisions</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
