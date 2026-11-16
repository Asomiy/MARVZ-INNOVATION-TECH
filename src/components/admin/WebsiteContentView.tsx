import React, { useState, useEffect } from 'react';
import {
  Globe,
  Save,
  Upload,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Image as ImageIcon,
  Sparkles,
  Layers,
  Megaphone,
  Info,
  X,
  Copy,
  Loader2,
} from 'lucide-react';
import { WebsiteContentConfig, WebsiteServiceItem } from '../../types/admin';
import { adminFetch } from '../../utils/adminApi';

interface WebsiteContentViewProps {
  onContentUpdated?: () => void;
}

export const WebsiteContentView: React.FC<WebsiteContentViewProps> = ({ onContentUpdated }) => {
  const [content, setContent] = useState<WebsiteContentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'hero' | 'services' | 'media'>('hero');
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Service Modal State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<WebsiteServiceItem | null>(null);
  const [serviceForm, setServiceForm] = useState({
    title: '',
    tagline: '',
    description: '',
    imageUrl: '',
    altText: '',
    keyTopics: '',
    applications: '',
  });

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/content');
      if (res.ok) {
        const data = await res.json();
        setContent(data.content);
      }
    } catch (err) {
      console.error('Failed to fetch website content:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const showNotice = (type: 'success' | 'error', text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 4500);
  };

  const handleSaveContent = async (updatedContent?: WebsiteContentConfig) => {
    const payload = updatedContent || content;
    if (!payload || saving) return;

    setSaving(true);
    try {
      const res = await adminFetch('/api/admin/content', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save website content.');
      const data = await res.json();
      setContent(data.content);
      showNotice('success', 'Website content updated and synchronized to public pages!');
      if (onContentUpdated) onContentUpdated();
    } catch (err: any) {
      showNotice('error', err.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetField?: 'heroImageUrl' | 'heroSecondaryImageUrl' | 'aboutImageUrl' | 'serviceForm'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      showNotice('error', 'Image file must be smaller than 8 MB.');
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = typeof reader.result === 'string' ? reader.result : '';
        const res = await adminFetch('/api/admin/upload', {
          method: 'POST',
          body: JSON.stringify({
            fileName: file.name,
            mimeType: file.type || 'image/jpeg',
            base64Data,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed.');

        const uploadedUrl: string = data.url;
        if (targetField === 'serviceForm') {
          setServiceForm((prev) => ({ ...prev, imageUrl: uploadedUrl }));
          showNotice('success', `Uploaded ${file.name} and attached to service card.`);
        } else if (content && targetField) {
          const updated: WebsiteContentConfig = {
            ...content,
            [targetField]: uploadedUrl,
            uploadedAssets: [data.asset, ...(content.uploadedAssets || [])],
          };
          setContent(updated);
          await handleSaveContent(updated);
        } else if (content) {
          setContent({
            ...content,
            uploadedAssets: [data.asset, ...(content.uploadedAssets || [])],
          });
          showNotice('success', `Uploaded "${file.name}" to Media Library.`);
        }
      } catch (err: any) {
        showNotice('error', err.message || 'Image upload failed.');
      } finally {
        setUploading(false);
        e.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const openAddServiceModal = () => {
    setEditingService(null);
    setServiceForm({
      title: '',
      tagline: '',
      description: '',
      imageUrl: '/assets/tech/hero-ai-lab.jpg',
      altText: '',
      keyTopics: '',
      applications: '',
    });
    setIsServiceModalOpen(true);
  };

  const openEditServiceModal = (svc: WebsiteServiceItem) => {
    setEditingService(svc);
    setServiceForm({
      title: svc.title,
      tagline: svc.tagline,
      description: svc.description,
      imageUrl: svc.imageUrl,
      altText: svc.altText,
      keyTopics: svc.keyTopics.join(', '),
      applications: svc.applications.join(', '),
    });
    setIsServiceModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content || !serviceForm.title.trim()) return;

    const item: WebsiteServiceItem = {
      id: editingService ? editingService.id : `svc-${Date.now()}`,
      title: serviceForm.title.trim(),
      tagline: serviceForm.tagline.trim(),
      description: serviceForm.description.trim(),
      imageUrl: serviceForm.imageUrl.trim(),
      altText: serviceForm.altText.trim() || serviceForm.title.trim(),
      keyTopics: serviceForm.keyTopics
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      applications: serviceForm.applications
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };

    const nextServices = editingService
      ? content.services.map((s) => (s.id === editingService.id ? item : s))
      : [...content.services, item];

    const updated = { ...content, services: nextServices };
    setContent(updated);
    setIsServiceModalOpen(false);
    await handleSaveContent(updated);
  };

  const handleDeleteService = async (id: string, title: string) => {
    if (!content) return;
    if (!confirm(`Remove "${title}" from Core Technology Divisions?`)) return;
    const updated = {
      ...content,
      services: content.services.filter((s) => s.id !== id),
    };
    setContent(updated);
    await handleSaveContent(updated);
  };

  if (loading || !content) {
    return (
      <div className="py-16 text-center text-xs text-[#777777] font-mono">
        Loading Website Content CMS...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <h2 className="text-xl font-bold text-[#202124] flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#30343B]" />
            Website Content Management (CMS)
          </h2>
          <p className="text-xs text-[#777777] mt-1">
            Edit homepage hero copy, announcement banner, About text, technology service divisions, and uploaded media assets.
          </p>
        </div>

        <button
          onClick={() => handleSaveContent()}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#30343B] hover:bg-[#202124] text-white text-xs font-semibold disabled:opacity-50 transition-colors self-start sm:self-auto"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Publishing...' : 'Publish Website Changes'}</span>
        </button>
      </div>

      {notice && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            notice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notice.text}</span>
          </div>
          <button onClick={() => setNotice(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3 text-xs overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab('hero')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold transition-colors ${
            activeSubTab === 'hero'
              ? 'bg-[#30343B] text-white'
              : 'bg-white border border-[#E5E7EB] text-[#777777] hover:text-[#202124]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Hero, Banner & About</span>
        </button>
        <button
          onClick={() => setActiveSubTab('services')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold transition-colors ${
            activeSubTab === 'services'
              ? 'bg-[#30343B] text-white'
              : 'bg-white border border-[#E5E7EB] text-[#777777] hover:text-[#202124]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Technology Divisions ({content.services.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('media')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold transition-colors ${
            activeSubTab === 'media'
              ? 'bg-[#30343B] text-white'
              : 'bg-white border border-[#E5E7EB] text-[#777777] hover:text-[#202124]'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Media Uploads ({content.uploadedAssets?.length || 0})</span>
        </button>
      </div>

      {/* Tab 1: Hero, Announcement Banner & About */}
      {activeSubTab === 'hero' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          {/* Announcement & Hero Copy */}
          <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#202124] flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-[#30343B]" />
              Homepage Hero & Announcement Banner
            </h3>

            <div className="p-3.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] space-y-2.5">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-semibold text-[#202124]">Show Top Announcement Banner</span>
                <input
                  type="checkbox"
                  checked={content.announcementEnabled}
                  onChange={(e) => setContent({ ...content, announcementEnabled: e.target.checked })}
                  className="w-4 h-4 rounded accent-[#30343B]"
                />
              </label>
              <input
                type="text"
                value={content.announcementText}
                onChange={(e) => setContent({ ...content, announcementText: e.target.value })}
                placeholder="Announcement text shown above homepage hero..."
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#E5E7EB] text-[#202124] focus:outline-none focus:border-[#30343B]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#202124] uppercase mb-1">Hero Headline</label>
                <input
                  type="text"
                  value={content.heroHeadline}
                  onChange={(e) => setContent({ ...content, heroHeadline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#202124] uppercase mb-1">Hero Accent Highlight</label>
                <input
                  type="text"
                  value={content.heroHighlight}
                  onChange={(e) => setContent({ ...content, heroHighlight: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#202124] uppercase mb-1">Startup Tagline</label>
              <input
                type="text"
                value={content.heroTagline}
                onChange={(e) => setContent({ ...content, heroTagline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#202124] uppercase mb-1">Hero Description</label>
              <textarea
                rows={4}
                value={content.heroDescription}
                onChange={(e) => setContent({ ...content, heroDescription: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] leading-relaxed focus:outline-none focus:bg-white focus:border-[#30343B]"
              />
            </div>

            <div className="space-y-3 pt-2 border-t border-[#E5E7EB]">
              <div>
                <label className="block font-semibold text-[#202124] uppercase mb-1">Primary Hero Image URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={content.heroImageUrl}
                    onChange={(e) => setContent({ ...content, heroImageUrl: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] font-mono text-[11px] focus:outline-none focus:bg-white focus:border-[#30343B]"
                  />
                  <label className="px-3 py-2 rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E5E7EB] text-[#202124] cursor-pointer flex items-center gap-1.5 shrink-0 font-medium">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'heroImageUrl')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#202124] uppercase mb-1">Secondary Hero Thumbnail URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={content.heroSecondaryImageUrl}
                    onChange={(e) => setContent({ ...content, heroSecondaryImageUrl: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] font-mono text-[11px] focus:outline-none focus:bg-white focus:border-[#30343B]"
                  />
                  <label className="px-3 py-2 rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E5E7EB] text-[#202124] cursor-pointer flex items-center gap-1.5 shrink-0 font-medium">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'heroSecondaryImageUrl')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* About Section & Live Visual Preview */}
          <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#202124] flex items-center gap-2">
              <Info className="w-4 h-4 text-[#30343B]" />
              "Who We Are" About Section
            </h3>

            <div>
              <label className="block font-semibold text-[#202124] uppercase mb-1">About Heading</label>
              <input
                type="text"
                value={content.aboutHeading}
                onChange={(e) => setContent({ ...content, aboutHeading: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#202124] uppercase mb-1">About Subheading</label>
              <input
                type="text"
                value={content.aboutSubheading}
                onChange={(e) => setContent({ ...content, aboutSubheading: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#202124] uppercase mb-1">Startup Mission & Identity Narrative</label>
              <textarea
                rows={4}
                value={content.aboutDescription}
                onChange={(e) => setContent({ ...content, aboutDescription: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] leading-relaxed focus:outline-none focus:bg-white focus:border-[#30343B]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#202124] uppercase mb-1">About Showcase Photo URL</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={content.aboutImageUrl}
                  onChange={(e) => setContent({ ...content, aboutImageUrl: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] font-mono text-[11px] focus:outline-none focus:bg-white focus:border-[#30343B]"
                />
                <label className="px-3 py-2 rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E5E7EB] text-[#202124] cursor-pointer flex items-center gap-1.5 shrink-0 font-medium">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'aboutImageUrl')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="pt-2">
              <div className="text-[11px] font-mono text-[#777777] uppercase mb-2">Hero & About Media Preview</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl overflow-hidden border border-[#E5E7EB] bg-[#F3F4F6] h-28 relative">
                  <img
                    src={content.heroImageUrl}
                    alt="Hero preview"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1.5 left-1.5 text-[10px] font-mono px-2 py-0.5 rounded bg-white/90 text-[#202124] border border-[#E5E7EB]">
                    Hero Visual
                  </span>
                </div>
                <div className="rounded-xl overflow-hidden border border-[#E5E7EB] bg-[#F3F4F6] h-28 relative">
                  <img
                    src={content.aboutImageUrl}
                    alt="About preview"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1.5 left-1.5 text-[10px] font-mono px-2 py-0.5 rounded bg-white/90 text-[#202124] border border-[#E5E7EB]">
                    About Lab Photo
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Services / Core Technology Divisions */}
      {activeSubTab === 'services' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#777777]">
              Add, edit, or reorder core technology cards displayed in the "Explore Our Technology" section.
            </p>
            <button
              onClick={openAddServiceModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#30343B] hover:bg-[#202124] text-white text-xs font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Technology Division</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {content.services.map((svc) => (
              <div
                key={svc.id}
                className="rounded-2xl bg-white border border-[#E5E7EB] shadow-xs overflow-hidden flex flex-col justify-between hover:border-[#30343B]/30 transition-colors"
              >
                <div>
                  <div className="h-36 bg-[#F3F4F6] relative overflow-hidden">
                    <img
                      src={svc.imageUrl}
                      alt={svc.altText}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2.5 left-2.5 text-[10px] font-mono px-2 py-0.5 rounded bg-white/95 text-[#202124] border border-[#E5E7EB]">
                      {svc.id}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <h4 className="text-sm font-bold text-[#202124]">{svc.title}</h4>
                    <p className="text-[11px] font-medium text-[#30343B]">{svc.tagline}</p>
                    <p className="text-xs text-[#777777] line-clamp-3 leading-relaxed">{svc.description}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {svc.keyTopics.slice(0, 3).map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F3F4F6] border border-[#E5E7EB] text-[#777777]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 border-t border-[#E5E7EB] flex items-center justify-end gap-2 bg-[#F3F4F6]">
                  <button
                    onClick={() => openEditServiceModal(svc)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white hover:bg-[#E5E7EB] border border-[#E5E7EB] text-xs text-[#202124] font-semibold transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteService(svc.id, svc.title)}
                    className="p-1.5 rounded-lg bg-white hover:bg-red-50 border border-[#E5E7EB] text-[#777777] hover:text-red-700 hover:border-red-200 transition-colors"
                    title="Delete Division"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Media Assets Upload & Gallery */}
      {activeSubTab === 'media' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-[#202124]">Server Media Upload Gallery</h3>
              <p className="text-xs text-[#777777] mt-1">
                Upload PNG, JPG, or WEBP photography stored securely on the server for Hero banners, About sections, and Services.
              </p>
            </div>
            <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#30343B] hover:bg-[#202124] text-white text-xs font-semibold cursor-pointer shrink-0 transition-colors">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              <span>{uploading ? 'Uploading...' : 'Upload New Image'}</span>
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e)} className="hidden" />
            </label>
          </div>

          {!content.uploadedAssets || content.uploadedAssets.length === 0 ? (
            <div className="py-16 text-center rounded-2xl bg-white border border-[#E5E7EB] text-[#777777] text-xs">
              <ImageIcon className="w-8 h-8 mx-auto text-[#777777] mb-2" />
              No uploaded media assets yet. Use the upload button above to store custom imagery.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {content.uploadedAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="rounded-xl bg-white border border-[#E5E7EB] overflow-hidden flex flex-col shadow-xs"
                >
                  <div className="h-32 bg-[#F3F4F6]">
                    <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3 space-y-2 text-xs flex-1 flex flex-col justify-between">
                    <div>
                      <div className="font-bold text-[#202124] truncate">{asset.name}</div>
                      <div className="text-[10px] font-mono text-[#777777]">
                        {asset.size} • {new Date(asset.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(asset.url);
                        showNotice('success', `Copied URL "${asset.url}" to clipboard.`);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E5E7EB] text-[#202124] text-[11px] font-semibold transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy Asset URL</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Service Modal */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F3F4F6]">
              <h3 className="text-base font-bold text-[#202124]">
                {editingService ? `Edit ${editingService.title}` : 'Add Core Technology Division'}
              </h3>
              <button onClick={() => setIsServiceModalOpen(false)} className="text-[#777777] hover:text-[#202124]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="p-6 space-y-3.5 overflow-y-auto text-xs">
              <div>
                <label className="block font-semibold text-[#202124] uppercase mb-1">Division Title *</label>
                <input
                  type="text"
                  required
                  value={serviceForm.title}
                  onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#202124] uppercase mb-1">Short Tagline *</label>
                <input
                  type="text"
                  required
                  value={serviceForm.tagline}
                  onChange={(e) => setServiceForm({ ...serviceForm, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#202124] uppercase mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#202124] uppercase mb-1">Card Image URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={serviceForm.imageUrl}
                    onChange={(e) => setServiceForm({ ...serviceForm, imageUrl: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] font-mono text-[11px] focus:outline-none focus:bg-white focus:border-[#30343B]"
                  />
                  <label className="px-3 py-2 rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E5E7EB] text-[#202124] cursor-pointer flex items-center gap-1 shrink-0 font-medium">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'serviceForm')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#202124] uppercase mb-1">
                  Key Topics (comma-separated)
                </label>
                <input
                  type="text"
                  value={serviceForm.keyTopics}
                  onChange={(e) => setServiceForm({ ...serviceForm, keyTopics: e.target.value })}
                  placeholder="LLMs, Edge AI, Computer Vision"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#202124] uppercase mb-1">
                  Real-World Applications (comma-separated)
                </label>
                <input
                  type="text"
                  value={serviceForm.applications}
                  onChange={(e) => setServiceForm({ ...serviceForm, applications: e.target.value })}
                  placeholder="Defect Inspection, Predictive Analytics"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                />
              </div>

              <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#202124] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#30343B] hover:bg-[#202124] text-white font-semibold"
                >
                  Save Division
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
