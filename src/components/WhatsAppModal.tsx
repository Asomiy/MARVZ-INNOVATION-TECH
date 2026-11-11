import React, { useState } from 'react';
import { X, MessageSquare, ExternalLink, Copy, Check, Sparkles } from 'lucide-react';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ isOpen, onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState('+18005426278');
  const [selectedTopic, setSelectedTopic] = useState('Drone Engineering & Flight Operations');
  const [customQuery, setCustomQuery] = useState(
    'Hello MARVZ & INNOVATION TECH Advisory Desk, I would like to inquire about upcoming training cohorts, syllabus details, and hardware lab schedules.'
  );
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const topics = [
    {
      name: 'Drone Engineering & Flight Operations',
      text: 'Hello MARVZ TECH, I would like to inquire about upcoming Drone Engineering & UAV training cohorts, flight test range schedules, and kit requirements.'
    },
    {
      name: 'Industrial Robotics & ROS 2 Masterclass',
      text: 'Hello MARVZ TECH, I am interested in reserving a seat for the Industrial Robotics & ROS 2 masterclass. Please share the syllabus and lab details.'
    },
    {
      name: 'Artificial Intelligence & Deep Learning',
      text: 'Hello MARVZ TECH, I would like information regarding the Applied AI & Deep Learning Engineering curriculum and prerequisites.'
    },
    {
      name: 'Corporate Engineering Training',
      text: 'Hello MARVZ TECH, our enterprise engineering department is looking for custom training solutions in cloud infrastructure, cybersecurity, and automation.'
    },
    {
      name: 'Innovation Lab Access & Prototyping',
      text: 'Hello MARVZ TECH, I would like to inquire about student project incubation and hardware testing bench access in your Innovation Labs.'
    }
  ];

  const handleTopicChange = (topicName: string) => {
    setSelectedTopic(topicName);
    const found = topics.find(t => t.name === topicName);
    if (found) {
      setCustomQuery(found.text);
    }
  };

  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
  const encodedText = encodeURIComponent(customQuery);
  const waUrl = `https://wa.me/${cleanNumber}?text=${encodedText}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(customQuery);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0c1a30] border border-emerald-800/50 shadow-2xl p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close WhatsApp modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#081426] border border-slate-700/80 p-0.5 shrink-0 flex items-center justify-center">
            <img
              src="/assets/aistudio/Capture.JPG11_7f7b0bf9.JPG"
              alt="MARVZ Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider">
              MARVZ Direct Startup Line
            </span>
            <h3 className="text-xl font-bold text-white">
              WhatsApp Advisory Line
            </h3>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          Connect directly with an engineering advisor or admissions coordinator. Choose an inquiry topic to automatically compose your message.
        </p>

        {/* Topic Selector */}
        <div className="space-y-2 mb-4">
          <label className="block text-xs font-medium text-slate-300">
            Select Inquiry Topic:
          </label>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {topics.map((t, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleTopicChange(t.name)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                  selectedTopic === t.name
                    ? 'bg-emerald-950/60 border border-emerald-700/60 text-white font-medium'
                    : 'bg-[#071426] border border-slate-800 text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <span>{t.name}</span>
                {selectedTopic === t.name && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Editable Message Preview */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-slate-300">
              Message Preview:
            </label>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <textarea
            rows={3}
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#071426] border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
          />
        </div>

        {/* Desk Number Info */}
        <div className="p-3 rounded-lg bg-[#071426] border border-slate-800 text-xs text-slate-400 flex items-center justify-between mb-6">
          <span>Active Desk Line:</span>
          <span className="text-white font-mono">{phoneNumber}</span>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg"
          >
            Cancel
          </button>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Open in WhatsApp</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
        </div>

      </div>
    </div>
  );
};
