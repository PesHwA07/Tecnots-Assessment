# 🚀 DocuMind — Setup & Run Guide

A step-by-step guide to get the AI Document Q&A Knowledge Assistant running on your machine.

---

## Option 1: Run Locally (Recommended)

### Step 1: Prerequisites

- **Python 3.10+** installed ([download](https://www.python.org/downloads/))
- **Git** installed ([download](https://git-scm.com/downloads))
- A **Gemini API key** (free, no credit card) — get one at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

### Step 2: Clone the Repository

```bash
git clone https://github.com/PesHwA07/Tecnots-Assessment.git
cd Tecnots-Assessment
```

### Step 3: Create Virtual Environment

**Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**macOS / Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 4: Install Dependencies

```bash
pip install -r requirements.txt
```

> ⏳ First install takes ~2 minutes (downloads the embedding model ~80MB on first run).

### Step 5: Configure API Key

```bash
# Copy the example env file
# Windows:
copy .env.example .env
# macOS/Linux:
cp .env.example .env
```

Open `.env` in any text editor and replace the placeholder:

```
GEMINI_API_KEY=your_actual_api_key_here
```

### Step 6: Start the Server

```bash
uvicorn backend.main:app --reload --port 8000
```

### Step 7: Open the App

Navigate to **http://localhost:8000** in your browser.

> 💡 The first query may take ~10 seconds while the embedding model loads into memory. Subsequent queries are fast.

---

## Option 2: Run with Docker

### Step 1: Prerequisites

- **Docker** installed ([download](https://www.docker.com/products/docker-desktop/))
- A **Gemini API key** (see above)

### Step 2: Clone & Configure

```bash
git clone https://github.com/PesHwA07/Tecnots-Assessment.git
cd Tecnots-Assessment

# Create .env file
# Windows:
copy .env.example .env
# macOS/Linux:
cp .env.example .env

# Edit .env and add your Gemini API key
```

### Step 3: Build & Run

```bash
docker build -t documind .
docker run -p 8000:8000 --env-file .env documind
```

### Step 4: Open the App

Navigate to **http://localhost:8000** in your browser.

---

## 🎯 How to Use

### 1. Upload Documents
- Click **"Upload Documents"** in the sidebar
- Select one or more files (PDF, TXT, or MD)
- Wait for processing to complete

### 2. Ask Questions
- Type your question in the chat input
- Press **Enter** or click the send button
- The answer streams in real-time with source citations

### 3. Explore Sources
- Click **"X sources cited"** to expand source passages
- Each source shows the document name, page number, and relevant text
- Key phrases are highlighted with a purple accent

### 4. Test Edge Cases
Try these to see the system's robustness:

| Test | What to Do |
|------|-----------|
| **No documents** | Ask a question before uploading anything |
| **Out-of-scope question** | Upload a tech doc, then ask about cooking |
| **Follow-up question** | Ask "What is X?", then ask "How does it work?" |
| **Conflicting sources** | Upload two docs with different answers to the same question |
| **Empty file** | Try uploading an empty PDF |
| **Short question** | Type just "hi" (send button stays disabled) |

### 5. Export Session
- Click **"Export Session"** in the sidebar to download the full Q&A as Markdown

---

## ⚙️ Configuration (Optional)

All settings can be overridden via environment variables in `.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `GEMINI_API_KEY` | *(required)* | Your Google Gemini API key |
| `LLM_MODEL` | `gemini-3.6-flash` | Gemini model to use |
| `LLM_TEMPERATURE` | `0.1` | Lower = more factual, higher = more creative |

---

## 🛑 Troubleshooting

| Problem | Solution |
|---------|----------|
| `GEMINI_API_KEY is not set` | Make sure `.env` exists and contains your key |
| `ModuleNotFoundError` | Run `pip install -r requirements.txt` again |
| Port 8000 already in use | Use `--port 8001` or kill the process on 8000 |
| First query is slow | Normal — embedding model loads on first use (~10s) |
| Docker build fails | Ensure Docker Desktop is running |
