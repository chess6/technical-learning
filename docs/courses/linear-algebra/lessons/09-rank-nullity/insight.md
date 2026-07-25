# Approved Insight Contract — Dimension & Rank–Nullity (L9)

Stage 2 of the [Insight Discovery Gate](../../../../authoring/insight-discovery-gate.md),
selecting from [insight-brief.md](insight-brief.md) and running Audits A and B.

Primary insight: **Package P1 — conservation.** A linear map cannot lose track of
a dimension: each of the \(n\) input dimensions has exactly one fate, and the
proof is a one-to-one matching between the two fates and the two bases. **P2**
(the law forbids whole classes of maps) is woven in as the licensing half; **P3**
(dimension is well defined) is the definitional prerequisite; **P4** (eigen
multiplicities) is the forward edge.

Notation: \(A\) is \(m\times n\); \(\operatorname{rank}A=\dim\operatorname{Col}(A)\);
\(\operatorname{nullity}A=\dim\operatorname{Null}(A)\); all from L8.

---

## Primary insight (contents 1–11)

### 1. Diagnosed cognitive obstacle
**Missing purpose of an unusual kind** — the result looks *too obvious to need a
name*, because L8 already produced it as pivot/free bookkeeping. A learner who
receives it as arithmetic will recompute both numbers forever and will not
recognize what it forbids. Secondary: **inability to predict/transfer** (cannot
yet answer "can a \(\mathbb{R}^3\to\mathbb{R}^2\) map be one-to-one?" without
hunting for an example).

### 2. Insight mechanism(s)
**Semantic/operational grounding** (fates and an accounting ledger that must
balance), **predictive reorganization** (one measurement determines the other, so
whole classes of maps become impossible), and **structural compression** (L3's
trichotomy stops being three cases).

### 3. Initial mental model
"Rank and nullity are two numbers you compute from a matrix. They happen to add
to \(n\), which follows from counting columns."

### 4. Tension / redundancy
If the identity really were just column bookkeeping, it would say nothing about
*maps* — yet it correctly predicts that no map \(\mathbb{R}^3\to\mathbb{R}^2\) is
one-to-one, a statement about behaviour, not about a matrix's column count. A
tautology about how we happen to write the matrix down cannot constrain what maps
exist. So something stronger is going on, and the pivot/free split must be a
*symptom* rather than the reason.

### 5. The model change
Read \(n\) as a **budget of dimensions** that the map spends. Every input
dimension has exactly one fate:

- it **survives** into the output, contributing 1 to \(\operatorname{rank}A\); or
- it **collapses** to \(\mathbf{0}\), contributing 1 to \(\operatorname{nullity}A\).

No dimension has both fates, none has neither, and none is created. Hence
\(\operatorname{rank}A + \operatorname{nullity}A = n\) — a **conservation law**,
with the pivot/free split as the bookkeeping that records it. Consequently the two
numbers are not independent measurements: fix \(n\), and each determines the
other. So the law does not merely describe maps, it **forbids** them.

### 6. Full causal chain

- **(a) Dimension must be well defined first (P3).** \(\dim V\) is the number of
  vectors in a basis of \(V\). This is meaningful only because *every* basis of a
  given space has the same size — stated here, with the exchange argument
  referenced rather than developed, so "dimension" is a property of the space and
  not of a choice.
- **(b) Restrict the map to the inputs that survive.** Split \(\mathbb{R}^n\)
  conceptually: \(\operatorname{Null}(A)\) is the part that dies. Choose a basis
  \(\{\mathbf{u}_1,\dots,\mathbf{u}_k\}\) of \(\operatorname{Null}(A)\), where
  \(k=\operatorname{nullity}A\), and extend it to a basis of all of
  \(\mathbb{R}^n\) by adding \(\{\mathbf{w}_1,\dots,\mathbf{w}_r\}\) with
  \(k+r=n\). *(Extension to a basis is the standard fact from L1's basis
  material.)*
- **(c) The images of the added vectors span the image.** Any
  \(\mathbf{x}\in\mathbb{R}^n\) is \(\sum c_i\mathbf{u}_i+\sum d_j\mathbf{w}_j\),
  so \(A\mathbf{x}=\sum d_j A\mathbf{w}_j\) (the \(\mathbf{u}_i\) contribute
  nothing). Hence \(\{A\mathbf{w}_j\}\) spans \(\operatorname{Col}(A)\).
