/**
 * Gate-9 module-owned assessment items for Package B (`calculus-technique`,
 * L5–L8). Written integration is human-scored; delayed retrieval and the
 * timed mock are deliberately auto-graded. Building these surfaces does not
 * itself produce learner evidence (see the module assessment plan).
 */

import { SELF_CHECK_ID } from "./capabilities";
import type { ExerciseDefinition } from "./types";

const modCalctechMixedChainMatrix: ExerciseDefinition = {
  id: "mod-calctech-mixed-chain-matrix",
  type: "custom",
  capabilityId: SELF_CHECK_ID,
  tier: "transfer",
  prompt:
    "Let $h(x)=\\sin((2x-1)^3)$. At $x=1$, produce $h'(1)$ in two linked " +
    "representations: first as the product of the three scalar local " +
    "magnifications, then as the product of three $1\\times1$ derivative " +
    "matrices. Evaluate the common scalar and explain why the order of the " +
    "factors follows the composition rather than being an arbitrary mnemonic.",
  config: {
    modelAnswer:
      "Write $x\\mapsto u=2x-1\\mapsto v=u^3\\mapsto y=\\sin v$. At $x=1$, " +
      "$u=v=1$, so the scalar product is $\\cos(1)\\cdot3(1)^2\\cdot2=6\\cos(1)$. " +
      "The same chain is $[\\cos(1)][3][2]=[6\\cos(1)]$. Each factor is the " +
      "derivative matrix of the next map in the composition, evaluated at the " +
      "point delivered by the preceding map; the matrix composition fixes the order.",
    rubricId: "mod-calctech-mixed-chain-matrix",
    rubricVersion: 1,
    rubricText:
      "PASS requires the three maps and their evaluation points, the scalar " +
      "product cos(1)·3·2, the 1x1 matrix product [cos(1)][3][2], the value " +
      "6cos(1), and a composition-based explanation of factor order. A bare " +
      "answer, an unevaluated generic rule, or matrices with no connection to " +
      "the maps is not a pass.",
  },
};

const modCalctechMixedOptimizeComposite: ExerciseDefinition = {
  id: "mod-calctech-mixed-optimize-composite",
  type: "custom",
  capabilityId: SELF_CHECK_ID,
  tier: "transfer",
  prompt:
    "Find the absolute minimum and maximum of " +
    "$F(x)=(x^2-4x+5)^2$ on $[0,4]$. Produce the derivative, the complete " +
    "candidate set (including every case the interval method requires), and " +
    "the comparison that decides the extrema. State exactly which conclusion " +
    "is necessary-only and which theorem licenses existence.",
  config: {
    modelAnswer:
      "$F'(x)=4(x^2-4x+5)(x-2)$. Since $x^2-4x+5=(x-2)^2+1>0$, the only " +
      "interior stationary point is $x=2$; there are no singular points. The " +
      "candidate set is $\\{0,2,4\\}$. Values are $25,1,25$, hence the absolute " +
      "minimum is $1$ at $2$ and the absolute maximum is $25$ at both endpoints. " +
      "Fermat's condition says an interior differentiable extremum must be " +
      "stationary (necessary, not sufficient); the Extreme Value Theorem " +
      "licenses existence because $F$ is continuous on a closed bounded interval.",
    rubricId: "mod-calctech-mixed-optimize-composite",
    rubricVersion: 1,
    rubricText:
      "PASS requires a correct chain-rule derivative, the positivity argument " +
      "excluding zeros of the inner quadratic, candidate set {0,2,4}, all " +
      "three values, both endpoint maximizers, the necessary-only status of " +
      "Fermat's condition, and the EVT hypotheses. Checking only x=2 or calling " +
      "stationarity sufficient is not a pass.",
  },
};

