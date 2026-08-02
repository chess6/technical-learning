# Applied Mathematics — Benchmark Matrix

The **external calibration** for the applied-mathematics course: it instantiates
the three [course profiles](../../authoring/mastery-standard.md#3-course-profiles)
for this subject against representative university courses and standard texts.

This is the course's calibration quarantine, as
[linear-algebra/benchmark-matrix.md](../linear-algebra/benchmark-matrix.md) is
linear algebra's: the subject-agnostic standards stay unchanged, and the
applied-mathematics particulars live here.

> **A calibration target, not a claim.** **Four lessons of thirty-nine are
> built** — `limits-continuity`, `derivative-local-linearity`,
> `integral-accumulation`, and `fundamental-theorem`: all of `calculus-foundations`
> (Package A, approved). Every other "current coverage" cell reads *none
> (planned)*. What the matrix fixes is **how deep** each module must go before it
> can be called done, and a module's lessons being built does not by itself move
> its bar — that needs the module's own Gate 9 assessment, which for
> `calculus-foundations` is built in code (13 items, merged to `master`) but
> not yet administered (§3).

---

## 0. Sources

External calibration cites **topic coverage, course structure, and pedagogical
style** only — never reproduced problem sets or substantial copyrighted text.
Repository-derived conclusions are marked **[repo]**; external evidence **[ext]**.

Each source records its **edition or course version** and an **official link**.
OCW republishes courses under new semester slugs from time to time; a link that
404s should be resolved from the OCW course-number search rather than treated as
invalidating the row.

| Ref | Source (edition / version) | Official link | Role in calibration |
| --- | --- | --- | --- |
| **[ext-18.01SC]** | MIT **18.01SC** *Single Variable Calculus*, **Fall 2010** (OCW Scholar — complete lecture videos, problem sets, exams). Limits and continuity, differentiation and applications, integration, the FTC, techniques, improper integrals, series. | https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/ | **P1** baseline for M1–M3: the standard first-course topic set and computational bar. |
| **[ext-18.02SC]** | MIT **18.02SC** *Multivariable Calculus*, **Fall 2010** (OCW Scholar). Partial derivatives, multiple integrals, change of variables, vector fields, line and surface integrals, Green's, Stokes', divergence theorem. | https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/ | **P1/P2** for M9–M11: scope and ordering of the fields branch. |
| **[ext-18.03SC]** | MIT **18.03SC** *Differential Equations*, **Fall 2011** (OCW Scholar). First- and second-order linear ODEs, complex exponentials, resonance, Fourier series, the Laplace transform, convolution, impulse response, systems. | https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/ | **The closest single external analogue for this course's shape.** P2 topic set for M4, M5 (series), M7–M8. |
| **[ext-6.003]** | MIT **6.003** *Signals and Systems*, **Fall 2011** (OCW). LTI systems, convolution, CT and DT Fourier series and transforms, Laplace and z-transforms, sampling, feedback and control. | https://ocw.mit.edu/courses/6-003-signals-and-systems-fall-2011/ | **P2** for M6 and M8: the systems framing, and the bar for convolution, transfer functions, sampling, and stability. |
| **[ext-RES6-007]** | MIT **RES.6-007** *Signals and Systems*, **Spring 2011** (OCW; Oppenheim's recorded lecture series accompanying [ext-OW]). | https://ocw.mit.edu/courses/res-6-007-signals-and-systems-spring-2011/ | **P2** corroboration for M6; the canonical presentation order for convolution → Fourier → sampling. |
| **[ext-18.085]** | MIT **18.085** *Computational Science and Engineering I*, **Fall 2008** (OCW; Strang). Applied linear algebra with differential equations, Fourier analysis, and the FFT treated as one subject. | https://ocw.mit.edu/courses/18-085-computational-science-and-engineering-i-fall-2008/ | **P2** corroboration for this course's **two structural themes** (§4) and for reusing linear algebra rather than re-teaching it. |
| **[ext-Stewart]** | Stewart, Clegg & Watson, *Calculus: Early Transcendentals*, **9th ed.**, Cengage, 2020. | https://www.cengage.com/c/calculus-early-transcendentals-9e-stewart/9781337613927/ | **P1** topic coverage and problem style for M1–M3 and M9–M11. |
| **[ext-BDM]** | Boyce, DiPrima & Meade, *Elementary Differential Equations and Boundary Value Problems*, **11th ed.**, Wiley, 2017. | https://www.wiley.com/en-us/Elementary+Differential+Equations+and+Boundary+Value+Problems%2C+11th+Edition-p-9781119256007 | **P1/P2** for M7–M8, and the precedent for **table-and-partial-fractions** Laplace inversion, which this course also adopts. |
| **[ext-OW]** | Oppenheim, Willsky & Nawab, *Signals and Systems*, **2nd ed.**, Prentice Hall, 1996. | https://www.pearson.com/en-us/subject-catalog/p/signals-and-systems/P200000003360 | **P2** for M6: the canonical convolution / Fourier / sampling treatment. |
| **[ext-OS]** | Oppenheim & Schafer, *Discrete-Time Signal Processing*, **3rd ed.**, Pearson, 2009. | https://www.pearson.com/en-us/subject-catalog/p/discrete-time-signal-processing/P200000003226 | **P2** for the DFT/FFT bar in M6, including cost awareness. |
| **[ext-3b1b]** | 3Blue1Brown, *Essence of Calculus* (video series, 2017–). | https://www.3blue1brown.com/topics/calculus | **Pedagogical style only** — the local-linearity and accumulation framings, and the standard of visual honesty this repository already benchmarks against. **Not a coverage source.** |

### Source-to-claim mapping

| Source | Backs these claims |
| --- | --- |
| [ext-18.01SC] | §2 M1–M3 bars; P1 computational expectations; that sequences and series belong in the single-variable core. |
| [ext-18.02SC] | §2 M9–M11 bars; the Green's → Stokes' → divergence ordering; change of variables as its own topic. |
| [ext-18.03SC] | §2 M4, M7, M8 bars; that complex exponentials, resonance, Fourier series, Laplace and convolution **coexist in one sophomore course** — the precedent for this spine's shape. |
| [ext-6.003] | §2 M6 and M8 bars; the LTI/impulse-response framing; the sampling and stability bars. |
| [ext-RES6-007] | §2 M6 corroboration; presentation order. |
| [ext-18.085] | §1 "cumulative integration" row; §4's two-theme architecture; the reuse-linear-algebra decision. |
| [ext-Stewart] | §1 P1 rows; §2 M1–M3 and M9–M11 problem-complexity bars. |
| [ext-BDM] | §2 M7–M8 bars; §3's declared table-based inversion deviation. |
| [ext-OW] | §2 M6 bars, especially convolution and the sampling theorem. |
| [ext-OS] | §2 M6 DFT/FFT bar and cost awareness. |
| [ext-3b1b] | §1 "conceptual expectations" row only. |

> **Scale honesty.** [ext-18.01SC] + [ext-18.02SC] + [ext-18.03SC] + [ext-6.003]
> is roughly four semester courses. This course's 38 indispensable lessons do not
> claim to replace all four. It is a **connected route** that carries their
> load-bearing content at P2 depth, with the deviations in §3 declared rather
> than hidden. **[repo]**

---

## 1. The three profiles for this subject

| Dimension | **P1 — Standard computational** | **P2 — Demanding applied** *(declared target)* | **P3 — Proof-based / honors** |
| --- | --- | --- | --- |
| **Intended learners** | STEM students meeting calculus as a required tool. | Engineering / CS / physics students who will *use* transforms and fields. | Mathematics students building analysis maturity. |
| **Prerequisite expectations** | Algebra, functions, trigonometry. | The above **plus linear algebra** and some programming. | The above plus proof fluency. |
| **Topic coverage** | Limits, derivatives, integrals, FTC, techniques, sequences and series, multivariable calculus, basic ODEs. [ext-18.01SC][ext-Stewart] | All of P1 **plus** complex exponentials, orthogonality and Fourier series and transforms, convolution, LTI systems, sampling and the FFT, Laplace transforms and control, and vector calculus through the divergence theorem. [ext-18.03SC][ext-6.003][ext-18.02SC] | Rigorous limits and uniform convergence, existence/uniqueness for ODEs, completeness of \(L^2\), Plancherel, measure-theoretic caveats, proofs of the boundary theorems on general regions. |
| **Computational expectations** | Correct hand computation. | Hand computation **plus** method selection and **software for large instances**; transform tables used fluently; FFT-vs-DFT cost awareness. [ext-OS] | Computation in service of argument. |
| **Conceptual expectations** | Geometric intuition for slope and area. | What a spectrum *means*, what a pole does, what circulation measures; moving between time and frequency at will. [ext-3b1b] for framing | Why an orthonormal family is complete; exactly which convergence is being claimed. |
| **Theorem & proof expectations** | Statements used; short justifications. | Derivations and "why the method works"; the FTC and Green's theorem **derived**, not asserted; occasional short proof. | Full proofs, both directions, counterexamples. |
| **Typical assessment styles** | Problem sets + midterms + final, mostly computational. | Closed-book timed exams with substantial multi-step problems, plus software work. [ext-18.03SC][ext-6.003] | Proof-heavy problem sets. |
| **Expected problem complexity** | Single-topic, clean numbers, one method. | Multi-step, mixed-topic, physically posed; **the learner chooses which domain to work in**. | Abstract, general, minimal hypotheses. |
| **Speed requirements** | Moderate. | High: timed exams on substantial problems. | Lower on speed, higher on rigor. |
| **Software** | Optional. | **Assumed** for spectra, numerical solutions, and large transforms. | Minimal. |
| **Cumulative integration** | Fairly modular. | **Very strong** — two structural themes, each restated three or four times. [ext-18.085] | Very strong. |

**Declared target:** P2 primary + research-bridge overlay, no P3 module override
at launch ([course-spine §0](course-spine.md#0-declared-course-target-gate-1)).

---

## 2. Per-module depth bars

**P2 is the bar this course is built to**; P1 is what could be cut under
pressure; P3 is recorded so a later override knows what it would sign up for.

| Module | P1 bar | **P2 bar (target)** | P3 bar (not targeted) | Current |
| --- | --- | --- | --- | --- |
| **M0 `entry-bridges`** | Radians and the unit circle usable. | Same, plus reading a phasor diagram cold. | — | none (planned) |
| **M1 `calculus-foundations`** | Riemann sums; the FTC applied. [ext-18.01SC] | Limits as a **local tolerance guarantee**, with a modulus of continuity as the quantitative control; local linearity as the *meaning* of the derivative; the FTC **derived by telescoping**. | \(\varepsilon\)–\(\delta\); uniform continuity proved on a compact interval; integrability theory. | **4 of 4 lessons built** (Package A, approved): the tolerance guarantee, the modulus, local linearity, accumulation, and the FTC's telescoping derivation are all delivered. The module bar is not yet **certified** — that needs Gate 9's own assessment, which is [built in code](modules/calculus-foundations/assessment-plan.md) (13 items) but not yet administered. |
| **M2 `calculus-technique`** | Substitution, parts, standard improper integrals. [ext-Stewart] | Techniques **derived** from the chain and product rules; parts recognised as Theme 1's boundary term; improper convergence judged by decay rate. | Comparison and limit-comparison proved; conditional convergence. | none (planned) |
| **M3 `series`** | Convergence tests applied; Taylor polynomials computed. [ext-18.01SC] | Series as the limit of partial sums; absolute vs conditional convergence and why rearrangement is unsafe; radius of convergence as a property of the coefficients. | Uniform convergence; term-by-term differentiation justified; Weierstrass M-test. | none (planned) |
| **M4 `complex-oscillation`** | \(a+bi\) arithmetic; Euler's formula stated. | Complex multiplication as rotate-and-scale; Euler **derived** (twice — from the ODE and from the series); phasor arithmetic used to add sinusoids and read impedance. [ext-18.03SC] | Complex differentiability; the exponential defined rigorously. | none (planned) |
| **M5 `projection-spectra`** | Fourier coefficient formulas applied to standard waves. [ext-BDM] | Coefficients as **projections**, with orthogonality verified; Parseval as energy; **mean-square vs pointwise convergence distinguished**, with Gibbs as the witness; the transform derived as the period-to-infinity limit, with Plancherel **stated** and the "orthonormal basis" language explicitly qualified. | \(L^2\) completeness proved; Carleson-type pointwise results named; the density argument behind Plancherel. | none (planned) |
| **M6 `signals`** | Convolution computed on simple signals. | The convolution theorem used **both directions**; filters designed in the frequency domain; the sampling theorem stated with its aliasing consequence; DFT/FFT cost understood. [ext-OW][ext-OS][ext-6.003] | Distributions; the sampling theorem proved; \(L^1\) vs \(L^2\) transform theory. | none (planned) |
| **M7 `differential-equations`** | Solve separable and constant-coefficient linear ODEs; use a Laplace table. [ext-BDM] | Characteristic roots read as behaviour; **Laplace derived from integration by parts, with the boundary term carrying the initial conditions**; the region of convergence named; the Fourier comparison drawn **without** claiming orthogonality. | Existence and uniqueness; Wronskians; series solutions. | none (planned) |
| **M8 `response-control`** | Invert simple transforms; compute a transfer function. | Partial-fraction inversion fluent; impulse response and transfer function recognised as one object seen two ways; **poles located and read as stability**; feedback's effect on pole location. [ext-6.003] | Bromwich inversion; Nyquist and root-locus theory. | none (planned) |
| **M9 `many-variables`** | Partials, double and triple integrals, polar/cylindrical/spherical changes. [ext-18.02SC] | The gradient as the linear map of the zoom; order of integration chosen deliberately; **the Jacobian determinant recognised as the linear-algebra determinant doing its usual job**. | Inverse and implicit function theorems; Fubini's hypotheses. | none (planned) |
| **M10 `fields`** | Line integrals computed; divergence and curl computed. | **Circulation and flux distinguished at sight**; curl and divergence as *densities* obtained by shrinking a loop and a box. | Conservative-field equivalences proved; exactness and potentials. | none (planned) |
| **M11 `boundary-theorems`** | Green's, Stokes', and the divergence theorem applied. [ext-18.02SC] | All three **derived by the same cancellation argument as the FTC**; surface integrals computed on a parameterized surface; the divergence theorem read as a conservation law. | Proof on general regions; orientation and differential forms; the generalized Stokes theorem. | none (planned) |

---

## 3. Course-level gap summary

**Coverage: five lessons on `master`.**
`limits-continuity`, `derivative-local-linearity`, `integral-accumulation`,
and `fundamental-theorem` (all of `calculus-foundations`, Package A,
approved) are built and each passes Gate 8 on its lesson-owned outcomes.
`chain-rule` (L5, `calculus-technique`) is fully built, merged to `master`, and
**Gate-8-accepted by the repository owner on 2026-08-01**. L6
`optimization-approximation` is **planned but not built** (Mode B complete);
its plan flags that **the M2 bar in §2 does not mention optimization or
linearization at all**, so L6 has no depth bar to be validated against here —
an open Mode A question for the owner, recorded rather than silently patched.
Every other lesson is `future`, and **no module bar in §2 is formally
certified** — a module's bar is judged on its whole set via its own Gate 9
assessment. Gate 9 for `calculus-foundations` is
[built in code](modules/calculus-foundations/assessment-plan.md) (13 items,
merged to `master`), a separate later step from the four lessons' Gate 8
passes, but not yet administered.

**Highest-risk P2 bars** — the ones most likely to be quietly missed:

1. **The FTC derived, not asserted** (M1). Theme 1 rests on the telescoping
   argument being *shown*. If it ships as a stated rule, the three boundary
   theorems have nothing to be generalizations of.
2. **Coefficients as projections** (M5). If Fourier coefficients arrive as
   formulas, the course has failed its own design principle.
3. **Convergence claims kept straight** (M5). Mean-square is not pointwise;
   Gibbs is the witness, and \(L^2(\mathbb{R})\) is not an orthonormal expansion.
4. **Laplace introduced on its own terms** (M7). It must not inherit Fourier's
   projection language.
5. **Convolution in both directions** (M6).
6. **Circulation vs flux told apart** (M10).

**Declared deviations from the benchmarks**, stated rather than hidden:

| Deviation | Benchmarks including it | Justification |
| --- | --- | --- |
| No contour integration for inverse Laplace | some P2 treatments | Inversion by table and partial fractions, as in [ext-BDM]. Stated openly in `inverse-laplace`. |
| No z-transform or discrete-time systems beyond the DFT | [ext-6.003], [ext-OS] | A signals course of its own; `dft-fft` stops at the discrete transform. |
| No PDEs (heat, wave, Laplace's equation) | [ext-18.03SC], [ext-BDM] | The historical motivation for Fourier series and a full course of its own; recorded as enrichment. |
| No differential forms / generalized Stokes | [ext-18.02SC] honours tracks | The statement Theme 1 reaches for; needs machinery this course does not build. Named at the end of `divergence-theorem`. |
| No Lagrange multipliers / constrained optimization | [ext-18.02SC], [ext-Stewart] | Off every path here. |
| Linear algebra not re-taught | all | Supplied by this platform's built linear-algebra course as a hard prerequisite. **[repo]** |
| Compressed relative to four semester courses | all | See the scale-honesty note in §0. **[repo]** |

---

## 4. The architectural claim, and its external support

This course asserts **two** structural themes rather than one topic list
([spine §1](course-spine.md#1-the-two-structural-themes)):

1. **Local accumulation and boundary effects** — the FTC, Green's, Stokes', and
   the divergence theorem are one cancellation argument at four dimensions of
   generality. This is the standard organizing view of a multivariable course
   [ext-18.02SC], and the repository's contribution is to make it **visible**:
   the `telescoping-cancellation` family built for the FTC is re-run for all three
   later theorems, so the learner *watches* the same cancellation rather than
   being told the theorems are analogous.
2. **Representation change and operator simplification** — Fourier and Laplace
   both re-express a function along exponentials so that differentiation becomes
   multiplication. That transforms and linear algebra are one applied subject is
   the organizing view of [ext-18.085]; that they coexist in one sophomore course
   is demonstrated by [ext-18.03SC].

**The two themes are not one theme.** An earlier draft of this course claimed a
single unification and described the Laplace transform as an orthogonal
projection "in the same sense" as Fourier analysis. That was wrong and is
withdrawn: only Fourier series on a bounded interval is literally an orthogonal
projection; the Fourier transform's projection language survives as a limit that
Plancherel re-justifies; and the Laplace transform has no orthogonality at all —
its kernel family is not orthogonal under any inner product the course uses, its
domain is a region of convergence, and its inversion is a contour integral. What
Laplace shares with Fourier is the *operator* virtue, plus one thing Fourier does
not have: initial conditions carried into the algebra by the boundary term.
