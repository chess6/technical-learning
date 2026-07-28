# Applied Mathematics: Change, Fields, and Transforms — Course Spine

The authoritative **content spine** for the applied-mathematics course: the
modules, the lessons, the *central insight* each lesson must deliver, the
dependency order, the declared entry assumptions, and the recurring
**application threads** that make this one arc rather than a catalogue of famous
topics.

This document answers "what is the whole course, and why in this order?" Its
neighbours:

- [curriculum-architecture.md](curriculum-architecture.md) — the encoding-facing
  formalization: the explicit prerequisite DAG, the concept-ID catalog, the
  reusable visualization families, the implementation packages, and the platform
  gaps. Read it when *encoding* or *scheduling* the sequence.
- [benchmark-matrix.md](benchmark-matrix.md) — the **external calibration** of
  this spine against representative university courses and texts, and what each
  spine node owes each profile.
- [courses/multi-domain-architecture.md](../multi-domain-architecture.md) — the
  platform data model (subjects → courses → units → lessons).
- [authoring/lesson-design.md](../../authoring/lesson-design.md) — how any single
  lesson is composed.
- [courses/linear-algebra/course-spine.md](../linear-algebra/course-spine.md) —
  the sibling course this one **reuses and hands off to**, never duplicates.

> **Scope note (durable).** Every lesson below is a `future` node. Listing them
> does **not** authorize building them. Per `.cursor/rules/project-core.mdc` and
> the [course-authoring workflow](../../authoring/course-authoring-workflow.md),
> lessons are promoted one approved package at a time. This spine exists so that
> when each is built it lands in a coherent whole.

---

## 0. Declared course target (Gate 1)

- **Primary core profile: P2 — demanding applied.** The learner should be able
  to set up and carry out multi-step applied problems, choose a method without
  being told which applies, interpret results physically, and use software for
  the large instances — calibrated to [ext-18.03] and [ext-6.003] in the
  [benchmark matrix](benchmark-matrix.md).
- **Research-bridge overlay: enabled**, as clearly-labelled enrichment only —
  never on the core bar.
- **P3 (proof/honors) module overrides: none at launch.** The natural future
  candidate is `fields-circulation` (a real proof of Green's theorem on simple
  regions). Declaring it now would commit the course to a proof program it does
  not yet have the earlier scaffolding for.

> **This is a target, not a claim of attainment.** Nothing in this course is
> built yet. Gate 10 validation will report the real distance.

---

## 1. The design principle behind the spine

The course has **one load-bearing idea, told four times**:

> **The Fundamental Theorem of Calculus — that accumulating a rate and
> measuring a rate are inverse operations — is the same theorem as Green's
> theorem, and the same move as the Fourier and Laplace transforms.**

