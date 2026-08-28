from __future__ import annotations
import os
import json
import tempfile
from datetime import datetime

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from backend.config import ALLOWED_EXTENSIONS, UPLOAD_DIR
from backend.models import QueryRequest, QueryResponse, SourceCitation, ConflictInfo
from backend.ingestion import (
    ingest_document, get_all_documents, get_document,
    remove_document, validate_file, get_collection,
    rebuild_document_registry,
)
from backend.retrieval import retrieve_and_rank, chunks_to_citations
from backend.generation import generate_answer, generate_answer_stream, rewrite_follow_up
from backend.conversation import (
    get_or_create_session, add_turn, format_history_for_export,
)

app = FastAPI(title="AI Document Q&A Assistant", version="1.0.0")

# CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.on_event("startup")
async def startup_event():
    """Rebuild document registry from ChromaDB on server start."""
    rebuild_document_registry()


# ========== Document Routes ==========

@app.post("/api/documents")
async def upload_document(file: UploadFile = File(...)):
    """Upload and ingest a document (PDF, TXT, or MD)."""
    # Validate file
    content = await file.read()
    error = validate_file(file.filename, len(content))
    if error:
        raise HTTPException(status_code=400, detail=error)

    # Save to temp file for processing
    ext = os.path.splitext(file.filename)[1].lower()
    tmp_path = os.path.join(UPLOAD_DIR, f"upload_{file.filename}")
    try:
        with open(tmp_path, "wb") as f:
            f.write(content)

        # Run ingestion pipeline in a threadpool to prevent blocking the event loop
        import asyncio
        doc_info = await asyncio.to_thread(ingest_document, tmp_path, file.filename)
        
        return {
            "status": "success",
            "message": f"'{file.filename}' uploaded and indexed successfully ({doc_info.chunk_count} chunks created).",
            "document": doc_info.model_dump(),
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")
    finally:
        # Clean up temp file
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


@app.get("/api/documents")
async def list_documents():
    """List all uploaded documents."""
    docs = get_all_documents()
    return {"documents": [d.model_dump() for d in docs]}


@app.delete("/api/documents/{doc_id}")
async def delete_document(doc_id: str):
    """Remove a document and its chunks from the index."""
    doc = get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    
    success = remove_document(doc_id)
    if success:
        return {"status": "success", "message": f"'{doc.filename}' removed successfully."}
    else:
        raise HTTPException(status_code=500, detail="Failed to remove document.")


# ========== Query Routes ==========

@app.post("/api/query")
async def query_documents(request: QueryRequest):
    """Ask a question about the uploaded documents."""
    # Edge case: empty or too-short question
    question = request.question.strip()
    if len(question) < 3:
        raise HTTPException(
            status_code=400,
            detail="Please ask a complete question (at least 3 characters).",
        )

    # Edge case: no documents uploaded
    collection = get_collection()
    if collection.count() == 0:
        raise HTTPException(
            status_code=400,
            detail="No documents have been uploaded yet. Please upload at least one document before asking questions.",
        )

    # Get or create session for conversation tracking
    session_id = get_or_create_session(request.session_id)

    # Resolve document scoping
    scoped_doc = request.scoped_document
    if scoped_doc:
        # Check if the scoped document exists
        docs = get_all_documents()
        doc_names = [d.filename for d in docs]
        if scoped_doc not in doc_names:
            # Try fuzzy match
            matches = [n for n in doc_names if scoped_doc.lower() in n.lower()]
            if matches:
                scoped_doc = matches[0]
            else:
                raise HTTPException(
                    status_code=400,
                    detail=f"Document '{scoped_doc}' not found. Available documents: {', '.join(doc_names)}",
                )

    # Step 1: Rewrite follow-up questions for coreference resolution
    rewritten_query = rewrite_follow_up(session_id, question)

    # Step 2: Detect document scoping from the query text
    if not scoped_doc:
        scoped_doc = _detect_document_scope(rewritten_query)

    # Step 3: Retrieve relevant chunks
    chunks, confidence = retrieve_and_rank(rewritten_query, scoped_doc)

    # Step 4: Generate grounded answer
    llm_result = generate_answer(rewritten_query, chunks, confidence, session_id)

    # Step 5: Build citations
    citations = chunks_to_citations(chunks)

    # Apply highlighted spans from LLM to citations
    if llm_result.get("highlighted_spans"):
        for citation in citations:
            for span in llm_result["highlighted_spans"]:
                if span.lower() in citation.passage.lower():
                    citation.highlighted_spans.append(span)

    # Build conflicts
    conflicts = []
    if llm_result.get("has_conflict") and llm_result.get("conflicts"):
        for c in llm_result["conflicts"]:
            conflicts.append(ConflictInfo(
                claim=c.get("claim", ""),
                doc_name=c.get("doc_name", ""),
                passage=c.get("passage", ""),
            ))

    # Adjust confidence if answer is not found
    if not llm_result.get("answerable", True):
        confidence = "low"

    # Step 6: Save turn to conversation history
    sources_for_history = [
        {"doc_name": c.doc_name, "page": c.page_number, "passage": c.passage[:200]}
        for c in citations
    ]
    add_turn(session_id, question, llm_result["answer"], sources_for_history)

    return QueryResponse(
        answer=llm_result["answer"],
        sources=citations,
        has_conflict=llm_result.get("has_conflict", False),
        conflicts=conflicts,
        confidence=confidence,
        rewritten_query=rewritten_query if rewritten_query != question else None,
        session_id=session_id,
    ).model_dump()


@app.post("/api/query/stream")
async def query_documents_stream(request: QueryRequest):
    """Stream an answer token-by-token via Server-Sent Events."""
    question = request.question.strip()
    if len(question) < 3:
        raise HTTPException(status_code=400, detail="Please ask a complete question.")

    collection = get_collection()
    if collection.count() == 0:
        raise HTTPException(status_code=400, detail="No documents uploaded yet.")

    session_id = get_or_create_session(request.session_id)
    rewritten_query = rewrite_follow_up(session_id, question)

    scoped_doc = request.scoped_document or _detect_document_scope(rewritten_query)
    chunks, confidence = retrieve_and_rank(rewritten_query, scoped_doc)
    citations = chunks_to_citations(chunks)

    def event_stream():
        full_answer = ""

        # Send metadata first
        meta = {
            "type": "meta",
            "confidence": confidence,
            "sources": [c.model_dump() for c in citations],
            "session_id": session_id,
            "rewritten_query": rewritten_query if rewritten_query != question else None,
        }
        yield f"data: {json.dumps(meta)}\n\n"

        # Stream answer tokens
        for token in generate_answer_stream(rewritten_query, chunks, confidence, session_id):
            full_answer += token
            yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"

        # Save to history after streaming completes
        sources_for_history = [
            {"doc_name": c.doc_name, "page": c.page_number, "passage": c.passage[:200]}
            for c in citations
        ]
        add_turn(session_id, question, full_answer, sources_for_history)

        # --- Post-stream structured analysis ---
        # Run the structured (non-streaming) LLM call to extract:
        # 1. Conflict detection (has_conflict, conflicts)
        # 2. Highlighted spans for source citation highlighting
        has_conflict = False
        conflicts = []
        highlighted_spans = []

        if chunks:
            try:
                structured_result = generate_answer(rewritten_query, chunks, confidence, session_id)
                has_conflict = structured_result.get("has_conflict", False)
                conflicts = structured_result.get("conflicts", []) if has_conflict else []
                highlighted_spans = structured_result.get("highlighted_spans", [])
            except Exception:
                # If structured call fails, fall back to text-based conflict detection
                conflict_markers = ["⚠️", "sources disagree", "conflicting", "contradiction"]
                answer_lower = full_answer.lower()
                has_conflict = any(marker in answer_lower for marker in conflict_markers)

        done_event = {
            "type": "done",
            "has_conflict": has_conflict,
            "conflicts": conflicts,
            "highlighted_spans": highlighted_spans,
        }
        yield f"data: {json.dumps(done_event)}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.get("/api/export/{session_id}")
async def export_conversation(session_id: str):
    """Export a conversation session as a Markdown file."""
    history = format_history_for_export(session_id)
    if not history:
        raise HTTPException(status_code=404, detail="Session not found or empty.")

    # Build markdown
    md_lines = [f"# Q&A Session Export", f"**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M')}\n"]

    turn_num = 0
    for entry in history:
        if entry["role"] == "user":
            turn_num += 1
            md_lines.append(f"\n## Question {turn_num}")
            md_lines.append(f"**Q:** {entry['content']}\n")
        else:
            md_lines.append(f"**A:** {entry['content']}\n")
            if entry.get("sources"):
                md_lines.append("**Sources:**")
                for s in entry["sources"]:
                    src_label = s.get("doc_name", "Unknown")
                    if s.get("page"):
                        src_label += f", Page {s['page']}"
                    md_lines.append(f"- {src_label}")
                    if s.get("passage"):
                        md_lines.append(f"  > {s['passage'][:300]}")
                md_lines.append("")

    content = "\n".join(md_lines)

    return StreamingResponse(
        iter([content]),
        media_type="text/markdown",
        headers={"Content-Disposition": f"attachment; filename=qa_session_{session_id}.md"},
    )


# ========== Helper Functions ==========

def _detect_document_scope(query: str) -> str | None:
    """
    Try to detect if the user's query references a specific document.
    Looks for patterns like "in document X", "from X", "in X only".
    """
    docs = get_all_documents()
    if not docs:
        return None

    query_lower = query.lower()

    # Check for explicit scoping phrases
    scope_patterns = [
        r"(?:in|from|using|according to)\s+(?:the\s+)?(?:document\s+)?['\"]?(.+?)['\"]?\s+(?:only|specifically|exclusively)",
        r"(?:in|from)\s+(?:the\s+)?['\"]?(.+?)['\"]?\s*(?:,|$|\?)",
        r"(?:only\s+(?:in|from))\s+['\"]?(.+?)['\"]?",
    ]

    for doc in docs:
        doc_name_lower = doc.filename.lower()
        doc_base = os.path.splitext(doc_name_lower)[0]

        # Direct filename mention
        if doc_name_lower in query_lower or doc_base in query_lower:
            return doc.filename

    return None


# ========== Static Files & Frontend ==========

# Prefer the new React build if it exists, fallback to vanilla frontend
_base_dir = os.path.dirname(__file__)
react_dist_dir = os.path.join(_base_dir, "..", "frontend-dist")

# Serve React build assets (JS, CSS, etc.)
react_assets_dir = os.path.join(react_dist_dir, "assets")
if os.path.exists(react_assets_dir):
    app.mount("/assets", StaticFiles(directory=react_assets_dir), name="assets")

@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    """Serve React SPA — all non-API routes return index.html."""
    # Try to serve the exact file first
    file_path = os.path.join(react_dist_dir, full_path)
    if full_path and os.path.isfile(file_path):
        return FileResponse(file_path)
    # Otherwise return index.html for client-side routing
    index_path = os.path.join(react_dist_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "Corroborate API is running. Frontend not built yet."}
