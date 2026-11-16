export interface TechnologyCard {
  id: string;
  title: string;
  tagline: string;
  description: string;
  imageUrl: string;
  altText: string;
  keyTopics: string[];
  applications: string[];
}

export interface BusinessPillar {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  bullets: string[];
  capabilities: string[];
}

export interface ProjectShowcase {
  id: string;
  title: string;
  domain: string;
  imageUrl: string;
  altText: string;
  overview: string;
  stack: string[];
  focus: string;
}

export interface WorkshopTrack {
  id: string;
  title: string;
  level: string;
  duration: string;
  format: string;
  description: string;
  hardwareTools: string[];
}

export const STARTUP_INFO = {
  name: 'MARVZ & INNOVATION TECH',
  tagline: 'Think Beyond. Build Tomorrow.',
  heroHeadline: 'Building Tomorrow Through Technology.',
  heroDescription:
    'MARVZ & INNOVATION TECH explores emerging technologies, develops technical capabilities, and transforms innovative ideas into practical solutions.',
  personality: [
    'Futuristic',
    'Innovative',
    'Minimalist',
    'Professional',
    'Youth-driven',
    'Research-oriented',
    'Globally competitive'
  ]
};

// 6 Core Technology Cards backed by bespoke White & Ash studio technology imagery
export const CORE_TECHNOLOGIES: TechnologyCard[] = [
  {
    id: 'ai-ml',
    title: 'AI & Machine Learning',
    tagline: 'Applied Intelligence & Neural Modeling',
    description:
      'Developing neural network architectures, computer vision pipelines, natural language models, and practical AI automation that solve real problems.',
    imageUrl: '/assets/tech/ai-workstation.jpg',
    altText: 'Dual-display AI engineering workstation displaying neural network graphs and code',
    keyTopics: ['Neural Networks & Deep Learning', 'Computer Vision & Inspection', 'Generative AI & LLM Systems', 'Predictive Analytics'],
    applications: ['Automated visual inspection', 'Agentic workflow automation', 'Predictive industrial maintenance']
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity & Defense',
    tagline: 'Digital Resilience & Threat Defense',
    description:
      'Safeguarding networks, operating systems, and connected architectures through penetration testing, protocol inspection, and zero-trust security.',
    imageUrl: '/assets/tech/cyber-rack.jpg',
    altText: 'Enterprise cybersecurity network appliance and fiber-optic patch panel on laboratory bench',
    keyTopics: ['Ethical Hacking & Penetration Testing', 'Network Protocol Hardening', 'Zero-Trust Architecture', 'Security Audits'],
    applications: ['Penetration testing audits', 'Secure API gateway design', 'Hardware and firmware vulnerability testing']
  },
  {
    id: 'drone-tech',
    title: 'Drone Engineering & UAVs',
    tagline: 'Aerodynamics & Autonomous Avionics',
    description:
      'Designing, building, and programming multi-rotor and fixed-wing UAVs with custom flight controllers, telemetry links, and payload integration.',
    imageUrl: '/assets/tech/uav-prototype.jpg',
    altText: 'Autonomous carbon-fiber quadcopter UAV with LiDAR optical gimbal on white calibration pad',
    keyTopics: ['UAV Frame Assembly & Aerodynamics', 'PX4 & ArduPilot Flight Controllers', 'Telemetry & Sensor Fusion', 'Autonomous Mission Planning'],
    applications: ['Agricultural crop health mapping', 'Infrastructure inspection', 'Autonomous delivery prototypes']
  },
  {
    id: 'robotics',
    title: 'Robotics & Automation',
    tagline: 'Kinematics & Industrial Mechatronics',
    description:
      'Bridging code and physical movement with multi-axis articulated arms, motor drives, microcontrollers, and collaborative automation systems.',
    imageUrl: '/assets/tech/robotics-arm.jpg',
    altText: 'Brushed aluminum 6-axis articulated robotic arm inspecting an electronic PCB module',
    keyTopics: ['Articulated Manipulators & Kinematics', 'Embedded Microcontrollers (STM32/ESP32)', 'Motor Drivers & Closed-Loop Control', 'ROS 2 Framework'],
    applications: ['Automated pick-and-place lines', 'Inspection and sorting robotics', 'Custom mechatronic test fixtures']
  },
  {
    id: 'iot',
    title: 'IoT & Smart Systems',
    tagline: 'Sensors, Firmware & Connected Nodes',
    description:
      'Connecting physical environments through low-power sensor nodes, wireless telemetry (LoRa, MQTT, BLE), and real-time cloud data pipelines.',
    imageUrl: '/assets/tech/iot-pcb.jpg',
    altText: 'Custom matte-charcoal embedded IoT circuit board with microcontroller die and RF antenna',
    keyTopics: ['Embedded C/C++ Firmware', 'LoRaWAN, MQTT & Zigbee Networks', 'Low-Power Node Optimization', 'Sensor Signal Conditioning'],
    applications: ['Remote environmental telemetry', 'Industrial smart monitoring', 'Energy optimization sensors']
  },
  {
    id: 'software',
    title: 'Software Engineering',
    tagline: 'High-Concurrency & Cloud Systems',
    description:
      'Engineering robust, scalable software across modern full-stack web architectures, distributed backends, mobile solutions, and cloud pipelines.',
    imageUrl: '/assets/tech/hero-ai-lab.jpg',
    altText: 'Modern R&D engineering lab bench with edge AI compute unit, oscilloscope, and drone hardware',
    keyTopics: ['Modern TypeScript & React Ecosystems', 'Distributed Node.js & Go Backends', 'Relational & Time-Series Databases', 'DevOps & Containerization'],
    applications: ['High-throughput telemetry dashboards', 'Hardware control interfaces', 'Cloud SaaS infrastructure']
  }
];

