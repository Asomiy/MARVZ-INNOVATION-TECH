import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  ExternalLink,
  FileText,
  X,
  Mail,
  Phone,
  GraduationCap,
} from 'lucide-react';
import { InternshipApplication, InternshipStatus } from '../../types/admin';
import { adminFetch } from '../../utils/adminApi';

interface InternshipManagementViewProps {
  onRefreshStats?: () => void;
}

const ITEMS_PER_PAGE = 6;

export const InternshipManagementView: React.FC<InternshipManagementViewProps> = ({
  onRefreshStats,
}) => {
  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Selected application modal
  const [selectedApp, setSelectedApp] = useState<InternshipApplication | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/internships');
      if (res.ok) {
        const data = await res.json();
        setApplications(data.internships || []);
      }
    } catch (err) {
      console.error('Failed to fetch internships:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusChange = async (id: string, status: InternshipStatus) => {
    try {
      const res = await adminFetch(`/api/admin/internships/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const data = await res.json();
        setApplications((prev) => prev.map((a) => (a.id === id ? data.application : a)));
        if (selectedApp?.id === id) setSelectedApp(data.application);
        if (onRefreshStats) onRefreshStats();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedApp) return;
    setSavingNotes(true);
    try {
      const res = await adminFetch(`/api/admin/internships/${selectedApp.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ adminNotes: notesDraft }),
      });
      if (res.ok) {
        const data = await res.json();
        setApplications((prev) => prev.map((a) => (a.id === selectedApp.id ? data.application : a)));
        setSelectedApp(data.application);
      }
    } catch (err) {
      console.error('Failed to save review notes:', err);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete internship application from "${name}"?`)) return;
    try {
      const res = await adminFetch(`/api/admin/internships/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setApplications((prev) => prev.filter((a) => a.id !== id));
        if (selectedApp?.id === id) setSelectedApp(null);
        if (onRefreshStats) onRefreshStats();
      }
    } catch (err) {
      console.error('Failed to delete application:', err);
    }
  };

  const exportCSV = () => {
    const headers = ['Full Name', 'Email', 'Phone', 'University', 'Department', 'Track', 'Status', 'Applied Date'];
    const rows = applications.map((a) => [
      `"${a.fullName}"`,
      `"${a.email}"`,
      `"${a.phone}"`,
      `"${a.university}"`,
      `"${a.department}"`,
      `"${a.track}"`,
      `"${a.status}"`,
      `"${new Date(a.appliedAt).toLocaleDateString()}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `MARVZ_Internships_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = applications.filter((a) => {
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      a.fullName.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.university.toLowerCase().includes(q) ||
      a.track.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const getStatusBadge = (status: InternshipStatus) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Rejected':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'Under Review':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <h2 className="text-xl font-bold text-[#202124] flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#30343B]" />
            Internship & Fellowship Management
          </h2>
          <p className="text-xs text-[#777777] mt-1">
            Review student applications, download CVs, inspect GitHub portfolios, and Approve/Reject cohort candidates.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] text-xs font-semibold transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-[#777777]" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-[#777777] absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search applicants by name, university, track, or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] placeholder-[#777777] focus:outline-none focus:bg-white focus:border-[#30343B]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-[#777777]" />
          {(['all', 'Pending', 'Under Review', 'Approved', 'Rejected'] as const).map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#30343B] text-white'
                  : 'bg-[#F3F4F6] text-[#777777] hover:text-[#202124] border border-[#E5E7EB]'
              }`}
            >
              {st === 'all' ? `All (${applications.length})` : st}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      <div className="rounded-2xl bg-white border border-[#E5E7EB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F3F4F6] text-[#777777] border-b border-[#E5E7EB] font-mono text-[11px] uppercase">
              <tr>
                <th className="py-3 px-4">Applicant</th>
                <th className="py-3 px-4">University & Dept</th>
                <th className="py-3 px-4">Track</th>
                <th className="py-3 px-4">Portfolio / CV</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#777777]">
                    Loading internship applications...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#777777]">
                    No applications match the current filters.
                  </td>
                </tr>
              ) : (
                paginated.map((app) => (
                  <tr key={app.id} className="hover:bg-[#F3F4F6]/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#202124]">{app.fullName}</div>
                      <div className="text-[11px] text-[#777777]">{app.email}</div>
                      <div className="text-[10px] text-[#777777] font-mono">{app.phone}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#202124]">{app.university}</div>
                      <div className="text-[11px] text-[#777777]">
                        {app.department} • {app.semesterOrYear}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-[#F3F4F6] border border-[#E5E7EB] text-[#30343B] font-mono text-[11px]">
                        {app.track}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 space-y-1">
                      {app.portfolioUrl && (
                        <a
                          href={app.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#30343B] hover:underline font-medium text-[11px] mr-2"
                        >
                          <ExternalLink className="w-3 h-3" /> GitHub
                        </a>
                      )}
                      {app.resumeUrl ? (
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-700 hover:underline font-medium text-[11px]"
                        >
                          <FileText className="w-3 h-3" /> CV File
                        </a>
                      ) : app.resumeFileName ? (
                        <span className="text-[11px] text-[#777777]">{app.resumeFileName}</span>
                      ) : (
                        <span className="text-[11px] text-[#777777]">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-mono uppercase px-2.5 py-1 rounded-md border font-semibold ${getStatusBadge(
                          app.status
                        )}`}
                      >
                        {app.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setNotesDraft(app.adminNotes || '');
                          }}
                          className="p-1.5 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E5E7EB] text-[#202124]"
                          title="Inspect Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(app.id, 'Approved')}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 transition-colors"
                          title="Approve Candidate"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(app.id, 'Rejected')}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-200 transition-colors"
                          title="Reject Candidate"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(app.id, app.fullName)}
                          className="p-1.5 rounded-lg bg-[#F3F4F6] hover:bg-red-50 border border-[#E5E7EB] text-[#777777] hover:text-red-700 transition-colors"
                          title="Delete Application"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#777777]">
            <span>
              Page {currentPage} of {totalPages} ({filtered.length} records)
            </span>
            <div className="flex gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1 rounded-lg bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] disabled:opacity-40 hover:bg-[#E5E7EB]"
              >
                Prev
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1 rounded-lg bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] disabled:opacity-40 hover:bg-[#E5E7EB]"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Application Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-xs">
            <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F3F4F6]">
              <div>
                <h3 className="text-base font-bold text-[#202124]">{selectedApp.fullName}</h3>
                <p className="text-[11px] text-[#30343B] font-mono">{selectedApp.track}</p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="text-[#777777] hover:text-[#202124]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB]">
                <div className="flex items-center gap-2 text-[#202124]">
                  <Mail className="w-3.5 h-3.5 text-[#777777]" />
                  <span>{selectedApp.email}</span>
                </div>
                <div className="flex items-center gap-2 text-[#202124]">
                  <Phone className="w-3.5 h-3.5 text-[#777777]" />
                  <span>{selectedApp.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-[#202124]">
                  <GraduationCap className="w-3.5 h-3.5 text-[#777777]" />
                  <span>
                    {selectedApp.university} ({selectedApp.department})
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#777777]">
                  <Clock className="w-3.5 h-3.5 text-[#777777]" />
                  <span>Applied {new Date(selectedApp.appliedAt).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <div className="font-semibold text-[#202124] uppercase mb-1">Technical Background & Cover Note</div>
                <div className="p-3.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] leading-relaxed whitespace-pre-line">
                  {selectedApp.coverNote || 'No cover note provided.'}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {selectedApp.portfolioUrl && (
                  <a
                    href={selectedApp.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E5E7EB] text-[#202124] font-semibold"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Portfolio / GitHub</span>
                  </a>
                )}
                {selectedApp.resumeUrl && (
                  <a
                    href={selectedApp.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Download Uploaded CV ({selectedApp.resumeFileName || 'CV'})</span>
                  </a>
                )}
              </div>

              <div>
                <label className="block font-semibold text-[#202124] uppercase mb-1">
                  HR Review & Interview Notes
                </label>
                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    placeholder="Record evaluation score or interview date..."
                    className="flex-1 px-3 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                  />
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="px-4 py-2 rounded-xl bg-[#30343B] hover:bg-[#202124] text-white font-semibold self-end"
                  >
                    {savingNotes ? 'Saving...' : 'Save Note'}
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-2">
                <span className="text-[#777777]">Update Application Decision:</span>
                <div className="flex items-center gap-2">
                  {(['Pending', 'Under Review', 'Approved', 'Rejected'] as InternshipStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(selectedApp.id, st)}
                      className={`px-3 py-1.5 rounded-lg font-semibold border transition-colors ${
                        selectedApp.status === st
                          ? 'bg-[#30343B] border-[#30343B] text-white'
                          : 'bg-[#F3F4F6] border-[#E5E7EB] text-[#202124] hover:bg-[#E5E7EB]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
