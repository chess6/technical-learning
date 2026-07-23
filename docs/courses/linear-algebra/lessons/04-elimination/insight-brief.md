# Insight Discovery Brief — Elimination (retrospective)

Stage 1 of the [Insight Discovery Gate](../../../../authoring/insight-discovery-gate.md).
**Retrospective**: authored after the lesson (`src/lessons/elimination.ts`) was
built. Diagnoses the obstacle, generates and clusters candidates, ranks them, and
hands the winner to the [contract](insight.md). Records what could have unseated the
winner.

Continuity anchor: the running system is Lesson 3's — \(A=\begin{bmatrix}1&3\\2&-1\end{bmatrix}\),
\(\mathbf{b}=(-1,5)\), solution \((2,-1)\). The learner watches a computation they
have already solved get *rewritten*, not re-solved.

---

## 1a. Diagnosed cognitive obstacle

An **incorrect prior mental model** plus **missing purpose**: elimination is
learned as "a bag of arithmetic tricks" — memorized Gaussian steps you apply until
the numbers work out — with no account of *why* changing the equations does not
change the answer. Learners cannot say which moves are legal, why, or what could go
wrong. Secondary: **an unhelpful representation** — the augmented-matrix bookkeeping
hides the geometric fact that the manipulated line pivots about the fixed solution.

This is representational/operational, so Stage 1c is triggered.

## 1b. Candidate leads (raw → clustered)

Raw leads:

1. Each row op is *reversible* → nothing can be created/lost / operational + structural.
2. \(R_2\to R_2-2R_1\) pivots the second line about the fixed crossing \((2,-1)\) →
   representational (the added multiple is \(0=0\) at the solution).
3. Two systems are *equivalent* when they share a solution set → definitional reframe.
4. The three elementary operations all share one property (reversibility) → compression.
5. Scaling by \(0\) is the one illegal move — it is exactly the irreversible one →
   the guardrail *derives* the legality rule.
6. Triangular form makes back-substitution trivial → procedural payoff.
7. Elimination exposes inconsistency as a contradiction row \(0=c\ (c\neq0)\) →
   connects to L3's "no solution."
8. The multiplier is \(-(\text{entry below pivot})/(\text{pivot})\) → procedure.

Clustered candidate packages:

- **P1 — reversibility is the license.** Central model: a row operation *replaces*
  the constraints with different constraints having exactly the same solution set,
  and the reason is that every operation is **reversible** — so none can add or
  delete a solution. Legality (why scaling by \(0\) is banned) and the fixed-point
  picture follow. Leads 1, 3, 4, 5 (+2 as its picture).
- **P2 — the pivot picture.** Central model: the manipulated line pivots about the
  fixed solution because the change added is \(0=0\) there. Leads 2, 7.
- **P3 — triangularize-and-read.** Central model: elimination is a procedure that
  drives the system to triangular form so you can read the answer. Leads 6, 8.

## 1c. Conventional vs alternative (operational/representational)

| | Conventional | Alternative (reversibility license) |
| --- | --- | --- |
| Row op | a step in a recipe | a *reversible* replacement of an equation |
| Why legal | "the textbook says so" | its inverse undoes it ⇒ solution set unchanged |
| Illegal move | "don't scale by 0" (rule) | scaling by 0 is *the* irreversible op (derived) |
| Picture | matrix bookkeeping | the line pivots about the fixed solution |

**Preserved relations:** the solution set across every step. **Easier to infer:**
which moves are safe and why; why \(0\)-scaling breaks. **Introduced:** equivalent
systems; reversibility as the invariant. **Transfers:** yes — determinant behavior
under row ops (L7), LU/rank via pivots (L6/L8).

## 1d. Ranking

| Package | Surprise→inevitability | Compression | Transfer | Correctness | Teachability | Prereq fit | Leverage |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **P1 reversibility** | high | high | high | exact | high (predict + self-check proof) | excellent (L3) | high |
| P2 pivot picture | high | med | med | exact | high (visual) | good | med |
| P3 triangularize | low | low | med | exact | high | good | low (procedural) |

**Winner: P1 — reversibility is the license**, because it *derives* everything the
others assert: the pivot picture (P2) is P1's proof drawn (the change is \(0=0\) at
the solution *because* \(R_1\) holds there, and reversibility is why nothing is
gained); the triangularization procedure (P3) is P1 applied repeatedly; and the
legality rule (ban \(0\)-scaling) falls out as "the one irreversible move." P2 alone
is a beautiful picture without the general license; P3 alone is the "bag of tricks"
the lesson exists to dispel.

**What could have unseated P1:** if the three operations did *not* all reduce to one
reversibility property (they do), or if the fixed-point picture (P2) generalized to
\(n\) variables more cleanly than the algebraic license (it does not — reversibility
is dimension-free, the 2-line pivot is 2D). Either would have promoted P2.

## Discovery sequence (discover, not tell)

1. **Commit a prediction first** (before any operation is shown): apply
   \(R_2\to R_2-2R_1\); what happens to the solution \((2,-1)\)?
2. Watch \(R_2\to R_2-2R_1\) pivot the second line about the fixed crossing, in
   equations + augmented matrix + lines synchronized.
3. Name the three operations; check each is reversible.
4. Run one forward elimination to triangular form; back-substitute.
5. Break it: scale a row by \(0\); watch a constraint vanish, unrecoverably.
6. **Predict-not-recall exit:** in your own words, why does \(R_2\to R_2+kR_1\)
   never change the solution set? (self-check against a model answer).

## Rejected as non-insights

- "Steps of Gaussian elimination" as a memorized recipe; "reduced row echelon form"
  as a definition to recite; a themed story about "balancing" equations (zero leverage).

`Stage 1 result: PASS → advance to Stage 2 with P1 (reversibility is the license).`
