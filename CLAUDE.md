# CLAUDE.md

Claude Code only auto-loads `CLAUDE.md`. This repo's standing instructions live in
`AGENTS.md` and the `alwaysApply` Cursor rules, so this file exists to **load them**
— it deliberately restates nothing. Edit the imported files, not this one.

@AGENTS.md
@.cursor/rules/project-core.mdc
@.cursor/rules/course-authoring.mdc
@.cursor/rules/lesson-design.mdc
@.cursor/rules/math-visualization-correctness.mdc
@.cursor/rules/auto-commit.mdc

## Reading the docs tree

The imports above are the routing layer; the documents they point to are large
(`docs/quality/lesson-correctness-checklist.md` alone is ~1600 lines). Open the
section you need — grep for the heading, then read that range — rather than
loading a whole standard to answer one question.

Task-scoped rules under `.cursor/rules/` are **not** imported (they are `globs`-scoped,
not `alwaysApply`). Read the matching one when you touch its area:
`explorations.mdc` (`src/explorations/`), `guided-scenes.mdc` (`src/guided-scenes/`,
`GuidedScenePlayer`), `linear-transforms.mdc` (`src/math/`, explorers, guided scenes).

## Session continuation

Before planning or editing, read `docs/engineering/HANDOFF.md` when it shows active work.
Then reconcile it against `git status`, the current plan, the package ledger, and relevant test output.
If they disagree, actual repository state and test output win.

Do not duplicate package status in the handoff. Link to the ledger and plan instead.
Keep handoffs concise and replace them when the active work changes.
