import { describe, expect, it } from "vitest";
import { lessons } from "../registry";
import { collectLessonProse, CUSTOM_CONFIG_PROSE } from "./lessonProse";
import type { LessonDefinition } from "../types";

/**
 * `collectLessonProse` is the single authoritative walker for learner-facing
 * prose (see its header). These fixtures prove it actually *reaches* each field
 * it claims to cover — a collector that silently skips a field makes every
 * validator downstream of it vacuous for that field, which is precisely how a
 * broken model answer and an unpaired `$` shipped unnoticed.
 *
 * Each fixture plants a malformed marker in one field and asserts the collector
 * surfaces that exact path. The malformations mirror the real failure modes the
 * downstream guards check for: broken KaTeX, straddling emphasis, `$$`, and
 * doc-internal jargon.
 */

/** Minimal valid lesson; each fixture overrides exactly the field under test. */
function baseLesson(overrides: Partial<LessonDefinition>): LessonDefinition {
  return {
    id: "fixture-lesson",
    title: "Fixture",
    subtitle: "A fixture",
    learningObjectives: ["do the thing"],
    sections: [{ id: "s1", title: "S", body: "Body." }],
    ...overrides,
  } as LessonDefinition;
}

function pathsOf(lesson: LessonDefinition): string[] {
  return collectLessonProse(lesson).map((p) => p.path);
}

function textAt(lesson: LessonDefinition, path: string): string | undefined {
  return collectLessonProse(lesson).find((p) => p.path === path)?.text;
}

describe("collectLessonProse reaches every newly covered field", () => {
  it("reaches callout.moves label and body", () => {
    const lesson = baseLesson({
      callouts: [
        {
          id: "c1",
          title: "T",
          moves: [{ label: "Lead **in $x$**.", body: "Body with $\\notacommand{x}$." }],
        },
      ],
    });
    expect(pathsOf(lesson)).toEqual(
      expect.arrayContaining([
        "fixture-lesson.callout:c1.moves[0].label",
        "fixture-lesson.callout:c1.moves[0].body",
      ]),
    );
    expect(textAt(lesson, "fixture-lesson.callout:c1.moves[0].body")).toContain("\\notacommand");
  });

  it("reaches every structuredSummary field, including array-valued ones", () => {
    const lesson = baseLesson({
      structuredSummary: {
        coreMentalModel: "A $$bad$$ delimiter.",
        definitionsIntroduced: ["First $x$", "Second $y$"],
        mainResult: "Result.",
        representationsConnected: "Joined.",
        commonMistake: "Mistake.",
        canonicalExample: "Example.",
        oneProblemWorthRemembering: "Problem.",
        whatThisUnlocksNext: "Next.",
      },
    });
    const paths = pathsOf(lesson);
    for (const field of [
      "coreMentalModel",
      "mainResult",
      "representationsConnected",
      "commonMistake",
      "canonicalExample",
      "oneProblemWorthRemembering",
      "whatThisUnlocksNext",
    ]) {
      expect(paths).toContain(`fixture-lesson.structuredSummary.${field}`);
    }
    expect(paths).toContain("fixture-lesson.structuredSummary.definitionsIntroduced[0]");
    expect(paths).toContain("fixture-lesson.structuredSummary.definitionsIntroduced[1]");
    expect(textAt(lesson, "fixture-lesson.structuredSummary.coreMentalModel")).toContain("$$");
  });

  it("reaches authored route headings and toc labels", () => {
    const lesson = baseLesson({
      route: [
        { kind: "visual", heading: "Heading with $\\badmacro{}$" },
        { kind: "explore", tocLabel: "Label **straddling $x$**" },
        { kind: "handoff", to: "next-lesson", label: "On to $\\nextthing{}$" },
      ],
    });
    const paths = pathsOf(lesson);
    expect(paths).toContain("fixture-lesson.route[0]:visual.heading");
    expect(paths).toContain("fixture-lesson.route[1]:explore.tocLabel");
    expect(paths).toContain("fixture-lesson.route[2]:handoff.label");
  });

  it("reaches self-check config: modelAnswer, rubric and rubricText", () => {
    const lesson = baseLesson({
      exercises: [
        {
          id: "e1",
          type: "custom",
          capabilityId: "self-check",
          tier: "transfer",
          prompt: "P",
          config: {
            modelAnswer: "Model with $\\nope{}$",
            rubric: "Short rubric.",
            rubricText: "Reviewer guidance with C5 jargon.",
          },
        },
      ],
    } as Partial<LessonDefinition>);
    const paths = pathsOf(lesson);
    expect(paths).toContain("fixture-lesson.exercise:e1.config.modelAnswer");
    expect(paths).toContain("fixture-lesson.exercise:e1.config.rubric");
    expect(paths).toContain("fixture-lesson.exercise:e1.config.rubricText");
  });

  it("reaches exercise-sequence step prompts, choices and explanations", () => {
    const lesson = baseLesson({
      exercises: [
        {
          id: "e2",
          type: "custom",
          capabilityId: "exercise-sequence",
          tier: "drill",
          prompt: "P",
          config: {
            steps: [
              {
                kind: "multiple-choice",
                prompt: "Step prompt $x$",
                choices: ["A $y$", "B"],
                correctChoice: 0,
                explanation: "Because $z$",
              },
            ],
          },
        },
      ],
    } as Partial<LessonDefinition>);
    const paths = pathsOf(lesson);
    expect(paths).toContain("fixture-lesson.exercise:e2.config.steps[0].prompt");
    expect(paths).toContain("fixture-lesson.exercise:e2.config.steps[0].choices[0]");
    expect(paths).toContain("fixture-lesson.exercise:e2.config.steps[0].explanation");
  });

  it("reaches committed-prediction options and reveal", () => {
    const lesson = baseLesson({
      exercises: [
        {
          id: "e3",
          type: "custom",
          capabilityId: "committed-prediction",
          tier: "check",
          prompt: "P",
          config: { options: ["Opt $a$", "Opt $b$"], correctIndex: 0, reveal: "Reveal $c$" },
        },
      ],
    } as Partial<LessonDefinition>);
    const paths = pathsOf(lesson);
    expect(paths).toContain("fixture-lesson.exercise:e3.config.options[0]");
    expect(paths).toContain("fixture-lesson.exercise:e3.config.reveal");
  });
});

describe("custom-exercise coverage cannot be silently bypassed", () => {
  it("has a config handler for every capability any lesson actually uses", () => {
    const used = new Set<string>();
    for (const lesson of lessons) {
      for (const ex of lesson.exercises ?? []) {
        if (ex.type === "custom") used.add(ex.capabilityId);
      }
    }
    const unhandled = [...used].filter((id) => !(id in CUSTOM_CONFIG_PROSE));
    expect(
      unhandled,
      `These custom capabilities have no entry in CUSTOM_CONFIG_PROSE, so any ` +
        `learner-facing strings in their config bypass KaTeX, emphasis and ` +
        `jargon validation entirely. Add a handler (an empty one is fine when ` +
        `the config carries no prose):\n  ${unhandled.join("\n  ")}`,
    ).toEqual([]);
  });

  it("detects an unhandled capability", () => {
    // Proves the check bites rather than trivially passing.
    expect("a-brand-new-capability" in CUSTOM_CONFIG_PROSE).toBe(false);
  });
});
