import uuid
from backend.config import MAX_CONVERSATION_HISTORY


# In-memory session store: session_id → list of turns
_sessions: dict[str, list[dict]] = {}


def get_or_create_session(session_id: str | None = None) -> str:
    """Get an existing session or create a new one. Returns session_id."""
    if session_id and session_id in _sessions:
        return session_id
    new_id = session_id or str(uuid.uuid4())[:12]
    _sessions[new_id] = []
    return new_id


def get_conversation_history(session_id: str) -> list[dict]:
    """Get the conversation history for a session."""
    return _sessions.get(session_id, [])


def add_turn(session_id: str, question: str, answer: str, sources: list = None):
    """Add a question-answer turn to the session."""
    if session_id not in _sessions:
        _sessions[session_id] = []

    _sessions[session_id].append({
        "role": "user",
        "content": question,
    })
    _sessions[session_id].append({
        "role": "assistant",
        "content": answer,
        "sources": sources or [],
    })

    # Trim to max history
    if len(_sessions[session_id]) > MAX_CONVERSATION_HISTORY * 2:
        _sessions[session_id] = _sessions[session_id][-(MAX_CONVERSATION_HISTORY * 2):]


def build_coreference_prompt(session_id: str, new_question: str) -> str | None:
    """
    Build a prompt that asks the LLM to rewrite a follow-up question
    as a standalone query, resolving coreferences from conversation history.
    
    Returns None if there's no conversation history (no rewriting needed).
    """
    history = get_conversation_history(session_id)
    if not history:
        return None

    # Build conversation context (last few turns only)
    recent = history[-(6):]  # last 3 Q&A pairs
    conv_text = ""
    for turn in recent:
        role = "User" if turn["role"] == "user" else "Assistant"
        conv_text += f"{role}: {turn['content']}\n"

    prompt = f"""Given this conversation history:

{conv_text}

The user's latest message is: "{new_question}"

If the latest message is a follow-up that depends on previous context (e.g., uses pronouns like "it", "that", "they", or references like "the same", "and in...", "why is it different"), rewrite it as a COMPLETE, STANDALONE question that includes all necessary context from the conversation.

If the latest message is already a complete, standalone question, return it unchanged.

Return ONLY the rewritten question, nothing else. No explanations, no quotes."""

    return prompt


def format_history_for_export(session_id: str) -> list[dict]:
    """Format session history for export."""
    history = get_conversation_history(session_id)
    export = []
    for turn in history:
        entry = {
            "role": turn["role"],
            "content": turn["content"],
        }
        if turn.get("sources"):
            entry["sources"] = turn["sources"]
        export.append(entry)
    return export
