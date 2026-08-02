# Handoff

Two independent work streams landed on `master` on 2026-08-01. Neither is
fully signed off; each has a *different* open obligation. Package status is
not duplicated here — follow the links.

---

## Stream 1 — Package A / L5 `chain-rule` (applied mathematics)

**State.** Package A (`calculus-foundations`) approved by the repository owner
2026-07-31 under a narrow E2E waiver. Three approved items were built,
independently reviewed, re-verified, and merged (`feature/l5-chain-rule`,
fast-forward, branch and worktree since deleted): the Gate 9 assessment for
`calculus-foundations` (13 items, **built, not administered**), L5's Mode B
docs through `Gate result: PASS`, and L5's Mode C lesson code.

**Independent review ran** and reported 16 confirmed findings, all fixed —
most seriously **a real gap in the chain-rule derivation** (C7 claimed
`g` continuous + `E_f(k)/k→0 ⇒ E_f(k(h))/h→0`, but that composition alone
gives only `E_f(k(h))/k(h)→0`; the missing factor `k(h)/h→g'(a)` needs `g`'s
*differentiability*. A counterexample confirmed it). Fixed in `insight.md`
(including Audit A, which had certified the flawed version), `chainRule.ts`,
and `mastery-contract.md`. Details in the commit messages
(`git log`, search "finding #").

**L5's Gate 8 is closed.** The repository owner accepted it on 2026-08-01,
after an acceptance review found and fixed a real mathematical defect (the
derivation divided by \(\Delta u\) in the very step whose thesis is that it
never does — repaired by the Carathéodory device) and rewrote both E2
recognition items. The acceptance record in
`lessons/05-chain-rule/mastery-contract.md` §6 is authoritative; three docs
that still read "pending" were stale and have been corrected.

**Open:** Gate 9 items for `calculus-foundations` remain unadministered.

**L6 `optimization-approximation` is built** on
`feature/l6-optimization-approximation` (2026-08-01, this session — see
Stream 3 below), per the owner's explicit authorization to cross the
Mode B → Mode C boundary. Self-verified only, but including a real e2e pass
(this lesson's own 8-test spec plus two cross-lesson sweeps, 29 tests, all
passing) — no independent review of the implementation, and the full 39-file
`./check.sh --e2e` was not run in full.

**References:** module ledger §6–§8
(`docs/courses/applied-mathematics/modules/calculus-foundations/implementation-package.md`)
· `modules/calculus-foundations/assessment-plan.md` ·
`lessons/05-chain-rule/`

---

## Stream 2 — Experience architecture, slice R0–R3

**State.** The first vertical slice of the pedagogical & product-architecture
redesign, merged from `feature/experience-architecture`:

- **R0** — Pedagogical constitution as doctrine amendments (`vision.md` §0,
  extended block palette in `lesson-design.md`, ADR-004/005/006). Docs only.
- **R1** — The experience model: `guidedSceneId`/`explorationId` **optional**
  (the mechanism that had forced every concept through the same media pair);
  evidence-typed `LessonObjective`; three route blocks — `callout`, `proof`,
  `composed` — plus a `blockComponents.tsx` lazy registry. All 19 then-existing
  lessons verified byte-identical, e2e unchanged.
- **R2** — Karatsuba rebuilt as the historical-breakthrough archetype: the
  field's O(n²) belief and its 1960 break are `callout` blocks *in the
  argument*; a `composed` block makes the approved "three evaluations"
  connection concrete; the lesson ends on an open question, not a summary.
- **R3** — `workshop`/`assessment` `UnitItem` kinds over existing module sets
  (zero new items); production route `/set/:setId` (beta-labeled); one
  theorem (`rank-nullity`) retrofitted to a `proof` route block.

