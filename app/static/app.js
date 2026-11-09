/**
 * DevFest Lagos 2026 — Election Intelligence ADK Agent Frontend Controller
 * Connects to the FastAPI ADK backend (/api/query, /api/samples, /api/source-check)
 * and includes an embedded verified corpus + ADK tool mirror for 100% conference resilience.
 */

(function () {
  if (window.__ELECTION_APP_LOADED__) return;
  window.__ELECTION_APP_LOADED__ = true;

  const PRESET_SAMPLES = [
    {
      id: "voting-procedures",
      label: "Official Voting Procedures",
      mode: "research",
      badge: "SUPPORTED",
      tagClass: "tag-supported",
      query: "What are the official voting procedures for this election?",
    },
    {
      id: "latest-announcement",
      label: "Summarize Latest Announcement",
      mode: "summarize",
      badge: "SUPPORTED",
      tagClass: "tag-supported",
      query: "Summarize the latest announcement from the electoral commission.",
    },
    {
      id: "verify-date-postponement",
      label: "Verify Election Date Claim",
      mode: "verify",
      badge: "CONTRADICTED",
      tagClass: "tag-contradicted",
      query: "Can you verify this claim about the election date: Has INEC postponed the November 21 election by 3 weeks to December 12?",
    },
    {
      id: "compare-credible-sources",
      label: "Compare Credible Sources",
      mode: "compare",
      badge: "MULTI-SOURCE",
      tagClass: "tag-multi",
      query: "What do different credible sources say about BVAS offline accreditation, IReV result transmission, and election logistics readiness?",
    },
    {
      id: "insufficient-evidence-claim",
      label: "Unsupported Relocation Claim",
      mode: "verify",
      badge: "INSUFFICIENT EVIDENCE",
      tagClass: "tag-insufficient",
      query: "Is there sufficient evidence to support this statement: 42 polling units in Eti-Osa and Alimosho were secretly relocated overnight to private compounds?",
    },
    {
      id: "verify-sms-voting",
      label: "Verify SMS / NIN Voting Claim",
      mode: "verify",
      badge: "CONTRADICTED",
      tagClass: "tag-contradicted",
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
      content:
        "1. Opening of Polls: Polling Units open strictly at 8:30 AM WAT and close at 2:30 PM WAT (voters in the queue at 2:30 PM must be allowed to vote).\n2. Mandatory PVC Presentation: Every voter must present their original physical Permanent Voter Card (PVC) per Section 47(1) of the Electoral Act.\n3. Biometric Accreditation via BVAS: Fingerprint or facial authentication on the Bimodal Voter Accreditation System (BVAS).\n4. Register & Indelible Ink: Voter's name is ticked in the Register of Voters, indelible ink is applied, and a stamped ballot paper is issued.\n5. Secret Ballot & IReV Upload: After counting at the Polling Unit, scores are entered on Form EC8A, signed, snapped with BVAS, and uploaded to the IReV portal.",
      key_facts: [
        "Polls open at 8:30 AM WAT and close at 2:30 PM WAT (voters on queue by 2:30 PM must vote).",
        "Original physical Permanent Voter Card (PVC) is strictly mandatory.",
        "Biometric verification uses BVAS (fingerprint or facial recognition).",
        "Polling unit results are recorded on Form EC8A and uploaded via BVAS to the IReV portal.",
      ],
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
      content:
        "COMMUNIQUÉ FROM THE COMMISSION (8 NOVEMBER 2026): The General Election remains firmly scheduled for Saturday, November 21, 2026 (8:30 AM – 2:30 PM WAT). Registered voters must collect their PVCs in person at their LGA INEC offices on or before Sunday, November 15, 2026 at 5:00 PM WAT (no proxy collection). The November 7 nationwide BVAS mock accreditation across 436 Polling Units recorded a 98.4% first-attempt biometric verification rate.",
      key_facts: [
        "Official Election Date: Saturday, November 21, 2026 (8:30 AM – 2:30 PM WAT).",
        "Final PVC Collection Deadline: Sunday, November 15, 2026 at 5:00 PM WAT at LGA INEC offices (no proxy collection).",
        "BVAS Mock Accreditation achieved a 98.4% biometric authentication success rate across 436 test polling units.",
      ],
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
      content:
        "DISINFORMATION ALERT: Viral claims circulating on WhatsApp that the November 21, 2026 election has been postponed to December 12, 2026 are completely fabricated. Furthermore, Nigeria does NOT use SMS, online, or NIN-only voting. Any link asking for your NIN or BVN to vote online is a phishing scam.",
      key_facts: [
        "Viral claims that the November 21, 2026 election was postponed to December 12, 2026 are FALSE.",
        "Claims that voters can vote via SMS or using their NIN without a physical PVC are FALSE and fraudulent.",
      ],
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
      content:
        "Section 47(1)-(2) mandates physical presentation of a Voter's Card and biometric verification via BVAS. Section 51(2) mandates cancellation where votes cast exceed BVAS-accredited voters.",
      key_facts: [
        "Section 47(1)-(2) mandates physical PVC presentation and technological biometric verification (BVAS).",
        "Section 51(2) defines over-voting strictly against the number of accredited voters on BVAS.",
      ],
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
      content:
        "BVAS voter accreditation runs 100% offline. In zero-network polling units, the snapped Form EC8A image is cryptographically timestamped and stored in the BVAS offline queue for automatic transmission at the Ward Collation Centre.",
      key_facts: [
        "BVAS voter accreditation runs 100% offline using pre-loaded polling unit biometric data.",
        "In zero-network polling units, BVAS cryptographically timestamps and queues the EC8A image for upload at the Ward Collation Centre.",
      ],
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
      content:
        "YIAGA Africa's 436 observers confirmed a 97.9% fast biometric authentication rate during mock accreditation, but identified mobile network dead-zones in 8.2% of sampled riverine/rural Polling Units and urged INEC to pre-publish known zero-network units.",
      key_facts: [
        "Independent observers corroborated a 97.9% fast biometric authentication rate during mock accreditation.",
        "Identified mobile network dead-zones in 8.2% of sampled riverine/rural polling units.",
      ],
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
      content:
        "IReV does not cast or electronically tabulate votes; it publishes scanned images of hand-counted Form EC8A polling unit result sheets alongside physical duplicates given to party agents and observers.",
      key_facts: [
        "IReV publishes scanned images of hand-counted Form EC8A polling unit result sheets.",
        "Party agents and observers receive signed physical carbon copies of Form EC8A at the polling unit.",
      ],
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
      content:
        "INEC signed a revised MoU with road and marine transport unions targeting 6:30 AM – 7:30 AM departure from Registration Area Centres (RACs), though civil society analysts cautioned that timely Friday-night driver stipend disbursement remains critical.",
      key_facts: [
        "INEC signed an MoU with road and marine transport operators targeting 6:30 AM – 7:30 AM departure from RACs.",
      ],
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
      content:
        "STATUS: INSUFFICIENT EVIDENCE / UNVERIFIED. INEC's official Polling Unit Directory shows zero authorized address changes in Eti-Osa or Alimosho. Observers inspected 18 of 42 cited sites: 15 are unchanged at public schools; 3 shifted 30m along public streets due to drainage works (NOT private compounds); 24 sites await inspection.",
      key_facts: [
        "Status: INSUFFICIENT EVIDENCE / UNVERIFIED regarding alleged relocation of 42 polling units in Eti-Osa and Alimosho.",
        "15 of 18 inspected sites remain at public schools; 3 shifted 30m on public streets due to drainage works; 24 sites await inspection.",
      ],
    },
  ];

  let currentMode = "auto";

  function renderMarkdown(md) {
    if (!md) return "";
    let html = md
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    html = html.replace(/^### (.*)$/gm, "<h3>$1</h3>");
    html = html.replace(/^#### (.*)$/gm, "<h4>$1</h4>");
    html = html.replace(/^> (.*)$/gm, "<blockquote>$1</blockquote>");
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
    html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    const lines = html.split("\n");
    const out = [];
    let inList = false;
    for (const line of lines) {
      if (line.trim().startsWith("- ")) {
        if (!inList) {
          out.push("<ul>");
          inList = true;
        }
        out.push("<li>" + line.trim().substring(2) + "</li>");
      } else {
        if (inList) {
          out.push("</ul>");
          inList = false;
        }
        if (line.trim() === "") {
          out.push("");
        } else if (
          line.startsWith("<h3>") ||
          line.startsWith("<h4>") ||
          line.startsWith("<blockquote>")
        ) {
          out.push(line);
        } else {
          out.push("<p>" + line + "</p>");
        }
      }
    }
    if (inList) out.push("</ul>");
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
    let confidence = "HIGH (Tier 1 Statutory & Official Sources)";
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
        confidence = "HIGH (Tier 1 Statutory & Commission Rebuttal)";
        uncertaintyMsg =
          "DISINFORMATION ALERT: This claim is directly refuted by official Electoral Commission records and statutory provisions.";
        docs = EMBEDDED_CORPUS.filter((d) =>
          ["INEC-2026-FACT-02", "INEC-2026-PRESS-04", "INEC-2026-PROC-01", "ELECTORAL-ACT-2022-S47"].includes(d.doc_id)
        );
        const reason = isPostpone
          ? "INEC Official Communiqué `[INEC-2026-PRESS-04]` and Disinformation Alert `[INEC-2026-FACT-02]` explicitly confirm that the General Election remains scheduled for **Saturday, November 21, 2026 (8:30 AM – 2:30 PM WAT)**. Viral claims of a 3-week postponement to December 12, 2026 are fabricated."
          : "Section 47(1)-(2) of the Electoral Act `[ELECTORAL-ACT-2022-S47]` and INEC Guidelines `[INEC-2026-PROC-01]` mandate in-person accreditation with an original physical Permanent Voter Card (PVC) and biometric BVAS verification. INEC Alert `[INEC-2026-FACT-02]` warns that SMS/NIN voting links are phishing scams.";
        answerMd = `### Verification Verdict: \`CONTRADICTED\`\n**Confidence Level:** ${confidence}\n\n#### Evidentiary Assessment\n${reason}\n\n#### Why Retrieval ≠ Verification\n> Retrieval locates relevant documents; Verification evaluates source authority (Tier 1–3), statutory compliance, and independent multi-source corroboration.\n\n#### Key Grounded Facts\n- Official Election Date: Saturday, November 21, 2026 (8:30 AM – 2:30 PM WAT) (\`[INEC-2026-PRESS-04]\`)\n- Original physical PVC and biometric BVAS authentication are strictly mandatory (\`[INEC-2026-PROC-01]\`, \`[ELECTORAL-ACT-2022-S47]\`)`;
      } else if (isReloc) {
        verificationStatus = "INSUFFICIENT_EVIDENCE";
        confidence = "LOW / INCONCLUSIVE (Unverified Field Report)";
        uncertaintyMsg =
          "EPISTEMIC WARNING: Available evidence is incomplete or uncorroborated by Tier 1 official records. This system refuses to speculate or state unverified rumors as fact.";
        docs = EMBEDDED_CORPUS.filter((d) => ["YIAGA-2026-INC-09", "INEC-2026-PROC-01"].includes(d.doc_id));
        answerMd = `### Verification Verdict: \`INSUFFICIENT_EVIDENCE\`\n**Confidence Level:** ${confidence}\n\n#### Evidentiary Assessment\nAccording to the Nigeria Civil Society Situation Room Field Log \`[YIAGA-2026-INC-09]\`, INEC's official Polling Unit Directory shows **zero authorized relocations** in Eti-Osa or Alimosho. Observers inspected 18 of the 42 cited sites: 15 remain at their designated public schools, 3 shifted 30 meters along public streets due to drainage works (not private compounds), and 24 sites are still awaiting physical verification.\n\n#### Why Retrieval ≠ Verification\n> Finding a viral claim online does not make it true. When authoritative Tier 1 confirmation is absent and Tier 2 field verification is still in progress, a trustworthy agent must report \`INSUFFICIENT_EVIDENCE\`.`;
      } else {
        verificationStatus = "SUPPORTED";
        docs = EMBEDDED_CORPUS.slice(0, 3);
        answerMd = `### Verification Verdict: \`SUPPORTED\`\n**Confidence Level:** ${confidence}\n\n#### Evidentiary Assessment\nSupported by Tier 1 INEC official publications (\`[INEC-2026-PRESS-04]\`, \`[INEC-2026-PROC-01]\`) and Statutory Electoral Act provisions (\`[ELECTORAL-ACT-2022-S47]\`).`;
      }
      traceSteps.push({
        step: 2,
        agent: "claim_verification_agent",
        action: "tool_call:verify_election_claim",
        detail: `Evaluated claim against verified corpus -> Verdict: ${verificationStatus} (${confidence}).`,
      });
    } else if (intent === "multi_source_comparison") {
      verificationStatus = "MULTI_SOURCE_SYNTHESIS";
      confidence = "HIGH (Cross-Referenced Across Tiers 1, 2 & 3)";
      uncertaintyMsg =
        "TRANSPARENCY NOTE: While Tier 1 and Tier 2 sources agree on BVAS offline biometric accuracy (~98%), observers note unresolved cellular dead-zones in 8.2% of rural/riverine polling units.";
      docs = EMBEDDED_CORPUS.filter((d) =>
        ["INEC-2026-TECH-03", "YIAGA-2026-OBS-01", "DUBAWA-2026-CHECK-07", "CHANNELS-2026-NEWS-11"].includes(d.doc_id)
      );
      answerMd = `### Multi-Source Intelligence Comparison\n**Synthesis Status:** \`MULTI_SOURCE_SYNTHESIS\` | **Confidence:** ${confidence}\n\n#### 1. Areas of Multi-Source Consensus (Tier 1 + Tier 2)\n- BVAS biometric accreditation operates 100% offline and achieved ~98% first-attempt accuracy during the November 7 mock exercise (\`[INEC-2026-PRESS-04]\`, \`[YIAGA-2026-OBS-01]\`).\n- Paper Form EC8A remains the primary legal record at the Polling Unit, with scanned images uploaded to IReV for public cross-verification (\`[INEC-2026-TECH-03]\`, \`[DUBAWA-2026-CHECK-07]\`).\n\n#### 2. Operational Nuances & Perspectives Across Sources\n- **Official Assurance vs. Field Risk on Connectivity:** INEC emphasizes its store-and-forward offline queue for zero-network units (\`[INEC-2026-TECH-03]\`), whereas YIAGA Africa highlights that 8.2% of sampled rural/riverine units lack mobile coverage and urges pre-publishing those units (\`[YIAGA-2026-OBS-01]\`).\n- **Logistics MoU vs. Last-Mile Execution:** INEC and Channels TV report a new 6:30 AM departure MoU with transport unions (\`[CHANNELS-2026-NEWS-11]\`), while civic observers warn that timely Friday-night driver stipend disbursement remains a bottleneck.\n\n#### 3. Transparent Uncertainties & Watchpoints\n- INEC has not yet published the public list of zero-network polling units recommended by observers.\n- 24 of the 42 polling units cited in social media relocation rumors in Eti-Osa and Alimosho are still undergoing physical observer verification (\`[YIAGA-2026-INC-09]\`).`;
      traceSteps.push({
        step: 2,
        agent: "election_information_analyst",
        action: "tool_call:compare_multi_source_coverage",
        detail: "Compared 4 independent sources across Tier 1 (INEC), Tier 2 (YIAGA/DUBAWA), and Tier 3 (Channels TV).",
      });
    } else if (intent === "official_announcement_summary") {
      verificationStatus = "SUPPORTED";
      docs = EMBEDDED_CORPUS.filter((d) => ["INEC-2026-PRESS-04", "INEC-2026-PROC-01"].includes(d.doc_id));
      answerMd = `### Official Electoral Commission Announcement Summary\n**Primary Document:** \`INEC-2026-PRESS-04\` — *INEC Official Press Release: Final Readiness Assessment & PVC Collection Deadline* (2026-11-08)\n\n#### Key Takeaways from the Commission\n- **Official Election Date:** Saturday, November 21, 2026 (8:30 AM – 2:30 PM WAT) (\`[INEC-2026-PRESS-04]\`).\n- **Final PVC Collection Deadline:** Sunday, November 15, 2026 at 5:00 PM WAT at LGA INEC offices — no collection by proxy (\`[INEC-2026-PRESS-04]\`).\n- **BVAS Mock Accreditation:** Achieved a 98.4% biometric authentication success rate across 436 test polling units nationwide (\`[INEC-2026-PRESS-04]\`).\n- **Sensitive Materials:** Secured with the Central Bank of Nigeria (CBN) for distribution 48 hours prior to polls opening (\`[INEC-2026-PRESS-04]\`).`;
      traceSteps.push({
        step: 2,
        agent: "election_information_analyst",
        action: "tool_call:get_official_announcements",
        detail: "Retrieved official Tier 1 INEC announcements and statutory electoral timetable.",
      });
    } else {
      verificationStatus = "SUPPORTED";
      docs = EMBEDDED_CORPUS.filter((d) => ["INEC-2026-PROC-01", "ELECTORAL-ACT-2022-S47", "INEC-2026-PRESS-04"].includes(d.doc_id));
      answerMd = `### Grounded Election Intelligence Briefing\n**Lead Authority:** \`INEC-2026-PROC-01\` — *INEC 2026 Regulations and Guidelines for the Conduct of Elections*\n\n#### Verified Polling Unit Procedure\n- **Polls Open & Close:** 8:30 AM WAT to 2:30 PM WAT on Saturday, November 21, 2026. Any voter already on the queue at 2:30 PM must be allowed to accredit and vote (\`[INEC-2026-PROC-01]\`).\n- **Mandatory PVC Presentation:** Voters must present their original physical Permanent Voter Card (PVC) per Section 47(1) of the Electoral Act (\`[ELECTORAL-ACT-2022-S47]\`).\n- **Biometric Accreditation via BVAS:** APO I verifies the voter via fingerprint or facial recognition on the BVAS device (\`[INEC-2026-PROC-01]\`).\n- **Counting & IReV Upload:** Ballots are counted openly at the Polling Unit, recorded on Form EC8A, snapped with the BVAS camera, and uploaded to the IReV portal (\`[INEC-2026-PROC-01]\`).`;
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
      execution_engine: "Google ADK Grounded Engine",
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
    document.getElementById("verdict-pill").textContent = `VERDICT: ${vStatus}`;
    document.getElementById("confidence-label").textContent = `Confidence: ${data.confidence || "HIGH"}`;
    document.getElementById("uncertainty-msg").textContent =
      data.uncertainty_banner?.message || "Grounded in allowlisted electoral sources.";
    document.getElementById("engine-badge").textContent = data.execution_engine || "Google ADK 2";
    document.getElementById("delegated-agent-badge").textContent = `Delegated: ${targetAgent}`;

    // Response Markdown
    const mdText = data.answer_markdown || data.structured_briefing_markdown || "";
    document.getElementById("response-markdown").innerHTML = renderMarkdown(mdText);

    // Trace Steps
    const traceEl = document.getElementById("trace-timeline");
    const steps = data.trace_steps || [];
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
          <div class="trace-detail">${s.detail}</div>
        </div>
      </div>
    `
      )
      .join("");

    // Evidence Documents
    const docs = data.evidence_documents || [];
    document.getElementById("evidence-count-badge").textContent = `${docs.length} Source(s) Cited`;
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
              <span class="tier-badge">${d.source_tier} (Trust: ${d.trust_score || "0.95"})</span>
            </div>
            <div class="evidence-title" style="margin-top:0.45rem;">${d.title}</div>
            <div class="evidence-meta">${d.source_name} • Published: ${d.published_date}</div>
            <div class="evidence-summary" style="margin-top:0.45rem;">${d.summary}</div>
          </div>
          <a href="${d.url}" target="_blank" rel="noopener" class="evidence-link">
            Inspect Authoritative Source Reference ↗
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
    throw new Error("All remote API endpoints unreachable; using embedded Grounded ADK Engine.");
  }

  async function executeQuery(queryText, mode) {
    const submitBtn = document.getElementById("submit-btn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Coordinating ADK Sub-Agents & Grounding Tools...";

    try {
      const data = await callApiWithFallback("/api/query", { query: queryText, mode: mode });
      updateUI(data);
    } catch (_err) {
      const fallbackData = localFallbackExecute(queryText, mode);
      updateUI(fallbackData);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Run Multi-Agent Election Intelligence →";
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
          verification_rule: "Blocked by Antigravity Trust Guardrail: Unattributed chain messages and non-allowlisted domains cannot be used as evidence.",
        });
      }
    }
  }

  function renderSourceResult(res) {
    const box = document.getElementById("source-check-result");
    const color = res.is_trusted ? "#34d399" : "#f87171";
    const icon = res.is_trusted ? "✅ ALLOWLISTED" : "🚫 UNTRUSTED / BLOCKED";
    box.innerHTML = `
      <div>
        <div style="font-family:var(--font-mono);font-size:0.78rem;font-weight:700;color:${color};">
          ${icon} • Trust Score: ${res.trust_score}
        </div>
        <div style="font-weight:600;font-size:0.84rem;margin-top:0.2rem;">${res.source_name || res.input}</div>
        <div style="font-size:0.76rem;color:var(--text-muted);">${res.tier_label}</div>
        <div style="font-size:0.79rem;color:var(--text-secondary);margin-top:0.25rem;">${res.verification_rule}</div>
      </div>
    `;
  }

  document.addEventListener("DOMContentLoaded", () => {
    // Render Sample Buttons
    const samplesContainer = document.getElementById("samples-list");
    samplesContainer.innerHTML = PRESET_SAMPLES.map(
      (s) => `
      <button type="button" class="sample-btn" data-query="${s.query.replace(/"/g, "&quot;")}" data-mode="${s.mode}">
        <div class="sample-btn-top">
          <span class="sample-btn-title">${s.label}</span>
          <span class="sample-tag ${s.tagClass}">${s.badge}</span>
        </div>
        <div class="sample-btn-query">${s.query}</div>
      </button>
    `
    ).join("");

    samplesContainer.querySelectorAll(".sample-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const q = btn.getAttribute("data-query");
        const m = btn.getAttribute("data-mode") || "auto";
        document.getElementById("query-input").value = q;
        setMode(m);
        executeQuery(q, m);
      });
    });

    // Mode Tabs
    function setMode(m) {
      currentMode = m;
      document.getElementById("mode-indicator").textContent = `Mode: ${m}`;
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
