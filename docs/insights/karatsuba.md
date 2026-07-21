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

Concrete two-digit case, base $B=10$. Two related but distinct rectangles appear;
they must be named separately.

- **Original weighted multiplication rectangle** — dimensions $10A+B$ by $10C+D$.
  FOIL splits it into four subrectangles (subrectangles, not squares — side
  lengths differ in general) whose *weighted* areas are $100\,AC$, $10\,AD$,
  $10\,BC$, and $BD$:

  $$(10A+B)(10C+D) = 100\,AC + 10\,AD + 10\,BC + BD = 100\,AC + 10(AD+BC) + BD.$$

- **Why $AD$ and $BC$ may be combined.** In this weighted rectangle $AD$ and $BC$
  share the same place-value weight $10$, so the result depends on them only
  through the sum $AD+BC$; how the sum splits is invisible to the result. (This
  view tells us *what* combined quantity is needed.)
- **Auxiliary coefficient rectangle** — a *separate* rectangle of dimensions
  $A+B$ by $C+D$, whose *unweighted* areas are $AC$, $AD$, $BC$, $BD$:

  $$(A+B)(C+D) = AC + AD + BC + BD.$$

  Subtracting the two known subrectangles isolates the combined middle quantity
  with one extra product (this view tells us *how* to compute it):

  $$z_2 = AC, \qquad z_0 = BD, \qquad z_1 = (A+B)(C+D) - z_2 - z_0 = AD+BC.$$

- **Exact reconstruction.** Reassemble with the original place-value weights:

  $$\text{result} = 100\,z_2 + 10\,z_1 + z_0 = 100\,AC + 10(AD+BC) + BD = (10A+B)(10C+D).$$

- **Recursive consequence.** The three products are $AC$, $BD$, and
  $(A+B)(C+D)$; the middle level costs only additions/subtractions. Applied
  recursively to half-size numbers, each multiplication spawns three (not four)
  half-size multiplications, so $T(n)=3T(n/2)+\Theta(n)$ and the exponent moves
  from $\log_2 4 = 2$ to $\log_2 3 \approx 1.585$.

Core relationship: the **weighted multiplication rectangle** says *what* combined
quantity is needed ($AD+BC$, because those two regions share a place-value level);
the **auxiliary coefficient rectangle** says *how* to compute it with a single
multiplication, $(A+B)(C+D)-AC-BD$.

### 5. Minimal formal derivation
General split $x=aB^{m}+b$, $y=cB^{m}+d$:

$$xy = ac\,B^{2m} + (ad+bc)\,B^{m} + bd = z_2 B^{2m} + z_1 B^{m} + z_0,$$
$$z_2 = ac,\quad z_0 = bd,\quad z_1 = (a+b)(c+d) - z_2 - z_0 = ad+bc.$$

Three multiplications ($ac$, $bd$, $(a+b)(c+d)$); the rest is addition.

### 6. Equivalence to the original object
By direct expansion, $z_2 B^{2m}+z_1 B^{m}+z_0$ equals $xy$ as an integer, because
$z_1=(a+b)(c+d)-ac-bd=ad+bc$ is an algebraic identity. Two distinct size effects
must not be conflated:

- **Output carrying.** The reconstructed coefficients $z_2, z_1, z_0$ may each
  overflow their $m$-digit blocks. A final **carrying** pass normalizes
  $z_2 B^{2m}+z_1 B^{m}+z_0$ into digits. Carrying is a separate, purely additive
  step; it does not alter the value or the multiplication count.
- **Operand-width growth in the sum-product.** If $a,b$ are $m$-digit blocks,
  $a+b$ may have $m+1$ digits, so the recursive product $(a+b)(c+d)$ can be
  slightly wider than $ac$ and $bd$. This is handled by padding, uneven block
  lengths, or recursing on the larger width — **not** by the final carrying pass.
  It does **not** create a fourth recursive multiplication and does not change the
  three-way branching. A more precise recurrence is

  $$T(n) \le 3\,T\!\left(\lceil n/2\rceil + 1\right) + O(n),$$

  which still yields the Karatsuba exponent $\log_2 3$.

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
Two linked views. First the **weighted multiplication rectangle** ($10A+B$ by
$10C+D$) tags each of the four subrectangles with its place-value weight $100$,
$10$, $10$, $1$, making the shared weight of $AD$ and $BC$ visible — the learner
sees *what* combined quantity ($AD+BC$) is needed. Then the **auxiliary
coefficient rectangle** ($A+B$ by $C+D$): the learner shades it whole, "peels off"
the $AC$ and $BD$ subrectangles, and the remaining L-shape is exactly $AD+BC$ —
seeing *how* one extra product supplies it.

### 9. What the learner can predict afterward
- The middle level is one product plus two subtractions, so a three-product scheme
  computes the whole result.
- Recursively, three-way branching gives $n^{\log_2 3}$, not $n^2$.
- Output coefficients $z_i$ that overflow a block are normalized by output
  carrying; the extra width of $(A+B)$ or $(C+D)$ is handled by padding / uneven
  widths (not by carrying), and neither adds a fourth multiplication.

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
  optimality; output carrying and operand-width growth handled explicitly and kept
  distinct; asymptotic advantage only above a base-case cutoff (brief C7).
- **Likely misconceptions:**
  - "All four products are needed." (Corrected by the shared-weight reveal.)
  - "Saving one of four is a 25% speedup." (It is an exponent change; brief C5.)
  - "$AC$ and $BD$ are squares." (They are subrectangles; sides differ.)
  - "Three coefficients force three multiplications." (Sufficiency comes from the
    construction; the lower bound is the separate rank argument.)
  - "The $z_i$ are digits." (They can overflow a block; output carrying normalizes
    them.)
  - "The wider $(a+b)(c+d)$ is fixed by carrying." (No — output carrying
    normalizes the $z_i$; the extra digit in $a+b$ is an *operand-width* effect
    handled by padding / uneven-width recursion, and neither adds a
    multiplication.)

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
realizes the rank. That two is impossible (the rank is not $\le 2$) is an accepted
result in algebraic complexity theory — cited here as an advanced fact, **not**
proved by this contract. This is the same move Strassen makes for $2\times2$
matrices ($8\to7$, exponent $\log_2 7\approx2.807$).

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
| Outstanding concerns | — | None blocking; math/pedagogical reviews are self-performed, so independent human review is still advisable before publishing the lesson. |

---

## Gate result

`Gate result: PASS`

**Exact primary insight (preserved verbatim in the Stage 3 plan's metadata for
traceability; the learner-facing lesson must preserve its mathematical meaning and
causal chain but may use shorter, clearer wording):**

> Ordinary split multiplication computes four subrectangles, but the two cross
> products $AD$ and $BC$ are required only through their sum $AD+BC$ because they
> occupy the same place-value level. Computing the whole rectangle $(A+B)(C+D)$ and
> subtracting the two known subrectangles $AC$ and $BD$ recovers that sum, so three
> products — $AC$, $BD$, and $(A+B)(C+D)$ — reconstruct
> $100\,AC + 10(AD+BC) + BD$. Doing this recursively replaces four half-size
> products with three and changes the exponent from $\log_2 4$ to $\log_2 3$.
