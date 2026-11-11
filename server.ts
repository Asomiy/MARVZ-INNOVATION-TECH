import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Allow JSON payloads up to 15MB for document uploads
app.use(express.json({ limit: '15mb' }));

// Ensure data directory exists
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const DB_FILE = path.join(DATA_DIR, 'admin_store.json');

// --- Types ---
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
  category: 'AI' | 'Software' | 'Robotics' | 'Drones' | 'Cybersecurity' | 'Training' | 'Internships' | 'Contact' | 'Custom';
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

// Default Seed Data
const DEFAULT_SETTINGS: ControlCenterSettings = {
  chatbotName: 'MARVZ AI Assistant',
  welcomeMessage: 'Hello! Welcome to MARVZ & INNOVATION TECH. How can I assist you today?',
  welcomeMessageBn: 'হ্যালো! MARVZ & INNOVATION TECH-এ আপনাকে স্বাগতম। আজ আপনাকে কীভাবে সাহায্য করতে পারি?',
  brandPrimaryColor: '#DC2626',
  brandAccentColor: '#EF4444',
  brandTheme: 'Dark Obsidian',
  enableBangla: true,
  enableEnglish: true,
  defaultLanguage: 'Auto',
  aiModel: 'gemini-3.8-flash',
  temperature: 0.65,
  enableLeadFormPrompt: true,
  enableHumanEscalation: true,
  enableQuickReplies: true,
  enableVoiceInput: true,
  contactEmail: 'contact@marvztech.com',
  contactPhone: '+880 1800-MARVZ-TECH',
  contactWhatsApp: '+880 1711-000000',
  officeLocation: 'Innovation Hub, Level 4, Tech Park',
};

