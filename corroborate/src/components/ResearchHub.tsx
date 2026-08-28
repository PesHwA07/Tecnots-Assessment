import React, { useState, useRef, useEffect } from 'react';
import { DocumentItem, MessageItem, CitationReference } from '../types';

interface ResearchHubProps {
  documents: DocumentItem[];
  messages: MessageItem[];
  onSendMessage: (query: string) => Promise<void>;
  isLoading: boolean;
  onOpenSourceInspector: (docName?: string, citation?: CitationReference) => void;
  onOpenUpload: () => void;
  onSelectConflict: (conflictId: string) => void;
}

export const ResearchHub: React.FC<ResearchHubProps> = ({
  documents,
  messages,
  onSendMessage,
  isLoading,
  onOpenSourceInspector,
  onOpenUpload,
  onSelectConflict,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [showSourceSelector, setShowSourceSelector] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const query = inputText.trim();
    setInputText('');
    await onSendMessage(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const activeDocuments = documents.filter((d) => d.status === 'indexed');

  const suggestedPrompts = [
    {
      title: 'Vendor Termination Clauses',
      prompt:
        'What are the primary termination clauses mentioned across the vendor agreements? Specifically, look for conditions regarding breach of data security.',
    },
    {
      title: 'Q3 Revenue Discrepancy',
      prompt:
        'What are the discrepancies in the Q3 revenue reporting between the internal audit and external filings?',
    },
    {
      title: 'Article 4 Compliance',
      prompt: 'Verify compliance with Article 4 in the vendor agreement.',
    },
  ];

  return (
    <div className="flex-1 flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Center Column: Chat Interface */}
      <section className="flex-1 flex flex-col min-w-0 bg-[#f8f9ff] relative border-r border-[#c6c6cd]/60">
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:px-[12%] pb-64 space-y-8">
          {messages.length === 0 ? (
            /* AI Introduction Hero */
            <div className="flex flex-col items-center justify-center text-center py-12 mb-6">
              <div className="w-14 h-14 bg-[#e5eeff] rounded-2xl flex items-center justify-center text-[#0051d5] mb-4 shadow-sm">
                <span className="material-symbols-outlined text-[36px]">manage_search</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#0b1c30] mb-2 tracking-tight">
                How can I assist your research?
              </h1>
              <p className="text-base text-[#45464d] max-w-lg leading-relaxed mb-8">
                I am analyzing {activeDocuments.length} active documents. Ask a question to extract data,
                compare clauses, or verify facts.
              </p>

              {/* Quick Prompts */}
              <div className="w-full max-w-xl space-y-2 text-left">
                <div className="text-xs font-semibold text-[#76777d] uppercase tracking-wider px-1">
                  Suggested Inquiries
                </div>
                {suggestedPrompts.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputText(item.prompt);
                    }}
                    className="w-full text-left p-3.5 bg-white border border-[#c6c6cd]/70 hover:border-[#0051d5] rounded-lg shadow-sm hover:shadow transition-all group flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-semibold text-[#0051d5] mb-0.5">{item.title}</div>
                      <div className="text-xs text-[#0b1c30] group-hover:text-[#0051d5] line-clamp-2">
                        {item.prompt}
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[18px] text-[#76777d] group-hover:text-[#0051d5] mt-1">
                      arrow_forward
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              if (msg.sender === 'user') {
                return (
                  <div key={msg.id} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#dce9ff] flex-shrink-0 flex items-center justify-center overflow-hidden border border-[#c6c6cd]">
                      <span className="material-symbols-outlined text-[18px] text-[#45464d]">
                        person
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-[#0b1c30] mb-1">User</div>
                      <div className="text-base text-[#0b1c30] font-normal leading-relaxed">
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={msg.id} className="flex gap-4">
                  {/* AI Avatar */}
                  <div className="w-8 h-8 rounded-full bg-[#0b1c30] flex-shrink-0 flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-[18px] text-white">memory</span>
                  </div>

                  {/* AI Content Body */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[#0b1c30] mb-2 flex items-center gap-2">
                      <span>Corroborate</span>
                      {msg.verified && (
                        <span className="inline-flex items-center gap-1.5 bg-[#eff4ff] border border-[#c6c6cd]/60 rounded px-2 py-0.5 text-xs font-mono-data text-[#45464d]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
                          Verified
                        </span>
                      )}
                    </div>

                    {/* Reasoning Steps Dropdown */}
                    {msg.reasoningSteps && msg.reasoningSteps.length > 0 && (
                      <details
                        open
                        className="mb-4 group bg-white border border-[#c6c6cd]/80 rounded-lg overflow-hidden shadow-xs"
                      >
                        <summary className="flex items-center justify-between px-3 py-2 cursor-pointer bg-[#f8f9ff] hover:bg-[#eff4ff] transition-colors list-none">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px] text-[#45464d] transition-transform group-open:rotate-90">
                              chevron_right
                            </span>
                            <span className="text-xs font-semibold text-[#45464d]">
                              View Analysis Reasoning
                            </span>
                          </div>
                          <span className="text-[10px] font-mono-data text-[#76777d]">
                            {msg.reasoningSteps.length} steps
                          </span>
                        </summary>
                        <div className="p-3 bg-white border-t border-[#c6c6cd]/60 text-[#45464d] text-xs space-y-1.5 font-normal">
                          {msg.reasoningSteps.map((step, idx) => (
                            <p key={idx} className="flex items-start gap-1.5 leading-relaxed">
                              <span className="font-mono-data text-[#0051d5] font-semibold flex-shrink-0">
                                {idx + 1}.
                              </span>
                              <span>{step}</span>
                            </p>
                          ))}
                        </div>
                      </details>
                    )}

                    {/* Main Markdown / Text Content */}
                    <div className="text-base text-[#0b1c30] space-y-3.5 leading-relaxed">
                      {msg.content.split('\n\n').map((paragraph, pIdx) => {
                        // Check if paragraph contains citation tokens or markdown bolding
                        return (
                          <p key={pIdx} className="leading-relaxed">
                            {paragraph}
                          </p>
                        );
                      })}
                    </div>

                    {/* Conflict Detected Banner */}
                    {msg.conflictNotice && (
                      <div className="my-4 bg-[#fff1f2] border-l-4 border-[#BE123C] rounded-r-lg p-3.5 flex items-start gap-3 shadow-xs">
                        <span className="material-symbols-outlined text-[#BE123C] mt-0.5 text-[20px] flex-shrink-0">
                          warning
                        </span>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-[#BE123C] mb-1">
                            {msg.conflictNotice.title}
                          </h4>
                          <p className="text-xs text-[#881337] leading-relaxed">
                            {msg.conflictNotice.description}
                          </p>
                          {msg.conflictNotice.conflictId && (
                            <button
                              onClick={() =>
                                onSelectConflict(msg.conflictNotice!.conflictId!)
                              }
                              className="mt-2 text-xs font-semibold text-[#BE123C] hover:underline flex items-center gap-1"
                            >
                              <span>Open Conflict Inspector</span>
                              <span className="material-symbols-outlined text-[14px]">
                                open_in_new
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Source Chips */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-[#76777d] font-mono-data mr-1">Sources:</span>
                      {(msg.citations && msg.citations.length > 0
                        ? msg.citations
                        : [
                            {
                              id: 'c1',
                              label: 'Doc A: Acme_MSA_2023.pdf',
                              docId: 'doc-1',
                              docName: 'Acme_MSA_2023.pdf',
                              section: 'Section 4.2',
                              exactSnippet: 'Immediate termination without cure period.',
                            },
                            {
                              id: 'c2',
                              label: 'Doc B: TechFlow_SLA_v2.docx',
                              docId: 'doc-2',
                              docName: 'TechFlow_SLA_v2.docx',
                              section: 'Section 8.1',
                              exactSnippet: 'Mandatory 30-day cure period for any breach.',
                            },
                          ]
                      ).map((cit) => (
                        <button
                          key={cit.id}
                          onClick={() => onOpenSourceInspector(cit.docName, cit)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#c6c6cd]/80 bg-white text-[#0051d5] hover:bg-[#eff4ff] hover:border-[#0051d5] transition-colors text-xs font-medium shadow-2xs"
                        >
                          <span className="material-symbols-outlined text-[14px]">description</span>
                          <span>{cit.label.includes('Doc') ? cit.label : `${cit.docName}`}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-[#0b1c30] flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
              </div>
              <div className="bg-white border border-[#c6c6cd] rounded-xl p-4 shadow-sm space-y-2 max-w-md">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0051d5]">
                  <span className="w-2 h-2 rounded-full bg-[#0051d5] animate-ping"></span>
                  Corroborating citations across {activeDocuments.length} active documents...
                </div>
                <div className="h-1.5 w-full bg-[#eff4ff] rounded-full overflow-hidden">
                  <div className="h-full bg-[#0051d5] rounded-full animate-pulse w-3/4"></div>
                </div>
                <p className="text-[11px] text-[#45464d]">
                  Evaluating semantic cross-references and calculating contradiction weights.
                </p>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Area (Fixed Bottom) */}
        <div className="absolute bottom-0 w-full bg-gradient-to-t from-[#f8f9ff] via-[#f8f9ff]/95 to-transparent pt-8 pb-4 px-6 md:px-8 lg:px-[12%] z-20">
          <div className="relative bg-white border border-[#c6c6cd] rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.06)] focus-within:border-[#0051d5] focus-within:ring-1 focus-within:ring-[#0051d5]/20 transition-all">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about the active documents..."
              rows={2}
              className="w-full bg-transparent border-none rounded-xl text-sm md:text-base text-[#0b1c30] placeholder-[#808488] focus:ring-0 resize-none py-3 px-4 min-h-[72px] focus:outline-none"
            />

            {/* Input Toolbar */}
            <div className="flex items-center justify-between px-3 pb-2.5">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={onOpenUpload}
                  className="p-1.5 text-[#45464d] hover:text-[#0051d5] hover:bg-[#eff4ff] rounded transition-colors"
                  title="Attach File"
                >
                  <span className="material-symbols-outlined text-[20px]">attach_file</span>
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowSourceSelector(!showSourceSelector)}
                    className="p-1.5 text-[#45464d] hover:text-[#0051d5] hover:bg-[#eff4ff] rounded transition-colors"
                    title="Select Specific Sources"
                  >
                    <span className="material-symbols-outlined text-[20px]">library_add_check</span>
                  </button>

                  {showSourceSelector && (
                    <div className="absolute bottom-full mb-2 left-0 w-64 bg-white border border-[#c6c6cd] rounded-lg shadow-lg p-3 z-50 text-left">
                      <div className="text-xs font-semibold text-[#0b1c30] mb-2 flex items-center justify-between">
                        <span>Active Target Sources</span>
                        <span className="text-[10px] text-[#0051d5] cursor-pointer">
                          Select All
                        </span>
                      </div>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {activeDocuments.map((doc) => (
                          <label
                            key={doc.id}
                            className="flex items-center gap-2 text-xs text-[#45464d] hover:bg-[#eff4ff] p-1 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              defaultChecked
                              className="rounded border-[#c6c6cd] text-[#0051d5] focus:ring-0"
                            />
                            <span className="truncate">{doc.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={!inputText.trim() || isLoading}
                className="flex items-center justify-center w-8 h-8 bg-[#0b1c30] text-white rounded hover:bg-[#1f2d42] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
              </button>
            </div>
          </div>

          <div className="text-center mt-2 font-mono-data text-[11px] text-[#76777d]">
            Corroborate can make mistakes. Consider verifying important information.
          </div>
        </div>
      </section>

      {/* Right Column: Active Sources Panel */}
      <aside className="hidden xl:flex flex-col w-[320px] bg-[#F8FAFC] border-l border-[#c6c6cd]/60 flex-shrink-0">
        <div className="px-4 py-4 border-b border-[#c6c6cd]/60 bg-white">
          <h2 className="text-base font-semibold text-[#0b1c30] flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#0051d5]">library_books</span>
            Active Sources
          </h2>
          <p className="text-xs text-[#45464d] mt-0.5">Documents contributing to the current context.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {activeDocuments.map((doc) => {
            const hasConflict = (doc.conflictCount || 0) > 0;

            return (
              <div
                key={doc.id}
                onClick={() => onOpenSourceInspector(doc.name)}
                className={`bg-white border rounded-lg p-3 hover:border-[#0051d5] transition-all cursor-pointer group relative shadow-xs ${
                  hasConflict
                    ? 'border-[#BE123C] shadow-[0_2px_8px_rgba(190,18,60,0.05)]'
                    : 'border-[#c6c6cd]/80 hover:bg-[#eff4ff]/30'
                }`}
              >
                {/* Left hover indicator bar */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${
                    hasConflict
                      ? 'bg-[#BE123C]'
                      : 'bg-[#0051d5] opacity-0 group-hover:opacity-100 transition-opacity'
                  }`}
                ></div>

                <div className="flex items-start gap-2.5 pl-1">
                  <div className="mt-0.5 flex-shrink-0">
                    {hasConflict ? (
                      <span className="material-symbols-outlined text-[#BE123C] text-[18px]">
                        warning
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-[#059669] text-[18px]">
                        check_circle
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-[#0b1c30] truncate group-hover:text-[#0051d5] transition-colors">
                      {doc.name}
                    </div>
                    <div className="font-mono-data text-[11px] text-[#76777d] mt-1 flex items-center gap-1.5 flex-wrap">
                      <span className="bg-[#dce9ff] text-[#003ea8] px-1 rounded uppercase text-[10px]">
                        {doc.type}
                      </span>
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span>Indexed</span>
                    </div>

                    {hasConflict && (
                      <div className="mt-2 text-[#BE123C] text-[11px] font-medium bg-[#fff1f2] border border-[#BE123C]/20 px-2 py-0.5 rounded inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#BE123C]"></span>
                        Conflict Detected
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
};
