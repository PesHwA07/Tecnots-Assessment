import { DocumentItem, ConflictItem, AnalysisHistoryItem, TeamAnnotation } from '../types';

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-1',
    name: 'Acme_MSA_2023.pdf',
    type: 'pdf',
    size: '2.4 MB',
    status: 'indexed',
    uploadDate: 'Oct 20, 2023',
    content: `ACME CORPORATION MASTER SERVICES AGREEMENT (2023)
SECTION 4. TERMINATION AND DEFAULT
4.1 General Termination: Either party may terminate for convenience upon sixty (60) days written notice.
4.2 Termination for Data Security Breach: In the event of an unmitigated breach of data security involving Personally Identifiable Information (PII) or confidential client telemetry, the Non-Breaching Party possesses the unilateral right of IMMEDIATE TERMINATION without obligation of a cure period.
4.3 Post-Termination Obligations: All customer materials must be securely destroyed or returned within fourteen (14) calendar days.`,
    sections: [
      {
        id: 'sec-4.2',
        title: 'Section 4.2 - Data Security Breach Termination',
        pageOrLine: 'Page 8, Section 4.2',
        text: 'In the event of an unmitigated breach of data security involving Personally Identifiable Information (PII)... the Non-Breaching Party possesses the unilateral right of immediate termination without cure period.'
      }
    ]
  },
  {
    id: 'doc-2',
    name: 'TechFlow_SLA_v2.docx',
    type: 'docx',
    size: '840 KB',
    status: 'indexed',
    uploadDate: 'Oct 21, 2023',
    conflictCount: 1,
    content: `TECHFLOW ENTERPRISE SERVICE LEVEL AGREEMENT (SLA v2)
SECTION 8. BREACH AND REMEDIES
8.1 Mandatory Cure Period: Prior to any declaration of contract forfeiture or termination for default, the non-defaulting party must furnish written notice detailing the violation. The defaulting party shall be granted a mandatory thirty (30) day cure period for any breach, including operational, technical, or data governance failures.
8.2 Maximum Damages: Liquidated damages shall not exceed monthly recurring billings.`,
    sections: [
      {
        id: 'sec-8.1',
        title: 'Section 8.1 - Mandatory Cure Period',
        pageOrLine: 'Page 12, Section 8.1',
        text: 'The defaulting party shall be granted a mandatory thirty (30) day cure period for any breach, including operational, technical, or data governance failures.'
      }
    ]
  },
  {
    id: 'doc-3',
    name: 'Vendor_Security_Addendum.txt',
    type: 'txt',
    size: '12 KB',
    status: 'indexed',
    uploadDate: 'Oct 21, 2023',
    content: `VENDOR SECURITY ADDENDUM - ISO 27001 / SOC2 COMPLIANCE
Article 4. Compliance and Audit Rights:
Vendor guarantees full compliance with SOC2 Type II controls.
Section 4.2 Vendor Liability Cap: The maximum aggregate liability for security negligence shall remain capped at $2,000,000 (Two Million US Dollars).
Article 5. Notification Window:
Security incidents must be reported to the security operations center within 24 hours of confirmation.`,
    sections: [
      {
        id: 'sec-art-4',
        title: 'Article 4 - Security Compliance',
        pageOrLine: 'Line 32',
        text: "The vendor's liability cap remains intact at $2M as stipulated in section 4.2."
      }
    ]
  },
  {
    id: 'doc-4',
    name: 'Q3_Earnings_Call_Transcript.pdf',
    type: 'pdf',
    size: '1.2 MB',
    status: 'indexed',
    uploadDate: 'Oct 23, 2023',
    content: `Q3 2023 EARNINGS CONFERENCE CALL TRANSCRIPT
CEO Remarks: We delivered solid top-line performance while managing regional friction.
CFO Financial Review: Gross margins remained resilient at 68%. In the EMEA region, supply chain restructuring created temporary overhead. We adjusted net results in accordance with GAAP.`,
    sections: [
      {
        id: 'sec-transcript-cfo',
        title: 'CFO Remarks - EMEA Operations',
        pageOrLine: 'Page 4, Paragraph 3',
        text: 'In the EMEA region, supply chain restructuring created temporary overhead.'
      }
    ]
  },
  {
    id: 'doc-5',
    name: 'API_Documentation_v2.md',
    type: 'md',
    size: '450 KB',
    status: 'indexed',
    uploadDate: 'Oct 24, 2023',
    content: `# Corroborate Core API v2 Specification
## Authentication
Bearer token authorization required for all endpoints.
## Rate Limits
Standard tier: 120 req/min. Enterprise tier: Unlimited with SLA.
## Endpoints
- POST /v2/documents/ingest
- POST /v2/verify/cross-reference
- GET /v2/reports/conflicts`,
    sections: [
      {
        id: 'sec-api-auth',
        title: 'Authentication & Headers',
        pageOrLine: 'Section 2.1',
        text: 'Bearer token authorization required for all endpoints.'
      }
    ]
  },
  {
    id: 'doc-6',
    name: 'Internal_Audit_Draft_v2.pdf',
    type: 'pdf',
    size: '3.1 MB',
    status: 'indexed',
    uploadDate: 'Oct 24, 2023',
    conflictCount: 1,
    content: `INTERNAL AUDIT REPORT - FISCAL YEAR 2023 Q3
Prepared by: Office of Internal Comptroller
Section 3.1 Regional Breakdown & Revenue Adjustments
...operational expenditures exceeded forecasts by 18% in the EMEA region due to unforeseen supply chain disruptions. Consequently, the adjusted Q3 net revenue finalized at $14.2 Million. This represents a significant deviation from initial budget projections and required post-period reserves.`,
    sections: [
      {
        id: 'sec-audit-3.1',
        title: 'Section 3.1 - Regional Breakdown & Revenue Adjustments',
        pageOrLine: 'Page 14, Section 3.1',
        text: '...operational expenditures exceeded forecasts by 18% in the EMEA region due to unforeseen supply chain disruptions. Consequently, the adjusted Q3 net revenue finalized at $14.2 Million. This represents a significant deviation from initial...'
      }
    ]
  },
  {
    id: 'doc-7',
    name: 'Final_Shareholder_Report_2023.txt',
    type: 'txt',
    size: '1.8 MB',
    status: 'indexed',
    uploadDate: 'Oct 24, 2023',
    conflictCount: 1,
    content: `FINANCIAL SUMMARY - Q3 2023 SHAREHOLDER ANNUAL LETTER
-----------------------------
Gross Revenue: $22.4 Million
Operating Costs: $5.6 Million
Net Revenue: $16.8 Million

Growth remained steady across major markets with sustained expansion in North America and Asia-Pacific divisions. Operational cost controls delivered strong operating leverage.`,
    sections: [
      {
        id: 'sec-shareholder-fin',
        title: 'Financial Summary Q3',
        pageOrLine: 'Line 245',
        text: 'FINANCIAL SUMMARY - Q3 2023\n-----------------------------\nGross Revenue: $22.4 Million\nOperating Costs: $5.6 Million\nNet Revenue: $16.8 Million\n\nGrowth remained steady across major markets...'
      }
    ]
  },
  {
    id: 'doc-8',
    name: 'Merger_Agreement_Draft.pdf',
    type: 'pdf',
    size: '14.5 MB',
    status: 'parsing',
    statusText: 'Parsing Layout...',
    uploadDate: 'Oct 25, 2023',
    content: 'Draft merger documentation currently in vector pipeline extraction.'
  },
  {
    id: 'doc-9',
    name: 'Corrupted_Scan_001.pdf',
    type: 'pdf',
    size: '0 KB',
    status: 'error',
    statusText: 'OCR Failed - Unreadable Text',
    uploadDate: 'Oct 25, 2023',
    content: ''
  }
];

