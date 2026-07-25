# Lesson plan — Red–Black Trees

Stage 3 of [Mode B](../../../../authoring/course-authoring-workflow.md#step-2--mode-b-pre-implementation-lesson-planning).
Implements [mastery-contract.md](mastery-contract.md) (Gate 5), which implements
[insight.md](insight.md) (Gate 4, `PASS`). **Neither is restated here** — this
document says *how it gets built*.

> **Not yet approved for implementation.** Writing lesson code is the Mode C
> boundary. This plan exists to be approved or redirected first.

## Gate prerequisite

- Insight Contract: [insight.md](insight.md)
- [x] `Gate result: PASS` confirmed
- Mastery Contract: [mastery-contract.md](mastery-contract.md) — complete, with
  two open Mode-A questions recorded in its §5.

## Approved insight (gate)

- **Exact primary insight — verbatim, planning metadata only:** see
  [insight.md § Gate result](insight.md#gate-result) (the blockquote). Reproduced
  by reference rather than by copy, per the workflow's no-restatement rule; the
  learner-facing prose below must preserve its meaning and causal chain.
- **Learner-facing phrasing:** *"A black node and the red children hanging off it
  are one node of a simpler tree — a 2–3–4 tree. Red doesn't mean 'special'; it
  means 'I'm an extra key in my parent's node.' Once you see that, the colour
  rules stop being axioms and the repair cases stop being a list."*
- **Diagnosed cognitive obstacle:** the learner has a *list* (five properties,
  seven cases) with no generator, so every case must be memorized separately and
  none can be re-derived under pressure.
- **Insight mechanism(s):** **representational change** (primary) + **structural
  compression** (the case list collapses to one rule).
- **Grounded-insight obligations** (the insight *is* grounded, so these are
  traceability duties, discharged in the table below):
  - **Bridge:** the 2–3–4 tree — a structure whose balance is *visible* (all
    leaves level) and whose only event is overflow → split.
  - **Named analogy limits to discard:** a 3-node has **two** legal drawings, so
    the correspondence is a bijection only *up to orientation*; the "violation
    marker" is a repair **state**, not a conserved object; a red-red pair is a
    **mis-drawn node**, never a 5-node.
  - **Abstraction return:** drawn trees (≤ 7 keys) → the induction bound for all
    \(n\) (O4) → an order-5 B-tree never drawn in the lesson (O7).

---

## Lesson title

**"Red–Black Trees: the colour bit is a 2–3–4 tree in disguise"**
Subtitle: *Where the five properties and the repair cases actually come from*

## Route / ids

- Route: `/lesson/red-black-trees`
- `guidedSceneId`: `red-black-encoding`
- `explorationId`: `red-black-encoding`
- `exampleId`: `rbt-canonical` (shared by scene and explorer — the same tree)

### Authored `route` (page grammar §1 — no generic phase names)

| # | Block | Authored `heading` / `tocLabel` |
| --- | --- | --- |
| 1 | `motivate` | *(none — the question speaks for itself)* |
| 2 | `section: rules-without-a-source` | "Five rules and seven cases, from nowhere" |
| 3 | `practice` (`rbt-prereq-bst`) | `heading: "First, a tree you already know"` |
| 4 | `visual` | `heading: "One node, drawn two ways"` |
| 5 | `section: the-encoding` | "A black node and its red children are one node" |
| 6 | `formal: def-encoding` | *Definition* |
| 7 | `formal: thm-invariants-forced` | *Theorem* (T2) |
| 8 | `section: split-is-a-recolour` | "Overflow, split, promote — in binary" |
| 9 | `check` | *(none — the prompt speaks for itself)* |
| 10 | `formal: thm-recolour` | *Theorem* (T3) |
| 11 | `worked: wex-mis-oriented` | *(none — the example names itself)* |
| 12 | `section: bare-rotation-breaks-it` | "What a rotation alone does **not** do" |
| 13 | `explore` | `tocLabel: "Insert on both sides at once"` |
| 14 | `formal: thm-height-bound` | *Theorem* (T5) |
| 15 | `worked: wex-height-induction` | *(none)* |
| 16 | `practice` | *(default "Practice")* |
| 17 | `summary` | `heading: "The colour bit records node membership"` |

Watch-before-Explore is preserved (block 4 before 13), and the visual is
introduced by an authored, content-specific heading — the section titles do not
precede it. Block 3 is the prerequisite-retrieval beat from the contract's §5.2
option (a); **it is deleted if the user picks option (b) or (c)**.

## Motivating question

> Here are the five red–black properties and the seven insertion cases, exactly
> as a textbook prints them. Nothing here says *why these*. Where does this list
> come from — and could you have derived it yourself?

The learner is shown the finished artefact and asked for its generator. No
prediction is demanded (Vision §4: prediction is a tool, not a ritual).

## Learning objectives (`learningObjectives`)

Verbatim from the contract's outcomes-with-evidence — O1–O7 (lesson-owned).
Rendered as the objectives disclosure; O8/O9 are module-owned and do **not**
appear as lesson objectives.

## Shared examples (exact values)

Defined once in `src/lessons/exampleData.ts`, referenced by scene, explorer,
worked examples, and exercises — never re-typed:

| Id | Content | Used by |
| --- | --- | --- |
| `rbt-canonical` | keys `[10, 20, 30, 40, 50, 60, 70]` inserted in that order | scene + explorer initial state |
| `rbt-4node-overflow` | the 4-node `{20,30,40}` receiving `35` | Check, T3 worked example |
| `rbt-mis-oriented` | 3-node `{50,60}` drawn right-leaning, receiving `55` | `wex-mis-oriented` |
| `rbt-fresh-classify` | keys `[8, 3, 11, 1, 6, 14, 4]`, then insert `7` | O2 (fresh — **not** the scene's tree) |
| `rbt-bare-rotation` | a legal tree + one *bare* rotation applied | O5, and the negative invariant test |
| `rbt-btree5` | order-5 node `{5,9,14,21}` receiving `17` | O7 transfer |

## Guided-scene outline (Watch) — `red-black-encoding`

Read-only Motion Canvas, **split-screen**: 2–3–4 tree left, its encoding right,
in lockstep. One conceptual change per major step.

| Step id | Name (learner-facing) | Idea revealed | Notation synced |
| --- | --- | --- | --- |
| `establish` | A tree whose balance you can see | 2–3–4 tree, all leaves level; right panel empty | \(T\) |
| `encode-2node` | One key, one black node | the 2-node case | \(E(T)\) |
| `encode-3node` | A second key hangs off in red | 3-node; **both** drawings shown as the same node | \(g\), red child |
| `encode-4node` | Three keys, two reds | 4-node; the cluster boundary is drawn explicitly | \(g,p,u\) |
| `read-off-r2` | "No two reds" is just the drawing rule | R2 derived, not asserted | R2 |
| `read-off-r3` | Counting black nodes counts levels | R3 derived; \(bh = \operatorname{height}(T)\) | \(bh\) |
| `overflow` | A fourth key arrives at a full node | the 5-node; left panel only | — |
| `split-is-recolour` | The split **is** the colour flip | promote middle; right panel recolours in the same frame | \(bh\) unchanged externally |
| `violation-moves-up` | The break moves up one level | marker slides up; *labelled a repair state* | — |
| `root-split` | The only way the tree gets taller | total \(bh\) +1, uniformly, on every path | \(bh+1\) |

- **Pauses / dimming plan:** establishing frame paused at \(t=0\); everything
  outside the active cluster dims to `--role-intermediate` during
  `split-is-recolour`; the black-height readout is the only thing that moves
  during `root-split`.
- **Honest labelling of any interpolation:** the encode steps morph one drawing
  into the other — labelled *"same node, redrawn"*, never implying an operation
  took place. The violation marker carries the caption *"where the rule is
  temporarily broken"* so M3 cannot form.

## Checkpoint (Check understanding)

- **Prompt:** "This node already holds three keys and a fourth is arriving. Before
  you look: does the repair recolour, or does it need a rotation first? Say which,
  and what tells you."
- **Type:** committed prediction (commit-before-reveal).
- **Reveal:** it recolours — the reds are correctly oriented, so no redraw is
  needed; a rotation is required only when a red hangs off a red.

## Interactive controls (Explore) — `red-black-encoding`

Initialized from `rbt-canonical`, so the learner takes over the scene's own tree.

- **Primary controls:** *Insert key* (numeric entry + a "next key" button) ·
  *Step / Auto* through the repair · *Lean this 3-node left / right* ·
  ***Rotate only (break it)*** — the deliberate M1 counterexample.
- **Primary readouts:** black height per root→leaf path (KaTeX \(bh\)); the
  current 2–3–4 node under repair and its arity; a natural-language result line
  ("*The 4-node {20,30,40} overflowed: 30 was promoted, so the recolour is the
  split*").
- **Progressive disclosure ("Display options"):** show/hide `nil` leaves · show
  cluster boundaries · show the case name (**off by default** — turning it on is
  what makes O2 a fair test when off).
- **Clamp ranges:** integer keys 1–99; tree capped at 15 keys so the split-screen
  stays legible at 1366 px.
- **Reset behavior:** returns to `rbt-canonical` and clears the repair state;
  wired to the existing lesson `Reset`.

## Exercises (Practice)

| # | Id | Outcome | Type | Deterministic answer | Feedback (why) |
| --- | --- | --- | --- | --- | --- |
| 0 | `rbt-prereq-bst` | prerequisite gate | multiple-choice | the in-order reading of a small BST | "In-order traversal is what makes this a *search* tree — we lean on it throughout." |
| 1 | `rbt-encode-rule` | D2 recall (**the one recall item**) | multiple-choice | "red = an extra key in my parent's node" | distractors are the three most common wrong readings of the colour bit |
| 2 | `rbt-encode-decode` | O1 | `custom` (`construct-in-explorer`) | cluster boundaries of a fresh 6-key tree | grades the **boundaries**, so a right-looking picture with wrong ownership fails |
| 3 | `rbt-classify-repair` | O2 | `custom` (`rbt-repair-classification`) | receiving node + **arity before** + repair kind | method **not named** in the prompt (`methodSelection: true`) |
| 4 | `rbt-bare-rotation-diagnose` | O5 | `custom` (error diagnosis) | the path whose black count changed + the repairing recolour | bundles "which step + why" — a correct path with no repair scores incorrect |
| 5 | `rbt-construct-root-split` | O6 | `custom` (`construct-in-explorer`) | any key sequence raising total \(bh\) | verified by predicate, not by matching one answer |
| 6 | `rbt-btree-transfer` | O7 | numeric + short text | promoted key `14` for `rbt-btree5` | transfer: order 5 never appears in the lesson |
| 7 | `rbt-external-bh-explain` | O3 | `custom` (proof completion, human-scored) | the path-count step | model answer + self-check; **human-scored**, so `scoringAuthority: "human-scored"` |
| 8 | `rbt-height-induction-step` | O4 | `custom` (proof completion, human-scored) | the inductive step | as above |

Items 2–6 are auto-graded ⇒ each owes, **in the same commit**, a
`describeGradingContract` spec (accepted answer + the adversarial reject battery:
all-blank, blank-where-true-value-is-0, zero-filled, related-but-wrong) and an
`ITEM_ASSESSMENT_META` entry with `evidenceTarget`, `evidenceBasis`, and
`methodSelection` — per [AGENTS.md](../../../../../AGENTS.md).

## Misconception handling (`callouts`)

M1–M6 from the contract, each placed where it arises: M2 beside `encode-4node`,
M1 as the `bare-rotation-breaks-it` section plus the explorer's *Rotate only*
control, M4 beside `split-is-recolour`, M3 in the marker's caption, M5 at the
summary (the payoff), M6 as a scope note beside the cost figure.

## Progressive-disclosure depth layers

- *Mathematical note* — the amortized recolouring figure **with** its
  variant caveat (M6). Enrichment; never assessed.
- *Looking ahead* — deletion as the exact dual (overflow ↔ deficit, split ↔
  merge, promote ↔ borrow). Named, not taught.
- *Connection* — LLRB as "fix the 3-node orientation and the mirror cases
  collapse".
- *Why do we care* — where balanced trees actually sit (ordered maps, indexes).

## Pure math module required — `src/math/redBlackTrees.ts`

No React, no Mafs, no Motion Canvas. Everything the scene, explorer, and
exercises display comes from here.

```ts
type Colour = "red" | "black";
type RBNode = { key: number; colour: Colour; left: RBNode | null; right: RBNode | null };
type Node234 = { keys: number[]; children: Node234[] };          // 1–3 keys
type RepairKind = "none" | "rotate-then-recolour" | "recolour-and-promote";
type RepairStep = { kind: RepairKind; at: number; promoted?: number; violationAt: number | null };

encode(t: Node234): RBNode | null;              // canonical (left-leaning) drawing
decode(r: RBNode | null): Node234;              // inverse up to 3-node orientation
insert234(t: Node234, key: number): { tree: Node234; promoted: number | null };
insertRB(r: RBNode | null, key: number): { tree: RBNode; steps: RepairStep[] };
blackHeight(r: RBNode | null): number;          // CLRS convention, nil counted
blackHeightsPerPath(r: RBNode | null): number[];
inOrder(r: RBNode | null): number[];
classifyRepair(r: RBNode, key: number): { nodeKeys: number[]; arityBefore: 2|3|4; kind: RepairKind };
rotateOnly(r: RBNode, at: number): RBNode;      // the deliberate counterexample
isLegalRB(r: RBNode | null): { legal: boolean; violations: string[] };
```

## Insight traceability (required)

Every obligation in the contract's causal chain → a learner-facing location and
observable evidence. **Including** the grounded-insight duties (bridge, each named
limit, the abstraction return).

| Contract obligation | Learner-facing location | Evidence of understanding |
| --- | --- | --- |
| Encoding is well-defined & order-preserving | Watch `encode-2node…4node`; §*the-encoding* | O1 — learner reproduces cluster boundaries both ways |
| R2 ⇔ canonical drawing | Watch `read-off-r2`; T2 | O2 — learner uses "red hangs off black" to classify, not a table |
| R3 ⇔ 2–3–4 leaves level; \(bh=\operatorname{height}(T)\) | Watch `read-off-r3`; explorer \(bh\) readout | woven Explore — predicts the readout before stepping |
| Insert = 2–3–4 insert, then overflow → split | Watch `overflow`, `split-is-recolour` | Check — commits to recolour vs rotation |
| Split **is** the recolour | Watch `split-is-recolour`; §*split-is-a-recolour* | O2 — names the promoted key |
| Recolour preserves **external** \(bh\), pushes violation up | T3; Watch `violation-moves-up` | **O3** — completes the path-count argument |
| Root split raises **total** \(bh\) uniformly | Watch `root-split` | **O6** — constructs a sequence that does it, and says why nothing else can |
| Termination / correctness of repair | §*split-is-a-recolour* close | O2 across repeated fresh instances |
| Height bound \( \le 2\log_2(n+1)\) | T5; `wex-height-induction` | **O4** — completes the induction step |
| **Bridge**: the 2–3–4 tree | Watch `establish` (left panel first, alone) | learner splits a 2–3–4 node *before* any colour appears |
| **Limit**: 3-node has two drawings | Watch `encode-3node`; explorer lean toggle | O1 accepts either orientation; learner states why |
| **Limit**: red-red ≠ 5-node | M2 callout beside `encode-4node` | O2 distractors include "it's a 5-node" |
| **Limit**: bare rotation ≠ \(bh\)-preserving | §*bare-rotation-breaks-it*; *Rotate only* control | **O5** — finds the broken path and repairs it |
| **Limit**: marker is a repair *state* | marker caption; consumed by a rotation | M3 callout; no assessed claim treats it as conserved |
| **Return**: arbitrary \(n\) | T5 + `wex-height-induction` | **O4** |
| **Return**: arbitrary branching order | O7 prompt (order 5, never drawn) | **O7** |
| Cost claim is sufficiency, not optimality | scope note beside T5 | no item asks for optimality; M6 caveat stated |

## Key takeaway (Summarize)

> A red–black tree is a 2–3–4 tree written in binary with one extra bit: red
> means *"I'm an extra key in my parent's node."* The properties are that
> encoding's drawing rules, and every repair case is an overflow-and-split seen
> through it.

## Notation

\(T\) · \(E(T)\) · \(g\) (black representative), \(p, u\) (its red children) ·
\(bh(x)\) · \(n\) · order-\(m\) B-tree. KaTeX for
\(n \ge 2^{bh}-1\), \(bh \le \log_2(n+1)\),
\(\operatorname{height} \le 2\,bh \le 2\log_2(n+1)\).

## Edge cases

Empty tree · single key · root-4-node overflow (the only height-raising event) ·
both mirror orientations of the mis-drawn case · `nil` leaves drawn and counted ·
duplicate key inserted (rejected, stated) · 15-key cap reached.

## Mathematical invariants to assert

The seven invariants in [mastery-contract §1g](mastery-contract.md#1g-correctness--scope),
added to `src/math/invariants.ts` — including **#7, the negative assertion** that
the bare-rotation fixture *fails* legality. Property/fuzz tests run randomized key
sequences and re-check legality and the height bound after every insertion.

## Required tests

- [ ] Unit — `src/math/__tests__/redBlackTrees.test.ts` (encode/decode round-trip,
      insert234, insertRB step sequences, blackHeight, classifyRepair)
- [ ] Property/fuzz — randomized sequences: legality + \(bh\) + height bound hold
      after every insert; `decode(encode(T)) = T` up to orientation
- [ ] Invariant — the seven checks, including the negative bare-rotation assertion
- [ ] Grading contracts — items 2–6, each with the adversarial reject battery
- [ ] Assessment manifest — `ITEM_ASSESSMENT_META` for every auto-graded item;
      `evidenceCeiling` + `cueLint` suites must pass (O2/O7 are `methodSelection`)
- [ ] Component — explorer readouts, lean toggle, *Rotate only*, reset
- [ ] Browser (e2e) — `e2e/lesson-red-black-trees.spec.ts`: scene establishes and
      steps, explorer inserts and updates \(bh\), no console errors, no horizontal
      overflow at 1440 px and 390 px, **both themes**
- [ ] Page-grammar sweep — the existing `course-context-and-grammar` spec picks the
      new lesson up automatically once it is in `LESSON_IDS`

## File-by-file implementation work

| File | Work |
| --- | --- |
| `src/math/redBlackTrees.ts` | **new** — the whole pure layer above |
| `src/math/invariants.ts` | +7 invariants (one negative) |
| `src/math/index.ts` | re-export |
| `src/lessons/exampleData.ts` | the six shared example ids |
| `src/lessons/redBlackTrees.ts` | **new** — the `LessonDefinition` + `route` above |
| `src/lessons/registry.ts` | register the lesson |
| `src/lessons/courseModel.ts` | `future` node → `{ kind: "lesson", lessonId: "red-black-trees" }` **(the promotion — Mode C)** |
| `src/lessons/capabilities.ts` | 3 new grading capabilities (repair classification, construct-in-explorer predicate, proof completion) |
| `src/components/lesson/ExercisePanel` UI half | renderers for those capabilities |
| `src/lessons/assessmentManifest.ts` | `ITEM_ASSESSMENT_META` entries |
| `src/guided-scenes/scenes/redBlackEncodingScene.ts` | **new** scene |
| `src/guided-scenes/scenes/sceneTimings.ts` / `sceneMeta.ts` / `sceneDescriptions.ts` | segments, meta, description |
| `src/explorations/RedBlackEncodingExplorer.tsx/.css` | **new** explorer |
| `src/explorations/registry.tsx` | lazy entry |
| `src/pages/LessonPreviewIcon.tsx/.css` | catalog motif |
| `src/lessons/glossary.ts` | 2–3–4 tree, black height, rotation, recolour, promotion |
| `e2e/course-context-and-grammar.spec.ts` | add id to `LESSON_IDS` |
| `docs/quality/lesson-correctness-checklist.md` | Gate 7 entry |
| `mastery-contract.md` §6 | fill the Gate 8 acceptance record |

## Implementation order

1. `src/math/redBlackTrees.ts` + its unit/property tests — **nothing visual until
   the math is green** (MATH_CORRECTNESS rule).
2. Invariants (including the negative one).
3. `LessonDefinition` with sections, formal blocks, worked examples — no scene yet
   (the page must read correctly as prose first).
4. Guided scene, driven entirely by the math module.
5. Explorer, sharing `rbt-canonical` with the scene.
6. Exercises + capabilities + grading contracts + manifest entries.
7. Promotion in `courseModel.ts`, glossary, preview icon, e2e.
8. Gate 7 correctness checklist, then Gate 8 acceptance record.

## Acceptance criteria

- [ ] Insight Contract linked and `PASS`; insight preserved in meaning and chain
- [ ] Insight traceability table complete — every obligation, limit, and return
      mapped to a location **and** evidence
- [ ] Intentional `route` from the block palette; Watch precedes Explore
- [ ] Visible headings + both ToCs content-specific, no generic phase names
- [ ] Guided-to-interactive continuity (`rbt-canonical` in both)
- [ ] Progressive disclosure applied; case names **off** by default
- [ ] KaTeX notation consistent across prose, scene, explorer, exercises
- [ ] Accessibility preserved (labels, focus, readouts, reduced-motion)
- [ ] Split-screen legible and unclipped at 1366 px; stacks below 900 px
- [ ] `docs/quality/lesson-correctness-checklist.md` completed
- [ ] `./check.sh --e2e` green
