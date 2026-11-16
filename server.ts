import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Allow JSON payloads up to 15MB for document & image uploads
app.use(express.json({ limit: '15mb' }));

// Ensure data & uploads directories exist
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

const DB_FILE = path.join(DATA_DIR, 'admin_store.json');

// --- Security Helpers (Salted Scrypt Password Hashing) ---
function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const usedSalt = salt || crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, usedSalt, 64).toString('hex');
  return { hash: derived, salt: usedSalt };
}

function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  try {
    const derived = crypto.scryptSync(password, salt, 64);
    const storedBuf = Buffer.from(storedHash, 'hex');
    if (derived.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(derived, storedBuf);
  } catch {
    return false;
  }
}

// --- Domain Types ---
type LeadStatus = 'New' | 'Contacted' | 'Interested' | 'Converted';
type AdminRole =
  | 'Super Admin'
  | 'Content Manager'
  | 'HR & Training Coordinator'
  | 'Knowledge Editor'
  | 'Support Agent';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: 'Services' | 'Training' | 'Internships' | 'Consulting' | 'Partnerships' | 'Other';
  requirements: string;
  timestamp: string;
  status: LeadStatus;
  source: 'Chatbot' | 'Direct Form' | 'Human Escalation' | 'Manual Admin';
  adminNotes?: string;
  estimatedValue?: string;
}

interface FAQItem {
  id: string;
  question: string;
  questionBn?: string;
  answer: string;
  answerBn?: string;
  category:
    | 'AI'
    | 'Software'
    | 'Robotics'
    | 'Drones'
    | 'Cybersecurity'
    | 'Training'
    | 'Internships'
    | 'Contact'
    | 'Custom';
  tags: string[];
  hitCount: number;
  isPublished: boolean;
  updatedAt: string;
  source?: 'Manual' | 'Document' | 'TrainingCenter';
}

interface UnansweredQuestion {
  id: string;
  question: string;
  visitorLanguage: 'English' | 'Bangla' | 'Banglish';
  askedAt: string;
  conversationId: string;
  status: 'Pending Review' | 'Answered' | 'Dismissed';
  suggestedAnswer?: string;
  reviewedBy?: string;
}

interface IngestedDocument {
  id: string;
  name: string;
  fileType: 'pdf' | 'docx' | 'txt';
  fileSize: string;
  uploadedAt: string;
  category: string;
  status: 'Indexed' | 'Processing' | 'Failed';
  extractedText: string;
  chunkCount: number;
}

interface ChatMessage {
  id: string;
  sender: 'visitor' | 'bot' | 'agent';
  agentName?: string;
  text: string;
  timestamp: string;
  language?: 'English' | 'Bangla' | 'Banglish';
  flagHuman?: boolean;
}

interface ConversationThread {
  id: string;
  visitorId: string;
  visitorName: string;
  visitorEmail?: string;
  visitorPhone?: string;
  visitorLanguage: 'English' | 'Bangla' | 'Banglish';
  status: 'Bot Handling' | 'Needs Human Support' | 'Human Joined' | 'Resolved';
  lastActivity: string;
  createdAt: string;
  messages: ChatMessage[];
  unreadAdminCount: number;
}

interface ControlCenterSettings {
  chatbotName: string;
  welcomeMessage: string;
  welcomeMessageBn?: string;
  brandPrimaryColor: string;
  brandAccentColor: string;
  brandTheme: 'Dark Obsidian' | 'Midnight Navy' | 'High Contrast';
  enableBangla: boolean;
  enableEnglish: boolean;
  defaultLanguage: 'Auto' | 'English' | 'Bangla';
  aiModel: string;
  temperature: number;
  enableLeadFormPrompt: boolean;
  enableHumanEscalation: boolean;
  enableQuickReplies: boolean;
  enableVoiceInput: boolean;
  systemInstructionOverride?: string;
  contactEmail: string;
  contactPhone: string;
  contactWhatsApp: string;
  officeLocation: string;
}

interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  phone?: string;
  department?: string;
  passwordHash: string;
  passwordSalt: string;
  isActive: boolean;
  lastLogin: string;
}

interface AdminSession {
  token: string;
  userId: string;
  email: string;
  role: AdminRole;
  createdAt: string;
  expiresAt: string;
}

interface WebsiteServiceItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  imageUrl: string;
  altText: string;
  keyTopics: string[];
  applications: string[];
}

interface UploadedMediaAsset {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: string;
  uploadedAt: string;
}

interface WebsiteContentConfig {
  heroHeadline: string;
  heroHighlight: string;
  heroTagline: string;
  heroDescription: string;
  heroImageUrl: string;
  heroSecondaryImageUrl: string;
  announcementEnabled: boolean;
  announcementText: string;
  aboutHeading: string;
  aboutSubheading: string;
  aboutDescription: string;
  aboutImageUrl: string;
  services: WebsiteServiceItem[];
  uploadedAssets: UploadedMediaAsset[];
  updatedAt: string;
}

interface LocationConfig {
  officeName: string;
  officeAddress: string;
  landmarkNote: string;
  cityCountry: string;
  contactPhone: string;
  contactWhatsApp: string;
  contactEmail: string;
  workingHours: string;
  mapSearchQuery: string;
  googleMapsUrl: string;
  directionsUrl: string;
  customLat?: number;
  customLng?: number;
  updatedAt: string;
}

interface InternshipApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  university: string;
  department: string;
  semesterOrYear: string;
  track: string;
  portfolioUrl?: string;
  resumeFileName?: string;
  resumeUrl?: string;
  coverNote: string;
  status: 'Pending' | 'Under Review' | 'Approved' | 'Rejected';
  adminNotes?: string;
  appliedAt: string;
}

interface TrainingProgram {
  id: string;
  title: string;
  level: string;
  duration: string;
  format: string;
  price: number;
  currency: 'BDT' | 'USD';
  seatsTotal: number;
  seatsAvailable: number;
  status: 'Open' | 'Upcoming' | 'Closed';
  nextBatchDate: string;
  description: string;
  hardwareTools: string[];
}

interface TrainingRegistration {
  id: string;
  programId: string;
  programTitle: string;
  studentName: string;
  email: string;
  phone: string;
  organization: string;
  experienceLevel: string;
  feeAmount: number;
  currency: 'BDT' | 'USD';
  paymentStatus: 'Pending' | 'Paid' | 'Partial' | 'Refunded';
  paymentMethod: 'bKash' | 'Nagad' | 'Bank Transfer' | 'Card' | 'Cash at Office';
  transactionId: string;
  registrationStatus: 'Confirmed' | 'Pending Verification' | 'Waitlisted' | 'Cancelled';
  adminNotes?: string;
  registeredAt: string;
}

interface ContactMessage {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  collaboratorType: string;
  technologyDomain: string;
  subject: string;
  message: string;
  status: 'New' | 'In Progress' | 'Replied' | 'Resolved';
  replies: Array<{ id: string; senderName: string; message: string; sentAt: string }>;
  createdAt: string;
}

interface ActivityLogItem {
  id: string;
  type: 'inquiry' | 'internship' | 'training' | 'content' | 'location' | 'auth' | 'chatbot';
  title: string;
  description: string;
  actor: string;
  timestamp: string;
}

// --- Seed Defaults ---
const OFFICIAL_OFFICE_ADDRESS =
  '3rd Floor, House No. 756, Aysha Tower, West Shewrapara, Near Metro Pillar 304, Dhaka-1216, Bangladesh.';
const OFFICIAL_MAP_QUERY =
  'Aysha Tower, House No. 756, West Shewrapara, Near Metro Pillar 304, Dhaka-1216, Bangladesh';

const DEFAULT_SETTINGS: ControlCenterSettings = {
  chatbotName: 'MARVZ AI Assistant',
  welcomeMessage: 'Hello! Welcome to MARVZ & INNOVATION TECH. How can I assist you today?',
  welcomeMessageBn:
    'হ্যালো! MARVZ & INNOVATION TECH-এ আপনাকে স্বাগতম। আজ আপনাকে কীভাবে সাহায্য করতে পারি?',
  brandPrimaryColor: '#DC2626',
  brandAccentColor: '#EF4444',
  brandTheme: 'Dark Obsidian',
  enableBangla: true,
  enableEnglish: true,
  defaultLanguage: 'Auto',
  aiModel: 'gemini-3.1-flash-lite',
  temperature: 0.65,
  enableLeadFormPrompt: true,
  enableHumanEscalation: true,
  enableQuickReplies: true,
  enableVoiceInput: true,
  contactEmail: 'hello@marvztech.com',
  contactPhone: '+880 1800-627898',
  contactWhatsApp: '+880 1711-000000',
  officeLocation: OFFICIAL_OFFICE_ADDRESS,
};

const DEFAULT_LOCATION: LocationConfig = {
  officeName: 'MARVZ & INNOVATION TECH — Dhaka HQ',
  officeAddress: OFFICIAL_OFFICE_ADDRESS,
  landmarkNote: 'Near Metro Pillar 304, West Shewrapara, Mirpur Corridor',
  cityCountry: 'Dhaka-1216, Bangladesh',
  contactPhone: '+880 1800-627898',
  contactWhatsApp: '+880 1711-000000',
  contactEmail: 'hello@marvztech.com',
  workingHours: 'Saturday – Thursday: 09:30 AM – 06:30 PM (BST)',
  mapSearchQuery: OFFICIAL_MAP_QUERY,
  googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(OFFICIAL_MAP_QUERY)}`,
  directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(OFFICIAL_MAP_QUERY)}`,
  updatedAt: new Date().toISOString(),
};

const DEFAULT_WEBSITE_CONTENT: WebsiteContentConfig = {
  heroHeadline: 'Building Tomorrow',
  heroHighlight: 'Through Technology.',
  heroTagline: 'Think Beyond. Build Tomorrow.',
  heroDescription:
    'MARVZ & INNOVATION TECH explores emerging technologies, develops technical capabilities, and transforms innovative ideas into practical solutions.',
  heroImageUrl: '/assets/tech/hero-ai-lab.jpg',
  heroSecondaryImageUrl: '/assets/tech/uav-prototype.jpg',
  announcementEnabled: false,
  announcementText: '',
  aboutHeading: 'Who We Are',
  aboutSubheading: 'Pioneering Emerging Technologies with a Fresh, Hands-On Approach',
  aboutDescription:
    'MARVZ & INNOVATION TECH is an emerging technology startup dedicated to exploring next-generation technologies, delivering practical engineering education, and building practical technology-driven solutions.',
  aboutImageUrl: '/assets/tech/robotics-arm.jpg',
  services: [
    {
      id: 'ai-ml',
      title: 'AI & Machine Learning',
      tagline: 'Applied Intelligence & Neural Modeling',
      description:
        'Developing neural network architectures, computer vision pipelines, natural language models, and practical AI automation that solve real problems.',
      imageUrl: '/assets/tech/ai-workstation.jpg',
      altText: 'Dual-display AI engineering workstation displaying neural network graphs and code',
      keyTopics: [
        'Neural Networks & Deep Learning',
        'Computer Vision & Inspection',
        'Generative AI & LLM Systems',
        'Predictive Analytics',
      ],
      applications: [
        'Automated visual inspection',
        'Agentic workflow automation',
        'Predictive industrial maintenance',
      ],
    },
    {
      id: 'cybersecurity',
      title: 'Cybersecurity & Defense',
      tagline: 'Digital Resilience & Threat Defense',
      description:
        'Safeguarding networks, operating systems, and connected architectures through penetration testing, protocol inspection, and zero-trust security.',
      imageUrl: '/assets/tech/cyber-rack.jpg',
      altText: 'Enterprise cybersecurity network appliance and fiber-optic patch panel on laboratory bench',
      keyTopics: [
        'Ethical Hacking & Penetration Testing',
        'Network Protocol Hardening',
        'Zero-Trust Architecture',
        'Security Audits',
      ],
      applications: [
        'Penetration testing audits',
        'Secure API gateway design',
        'Hardware and firmware vulnerability testing',
      ],
    },
    {
      id: 'drone-tech',
      title: 'Drone Engineering & UAVs',
      tagline: 'Aerodynamics & Autonomous Avionics',
      description:
        'Designing, building, and programming multi-rotor and fixed-wing UAVs with custom flight controllers, telemetry links, and payload integration.',
      imageUrl: '/assets/tech/uav-prototype.jpg',
      altText: 'Autonomous carbon-fiber quadcopter UAV with LiDAR optical gimbal on white calibration pad',
      keyTopics: [
        'UAV Frame Assembly & Aerodynamics',
        'PX4 & ArduPilot Flight Controllers',
        'Telemetry & Sensor Fusion',
        'Autonomous Mission Planning',
      ],
      applications: [
        'Agricultural crop health mapping',
        'Infrastructure inspection',
        'Autonomous delivery prototypes',
      ],
    },
    {
      id: 'robotics',
      title: 'Robotics & Automation',
      tagline: 'Kinematics & Industrial Mechatronics',
      description:
        'Bridging code and physical movement with multi-axis articulated arms, motor drives, microcontrollers, and collaborative automation systems.',
      imageUrl: '/assets/tech/robotics-arm.jpg',
      altText: 'Brushed aluminum 6-axis articulated robotic arm inspecting an electronic PCB module',
      keyTopics: [
        'Articulated Manipulators & Kinematics',
        'Embedded Microcontrollers (STM32/ESP32)',
        'Motor Drivers & Closed-Loop Control',
        'ROS 2 Framework',
      ],
      applications: [
        'Automated pick-and-place lines',
        'Inspection and sorting robotics',
        'Custom mechatronic test fixtures',
      ],
    },
    {
      id: 'iot',
      title: 'IoT & Smart Systems',
      tagline: 'Sensors, Firmware & Connected Nodes',
      description:
        'Connecting physical environments through low-power sensor nodes, wireless telemetry (LoRa, MQTT, BLE), and real-time cloud data pipelines.',
      imageUrl: '/assets/tech/iot-pcb.jpg',
      altText: 'Custom matte-charcoal embedded IoT circuit board with microcontroller die and RF antenna',
      keyTopics: [
        'Embedded C/C++ Firmware',
        'LoRaWAN, MQTT & Zigbee Networks',
        'Low-Power Node Optimization',
        'Sensor Signal Conditioning',
      ],
      applications: [
        'Remote environmental telemetry',
        'Industrial smart monitoring',
        'Energy optimization sensors',
      ],
    },
    {
      id: 'software',
      title: 'Software Engineering',
      tagline: 'High-Concurrency & Cloud Systems',
      description:
        'Engineering robust, scalable software across modern full-stack web architectures, distributed backends, mobile solutions, and cloud pipelines.',
      imageUrl: '/assets/tech/hero-ai-lab.jpg',
      altText: 'Modern R&D engineering lab bench with edge AI compute unit, oscilloscope, and drone hardware',
      keyTopics: [
        'Modern TypeScript & React Ecosystems',
        'Distributed Node.js & Go Backends',
        'Relational & Time-Series Databases',
        'DevOps & Containerization',
      ],
      applications: [
        'High-throughput telemetry dashboards',
        'Hardware control interfaces',
        'Cloud SaaS infrastructure',
      ],
    },
  ],
  uploadedAssets: [],
  updatedAt: new Date().toISOString(),
};

