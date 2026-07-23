# Linear Algebra — Visual Learning POC

Desktop-first browser POC for learning linear algebra (and select algorithms)
through guided Motion Canvas animations and interactive Mafs diagrams. Intuition
before notation, guided explanation then learner-controlled exploration,
deterministic and mathematically correct.

## Setup & commands

Convenience scripts (preferred):

```bash
./setup.sh          # npm install + Playwright Chromium
./start.sh          # background Vite at http://127.0.0.1:5173
./stop.sh           # stop that server
./status.sh         # is it running?
./check.sh          # lint + typecheck + unit tests
./check.sh --e2e    # same + Playwright
./build.sh          # production build → dist/
./preview.sh        # serve dist locally
```

Equivalent npm commands:

```bash
npm install
npm run dev            # foreground; http://localhost:5173
npm run build          # typecheck + production build
npm run lint           # oxlint
npm run test           # Vitest unit tests
npm run test:e2e       # Playwright (browsers: npx playwright install chromium)
```

## Architecture (in brief)

Layered, with strict boundaries: **pure math** (`src/math/`, the only source of
truth for linear algebra — no React/Mafs/Motion Canvas, no `mathjs` in production)
→ **shared examples** (by id) → **guided scenes** (`src/guided-scenes/`, Motion
Canvas behind `GuidedSceneEngine`) and **explorations** (`src/explorations/`, Mafs)
→ **lessons** (`src/lessons/`, typed and registry-driven) → **lesson UI**
(`src/components/lesson/`). Guided and interactive views share the same example ids
and math utilities; both libraries are lazy-loaded so the home page stays light.

Full layer map, contracts, and decisions:
[docs/engineering/architecture.md](docs/engineering/architecture.md).

## Lessons

Built lessons, in registry order (the sidebar numbers built lessons positionally;
the authoritative L1–L14 spine lives in
[docs/courses/linear-algebra/course-spine.md](docs/courses/linear-algebra/course-spine.md)):

- Chapter 0. Why Linear Algebra? — `/lesson/why-linear-algebra`
- 1. Vectors, Linear Combinations, and Basis — `/lesson/vectors`
- 2. Matrices as Linear Transformations — `/lesson/transformations`
- 3. Linear Systems: Two Pictures of One Equation — `/lesson/systems`
- 4. Elimination — `/lesson/elimination`
- 5. Solution Sets & Homogeneous Systems — `/lesson/solution-sets`
- 6. Determinants as Signed Area Scaling — `/lesson/determinants`
- 7. Eigenvectors and Eigenvalues — `/lesson/eigenvectors`
- Karatsuba: three multiplications instead of four — `/lesson/karatsuba`

`mathjs` is a **dev-only** dependency (cross-check tests); no production module
imports it.

## Documentation

Start with the doc map: **[docs/README.md](docs/README.md)** — what to read for
each task, and where each kind of document belongs. Agents should also read the
root router **[AGENTS.md](AGENTS.md)**.

Key entry points:

- **Build a lesson:** [docs/authoring/lesson-design.md](docs/authoring/lesson-design.md)
  (orchestrator); route any course/lesson request through
  [docs/authoring/course-authoring-workflow.md](docs/authoring/course-authoring-workflow.md).
- **Visual system:** [docs/product/visual-language.md](docs/product/visual-language.md)
  (visual direction; code owns token values). The light-first page refinement is
  kept as historical reference in
  [docs/archive/milestones/visual-design-refinement.md](docs/archive/milestones/visual-design-refinement.md).
- **Math & visualization correctness:**
  [docs/engineering/math-correctness.md](docs/engineering/math-correctness.md) +
  [docs/quality/known-failure-modes.md](docs/quality/known-failure-modes.md);
  sign off with
  [docs/quality/lesson-correctness-checklist.md](docs/quality/lesson-correctness-checklist.md).
- **History:** milestone write-ups and experiments live under
  [docs/archive/](docs/archive/).

Notation: standard basis \(\mathbf{e}_1, \mathbf{e}_2\); bold vectors
\(\mathbf{v}, \mathbf{w}\); matrix \(A\). Keep basic accessibility (labels, focus,
readouts, reduced-motion autoplay); full disability-product work is out of scope.
