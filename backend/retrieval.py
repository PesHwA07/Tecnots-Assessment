from __future__ import annotations
from backend.ingestion import get_embedding_model, get_collection
from backend.models import SourceCitation
from backend.config import (
    TOP_K_RETRIEVAL, TOP_K_FINAL, RELEVANCE_THRESHOLD,
    CONFIDENCE_HIGH, CONFIDENCE_MEDIUM,
)


def retrieve_chunks(
    query: str,
    top_k: int = TOP_K_RETRIEVAL,
    scoped_document: str | None = None,
) -> list[dict]:
    """
    Retrieve the most relevant chunks for a query from ChromaDB.
    
    Args:
        query: The user's question (or rewritten standalone query).
        top_k: Number of chunks to retrieve.
        scoped_document: If set, restrict search to this document name only.
    
    Returns:
        List of dicts with keys: text, doc_name, page_number, section_heading,
        relevance_score, chunk_index.
    """
    model = get_embedding_model()
    collection = get_collection()

    # Check if collection has any documents
    if collection.count() == 0:
        return []

    query_embedding = model.encode([query], show_progress_bar=False).tolist()

    # Build query params
    query_params = {
        "query_embeddings": query_embedding,
        "n_results": min(top_k, collection.count()),
        "include": ["documents", "metadatas", "distances"],
    }

    # Scope to a specific document if requested
    if scoped_document:
        query_params["where"] = {"doc_name": scoped_document}

    try:
        results = collection.query(**query_params)
    except Exception:
        return []

    if not results["ids"] or not results["ids"][0]:
        return []

    # Parse results — ChromaDB returns cosine distance, convert to similarity
    chunks = []
    for i, doc_id in enumerate(results["ids"][0]):
        distance = results["distances"][0][i]
        # ChromaDB cosine distance: 0 = identical, 2 = opposite
        # Convert to similarity: 1 - (distance / 2)
        similarity = 1 - (distance / 2)

        metadata = results["metadatas"][0][i]
        chunks.append({
            "text": results["documents"][0][i],
            "doc_name": metadata.get("doc_name", "Unknown"),
            "page_number": metadata.get("page_number"),
            "section_heading": metadata.get("section_heading"),
            "chunk_index": metadata.get("chunk_index", 0),
            "relevance_score": round(similarity, 4),
            "doc_id": metadata.get("doc_id", ""),
        })

    # Sort by relevance (highest first)
    chunks.sort(key=lambda x: x["relevance_score"], reverse=True)

    return chunks


def filter_by_relevance(chunks: list[dict], threshold: float = RELEVANCE_THRESHOLD) -> list[dict]:
    """Remove chunks below the relevance threshold."""
    return [c for c in chunks if c["relevance_score"] >= threshold]


def calculate_confidence(chunks: list[dict]) -> str:
    """
    Determine confidence level based on retrieval scores.
    Uses the average score of the top chunks.
    """
    if not chunks:
        return "low"

    # Use top 3 scores for confidence calculation
    top_scores = [c["relevance_score"] for c in chunks[:3]]
    avg_score = sum(top_scores) / len(top_scores)

    if avg_score >= CONFIDENCE_HIGH:
        return "high"
    elif avg_score >= CONFIDENCE_MEDIUM:
        return "medium"
    else:
        return "low"


def chunks_to_citations(chunks: list[dict]) -> list[SourceCitation]:
    """Convert raw chunk dicts to SourceCitation models."""
    return [
        SourceCitation(
            doc_name=c["doc_name"],
            page_number=c.get("page_number"),
            section_heading=c.get("section_heading"),
            passage=c["text"],
            relevance_score=c["relevance_score"],
        )
        for c in chunks
    ]


def retrieve_and_rank(
    query: str,
    scoped_document: str | None = None,
) -> tuple[list[dict], str]:
    """
    Full retrieval pipeline: retrieve → filter → rank → calculate confidence.
    
    Returns:
        (chunks, confidence_level)
    """
    # Step 1: Retrieve top-k from vector store
    raw_chunks = retrieve_chunks(query, TOP_K_RETRIEVAL, scoped_document)

    if not raw_chunks:
        return [], "low"

    # Step 2: Filter by relevance threshold
    relevant_chunks = filter_by_relevance(raw_chunks)

    if not relevant_chunks:
        return [], "low"

    # Step 3: Take top-N final results
    final_chunks = relevant_chunks[:TOP_K_FINAL]

    # Step 4: Calculate confidence
    confidence = calculate_confidence(final_chunks)

    return final_chunks, confidence
