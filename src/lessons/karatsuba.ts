import type { LessonDefinition } from "./types";

/**
 * Karatsuba multiplication lesson. Built around the approved insight contract
 * (docs/insights/karatsuba.md). Numbers live in karatsubaData.ts.
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
  motivatingQuestion:
    "$12 \\times 13$ splits into four little products the way FOIL expands $(10+2)(10+3)$. Two of those four are secretly doing the *same* job. Which two — and can we get away with three multiplications instead of four?",
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
          kind: "connection",
          title: "Three evaluations of a quadratic (optional)",
          body: "Treat each number as a linear polynomial $x(t)=at+b$, $y(t)=ct+d$. The product is a quadratic determined by three suitable evaluations ($t=0,1,\\infty$). Karatsuba's three products are three such evaluations. This opens Toom-Cook and the evaluate → pointwise multiply → interpolate architecture shared with FFT multiplication — a deeper connection, not the prerequisite explanation. Three coefficients alone do not force three multiplications; the construction does.",
        },
        {
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
      id: "all-four-needed",
      title: "Not all four products are needed",
      belief: "You must compute all four FOIL products.",
      confront:
        "The answer only ever uses $AD$ and $BC$ as the sum $AD+BC$.",
      resolve:
        "So one product $(A+B)(C+D)$ minus the two known corners recovers exactly what's needed — three products total.",
    },
    {
      id: "twenty-five-percent",
      title: "Not a 25% speedup",
      belief: "Saving one of four is a 25% speedup.",
      confront:
        "Measured cost is $n^{1.585}$ vs $n^2$, far more than 25%.",
      resolve:
        "Because the saving recurs, the recursion tree has branching factor 3, so it's an exponent change, not a constant.",
    },
    {
      id: "wider-is-carrying",
      title: "Wider $A+B$ is not fixed by carrying",
      belief:
        "The extra digit in $A+B$ is fixed by carrying / adds a fourth multiply.",
      confront:
        "$A+B$ being wider affects the *operands* of $(A+B)(C+D)$, not the output digits.",
      resolve:
        "Operand width is absorbed by padding / uneven widths. Output carrying is the separate step that normalizes the $z_i$. Neither adds a multiplication.",
    },
    {
      id: "corner-squares",
      title: "Subrectangles, not squares",
      belief: "$AC$ and $BD$ are corner squares.",
      confront: "Their side lengths differ in general ($A\\neq C$).",
      resolve: "They're subrectangles; call them that.",
    },
    {
      id: "three-coeffs-force-three",
      title: "Three coefficients do not force three multiplications",
      belief: "Three coefficients force exactly three multiplications.",
      confront:
        "Three coefficients mean three *evaluations* determine the quadratic.",
      resolve:
        "Sufficiency comes from the explicit construction; that three is also a lower bound is the separate rank result (expert layer).",
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
  keyTakeaway:
    "FOIL's two middle pieces share a place-value column, so only their sum is needed; one extra multiplication recovers that sum, and three-way recursion turns $n^2$ into about $n^{1.585}$.",
};
