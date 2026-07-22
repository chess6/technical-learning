import type { Vector2 } from "../math/types";
import type { JsonObject } from "../platform/json";

export type { Matrix2x2, MatrixExample, Vector2 } from "../math/types";

/** Optional depth layers — main line must read complete with all closed. */
export type DepthLayerKind =
  | "why"
  | "trap"
  | "math-note"
  | "history"
  | "looking-ahead"
  | "connection"
  | "recap";

export type DepthLayer = {
  kind: DepthLayerKind;
  title: string;
  body: string;
};

/**
 * Richer practice reveal. Presentation only — numbers come from src/math.
 * `solutionVisualId` resolves through the solution-visuals registry.
 */
export type SolutionReveal = {
  prose: string;
  solutionVisualId?: string;
  derivation?: string;
  interpretation?: string;
  connection?: string;
};

export type ExerciseTier = "check" | "drill" | "transfer";

type ExerciseCommon = {
  tier?: ExerciseTier;
  hints?: string[];
  /** Optional side-by-side visual reveal after grading. */
  solutionReveal?: SolutionReveal;
  layers?: DepthLayer[];
};

export type ExerciseDefinition =
  | (ExerciseCommon & {
      id: string;
      type: "multiple-choice";
      prompt: string;
      choices: string[];
      correctChoice: number;
      explanation: string;
    })
  | (ExerciseCommon & {
      id: string;
      type: "numeric";
      prompt: string;
      expected: number;
      tolerance?: number;
      explanation: string;
    })
  | (ExerciseCommon & {
      id: string;
      type: "vector";
      prompt: string;
      expected: Vector2;
      tolerance?: number;
      explanation: string;
    })
  | (ExerciseCommon & {
      id: string;
      type: "prediction";
      prompt: string;
      reveal: string;
    })
  | (ExerciseCommon & {
      id: string;
      type: "eigenvalue";
      prompt: string;
      /** One or more expected eigenvalues (order-insensitive). */
      expected: number | readonly number[];
      tolerance?: number;
      explanation: string;
    })
  | (ExerciseCommon & {
      id: string;
      /**
       * The expandable escape hatch. A `custom` exercise names ONE
       * `capabilityId` that resolves a bundled capability (grading in
       * `capabilities.ts`, rendering beside `ExercisePanel`). New interactions
       * (e.g. committed prediction) ship as registered capabilities reached
       * this way — without adding a new union member or editing a central
       * switch. `config` is opaque, capability-owned, and JSON-safe.
       */
      type: "custom";
      capabilityId: string;
      prompt: string;
      /**
       * Opaque, capability-owned configuration. Typed as `JsonObject` (not
       * `Record<string, unknown>`) so it provably contains only JSON-safe values
       * — no functions, class instances, or `Date`. The owning capability
       * validates its concrete shape at runtime.
       */
      config?: JsonObject;
    });

/**
 * A worked computation is authored as a plain, ordered list of mathematical
 * expressions (KaTeX) — nothing more by default.
 *
 * There is deliberately **no** per-step explanatory schema (no object /
 * invariant / picture / why-next / learned). If a step needs a subtle
 * connection, a misconception repair, or a non-obvious transition explained,
 * put that in a `layer` (depth layer) or an `AuthoredCallout` beside the
 * calculation — not on every equation. Equation-only is the normal case.
 */
export type WorkedExample = {
  id: string;
  title: string;
  prompt?: string;
  /**
   * Optional embedded derivation scene — the visual core of this worked
   * computation. Prefer this over a separate second Watch block.
   */
  guidedSceneId?: string;
  /** Shared matrix/example id for continuity with guided + explorer. */
  exampleId?: string;
  /** The calculation itself: an ordered list of KaTeX expressions. */
  equations: readonly string[];
  /** Optional accessible label for the equation sequence region. */
  equationsAriaLabel?: string;
  /** Optional depth layers for genuinely high-value asides (never per-step). */
  layers?: DepthLayer[];
};

/**
 * Flexible authored callout (misconception, aside, etc.).
 * Not a rigid DSL — slots are optional; authors compose what they need.
 */
export type AuthoredCallout = {
  id: string;
  title: string;
  belief?: string;
  confront?: string;
  resolve?: string;
  solutionVisualId?: string;
  exampleId?: string;
  highlightLambda?: number;
};

export type LessonSection = {
  id: string;
  title: string;
  body: string;
  equation?: string;
  observation?: string;
  layers?: DepthLayer[];
  /**
   * Optional inline figure rendered after the prose, resolved through the
   * lesson-visuals registry (`src/components/lesson/lessonVisuals`). Keeps
   * sections composable without a per-lesson branch in the page shell.
   */
  visualId?: string;
};

/**
 * A lightweight textbook-style formal block (the fields a textbook actually
 * labels — no general DSL). Rendered by `FormalStatement`.
 */
export type FormalKind =
  | "definition"
  | "proposition"
  | "theorem"
  | "corollary"
  | "conjecture"
  | "lemma"
  | "axiom";

export type FormalBlock = {
  id: string;
  kind: FormalKind;
  /** Optional short name, e.g. "Basis ⇔ unique representation". */
  label?: string;
  /** KaTeX-in-prose ($...$), rendered through ProseWithMath. */
  statement: string;
  /** Learner-accessible gloss. */
  interpretation: string;
  /**
   * visible = statement + interpretation shown; revealed = justification lives
   * in a collapsed <details>; reference = rendered muted (a named aside).
   */
  visibility: "visible" | "revealed" | "reference";
  layers?: DepthLayer[];
};

