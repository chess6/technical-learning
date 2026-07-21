# Lesson plan — Karatsuba multiplication (Stage 3)

Implementation-ready plan produced from [LESSON_TEMPLATE.md](../LESSON_TEMPLATE.md).
Stage 3 of the [Insight Discovery Gate](../INSIGHT_DISCOVERY_GATE.md). This plan is
detailed enough to implement directly without another design pass.

> **Note on scope / architecture.** This repo's `src/math` and shared examples are
> linear-algebra objects (`Matrix2x2`, `Vector2`). Karatsuba is a different domain,
> so this lesson introduces its **own** pure-math module (`src/math/karatsuba.ts`)
> and its **own** shared-example module (`src/lessons/karatsubaData.ts`) instead of
> reusing `MATRIX_EXAMPLES`. It still obeys the layering rules: all arithmetic
> lives in `src/math`, scenes/explorers only map math → screen, and guided scenes +
> explorer + lesson share the same example ids. The lesson's matrix `exampleId` is
> left **undefined** (it is optional in `LessonDefinition`).

---

## Gate prerequisite

- Insight Contract: [`docs/insights/karatsuba.md`](../insights/karatsuba.md)
- [x] `Gate result: PASS` confirmed

## Approved insight (gate)

- **Exact primary insight — verbatim, planning metadata only** (do NOT require this
  wording in learner-facing prose):

  > Ordinary split multiplication computes four subrectangles, but the two cross
  > products $AD$ and $BC$ are required only through their sum $AD+BC$ because they
  > occupy the same place-value level. Computing the separate auxiliary coefficient
  > rectangle $(A+B)(C+D)$ and subtracting the two known subrectangles $AC$ and $BD$
  > recovers that sum, so three products — $AC$, $BD$, and $(A+B)(C+D)$ — reconstruct
  > $100\,AC + 10(AD+BC) + BD$. Doing this recursively replaces four half-size
  > products with three and changes the exponent from $\log_2 4$ to $\log_2 3$.

- **Learner-facing phrasing (optimized for clarity):**

  > FOIL splits the product into four pieces, but the two middle pieces sit on the
  > same place-value column, so the answer only needs their **sum**. One extra
  > multiplication, $(A+B)(C+D)$, hands you that sum after subtracting the two you
  > already know. Three multiplications instead of four — repeated all the way
  > down — turn an $n^2$ cost into about $n^{1.585}$.

---

## Lesson title

**Karatsuba: three multiplications instead of four**
Subtitle: *Why two of FOIL's four pieces are only ever needed as one sum, and how
that single saving bends the cost curve.*

## Route / ids

- Route: `/lesson/karatsuba` (auto-wired by `routes.tsx`; lesson `id` is the URL
  segment — no `routes.tsx` edit needed).
- `id`: `"karatsuba"`
- `guidedSceneId`: `"karatsuba-cross-terms"`
- `explorationId`: `"karatsuba-cross-terms"`
- `exampleId`: *(omitted — not a matrix example)*

## Curriculum placement

- Registry order (`src/lessons/registry.ts`): append **after** `eigenvectorsLesson`
  (it is a standalone algorithms topic, so it sits at the end of the current line).
- TOC (`src/lessons/curriculum.ts`): insert a new **active** section
  `{ id: "algorithms", title: "Algorithms & complexity", items: [{ kind: "lesson", lessonId: "karatsuba" }] }`
  **before** the `later` ("Later topics") placeholder section — not after the
  future placeholders, so the shipped lesson appears above the coming-soon items.

## Prerequisites and target learner

- **Target learner:** a numerate reader comfortable with base-10 place value and
  expanding $(a+b)(c+d)$ by FOIL. No prior algorithms background required.
- **Prerequisites:** FOIL / distributive law; decimal place value; for the cost
  section only, an intuitive recursion tree (built in-lesson, not assumed).
- **Explicitly not required:** polynomials, big-O formalism, tensor rank — these
  appear only in optional depth layers.

---

## Motivating question

> $12 \times 13$ splits into four little products the way FOIL expands
> $(10+2)(10+3)$. Two of those four are secretly doing the *same* job. Which two —
> and can we get away with three multiplications instead of four?

Rendered by `MotivatingQuestion` from `motivatingQuestion`. Uses the **same**
`karatsuba-clean` example as the guided scene, explorer, and worked example, for
motivation→watch→explore continuity.

## Learning objectives (`learningObjectives`, KaTeX where useful)

- [ ] Expand $(10A+B)(10C+D)$ into its four weighted pieces $100\,AC,\,10\,AD,\,10\,BC,\,BD$.
- [ ] Explain why $AD$ and $BC$ are needed only through the sum $AD+BC$.
- [ ] Recover $AD+BC$ as $(A+B)(C+D)-AC-BD$ using one extra multiplication.
- [ ] Reassemble the exact product as $100\,z_2+10\,z_1+z_0$.
- [ ] Distinguish output carrying (normalizing the $z_i$) from operand-width growth
      in $(A+B)(C+D)$.
