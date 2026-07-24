# ADR 002 — Package development & review workflow redesign

- **Status:** Proposed (audit complete; adoption not yet started)
- **Deciders:** project author
- **Scope:** how assessment packages are planned, implemented, corrected, verified,
  and reviewed. Changes no grading semantics.

## Context

Packages F and G each required two post-implementation correction cycles driven by
expensive (~20 min) review passes. Package G's first correction (`6bf9f8e`) was 88%
the size of the original build (+1685 vs +1917 lines); Package F's (`9294f7e`) was
44%. The recurring findings are the same seven defect classes every time:
blank-as-zero, incomplete-object credit, prompt cueing, lenient graders, evidence
overclaims, persistence edges, doc drift. Narrow corrections rerun the full
661-test unit suite plus serial Chromium Playwright (with dev-server boot) even for
24-line fixes, because the AGENTS.md Verify section has no tiers.

Facts established by the audit (verified against code):

- Grading is **already centralized**: `src/lessons/grading.ts` dispatches to the
  capability registry `src/lessons/capabilities.ts` (nullable decoders ~:889–911,
  completeness gates →:1451); math truth in `src/math/linearSystemsGeneral.ts`;
  verdicts in `src/lessons/reviewStatus.ts`; capture in
  `src/components/assessment/captureRenderers.tsx`; items in
  `src/lessons/moduleItems.ts`. Recurring defects are not duplication — they are
  central validators repeatedly found too permissive *after* full builds.
- Evidence levels (E1–E7) exist **nowhere in runtime code** — only docstrings and
  the audit table in the module `implementation-package.md`. Nothing
  machine-checks claim vs capture.
- No LLM prompt templates or model-routing guidance exists anywhere in the repo.
- Review sign-off blocks are filled "Cursor agent (AI) — not independent |
  Self-review" — the gate passes on self-certification.
- E2E: 16 specs / 50 tests, `fullyParallel: false`, Chromium-only, absent from CI.
  No spec is serial-order-dependent (only two specs touch localStorage; each test
  clears it and Playwright isolates contexts). No `typecheck` npm script; no
  targeted-test scripts.
- Package status is duplicated across four docs; roughly seven recent corrective
  commits paid a multi-doc reconciliation tax.
- Substring-matching leniency was already fixed in `aa3b4b0` (exact normalized
  set, `capabilities.ts:575–591`) — the safeguards below lock this in rather than
  fix it.

## Root-cause analysis (ranked by time cost × recurrence)

1. **Semantic review happens at the wrong boundary (post-build instead of
   pre-code).** Blank≠0, completeness-first, exact-match, no-cueing, and honest
   evidence targets are *spec* properties, decidable from an item table before
   implementation. Because plans specify structure but not adversarial grading
   semantics, review discovers spec defects after ~2–3k-line builds → corrections
   at 44–88% of build size.
2. **Semantic invariants live only in prose and the reviewer's head.** No
   executable capability-contract battery, no machine-readable evidence ceiling,
   no cue-lint. The same defect classes recur (blank-vs-zero ×4,
   incomplete-credit ×3, cueing ×3, overclaims ×3), and each recurrence costs a
   full review cycle. Self-review misses them because the implementing agent
   shares its own blind spots and has no adversarial checklist to *execute*.
3. **Untiered verification.** "After meaningful changes: lint, test,
   e2e-if-player" drives full suite + serial e2e on narrow corrections.
   Verification, not thinking, is a large share of the 20-minute pass.
4. **Doc-status duplication.** Status restated in `implementation-package.md`,
   `assessment-plan.md`, `lesson-correctness-checklist.md`,
   `platform-contracts.md`; nearly every corrective commit re-touches several.
5. **Self-certified self-review.** The sign-off block was designed to flag
   non-independent review; it is filled honestly but the gate still passes.
   Independence must come from *artifacts* (tests, contracts), not prose.
6. **No model routing.** Everything runs on the strongest model, including
   mechanical corrections that start from a failing test.

## Decision — end-to-end workflow

