import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import {
  addContactMessageReply,
  computeSubmissionHash,
  deleteContactMessage,
  findRecentDuplicateSubmission,
  getContactMessageById,
  getContactMessageStats,
  insertContactMessage,
  listContactMessages,
  migrateLegacyContactMessages,
  updateContactEmailDeliveryStatus,
  updateContactMessageStatus,
  type ContactMessageStatus as DbContactMessageStatus,
} from './server/contactDb.js';
import {
  getSmtpStatus,
  isSmtpConfigured,
  sendAdminReplyEmail,
  sendContactNotificationEmails,
  sendPasswordResetEmail,
} from './server/emailService.js';
import {
  type AdminRole,
  type AdminUserRecord,
  type LegacyAdminAccountInput,
  VALID_ADMIN_ROLES,
  consumePasswordResetToken,
  countActiveSuperAdmins,
  createAdminSession,
  createAdminUser,
  createPasswordResetToken,
  deleteAdminUser,
  getAdminUserByEmail,
  getAdminUserById,
  initializeAdminUsers,
  listAdminUsers,
  listRecentAuthAuditLogs,
  logAuthAudit,
  normalizeEmail,
  recordAdminLoginTimestamp,
  revokeAllUserSessions,
  revokeSessionByToken,
  setAdminUserPassword,
  toSafeAdminUser,
  updateAdminUserGovernance,
  updateAdminUserProfile,
  upgradePasswordHashDirect,
  validatePasswordStrength,
  verifyAdminSessionToken,
  verifyUserPassword,
} from './server/adminAuthDb.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
app.set('trust proxy', 1);

// Allow JSON payloads up to 15MB for document & image uploads
app.use(express.json({ limit: '15mb' }));

// Block direct HTTP access to internal databases, JSON stores, server modules, or env files
app.use((req, res, next) => {
  const reqPath = req.path.toLowerCase();
  if (
    reqPath === '/data' ||
    reqPath.startsWith('/data/') ||
    reqPath === '/database' ||
    reqPath.startsWith('/database/') ||
    reqPath === '/server' ||
    reqPath.startsWith('/server/') ||
    reqPath === '/backups' ||
    reqPath.startsWith('/backups/') ||
    reqPath.startsWith('/.env') ||
    reqPath.startsWith('/.git') ||
    reqPath === '/server.ts'
  ) {
    return res.status(404).json({ error: 'Not found' });
  }
  next();
});

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
const ADMIN_COOKIE_NAME = 'marvz_admin_session';

// --- Domain Types ---
type LeadStatus = 'New' | 'Contacted' | 'Interested' | 'Converted';

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
  contactEmail: 'marvzinnovationtech@gmail.com',
  contactPhone: '+8801775551987',
  contactWhatsApp: '+8801775551987',
  officeLocation: OFFICIAL_OFFICE_ADDRESS,
};

const DEFAULT_LOCATION: LocationConfig = {
  officeName: 'MARVZ & INNOVATION TECH — Dhaka HQ',
  officeAddress: OFFICIAL_OFFICE_ADDRESS,
  landmarkNote: 'Near Metro Pillar 304, West Shewrapara, Mirpur Corridor',
  cityCountry: 'Dhaka-1216, Bangladesh',
  contactPhone: '+8801775551987',
  contactWhatsApp: '+8801775551987',
  contactEmail: 'marvzinnovationtech@gmail.com',
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
  faqs: DEFAULT_FAQS,
  unansweredQuestions: DEFAULT_UNANSWERED,
  documents: DEFAULT_DOCUMENTS,
  leads: DEFAULT_LEADS,
  conversations: DEFAULT_CONVERSATIONS,
  visitorCount: 1428,
};

let legacyAdminAccountsFromJson: LegacyAdminAccountInput[] = [];

// Load existing data safely while hydrating any newly added modules
try {
  if (fs.existsSync(DB_FILE)) {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.adminAccounts)) {
      legacyAdminAccountsFromJson = parsed.adminAccounts;
    }
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

// Initialize SQLite-backed Admin Accounts, Sessions & Reset Tokens cleanly
try {
  initializeAdminUsers(legacyAdminAccountsFromJson);
} catch (err) {
  console.error('Failed to initialize SQLite admin users:', err);
}

// Migrate any legacy contact messages from JSON store into persistent SQLite database
try {
  migrateLegacyContactMessages(store.contactMessages);
} catch (err) {
  console.error('Failed to migrate legacy contact messages to SQLite:', err);
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

// --- In-Memory Sliding-Window Rate Limiter & Input Sanitization ---
const rateLimitBuckets = new Map<string, number[]>();

function getClientIp(req: Request): string {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.trim()) {
    return fwd.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || req.ip || 'unknown';
}

function checkRateLimit(bucketKey: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const existing = (rateLimitBuckets.get(bucketKey) || []).filter((ts) => now - ts < windowMs);
  if (existing.length >= maxRequests) {
    rateLimitBuckets.set(bucketKey, existing);
    return false;
  }
  existing.push(now);
  rateLimitBuckets.set(bucketKey, existing);
  if (rateLimitBuckets.size > 5000) {
    // Prune oldest buckets to prevent unbounded growth
    const firstKey = rateLimitBuckets.keys().next().value;
    if (firstKey) rateLimitBuckets.delete(firstKey);
  }
  return true;
}

function sanitizeInputText(val: unknown, maxLen: number): string {
  return String(val ?? '')
    .replace(/\0/g, '')
    .replace(/\r\n/g, '\n')
    .trim()
    .slice(0, maxLen);
}

// --- Auth, Cookie, CSRF & RBAC Middleware ---
interface AuthedRequest extends Request {
  adminUser?: AdminUserRecord;
  sessionToken?: string;
  sessionId?: string;
  csrfToken?: string;
  authMethod?: 'cookie' | 'bearer';
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const parsed: Record<string, string> = {};
  if (!cookieHeader) return parsed;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx <= 0) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    try {
      parsed[key] = decodeURIComponent(val);
    } catch {
      parsed[key] = val;
    }
  }
  return parsed;
}

function isHttpsRequest(req: Request): boolean {
  const fwdProto = String(req.headers['x-forwarded-proto'] || '').toLowerCase();
  return req.secure || fwdProto.includes('https') || process.env.COOKIE_SECURE === 'true';
}

