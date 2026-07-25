# Approved Insight Contract — Subspaces, Column Space, Null Space, Rank (L8)

Stage 2 of the [Insight Discovery Gate](../../../../authoring/insight-discovery-gate.md).
Selects one primary breakthrough from [insight-brief.md](insight-brief.md) and
verifies its complete chain, then runs Audit A (mathematics) and Audit B
(grounding & model change).

> **Amendment (2026-07-25, scope correction).** The contract as first approved said
> a linear map has *exactly two* subspaces. That is false — the row space and
> \(\operatorname{Null}(A^{\mathsf T})\) are subspaces of the same map (the four
> together are the *fundamental subspaces*), and a matrix has infinitely many other
> subspaces besides. The insight was never about a census: it is about **which two
> spaces govern existence and uniqueness**. Every statement below is rescoped to
> that claim, which is what the causal chain actually derives; Audit A check 2 is
> re-run against it. Nothing else in the contract changes, and the lesson's
> mathematics is unaffected.

Primary insight selected: **Package P1** — *every question you have asked about a
matrix since Lesson 3 was a question about one of the two subspaces that govern
existence and uniqueness, and they live in different spaces.* **P2** (collapse has
degrees; rank counts them) is
woven in as the quantitative half of the same chain; **P3** supplies the
definition and the affine-vs-subspace misconception; **P4** (row rank = column
rank) is stated as a `reference` result and not built upon.

Notation: \(A\) is \(m\times n\) over \(\mathbb{R}\);
\(\operatorname{Col}(A)=\{A\mathbf{x}:\mathbf{x}\in\mathbb{R}^n\}\subseteq\mathbb{R}^m\);
\(\operatorname{Null}(A)=\{\mathbf{x}:A\mathbf{x}=\mathbf{0}\}\subseteq\mathbb{R}^n\);
\(\operatorname{rank}A=\dim\operatorname{Col}(A)\). Column vectors; KaTeX.

---

## Primary insight (required contents 1–11)

### 1. Diagnosed cognitive obstacle
From Stage 1a: **missing purpose** (the three objects arrive as definitions with
no question attached), compounded by **missing structure** (the learner has been
computing with both spaces since L3 without a name for either, so the names feel
redundant rather than clarifying).

### 2. Insight mechanism(s)
**Predictive/causal reorganization** (five lessons of prior work are re-sorted
under two headings, and the learner can afterwards classify a question before
computing), plus **structural compression** (existence and uniqueness become
properties of the *map*, not of each individual system) and **representational
change** (moving to \(\mathbb{R}^3\) turns "collapsed or not" into a count).

### 3. Initial mental model
"Column space, null space and rank are three more definitions to memorize.
Solving a system is a procedure; whether it works depends on the numbers I was
given."

### 4. Tension / redundancy
The learner has answered the *same two questions* in four consecutive lessons
with four different-looking procedures — L3 by classifying pictures, L4 by
eliminating, L5 by decomposing the solution set, L6/L7 by testing invertibility.
Nothing has explained why those two questions keep recurring, or why they are
*always* the two. The redundancy is exact: they recur because solving
\(A\mathbf{x}=\mathbf{b}\) has exactly two ways to go wrong — the target may be
unreachable, or the map may destroy a direction — and each failure mode is a
question about **one designated subspace of the map**: the column space for the
first, the null space for the second. Two questions, two spaces, one each.

### 5. The model change (what the learner now believes instead)
A matrix is not just a machine; among its subspaces there are **two designated
ones**, and they answer the two questions the learner keeps asking:

- **\(\operatorname{Col}(A)\), inside the output space \(\mathbb{R}^m\)** — every
  vector the map can actually produce. *Existence*: \(A\mathbf{x}=\mathbf{b}\) is
  solvable exactly when \(\mathbf{b}\in\operatorname{Col}(A)\).
- **\(\operatorname{Null}(A)\), inside the input space \(\mathbb{R}^n\)** — every
  vector the map crushes to \(\mathbf{0}\). *Uniqueness*: solutions are unique
  exactly when \(\operatorname{Null}(A)=\{\mathbf{0}\}\).

They live in **different spaces**, so they are never in competition and can be
different sizes. And "how much survived" is a **number**: \(\operatorname{rank}A
= \dim\operatorname{Col}(A)\), read off the pivots.

