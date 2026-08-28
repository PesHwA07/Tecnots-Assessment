import React, { useState } from 'react';
import { DocumentItem } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadDocument: (doc: DocumentItem) => void;
  onLoadBundle: (bundleName: string) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadDocument,
  onLoadBundle,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [docName, setDocName] = useState('');
  const [docContent, setDocContent] = useState('');

  if (!isOpen) return null;

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim() || !docContent.trim()) return;

    const newDoc: DocumentItem = {
      id: 'doc-' + Date.now(),
      name: docName.trim().endsWith('.txt') ? docName.trim() : `${docName.trim()}.txt`,
      type: 'txt',
      size: `${(docContent.length / 1024).toFixed(1)} KB`,
      status: 'indexed',
      uploadDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      content: docContent.trim(),
      sections: [
        {
          id: 'sec-1',
          title: 'Section 1 - Ingested Content',
          pageOrLine: 'Section 1.0',
          text: docContent.slice(0, 200),
        },
      ],
    };

    onUploadDocument(newDoc);
    setDocName('');
    setDocContent('');
    onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
        alert(err.detail || 'Upload failed');
        return;
      }

      const data = await res.json();
      const doc = data.document;
      const extension = file.name.split('.').pop()?.toLowerCase() || 'txt';
      const fileType = (['pdf', 'docx', 'txt', 'md', 'csv'].includes(extension) ? extension : 'txt') as any;

      const newDoc: DocumentItem = {
        id: doc.id,
        name: doc.filename,
        type: fileType,
        size: `${doc.chunk_count} chunks`,
        status: 'indexed',
        uploadDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        content: `Ingested: ${doc.chunk_count} chunks indexed.`,
      };

      onUploadDocument(newDoc);
      onClose();
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed. Is the server running?');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-[#c6c6cd] w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#c6c6cd]/60 flex items-center justify-between bg-[#f8f9ff]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e5eeff] text-[#0051d5] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">upload_file</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0b1c30]">Ingest Research Documents</h3>
              <p className="text-xs text-[#45464d]">Add source documents for multi-contract or cross-filing analysis.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#45464d] hover:text-[#0b1c30] hover:bg-[#eff4ff] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Quick Presets / Bundles */}
          <div>
            <label className="block text-xs font-semibold text-[#76777d] uppercase tracking-wider mb-2">
              Preset Research Bundles (1-Click Test Data)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  onLoadBundle('legal');
                  onClose();
                }}
                className="text-left p-3 rounded-lg border border-[#c6c6cd] hover:border-[#0051d5] hover:bg-[#eff4ff]/40 transition-all group"
              >
                <div className="flex items-center gap-2 font-semibold text-xs text-[#0b1c30] group-hover:text-[#0051d5]">
                  <span className="material-symbols-outlined text-[18px] text-[#0051d5]">gavel</span>
                  Legal MSA &amp; SLA Bundle
                </div>
                <p className="text-[11px] text-[#45464d] mt-1">
                  Tests contradictory cure periods and data breach clauses (Acme vs TechFlow).
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  onLoadBundle('financial');
                  onClose();
                }}
                className="text-left p-3 rounded-lg border border-[#c6c6cd] hover:border-[#0051d5] hover:bg-[#eff4ff]/40 transition-all group"
              >
                <div className="flex items-center gap-2 font-semibold text-xs text-[#0b1c30] group-hover:text-[#0051d5]">
                  <span className="material-symbols-outlined text-[18px] text-[#0051d5]">account_balance</span>
                  Financial Q3 Disclosures
                </div>
                <p className="text-[11px] text-[#45464d] mt-1">
                  Tests $2.6M revenue discrepancy between internal audit and shareholder letter.
                </p>
              </button>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#c6c6cd]/60"></div>
            <span className="flex-shrink mx-4 text-xs font-mono-data text-[#76777d]">OR UPLOAD FILE</span>
            <div className="flex-grow border-t border-[#c6c6cd]/60"></div>
          </div>

          {/* File Drag Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              if (e.dataTransfer.files?.[0]) {
                const fakeEvent = { target: { files: e.dataTransfer.files } } as any;
                handleFileUpload(fakeEvent);
              }
            }}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive ? 'border-[#0051d5] bg-[#eff4ff]' : 'border-[#c6c6cd] hover:bg-[#f8f9ff]'
            }`}
          >
            <input
              type="file"
              id="modal-file-upload"
              className="hidden"
              accept=".pdf,.docx,.txt,.md,.csv"
              onChange={handleFileUpload}
            />
            <label htmlFor="modal-file-upload" className="cursor-pointer block">
              <span className="material-symbols-outlined text-3xl text-[#0051d5] mb-2">cloud_upload</span>
              <p className="text-xs font-medium text-[#0b1c30]">Click to browse or drop file here</p>
              <p className="text-[11px] text-[#76777d] mt-1">PDF, DOCX, TXT, Markdown (Max 50MB)</p>
            </label>
          </div>

          {uploading && (
            <div className="bg-[#eff4ff] p-3 rounded-lg border border-[#0051d5]/20 flex items-center gap-3">
              <span className="material-symbols-outlined text-[#0051d5] animate-spin text-[20px]">sync</span>
              <div className="flex-1 text-xs text-[#0051d5]">
                <div className="font-semibold">Extracting vector layout &amp; optical characters...</div>
                <div className="text-[11px] text-[#45464d] mt-0.5">Indexing semantic embeddings into workspace index.</div>
              </div>
            </div>
          )}

          {/* Paste Raw Text Tab */}
          <details className="group">
            <summary className="text-xs font-semibold text-[#0051d5] cursor-pointer hover:underline list-none flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] transition-transform group-open:rotate-90">
                chevron_right
              </span>
              Paste raw document text directly
            </summary>
            <form onSubmit={handleManualAdd} className="mt-3 space-y-3 p-3 bg-[#f8f9ff] rounded-lg border border-[#c6c6cd]/60">
              <div>
                <label className="block text-xs font-medium text-[#0b1c30] mb-1">Document Title</label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. Schedule_B_Exhibit.txt"
                  className="w-full bg-white border border-[#c6c6cd] rounded px-3 py-1.5 text-xs text-[#0b1c30] focus:outline-none focus:border-[#0051d5]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#0b1c30] mb-1">Document Content</label>
                <textarea
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  placeholder="Paste legal clauses, financial numbers, or audit paragraphs..."
                  rows={4}
                  className="w-full bg-white border border-[#c6c6cd] rounded p-3 text-xs text-[#0b1c30] focus:outline-none focus:border-[#0051d5] font-mono-data"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!docName.trim() || !docContent.trim()}
                  className="bg-[#0b1c30] text-white text-xs px-3.5 py-1.5 rounded font-medium hover:bg-[#1f2d42] disabled:opacity-40"
                >
                  Save &amp; Index Document
                </button>
              </div>
            </form>
          </details>
        </div>
      </div>
    </div>
  );
};
