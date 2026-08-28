import React from 'react';

interface HelpCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpCenterModal: React.FC<HelpCenterModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-[#c6c6cd] w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-[#c6c6cd]/60 flex items-center justify-between bg-[#f8f9ff]">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#0051d5] text-[22px]">help</span>
            <div>
              <h3 className="text-base font-bold text-[#0b1c30]">Corroborate User Guide &amp; Methodology</h3>
              <p className="text-xs text-[#45464d]">Learn how citations, verification tags, and conflict detection operate.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#45464d] hover:text-[#0b1c30] hover:bg-[#eff4ff] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          <div>
            <h4 className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#0051d5]">verified</span>
              1. Grounded Verification Principle
            </h4>
            <p className="text-xs text-[#45464d] leading-relaxed">
              Corroborate never generates claims without anchoring them to specific paragraphs or tables in your ingested documents. Every factual statement is paired with an inline citation tag like <span className="bg-[#DBEAFE] text-[#003ea8] px-1 py-0.2 rounded font-mono-data">[Doc A: §4.2]</span>.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#BE123C]">warning</span>
              2. Automated Contradiction Detection
            </h4>
            <p className="text-xs text-[#45464d] leading-relaxed">
              When multiple documents express conflicting terms (e.g. 30-day cure period vs immediate forfeiture, or $14.2M vs $16.8M revenue), Corroborate highlights both statements side-by-side in the Conflict Inspector with discrepancy highlights.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#0051d5]">keyboard</span>
              3. Keyboard Shortcuts
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono-data text-[#45464d] mt-2">
              <div className="p-2 bg-[#f8f9ff] border border-[#c6c6cd]/50 rounded flex justify-between">
                <span>Send Query</span>
                <kbd className="bg-white px-1.5 py-0.5 rounded border border-[#c6c6cd] text-[#0b1c30]">Enter</kbd>
              </div>
              <div className="p-2 bg-[#f8f9ff] border border-[#c6c6cd]/50 rounded flex justify-between">
                <span>New Line</span>
                <kbd className="bg-white px-1.5 py-0.5 rounded border border-[#c6c6cd] text-[#0b1c30]">Shift+Enter</kbd>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-[#c6c6cd]/60 bg-[#f8f9ff] flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#0b1c30] text-white px-4 py-1.5 rounded text-xs font-medium hover:bg-[#1f2d42]"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
