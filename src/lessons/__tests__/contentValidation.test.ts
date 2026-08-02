import { describe, expect, it } from "vitest";
import katex from "katex";
import { getLessonById, lessons } from "../registry";
import type { LessonDefinition } from "../types";
import { hasGuidedScene } from "../../guided-scenes/scenes/sceneMeta";
import { hasSolutionVisual } from "../../components/lesson/solutionVisuals/registry";
import { getLessonVisual } from "../../components/lesson/lessonVisuals";
import { hasExplorer } from "../../explorations/registry";
import { getBlockComponent } from "../../components/lesson/blockComponents";
import { getBlockAnchorId } from "../toc";
import { collectLessonProse } from "./lessonProse";

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

/**
 * Raw display-equation fields — `section.equation` and `WorkedExample.equations`
 * are whole-string TeX, NOT prose: they carry no `$` delimiters and no emphasis
 * markers, so the shared prose collector deliberately excludes them and they
 * are rendered here in display mode instead.
 */
function collectLessonEquations(lesson: LessonDefinition, out: KatexFailure[]): void {
  const id = lesson.id;
  for (const section of lesson.sections) {
    if (section.equation) {
      collectFromEquation(section.equation, `${id}.section:${section.id}.equation`, out);
    }
  }
  for (const we of lesson.workedExamples ?? []) {
    for (const [i, eq] of we.equations.entries()) {
      collectFromEquation(eq, `${id}.worked:${we.id}.equations[${i}]`, out);
    }
  }
}

/**
 * Every learner-facing KaTeX-bearing string in a lesson.
 *
 * Inline `$...$` prose comes from the SHARED collector
 * (`lessonProse.ts#collectLessonProse`) — the same walker `proseEmphasis.test.ts`
 * uses — so a field can never be validated for emphasis but not for KaTeX, or
 * vice versa. This file previously maintained a second, drifting walker; it had
 * fallen behind on `callout.moves`, `structuredSummary`, route headings and
 * custom-exercise configs, which is how a broken model answer and an unpaired
 * `$` shipped unseen.
 */
function collectLessonKatex(lesson: LessonDefinition, out: KatexFailure[]): void {
  for (const { path, text } of collectLessonProse(lesson)) {
    collectFromProse(text, path, out);
  }
  collectLessonEquations(lesson, out);
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

  /**
   * Every route block becomes a DOM `id` (LessonLayout) and an in-page anchor
   * target (the table of contents, the course sidebar's sublist). Several
   * anchor schemes are keyed by CONTENT id rather than route position —
   * `formal-<formalId>`, and since package R3 also `callout-<calloutId>` and
   * `proof-<formalId>` — so placing the same formal block, callout, or proof
   * twice in one route silently emits duplicate DOM ids: invalid HTML, and
   * every anchor link to it lands on whichever came first. Nothing else
   * catches this; the page still renders.
   */
  it("produces a unique anchor id for every route block in every lesson", () => {
    const problems: string[] = [];
    for (const lesson of lessons) {
      const anchors = (lesson.route ?? []).map((block, i) =>
        getBlockAnchorId(block, i),
      );
      const dupes = duplicates(anchors);
      if (dupes.length > 0) {
        problems.push(
          `${lesson.id}: duplicate route anchor ids ${JSON.stringify(dupes)}`,
        );
      }
    }
    expect(problems, problems.join("\n")).toEqual([]);
  });

  it("resolves implicit route targets and handoff destinations", () => {
    const problems: string[] = [];
    for (const lesson of lessons) {
      const calloutIds = new Set((lesson.callouts ?? []).map((c) => c.id));
      const formalIds = new Set((lesson.formalBlocks ?? []).map((f) => f.id));
      const formalById = new Map((lesson.formalBlocks ?? []).map((f) => [f.id, f]));
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
        } else if (block.kind === "visual" && block.sceneId) {
          // A `visual` naming a scene renders THAT scene or NOTHING — it never
          // falls back to the lesson's own clip (LessonLayout, deliberately).
          // So a typo'd sceneId silently drops the animation off the page with
          // nothing failing. Three lessons place named clips this way.
          if (!hasGuidedScene(block.sceneId)) {
            problems.push(`${where}: "visual" block references unregistered sceneId "${block.sceneId}"`);
          }
        } else if (block.kind === "explore" && block.explorationId) {
          // Same hazard, same rule, for the named-explorer placement added in
          // package R1 — resolved against the registry's own id list so this
          // stays a pure-data check (no React import into a lessons test).
          if (!hasExplorer(block.explorationId)) {
            problems.push(`${where}: "explore" block references unregistered explorationId "${block.explorationId}"`);
          }
        } else if (block.kind === "callout") {
          if (!calloutIds.has(block.calloutId)) {
            problems.push(`${where}: "callout" block references unknown calloutId "${block.calloutId}"`);
          }
        } else if (block.kind === "proof") {
          if (!formalIds.has(block.formalId)) {
            problems.push(`${where}: "proof" block references unknown formalId "${block.formalId}"`);
          } else if (!formalById.get(block.formalId)?.proof) {
            problems.push(
              `${where}: "proof" block references formalId "${block.formalId}" which has no proof field`,
            );
          }
        } else if (block.kind === "composed") {
          if (!getBlockComponent(block.componentId)) {
            problems.push(`${where}: "composed" block references unregistered componentId "${block.componentId}"`);
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
