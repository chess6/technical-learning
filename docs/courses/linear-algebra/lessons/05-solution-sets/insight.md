# Approved Insight Contract — Solution Sets & Homogeneous Systems

Stage 2 of the [Insight Discovery Gate](../../../../authoring/insight-discovery-gate.md). Selects one
primary breakthrough from the Stage 1 brief
([courses/linear-algebra/lessons/05-solution-sets/insight-brief.md](insight-brief.md)) and verifies
its complete mathematical and pedagogical chain, then runs the mathematical audit
(Audit A) and the grounding & model-change audit (Audit B).

Primary insight selected: **Package 1** — the *difference-of-solutions* engine that
makes the decomposition \(\operatorname{Sol}(A,\mathbf{b})=\mathbf{x}_p+\operatorname{Null}(A)\)
inevitable, with the *null space carried off the origin* as its visual synthesis.
**Package 2** (homogeneous systems separate multiplicity from existence and decide
uniqueness) and **Package 3** (free variables are coordinates on independent null
directions and give the set's dimension) are **woven into the same chain** as its
purpose layer and its shape/dimension layer — not spun off as separate insights.

Notation: \(A\) is \(m\times n\), \(\mathbf{b}\in\mathbb{R}^m\);
\(\operatorname{Null}(A)=\{\mathbf{x}\in\mathbb{R}^n:A\mathbf{x}=\mathbf{0}\}\);
\(\operatorname{Sol}(A,\mathbf{b})=\{\mathbf{x}:A\mathbf{x}=\mathbf{b}\}\); column
vectors; KaTeX. The built continuity anchor is Lesson 3's dependent system
(`systems-default`): columns \((1,2),(2,4)\), with \(\mathbf{b}=(3,6)\) consistent
(solution line) and \(\mathbf{b}=(3,5)\) inconsistent (empty).

---

## Primary insight (required contents 1–11)

### 1. Diagnosed cognitive obstacle
From Stage 1a: **missing mathematical structure** (the procedure-first order hides
that the whole solution set is one object — \(\operatorname{Null}(A)\) — slid to
pass through a single solution), compounded by an **incorrect prior mental model**
("infinitely many solutions" is a shapeless list) and **missing purpose** (the
homogeneous system \(A\mathbf{x}=\mathbf{0}\) looks pointless because its obvious
answer is \(\mathbf{0}\)).

### 2. Insight mechanism(s)
**Operational + predictive** (the difference-and-add process the learner runs),
**structural compression** (one identity generates the decomposition, the
uniqueness test, and "two ⇒ infinitely many"), and **representational change** (the
solution set drawn as a subspace translated off the origin). No real-world semantic
grounding is used.

### 3. Initial mental model
Infinitely many solutions is a shapeless list the procedure spits out; two
solutions of the same system are unrelated points; \(A\mathbf{x}=\mathbf{0}\) is a
trivial special case worth skipping.

### 4. Tension / redundancy
Lesson 3 already showed the infinite case is a whole *line*, not shapeless — yet
nothing explains *why* it is a line, whether every consistent \(\mathbf{b}\) gives
the *same* shape, or why two genuine solutions of one system should be related at
all. Taught after the row-reduction procedure, the decomposition
\(\mathbf{x}_p+(\text{homogeneous})\) looks like a coincidence of that particular
reduction rather than a necessity.

### 5. The model change (what the learner now believes instead)
Pick **any one** solution \(\mathbf{x}_p\). Every other solution equals
\(\mathbf{x}_p\) plus a vector that \(A\) sends to \(\mathbf{0}\). So, **when the
system is consistent**, the entire solution set is the single object
\(\operatorname{Null}(A)\) *translated* to pass through \(\mathbf{x}_p\):
\(\operatorname{Sol}(A,\mathbf{b})=\mathbf{x}_p+\operatorname{Null}(A)\). The
homogeneous system carries **all** of the multiplicity; the particular solution
only fixes the anchor. **When inconsistent**, there is no \(\mathbf{x}_p\) and the
set is **empty**.

### 6. Full causal chain (no missing steps)

Work on a consistent system already known (Lesson 3) to have more than one
solution — e.g. \(x+2y=3,\ 2x+4y=6\), solutions include \(\mathbf{x}_1=(3,0)\) and
\(\mathbf{x}_2=(1,1)\).

- **(a) Two solutions, one difference.** \(A\mathbf{x}_1=\mathbf{b}\) and
  \(A\mathbf{x}_2=\mathbf{b}\), so by linearity
  \(A(\mathbf{x}_1-\mathbf{x}_2)=A\mathbf{x}_1-A\mathbf{x}_2=\mathbf{b}-\mathbf{b}=\mathbf{0}\).
  Here \(\mathbf{d}=\mathbf{x}_1-\mathbf{x}_2=(2,-1)\) and indeed
  \(A\mathbf{d}=(2-2,\,4-4)=\mathbf{0}\). The difference of two solutions is a
  **homogeneous** solution.
- **(b) One solution generates more.** For any \(\mathbf{x}_h\in\operatorname{Null}(A)\),
  \(A(\mathbf{x}_p+\mathbf{x}_h)=A\mathbf{x}_p+A\mathbf{x}_h=\mathbf{b}+\mathbf{0}=\mathbf{b}\)
  — so \(\mathbf{x}_p+\mathbf{x}_h\) is again a solution. The learner can therefore
  produce a **third** solution without solving: \(\mathbf{x}_1+\mathbf{d}=(5,-1)\),
  and \(A(5,-1)=(3,6)=\mathbf{b}\). ✓
- **(c) Set equality, both directions.** *(⊇)* every \(\mathbf{x}_p+\mathbf{x}_h\)
  solves the system, by (b). *(⊆)* if \(A\mathbf{x}=\mathbf{b}\), then
  \(A(\mathbf{x}-\mathbf{x}_p)=\mathbf{0}\), so
  \(\mathbf{x}-\mathbf{x}_p=\mathbf{x}_h\in\operatorname{Null}(A)\), i.e.
  \(\mathbf{x}=\mathbf{x}_p+\mathbf{x}_h\). Hence
  \(\operatorname{Sol}(A,\mathbf{b})=\mathbf{x}_p+\operatorname{Null}(A)\).
- **(d) Scope of a single difference (correctness caveat).** From two solutions we
  obtain **one** null direction \(\mathbf{d}\); the affine line
  \(\{\mathbf{x}_1+t\mathbf{d}:t\in\mathbb{R}\}\subseteq\operatorname{Sol}(A,\mathbf{b})\)
  is guaranteed — establishing **non-uniqueness and at least a line**. That line is
  the *entire* solution set **only when** \(\dim\operatorname{Null}(A)=1\). In
  general the whole set requires **all** of \(\operatorname{Null}(A)\).
  *Counterexample:* \(A=\mathbf{0}\), \(\mathbf{b}=\mathbf{0}\) in \(\mathbb{R}^2\):
  two solutions give one line, but \(\operatorname{Sol}\) is the whole plane
  (\(\dim\operatorname{Null}(A)=2\)).
- **(e) \(\operatorname{Null}(A)\) is a subspace (shape + dimension).** From
  linearity: \(\mathbf{0}\in\operatorname{Null}(A)\); if
  \(A\mathbf{u}=A\mathbf{v}=\mathbf{0}\) then \(A(\mathbf{u}+\mathbf{v})=\mathbf{0}\)
  and \(A(c\mathbf{u})=\mathbf{0}\). So \(\operatorname{Null}(A)\) is a
  point/line/plane/… **through the origin**. Its dimension is the **nullity**. This
  is where **free variables** (Package 3) enter: solving \(A\mathbf{x}=\mathbf{0}\)
  by elimination, setting one free variable to \(1\) and the rest to \(0\) and
  back-substituting yields one basis vector \(\mathbf{v}_i\); the free variables
  index a basis \(\{\mathbf{v}_1,\dots,\mathbf{v}_k\}\), \(k=n-\operatorname{rank}A\).
  So the number of free variables **is** \(\dim\operatorname{Null}(A)\).
- **(f) Visual synthesis.** Plot \(\operatorname{Null}(A)\) through the origin and
  \(\operatorname{Sol}(A,\mathbf{b})\) through \(\mathbf{x}_p\): the *same* directions,
  rigidly shifted by \(\mathbf{x}_p\). \(\operatorname{Sol}\) is an **affine** set,
  **not** a subspace — it contains \(\mathbf{0}\) only when \(\mathbf{b}=\mathbf{0}\).
  This is exactly the *linear vs affine* distinction.
- **(g) Existence vs multiplicity (Package 2, the purpose layer).** Two independent
  questions: **existence** — is \(\mathbf{b}\) in the column span? (Lesson 3) — and
  **multiplicity** — what is \(\operatorname{Null}(A)\)? Because
  \(A\mathbf{0}=\mathbf{0}\) always, \(A\mathbf{x}=\mathbf{0}\) is *always
  consistent*, so it isolates multiplicity with existence removed. Consequence: for
  a **consistent** system the solution is **unique iff**
  \(\operatorname{Null}(A)=\{\mathbf{0}\}\); equivalently \(A\mathbf{x}=\mathbf{b}\)
  has **at most one** solution for every \(\mathbf{b}\) iff
  \(\operatorname{Null}(A)=\{\mathbf{0}\}\). So \(A\mathbf{x}=\mathbf{0}\) decides
  **uniqueness (not existence)** for the whole family; "exactly one solution for
  *every* \(\mathbf{b}\)" additionally requires **surjectivity** (column span \(=\)
  whole codomain).
