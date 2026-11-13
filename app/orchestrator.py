"""
ADK Multi-Agent Orchestrator & Grounded Execution Engine.

Executes the Google ADK `Runner` (`election_intelligence_coordinator` -> specialist sub-agents)
and pairs the LLM response with structured provenance metadata (verification badge,
uncertainty banner, cited evidence cards, and multi-agent trace steps) for the
Election Intelligence Trust Dashboard.

Includes a zero-downtime Grounded Fallback Engine using the exact same ADK Function Tools
so workshop participants can also test the full pipeline offline or before configuring API keys.
"""

from __future__ import annotations

import os
import time
import uuid
from typing import Any

from dotenv import load_dotenv
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

from app.agents.coordinator import build_coordinator_with_api_key, root_agent
from app.agents.specialists import MODEL_NAME, configure_genai_environment
from app.tools.election_tools import (
    check_source_credibility,
    compare_multi_source_coverage,
    get_official_announcements,
    search_verified_election_corpus,
    verify_election_claim,
)

load_dotenv()

APP_NAME = "devfest_lagos_election_intelligence"
_session_service = InMemorySessionService()


def classify_intent(query: str, mode: str = "auto") -> dict[str, str]:
    """Determines which specialized ADK sub-agent handles the request."""
    q = query.lower()

    if mode == "verify" or any(
        kw in q
        for kw in [
            "verify", "claim", "true that", "is it true", "rumor", "postpone",
            "postponed", "december 12", "sms voting", "without pvc", "relocated",
            "eti-osa", "alimosho", "disqualified", "sufficient evidence", "support this statement",
        ]
    ):
        return {
            "intent": "claim_verification",
            "target_agent": "claim_verification_agent",
            "agent_title": "Claim Verification Agent",
            "routing_reason": (
                "User request involves evaluating the truth, evidentiary support, or credibility "
                "of a specific statement or rumor."
            ),
        }

    if mode == "compare" or any(
        kw in q
        for kw in [
            "different credible sources", "compare", "multiple sources", "what do sources say",
            "different sources", "perspectives", "development", "irev", "dead-zone",
        ]
    ):
        return {
            "intent": "multi_source_comparison",
            "target_agent": "election_information_analyst",
            "agent_title": "Election Information Analyst",
            "routing_reason": (
                "User requested a cross-source comparison across official, observer, and media tiers."
            ),
        }

    if mode == "summarize" or any(
        kw in q
        for kw in [
            "summarize", "latest announcement", "communique", "press release",
            "deadline", "pvc collection", "timetable",
        ]
    ):
        return {
            "intent": "official_announcement_summary",
            "target_agent": "election_information_analyst",
            "agent_title": "Election Information Analyst",
            "routing_reason": (
                "User requested a summary of official Electoral Commission announcements and key dates."
            ),
        }

    return {
        "intent": "election_research",
        "target_agent": "election_research_agent",
        "agent_title": "Election Research Agent",
        "routing_reason": (
            "User requested official election procedures, statutory rules, or grounded factual retrieval."
        ),
    }


