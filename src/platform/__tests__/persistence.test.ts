import { afterEach, describe, expect, it, vi } from "vitest";
import { SCHEMA_VERSION } from "../identity";
import { createEmptyLearnerState } from "../learnerState";
import {
  STORAGE_KEY,
  classifyRaw,
  clearLearnerState,
  exportRaw,
  importRaw,
  loadLearnerState,
  saveLearnerState,
} from "../persistence";

afterEach(() => {
  localStorage.clear();
});

describe("loadLearnerState classification", () => {
  it("returns empty when nothing is stored", () => {
    expect(loadLearnerState()).toEqual({ kind: "empty" });
  });

  it("loads + migrates a stored, well-formed blob", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ schemaVersion: 1, lessonProgress: {}, exerciseAttempts: {}, bookmarks: [] }),
    );
    const outcome = loadLearnerState();
    expect(outcome.kind).toBe("loaded");
    if (outcome.kind === "loaded") {
      expect(outcome.state.schemaVersion).toBe(SCHEMA_VERSION);
      expect(outcome.state.attemptSets).toEqual({});
    }
  });

  it("classifies unparseable bytes as corrupt and preserves the raw", () => {
    localStorage.setItem(STORAGE_KEY, "{not json");
    const outcome = loadLearnerState();
    expect(outcome.kind).toBe("corrupt");
    if (outcome.kind === "corrupt") expect(outcome.raw).toBe("{not json");
  });

  it("refuses a newer schema (incompatible) rather than migrating/overwriting", () => {
    const newer = JSON.stringify({ schemaVersion: SCHEMA_VERSION + 5 });
    localStorage.setItem(STORAGE_KEY, newer);
    const outcome = loadLearnerState();
    expect(outcome.kind).toBe("incompatible");
    if (outcome.kind === "incompatible") {
      expect(outcome.reason).toBe("newer-schema");
      expect(outcome.raw).toBe(newer);
    }
    // The bytes must be untouched.
    expect(localStorage.getItem(STORAGE_KEY)).toBe(newer);
  });
});

describe("saveLearnerState / clear / export", () => {
  it("persists a state that reloads identically", () => {
    const state = createEmptyLearnerState();
    expect(saveLearnerState(state)).toBe(true);
    const outcome = loadLearnerState();
    expect(outcome.kind).toBe("loaded");
    if (outcome.kind === "loaded") expect(outcome.state).toEqual(state);
  });

  it("exports the raw stored bytes and clears them", () => {
    const state = createEmptyLearnerState();
    saveLearnerState(state);
    expect(exportRaw()).toBe(JSON.stringify(state));
    clearLearnerState();
    expect(exportRaw()).toBeNull();
  });

  it("returns false (does not throw) when storage rejects the write", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    expect(saveLearnerState(createEmptyLearnerState())).toBe(false);
    spy.mockRestore();
  });
});

describe("importRaw", () => {
  it("classifies an uploaded blob without writing storage", () => {
    const outcome = importRaw(JSON.stringify({ schemaVersion: 1 }));
    expect(outcome.kind).toBe("loaded");
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("shares classification logic with classifyRaw", () => {
    expect(classifyRaw("nope").kind).toBe("corrupt");
  });
});