const DEFAULT_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'AI',
    question: 'What AI and Machine Learning solutions does MARVZ develop?',
    questionBn: 'আপনারা কি কি এআই ও মেশিন লার্নিং সেবা প্রদান করেন?',
    answer: 'MARVZ engineers bespoke Generative AI agents, Large Language Model (LLM) fine-tuning, automated workflow pipelines, Computer Vision for defect & facial recognition, and predictive data science analytics.',
    answerBn: 'আমরা কাস্টম জেনারেটিভ এআই সিস্টেম, এলএলএম ইন্টিগ্রেশন, কম্পিউটার ভিশন, অটোমেটেড ওয়ার্কফ্লো এবং প্রেডিক্টিভ ডেটা অ্যানালিটিক্স সলিউশন ডেভেলপ করি।',
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
    answer: 'Yes! We develop autonomous UAV solutions for aerial mapping, infrastructure inspection, and precision agriculture. We also host practical flight workshops with ArduPilot/PX4 avionics in our dedicated indoor test cage.',
    answerBn: 'হ্যাঁ! আমরা অ্যারিয়াল ম্যাপিং ও এগ্রিকালচারাল ড্রোনের পাশাপাশি হ্যান্ডস-অন ড্রোন অ্যাসেম্বলি এবং ফ্লাইট ট্রেনিং পরিচালনা করি।',
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
    answer: 'We build 6-axis robotic arms for pick-and-place, assembly, ROS 2-based autonomous ground vehicles, and IoT sensor telemetry networks with real-time industrial dashboards.',
    answerBn: 'আমরা ইন্ডাস্ট্রিয়াল ৬-অ্যাক্সিস রোবোটিক আর্ম, ROS ২ বেসড অটোনমাস সিস্টেম এবং আইওটি অটোমেশন তৈরি করি।',
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
    answer: 'We craft scalable applications using React, Next.js, Node.js, Python FastAPI, PostgreSQL, AWS/GCP cloud architectures, and cross-platform mobile apps with Flutter & React Native.',
    answerBn: 'আমরা React, Next.js, Node.js, Python, PostgreSQL এবং Flutter/React Native দিয়ে হাই-পারফরম্যান্স ওয়েব ও মোবাইল অ্যাপ্লিকেশন ডেভেলপ করি।',
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
    answer: 'Yes. Our offensive and defensive security teams conduct Vulnerability Assessment and Penetration Testing (VAPT), cloud security posture reviews, and train corporate engineers in red-team defensive tactics.',
    answerBn: 'হ্যাঁ, আমরা এন্টারপ্রাইজ VAPT সিকিউরিটি অডিট করি এবং প্র্যাকটিক্যাল এথিক্যাল হ্যাকিং ও সাইবার ডিফেন্স ট্রেনিং প্রদান করি।',
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
    answer: 'Every training track features physical prototyping kits (microcontrollers, flight controllers, sensor arrays), real cloud sandboxes, and capstone projects evaluated by industry leads.',
    answerBn: 'অবশ্যই! আমাদের প্রতিটি কোর্সে রিয়েল হার্ডওয়্যার কিটস, ল্যাব প্র্যাকটিস এবং ইন্ডাস্ট্রি প্রজেক্ট অন্তর্ভুক্ত থাকে।',
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
    answer: 'Students and fresh graduates in Computer Science, Electrical/Robotics Engineering, or related technical fields with strong passion for innovation. We offer 3-month and 6-month cohorts with mentorship and certificates.',
    answerBn: 'সিএসই, ইইই বা রোবোটিক্স ব্যাকগ্রাউন্ডের শিক্ষার্থী ও ফ্রেশ গ্র্যাজুয়েটরা ৩ থেকে ৬ মাসের এই ফেলোশিপে আবেদন করতে পারেন।',
    tags: ['internship', 'careers', 'jobs', 'research fellowship', 'students'],
    hitCount: 47,
    isPublished: true,
    updatedAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    source: 'Manual',
  },
  {
    id: 'faq-8',
    category: 'Contact',
    question: 'How do I visit your Innovation Hub or schedule a consultation?',
    questionBn: 'আপনাদের ইনোভেশন হাব কীভাবে ভিজিট করব বা মিটিং বুক করব?',
    answer: 'Our Innovation Hub is located at Level 4, Tech Park. You can book an appointment via our chatbot lead form, call +880 1800-MARVZ-TECH, or message our WhatsApp advisor line at +880 1711-000000.',
    answerBn: 'আমাদের অফিস টেক পার্কের লেভেল ৪-এ অবস্থিত। চ্যাটবটে ফর্ম পূরণ করে বা সরাসরি হোয়াটসঅ্যাপে (+880 1711-000000) যোগাযোগ করে মিটিং বুক করতে পারেন।',
    tags: ['contact', 'office', 'location', 'phone', 'whatsapp', 'address'],
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
    suggestedAnswer: 'Yes, we provide 2 to 3 flexible installment milestones for enrolled bootcamp students upon registration verification.',
  },
  {
    id: 'una-2',
    question: 'আপনারা কি ড্রোনের ড্রাফটিং ও কমার্শিয়াল লাইসেন্সিং বিএফসিএ/সিভিল এভিয়েশন অনুমোদনে সাহায্য করেন?',
    visitorLanguage: 'Bangla',
    askedAt: new Date(Date.now() - 3600000 * 9).toISOString(),
    conversationId: 'conv-203',
    status: 'Pending Review',
    suggestedAnswer: 'হ্যাঁ, আমাদের ড্রোন কোর্সে সিভিল এভিয়েশন অথরিটি অনুমোদিত রেগুলেশন গাইডলাইন এবং পাইলট কমপ্লায়েন্স সার্টিফিকেশন প্রস্তুতি অন্তর্ভুক্ত রয়েছে।',
  },
  {
    id: 'una-3',
    question: 'Can your enterprise software team integrate directly with an on-premises Oracle ERP database?',
    visitorLanguage: 'English',
    askedAt: new Date(Date.now() - 3600000 * 16).toISOString(),
    conversationId: 'conv-204',
    status: 'Pending Review',
    suggestedAnswer: 'Absolutely. We build custom ETL pipelines and authenticated microservices bridging legacy Oracle ERPs to modern cloud portals.',
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
    extractedText: 'MARVZ AI & Deep Learning Masterclass: 16 weeks duration. Covers PyTorch, Transformer architectures, Fine-tuning Llama and Gemini models, Vector DBs (Chroma/Pinecone), RAG engineering, and Autonomous Agents. Includes capstone deployment to Google Cloud Run.',
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
    extractedText: 'Robotics Prototyping Facility Specifications: Equipped with four 6-axis industrial robotic arms, high-precision stepper controllers, digital oscilloscopes, CNC PCB milling station, and stereo vision cameras. Available for client pilot validation and research internships.',
    chunkCount: 5,
  },
  {
    id: 'doc-3',
    name: 'Corporate_Consulting_RateCard_Policy.txt',
    fileType: 'txt',
    fileSize: '120 KB',
    uploadedAt: new Date(Date.now() - 3600000 * 90).toISOString(),
    category: 'Services',
    status: 'Indexed',
    extractedText: 'Enterprise Consultation Framework: Preliminary discovery call is complimentary. Full technical architecture blueprint and proof-of-concept (PoC) sprint typically delivers within 14 business days. NDA signed prior to code sharing.',
    chunkCount: 3,
  },
];

