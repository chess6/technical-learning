# Insight Discovery Brief — Subspaces, Column Space, Null Space, Rank (L8)

Stage 1 of the [Insight Discovery Gate](../../../../authoring/insight-discovery-gate.md).
Spine row: [L8 `subspaces-rank`](../../course-spine.md#2-the-spine-at-a-glance).

Anti-anchoring note: the spine's one-liner ("column space controls possible
outputs; null space controls non-uniqueness; rank counts independent output
directions") is an **inherited hypothesis**. It appears below as leads R1/R2/R6
and must win on the same criteria as every rival.

---

## 1a. Diagnose the cognitive obstacle

**Missing purpose**, compounded by **missing structure**.

Subspaces are conventionally introduced axiomatically — "a subset closed under
addition and scalar multiplication, containing \(\mathbf{0}\)" — and the learner
is then asked to verify the axioms for sets that arrive from nowhere. Nothing in
that presentation says *why anyone would name these particular sets*, so
"column space", "null space", and "rank" read as three more definitions rather
than as answers.

The sharper diagnosis, and the one that steers the search: **the learner has
already been computing with both spaces for five lessons without a name for
either.** L3 asked "is \(\mathbf{b}\) reachable?" (a column-space question) and
"how many solutions?" (a null-space question) and answered both with
elimination. L5 named \(\operatorname{Null}(A)\) but treated it as *the solution
set of the homogeneous system* — a by-product of a procedure — not as a property
of the map. L6 and L7 said "the plane collapsed" repeatedly with no vocabulary
for *how much* collapsed. The obstacle is therefore not difficulty; it is that
the names arrive **after** their use, so they feel redundant.

*Provisional-diagnosis revision:* candidate generation confirmed the obstacle is
**purpose, not abstraction**. Learners at this point can compute everything L8
asks; what they cannot do is say what question each computation answers.

---

## 1b. Raw leads (10 leads, unranked)

| # | Lead | Mechanism |
| --- | --- | --- |
| R1 | Column space = the set of reachable outputs = span of the columns. *(inherited)* | structural compression |
| R2 | Null space = the set of crushed inputs; it is what makes solutions non-unique. *(inherited)* | structural compression |
| R3 | **Every question asked about a matrix in L3–L7 was secretly about one of two designated spaces**: one in the output (existence), one in the input (uniqueness). *(Two, because solving has exactly two failure modes — not because a map has only two subspaces; see R9.)* | predictive reorganization |
| R4 | Rank = how many independent directions survive the map — the *output* dimension, countable by pivots. | representational change |
| R5 | Subspace = "flat through the origin"; the closure axioms are just *why* it must contain the origin and stay flat. | semantic grounding |
| R6 | Rank counts pivots; the pivot columns of \(A\) are a basis for the column space. *(inherited)* | operational grounding |
| R7 | Collapse has *degrees*: \(\mathbb{R}^3 \to\) plane \(\to\) line \(\to\) point. L6/L7's binary "collapsed or not" was a two-dimensional accident. | representational change |
| R8 | The two spaces live in **different places** — \(\operatorname{Null}(A)\subseteq\mathbb{R}^n\) (inputs), \(\operatorname{Col}(A)\subseteq\mathbb{R}^m\) (outputs). Confusing them is the central error. | misconception repair |
| R9 | Row space and its rank equal the column rank — the surprising symmetry. (Also the reminder that the row space and \(\operatorname{Null}(A^{\mathsf T})\) exist: the map's subspaces are not exhausted by the two P1 selects.) | structural compression |
| R10 | \(\det \ne 0\) is the *extreme case* of rank: "every dimension survived". | connection to L7 |

---

## 1c. Consolidated candidate packages

### P1 — "Two spaces decide it, and you have been using both all along"
*(absorbs R1, R2, R3, R8)*

The model change is **retrospective**: the learner re-reads five lessons of their
own work and discovers that "reachable?" was always a question about a subspace
of the *output* space, and "unique?" was always a question about a subspace of
the *input* space. The names are then not new objects but labels for machinery
already in hand — and the fact that the two spaces live in different vector
spaces becomes the organizing distinction rather than a footnote.

### P2 — "Collapse has degrees, and rank counts them"
*(absorbs R4, R6, R7, R10)*

L6 and L7 only ever said *collapsed / not collapsed*, because in \(\mathbb{R}^2\)
there is nothing between "a line" and "everything". Move to \(\mathbb{R}^3\) and
the binary becomes a count: 3, 2, 1, 0 surviving dimensions. Rank is that count,
it is readable off the pivots, and \(\det\ne0\) is just its top value.

### P3 — "A subspace is a flat through the origin"
*(absorbs R5)*

Repairs the axiomatic presentation: the closure conditions are not arbitrary
tests but exactly what forces a set to be a flat (line/plane/…) passing through
the origin — which is why a solution set that misses the origin (L5's affine
set) is *not* a subspace.

### P4 — "Row rank equals column rank"
*(absorbs R9)*

The genuinely surprising theorem of the topic.

---

## 1d. Ranking

| Rank | Package | Model-changing? | Predicts? | Teachable here? | Verdict |
| --- | --- | --- | --- | --- | --- |
| **1** | **P1** | **Yes** — reorganizes five lessons of prior work under two headings. | Learner can classify any new question as existence or uniqueness *before* computing. | Yes; needs no new machinery. | **Primary** |
| 2 | P2 | Yes — turns a binary into a count. | Predicts the shape of the image from the pivot count. | Yes, but **requires leaving \(\mathbb{R}^2\)** — this is the lesson's real cost. | **Fold in as the quantitative half of the chain** (it is what makes P1's "how much survived?" answerable). |
| 3 | P3 | Partly — repairs a definition. | Little. | Yes. | **Fold in as the definitional layer + the affine-vs-subspace misconception.** |
| 4 | P4 | Yes, but it is a *result*, not an organizing insight, and its proof is out of scope at P2. | — | Statement yes, proof no. | **State as a `reference` result; do not build the lesson on it.** |

**Why P1 over P2.** P2 is more visual and more fun, but a learner who only gets
P2 can count dimensions without knowing which question the count answers. P1
supplies the questions; P2 supplies the numbers. Leading with P1 makes rank feel
demanded rather than introduced.

**What would have made P1 lose.** If the learner did *not* already have five
lessons of column/null-space work to re-read, P1's compression would have nothing
to compress and P3 (definition-first) would win by default. Since L3, L5, L6 and
L7 are all built and all use both spaces informally, the precondition holds. P1
would also lose if this lesson were the learner's *first* encounter with
solvability — it is not.

**Rejected as insights:** R9 alone (a theorem, not an organizing idea); R10 alone
(a connection); R5 alone (a repaired definition).

---

## 1e. The dimensionality decision (recorded here because it shapes everything)

L8 is the first lesson whose content genuinely wants \(\mathbb{R}^n\). In
\(\mathbb{R}^2\) the column space can only be \(\{\mathbf 0\}\), a line, or the
plane, so "rank" has three values and two of them are degenerate — the concept
cannot be felt.

**Decision: teach in \(\mathbb{R}^3\), drawn honestly.** A \(3\times3\) map
collapsing the unit cube onto a *plane* is the smallest picture in which rank 2
is a real, visible, non-degenerate outcome, and in which the null space is a
visible line inside a 3-D input space. The guided scene therefore renders 3-D
geometry under a stated isometric projection rather than pretending the plane is
enough. \(\mathbb{R}^2\) examples are retained for continuity (the same
`singular-collapse` map the learner already knows) but are explicitly labelled as
the degenerate corner of the general picture.

This discharges the abstraction-return deferrals recorded by the L6 mastery
contract and the L7 deepening, both of which named L8 as owner.

---

Stage 1 result: **proceed to Stage 2 with P1 as primary**, P2 folded in as the
quantitative half of the chain, P3 as the definitional/misconception layer, and
P4 stated but not built upon.
