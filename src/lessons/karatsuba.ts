import type { LessonDefinition } from "./types";

/**
 * Karatsuba multiplication lesson. Built around the approved insight contract
 * (docs/courses/algorithms/lessons/karatsuba/insight.md). Numbers live in karatsubaData.ts.
 *
 * Restructured (package R2 of feature/experience-architecture) as the
 * historical-breakthrough archetype: the field's O(n²) belief and Karatsuba's
 * break of it are explicit `callout` blocks placed in the argument, not
 * buried in a depth layer; the "three evaluations of a quadratic" deeper
 * connection (already recorded in the insight contract as C2) is a
 * `composed` block with real numbers instead of prose-only; and the lesson
 * ends on the still-open Toom-Cook/FFT question rather than a generic
 * summary. No mathematical content changed — this is a route restructuring,
 * not a new insight (see the docs/courses/algorithms/lessons/karatsuba/
 * insight.md causal chain, which every section below still traces).
 */
export const karatsubaLesson: LessonDefinition = {
  id: "karatsuba",
  title: "Karatsuba: three multiplications instead of four",
  subtitle:
    "Why two of FOIL's four pieces are only ever needed as one sum, and how that single saving bends the cost curve",
  learningObjectives: [
    "Expand $(10A+B)(10C+D)$ into its four weighted pieces $100\\,AC$, $10\\,AD$, $10\\,BC$, $BD$",
    "Explain why $AD$ and $BC$ are needed only through the sum $AD+BC$",
    "Recover $AD+BC$ as $(A+B)(C+D)-AC-BD$ using one extra multiplication",
    "Reassemble the exact product as $100\\,z_2+10\\,z_1+z_0$",
    "Distinguish output carrying (normalizing the $z_i$) from operand-width growth in $(A+B)(C+D)$",
    "Predict that three-way recursion changes the exponent from $\\log_2 4$ to $\\log_2 3$",
  ],
  /**
   * The same six objectives above, with their evidence obligations stated
   * (ADR-004). This is the first lesson to declare `objectives`, so
   * `objectiveCoverage.test.ts` validates a real lesson rather than an empty
   * set.
   *
   * Two are deliberately NOT `lesson-owned`: the four-pieces expansion and
   * the shared-weight argument are exercised only by the checkpoint and the
   * guided scene, neither of which is a graded `ExerciseDefinition`. Marking
   * them `course-owned` records an OPEN obligation — Algorithmic Thinking has
   * no module assessment set yet — rather than quietly claiming evidence the
   * lesson does not produce. Surfacing that gap is the point of the model;
   * the old "at least two exercises" quota hid it.
   */
  objectives: [
    {
      id: "kara-obj-expand",
      text: "Expand $(10A+B)(10C+D)$ into its four weighted pieces",
      evidence: "course-owned",
      evidenceLevel: "E2",
    },
    {
      id: "kara-obj-shared-weight",
      text: "Explain why $AD$ and $BC$ are needed only through the sum $AD+BC$",
      evidence: "course-owned",
      evidenceLevel: "E2",
    },
    {
      id: "kara-obj-recover-middle",
      text: "Recover $AD+BC$ as $(A+B)(C+D)-AC-BD$ using one extra multiplication",
      evidence: "lesson-owned",
      evidenceLevel: "E3",
      itemIds: ["karatsuba-z1"],
    },
    {
      id: "kara-obj-reassemble",
      text: "Reassemble the exact product as $100\\,z_2+10\\,z_1+z_0$",
      evidence: "lesson-owned",
      evidenceLevel: "E3",
      itemIds: ["karatsuba-product-carry"],
    },
    {
      id: "kara-obj-carry-vs-width",
      text: "Distinguish output carrying from operand-width growth in $(A+B)(C+D)$",
      evidence: "lesson-owned",
      evidenceLevel: "E2",
      itemIds: ["karatsuba-width-vs-carry", "karatsuba-output-carry"],
    },
    {
      id: "kara-obj-exponent",
      text: "Predict that three-way recursion changes the exponent from $\\log_2 4$ to $\\log_2 3$",
      evidence: "lesson-owned",
      evidenceLevel: "E2",
      itemIds: ["karatsuba-exponent", "karatsuba-strassen-transfer"],
    },
  ],
  motivatingQuestion:
    "$12 \\times 13$ splits into four little products the way FOIL expands $(10+2)(10+3)$. Two of those four are secretly doing the *same* job. Which two — and can we get away with three multiplications instead of four?",
  // The history is in the argument, not an aside: the O(n²) belief and its
  // break are `callout` blocks at the point where each is actually felt —
  // the belief right after the opening visual raises the stakes (placed
  // after "visual", not directly after "motivate", so the page's first
  // subheading is the visual's own h2, not the callout's h3 — a callout has
  // no heading of its own and must never be the first heading-bearing block);
  // the break right after the weighted rectangle sets up the tension it
  // resolves. The polynomial "deeper connection" (contract item C2) is a
  // placed `composed` lab with real numbers, between the two rectangles and
  // the checkpoint. The lesson ends on the still-open question, not a summary.
  route: [
    { kind: "motivate" },
    { kind: "visual", heading: "Where FOIL's four pieces land" },
    { kind: "callout", calloutId: "o-n-squared-belief" },
    { kind: "section", sectionId: "weighted-rect" },
    { kind: "callout", calloutId: "all-four-needed" },
    { kind: "section", sectionId: "aux-rect" },
    { kind: "check" },
    {
      kind: "composed",
      componentId: "karatsuba-three-evaluations",
      heading: "Three evaluations, one construction",
    },
    { kind: "worked" },
    { kind: "section", sectionId: "carry-vs-width" },
    { kind: "section", sectionId: "exponent" },
    { kind: "explore", tocLabel: "Place-value rectangles and three products" },
    { kind: "practice" },
    { kind: "section", sectionId: "open-question" },
  ],
  sections: [
    {
      id: "weighted-rect",
      title: "The weighted multiplication rectangle",
      body: "Write $12=10\\cdot1+2$ and $13=10\\cdot1+3$. The product $(10A+B)(10C+D)$ is a rectangle of width $12$ and height $13$. FOIL splits it into four subrectangles whose *place-value weights* are $100$, $10$, $10$, and $1$:",
      equation:
        "(10A+B)(10C+D)=100\\,AC+10\\,AD+10\\,BC+BD=100\\,AC+10(AD+BC)+BD",
      observation:
        "The two middle pieces share the same weight $10$, so the answer only needs their sum $AD+BC$ — never the split between them.",
    },
    {
      id: "aux-rect",
      title: "The auxiliary coefficient rectangle",
      body: "A *separate* rectangle of dimensions $A+B$ by $C+D$ has unweighted areas $AC$, $AD$, $BC$, $BD$. Computing that one product and subtracting the two known corners recovers exactly the middle sum:",
      equation: "z_1=(A+B)(C+D)-AC-BD=AD+BC",
      observation:
        "The weighted rectangle tells us *what* combined quantity is needed; the auxiliary coefficient rectangle tells us *how* to compute it with one multiplication.",
      layers: [
        {
          // A "Three evaluations of a quadratic (optional)" layer sat here
          // until 2026-08. It is gone, not lost: the composed
          // `karatsuba-three-evaluations` lab (two route blocks later) teaches
          // the same polynomial-evaluation reading concretely on the running
          // example; the `open-question` section carries the Toom-Cook / FFT
          // architecture in more depth; and the sufficiency-vs-necessity point
          // is now the `three-coeffs-force-three` callout. Restoring it would
          // re-introduce a preview of a lab the learner is about to open.
          kind: "math-note",
          title: "Why not two? (expert)",
          body: "Multiplying two linear polynomials is a bilinear map whose structure tensor has rank exactly 3; Karatsuba realizes that rank. That two is impossible is an accepted advanced result in algebraic complexity — stated here, not proved. The same move appears in Strassen's $8\\to7$ matrix multiplication.",
        },
      ],
    },
    {
      id: "carry-vs-width",
      title: "Carrying vs. wider operands",
      body: "After reassembling $100z_2+10z_1+z_0$, two size effects can appear and must not be confused. *Output carrying* normalizes coefficients $z_i$ that overflow an $m$-digit block. Separately, $A+B$ may have an extra digit, so the recursive product $(A+B)(C+D)$ is slightly wider — handled by padding / uneven widths, **not** by carrying, and **not** a fourth multiplication.",
    },
    {
      id: "exponent",
      title: "Three-way branching bends the exponent",
      body: "Applied recursively, each multiplication spawns three half-size multiplications instead of four. The conceptual recurrence $T(n)=3T(n/2)+\\Theta(n)$ has branching factor 3, so the leaf count is $n^{\\log_2 3}\\approx n^{1.585}$ instead of $n^2$. Saving one of four is an *exponent* change because it recurs — not a constant 25% speedup.",
    },
    {
      id: "open-question",
      title: "Does the trick stop at three?",
      body: "Karatsuba's construction is one instance of a larger pattern: evaluate, multiply the evaluations, interpolate. Toom-Cook generalizes it to $k$-way splits — $2k-1$ products instead of $k^2$, at the cost of a larger interpolation. Carried far enough, the same evaluate-multiply-interpolate architecture, with complex roots of unity standing in for the evaluation points, is the Fast Fourier Transform — the route Schönhage and Strassen took in 1971 to reach $O(n\\log n\\log\\log n)$, and Harvey and van der Hoeven took in 2019 to reach the conjectured-optimal $O(n\\log n)$. None of that is built here: this lesson has shown that three multiplications *suffice*, not that they are the fewest *possible* — that is the separate rank question the expert layer above only states. The bridge from \"three products for one split\" to \"a transform for every frequency\" is real, and it is where this story picks back up.",
    },
  ],
  guidedSceneId: "karatsuba-cross-terms",
  explorationId: "karatsuba-cross-terms",
  checkpoint: {
    prompt:
      "In $100\\,AC + 10\\,AD + 10\\,BC + BD$, the pieces $AD$ and $BC$ both sit on the tens column. What single quantity does the final answer actually need from them, and why doesn't the split between $AD$ and $BC$ matter?",
    answer:
      "Only the **sum** $AD+BC$. Because both share the weight $10$, the result is $10(AD+BC)$ — moving value from $AD$ to $BC$ leaves $AD+BC$, hence the product, unchanged. So we never need the two separately, only their sum, which one extra multiplication supplies.",
  },
  workedExamples: [
    {
      id: "karatsuba-clean-walkthrough",
      title: "Reconstruct $12 \\times 13$ with three products",
      prompt:
        "Clean coefficients — no carrying, no width growth. Follow the three products to the exact answer.",
      equations: [
        "12=10\\cdot1+2,\\quad 13=10\\cdot1+3",
        "(10A+B)(10C+D)=100\\,AC+10\\,AD+10\\,BC+BD",
        "AC=1,\\quad BD=6,\\quad (A+B)(C+D)=3\\cdot4=12",
        "z_2=AC=1,\\quad z_0=BD=6,\\quad z_1=12-1-6=5=AD+BC",
        "100z_2+10z_1+z_0=100+50+6=156",
      ],
      equationsAriaLabel: "Karatsuba reconstruction of 12 times 13",
      layers: [
        {
          kind: "trap",
          title: "Don't call AC and BD squares",
          body: "Their side lengths differ in general. They are subrectangles.",
        },
      ],
    },
    {
      id: "karatsuba-boundary-walkthrough",
      title: "Carry and wider operands: $78 \\times 56$",
      prompt:
        "Same algebra, but now both size effects appear. Watch carrying and width growth stay separate.",
      equations: [
        "78=10\\cdot7+8,\\quad 56=10\\cdot5+6",
        "AC=35,\\quad BD=48,\\quad (A+B)(C+D)=15\\cdot11=165",
        "z_2=35,\\quad z_0=48,\\quad z_1=165-35-48=82",
        "100\\cdot35+10\\cdot82+48=3500+820+48=4368",
        "(35,82,48)\\xrightarrow{\\text{carry}}(35,86,8)\\xrightarrow{\\text{carry}}(43,6,8)",
        "A+B=15\\text{ is wider: }15\\times11\\text{ uses padding, not a 4th multiply}",
      ],
      equationsAriaLabel: "Boundary Karatsuba walkthrough with carrying",
    },
  ],
  callouts: [
    {
      id: "o-n-squared-belief",
      title: "For decades, $\\Theta(n^2)$ seemed unavoidable",
      // A research consensus with Kolmogorov's conjectured lower bound behind
      // it — three beats, and each says what it is without being announced.
      moves: [
        {
          body: "Every known method for multiplying two $n$-digit numbers used $\\Theta(n^2)$ single-digit products. Splitting the numbers and combining four sub-products, the way FOIL does, seemed to be the only structure available.",
        },
        {
          body: "In 1960, Anatoly Karatsuba — then a student attending Andrey Kolmogorov's seminar on computational complexity, where $\\Omega(n^2)$ was conjectured to be a hard lower bound — found that two of those four products are redundant.",
        },
        {
          body: "Three products, not four, suffice. Because the saving recurs at every level of the recursion, it does not just save a constant fraction: it changes the exponent itself, from $2$ to $\\log_2 3\\approx1.585$.",
        },
      ],
      attribution: {
        who: "Anatoly Karatsuba",
        when: "1960",
        source: "Karatsuba & Ofman, 1962",
      },
    },
    {
      id: "all-four-needed",
      title: "Not all four products are needed",
      // A genuine prediction, refuted, then repaired — the three-beat shape is
      // right here. The beats carry their own turns ("It looks as though…",
      // "But…", "So…"), so nothing needs announcing.
      moves: [
        { body: "It looks as though all four FOIL products have to be computed." },
        { body: "But the answer only ever uses $AD$ and $BC$ through their sum $AD+BC$." },
        {
          body: "So one product $(A+B)(C+D)$, minus the two corners already known, recovers exactly that sum — three products in total.",
        },
      ],
    },
    {
      id: "twenty-five-percent",
      title: "Not a 25% speedup",
      // An estimate, a measurement that disagrees, and the mechanism behind
      // the gap — each stated rather than announced.
      moves: [
        { body: "Saving one product out of four looks like a 25% speedup." },
        {
          body: "Measured, the cost is $n^{1.585}$ against $n^2$ — far more than 25%.",
        },
        {
          body: "The saving recurs at every level, so the recursion tree has branching factor 3. That changes the exponent, not a constant factor.",
        },
      ],
    },
    {
      id: "wider-is-carrying",
      title: "Wider $A+B$ is not fixed by carrying",
      // Two things are being conflated, so this is a conflation and its
      // separation — two beats. A third "repair" would only restate the second.
      moves: [
        {
          body: "The extra digit in $A+B$ looks like something carrying must fix, or like it forces a fourth multiplication.",
        },
        {
          body: "But operand width and output carrying are separate concerns. $A+B$ being wider affects the *operands* of $(A+B)(C+D)$, and is absorbed by padding and uneven widths. Carrying is the later step that normalizes the $z_i$. Neither adds a multiplication.",
        },
      ],
    },
    {
      id: "corner-squares",
      title: "Subrectangles, not squares",
      // One naming correction. It needs one sentence and no lead-in at all —
      // three labeled paragraphs would pad it into an importance it lacks.
      moves: [
        {
          body: "$AC$ and $BD$ are subrectangles, not corner squares: their side lengths differ in general, since $A\\neq C$. Call them subrectangles.",
        },
      ],
    },
    {
      id: "three-coeffs-force-three",
      title: "Three coefficients do not force three multiplications",
      // A logical over-reach: sufficiency read as necessity. Two beats — what
      // the premise licenses, and what it leaves open. There is no "repair"
      // here, because the open half is genuinely still open at this point.
      moves: [
        {
          body: "Three coefficients mean three *evaluations* determine the quadratic, so three multiplications **suffice** — that is what the construction above shows.",
        },
        {
          body: "It does not follow that three are **necessary**. That three is also a lower bound is a separate rank argument, and it is not proved here.",
        },
      ],
    },
  ],
  exercises: [
    {
      id: "karatsuba-z1",
      type: "numeric",
      tier: "drill",
      prompt:
        "For $34\\times21$, with $A,B,C,D=3,4,2,1$, compute the middle coefficient $z_1=(A+B)(C+D)-AC-BD$.",
      expected: 11,
      tolerance: 0,
      explanation:
        "$(A+B)(C+D)=7\\cdot3=21$, $AC=6$, $BD=4$, so $z_1=21-6-4=11=AD+BC=3+8$. Recover the sum by subtracting the known corners — don't compute $AD$ and $BC$ separately.",
      hints: ["First form $(3+4)(2+1)$, then subtract $AC$ and $BD$."],
    },
    {
      id: "karatsuba-product-carry",
      type: "numeric",
      tier: "drill",
      prompt:
        "Finish the previous example: $z_2=6$, $z_1=11$, $z_0=4$. What is $100z_2+10z_1+z_0$? (Carrying is allowed in the final digits.)",
      expected: 714,
      tolerance: 0,
      explanation:
        "$600+110+4=714$. Here $z_1=11$ overflows the tens column, so output carrying produces the final digits. $34\\times21=714$.",
    },
    {
      id: "karatsuba-exponent",
      type: "multiple-choice",
      tier: "check",
      prompt:
        "Replacing four half-size multiplications with three changes the exponent from $\\log_2 4=2$ to which value?",
      choices: [
        "$\\log_2 3 \\approx 1.585$",
        "$1.75$",
        "$0.75$ (a 25% saving)",
        "$2$ (unchanged)",
      ],
      correctChoice: 0,
      explanation:
        "The saving is an *exponent* change because it recurs — branching factor 3 gives $n^{\\log_2 3}$, not a constant 25%.",
    },
    {
      id: "karatsuba-strassen-transfer",
      type: "multiple-choice",
      tier: "transfer",
      prompt:
        "Strassen multiplies two $2\\times2$ blocks with **7** multiplications instead of 8, recursively. Its exponent is?",
      choices: [
        "$\\log_2 7 \\approx 2.807$",
        "$\\log_2 8 = 3$",
        "$\\log_2 3$",
        "$2$",
      ],
      correctChoice: 0,
      explanation:
        "Same move as Karatsuba: cut one recursive multiply; the branching factor sets the exponent.",
    },
    {
      id: "karatsuba-width-vs-carry",
      type: "multiple-choice",
      tier: "check",
      prompt:
        "In $78\\times56$, $A+B=15$ has two digits. What does this mean for the algorithm?",
      choices: [
        "The recursive product $(A+B)(C+D)$ is slightly **wider** and is handled by padding / uneven widths — it is **not** a fourth multiplication and **not** fixed by output carrying.",
        "It adds a fourth multiplication.",
        "Output carrying fixes it.",
        "The algorithm breaks.",
      ],
      correctChoice: 0,
      explanation:
        "Operand-width growth in the sum-product is absorbed by padding / uneven widths. Output carrying is a different step that normalizes the $z_i$.",
    },
    {
      id: "karatsuba-output-carry",
      type: "multiple-choice",
      tier: "check",
      prompt:
        "In $78\\times56$, the coefficients $z_2=35$, $z_1=82$, $z_0=48$ each exceed one digit. This is resolved by…",
      choices: [
        "a final **output-carrying** pass that normalizes $z_2 B^{2m}+z_1 B^{m}+z_0$ into digits",
        "padding the operands",
        "a fourth multiplication",
        "doing it in a bigger base",
      ],
      correctChoice: 0,
      explanation:
        "Overflow of the *output* coefficients is carrying — a separate additive step, distinct from the wider sum-product operands.",
    },
    {
      id: "karatsuba-quadratic-eval",
      type: "prediction",
      tier: "transfer",
      prompt:
        "Treating $x=at+b$ and $y=ct+d$, the product is a quadratic in $t$. How many suitable evaluations pin it down?",
      reveal:
        "Three — a quadratic has three coefficients, so three suitable point-values determine it; Karatsuba's three products are three such evaluations. (Three coefficients alone don't force three multiplications — the construction does.)",
    },
  ],
  // No `keyTakeaway` / `summary` block: the lesson ends on the open-question
  // section instead of a generic compression (vision.md §0 principle 14 /
  // the redesign brief's "experiences may end with an unresolved question").
};
