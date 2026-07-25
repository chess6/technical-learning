# Module validation record (Gate 10, module scope) — Structure of Linear Maps

The honest covered / missing / deferred record for the `structure` module,
measured against the course's declared profile target. Consumes the
[assessment plan](assessment-plan.md) results and feeds the course-level Gate 10
report. Follows
[mastery-standard §9 Gate 10](../../../../authoring/mastery-standard.md#9-workflow-integration)
and the [benchmark matrix](../../benchmark-matrix.md).

> **Read this first.** Gate 10 measures *what the evidence supports*, and this
> module has **no learner evidence at all**: the Gate 9 items are built and
> machinery-verified but **never administered**. So the "Covered" column below
> reports what the built lessons *demonstrated in-lesson*, and every module-level
> claim is reported as **unsupported**. A validation record that scored a module
> on the existence of its assessment would be exactly the failure this document
> exists to prevent.

## Module metadata
- **Module / unit id:** `structure` (L8 `subspaces-rank`, L9 `rank-nullity`,
  L10 `change-of-basis`).
- **Declared profile target:** **P3 override** (subspace and rank–nullity proofs)
  over the course primary **P2**, plus the research-bridge overlay
  ([course-spine §0](../../course-spine.md#0-declared-course-target-gate-1)).
- **Assessment plan:** [assessment-plan.md](assessment-plan.md) — **Gate 9 NOT
  PASSED**; results dated *n/a (not administered)*.
- **Lesson gates:** L8, L9 and L10 have each **passed Gate 8** on their
  lesson-owned outcomes, each with the same explicitly recorded exception —
  proof construction, deferred here.

## Per-profile coverage (against the benchmark bars)

| Topic (spine id) | Target bar | Covered (evidence) | Missing | Intentionally deferred |
| --- | --- | --- | --- | --- |
| **L8 `subspaces-rank`** | P1: bases of the fundamental subspaces (E3). P2: rank in applications, numerical rank (E4). **P3: subspace proofs (E6).** | **In-lesson (real, E3):** which space decides which question and in which \(\mathbb{R}^k\); rank of a fresh \(3\times3\); a basis of \(\operatorname{Col}(A)\) **from \(A\)'s columns**; a produced nonzero null vector; image shape from the pivot count; the rank-1 opposite-directions transfer (E4). | **P3 unmet:** the subspace proof is *practiced, unscored* in-lesson; `mod-struct-prove-subspace-inclusion` would evidence it but is unadministered. **P2 unmet:** no rank-in-applications and no numerical rank anywhere. | Row space and \(\operatorname{Null}(A^{\mathsf T})\) — the lesson scopes to the two spaces that decide solvability and names the others as out of scope (L12/L14 own them). Orthogonality (L12). |
| **L9 `rank-nullity`** | P1: state & use rank + nullity = n (E3). P2: interpret for data/networks (E4). **P3: prove rank–nullity (E6).** | **In-lesson (real, E3):** the law stated against \(n\) with the \(m\)-substitution rejected; nullity from rank on fresh **square and non-square** maps; geometric multiplicity as \(n-\operatorname{rank}(A-\lambda I)\); one-to-one ⟺ onto only for square maps; the impossible-map transfer (E4). | **P3 unmet:** the proof is *shown in the lesson* and *practiced unscored*; `mod-struct-prove-rank-nullity` targets the construction but is unadministered. **P2 unmet:** no data/network interpretation. | General \(n\) beyond the module's ceiling (see below). |
| **L10 `change-of-basis`** | P1: coordinates in a new basis (E3). P2: camera/frame transforms (E4). **P3: how a map's matrix transforms; similarity (E6).** | **In-lesson (real, E3):** \([\mathbf{x}]_B\) produced and checked by rebuilding \(\mathbf{x}\); \(P\)'s direction justified from its columns; \([A]_B=P^{-1}AP\) produced for a fresh basis; the diagonal result in an eigenbasis; the invariants; the converse denied (E4). | **P3 unmet:** the similarity derivation is *practiced, unscored*; `mod-struct-derive-similarity` targets it but is unadministered. **P2 unmet:** no camera/frame application. | Orthonormal bases and \(P^{-1}=P^{\mathsf T}\) (L12). |
| **Module level (D8/D10/D11/D12/D13)** | P2/P3: cumulative integration, method selection, delayed retention, timed performance, error diagnosis. | **Nothing.** No module-level result exists. | Every one of them, pending administration — and **D11 (timed) is not even offered** by this module's sets. | A timed mock: the course's only one lives in `systems-elimination`; a second would need its own fresh instances (recorded as a follow-up below). |

## Claims this module's evidence supports

- **Supported:** for L8/L9/L10 individually, **P1 S1–S3 in \(\mathbb{R}^2\)–\(\mathbb{R}^3\),
  with genuine non-square work up to \(2\times4\) in L9** — computational
  fluency and conceptual discrimination at **E3**, plus **one E4 transfer item per
  lesson**, all independently demonstrated in-lesson under commit-before-reveal.
  This is a real advance on the earlier lessons: it is the first place the course
  leaves \(\mathbb{R}^2\) and the first place shape (\(m\) vs \(n\)) does
  mathematical work.
- **Not supported — the honest distance to the declared target:**
  - **P3 (the module's own override): entirely unmet.** No proof this module owns
    has been constructed *and scored*. Three fresh proof-plus-counterexample
    surfaces exist and route to human scoring; until one is written into and
    marked, "proof-ready" is not claimable for this module — and the app's
    self-mark must never be read as a score.
  - **P3's abstraction ceiling: unmet and unreachable from here.** The module works
    in concrete \(\mathbb{R}^n\) with \(n\le4\). Abstract vector spaces, general
    fields, and maps-without-a-matrix are untouched, and no assessment item can
    close that from this content.
  - **P2 applications: unmet.** Rank in applications, numerical rank, data/network
    interpretation and camera/frame transforms are all absent — the module is
    structurally strong and applicationally empty.
  - **"Module mastered": unsupported.** Needs E3–E5 across the must-demonstrate
    outcomes on a cumulative set **plus** one delayed-retrieval success. The
    cumulative set is built and unadministered; the retention set cannot even be
    scheduled yet (below).
  - **"Exam ready": unsupported**, and further away than for `systems-elimination`
    — this module offers no timed surface at all.
- **A claim that must not be made from this record:** that building eleven items
  with passing tests advances the module's attainment. It does not. It removes the
  *machinery and content* excuse, leaving administration as the only remaining
  blocker — which is progress worth stating precisely, and nothing more.

## Follow-ups

Ordered by what unblocks the most:

1. **Administer `structure-review` and score `structure-proof`.** Everything above
   turns on this one step; no further authoring is required to take it.
2. **Generalize the spacing scheduler beyond one module.** `SPACED_MODULE_ID` in
   [`src/platform/spacedConfig.ts`](../../../../../src/platform/spacedConfig.ts) is
   a single string, so `structure-retention` cannot be auto-scheduled and must be
   administered by hand at +7/+30 days. Owner: platform, not this module.
   Until then D12 stays partially discharged **and** the retention items are
   visible early on the dev index.
3. **Raise the D12 items from recognition to production.** The lesson contracts ask
   for E3 under delayed retrieval and multiple choice caps at E1–E2; a second
   ledger and a second \([A]_B\) on fresh numbers would close the gap. Owner: this
   module, after (1).
4. **Add a timed set (D11/S3)** with its own fresh instances, or record explicitly
   at course level that S3 is evidenced only by `systems-elimination`.
5. **Close the P2 application gap** (rank in applications, data/network reading,
   camera frames). Owner: partly L12–L14, partly a revision of these lessons.
6. **Abstract vector spaces (P3 ceiling)** — a course-architecture question, not a
   module one. Raise it at Gate 1/2 rather than pretending an item can settle it.