const DEFAULT_TRAINING_PROGRAMS: TrainingProgram[] = [
  {
    id: 'drone-build-camp',
    title: 'Hands-on Drone Assembly & Flight Calibration',
    level: 'Beginner to Intermediate',
    duration: '3-Day Intensive Workshop',
    format: 'Physical Lab Sessions',
    price: 8500,
    currency: 'BDT',
    seatsTotal: 20,
    seatsAvailable: 7,
    status: 'Open',
    nextBatchDate: '2026-06-05',
    description:
      'Assemble a multi-rotor quadcopter from frame to props. Solder ESCs, configure flight controllers via QGroundControl, and conduct test flights on dedicated grounds.',
    hardwareTools: [
      'Soldering Stations',
      'Multimeters & Oscilloscopes',
      'Carbon Frames',
      'Thrust Test Rigs',
    ],
  },
  {
    id: 'robotics-ros-lab',
    title: 'Embedded Robotics & Microcontroller Programming',
    level: 'Intermediate',
    duration: '4-Week Weekend Lab',
    format: 'Hands-on Hardware Lab',
    price: 12000,
    currency: 'BDT',
    seatsTotal: 18,
    seatsAvailable: 5,
    status: 'Open',
    nextBatchDate: '2026-06-12',
    description:
      'Program motor drivers, read encoder feedback, and implement inverse kinematics on articulated arms using C++ and modern microcontroller boards.',
    hardwareTools: [
      'ESP32 & STM32 Development Boards',
      'Logic Analyzers',
      'Stepper Motors & Servos',
      'Breadboard Prototyping',
    ],
  },
  {
    id: 'ai-vision-practical',
    title: 'Applied Computer Vision & Edge AI Deployment',
    level: 'Intermediate to Advanced',
    duration: '2-Day Sprint',
    format: 'Lab + Compute Workstation',
    price: 9500,
    currency: 'BDT',
    seatsTotal: 24,
    seatsAvailable: 11,
    status: 'Open',
    nextBatchDate: '2026-06-19',
    description:
      'Train lightweight convolutional models for object detection and deploy them onto physical edge hardware accelerators with real-time video feeds.',
    hardwareTools: [
      'Edge AI Accelerators',
      'High-Res Optical Sensors',
      'Python & PyTorch Environments',
      'Inference Benchmarks',
    ],
  },
  {
    id: 'cyber-sandbox-lab',
    title: 'Hands-On Network Defense & Ethical Hacking',
    level: 'Intermediate',
    duration: 'Weekend Intensive',
    format: 'Sandboxed Cyber Range',
    price: 7500,
    currency: 'BDT',
    seatsTotal: 25,
    seatsAvailable: 9,
    status: 'Upcoming',
    nextBatchDate: '2026-07-03',
    description:
      'Learn penetration testing methodologies, analyze Wireshark packet captures, identify OWASP vulnerabilities, and engineer defensive mitigations.',
    hardwareTools: [
      'Isolated Cyber Range',
      'Hardware Protocol Analyzers',
      'Linux CLI Environments',
      'Security Tooling',
    ],
  },
];

