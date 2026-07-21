# Approved Insight Contract — Karatsuba Multiplication

Stage 2 of the [Insight Discovery Gate](../INSIGHT_DISCOVERY_GATE.md). Selects one
primary breakthrough from the Stage 1 brief
([insight-brief-karatsuba.md](../insight-brief-karatsuba.md)) and verifies its
complete mathematical and pedagogical chain, then runs the mathematical audit.

Primary insight selected: **C1** — the elementary place-value breakthrough. The
polynomial evaluation/interpolation view is recorded as the *deeper connection*;
tensor rank as an *expert bridge*.

---

## Primary insight (required contents 1–11)

### 1. Initial mental model
Multiplying two split numbers needs all four FOIL products, because expanding
$(10A+B)(10C+D)$ produces four pieces.

### 2. Tension / redundancy
The product has only three place-value levels ($100$, $10$, $1$), yet FOIL
produces four pieces. Two of them appear to be doing one level's worth of work.

### 3. Structural reveal
The two cross products $AD$ and $BC$ occupy the **same** place-value level ($10$),
so the result depends on them only through the sum $AD+BC$ — never on the two
values separately.

### 4. Full causal chain (no missing steps)

Concrete two-digit case, base $B=10$:

$$(10A+B)(10C+D) = 100\,AC + 10\,AD + 10\,BC + BD = 100\,AC + 10(AD+BC) + BD.$$

- **Four FOIL/area regions.** FOIL creates four subrectangles $AC$, $AD$, $BC$,
  $BD$ (subrectangles, not squares — the side lengths differ in general).
- **Place-value weights.** They carry weights $100$, $10$, $10$, and $1$
  respectively.
- **Why $AD$ and $BC$ may be combined.** $AD$ and $BC$ share the weight $10$, so
  the product depends on them only through $AD+BC$; how the sum splits is
  invisible to the result.
- **How the whole rectangle recovers the combined region.** The whole coefficient
  rectangle is $(A+B)(C+D) = AC + AD + BC + BD$. Subtract the two known
  subrectangles to isolate the combined middle region:

  $$z_2 = AC, \qquad z_0 = BD, \qquad z_1 = (A+B)(C+D) - z_2 - z_0 = AD+BC.$$

- **How $100z_2 + 10z_1 + z_0$ reconstructs the product.** Reassembling with the
  original weights:

  $$\text{result} = 100\,z_2 + 10\,z_1 + z_0 = 100\,AC + 10(AD+BC) + BD = (10A+B)(10C+D).$$

- **How three products change the exponent.** The three products are $AC$, $BD$,
  and $(A+B)(C+D)$; the middle level costs only additions/subtractions. Applied
  recursively to half-size numbers, each multiplication spawns three (not four)
  half-size multiplications, so $T(n)=3T(n/2)+\Theta(n)$ and the exponent moves
  from $\log_2 4 = 2$ to $\log_2 3 \approx 1.585$.

### 5. Minimal formal derivation
General split $x=aB^{m}+b$, $y=cB^{m}+d$:

$$xy = ac\,B^{2m} + (ad+bc)\,B^{m} + bd = z_2 B^{2m} + z_1 B^{m} + z_0,$$
$$z_2 = ac,\quad z_0 = bd,\quad z_1 = (a+b)(c+d) - z_2 - z_0 = ad+bc.$$

Three multiplications ($ac$, $bd$, $(a+b)(c+d)$); the rest is addition.

### 6. Equivalence to the original object
By direct expansion, $z_2 B^{2m}+z_1 B^{m}+z_0$ equals $xy$ as an integer, because
$z_1=(a+b)(c+d)-ac-bd=ad+bc$ is an algebraic identity. The $z_i$ may each exceed a
single $m$-digit block; a final **carrying** pass normalizes $z_2 B^{2m}+z_1
B^{m}+z_0$ into digits. Carrying is a separate, purely additive step and does not
alter the value or the multiplication count.

### 7. Cost change (stated precisely)
- **Sufficiency:** the explicit three-product construction above *computes* the
  full result, so three half-size multiplications suffice. This is a construction,
  not merely a redundancy argument.
- **Why the exponent moves:** the saving recurs, so the recursion tree has
  branching factor 3, giving $\Theta(n^{\log_2 3})$ instead of $\Theta(n^2)$.
