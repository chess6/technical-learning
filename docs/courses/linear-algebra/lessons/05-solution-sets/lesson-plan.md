# Lesson plan — Solution Sets & Homogeneous Systems

Stage 3 of the [Insight Discovery Gate](../../../../authoring/insight-discovery-gate.md). Built on the
PASS [Approved Insight Contract](insight.md). Follows
[authoring/lesson-design.md](../../../../authoring/lesson-design.md) and [engineering/math-correctness.md](../../../../engineering/math-correctness.md).

## Approved insight (gate)
- Insight Contract: `docs/courses/linear-algebra/lessons/05-solution-sets/insight.md`
- [x] `Gate result: PASS` confirmed
- Exact primary insight — **verbatim, planning metadata only**:
  > Any two solutions of a consistent \(A\mathbf{x}=\mathbf{b}\) differ by a
  > solution of \(A\mathbf{x}=\mathbf{0}\); so, once one solution exists, the entire
  > solution set is that one solution translated by **all** of
  > \(\operatorname{Null}(A)\) — the null space carried off the origin — and the set
  > is empty exactly when no solution exists. Two distinct solutions establish
  > non-uniqueness and at least an affine line; pinning the full shape (its
  > dimension) needs all of \(\operatorname{Null}(A)\), i.e. its free-variable
  > basis. A trivial null space means every consistent system has exactly one
  > solution (equivalently every \(\mathbf{b}\) has at most one), which is
  > uniqueness, not reachability.
- Learner-facing phrasing: "Subtract two solutions and you always land on a
  solution of \(A\mathbf{x}=\mathbf{0}\). So one solution plus **all** of the null
  space *is* the whole solution set — the null space slid off the origin."
- Diagnosed cognitive obstacle: missing structure (the procedure hides that the
  whole set is one object translated), plus "infinitely many = shapeless" and
  "\(A\mathbf{x}=\mathbf{0}\) is pointless."
- Insight mechanism(s): operational + predictive grounding, structural
  compression, representational change. (Low semantic leverage by design.)
- Grounded (representational bridge), so:
  - Bridge: two parallel sets — \(\operatorname{Null}(A)\) through the origin and
    \(\operatorname{Sol}(A,\mathbf{b})\) through \(\mathbf{x}_p\) — plus one slider
    per free/null direction; the difference/addition operation on solutions.
  - Named analogy limits to discard: the solution set is **affine, not a
    subspace** (contains \(\mathbf{0}\) only when \(\mathbf{b}=\mathbf{0}\)); one
    difference direction is **not** the whole set when nullity \(>1\); a
    reachable-looking picture does **not** settle existence.
  - Abstraction return: drag/slide → name the correspondence (arrow = null vector,
    offset = \(\mathbf{x}_p\), slider = null basis vector) → unfamiliar case
    (nullity 2, inconsistent) → write \(\mathbf{x}=\mathbf{x}_p+\sum t_i\mathbf{v}_i\).

---

## Lesson title
Solution Sets & Homogeneous Systems

## Route / ids
- Route: `/lesson/solution-sets`
- `guidedSceneId`: `solution-sets`
- `explorationId`: `solution-sets`

## Motivating question
You already know one solution of a consistent system, and you find a *second*.
Without solving again, can you produce a *third* — and say what the whole set of
solutions looks like?

## Learning objectives
- [ ] Discover that **two solutions of one system differ by a solution of
      \(A\mathbf{x}=\mathbf{0}\)** — before the theorem is stated.
- [ ] Generate new solutions from a known one by adding null-space vectors.
- [ ] State and use the decomposition \(\operatorname{Sol}(A,\mathbf{b}) =
      \mathbf{x}_p + \operatorname{Null}(A)\) for a **consistent** system, and know
      it is **empty** otherwise.
- [ ] Distinguish what one null **direction** gives (at least an affine line) from
      what the **whole** null space gives (the full shape / dimension).
- [ ] See \(\operatorname{Null}(A)\) as a subspace through the origin and
      \(\operatorname{Sol}\) as its **affine translate** (not a subspace).
- [ ] Separate **existence** (is \(\mathbf{b}\) reachable?) from **multiplicity**
      (is the null space trivial?), and read uniqueness off \(A\mathbf{x}=\mathbf{0}\).
- [ ] Connect **free variables** to independent null directions and the set's
      dimension.
- [ ] Handle unique, infinitely-many, homogeneous, and inconsistent cases; return
      from every picture to symbolic \(\mathbf{x}=\mathbf{x}_p+\sum t_i\mathbf{v}_i\).

## Shared examples
- Main example id: `systems-default` (`LINEAR_SYSTEM_EXAMPLE`) — **the same
  numbers** as Lessons 1, 3, 4. Dependent columns \((1,2),(2,4)\); consistent
  \(\mathbf{b}=(3,6)\) gives \(\mathbf{x}_p=(3,0)\), null direction \((2,-1)\), so
  \((3,0),(1,1),(5,-1)\) are all solutions; \(\mathbf{b}=(3,5)\) is inconsistent.
