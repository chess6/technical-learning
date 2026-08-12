import type { LessonDefinition } from "./types";
import {
  COMMITTED_PREDICTION_ID,
  EXERCISE_SEQUENCE_ID,
  TAIL_COMPARISON_ID,
} from "./capabilities";

export const improperIntegralsLesson: LessonDefinition = {
  id: "improper-integrals",
  title: "Accumulating Forever",
  subtitle: "Infinity is not an endpoint — it is a question about finite totals",
  learningObjectives: [
    "Translate every infinite edge or singular edge into a family of proper finite integrals",
    "Use the p-ladder and its octave mechanism to decide convergence at infinity and at zero",
    "Distinguish settling, unbounded growth, and oscillation",
    "Apply both directions of positive comparison with their hypotheses",
    "Treat every boundary term at infinity as a limit",
  ],
  objectives: [
    {
      id: "imp-obj-scandal",
      text: "Commit to the familiar but unlicensed computation before locating its failed hypothesis",
      evidence: "lesson-owned",
      evidenceLevel: "E1",
      itemIds: ["imp-scandal-predict"],
    },
    {
      id: "imp-obj-definition-edges",
      text: "Translate Type I, every Type-II edge, and two-sided notation into finite-limit families",
      evidence: "lesson-owned",
      evidenceLevel: "E3",
      itemIds: ["imp-definition-edges"],
    },
    {
      id: "imp-obj-p-ladder",
      text: "Classify both p-edges and explain the knife edge",
      evidence: "lesson-owned",
      evidenceLevel: "E3",
      itemIds: ["imp-p-ladder"],
    },
    {
      id: "imp-obj-verdicts",
      text: "Distinguish convergence, unbounded divergence, and oscillatory divergence",
      evidence: "lesson-owned",
      evidenceLevel: "E3",
      itemIds: ["imp-verdict-classify"],
    },
    {
      id: "imp-obj-comparison",
      text: "Apply convergent-majorant and divergent-minorant comparison with all hypotheses",
      evidence: "lesson-owned",
      evidenceLevel: "E3",
      itemIds: ["imp-comparison-produce", "imp-comparison-diverge"],
    },
    {
      id: "imp-obj-refusal",
      text: "Refuse a symmetric-only value and require independent one-sided limits",
      evidence: "lesson-owned",
      evidenceLevel: "E3",
      itemIds: ["imp-route-refusal"],
    },
    {
      id: "imp-obj-boundary",
      text: "Check an integration-by-parts boundary as a limit",
      evidence: "lesson-owned",
      evidenceLevel: "E3",
      itemIds: ["imp-boundary-limit"],
    },
  ],
  motivatingQuestion:
    "A familiar FTC calculation says the positive integrand $1/x^2$ has integral $-2$ from $-1$ to $1$. Is the arithmetic wrong — or was the calculation never licensed?",
  sections: [
    {
      id: "scandal",
      title: "The calculation that should make you stop",
      body:
        "Blindly using $F(x)=-1/x$ gives $F(1)-F(-1)=-2$. But $1/x^2$ is positive wherever it is defined, and it is not even defined at $0$. The FTC required one continuous integrand on the whole finite interval. We crossed a missing point and silently pretended it was an ordinary endpoint. The repair is not a new plug-in rule: split into proper finite pieces first, then ask what their totals do as the pieces approach the missing edge.",
      equation:
        "\\int_{-1}^{1}\\frac{dx}{x^2}\\neq\\left[-\\frac1x\\right]_{-1}^{1}\\quad\\text{because the FTC hypotheses fail at }0",
    },
    {
      id: "settling",
      title: "Do not ask whether the graph looks flat",
      body:
        "For each finite $R$, $A(R)=\\int_a^R f(x)\\,dx$ is an ordinary proper integral. The infinite symbol abbreviates one claim: these finite numbers approach a single finite limit. A graph can look flat and still creep forever: $\\int_1^R dx/x=\\ln R$ grows without bound, more slowly than any fixed plotting window makes obvious. And divergence need not mean growth to infinity: $\\int_0^R\\sin x\\,dx=1-\\cos R$ stays bounded but never settles.",
      observation:
        "Converges, diverges unboundedly, and diverges by oscillation are different mathematical claims.",
    },
    {
      id: "octaves",
      title: "The knife edge pays equal rent forever",
      body:
        "Break the tail into octave blocks $[2^k,2^{k+1}]$. For $1/x$, every block contributes exactly $\\ln2$; infinitely many equal positive payments cannot fit under a finite ceiling. For $1/x^2$, successive payments shrink by $1/2$, so a finite geometric bound traps the whole tail. In general the ratio is $2^{1-p}$. This mechanism, not a memorized table, is why $p=1$ separates the two behaviors.",
      equation:
        "\\int_{2^k}^{2^{k+1}}x^{-p}\\,dx\\quad\\text{has consecutive ratio }2^{1-p}",
    },
    {
      id: "gaussian",
      title: "Existence without an elementary antiderivative",
      body:
        "Lesson 7 cited that $e^{-x^2}$ has no elementary antiderivative. That says nothing about whether its total exists. On $x\\ge1$, $0\\le e^{-x^2}\\le e^{-x}$, and the larger tail converges. The finite interval $[0,1]$ is already a proper integral, so comparison proves the whole accumulation settles. This argument establishes convergence only; it does not establish a value, and no value is displayed here.",
      equation:
        "0\\le e^{-x^2}\\le e^{-x}\\quad(x\\ge1)\\quad\\Longrightarrow\\quad\\int_0^\\infty e^{-x^2}\\,dx\\text{ converges}",
    },
    {
      id: "two-sided",
      title: "Two infinite directions are two independent debts",
      body:
        "A two-sided integral is defined by choosing any finite split point $c$ and requiring both one-sided integrals to converge independently. Symmetric truncation can cancel two failures and produce a principal value, but that is a different object. For $f(x)=x$, symmetric totals are always zero while each one-sided accumulation is unbounded. The honest improper integral therefore diverges.",
    },
    {
      id: "parts-boundary",
      title: "A boundary term is still a limit",
      body:
        "Integration by parts is performed on $[0,R]$, where every step is ordinary: $\\int_0^R xe^{-x}dx=1-(R+1)e^{-R}$. The expression $Re^{-R}$ is not evaluated by plugging in infinity. From the FTC, $e^R\\ge R^2/2$ for $R>0$, so $0\\le Re^{-R}\\le2/R\\to0$. Only after that limit is checked may the finite identity yield the total $1$.",
      equation:
        "\\int_0^R xe^{-x}\\,dx=1-(R+1)e^{-R}\\longrightarrow1",
    },
  ],
  formalBlocks: [
    {
      id: "def-type-one",
      kind: "definition",
      label: "Infinite edge",
      statement:
        "$\\int_a^\\infty f(x)\\,dx$ means $\\lim_{R\\to\\infty}\\int_a^R f(x)\\,dx$, provided that finite limit exists.",
      interpretation:
        "Infinity is never substituted into an antiderivative. Every member of the family has finite endpoints.",
      visibility: "visible",
    },
    {
      id: "def-type-two",
      kind: "definition",
      label: "Singular edge and split singularity",
      statement:
        "At a bad left edge use $\\lim_{t\\to a^+}\\int_t^b f$; at a bad right edge use $\\lim_{t\\to b^-}\\int_a^t f$. An interior singularity requires both one-sided integrals separately.",
      interpretation:
        "The direction of approach follows the domain, and no cancellation between failed sides is permitted.",
      visibility: "visible",
    },
    {
      id: "thm-p-ladder",
      kind: "theorem",
      label: "The p-ladder",
      statement:
        "$\\int_1^\\infty x^{-p}dx$ converges exactly when $p>1$; $\\int_0^1x^{-p}dx$ converges exactly when $p<1$.",
      interpretation:
        "The same exponent boundary reverses when the troublesome edge moves from infinity to zero.",
      visibility: "visible",
      proof:
        "For $p\\ne1$, integrate on finite bounds: $\\int_1^R x^{-p}dx=(R^{1-p}-1)/(1-p)$ and $\\int_\\varepsilon^1x^{-p}dx=(1-\\varepsilon^{1-p})/(1-p)$. Now take the stated limits. For $p=1$, octave blocks each contribute $\\ln2$, so the positive partial totals exceed every bound.",
    },
    {
      id: "thm-comparison",
      kind: "theorem",
      label: "Positive comparison",
      statement:
        "Suppose $f$ and $g$ are integrable on every finite truncation of $[c,\\infty)$ and nonnegative there. If $f\\le g$ and $\\int_c^\\infty g$ converges, then $\\int_c^\\infty f$ converges. If $g\\le f$ and $\\int_c^\\infty g$ diverges, then $\\int_c^\\infty f$ diverges.",
      interpretation:
        "A convergent ceiling traps a smaller positive accumulation; a divergent floor forces a larger one to escape.",
      visibility: "visible",
      proof:
        "For every finite $R$, positivity and integral order give $0\\le\\int_c^R f\\le\\int_c^R g$. In the first direction the target accumulation is increasing and bounded, so the supplied Monotone Accumulation Principle says it converges. In the second direction, if the larger target had a finite limit then its smaller accumulation would be bounded too, contradicting the declared divergence of the minorant.",
    },
  ],
  explorationId: "improper-accumulation",
  exercises: [
    {
      id: "imp-scandal-predict",
      type: "custom",
      capabilityId: COMMITTED_PREDICTION_ID,
      tier: "check",
      prompt: "Before the repair is shown: is the blind value $-2$ licensed?",
      config: {
        options: ["Yes — the antiderivative formula is enough", "No — a required hypothesis fails"],
        correctIndex: 1,
        reveal:
          "The integrand is not continuous on the interval. The arithmetic is beside the point: the FTC was never licensed across zero.",
      },
    },
    {
      id: "imp-definition-edges",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt: "Translate each non-proper notation into the finite-limit family it actually means.",
      config: { steps: [
        {
          kind: "multiple-choice", prompt: "$\\int_2^\\infty f$",
          choices: ["$\\lim_{R\\to\\infty}\\int_2^R f$", "$\\int_2^R f$ for one large R", "$F(\\infty)-F(2)$"],
          correctChoice: 0, explanation: "Type I is a limit of finite right-edge accumulations.",
        },
        {
          kind: "multiple-choice", prompt: "$f$ is singular at the left endpoint $a$",
          choices: ["$\\lim_{t\\to a^+}\\int_t^b f$", "$\\lim_{t\\to b^-}\\int_a^t f$", "$\\int_a^b f$ directly"],
          correctChoice: 0, explanation: "Approach a left singular edge from inside the domain.",
        },
        {
          kind: "multiple-choice", prompt: "$f$ is singular at the right endpoint $b$",
          choices: ["$\\lim_{t\\to b^-}\\int_a^t f$", "$\\lim_{t\\to a^+}\\int_t^b f$", "$\\int_a^b f$ directly"],
          correctChoice: 0, explanation: "Approach a right singular edge from inside the domain.",
        },
        {
          kind: "multiple-choice", prompt: "An interior singularity at $c$",
          choices: ["Require both one-sided integrals separately", "Use only symmetric cancellation", "Choose the side with the smaller value"],
          correctChoice: 0, explanation: "Both sides must exist independently.",
        },
        {
          kind: "multiple-choice", prompt: "$\\int_{-\\infty}^{\\infty}f$",
          choices: ["Split at finite c and require both sides", "Take only $\\lim_{R\\to\\infty}\\int_{-R}^{R}f$", "Plug both infinities into F"],
          correctChoice: 0, explanation: "Two infinite edges create two independent limits.",
        },
      ] },
    },
    {
      id: "imp-p-ladder",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt: "Use the p-ladder at both troublesome edges.",
      config: { steps: [
        {
          kind: "text", prompt: "$\\int_1^\\infty x^{-3/2}dx$: converges or diverges?",
          accept: ["converges", "convergent"], explanation: "$p=3/2>1$ at infinity.",
        },
        {
          kind: "text", prompt: "$\\int_0^1 x^{-3/2}dx$: converges or diverges?",
          accept: ["diverges", "divergent"], explanation: "$p=3/2\\ge1$ at zero.",
        },
        {
          kind: "multiple-choice", prompt: "Why is p=1 the knife edge at infinity?",
          choices: ["Every octave contributes $\\ln2$", "The integrand stops decreasing", "Its antiderivative is zero"],
          correctChoice: 0, explanation: "Equal positive rent forever forces unbounded totals.",
        },
      ] },
    },
    {
      id: "imp-verdict-classify",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt: "Classify from the formulas for the finite accumulations, not from a plot.",
      config: { steps: [
        {
          kind: "text", prompt: "$A(R)=1-1/R$",
          accept: ["converges", "convergent"], explanation: "It tends to the finite value 1.",
        },
        {
          kind: "text", prompt: "$A(R)=\\ln R$",
          accept: ["unbounded", "diverges unboundedly"], explanation: "It crosses every finite bound.",
        },
        {
          kind: "text", prompt: "$A(R)=1-\\cos R$",
          accept: ["oscillates", "oscillatory"], explanation: "It stays bounded but has no limit.",
        },
      ] },
    },
    {
      id: "imp-comparison-produce",
      type: "custom",
      capabilityId: TAIL_COMPARISON_ID,
      tier: "drill",
      prompt:
        "For $f(x)=1/(x^3+x)$ on $x\\ge1$, certify convergence using any valid comparator $C/x^p$ in the declared family.",
      config: {
        target: "cubic-convergent-majorant",
        explanation: "A convergent positive majorant bounds the increasing target accumulation.",
      },
    },
    {
      id: "imp-comparison-diverge",
      type: "custom",
      capabilityId: TAIL_COMPARISON_ID,
      tier: "drill",
      prompt:
        "For $f(x)=x^{-1/2}$ on $x\\ge1$, certify divergence using any valid comparator $C/x^p$ in the declared family.",
      config: {
        target: "sqrt-divergent-minorant",
        explanation: "A divergent positive minorant forces the larger target accumulation to diverge.",
      },
    },
    {
      id: "imp-route-refusal",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt: "Audit the tempting claim $\\int_{-\\infty}^{\\infty}x\\,dx=0$.",
      config: { steps: [
        {
          kind: "multiple-choice", prompt: "What does symmetric truncation compute here?",
          choices: ["A principal value, a different object", "The improper integral by definition", "A proper integral"],
          correctChoice: 0, explanation: "Symmetric cancellation is meaningful, but it is not this definition.",
        },
        {
          kind: "multiple-choice", prompt: "What happens to the two required one-sided totals?",
          choices: ["Each is unbounded, so the improper integral diverges", "They converge and cancel", "Only the right side matters"],
          correctChoice: 0, explanation: "Each side must converge independently; neither does.",
        },
      ] },
    },
    {
      id: "imp-boundary-limit",
      type: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      tier: "drill",
      prompt: "Finish $\\int_0^\\infty xe^{-x}dx$ without plugging infinity into the parts boundary.",
      config: { steps: [
        {
          kind: "multiple-choice", prompt: "Which finite identity is correct?",
          choices: ["$\\int_0^Rxe^{-x}dx=1-(R+1)e^{-R}$", "$1-Re^{-R}$", "$-Re^{-R}$"],
          correctChoice: 0, explanation: "Parts is performed first on the proper interval $[0,R]$.",
        },
        {
          kind: "multiple-choice", prompt: "Which bound proves $Re^{-R}\\to0$?",
          choices: ["$0\\le Re^{-R}\\le2/R$ from $e^R\\ge R^2/2$", "It looks small at R=60", "$e^{-R}\\to0$ so products always do"],
          correctChoice: 0, explanation: "The explicit squeeze owns the product limit.",
        },
        {
          kind: "numeric", prompt: "What total remains?", expected: 1, tolerance: 0,
          explanation: "Both $(R+1)e^{-R}$ terms vanish, leaving 1.",
        },
      ] },
    },
  ],
  route: [
    { kind: "motivate" },
    { kind: "practice", exerciseIds: ["imp-scandal-predict"], scaffold: "coached" },
    { kind: "section", sectionId: "scandal" },
    { kind: "formal", formalId: "def-type-one" },
    { kind: "formal", formalId: "def-type-two" },
    { kind: "section", sectionId: "settling" },
    { kind: "explore", tocLabel: "Move the finite edge" },
    { kind: "formal", formalId: "thm-p-ladder" },
    { kind: "proof", formalId: "thm-p-ladder" },
    { kind: "section", sectionId: "octaves" },
    {
      kind: "practice",
      exerciseIds: ["imp-definition-edges", "imp-p-ladder", "imp-verdict-classify"],
      scaffold: "independent",
    },
    { kind: "formal", formalId: "thm-comparison" },
    { kind: "proof", formalId: "thm-comparison" },
    { kind: "section", sectionId: "gaussian" },
    {
      kind: "practice",
      exerciseIds: ["imp-comparison-produce", "imp-comparison-diverge"],
      scaffold: "independent",
    },
    { kind: "section", sectionId: "two-sided" },
    { kind: "practice", exerciseIds: ["imp-route-refusal"], scaffold: "independent" },
    { kind: "section", sectionId: "parts-boundary" },
    { kind: "practice", exerciseIds: ["imp-boundary-limit"], scaffold: "independent" },
    { kind: "summary" },
  ],
  keyTakeaway:
    "An improper integral is never an evaluation at infinity. It is a verdict about a family of proper finite accumulations: do they settle to one finite number?",
  structuredSummary: {
    coreMentalModel:
      "Move the troublesome edge to a finite parameter, compute an ordinary accumulation, then ask whether that family settles.",
    definitionsIntroduced: [
      "Type I: a limit of finite truncations",
      "Type II: a one-sided limit approaching a singular endpoint",
      "Two-sided: two independent one-sided limits",
    ],
    mainResult:
      "The p-ladder is calibrated at $p=1$; positive comparison transfers convergence downward and divergence upward when all hypotheses are stated.",
    representationsConnected:
      "Finite accumulation formulas, the accumulation graph, octave blocks, and symbolic inequalities all describe the same limiting question.",
    commonMistake:
      "Plugging infinity into an antiderivative, or treating a flat-looking finite graph as a proof.",
    canonicalExample:
      "$\\int_1^\\infty x^{-2}dx=\\lim_{R\\to\\infty}(1-1/R)=1$.",
    oneProblemWorthRemembering:
      "$\\int_0^\\infty xe^{-x}dx$: parts on $[0,R]$, then prove the boundary limit.",
    whatThisUnlocksNext:
      "Every later Fourier and Laplace integral must earn its convergence before its notation is licensed.",
  },
};