const DEFAULT_LEADS: Lead[] = [
  {
    id: 'lead-101',
    name: 'Rahim Chowdhury',
    email: 'rahim.chowdhury@techventures.io',
    phone: '+880 1712-345678',
    category: 'Services',
    requirements: 'Need enterprise AI automation pipeline for inventory prediction and customer support integration.',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: 'Interested',
    source: 'Chatbot',
    adminNotes: 'Spoke on phone. Very keen on computer vision module for warehouse. Scheduled tech scoping demo for Thursday.',
    estimatedValue: '$8,500',
  },
  {
    id: 'lead-102',
    name: 'Sarah Jenkins',
    email: 's.jenkins@aeroglobal.co.uk',
    phone: '+44 20 7946 0912',
    category: 'Training',
    requirements: 'Interested in sending a batch of 8 aerospace engineering graduates to the UAV Drone Flight & Telemetry bootcamp.',
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    status: 'Contacted',
    source: 'Chatbot',
    adminNotes: 'Sent corporate brochure and syllabus. Waiting for department procurement review.',
    estimatedValue: '$12,000',
  },
  {
    id: 'lead-103',
    name: 'Tanvir Hasan',
    email: 'tanvir.cse.buet@gmail.com',
    phone: '+880 1819-987654',
    category: 'Internships',
    requirements: 'Undergraduate student applying for Spring Robotics & Embedded Systems Research Fellowship.',
    timestamp: new Date(Date.now() - 3600000 * 28).toISOString(),
    status: 'New',
    source: 'Chatbot',
    adminNotes: 'Strong GitHub portfolio in ROS 2. Assigned to Lab Lead for interview screening.',
  },
  {
    id: 'lead-104',
    name: 'Mahbubur Rahman',
    email: 'mahbub@apexindustries.bd',
    phone: '+880 1911-223344',
    category: 'Consulting',
    requirements: 'Industrial automation consultation for 6-axis robotic arms in textile manufacturing plant.',
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
    status: 'Converted',
    source: 'Direct Form',
    adminNotes: 'Contract signed! Phase 1 sensor calibration starts next week.',
    estimatedValue: '$24,000',
  },
  {
    id: 'lead-105',
    name: 'Dr. Katherine Bell',
    email: 'katherine.bell@singapore-research.edu',
    phone: '+65 6790 4123',
    category: 'Partnerships',
    requirements: 'Academic research collaboration in autonomous agricultural drones and multi-spectral sensors.',
    timestamp: new Date(Date.now() - 3600000 * 64).toISOString(),
    status: 'Contacted',
    source: 'Chatbot',
    adminNotes: 'Joint whitepaper proposal under review. Follow-up meeting scheduled via Zoom.',
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
        text: 'Hello, we are an logistics company looking to integrate automated inventory tracking.',
        timestamp: '10:14 AM',
        language: 'English',
      },
      {
        id: 'm2',
        sender: 'bot',
        text: 'Welcome to MARVZ! We specialize in Computer Vision for defect & package tracking, as well as AI predictive inventory pipelines. Would you like to review our case studies?',
        timestamp: '10:14 AM',
      },
      {
        id: 'm3',
        sender: 'visitor',
        text: 'Yes, and could I speak with someone about integrating with custom warehouse cameras?',
        timestamp: '10:16 AM',
        flagHuman: true,
      },
      {
        id: 'm4',
        sender: 'agent',
        agentName: 'Engr. Zamil (Lead AI Architect)',
        text: 'Hi Rahim! I have joined the conversation. We can definitely configure custom RTSP streams from your warehouse IP cameras directly into our edge inference models.',
        timestamp: '10:18 AM',
      },
    ],
  },
  {
    id: 'conv-102',
    visitorId: 'vis-902',
    visitorName: 'Sarah Jenkins',
    visitorEmail: 's.jenkins@aeroglobal.co.uk',
    visitorLanguage: 'English',
    status: 'Needs Human Support',
    lastActivity: new Date(Date.now() - 3600000 * 18).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 19).toISOString(),
    unreadAdminCount: 1,
    messages: [
      {
        id: 'm201',
        sender: 'visitor',
        text: 'Can we book an exclusive corporate batch for 8 trainees in Drone Avionics & Telemetry?',
        timestamp: '08:45 AM',
      },
      {
        id: 'm202',
        sender: 'bot',
        text: 'Yes! We conduct tailored corporate cohorts with customized flight telemetry rigs in our indoor flight cage. I will notify our training director for custom invoicing.',
        timestamp: '08:45 AM',
      },
      {
        id: 'm203',
        sender: 'visitor',
        text: 'Please connect me with an administrator to discuss UK billing and schedule dates.',
        timestamp: '08:47 AM',
        flagHuman: true,
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
        text: 'আপনারা কি রোবোটিক্স ল্যাবে প্রজেক্ট করার সুযোগ দেন?',
        timestamp: '11:20 AM',
        language: 'Bangla',
      },
      {
        id: 'm302',
        sender: 'bot',
        text: 'হ্যাঁ! আমাদের ইনোভেশন ল্যাবে ফিজিক্যাল রোবোটিক আর্মস, ROS 2 ওয়ার্কস্টেশন এবং থ্রিডি প্রিন্টিং প্রোটোটাইপিং সুবিধা রয়েছে। শিক্ষার্থীরা গবেষণা ও প্রজেক্টের জন্য ল্যাব অ্যাক্সেস পেয়ে থাকেন।',
        timestamp: '11:20 AM',
        language: 'Bangla',
      },
    ],
  },
];

