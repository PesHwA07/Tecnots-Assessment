// ========== State ==========
const state = {
    sessionId: null,
    documents: [],
    isQuerying: false,
};

// ========== DOM Elements ==========
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const fileUpload = $('#file-upload');
const uploadLabel = $('#upload-label');
const uploadOverlay = $('#upload-overlay');
const uploadStatus = $('#upload-status');
const documentList = $('#document-list');
const noDocsMessage = $('#no-docs-message');
const chatMessages = $('#chat-messages');
const welcomeMessage = $('#welcome-message');
const questionInput = $('#question-input');
const sendBtn = $('#send-btn');
const exportBtn = $('#export-btn');
const sidebarToggle = $('#sidebar-toggle');
const sidebar = $('#sidebar');
const statusBadge = $('#status-badge');

// ========== Init ==========
document.addEventListener('DOMContentLoaded', () => {
    loadDocuments();
    setupEventListeners();
});

function setupEventListeners() {
    fileUpload.addEventListener('change', handleFileUpload);
    sendBtn.addEventListener('click', handleSendQuestion);
    exportBtn.addEventListener('click', handleExport);
    sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('open'));

    // Auto-resize textarea and enable/disable send button
    questionInput.addEventListener('input', () => {
        questionInput.style.height = 'auto';
        questionInput.style.height = Math.min(questionInput.scrollHeight, 120) + 'px';
        sendBtn.disabled = questionInput.value.trim().length < 3;
    });

    // Enter to send (Shift+Enter for newline)
    questionInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!sendBtn.disabled && !state.isQuerying) {
                handleSendQuestion();
            }
        }
    });

    // Close sidebar on mobile when clicking outside
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
            if (!sidebar.contains(e.target) && e.target !== sidebarToggle) {
                sidebar.classList.remove('open');
            }
        }
    });
}

// ========== Document Management ==========

async function loadDocuments() {
    try {
        const res = await fetch('/api/documents');
        const data = await res.json();
        state.documents = data.documents || [];
        renderDocumentList();
    } catch (err) {
        console.error('Failed to load documents:', err);
    }
}

