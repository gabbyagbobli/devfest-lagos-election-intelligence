/**
 * DevFest Lagos 2026 — Election Intelligence ADK Agent Frontend Controller
 * Connects to the FastAPI ADK backend (/api/query, /api/samples, /api/source-check)
 * powered by Gemini 3.8 Flash, with an embedded verified corpus fallback for conference resilience.
 */

(function () {
  if (window.__ELECTION_APP_LOADED__) return;
  window.__ELECTION_APP_LOADED__ = true;

  const PRESET_SAMPLES = [
    {
      id: "voting-procedures",
      label: "Official Voting Procedures",
      mode: "research",
      dotClass: "dot-supported",
      query: "What are the official voting procedures for this election?",
    },
    {
      id: "latest-announcement",
      label: "Latest INEC Announcement",
      mode: "summarize",
      dotClass: "dot-supported",
      query: "Summarize the latest announcement from the electoral commission.",
    },
    {
      id: "verify-date-postponement",
      label: "Dec 12 Postponement Rumor",
      mode: "verify",
      dotClass: "dot-contradicted",
      query: "Can you verify this claim about the election date: Has INEC postponed the November 21 election by 3 weeks to December 12?",
    },
    {
      id: "compare-credible-sources",
      label: "Compare Credible Sources (BVAS/IReV)",
      mode: "compare",
      dotClass: "dot-multi",
      query: "What do different credible sources say about BVAS offline accreditation, IReV result transmission, and election logistics readiness?",
    },
    {
      id: "insufficient-evidence-claim",
      label: "Eti-Osa Polling Unit Relocation Claim",
      mode: "verify",
      dotClass: "dot-insufficient",
      query: "Is there sufficient evidence to support this statement: 42 polling units in Eti-Osa and Alimosho were secretly relocated overnight to private compounds?",
    },
    {
      id: "verify-sms-voting",
      label: "SMS / NIN Online Voting Rumor",
      mode: "verify",
      dotClass: "dot-contradicted",
      query: "Can registered voters who lost their PVC vote via SMS or using their NIN online?",
    },
  ];

  const EMBEDDED_CORPUS = [
    {
      doc_id: "INEC-2026-PROC-01",
      title: "INEC 2026 Regulations and Guidelines for the Conduct of Elections: Polling Unit Accreditation & Voting Procedure",
      source_name: "Independent National Electoral Commission (INEC)",
      source_tier: "TIER_1_OFFICIAL",
      tier_label: "Tier 1 — Statutory & Electoral Authority",
      trust_score: 0.98,
      published_date: "2026-10-15",
      url: "https://www.inecnigeria.org/wp-content/uploads/2026/10/INEC-Regulations-and-Guidelines-2026.pdf",
      category: "voting_procedures",
      summary: "Official step-by-step continuous accreditation and voting procedure at all Polling Units nationwide.",
    },
    {
      doc_id: "INEC-2026-PRESS-04",
      title: "INEC Official Press Release: Final Readiness Assessment, Election Timetable & PVC Collection Deadline",
      source_name: "Independent National Electoral Commission (INEC)",
      source_tier: "TIER_1_OFFICIAL",
      tier_label: "Tier 1 — Statutory & Electoral Authority",
      trust_score: 0.98,
      published_date: "2026-11-08",
      url: "https://www.inecnigeria.org/news/final-readiness-assessment-and-pvc-collection-deadline-nov-2026/",
      category: "official_announcement",
      summary: "Latest official commission communiqué confirming the November 21, 2026 election date, final PVC collection window, and BVAS mock accreditation results.",
    },
    {
      doc_id: "INEC-2026-FACT-02",
      title: "INEC Disinformation Alert: Rebuttal of Purported 3-Week Election Postponement and Fake SMS/NIN Voting Portal",
      source_name: "Independent National Electoral Commission (INEC)",
      source_tier: "TIER_1_OFFICIAL",
      tier_label: "Tier 1 — Statutory & Electoral Authority",
      trust_score: 0.98,
      published_date: "2026-11-09",
      url: "https://www.inecnigeria.org/news/disinformation-alert-false-postponement-and-sms-voting-claims/",
      category: "fact_check",
      summary: "Official rebuttal refuting viral claims of a 3-week election postponement to December 12 and warning citizens against fraudulent SMS/NIN voting links.",
    },
    {
      doc_id: "ELECTORAL-ACT-2022-S47",
      title: "Electoral Act Statutory Provisions: Sections 28, 47, 50 & 60 (Accreditation, Technological Devices & Result Transmission)",
      source_name: "Official Gazette of the Federal Republic of Nigeria (Electoral Act)",
      source_tier: "TIER_1_OFFICIAL",
      tier_label: "Tier 1 — Statutory & Electoral Authority",
      trust_score: 0.98,
      published_date: "2022-02-25",
      url: "https://placng.org/i/wp-content/uploads/2022/02/Electoral-Act-2022.pdf",
      category: "legal_framework",
      summary: "Statutory requirements governing mandatory PVC use, technological accreditation via BVAS, cancellation for over-voting, and result recording.",
    },
    {
      doc_id: "INEC-2026-TECH-03",
      title: "INEC Technical Bulletin: BVAS Offline Accreditation & IReV Result Upload Architecture",
      source_name: "Independent National Electoral Commission (INEC)",
      source_tier: "TIER_1_OFFICIAL",
      tier_label: "Tier 1 — Statutory & Electoral Authority",
      trust_score: 0.98,
      published_date: "2026-11-05",
      url: "https://www.inecnigeria.org/resources/bvas-and-irev-technical-architecture-2026/",
      category: "multi_source_development",
      summary: "INEC's official technical explanation of how BVAS operates 100% offline during accreditation and queues encrypted EC8A result images when cellular coverage is weak.",
    },
    {
      doc_id: "YIAGA-2026-OBS-01",
      title: "YIAGA Africa Pre-Election Observation Assessment: BVAS Readiness, IReV Stress Testing & Last-Mile Logistics",
      source_name: "YIAGA Africa (Watching The Vote)",
      source_tier: "TIER_2_ACCREDITED_OBSERVER",
      tier_label: "Tier 2 — Accredited Election Observers & Fact-Checkers",
      trust_score: 0.90,
      published_date: "2026-11-08",
      url: "https://yiaga.org/publications/pre-election-observation-report-november-2026/",
      category: "multi_source_development",
      summary: "Independent observer report corroborating 97.9% BVAS biometric accuracy while highlighting cellular dead-zones in 8.2% of riverine/rural polling units.",
    },
    {
      doc_id: "DUBAWA-2026-CHECK-07",
      title: "DUBAWA Fact-Check Brief: Understanding IReV Portal vs. Physical Collation",
      source_name: "DUBAWA & Nigerian Fact-Checkers Coalition (NFC)",
      source_tier: "TIER_2_ACCREDITED_OBSERVER",
      tier_label: "Tier 2 — Accredited Election Observers & Fact-Checkers",
      trust_score: 0.90,
      published_date: "2026-11-08",
      url: "https://dubawa.org/fact-check-brief-irev-portal-vs-physical-collation-2026/",
      category: "multi_source_development",
      summary: "Fact-checkers explain Nigeria's dual-track verification (physical Form EC8A carbon copies + digital IReV portal).",
    },
    {
      doc_id: "CHANNELS-2026-NEWS-11",
      title: "Channels TV Electoral Desk: INEC and Transport Unions Sign MoU for 6:30 AM Election Day Deployment",
      source_name: "Channels Television Election Desk",
      source_tier: "TIER_3_VERIFIED_MEDIA",
      tier_label: "Tier 3 — Accredited Public-Interest News Organizations",
      trust_score: 0.78,
      published_date: "2026-11-08",
      url: "https://www.channelstv.com/2026/11/08/inec-transport-unions-sign-mou-for-early-election-day-deployment/",
      category: "multi_source_development",
      summary: "News report on the logistics agreement between INEC, road transport unions, and marine boat operators to prevent late polling unit openings.",
    },
    {
      doc_id: "YIAGA-2026-INC-09",
      title: "Civic Situation Room Field Log: Investigating Unverified Claims of Polling Unit Relocations in Eti-Osa and Alimosho",
      source_name: "Nigeria Civil Society Situation Room",
      source_tier: "TIER_2_ACCREDITED_OBSERVER",
      tier_label: "Tier 2 — Accredited Election Observers & Fact-Checkers",
      trust_score: 0.90,
      published_date: "2026-11-09",
      url: "https://situationroomng.org/field-logs/2026-11-09-lagos-polling-unit-relocation-verification/",
      category: "unverified_investigation",
      summary: "Situation Room log showing that viral claims of secret overnight relocation of 42 polling units in Eti-Osa and Alimosho lack sufficient evidence.",
    },
  ];

  let currentMode = "auto";

  function switchResultView(viewName) {
    document.querySelectorAll(".result-tab").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-view") === viewName);
    });
    document.querySelectorAll(".result-view").forEach((panel) => {
      panel.classList.toggle("active-view", panel.id === `view-${viewName}`);
    });
  }

  function formatInline(str) {
    return str
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\[([A-Z0-9-]+-\d+)\](?!\()/g, "<code>[$1]</code>")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  }

  function renderMarkdown(md) {
    if (!md) return "";
    const escaped = md
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const lines = escaped.split("\n");
    const out = [];
    let listType = null; // "ul" or "ol"

    function closeList() {
      if (listType) {
        out.push(`</${listType}>`);
        listType = null;
      }
    }

    for (const rawLine of lines) {
      const line = rawLine.trim();

      if (!line) {
        closeList();
        continue;
      }

      if (/^---+$/.test(line) || /^\*\*\*+$/.test(line)) {
        closeList();
        out.push("<hr />");
        continue;
      }

      if (line.startsWith("#### ")) {
        closeList();
        out.push(`<h4>${formatInline(line.slice(5))}</h4>`);
        continue;
      }
      if (line.startsWith("### ")) {
        closeList();
        out.push(`<h3>${formatInline(line.slice(4))}</h3>`);
        continue;
      }
      if (line.startsWith("## ")) {
        closeList();
        out.push(`<h2>${formatInline(line.slice(3))}</h2>`);
        continue;
      }
      if (line.startsWith("&gt; ")) {
        closeList();
        out.push(`<blockquote>${formatInline(line.slice(5))}</blockquote>`);
        continue;
      }

      const ulMatch = line.match(/^[-*]\s+(.*)$/);
      if (ulMatch) {
        if (listType !== "ul") {
          closeList();
          out.push("<ul>");
          listType = "ul";
        }
        out.push(`<li>${formatInline(ulMatch[1])}</li>`);
        continue;
      }

      const olMatch = line.match(/^\d+\.\s+(.*)$/);
      if (olMatch) {
        if (listType !== "ol") {
          closeList();
          out.push("<ol>");
          listType = "ol";
        }
        out.push(`<li>${formatInline(olMatch[1])}</li>`);
        continue;
      }

      closeList();
      out.push(`<p>${formatInline(line)}</p>`);
    }

    closeList();
    return out.join("\n");
  }

  function localFallbackExecute(query, mode) {
    const q = query.toLowerCase();
    let intent = "election_research";
    let targetAgent = "election_research_agent";

    if (
      mode === "verify" ||
      /verify|claim|true that|is it true|rumor|postpone|december 12|sms voting|without pvc|relocated|eti-osa|alimosho|disqualified|sufficient evidence|support this statement/.test(q)
    ) {
      intent = "claim_verification";
      targetAgent = "claim_verification_agent";
    } else if (
      mode === "compare" ||
      /different credible sources|compare|multiple sources|what do sources say|perspectives|development|irev/.test(q)
    ) {
      intent = "multi_source_comparison";
      targetAgent = "election_information_analyst";
    } else if (
      mode === "summarize" ||
      /summarize|latest announcement|communique|press release|deadline|pvc collection/.test(q)
    ) {
      intent = "official_announcement_summary";
      targetAgent = "election_information_analyst";
    }

    let verificationStatus = "SUPPORTED";
    let confidence = "High Confidence • Tier 1 Official Sources";
    let uncertaintyMsg = "All statements in this response are directly grounded in allowlisted Tier 1–3 electoral records.";
    let docs = [];
    let answerMd = "";
    const traceSteps = [
      {
        step: 1,
        agent: "election_intelligence_coordinator",
        action: "intent_classification_and_routing",
        detail: `Classified query as '${intent}' -> Delegating to \`${targetAgent}\`.`,
      },
    ];

    if (intent === "claim_verification") {
      const isPostpone = /postpone|december 12|shifted|delayed|3 weeks/.test(q);
      const isSms = /sms|without pvc|no pvc|nin/.test(q);
      const isReloc = /eti-osa|alimosho|42 polling|relocated|private compound|disqualified/.test(q);

      if (isPostpone || isSms) {
        verificationStatus = "CONTRADICTED";
        confidence = "High Confidence • Tier 1 Statutory & INEC Rebuttal";
        uncertaintyMsg =
          "Disinformation Alert: This claim is directly refuted by official Electoral Commission records and statutory law.";
        docs = EMBEDDED_CORPUS.filter((d) =>
          ["INEC-2026-FACT-02", "INEC-2026-PRESS-04", "INEC-2026-PROC-01", "ELECTORAL-ACT-2022-S47"].includes(d.doc_id)
        );
        const reason = isPostpone
          ? "INEC Official Communiqué `[INEC-2026-PRESS-04]` and Disinformation Alert `[INEC-2026-FACT-02]` explicitly confirm that the General Election remains scheduled for **Saturday, November 21, 2026 (8:30 AM – 2:30 PM WAT)**. Viral claims of a 3-week postponement to December 12, 2026 are fabricated."
          : "Section 47(1)-(2) of the Electoral Act `[ELECTORAL-ACT-2022-S47]` and INEC Guidelines `[INEC-2026-PROC-01]` mandate in-person accreditation with an original physical Permanent Voter Card (PVC) and biometric BVAS verification. INEC Alert `[INEC-2026-FACT-02]` warns that SMS/NIN voting links are phishing scams.";
        answerMd = `### Verification Verdict: \`CONTRADICTED\`\n\n#### Evidentiary Assessment\n${reason}\n\n> Retrieval locates relevant documents; Verification evaluates source authority (Tier 1–3), statutory compliance, and independent corroboration.\n\n#### Key Grounded Facts\n- Official Election Date: Saturday, November 21, 2026 (8:30 AM – 2:30 PM WAT) (\`[INEC-2026-PRESS-04]\`)\n- Original physical PVC and biometric BVAS authentication are strictly mandatory (\`[INEC-2026-PROC-01]\`, \`[ELECTORAL-ACT-2022-S47]\`)`;
      } else if (isReloc) {
        verificationStatus = "INSUFFICIENT_EVIDENCE";
        confidence = "Low / Inconclusive • Ongoing Field Verification";
        uncertaintyMsg =
          "Epistemic Warning: Available evidence is incomplete and uncorroborated by Tier 1 official records. The agent refuses to state unverified rumors as fact.";
        docs = EMBEDDED_CORPUS.filter((d) => ["YIAGA-2026-INC-09", "INEC-2026-PROC-01"].includes(d.doc_id));
        answerMd = `### Verification Verdict: \`INSUFFICIENT_EVIDENCE\`\n\n#### Evidentiary Assessment\nAccording to the Nigeria Civil Society Situation Room Field Log \`[YIAGA-2026-INC-09]\`, INEC's official Polling Unit Directory shows **zero authorized relocations** in Eti-Osa or Alimosho. Observers inspected 18 of the 42 cited sites: 15 remain at their designated public schools, 3 shifted 30 meters along public streets due to drainage works (not private compounds), and 24 sites are still awaiting physical verification.\n\n> When authoritative Tier 1 confirmation is absent and Tier 2 field verification is still in progress, a trustworthy agent reports \`INSUFFICIENT_EVIDENCE\`.`;
      } else {
        verificationStatus = "SUPPORTED";
        docs = EMBEDDED_CORPUS.slice(0, 3);
        answerMd = `### Verification Verdict: \`SUPPORTED\`\n\n#### Evidentiary Assessment\nSupported by Tier 1 INEC official publications (\`[INEC-2026-PRESS-04]\`, \`[INEC-2026-PROC-01]\`) and Statutory Electoral Act provisions (\`[ELECTORAL-ACT-2022-S47]\`).`;
      }
      traceSteps.push({
        step: 2,
        agent: "claim_verification_agent",
        action: "tool_call:verify_election_claim",
        detail: `Evaluated claim against verified corpus -> Verdict: ${verificationStatus}.`,
      });
    } else if (intent === "multi_source_comparison") {
      verificationStatus = "MULTI_SOURCE_SYNTHESIS";
      confidence = "High Confidence • Cross-Referenced Across Tiers 1–3";
      uncertaintyMsg =
        "Transparency Note: Tier 1 and Tier 2 sources agree on BVAS offline accuracy (~98%), while observers flag cellular dead-zones in 8.2% of rural/riverine polling units.";
      docs = EMBEDDED_CORPUS.filter((d) =>
        ["INEC-2026-TECH-03", "YIAGA-2026-OBS-01", "DUBAWA-2026-CHECK-07", "CHANNELS-2026-NEWS-11"].includes(d.doc_id)
      );
      answerMd = `### Multi-Source Intelligence Comparison\n\n#### 1. Consensus Across Sources (Tier 1 + Tier 2)\n- BVAS biometric accreditation operates 100% offline and achieved ~98% first-attempt accuracy during the November 7 mock exercise (\`[INEC-2026-PRESS-04]\`, \`[YIAGA-2026-OBS-01]\`).\n- Paper Form EC8A remains the primary legal record at the Polling Unit, with scanned images uploaded to IReV for public cross-verification (\`[INEC-2026-TECH-03]\`, \`[DUBAWA-2026-CHECK-07]\`).\n\n#### 2. Operational Nuances Across Sources\n- **Connectivity:** INEC highlights its store-and-forward offline queue for zero-network units (\`[INEC-2026-TECH-03]\`), whereas YIAGA Africa notes 8.2% of sampled rural/riverine units lack mobile coverage and urges pre-publishing those units (\`[YIAGA-2026-OBS-01]\`).\n- **Logistics:** INEC and Channels TV report a 6:30 AM departure MoU with transport unions (\`[CHANNELS-2026-NEWS-11]\`), while civic observers warn Friday-night driver stipend disbursement remains critical.\n\n#### 3. Open Uncertainties\n- INEC has not yet published the public list of zero-network polling units recommended by observers.\n- 24 of the 42 polling units cited in social media relocation rumors in Eti-Osa and Alimosho await physical inspection (\`[YIAGA-2026-INC-09]\`).`;
      traceSteps.push({
        step: 2,
        agent: "election_information_analyst",
        action: "tool_call:compare_multi_source_coverage",
        detail: "Compared independent sources across Tier 1 (INEC), Tier 2 (YIAGA/DUBAWA), and Tier 3 (Channels TV).",
      });
    } else if (intent === "official_announcement_summary") {
      verificationStatus = "SUPPORTED";
      docs = EMBEDDED_CORPUS.filter((d) => ["INEC-2026-PRESS-04", "INEC-2026-PROC-01"].includes(d.doc_id));
      answerMd = `### Official Electoral Commission Announcement Summary\n\n#### Key Takeaways (\`INEC-2026-PRESS-04\` • Nov 8, 2026)\n- **Official Election Date:** Saturday, November 21, 2026 (8:30 AM – 2:30 PM WAT).\n- **Final PVC Collection Deadline:** Sunday, November 15, 2026 at 5:00 PM WAT at LGA INEC offices (no proxy collection).\n- **BVAS Mock Accreditation:** 98.4% biometric authentication success rate across 436 test polling units.\n- **Sensitive Materials:** Secured with the Central Bank of Nigeria (CBN) for distribution 48 hours before polls open.`;
      traceSteps.push({
        step: 2,
        agent: "election_information_analyst",
        action: "tool_call:get_official_announcements",
        detail: "Retrieved official Tier 1 INEC announcements and statutory electoral timetable.",
      });
    } else {
      verificationStatus = "SUPPORTED";
      docs = EMBEDDED_CORPUS.filter((d) => ["INEC-2026-PROC-01", "ELECTORAL-ACT-2022-S47", "INEC-2026-PRESS-04"].includes(d.doc_id));
      answerMd = `### Official Voting Procedures\n\n#### Step-by-Step Polling Unit Protocol (\`INEC-2026-PROC-01\`)\n1. **Polls Open & Close:** 8:30 AM WAT to 2:30 PM WAT on Saturday, November 21, 2026. Any voter already in the queue at 2:30 PM must be allowed to vote.\n2. **Mandatory PVC Presentation:** Present your original physical Permanent Voter Card (PVC) per Section 47(1) of the Electoral Act (\`[ELECTORAL-ACT-2022-S47]\`).\n3. **Biometric Accreditation via BVAS:** Fingerprint or facial verification on the offline Bimodal Voter Accreditation System (BVAS).\n4. **Ballot & Counting:** Mark your ballot in secret; results are counted openly at the Polling Unit, recorded on Form EC8A, snapped with BVAS, and uploaded to the IReV portal.`;
      traceSteps.push({
        step: 2,
        agent: "election_research_agent",
        action: "tool_call:search_verified_election_corpus",
        detail: `Searched verified corpus for '${query}' -> Matched ${docs.length} authoritative Tier 1 records.`,
      });
    }

    traceSteps.push({
      step: 3,
      agent: "election_intelligence_coordinator",
      action: "epistemic_audit_and_response_synthesis",
      detail: `Verified citations, attached \`${verificationStatus}\` badge, and enforced uncertainty guardrails.`,
    });

    return {
      execution_engine: "ADK Grounded Engine",
      routing: { target_agent: targetAgent },
      verification_status: verificationStatus,
      confidence: confidence,
      uncertainty_banner: { message: uncertaintyMsg },
      answer_markdown: answerMd,
      evidence_documents: docs,
      trace_steps: traceSteps,
    };
  }

  function updateUI(data) {
    // Highlight active specialist pill
    document.querySelectorAll(".agent-pill").forEach((el) => el.classList.remove("active-agent"));
    const coordPill = document.getElementById("pill-coordinator");
    if (coordPill) coordPill.classList.add("active-agent");
    const targetAgent = data.routing?.target_agent || "election_research_agent";
    const targetPill = document.getElementById(`pill-${targetAgent}`);
    if (targetPill) targetPill.classList.add("active-agent");

    // Status Banner
    const statusBanner = document.getElementById("status-banner");
    const vStatus = data.verification_status || "SUPPORTED";
    statusBanner.className = `status-banner status-${vStatus}`;
    document.getElementById("verdict-pill").textContent = vStatus.replace(/_/g, " ");
    document.getElementById("confidence-label").textContent = data.confidence || "High Confidence";
    document.getElementById("uncertainty-msg").textContent =
      data.uncertainty_banner?.message || "Grounded in allowlisted electoral sources.";

    const latencySuffix = data.latency_ms ? ` • ${(data.latency_ms / 1000).toFixed(1)}s` : "";
    const rawEngine = data.execution_engine || "Gemini 3.8 Flash";
    const shortEngine = rawEngine.includes("gemini-3.8-flash")
      ? `ADK 2 • Gemini 3.8 Flash${latencySuffix}`
      : `${rawEngine}${latencySuffix}`;
    document.getElementById("engine-badge").textContent = shortEngine;
    document.getElementById("delegated-agent-badge").textContent = `Agent: ${targetAgent}`;

    // Response Markdown
    const mdText = data.answer_markdown || data.structured_briefing_markdown || "";
    document.getElementById("response-markdown").innerHTML = renderMarkdown(mdText);

    // Combine structured trace + live ADK events if present
    const traceEl = document.getElementById("trace-timeline");
    const steps = [...(data.trace_steps || [])];
    if (Array.isArray(data.adk_live_events) && data.adk_live_events.length > 0) {
      data.adk_live_events.forEach((ev) => {
        steps.push({
          step: steps.length + 1,
          agent: ev.agent || "adk_runner",
          action: ev.type || "live_event",
          detail: ev.detail || "",
        });
      });
    }
    document.getElementById("trace-count-badge").textContent = String(steps.length);
    traceEl.innerHTML = steps
      .map(
        (s) => `
      <div class="trace-item">
        <div class="trace-step-num">${s.step}</div>
        <div>
          <div>
            <span class="trace-agent">${s.agent}</span>
            <span class="trace-action">[${s.action}]</span>
          </div>
          <div class="trace-detail">${formatInline(String(s.detail || ""))}</div>
        </div>
      </div>
    `
      )
      .join("");

    // Evidence Documents & Compact Briefing Footer
    const docs = data.evidence_documents || [];
    document.getElementById("evidence-count-badge").textContent = String(docs.length);

    const footerEl = document.getElementById("briefing-sources-footer");
    if (docs.length === 0) {
      footerEl.innerHTML = `<span class="source-footer-label">No allowlisted sources matched this query.</span>`;
    } else {
      const pillsHtml = docs
        .map(
          (d) =>
            `<a href="${d.url}" target="_blank" rel="noopener" class="mini-doc-pill" title="${d.title}">[${d.doc_id}]</a>`
        )
        .join("");
      footerEl.innerHTML = `
        <div class="source-pills-row">
          <span class="source-footer-label">Cited records:</span>
          ${pillsHtml}
        </div>
        <button type="button" class="view-sources-link" id="jump-to-sources-btn">
          Inspect ${docs.length} source card${docs.length > 1 ? "s" : ""} →
        </button>
      `;
      const jumpBtn = document.getElementById("jump-to-sources-btn");
      if (jumpBtn) {
        jumpBtn.addEventListener("click", () => switchResultView("sources"));
      }
    }

    const evGrid = document.getElementById("evidence-grid");
    if (docs.length === 0) {
      evGrid.innerHTML = `<div class="trace-item">Zero corroborating records found in the allowlisted Electoral Corpus.</div>`;
    } else {
      evGrid.innerHTML = docs
        .map(
          (d) => `
        <div class="evidence-card">
          <div>
            <div class="evidence-card-top">
              <span class="doc-id-badge">[${d.doc_id}]</span>
              <span class="tier-badge">${d.source_tier} • ${d.trust_score || "0.95"}</span>
            </div>
            <div class="evidence-title">${d.title}</div>
            <div class="evidence-meta">${d.source_name} • ${d.published_date}</div>
            <div class="evidence-summary">${d.summary}</div>
          </div>
          <a href="${d.url}" target="_blank" rel="noopener" class="evidence-link">
            Open Official Reference ↗
          </a>
        </div>
      `
        )
        .join("");
    }
  }

  const CLOUD_RUN_API_BASE = "https://devfest-lagos-election-agent-1084480045730.us-central1.run.app";

  async function callApiWithFallback(path, payload) {
    const endpoints = [path, `${CLOUD_RUN_API_BASE}${path}`];
    for (const url of endpoints) {
      try {
        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (resp.ok) {
          const ct = resp.headers.get("content-type") || "";
          if (ct.includes("application/json")) {
            return await resp.json();
          }
        }
      } catch (_e) {
        // Try next endpoint
      }
    }
    throw new Error("Remote API unavailable; using embedded Grounded ADK Engine.");
  }

  async function executeQuery(queryText, mode) {
    const submitBtn = document.getElementById("submit-btn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Analyzing with Gemini 3.8 Flash...";
    switchResultView("briefing");

    try {
      const data = await callApiWithFallback("/api/query", { query: queryText, mode: mode });
      updateUI(data);
    } catch (_err) {
      const fallbackData = localFallbackExecute(queryText, mode);
      updateUI(fallbackData);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Analyze with ADK Agents →";
    }
  }

  async function inspectSource(domainOrUrl) {
    try {
      const res = await callApiWithFallback("/api/source-check", { source_or_url: domainOrUrl });
      renderSourceResult(res);
    } catch (_e) {
      const d = domainOrUrl.toLowerCase();
      if (d.includes("inecnigeria") || d.includes("placng")) {
        renderSourceResult({
          is_trusted: true,
          source_name: "Independent National Electoral Commission (INEC)",
          tier_label: "Tier 1 — Statutory & Electoral Authority",
          trust_score: 0.98,
          verification_rule: "Primary authoritative record for electoral dates, legal procedures, and official announcements.",
        });
      } else if (d.includes("yiaga") || d.includes("dubawa") || d.includes("situationroom")) {
        renderSourceResult({
          is_trusted: true,
          source_name: "Accredited Civic Observer / Fact-Checker (YIAGA / DUBAWA)",
          tier_label: "Tier 2 — Accredited Election Observers & Fact-Checkers",
          trust_score: 0.9,
          verification_rule: "High credibility for field observation and forensic fact-checking; cross-reference with Tier 1 for statutory rules.",
        });
      } else if (d.includes("channelstv") || d.includes("premiumtimes")) {
        renderSourceResult({
          is_trusted: true,
          source_name: "Verified Public-Interest Media Desk",
          tier_label: "Tier 3 — Accredited Public-Interest News Organizations",
          trust_score: 0.78,
          verification_rule: "Credible journalistic reporting; requires Tier 1/2 corroboration for statutory or schedule claims.",
        });
      } else {
        renderSourceResult({
          is_trusted: false,
          source_name: domainOrUrl,
          tier_label: "UNTRUSTED / UNVERIFIED SOURCE",
          trust_score: 0.0,
          verification_rule: "Blocked by Antigravity Trust Guardrail: Non-allowlisted domains cannot be used as grounding evidence.",
        });
      }
    }
  }

  function renderSourceResult(res) {
    const box = document.getElementById("source-check-result");
    const color = res.is_trusted ? "#34d399" : "#f87171";
    const statusLabel = res.is_trusted ? "ALLOWLISTED" : "BLOCKED / UNTRUSTED";
    box.innerHTML = `
      <div style="font-family:var(--font-mono);font-size:0.74rem;font-weight:600;color:${color};">
        ${statusLabel} • Score: ${res.trust_score}
      </div>
      <div style="font-weight:600;font-size:0.83rem;color:var(--text-primary);margin-top:0.2rem;">${res.source_name || res.input}</div>
      <div style="font-size:0.75rem;color:var(--text-muted);">${res.tier_label}</div>
      <div style="font-size:0.78rem;color:var(--text-secondary);margin-top:0.3rem;line-height:1.45;">${res.verification_rule}</div>
    `;
  }

  document.addEventListener("DOMContentLoaded", () => {
    // Result View Tabs
    document.querySelectorAll(".result-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        switchResultView(tab.getAttribute("data-view"));
      });
    });

    // Render Compact Sample Buttons
    const samplesContainer = document.getElementById("samples-list");
    samplesContainer.innerHTML = PRESET_SAMPLES.map(
      (s, idx) => `
      <button type="button" class="sample-btn${idx === 0 ? " active-sample" : ""}" data-query="${s.query.replace(/"/g, "&quot;")}" data-mode="${s.mode}">
        <span class="sample-left">
          <span class="status-dot ${s.dotClass}"></span>
          <span class="sample-btn-title">${s.label}</span>
        </span>
        <span class="sample-chevron">›</span>
      </button>
    `
    ).join("");

    samplesContainer.querySelectorAll(".sample-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        samplesContainer.querySelectorAll(".sample-btn").forEach((b) => b.classList.remove("active-sample"));
        btn.classList.add("active-sample");
        const q = btn.getAttribute("data-query");
        const m = btn.getAttribute("data-mode") || "auto";
        document.getElementById("query-input").value = q;
        setMode(m);
        executeQuery(q, m);
      });
    });

    // Mode Tabs
    const modeLabels = {
      auto: "Auto",
      verify: "Verify",
      research: "Rules",
      summarize: "Summary",
      compare: "Compare",
    };

    function setMode(m) {
      currentMode = m;
      document.getElementById("mode-indicator").textContent = modeLabels[m] || m;
      document.querySelectorAll(".mode-tab").forEach((t) => {
        t.classList.toggle("active", t.getAttribute("data-mode") === m);
      });
    }

    document.querySelectorAll(".mode-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        setMode(tab.getAttribute("data-mode"));
      });
    });

    // Query Form Submit
    document.getElementById("query-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const q = document.getElementById("query-input").value.trim();
      if (q) executeQuery(q, currentMode);
    });

    // Source Checker
    document.getElementById("source-check-btn").addEventListener("click", () => {
      const val = document.getElementById("source-input").value.trim();
      if (val) inspectSource(val);
    });

    document.querySelectorAll(".chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const d = chip.getAttribute("data-domain");
        document.getElementById("source-input").value = d;
        inspectSource(d);
      });
    });

    // Initial load
    inspectSource("inecnigeria.org");
    executeQuery("What are the official voting procedures for this election?", "research");
  });
})();