### 6. Full causal chain

- **(a) Re-read L3.** "Is \(\mathbf{b}\) reachable?" means "is \(\mathbf{b}\) a
  combination of the columns?", i.e. \(\mathbf{b}\in\operatorname{span}\{\text{columns}\}\).
  Since \(A\mathbf{x}\) *is* the combination of columns with weights \(x_i\), the
  set of reachable outputs is exactly the span of the columns. Name it
  \(\operatorname{Col}(A)\).
- **(b) Re-read L5.** \(\operatorname{Null}(A)\) already has a name, but L5 built
  it as *the solution set of a particular homogeneous system*. It is better read
  as a property of the map: the set of inputs the map destroys.
- **(c) Both are subspaces, and the closure axioms say what that means
  geometrically.** \(\operatorname{Col}(A)\): \(A\mathbf{x}+A\mathbf{y}=A(\mathbf{x}+\mathbf{y})\)
  and \(cA\mathbf{x}=A(c\mathbf{x})\), so sums and multiples of reachable vectors
  are reachable. \(\operatorname{Null}(A)\): proved in L5. Closure under addition
  and scaling is precisely the condition that forces a set to be a **flat through
  the origin** — a point, a line, a plane, … — never a curved or offset set.
  Hence L5's affine solution set is *not* a subspace unless \(\mathbf{b}=\mathbf{0}\).
- **(d) They live in different spaces.** For \(A\) of size \(m\times n\),
  \(\operatorname{Null}(A)\subseteq\mathbb{R}^n\) and \(\operatorname{Col}(A)\subseteq\mathbb{R}^m\).
  For a square map they are both in \(\mathbb{R}^n\) but still answer different
  questions and are generally different sets. Confusing the two is the central
  error this lesson must prevent.
- **(e) Collapse has degrees (P2, folded in).** In \(\mathbb{R}^2\), L6/L7 could
  only say "collapsed" or "not": the column space is the plane, a line, or the
  origin, and two of those are degenerate. In \(\mathbb{R}^3\) a map can send the
  unit cube to a solid, a **plane**, a line, or a point. "How much survived" is
  therefore a **count**, not a yes/no.
- **(f) Rank is that count, and pivots compute it.** Define
  \(\operatorname{rank}A=\dim\operatorname{Col}(A)\). Row-reduce \(A\); the pivot
  positions mark a maximal independent subset of the columns, so the **pivot
  columns of the original \(A\)** form a basis of \(\operatorname{Col}(A)\) and
  their number is the rank. (Row reduction changes the column space itself, which
  is why the basis must be taken from \(A\), not from its reduced form — a
  standard and important trap.)
