import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  Search,
  Download,
  CreditCard,
  Calendar,
  Users,
  X,
  Save,
} from 'lucide-react';
import {
  TrainingProgram,
  TrainingRegistration,
  PaymentStatus,
  RegistrationStatus,
} from '../../types/admin';
import { adminFetch } from '../../utils/adminApi';

interface TrainingManagementViewProps {
  onRefreshStats?: () => void;
  onSiteDataUpdated?: () => void;
}

const ITEMS_PER_PAGE = 6;

export const TrainingManagementView: React.FC<TrainingManagementViewProps> = ({
  onRefreshStats,
  onSiteDataUpdated,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'registrations' | 'programs'>('registrations');
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [registrations, setRegistrations] = useState<TrainingRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  // Registration filters
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Course CRUD modal
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<TrainingProgram | null>(null);
  const [programForm, setProgramForm] = useState({
    title: '',
    level: 'Intermediate',
    duration: '6-Week Bootcamp',
    format: 'Dhaka Lab + Live Mentoring',
    price: 12000,
    currency: 'BDT' as 'BDT' | 'USD',
    seatsTotal: 25,
    seatsAvailable: 20,
    status: 'Open' as 'Open' | 'Upcoming' | 'Closed',
    nextBatchDate: '2026-07-01',
    description: '',
    hardwareTools: '',
  });

  // Manual student enrollment modal
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [enrollForm, setEnrollForm] = useState({
    programId: '',
    studentName: '',
    email: '',
    phone: '',
    organization: '',
    paymentStatus: 'Paid' as PaymentStatus,
    paymentMethod: 'Cash at Office',
    transactionId: 'DESK-REC',
    registrationStatus: 'Confirmed' as RegistrationStatus,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [progRes, regRes] = await Promise.all([
        adminFetch('/api/admin/trainings'),
        adminFetch('/api/admin/training-registrations'),
      ]);
      if (progRes.ok) {
        const pd = await progRes.json();
        setPrograms(pd.programs || []);
        if (!enrollForm.programId && pd.programs?.length > 0) {
          setEnrollForm((prev) => ({ ...prev, programId: pd.programs[0].id }));
        }
      }
      if (regRes.ok) {
        const rd = await regRes.json();
        setRegistrations(rd.registrations || []);
      }
    } catch (err) {
      console.error('Failed to load training data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddProgram = () => {
    setEditingProgram(null);
    setProgramForm({
      title: '',
      level: 'Intermediate',
      duration: '6-Week Bootcamp',
      format: 'Physical Hardware Lab',
      price: 12000,
      currency: 'BDT',
      seatsTotal: 25,
      seatsAvailable: 25,
      status: 'Open',
      nextBatchDate: '2026-07-01',
      description: '',
      hardwareTools: '',
    });
    setIsProgramModalOpen(true);
  };

  const handleOpenEditProgram = (p: TrainingProgram) => {
    setEditingProgram(p);
    setProgramForm({
      title: p.title,
      level: p.level,
      duration: p.duration,
      format: p.format,
      price: p.price,
      currency: p.currency,
      seatsTotal: p.seatsTotal,
      seatsAvailable: p.seatsAvailable,
      status: p.status,
      nextBatchDate: p.nextBatchDate,
      description: p.description,
      hardwareTools: p.hardwareTools.join(', '),
    });
    setIsProgramModalOpen(true);
  };

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programForm.title.trim()) return;

    const url = editingProgram
      ? `/api/admin/trainings/${editingProgram.id}`
      : '/api/admin/trainings';
    const method = editingProgram ? 'PUT' : 'POST';

    const res = await adminFetch(url, {
      method,
      body: JSON.stringify(programForm),
    });

    if (res.ok) {
      setIsProgramModalOpen(false);
      await loadData();
      if (onRefreshStats) onRefreshStats();
      if (onSiteDataUpdated) onSiteDataUpdated();
    }
  };

  const handleDeleteProgram = async (id: string, title: string) => {
    if (!confirm(`Delete training course "${title}"?`)) return;
    const res = await adminFetch(`/api/admin/trainings/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setPrograms((prev) => prev.filter((p) => p.id !== id));
      if (onRefreshStats) onRefreshStats();
      if (onSiteDataUpdated) onSiteDataUpdated();
    }
  };

  const handleUpdateRegistration = async (
    id: string,
    patch: Partial<Pick<TrainingRegistration, 'paymentStatus' | 'registrationStatus'>>
  ) => {
    const res = await adminFetch(`/api/admin/training-registrations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const data = await res.json();
      setRegistrations((prev) => prev.map((r) => (r.id === id ? data.registration : r)));
      if (onRefreshStats) onRefreshStats();
    }
  };

  const handleDeleteRegistration = async (id: string, name: string) => {
    if (!confirm(`Remove registration record for "${name}"?`)) return;
    const res = await adminFetch(`/api/admin/training-registrations/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setRegistrations((prev) => prev.filter((r) => r.id !== id));
      if (onRefreshStats) onRefreshStats();
    }
  };

  const handleManualEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollForm.studentName.trim()) return;
    const res = await adminFetch('/api/admin/training-registrations', {
      method: 'POST',
      body: JSON.stringify(enrollForm),
    });
    if (res.ok) {
      setIsEnrollModalOpen(false);
      setEnrollForm({
        programId: programs[0]?.id || '',
        studentName: '',
        email: '',
        phone: '',
        organization: '',
        paymentStatus: 'Paid',
        paymentMethod: 'Cash at Office',
        transactionId: 'DESK-REC',
        registrationStatus: 'Confirmed',
      });
      await loadData();
      if (onRefreshStats) onRefreshStats();
    }
  };

  const exportRegistrationsCSV = () => {
    const headers = [
      'Student Name',
      'Email',
      'Phone',
      'Program',
      'Fee',
      'Method',
      'Transaction ID',
      'Payment Status',
      'Enrollment Status',
      'Date',
    ];
    const rows = registrations.map((r) => [
      `"${r.studentName}"`,
      `"${r.email}"`,
      `"${r.phone}"`,
      `"${r.programTitle}"`,
      `"${r.currency} ${r.feeAmount}"`,
      `"${r.paymentMethod}"`,
      `"${r.transactionId}"`,
      `"${r.paymentStatus}"`,
      `"${r.registrationStatus}"`,
      `"${new Date(r.registeredAt).toLocaleDateString()}"`,
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((x) => x.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `MARVZ_Training_Registrations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRegs = registrations.filter((r) => {
    const matchesPay = paymentFilter === 'all' || r.paymentStatus === paymentFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      r.studentName.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.programTitle.toLowerCase().includes(q) ||
      r.transactionId.toLowerCase().includes(q);
    return matchesPay && matchesQuery;
  });

  const totalPages = Math.max(1, Math.ceil(filteredRegs.length / ITEMS_PER_PAGE));
  const paginatedRegs = filteredRegs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const paidRevenue = registrations
    .filter((r) => r.paymentStatus === 'Paid')
    .reduce((acc, r) => acc + (r.feeAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <h2 className="text-xl font-bold text-[#202124] flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#30343B]" />
            Training Programs, Student Enrollments & Payment Tracking
          </h2>
          <p className="text-xs text-[#777777] mt-1">
            Manage live website courses, batch schedules, student seat reservations, and bKash/Nagad/Desk payment status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportRegistrationsCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#777777]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => (activeSubTab === 'programs' ? handleOpenAddProgram() : setIsEnrollModalOpen(true))}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#30343B] hover:bg-[#202124] text-white text-xs font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{activeSubTab === 'programs' ? 'Add Course' : 'Manual Enrollment'}</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs & Revenue Pill */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] pb-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('registrations')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeSubTab === 'registrations'
                ? 'bg-[#30343B] text-white'
                : 'bg-white border border-[#E5E7EB] text-[#777777] hover:text-[#202124]'
            }`}
          >
            Student Registrations ({registrations.length})
          </button>
          <button
            onClick={() => setActiveSubTab('programs')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeSubTab === 'programs'
                ? 'bg-[#30343B] text-white'
                : 'bg-white border border-[#E5E7EB] text-[#777777] hover:text-[#202124]'
            }`}
          >
            Training Courses ({programs.length})
          </button>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono font-semibold tabular-nums">
          Verified Paid Revenue: BDT {paidRevenue.toLocaleString()}
        </div>
      </div>

      {activeSubTab === 'registrations' ? (
        <div className="space-y-4">
          {/* Search & Payment Filter */}
          <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-[#777777] absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Search student, program title, email, or transaction ID..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] placeholder-[#777777] focus:outline-none focus:bg-white focus:border-[#30343B]"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {(['all', 'Paid', 'Pending', 'Partial', 'Refunded'] as const).map((ps) => (
                <button
                  key={ps}
                  onClick={() => {
                    setPaymentFilter(ps);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    paymentFilter === ps
                      ? 'bg-[#30343B] text-white'
                      : 'bg-[#F3F4F6] text-[#777777] hover:text-[#202124] border border-[#E5E7EB]'
                  }`}
                >
                  {ps === 'all' ? 'All Payments' : ps}
                </button>
              ))}
            </div>
          </div>

          {/* Registrations Table */}
          <div className="rounded-2xl bg-white border border-[#E5E7EB] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F3F4F6] text-[#777777] border-b border-[#E5E7EB] font-mono text-[11px] uppercase">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Program</th>
                    <th className="py-3 px-4">Fee & Tx ID</th>
                    <th className="py-3 px-4">Payment Status</th>
                    <th className="py-3 px-4">Enrollment Status</th>
                    <th className="py-3 px-4 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#777777]">
                        Loading student registrations...
                      </td>
                    </tr>
                  ) : paginatedRegs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#777777]">
                        No training registrations match your filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedRegs.map((reg) => (
                      <tr key={reg.id} className="hover:bg-[#F3F4F6]/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#202124]">{reg.studentName}</div>
                          <div className="text-[11px] text-[#777777]">{reg.email}</div>
                          <div className="text-[10px] font-mono text-[#777777]">
                            {reg.phone} {reg.organization ? `• ${reg.organization}` : ''}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 max-w-[210px]">
                          <div className="font-semibold text-[#202124] line-clamp-2">{reg.programTitle}</div>
                          <div className="text-[10px] text-[#777777] font-mono">
                            {new Date(reg.registeredAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#202124] font-mono tabular-nums">
                            {reg.currency} {reg.feeAmount.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-[#30343B] font-mono">
                            {reg.paymentMethod} • {reg.transactionId}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            value={reg.paymentStatus}
                            onChange={(e) =>
                              handleUpdateRegistration(reg.id, {
                                paymentStatus: e.target.value as PaymentStatus,
                              })
                            }
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold border focus:outline-none ${
                              reg.paymentStatus === 'Paid'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : reg.paymentStatus === 'Pending'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : reg.paymentStatus === 'Partial'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : 'bg-red-50 text-red-800 border-red-200'
                            }`}
                          >
                            <option value="Pending" className="bg-white text-[#202124]">Pending</option>
                            <option value="Paid" className="bg-white text-[#202124]">Paid</option>
                            <option value="Partial" className="bg-white text-[#202124]">Partial</option>
                            <option value="Refunded" className="bg-white text-[#202124]">Refunded</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            value={reg.registrationStatus}
                            onChange={(e) =>
                              handleUpdateRegistration(reg.id, {
                                registrationStatus: e.target.value as RegistrationStatus,
                              })
                            }
                            className="bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] rounded-lg px-2.5 py-1 text-[11px] focus:outline-none focus:border-[#30343B]"
                          >
                            <option value="Confirmed">Confirmed</option>
                            <option value="Pending Verification">Pending Verification</option>
                            <option value="Waitlisted">Waitlisted</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleDeleteRegistration(reg.id, reg.studentName)}
                            className="p-1.5 rounded-lg text-[#777777] hover:text-red-700 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#777777]">
                <span>
                  Page {currentPage} of {totalPages} ({filteredRegs.length} registrations)
                </span>
                <div className="flex gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="px-3 py-1 rounded-lg bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="px-3 py-1 rounded-lg bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs.map((prog) => (
            <div
              key={prog.id}
              className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs flex flex-col justify-between gap-4 hover:border-[#30343B]/30 transition-colors"
            >
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#F3F4F6] text-[#30343B] border border-[#E5E7EB]">
                    {prog.level}
                  </span>
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold border ${
                      prog.status === 'Open'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : prog.status === 'Upcoming'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : 'bg-[#F3F4F6] text-[#777777] border-[#E5E7EB]'
                    }`}
                  >
                    {prog.status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-[#202124] leading-snug">{prog.title}</h4>
                <p className="text-[#777777] line-clamp-2">{prog.description}</p>

                <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono text-[#202124]">
                  <div className="p-2 rounded-lg bg-[#F3F4F6] border border-[#E5E7EB] flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#30343B]" />
                    <span className="tabular-nums">
                      {prog.currency} {prog.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#F3F4F6] border border-[#E5E7EB] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#30343B]" />
                    <span className="tabular-nums">
                      {prog.seatsAvailable}/{prog.seatsTotal} seats
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-[#777777] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#777777]" />
                  <span>
                    Batch: {prog.nextBatchDate} • {prog.duration}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEditProgram(prog)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E5E7EB] text-[#202124] text-xs font-semibold transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Course</span>
                </button>
                <button
                  onClick={() => handleDeleteProgram(prog.id, prog.title)}
                  className="p-1.5 rounded-lg bg-[#F3F4F6] hover:bg-red-50 border border-[#E5E7EB] text-[#777777] hover:text-red-700 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Program Add/Edit Modal */}
      {isProgramModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-xs">
            <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F3F4F6]">
              <h3 className="text-base font-bold text-[#202124]">
                {editingProgram ? 'Edit Training Program' : 'Create New Training Program'}
              </h3>
              <button onClick={() => setIsProgramModalOpen(false)} className="text-[#777777] hover:text-[#202124]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProgram} className="p-6 overflow-y-auto space-y-3.5">
              <div>
                <label className="block font-semibold text-[#202124] uppercase mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  value={programForm.title}
                  onChange={(e) => setProgramForm({ ...programForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#202124] uppercase mb-1">Level</label>
                  <input
                    type="text"
                    value={programForm.level}
                    onChange={(e) => setProgramForm({ ...programForm, level: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#202124] uppercase mb-1">Duration</label>
                  <input
                    type="text"
                    value={programForm.duration}
                    onChange={(e) => setProgramForm({ ...programForm, duration: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#202124] uppercase mb-1">Fee Amount</label>
                  <input
                    type="number"
                    value={programForm.price}
                    onChange={(e) => setProgramForm({ ...programForm, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#202124] uppercase mb-1">Currency</label>
                  <select
                    value={programForm.currency}
                    onChange={(e) => setProgramForm({ ...programForm, currency: e.target.value as 'BDT' | 'USD' })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                  >
                    <option value="BDT">BDT</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#202124] uppercase mb-1">Status</label>
                  <select
                    value={programForm.status}
                    onChange={(e) => setProgramForm({ ...programForm, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                  >
                    <option value="Open">Open</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#202124] uppercase mb-1">Total Seats</label>
                  <input
                    type="number"
                    value={programForm.seatsTotal}
                    onChange={(e) => setProgramForm({ ...programForm, seatsTotal: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#202124] uppercase mb-1">Available Seats</label>
                  <input
                    type="number"
                    value={programForm.seatsAvailable}
                    onChange={(e) => setProgramForm({ ...programForm, seatsAvailable: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#202124] uppercase mb-1">Next Batch Date</label>
                  <input
                    type="date"
                    value={programForm.nextBatchDate}
                    onChange={(e) => setProgramForm({ ...programForm, nextBatchDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#202124] uppercase mb-1">Format / Venue</label>
                <input
                  type="text"
                  value={programForm.format}
                  onChange={(e) => setProgramForm({ ...programForm, format: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#202124] uppercase mb-1">Syllabus Description</label>
                <textarea
                  rows={3}
                  value={programForm.description}
                  onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#202124] uppercase mb-1">
                  Hardware & Lab Tools (comma-separated)
                </label>
                <input
                  type="text"
                  value={programForm.hardwareTools}
                  onChange={(e) => setProgramForm({ ...programForm, hardwareTools: e.target.value })}
                  placeholder="Jetson Nano, ESP32, ArduPilot"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                />
              </div>

              <div className="pt-3 border-t border-[#E5E7EB] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProgramModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#202124] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#30343B] hover:bg-[#202124] text-white font-semibold"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Program</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Student Enrollment Modal */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl p-6 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] mb-4">
              <h3 className="text-base font-bold text-[#202124]">Manual Desk Student Enrollment</h3>
              <button onClick={() => setIsEnrollModalOpen(false)} className="text-[#777777] hover:text-[#202124]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualEnroll} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-[#202124] uppercase mb-1">Training Course *</label>
                <select
                  value={enrollForm.programId}
                  onChange={(e) => setEnrollForm({ ...enrollForm, programId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                >
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.currency} {p.price.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#202124] uppercase mb-1">Student Name *</label>
                  <input
                    type="text"
                    required
                    value={enrollForm.studentName}
                    onChange={(e) => setEnrollForm({ ...enrollForm, studentName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#202124] uppercase mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={enrollForm.phone}
                    onChange={(e) => setEnrollForm({ ...enrollForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#202124] uppercase mb-1">Email</label>
                  <input
                    type="email"
                    value={enrollForm.email}
                    onChange={(e) => setEnrollForm({ ...enrollForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#202124] uppercase mb-1">Organization / Univ</label>
                  <input
                    type="text"
                    value={enrollForm.organization}
                    onChange={(e) => setEnrollForm({ ...enrollForm, organization: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#202124] uppercase mb-1">Payment Method</label>
                  <select
                    value={enrollForm.paymentMethod}
                    onChange={(e) => setEnrollForm({ ...enrollForm, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                  >
                    <option value="Cash at Office">Cash at Office</option>
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Card">Card</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#202124] uppercase mb-1">Payment Status</label>
                  <select
                    value={enrollForm.paymentStatus}
                    onChange={(e) =>
                      setEnrollForm({ ...enrollForm, paymentStatus: e.target.value as PaymentStatus })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Partial">Partial</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#202124] uppercase mb-1">Tx / Receipt ID</label>
                  <input
                    type="text"
                    value={enrollForm.transactionId}
                    onChange={(e) => setEnrollForm({ ...enrollForm, transactionId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5E7EB] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#202124] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#30343B] hover:bg-[#202124] text-white font-semibold"
                >
                  Confirm Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