const modCalctechMethodMix: ExerciseDefinition = {
  id: "mod-calctech-method-mix",
  type: "custom",
  capabilityId: SELF_CHECK_ID,
  tier: "transfer",
  prompt:
    "For each tail, choose the shortest rigorous route yourself, carry out its " +
    "decisive step, and state the verdict. Do not merely guess from a graph: " +
    "**P** $\\int_1^\\infty x^{-4}dx$; **Q** $\\int_1^\\infty\\sin x\\,dx$; " +
    "**R** $\\int_2^\\infty 1/(x^3+1)\\,dx$. Explain why your chosen route is " +
    "efficient for that integrand and state every hypothesis it needs.",
  config: {
    modelAnswer:
      "P: the p-ladder decides immediately: p=4>1, and direct truncation gives " +
      "$(1-R^{-3})/3\\to1/3$. Q: direct truncation gives " +
      "$\\cos(1)-\\cos(R)$, which has no limit, so it oscillates rather than " +
      "converging. R: comparison is shortest: on every finite [2,R] the " +
      "functions are integrable and $0\\le1/(x^3+1)\\le1/x^3$; the p-ladder " +
      "says the majorant converges, so the target converges. These are " +
      "respectively p-ladder/direct truncation, direct truncation, and comparison.",
    rubricId: "mod-calctech-method-mix",
    rubricVersion: 1,
    rubricText:
      "PASS requires an efficient method selected without prompt cues for all " +
      "three: p-ladder or direct truncation for P with value 1/3; direct " +
      "truncation for Q with a no-limit oscillation argument; comparison for R " +
      "with nonnegativity, the correct inequality, finite-truncation " +
      "integrability, and the convergent p=3 majorant. Three verdicts without " +
      "the decisive work and hypotheses are not a pass.",
  },
};

const modCalctechDiagnoseLimit: ExerciseDefinition = {
  id: "mod-calctech-diagnose-limit",
  type: "custom",
  capabilityId: SELF_CHECK_ID,
  tier: "transfer",
  prompt:
    "A student writes: ‘$x/(1+x^2)\\to0$, and substituting $u=1+x^2$ gives " +
    "the antiderivative $\\tfrac12\\ln(1+x^2)$, so " +
    "$\\int_0^\\infty x/(1+x^2)\\,dx$ converges.’ Pinpoint the first invalid " +
    "inference, repair the argument from the finite accumulation, and classify " +
    "the divergence mode. Say which parts of the student's work remain valid.",
  config: {
    modelAnswer:
      "The substitution and antiderivative are valid, and the integrand tending " +
      "to zero is necessary in many familiar positive-tail cases but not " +
      "sufficient for convergence. The missing decisive object is the limit of " +
      "$A(R)=\\int_0^R x/(1+x^2)dx=\\tfrac12\\ln(1+R^2)$. It tends to +∞, so " +
      "the accumulation is unbounded and the improper integral diverges.",
    rubricId: "mod-calctech-diagnose-limit",
    rubricVersion: 1,
    rubricText:
      "PASS requires preserving the valid substitution/antiderivative, rejecting " +
      "the inference ‘integrand tends to zero therefore converges’, producing " +
      "A(R)=1/2 ln(1+R^2), taking its limit, and naming unbounded divergence. " +
      "Calling the antiderivative wrong or saying only ‘harmonic-like’ is not a pass.",
  },
};

const modCalctechRetainDuNotProof: ExerciseDefinition = {
  id: "mod-calctech-retain-du-not-proof",
  type: "multiple-choice",
  tier: "check",
  prompt:
    "Delayed retrieval: why is writing $du=g'(x)dx$ and canceling symbols not, " +
    "by itself, a proof of a change of variable?",
  choices: [
    "Because the identity is justified by the chain rule together with the bounds/domain hypotheses; the symbols record that argument but do not replace it",
    "Because $du/dx$ is literally a fraction, but fractions may never be canceled",
    "Because substitution is only valid for linear inner functions",
    "Because every substitution changes a definite integral's value",
  ],
  correctChoice: 0,
  explanation:
    "The differential notation is a reliable ledger after the chain-rule " +
    "identity and bounds hypotheses do the work. Treating it as autonomous " +
    "fraction cancellation hides exactly those conditions.",
};