1. **Plan (Mode B, unchanged gates) + grading-semantics contract table.** The
   package plan MUST include, per item: capability id, mustAccept exemplars,
   mustReject exemplars (blank / partial / zero-filled / related-wrong /
   superset-text), cue terms banned from the prompt, evidence target + what the
   capture renderer records. **The strong model reviews this table before any
   code** — a minutes-long doc review at the cheapest boundary.
2. **Implement (Mode C, faster model).** First action: transcribe the contract
   table into `describeGradingContract` specs + `ITEM_ASSESSMENT_META` entries
   (red), then implement to green. Self-review = the adversarial kit passing.
3. **Narrow corrections (faster model, diff-scoped).** Input = one finding + a
   failing test. Quick-tier verification only. One status-ledger line, no other
   doc edits.
4. **Package verification (once) + single scoped review.** `./check.sh --e2e`
   full run, then ONE strong-model pass scoped to: contract-vs-implementation
   diff, evidence-claim audit, persistence/migration edges, pedagogy. Findings
   route back as narrow corrections; re-review covers only correction diffs.
5. **Approval.** Human sign-off on Gate result; one ledger row updated.

## Verification matrix

| Stage | Runs | Explicitly NOT run |
| --- | --- | --- |
| While editing | `npm run typecheck` + `npx vitest run <touched paths>` | full suite, e2e |
| Narrow-correction commit | `./check.sh --quick` (oxlint + tsc -b + grading-adjacent tests incl. conformance kit) + the new regression test | full unit suite, e2e, doc reconciliation |
| Package commit | `./check.sh` (full unit); `--e2e` only when touching runner/player/layout/persistence (targeted spec ok) | all-16-spec e2e for content-only changes |
| Final package approval | `./check.sh --e2e` (full) + conformance kit + doc-ledger check → then the single semantic review | repeat review passes over already-reviewed surface |

Safety: math correctness and evidence integrity are carried by the always-on unit
tier (661 tests + new kit, fast/parallel); e2e covers runner/layout wiring, which
narrow content corrections do not touch; CI gains an e2e job as backstop.

## Model-routing policy

- **Strong model (Opus-class):** grading-semantics contract review (pre-code);
  the single package-level review; new capability or persistence-schema/migration
  design; anything that changes what "correct" means; rubric/evidence audits.
- **Faster model:** mechanical implementation of an approved contract; narrow
  corrections starting from a failing test; test/manifest registration from an
  enumerated list; doc sync against the ledger; lint/type fixes.
- **Routing rule:** the strong model decides *what correct means*; the fast model
  makes code match an already-decided definition. If a correction requires
  re-deciding semantics (no test can express the defect), it is not a narrow
  correction — route it back as a contract amendment.

## Repository safeguards

### Capability conformance / adversarial kit (kills blank-as-zero, incomplete-credit, related-wrong)

- `src/lessons/__tests__/gradingContract.ts` — harness + per-capability
  `CapabilityAdversary` generators (solution-set, elimination-solution,
  matrix-entry, exercise-sequence, numeric, vector, multiple-choice). Not
  `*.test.ts`, so vitest does not collect it directly.
- `src/lessons/__tests__/gradingContract.test.ts` —
  `describeGradingContract(exercise, spec)` per auto-graded item + a coverage
  meta-test (every non-human-scored `MODULE_ITEMS` entry must have a spec; a new
  capability without an adversary fails loudly).
- Standard battery per item: round-trip parse/serialize; mustAccept grade
  correct; all-blank rejects; every single-field blanking of every mustAccept
  answer rejects (including cells whose true value is 0); zero-filled-blank shape
  rejects; adversary-generated related-wrong rejects (flipped consistency,
  freeCount±1, null-space point as particular, non-echelon reduced,
  row-equivalent-but-unrelated echelon, pivot off-by-one); accepted-text
  supersets reject. `skip:` escape hatch prints in the test name. `self-check`
  sits in an explicit `HUMAN_SCORED_EXEMPT` set (round-trip +
  `requiresHumanScore` only).

### Evidence-ceiling static check (kills evidence overclaims)

