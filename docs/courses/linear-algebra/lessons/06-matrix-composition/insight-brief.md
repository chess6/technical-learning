# Insight Discovery Brief — Matrix Composition & Inverses (L6)

Stage 1 of the [Insight Discovery Gate](../../../../authoring/insight-discovery-gate.md).
Spine row: [L6 `matrix-composition`](../../course-spine.md#2-the-spine-at-a-glance).
Output of this brief feeds Stage 2 → [insight.md](insight.md).

Anti-anchoring note: the spine's one-liner ("apply \(B\), then \(A\) is a new map
\(AB\); an inverse *undoes* a map") is treated here as an **inherited hypothesis**
competing on equal terms, not as the answer. It appears below as lead **R2** and
is *not* the package that wins on its own.

---

## 1a. Diagnosed cognitive obstacle

Two obstacles, layered:

1. **Missing mathematical structure / procedural overload.** The row-times-column
   rule is normally introduced as an arbitrary bookkeeping recipe
   (\(c_{ij}=\sum_k a_{ik}b_{kj}\)). Nothing in the recipe says *why* rows meet
   columns, so \(AB\ne BA\), associativity, and the shape rule
   (\((m\times n)(n\times p)\)) all become separate facts to memorize.
2. **An incorrect prior mental model** imported from numbers: "multiplication is
   commutative", "every nonzero thing has a reciprocal", "\(A^{-1}\) means
   \(1/A\)", and "\((AB)^{-1}=A^{-1}B^{-1}\)". Scalar arithmetic is the learner's
   only prior model of "multiply" and "invert", and it is wrong in three places.

A third, milder obstacle: **missing purpose** — inverses look like a slower way to
do what elimination already did (L4), so the learner cannot say why the object
exists.

*Provisional-diagnosis revision (per the gate's rule).* Candidate generation below
shows obstacle 1 and obstacle 2 are not independent: both dissolve at once if the
product is *derived from where the basis lands* rather than defined by a recipe.
That is what makes package **P1** dominate.

---

## 1b. Raw leads (breadth first — 11 leads, no ranking yet)

| # | Lead | Mechanism |
| --- | --- | --- |
| R1 | The product is defined so that \((AB)\mathbf{x}=A(B\mathbf{x})\) — the matrix *of* the composite function. | operational grounding |
| R2 | "Apply \(B\), then \(A\)" is one new map; watch the plane deform twice, then once. *(inherited spine hypothesis)* | representational change |
| R3 | **Column \(j\) of \(AB\) is \(A\) applied to column \(j\) of \(B\)** — L2's columns rule fired twice; the entry recipe is a *consequence*. | structural compression |
| R4 | Order matters because "apply \(A\) to \(B\)'s columns" and "apply \(B\) to \(A\)'s columns" are different questions. Rotate-then-shear vs shear-then-rotate. | predictive reorganization |
| R5 | Associativity is free: function composition is associative, so \((AB)C=A(BC)\) needs no computation. | structural compression |
| R6 | \(A^{-1}\) is the map that **sends the basis back**: its columns are the (unique) preimages of \(\mathbf{e}_1,\mathbf{e}_2\). | representational change |
| R7 | Invertibility \(=\) no information lost \(=\) trivial null space — L5's uniqueness corollary, restated for the *map* instead of one system. | structural compression |
| R8 | Solving \(A\mathbf{x}=\mathbf{b}\) by \(\mathbf{x}=A^{-1}\mathbf{b}\): one inverse answers *every* right-hand side, where elimination answers one. | semantic/purpose grounding |
| R9 | Socks-and-shoes: \((AB)^{-1}=B^{-1}A^{-1}\) — to undo a sequence you undo it backwards. | semantic grounding |
| R10 | Computing the preimages of \(\mathbf{e}_1,\mathbf{e}_2\) by hand produces \(\frac{1}{ad-bc}\begin{bmatrix}d&-b\\-c&a\end{bmatrix}\): the formula's denominator is *the collapse detector*, met in L3/L5 and named in L7. | structural compression + forward edge |
| R11 | Matrix "multiplication" is not entrywise; the word is a false friend imported from numbers. | misconception repair |

---

## 1c. Consolidated candidate packages (4 distinct packages)

Merged by *learner model change*, not by wording.

### P1 — "Composition is the columns rule, applied twice; the inverse sends the basis back"
*(absorbs R1, R3, R4, R5, R6, R11)*

One question organizes the whole lesson: **where does the basis land?** L2 already
established that a matrix *is* the pair of images \(A\mathbf{e}_1, A\mathbf{e}_2\).
So the matrix of "do \(B\), then \(A\)" is found by asking where the basis lands
under the composite: \(\mathbf{e}_j \mapsto B\mathbf{e}_j \mapsto A(B\mathbf{e}_j)\).
Hence \(\operatorname{col}_j(AB)=A\,\operatorname{col}_j(B)\), and the
row-times-column recipe *falls out* of computing that one matrix–vector product.
Non-commutativity, associativity, the shape rule, and "not entrywise" are all
consequences of the same question. Running the question backwards — *which* input
lands on \(\mathbf{e}_j\)? — gives \(A^{-1}\) as the matrix of preimages.

### P2 — "An inverse exists exactly when nothing collapsed"
*(absorbs R6, R7, R8, R10)*

Invertibility is not about the entries; it is about whether the map loses
information. If two distinct inputs share an output, no map can undo it. That
happens exactly when the columns are dependent — L5's trivial-null-space condition
promoted from a statement about one system to a property of the *map*. Computing
the preimages surfaces \(ad-bc\) as the quantity that must be nonzero, which is
the lesson's forward edge into L7.

### P3 — "Order matters, and undoing runs backwards"
*(absorbs R4, R9, R11)*

The lesson's model change is the destruction of the scalar analogy: \(AB\ne BA\),
\((AB)^{-1}=B^{-1}A^{-1}\), \(A^{-1}\ne 1/A\), and multiplication is not entrywise.
Organized around geometric counterexamples the learner can predict and check.

### P4 — "One inverse answers every right-hand side"
*(absorbs R8)*

Purpose-first: elimination (L4) solves one system; \(A^{-1}\) solves the whole
family \(A\mathbf{x}=\mathbf{b}\) at once, so the inverse is the *reusable* answer.
Motivates the object from a genuine need.

---

## 1d. Ranking

| Rank | Package | Model-changing? | Predicts? | Teachable at level? | Verdict |
| --- | --- | --- | --- | --- | --- |
| **1** | **P1** | **Yes** — the recipe stops being a recipe. | Learner can predict any product's columns, and predict *before computing* that \(AB\ne BA\). | Yes — reuses L2 verbatim; no new machinery. | **Primary** |
| 2 | P2 | Yes — invertibility becomes a property of the map, not the entries. | Predicts non-invertibility from a picture of collapse. | Yes — reuses L5's corollary. | **Fold in as the second half of the chain** (it *is* P1 run backwards). |
| 3 | P3 | Partly — repairs misconceptions but does not *derive* anything. | Predicts counterexamples once shown one. | Yes. | **Fold in as the misconception layer**, not a spine. |
| 4 | P4 | Weakly — motivates but changes no model; and it is arguably *false* as stated (elimination is the better algorithm; the inverse is worse numerically). | Little. | Yes. | **Fold in as motivation only, with the honesty caveat.** |

**Why P1 over P2.** P2 is the more striking *statement*, but it is downstream of
P1: "which input lands on \(\mathbf{e}_j\)?" is P1's question run backwards, and
the existence of that preimage is exactly the independence condition. Leading with
P1 makes P2 inevitable; leading with P2 leaves the product rule unexplained.

**What would have made P1 lose.** If the learner did *not* already hold L2's
columns rule, P1's compression would have nothing to compress and P3
(misconception-first) would win by default. The columns rule is built and
assessed in L2 (`transformations`), so the precondition holds. P1 would also lose
if the lesson's real difficulty were computational (larger products, shape
bookkeeping) rather than conceptual — but this course is 2D and
transformation-centric, so it is not.

**Rejected as insights (recorded so they are not re-litigated):** R2 alone (a
double deformation *shows* composition but derives nothing — it is a beat, not an
insight); R9 alone (a mnemonic); R11 alone (a warning).

---

## 1e. Continuity anchors available

- `shear-2-1` — \(A=\begin{bmatrix}2&1\\0&1\end{bmatrix}\), the L2/L7 running map.
- `rotation` — \(\begin{bmatrix}0&-1\\1&0\end{bmatrix}\), for the order counterexample.
- `singular-collapse` — \(\begin{bmatrix}2&4\\1&2\end{bmatrix}\), the non-invertible case
  already used in L2/L7 and foreshadowed in L5.
- `systems-default` — L3's system, for "solve it again with \(A^{-1}\)".

Using `shear-2-1` as the lesson's \(A\) means L7 later reads the determinant of
*this same map* — the spine's continuity requirement, satisfied for free.

---

Stage 1 result: **proceed to Stage 2 with P1 as the primary candidate**, P2 folded
in as the second half of the causal chain, P3 as the misconception layer, and P4
as motivation with a stated honesty caveat.
