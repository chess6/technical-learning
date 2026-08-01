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

**Open:** a domain-owner's sign-off on L5's **Gate 8**. The merge is not that
sign-off, and the independent review — while real — is a different thing.
Gate 9 items remain unadministered.

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