function renderDocumentList() {
    // Clear existing items (keep the empty state element)
    documentList.querySelectorAll('.doc-item').forEach(el => el.remove());

    if (state.documents.length === 0) {
        noDocsMessage.style.display = 'flex';
        return;
    }

    noDocsMessage.style.display = 'none';

    state.documents.forEach(doc => {
        const ext = doc.file_type.replace('.', '').toUpperCase();
        const item = document.createElement('div');
        item.className = 'doc-item';
        item.id = `doc-${doc.id}`;
        item.innerHTML = `
            <div class="doc-icon ${doc.file_type.replace('.', '')}">${ext}</div>
            <div class="doc-info">
                <div class="doc-name" title="${doc.filename}">${doc.filename}</div>
                <div class="doc-meta">${doc.chunk_count} chunks · ${doc.status}</div>
            </div>
            <button class="doc-remove" onclick="removeDocument('${doc.id}')" title="Remove document" aria-label="Remove ${doc.filename}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;
        documentList.appendChild(item);
    });
}

async function handleFileUpload(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    for (const file of files) {
        await uploadSingleFile(file);
    }

    // Reset input so same file can be re-uploaded
    fileUpload.value = '';
}

async function uploadSingleFile(file) {
    uploadOverlay.hidden = false;
    uploadStatus.textContent = `Processing ${file.name}...`;

    const formData = new FormData();
    formData.append('file', file);

    try {
        const res = await fetch('/api/documents', {
            method: 'POST',
            body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
            showToast(data.detail || 'Upload failed', 'error');
            return;
        }

        showToast(data.message, 'success');
        await loadDocuments();
    } catch (err) {
        showToast(`Failed to upload ${file.name}: ${err.message}`, 'error');
    } finally {
        uploadOverlay.hidden = true;
    }
}

async function removeDocument(docId) {
    const doc = state.documents.find(d => d.id === docId);
    if (!doc) return;

    try {
        const res = await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
        const data = await res.json();

        if (res.ok) {
            showToast(data.message, 'success');
            await loadDocuments();
        } else {
            showToast(data.detail || 'Failed to remove', 'error');
        }
    } catch (err) {
        showToast(`Error removing document: ${err.message}`, 'error');
    }
}

// ========== Chat / Query ==========

async function handleSendQuestion() {
    const question = questionInput.value.trim();
    if (question.length < 3 || state.isQuerying) return;

    // Hide welcome message
    if (welcomeMessage) welcomeMessage.style.display = 'none';

    // Add user message
    addMessage('user', question);

    // Clear input
    questionInput.value = '';
    questionInput.style.height = 'auto';
    sendBtn.disabled = true;
    state.isQuerying = true;
    statusBadge.textContent = 'Thinking...';
    statusBadge.style.background = 'var(--warning-bg)';
    statusBadge.style.color = 'var(--warning)';

    // Show typing indicator
    const typingId = showTypingIndicator();

    try {
        // Use streaming endpoint
        const res = await fetch('/api/query/stream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question: question,
                session_id: state.sessionId,
            }),
        });

        if (!res.ok) {
            const err = await res.json();
            removeTypingIndicator(typingId);
            addMessage('assistant', err.detail || 'An error occurred.', { confidence: 'low' });
            return;
        }

        // Remove typing indicator and create assistant message
        removeTypingIndicator(typingId);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let meta = null;
        let answerDiv = null;
        let fullAnswer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop(); // Keep incomplete line in buffer

            for (const line of lines) {
                if (!line.startsWith('data: ')) continue;
                const jsonStr = line.slice(6).trim();
                if (!jsonStr) continue;

                try {
                    const event = JSON.parse(jsonStr);

                    if (event.type === 'meta') {
                        meta = event;
                        state.sessionId = event.session_id;
                        // Create the answer container with metadata
                        answerDiv = createAssistantMessage(meta);
                    } else if (event.type === 'token' && answerDiv) {
                        fullAnswer += event.content;
                        const contentEl = answerDiv.querySelector('.answer-text');
                        if (contentEl) {
                            contentEl.innerHTML = formatAnswer(fullAnswer);
                        }
                        scrollToBottom();
                    } else if (event.type === 'done') {
                        // Handle conflict detection from backend
                        if (event.has_conflict && event.conflicts && event.conflicts.length > 0 && answerDiv) {
                            const conflictHtml = buildConflictBanner(event.conflicts);
                            const messageContent = answerDiv.querySelector('.message-content');
                            if (messageContent) {
                                const answerText = messageContent.querySelector('.answer-text');
                                if (answerText) {
                                    answerText.insertAdjacentHTML('beforebegin', conflictHtml);
                                }
                            }
                        }

                        // Apply highlighted spans to source passages
                        if (event.highlighted_spans && event.highlighted_spans.length > 0 && answerDiv) {
                            const sourcePassages = answerDiv.querySelectorAll('.source-passage');
                            sourcePassages.forEach(passageEl => {
                                let html = passageEl.innerHTML;
                                for (const span of event.highlighted_spans) {
                                    const escaped = escapeHtml(span);
                                    const regex = new RegExp(escapeRegex(escaped), 'gi');
                                    html = html.replace(regex, `<mark>${escaped}</mark>`);
                                }
                                passageEl.innerHTML = html;
                            });
                        }
                    }
                } catch (parseErr) {
                    // Skip malformed events
                }
            }
        }
    } catch (err) {
        removeTypingIndicator(typingId);

        if (err.message.includes('Failed to fetch')) {
            addMessage('assistant', 'Unable to connect to the server. Make sure the backend is running.', { confidence: 'low' });
        } else {
            addMessage('assistant', `Error: ${err.message}`, { confidence: 'low' });
        }
    } finally {
        state.isQuerying = false;
        statusBadge.textContent = 'Ready';
        statusBadge.style.background = 'var(--success-bg)';
        statusBadge.style.color = 'var(--success)';
    }
}

// ========== Message Rendering ==========

function addMessage(role, content, options = {}) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message message-${role}`;

    if (role === 'user') {
        msgDiv.innerHTML = `<div class="message-content">${escapeHtml(content)}</div>`;
    } else {
        const confidenceBadge = options.confidence
            ? `<span class="confidence-badge confidence-${options.confidence}">${options.confidence} confidence</span>`
            : '';

        msgDiv.innerHTML = `
            <div class="message-content">
                ${confidenceBadge}
                <div class="answer-text">${formatAnswer(content)}</div>
            </div>
        `;
    }

    chatMessages.appendChild(msgDiv);
    scrollToBottom();
    return msgDiv;
}

function createAssistantMessage(meta) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message message-assistant';

    // Confidence badge
    const confidenceBadge = meta.confidence
        ? `<span class="confidence-badge confidence-${meta.confidence}">${meta.confidence} confidence</span>`
        : '';

    // Rewritten query indicator
    const rewrittenHtml = meta.rewritten_query
        ? `<div class="rewritten-query">🔄 Interpreted as: "${escapeHtml(meta.rewritten_query)}"</div>`
        : '';

    let contentHtml = `
        <div class="message-content">
            ${rewrittenHtml}
            ${confidenceBadge}
            <div class="answer-text"></div>
        </div>
    `;

    // Source citations
    if (meta.sources && meta.sources.length > 0) {
        contentHtml += buildSourcesHtml(meta.sources);
    }

    msgDiv.innerHTML = contentHtml;
    chatMessages.appendChild(msgDiv);
    scrollToBottom();

    return msgDiv;
}

function buildSourcesHtml(sources) {
    const sourceCards = sources.map((s, i) => {
        let location = '';
        if (s.page_number) location += `Page ${s.page_number}`;
        if (s.section_heading) location += location ? ` · ${s.section_heading}` : s.section_heading;

        // Highlight spans in the passage
        let passageHtml = escapeHtml(s.passage);
        if (s.highlighted_spans) {
            for (const span of s.highlighted_spans) {
                const escaped = escapeHtml(span);
                const regex = new RegExp(escapeRegex(escaped), 'gi');
                passageHtml = passageHtml.replace(regex, `<mark>${escaped}</mark>`);
            }
        }

        const score = Math.round(s.relevance_score * 100);

        return `
            <div class="source-card">
                <div class="source-header">
                    <span class="source-doc">📄 ${escapeHtml(s.doc_name)}</span>
                    <span class="source-location">${location}</span>
                </div>
                <p class="source-passage">${passageHtml}</p>
                <div class="source-score">Relevance: ${score}%</div>
            </div>
        `;
    }).join('');

    const id = 'sources-' + Date.now();
    return `
        <div class="sources-section">
            <button class="sources-toggle" onclick="toggleSources('${id}', this)">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
                ${sources.length} source${sources.length > 1 ? 's' : ''} cited
            </button>
            <div class="sources-list" id="${id}">
                ${sourceCards}
            </div>
        </div>
    `;
}

function toggleSources(id, btn) {
    const list = document.getElementById(id);
    if (list) {
        list.classList.toggle('visible');
        btn.classList.toggle('expanded');
    }
}

function buildConflictBanner(conflicts) {
    const conflictItems = conflicts.map(c => {
        const docName = escapeHtml(c.doc_name || 'Unknown');
        const claim = escapeHtml(c.claim || '');
        const passage = c.passage ? escapeHtml(c.passage) : '';
        return `
            <div class="conflict-item">
                <strong>${docName}:</strong> ${claim}
                ${passage ? `<br><span style="color: var(--text-muted); font-size: 0.75rem;">"${passage}"</span>` : ''}
            </div>
        `;
    }).join('');

    return `
        <div class="conflict-banner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <div>
                <strong>⚠️ Sources Disagree</strong>
                <div style="margin-top: 6px; font-size: 0.78rem;">${conflictItems}</div>
            </div>
        </div>
    `;
}

function showTypingIndicator() {
    const id = 'typing-' + Date.now();
    const div = document.createElement('div');
    div.className = 'message message-assistant';
    div.id = id;
    div.innerHTML = `
        <div class="message-content">
            <div class="typing-indicator">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    chatMessages.appendChild(div);
    scrollToBottom();
    return id;
}

function removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

// ========== Export ==========

async function handleExport() {
    if (!state.sessionId) {
        showToast('No conversation to export yet.', 'error');
        return;
    }

    try {
        const res = await fetch(`/api/export/${state.sessionId}`);
        if (!res.ok) {
            const data = await res.json();
            showToast(data.detail || 'Export failed', 'error');
            return;
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `qa_session_${state.sessionId}.md`;
        a.click();
        URL.revokeObjectURL(url);

        showToast('Session exported successfully!', 'success');
    } catch (err) {
        showToast(`Export failed: ${err.message}`, 'error');
    }
}

// ========== Utilities ==========

function formatAnswer(text) {
    // Convert markdown-like formatting to HTML
    let html = escapeHtml(text);

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Line breaks → paragraphs
    html = html.replace(/\n\n+/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');

    // Wrap in paragraph if not already
    if (!html.startsWith('<p>')) html = '<p>' + html + '</p>';

    return html;
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showToast(message, type = 'error') {
    // Remove existing toasts
    document.querySelectorAll('.toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 4000);
}

// Make functions available globally for inline onclick handlers
window.removeDocument = removeDocument;
window.toggleSources = toggleSources;
