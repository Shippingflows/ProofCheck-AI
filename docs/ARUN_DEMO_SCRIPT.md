# Arun Demo Script — ProofCheck AI Pilot

## Framing (30 seconds)
- This is a **pilot workspace** with sample data — label visible in the top bar: *Pilot Workspace · Sample Data*.
- ProofCheck **assists detection**; every approval or rejection is made by a **human reviewer**.
- We are demonstrating the supplier proof inspection workflow, not claiming full production certification.

## Flow 1 — Start from sample inspection (2 min)
1. Open **Dashboard** — note pilot metrics (42 total inspections, corrections pending, avg review time).
2. Click **New Inspection** → **Fill Form** (or **Open Sample Review**).
3. Submit **Start Comparison** — routes to the BioTouch sample with **10 findings** (never zero-findings).

## Flow 2 — Evidence-first comparison (5 min)
1. On **Comparison**, show the **Inspection Profile** and enabled checks.
2. Select a finding in the sidebar — the **Finding Detail** panel shows:
   - Approved vs supplier values
   - Detection method and recommended action
   - **Evidence snapshots** (cropped regions)
3. For barcode finding: show decoded value and **non-ISO disclaimer**.
4. Demonstrate reviewer actions: **Confirm Finding**, **Dismiss False Positive**, **Add Note**.
5. Scroll the **Reviewer Checklist** — persisted per inspection.

## Flow 3 — Findings report (2 min)
1. Open **Findings Report**.
2. Highlight recommendation:
   - **Recommended Action: Reject — Supplier Correction Required**
   - **Pending human QA confirmation**
3. Show severity summary as text (e.g. 4 Critical · 3 Major · 3 Minor).
4. Preview **Export QC Report PDF** block.

## Flow 4 — Supplier correction (2 min)
1. Open **Correction Request** — show status tracker (Draft → Sent → Awaiting resubmission…).
2. Walk through the structured correction email draft.
3. **Mark as Sent** — status advances; audit event recorded.

## Flow 5 — Decision & audit trail (3 min)
1. Open **Audit Trail**.
2. Show **File Lineage** (SHA-256 hashes) and **Audit Integrity** block.
3. Record a decision — reviewer identity is **locked**; notes required for reject/approve-with-notes.
4. **Attestation modal** must be confirmed before the decision is saved.
5. Expand audit events — event ID, local timestamp, actor role, source.

## Honest production-readiness close (1 min)
- Pilot controls live at `/pilot-controls` (reset sample data, readiness messaging).
- Production would connect to your DMS, SSO, and retention policies.
- ProofCheck does not auto-approve proofs or make compliance claims.
