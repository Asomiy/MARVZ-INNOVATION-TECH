import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  Upload,
  CreditCard,
  Loader2,
} from 'lucide-react';
import { TrainingProgram } from '../types/admin';

interface InternshipTrainingModalProps {
  isOpen: boolean;
  initialMode: 'internship' | 'training';
  initialProgramId?: string;
  programs: TrainingProgram[];
  onClose: () => void;
}

export const InternshipTrainingModal: React.FC<InternshipTrainingModalProps> = ({
  isOpen,
  initialMode,
  initialProgramId,
  programs,
  onClose,
}) => {
  const [mode, setMode] = useState<'internship' | 'training'>(initialMode);
  const [submitting, setSubmitting] = useState(false);
  const [submittedMsg, setSubmittedMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Internship Form State
  const [intForm, setIntForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    university: '',
    department: '',
    semesterOrYear: 'Final Year / Fresh Graduate',
    track: 'AI & Machine Learning',
    portfolioUrl: '',
    coverNote: '',
    resumeFileName: '',
    resumeBase64: '',
  });

  // Training Form State
  const [trainForm, setTrainForm] = useState({
    programId: initialProgramId || programs[0]?.id || '',
    studentName: '',
    email: '',
    phone: '',
    organization: '',
    experienceLevel: 'Intermediate',
    paymentMethod: 'bKash',
    transactionId: '',
  });

  useEffect(() => {
    setMode(initialMode);
    setSubmittedMsg(null);
    setErrorMsg('');
    if (initialProgramId) {
      setTrainForm((prev) => ({ ...prev, programId: initialProgramId }));
    } else if (!trainForm.programId && programs.length > 0) {
      setTrainForm((prev) => ({ ...prev, programId: programs[0].id }));
    }
  }, [initialMode, initialProgramId, isOpen, programs]);

  if (!isOpen) return null;

  const selectedProgram = programs.find((p) => p.id === trainForm.programId) || programs[0];

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) {
      setErrorMsg('Resume file size must be under 6 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setIntForm((prev) => ({
        ...prev,
        resumeFileName: file.name,
        resumeBase64: typeof reader.result === 'string' ? reader.result : '',
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitInternship = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/public/internships/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(intForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit application.');
      setSubmittedMsg(
        `Thank you, ${intForm.fullName}! Your internship application for "${intForm.track}" has been submitted to MARVZ HR & Engineering Desk.`
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/public/training/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trainForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit registration.');
      setSubmittedMsg(
        `Seat reserved for ${trainForm.studentName} in "${selectedProgram?.title}"! Payment verification status is tracked in our Training Desk.`
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white border border-[#E5E7EB] shadow-xl p-6 sm:p-8 text-[#202124]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-[#777777] hover:text-[#202124] hover:bg-[#F3F4F6] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Switcher Tabs */}
        <div className="flex items-center gap-2 mb-6 pr-10">
          <button
            type="button"
            onClick={() => {
              setMode('training');
              setSubmittedMsg(null);
              setErrorMsg('');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors border ${
              mode === 'training'
                ? 'bg-[#30343B] text-white border-[#30343B] shadow-xs'
                : 'bg-[#F3F4F6] text-[#777777] border-[#E5E7EB] hover:text-[#202124]'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Training Seat Registration</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('internship');
              setSubmittedMsg(null);
              setErrorMsg('');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors border ${
              mode === 'internship'
                ? 'bg-[#30343B] text-white border-[#30343B] shadow-xs'
                : 'bg-[#F3F4F6] text-[#777777] border-[#E5E7EB] hover:text-[#202124]'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Internship Application</span>
          </button>
        </div>

        {submittedMsg ? (
          <div className="py-10 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] text-[#30343B] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-[#202124]">Submission Confirmed</h3>
            <p className="text-sm text-[#777777] leading-relaxed max-w-md mx-auto">{submittedMsg}</p>
            <div className="pt-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#30343B] hover:bg-[#202124] rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : mode === 'training' ? (
          <form onSubmit={handleSubmitTraining} className="space-y-4 text-xs">
            <div className="border-b border-[#E5E7EB] pb-3">
              <h3 className="text-xl font-bold text-[#202124]">Register for Hands-On Engineering Lab</h3>
              <p className="text-[#777777] mt-0.5">
                Classes hosted at MARVZ Dhaka HQ — West Shewrapara (Near Metro Pillar 304).
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block font-semibold text-[#202124] mb-1">Select Program *</label>
              <select
                value={trainForm.programId}
                onChange={(e) => setTrainForm({ ...trainForm, programId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:ring-2 focus:ring-[#30343B] focus:bg-white"
              >
                {programs.map((prog) => (
                  <option key={prog.id} value={prog.id}>
                    {prog.title} ({prog.currency} {prog.price.toLocaleString()} · {prog.seatsAvailable} seats left)
                  </option>
                ))}
              </select>
            </div>

            {selectedProgram && (
              <div className="p-3.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-[#202124]">{selectedProgram.duration}</div>
                  <div className="text-[#777777]">
                    Next Batch: <span className="text-[#202124] font-medium">{selectedProgram.nextBatchDate}</span> ·{' '}
                    {selectedProgram.format}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-mono text-[#777777]">Course Fee</div>
                  <div className="text-base font-extrabold text-[#202124] tabular-nums">
                    {selectedProgram.currency} {selectedProgram.price.toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-[#202124] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariqul Islam"
                  value={trainForm.studentName}
                  onChange={(e) => setTrainForm({ ...trainForm, studentName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#202124] mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="tariq@university.edu.bd"
                  value={trainForm.email}
                  onChange={(e) => setTrainForm({ ...trainForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-[#202124] mb-1">Phone / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  placeholder="+880 17XX-XXXXXX"
                  value={trainForm.phone}
                  onChange={(e) => setTrainForm({ ...trainForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#202124] mb-1">University / Organization</label>
                <input
                  type="text"
                  placeholder="e.g. BUET / Tech Ltd"
                  value={trainForm.organization}
                  onChange={(e) => setTrainForm({ ...trainForm, organization: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-[#202124] mb-1">Payment Method</label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-[#777777] absolute left-3 top-2.5" />
                  <select
                    value={trainForm.paymentMethod}
                    onChange={(e) => setTrainForm({ ...trainForm, paymentMethod: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:bg-white"
                  >
                    <option value="bKash">bKash Merchant / Personal</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Card">Debit / Credit Card</option>
                    <option value="Cash at Office">Pay at Dhaka Office Desk</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-[#202124] mb-1">
                  Transaction Reference (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. BKH82910X (or Pay at Desk)"
                  value={trainForm.transactionId}
                  onChange={(e) => setTrainForm({ ...trainForm, transactionId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#202124] border border-[#E5E7EB]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#30343B] hover:bg-[#202124] text-white font-semibold shadow-xs disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{submitting ? 'Submitting...' : 'Confirm Seat Registration'}</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmitInternship} className="space-y-4 text-xs">
            <div className="border-b border-[#E5E7EB] pb-3">
              <h3 className="text-xl font-bold text-[#202124]">Apply for Engineering Internship & R&D Fellowship</h3>
              <p className="text-[#777777] mt-0.5">
                On-site & hybrid cohorts at Aysha Tower, West Shewrapara, Dhaka-1216.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-[#202124] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ayesha Siddika"
                  value={intForm.fullName}
                  onChange={(e) => setIntForm({ ...intForm, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#202124] mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="ayesha@student.edu"
                  value={intForm.email}
                  onChange={(e) => setIntForm({ ...intForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-[#202124] mb-1">Phone / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  placeholder="+880 18XX-XXXXXX"
                  value={intForm.phone}
                  onChange={(e) => setIntForm({ ...intForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#202124] mb-1">University / Institute *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BUET / KUET / NSU / BRACU"
                  value={intForm.university}
                  onChange={(e) => setIntForm({ ...intForm, university: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-[#202124] mb-1">Department</label>
                <input
                  type="text"
                  placeholder="e.g. CSE / EEE / ME / Robotics"
                  value={intForm.department}
                  onChange={(e) => setIntForm({ ...intForm, department: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#202124] mb-1">Preferred Technology Track *</label>
                <select
                  value={intForm.track}
                  onChange={(e) => setIntForm({ ...intForm, track: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:bg-white"
                >
                  <option value="AI & Machine Learning">AI & Machine Learning</option>
                  <option value="Robotics & Embedded Systems">Robotics & Embedded Systems</option>
                  <option value="Drone Technology & UAV">Drone Technology & UAV</option>
                  <option value="Cybersecurity">Cybersecurity & Defense</option>
                  <option value="IoT Systems">IoT & Connected Hardware</option>
                  <option value="Full-Stack Software">Full-Stack Software Engineering</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-[#202124] mb-1">GitHub / Portfolio Link</label>
                <input
                  type="url"
                  placeholder="https://github.com/username"
                  value={intForm.portfolioUrl}
                  onChange={(e) => setIntForm({ ...intForm, portfolioUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#202124] mb-1">Upload CV / Resume (PDF/DOCX)</label>
                <label className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#F3F4F6] border border-dashed border-[#D1D5DB] hover:border-[#30343B] cursor-pointer text-[#202124]">
                  <span className="truncate max-w-[190px]">
                    {intForm.resumeFileName || 'Choose CV file...'}
                  </span>
                  <Upload className="w-4 h-4 text-[#30343B] shrink-0" />
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleResumeChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#202124] mb-1">
                Technical Background & Cover Note *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe hardware, robotics, AI, or software projects you have built..."
                value={intForm.coverNote}
                onChange={(e) => setIntForm({ ...intForm, coverNote: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:bg-white"
              />
            </div>

            <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#202124] border border-[#E5E7EB]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#30343B] hover:bg-[#202124] text-white font-semibold shadow-xs disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{submitting ? 'Submitting...' : 'Submit Internship Application'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
