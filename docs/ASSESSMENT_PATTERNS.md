# Assessment patterns for technical lessons

A working library of **assessment patterns** for the lessons in this project. It
exists so that "add a checkpoint / exercise" does not default to whatever is
easiest to grade (usually recall), and so that each probe we author has a clear
target and a known failure mode.

Pair it with:

- [LESSON_DESIGN.md](./LESSON_DESIGN.md) — the six-phase flow
  (Motivate → Watch → **Check** → **Explore** → **Practice** → Summarize) and the
  exercise/feedback bar.
- [INSIGHT_VALIDATION_PROTOCOL.md](./INSIGHT_VALIDATION_PROTOCOL.md) — the
  **learner-validation pilot**, where heavy reconstruction/transfer probing lives
  (out of the in-lesson surface).
- [INSIGHT_DISCOVERY_GATE.md](./INSIGHT_DISCOVERY_GATE.md) and
  [insights/karatsuba.md](./insights/karatsuba.md) — the causal chain a strong
  assessment is trying to detect.

---

## How to use this document

Every assessment we write should be traceable to an **insight obligation** (the
causal chain in the insight contract), not just to "a fact in the lesson." For
each pattern below:

- decide **what it measures**;
- prefer the **strong version** and consciously reject the weak one;
- watch for the listed **false positives** (the ways a learner passes without
  understanding);
- choose an **interaction format** the platform actually supports;
- **place** it in the phase where it does the most good.

### Placement buckets (four)

| Bucket | Phase | Role of assessment here |
| --- | --- | --- |
| **Check** | Check understanding | One lightweight conceptual probe *before* exploration; reveal after the learner commits. Not computation-heavy. |
| **Explore** | Explore | Prediction/verification woven into the interactive; the explorer's readouts are the answer key. |
| **Practice** | Practice | Deterministic graded exercises with feedback that names the misconception. |
| **Learner validation** | The pilot (not in-app) | Unaided reconstruction and genuine transfer, scored by a facilitator. Heavy probing belongs here, **not** stacked into Practice. |

### Platform interaction formats (ground truth)

From `src/lessons/types.ts`, an `ExerciseDefinition` is one of:

- `multiple-choice` — `choices[]` + `correctChoice` + `explanation`.
- `numeric` — `expected` + optional `tolerance` + `explanation`.
- `vector` — `expected: Vector2` + optional `tolerance`.
- `prediction` — `prompt` + `reveal` (self-graded; no correctness check).
- `eigenvalue` — one or more `expected` eigenvalues, order-insensitive.

Plus shared machinery on every exercise: `tier: "check" | "drill" | "transfer"`,
`hints[]`, `solutionReveal`, and optional depth `layers[]`. The **Checkpoint**
(`LessonCheckpoint`) is a separate `prompt` + `answer` reveal, not a graded
exercise. Where a pattern needs a format the platform does **not** yet have (free
text, ordering, region-shading, learner-built expressions), this is called out as
**new support needed** — do not fake it with a lossy multiple-choice.

---

## Pattern: recall

- **What it measures:** whether a specific fact, name, formula, or value is
  retrievable (e.g. "Karatsuba uses three products," \(\log_2 3 \approx 1.585\)).
- **Weak version:** ask the learner to select the exact phrase the lesson just
  showed, with implausible distractors. Passes by short-term memory or elimination.
- **Strong version:** require the fact *in a slightly re-worded context* so it must
  be retrieved, not pattern-matched off the screen; or pair the fact with a
  one-clause "because" that only the right fact supports.
- **Common false positives:** recency (answer is still on screen), distractor
  implausibility, and guessing (1-of-4 = 25%).
- **Suitable interaction formats:** `multiple-choice`, `numeric` for a specific
  value. Keep it to **one** and lightweight.
- **Placement:** **Check** (a warm confidence probe) or the first `drill` in
  Practice. Never let recall be the *only* thing Practice measures.
- **Karatsuba example:** "How many single-digit multiplications does Karatsuba use
  to combine two split numbers?" → `numeric` `3`.
- **Other-domain example (red-black trees):** "What are the two invariant colors a
  red-black tree node can take?" → `multiple-choice` (red/black).

## Pattern: procedural execution

- **What it measures:** whether the learner can *carry out the method* on new
  inputs and land on the correct number.
