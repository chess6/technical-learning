# Approved Insight Contract — Change of Basis (L10)

Stage 2 of the [Insight Discovery Gate](../../../../authoring/insight-discovery-gate.md),
selecting from [insight-brief.md](insight-brief.md), with Audits A and B.

Primary insight: **Package P1** — *a matrix was never the map; it is a map's
description relative to a basis nobody mentioned.* **P2** (\(P^{-1}AP\) read as a
three-word sentence) is the mechanism; **P3** (choose the language that shortens
the sentence) is the motive and the forward edge; **P4** (what survives
translation) is the closing synthesis.

Notation: \(E\) is the standard basis; \(B=(\mathbf{b}_1,\mathbf{b}_2)\) another
basis; \([\mathbf{x}]_B\) the coordinate vector of \(\mathbf{x}\) in \(B\);
\(P=[\,\mathbf{b}_1\ \mathbf{b}_2\,]\) with the new basis vectors written **in
standard coordinates**.

---

## Primary insight (contents 1–11)

### 1. Diagnosed cognitive obstacle
**Misleading notation** + an **incorrect prior mental model**. Nine lessons have
written \((4,1)\) and \(\begin{bmatrix}3&1\\0&2\end{bmatrix}\) unannotated, so the
learner believes those *are* the objects. L1's "coordinates are a choice" has
decayed into a slogan because nothing since required it. As a result "change of
basis" sounds like something done *to a vector*, and \(P^{-1}AP\) is
uninterpretable. Secondary: three easily-confused objects (\(P\), \(P^{-1}\),
\(P^{-1}AP\)) and a direction convention that is routinely inverted.

### 2. Insight mechanism(s)
**Predictive/causal reorganization** (every prior matrix is re-read as carrying a
hidden subscript), **representational change** (one arrow read against two grids),
and **operational grounding** (the sandwich as a composition to execute, not a
formula to recall).

### 3. Initial mental model
"A vector *is* its list of numbers; a matrix *is* the map. A different basis
somehow moves or rewrites the vector."

### 4. Tension / redundancy
L1 proved that a basis gives *unique* coordinates and showed \(\mathbf{p}=(4,1)\)
has coordinates \((1,1)\) in \(B=((1,2),(3,-1))\) — two different lists for one
unmoved point. Yet every lesson since has written a single unlabelled list per
vector, as if there were nothing to choose. Either L1's uniqueness result was
about something inessential, or nine lessons of notation have been suppressing a
choice. It is the latter, and the suppressed choice is always the same one: \(E\).

### 5. The model change
A matrix is a **description**. Writing \(A\) without saying which basis is like
quoting a sentence without naming the language — usually harmless, because
everyone assumes \(E\), and fatal the moment a second basis appears. So:

- a vector \(\mathbf{x}\) has *coordinates* \([\mathbf{x}]_B\) in each basis; the
  vector does not move when \(B\) changes;
- \(P=[\,\mathbf{b}_1\ \mathbf{b}_2\,]\) converts **B-coordinates to standard
  coordinates**: \(\mathbf{x}=P[\mathbf{x}]_B\), hence \([\mathbf{x}]_B=P^{-1}\mathbf{x}\);
- a *map* likewise has a matrix per basis, and the two are related by
  \([A]_B=P^{-1}AP\) — read right to left: translate into standard, act, translate back.

### 6. Full causal chain

- **(a) Coordinates are a solve, not a new idea.** \([\mathbf{x}]_B\) is the
  \(\mathbf{c}\) with \(c_1\mathbf{b}_1+c_2\mathbf{b}_2=\mathbf{x}\) — i.e. the
  solution of \(P\mathbf{c}=\mathbf{x}\), a Lesson 3 system. It exists and is
  unique exactly because a basis is independent and spanning (L1), which by L6/L8
  is exactly the statement that \(P\) is invertible.
- **(b) \(P\)'s direction is forced by its construction.** Its columns are
  \(\mathbf{b}_j\) *written in standard coordinates*, so \(P\mathbf{e}_j=\mathbf{b}_j\):
  feed it the B-coordinates of \(\mathbf{b}_1\) (namely \(\mathbf{e}_1\)) and it
  returns \(\mathbf{b}_1\) in standard coordinates. Hence \(P:\) B-coords \(\to\)
  standard, and \(P^{-1}:\) standard \(\to\) B-coords. The learner never has to
  remember the direction; it is readable off the columns.