**A self-review pass found four more real defects**, all fixed — full write-up
in `docs/quality/lesson-correctness-checklist.md` § "Slice review pass":
`objectives` had shipped with **no consumer** (its validator asserted nothing,
and R1's own acceptance criterion was unmet); ADR-006 claimed an
`ITEM_ASSESSMENT_META` extension that never happened; the `proof` render — R3's
headline — was **asserted nowhere**; and there was no global anchor-uniqueness
check. Both new validators were **proven to bite** (deliberately broken,
observed to fail, reverted), not merely observed to pass.

**Open:**

- [ ] **Independent semantic review of R0–R4.** A *self*-review has run and
      found real defects at every package so far; that does not discharge the
      self-certification gap ADR-002 names. This is the same class of
      obligation as Stream 1's, and Stream 1's experience — an independent
      reviewer catching a genuine mathematical gap that self-review had
      certified as valid — is the argument for taking it seriously.
- [ ] Two in-session deviations from the plan text, reasoned through and
      recorded in code comments/ADRs but never separately confirmed:
      `review` as a `UnitItem` kind is **deferred to R6** (no per-module
      scheduler data exists to back it); Karatsuba ends on an
      **open-question section**, not a `handoff` (no built lesson to point at).

Two defect classes recorded here as "deliberately unfixed" earlier are now
closed, with permanent guards proven to bite (deliberately broken, observed to
fail with a precise message, reverted): the bold-straddling-math failure mode
(9 real occurrences found via a runtime walker over live lesson objects —
`src/lessons/__tests__/lessonProse.ts`/`proseEmphasis.test.ts` — a materially
different, more accurate set than an earlier source-literal scan had found);
and unvalidated named `visual`/`explore` route targets (`contentValidation.test.ts`
now resolves `sceneId`/`explorationId` against the real registries). See
`docs/quality/known-failure-modes.md` for both.

**R4 (curriculum graph as data) is now built** on this branch, ahead of what's
merged to `master` — see "Repository state" below. `src/curriculum/` (`concepts.ts`:
83 concepts; `edges.ts`: 342 edges across all six ADR-005 types; `lessonRoster.ts`;
`labels.ts`; `__tests__/graph.test.ts`: DAG validation, referential integrity,
edge-consumer test). Real consumers: `CurriculumConnections` (new, wired into
`LessonLayout`) for `requires`/`recommended-before`/`same-structure-as`/
`refresher-for`; `GlossaryTermCard` extended for `application-of`/`revisited-by`.
`GlossaryTerm.prerequisites`/`relatedTerms` migrated to `ConceptId`; the
`independence`/`linear-independence` drift is fixed, with a generic
drift-detection test guarding against the same class recurring.

**R4 went through two review rounds after its first commit**, and both found
real problems — the sequence is worth reading before trusting any single
commit message here.

*Round 1* found five defects: an `application-of` edge using a lesson id where
a concept was required; `ConceptNode.blurb` shipping with **zero consumers
while its doc comment claimed one** (the exact ADR-006 defect class from the
R0–R3 pass, repeated); 13 blurbs carrying literal backticks/LaTeX; 5 wrong
auto-generated titles; and the concept/lesson namespace being undeclared.

*Round 2 reviewed round 1's own fixes and found three overclaims in them* —
one blurb was never actually cleaned (the finding grep's character class
halted at an escaped quote), and two comments asserted more than the code
did. Most significantly, round 1's namespace fix (a lookup table of intended
namespaces) **could not decide the eight ids that name both a concept and a
lesson** — ~15% of endpoints — while its comment implied it could.

That is now properly closed: edge endpoints are `NodeRef`s
(`concept(...)`/`lesson(...)`) and `CurriculumEdge` is a union discriminated
on `type`, so a wrong-space endpoint is a **compile error**, and `kind`
survives to runtime for the resolution check. Verified both ways: the
previously-undetectable collision case now fails `tsc`, and a bad id fails
the suite. See ADR-005's 2026-08-01 amendment. Pure refactor — edge counts
(342) and rendered output (15/20 lessons, 11/16 glossary terms) unchanged.

**The pattern is the takeaway:** three consecutive commits on this branch each
carried a claim stronger than the code delivered. Verify claims mechanically
before writing them down; prefer a type that makes the wrong thing unwritable
over a comment describing what the strings are supposed to mean.

**Recorded, not fixed:** `application-of` edges sourced from Applied
Mathematics concepts are unreachable via `GlossaryTermCard` because
`glossary.ts` only covers Linear Algebra/Algorithms terms — a
glossary-coverage gap, not a graph bug. `blurb` is consumed by exactly one
rendered tooltip today; it is staged for R5's map view, and if R5 slips it
should get a visible-text consumer or be dropped.

Not yet done: independent review (see above); R5's `/map` page is where
these edges get a dedicated UI beyond the lesson/glossary footnotes shipped
here.

