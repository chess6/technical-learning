/**
 * Learner-state provider (Package F1) — hydration-safe persistence wiring.
 *
 * Hydration is EXPLICIT and saves are gated on it:
 *   phase "loading" → "ready"     (empty | loaded)    → saves ENABLED
 *   phase "loading" → "read-only" (incompatible | corrupt) → saves DISABLED
 *
 * Nothing is persisted until the initial load resolves, so an empty mount-time
 * state can never be flushed over good stored data. In "read-only" the raw bytes
 * are preserved untouched; the only sanctioned overwrite is an explicit reset.
 *
 * Critical transitions (submit, release, reviewer scoring, scheduler-emission
 * claim) persist SYNCHRONOUSLY; ordinary draft-answer changes are debounced. An
 * immediate reload therefore never loses a completed transition.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  clearLearnerState,
  exportRaw,
  importRaw,
  loadLearnerState,
  saveLearnerState,
  serializeState,
  type LoadOutcome,
} from "./persistence";
import {
  createEmptyLearnerState,
  makeSpacedCohort,
  reconcileSpacedState,
  type AttemptItemResponse,
  type AttemptSet,
  type LearnerState,
  type ReviewRecord,
  type ScheduledSpacedReview,
} from "./learnerState";
import { isPrimarySetId } from "./spacedConfig";
import type { JsonValue } from "./json";

/**
 * The purely-computed spacing outcome the runner hands to `releasePrimaryAttempt`,
 * so release + cohort creation land in ONE atomic transition (never a released
 * first-eligible primary without a seeded-or-failed cohort). Computed off the
 * SINGLE canonical release timestamp.
 */
export type SpacedReleaseOutcome =
  | { kind: "none" }
  | { kind: "seeded"; hint?: JsonValue; occurrences: ScheduledSpacedReview[] }
  | { kind: "failed"; error: string };

const SAVE_DEBOUNCE_MS = 400;

export type HydrationPhase = "loading" | "ready" | "read-only";

export interface LearnerStateContextValue {
  state: LearnerState;
  phase: HydrationPhase;
  readOnly: boolean;
  /** The classified load outcome (for read-only recovery UI). */
  loadOutcome: LoadOutcome | null;
  /**
   * `false` once ANY save has failed (quota exceeded / storage disabled). Sticky
   * — a durable warning, not a transient blip; cleared only by a successful
   * import or an explicit reset. The provider never silently claims persistence.
   */
  saveHealthy: boolean;

  /** Create/replace an attempt set (immediate save — a real transition). */
  startAttemptSet(set: AttemptSet): void;
  /** Upsert a captured answer (debounced — an ordinary draft change). */
  putItemResponse(attemptSetId: string, response: AttemptItemResponse): void;
  /** Freeze answers: status → submitted (immediate save). */
  submitAttemptSet(attemptSetId: string): void;
  /**
   * Release feedback: write graded auto results + pending reviews, status →
   * released (immediate save). Idempotent on an already-released set.
   */
  releaseAttemptSet(
    attemptSetId: string,
    payload: { responses: AttemptItemResponse[]; reviews: ReviewRecord[] },
  ): void;
  /** Reviewer scoring (immediate save). */
  upsertReview(review: ReviewRecord): void;
  /**
   * Atomically claim the scheduler emission for a set: sets `schedulerEmittedAt`
   * iff unset and persists synchronously BEFORE returning. Returns `true` only
   * for the caller that won the claim (at-most-once across rerender/reload).
   * (Retained from F4; the Package H primary-release path uses the module-wide
   * cohort gate in `releasePrimaryAttempt` instead.)
   */
  claimSchedulerEmission(attemptSetId: string): boolean;
  setSchedulerHint(attemptSetId: string, hint: JsonValue): void;

  /**
   * (v3) Release a PRIMARY module attempt AND establish the spacing cohort in ONE
   * atomic transition. `releasedAt` is the single canonical release timestamp
   * (used for the attempt, the cohort anchor, and every occurrence's `dueAt`).
   * The scheduler outcome is computed purely BEFORE the commit. Revalidates the
   * attempt's module + primary-set eligibility + status; writes the cohort only
   * when it is module-wide absent (later releases never re-cohort). Invariant:
   * never a released first-eligible primary without a `seeded`-or-`failed` cohort.
   */
  releasePrimaryAttempt(
    attemptSetId: string,
    moduleId: string,
    releasedAt: string,
    payload: { responses: AttemptItemResponse[]; reviews: ReviewRecord[] },
    outcome: SpacedReleaseOutcome,
    /** (Package I) Present iff a timed set was submitted by the deadline, not the learner. */
    autoSubmittedAt?: string,
  ): void;
  /**
   * (v3) Release a one-item SPACED attempt AND complete its exact occurrence in
   * ONE atomic transition. The occurrence id is DERIVED from the persisted
   * attempt (`scheduledReviewId`), then validated (mapped set, scheduled, due,
   * not already completed); a failed check completes nothing (surfaces a mismatch)
   * rather than writing an inconsistent record.
   */
  releaseSpacedAttempt(
    attemptSetId: string,
    releasedAt: string,
    payload: { responses: AttemptItemResponse[]; reviews: ReviewRecord[] },
  ): void;