// Persistent Storage in File + Memory Cache
interface StoreSchema {
  settings: ControlCenterSettings;
  faqs: FAQItem[];
  unansweredQuestions: UnansweredQuestion[];
  documents: IngestedDocument[];
  leads: Lead[];
  conversations: ConversationThread[];
  visitorCount: number;
}

let store: StoreSchema = {
  settings: DEFAULT_SETTINGS,
  faqs: DEFAULT_FAQS,
  unansweredQuestions: DEFAULT_UNANSWERED,
  documents: DEFAULT_DOCUMENTS,
  leads: DEFAULT_LEADS,
  conversations: DEFAULT_CONVERSATIONS,
  visitorCount: 1428,
};

// Load from disk if exists
try {
  if (fs.existsSync(DB_FILE)) {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    store = {
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
      faqs: parsed.faqs?.length ? parsed.faqs : DEFAULT_FAQS,
      unansweredQuestions: parsed.unansweredQuestions?.length ? parsed.unansweredQuestions : DEFAULT_UNANSWERED,
      documents: parsed.documents?.length ? parsed.documents : DEFAULT_DOCUMENTS,
      leads: parsed.leads?.length ? parsed.leads : DEFAULT_LEADS,
      conversations: parsed.conversations?.length ? parsed.conversations : DEFAULT_CONVERSATIONS,
      visitorCount: parsed.visitorCount || 1428,
    };
  } else {
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf-8');
  }
} catch (err) {
  console.warn('Could not read existing db file, using defaults:', err);
}

// Helper to save store
function persistStore() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write admin store to disk:', err);
  }
}

