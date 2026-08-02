import type {
  LessonDefinition,
  DepthLayer,
  SolutionReveal,
  StructuredSummary,
  ExerciseDefinition,
  RouteBlock,
} from "../types";

/**
 * Walks every learner-facing PROSE string in a lesson (the strings that may
 * carry inline `$...$` math and `**bold**` / `*italic*` emphasis), yielding
 * `{ path, text }` pairs.
 *
 * This is the **single authoritative collector** for learner-facing prose.
 * Every validator that needs "all the prose" reads it:
 *  - `contentValidation.test.ts` — every `$...$` fragment must render;
 *  - `proseEmphasis.test.ts` — no emphasis marker stranded by a math token, no
 *    `$$`, no unpaired `$`, and no doc-internal artifact vocabulary.
 *
 * It walks RUNTIME lesson objects, not source literals, so a string assembled
 * by concatenation is checked as the learner actually receives it.
 *
 * Deliberately excludes whole-string equation fields (`section.equation`,
 * `WorkedExample.equations`): those are raw TeX, not prose, and neither
 * emphasis nor inline-`$` rules apply. `contentValidation.test.ts` keeps its
 * own separate handling for those.
 *
 * **A field that renders through `ProseWithMath` and is not collected here is
 * unvalidated.** That is not hypothetical: custom-exercise `config` was skipped
 * entirely, which is how `chain-derive-fresh`'s model answer shipped with both
 * a doc-internal citation ("L2 C5") and a mathematically unsafe factorization —
 * neither guard could see it. Adding a new prose-bearing field? Add it here.
 */
export type ProseString = { path: string; text: string };

function push(out: ProseString[], path: string, text: unknown): void {
  if (typeof text === "string" && text.length > 0) out.push({ path, text });
}

function pushLayers(
  layers: DepthLayer[] | undefined,
  path: string,
  out: ProseString[],
): void {
  for (const [i, layer] of (layers ?? []).entries()) {
    push(out, `${path}.layers[${i}].title`, layer.title);
    push(out, `${path}.layers[${i}].body`, layer.body);
  }
}

function pushReveal(
  reveal: SolutionReveal | undefined,
  path: string,
  out: ProseString[],
): void {
  if (!reveal) return;
  push(out, `${path}.prose`, reveal.prose);
  push(out, `${path}.derivation`, reveal.derivation);
  push(out, `${path}.interpretation`, reveal.interpretation);
  push(out, `${path}.connection`, reveal.connection);
}

/** Every `StructuredSummary` field is learner-facing; several accept arrays. */
function pushStructuredSummary(
  summary: StructuredSummary | undefined,
  path: string,
  out: ProseString[],
): void {
  if (!summary) return;
  // Listed explicitly (not Object.entries) so a NEW field is a type error here
  // rather than silently uncollected.
  const fields: (keyof StructuredSummary)[] = [
    "coreMentalModel",
    "definitionsIntroduced",
    "mainResult",
    "representationsConnected",
    "commonMistake",
    "canonicalExample",
    "oneProblemWorthRemembering",
    "whatThisUnlocksNext",
  ];
  for (const field of fields) {
    const value = summary[field];
    if (Array.isArray(value)) {
      value.forEach((v, i) => push(out, `${path}.${field}[${i}]`, v));
    } else {
      push(out, `${path}.${field}`, value);
    }
  }
}

/**
 * Learner-facing strings inside a `custom` exercise's `config`, keyed by
 * capability. `config` is `JsonObject`, so this is the one place the shape has
 * to be read structurally — the map is exported and a test asserts every
 * capability any lesson actually uses has an entry, so a new custom exercise
 * cannot silently bypass validation.
 */
export const CUSTOM_CONFIG_PROSE: Record<
  string,
  (config: Record<string, unknown>, path: string, out: ProseString[]) => void
> = {
  "self-check": (config, path, out) => {
    push(out, `${path}.config.modelAnswer`, config.modelAnswer);
    push(out, `${path}.config.rubric`, config.rubric);
    push(out, `${path}.config.rubricText`, config.rubricText);
  },
  "committed-prediction": (config, path, out) => {
    const options = config.options;
    if (Array.isArray(options)) {
      options.forEach((o, i) => push(out, `${path}.config.options[${i}]`, o));
    }
    push(out, `${path}.config.reveal`, config.reveal);
  },
  "construct-in-explorer": (config, path, out) => {
    push(out, `${path}.config.reveal`, config.reveal);
    push(out, `${path}.config.hint`, config.hint);
  },
  "exercise-sequence": (config, path, out) => {
    const steps = config.steps;
    if (!Array.isArray(steps)) return;
    steps.forEach((rawStep, i) => {
      const step = rawStep as Record<string, unknown>;
      const p = `${path}.config.steps[${i}]`;
      push(out, `${p}.prompt`, step.prompt);
      push(out, `${p}.explanation`, step.explanation);
      push(out, `${p}.reveal`, step.reveal);
      push(out, `${p}.hint`, step.hint);
      const choices = step.choices;
      if (Array.isArray(choices)) {
        choices.forEach((c, j) => push(out, `${p}.choices[${j}]`, c));
      }
    });
  },
  // Numeric/structural capture only — no authored prose beyond the exercise's
  // own `prompt`/`explanation`, which are collected at the exercise level.
  "matrix-entry": () => {},
  "solution-set": () => {},
  "elimination-solution": () => {},
};

