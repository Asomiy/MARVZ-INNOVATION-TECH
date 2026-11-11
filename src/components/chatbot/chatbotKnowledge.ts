/**
 * MARVZ & INNOVATION TECH - Chatbot Knowledge Base & Suggested Questions
 */

export interface SuggestedQuestion {
  id: string;
  question: string;
  category: string;
  banglaQuestion?: string;
}

export const SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
  {
    id: 'sq-services',
    question: 'What services do you provide?',
    category: 'Services',
    banglaQuestion: 'আপনারা কি কি সেবা প্রদান করেন?',
  },
  {
    id: 'sq-training',
    question: 'Do you offer IT training?',
    category: 'Training',
    banglaQuestion: 'আপনারা কি আইটি ট্রেনিং করান?',
  },
  {
    id: 'sq-internship',
    question: 'How can I apply for an internship?',
    category: 'Internships',
    banglaQuestion: 'ইন্টার্নশিপের জন্য কীভাবে আবেদন করব?',
  },
  {
    id: 'sq-software',
    question: 'Do you provide software development?',
    category: 'Software',
    banglaQuestion: 'আপনারা কি সফটওয়্যার ডেভেলপমেন্ট করেন?',
  },
  {
    id: 'sq-contact',
    question: 'How can I contact your team?',
    category: 'Contact',
    banglaQuestion: 'আপনাদের টিমের সাথে কীভাবে যোগাযোগ করব?',
  },
];

export interface QuickReply {
  id: string;
  label: string;
  prompt: string;
  category: string;
}

export const QUICK_REPLIES: QuickReply[] = [
  { id: 'qr-1', label: 'What services do you provide?', prompt: 'What services do you provide?', category: 'Services' },
  { id: 'qr-2', label: 'Do you offer IT training?', prompt: 'Do you offer IT training?', category: 'Training' },
  { id: 'qr-3', label: 'How can I apply for an internship?', prompt: 'How can I apply for an internship?', category: 'Internships' },
  { id: 'qr-4', label: 'Do you provide software development?', prompt: 'Do you provide software development?', category: 'Software' },
  { id: 'qr-5', label: 'How can I contact your team?', prompt: 'How can I contact your team?', category: 'Contact' },
  { id: 'qr-ai', label: 'AI & Machine Learning', prompt: 'Tell me about your AI and Machine Learning engineering solutions.', category: 'AI' },
  { id: 'qr-drone', label: 'Drone & UAV Tech', prompt: 'Tell me about your custom UAV drone development and pilot training.', category: 'Drones' },
  { id: 'qr-robotics', label: 'Robotics & Automation', prompt: 'What industrial robotics and automation projects do you build?', category: 'Robotics' },
  { id: 'qr-cyber', label: 'Cybersecurity', prompt: 'What cybersecurity, VAPT, and ethical hacking training do you offer?', category: 'Cyber' },
  { id: 'qr-partner', label: 'Business Collaboration', prompt: 'How can our enterprise collaborate or partner with MARVZ & INNOVATION TECH?', category: 'Partnerships' },
];

export interface FAQItem {
  id: string;
  question: string;
  questionBn?: string;
  category: 'AI' | 'Software' | 'Robotics' | 'Drones' | 'Cybersecurity' | 'Training' | 'Internships' | 'Contact' | 'IoT' | 'Partnerships';
  answer: string;
  answerBn?: string;
  tags: string[];
}

