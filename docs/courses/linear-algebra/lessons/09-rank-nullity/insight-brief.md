# Insight Discovery Brief — Dimension & Rank–Nullity (L9)

Stage 1 of the [Insight Discovery Gate](../../../../authoring/insight-discovery-gate.md).
Spine row: [L9 `rank-nullity`](../../course-spine.md#2-the-spine-at-a-glance).

Anti-anchoring note: the spine's one-liner ("input dimensions either survive into
the output or disappear into the null space") is an **inherited hypothesis** and
appears below as lead R3. It must beat the rivals, not be assumed.

---

## 1a. Diagnose the cognitive obstacle

**Missing purpose**, and a specific, unusual one: *the result looks too obvious to
be worth a name.*

L8 already observed \(\operatorname{rank}A + \dim\operatorname{Null}(A) = n\) from
the pivot/free split, and the learner accepted it without difficulty. That is the
danger. Stated as arithmetic — "each column is either a pivot column or a free
column, and there are \(n\) columns" — it is a tautology about bookkeeping, and a
learner who receives it that way will not *use* it. They will recompute both
numbers every time instead of deriving one from the other, and they will not
recognize the situations the law forbids.

Secondary obstacle: **inability to predict / transfer**. The learner cannot yet
answer questions of the form "can a map from \(\mathbb{R}^3\) to \(\mathbb{R}^2\)
be one-to-one?" without constructing an example, even though the law settles it
instantly.

"Students find the proof hard" would be the wrong diagnosis. The proof is short.
The problem is that the statement arrives without a job.

---

## 1b. Raw leads (9 leads)

| # | Lead | Mechanism |
| --- | --- | --- |
| R1 | Each column is a pivot column or a free column; the counts add to \(n\). *(the tautology)* | structural |
| R2 | Rank and nullity are not two independent measurements — measure one, and the other is determined. | predictive reorganization |
| R3 | **Conservation:** input dimensions are neither created nor destroyed; each either survives into the image or disappears into the null space. *(inherited)* | semantic/operational grounding |
| R4 | The law **forbids** things: no map from \(\mathbb{R}^3\) to \(\mathbb{R}^2\) is one-to-one; no square map is onto-but-not-one-to-one. | predictive reorganization |
| R5 | It explains L3's trichotomy structurally rather than case-by-case. | structural compression |
| R6 | Dimension itself needs defining — "number of vectors in a basis", well-defined because all bases have the same size. | missing definition |
| R7 | The proof is a *bijection between free variables and null-basis vectors*. | operational grounding |
| R8 | Geometric multiplicity of an eigenvalue is \(n - \operatorname{rank}(A - \lambda I)\) — the law computing something the learner will need. | forward connection |
| R9 | A ledger/accounting picture: \(n\) dimensions in, each posted to one of two columns, totals must balance. | representational change |

---

## 1c. Consolidated candidate packages

### P1 — "Conservation: nothing goes missing" *(R3, R9, R7)*
The identity is not bookkeeping about columns; it is a statement that a linear map
*cannot lose track of a dimension*. Each of the \(n\) input dimensions has exactly
one fate — survive into the image, or collapse into the null space — and the proof
is precisely a one-to-one matching between the two fates and the two bases.
Represented as a ledger that must balance.

### P2 — "The law forbids things" *(R2, R4, R5)*
The model change is that rank and nullity stop being two things to compute and
become **one** thing: measure either and the other follows. That immediately rules
out whole classes of maps, and settles questions the learner currently answers by
trial.

### P3 — "Dimension is well defined" *(R6)*
The prerequisite the course has been using informally since L1: every basis of a
given space has the same number of vectors, so "dimension" is a property of the
space rather than of a chosen basis.

### P4 — "It computes eigen-multiplicities" *(R8)*
Purpose by forward payoff: the law is how you find out whether a repeated
eigenvalue has one eigendirection or a plane of them.

---

## 1d. Ranking

| Rank | Package | Model-changing? | Predicts? | Teachable? | Verdict |
| --- | --- | --- | --- | --- | --- |
| **1** | **P1** | **Yes** — converts a tautology into a law with a mechanism. | Predicts one count from the other, and *why* it must hold. | Yes; the proof is short and is the content. | **Primary** |
| 2 | P2 | Yes — and it is the *evidence* that P1 changed anything. | Strongly: rules out impossible maps. | Yes. | **Fold in as the licensing/forbidding half** — P1 without P2 is a slogan. |
| 3 | P3 | No — necessary, not illuminating. | — | Yes, briefly. | **Fold in as the definitional prerequisite**, stated with the well-definedness result as `reference`. |
| 4 | P4 | No — a payoff, not an insight. | — | Yes. | **Fold in as the forward edge** into L11. |

**Why P1 over P2.** P2 is the more useful package, but it is a *consequence*: you
can only be sure the law forbids something if you know why it holds. Leading with
P2 gives the learner a rule to apply; leading with P1 gives them the reason, and
P2 follows in a sentence. Leading with P1 also directly attacks the diagnosed
obstacle (the result feels too obvious), because conservation reframes the
"obvious" arithmetic as a claim that could have been false.

**What would have made P1 lose.** If L8 had *not* already established both counted
objects, P1 would be premature and P3 (define dimension first) would have to lead.
L8 is built and does establish them. P1 would also lose if the course never used
non-square maps — conservation is invisible when \(m = n\) and rank is the only
free parameter — so the lesson commits to \(m \ne n\) examples, which is also what
makes P2's forbidden cases available.

**Rejected:** R1 alone (the tautology — this is the *failure mode*, not a
candidate); R8 alone (a payoff).

---

## 1e. Design consequence recorded here

The lesson must use **non-square** maps as first-class examples, not as an
afterthought. With \(m = n\) the law degenerates into "rank determines nullity",
which the learner can also get from L8's pivot count, and none of P2's forbidden
cases arise. The \(2\times3\) and \(3\times2\) cases are where the law does work
the learner cannot do otherwise.

---

Stage 1 result: **proceed to Stage 2 with P1 primary**, P2 folded in as the
forbidding/licensing half, P3 as the definitional prerequisite, P4 as the forward
edge.