- [ ] Predict that three-way recursion changes the exponent from $\log_2 4$ to
      $\log_2 3$.

---

## Shared examples (exact numbers)

Defined once in `src/lessons/karatsubaData.ts`; referenced by the guided scene, the
explorer, exercises, and tests. All use base $10$, split point $m=1$ (block size =
one digit), so overflow is visible at small scale.

| Id | $x$ | $y$ | $A,B,C,D$ | $AC,AD,BC,BD$ | $(A+B)(C+D)$ | $z_2,z_1,z_0$ | product | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `karatsuba-clean` | 12 | 13 | 1,2,1,3 | 1,3,2,6 | $3\times4=12$ | 1,5,6 | 156 | **Clean:** every $z_i$ is one digit; $A+B=3$, $C+D=4$ stay one digit. No carrying, no width growth. Primary teaching example. |
| `karatsuba-boundary` | 78 | 56 | 7,8,5,6 | 35,42,40,48 | $15\times11=165$ | 35,82,48 | 4368 | **Boundary:** all three $z_i$ overflow one digit → **output carrying**. $A+B=15$ has two digits → the sum-product $(A+B)(C+D)=15\times11$ has **wider operands** (handled by padding, *not* carrying, *not* a fourth multiply). Exercises both distinctions in one example. |
| `karatsuba-recursive` | 1234 | 5678 | split $a,b,c,d = 12,34,56,78$ ($m=2$) | — | — | — | 7 006 652 | **Recursive (tree panel only):** $ac=12\times56$ and $bd=34\times78$ are 2-digit subproblems, **but the sum-product $(a+b)(c+d)=46\times134$ is wider** — one operand has three digits (the very operand-width-growth this lesson teaches). The branch-three tree models the **asymptotic** structure; it is **not** the literal, perfectly balanced call tree of this numeric example. Used only inside the recursion-tree panel as an "example trace," never in the digit controls. |

Sanity checks (must hold in tests): $12\times13=156$, $78\times56=4368$,
$1234\times5678=7\,006\,652$, and for the boundary case
$z_1=165-35-48=82=42+40=AD+BC$.

---

## Supporting concepts (optional)

- **Recursion tree / branching factor** — introduced only in the cost section to
  turn "one saved multiply" into an exponent change (contract §4 recursive
  consequence; brief C5).
- **Product-as-quadratic** — deeper depth layer only (brief C2).

---

## Guided-scene outline (Watch) — `karatsuba-cross-terms`

Read-only Motion Canvas 2D scene. One idea per major step. The **two rectangles are
drawn as visibly distinct objects** and never both called "the rectangle":

- **Weighted multiplication rectangle** — dimensions $10A+B$ by $10C+D$ (drawn to
  decimal scale, e.g. 12 × 13), whose four subrectangles carry weights
  $100,10,10,1$.
- **Auxiliary coefficient rectangle** — a *second, separately positioned* rectangle
  of dimensions $A+B$ by $C+D$ (e.g. 3 × 4), whose four subrectangles are
  *unweighted* $AC,AD,BC,BD$.

`size`: `{ width: 960, height: 600 }`. `ariaLabel`: "Karatsuba: reducing four
multiplications to three via place-value rectangles."

At paused `t=0` the establishing frame shows the weighted rectangle outline for
`12 × 13`, axes/origin, and a caption — never a blank canvas (per lesson-design
rule).

| Step id | Name (learner-facing) | Idea revealed | Notation synced |
| --- | --- | --- | --- |
| `setup` | Two numbers, one rectangle | $12\times13$ as a $12$-by-$13$ **weighted multiplication rectangle** | $(10A+B)(10C+D)$ |
| `foil` | Four pieces (FOIL) | Split into subrectangles $AC,AD,BC,BD$ (subrectangles, not squares) | $100AC+10AD+10BC+BD$ |
| `weights` | Place-value weights | Tag pieces with $100,10,10,1$ — **prediction pause** | weights $100,10,10,1$ |
| `share` | The middle collapses | $AD$ and $BC$ share weight $10$ ⇒ only $AD+BC$ matters. Puzzle: 4 pieces, 3 levels | $100AC+10(AD+BC)+BD$ |
| `aux-rect` | A different rectangle | Introduce the **separate auxiliary coefficient rectangle** $(A+B)(C+D)=3\times4$ | $(A+B)(C+D)=AC+AD+BC+BD$ |
| `subtract` | Peel off the corners | Remove $AC$ and $BD$; the two opposite corners left = $AD+BC$ — **prediction pause** | $z_1=(A+B)(C+D)-AC-BD$ |
| `reassemble` | Rebuild the answer | $100z_2+10z_1+z_0=156$ from three products | $z_2=AC,\ z_0=BD,\ \text{result}=100z_2+10z_1+z_0$ |
| `carry-vs-width` | Two kinds of "too big" | Switch to $78\times56$: $z_i$ overflow ⇒ **output carrying**; $A+B=15$ ⇒ **wider operand** in $(A+B)(C+D)$, handled by padding, not a 4th product | $z_2B^{2m}+z_1B^m+z_0$ then carry |
| `branch` | Four calls or three? | Side-by-side **conceptual recurrence trees**: branch 4 vs branch 3 — **prediction pause** | $T(n)=4T(n/2)$ vs $3T(n/2)+\Theta(n)$ |
| `exponent` | The exponent bends | Leaf counts $n^{\log_2 4}=n^2$ vs $n^{\log_2 3}\approx n^{1.585}$ | $\log_2 4 \to \log_2 3$ |