- **Weak version:** the exact worked example's numbers reused, so the answer can be
  copied from the Watch/worked-example beat.
- **Strong version:** fresh inputs the learner has not seen, requiring the full
  procedure (split → three products → subtract → reassemble), ideally including a
  step where a naive shortcut fails.
- **Common false positives:** copying the worked example; arithmetic luck; doing
  the *naive* computation and getting the same final number (so the method used is
  invisible). Mitigate by grading an **intermediate** quantity, not just the final
  product.
- **Suitable interaction formats:** `numeric` (final value or an intermediate
  coefficient), `vector` for coordinate outputs. A step-by-step "enter each \(z_i\)"
  would need **new multi-field numeric support**.
- **Placement:** **Practice** (`drill` tier). Optionally scaffolded in **Explore**
  where the explorer verifies each step live.
- **Karatsuba example:** "For \(34 \times 21\), compute the middle coefficient
  \(z_1\) *by subtraction* — \(z_1 = (A+B)(C+D) - AC - BD\)." → `numeric` `11`
  (grades the method-specific intermediate, not \(714\)).
- **Other-domain example (linear algebra):** "Apply \(A = \begin{bmatrix} 2 & 1 \\
  0 & 1 \end{bmatrix}\) to \(\mathbf{v} = \begin{bmatrix} 1 \\ 2 \end{bmatrix}\).
  Give \(A\mathbf{v}\)." → `vector` \(\begin{bmatrix} 4 \\ 2 \end{bmatrix}\).

## Pattern: explanation

- **What it measures:** whether the learner can articulate *why* a step is valid,
  in their own words — the difference between following a rule and understanding it.
- **Weak version:** multiple-choice "which sentence explains this?" — recognition of
  a phrasing, not production of a reason. Learners select fluent-sounding text.
- **Strong version:** learner produces the reason unaided (spoken or written) and it
  names the actual mechanism (shared place-value weight, not "the formula says so").
- **Common false positives:** fluent restatement of the conclusion without the
  mechanism; selecting the most detailed-sounding option; parroting lesson wording.
- **Suitable interaction formats:** in-app, only approximated by `prediction`
  (reveal a model explanation to self-check) or a `multiple-choice` where
  distractors are *plausible but subtly wrong* reasons. True explanation grading
  needs **free-text response support (new)** — so genuine explanation lives in
  **learner validation**.
- **Placement:** **Check** (as a `prediction`/interpretation with reveal) for a
  light version; the real thing in **learner validation** (Phase 3 R-questions).
- **Karatsuba example (Check):** "\(AD\) and \(BC\) both sit on the tens column.
  What single quantity does the answer need from them, and why doesn't the split
  between them matter?" → checkpoint `prompt`/`answer` reveal.
- **Other-domain example (sorting):** "Explain why merge sort is \(O(n \log n)\)
  and not \(O(n^2)\), in terms of the recursion depth and per-level work." →
  learner-validation free response.

## Pattern: reconstruction from first principles

- **What it measures:** whether the learner can *rebuild* the method from the core
  idea (the picture / place-value structure) rather than recall the steps in order.
- **Weak version:** "put these given steps in order" with the steps supplied — this
  tests sequencing recognition, not reconstruction.
- **Strong version:** blank-slate rebuild on a **non-lesson** input: from the area /
  place-value picture, derive which pieces combine, how to recover their sum, and
  how to reassemble — with the numbers hidden.
- **Common false positives:** memorized step order; recognizing the lesson's exact
  example; being handed the intermediate structure.
- **Suitable interaction formats:** poorly served in-app (a chain of `numeric`
  intermediates approximates it). Real reconstruction is unaided and needs
  **free-form work capture (new)** — this is the heart of the **learner-validation
  pilot** (Phase 3, `36 × 27`).
- **Placement:** a *scaffolded slice* in **Practice** (compute one intermediate the
  method-specific way); the *full* unaided reconstruction in **learner validation**.
- **Karatsuba example:** "Here is a fresh product with the digits hidden behind the
  rectangle. Which two subrectangles share a place-value column, and how would you
  recover their sum with a single extra multiplication?" → learner-validation R1–R2.
- **Other-domain example (Fourier):** "Given only that a signal is a sum of sines,
  reconstruct why sampling at evenly spaced points lets you recover the
  coefficients." → learner-validation.

