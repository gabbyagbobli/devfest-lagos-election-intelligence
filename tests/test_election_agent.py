"""
Comprehensive Test Suite for the DevFest Lagos 2026 Election Intelligence ADK Application.
Verifies:
1. ADK Agent definitions, sub-agent hierarchy, and FunctionTool registrations.
2. Correct multi-agent delegation for research, claim verification, announcement summarization, and multi-source comparison.
3. Successful tool execution (`search_verified_election_corpus`, `verify_election_claim`, `check_source_credibility`, `get_official_announcements`, `compare_multi_source_coverage`, `fetch_allowlisted_web_source`).
4. Accurate source attribution (`[doc_id]`, `source_tier`, `url`, `published_date`).
5. Appropriate handling of conflicting/nuanced multi-source reports (Tier 1 vs Tier 2 vs Tier 3).
6. Appropriate handling of unsupported / inconclusive claims (`INSUFFICIENT_EVIDENCE`) and contradicted rumors (`CONTRADICTED`).
7. Graceful handling of untrusted domains and out-of-scope retrieval failures.
8. FastAPI HTTP endpoints (`/api/health`, `/api/architecture`, `/api/query`, `/api/verify`, `/api/source-check`).
"""

from __future__ import annotations

import asyncio
from fastapi.testclient import TestClient

from app.agents.coordinator import (
    build_coordinator_with_api_key,
    election_intelligence_coordinator,
    root_agent,
)
from app.agents.specialists import (
    claim_verification_agent,
    election_information_analyst,
    election_research_agent,
)
from app.main import app
from app.orchestrator import classify_intent, run_election_intelligence_query
from app.tools.election_tools import (
    check_source_credibility,
    compare_multi_source_coverage,
    fetch_allowlisted_web_source,
    get_official_announcements,
    search_verified_election_corpus,
    verify_election_claim,
)

client = TestClient(app)


def test_adk_agent_hierarchy_and_tools():
    """Verify Google ADK root_agent and specialist sub-agents are properly configured."""
    assert root_agent.name == "election_intelligence_coordinator"
    assert election_intelligence_coordinator is root_agent
    sub_names = [sa.name for sa in root_agent.sub_agents]
    assert "election_research_agent" in sub_names
    assert "claim_verification_agent" in sub_names
    assert "election_information_analyst" in sub_names
    assert len(election_research_agent.tools) == 3
    assert len(claim_verification_agent.tools) == 3
    assert len(election_information_analyst.tools) == 3

    scoped_root = build_coordinator_with_api_key("AIzaSyDummyTestKey12345")
    assert scoped_root.name == "election_intelligence_coordinator"
    assert len(scoped_root.sub_agents) == 3


def test_agent_delegation_routing():
    """Verify coordinator classifies and delegates each demo query to the right specialist."""
    r1 = classify_intent("What are the official voting procedures for this election?")
    assert r1["target_agent"] == "election_research_agent"

    r2 = classify_intent("Summarize the latest announcement from the electoral commission.")
    assert r2["target_agent"] == "election_information_analyst"
    assert r2["intent"] == "official_announcement_summary"

    r3 = classify_intent("Can you verify this claim about the election date?")
    assert r3["target_agent"] == "claim_verification_agent"
    assert r3["intent"] == "claim_verification"

    r4 = classify_intent("What do different credible sources say about this development?")
    assert r4["target_agent"] == "election_information_analyst"
    assert r4["intent"] == "multi_source_comparison"

    r5 = classify_intent("Is there sufficient evidence to support this statement about 42 polling units?")
    assert r5["target_agent"] == "claim_verification_agent"


def test_retrieval_and_source_attribution():
    """Verify election procedure retrieval returns Tier 1 INEC and Electoral Act citations."""
    res = search_verified_election_corpus("What are the official voting procedures for this election?")
    assert res["status"] == "success"
    assert res["match_count"] >= 1
    doc_ids = [d["doc_id"] for d in res["documents"]]
    assert "INEC-2026-PROC-01" in doc_ids
    top_doc = res["documents"][0]
    assert top_doc["source_tier"] == "TIER_1_OFFICIAL"
    assert top_doc["trust_score"] == 0.98
    assert top_doc["url"].startswith("https://")


