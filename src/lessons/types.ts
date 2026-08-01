import type { Vector2 } from "../math/types";
import type { JsonObject } from "../platform/json";
import type { EvidenceLevel } from "./evidence";

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
 * One beat of a callout: a paragraph, optionally announced by a short lead-in.
 * Omit `label` when the prose carries itself — a one-line correction usually
 * does, and a bare "Repair." in front of it is noise.
 */
export type CalloutMove = {
  label?: string;
  body: string;
};

/**
 * Flexible authored callout (misconception, historical episode, aside).
 *
 * **How many moves a callout makes is a per-callout judgment**, exactly like
 * every other form decision in this codebase (`vision.md` §0 principle 2,
 * §12.1). A field-wide belief that took a decade to break genuinely has three
 * beats; "call them subrectangles, not squares" has one. Forcing the second
 * into three labeled paragraphs pads it into significance it does not have.
 *
 * Prefer `moves` — it says what this specific misconception needs. The
 * `belief` / `confront` / `resolve` triple is retained shorthand for the case
 * where the three-act shape is genuinely right (a real prediction, watched to
 * fail, then repaired), and it is a common case — but it is not the default
 * shape, and reaching for it reflexively is what made all 47 callouts in this
 * course read identically.
 */
export type AuthoredCallout = {
  id: string;
  title: string;
  /**
   * The callout's beats, in order. Authors choose how many and what (if
   * anything) announces each. Takes precedence over `belief`/`confront`/
   * `resolve` when present.
   */
  moves?: readonly CalloutMove[];
  belief?: string;
  confront?: string;
  resolve?: string;
  solutionVisualId?: string;
  exampleId?: string;
  highlightLambda?: number;
  /** Who/when/source, for a callout used as a historical belief-and-break. */
  attribution?: { who?: string; when?: string; source?: string };
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
  /**
   * Optional proof body (KaTeX-in-prose), rendered only where a `proof` route
   * block references this formalId with `variant="proof"` — a plain `formal`
   * reference to the same block never renders it. This keeps a proof out of
   * every place its theorem is merely cited, and places it deliberately where
   * the argument follows it as the main line (vision.md §0 principle 9).
   */
  proof?: string;
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
 * - `visual` renders a guided visual on its own (sections placed separately
 *   via `section`). With no `sceneId` it renders the lesson's own
 *   `guidedSceneId`; with one, it renders that scene instead, so a lesson may
 *   place a second clip where the mathematics needs it. This is an option, not
 *   an expectation — most lessons want exactly one.
 * - `section` renders one lesson section by id (prose + optional inline figure).
 * - `formal` renders one FormalBlock by id.
 * - `worked` renders all worked examples + callouts, or one worked example by id.
 * - `check` renders the lesson's single `checkpoint`, or a specific one by
 *   `checkpointId` from `checkpoints` — so a lesson can pose more than one check.
 * - `explore` renders the lesson's combined exploration, or a specific one by
 *   `explorationId` — mirroring `visual`'s named `sceneId`, for a lesson that
 *   places more than one explorer.
 * - `practice` renders all exercises, or only `exerciseIds` — so a lesson can
 *   split practice into more than one set placed where each fits. `scaffold`
 *   is authoring data only in this package (see mastery-standard.md §3); it
 *   sets no runtime behavior until the learner-profile system reads it.
 * - `callout` renders one `AuthoredCallout` by id, at this exact route
 *   position — an alternative to automatic placement, for a callout (a
 *   misconception, or a historical belief-and-break) that belongs at a
 *   specific point in the argument.
 * - `proof` renders one `FormalBlock`'s `proof` field, expanded, as the main
 *   line — never folded into a `formal` block's collapsed justification.
 * - `composed` renders a registered block component
 *   (`src/components/lesson/blockComponents.tsx`) by `componentId`, with
 *   optional JSON-safe `config` — the escape hatch for a form the fixed
 *   palette doesn't name (a computational lab, a simulation, an open
 *   investigation), reached the same way a `custom` exercise capability is.
 * - `handoff` renders a CTA link to another lesson.
 */

/**
 * Optional authored labels for a route block.
 *
 * A block's `kind` is **internal** — it drives the route, `data-block-kind`
 * analytics, the styling variant, and the accessible region description. It is
 * never rendered as a heading: a repeated "Think about it / Watch the idea /
 * Quick check / Try it yourself / Remember this" rail makes every lesson look
 * assembled from a template instead of written about a specific piece of
 * mathematics (product/semantic-page-grammar.md §1).
 *
 * So a block has **no visible heading by default**, and flows straight into its
 * content. Where naming genuinely helps — a guided animation that no section
 * title introduces, a summary whose synthesis deserves stating — the lesson
 * authors a content-specific heading here, in its own words.
 */