// Track website visitor
app.use((req, _res, next) => {
  if (req.path === '/' || req.path === '/index.html') {
    store.visitorCount += 1;
    persistStore();
  }
  next();
});

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// Dynamic System Prompt Builder incorporating live FAQs, settings & documents
function buildDynamicSystemInstruction(): string {
  const publishedFaqs = store.faqs
    .filter((f) => f.isPublished)
    .map(
      (f, i) =>
        `${i + 1}. [${f.category}] Q: ${f.question} | Bn: ${f.questionBn || ''} | A: ${f.answer} | Bn: ${f.answerBn || ''}`
    )
    .join('\n');

  const docSnippets = store.documents
    .filter((d) => d.status === 'Indexed')
    .map((d) => `[DOCUMENT: ${d.name} (${d.category})]\n${d.extractedText}`)
    .join('\n\n');

  return `
You are "${store.settings.chatbotName}", the official autonomous AI customer support and technical advisory agent for MARVZ & INNOVATION TECH.

ABOUT THE COMPANY:
- Name: MARVZ & INNOVATION TECH
- Brand Tagline: "Innovating Technology, Empowering the Future." (Also: "Think Beyond. Build Tomorrow.")
- Mission: An international-standard emerging technology startup uniting advanced engineering, professional hands-on IT training, cutting-edge research, and custom enterprise software & hardware development.
- Contact: ${store.settings.contactEmail} | Phone: ${store.settings.contactPhone} | WhatsApp: ${store.settings.contactWhatsApp} | Location: ${store.settings.officeLocation}

APPROVED KNOWLEDGE BASE & FAQS (STRICT SOURCE OF TRUTH):
${publishedFaqs}

INGESTED COMPANY DOCUMENTS & SPECIFICATIONS:
${docSnippets}

${store.settings.systemInstructionOverride ? `ADMIN SPECIAL INSTRUCTIONS:\n${store.settings.systemInstructionOverride}\n` : ''}

BEHAVIOR AND TONE GUIDELINES:
1. Multilingual Support:
   - English enabled: ${store.settings.enableEnglish ? 'YES' : 'NO'}
   - Bangla enabled: ${store.settings.enableBangla ? 'YES' : 'NO'}
   - Default Mode: ${store.settings.defaultLanguage}
   - Fluently understand and respond in English, Bangla (বাংলা), and Banglish (Bengali written in English letters).
2. Professional, futuristic, crisp, and welcoming tone.
3. Use clean markdown and bullet points. Never make false promises or hallucinate prices outside the knowledge base.
4. When users ask for customized enterprise quotations, suggest using the consultation booking form or contacting human support.
`;
}

// ----------------------------------------------------
// PUBLIC VISITOR API ROUTES
// ----------------------------------------------------

// 1. Visitor Chatbot Configuration
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
    contactWhatsApp: store.settings.contactWhatsApp,
    contactPhone: store.settings.contactPhone,
  });
});

