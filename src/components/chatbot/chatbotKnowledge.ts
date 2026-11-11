/**
 * MARVZ & INNOVATION TECH - Chatbot Knowledge Base & Quick Replies
 */

export interface QuickReply {
  id: string;
  label: string;
  prompt: string;
  category: string;
}

export const QUICK_REPLIES: QuickReply[] = [
  { id: 'qr-services', label: 'Our Services', prompt: 'Tell me about the core technology services offered by MARVZ & INNOVATION TECH.', category: 'Services' },
  { id: 'qr-software', label: 'Software Development', prompt: 'What kind of web, mobile, and custom enterprise software development do you build?', category: 'Software' },
  { id: 'qr-ai', label: 'AI & Technology', prompt: 'What artificial intelligence and machine learning solutions do you engineer?', category: 'AI' },
  { id: 'qr-drone', label: 'Drone & Robotics', prompt: 'Tell me about your UAV drone engineering and industrial robotics laboratory.', category: 'Robotics' },
  { id: 'qr-training', label: 'Training Programs', prompt: 'What hands-on IT training, bootcamps, and professional certifications do you offer?', category: 'Training' },
  { id: 'qr-internship', label: 'Internship Opportunities', prompt: 'How can students or engineers apply for internships and research fellowships at MARVZ?', category: 'Careers' },
  { id: 'qr-contact', label: 'Contact Us', prompt: 'Where is your office located, and how can I get in touch with the team?', category: 'Contact' },
];

export interface FAQItem {
  id: string;
  question: string;
  questionBn?: string;
  category: 'AI' | 'Software' | 'Robotics' | 'Drones' | 'Cybersecurity' | 'Training' | 'Internships' | 'Contact';
  answer: string;
  answerBn?: string;
  tags: string[];
}

