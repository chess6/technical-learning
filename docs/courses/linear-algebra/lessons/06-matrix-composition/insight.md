# Approved Insight Contract — Matrix Composition & Inverses (L6)

Stage 2 of the [Insight Discovery Gate](../../../../authoring/insight-discovery-gate.md).
Selects one primary breakthrough from the Stage 1 brief
([insight-brief.md](insight-brief.md)) and verifies its complete mathematical and
pedagogical chain, then runs the mathematical audit (Audit A) and the grounding &
model-change audit (Audit B).

Primary insight selected: **Package P1** — *composition is L2's columns rule fired
twice, and the inverse is that same question run backwards.* **P2** (an inverse
exists exactly when nothing collapsed) is **woven in as the second half of the
same chain**, not spun off; **P3** is the misconception layer; **P4** is the
motivating need, carried with an explicit honesty caveat.

Notation: matrices are \(2\times2\) over \(\mathbb{R}\) unless stated; \(\mathbf{e}_1,
\mathbf{e}_2\) is the standard basis; \(\operatorname{col}_j(M)=M\mathbf{e}_j\);
\(I\) is the identity; column vectors; KaTeX. Continuity anchors are the built
examples `shear-2-1` (\(A\)), `rotation` (the order counterexample), and
`singular-collapse` (the non-invertible case).

---

## Primary insight (required contents 1–11)

### 1. Diagnosed cognitive obstacle
From Stage 1a: **missing mathematical structure / procedural overload** (the
row-times-column recipe arrives unexplained, so its consequences —
non-commutativity, associativity, the shape rule — become separate memorized
facts), compounded by an **incorrect prior mental model** imported from scalar
arithmetic (multiplication commutes; every nonzero thing has a reciprocal;
\(A^{-1}\) is "\(1/A\)"; \((AB)^{-1}=A^{-1}B^{-1}\)).

### 2. Insight mechanism(s)
**Structural compression** (one question generates the product rule, its order
sensitivity, associativity, and the inverse) plus **operational grounding** (the
composite is *run* on the plane: land, then land again) and **representational
change** (the product read as "push \(B\)'s columns through \(A\)" rather than as
an entry table). No real-world semantic grounding is used.

### 3. Initial mental model
"Matrix multiplication is a recipe: run along a row, down a column, add up the
products. Order matters — for some reason. The inverse is the matrix version of a
reciprocal, computed from a formula I memorize, and presumably every matrix that
isn't zero has one."

### 4. Tension / redundancy
L2 established that a matrix **is** the pair \(\bigl(A\mathbf{e}_1, A\mathbf{e}_2\bigr)\)
— a map is completely determined by where the basis lands. If that is true, then
"do \(B\), then \(A\)" is *already* determined: there is nothing left to define,
only something to compute. Yet the standard presentation introduces a fresh recipe
as if a new definition were needed. The redundancy is exact: the recipe is
\(A(B\mathbf{e}_j)\) written out.

### 5. The model change (what the learner now believes instead)
To find the matrix of a composite, **ask the only question a matrix ever answers:
where does the basis land?** Under "do \(B\), then \(A\)", the basis vector
\(\mathbf{e}_j\) travels \(\mathbf{e}_j \mapsto B\mathbf{e}_j \mapsto A(B\mathbf{e}_j)\).
So

\[
\operatorname{col}_j(AB) \;=\; A\,\operatorname{col}_j(B),
\]

and the entry recipe is just that matrix–vector product written out. Everything
else is a consequence, including the inverse: \(A^{-1}\) is the matrix whose
columns are the **preimages** of \(\mathbf{e}_1,\mathbf{e}_2\) — which exist, and
are unique, exactly when \(A\)'s columns are independent.

### 6. Full causal chain (no missing steps)

- **(a) A map is its basis images (retrieved from L2).** A linear \(T\) satisfies
  \(T(x\mathbf{e}_1+y\mathbf{e}_2)=x\,T\mathbf{e}_1+y\,T\mathbf{e}_2\); so \(T\) is
  fixed by \(T\mathbf{e}_1, T\mathbf{e}_2\), which are the columns of its matrix.
- **(b) The composite is a linear map.** If \(S,T\) are linear then so is
  \(S\circ T\): \(S(T(x\mathbf{u}+y\mathbf{v}))=xS(T\mathbf{u})+yS(T\mathbf{v})\).
  So the composite *has* a matrix — by (a), the one whose columns are its basis
  images.
