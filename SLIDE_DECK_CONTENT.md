# DevFest Lagos 2026 — Speaker Slide Deck Content & Talking Points

**Workshop Title:** Building a Trustworthy AI Agent for Election Intelligence with ADK and the Antigravity Harness  
**Segment:** Opening 10-Minute Presentation (8 Recommended Slides)  
**Target Audience:** Software Engineers, AI/ML Developers, Cloud Architects, and Civic Tech Builders

---

## Slide 1: Title & The Central Challenge (Minute 0:00 – 1:15)

### Slide Headline
**Building a Trustworthy AI Agent for Election Intelligence with Google ADK & the Antigravity Harness**

### Bullet Points for Your Slide
* **High-Stakes Information Need:** Citizens, journalists, and observers need fast, accurate answers on voting hours, PVC collection deadlines, BVAS accreditation rules, and official announcements.
* **The Misinformation Threat:** Doctored postponement graphics, fake SMS/NIN voting portals, and unverified polling unit relocation rumors spread in minutes.
* **Our Goal Today:** Move beyond generic chatbots—build a **multi-agent system** that retrieves verified evidence, checks source authority, verifies claims, and communicates uncertainty transparently.

### Speaker Notes
> "Welcome to DevFest Lagos 2026! Over the next 60 minutes, we are tackling one of the most consequential problems in AI engineering: **information trust during elections**. When someone asks an AI assistant about voting procedures or a viral rumor on WhatsApp, a hallucinated or unverified response isn't just a bug—it can disenfranchise voters or amplify disinformation. Today, you'll build and run a multi-agent Election Intelligence system using Google's Agent Development Kit (ADK) and the Antigravity Harness."

---

## Slide 2: Why Ordinary Chatbots Fail in Elections (Minute 1:15 – 2:30)

### Slide Headline
**Why Ordinary Chatbots Are Not Enough**

### Side-by-Side Comparison Table (Great for a 2-Column Slide)

| Ordinary LLM Chatbot | Trustworthy Election Intelligence Agent |
|---|---|
| Relies on static pre-training memory | Grounds every answer in live/verified electoral records |
| Optimizes for fluency (guesses confidently when unsure) | Enforces **epistemic humility** (`INSUFFICIENT_EVIDENCE`) |
| Treats all web text equally | Weighs sources using a **3-Tier Electoral Trust Registry** |
| Confuses **Retrieval** with **Verification** | Explicitly cross-examines claims against statutory & observer evidence |
| Invents or omits source links | Attaches `[doc_id]`, publication date, trust tier, and official URL |

### Speaker Notes
> "Why can't we just wrap a single LLM prompt around a search API? Because an ordinary chatbot optimizes for plausibility, not truth. Worse, naive RAG systems suffer from a fatal flaw: **they confuse retrieval with verification**. If an official INEC press release says *'We refute the rumor that the election was postponed to December 12'*, a naive retriever matches the words *'postponed to December 12'* and might repeat the rumor! We need dedicated agentic reasoning that separates finding a statement from verifying whether it's true."

---

## Slide 3: What Makes an AI Agent Different? (Minute 2:30 – 3:45)

### Slide Headline
**From Passive Text Generator to Autonomous Reasoning System**

### Three Core Pillars (3 Visual Cards on Slide)
1. **Model + Explicit Instructions (`Agent`)**
   * Scoped persona, strict epistemic rules, and zero-fabrication guardrails.
2. **Deterministic Tool Calling (`FunctionTool`)**
   * Executes Python functions to query verified corpora, validate domain allowlists, and cross-check claims.
3. **Multi-Agent Delegation (`sub_agents`)**
   * Routes specialized tasks to dedicated Research, Verification, and Synthesis sub-agents rather than overloading a single monolithic prompt.

---

## Slide 4: Introducing Google ADK & The Antigravity Harness (Minute 3:45 – 5:00)

### Slide Headline
**Our Stack: Google Agent Development Kit (ADK 2) + Antigravity Harness**

### Bullet Points for Your Slide
* **Google Agent Development Kit (`google-adk`):**
  * Code-first Python framework for building, orchestrating, and debugging single and multi-agent systems powered by Gemini (`gemini-2.5-flash`).
  * Native primitives: `Agent`, `FunctionTool`, `sub_agents`, `Runner`, `adk run` CLI, and `adk web` trace inspector.
* **The Antigravity Harness:**
  * Agentic development environment for rapid multi-file scaffolding, automated `pytest` verification, guardrail testing, and cloud deployment.

### Code Callout Snippet (Optional for Slide 4)
```python
from google.adk.agents import Agent
from google.adk.tools import FunctionTool

election_research_agent = Agent(
    model="gemini-2.5-flash",
    name="election_research_agent",
    description="Retrieves verified election procedures and checks source credibility.",
    instruction="Cite every fact with [doc_id], source_name, published_date, and url...",
    tools=[FunctionTool(search_verified_election_corpus), FunctionTool(check_source_credibility)],
)
```

---

