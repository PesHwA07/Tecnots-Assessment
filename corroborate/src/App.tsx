import React, { useState, useEffect } from 'react';
import {
  MainNavTab,
  TopSubTab,
  DocumentItem,
  ConflictItem,
  AnalysisHistoryItem,
  TeamAnnotation,
  MessageItem,
  CitationReference,
} from './types';
import {
  INITIAL_CONFLICTS,
} from './data/mockData';
import { SideNavBar } from './components/SideNavBar';
import { TopAppBar } from './components/TopAppBar';
import { DocumentLibrary } from './components/DocumentLibrary';
import { ResearchHub } from './components/ResearchHub';
import { ConflictReports } from './components/ConflictReports';
import { AnalysisHistory } from './components/AnalysisHistory';
import { UploadModal } from './components/UploadModal';
import { DocumentViewerModal } from './components/DocumentViewerModal';
import { SettingsModal } from './components/SettingsModal';
import { SystemStatusModal } from './components/SystemStatusModal';
import { HelpCenterModal } from './components/HelpCenterModal';

// ========== API helpers ==========

/** Fetch documents from FastAPI backend and convert to UI shape */
async function fetchDocuments(): Promise<DocumentItem[]> {
  const res = await fetch('/api/documents');
  if (!res.ok) return [];
  const data = await res.json();
  const docs = data.documents || [];
  return docs.map((d: any) => ({
    id: d.id,
    name: d.filename,
    type: (d.file_type?.replace('.', '') || 'txt') as any,
    size: `${d.chunk_count} chunks`,
    status: 'indexed' as const,
    uploadDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    content: '',
  }));
}

/** Upload a file to FastAPI and return the new DocumentItem */
async function uploadFileToBackend(file: File): Promise<DocumentItem | null> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/documents', { method: 'POST', body: formData });
  if (!res.ok) return null;
  const data = await res.json();
  const doc = data.document;
  return {
    id: doc.id,
    name: doc.filename,
    type: (doc.file_type?.replace('.', '') || 'txt') as any,
    size: `${doc.chunk_count} chunks`,
    status: 'indexed',
    uploadDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    content: '',
  };
}

/** Delete a document from FastAPI */
async function deleteDocumentFromBackend(docId: string): Promise<boolean> {
  const res = await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
  return res.ok;
}

// ========== App ==========

