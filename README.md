# DevFest Lagos 2026 — Building a Trustworthy AI Agent for Election Intelligence with ADK and the Antigravity Harness

[![Google ADK](https://img.shields.io/badge/Google_ADK-2.14.0-10b981?style=flat-square)](https://google.github.io/adk-docs/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.162+-3b82f6?style=flat-square)](https://fastapi.tiangolo.com/)
[![DevFest Lagos 2026](https://img.shields.io/badge/DevFest_Lagos-2026_Workshop-f59e0b?style=flat-square)](https://devfest-lagos-election-agent-2026.web.app)

A flagship 60-minute hands-on workshop and production-ready **Multi-Agent Election Intelligence Application** built with **Google's Agent Development Kit (`google-adk`)** and engineered inside the **Antigravity Harness**.

---

## 🌐 Live Workshop Links

| Resource | Public URL |
|---|---|
| **🛡️ Live Election Intelligence App (Firebase Hosting)** | **[https://devfest-lagos-election-agent-2026.web.app](https://devfest-lagos-election-agent-2026.web.app)** |
| **⚡ Live ADK 2 + Gemini Cloud Run Backend & UI** | **[https://devfest-lagos-election-agent-1084480045730.us-central1.run.app](https://devfest-lagos-election-agent-1084480045730.us-central1.run.app)** |
| **📘 Interactive 40-Minute Hands-on Codelab** | **[https://devfest-lagos-election-agent-2026.web.app/codelab/](https://devfest-lagos-election-agent-2026.web.app/codelab/)** |
| **🎤 Speaker Slide Deck Content Guide** | **[`SLIDE_DECK_CONTENT.md`](./SLIDE_DECK_CONTENT.md)** |
| **💻 GitHub Source Repository** | **[https://github.com/gabbyagbobli/devfest-lagos-election-intelligence](https://github.com/gabbyagbobli/devfest-lagos-election-intelligence)** |

---

## 🎯 What This Project Does

As elections approach, citizens, journalists, and observers increasingly rely on digital platforms and AI assistants for information about **voting procedures, PVC collection deadlines, BVAS accreditation rules, official announcements, and viral claims**. Standard chatbots often hallucinate dates, fabricate citations, or confuse **retrieval** (finding a statement online) with **verification** (evaluating source authority and corroborating evidence).

This application demonstrates how **agentic AI built with Google ADK** solves this problem through:
1. **Election Information Retrieval** from a verified corpus (`data/election_corpus.json`).
2. **Three-Tier Source Trust Grounding** (`data/trusted_sources.json`: Tier 1 Statutory/INEC `0.98`, Tier 2 Accredited Observers & Fact-Checkers `0.90`, Tier 3 Verified Media `0.78`).
3. **Evidentiary Claim Verification** (`SUPPORTED`, `CONTRADICTED`, or `INSUFFICIENT_EVIDENCE`).
4. **Summarization of Official Announcements** and statutory deadlines.
5. **Multi-Source Comparison** across official institutions, civic observers, and newsrooms.
6. **Strict Source Attribution** (`[doc_id]`, organization name, publication date, and official URL).
7. **Transparent Communication of Uncertainty** when evidence is incomplete or unverified.
8. **Multi-Agent Collaboration & Orchestration** via Google ADK (`Agent`, `FunctionTool`, `sub_agents`, and `Runner`).

---

## 🏗️ Multi-Agent Architecture (`google-adk`)

```text
                        ┌──────────────────────────────────────────────┐
                        │               User Query / Claim             │
                        └──────────────────────┬───────────────────────┘
                                               │
                                               ▼
                ┌──────────────────────────────────────────────────────────────┐
                │        A. Election Intelligence Coordinator (root_agent)     │
                │  • Understands user intent & routes to specialist sub-agents │
                │  • Enforces epistemic humility & uncertainty indicators      │
                └──────┬───────────────────────┬────────────────────────┬──────┘
                       │                       │                        │
         Delegates     │         Delegates     │          Delegates     │
         Procedures    ▼         Rumors/Claims ▼          Summaries     ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐ ┌──────────────────────────────┐
│  B. Election Research Agent  │ │  C. Claim Verification Agent │ │ D. Election Info Analyst     │
│  • Official rules & lookup   │ │  • Evaluates claims vs facts │ │ • Summarizes announcements   │
│  • Allowlist trust checks    │ │  • SUPPORTED / CONTRADICTED  │ │ • Compares Tier 1-3 sources  │
│                              │ │    / INSUFFICIENT_EVIDENCE   │ │ • Extracts key dates         │
└──────────────┬───────────────┘ └──────────────┬───────────────┘ └──────────────┬───────────────┘
               │                                │                                │
               └────────────────────────────────┼────────────────────────────────┘
                                                ▼
                ┌──────────────────────────────────────────────────────────────┐
                │         ADK Function Tools & 3-Tier Trust Registry           │
                │  • search_verified_election_corpus()                         │
                │  • check_source_credibility()                                │
                │  • verify_election_claim()                                   │
                │  • get_official_announcements()                              │
                │  • compare_multi_source_coverage()                           │
                │  • fetch_allowlisted_web_source()                            │
                └──────────────────────────────────────────────────────────────┘
```

---

## 📂 Repository Structure

```text
devfest-lagos-election-intelligence/
├── app/
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── coordinator.py          # A. Election Intelligence Coordinator (root_agent)
│   │   └── specialists.py          # B. Research, C. Verification & D. Analyst Agents
│   ├── tools/
│   │   ├── __init__.py
│   │   └── election_tools.py       # 6 Custom ADK Function Tools + Allowlist Guardrails
│   ├── election_intelligence/      # ADK CLI Package (`adk run` & `adk web` discovery)
│   │   ├── __init__.py
│   │   ├── agent.py
│   │   ├── specialists.py
│   │   └── tools.py
│   ├── orchestrator.py             # ADK 2 Live Runner + Grounded Fallback Engine
│   ├── main.py                     # FastAPI Server & REST Endpoints
│   └── static/                     # Election Intelligence Trust Dashboard UI
│       ├── index.html
│       ├── styles.css
│       └── app.js
├── codelab/
│   ├── index.md                    # Google Codelabs (claat) Markdown Source
│   └── index.html                  # Interactive Solace-Style Codelab Web App
├── slides/
│   ├── slides.md                   # 10-Minute Opening Presentation Markdown
│   └── index.html                  # Interactive Full-Screen Conference Slide Deck
├── data/
│   ├── election_corpus.json        # 9 Verified Tier 1–3 Electoral Documents
│   └── trusted_sources.json        # 3-Tier Electoral Source Trust Registry
├── tests/
│   └── test_election_agent.py      # Pytest Verification Suite (8 End-to-End Tests)
├── docs/
│   ├── architecture.md             # Deep-Dive Multi-Agent & Epistemic Design
│   └── facilitation_guide.md       # Minute-by-Minute 60-Minute Workshop Runbook
├── requirements.txt
├── .env.example
├── Dockerfile
├── firebase.json
└── README.md
```

---

## 🚀 How to Run Locally (Under 2 Minutes)

### 1. Clone & Set Up Virtual Environment
```bash
git clone https://github.com/gabbyagbobli/devfest-lagos-election-intelligence.git
cd devfest-lagos-election-intelligence

# Create and activate virtual environment
python -m venv .venv
# macOS / Linux:
source .venv/bin/activate
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1

pip install -r requirements.txt
```

### 2. Configure Credentials (`.env`)
```bash
cp .env.example .env
```
Edit `.env` to add your `GOOGLE_API_KEY` (from Google AI Studio) or set `GOOGLE_GENAI_USE_VERTEXAI=1` with your `GOOGLE_CLOUD_PROJECT`.
*(Note: If you run the app without an API key, it automatically uses the built-in **ADK Grounded Deterministic Tool Engine** so all workshop steps and UI features work offline!)*

### 3. Run the Automated Test Suite
```bash
pytest -v
```

### 4. Start the Application
```bash
# Option A: Launch the Election Intelligence Trust Dashboard + API (Port 8080)
uvicorn app.main:app --reload --port 8080

# Option B: Launch the ADK Built-in Developer Web Playground (Port 8000)
adk web app

# Option C: Run Interactively in the Terminal CLI
adk run app/election_intelligence
```

---

## ☁️ How to Deploy

### Deploy Backend & Full App to Google Cloud Run
```bash
gcloud run deploy devfest-lagos-election-agent \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="GOOGLE_GENAI_USE_VERTEXAI=1,GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID,GOOGLE_CLOUD_LOCATION=global,ADK_MODEL=gemini-3.8-flash" \
  --max-instances=3 \
  --memory=512Mi
```

### Deploy Frontend & Codelab to Firebase Hosting
```bash
firebase deploy --only hosting --project devfest-ng-election-2026
```