## Pattern: prediction

- **What it measures:** whether the learner's **mental model produces the right
  expectation** *before* seeing the outcome — the most honest evidence, because it
  cannot be back-filled from the answer on screen.
- **Weak version:** "predict" after the result is already visible, or with only one
  sensible option. No commitment before reveal.
- **Strong version:** the learner commits to a prediction, *then* the visual/readout
  confirms or refutes it. Refutable predictions (where the naive model is wrong) are
  strongest.
- **Common false positives:** peeking (result visible), degenerate options, no
  commit-before-reveal, autoplay that answers before the learner responds.
- **Suitable interaction formats:** `prediction` (native), `multiple-choice` at a
  Watch prediction-pause, or **Explore** where the learner sets inputs then reads
  the outcome. Pair with the guided scene's prediction pauses.
- **Placement:** **Check** (one lightweight prediction) and **Explore** (predict a
  readout, then verify). This is the ideal Check-phase pattern.
- **Karatsuba example:** at the `weights` beat, "Two of the four pieces land on the
  same place-value column. Which two?" (commit before `share` reveals \(AD, BC\)).
- **Other-domain example (eigenvectors):** "Before applying \(A\), predict which
  drawn direction will land back on its own line." → `prediction` / drag-and-verify
  in the explorer.

## Pattern: error diagnosis

- **What it measures:** whether the learner can **find and name a mistake** in a
  worked (wrong) solution — a strong signal, because spotting a bug requires the
  correct model.
- **Weak version:** "is this right? yes/no" — 50% by guess, and no localization.
- **Strong version:** a plausible wrong derivation with a single, specific defect;
  the learner must identify *where* and *why* it is wrong (which mistaken belief
  produced it).
- **Common false positives:** yes/no guessing; spotting a superficial typo instead
  of the conceptual error; choosing "wrong" because something merely looks unusual.
- **Suitable interaction formats:** `multiple-choice` selecting the flawed step and
  its reason (bundle "which step + why" into the options). Free-text localization
  needs **new support**.
- **Placement:** **Practice** (`drill`/`transfer`). Excellent for encoding known
  misconceptions from the insight contract into a graded item.
- **Karatsuba example:** "A student computes \(z_1 = AD + BC\) by finding \(AD\) and
  \(BC\) separately, then claims Karatsuba still uses four multiplications. Which
  claim is wrong and why?" → `multiple-choice` (the separate computation is the
  naive method; Karatsuba recovers the *sum* with one product).
- **Other-domain example (red-black trees):** "After this insertion the tree has two
  consecutive red nodes. Which property is violated and which rotation/recolor
  fixes it?" → `multiple-choice`.

## Pattern: counterexample generation

- **What it measures:** whether the learner understands a claim's **boundaries** by
  producing (or selecting) a case that breaks an overly broad statement.
- **Weak version:** "which of these is a counterexample?" with only one that even
  parses — recognition, not construction.
- **Strong version:** the learner constructs an input that violates a tempting-but-
  false generalization, or picks the one case (among plausible ones) that actually
  refutes it and says what it refutes.
- **Common false positives:** picking a case that fails for an unrelated reason;
  choosing the "weird-looking" option; confusing a hard case with a counterexample.
- **Suitable interaction formats:** `multiple-choice` (select the refuting case +
  reason). Learner-*constructed* counterexamples need **free input support (new)**,
  so construction belongs in **learner validation**.
- **Placement:** **Practice** (`transfer`) for selection; construction in learner
  validation.
- **Karatsuba example:** "Someone claims 'the three coefficients \(z_2, z_1, z_0\)
  are always single digits.' Give a product where that fails." → the boundary case
  \(78 \times 56\) (\(z_1 = 82\) overflows). Selection via `multiple-choice`.
- **Other-domain example (sorting):** "Someone says 'quicksort is always
  \(O(n \log n)\).' Which input refutes that?" → already-sorted input with naive
  pivot → \(O(n^2)\).

## Pattern: invariant recognition

- **What it measures:** whether the learner sees **what stays fixed** under an
  operation — the load-bearing structure behind the method.
- **Weak version:** ask for the invariant's *name* (recall) rather than requiring
  the learner to use it or verify it holds.