- **(c) Compute those images.** \((S\circ T)\mathbf{e}_j=S(T\mathbf{e}_j)=A(B\mathbf{e}_j)\)
  where \(A,B\) are the matrices of \(S,T\). Therefore
  \(\operatorname{col}_j(AB)=A\,\operatorname{col}_j(B)\). **This is the definition
  of the product**, and it makes \((AB)\mathbf{x}=A(B\mathbf{x})\) true by
  construction rather than by verification.
- **(d) The recipe falls out.** With
  \(A=\begin{bmatrix}a_{11}&a_{12}\\a_{21}&a_{22}\end{bmatrix}\),
  \(\operatorname{col}_1(B)=\begin{bmatrix}b_{11}\\b_{21}\end{bmatrix}\):
  \(A\operatorname{col}_1(B)=\begin{bmatrix}a_{11}b_{11}+a_{12}b_{21}\\a_{21}b_{11}+a_{22}b_{21}\end{bmatrix}\)
  — precisely "row \(i\) of \(A\) against column \(j\) of \(B\)". Nothing is
  memorized; the recipe is *derived*. Corollary (**not entrywise**): the \((1,1)\)
  entry of \(AB\) is \(a_{11}b_{11}+a_{12}b_{21}\), not \(a_{11}b_{11}\).
- **(e) Order matters, and the picture says why.** \(AB\) pushes \(B\)'s columns
  through \(A\); \(BA\) pushes \(A\)'s columns through \(B\). Different questions,
  generally different answers. Worked counterexample with built examples: with
  \(R=\begin{bmatrix}0&-1\\1&0\end{bmatrix}\) (rotate \(90^\circ\)) and
  \(A=\begin{bmatrix}2&1\\0&1\end{bmatrix}\) (the L2 shear),
  \(AR=\begin{bmatrix}1&-2\\1&0\end{bmatrix}\) while
  \(RA=\begin{bmatrix}0&-1\\2&1\end{bmatrix}\). They differ, and the plane's final
  shape differs visibly.
  *Scope:* \(AB \ne BA\) **in general** — not "always". \(I\) commutes with
  everything, as does any scalar multiple of \(I\), and e.g. two rotations commute.
- **(f) Associativity is free.** Function composition is associative:
  \(((S\circ T)\circ U)(\mathbf{x})=(S\circ(T\circ U))(\mathbf{x})\) for every
  \(\mathbf{x}\), so \((AB)C=A(BC)\). No entry computation is needed, and this is
  *why* \(A^k\) is unambiguous.
- **(g) \(I\) is the do-nothing map.** \(I\mathbf{e}_j=\mathbf{e}_j\), so
  \(IM=MI=M\). It is the composition identity, which is what makes "undo" a
  well-posed goal: undoing means composing back to \(I\).
- **(h) The inverse question, run backwards.** \(A^{-1}\) must satisfy
  \(A^{-1}A=I\), i.e. \(A^{-1}(A\mathbf{e}_j)=\mathbf{e}_j\). Equivalently, by (c),
  \(AA^{-1}=I\) means \(A\,\operatorname{col}_j(A^{-1})=\mathbf{e}_j\): **column
  \(j\) of \(A^{-1}\) is the solution of \(A\mathbf{x}=\mathbf{e}_j\)**. So
  building an inverse is solving two systems the learner already knows how to
  solve (L4).
- **(i) When does that succeed? (P2, folded in.)** Those two systems have a
  solution for every right-hand side, and a *unique* one, exactly when \(A\)'s
  columns are independent — L3's reachability plus L5's trivial-null-space
  corollary, now applied to the map itself. If the columns are dependent the plane
  collapses onto a line: distinct inputs share an output (\(A\mathbf{u}=A\mathbf{v}\)
  with \(\mathbf{u}\ne\mathbf{v}\) whenever \(\mathbf{u}-\mathbf{v}\in\operatorname{Null}(A)\)),
  and **no function whatsoever** — matrix or not — can undo a non-injective map.
  Non-invertibility is therefore *information loss*, not an algebraic accident.