- **No `deeper` beat.** The polynomial/parabola connection is **not** a segment of
  the primary timeline (autoplay would otherwise always show it). It lives only in
  the optional depth layer, the advanced explorer toggle, and optional Exercise 7,
  so the elementary causal chain stays intact and the deeper material is genuinely
  optional.
- **`majorSteps`** (Prev/Next idea): `["foil","share","aux-rect","subtract","reassemble","carry-vs-width","branch","exponent"]`. `setup` stays in `steps` but out of major nav.
- **Pauses / dimming plan:** dim inactive subrectangles when a weight is discussed; when the auxiliary rectangle enters, translate/scale it to a clearly separate canvas region and label both rectangles with persistent titles so they are never confused.
- **Honest labelling of any interpolation:** the peel animation must show the *actual* remaining area equals $AD+BC$ — the two opposite-corner subrectangles, not an L-shape; the recursion-tree leaf counts must match `leafCount()` from `src/math/karatsuba.ts` exactly.

### Learner prompts and prediction pauses (verbatim)

1. At `weights`: *"Two of these four pieces will end up on the same place-value column. Which two?"* (Answer surfaced in `share`: $AD$ and $BC$, both weight $10$.)
2. At `subtract`: *"If we shade the whole $(A+B)(C+D)$ rectangle and remove the $AC$ and $BD$ corners, what's left?"* (Answer: exactly $AD+BC$.)
3. At `branch`: *"Each multiplication of an $n$-digit number now spawns how many half-size multiplications — and does saving one of four feel like it should matter?"* (Answer surfaced in `exponent`: three, and it changes the exponent, not just a constant.)

---

## Checkpoint (Check understanding)

- **Prompt:** "In $100\,AC + 10\,AD + 10\,BC + BD$, the pieces $AD$ and $BC$ both sit on the tens column. What single quantity does the final answer actually need from them, and why doesn't the split between $AD$ and $BC$ matter?"
- **Type:** interpretation / prediction (`LessonCheckpoint`).
- **Reveal / answer:** "Only the **sum** $AD+BC$. Because both share the weight $10$, the result is $10(AD+BC)$ — moving value from $AD$ to $BC$ leaves $AD+BC$, hence the product, unchanged. So we never need the two separately, only their sum, which one extra multiplication supplies."

---

## Interactive controls (Explore) — `karatsuba-cross-terms`

Initialized from `karatsuba-clean` (12 × 13). Rendered inside `ExplorationPanel`;
the two rectangles drawn with Mafs primitives inside `MafsSceneShell`; the
recursion tree drawn by a small dedicated SVG subcomponent.

- **Dynamic normalization (required).** As the digits range over $10\times10$ to
  $99\times99$, the weighted multiplication rectangle ($10A+B$ by $10C+D$) and the
  much smaller auxiliary coefficient rectangle ($A+B$ by $C+D$, at most $18\times18$)
  cannot share one fixed literal pixel scale without making one view unreadable.
  Give **each labeled rectangle its own normalized frame / side-by-side viewport**
  (independently fit to its own dimensions, each with a visible scale/dimension
  label), rather than drawing both at a single shared scale.

- **Primary controls (shown first):**
  - Digit steppers / sliders for $A,B,C,D$ (each $0$–$9$), i.e. the digits of
    two two-digit numbers $x=10A+B$, $y=10C+D$. Clamp to integers $0$–$9$.
  - `PresetPicker` with **only** the two arithmetic presets that the digit controls
    can represent: `karatsuba-clean` (12 × 13) and `karatsuba-boundary` (78 × 56).
    `karatsuba-recursive` is **not** in this picker — its digits $12,34,56,78$
    cannot be entered as single digits. (Do **not** build a block-mode UI for the
    first implementation.)
  - `ResetButton` → back to `karatsuba-clean`.
- **Primary readouts (`SceneReadout`, KaTeX):**
  - The four subrectangle areas and their weights: $100AC,\,10AD,\,10BC,\,BD$.
  - $(A+B)(C+D)$ and the subtraction $-AC-BD$.
  - $z_2=AC$, $z_1=AD+BC$, $z_0=BD$.
  - Reconstruction $100z_2+10z_1+z_0$ **before** carrying, then the step-by-step
    **carry sequence** from `normalizeCoefficients` (boundary example:
    $(35,82,48)\to(35,86,8)\to(43,6,8)$), then the final product highlighted. The
    readout must render the actual `CarryStep[]`, not jump straight to 4368.
  - **Multiplication count:** `3` (Karatsuba) vs `4` (naive), always visible.
  - **Two badges:** "coefficient overflow → carrying" (lit when any $z_i \ge 10$)
    and "operand width +1 → padding" (lit when $A+B \ge 10$ or $C+D \ge 10$).
    These are separate indicators and must never be conflated in copy.