- **(c) Worked instance (L1's numbers).** \(B=((1,2),(3,-1))\),
  \(P=\begin{bmatrix}1&3\\2&-1\end{bmatrix}\), \(\mathbf{p}=(4,1)\).
  \(P^{-1}\mathbf{p}=(1,1)=[\mathbf{p}]_B\), and \(P(1,1)=(1,2)+(3,-1)=(4,1)\;\checkmark\).
  The point did not move; only its name changed.
- **(d) A map needs a matrix per basis.** \([A]_B\) must satisfy
  \([A\mathbf{x}]_B=[A]_B[\mathbf{x}]_B\) for all \(\mathbf{x}\). Substituting
  \([\mathbf{x}]_B=P^{-1}\mathbf{x}\) and \([A\mathbf{x}]_B=P^{-1}A\mathbf{x}\)
  gives \(P^{-1}A\mathbf{x}=[A]_BP^{-1}\mathbf{x}\) for all \(\mathbf{x}\), so
  \([A]_BP^{-1}=P^{-1}A\), i.e. \([A]_B=P^{-1}AP\). **Derived, not asserted.**
- **(e) The sandwich is a sentence.** Right to left (L6's convention):
  \(P\) turns a B-coordinate vector into standard coordinates, \(A\) acts there,
  \(P^{-1}\) translates the answer back. Each factor's job is legible, which is
  why the order cannot be guessed wrong once (b) is in hand.
- **(f) Some languages make the sentence short (P3).** If \(B\) happens to be a
  basis of vectors that \(A\) merely scales, then \([A]_B\) is **diagonal**. For
  \(A=\begin{bmatrix}3&1\\0&2\end{bmatrix}\) with \(B=((1,0),(-1,1))\):
  \(P=\begin{bmatrix}1&-1\\0&1\end{bmatrix}\) and \(P^{-1}AP=\begin{bmatrix}3&0\\0&2\end{bmatrix}\).
  The map is unchanged; the description became trivial.
- **(g) What survives translation (P4).** \(\det\), rank, nullity and trace are
  the same for \(A\) and \(P^{-1}AP\): \(\det(P^{-1}AP)=\det(P)^{-1}\det A\det P=\det A\)
  by L7's multiplicativity; rank and nullity are unchanged because \(P\) and
  \(P^{-1}\) are invertible and so lose nothing (L8/L9). Those are facts about the
  **map**; the entries are facts about the description.
- **(h) Forward edge.** L11 will ask for directions a map only scales. Combined
  with (f), that is the recipe for **diagonalization**, and (g) explains why
  eigenvalues can be computed from any description: they are basis-independent.

### 7. Minimal formal derivation

**Definition.** For a basis \(B=(\mathbf{b}_1,\dots,\mathbf{b}_n)\) of
\(\mathbb{R}^n\), the *change-of-basis matrix* is \(P=[\,\mathbf{b}_1\ \cdots\ \mathbf{b}_n\,]\)
(columns in standard coordinates). \(P\) is invertible.

**Proposition.** \(\mathbf{x}=P[\mathbf{x}]_B\) and \([\mathbf{x}]_B=P^{-1}\mathbf{x}\).

**Theorem (similarity).** \([A]_B=P^{-1}AP\). *Proof:* §6d.

**Definition.** \(A\) and \(C\) are *similar* if \(C=P^{-1}AP\) for some
invertible \(P\).

**Proposition (invariants).** Similar matrices have equal determinant, rank,
nullity and trace. *(Determinant proved via L7; rank/nullity via invertibility;
trace **stated**, not proved.)*

**Corollary.** If \(B\) consists of vectors \(A\) scales, \([A]_B\) is diagonal.

### 8. Equivalence to the original object
Nothing is redefined: \([\mathbf{x}]_B\) is L1's coordinate vector and \(P\) is
the matrix whose columns are the basis vectors — an object the learner has built
since L2. The genuinely new commitment is **notational**: that every earlier
unannotated matrix meant \([A]_E\). That is a re-reading of past work, and §6c
verifies on L1's own numbers that the re-reading changes no computed value.

### 9. Cost / model change

**Licenses:** convert coordinates both ways and say which direction \(P\) goes,
from its columns; produce \([A]_B\); recognize that \(\det\), rank, nullity and
trace are basis-independent; see why a well-chosen basis diagonalizes.

**Does NOT license:**
- treating \(P^{-1}AP\) and \(PAP^{-1}\) as interchangeable — they are inverse
  conventions, and which is which is fixed by \(P\)'s columns;
- claiming the *vector* changes (only its coordinates do);
- concluding that similar matrices are equal, or that equal determinant/trace
  implies similarity (**false** — stated explicitly, with a counterexample);
- assuming every matrix is diagonalizable (L11's defective case; L9 already gives
  the test, geometric multiplicity \(<\) algebraic);
- any claim about orthonormal bases or that \(P^{-1}=P^{\mathsf T}\) — that needs
  L12.

### 10. What the learner can predict or do afterward
- Given \(B\) and \(\mathbf{x}\), produce \([\mathbf{x}]_B\), and check by
  rebuilding \(\mathbf{x}\).
- Say, without recall, which of \(P\), \(P^{-1}\) converts in which direction, by
  reading \(P\)'s columns.
- Produce \([A]_B\) and verify it acts correctly on a coordinate vector.
- Predict that \(\det\) and trace are unchanged, and that entries are not.
- Explain why a basis of scaled directions gives a diagonal matrix.

### 11. Transfer assessment
- **Diagonalization / eigenvectors (L11)** — *exact*.
- **SVD (L14)** — *exact*: \(A=U\Sigma V^{\mathsf T}\) is two basis changes with a
  diagonal action between.
- **Similarity as "same map, different description"** — *exact*.
- **Units / coordinate frames in physics and graphics** — *architectural*: the
  same quantity described in metres or feet, or in world vs camera frame; labelled
  as an analogy, not a theorem.
- **Compression / feature bases** — *architectural*.

### 12. Bridge
**Representational + operational.** One arrow, drawn once, read against **two
grids**: the standard square grid and the skewed \(B\)-grid. The arrow never
moves; the grid under it is swapped, and the readout changes. Then the same
treatment for a map: the deforming picture is identical while the matrix beside
it changes from \(\begin{bmatrix}3&1\\0&2\end{bmatrix}\) to
\(\begin{bmatrix}3&0\\0&2\end{bmatrix}\).

### 13. Preserved correspondences & analogy limits

| Maps **exactly** (keep) | Property the picture must **not** add (name & discard) |
| --- | --- |
| the unmoved arrow ↔ the vector | that the *vector* changes when the grid does — nothing about the arrow moves |
| the grid ↔ the chosen basis | that the B-grid must be at right angles or unit-spaced; it is neither in general (orthonormality is L12) |
| the readout ↔ \([\mathbf{x}]_B\) | that the numbers are "the vector"; they are its name in one language |
| identical deformation, different matrix ↔ similarity | that similar matrices are interchangeable, or that equal det/trace implies similar |

### 14. Abstraction return
1. *Recognize* — swap the grid; watch the readout change and the arrow not move.
2. *Explain* — "the arrow is the vector; the numbers are its name in this basis."
3. *Transfer* — an unfamiliar basis, and a map whose \([A]_B\) the learner has not
   seen; predict which quantities stay fixed.
4. *Symbolic* — compute \([\mathbf{x}]_B=P^{-1}\mathbf{x}\) and \([A]_B=P^{-1}AP\),
   and verify \([A\mathbf{x}]_B=[A]_B[\mathbf{x}]_B\).

**Representation-only learner detector:** one who can swap grids but
(i) says the vector changed, (ii) writes \(PAP^{-1}\) for \([A]_B\), or
(iii) claims equal determinants make matrices similar, has the picture only.

---

## Prerequisites, limitations, likely misconceptions

- **Prerequisites:** basis, unique coordinates, \([\mathbf{p}]_B\) (L1); columns
  rule (L2); solving \(P\mathbf{c}=\mathbf{x}\) (L3/L4); inverses and right-to-left
  composition (L6); \(\det(AB)=\det A\det B\) (L7); rank/nullity invariance under
  invertible maps (L8/L9). All built.
- **Limitations:** \(2\times2\) worked examples for continuity with L1;
  orthonormal bases and \(P^{-1}=P^{\mathsf T}\) are **out of scope** (L12); trace
  invariance is stated, not proved; diagonalizability is *set up* here and decided
  in L11; no abstract vector spaces.
- **Likely misconceptions:**
  - "Changing basis moves the vector."
  - "\([A]_B = PAP^{-1}\)" (direction inverted).
  - "Similar matrices are equal / equal det implies similar."
  - "The new basis has to be orthogonal or unit length."
  - "Every matrix can be diagonalized."

---

## Mathematical audit (Audit A)

| Check | Result |
| --- | --- |
| 1. Conclusion follows | PASS — §6d *derives* \([A]_B=P^{-1}AP\) from the defining requirement rather than asserting it; §6b fixes \(P\)'s direction from its construction, so no convention is smuggled in. |
| 2. Sufficiency / scope | PASS — invariants are limited to det/rank/nullity/trace, and the **converse is explicitly denied** (equal det/trace does not imply similarity), with a counterexample required in the lesson. |
| 3. Structure-preserving representation | PASS — the two-grid picture maps arrow↔vector and readout↔coordinates; the three properties it could falsely add (vector moves, grid must be orthonormal, similar means interchangeable) are named and discarded (§13). |
| 4. Hidden normalization | PASS — the whole insight *is* the exposure of a hidden normalization (the silent \(E\)); §8 records that re-reading changes no computed value. |
| 5. Nature of connections | PASS — L11/L14/similarity **exact**; units, camera frames, feature bases **architectural** (§11). |
| 6. Notation level | PASS — \([\mathbf{x}]_B\), \(P\), similarity; no abstract linear-map formalism, no dual bases. |

## Grounding & model-change audit (Audit B)

| Check | Result |
| --- | --- |
| B1. Model change vs wording | PASS — nine lessons of notation are re-read; the learner starts asking "in which basis?". |
| B2. New prediction | PASS — direction of \(P\) derived from columns; which quantities survive (§10). |
| B3. Compression / purpose | PASS — coordinates, similarity and diagonalization become one idea; \(P^{-1}AP\) becomes readable. |
| B4. Genuine isomorphism | PASS — §13 left column. |
| B5. Named pragmatic additions | PASS — three named and discarded (§13 right). |
| B6. Abstraction return | PASS — four steps + detector (§14). |
| B7. Theme removal | PASS — the "language" wording is a gloss, not a theme; deleting it leaves the two-grid picture and the derivation intact. |

Closing question: **more illuminating than a strong conventional explanation?**
Yes. The conventional route defines \(P\), states \(P^{-1}AP\), and drills it,
which leaves the direction to memory and the object/description distinction
unmade. This route exposes the hidden subscript first, so the direction becomes
derivable and the sandwich becomes readable.

---

## Review signoff

| Role | Filled by | Status |
| --- | --- | --- |
| Contract author | Claude Code agent (AI) | Complete |
| Mathematical reviewer | Claude Code agent (AI) — **not independent** | Self-review; Audit A passed. The explicit denial of the similarity converse, and the requirement that the lesson supply a counterexample, were added during review. |
| Pedagogical reviewer | Claude Code agent (AI) — **not independent** | Self-review; items 1–14 present. |
| User / domain-owner approval | Repository owner | **Authorized to build.** Independent review outstanding. |

---

## Gate result

`Gate result: PASS`

**Exact primary insight (verbatim for the plan's metadata):**

> A matrix was never the map, and a coordinate list was never the vector: both are
> **descriptions relative to a basis**, and since Lesson 2 that basis has silently
> been the standard one. Name the choice and everything follows — the
> change-of-basis matrix \(P\), whose columns are the new basis vectors written in
> standard coordinates, converts B-coordinates *into* standard ones (so
> \([\mathbf{x}]_B = P^{-1}\mathbf{x}\)), and a map's matrix in the new basis is the
> readable three-step sentence \([A]_B = P^{-1}AP\): translate, act, translate back.
> The object never moves; only its name changes. So some bases describe a map more
> simply than others — and in a basis of directions the map merely scales, the
> description becomes diagonal.
