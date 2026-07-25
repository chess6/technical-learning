# Approved Insight Contract — Eigenvectors, Eigenvalues & Diagonalization (L11)

Stage 2 of the [Insight Discovery Gate](../../../../authoring/insight-discovery-gate.md).
Selects one primary breakthrough from [insight-brief.md](insight-brief.md) and
verifies its complete chain, then runs Audit A (mathematics) and Audit B
(grounding & model change).

> **Retrospective, and labelled as such.** The lesson was built, then expanded to
> the full spine node, **before** this contract existed — the process order was
> violated and this document repairs it rather than pretending otherwise. Two
> consequences are recorded honestly and carried into the
> [mastery contract](mastery-contract.md): (i) the audit **ratifies** the built
> lesson's organizing insight, which it turns out to deliver in full; (ii) the
> audit also found **three overreaches** in what the built lesson and its contract
> claimed (§Audit A checks 1–2, and the abstraction-return finding in §14). Those
> are stated here and corrected there; they are not smoothed over.

Primary insight selected: **Package PB** — *a matrix's mixing is scaling in the
wrong coordinates*. **PA** (the hunt is a collapse question) is retained as its
**discovery engine**, **PD** (a repeated eigenvalue is a fork) as its
**guardrail**, and **PC** (eigenvalues are the long run) as the **entry and the
payoff**. Per the gate's clustering rule these are not competing insights; the
ranking that chose between them is in [the brief §1e](insight-brief.md#1e-ranking-the-strongest-three).

Notation: \(A\) is \(n\times n\) over \(\mathbb{R}\) (\(n=2\) in every worked
instance); \(I\) the identity; \(\operatorname{Null}(M)=\{\mathbf{x}:M\mathbf{x}=\mathbf{0}\}\);
\(P\) invertible with eigenvector columns; \(D=\operatorname{diag}(\lambda_j)\).
Column vectors; KaTeX.

---

## Primary insight (required contents 1–11)

### 1. Diagnosed cognitive obstacle
From Stage 1a: **missing purpose** (nothing earlier asked for a vector a map
merely scales), compounded by **missing structure in the search** (the
determinant's appearance is asserted, not derived) and an **incorrect prior model**
at the multiplicity stage (a repeated root read as a fact rather than a question).

### 2. Insight mechanism(s)
**Representational change** (a matrix's apparent mixing is an artifact of the basis
it was written in), plus **structural compression** (the entire lesson is L2, L6,
L7, L8, L9 and L10 spent, with no new machinery), plus **predictive/causal
reorganization** (a search over infinitely many directions becomes a finite root
hunt followed by a null-space computation).

### 3. Initial mental model
"A matrix is a table of numbers that mixes coordinates. To find out what it does I
apply it. Eigenvectors are extra special vectors defined by an equation, and
\(A=PDP^{-1}\) is a factorization to memorize."

### 4. Tension / redundancy
The learner has just been told (L10) that **a matrix was never the map** — it is a
description relative to a basis nobody mentioned — and that
\([A]_B = P^{-1}AP\) re-describes the same map in any basis they choose. That
licenses an obvious question the learner cannot yet answer: *is there a basis in
which this map's description is as simple as possible, and how simple is that?*
L10 ends by pointing at a diagonal description without being able to produce the
basis. The redundancy is exact: the machinery to answer is already complete
(collapse detection from L7, null spaces from L8, their dimensions from L9, the
basis change from L10) and has never been assembled.

### 5. The model change (what the learner now believes instead)
A matrix that appears to mix coordinates is, for most maps, doing **nothing but
independent stretching** — seen through coordinates that were never adapted to it.
Concretely:

- The map has a few directions it only **scales**: \(A\mathbf{v}=\lambda\mathbf{v}\),
  \(\mathbf{v}\ne\mathbf{0}\).
- If those directions are numerous and independent enough to form a basis, then
  describing the map in that basis (L10) gives a matrix whose every column carries
  a single number — its own eigenvalue. \(A = PDP^{-1}\).
- So "understanding a map" is partly a question of **finding its own language**;
  the entries you were handed say more about the coordinates than about the map.

Two things are therefore *not* new: the factorization (it is L10's sentence) and
the hunt (it is L7's collapse test applied to \(A-\lambda I\)).

### 6. Full causal chain

- **(a) The question L10 left open.** \([A]_B=P^{-1}AP\) re-describes the map in
  any basis. Ask for the *simplest possible* description: one where no basis
  direction is mixed into another — i.e. where each basis vector's image is a
  multiple of itself.
- **(b) That demand names the object.** A basis vector whose image is a multiple of
  itself is exactly a nonzero \(\mathbf{v}\) with \(A\mathbf{v}=\lambda\mathbf{v}\).
  The definition arrives as the *answer to (a)*, not as a stipulation. \(\mathbf{0}\)
  is excluded because \(A\mathbf{0}=\lambda\mathbf{0}\) holds for every \(\lambda\),
  which would make every number an eigenvalue.
- **(c) The search is over \(\lambda\), not over directions (PA).** Rewrite:
  \(A\mathbf{v}=\lambda\mathbf{v} \iff (A-\lambda I)\mathbf{v}=\mathbf{0}\) with
  \(\mathbf{v}\ne\mathbf{0}\) \(\iff \operatorname{Null}(A-\lambda I)\ne\{\mathbf{0}\}\)
  (L8) \(\iff A-\lambda I\) is **not invertible** (L6) \(\iff \det(A-\lambda I)=0\)
  (L7). Each link is an equivalence already proved earlier in the course, which is
  why this is a chain rather than an argument. The infinite search over directions
  has become a finite search for roots of one polynomial.
- **(d) The directions then fall out as a null space.** For each root \(\lambda\),
  the eigenvectors are \(\operatorname{Null}(A-\lambda I)\setminus\{\mathbf{0}\}\)
  — an L8 subspace, so it has a **dimension**.
- **(e) That dimension is computable, and it is the fork (PD).** By L9,
  \(\dim\operatorname{Null}(A-\lambda I) = n - \operatorname{rank}(A-\lambda I)\)
  — the **geometric multiplicity**. The **algebraic multiplicity** (how often
  \(\lambda\) repeats as a root) is a different count. A repeated root therefore
  settles nothing on its own: \(\begin{bmatrix}3&1\\0&3\end{bmatrix}\) and
  \(3I\) share \(\lambda=3\) twice and have geometric multiplicities \(1\) and
  \(2\). One rank computation tells them apart.
- **(f) Enough directions ⇒ the diagonal description (PB, the landing).** Suppose
  the eigenvectors span \(\mathbb{R}^n\). Put them in \(P\) as columns. By the
  columns rule (L2), \(AP\) has columns \(A\mathbf{v}_j = \lambda_j\mathbf{v}_j\),
  which is exactly \(PD\) with \(D=\operatorname{diag}(\lambda_j)\). So \(AP=PD\);
  \(P\) is invertible because its columns are a basis; hence \(A=PDP^{-1}\), i.e.
  \([A]_B = P^{-1}AP = D\). The column/diagonal **pairing is forced** — swap two
  columns of \(P\) and the two diagonal entries must swap too.
- **(g) The criterion is checkable *before* factoring.** \(A\) is diagonalizable
  over \(\mathbb{R}\) exactly when the geometric multiplicities of its real
  eigenvalues sum to \(n\). Both ingredients are rank computations, so the question
  is decided without attempting \(P\).
- **(h) Distinct eigenvalues suffice.** Eigenvectors for distinct eigenvalues are
  independent, so \(n\) distinct real roots always give a basis. *(Derived in the
  lesson for \(n=2\); see the scope note in Audit A check 2.)*
- **(i) Failure has two kinds (PD's guardrail).** Either a real eigenvalue supplies
  fewer directions than its algebraic multiplicity (**defective**), or there is no
  real eigenvalue at all (a rotation), in which case the hunt fails at step (c)
  before multiplicities arise. "Not diagonalizable" is not one phenomenon.
- **(j) And it is unrelated to invertibility.** \(\begin{bmatrix}2&4\\1&2\end{bmatrix}\)
  is singular with distinct eigenvalues \(4,0\) — diagonalizable;
  \(\begin{bmatrix}3&1\\0&3\end{bmatrix}\) is invertible (\(\det=9\)) and
  defective. The invertibility the construction needs is \(P\)'s, not \(A\)'s.
- **(k) What the description buys (PC's payoff).**
  \((PDP^{-1})^k = PD(P^{-1}P)D\cdots P^{-1} = PD^kP^{-1}\), using only
  associativity and \(P^{-1}P=I\) (L6). \(D^k\) raises each diagonal entry to the
  \(k\)-th power, so long-run behaviour is read off the largest \(|\lambda|\)
  without iterating.
- **(l) Forward edge.** Both failures get a rescue later: complex eigenvalues for
  the rotation, near-diagonal normal forms for the defective case, and — for every
  matrix, square or not — the SVD's two bases instead of one (L14).

### 7. Minimal formal derivation

**Definition.** \(\mathbf{v}\ne\mathbf{0}\) is an *eigenvector* of \(A\) with
*eigenvalue* \(\lambda\) when \(A\mathbf{v}=\lambda\mathbf{v}\). The *eigenspace*
of \(\lambda\) is \(\operatorname{Null}(A-\lambda I)\).

**Theorem (characteristic equation).** \(\lambda\) is an eigenvalue of \(A\)
\(\iff \det(A-\lambda I)=0\).
*Proof.* The chain of §6c, each link an equivalence proved in L6/L7/L8. \(\blacksquare\)

**Proposition (multiplicities).** For each real eigenvalue,
\(1\le\text{geometric}(\lambda)\le\text{algebraic}(\lambda)\), where
\(\text{geometric}(\lambda)=n-\operatorname{rank}(A-\lambda I)\).
*Proof of the lower bound.* \(\det(A-\lambda I)=0\) makes \(A-\lambda I\) singular,
so its null space is larger than \(\{\mathbf{0}\}\) (L8). *The upper bound is
stated, not proved* — see Audit A check 2. \(\blacksquare\)

**Theorem (diagonalization).** \(A=PDP^{-1}\) for some invertible \(P\) and
diagonal \(D\) \(\iff\) the eigenvectors of \(A\) span \(\mathbb{R}^n\)
\(\iff \sum_{\lambda\text{ real}}\text{geometric}(\lambda)=n\).
*Proof.* (\(\Leftarrow\)) §6f. (\(\Rightarrow\)) if \(A=PDP^{-1}\) then \(AP=PD\),
so each column of \(P\) is an eigenvector and those columns are a basis.
\(\blacksquare\)

**Corollary (powers).** \(A=PDP^{-1}\Rightarrow A^k=PD^kP^{-1}\) for every integer
\(k\ge0\). *Proof.* §6k. \(\blacksquare\)

**Stated, not proved:** geometric \(\le\) algebraic; independence of eigenvectors
for distinct eigenvalues **in general** (shown for two).

### 8. Equivalence to the original object
Nothing is redefined and no value changes. \(A\) and \(PDP^{-1}\) are the *same
matrix* — verified entry-wise in the worked example — and \([A]_B\) is L10's
already-defined description of the same map in a different basis. The eigenvalues
are the roots of the same characteristic polynomial a conventional treatment would
form. What changes is the **order of discovery** and the **attribution**: the
diagonal entries are not new numbers but the scale factors the learner watched on
the invariant rays, and \(P\) is not new machinery but L10's change-of-basis matrix
with a particular choice of columns. Non-uniqueness is preserved honestly: \(P\)
and \(D\) are *a* diagonalization (reorder or rescale the columns) while the
**multiset of eigenvalues** is determined.

### 9. Cost / model change

**Licenses:**
- decide **diagonalizability before factoring**, from
  \(n-\operatorname{rank}(A-\lambda I)\) alone;
- convert a repeated eigenvalue into a rank question instead of a guess;
- predict the *form* of \([A]_B\) in an eigenbasis before computing it, and know
  the column/diagonal pairing is forced;
- compute \(A^k\) as two scalar powers, and read long-run growth/decay off
  \(|\lambda|\) without iterating;
- name **which** failure occurred when a matrix is not diagonalizable.

**Does NOT license:**
- "every matrix is diagonalizable" — defective matrices and real rotations are not;
- "a repeated eigenvalue gives as many directions as its multiplicity" — that is
  exactly what must be computed;
- inferring diagonalizability from invertibility, or the converse (§6j);
- treating \(P,D\) as unique (§8);
- any claim over \(\mathbb{C}\), or any Jordan/normal-form statement — named in a
  `looking-ahead` layer, not taught;
- the spectral theorem for symmetric matrices (needs L12's orthogonality);
- reading geometric \(\le\) algebraic as *proved* here (§7).

### 10. What the learner can predict or do afterward
- Given an unfamiliar matrix with a repeated eigenvalue and no factorization
  attempted, say whether a diagonal description exists and name the one number
  that decides it.
- Given a matrix and its eigenvectors, state \([A]_B\) without multiplying, and
  say what happens to \(\det\) and trace (unchanged — L10's invariants).
- Given the eigenvalues alone, predict whether repeated application grows, decays
  or settles.
- Given "not diagonalizable", say **which** failure and produce the witness (the
  rank shortfall, or the absence of real roots).

### 11. Transfer assessment
- **Powers / dynamical systems** — *exact*: \(A^k=PD^kP^{-1}\) is the mechanism.
- **Complex eigenvalues, Jordan form (beyond this course)** — *exact*: both are the
  named repairs of the two failure modes.
- **SVD (L14)** — *architectural*: same instinct (find bases in which the map is
  diagonal), different theorem — SVD needs **two** bases and orthogonality, so it
  is not this result generalized but its successor. Labelled architectural
  deliberately.
- **Spectral theorem (L12+)** — *approximate*: symmetric matrices are always
  diagonalizable *and* orthogonally so; this lesson gives neither the symmetry
  hypothesis nor the orthogonality.
- **PCA / covariance structure in data** — *architectural*: "the directions the
  operator prefers" is the same idea, but the statistical content is not here.

### 12. Semantic / operational bridge (conditional — representational)
**Representational + operational; no real-world story.**
- *Representation:* a fan of directions under \(A\), where most rays swing off and
  a few stay on their own line; then the same map re-described in the basis those
  rays span.
- *Operation:* the learner drags a candidate until \(A\mathbf{v}\) lies back on the
  line through \(\mathbf{v}\) — the eigenvector condition as a manipulable target
  rather than an equation.
- *Why it makes the inference natural:* "which directions survive?" is answerable
  by eye before any symbol is manipulated, so the definition arrives as a name for
  something already seen, and "collect enough of them" is visibly a question about
  *how many* rays there are — which is what the multiplicity machinery then
  measures.

### 13. Preserved correspondences & analogy limits

| Maps **exactly** (keep) | Property the picture must **not** add (name & discard) |
| --- | --- |
| a ray that stays on its own line ↔ \(A\mathbf{v}=\lambda\mathbf{v}\) | that the *arrow* keeps pointing the same way — \(\lambda<0\) flips it and it is still an eigenvector |
| the scale factor on that ray ↔ \(\lambda\) | that eigenvectors have a canonical length or orientation — any nonzero multiple is one, so "the" eigenvector does not exist |
| "no ray survives" ↔ no real eigenvalue | that a matrix must have eigenvectors because you can always *look* for them — a rotation has none over \(\mathbb{R}\) |
| the number of independent surviving rays ↔ geometric multiplicity | that you can count the rays **by eye** — the defective and scalar cases look alike in a static picture and are separated only by \(\operatorname{rank}(A-\lambda I)\) |
| eigenvectors as a basis ↔ \(P\)'s columns | that the eigen-rays are **perpendicular** — they are not in general (orthogonality is L12's, for symmetric matrices) |
| \(\lambda\) as a stretch ↔ the diagonal of \(D\) | that \(D\) is *the* diagonalization — reordering or rescaling changes \(P\) and/or \(D\) |

### 14. Abstraction return
1. *Recognize* — in the fan, identify the rays that survive and the sign/size of
   their scale factors.
2. *Explain* — say why a surviving ray forces \(A-\lambda I\) to collapse, and
   therefore why a determinant answers a question about directions.
3. *Transfer* — on a matrix the learner has not watched, and with no picture,
   decide diagonalizability from \(n-\operatorname{rank}(A-\lambda I)\) *before*
   attempting a factorization, and name which failure mode applies.
4. *Symbolic* — produce \(P\) and \(D\) for a fresh matrix, verify \(A=PDP^{-1}\),
   and state the general criterion for \(n\times n\) without reference to any
   picture.

**Representation-only learner detector:** one who can narrate the fan but
(i) claims a repeated eigenvalue must give two directions, (ii) expects the
eigen-rays to be perpendicular, (iii) cannot say why the determinant is involved,
or (iv) must attempt the factorization to discover it fails, has the picture, not
the concept.

**Finding (carried to the mastery contract).** Steps 3 and 4 are *designed* into
the built lesson but are **not evidenced at the level they claim**: every
transfer-tier item in the built lesson is either multiple-choice (recognition) or a
scaffolded `exercise-sequence` that hands over the characteristic polynomial and
the shifted matrix. The abstraction return is therefore **prepared, not attained**
at steps 3–4, and the mastery contract's E4 claim is recalibrated accordingly.

---

## Prerequisites, limitations, likely misconceptions

- **Prerequisites:** the columns rule (L2); composition, \(P^{-1}P=I\),
  associativity, invertibility ⟺ trivial null space (L6); \(\det=0\) as collapse
  (L7); \(\operatorname{Null}(\cdot)\) as a subspace (L8); its dimension as
  \(n-\operatorname{rank}\) (L9); \([A]_B=P^{-1}AP\) and the invariants (L10).
  All built.
- **Limitations:** \(\mathbb{R}\) only — complex eigenvalues are *named*, never
  computed. Every worked instance is \(2\times2\); the \(n\times n\) statements are
  made but not drilled. Geometric \(\le\) algebraic is stated without proof.
  Independence for distinct eigenvalues is derived for two vectors and asserted in
  general. No Jordan form, no minimal polynomial, no spectral theorem, no numerical
  eigenvalue algorithms.
- **Likely misconceptions:**
  - "Eigenvectors live on the coordinate axes."
  - "An eigenvector must keep pointing the same way" (\(\lambda<0\)).
  - "A repeated eigenvalue gives two independent directions."
  - "A singular matrix cannot be diagonalized" / "invertible ⇒ diagonalizable".
  - "Algebraic multiplicity *is* geometric multiplicity."
  - "\(P\) and \(D\) are unique."
  - "Every matrix has (real) eigenvectors — you just have to look harder."

---

## Mathematical audit (Audit A)

| Check | Result |
| --- | --- |
| 1. Conclusion follows | **PASS with one correction.** §6c derives the characteristic equation as a chain of already-proved equivalences rather than asserting it; §6f derives \(AP=PD\) from the columns rule; §6k derives the power law from associativity. Every numeric instance in the built lesson was re-verified against `src/math` and by hand (\(A=\begin{bmatrix}3&1\\0&2\end{bmatrix}\): \(P,D,P^{-1}\), \(PDP^{-1}=A\), \(A^5=\begin{bmatrix}243&211\\0&32\end{bmatrix}\) against five direct multiplications; the fresh \(\begin{bmatrix}4&2\\1&3\end{bmatrix}\): \(\lambda=5,2\) with eigenvectors \((2,1),(1,-1)\); the singular \(\begin{bmatrix}2&4\\1&2\end{bmatrix}\): \(\lambda=4,0\)). **Correction:** the *converse* direction of the diagonalization theorem (\(A=PDP^{-1}\Rightarrow\) the columns of \(P\) are eigenvectors) was implicit; it is written out in §7 so the "if and only if" is earned in both directions. |
| 2. Sufficiency / scope | **PASS after two scope corrections.** (i) The built lesson states "\(n\) **distinct** real eigenvalues always suffice" in general, but its supporting note derives independence for **two** vectors only. Recorded here as *derived for \(n=2\), stated in general* (§6h, §7) — no learner-facing claim is withdrawn, but the mastery contract's D6 line "derivations are shown for every stated result" is corrected. (ii) **geometric \(\le\) algebraic is stated without any derivation** anywhere in the built lesson, while its interpretation leans on it ("never more than its algebraic count"). It is now listed under "stated, not proved" in §7 and §9. Both are honest P2 scope choices; neither was previously written down. |
| 3. Structure-preserving representation | PASS — the invariant-ray fan maps exactly onto \(A\mathbf{v}=\lambda\mathbf{v}\), and the six properties the picture could falsely add (fixed orientation, canonical length, guaranteed existence, countable-by-eye multiplicity, perpendicularity, uniqueness of \(P,D\)) are each named and discarded (§13). |
| 4. Hidden normalization | PASS — the non-uniqueness of \(P\) and \(D\) is stated as a trap rather than hidden; eigenvector scaling is explicitly free; the \(2\times2\) restriction is named, not disguised as generality. |
| 5. Nature of connections | PASS — powers/dynamics and the two named repairs (complex eigenvalues, near-diagonal normal forms) are **exact**; the spectral theorem is **approximate** (it needs hypotheses this lesson does not have); SVD and PCA are **architectural**. The built lesson's `looking-ahead` layer already calls the SVD "a different factorization … at the cost of using two bases rather than one", which is the honest labelling; §11 records the same judgment explicitly so no later artifact can upgrade it to "this result generalized". |
| 6. Notation level | PASS — \(\lambda\), \(\det\), \(\operatorname{Null}\), \(\operatorname{rank}\), \(P^{-1}AP\), \(\operatorname{diag}\) are all in the learner's vocabulary from L6–L10. No characteristic-polynomial-as-operator, no minimal polynomial, no direct sums. |

## Grounding & model-change audit (Audit B)

| Check | Result |
| --- | --- |
| B1. Model change vs wording | PASS — the learner stops believing the entries describe the map and starts believing the entries describe the *coordinates*; afterwards they can predict \([A]_B\)'s form before computing it. |
| B2. New prediction | PASS — diagonalizability decided from one rank, before factoring (§10); long-run behaviour from \(|\lambda|\). |
| B3. Compression / purpose | PASS — the lesson adds no new machinery (§2, §6): it spends L2, L6, L7, L8, L9, L10. Purpose is supplied *before* the definition by PC's entry question ("what if you had to apply it a hundred times?"). |
| B4. Genuine isomorphism | PASS — surviving ray ↔ eigenvector, scale factor ↔ eigenvalue, count of independent rays ↔ geometric multiplicity (§13 left column). |
| B5. Named pragmatic additions | PASS — six additions named and discarded (§13 right column), including the two the picture most strongly suggests (perpendicularity and countability by eye). |
| B6. Abstraction return | **PASS as designed; the *evidence* falls short.** The four steps are present and the detector is specific (§14), and the built lesson genuinely reaches steps 1–2. Steps 3–4 are scaffolded to the point where the learner is handed the characteristic polynomial and the shifted matrix, so the return is prepared rather than demonstrated. Recorded as a finding, not waved through; the mastery contract's evidence table is recalibrated and the unmet transfer obligation is given an owner. |
| B7. Theme removal | PASS — no decorative theme; the representation (rays under a map) *is* the mathematics. |

Closing question: **more illuminating than a strong conventional explanation?**
Yes. The conventional order (define \(A\mathbf{v}=\lambda\mathbf{v}\) → form the
characteristic polynomial → solve → collect \(P\) and \(D\)) supplies four
procedures and no reason to want any of them, and leaves the determinant's
appearance unexplained. This order supplies the question from L10's own unfinished
business, derives the determinant from collapse the learner already understands,
and makes the factorization a re-description rather than a new object.

---

## Review signoff

| Role | Filled by | Status |
| --- | --- | --- |
| Contract author | Claude Code agent (AI) | Complete (retrospective) |
| Mathematical reviewer | Claude Code agent (AI) — **not independent** | Self-review; Audit A passed after the converse direction was written out and two scope limits (geometric \(\le\) algebraic; distinct-eigenvalue independence beyond \(n=2\)) were recorded as stated-not-proved. |
| Pedagogical reviewer | Claude Code agent (AI) — **not independent** | Self-review; chain items 1–14 present. Audit B6 records the abstraction-return evidence shortfall rather than passing it silently. |
| User / domain-owner approval | Repository owner | **Requested this audit** ("Run a proper Stage 1–2 semantic audit for expanded Eigenvectors"). Independent math/pedagogy review still outstanding. |
| Outstanding concerns | — | (1) No independent reviewer. (2) The lesson owes genuine E4 transfer evidence — see [mastery-contract §1d](mastery-contract.md#1d-outcomes-with-evidence); the obligation is recorded with an owner, not discharged here. (3) Every instance is \(2\times2\); the \(n\times n\) claims rest on statement, not practice. |

---

## Gate result

`Gate result: PASS`

The contract passes as a **ratification of the built lesson's organizing insight**,
with three findings recorded and routed (Audit A checks 1–2, Audit B6). It does
**not** certify the lesson's evidence claims — that is Gate 8's job, and the
mastery contract is corrected accordingly.

**Exact primary insight (verbatim for the Stage 3 plan's metadata):**

> A matrix that appears to mix your coordinates is, for most maps, doing nothing
> but **independent stretching** — seen in coordinates that were never adapted to
> it. Lesson 10 said a matrix was only a description in some basis; this lesson
> finds the basis the map itself prefers. Its vectors are the directions the map
> merely **scales**, and they are found not by searching among directions but by
> asking which \(\lambda\) makes \(A-\lambda I\) **collapse** — a question
> \(\det = 0\) has answered since Lesson 7, whose solutions are the null space
> Lesson 8 named and whose *count* is the dimension Lesson 9 computes. Collect
> enough of them and \([A]_B\) is **diagonal**: \(A=PDP^{-1}\), so \(A^k=PD^kP^{-1}\)
> and the largest \(|\lambda|\) governs the long run. When the count falls short
> the matrix is **defective**, and when there is no real root the hunt fails
> earlier still — two different failures, neither of them about whether \(A\) is
> invertible.
