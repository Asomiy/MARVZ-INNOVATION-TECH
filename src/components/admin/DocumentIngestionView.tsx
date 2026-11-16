import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  Trash2,
  Eye,
  RefreshCw,
  Sparkles,
  X,
  Layers,
} from 'lucide-react';
import { IngestedDocument } from '../../types/admin';
import { adminFetch } from '../../utils/adminApi';

interface DocumentIngestionViewProps {
  onKnowledgeUpdated?: () => void;
}

export const DocumentIngestionView: React.FC<DocumentIngestionViewProps> = ({ onKnowledgeUpdated }) => {
  const [documents, setDocuments] = useState<IngestedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<IngestedDocument | null>(null);

  // Form state
  const [docName, setDocName] = useState('');
  const [docCategory, setDocCategory] = useState('Training');
  const [docType, setDocType] = useState<'pdf' | 'docx' | 'txt'>('pdf');
  const [rawText, setRawText] = useState('');
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/documents');
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocName(file.name);
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') setDocType('pdf');
    else if (ext === 'docx' || ext === 'doc') setDocType('docx');
    else setDocType('txt');

    // Read TXT directly, or extract preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setRawText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleIngestDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim() || !rawText.trim() || isUploading) return;

    setIsUploading(true);
    try {
      const res = await adminFetch('/api/admin/documents', {
        method: 'POST',
        body: JSON.stringify({
          name: docName.trim(),
          fileType: docType,
          fileSize: `${Math.round(rawText.length / 1024 * 10) / 10} KB`,
          rawContent: rawText.trim(),
          category: docCategory,
        }),
      });

      if (res.ok) {
        setUploadNotice(`"${docName}" was successfully parsed and indexed into MARVZ AI Knowledge Base!`);
        setDocName('');
        setRawText('');
        fetchDocuments();
        if (onKnowledgeUpdated) onKnowledgeUpdated();
      }
    } catch (err) {
      console.error('Document ingestion failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove "${name}" from indexed knowledge?`)) return;
    try {
      const res = await adminFetch(`/api/admin/documents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        if (onKnowledgeUpdated) onKnowledgeUpdated();
      }
    } catch (err) {
      console.error('Failed to delete doc:', err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <h2 className="text-xl font-bold text-[#202124] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#30343B]" />
            Document Processing & Knowledge Ingestion
          </h2>
          <p className="text-xs text-[#777777] mt-1">
            Upload PDF, DOCX, and TXT company brochures, syllabi, or policies. Text is indexed directly into the AI prompt.
          </p>
        </div>

        <button
          onClick={fetchDocuments}
          className="p-2 rounded-xl bg-white hover:bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] self-start sm:self-auto transition-colors"
          title="Refresh List"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {uploadNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>{uploadNotice}</span>
          </div>
          <button onClick={() => setUploadNotice(null)} className="text-emerald-800 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Upload Zone & Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 5 Cols: File Selector / Text Paster */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#202124] flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#30343B]" />
            Ingest Document or Raw Specifications
          </h3>

          <form onSubmit={handleIngestDocument} className="space-y-3.5 text-xs">
            
            {/* File Drag / Select Box */}
            <label className="border-2 border-dashed border-[#E5E7EB] hover:border-[#30343B] rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-[#F3F4F6] group">
              <Upload className="w-7 h-7 text-[#777777] group-hover:text-[#202124] mb-2 transition-colors" />
              <span className="font-semibold text-[#202124]">
                Click to browse PDF, DOCX, or TXT
              </span>
              <span className="text-[11px] text-[#777777] mt-0.5">
                Supports curriculum PDFs, client whitepapers, rate cards
              </span>
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#202124] uppercase mb-1">
                  Document Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Drone_Academy_2026.pdf"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#202124] uppercase mb-1">
                  Format Type
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
                >
                  <option value="pdf">PDF Document (.pdf)</option>
                  <option value="docx">Word Document (.docx)</option>
                  <option value="txt">Plain Text / Policy (.txt)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#202124] uppercase mb-1">
                Domain Category
              </label>
              <select
                value={docCategory}
                onChange={(e) => setDocCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] focus:outline-none focus:bg-white focus:border-[#30343B]"
              >
                <option value="Training">Training & Bootcamps</option>
                <option value="AI">AI & Machine Learning</option>
                <option value="Drones">Drone Technology & UAV</option>
                <option value="Robotics">Robotics & Industrial Automation</option>
                <option value="Software">Software & Cloud</option>
                <option value="Cybersecurity">Cybersecurity & Defense</option>
                <option value="Internships">Internships & Fellowships</option>
                <option value="Services">Enterprise Services & Pricing</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#202124] uppercase mb-1">
                Document Content / Text Extract *
              </label>
              <textarea
                rows={6}
                required
                placeholder="Paste the document text, curriculum outline, or policies here..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#202124] placeholder-[#777777] font-mono text-[11px] leading-relaxed focus:outline-none focus:bg-white focus:border-[#30343B]"
              />
            </div>

            <button
              type="submit"
              disabled={!docName.trim() || !rawText.trim() || isUploading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#30343B] hover:bg-[#202124] text-white font-semibold disabled:opacity-40 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isUploading ? 'Indexing Document...' : 'Index Document to AI Knowledge Base'}</span>
            </button>
          </form>
        </div>

        {/* Right 7 Cols: Active Ingested Documents List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-sm font-bold text-[#202124] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#30343B]" />
              Currently Indexed Documents in AI Prompt ({documents.length})
            </h3>
            <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              Active in System Prompt
            </span>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="p-12 text-center text-xs text-[#777777]">Loading ingested files...</div>
            ) : documents.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white border border-[#E5E7EB] text-[#777777] text-xs">
                No documents currently indexed. Use the left panel to upload or paste document text.
              </div>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs hover:border-[#30343B]/30 transition-colors flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center shrink-0 text-[#30343B] font-bold font-mono text-xs">
                      {doc.fileType.toUpperCase()}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-bold text-[#202124]">{doc.name}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F3F4F6] text-[#30343B] border border-[#E5E7EB]">
                          {doc.category}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Indexed
                        </span>
                      </div>

                      <p className="text-[11px] text-[#777777] line-clamp-2">
                        {doc.extractedText}
                      </p>

                      <div className="text-[10px] text-[#777777] font-mono pt-1">
                        Size: {doc.fileSize} • {doc.chunkCount} knowledge chunks • {new Date(doc.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 flex items-center gap-1.5 pt-1">
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="p-2 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E5E7EB] text-[#202124] transition-colors"
                      title="Preview Extracted Text"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id, doc.name)}
                      className="p-2 rounded-lg bg-[#F3F4F6] hover:bg-red-50 border border-[#E5E7EB] text-[#777777] hover:text-red-700 hover:border-red-200 transition-colors"
                      title="Remove Document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl p-6 flex flex-col max-h-[85vh] overflow-hidden text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] mb-3">
              <div>
                <h3 className="text-sm font-bold text-[#202124] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#30343B]" />
                  {previewDoc.name}
                </h3>
                <span className="text-[10px] text-[#777777] font-mono">
                  {previewDoc.category} • {previewDoc.fileSize}
                </span>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="text-[#777777] hover:text-[#202124]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] font-mono text-[11px] text-[#202124] whitespace-pre-wrap leading-relaxed">
              {previewDoc.extractedText}
            </div>

            <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-[11px] text-[#777777]">
              <span>Included automatically in live AI system prompt context</span>
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-1.5 rounded-lg bg-[#30343B] hover:bg-[#202124] text-white font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