- **Strong version:** the learner checks an invariant on a concrete case, or
  predicts that a transformation preserves it, or explains why the invariant makes
  the method correct.
- **Common false positives:** naming the invariant without applying it; confirming
  it only on the symmetric/identity case where everything looks invariant.
- **Suitable interaction formats:** `prediction` ("does this hold after the step?"),
  `numeric`/`vector` verifying a preserved quantity, `multiple-choice` for "which of
  these is preserved?" Prefer **asymmetric** inputs so the invariant is non-trivial.
- **Placement:** **Explore** (verify the invariant live) and **Practice**.
- **Karatsuba example:** "Change \(AD\) and \(BC\) while keeping \(AD + BC\) fixed
  (e.g. \(3{+}8\) vs \(5{+}6\)). What happens to the final product, and why?" →
  `prediction` (unchanged: the answer depends only on the sum).
- **Other-domain example (linear algebra):** "For \(A\), which directions have
  \(A\mathbf{v} = \lambda\mathbf{v}\) (stay on their own line)?" → `eigenvalue` /
  invariant-direction identification.

## Pattern: representation switching

- **What it measures:** whether the learner can **move between representations** of
  the same idea (algebra ↔ geometry/area ↔ recursion tree ↔ place-value columns)
  and recognize they describe one object.
- **Weak version:** work entirely in one representation, or match a diagram to its
  pre-labeled equation (recognition).
- **Strong version:** translate a result obtained in one representation into another
  — e.g. read off an algebraic coefficient from a shaded area, or a leaf count from
  a recurrence.
- **Common false positives:** matching by surface cues (same numbers appear);
  never actually reasoning in the target representation.
- **Suitable interaction formats:** `multiple-choice` linking a region/tree to its
  expression; **Explore** where changing one representation updates another. A
  drag-to-shade-a-region task needs **new region-interaction support**.
- **Placement:** **Explore** (the explorer *is* the multi-representation surface)
  and **Practice**.
- **Karatsuba example:** "The region left after peeling \(AC\) and \(BD\)
  from the \((A+B)(C+D)\) rectangle (the two opposite corners) equals which algebraic quantity?" →
  `multiple-choice` (\(AD + BC\)).
- **Other-domain example (Fourier):** "This time-domain spike corresponds to which
  feature of the frequency-domain plot?" → `multiple-choice`.

## Pattern: boundary-case reasoning

- **What it measures:** whether the learner handles **edge inputs** correctly —
  overflow, zero, empty, off-axis, degenerate — where the naive mental model tends
  to break.
- **Weak version:** only "nice" inputs (the clean example) are ever tested, so the
  boundary is never exercised.
- **Strong version:** an input that triggers a boundary the lesson explicitly
  distinguished (e.g. coefficient overflow vs operand-width growth), graded on
  handling *both* correctly and separately.
- **Common false positives:** succeeding on the clean case and assuming the boundary
  is "the same thing"; conflating two distinct edge effects.
- **Suitable interaction formats:** `multiple-choice` (name the correct handling),
  `numeric` on a boundary input, **Explore** with badges that light on the boundary
  condition.
- **Placement:** **Practice** (often two mirror items so the two effects are not
  merged) and **Explore** (badges).
- **Karatsuba example (paired):** "In \(78 \times 56\), \(A + B = 15\) has two
  digits — what does that mean?" (answer: the sum-product's *operands* are wider →
  padding, **not** a fourth multiply, **not** carrying) *and its mirror* "the
  coefficients \(z_i\) exceed one digit — resolved by ___?" (output carrying). →
  two `multiple-choice` items.
- **Other-domain example (red-black trees):** "What is the correct fixup when the
  inserted node is the root?" → `multiple-choice` (recolor black; no rotation).

## Pattern: complexity reasoning

- **What it measures:** whether the learner reasons about **growth/cost** correctly —
  distinguishing a constant-factor saving from an asymptotic (exponent) change.
- **Weak version:** recall the big-O symbol from the slide, or compute a one-off
  operation count with no growth reasoning.
- **Strong version:** the learner connects a *recurring* structural change to the
  exponent — "the saving recurs, so branching factor 3 vs 4 sets \(n^{\log_2 3}\) vs
  \(n^2\)" — and rejects the "25% faster" framing.