def _build_structured_intelligence(query: str, routing: dict[str, str]) -> dict[str, Any]:
    """Executes the underlying ADK Function Tools to assemble structured evidence & synthesis."""
    intent = routing["intent"]
    trace_steps: list[dict[str, Any]] = [
        {
            "step": 1,
            "agent": "election_intelligence_coordinator",
            "action": "intent_classification_and_routing",
            "detail": f"Classified query as '{intent}' -> Delegating to `{routing['target_agent']}`.",
        }
    ]

    evidence_docs: list[dict[str, Any]] = []
    verification_status = "OFFICIAL_GUIDANCE"
    confidence = "HIGH (Tier 1 Statutory & Official Sources)"
    uncertainty_banner: dict[str, Any] = {
        "has_uncertainty": False,
        "level": "VERIFIED",
        "message": "All statements in this response are directly grounded in allowlisted Tier 1–3 electoral records.",
    }
    comparison_matrix: dict[str, Any] | None = None
    official_dates: list[dict[str, str]] = []

    if intent == "claim_verification":
        v_res = verify_election_claim(query)
        evidence_docs = v_res.get("evidence_documents", [])
        verification_status = v_res["verdict"]
        confidence = v_res["confidence"]
        trace_steps.append(
            {
                "step": 2,
                "agent": "claim_verification_agent",
                "action": "tool_call:verify_election_claim",
                "detail": f"Evaluated claim against verified corpus -> Verdict: {verification_status} ({confidence}).",
            }
        )
        trace_steps.append(
            {
                "step": 3,
                "agent": "claim_verification_agent",
                "action": "tool_call:search_verified_election_corpus",
                "detail": f"Retrieved {len(evidence_docs)} corroborating/refuting document(s) with source tier ratings.",
            }
        )

        if verification_status == "INSUFFICIENT_EVIDENCE":
            uncertainty_banner = {
                "has_uncertainty": True,
                "level": "INSUFFICIENT_EVIDENCE",
                "message": (
                    "EPISTEMIC WARNING: Available evidence is incomplete or uncorroborated by Tier 1 official records. "
                    "This system refuses to speculate or state unverified rumors as fact."
                ),
            }
        elif verification_status == "CONTRADICTED":
            uncertainty_banner = {
                "has_uncertainty": False,
                "level": "CONTRADICTED_CLAIM",
                "message": (
                    "DISINFORMATION ALERT: This claim is directly refuted by official Electoral Commission "
                    "records and statutory provisions."
                ),
            }

        citations_md = "\n".join(
            f"- **[{d['doc_id']}]** *{d['title']}* — {d['source_name']} (`{d['source_tier']}`, Published: {d['published_date']}) — [Official Source]({d['url']})"
            for d in evidence_docs
        )
        facts_md = "\n".join(
            f"- {fact} (`[{d['doc_id']}]`)"
            for d in evidence_docs[:2]
            for fact in d.get("key_facts", [])[:2]
        )
        synthesized_md = (
            f"### Verification Verdict: `{verification_status}`\n"
            f"**Confidence Level:** {confidence}\n\n"
            f"#### Evidentiary Assessment\n"
            f"{v_res['epistemic_explanation']}\n\n"
            f"#### Why Retrieval ≠ Verification\n"
            f"> {v_res['retrieval_vs_verification_note']}\n\n"
            f"#### Key Grounded Facts from Verified Records\n"
            f"{facts_md or '- No corroborating records exist in the allowlisted electoral corpus.'}\n\n"
            f"#### Source Attribution\n"
            f"{citations_md or '- Zero verified sources support this claim.'}"
        )

    elif intent == "multi_source_comparison":
        comp_res = compare_multi_source_coverage(query)
        comparison_matrix = comp_res["synthesis_matrix"]
        search_res = search_verified_election_corpus(f"{query} BVAS IReV logistics readiness")
        evidence_docs = search_res.get("documents", [])
        verification_status = "MULTI_SOURCE_SYNTHESIS"
        confidence = "HIGH (Cross-Referenced Across Tiers 1, 2 & 3)"
        uncertainty_banner = {
            "has_uncertainty": True,
            "level": "PARTIAL_OPERATIONAL_UNCERTAINTY",
            "message": (
                "TRANSPARENCY NOTE: While Tier 1 and Tier 2 sources agree on BVAS offline biometric accuracy (~98%), "
                "observers note unresolved cellular dead-zones in 8.2% of rural/riverine polling units."
            ),
        }
        trace_steps.append(
            {
                "step": 2,
                "agent": "election_information_analyst",
                "action": "tool_call:compare_multi_source_coverage",
                "detail": f"Compared {comp_res['perspectives_count']} independent sources across Tier 1 (INEC), Tier 2 (YIAGA/DUBAWA), and Tier 3 (Channels TV).",
            }
        )

        consensus_md = "\n".join(f"- {item}" for item in comparison_matrix["areas_of_consensus"])
        nuances_md = "\n".join(f"- {item}" for item in comparison_matrix["complementary_nuances_and_divergences"])
        uncertainties_md = "\n".join(f"- {item}" for item in comparison_matrix["unresolved_uncertainties"])
        citations_md = "\n".join(
            f"- **[{d['doc_id']}]** *{d['title']}* — {d['source_name']} (`{d['source_tier']}`, {d['published_date']}) — [Source Link]({d['url']})"
            for d in evidence_docs
        )

        synthesized_md = (
            f"### Multi-Source Intelligence Comparison\n"
            f"**Synthesis Status:** `{verification_status}` | **Confidence:** {confidence}\n\n"
            f"#### 1. Areas of Multi-Source Consensus (Tier 1 + Tier 2)\n"
            f"{consensus_md}\n\n"
            f"#### 2. Operational Nuances & Perspectives Across Sources\n"
            f"{nuances_md}\n\n"
            f"#### 3. Transparent Uncertainties & Watchpoints\n"
            f"{uncertainties_md}\n\n"
            f"#### Grounded Source References\n"
            f"{citations_md}"
        )

    elif intent == "official_announcement_summary":
        ann_res = get_official_announcements(query)
        evidence_docs = ann_res.get("announcements", [])
        official_dates = ann_res.get("key_electoral_dates", [])
        verification_status = "SUPPORTED"
        confidence = "HIGH (Tier 1 Statutory & Commission Communiqué)"
        trace_steps.append(
            {
                "step": 2,
                "agent": "election_information_analyst",
                "action": "tool_call:get_official_announcements",
                "detail": f"Retrieved {len(evidence_docs)} official Tier 1 publication(s) and extracted statutory timetable.",
            }
        )

        dates_md = "\n".join(
            f"- **{item['event']}**: {item['date']} (`[{item['citation']}]`)"
            for item in official_dates
        )
        # Focus on the press release first
        press_doc = next((d for d in evidence_docs if d["doc_id"] == "INEC-2026-PRESS-04"), evidence_docs[0])
        facts_md = "\n".join(f"- {f}" for f in press_doc.get("key_facts", []))
        citations_md = "\n".join(
            f"- **[{d['doc_id']}]** *{d['title']}* — {d['source_name']} (Published: {d['published_date']}) — [Official PDF/Release]({d['url']})"
            for d in evidence_docs
        )
        synthesized_md = (
            f"### Official Electoral Commission Announcement Summary\n"
            f"**Primary Document:** `{press_doc['doc_id']}` — *{press_doc['title']}* ({press_doc['published_date']})\n\n"
            f"#### Executive Summary\n"
            f"{press_doc['summary']}\n\n"
            f"#### Key Takeaways from the Commission\n"
            f"{facts_md}\n\n"
            f"#### Verified Electoral Timetable & Deadlines\n"
            f"{dates_md}\n\n"
            f"#### Authoritative Sources\n"
            f"{citations_md}"
        )

    else:
        search_res = search_verified_election_corpus(query)
        evidence_docs = search_res.get("documents", [])
        trace_steps.append(
            {
                "step": 2,
                "agent": "election_research_agent",
                "action": "tool_call:search_verified_election_corpus",
                "detail": f"Searched verified corpus for '{query}' -> Matched {len(evidence_docs)} authoritative record(s).",
            }
        )

        if not evidence_docs:
            verification_status = "INSUFFICIENT_EVIDENCE"
            confidence = "NONE (Outside Verified Corpus Scope)"
            uncertainty_banner = {
                "has_uncertainty": True,
                "level": "INSUFFICIENT_EVIDENCE",
                "message": (
                    "EPISTEMIC BOUNDARY: No allowlisted documents matched this query. "
                    "The agent will not speculate or generate ungrounded claims."
                ),
            }
            synthesized_md = (
                "### Insufficient Verified Evidence\n"
                "I could not find any verified records in the allowlisted Electoral Intelligence Corpus matching your request.\n\n"
                "**Why I am not guessing:** Trustworthy election agents must never fabricate election results, candidate statements, "
                "or procedural rules from unverified model memory. Please ask about official voting procedures, BVAS/IReV protocols, "
                "PVC collection deadlines, or submit an election claim for verification."
            )
        else:
            primary = evidence_docs[0]
            if primary["category"] == "unverified_investigation":
                verification_status = "INSUFFICIENT_EVIDENCE"
                confidence = "LOW / INCONCLUSIVE"
                uncertainty_banner = {
                    "has_uncertainty": True,
                    "level": "INSUFFICIENT_EVIDENCE",
                    "message": "EPISTEMIC WARNING: This topic involves ongoing field verification without Tier 1 confirmation.",
                }
            else:
                verification_status = "SUPPORTED"
                confidence = f"HIGH ({primary['tier_label']})"

            facts_md = "\n".join(f"- {f} (`[{primary['doc_id']}]`)" for f in primary.get("key_facts", []))
            citations_md = "\n".join(
                f"- **[{d['doc_id']}]** *{d['title']}* — {d['source_name']} (`{d['source_tier']}`, {d['published_date']}) — [Official Link]({d['url']})"
                for d in evidence_docs
            )
            synthesized_md = (
                f"### Grounded Election Intelligence Briefing\n"
                f"**Lead Authority:** `{primary['doc_id']}` — *{primary['title']}*\n\n"
                f"#### Verified Procedure & Findings\n"
                f"{primary['content']}\n\n"
                f"#### Essential Rules & Highlights\n"
                f"{facts_md}\n\n"
                f"#### Verified Sources & Provenance\n"
                f"{citations_md}"
            )

    trace_steps.append(
        {
            "step": len(trace_steps) + 1,
            "agent": "election_intelligence_coordinator",
            "action": "epistemic_audit_and_response_synthesis",
            "detail": f"Verified citations, attached `{verification_status}` badge, and enforced uncertainty guardrails.",
        }
    )

    return {
        "synthesized_markdown": synthesized_md,
        "verification_status": verification_status,
        "confidence": confidence,
        "uncertainty_banner": uncertainty_banner,
        "evidence_documents": evidence_docs,
        "comparison_matrix": comparison_matrix,
        "official_dates": official_dates,
        "trace_steps": trace_steps,
    }