// 2. Chat Completion & Live Conversation Sync
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationId, visitorName = 'Visitor', visitorEmail, visitorPhone, history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    const trimmed = message.trim();
    const isBangla = /[\u0980-\u09FF]/.test(trimmed);
    const isBanglish = /\b(apnader|apnara|kobe|ki|kivabe|korbo|lagbe|hobe|koto|taka|khoj|valo|shuru|dhaka|thikana)\b/i.test(trimmed);
    const detectedLang: 'English' | 'Bangla' | 'Banglish' = isBangla ? 'Bangla' : isBanglish ? 'Banglish' : 'English';

    // Find or create conversation thread
    let thread = store.conversations.find((c) => c.id === conversationId);
    if (!thread) {
      thread = {
        id: conversationId || `conv-${Date.now()}`,
        visitorId: `vis-${Date.now()}`,
        visitorName: visitorName || 'Website Visitor',
        visitorEmail: visitorEmail,
        visitorPhone: visitorPhone,
        visitorLanguage: detectedLang,
        status: 'Bot Handling',
        lastActivity: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        messages: [],
        unreadAdminCount: 1,
      };
      store.conversations.unshift(thread);
    } else {
      thread.lastActivity = new Date().toISOString();
      if (visitorName && visitorName !== 'Visitor') thread.visitorName = visitorName;
      if (visitorEmail) thread.visitorEmail = visitorEmail;
      if (visitorPhone) thread.visitorPhone = visitorPhone;
    }

    // Record visitor message
    const isHumanRequest = /\b(human|agent|person|call me|talk to someone|advisor|support team|সরাসরি কথা)\b/i.test(trimmed);
    if (isHumanRequest) {
      thread.status = 'Needs Human Support';
      thread.unreadAdminCount += 1;
    }

    const userMsgObj: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: 'visitor',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: detectedLang,
      flagHuman: isHumanRequest,
    };
    thread.messages.push(userMsgObj);

    // Track FAQ hit count if a question closely matches
    const matchedFaq = store.faqs.find(
      (f) =>
        trimmed.toLowerCase().includes(f.question.toLowerCase().slice(0, 25)) ||
        (f.questionBn && trimmed.includes(f.questionBn.slice(0, 15)))
    );
    if (matchedFaq) {
      matchedFaq.hitCount += 1;
    }

    let botReplyText = '';
    let replySource = 'gemini-3.8-flash';

    // Gemini Execution
    if (aiClient) {
      try {
        const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
        const recent = Array.isArray(history) ? history.slice(-6) : [];
        for (const item of recent) {
          if (item && item.text) {
            contents.push({
              role: item.role === 'user' ? 'user' : 'model',
              parts: [{ text: item.text }],
            });
          }
        }
        contents.push({ role: 'user', parts: [{ text: trimmed }] });

        const dynamicPrompt = buildDynamicSystemInstruction();
        const response = await aiClient.models.generateContent({
          model: store.settings.aiModel || 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction: dynamicPrompt,
            temperature: store.settings.temperature ?? 0.65,
            topP: 0.95,
            maxOutputTokens: 800,
          },
        });

        botReplyText = response.text || "I'm here to assist you with MARVZ & INNOVATION TECH. Could you please specify your requirement?";
      } catch (geminiError: any) {
        console.warn('Gemini call failed, switching to dynamic fallback:', geminiError?.message || geminiError);
        replySource = 'marvz-fallback-engine';
      }
    } else {
      replySource = 'marvz-fallback-engine';
    }

    // Dynamic Fallback if Gemini failed or unkeyed
    if (!botReplyText) {
      if (isHumanRequest) {
        botReplyText = `I have alerted our senior engineering & advisory desk! 🧑‍💻\n\n• **Direct WhatsApp:** [Click to open WhatsApp (${store.settings.contactWhatsApp})](https://wa.me/${store.settings.contactWhatsApp.replace(/[^0-9]/g, '')})\n• **Hotline:** ${store.settings.contactPhone}\n\nOur human team is monitoring this thread and can respond directly here or give you a call.`;
      } else if (matchedFaq) {
        botReplyText = detectedLang === 'Bangla' && matchedFaq.answerBn ? matchedFaq.answerBn : matchedFaq.answer;
      } else {
        // Search knowledge base by keyword
        const queryLower = trimmed.toLowerCase();
        const found = store.faqs.find((f) =>
          f.tags.some((tag) => queryLower.includes(tag)) ||
          f.question.toLowerCase().includes(queryLower) ||
          (f.answer.toLowerCase().includes(queryLower))
        );

        if (found) {
          botReplyText = detectedLang === 'Bangla' && found.answerBn ? found.answerBn : found.answer;
        } else {
          // If totally unanswered, record to unanswered queue!
          if (trimmed.length > 10 && !trimmed.match(/^(hi|hello|hey|bye|thanks|thank you)$/i)) {
            const alreadyLogged = store.unansweredQuestions.some((u) => u.question.toLowerCase() === trimmed.toLowerCase());
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

          if (detectedLang === 'Bangla') {
            botReplyText = `ধন্যবাদ আপনার বার্তার জন্য! MARVZ & INNOVATION TECH-এ আমরা এআই, ড্রোন ইঞ্জিনিয়ারিং, রোবোটিক্স, কাস্টম সফটওয়্যার ও প্রফেশনাল ট্রেনিং নিয়ে কাজ করছি। আপনার নির্দিষ্ট প্রশ্নের বিস্তারিত তথ্যের জন্য আমাদের ইঞ্জিনিয়ারের সাথে সরাসরি কথা বলতে পারেন।`;
          } else {
            botReplyText = `Thank you for reaching out to **MARVZ & INNOVATION TECH**! 🚀\n\nWe specialize in **AI & Machine Learning**, **Drone Engineering**, **Industrial Robotics**, **Enterprise Software**, and **Professional Hardware Bootcamps**.\n\nWould you like more details on any of these areas, or would you like to speak directly with an engineer?`;
          }
        }
      }
    }

    // Append Bot Message
    const botMsgObj: ChatMessage = {
      id: `m-${Date.now() + 1}`,
      sender: 'bot',
      text: botReplyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: detectedLang,
    };
    thread.messages.push(botMsgObj);

    persistStore();

    return res.json({
      reply: botReplyText,
      language: detectedLang,
      source: replySource,
      conversationId: thread.id,
      threadStatus: thread.status,
    });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ error: 'Failed to process chat query.' });
  }
});

