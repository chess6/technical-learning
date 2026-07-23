# Insight Validation Protocol — Karatsuba Lesson

The final **learner-validation** layer of the [Insight Discovery Gate](insight-discovery-gate.md).
A printable, operational pilot that tests whether a shipped lesson actually made
learners **acquire** its approved insight — not whether they can recite a formula
or repeat the steps. Worked application throughout: **Karatsuba multiplication**.

- **Validates:** the approved insight in [insights/karatsuba.md](../courses/algorithms/lessons/karatsuba/insight.md)
  (the Stage 2 contract). The lesson under test is
  [lesson-plans/karatsuba.md](../courses/algorithms/lessons/karatsuba/lesson-plan.md) /
  [`src/lessons/karatsuba.ts`](../../src/lessons/karatsuba.ts).
- **Format:** 1 facilitator + 1 learner. Screen + audio recording recommended.
- **Time:** 20–30 min per learner. **Sample:** 5–8 learners (pilot, not a study).
- **Tone / accessibility:** follow [authoring/lesson-design.md](lesson-design.md) — no leading
  questions, no jargon the learner hasn't met, reduced-motion respected, the
  *lesson* is on trial, never the learner.

---

## 1. Purpose & positioning

The gate's three stages (Brief → Contract → Lesson Plan) guarantee the lesson is
*built* around a verified insight. They do **not** prove the insight *lands*. This
protocol is the layer **after implementation**: it closes the loop by measuring
acquisition against the approved contract.

- It tests **insight acquisition**, not step recall. A learner who reproduces
  $(A+B)(C+D)-AC-BD$ from memory but cannot say *why* it works has **failed**, not
  passed.
- It is diagnostic for the **lesson**, not graded for the learner. Every failure
  maps to a concrete lesson beat to revise (§13).
- It separates **interface** confusion (fix the UI) from **conceptual** confusion
  (revise the teaching) so we never blame the math when a button was the problem
  (§14).
- Pass/fail here is the gate on "the lesson works," analogous to the Stage 2
  `PASS`. Runs alongside implementation; changes no lesson code or authoring
  artifacts.

---

## 2. Insight under test

> Ordinary split multiplication computes four subrectangles, but $AD$ and $BC$ are
> required only through their **sum** $AD+BC$ because they occupy the same
> place-value level. The **weighted multiplication rectangle** reveals *what*
> quantity is needed; the **separate auxiliary coefficient rectangle**
> $(A+B)(C+D)$ reveals *how* to get it with one extra multiplication.
> Reconstructing with the original place-value weights preserves the exact
> product, and recursively reducing four products to three changes the
> **exponent** ($\log_2 3$ vs $\log_2 4$), not merely a constant.

The learner must be able to **independently explain** all five targets:

| # | Target | The learner can say… |
| --- | --- | --- |
| **T-1** | Why $AD$ and $BC$ may be combined | Both carry the same place-value weight ($10$), so only the **sum** $AD+BC$ reaches the answer; how the sum splits is invisible. |
| **T-2** | Why $(A+B)(C+D)-AC-BD$ recovers the middle | $(A+B)(C+D)=AC+AD+BC+BD$; removing the two known corners leaves exactly $AD+BC$ — one extra product, not two. |
| **T-3** | Why $100z_2+10z_1+z_0$ reconstructs the product | The weights $100,10,1$ **are** the place values, so reassembling the weighted pieces is the original expansion. |
| **T-4** | Why 4→3 changes the exponent | The saving **recurs**: branching factor $3$ vs $4$ gives leaf count $n^{\log_2 3}\approx n^{1.585}$ vs $n^{\log_2 4}=n^2$; it compounds, so it is an exponent change, not 25% off. |
| **T-5** | Output carrying vs operand-width | Overflowing $z_i$ are normalized by **output carrying** (a separate additive pass); the extra digit in $A+B$ makes the *operands* of $(A+B)(C+D)$ **wider** (padding / uneven widths). Distinct effects; **neither** adds a multiplication. |

These five targets are referenced as **T-1 … T-5** everywhere below (reconstruction
questions, rubric objectives O1–O5, and revision triggers).