**R5 is partially built** — everything except the `/map` page itself. See
"R5 status" below. **Not started:** R6 (mastery derivation), R7+ (content
expansion).
**Plan:** `/home/thomas/.claude/plans/plan-a-major-pedagogical-linked-pinwheel.md`

---

## R5 status — data layer done, `/map` page not started

Two findings changed R5's shape before any code was written, both verified
against `courseModel.ts` rather than assumed:

1. **The four-way course split would have created three empty courses.**
   `courseModel.ts` declares only `calculus-foundations` and
   `calculus-technique`; the other nine spine units (`series`, `signals`,
   `fields`, …) deliberately do not exist there yet. Splitting as planned
   would have produced Calculus with 5 built lessons and three courses
   containing nothing. **Owner chose option (a): rename only.**
   `applied-mathematics` → `calculus`, with the old id aliased in
   `identity.ts` per its no-rename contract. The remaining courses appear when
   their packages have content.
2. **The planned readiness overlay depends on R6, which the plan schedules
   *after* R5.** `lessonProgress`/`exerciseAttempts` still have zero
   non-platform readers. Readiness therefore moves to R6, where the state is
   actually wired; R6 then has no upstream dependency problem.

**Shipped:** `src/curriculum/pathways.ts` (four overlays with
required/optional node sets) and its validation suite; the `entry-bridges`
unit, which makes the one `refresher-for` edge resolve and render on
`/lesson/limits-continuity` instead of being dropped by `lessonLabel`; the
course rename + alias; doc sync in `AGENTS.md` and
`multi-domain-architecture.md`.

The prerequisite-closure test earned its place immediately: it rejected the
first pathway data with **nine real gaps** (`applied-stem` required
`transformations` without `why-linear-algebra`, `math-major` required
`substitution-parts` without `radians-rotation`, and so on). The fix was to
compute the closure rather than hand-list it — and the computation also showed
`elimination`, `solution-sets`, `subspaces-rank` and `rank-nullity` are
genuinely *off* the applied route, which is the kind of saving a "shortest
viable route" is supposed to find.

**The `/map` page is specified and deliberately deferred** —
[ADR-007](decisions/007-curriculum-map-page.md) is the full contract (entry,
focus-mode one-hop rule, unbuilt-content honesty, shortest-vs-thorough, the
a11y tree; readiness explicitly excluded and left to R6). Owner's call, and the
right one: `applied-stem` requires 46 lessons and **13 are built**, so a map
today would mostly render "not built yet" while `CourseSidebar` already handles
20 lessons across three courses. ADR-007 names the trigger to build it.

**Pathway membership is accepted** (owner, 2026-08-01) for this private
instance — no further sign-off pending. The closure test is what keeps future
amendments honest.

**Known, time-boxed:** `pathways.ts` has no runtime consumer until `/map`
ships. That is a knowing exception to ADR-005's no-decoration rule, permitted
only because the consumer is specified and scheduled in ADR-007 — recorded
there with the condition that it must not sit indefinitely.

**The critical path is now content (R7+), not architecture.** Both live graph
consumers — `CurriculumConnections` (15 of 20 lessons) and `GlossaryTermCard`
(11 of 16 terms) — improve automatically as lessons land, with no code change.

---

## Two owner-reported findings and their follow-through (2026-08-01)

The repository owner reviewed `/lesson/chain-rule` and `/lesson/karatsuba` in
a browser and reported two real defects neither self-review nor R4/R5's
independent-review gate had caught yet, because they predate this branch and
sit outside R4's scope. Both are fixed and closed out:

**chain-rule's math rendered garbled.** A `$$display$$` block in prose —
`ProseWithMath` only parses `$...$`, so `$$` orphans a delimiter and inverts
every span after it, silently (see `known-failure-modes.md`). Fixed, and a
repo-wide check confirmed this was isolated: every `$...$` span the parser
recognizes as math rendered clean in KaTeX strict mode (2849 spans, zero
warnings), and no other prose string has an unpaired `$`. Two permanent
guards now exist in `proseEmphasis.test.ts` — no `$$`, and no odd `$`
count — both proven to bite on injected regressions.