// 3. Poll Conversation (Allows visitor to receive Human Agent replies in real time)
app.get('/api/conversations/:id/poll', (req, res) => {
  const { id } = req.params;
  const thread = store.conversations.find((c) => c.id === id);
  if (!thread) {
    return res.status(404).json({ error: 'Conversation not found.' });
  }
  res.json({
    status: thread.status,
    messages: thread.messages,
  });
});

// 4. Submit Lead / Inquiries (Public)
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
      requirements: String(requirements || 'Consultation request submitted via MARVZ AI Assistant.').trim(),
      timestamp: new Date().toISOString(),
      status: 'New',
      source: source || 'Chatbot',
    };

    store.leads.unshift(newLead);
    persistStore();

    return res.status(201).json({
      success: true,
      message: 'Inquiry successfully registered! An advisor will follow up promptly.',
      lead: newLead,
    });
  } catch (error: any) {
    console.error('Lead submission error:', error);
    res.status(500).json({ error: 'Failed to submit lead inquiry.' });
  }
});

// ----------------------------------------------------
// MARVZ AI CONTROL CENTER (ADMIN) API ROUTES
// ----------------------------------------------------

// Admin Authentication
app.post('/api/admin/auth/login', (req, res) => {
  const { email, password, role = 'Super Admin' } = req.body;
  // Demo password accepted or standard login
  if (password === 'marvz2026' || password === 'admin' || email) {
    return res.json({
      success: true,
      token: `marvz-adm-${Date.now()}`,
      user: {
        id: 'adm-001',
        name: email?.includes('zamil') ? 'Engr. Zamil Rahman' : 'Admin Director',
        email: email || 'admin@marvztech.com',
        role: role || 'Super Admin',
        lastLogin: new Date().toISOString(),
      },
    });
  }
  return res.status(401).json({ error: 'Invalid admin credentials. Use password "marvz2026".' });
});

// 1. Admin Overview Dashboard Analytics
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

    const conversionRate = totalLeads > 0 ? `${Math.round(((leadsByStatus['Converted'] || 0) / totalLeads) * 100)}%` : '0%';

    const faqHitList = [...store.faqs]
      .sort((a, b) => b.hitCount - a.hitCount)
      .slice(0, 5)
      .map((f) => ({
        question: f.question,
        category: f.category,
        count: f.hitCount,
      }));

    res.json({
      totalVisitors: store.visitorCount,
      totalConversations: store.conversations.length,
      activeConversations,
      totalInquiries: totalLeads,
      unansweredQuestionsCount: store.unansweredQuestions.filter((u) => u.status === 'Pending Review').length,
      leadConversionRate: conversionRate,
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
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate overview analytics.' });
  }
});

// 2. Knowledge Base FAQs CRUD
app.get('/api/admin/kb', (_req, res) => {
  res.json({ faqs: store.faqs });
});

app.post('/api/admin/kb', (req, res) => {
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
      tags: Array.isArray(tags) ? tags : String(tags).split(',').map((t) => t.trim()).filter(Boolean),
      hitCount: 0,
      isPublished: Boolean(isPublished),
      updatedAt: new Date().toISOString(),
      source: 'Manual',
    };

    store.faqs.unshift(newFaq);
    persistStore();
    res.status(201).json({ success: true, faq: newFaq });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create FAQ.' });
  }
});

app.put('/api/admin/kb/:id', (req, res) => {
  try {
    const { id } = req.params;
    const faq = store.faqs.find((f) => f.id === id);
    if (!faq) return res.status(404).json({ error: 'FAQ not found.' });

    Object.assign(faq, {
      ...req.body,
      updatedAt: new Date().toISOString(),
    });

    persistStore();
    res.json({ success: true, faq });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update FAQ.' });
  }
});

app.delete('/api/admin/kb/:id', (req, res) => {
  try {
    const { id } = req.params;
    store.faqs = store.faqs.filter((f) => f.id !== id);
    persistStore();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete FAQ.' });
  }
});

// 3. Training Center: Unanswered Questions & Approval
app.get('/api/admin/unanswered', (_req, res) => {
  res.json({ questions: store.unansweredQuestions });
});

