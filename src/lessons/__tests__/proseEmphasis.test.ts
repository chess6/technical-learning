import { describe, expect, it } from "vitest";
import { lessons } from "../registry";
import { MODULE_ITEMS } from "../moduleItems";
import { collectLessonProse, type ProseString } from "./lessonProse";

/**
 * Guards the failure mode documented in
 * `docs/quality/known-failure-modes.md` § "A `**bold**` span that straddles
 * inline math silently loses its markers".
 *
 * `ProseWithMath` extracts every `$...$` token from the whole string FIRST,
 * then looks for `**bold**` / `*italic*` markers independently in each text
 * segment *between* math tokens. So a bold span whose opening and closing
 * markers land in two different segments can never be paired: each segment
 * sees one lone marker, finds no partner, and emits the literal asterisks as
 * plain text. It throws nothing — the learner just sees `**` on the page.
 *
 * This replicates that exact parsing order rather than pattern-matching the
 * source, and it runs over RUNTIME strings, so concatenated prose is checked
 * as the learner receives it.
 */

/** Split on `$...$` exactly as `ProseWithMath.splitMath` does. */
function nonMathSegments(text: string): string[] {
  const pattern = /\$([^$]+)\$/g;
  const segments: string[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    segments.push(text.slice(last, match.index));
    last = match.index + match[0].length;
  }
  segments.push(text.slice(last));
  return segments;
}

/**
 * A segment is clean when removing every *pairable* marker leaves no `*`
 * behind — mirroring `splitEmphasis`'s `**bold**` alternative-first regex.
 * A leftover `*` is a marker whose partner is on the far side of a math
 * token, i.e. one that will render literally.
 */
function strandedMarker(segment: string): boolean {
  return segment
    .replace(/\*\*([^*]+)\*\*|\*([^*]+)\*/g, "")
    .includes("*");
}

function offenders(strings: readonly ProseString[]): string[] {
  return strings
    .filter(({ text }) => nonMathSegments(text).some(strandedMarker))
    .map(({ path, text }) => `  ${path}\n    ${text.slice(0, 160)}`);
}

describe("emphasis markers never straddle inline math", () => {
  it("holds for every learner-facing prose string in every lesson", () => {
    const problems = lessons.flatMap((lesson) =>
      offenders(collectLessonProse(lesson)),
    );
    expect(
      problems,
      `Emphasis markers stranded by a $...$ token — these render as literal ` +
        `asterisks. Keep each **bold** span inside one text run:\n${problems.join("\n")}`,
    ).toEqual([]);
  });

  it("holds for module-owned assessment items too", () => {
    // Module items are learner-facing but live outside `lessons`, so the
    // lesson walker never sees them.
    const strings: ProseString[] = MODULE_ITEMS.flatMap((item) => {
      const p = `moduleItem:${item.id}`;
      const out: ProseString[] = [{ path: `${p}.prompt`, text: item.prompt }];
      if (item.type === "multiple-choice") {
        item.choices.forEach((c, i) =>
          out.push({ path: `${p}.choices[${i}]`, text: c }),
        );
        out.push({ path: `${p}.explanation`, text: item.explanation });
      }
      return out;
    });
    const problems = offenders(strings);
    expect(problems, problems.join("\n")).toEqual([]);
  });

  it("detects a stranded marker, and accepts a correctly-scoped one", () => {
    // Proves the check bites rather than trivially passing.
    const stranded = "**The images $A\\mathbf{w}_j$ span the space:** and so on.";
    const scoped = "**The images span the space:** $A\\mathbf{w}_j$ and so on.";
    expect(offenders([{ path: "x", text: stranded }])).toHaveLength(1);
    expect(offenders([{ path: "x", text: scoped }])).toHaveLength(0);
  });
});

/**
 * Guards the sibling failure mode documented in
 * `docs/quality/known-failure-modes.md` § "`$$display$$` math in prose inverts
 * every span after it".
 *
 * `ProseWithMath` understands ONE delimiter: `$...$`. Its pattern
 * (`/\$([^$]+)\$/g`) cannot match `$$`, so a `$$display$$` block leaves one
 * unconsumed `$` behind. That orphan becomes the OPENING delimiter of the next
 * span, and from there every math/text boundary is off by one for the rest of
 * the string: prose renders as garbled math and LaTeX renders as literal text.
 * Nothing throws. Found live in `chain-rule`'s "The honest repair" section,
 * where the entire remainder of the derivation was inverted.
 *
 * Display math belongs in a structural slot (`LessonSection.equation`,
 * `EquationSequence`), never in a prose string.
 */
function hasDoubleDollar(text: string): boolean {
  return text.includes("$$");
}

describe("prose never contains $$ display-math delimiters", () => {
  it("holds for every learner-facing prose string in every lesson", () => {
    const problems = lessons.flatMap((lesson) =>
      collectLessonProse(lesson)
        .filter(({ text }) => hasDoubleDollar(text))
        .map(({ path, text }) => `  ${path}\n    ${text.slice(0, 160)}`),
    );
    expect(
      problems,
      `"$$" found in prose. ProseWithMath only parses $...$; a $$ block ` +
        `orphans one delimiter and inverts every span after it. Move display ` +
        `math into a structural slot (section.equation / EquationSequence):\n${problems.join("\n")}`,
    ).toEqual([]);
  });

  it("detects a $$ block, and accepts inline math", () => {
    // Proves the check bites rather than trivially passing.
    expect(hasDoubleDollar("and\n$$f(x) = y.$$\nThen $h$ works.")).toBe(true);
    expect(hasDoubleDollar("and $f(x) = y$. Then $h$ works.")).toBe(false);
  });
});

/**
 * A cheaper, more general guard for the same root cause: `ProseWithMath`
 * pairs `$` characters left to right with no concept of "this one is
 * escaped" or "this one is a literal dollar sign, not a delimiter." ANY odd
 * number of `$` in a prose string — not just a `$$` block — leaves one
 * unpaired, and from that point every span boundary for the rest of the
 * string is wrong, the same silent-not-thrown failure the `$$` guard above
 * documents. A stray currency sign ("costs $5 to run") would trigger this
 * exactly as a `$$` block does.
 *
 * A repo-wide scan confirmed this branch currently has zero such strings
 * (2026-08) — this guard exists so the next one is caught before it ships,
 * not found later by an owner reading the rendered page.
 */
function hasUnpairedDollar(text: string): boolean {
  return (text.match(/\$/g)?.length ?? 0) % 2 !== 0;
}

describe("prose never contains an unpaired $ (odd count)", () => {
  it("holds for every learner-facing prose string in every lesson", () => {
    const problems = lessons.flatMap((lesson) =>
      collectLessonProse(lesson)
        .filter(({ text }) => hasUnpairedDollar(text))
        .map(({ path, text }) => `  ${path}\n    ${text.slice(0, 160)}`),
    );
    expect(
      problems,
      `An odd number of "$" found in prose — one is unpaired, and every math/text ` +
        `boundary after it will be wrong. Escape a literal dollar sign, or pair the math:\n${problems.join("\n")}`,
    ).toEqual([]);
  });

  it("detects an unpaired $, and accepts correctly paired math", () => {
    // Proves the check bites rather than trivially passing.
    expect(hasUnpairedDollar("It costs $5 to run this, and $E=mc^2$ too.")).toBe(true);
    expect(hasUnpairedDollar("This costs a lot, and $E=mc^2$ too.")).toBe(false);
  });
});
