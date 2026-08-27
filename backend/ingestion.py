import os
import re
import uuid
from pypdf import PdfReader
import chromadb
from sentence_transformers import SentenceTransformer

from backend.config import (
    EMBEDDING_MODEL, CHROMA_PERSIST_DIR, CHROMA_COLLECTION_NAME,
    CHUNK_SIZE, CHUNK_OVERLAP, MIN_CHUNK_LENGTH, ALLOWED_EXTENSIONS,
    MAX_FILE_SIZE_MB,
)
from backend.models import DocumentInfo, ChunkMetadata

# --- Singleton instances (loaded once, reused) ---
_embedding_model: SentenceTransformer | None = None
_chroma_client: chromadb.PersistentClient | None = None


def get_embedding_model() -> SentenceTransformer:
    """Load embedding model once and cache it."""
    global _embedding_model
    if _embedding_model is None:
        _embedding_model = SentenceTransformer(EMBEDDING_MODEL)
    return _embedding_model


def get_chroma_client() -> chromadb.PersistentClient:
    """Get or create the ChromaDB persistent client."""
    global _chroma_client
    if _chroma_client is None:
        os.makedirs(CHROMA_PERSIST_DIR, exist_ok=True)
        _chroma_client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
    return _chroma_client


def get_collection() -> chromadb.Collection:
    """Get or create the document collection."""
    client = get_chroma_client()
    return client.get_or_create_collection(
        name=CHROMA_COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )


# ========== Document Store (in-memory registry) ==========

_documents: dict[str, DocumentInfo] = {}


def get_all_documents() -> list[DocumentInfo]:
    return list(_documents.values())


def get_document(doc_id: str) -> DocumentInfo | None:
    return _documents.get(doc_id)


def remove_document(doc_id: str) -> bool:
    """Remove a document and all its chunks from the vector store."""
    if doc_id not in _documents:
        return False
    collection = get_collection()
    # Delete all chunks belonging to this document
    try:
        results = collection.get(where={"doc_id": doc_id})
        if results["ids"]:
            collection.delete(ids=results["ids"])
    except Exception:
        pass
    del _documents[doc_id]
    return True


# ========== Text Extraction ==========

def extract_text_from_pdf(file_path: str) -> list[dict]:
    """Extract text from PDF, returning a list of {page, text} dicts."""
    pages = []
    reader = PdfReader(file_path)
    for page_num, page in enumerate(reader.pages):
        text = page.extract_text()
        if text and text.strip():
            pages.append({"page": page_num + 1, "text": text.strip()})
    return pages


def extract_text_from_txt(file_path: str) -> list[dict]:
    """Extract text from a plain text file."""
    with open(file_path, "r", encoding="utf-8", errors="replace") as f:
        text = f.read()
    if not text.strip():
        return []
    return [{"page": None, "text": text.strip()}]


def extract_text_from_md(file_path: str) -> list[dict]:
    """Extract text from markdown, preserving section headings."""
    with open(file_path, "r", encoding="utf-8", errors="replace") as f:
        text = f.read()
    if not text.strip():
        return []
    return [{"page": None, "text": text.strip()}]


def extract_text(file_path: str, file_type: str) -> list[dict]:
    """Route to the correct extractor based on file type."""
    if file_type == ".pdf":
        return extract_text_from_pdf(file_path)
    elif file_type == ".txt":
        return extract_text_from_txt(file_path)
    elif file_type == ".md":
        return extract_text_from_md(file_path)
    else:
        raise ValueError(f"Unsupported file type: {file_type}")


# ========== Chunking ==========

def _detect_md_heading(line: str) -> str | None:
    """Detect markdown heading from a line."""
    match = re.match(r"^(#{1,6})\s+(.+)", line)
    if match:
        return match.group(2).strip()
    return None