- **Progressive-disclosure controls (toggles, `ExplorationToggles`, hidden by default):**
  - "Show place-value weights" (on by default).
  - "Show the auxiliary coefficient rectangle" (renders the second rectangle + peel).
  - "Show recursion tree & cost" (renders branch-4 vs branch-3 **conceptual
    recurrence trees**, leaf counts, and a log–log cost curve). This panel has its
    **own** controls for $n$ (digit count, powers of two) and depth — it is
    decoupled from the $A,B,C,D$ digit inputs. It may optionally display the
    `karatsuba-recursive` (1234 × 5678) case as a labeled **"example trace"**,
    explicitly annotated that the sum-product $46\times134$ is wider so the drawn
    tree is a conceptual model, not the literal balanced call tree.
  - "Show the parabola view" *(expert)* — the product-as-quadratic plot.
- **Clamp ranges:** digits $0$–$9$; recursion-depth/$n$ slider limited to powers of
  two up to $n=16$ to keep leaf counts legible.
- **Reset behavior:** all toggles to defaults, inputs to 12 × 13.

---

## Exercises (Practice) — reconstruction, complexity, transfer, carry-vs-width

`ExerciseDefinition` types used: `numeric`, `multiple-choice`, `prediction`.

| # | Objective | Type | Deterministic answer | Feedback (why) |
| --- | --- | --- | --- | --- |
| 1 | **Reconstruction:** for $34\times21$, compute the middle coefficient $z_1$ by subtraction. $A,B,C,D=3,4,2,1$; $AC=6,BD=4$, $(A+B)(C+D)=7\times3=21$. | `numeric` | `11` ($z_1=21-6-4=11=AD+BC=3+8$) | Reinforces "recover the sum by subtracting the two known corners," not by computing $AD$ and $BC$ separately. |
| 2 | **Reconstruction (full):** finish exercise 1 to the full product with carrying. $z_2=6,z_1=11,z_0=4 \Rightarrow 600+110+4$. | `numeric` | `714` | Shows $z_1=11$ overflows the tens column, so **output carrying** produces the final digits ($34\times21=714$). |
| 3 | **Complexity:** replacing four half-size multiplications with three changes the exponent from $\log_2 4=2$ to which value? | `multiple-choice` | `log₂ 3 ≈ 1.585` (distractors: `1.75`, `0.75` (a 25% saving), `2` unchanged) | The saving is an **exponent** change because it recurs, not a constant 25% (brief C5). |
| 4 | **Transfer:** Strassen multiplies two $2\times2$ blocks with **7** multiplications instead of 8, recursively. Its exponent is? | `multiple-choice` | `log₂ 7 ≈ 2.807` (distractors: `log₂ 8 = 3`, `log₂ 3`, `2`) | Same move as Karatsuba — cut one recursive multiply, the branching factor sets the exponent (contract §10 transfer). |
| 5 | **Carry vs wider operands:** In $78\times56$, $A+B=15$ has two digits. What does this mean for the algorithm? | `multiple-choice` | "The recursive product $(A+B)(C+D)$ is slightly **wider** and is handled by padding / uneven widths — it is **not** a fourth multiplication and **not** fixed by output carrying." (distractors: "it adds a fourth multiplication"; "output carrying fixes it"; "the algorithm breaks") | Directly separates operand-width growth from output carrying (correction item 1). |
| 6 | **Carry vs wider operands (mirror):** In $78\times56$, the coefficients $z_2=35,\,z_1=82,\,z_0=48$ each exceed one digit. This is resolved by ___. | `multiple-choice` | "a final **output-carrying** pass that normalizes $z_2B^{2m}+z_1B^m+z_0$ into digits" (distractors: "padding the operands"; "a fourth multiplication"; "doing it in a bigger base") | The complement of #5: overflow of the *output* coefficients is carrying, a separate additive step. |
| 7 | **Prediction (deeper, optional):** treating $x=at+b$, $y=ct+d$, the product is a quadratic in $t$. How many suitable evaluations pin it down? | `prediction` | reveal: "Three — a quadratic has three coefficients, so three suitable point-values determine it; Karatsuba's three products are three such evaluations. (Three coefficients alone don't force three multiplications — the construction does.)" | Opens the deeper connection without overclaiming (brief C2 caveat). |

Add `hints` and, where useful, `solutionReveal.prose` on exercises 1–2 and 5–6.

---

## Misconception handling (`callouts`)

