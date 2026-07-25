# Interactive Textbook — visual learning POC

Desktop-first browser POC for learning mathematics and algorithms through guided
Motion Canvas animations and interactive Mafs diagrams. Intuition before
notation, guided explanation then learner-controlled exploration, deterministic
and mathematically correct.

The platform holds **courses**, not one subject: today Linear Algebra and
Algorithmic Thinking. The app-level brand is deliberately neutral
([src/platform/product.ts](src/platform/product.ts)); a course's own title and
subtitle are rendered contextually wherever a course frame is on screen.

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

## Courses and lessons

The curriculum tree ([src/lessons/courseModel.ts](src/lessons/courseModel.ts))
holds `subject → course → unit → lesson refs`; the registry
([src/lessons/registry.ts](src/lessons/registry.ts)) owns lesson *content* and
nothing else. **Numbering, progress, and Prev/Next are course-relative**, so a
course's last lesson does not link on to a different subject. Routes stay
`/lesson/:lessonId`; the active course is derived from lesson membership.

**Linear Algebra** — *Visual Learning* (authoritative L1–L14 spine:
[docs/courses/linear-algebra/course-spine.md](docs/courses/linear-algebra/course-spine.md)):

- Chapter 0. Why Linear Algebra? — `/lesson/why-linear-algebra`
- 1. Vectors, Linear Combinations, and Basis — `/lesson/vectors`
- 2. Matrices as Linear Transformations — `/lesson/transformations`
- 3. Linear Systems: Two Pictures of One Equation — `/lesson/systems`
- 4. Elimination — `/lesson/elimination`
- 5. Solution Sets & Homogeneous Systems — `/lesson/solution-sets`
- 6. Determinants as Signed Area Scaling — `/lesson/determinants`
- 7. Eigenvectors and Eigenvalues — `/lesson/eigenvectors`

**Algorithmic Thinking** — *Divide, conquer, analyze*:

- 1. Karatsuba: three multiplications instead of four — `/lesson/karatsuba`

Not-yet-built spine positions are `future` nodes in the same tree and render as
dimmed entries in their course's sidebar.

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
- **How a page reads:** [docs/product/semantic-page-grammar.md](docs/product/semantic-page-grammar.md)
  is authoritative for anything learner-visible. Block kinds (`motivate`,
  `watch`, `check`, `explore`, `summary`, …) are **internal**: they drive the
  route, `data-block-kind`, styling variants, and accessible region descriptions,
  and are never rendered as headings or table-of-contents rows. A block has no
  visible heading unless the lesson authors a content-specific one
  (`RouteBlock.heading` / `.tocLabel`).
- **Visual system:** the identity is the **live interactive notebook**, shipped in
  two *presentations* of that one identity, chosen from the app header and
  remembered locally:
  - **Notebook** (default) — a warm-ivory reading surface with deep-navy ink,
    restrained warm dividers, and **dark mathematical canvases** that read as
    illustrations set into a textbook page. The strong page↔canvas contrast is
    deliberate.
  - **Observatory** (optional) — an ink reading surface *continuous* with the
    canvas, so the page becomes the same sky the mathematics is drawn on.

  Both share one set of semantic **math roles** (`--role-*`), spacing,
  typography, and component contracts; only surfaces, ink, accents, and
  atmosphere are theme-scoped, via a `data-theme` attribute on the document root
  (applied before first paint by a small inline script in `index.html`). The OS
  dark-mode preference is deliberately **not** consulted — Observatory is an
  explicit choice. Code owns the values:
  [src/styles/tokens.css](src/styles/tokens.css) (its header states the
  direction) and [src/platform/theme.ts](src/platform/theme.ts), enforced by
  [src/styles/\_\_tests\_\_/designSystem.test.ts](src/styles/__tests__/designSystem.test.ts)
  (both themes complete and symmetric, no undefined tokens, no raw hex outside
  the token file, the same WCAG floors, role meanings identical) and
  [e2e/visual-identity.spec.ts](e2e/visual-identity.spec.ts) (the same claims
  measured in a browser, plus switching, persistence, keyboard access, and no
  horizontal overflow). Per-primitive visual direction for algorithm lessons:
  [docs/product/visual-language.md](docs/product/visual-language.md). The
  original light-first page refinement that Notebook descends from is kept as
  historical reference in
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
