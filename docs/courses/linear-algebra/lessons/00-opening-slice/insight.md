# Approved Insight Contract — Linear-Algebra Opening Slice (Chapter 0 + Lessons 1–2)

Stage 2 of the [Insight Discovery Gate](../../../../authoring/insight-discovery-gate.md). Selects one
primary breakthrough from the Stage 1 brief
([courses/linear-algebra/lessons/00-opening-slice/insight-brief.md](insight-brief.md))
and verifies its complete mathematical and pedagogical chain, then runs the
mathematical audit. This is a **joint** contract covering Lesson 1 and Lesson 2 as
one opening slice; it governs the design brief
[archive/milestones/linear-algebra-opening-vertical-slice.md](../../../../archive/milestones/linear-algebra-opening-vertical-slice.md).

Primary insight selected: **C1** — unique basis coordinates plus linearity make two
basis images determine the whole map. Its load-bearing prerequisite is the Lesson 1
basis theorem (**C2**, basis ⇔ unique representation); its tangible payoff is the
columns rule (**C3**, derived). Framing: **Chapter 0 supplies the mystery, Lesson 1
establishes unique coordinates, Lesson 2 completes the causal chain.**

---

## Primary insight (required contents 1–11)

### 1. Initial mental model
To move a shape you must say where each of its (infinitely many) points goes; a
matrix is an opaque box of four numbers that somehow "transforms the picture."

### 2. Tension / redundancy
In Chapter 0 just **four numbers** (a live $2\times2$ matrix) visibly relocate
every point of a whole graphic. How can four numbers control infinitely many
points?

### 3. Structural reveal
Every vector has a **unique** coefficient pair in a basis (Lesson 1), and a linear
map sends $a\mathbf{v}+b\mathbf{w}$ to $aT(\mathbf{v})+bT(\mathbf{w})$ — so the
**same** coefficients $(a,b)$ now sit over the images $T(\mathbf{v}),T(\mathbf{w})$.
Knowing the two basis images therefore fixes every image.

### 4. Full causal chain (no missing steps)

Work concretely in $\mathbb{R}^2$ (column vectors, $y$ up). Recurring directions
$\mathbf{v}=\begin{bmatrix}1\\2\end{bmatrix}$,
$\mathbf{w}=\begin{bmatrix}3\\-1\end{bmatrix}$.

- **(a) Two reference directions give coordinates.** Fixing an ordered pair
  $B=(\mathbf{v},\mathbf{w})$ lets us try to name a vector by how much of each we
  use: $\mathbf{x}=a\mathbf{v}+b\mathbf{w}$.
- **(b) Basis ⇔ unique representation.** $B$ is a basis of $\mathbb{R}^2$ iff every
  $\mathbf{x}\in\mathbb{R}^2$ has **exactly one** $(a,b)$ with
  $\mathbf{x}=a\mathbf{v}+b\mathbf{w}$. **Span ⇒ existence** (at least one name);
  **independence ⇒ uniqueness** (at most one). *Uniqueness proof:* if
  $a\mathbf{v}+b\mathbf{w}=a'\mathbf{v}+b'\mathbf{w}$ then
  $(a-a')\mathbf{v}+(b-b')\mathbf{w}=\mathbf{0}$; independence forces
  $a-a'=0$ and $b-b'=0$, i.e. $a=a',\ b=b'$.
- **(c) Every vector carries a unique coordinate pair.** Hence each $\mathbf{x}$
  has a well-defined $[\mathbf{x}]_B=\begin{bmatrix}a\\b\end{bmatrix}$.
- **(d) Linearity carries the coefficients forward.** A linear $T$ (additivity +
  homogeneity) satisfies

  $$T(a\mathbf{v}+b\mathbf{w}) = T(a\mathbf{v}) + T(b\mathbf{w}) = a\,T(\mathbf{v}) + b\,T(\mathbf{w}).$$

  The coefficients $(a,b)$ are **unchanged**, but they now index the **images**
  $\big(T(\mathbf{v}),T(\mathbf{w})\big)$ rather than $(\mathbf{v},\mathbf{w})$.
- **(e) $T$ is determined by two images.** Because every $\mathbf{x}$ has a unique
  $(a,b)$ (step c) and $T(\mathbf{x})=aT(\mathbf{v})+bT(\mathbf{w})$ (step d),
  knowing $T(\mathbf{v})$ and $T(\mathbf{w})$ fixes $T(\mathbf{x})$ for **every**
  $\mathbf{x}$.