const DEFAULT_TRAINING_REGISTRATIONS: TrainingRegistration[] = [
  {
    id: 'treg-101',
    programId: 'drone-build-camp',
    programTitle: 'Hands-on Drone Assembly & Flight Calibration',
    studentName: 'Nafis Ahmed',
    email: 'nafis.aero@mist.edu.bd',
    phone: '+880 1715-224466',
    organization: 'MIST Aeronautical Club',
    experienceLevel: 'Beginner (Foundations)',
    feeAmount: 8500,
    currency: 'BDT',
    paymentStatus: 'Paid',
    paymentMethod: 'bKash',
    transactionId: 'BKH9X21048',
    registrationStatus: 'Confirmed',
    registeredAt: new Date(Date.now() - 3600000 * 14).toISOString(),
  },
  {
    id: 'treg-102',
    programId: 'robotics-ros-lab',
    programTitle: 'Embedded Robotics & Microcontroller Programming',
    studentName: 'Sadia Afrin',
    email: 'sadia.afrin@eee.buet.ac.bd',
    phone: '+880 1814-556677',
    organization: 'BUET EEE Dept',
    experienceLevel: 'Intermediate',
    feeAmount: 12000,
    currency: 'BDT',
    paymentStatus: 'Paid',
    paymentMethod: 'Bank Transfer',
    transactionId: 'DBBL-88412',
    registrationStatus: 'Confirmed',
    registeredAt: new Date(Date.now() - 3600000 * 32).toISOString(),
  },
  {
    id: 'treg-103',
    programId: 'ai-vision-practical',
    programTitle: 'Applied Computer Vision & Edge AI Deployment',
    studentName: 'Mehedi Hasan Rony',
    email: 'rony.dev@gmail.com',
    phone: '+880 1918-778899',
    organization: 'BracU Robotics Lab',
    experienceLevel: 'Advanced / Professional',
    feeAmount: 9500,
    currency: 'BDT',
    paymentStatus: 'Pending',
    paymentMethod: 'Nagad',
    transactionId: 'NGD441209',
    registrationStatus: 'Pending Verification',
    registeredAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
];

const DEFAULT_INTERNSHIPS: InternshipApplication[] = [
  {
    id: 'int-101',
    fullName: 'Tanvir Hasan',
    email: 'tanvir.cse.buet@gmail.com',
    phone: '+880 1819-987654',
    university: 'BUET',
    department: 'Computer Science & Engineering',
    semesterOrYear: 'Final Year (4th Year)',
    track: 'Robotics & Embedded Systems',
    portfolioUrl: 'https://github.com/tanvir-ros2',
    resumeFileName: 'Tanvir_Hasan_Robotics_CV.pdf',
    coverNote:
      'Built a ROS 2 LiDAR SLAM rover for national robotics competition and worked extensively with STM32 CAN bus motor control.',
    status: 'Under Review',
    adminNotes: 'Strong ROS 2 repo. Schedule lab interview at West Shewrapara HQ.',
    appliedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
  },
  {
    id: 'int-102',
    fullName: 'Nusrat Jahan Mim',
    email: 'nusrat.mim@nsu.edu',
    phone: '+880 1611-334455',
    university: 'North South University',
    department: 'Electrical & Electronic Engineering',
    semesterOrYear: 'Fresh Graduate (2026)',
    track: 'AI & Machine Learning',
    portfolioUrl: 'https://github.com/nusrat-vision',
    resumeFileName: 'Nusrat_Jahan_AI_CV.pdf',
    coverNote:
      'Focused on YOLOv8 quantized object detection on Jetson Orin Nano and PyTorch edge optimization.',
    status: 'Approved',
    adminNotes: 'Approved for Summer AI Vision Fellowship.',
    appliedAt: new Date(Date.now() - 3600000 * 50).toISOString(),
  },
  {
    id: 'int-103',
    fullName: 'Imran Hossain',
    email: 'imran.uav@aust.edu',
    phone: '+880 1719-112200',
    university: 'AUST',
    department: 'Mechanical & Production Engineering',
    semesterOrYear: '3rd Year',
    track: 'Drone Technology & UAV',
    portfolioUrl: 'https://github.com/imran-px4',
    resumeFileName: 'Imran_UAV_Resume.pdf',
    coverNote:
      'Designed carbon-fiber quadcopter frames in SolidWorks and tuned ArduPilot PID loops for payload stability.',
    status: 'Pending',
    adminNotes: '',
    appliedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
];

const DEFAULT_CONTACT_MESSAGES: ContactMessage[] = [
  {
    id: 'msg-101',
    fullName: 'Dr. Ashfaqul Karim',
    email: 'akarim@dhakatech-uni.edu.bd',
    phone: '+880 1711-889900',
    collaboratorType: 'University / Educational Institution',
    technologyDomain: 'Drone Technology & UAV Engineering',
    subject: 'University Hardware Bootcamp Collaboration',
    message:
      'We would like to invite MARVZ engineering leads to co-host a 3-day UAV Avionics & Robotics seminar for 60 EEE undergraduates next month.',
    status: 'In Progress',
    replies: [
      {
        id: 'rep-1',
        senderName: 'Engr. Zamil Rahman',
        message: 'Thank you Dr. Karim! We have shared the syllabus deck and proposed lab schedule.',
        sentAt: new Date(Date.now() - 3600000 * 10).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'msg-102',
    fullName: 'Farhana Yasmin',
    email: 'farhana@bengal-agro.com',
    phone: '+880 1922-445566',
    collaboratorType: 'Company / Enterprise Team',
    technologyDomain: 'Artificial Intelligence & Machine Learning',
    subject: 'Automated Quality Inspection Prototype',
    message:
      'Looking to discuss a computer vision sorting prototype at your West Shewrapara office next Tuesday.',
    status: 'New',
    replies: [],
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
];

const DEFAULT_ACTIVITIES: ActivityLogItem[] = [
  {
    id: 'act-1',
    type: 'location',
    title: 'Dhaka HQ Location Configured',
    description:
      'Official office address set to 3rd Floor, House No. 756, Aysha Tower, West Shewrapara, Dhaka-1216.',
    actor: 'System Setup',
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: 'act-2',
    type: 'inquiry',
    title: 'New Contact Inquiry Received',
    description: 'Farhana Yasmin inquired about Automated Quality Inspection Prototype.',
    actor: 'Website Contact Form',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'act-3',
    type: 'internship',
    title: 'Internship Application Submitted',
    description: 'Imran Hossain applied for Drone Technology & UAV fellowship.',
    actor: 'Public Careers Portal',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'act-4',
    type: 'training',
    title: 'New Training Registration',
    description: 'Mehedi Hasan Rony registered for Applied Computer Vision & Edge AI Deployment.',
    actor: 'Training Portal',
    timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
];

function createDefaultAdminAccounts(): AdminAccount[] {
  const { hash, salt } = hashPassword('marvz2026');
  return [
    {
      id: 'adm-001',
      name: 'Engr. Zamil Rahman',
      email: 'admin@marvztech.com',
      role: 'Super Admin',
      phone: '+880 1800-627898',
      department: 'Executive & Engineering Governance',
      passwordHash: hash,
      passwordSalt: salt,
      isActive: true,
      lastLogin: new Date().toISOString(),
    },
    {
      id: 'adm-002',
      name: 'Admissions & Content Lead',
      email: 'editor@marvztech.com',
      role: 'Content Manager',
      phone: '+880 1711-000001',
      department: 'Website Content & Knowledge Base',
      passwordHash: hash,
      passwordSalt: salt,
      isActive: true,
      lastLogin: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'adm-003',
      name: 'HR & Training Desk',
      email: 'coordinator@marvztech.com',
      role: 'HR & Training Coordinator',
      phone: '+880 1711-000002',
      department: 'Internships & Bootcamps',
      passwordHash: hash,
      passwordSalt: salt,
      isActive: true,
      lastLogin: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'adm-004',
      name: 'Support Desk Dispatch',
      email: 'support@marvztech.com',
      role: 'Support Agent',
      phone: '+880 1711-000003',
      department: 'Live Chat & Client Inquiries',
      passwordHash: hash,
      passwordSalt: salt,
      isActive: true,
      lastLogin: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
  ];
}

const DEFAULT_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'AI',
    question: 'What AI and Machine Learning solutions does MARVZ develop?',
    questionBn: 'আপনারা কি কি এআই ও মেশিন লার্নিং সেবা প্রদান করেন?',
    answer:
      'MARVZ engineers bespoke Generative AI agents, Large Language Model (LLM) fine-tuning, automated workflow pipelines, Computer Vision for defect & facial recognition, and predictive data science analytics.',
    answerBn:
      'আমরা কাস্টম জেনারেটিভ এআই সিস্টেম, এলএলএম ইন্টিগ্রেশন, কম্পিউটার ভিশন, অটোমেটেড ওয়ার্কফ্লো এবং প্রেডিক্টিভ ডেটা অ্যানালিটিক্স সলিউশন ডেভেলপ করি।',
    tags: ['ai', 'machine learning', 'llm', 'computer vision', 'data science'],
    hitCount: 42,
    isPublished: true,
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    source: 'Manual',
  },
  {
    id: 'faq-2',
    category: 'Drones',
    question: 'Do you offer custom UAV drone design and pilot training?',
    questionBn: 'আপনারা কি কাস্টম ড্রোন তৈরি ও পাইলট ট্রেনিং করান?',
    answer:
      'Yes! We develop autonomous UAV solutions for aerial mapping, infrastructure inspection, and precision agriculture. We also host practical flight workshops with ArduPilot/PX4 avionics.',
    answerBn:
      'হ্যাঁ! আমরা অ্যারিয়াল ম্যাপিং ও এগ্রিকালচারাল ড্রোনের পাশাপাশি হ্যান্ডস-অন ড্রোন অ্যাসেম্বলি এবং ফ্লাইট ট্রেনিং পরিচালনা করি।',
    tags: ['drone', 'uav', 'flight', 'aerial mapping', 'fpv'],
    hitCount: 38,
    isPublished: true,
    updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    source: 'Manual',
  },
  {
    id: 'faq-3',
    category: 'Robotics',
    question: 'What industrial automation and robotics solutions are available?',
    questionBn: 'আপনাদের রোবোটিক্স ও ইন্ডাস্ট্রিয়াল অটোমেশন সেবা কেমন?',
    answer:
      'We build 6-axis robotic arms for pick-and-place, assembly, ROS 2-based autonomous ground vehicles, and IoT sensor telemetry networks with real-time industrial dashboards.',
    answerBn:
      'আমরা ইন্ডাস্ট্রিয়াল ৬-অ্যাক্সিস রোবোটিক আর্ম, ROS ২ বেসড অটোনমাস সিস্টেম এবং আইওটি অটোমেশন তৈরি করি।',
    tags: ['robotics', 'automation', 'ros', 'iot', 'hardware', 'embedded'],
    hitCount: 29,
    isPublished: true,
    updatedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    source: 'Manual',
  },
  {
    id: 'faq-4',
    category: 'Software',
    question: 'What tech stack do you use for web and mobile development?',
    questionBn: 'সফটওয়্যার ও মোবাইল অ্যাপ ডেভেলপমেন্টে কি টেকনোলজি ব্যবহার করেন?',
    answer:
      'We craft scalable applications using React, Next.js, Node.js, Python FastAPI, PostgreSQL, AWS/GCP cloud architectures, and cross-platform mobile apps with Flutter & React Native.',
    answerBn:
      'আমরা React, Next.js, Node.js, Python, PostgreSQL এবং Flutter/React Native দিয়ে হাই-পারফরম্যান্স ওয়েব ও মোবাইল অ্যাপ্লিকেশন ডেভেলপ করি।',
    tags: ['software', 'web development', 'mobile apps', 'react', 'flutter', 'cloud'],
    hitCount: 51,
    isPublished: true,
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    source: 'Manual',
  },
  {
    id: 'faq-5',
    category: 'Cybersecurity',
    question: 'Do you perform security audits and ethical hacking?',
    questionBn: 'আপনারা কি সিকিউরিটি অডিট ও এথিক্যাল হ্যাকিং ট্রেনিং দেন?',
    answer:
      'Yes. Our offensive and defensive security teams conduct Vulnerability Assessment and Penetration Testing (VAPT), cloud security posture reviews, and train corporate engineers in red-team defensive tactics.',
    answerBn:
      'হ্যাঁ, আমরা এন্টারপ্রাইজ VAPT সিকিউরিটি অডিট করি এবং প্র্যাকটিক্যাল এথিক্যাল হ্যাকিং ও সাইবার ডিফেন্স ট্রেনিং প্রদান করি।',
    tags: ['cybersecurity', 'vapt', 'ethical hacking', 'infosec', 'pentesting'],
    hitCount: 24,
    isPublished: true,
    updatedAt: new Date(Date.now() - 3600000 * 80).toISOString(),
    source: 'Manual',
  },
  {
    id: 'faq-6',
    category: 'Training',
    question: 'Are your IT training programs hands-on with physical hardware?',
    questionBn: 'আপনাদের আইটি ট্রেনিং কি প্র্যাকটিক্যাল ও হার্ডওয়্যার ভিত্তিক?',
    answer:
      'Every training track features physical prototyping kits (microcontrollers, flight controllers, sensor arrays), real cloud sandboxes, and capstone projects evaluated by industry leads.',
    answerBn:
      'অবশ্যই! আমাদের প্রতিটি কোর্সে রিয়েল হার্ডওয়্যার কিটস, ল্যাব প্র্যাকটিস এবং ইন্ডাস্ট্রি প্রজেক্ট অন্তর্ভুক্ত থাকে।',
    tags: ['training', 'courses', 'bootcamp', 'admission', 'hardware lab'],
    hitCount: 65,
    isPublished: true,
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    source: 'Manual',
  },
  {
    id: 'faq-7',
    category: 'Internships',
    question: 'Who is eligible for MARVZ internships and research fellowships?',
    questionBn: 'কারা MARVZ ইন্টার্নশিপ ও রিসার্চ ফেলোশিপে আবেদন করতে পারবেন?',
    answer:
      'Students and fresh graduates in Computer Science, Electrical/Robotics Engineering, or related technical fields with strong passion for innovation. Apply directly through our website internship form.',
    answerBn:
      'সিএসই, ইইই বা রোবোটিক্স ব্যাকগ্রাউন্ডের শিক্ষার্থী ও ফ্রেশ গ্র্যাজুয়েটরা ৩ থেকে ৬ মাসের এই ফেলোশিপে আবেদন করতে পারেন।',
    tags: ['internship', 'careers', 'jobs', 'research fellowship', 'students'],
    hitCount: 47,
    isPublished: true,
    updatedAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    source: 'Manual',
  },
  {
    id: 'faq-8',
    category: 'Contact',
    question: 'Where is the MARVZ & INNOVATION TECH office located?',
    questionBn: 'আপনাদের অফিসের ঠিকানা কোথায়?',
    answer:
      'Our official office is located at 3rd Floor, House No. 756, Aysha Tower, West Shewrapara, Near Metro Pillar 304, Dhaka-1216, Bangladesh.',
    answerBn:
      'আমাদের অফিসের ঠিকানা: ৩য় তলা, বাড়ি নং ৭৫৬, আয়েশা টাওয়ার, পশ্চিম শেওড়াপাড়া, মেট্রো পিলার ৩০৪-এর কাছে, ঢাকা-১২১৬, বাংলাদেশ।',
    tags: ['contact', 'office', 'location', 'phone', 'whatsapp', 'address', 'dhaka', 'shewrapara'],
    hitCount: 33,
    isPublished: true,
    updatedAt: new Date(Date.now() - 3600000 * 15).toISOString(),
    source: 'Manual',
  },
];

const DEFAULT_UNANSWERED: UnansweredQuestion[] = [
  {
    id: 'una-1',
    question: 'Do you offer installment payment facilities for the 6-month Robotics Engineering Bootcamp?',
    visitorLanguage: 'English',
    askedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    conversationId: 'conv-202',
    status: 'Pending Review',
    suggestedAnswer:
      'Yes, we provide 2 to 3 flexible installment milestones for enrolled bootcamp students upon registration verification.',
  },
  {
    id: 'una-2',
    question:
      'আপনারা কি ড্রোনের ড্রাফটিং ও কমার্শিয়াল লাইসেন্সিং সিভিল এভিয়েশন অনুমোদনে সাহায্য করেন?',
    visitorLanguage: 'Bangla',
    askedAt: new Date(Date.now() - 3600000 * 9).toISOString(),
    conversationId: 'conv-203',
    status: 'Pending Review',
    suggestedAnswer:
      'হ্যাঁ, আমাদের ড্রোন কোর্সে সিভিল এভিয়েশন অথরিটি অনুমোদিত রেগুলেশন গাইডলাইন এবং পাইলট কমপ্লায়েন্স সার্টিফিকেশন প্রস্তুতি অন্তর্ভুক্ত রয়েছে।',
  },
];

const DEFAULT_DOCUMENTS: IngestedDocument[] = [
  {
    id: 'doc-1',
    name: 'MARVZ_AI_Course_Curriculum_2026.pdf',
    fileType: 'pdf',
    fileSize: '1.8 MB',
    uploadedAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    category: 'Training',
    status: 'Indexed',
    extractedText:
      'MARVZ AI & Deep Learning Masterclass: 16 weeks duration. Covers PyTorch, Transformer architectures, Fine-tuning Llama and Gemini models, Vector DBs (Chroma/Pinecone), RAG engineering, and Autonomous Agents.',
    chunkCount: 8,
  },
  {
    id: 'doc-2',
    name: 'Industrial_Robotics_Lab_SpecSheet.docx',
    fileType: 'docx',
    fileSize: '840 KB',
    uploadedAt: new Date(Date.now() - 3600000 * 60).toISOString(),
    category: 'Robotics',
    status: 'Indexed',
    extractedText:
      'Robotics Prototyping Facility Specifications at Dhaka HQ (Aysha Tower, West Shewrapara): Equipped with articulated robotic arms, high-precision stepper controllers, digital oscilloscopes, and stereo vision cameras.',
    chunkCount: 5,
  },
];

const DEFAULT_LEADS: Lead[] = [
  {
    id: 'lead-101',
    name: 'Rahim Chowdhury',
    email: 'rahim.chowdhury@techventures.io',
    phone: '+880 1712-345678',
    category: 'Services',
    requirements:
      'Need enterprise AI automation pipeline for inventory prediction and customer support integration.',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: 'Interested',
    source: 'Chatbot',
    adminNotes: 'Scheduled tech scoping demo at Shewrapara office.',
    estimatedValue: '$8,500',
  },
  {
    id: 'lead-102',
    name: 'Mahbubur Rahman',
    email: 'mahbub@apexindustries.bd',
    phone: '+880 1911-223344',
    category: 'Consulting',
    requirements:
      'Industrial automation consultation for 6-axis robotic arms in textile manufacturing plant.',
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
    status: 'Converted',
    source: 'Direct Form',
    adminNotes: 'Contract signed! Phase 1 sensor calibration starts next week.',
    estimatedValue: '$24,000',
  },
];

const DEFAULT_CONVERSATIONS: ConversationThread[] = [
  {
    id: 'conv-101',
    visitorId: 'vis-901',
    visitorName: 'Rahim Chowdhury',
    visitorEmail: 'rahim.chowdhury@techventures.io',
    visitorPhone: '+880 1712-345678',
    visitorLanguage: 'English',
    status: 'Human Joined',
    lastActivity: new Date(Date.now() - 3600000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    unreadAdminCount: 0,
    messages: [
      {
        id: 'm1',
        sender: 'visitor',
        text: 'Hello, we are looking to integrate automated inventory tracking.',
        timestamp: '10:14 AM',
        language: 'English',
      },
      {
        id: 'm2',
        sender: 'bot',
        text: 'Welcome to MARVZ! We specialize in Computer Vision and AI predictive inventory pipelines. Would you like to visit our West Shewrapara HQ?',
        timestamp: '10:14 AM',
      },
    ],
  },
  {
    id: 'conv-103',
    visitorId: 'vis-903',
    visitorName: 'Farhan Kabir',
    visitorLanguage: 'Bangla',
    status: 'Bot Handling',
    lastActivity: new Date(Date.now() - 3600000 * 1).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    unreadAdminCount: 0,
    messages: [
      {
        id: 'm301',
        sender: 'visitor',
        text: 'আপনাদের অফিস কোথায় অবস্থিত?',
        timestamp: '11:20 AM',
        language: 'Bangla',
      },
      {
        id: 'm302',
        sender: 'bot',
        text: 'আমাদের অফিস ৩য় তলা, বাড়ি নং ৭৫৬, আয়েশা টাওয়ার, পশ্চিম শেওড়াপাড়া, মেট্রো পিলার ৩০৪-এর কাছে, ঢাকা-১২১৬, বাংলাদেশে অবস্থিত।',
        timestamp: '11:20 AM',
        language: 'Bangla',
      },
    ],
  },
];

// --- Persistent Store ---
interface StoreSchema {
  settings: ControlCenterSettings;
  locationConfig: LocationConfig;
  websiteContent: WebsiteContentConfig;
  trainingPrograms: TrainingProgram[];
  trainingRegistrations: TrainingRegistration[];
  internships: InternshipApplication[];
  contactMessages: ContactMessage[];
  activities: ActivityLogItem[];
  adminAccounts: AdminAccount[];
  sessions: AdminSession[];
  faqs: FAQItem[];
  unansweredQuestions: UnansweredQuestion[];
  documents: IngestedDocument[];
  leads: Lead[];
  conversations: ConversationThread[];
  visitorCount: number;
}

let store: StoreSchema = {
  settings: DEFAULT_SETTINGS,
  locationConfig: DEFAULT_LOCATION,
  websiteContent: DEFAULT_WEBSITE_CONTENT,
  trainingPrograms: DEFAULT_TRAINING_PROGRAMS,
  trainingRegistrations: DEFAULT_TRAINING_REGISTRATIONS,
  internships: DEFAULT_INTERNSHIPS,
  contactMessages: DEFAULT_CONTACT_MESSAGES,
  activities: DEFAULT_ACTIVITIES,
  adminAccounts: createDefaultAdminAccounts(),
  sessions: [],
  faqs: DEFAULT_FAQS,
  unansweredQuestions: DEFAULT_UNANSWERED,
  documents: DEFAULT_DOCUMENTS,
  leads: DEFAULT_LEADS,
  conversations: DEFAULT_CONVERSATIONS,
  visitorCount: 1428,
};

// Load existing data safely while hydrating any newly added modules
try {
  if (fs.existsSync(DB_FILE)) {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    store = {
      settings: {
        ...DEFAULT_SETTINGS,
        ...(parsed.settings || {}),
        officeLocation: parsed.locationConfig?.officeAddress || OFFICIAL_OFFICE_ADDRESS,
      },
      locationConfig: parsed.locationConfig
        ? { ...DEFAULT_LOCATION, ...parsed.locationConfig }
        : DEFAULT_LOCATION,
      websiteContent: parsed.websiteContent
        ? {
            ...DEFAULT_WEBSITE_CONTENT,
            ...parsed.websiteContent,
            services: parsed.websiteContent.services?.length
              ? parsed.websiteContent.services
              : DEFAULT_WEBSITE_CONTENT.services,
          }
        : DEFAULT_WEBSITE_CONTENT,
      trainingPrograms: parsed.trainingPrograms?.length
        ? parsed.trainingPrograms
        : DEFAULT_TRAINING_PROGRAMS,
      trainingRegistrations: parsed.trainingRegistrations?.length
        ? parsed.trainingRegistrations
        : DEFAULT_TRAINING_REGISTRATIONS,
      internships: parsed.internships?.length ? parsed.internships : DEFAULT_INTERNSHIPS,
      contactMessages: parsed.contactMessages?.length
        ? parsed.contactMessages
        : DEFAULT_CONTACT_MESSAGES,
      activities: parsed.activities?.length ? parsed.activities : DEFAULT_ACTIVITIES,
      adminAccounts: parsed.adminAccounts?.length
        ? parsed.adminAccounts
        : createDefaultAdminAccounts(),
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      faqs: parsed.faqs?.length ? parsed.faqs : DEFAULT_FAQS,
      unansweredQuestions: parsed.unansweredQuestions?.length
        ? parsed.unansweredQuestions
        : DEFAULT_UNANSWERED,
      documents: parsed.documents?.length ? parsed.documents : DEFAULT_DOCUMENTS,
      leads: parsed.leads?.length ? parsed.leads : DEFAULT_LEADS,
      conversations: parsed.conversations?.length
        ? parsed.conversations
        : DEFAULT_CONVERSATIONS,
      visitorCount: parsed.visitorCount || 1428,
    };
  }
  if (
    !store.settings.aiModel ||
    ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-2.5-pro'].includes(store.settings.aiModel)
  ) {
    store.settings.aiModel = 'gemini-3.1-flash-lite';
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf-8');
} catch (err) {
  console.warn('Could not read existing db file, using defaults:', err);
}

// O(1) lookup index for live conversations
const conversationIndex = new Map<string, ConversationThread>();
for (const thread of store.conversations) {
  conversationIndex.set(thread.id, thread);
}

// Debounced non-blocking async persistence (never blocks event loop during chat/page hits)
let persistTimer: ReturnType<typeof setTimeout> | null = null;
let isWritingStore = false;
let pendingWriteAfterCurrent = false;

async function flushStoreToDisk() {
  if (isWritingStore) {
    pendingWriteAfterCurrent = true;
    return;
  }
  isWritingStore = true;
  try {
    await fs.promises.writeFile(DB_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write admin store to disk:', err);
  } finally {
    isWritingStore = false;
    if (pendingWriteAfterCurrent) {
      pendingWriteAfterCurrent = false;
      void flushStoreToDisk();
    }
  }
}

function persistStore() {
  if (persistTimer) return;
  persistTimer = setTimeout(() => {
    persistTimer = null;
    void flushStoreToDisk();
  }, 250);
}

function logActivity(
  type: ActivityLogItem['type'],
  title: string,
  description: string,
  actor: string
) {
  store.activities.unshift({
    id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type,
    title,
    description,
    actor,
    timestamp: new Date().toISOString(),
  });
  if (store.activities.length > 60) {
    store.activities = store.activities.slice(0, 60);
  }
}

// Track website visitor (non-blocking)
app.use((req, _res, next) => {
  if (req.path === '/' || req.path === '/index.html') {
    store.visitorCount += 1;
    persistStore();
  }
  next();
});

// --- Auth Middleware ---
interface AuthedRequest extends Request {
  adminUser?: AdminAccount;
  sessionToken?: string;
}

function requireAdminAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please sign in to the Admin Panel.' });
  }

  const token = authHeader.slice(7).trim();
  const session = store.sessions.find((s) => s.token === token);
  if (!session || new Date(session.expiresAt).getTime() < Date.now()) {
    if (session) {
      store.sessions = store.sessions.filter((s) => s.token !== token);
      persistStore();
    }
    return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
  }

  const account = store.adminAccounts.find((a) => a.id === session.userId && a.isActive);
  if (!account) {
    return res.status(401).json({ error: 'Admin account disabled or removed.' });
  }

  req.adminUser = account;
  req.sessionToken = token;
  next();
}

function sanitizeAccount(acc: AdminAccount) {
  const { passwordHash: _ph, passwordSalt: _ps, ...safe } = acc;
  return safe;
}

// --- Gemini AI Initialization ---
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// --- High-Speed Chatbot Caching & Prompt Builder ---
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'do', 'does', 'did',
  'what', 'which', 'who', 'where', 'when', 'how', 'why', 'can', 'could', 'would', 'should',
  'i', 'we', 'you', 'your', 'my', 'our', 'me', 'us', 'to', 'for', 'of', 'in', 'on', 'at', 'with',
  'about', 'please', 'tell', 'give', 'me', 'marvz', 'tech', 'innovation', 'and', 'or',
]);

function tokenizeForFaq(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u0980-\u09FF]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

interface IndexedFaqEntry {
  faq: FAQItem;
  normQ: string;
  normQBn: string;
  tokens: Set<string>;
}

interface CachedChatReply {
  reply: string;
  source: string;
  cachedAt: number;
}

let cachedSystemInstruction: string | null = null;
let cachedIndexedFaqs: IndexedFaqEntry[] | null = null;
const RESPONSE_CACHE_TTL_MS = 15 * 60 * 1000;
const RESPONSE_CACHE_MAX = 250;
const queryResponseCache = new Map<string, CachedChatReply>();
let geminiAuthCooldownUntil = 0;

function invalidateChatbotCache() {
  cachedSystemInstruction = null;
  cachedIndexedFaqs = null;
  queryResponseCache.clear();
}

function getIndexedFaqs(): IndexedFaqEntry[] {
  if (cachedIndexedFaqs) return cachedIndexedFaqs;
  cachedIndexedFaqs = store.faqs
    .filter((f) => f.isPublished)
    .map((faq) => {
      const normQ = faq.question.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
      const normQBn = (faq.questionBn || '').replace(/\s+/g, ' ').trim();
      const tokens = new Set<string>([
        ...tokenizeForFaq(faq.question),
        ...tokenizeForFaq(faq.questionBn || ''),
        ...faq.tags.map((t) => t.toLowerCase().trim()).filter(Boolean),
      ]);
      return { faq, normQ, normQBn, tokens };
    });
  return cachedIndexedFaqs;
}

function buildDynamicSystemInstruction(): string {
  if (cachedSystemInstruction) return cachedSystemInstruction;

  const publishedFaqs = store.faqs
    .filter((f) => f.isPublished)
    .map(
      (f, i) =>
        `${i + 1}. [${f.category}] Q: ${f.question}${f.questionBn ? ` (${f.questionBn})` : ''} | A: ${f.answer}${f.answerBn ? ` | BN: ${f.answerBn}` : ''}`
    )
    .join('\n');

  const docSnippets = store.documents
    .filter((d) => d.status === 'Indexed')
    .map((d) => `[DOC: ${d.name}]\n${d.extractedText.slice(0, 2200)}`)
    .join('\n\n');

  const programSummary = store.trainingPrograms
    .map(
      (p) =>
        `- ${p.title} (${p.level}, ${p.duration}, ${p.currency} ${p.price}, Status: ${p.status}, Next: ${p.nextBatchDate})`
    )
    .join('\n');

  cachedSystemInstruction = `You are "${store.settings.chatbotName}", the official AI support & technical advisor for MARVZ & INNOVATION TECH.
COMPANY: ${store.websiteContent.heroTagline} | Office: ${store.locationConfig.officeAddress} | Maps: ${store.locationConfig.googleMapsUrl} | Hours: ${store.locationConfig.workingHours} | Email: ${store.locationConfig.contactEmail} | Phone: ${store.locationConfig.contactPhone} | WhatsApp: ${store.locationConfig.contactWhatsApp}.
PROGRAMS:
${programSummary}
FAQS:
${publishedFaqs}
DOCS:
${docSnippets}
${store.settings.systemInstructionOverride ? `ADMIN NOTES:\n${store.settings.systemInstructionOverride}\n` : ''}
RULES: Be concise, accurate, friendly, and modern. Answer strictly from the facts above; if unknown, direct them to Phone ${store.locationConfig.contactPhone} or WhatsApp ${store.locationConfig.contactWhatsApp}. Reply in the visitor's language (English, বাংলা, or Banglish). Keep answers focused and easy to read.`;

  return cachedSystemInstruction;
}

function matchPublishedFaqFast(cleanQuery: string): FAQItem | null {
  const normQuery = cleanQuery.toLowerCase().replace(/[^\w\s\u0980-\u09FF]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!normQuery || normQuery.length < 4) return null;

  const entries = getIndexedFaqs();
  // 1. Exact or direct question substring match
  for (const entry of entries) {
    if (
      normQuery === entry.normQ ||
      (entry.normQBn && cleanQuery.trim() === entry.normQBn) ||
      (entry.normQ.length >= 16 && normQuery.includes(entry.normQ)) ||
      (entry.normQBn.length >= 10 && cleanQuery.includes(entry.normQBn))
    ) {
      return entry.faq;
    }
  }

  // 2. High-confidence token overlap (>= 65% of query tokens and >= 2 meaningful tokens)
  const qTokens = tokenizeForFaq(cleanQuery);
  if (qTokens.length < 2) return null;

  let bestFaq: FAQItem | null = null;
  let bestScore = 0;

  for (const entry of entries) {
    if (entry.tokens.size === 0) continue;
    let hits = 0;
    for (const t of qTokens) {
      if (entry.tokens.has(t)) hits++;
    }
    if (hits < 2) continue;
    const queryCoverage = hits / qTokens.length;
    const faqCoverage = hits / Math.min(entry.tokens.size, 8);
    const score = queryCoverage * 0.65 + faqCoverage * 0.35;
    if (queryCoverage >= 0.65 && score > bestScore) {
      bestScore = score;
      bestFaq = entry.faq;
    }
  }

  return bestScore >= 0.55 ? bestFaq : null;
}

function tryInstantCachedReply(
  rawTrimmed: string,
  cleanQuery: string,
  detectedLang: 'English' | 'Bangla' | 'Banglish',
  forceBangla: boolean,
  historyLen: number,
  isHumanRequest: boolean
): { reply: string; source: string; matchedFaq?: FAQItem } | null {
  const targetLang = forceBangla ? 'Bangla' : detectedLang;
  const qLower = cleanQuery.toLowerCase().trim();

  // Instant zero-latency greetings
  if (/^(hi+|hello+|hey+|hlw|assalamu\s*alaikum|salam|nomoshkar|শুভ\s*(সকাল|বিকেল|সন্ধ্যা)|হ্যালো|হাই|সালাম|কেমন\s*আছেন)[!?.]*$/i.test(qLower)) {
    const reply =
      targetLang === 'Bangla'
        ? store.settings.welcomeMessageBn ||
          'হ্যালো! MARVZ & INNOVATION TECH-এ আপনাকে স্বাগতম। আজ কীভাবে সাহায্য করতে পারি?'
        : store.settings.welcomeMessage ||
          'Hello! Welcome to MARVZ & INNOVATION TECH. How can I assist you today?';
    return { reply, source: 'instant-greeting-cache' };
  }

  if (isHumanRequest) {
    return null;
  }

  // Instant dynamic Office Location & Contact cache hit (always matches live LocationConfig)
  if (
    cleanQuery.length <= 85 &&
    /\b(office|location|address|located|directions|map|shewrapara|metro pillar|where are you|thikana|kotay|kothay)\b|অফিস|ঠিকানা|কোথায়|কোথায়|লোকেশন/i.test(
      qLower
    )
  ) {
    const reply =
      targetLang === 'Bangla'
        ? `আমাদের অফিসের ঠিকানা:\n• **ঠিকানা:** ${store.locationConfig.officeAddress}\n• **অফিস সময়:** ${store.locationConfig.workingHours}\n• **ফোন:** ${store.locationConfig.contactPhone} | **হোয়াটসঅ্যাপ:** ${store.locationConfig.contactWhatsApp}\n• **Google Maps:** ${store.locationConfig.googleMapsUrl}`
        : `**MARVZ & INNOVATION TECH — Office Location:**\n• **Address:** ${store.locationConfig.officeAddress}\n• **Hours:** ${store.locationConfig.workingHours}\n• **Phone:** ${store.locationConfig.contactPhone} | **WhatsApp:** ${store.locationConfig.contactWhatsApp}\n• **Google Maps:** ${store.locationConfig.googleMapsUrl}`;
    return { reply, source: 'location-instant-cache' };
  }

  // Published FAQ instant hit (skip only if user is asking a vague follow-up like "tell me more")
  const isVagueFollowUp = /^(more|details|explain|why|how so|tell me more|আরও|বিস্তারিত)$/i.test(qLower);
  if (!isVagueFollowUp && historyLen <= 4) {
    const matchedFaq = matchPublishedFaqFast(cleanQuery);
    if (matchedFaq) {
      matchedFaq.hitCount += 1;
      const reply =
        targetLang === 'Bangla' && matchedFaq.answerBn ? matchedFaq.answerBn : matchedFaq.answer;
      return { reply, source: 'faq-instant-cache', matchedFaq };
    }
  }

  // LRU query cache for repeated common questions
  if (historyLen <= 2) {
    const cacheKey = `${targetLang}:${qLower}`;
    const cached = queryResponseCache.get(cacheKey);
    if (cached && Date.now() - cached.cachedAt < RESPONSE_CACHE_TTL_MS) {
      // Refresh LRU order
      queryResponseCache.delete(cacheKey);
      queryResponseCache.set(cacheKey, cached);
      return { reply: cached.reply, source: `${cached.source} (cached)` };
    }
  }

  return null;
}

function storeInResponseCache(
  cleanQuery: string,
  targetLang: string,
  reply: string,
  source: string,
  historyLen: number
) {
  if (historyLen > 2 || !reply || reply.length < 15) return;
  const cacheKey = `${targetLang}:${cleanQuery.toLowerCase().trim()}`;
  if (queryResponseCache.size >= RESPONSE_CACHE_MAX) {
    const oldestKey = queryResponseCache.keys().next().value;
    if (oldestKey) queryResponseCache.delete(oldestKey);
  }
  queryResponseCache.set(cacheKey, { reply, source, cachedAt: Date.now() });
}

function selectFastGeminiModelAndConfig(
  cleanQuery: string,
  historyLen: number,
  systemInstruction: string
) {
  const configured = store.settings.aiModel;
  const isComplexQuery =
    cleanQuery.length > 140 ||
    historyLen > 4 ||
    /\b(compare|architecture|roadmap|curriculum|syllabus|step by step|detailed|differences|বিস্তারিত|তুলনা)\b/i.test(
      cleanQuery
    );

  // Use ultra-lightweight 'gemini-3.1-flash-lite' with ThinkingLevel.MINIMAL for fast basic queries;
  // use 'gemini-4-hydrogen' with ThinkingLevel.LOW for balanced complex queries or if explicitly selected.
  const useHydrogen = configured === 'gemini-4-hydrogen' && isComplexQuery;
  const model = useHydrogen ? 'gemini-4-hydrogen' : 'gemini-3.1-flash-lite';
  const thinkingLevel = useHydrogen ? ThinkingLevel.LOW : ThinkingLevel.MINIMAL;

  return {
    model,
    config: {
      systemInstruction,
      thinkingConfig: { thinkingLevel },
    },
  };
}

// ====================================================
// PUBLIC WEBSITE & VISITOR API ROUTES
// ====================================================

// Public live website CMS + Location + Training programs
app.get('/api/public/site-data', (_req, res) => {
  res.json({
    content: store.websiteContent,
    location: store.locationConfig,
    trainingPrograms: store.trainingPrograms,
  });
});

// In-memory runtime geocode cache (cleared on restart, strictly under 24h)
const geocodeRuntimeCache: Record<
  string,
  { lat: number; lng: number; formattedAddress: string; placeId?: string; cachedAt: number }
> = {};

// Server-side Google Maps Geocoding API v4 proxy (eliminates CORS trap & keeps coordinates verified)
app.get('/api/public/geocode-office', async (req, res) => {
  const customQuery = typeof req.query.address === 'string' ? req.query.address.trim() : '';
  const queryAddress = customQuery || store.locationConfig.mapSearchQuery || store.locationConfig.officeAddress;

  // Allow explicit admin override if provided
  if (
    !customQuery &&
    typeof store.locationConfig.customLat === 'number' &&
    typeof store.locationConfig.customLng === 'number' &&
    !Number.isNaN(store.locationConfig.customLat) &&
    !Number.isNaN(store.locationConfig.customLng)
  ) {
    return res.json({
      lat: store.locationConfig.customLat,
      lng: store.locationConfig.customLng,
      formattedAddress: store.locationConfig.officeAddress,
      source: 'admin-override',
    });
  }

  const cacheHit = geocodeRuntimeCache[queryAddress];
  if (cacheHit && Date.now() - cacheHit.cachedAt < 1000 * 60 * 60 * 12) {
    return res.json({ ...cacheHit, source: 'runtime-cache' });
  }

  const mapsApiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
  if (!mapsApiKey) {
    return res.status(200).json({
      lat: null,
      lng: null,
      formattedAddress: store.locationConfig.officeAddress,
      source: 'client-geocoder-fallback',
    });
  }

  try {
    const encoded = encodeURIComponent(queryAddress);
    const url = `https://geocode.googleapis.com/v4/geocode/address/${encoded}?regionCode=bd`;
    const geoRes = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': mapsApiKey,
        'X-Goog-FieldMask': 'results.placeId,results.location,results.formattedAddress',
        'X-Goog-Maps-Solution-ID': 'gmp_git_agentskills_v1',
      },
    });

    if (geoRes.ok) {
      const geoJson: any = await geoRes.json();
      const first = geoJson?.results?.[0];
      if (first?.location?.latitude && first?.location?.longitude) {
        const result = {
          lat: Number(first.location.latitude),
          lng: Number(first.location.longitude),
          formattedAddress: first.formattedAddress || store.locationConfig.officeAddress,
          placeId: first.placeId,
          cachedAt: Date.now(),
        };
        geocodeRuntimeCache[queryAddress] = result;
        return res.json({ ...result, source: 'geocoding-v4' });
      }
    }
  } catch (err) {
    console.warn('Server geocode-office lookup skipped, delegating to client Maps JS Geocoder:', err);
  }

  return res.json({
    lat: null,
    lng: null,
    formattedAddress: store.locationConfig.officeAddress,
    source: 'client-geocoder-fallback',
  });
});

// Public Contact Form Submission
app.post('/api/public/contact', (req, res) => {
  try {
    const {
      fullName,
      email,
      phone = '',
      collaboratorType = 'General Visitor',
      technologyDomain = 'General Inquiry',
      subject = 'Website Contact Message',
      message,
    } = req.body;

    if (!fullName?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ error: 'Full name, email, and message are required.' });
    }

    const newMsg: ContactMessage = {
      id: `msg-${Date.now()}`,
      fullName: String(fullName).trim(),
      email: String(email).trim(),
      phone: String(phone).trim(),
      collaboratorType: String(collaboratorType).trim(),
      technologyDomain: String(technologyDomain).trim(),
      subject: String(subject).trim(),
      message: String(message).trim(),
      status: 'New',
      replies: [],
      createdAt: new Date().toISOString(),
    };

    store.contactMessages.unshift(newMsg);

    // Also mirror into CRM leads for unified pipeline visibility
    store.leads.unshift({
      id: `lead-${Date.now()}`,
      name: newMsg.fullName,
      email: newMsg.email,
      phone: newMsg.phone,
      category: 'Services',
      requirements: `[${newMsg.technologyDomain}] ${newMsg.message}`,
      timestamp: newMsg.createdAt,
      status: 'New',
      source: 'Direct Form',
    });

    logActivity(
      'inquiry',
      'New Contact Message Received',
      `${newMsg.fullName} submitted an inquiry regarding ${newMsg.technologyDomain}.`,
      newMsg.fullName
    );
    persistStore();

    return res.status(201).json({
      success: true,
      message: 'Message received! Our Dhaka HQ advisory desk will contact you shortly.',
      contactMessage: newMsg,
    });
  } catch (err) {
    console.error('Contact form error:', err);
    return res.status(500).json({ error: 'Failed to submit message.' });
  }
});