- **(j) The formula, and its forward edge.** Solving \(A\mathbf{x}=\mathbf{e}_1\)
  and \(A\mathbf{x}=\mathbf{e}_2\) for \(A=\begin{bmatrix}a&b\\c&d\end{bmatrix}\)
  by elimination gives
  \(A^{-1}=\dfrac{1}{ad-bc}\begin{bmatrix}d&-b\\-c&a\end{bmatrix}\), valid exactly
  when \(ad-bc\ne 0\). The learner meets \(ad-bc\) here **as the quantity whose
  vanishing is the collapse** — the same collapse seen in L3/L5 — and L7 names it
  the determinant. The lesson deliberately stops at "this number decides
  invertibility" and does not develop area/orientation.
- **(k) Undoing a sequence runs backwards.** \((AB)(B^{-1}A^{-1})=A(BB^{-1})A^{-1}
  =AIA^{-1}=I\) by (f) and (g), so \((AB)^{-1}=B^{-1}A^{-1}\). The scalar analogy
  fails here precisely because (e) holds.
- **(l) The purpose, stated honestly (P4).** With \(A\) invertible,
  \(A\mathbf{x}=\mathbf{b}\iff \mathbf{x}=A^{-1}\mathbf{b}\), so **one** inverse
  answers **every** right-hand side, where each elimination answers one.
  *Honesty caveat carried into the lesson:* this is a statement about
  **structure**, not about **algorithms** — for a single system, elimination is
  cheaper and numerically better than forming \(A^{-1}\). The inverse earns its
  place as an object of theory (and as the bridge to L7/L8), not as the recommended
  way to solve one system.

### 7. Minimal formal derivation

**Definition (product).** For linear maps with matrices \(A,B\), the matrix \(AB\)
is defined by \(\operatorname{col}_j(AB)=A\,\operatorname{col}_j(B)\). Consequently
\((AB)\mathbf{x}=A(B\mathbf{x})\) for all \(\mathbf{x}\), and entrywise
\((AB)_{ij}=\sum_k A_{ik}B_{kj}\).

**Proposition (algebra).** \((AB)C=A(BC)\); \(IM=MI=M\); \(A(B+C)=AB+AC\); and
\(AB\ne BA\) in general.

**Definition (inverse).** \(A\) is *invertible* if there is a matrix \(A^{-1}\)
with \(A^{-1}A=AA^{-1}=I\). The inverse, when it exists, is **unique**: if
\(XA=I=AY\) then \(X=XI=X(AY)=(XA)Y=IY=Y\).

**Theorem (invertibility criterion, \(2\times2\)).** For
\(A=\begin{bmatrix}a&b\\c&d\end{bmatrix}\) the following are equivalent:
(i) \(A\) is invertible; (ii) the columns of \(A\) are linearly independent;
(iii) \(\operatorname{Null}(A)=\{\mathbf{0}\}\); (iv) \(A\mathbf{x}=\mathbf{b}\) has
exactly one solution for every \(\mathbf{b}\); (v) \(ad-bc\ne 0\). In that case
\(A^{-1}=\frac{1}{ad-bc}\begin{bmatrix}d&-b\\-c&a\end{bmatrix}\).

*Proof sketch (level-appropriate, given in the lesson as a derivation).*
(i)\(\Rightarrow\)(iii): \(A\mathbf{x}=\mathbf{0}\Rightarrow\mathbf{x}=A^{-1}A\mathbf{x}=A^{-1}\mathbf{0}=\mathbf{0}\).
(iii)\(\Leftrightarrow\)(ii) is L1's definition of dependence; (iii)\(\Rightarrow\)(iv)
is L5's corollary together with the fact that two independent vectors in
\(\mathbb{R}^2\) span it; (iv)\(\Rightarrow\)(i) construct \(A^{-1}\) column by
column from the unique solutions of \(A\mathbf{x}=\mathbf{e}_j\) (§6h). For
(v): direct multiplication verifies the stated matrix is a two-sided inverse when
\(ad-bc\ne0\); conversely if \(ad-bc=0\) then \(A\begin{bmatrix}-b\\a\end{bmatrix}
=\begin{bmatrix}-ab+ba\\-cb+da\end{bmatrix}=\mathbf{0}\) and likewise
\(A\begin{bmatrix}d\\-c\end{bmatrix}=\mathbf{0}\); at least one of these two vectors
is nonzero unless \(A=\mathbf{0}\) (which is visibly singular), so
\(\operatorname{Null}(A)\ne\{\mathbf{0}\}\) and (iii) fails. \(\blacksquare\)

**Proposition (reversal).** If \(A,B\) are invertible then so is \(AB\), and
\((AB)^{-1}=B^{-1}A^{-1}\).

