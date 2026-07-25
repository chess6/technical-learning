# Insight Discovery Brief — Eigenvectors, Eigenvalues & Diagonalization (L11)

Stage 1 of the [Insight Discovery Gate](../../../../authoring/insight-discovery-gate.md).
Spine row: [L11 `eigenvectors`](../../course-spine.md#2-the-spine-at-a-glance).

> **Run retrospectively, and honestly labelled as such.** L11 was built before the
> gate existed and was later expanded to the full spine node; its
> [mastery contract](mastery-contract.md) recorded "there is no Stage 1–2 artifact"
> as an open debt. This brief and the [contract](insight.md) discharge that debt by
> running the search properly — not by transcribing what shipped. Where the audit
> disagrees with the built lesson it says so, and the findings are carried into the
> mastery contract rather than smoothed over.
>
> **Anti-anchoring.** The spine's one-liner ("directions a map merely *scales*;
> diagonalizing picks the basis (L10) in which the map is pure scaling") and the
> built lesson's own framing are **inherited hypotheses**. They appear below as
> leads R1 and R4 and must beat the rivals under the same criteria. §1d states
> what would have made a different package win.

---

## 1a. Diagnose the cognitive obstacle

Two obstacles, layered.

**Primary — missing purpose.** The conventional opening ("a nonzero \(\mathbf{v}\)
with \(A\mathbf{v}=\lambda\mathbf{v}\)") states a condition no learner has any
reason to want. Nothing earlier in the course asked for a vector that a map merely
scales, so the definition arrives as an arbitrary demand and the machinery that
follows is executed without a goal.

**Secondary — missing structure in the *search*.** Even a learner who accepts the
definition cannot see why the hunt should involve a **determinant**. "Find the
directions that are only scaled" is a question about infinitely many directions;
\(\det(A-\lambda I)=0\) is a polynomial in one unknown. The conventional
presentation asserts the bridge instead of deriving it, so the characteristic
equation reads as a trick.

**Tertiary — an incorrect prior mental model** at the multiplicity stage: a
repeated root is read as a fact ("\(\lambda\) appears twice, so there are two
directions") rather than as an unanswered question.

The difficulty is partly **representational** — the object of study is an
invariant *line*, and matrix entries do not show lines — so
[§1c](#1c-conventional-vs-alternative-presentation) is triggered.

"Eigenvalues are abstract" would be the wrong diagnosis: the arithmetic is easy
and the picture is available. What is missing is a reason to look and a reason the
determinant answers.

---

## 1b. Raw leads (12 leads, unranked)

| # | Lead | Mechanism |
| --- | --- | --- |
| R1 | Eigenvectors are the directions a map merely **scales**; a matrix that looks like mixing is scaling seen in the wrong coordinates. *(inherited)* | representational change |
| R2 | The hunt is not for \(\mathbf{v}\) but for \(\lambda\): \(\lambda\) qualifies exactly when \(A-\lambda I\) **collapses**, and L7 already detects collapse. The search over directions becomes a search for roots. | predictive/causal reorganization |
| R3 | An eigenspace **is a null space**, \(\operatorname{Null}(A-\lambda I)\) — an L8 object, so it has a **dimension** L9 can compute. "How many directions?" is a rank computation, not a hunt. | structural compression |
| R4 | Diagonalization is **not a new technique**: it is L10's \(P^{-1}AP\) applied to a basis of eigenvectors. \(A = PDP^{-1}\) reads as *translate in, scale, translate back*. *(inherited)* | structural compression |
| R5 | The payoff is \(A^k\): repeated application is what one actually wants, and the eigenbasis is the only place a hundredth power is cheap — and *predictable*. | operational grounding (purpose) |
| R6 | Algebraic and geometric multiplicity are **two different counts**; the gap between them is exactly what "defective" means. A repeated eigenvalue is a fork, not a fact. | misconception repair |
| R7 | "Not diagonalizable" names **two different failures**: too few directions (defective), or no real eigenvalue at all (rotation). Collapsing them hides what went wrong. | counterexample / contrast |
| R8 | Diagonalizability and invertibility are **independent** — singular-but-diagonalizable and invertible-but-defective both exist. | counterexample |
| R9 | \(AP = PD\) is the **columns rule** (L2) read once more: \(A\) applied to each column of \(P\) is that column scaled. The factorization needs no fresh derivation. | structural compression |
| R10 | A basis is a **language**; some maps have a language in which they say almost nothing. Diagonalizing is finding the map's own coordinate system. | semantic framing |
| R11 | The lesson introduces almost **no new machinery**: \(\det=0\) (L7), null space (L8), dimension (L9), change of basis (L10). It spends four lessons rather than adding a fifth idea. | structural compression / continuity |
| R12 | Eigenvalues let you **predict without simulating**: whether a repeated process grows, settles or dies is readable from \(|\lambda|\) before any iteration. | new predicted capability |

---

## 1c. Conventional vs alternative presentation

Triggered by §1a (the obstacle is partly representational).

| | **Conventional** | **Alternative (reordered + re-represented)** |
| --- | --- | --- |
| Opening | Definition: \(A\mathbf{v}=\lambda\mathbf{v}\), \(\mathbf{v}\ne\mathbf{0}\). | Apply \(A\) to a fan of directions; watch which rays survive. |
| The hunt | "Solve \(\det(A-\lambda I)=0\)" — asserted. | "A nonzero direction can land on \(\mathbf{0}\) only if \(A-\lambda I\) collapses" — and collapse is L7's \(\det=0\). Derived. |
| Eigenspace | "The set of solutions of \((A-\lambda I)\mathbf{v}=\mathbf{0}\)." | "\(\operatorname{Null}(A-\lambda I)\) — an L8 subspace, so it has a dimension (L9)." |
| Repeated \(\lambda\) | Multiplicity defined, then a warning. | A fork: two matrices with the same repeated \(\lambda\), opposite answers, settled by one rank. |
| Diagonalization | \(A=PDP^{-1}\) stated, then verified. | L10's \([A]_B=P^{-1}AP\) in the eigenbasis; \(D\) is diagonal *because* each basis vector is only scaled (columns rule). |

**Mathematical relations preserved:** all of them — same definitions, same
characteristic equation, same factorization, same criterion. The alternative
changes *discovery order and representation*, not content.

**Easier to infer:** why a determinant appears at all; why an eigenspace has a
dimension; why \(D\)'s entries are eigenvalues and why the column/diagonal pairing
is forced; why a repeated root settles nothing.

**Meaningful goal introduced:** "which directions survive this map, and can I
describe the map using only them?" — answerable by inspection before any symbol
is manipulated.

**Likely to transfer:** yes. The reframing is "an eigen-question is a collapse
question about an auxiliary map", which is the same move used for singular values
(L14) and for any \(\det(M-\lambda I)\) argument the learner meets later.

---

## 1d. Consolidated candidate packages

Four packages. Each states one distinct before → after learner model. The
representations (invariant-line fan; two panels), the discovery engine (the
collapse search), and the guardrails (the two failure modes) support more than one
package and are deliberately **not** counted as separate insights.

### PA — "The hunt is a collapse question" *(R2, R3, R9, R11)*
- **Before:** finding eigenvectors means searching among directions for special ones.
- **After:** it means finding the finitely many \(\lambda\) that make the auxiliary
  map \(A-\lambda I\) singular; the directions then fall out as a null space I can
  already compute.
- **Minimal derivation:** \(\lambda\) an eigenvalue \(\iff\) some
  \(\mathbf{v}\ne\mathbf{0}\) with \((A-\lambda I)\mathbf{v}=\mathbf{0}\)
  \(\iff \operatorname{Null}(A-\lambda I)\ne\{\mathbf{0}\}\) \(\iff A-\lambda I\)
  singular (L6) \(\iff \det(A-\lambda I)=0\) (L7). Every link is already proved.
- **Teachability:** high — the whole chain is a re-reading of built lessons.
- **New prediction:** the number of candidate \(\lambda\) is bounded by the degree,
  so the search is finite; and if the polynomial has no real root, the search
  fails *before* any direction is examined.

### PB — "A matrix's mixing is scaling in the wrong coordinates" *(R1, R4, R10, R9)*
- **Before:** a matrix is a table that mixes coordinates; \(A=PDP^{-1}\) is a
  factorization to memorize.
- **After:** a matrix was never the map (L10) — and for most maps there is a basis
  in which the description is *nothing but independent stretches*. Mixing is an
  artifact of the coordinates you were handed.
- **Minimal derivation:** with \(P\)'s columns a basis of eigenvectors,
  \(AP\) has columns \(A\mathbf{v}_j = \lambda_j\mathbf{v}_j\), which is \(PD\);
  \(P\) is invertible because its columns are a basis, so \(A=PDP^{-1}\).
- **Teachability:** high — L10 supplies the sentence, this lesson supplies the basis.
- **New prediction:** before computing anything, the learner can say what
  \([A]_B\) *must* look like in an eigenbasis, and why swapping two columns of
  \(P\) forces swapping two diagonal entries.

### PC — "Eigenvalues are the long run" *(R5, R12)*
- **Before:** why would anyone want a direction that is merely scaled?
- **After:** because repetition is the question one actually asks of a map, and in
  the eigenbasis a hundredth power costs two scalar powers — with the largest
  \(|\lambda|\) deciding the outcome without iterating.
- **Minimal derivation:** \((PDP^{-1})^k = PD^kP^{-1}\) by \(P^{-1}P=I\) and
  associativity (L6).
- **Teachability:** high, and it is the only package that repairs the *primary*
  (missing-purpose) obstacle head-on.
- **New prediction:** growth / decay / steady state read off \(|\lambda|\).

### PD — "A repeated eigenvalue is a fork" *(R6, R7, R8)*
- **Before:** a double root gives two eigendirections; "not diagonalizable" is one
  thing; diagonalizing needs an invertible matrix.
- **After:** algebraic multiplicity counts roots, geometric multiplicity counts
  dimensions of a null space, and only the second decides anything — computed, not
  read off. Failure comes in two kinds, and neither is about \(A\)'s invertibility.
- **Minimal derivation:** \(\text{geometric}(\lambda)=n-\operatorname{rank}(A-\lambda I)\)
  (L9), and \(1\le\) geometric \(\le\) algebraic.
- **Teachability:** high — two matrices with the same repeated \(\lambda\) and
  opposite answers make the fork visible in one comparison.

*(Three genuine rivals were available, so no package was manufactured to fill a
quota. PD is the closest to a guardrail rather than a central model; it is ranked
as a package because its before/after is a real change in what the learner thinks
a repeated root **is**, not merely a caution about one.)*

---

## 1e. Ranking the strongest three

| Criterion | **PB** *(ranked 1)* | **PC** *(2)* | **PA** *(3)* | PD *(4)* |
| --- | --- | --- | --- | --- |
| 1. Surprise / inevitability | high — "the mixing was never real" | medium — plausible once stated | high — the determinant stops being a trick | medium |
| 2. Explanatory compression | **highest** — subsumes PA as its engine, PC as its payoff, PD as its guardrail | low — one consequence | high — collapses an infinite search to a finite one | low |
| 3. Transfer value | high — similarity, normal forms, SVD's two bases | medium — dynamics, Markov, stability | high — every \(\det(M-\lambda I)\) argument later | medium |
| 4. Mathematical correctness *(gate)* | exact | exact | exact | exact |
| 5. Interactive teachability | high — the eigenbasis can be *shown* to diagonalize | medium — powers are numeric, not visual | high — the collapse of \(A-\lambda I\) is visible | high |
| 6. Prerequisite fit | **exact** — spends L2, L6, L7, L8, L9, L10 and adds no new machinery | good | exact | exact (needs L9) |
| 7. Semantic / cognitive leverage | high — changes what a matrix *is*, and what "understanding a map" means | high — supplies the missing **goal** | medium — changes how to *search*, not what the object is | medium |
| 8. Abstraction-return strength | must be shown (see contract §14) | n/a | n/a | n/a |

**Ranked #1: PB.** It changes the learner's model of the object itself rather than
of a procedure, and it is the only package under which the other three become
*consequences* rather than additions: PA is how you find the basis, PD is what can
go wrong while finding it, PC is what the description buys. It also carries the
lesson's whole prerequisite load — the reason this node sits after L10 at all.

**What would have made PB lose.** If the course targeted P3/Axler-style operator
theory, the load-bearing result is the *existence* of eigenvalues and the
determinant is deliberately deferred; PA would then lead and diagonalization would
be downstream. If the course had no L10, PB would be unavailable (its sentence
would have to be built from scratch) and PC — pure payoff — would be the honest
frame. And if the built lesson could not show a basis change producing a diagonal
matrix interactively, criterion 5 would have collapsed PB to a claim.

**Where PC survives:** as the *entry*. PB is the model change; PC is why the
learner agrees to look. The discovery sequence therefore opens on PC's question
and lands PB, with PA in between.

---

## 1f. Discovery sequence for PB (discover, not tell)

1. **Watch, don't define.** Apply \(A\) to a fan of directions. Most rays swing off;
   two do not. *No definition yet.*
2. **Ask the useful question (PC's entry).** "If you had to apply this map a
   hundred times, which directions would be easy to predict?" The surviving rays
   are the only ones on which repetition is arithmetic.
3. **Make the hunt tractable (PA).** "Could you find those rays without looking?"
   A surviving ray means \(A-\lambda I\) sends something nonzero to \(\mathbf{0}\)
   — collapse, which L7 detects and L8 names. The search becomes: find the \(\lambda\),
   then take a null space.
4. **Count, don't guess (PD).** Two matrices with the same repeated \(\lambda\);
   one rank computation each; opposite answers.
5. **Change the language (PB, the landing).** Put the surviving directions in \(P\)
   and ask what L10's \([A]_B=P^{-1}AP\) must be. Each basis vector is only scaled,
   so each column carries one number. The mixing was a coordinate artifact.
6. **Spend it (PC's payoff).** \(A^k = PD^kP^{-1}\); read the long run off the
   largest \(|\lambda|\).
7. **Exit test — predict, not recall.** Given an unfamiliar matrix with a
   *repeated* eigenvalue and **no** factorization attempted, the learner predicts
   whether a diagonal description exists and names the single number that decides
   it, *before* computing \(P\). A learner who must attempt the factorization to
   find out has the procedure, not the model.

---

## Stage 1 result

`Stage 1: PASS` — PB is a genuine model-changing insight, correctly stated,
teachable at P2, ranked #1 against three genuine rivals with its losing conditions
named, and carrying a discovery sequence that ends in a predict-not-recall exit
test. It relies on a **representational** bridge (invariant lines, the eigenbasis
as a language), so Stage 2 must carry an abstraction return.

Proceed to [insight.md](insight.md).
