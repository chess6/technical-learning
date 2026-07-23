# Insight Discovery Brief — Linear Systems (retrospective)

Stage 1 of the [Insight Discovery Gate](../../../../authoring/insight-discovery-gate.md).
**Retrospective**: authored after the lesson (`src/lessons/systems.ts`) was built,
to bring the built `systems-elimination` module into the canonical workflow. The
brief diagnoses the obstacle, generates candidates across mechanisms, clusters and
ranks them, and hands the winner to the [contract](insight.md). It records what
*could* have unseated the winner so the selection is a comparison, not a
rationalization of the shipped lesson.

Continuity anchor (shared across the module): the running system is Lesson 1's
numbers — independent columns \(\mathbf{a}_1=(1,2),\ \mathbf{a}_2=(3,-1)\), target
\(\mathbf{b}=(-1,5)\), solution \((2,-1)\); dependent columns \((1,2),(2,4)\) with
\(\mathbf{b}=(3,6)\) (consistent) and \(\mathbf{b}=(3,5)\) (inconsistent).

---

## 1a. Diagnosed cognitive obstacle

Primarily an **unhelpful representation compounded by an incorrect prior mental
model**. The conventional presentation teaches \(A\mathbf{x}=\mathbf{b}\) as "two
equations, solve for \(x,y\)" — the **row** picture only. Learners then carry the
false rule "two equations in two unknowns ⇒ exactly one solution," and cannot say
*why* existence and uniqueness are separate questions. The **column** reading
(\(A\mathbf{x}=x\mathbf{a}_1+y\mathbf{a}_2\), from L2's columns rule) is missing,
so **span** (existence) and **independence** (uniqueness) never attach to solving.
Secondary: **missing structure** — invertibility, column space, independence, and
the solution count are one cluster seen from different sides, but appear unrelated.

This is representational, so Stage 1c (conventional vs alternative) is triggered.

## 1b. Candidate leads (raw → clustered)

Raw leads (before → after / new capability / mechanism):

1. Row picture as intersecting lines → count = how the lines sit / representational.
2. Column picture: \(A\mathbf{x}=\) blend of column arrows → solving = "reach
   \(\mathbf{b}\) by mixing columns" / representational + operational.
3. Same four numbers, two regroupings, one answer \((2,-1)\) → rows and columns are
   one equation / representational change (the **dual picture**).
4. Existence ⇔ \(\mathbf{b}\in\operatorname{span}\{\text{columns}\}\) (column
   space) → reachability test / structural.
5. Uniqueness ⇔ columns independent → predict the count without solving /
   predictive.
6. Trichotomy none/one/∞, never exactly two → the count is decided by
   (reachable?) × (independent?) / predictive reorganization.
7. "Two equations ⇒ one solution" is false → dependent columns collapse the plane
   to a line / counterexample.
8. "One solution for every \(\mathbf{b}\)" = invertibility (map \(\mathbf{x}\mapsto
   A\mathbf{x}\) reversible) → foreshadows the determinant / structural compression.
9. Coordinates-in-a-basis (L1) *are* the solution of \(A\mathbf{x}=\mathbf{b}\) →
   continuity / structural.
10. Determinant as the single number detecting independence → looking-ahead.

Clustered into candidate packages (each a distinct central learner model):

- **P1 — the dual picture.** \(A\mathbf{x}=\mathbf{b}\) is *one* equation with two
  readings: rows = constraint lines meeting at a point; columns = arrows blended to
  reach \(\mathbf{b}\). Leads 1–3, 9 (representation + continuity); 4–8 attach to it
  as consequences.
- **P2 — existence/uniqueness split.** The central move is separating *reachability*
  (span/column space) from *multiplicity* (independence); the trichotomy and the
  invertibility identity follow. Leads 4–8.
- **P3 — invertibility preview.** The organizing idea is "\(A\mathbf{x}=\mathbf{b}\)
  uniquely solvable for every \(\mathbf{b}\) ⇔ invertible," staged as the boundary
  the determinant will measure. Leads 8, 10.

## 1c. Conventional vs alternative (representational)

| | Conventional (row-only) | Alternative (dual picture) |
| --- | --- | --- |
| Object | two scalar equations | one equation \(A\mathbf{x}=\mathbf{b}\), two readings |
| Solving | isolate/substitute | intersect lines **or** blend columns to reach \(\mathbf{b}\) |
| Existence | "did substitution work?" | is \(\mathbf{b}\in\operatorname{span}\{\text{columns}\}\)? |
| Uniqueness | "did we get one answer?" | are the columns independent? |

**Preserved relations:** the solution set is identical under both readings (same
\((x,y)\)). **Easier to infer:** why exactly-two is impossible, and why
independence (not equation-count) controls uniqueness. **Introduced:** the columns'
span and independence as the two levers. **Transfers:** yes — column space (L8),
invertibility (L7), least squares as reachability (L13).

## 1d. Ranking

| Package | Surprise→inevitability | Compression | Transfer | Correctness | Teachability | Prereq fit | Leverage |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **P1 dual picture** | high | high | high | exact | high (dual scene + explorer) | excellent (L1/L2) | high (representational) |
| P2 existence/uniqueness | med | high | high | exact | med | good | med |
| P3 invertibility preview | med | med | med | exact | med | premature (det not yet) |  med |

**Winner: P1 — the dual picture**, because it *contains* P2 and P3 as consequences
(the split and the invertibility identity are read off the two pictures) and it is
the smallest change that makes the trichotomy feel inevitable rather than memorized.
P2 alone omits the representational "aha"; P3 alone leans on the not-yet-taught
determinant.

**What could have unseated P1:** if the row and column readings did *not* agree on
the same \((x,y)\) at the target level (they do), or if learners already reliably
predicted the trichotomy from the row picture alone (they do not — the "two ⇒ one"
error is the evidence). Either would have promoted P2.

## Discovery sequence (discover, not tell)

1. Solve one system by rows; get \((2,-1)\).
2. Regroup the *same* numbers by column; find \(2\mathbf{a}_1-\mathbf{a}_2=\mathbf{b}\)
   — same answer, different lens.
3. Drag \(\mathbf{b}\); with independent columns, always exactly one solution.
4. Switch to dependent columns \((1,2),(2,4)\); watch the reachable set collapse to
   a line — off it none, on it infinitely many.
5. **Predict-not-recall exit:** given a system, classify none/one/∞ *before*
   solving, from (reachable?) × (independent?).

## Rejected as non-insights

- "Solve two equations" mechanics; Cramer's rule as a formula to memorize;
  renaming \(x,y\) with a themed story (zero leverage).

`Stage 1 result: PASS → advance to Stage 2 with P1 (the dual picture).`