  /** Recovery affordances. */
  exportState(): string;
  importState(raw: string): LoadOutcome;
  resetState(): void;
}

const LearnerStateContext = createContext<LearnerStateContextValue | null>(null);

export function LearnerStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LearnerState>(() => createEmptyLearnerState());
  const [phase, setPhase] = useState<HydrationPhase>("loading");
  const [loadOutcome, setLoadOutcome] = useState<LoadOutcome | null>(null);
  // Sticky: set on the first failed save, surfaced as a durable warning.
  const [saveFailed, setSaveFailed] = useState(false);

  // A synchronous mirror of the latest state so atomic claims (scheduler
  // emission) can read-modify-write without waiting for a React re-render.
  const stateRef = useRef(state);
  const phaseRef = useRef(phase);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Hydrate once, before any save is armed.
  useEffect(() => {
    const outcome = loadLearnerState();
    setLoadOutcome(outcome);
    if (outcome.kind === "loaded") {
      stateRef.current = outcome.state;
      setState(outcome.state);
      setPhase("ready");
    } else if (outcome.kind === "empty") {
      setPhase("ready");
    } else {
      // incompatible | corrupt → in-memory session, but never persist over it.
      setPhase("read-only");
    }
  }, []);

  // Flush any pending debounced save on unmount.
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        if (phaseRef.current === "ready") saveLearnerState(stateRef.current);
      }
    };
  }, []);

  const noteSave = useCallback((ok: boolean) => {
    if (!ok) setSaveFailed(true);
  }, []);

  const persist = useCallback(
    (next: LearnerState, immediate: boolean) => {
      if (phaseRef.current !== "ready") return; // read-only / loading → never write
      if (immediate) {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
          debounceRef.current = null;
        }
        noteSave(saveLearnerState(next));
        return;
      }
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        noteSave(saveLearnerState(stateRef.current));
      }, SAVE_DEBOUNCE_MS);
    },
    [noteSave],
  );

  const commit = useCallback(
    (updater: (prev: LearnerState) => LearnerState, immediate: boolean): LearnerState => {
      const next = updater(stateRef.current);
      stateRef.current = next;
      setState(next);
      persist(next, immediate);
      return next;
    },
    [persist],
  );

  const startAttemptSet = useCallback(
    (set: AttemptSet) => {
      commit(
        (prev) => ({ ...prev, attemptSets: { ...prev.attemptSets, [set.id]: set } }),
        true,
      );
    },
    [commit],
  );

  const putItemResponse = useCallback(
    (attemptSetId: string, response: AttemptItemResponse) => {
      commit((prev) => {
        const set = prev.attemptSets[attemptSetId];
        if (!set) return prev;
        const responses = [
          ...set.responses.filter((r) => r.exerciseId !== response.exerciseId),
          response,
        ];
        return {
          ...prev,
          attemptSets: { ...prev.attemptSets, [attemptSetId]: { ...set, responses } },
        };
      }, false);
    },
    [commit],
  );

  const submitAttemptSet = useCallback(
    (attemptSetId: string) => {
      commit((prev) => {
        const set = prev.attemptSets[attemptSetId];
        if (!set || set.status !== "in-progress") return prev;
        return {
          ...prev,
          attemptSets: {
            ...prev.attemptSets,
            [attemptSetId]: {
              ...set,
              status: "submitted",
              submittedAt: new Date().toISOString(),
            },
          },
        };
      }, true);
    },
    [commit],
  );

  const releaseAttemptSet = useCallback(
    (
      attemptSetId: string,
      payload: { responses: AttemptItemResponse[]; reviews: ReviewRecord[] },
    ) => {
      commit((prev) => {
        const set = prev.attemptSets[attemptSetId];
        if (!set || set.status === "released") return prev; // idempotent
        const reviews = { ...prev.reviews };
        for (const review of payload.reviews) reviews[review.id] = review;
        return {
          ...prev,
          reviews,
          attemptSets: {
            ...prev.attemptSets,
            [attemptSetId]: {
              ...set,
              status: "released",
              releasedAt: new Date().toISOString(),
              responses: payload.responses,
            },
          },
        };
      }, true);
    },
    [commit],
  );

  const upsertReview = useCallback(
    (review: ReviewRecord) => {
      commit(
        (prev) => ({ ...prev, reviews: { ...prev.reviews, [review.id]: review } }),
        true,
      );
    },
    [commit],
  );

  const claimSchedulerEmission = useCallback(
    (attemptSetId: string): boolean => {
      const set = stateRef.current.attemptSets[attemptSetId];
      if (!set || set.schedulerEmittedAt) return false;
      commit(
        (prev) => {
          const target = prev.attemptSets[attemptSetId];
          if (!target || target.schedulerEmittedAt) return prev;
          return {
            ...prev,
            attemptSets: {
              ...prev.attemptSets,
              [attemptSetId]: { ...target, schedulerEmittedAt: new Date().toISOString() },
            },
          };
        },
        true,
      );
      return true;
    },
    [commit],
  );

  const setSchedulerHint = useCallback<LearnerStateContextValue["setSchedulerHint"]>(
    (attemptSetId, hint) => {
      commit((prev) => {
        const set = prev.attemptSets[attemptSetId];
        if (!set) return prev;
        return {
          ...prev,
          attemptSets: { ...prev.attemptSets, [attemptSetId]: { ...set, schedulerHint: hint } },
        };
      }, true);
    },
    [commit],
  );

  const releasePrimaryAttempt = useCallback<LearnerStateContextValue["releasePrimaryAttempt"]>(
    (attemptSetId, moduleId, releasedAt, payload, outcome, autoSubmittedAt) => {
      commit((prev) => {
        const set = prev.attemptSets[attemptSetId];
        if (!set || set.status === "released") return prev; // idempotent
        if (set.status !== "submitted") return prev; // revalidate status
        // Always release the attempt with the canonical timestamp.
        const reviews = { ...prev.reviews };
        for (const review of payload.reviews) reviews[review.id] = review;
        const released: AttemptSet = {
          ...set,
          status: "released",
          releasedAt,
          responses: payload.responses,
        };
        if (autoSubmittedAt) released.autoSubmittedAt = autoSubmittedAt;

        let spacedReviews = prev.spacedReviews;
        let spacedCohorts = prev.spacedCohorts;

        // Module-wide gate: only the FIRST eligible primary release seeds/fails.
        const eligible = set.moduleId === moduleId && isPrimarySetId(set.setId);
        const cohortAbsent = !prev.spacedCohorts[moduleId];
        if (eligible && cohortAbsent && outcome.kind !== "none") {
          released.schedulerEmittedAt = releasedAt; // rerender guard
          if (outcome.kind === "seeded") {
            // Validate the computed schedule through the SAME integrity pass the
            // normalizer uses: build a trial and require the cohort stays seeded.
            const trialReviews: Record<string, ScheduledSpacedReview> = {};
            for (const occ of outcome.occurrences) trialReviews[occ.id] = occ;
            const trial = reconcileSpacedState({
              attemptSets: { ...prev.attemptSets, [attemptSetId]: released },
              spacedReviews: trialReviews,
              spacedCohorts: {
                [moduleId]: makeSpacedCohort({
                  moduleId,
                  status: "seeded",
                  anchorAttemptSetId: attemptSetId,
                  anchorReleasedAt: releasedAt,
                }),
              },
            });
            if (trial.spacedCohorts[moduleId]?.status === "seeded") {
              spacedCohorts = { ...prev.spacedCohorts, ...trial.spacedCohorts };
              spacedReviews = { ...prev.spacedReviews, ...trial.spacedReviews };
              if (outcome.hint !== undefined) released.schedulerHint = outcome.hint;
            } else {
              spacedCohorts = {
                ...prev.spacedCohorts,
                [moduleId]: makeSpacedCohort({
                  moduleId,
                  status: "failed",
                  anchorAttemptSetId: attemptSetId,
                  anchorReleasedAt: releasedAt,
                  failedAt: releasedAt,
                  error: "invalid computed schedule",
                }),
              };
            }
          } else {
            spacedCohorts = {
              ...prev.spacedCohorts,
              [moduleId]: makeSpacedCohort({
                moduleId,
                status: "failed",
                anchorAttemptSetId: attemptSetId,
                anchorReleasedAt: releasedAt,
                failedAt: releasedAt,
                error: outcome.error,
              }),
            };
          }
        }

        return {
          ...prev,
          reviews,
          attemptSets: { ...prev.attemptSets, [attemptSetId]: released },
          spacedReviews,
          spacedCohorts,
        };
      }, true);
    },
    [commit],
  );

  const releaseSpacedAttempt = useCallback<LearnerStateContextValue["releaseSpacedAttempt"]>(
    (attemptSetId, releasedAt, payload) => {
      commit((prev) => {
        const set = prev.attemptSets[attemptSetId];
        if (!set || set.status === "released") return prev; // idempotent
        if (set.status !== "submitted") return prev; // revalidate status
        const reviews = { ...prev.reviews };
        for (const review of payload.reviews) reviews[review.id] = review;
        const released: AttemptSet = {
          ...set,
          status: "released",
          releasedAt,
          responses: payload.responses,
        };
        // Derive the occurrence from the persisted attempt; complete it only when
        // fully valid (mapped set, scheduled, due, not already completed).
        let spacedReviews = prev.spacedReviews;
        const reviewId = set.scheduledReviewId;
        const occ = reviewId ? prev.spacedReviews[reviewId] : undefined;
        const due = occ && Number.isFinite(Date.parse(occ.dueAt))
          ? Date.parse(releasedAt) >= Date.parse(occ.dueAt)
          : false;
        if (
          reviewId &&
          occ &&
          occ.setId === set.setId &&
          occ.status === "scheduled" &&
          !occ.completedInAttemptSetId &&
          due
        ) {
          spacedReviews = {
            ...prev.spacedReviews,
            [reviewId]: { ...occ, status: "completed", completedInAttemptSetId: attemptSetId },
          };
        }
        return {
          ...prev,
          reviews,
          attemptSets: { ...prev.attemptSets, [attemptSetId]: released },
          spacedReviews,
        };
      }, true);
    },
    [commit],
  );

  const exportState = useCallback(() => {
    // In read-only recovery (corrupt / newer-schema) the in-memory session is a
    // throwaway; the untouched RAW bytes are the thing worth preserving.
    if (phaseRef.current === "read-only") {
      return exportRaw() ?? serializeState(stateRef.current);
    }
    // Otherwise the in-memory state is the source of truth. After a save failure
    // storage holds STALE bytes, so Export must serialize the live state so the
    // unsaved critical transition is captured — never the stale raw bytes.
    return serializeState(stateRef.current);
  }, []);

  const importState = useCallback(
    (raw: string): LoadOutcome => {
      const outcome = importRaw(raw);
      if (outcome.kind === "loaded") {
        stateRef.current = outcome.state;
        setState(outcome.state);
        setPhase("ready");
        setLoadOutcome(outcome);
        const ok = saveLearnerState(outcome.state);
        setSaveFailed(!ok);
      }
      return outcome;
    },
    [],
  );

  const resetState = useCallback(() => {
    const fresh = createEmptyLearnerState();
    stateRef.current = fresh;
    setState(fresh);
    setPhase("ready");
    setLoadOutcome({ kind: "empty" });
    clearLearnerState();
    const ok = saveLearnerState(fresh);
    setSaveFailed(!ok);
  }, []);

  const value = useMemo<LearnerStateContextValue>(
    () => ({
      state,
      phase,
      readOnly: phase === "read-only",
      loadOutcome,
      saveHealthy: !saveFailed,
      startAttemptSet,
      putItemResponse,
      submitAttemptSet,
      releaseAttemptSet,
      upsertReview,
      claimSchedulerEmission,
      setSchedulerHint,
      releasePrimaryAttempt,
      releaseSpacedAttempt,
      exportState,
      importState,
      resetState,
    }),
    [
      state,
      phase,
      loadOutcome,
      saveFailed,
      startAttemptSet,
      putItemResponse,
      submitAttemptSet,
      releaseAttemptSet,
      upsertReview,
      claimSchedulerEmission,
      setSchedulerHint,
      releasePrimaryAttempt,
      releaseSpacedAttempt,
      exportState,
      importState,
      resetState,
    ],
  );

  return <LearnerStateContext.Provider value={value}>{children}</LearnerStateContext.Provider>;
}

export function useLearnerState(): LearnerStateContextValue {
  const ctx = useContext(LearnerStateContext);
  if (!ctx) {
    throw new Error("useLearnerState must be used within a LearnerStateProvider");
  }
  return ctx;
}