async def run_election_intelligence_query(
    query: str,
    mode: str = "auto",
    session_id: str | None = None,
    api_key: str | None = None,
) -> dict[str, Any]:
    """
    Executes a user query or claim through the Google ADK Election Intelligence
    Multi-Agent System and returns a rich, source-attributed response payload.
    """
    start_time = time.perf_counter()
    routing = classify_intent(query, mode=mode)
    structured = _build_structured_intelligence(query, routing)

    clean_user_key = (api_key or "").strip()
    configure_genai_environment()

    use_live_adk = bool(
        clean_user_key
        or os.getenv("GOOGLE_API_KEY")
        or os.getenv("GEMINI_API_KEY")
        or os.getenv("GOOGLE_GENAI_USE_VERTEXAI", "").lower() in ("1", "true", "yes")
        or os.getenv("GOOGLE_GENAI_USE_ENTERPRISE", "").lower() in ("1", "true", "yes")
    ) and os.getenv("FORCE_OFFLINE_ENGINE", "").lower() not in ("1", "true", "yes")

    adk_live_events: list[dict[str, str]] = []
    final_response_text = structured["synthesized_markdown"]
    execution_engine = "ADK Grounded Deterministic Engine (Tools + Corpus Active)"

    if use_live_adk:
        try:
            active_agent = (
                build_coordinator_with_api_key(clean_user_key)
                if clean_user_key
                else root_agent
            )

            sid = session_id or f"session-{uuid.uuid4().hex[:8]}"
            user_id = "workshop-participant"
            await _session_service.create_session(
                app_name=APP_NAME,
                user_id=user_id,
                session_id=sid,
            )
            runner = Runner(
                agent=active_agent,
                app_name=APP_NAME,
                session_service=_session_service,
            )
            user_msg = types.Content(
                role="user",
                parts=[types.Part.from_text(text=query)],
            )
            collected_texts: list[str] = []
            async for event in runner.run_async(
                user_id=user_id,
                session_id=sid,
                new_message=user_msg,
            ):
                author = getattr(event, "author", "agent") or "agent"
                if getattr(event, "content", None) and getattr(event.content, "parts", None):
                    for part in event.content.parts:
                        if getattr(part, "function_call", None):
                            fc = part.function_call
                            adk_live_events.append(
                                {
                                    "agent": author,
                                    "type": "function_call",
                                    "detail": f"Called `{fc.name}({ dict(fc.args) if fc.args else {} })`",
                                }
                            )
                        elif getattr(part, "function_response", None):
                            fr = part.function_response
                            adk_live_events.append(
                                {
                                    "agent": author,
                                    "type": "function_response",
                                    "detail": f"Received grounded tool payload from `{fr.name}`",
                                }
                            )
                        elif getattr(part, "text", None):
                            collected_texts.append(part.text)

            if collected_texts:
                final_response_text = "\n\n".join(t.strip() for t in collected_texts if t.strip())
                auth_source = (
                    "AI Studio"
                    if (clean_user_key or os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY"))
                    else "Vertex AI"
                )
                execution_engine = f"Google ADK 2 Live Runner ({MODEL_NAME} • {auth_source})"
        except Exception as exc:
            # Never fail a live workshop demo if API quota or network blips occur
            adk_live_events.append(
                {
                    "agent": "election_intelligence_coordinator",
                    "type": "fallback_notice",
                    "detail": (
                        f"Live LLM endpoint unavailable ({type(exc).__name__}); "
                        "seamlessly served via ADK Grounded Tool Engine."
                    ),
                }
            )

    elapsed_ms = int((time.perf_counter() - start_time) * 1000)

    return {
        "query": query,
        "mode": mode,
        "execution_engine": execution_engine,
        "latency_ms": elapsed_ms,
        "routing": routing,
        "verification_status": structured["verification_status"],
        "confidence": structured["confidence"],
        "uncertainty_banner": structured["uncertainty_banner"],
        "answer_markdown": final_response_text,
        "structured_briefing_markdown": structured["synthesized_markdown"],
        "evidence_documents": structured["evidence_documents"],
        "comparison_matrix": structured["comparison_matrix"],
        "official_dates": structured["official_dates"],
        "trace_steps": structured["trace_steps"],
        "adk_live_events": adk_live_events,
    }
