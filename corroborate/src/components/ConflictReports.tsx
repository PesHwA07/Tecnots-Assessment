import React, { useState } from 'react';
import { ConflictItem, DocumentItem } from '../types';

interface ConflictReportsProps {
  conflicts: ConflictItem[];
  documents: DocumentItem[];
  selectedConflictId?: string;
  onSelectConflict: (id: string) => void;
  onOpenDocumentViewer: (docName: string, highlight?: string) => void;
  onRunFollowUp: (prompt: string) => void;
}

export const ConflictReports: React.FC<ConflictReportsProps> = ({
  conflicts,
  documents,
  selectedConflictId,
  onSelectConflict,
  onOpenDocumentViewer,
  onRunFollowUp,
}) => {
  const [followUpQuery, setFollowUpQuery] = useState('');
  const [activeCitation, setActiveCitation] = useState<string | null>(null);

  const activeConflict =
    conflicts.find((c) => c.id === selectedConflictId) || conflicts[0] || null;

  const handleFollowUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpQuery.trim()) return;
    onRunFollowUp(followUpQuery.trim());
    setFollowUpQuery('');
  };

  if (!activeConflict) {
    return (
      <div className="flex items-center justify-center h-full p-12 text-center">
        <div className="max-w-md bg-white border border-[#c6c6cd] rounded-xl p-8 shadow-sm">
          <span className="material-symbols-outlined text-4xl text-[#059669] mb-3">verified</span>
          <h3 className="text-xl font-bold text-[#0b1c30] mb-1">No Active Conflicts Detected</h3>
          <p className="text-sm text-[#45464d]">
            All clauses and numeric figures across the indexed documents are mathematically and semantically consistent.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Left Column: AI Answer & Conflict Analysis */}
      <section className="flex-1 border-r border-[#c6c6cd]/60 bg-[#F8FAFC] overflow-y-auto p-8 lg:p-12 flex justify-center">
        <div className="max-w-[800px] w-full pb-16">
          {/* Conflict Switcher Pills */}
          {conflicts.length > 1 && (
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
              <span className="text-xs font-mono-data text-[#76777d] flex-shrink-0">
                Detected Conflicts ({conflicts.length}):
              </span>
              {conflicts.map((conf) => (
                <button
                  key={conf.id}
                  onClick={() => onSelectConflict(conf.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    conf.id === activeConflict.id
                      ? 'bg-[#BE123C] text-white shadow-xs'
                      : 'bg-white text-[#45464d] border border-[#c6c6cd] hover:border-[#BE123C]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  <span>{conf.title}</span>
                </button>
              ))}
            </div>
          )}

          {/* Header Banner */}
          <div className="mb-4">
            <span className="font-mono-data text-xs font-semibold text-[#BE123C] tracking-widest uppercase flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">warning</span>
              Critical Conflict Detected
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0b1c30] mt-2">
              {activeConflict.title}
            </h2>
          </div>

          {/* AI Analysis Content */}
          <div className="text-base text-[#45464d] space-y-4 mt-4 leading-relaxed">
            <p className="text-[#0b1c30]">{activeConflict.description}</p>

            {/* Conflict Comparison Card */}
            <div className="bg-white border border-[#c6c6cd] rounded-lg p-5 mt-4 shadow-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#BE123C]"></div>
              <div className="pl-3 flex flex-col gap-4">
                <p className="text-[#0b1c30] text-sm leading-relaxed">
                  <strong>Document A</strong> ({activeConflict.docA.docName}) states that{' '}
                  <span className="bg-[#ffdad6] text-[#93000a] px-1 py-0.5 rounded font-mono-data text-xs font-semibold border border-[#93000a]/20">
                    {activeConflict.docA.highlight}
                  </span>
                  , with reference to {activeConflict.docA.reference}.
                </p>

                <div className="w-full h-px bg-[#c6c6cd]/50"></div>

                <p className="text-[#0b1c30] text-sm leading-relaxed">
                  Conversely, <strong>Document B</strong> ({activeConflict.docB.docName}) reports{' '}
                  <span className="bg-[#ffdad6] text-[#93000a] px-1 py-0.5 rounded font-mono-data text-xs font-semibold border border-[#93000a]/20">
                    {activeConflict.docB.highlight}
                  </span>
                  , with reference to {activeConflict.docB.reference}.
                </p>
              </div>
            </div>

            <p className="mt-4 leading-relaxed">
              {activeConflict.reconciliationNotes}{' '}
              {activeConflict.citations.map((cit, idx) => (
                <button
                  key={cit.id}
                  onClick={() => {
                    setActiveCitation(cit.id);
                    onOpenDocumentViewer(cit.docName, cit.highlightText);
                  }}
                  className="inline-flex items-center gap-1 bg-[#DBEAFE] text-[#003ea8] px-1.5 py-0.5 rounded text-xs font-mono-data border border-[#b4c5ff] hover:underline mr-1.5 align-baseline"
                  title={`View extract from ${cit.docName}`}
                >
                  {cit.label || `Ref ${idx + 1}`}
                </button>
              ))}
            </p>
          </div>

          {/* Follow-up Query Input */}
          <div className="mt-10 border-t border-[#c6c6cd]/60 pt-6">
            <form
              onSubmit={handleFollowUpSubmit}
              className="relative bg-white border border-[#c6c6cd] rounded-lg shadow-sm p-2 focus-within:border-[#0051d5] focus-within:ring-1 focus-within:ring-[#0051d5] transition-all"
            >
              <textarea
                aria-label="Research query input"
                value={followUpQuery}
                onChange={(e) => setFollowUpQuery(e.target.value)}
                className="w-full min-h-[90px] border-none resize-none focus:ring-0 text-sm text-[#0b1c30] p-2 focus:outline-none placeholder-[#808488]"
                placeholder="Ask a follow-up question regarding this conflict..."
              />
              <div className="flex justify-between items-center px-2 pb-1">
                <div className="flex gap-2 text-[#45464d]">
                  <button
                    type="button"
                    className="p-1 hover:text-[#0051d5] hover:bg-[#eff4ff] rounded transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">attach_file</span>
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!followUpQuery.trim()}
                  className="bg-[#0b1c30] text-white px-4 py-1.5 rounded text-xs font-medium hover:bg-[#1f2d42] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition-colors shadow-sm"
                >
                  Analyze <span className="material-symbols-outlined text-[16px]">send</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Right Column: Source Evidence Panel */}
      <section className="w-[450px] bg-[#f8f9ff] overflow-y-auto border-l border-[#c6c6cd]/60 flex flex-col shadow-[-4px_0_12px_rgba(15,23,42,0.02)] z-10">
        <div className="sticky top-0 bg-[#f8f9ff]/95 backdrop-blur border-b border-[#c6c6cd]/60 p-4 flex items-center justify-between z-10">
          <h3 className="text-base font-semibold text-[#0b1c30] flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#0051d5]">find_in_page</span>
            Source Evidence
          </h3>
          <div className="flex items-center gap-2">
            <span className="bg-[#dce9ff] text-[#003ea8] px-2 py-0.5 rounded text-xs font-mono-data font-semibold">
              2 Sources
            </span>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Source Card 1 */}
          <div className="bg-white border border-[#c6c6cd] rounded-lg hover:border-l-[3px] hover:border-l-[#0051d5] hover:-ml-[1px] transition-all shadow-xs overflow-hidden">
            <div className="border-b border-[#c6c6cd]/60 p-3 bg-[#f8f9ff] flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#45464d] text-[18px]">
                  description
                </span>
                <div>
                  <div className="text-xs font-semibold text-[#0b1c30]">
                    {activeConflict.docA.docName}
                  </div>
                  <div className="font-mono-data text-[11px] text-[#76777d]">
                    {activeConflict.docA.reference}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  onOpenDocumentViewer(activeConflict.docA.docName, activeConflict.docA.highlight)
                }
                className="text-[#0051d5] hover:text-[#003ea8] text-xs font-medium flex items-center gap-1 cursor-pointer bg-transparent border-none"
              >
                View <span className="material-symbols-outlined text-[15px]">open_in_new</span>
              </button>
            </div>

            <div className="p-3">
              <div className="font-mono-data text-xs text-[#45464d] bg-[#f8f9ff] p-3 rounded border border-[#c6c6cd]/50 whitespace-pre-wrap leading-relaxed">
                {activeConflict.docA.fullSnippet.includes(activeConflict.docA.highlight) ? (
                  <span>
                    {
                      activeConflict.docA.fullSnippet.split(
                        activeConflict.docA.highlight
                      )[0]
                    }
                    <strong className="bg-[#ffdad6] text-[#93000a] px-1 py-0.5 rounded font-semibold">
                      {activeConflict.docA.highlight}
                    </strong>
                    {
                      activeConflict.docA.fullSnippet.split(
                        activeConflict.docA.highlight
                      )[1]
                    }
                  </span>
                ) : (
                  activeConflict.docA.fullSnippet
                )}
              </div>
            </div>
          </div>

          {/* Source Card 2 */}
          <div className="bg-white border border-[#c6c6cd] rounded-lg hover:border-l-[3px] hover:border-l-[#0051d5] hover:-ml-[1px] transition-all shadow-xs overflow-hidden">
            <div className="border-b border-[#c6c6cd]/60 p-3 bg-[#f8f9ff] flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#45464d] text-[18px]">
                  text_snippet
                </span>
                <div>
                  <div className="text-xs font-semibold text-[#0b1c30]">
                    {activeConflict.docB.docName}
                  </div>
                  <div className="font-mono-data text-[11px] text-[#76777d]">
                    {activeConflict.docB.reference}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  onOpenDocumentViewer(activeConflict.docB.docName, activeConflict.docB.highlight)
                }
                className="text-[#0051d5] hover:text-[#003ea8] text-xs font-medium flex items-center gap-1 cursor-pointer bg-transparent border-none"
              >
                View <span className="material-symbols-outlined text-[15px]">open_in_new</span>
              </button>
            </div>

            <div className="p-3">
              <div className="font-mono-data text-xs text-[#45464d] bg-[#f8f9ff] p-3 rounded border border-[#c6c6cd]/50 whitespace-pre-wrap leading-relaxed">
                {activeConflict.docB.fullSnippet.includes(activeConflict.docB.highlight) ? (
                  <span>
                    {
                      activeConflict.docB.fullSnippet.split(
                        activeConflict.docB.highlight
                      )[0]
                    }
                    <strong className="bg-[#ffdad6] text-[#93000a] px-1 py-0.5 rounded font-semibold">
                      {activeConflict.docB.highlight}
                    </strong>
                    {
                      activeConflict.docB.fullSnippet.split(
                        activeConflict.docB.highlight
                      )[1]
                    }
                  </span>
                ) : (
                  activeConflict.docB.fullSnippet
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