export const KNOWLEDGE_BASE_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'AI',
    question: 'What services do you provide?',
    questionBn: 'আপনারা কি কি সেবা প্রদান করেন?',
    answer: 'MARVZ & INNOVATION TECH specializes in 7 core technology pillars:\n1. Artificial Intelligence & Machine Learning\n2. Custom Enterprise Software & Web Development\n3. Mobile App Development (iOS, Android, Flutter)\n4. Cybersecurity & Ethical Hacking Defense\n5. Drone Technology & UAV Avionics Engineering\n6. Industrial Robotics & IoT Automation\n7. Hands-on Professional IT Bootcamps & Internships.',
    answerBn: 'MARVZ & INNOVATION TECH মূলত ৭টি প্রধান প্রযুক্তিতে কাজ করে:\n১. আর্টিফিশিয়াল ইন্টেলিজেন্স ও মেশিন লার্নিং\n২. কাস্টম এন্টারপ্রাইজ সফটওয়্যার ও ওয়েব ডেভেলপমেন্ট\n৩. মোবাইল অ্যাপ্লিকেশন ডেভেলপমেন্ট (iOS ও Android)\n৪. সাইবার সিকিউরিটি ও এথিক্যাল হ্যাকিং\n৫. ড্রোন টেকনোলজি ও UAV ইঞ্জিনিয়ারিং\n৬. রোবোটিক্স ও আইওটি (IoT) অটোমেশন\n৭. প্র্যাকটিক্যাল আইটি ট্রেনিং ও রিসার্চ ফেলোশিপ।',
    tags: ['services', 'overview', 'company', 'technology'],
  },
  {
    id: 'faq-2',
    category: 'Training',
    question: 'Do you offer IT training?',
    questionBn: 'আপনারা কি আইটি ট্রেনিং করান?',
    answer: 'Yes! We conduct intensive, hands-on IT training and bootcamps with physical hardware prototyping. Tracks include:\n• AI & Deep Learning Engineering (PyTorch, LLMs, Computer Vision)\n• Drone Assembly & Autonomous Flight Piloting (Indoor Cage Flight Labs)\n• Robotics & IoT Embedded Systems (ROS 2, Microcontrollers)\n• Full-Stack Web & Mobile App Development\n• Ethical Hacking & Defensive Cybersecurity.\n\nAll courses include dedicated lab access and industry-vetted certifications.',
    answerBn: 'হ্যাঁ! আমরা সম্পূর্ণ প্র্যাকটিক্যাল ও হার্ডওয়্যার ভিত্তিক পেশাদার আইটি ট্রেনিং পরিচালনা করি:\n• এআই ও ডিপ লার্নিং ইঞ্জিনিয়ারিং\n• ড্রোন অ্যাসেম্বলি ও ফ্লাইট পাইলটিং (সেফটি কেজ ল্যাব)\n• রোবোটিক্স ও আইওটি এমবেডেড সিস্টেম (ROS 2)\n• ফুল-স্ট্যাক ওয়েব ও মোবাইল অ্যাপ ডেভেলপমেন্ট\n• এথিক্যাল হ্যাকিং ও সাইবার ডিফেন্স।\n\nপ্রতিটি কোর্সে ফিজিক্যাল ল্যাব অ্যাক্সেস ও ইন্ডাস্ট্রি সার্টিফিকেট প্রদান করা হয়।',
    tags: ['training', 'courses', 'bootcamp', 'admission', 'skills'],
  },
  {
    id: 'faq-3',
    category: 'Internships',
    question: 'How can I apply for an internship?',
    questionBn: 'ইন্টার্নশিপের জন্য কীভাবে আবেদন করব?',
    answer: 'Passionate students and graduates in Computer Science, Electrical/Robotics Engineering, and related disciplines can apply for our 3-month and 6-month Innovation Fellowships. Interns work directly on client-grade software, AI models, drone avionics, and robotics prototypes.\n\nTo apply, share your Name, Contact details, and Area of Interest right here in this chat, or submit via our Consultation & Application Form!',
    answerBn: 'সিএসই, ইইই বা রোবোটিক্স ব্যাকগ্রাউন্ডের শিক্ষার্থী ও ফ্রেশ গ্র্যাজুয়েটরা আমাদের ৩ থেকে ৬ মাসের ইনোভেশন রিসার্চ ফেলোশিপে আবেদন করতে পারেন। এখানে সরাসরি বাস্তব এআই, সফটওয়্যার ও রোবোটিক্স প্রজেক্টে কাজ করার সুযোগ থাকে।\n\nআবেদন করতে এই চ্যাটে আপনার নাম ও ফোন নম্বর দিন অথবা আমাদের কনসালটেশন ফর্মটি পূরণ করুন!',
    tags: ['internship', 'careers', 'jobs', 'fellowship', 'students', 'apply'],
  },
  {
    id: 'faq-4',
    category: 'Software',
    question: 'Do you provide software development?',
    answer: 'Yes, our enterprise engineering division develops custom web and mobile applications using React, Next.js, Node.js, Python FastAPI, PostgreSQL, and AWS/GCP cloud architectures. We build high-throughput SaaS platforms, automated internal tooling, and cross-platform mobile apps for iOS and Android with Flutter.',
    answerBn: 'হ্যাঁ, আমাদের সফটওয়্যার টিম React, Next.js, Node.js, Python, PostgreSQL ও ক্লাউড আর্কিটেকচারে এন্টারপ্রাইজ ওয়েব পোর্টাল ও Flutter দিয়ে ক্রস-প্ল্যাটফর্ম মোবাইল অ্যাপ তৈরি করে। আমরা হাই-সিকিউরড স্কেলেবল সিস্টেম তৈরিতে বিশেষভাবে দক্ষ।',
    tags: ['software', 'development', 'web', 'mobile', 'apps', 'fullstack'],
  },
  {
    id: 'faq-5',
    category: 'Contact',
    question: 'How can I contact your team?',
    questionBn: 'আপনাদের টিমের সাথে কীভাবে যোগাযোগ করব?',
    answer: 'You can reach MARVZ & INNOVATION TECH directly through:\n• Headquarters: Innovation Hub, Level 4, Tech Park\n• Official Email: contact@marvztech.com\n• Direct Phone Line: +880 1800-MARVZ-TECH\n• WhatsApp Advisory Line: +880 1711-000000\n• Office Hours: Saturday – Thursday, 9:00 AM – 7:00 PM\n\nYou can also click the "Request Callback" button right in this chat to have an engineer call you back!',
    answerBn: 'MARVZ & INNOVATION TECH-এর সাথে যোগাযোগের মাধ্যম:\n• ঠিকানা: ইনোভেশন হাব, লেভেল ৪, টেক পার্ক\n• ইমেইল: contact@marvztech.com\n• হটলাইন: +880 1800-MARVZ-TECH\n• হোয়াটসঅ্যাপ: +880 1711-000000\n• অফিস সময়: শনিবার থেকে বৃহস্পতিবার, সকাল ৯:০০ - সন্ধ্যা ৭:০০\n\nআপনি চাইলে এই চ্যাট থেকেই "Request Callback" বাটনে ক্লিক করে সরাসরি কলের অনুরোধ জানাতে পারেন!',
    tags: ['contact', 'phone', 'email', 'office', 'whatsapp', 'address'],
  },
  {
    id: 'faq-6',
    category: 'Drones',
    question: 'Do you offer custom UAV drone design and pilot training?',
    questionBn: 'আপনারা কি কাস্টম ড্রোন তৈরি ও পাইলট ট্রেনিং করান?',
    answer: 'Yes! We develop autonomous UAV solutions for aerial mapping, infrastructure inspection, and precision agriculture. We also host practical flight workshops with ArduPilot/PX4 avionics in our dedicated indoor test cage.',
    answerBn: 'হ্যাঁ! আমরা অ্যারিয়াল ম্যাপিং ও এগ্রিকালচারাল ড্রোনের পাশাপাশি হ্যান্ডস-অন ড্রোন অ্যাসেম্বলি এবং ফ্লাইট ট্রেনিং পরিচালনা করি।',
    tags: ['drone', 'uav', 'flight', 'aerial mapping', 'fpv'],
  },
  {
    id: 'faq-7',
    category: 'Robotics',
    question: 'What industrial automation and robotics solutions are available?',
    questionBn: 'আপনাদের রোবোটিক্স ও ইন্ডাস্ট্রিয়াল অটোমেশন সেবা কেমন?',
    answer: 'We build 6-axis robotic arms for pick-and-place, assembly, ROS 2-based autonomous ground vehicles, and IoT sensor telemetry networks with real-time industrial dashboards.',
    answerBn: 'আমরা ইন্ডাস্ট্রিয়াল ৬-অ্যাক্সিস রোবোটিক আর্ম, ROS ২ বেসড অটোনমাস সিস্টেম এবং আইওটি অটোমেশন তৈরি করি।',
    tags: ['robotics', 'automation', 'ros', 'iot', 'hardware', 'embedded'],
  },
  {
    id: 'faq-8',
    category: 'Cybersecurity',
    question: 'Do you perform security audits and ethical hacking?',
    questionBn: 'আপনারা কি সিকিউরিটি অডিট ও এথিক্যাল হ্যাকিং ট্রেনিং দেন?',
    answer: 'Yes. Our security team conducts Vulnerability Assessment and Penetration Testing (VAPT), cloud security audits, and delivers practical defensive training for corporate engineering teams.',
    answerBn: 'হ্যাঁ, আমরা এন্টারপ্রাইজ VAPT সিকিউরিটি অডিট করি এবং প্র্যাকটিক্যাল এথিক্যাল হ্যাকিং ও সাইবার ডিফেন্স ট্রেনিং প্রদান করি।',
    tags: ['cybersecurity', 'vapt', 'ethical hacking', 'infosec', 'pentesting'],
  },
  {
    id: 'faq-9',
    category: 'IoT',
    question: 'What Internet of Things (IoT) solutions do you engineer?',
    questionBn: 'আপনারা কি ধরনের আইওটি (IoT) সলিউশন তৈরি করেন?',
    answer: 'We engineer end-to-end industrial IoT solutions connecting hardware sensors (ESP32, STM32, LoRaWAN) to cloud telemetry dashboards for predictive maintenance, environmental tracking, and smart factory automation.',
    answerBn: 'আমরা সেন্সর ও মাইক্রোকন্ট্রোলার (ESP32, LoRaWAN) থেকে শুরু করে ক্লাউড ড্যাশবোর্ড পর্যন্ত সম্পূর্ণ ইন্ডাস্ট্রিয়াল আইওটি (IoT) সিস্টেম তৈরি করি।',
    tags: ['iot', 'sensors', 'embedded', 'telemetry', 'hardware'],
  },
  {
    id: 'faq-10',
    category: 'Partnerships',
    question: 'How do you handle business collaboration and enterprise partnerships?',
    questionBn: 'ব্যবসায়িক পার্টনারশিপ ও কোলাবোরেশন কীভাবে করা যায়?',
    answer: 'We partner with corporations, startups, and academic institutions for custom R&D, pilot proof-of-concepts (PoC), and technical training. To discuss a partnership, share your brief here or connect with our leadership desk on WhatsApp (+880 1711-000000).',
    answerBn: 'আমরা বিভিন্ন এন্টারপ্রাইজ, স্টার্টআপ ও বিশ্ববিদ্যালয়ের সাথে যৌথ গবেষণা, পাইলট প্রজেক্ট এবং কর্পোরেট ট্রেনিংয়ে অংশীদারিত্ব করে থাকি। বিস্তারিত আলোচনার জন্য সরাসরি হোয়াটসঅ্যাপে (+880 1711-000000) যোগাযোগ করতে পারেন।',
    tags: ['partnership', 'collaboration', 'business', 'enterprise'],
  },
];