const modCalctechRetainNecessary: ExerciseDefinition = {
  id: "mod-calctech-retain-necessary-not-sufficient",
  type: "multiple-choice",
  tier: "check",
  prompt:
    "Delayed retrieval: $f(x)=x^3$ has $f'(0)=0$. What does that establish " +
    "about an extremum at $0$?",
  choices: [
    "Nothing by itself: stationarity is necessary for an interior differentiable extremum, not sufficient; here 0 is neither a max nor a min",
    "It proves a local minimum because the derivative vanishes",
    "It proves a local maximum because the graph is flat",
    "It proves both a maximum and a minimum",
  ],
  correctChoice: 0,
  explanation:
    "$x^3$ is smaller just left of zero and larger just right of zero. Fermat's " +
    "condition filters candidates; it does not certify survivors.",
};

const modCalctechRetainAntiderivative: ExerciseDefinition = {
  id: "mod-calctech-retain-antiderivative-check",
  type: "multiple-choice",
  tier: "check",
  prompt:
    "Delayed retrieval: which check establishes that $F(x)=\\ln|x|+7$ is an " +
    "antiderivative of $1/x$ on the interval $(-\\infty,0)$?",
  choices: [
    "Differentiate on that interval: F'(x)=1/x there; the +7 disappears",
    "Sample forty negative x-values and accept if they are close",
    "Drop the absolute value because x is negative",
    "Evaluate F(0) and compare it with 1/0",
  ],
  correctChoice: 0,
  explanation:
    "An antiderivative claim is an interval identity checked by " +
    "differentiation. The domain excludes zero, and every additive constant " +
    "belongs to the family.",
};

const modCalctechRetainConvergence: ExerciseDefinition = {
  id: "mod-calctech-retain-convergence-limit",
  type: "multiple-choice",
  tier: "check",
  prompt:
    "Delayed retrieval: what must be shown to conclude that " +
    "$\\int_3^\\infty f(x)\\,dx$ converges?",
  choices: [
    "The finite accumulations A(R)=∫_3^R f exist and approach one finite limit as R→∞",
    "The values f(R) approach zero",
    "A graph looks flat by R=60",
    "The integrand is defined at the point ∞",
  ],
  correctChoice: 0,
  explanation:
    "The improper object is the limit of ordinary finite accumulations. " +
    "Pointwise decay and a finite plotting window do not by themselves settle that limit.",
};

const modCalctechMockDerivative: ExerciseDefinition = {
  id: "mod-calctech-mock-derivative",
  type: "numeric",
  tier: "transfer",
  prompt: "For $y=(3x^2+1)^4$, evaluate $y'(1)$.",
  expected: 1536,
  tolerance: 0.001,
  explanation:
    "$y'=24x(3x^2+1)^3$, so $y'(1)=24\\cdot4^3=1536$.",
};

const modCalctechMockOptimize: ExerciseDefinition = {
  id: "mod-calctech-mock-optimize",
  type: "vector",
  tier: "transfer",
  prompt:
    "For $g(x)=x^3-3x$ on $[-1,2]$, enter $(\\min g,\\max g)$ after checking " +
    "the complete candidate set.",
  expected: [-2, 2],
  tolerance: 0.001,
  explanation:
    "$g'=3(x^2-1)$ gives candidates $-1,1,2$ (with $-1$ also an endpoint). " +
    "Their values are $2,-2,2$, so the minimum is -2 and maximum is 2.",
};

const modCalctechMockImproper: ExerciseDefinition = {
  id: "mod-calctech-mock-improper",
  type: "numeric",
  tier: "transfer",
  prompt: "Evaluate $\\int_1^\\infty 5x^{-6}\\,dx$.",
  expected: 1,
  tolerance: 0.001,
  explanation:
    "$\\int_1^R5x^{-6}dx=1-R^{-5}\\to1$. The finite accumulation and its " +
    "limit, not a value at infinity, produce the answer.",
};

export const CALCULUS_TECHNIQUE_MODULE_ITEMS: readonly ExerciseDefinition[] = [
  modCalctechMixedChainMatrix,
  modCalctechMixedOptimizeComposite,
  modCalctechMethodMix,
  modCalctechDiagnoseLimit,
  modCalctechRetainDuNotProof,
  modCalctechRetainNecessary,
  modCalctechRetainAntiderivative,
  modCalctechRetainConvergence,
  modCalctechMockDerivative,
  modCalctechMockOptimize,
  modCalctechMockImproper,
];
