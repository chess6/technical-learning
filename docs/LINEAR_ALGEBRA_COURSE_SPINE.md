# Linear Algebra — Course Spine

The authoritative **content spine** for the linear-algebra course: Chapter 0 plus
Lessons 1–14, the *central insight* each lesson must deliver, the dependency
order, and the recurring **application threads** that give the whole course a
single coherent arc rather than a pile of topics.

This document answers "what is the whole course, and why in this order?" It is
distinct from its neighbors:

- [MULTI_DOMAIN_CURRICULUM_ARCHITECTURE.md](./MULTI_DOMAIN_CURRICULUM_ARCHITECTURE.md)
  — the *platform data model* (subjects → courses → modules → lessons, and the
  eventual graph). That is about **structure/plumbing**; this is about
  **content/sequence**.
- [LESSON_DESIGN.md](./LESSON_DESIGN.md) — how any *single* lesson is composed
  from the block palette.
- [INTERACTIVE_TEXTBOOK_VISION.md](./INTERACTIVE_TEXTBOOK_VISION.md) — the
  pedagogical philosophy the spine serves.

The runnable encoding of this spine is `src/lessons/curriculum.ts`
(`COURSE_SECTIONS`): built lessons are `lesson` refs; not-yet-authored lessons
are `future` nodes placed in their correct spine position with a one-line
insight. **This document is the source of truth for the sequence; keep the two
in sync.**

> **Scope note (durable).** Listing all 14 lessons here does **not** reopen
> authoring of Lessons 4–14. Per `.cursor/rules/project-core.mdc`, the active
> product surface is the built vertical slice; the future lessons are an
> *architecture commitment*, authored later one at a time. This spine exists so
> that when each is built it lands in a coherent whole, and so the earlier
> lessons can *foreshadow* what is coming instead of contradicting it.

---

## 1. The design principle behind the spine

The course is **vector-first** and **transformation-centric**. Its
defensibility rests on one rule: **every later idea is introduced as a
re-interpretation of an idea the learner already holds**, never as a fresh
definition to memorize. Concretely:

