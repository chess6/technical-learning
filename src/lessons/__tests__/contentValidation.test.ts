import { describe, expect, it } from "vitest";
import katex from "katex";
import { getLessonById, lessons } from "../registry";
import type {
  DepthLayer,
  ExerciseDefinition,
  LessonCheckpoint,
  LessonDefinition,
  SolutionReveal,
} from "../types";
import { hasGuidedScene } from "../../guided-scenes/scenes/sceneMeta";
import { hasSolutionVisual } from "../../components/lesson/solutionVisuals/registry";
import { getLessonVisual } from "../../components/lesson/lessonVisuals";

/**
 * Content validator (expressed as a test). Runs over ALL registered lessons and
 * flags authoring defects that a runtime never surfaces loudly:
 *
 *  - duplicate ids within a lesson (section / formal / worked / exercise / checkpoint / callout);
 *  - globally-colliding exercise ids (learner state is keyed by exercise id);
 *  - route blocks whose *implicit* targets are missing, and `handoff` links to
 *    lessons that do not exist;
 *  - worked-example guided scenes, section figures, and solution visuals that
 *    reference an unregistered id;
 *  - malformed tier values;
 *  - malformed KaTeX — every `$...$` fragment in learner-facing prose, plus every
 *    whole-string equation field, is fed to `katex.renderToString`; a throw fails
 *    the test.
 *
 * This is deliberately COMPLEMENTARY to `lessonWiring.test.ts`, which already
 * checks that `guidedSceneId` / `explorationId` resolve and that *explicit*
 * route references (with ids) exist. We do not re-assert those here.
 */

const VALID_TIERS = new Set(["check", "drill", "transfer"]);

// KaTeX options mirror the production renderer (EquationBlock.renderTex):
// throwOnError so a genuinely broken expression is caught, strict "ignore" so
// the same non-fatal warnings the app tolerates do not trip the validator.
function renderKatex(tex: string, displayMode: boolean): void {
  katex.renderToString(tex, {
    displayMode,
    throwOnError: true,
    strict: "ignore",
    output: "htmlAndMathml",
  });
}

// Same inline-math extraction as ProseWithMath.splitMath: `$...$` fragments.
const INLINE_MATH = /\$([^$]+)\$/g;

type KatexFailure = { path: string; tex: string; error: string };

function collectFromProse(text: string, path: string, out: KatexFailure[]): void {
  INLINE_MATH.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = INLINE_MATH.exec(text)) !== null) {
    const fragment = match[1]!;
    try {
      renderKatex(fragment, false);
    } catch (error) {
      out.push({ path, tex: fragment, error: String(error) });
    }
  }
}

function collectFromEquation(tex: string, path: string, out: KatexFailure[]): void {
  try {
    renderKatex(tex, true);
  } catch (error) {
    out.push({ path, tex, error: String(error) });
  }
}

function collectFromLayers(
  layers: DepthLayer[] | undefined,
  path: string,
  out: KatexFailure[],
): void {
  for (const [i, layer] of (layers ?? []).entries()) {
    collectFromProse(layer.title, `${path}.layers[${i}].title`, out);
    collectFromProse(layer.body, `${path}.layers[${i}].body`, out);
  }
}

function collectFromReveal(
  reveal: SolutionReveal | undefined,
  path: string,
  out: KatexFailure[],
): void {
  if (!reveal) return;
  collectFromProse(reveal.prose, `${path}.prose`, out);
  if (reveal.derivation) collectFromProse(reveal.derivation, `${path}.derivation`, out);
  if (reveal.interpretation) collectFromProse(reveal.interpretation, `${path}.interpretation`, out);
  if (reveal.connection) collectFromProse(reveal.connection, `${path}.connection`, out);
}

function collectFromCheckpoint(
  cp: LessonCheckpoint,
  path: string,
  out: KatexFailure[],
): void {
  collectFromProse(cp.prompt, `${path}.prompt`, out);
  collectFromProse(cp.answer, `${path}.answer`, out);
  collectFromReveal(cp.solutionReveal, `${path}.solutionReveal`, out);
}

