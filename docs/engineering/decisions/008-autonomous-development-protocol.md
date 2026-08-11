# ADR-008 — Autonomous development protocol and full-spine roadmap

**Status:** Accepted (repository owner directive, 2026-08-10)
**Owner directive being recorded:** *"Tremendously speed up development … get
multiple courses out of the way (Fourier transform and its FFT variant,
differential equations, nonlinear dynamics, the rest of the calculus courses
and anything else a STEM engineering/math oriented student/researcher would
need). For now don't use me as the reviewer — plan out and develop the rest of
this app e2e, while also figuring out whether the pedagogy, current
architecture, tech stack, layout, etc. is optimized for enabling users to
learn new subjects deeply and quickly/intuitively/creatively apply them to
their work/research."*

This ADR does three things: records that directive as the standing
authorization the workflow's approval boundaries require; states the honest
evaluation the owner asked for; and defines the review protocol that replaces
per-lesson owner sign-off — because the *function* the owner performed cannot
be deleted, only reassigned.

---

## 1. What this authorizes (and what it does not)

[course-authoring-workflow.md](../../authoring/course-authoring-workflow.md)
Step 5 requires explicit authorization to build a `future` spine node and move
from a gate-valid plan to code. The owner’s directive above **is that approval,
granted as a standing authorization** for the
applied-mathematics spine (M2–M12) and the platform work in §5 below. From this
ADR forward:

- Mode B → Mode C for a spine lesson **does not wait for a per-lesson
  go-ahead**; it waits for the gates in §4.
- Gate 8 acceptance is performed under §4's substitute protocol and recorded in
  each lesson's `mastery-contract.md` §6 as *"accepted under ADR-008; owner
  retains standing veto."*
- The owner retains an **asynchronous veto**: anything can be reverted, and the
  HANDOFF + module ledgers must stay current enough that a reverting owner can
  find what to revert.

**Unchanged, non-negotiable floors** — these were never owner-convenience and
do not relax:

1. **Math correctness.** Nothing visually plausible but unverified ships.
   Fixture consistency guards, property tests, and the analytic-declaration
   discipline stay exactly as they are.
2. **No evidence overclaims.** The evidence taxonomy, ceilings, and the
   conformance/cue-lint/evidence-ceiling gates stay. E6 claims remain
   unobtainable in this repository and are never claimed.
3. **Known-failure-modes discipline.** Every new defect class found in review
   is recorded and gets a permanent guard.
4. **The claim-before-build ledger rule** (AGENTS.md) — one package, one
   branch, marked in-progress in the ledger first.

**Recorded concern (stated once, then executed).** Every independent review
round in this repository's history — L5's acceptance review, L6's four rounds,
R0–R4's pass — found real defects that the builder's self-verification had
passed, and two defect classes (garbled `$$` math, 47 identical callouts) were
caught *only* by a human reading the rendered page. Removing the owner from the
loop does not remove that function; §4 reassigns it to fresh-lineage agent
passes with an explicit rendered-page obligation. The residual risk that an
agent pass misses what a human would catch is real and accepted by the owner's
directive; the mitigation is the §4 protocol plus the owner's standing veto.

---

## 2. The evaluation the owner asked for

### 2.1 Pedagogy — strong for depth; two gaps against "apply to research"

The doctrine (vision.md §0's constitution, the insight-discovery gate, the
evidence-typed mastery standard, the misconception strategy, the
anti-completion rule) is genuinely well-designed for **deep learning**. Its
core commitments — the learner owns the intellectual work, evidence levels are
never conflated, insight is discovered before a lesson is planned, review
rounds treat "plausible" as the enemy — are what the research literature on
durable learning actually supports, and the L1–L6 lessons demonstrate the
doctrine is executable, not aspirational.

Against the owner's second goal — *quickly and creatively applying material to
one's own work/research* — two structural gaps:

1. **The pipeline ends before application.** The highest routinely-captured
   evidence is E3–E4 (produced objects, scaffolded chains, predicate-graded
   construction). E6 (unaided reconstruction, novel transfer) is explicitly
   unobtainable today, and — more importantly for this goal — there is **no
   experience kind where the learner brings their own problem**: their own
   signal to transform, their own ODE to classify, their own data to fit. The
   vision names the archetypes (modeling case study, problem workshop, open
   investigation) but no built lesson uses them. **Decision: each branch ends
   in one application-workshop experience** (§3's roadmap builds signals,
   ODE/control, and fields workshops), where the deliverable is the learner's
   own worked artifact, self-assessed against a rubric — honest E-level: a
   practice event, not evidence, until human/pilot scoring exists.
2. **Retention is doctrine, not product.** Constitution principle 12
   distinguishes four mastery states, but R6 (mastery derivation from attempt
   history + spaced review scheduling) is unbuilt, so the product cannot yet
   *act* on the distinction — `lessonProgress`/`exerciseAttempts` still have
   no non-platform readers. For a 39+-lesson spine this compounds: without
   spaced retrieval, later modules silently assume retention the product never
   checked. **Decision: R6 lands before the branch buildout passes M4**
   (§3, wave 2).

One more honest observation: the per-lesson artifact set made L5/L6 correct, but repeatedly loading full standards, historical review logs, and four long artifacts in each cold context is now the throughput ceiling. The response is to keep the gate-owned decisions while shrinking the active route: concise current artifacts, history in Git or lesson-owned acceptance records, and a generated task context. Parallel contexts are an explicit speed tradeoff, not the default.

### 2.2 Architecture & stack — sound; the bottleneck is repeated cold context

**Right and kept:** React + Vite + TS strict; KaTeX; Mafs for explorers;
Motion Canvas for guided scenes; the pure `src/math` layer with load-time
fixture consistency guards; the capability registry (a new interaction is a
registered capability, not a union edit — `math-expression` proved this
again); evidence-typed objectives with mechanical coverage gates; the e2e
hard-gate suite for scenes; the curriculum graph as typed data (R4) with
compile-error wrong-space endpoints.

**Friction points, with decisions:**

| Finding | Decision |
| --- | --- |
| Guided-scene registration spans **five mechanical surfaces** (`sceneTimings`, `sceneBeatIntents.json`, `sceneMeta`, `sceneDescriptions`, `animation-authoring-scenes.json`); L6 missed one twice | Add a `scripts/new-scene` scaffolder that writes all five stubs from one declaration; the registry test already bites on omissions |
| CI existed but did not gate a branch before merge and duplicated quick/full work on pushes | Keep quick checks on pushes; run full unit + serialized browser checks on package-ready pull requests, `master`, nightly, and manual dispatch; cancel obsolete branch runs; upload both Playwright report and raw results |
| jsdom hid two real browser-only defects (KaTeX no-op render, caret-vs-commit race) | Standing rule: every new interactive capability ships with a real-browser spec the same day (already true for `math-expression`; now required, not habitual) |
| Full `--e2e` sweeps show contention-class failures (media-heavy specs, 404 bursts under parallel load) | Track in known-failure-modes; run heavy specs serialized in CI; do not waive new failures into the contention class without reproducing them in isolation |
| Layout (`CourseSidebar`, lesson routes, `/set/:setId`) | Scales fine to ~40 lessons; the `/map` page (ADR-007) has its trigger condition and R6's readiness overlay — no change now |

### 2.3 Verdict

The pedagogy and architecture are **not the constraint**. The constraint is
(a) per-lesson authoring/review throughput and (b) the two application/retention
gaps above. §3 and §4 are the response.

---

## 3. Roadmap — the remaining spine, in dependency order

The spine (course-spine.md) already contains most of what the owner listed:
Fourier and the FFT are M5–M6, differential equations and Laplace are M7,
response/control is M8, the remaining calculus is M2 + M9–M11. **Nonlinear
dynamics is genuinely new** and is added as M12 (spine amendment committed with
this ADR).

The waves below express dependency order. Default execution is one package session at a time; independent packages run in parallel only when the owner explicitly chooses elapsed-time speed over usage:

| Wave | Packages | Content | Depends on |
| --- | --- | --- | --- |
| 1 | **B** (finish M2: L7 `substitution-parts`, L8 `improper-integrals`) | The trunk's remaining technique lessons | nothing (in progress) |
| 2 | **C** (M3 series) + **R6 platform work** | Sequences/series/power series; mastery derivation + spaced review | Wave 1 |
| 3 | **D** (M4 complex-oscillation), **I** (M9 many-variables) | Two independent branch roots | Wave 1 (M4 also wants M3's series for `e^{iθ}`) |
| 4 | **E** (M5 projection-spectra), **G** (M7 differential-equations), **J** (M10 fields) | Branch middles | M4 / M4 / M9 respectively |
| 5 | **F** (M6 signals + FFT, ends in the **signals workshop**), **H** (M8 response-control, ends in the **ODE/control workshop**), **K** (M11 boundary-theorems) | Branch heads | M5 / M7 / M10 |
| 6 | **L** (M12 nonlinear-dynamics, ends in the **dynamics workshop**), **fields workshop** | Phase portraits & stability; bifurcations; limit cycles; maps & chaos | M8 (+ eigen material from linear-algebra, already built) |

Rules that survive the speed-up: modules ship as whole packages; Mode B for a
full package completes before that package's Mode C begins; every lesson's
insight contract still reaches `Gate result: PASS` before its mastery
contract. Nothing in this ADR licenses skipping gates — it licenses not
*waiting* between them.

---

## 4. Usage-aware package and review protocol

The package is the context boundary. This preserves an independent review while
avoiding multiple cold starts per lesson:

1. **One implementation session per approved package.** It consumes the
   package’s completed Mode B artifacts, implements its lessons in dependency
   order, and uses targeted tests in the edit loop. Keep the session and working
   directory stable while the package remains active.
2. **One fresh package reviewer.** After the implementation branch is clean, a
   context that wrote none of the code performs both adversarial mathematics and
   rendered-page review across the package. It reads every learner-facing claim,
   exercises every relevant control, and records a verdict for each lesson.
3. **Escalate selectively.** Add another independent reviewer only for a
   high-risk proof or numerical algorithm, or when the first review fails in a
   way that changes the contract. Routine math and rendered review do not get
   separate cold contexts.
4. **Corrections and delta verification.** Test-backed corrections return to the
   existing implementation session. The same fresh reviewer verifies the delta;
   a new full review cycle begins only when the contract or meaning of
   “correct” changes.
5. **Mechanical floor.** Run targeted tests locally, `./check.sh --quick` at the
   bounded correction commit, and let package-ready CI own the complete unit and
   browser suites. Every auto-graded item still ships with its grading contract
   and assessment-manifest entry.
6. **Acceptance record.** Each lesson’s mastery contract states what the package
   review verified and that acceptance is under ADR-008 with the owner’s
   standing veto. “Accepted” never appears without both math and rendered-page
   review.

Parallel agent teams and multiple worktrees remain available only as an explicit
“favor speed over usage” option. They are not the default protocol. The active
context should come from `npm run context:task`; full standards are opened only
when that pack exposes an ambiguity.

## 5. Platform work authorized alongside content

In priority order: CI (wave 1, before any autonomous merge); R6 mastery
derivation + spaced review (wave 2); the three branch workshops (waves 5–6);
scene scaffolder (wave 1); `/map` when ADR-007's trigger fires (likely wave 4:
>20 built lessons on the applied route); adoption of `math-expression` into
lessons where an item's evidence design wants free production (per-lesson
mastery-contract decisions, starting with L7).

## 6. Consequences

- The owner stops being the throughput ceiling and becomes an auditor with a
  veto; the package ledger and lesson acceptance records are the audit surface.
- Review quality depends on one genuinely fresh package-review context. A session
  that builds and then “independently reviews” its own package violates this ADR;
  combining mathematics and rendered-page review in the fresh reviewer does not.
- If the substitute protocol starts passing defects the owner would have
  caught (measured by: owner spot-checks finding post-acceptance defects),
  this ADR's §4 is the first thing to amend — tighten the protocol, do not
  quietly reintroduce owner gating the owner asked to be removed from.
