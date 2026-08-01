import type { LessonDefinition, DepthLayer, SolutionReveal } from "../types";

/**
 * Walks every learner-facing PROSE string in a lesson (the strings that may
 * carry inline `$...$` math and `**bold**` / `*italic*` emphasis), yielding
 * `{ path, text }` pairs.
 *
 * Shared by the two validators that both need exactly this set:
 *  - `contentValidation.test.ts` — every `$...$` fragment must render;
 *  - `proseEmphasis.test.ts` — no emphasis marker may be stranded by a math
 *    token (see known-failure-modes.md).
 *
 * It walks RUNTIME lesson objects, not source literals, so a string assembled
 * by concatenation is checked as the learner actually receives it.
 *
 * Deliberately excludes whole-string equation fields (`section.equation`,
 * `WorkedExample.equations`): those are raw TeX, not prose, and neither
 * emphasis nor inline-`$` rules apply to them.
 *
 * **Adding a new learner-facing prose field to `LessonDefinition`? Add it
 * here** — both validators then cover it automatically.
 */
export type ProseString = { path: string; text: string };

function pushLayers(
  layers: DepthLayer[] | undefined,
  path: string,
  out: ProseString[],
): void {
  for (const [i, layer] of (layers ?? []).entries()) {
    out.push({ path: `${path}.layers[${i}].title`, text: layer.title });
    out.push({ path: `${path}.layers[${i}].body`, text: layer.body });
  }
}

function pushReveal(
  reveal: SolutionReveal | undefined,
  path: string,
  out: ProseString[],
): void {
  if (!reveal) return;
  out.push({ path: `${path}.prose`, text: reveal.prose });
  if (reveal.derivation) out.push({ path: `${path}.derivation`, text: reveal.derivation });
  if (reveal.interpretation)
    out.push({ path: `${path}.interpretation`, text: reveal.interpretation });
  if (reveal.connection) out.push({ path: `${path}.connection`, text: reveal.connection });
}

export function collectLessonProse(lesson: LessonDefinition): ProseString[] {
  const out: ProseString[] = [];
  const id = lesson.id;

  out.push({ path: `${id}.subtitle`, text: lesson.subtitle });
  if (lesson.motivatingQuestion) {
    out.push({ path: `${id}.motivatingQuestion`, text: lesson.motivatingQuestion });
  }
  if (lesson.keyTakeaway) {
    out.push({ path: `${id}.keyTakeaway`, text: lesson.keyTakeaway });
  }
  for (const [i, objective] of lesson.learningObjectives.entries()) {
    out.push({ path: `${id}.learningObjectives[${i}]`, text: objective });
  }
  for (const objective of lesson.objectives ?? []) {
    out.push({ path: `${id}.objective:${objective.id}.text`, text: objective.text });
  }

  for (const section of lesson.sections) {
    const p = `${id}.section:${section.id}`;
    out.push({ path: `${p}.title`, text: section.title });
    out.push({ path: `${p}.body`, text: section.body });
    if (section.observation) {
      out.push({ path: `${p}.observation`, text: section.observation });
    }
    pushLayers(section.layers, p, out);
  }

  for (const fb of lesson.formalBlocks ?? []) {
    const p = `${id}.formal:${fb.id}`;
    if (fb.label) out.push({ path: `${p}.label`, text: fb.label });
    out.push({ path: `${p}.statement`, text: fb.statement });
    out.push({ path: `${p}.interpretation`, text: fb.interpretation });
    if (fb.proof) out.push({ path: `${p}.proof`, text: fb.proof });
    pushLayers(fb.layers, p, out);
  }

  for (const we of lesson.workedExamples ?? []) {
    const p = `${id}.worked:${we.id}`;
    out.push({ path: `${p}.title`, text: we.title });
    if (we.prompt) out.push({ path: `${p}.prompt`, text: we.prompt });
    pushLayers(we.layers, p, out);
  }

  for (const c of lesson.callouts ?? []) {
    const p = `${id}.callout:${c.id}`;
    out.push({ path: `${p}.title`, text: c.title });
    if (c.belief) out.push({ path: `${p}.belief`, text: c.belief });
    if (c.confront) out.push({ path: `${p}.confront`, text: c.confront });
    if (c.resolve) out.push({ path: `${p}.resolve`, text: c.resolve });
  }

  const checkpoints = [
    ...(lesson.checkpoint ? [{ cp: lesson.checkpoint, p: `${id}.checkpoint` }] : []),
    ...(lesson.checkpoints ?? []).map((cp, i) => ({ cp, p: `${id}.checkpoints[${i}]` })),
  ];
  for (const { cp, p } of checkpoints) {
    out.push({ path: `${p}.prompt`, text: cp.prompt });
    out.push({ path: `${p}.answer`, text: cp.answer });
    pushReveal(cp.solutionReveal, `${p}.solutionReveal`, out);
  }

  for (const ex of lesson.exercises ?? []) {
    const p = `${id}.exercise:${ex.id}`;
    out.push({ path: `${p}.prompt`, text: ex.prompt });
    pushLayers(ex.layers, p, out);
    pushReveal(ex.solutionReveal, `${p}.solutionReveal`, out);
    for (const [i, hint] of (ex.hints ?? []).entries()) {
      out.push({ path: `${p}.hints[${i}]`, text: hint });
    }
    if (ex.type === "multiple-choice") {
      for (const [i, choice] of ex.choices.entries()) {
        out.push({ path: `${p}.choices[${i}]`, text: choice });
      }
      out.push({ path: `${p}.explanation`, text: ex.explanation });
    } else if (ex.type === "prediction") {
      out.push({ path: `${p}.reveal`, text: ex.reveal });
    } else if (ex.type !== "custom") {
      out.push({ path: `${p}.explanation`, text: ex.explanation });
    }
  }

  return out;
}