---

## 3. Target learner profile

Recruit learners who can be *surprised* by the insight but are not already experts.

**Include (all of):**

- Comfortable with base-10 place value and expanding $(a+b)(c+d)$ by FOIL / the
  distributive law; can read $x^2$ vs $2x$.
- Grade-school multiplication fluent (can multiply two 2-digit numbers by hand).
- Willing and able to **think aloud** — comfortable narrating reasoning, guessing,
  and being wrong out loud.

**Exclude (any of):**

- Already knows Karatsuba, Toom-Cook, fast/FFT multiplication, or the master
  theorem; can state "$n^{\log_2 3}$" from memory. *(Cannot be tested for
  acquisition — they would recall, not discover.)*
- Cannot narrate reasoning even after warm-up (think-aloud is the instrument).
- No basic algebra / place-value fluency (below the lesson's stated prerequisites —
  a prerequisite gap, not an insight failure).

**Mix / notes:** aim for a spread of recursion/big-O comfort (some none, some
some), since **T-4** leans on recursion intuition. Record any prior exposure on the
sheet and analyze borderline cases separately. **Consent:** explain think-aloud +
recording, right to stop, and that the *lesson* is under test.

---

## 4. Session structure (timeboxed)

| Phase | Time | Purpose |
| --- | --- | --- |
| 0. Setup & consent | 2 min | Framing; recording; "there are no wrong answers." |
| 1. Pre-lesson probe | 4–5 min | Capture the **initial** mental model (before any teaching). |
| 2. Think-aloud lesson use | 8–12 min | Learner works the lesson; facilitator mostly silent. |
| 3. Post-lesson reconstruction | 5–7 min | Explain the method unaided (T-1…T-5). |
| 4. Transfer | 4–5 min | Apply the *principle* to an unfamiliar problem. |
| 5. Confidence & debrief | 2 min | Confidence ratings; surface interface complaints. |

Keep a visible timer. If a phase overruns, protect Phases 3–4 (the actual test).
Use **non-lesson numbers** throughout (probe $23\times14$, reconstruct $36\times27$)
so nothing is answered by recognition.

---

## 5. Phase 1 — Pre-lesson questions (reveal the initial model)

Ask verbally; record answers **verbatim**. **Do not teach or correct.** Present one
product on paper: **$23 \times 14$** (not a lesson example).

- **P1.** "Multiply $23 \times 14$ however you like. Talk me through it."
  *(Baseline method: schoolbook, FOIL, or split.)*
- **P2.** "If you split each number into tens and units, how many small
  multiplications do you think it takes? Why that many? Could it be fewer?"
  *(Target naive model: "four, and four is necessary.")*
- **P3.** "Guess: yes or no — can two 2-digit numbers be multiplied with fewer than
  four single-digit multiplications? Why do you think so?"
  *(Captures whether "four is necessary" is held as obvious.)*
- **P4.** "For very large numbers, is doing a bit less arithmetic per step a small
  fixed saving or something bigger? Why?"
  *(Baseline for **T-4** — expect "a constant / a bit faster.")*
- **P5.** Confidence (1–5): "How confident are you there's a genuinely faster way?"

Record P2/P3/P4 verbatim — the **"before"** half of the before/after comparison
(§15).

---

## 6. Phase 2 — Think-aloud procedure & observation rules

**Instructions to learner:** *"Please use this lesson at your own pace. Say out
loud what you're looking at, what you expect to happen next, and anything
confusing. I'll mostly stay quiet — that's normal, not a sign you're doing badly."*

**Facilitator does:**

- Prompt only to keep them **talking**, never to explain content. Allowed neutral
  nudges *only*: *"What are you thinking?" / "What do you expect next?" / "Say more
  about that."*
- At each lesson **prediction pause**, let the learner answer **before** advancing;
  record the prediction and whether it matched.
- Note timestamps for beats mapping to the five targets (`weights`/`share` → T-1,
  `aux-rect`/`subtract` → T-2, `reassemble` → T-3, `branch`/`exponent` → T-4,
  `carry-vs-width` → T-5).