**All 47 misconception callouts read identically** — `Tempting belief.` /
`But watch.` / `Repair.` were baked into the renderer, so the three-beat
shape was never actually an authoring choice. `AuthoredCallout.moves` now
lets a callout be however many beats it needs, each with an optional
lead-in; the triple survives as shorthand for the genuine case. `vision.md`
§12.1 states the rule and warns against the exact failure mode a mechanical
fix would produce: rewriting every callout to be different is the same
defect in new paint.

That warning was tested immediately. A per-callout review of the other 41
callouts across 18 lessons (`vectors` through `red-black-trees` — every
lesson except `karatsuba`) found that **all 41 already have the shape that
fits**: each is a genuine prediction, refuted by a concrete counterexample or
demonstration, then repaired — exactly what `belief`/`confront`/`resolve`
was built for. Two read quieter than the rest on first pass
(`systems.two-pictures-one-problem`, `elimination.elim-not-tricks` — neither
turns on a numeric counterexample) and were checked closely rather than
reshaped on suspicion; both still confront a real prediction with a real
demonstration and name the actual principle in `resolve`, not a restatement
of the belief. **Nothing was changed.** `karatsuba` needed reshaping because
it is deliberately the atypical archetype (R2's historical-breakthrough
design test); the other 18 are the ordinary conceptual/technique archetype
the triad was designed for, and it shows. This is the intended outcome of
doing the review seriously, not a shortcut — record it here so the next
agent doesn't redo it from scratch or, worse, "fix" what already fits.

---

## Stream 3 — L6 `optimization-approximation` (2026-08-01)

**Originally planning-only** (see the unchanged narrative below); **Mode C
implementation followed the same day** on `feature/l6-optimization-approximation`,
per the owner's explicit authorization to cross the Mode B → Mode C boundary
— see "Mode C implementation" further down for what was built and verified.
Artifacts under
`docs/courses/applied-mathematics/lessons/06-optimization-approximation/`:
brief (Gate 3), contract (Gate 4, `PASS`), mastery contract (Gate 5), plan
(Stage 3) — all now reconciled against the built lesson.

**The insight, and why it is not the spine's.** The spine says the derivative
turns "find the best" into "find where the local model is flat". That wording is
**not quite true**, and its imprecision is the exact misconception the lesson
exists to break. The selected insight: *at an interior point where \(f\) is
differentiable, \(f'(a)\neq0\) **refutes** a local extremum; \(f'(a)=0\) merely
**survives** that test. Interiorness and differentiability are the argument's two
hypotheses; "a survivor need not win" is the failure of its converse; and those
three facts are what the three memorized warnings are really about.* Fermat's
condition falls straight out of L2 C5 with nothing new assumed. The spine row is
worth repairing to match — a Mode A edit, **not made**.

**Both Mode A amendments are resolved** (owner, 2026-08-01): the
`fundamental-theorem → optimization-approximation` hard edge is **approved** and
in the DAG, so the second-derivative test and the \(Mh^2/2\) bound are *derived*
from the FTC under an explicit continuous-\(f''\) hypothesis; and the **M2 depth
bar is amended**, deliberately before Mode C rather than before Gate 10, so that
Gate 5 consumed a calibrated target. Mode C itself is still an open approval
boundary.

**Four things the next session should not have to rediscover:**

- **The Mean Value Theorem is not needed, and should not be added.** It was the
  obvious route to the second-derivative test, monotonicity, and the error
  bound, and L2/L4 both explicitly withhold it. All three follow instead from
  the **FTC applied twice**. It also earns "\(f'>0\Rightarrow\) increasing",
  which `CalculusFixture.monotoneIntervals` currently **declares** rather than
  derives.
- **A fix to a claim does not reach the sentences that use it.** Round 1 fixed
  the thesis; the rejected "derivatives never certify" wording survived in the
  contract's §7 and §10, and "the threshold \(\delta\)" survived across the
  plan's active instructions even after §1g forbade it. Round 2 found both.
  After changing a claim, grep for its *consequences*.
- **Do not overcorrect the spine.** The first draft of this thesis said the
  derivative "never finds the best point" and "only ever refutes" — false, since
  \(f''\) certifies later in the same lesson — and called the three warnings
  "three hypotheses" when there are two plus a failed converse. Owner review
  caught both. The learner phrasing now carries an explicit do-not-shorten note
  for exactly this reason.
