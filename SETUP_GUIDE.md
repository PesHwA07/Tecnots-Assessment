# 🚀 Corroborate — Setup & Run Guide

A step-by-step guide to get the AI Document Q&A Knowledge Assistant running on your machine.

---

## Option 1: Run Locally (Recommended)

### Step 1: Prerequisites

- **Python 3.10+** installed ([download](https://www.python.org/downloads/))
- **Git** installed ([download](https://git-scm.com/downloads))
- **Node.js 18+** installed *(only if you plan to modify the React frontend)* ([download](https://nodejs.org/))
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
docker build -t corroborate .
docker run -p 8000:8000 --env-file .env corroborate
```

### Step 4: Open the App

Navigate to **http://localhost:8000** in your browser.

---

## 🎯 How to Use the React Interface

The new Corroborate UI offers a multi-panel layout for advanced research:

### 1. Document Library (Upload)
- Navigate to the **Document Library** via the left sidebar.
- Click **"Upload Documents"** (or use the attach icon in the Research Hub).
- Select one or more files (PDF, TXT, or MD) or drag-and-drop them.
- Wait for the indexing process to complete. Documents will appear in the library and the "Active Sources" panel.

### 2. Research Hub (Ask Questions)
- Navigate to the **Research Hub**.
- Type your question in the chat input and press **Enter**.
- The AI will stream the answer in real-time, displaying its reasoning steps, confidence level, and source citations.

### 3. Verify Citations & Conflicts
- Click any **Source Chip** below an answer to open the **Source Inspector**. This highlights the exact extracted snippet in context.
- If the AI detects a contradiction between documents, a **Conflict Detected** banner will appear.
- Click **"Open Conflict Inspector"** to view the **Conflict Reports** tab, which displays the conflicting claims side-by-side.

### 4. Test Edge Cases
Try these scenarios to see the system's robustness:

| Test | What to Do |
|------|-----------|
| **No documents** | Ask a question before uploading anything. |
| **Follow-up question** | Ask "What is X?", then ask "How does it work?" |
| **Conflicting sources** | Upload two docs with different answers to the same question (e.g., one says 30 days, one says 60 days). |
| **Document Scoping** | Upload `Q3_Report.pdf` and `Q4_Report.pdf`. Ask: "What was the revenue according to Q3_Report?" |

### 5. Export Session
- Navigate to **Settings** (or use the export button in the sidebar).
- Choose **Export Session** to download the full Q&A conversation, citations, and conflict reports as a structured Markdown or JSON file.

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
| `GEMINI_API_KEY is not set` | Make sure `.env` exists and contains your key. |
| `ModuleNotFoundError` | Run `pip install -r requirements.txt` again. |
| Port 8000 already in use | Use `--port 8001` or kill the process on port 8000. |
| First query is slow | Normal — the embedding model loads into memory on first use (~10s). |
| React UI looks broken | Ensure the `frontend-dist/` directory exists. If not, cd to `corroborate/`, run `npm install`, then `npx vite build`. |
| Docker build fails | Ensure Docker Desktop is running and you have sufficient disk space. |