- **(d) They are also independent.** If \(\sum d_jA\mathbf{w}_j=\mathbf{0}\) then
  \(A(\sum d_j\mathbf{w}_j)=\mathbf{0}\), so \(\sum d_j\mathbf{w}_j\in\operatorname{Null}(A)\)
  and is therefore a combination \(\sum c_i\mathbf{u}_i\). But
  \(\{\mathbf{u}_i\}\cup\{\mathbf{w}_j\}\) is a basis, so all \(c_i\) and \(d_j\)
  vanish. Hence \(\{A\mathbf{w}_j\}\) is a **basis** of \(\operatorname{Col}(A)\),
  and \(\operatorname{rank}A=r\).
- **(e) The count.** \(\operatorname{rank}A+\operatorname{nullity}A=r+k=n\).
  \(\blacksquare\) The proof *is* the conservation statement: it exhibits a
  one-to-one correspondence between the added basis vectors and the surviving
  output dimensions.
- **(f) Why the pivot/free split is the same thing.** Pivot columns index the
  \(\mathbf{w}_j\)'s role and free columns the \(\mathbf{u}_i\)'s; elimination is
  one concrete way of choosing the split. So L8's observation was a computation of
  this law, not a proof of it.
- **(g) What it forbids (P2).** With \(n\) fixed, rank and nullity trade off
  exactly. Immediate consequences:
  - \(\operatorname{rank}A\le\min(m,n)\) — the image cannot have more dimensions
    than either space allows;
  - if \(n>m\) then \(\operatorname{nullity}A\ge n-m>0\), so **no map from a
    bigger space to a smaller one is one-to-one**;
  - if \(n<m\) then \(\operatorname{rank}A\le n<m\), so **no map from a smaller
    space to a bigger one is onto**;
  - for square \(A\): one-to-one \(\iff\) onto. (This is why L6's invertibility
    criterion could collapse so many conditions into one — and it is *false* for
    non-square maps, which is the honest scope note.)
- **(h) L3's trichotomy, explained.** "None, one, or infinitely many" is now
  structural: existence is \(\mathbf{b}\in\operatorname{Col}(A)\) (an \(m\)-side
  question), multiplicity is \(\operatorname{nullity}A\) (an \(n\)-side question),
  and the law ties the two sides together.
- **(i) Forward edge (P4).** The **geometric multiplicity** of an eigenvalue
  \(\lambda\) is \(\dim\operatorname{Null}(A-\lambda I)=n-\operatorname{rank}(A-\lambda I)\).
  So "does this repeated eigenvalue give one direction or a plane of them?" is
  answered by computing a rank. L11's defective case becomes calculable rather
  than merely nameable.

### 7. Minimal formal derivation

**Definition.** \(\dim V\) = the number of vectors in any basis of \(V\).
**Result (stated, `reference`).** Every basis of a finite-dimensional space has
the same number of vectors, so \(\dim\) is well defined.

**Theorem (Rank–Nullity).** For any \(m\times n\) matrix \(A\),
\(\operatorname{rank}A+\operatorname{nullity}A=n\).
*Proof.* §6b–e. \(\blacksquare\)

**Corollaries.** \(\operatorname{rank}A\le\min(m,n)\); \(n>m\Rightarrow\) not
one-to-one; \(n<m\Rightarrow\) not onto; for square \(A\), one-to-one \(\iff\)
onto \(\iff\) invertible.

### 8. Equivalence to the original object
The theorem counts exactly the objects L8 defined — no redefinition. The proof's
\(r\) is \(\dim\operatorname{Col}(A)\) by (d) and the pivot count by (f), so the
"conservation" reading and the "bookkeeping" reading describe the same number. The
one genuinely new commitment is (a): that \(\dim\) is basis-independent, without
which "the number of surviving dimensions" would not be well defined at all.

### 9. Cost / model change

**Licenses:** compute either count from the other; bound \(\operatorname{rank}\)
by \(\min(m,n)\); rule out one-to-one for \(n>m\) and onto for \(n<m\) *without
any computation*; assert one-to-one \(\iff\) onto for square maps; compute
geometric multiplicity as \(n-\operatorname{rank}(A-\lambda I)\).