function setAdminSessionCookie(
  req: Request,
  res: Response,
  rawToken: string,
  rememberMe: boolean,
  ttlMs: number
) {
  const parts = [
    `${ADMIN_COOKIE_NAME}=${encodeURIComponent(rawToken)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
  ];
  if (rememberMe) {
    parts.push(`Max-Age=${Math.floor(ttlMs / 1000)}`);
  }
  if (isHttpsRequest(req)) {
    parts.push('Secure');
  }
  res.setHeader('Set-Cookie', parts.join('; '));
}

function clearAdminSessionCookie(req: Request, res: Response) {
  const parts = [
    `${ADMIN_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ];
  if (isHttpsRequest(req)) {
    parts.push('Secure');
  }
  res.setHeader('Set-Cookie', parts.join('; '));
}

function getAppBaseUrl(req: Request): string {
  const envUrl = (process.env.APP_URL || '').trim().replace(/\/+$/, '');
  if (envUrl && !envUrl.includes('MY_APP_URL')) {
    return envUrl;
  }
  const proto = isHttpsRequest(req) ? 'https' : 'http';
  const host = req.get('host') || `localhost:${PORT}`;
  return `${proto}://${host}`;
}

function requireAdminAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const cookies = parseCookies(req.headers.cookie);
  const cookieToken = cookies[ADMIN_COOKIE_NAME] || '';
  const authHeader = req.headers.authorization;
  const bearerToken =
    authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  const token = cookieToken || bearerToken;
  const authMethod: 'cookie' | 'bearer' = cookieToken ? 'cookie' : 'bearer';

  if (!token) {
    return res
      .status(401)
      .json({ error: 'Authentication required. Please sign in to the Admin Panel.' });
  }

  const verified = verifyAdminSessionToken(token);
  if (!verified) {
    if (cookieToken) {
      clearAdminSessionCookie(req, res);
    }
    return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
  }

  // CSRF defense on state-changing cookie-authenticated requests
  const isMutation = !['GET', 'HEAD', 'OPTIONS'].includes(req.method.toUpperCase());
  if (isMutation && authMethod === 'cookie') {
    const headerCsrf = String(req.headers['x-csrf-token'] || '');
    const expectedCsrf = verified.session.csrfToken;
    const bearerMatches = Boolean(bearerToken && bearerToken === token);
    const csrfMatches =
      headerCsrf.length === expectedCsrf.length &&
      headerCsrf.length > 0 &&
      crypto.timingSafeEqual(Buffer.from(headerCsrf), Buffer.from(expectedCsrf));

    if (!csrfMatches && !bearerMatches) {
      return res
        .status(403)
        .json({ error: 'Security validation failed (CSRF token missing or invalid).' });
    }

    const originHeader = req.headers.origin;
    if (originHeader) {
      try {
        const originHost = new URL(originHeader).host;
        const reqHost = req.get('host');
        if (reqHost && originHost !== reqHost) {
          return res.status(403).json({ error: 'Cross-origin mutation rejected.' });
        }
      } catch {
        return res.status(403).json({ error: 'Invalid request origin.' });
      }
    }
  }

  req.adminUser = verified.user;
  req.sessionToken = token;
  req.sessionId = verified.session.id;
  req.csrfToken = verified.session.csrfToken;
  req.authMethod = authMethod;
  next();
}