/**
 * A declared lesson route: the ordered list of blocks a lesson is assembled
 * from. **There is no canonical order.** Blocks are a reusable palette — a lesson
 * composes them in whatever order teaches best, may repeat a block with different
 * content (e.g. several worked examples spread out, or two checks bracketing a
 * hard idea), and may omit any block it does not need. The only structural rule
 * enforced elsewhere is guided Watch before learner Explore.
 *
 * It references the pieces a lesson already owns (sections, the guided visual,
 * formal blocks, worked examples, checkpoints, exercises) by identity, rather
 * than being a general textbook DSL.
 *
 * - `watch` renders the guided visual beside ALL sections (combined slot).
 * - `visual` renders the guided visual on its own (sections placed separately
 *   via `section`).
 * - `section` renders one lesson section by id (prose + optional inline figure).
 * - `formal` renders one FormalBlock by id.
 * - `worked` renders all worked examples + callouts, or one worked example by id.
 * - `check` renders the lesson's single `checkpoint`, or a specific one by
 *   `checkpointId` from `checkpoints` — so a lesson can pose more than one check.
 * - `practice` renders all exercises, or only `exerciseIds` — so a lesson can
 *   split practice into more than one set placed where each fits.
 * - `handoff` renders a CTA link to another lesson.
 */
export type RouteBlock =
  | { kind: "motivate" }
  | { kind: "watch" }
  | { kind: "visual" }
  | { kind: "section"; sectionId: string }
  | { kind: "formal"; formalId: string }
  | { kind: "check"; checkpointId?: string }
  | { kind: "worked"; workedId?: string }
  | { kind: "explore" }
  | { kind: "practice"; exerciseIds?: string[]; title?: string }
  | { kind: "summary" }
  | { kind: "handoff"; to: string; label: string };

/**
 * A structured, scannable "Remember this" summary — the compression payoff
 * (INTERACTIVE_TEXTBOOK_VISION §3) turned into a small set of labeled, reusable
 * fields, and a re-entry point for a returning learner (§14).
 *
 * Every field is **optional** and authored as KaTeX-in-prose (`$...$`) rendered
 * through `ProseWithMath`. Fields that hold a small set of items may be a single
 * string or a short `string[]`. When this whole object is absent, `LessonSummary`
 * falls back to the legacy `keyTakeaway` blockquote + `learningObjectives`
 * disclosure — so existing lessons keep rendering unchanged.
 *
 * Keep each field terse: this is a compression surface, not a second lesson.
 * Do not restate lesson prose; name the one reusable idea and its anchors.
 */
export type StructuredSummary = {
  /** The one-sentence intuitive handle the lesson collapses into (§7). */
  coreMentalModel?: string;
  /** The formal object(s) named in the lesson. */
  definitionsIntroduced?: string | string[];
  /** The lesson's headline theorem / result, stated compactly. */
  mainResult?: string;
  /** How the geometric / symbolic / numeric views were bound together (§2). */
  representationsConnected?: string | string[];
  /** The misconception this lesson confronts, in one line (§12). */
  commonMistake?: string;
  /** The canonical worked example / running example to recall. */
  canonicalExample?: string;
  /** The single problem worth keeping in memory as the lesson's signature. */
  oneProblemWorthRemembering?: string;
  /** The forward concept-graph edge this lesson opens (§14). */
  whatThisUnlocksNext?: string;
};

/** A short conceptual check-in. A lesson may own several (see `checkpoints`). */
export type LessonCheckpoint = {
  /** Optional id, required only when referenced by a `check` route block. */
  id?: string;
  prompt: string;
  answer: string;
  solutionReveal?: SolutionReveal;
};

export type LessonDefinition = {
  id: string;
  title: string;
  subtitle: string;
  /**
   * "intro" marks a course-opening chapter (e.g. Chapter 0). Intro pages are
   * numbered "Chapter 0" and are excluded from the "Lesson N" count. Defaults to
   * an ordinary numbered lesson.
   */
  kind?: "intro" | "lesson";
  learningObjectives: string[];
  /** A prediction/motivating question shown before the explanation. */
  motivatingQuestion?: string;
  sections: LessonSection[];
  /**
   * The lesson's authored block order (see `RouteBlock`). Every production lesson
   * should declare one — it is the lesson's real structure. When absent, a plain
   * linear fallback is used purely so nothing crashes; it is not a template to
   * aim for.
   */
  route?: RouteBlock[];
  /** Formal blocks referenced by a `formal` route block. */
  formalBlocks?: FormalBlock[];
  guidedSceneId: string;
  explorationId: string;
  /** The lesson's default/single checkpoint (used by a `check` block with no id). */
  checkpoint?: LessonCheckpoint;
  /**
   * Additional checkpoints, referenced by id from `check` route blocks, so a
   * lesson can pose more than one conceptual check in different places.
   */
  checkpoints?: LessonCheckpoint[];
  /**
   * Notebook-style worked examples. A derivation scene, when present, lives
   * on `WorkedExample.guidedSceneId` (taught once, embedded in the example).
   */
  workedExamples?: WorkedExample[];
  /**
   * Optional authored callouts (misconceptions, asides). Flexible slots —
   * not every callout needs every field.
   */
  callouts?: AuthoredCallout[];
  /** Optional so an intro chapter can omit Practice entirely. */
  exercises?: ExerciseDefinition[];
  /** Optional so an intro chapter can omit a "Remember this" summary. */
  keyTakeaway?: string;
  /**
   * Optional structured "Remember this" summary. When present, `LessonSummary`
   * renders the labeled compression fields (with progressive disclosure);
   * when absent it falls back to `keyTakeaway` + `learningObjectives`.
   */
  structuredSummary?: StructuredSummary;
  /** Shared example id used by both guided scene and exploration. */
  exampleId?: string;
};