export const INITIAL_CONFLICTS: ConflictItem[] = [
  {
    id: 'conflict-q3-revenue',
    title: 'Discrepancy in Q3 Revenue Reporting',
    severity: 'critical',
    category: 'Financial Disclosures',
    description: 'Based on the analyzed financial disclosures, there is a direct contradiction regarding the reported Q3 net revenue.',
    docA: {
      docId: 'doc-6',
      docName: 'Internal_Audit_Draft_v2.pdf',
      reference: 'Page 14, Section 3.1',
      statement: 'Internal Audit Draft states that Q3 net revenue was $14.2 Million, citing unexpected operational costs in the EMEA region.',
      highlight: 'Q3 net revenue finalized at $14.2 Million',
      fullSnippet: `...operational expenditures exceeded forecasts by 18% in the EMEA region due to unforeseen supply chain disruptions. Consequently, the adjusted Q3 net revenue finalized at $14.2 Million. This represents a significant deviation from initial...`
    },
    docB: {
      docId: 'doc-7',
      docName: 'Final_Shareholder_Report_2023.txt',
      reference: 'Line 245',
      statement: 'Final Shareholder Report reports Q3 net revenue as $16.8 Million, with no mention of the EMEA operational costs.',
      highlight: 'Net Revenue: $16.8 Million',
      fullSnippet: `FINANCIAL SUMMARY - Q3 2023
-----------------------------
Gross Revenue: $22.4 Million
Operating Costs: $5.6 Million
Net Revenue: $16.8 Million

Growth remained steady across major markets...`
    },
    reconciliationNotes: 'The variance of $2.6M suggests an omission in the final shareholder report or an adjustment made post-audit. Please review the exact source extracts in the inspector panel to determine the correct figure.',
    citations: [
      {
        id: 'ref-1',
        label: 'Ref 1',
        docId: 'doc-6',
        docName: 'Internal_Audit_Draft_v2.pdf',
        section: 'Page 14, Section 3.1',
        exactSnippet: '...operational expenditures exceeded forecasts by 18% in the EMEA region... adjusted Q3 net revenue finalized at $14.2 Million.',
        highlightText: '$14.2 Million'
      },
      {
        id: 'ref-2',
        label: 'Ref 2',
        docId: 'doc-7',
        docName: 'Final_Shareholder_Report_2023.txt',
        section: 'Line 245',
        exactSnippet: 'Gross Revenue: $22.4 Million | Operating Costs: $5.6 Million | Net Revenue: $16.8 Million',
        highlightText: '$16.8 Million'
      }
    ],
    dateDetected: 'Oct 24, 2023 · 14:32 PM'
  },
  {
    id: 'conflict-cure-periods',
    title: 'Conflict Detected: Cure Periods',
    severity: 'critical',
    category: 'Vendor Agreements',
    description: 'Contradiction between immediate termination rights for data security breach vs mandatory 30-day cure period across vendor master agreements.',
    docA: {
      docId: 'doc-1',
      docName: 'Acme_MSA_2023.pdf',
      reference: 'Section 4.2',
      statement: 'Acme Corp Master Agreement specifies immediate termination without cure period for PII data breaches.',
      highlight: 'immediate termination without obligation of a cure period',
      fullSnippet: `4.2 Termination for Data Security Breach: In the event of an unmitigated breach of data security involving Personally Identifiable Information (PII) or confidential client telemetry, the Non-Breaching Party possesses the unilateral right of IMMEDIATE TERMINATION without obligation of a cure period.`
    },
    docB: {
      docId: 'doc-2',
      docName: 'TechFlow_SLA_v2.docx',
      reference: 'Section 8.1',
      statement: 'TechFlow SLA mandates a 30-day cure period for any breach, including security and data governance failures.',
      highlight: 'mandatory thirty (30) day cure period for any breach',
      fullSnippet: `8.1 Mandatory Cure Period: Prior to any declaration of contract forfeiture or termination for default, the non-defaulting party must furnish written notice detailing the violation. The defaulting party shall be granted a mandatory thirty (30) day cure period for any breach, including operational, technical, or data governance failures.`
    },
    reconciliationNotes: 'If both agreements govern the same vendor relationship or composite service, there is a legal ambiguity regarding the required cure period for data incidents.',
    citations: [
      {
        id: 'ref-doc-a',
        label: 'Doc A: §4.2',
        docId: 'doc-1',
        docName: 'Acme_MSA_2023.pdf',
        section: 'Section 4.2',
        exactSnippet: 'In the event of an unmitigated breach of data security... immediate termination without obligation of a cure period.',
        highlightText: 'immediate termination'
      },
      {
        id: 'ref-doc-b',
        label: 'Doc B: §8.1',
        docId: 'doc-2',
        docName: 'TechFlow_SLA_v2.docx',
        section: 'Section 8.1',
        exactSnippet: 'The defaulting party shall be granted a mandatory thirty (30) day cure period for any breach...',
        highlightText: 'thirty (30) day cure period'
      }
    ],
    dateDetected: 'Oct 24, 2023 · 11:15 AM'
  }
];

