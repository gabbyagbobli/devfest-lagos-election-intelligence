"""
FastAPI Backend & Conference Web Server for the DevFest Lagos 2026
Trustworthy Election Intelligence Multi-Agent Application (Google ADK).
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from app.agents.coordinator import root_agent
from app.orchestrator import run_election_intelligence_query
from app.tools.election_tools import (
    check_source_credibility,
    load_election_corpus,
    load_trusted_sources,
    verify_election_claim,
)

BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = Path(__file__).resolve().parent / "static"
CODELAB_DIR = BASE_DIR / "codelab"
SLIDES_DIR = BASE_DIR / "slides"

app = FastAPI(
    title="DevFest Lagos 2026 — Election Intelligence ADK Agent API",
    description=(
        "Trustworthy Multi-Agent Election Intelligence System built with Google ADK "
        "and the Antigravity Harness."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    query: str = Field(..., min_length=2, description="Election question or claim to analyze.")
    mode: str = Field(
        default="auto",
        description="Routing mode: 'auto', 'research', 'verify', 'summarize', or 'compare'.",
    )
    session_id: str | None = Field(default=None, description="Optional session identifier.")


class ClaimVerifyRequest(BaseModel):
    claim: str = Field(..., min_length=3, description="Specific election claim or rumor to verify.")


class SourceCheckRequest(BaseModel):
    source_or_url: str = Field(..., min_length=2, description="Domain, URL, or source name to inspect.")


SAMPLE_QUERIES: list[dict[str, str]] = [
    {
        "id": "voting-procedures",
        "label": "Official Voting Procedures",
        "mode": "research",
        "badge": "SUPPORTED / TIER 1",
        "query": "What are the official voting procedures for this election?",
        "description": "Delegates to Election Research Agent -> retrieves INEC 2026 Accreditation & Voting Guidelines and Electoral Act Section 47.",
    },
    {
        "id": "latest-announcement",
        "label": "Summarize Latest Announcement",
        "mode": "summarize",
        "badge": "OFFICIAL SUMMARY",
        "query": "Summarize the latest announcement from the electoral commission.",
        "description": "Delegates to Election Information Analyst -> summarizes INEC's November 8 Communiqué, PVC deadline, and BVAS mock results.",
    },
    {
        "id": "verify-date-postponement",
        "label": "Verify Election Date Claim (False Rumor)",
        "mode": "verify",
        "badge": "CONTRADICTED",
        "query": "Can you verify this claim about the election date: Has INEC postponed the November 21 election by 3 weeks to December 12?",
        "description": "Delegates to Claim Verification Agent -> cross-checks viral postponement rumor against INEC Disinformation Alert [INEC-2026-FACT-02].",
    },
    {
        "id": "compare-credible-sources",
        "label": "Compare Multiple Credible Sources",
        "mode": "compare",
        "badge": "MULTI-SOURCE",
        "query": "What do different credible sources say about BVAS offline accreditation, IReV result transmission, and election logistics readiness?",
        "description": "Delegates to Election Information Analyst -> compares Tier 1 (INEC), Tier 2 (YIAGA Africa & DUBAWA), and Tier 3 (Channels TV).",
    },
    {
        "id": "insufficient-evidence-claim",
        "label": "Verify Unverified Claim (Insufficient Evidence)",
        "mode": "verify",
        "badge": "INSUFFICIENT EVIDENCE",
        "query": "Is there sufficient evidence to support this statement: 42 polling units in Eti-Osa and Alimosho were secretly relocated overnight to private compounds?",
        "description": "Demonstrates epistemic humility -> shows why partial/ongoing field checks [YIAGA-2026-INC-09] result in INSUFFICIENT_EVIDENCE rather than guessing.",
    },
    {
        "id": "verify-sms-voting",
        "label": "Verify SMS / NIN Voting Claim",
        "mode": "verify",
        "badge": "CONTRADICTED",
        "query": "Can registered voters who lost their PVC vote via SMS or using their NIN online?",
        "description": "Delegates to Claim Verification Agent -> refutes phishing/SMS voting rumor using Section 47(1) of the Electoral Act.",
    },
]


@app.get("/api/health")
async def health_check() -> dict[str, Any]:
    corpus = load_election_corpus()
    sources = load_trusted_sources()
    return {
        "status": "healthy",
        "service": "devfest-lagos-election-intelligence",
        "framework": "Google ADK (google-adk 2.14.0)",
        "root_agent": root_agent.name,
        "model": root_agent.model,
        "sub_agents": [sa.name for sa in root_agent.sub_agents],
        "verified_corpus_documents": len(corpus),
        "trust_tiers": list(sources.get("tiers", {}).keys()),
    }


@app.get("/api/architecture")
async def get_architecture() -> dict[str, Any]:
    return {
        "coordinator": {
            "name": root_agent.name,
            "model": root_agent.model,
            "role": "Primary entry point, intent router, and epistemic guardrail synthesizer.",
        },
        "specialists": [
            {
                "name": "election_research_agent",
                "title": "Election Research Agent",
                "responsibility": "Retrieves official electoral procedures, statutory rules, and evaluates source credibility tiers.",
                "tools": [
                    "search_verified_election_corpus",
                    "check_source_credibility",
                    "fetch_allowlisted_web_source",
                ],
            },
            {
                "name": "claim_verification_agent",
                "title": "Claim Verification Agent",
                "responsibility": "Cross-checks user claims against verified evidence and assigns SUPPORTED, CONTRADICTED, or INSUFFICIENT_EVIDENCE verdicts.",
                "tools": [
                    "verify_election_claim",
                    "search_verified_election_corpus",
                    "check_source_credibility",
                ],
            },
            {
                "name": "election_information_analyst",
                "title": "Election Information Analyst",
                "responsibility": "Summarizes official INEC announcements, extracts key dates, and compares coverage across Tier 1–3 sources.",
                "tools": [
                    "get_official_announcements",
                    "compare_multi_source_coverage",
                    "search_verified_election_corpus",
                ],
            },
        ],
    }


@app.get("/api/samples")
async def get_sample_queries() -> dict[str, Any]:
    return {"samples": SAMPLE_QUERIES}


@app.get("/api/corpus")
async def get_corpus_and_sources() -> dict[str, Any]:
    return {
        "corpus": load_election_corpus(),
        "trusted_sources": load_trusted_sources(),
    }


@app.post("/api/query")
async def query_election_agent(req: QueryRequest) -> dict[str, Any]:
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
    return await run_election_intelligence_query(
        query=req.query.strip(),
        mode=req.mode,
        session_id=req.session_id,
    )


@app.post("/api/verify")
async def verify_claim_endpoint(req: ClaimVerifyRequest) -> dict[str, Any]:
    if not req.claim.strip():
        raise HTTPException(status_code=400, detail="Claim cannot be empty.")
    direct_verification = verify_election_claim(req.claim.strip())
    orchestrated = await run_election_intelligence_query(
        query=req.claim.strip(),
        mode="verify",
    )
    return {
        "verification": direct_verification,
        "orchestrated_response": orchestrated,
    }


@app.post("/api/source-check")
async def check_source_endpoint(req: SourceCheckRequest) -> dict[str, Any]:
    return check_source_credibility(req.source_or_url.strip())


@app.get("/codelab", response_class=HTMLResponse)
@app.get("/codelab/", response_class=HTMLResponse)
async def serve_codelab() -> FileResponse:
    codelab_html = CODELAB_DIR / "index.html"
    if not codelab_html.exists():
        raise HTTPException(status_code=404, detail="Codelab HTML not found.")
    return FileResponse(codelab_html)


@app.get("/slides", response_class=HTMLResponse)
@app.get("/slides/", response_class=HTMLResponse)
async def serve_slides() -> FileResponse:
    slides_html = SLIDES_DIR / "index.html"
    if not slides_html.exists():
        raise HTTPException(status_code=404, detail="Slides HTML not found.")
    return FileResponse(slides_html)


if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


@app.get("/", response_class=HTMLResponse)
async def serve_dashboard() -> FileResponse:
    index_path = STATIC_DIR / "index.html"
    if not index_path.exists():
        raise HTTPException(status_code=404, detail="Dashboard UI not found.")
    return FileResponse(index_path)
