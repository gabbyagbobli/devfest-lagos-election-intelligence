"""
A. Election Intelligence Coordinator (`root_agent`)
Serves as the primary entry point in Google ADK, routing user requests to the
appropriate specialist sub-agents and synthesizing transparent, source-backed responses.
"""

from __future__ import annotations

from google.adk.agents import Agent
from google.adk.models import Gemini
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
    fetch_allowlisted_web_source,
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


def build_coordinator_with_api_key(api_key: str) -> Agent:
    """
    Builds a request-scoped 4-agent hierarchy authenticated via a user-supplied
    Google AI Studio API key (`api_key`), without mutating global environment state.
    """
    clean_key = api_key.strip()

    def _make_model() -> Gemini:
        return Gemini(
            model=MODEL_NAME,
            client_kwargs={"api_key": clean_key, "vertexai": False},
        )

    research_ag = Agent(
        model=_make_model(),
        name="election_research_agent",
        description=election_research_agent.description,
        instruction=election_research_agent.instruction,
        tools=[
            FunctionTool(search_verified_election_corpus),
            FunctionTool(check_source_credibility),
            FunctionTool(fetch_allowlisted_web_source),
        ],
    )
    verify_ag = Agent(
        model=_make_model(),
        name="claim_verification_agent",
        description=claim_verification_agent.description,
        instruction=claim_verification_agent.instruction,
        tools=[
            FunctionTool(verify_election_claim),
            FunctionTool(search_verified_election_corpus),
            FunctionTool(check_source_credibility),
        ],
    )
    analyst_ag = Agent(
        model=_make_model(),
        name="election_information_analyst",
        description=election_information_analyst.description,
        instruction=election_information_analyst.instruction,
        tools=[
            FunctionTool(get_official_announcements),
            FunctionTool(compare_multi_source_coverage),
            FunctionTool(search_verified_election_corpus),
        ],
    )
    return Agent(
        model=_make_model(),
        name="election_intelligence_coordinator",
        description=election_intelligence_coordinator.description,
        instruction=COORDINATOR_INSTRUCTION,
        sub_agents=[research_ag, verify_ag, analyst_ag],
        tools=[
            FunctionTool(search_verified_election_corpus),
            FunctionTool(verify_election_claim),
            FunctionTool(get_official_announcements),
            FunctionTool(compare_multi_source_coverage),
            FunctionTool(check_source_credibility),
        ],
    )
