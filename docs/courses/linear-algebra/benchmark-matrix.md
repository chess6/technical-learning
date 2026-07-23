# Linear Algebra Benchmark Matrix

An **internal design benchmark** that instantiates the three
[course profiles](../../authoring/mastery-standard.md#3-course-profiles) for linear
algebra, calibrated against representative university courses. It is the
linear-algebra-specific calibration quarantine referenced by
[authoring/mastery-standard.md §10](../../authoring/mastery-standard.md#10-standards-hierarchy-where-this-document-sits):
the mastery standard, lesson contract, and page grammar stay subject-agnostic;
*this* document holds the linear-algebra particulars.

> **This is a calibration target, not a claim.** Listing what a demanding
> course expects does **not** assert that this app currently satisfies it. The
> "current spine coverage" and "missing / deferred" columns state honestly where
> the built course
> ([courses/linear-algebra/course-spine.md](course-spine.md)) stands
> against each benchmark. Nothing here reopens authoring of the `future` lessons
> (`.cursor/rules/project-core.mdc`).

## Sources and how they are used

External calibration draws on authoritative, publicly documented courses and
textbooks. We cite **topic coverage, course structure, and pedagogical style**
only — never reproduced problem sets or substantial copyrighted text.
Repository-derived conclusions (what the spine covers) are marked **[repo]**;
external evidence is marked **[ext]** with its source. Each source lists its
**edition / semester** and a **public link** so a claim can be re-verified; the
[source-to-claim mapping](#source-to-claim-mapping) below ties each [ext] tag to
the specific rows it supports.

| Ref | Source (edition / semester) | Link | Role in calibration |
| --- | --- | --- | --- |
| **[ext-Lay]** | Lay, Lay & McDonald, *Linear Algebra and Its Applications*, **5th/6th ed.** (2016 / 2021) — a standard sophomore service-course text. | `pearson.com` (title page) | **P1** (standard computational first course): topic set, computational emphasis. |
| **[ext-1806]** | MIT **18.06** *Linear Algebra* — Strang, *Introduction to Linear Algebra*, **5th ed.** (2016); calibrated to **OCW Spring 2010** syllabus (most fully documented offering). Catalog: "matrix theory and linear algebra, emphasizing topics useful in other disciplines… Uses linear algebra software." Assessment (OCW 2010): 3 in-class exams + final; weight ≈ psets 15% / exams 45% / final 40%. | `ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/` | **P2** (demanding engineering/applied): topic breadth (LU/QR/SVD), software use, timed closed-book assessment, applications. |
| **[ext-Axler]** | Axler, *Linear Algebra Done Right*, **4th ed.** (2024, open access). Abstract vector spaces & linear maps; determinants deferred to the final chapter; determinant-free proof of the existence of eigenvalues. A **second**, proof-based course for math majors. | `linear.axler.net` | **P3** (proof-based / honors): proof style, abstraction ceiling, determinant-late ordering. |
| **[ext-18700]** | MIT **18.700** *Linear Algebra* (the more theoretical counterpart to 18.06, per the 18.06 catalog note "compared with 18.700, more emphasis on matrix algorithms"); OCW **Fall 2013**. | `ocw.mit.edu/courses/18-700-linear-algebra-fall-2013/` | **P3** corroboration (first proof-based course): proof-heavy assessment. |
| **[ext-FIS]** | Friedberg, Insel & Spence, *Linear Algebra*, **4th/5th ed.** (2002 / 2018) — a common **first** proof-based course text. | `pearson.com` (title page) | **P3** corroboration as a *first* course (proof emphasis without Axler's second-course ceiling). |

Note that 18.06 [ext-1806] uses Strang's *Introduction to Linear Algebra*; Axler
[ext-Axler] is explicitly a **second** course. A first proof-based *honors*
course (P3 as a first course) is better modeled by [ext-FIS] / [ext-18700]; Axler
calibrates the proof **style and abstraction ceiling** we point toward.

### Source-to-claim mapping

Which external source backs which specific benchmark claim (so a reader can audit
each [ext] tag against its use):

| Source | Backs these claims |
| --- | --- |
| **[ext-Lay]** | P1 topic coverage and "correct hand computation on small systems" (§1 P1 row; §2 P1 bars). |
| **[ext-1806]** | P2 topic breadth incl. **LU/QR, SVD, conditioning, applications** (§2 P2 bars for L4, L11–L14); **software assumed**, **closed-book timed exams**, cost-awareness (§1 P2 rows: computational/assessment/software/speed). |
| **[ext-Axler]** | P3 **abstract vector spaces & linear maps**, **determinant-free eigenvalue existence**, **determinants late**, spectral theorem / inner-product spaces (§1 P3 rows; §2 P3 bars for L7, L11, L12, L14). |
| **[ext-18700]** | P3 corroboration that a *first* theoretical LA course is proof-heavy in assessment (§1 P3 assessment row). |
| **[ext-FIS]** | P3-as-first-course topic/proof balance without a second-course ceiling (§1 P3 rows; disambiguates Axler as second-course). |

---

## 1. The three profiles at a glance

| Dimension | **P1 — Standard computational first course** | **P2 — Demanding engineering / applied** | **P3 — Proof-based / honors** |
| --- | --- | --- | --- |
| **Intended learners** | Sophomores across STEM meeting LA as a tool. | Engineering / CS / data students who will *use* LA heavily. | Math majors and strong students building proof maturity. |
| **Prerequisite expectations** | Algebra, basic functions; no proof background. | Calculus; some programming; comfort with algorithms. | "Mathematical maturity" [ext-Axler]; comfort reading/writing proofs. |
| **Topic coverage** | Systems, elimination, matrix algebra, determinants, vector spaces (concrete \(\mathbb{R}^n\)), eigenvalues, orthogonality/least squares (intro). [ext-Lay] | All of P1 **plus** LU/QR, SVD, conditioning, applications (networks, Markov, Fourier, differential equations), norms. [ext-1806] | Abstract vector spaces, linear maps, dimension, eigen-theory (often determinant-free), inner-product spaces, spectral theorem, SVD; determinants late. [ext-Axler] |
| **Computational expectations** | Correct hand computation on small (2–4 dim) systems/matrices. | Efficient computation **and** algorithmic/cost awareness (\(\sim m^2\) vs \(m^3\)); software-assisted on large problems. [ext-1806] | Computation in service of theory; can compute but assessed mainly on reasoning. |
| **Conceptual expectations** | Geometric intuition; four fundamental subspaces informally. | Deep operational intuition; conditioning/stability; interpret decompositions. | Structural understanding of operators; definition-driven reasoning. |
| **Theorem & proof expectations** | Statements used; short justifications; few if any full proofs. | Statements + derivations; occasional proof; emphasis on *why a method works*. | Full proofs, both directions of equivalences, counterexamples, converses. [ext-Axler] |
| **Typical assessment styles** | Problem sets + 2–3 midterms + final, mostly computational. | Closed-book timed exams (3–4 + final), mixed computation/interpretation, some software homework. [ext-1806] | Proof-heavy problem sets; exams asking for proofs and counterexamples. |
| **Expected problem complexity** | Single-topic, clean numbers, one method per problem. | Multi-step, mixed-topic, realistic/large, method-selection under time. | Abstract, general-\(n\)/general-space, "prove or disprove", minimal hypotheses. |
| **Speed requirements** | Moderate; time-limited exams on routine computation. | High; timed exams with substantial problems. [ext-1806] | Lower on speed, higher on rigor; proofs are not races. |
| **Calculator / software** | Basic calculator; software optional. | **Software assumed** (e.g. Julia/MATLAB/NumPy) for large problems; **closed-book for exams**. [ext-1806] | Minimal; the object of study is the argument, not the arithmetic. |
| **Cumulative integration** | Final is cumulative; topics fairly modular. | Strong: later topics (SVD, least squares) reuse most of the course. | Very strong: the whole course is one developing theory. |

P1, P2, and P3 are the **three mutually exclusive core profiles**; a course
declares exactly one as primary (per-module overrides aside). The
**research-bridge overlay** ([mastery-standard §3](../../authoring/mastery-standard.md#3-course-profiles))
is **not** a fourth column here: it is optional enrichment layered on an
appropriate core profile (usually P2 or P3), adds E7 investigation habits, and
**never replaces** the core computational (P1/P2) or proof (P3) expectations or
appears on the core exam bar. A linear-algebra course targeting the overlay is
"P3 + research-bridge overlay", not a standalone "research" profile.

---

## 2. Per-topic benchmark vs. the current spine

Rows follow the [course spine](course-spine.md) (Ch0, L1–L14).
For each topic: the **profile bar** (what each profile expects), the **[repo]
current spine coverage**, and **missing / intentionally deferred**. Evidence
levels reference [COURSE §5](../../authoring/mastery-standard.md#5-evidence-levels).

### Foundations (Ch0, L1, L2)

| Topic | P1 bar | P2 bar | P3 bar | Current spine **[repo]** | Missing / deferred |
| --- | --- | --- | --- | --- | --- |
| Vectors, combinations, span, basis, coordinates (L1) | Compute combinations; recognize span/independence in \(\mathbb{R}^2/\mathbb{R}^3\) (E3). | + coordinates as a *choice*; change-of-basis foreshadowed (E3–E4). | + basis/dimension for **abstract** spaces; prove independence/spanning (E6). | Built; strong S1 intuition, coordinates-as-choice landed. | Abstract-space treatment (P3); higher-dim beyond visual (P2/P3). |
| Linear transformations & columns rule (L2) | Apply \(A\); read columns as images (E3). | + composition cost, geometric decompositions (E3–E4). | + linear map defined **independently of a matrix**; prove the columns rule (E6). | Built; "moving space" grid idiom. | Map-without-a-matrix framing (P3); \(n\)-dim (P2/P3). |

### Systems & elimination (L3, L4, L5)

| Topic | P1 bar | P2 bar | P3 bar | Current spine **[repo]** | Missing / deferred |
| --- | --- | --- | --- | --- | --- |
| Systems: row & column pictures (L3) | Classify one/none/∞ (E3). | + conditioning/near-singular sensitivity (E4). | + prove consistency ⇔ \(b\) in column space (E6). | Built; dual-picture explorer, near-singular preset. | — (well covered for P1/P2 in 2D). |
| Elimination (L4) | Reduce by hand; echelon/pivots/free vars (E3). | + LU factorization; cost; partial pivoting (E4). | + prove row ops preserve the solution set (E6). | Built; row-op invariance proven both directions. | **LU/pivoting/cost (P2 gap)**; \(n\)-dim drill volume. |
| Solution sets & homogeneous (L5) | Parametrize ∞ solutions; particular + homogeneous (E3). | + null space of larger systems (E4). | + prove \(\mathrm{Sol}=x_p+\mathrm{Null}(A)\), affine vs linear (E6). | Built; decomposition + nullity-2 case + empty case. | Higher-nullity beyond 2D visual (shown symbolically). |

### Maps, inverses, determinants (L6, L7)

| Topic | P1 bar | P2 bar | P3 bar | Current spine **[repo]** | Missing / deferred |
| --- | --- | --- | --- | --- | --- |
| Composition & inverses (L6) | Multiply matrices; compute \(A^{-1}\) (2×2/3×3) (E3). | + when to *avoid* inverses; solve via factorization (E4). | + prove invertibility ⇔ trivial null space; both directions (E6). | **Future** (`matrix-composition`). | Whole lesson unbuilt. |
| Determinants (L7) | Compute; det=0 ⇔ singular (E3). | + volume scaling, Cramer's cost caveats (E4). | + multilinear/alternating definition; det **late** [ext-Axler] (E6). | Built; signed-area model, edge cases. | Cofactor/\(n\times n\) expansion (P1/P2); axiomatic definition (P3). |

### Structure (L8, L9, L10)

| Topic | P1 bar | P2 bar | P3 bar | Current spine **[repo]** | Missing / deferred |
| --- | --- | --- | --- | --- | --- |
| Subspaces, column/null space, rank (L8) | Find bases of the four subspaces (E3). [ext-1806] | + rank in applications; numerical rank (E4). | + subspace proofs; general fields (E6). | **Future** (`subspaces-rank`). | Whole lesson unbuilt (foreshadowed in L3). |
| Dimension & rank–nullity (L9) | State & use rank + nullity = n (E3). | + interpret for data/networks (E4). | + prove rank–nullity (E6). | **Future** (`rank-nullity`). | Whole lesson unbuilt. |
| Change of basis (L10) | Coordinates in a new basis (E3). | + camera/frame transforms (E4). | + how a map's matrix transforms; similarity (E6). | **Future** (`change-of-basis`). | Whole lesson unbuilt. |

### Spectra, geometry, data (L11–L14)

| Topic | P1 bar | P2 bar | P3 bar | Current spine **[repo]** | Missing / deferred |
| --- | --- | --- | --- | --- | --- |
| Eigenvectors & diagonalization (L11) | Find eigenvalues/vectors (2×2/3×3); diagonalize (E3). | + \(A^k\), dynamics, stability, symmetric/PD (E4). [ext-1806] | + characteristic vs minimal polynomial; determinant-free existence [ext-Axler] (E6). | Built **intro** + derivation ladder; full treatment deferred. | Diagonalization/multiplicity/dynamics (P1/P2); operator theory (P3). |
| Orthogonality & projections (L12) | Dot product, projection onto a line (E3). | + Gram–Schmidt, QR, orthonormal bases (E4). [ext-1806] | + inner-product spaces, spectral theorem (E6). [ext-Axler] | **Future** (`orthogonality`). | Whole lesson unbuilt. |
| Least squares (L13) | Normal equations for a best-fit line (E3). | + regression, conditioning, QR-based solve (E4). | + projection theorem, existence/uniqueness proofs (E6). | **Future** (`least-squares`). | Whole lesson unbuilt. |
| SVD (L14) | — (often beyond P1). | Compute/interpret; low-rank approx, compression (E4). [ext-1806] | Prove existence; consequences of spectral theorem (E6). [ext-Axler] | **Future** (`svd`, capstone). | Whole lesson unbuilt. |

---

## 3. Course-level gaps (summary)

Distilling the tables — honest, **[repo]**-derived:

1. **Only 8 of 15 spine nodes are built** (Ch0, L1, L2, L3, L4, L5, L7,
   L11-intro); the structural core (L6, L8, L9, L10) and the geometry/data arc
   (L12, L13, L14) are `future`. No profile is *complete* yet; the built prefix
   best serves **P1 S1–S3 in 2D**.
2. **Dimensionality ceiling.** Content lives in \(\mathbb{R}^2\) (with one curated
   3D eigen extension). P2 and P3 both require confident work in \(\mathbb{R}^n\)
   and, for P3, abstract spaces. The [abstraction path](../../product/semantic-page-grammar.md#4-mathematical-object-and-representation-standard)
   exists precisely to lift this ceiling per lesson.
3. **Computational-fluency volume (D3).** The built lessons demonstrate methods
   well but carry few *fresh, independent* drill items — a direct hit on
   [calibration case #2](../../authoring/mastery-standard.md#8-calibration-cases). P1/P2
   both need more E2–E3 procedural practice than currently exists.
4. **Proof program (D6) absent for Profile 3.** The lessons include theorems and
   some proofs (elimination invariance, solution-set structure) but no *proof
   construction by the learner*, no counterexample construction, and no abstract
   objects — the whole P3 bar is unmet.
5. **No cumulative or delayed assessment (D10/D12) across modules** — calibration
   case #9. Assessment is per-lesson; there is no module-level cumulative set,
   spaced retrieval, mock exam, or exam mode. This is the largest *assessment*
   gap for every profile's S3 claim.
6. **P2 algorithmic/numerical content missing.** LU/QR, cost analysis,
   conditioning, and software-assisted large problems ([ext-1806]) are absent;
   the near-singular preset is the only conditioning seed.
7. **Applications are threads, not yet deep.** The spine names application threads
   (§4) but the built lessons realize few of them; P2 leans heavily on
   applications (networks, Markov, Fourier, ODEs) [ext-1806].

None of these are defects to fix now — they are the calibrated distance between
the built vertical slice and each profile, to be closed lesson-by-lesson under
the [workflow](../../authoring/mastery-standard.md#9-workflow-integration).

---

## 4. Using this matrix

- **When authoring a lesson:** its [Lesson Mastery Contract](../../authoring/templates/lesson-mastery-contract.md)
  cites the relevant row's profile bar as the target for its must-demonstrate
  outcomes, and states which profile it is being built to.
- **When validating a course (Gate 10):** produce a benchmark validation report
  that updates the "current spine coverage" column and states, per profile, what
  is covered / missing / deferred — never claiming a profile the assessments do
  not support.
- **When adding a new subject:** do **not** extend this file. Write a sibling
  `<SUBJECT>_BENCHMARK_MATRIX.md` with its own external calibration; the mastery
  standard, lesson contract, and page grammar are reused unchanged.