| id | belief | confront | resolve |
| --- | --- | --- | --- |
| `all-four-needed` | "You must compute all four products." | "The answer only ever uses $AD$ and $BC$ as the sum $AD+BC$." | "So one product $(A+B)(C+D)$ minus the two known corners recovers exactly what's needed — three products total." |
| `twenty-five-percent` | "Saving one of four is a 25% speedup." | "Measured cost is $n^{1.585}$ vs $n^2$, far more than 25%." | "Because the saving recurs, the recursion tree has branching factor 3, so it's an exponent change, not a constant." |
| `wider-is-carrying` | "The extra digit in $A+B$ is fixed by carrying / adds a fourth multiply." | "$A+B$ being wider affects the *operands* of $(A+B)(C+D)$, not the output digits." | "Operand width is absorbed by padding / uneven widths (recurrence $T(n)\le 3T(\lceil n/2\rceil+1)+O(n)$). Output carrying is the separate step that normalizes the $z_i$. Neither adds a multiplication." |
| `corner-squares` | "$AC$ and $BD$ are corner squares." | "Their side lengths differ in general ($A\neq C$)." | "They're subrectangles; call them that." |
| `three-coeffs-force-three` | "Three coefficients force exactly three multiplications." | "Three coefficients mean three *evaluations* determine the quadratic." | "Sufficiency comes from the explicit construction; that three is also a lower bound is the separate rank result (expert layer)." |

Render via `MisconceptionCallout`. `wider-is-carrying` is the callout that carries
correction item 1 into the learner-facing lesson.

## Progressive-disclosure depth layers

- **Deeper** (`DepthLayer` kind `connection` / `looking-ahead`): *"The three products are three evaluations of a quadratic."* Treat each number as a linear polynomial $x(t)=at+b$; the product is a quadratic determined by three suitable evaluations ($t=0,1,\infty$). This opens Toom-Cook and the **evaluate → pointwise multiply → interpolate** architecture shared with FFT multiplication (which gains its speed from roots of unity + recursive FFT, *not* from literally taking the split count to $n$). Explicitly labeled **optional deeper connection, not the prerequisite explanation.**
- **Expert** (`DepthLayer` kind `math-note`): *"Why not two?"* Multiplying two linear polynomials is a bilinear map whose structure tensor has rank exactly 3; Karatsuba realizes that rank. That two is impossible is an **accepted advanced result** in algebraic complexity — stated, not proved here. Same move as Strassen ($8\to7$). Kept out of the elementary chain.

---

## Pure math helpers and data structures required

### New module: `src/math/karatsuba.ts`

Pure, no React/DOM/Mafs. Uses plain integers for the lesson's small numbers; note
`bigint` as a future extension in a comment (not required for the lesson scale).

```ts
export interface DigitSplit {
  readonly value: number;
  readonly base: number;   // e.g. 10
  readonly m: number;      // split point (block size in digits)
  readonly high: number;   // a  (value = high * base**m + low)
  readonly low: number;    // b
}

export interface FoilRegions {
  readonly ac: number;
  readonly ad: number;
  readonly bc: number;
  readonly bd: number;
}

export interface KaratsubaStep {
  readonly x: number;
  readonly y: number;
  readonly base: number;
  readonly m: number;
  readonly a: number; readonly b: number; readonly c: number; readonly d: number;
  readonly regions: FoilRegions;             // ac, ad, bc, bd (unweighted)
  readonly sumProduct: number;               // (a+b)(c+d)
  readonly z2: number;                        // ac
  readonly z1: number;                        // sumProduct - z2 - z0 = ad+bc
  readonly z0: number;                        // bd
  readonly preCarryTerms: readonly [number, number, number]; // [z2, z1, z0]
  readonly product: number;                   // z2*base**(2m) + z1*base**m + z0
  readonly multiplications: 3;                // Karatsuba count at this level
  readonly coefficientOverflow: boolean;      // some z_i >= base**m  -> output carrying
  readonly operandWidthGrowth: boolean;       // (a+b) or (c+d) >= base**m -> padding
  readonly normalized: NormalizedCoefficients; // learner-visible carrying sequence
}

// --- Output carrying (separate, additive normalization step) ---
export interface CarryStep {
  readonly level: number;       // block index, 0 = least significant
  readonly valueBefore: number; // block value before this carry (e.g. 48, then 86)
  readonly digitAfter: number;  // block value kept at this level after carry
  readonly carryOut: number;    // amount carried into the next level
}

export interface NormalizedCoefficients {
  readonly blocks: readonly number[]; // final per-block values, least significant first
  readonly steps: readonly CarryStep[];
}

/**
 * Normalizes reconstructed coefficients into blocks, recording each carry so the
 * explorer/scene can show the process instead of jumping to the final integer.
 * Boundary example (blockBase = 10): (35,82,48) -> (35,86,8) -> (43,6,8).
 */
export function normalizeCoefficients(
  z2: number, z1: number, z0: number, blockBase: number,
): NormalizedCoefficients;

export function splitDecimal(value: number, m: number, base?: number): DigitSplit;
export function foilRegions(a: number, b: number, c: number, d: number): FoilRegions;
export function middleCoefficient(a: number, b: number, c: number, d: number): number; // (a+b)(c+d)-ac-bd
export function karatsubaStep(x: number, y: number, m: number, base?: number): KaratsubaStep;
export function karatsubaMultiply(x: number, y: number, base?: number): number; // full recursive result (see contract below)
export function naiveMultiply(x: number, y: number): number;                    // schoolbook reference

// Complexity helpers
export function leafCount(branch: number, levels: number): number;             // branch ** levels
export function multiplicationCount(n: number, branch: 3 | 4): number;         // for n a power of 2
export const KARATSUBA_EXPONENT: number;                                       // Math.log2(3)
export function recursionTree(branch: 3 | 4, depth: number): TreeNode;         // for the diagram
```