## Slide 5: Our Multi-Agent Election Intelligence Architecture (Minute 5:00 – 6:30)

### Slide Headline
**4-Agent Architecture: Clear Responsibilities, Real Delegation**

### Architecture Diagram to Put on Slide
```text
                        ┌──────────────────────────────────────────────┐
                        │               User Query / Claim             │
                        └──────────────────────┬───────────────────────┘
                                               ▼
                ┌──────────────────────────────────────────────────────────────┐
                │        A. Election Intelligence Coordinator (root_agent)     │
                │  • Classifies user intent & delegates to specialist agents   │
                │  • Enforces epistemic humility & uncertainty indicators      │
                └──────┬───────────────────────┬────────────────────────┬──────┘
                       │                       │                        │
         Procedures    ▼         Rumors/Claims ▼          Summaries     ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐ ┌──────────────────────────────┐
│  B. Election Research Agent  │ │  C. Claim Verification Agent │ │ D. Election Info Analyst     │
│  • Official rules & lookup   │ │  • Evaluates claims vs facts │ │ • Summarizes announcements   │
│  • Allowlist trust checks    │ │  • SUPPORTED / CONTRADICTED  │ │ • Compares Tier 1-3 sources  │
│                              │ │    / INSUFFICIENT_EVIDENCE   │ │ • Extracts key dates         │
└──────────────────────────────┘ └──────────────────────────────┘ └──────────────────────────────┘
```

### Key Point to Emphasize
* Each agent has a **focused responsibility** and **scoped tools**.
* When `root_agent` receives a request, ADK automatically invokes `transfer_to_agent(agent_name=...)` to hand off execution to the right specialist.

---

## Slide 6: Retrieval ≠ Verification & The 3-Tier Trust Registry (Minute 6:30 – 8:00)

### Slide Headline
**Architectural Principle: Retrieval ≠ Verification**

### Three-Tier Electoral Source Trust Registry (`data/trusted_sources.json`)
* **🥇 Tier 1 — Statutory & Electoral Authority (Trust Score: `0.98`)**
  * *Sources:* INEC (`inecnigeria.org`), Electoral Act Gazette (`placng.org`)
  * *Rule:* Primary authoritative record for election dates, voting procedures, and voter eligibility.
* **🥈 Tier 2 — Accredited Civic Observers & Fact-Checkers (Trust Score: `0.90`)**
  * *Sources:* YIAGA Africa (`yiaga.org`), DUBAWA (`dubawa.org`), Civil Society Situation Room (`situationroomng.org`)
  * *Rule:* High credibility for field observation (BVAS mock audits, logistics) and forensic fact-checking.
* **🥉 Tier 3 — Verified Public-Interest News Media (Trust Score: `0.78`)**
  * *Sources:* Channels TV (`channelstv.com`), Premium Times (`premiumtimesng.com`)
  * *Rule:* Credible journalism; requires Tier 1/2 corroboration for legal rules or schedule changes.
* **🚫 Untrusted / Blocked (`0.00`)**
  * *Sources:* Viral WhatsApp forwards, anonymous blogs — blocked from grounding; treated strictly as claims to verify.

### The Three Epistemic Verdicts
1. `SUPPORTED` — Confirmed by Tier 1 official records or corroborated Tier 2 evidence.
2. `CONTRADICTED` — Refuted by official INEC communiqués or the Electoral Act (e.g., fake December 12 postponement or SMS voting rumors).
3. `INSUFFICIENT_EVIDENCE` — Unverified rumor or ongoing investigation (e.g., alleged overnight relocation of 42 polling units in Eti-Osa and Alimosho where 24 sites still await physical inspection).

---

## Slide 7: The 40-Minute Hands-on Workshop Roadmap (Minute 8:00 – 9:00)

### Slide Headline
**What We Will Build in the Next 40 Minutes**

* **Steps 1–3 (12 mins):** Explore the architecture, set up the Python environment, and inspect the 9-document verified election corpus.
* **Steps 4–5 (11 mins):** Implement & test the 6 ADK Function Tools (`search_verified_election_corpus`, `check_source_credibility`, `verify_election_claim`, `compare_multi_source_coverage`, etc.).
* **Steps 6–7 (9 mins):** Wire the 3 specialist sub-agents (`specialists.py`) and the Coordinator (`coordinator.py`).
* **Steps 8–9 (8 mins):** Run `pytest -v`, launch the **Election Intelligence Trust Dashboard**, and test 5 realistic election & misinformation scenarios.

---

## Slide 8: Let's Build! Workshop Links (Minute 9:00 – 10:00)

### Slide Headline
**Let's Build! Open the Codelab & Starter Repo**

* **📘 Hands-on Codelab (Follow Step-by-Step):**  
  `https://devfest-lagos-election-agent-2026.web.app/codelab/`
* **🛡️ Live Deployed Election Intelligence App:**  
  `https://devfest-lagos-election-agent-2026.web.app`
* **💻 GitHub Starter & Complete Repository:**  
  `https://github.com/gabbyagbobli/devfest-lagos-election-intelligence`
