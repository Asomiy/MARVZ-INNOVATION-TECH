import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  FileCode,
  File,
  CheckCircle2,
  Trash2,
  Eye,
  Plus,
  RefreshCw,
  Sparkles,
  X,
  Layers,
  AlertCircle
} from 'lucide-react';
import { IngestedDocument } from '../../types/admin';

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
      const res = await fetch('/api/admin/documents');
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
      const res = await fetch('/api/admin/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      const res = await fetch(`/api/admin/documents/${id}`, { method: 'DELETE' });
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-500" />
            Document Processing & Knowledge Ingestion
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Upload PDF, DOCX, and TXT company brochures, syllabi, or policies. Text is indexed directly into the AI prompt.
          </p>
        </div>

        <button
          onClick={fetchDocuments}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 self-start sm:self-auto"
          title="Refresh List"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {uploadNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{uploadNotice}</span>
          </div>
          <button onClick={() => setUploadNotice(null)} className="text-emerald-400 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Upload Zone & Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 5 Cols: File Selector / Text Paster */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#080d1a] border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Upload className="w-4 h-4 text-red-500" />
            Ingest Document or Raw Specifications
          </h3>

          <form onSubmit={handleIngestDocument} className="space-y-3.5 text-xs">
            
            {/* File Drag / Select Box */}
            <label className="border-2 border-dashed border-slate-700 hover:border-red-500/60 rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-900/40 group">
              <Upload className="w-7 h-7 text-slate-500 group-hover:text-red-400 mb-2 transition-colors" />
              <span className="font-semibold text-slate-200">
                Click to browse PDF, DOCX, or TXT
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5">
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
                <label className="block font-semibold text-slate-300 uppercase mb-1">
                  Document Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Drone_Academy_2026.pdf"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase mb-1">
                  Format Type
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  <option value="pdf">PDF Document (.pdf)</option>
                  <option value="docx">Word Document (.docx)</option>
                  <option value="txt">Plain Text / Policy (.txt)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 uppercase mb-1">
                Domain Category
              </label>
              <select
                value={docCategory}
                onChange={(e) => setDocCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
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
              <label className="block font-semibold text-slate-300 uppercase mb-1">
                Document Content / Text Extract *
              </label>
              <textarea
                rows={6}
                required
                placeholder="Paste the document text, curriculum outline, or policies here..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 font-mono text-[11px] leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={!docName.trim() || !rawText.trim() || isUploading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold shadow-md disabled:opacity-40 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isUploading ? 'Indexing Document...' : 'Index Document to AI Knowledge Base'}</span>
            </button>
          </form>
        </div>

        {/* Right 7 Cols: Active Ingested Documents List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Currently Indexed Documents in AI Prompt ({documents.length})
            </h3>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
              Active in Gemini System Prompt
            </span>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="p-12 text-center text-xs text-slate-500">Loading ingested files...</div>
            ) : documents.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-[#080d1a] border border-slate-800 text-slate-500 text-xs">
                No documents currently indexed. Use the left panel to upload or paste document text.
              </div>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-2xl bg-[#080d1a] border border-slate-800 hover:border-slate-700 transition-all flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 text-red-400 font-bold font-mono text-xs">
                      {doc.fileType.toUpperCase()}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-bold text-white">{doc.name}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                          {doc.category}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Indexed
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {doc.extractedText}
                      </p>

                      <div className="text-[10px] text-slate-500 font-mono pt-1">
                        Size: {doc.fileSize} • {doc.chunkCount} knowledge chunks • {new Date(doc.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 flex items-center gap-1.5 pt-1">
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="Preview Extracted Text"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id, doc.name)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-red-600/80 text-slate-300 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#090f1f] border border-red-500/40 rounded-2xl shadow-2xl p-6 flex flex-col max-h-[85vh] overflow-hidden text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-500" />
                  {previewDoc.name}
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">
                  {previewDoc.category} • {previewDoc.fileSize}
                </span>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">
              {previewDoc.extractedText}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Included automatically in live AI system prompt context</span>
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-white"
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