- **Systems** reconnect vectors and transformations (row picture = intersecting
  constraints; column picture = a combination question — "which input lands on
  \(\mathbf{b}\)?").
- **Elimination** is not an algorithm to memorize; it is *rewriting a system as
  an easier system with the same solution set*.
- **Determinants** are not the *first* place invertibility appears; they are a
  *detector* for a failure the learner already met (a collapsing transformation,
  a system with no unique solution).
- **Rank–nullity** is a *conservation law*, not a formula: input dimensions
  either survive to the output or collapse into the null space.
- **SVD** is a *capstone* that reunifies rotation, scaling, rank, orthogonality,
  and data — nothing genuinely new, everything seen before, now composed.

When authoring any future lesson, the acceptance bar is: *state its central
insight as a re-interpretation of prior lessons, not as a new axiom.*

---

## 2. The spine at a glance

`Status`: **built** = a real lesson in the registry today; **future** = a
`future` node in `curriculum.ts`, not yet authored.

| Spine | Lesson | Central insight (the "not memorize X, but Y") | Status | Curriculum id |
| --- | --- | --- | --- | --- |
| Ch 0 | Why linear algebra? | Four numbers can *move space*; graphics, data, and systems are all the same machine. | built | `why-linear-algebra` |
| L1 | Vectors, combinations, span, basis, coordinates | A vector is data you can *combine*; a basis makes coordinates a *choice*, not a fact. | built | `vectors` |
| L2 | Linear transformations & the columns rule | A linear map is fixed by where the basis lands — its **columns**. | built | `transformations` |
| L3 | Linear systems: row & column pictures | \(A\mathbf{x}=\mathbf{b}\) is *both* intersecting constraints (rows) *and* "which combination of columns is \(\mathbf{b}\)?" | built | `systems` |
| L4 | Elimination as reversible constraint manipulation | **Replace a system with an easier system having exactly the same solution set.** | future | `elimination` |
| L5 | Solution sets & homogeneous systems | Every solution set is *one particular solution + all null directions*; linear vs affine. | future | `solution-sets` |
| L6 | Matrix composition & inverses | "Apply \(B\), then \(A\)" is a new map \(AB\); an inverse *undoes* a map (when it can). | future | `matrix-composition` |
| L7 | Determinants | A geometric/algebraic **detector of invertibility** (signed area/volume scale), not the first sighting of collapse. | built | `determinants` |
| L8 | Subspaces, column space, null space, rank | **Column space controls possible outputs; null space controls non-uniqueness; rank counts independent output directions.** | future | `subspaces-rank` |
| L9 | Dimension & rank–nullity | Conservation: input dimensions either **survive** into the output or **disappear** into the null space. | future | `rank-nullity` |
| L10 | Change of basis | Pays off L1: the *same vector/map* wears different coordinates in a different basis. | future | `change-of-basis` |
| L11 | Eigenvectors & diagonalization | Directions a map only *scales*; diagonalizing = choosing the basis where the map is pure scaling. | built (intro) | `eigenvectors` |
| L12 | Orthogonality & projections | Right angles give the *best approximation*; projection is "closest point in a subspace." | future | `orthogonality` |
| L13 | Least squares | When \(A\mathbf{x}=\mathbf{b}\) has *no* solution, project \(\mathbf{b}\) onto the column space and solve that. | future | `least-squares` |
| L14 | Singular value decomposition | **Every matrix is rotate → scale → rotate**; reunifies rank, orthogonality, geometry, and compression. | future | `svd` |

`karatsuba` is intentionally **not** on this spine — it belongs to a separate
"Algorithms & complexity" track and only shares the platform, not the
linear-algebra dependency order.

---

## 3. Per-lesson central insight & content

Only Lessons 4–14 are detailed here (Ch 0–L3 and L11 are built; see their lesson
definitions). Each future lesson must lead with its insight, reuse a prior
example wherever possible, and preserve semantic roles/notation.

### L4 — Elimination as reversible constraint manipulation *(major missing lesson)*

**Insight:** *not* "memorize Gaussian elimination" but **replace a system with an
easier system that has exactly the same solution set.** Visualize each row
operation as changing the *description* of the constraints without moving their
common intersection.

Teach: swapping equations; scaling an equation; adding a multiple of one
equation to another; echelon form; pivots; contradiction rows; free variables.
The reversibility (each operation is invertible ⇒ solution set is preserved) is
the load-bearing idea and the bridge to L6 (inverses) and L7 (determinants
unchanged up to sign/scale under these operations).

### L5 — Solution sets & homogeneous systems

**Insight:** every solution set is **one particular solution plus all solutions
of \(A\mathbf{x}=\mathbf{0}\)** (the homogeneous/null directions).

Teach: particular + homogeneous decomposition; parameterized lines and planes;
\(A\mathbf{x}=\mathbf{0}\); trivial vs nontrivial solutions; null directions;
**affine vs linear** solution sets. *The existing "infinite recipes" systems
interaction is the natural bridge* — reuse it to show the free-variable
directions as an actual line/plane of solutions.

### L6 — Matrix composition & inverses

**Insight:** composing maps builds a new map; inverting *undoes* one.

Teach: apply \(B\) then \(A\); why order matters (\(AB \ne BA\)); the columns of
\(AB\) (each column of \(B\) pushed through \(A\)); inverse as undoing;
solving \(A\mathbf{x}=\mathbf{b}\) via \(A^{-1}\); why **not every matrix is
invertible** (sets up L7). Continuity: reuse L2's transformation and L3's system.

### L7 — Determinants *(built; re-slotted)*

**Insight (reframed):** determinants are a **detector of invertibility** —
signed area/volume scaling — arriving *after* the learner has already met
collapse in L3/L6, so the determinant answers a question they already have.
(The built lesson stands; when revisited, ensure it references the L6
non-invertibility motivation rather than introducing the issue cold.)

### L8 — Subspaces, column space, null space, rank

**Insight:** formalize what was used informally. **Column space controls possible
outputs; null space controls non-uniqueness; rank measures independent output
directions.**

Teach: subspace definition; column space = span of columns = reachable outputs;
null space = inputs sent to \(\mathbf{0}\); rank as dimension of the column
space. Directly connects L3's consistency/uniqueness to named objects.

### L9 — Dimension & rank–nullity

**Insight (conservation):** input dimensions either **survive** into the output
(rank) or **disappear** into the null space (nullity): \(\operatorname{rank} +
\operatorname{nullity} = n\).

Teach it *visually* as conservation — the ideal payoff of the "moving space"
language: watch a dimension collapse and account for exactly where it went.

### L10 — Change of basis

**Insight:** pays off the L1 distinction between a **vector** and its
**coordinates** — the same object/map has different coordinates in a different
basis.

Teach: coordinate vectors in a basis; change-of-basis matrix; how a map's matrix
transforms under a change of basis (foreshadows diagonalization as "the basis
where the matrix is diagonal").

### L11 — Eigenvectors & diagonalization *(built intro; full treatment later)*

**Insight:** eigenvectors are directions a map merely **scales**; diagonalizing
picks the basis (L10) in which the map is pure scaling.

The built lesson is an intuitive introduction. The full treatment eventually
adds: characteristic equation; eigenspaces; multiplicity; diagonalization;
repeated application and dynamical systems (the Dynamics thread, §4).

### L12 — Orthogonality & projections

**Insight:** right angles give the **best approximation**; a projection is the
closest point in a subspace.

Teach: dot product; orthogonal complements; projection onto a line/subspace;
Gram–Schmidt; orthonormal coordinates (the cleanest special case of L10).

### L13 — Least squares

**Insight:** when \(A\mathbf{x}=\mathbf{b}\) is **inconsistent**, don't give up —
project \(\mathbf{b}\) onto the column space (L8, L12) and solve the consistent
system that remains.

Teach: normal equations; geometry of the residual; connection to data fitting /
regression (the Data thread, §4). Directly reconnects L3 (consistency), L8
(column space), and L12 (projection).

### L14 — Singular value decomposition *(capstone)*

**Insight:** **every** matrix factors as **rotate → scale → rotate**
(\(A = U\Sigma V^\top\)). Nothing new — a reunification.

Combines: rotations, scaling (L2), rank (L8), orthogonality (L12), geometry, and
data compression (low-rank approximation; the Data thread's deepest payoff).

---

## 4. Application threads (recurring, not sidebars)

Applications are **threads that recur with deepening interpretation**, not
one-off boxes. The same scenario reappears as the machinery to explain it grows.

| Thread | Recurs at | Deepening interpretation |
| --- | --- | --- |
| **Graphics & games** | Ch 0, L2, L6, L10, L11, L14 | transformations → composing camera/model transforms → change of basis for camera frames → projection → SVD for image compression. |
| **Systems & constraints** | L3, L4, L5, L8 | balancing/networks/circuits as constraints → elimination as safe rewriting → the full solution set → column/null space naming *why* a network is solvable or not. |
| **Data** | L1, L12, L13, L14 | data as vectors → projection → regression / least squares → dimensionality reduction / PCA via SVD. |
| **Dynamics** | Ch 0, L6, L11 | repeated application of a transformation → \(A^k\) via composition → eigenvectors/diagonalization as the long-run behavior of a dynamical system. |
| **Computation** | L4, L7, L13, L14 | elimination as an algorithm → determinant as a numerical detector → conditioning of least squares → numerical error and stable factorizations (SVD). |

**Authoring rule:** when a lesson touches a thread, reference the *earlier*
appearance explicitly ("you saw this camera transform in Ch 0 — now we can name
its inverse") so the thread reads as one story, not a coincidence.

---

## 5. Dependency order (why this sequence)

Hard prerequisites (a lesson genuinely needs the earlier idea):

```
Ch0 → L1 → L2 → L3
L3 → L4 → L5
L2, L3 → L6 → L7
L3, L6 → L8 → L9
L1, L2 → L10
L2, L7, L10 → L11
L1, L12 (dot product) → L12
L3, L8, L12 → L13
L2, L8, L12 → L14
```

Notes:

- **L4 before L5**: you must be able to *reduce* a system before you can read off
  its free variables and describe the full solution set.
- **L6 before L7**: invertibility should be *wanted* (composition/undoing) before
  the determinant is offered as the detector — this is the core reframing that
  makes determinants feel earned rather than arbitrary.
- **L10 before L11**: diagonalization is "change to the basis where the map is
  diagonal," so change of basis must come first.
- **L12 before L13, L14**: projection is the engine of both least squares and the
  geometric reading of SVD.

This ordering is currently *implicit* in the `curriculum.ts` sequence. Making it
an explicit prerequisite graph is deferred to the platform model — see
`MULTI_DOMAIN_CURRICULUM_ARCHITECTURE.md` §3 (typed `prerequisite` edges + DAG
validation).

---

## 6. Authoring & sync checklist

When a future lesson is authored (promoted from `future` to a real lesson):

- [ ] Its central insight (from §2/§3) is the lesson's motivating frame.
- [ ] It reuses the designated prior example/notation/semantic roles for
      continuity (see `LESSON_DESIGN.md` §"Guided-to-interactive continuity").
- [ ] It advances at least one application thread and references that thread's
      previous appearance (§4).
- [ ] Its prerequisites (§5) are actually taught earlier in the spine.
- [ ] `curriculum.ts`: the matching `future` node is replaced by a `lesson` ref,
      and the registry order stays consistent with this spine.
- [ ] This document's status column is updated (future → built).
- [ ] Standard lesson artifacts + `LESSON_CORRECTNESS_CHECKLIST.md` completed.
