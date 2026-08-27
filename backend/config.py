import os
from dotenv import load_dotenv

load_dotenv()

# --- Gemini LLM ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
LLM_MODEL = os.getenv("LLM_MODEL", "gemini-3.6-flash")
LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.1"))  # Low temperature for factual, grounded answers

# --- Embedding Model (runs locally, no API key needed) ---
EMBEDDING_MODEL = "all-MiniLM-L6-v2"
EMBEDDING_DIMENSION = 384

# --- ChromaDB ---
CHROMA_PERSIST_DIR = os.path.join(os.path.dirname(__file__), "..", "chroma_data")
CHROMA_COLLECTION_NAME = "documents"

# --- Chunking ---
CHUNK_SIZE = 500          # characters per chunk
CHUNK_OVERLAP = 100       # overlap between consecutive chunks
MIN_CHUNK_LENGTH = 50     # discard chunks shorter than this

# --- Retrieval ---
TOP_K_RETRIEVAL = 10      # initial retrieval count
TOP_K_FINAL = 5           # after reranking
RELEVANCE_THRESHOLD = 0.3 # minimum cosine similarity to consider relevant
CONFIDENCE_HIGH = 0.55    # above this = high confidence
CONFIDENCE_MEDIUM = 0.40  # above this = medium, below = low

# --- File Upload ---
ALLOWED_EXTENSIONS = {".pdf", ".txt", ".md"}
MAX_FILE_SIZE_MB = 50
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")

# --- Conversation ---
MAX_CONVERSATION_HISTORY = 20  # max turns to keep in memory
