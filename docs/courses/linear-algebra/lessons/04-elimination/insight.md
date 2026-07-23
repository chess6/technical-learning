# Approved Insight Contract — Elimination: Rewriting a System Without Changing Its Answer

Stage 2 of the [Insight Discovery Gate](../../../../authoring/insight-discovery-gate.md).
**Retrospective** contract for the built lesson (`src/lessons/elimination.ts`).
Selects the primary breakthrough from the Stage 1 [brief](insight-brief.md),
verifies its chain, and runs Audit A (mathematical) and Audit B (grounding &
model-change; the bridge here is operational + representational).

Primary insight selected: **P1 — reversibility is the license.** Each elementary row
operation *replaces* the constraints with different ones having exactly the same
solution set, and the reason is that every operation is **reversible** — its inverse
undoes it, so no solution can be created or destroyed.

Notation: augmented matrix \([A\mid\mathbf{b}]\); row operations \(R_i\leftrightarrow
R_j\), \(R_i\to kR_i\ (k\neq0)\), \(R_i\to R_i+kR_j\); column vectors; KaTeX. Running
example: L3's \(A=\begin{bmatrix}1&3\\2&-1\end{bmatrix}\), \(\mathbf{b}=(-1,5)\),
solution \((2,-1)\); dependent foil \((1,2),(2,4)\) for the contradiction row.

---

## Primary insight (required contents 1–11)

### 1. Diagnosed cognitive obstacle
From Stage 1a: an **incorrect prior mental model** ("elimination is arithmetic
tricks") and **missing purpose** (no account of *why* rewriting the equations
preserves the answer).

### 2. Insight mechanism(s)
**Operational grounding** (each row op is a *reversible* move), **representational
change** (the manipulated line pivots about the fixed solution), and **structural
compression** (all three operations, and the one illegal move, reduce to a single
reversibility property). No real-world grounding.

### 3. Initial mental model
"You apply memorized steps to the numbers until they simplify; the triangular system
at the end is a lucky by-product, and I just have to trust the answer is still right."

### 4. Tension / redundancy
The learner has already solved \(x+3y=-1,\ 2x-y=5\) (L3) and knows the answer is
\((2,-1)\). Elimination visibly *changes the equations* (\(R_2\) becomes \(-7y=7\)).
Why is the answer to the new system the same as the old one? The naive "tricks"
model has no answer — it cannot distinguish a legal move from an illegal one.

### 5. The model change (what the learner now believes instead)
A row operation does not "simplify numbers"; it **replaces the current constraints
with different constraints that have exactly the same solution set**. Two systems
are **equivalent** when they share a solution set. Every elementary operation is
**reversible** — swap undone by swapping back, scale by \(k\neq0\) undone by
\(1/k\), \(R_i\to R_i+kR_j\) undone by \(R_i\to R_i-kR_j\) — and reversibility is
exactly the guarantee that no solution is created or lost. Forward elimination is
just a sequence of such safe rewrites reaching a **triangular** system you can read
off; the one forbidden move (scaling by \(0\)) is precisely the one that is
irreversible.

### 6. Full causal chain (no missing steps)
- **(a) The augmented matrix.** Pack \([A\mid\mathbf{b}]\) so one operation acts on a
  whole equation — coefficients and right-hand side together.