- **1-D:** \(\int_a^b f' = f(b) - f(a)\). Interior contributions telescope; only
  the boundary survives.
- **2-D:** Green's theorem. Total the local circulation over a region and the
  interior cancels; only the boundary loop survives. *Same telescoping, one
  dimension up.*
- **Transforms:** differentiation becomes multiplication. A transform re-expresses
  a function in a basis where the hard operation (calculus) is the easy one
  (algebra) — which is exactly what the FTC bought in one dimension, bought
  again by a change of coordinates.

Every module is introduced as a **re-interpretation of something the learner
already holds**, never as a fresh definition to memorize. The acceptance bar for
any lesson here: *state its central insight as a re-reading of a prior lesson.*

The second organizing principle is **linear algebra is already known**. This
course does not re-teach vectors, span, bases, matrices as maps, composition, or
eigenvectors. It **hands off** to the built linear-algebra course and then uses
those ideas at full strength: a derivative is a 1×1 linear map, the chain rule
is composition of linear maps, a Fourier coefficient is a projection onto a
basis vector, and \(e^{st}\) is an eigenfunction of \(d/dt\).

---

## 2. Entry assumptions, diagnostics, and bridges

**The single largest risk to this course is prerequisite recursion** — "you need
trigonometry, which needs geometry, which needs…". The discipline is:

1. **Declare** what is assumed.
2. **Diagnose** it, so a learner knows where they stand.
3. **Bridge** only the assumptions whose absence genuinely blocks a later lesson,
   and bridge them *short*.

### 2.1 Declared entry assumptions (assumed, not taught)

| Assumed | Concretely |
| --- | --- |
| Algebra fluency | Rearranging equations, exponent and logarithm rules, quadratic formula, factoring. |
| Functions and graphs | \(f(x)\) notation, domain/range, composition, reading and sketching a graph, shifts and scalings. |
| Trigonometry, as ratios | \(\sin,\cos,\tan\) exist and relate sides of a right triangle; the Pythagorean identity. |
| **Linear algebra, through eigenvectors** | Vectors and combinations, span and basis, a matrix as a map fixed by where the basis lands, composition, the dot product, eigenvectors. **Supplied by this platform's built linear-algebra course** — a hard cross-course prerequisite, not an assumption about the learner's background. |

### 2.2 Entry diagnostic

A short diagnostic set (Mode D artifact, module `entry-bridges`) with three
independently-reported strands. Each strand routes:

| Strand | If passed | If not |
| --- | --- | --- |
| Algebra & functions | Skip `functions-graphs-bridge` | Take it |
| Radians & sinusoids | Skip `radians-rotation` | Take it |
| Linear algebra | Enter directly | Route to the linear-algebra course (`vectors`, `transformations`, `eigenvectors`) |

The diagnostic reports *per strand*, never a single score: a learner who is
fluent in algebra but has only ever seen degrees needs one bridge, not a
remedial course.

### 2.3 The two bridges (and why only two)

- **`functions-graphs-bridge` — conditional.** Function notation, composition,
  graph transformations, exponentials and logarithms as inverse shapes. Only
  surfaced when the diagnostic flags it.
- **`radians-rotation` — required unless diagnosed out.** *Not* remedial
  trigonometry. Its insight is a genuine reframe the course depends on and most
  learners have never been given: **an angle is an arc length, and \(\sin\) and
  \(\cos\) are the coordinates of a point going around a circle at constant
  speed** — not ratios in a triangle. Every periodic object in this course
  (phasor, complex exponential, Fourier basis vector, oscillating circuit) is
  that point's shadow. A learner who still sees sine as "opposite over
  hypotenuse" cannot read a phasor diagram.

**Explicitly *not* bridged**, and why: geometry proofs, conic sections,
polynomial long division, matrix arithmetic drills, set theory, induction,
limits-as-epsilon-delta-proof. None of them block a lesson below; each would
start a recursion.

---

## 3. Module structure

| # | Module id | Title | Lessons | Role |
| --- | --- | --- | --- | --- |
| M0 | `entry-bridges` | Getting on the road | 2 | Declared entry, diagnostic, two bridges |
| M1 | `change` | Change | 4 | **Shared foundation** — the derivative |
| M2 | `accumulation` | Accumulation | 4 | **Shared foundation** — the integral and the FTC |
| M3 | `complex-oscillation` | Complex numbers and oscillation | 3 | The language every transform is written in |
| M4 | `projection-spectra` | Projection and spectra | 4 | Orthogonality → Fourier series → Fourier transform |
| M5 | `signals` | Signals: convolution, filtering, sampling | 2 | What the transform is *for* |
| M6 | `dynamics-transforms` | Dynamics and transforms | 4 | ODEs → Laplace → transfer functions |
| M7 | `fields-circulation` | Fields and circulation | 7 | Multivariable → Green's → generalizations |

M1 and M2 are the **trunk**: every later module depends on them. M3–M5, M6, and
M7 are three **branches** off that trunk, described in [§6](#6-the-three-branches).

---

## 4. The spine at a glance

`Status`: all `future`. `Path` marks membership of the **shortest honest path to
the Fourier transform** ([§5](#5-the-shortest-honest-path-to-the-fourier-transform)).

| Spine | Lesson | Central insight (the "not memorize X, but Y") | Path | Curriculum id |
| --- | --- | --- | --- | --- |
| B0 | Functions, graphs, and the shapes you keep meeting | *(conditional bridge)* A function is a machine; its graph is the machine's whole behaviour drawn at once, and shifting/scaling the graph is doing arithmetic on the machine. | — | `functions-graphs-bridge` |
| B1 | Radians and the rotating point | An angle is an **arc length**, and \(\sin,\cos\) are the **coordinates of a point circling at constant speed** — not triangle ratios. | ● | `radians-rotation` |
| L1 | What "approaches" means | A limit is not "substitute the value"; it is a **promise about how close you can be forced to stay**. Continuity is the promise that nothing hides between your samples. | ● | `limits-continuity` |
| L2 | The derivative as local linearity | Zoom far enough into a smooth curve and it **is** a straight line. The derivative is that line's slope — and "rate of change", "slope of the tangent", and "best linear approximation" are one object, not three. | ● | `derivative-local-linearity` |
| L3 | The chain rule: rates compose | Composing functions composes their local linear models, so rates **multiply**. This is matrix composition (LA L6) in one dimension. | — | `chain-rule` |
| L4 | Deciding with the derivative: optimization and approximation | The derivative converts "find the best" into "find where the local linear model is flat", and "hard function" into "easy polynomial, near here". | — | `optimization-approximation` |
| L5 | The integral as accumulation | An integral is **the total of a rate**, and "area under the curve" is what totalling a rate looks like. The Riemann sum is the definition; the area is the picture. | ● | `integral-accumulation` |
| L6 | The Fundamental Theorem of Calculus | Measuring a rate and accumulating a rate are **inverse processes**. Interior contributions **telescope**; only the endpoints survive. That single sentence is the rest of this course. | ● | `fundamental-theorem` |
| L7 | Two techniques, both derived | Substitution is the chain rule read backwards; parts is the product rule read backwards. Two rules, not a zoo. | — | `substitution-parts` |
| L8 | Accumulating forever: improper integrals | An integral over an infinite interval is a **limit of finite accumulations**; whether it converges is a question about **decay rate**. This is the lesson that licenses every transform integral in the course. | ● | `improper-integrals` |
| L9 | Complex numbers as rotation and scaling | Multiplying by a complex number is **rotate and scale** — the same 2×2 map from LA L2. \(i\) is not imaginary; it is a quarter turn. | ● | `complex-rotation` |
| L10 | Euler's formula: the exponential that turns | \(e^{i\theta}\) is what an exponential does when its **growth rate is a quarter turn from its position**: it turns instead of growing. \(\cos\) and \(\sin\) are its shadows, so trigonometric identities become exponent rules. | ● | `eulers-formula` |
| L11 | Waves: frequency, phase, and the complex sinusoid | Amplitude and phase are **one complex number**. A wave is a phasor spinning; adding waves of one frequency is adding vectors. | ● | `waves-phasors` |
| L12 | Inner products and projection | The dot product's real job is **"how much of one thing is another"**, and every property that matters survives when the vectors become functions and the sum becomes an integral. The closest point in a subspace is the one whose **error is orthogonal** to it. | ● | `inner-products-projection` |
| L13 | Orthogonal families: sinusoids as perpendicular axes | Distinct sinusoids are **orthogonal over a period**, so they behave like perpendicular axes: each coordinate is read off **independently**, one integral each, with no simultaneous system to solve. | ● | `orthogonal-families` |
| L14 | Fourier series: a periodic function's coordinates | A Fourier coefficient is a **projection**, not a formula. The series is the function written in the sinusoid basis, and convergence is convergence **in energy**. | ● | `fourier-series` |
| L15 | The Fourier transform: when the period goes to infinity | Let the period grow and the discrete comb of coefficients becomes a **continuous spectrum**. Same projection; the sum becomes an integral. | ● | `fourier-transform` |
| L16 | Convolution and filtering | Multiplying spectra **is** smearing in time. A filter is one operation seen from two sides, and a linear time-invariant system is fully described by what it does to one impulse. | — | `convolution-filtering` |
| L17 | Sampling, aliasing, the DFT and the FFT | Sampling in time **replicates** the spectrum; aliasing is those copies overlapping. The DFT is the finite computable version, and the FFT is the same computation with the shared sub-work done once — the Karatsuba move. | — | `sampling-dft-fft` |
| L18 | First-order equations: rate proportional to state | A differential equation says how a system changes **given where it is**. Exponential growth is not a formula to memorize; it is the unique answer to "the rate is proportional to the amount". | — | `first-order-odes` |
| L19 | Second-order equations: oscillation, damping, resonance | Guessing \(e^{st}\) turns a differential equation into a **polynomial**. Exponentials are the **eigenfunctions of \(d/dt\)** — LA L11's idea, in function space. | — | `second-order-odes` |
| L20 | The Laplace transform: calculus becomes algebra | The same projection move as Fourier, with a kernel \(e^{-st}\) that **tames growth and keeps the initial conditions**. Differentiation becomes multiplication by \(s\). | — | `laplace-transform` |
| L21 | Transfer functions, impulse response, convolution | A linear time-invariant system is completely described by its response to **one impulse**; everything else is convolution — which in the transform domain is multiplication. | — | `transfer-impulse-response` |
| L22 | Partial derivatives and the gradient | With more than one input there is no single "the" rate — it depends on direction. The gradient collects them all and points **uphill**; it is the row of the best linear map (LA L2's columns rule, transposed). | — | `partial-derivatives-gradient` |
| L23 | Accumulating over a region | The same accumulation, iterated. The **order** of accumulation is a choice, and choosing well is most of the technique. | — | `multivariable-integration` |
| L24 | Vector fields, paths, and line integrals | A field assigns a vector to every point. A line integral totals a field **along a path** — work done, or flow along. | — | `vector-fields-line-integrals` |
| L25 | Circulation and flux | Two different questions about the same field at the same boundary: how much goes **around**, and how much goes **through**. | — | `circulation-flux` |
| L26 | Divergence and curl: the local versions | Shrink the loop and shrink the box. Circulation per unit area is **curl**; flux per unit area is **divergence**. They are local densities of the global quantities, not new inventions. | — | `divergence-curl` |
| L27 | Green's theorem | **The Fundamental Theorem of Calculus, one dimension up.** Total the local curl over a region and every interior edge is traversed twice in opposite directions and cancels; only the boundary loop survives. The same telescoping as L6. | — | `greens-theorem` |
| L28 | Stokes and the divergence theorem | One theorem in three costumes. "The boundary of a boundary is empty" is the whole story, and conservation laws are what it says in physics. | — | `stokes-divergence` |

---

## 5. The shortest honest path to the Fourier transform

**13 lessons**, or 12 for a learner who is diagnosed out of the radians bridge:

```
radians-rotation
  → limits-continuity
  → derivative-local-linearity
  → integral-accumulation
  → fundamental-theorem
  → improper-integrals
  → complex-rotation
  → eulers-formula
  → waves-phasors
  → inner-products-projection
  → orthogonal-families
  → fourier-series
  → fourier-transform
```

Plus the **cross-course prerequisite** `vectors` (linear algebra, already built),
which supplies span, basis, coordinates and the dot product.

### 5.1 Why each is genuinely required

| Lesson | Without it, what breaks |
| --- | --- |
| `radians-rotation` | \(e^{i\omega t}\) is uninterpretable; the learner cannot read a phasor or a spectrum's phase. |
| `limits-continuity` | Neither the derivative nor the integral can be defined honestly; both become rituals. |
| `derivative-local-linearity` | The FTC has nothing to be the inverse *of*. |
| `integral-accumulation` | The transform **is** an integral. |
| `fundamental-theorem` | Transform properties (and every hand computation) rest on it. |
| `improper-integrals` | The Fourier integral runs over \((-\infty,\infty)\); without this it is unlicensed notation. |
| `complex-rotation` | The kernel is a complex number; "rotate and scale" is what it does. |
| `eulers-formula` | \(e^{i\omega t}\) is the kernel. |
| `waves-phasors` | The transform's **output** is complex; magnitude and phase are unreadable without it. |
| `inner-products-projection` | A Fourier coefficient **is** a projection; otherwise it is a memorized integral. |
| `orthogonal-families` | Orthogonality is the single fact that makes the coefficients separable. |
| `fourier-series` | The transform is its limit. |
| `fourier-transform` | The destination. |

### 5.2 What is deliberately *off* the path

Naming these is as important as naming the path — each is a place a
conventional syllabus would expand and this course does not:

| Off-path | Why it is not required for the transform |
| --- | --- |
| `chain-rule`, `substitution-parts` | Needed for transform *properties* and for ODEs — not to define, compute, or interpret the transform itself. They are on the **dynamics** branch. |
| `optimization-approximation` | Applications of the derivative; no Fourier object depends on them. |
| **Sequences and series as a module** | The only convergence the course needs is **convergence in energy** of an orthogonal expansion, which `fourier-series` owns via Parseval. A full sequences-and-series module would add ~4 lessons and unlock nothing on this path. This is the single biggest scope saving in the course. |
| **Multivariable calculus** | Entirely on the fields branch. The 1-D transform needs none of it. |
| **Complex analysis** (contour integration, residues) | Would make the *inverse* Laplace transform slicker. The course inverts by table and partial fractions instead, and says so. |
| `convolution-filtering`, `sampling-dft-fft` | Downstream *of* the transform, not prerequisites of it. |

---

## 6. The three branches

All three hang off the **same trunk** (M1 Change + M2 Accumulation). That shared
dependency is the course's structural claim: Green's theorem and the Laplace
transform are not two unrelated subjects that happen to sit in one book — they
are two things the same derivative-and-integral pair lets you do.

```
                    ┌──────────────── M3 Complex ── M4 Projection & spectra ── M5 Signals
                    │                                 (Fourier series → transform)
M0 ── M1 Change ── M2 Accumulation
      (derivative)  (integral, FTC)
                    │                └─ M6 Dynamics & transforms
                    │                    (ODEs → Laplace → transfer functions)
                    └──────────────── M7 Fields & circulation
                                        (partials → line integrals → Green's)
```

### 6.1 The transform branch (M3 → M4 → M5)

Needs from the trunk: the integral, the FTC, and improper integrals. Adds the
complex language, then orthogonality, then Fourier. **This is the priority
branch** — it reaches a genuinely useful learner destination fastest.

### 6.2 The dynamics branch (M6)

Needs from the trunk: the derivative (an ODE is a statement about a derivative),
the chain rule and integration by parts (solution techniques and the Laplace
derivative rule), and improper integrals (the Laplace integral).

**It is placed after M5 on purpose.** Once a learner has met the Fourier
transform as "re-express the function in a basis where calculus becomes
algebra", Laplace is *the same move* with a kernel chosen to handle growth and
initial conditions — one insight, not a second machine. Convolution and impulse
response are already in hand from `convolution-filtering`, so
`transfer-impulse-response` reuses rather than introduces them.

M6 also closes a loop with the built linear-algebra course:
`second-order-odes` shows that \(e^{st}\) are the **eigenfunctions of \(d/dt\)**,
which is `eigenvectors` (LA L11) in an infinite-dimensional space.

### 6.3 The fields branch (M7)

Needs from the trunk: the derivative (partials are derivatives with the other
variables held), the integral (a line integral is an accumulation along a path),
and above all the **FTC**, which it generalizes.

It needs **nothing** from M3–M6, so it may be taken at any point after M2. It is
placed last in the canonical order because it is the **capstone**: it is where
the course's one load-bearing idea is finally stated in full generality, and it
is the most satisfying place to end because the learner has by then seen the
same telescoping argument pay off three times.

---

## 7. Application threads

Applications here are **explanatory anchors**, not anecdotes: each one recurs,
and each recurrence is the same physical system seen with more mathematics. An
application earns its place only if removing it would make a lesson harder to
understand.

| Thread | Where it recurs | What it explains |
| --- | --- | --- |
| **Motion** | L2, L5, L6, L18 | Position/velocity/acceleration is the cleanest place to see that differentiating and accumulating undo each other — the learner already knows a speedometer and an odometer disagree about nothing. |
| **Circuits** | L11, L18, L19, L20, L21 | RC decay is the canonical first-order equation; RLC is the canonical second-order one; impedance is why complex numbers are worth the trouble; the transfer function is the engineering object the whole of M6 builds toward. |
| **Audio** | B1, L11, L14, L15, L16, L17 | Timbre is a spectrum; an equaliser is a filter; a sample rate is a sampling theorem. Audio is the thread that makes "the frequency domain" concrete rather than notational. |
| **Heat and diffusion** | L5, L14, L23, L26 | The original reason Fourier series exist; also the cleanest place to see divergence as "what is accumulating here". |
| **Growth and decay** | L4, L10, L18 | Populations, cooling, compound interest — the exponential arrives as an *answer*, not a definition. |
| **Optimization** | L4, L22 | Where the derivative earns its keep before any transform appears. |
| **Images and compression** | L16, L17 | Blur as convolution; JPEG as "most coefficients are small". The payoff application for the spectrum idea. |
| **Fluid flow, circulation, conservation** | L24, L25, L26, L27, L28 | Circulation and flux are questions people actually ask about water and air; conservation laws are what the divergence theorem says out loud. |
| **Control systems** | L20, L21 | Why anyone wants poles, stability, and a transfer function. |

---

## 8. What this course reuses instead of rebuilding

| Reused | From | How |
| --- | --- | --- |
| Vectors, span, basis, coordinates, dot product | LA `vectors` (built) | Hard cross-course prerequisite. `inner-products-projection` **generalizes** the dot product rather than introducing it. |
| A matrix as a map; the columns rule | LA `transformations` (built) | `complex-rotation` presents complex multiplication as one of those maps; `partial-derivatives-gradient` presents the Jacobian as one. |
| Composition of maps | LA `matrix-composition` (built) | `chain-rule` **is** this, in one dimension. |
| Eigenvectors and diagonalization | LA `eigenvectors` (built) | `second-order-odes` reads \(e^{st}\) as an eigenfunction of \(d/dt\); `fourier-transform` reads the sinusoid basis as the eigenbasis of shift-invariant systems. |
| Determinant as collapse | LA `determinants` (built) | The Jacobian determinant in `multivariable-integration` is the same area-scale factor. |
| Divide-and-conquer, "do the shared sub-work once" | Algorithms `karatsuba` (built) | `sampling-dft-fft` names the FFT as the same move, an explicit cross-subject edge. |
| Projection and least squares (finite-dimensional depth) | LA `orthogonality`, `least-squares` (**future**) | `inner-products-projection` takes the **minimum** it needs and pushes straight to function space. When the LA lessons ship, this one references them; it does not pre-empt them. |

**Non-duplication rule.** If an idea has a home in the linear-algebra spine, this
course links to it and uses it. The only linear algebra this course *owns* is
what happens when the vectors become **functions** — because no finite-dimensional
lesson can carry that.

---

## 9. Indispensable vs optional

Separating these is what keeps the course finishable.

**Indispensable (26 lessons).** Every lesson in [§4](#4-the-spine-at-a-glance)
except the conditional bridge `functions-graphs-bridge` and the generalization
lesson `stokes-divergence`, which is the natural first thing to cut if the
fields branch must ship shorter.

**Optional enrichment (not on the spine; recorded so it is not silently
smuggled in).**

| Enrichment | Where it would attach | Why it is optional |
| --- | --- | --- |
| Taylor series and convergence radius | after L4 | L4 needs only the first two terms; the full series is a different subject. |
| Sequences and series proper | after L4 | See [§5.2](#52-what-is-deliberately-off-the-path). |
| Trigonometric substitution, partial-fraction catalogue | after L7 | Only the partial fractions Laplace inversion actually needs are in scope, and they live in L20. |
| Numerical integration and quadrature | after L5 | A computing topic; the accumulation idea is complete without it. |
| Poles, stability, Bode plots | after L21 | The natural sequel; a control course, not this one. |
| Lagrange multipliers, multivariable optimization | after L22 | Real, useful, and off every path in this course. |
| Windowing, spectral leakage, the STFT | after L17 | Practitioner material. |
| Complex analysis: contours and residues | after L20 | Would make inverse Laplace slicker; the course inverts by table instead and says so. |
| Partial differential equations (heat, wave) | after L14 | The historically true motivation for Fourier series, and a whole course of its own. |

---

## 10. Per-module notes

### M0 — Getting on the road

Two bridges and a diagnostic. The design obligation is that **a prepared learner
sees neither bridge** and starts at L1. Bridges must be short and must not
become a remedial course; if a bridge grows past a single insight, the right
response is to tighten the entry assumption, not to lengthen the bridge.

### M1 — Change

The derivative introduced as **local linearity** rather than as a limit of
difference quotients that happens to be useful. The limit (L1) is the honest
machinery; the zoom (L2) is the meaning. L3 makes it compositional and L4 makes
it decisive. `optimization-approximation` is where the derivative first *earns*
something, and it is deliberately placed before any integral so that the
learner has had a payoff before the second half of calculus starts.

### M2 — Accumulation

The order is chosen against the usual one. Accumulation (L5) is introduced as
*the total of a rate*, from a velocity trace, before any antiderivative
technique — so that the FTC (L6) is a **surprise with a reason**, not a
definition. L7 exists only to derive the two techniques the rest of the course
uses. L8 is the quiet keystone: without improper integrals every transform in
M4–M6 is unlicensed notation.

### M3 — Complex numbers and oscillation

Complex numbers are introduced **geometrically first** (L9), as a linear map the
learner already met, so that Euler's formula (L10) can be derived from a
differential-equation-shaped question — "what function's rate of change is a
quarter turn from its position?" — rather than asserted from a power series the
course has not built. L11 converts that into the working object of the rest of
the course: the phasor.

### M4 — Projection and spectra

The conceptual heart. L12 and L13 make "coefficient = projection" available
*before* any Fourier formula appears, so that L14's coefficient integrals are
recognisable rather than novel. L15 is a limit argument the learner can follow
because L8 licensed it.

### M5 — Signals

What the spectrum is for. L16 is a flagship: convolution is the course's hardest
single mechanic and its highest-value one. L17 closes the loop to computation and
to the algorithms course.

### M6 — Dynamics and transforms

Placed after M5 so Laplace is a variation on a known move. L19 is the
linear-algebra reunion. L21 is the engineering payoff and reuses L16's
convolution wholesale.

### M7 — Fields and circulation

The capstone. L22–L26 build the vocabulary; L27 is the flagship, and its
animation is the telescoping-cancellation argument that makes Green's theorem
feel inevitable rather than remembered. L28 states the generalization and stops
— the course does not attempt differential forms.

---

## 11. Open questions recorded, not resolved here

- **Whether `stokes-divergence` ships at all** depends on whether 3-D
  visualization infrastructure exists by then — see the platform-gap register in
  [curriculum-architecture §7](curriculum-architecture.md#7-platform-gaps-recorded-not-scheduled).
- **Whether the fields branch takes a P3 override** should be decided when the
  branch is scheduled, not now.
- **Whether `functions-graphs-bridge` needs to exist** is a question the
  diagnostic will answer with data; it is on the spine as conditional so that
  building it is a choice, not a default.