**Facilitator does NOT:**

- Ask leading questions ("So it's only the *sum* you need, right?"). If tempted,
  reflect instead: *"What do you think, and why?"*
- Confirm or deny correctness. If asked "is this right?", reflect it back.
- Explain, hint at, or gesture toward the concept — ever.

**Observation rules — what to record:** the verbatim prediction at each pause; where
attention goes; spontaneous "aha" moments and their trigger; every point of
friction (and whether it was interface or conceptual, §14); silence handling.

**Silent moments — stay silent, wait ≥ 20 s (or until the learner explicitly gives
up):** helping here destroys the measurement.

- **S1** — when the lesson asks *which two pieces share a weight* (before `share`).
- **S2** — when asked *what remains after removing $AC$ and $BD$* (before `subtract`).
- **S3** — when predicting *how many sub-multiplications per level* (before `branch`).
- **S4** — any pause to reason about the middle-coefficient identity.
- **S5** — during **all** reconstruction/transfer questions (Phases 3–4).

**The one allowed nudge.** A **single neutral orienting nudge** is permitted **only**
for an *interface* block (e.g. "that toggle shows the other rectangle") — never for
the concept. Label every intervention on the sheet as `interface` or (forbidden)
`concept`. If you ever nudge the concept, the affected objective is **void** for
that learner; note it.

---

## 7. Phase 3 — Post-lesson reconstruction (unaided)

Close/hide the lesson. Give **blank paper** and a fresh product: **$36 \times 27$**
(not a lesson example). Ask the learner to reconstruct, thinking aloud. The five
questions map one-to-one to T-1…T-5 (rubric objectives O1…O5).

- **R1 → T-1 (O1).** "You split into $A,B,C,D$ and multiplied out. Which pieces land
  on the same place-value column, and why does that matter for what you must
  compute?"
  *Look for:* $AD$ and $BC$ both weighted by $10$ ⇒ only the **sum** $AD+BC$ is
  needed; the split is invisible to the answer.
- **R2 → T-2 (O2).** "You computed $(A+B)(C+D)$. Why does subtracting $AC$ and $BD$
  give exactly the middle quantity you need?"
  *Look for:* $(A+B)(C+D)=AC+AD+BC+BD$; removing the two known corners leaves
  $AD+BC$. *Bonus:* names the two rectangles as **different** objects.
- **R3 → T-3 (O3).** "You end with $100z_2+10z_1+z_0$. Why does that rebuild the
  original product exactly?"
  *Look for:* $100,10,1$ are the place values; reassembling weighted pieces = the
  original expansion. *Bonus:* notes carrying is a separate step.
- **R4 → T-4 (O4).** "This replaces four multiplications with three. For big
  numbers, is that a 25%-off coupon or something stronger? Why?"
  *Look for:* the saving **recurs**; branching factor $3$ vs $4$ ⇒ exponent
  $\log_2 3$ vs $\log_2 4$; it compounds.
- **R5 → T-5 (O5).** "In one worked case $A+B$ had an extra digit, and separately
  some coefficients were bigger than one digit. Same problem? How is each handled?"
  *Look for:* **wider operands** in $(A+B)(C+D)$ → padding / uneven widths (not a
  fourth multiply); **output carrying** normalizes overflowing $z_i$; the two are
  distinct and neither adds a multiplication.

For each: ask open-ended, stay silent (S5), then at most **one** neutral follow-up
("why?"). Never supply the missing step.

---

## 8. Phase 4 — Transfer (one genuinely unfamiliar problem)

**Goal:** detect whether the learner carries the *principle* — "*when a value is only
needed as a fixed combination of sub-parts, get the combination directly with one
extra evaluation instead of computing the parts separately, because they land at
the same level*" — into a setting they have **not** seen. This problem is **not**
Karatsuba on new digits (no base / place value at all) and **not** Strassen.

### T1 — Primary transfer (linear-polynomial coefficient products)

Read aloud and hand over on paper:

> You have two linear expressions
> $$f(t) = p\,t + q, \qquad g(t) = r\,t + s.$$
> Their product is a quadratic
> $$h(t) = f(t)\,g(t) = \alpha\,t^2 + \beta\,t + \gamma.$$
> Your hardware charges heavily for **each multiplication of two unknown
> numbers**; additions, subtractions, and multiplying by a small fixed constant are
> free. You need all three coefficients $\alpha,\beta,\gamma$.
>
> 1. Naively, how many expensive multiplications does computing
>    $\alpha,\beta,\gamma$ take? Which ones?
> 2. What is the **minimum** number of expensive multiplications, and how would you
>    achieve it?
> 3. Justify *why* your minimum is enough. If this trick were applied recursively to
>    much larger objects, would the payoff be a small constant or something bigger?

**Do not mention Karatsuba, polynomials-as-Karatsuba, or "evaluate/interpolate."**
Stay silent (S5).

**Expected reasoning (facilitator key — do not read to the learner):**

- $\alpha = p r$ and $\gamma = q s$ (2 products). Naive middle $\beta = p s + q r$
  costs 2 more ⇒ **4** total.
- The middle is only needed *as the combined quantity* $\beta = ps+qr$. Compute one
  extra product $(p+q)(r+s) = pr + ps + qr + qs$ and subtract the two knowns:
  $$\beta = (p+q)(r+s) - \alpha - \gamma.$$
  ⇒ **3** expensive multiplications.
- *Justification (either path counts; the second is the deeper one):*
  (a) algebraic — $(p+q)(r+s)-pr-qs = ps+qr$; or (b) evaluation — $h(t)$ is degree
  $2$, so it is fixed by its values at **three** points; $h(\infty)\!\sim\!\alpha=pr$,
  $h(0)=\gamma=qs$, $h(1)=(p+q)(r+s)$ give three evaluations that determine all
  coefficients. Recursively the saving **recurs**, so it changes the growth rate
  (an exponent), not a constant.
- **Full principle (level-4):** *"When intermediate values are only ever needed
  through a fixed combination, compute the combination directly with one extra
  evaluation instead of computing the parts separately."*

### Transfer scoring (level-4 rubric for this problem)

| Level-4 signal | Evidence |
| --- | --- |
| Recognizes the combination | States that $\beta$ is needed only as the whole $ps+qr$, not $ps$ and $qr$ separately. |
| Constructs the saving | Produces $\beta=(p+q)(r+s)-\alpha-\gamma$ → **3** products (unprompted). |
| Justifies it | Gives the algebraic identity **or** the "degree-2 ⇒ 3 evaluations" argument. |
| Generalizes growth | Predicts recursion turns the one-per-level saving into an exponent/large-$n$ win, not 25%. |
| States the principle | Articulates the general rule in problem-independent terms (quote it). |

**Score level 4 only if** the learner reaches the 3-product construction **and**
states the general principle (last two rows) **without** the facilitator naming
Karatsuba or the trick. Getting to 3 products by rote analogy alone, without the
generalization, is strong reconstruction (level 3), **not** transfer.

### T3 — Misconception discriminator (ask after T1)

"Someone says: 'skipping one of the four multiplications makes it 25% faster
overall.' Agree? Why or why not?"
*Correct:* disagree — because the saving recurs it is an **exponent** change.

*(Strassen is deliberately **excluded** as a transfer item: quoting
"$8\to7\Rightarrow\log_2 7$" is recall, not transfer. If a learner raises it
spontaneously, note it but do not credit it as level-4 evidence.)*

---

## 9. Phase 5 — Confidence ratings & interpretation

Collect on the sheet (1 = none, 5 = complete), then compare to actual rubric score.

- **C1.** "I could explain to a friend **why** only three multiplications are needed." (1–5)
- **C2.** "I could re-derive the trick from the rectangle picture without notes." (1–5)
- **C3.** "I understand why it's an exponent change, not a fixed percentage." (1–5)
- **C4.** "I could spot this same trick in a different problem." (1–5)
- **C5.** Post-lesson repeat of P5; record the **delta** $\Delta$(P5 → C1).

**Over/under-confidence interpretation** (compare mean confidence to rubric level):