- **(h) Inconsistent case.** If \(\mathbf{b}\) is not in the column span
  (\(\mathbf{b}=(3,5)\) here), no \(\mathbf{x}_p\) exists; the decomposition
  presupposes a particular solution, so \(\operatorname{Sol}=\varnothing\) — **not**
  \(\mathbf{0}+\operatorname{Null}(A)\). Elimination exposes this as a contradiction
  row \(0=(\text{nonzero})\) (Lesson 4).

### 7. Minimal formal derivation

**Theorem (solution-set structure).** Let \(A\in\mathbb{R}^{m\times n}\),
\(\mathbf{b}\in\mathbb{R}^m\).

1. \(\operatorname{Null}(A)\) is a subspace of \(\mathbb{R}^n\).
2. If \(A\mathbf{x}=\mathbf{b}\) is consistent with particular solution
   \(\mathbf{x}_p\), then
   \(\operatorname{Sol}(A,\mathbf{b})=\mathbf{x}_p+\operatorname{Null}(A)
   =\{\mathbf{x}_p+\mathbf{x}_h:\mathbf{x}_h\in\operatorname{Null}(A)\}\).
   If inconsistent, \(\operatorname{Sol}(A,\mathbf{b})=\varnothing\).
3. A consistent \(A\mathbf{x}=\mathbf{b}\) has a **unique** solution
   \(\iff \operatorname{Null}(A)=\{\mathbf{0}\}\).