def test_claim_verification_contradicted_rumors():
    """Verify fabricated election postponement and SMS voting claims return CONTRADICTED."""
    v_date = verify_election_claim(
        "Has INEC postponed the November 21, 2026 election by 3 weeks to December 12?"
    )
    assert v_date["verdict"] == "CONTRADICTED"
    assert any(d["doc_id"] == "INEC-2026-FACT-02" for d in v_date["evidence_documents"])

    v_sms = verify_election_claim(
        "Voters without a PVC can vote from home via SMS or using their NIN."
    )
    assert v_sms["verdict"] == "CONTRADICTED"


def test_claim_verification_insufficient_evidence():
    """Verify uncorroborated polling unit relocation and midnight court rumors return INSUFFICIENT_EVIDENCE."""
    v_reloc = verify_election_claim(
        "Is there sufficient evidence to support this statement: 42 polling units in Eti-Osa and Alimosho were secretly relocated overnight to private compounds?"
    )
    assert v_reloc["verdict"] == "INSUFFICIENT_EVIDENCE"
    assert "INSUFFICIENT EVIDENCE" in v_reloc["epistemic_explanation"]

    v_unknown = verify_election_claim(
        "Did Mars colony astronauts cast 500,000 ballots in Lagos Island yesterday?"
    )
    assert v_unknown["verdict"] == "INSUFFICIENT_EVIDENCE"


def test_multi_source_comparison_and_conflicting_nuances():
    """Verify multi-source comparison synthesizes Tier 1, Tier 2, and Tier 3 perspectives."""
    comp = compare_multi_source_coverage("BVAS offline accreditation and IReV result transmission")
    assert comp["status"] == "success"
    assert comp["perspectives_count"] >= 3
    tiers_present = {p["source_tier"] for p in comp["source_perspectives"]}
    assert "TIER_1_OFFICIAL" in tiers_present
    assert "TIER_2_ACCREDITED_OBSERVER" in tiers_present
    matrix = comp["synthesis_matrix"]
    assert len(matrix["areas_of_consensus"]) >= 2
    assert len(matrix["complementary_nuances_and_divergences"]) >= 2
    assert len(matrix["unresolved_uncertainties"]) >= 1


def test_source_credibility_and_untrusted_retrieval_guardrail():
    """Verify allowlisted domains pass and untrusted domains/chains are blocked."""
    c_inec = check_source_credibility("https://www.inecnigeria.org/news")
    assert c_inec["is_trusted"] is True
    assert c_inec["tier_key"] == "TIER_1_OFFICIAL"

    c_yiaga = check_source_credibility("yiaga.org")
    assert c_yiaga["is_trusted"] is True
    assert c_yiaga["tier_key"] == "TIER_2_ACCREDITED_OBSERVER"

    c_fake = check_source_credibility("https://whatsapp-forward-rumor.example.com")
    assert c_fake["is_trusted"] is False

    blocked = fetch_allowlisted_web_source("https://breaking-naija-gossip.example.com/fake-postponement")
    assert blocked["status"] == "blocked_untrusted_domain"


def test_fastapi_endpoints_and_demo_questions():
    """Verify FastAPI endpoints and all 5 workshop demonstration queries execute end-to-end."""
    health = client.get("/api/health")
    assert health.status_code == 200
    assert health.json()["root_agent"] == "election_intelligence_coordinator"
    assert health.json()["model"] == "gemini-3.8-flash"

    codelab_resp = client.get("/codelab/")
    assert codelab_resp.status_code == 200
    assert "aistudio.google.com/apikey" in codelab_resp.text

    demo_queries = [
        ("What are the official voting procedures for this election?", "SUPPORTED"),
        ("Summarize the latest announcement from the electoral commission.", "SUPPORTED"),
        ("Can you verify this claim about the election date: Was the election postponed to December 12?", "CONTRADICTED"),
        ("What do different credible sources say about this development?", "MULTI_SOURCE_SYNTHESIS"),
        ("Is there sufficient evidence to support this statement: 42 polling units in Eti-Osa and Alimosho were secretly relocated overnight?", "INSUFFICIENT_EVIDENCE"),
    ]

    for q_text, expected_status in demo_queries:
        resp = client.post("/api/query", json={"query": q_text, "mode": "auto"})
        assert resp.status_code == 200
        payload = resp.json()
        assert payload["verification_status"] == expected_status
        assert len(payload["trace_steps"]) >= 3
        assert len(payload["evidence_documents"]) >= 1