export const INITIAL_HISTORY: AnalysisHistoryItem[] = [
  {
    id: 'hist-1',
    timestamp: '2023-10-24T14:32:00Z',
    formattedDate: 'Oct 24, 2023 · 14:32 PM',
    query: 'What are the discrepancies in the Q3 revenue reporting between the internal audit and external filings?',
    summary: 'The internal audit reports Q3 revenue at $14.2M, citing delayed recognitions from the EMEA sector. However, the external filing lists Q3 revenue as $14.5M. The variance appears to stem from differing recognition timelines applied to the Project Alpha deliverables.',
    documentCount: 2,
    hasConflicts: true,
    status: 'conflicts',
    conflictId: 'conflict-q3-revenue',
    messages: [
      {
        id: 'm-1',
        sender: 'user',
        timestamp: '14:32 PM',
        content: 'What are the discrepancies in the Q3 revenue reporting between the internal audit and external filings?'
      },
      {
        id: 'm-2',
        sender: 'ai',
        timestamp: '14:32 PM',
        verified: true,
        reasoningSteps: [
          'Scanned 2 active documents for revenue disclosures: Internal_Audit_Draft_v2.pdf and Final_Shareholder_Report_2023.txt',
          'Identified Section 3.1 in Internal Audit specifying $14.2M net revenue after EMEA supply chain cost adjustments.',
          'Identified Line 245 in Shareholder Report specifying $16.8M net revenue.',
          'Detected critical numerical contradiction of $2.6M.'
        ],
        content: `Based on the analyzed financial disclosures, there is a direct contradiction regarding the reported Q3 net revenue.

In the **Internal Audit Draft**, Q3 net revenue is finalized at **$14.2 Million**, citing unexpected operational expenditures in the EMEA region [Ref 1].

Conversely, the **Final Shareholder Report** reports Q3 net revenue as **$16.8 Million**, without accounting for the EMEA operational cost adjustment [Ref 2].`,
        conflictNotice: {
          title: 'Critical Conflict Detected: Discrepancy in Q3 Revenue Reporting',
          description: 'Doc A states $14.2M net revenue while Doc B states $16.8M net revenue.',
          involvedDocs: ['Internal_Audit_Draft_v2.pdf', 'Final_Shareholder_Report_2023.txt'],
          conflictId: 'conflict-q3-revenue'
        },
        citations: [
          {
            id: 'c-1',
            label: 'Ref 1',
            docId: 'doc-6',
            docName: 'Internal_Audit_Draft_v2.pdf',
            section: 'Page 14, Section 3.1',
            exactSnippet: '...operational expenditures exceeded forecasts by 18% in the EMEA region due to unforeseen supply chain disruptions. Consequently, the adjusted Q3 net revenue finalized at $14.2 Million.',
            highlightText: '$14.2 Million'
          },
          {
            id: 'c-2',
            label: 'Ref 2',
            docId: 'doc-7',
            docName: 'Final_Shareholder_Report_2023.txt',
            section: 'Line 245',
            exactSnippet: 'FINANCIAL SUMMARY - Q3 2023\nGross Revenue: $22.4 Million\nOperating Costs: $5.6 Million\nNet Revenue: $16.8 Million',
            highlightText: '$16.8 Million'
          }
        ],
        activeSourceNames: ['Internal_Audit_Draft_v2.pdf', 'Final_Shareholder_Report_2023.txt']
      }
    ]
  },
  {
    id: 'hist-2',
    timestamp: '2023-10-22T09:15:00Z',
    formattedDate: 'Oct 22, 2023 · 09:15 AM',
    query: 'Verify compliance with Article 4 in the vendor agreement.',
    summary: "All clauses within Article 4 are consistent across the draft and final signed versions. The vendor's liability cap remains intact at $2M as stipulated in section 4.2.",
    documentCount: 1,
    hasConflicts: false,
    status: 'verified',
    messages: [
      {
        id: 'm-3',
        sender: 'user',
        timestamp: '09:15 AM',
        content: 'Verify compliance with Article 4 in the vendor agreement.'
      },
      {
        id: 'm-4',
        sender: 'ai',
        timestamp: '09:15 AM',
        verified: true,
        reasoningSteps: [
          'Evaluated Vendor_Security_Addendum.txt Article 4 compliance clauses.',
          'Cross-referenced liability limits with master terms.',
          'Confirmed liability limit is consistently set at $2,000,000.'
        ],
        content: `All clauses within Article 4 are consistent across the provided documents. 

The vendor's liability cap remains intact at **$2M** as stipulated in Section 4.2 [Doc C: §4.2]. No contradictory caps or conflicting indemnity waivers were found.`,
        citations: [
          {
            id: 'c-3',
            label: 'Doc C: §4.2',
            docId: 'doc-3',
            docName: 'Vendor_Security_Addendum.txt',
            section: 'Article 4, Section 4.2',
            exactSnippet: "Section 4.2 Vendor Liability Cap: The maximum aggregate liability for security negligence shall remain capped at $2,000,000 (Two Million US Dollars).",
            highlightText: '$2,000,000'
          }
        ],
        activeSourceNames: ['Vendor_Security_Addendum.txt']
      }
    ]
  }
];