- **(f) Specialize to the standard basis (columns rule, derived).** With
  $\mathbf{x}=x\mathbf{e}_1+y\mathbf{e}_2$,

  $$T(\mathbf{x}) = x\,T(\mathbf{e}_1) + y\,T(\mathbf{e}_2) = \begin{bmatrix}T(\mathbf{e}_1) & T(\mathbf{e}_2)\end{bmatrix}\begin{bmatrix}x\\y\end{bmatrix},$$

  so the matrix **columns are the basis images**: $A=\begin{bmatrix}T(\mathbf{e}_1)
  & T(\mathbf{e}_2)\end{bmatrix}$. The columns rule is a **consequence** of unique
  coordinates + linearity, not a memorized convention.
- **(g) Resolve Chapter 0.** Every graphic vertex is $x\mathbf{e}_1+y\mathbf{e}_2$,
  so transforming just $\mathbf{e}_1,\mathbf{e}_2$ (four numbers) transforms every
  vertex: $\text{vertex}\mapsto xT(\mathbf{e}_1)+yT(\mathbf{e}_2)$. The mystery is
  answered.

**Concrete coordinate computation (the method the lesson uses).** To find
$[\mathbf{q}]_B$ for $\mathbf{q}=\begin{bmatrix}-1\\5\end{bmatrix}$ with
$B=\big((1,2),(3,-1)\big)$, solve $a\begin{bmatrix}1\\2\end{bmatrix}
+b\begin{bmatrix}3\\-1\end{bmatrix}=\begin{bmatrix}-1\\5\end{bmatrix}$, i.e. the
component equations

$$a + 3b = -1, \qquad 2a - b = 5.$$

From the second, $b = 2a-5$; substitute: $a + 3(2a-5) = -1 \Rightarrow 7a = 14
\Rightarrow a = 2$, then $b = -1$. So $[\mathbf{q}]_B=\begin{bmatrix}2\\-1\end{bmatrix}$
(check: $2(1,2)-(3,-1)=(-1,5)$). General Gaussian elimination is **deferred**; this
$2\times2$ solve is by substitution/elimination.

Core relationship: **unique coordinates** (step b) make $(a,b)$ well-defined;
**linearity** (step d) carries those same $(a,b)$ onto the images; together
(step e) two images determine $T$, and specialized to $\mathbf{e}_1,\mathbf{e}_2$
(step f) they *are* the matrix columns.

### 5. Minimal formal derivation
Two derivations, both short.

- **Columns rule.** For linear $T$ and $\mathbf{x}=x\mathbf{e}_1+y\mathbf{e}_2$,

  $$T(\mathbf{x}) = xT(\mathbf{e}_1)+yT(\mathbf{e}_2) = \begin{bmatrix}T(\mathbf{e}_1)&T(\mathbf{e}_2)\end{bmatrix}\begin{bmatrix}x\\y\end{bmatrix} = A\mathbf{x}.$$

- **Basis ⇔ unique representation.** Existence is spanning. Uniqueness: if
  $a\mathbf{v}+b\mathbf{w}=a'\mathbf{v}+b'\mathbf{w}$ then
  $(a-a')\mathbf{v}+(b-b')\mathbf{w}=\mathbf{0}$; linear independence gives
  $a=a',\ b=b'$. (For $\mathbb{R}^2$, independence is equivalent to
  $v_1w_2-v_2w_1\neq0$.)

### 6. Equivalence to the original object
For a **linear** map the matrix–vector product reproduces $T$ **exactly** (not an
approximation): $A\mathbf{x}=T(\mathbf{x})$ for every $\mathbf{x}$, precisely
because unique coordinates + linearity force
$T(\mathbf{x})=xT(\mathbf{e}_1)+yT(\mathbf{e}_2)$. No carrying, rounding, or
normalization is hidden. This holds **only for linear maps**:

- **Translation** $\mathbf{x}\mapsto\mathbf{x}+\mathbf{t}$ ($\mathbf{t}\neq\mathbf{0}$)
  is **affine**, not linear — no $2\times2$ matrix reproduces it (see §7, §11).
- **Nonlinear warps** (e.g. $(x,y)\mapsto(x+0.4y^2,\,y)$) bend grid lines and are
  not reproduced by any $2\times2$ matrix.