### 8. Equivalence to the original object
The columns definition and the entry recipe define **the same matrix**: §6d
expands \(A\,\operatorname{col}_j(B)\) and obtains \(\sum_k A_{ik}B_{kj}\) exactly.
Nothing is added or dropped, and no normalization is hidden — the standard basis
is a *choice of description*, and the identity
\((AB)\mathbf{x}=A(B\mathbf{x})\) is basis-free (it is a statement about the maps),
so the derivation does not smuggle in a preferred coordinate system. Likewise the
inverse defined by "columns are preimages of \(\mathbf{e}_j\)" is the same object
as the inverse defined by \(A^{-1}A=AA^{-1}=I\), by uniqueness (§7).

### 9. Cost / model change (which inferences it licenses)

**Licenses (new inferences):**
- compute or *predict* any column of a product without running the full recipe
  ("column \(j\) of \(AB\) is \(A\) applied to \(B\)'s column \(j\)");
- predict from a picture, before computing, that \(AB\ne BA\) for two given maps;
- decide invertibility from the *geometry* (did the plane collapse?) rather than
  from a formula;
- construct \(A^{-1}\) by solving two systems, and check it by composing to \(I\);
- reverse a chain of maps correctly: \((AB)^{-1}=B^{-1}A^{-1}\).

**Does NOT license (guardrails, stated precisely):**
- "\(AB\ne BA\) always" — commuting pairs exist (\(I\), scalar multiples of \(I\),
  two rotations, a matrix and its own powers);
- "singular means zero" — \(\begin{bmatrix}2&4\\1&2\end{bmatrix}\) is nonzero and
  singular;
- "\(A^{-1}\) is the best way to solve \(A\mathbf{x}=\mathbf{b}\)" — see the §6l
  caveat; it is the best way to *think about* the family, not to compute one
  solution;
- any claim about \(ad-bc\) beyond "nonzero \(\iff\) invertible" — area and
  orientation are L7's, and are explicitly deferred;
- inverses of non-square maps (not defined here; one-sided inverses are out of
  scope).

### 10. What the learner can predict or do afterward (without being told)
- Given \(A\) and \(B\), produce \(\operatorname{col}_1(AB)\) *as a vector*, and say
  in words what it is.
- Given two maps as pictures, predict whether the composite depends on order, and
  produce a numerical counterexample.
- Given a matrix, decide whether it is invertible and justify the answer by
  independence / collapse, not by the formula alone.
- Build \(A^{-1}\) and verify \(AA^{-1}=I\).
- Correctly invert a composite, and explain why the order reverses.
- Solve \(A\mathbf{x}=\mathbf{b}\) as \(A^{-1}\mathbf{b}\) and reconcile the answer
  with the elimination result from L4.

### 11. Transfer assessment
- **Function composition generally** — *exact*: matrix product = composition, and
  every property here (associativity, non-commutativity, reversal of inverses) is
  the corresponding property of functions.
- **Permutations / symmetry groups** — *exact structural*: non-commutativity and
  \((\sigma\tau)^{-1}=\tau^{-1}\sigma^{-1}\) are the same statements.
- **Change of basis (L10)** — *exact*: \(P^{-1}AP\) is composition of three maps,
  and needs exactly this lesson's algebra.
- **Determinants (L7)** — *exact*: \(ad-bc\) arrives here as the invertibility
  detector; L7 names and interprets it, and \(\det(AB)=\det A\det B\) is this
  lesson's composition read through L7's lens.
- **Subspaces & rank (L8)** — *exact*: "the plane collapsed" becomes rank \(<2\).
- **Elementary matrices / LU** — *architectural*: each row operation of L4 is a
  matrix, so elimination is itself a product of maps. Mentioned as a forward edge,
  not taught.

### 12. Semantic / operational / representational bridge (conditional)
**Operational + representational bridge (no real-world story).**
- *Operation:* the learner literally applies one map, then the other, to the same
  marked object, and then applies the single composite matrix to the *original*
  object and sees it land in the same place.
- *Representation:* the two basis vectors are the tracked objects. Their journey
  \(\mathbf{e}_j\to B\mathbf{e}_j\to A(B\mathbf{e}_j)\) is drawn as one continuous
  path with a persistent identity, so "column \(j\) of the product" is *seen* as
  the endpoint of the path that started at \(\mathbf{e}_j\).
- *Why it makes the inference natural:* the product's columns are not derived and
  then illustrated — they are watched arriving.

### 13. Preserved correspondences & analogy limits (conditional)