- **\(\delta\) is a sufficient radius, never a threshold.** The limit supplies
  *some* radius that works, not a largest one; agreement can fail and later
  return, and on a linear \(f\) it never fails. The certified radius, the first
  sampled disagreement, and "none in this domain" are three separately labelled
  things in the API, the explorer, and the scene copy.
- **Two correctness oracles that look right and are not.** A dense scan cannot
  certify candidate-set completeness — the fixture contract already says
  sampling supports an observation and never a guarantee — so fixtures carry
  analytically declared stationary/singular points and exact expected candidate
  sets, with the scan kept as corroboration. And "the search becomes a finite
  list" is false in general: a constant function makes every point stationary.
  That overclaim was repaired in C9 and **survived in four other places** before
  review caught it.

**Evidence-level traps, all found in review and all now correct in the
contract.** Read these off the code, not the taxonomy:
`committed-prediction` caps at **E1** (`src/lessons/evidence.ts`), not E3;
`SequenceStep` has no committed-prediction kind, so it cannot be chained with a
numeric step; and — the one that actually blocked a core objective — **an
in-lesson `self-check` is learner-self-marked, not human-scored.**
`SelfCheckBody` (`ExercisePanel.tsx`) has the learner mark their own work;
`/review` reads `AttemptSet`s, so human review reaches module items only; and
[ADR-004](decisions/004-experience-node-ontology.md) plus
`assessmentManifest.ts` bar any **E4+ claim on `self-marked` scoring** outright.
So the free-response derivation is now a **practice event with no evidence
claim**, objective 9 is re-scoped to a structured E3 item, and **this lesson
produces no E6 evidence — none is obtainable in this repository today**, so the
unaided-reconstruction obligation is deferred to the validation pilot.
**L5's contract has an E4 self-check claim of the same shape and is very likely
wrong in the same way** — worth checking before it is cited as precedent.

**Self-certified, and it showed.** Author and both audits were one agent
lineage. Owner review found five real defects that the self-audits had passed —
and notably, **C3's \(\delta\) derivation and C13's two-sided integral argument
were both checked and found sound**. The defects were in what the documents
*claimed around* those derivations: the thesis, the evidence levels, the
correctness oracles. That is the same failure mode L5 hit, one level up, and it
is the argument for a further independent read before implementation.

### Mode C implementation (2026-08-01, same session)

The owner's next prompt was **explicit repository-owner authorization to
cross the Mode B → Mode C boundary and build L6**. Branch
`feature/l6-optimization-approximation`; no competing implementation found on
`master`, any branch, or any worktree before starting.

**Built:** `src/math/optimization.ts` (a new module, deliberately kept
separate from `calculus.ts` — see its own docstring for why); the full
`LessonDefinition` in `src/lessons/optimizationApproximation.ts`; a guided
scene (`optimizationApproximationScene.ts`, registered across
`sceneTimings.ts`/`sceneBeatIntents.json`/`sceneMeta.ts`/
`sceneDescriptions.ts`/`animation-authoring-scenes.json` — five separate
mechanical surfaces, not one); an explorer
(`OptimizationApproximationExplorer.tsx`, reusing `FunctionPlot`); grading
contracts and a tier-mix test
(`optimizationApproximationGradingContract.test.ts`); and full curriculum
registration (`registry.ts`, `courseModel.ts`, `lessonRoster.ts`, the
approved FTC edge in `edges.ts`, and — the one genuinely new registration
this lesson's items needed — entries in `assessmentManifest.ts`, following
karatsuba's real precedent rather than L5's mistaken claim that lesson items
aren't registered there; see the commit that fixed L5's stale claim).

**Every commit ran the actual test suites and fixed what they found, rather
than assuming green.** Nine real, distinct bugs surfaced this way across ten
commits — not a sign the work was sloppy, but the expected shape of building
something this size and actually checking it:

1. `OPT_DRIVE`'s stationary points were hand-typed rounded guesses that
   didn't match its own velocity formula — caught by the math layer's own
   consistency guard before any test ran against it.
2. A hand-derived `E(h)=h^3` closed form in the guided scene, replaced with a
   computation from the actual fixture, per the MATH_CORRECTNESS rule.
3. Four unpaired `$` in exercise explanation strings (a leading KaTeX
   delimiter omitted), caught by `proseEmphasis.test.ts`.