def chunk_text_with_metadata(
    text: str,
    doc_name: str,
    doc_id: str,
    page_number: int | None = None,
    file_type: str = ".txt",
) -> list[dict]:
    """
    Split text into overlapping chunks, preserving metadata.
    
    For markdown files, tracks the most recent heading as section context.
    Uses paragraph-aware splitting: prefers splitting on blank lines,
    falls back to sentence boundaries, then hard character limit.
    """
    chunks = []
    current_heading = None

    # Split into paragraphs first (respect blank lines)
    if file_type == ".md":
        paragraphs = re.split(r"\n\s*\n", text)
    else:
        paragraphs = re.split(r"\n\s*\n", text)

    # Build chunks from paragraphs with overlap
    current_chunk = ""
    prev_paragraph = ""
    chunk_index = len(chunks)

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue

        # Track markdown headings
        if file_type == ".md":
            lines = para.split("\n")
            for line in lines:
                heading = _detect_md_heading(line)
                if heading:
                    current_heading = heading

        # If adding this paragraph would exceed chunk size, finalize current chunk
        if current_chunk and len(current_chunk) + len(para) + 2 > CHUNK_SIZE:
            if len(current_chunk.strip()) >= MIN_CHUNK_LENGTH:
                chunks.append({
                    "text": current_chunk.strip(),
                    "doc_id": doc_id,
                    "doc_name": doc_name,
                    "chunk_index": chunk_index,
                    "page_number": page_number,
                    "section_heading": current_heading,
                })
                chunk_index += 1

            # Start new chunk with overlap (repeat last paragraph)
            current_chunk = prev_paragraph + "\n\n" + para if prev_paragraph else para
        else:
            current_chunk = current_chunk + "\n\n" + para if current_chunk else para

        prev_paragraph = para

    # Don't forget the last chunk
    if current_chunk.strip() and len(current_chunk.strip()) >= MIN_CHUNK_LENGTH:
        chunks.append({
            "text": current_chunk.strip(),
            "doc_id": doc_id,
            "doc_name": doc_name,
            "chunk_index": chunk_index,
            "page_number": page_number,
            "section_heading": current_heading,
        })

    return chunks


def chunk_document(pages: list[dict], doc_name: str, doc_id: str, file_type: str) -> list[dict]:
    """Chunk all pages/sections of a document."""
    all_chunks = []
    for page_data in pages:
        page_chunks = chunk_text_with_metadata(
            text=page_data["text"],
            doc_name=doc_name,
            doc_id=doc_id,
            page_number=page_data.get("page"),
            file_type=file_type,
        )
        all_chunks.extend(page_chunks)

    # Re-index chunks sequentially across the whole document
    for i, chunk in enumerate(all_chunks):
        chunk["chunk_index"] = i

    return all_chunks


# ========== Embedding & Indexing ==========

def embed_and_index(chunks: list[dict]) -> int:
    """Embed chunks and add them to ChromaDB. Returns count of indexed chunks."""
    if not chunks:
        return 0

    model = get_embedding_model()
    collection = get_collection()

    texts = [c["text"] for c in chunks]
    embeddings = model.encode(texts, show_progress_bar=False).tolist()

    ids = [f"{c['doc_id']}_{c['chunk_index']}" for c in chunks]
    metadatas = []
    for c in chunks:
        meta = {
            "doc_id": c["doc_id"],
            "doc_name": c["doc_name"],
            "chunk_index": c["chunk_index"],
        }
        if c.get("page_number") is not None:
            meta["page_number"] = c["page_number"]
        if c.get("section_heading") is not None:
            meta["section_heading"] = c["section_heading"]
        metadatas.append(meta)

    collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=texts,
        metadatas=metadatas,
    )

    return len(chunks)


# ========== Main Ingestion Pipeline ==========

def validate_file(filename: str, file_size: int) -> str | None:
    """
    Validate file before processing.
    Returns error message if invalid, None if valid.
    """
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return f"Unsupported file type '{ext}'. Please upload PDF, TXT, or MD files."
    if file_size == 0:
        return "The uploaded file is empty."
    if file_size > MAX_FILE_SIZE_MB * 1024 * 1024:
        return f"File exceeds the {MAX_FILE_SIZE_MB}MB size limit."
    return None


def ingest_document(file_path: str, original_filename: str) -> DocumentInfo:
    """
    Full ingestion pipeline: validate → extract → chunk → embed → index.
    Returns DocumentInfo on success, raises ValueError on failure.
    """
    ext = os.path.splitext(original_filename)[1].lower()
    doc_id = str(uuid.uuid4())[:8]

    # Extract text
    try:
        pages = extract_text(file_path, ext)
    except Exception as e:
        raise ValueError(f"Failed to read '{original_filename}': the file may be corrupted or unreadable. ({str(e)})")

    if not pages or all(not p["text"].strip() for p in pages):
        raise ValueError(f"'{original_filename}' appears to be empty or contains no extractable text.")

    # Chunk
    chunks = chunk_document(pages, original_filename, doc_id, ext)
    if not chunks:
        raise ValueError(f"'{original_filename}' produced no usable text chunks after processing.")

    # Embed and index
    count = embed_and_index(chunks)

    # Register document
    doc_info = DocumentInfo(
        id=doc_id,
        filename=original_filename,
        file_type=ext,
        chunk_count=count,
        status="ready",
    )
    _documents[doc_id] = doc_info

    return doc_info