function pushExercise(
  ex: ExerciseDefinition,
  path: string,
  out: ProseString[],
): void {
  push(out, `${path}.prompt`, ex.prompt);
  pushLayers(ex.layers, path, out);
  pushReveal(ex.solutionReveal, `${path}.solutionReveal`, out);
  for (const [i, hint] of (ex.hints ?? []).entries()) {
    push(out, `${path}.hints[${i}]`, hint);
  }

  switch (ex.type) {
    case "multiple-choice":
      ex.choices.forEach((c, i) => push(out, `${path}.choices[${i}]`, c));
      push(out, `${path}.explanation`, ex.explanation);
      return;
    case "prediction":
      push(out, `${path}.reveal`, ex.reveal);
      return;
    case "custom": {
      const handler = CUSTOM_CONFIG_PROSE[ex.capabilityId];
      if (handler && ex.config) {
        handler(ex.config as unknown as Record<string, unknown>, path, out);
      }
      return;
    }
    default:
      push(out, `${path}.explanation`, (ex as { explanation?: string }).explanation);
  }
}

/** Authored headings/labels on route blocks are rendered to the learner. */
function pushRouteLabels(
  route: readonly RouteBlock[] | undefined,
  id: string,
  out: ProseString[],
): void {
  for (const [i, block] of (route ?? []).entries()) {
    // `heading`/`tocLabel` come from AuthoredBlockLabels; `handoff` instead
    // carries its own required `label`, which is the link text a learner reads.
    const labelled = block as { heading?: string; tocLabel?: string; label?: string };
    const p = `${id}.route[${i}]:${block.kind}`;
    push(out, `${p}.heading`, labelled.heading);
    push(out, `${p}.tocLabel`, labelled.tocLabel);
    if (block.kind === "handoff") push(out, `${p}.label`, labelled.label);
  }
}

export function collectLessonProse(lesson: LessonDefinition): ProseString[] {
  const out: ProseString[] = [];
  const id = lesson.id;

  push(out, `${id}.subtitle`, lesson.subtitle);
  push(out, `${id}.motivatingQuestion`, lesson.motivatingQuestion);
  push(out, `${id}.keyTakeaway`, lesson.keyTakeaway);
  for (const [i, objective] of lesson.learningObjectives.entries()) {
    push(out, `${id}.learningObjectives[${i}]`, objective);
  }
  for (const objective of lesson.objectives ?? []) {
    push(out, `${id}.objective:${objective.id}.text`, objective.text);
  }

  pushRouteLabels(lesson.route, id, out);
  pushStructuredSummary(lesson.structuredSummary, `${id}.structuredSummary`, out);

  for (const section of lesson.sections) {
    const p = `${id}.section:${section.id}`;
    push(out, `${p}.title`, section.title);
    push(out, `${p}.body`, section.body);
    push(out, `${p}.observation`, section.observation);
    pushLayers(section.layers, p, out);
  }

  for (const fb of lesson.formalBlocks ?? []) {
    const p = `${id}.formal:${fb.id}`;
    push(out, `${p}.label`, fb.label);
    push(out, `${p}.statement`, fb.statement);
    push(out, `${p}.interpretation`, fb.interpretation);
    push(out, `${p}.proof`, fb.proof);
    pushLayers(fb.layers, p, out);
  }

  for (const we of lesson.workedExamples ?? []) {
    const p = `${id}.worked:${we.id}`;
    push(out, `${p}.title`, we.title);
    push(out, `${p}.prompt`, we.prompt);
    push(out, `${p}.equationsAriaLabel`, we.equationsAriaLabel);
    pushLayers(we.layers, p, out);
  }

  for (const c of lesson.callouts ?? []) {
    const p = `${id}.callout:${c.id}`;
    push(out, `${p}.title`, c.title);
    // Authored beats (vision.md §12.1) — the shape most callouts now use.
    for (const [i, move] of (c.moves ?? []).entries()) {
      push(out, `${p}.moves[${i}].label`, move.label);
      push(out, `${p}.moves[${i}].body`, move.body);
    }
    // Retained three-act shorthand.
    push(out, `${p}.belief`, c.belief);
    push(out, `${p}.confront`, c.confront);
    push(out, `${p}.resolve`, c.resolve);
    const attribution = c.attribution;
    if (attribution) {
      push(out, `${p}.attribution.who`, attribution.who);
      push(out, `${p}.attribution.source`, attribution.source);
    }
  }

  const checkpoints = [
    ...(lesson.checkpoint ? [{ cp: lesson.checkpoint, p: `${id}.checkpoint` }] : []),
    ...(lesson.checkpoints ?? []).map((cp, i) => ({ cp, p: `${id}.checkpoints[${i}]` })),
  ];
  for (const { cp, p } of checkpoints) {
    push(out, `${p}.prompt`, cp.prompt);
    push(out, `${p}.answer`, cp.answer);
    pushReveal(cp.solutionReveal, `${p}.solutionReveal`, out);
  }

  for (const ex of lesson.exercises ?? []) {
    pushExercise(ex, `${id}.exercise:${ex.id}`, out);
  }

  return out;
}