- **Not claimed here:** that three is a *lower bound*. Optimality (three cannot be
  reduced to two) is the bilinear-rank argument, recorded as an expert bridge
  below — not part of the elementary chain.

### 8. Visual / interactive discovery mechanism
A rectangle of width $A+B$ and height $C+D$, partitioned into the four
subrectangles $AC$, $AD$, $BC$, $BD$. The learner shades the whole rectangle, then
"peels off" the $AC$ and $BD$ subrectangles; the remaining L-shape is exactly the
combined region $AD+BC$. A second control tags each subrectangle with its
place-value weight so the shared weight of $AD$ and $BC$ is visible.

### 9. What the learner can predict afterward
- The middle level is one product plus two subtractions, so a three-product scheme
  computes the whole result.
- Recursively, three-way branching gives $n^{\log_2 3}$, not $n^2$.
- Overflow in $(A+B)$ or $(C+D)$ is handled by carrying, not by extra
  multiplications.

### 10. Transfer assessment
- **Inclusion–exclusion / area reconstruction** — exact structural transfer
  ("measure the whole, subtract known parts").
- **Branching-factor → exponent** (brief C5) — exact; the smallest example of
  exponent-reducing divide-and-conquer.
- **Polynomial evaluation/interpolation** (brief C2) — deeper connection;
  *architectural* transfer to Toom-Cook and FFT multiplication (same
  evaluate → pointwise multiply → interpolate phases; FFT uses roots of unity and
  the FFT itself, and is not literally "$k \to n$").
- **Bilinear rank / Strassen** (brief C6) — expert bridge; supplies optimality.

### 11. Prerequisites, limitations, likely misconceptions
- **Prerequisites:** FOIL/distributive law; base-10 place value; for the cost
  claim, a basic recursion tree.
- **Limitations:** the elementary chain proves sufficiency and the exponent, not
  optimality; base and carrying handled explicitly; asymptotic advantage only
  above a base-case cutoff (brief C7).
- **Likely misconceptions:**
  - "All four products are needed." (Corrected by the shared-weight reveal.)
  - "Saving one of four is a 25% speedup." (It is an exponent change; brief C5.)
  - "$AC$ and $BD$ are squares." (They are subrectangles; sides differ.)
  - "Three coefficients force three multiplications." (Sufficiency comes from the
    construction; the lower bound is the separate rank argument.)
  - "The $z_i$ are digits." (They can overflow a block; carrying normalizes them.)

---

## Mathematical audit

| Check | Result |
| --- | --- |
| 1. Conclusion follows from derivation | PASS — every step in §4 is derived; the identity $z_1=(a+b)(c+d)-ac-bd$ is explicit. |
| 2. Sufficiency vs lower bound | PASS — §7 proves sufficiency by construction and explicitly defers the lower bound to the expert rank bridge. |
| 3. Structure-preserving language | PASS — regions are "subrectangles," not "squares"; place-value weights stated. |
| 4. Hidden carrying/normalization | PASS — carrying is called out as a separate additive step in §6. |
| 5. Nature of broader connections | PASS — Toom-Cook/FFT labeled architectural; FFT not described as literal $k\to n$. |
| 6. Notation level | PASS — tensor rank, ∞-node, Vandermonde kept as expert/deeper material, excluded from the elementary chain. |

Expert bridge (optimality, out of the elementary chain): multiplying two linear
polynomials is a bilinear map whose structure tensor has rank exactly 3; Karatsuba
realizes the rank and two is impossible. This is the same move Strassen makes for
$2\times2$ matrices ($8\to7$, exponent $\log_2 7\approx2.807$).

---

## Gate result

`Gate result: PASS`

**Exact primary insight (a later lesson plan must preserve this verbatim):**

> Ordinary split multiplication computes four subrectangles, but the two cross
> products $AD$ and $BC$ are required only through their sum $AD+BC$ because they
> occupy the same place-value level. Computing the whole rectangle $(A+B)(C+D)$ and
> subtracting the two known subrectangles $AC$ and $BD$ recovers that sum, so three
> products — $AC$, $BD$, and $(A+B)(C+D)$ — reconstruct
> $100\,AC + 10(AD+BC) + BD$. Doing this recursively replaces four half-size
> products with three and changes the exponent from $\log_2 4$ to $\log_2 3$.
