"""
A. Election Intelligence Coordinator (`root_agent`)
Serves as the primary entry point in Google ADK, routing user requests to the
appropriate specialist sub-agents and synthesizing transparent, source-backed responses.
"""

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
- **Transparent Uncertainty**: When evidence is incomplete, conflicting, or unverified (such as the Eti-Osa/Alimosho polling unit relocation rumors), explicitly state what is known, what is unverified, and why no definitive conclusion can be drawn.
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

# ADK CLI (`adk run` and `adk web`) discovers `root_agent` by convention
root_agent = election_intelligence_coordinator