export type AuthoredBlockLabels = {
  /**
   * Visible heading for this block, in the lesson's own words. Omit whenever
   * the block's content already names itself (a motivating question, a
   * checkpoint prompt, an explorer that carries its own title).
   */
  heading?: string;
  /**
   * Table-of-contents label. Defaults to `heading`. Set it alone when the
   * block's own child renders the visible heading — an exploration names
   * itself on the page, but still deserves a row in the contents.
   */
  tocLabel?: string;
};

export type RouteBlock =
  | ({ kind: "motivate" } & AuthoredBlockLabels)
  | ({ kind: "watch" } & AuthoredBlockLabels)
  | ({ kind: "visual"; sceneId?: string } & AuthoredBlockLabels)
  | { kind: "section"; sectionId: string }
  | { kind: "formal"; formalId: string }
  | ({ kind: "check"; checkpointId?: string } & AuthoredBlockLabels)
  | ({ kind: "worked"; workedId?: string } & AuthoredBlockLabels)
  | ({ kind: "explore"; explorationId?: string } & AuthoredBlockLabels)
  | ({
      kind: "practice";
      exerciseIds?: string[];
      /** Authoring data only — see mastery-standard.md §3; no runtime effect yet. */
      scaffold?: "coached" | "independent";
    } & AuthoredBlockLabels)
  | ({ kind: "summary" } & AuthoredBlockLabels)
  | { kind: "callout"; calloutId: string }
  | { kind: "proof"; formalId: string }
  | ({
      kind: "composed";
      componentId: string;
      config?: JsonObject;
    } & AuthoredBlockLabels)
  | { kind: "handoff"; to: string; label: string };

/**
 * A structured, scannable summary — the compression payoff
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

/**
 * Where an objective's mastery evidence is demonstrated. A lesson is not
 * required to discharge every objective it states — a `module-owned` or
 * `course-owned` objective is resolved by that unit's module set instead (see
 * ADR-004). This is what makes an experience with zero exercises legitimate:
 * it has none because none of its objectives are `lesson-owned`, not because
 * evidence was skipped.
 */
export type ObjectiveEvidence = "lesson-owned" | "module-owned" | "course-owned";

/**
 * One learning objective, with its evidence obligation stated explicitly
 * rather than left as prose. Replaces "at least two exercises and a
 * checkpoint" (a quota) with a requirement that means something:
 * `objectiveCoverage.test.ts` asserts every `lesson-owned` objective resolves
 * to at least one item (`itemIds`, cross-referenced against
 * `ITEM_ASSESSMENT_META`) at or above its claimed `evidenceLevel`.
 */
export type LessonObjective = {
  id: string;
  text: string;
  /** Resolves in the concept graph (ADR-005) once it exists; unused until R4. */
  conceptId?: string;
  evidence: ObjectiveEvidence;
  evidenceLevel: EvidenceLevel;
  /** Exercise or module-item ids that discharge this objective. */
  itemIds?: readonly string[];
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
  /**
   * @deprecated Prefer `objectives` (evidence-typed). Kept required until every
   * lesson migrates — an existing lesson with only `learningObjectives` is
   * unaffected; `objectives` is additive, not a replacement in this package.
   */
  learningObjectives: string[];
  /**
   * Objectives with named evidence obligations (ADR-004). Optional while
   * lessons migrate from `learningObjectives`; a lesson that declares
   * `objectives` is validated by `objectiveCoverage.test.ts`, one that
   * doesn't yet is not.
   */
  objectives?: LessonObjective[];
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
  /**
   * Registered only when the route actually contains a `watch`/`visual`
   * block. Omit entirely when the experience's mathematics needs no guided
   * animation (vision.md §0 principle 2) — there is no fallback scene.
   */
  guidedSceneId?: string;
  /** Registered only when the route actually contains an `explore` block. */
  explorationId?: string;
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
  /** Optional so an intro chapter can omit a closing summary. */
  keyTakeaway?: string;
  /**
   * Optional structured summary. When present, `LessonSummary`
   * renders the labeled compression fields (with progressive disclosure);
   * when absent it falls back to `keyTakeaway` + `learningObjectives`.
   */
  structuredSummary?: StructuredSummary;
  /** Shared example id used by both guided scene and exploration. */
  exampleId?: string;
};
