# Insight Validation Protocol — Karatsuba Lesson

A lightweight, printable pilot for checking whether learners actually **acquire**
the approved Karatsuba insight — not whether they can recite the formula. Run it
alongside implementation; it changes no lesson code or authoring artifacts.

- **Related:** [insight contract](./insights/karatsuba.md),
  [Stage 3 lesson plan](./lesson-plans/karatsuba.md).
- **Format:** 1 facilitator + 1 learner, screen + audio recording optional.
- **Time:** 20–30 min/learner. **Sample:** 5–8 learners.

---

## Insight under test

> Ordinary split multiplication computes four subrectangles, but $AD$ and $BC$ are
> only required through their **sum** because they occupy the same place-value
> level. The **weighted multiplication rectangle** reveals *what* quantity is
> needed; the **separate auxiliary coefficient rectangle** reveals *how* to
> compute it with one multiplication. Reconstructing with the original place-value
> weights preserves the exact product, and recursively reducing four products to
> three changes the **exponent**.

The learner must be able to **independently explain**:

1. why $AD$ and $BC$ may be combined;
2. why $(A+B)(C+D)-AC-BD$ gives the required middle quantity;
3. why $100z_2+10z_1+z_0$ reconstructs the original product;
4. why the saving changes an **exponent** rather than merely giving a 25% speedup;
5. the difference between **output carrying** and **wider sum-product operands**.

---

## Target learner profile

Recruit learners who can be surprised by the insight but are not already experts.

- **Include:** comfortable with base-10 place value and expanding $(a+b)(c+d)$ by
  FOIL; high-school algebra fluency; can read $x^2$ vs $2x$ notation.
- **Exclude:** anyone who already knows Karatsuba, Toom-Cook, or the master
  theorem, or who can state "$n^{\log_2 3}$" from memory (they cannot be tested for
  *acquisition*). Note prior exposure on the sheet; analyze separately if borderline.
- **Mix:** aim for a spread of comfort with big-O / recursion (some none, some
  some), since objective 4 depends on recursion intuition.
- **Consent:** explain think-aloud + recording, right to stop, that the *lesson* is
  under test, not the learner.

---

## Session structure (timeboxed)

| Phase | Time | Purpose |
| --- | --- | --- |
| 0. Setup & consent | 2 min | Framing, recording, "there are no wrong answers." |
| 1. Pre-lesson probe | 4–5 min | Capture the initial model (before any teaching). |
| 2. Think-aloud lesson use | 8–12 min | Learner works the lesson; facilitator mostly silent. |
| 3. Post-lesson reconstruction | 5–7 min | Explain the method from the picture, unaided. |
| 4. Transfer | 4–5 min | Apply the principle to an unfamiliar algorithm. |
| 5. Confidence & debrief | 2 min | Confidence ratings; catch interface complaints. |

Keep a visible timer. If a phase overruns, protect Phases 3–4 (the actual test).

---

## Phase 1 — Pre-lesson probe (reveals the initial model)

Ask verbally; record the learner's own words. **Do not teach or correct.** Present
one concrete product on paper: **`23 × 14`** (chosen so it is *not* a lesson
example, to avoid later recognition).

P1. "Multiply $23 \times 14$ however you like. Talk me through it."
    *(Captures baseline method: schoolbook, FOIL, or split.)*

P2. "If you split each number into tens and units, how many small
    multiplications do you think you need? Why that many?"
    *(Target baseline belief: "four.")*

P3. "Could you do it with fewer multiplications? Guess yes/no and why."
    *(Captures whether "four is necessary" is held as obvious.)*

P4. "For very large numbers, is doing a bit less work per step a small constant
    saving or something bigger? Why?"
    *(Baseline for objective 4 — expect "constant / a bit faster.")*

P5. Confidence (0–5): "How confident are you there's a faster way?"