// Public Internship Application Submission (with optional CV file upload)
app.post('/api/public/internships/apply', (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      university,
      department,
      semesterOrYear = 'Undergraduate / Graduate',
      track,
      portfolioUrl = '',
      coverNote,
      resumeFileName,
      resumeBase64,
    } = req.body;

    if (!fullName?.trim() || !email?.trim() || !phone?.trim() || !university?.trim() || !track?.trim()) {
      return res.status(400).json({
        error: 'Full name, email, phone, university, and preferred track are required.',
      });
    }

    let storedResumeUrl = '';
    if (resumeBase64 && typeof resumeBase64 === 'string' && resumeFileName) {
      const safeExt = path.extname(String(resumeFileName)).toLowerCase();
      if (['.pdf', '.doc', '.docx', '.txt'].includes(safeExt)) {
        const cleanBase = path
          .basename(String(resumeFileName), safeExt)
          .replace(/[^a-zA-Z0-9_-]/g, '_')
          .slice(0, 40);
        const destName = `cv-${Date.now()}-${cleanBase}${safeExt}`;
        const rawPayload = resumeBase64.includes(',') ? resumeBase64.split(',')[1] : resumeBase64;
        const buf = Buffer.from(rawPayload, 'base64');
        if (buf.length <= 8 * 1024 * 1024) {
          fs.writeFileSync(path.join(UPLOADS_DIR, destName), buf);
          storedResumeUrl = `/uploads/${destName}`;
        }
      }
    }

    const application: InternshipApplication = {
      id: `int-${Date.now()}`,
      fullName: String(fullName).trim(),
      email: String(email).trim(),
      phone: String(phone).trim(),
      university: String(university).trim(),
      department: String(department || 'Engineering').trim(),
      semesterOrYear: String(semesterOrYear).trim(),
      track: String(track).trim(),
      portfolioUrl: String(portfolioUrl).trim(),
      resumeFileName: resumeFileName ? String(resumeFileName) : undefined,
      resumeUrl: storedResumeUrl || undefined,
      coverNote: String(coverNote || '').trim(),
      status: 'Pending',
      adminNotes: '',
      appliedAt: new Date().toISOString(),
    };

    store.internships.unshift(application);
    logActivity(
      'internship',
      'New Internship Application',
      `${application.fullName} (${application.university}) applied for ${application.track}.`,
      application.fullName
    );
    persistStore();

    return res.status(201).json({
      success: true,
      message: 'Your internship application has been submitted to MARVZ HR!',
      application,
    });
  } catch (err) {
    console.error('Internship application error:', err);
    return res.status(500).json({ error: 'Failed to submit internship application.' });
  }
});

