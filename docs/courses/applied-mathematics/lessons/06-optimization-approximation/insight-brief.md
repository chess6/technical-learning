# Insight Discovery Brief — Deciding with the Derivative (spine L6)

Stage 1 of the [Insight Discovery Gate](../../../../authoring/insight-discovery-gate.md)
for `optimization-approximation`. Second lesson of Package B
(`calculus-technique`), after L5 `chain-rule`.

Spine row: [course-spine §4](../../course-spine.md#4-the-spine-at-a-glance), L6.
DAG: `derivative-local-linearity` → `optimization-approximation` →
`power-taylor-series` ([architecture §2.2](../../curriculum-architecture.md#22-within-course-edges)).

---

## 1a. Diagnose the cognitive obstacle

**Primary: an incorrect prior mental model — "setting the derivative to zero
*finds* the maximum."** Almost every learner arrives able to run the procedure
(differentiate, solve \(f'=0\), test, answer) and believes the equation
\(f'(a)=0\) is a *detector* for extrema. It is not. It is a **necessary
condition at interior points where \(f\) is differentiable**, and nothing more.
The learner has memorized the converse of a theorem, then patched it with three
unrelated-looking warnings — *check the endpoints*, *check where \(f'\) doesn't
exist*, *a critical point might be neither* — each held as an exception to
remember rather than as a consequence of anything. The observable symptom: a
learner who solves \(f'(x)=0\) fluently, and who, shown \(f(x)=x^3\) at \(0\) or
\(f(x)=|x|\) on \([-2,2]\), either mis-answers or answers correctly by
recalling the specific example rather than by naming which hypothesis failed.

**Secondary: missing purpose — the learner cannot say what service the
derivative actually performs here.** "Find the largest value of \(f\) on
\([a,b]\)" is a search over uncountably many points. Nothing in the standard
presentation says that the derivative's job is to **shrink that search to a
finite list**, or that a separate fact (a maximum exists at all) is what makes
comparing the list a valid method. Existence, location, and decision are three
different jobs, run together as one procedure, so the learner cannot say which
step would break on an open interval.

**Tertiary: missing structure in the approximation half — "\(\approx\)" is
treated as a claim.** \(f(a+h)\approx f(a)+f'(a)h\) is written down and used
numerically, but L2's guarantee is \(E(h)/h\to0\): a statement about a **limit**,
not about any particular \(h\). A learner who computes \(\sqrt{4.1}\approx2.025\)
has asserted something they cannot yet justify — exactly the gap L1 closed for
continuity when it introduced the modulus as the *quantitative* control a local
guarantee does not supply.

**Semantic/representational flag (triggers 1c).** The escape-route reading of a
nonzero slope is an *operational* re-presentation of the same theorem, so
[1c](#1c-conventional-vs-alternative-presentation) is required.

**Not the obstacle:** differentiating, solving \(f'(x)=0\) algebraically, or
arithmetic on candidate values. Learners do these correctly. The obstacle is
that the whole method is held as procedure with exceptions, so it cannot be
*derived*, cannot be *trusted where its hypotheses fail*, and gives no account
of why the second-derivative test exists.

| Later | Costs paid if this obstacle is not repaired |
| --- | --- |
| L11 `power-taylor-series` | "Linearization is the first two terms" is unintelligible to a learner who never saw the linear model as *one rung of a ladder chosen by the question being asked*. |
| L28 `partial-derivatives-gradient` | "\(\nabla f=\mathbf{0}\) at an interior extremum" is the same refutation argument with more directions to escape in — and saddle points are the multivariable form of "survived the filter, never certified". |
| L22–L23 (ODE behaviour), L27 (stability) | Reading equilibria and stability off derivative signs is the same local-model-decides-a-global-question move; a learner who holds it as procedure re-memorizes it there. |

---

## 1b. Raw leads

| # | Lead | Mechanism |
| --- | --- | --- |
| R1 | A nonzero slope is an **escape route**: L2's model \(f(a+h)=f(a)+f'(a)h+E(h)\) does not merely describe \(f\) near \(a\), it hands you a step that provably improves — because \(E(h)/h\to0\) forces \(f'(a)h\) to dominate \(E(h)\) once \(h\) is small enough. So "optimal" and "sloped" cannot both hold. | Predictive/causal reorganization |
| R2 | The derivative test **refutes; it never certifies**. Every point with a nonzero slope is eliminated; \(f'(a)=0\) is what is *left over*. Surviving a refutation is not the same as being right — \(x^3\) at \(0\) survives and is no extremum. | Structural compression |
| R3 | The three memorized warnings are the **three hypotheses of one argument**: two directions must be available (interior — fails at an endpoint), a local model must exist (differentiable — fails at \(\lvert x\rvert\)), and refutation is not certification (fails at \(x^3\)). Four rules collapse to one argument read carefully. | Structural compression |
| R4 | Optimization is **three jobs, not one procedure**: *existence* (something attains the maximum), *location* (everywhere else is refuted), *decision* (compare what is left). Naming them makes "why is comparing the candidates allowed?" a question with an answer. | Operational grounding |
| R5 | The derivative's real service is **cardinality**: an uncountable search becomes a finite list. That is what it is *for* here — not "it finds the answer". | Semantic grounding (purpose) |
| R6 | Sometimes there is **no maximum at all** — \(f(x)=x\) on \((0,1)\), or on \([0,\infty)\). The existence step is a real hypothesis that bites, not a formality; the method's honest output on an open interval is "no conclusion". | Predictive/causal reorganization |
| R7 | At a critical point the linear model is **constant** — it has no opinion about max versus min. That **silence is what forces the next rung**: the second-derivative test is not a separate rule, it is the first term the linear model could not supply. | Structural compression + representational change |
| R8 | One method, two questions. "Replace \(f\) near \(a\) by its local model and read the answer off the model" answers *where is the model flat* (optimize) and *what value does the model give* (approximate) — same object, same licence (\(E(h)/h\to0\)), two readings. | Structural compression |
| R9 | "\(\approx\)" is **not a claim**. \(E(h)/h\to0\) says something about a limit, not about the \(h\) you actually used. To say "accurate to \(10^{-3}\) on \([a-r,a+r]\)" you need a bound on curvature — the same upgrade L1 made from a local guarantee to a modulus. | Predictive/causal reorganization |
| R10 | **Newton's method**: feed the linear model back into itself. Solving \(f(x)=0\) becomes solving a line's root, repeatedly — the sharpest form of "hard function, easy polynomial, near here". | Operational grounding |
| R11 | **Rolle and the Mean Value Theorem come nearly free** once existence and refutation are both on the table: an interior extremum exists (existence), so it is flat (refutation) — that is Rolle; tilt by the secant and it is the MVT. This is the theorem that turns a *pointwise* derivative sign into an *interval-wide* monotonicity claim — which this repository currently **declares** per fixture (`CalculusFixture.monotoneIntervals`) rather than derives. | Structural compression (forward) |
| R12 | **Hill-walking:** if the ground under your feet is sloped, you are not at the top. Immediately available, supplies the goal — and imports precisely the false belief the lesson must break (on real hills, flat *does* usually mean summit; \(x^3\) is a ledge on a slope). | Semantic grounding |

**Anti-anchoring note.** The spine's own stated insight for this lesson —
*"the derivative turns 'find the best' into 'find where the local model is
flat', and 'hard function' into 'easy polynomial, near here'"* — is R8 plus the
**converse** of R2 (it says the derivative *turns* the problem into finding
flat points, which is only half true: flat points are candidates, not answers).
It is treated here as an **inherited hypothesis**, and its imprecision is
itself a finding: see [1d](#1d-ranking).

---

## 1c. Conventional vs alternative presentation

Triggered by 1a's semantic/representational flag. Both present **the same
theorem with the same hypotheses**; only the discovery order and the reading of
the derivative change.

| | Conventional | Alternative (escape route) |
| --- | --- | --- |
| **Opening** | State Fermat's theorem: if \(f\) has a local extremum at an interior point \(a\) and \(f'(a)\) exists, then \(f'(a)=0\). | Ask: you are standing at \(a\) and the local model has slope \(m\neq0\). Can this be the best point? Step and check. |
| **Argument** | The one-sided difference quotients have opposite weak signs at an extremum, so the two-sided limit is \(0\). | \(f(a+h)-f(a)=mh+E(h)\); since \(E(h)/h\to0\), for small enough \(h\) the sign of the change **is** the sign of \(mh\). Both signs of \(h\) are available, so one of them improves. |
| **Exceptions** | Three separate warnings, listed afterwards. | Three hypotheses of the argument you just ran, each discovered by removing it. |
| **What the derivative is doing** | Solving an equation. | Eliminating points. |

- **Preserved:** the theorem, its hypotheses, and its logical direction are
  identical. Both are one-sided-versus-two-sided arguments; the alternative
  routes the sign comparison through L2's residual rather than through raw
  difference quotients.
- **Easier to infer:** *which* hypothesis each classic counterexample violates,
  and why endpoint-checking is not an arbitrary extra step.
- **Background introduced:** none beyond L2 C5, which is already built and
  graded.
- **Likely to transfer:** yes — the same argument, with "both signs of \(h\)"
  replaced by "every direction", is the multivariable statement (L28), and
  saddle points are its "survived but uncertified" case.

---

## Consolidated packages

### P1 — "The derivative refutes; it never certifies" *(R1, R2, R3, R5, R12)*
The local model is **actionable**: a nonzero slope hands you a step that
improves, so a sloped point is *refuted* as optimal. Run that refutation
everywhere and what remains is a **candidate list**, not an answer — nothing in
the argument ever certifies a survivor. The three memorized warnings are the
argument's own three hypotheses (interior, differentiable, refutation-only),
each recoverable by asking which one the counterexample breaks.
**Delivers:** Fermat's theorem, derived from L2 C5 with nothing new assumed;
one account of \(x^3\), \(\lvert x\rvert\), and endpoints; the purpose (R5).
**Does not deliver:** why comparing candidates is *valid* (that is P2), or
anything about the approximation half (P3).

### P2 — "Three jobs, not one procedure" *(R4, R6, R5)*
Existence, location, decision are separable, and each can fail on its own. The
Extreme Value Theorem supplies existence on a closed bounded interval; the
refutation supplies location; comparing finitely many values supplies the
decision — and *that* chain, not habit, is what licenses the method. Remove the
closed interval and the first link breaks with nothing else changing (R6).
**Delivers:** the logical architecture, the honest "no conclusion" output, and
method selection (a P2-profile bar).
**Does not deliver:** why the location step is true.

### P3 — "When the line falls silent, the next rung speaks" *(R7, R8)*
The linear model at a critical point is a **constant** — it cannot distinguish a
max from a min, because the information that would distinguish them is in the
term it does not have. That silence is what the second-derivative test answers,
and that same term is the next Taylor coefficient (L11). The two halves of this
lesson are one method: replace \(f\) by its local model; ask *where the model is
flat* to optimize, ask *what the model's value is* to approximate.
**Delivers:** the unification the lesson id promises, the second-derivative test
as a consequence rather than a rule, and the L11 bridge.
**Does not deliver:** the necessity argument P1 owns; without it, "look where
it's flat" is still the memorized converse.

### P4 — "\(\approx\) is not a claim" *(R9)*
\(E(h)/h\to0\) is a limit statement; a numerical approximation needs a
*quantitative* bound, which needs curvature. The same move L1 made from the
local continuity guarantee to the modulus.
**Delivers:** honesty about what a linearization licenses, and a usable "how
far can I trust this?" answer.
**Does not deliver:** a model change on its own — it sharpens P3's second half
rather than replacing any belief about optimization.

### P5 — "Iterate the model" (Newton) *(R10)*
Feed the linear model's root back in as the new base point. Vivid, genuinely
"hard function → easy polynomial", and a real algorithm.
**Delivers:** a memorable payoff and a computation.
**Does not deliver:** any repair of the diagnosed obstacle; it is a *use* of
local linearity, and its convergence theory is a numerical-methods topic the
[spine §9 register](../../course-spine.md) already places out of scope.

**Shared engines, not rival packages.** R11 (Rolle/MVT from existence +
refutation) is a *consequence* available to P1, P2 and P3 alike — it is the tool
that upgrades pointwise derivative information to interval-wide monotonicity —
and is ranked as a scoping decision in [1e](#1e-continuity-and-scope-decisions),
not as a competing central model. Likewise the counterexample set
(\(x^3\), \(\lvert x\rvert\), endpoints, \(x^4\)) serves P1 and P3.

---

## 1d. Ranking

| Rank | Package | Why |
| --- | --- | --- |
| 1 | **P1** | Highest surprise (the learner believes \(f'=0\) *detects* extrema and discovers it only ever *eliminates* them) and by far the strongest explanatory compression: four separately-memorized rules become the hypotheses of one argument. Mathematically exact, and derived from L2 C5 alone — no new prerequisite. Correctness is a gate here and P1 passes it cleanly, where the inherited hypothesis does not (see below). |
| 2 | **P2** | Real and necessary: it is what makes "compare the candidates" a *method* rather than a habit, and R6 gives it a counterexample that bites. Ranked below P1 because on its own it is an **organizational relabel** — a learner handed "existence, location, decision" while still believing \(f'=0\) detects maxima has acquired a filing system, not a model. P1 is what makes P2's decision step necessary rather than ceremonial. |
| 3 | **P3** | Carries the lesson's second half and the L11 bridge, and R7 is genuinely illuminating (most learners hold the second-derivative test and Taylor series as unrelated facts). Ranked third only because it *presupposes* P1: "look where the model is flat" is exactly the memorized converse unless the necessity has been earned first. |
| 4 | **P4** | A correctness guardrail this course's ethos requires, and a clean repeat of L1's modulus move — but it sharpens an existing belief rather than replacing one, so it is a *component* of the lesson, not its spine. |
| 5 | **P5** | Vivid and real, but it repairs nothing in 1a and imports convergence questions the course has declared out of scope. Kept as an optional closing remark at most. |

**Selected: P1 primary** (refutation, and its three hypotheses), **P2
secondary** (the architecture P1's refutation slots into, and the existence
hypothesis that bites), **P3 tertiary** (the second half, the second-derivative
test as a consequence, and the forward bridge to L11), **P4 as a named
guardrail** on P3's approximation beat. **P5 descoped.**

> **Why not lead with the spine's own hypothesis (R8/P3)?** Because as the
> spine words it — *"the derivative turns 'find the best' into 'find where the
> local model is flat'"* — it is **not quite true**, and the imprecision is the
> exact misconception this lesson exists to break. The derivative turns "find
> the best" into "find where the local model is flat, **then decide separately,
> because flat is a survivor and not a winner**". Leading with the spine
> sentence would install the converse error in the lesson's own thesis. P1 is
> what makes the spine's sentence safe to say — and the spine's sentence, so
> repaired, is exactly what the lesson ends on. Criterion (4), mathematical
> correctness, is a gate rather than a tradeable score, which is why this
> ordering is not a preference.

**Evidence that would have flipped this ranking.** Two concrete cases:

1. **If L2 had not built C5.** Without \(f(a+h)=f(a)+f'(a)h+E(h)\),
   \(E(h)/h\to0\) already graded, R1's escape route degrades to "the slope tells
   you which way to walk" — a picture, not an argument, because nothing would
   license "for small enough \(h\) the linear term dominates". P3 would then have
   been the better primary: it needs the local models to *exist*, not to carry
   error control. L2 ships C5 by name, so P1 costs nothing new.
2. **If the course targeted P1 (standard computational) rather than P2.** The
   necessary-versus-sufficient distinction would be over-scoped for a learner
   whose bar is correct hand computation, and P2's three-jobs architecture —
   which improves the *procedure* without demanding the argument — would be the
   right primary. The
   [declared target is P2 + research-bridge](../../benchmark-matrix.md#1-the-three-profiles-for-this-subject),
   whose theorem bar is explicitly *"derivations and 'why the method works'"*,
   so P1 is in scope.

**Discovery sequence for P1** (discover, not tell; exit test is
predict-not-recall):

1. **Set the problem without calculus.** Find the largest value of a supplied
   \(f\) on a closed interval by sampling. Ask: how would you know you have not
   missed one? *(R5: the search is infinite.)*
2. **Stand at a sloped point.** The panel shows the local model's slope \(m\neq0\).
   Predict, before stepping, which direction improves; step and check. *(R1.)*
3. **Break the guarantee deliberately.** Take a step so large the residual
   dominates and improvement fails. Find roughly where it stops working. *(This
   is what makes \(E(h)/h\to0\) do visible work: the promise is local, and the
   learner locates its edge rather than being told it exists.)*
4. **Sweep.** Run the refutation across the whole interval and watch the
   eliminated points grey out. What is left? *(R2, R5 — the finite list appears
   as an output, not an assertion.)*
5. **A survivor that is not an answer.** \(x^3\) at \(0\) survived the sweep.
   Is it the maximum? *(Refutation ≠ certification, discovered.)*
6. **A winner the sweep never examined.** \(\lvert x\rvert\) on \([-2,2]\): the
   minimum sits where the sweep could not run. Which hypothesis failed? *(R3.)*
7. **A direction that was missing.** At the left endpoint of \([0,2]\) with
   \(f'(0)>0\), the sweep refutes "maximum" but not "minimum". Which of the two
   steps was unavailable? *(R3, and endpoint-checking stops being arbitrary.)*
8. **Exit test (predict, not recall).** Given a **fresh** function on a fresh
   closed interval, and *before any computation*: state which points the sweep
   can possibly leave standing and what would still have to be checked
   afterward. Then, on an **open** interval, predict what the method returns and
   say why that answer is honest rather than a failure. *(A learner reciting
   "check endpoints and corners" fails this; the second half cannot be answered
   from the procedure at all.)*

**Abstraction return** (required — P1 uses the hill/step grounding): the
sequence must end away from the picture. Step 8's fresh function is supplied
symbolically, and the graded return is *naming which hypothesis fails* in a case
with no walkable image, without reference to stepping. See
[insight.md §14](insight.md).

---

## 1e. Continuity and scope decisions

- **Canonical examples.** Reuses, in genuinely new roles:
  `ex-cubic-inflection` (\(x^3\)) — in L2 it was the counterexample to
  "the tangent touches once"; here it is the **survivor that is not an
  extremum**, the same function doing different work.
  `ex-abs` (\(\lvert x\rvert\)) — L2's non-differentiable point; here the
  **minimum the sweep cannot examine**. `ex-drive` — the velocity trace already
  carries two declared `turningPoints`, so "when was the car going fastest?" is
  an optimization question the learner already has a physical reading for.
  `ex-decay` (\(e^{-t/\tau}\)) is listed for L6 in
  [architecture §4](../../curriculum-architecture.md#4-recurring-canonical-examples)
  and earns its place on the **approximation** half —
  \(e^{-t/\tau}\approx1-t/\tau\) near \(0\) is the small-signal linearization,
  with a real engineering reading, and it is monotone, so it also shows an
  optimization problem whose answer is *entirely* at the endpoints.
  **Fresh:** a single new fixture for the sweep's main worked interval (one that
  actually has an interior maximum, which none of the above does) and \(x^4\) at
  \(0\) for the silent-second-derivative case. Both to be justified in the
  mastery contract, not created by default.
- **Visual reuse.** `function-plot` (L1's family, listed for L6) with new data,
  plus L2's `local-linearity-zoom` for the approximation half. **No new
  family.** L6 is
  [Supporting tier](../../curriculum-architecture.md#51-visual-budget-flagship-vs-supporting):
  the sweep is an explorer where the interaction earns its place, not a bespoke
  guided-scene clip.
- **Corroboration beat** (the ethos L4 and L5 both use): verify one optimum by a
  second, calculus-free route — completing the square, or symmetry — and confirm
  agreement. Practice tier, not a source of insight.
- **Open scoping decision — the Mean Value Theorem (R11).** *Recorded here for
  the contract to settle, not settled here.* L2 and L4 both explicitly withhold
  the MVT, and `CalculusFixture.monotoneIntervals` currently **declares**
  monotonicity "from the derivative's sign, not inferred by sampling" — an
  honest workaround for a theorem the course has not built. L6 is the first
  lesson that could pay for it: given P2's existence step and P1's refutation
  step, Rolle is two lines and the MVT is Rolle on a tilted function. Without
  it, the first- and second-derivative tests can only be **asserted**, which
  conflicts with the M2 P2 bar (*"techniques derived"*). With it, L6 carries a
  fifth theorem. Both options and a recommendation are in
  [insight.md](insight.md#prerequisites-limitations-likely-misconceptions).
- **Open scoping decision — the quantitative error bound (P4).** Whether L6
  *derives* \(\lvert f(a+h)-f(a)-f'(a)h\rvert\le Mh^2/2\) or cites it. A
  derivation is available entirely inside built machinery via the FTC (L4)
  applied twice, but that would add a `fundamental-theorem →
  optimization-approximation` prerequisite edge, which is a **Mode A change and
  not authorized here**. Settled in the contract; the edge is flagged for the
  owner either way.
- **Withheld deliberately:** constrained optimization and Lagrange multipliers
  ([declared off every path](../../benchmark-matrix.md#3-course-level-gap-summary));
  Newton's method and its convergence theory (P5, descoped); higher-order Taylor
  polynomials and the radius of convergence (L11 owns them — L6 states only that
  the ladder continues); l'Hôpital's rule; curve-sketching as a genre; the
  multivariable statement and saddle points (L28).
