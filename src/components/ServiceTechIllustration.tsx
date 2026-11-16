import React from 'react';

interface ServiceTechIllustrationProps {
  id: string;
  title: string;
}

/**
 * Unique, bespoke White & Ash architectural vector illustrations for each
 * MARVZ & INNOVATION TECH service division card.
 * Designed with clean geometric symmetry, light-ash structural layers, and crisp charcoal line-art.
 */
export const ServiceTechIllustration: React.FC<ServiceTechIllustrationProps> = ({ id }) => {
  switch (id) {
    case 'ai-ml':
      return (
        <svg viewBox="0 0 360 180" fill="none" className="w-full h-full" aria-hidden="true">
          <rect width="360" height="180" fill="#FAFAFB" />
          {/* Soft Ash Halo */}
          <circle cx="180" cy="90" r="68" fill="#F3F4F6" />
          <circle cx="180" cy="90" r="54" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4" />
          {/* Synaptic Layer Connections */}
          <g stroke="#CBD5E1" strokeWidth="1.25">
            <line x1="78" y1="50" x2="146" y2="62" />
            <line x1="78" y1="50" x2="146" y2="118" />
            <line x1="78" y1="90" x2="146" y2="62" />
            <line x1="78" y1="90" x2="146" y2="118" />
            <line x1="78" y1="130" x2="146" y2="62" />
            <line x1="78" y1="130" x2="146" y2="118" />
            <line x1="146" y1="62" x2="214" y2="48" />
            <line x1="146" y1="62" x2="214" y2="90" />
            <line x1="146" y1="62" x2="214" y2="132" />
            <line x1="146" y1="118" x2="214" y2="48" />
            <line x1="146" y1="118" x2="214" y2="90" />
            <line x1="146" y1="118" x2="214" y2="132" />
            <line x1="214" y1="48" x2="282" y2="72" />
            <line x1="214" y1="90" x2="282" y2="72" />
            <line x1="214" y1="90" x2="282" y2="108" />
            <line x1="214" y1="132" x2="282" y2="108" />
          </g>
          {/* Central Tensor Core */}
          <rect x="163" y="73" width="34" height="34" rx="8" fill="#FFFFFF" stroke="#30343B" strokeWidth="1.5" />
          <rect x="171" y="81" width="18" height="18" rx="4" fill="#F3F4F6" stroke="#30343B" strokeOpacity="0.45" strokeWidth="1" />
          {/* Nodes */}
          {[
            [78, 50], [78, 90], [78, 130],
            [146, 62], [146, 118],
            [214, 48], [214, 90], [214, 132],
            [282, 72], [282, 108],
          ].map(([cx, cy], i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="6.5" fill="#FFFFFF" stroke="#30343B" strokeOpacity="0.65" strokeWidth="1.35" />
              <circle cx={cx} cy={cy} r="2" fill="#30343B" />
            </g>
          ))}
        </svg>
      );

    case 'cybersecurity':
      return (
        <svg viewBox="0 0 360 180" fill="none" className="w-full h-full" aria-hidden="true">
          <rect width="360" height="180" fill="#FAFAFB" />
          {/* Hexagonal Cryptographic Shield Perimeter */}
          <polygon
            points="180,18 242,54 242,126 180,162 118,126 118,54"
            fill="#F3F4F6"
            stroke="#CBD5E1"
            strokeWidth="1.2"
          />
          <polygon
            points="180,32 230,61 230,119 180,148 130,119 130,61"
            fill="#FFFFFF"
            stroke="#E5E7EB"
            strokeWidth="1.1"
            strokeDasharray="4 3"
          />
          {/* Protocol Bus Lines */}
          <path d="M24 68 H92 L118 82" stroke="#CBD5E1" strokeWidth="1.3" />
          <path d="M24 112 H92 L118 98" stroke="#CBD5E1" strokeWidth="1.3" />
          <path d="M336 68 H268 L242 82" stroke="#CBD5E1" strokeWidth="1.3" />
          <path d="M336 112 H268 L242 98" stroke="#CBD5E1" strokeWidth="1.3" />
          <circle cx="92" cy="68" r="3" fill="#FFFFFF" stroke="#30343B" strokeOpacity="0.5" strokeWidth="1.2" />
          <circle cx="268" cy="112" r="3" fill="#FFFFFF" stroke="#30343B" strokeOpacity="0.5" strokeWidth="1.2" />
          {/* Central Zero-Trust Shield & Padlock */}
          <path
            d="M180 48 L212 60 V89 C212 111 198 126 180 134 C162 126 148 111 148 89 V60 Z"
            fill="#FFFFFF"
            stroke="#30343B"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <rect x="169" y="85" width="22" height="19" rx="4" fill="#F3F4F6" stroke="#30343B" strokeWidth="1.4" />
          <path d="M174 85 V79 C174 75.5 176.7 73 180 73 C183.3 73 186 75.5 186 79 V85" stroke="#30343B" strokeWidth="1.4" />
          <circle cx="180" cy="94.5" r="2" fill="#30343B" />
        </svg>
      );

    case 'drone-tech':
      return (
        <svg viewBox="0 0 360 180" fill="none" className="w-full h-full" aria-hidden="true">
          <rect width="360" height="180" fill="#FAFAFB" />
          {/* Telemetry Flight Horizon & Range Rings */}
          <circle cx="180" cy="90" r="72" fill="#F3F4F6" />
          <circle cx="180" cy="90" r="56" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="45" y1="90" x2="315" y2="90" stroke="#E5E7EB" strokeWidth="1" />
          <line x1="180" y1="16" x2="180" y2="164" stroke="#E5E7EB" strokeWidth="1" />
          {/* Quadcopter Avionics Schematic */}
          <g transform="translate(180 90)" stroke="#30343B" strokeWidth="1.5" strokeLinecap="round">
            <line x1="-44" y1="-38" x2="44" y2="38" />
            <line x1="-44" y1="38" x2="44" y2="-38" />
            {/* Rotor Guards */}
            <circle cx="-44" cy="-38" r="20" fill="#FFFFFF" fillOpacity="0.85" stroke="#30343B" strokeOpacity="0.65" strokeDasharray="4 3" />
            <circle cx="44" cy="-38" r="20" fill="#FFFFFF" fillOpacity="0.85" stroke="#30343B" strokeOpacity="0.65" strokeDasharray="4 3" />
            <circle cx="-44" cy="38" r="20" fill="#FFFFFF" fillOpacity="0.85" stroke="#30343B" strokeOpacity="0.65" strokeDasharray="4 3" />
            <circle cx="44" cy="38" r="20" fill="#FFFFFF" fillOpacity="0.85" stroke="#30343B" strokeOpacity="0.65" strokeDasharray="4 3" />
            {/* Carbon Fuselage & Gimbal */}
            <rect x="-14" y="-21" width="28" height="42" rx="8" fill="#FFFFFF" />
            <circle cx="0" cy="-4" r="6" fill="#F3F4F6" />
            <circle cx="0" cy="-4" r="2" fill="#30343B" />
            {/* Rotor Hubs */}
            <circle cx="-44" cy="-38" r="3.5" fill="#30343B" />
            <circle cx="44" cy="-38" r="3.5" fill="#30343B" />
            <circle cx="-44" cy="38" r="3.5" fill="#30343B" />
            <circle cx="44" cy="38" r="3.5" fill="#30343B" />
          </g>
        </svg>
      );

    case 'robotics':
      return (
        <svg viewBox="0 0 360 180" fill="none" className="w-full h-full" aria-hidden="true">
          <rect width="360" height="180" fill="#FAFAFB" />
          {/* Kinematic Protractor Arcs */}
          <circle cx="176" cy="108" r="78" fill="#F3F4F6" />
          <path d="M98 108 A78 78 0 0 1 254 108" stroke="#CBD5E1" strokeWidth="1.2" strokeDasharray="5 4" />
          <line x1="60" y1="148" x2="300" y2="148" stroke="#CBD5E1" strokeWidth="1.3" />
          {/* 6-DOF Articulated Manipulator */}
          <g stroke="#30343B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="108" y="134" width="44" height="14" rx="4" fill="#FFFFFF" />
            <line x1="130" y1="134" x2="168" y2="70" strokeWidth="4" stroke="#CBD5E1" />
            <line x1="130" y1="134" x2="168" y2="70" />
            <line x1="168" y1="70" x2="232" y2="52" strokeWidth="3.5" stroke="#CBD5E1" />
            <line x1="168" y1="70" x2="232" y2="52" />
            <line x1="232" y1="52" x2="246" y2="76" />
            {/* Gripper */}
            <path d="M246 76 L236 92 L241 96" />
            <path d="M246 76 L258 90 L253 95" />
            {/* Joints */}
            <circle cx="130" cy="134" r="7.5" fill="#FFFFFF" />
            <circle cx="168" cy="70" r="8.5" fill="#FFFFFF" />
            <circle cx="232" cy="52" r="6.5" fill="#FFFFFF" />
            <circle cx="168" cy="70" r="2.5" fill="#30343B" />
            {/* Target Component */}
            <rect x="234" y="138" width="24" height="10" rx="2" fill="#FFFFFF" stroke="#30343B" strokeOpacity="0.5" strokeWidth="1.2" />
          </g>
        </svg>
      );

    case 'iot':
      return (
        <svg viewBox="0 0 360 180" fill="none" className="w-full h-full" aria-hidden="true">
          <rect width="360" height="180" fill="#FAFAFB" />
          <circle cx="180" cy="90" r="66" fill="#F3F4F6" />
          {/* Wireless Telemetry Waves */}
          <path d="M232 62 C244 74 244 106 232 118" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M246 50 C264 70 264 110 246 130" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M128 62 C116 74 116 106 128 118" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M114 50 C96 70 96 110 114 130" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
          {/* PCB Microcontroller Module */}
          <g stroke="#30343B" strokeWidth="1.5">
            <rect x="145" y="55" width="70" height="70" rx="10" fill="#FFFFFF" />
            <rect x="160" y="70" width="40" height="40" rx="5" fill="#F3F4F6" />
            <circle cx="180" cy="90" r="7" fill="#FFFFFF" />
            <circle cx="180" cy="90" r="2.5" fill="#30343B" />
            {/* Pins */}
            <line x1="162" y1="44" x2="162" y2="55" />
            <line x1="180" y1="44" x2="180" y2="55" />
            <line x1="198" y1="44" x2="198" y2="55" />
            <line x1="162" y1="125" x2="162" y2="136" />
            <line x1="180" y1="125" x2="180" y2="136" />
            <line x1="198" y1="125" x2="198" y2="136" />
            <line x1="134" y1="74" x2="145" y2="74" />
            <line x1="134" y1="90" x2="145" y2="90" />
            <line x1="134" y1="106" x2="145" y2="106" />
            <line x1="215" y1="74" x2="226" y2="74" />
            <line x1="215" y1="90" x2="226" y2="90" />
            <line x1="215" y1="106" x2="226" y2="106" />
          </g>
        </svg>
      );

    case 'software':
    default:
      return (
        <svg viewBox="0 0 360 180" fill="none" className="w-full h-full" aria-hidden="true">
          <rect width="360" height="180" fill="#FAFAFB" />
          <circle cx="180" cy="90" r="66" fill="#F3F4F6" />
          {/* Clean IDE & Cloud Deployment Pipeline */}
          <rect x="78" y="34" width="204" height="112" rx="12" fill="#FFFFFF" stroke="#30343B" strokeWidth="1.5" />
          <line x1="78" y1="58" x2="282" y2="58" stroke="#E5E7EB" strokeWidth="1.2" />
          <circle cx="94" cy="46" r="2.5" fill="#30343B" fillOpacity="0.45" />
          <circle cx="104" cy="46" r="2.5" fill="#30343B" fillOpacity="0.3" />
          <circle cx="114" cy="46" r="2.5" fill="#30343B" fillOpacity="0.2" />
          {/* Code Bracket Symbol */}
          <g stroke="#30343B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M118 82 L104 96 L118 110" />
            <path d="M148 82 L162 96 L148 110" />
            <line x1="136" y1="78" x2="128" y2="114" />
          </g>
          {/* Structured Architecture Bars */}
          <rect x="180" y="78" width="80" height="8" rx="4" fill="#30343B" fillOpacity="0.18" />
          <rect x="180" y="94" width="64" height="8" rx="4" fill="#CBD5E1" />
          <rect x="180" y="110" width="74" height="8" rx="4" fill="#E5E7EB" />
        </svg>
      );
  }
};
