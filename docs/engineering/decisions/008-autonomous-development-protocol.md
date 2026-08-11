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
Step 5 requires explicit owner approval to build a `future` spine node, to move
from an approved plan to code, and for Gate 8 acceptance. The owner's directive
above **is that approval, granted as a standing authorization** for the
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

One more honest observation: the per-lesson artifact set (brief, contract,
mastery contract, plan — often 1,500+ lines) is what made L5/L6 correct, and
it is also the throughput ceiling. The fix in §4 is not thinner artifacts; it
is parallelizing their production and review.

### 2.2 Architecture & stack — sound; the bottleneck is authoring throughput

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
| **No CI.** Every verification run in this repo's history was local; a branch can be pushed red with no signal | Add GitHub Actions: `check.sh --quick` on every push, full `--e2e` nightly and on `master` merges. This is a precondition for trusting autonomous merges |
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

Build waves, each wave a set of packages that can proceed in parallel once its
dependencies are green:

| Wave | Packages | Content | Depends on |
| --- | --- | --- | --- |
| 1 | **B** (finish M2: L7 `substitution-parts`, L8 `improper-integrals`) | The trunk's remaining technique lessons | nothing (in progress) |
| 2 | **C** (M3 series) + **R6 platform work** | Sequences/series/power series; mastery derivation + spaced review | Wave 1 |
| 3 | **D** (M4 complex-oscillation), **I** (M9 many-variables) | Two independent branch roots | Wave 1 (M4 also wants M3's series for `e^{iθ}`) |
| 4 | **E** (M5 projection-spectra), **G** (M7 differential-equations), **J** (M10 fields) | Branch middles | M4 / M4 / M9 respectively |
| 5 | **F** (M6 signals + FFT, ends in the **signals workshop**), **H** (M8 response-control, ends in the **ODE/control workshop**), **K** (M11 boundary-theorems) | Branch heads | M5 / M7 / M10 |
| 6 | **L** (M12 nonlinear-dynamics, ends in the **dynamics workshop**), **fields workshop** | Phase portraits & stability; bifurcations; limit cycles; maps & chaos | M7 (+ eigen material from linear-algebra, already built) |

Rules that survive the speed-up: modules ship as whole packages; Mode B for a
full package completes before that package's Mode C begins; every lesson's
insight contract still reaches `Gate result: PASS` before its mastery
contract. Nothing in this ADR licenses skipping gates — it licenses not
*waiting* between them.

---

## 4. The substitute review protocol (what replaces the owner)

Per lesson, in order, each by a **fresh context** that did not write the code
under review (a new session or an explicitly clean-slate pass — the L6 record
is the evidence that builder-context review reliably passes builder-context
defects):

1. **Mechanical tier** (unchanged): package-tier `check.sh`, full `--e2e` at
   package boundaries, grading contracts + manifest entries in the same commit
   as every auto-graded item.
2. **Adversarial math review** — reads the math layer and the lesson's claims
   with the explicit brief *"find the defect self-verification passed"*, and
   greps for the *claims* (the L6 lesson: after fixing an invariant, search
   for the sentences and sibling functions that assert it).
3. **Rendered-page review** — loads every page in a real browser, reads every
   prose string as rendered, checks every KaTeX span, exercises every control.
   This is the reassigned owner function; both historical owner-only catches
   are now permanent test guards, and this pass exists to catch the *next*
   class, which by definition has no guard yet.
4. **Acceptance record** — mastery-contract §6 states what was verified, by
   which pass, and that acceptance is under ADR-008 with the owner's standing
   veto. "Accepted" never appears without rounds 2–3 having found-and-fixed or
   explicitly found-nothing (recorded as such — a round that finds nothing is
   reported as exactly that, never as proof the next would not).

Merge to `master` follows acceptance; CI (once added, wave 1) must be green.

**Throughput levers** (in effect immediately): batch Mode B per package;
parallelize independent packages across waves; the scene scaffolder; and —
**offered, not assumed** — multi-agent workflow orchestration for the
fan-out-heavy stages (per-lesson Mode B drafting, finder/verifier review
rounds). Workflows require an explicit owner opt-in per the harness rules; the
owner can grant it by saying so, and it is the single largest remaining
speed lever.

---

## 5. Platform work authorized alongside content

In priority order: CI (wave 1, before any autonomous merge); R6 mastery
derivation + spaced review (wave 2); the three branch workshops (waves 5–6);
scene scaffolder (wave 1); `/map` when ADR-007's trigger fires (likely wave 4:
>20 built lessons on the applied route); adoption of `math-expression` into
lessons where an item's evidence design wants free production (per-lesson
mastery-contract decisions, starting with L7).

## 6. Consequences

- The owner stops being the throughput ceiling and becomes an auditor with a
  veto; the HANDOFF and ledgers become the audit surface.
- Review quality now depends on genuinely fresh contexts per pass. A session
  that builds and then "independently reviews" its own package violates this
  ADR.
- If the substitute protocol starts passing defects the owner would have
  caught (measured by: owner spot-checks finding post-acceptance defects),
  this ADR's §4 is the first thing to amend — tighten the protocol, do not
  quietly reintroduce owner gating the owner asked to be removed from.
