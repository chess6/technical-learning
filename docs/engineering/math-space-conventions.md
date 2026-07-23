# Mathematical-space conventions

Part of the platform contracts (see `docs/engineering/platform-contracts.md`). This contract
standardizes **how we name and separate the spaces a visualization lives in**,
so a learner is never left guessing whether two pictures share a frame. It
governs mathematical truthfulness and clarity — not layout, animation, or lesson
composition.

## The named spaces (semantic roles)

Descriptors live in `src/explorations/spaces.ts` and are **advisory / opt-in**:
an explorer may import one to single-source a visible label, but nothing forces a
particular component structure.

| Role | Typical label | What a point/line means |
| --- | --- | --- |
| `input` | Input space | where a pre-image vector lives before a map |
| `coefficient` | Coefficient space (x, y) | where the unknowns live; each equation is a line |
| `output` | Output space | where the target **b** lives; columns combine to reach it |
| `transformed` | Transformed space | the image of the grid/vectors after applying a map |
| `coordinate-relative` | Coordinates in a basis | the same vector read against a chosen basis |
| `graph-of-constraints` | Constraint graph | feasible region carved out by inequalities/equations |

## Labels are semantic roles, not vector-space identity

**Distinct labels do not always imply distinct underlying vector spaces.** In the
linear-systems lesson, "Coefficient space (x, y)" and "Output space" are *both*
\(\mathbb{R}^2\). The two labels distinguish the **role** each plane plays — where
the unknowns live versus where the target **b** lives — which is precisely the
point of showing the row and column pictures together. The convention exists for
learner clarity; it makes no claim that the spaces are equal or unequal as vector
spaces. Conversely, one underlying space may legitimately carry different role
labels in different panels.

## The separation rule (replaces "fade-out-before-fade-in")

When a visualization shows two **semantically distinct** spaces, it must do one
of the following:

1. **Separate frames** — render each space in its own panel/figure with its own
   visible label (a labeled **split-screen comparison is explicitly allowed**, and
   is the systems lesson's chosen presentation); or
2. **Explicitly mapped frame** — show a stated transformation carrying one space
   into the other (e.g. "apply \(A\)"), so the mapping is visible rather than
   implied.

What the rule forbids is silently drawing two different roles in one frame as if
they shared it. It does **not** mandate any particular animation, transition, or
layout — a paused establishing frame, a split screen, or an animated map are all
fine as long as the roles are labeled and not conflated.

## Roles use shared design tokens

Color/emphasis come from the semantic `--role-*` tokens in
`src/styles/tokens.css` (e.g. `--role-original`, `--role-transformed`), never raw
hex. A space's label names the role; the token colors it.

## Integration proof (systems lesson)

`src/explorations/SystemsExplorer.tsx` puts the two spaces side by side with the
space name as the **primary, visible caption**:

- **Coefficient space (x, y)** — row picture: each equation is a line; a solution
  is a point on both.
- **Output space** — column picture: blend col₁, col₂ to reach **b**.

These captions are single-sourced from `COEFFICIENT_SPACE` / `OUTPUT_SPACE` in
`src/explorations/spaces.ts`, unit-tested in
`src/explorations/__tests__/spaces.test.ts`, and asserted on the rendered lesson
page by `e2e/lesson-systems.spec.ts`.
