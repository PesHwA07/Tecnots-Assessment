from pydantic import BaseModel
from typing import Optional


class DocumentInfo(BaseModel):
    """Metadata for an uploaded document."""
    id: str
    filename: str
    file_type: str
    chunk_count: int
    status: str = "ready"


class ChunkMetadata(BaseModel):
    """Metadata attached to each text chunk in the vector store."""
    doc_id: str
    doc_name: str
    chunk_index: int
    page_number: Optional[int] = None       # PDF pages (1-indexed)
    section_heading: Optional[str] = None    # Markdown headings
    char_start: Optional[int] = None
    char_end: Optional[int] = None


class SourceCitation(BaseModel):
    """A single source reference in an answer."""
    doc_name: str
    page_number: Optional[int] = None
    section_heading: Optional[str] = None
    passage: str
    relevance_score: float
    highlighted_spans: list[str] = []  # exact phrases used in the answer


class ConflictInfo(BaseModel):
    """A detected conflict between sources."""
    claim: str
    doc_name: str
    passage: str


class QueryRequest(BaseModel):
    """Incoming question from the user."""
    question: str
    session_id: Optional[str] = None
    scoped_document: Optional[str] = None  # restrict to a specific document


class QueryResponse(BaseModel):
    """Full response to a user question."""
    answer: str
    sources: list[SourceCitation]
    has_conflict: bool = False
    conflicts: list[ConflictInfo] = []
    confidence: str = "medium"  # "high", "medium", "low"
    rewritten_query: Optional[str] = None  # the expanded follow-up query
    session_id: str = ""