**Does NOT license:**
- one-to-one \(\iff\) onto for **non-square** maps (false, and it is exactly the
  square case that makes it tempting);
- any claim that \(\operatorname{Null}(A)\) and \(\operatorname{Col}(A)\) are
  complements or that \(\mathbb{R}^n\) "splits" into them — they are generally in
  different spaces, and the proof splits \(\mathbb{R}^n\) using a *chosen basis
  extension*, not a canonical decomposition;
- concluding anything about \(\operatorname{rank}(AB)\) beyond
  \(\operatorname{rank}(AB)\le\min(\operatorname{rank}A,\operatorname{rank}B)\)
  (stated, not developed);
- reading the law as saying dimensions are "conserved" in any physical sense —
  the conservation is of a *count*, under one fixed map.

### 10. What the learner can predict or do afterward
- State, with no computation, that a \(\mathbb{R}^4\to\mathbb{R}^2\) map has
  nullity \(\ge2\), and why.
- Given rank, produce nullity (and conversely) for square and non-square maps.
- Decide whether a described map can exist at all.
- Explain why L6's long list of equivalent conditions works for square matrices
  and fails otherwise.
- Compute a geometric multiplicity as \(n-\operatorname{rank}(A-\lambda I)\).

### 11. Transfer assessment
- **Eigenvalue multiplicities (L11)** — *exact*.
- **Least squares (L13)** — *exact*: full column rank is exactly nullity \(0\),
  which is what makes the normal equations uniquely solvable.
- **SVD (L14)** — *exact*: the number of nonzero singular values is the rank.
- **The pigeonhole principle** — *architectural*: "you cannot fit \(n\)
  independent directions into fewer than \(n\) dimensions" is the same counting
  intuition in a different setting; labelled as an analogy, not a proof.
- **Degrees of freedom / redundancy in data** — *architectural*.

### 12. Bridge
**Operational + representational; no real-world story.** A **ledger**: \(n\)
input dimensions enter on the left, and each is posted to exactly one of two
columns — *survived* or *crushed*. The totals must balance to \(n\). The learner
changes the map and watches the postings move between columns while the total
never changes. Non-square maps are used from the start, so the budget \(n\) and
the output ceiling \(m\) are visibly different numbers.

### 13. Preserved correspondences & analogy limits

| Maps **exactly** (keep) | Property the ledger must **not** add (name & discard) |
| --- | --- |
| the running total \(n\) ↔ the input dimension | that \(m\) also enters the balance — the law's right-hand side is \(n\), never \(m\); \(m\) only caps the rank |
| a posting to "survived" ↔ one dimension of \(\operatorname{Col}(A)\) | that \(\mathbb{R}^n\) *decomposes* into the two spaces — the split uses a chosen basis extension and the two spaces are generally not even in the same \(\mathbb{R}^k\) |
| a posting to "crushed" ↔ one dimension of \(\operatorname{Null}(A)\) | that a *specific* input direction can be identified as "the one that died" — only the counts are canonical |
| the balance ↔ the theorem | that this is a physical conservation of something; it is a count, for one fixed map |

### 14. Abstraction return
1. *Recognize* — watch a posting move from "survived" to "crushed" as the map degenerates.
2. *Explain* — "the total is the input dimension, and it cannot change."
3. *Transfer* — a non-square map the learner has not seen; predict what is
   impossible before computing.
4. *Symbolic* — write \(\operatorname{rank}A+\operatorname{nullity}A=n\), and use
   it to produce a geometric multiplicity.

**Representation-only learner detector:** one who can read the ledger but
(i) puts \(m\) on the right-hand side, (ii) claims one-to-one \(\iff\) onto for a
\(2\times3\) map, or (iii) says \(\mathbb{R}^n\) is the union/direct sum of the
two spaces, has the picture, not the concept.

---

## Prerequisites, limitations, likely misconceptions

- **Prerequisites:** basis and span (L1); pivots and free variables (L4);
  \(\operatorname{Col}\), \(\operatorname{Null}\), rank, and the pivot/free
  observation (L8). All built.