export const KNOWLEDGE_BASE_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'AI',
    question: 'What AI & Machine Learning services do you provide?',
    questionBn: 'আপনারা কি কি এআই ও মেশিন লার্নিং সেবা প্রদান করেন?',
    answer: 'MARVZ engineers bespoke Generative AI agents, Large Language Model (LLM) fine-tuning, automated workflow pipelines, Computer Vision for defect & facial recognition, and predictive data science analytics.',
    answerBn: 'আমরা কাস্টম জেনারেটিভ এআই সিস্টেম, এলএলএম ইন্টিগ্রেশন, কম্পিউটার ভিশন, অটোমেটেড ওয়ার্কফ্লো এবং প্রেডিক্টিভ ডেটা অ্যানালিটিক্স সলিউশন ডেভেলপ করি।',
    tags: ['ai', 'machine learning', 'llm', 'computer vision', 'data science'],
  },
  {
    id: 'faq-2',
    category: 'Drones',
    question: 'Do you offer custom UAV drone design and pilot training?',
    questionBn: 'আপনারা কি কাস্টম ড্রোন তৈরি ও পাইলট ট্রেনিং করান?',
    answer: 'Yes! We develop autonomous UAV solutions for aerial mapping, infrastructure inspection, and precision agriculture. We also host practical flight workshops with ArduPilot/PX4 avionics in our dedicated test cage.',
    answerBn: 'হ্যাঁ! আমরা অ্যারিয়াল ম্যাপিং ও এগ্রিকালচারাল ড্রোনের পাশাপাশি হ্যান্ডস-অন ড্রোন অ্যাসেম্বলি এবং ফ্লাইট ট্রেনিং পরিচালনা করি।',
    tags: ['drone', 'uav', 'flight', 'aerial mapping', 'fpv'],
  },
  {
    id: 'faq-3',
    category: 'Robotics',
    question: 'What industrial automation and robotics solutions are available?',
    questionBn: 'আপনাদের রোবোটিক্স ও ইন্ডাস্ট্রিয়াল অটোমেশন সেবা কেমন?',
    answer: 'We build 6-axis robotic arms for pick-and-place, assembly, ROS 2-based autonomous ground vehicles, and IoT sensor telemetry networks with real-time industrial dashboards.',
    answerBn: 'আমরা ইন্ডাস্ট্রিয়াল ৬-অ্যাক্সিস রোবোটিক আর্ম, ROS ২ বেসড অটোনমাস সিস্টেম এবং আইওটি অটোমেশন তৈরি করি।',
    tags: ['robotics', 'automation', 'ros', 'iot', 'hardware', 'embedded'],
  },
  {
    id: 'faq-4',
    category: 'Software',
    question: 'What tech stack do you use for web and mobile development?',
    questionBn: 'সফটওয়্যার ও মোবাইল অ্যাপ ডেভেলপমেন্টে কি টেকনোলজি ব্যবহার করেন?',
    answer: 'We craft scalable applications using React, Next.js, Node.js, Python FastAPI, PostgreSQL, AWS/GCP cloud architectures, and cross-platform mobile apps with Flutter & React Native.',
    answerBn: 'আমরা React, Next.js, Node.js, Python, PostgreSQL এবং Flutter/React Native দিয়ে হাই-পারফরম্যান্স ওয়েব ও মোবাইল অ্যাপ্লিকেশন ডেভেলপ করি।',
    tags: ['software', 'web development', 'mobile apps', 'react', 'flutter', 'cloud'],
  },
  {
    id: 'faq-5',
    category: 'Cybersecurity',
    question: 'Do you perform security audits and ethical hacking?',
    questionBn: 'আপনারা কি সিকিউরিটি অডিট ও এথিক্যাল হ্যাকিং ট্রেনিং দেন?',
    answer: 'Yes. Our offensive and defensive security teams conduct Vulnerability Assessment and Penetration Testing (VAPT), cloud security posture reviews, and train corporate engineers in red-team defensive tactics.',
    answerBn: 'হ্যাঁ, আমরা এন্টারপ্রাইজ VAPT সিকিউরিটি অডিট করি এবং প্র্যাকটিক্যাল এথিক্যাল হ্যাকিং ও সাইবার ডিফেন্স ট্রেনিং প্রদান করি।',
    tags: ['cybersecurity', 'vapt', 'ethical hacking', 'infosec', 'pentesting'],
  },
  {
    id: 'faq-6',
    category: 'Training',
    question: 'Are your IT training programs hands-on with physical hardware?',
    questionBn: 'আপনাদের আইটি ট্রেনিং কি প্র্যাকটিক্যাল ও হার্ডওয়্যার ভিত্তিক?',
    answer: 'Absolutely. Every training track features physical prototyping kits (microcontrollers, flight controllers, sensor arrays), real cloud sandboxes, and capstone projects evaluated by industry leads.',
    answerBn: 'অবশ্যই! আমাদের প্রতিটি কোর্সে রিয়েল হার্ডওয়্যার কিটস, ল্যাব প্র্যাকটিস এবং ইন্ডাস্ট্রি প্রজেক্ট অন্তর্ভুক্ত থাকে।',
    tags: ['training', 'courses', 'bootcamp', 'admission', 'hardware lab'],
  },
  {
    id: 'faq-7',
    category: 'Internships',
    question: 'Who is eligible for MARVZ internships and research fellowships?',
    questionBn: 'কারা MARVZ ইন্টার্নশিপ ও রিসার্চ ফেলোশিপে আবেদন করতে পারবেন?',
    answer: 'Students and fresh graduates in Computer Science, Electrical/Robotics Engineering, or related technical fields with strong passion for innovation. We offer 3-month and 6-month cohorts with mentorship and certificates.',
    answerBn: 'সিএসই, ইইই বা রোবোটিক্স ব্যাকগ্রাউন্ডের শিক্ষার্থী ও ফ্রেশ গ্র্যাজুয়েটরা ৩ থেকে ৬ মাসের এই ফেলোশিপে আবেদন করতে পারেন।',
    tags: ['internship', 'careers', 'jobs', 'research fellowship', 'students'],
  },
  {
    id: 'faq-8',
    category: 'Contact',
    question: 'How do I visit your Innovation Hub or schedule a consultation?',
    questionBn: 'আপনাদের ইনোভেশন হাব কীভাবে ভিজিট করব বা মিটিং বুক করব?',
    answer: 'Our Innovation Hub is located at Level 4, Tech Park. You can book an appointment via our chatbot lead form, call +880 1800-MARVZ-TECH, or message our WhatsApp advisor line at +880 1711-000000.',
    answerBn: 'আমাদের অফিস টেক পার্কের লেভেল ৪-এ অবস্থিত। চ্যাটবটে ফর্ম পূরণ করে বা সরাসরি হোয়াটসঅ্যাপে (+880 1711-000000) যোগাযোগ করে মিটিং বুক করতে পারেন।',
    tags: ['contact', 'office', 'location', 'phone', 'whatsapp', 'address'],
  },
];