### Algorithm contract for `karatsubaMultiply` (fixed — do not re-decide)

- **Input domain:** nonnegative **safe** integers only (`Number.isSafeInteger`).
- **Base:** integer `base >= 2`; the production lesson uses `base = 10`.
- **Base case:** if `x < base || y < base`, return `x * y`.
- **Width `n`:** the maximum base-`base` digit length of `x` and `y`.
- **Split point `m`:** `m = Math.floor(n / 2)`. `power = base ** m`.
- **Split (odd widths handled by this floor rule, low block is `power`-wide):**
  `a = Math.floor(x / power)`, `b = x % power`; `c = Math.floor(y / power)`,
  `d = y % power`.
- **Recursion:** compute `ac`, `bd`, and `(a+b)(c+d)` by recursive
  `karatsubaMultiply`. **Each recursive call recomputes its own width `n`**,
  including the wider sum-product `(a+b)(c+d)` (this is exactly the
  operand-width-growth case — no special fourth branch).
- **Recombine:** `ac * base**(2m) + ((a+b)(c+d) - ac - bd) * base**m + bd`.
- **Zero:** valid input; returns `0` via the base case / arithmetic.
- **Errors:** negative or non-safe-integer inputs throw `RangeError`.
- **Scope note:** this POC uses `number`; `bigint` is a future extension and out of
  scope for the first implementation.

### New invariants (add to `src/math/invariants.ts` or co-locate in `karatsuba.ts`)

- `assertMiddleCoefficientIdentity(a,b,c,d)` — `(a+b)(c+d)-a*c-b*d === a*d+b*c`.
- `assertRecombinationEqualsProduct(x,y)` — `karatsubaStep(...).product === x*y`.
- `assertThreeProductsMatchNaive(x,y)` — `karatsubaMultiply(x,y) === naiveMultiply(x,y)`.
- `assertBranchLeafCount(n)` — `leafCount(3, log2 n) === n ** Math.log2(3)` (within float tolerance) and `leafCount(4, log2 n) === n*n`.

### New shared examples: `src/lessons/karatsubaData.ts`

```ts
export interface KaratsubaExample {
  readonly id: string;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly m: number;
}
export const KARATSUBA_CLEAN: KaratsubaExample;      // 12 x 13
export const KARATSUBA_BOUNDARY: KaratsubaExample;   // 78 x 56
export const KARATSUBA_RECURSIVE: KaratsubaExample;  // 1234 x 5678
export const KARATSUBA_PRESETS: readonly KaratsubaExample[];
export function requireKaratsubaExample(id: string): KaratsubaExample;
```

### Export wiring

- Re-export the karatsuba helpers/types from `src/math/index.ts`.

---

## File-by-file implementation work

**Pure math**
1. `src/math/karatsuba.ts` — new module (types + functions + invariants above).
2. `src/math/index.ts` — re-export karatsuba symbols.
3. `src/math/__tests__/karatsuba.test.ts` — new unit + invariant tests.

**Shared data**
4. `src/lessons/karatsubaData.ts` — new example module (three presets + accessor).

**Lesson data**
5. `src/lessons/karatsuba.ts` — new `karatsubaLesson: LessonDefinition` (title,
   subtitle, objectives, `motivatingQuestion`, `sections`, `guidedSceneId`,
   `explorationId`, `checkpoint`, `workedExamples`, `callouts`, `exercises`,
   `keyTakeaway`; omit matrix `exampleId`). Worked example holds the equation
   sequence for 12 × 13 and depth layers; a second worked example holds the 78 × 56
   carry/width walkthrough.
6. `src/lessons/registry.ts` — import and append `karatsubaLesson` to `lessons`.
7. `src/lessons/curriculum.ts` — insert the "Algorithms & complexity" section
   **before** the `later` ("Later topics") section.