4. `certifiedRadius` unconditionally required a `secondDerivativeBound` that
   `OPT_ABS` correctly omits — threw on ANY point of that preset, not just
   the singular one. Caught by the explorer's own component test on first
   run.
5. `objectiveCoverage.test.ts`/`evidenceCeiling.test.ts` failed until the
   nine `assessmentManifest.ts` entries actually landed — proof the coverage
   gate bites, not just that it compiles.
6. A registry-order snapshot test (`lessonWiring.test.ts`) needed the new
   lesson id appended — the correct, expected update for a newly registered
   lesson.
7. `authoringSceneRegistry.test.ts` caught a THIRD scene-registration surface
   (`scripts/animation-authoring-scenes.json`) missed by the first two
   registration passes.
8. `designSystem.test.ts` caught an undefined CSS custom property
   (`--role-violation` does not exist; no violation-specific token exists at
   all — used `--role-invariant` instead).
9. `oxlint` caught three unused imports; fixing the third
   (`OPT_NEG_QUARTIC`) exposed a real gap — the explorer's "quartic" preset
   promised "x⁴ / −x⁴" but only ever showed x⁴. Added a genuine second
   preset rather than silence the warning by deleting the reference.

**Verification actually run:** full `vitest run` (153 files, 2435 tests,
green), `tsc -b` (clean), `oxlint` (clean), plus a real Playwright pass — a
dedicated `e2e/lesson-optimization-approximation.spec.ts` (8 tests: load and
console-error-free clip playback; all eight major steps reachable via
Previous/Next; the prediction hold genuinely holding; reduced-motion; the
endpoint maximum rendering correctly; the certified-radius and
first-sampled-disagreement readouts staying visually separate; the linear
preset's "none in this domain"; live grading) plus the two cross-lesson
sweeps that exercise every lesson including this one
(`course-context-and-grammar.spec.ts`, `lesson-callouts-render.spec.ts`) — 29
e2e tests total, all passing. One test bug found and fixed in the process:
the practice-grading test assumed the first rendered question would be
multiple-choice (matching `chain-rule`'s exercise ordering); L6's practice UI
paginates one question at a time, and the real first question is
`opt-candidate-set`'s numeric step — corrected to match the actual UI, not
the lesson.

**Not run:** the full 39-file `./check.sh --e2e` suite — scope was this
lesson's own spec plus the cross-lesson sweeps that cover it, not every
other lesson's specs. L5's own acceptance review found a real presentation
defect (doc-internal citations reaching learner prose) that no automated
test catches; `proseEmphasis.test.ts` now guards that specific class and is
green here, but a human has not read the rendered page.

**Gate 8 is explicitly NOT claimed.** `mastery-contract.md` §6 records what
the implementing agent verified mechanically and states plainly that this is
not the domain-owner sign-off Gate 8 requires — the L5 precedent (self-review
passed, an independent reviewer then found a real mathematical defect in
exactly the step self-review had certified) is the reason to take that
distinction seriously rather than as a formality.

A minor Mode A-adjacent correction made alongside implementation, flagged
rather than silently done: `course-spine.md`'s L6 row carried the spine's own
imprecise sentence ("find where the local model is flat") verbatim, never
repaired despite the insight-brief naming the repair as owed. Corrected to
match the shipped insight, and L5's row (also missing its `**(built)**`
marker since merge) fixed at the same time.

---

## Test state

Run live rather than trusting any summary older than the newest commit.

At the merge of the two streams, `./check.sh --e2e` is green apart from the
**two known, documented, waived** failures — `solution-sets` text-clipping
(intermittent, webfont-metric dependent) and `ftc-accumulate-then-measure`
`seek-determinism` (the Package A waiver, ledger §7). Both are recorded in
`docs/quality/known-failure-modes.md` and were reproduced identically against
pre-change baselines by both streams independently.

## Repository state

`master` contains both streams as of the merge described above and has been
pushed to `origin`. `feature/l5-chain-rule` and its worktree are deleted.

`feature/experience-architecture` is **not** fully merged: it carries R4
(above) plus the two closed defect-class fixes, both landed *after* the merge
to `master` recorded here. `master` does not yet have R4. Before merging again,
re-run the cross-stream compatibility check the first merge did (new
lessons/tests on `master` since must satisfy this branch's validators, and
vice versa) rather than assuming the first merge's clearance still holds.