| Maps **exactly** (keep) | Property the picture/word must **not** add (name & discard) |
| --- | --- |
| endpoint of \(\mathbf{e}_j\)'s path ↔ \(\operatorname{col}_j(AB)\) | that the *drawn order* (left to right on screen) matches the *written order* — \(AB\) means \(B\) **first**; the notation runs right-to-left |
| "undo" ↔ \(A^{-1}\) with \(A^{-1}A=AA^{-1}=I\) | that "undo" is always available — the word "inverse" imported from numbers suggests every nonzero matrix has one |
| collapse of the plane ↔ dependent columns ↔ \(ad-bc=0\) | that \(ad-bc\) means *area* here — area/orientation is deferred to L7 and must not be asserted |
| composing maps ↔ multiplying matrices | that the multiplication behaves like number multiplication (commutative; entrywise; \(A^{-1}=1/A\)) |

### 14. Abstraction return (conditional)
Graded path back to symbols:
1. *Recognize the representation* — watch \(\mathbf{e}_1\) travel through \(B\) then
   \(A\) and land on \(\operatorname{col}_1(AB)\).
2. *Explain the mapping* — "the endpoint of \(\mathbf{e}_j\)'s path **is** column
   \(j\) of the product; the picture of collapse **is** \(\operatorname{Null}(A)\ne\{\mathbf{0}\}\)."
3. *Transfer to an unfamiliar case* — a pair of matrices whose composite the
   learner has not watched, including a singular one and a commuting one.
4. *Solve the symbolic form* — compute \(AB\) entrywise, build \(A^{-1}\), verify
   \(AA^{-1}=I\), and invert a composite in the right order.

**Detecting a representation-only learner:** one who can narrate the animation but
(i) computes \(AB\) entrywise, (ii) says \(AB\ne BA\) *always*, (iii) writes
\((AB)^{-1}=A^{-1}B^{-1}\), or (iv) calls a nonzero singular matrix invertible, has
acquired the picture, not the concept.

---

## Prerequisites, limitations, likely misconceptions

- **Prerequisites:** linearity and the columns rule, \(A\mathbf{e}_j=\operatorname{col}_j(A)\)
  (L2); matrix–vector product, span, independence (L1–L2); \(A\mathbf{x}=\mathbf{b}\),
  reachability, the trichotomy (L3); elimination and back-substitution (L4);
  \(\operatorname{Null}(A)\) and "unique \(\iff\) trivial null space" (L5). Every
  one of these is **built**.
- **Limitations:** everything is \(2\times2\)/\(\mathbb{R}^2\) for continuity, so
  the general \(m\times n\) shape rule and non-square/one-sided inverses are
  **out of scope** and recorded as an accountable abstraction-return deferral (see
  the mastery contract §1g). \(ad-bc\) is used only as the invertibility detector;
  its meaning is L7's. Numerical conditioning (the `near-singular` example) is
  named as a caution, not developed.
- **Likely misconceptions:**
  - "\(AB=BA\)." (False in general; \(I\) and scalar multiples commute.)
  - "Multiply entrywise." (The \((1,1)\) entry mixes a whole row and a whole column.)
  - "\(AB\) means apply \(A\) first." (It means apply \(B\) first — notation runs
    right to left.)
  - "\(A^{-1}=1/A\)" / "every nonzero matrix has an inverse." (Singular nonzero
    matrices exist; \(\begin{bmatrix}2&4\\1&2\end{bmatrix}\) is one.)
  - "\((AB)^{-1}=A^{-1}B^{-1}\)." (Order reverses.)
  - "det/`ad−bc` is about area here." (Deferred to L7 — here it is only the
    nonzero/zero test.)
  - "Use \(A^{-1}\) to solve systems in practice." (Structurally right, numerically
    wrong; §6l.)

---

## Mathematical audit (Audit A)

