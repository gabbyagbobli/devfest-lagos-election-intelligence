# DevFest Lagos 2026 — 10-Minute Introduction Slide Deck
**Title:** Building a Trustworthy AI Agent for Election Intelligence with ADK and the Antigravity Harness
**Duration:** 10 Minutes (8 Slides)

---

## Slide 1 — The Problem: Election Misinformation & Information Trust (1 min)
* **High-Stakes Information Environment:** Citizens need accurate answers on polling hours, PVC deadlines, BVAS accreditation, and official announcements.
* **Viral Disinformation Vectors:** Doctored postponement graphics, fake SMS/NIN voting portals, and unverified polling unit relocation rumors spread in minutes.
* **Core Challenge:** How do we help citizens, journalists, and observers distinguish verified statutory facts from viral speculation?

---

## Slide 2 — Why Ordinary Chatbots Are Not Enough (1.5 mins)
* **Static Training Memory:** An ungrounded LLM doesn't know this week's INEC communiqué or local polling unit status.
* **Confident Hallucinations:** Ordinary chatbots optimize for fluency, not evidentiary truth—they can invent dates, candidate statements, or URLs.
* **Naive RAG Fallacy:** Simply retrieving a webpage that mentions a rumor does **not** verify whether the rumor is true or false.

---

## Slide 3 — What Makes an AI Agent Different? (1 min)
* **From Passive Text Generator → Autonomous Reasoning System:**
  * **Instructions & Epistemic Boundaries:** Explicit rules on what to trust and when to refuse to speculate.
  * **Tool Calling (`FunctionTool`):** Executes deterministic Python functions to query verified databases and source registries.
  * **Multi-Agent Delegation (`sub_agents`):** Routes specialized tasks to dedicated research, verification, and synthesis agents.

---

## Slide 4 — Introducing Google ADK & The Antigravity Harness (1.5 mins)
* **Google Agent Development Kit (ADK 2):**
  * Open-source Python framework for building, orchestrating, and testing single and multi-agent systems powered by Gemini.
  * Built-in `adk run` CLI, `adk web` trace inspector, `FunctionTool`, and `Runner`.
* **The Antigravity Harness:**
  * Agentic development environment for rapid multi-file scaffolding, automated testing, guardrail verification, and one-command cloud deployment.

---

## Slide 5 — Our Multi-Agent Election Intelligence Architecture (1.5 mins)
* **A. Election Intelligence Coordinator (`root_agent`):** Understands user intent, delegates to specialists, and enforces epistemic uncertainty banners.
* **B. Election Research Agent (`election_research_agent`):** Retrieves official voting procedures and checks domain trust scores.
* **C. Claim Verification Agent (`claim_verification_agent`):** Cross-examines rumors against evidence (`SUPPORTED`, `CONTRADICTED`, `INSUFFICIENT_EVIDENCE`).
* **D. Election Information Analyst (`election_information_analyst`):** Summarizes official announcements and compares Tier 1, Tier 2, and Tier 3 sources.

---

## Slide 6 — Tool Calling, Grounding, Evidence & Verification (1.5 mins)
* **Crucial Rule: Retrieval ≠ Verification**
* **3-Tier Electoral Source Trust Registry:**
  * **Tier 1 (0.98):** Statutory & Electoral Commission (`inecnigeria.org`, Electoral Act).
  * **Tier 2 (0.90):** Accredited Observers & Fact-Checkers (`yiaga.org`, `dubawa.org`, Situation Room).
  * **Tier 3 (0.78):** Verified Public-Interest News (`channelstv.com`, `premiumtimesng.com`).
* **Transparent Uncertainty:** When evidence is incomplete (e.g., 24 of 42 Eti-Osa polling units still under inspection), the system reports `INSUFFICIENT_EVIDENCE`.

---

## Slide 7 — What We Are Building in the 40-Minute Hands-on Workshop (1 min)
1. Set up Python environment & verify `google-adk` (5m)
2. Build Retrieval & 3-Tier Source Allowlist Tools (6m)
3. Build Claim Verification & Multi-Source Comparison Tools (5m)
4. Create the 3 Specialist Sub-Agents + Root Coordinator (9m)
5. Run automated `pytest` checks & launch the **Election Intelligence Trust Dashboard** (7m)
6. Stress-test with 5 live election & misinformation scenarios (8m)

---

## Slide 8 — Let's Build! (1 min)
* **Live Application:** `https://devfest-lagos-election-agent-2026.web.app`
* **Hands-on Codelab:** `https://devfest-lagos-election-agent-2026.web.app/codelab/`
* **GitHub Repository:** `https://github.com/gabbyagbobli/devfest-lagos-election-intelligence`
* Open the Codelab now and let's start Step 1!