// Public Training Program Registration
app.post('/api/public/training/register', (req, res) => {
  try {
    const {
      programId,
      studentName,
      email,
      phone,
      organization = '',
      experienceLevel = 'Intermediate',
      paymentMethod = 'bKash',
      transactionId = '',
    } = req.body;

    if (!programId || !studentName?.trim() || !email?.trim() || !phone?.trim()) {
      return res.status(400).json({
        error: 'Program selection, full name, email, and phone are required.',
      });
    }

    const program = store.trainingPrograms.find((p) => p.id === programId);
    if (!program) {
      return res.status(404).json({ error: 'Selected training program was not found.' });
    }

    const hasTx = Boolean(String(transactionId).trim());
    const reg: TrainingRegistration = {
      id: `treg-${Date.now()}`,
      programId: program.id,
      programTitle: program.title,
      studentName: String(studentName).trim(),
      email: String(email).trim(),
      phone: String(phone).trim(),
      organization: String(organization).trim(),
      experienceLevel: String(experienceLevel).trim(),
      feeAmount: program.price,
      currency: program.currency,
      paymentStatus: hasTx ? 'Pending' : 'Pending',
      paymentMethod: ['bKash', 'Nagad', 'Bank Transfer', 'Card', 'Cash at Office'].includes(paymentMethod)
        ? paymentMethod
        : 'bKash',
      transactionId: String(transactionId).trim() || 'PAY-AT-DESK',
      registrationStatus: 'Pending Verification',
      registeredAt: new Date().toISOString(),
    };

    store.trainingRegistrations.unshift(reg);
    if (program.seatsAvailable > 0) {
      program.seatsAvailable -= 1;
    }

    logActivity(
      'training',
      'New Training Seat Registration',
      `${reg.studentName} registered for "${reg.programTitle}" (${reg.paymentMethod}).`,
      reg.studentName
    );
    persistStore();

    return res.status(201).json({
      success: true,
      message: 'Training registration submitted! Our coordinator will confirm your seat shortly.',
      registration: reg,
    });
  } catch (err) {
    console.error('Training registration error:', err);
    return res.status(500).json({ error: 'Failed to submit training registration.' });
  }
});

// Visitor Chatbot Configuration
app.get('/api/visitor/config', (_req, res) => {
  res.json({
    chatbotName: store.settings.chatbotName,
    welcomeMessage: store.settings.welcomeMessage,
    welcomeMessageBn: store.settings.welcomeMessageBn,
    brandPrimaryColor: store.settings.brandPrimaryColor,
    brandAccentColor: store.settings.brandAccentColor,
    enableBangla: store.settings.enableBangla,
    enableEnglish: store.settings.enableEnglish,
    enableLeadFormPrompt: store.settings.enableLeadFormPrompt,
    enableHumanEscalation: store.settings.enableHumanEscalation,
    enableQuickReplies: store.settings.enableQuickReplies,
    enableVoiceInput: store.settings.enableVoiceInput,
    contactWhatsApp: store.locationConfig.contactWhatsApp,
    contactPhone: store.locationConfig.contactPhone,
  });
});

function buildFallbackReply(
  trimmed: string,
  detectedLang: 'English' | 'Bangla' | 'Banglish',
  isHumanRequest: boolean,
  thread: ConversationThread
): string {
  if (isHumanRequest) {
    return `I have alerted our senior engineering & advisory desk!\n\n• **Office:** ${store.locationConfig.officeAddress}\n• **WhatsApp:** ${store.locationConfig.contactWhatsApp}\n• **Hotline:** ${store.locationConfig.contactPhone}`;
  }

  const queryLower = trimmed.toLowerCase();
  const found =
    matchPublishedFaqFast(trimmed) ||
    store.faqs.find(
      (f) =>
        f.isPublished &&
        (f.tags.some((tag) => queryLower.includes(tag.toLowerCase())) ||
          f.question.toLowerCase().includes(queryLower) ||
          f.answer.toLowerCase().includes(queryLower))
    );

  if (found) {
    return detectedLang === 'Bangla' && found.answerBn ? found.answerBn : found.answer;
  }

  if (trimmed.length > 10 && !trimmed.match(/^(hi|hello|hey|bye|thanks|thank you)$/i)) {
    const alreadyLogged = store.unansweredQuestions.some(
      (u) => u.question.toLowerCase() === trimmed.toLowerCase()
    );
    if (!alreadyLogged) {
      store.unansweredQuestions.unshift({
        id: `una-${Date.now()}`,
        question: trimmed,
        visitorLanguage: detectedLang,
        askedAt: new Date().toISOString(),
        conversationId: thread.id,
        status: 'Pending Review',
      });
    }
  }

  return detectedLang === 'Bangla'
    ? `ধন্যবাদ আপনার বার্তার জন্য! MARVZ & INNOVATION TECH-এ আমরা এআই, ড্রোন, রোবোটিক্স, সাইবার সিকিউরিটি ও হ্যান্ডস-অন ট্রেনিং নিয়ে কাজ করছি। আমাদের ঢাকা অফিস: ${store.locationConfig.officeAddress}`
    : `Thank you for reaching out to **MARVZ & INNOVATION TECH**! We specialize in **AI & ML**, **Drone Engineering**, **Robotics**, **Cybersecurity**, and **Hands-On Bootcamps** at our Dhaka HQ (${store.locationConfig.officeAddress}). How can our engineering team help you today?`;
}

