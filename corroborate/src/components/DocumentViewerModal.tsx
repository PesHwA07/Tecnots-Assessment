import React, { useState } from 'react';
import { DocumentItem } from '../types';

interface DocumentViewerModalProps {
  document: DocumentItem | null;
  highlightPhrase?: string;
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  document,
  highlightPhrase = '',
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState(highlightPhrase);

  if (!document) return null;

  const renderContentWithHighlights = (content: string, term: string) => {
    if (!term || !term.trim()) {
      return content;
    }
    const regex = new RegExp(`(${term.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    const parts = content.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-[#ffdad6] text-[#93000a] px-1 py-0.5 rounded font-semibold border border-[#93000a]/20">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-[#c6c6cd] w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#c6c6cd]/60 flex items-center justify-between bg-[#f8f9ff]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#e5eeff] text-[#0051d5] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">description</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0b1c30]">{document.name}</h3>
              <p className="text-[11px] font-mono-data text-[#76777d]">
                {document.size} • Uploaded {document.uploadDate} • Status: {document.status}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#76777d] text-[16px]">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Find in document..."
                className="pl-8 pr-3 py-1 bg-white border border-[#c6c6cd] rounded text-xs text-[#0b1c30] w-48 focus:outline-none focus:border-[#0051d5]"
              />
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-[#45464d] hover:text-[#0b1c30] hover:bg-[#eff4ff] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Content viewer body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#fdfefe]">
          {document.sections && document.sections.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="text-[11px] font-mono-data text-[#76777d] self-center">Anchored Sections:</span>
              {document.sections.map((sec) => (
                <span
                  key={sec.id}
                  className="bg-[#eff4ff] text-[#0051d5] px-2 py-0.5 rounded text-[11px] font-mono-data border border-[#c6c6cd]/50"
                >
                  {sec.pageOrLine}
                </span>
              ))}
            </div>
          )}

          <div className="font-mono-data text-xs text-[#0b1c30] bg-[#f8f9ff] border border-[#c6c6cd]/60 rounded-lg p-6 whitespace-pre-wrap leading-relaxed">
            {renderContentWithHighlights(document.content, searchTerm)}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#c6c6cd]/60 bg-[#f8f9ff] flex items-center justify-between text-xs text-[#45464d]">
          <div className="font-mono-data">Encoding: UTF-8 / OCR Engine: Corroborate-Vision-v2</div>
          <button
            onClick={onClose}
            className="bg-[#0b1c30] text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-[#1f2d42]"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
