"""
Specialized ADK Sub-Agents for the Election Intelligence System:
1. election_research_agent — Allowlisted retrieval & source credibility checks
2. claim_verification_agent — Evidentiary claim verification (SUPPORTED / CONTRADICTED / INSUFFICIENT_EVIDENCE)
3. election_information_analyst — Official announcement synthesis & multi-source comparison
"""

from __future__ import annotations

import os
from dotenv import load_dotenv
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

load_dotenv()

MODEL_NAME = os.getenv("ADK_MODEL", "gemini-3.8-flash")


def configure_genai_environment() -> None:
    """
    Ensures smooth out-of-the-box authentication for both:
    - Option A: Google AI Studio API Key (`GOOGLE_API_KEY` / `GEMINI_API_KEY`)
    - Option B: Google Cloud Vertex AI (`GOOGLE_GENAI_USE_VERTEXAI=1`)
    """
    api_key = (os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY") or "").strip()
    if api_key:
        # Prevent collision with GOOGLE_GENAI_USE_VERTEXAI or Cloud Shell's GOOGLE_CLOUD_PROJECT
        os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "0"
    elif (
        os.getenv("GOOGLE_GENAI_USE_VERTEXAI", "").lower() in ("1", "true", "yes")
        and "3.8" in MODEL_NAME
        and os.getenv("GOOGLE_CLOUD_LOCATION", "").strip() in ("", "us-central1")
    ):
        os.environ["GOOGLE_CLOUD_LOCATION"] = "global"


configure_genai_environment()

# ---------------------------------------------------------------------------
# B. Election Research Agent
# ---------------------------------------------------------------------------
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

# ---------------------------------------------------------------------------
# C. Claim Verification Agent
# ---------------------------------------------------------------------------
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

# ---------------------------------------------------------------------------
# D. Election Information Analyst
# ---------------------------------------------------------------------------
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
