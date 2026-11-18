/**
 * MARVZ & INNOVATION TECH - Admin & Platform TypeScript Type Definitions
 */

export type LeadStatus = 'New' | 'Contacted' | 'Interested' | 'Converted';

export type AdminRole =
  | 'Super Admin'
  | 'Content Manager'
  | 'HR & Training Coordinator'
  | 'Knowledge Editor'
  | 'Support Agent';

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
  role: AdminRole;
  phone?: string;
  department?: string;
  avatar?: string;
  lastLogin: string;
  createdAt?: string;
  needsPasswordSetup?: boolean;
  isActive?: boolean;
}

export interface AuthAuditLog {
  id: string;
  eventType: string;
  email: string;
  userId: string;
  success: boolean;
  ipAddress: string;
  userAgent: string;
  details: string;
  createdAt: string;
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

export interface WebsiteServiceItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  imageUrl: string;
  altText: string;
  keyTopics: string[];
  applications: string[];
}

export interface UploadedMediaAsset {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: string;
  uploadedAt: string;
}

export interface WebsiteContentConfig {
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

export interface LocationConfig {
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

export type InternshipStatus = 'Pending' | 'Under Review' | 'Approved' | 'Rejected';

export interface InternshipApplication {
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
  status: InternshipStatus;
  adminNotes?: string;
  appliedAt: string;
}

export interface TrainingProgram {
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

export type PaymentStatus = 'Pending' | 'Paid' | 'Partial' | 'Refunded';
export type RegistrationStatus = 'Confirmed' | 'Pending Verification' | 'Waitlisted' | 'Cancelled';

export interface TrainingRegistration {
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
  paymentStatus: PaymentStatus;
  paymentMethod: 'bKash' | 'Nagad' | 'Bank Transfer' | 'Card' | 'Cash at Office';
  transactionId: string;
  registrationStatus: RegistrationStatus;
  adminNotes?: string;
  registeredAt: string;
}

export type ContactMessageStatus = 'New' | 'Read' | 'Replied' | 'Archived';
export type EmailDeliveryStatus = 'pending' | 'sent' | 'failed' | 'not_configured';

export interface ContactReply {
  id: string;
  senderName: string;
  message: string;
  emailSent?: boolean;
  sentAt: string;
}

export interface ContactMessage {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  collaboratorType: string;
  technologyDomain: string;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  companyEmailStatus?: EmailDeliveryStatus;
  visitorEmailStatus?: EmailDeliveryStatus;
  emailError?: string;
  replies: ContactReply[];
  createdAt: string;
  updatedAt?: string;
}

export interface ActivityLogItem {
  id: string;
  type: 'inquiry' | 'internship' | 'training' | 'content' | 'location' | 'auth' | 'chatbot';
  title: string;
  description: string;
  actor: string;
  timestamp: string;
}

export interface PublicSiteData {
  content: WebsiteContentConfig;
  location: LocationConfig;
  trainingPrograms: TrainingProgram[];
}

export interface AdminOverviewStats {
  totalVisitors: number;
  totalConversations: number;
  activeConversations: number;
  totalInquiries: number;
  unansweredQuestionsCount: number;
  leadConversionRate: string;
  internshipApplicationsCount: number;
  pendingInternshipsCount: number;
  trainingRegistrationsCount: number;
  paidTrainingCount: number;
  trainingRevenueBDT: number;
  contactMessagesCount: number;
  unreadContactMessagesCount: number;
  faqHitList: Array<{ question: string; category: string; count: number }>;
  leadsByStatus: Record<LeadStatus, number>;
  leadsByCategory: Record<string, number>;
  conversationTrends: Array<{ date: string; botOnly: number; humanAssisted: number }>;
  monthlyMetrics: Array<{ label: string; inquiries: number; trainings: number; internships: number }>;
  recentActivities: ActivityLogItem[];
}
