import React from 'react';

interface SystemStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemStatusModal: React.FC<SystemStatusModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const services = [
    {
      name: 'Document Ingestion Worker',
      status: 'operational',
      latency: '18ms',
      desc: 'Parses PDF, DOCX, TXT into structured AST and extracts optical tokens.',
    },
    {
      name: 'Cross-Doc Contradiction Engine',
      status: 'operational',
      latency: '42ms',
      desc: 'Dual-vector semantic graph evaluating clause-level discrepancy matrices.',
    },
    {
      name: 'OCR & Layout Vector Pipeline',
      status: 'operational',
      latency: '34ms',
      desc: 'Optical character reconstruction and multi-column table boundary detection.',
    },
    {
      name: 'Gemini 3.7 Reasoning Gateway',
      status: 'operational',
      latency: '120ms',
      desc: 'Direct neural interface providing structured JSON citation outputs.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-[#c6c6cd] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-[#c6c6cd]/60 flex items-center justify-between bg-[#f8f9ff]">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#059669] text-[22px]">check_circle</span>
            <div>
              <h3 className="text-base font-bold text-[#0b1c30]">System Status &amp; Diagnostics</h3>
              <p className="text-xs text-[#45464d]">All verification pipelines operating normally.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#45464d] hover:text-[#0b1c30] hover:bg-[#eff4ff] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {services.map((srv, idx) => (
            <div key={idx} className="p-3 bg-[#f8f9ff] border border-[#c6c6cd]/60 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-[#0b1c30]">{srv.name}</span>
                <span className="bg-[#ecfdf5] text-[#059669] border border-[#059669]/30 text-[10px] font-mono-data font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
                  Operational ({srv.latency})
                </span>
              </div>
              <p className="text-[11px] text-[#45464d]">{srv.desc}</p>
            </div>
          ))}
        </div>

        <div className="px-6 py-3 border-t border-[#c6c6cd]/60 bg-[#f8f9ff] flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#0b1c30] text-white px-4 py-1.5 rounded text-xs font-medium hover:bg-[#1f2d42]"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};
