# Applied Mathematics: Change, Fields, and Transforms — Course Spine

The authoritative **content spine**: the modules, the lessons, the *central
insight* each lesson must deliver, the dependency order, the declared entry
assumptions, and the recurring **application threads**.

This is a **complete applied-mathematics course**, not a route to a destination.
It covers single-variable calculus, sequences and series, complex analysis of
oscillation, orthogonality and Fourier analysis, signal processing, differential
equations and the Laplace transform, multivariable calculus, and vector calculus
through the boundary theorems. Fourier and Laplace are **milestones inside** it,
not the point at which it stops: the course continues past both, and its last
module is the vector-calculus branch that generalizes the Fundamental Theorem.

Neighbours:

- [curriculum-architecture.md](curriculum-architecture.md) — the encoding-facing
  formalization: prerequisite DAG, concept ids, visualization families,
  implementation packages, platform gaps.
- [benchmark-matrix.md](benchmark-matrix.md) — external calibration.
- [courses/multi-domain-architecture.md](../multi-domain-architecture.md) — the platform data model.
- [authoring/lesson-design.md](../../authoring/lesson-design.md) — how a single lesson is composed.
- [courses/linear-algebra/course-spine.md](../linear-algebra/course-spine.md) —
  the sibling course this one reuses and hands off to, never duplicates.

> **Scope note (durable).** Every lesson below is a `future` node **except
> `limits-continuity`, `derivative-local-linearity`, `integral-accumulation`,
> and `fundamental-theorem`, which are built**
> (Package A, slices A1–A4 — the complete package). Listing the rest does
> **not** authorize building them. Lessons are promoted one approved package
> at a time.

---

## 0. Declared course target (Gate 1)

- **Primary core profile: P2 — demanding applied.** Set up and carry out
  multi-step applied problems, choose a method without being told which applies,
  interpret results physically, use software for large instances. Calibrated
  against [ext-18.01SC], [ext-18.02SC], [ext-18.03SC] and [ext-6.003] in the
  [benchmark matrix](benchmark-matrix.md).
- **Research-bridge overlay: enabled**, as clearly-labelled enrichment only.
- **P3 module overrides: none at launch.** The natural future candidate is
  `boundary-theorems`.

> **A target, not a claim of attainment.** Three lessons of thirty-nine are built.
> Gate 10 reports the real distance.

---

## 1. The two structural themes

The course is organized around **two** connected structural ideas. Neither
subsumes the other, and conflating them would misdescribe the mathematics.

### Theme 1 — Local accumulation and boundary effects

> **Integrate a local density over a region and the interior cancels; only the
> boundary survives.**