// 3 Main Business Pillars
export const BUSINESS_PILLARS: BusinessPillar[] = [
  {
    number: '01',
    title: 'Technology Education',
    subtitle: 'Hands-on skill building on real hardware',
    description:
      'Professional training, immersive practical workshops, and industry-oriented skill development designed to prepare students and engineers for emerging fields.',
    bullets: [
      'Hardware-integrated laboratory experience',
      'Direct mentorship from practicing engineers',
      'Project-based capstone deployments',
      'No theoretical fluff—real code, real circuits, real flights'
    ],
    capabilities: ['Drone Assembly & Calibration', 'Robotics Kinematics with ROS', 'Deep Learning Implementation', 'Offensive Cyber Drills']
  },
  {
    number: '02',
    title: 'Engineering & Development',
    subtitle: 'Turning innovative concepts into physical reality',
    description:
      'Custom prototyping and product development spanning unmanned aerial systems, robotics, firmware automation, scalable software platforms, and IoT networks.',
    bullets: [
      'Rapid hardware prototyping and testing',
      'Custom avionics and motor test validation',
      'End-to-end cloud and mobile integration',
      'Rigorous quality and bench verification'
    ],
    capabilities: ['Custom UAV Fabrication', 'Robotic Sorter Engineering', 'Sensor Network Gateways', 'Production Web Platforms']
  },
  {
    number: '03',
    title: 'Research & Innovation',
    subtitle: 'Exploring the edge of emerging technologies',
    description:
      'Active experimentation, applied technology exploration, and collaborative project development bridging academic discovery and market implementation.',
    bullets: [
      'Autonomous flight swarm research',
      'Quantized edge neural inference',
      'Zero-trust hardware network verification',
      'Open collaboration with universities and labs'
    ],
    capabilities: ['Edge AI Quantization', 'Decentralized Drone Swarms', 'Hardware Security Auditing', 'Open-Source Tooling']
  }
];

// Innovation in Action Showcase
export const PROJECT_SHOWCASE: ProjectShowcase[] = [
  {
    id: 'proj-drone-inspection',
    title: 'Autonomous Industrial Inspection UAV',
    domain: 'Drone Engineering',
    imageUrl: '/assets/tech/uav-prototype.jpg',
    altText: 'Autonomous carbon-fiber quadcopter UAV with LiDAR optical gimbal on white calibration pad',
    overview:
      'Custom-engineered multi-rotor drone carrying high-definition inspection cameras with programmed waypoint navigation and fail-safe return-to-base protocols.',
    stack: ['Carbon Composite Frame', 'PX4 Autopilot', 'Telemetry 915MHz', 'LiPo 6S Battery System'],
    focus: 'Flight endurance, payload stability, and automated perimeter inspection.'
  },
  {
    id: 'proj-robotics-arm',
    title: 'Multi-Axis Articulated Assembly Arm',
    domain: 'Robotics & Automation',
    imageUrl: '/assets/tech/robotics-arm.jpg',
    altText: 'Brushed aluminum 6-axis articulated robotic arm inspecting an electronic PCB module',
    overview:
      'Robotic arm prototype engineered for micro-component positioning, combining optical feedback with sub-millimeter motor drive repeatability.',
    stack: ['Brushless Servo Actuators', 'FreeRTOS', 'CAN Bus Protocol', 'OpenCV Vision Feed'],
    focus: 'Closed-loop motion control and repeatable mechanical accuracy.'
  },
  {
    id: 'proj-edge-iot',
    title: 'Distributed Environmental Sensor Node',
    domain: 'IoT & Smart Systems',
    imageUrl: '/assets/tech/iot-pcb.jpg',
    altText: 'Custom embedded IoT printed circuit board with silicon microcontroller die and RF antenna',
    overview:
      'Low-power sensor telemetry node measuring atmospheric and structural parameters, sending encrypted packets via long-range wireless links.',
    stack: ['ESP32 Microcontroller', 'LoRaWAN Transceiver', 'Solar Energy Harvesting', 'MQTT Pipeline'],
    focus: 'Ultra-low sleep current draw and multi-kilometer wireless transmission.'
  },
  {
    id: 'proj-cyber-defense',
    title: 'Zero-Trust Protocol Sandboxing Suite',
    domain: 'Cybersecurity',
    imageUrl: '/assets/tech/cyber-rack.jpg',
    altText: 'Enterprise brushed aluminum cybersecurity network appliance and fiber-optic patch panel',
    overview:
      'Virtual testing architecture for simulating network intrusions, analyzing malicious payloads, and testing cryptographic key rotation.',
    stack: ['Linux Kernel eBPF', 'WireGuard mTLS', 'Packet Inspection', 'Sandboxed VMs'],
    focus: 'Lateral threat containment and continuous device verification.'
  }
];