- Supporting: the independent matrix \(A=[(1,3),(2,-1)]\) with \(\mathbf{b}=(-1,5)\)
  (unique \((2,-1)\)); the **zero matrix** with \(\mathbf{b}=\mathbf{0}\) (whole
  plane — the nullity-2 caveat case); the homogeneous \(\mathbf{b}=\mathbf{0}\) on
  the dependent matrix (null line through the origin).

## Supporting concepts
- Homogeneous system \(A\mathbf{x}=\mathbf{0}\); null space as a subspace; affine
  set vs subspace; particular solution; free variables as null coordinates.
  Introduced *inside* the main arc (not as separate mini-lessons).

## Guided-scene outline (Watch) — `solution-sets`
Solution space \((x,y)\). One idea per beat; the theorem is *earned*, not shown up
front.

| Step id | Name (learner-facing) | Idea revealed | Notation synced |
| --- | --- | --- | --- |
| `two-solutions` | Two solutions of one system | Two dots both solve \(A\mathbf{x}=\mathbf{b}\) | \(A\mathbf{x}_1=A\mathbf{x}_2=\mathbf{b}\) |
| `difference` | Subtract them | \(\mathbf{x}_1-\mathbf{x}_2\) sent to \(\mathbf{0}\); lands on \(A\mathbf{x}=\mathbf{0}\) | \(A(\mathbf{x}_1-\mathbf{x}_2)=\mathbf{0}\) |
| `generate` | Add it back for more | \(\mathbf{x}_p+\mathbf{d}\) is again a solution — a third without solving | \(A(\mathbf{x}_p+\mathbf{d})=\mathbf{b}\) |
| `null-line` | The homogeneous line | All differences fill \(\operatorname{Null}(A)\) through the origin | \(\operatorname{Null}(A)=\{t\,\mathbf{d}\}\) |
| `translate` | The set is the null line, shifted | \(\operatorname{Sol}=\mathbf{x}_p+\operatorname{Null}(A)\); affine, not through \(\mathbf{0}\) | \(\operatorname{Sol}(A,\mathbf{b})=\mathbf{x}_p+\operatorname{Null}(A)\) |
| `cases` | Empty, a point, a line | inconsistent → empty; trivial null space → one point | existence vs multiplicity |

- Pauses / dimming: paused \(t=0\) shows grid + origin + both solution dots + title
  (establishing frame). Focus choreography dims the rest when the difference arrow
  is the subject.
- Honest labelling: the difference is drawn once at its natural location and once
  translated to the origin; the translated copy is explicitly the *same* vector, so
  no motion implies a false equality.

## Checkpoint (Check understanding)
- Prompt: You know \((3,0)\) and \((1,1)\) both solve the system. Give a third
  solution **without** solving, and say what the whole solution set is.
- Type: prediction.
- Reveal: difference \((2,-1)\) is a null vector, so \((3,0)+(2,-1)=(5,-1)\) solves
  it; the whole set is \((3,0)+\{t(2,-1)\}\) — the null line slid to pass through a
  solution. (Full *shape* needs all of \(\operatorname{Null}(A)\); here it is 1-D.)

## Interactive controls (Explore) — `solution-sets`
- Two linked solution-space panels: **left** \(A\mathbf{x}=\mathbf{0}\) (null space
  through the origin), **right** \(A\mathbf{x}=\mathbf{b}\) (the same shape
  translated by \(\mathbf{x}_p\), or empty).
- Primary controls: case preset (Infinitely many / Unique / Homogeneous /
  Inconsistent / Whole plane \(A=\mathbf{0}\)); a **free-variable slider \(t\)**
  that slides a second solution \(\mathbf{x}_p+t\mathbf{v}\) along the set; a toggle
  "show the difference is a null vector."
- Primary readouts (KaTeX): solution-set kind (empty / point / line / plane);
  \(\mathbf{x}_p\); null space (kind + basis \(\mathbf{v}\)); the generated
  solution \(\mathbf{x}_p+t\mathbf{v}\) and a live check \(A(\cdot)=\mathbf{b}\).
- Progressive disclosure: numeric \(A\) / \(\mathbf{b}\) entries behind a
  `<details>`; presets + slider + one toggle shown first.
- Clamp ranges: entries \(\pm 5\), \(t\in[-4,4]\), points clamped to the bound.
- Reset: back to "Infinitely many" with the difference toggle on.