- **Common false positives:** treating a per-level saving as a fixed percentage;
  quoting \(n^{\log_2 3}\) while explaining it as a constant speedup; picking the
  option with the scariest exponent.
- **Suitable interaction formats:** `multiple-choice` (which exponent / small-vs-
  large payoff), `numeric` (leaf count at depth \(k\)), **Explore** recursion-tree
  panel comparing branch-3 vs branch-4 leaf counts.
- **Placement:** **Practice** (`transfer`) and **Explore**; the "constant vs
  exponent" misconception discriminator is also a strong learner-validation probe.
- **Karatsuba example:** "Replacing four half-size multiplications with three changes
  the exponent from \(\log_2 4 = 2\) to which value?" → `multiple-choice`
  \(\log_2 3 \approx 1.585\) (distractors: `1.75`, `0.75` (a 25% saving), `2`).
- **Other-domain example (sorting):** "Merge sort does \(\Theta(n)\) work per level
  over \(\log_2 n\) levels — total?" → `multiple-choice` \(\Theta(n \log n)\).

## Pattern: transfer to an unfamiliar problem

- **What it measures:** the strongest evidence of understanding — whether the
  learner **recognizes the same principle** in a setting they have not seen and
  applies it *without* being told the pattern's name.
- **Weak version:** a "new" problem that is the lesson's problem with renamed
  symbols, or one that names the technique ("use Karatsuba here"). This is recall in
  disguise.
