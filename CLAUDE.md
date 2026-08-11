# Claude Code entry point

@AGENTS.md

`AGENTS.md` is the persistent router. Follow its links only for the current task;
do not preload the handoff, workflow, vision, or full standards. For bounded work,
start with `npm run context:task -- --mode <A|B|C|D> --lesson <id>` and open a
full source only when the context pack exposes an ambiguity.