function collectFromExercise(
  ex: ExerciseDefinition,
  path: string,
  out: KatexFailure[],
): void {
  collectFromProse(ex.prompt, `${path}.prompt`, out);
  collectFromLayers(ex.layers, path, out);
  collectFromReveal(ex.solutionReveal, `${path}.solutionReveal`, out);
  for (const [i, hint] of (ex.hints ?? []).entries()) {
    collectFromProse(hint, `${path}.hints[${i}]`, out);
  }
  if (ex.type === "multiple-choice") {
    for (const [i, choice] of ex.choices.entries()) {
      collectFromProse(choice, `${path}.choices[${i}]`, out);
    }
    collectFromProse(ex.explanation, `${path}.explanation`, out);
  } else if (ex.type === "prediction") {
    collectFromProse(ex.reveal, `${path}.reveal`, out);
  } else if (ex.type !== "custom") {
    collectFromProse(ex.explanation, `${path}.explanation`, out);
  }
}

/** Every learner-facing KaTeX-bearing string in a lesson, walked into `out`. */
function collectLessonKatex(lesson: LessonDefinition, out: KatexFailure[]): void {
  const id = lesson.id;
  collectFromProse(lesson.subtitle, `${id}.subtitle`, out);
  if (lesson.motivatingQuestion) {
    collectFromProse(lesson.motivatingQuestion, `${id}.motivatingQuestion`, out);
  }
  if (lesson.keyTakeaway) collectFromProse(lesson.keyTakeaway, `${id}.keyTakeaway`, out);
  for (const [i, obj] of lesson.learningObjectives.entries()) {
    collectFromProse(obj, `${id}.learningObjectives[${i}]`, out);
  }

  for (const section of lesson.sections) {
    const p = `${id}.section:${section.id}`;
    collectFromProse(section.title, `${p}.title`, out);
    collectFromProse(section.body, `${p}.body`, out);
    if (section.observation) collectFromProse(section.observation, `${p}.observation`, out);
    if (section.equation) collectFromEquation(section.equation, `${p}.equation`, out);
    collectFromLayers(section.layers, p, out);
  }

  for (const fb of lesson.formalBlocks ?? []) {
    const p = `${id}.formal:${fb.id}`;
    if (fb.label) collectFromProse(fb.label, `${p}.label`, out);
    collectFromProse(fb.statement, `${p}.statement`, out);
    collectFromProse(fb.interpretation, `${p}.interpretation`, out);
    collectFromLayers(fb.layers, p, out);
  }

  for (const we of lesson.workedExamples ?? []) {
    const p = `${id}.worked:${we.id}`;
    collectFromProse(we.title, `${p}.title`, out);
    if (we.prompt) collectFromProse(we.prompt, `${p}.prompt`, out);
    for (const [i, eq] of we.equations.entries()) {
      collectFromEquation(eq, `${p}.equations[${i}]`, out);
    }
    collectFromLayers(we.layers, p, out);
  }

  for (const c of lesson.callouts ?? []) {
    const p = `${id}.callout:${c.id}`;
    collectFromProse(c.title, `${p}.title`, out);
    if (c.belief) collectFromProse(c.belief, `${p}.belief`, out);
    if (c.confront) collectFromProse(c.confront, `${p}.confront`, out);
    if (c.resolve) collectFromProse(c.resolve, `${p}.resolve`, out);
  }

  if (lesson.checkpoint) collectFromCheckpoint(lesson.checkpoint, `${id}.checkpoint`, out);
  for (const [i, cp] of (lesson.checkpoints ?? []).entries()) {
    collectFromCheckpoint(cp, `${id}.checkpoints[${i}]`, out);
  }

  for (const ex of lesson.exercises ?? []) {
    collectFromExercise(ex, `${id}.exercise:${ex.id}`, out);
  }
}

function duplicates(ids: readonly string[]): string[] {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) dupes.add(id);
    seen.add(id);
  }
  return [...dupes];
}