- **(b) No solution is lost.** If \((x,y)\) satisfies the old \(R_1\) and \(R_2\),
  it satisfies any linear combination of them; so it satisfies the new
  \(R_2'=R_2+kR_1\) (and \(R_1\) is unchanged). Every old solution is a new solution.
- **(c) No solution is gained.** The move is reversible by \(R_2\to R_2-kR_1\); by
  the same argument every new solution is an old solution. The two solution sets
  contain each other ⇒ **equal**. Swap reorders equations (same set); scale by
  \(k\neq0\) is reversible by \(1/k\) — identical argument.
- **(d) The pivot picture (the proof, drawn).** At the solution \((2,-1)\), \(R_1\)
  is a true equation, so \(-2R_1\) contributes \(0=0\) there. Adding it to \(R_2\)
  moves the line but *not* through the fixed point — the second line **pivots about
  \((2,-1)\)**. That the point does not move *is* the invariance theorem in one image.
- **(e) Forward elimination + back-substitution.** Using \(R_1\) as pivot, the
  multiplier is \(-(\text{entry below pivot})/(\text{pivot})=-2\): \(R_2\to R_2-2R_1\)
  gives \((0,-7\mid7)\), i.e. \(-7y=7\Rightarrow y=-1\), then \(x=2\). Same answer as
  L3, now *read off* a triangular system.
- **(f) The one illegal move.** Scaling \(R_2\) by \(0\) turns it into \(0=0\): the
  constraint is **erased** and cannot be divided back — irreversible. A one-solution
  system can suddenly appear to have a whole line. Legality = reversibility.
- **(g) Inconsistency surfaced.** On dependent columns \((1,2),(2,4)\) with
  \(\mathbf{b}\) off their line, elimination produces a contradiction row \(0=c\
  (c\neq0)\) — the algebraic certificate of L3's "no solution."

### 7. Minimal formal derivation
**Theorem (invariance).** If \(S'\) is obtained from \(S\) by one elementary row
operation, then \(\operatorname{Sol}(S')=\operatorname{Sol}(S)\).
*Proof.* Each elementary operation \(E\) has an inverse elementary operation
\(E^{-1}\) (swap↔swap, \(\times k\)↔\(\times\tfrac1k\), \(+kR_j\)↔\(-kR_j\)). Any
solution of \(S\) satisfies every linear combination of its equations, hence
satisfies \(E(S)\); so \(\operatorname{Sol}(S)\subseteq\operatorname{Sol}(E(S))\).
Applying the same to \(E^{-1}\) gives \(\operatorname{Sol}(E(S))\subseteq
\operatorname{Sol}(E^{-1}(E(S)))=\operatorname{Sol}(S)\). Hence equality.
\(\blacksquare\) (Scaling requires \(k\neq0\) for \(E^{-1}\) to exist — this is
where the hypothesis is used.)

### 8. Equivalence to the original object
Elimination changes the *representation* of the system, never its solution set: the
triangular system \(\{x+3y=-1,\ -7y=7\}\) has **exactly** the solutions of
\(\{x+3y=-1,\ 2x-y=5\}\), namely \(\{(2,-1)\}\). Nothing is approximated or
normalized away; back-substitution recovers the identical answer L3 found.

### 9. Cost / model change (which inferences it licenses)
**Licenses:** predict that a legal row operation leaves the solution fixed; justify
elimination as trustworthy (not a shortcut); *diagnose* an illegal move by testing
reversibility; recognize the contradiction row as "no solution."
**Does NOT license (guardrails):** treating scaling-by-\(0\) or "add a row to
itself" as legal; assuming the triangular system is an *approximation*; assuming
reversibility says anything about *how many* solutions there are (it preserves
whatever count already held — existence/uniqueness is L3/L5).

### 10. What the learner can predict or do afterward (without being told)
- Predict that \(R_2\to R_2-2R_1\) leaves \((2,-1)\) fixed, and say why.
- Choose the operation that clears \(x\) from \(R_2\) and compute the resulting matrix.
- Diagnose which of a list of moves is illegal (scale by \(0\)) and why.
- Construct a \(\mathbf{b}\) that yields a contradiction row (no solution).
- Explain the invariance in both directions (nothing lost / nothing gained).

### 11. Transfer assessment
- **Determinant under row operations (L7)** — *exact* mechanism (each op's effect on
  \(\det\) is dictated by the same three moves).
- **LU factorization / Gaussian elimination in \(\mathbb{R}^n\)** — *exact*: the same
  reversible moves, more rows.
- **Rank via pivots (L8)** — *exact*: pivots counted after elimination.
- **Solution-set structure (L5)** — *exact*: elimination computes \(\mathbf{x}_p\)
  and the free-variable directions the next lesson organizes.
- **Elementary matrices** — *exact structural*: each op is left-multiplication by an
  invertible matrix (named later; not required here).

### 12. Operational / representational bridge (conditional)
**Operational + representational, no real-world story.** *Operation:* the learner
performs reversible replacements on whole equations and (in the explorer/scene)
watches the second line **pivot about the fixed crossing point**. *Representation:*
three synchronized views — written equations, augmented matrix, and two constraint
lines — change together while the solution stays put. *Why it makes the inference
natural:* seeing the point not move while everything else does makes "the rewrite is
legal" felt before it is proved, and reversibility explains *why*.

### 13. Preserved correspondences & analogy limits (conditional)

| Maps **exactly** (keep) | Property the picture must **not** add (name & discard) |
| --- | --- |
| a legal row op ↔ a solution-set-preserving rewrite | that *any* manipulation of the numbers is safe (only reversible ones are) |
| the fixed crossing point ↔ the invariant solution | that the *lines themselves* are preserved (they move; only the intersection is fixed) |
| reversibility ↔ "nothing gained or lost" | that reversibility controls the *number* of solutions (it preserves the count, whatever it is) |
| scaling by \(0\) ↔ erasing a constraint | that \(0=0\) is "harmless" (it is the irreversible, information-destroying move) |

### 14. Abstraction return (conditional)
1. *Recognize the representation* — watch the line pivot; commit the prediction.
2. *Explain the mapping* — "the added \(-2R_1\) is \(0=0\) at the solution, so the
   point is fixed; the move is reversible, so nothing is gained."
3. *Transfer to an unfamiliar case* — a different system / an illegal-move diagnosis
   / constructing a contradiction row.
4. *Solve/justify the symbolic form* — state and prove the invariance theorem
   (both directions) via reversibility.

**Detecting a representation-only learner:** one who can run the steps and watch the
pivot but cannot say *why* the rewrite is legal (names no reversibility / no
both-directions argument), or who accepts \(0\)-scaling, has the procedure, not the
concept.

---

## Prerequisites, limitations, likely misconceptions

- **Prerequisites:** \(A\mathbf{x}=\mathbf{b}\), the row picture and the trichotomy,
  consistency = \(\mathbf{b}\) in the column span (L3); linear combinations (L1).
  Retrieved, not re-derived.
- **Limitations:** examples are \(2\times2\) for continuity; \(\mathbb{R}^n\)
  elimination, LU, and elementary matrices are *previewed* and owned later (L6/L8);
  reduced row echelon form is not formalized here. Accountable deferrals with named
  owners.
- **Likely misconceptions:**
  - "Elimination is a bag of arithmetic tricks." (Each step is one reversible
    rewrite whose correctness is guaranteed.)
  - "Scaling a row by \(0\) is fine." (It erases a constraint; irreversible.)
  - "Adding a row to itself is an elementary move." (It is a disguised scaling.)
  - "The triangular system is an approximation/shortcut." (It is the *same* system.)
  - "The multiplier is \(+(\text{entry})/(\text{pivot})\)." (Sign flips: subtract.)

**Semantic-leverage note.** Low semantic leverage by design; the power is
operational + representational + structural, credited on those mechanisms.

---

## Mathematical audit (Audit A)

| Check | Result |
| --- | --- |
| 1. Conclusion follows from derivation | PASS — invariance proved both directions via inverse operations (§6b–c, §7); no asserted step. |
| 2. Sufficiency vs lower bound / scope | PASS — reversibility is stated as the *reason* nothing is gained (the ⊆ direction), not conflated with the ⊇ direction; scope limited to preserving the solution set, not counting solutions (§9). |
| 3. Structure-preserving representation | PASS — the pivot picture preserves the solution; it explicitly does **not** claim the lines are preserved (§13). |
| 4. Hidden normalization | PASS — no normalization hidden in an "equivalence"; the \(k\neq0\) hypothesis is called out as where invertibility of \(E\) is used (§7). |
| 5. Nature of broader connections | PASS — determinant-under-row-ops, LU, rank, elementary matrices labeled **exact / exact structural** (§11). |
| 6. Notation level | PASS — augmented matrix, equivalent systems, triangular form, reversibility are target-level; elementary matrices/RREF labeled and deferred. |

## Grounding & model-change audit (Audit B)

| Check | Result |
| --- | --- |
| B1. Model change vs clearer wording | PASS — the learner reasons about *legality via reversibility*, a new mode, not a rephrasing of "do the steps." |
| B2. New prediction | PASS — predicts the solution stays fixed; diagnoses the illegal move (§10). |
| B3. Compression / purpose exposed | PASS — three operations + the one ban collapse to one reversibility property; elimination gains a purpose (safe rewriting). |
| B4. Genuine isomorphism (operational/representational) | PASS — a legal op corresponds exactly to a solution-set-preserving rewrite; the fixed point corresponds exactly to the invariant solution (§13 left). |
| B5. Named pragmatic additions | PASS — "any manipulation is safe," "the lines are preserved," and "\(0=0\) is harmless" named and discarded; no real-world property imported (§13 right). |
| B6. Abstraction return present | PASS — four-step return ending in the both-directions proof, with a representation-only detector (§14). |
| B7. Theme-removal test | PASS — no entertaining theme; the operation *is* the mathematics. |

Closing question: **more illuminating than a strong conventional explanation?** Yes
— it converts a memorized procedure into a one-line theorem the learner can *prove*
and use to diagnose illegal moves, and it draws that proof as the fixed pivot point.

---

## Review signoff

| Role | Filled by | Status |
| --- | --- | --- |
| Contract author | Cursor agent (AI) | Complete (retrospective) |
| Mathematical reviewer | Cursor agent (AI) — **not independent** | Self-review; Audit A passed. Consistent with built `src/lessons/elimination.ts` (whose `thm-invariance` proof matches §7). |
| Pedagogical reviewer | Cursor agent (AI) — **not independent** | Self-review; chain items 1–14 present. |
| User / domain-owner approval | Repository owner | Standing authorization to proceed on PASS (docs-only); independent human sign-off advisable. |
| Outstanding concerns | — | None blocking. Reviews self-performed. |

---

## Gate result

`Gate result: PASS`

**Exact primary insight (preserved for traceability; learner-facing lesson may use
shorter wording):**

> Each elementary row operation rewrites the system into an *equivalent* one with
> exactly the same solution set, because every operation is **reversible** — its
> inverse undoes it, so no solution can be created or destroyed; forward elimination
> is just a sequence of these safe rewrites reaching a triangular system you can read
> off, the manipulated line pivots about the fixed solution (the added multiple is
> \(0=0\) there), and the one forbidden move — scaling by \(0\) — is exactly the one
> that is irreversible.