These non-examples are the **boundary** of the claim, not failures of it.

The representation is **basis-relative**. Reflection across the line $y=x$ has the
standard-coordinate matrix $\begin{bmatrix}0&1\\1&0\end{bmatrix}$ (from
$\mathbf{e}_1\mapsto(0,1)$, $\mathbf{e}_2\mapsto(1,0)$). In the basis
$B=\big((1,1),(1,-1)\big)$ the **same** map fixes $(1,1)$ and sends
$(1,-1)\mapsto(-1,1)=-(1,-1)$, so

$$[T]_{B\leftarrow B} = \begin{bmatrix}1&0\\0&-1\end{bmatrix} = \operatorname{diag}(1,-1),$$

where $B$ is used for **both** the domain and the codomain coordinates. Same
geometric reflection, two matrices — the matrix *represents* $T$ relative to a
chosen basis.

### 7. Cost change (stated precisely)
This is a **description-length / determination** compression: the action on all of
$\mathbb{R}^2$ (infinitely many points) is specified by **four scalars**. Both
sides hold precisely:

- **Sufficiency (by construction).** Four numbers — the two columns
  $T(\mathbf{e}_1),T(\mathbf{e}_2)$ — determine $T$ on all of $\mathbb{R}^2$, via
  the chain in §4 (unique coordinates + linearity).
- **Necessity (elementary dimension count).** The linear maps
  $\mathbb{R}^2\to\mathbb{R}^2$ form a **4-dimensional** space: the map
  $T\mapsto\big(T(\mathbf{e}_1),T(\mathbf{e}_2)\big)$ is a bijection onto
  $\mathbb{R}^2\times\mathbb{R}^2$, so four numbers are also **required** to name a
  general linear map. No fewer suffice in general.
