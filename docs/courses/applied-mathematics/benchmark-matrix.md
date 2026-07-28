# Applied Mathematics — Benchmark Matrix

The **external calibration** for the applied-mathematics course: it instantiates
the three [course profiles](../../authoring/mastery-standard.md#3-course-profiles)
for *this* subject, against representative university courses and standard texts.

It is this course's calibration quarantine, exactly as
[linear-algebra/benchmark-matrix.md](../linear-algebra/benchmark-matrix.md) is
linear algebra's: the mastery standard, lesson contract, and page grammar stay
subject-agnostic, and the applied-mathematics particulars live here.

> **This is a calibration target, not a claim.** Nothing in this course is built.
> Every "current coverage" cell reads *none (planned)*; the value of the matrix
> right now is that it fixes **how deep** each spine node must go before it can
> be called done.

---

## 0. Sources, and how they are used

External calibration cites **topic coverage, course structure, and pedagogical
style** only — never reproduced problem sets or substantial copyrighted text.
Repository-derived conclusions are marked **[repo]**; external evidence **[ext]**.

> **Verification note.** Course numbers, titles, and topic coverage below are
> stated from established, long-stable curricula. **Specific OCW semester slugs
> should be re-verified before this matrix is cited in a Gate 10 validation
> record** — they change as OCW re-publishes. Nothing in §1–§3 depends on a
> particular semester's page.

| Ref | Source | Role in calibration |
| --- | --- | --- |
| **[ext-18.01]** | MIT **18.01** *Single Variable Calculus* (OCW). Limits, differentiation, applications, integration, the FTC, techniques, improper integrals, series. | **P1** baseline for M1–M2: the standard first-course topic set and computational bar. |
| **[ext-18.02]** | MIT **18.02** *Multivariable Calculus* (OCW). Partial derivatives, multiple integrals, vector fields, line and surface integrals, Green's, Stokes', divergence theorem. | **P1/P2** for M7: the standard scope and ordering of the fields branch. |
| **[ext-18.03]** | MIT **18.03** *Differential Equations* (OCW). First- and second-order linear ODEs, complex exponentials, resonance, Fourier series, Laplace transform, convolution, impulse response. | **The single closest external analogue for this whole course.** P2 topic set for M3, M4 (series), M6. |
| **[ext-6.003]** | MIT **6.003** *Signals and Systems* (OCW). LTI systems, convolution, CT/DT Fourier series and transforms, Laplace and z-transforms, sampling, feedback. | **P2** for M5–M6: the systems framing, and the bar for convolution, transfer functions, and sampling. |
| **[ext-Stewart]** | Stewart, *Calculus: Early Transcendentals* — the dominant service-course text. | **P1** topic coverage and problem style for M1–M2, M7. |
| **[ext-BD]** | Boyce & DiPrima, *Elementary Differential Equations and Boundary Value Problems*. | **P1/P2** for M6, and the standard treatment of Laplace and Fourier series in an ODE course. |
| **[ext-OW]** | Oppenheim & Willsky, *Signals and Systems*, 2nd ed. | **P2** for M5: the canonical convolution / Fourier / sampling treatment. |
| **[ext-Strang-CS]** | Strang, *Computational Science and Engineering* / *Calculus*. Applied framing tying linear algebra, calculus, and transforms into one applied-mathematics arc. | **P2** corroboration for the course's central architectural claim (the FTC generalizes; transforms diagonalize). |
| **[ext-3b1b]** | 3Blue1Brown, *Essence of Calculus*. | **Pedagogical style only** — the local-linearity and accumulation framings, and the standard of visual honesty this repository already benchmarks against. Not a coverage source. |

### Source-to-claim mapping

| Source | Backs |
| --- | --- |
| [ext-18.01] | §2 M1/M2 bars; the P1 computational expectations; the judgement that a full series module is standard-but-optional. |
| [ext-18.02] | §2 M7 bars; the Green's → Stokes/divergence ordering. |
| [ext-18.03] | §2 M3/M6 bars; that complex exponentials, resonance, Laplace, convolution and Fourier series **coexist in one sophomore course** — the precedent for this spine's shape. |
| [ext-6.003] | §2 M5 bars; the LTI/impulse-response framing and the sampling bar. |
| [ext-Stewart] | §1 P1 rows; §2 M1/M2/M7 problem-complexity bars. |
| [ext-BD] | §2 M6 bars; the table-based Laplace inversion this course also adopts. |
| [ext-OW] | §2 M5 bars, especially convolution and the sampling theorem. |
| [ext-Strang-CS] | §1 "cumulative integration" row; §4's architectural claim. |
| [ext-3b1b] | §1 "conceptual expectations" row only. |

---

## 1. The three profiles for this subject

| Dimension | **P1 — Standard computational** | **P2 — Demanding applied** *(declared target)* | **P3 — Proof-based / honors** |
| --- | --- | --- | --- |
| **Intended learners** | STEM students meeting calculus as a required tool. | Engineering / CS / physics students who will *use* transforms and fields. | Mathematics students building analysis maturity. |
| **Prerequisite expectations** | Algebra, functions, trigonometry. | The above **plus linear algebra** and some programming. | The above plus proof fluency. |
| **Topic coverage** | Limits, derivatives, integrals, FTC, techniques, multivariable calculus, basic ODEs. [ext-18.01][ext-Stewart] | All of P1 **plus** complex exponentials, Fourier series and transforms, Laplace, convolution, LTI systems, sampling, vector calculus through Green's/Stokes/divergence. [ext-18.03][ext-6.003] | Rigorous limits, uniform vs pointwise convergence, existence/uniqueness for ODEs, \(L^2\) completeness, measure-theoretic caveats. |
| **Computational expectations** | Correct hand computation: derivatives, standard integrals, simple ODEs. | Hand computation **plus** method selection and **software for large instances**; transform tables used fluently; awareness of cost (FFT vs DFT). | Computation in service of argument. |
| **Conceptual expectations** | Geometric intuition for slope and area. | Operational intuition: what a spectrum *means*, what a pole does, what circulation measures; ability to move between time and frequency at will. [ext-3b1b] for framing | Structural: why an orthonormal basis is complete; what convergence is being claimed. |
| **Theorem & proof expectations** | Statements used; short justifications. | Derivations and "why the method works"; the FTC and Green's theorem **derived**, not asserted; occasional short proof. | Full proofs, both directions, counterexamples. |
| **Typical assessment styles** | Problem sets + midterms + final, mostly computational. | Closed-book timed exams with substantial multi-step problems, plus software work. [ext-18.03][ext-6.003] | Proof-heavy problem sets. |
| **Expected problem complexity** | Single-topic, clean numbers, one method. | Multi-step, mixed-topic, physically posed; the learner chooses the domain to work in. | Abstract, general, minimal hypotheses. |
| **Speed requirements** | Moderate. | High: timed exams on substantial problems. | Lower on speed, higher on rigor. |
| **Software** | Optional. | **Assumed** for spectra, numerical solutions, and large transforms. | Minimal. |
| **Cumulative integration** | Topics fairly modular. | **Very strong** — the whole course is one theorem restated. [ext-Strang-CS] | Very strong. |

**Declared target:** P2 primary + research-bridge overlay, no P3 module override
at launch ([course-spine §0](course-spine.md#0-declared-course-target-gate-1)).

---

## 2. Per-module depth bars

What each module owes each profile. **P2 is the bar this course is built to**;
P1 is what may be cut under pressure; P3 is recorded so a later override knows
what it would be signing up for.

| Module | P1 bar | **P2 bar (target)** | P3 bar (not targeted) | Current coverage |
| --- | --- | --- | --- | --- |
| **M0 Entry & bridges** | Radians and the unit circle usable. | Same, plus reading a phasor diagram cold. | — | none (planned) |
| **M1 Change** | Compute derivatives of standard functions; interpret slope. [ext-18.01] | Local linearity as the *definition of meaning*; linearization with an error sense; chain rule as composition of linear maps. | \(\varepsilon\)–\(\delta\); differentiability vs continuity counterexamples. | none (planned) |
| **M2 Accumulation** | Riemann sums; FTC applied; substitution and parts. [ext-Stewart] | FTC **derived** via telescoping; improper convergence judged by decay rate; techniques derived from the chain and product rules. | Integrability, uniform continuity, the mean value theorem for integrals proved. | none (planned) |
| **M3 Complex & oscillation** | \(a+bi\) arithmetic; Euler's formula stated. | Complex multiplication as rotation+scale; Euler **derived**; phasor arithmetic used to add sinusoids and read impedance. [ext-18.03] | Complex differentiability; the exponential defined by its series or ODE, rigorously. | none (planned) |
| **M4 Projection & spectra** | Fourier coefficient formulas applied to standard waves. [ext-BD] | Coefficients as **projections**; orthogonality verified; Parseval as energy; the transform derived as the period-to-infinity limit. | \(L^2\) completeness; pointwise vs uniform vs mean-square convergence; Gibbs analysed. | none (planned) |
| **M5 Signals** | Convolution computed on simple signals. | Convolution theorem used **both directions**; filters designed in the frequency domain; sampling theorem stated with its aliasing consequence; DFT/FFT cost understood. [ext-OW][ext-6.003] | Distributions; the sampling theorem proved; \(L^1\) vs \(L^2\) transform theory. | none (planned) |
| **M6 Dynamics & transforms** | Solve separable and constant-coefficient linear ODEs; use a Laplace table. [ext-BD] | Characteristic roots read as behaviour (damping, resonance); Laplace derived and used with initial conditions; transfer function and impulse response as one object seen two ways. [ext-18.03] | Existence/uniqueness; Wronskians; series solutions. | none (planned) |
| **M7 Fields & circulation** | Partials, double integrals, line integrals, Green's theorem applied. [ext-18.02] | Circulation and flux distinguished at sight; curl and divergence as *densities*; Green's theorem **derived** by the same telescoping as the FTC; Stokes and divergence recognised as the same statement. | Proof on general regions; orientation and forms; conservative-field equivalences proved. | none (planned) |

---

## 3. Course-level gap summary

Honest position **before any building**:

- **Coverage:** none. Every module is `future`.
- **Highest-risk P2 bars**, i.e. the ones most likely to be quietly missed:
  1. **FTC derived, not asserted** (M2). The whole architecture rests on the
     telescoping argument being *shown*. If it ships as a stated rule, Green's
     theorem later has nothing to be a generalization of.
  2. **Coefficients as projections** (M4). If Fourier coefficients arrive as
     formulas, the course has failed its own design principle.
  3. **Convolution in both directions** (M5). Recognising that a smear in time is
     a product in frequency is the single hardest and highest-value mechanic.
  4. **Circulation vs flux told apart** (M7). The most common confusion in the
     fields branch, and the reason `ex-rotation-field` and `ex-source-field` are
     both canonical.
- **Known scope deviations from the benchmarks**, declared rather than hidden:

| Deviation | Benchmarks that include it | Justification |
| --- | --- | --- |
| No sequences-and-series module | [ext-18.01], [ext-Stewart] | The only convergence on the course's critical path is mean-square convergence of an orthogonal expansion, owned by `fourier-series`. See [spine §5.2](course-spine.md#52-what-is-deliberately-off-the-path). |
| No contour integration for inverse Laplace | some P2 treatments | Inversion is by table and partial fractions, as in [ext-BD]. Stated openly in `laplace-transform`. |
| No z-transform or discrete-time systems beyond the DFT | [ext-6.003] | A signals course of its own; `sampling-dft-fft` stops at the discrete transform. |
| No PDEs (heat, wave) | [ext-18.03], [ext-BD] | The historical motivation for Fourier series and a full course of its own; recorded as enrichment. |
| No surface integrals in 3-D | [ext-18.02] | Blocked by platform gap G5; `stokes-divergence` states the generalization in 2-D-plus-normal terms and is the declared first cut. |
| Linear algebra not re-taught | all of them | Supplied by this platform's built linear-algebra course as a hard prerequisite. **[repo]** |

---

## 4. The architectural claim, and its external support

This course asserts something stronger than a topic list: **that the FTC,
Green's theorem, and the transform methods are one idea**. That is not an
idiosyncratic framing — it is the organizing view of applied-mathematics texts
that treat calculus, linear algebra, and transforms together [ext-Strang-CS],
and it is the reason [ext-18.03] can carry complex exponentials, resonance,
Fourier series, Laplace transforms, and convolution in a single sophomore
course without the parts feeling unrelated.

What this course adds is that the connection is made **explicit and visual**:
the telescoping animation built for the FTC is *re-run* for Green's theorem
([architecture §5](curriculum-architecture.md#5-reusable-visualization-families)),
so the learner sees the same cancellation twice rather than being told the
theorems are analogous.
