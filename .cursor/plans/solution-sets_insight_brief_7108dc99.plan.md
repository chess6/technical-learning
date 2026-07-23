---
name: solution-sets insight brief
overview: Independently run Stage 1 of the Insight Discovery Gate for "Solution Sets & Homogeneous Systems" and write the result to docs/insight-brief-solution-sets.md only. Diagnose the obstacle, generate distinct candidates, rank them, and design a discovery sequence for the winner — none of these predetermined. Stop at Stage 1.
todos:
  - id: ground-in-repo
    content: Re-read the current Insight Discovery Gate Stage 1 spec and inspect the actual Systems and Elimination lessons plus relevant repo sources; take notes on entry knowledge, available continuity, and math scope without assuming any particular example or helper.
    status: completed
  - id: diagnose-obstacle
    content: Independently diagnose the actual cognitive obstacle(s) for this topic from the repository and mathematics, naming them from the gate's list; decide whether the difficulty is semantic/representational (triggering 1c) rather than assuming it is not.
    status: completed
  - id: generate-candidates
    content: Generate 8-12 genuinely distinct candidate insights across the gate's mechanisms, each satisfying the required Stage 1 core fields (and conditional grounding fields where applicable); include the spine sentence as one candidate on equal footing and a Rejected-as-non-insights list.
    status: completed
  - id: rank-candidates
    content: Rank the strongest three against the gate's criteria with no order supplied in advance; let mechanism types compete fairly; record which examples/interactions genuinely help.
    status: completed
  - id: sequence-and-audit
    content: Only after the winner is chosen, design its discover-don't-tell sequence and predict-not-recall exit test; apply the gate's mathematical guardrails; end with a Stage 1 verdict and an explicit no-Stage-2 note.
    status: completed
isProject: false
---

# Stage 1 Insight Discovery Brief — Solution Sets & Homogeneous Systems

Run **Stage 1 of the Insight Discovery Gate** for this topic and record the result
in **`docs/insight-brief-solution-sets.md` only**. This plan fixes the *process and
constraints*, not the conclusions. The obstacle, candidate set, mechanisms,
ranking, the role of the course-spine statement, and the discovery sequence are all
to be **determined by the investigation**, not supplied here.

## Hard constraints (do not violate)

- **Output ownership:** create/modify only `docs/insight-brief-solution-sets.md`.
  Do **not** create `docs/insights/solution-sets.md`, a lesson plan, guided scene,
  explorer, exercises, tests, or any code.
- **Stage 1 only.** Do not advance to Stage 2 even if Stage 1 passes; end the brief
  with an explicit no-Stage-2 note.
- **Use the current gate.** Follow [INSIGHT_DISCOVERY_GATE.md](docs/INSIGHT_DISCOVERY_GATE.md)
  §"Stage 1" as authoritative; match the depth/format of the on-disk worked briefs
  [insight-brief-karatsuba.md](docs/insight-brief-karatsuba.md) and
  [insight-brief-linear-algebra-opening.md](docs/insight-brief-linear-algebra-opening.md).
- **Compact and reviewable.** Concise candidate sketches; reserve detail for the
  strongest. Every candidate must still satisfy the gate's required Stage 1 fields.
- **The one predetermined fact:** the course-spine sentence *"every solution set is
  one particular solution plus all solutions of Ax=0"* originates from **course
  sequencing, not a completed gate**. It must therefore be **tested as one serious
  candidate among others**, never inherited as the answer or as a pre-assigned
  "final synthesis." Its eventual role (primary, too-compressed, synthesis,
  combined, or rejected) is an output of the ranking.

## Investigate first, then decide (no assumed answers)

Ground the brief in the repository before generating anything:

- Inspect the **actual** Systems (L3) and Elimination (L4) lessons and their shared
  examples, math helpers, visualizations, and assessments to infer learner **entry
  knowledge**, **lesson dependencies**, **mathematical scope**, and **available
  continuity**. Do not restate curriculum already documented there.
- Decide **independently** which existing examples and interactions (if any)
  genuinely strengthen a candidate. Continuity is used only when it improves the
  pedagogy — never because a component is easy to reuse. No specific dataset,
  helper, or explorer is required by this plan; any such reuse must be *earned* by
  the investigation.

## Stage 1 work items (order of reasoning, not of pre-decided content)

1. **Diagnose the obstacle (1a).** From the repo and the mathematics, state in one
   or two lines *why the conventional presentation is hard*, naming obstacle(s) from
   the gate's list. Genuinely assess whether the difficulty is
   semantic/representational (which would **trigger the 1c isomorphic comparison**)
   rather than assuming it is or isn't. The conventional procedure-first order
   (row-reduce → assign parameters to free variables → receive the decomposition) is
   material to examine, but the diagnosis is yours to reach.
2. **Generate candidates (1b).** Produce **8-12 genuinely distinct** candidates
   spanning the gate's mechanisms (structural, semantic, operational,
   representational, predictive), searching deliberately beyond restatements of one
   fact. Each records the required **core fields**, plus the **conditional grounding
   fields** whenever a candidate uses a semantic/operational/representational bridge.
   Include the **spine sentence as one candidate on equal footing**. Distinguish
   genuine model changes from alternate phrasings of the same fact. Add a
   **Rejected as non-insights** list.
3. **Rank the strongest three (1d).** Rank against the gate's criteria (1-8) with
   **no recommended order supplied in advance**; let structural and
   semantic/representational/predictive candidates compete fairly. Correctness is a
   gate, not a tradeable score.
4. **Design the discovery sequence — only after the winner is chosen.** Write a
   discover-don't-tell sequence for the top candidate ending in a *predict-not-recall*
   exit test (including a return-to-symbolic step if the winner is grounded).
5. **Stage 1 verdict.** End with PASS/REVISE per the gate and the exact
   primary-insight sentence, then the no-Stage-2 note.

## Mathematical guardrails (must hold regardless of which candidate wins)

- If any candidate states the particular-plus-null-space decomposition, it must
  carry the **consistency condition** — the decomposition describes the solution set
  **only when the system is consistent**; otherwise the set is empty. Do not state
  it bare.
- Prove/claim **set equality in both directions** (every particular + homogeneous
  vector is a solution; every solution has that form) rather than only one inclusion.
- Keep the **affine vs linear** distinction exact: the homogeneous solution set is a
  subspace (through the origin); a nonempty inhomogeneous solution set is an affine
  set / coset, **not** a subspace unless `b = 0`.
- Keep **existence** (is `b` reachable — column space) distinct from **shape /
  dimension** of the solution set (governed by `Ax = 0`).
- Honor `src/math` as the only source of truth for any linear-algebra facts the
  brief asserts; use KaTeX and column vectors, no raw array notation in prose.

## Then execute

After this revision, proceed to write the Stage 1 brief following the process above
and **stop at Stage 1**.