- `src/lessons/evidence.ts`: `EvidenceLevel`, `EVIDENCE_ORDER`, and
  `CAPABILITY_EVIDENCE_CEILING` (what each capability's capture interface can
  actually record; e.g. prediction / multiple-choice / committed-prediction ⇒ E1,
  numeric / vector / matrix-entry / sequence ⇒ E3, construct-in-explorer ⇒ E4,
  solution-set / elimination-solution / self-check ⇒ E5).
- `src/lessons/assessmentManifest.ts`: `ITEM_ASSESSMENT_META` per item id —
  `{ evidenceTarget, methodSelection, cueAllowlist? }` (a manifest, so `types.ts`
  and the lesson union stay untouched).
- `src/lessons/__tests__/evidenceCeiling.test.ts`: manifest ↔ `MODULE_ITEMS`
  exact coverage both directions; every capability has a ceiling; no item claims
  above its capability ceiling; every >E1 exam item's capability ∈
  `SUPPORTED_CAPTURE_KINDS`. Plus one assertion in `captureRenderers.test.tsx`
  that every supported kind has a declared ceiling.

### Cue-lint (kills prompt cueing)

- `src/lessons/__tests__/cueLint.test.ts`: for `methodSelection: true` items,
  learner-facing pre-commitment text (prompt + hints) must not match
  `METHOD_CUE_PATTERNS` (eliminat / row-operation / row-reduc / pivot / echelon /
  reachab / back-substitut / column-span); per-item `cueAllowlist` is the only
  escape and lives in the reviewed manifest. Inverse guard: post-commitment
  `modelAnswer`/`rubricText` MUST still name the methods. Supersedes and deletes
  the ad-hoc check in `moduleItems.test.ts`.

### Doc status ledger (kills doc drift)

- One anchor-stable "Package status ledger" table at the top of the module
  `implementation-package.md` (package, status, date, defining commit).
- `assessment-plan.md` status blockquote → one link to the ledger.
  `platform-contracts.md` keeps attribution history, drops current-status
  assertions. `lesson-correctness-checklist.md` gets a "historical log" header +
  ledger link; no entries rewritten.

### Persistence edges — already well-covered structurally

`LoadOutcome` classification + never-overwrite-newer guard + `identity.ts` tests
exist. Remaining rule (workflow, not code): any schema-version bump or new
persisted field is automatically package-commit tier and strong-model-reviewed.

### Tooling

`typecheck` / `test:grading` / `test:content` / `check:quick` scripts;
`check.sh --quick [paths…]`; `fullyParallel: true` for Playwright; e2e as a
separate CI job. Exact diffs below.

## Prompt templates

### Implementation agent

```
Task: Implement <Package X slice> per <plan path> §<slice>.
The grading-semantics contract table in the plan is APPROVED. Do not reinterpret or extend it;
if implementation reveals a contradiction, STOP and report a contract amendment request.

Order of work:
1. Transcribe the contract table into src/lessons/__tests__/gradingContract.test.ts specs and
   src/lessons/assessmentManifest.ts entries. Run npm run test:content — new specs must FAIL
   (red) before implementation, except where they exercise existing shared capabilities.
2. Implement to green. Reuse existing capabilities/registries; new capability code requires a
   CapabilityAdversary in gradingContract.ts (its absence fails the meta-test).
3. Verify at PACKAGE-COMMIT tier: ./check.sh; add --e2e only if you touched
   runner/player/layout/persistence. Do not run heavier tiers.
4. Update exactly one row in the package status ledger. Touch no other status text.

Output: diff summary; verification commands + results verbatim; and an explicit
"Claims not covered by tests" list — every behavior you believe works but no test asserts.
An empty list is a claim; be honest. Schema/migration changes: stop and request strong-model
review.
```

### Narrow correction

```
Finding: <one finding, quoted verbatim from review>.
Fix ONLY this finding.

1. Write a failing regression test that expresses the defect (location: nearest __tests__/;
   add adversarial cases to the item's grading contract spec if the defect is a grading
   leniency). If you cannot express the defect as a test, STOP — this is a contract amendment,
   not a narrow correction.
2. Make it pass with the smallest change consistent with existing style.
3. Verify: ./check.sh --quick (plus the specific e2e spec ONLY if the fix touched
   runner/player/layout/persistence). Do NOT run the full e2e matrix or reconcile docs; if the
   package status changed, edit the one ledger row.

Output: the failing-then-passing test name, the diff, verification output. Do not refactor,
re-review neighboring code, or restate plan/docs content.
```

