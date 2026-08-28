import React, { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportSession: (format: 'json' | 'md') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onExportSession,
}) => {
  const [model, setModel] = useState('gemini-3.7-flash');
  const [strictness, setStrictness] = useState('90');
  const [ocrQuality, setOcrQuality] = useState('high');
  const [autoHighlight, setAutoHighlight] = useState(true);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = (format: 'json' | 'md') => {
    onExportSession(format);
    setExportNotice(`Exported research session as .${format}`);
    setTimeout(() => setExportNotice(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-[#c6c6cd] w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#c6c6cd]/60 flex items-center justify-between bg-[#f8f9ff]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#e5eeff] text-[#0051d5] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0b1c30]">Workspace &amp; Verification Settings</h3>
              <p className="text-xs text-[#45464d]">Configure LLM models, contradiction thresholds, and export reports.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#45464d] hover:text-[#0b1c30] hover:bg-[#eff4ff] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Model Selection */}
          <div>
            <label className="block text-xs font-bold text-[#0b1c30] uppercase tracking-wider mb-1.5">
              Reasoning &amp; Verification Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-[#f8f9ff] border border-[#c6c6cd] rounded-lg px-3 py-2 text-xs text-[#0b1c30] focus:outline-none focus:border-[#0051d5]"
            >
              <option value="gemini-3.7-flash">Gemini 3.7 Flash (Default - Ultra-fast citation cross-checking)</option>
              <option value="gemini-3.1-pro">Gemini 3.1 Pro (Deep legal analysis &amp; multi-page cross-tabulation)</option>
            </select>
          </div>

          {/* Strictness Slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider">
                Contradiction Detection Strictness
              </label>
              <span className="font-mono-data text-xs text-[#0051d5] font-semibold">{strictness}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              value={strictness}
              onChange={(e) => setStrictness(e.target.value)}
              className="w-full accent-[#0051d5]"
            />
            <p className="text-[11px] text-[#45464d] mt-1">
              Higher values require exact numerical, temporal, or clause-level parity to flag conflicts.
            </p>
          </div>

          {/* OCR Engine */}
          <div>
            <label className="block text-xs font-bold text-[#0b1c30] uppercase tracking-wider mb-1.5">
              Document Ingestion &amp; OCR Engine
            </label>
            <select
              value={ocrQuality}
              onChange={(e) => setOcrQuality(e.target.value)}
              className="w-full bg-[#f8f9ff] border border-[#c6c6cd] rounded-lg px-3 py-2 text-xs text-[#0b1c30] focus:outline-none focus:border-[#0051d5]"
            >
              <option value="high">High Fidelity (Multi-column table parsing + vector font extraction)</option>
              <option value="fast">Fast Ingestion (Standard plain text + basic tables)</option>
            </select>
          </div>

          {/* Toggles */}
          <div className="pt-2 border-t border-[#c6c6cd]/50 space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="text-xs font-semibold text-[#0b1c30]">Auto-Highlight Conflicting Phrases</div>
                <div className="text-[11px] text-[#45464d]">Visually highlight discrepant numbers in red across source cards.</div>
              </div>
              <input
                type="checkbox"
                checked={autoHighlight}
                onChange={(e) => setAutoHighlight(e.target.checked)}
                className="rounded border-[#c6c6cd] text-[#0051d5] focus:ring-0"
              />
            </label>
          </div>

          {/* Export Options */}
          <div className="pt-4 border-t border-[#c6c6cd]/50">
            <label className="block text-xs font-bold text-[#0b1c30] uppercase tracking-wider mb-2">
              Export Audit Findings
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleExport('md')}
                className="flex-1 bg-[#f8f9ff] border border-[#c6c6cd] hover:border-[#0051d5] py-2 px-3 rounded text-xs font-medium text-[#0b1c30] flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">markdown</span>
                Export Markdown (.md)
              </button>
              <button
                type="button"
                onClick={() => handleExport('json')}
                className="flex-1 bg-[#f8f9ff] border border-[#c6c6cd] hover:border-[#0051d5] py-2 px-3 rounded text-xs font-medium text-[#0b1c30] flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">data_object</span>
                Export JSON Report
              </button>
            </div>
            {exportNotice && (
              <div className="mt-2 text-xs text-[#059669] font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check</span>
                {exportNotice}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#c6c6cd]/60 bg-[#f8f9ff] flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#0b1c30] text-white px-4 py-1.5 rounded text-xs font-medium hover:bg-[#1f2d42]"
          >
            Save &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