**Guided scene** (5-file registration)
8. `src/guided-scenes/scenes/sceneTimings.ts` — add `KARATSUBA_SEGMENTS: SceneSegment[]` (ten ids/durations from the beat table, `setup`…`exponent`, no `deeper`; total ~58s).
9. `src/guided-scenes/scenes/sceneMeta.ts` — add `SCENE_META["karatsuba-cross-terms"]` with `size`, `ariaLabel`, `steps` (from segments), `majorSteps` via `pickMajor(...)`.
10. `src/guided-scenes/scenes/karatsubaCrossTermsScene.ts` — new `makeScene2D` module; import numbers from `../../lessons/karatsubaData` and math from `../../math`; reuse `sceneKit`/`safeFrame`; establishing frame at `t=0`.
11. `src/guided-scenes/scenes/sceneDescriptions.ts` — add loader entry mapping `"karatsuba-cross-terms"` → the new scene module.

**Explorer**
12. `src/explorations/KaratsubaExplorer.tsx` — new component; state for $A,B,C,D$ + toggles; math via `karatsubaStep` (and `normalizeCoefficients` for the carry readout); arithmetic presets `karatsuba-clean` and `karatsuba-boundary` only (not the recursive one); render the two labeled rectangles in **independently normalized side-by-side frames** in `MafsSceneShell`, readouts in `SceneReadout`, toggles in `ExplorationToggles`, wrapped in `ExplorationPanel`.
13. `src/explorations/KaratsubaTreeDiagram.tsx` — small SVG subcomponent for the branch-4 vs branch-3 **conceptual recurrence trees** + leaf-count / log–log cost readout (driven by `recursionTree` / `leafCount`), with its own `n`/depth controls independent of the digit inputs. Title it "conceptual recurrence tree"; if the optional 1234 × 5678 example trace is shown, label it as a model (sum-product $46\times134$ is wider), not an exact trace.
14. `src/explorations/registry.tsx` — add lazy entry for `"karatsuba-cross-terms"`.

**Styles**
15. `src/explorations/KaratsubaExplorer.css`, `src/explorations/KaratsubaTreeDiagram.css` — scoped styles using `--role-*` tokens (no raw colors).

---

## Unit, component, invariant, and browser tests

**Unit + invariant** — `src/math/__tests__/karatsuba.test.ts`
- `middleCoefficient` identity holds across a grid of $(a,b,c,d)$ including
  asymmetric digits and a case where $a+b\ge 10$.
- `karatsubaStep` matches the shared-example table exactly (clean, boundary,
  recursive): regions, `sumProduct`, $z_2/z_1/z_0$, `product`.
- `karatsubaMultiply === naiveMultiply` over many random pairs (property-style),
  including multi-digit and **odd-width** inputs (e.g. `123 × 45`) and the recursive
  case `1234 × 5678 === 7 006 652`.
- Algorithm contract: `karatsubaMultiply` throws `RangeError` on negative or
  non-safe-integer inputs; returns `0` when either operand is `0`; hits the base
  case for single-"digit" (`< base`) operands.
- `normalizeCoefficients(35, 82, 48, 10)` yields the sequence
  $(35,82,48)\to(35,86,8)\to(43,6,8)$ (blocks least-significant-first `[8, 6, 43]`,
  three recorded `CarryStep`s); the clean example `(1,5,6)` records **no** carries.
- Boundary example: `coefficientOverflow === true` and `operandWidthGrowth === true`;
  clean example: both `false`.
- `leafCount(3, k) === 3**k`, `multiplicationCount(n,4) === n*n` for powers of two,
  and `assertBranchLeafCount` passes.

**Wiring** — extend `src/lessons/__tests__/lessonWiring.test.ts`
- `karatsubaLesson.guidedSceneId` resolves (`hasGuidedScene`) and
  `explorationId` resolves (`hasExplorer`); `karatsubaData` ids resolve.

**Scene meta/timings** — extend the existing scene tests
- `sceneTimings` / `sceneMeta` / `sceneDescriptions` tests include
  `"karatsuba-cross-terms"`; `majorSteps ⊆ steps`; loader present; `unknownSceneIds`
  test still passes.

**Component** — `src/explorations/__tests__/KaratsubaExplorer.test.tsx`
- Renders with the clean preset; readouts show $z_2=1,z_1=5,z_0=6$ and product 156.
- Selecting the boundary preset lights **both** the carrying badge and the
  width badge, and shows product 4368.
- Multiplication-count readout shows `3` vs `4`.
- Reset restores 12 × 13 and default toggles.
- (Optional) `src/explorations/__tests__/KaratsubaTreeDiagram.test.tsx` — leaf
  counts render for branch 3 vs 4 at a given depth.

**Browser (e2e)** — `e2e/lesson-karatsuba.spec.ts`
- Navigate to `/lesson/karatsuba`; assert header/subtitle and the six phase
  regions render; no console errors.
- Guided player: step through `majorSteps` with "Next idea"; assert the
  `aux-rect` and `carry-vs-width` beats are reachable/visible.
- Explorer: switch to the boundary preset; assert the final product `4368` and both
  badges are visible; toggle "Show recursion tree" and assert branch-3 leaf count.
- Checkpoint reveal and at least exercises 3 and 5 grade correctly.

Run: `npm run lint`, `npm run test`, `npm run test:e2e`.