function prepareChatContext(reqBody: any) {
  const { message, conversationId, visitorName = 'Visitor', visitorEmail, visitorPhone, history = [] } = reqBody;
  const rawTrimmed = String(message).trim();
  const forceBangla = rawTrimmed.includes('(Please reply in Bangla)');
  const cleanQuery = rawTrimmed.replace(/\s*\(Please reply in Bangla\)\s*/g, '').trim();

  const isBangla = forceBangla || /[\u0980-\u09FF]/.test(cleanQuery);
  const isBanglish = /\b(apnader|apnara|kobe|kivabe|korbo|lagbe|hobe|koto|taka|khoj|valo|shuru|thikana|kotay|kothay|ache|achen)\b/i.test(
    cleanQuery
  );
  const detectedLang: 'English' | 'Bangla' | 'Banglish' = isBangla ? 'Bangla' : isBanglish ? 'Banglish' : 'English';

  const resolvedId = conversationId || `conv-${Date.now()}`;
  let thread = conversationIndex.get(resolvedId);
  if (!thread) {
    thread = {
      id: resolvedId,
      visitorId: `vis-${Date.now()}`,
      visitorName: visitorName || 'Website Visitor',
      visitorEmail,
      visitorPhone,
      visitorLanguage: detectedLang,
      status: 'Bot Handling',
      lastActivity: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      messages: [],
      unreadAdminCount: 1,
    };
    store.conversations.unshift(thread);
    conversationIndex.set(thread.id, thread);
  } else {
    thread.lastActivity = new Date().toISOString();
    if (visitorName && visitorName !== 'Visitor') thread.visitorName = visitorName;
    if (visitorEmail) thread.visitorEmail = visitorEmail;
    if (visitorPhone) thread.visitorPhone = visitorPhone;
  }

  const isHumanRequest = /\b(human|agent|person|call me|talk to someone|advisor|support team|সরাসরি কথা)\b/i.test(
    cleanQuery
  );
  if (isHumanRequest) {
    thread.status = 'Needs Human Support';
    thread.unreadAdminCount += 1;
  }

  thread.messages.push({
    id: `m-${Date.now()}`,
    sender: 'visitor',
    text: cleanQuery,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    language: detectedLang,
    flagHuman: isHumanRequest,
  });

  const recentHistory = Array.isArray(history) ? history.slice(-6) : [];
  return {
    rawTrimmed,
    cleanQuery,
    forceBangla,
    detectedLang,
    thread,
    isHumanRequest,
    recentHistory,
  };
}

// Fast SSE Streaming Chat Endpoint (Word-by-Word Real-Time Response)
app.post('/api/chat/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  if (typeof res.flushHeaders === 'function') res.flushHeaders();

  const sendEvent = (payload: Record<string, unknown>) => {
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    }
  };

  let clientClosed = false;
  res.on('close', () => {
    if (!res.writableEnded) {
      clientClosed = true;
    }
  });

  try {
    const { message } = req.body || {};
    if (!message || typeof message !== 'string') {
      sendEvent({ type: 'error', error: 'Message text is required.' });
      return res.end();
    }

    const {
      rawTrimmed,
      cleanQuery,
      forceBangla,
      detectedLang,
      thread,
      isHumanRequest,
      recentHistory,
    } = prepareChatContext(req.body);

    const cachedHit = tryInstantCachedReply(
      rawTrimmed,
      cleanQuery,
      detectedLang,
      forceBangla,
      recentHistory.length,
      isHumanRequest
    );

    sendEvent({
      type: 'meta',
      conversationId: thread.id,
      language: detectedLang,
      cached: Boolean(cachedHit),
    });

    let botReplyText = '';
    let replySource = 'gemini-3.1-flash-lite';

    if (cachedHit) {
      botReplyText = cachedHit.reply;
      replySource = cachedHit.source;

      // Stream cached/FAQ reply immediately in smooth word-by-word groups (~80-180ms total)
      const tokens = botReplyText.match(/\S+\s*/g) || [botReplyText];
      const chunkSize = Math.max(2, Math.ceil(tokens.length / 18));
      for (let i = 0; i < tokens.length; i += chunkSize) {
        if (clientClosed) break;
        sendEvent({ type: 'delta', text: tokens.slice(i, i + chunkSize).join('') });
        if (i + chunkSize < tokens.length) {
          await new Promise((r) => setTimeout(r, 12));
        }
      }
    } else if (aiClient && Date.now() > geminiAuthCooldownUntil) {
      try {
        const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
        for (const item of recentHistory) {
          if (item && item.text) {
            contents.push({
              role: item.role === 'user' ? 'user' : 'model',
              parts: [{ text: item.text }],
            });
          }
        }
        contents.push({ role: 'user', parts: [{ text: rawTrimmed }] });

        const systemInstruction = buildDynamicSystemInstruction();
        const { model, config } = selectFastGeminiModelAndConfig(
          cleanQuery,
          recentHistory.length,
          systemInstruction
        );
        replySource = model;

        const stream = await aiClient.models.generateContentStream({
          model,
          contents,
          config,
        });

        for await (const chunk of stream) {
          if (clientClosed) break;
          const delta = chunk.text || '';
          if (delta) {
            botReplyText += delta;
            sendEvent({ type: 'delta', text: delta });
          }
        }

        if (botReplyText.trim()) {
          storeInResponseCache(
            cleanQuery,
            forceBangla ? 'Bangla' : detectedLang,
            botReplyText,
            replySource,
            recentHistory.length
          );
        }
      } catch (geminiErr: any) {
        const msg = String(geminiErr?.message || geminiErr);
        if (msg.includes('403') || msg.includes('PERMISSION_DENIED') || msg.includes('API_KEY')) {
          geminiAuthCooldownUntil = Date.now() + 60_000;
        }
        console.warn('Gemini stream failed, using instant KB fallback:', msg);
      }
    }

    if (!botReplyText.trim()) {
      replySource = 'marvz-fallback-engine';
      botReplyText = buildFallbackReply(cleanQuery, detectedLang, isHumanRequest, thread);
      const tokens = botReplyText.match(/\S+\s*/g) || [botReplyText];
      const chunkSize = Math.max(2, Math.ceil(tokens.length / 16));
      for (let i = 0; i < tokens.length; i += chunkSize) {
        if (clientClosed) break;
        sendEvent({ type: 'delta', text: tokens.slice(i, i + chunkSize).join('') });
        if (i + chunkSize < tokens.length) {
          await new Promise((r) => setTimeout(r, 12));
        }
      }
    }

    thread.messages.push({
      id: `m-${Date.now() + 1}`,
      sender: 'bot',
      text: botReplyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: detectedLang,
    });

    persistStore();

    sendEvent({
      type: 'done',
      reply: botReplyText,
      language: detectedLang,
      source: replySource,
      conversationId: thread.id,
      threadStatus: thread.status,
      messageCount: thread.messages.length,
    });
    return res.end();
  } catch (error) {
    console.error('Chat stream error:', error);
    sendEvent({ type: 'error', error: 'Failed to stream chat query.' });
    return res.end();
  }
});

// Standard Chat Completion (Optimized with Caching & Fast Models)
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    const {
      rawTrimmed,
      cleanQuery,
      forceBangla,
      detectedLang,
      thread,
      isHumanRequest,
      recentHistory,
    } = prepareChatContext(req.body);

    const cachedHit = tryInstantCachedReply(
      rawTrimmed,
      cleanQuery,
      detectedLang,
      forceBangla,
      recentHistory.length,
      isHumanRequest
    );

    let botReplyText = cachedHit?.reply || '';
    let replySource = cachedHit?.source || 'gemini-3.1-flash-lite';

    if (!botReplyText && aiClient) {
      try {
        const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
        for (const item of recentHistory) {
          if (item && item.text) {
            contents.push({
              role: item.role === 'user' ? 'user' : 'model',
              parts: [{ text: item.text }],
            });
          }
        }
        contents.push({ role: 'user', parts: [{ text: rawTrimmed }] });

        const systemInstruction = buildDynamicSystemInstruction();
        const { model, config } = selectFastGeminiModelAndConfig(
          cleanQuery,
          recentHistory.length,
          systemInstruction
        );
        replySource = model;

        const geminiPromise = aiClient.models.generateContent({
          model,
          contents,
          config,
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini timeout')), 7000)
        );

        const response: any = await Promise.race([geminiPromise, timeoutPromise]);
        botReplyText = response.text || '';

        if (botReplyText.trim()) {
          storeInResponseCache(
            cleanQuery,
            forceBangla ? 'Bangla' : detectedLang,
            botReplyText,
            replySource,
            recentHistory.length
          );
        }
      } catch (geminiError: any) {
        console.warn('Gemini call failed or timed out, switching to fallback:', geminiError?.message || geminiError);
        replySource = 'marvz-fallback-engine';
      }
    } else if (!botReplyText) {
      replySource = 'marvz-fallback-engine';
    }

    if (!botReplyText.trim()) {
      replySource = 'marvz-fallback-engine';
      botReplyText = buildFallbackReply(cleanQuery, detectedLang, isHumanRequest, thread);
    }

    thread.messages.push({
      id: `m-${Date.now() + 1}`,
      sender: 'bot',
      text: botReplyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: detectedLang,
    });

    persistStore();

    return res.json({
      reply: botReplyText,
      language: detectedLang,
      source: replySource,
      conversationId: thread.id,
      threadStatus: thread.status,
      messageCount: thread.messages.length,
    });
  } catch (error) {
    console.error('Chat endpoint error:', error);
    return res.status(500).json({ error: 'Failed to process chat query.' });
  }
});

// Lightweight Conversation History Load & Delta Polling
app.get('/api/conversations/:id/history', (req, res) => {
  const thread = conversationIndex.get(req.params.id);
  if (!thread) return res.json({ status: 'Bot Handling', messages: [], count: 0 });
  const limit = Math.min(50, Math.max(10, Number(req.query.limit) || 30));
  const messages = thread.messages.slice(-limit);
  res.json({ status: thread.status, messages, count: thread.messages.length });
});

app.get('/api/conversations/:id/poll', (req, res) => {
  const thread = conversationIndex.get(req.params.id);
  if (!thread) return res.json({ unchanged: true, status: 'Bot Handling', count: 0 });

  const afterCount = Number(req.query.after);
  if (Number.isFinite(afterCount) && afterCount >= 0 && thread.messages.length === afterCount) {
    return res.json({ unchanged: true, status: thread.status, count: thread.messages.length });
  }

  res.json({
    unchanged: false,
    status: thread.status,
    count: thread.messages.length,
    messages: thread.messages,
  });
});

// Submit Lead / Inquiries (Public)
app.post('/api/leads', (req, res) => {
  try {
    const { name, email, phone, category = 'Services', requirements, source = 'Chatbot' } = req.body;
    if (!name || (!email && !phone)) {
      return res.status(400).json({ error: 'Name and either email or phone are required.' });
    }

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      name: String(name).trim(),
      email: String(email || '').trim(),
      phone: String(phone || '').trim(),
      category: ['Services', 'Training', 'Internships', 'Consulting', 'Partnerships', 'Other'].includes(category)
        ? category
        : 'Services',
      requirements: String(requirements || 'Consultation request submitted via website.').trim(),
      timestamp: new Date().toISOString(),
      status: 'New',
      source: source || 'Chatbot',
    };

    store.leads.unshift(newLead);
    logActivity('inquiry', 'New Inquiry Submitted', `${newLead.name} (${newLead.category}) submitted a request.`, newLead.name);
    persistStore();

    return res.status(201).json({
      success: true,
      message: 'Inquiry successfully registered! An advisor will follow up promptly.',
      lead: newLead,
    });
  } catch (error) {
    console.error('Lead submission error:', error);
    return res.status(500).json({ error: 'Failed to submit lead inquiry.' });
  }
});

// ====================================================
// AUTHENTICATION & ADMIN ACCOUNT ENDPOINTS
// ====================================================

app.post('/api/admin/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const account = store.adminAccounts.find((a) => a.email.toLowerCase() === normalizedEmail);

  if (!account || !account.isActive) {
    return res.status(401).json({ error: 'Invalid credentials or inactive admin account.' });
  }

  if (!verifyPassword(String(password), account.passwordHash, account.passwordSalt)) {
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }

  const token = `marvz-sess-${crypto.randomBytes(24).toString('hex')}`;
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(); // 7 days

  store.sessions = store.sessions.filter((s) => new Date(s.expiresAt).getTime() > Date.now());
  store.sessions.push({
    token,
    userId: account.id,
    email: account.email,
    role: account.role,
    createdAt: new Date().toISOString(),
    expiresAt,
  });

  account.lastLogin = new Date().toISOString();
  logActivity('auth', 'Admin Sign-In', `${account.name} (${account.role}) signed into Admin Dashboard.`, account.name);
  persistStore();

  return res.json({
    success: true,
    token,
    user: sanitizeAccount(account),
  });
});

// Protect ALL subsequent /api/admin/* routes
app.use('/api/admin', requireAdminAuth);

app.post('/api/admin/auth/logout', (req: AuthedRequest, res) => {
  if (req.sessionToken) {
    store.sessions = store.sessions.filter((s) => s.token !== req.sessionToken);
    persistStore();
  }
  res.json({ success: true });
});

app.get('/api/admin/auth/me', (req: AuthedRequest, res) => {
  if (!req.adminUser) return res.status(401).json({ error: 'Unauthorized' });
  res.json({ user: sanitizeAccount(req.adminUser) });
});

app.put('/api/admin/auth/profile', (req: AuthedRequest, res) => {
  if (!req.adminUser) return res.status(401).json({ error: 'Unauthorized' });
  const { name, phone, department } = req.body;
  if (name && String(name).trim()) req.adminUser.name = String(name).trim();
  if (phone !== undefined) req.adminUser.phone = String(phone).trim();
  if (department !== undefined) req.adminUser.department = String(department).trim();

  logActivity('auth', 'Admin Profile Updated', `${req.adminUser.name} updated profile details.`, req.adminUser.name);
  persistStore();
  res.json({ success: true, user: sanitizeAccount(req.adminUser) });
});