| Confidence vs actual score | Reading | Action |
| --- | --- | --- |
| High confidence (4–5), low score (0–1) | **Overconfident** — *illusion of understanding*. The lesson produced fluency without comprehension; the most dangerous outcome. | Revise the beat that let a rote path feel like understanding; add a "why" checkpoint that a memorized path can't pass. |
| Low confidence (1–2), high score (3–4) | **Underconfident** — the lesson *works* but doesn't *feel* convincing. | Reassurance / summary framing issue, not a conceptual failure; strengthen the "you can now predict…" close. |
| Confidence ≈ score | **Calibrated** — trust the score. | No calibration action; treat the rubric level at face value. |

Also ask one open question: *"What, if anything, was confusing about the lesson
itself — buttons, layout, wording — separate from the math?"* → feeds §14.

---

## 10. Insight-acquisition rubric (score each learner 0–4)

Assign the **highest level fully met**; require the evidence, not keywords.

| Score | Level | Karatsuba-specific descriptor (observable) |
| --- | --- | --- |
| **0** | None | Cannot execute or explain. Cannot even reproduce the method for $36\times27$; no correct product, no articulable procedure. |
| **1** | Recall / execution only | Executes memorized steps and may get the number, but cannot say *why*. Treats $(A+B)(C+D)-AC-BD$ as a rule to follow; when asked "why," restates the steps or says "that's the formula." |
| **2** | Partial | Explains the **subtraction identity** $z_1=(A+B)(C+D)-AC-BD$ (R2/O2 pass) **but not** place-value necessity (R1/O1 fail): can't say why $AD$ and $BC$ *may* be combined, or still believes "all four are really needed / three is a lucky trick." |
| **3** | Reconstruction | Explains the **complete causal chain**: R1–R3 correct, and R4 (exponent) and R5 (carry vs width) correct or nearly so; rebuilds the method from the picture unaided. Sees the place-value necessity, not just the identity. |
| **4** | Transfer | All of level 3 **plus** solves **T1** independently *and* states the general principle — recognizes the same optimization in the unfamiliar problem without being told. |

Also record per-objective pass / partial / fail for **O1–O5** (= T-1…T-5), so partial
profiles remain visible even when the overall level is low.

**Level bindings ↔ phases:** Recall → Phase 2 execution + R-answers given
mechanically (≤1). Reconstruction → Phase 3 R1–R5 derived from the
area/place-value picture (2–3). Transfer → Phase 4 T1 solved and principle
generalized (4).

---

## 11. Observation sheet (printable, one per learner)

```
INSIGHT VALIDATION — KARATSUBA            Learner ID: ____   Date: ______
Facilitator: __________   Prior exposure to Karatsuba/big-O? [none/some/much]
Recording: [ ] screen  [ ] audio         Device/build: ____________________

--- PHASE 1: PRE-LESSON MODEL (verbatim) ---
P1 method for 23×14: ______________________________________________
P2 how many small mults? ____  necessary? [Y/N]  reason: __________
P3 fewer possible? [Y/N/uncertain]  reason: _____________________
P4 big-n saving = [constant / bigger]  reason: __________________
P5 confidence a faster way exists (1–5): ____

--- PHASE 2: THINK-ALOUD (prediction BEFORE advancing) ---
S1 weights: shared-weight pieces predicted? [correct/partial/wrong/none]
S2 subtract: "what remains" predicted?      [correct/partial/wrong/none]
S3 branch: #sub-mults predicted?            [correct/partial/wrong/none]
Silent moments honored (S1–S4)?             [Y/N — note any help given]
Interventions (label each): _____________ [interface / CONCEPT(=void)]
Spontaneous "aha"? where / trigger: _____________________________

--- PHASE 3: RECONSTRUCTION (36×27, unaided)  O = pass/partial/fail ---
R1/O1 AD & BC combine (place-value)      O1: ____  notes: _________
R2/O2 (A+B)(C+D)-AC-BD = middle          O2: ____  notes: _________
R3/O3 100z2+10z1+z0 rebuilds product     O3: ____  notes: _________
R4/O4 exponent, not 25%                  O4: ____  notes: _________
R5/O5 carry vs wider operands distinct   O5: ____  notes: _________

--- PHASE 4: TRANSFER (linear-polynomial coefficients) ---
T1 recognized combined middle (β as a whole)?   [Y/partial/N]
T1 built (p+q)(r+s)-α-γ  → 3 products?          [Y/N]
T1 justified (identity or 3-evaluations)?       [Y/N]  which: _____
T1 predicted exponent / large payoff?           [Y/N]
T1 stated the general principle?                [Y/N]  quote: _____
T3 rejected "25% faster"?                        [Y/N]

--- PHASE 5: CONFIDENCE (1–5) ---
C1 __  C2 __  C3 __  C4 __   ΔP5→C1: ____
Calibration: [overconfident / underconfident / calibrated]
Interface complaints (verbatim): ________________________________

--- SUMMARY ---
Rubric level (0–4): ____   Objectives passed: O1_ O2_ O3_ O4_ O5_
Confusion type: [none / interface / conceptual / both]
Revision triggers fired (T-1…T-5, §13): _________________________
One-line takeaway: ______________________________________________
```

