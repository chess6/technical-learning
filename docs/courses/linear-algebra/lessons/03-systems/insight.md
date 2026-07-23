# Approved Insight Contract — Linear Systems: Two Pictures of One Equation

Stage 2 of the [Insight Discovery Gate](../../../../authoring/insight-discovery-gate.md).
**Retrospective** contract for the built lesson (`src/lessons/systems.ts`). Selects
the primary breakthrough from the Stage 1 [brief](insight-brief.md), verifies its
mathematical and pedagogical chain, and runs Audit A (mathematical) and Audit B
(grounding & model-change; the bridge here is representational).

Primary insight selected: **P1 — the dual picture.** \(A\mathbf{x}=\mathbf{b}\) is
one equation with two readings; existence is reachability (span of the columns) and
uniqueness is column independence, so the solution count is decided by
(reachable?) × (independent?).

Notation: \(A=[\mathbf{a}_1\ \mathbf{a}_2]\) is \(2\times2\) here (general \(m\times
n\) where noted); columns \(\mathbf{a}_1,\mathbf{a}_2\); column vectors; KaTeX. The
running example is Lesson 1's basis \((\mathbf{a}_1,\mathbf{a}_2)=((1,2),(3,-1))\),
\(\mathbf{b}=(-1,5)\), solution \((2,-1)\); the dependent foil is \((1,2),(2,4)\)
with \(\mathbf{b}=(3,6)\) (consistent) / \((3,5)\) (inconsistent).

---

## Primary insight (required contents 1–11)