Record P2/P3/P4 verbatim; these are the **"before"** half of the before/after
comparison (see [Before/After](#beforeafter-comparison)).

---

## Phase 2 — Think-aloud while using the lesson

Instructions to learner: *"Please use this lesson at your own pace. Say out loud
what you're looking at, what you expect to happen next, and anything confusing.
I'll mostly stay quiet."*

Facilitator behavior:

- Prompt only to keep them **talking**, never to explain content:
  neutral nudges only — "What are you thinking?", "What do you expect next?",
  "Say more about that."
- At each lesson **prediction pause**, let the learner answer **before** advancing.
  Record their prediction and whether it matched.
- Note timestamps for the beats that map to the five objectives (weights/`share`,
  `aux-rect`/`subtract`, `reassemble`, `branch`/`exponent`, `carry-vs-width`).

### Silent moments (do NOT help)

The facilitator must **stay silent and wait ≥ 20 seconds** (or until the learner
explicitly gives up) at these points — helping here destroys the measurement:

- S1. When the lesson asks *which two pieces share a weight* (before `share`).
- S2. When asked *what remains after removing $AC$ and $BD$* (before `subtract`).
- S3. When predicting *how many sub-multiplications per level* (before `branch`).
- S4. Any moment the learner pauses to reason about the middle coefficient identity.
- S5. During all post-lesson reconstruction/transfer questions (Phases 3–4).

If the learner asks "is this right?", reflect it back: *"What do you think, and
why?"* Only break silence for **interface** problems (see
[Interface vs conceptual](#interface-vs-conceptual-confusion)).

---

## Phase 3 — Post-lesson reconstruction (unaided)

Close/hide the lesson. Give the learner **blank paper** and a fresh product:
**`36 × 27`** (again not a lesson example). Ask them to reconstruct, thinking aloud.
These map one-to-one to the five required explanations.

R1 → *(objective 1)* "You split into $A,B,C,D$. When you multiply out, which pieces
   land on the same place-value column, and why does that matter for what you must
   compute?"
   *Look for:* $AD$ and $BC$ both weighted by ten ⇒ only the **sum** $AD+BC$ is
   needed; the individual split is invisible to the answer.

R2 → *(objective 2)* "You computed $(A+B)(C+D)$. Why does subtracting $AC$ and $BD$
   from it give exactly the middle quantity you need?"
   *Look for:* $(A+B)(C+D)=AC+AD+BC+BD$; removing the two known corners leaves
   $AD+BC$. Bonus: names the two rectangles as different objects.

R3 → *(objective 3)* "You end with $100z_2+10z_1+z_0$. Why does that rebuild the
   original product exactly?"
   *Look for:* the weights $100,10,1$ are the place values; reassembling weighted
   pieces = the original expansion. Bonus: mentions carrying is separate.

R4 → *(objective 4)* "This replaces four multiplications with three. For big
   numbers, is that a 25%-off coupon or something stronger? Why?"
   *Look for:* the saving **recurs**; branching factor 3 vs 4 ⇒ exponent
   $\log_2 3$ vs $\log_2 2^2$; it compounds, so it is an exponent change.

R5 → *(objective 5)* "In one worked case, $A+B$ had an extra digit, and separately
   some coefficients were bigger than one digit. Are those the same problem? How is
   each handled?"
   *Look for:* **wider operands** in $(A+B)(C+D)$ → padding / uneven widths, not a
   fourth multiply; **output carrying** normalizes overflowing $z_i$; the two are
   distinct and neither adds a multiplication.

For each: first ask open-ended, stay silent (S5), then at most **one** neutral
follow-up ("why?"). Do not supply the missing step.

---

## Phase 4 — Transfer (unfamiliar problem)

Goal: detect whether the learner recognizes the **shared-combination optimization
principle** in a setting they have not seen, *without* pattern-matching a stated
branching factor. Present **one** primary transfer task; keep Strassen only as an
optional secondary probe.

### T1 — Primary transfer (novel divide-and-conquer, no stated speedup)

Read aloud and give on paper:

> A team is combining two two-part signals $P=(p_1,p_2)$ and $Q=(q_1,q_2)$. The
> final report needs exactly three numbers:
> - $L = p_1 q_1$
> - $M = p_1 q_2 + p_2 q_1$
> - $H = p_2 q_2$
>
> Their current code computes all four products $p_1q_1,\ p_1q_2,\ p_2q_1,\
> p_2q_2$. Multiplications are the expensive step; additions are cheap. Can they
> produce $L, M, H$ with fewer multiplications? If so, how — and if this pattern
> ran recursively on larger signals, would the payoff be small or large?"

*Do not mention Karatsuba.* Stay silent (S5).

*Scoring signals:*
- **Recognizes** that $M$ is only needed as a *combined* quantity (like $AD+BC$).
- **Constructs** $M = (p_1+p_2)(q_1+q_2) - L - H$, i.e. one extra product instead
  of two → **three** products.
- **Predicts** that recursively this changes the growth rate (exponent), not just a
  constant — ideally without being told a branching factor.

Full transfer = states the principle in general terms: *"when intermediate values
are only needed through a fixed combination, compute the combination directly."*

### T2 — Secondary probe (optional; only after T1)

"Strassen multiplies $2\times2$ matrix blocks with 7 multiplications instead of 8,
used recursively. Small win or large? Why?" *Treat a correct answer here as weak
evidence if T1 failed — it may be recall of a quoted fact.*

### T3 — Misconception discriminator

"Suppose someone says 'skipping one of the four multiplications makes it 25%
faster overall.' Do you agree? Why or why not?"
*Correct:* disagree — the recurrence makes it an exponent change.

---

## Phase 5 — Confidence ratings

Collect on the observation sheet (0 = none, 5 = complete):

- C1. "I could explain to a friend **why** only three multiplications are needed." (0–5)
- C2. "I could re-derive the trick from the rectangle picture without notes." (0–5)
- C3. "I understand why it's an exponent change, not a fixed percentage." (0–5)
- C4. "I could spot this same trick in a different problem." (0–5)
- C5. Compare to pre-lesson P5. Record the **delta**.

Also ask one open question: *"What, if anything, was confusing about the
lesson itself (buttons, layout, wording) — separate from the math?"* → feeds the
[interface vs conceptual](#interface-vs-conceptual-confusion) split.

---

## Insight-acquisition rubric (score each learner 0–4)

Assign the **highest level fully met**; require the evidence, not just keywords.

| Score | Level | Evidence required |
| --- | --- | --- |
| **0** | None | Cannot execute or explain; cannot reproduce even the method. |
| **1** | Recall | Executes memorized steps (gets the number) but cannot say *why*; treats $(A+B)(C+D)-AC-BD$ as a rule to follow. |
| **2** | Partial | Understands the **subtraction identity** (R2) but **not place-value necessity** (R1) — can't say why $AD$ and $BC$ combine, or thinks all four are "really" needed. |
| **3** | Reconstruction | Explains the **complete causal chain**: R1–R3 correct, and R4 (exponent) and R5 (carry vs width) correct or nearly so; can rebuild from the picture. |
| **4** | Transfer | All of level 3 **plus** solves T1 independently and states the general principle; recognizes it as the same optimization in a new problem. |

Also record per-objective pass/fail (O1–O5) so partial profiles are visible even
when the overall level is low.

### Three assessment levels ↔ phases

- **Recall** → Phase 2 execution + R-questions answered mechanically (rubric ≤ 1).
- **Reconstruction** → Phase 3 R1–R5 derived from the area/place-value picture
  (rubric 2–3).
- **Transfer** → Phase 4 T1 solved and principle generalized (rubric 4).

---

## Observation sheet (printable, one per learner)

```
INSIGHT VALIDATION — KARATSUBA           Learner ID: ____   Date: ______
Facilitator: __________   Prior exposure to Karatsuba/big-O? [none/some/much]
Recording: [ ] screen  [ ] audio        Device/build: ____________________

--- PHASE 1: PRE-LESSON MODEL (verbatim) ---
P1 method for 23×14: ______________________________________________
P2 how many small mults? ____   reason: _________________________
P3 fewer possible? [Y/N/uncertain]  reason: _____________________
P4 big-n saving = [constant / bigger]  reason: __________________
P5 confidence there's a faster way (0–5): ____

--- PHASE 2: THINK-ALOUD (predictions before advancing) ---
Weights: shared-weight pieces predicted? [correct/partial/wrong/none]
Subtract: "what remains" predicted?       [correct/partial/wrong/none]
Branch: #sub-mults predicted?             [correct/partial/wrong/none]
Silent moments honored (S1–S4)?           [Y/N — note any help given]
Interface friction observed: ____________________________________
Spontaneous "aha" moment? where: ________________________________

--- PHASE 3: RECONSTRUCTION (36×27, unaided) O = pass/partial/fail ---
R1 AD & BC combine (place-value)      O1: ____  notes: ___________
R2 (A+B)(C+D)-AC-BD = middle          O2: ____  notes: ___________
R3 100z2+10z1+z0 rebuilds product     O3: ____  notes: ___________
R4 exponent, not 25%                  O4: ____  notes: ___________
R5 carry vs wider operands distinct   O5: ____  notes: ___________

--- PHASE 4: TRANSFER ---
T1 recognized shared combination?     [Y/partial/N]
T1 built (p1+p2)(q1+q2)-L-H (3 mults)?[Y/N]
T1 predicted exponent/large payoff?   [Y/N]
T1 stated the general principle?      [Y/N]  quote: _____________
T3 rejected "25% faster"?             [Y/N]
(optional) T2 Strassen: ______________  [recall-only? Y/N]

--- PHASE 5: CONFIDENCE (0–5) ---
C1 __  C2 __  C3 __  C4 __   ΔP5→C1: ____
Interface complaints (verbatim): ________________________________

--- SUMMARY ---
Rubric level (0–4): ____
Confusion type: [none / interface / conceptual / both]
Failure signals triggered: ______________________________________
One-line takeaway: ______________________________________________
```

---

## Scoring criteria (per learner and per cohort)

- **Per learner:** rubric level (0–4), the five objective flags (O1–O5), confusion
  type, and confidence deltas.
- **A learner "acquired" the insight** if rubric ≥ 3 **and** O1 (place-value
  necessity) is a pass. Rubric 3 without O1 is impossible by definition; if you see
  it, re-check R1 scoring.
- **Full success** = rubric 4 (transfer) with T1 solved independently.
- **Cohort pass bar (pilot, n≈5–8):** treat the lesson as validated when **≥ 60%
  reach rubric ≥ 3** and **≥ 2 learners reach rubric 4**, with **no objective
  failing for a majority** of learners. These are pilot heuristics, not statistics.

Score from recordings where possible; two scorers on ≥ 2 learners to check
agreement, resolve disagreements by re-listening to the verbatim answer.

---

## Failure signals that should trigger lesson revision

Log which lesson element each signal points at (Watch beat, explorer, exercise,
prose). A signal is actionable when it recurs across learners, not once.

- **F1 (place-value not conveyed):** majority fail O1 — can subtract but say "all
  four are really needed" or can't articulate the shared column. → Revise the
  `weights`/`share` beats and the checkpoint.
- **F2 (two rectangles conflated):** learners describe $(A+B)(C+D)$ as "the same
  rectangle" or can't say why it's a *different* object. → Strengthen the visual
  separation in `aux-rect` and the explorer's side-by-side frames.
- **F3 (identity as magic):** pass O2 mechanically but can't explain *why*
  subtraction isolates $AD+BC$ (fail the "why"). → Add/adjust the peel step or a
  depth layer.
- **F4 (exponent misconception persists):** majority answer "25% faster" at R4/T3
  despite the `branch`/`exponent` beats. → Revise the recurrence-tree panel /
  exercise 3 framing.
- **F5 (carry/width conflation):** majority merge output carrying with wider
  operands at R5. → Revise `carry-vs-width` beat, badges, and exercises 5–6.
- **F6 (no transfer):** rubric ≤ 3 with T1 failing for most, even when
  reconstruction succeeds. → The lesson teaches the *instance* but not the
  *principle*; add an explicit "when intermediates are only needed as a
  combination…" generalization to Summarize/Practice.
- **F7 (predictions never engaged):** learners skip prediction pauses or aren't
  given time. → Autoplay/pacing or UI issue (see interface split), not
  necessarily conceptual.

---

## Interface vs conceptual confusion

Classify every observed struggle before blaming the lesson's teaching.

Signs of **interface** confusion (fix UI, do not count against the insight):

- Can't find/operate a control (digit steppers, toggles, Next-idea), scrubber
  resets, text unreadable, badges unnoticed, doesn't realize the two rectangles
  are separate panels because of layout — **but** verbal reasoning about the math
  is sound once oriented.
- Diagnostic: after a *neutral orienting nudge* ("that toggle shows the other
  rectangle"), the learner immediately proceeds and reasons correctly.

Signs of **conceptual** confusion (counts against the insight; may trigger F1–F6):

- Operates everything fine but cannot say *why*; predictions wrong even with the
  visual in front of them; reverts to "you just memorize the formula."
- Diagnostic: orienting help does **not** unblock the explanation.

Rule of thumb: **facilitator may fix interface, must never fix concept.** Record
which kind each intervention was. If a learner is blocked purely by interface,
their conceptual scores are still valid once oriented; note it so F-signals aren't
misattributed.

---

## Before/after comparison

For each learner, place the **initial model** (P2/P3/P4) next to the **post-lesson
explanation** (R1/R4/R5) and score the shift:

| Dimension | Before (Phase 1) | After (Phase 3/4) | Shift |
| --- | --- | --- | --- |
| # multiplications needed | P2 (expect "four, all needed") | R1 ("three; middle only as a sum") | none / partial / full |
| Is a saving possible & why | P3 | R2 (constructs it) | none / partial / full |
| Nature of the speedup | P4 (expect "constant / a bit") | R4 + T3 ("exponent, compounds") | none / partial / full |
| Confidence a faster way exists | P5 (0–5) | C1 (0–5) | Δ |

Report a shift as **genuine acquisition** only when the *reasoning* changed, not
just the vocabulary — a learner who now says "$n^{\log_2 3}$" but still explains it
as "25% faster" has **not** shifted on the exponent dimension. Prefer quoting the
learner's own before/after sentences on the sheet so the change is auditable.

---

## Facilitator quick-reference (print on the back)

- Stay silent at S1–S5; wait ≥ 20s. Reflect questions back.
- Fix interface, never concept. Label every intervention.
- Let every prediction pause resolve before advancing.
- Use non-lesson numbers: probe 23×14, reconstruct 36×27.
- Transfer T1 first; never say "Karatsuba"; Strassen only as a weak secondary.
- Score: rubric 0–4 + O1–O5; "acquired" = rubric ≥ 3 with O1 pass.