export const App: React.FC = () => {
  const [currentMainTab, setCurrentMainTab] = useState<MainNavTab>('research-hub');
  const [currentSubTab, setCurrentSubTab] = useState<TopSubTab>('active-files');

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [conflicts, setConflicts] = useState<ConflictItem[]>(INITIAL_CONFLICTS);
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [selectedConflictId, setSelectedConflictId] = useState<string>(INITIAL_CONFLICTS[0]?.id || '');
  const [viewingDocument, setViewingDocument] = useState<DocumentItem | null>(null);
  const [viewerHighlight, setViewerHighlight] = useState<string>('');

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSystemStatusModalOpen, setIsSystemStatusModalOpen] = useState(false);
  const [isHelpCenterModalOpen, setIsHelpCenterModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load documents from backend on mount
  useEffect(() => {
    fetchDocuments().then(setDocuments);
  }, []);

  // ========== Send message via SSE stream to FastAPI RAG backend ==========
  const handleSendMessage = async (query: string) => {
    const userMsg: MessageItem = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: query,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const body: any = { question: query };
      if (sessionId) body.session_id = sessionId;

      const response = await fetch('/api/query/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'Server error' }));
        throw new Error(err.detail || 'Server error');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      let fullAnswer = '';
      let metaData: any = null;
      let doneData: any = null;

      // Create the AI message shell
      const aiMsgId = 'msg-ai-' + Date.now();

      if (reader) {
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            try {
              const event = JSON.parse(line.slice(6));

              if (event.type === 'meta') {
                metaData = event;
                if (event.session_id) setSessionId(event.session_id);
              } else if (event.type === 'token') {
                fullAnswer += event.content || '';
                // Live-update the message as tokens stream in
                const streamingMsg: MessageItem = {
                  id: aiMsgId,
                  sender: 'ai',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  verified: true,
                  content: fullAnswer,
                  reasoningSteps: metaData ? [
                    `Searched ${metaData.sources?.length || 0} relevant passages across uploaded documents.`,
                    `Confidence: ${metaData.confidence || 'medium'}`,
                    ...(metaData.rewritten_query ? [`Interpreted follow-up as: "${metaData.rewritten_query}"`] : []),
                  ] : undefined,
                  citations: metaData?.sources?.map((s: any, i: number) => ({
                    id: `cit-${i}`,
                    label: `${s.doc_name}${s.page_number ? ` p.${s.page_number}` : ''}`,
                    docId: s.doc_name,
                    docName: s.doc_name,
                    section: s.section_heading || `Page ${s.page_number || '?'}`,
                    exactSnippet: s.passage?.slice(0, 200) || '',
                    highlightText: '',
                  })) || [],
                };
                setMessages([...newMessages, streamingMsg]);
              } else if (event.type === 'done') {
                doneData = event;
              }
            } catch {
              // skip malformed JSON
            }
          }
        }
      }

      // Build final AI message with conflict info from done event
      const finalMsg: MessageItem = {
        id: aiMsgId,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        verified: true,
        reasoningSteps: [
          `Searched ${metaData?.sources?.length || 0} relevant passages across uploaded documents.`,
          `Confidence: ${metaData?.confidence || 'medium'}`,
          ...(metaData?.rewritten_query ? [`Interpreted follow-up as: "${metaData.rewritten_query}"`] : []),
        ],
        content: fullAnswer,
        conflictNotice: doneData?.has_conflict ? {
          title: 'Conflict Detected Between Sources',
          description: doneData.conflicts?.map((c: any) => `${c.doc_name}: "${c.claim}"`).join(' vs. ') || 'Sources disagree on this topic.',
          involvedDocs: doneData.conflicts?.map((c: any) => c.doc_name) || [],
        } : undefined,
        citations: metaData?.sources?.map((s: any, i: number) => ({
          id: `cit-${i}`,
          label: `${s.doc_name}${s.page_number ? ` p.${s.page_number}` : ''}`,
          docId: s.doc_name,
          docName: s.doc_name,
          section: s.section_heading || `Page ${s.page_number || '?'}`,
          exactSnippet: s.passage?.slice(0, 200) || '',
          highlightText: '',
        })) || [],
      };

      setMessages([...newMessages, finalMsg]);

      // Save to history
      const newHistoryItem: AnalysisHistoryItem = {
        id: 'hist-' + Date.now(),
        timestamp: new Date().toISOString(),
        formattedDate:
          new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
          ' · ' +
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        query: query,
        summary: fullAnswer.slice(0, 160) + '...',
        documentCount: metaData?.sources?.length || 0,
        hasConflicts: !!doneData?.has_conflict,
        status: doneData?.has_conflict ? 'conflicts' : 'verified',
        messages: [...newMessages, finalMsg],
      };
      setHistory((prev) => [newHistoryItem, ...prev]);

    } catch (err: any) {
      console.error('Query error:', err);
      const errorMsg: MessageItem = {
        id: 'msg-err-' + Date.now(),
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: `⚠️ ${err.message || 'Failed to get a response. Please check that documents are uploaded and try again.'}`,
      };
      setMessages([...newMessages, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewAnalysis = () => {
    setMessages([]);
    setSessionId('');
    setCurrentMainTab('research-hub');
    setCurrentSubTab('active-files');
  };

  const handleSelectSubTab = (tab: TopSubTab) => {
    setCurrentSubTab(tab);
    if (tab === 'active-files') {
      setCurrentMainTab('research-hub');
    } else if (tab === 'source-inspector') {
      setCurrentMainTab('conflict-reports');
    }
  };

  const handleSelectHistoryItem = (item: AnalysisHistoryItem) => {
    if (item.messages && item.messages.length > 0) {
      setMessages(item.messages);
    }
    if (item.hasConflicts && item.conflictId) {
      setSelectedConflictId(item.conflictId);
      setCurrentMainTab('conflict-reports');
      setCurrentSubTab('source-inspector');
    } else {
      setCurrentMainTab('research-hub');
      setCurrentSubTab('active-files');
    }
  };

  const handleSelectConflict = (conflictId: string) => {
    setSelectedConflictId(conflictId);
    setCurrentMainTab('conflict-reports');
    setCurrentSubTab('source-inspector');
  };

  const handleOpenSourceInspector = (docName?: string, citation?: CitationReference) => {
    if (docName) {
      const found = documents.find((d) => d.name === docName);
      if (found) {
        setViewingDocument(found);
        setViewerHighlight(citation?.highlightText || '');
        return;
      }
    }
    setCurrentMainTab('conflict-reports');
    setCurrentSubTab('source-inspector');
  };

  // ========== Real file upload to FastAPI ==========
  const handleUploadFiles = async (files: FileList | File[]) => {
    for (const file of Array.from(files)) {
      const doc = await uploadFileToBackend(file);
      if (doc) {
        setDocuments((prev) => [doc, ...prev]);
      }
    }
  };

  // ========== Real document delete from FastAPI ==========
  const handleDeleteDocument = async (docId: string) => {
    const success = await deleteDocumentFromBackend(docId);
    if (success) {
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    }
  };

  const handleLoadBundle = (bundleName: string) => {
    // Bundles are demo-only, just refresh from backend
    fetchDocuments().then(setDocuments);
  };

  const handleExportSession = (format: 'json' | 'md') => {
    let content = '';
    let filename = `corroborate_session_${Date.now()}.${format}`;

    if (format === 'json') {
      content = JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          documents: documents.map((d) => ({ name: d.name, size: d.size, status: d.status })),
          conflicts,
          messages,
        },
        null,
        2
      );
    } else {
      content = `# Corroborate Verification Report\nDate: ${new Date().toLocaleDateString()}\n\n## Indexed Documents\n${documents.map((d) => `- ${d.name} (${d.size})`).join('\n')}\n\n## Conversation\n${messages.map((m) => `**${m.sender}**: ${m.content}`).join('\n\n')}\n`;
    }

    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen bg-[#f8f9ff] text-[#0b1c30] overflow-hidden">
      {/* Side Navigation Bar */}
      <SideNavBar
        currentTab={currentMainTab}
        onSelectTab={(tab) => {
          setCurrentMainTab(tab);
          if (tab === 'research-hub') setCurrentSubTab('active-files');
          if (tab === 'conflict-reports') setCurrentSubTab('source-inspector');
        }}
        onNewAnalysis={handleNewAnalysis}
        onOpenSystemStatus={() => setIsSystemStatusModalOpen(true)}
        onOpenHelpCenter={() => setIsHelpCenterModalOpen(true)}
        conflictCount={conflicts.length}
      />

      {/* Main Content Area (offset by 280px sidebar) */}
      <div className="flex-1 flex flex-col pl-[280px] min-w-0 h-screen overflow-hidden">
        {/* Top App Bar */}
        <TopAppBar
          currentMainTab={currentMainTab}
          currentSubTab={currentSubTab}
          onSelectSubTab={handleSelectSubTab}
          onOpenUpload={() => setIsUploadModalOpen(true)}
        />

        {/* View Router */}
        <main className="flex-1 overflow-y-auto min-w-0 relative">
          {currentMainTab === 'document-library' ? (
            <DocumentLibrary
              documents={documents}
              onUploadFiles={handleUploadFiles}
              onDeleteDocument={handleDeleteDocument}
              onSelectDocument={(doc) => {
                setViewingDocument(doc);
                setViewerHighlight('');
              }}
              onOpenUploadModal={() => setIsUploadModalOpen(true)}
            />
          ) : currentMainTab === 'conflict-reports' ? (
            <ConflictReports
              conflicts={conflicts}
              documents={documents}
              selectedConflictId={selectedConflictId}
              onSelectConflict={setSelectedConflictId}
              onOpenDocumentViewer={(docName, highlight) => {
                const found = documents.find((d) => d.name === docName);
                if (found) {
                  setViewingDocument(found);
                  setViewerHighlight(highlight || '');
                }
              }}
              onRunFollowUp={(prompt) => {
                handleSendMessage(prompt);
                setCurrentMainTab('research-hub');
                setCurrentSubTab('active-files');
              }}
            />
          ) : currentMainTab === 'analysis-history' ? (
            <AnalysisHistory
              history={history}
              onSelectHistoryItem={handleSelectHistoryItem}
            />
          ) : currentMainTab === 'settings' ? (
            <div className="p-8 max-w-3xl mx-auto">
              <div className="bg-white border border-[#c6c6cd] rounded-xl p-8 shadow-sm">
                <h2 className="text-xl font-bold text-[#0b1c30] mb-2">Workspace Preferences</h2>
                <p className="text-sm text-[#45464d] mb-6">
                  Manage reasoning models, strictness tolerance, and citation extraction parameters.
                </p>
                <button
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="bg-[#0b1c30] text-white px-4 py-2 rounded text-xs font-medium hover:bg-[#1f2d42]"
                >
                  Open Full Configuration Modal
                </button>
              </div>
            </div>
          ) : (
            <ResearchHub
              documents={documents}
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              onOpenSourceInspector={handleOpenSourceInspector}
              onOpenUpload={() => setIsUploadModalOpen(true)}
              onSelectConflict={handleSelectConflict}
            />
          )}
        </main>
      </div>

      {/* Modals and Drawers */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadDocument={(newDoc) => setDocuments((prev) => [newDoc, ...prev])}
        onLoadBundle={handleLoadBundle}
      />

      <DocumentViewerModal
        document={viewingDocument}
        highlightPhrase={viewerHighlight}
        onClose={() => setViewingDocument(null)}
        onAskQuestion={(query) => {
          setViewingDocument(null);
          setCurrentMainTab('research-hub');
          setCurrentSubTab('active-files');
          handleSendMessage(query);
        }}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onExportSession={handleExportSession}
      />

      <SystemStatusModal
        isOpen={isSystemStatusModalOpen}
        onClose={() => setIsSystemStatusModalOpen(false)}
      />

      <HelpCenterModal
        isOpen={isHelpCenterModalOpen}
        onClose={() => setIsHelpCenterModalOpen(false)}
      />
    </div>
  );
};

export default App;
