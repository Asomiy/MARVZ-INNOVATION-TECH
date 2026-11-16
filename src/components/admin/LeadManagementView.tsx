import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Search,
  Filter,
  Download,
  Plus,
  Mail,
  Phone,
  Clock,
  Trash2,
  Edit2,
  X,
  Save,
} from 'lucide-react';
import { Lead, LeadStatus } from '../../types/admin';
import { adminFetch } from '../../utils/adminApi';

export const LeadManagementView: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Manual Lead Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'Services',
    requirements: '',
    status: 'New' as LeadStatus,
    adminNotes: '',
    estimatedValue: '',
  });

  // Edit notes state
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/leads');
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleUpdateStatus = async (id: string, status: LeadStatus) => {
    try {
      const res = await adminFetch(`/api/admin/leads/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleSaveNotes = async (id: string) => {
    try {
      const res = await adminFetch(`/api/admin/leads/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ adminNotes: tempNotes }),
      });
      if (res.ok) {
        setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, adminNotes: tempNotes } : l)));
        setEditingNotesId(null);
      }
    } catch (err) {
      console.error('Failed to save notes:', err);
    }
  };

  const handleDeleteLead = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete lead inquiry from "${name}"?`)) return;
    try {
      const res = await adminFetch(`/api/admin/leads/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete lead:', err);
    }
  };

  const handleAddManualLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.name.trim()) return;

    try {
      const res = await adminFetch('/api/admin/leads', {
        method: 'POST',
        body: JSON.stringify(newLeadForm),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setNewLeadForm({
          name: '',
          email: '',
          phone: '',
          category: 'Services',
          requirements: '',
          status: 'New',
          adminNotes: '',
          estimatedValue: '',
        });
        fetchLeads();
      }
    } catch (err) {
      console.error('Failed to add manual lead:', err);
    }
  };

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Category', 'Status', 'Date', 'Requirements', 'Admin Notes', 'Value'];
    const rows = leads.map((l) => [
      `"${l.name}"`,
      `"${l.email}"`,
      `"${l.phone}"`,
      `"${l.category}"`,
      `"${l.status}"`,
      `"${new Date(l.timestamp).toLocaleDateString()}"`,
      `"${l.requirements.replace(/"/g, '""')}"`,
      `"${(l.adminNotes || '').replace(/"/g, '""')}"`,
      `"${l.estimatedValue || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MARVZ_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = leads.filter((l) => {
    const matchesStatus = statusFilter === 'all' || l.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesCategory = categoryFilter === 'all' || l.category.toLowerCase() === categoryFilter.toLowerCase();

    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      l.name.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.phone.toLowerCase().includes(q) ||
      l.requirements.toLowerCase().includes(q) ||
      (l.adminNotes && l.adminNotes.toLowerCase().includes(q));

    return matchesStatus && matchesCategory && matchesQuery;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <h2 className="text-xl font-bold text-[#202124] flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-[#30343B]" />
            Lead Management & Client Pipeline CRM
          </h2>
          <p className="text-xs text-[#777777] mt-1">
            Track inquiries, update qualification stages (New, Contacted, Interested, Converted), and export CRM records.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#777777]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#30343B] hover:bg-[#202124] text-white text-xs font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Manual Lead</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-[#777777]" />
          <input
            type="text"
            placeholder="Search leads by name, email, phone number, requirements, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] placeholder-[#777777] text-xs focus:outline-none focus:bg-white focus:border-[#30343B]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#777777]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#30343B]"
          >
            <option value="all">All Stages</option>
            <option value="new">Stage: New</option>
            <option value="contacted">Stage: Contacted</option>
            <option value="interested">Stage: Interested</option>
            <option value="converted">Stage: Converted</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#30343B]"
          >
            <option value="all">All Categories</option>
            <option value="services">Services</option>
            <option value="training">Training</option>
            <option value="internships">Internships</option>
            <option value="consulting">Consulting</option>
            <option value="partnerships">Partnerships</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="rounded-2xl bg-white border border-[#E5E7EB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F3F4F6] text-[#777777] border-b border-[#E5E7EB] font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Visitor / Client</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Stage / Status</th>
                <th className="py-3 px-4">Requirements</th>
                <th className="py-3 px-4">Admin Notes & Value</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#777777]">
                    Loading CRM inquiries...
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#777777]">
                    No leads matching your current criteria.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[#F3F4F6]/60 transition-colors">
                    
                    {/* Visitor */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#202124] text-xs">{lead.name}</div>
                      <div className="text-[10px] text-[#777777] flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(lead.timestamp).toLocaleDateString()}
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="py-3.5 px-4 space-y-1">
                      {lead.email && (
                        <a
                          href={`mailto:${lead.email}`}
                          className="flex items-center gap-1 text-[#202124] hover:text-[#30343B] hover:underline transition-colors"
                        >
                          <Mail className="w-3 h-3 text-[#777777]" />
                          <span className="truncate max-w-[150px]">{lead.email}</span>
                        </a>
                      )}
                      {lead.phone && (
                        <a
                          href={`tel:${lead.phone}`}
                          className="flex items-center gap-1 text-[#202124] hover:text-[#30343B] hover:underline transition-colors"
                        >
                          <Phone className="w-3 h-3 text-[#777777]" />
                          <span>{lead.phone}</span>
                        </a>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F3F4F6] border border-[#E5E7EB] text-[#30343B]">
                        {lead.category}
                      </span>
                    </td>

                    {/* Stage / Status Selector */}
                    <td className="py-3.5 px-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleUpdateStatus(lead.id, e.target.value as LeadStatus)}
                        className={`text-[11px] font-semibold rounded-lg px-2 py-1 border transition-colors focus:outline-none ${
                          lead.status === 'New'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : lead.status === 'Contacted'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : lead.status === 'Interested'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        <option value="New" className="bg-white text-[#202124]">New</option>
                        <option value="Contacted" className="bg-white text-[#202124]">Contacted</option>
                        <option value="Interested" className="bg-white text-[#202124]">Interested</option>
                        <option value="Converted" className="bg-white text-[#202124]">Converted</option>
                      </select>
                    </td>

                    {/* Requirements */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-[#202124] line-clamp-2 text-[11px]" title={lead.requirements}>
                        {lead.requirements}
                      </p>
                    </td>

                    {/* Admin Notes & Estimated Value */}
                    <td className="py-3.5 px-4 max-w-xs">
                      {editingNotesId === lead.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={tempNotes}
                            onChange={(e) => setTempNotes(e.target.value)}
                            className="px-2 py-1 bg-white border border-[#E5E7EB] rounded text-xs text-[#202124] flex-1"
                          />
                          <button
                            onClick={() => handleSaveNotes(lead.id)}
                            className="p-1 rounded bg-[#30343B] text-white"
                          >
                            <Save className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setEditingNotesId(null)}
                            className="p-1 rounded text-[#777777] hover:text-[#202124]"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setEditingNotesId(lead.id);
                            setTempNotes(lead.adminNotes || '');
                          }}
                          className="cursor-pointer group flex items-start justify-between gap-1"
                          title="Click to edit notes"
                        >
                          <div className="space-y-0.5">
                            <p className="text-[11px] text-[#777777] italic line-clamp-1">
                              {lead.adminNotes || '+ Add note...'}
                            </p>
                            {lead.estimatedValue && (
                              <span className="text-[10px] font-mono text-emerald-700 font-bold">
                                Est: {lead.estimatedValue}
                              </span>
                            )}
                          </div>
                          <Edit2 className="w-3 h-3 text-[#777777] group-hover:text-[#202124] shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteLead(lead.id, lead.name)}
                        className="p-1.5 rounded-lg text-[#777777] hover:text-red-700 hover:bg-red-50 transition-colors"
                        title="Delete Lead"
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
      </div>

      {/* Manual Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl p-6 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] mb-4">
              <h3 className="text-base font-bold text-[#202124] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#30343B]" />
                Register New Customer Inquiry / Lead
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[#777777] hover:text-[#202124]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddManualLead} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-[#202124] uppercase mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newLeadForm.name}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                  placeholder="e.g. Arif Rahman"
                  className="w-full px-3 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#202124] uppercase mb-1">Email</label>
                  <input
                    type="email"
                    value={newLeadForm.email}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                    placeholder="arif@org.com"
                    className="w-full px-3 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#202124] uppercase mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newLeadForm.phone}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                    placeholder="+880 1711-..."
                    className="w-full px-3 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#202124] uppercase mb-1">Category</label>
                  <select
                    value={newLeadForm.category}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                  >
                    <option value="Services">Services</option>
                    <option value="Training">Training</option>
                    <option value="Internships">Internships</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Partnerships">Partnerships</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#202124] uppercase mb-1">Initial Status</label>
                  <select
                    value={newLeadForm.status}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, status: e.target.value as LeadStatus })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Interested">Interested</option>
                    <option value="Converted">Converted</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#202124] uppercase mb-1">Requirements / Message</label>
                <textarea
                  rows={3}
                  value={newLeadForm.requirements}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, requirements: e.target.value })}
                  placeholder="Project scope, training interest, or timeline..."
                  className="w-full px-3 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#202124] uppercase mb-1">Estimated Value</label>
                  <input
                    type="text"
                    value={newLeadForm.estimatedValue}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, estimatedValue: e.target.value })}
                    placeholder="e.g. $5,000"
                    className="w-full px-3 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#202124] uppercase mb-1">Internal Notes</label>
                  <input
                    type="text"
                    value={newLeadForm.adminNotes}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, adminNotes: e.target.value })}
                    placeholder="Referral from conference..."
                    className="w-full px-3 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#202124] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#30343B] hover:bg-[#202124] text-white font-semibold"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
