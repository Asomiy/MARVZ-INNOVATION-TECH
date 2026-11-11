/**
 * MARVZ AI Control Center - TypeScript Type Definitions
 */

export type LeadStatus = 'New' | 'Contacted' | 'Interested' | 'Converted';

export interface Lead {
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

export interface FAQItem {
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

export interface UnansweredQuestion {
  id: string;
  question: string;
  visitorLanguage: 'English' | 'Bangla' | 'Banglish';
  askedAt: string;
  conversationId: string;
  status: 'Pending Review' | 'Answered' | 'Dismissed';
  suggestedAnswer?: string;
  reviewedBy?: string;
}

export interface IngestedDocument {
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

export interface ChatMessage {
  id: string;
  sender: 'visitor' | 'bot' | 'agent';
  agentName?: string;
  text: string;
  timestamp: string;
  language?: 'English' | 'Bangla' | 'Banglish';
  flagHuman?: boolean;
}

export interface ConversationThread {
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

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Knowledge Editor' | 'Support Agent';
  avatar?: string;
  lastLogin: string;
}

export interface ControlCenterSettings {
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

export interface AdminOverviewStats {
  totalVisitors: number;
  totalConversations: number;
  activeConversations: number;
  totalInquiries: number;
  unansweredQuestionsCount: number;
  leadConversionRate: string;
  faqHitList: Array<{ question: string; category: string; count: number }>;
  leadsByStatus: Record<LeadStatus, number>;
  leadsByCategory: Record<string, number>;
  conversationTrends: Array<{ date: string; botOnly: number; humanAssisted: number }>;
}
