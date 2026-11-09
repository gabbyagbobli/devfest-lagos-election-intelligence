# Minute-by-Minute Workshop Facilitation Guide (60 Minutes)

**Workshop Title:** Building a Trustworthy AI Agent for Election Intelligence with ADK and the Antigravity Harness  
**Event:** DevFest Lagos 2026  
**Total Duration:** 60 Minutes (10m Intro + 40m Hands-on Codelab + 10m Q&A)

---

## Master Schedule Overview

| Time Window | Segment | Duration | Facilitator Focus |
|---|---|---:|---|
| **00:00 – 10:00** | Segment 1: Introduction & Slides | 10 mins | Set the stage: election misinformation, why chatbots fail, ADK + Antigravity, and the 4-agent architecture. |
| **10:00 – 50:00** | Segment 2: Hands-on Codelab | 40 mins | Guide participants step-by-step through the 10-step interactive codelab. |
| **50:00 – 60:00** | Segment 3: Live Demo, Q&A & Wrap-up | 10 mins | Live stress-testing of audience claims, troubleshooting, and takeaways. |

---

## Detailed Minute-by-Minute Breakdown

### Segment 1: Introduction & Slides (Minutes 00:00 – 10:00)
*Open the interactive slide deck at `/slides/`.*

* **00:00 – 01:15 (Slide 1 — The Problem):** Welcome attendees to DevFest Lagos 2026. Frame the stakes: during elections, viral WhatsApp voice notes, fake SMS voting portals, and doctored postponement graphics erode public trust.
* **01:15 – 02:30 (Slide 2 — Why Ordinary Chatbots Fail):** Explain why standard LLMs hallucinate citations and why naive RAG confuses *mentioning* a rumor with *verifying* it.
* **02:30 – 03:45 (Slide 3 — What Makes an AI Agent Different):** Contrast passive text generation with tool-calling agents that enforce epistemic boundaries.
* **03:45 – 05:00 (Slide 4 — Google ADK & Antigravity Harness):** Introduce `google-adk` (`Agent`, `FunctionTool`, `sub_agents`, `Runner`) and how the Antigravity Harness accelerates agent engineering.
* **05:00 – 06:30 (Slide 5 — Multi-Agent Architecture):** Walk through the 4 agents: `election_intelligence_coordinator`, `election_research_agent`, `claim_verification_agent`, and `election_information_analyst`.
* **06:30 – 08:00 (Slide 6 — Retrieval ≠ Verification & 3-Tier Registry):** Show how Tier 1 (INEC/Electoral Act), Tier 2 (YIAGA/DUBAWA), and Tier 3 (Verified Media) are weighed differently.
* **08:00 – 10:00 (Slides 7 & 8 — Workshop Roadmap & Transition):** Share the live Codelab link (`https://devfest-lagos-election-agent-2026.web.app/codelab/`) and have everyone open Step 1.

---

### Segment 2: 40-Minute Hands-on Codelab (Minutes 10:00 – 50:00)
*Follow the interactive Codelab at `/codelab/`.*

* **10:00 – 13:00 (Step 1: Codelab Overview — 3 mins):** Participants open the codelab and preview the live deployed Trust Dashboard so they see the finish line immediately.
* **13:00 – 17:00 (Step 2: Understand the Multi-Agent Architecture — 4 mins):** Review the 4-agent diagram and inspect `data/trusted_sources.json` and `data/election_corpus.json`.
* **17:00 – 22:00 (Step 3: Environment Setup — 5 mins):** Clone repo, activate `.venv`, verify `adk --version` (`2.14.0`). *Facilitator Tip:* Remind attendees that if conference Wi-Fi slows down `pip` or if they don't have a cloud billing key, the built-in Grounded Tool Engine fallback works out-of-the-box!
* **22:00 – 28:00 (Step 4: Build Retrieval & Source Allowlist Tools — 6 mins):** Inspect `search_verified_election_corpus`, `check_source_credibility`, and `fetch_allowlisted_web_source` in `app/tools/election_tools.py`. Run the Step 4 terminal checkpoint.
* **28:00 – 33:00 (Step 5: Build Claim Verification & Analyst Tools — 5 mins):** Inspect `verify_election_claim`, `get_official_announcements`, and `compare_multi_source_coverage`. Run the Step 5 checkpoint comparing `SUPPORTED`, `CONTRADICTED`, and `INSUFFICIENT_EVIDENCE`.
* **33:00 – 38:00 (Step 6: Create the Specialist Sub-Agents — 5 mins):** Review `app/agents/specialists.py` and verify how docstrings power ADK `FunctionTool` selection.
* **38:00 – 42:00 (Step 7: Build the Coordinator & Connect Agents — 4 mins):** Inspect `app/agents/coordinator.py` and `app/election_intelligence/agent.py`. Run the Step 7 checkpoint verifying `root_agent.sub_agents`.
* **42:00 – 46:00 (Step 8: Run & Test the Application — 4 mins):** Run `pytest -v` (confirming all 8 tests pass) and start `uvicorn app.main:app --reload --port 8080`.
* **46:00 – 49:00 (Step 9: Evaluate with Sample Election Questions — 3 mins):** Test all 5 preset scenarios in the Trust Dashboard and inspect the ADK delegation trace and source cards.
* **49:00 – 50:00 (Step 10: Key Takeaways — 1 min):** Recap the 3 core architectural principles.

---

### Segment 3: Live Q&A, Audience Stress-Tests & Wrap-up (Minutes 50:00 – 60:00)
* **50:00 – 54:00 (Audience Live Claim Stress-Test):** Ask 2–3 audience members to suggest an election question or rumor, run it live on the big screen, and walk through the ADK trace and epistemic badge.
* **54:00 – 58:00 (Technical Q&A):** Address questions on ADK `SequentialAgent`/`ParallelAgent`, production guardrails, Vertex AI grounding, and Cloud Run deployment.
* **58:00 – 60:00 (Closing):** Share the GitHub repository QR/link and invite attendees to star/fork and continue experimenting.