| Instance | Local density | Region | Boundary |
| --- | --- | --- | --- |
| Fundamental Theorem of Calculus | \(F'\) | an interval | two endpoints |
| Green's theorem | scalar curl | a plane region | its boundary loop |
| Stokes' theorem | curl | a surface | its boundary curve |
| Divergence theorem | divergence | a solid | its boundary surface |

The **mechanism is the same in all four**: subdivide, write the total as a sum of
local contributions, and observe that every shared interior piece is counted
twice with opposite orientation and cancels. In one dimension that is
telescoping; in two and three it is shared edges and faces. This is why the
`telescoping-cancellation` visual family built for the FTC is re-run three times
later, and why it must be parameterized over *what cancels against what*.

### Theme 2 — Representation change and operator simplification

> **Re-express a function along a family of exponentials chosen so that
> differentiation becomes multiplication.**

| Instance | Family | Why it simplifies | What the coefficients are |
| --- | --- | --- | --- |
| Fourier series | \(e^{in\omega_0 t}\) on a bounded interval | \(\frac{d}{dt} \mapsto in\omega_0\) | **Genuinely orthogonal projections** in \(L^2\) of the interval: coefficients *are* inner products, and Parseval is the Pythagorean theorem |
| Fourier transform | \(e^{i\omega t}\) on \(\mathbb{R}\) | \(\frac{d}{dt}\mapsto i\omega\) | A unitary map on \(L^2(\mathbb{R})\) (Plancherel). The projection picture is the **limiting analogy** from the series — \(e^{i\omega t}\) is not itself in \(L^2(\mathbb{R})\), so it is not a basis vector in the Hilbert-space sense |
| Laplace transform | \(e^{-st}\), \(s\) complex, on \([0,\infty)\) | \(\frac{d}{dt}\mapsto s\), **retaining initial conditions** | **Not** an orthogonal projection. There is no inner product making \(\{e^{-st}\}\) orthogonal; the transform is a one-sided integral with a region of convergence, and inversion is a contour integral (in practice, a table and partial fractions) |

**The shared idea is the operator simplification, not the projection.** Fourier
series earn the projection language; the Fourier transform inherits it as a
limit that has to be re-justified (Plancherel); the Laplace transform does not
have it at all and must never be described as if it did. Its power comes from
analyticity and its convergence region, and its distinctive virtue — carrying
initial conditions into the algebra — is one Fourier analysis does not have.

### How the themes relate

They meet twice, and the course says so both times:

- **Integration by parts** is Theme 1's boundary term doing Theme 2's work: it is
  what turns \(\frac{d}{dt}\) into multiplication in both transforms, and the
  boundary term is where Laplace picks up the initial conditions.
- **The convolution theorem** is Theme 2's statement that a smearing operation in
  one representation is a product in the other — the same "choose the
  representation where the operation is easy" move as diagonalization in the
  built linear-algebra course.

Every lesson is introduced as a **re-interpretation of something the learner
already holds**. The acceptance bar: *state the central insight as a re-reading
of a prior lesson.*

The second organizing principle: **linear algebra is already known.** This course
does not re-teach vectors, span, bases, matrices as maps, composition, or
eigenvectors. It hands off to the built linear-algebra course and then uses those
ideas at full strength.

---

## 2. Entry assumptions, diagnostics, and bridges

**The largest risk is prerequisite recursion.** The discipline: declare what is
assumed, diagnose it, and bridge only what genuinely blocks a later lesson.

### 2.1 Declared entry assumptions (assumed, not taught)

| Assumed | Concretely |
| --- | --- |
| Algebra fluency | Rearranging equations, exponent and logarithm rules, quadratic formula, factoring, partial fractions of simple rational expressions. |
| Functions and graphs | \(f(x)\) notation, domain/range, composition, reading and sketching a graph, shifts and scalings. |
| Trigonometry, as ratios | \(\sin,\cos,\tan\) relate sides of a right triangle; the Pythagorean identity. |
| **Linear algebra, through eigenvectors** | Vectors and combinations, span and basis, a matrix as a map fixed by where the basis lands, composition, the dot product, determinants, eigenvectors. **Supplied by this platform's built linear-algebra course** — a hard cross-course prerequisite. |

### 2.2 Entry diagnostic

A short diagnostic (Mode D artifact, module `entry-bridges`) with three
independently-reported strands, each routing separately:

| Strand | If passed | If not |
| --- | --- | --- |
| Algebra & functions | Skip `functions-graphs-bridge` | Take it |
| Radians & sinusoids | Skip `radians-rotation` | Take it |
| Linear algebra | Enter directly | Route to the linear-algebra course |

### 2.3 The two bridges

- **`functions-graphs-bridge` — conditional.** Function notation, composition,
  graph transformations, exponentials and logarithms. Surfaced only when flagged.
- **`radians-rotation` — required unless diagnosed out.** Its insight is a genuine
  reframe: **an angle is an arc length, and \(\sin,\cos\) are the coordinates of a
  point circling at constant speed.** Every periodic object in the course is that
  point's shadow.

**Explicitly not bridged:** geometry proofs, conic sections, polynomial long
division, matrix arithmetic drills, set theory, induction. None blocks a lesson
below; each would start a recursion.

---

## 3. Module structure

**One module = one `courseModel.ts` unit = one implementation package.** That
identity is deliberate: it makes the roadmap, the sidebar, and the docs tree
agree, and it means shipping a package always completes a unit rather than
leaving one half-built.

| # | Module / unit id | Title | Lessons | Package |
| --- | --- | --- | --- | --- |
| M0 | `entry-bridges` | Getting on the road | 2 *(1 conditional)* | B0 |
| M1 | `calculus-foundations` | The two operations and the theorem that binds them | 4 | **A** |
| M2 | `calculus-technique` | Making them computable | 4 | B |
| M3 | `series` | Sequences, series, and power series | 3 | C |
| M4 | `complex-oscillation` | Complex numbers and oscillation | 3 | D |
| M5 | `projection-spectra` | Projection and spectra | 4 | E |
| M6 | `signals` | Convolution, sampling, and the FFT | 3 | F |
| M7 | `differential-equations` | Differential equations and the Laplace transform | 3 | G |
| M8 | `response-control` | Response, circuits, and control | 3 | H |
| M9 | `many-variables` | Calculus in more variables | 3 | I |
| M10 | `fields` | Vector fields, circulation, and flux | 3 | J |
| M11 | `boundary-theorems` | Green, Stokes, and the divergence theorem | 4 | K |

**39 lessons** (38 indispensable + 1 conditional bridge) in **12 packages**.

M1 and M2 are the **trunk** on which everything else depends. M3–M6, M7–M8, and
M9–M11 are three branches, described in [§6](#6-the-three-branches).

---

## 4. The spine at a glance

`Status`: all `future` except `limits-continuity`, `derivative-local-linearity`,
`integral-accumulation`, and `fundamental-theorem`, which are **built**
(Package A, complete).

| Spine | Lesson | Central insight (the "not memorize X, but Y") | Unit | Curriculum id |
| --- | --- | --- | --- | --- |
| B0 | Functions, graphs, and the shapes you keep meeting | *(conditional)* A function is a machine; its graph is the machine's whole behaviour at once, and shifting or scaling the graph is arithmetic on the machine. | `entry-bridges` | `functions-graphs-bridge` |
| B1 | Radians and the rotating point | An angle is an **arc length**, and \(\sin,\cos\) are the **coordinates of a point circling at constant speed** — not triangle ratios. | `entry-bridges` | `radians-rotation` |
| L1 | What "approaches" means **(built)** | A limit is not "substitute the value"; it is a **local tolerance guarantee** — name any tolerance and *some* window delivers it. Continuity is that guarantee holding with the function's own value as the target. | `calculus-foundations` | `limits-continuity` |
| L2 | The derivative as local linearity **(built)** | Zoom far enough into a smooth curve and it **is** a line. "Rate of change", "slope of the tangent", and "best linear approximation" are one object read three ways. | `calculus-foundations` | `derivative-local-linearity` |
| L3 | The integral as accumulation **(built)** | An integral is **the total of a rate**; "area under the curve" is what totalling a rate looks like when the thing you drew is the rate. | `calculus-foundations` | `integral-accumulation` |
| L4 | The Fundamental Theorem of Calculus **(built)** | Measuring a rate and accumulating a rate are **inverse processes**, and the infinite sum collapses because interior contributions **telescope**. **Theme 1, in one dimension.** | `calculus-foundations` | `fundamental-theorem` |
| L5 | The chain rule: rates compose | Composing functions composes their local linear models, so rates **multiply**. This is matrix composition (LA L6) in one dimension. | `calculus-technique` | `chain-rule` |
| L6 | Deciding with the derivative | The derivative turns "find the best" into "find where the local model is flat", and "hard function" into "easy polynomial, near here". | `calculus-technique` | `optimization-approximation` |
| L7 | Two techniques, both derived | Substitution is the chain rule read backwards; parts is the product rule read backwards — and **parts is the boundary term of Theme 1**, which is why it reappears in both transforms. | `calculus-technique` | `substitution-parts` |
| L8 | Accumulating forever | An integral over an infinite interval is a **limit of finite accumulations**; convergence is a question about **decay rate**. Licenses every transform integral in the course. | `calculus-technique` | `improper-integrals` |
| L9 | Sequences and their limits | A sequence converges when its tail is eventually trapped in any tolerance — L1's guarantee with the window replaced by "far enough along". | `series` | `sequences-limits` |
| L10 | Series: adding forever | An infinite sum is **the limit of its partial sums**, not a completed addition. Convergence is a property of the tail, and absolute convergence is what makes rearrangement safe. | `series` | `series-convergence` |
| L11 | Power series and Taylor series | A power series is a **function built from its derivatives at one point**, valid inside a radius the coefficients themselves determine. L6's linearization was its first two terms. | `series` | `power-taylor-series` |
| L12 | Complex numbers as rotation and scaling | Multiplying by a complex number is **rotate and scale** — the same 2×2 map from LA L2. \(i\) is a quarter turn. | `complex-oscillation` | `complex-rotation` |
| L13 | Euler's formula | \(e^{i\theta}\) is what an exponential does when its **growth rate is a quarter turn from its position**: it turns instead of growing. Trigonometric identities become exponent rules. | `complex-oscillation` | `eulers-formula` |
| L14 | Waves: frequency, phase, complex sinusoids | Amplitude and phase are **one complex number**. Adding waves of one frequency is adding vectors. | `complex-oscillation` | `waves-phasors` |
| L15 | Inner products and projection | The dot product's job is **"how much of one thing is another"**, and every property that matters survives when the vectors become functions and the sum becomes an integral. The closest point in a subspace is the one whose **error is orthogonal** to it. | `projection-spectra` | `inner-products-projection` |
| L16 | Orthogonal families | Distinct sinusoids are **orthogonal over a period**, so they behave like perpendicular axes: each coordinate is read off **independently**, one integral each. | `projection-spectra` | `orthogonal-families` |
| L17 | Fourier series | A Fourier coefficient **is a projection**. The series is the function written in the sinusoid basis, and its convergence is **convergence in energy** — a different claim from pointwise convergence, as Gibbs shows. **Theme 2's cleanest case.** | `projection-spectra` | `fourier-series` |
| L18 | The Fourier transform | Let the period grow and the discrete comb of coefficients becomes a **continuous spectrum**. The projection language survives as a limit that Plancherel re-justifies — it is not literally an expansion in an orthonormal basis. | `projection-spectra` | `fourier-transform` |
| L19 | Convolution and filtering | Multiplying spectra **is** smearing in time. A filter is one operation seen from two sides, and an LTI system is fully described by its impulse response. | `signals` | `convolution-filtering` |
| L20 | Sampling and aliasing | Sampling in time **replicates** the spectrum; aliasing is those copies overlapping. The sampling rate is a statement about the spectrum, not about the signal's speed. | `signals` | `sampling-aliasing` |
| L21 | The DFT and the FFT | The DFT is the finite, computable transform; the FFT is the same computation with the shared sub-work done once — the Karatsuba move, on a different problem. | `signals` | `dft-fft` |
| L22 | First-order equations | A differential equation says how a system changes **given where it is**. Exponential growth is the unique answer to "the rate is proportional to the amount". | `differential-equations` | `first-order-odes` |
| L23 | Second-order equations | Guessing \(e^{st}\) turns a differential equation into a **polynomial**. Exponentials are the **eigenfunctions of \(d/dt\)** — LA L11's idea in function space. | `differential-equations` | `second-order-odes` |
| L24 | The Laplace transform | Re-express a signal along \(e^{-st}\) so that \(\frac{d}{dt}\) becomes multiplication by \(s\) — **and the initial conditions come along**, in the boundary term integration by parts leaves behind. Not a projection; a one-sided integral with a region of convergence. | `differential-equations` | `laplace-transform` |
| L25 | Coming back: inverse transforms | Inversion is not a new integral to evaluate but a **recognition problem**: split a rational transform into pieces whose originals you know. Partial fractions are the whole technique. | `response-control` | `inverse-laplace` |
| L26 | Transfer functions and impulse response | A linear time-invariant system is completely described by what it does to **one impulse**; everything else is convolution, which in the transform domain is multiplication. | `response-control` | `transfer-impulse-response` |
| L27 | Circuits, feedback, and stability | Poles are not algebra; they are **the system's own exponentials**. Where they sit decides whether a response decays, rings, or runs away — and feedback moves them. | `response-control` | `circuits-control-stability` |
| L28 | Partial derivatives and the gradient | With more than one input there is no single "the" rate — it depends on direction. The gradient collects them all and points **uphill**; it is the linear map of L2's zoom, one dimension up. | `many-variables` | `partial-derivatives-gradient` |
| L29 | Accumulating over a region | The same accumulation, iterated. The **order** of accumulation is a choice, and choosing well is most of the technique. | `many-variables` | `multiple-integrals` |
| L30 | Changing coordinates | A coordinate change is a **map**, and the factor it introduces is the local area/volume scale — the Jacobian **determinant**, which is LA L7's number doing exactly its old job. | `many-variables` | `change-of-variables-jacobian` |
| L31 | Vector fields, paths, line integrals | A field assigns a vector to every point. A line integral totals a field **along a path** — work, or flow along. | `fields` | `vector-fields-line-integrals` |
| L32 | Circulation and flux | Two different questions about the same field at the same boundary: how much goes **around**, and how much goes **through**. | `fields` | `circulation-flux` |
| L33 | Divergence and curl | Shrink the loop and shrink the box. Circulation per unit area is **curl**; flux per unit area is **divergence**. Local densities of global quantities. | `fields` | `divergence-curl` |
| L34 | Green's theorem | **Theme 1 in two dimensions.** Total the local curl over a region: every interior edge is traversed twice in opposite directions and cancels, and only the boundary loop survives — the same argument as L4. | `boundary-theorems` | `greens-theorem` |
| L35 | Surface integrals | A surface integral totals over a **parameterized** surface, and the area element is the coordinate-change factor of L30 living on the surface. | `boundary-theorems` | `surface-integrals` |
| L36 | Stokes' theorem | Green's theorem, lifted off the plane: the curl through *any* surface equals the circulation round its rim, so the surface can be deformed freely as long as the rim is fixed. | `boundary-theorems` | `stokes-theorem` |
| L37 | The divergence theorem and conservation | The flux out of a solid is the divergence inside it. Read as physics, that is a **conservation law**: what leaves the boundary is what the interior produced. | `boundary-theorems` | `divergence-theorem` |

---

## 5. Prerequisite paths to the three milestones

These are **navigation aids inside a complete course**, not the course's purpose.
Each counts the lessons that must be built for the milestone to be honest.

### 5.1 The Fourier transform — 15 lessons (14 if diagnosed out of B1)

```
radians-rotation → limits-continuity → derivative-local-linearity
  → integral-accumulation → fundamental-theorem → improper-integrals
  → sequences-limits → series-convergence
  → complex-rotation → eulers-formula → waves-phasors
  → inner-products-projection → orthogonal-families
  → fourier-series → fourier-transform
```

Plus the cross-course prerequisite `vectors` (linear algebra, built).

**Off this path, and why:** `chain-rule` and `substitution-parts` (needed for
transform *properties* and for the dynamics branch, not to define, compute, or
interpret the transform); `optimization-approximation`; `power-taylor-series`
(needed for L11's own sake and for Laplace's region-of-convergence reasoning, not
for the transform's definition); all of multivariable and vector calculus.

### 5.2 Green's theorem — 11 lessons

```
limits-continuity → derivative-local-linearity → integral-accumulation
  → fundamental-theorem → chain-rule
  → partial-derivatives-gradient → multiple-integrals
  → vector-fields-line-integrals → circulation-flux → divergence-curl
  → greens-theorem
```

`chain-rule` is genuinely required: a line integral is evaluated by
parameterizing the path and differentiating the composition. `change-of-variables-jacobian`
is **not** on this path (Green's theorem on a simple region needs no coordinate
change) but is required for L35–L37.

### 5.3 The Laplace transform — 13 lessons

```
radians-rotation → limits-continuity → derivative-local-linearity → chain-rule
  → integral-accumulation → fundamental-theorem → substitution-parts
  → improper-integrals → complex-rotation → eulers-formula
  → first-order-odes → second-order-odes → laplace-transform
```

**Fourier is not a prerequisite of Laplace.** The two share Theme 2's operator
idea but not a construction, so `fourier-transform → laplace-transform` is a
**connection edge, not a gate** — a correction from an earlier draft that
described Laplace as the same projection. The dynamics branch can therefore be
taken before, after, or instead of the Fourier branch.

### 5.4 Shared trunk

All three paths share `limits-continuity`, `derivative-local-linearity`,
`integral-accumulation`, and `fundamental-theorem` — **Package A**, and the
reason it is built first.

---

## 6. The three branches

```
                        ┌── M3 Series ── M4 Complex ── M5 Projection & spectra ── M6 Signals
                        │
M0 ── M1 Foundations ── M2 Technique ──┼── M7 Differential equations ── M8 Response & control
      (derivative,      (chain rule,   │
       integral, FTC)    parts,        └── M9 Many variables ── M10 Fields ── M11 Boundary theorems
                         improper)
```

### 6.1 The transform branch (M3 → M6)

Needs the integral, the FTC, improper integrals, and series (for what an infinite
sum of sinusoids means). Adds the complex language, then orthogonality, then
Fourier, then what the spectrum is for.

### 6.2 The dynamics branch (M7 → M8)

Needs the derivative, the chain rule, integration by parts (which *is* the
Laplace derivative rule), improper integrals, and complex exponentials.
**Independent of the Fourier branch**, by the correction in §5.3. It closes a
loop with linear algebra: `second-order-odes` shows \(e^{st}\) are the
eigenfunctions of \(d/dt\).

### 6.3 The fields branch (M9 → M11)

Needs the derivative, the integral, the chain rule, and above all the **FTC**,
which it generalizes three times. Independent of M3–M8. It is placed last in the
canonical order because it is the **capstone**: Theme 1 reaches full generality
there, and the learner has by then watched the same cancellation argument pay off
once already.

---

## 7. Application threads

Applications are **explanatory anchors**, not anecdotes. Each recurs, and each
recurrence is the same system seen with more mathematics.

| Thread | Where it recurs | What it explains |
| --- | --- | --- |
| **Motion** | L1, L2, L3, L4, L22 | The cleanest place to see that differentiating and accumulating undo each other: a speedometer and an odometer never disagree. |
| **Circuits** | L14, L22, L24, L26, L27 | RC decay is the canonical first-order equation; RLC the canonical second-order one; impedance is why complex numbers are worth the trouble; the transfer function is what M7–M8 build toward. |
| **Audio** | B1, L14, L17, L18, L19, L20 | Timbre is a spectrum; an equaliser is a filter; a sample rate is a theorem. |
| **Heat and diffusion** | L3, L17, L29, L33, L37 | The historical reason Fourier series exist, and the cleanest reading of divergence as "what is accumulating here". |
| **Growth and decay** | L6, L9, L13, L22 | Populations, cooling, compound interest — the exponential arrives as an *answer*, not a definition. |
| **Optimization** | L6, L28 | Where the derivative earns its keep before any transform appears. |
| **Images and compression** | L19, L21 | Blur as convolution; JPEG as "most coefficients are small". |
| **Fluid flow, circulation, conservation** | L31–L37 | Circulation and flux are questions people ask about water and air; the divergence theorem is a conservation law said out loud. |
| **Control** | L26, L27 | Why anyone wants poles, stability, and feedback. |

---

## 8. What this course reuses instead of rebuilding

| Reused | From | How |
| --- | --- | --- |
| Vectors, span, basis, coordinates, dot product | LA `vectors` (built) | `inner-products-projection` **generalizes** the dot product rather than introducing it. |
| A matrix as a map; the columns rule | LA `transformations` (built) | `complex-rotation` presents complex multiplication as one of those maps; `partial-derivatives-gradient` presents the Jacobian as one. |
| Composition of maps | LA `matrix-composition` (built) | `chain-rule` **is** this, in one dimension. |
| Determinant as an area/volume scale | LA `determinants` (built) | `change-of-variables-jacobian` uses exactly that number for exactly that job. |
| Eigenvectors and diagonalization | LA `eigenvectors` (built) | `second-order-odes` reads \(e^{st}\) as an eigenfunction of \(d/dt\); `convolution-filtering` reads complex sinusoids as the eigenfunctions of LTI systems. |
| Divide-and-conquer | Algorithms `karatsuba` (built) | `dft-fft` names the FFT as the same move — an explicit cross-subject connection. |
| Projection and least squares, finite-dimensional depth | LA `orthogonality`, `least-squares` (**future**) | `inner-products-projection` takes the **minimum** it needs and pushes straight to function space. When the LA lessons ship, this one references them. |

**Non-duplication rule.** If an idea has a home in the linear-algebra spine, this
course links to it. The only linear algebra this course *owns* is what happens
when the vectors become **functions**.

---

## 9. Indispensable vs optional

**Indispensable: 38 lessons** — everything in §4 except `functions-graphs-bridge`,
which is diagnostic-conditional. Nothing in §4 is a candidate for cutting: the
branches must complete, including all four boundary theorems.

**Optional enrichment (not on the spine; recorded so it is not smuggled in):**

| Enrichment | Attaches after | Why optional |
| --- | --- | --- |
| Series solutions of ODEs, Frobenius | L23 | A technique branch; the course's ODEs are constant-coefficient. |
| Complex analysis: contours, residues, Bromwich inversion | L25 | Would make inverse Laplace slicker; the course inverts by table and partial fractions and says so. |
| The z-transform and discrete-time systems | L21 | A signals course of its own. |
| Bode plots, root locus, controller design | L27 | A control course of its own. |
| Lagrange multipliers, constrained optimization | L28 | Real, useful, off every path here. |
| Partial differential equations (heat, wave, Laplace's equation) | L17, L37 | The historical motivation for Fourier series and a whole course of its own. |
| Differential forms; the generalized Stokes theorem | L37 | The statement Theme 1 is reaching for; needs machinery this course does not build. |
| Windowing, spectral leakage, the STFT | L21 | Practitioner material. |
| Numerical quadrature and stiff solvers | L3, L22 | Computing topics. |

---

## 10. Per-module notes

**M0 Getting on the road.** A prepared learner sees neither bridge. If a bridge
grows past a single insight, tighten the entry assumption rather than lengthening
the bridge.

**M1 The two operations and the theorem that binds them.** The order is chosen
against the usual one: accumulation arrives *before* any antiderivative, so the
FTC is a discovery rather than a definition. The four lessons are a complete arc
on their own.

**M2 Making them computable.** Exists to derive the two techniques the rest of
the course uses — and to note that integration by parts is Theme 1's boundary
term, which is why it turns up again in both transforms. L8 is the quiet
keystone: without improper integrals every transform in M5–M7 is unlicensed
notation.

**M3 Sequences, series, and power series.** Not a detour. L10 is what makes "an
infinite sum of sinusoids" mean something in L17, and L11's radius of convergence
is the same kind of object as Laplace's region of convergence in L24.

**M4 Complex numbers and oscillation.** Complex numbers introduced
**geometrically first**, so Euler's formula can be *derived* from "what function's
rate of change is a quarter turn from its position?" rather than asserted from a
series — though by M3 the series derivation is also available, and the lesson
gives both and says which is which.

**M5 Projection and spectra.** The conceptual heart. L15–L16 make
"coefficient = projection" available *before* any Fourier formula. L18 states
carefully what survives the limit and what does not.

**M6 Signals.** L19 is the course's hardest single mechanic and its
highest-value one. L21 closes the loop to computation and to the algorithms
course.

**M7 Differential equations and the Laplace transform.** Independent of the
Fourier branch. L24 must be introduced on its own terms — one-sided integral,
region of convergence, initial conditions in the boundary term — with the Fourier
connection drawn as a *comparison*, never as an inheritance.

**M8 Response, circuits, and control.** The engineering payoff. L27 is where
poles stop being algebra.

**M9–M11.** The vector-calculus branch, completed. L34 is the flagship, and its
animation is L4's cancellation re-run over a region. L36 and L37 finish Theme 1;
the course stops before differential forms and says so.

---

## 11. Open questions recorded, not resolved

- **Whether `boundary-theorems` takes a P3 override** should be decided when that
  package is scheduled.
- **Whether `functions-graphs-bridge` needs to exist** is a question the
  diagnostic will answer with data.
- **How far L18's honesty about \(L^2(\mathbb{R})\) should go** — Plancherel is
  stated; whether to name the density argument that proves it is a P3 question.