| Check | Result |
| --- | --- |
| 1. Conclusion follows from derivation | PASS — §6b establishes the composite is linear *before* claiming it has a matrix; §6c–d derive the recipe; §7's criterion proof includes the converse direction (both null vectors exhibited, with the \(A=\mathbf{0}\) case handled). |
| 2. Sufficiency vs lower bound / scope | PASS — "order matters" is scoped as **in general, not always**, with commuting families named (§6e, §9); "no function can undo a collapse" is stated for *all* functions, which is the correct strength (non-injectivity), not just for matrices (§6i). |
| 3. Structure-preserving representation | PASS — the tracked-basis-path picture maps exactly onto \(\operatorname{col}_j(AB)=A\operatorname{col}_j(B)\); the one property it could falsely add (screen order = notation order) is named and discarded (§13). |
| 4. Hidden normalization | PASS — the standard basis is used as a *description*, and §8 records that the underlying identity \((AB)\mathbf{x}=A(B\mathbf{x})\) is basis-free, so the choice is not smuggled into the equivalence. |
| 5. Nature of broader connections | PASS — function composition, permutations, change of basis, determinants, rank labeled **exact**; elementary matrices/LU labeled **architectural** and explicitly not taught (§11). |
| 6. Notation level | PASS — \(\operatorname{col}_j\), \(I\), \(A^{-1}\), \(\operatorname{Null}\) are all in force from L1–L5; nothing expert-only (no group theory, no general \(m\times n\) index gymnastics). |

## Grounding & model-change audit (Audit B)

| Check | Result |
| --- | --- |
| B1. Model change vs clearer wording (universal) | PASS — the learner stops *applying* a recipe and starts *deriving* it from where the basis lands; the inverse stops being a formula and becomes two systems. |
| B2. New prediction (universal) | PASS — predicts a product's column without the recipe; predicts order-dependence from a picture; predicts non-invertibility from collapse (§10). |
| B3. Compression / purpose exposed (universal) | PASS — one question yields the recipe, non-commutativity, associativity, \(I\), the inverse construction, and the \(ad-bc\) condition; the inverse gains a stated purpose *and* a stated limit (§6l). |
| B4. Genuine isomorphism (grounding) | PASS — every relation in the picture (path endpoint, collapse, return-to-\(I\)) corresponds to an algebraic statement (§13 left column). |
| B5. Named pragmatic additions (grounding) | PASS — screen-order-vs-notation-order, "undo always available", "\(ad-bc\) means area", and the scalar-arithmetic imports are each named and discarded (§13 right column). |
| B6. Abstraction return present (grounding) | PASS — four-step return plus a representation-only-learner detector (§14). |
| B7. Theme-removal test (grounding) | PASS — there is no decorative theme; the representation is the mathematics. |

Closing question (both audits): **more illuminating than a strong conventional
explanation?** Yes — the conventional order (recipe → properties → inverse formula)
presents four independent facts; this order derives all four from the columns rule
the learner already owns, and hands L7 a determinant the learner already wants.

---

## Review signoff

Roles may be temporarily filled by one person or model, but the artifact must not
silently self-certify. Current honest status:

| Role | Filled by | Status |
| --- | --- | --- |
| Contract author | Claude Code agent (AI) | Complete |
| Mathematical reviewer | Claude Code agent (AI) — **not independent** | Self-review; Audit A passed. The \(ad-bc=0 \Rightarrow\) singular converse and the \(A=\mathbf{0}\) edge case were added during review. |
| Pedagogical reviewer | Claude Code agent (AI) — **not independent** | Self-review; chain items 1–14 present. |
| User / domain-owner approval | Repository owner | **Authorized to build** ("Create Matrix Composition & Inverses end-to-end"). Substantive independent math/pedagogy review still outstanding. |
| Outstanding concerns | — | Reviews are self-performed (not independent). No readiness/mastery claim is made on that basis. |

---

## Gate result

`Gate result: PASS`

**Exact primary insight (preserved verbatim in the Stage 3 plan's metadata for
traceability; the learner-facing lesson must preserve its mathematical meaning and
causal chain but may use shorter, clearer wording):**

> A matrix is nothing but a record of where the basis lands, so "do \(B\), then
> \(A\)" needs no new definition — only the same question asked once more: column
> \(j\) of \(AB\) is \(A\) applied to column \(j\) of \(B\). The entry recipe,
> the failure of \(AB=BA\) in general, and associativity are all consequences of
> that one identity. Run the question backwards — *which* input lands on
> \(\mathbf{e}_j\)? — and you get \(A^{-1}\), whose columns are the solutions of
> \(A\mathbf{x}=\mathbf{e}_j\); those solutions exist and are unique exactly when
> \(A\)'s columns are independent, i.e. when the map collapsed nothing, which for a
> \(2\times2\) matrix is the condition \(ad-bc\ne 0\). Because composition is
> composition of functions, undoing a sequence runs backwards:
> \((AB)^{-1}=B^{-1}A^{-1}\).
