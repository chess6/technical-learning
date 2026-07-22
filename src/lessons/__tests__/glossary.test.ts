import { describe, expect, it } from "vitest";
import {
  GLOSSARY_BY_ID,
  GLOSSARY_NOTATION_GUIDANCE,
  GLOSSARY_TERMS,
  getGlossaryTerm,
} from "../glossary";
import { getLessonById } from "../registry";
import { isValidIdSyntax } from "../../platform/identity";

const REQUIRED_SEED_IDS = [
  "vector",
  "span",
  "basis",
  "coordinates",
  "linear-transformation",
  "column-space",
  "consistency",
  "independence",
  "invertibility",
  "determinant",
  "eigenvector",
] as const;

describe("glossary data integrity", () => {
  it("seeds the required first-class terms (8–11+)", () => {
    expect(GLOSSARY_TERMS.length).toBeGreaterThanOrEqual(8);
    const ids = new Set(GLOSSARY_TERMS.map((t) => t.id));
    for (const id of REQUIRED_SEED_IDS) {
      expect(ids.has(id)).toBe(true);
    }
  });

  it("uses unique, ConceptId-style slug ids", () => {
    const seen = new Set<string>();
    for (const term of GLOSSARY_TERMS) {
      expect(isValidIdSyntax(term.id)).toBe(true);
      expect(seen.has(term.id)).toBe(false);
      seen.add(term.id);
    }
  });

  it("gives every term a name, precise definition, and intuition", () => {
    for (const term of GLOSSARY_TERMS) {
      expect(term.term.trim().length).toBeGreaterThan(0);
      expect(term.definition.trim().length).toBeGreaterThan(0);
      expect(term.intuition.trim().length).toBeGreaterThan(0);
    }
  });

  it("resolves every prerequisite and related-term reference to a real term", () => {
    for (const term of GLOSSARY_TERMS) {
      for (const ref of [...(term.prerequisites ?? []), ...(term.relatedTerms ?? [])]) {
        expect(GLOSSARY_BY_ID.has(ref)).toBe(true);
        // A term never references itself.
        expect(ref).not.toBe(term.id);
      }
    }
  });

  it("points firstLessonIntroduced at a registered lesson", () => {
    for (const term of GLOSSARY_TERMS) {
      if (term.firstLessonIntroduced) {
        expect(getLessonById(term.firstLessonIntroduced)).toBeDefined();
      }
    }
  });

  it("addresses the object-vs-representation distinction in notation guidance", () => {
    expect(GLOSSARY_NOTATION_GUIDANCE.toLowerCase()).toMatch(/representation/);
    expect(GLOSSARY_NOTATION_GUIDANCE.toLowerCase()).toMatch(/object/);
    // At least the vector and coordinates terms carry a per-term notation note.
    expect(getGlossaryTerm("vector")?.notationNote).toBeTruthy();
    expect(getGlossaryTerm("coordinates")?.notationNote).toBeTruthy();
  });

  it("exposes a lookup map consistent with the ordered list", () => {
    expect(GLOSSARY_BY_ID.size).toBe(GLOSSARY_TERMS.length);
    for (const term of GLOSSARY_TERMS) {
      expect(getGlossaryTerm(term.id)).toBe(term);
    }
  });
});