### 1. Diagnosed cognitive obstacle
From Stage 1a: **an unhelpful representation** (row-only solving hides the column
reading) plus an **incorrect prior mental model** ("two equations in two unknowns ⇒
exactly one solution"), so existence and uniqueness are never separated.

### 2. Insight mechanism(s)
**Representational change** (rows ↔ columns are two pictures of one equation),
**predictive reorganization** (the trichotomy is predicted from reachability ×
independence, not memorized), and **structural compression** (existence,
uniqueness, and invertibility become one cluster). No real-world grounding.

### 3. Initial mental model
"A system is a pair of equations; solving means grinding \(x,y\); as many equations
as unknowns means one answer." Columns, span, and independence are unconnected to
solving.

### 4. Tension / redundancy
The learner already knows from L1 that \((\mathbf{a}_1,\mathbf{a}_2)\) is a basis
with *unique coordinates*, and from L2 that \(A\mathbf{x}=x\mathbf{a}_1+y\mathbf{a}_2\).
Yet \(x+2y=3,\ 2x+4y=6\) has infinitely many solutions and \(x+2y=3,\ 2x+4y=5\) has
none — both "two equations, two unknowns." The naive count rule cannot explain
either, and nothing links "unique coordinates" to "unique solution."

### 5. The model change (what the learner now believes instead)
\(A\mathbf{x}=\mathbf{b}\) is a **single** equation read two ways. **Rows:** each
equation is a line; the solution set is their intersection. **Columns:** by the
columns rule, solving is finding coefficients \(x,y\) with
\(x\mathbf{a}_1+y\mathbf{a}_2=\mathbf{b}\). Then **existence** is a reachability
question — is \(\mathbf{b}\) in the span of the columns (the column space)? — and
**uniqueness** is whether the columns are independent. The solution count is
therefore decided by two independent switches: (is \(\mathbf{b}\) reachable?) ×
(are the columns independent?).

### 6. Full causal chain (no missing steps)
- **(a) Two readings, same numbers.** \(A\mathbf{x}=\mathbf{b}\) unpacks to the
  scalar rows \(x+3y=-1,\ 2x-y=5\) (two lines) and, by L2's columns rule, to
  \(x\mathbf{a}_1+y\mathbf{a}_2=\mathbf{b}\) (blend of arrows). These are
  regroupings of the *same* entries, so they have the **same** solution set.
- **(b) They agree on the example.** Rows intersect at \((2,-1)\); columns give
  \(2\mathbf{a}_1-\mathbf{a}_2=(-1,5)=\mathbf{b}\). Same \((x,y)\). This is exactly
  L1's \([\mathbf{q}]_B=(2,-1)\): coordinates-in-a-basis *are* the system's solution.
- **(c) Existence = reachability.** A solution exists iff \(\mathbf{b}\) can be
  written as a combination of the columns, i.e. \(\mathbf{b}\in
  \operatorname{span}\{\mathbf{a}_1,\mathbf{a}_2\}\) — the **column space**. This is
  the definition of span read from the solving side (consistency theorem).
- **(d) Uniqueness = independence.** If the columns are **independent** they span
  the plane and every \(\mathbf{b}\) has a *unique* blend (L1's basis ⇔ unique
  coordinates) — one solution for every \(\mathbf{b}\). If **dependent**, they span
  only a line; \(\mathbf{b}\) off the line is unreachable (**none**), \(\mathbf{b}\)
  on it is reachable in infinitely many ways (**infinitely many**), because one
  column is a multiple of the other and coefficients trade along the dependency.
- **(e) The trichotomy, and why never exactly two.** (reachable?) × (independent?)
  yields exactly: independent ⇒ one (for every \(\mathbf{b}\)); dependent &
  reachable ⇒ ∞; dependent & unreachable ⇒ none. "Exactly two" would require a
  finite set larger than one closed under the dependency's continuous trade — impossible.
- **(f) Invertibility identity.** "Exactly one solution for *every* \(\mathbf{b}\)"
  is precisely independence of the columns, which is precisely that the map
  \(\mathbf{x}\mapsto A\mathbf{x}\) is reversible — **invertibility**. The single
  yes/no question "are the columns independent?" is the boundary the next lesson's
  determinant will detect with one number.

### 7. Minimal formal derivation
**Consistency.** \(A\mathbf{x}=\mathbf{b}\) is consistent \(\iff\)
\(\mathbf{b}\in\operatorname{span}\{\mathbf{a}_1,\dots,\mathbf{a}_n\}=\operatorname{Col}(A)\),
directly from \(A\mathbf{x}=\sum x_i\mathbf{a}_i\).
**Trichotomy (\(2\times2\)), derived from independence — *not* the determinant.**
Suppose the columns \(\mathbf{a}_1,\mathbf{a}_2\) are **independent**. Two
independent vectors in \(\mathbb{R}^2\) span the plane and form a **basis**, so every
\(\mathbf{b}\) has a *unique* representation \(\mathbf{b}=x\mathbf{a}_1+y\mathbf{a}_2\)
(basis ⇔ unique coordinates, L1) — exactly one solution for every \(\mathbf{b}\).
Suppose instead the columns are **dependent**: one is a scalar multiple of the other
(\(\mathbf{a}_2=c\,\mathbf{a}_1\)), so \(\operatorname{Col}(A)\) is a single line
\(L\) through the origin. If \(\mathbf{b}\notin L\), no combination reaches it —
**none**. If \(\mathbf{b}\in L\), a combination exists and is **not** unique: for any
solution \((x,y)\), the pairs \((x+ct,\,y-t)\) give the identical combination for
every \(t\in\mathbb{R}\), so there are **infinitely many**. "Never exactly two"
follows: the dependent-consistent case already forces a whole one-parameter family.
(That this infinite set is exactly an *affine line* is proved in L5.) The
**determinant is not used** in this derivation — it is introduced later (L7) as the
single number that *detects* the independent/dependent switch the trichotomy turns on.

### 8. Equivalence to the original object
The row set \(\{(x,y):x+3y=-1,\ 2x-y=5\}\), the intersection point, and the column
blend describe **exactly** the same set \(\{\mathbf{x}:A\mathbf{x}=\mathbf{b}\}\):
each is a regrouping of the identical linear constraints, so no solution is added or
lost. The columns rule \(A\mathbf{x}=x\mathbf{a}_1+y\mathbf{a}_2\) is an identity,
not an approximation — nothing is normalized away.

### 9. Cost / model change (which inferences it licenses)
**Licenses:** classify none/one/∞ *before* solving, from (reachable?) ×
(independent?); assert one-solution-for-every-\(\mathbf{b}\) exactly when columns
are independent; read "unique coordinates" (L1) and "unique solution" as the same
fact; recognize invertibility as this same condition.
**Does NOT license (guardrails):** "as many equations as unknowns ⇒ one solution"
(false — depends on independence); reading a *reachable-looking* picture as settling
**uniqueness** (reachability is existence, a separate switch); concluding "exactly
two" is ever possible.

### 10. What the learner can predict or do afterward (without being told)
- Translate a system to \(A\mathbf{x}=\mathbf{b}\) and read off the columns.
- State the column-picture reading of \(A\mathbf{x}=\mathbf{b}\).
- Given dependent columns, name exactly which \(\mathbf{b}\) make it inconsistent
  (those off the column line).
- Produce counterexamples to "two equations ⇒ one solution" (one none, one ∞).
- Conclude "one solution for every \(\mathbf{b}\)" ⇔ independent columns ⇔ invertible.

### 11. Transfer assessment
- **Column space / span (L8)** — *exact*: existence lives in \(\operatorname{Col}(A)\).
- **Independence & basis (L1)** — *exact*: uniqueness ⇔ independent columns ⇔ unique
  coordinates.
- **Determinant / invertibility (L7)** — *exact*: \(\det A\neq0\) certifies the
  independence switch.
- **Solution-set structure (L5)** — *exact*: the ∞ case is pinned down to
  \(\mathbf{x}_p+\operatorname{Null}(A)\).
- **Least squares (L13)** — *architectural*: when \(\mathbf{b}\notin\operatorname{Col}(A)\),
  project first — reuses existence-as-reachability.

### 12. Representational bridge (conditional)
**Representational + operational, no real-world story.** *Representation:* two
synchronized pictures — constraint **lines** (rows) and column **arrows** blended
to a target (columns) — over the same numbers, plus a draggable \(\mathbf{b}\).
*Operation:* the learner literally intersects lines and mixes arrows and sees the
*same* \((x,y)\). *Why it makes the inference natural:* dragging \(\mathbf{b}\) with
dependent columns shows the reachable set collapse to a line, so "existence =
reachability" and "dependent ⇒ none or ∞" are seen before they are stated.

### 13. Preserved correspondences & analogy limits (conditional)

| Maps **exactly** (keep) | Property the picture must **not** add (name & discard) |
| --- | --- |
| intersection point ↔ column blend ↔ solution \((x,y)\) | that having two lines *guarantees* one crossing (parallel/coincident lines: none/∞) |
| column span (a line/plane) ↔ the set of reachable \(\mathbf{b}\) | that a reachable-looking \(\mathbf{b}\) settles **uniqueness** — reachability is existence only |
| columns' independence ↔ uniqueness for every \(\mathbf{b}\) | that "two equations" as a *count* controls the outcome |
| dragging \(\mathbf{b}\) ↔ changing the target, columns fixed | any causality/time/agency (there is no scenario to import one from) |

### 14. Abstraction return (conditional)
1. *Recognize the representation* — drag \(\mathbf{b}\); watch rows and columns
   return the same point.
2. *Explain the mapping* — "existence = \(\mathbf{b}\) in the column span;
   uniqueness = columns independent."
3. *Transfer to an unfamiliar case* — a system the learner has not seen, including a
   dependent-columns inconsistent case (classify before solving).
4. *Solve the symbolic form* — write \(A\mathbf{x}=\mathbf{b}\), the column
   equation, and the consistency/uniqueness conditions.

**Detecting a representation-only learner:** one who can drag the picture but cannot
translate a system to \(A,\mathbf{b}\), or who still asserts "two equations ⇒ one
solution," has the picture, not the concept.

---

## Prerequisites, limitations, likely misconceptions

- **Prerequisites:** linear combinations, span, independence, basis ⇔ unique
  coordinates (L1); \(A\mathbf{x}\) as a combination of columns — the columns rule
  (L2). These are *retrieved*, not re-derived.
- **Limitations:** examples are \(2\times2\) for continuity; "why ∞ is exactly a
  line/affine set" is stated here and **proved in L5**; the determinant is
  *previewed*, not defined (L7); the general \(m\times n\) column-space/existence
  statement is stated but exercised generally in L8. These are accountable
  deferrals (owner named), not scope this lesson silently drops.
- **Likely misconceptions:**
  - "Two equations in two unknowns ⇒ exactly one solution." (Depends on independence.)
  - "A system could have exactly two solutions." (Never — none/one/∞.)
  - "The row and column pictures are different problems." (Same equation, two lenses.)
  - "Trivial/independent ⇒ every \(\mathbf{b}\) reachable." (Uniqueness ≠ existence.)
  - "No solution means I made an arithmetic mistake." (It is a real, informative outcome.)

**Semantic-leverage note.** Low semantic leverage by design — no themed relabel and
no real-world goal. The power is representational + predictive + structural, credited
on those mechanisms.

---

## Mathematical audit (Audit A)

| Check | Result |
| --- | --- |
| 1. Conclusion follows from derivation | PASS — consistency = span (§6c/§7); trichotomy from independence via basis ⇔ unique coordinates (§6d); no asserted step at the target level (the "∞ is a line" proof is explicitly deferred to L5). |
| 2. Sufficiency vs lower bound / scope | PASS — independence is stated as sufficient *and* necessary for "one for every \(\mathbf{b}\)"; existence (reachability) is kept strictly separate from uniqueness (§6d, §9). |
| 3. Structure-preserving representation | PASS — the dual picture preserves the solution set exactly; the "two lines ⇒ one crossing" and "reachable ⇒ unique" false additions are named and discarded (§13). |
| 4. Hidden normalization | PASS — the columns rule is an identity; nothing is normalized inside the "equivalence" (§8). |
| 5. Nature of broader connections | PASS — column space / independence / invertibility / solution-set structure labeled **exact**; least squares **architectural** (§11). |
| 6. Notation level | PASS — span, column space, independence, invertibility are target-level; determinant is previewed and labeled, not required for the chain. |

## Grounding & model-change audit (Audit B)

| Check | Result |
| --- | --- |
| B1. Model change vs clearer wording | PASS — the learner predicts the count from two switches, a new mode of reasoning, not a rephrasing. |
| B2. New prediction | PASS — classify none/one/∞ before solving; name the inconsistent \(\mathbf{b}\) (§10). |
| B3. Compression / purpose exposed | PASS — existence, uniqueness, invertibility, and coordinates collapse into one cluster. |
| B4. Genuine isomorphism (representational) | PASS — intersection point, column blend, and solution coincide exactly (§13 left). |
| B5. Named pragmatic additions | PASS — "two lines guarantee a crossing" and "reachable settles uniqueness" named and discarded; no real-world property imported (§13 right). |
| B6. Abstraction return present | PASS — four-step return with a representation-only detector (§14). |
| B7. Theme-removal test | PASS — no entertaining theme; the representation *is* the mathematics. |

Closing question: **more illuminating than a strong conventional explanation?** Yes
— it makes the trichotomy predictable from structure rather than discovered by
grinding, and unifies four ideas the standard order leaves scattered.

---

## Review signoff

| Role | Filled by | Status |
| --- | --- | --- |
| Contract author | Cursor agent (AI) | Complete (retrospective) |
| Mathematical reviewer | Cursor agent (AI) — **not independent** | Self-review; Audit A passed. Consistent with built `src/lessons/systems.ts` and its tests. |
| Pedagogical reviewer | Cursor agent (AI) — **not independent** | Self-review; chain items 1–14 present. |
| User / domain-owner approval | Repository owner | **Pending review.** A docs-only authorization to run the retrospective is **not** substantive owner approval of this contract; independent human sign-off is required before any readiness/mastery claim or promotion. |
| Outstanding concerns | — | Math/pedagogical reviews are self-performed (not independent); owner approval pending. |

---

## Gate result

`Gate result: PASS`

**Exact primary insight (preserved for traceability; learner-facing lesson may use
shorter wording):**

> \(A\mathbf{x}=\mathbf{b}\) is a single equation read two ways — rows are
> constraint lines meeting at a point, columns are arrows blended to reach
> \(\mathbf{b}\); existence is whether \(\mathbf{b}\) lies in the span of the
> columns and uniqueness is whether the columns are independent, so the solution
> count is decided by reachability × independence, "never exactly two," and "one
> solution for every \(\mathbf{b}\)" is exactly invertibility.
