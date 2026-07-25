# Insight Discovery Brief — Change of Basis (L10)

Stage 1 of the [Insight Discovery Gate](../../../../authoring/insight-discovery-gate.md).
Spine row: [L10 `change-of-basis`](../../course-spine.md#2-the-spine-at-a-glance).

Anti-anchoring note: the spine's line ("the *same* vector/map wears different
coordinates in a different basis") is an **inherited hypothesis**, entered below
as R1/R2. It competes on the same terms as the rest.

---

## 1a. Diagnose the cognitive obstacle

**Misleading notation**, compounded by an **incorrect prior mental model**.

Nine lessons have written vectors as \((4,1)\) and maps as \(\begin{bmatrix}3&1\\0&2\end{bmatrix}\)
with no annotation, so the learner has silently come to believe those *are* the
objects. L1 did say coordinates are a choice, but nothing since has required the
distinction, so it has decayed into a slogan. The notation is the culprit: an
unlabelled column of numbers looks like a vector, not like a *description of* a
vector relative to a basis that was never mentioned.

The consequence is that "change of basis" sounds like an operation performed *on
a vector* — as if the vector moves. It does not. What changes is the description.
Until that is fixed, \(P^{-1}AP\) is uninterpretable and diagonalization can only
be memorized.

Secondary: **procedural overload risk.** There are three easily-confused objects
(\(P\), \(P^{-1}\), \(P^{-1}AP\)) and a direction convention that most learners
get backwards at least once.

---

## 1b. Raw leads (10)

| # | Lead | Mechanism |
| --- | --- | --- |
| R1 | The same vector has different coordinates in different bases. *(inherited)* | representational change |
| R2 | The same map has different matrices in different bases. *(inherited)* | representational change |
| R3 | **A matrix is not a map; it is a map's description relative to a chosen basis** — and the basis has been the standard one, silently, since Lesson 2. | predictive reorganization |
| R4 | \(P\) (new basis vectors as columns) translates B-coordinates *into* standard coordinates; \(P^{-1}\) goes the other way. Direction is the whole difficulty. | operational grounding |
| R5 | \(P^{-1}AP\) is a **sentence**: translate into standard, act, translate back. Read right to left, exactly as L6 taught. | structural compression |
| R6 | Choosing a basis is choosing a **language**; some sentences are shorter in some languages. | semantic grounding |
| R7 | In the right basis a map becomes diagonal — the point of the whole exercise. | forward payoff |
| R8 | Similar matrices share rank, determinant, trace, eigenvalues — those are properties of the *map*, not of the description. | structural compression |
| R9 | The grid itself can be redrawn: the same arrow read against two different grids. | representational change |
| R10 | Coordinates in B are the solution of \(P\mathbf{c} = \mathbf{x}\) — a Lesson 3 system, nothing new. | operational grounding |

---

## 1c. Consolidated packages

### P1 — "A matrix was never the map; it was a description in a basis you were never told about" *(R3, R1, R2, R9)*
The model change is retrospective and slightly unsettling: every matrix the
learner has written for nine lessons carried a hidden subscript. Naming the
hidden choice makes "the same object, two descriptions" the default reading and
makes a *change* of basis a change of description, never a change of object.

### P2 — "\(P^{-1}AP\) is a three-word sentence" *(R4, R5, R10)*
The model change is that the sandwich stops being a formula to memorize and
becomes a composition to read: translate → act → translate back, right to left as
in L6. \(P\)'s direction is pinned by construction (its columns are the new basis
vectors *written in standard coordinates*), so it converts B-coords to standard.

### P3 — "Choose the language that makes the sentence short" *(R6, R7)*
Purpose-first: bases are chosen, so choose a good one. In the eigenbasis the
matrix is diagonal, and \(A^k\) becomes trivial.

### P4 — "What survives translation is the map" *(R8)*
Similar matrices share determinant, rank, trace, eigenvalues; those are the
basis-independent facts.

---

## 1d. Ranking

| Rank | Package | Model-changing? | Predicts? | Teachable? | Verdict |
| --- | --- | --- | --- | --- | --- |
| **1** | **P1** | **Yes** — reinterprets nine lessons of notation. | Learner expects two descriptions and asks "in which basis?" unprompted. | Yes; reuses L1's data exactly. | **Primary** |
| 2 | P2 | Yes — and it is what makes P1 *operational*. | Predicts the direction of each conversion. | Yes; it is L6's composition read once more. | **Fold in as the mechanism.** |
| 3 | P3 | Partly — it is the motive, not the reorganization. | Predicts that a good basis simplifies. | Yes. | **Fold in as motivation + the forward edge to L11.** |
| 4 | P4 | Yes, but it depends on P1 to be sayable at all. | Predicts invariants. | Yes, lightly. | **Fold in as the closing synthesis**, stated for det/rank/eigenvalues without proof. |

**Why P1 over P2.** P2 is where the errors happen, so it is tempting to lead
with it. But a learner who does not first believe that the *object* is unchanged
has no way to tell which direction \(P\) should go — they will try to remember
rather than derive. P1 supplies the invariant (the object) against which P2's
directions can be checked.

**What would have made P1 lose.** If the course had been annotating coordinates
with their basis all along, the hidden-subscript reveal would land on nothing and
P2 (the mechanics) would have to lead. It has not: every matrix since L2 is
unannotated, which is exactly what makes the reveal available. P1 would also lose
if the lesson had no *second* basis the learner already trusts — but L1 built
\(B = (\mathbf{v},\mathbf{w})\) with worked coordinates, so the second language is
already familiar and does not have to be introduced at the same time as the idea.

**Rejected:** R7 alone (a payoff), R8 alone (a list of invariants), R6 alone (a
metaphor that changes no inference by itself).

---

## 1e. Continuity decision recorded here

The lesson **reuses Lesson 1's numbers exactly**: \(B = ((1,2), (3,-1))\),
\(\mathbf{p} = (4,1)\) with \([\mathbf{p}]_B = (1,1)\), and \(\mathbf{q} = (-1,5)\)
with \([\mathbf{q}]_B = (2,-1)\). L1 already worked those coordinates by hand, so
the learner meets no new arithmetic while the *interpretation* changes — which is
precisely the condition for a representational insight to be visible.

For the map half it reuses `eigen-distinct` \(A = \begin{bmatrix}3&1\\0&2\end{bmatrix}\),
the matrix Lesson 11 uses, whose eigenbasis gives \(P^{-1}AP = \operatorname{diag}(3,2)\).
So the diagonalization payoff lands on the exact matrix the next lesson opens on.

---

Stage 1 result: **P1 primary**, P2 as the mechanism, P3 as motive and forward
edge, P4 as the closing synthesis.