describe("content validation across all registered lessons", () => {
  it("has no duplicate ids within a lesson (section/formal/worked/exercise/checkpoint/callout)", () => {
    const problems: string[] = [];
    for (const lesson of lessons) {
      const groups: Record<string, string[]> = {
        section: lesson.sections.map((s) => s.id),
        formal: (lesson.formalBlocks ?? []).map((f) => f.id),
        worked: (lesson.workedExamples ?? []).map((w) => w.id),
        exercise: (lesson.exercises ?? []).map((e) => e.id),
        checkpoint: (lesson.checkpoints ?? [])
          .map((c) => c.id)
          .filter((x): x is string => Boolean(x)),
        callout: (lesson.callouts ?? []).map((c) => c.id),
      };
      for (const [kind, ids] of Object.entries(groups)) {
        const dupes = duplicates(ids);
        if (dupes.length > 0) {
          problems.push(`${lesson.id}: duplicate ${kind} ids ${JSON.stringify(dupes)}`);
        }
      }
    }
    expect(problems, problems.join("\n")).toEqual([]);
  });

  it("has globally-unique exercise ids (learner state is keyed by exercise id)", () => {
    const allIds = lessons.flatMap((l) => (l.exercises ?? []).map((e) => e.id));
    expect(duplicates(allIds), "colliding exercise ids across lessons").toEqual([]);
  });

  it("resolves implicit route targets and handoff destinations", () => {
    const problems: string[] = [];
    for (const lesson of lessons) {
      for (const [i, block] of (lesson.route ?? []).entries()) {
        const where = `${lesson.id}.route[${i}]`;
        if (block.kind === "worked" && !block.workedId) {
          if ((lesson.workedExamples ?? []).length === 0) {
            problems.push(`${where}: "worked" block but the lesson has no worked examples`);
          }
        } else if (block.kind === "check" && !block.checkpointId) {
          if (!lesson.checkpoint) {
            problems.push(`${where}: "check" block but the lesson has no default checkpoint`);
          }
        } else if (block.kind === "practice" && !block.exerciseIds) {
          if ((lesson.exercises ?? []).length === 0) {
            problems.push(`${where}: "practice" block but the lesson has no exercises`);
          }
        } else if (block.kind === "handoff") {
          // `to` is a route path like "/lesson/vectors"; resolve the lesson id.
          const match = /^\/lesson\/([^/]+)$/.exec(block.to);
          if (!match || !getLessonById(match[1]!)) {
            problems.push(`${where}: handoff to unknown lesson "${block.to}"`);
          }
        }
      }
    }
    expect(problems, problems.join("\n")).toEqual([]);
  });

  it("resolves every worked-example guided scene, section figure, and solution visual", () => {
    const problems: string[] = [];
    for (const lesson of lessons) {
      for (const we of lesson.workedExamples ?? []) {
        if (we.guidedSceneId && !hasGuidedScene(we.guidedSceneId)) {
          problems.push(`${lesson.id}.worked:${we.id}: missing guided scene "${we.guidedSceneId}"`);
        }
      }
      for (const section of lesson.sections) {
        if (section.visualId && getLessonVisual(section.visualId) === null) {
          problems.push(`${lesson.id}.section:${section.id}: missing lesson visual "${section.visualId}"`);
        }
      }
      const visualRefs: { path: string; id: string | undefined }[] = [
        ...(lesson.callouts ?? []).map((c) => ({
          path: `${lesson.id}.callout:${c.id}`,
          id: c.solutionVisualId,
        })),
        ...(lesson.exercises ?? []).map((e) => ({
          path: `${lesson.id}.exercise:${e.id}`,
          id: e.solutionReveal?.solutionVisualId,
        })),
        ...(lesson.checkpoints ?? []).map((c, i) => ({
          path: `${lesson.id}.checkpoints[${i}]`,
          id: c.solutionReveal?.solutionVisualId,
        })),
        {
          path: `${lesson.id}.checkpoint`,
          id: lesson.checkpoint?.solutionReveal?.solutionVisualId,
        },
      ];
      for (const ref of visualRefs) {
        if (ref.id && !hasSolutionVisual(ref.id)) {
          problems.push(`${ref.path}: missing solution visual "${ref.id}"`);
        }
      }
    }
    expect(problems, problems.join("\n")).toEqual([]);
  });

  it("uses only valid exercise tier values (untiered is allowed by the schema)", () => {
    const problems: string[] = [];
    for (const lesson of lessons) {
      for (const ex of lesson.exercises ?? []) {
        if (ex.tier !== undefined && !VALID_TIERS.has(ex.tier)) {
          problems.push(`${lesson.id}.exercise:${ex.id}: invalid tier "${ex.tier}"`);
        }
      }
    }
    expect(problems, problems.join("\n")).toEqual([]);
  });

  it("renders every learner-facing KaTeX fragment without throwing", () => {
    const failures: KatexFailure[] = [];
    for (const lesson of lessons) {
      collectLessonKatex(lesson, failures);
    }
    const summary = failures
      .map((f) => `  ${f.path}: ${f.tex}\n    → ${f.error}`)
      .join("\n");
    expect(failures.length, `malformed KaTeX:\n${summary}`).toBe(0);
  });
});