// Workshop Tracks (Learn. Experiment. Innovate.)
export const WORKSHOP_TRACKS: WorkshopTrack[] = [
  {
    id: 'drone-build-camp',
    title: 'Hands-on Drone Assembly & Flight Calibration',
    level: 'Beginner to Intermediate',
    duration: '3-Day Intensive Workshop',
    format: 'Physical Lab Sessions',
    description:
      'Assemble a multi-rotor quadcopter from frame to props. Solder ESCs, configure flight controllers via QGroundControl, and conduct test flights on dedicated grounds.',
    hardwareTools: ['Soldering Stations', 'Multimeters & Oscilloscopes', 'Carbon Frames', 'Thrust Test Rigs']
  },
  {
    id: 'robotics-ros-lab',
    title: 'Embedded Robotics & Microcontroller Programming',
    level: 'Intermediate',
    duration: '4-Week Weekend Lab',
    format: 'Hands-on Hardware Lab',
    description:
      'Program motor drivers, read encoder feedback, and implement inverse kinematics on articulated arms using C++ and modern microcontroller boards.',
    hardwareTools: ['ESP32 & STM32 Development Boards', 'Logic Analyzers', 'Stepper Motors & Servos', 'Breadboard Prototyping']
  },
  {
    id: 'ai-vision-practical',
    title: 'Applied Computer Vision & Edge AI Deployment',
    level: 'Intermediate to Advanced',
    duration: '2-Day Sprint',
    format: 'Lab + Compute Workstation',
    description:
      'Train lightweight convolutional models for object detection and deploy them onto physical edge hardware accelerators with real-time video feeds.',
    hardwareTools: ['Edge AI Accelerators', 'High-Res Optical Sensors', 'Python & PyTorch Environments', 'Inference Benchmarks']
  },
  {
    id: 'cyber-sandbox-lab',
    title: 'Hands-On Network Defense & Ethical Hacking',
    level: 'Intermediate',
    duration: 'Weekend Intensive',
    format: 'Sandboxed Cyber Range',
    description:
      'Learn penetration testing methodologies, analyze Wireshark packet captures, identify OWASP vulnerabilities, and engineer defensive mitigations.',
    hardwareTools: ['Isolated Cyber Range', 'Hardware Protocol Analyzers', 'Linux CLI Environments', 'Security Tooling']
  }
];

// Collaboration Models
export const COLLABORATION_MODELS = [
  {
    title: 'For Students & Builders',
    tag: 'Learn & Create',
    desc: 'Gain practical hardware experience, access our testing equipment, and build portfolio-worthy engineering capstones.'
  },
  {
    title: 'For Universities & Colleges',
    tag: 'STEM & Labs',
    desc: 'Partner with us for specialized workshops, guest engineering masterclasses, and hands-on drone and robotics labs.'
  },
  {
    title: 'For Startups & Innovators',
    tag: 'Prototyping & R&D',
    desc: 'Leverage our engineering capabilities for rapid hardware prototyping, proof-of-concept testing, and firmware development.'
  },
  {
    title: 'For Industry & Enterprises',
    tag: 'Upskilling & Solutions',
    desc: 'Equip your engineering workforce with emerging tech capabilities or collaborate on exploratory technology proofs.'
  }
];

export const FAQS = [
  {
    q: 'What is MARVZ & INNOVATION TECH?',
    a: 'We are an emerging technology startup operating at the intersection of hands-on technology education, engineering development, and applied research. We focus on drones, robotics, AI, cybersecurity, and IoT.'
  },
  {
    q: 'How does your hands-on approach differ from traditional institutes?',
    a: 'We do not focus on slides or theoretical lectures. Every workshop and program takes place on physical hardware—assembling real drones, programming actual robotic arms, flashing microcontrollers, and analyzing live network packets.'
  },
  {
    q: 'Can organizations or colleges host workshops with you?',
    a: 'Yes. We partner with educational institutions, colleges, and company engineering teams to deliver customized technical bootcamps, hardware hack days, and emerging technology workshops.'
  },
  {
    q: 'Do you develop custom technology solutions or prototypes?',
    a: 'Yes. Through our Engineering & Development pillar, we work with innovators and teams to build functional prototypes in drone avionics, embedded IoT, and automated robotics.'
  },
  {
    q: 'How can I join an upcoming workshop or collaborate?',
    a: 'You can submit an inquiry through our website contact form or connect directly with our advisory desk via WhatsApp. We will help you select the right track or discuss partnership terms.'
  }
];
