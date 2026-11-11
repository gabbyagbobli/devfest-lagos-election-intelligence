author: Gabriel Agbobli (Google Developer Expert)
summary: DevFest Lagos 2026 Hands-on Workshop — Build a Trustworthy Multi-Agent AI Application for Election Intelligence using Google Agent Development Kit (ADK) and the Antigravity Harness.
id: devfest-lagos-election-agent-2026
tags: workshop,adk,antigravity,devfest-lagos,agents
categories: Python,AI,GoogleCloud,ADK
environments: Web
status: Published
feedback link: https://github.com/gabbyagbobli/devfest-lagos-election-intelligence/issues

# Building a Trustworthy AI Agent for Election Intelligence with ADK and the Antigravity Harness

## Codelab Overview
Duration: 0:03:00

Welcome to the **DevFest Lagos 2026** flagship hands-on workshop! In this 40-minute guided codelab, you will design, build, test, and run a **Trustworthy Multi-Agent Election Intelligence System** powered by **Google's Agent Development Kit (ADK)** and developed inside the **Antigravity Harness**.

### Live Workshop Links
* **Live Deployed Election Intelligence App:** [https://devfest-lagos-election-agent-2026.web.app](https://devfest-lagos-election-agent-2026.web.app)
* **Interactive Codelab Guide:** [https://devfest-lagos-election-agent-2026.web.app/codelab/](https://devfest-lagos-election-agent-2026.web.app/codelab/)
* **GitHub Source Repository:** [https://github.com/gabbyagbobli/devfest-lagos-election-intelligence](https://github.com/gabbyagbobli/devfest-lagos-election-intelligence)

### The Central Problem: Election Misinformation vs. Grounded Intelligence
As elections approach, citizens, journalists, and civic observers rely on digital platforms and AI assistants to answer critical questions about **voting procedures, PVC collection deadlines, BVAS accreditation rules, official announcements, and viral claims**.

Standard LLM chatbots are dangerous in high-stakes civic contexts because they:
1. Generate plausible-sounding answers from static training memory without verifying current electoral law.
2. Treat viral rumors as facts or hallucinate non-existent source URLs.
3. Confuse **retrieval** (finding a statement online) with **verification** (evaluating source authority, corroboration, and statutory evidence).

### What You Will Build
You will build a multi-agent Election Intelligence application with Google ADK that demonstrates eight core trustworthy AI capabilities:
1. **Election Information Retrieval** from an allowlisted corpus of official guidelines and statutory law.
2. **Three-Tier Source Trust Grounding** (Tier 1 Statutory/INEC, Tier 2 Accredited Civic Observers & Fact-Checkers, Tier 3 Verified News Media).
3. **Evidentiary Claim Verification** (`SUPPORTED`, `CONTRADICTED`, or `INSUFFICIENT_EVIDENCE`).
4. **Summarization of Official Announcements** and statutory deadlines.
5. **Multi-Source Comparison** across official institutions, independent observers, and news rooms.
6. **Strict Source Attribution** (`[doc_id]`, organization name, publication date, and clickable URL).
7. **Transparent Communication of Uncertainty** when evidence is incomplete or unverified.
8. **Multi-Agent Collaboration & Orchestration** using Google ADK (`Agent`, `FunctionTool`, `sub_agents`, and `Runner`).

> aside positive
> **Core Architectural Rule — Retrieval ≠ Verification:** Finding a statement online does not automatically make it true. Throughout this codelab, your agents will distinguish between **source credibility**, **retrieved evidence**, and the **epistemic conclusion** that can reasonably be drawn.

---

## Understand the Multi-Agent Architecture
Duration: 0:04:00

A true multi-agent system is not merely several prompts glued together. In **Google ADK**, each specialist agent has a focused responsibility, dedicated tools, and clear delegation boundaries orchestrated by a root coordinator.

### System Architecture Diagram

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

### The Three-Tier Electoral Source Trust Registry (`data/trusted_sources.json`)
| Tier | Authority Level | Trust Score | Examples | Verification Rule |
|---|---|---|---|---|
| **Tier 1** | Statutory & Electoral Authority | `0.98` | INEC (`inecnigeria.org`), Electoral Act Gazette (`placng.org`) | Primary authoritative record for dates, procedures, and eligibility. |
| **Tier 2** | Accredited Observers & Fact-Checkers | `0.90` | YIAGA Africa (`yiaga.org`), DUBAWA (`dubawa.org`), Civil Society Situation Room | High credibility for field observation and forensic fact-checks; cross-check statutory rules with Tier 1. |
| **Tier 3** | Verified Public-Interest Media | `0.78` | Channels TV (`channelstv.com`), Premium Times (`premiumtimesng.com`) | Credible journalistic reporting; requires Tier 1/2 corroboration for legal or schedule claims. |
| **Untrusted** | Unattributed / Flagged Patterns | `0.00` | Viral WhatsApp forwards, anonymous blogs | Blocked from grounding; treated strictly as claims requiring verification. |

> aside negative
> **Guardrail Against Hallucination:** The agents are strictly instructed never to invent election results, voting procedures, candidate statements, or URLs. When evidence is missing or inconclusive, the system outputs `INSUFFICIENT_EVIDENCE`.

---

## Prerequisites & Environment Setup
Duration: 0:05:00

In this step, you will clone the starter repository, create an isolated Python virtual environment, install `google-adk` and FastAPI, and verify your setup.

### Prerequisites
* **Python 3.11+** installed (`python --version`)
* **Git** installed
* *(Optional)* A **Google Gemini API Key** (`GOOGLE_API_KEY`) or **Google Cloud Vertex AI Project** (`GOOGLE_CLOUD_PROJECT`).
  * *Note:* The project includes a **Zero-Downtime Grounded Tool Engine** fallback so you can complete every step of the workshop even if conference Wi-Fi drops or you don't have an API key handy!

### 1. Activate Cloud Shell & Select Your Workshop Project
Open [Google Cloud Shell](https://shell.cloud.google.com/?show=ide,terminal) and run:

```bash
unset CLOUDSDK_CORE_PROJECT
PS3="Select your workshop project number (e.g. 1): "
select PROJECT_ID in $(gcloud projects list --format="value(projectId)"); do
  [ -n "$PROJECT_ID" ] && gcloud config set project "$PROJECT_ID" && break
done

gcloud services enable aiplatform.googleapis.com
```

### 2. Clone the Workshop Repository & Install Dependencies
```bash
cd ~
git clone https://github.com/gabbyagbobli/devfest-lagos-election-intelligence.git
cd ~/devfest-lagos-election-intelligence

python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### 3. Auto-Configure `.env` for Cloud Shell & Vertex AI
Run this single command in Cloud Shell to automatically configure `.env` using your active Google Cloud project and workshop credits:

```bash
cat <<EOF > .env
GOOGLE_GENAI_USE_VERTEXAI=1
GOOGLE_CLOUD_PROJECT=$(gcloud config get-value project)
GOOGLE_CLOUD_LOCATION=global
ADK_MODEL=gemini-3.8-flash
EOF

cat .env
```

> aside positive
> **🔍 Checkpoint — Verify Your Environment:**
> Run `adk --version` and confirm the datasets exist:
> ```bash
> adk --version
> python -c "import json; print('Corpus docs:', len(json.load(open('data/election_corpus.json', encoding='utf8'))))"
> ```
> **Expected Output:**
> ```text
> adk, version 2.14.0
> Corpus docs: 9
> ```

---

## Build the Retrieval & Source Allowlist Tools
Duration: 0:06:00

### What You Will Accomplish
You will inspect and implement the grounded retrieval and source credibility functions in `app/tools/election_tools.py`:
1. `search_verified_election_corpus(query: str, category: str = "all") -> dict`
2. `check_source_credibility(source_or_url: str) -> dict`
3. `fetch_allowlisted_web_source(url: str) -> dict`

### Why This Step Matters
In Google ADK, a Python function becomes an agent tool when wrapped with `FunctionTool(func)`. **The LLM reads the function signature, type hints, and docstring** to decide when and how to invoke the tool.

### Inspect `app/tools/election_tools.py` (Part 1: Retrieval & Allowlist Guardrail)
Open `app/tools/election_tools.py` and verify the retrieval and source-checking implementation:

```python
def search_verified_election_corpus(query: str, category: str = "all") -> dict[str, Any]:
    """
    Searches the verified election intelligence corpus for official guidelines,
    electoral commission announcements, statutory laws, and accredited observer reports.

    Args:
        query: The natural language search query or topic keywords (e.g., "voting procedures BVAS PVC", "election date postponement").
        category: Optional category filter. One of "all", "voting_procedures", "official_announcement", "fact_check", "legal_framework", "multi_source_development", or "unverified_investigation".

    Returns:
        A dictionary containing matched documents with full source attribution,
        trust tier scores, publication dates, URLs, and key facts.
    """
```

And inspect `check_source_credibility(source_or_url: str)`:

```python
def check_source_credibility(source_or_url: str) -> dict[str, Any]:
    """
    Evaluates a domain, URL, or organization name against the Three-Tier Electoral
    Source Trust Registry to determine its authority and verification rules.

    Args:
        source_or_url: A URL, domain name, or source name (e.g., "inecnigeria.org", "yiaga.org", "whatsapp-forward").

    Returns:
        A dictionary describing whether the source is allowlisted, its trust tier,
        trust score (0.0 to 1.0), and how its claims must be treated.
    """
```

> aside positive
> **🔍 Checkpoint — Test Retrieval & Source Allowlisting:**
> Run this command in your terminal to test both tools directly:
> ```bash
> python -c "from app.tools.election_tools import search_verified_election_corpus, check_source_credibility; print(check_source_credibility('inecnigeria.org')['tier_label']); print(search_verified_election_corpus('voting procedures')['documents'][0]['doc_id'])"
> ```
> **Expected Output:**
> ```text
> Tier 1 — Statutory & Electoral Authority
> INEC-2026-PROC-01
> ```

---

## Build the Claim Verification & Multi-Source Analyst Tools
Duration: 0:05:00

### What You Will Accomplish
Next, examine the evidentiary verification and synthesis tools in `app/tools/election_tools.py`:
1. `verify_election_claim(claim: str) -> dict`
2. `get_official_announcements(topic: str = "all") -> dict`
3. `compare_multi_source_coverage(topic: str) -> dict`

### Why This Step Matters
Finding a claim mentioned in a document does not mean the claim is true—in fact, an official INEC press release might mention a rumor specifically to **debunk** it! The `verify_election_claim` tool cross-references the claim against Tier 1 statutory provisions, official commission rebuttals, and Tier 2 observer field logs to return an explicit epistemic verdict:
* `SUPPORTED` — Confirmed by Tier 1 official publications or corroborated Tier 2 evidence.
* `CONTRADICTED` — Refuted by official INEC communiqués, statutory law, or forensic fact-checks.
* `INSUFFICIENT_EVIDENCE` — Unverified rumor, ongoing field investigation, or zero matching records in the allowlisted corpus.

### Inspect `verify_election_claim` in `app/tools/election_tools.py`
```python
def verify_election_claim(claim: str) -> dict[str, Any]:
    """
    Verifies a user-submitted election claim against the verified evidence corpus,
    separating raw retrieval from evidentiary verification.

    Args:
        claim: The specific statement, rumor, or claim to evaluate (e.g., "INEC postponed the election by 3 weeks to December 12").

    Returns:
        A structured verification report with a verdict ("SUPPORTED", "CONTRADICTED",
        or "INSUFFICIENT_EVIDENCE"), confidence rating, rationale, and cited evidence.
    """
```

> aside positive
> **🔍 Checkpoint — Test Claim Verification Across All 3 Verdicts:**
> Execute the following command to verify how the tool handles a **contradicted rumor** vs. an **inconclusive claim**:
> ```bash
> python -c "from app.tools.election_tools import verify_election_claim; print('Postponement rumor:', verify_election_claim('INEC postponed the election to December 12')['verdict']); print('Relocation rumor:', verify_election_claim('42 polling units in Eti-Osa were secretly relocated overnight')['verdict'])"
> ```
> **Expected Output:**
> ```text
> Postponement rumor: CONTRADICTED
> Relocation rumor: INSUFFICIENT_EVIDENCE
> ```

---

## Create the Specialist Sub-Agents (`app/agents/specialists.py`)
Duration: 0:05:00

### What You Will Accomplish
You will configure the three specialized Google ADK sub-agents in `app/agents/specialists.py`:
* **`election_research_agent`** — Grounded retrieval & source credibility specialist.
* **`claim_verification_agent`** — Evidentiary claim verifier (`SUPPORTED` / `CONTRADICTED` / `INSUFFICIENT_EVIDENCE`).
* **`election_information_analyst`** — Official announcement summarizer & multi-source analyst.

### Complete Code: `app/agents/specialists.py`
Inspect `app/agents/specialists.py`:

```python
from __future__ import annotations

import os
from google.adk.agents import Agent
from google.adk.tools import FunctionTool

from app.tools.election_tools import (
    check_source_credibility,
    compare_multi_source_coverage,
    fetch_allowlisted_web_source,
    get_official_announcements,
    search_verified_election_corpus,
    verify_election_claim,
)

MODEL_NAME = os.getenv("ADK_MODEL", "gemini-3.8-flash")

# B. Election Research Agent
election_research_agent = Agent(
    model=MODEL_NAME,
    name="election_research_agent",
    description=(
        "Retrieves verified election procedures, statutory provisions, and official "
        "records from allowlisted sources, and evaluates source credibility tiers."
    ),
    instruction="""You are the Election Research Agent in a trustworthy Election Intelligence system.
Your sole responsibility is grounded information retrieval and source credibility evaluation:
1. Always call `search_verified_election_corpus` first to retrieve official INEC guidelines, Electoral Act sections, and accredited observer reports.
2. When a user asks about a specific domain, website, or viral source, call `check_source_credibility` or `fetch_allowlisted_web_source`.
3. Prioritize Tier 1 (Statutory & Electoral Commission) sources for procedures and dates, followed by Tier 2 (Accredited Election Observers & Fact-Checkers) and Tier 3 (Verified News Media).
4. Cite every retrieved fact using its exact `[doc_id]`, `source_name`, `published_date`, and `url`.
5. Never invent election procedures, candidate statements, polling dates, or URLs. If the corpus has no match, explicitly state that verified information is unavailable.""",
    tools=[
        FunctionTool(search_verified_election_corpus),
        FunctionTool(check_source_credibility),
        FunctionTool(fetch_allowlisted_web_source),
    ],
)

# C. Claim Verification Agent
claim_verification_agent = Agent(
    model=MODEL_NAME,
    name="claim_verification_agent",
    description=(
        "Verifies user-submitted election claims, rumors, or statements against "
        "available evidence and assigns SUPPORTED, CONTRADICTED, or INSUFFICIENT_EVIDENCE verdicts."
    ),
    instruction="""You are the Claim Verification Agent in a trustworthy Election Intelligence system.
Your core principle is that RETRIEVAL IS NOT VERIFICATION: finding a statement online does not make it true.
When handling any claim or "Is it true..." question:
1. Always invoke `verify_election_claim` with the user's claim, and optionally `check_source_credibility` if a source is mentioned.
2. Begin your response with the explicit Verification Verdict:
   - `SUPPORTED`: Backed by Tier 1 statutory/commission evidence or corroborated Tier 2 observer data.
   - `CONTRADICTED`: Directly refuted by official INEC records, Electoral Act provisions, or forensic fact-checks.
   - `INSUFFICIENT_EVIDENCE`: Unverified rumor, ongoing investigation, or missing authoritative records.
3. Explain the evidentiary reasoning clearly, citing exact `[doc_id]` references, source tiers, and publication dates.
4. Never make a definitive conclusion when evidence is inadequate or inconclusive.""",
    tools=[
        FunctionTool(verify_election_claim),
        FunctionTool(search_verified_election_corpus),
        FunctionTool(check_source_credibility),
    ],
)

# D. Election Information Analyst
election_information_analyst = Agent(
    model=MODEL_NAME,
    name="election_information_analyst",
    description=(
        "Summarizes official electoral commission announcements, extracts key dates "
        "and voting steps, and compares coverage across multiple credible sources."
    ),
    instruction="""You are the Election Information Analyst in a trustworthy Election Intelligence system.
Your role is to synthesize complex electoral documents into clear, accurate, citizen-friendly briefings:
1. For requests to summarize official announcements or key dates, call `get_official_announcements`.
2. For requests comparing what different credible sources say about a development (such as BVAS/IReV readiness or logistics), call `compare_multi_source_coverage`.
3. Clearly separate:
   - **Consensus Across Sources** (where Tier 1, Tier 2, and Tier 3 agree)
   - **Nuances & Operational Perspectives** (how official assurances compare with independent observer field reports)
   - **Open Uncertainties** (what remains unverified or pending)
4. Preserve all `[doc_id]` citations, publication dates, and source URLs.""",
    tools=[
        FunctionTool(get_official_announcements),
        FunctionTool(compare_multi_source_coverage),
        FunctionTool(search_verified_election_corpus),
    ],
)
```

> aside positive
> **🔍 Checkpoint — Verify Specialist Agent Definitions:**
> ```bash
> python -c "from app.agents.specialists import election_research_agent, claim_verification_agent, election_information_analyst; print(election_research_agent.name, len(election_research_agent.tools)); print(claim_verification_agent.name, len(claim_verification_agent.tools)); print(election_information_analyst.name, len(election_information_analyst.tools))"
> ```
> **Expected Output:**
> ```text
> election_research_agent 3
> claim_verification_agent 3
> election_information_analyst 3
> ```

---

## Build the Coordinator & Connect the Agents (`app/agents/coordinator.py`)
Duration: 0:04:00

### What You Will Accomplish
You will define the **Election Intelligence Coordinator** (`root_agent`) in `app/agents/coordinator.py` and expose it in `app/election_intelligence/agent.py` so both ADK's CLI (`adk run` / `adk web`) and the FastAPI Trust Dashboard can orchestrate the entire team.

### Complete Code: `app/agents/coordinator.py`
```python
from __future__ import annotations

from google.adk.agents import Agent
from google.adk.tools import FunctionTool

from app.agents.specialists import (
    MODEL_NAME,
    claim_verification_agent,
    election_information_analyst,
    election_research_agent,
)
from app.tools.election_tools import (
    check_source_credibility,
    compare_multi_source_coverage,
    get_official_announcements,
    search_verified_election_corpus,
    verify_election_claim,
)

COORDINATOR_INSTRUCTION = """You are the **Election Intelligence Coordinator**, the lead orchestrator of a trustworthy multi-agent Election Intelligence application built with Google ADK.

Your mission is to help citizens, journalists, and observers access accurate, grounded, and verifiable election information while actively preventing misinformation and hallucination.

### How to Coordinate Your Specialist Sub-Agents
Delegate or invoke tools based on the user's intent:
1. **Official Voting Procedures, Legal Rules & General Lookup** -> Delegate to `election_research_agent` (or use `search_verified_election_corpus`).
2. **Fact-Checking Rumors, Viral Claims & "Can you verify..." Queries** -> Delegate to `claim_verification_agent` (or use `verify_election_claim`).
3. **Summarizing Official Announcements or Comparing Multiple Credible Sources** -> Delegate to `election_information_analyst` (or use `get_official_announcements` / `compare_multi_source_coverage`).

### Mandatory Trust & Epistemic Guardrails
- **Retrieval != Verification**: Always distinguish between the authority of a source (Tier 1 Statutory/INEC, Tier 2 Accredited Observer/Fact-Checker, Tier 3 Verified Media) and the conclusion drawn.
- **Explicit Verification Status**: State clearly whether a claim or topic is `SUPPORTED`, `CONTRADICTED`, `INSUFFICIENT_EVIDENCE`, or `OFFICIAL_GUIDANCE`.
- **Strict Source Attribution**: Cite every claim using `[doc_id]` (e.g., `[INEC-2026-PROC-01]`, `[YIAGA-2026-OBS-01]`), the source name, publication date, and official URL.
- **Transparent Uncertainty**: When evidence is incomplete, conflicting, or unverified, explicitly state what is known, what is unverified, and why no definitive conclusion can be drawn.
- **Zero Fabrication**: Never invent election results, voting procedures, candidate statements, or URLs.
"""

election_intelligence_coordinator = Agent(
    model=MODEL_NAME,
    name="election_intelligence_coordinator",
    description=(
        "Primary Election Intelligence Coordinator that understands user election "
        "queries, delegates to specialized Research, Claim Verification, and "
        "Information Analyst agents, and produces source-attributed responses."
    ),
    instruction=COORDINATOR_INSTRUCTION,
    sub_agents=[
        election_research_agent,
        claim_verification_agent,
        election_information_analyst,
    ],
    tools=[
        FunctionTool(search_verified_election_corpus),
        FunctionTool(verify_election_claim),
        FunctionTool(get_official_announcements),
        FunctionTool(compare_multi_source_coverage),
        FunctionTool(check_source_credibility),
    ],
)

root_agent = election_intelligence_coordinator
```

> aside positive
> **🔍 Checkpoint — Verify Coordinator & Sub-Agent Graph:**
> ```bash
> python -c "from app.election_intelligence.agent import root_agent; print('Root:', root_agent.name); print('Sub-agents:', [a.name for a in root_agent.sub_agents])"
> ```
> **Expected Output:**
> ```text
> Root: election_intelligence_coordinator
> Sub-agents: ['election_research_agent', 'claim_verification_agent', 'election_information_analyst']
> ```

---

## Run & Test the Application
Duration: 0:04:00

### 1. Run the Automated Pytest Verification Suite
Before launching the UI, run the automated test suite (`tests/test_election_agent.py`) to verify agent delegation, tool execution, source attribution, conflicting source synthesis, and unsupported claim guardrails:

```bash
pytest -v
```

**Expected Output:**
```text
tests/test_election_agent.py::test_adk_agent_hierarchy_and_tools PASSED  [ 12%]
tests/test_election_agent.py::test_agent_delegation_routing PASSED       [ 25%]
tests/test_election_agent.py::test_retrieval_and_source_attribution PASSED [ 37%]
tests/test_election_agent.py::test_claim_verification_contradicted_rumors PASSED [ 50%]
tests/test_election_agent.py::test_claim_verification_insufficient_evidence PASSED [ 62%]
tests/test_election_agent.py::test_multi_source_comparison_and_conflicting_nuances PASSED [ 75%]
tests/test_election_agent.py::test_source_credibility_and_untrusted_retrieval_guardrail PASSED [ 87%]
tests/test_election_agent.py::test_fastapi_endpoints_and_demo_questions PASSED [100%]
======================== 8 passed in 2.60s =========================
```

### 2. Launch the Election Intelligence Trust Dashboard
Start the FastAPI + Trust Dashboard server on port `8080`:

```bash
uvicorn app.main:app --reload --port 8080
```

Open **`http://localhost:8080`** in your browser! You can also test via ADK's built-in developer UI (`adk web app`) or CLI (`adk run app/election_intelligence`).

> aside negative
> **🛠️ Troubleshooting Common Issues:**
> * **`ModuleNotFoundError: No module named 'app'`**: Ensure you run commands from the root `devfest-lagos-election-intelligence` directory and that your `.venv` virtual environment is active.
> * **`API key not valid` or `Billing not enabled`**: If your Google Cloud project or API key isn't active yet, the application automatically falls back to its built-in **ADK Grounded Deterministic Tool Engine** so your workshop UI continues running without interruption.

---

## Evaluate Responses with Real-World Election Scenarios
Duration: 0:03:00

In the **Election Intelligence Trust Dashboard** (`http://localhost:8080` or the live deployment at [https://devfest-lagos-election-agent-2026.web.app](https://devfest-lagos-election-agent-2026.web.app)), click through the **5 Workshop Demo Scenarios** on the left sidebar and inspect the **Epistemic Verdict**, **ADK Delegation Trace**, and **Source Attribution Cards**:

### Scenario 1: Official Voting Procedures (`SUPPORTED`)
* **Prompt:** `"What are the official voting procedures for this election?"`
* **Delegation:** `election_intelligence_coordinator` → `election_research_agent` → `search_verified_election_corpus`
* **Result:** Cites `[INEC-2026-PROC-01]` and `[ELECTORAL-ACT-2022-S47]` (8:30 AM – 2:30 PM WAT polling hours, mandatory physical PVC, bimodal BVAS fingerprint/facial accreditation, Form EC8A counting, and IReV upload).

### Scenario 2: Latest Commission Announcement (`SUPPORTED`)
* **Prompt:** `"Summarize the latest announcement from the electoral commission."`
* **Delegation:** `election_intelligence_coordinator` → `election_information_analyst` → `get_official_announcements`
* **Result:** Summarizes `[INEC-2026-PRESS-04]` confirming the November 21, 2026 election date, the November 15, 2026 (5:00 PM WAT) final PVC collection deadline, and the 98.4% BVAS mock accreditation success rate.

### Scenario 3: Viral Election Postponement Claim (`CONTRADICTED`)
* **Prompt:** `"Can you verify this claim about the election date: Has INEC postponed the November 21 election by 3 weeks to December 12?"`
* **Delegation:** `election_intelligence_coordinator` → `claim_verification_agent` → `verify_election_claim`
* **Result:** Verdict `CONTRADICTED` with High Confidence, citing INEC Disinformation Alert `[INEC-2026-FACT-02]` and `[INEC-2026-PRESS-04]`.

### Scenario 4: Comparing Multiple Credible Sources (`MULTI_SOURCE_SYNTHESIS`)
* **Prompt:** `"What do different credible sources say about BVAS offline accreditation, IReV result transmission, and election logistics readiness?"`
* **Delegation:** `election_intelligence_coordinator` → `election_information_analyst` → `compare_multi_source_coverage`
* **Result:** Contrasts Tier 1 (`[INEC-2026-TECH-03]`), Tier 2 (`[YIAGA-2026-OBS-01]`, `[DUBAWA-2026-CHECK-07]`), and Tier 3 (`[CHANNELS-2026-NEWS-11]`), showing consensus on offline BVAS accuracy alongside observer warnings about cellular dead-zones in 8.2% of riverine/rural polling units.

### Scenario 5: Deliberately Unsupported Claim (`INSUFFICIENT_EVIDENCE`)
* **Prompt:** `"Is there sufficient evidence to support this statement: 42 polling units in Eti-Osa and Alimosho were secretly relocated overnight to private compounds?"`
* **Delegation:** `election_intelligence_coordinator` → `claim_verification_agent` → `verify_election_claim`
* **Result:** Verdict `INSUFFICIENT_EVIDENCE`. Cites Situation Room Field Log `[YIAGA-2026-INC-09]` showing zero authorized changes in INEC's directory, 15 of 18 inspected sites unchanged at public schools, 3 shifted 30m on public streets for drainage works, and 24 sites still awaiting physical inspection.

---

## Key Takeaways & Further Learning
Duration: 0:01:00

Congratulations! You have built, tested, and evaluated a **Trustworthy Multi-Agent Election Intelligence Application** with **Google ADK** and the **Antigravity Harness**.

### Key Engineering Takeaways
1. **Multi-Agent Separation of Concerns:** Separating retrieval (`election_research_agent`), evidentiary verification (`claim_verification_agent`), and multi-source synthesis (`election_information_analyst`) prevents prompt overload and makes agent decisions auditable.
2. **Retrieval ≠ Verification:** Finding a keyword match in a corpus or search engine does not verify a claim. Your tools and instructions must explicitly weigh **source authority tiers**, **statutory compliance**, and **independent corroboration**.
3. **Epistemic Humility by Design:** A trustworthy agent must be able to say *"There is insufficient verified evidence to support this claim"* (`INSUFFICIENT_EVIDENCE`) rather than guessing.

### Useful References & Next Steps
* [Google Agent Development Kit (ADK) Documentation](https://google.github.io/adk-docs/)
* [Building AI Agents with ADK: The Foundation Codelab](https://codelabs.developers.google.com/devsite/codelabs/build-agents-with-adk-foundation?hl=en#0)
* [Solace Developer Codelabs Design Reference](https://codelabs.solace.dev/codelabs/codelab-4-codelab/?index=..%2F..index#0)
* [DevFest Lagos 2026 Election Intelligence GitHub Repository](https://github.com/gabbyagbobli/devfest-lagos-election-intelligence)