### Reviewer

```
Review scope: <package plan §contract table> + <diff range>. You are reviewing the DIFF against
the CONTRACT, not the repository. check.sh --e2e is reported green with the conformance kit,
evidence-ceiling, and cue-lint suites passing — do not rerun them; spot-check at most one claim.

Answer these, each with finding(s) or "clear":
1. Contract fidelity: does any accept/reject behavior diverge from the approved table?
2. Contract adequacy: does the diff reveal semantics the table failed to specify? (→ propose a
   contract amendment, not an ad-hoc fix)
3. Evidence honesty: does any claimed level exceed what the capture interface records — beyond
   what evidenceCeiling.test.ts already enforces (e.g. scaffolding/reveal-order nuances)?
4. Persistence/migration: any path where saved state is lost, overwritten-newer, or where
   malformed imports can masquerade as passes?
5. Pedagogy/math: anything mathematically wrong or pedagogically misleading in prompts,
   model answers, rubric text?

Output findings as: {defect class, severity, file:line, one-sentence defect,
routing: narrow-correction | contract-amendment}. No style commentary. No re-review of surface
outside the diff unless a finding forces it (say so if it does).
```

## Proposed diffs (verified against current files; applied in Migration Step 2–3)

### AGENTS.md — replace the Verify section, append Model routing

```diff
 ## Verify

-After meaningful changes: `npm run lint`, `npm run test`, and `npm run test:e2e`
-when touching player/layout/lesson flow.
+Pick the tier that matches the change — do not run a heavier tier out of caution:
+
+| Tier | When | Command |
+| --- | --- | --- |
+| Edit-time | inner loop while coding | `npm run typecheck` + `npx vitest run <touched paths>` |
+| Narrow-correction commit | single-defect fix, no new surface | `./check.sh --quick` |
+| Package commit | new items / capabilities / renderers / persistence | `./check.sh`; add `--e2e` only when touching runner, player, layout, or persistence |
+| Package approval / review handoff | before requesting semantic review | `./check.sh --e2e` |
+
+Every new auto-graded item must, in the same commit, register a
+`describeGradingContract` spec (`src/lessons/__tests__/gradingContract.test.ts`)
+and an `ITEM_ASSESSMENT_META` entry (`src/lessons/assessmentManifest.ts`).
+Schema-version bumps or new persisted fields are always package-commit tier.
+
+## Model routing
+
+- **Strong model (Opus-class)**: Mode B plan + grading-semantics contract review,
+  the single package-level semantic review, new capability or persistence-schema
+  design, anything changing what "correct" means.
+- **Faster model**: mechanical implementation of an approved contract, narrow
+  corrections starting from a failing test, doc sync against the status ledger,
+  test/manifest registration.
+- A narrow correction is handed off WITH a failing test; if no test can express
+  the defect, it is a contract amendment — route to the strong model.
```

### package.json scripts

```diff
-    "test:e2e": "playwright test"
+    "test:e2e": "playwright test",
+    "typecheck": "tsc -b",
+    "test:grading": "vitest run src/lessons src/math src/components/assessment",
+    "test:content": "vitest run src/lessons/__tests__/contentValidation.test.ts src/lessons/__tests__/cueLint.test.ts src/lessons/__tests__/evidenceCeiling.test.ts src/lessons/__tests__/gradingContract.test.ts",
+    "check:quick": "oxlint && tsc -b && npm run test:grading"
```

### check.sh — add a `--quick` tier