---

## 12. Scoring criteria (per learner & per cohort)

**Per learner:** rubric level (0–4); the five objective flags O1–O5; confusion type;
confidence calibration and $\Delta$(P5→C1).

- **A learner "acquired" the insight** iff rubric **≥ 3 and O1 (place-value
  necessity) is a pass**. Rubric 3 without O1 is impossible by definition — if you
  record it, re-check R1 scoring.
- **Full success** = rubric **4** (T1 solved independently + principle stated).

**Cohort pass bar (pilot, n ≈ 5–8) — treat the lesson as validated when all hold:**

- **≥ 60%** of learners reach rubric **≥ 3**, and
- **≥ 2** learners reach rubric **4**, and
- **no single objective O1–O5 fails for a majority** of learners.

These are pilot heuristics, not statistics. Score from recordings where possible;
use **two scorers on ≥ 2 learners**, resolving disagreement by re-listening to the
verbatim answer.

---

## 13. Revision triggers (failure pattern → lesson fix)

Log which lesson element each signal points at. A trigger is actionable when it
**recurs across learners**, not once.

**Quantitative rule.** For each target **T-k**, if **≥ 3 of N** learners (or **≥ 40%**,
whichever is smaller for the sample) score **≤ 1** on objective **Ok**, the beat
mapped to T-k **must be revised** before the lesson is considered validated.

| Target | Trigger (≥3 of N score ≤1 on…) | Failure pattern | Revise this lesson beat |
| --- | --- | --- | --- |
| **T-1** | O1 (place-value necessity) | Can subtract, but says "all four are really needed" / can't name the shared column. | `weights` + `share` beats and the **checkpoint**; strengthen the "same tens column ⇒ only the sum" reveal. |
| **T-2** | O2 (subtraction identity) | Applies $(A+B)(C+D)-AC-BD$ mechanically; can't explain *why* it isolates $AD+BC$; conflates the two rectangles. | `aux-rect` + `subtract` beats; strengthen the visual separation of the two rectangles and the "peel the two known corners" step. |
| **T-3** | O3 (reconstruction) | Can't say why $100z_2+10z_1+z_0$ *is* the product; treats weights as arbitrary. | `reassemble` beat + reconstruction readout; make the $100/10/1$ = place-value link explicit. |
| **T-4** | O4 (exponent) | Answers "25% faster" at R4/T3 despite the cost beats. | `branch` + `exponent` beats / recurrence-tree panel and exercise 3 framing. |
| **T-5** | O5 (carry vs width) | Merges output carrying with wider operands; thinks the wider $A+B$ adds a fourth multiply or is "fixed by carrying." | `carry-vs-width` beat, the two explorer badges, the `wider-is-carrying` callout, and exercises 5–6. |

**Cross-cutting triggers:**

- **No transfer (F-transfer):** rubric ≤ 3 with **T1 failing for most**, even when
  reconstruction succeeds → the lesson teaches the *instance* but not the
  *principle*. Add an explicit "when intermediates are only needed as a
  combination…" generalization to **Summarize / Practice**.