- **(g) Free variables count the null space.** From L4/L5: each non-pivot column
  gives one free variable, and setting one free variable to \(1\) and the rest to
  \(0\) produces one basis vector of \(\operatorname{Null}(A)\). So
  \(\dim\operatorname{Null}(A)=\#\text{free variables}=n-\operatorname{rank}A\).
  *(Stated here as an observation; L9 makes it the conservation law and proves it.)*
- **(h) The old results become special cases.** \(A\) invertible (L6) \(\iff\)
  \(\operatorname{rank}A=n\) \(\iff\) \(\operatorname{Col}(A)=\mathbb{R}^n\) and
  \(\operatorname{Null}(A)=\{\mathbf{0}\}\). \(\det\ne0\) (L7) is the
  \(n\times n\) test for exactly that top value. The binary the learner has been
  using is the extreme case of the count.
- **(i) Forward edge into eigenvectors.** The eigenspace for \(\lambda\) is
  \(\operatorname{Null}(A-\lambda I)\) — an actual subspace, whose dimension
  (the geometric multiplicity) is what decides whether a repeated eigenvalue has
  one eigendirection or a whole plane of them. This lesson supplies the object
  that L11 needs to say that precisely.

### 7. Minimal formal derivation

**Definition (subspace).** \(S\subseteq\mathbb{R}^k\) is a *subspace* if
\(\mathbf{0}\in S\), and \(S\) is closed under addition and scalar multiplication.

**Definition.** \(\operatorname{Col}(A)=\operatorname{span}\{\text{columns of }A\}\);
\(\operatorname{Null}(A)=\{\mathbf{x}:A\mathbf{x}=\mathbf{0}\}\);
\(\operatorname{rank}A=\dim\operatorname{Col}(A)\).

**Proposition.** \(\operatorname{Col}(A)\) and \(\operatorname{Null}(A)\) are
subspaces (of \(\mathbb{R}^m\) and \(\mathbb{R}^n\) respectively).
*Proof.* Both from linearity, as in §6c. \(\blacksquare\)

**Theorem (solvability & uniqueness in the new language).**
\(A\mathbf{x}=\mathbf{b}\) is consistent \(\iff \mathbf{b}\in\operatorname{Col}(A)\);
and when consistent, its solution is unique \(\iff \operatorname{Null}(A)=\{\mathbf{0}\}\).
*Proof.* The first is the definition of \(\operatorname{Col}(A)\) unwound; the
second is L5's corollary. \(\blacksquare\)

**Proposition (computing both).** Let \(R\) be a row-echelon form of \(A\). Then
the columns of **\(A\)** in the pivot positions of \(R\) form a basis of
\(\operatorname{Col}(A)\), and \(\operatorname{rank}A\) is the number of pivots;
the free variables of \(R\) index a basis of \(\operatorname{Null}(A)\).

**Result stated, not proved (P4).** \(\operatorname{rank}A=\operatorname{rank}A^{\mathsf T}\)
— row rank equals column rank. Rendered as a `reference` block; its proof is out
of scope for P2.

### 8. Equivalence to the original object
Nothing is redefined. \(\operatorname{Col}(A)\) is the set of reachable
right-hand sides L3 already reasoned about, and \(\operatorname{Null}(A)\) is
L5's homogeneous solution set — the same sets, now named and attributed to the
map rather than to a system. The one genuinely new object is the **number**
\(\operatorname{rank}A\), and §6f identifies it with a quantity (the pivot count)
the learner has been producing since L4 without interpreting it.

### 9. Cost / model change

**Licenses:**
- classify any solvability question as existence (column space) or uniqueness
  (null space) *before* computing;
- predict the shape of the image (solid / plane / line / point) from the pivot count;
- produce a basis for either space from one row reduction;
- restate L6's invertibility criterion and L7's \(\det\ne0\) as "rank is maximal".

**Does NOT license:**
- reading a basis of \(\operatorname{Col}(A)\) off the **reduced** matrix — row
  operations change the column space, so the basis must be taken from \(A\);
- treating \(\operatorname{Col}(A)\) and \(\operatorname{Null}(A)\) as living in
  the same space, or as complements of one another (they generally are not, and
  for non-square \(A\) they are not even in the same \(\mathbb{R}^k\));
- concluding \(\operatorname{rank}A=\operatorname{rank}B\Rightarrow\) the maps are
  related in any way beyond the count;
- \(\operatorname{rank}+\operatorname{nullity}=n\) as a *proved* law — it is
  observed here from the pivot/free-variable split and **proved in L9**;
- the claim that a map has **only** these two subspaces — the row space and
  \(\operatorname{Null}(A^{\mathsf T})\) are subspaces of the same map (the four
  are the *fundamental subspaces*), and there are infinitely many others. What is
  licensed is that these two, and no others, decide existence and uniqueness;
- anything about orthogonality between the spaces (that is L12).

### 10. What the learner can predict or do afterward
- Given \(A\) and \(\mathbf{b}\), say which space decides solvability and which
  decides uniqueness, then verify.
- Given a row reduction, produce \(\operatorname{rank}A\), a basis of
  \(\operatorname{Col}(A)\) **from the original columns**, and a basis of
  \(\operatorname{Null}(A)\).
- Given a \(3\times3\) map, predict whether the unit cube becomes a solid, a
  plane, a line, or a point.
- Restate "invertible", "\(\det\ne0\)", "unique solution", and "columns
  independent" as one statement about rank.

### 11. Transfer assessment
- **Rank–nullity (L9)** — *exact*: this lesson supplies both counted objects.
- **Eigenspaces (L11)** — *exact*: an eigenspace **is** \(\operatorname{Null}(A-\lambda I)\),
  and its dimension is the geometric multiplicity.
- **Least squares (L13)** — *exact*: "project \(\mathbf{b}\) onto the column
  space" is unintelligible without \(\operatorname{Col}(A)\).
- **SVD (L14)** — *exact*: singular values count rank.
- **Linear dependence in data / feature redundancy** — *architectural*: rank as
  "how many genuinely independent variables are there".

### 12. Bridge (conditional)
**Representational + operational; no real-world story.**
- *Representation:* two panels shown side by side and explicitly labelled as
  **different spaces** — the input space \(\mathbb{R}^3\) holding
  \(\operatorname{Null}(A)\), and the output space \(\mathbb{R}^3\) holding
  \(\operatorname{Col}(A)\). 3-D geometry is drawn under a stated isometric
  projection.
- *Operation:* the learner watches the unit cube flatten onto a plane while a
  line of inputs collapses to a single point at the origin.
- *Why it makes the inference natural:* "what came out" and "what was destroyed"
  are visibly in different pictures, so the central confusion is prevented by the
  layout rather than corrected by a warning.

### 13. Preserved correspondences & analogy limits

| Maps **exactly** (keep) | Property the picture must **not** add (name & discard) |
| --- | --- |
| dimension of the flattened image ↔ \(\operatorname{rank}A\) | that \(\operatorname{Col}(A)\) and \(\operatorname{Null}(A)\) sit in the *same* copy of \(\mathbb{R}^3\) — they are drawn in two panels precisely because they need not |
| the crushed line ↔ \(\operatorname{Null}(A)\) | that the null line is *perpendicular* to the image plane — it looks that way for symmetric examples and is false in general (orthogonality is L12) |
| flat through the origin ↔ subspace | that every flat is a subspace — an offset flat (L5's solution set) is not |
| pivot count ↔ rank | that the reduced matrix's columns span the same space as \(A\)'s — they do not |

### 14. Abstraction return
1. *Recognize* — watch the cube flatten; name the surviving plane and the crushed line.
2. *Explain* — "the plane is everything the map can output; the line is everything it destroys."
3. *Transfer* — a map the learner has not watched, including a rank-1 case (image
   is a line, null space is a plane) so the two dimensions move in opposite
   directions.
4. *Symbolic* — produce \(\operatorname{rank}A\) and bases of both spaces from a
   row reduction, with the column-space basis taken from \(A\).

**Representation-only learner detector:** one who can narrate the collapse but
(i) reads the column-space basis off the reduced matrix, (ii) places
\(\operatorname{Null}(A)\) in the output space, or (iii) claims the two spaces are
complementary/perpendicular, has the picture, not the concept.

---

## Prerequisites, limitations, likely misconceptions

- **Prerequisites:** span, independence, basis, dimension informally (L1);
  columns rule (L2); reachability & the trichotomy (L3); elimination, pivots,
  free variables (L4); \(\operatorname{Null}(A)\) and uniqueness (L5);
  invertibility (L6); \(\det\ne0\) as the extreme case (L7). All built.
- **Limitations:** examples are \(3\times3\) and \(2\times2\); general \(m\times n\)
  with \(m\ne n\) is *stated* (so the "different spaces" point is honest) but not
  drilled. Row rank = column rank is stated without proof. The **row space and
  \(\operatorname{Null}(A^{\mathsf T})\) are out of scope** — named once as existing,
  never worked with, and left to L12/L14 where orthogonality makes them useful.
  Orthogonality between the spaces is out of scope (L12). Rank–nullity is
  *observed*, proved in L9.
- **Likely misconceptions:**
  - "\(\operatorname{Col}(A)\) and \(\operatorname{Null}(A)\) live in the same space."
  - "A matrix has only these two subspaces" — the lesson's scoping is about which
    two *decide solvability*, not a count of everything a matrix carries.
  - "The column space is spanned by the columns of the *reduced* matrix."
  - "Every flat is a subspace" (offset solution sets are not).
  - "Rank is a property of the numbers' size" rather than of independence.
  - "Null space big ⇒ column space big" (they move in *opposite* directions).

---

## Mathematical audit (Audit A)

| Check | Result |
| --- | --- |
| 1. Conclusion follows | PASS — §6a derives \(\operatorname{Col}\) from the column picture rather than asserting it; §6c proves both closure claims from linearity; §6f states the pivot-basis fact with the from-\(A\)-not-\(R\) caveat. |
| 2. Sufficiency / scope | PASS **after the 2026-07-25 amendment**. The original text overreached: "a linear map has exactly two associated subspaces" is false (the four fundamental subspaces, and infinitely many others). The chain never derived that census — it derives that *two designated* subspaces decide existence and uniqueness — so the claim is now stated at the strength the derivation supports, the row space / \(\operatorname{Null}(A^{\mathsf T})\) are named as existing but out of scope, and the false reading is added to §9's not-licensed list and the misconception list. Rank–nullity remains explicitly **observed, not proved**, deferred to L9 (§6g, §9); row rank = column rank remains **stated, not proved** (§7). |
| 3. Structure-preserving representation | PASS — the two-panel layout encodes the different-spaces fact; the three properties the picture could falsely add (same space, perpendicularity, reduced-matrix basis) are named and discarded (§13). |
| 4. Hidden normalization | PASS — the isometric projection is stated as a projection, not presented as the geometry itself; square examples are flagged as a special case of \(m\times n\). |
| 5. Nature of connections | PASS — L9, L11, L13, L14 labelled **exact**; data/feature redundancy labelled **architectural** (§11). |
| 6. Notation level | PASS — \(\operatorname{Col}\), \(\operatorname{Null}\), \(\operatorname{rank}\), \(\dim\) are the standard names; nothing expert-only (no quotient spaces, no dual). |

## Grounding & model-change audit (Audit B)

| Check | Result |
| --- | --- |
| B1. Model change vs wording | PASS — the learner re-sorts five lessons of prior work under two headings and can afterwards classify a question before computing. |
| B2. New prediction | PASS — image shape from pivot count; which space decides which question (§10). |
| B3. Compression / purpose | PASS — four different-looking procedures are revealed as two questions; the definitions arrive *after* the need. |
| B4. Genuine isomorphism | PASS — flattened image ↔ rank, crushed line ↔ null space, flat-through-origin ↔ subspace (§13 left). |
| B5. Named pragmatic additions | PASS — same-space, perpendicularity, and reduced-matrix-basis are each named and discarded (§13 right). |
| B6. Abstraction return | PASS — four steps with a representation-only detector (§14). |
| B7. Theme removal | PASS — no decorative theme; the representation is the mathematics. |

Closing question: **more illuminating than a strong conventional explanation?**
Yes. The conventional order (define subspace → verify axioms → define the two
spaces → define rank) supplies four objects and no questions. This order supplies
the questions first, from the learner's own prior work, and lets the objects
arrive as the answers.

---

## Review signoff

| Role | Filled by | Status |
| --- | --- | --- |
| Contract author | Claude Code agent (AI) | Complete |
| Mathematical reviewer | Claude Code agent (AI) — **not independent** | Self-review; Audit A passed. The pivot-basis-from-\(A\)-not-\(R\) caveat and the "different spaces" scoping were added during review. **A later review (2026-07-25) caught the "exactly two subspaces" overreach and rescoped it** — see the amendment note at the top and Audit A check 2. |
| Pedagogical reviewer | Claude Code agent (AI) — **not independent** | Self-review; chain items 1–14 present. |
| User / domain-owner approval | Repository owner | **Authorized to build** ("Create Subspaces & Rank … end-to-end"). Independent math/pedagogy review still outstanding. |

---

## Gate result

`Gate result: PASS`

**Exact primary insight (verbatim for the Stage 3 plan's metadata):**

> Every question you have asked about a matrix since Lesson 3 was a question
> about one of the two subspaces that govern solvability, and they live in
> different spaces: the **column space** inside the output space is everything
> the map can produce, so it decides *existence*; the **null space** inside the
> input space is everything the map crushes to zero, so it decides *uniqueness*.
> In the plane those spaces could only be "everything" or "a line", so collapse
> looked binary; in three dimensions it becomes a count — the **rank**, the number
> of dimensions that survive, readable off the pivots, with a basis taken from the
> columns of \(A\) itself and not of its reduced form. Invertibility and
> \(\det\ne0\) are then just the extreme case: rank is as large as it can be.