## Exercises (Practice)
| # | Objective | Type | Deterministic answer | Feedback |
| --- | --- | --- | --- | --- |
| 1 | Difference of two solutions is homogeneous | multiple-choice | \(A(\mathbf{x}_1-\mathbf{x}_2)=\mathbf{0}\) | linearity |
| 2 | Generate a third solution | vector | \((5,-1)\) | \(\mathbf{x}_p+\mathbf{d}\) |
| 3 | Write the whole solution set | prediction | \((3,0)+t(2,-1)\) | translate of null line |
| 4 | Scope caveat: one difference ≠ whole set (nullity 2) | multiple-choice | "at least a line, not the whole plane" | \(A=\mathbf{0}\) counterexample |
| 5 | Existence vs multiplicity | multiple-choice | trivial null space ⇒ at most one, **not** every \(\mathbf{b}\) reachable | injectivity ≠ surjectivity |
| 6 | Inconsistent ⇒ empty (transfer) | prediction | \(\varnothing\); no \(\mathbf{x}_p\) | decomposition needs a particular solution |
| 7 | Free variables ↔ dimension | multiple-choice | #free variables \(=\dim\operatorname{Null}(A)\) | parameterization |

## Insight traceability (required)
| Contract obligation | Learner-facing location | Evidence of understanding |
| --- | --- | --- |
| §6a–b Two solutions, difference is homogeneous | Watch `two-solutions`/`difference`; Ex 1 | Learner states \(A(\mathbf{x}_1-\mathbf{x}_2)=\mathbf{0}\) |
| §6b One solution generates more | Watch `generate`; Check; Ex 2 | Learner produces a third solution without solving |
| §6c Set equality both directions | Formal theorem; worked example | Learner writes \(\operatorname{Sol}=\mathbf{x}_p+\operatorname{Null}(A)\) |
| §6d Scope of one difference (nullity>1) | Explore "Whole plane"; Ex 4 | Learner refuses "whole set" from one direction |
| §6e Null(A) subspace; free variables/dimension | Section; Explore readout; Ex 7 | Learner links #free variables to dimension |
| §6f Visual synthesis (affine translate) | Watch `translate`; Explore two panels | Learner identifies the set as the null space shifted, not a subspace |
| §6g Existence vs multiplicity; uniqueness | Formal corollary; Ex 5 | Learner separates reachability from trivial null space |
| §6h Inconsistent ⇒ empty | Watch `cases`; callout; Ex 6 | Learner calls the set empty and says why |
| Bridge (two parallel sets, slider) | Explore | Learner uses the slider as a null direction |
| Analogy limits (affine≠subspace; 1 dir≠set; picture≠existence) | Callouts; Ex 4/5 | Learner names each discarded property |
| Abstraction return | Explore → symbolic readout; Ex 3/6 | Learner writes the symbolic set from the picture |

## Key takeaway (Summarize)
Subtract two solutions and you land in \(\operatorname{Null}(A)\); add null vectors
to one solution and you get them all. So a consistent system's solution set is
\(\mathbf{x}_p+\operatorname{Null}(A)\) — the null space carried off the origin —
and it is empty when no solution exists.

## Notation
- \(\operatorname{Null}(A)\), \(\operatorname{Sol}(A,\mathbf{b})\), \(\mathbf{x}_p\),
  \(\mathbf{x}=\mathbf{x}_p+t\mathbf{v}\), \(\mathbf{e}_1,\mathbf{e}_2\); column
  vectors; KaTeX everywhere.

## Edge cases
- Inconsistent (empty); homogeneous (\(\mathbf{b}=\mathbf{0}\), set through origin);
  unique (null \(=\{\mathbf{0}\}\), a point); zero matrix (\(\dim\operatorname{Null}=2\),
  whole plane — exercises the single-difference caveat).

## Mathematical invariants to assert
- [ ] `solutionSet2x2` kind matches the trichotomy × null space.
- [ ] every generated \(\mathbf{x}_p+t\mathbf{v}\) satisfies \(A\mathbf{x}=\mathbf{b}\).
- [ ] difference of two solutions lies in \(\operatorname{Null}(A)\).
- [ ] `nullspaceBasis2x2` only called on singular \(A\) (branch on independence).
- [ ] inconsistent ⇒ `{ kind: "empty" }`; independent ⇒ `{ kind: "point" }`.

## Required tests
- [ ] Unit tests for `solutionSet2x2` / `particularSolution2x2` (all five kinds).
- [ ] Invariant tests (generated point solves; difference in null space).
- [ ] Lesson wiring test (scene + explorer resolve; curriculum shows it built).
- [ ] Browser test (Playwright): representative states + viewport.

## Acceptance checklist
- [x] Approved Insight Contract linked and PASS; exact insight verbatim in metadata.
- [x] Insight traceability table complete.
- [ ] Composed route from the block palette (guided Watch before Explore).
- [ ] Guided-to-interactive continuity (same `systems-default` numbers/roles).
- [ ] Progressive disclosure; KaTeX + \(\mathbf{e}_1,\mathbf{e}_2\); accessibility.
- [ ] Viewport/zoom checks; [quality/lesson-correctness-checklist.md](../../../../quality/lesson-correctness-checklist.md).
- [ ] All tests pass.