- **Limitations:** the well-definedness of dimension is **stated, not proved**;
  basis extension is used as a known fact from L1; \(\operatorname{rank}(AB)\)
  bounds are mentioned only; no infinite-dimensional spaces; examples are at most
  \(3\times3\), \(2\times3\), \(3\times2\).
- **Likely misconceptions:**
  - "\(\operatorname{rank}+\operatorname{nullity}=m\)" (the output dimension) —
    the single most common error, and the reason non-square examples are mandatory.
  - "One-to-one \(\iff\) onto" in general (true only for square).
  - "\(\mathbb{R}^n = \operatorname{Col}(A)\oplus\operatorname{Null}(A)\)."
  - "The theorem says the map preserves dimension" (it says the *count* balances;
    the map generally destroys dimensions).
  - "It is just counting columns, so it has no content."

---

## Mathematical audit (Audit A)

| Check | Result |
| --- | --- |
| 1. Conclusion follows | PASS — §6b–e is a complete proof (spanning **and** independence both shown); it does not assume the pivot/free split, so §6f is a remark rather than a hidden premise. |
| 2. Sufficiency / scope | PASS — the corollaries in §6g are each stated with their hypothesis on \(m\) vs \(n\); one-to-one \(\iff\) onto is explicitly scoped to **square** and flagged as false otherwise (§9). |
| 3. Structure-preserving representation | PASS — the ledger's total is \(n\), and the three things it could falsely suggest (\(m\) in the balance, a canonical decomposition, an identifiable "dying" direction) are named and discarded (§13). |
| 4. Hidden normalization | PASS — §6b's basis extension is an explicit **choice**, and §9 states that no canonical decomposition follows from it. |
| 5. Nature of connections | PASS — L11/L13/L14 **exact**; pigeonhole and degrees-of-freedom **architectural** (§11). |
| 6. Notation level | PASS — \(\dim\), rank, nullity, basis extension; nothing expert-only (no quotient spaces, no first isomorphism theorem, though the proof is its shadow). |

## Grounding & model-change audit (Audit B)

| Check | Result |
| --- | --- |
| B1. Model change vs wording | PASS — a tautology becomes a law with a mechanism and a set of things it forbids. |
| B2. New prediction | PASS — impossibility results with no computation (§10). |
| B3. Compression / purpose | PASS — L3's trichotomy and L6's equivalence list both become consequences. |
| B4. Genuine isomorphism | PASS — postings ↔ basis vectors, total ↔ \(n\) (§13 left). |
| B5. Named pragmatic additions | PASS — three named and discarded (§13 right). |
| B6. Abstraction return | PASS — four steps + detector (§14). |
| B7. Theme removal | PASS — the ledger is a counting device, not a decorative theme; stripping it leaves the proof intact. |

Closing question: **more illuminating than a strong conventional explanation?**
Yes. The conventional presentation proves the theorem and moves on, leaving a
learner who can restate it but not use it. This order diagnoses the "too obvious"
trap directly, and spends the lesson on what the law forbids — which is the only
evidence that anything changed.

---

## Review signoff

| Role | Filled by | Status |
| --- | --- | --- |
| Contract author | Claude Code agent (AI) | Complete |
| Mathematical reviewer | Claude Code agent (AI) — **not independent** | Self-review; Audit A passed. The "not a canonical decomposition" scope note and the square-only scoping of one-to-one ⟺ onto were added during review. |
| Pedagogical reviewer | Claude Code agent (AI) — **not independent** | Self-review; items 1–14 present. |
| User / domain-owner approval | Repository owner | **Authorized to build.** Independent review outstanding. |

---

## Gate result

`Gate result: PASS`

**Exact primary insight (verbatim for the plan's metadata):**

> The input dimension \(n\) is a budget, and a linear map spends all of it: each
> input dimension has exactly one fate — it survives into the image, or it
> collapses into the null space — so \(\operatorname{rank}A+\operatorname{nullity}A=n\)
> is a conservation law rather than column bookkeeping, and the proof is a
> one-to-one matching between a basis extension of the null space and a basis of
> the image. Because the total is fixed, rank and nullity are not two independent
> measurements but one: fixing either determines the other, which is why the law
> **forbids** whole classes of maps — nothing from a bigger space to a smaller one
> is one-to-one, nothing from a smaller space to a bigger one is onto, and only
> for square maps are one-to-one and onto the same condition.