app.post('/api/admin/auth/change-password', (req: AuthedRequest, res) => {
  if (!req.adminUser) return res.status(401).json({ error: 'Unauthorized' });
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword || String(newPassword).length < 6) {
    return res.status(400).json({ error: 'Current password and new password (min 6 chars) are required.' });
  }

  if (!verifyPassword(String(currentPassword), req.adminUser.passwordHash, req.adminUser.passwordSalt)) {
    return res.status(400).json({ error: 'Current password is incorrect.' });
  }

  const { hash, salt } = hashPassword(String(newPassword));
  req.adminUser.passwordHash = hash;
  req.adminUser.passwordSalt = salt;

  logActivity('auth', 'Admin Password Changed', `${req.adminUser.email} updated account password.`, req.adminUser.name);
  persistStore();
  res.json({ success: true, message: 'Password updated successfully.' });
});

// Admin Team RBAC Users
app.get('/api/admin/users', (_req, res) => {
  res.json({ users: store.adminAccounts.map(sanitizeAccount) });
});

app.post('/api/admin/users', (req: AuthedRequest, res) => {
  if (req.adminUser?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Only Super Admin can create new admin accounts.' });
  }
  const { name, email, role, password, department = 'Operations', phone = '' } = req.body;
  if (!name?.trim() || !email?.trim() || !password || String(password).length < 6) {
    return res.status(400).json({ error: 'Name, email, and password (min 6 chars) are required.' });
  }
  if (store.adminAccounts.some((a) => a.email.toLowerCase() === String(email).trim().toLowerCase())) {
    return res.status(400).json({ error: 'An admin account with this email already exists.' });
  }

  const { hash, salt } = hashPassword(String(password));
  const created: AdminAccount = {
    id: `adm-${Date.now()}`,
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    role: role || 'Support Agent',
    department: String(department).trim(),
    phone: String(phone).trim(),
    passwordHash: hash,
    passwordSalt: salt,
    isActive: true,
    lastLogin: new Date().toISOString(),
  };

  store.adminAccounts.push(created);
  logActivity('auth', 'New Admin Added', `Created ${created.role} account for ${created.email}.`, req.adminUser.name);
  persistStore();
  res.status(201).json({ success: true, user: sanitizeAccount(created) });
});

app.patch('/api/admin/users/:id', (req: AuthedRequest, res) => {
  if (req.adminUser?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Only Super Admin can update admin roles or access.' });
  }
  const target = store.adminAccounts.find((a) => a.id === req.params.id);
  if (!target) return res.status(404).json({ error: 'Admin user not found.' });

  const { role, isActive, department } = req.body;
  if (role) target.role = role;
  if (typeof isActive === 'boolean') target.isActive = isActive;
  if (department !== undefined) target.department = String(department);

  logActivity('auth', 'Admin Role Updated', `Updated permissions for ${target.email} (${target.role}).`, req.adminUser.name);
  persistStore();
  res.json({ success: true, user: sanitizeAccount(target) });
});

app.delete('/api/admin/users/:id', (req: AuthedRequest, res) => {
  if (req.adminUser?.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Only Super Admin can remove admin accounts.' });
  }
  if (req.params.id === req.adminUser.id) {
    return res.status(400).json({ error: 'You cannot delete your own active account.' });
  }
  store.adminAccounts = store.adminAccounts.filter((a) => a.id !== req.params.id);
  store.sessions = store.sessions.filter((s) => s.userId !== req.params.id);
  persistStore();
  res.json({ success: true });
});

// ====================================================
// 1. ADMIN OVERVIEW DASHBOARD ANALYTICS
// ====================================================
app.get('/api/admin/overview', (_req, res) => {
  try {
    const totalLeads = store.leads.length;
    const leadsByStatus = store.leads.reduce(
      (acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
      },
      { New: 0, Contacted: 0, Interested: 0, Converted: 0 } as Record<LeadStatus, number>
    );

    const leadsByCategory = store.leads.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const activeConversations = store.conversations.filter(
      (c) => c.status === 'Needs Human Support' || c.status === 'Human Joined' || c.status === 'Bot Handling'
    ).length;

    const conversionRate =
      totalLeads > 0 ? `${Math.round(((leadsByStatus['Converted'] || 0) / totalLeads) * 100)}%` : '0%';

    const faqHitList = [...store.faqs]
      .sort((a, b) => b.hitCount - a.hitCount)
      .slice(0, 5)
      .map((f) => ({
        question: f.question,
        category: f.category,
        count: f.hitCount,
      }));

    const paidTrainingRegs = store.trainingRegistrations.filter((r) => r.paymentStatus === 'Paid');
    const trainingRevenueBDT = paidTrainingRegs.reduce((sum, r) => sum + (Number(r.feeAmount) || 0), 0);

    res.json({
      totalVisitors: store.visitorCount,
      totalConversations: store.conversations.length,
      activeConversations,
      totalInquiries: totalLeads + store.contactMessages.length,
      unansweredQuestionsCount: store.unansweredQuestions.filter((u) => u.status === 'Pending Review').length,
      leadConversionRate: conversionRate,
      internshipApplicationsCount: store.internships.length,
      pendingInternshipsCount: store.internships.filter((i) => i.status === 'Pending' || i.status === 'Under Review').length,
      trainingRegistrationsCount: store.trainingRegistrations.length,
      paidTrainingCount: paidTrainingRegs.length,
      trainingRevenueBDT,
      contactMessagesCount: store.contactMessages.length,
      unreadContactMessagesCount: store.contactMessages.filter((m) => m.status === 'New').length,
      faqHitList,
      leadsByStatus,
      leadsByCategory,
      conversationTrends: [
        { date: 'Mon', botOnly: 24, humanAssisted: 4 },
        { date: 'Tue', botOnly: 38, humanAssisted: 7 },
        { date: 'Wed', botOnly: 45, humanAssisted: 5 },
        { date: 'Thu', botOnly: 52, humanAssisted: 9 },
        { date: 'Fri', botOnly: 60, humanAssisted: 12 },
        { date: 'Sat', botOnly: 48, humanAssisted: 6 },
        { date: 'Sun', botOnly: 35, humanAssisted: 4 },
      ],
      monthlyMetrics: [
        { label: 'Jan', inquiries: 18, trainings: 14, internships: 9 },
        { label: 'Feb', inquiries: 24, trainings: 19, internships: 12 },
        { label: 'Mar', inquiries: 31, trainings: 22, internships: 15 },
        { label: 'Apr', inquiries: 28, trainings: 27, internships: 19 },
        { label: 'May', inquiries: 39, trainings: 31, internships: 23 },
        {
          label: 'Now',
          inquiries: store.contactMessages.length + store.leads.length,
          trainings: store.trainingRegistrations.length,
          internships: store.internships.length,
        },
      ],
      recentActivities: store.activities.slice(0, 12),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate overview analytics.' });
  }
});

// ====================================================
// 2. WEBSITE CONTENT MANAGEMENT & SECURE FILE UPLOADS
// ====================================================
app.get('/api/admin/content', (_req, res) => {
  res.json({ content: store.websiteContent });
});

app.put('/api/admin/content', (req: AuthedRequest, res) => {
  try {
    const incoming = req.body;
    store.websiteContent = {
      ...store.websiteContent,
      ...incoming,
      services: Array.isArray(incoming.services) ? incoming.services : store.websiteContent.services,
      uploadedAssets: Array.isArray(incoming.uploadedAssets)
        ? incoming.uploadedAssets
        : store.websiteContent.uploadedAssets,
      updatedAt: new Date().toISOString(),
    };
    logActivity(
      'content',
      'Website Content Updated',
      'Updated homepage copy, announcement banner, or service divisions.',
      req.adminUser?.name || 'Admin'
    );
    invalidateChatbotCache();
    persistStore();
    res.json({ success: true, content: store.websiteContent });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update website content.' });
  }
});

app.post('/api/admin/upload', (req: AuthedRequest, res) => {
  try {
    const { fileName, mimeType = 'image/jpeg', base64Data } = req.body;
    if (!fileName || !base64Data) {
      return res.status(400).json({ error: 'File name and base64 content are required.' });
    }

    const ext = path.extname(String(fileName)).toLowerCase();
    const allowed = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.pdf', '.doc', '.docx', '.txt'];
    if (!allowed.includes(ext)) {
      return res.status(400).json({ error: `Unsupported file type: ${ext}` });
    }

    const cleanBase = path
      .basename(String(fileName), ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 48);
    const savedFileName = `${Date.now()}-${cleanBase}${ext}`;
    const rawPayload = String(base64Data).includes(',')
      ? String(base64Data).split(',')[1]
      : String(base64Data);
    const fileBuf = Buffer.from(rawPayload, 'base64');

    if (fileBuf.length > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'File exceeds maximum 10MB upload size.' });
    }

    fs.writeFileSync(path.join(UPLOADS_DIR, savedFileName), fileBuf);

    const url = `/uploads/${savedFileName}`;
    const asset: UploadedMediaAsset = {
      id: `asset-${Date.now()}`,
      name: String(fileName),
      url,
      mimeType: String(mimeType),
      size: `${Math.max(1, Math.round(fileBuf.length / 1024))} KB`,
      uploadedAt: new Date().toISOString(),
    };

    store.websiteContent.uploadedAssets.unshift(asset);
    logActivity('content', 'Media File Uploaded', `Uploaded ${asset.name} (${asset.size})`, req.adminUser?.name || 'Admin');
    persistStore();

    return res.status(201).json({ success: true, asset, url });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Failed to store uploaded file.' });
  }
});

// ====================================================
// 3. INTERNSHIP MANAGEMENT
// ====================================================
app.get('/api/admin/internships', (_req, res) => {
  res.json({ internships: store.internships });
});