- **Strong version:** a genuinely different surface where the deep structure
  matches; the learner discovers the mapping (e.g. "these intermediates are only
  needed as a fixed combination, so compute the combination directly") unaided.
- **Common false positives:** surface pattern-matching on shared vocabulary;
  reciting a related fact (e.g. Strassen) as *recall* rather than deriving it;
  the prompt leaking the technique; **for a grounded insight, solving only the
  familiar scenario** (e.g. the drinking-age Wason task but not an unfamiliar
  symbolic one) — that is learning the story, not the concept.
- **Abstraction return (grounded insights).** When the insight was taught through a
  semantic/operational bridge (see the gate's
  [grounding audit](./INSIGHT_DISCOVERY_GATE.md#audit-b--grounding--model-change-stage-2)),
  the transfer probes should distinguish four levels, not collapse them:
  (1) recognizing the familiar story; (2) explaining the structural mapping;
  (3) transferring the inference to a *different* context; (4) solving the abstract
  form. Credit acquisition only from levels 3–4. The unaided level-4 case belongs in
  **learner validation**, not stacked into Practice.
- **Suitable interaction formats:** `multiple-choice` for a guided transfer item;
  genuine, unaided transfer needs the **learner-validation pilot** (Phase 4 T1,
  which deliberately never says "Karatsuba").
- **Placement:** **exactly one** guided `transfer` item in Practice; the real,
  unaided transfer in **learner validation**.
- **Karatsuba example (Practice):** "Strassen multiplies two \(2\times2\) blocks
  with 7 multiplications instead of 8, recursively. Its exponent is?" →
  `multiple-choice` \(\log_2 7 \approx 2.807\). *(Validation T1 instead poses a
  novel two-part-signal problem with no stated speedup and no name.)*
- **Other-domain example (validation-style):** "A pipeline needs \(L = p_1 q_1\),
  \(M = p_1 q_2 + p_2 q_1\), \(H = p_2 q_2\) and currently uses four products. Can it
  use fewer, and would the recursive payoff be small or large?" → free reasoning.

## Pattern: distinguishing mathematical ideas from implementation details

- **What it measures:** whether the learner separates the **essential mathematical
  structure** from **incidental implementation mechanics** — knowing which parts are
  the idea and which are bookkeeping.
- **Weak version:** treat every step as equally fundamental, so normalization/
  bookkeeping is mistaken for part of the core idea (or vice versa).
- **Strong version:** the learner identifies that a step is bookkeeping that does
  **not** change the mathematical result or the operation count, and can say why the
  core identity would hold without it.
- **Common false positives:** labeling the unfamiliar step as "the trick"; assuming
  any extra work must add to the fundamental cost (e.g. thinking carrying adds a
  multiplication).
- **Suitable interaction formats:** `multiple-choice` ("which of these is essential
  to *why the method works*, vs a normalization step?"), `prediction` with reveal.
- **Placement:** **Practice** and **Check**; also a validation objective (O5).
- **Karatsuba example:** "Which of these is part of *why three products suffice*,
  and which is bookkeeping that does not change the multiplication count?
  (a) the identity \(z_1 = (A{+}B)(C{+}D) - AC - BD\); (b) carrying overflowing
  \(z_i\) into digits." → `multiple-choice` ((a) essential; (b) a separate additive
  normalization).
- **Other-domain example (Fourier):** "Is the FFT's speed due to the mathematical
  evaluate-multiply-interpolate structure, or to using floating point?" →
  `multiple-choice` (the structure; float is an implementation detail).

---

## Choosing a small assessment set

The goal is **coverage without a test-heavy feel**. A lesson should feel like it
teaches and lets you check yourself — not like an exam. Cover the three assessment
levels the validation protocol uses — **recall**, **reconstruction**, and
**transfer** — with the *minimum* number of probes, and push the heaviest probing
out of the in-lesson surface into the pilot.

### Recommended minimal set (per lesson)

- **Check (1 item):** exactly **one** lightweight *prediction* or *recall* probe,
  revealed after the learner commits. This is the cheapest, highest-value pattern
  (prediction cannot be back-filled) and it primes the Explore phase. Keep it
  conceptual, not computational.
- **Explore (woven, not counted as exercises):** 1 **prediction** + **invariant/
  representation-switch** verification, using the explorer's readouts as the answer
  key. These feel like play, not testing.
- **Practice (2–4 graded exercises):**
  - 1–2 **reconstruction / procedural** items that grade a *method-specific
    intermediate* (e.g. \(z_1\) by subtraction), not just a final number a naive
    method could also produce;
  - 1 **boundary-case** item (or a mirrored pair when the lesson explicitly split
    two edge effects, as Karatsuba does with carrying vs operand width);
  - **exactly one** genuine **transfer** item.
- **Learner validation (the pilot):** reserve **full unaided reconstruction**,
  **counterexample/explanation construction**, and **untelegraphed transfer** for
  here. Do **not** stack these into Practice — in-app they collapse into
  false-positive-prone multiple-choice, and they lengthen the lesson without adding
  trustworthy signal.

That is roughly **1 Check + a couple woven Explore predictions + 2–4 Practice
exercises**, with the heavy stuff off-surface. Anything beyond this per lesson
starts to feel like a quiz.

### Avoiding false-positive-heavy patterns dominating

Recall and yes/no items are the easiest to author and the easiest to fake, so they
tend to crowd out stronger patterns. Guard against it:

- **Cap recall.** At most one pure-recall item per lesson; never let recall be the
  only thing Practice measures.
- **Prefer commit-before-reveal.** Prediction and reconstruction resist back-filling
  from on-screen answers; lead with them.
- **Grade the method, not the number.** When a naive approach yields the same final
  value, grade an intermediate that only the intended method produces (the
  \(z_1\)-by-subtraction item is the canonical example).
- **Use asymmetric / boundary inputs.** Symmetric, identity, or clean cases let a
  wrong model look right; pick inputs where the naive model visibly fails.
- **Bundle "which + why."** For multiple-choice error-diagnosis and complexity
  items, make the reason part of the selected option so fluent-sounding wrong
  reasoning is a distractor, not a free pass.
- **One transfer, done honestly.** More than one guided transfer item usually means
  the extras are recall in disguise; keep the untelegraphed transfer in validation.

### Tiers ↔ phases

The `tier` field (`check | drill | transfer`) maps cleanly onto the flow and onto
the three validation levels:

| Tier | Phase(s) | Pattern focus | Validation level |
| --- | --- | --- | --- |
| `check` | Check (and light Practice openers) | prediction, recall, explanation-lite | Recall |
| `drill` | Practice (and scaffolded Explore) | procedural execution, reconstruction slices, invariant, boundary case | Reconstruction |
| `transfer` | Practice (the single transfer item) | transfer, complexity reasoning, counterexample selection | Transfer |

Keep the **counts** small and the **tier mix** balanced: a lesson that is all
`check` measures only recall; a lesson that is all `drill` is a problem set. One
`check`, a couple of `drill`, and exactly one `transfer` covers the three levels
while staying light — and the deepest reconstruction and transfer evidence is
collected in the learner-validation pilot, not by stacking probes into the lesson.