app.post('/api/admin/unanswered/:id/answer', (req, res) => {
  try {
    const { id } = req.params;
    const { answer, answerBn, category = 'Custom', publishToKb = true } = req.body;
    const item = store.unansweredQuestions.find((q) => q.id === id);
    if (!item) return res.status(404).json({ error: 'Unanswered question record not found.' });

    item.status = 'Answered';
    item.suggestedAnswer = answer;

    if (publishToKb && answer) {
      const newFaq: FAQItem = {
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
      };
      store.faqs.unshift(newFaq);
    }

    persistStore();
    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve answer.' });
  }
});

app.delete('/api/admin/unanswered/:id', (req, res) => {
  const { id } = req.params;
  store.unansweredQuestions = store.unansweredQuestions.filter((q) => q.id !== id);
  persistStore();
  res.json({ success: true });
});

// 4. Document Ingestion (PDF, DOCX, TXT Parsing & AI Indexing)
app.get('/api/admin/documents', (_req, res) => {
  res.json({ documents: store.documents });
});

app.post('/api/admin/documents', (req, res) => {
  try {
    const { name, fileType, fileSize, rawContent, category = 'General' } = req.body;

    if (!name || !rawContent) {
      return res.status(400).json({ error: 'File name and text content are required.' });
    }

    // Process & sanitize content
    const sanitizedText = String(rawContent).trim();
    const chunkCount = Math.max(1, Math.ceil(sanitizedText.length / 500));

    const newDoc: IngestedDocument = {
      id: `doc-${Date.now()}`,
      name: name.trim(),
      fileType: ['pdf', 'docx', 'txt'].includes(fileType) ? fileType : 'txt',
      fileSize: fileSize || '50 KB',
      uploadedAt: new Date().toISOString(),
      category: category || 'General',
      status: 'Indexed',
      extractedText: sanitizedText,
      chunkCount,
    };

    store.documents.unshift(newDoc);
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
  const { id } = req.params;
  store.documents = store.documents.filter((d) => d.id !== id);
  persistStore();
  res.json({ success: true });
});

// 5. Live Chat Monitoring & Human Agent Responses
app.get('/api/admin/conversations', (_req, res) => {
  res.json({ conversations: store.conversations });
});

app.get('/api/admin/conversations/:id', (req, res) => {
  const { id } = req.params;
  const conv = store.conversations.find((c) => c.id === id);
  if (!conv) return res.status(404).json({ error: 'Conversation not found.' });
  res.json({ conversation: conv });
});

// Send manual agent message into visitor chat thread
app.post('/api/admin/conversations/:id/reply', (req, res) => {
  try {
    const { id } = req.params;
    const { text, agentName = 'MARVZ Engineering Lead' } = req.body;
    const conv = store.conversations.find((c) => c.id === id);
    if (!conv) return res.status(404).json({ error: 'Conversation not found.' });

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Reply text cannot be empty.' });
    }

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
  const { id } = req.params;
  const { status } = req.body;
  const conv = store.conversations.find((c) => c.id === id);
  if (!conv) return res.status(404).json({ error: 'Conversation not found.' });

  if (['Bot Handling', 'Needs Human Support', 'Human Joined', 'Resolved'].includes(status)) {
    conv.status = status;
    persistStore();
  }
  res.json({ success: true, conversation: conv });
});

// 6. Lead CRM Operations
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
  const { id } = req.params;
  const lead = store.leads.find((l) => l.id === id);
  if (!lead) return res.status(404).json({ error: 'Lead not found.' });

  Object.assign(lead, req.body);
  persistStore();
  res.json({ success: true, lead });
});

app.delete('/api/admin/leads/:id', (req, res) => {
  const { id } = req.params;
  store.leads = store.leads.filter((l) => l.id !== id);
  persistStore();
  res.json({ success: true });
});

// 7. Settings Management
app.get('/api/admin/settings', (_req, res) => {
  res.json({ settings: store.settings });
});

app.put('/api/admin/settings', (req, res) => {
  try {
    store.settings = {
      ...store.settings,
      ...req.body,
    };
    persistStore();
    res.json({ success: true, settings: store.settings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings.' });
  }
});

// ----------------------------------------------------
// VITE DEV SERVER / STATIC PRODUCTION MIDDLEWARE
// ----------------------------------------------------
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