- **Predictions never engaged:** learners skip prediction pauses or aren't given
  time → autoplay/pacing or UI problem (classify via §14), **not** necessarily
  conceptual.

---

## 14. Distinguishing interface confusion from conceptual confusion

Classify every struggle **before** blaming the teaching. Rule of thumb:
**the facilitator may fix interface, must never fix concept.** A learner blocked
purely by interface still has valid conceptual scores once oriented — note it so
triggers (§13) aren't misattributed.

**Decision table** — apply per struggle:

| Signal observed | Diagnostic move | If it unblocks reasoning | Classification | Action |
| --- | --- | --- | --- | --- |
| Can't find/operate a control (steppers, toggle, Next-idea); scrubber resets; text unreadable; doesn't see the two rectangles are separate panels — **but** talks about the math soundly once oriented | One **neutral orienting nudge** ("that toggle shows the other rectangle") | Learner proceeds and reasons correctly immediately | **Interface** | Fix the UI; do **not** count against the insight; conceptual scores remain valid. |
| Operates everything fine, but cannot say *why*; predictions wrong even with the visual in front of them; reverts to "you just memorize the formula" | Offer the **same** neutral orienting nudge (never a conceptual hint) | Nudge does **not** unblock the explanation | **Conceptual** | Counts against the insight; may fire a T-1…T-5 trigger (§13). |
| Understands **why** $AD+BC$ combine and what to compute, but can't locate the explorer control to do it | Orient to the control | Then explains correctly | **Interface** | UI fix only. |
| Clicks the right controls and gets the right number, but can't justify any step | (no nudge helps) | — | **Conceptual** | Insight failure; log objective(s). |

Record which kind each intervention was on the sheet. Interface-only blocks that
prevented a learner from ever reaching a beat make that objective **not assessed**
(blank), not a fail.

---

## 15. Before/after explanation comparison

For each learner, place the **initial model** (verbatim P2/P3/P4) next to the
**post-lesson explanation** (verbatim R1/R4/R5) and code the shift. Prefer quoting
the learner's own sentences so the change is auditable.

| Dimension | Before (Phase 1, verbatim) | After (Phase 3/4, verbatim) | Coded shift |
| --- | --- | --- | --- |
| # multiplications needed | P2 (expect "four, all needed") | R1 ("three; middle only as a sum") | none / partial / full |
| Is a saving possible & why | P3 | R2 (constructs it) | none / partial / full |
| Nature of the speedup | P4 (expect "constant / a bit") | R4 + T3 ("exponent, compounds") | none / partial / full |
| Confidence a faster way exists | P5 (1–5) | C1 (1–5) | $\Delta$ |

**Shift codes:** `none` = same mental model / vocabulary only; `partial` = correct
mechanism but a gap (e.g. builds it but still calls it "25% faster"); `full` = the
*reasoning* changed, stated in the learner's own words.

**Guard against fake shifts.** Report a shift as **genuine acquisition only when the
reasoning changed, not just the vocabulary.** A learner who now says
"$n^{\log_2 3}$" but still explains it as "25% faster" has **not** shifted on the
exponent dimension — code that `partial` at most. Verbatim before/after quotes are
the evidence.

---

## 16. Facilitator quick-reference (print on the back)

- Stay silent at **S1–S5**; wait ≥ 20 s. Reflect questions back; never lead.
- **Fix interface, never concept.** Label every intervention; a concept nudge voids
  that objective.
- Let every prediction pause resolve **before** advancing.
- Use non-lesson numbers: probe **23×14**, reconstruct **36×27**.
- Transfer = the **linear-polynomial** problem (T1). Never say "Karatsuba."
  Strassen is **not** a transfer item.
- Score: rubric **0–4** + objectives **O1–O5**; "acquired" = rubric ≥ 3 with **O1**
  pass; "full" = rubric 4 with T1 + principle stated.
- Confidence vs score: overconfident (fluency without understanding) is the
  dangerous case — flag it.
