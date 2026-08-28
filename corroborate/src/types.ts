export type MainNavTab = 'research-hub' | 'document-library' | 'analysis-history' | 'conflict-reports' | 'settings';
export type TopSubTab = 'active-files' | 'source-inspector';

export type DocumentStatus = 'indexed' | 'parsing' | 'error';
export type DocumentFileType = 'pdf' | 'docx' | 'txt' | 'md' | 'csv';

export interface DocumentItem {
  id: string;
  name: string;
  type: DocumentFileType;
  size: string;
  status: DocumentStatus;
  statusText?: string;
  uploadDate: string;
  content: string;
  sections?: {
    id: string;
    title: string;
    pageOrLine: string;
    text: string;
  }[];
  conflictCount?: number;
}

export interface CitationReference {
  id: string;
  label: string; // e.g. "Doc A: §4.2" or "Ref 1"
  docId: string;
  docName: string;
  section: string;
  exactSnippet: string;
  highlightText?: string;
}

export interface ConflictItem {
  id: string;
  title: string;
  severity: 'critical' | 'warning' | 'info';
  category: string;
  description: string;
  docA: {
    docId: string;
    docName: string;
    reference: string;
    statement: string;
    highlight: string;
    fullSnippet: string;
  };
  docB: {
    docId: string;
    docName: string;
    reference: string;
    statement: string;
    highlight: string;
    fullSnippet: string;
  };
  reconciliationNotes: string;
  citations: CitationReference[];
  dateDetected: string;
}

export interface MessageItem {
  id: string;
  sender: 'user' | 'ai';
  timestamp: string;
  content: string;
  verified?: boolean;
  reasoningSteps?: string[];
  conflictNotice?: {
    title: string;
    description: string;
    involvedDocs: string[];
    conflictId?: string;
  };
  citations?: CitationReference[];
  activeSourceNames?: string[];
}

export interface AnalysisHistoryItem {
  id: string;
  timestamp: string;
  formattedDate: string;
  query: string;
  summary: string;
  documentCount: number;
  hasConflicts: boolean;
  status: 'verified' | 'conflicts';
  messages: MessageItem[];
  conflictId?: string;
}

export interface SystemServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'indexing';
  latency: string;
  details: string;
}