function requireRoles(...allowedRoles: AdminRole[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.adminUser) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (req.adminUser.role === 'Super Admin' || allowedRoles.includes(req.adminUser.role)) {
      return next();
    }
    logAuthAudit({
      eventType: 'ACCESS_DENIED',
      email: req.adminUser.email,
      userId: req.adminUser.id,
      success: false,
      ipAddress: getClientIp(req),
      userAgent: String(req.headers['user-agent'] || ''),
      details: `Role "${req.adminUser.role}" denied ${req.method} ${req.originalUrl}`,
    });
    return res.status(403).json({
      error: `Access denied. Your role (${req.adminUser.role}) does not have permission for this module.`,
    });
  };
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
COMPANY: ${store.websiteContent.heroTagline} | Offices: (1) Operational Office – Banani DOHS: 92/A, Banani DOHS, Dhaka-1213, Bangladesh (Maps: https://www.google.com/maps/search/?api=1&query=92%2FA%2C+Banani+DOHS%2C+Dhaka-1213%2C+Bangladesh) | (2) Operational Office – West Shewrapara: ${store.locationConfig.officeAddress} (Maps: ${store.locationConfig.googleMapsUrl}) | R&D Office: A dedicated facility for AI, Robotics, Drone Technology, Software Development, Cybersecurity, and Technology Research | Institutional Collaborations: Dhaka Cantonment, Bogura Cantonment | Hours: ${store.locationConfig.workingHours} | Email: ${store.locationConfig.contactEmail} | Phone: ${store.locationConfig.contactPhone} | WhatsApp: ${store.locationConfig.contactWhatsApp}.
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

  // Instant dynamic Office Location & Contact cache hit (always matches live LocationConfig + Banani DOHS Operational Office)
  if (
    cleanQuery.length <= 85 &&
    /\b(office|location|address|located|directions|map|banani|dohs|shewrapara|metro pillar|where are you|thikana|kotay|kothay)\b|অফিস|ঠিকানা|কোথায়|কোথায়|লোকেশন|বনানী/i.test(
      qLower
    )
  ) {
    const bananiMapsUrl =
      'https://www.google.com/maps/search/?api=1&query=92%2FA%2C+Banani+DOHS%2C+Dhaka-1213%2C+Bangladesh';
    const reply =
      targetLang === 'Bangla'
        ? `আমাদের অফিসের ঠিকানাসমূহ:\n• **Operational Office – Banani DOHS:** 92/A, Banani DOHS, Dhaka-1213, Bangladesh (Google Maps: ${bananiMapsUrl})\n• **Operational Office – West Shewrapara:** ${store.locationConfig.officeAddress} (Google Maps: ${store.locationConfig.googleMapsUrl})\n• **অফিস সময়:** ${store.locationConfig.workingHours}\n• **ফোন:** ${store.locationConfig.contactPhone} | **হোয়াটসঅ্যাপ:** ${store.locationConfig.contactWhatsApp}`
        : `**MARVZ & INNOVATION TECH — Office Locations:**\n• **Operational Office – Banani DOHS:** 92/A, Banani DOHS, Dhaka-1213, Bangladesh (Google Maps: ${bananiMapsUrl})\n• **Operational Office – West Shewrapara:** ${store.locationConfig.officeAddress} (Google Maps: ${store.locationConfig.googleMapsUrl})\n• **Hours:** ${store.locationConfig.workingHours}\n• **Phone:** ${store.locationConfig.contactPhone} | **WhatsApp:** ${store.locationConfig.contactWhatsApp}`;
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

// Public Contact Form Submission (Validated, Spam-Protected, Persistent SQLite + SMTP Email)
app.post('/api/public/contact', async (req, res) => {
  try {
    const clientIp = getClientIp(req);
    if (!checkRateLimit(`contact:${clientIp}`, 6, 15 * 60 * 1000)) {
      return res.status(429).json({
        error: 'Too many submissions from your network. Please wait a few minutes before trying again.',
      });
    }

    const body = req.body || {};

    // Honeypot anti-spam trap (legitimate users leave this empty)
    if (
      (typeof body.website === 'string' && body.website.trim().length > 0) ||
      (typeof body._gotcha === 'string' && body._gotcha.trim().length > 0)
    ) {
      return res.status(400).json({ error: 'Spam protection triggered. Submission rejected.' });
    }

    const fullName = sanitizeInputText(body.fullName, 120);
    const email = sanitizeInputText(body.email, 160).toLowerCase();
    const phone = sanitizeInputText(body.phone, 40);
    const collaboratorType =
      sanitizeInputText(body.collaboratorType, 100) || 'Student / Independent Builder';
    const technologyDomain =
      sanitizeInputText(body.technologyDomain, 120) || 'Drone Technology & UAV Engineering';
    const subject = sanitizeInputText(body.subject, 200) || 'General Project & Collaboration Inquiry';
    const message = sanitizeInputText(body.message, 5000);

    if (fullName.length < 2) {
      return res.status(400).json({ error: 'Please enter your full name (at least 2 characters).' });
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailPattern.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (message.length < 5) {
      return res.status(400).json({
        error: 'Please enter your project, goal, or workshop inquiry (at least 5 characters).',
      });
    }

    const submissionHash = computeSubmissionHash(email, subject, message);
    const recentDuplicate = findRecentDuplicateSubmission(submissionHash, 10);
    if (recentDuplicate) {
      return res.status(409).json({
        error: 'A duplicate of this message was already submitted recently. Our team has received it and will respond soon.',
      });
    }

    const savedMsg = insertContactMessage({
      fullName,
      email,
      phone,
      collaboratorType,
      technologyDomain,
      subject,
      message,
      ipAddress: clientIp,
      userAgent: sanitizeInputText(req.headers['user-agent'], 250),
      submissionHash,
    });

    // Also mirror into CRM leads for unified pipeline visibility
    store.leads.unshift({
      id: `lead-${Date.now()}`,
      name: savedMsg.fullName,
      email: savedMsg.email,
      phone: savedMsg.phone,
      category: 'Services',
      requirements: `[${savedMsg.technologyDomain}] ${savedMsg.message}`,
      timestamp: savedMsg.createdAt,
      status: 'New',
      source: 'Direct Form',
    });

    const emailDispatch = await sendContactNotificationEmails(
      savedMsg,
      store.locationConfig.contactEmail
    );

    const updatedMsg = updateContactEmailDeliveryStatus(
      savedMsg.id,
      emailDispatch.companyEmailStatus,
      emailDispatch.visitorEmailStatus,
      emailDispatch.error || ''
    );

    if (emailDispatch.error) {
      console.warn(`Contact email dispatch notice for ${savedMsg.id}:`, emailDispatch.error);
    }

    logActivity(
      'inquiry',
      'New Contact Message Received',
      `${savedMsg.fullName} submitted an inquiry regarding ${savedMsg.technologyDomain}.`,
      savedMsg.fullName
    );
    persistStore();

    return res.status(201).json({
      success: true,
      message:
        'Thank you for contacting MARVZ & INNOVATION TECH! Your message has been submitted successfully. Our team will get back to you soon.',
      contactMessage: updatedMsg || savedMsg,
      emailDelivery: {
        configured: emailDispatch.configured,
        companyEmailStatus: emailDispatch.companyEmailStatus,
        visitorEmailStatus: emailDispatch.visitorEmailStatus,
      },
    });
  } catch (err) {
    console.error('Contact form error:', err);
    return res.status(500).json({ error: 'Failed to submit message. Please try again shortly.' });
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
// AUTHENTICATION, FIRST-TIME SETUP, RECOVERY & RBAC
// ====================================================

app.post('/api/admin/auth/account-status', (req, res) => {
  const clientIp = getClientIp(req);
  if (!checkRateLimit(`admin-acct-status:${clientIp}`, 30, 15 * 60 * 1000)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a few minutes.' });
  }
  const email = normalizeEmail(req.body?.email || '');
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }
  const account = getAdminUserByEmail(email);
  if (!account) {
    return res.json({ exists: false, isActive: false, needsPasswordSetup: false });
  }
  return res.json({
    exists: true,
    isActive: account.isActive,
    needsPasswordSetup: account.isActive && account.needsPasswordSetup,
  });
});

app.post('/api/admin/auth/setup-password', async (req, res) => {
  const clientIp = getClientIp(req);
  const userAgent = String(req.headers['user-agent'] || '');
  if (!checkRateLimit(`admin-setup-pw:${clientIp}`, 12, 15 * 60 * 1000)) {
    return res.status(429).json({ error: 'Too many setup attempts. Please try again later.' });
  }

  const email = normalizeEmail(req.body?.email || '');
  const newPassword = String(req.body?.newPassword || '');
  const confirmPassword = String(req.body?.confirmPassword || '');
  const rememberMe = Boolean(req.body?.rememberMe);

  if (!email || !newPassword || !confirmPassword) {
    return res.status(400).json({ error: 'Email, new password, and confirmation are required.' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'New password and confirmation do not match.' });
  }

  const strength = validatePasswordStrength(newPassword);
  if (!strength.valid) {
    return res.status(400).json({
      error: `Password does not meet security requirements: ${strength.errors.join(', ')}.`,
      requirements: strength.errors,
    });
  }

  const account = getAdminUserByEmail(email);
  if (!account) {
    logAuthAudit({
      eventType: 'FIRST_PASSWORD_SETUP',
      email,
      success: false,
      ipAddress: clientIp,
      userAgent,
      details: 'Setup attempted for unknown email.',
    });
    return res.status(404).json({ error: 'No authorized administrator account found for this email.' });
  }

  if (!account.isActive) {
    logAuthAudit({
      eventType: 'FIRST_PASSWORD_SETUP',
      email,
      userId: account.id,
      success: false,
      ipAddress: clientIp,
      userAgent,
      details: 'Account inactive.',
    });
    return res.status(403).json({ error: 'This administrator account is currently inactive.' });
  }

  if (!account.needsPasswordSetup && account.passwordHash) {
    logAuthAudit({
      eventType: 'FIRST_PASSWORD_SETUP',
      email,
      userId: account.id,
      success: false,
      ipAddress: clientIp,
      userAgent,
      details: 'Setup rejected because password is already configured.',
    });
    return res.status(403).json({
      error:
        'A password is already configured for this account. Please sign in or use Forgot Password.',
    });
  }

  const updated = await setAdminUserPassword(account.id, newPassword);
  if (!updated) {
    return res.status(500).json({ error: 'Failed to save administrator password.' });
  }

  recordAdminLoginTimestamp(updated.id);
  const refreshed = getAdminUserById(updated.id) || updated;
  const session = createAdminSession({
    user: refreshed,
    rememberMe,
    ipAddress: clientIp,
    userAgent,
  });

  setAdminSessionCookie(req, res, session.rawToken, rememberMe, session.ttlMs);
  logAuthAudit({
    eventType: 'FIRST_PASSWORD_SETUP',
    email: refreshed.email,
    userId: refreshed.id,
    success: true,
    ipAddress: clientIp,
    userAgent,
    details: 'Initial admin password configured with bcrypt.',
  });
  logActivity(
    'auth',
    'Initial Admin Password Configured',
    `${refreshed.name} (${refreshed.email}) completed first-time password setup.`,
    refreshed.name
  );
  persistStore();

  return res.json({
    success: true,
    token: session.rawToken,
    csrfToken: session.csrfToken,
    expiresAt: session.expiresAt,
    user: toSafeAdminUser(refreshed),
  });
});

app.post('/api/admin/auth/login', async (req, res) => {
  const clientIp = getClientIp(req);
  const userAgent = String(req.headers['user-agent'] || '');
  const email = normalizeEmail(req.body?.email || '');
  const password = String(req.body?.password || '');
  const rememberMe = Boolean(req.body?.rememberMe);

  if (
    !checkRateLimit(`admin-login-ip:${clientIp}`, 15, 15 * 60 * 1000) ||
    (email && !checkRateLimit(`admin-login-email:${email}`, 8, 15 * 60 * 1000))
  ) {
    return res
      .status(429)
      .json({ error: 'Too many login attempts. Please try again in 15 minutes.' });
  }

  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  const account = getAdminUserByEmail(email);
  if (!account) {
    logAuthAudit({
      eventType: 'LOGIN_FAILED',
      email,
      success: false,
      ipAddress: clientIp,
      userAgent,
      details: 'Account not found.',
    });
    return res.status(401).json({ error: 'Invalid credentials or inactive admin account.' });
  }

  if (!account.isActive) {
    logAuthAudit({
      eventType: 'LOGIN_FAILED',
      email,
      userId: account.id,
      success: false,
      ipAddress: clientIp,
      userAgent,
      details: 'Account deactivated.',
    });
    return res.status(403).json({
      error: 'This administrator account is currently deactivated. Contact a Super Admin.',
    });
  }

  if (account.needsPasswordSetup || !account.passwordHash) {
    return res.status(403).json({
      code: 'PASSWORD_SETUP_REQUIRED',
      needsPasswordSetup: true,
      error:
        'No password has been configured for this admin account yet. Complete "Set Your Password" to continue.',
    });
  }

  if (!password) {
    return res.status(400).json({ error: 'Password is required.' });
  }

  const check = await verifyUserPassword(account, password);
  if (!check.valid) {
    logAuthAudit({
      eventType: 'LOGIN_FAILED',
      email,
      userId: account.id,
      success: false,
      ipAddress: clientIp,
      userAgent,
      details: 'Incorrect password.',
    });
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }

  if (check.upgradedBcryptHash) {
    upgradePasswordHashDirect(account.id, check.upgradedBcryptHash);
  }

  recordAdminLoginTimestamp(account.id);
  const refreshed = getAdminUserById(account.id) || account;
  const session = createAdminSession({
    user: refreshed,
    rememberMe,
    ipAddress: clientIp,
    userAgent,
  });

  setAdminSessionCookie(req, res, session.rawToken, rememberMe, session.ttlMs);
  logAuthAudit({
    eventType: 'LOGIN_SUCCESS',
    email: refreshed.email,
    userId: refreshed.id,
    success: true,
    ipAddress: clientIp,
    userAgent,
    details: rememberMe ? 'Persistent session (Remember Me)' : 'Standard session',
  });
  logActivity(
    'auth',
    'Admin Sign-In',
    `${refreshed.name} (${refreshed.role}) signed into Admin Dashboard.`,
    refreshed.name
  );
  persistStore();

  return res.json({
    success: true,
    token: session.rawToken,
    csrfToken: session.csrfToken,
    expiresAt: session.expiresAt,
    user: toSafeAdminUser(refreshed),
  });
});

app.post('/api/admin/auth/forgot-password', async (req, res) => {
  const clientIp = getClientIp(req);
  const userAgent = String(req.headers['user-agent'] || '');
  const email = normalizeEmail(req.body?.email || '');

  if (
    !checkRateLimit(`admin-forgot-ip:${clientIp}`, 6, 15 * 60 * 1000) ||
    (email && !checkRateLimit(`admin-forgot-email:${email}`, 4, 15 * 60 * 1000))
  ) {
    return res
      .status(429)
      .json({ error: 'Too many password reset requests. Please wait 15 minutes.' });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid administrator email address.' });
  }

  if (!isSmtpConfigured()) {
    return res.status(503).json({
      error:
        'Password reset email service is not configured on this server (SMTP_HOST, SMTP_USER, SMTP_PASS required). Please configure SMTP environment variables or contact your Super Admin.',
    });
  }

  const account = getAdminUserByEmail(email);
  if (account && account.isActive) {
    const { resetToken, verificationCode, expiresMinutes } = createPasswordResetToken(account);
    const resetUrl = `${getAppBaseUrl(req)}/admin?mode=reset&email=${encodeURIComponent(
      account.email
    )}&token=${encodeURIComponent(resetToken)}`;

    const mailRes = await sendPasswordResetEmail({
      email: account.email,
      name: account.name,
      resetUrl,
      verificationCode,
      expiresMinutes,
      officialSupportEmail: store.locationConfig.contactEmail,
    });

    logAuthAudit({
      eventType: 'PASSWORD_RESET_REQUESTED',
      email: account.email,
      userId: account.id,
      success: mailRes.sent,
      ipAddress: clientIp,
      userAgent,
      details: mailRes.sent ? 'Reset email dispatched' : `SMTP error: ${mailRes.error}`,
    });

    if (!mailRes.sent) {
      return res.status(502).json({
        error: `Failed to deliver password reset email: ${mailRes.error || 'SMTP error'}`,
      });
    }
  } else {
    logAuthAudit({
      eventType: 'PASSWORD_RESET_REQUESTED',
      email,
      success: false,
      ipAddress: clientIp,
      userAgent,
      details: 'Reset requested for non-existent or inactive account.',
    });
  }

  return res.json({
    success: true,
    emailSent: true,
    message:
      'If an active administrator account exists for this email, a verification code and reset link have been sent.',
  });
});

app.post('/api/admin/auth/reset-password', async (req, res) => {
  const clientIp = getClientIp(req);
  const userAgent = String(req.headers['user-agent'] || '');
  if (!checkRateLimit(`admin-reset-ip:${clientIp}`, 10, 15 * 60 * 1000)) {
    return res.status(429).json({ error: 'Too many reset attempts. Please try again later.' });
  }

  const email = normalizeEmail(req.body?.email || '');
  const tokenOrCode = String(req.body?.tokenOrCode || req.body?.token || '').trim();
  const newPassword = String(req.body?.newPassword || '');
  const confirmPassword = String(req.body?.confirmPassword || '');

  if (!email || !tokenOrCode || !newPassword || !confirmPassword) {
    return res
      .status(400)
      .json({ error: 'Email, verification code/token, and new password are required.' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'New password and confirmation do not match.' });
  }

  const strength = validatePasswordStrength(newPassword);
  if (!strength.valid) {
    return res.status(400).json({
      error: `Password does not meet security requirements: ${strength.errors.join(', ')}.`,
      requirements: strength.errors,
    });
  }

  const verifiedUser = consumePasswordResetToken({ email, tokenOrCode });
  if (!verifiedUser) {
    logAuthAudit({
      eventType: 'PASSWORD_RESET_COMPLETED',
      email,
      success: false,
      ipAddress: clientIp,
      userAgent,
      details: 'Invalid or expired reset token/code.',
    });
    return res.status(400).json({
      error: 'Invalid or expired reset verification code/token. Please request a new reset email.',
    });
  }

  await setAdminUserPassword(verifiedUser.id, newPassword);
  revokeAllUserSessions(verifiedUser.id);
  logAuthAudit({
    eventType: 'PASSWORD_RESET_COMPLETED',
    email: verifiedUser.email,
    userId: verifiedUser.id,
    success: true,
    ipAddress: clientIp,
    userAgent,
    details: 'Password reset completed and prior sessions revoked.',
  });
  logActivity(
    'auth',
    'Admin Password Reset',
    `${verifiedUser.email} completed verified password reset.`,
    verifiedUser.name
  );
  persistStore();

  return res.json({
    success: true,
    message: 'Your password has been reset securely. Please sign in with your new password.',
  });
});

// Protect ALL subsequent /api/admin/* routes with SQLite session + CSRF checks
app.use('/api/admin', requireAdminAuth);

app.post('/api/admin/auth/logout', (req: AuthedRequest, res) => {
  if (req.sessionToken) {
    revokeSessionByToken(req.sessionToken);
  }
  clearAdminSessionCookie(req, res);
  if (req.adminUser) {
    logAuthAudit({
      eventType: 'LOGOUT',
      email: req.adminUser.email,
      userId: req.adminUser.id,
      success: true,
      ipAddress: getClientIp(req),
      userAgent: String(req.headers['user-agent'] || ''),
      details: 'Admin signed out.',
    });
  }
  res.json({ success: true });
});

app.get('/api/admin/auth/me', (req: AuthedRequest, res) => {
  if (!req.adminUser) return res.status(401).json({ error: 'Unauthorized' });
  res.json({
    user: toSafeAdminUser(req.adminUser),
    csrfToken: req.csrfToken,
  });
});

app.put('/api/admin/auth/profile', (req: AuthedRequest, res) => {
  if (!req.adminUser) return res.status(401).json({ error: 'Unauthorized' });
  const { name, phone, department } = req.body || {};
  const updated = updateAdminUserProfile(req.adminUser.id, { name, phone, department });
  if (!updated) return res.status(404).json({ error: 'Admin account not found.' });

  logActivity('auth', 'Admin Profile Updated', `${updated.name} updated profile details.`, updated.name);
  persistStore();
  res.json({ success: true, user: updated });
});

app.post('/api/admin/auth/change-password', async (req: AuthedRequest, res) => {
  if (!req.adminUser) return res.status(401).json({ error: 'Unauthorized' });
  const { currentPassword, newPassword, confirmPassword } = req.body || {};

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required.' });
  }
  if (confirmPassword !== undefined && newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'New password and confirmation do not match.' });
  }

  const strength = validatePasswordStrength(String(newPassword));
  if (!strength.valid) {
    return res.status(400).json({
      error: `New password does not meet security requirements: ${strength.errors.join(', ')}.`,
      requirements: strength.errors,
    });
  }

  const check = await verifyUserPassword(req.adminUser, String(currentPassword));
  if (!check.valid) {
    logAuthAudit({
      eventType: 'PASSWORD_CHANGED',
      email: req.adminUser.email,
      userId: req.adminUser.id,
      success: false,
      ipAddress: getClientIp(req),
      userAgent: String(req.headers['user-agent'] || ''),
      details: 'Current password mismatch.',
    });
    return res.status(400).json({ error: 'Current password is incorrect.' });
  }

  await setAdminUserPassword(req.adminUser.id, String(newPassword));
  // Revoke other active sessions for this user while keeping current session active
  revokeAllUserSessions(req.adminUser.id, req.sessionId);

  logAuthAudit({
    eventType: 'PASSWORD_CHANGED',
    email: req.adminUser.email,
    userId: req.adminUser.id,
    success: true,
    ipAddress: getClientIp(req),
    userAgent: String(req.headers['user-agent'] || ''),
    details: 'Password updated cleanly with bcrypt; other sessions revoked.',
  });
  logActivity('auth', 'Admin Password Changed', `${req.adminUser.email} updated account password.`, req.adminUser.name);
  persistStore();
  res.json({ success: true, message: 'Password updated successfully.' });
});

app.get('/api/admin/auth/audit-logs', requireRoles('Super Admin'), (req: AuthedRequest, res) => {
  const limit = Number(req.query.limit) || 40;
  res.json({ logs: listRecentAuthAuditLogs(limit) });
});

// Admin Team RBAC Users (Strictly Super Admin Governed)
app.get('/api/admin/users', requireRoles('Super Admin'), (_req, res) => {
  res.json({ users: listAdminUsers() });
});

app.post('/api/admin/users', requireRoles('Super Admin'), async (req: AuthedRequest, res) => {
  try {
    const {
      name,
      email,
      role = 'Support Agent',
      password = '',
      requireFirstTimeSetup = false,
      department = 'Operations',
      phone = '',
    } = req.body || {};

    const normalized = normalizeEmail(email);
    if (!name?.trim() || !normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      return res.status(400).json({ error: 'Valid full name and work email are required.' });
    }
    if (!VALID_ADMIN_ROLES.includes(role)) {
      return res.status(400).json({ error: 'Invalid admin role specified.' });
    }
    if (getAdminUserByEmail(normalized)) {
      return res.status(400).json({ error: 'An admin account with this email already exists.' });
    }

    if (!requireFirstTimeSetup) {
      const strength = validatePasswordStrength(String(password));
      if (!strength.valid) {
        return res.status(400).json({
          error: `Initial password must meet security rules: ${strength.errors.join(', ')}.`,
        });
      }
    }

    const created = await createAdminUser({
      name: String(name).trim(),
      email: normalized,
      role,
      department,
      phone,
      password: String(password),
      requireFirstTimeSetup: Boolean(requireFirstTimeSetup),
    });

    logAuthAudit({
      eventType: 'USER_CREATED',
      email: created.email,
      userId: created.id,
      success: true,
      ipAddress: getClientIp(req),
      userAgent: String(req.headers['user-agent'] || ''),
      details: `Created ${created.role} by ${req.adminUser?.email}`,
    });
    logActivity(
      'auth',
      'New Admin Added',
      `Created ${created.role} account for ${created.email}.`,
      req.adminUser?.name || 'Super Admin'
    );
    persistStore();
    res.status(201).json({ success: true, user: created });
  } catch (err) {
    console.error('Create admin user failed:', err);
    res.status(500).json({ error: 'Failed to create admin account.' });
  }
});

app.patch('/api/admin/users/:id', requireRoles('Super Admin'), (req: AuthedRequest, res) => {
  const target = getAdminUserById(req.params.id);
  if (!target) return res.status(404).json({ error: 'Admin user not found.' });

  const { role, isActive, department } = req.body || {};
  if (role && !VALID_ADMIN_ROLES.includes(role)) {
    return res.status(400).json({ error: 'Invalid role specified.' });
  }

  if (target.id === req.adminUser?.id && (role && role !== 'Super Admin' || isActive === false)) {
    return res.status(400).json({ error: 'You cannot demote or deactivate your own active session.' });
  }

  if (
    target.role === 'Super Admin' &&
    ((role && role !== 'Super Admin') || isActive === false) &&
    countActiveSuperAdmins(target.id) === 0
  ) {
    return res.status(400).json({ error: 'At least one active Super Admin must remain.' });
  }

  const updated = updateAdminUserGovernance(target.id, { role, isActive, department });
  if (!updated) return res.status(404).json({ error: 'Admin user not found.' });

  logAuthAudit({
    eventType: 'USER_UPDATED',
    email: updated.email,
    userId: updated.id,
    success: true,
    ipAddress: getClientIp(req),
    userAgent: String(req.headers['user-agent'] || ''),
    details: `Role=${updated.role}, active=${updated.isActive} updated by ${req.adminUser?.email}`,
  });
  logActivity(
    'auth',
    'Admin Role Updated',
    `Updated permissions for ${updated.email} (${updated.role}).`,
    req.adminUser?.name || 'Super Admin'
  );
  persistStore();
  res.json({ success: true, user: updated });
});

app.delete('/api/admin/users/:id', requireRoles('Super Admin'), (req: AuthedRequest, res) => {
  const target = getAdminUserById(req.params.id);
  if (!target) return res.status(404).json({ error: 'Admin user not found.' });
  if (req.params.id === req.adminUser?.id) {
    return res.status(400).json({ error: 'You cannot delete your own active account.' });
  }
  if (target.role === 'Super Admin' && countActiveSuperAdmins(target.id) === 0) {
    return res.status(400).json({ error: 'Cannot delete the last remaining active Super Admin.' });
  }

  deleteAdminUser(target.id);
  logAuthAudit({
    eventType: 'USER_DELETED',
    email: target.email,
    userId: target.id,
    success: true,
    ipAddress: getClientIp(req),
    userAgent: String(req.headers['user-agent'] || ''),
    details: `Deleted by ${req.adminUser?.email}`,
  });
  logActivity('auth', 'Admin Account Removed', `Removed ${target.email}.`, req.adminUser?.name || 'Super Admin');
  persistStore();
  res.json({ success: true });
});

// ====================================================
// 1. ADMIN OVERVIEW DASHBOARD ANALYTICS
// ====================================================
app.get('/api/admin/overview', (req: AuthedRequest, res) => {
  try {
    const role = req.adminUser?.role || 'Support Agent';
    const canViewSupport = role === 'Super Admin' || role === 'Support Agent';
    const canViewHrTraining = role === 'Super Admin' || role === 'HR & Training Coordinator';
    const canViewKnowledge =
      role === 'Super Admin' || role === 'Content Manager' || role === 'Knowledge Editor';

    const totalLeads = canViewSupport ? store.leads.length : 0;
    const leadsByStatus = canViewSupport
      ? store.leads.reduce(
          (acc, curr) => {
            acc[curr.status] = (acc[curr.status] || 0) + 1;
            return acc;
          },
          { New: 0, Contacted: 0, Interested: 0, Converted: 0 } as Record<LeadStatus, number>
        )
      : { New: 0, Contacted: 0, Interested: 0, Converted: 0 };

    const leadsByCategory = canViewSupport
      ? store.leads.reduce((acc, curr) => {
          acc[curr.category] = (acc[curr.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      : {};

    const activeConversations = canViewSupport
      ? store.conversations.filter(
          (c) => c.status === 'Needs Human Support' || c.status === 'Human Joined' || c.status === 'Bot Handling'
        ).length
      : 0;

    const conversionRate =
      canViewSupport && totalLeads > 0
        ? `${Math.round(((leadsByStatus['Converted'] || 0) / totalLeads) * 100)}%`
        : '0%';

    const faqHitList =
      canViewKnowledge || canViewSupport
        ? [...store.faqs]
            .sort((a, b) => b.hitCount - a.hitCount)
            .slice(0, 5)
            .map((f) => ({
              question: f.question,
              category: f.category,
              count: f.hitCount,
            }))
        : [];

    const paidTrainingRegs = canViewHrTraining
      ? store.trainingRegistrations.filter((r) => r.paymentStatus === 'Paid')
      : [];
    const trainingRevenueBDT = canViewHrTraining
      ? paidTrainingRegs.reduce((sum, r) => sum + (Number(r.feeAmount) || 0), 0)
      : 0;
    const contactStats = canViewSupport ? getContactMessageStats() : { total: 0, unread: 0, new: 0, read: 0, replied: 0, archived: 0 };

    const allowedActivityTypes = new Set<string>();
    if (role === 'Super Admin') {
      ['inquiry', 'internship', 'training', 'content', 'location', 'chatbot', 'auth'].forEach((t) =>
        allowedActivityTypes.add(t)
      );
    } else {
      if (canViewSupport) allowedActivityTypes.add('inquiry');
      if (canViewHrTraining) {
        allowedActivityTypes.add('internship');
        allowedActivityTypes.add('training');
      }
      if (role === 'Content Manager') {
        allowedActivityTypes.add('content');
        allowedActivityTypes.add('location');
        allowedActivityTypes.add('chatbot');
      }
      if (role === 'Knowledge Editor') {
        allowedActivityTypes.add('chatbot');
      }
    }

    const recentActivities = store.activities
      .filter((a) => allowedActivityTypes.has(a.type))
      .slice(0, 12);

    res.json({
      totalVisitors: store.visitorCount,
      totalConversations: canViewSupport ? store.conversations.length : 0,
      activeConversations,
      totalInquiries: canViewSupport ? totalLeads + contactStats.total : 0,
      unansweredQuestionsCount: canViewKnowledge
        ? store.unansweredQuestions.filter((u) => u.status === 'Pending Review').length
        : 0,
      leadConversionRate: conversionRate,
      internshipApplicationsCount: canViewHrTraining ? store.internships.length : 0,
      pendingInternshipsCount: canViewHrTraining
        ? store.internships.filter((i) => i.status === 'Pending' || i.status === 'Under Review').length
        : 0,
      trainingRegistrationsCount: canViewHrTraining ? store.trainingRegistrations.length : 0,
      paidTrainingCount: paidTrainingRegs.length,
      trainingRevenueBDT,
      contactMessagesCount: contactStats.total,
      unreadContactMessagesCount: contactStats.unread,
      faqHitList,
      leadsByStatus,
      leadsByCategory,
      conversationTrends: canViewSupport
        ? [
            { date: 'Mon', botOnly: 24, humanAssisted: 4 },
            { date: 'Tue', botOnly: 38, humanAssisted: 7 },
            { date: 'Wed', botOnly: 45, humanAssisted: 5 },
            { date: 'Thu', botOnly: 52, humanAssisted: 9 },
            { date: 'Fri', botOnly: 60, humanAssisted: 12 },
            { date: 'Sat', botOnly: 48, humanAssisted: 6 },
            { date: 'Sun', botOnly: 35, humanAssisted: 4 },
          ]
        : [],
      monthlyMetrics: [
        { label: 'Jan', inquiries: canViewSupport ? 18 : 0, trainings: canViewHrTraining ? 14 : 0, internships: canViewHrTraining ? 9 : 0 },
        { label: 'Feb', inquiries: canViewSupport ? 24 : 0, trainings: canViewHrTraining ? 19 : 0, internships: canViewHrTraining ? 12 : 0 },
        { label: 'Mar', inquiries: canViewSupport ? 31 : 0, trainings: canViewHrTraining ? 22 : 0, internships: canViewHrTraining ? 15 : 0 },
        { label: 'Apr', inquiries: canViewSupport ? 28 : 0, trainings: canViewHrTraining ? 27 : 0, internships: canViewHrTraining ? 19 : 0 },
        { label: 'May', inquiries: canViewSupport ? 39 : 0, trainings: canViewHrTraining ? 31 : 0, internships: canViewHrTraining ? 23 : 0 },
        {
          label: 'Now',
          inquiries: canViewSupport ? contactStats.total + store.leads.length : 0,
          trainings: canViewHrTraining ? store.trainingRegistrations.length : 0,
          internships: canViewHrTraining ? store.internships.length : 0,
        },
      ],
      recentActivities,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate overview analytics.' });
  }
});

// ====================================================
// 2. WEBSITE CONTENT MANAGEMENT & SECURE FILE UPLOADS
// ====================================================
app.get('/api/admin/content', requireRoles('Super Admin', 'Content Manager'), (_req, res) => {
  res.json({ content: store.websiteContent });
});

app.put('/api/admin/content', requireRoles('Super Admin', 'Content Manager'), (req: AuthedRequest, res) => {
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

app.post('/api/admin/upload', requireRoles('Super Admin', 'Content Manager'), (req: AuthedRequest, res) => {
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
app.get('/api/admin/internships', requireRoles('Super Admin', 'HR & Training Coordinator'), (_req, res) => {
  res.json({ internships: store.internships });
});

app.patch('/api/admin/internships/:id', requireRoles('Super Admin', 'HR & Training Coordinator'), (req: AuthedRequest, res) => {
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

app.delete('/api/admin/internships/:id', requireRoles('Super Admin', 'HR & Training Coordinator'), (req: AuthedRequest, res) => {
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
app.get('/api/admin/trainings', requireRoles('Super Admin', 'HR & Training Coordinator'), (_req, res) => {
  res.json({ programs: store.trainingPrograms });
});

app.post('/api/admin/trainings', requireRoles('Super Admin', 'HR & Training Coordinator'), (req: AuthedRequest, res) => {
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

app.put('/api/admin/trainings/:id', requireRoles('Super Admin', 'HR & Training Coordinator'), (req: AuthedRequest, res) => {
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

app.delete('/api/admin/trainings/:id', requireRoles('Super Admin', 'HR & Training Coordinator'), (req: AuthedRequest, res) => {
  const target = store.trainingPrograms.find((p) => p.id === req.params.id);
  store.trainingPrograms = store.trainingPrograms.filter((p) => p.id !== req.params.id);
  if (target) {
    logActivity('training', 'Training Program Deleted', `Deleted "${target.title}"`, req.adminUser?.name || 'Admin');
  }
  invalidateChatbotCache();
  persistStore();
  res.json({ success: true });
});

app.get('/api/admin/training-registrations', requireRoles('Super Admin', 'HR & Training Coordinator'), (_req, res) => {
  res.json({ registrations: store.trainingRegistrations });
});

app.post('/api/admin/training-registrations', requireRoles('Super Admin', 'HR & Training Coordinator'), (req: AuthedRequest, res) => {
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

app.patch('/api/admin/training-registrations/:id', requireRoles('Super Admin', 'HR & Training Coordinator'), (req: AuthedRequest, res) => {
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

app.delete('/api/admin/training-registrations/:id', requireRoles('Super Admin', 'HR & Training Coordinator'), (req, res) => {
  store.trainingRegistrations = store.trainingRegistrations.filter((r) => r.id !== req.params.id);
  persistStore();
  res.json({ success: true });
});

// ====================================================
// 5. CONTACT MESSAGES / INQUIRY MANAGEMENT (SQLite + SMTP)
// ====================================================
app.get('/api/admin/contacts', requireRoles('Super Admin', 'Support Agent'), (_req, res) => {
  res.json({
    messages: listContactMessages(),
    counts: getContactMessageStats(),
    emailConfig: getSmtpStatus(store.locationConfig.contactEmail),
  });
});

app.patch('/api/admin/contacts/:id', requireRoles('Super Admin', 'Support Agent'), (req: AuthedRequest, res) => {
  const { status } = req.body || {};
  const validStatuses: DbContactMessageStatus[] = ['New', 'Read', 'Replied', 'Archived'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Valid status required: New, Read, Replied, or Archived.' });
  }

  const updated = updateContactMessageStatus(req.params.id, status);
  if (!updated) return res.status(404).json({ error: 'Contact message not found.' });

  logActivity(
    'inquiry',
    'Contact Status Updated',
    `Inquiry from ${updated.fullName} set to ${status}.`,
    req.adminUser?.name || 'Admin'
  );
  persistStore();
  res.json({ success: true, contactMessage: updated, counts: getContactMessageStats() });
});

app.post('/api/admin/contacts/:id/reply', requireRoles('Super Admin', 'Support Agent'), async (req: AuthedRequest, res) => {
  const existing = getContactMessageById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Contact message not found.' });

  const replyText = sanitizeInputText(req.body?.message, 5000);
  if (!replyText) {
    return res.status(400).json({ error: 'Reply message cannot be empty.' });
  }

  const senderName = req.adminUser?.name || 'MARVZ Advisory Team';
  const emailRes = await sendAdminReplyEmail({
    visitorName: existing.fullName,
    visitorEmail: existing.email,
    originalSubject: existing.subject,
    replyBody: replyText,
    senderName,
    officialEmail: store.locationConfig.contactEmail,
  });

  const updated = addContactMessageReply(existing.id, senderName, replyText, emailRes.sent);
  logActivity(
    'inquiry',
    emailRes.sent ? 'Official Email Reply Sent' : 'Reply Logged for Contact Inquiry',
    `Replied to ${existing.fullName} (${existing.email}).`,
    senderName
  );
  persistStore();
  res.status(201).json({
    success: true,
    contactMessage: updated,
    emailSent: emailRes.sent,
    emailError: emailRes.error,
    counts: getContactMessageStats(),
  });
});

app.post('/api/admin/contacts/:id/resend-email', requireRoles('Super Admin', 'Support Agent'), async (req: AuthedRequest, res) => {
  const existing = getContactMessageById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Contact message not found.' });

  const dispatch = await sendContactNotificationEmails(existing, store.locationConfig.contactEmail);
  const updated = updateContactEmailDeliveryStatus(
    existing.id,
    dispatch.companyEmailStatus,
    dispatch.visitorEmailStatus,
    dispatch.error || ''
  );

  logActivity(
    'inquiry',
    'Contact Email Notification Re-dispatched',
    `Triggered email delivery check for ${existing.fullName} (${dispatch.companyEmailStatus}).`,
    req.adminUser?.name || 'Admin'
  );
  persistStore();
  res.json({
    success: dispatch.companyEmailStatus === 'sent',
    contactMessage: updated,
    emailDelivery: dispatch,
  });
});

app.delete('/api/admin/contacts/:id', requireRoles('Super Admin', 'Support Agent'), (req: AuthedRequest, res) => {
  const existing = getContactMessageById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Contact message not found.' });

  deleteContactMessage(req.params.id);
  logActivity(
    'inquiry',
    'Contact Message Deleted',
    `Deleted inquiry from ${existing.fullName} (${existing.email}).`,
    req.adminUser?.name || 'Admin'
  );
  persistStore();
  res.json({ success: true, counts: getContactMessageStats() });
});

// ====================================================
// 6. LOCATION MANAGEMENT
// ====================================================
app.get('/api/admin/location', requireRoles('Super Admin', 'Content Manager'), (_req, res) => {
  res.json({ location: store.locationConfig });
});

app.put('/api/admin/location', requireRoles('Super Admin', 'Content Manager'), (req: AuthedRequest, res) => {
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

app.get('/api/admin/kb', requireRoles('Super Admin', 'Content Manager', 'Knowledge Editor'), (_req, res) => {
  res.json({ faqs: store.faqs });
});

app.post('/api/admin/kb', requireRoles('Super Admin', 'Content Manager', 'Knowledge Editor'), (req: AuthedRequest, res) => {
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

app.put('/api/admin/kb/:id', requireRoles('Super Admin', 'Content Manager', 'Knowledge Editor'), (req, res) => {
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

app.delete('/api/admin/kb/:id', requireRoles('Super Admin', 'Content Manager', 'Knowledge Editor'), (req, res) => {
  store.faqs = store.faqs.filter((f) => f.id !== req.params.id);
  invalidateChatbotCache();
  persistStore();
  res.json({ success: true });
});

app.get('/api/admin/unanswered', requireRoles('Super Admin', 'Content Manager', 'Knowledge Editor'), (_req, res) => {
  res.json({ questions: store.unansweredQuestions });
});

app.post('/api/admin/unanswered/:id/answer', requireRoles('Super Admin', 'Content Manager', 'Knowledge Editor'), (req: AuthedRequest, res) => {
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

app.delete('/api/admin/unanswered/:id', requireRoles('Super Admin', 'Content Manager', 'Knowledge Editor'), (req, res) => {
  store.unansweredQuestions = store.unansweredQuestions.filter((q) => q.id !== req.params.id);
  persistStore();
  res.json({ success: true });
});

app.get('/api/admin/documents', requireRoles('Super Admin', 'Content Manager', 'Knowledge Editor'), (_req, res) => {
  res.json({ documents: store.documents });
});

app.post('/api/admin/documents', requireRoles('Super Admin', 'Content Manager', 'Knowledge Editor'), (req: AuthedRequest, res) => {
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

app.delete('/api/admin/documents/:id', requireRoles('Super Admin', 'Content Manager', 'Knowledge Editor'), (req, res) => {
  store.documents = store.documents.filter((d) => d.id !== req.params.id);
  invalidateChatbotCache();
  persistStore();
  res.json({ success: true });
});

app.get('/api/admin/conversations', requireRoles('Super Admin', 'Support Agent'), (_req, res) => {
  res.json({ conversations: store.conversations });
});

app.get('/api/admin/conversations/:id', requireRoles('Super Admin', 'Support Agent'), (req, res) => {
  const conv = conversationIndex.get(req.params.id);
  if (!conv) return res.status(404).json({ error: 'Conversation not found.' });
  res.json({ conversation: conv });
});

app.post('/api/admin/conversations/:id/reply', requireRoles('Super Admin', 'Support Agent'), (req, res) => {
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

app.patch('/api/admin/conversations/:id/status', requireRoles('Super Admin', 'Support Agent'), (req, res) => {
  const { status } = req.body;
  const conv = conversationIndex.get(req.params.id);
  if (!conv) return res.status(404).json({ error: 'Conversation not found.' });

  if (['Bot Handling', 'Needs Human Support', 'Human Joined', 'Resolved'].includes(status)) {
    conv.status = status;
    persistStore();
  }
  res.json({ success: true, conversation: conv });
});

app.get('/api/admin/leads', requireRoles('Super Admin', 'Support Agent'), (_req, res) => {
  res.json({ leads: store.leads });
});

app.post('/api/admin/leads', requireRoles('Super Admin', 'Support Agent'), (req, res) => {
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

app.patch('/api/admin/leads/:id', requireRoles('Super Admin', 'Support Agent'), (req, res) => {
  const lead = store.leads.find((l) => l.id === req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found.' });

  Object.assign(lead, req.body);
  persistStore();
  res.json({ success: true, lead });
});

app.delete('/api/admin/leads/:id', requireRoles('Super Admin', 'Support Agent'), (req, res) => {
  store.leads = store.leads.filter((l) => l.id !== req.params.id);
  persistStore();
  res.json({ success: true });
});

app.get('/api/admin/settings', requireRoles('Super Admin'), (_req, res) => {
  res.json({ settings: store.settings });
});

app.put('/api/admin/settings', requireRoles('Super Admin'), (req, res) => {
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