- **Contrast with Karatsuba (explicit).** This is a **determination /
  representation** result plus an **elementary parameter count**. It is **not** an
  asymptotic-complexity claim and **not** a hard bilinear-rank lower bound (as in
  Karatsuba's "three multiplications, and two are impossible"). The necessity here
  is "dimension four," proven by an explicit bijection — not an optimality theorem
  in algebraic complexity.

### 8. Visual / interactive discovery mechanism
Three linked stages sharing one graphic and one visual vocabulary.

- **Chapter 0 (mystery).** A graphic morphs under a live $2\times2$ matrix; the four
  entries are surfaced — "these four numbers did all of that" — with **no** column
  explanation.
- **Lesson 1 (unique coordinates).** A two-knob $(a,b)$ coordinate machine over an
  **independent** pair (every target hit by exactly one $(a,b)$) vs a **dependent**
  pair (targets off the line unreachable; a target on the line, $\mathbf{r}=(3,6)$,
  hit by the whole family $a=3-2b$).
- **Lesson 2 (causal chain).** Predict/test linearity (additivity + homogeneity),
  then reconstruct the graphic **vertex-by-vertex** from only
  $T(\mathbf{e}_1),T(\mathbf{e}_2)$ — each vertex $x\mathbf{e}_1+y\mathbf{e}_2$
  mapping to $xT(\mathbf{e}_1)+yT(\mathbf{e}_2)$ — closing the mystery.

### 9. What the learner can predict afterward
- The image of **any** new vector, read from the columns:
  $A\mathbf{x}=x\,(\text{col}_1)+y\,(\text{col}_2)$.
- **Dependent columns collapse** the plane to a line or point (visible information
  loss; the graphic flattens).
- **Translation cannot be a $2\times2$ linear map**, because a linear map fixes the
  origin ($T(\mathbf{0})=\mathbf{0}$).
- The **same map has different matrices in different bases**; coordinates are
  basis-relative (and order-dependent).

### 10. Transfer assessment
- **Change of basis** (same object, new coordinate name) — **exact** structural
  transfer; the *general change-of-basis formula* is deferred, but the phenomenon
  (same vector, different coordinates; same map, different matrix) is shown exactly.
- **"A linear map is determined by its action on a basis"** — extends **exactly**
  (structurally, not by analogy) to higher-dimensional and abstract vector spaces:
  a linear map is defined by its values on a basis and those values may be assigned
  freely (Axler-style precision). This is an **exact structural** transfer, to be
  distinguished from a mere architectural analogy.
- **Column space / rank / invertibility** — named as consequences (the reachable
  set is the column span; a basis-preserving map is reversible), procedures
  deferred.
- **Basis-relativity → eigenbases** — seeds diagonalization (a well-chosen basis
  simplifies the matrix); formula deferred to the eigen lessons.

### 11. Prerequisites, limitations, likely misconceptions
- **Prerequisites:** $\mathbb{R}^2$ vectors and linear combination; and, for
  Lesson 2, the **Lesson 1 basis theorem** (Lesson 2 depends on Lesson 1).
- **Limitations:**
  - Restricted to **linear maps of $\mathbb{R}^2$**; affine (translation) and
    nonlinear maps are excluded and used as the **boundary**.
  - Matrices shown to be **basis-relative**, but the **change-of-basis formula is
    deferred**.
  - "Four numbers" is **exactly the linear case**; translation needs
    **affine / homogeneous coordinates** (a $3\times3$ embedding), **named only**.
- **Likely misconceptions:**
  - "A matrix transforms pixels." (It maps vertex / control-point **coordinates**,
    not pixels.)
  - "You must track where every point goes." (The two basis images suffice.)
  - "Translation is linear." (It moves the origin, so it is affine.)
  - "The matrix *is* the transformation." (It **represents** $T$ relative to a
    chosen basis.)
  - "Any two vectors form a basis." (They must be linearly **independent**.)
  - "Coordinates are absolute." (They are **basis-relative** and **order-dependent**:
    $[\mathbf{q}]_B=(2,-1)$ but $[\mathbf{q}]_{B'}=(-1,2)$ for
    $B'=(\mathbf{w},\mathbf{v})$.)

---

## Mathematical audit

| Check | Result |
| --- | --- |
| 1. Conclusion follows from derivation | PASS — every step in §4 is derived; (b) uniqueness is proved from independence, (d)–(f) use only additivity/homogeneity, and the coordinate solve $a=2,b=-1$ is explicit. |
| 2. Sufficiency vs lower bound | PASS — §7 proves **sufficiency by construction** (four numbers determine $T$) **and** an **elementary necessity by dimension count** (a bijection to $\mathbb{R}^4$); it explicitly does **not** claim a hard complexity / bilinear-rank lower bound. |
| 3. Structure-preserving language | PASS — linearity carries the **same** coefficients $(a,b)$ forward but **re-based onto the images** $\big(T(\mathbf{v}),T(\mathbf{w})\big)$; the contract does **not** claim coordinates are "invariant." |
| 4. Hidden carrying/normalization | PASS — none; and the codomain basis choice in $[T]_{B\leftarrow B}$ is made **explicit** ($B$ used for both domain and codomain). |
| 5. Nature of broader connections | PASS — determination-by-a-basis transfers **exactly** to general finite-dimensional / abstract spaces (structural, not merely architectural); change of basis is exact-but-formula-deferred. |
| 6. Notation level | PASS — no advanced notation in the elementary chain; the change-of-basis formula, dual spaces, and tensor/abstract machinery are kept out. |

Supporting boundary (kept honest, inside the elementary chain): every linear map
fixes the origin ($T(\mathbf{0})=\mathbf{0}$ by homogeneity), which is exactly why
**translation is affine, not linear** — the resolution (affine / homogeneous
$3\times3$ coordinates) is **named only**, not taught.

---

## Review signoff

Roles may be temporarily filled by one person or model, but the artifact must not
silently self-certify. Current honest status:

| Role | Filled by | Status |
| --- | --- | --- |
| Contract author | Cursor agent (AI) | Complete |
| Mathematical reviewer | Cursor agent (AI) — **not independent** | Self-review; audit table passed |
| Pedagogical reviewer | Cursor agent (AI) — **not independent** | Self-review; chain items 1–11 present |
| User / domain-owner approval | Repository owner | **Pending** independent sign-off |
| Outstanding concerns | — | None blocking; math/pedagogical reviews are self-performed, so independent human review is still advisable before publishing the lessons. |

---

## Gate result

`Gate result: PASS`

**Exact primary insight (preserved verbatim in the Stage 3 plan's metadata for
traceability; the learner-facing lessons must preserve its mathematical meaning and
causal chain but may use shorter, clearer wording):**

> Unique basis coordinates describe every vector by coefficients, and linearity
> preserves those coefficients; therefore, the images of the basis vectors
> determine the transformation of every vector.