*Proof.* (1) closure from linearity (§6e). (2) both inclusions (§6c). (3) if
\(\operatorname{Null}(A)=\{\mathbf{0}\}\) the coset is a single point; if it
contains \(\mathbf{x}_h\neq\mathbf{0}\) then \(\mathbf{x}_p\) and
\(\mathbf{x}_p+\mathbf{x}_h\) are two distinct solutions. \(\blacksquare\)

**Parameterization.** If \(\{\mathbf{v}_1,\dots,\mathbf{v}_k\}\) is a basis of
\(\operatorname{Null}(A)\) (with \(k=n-\operatorname{rank}A\) free variables), then
\(\operatorname{Sol}(A,\mathbf{b})=\{\mathbf{x}_p+t_1\mathbf{v}_1+\cdots+t_k\mathbf{v}_k:t_i\in\mathbb{R}\}\).

### 8. Equivalence to the original object
The decomposition and the parameterization describe **exactly** the set
\(\{\mathbf{x}:A\mathbf{x}=\mathbf{b}\}\): every \(\mathbf{x}_p+\sum t_i\mathbf{v}_i\)
satisfies \(A\mathbf{x}=\mathbf{b}\) (since \(A\mathbf{x}_p=\mathbf{b}\),
\(A\mathbf{v}_i=\mathbf{0}\)), and every solution has this form (§6c). No solution
is added or lost. The particular solution \(\mathbf{x}_p\) is an **arbitrary
representative**: any solution may be used, and changing it merely re-anchors the
*same* affine set (\(\mathbf{x}_p'+\operatorname{Null}(A)=\mathbf{x}_p+\operatorname{Null}(A)\)
whenever \(\mathbf{x}_p'-\mathbf{x}_p\in\operatorname{Null}(A)\)). This
representative choice is stated explicitly, not hidden inside the equivalence.

### 9. Cost / model change (which inferences it licenses)
**Licenses (new inferences):**
- reconstruct the *entire* solution set from one solution plus
  \(\operatorname{Null}(A)\);
- predict the set's **shape/dimension** \(=\) nullity \(=\) number of free variables;
- from two distinct solutions, assert **non-uniqueness and at least a line**;
- test uniqueness of the whole family by solving \(A\mathbf{x}=\mathbf{0}\) *alone*.

**Does NOT license (guardrails, stated precisely):**
- the *full shape* from a single difference vector when
  \(\dim\operatorname{Null}(A)>1\) (one difference ⇒ at least a line, not the whole
  set — §6d);
- **existence** from \(\operatorname{Null}(A)\): \(\operatorname{Null}(A)=\{\mathbf{0}\}\)
  gives *at most one* solution per \(\mathbf{b}\), **not** that every \(\mathbf{b}\)
  is reachable (surjectivity is a separate, column-space fact);
- writing \(\mathbf{x}_p+\operatorname{Null}(A)\) for an **inconsistent** system
  (the set is empty).

### 10. What the learner can predict or do afterward (without being told)
- Given **two distinct** solutions, produce a **third** without solving and conclude
  non-uniqueness / at least an affine line.
- Given a basis of \(\operatorname{Null}(A)\) and one solution, **write the whole
  solution set** and state its dimension.
- Classify a system as **empty / a point / a positive-dimensional affine set** from
  (consistent?) × (trivial null space?), and refine the dimension from the nullity.
- **Refuse** the decomposition for an inconsistent system and call the set empty.
- **Return** from the picture / sliders to symbolic
  \(\mathbf{x}=\mathbf{x}_p+\sum t_i\mathbf{v}_i\).

### 11. Transfer assessment
- **Cosets of a linear map / affine subspaces** — *exact* structural transfer
  (\(\operatorname{Sol}\) is a coset of \(\operatorname{Null}(A)\)).
- **Rank–nullity (L9)** — *exact*: number of free variables
  \(=n-\operatorname{rank}A=\dim\operatorname{Null}(A)\).
- **Column space / null space (L8)** — *exact*: existence lives in the column space,
  multiplicity in the null space.
- **Linear ODEs / linear recurrences (general = particular + homogeneous)** — *exact
  structural* analogy (same superposition theorem for a linear operator);
  *architectural* in mechanism (different operator).
- **Least squares (L13)** — *architectural*: when \(A\mathbf{x}=\mathbf{b}\) is
  inconsistent, project onto the column space, then solve the consistent system —
  reuses existence-vs-reachability.

### 12. Semantic / operational / representational bridge (conditional)
**Representational + operational bridge (no real-world story).**
- *Representation:* two parallel sets — \(\operatorname{Null}(A)\) through the
  origin and \(\operatorname{Sol}(A,\mathbf{b})\) through \(\mathbf{x}_p\) — plus one
  **slider per free variable** (each a null direction) and Lesson 3's column
  recipe-sweep / row constraint-shift.
- *Operation:* the learner literally **subtracts** two solutions (getting a null
  vector) and **adds** null vectors to a solution (getting more solutions).
- *Why it makes the inference natural:* "same directions, shifted anchor" is
  readable at a glance, and dragging a slider **is** moving along a null direction —
  so the parameterized form is felt before it is written.

### 13. Preserved correspondences & analogy limits (conditional)

| Maps **exactly** (keep) | Property the picture must **not** add (name & discard) |
| --- | --- |
| direction(s) / dimension of \(\operatorname{Sol}\) ↔ those of \(\operatorname{Null}(A)\) | that \(\operatorname{Sol}\) is a **subspace** — it is **affine**; contains \(\mathbf{0}\) / is closed under scaling **only if** \(\mathbf{b}=\mathbf{0}\) |
| the offset of the two sets ↔ \(\mathbf{x}_p\) | that a **single** slider / one difference vector spans the whole set when nullity \(>1\) |
| one slider ↔ one independent null basis vector \(\mathbf{v}_i\) | that a "reachable-looking" picture settles **existence** — existence is a separate column-space question |
| the sweep's step ↔ a null vector | any causality / time / agency (there is no real-world scenario to import one from) |

### 14. Abstraction return (conditional)
Graded path back to symbols:
1. *Recognize the representation* — drag two solution dots; see the difference arrow
   land through the origin; slide the parallel copy.
2. *Explain the mapping* — "the arrow is a vector \(A\) kills; the offset is
   \(\mathbf{x}_p\); each slider is a null basis vector."
3. *Transfer to an unfamiliar case* — a system whose picture the learner has not
   seen, including a case with \(\dim\operatorname{Null}(A)=2\) (so one difference is
   *not* the whole set) and an inconsistent case (empty).
4. *Solve the symbolic form* — write \(\operatorname{Sol}=\mathbf{x}_p+\operatorname{span}\{\mathbf{v}_i\}\)
   and state its dimension.

**Detecting a representation-only learner:** one who can drag the picture but
(i) cannot write the symbolic decomposition, (ii) claims the whole set from a single
difference when nullity \(>1\), or (iii) writes \(\mathbf{x}_p+\operatorname{Null}(A)\)
for an inconsistent system, has acquired the picture, not the concept.

---

## Prerequisites, limitations, likely misconceptions

- **Prerequisites:** \(A\mathbf{x}=\mathbf{b}\) and linearity (L2); row/column
  pictures, consistency \(=\) \(\mathbf{b}\) in the column span, uniqueness \(=\)
  column independence, the trichotomy (L3); elimination to triangular/reduced form,
  back-substitution, the contradiction row (L4). The **closure** of
  \(\operatorname{Null}(A)\) is *derived in-lesson* from linearity, not assumed.
- **Limitations:** the single-difference scope caveat (§6d); the uniqueness detector
  is about **multiplicity, not existence** (§6g, §9); the primary examples are
  \(2\times2\) for continuity, with **at least one higher-nullity case** (e.g.
  \(A=\mathbf{0}\) in \(\mathbb{R}^2\), a plane of solutions) so the caveat is
  *experienced*, not just stated; deeper 3-variable planes stay within the POC's 2D
  visual language (shown symbolically / via free-variable count rather than a full
  3D scene).
- **Likely misconceptions:**
  - "Infinitely many solutions is shapeless." (It is a translate of a subspace.)
  - "A system could have exactly two solutions." (Two ⇒ a whole line; §6d.)
  - "One difference vector gives the whole solution set." (Only if nullity \(=1\).)
  - "A trivial null space means every \(\mathbf{b}\) is solvable." (No — at most one
    per \(\mathbf{b}\); reachability is separate.)
  - "\(\mathbf{x}_p+\text{homogeneous}\) applies to any system." (Only consistent
    ones; else empty.)
  - "The solution set is a subspace." (Affine unless \(\mathbf{b}=\mathbf{0}\).)
  - "Free variables are bookkeeping leftovers." (Each is an independent null
    direction; their count is the dimension.)

**Semantic-leverage note.** This insight has **low semantic leverage** by design —
there is no themed relabel and no real-world goal. Its power is structural +
representational + operational, and it is credited on those mechanisms, not on
vocabulary familiarity.

---

## Mathematical audit (Audit A)

| Check | Result |
| --- | --- |
| 1. Conclusion follows from derivation | PASS — subspace closure (§6e) and both inclusions (§6c) are explicit; the theorem (§7) has no asserted step. |
| 2. Sufficiency vs lower bound / scope | PASS — a single difference proves **non-uniqueness + at least a line** (sufficiency), and the text explicitly denies that it fixes the *whole* set when nullity \(>1\) (§6d, §9), with the \(A=\mathbf{0}\) counterexample. Uniqueness detector is scoped to "at most one," **not** "every \(\mathbf{b}\) reachable" (§6g, §9). |
| 3. Structure-preserving representation | PASS — the translate picture preserves direction/dimension and is explicitly labeled **affine, not a subspace** (§6f, §13). |
| 4. Hidden normalization | PASS — the arbitrary choice of representative \(\mathbf{x}_p\) is stated as an explicit invariance, not smuggled into the "equivalence" (§8). |
| 5. Nature of broader connections | PASS — cosets / rank–nullity / column–null space labeled **exact**; linear ODEs **exact structural / architectural in mechanism**; least squares **architectural** (§11). |
| 6. Notation level | PASS — subspace, coset (named lightly), nullity, free variable are all target-level; nothing expert-only is required for the chain. |

## Grounding & model-change audit (Audit B)

| Check | Result |
| --- | --- |
| B1. Model change vs clearer wording (universal) | PASS — the learner reasons differently (differencing → decomposition), not merely rephrases. |
| B2. New prediction (universal) | PASS — produce a third solution without solving; predict shape/dimension from \(\operatorname{Null}(A)\) (§10). |
| B3. Compression / purpose exposed (universal) | PASS — one identity yields decomposition, uniqueness test, and "two ⇒ ∞"; \(A\mathbf{x}=\mathbf{0}\) gains a clear purpose. |
| B4. Genuine isomorphism (grounding) | PASS — the picture's relations (offset \(=\mathbf{x}_p\); directions \(=\operatorname{Null}(A)\); slider \(=\) null basis vector) match the algebra exactly (§13, left column). |
| B5. Named pragmatic additions (grounding) | PASS — the only false properties the representation could add ("is a subspace"; "one direction spans it"; "picture settles existence") are named and discarded (§13, right column); no real-world property imported. |
| B6. Abstraction return present (grounding) | PASS — four-step return with a representation-only-learner detector (§14). |
| B7. Theme-removal test (grounding) | PASS — there is no entertaining theme to strip; the representation *is* the mathematics, so it survives trivially. |

Closing question (both audits): **more illuminating than a strong conventional
explanation?** Yes — it reorders discovery so the decomposition is *forced* by the
learner's own difference-and-add, rather than appended after a row-reduction
procedure.

---

## Review signoff

Roles may be temporarily filled by one person or model, but the artifact must not
silently self-certify. Current honest status:

| Role | Filled by | Status |
| --- | --- | --- |
| Contract author | Cursor agent (AI) | Complete |
| Mathematical reviewer | Cursor agent (AI) — **not independent** | Self-review; Audit A passed. Incorporates the external Stage-1 review's C4 (uniqueness vs existence) and single-difference-scope corrections. |
| Pedagogical reviewer | Cursor agent (AI) — **not independent** | Self-review; chain items 1–14 present. |
| User / domain-owner approval | Repository owner | **Pending review.** A docs-only authorization to run the retrospective is **not** substantive owner approval of this contract; independent human sign-off is required before any readiness/mastery claim or promotion. |
| Outstanding concerns | — | Math/pedagogical reviews are self-performed (not independent); owner approval pending. |

---

## Gate result

`Gate result: PASS`

**Exact primary insight (preserved verbatim in the Stage 3 plan's metadata for
traceability; the learner-facing lesson must preserve its mathematical meaning and
causal chain but may use shorter, clearer wording):**

> Any two solutions of a consistent \(A\mathbf{x}=\mathbf{b}\) differ by a solution
> of \(A\mathbf{x}=\mathbf{0}\); so, once one solution exists, the entire solution
> set is that one solution translated by **all** of \(\operatorname{Null}(A)\) — the
> null space carried off the origin — and the set is empty exactly when no solution
> exists. Two distinct solutions establish non-uniqueness and at least an affine
> line; pinning the full shape (its dimension) needs all of \(\operatorname{Null}(A)\),
> i.e. its free-variable basis. A trivial null space means every consistent system
> has exactly one solution (equivalently every \(\mathbf{b}\) has at most one),
> which is uniqueness, not reachability.