---

## Insight traceability (required)

Every obligation in [`docs/insights/karatsuba.md`](../insights/karatsuba.md) §4 (the
approved causal chain) is mapped to a learner-facing location and observable
evidence. Linking the contract is **not** sufficient on its own.

| Contract obligation | Learner-facing location | Evidence of understanding |
| --- | --- | --- |
| Four FOIL subrectangles (naive products) | Watch `foil`; Explore (four regions shown) | Learner identifies four regions $AC,AD,BC,BD$ and that the naive count is 4 (explorer count readout). |
| Place-value weights $100,10,10,1$ | Watch `weights` (+ prediction pause); Explore weights toggle | Learner predicts which two pieces share a weight before the reveal. |
| Shared weight ⇒ only $AD+BC$ needed | Watch `share`; **Checkpoint** | Learner states the answer needs only the sum $AD+BC$ and why the split is irrelevant. |
| Auxiliary coefficient rectangle (separate object) | Watch `aux-rect`; Explore aux-rectangle toggle | Learner distinguishes the $(A+B)\times(C+D)$ rectangle from the weighted one; predicts the peel result. |
| Recover the sum by subtraction | Watch `subtract` (prediction pause); Exercise 1 | Learner computes $z_1=(A+B)(C+D)-AC-BD$ (numeric answer 11 for 34×21). |
| Exact reconstruction $100z_2+10z_1+z_0$ | Watch `reassemble`; Explore reconstruction readout; Exercise 2 | Learner assembles the full product (714 for 34×21; 156 for 12×13). |
| Output carrying vs operand-width growth | Watch `carry-vs-width`; `wider-is-carrying` callout; Exercises 5 & 6 | Learner picks "padding, not a fourth multiply" for wider $A+B$, and "output carrying" for overflowing $z_i$. |
| Recursive consequence (branch 3 not 4) | Watch `branch` (prediction pause); Explore tree toggle | Learner predicts three sub-multiplications per level. |
| Exponent $\log_2 4 \to \log_2 3$ | Watch `exponent`; Exercise 3 | Learner selects $\log_2 3\approx1.585$ (not 25%). |
| Transfer (branching factor sets exponent) | Exercise 4; expert depth layer | Learner selects $\log_2 7$ for Strassen. |
| Deeper connection (evaluation/interpolation) — *optional* | Deeper depth layer; advanced explorer toggle ("parabola view"); Exercise 7 (**not** a guided-scene beat) | Learner states three suitable evaluations determine the quadratic, with the sufficiency caveat. |

---

## Acceptance criteria

- [ ] Insight Contract linked and `PASS`; exact insight verbatim in metadata above;
      learner prose preserves meaning + causal chain (does not require the long
      sentence verbatim).
- [ ] Insight-traceability table complete — every §4 obligation mapped to a
      location and observable evidence.
- [ ] Six-phase flow present (Think → Watch → Check → Worked → Explore → Practice →
      Remember) via `LessonLayout`.
- [ ] The two rectangles are **visually and textually distinct** everywhere
      (scene, explorer, prose); neither is called "the rectangle" ambiguously.
- [ ] Output carrying and operand-width growth are handled as **separate** ideas in
      copy, badges, and at least two exercises; no claim that $a+b$ overflow is
      "handled by carrying" or that it adds a fourth multiplication.
- [ ] All arithmetic comes from `src/math/karatsuba.ts`; scene/explorer only map
      math → screen; guided scene + explorer + exercises share `karatsubaData` ids.
- [ ] KaTeX for all learner-facing math; column/place-value notation consistent;
      subrectangles never called "squares."
- [ ] Progressive disclosure: deeper/expert material behind depth layers/toggles.
- [ ] Reduced-motion-aware autoplay; establishing frame at paused `t=0`.
- [ ] `npm run lint`, `npm run test`, `npm run test:e2e` pass.

## Implementation order

1. `src/math/karatsuba.ts` + `src/math/index.ts` export + `karatsuba.test.ts`
   (prove the identity, reconstruction, count, and both overflow flags first).
2. `src/lessons/karatsubaData.ts` (lock the shared numbers) + its assertions.
3. `src/lessons/karatsuba.ts` lesson data; wire into `registry.ts` and
   `curriculum.ts`; extend `lessonWiring.test.ts` (scene/explorer ids will fail
   until steps 4–6, which is the intended red→green order).
4. Guided scene: `sceneTimings` → `sceneMeta` → `karatsubaCrossTermsScene.ts` →
   `sceneDescriptions` loader; extend scene meta/timings tests.
5. Explorer: `KaratsubaExplorer.tsx` (+ `KaratsubaTreeDiagram.tsx`, CSS) and
   `registry.tsx` entry; component tests.
6. `e2e/lesson-karatsuba.spec.ts`; full `lint` + `test` + `test:e2e`; browser
   review screenshots to `screenshots/` and complete
   `docs/LESSON_CORRECTNESS_CHECKLIST.md`.