```diff
 with_e2e=0
+quick=0
+declare -a extra_paths=()
 for arg in "$@"; do
   case "$arg" in
     e2e|--e2e) with_e2e=1 ;;
+    quick|--quick) quick=1 ;;
     -h|--help|help)
       ...update usage text...
+    *) extra_paths+=("$arg") ;;
   esac
 done
 ...
-log "Unit tests"
-npm run test
+if [[ "$quick" -eq 1 ]]; then
+  log "Unit tests (quick: grading-adjacent)"
+  if [[ ${#extra_paths[@]} -gt 0 ]]; then npx vitest run "${extra_paths[@]}";
+  else npm run test:grading; fi
+else
+  log "Unit tests"
+  npm run test
+fi
```

### playwright.config.ts (no spec is order-dependent — verified)

```diff
-  fullyParallel: false,
+  fullyParallel: true,
+  workers: process.env.CI ? 2 : undefined,
```

Adoption note: run `./check.sh --e2e` twice after flipping to confirm no hidden
ordering.

### .github/workflows/ci.yml — add a separate e2e job

```yaml
  e2e:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
```

### Docs

Ledger + link rewrites per the doc-status-ledger safeguard. New standards content
goes into existing owners per the "no new standard doc" rule: the contract-table
requirement → a section in `course-authoring-workflow.md` (Mode B) + the module
plan template; conformance-kit ownership → `docs/engineering/platform-contracts.md`.

## Migration plan (no interruption to Package G → H)

Package H is planned-only — the ideal adoption window. Order:

1. **Now, pre-H (docs-only):** add the grading-semantics contract table for H's
   four items as an addendum to `package-h-plan.md`; strong-model review of it is
   the first cheap semantic review. H1–H3 are multiple-choice + occurrence-keyed
   persistence, so the table is small; the persistence slice (schema v2→v3) is
   flagged for strong-model review per policy.
2. **Tooling (mechanical, fast model):** the script/config/AGENTS.md diffs above.
   Independent of H content.
3. **Safeguard kit seeded from G:** `evidence.ts`, `assessmentManifest.ts`,
   `evidenceCeiling.test.ts`, `cueLint.test.ts` (delete the superseded ad-hoc
   check), `gradingContract.ts` + specs for the four existing auto items
   (`mod-transfer-solset-fresh`, `mod-cumulative-elim-solset`,
   `mod-p2-applied-3x3`, `mod-p2-applied-rect`). Expected green against current
   post-correction graders; any red is a real finding.
4. **Implement H** under the new workflow (fast model against approved contract;
   one package verification; one scoped review).
5. **Docs ledger** opportunistically with H's status update.

Verification of the migration itself: Step 3 suites green + an
intentionally-broken mutation check (temporarily coerce null→0 in one decoder
locally → expect mass failures → revert); Step 2 `./check.sh --quick` end-to-end
on a no-op change; Step 4 lands H with ≤1 correction cycle.

## Five highest-impact changes (expected savings)

1. **Grading-semantics contract table reviewed before code:** converts the
   44–88%-of-build correction commits into a minutes-long doc review. Saves ~1–2
   full implement→review→correct cycles ≈ **1.5–2.5 h/package** — the single
   largest lever.
2. **Conformance kit + evidence-ceiling + cue-lint tests:** five of seven
   recurring defect classes become instant unit failures; semantic review shrinks
   to genuine semantics. ≈ **30–60 min/package**, compounding — these classes
   stop recurring in later packages.
3. **Tiered verification + `--quick`:** narrow corrections drop from full-suite +
   serial e2e (~10–15 min) to ~1–2 min. At ~3 corrective commits/package ≈
   **30–40 min/package**.
4. **Model routing + diff-scoped reviewer prompt:** the strong model runs exactly
   twice per package (contract + final), each scoped to contract+diff;
   corrections run on a fast model. ≈ **20–40 min/package** of latency removed.
5. **Playwright parallelism + e2e CI job + status ledger:** halves-or-better the
   one remaining full e2e run, removes the multi-doc reconciliation tax
   (~5–10 min/correction), and CI backstops deferred e2e.

**First change before Package H:** write and review the grading-semantics
contract table as an addendum to `package-h-plan.md` (Migration Step 1). It needs
zero infrastructure, exercises the highest-impact change immediately, and makes
H's implementation eligible for fast-model routing from day one.