export const INITIAL_TEAM_ANNOTATIONS: TeamAnnotation[] = [
  {
    id: 'ann-1',
    author: 'Elena Rostova',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzrpku5fw78xfdFVzEIFG7yFGvtr9gXSrJLW8PMM_uOwNPDPGDdO0ABfTUQDmh3VZYpKuLP7oX9FfXmS6zgOeNMfQQl34hvfyG_pbEXbKdalHvcuwuoWqOaw5olKAlQlgsAeZfzc8amXvVvK2PtgdprrMaHenXheBED4Q5dmoAbxuMh0VmYqYNaz_cBbogVDAbZOZUT30u8L_Ve6QAoZFBxJ9vXdYmmLgNioZ7-ScMQZS1DEv9fpgyeA',
    role: 'Principal Legal Counsel',
    timestamp: 'Today at 10:24 AM',
    targetRef: 'Conflict: Cure Periods',
    comment: 'Flagged for General Counsel review. We must insist on Acme MSA Section 4.2 prevailing over standard SLA cure clauses.',
    status: 'open'
  },
  {
    id: 'ann-2',
    author: 'Marcus Vance',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLD55c5SPLWPi2a_Fmx2vW89f1bkDFfyJn2rs59P2Q2z9QI13ohqAq62P30Qj5fXXliUZh267kBuZVjyE0gK8DtbF94YZOcYTux32eHrVczuSpW71MxtqnX2iwf1lzxHsSK4eMjJnerrcMrjPSuhcOTnHREuTY5_1Fn9ZIYkAJDzec2G6RlvphmDH5u9lObNHYDh2VZ78sD0_AL6Zg0PehQgUaOGjyrwrxPZ89WyXLHx06yu7s0FxpXQ',
    role: 'Lead Financial Auditor',
    timestamp: 'Yesterday at 4:18 PM',
    targetRef: 'Conflict: Q3 Revenue',
    comment: 'Confirmed with external audit firm: the $14.2M in Doc A includes the $2.6M EMEA supply chain write-down. Shareholder report was published before reconciliation.',
    status: 'resolved'
  }
];