app.patch('/api/admin/internships/:id', (req: AuthedRequest, res) => {
  const item = store.internships.find((i) => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Internship application not found.' });

  const { status, adminNotes } = req.body;
  if (status && ['Pending', 'Under Review', 'Approved', 'Rejected'].includes(status)) {
    item.status = status;
    logActivity(
      'internship',
      `Internship ${status}`,
      `${item.fullName}'s application for ${item.track} marked ${status}.`,
      req.adminUser?.name || 'Admin'
    );
  }
  if (adminNotes !== undefined) {
    item.adminNotes = String(adminNotes);
  }

  persistStore();
  res.json({ success: true, application: item });
});

app.delete('/api/admin/internships/:id', (req: AuthedRequest, res) => {
  const target = store.internships.find((i) => i.id === req.params.id);
  if (!target) return res.status(404).json({ error: 'Application not found.' });
  store.internships = store.internships.filter((i) => i.id !== req.params.id);
  logActivity('internship', 'Internship Deleted', `Removed application from ${target.fullName}.`, req.adminUser?.name || 'Admin');
  persistStore();
  res.json({ success: true });
});

// ====================================================
// 4. TRAINING MANAGEMENT (PROGRAMS & PAID REGISTRATIONS)
// ====================================================
app.get('/api/admin/trainings', (_req, res) => {
  res.json({ programs: store.trainingPrograms });
});

app.post('/api/admin/trainings', (req: AuthedRequest, res) => {
  try {
    const {
      title,
      level = 'Intermediate',
      duration = '4-Week Lab',
      format = 'Physical Hardware Lab',
      price = 8000,
      currency = 'BDT',
      seatsTotal = 20,
      seatsAvailable = 20,
      status = 'Open',
      nextBatchDate = '2026-07-01',
      description = '',
      hardwareTools = [],
    } = req.body;

    if (!title?.trim()) return res.status(400).json({ error: 'Program title is required.' });

    const newProg: TrainingProgram = {
      id: `prog-${Date.now()}`,
      title: String(title).trim(),
      level: String(level).trim(),
      duration: String(duration).trim(),
      format: String(format).trim(),
      price: Number(price) || 0,
      currency: currency === 'USD' ? 'USD' : 'BDT',
      seatsTotal: Number(seatsTotal) || 20,
      seatsAvailable: Number(seatsAvailable) || 20,
      status: ['Open', 'Upcoming', 'Closed'].includes(status) ? status : 'Open',
      nextBatchDate: String(nextBatchDate),
      description: String(description).trim(),
      hardwareTools: Array.isArray(hardwareTools)
        ? hardwareTools
        : String(hardwareTools)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
    };

    store.trainingPrograms.unshift(newProg);
    logActivity('training', 'Training Program Added', `Created "${newProg.title}"`, req.adminUser?.name || 'Admin');
    invalidateChatbotCache();
    persistStore();
    res.status(201).json({ success: true, program: newProg });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create training program.' });
  }
});

app.put('/api/admin/trainings/:id', (req: AuthedRequest, res) => {
  const prog = store.trainingPrograms.find((p) => p.id === req.params.id);
  if (!prog) return res.status(404).json({ error: 'Training program not found.' });

  const body = req.body;
  Object.assign(prog, {
    ...body,
    price: body.price !== undefined ? Number(body.price) : prog.price,
    seatsTotal: body.seatsTotal !== undefined ? Number(body.seatsTotal) : prog.seatsTotal,
    seatsAvailable: body.seatsAvailable !== undefined ? Number(body.seatsAvailable) : prog.seatsAvailable,
    hardwareTools: Array.isArray(body.hardwareTools)
      ? body.hardwareTools
      : typeof body.hardwareTools === 'string'
      ? body.hardwareTools.split(',').map((s: string) => s.trim()).filter(Boolean)
      : prog.hardwareTools,
  });

  logActivity('training', 'Training Program Updated', `Updated "${prog.title}"`, req.adminUser?.name || 'Admin');
  invalidateChatbotCache();
  persistStore();
  res.json({ success: true, program: prog });
});

app.delete('/api/admin/trainings/:id', (req: AuthedRequest, res) => {
  const target = store.trainingPrograms.find((p) => p.id === req.params.id);
  store.trainingPrograms = store.trainingPrograms.filter((p) => p.id !== req.params.id);
  if (target) {
    logActivity('training', 'Training Program Deleted', `Deleted "${target.title}"`, req.adminUser?.name || 'Admin');
  }
  invalidateChatbotCache();
  persistStore();
  res.json({ success: true });
});

app.get('/api/admin/training-registrations', (_req, res) => {
  res.json({ registrations: store.trainingRegistrations });
});

app.post('/api/admin/training-registrations', (req: AuthedRequest, res) => {
  const {
    programId,
    studentName,
    email,
    phone,
    organization = '',
    experienceLevel = 'Intermediate',
    paymentStatus = 'Paid',
    paymentMethod = 'Cash at Office',
    transactionId = 'MANUAL-DESK',
    registrationStatus = 'Confirmed',
  } = req.body;

  const prog = store.trainingPrograms.find((p) => p.id === programId) || store.trainingPrograms[0];
  if (!prog || !studentName?.trim()) {
    return res.status(400).json({ error: 'Student name and valid training program are required.' });
  }

  const reg: TrainingRegistration = {
    id: `treg-${Date.now()}`,
    programId: prog.id,
    programTitle: prog.title,
    studentName: String(studentName).trim(),
    email: String(email || '').trim(),
    phone: String(phone || '').trim(),
    organization: String(organization).trim(),
    experienceLevel: String(experienceLevel),
    feeAmount: prog.price,
    currency: prog.currency,
    paymentStatus,
    paymentMethod,
    transactionId: String(transactionId),
    registrationStatus,
    registeredAt: new Date().toISOString(),
  };

  store.trainingRegistrations.unshift(reg);
  logActivity('training', 'Student Enrolled Manually', `${reg.studentName} added to ${reg.programTitle}.`, req.adminUser?.name || 'Admin');
  persistStore();
  res.status(201).json({ success: true, registration: reg });
});

app.patch('/api/admin/training-registrations/:id', (req: AuthedRequest, res) => {
  const reg = store.trainingRegistrations.find((r) => r.id === req.params.id);
  if (!reg) return res.status(404).json({ error: 'Registration record not found.' });

  Object.assign(reg, req.body);
  logActivity(
    'training',
    'Registration Payment/Status Updated',
    `${reg.studentName} (${reg.programTitle}): Payment ${reg.paymentStatus}, Enrollment ${reg.registrationStatus}.`,
    req.adminUser?.name || 'Admin'
  );
  persistStore();
  res.json({ success: true, registration: reg });
});

app.delete('/api/admin/training-registrations/:id', (req, res) => {
  store.trainingRegistrations = store.trainingRegistrations.filter((r) => r.id !== req.params.id);
  persistStore();
  res.json({ success: true });
});

// ====================================================
// 5. CONTACT & INQUIRY MANAGEMENT
// ====================================================
app.get('/api/admin/contacts', (_req, res) => {
  res.json({ messages: store.contactMessages });
});

app.patch('/api/admin/contacts/:id', (req: AuthedRequest, res) => {
  const msg = store.contactMessages.find((m) => m.id === req.params.id);
  if (!msg) return res.status(404).json({ error: 'Contact message not found.' });

  const { status } = req.body;
  if (status && ['New', 'In Progress', 'Replied', 'Resolved'].includes(status)) {
    msg.status = status;
    logActivity('inquiry', 'Contact Status Updated', `Inquiry from ${msg.fullName} set to ${status}.`, req.adminUser?.name || 'Admin');
    persistStore();
  }
  res.json({ success: true, contactMessage: msg });
});

app.post('/api/admin/contacts/:id/reply', (req: AuthedRequest, res) => {
  const msg = store.contactMessages.find((m) => m.id === req.params.id);
  if (!msg) return res.status(404).json({ error: 'Contact message not found.' });

  const { message } = req.body;
  if (!message || !String(message).trim()) {
    return res.status(400).json({ error: 'Reply message cannot be empty.' });
  }

  const replyObj = {
    id: `rep-${Date.now()}`,
    senderName: req.adminUser?.name || 'MARVZ Advisory Team',
    message: String(message).trim(),
    sentAt: new Date().toISOString(),
  };

  msg.replies.push(replyObj);
  msg.status = 'Replied';
  logActivity('inquiry', 'Reply Logged for Contact Inquiry', `Replied to ${msg.fullName} (${msg.email}).`, req.adminUser?.name || 'Admin');
  persistStore();
  res.status(201).json({ success: true, contactMessage: msg });
});

app.delete('/api/admin/contacts/:id', (req, res) => {
  store.contactMessages = store.contactMessages.filter((m) => m.id !== req.params.id);
  persistStore();
  res.json({ success: true });
});

// ====================================================
// 6. LOCATION MANAGEMENT
// ====================================================
app.get('/api/admin/location', (_req, res) => {
  res.json({ location: store.locationConfig });
});

app.put('/api/admin/location', (req: AuthedRequest, res) => {
  try {
    const incoming = req.body;
    const nextAddress = String(incoming.officeAddress ?? store.locationConfig.officeAddress).trim();
    const nextQuery = String(incoming.mapSearchQuery ?? nextAddress).trim();

    store.locationConfig = {
      ...store.locationConfig,
      ...incoming,
      officeAddress: nextAddress,
      mapSearchQuery: nextQuery,
      googleMapsUrl:
        incoming.googleMapsUrl ||
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nextQuery)}`,
      directionsUrl:
        incoming.directionsUrl ||
        `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(nextQuery)}`,
      customLat:
        incoming.customLat !== '' && incoming.customLat !== undefined && incoming.customLat !== null
          ? Number(incoming.customLat)
          : undefined,
      customLng:
        incoming.customLng !== '' && incoming.customLng !== undefined && incoming.customLng !== null
          ? Number(incoming.customLng)
          : undefined,
      updatedAt: new Date().toISOString(),
    };

    // Keep Chatbot & Control Center contact settings aligned
    store.settings.officeLocation = store.locationConfig.officeAddress;
    store.settings.contactPhone = store.locationConfig.contactPhone;
    store.settings.contactWhatsApp = store.locationConfig.contactWhatsApp;
    store.settings.contactEmail = store.locationConfig.contactEmail;

    logActivity(
      'location',
      'Office Location Updated',
      `Updated HQ address/contact info (${store.locationConfig.officeAddress}).`,
      req.adminUser?.name || 'Admin'
    );
    invalidateChatbotCache();
    persistStore();
    res.json({ success: true, location: store.locationConfig });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save location settings.' });
  }
});

// ====================================================
// EXISTING AI KNOWLEDGE BASE, TRAINING CENTER, DOCS, CHAT & CRM ROUTES
// ====================================================

app.get('/api/admin/kb', (_req, res) => {
  res.json({ faqs: store.faqs });
});

app.post('/api/admin/kb', (req: AuthedRequest, res) => {
  try {
    const { question, questionBn, answer, answerBn, category = 'Custom', tags = [], isPublished = true } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ error: 'Question and answer are required.' });
    }

    const newFaq: FAQItem = {
      id: `faq-${Date.now()}`,
      question: question.trim(),
      questionBn: questionBn?.trim() || '',
      answer: answer.trim(),
      answerBn: answerBn?.trim() || '',
      category: category || 'Custom',
      tags: Array.isArray(tags)
        ? tags
        : String(tags)
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
      hitCount: 0,
      isPublished: Boolean(isPublished),
      updatedAt: new Date().toISOString(),
      source: 'Manual',
    };

    store.faqs.unshift(newFaq);
    logActivity('chatbot', 'FAQ Added to Knowledge Base', `Added "${newFaq.question}"`, req.adminUser?.name || 'Admin');
    invalidateChatbotCache();
    persistStore();
    res.status(201).json({ success: true, faq: newFaq });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create FAQ.' });
  }
});

app.put('/api/admin/kb/:id', (req, res) => {
  try {
    const faq = store.faqs.find((f) => f.id === req.params.id);
    if (!faq) return res.status(404).json({ error: 'FAQ not found.' });

    Object.assign(faq, { ...req.body, updatedAt: new Date().toISOString() });
    invalidateChatbotCache();
    persistStore();
    res.json({ success: true, faq });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update FAQ.' });
  }
});

app.delete('/api/admin/kb/:id', (req, res) => {
  store.faqs = store.faqs.filter((f) => f.id !== req.params.id);
  invalidateChatbotCache();
  persistStore();
  res.json({ success: true });
});

app.get('/api/admin/unanswered', (_req, res) => {
  res.json({ questions: store.unansweredQuestions });
});

app.post('/api/admin/unanswered/:id/answer', (req: AuthedRequest, res) => {
  try {
    const { answer, answerBn, category = 'Custom', publishToKb = true } = req.body;
    const item = store.unansweredQuestions.find((q) => q.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Unanswered question record not found.' });

    item.status = 'Answered';
    item.suggestedAnswer = answer;

    if (publishToKb && answer) {
      store.faqs.unshift({
        id: `faq-${Date.now()}`,
        question: item.question,
        questionBn: item.visitorLanguage === 'Bangla' ? item.question : '',
        answer: answer.trim(),
        answerBn: answerBn?.trim() || '',
        category: category || 'Custom',
        tags: [category.toLowerCase(), 'trained'],
        hitCount: 1,
        isPublished: true,
        updatedAt: new Date().toISOString(),
        source: 'TrainingCenter',
      });
    }

    logActivity('chatbot', 'Trained Chatbot Response', `Published answer for "${item.question.slice(0, 48)}..."`, req.adminUser?.name || 'Admin');
    invalidateChatbotCache();
    persistStore();
    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve answer.' });
  }
});

app.delete('/api/admin/unanswered/:id', (req, res) => {
  store.unansweredQuestions = store.unansweredQuestions.filter((q) => q.id !== req.params.id);
  persistStore();
  res.json({ success: true });
});

app.get('/api/admin/documents', (_req, res) => {
  res.json({ documents: store.documents });
});

app.post('/api/admin/documents', (req: AuthedRequest, res) => {
  try {
    const { name, fileType, fileSize, rawContent, category = 'General' } = req.body;
    if (!name || !rawContent) {
      return res.status(400).json({ error: 'File name and text content are required.' });
    }

    const sanitizedText = String(rawContent).trim();
    const newDoc: IngestedDocument = {
      id: `doc-${Date.now()}`,
      name: name.trim(),
      fileType: ['pdf', 'docx', 'txt'].includes(fileType) ? fileType : 'txt',
      fileSize: fileSize || '50 KB',
      uploadedAt: new Date().toISOString(),
      category: category || 'General',
      status: 'Indexed',
      extractedText: sanitizedText,
      chunkCount: Math.max(1, Math.ceil(sanitizedText.length / 500)),
    };

    store.documents.unshift(newDoc);
    logActivity('chatbot', 'Document Indexed for AI', `Indexed "${newDoc.name}"`, req.adminUser?.name || 'Admin');
    invalidateChatbotCache();
    persistStore();

    res.status(201).json({
      success: true,
      message: 'Document successfully parsed and indexed into MARVZ AI Knowledge Base!',
      document: newDoc,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to ingest document.' });
  }
});

app.delete('/api/admin/documents/:id', (req, res) => {
  store.documents = store.documents.filter((d) => d.id !== req.params.id);
  invalidateChatbotCache();
  persistStore();
  res.json({ success: true });
});

app.get('/api/admin/conversations', (_req, res) => {
  res.json({ conversations: store.conversations });
});

app.get('/api/admin/conversations/:id', (req, res) => {
  const conv = conversationIndex.get(req.params.id);
  if (!conv) return res.status(404).json({ error: 'Conversation not found.' });
  res.json({ conversation: conv });
});

app.post('/api/admin/conversations/:id/reply', (req, res) => {
  try {
    const { text, agentName = 'MARVZ Engineering Lead' } = req.body;
    const conv = conversationIndex.get(req.params.id);
    if (!conv) return res.status(404).json({ error: 'Conversation not found.' });
    if (!text || !text.trim()) return res.status(400).json({ error: 'Reply text cannot be empty.' });

    const agentMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: 'agent',
      agentName,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    conv.messages.push(agentMsg);
    conv.status = 'Human Joined';
    conv.lastActivity = new Date().toISOString();
    conv.unreadAdminCount = 0;

    persistStore();
    res.status(201).json({ success: true, message: agentMsg, conversation: conv });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send agent reply.' });
  }
});

app.patch('/api/admin/conversations/:id/status', (req, res) => {
  const { status } = req.body;
  const conv = conversationIndex.get(req.params.id);
  if (!conv) return res.status(404).json({ error: 'Conversation not found.' });

  if (['Bot Handling', 'Needs Human Support', 'Human Joined', 'Resolved'].includes(status)) {
    conv.status = status;
    persistStore();
  }
  res.json({ success: true, conversation: conv });
});

app.get('/api/admin/leads', (_req, res) => {
  res.json({ leads: store.leads });
});

app.post('/api/admin/leads', (req, res) => {
  try {
    const { name, email, phone, category = 'Services', requirements, status = 'New', adminNotes, estimatedValue } = req.body;
    if (!name) return res.status(400).json({ error: 'Lead name is required.' });

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      name: name.trim(),
      email: email?.trim() || '',
      phone: phone?.trim() || '',
      category: category || 'Services',
      requirements: requirements?.trim() || '',
      timestamp: new Date().toISOString(),
      status: status || 'New',
      source: 'Manual Admin',
      adminNotes: adminNotes?.trim() || '',
      estimatedValue: estimatedValue || '',
    };

    store.leads.unshift(newLead);
    persistStore();
    res.status(201).json({ success: true, lead: newLead });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create lead.' });
  }
});

app.patch('/api/admin/leads/:id', (req, res) => {
  const lead = store.leads.find((l) => l.id === req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found.' });

  Object.assign(lead, req.body);
  persistStore();
  res.json({ success: true, lead });
});

app.delete('/api/admin/leads/:id', (req, res) => {
  store.leads = store.leads.filter((l) => l.id !== req.params.id);
  persistStore();
  res.json({ success: true });
});

app.get('/api/admin/settings', (_req, res) => {
  res.json({ settings: store.settings });
});

app.put('/api/admin/settings', (req, res) => {
  try {
    store.settings = { ...store.settings, ...req.body };
    invalidateChatbotCache();
    persistStore();
    res.json({ success: true, settings: store.settings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings.' });
  }
});

// ====================================================
// VITE DEV SERVER / STATIC PRODUCTION MIDDLEWARE
// ====================================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`MARVZ & INNOVATION TECH Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server boot error:', err);
});
