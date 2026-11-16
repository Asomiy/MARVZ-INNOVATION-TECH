import React from 'react';

export type TechBackdropVariant =
  | 'hero'
  | 'architecture'
  | 'robotics'
  | 'cyber-network'
  | 'blockchain'
  | 'uav-telemetry'
  | 'coding-lab'
  | 'cloud-relay'
  | 'footer';

interface TechBackdropProps {
  variant: TechBackdropVariant;
}

/**
 * Refined White & Ash IT/Technology Backdrop System
 * Color Balance:
 * - ~85% Clean Pure White (#FFFFFF / #FAFAFB)
 * - ~10% Soft Ash-Grey Patterns & Abstract Geometric Shapes (#F3F4F6, #E5E7EB, #CBD5E1)
 * - ~5% Subtle Charcoal Line-Art Details (#30343B at low opacity 0.16–0.26)
 *
 * Features clearly recognizable, Apple-minimalist static line-art schematics for:
 * AI neural networks, PCB circuits, drones, robotics, software coding symbols,
 * cybersecurity shields, cloud computing infrastructure, and geometric blockchain lattices.
 */
export const TechBackdrop: React.FC<TechBackdropProps> = ({ variant }) => {
  const isSoftWhiteSection =
    variant === 'architecture' ||
    variant === 'cyber-network' ||
    variant === 'uav-telemetry' ||
    variant === 'cloud-relay';

  const baseGridClass =
    variant === 'blockchain'
      ? 'bg-tech-isometric-white'
      : isSoftWhiteSection
        ? 'bg-tech-dots-ash'
        : 'bg-tech-grid-white';

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0"
    >
      {/* 1. Crisp Digital Engineering Grid / Dot Matrix */}
      <div className={`absolute inset-0 ${baseGridClass} opacity-75`} />

      {/* 2. Gentle Edge & Text-Column Fade (never hides the perimeter/empty-space illustrations) */}
      <div
        className={
          isSoftWhiteSection
            ? 'absolute inset-0 bg-[radial-gradient(circle_at_28%_45%,rgba(250,250,251,0.72)_0%,rgba(250,250,251,0.18)_58%,transparent_100%)]'
            : 'absolute inset-0 bg-[radial-gradient(circle_at_28%_45%,rgba(255,255,255,0.72)_0%,rgba(255,255,255,0.18)_58%,transparent_100%)]'
        }
      />

      {/* 3. Section-Specific Recognizable Technology Line-Art & Soft Ash Shapes */}
      {variant === 'hero' && (
        <>
          {/* Upper-Right & Right Backdrop: Soft Ash Shapes + AI Neural Mesh + Minimal Drone + PCB Traces */}
          <svg
            viewBox="0 0 920 760"
            fill="none"
            className="absolute -right-12 -top-6 w-[780px] h-[640px] sm:w-[860px] sm:h-[700px]"
          >
            {/* Soft Ash-Grey Abstract Geometric Shapes */}
            <circle cx="670" cy="210" r="175" fill="#F3F4F6" fillOpacity="0.85" />
            <rect
              x="470"
              y="55"
              width="250"
              height="130"
              rx="28"
              fill="#F3F4F6"
              fillOpacity="0.65"
            />

            {/* Circuit Board Bus Lines & Digital Pads */}
            <g stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M90 78 H330 L375 123 H615 L665 173 H875" />
              <path d="M140 112 H305 L345 152 H555 L595 192 H840" />
              <path d="M430 20 V95 L465 130 H690" strokeDasharray="5 5" />
              <path d="M510 560 H730 L775 515 H890" />
            </g>
            {/* Subtle Charcoal Circuit Vias */}
            <g stroke="#30343B" strokeOpacity="0.24" strokeWidth="1.4">
              <circle cx="330" cy="78" r="4.5" fill="#FFFFFF" />
              <circle cx="615" cy="123" r="4.5" fill="#FFFFFF" />
              <circle cx="555" cy="152" r="3.5" fill="#FFFFFF" />
              <circle cx="690" cy="130" r="4" fill="#FFFFFF" />
              <circle cx="730" cy="560" r="4.5" fill="#FFFFFF" />
            </g>

            {/* AI Neural Network Pattern & Connected Nodes */}
            <g stroke="#30343B" strokeOpacity="0.16" strokeWidth="1.25">
              <line x1="455" y1="220" x2="585" y2="165" />
              <line x1="455" y1="220" x2="600" y2="265" />
              <line x1="455" y1="315" x2="585" y2="165" />
              <line x1="455" y1="315" x2="600" y2="265" />
              <line x1="455" y1="315" x2="585" y2="375" />
              <line x1="455" y1="415" x2="600" y2="265" />
              <line x1="455" y1="415" x2="585" y2="375" />
              <line x1="585" y1="165" x2="745" y2="215" />
              <line x1="600" y1="265" x2="745" y2="215" />
              <line x1="600" y1="265" x2="755" y2="335" />
              <line x1="585" y1="375" x2="755" y2="335" />
            </g>
            {[
              [455, 220],
              [455, 315],
              [455, 415],
              [585, 165],
              [600, 265],
              [585, 375],
              [745, 215],
              [755, 335],
            ].map(([cx, cy], idx) => (
              <g key={idx}>
                <circle
                  cx={cx}
                  cy={cy}
                  r="10"
                  fill="#FFFFFF"
                  stroke="#30343B"
                  strokeOpacity="0.22"
                  strokeWidth="1.3"
                />
                <circle cx={cx} cy={cy} r="3.5" fill="#30343B" fillOpacity="0.26" />
              </g>
            ))}

            {/* Minimal Autonomous Quad-Rotor Drone Line-Art (Clearly Recognizable) */}
            <g transform="translate(360 190)" stroke="#30343B" strokeOpacity="0.21" strokeWidth="1.45">
              <line x1="-42" y1="-42" x2="42" y2="42" strokeLinecap="round" />
              <line x1="-42" y1="42" x2="42" y2="-42" strokeLinecap="round" />
              <rect x="-12" y="-18" width="24" height="36" rx="7" fill="#FFFFFF" />
              <circle cx="0" cy="-3" r="5" />
              <circle cx="-42" cy="-42" r="22" strokeDasharray="4 3" />
              <circle cx="42" cy="-42" r="22" strokeDasharray="4 3" />
              <circle cx="-42" cy="42" r="22" strokeDasharray="4 3" />
              <circle cx="42" cy="42" r="22" strokeDasharray="4 3" />
              <circle cx="-42" cy="-42" r="3.5" fill="#30343B" fillOpacity="0.24" />
              <circle cx="42" cy="-42" r="3.5" fill="#30343B" fillOpacity="0.24" />
              <circle cx="-42" cy="42" r="3.5" fill="#30343B" fillOpacity="0.24" />
              <circle cx="42" cy="42" r="3.5" fill="#30343B" fillOpacity="0.24" />
            </g>
          </svg>

          {/* Bottom-Left Open Margin: Code Syntax & Circuit Connection */}
          <svg
            viewBox="0 0 380 320"
            fill="none"
            className="absolute -left-6 bottom-6 w-[320px] h-[270px]"
          >
            <circle cx="110" cy="210" r="88" fill="#F3F4F6" fillOpacity="0.7" />
            <path d="M10 215 H115 L155 175 H265" stroke="#CBD5E1" strokeWidth="1.4" />
            <path d="M10 242 H100 L140 202 H235" stroke="#30343B" strokeOpacity="0.16" strokeWidth="1.2" />
            <circle cx="265" cy="175" r="4.5" fill="#FFFFFF" stroke="#30343B" strokeOpacity="0.24" strokeWidth="1.4" />
            <circle cx="235" cy="202" r="3.5" fill="#FFFFFF" stroke="#30343B" strokeOpacity="0.2" strokeWidth="1.2" />
            {/* Minimal Coding Symbols: </> */}
            <g stroke="#30343B" strokeOpacity="0.22" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M72 132 L54 150 L72 168" />
              <path d="M114 132 L132 150 L114 168" />
              <line x1="98" y1="126" x2="88" y2="174" />
            </g>
          </svg>
        </>
      )}

      {variant === 'architecture' && (
        <>
          {/* Circuit Board Silicon Chip & Cloud Server Infrastructure */}
          <svg
            viewBox="0 0 1200 680"
            fill="none"
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Soft Ash Abstract Shapes */}
            <circle cx="1030" cy="130" r="145" fill="#F3F4F6" fillOpacity="0.9" />
            <rect x="45" y="420" width="190" height="190" rx="32" fill="#F3F4F6" fillOpacity="0.85" />

            {/* Upper-Right Cloud Computing + Server Blade Line-Art */}
            <g transform="translate(915 45)" stroke="#30343B" strokeOpacity="0.22" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round">
              <path
                d="M66 96 C46 96 32 82 34 64 C36 48 49 38 64 40 C72 18 96 6 120 12 C139 16 154 31 157 50 C174 51 186 64 186 80 C186 90 177 96 164 96 Z"
                fill="#FFFFFF"
                fillOpacity="0.85"
              />
              {/* Uplink / Downlink Lines to Server Stack */}
              <line x1="92" y1="96" x2="92" y2="124" />
              <line x1="128" y1="96" x2="128" y2="124" />
              <rect x="64" y="124" width="92" height="22" rx="5" fill="#FFFFFF" />
              <rect x="64" y="152" width="92" height="22" rx="5" fill="#FFFFFF" />
              <circle cx="77" cy="135" r="2.2" fill="#30343B" fillOpacity="0.3" />
              <circle cx="77" cy="163" r="2.2" fill="#30343B" fillOpacity="0.3" />
              <line x1="100" y1="135" x2="142" y2="135" />
              <line x1="100" y1="163" x2="142" y2="163" />
            </g>

            {/* Bottom-Left Silicon Microprocessor Die & Circuit Traces */}
            <g transform="translate(72 455)" stroke="#30343B" strokeOpacity="0.21" strokeWidth="1.4">
              <rect x="20" y="20" width="90" height="90" rx="14" fill="#FFFFFF" fillOpacity="0.9" />
              <rect x="40" y="40" width="50" height="50" rx="6" strokeDasharray="4 3" />
              <circle cx="65" cy="65" r="8" />
              {/* IC Pins */}
              <line x1="0" y1="42" x2="20" y2="42" />
              <line x1="0" y1="65" x2="20" y2="65" />
              <line x1="0" y1="88" x2="20" y2="88" />
              <line x1="110" y1="42" x2="195" y2="42" />
              <line x1="110" y1="65" x2="235" y2="65" />
              <line x1="110" y1="88" x2="175" y2="88" />
              <line x1="42" y1="0" x2="42" y2="20" />
              <line x1="65" y1="0" x2="65" y2="20" />
              <line x1="88" y1="0" x2="88" y2="20" />
              <line x1="42" y1="110" x2="42" y2="145" />
              <line x1="88" y1="110" x2="88" y2="145" />
              <circle cx="195" cy="42" r="3.5" fill="#FFFFFF" />
              <circle cx="235" cy="65" r="3.5" fill="#FFFFFF" />
            </g>

            {/* Continuous Horizontal PCB Bus at Bottom */}
            <path d="M310 625 H620 L660 585 H960 L1000 625 H1200" stroke="#CBD5E1" strokeWidth="1.35" />
            <circle cx="620" cy="625" r="4" fill="#FFFFFF" stroke="#30343B" strokeOpacity="0.22" strokeWidth="1.3" />
            <circle cx="960" cy="585" r="4" fill="#FFFFFF" stroke="#30343B" strokeOpacity="0.22" strokeWidth="1.3" />
          </svg>
        </>
      )}

      {variant === 'robotics' && (
        <>
          {/* Minimal 6-DOF Articulated Robotic Arm & Precision Kinematic Blueprint */}
          <svg
            viewBox="0 0 820 760"
            fill="none"
            className="absolute -right-10 top-4 w-[660px] h-[640px]"
          >
            {/* Soft Ash Kinematic Discs */}
            <circle cx="480" cy="275" r="195" fill="#F3F4F6" fillOpacity="0.78" />
            <circle cx="480" cy="275" r="245" stroke="#CBD5E1" strokeWidth="1.2" strokeDasharray="6 6" />
            <circle cx="480" cy="275" r="145" stroke="#E5E7EB" strokeWidth="1.2" />

            {/* Robotic Manipulator Line-Art */}
            <g stroke="#30343B" strokeOpacity="0.22" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">
              {/* Pedestal Base */}
              <path d="M295 495 H395" />
              <rect x="315" y="472" width="60" height="23" rx="5" fill="#FFFFFF" />
              {/* Lower & Upper Arm Segments */}
              <line x1="345" y1="472" x2="455" y2="295" />
              <line x1="455" y1="295" x2="605" y2="215" />
              <line x1="605" y1="215" x2="652" y2="245" />
              {/* Precision Gripper Jaws */}
              <path d="M652 245 L678 232 L696 244" />
              <path d="M652 245 L668 272 L688 268" />
              {/* Servo Joint Rings */}
              <circle cx="345" cy="472" r="13" fill="#FFFFFF" />
              <circle cx="455" cy="295" r="15" fill="#FFFFFF" />
              <circle cx="605" cy="215" r="10" fill="#FFFFFF" />
              <circle cx="455" cy="295" r="4.5" fill="#30343B" fillOpacity="0.25" />
            </g>

            {/* Coordinate Drafting Ticks */}
            <line x1="205" y1="275" x2="730" y2="275" stroke="#CBD5E1" strokeWidth="1" />
            <line x1="455" y1="45" x2="455" y2="535" stroke="#CBD5E1" strokeWidth="1" />
          </svg>

          {/* Subtle Left-Edge Actuator Gear & Trace */}
          <svg
            viewBox="0 0 260 260"
            fill="none"
            className="absolute -left-10 bottom-12 w-[220px] h-[220px]"
          >
            <circle cx="90" cy="140" r="66" fill="#F3F4F6" fillOpacity="0.7" />
            <circle cx="90" cy="140" r="42" stroke="#30343B" strokeOpacity="0.18" strokeWidth="1.5" strokeDasharray="8 6" />
            <circle cx="90" cy="140" r="18" fill="#FFFFFF" stroke="#30343B" strokeOpacity="0.2" strokeWidth="1.4" />
            <path d="M132 140 H230" stroke="#CBD5E1" strokeWidth="1.3" />
            <circle cx="230" cy="140" r="3.5" fill="#FFFFFF" stroke="#30343B" strokeOpacity="0.22" />
          </svg>
        </>
      )}

      {variant === 'cyber-network' && (
        <>
          {/* Cybersecurity Shield, Padlock & Connected Digital Network Mesh */}
          <svg
            viewBox="0 0 1200 720"
            fill="none"
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Soft Ash Geometric Backdrop Hex */}
            <polygon
              points="1005,40 1125,110 1125,250 1005,320 885,250 885,110"
              fill="#F3F4F6"
              fillOpacity="0.9"
            />
            <circle cx="135" cy="540" r="130" fill="#F3F4F6" fillOpacity="0.78" />

            {/* Top-Right Cybersecurity Shield + Lock Line-Art */}
            <g transform="translate(915 72)" stroke="#30343B" strokeOpacity="0.22" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon
                points="90,8 162,50 162,134 90,176 18,134 18,50"
                stroke="#CBD5E1"
                strokeWidth="1.25"
                strokeDasharray="5 4"
              />
              {/* Security Shield */}
              <path
                d="M90 38 L136 56 V96 C136 125 116 144 90 154 C64 144 44 125 44 96 V56 Z"
                fill="#FFFFFF"
                fillOpacity="0.9"
              />
              {/* Padlock inside Shield */}
              <rect x="74" y="88" width="32" height="26" rx="5" />
              <path d="M81 88 V79 C81 74 85 70 90 70 C95 70 99 74 99 79 V88" />
              <circle cx="90" cy="101" r="2.5" fill="#30343B" fillOpacity="0.3" />
            </g>

            {/* Left Connected Digital Network Mesh */}
            <g stroke="#30343B" strokeOpacity="0.17" strokeWidth="1.25">
              <line x1="48" y1="215" x2="155" y2="170" />
              <line x1="155" y1="170" x2="230" y2="275" />
              <line x1="48" y1="215" x2="130" y2="345" />
              <line x1="130" y1="345" x2="230" y2="275" />
              <line x1="130" y1="345" x2="82" y2="495" />
              <line x1="82" y1="495" x2="205" y2="565" />
              <line x1="205" y1="565" x2="285" y2="450" />
              <line x1="130" y1="345" x2="285" y2="450" />
            </g>
            {[
              [48, 215],
              [155, 170],
              [230, 275],
              [130, 345],
              [82, 495],
              [205, 565],
              [285, 450],
            ].map(([cx, cy], idx) => (
              <g key={idx}>
                <circle
                  cx={cx}
                  cy={cy}
                  r="8"
                  fill="#FFFFFF"
                  stroke="#30343B"
                  strokeOpacity="0.22"
                  strokeWidth="1.3"
                />
                <circle cx={cx} cy={cy} r="2.5" fill="#30343B" fillOpacity="0.25" />
              </g>
            ))}
          </svg>
        </>
      )}

      {variant === 'blockchain' && (
        <>
          {/* Futuristic Isometric Blockchain Ledger & Connected Hash Nodes */}
          <svg
            viewBox="0 0 920 560"
            fill="none"
            className="absolute right-0 top-0 w-[680px] h-[440px]"
          >
            <circle cx="640" cy="160" r="155" fill="#F3F4F6" fillOpacity="0.72" />
            {/* Hash Chain Bus */}
            <path
              d="M270 155 L405 92 L545 155 L685 92 L810 155"
              stroke="#30343B"
              strokeOpacity="0.18"
              strokeWidth="1.4"
              strokeDasharray="5 4"
            />
            <path d="M405 230 L545 292 L685 230" stroke="#CBD5E1" strokeWidth="1.35" />

            {/* Isometric Cube Chain */}
            {[
              { x: 270, y: 155 },
              { x: 405, y: 92 },
              { x: 545, y: 155 },
              { x: 685, y: 92 },
              { x: 545, y: 292 },
            ].map((b, i) => (
              <g
                key={i}
                transform={`translate(${b.x} ${b.y})`}
                stroke="#30343B"
                strokeOpacity="0.22"
                strokeWidth="1.35"
              >
                <polygon points="0,-30 30,-15 0,0 -30,-15" fill="#FFFFFF" />
                <polygon points="-30,-15 0,0 0,32 -30,17" fill="#F3F4F6" />
                <polygon points="30,-15 0,0 0,32 30,17" fill="#E5E7EB" fillOpacity="0.7" />
              </g>
            ))}
          </svg>

          {/* Bottom-Left Subtle Circuit Ledger Connection */}
          <svg
            viewBox="0 0 420 220"
            fill="none"
            className="absolute left-0 bottom-0 w-[340px] h-[180px]"
          >
            <path d="M0 145 H140 L178 107 H295" stroke="#CBD5E1" strokeWidth="1.4" />
            <circle cx="140" cy="145" r="4" fill="#FFFFFF" stroke="#30343B" strokeOpacity="0.22" strokeWidth="1.3" />
            <circle cx="295" cy="107" r="5" fill="#FFFFFF" stroke="#30343B" strokeOpacity="0.24" strokeWidth="1.4" />
          </svg>
        </>
      )}

      {variant === 'uav-telemetry' && (
        <>
          {/* Drone Flight Vector Trajectory, Minimal UAV Blueprint & LiDAR Radar Sweep */}
          <svg
            viewBox="0 0 1200 720"
            fill="none"
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="xMidYMid slice"
          >
            <circle cx="1010" cy="520" r="165" fill="#F3F4F6" fillOpacity="0.85" />
            <circle cx="670" cy="175" r="105" fill="#F3F4F6" fillOpacity="0.7" />

            {/* Autonomous Flight Waypoint Path */}
            <path
              d="M-30 500 C210 425 360 155 670 175 C900 190 1020 90 1230 115"
              stroke="#30343B"
              strokeOpacity="0.18"
              strokeWidth="1.5"
              strokeDasharray="6 6"
            />
            {[
              [225, 392],
              [670, 175],
              [995, 130],
            ].map(([cx, cy], idx) => (
              <g key={idx}>
                <circle cx={cx} cy={cy} r="16" stroke="#CBD5E1" strokeWidth="1.2" />
                <circle
                  cx={cx}
                  cy={cy}
                  r="4.5"
                  fill="#FFFFFF"
                  stroke="#30343B"
                  strokeOpacity="0.24"
                  strokeWidth="1.35"
                />
              </g>
            ))}

            {/* Minimal Drone Top-Down Silhouette on Flight Path */}
            <g transform="translate(670 175) rotate(-12)" stroke="#30343B" strokeOpacity="0.24" strokeWidth="1.4">
              <line x1="-26" y1="-26" x2="26" y2="26" />
              <line x1="-26" y1="26" x2="26" y2="-26" />
              <rect x="-8" y="-12" width="16" height="24" rx="5" fill="#FFFFFF" />
              <circle cx="-26" cy="-26" r="13" strokeDasharray="3 3" />
              <circle cx="26" cy="-26" r="13" strokeDasharray="3 3" />
              <circle cx="-26" cy="26" r="13" strokeDasharray="3 3" />
              <circle cx="26" cy="26" r="13" strokeDasharray="3 3" />
            </g>

            {/* Bottom-Right LiDAR / Optical Range Crosshair */}
            <g transform="translate(1010 520)" stroke="#30343B" strokeOpacity="0.2" strokeWidth="1.25">
              <circle cx="0" cy="0" r="120" strokeDasharray="4 5" />
              <circle cx="0" cy="0" r="76" />
              <circle cx="0" cy="0" r="30" />
              <line x1="-140" y1="0" x2="140" y2="0" stroke="#CBD5E1" />
              <line x1="0" y1="-140" x2="0" y2="140" stroke="#CBD5E1" />
            </g>
          </svg>
        </>
      )}

      {variant === 'coding-lab' && (
        <>
          {/* Software Coding Symbols, IDE Window Line-Art & Embedded Hardware Traces */}
          <svg
            viewBox="0 0 1200 720"
            fill="none"
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Soft Ash Geometric Card Shapes */}
            <rect x="860" y="36" width="268" height="170" rx="22" fill="#F3F4F6" fillOpacity="0.82" />
            <circle cx="145" cy="540" r="115" fill="#F3F4F6" fillOpacity="0.72" />

            {/* Upper-Right Clean IDE & Programming Syntax Illustration */}
            <g
              transform="translate(884 54)"
              stroke="#30343B"
              strokeOpacity="0.22"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="0" y="0" width="220" height="134" rx="14" fill="#FFFFFF" fillOpacity="0.92" />
              <line x1="0" y1="30" x2="220" y2="30" stroke="#E5E7EB" />
              <circle cx="18" cy="15" r="3" fill="#30343B" fillOpacity="0.22" stroke="none" />
              <circle cx="30" cy="15" r="3" fill="#30343B" fillOpacity="0.16" stroke="none" />
              <circle cx="42" cy="15" r="3" fill="#30343B" fillOpacity="0.12" stroke="none" />
              {/* < /> Icon */}
              <path d="M46 62 L28 80 L46 98" />
              <path d="M88 62 L106 80 L88 98" />
              <line x1="72" y1="56" x2="62" y2="104" />
              {/* Abstract Code Token Lines */}
              <line x1="126" y1="64" x2="188" y2="64" stroke="#CBD5E1" strokeWidth="2.5" />
              <line x1="126" y1="80" x2="174" y2="80" stroke="#CBD5E1" strokeWidth="2.5" />
              <line x1="126" y1="96" x2="196" y2="96" stroke="#CBD5E1" strokeWidth="2.5" />
            </g>

            {/* Bottom-Left Curly Braces { } & Microcontroller Pin Header Traces */}
            <g transform="translate(42 440)" stroke="#30343B" strokeOpacity="0.2" strokeWidth="1.45">
              <path d="M0 44 H98 L135 81 H228" stroke="#CBD5E1" />
              <path d="M0 74 H78 L115 111 H196" stroke="#CBD5E1" />
              <rect x="228" y="60" width="48" height="44" rx="7" fill="#FFFFFF" />
              <circle cx="242" cy="74" r="2.8" fill="#30343B" fillOpacity="0.26" stroke="none" />
              <circle cx="262" cy="74" r="2.8" fill="#30343B" fillOpacity="0.26" stroke="none" />
              <circle cx="242" cy="90" r="2.8" fill="#30343B" fillOpacity="0.26" stroke="none" />
              <circle cx="262" cy="90" r="2.8" fill="#30343B" fillOpacity="0.26" stroke="none" />
              {/* Subtle { } Coding Symbol */}
              <text
                x="48"
                y="158"
                fill="#30343B"
                fillOpacity="0.18"
                stroke="none"
                fontFamily="monospace"
                fontWeight="700"
                fontSize="26"
              >
                {'{ AI }'}
              </text>
            </g>
          </svg>
        </>
      )}

      {variant === 'cloud-relay' && (
        <>
          {/* Global Cloud Relay Nodes, Orbital Arcs & Data Streams */}
          <svg
            viewBox="0 0 1200 720"
            fill="none"
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="xMidYMid slice"
          >
            <circle cx="985" cy="175" r="155" fill="#F3F4F6" fillOpacity="0.88" />
            {/* Geodetic Orbital Rings */}
            <ellipse
              cx="985"
              cy="175"
              rx="260"
              ry="108"
              transform="rotate(-14 985 175)"
              stroke="#CBD5E1"
              strokeWidth="1.25"
            />
            <ellipse
              cx="985"
              cy="175"
              rx="185"
              ry="74"
              transform="rotate(-14 985 175)"
              stroke="#30343B"
              strokeOpacity="0.17"
              strokeWidth="1.2"
              strokeDasharray="4 5"
            />

            {/* Connected Cloud Nodes */}
            <g stroke="#30343B" strokeOpacity="0.2" strokeWidth="1.3">
              <line x1="775" y1="150" x2="945" y2="115" />
              <line x1="945" y1="115" x2="1095" y2="200" />
              <line x1="945" y1="115" x2="985" y2="262" />
            </g>
            {[
              [775, 150],
              [945, 115],
              [1095, 200],
              [985, 262],
            ].map(([cx, cy], idx) => (
              <g key={idx}>
                <circle
                  cx={cx}
                  cy={cy}
                  r="8"
                  fill="#FFFFFF"
                  stroke="#30343B"
                  strokeOpacity="0.24"
                  strokeWidth="1.35"
                />
                <circle cx={cx} cy={cy} r="2.8" fill="#30343B" fillOpacity="0.26" />
              </g>
            ))}

            {/* Bottom-Left Circuit Bus */}
            <path d="M0 645 H185 L220 610 H360" stroke="#CBD5E1" strokeWidth="1.4" />
            <circle
              cx="360"
              cy="610"
              r="4.5"
              fill="#FFFFFF"
              stroke="#30343B"
              strokeOpacity="0.24"
              strokeWidth="1.35"
            />
          </svg>
        </>
      )}

      {variant === 'footer' && (
        <>
          {/* Minimal Pure White Footer Circuit Terminal Traces */}
          <svg
            viewBox="0 0 1200 160"
            fill="none"
            className="absolute inset-x-0 top-0 w-full h-36"
            preserveAspectRatio="none"
          >
            <path d="M48 0 V30 L78 60 H280" stroke="#CBD5E1" strokeWidth="1.25" />
            <circle cx="280" cy="60" r="4" fill="#FFFFFF" stroke="#30343B" strokeOpacity="0.22" strokeWidth="1.25" />
            <path d="M1152 0 V30 L1122 60 H920" stroke="#CBD5E1" strokeWidth="1.25" />
            <circle cx="920" cy="60" r="4" fill="#FFFFFF" stroke="#30343B" strokeOpacity="0.22" strokeWidth="1.25" />
          </svg>
        </>
      )}
    </div>
  );
};
