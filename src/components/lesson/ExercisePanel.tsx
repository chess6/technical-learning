import { useState, type ReactElement } from "react";
import type { ExerciseDefinition } from "../../lessons/types";
import { gradeExercise, type GradeResult } from "../../lessons/grading";
import {
  resolveCapabilityId,
  type CommittedPredictionConfig,
} from "../../lessons/capabilities";
import { ProseWithMath } from "./ProseWithMath";
import { SolutionReveal } from "./SolutionReveal";
import "./ExercisePanel.css";

type ExercisePanelProps = {
  exercises: ExerciseDefinition[];
};

const TIER_LABEL: Record<string, string> = {
  check: "Check",
  drill: "Drill",
  transfer: "Transfer",
};

/* --------------------------------------------------------------------------
 * Render-capability registry (the UI half of a capability).
 *
 * Each capability owns its OWN typed draft (no shared mega-draft / unrestricted
 * bag): the panel stores drafts opaquely keyed by exercise id and hands each
 * capability its typed draft. Grading + answer serialization live in the pure
 * `capabilities.ts`; only rendering lives here, keyed by the same capability id.
 * ------------------------------------------------------------------------ */

type SummaryState = "correct" | "incorrect" | "reviewed";

type CapabilityBodyProps<D> = {
  exercise: ExerciseDefinition;
  draft: D;
  result: GradeResult | null;
  setDraft: (draft: D) => void;
  setResult: (result: GradeResult | null) => void;
};

type RenderCapability<D> = {
  emptyDraft: () => D;
  isAttempted: (
    exercise: ExerciseDefinition,
    draft: D,
    result: GradeResult | null,
  ) => boolean;
  summaryState: (
    exercise: ExerciseDefinition,
    draft: D,
    result: GradeResult | null,
  ) => SummaryState;
  Body: (props: CapabilityBodyProps<D>) => ReactElement | null;
};

function defineCapability<D>(cap: RenderCapability<D>): RenderCapability<unknown> {
  return cap as unknown as RenderCapability<unknown>;
}

const gradedSummary =
  () =>
  (
    _exercise: ExerciseDefinition,
    _draft: unknown,
    result: GradeResult | null,
  ): SummaryState => (result?.correct ? "correct" : "incorrect");

const attemptedWhenResult = (
  _exercise: ExerciseDefinition,
  _draft: unknown,
  result: GradeResult | null,
): boolean => Boolean(result);

type MultipleChoiceDraft = { choice: number | null };
type NumericDraft = { value: string };
type VectorDraft = { x: string; y: string };
type EigenvalueDraft = { lambdas: string };
type PredictionDraft = { revealed: boolean };
type CommittedPredictionDraft = { committedIndex: number | null; submitted: boolean };

const renderCapabilities: Record<string, RenderCapability<unknown>> = {
  "multiple-choice": defineCapability<MultipleChoiceDraft>({
    emptyDraft: () => ({ choice: null }),
    isAttempted: attemptedWhenResult,
    summaryState: gradedSummary(),
    Body: MultipleChoiceBody,
  }),
  numeric: defineCapability<NumericDraft>({
    emptyDraft: () => ({ value: "" }),
    isAttempted: attemptedWhenResult,
    summaryState: gradedSummary(),
    Body: NumericBody,
  }),
  vector: defineCapability<VectorDraft>({
    emptyDraft: () => ({ x: "", y: "" }),
    isAttempted: attemptedWhenResult,
    summaryState: gradedSummary(),
    Body: VectorBody,
  }),
  eigenvalue: defineCapability<EigenvalueDraft>({
    emptyDraft: () => ({ lambdas: "" }),
    isAttempted: attemptedWhenResult,
    summaryState: gradedSummary(),
    Body: EigenvalueBody,
  }),
  prediction: defineCapability<PredictionDraft>({
    emptyDraft: () => ({ revealed: false }),
    isAttempted: (_exercise, draft) => draft.revealed,
    summaryState: () => "reviewed",
    Body: PredictionBody,
  }),
  "committed-prediction": defineCapability<CommittedPredictionDraft>({
    emptyDraft: () => ({ committedIndex: null, submitted: false }),
    isAttempted: (_exercise, draft) => draft.submitted,
    summaryState: (exercise, _draft, result) => {
      const config = exercise.type === "custom" ? (exercise.config as CommittedPredictionConfig | undefined) : undefined;
      if (config && typeof config.correctIndex === "number") {
        return result?.correct ? "correct" : "incorrect";
      }
      return "reviewed";
    },
    Body: CommittedPredictionBody,
  }),
};

function getRenderCapability(
  exercise: ExerciseDefinition,
): RenderCapability<unknown> | undefined {
  return renderCapabilities[resolveCapabilityId(exercise)];
}

/**
 * Interactive, deterministic exercises shown one at a time.
 * Answer state is lifted here so learners can move Next / Previous and
 * revisit earlier questions without losing their work, and so a compact
 * completed-summary can appear once every question has been attempted.
 *
 * Interactions are resolved through the capability registry above rather than a
 * hardcoded switch — new interactions register a capability instead of editing
 * this component.
 */
export function ExercisePanel({ exercises }: ExercisePanelProps) {
  const [current, setCurrent] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, unknown>>({});
  const [results, setResults] = useState<Record<string, GradeResult | null>>({});
  const [hintIndices, setHintIndices] = useState<Record<string, number>>({});

  const total = exercises.length;
  const exercise = exercises[current];

  const capabilityFor = (ex: ExerciseDefinition) => getRenderCapability(ex);
  const draftFor = (ex: ExerciseDefinition): unknown => {
    const capability = capabilityFor(ex);
    return drafts[ex.id] ?? capability?.emptyDraft();
  };
  const setDraft = (id: string, next: unknown) =>
    setDrafts((prev) => ({ ...prev, [id]: next }));
  const setResult = (id: string, result: GradeResult | null) =>
    setResults((prev) => ({ ...prev, [id]: result }));

  const isAttempted = (ex: ExerciseDefinition): boolean => {
    const capability = capabilityFor(ex);
    if (!capability) return false;
    return capability.isAttempted(ex, draftFor(ex), results[ex.id] ?? null);
  };

  const attemptedCount = exercises.filter(isAttempted).length;
  const allAttempted = attemptedCount === total && total > 0;

  const go = (delta: number) =>
    setCurrent((c) => Math.min(Math.max(c + delta, 0), total - 1));

  if (!exercise) return null;

  const capability = capabilityFor(exercise);
  const tier = exercise.tier;
  const hintIndex = hintIndices[exercise.id] ?? 0;

  return (
    <section className="exercise-panel" role="region" aria-label="Practice exercises">
      <div className="exercise-panel__progress">
        <p className="exercise-panel__count" aria-live="polite">
          Question {current + 1} of {total}
          {tier && (
            <span className="exercise-panel__tier" data-tier={tier}>
              {" "}
              · {TIER_LABEL[tier] ?? tier}
            </span>
          )}
        </p>
        <ol className="exercise-panel__dots" aria-hidden="true">
          {exercises.map((ex, index) => (
            <li
              key={ex.id}
              className="exercise-panel__dot"
              data-active={index === current}
              data-done={isAttempted(ex)}
              data-tier={ex.tier}
            />
          ))}
        </ol>
      </div>

      <div className="exercise-panel__card" key={exercise.id}>
        <p className="exercise-panel__prompt">
          <ProseWithMath text={exercise.prompt} />
        </p>
        <HintControls
          exercise={exercise}
          hintIndex={hintIndex}
          onShowMore={() =>
            setHintIndices((prev) => ({
              ...prev,
              [exercise.id]: (prev[exercise.id] ?? 0) + 1,
            }))
          }
        />
        {capability ? (
          <capability.Body
            exercise={exercise}
            draft={draftFor(exercise)}
            result={results[exercise.id] ?? null}
            setDraft={(next) => setDraft(exercise.id, next)}
            setResult={(result) => setResult(exercise.id, result)}
          />
        ) : (
          <p className="exercise-panel__feedback" data-state="incorrect">
            This exercise type is unavailable.
          </p>
        )}
      </div>

      <div className="exercise-panel__nav">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => go(-1)}
          disabled={current === 0}
        >
          ← Previous
        </button>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => go(1)}
          disabled={current === total - 1}
        >
          Next question →
        </button>
      </div>

      {allAttempted && (
        <div className="exercise-panel__summary" role="status">
          <h3 className="exercise-panel__summary-title">Nice work — you tried all {total}.</h3>
          <ol className="exercise-panel__summary-list">
            {exercises.map((ex, index) => {
              const cap = capabilityFor(ex);
              const state = cap
                ? cap.summaryState(ex, draftFor(ex), results[ex.id] ?? null)
                : "incorrect";
              return (
                <li key={ex.id} className="exercise-panel__summary-item" data-state={state}>
                  <button
                    type="button"
                    className="exercise-panel__summary-link"
                    onClick={() => setCurrent(index)}
                  >
                    <span className="exercise-panel__summary-index">Q{index + 1}</span>
                    <span className="exercise-panel__summary-label">
                      {state === "correct"
                        ? "Correct"
                        : state === "incorrect"
                          ? "Revisit"
                          : "Reviewed"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </section>
  );
}

function HintControls({
  exercise,
  hintIndex,
  onShowMore,
}: {
  exercise: ExerciseDefinition;
  hintIndex: number;
  onShowMore: () => void;
}) {
  const hints = exercise.hints ?? [];
  if (hints.length === 0) return null;
  const shown = hints.slice(0, hintIndex);
  const hasMore = hintIndex < hints.length;
  return (
    <div className="exercise-panel__hints">
      {shown.map((hint, index) => (
        <p key={index} className="exercise-panel__hint">
          <span className="exercise-panel__hint-label">Hint {index + 1}.</span>{" "}
          <ProseWithMath text={hint} />
        </p>
      ))}
      {hasMore && (
        <button type="button" className="btn btn--ghost" onClick={onShowMore}>
          Show hint
        </button>
      )}
    </div>
  );
}

function Feedback({
  result,
  exercise,
}: {
  result: GradeResult | null;
  exercise: ExerciseDefinition;
}) {
  if (!result) {
    return (
      <p
        className="exercise-panel__feedback"
        role="status"
        aria-live="polite"
        data-state="idle"
      />
    );
  }

  const reveal =
    result.solutionReveal ??
    ("solutionReveal" in exercise ? exercise.solutionReveal : undefined);
  const compact = exercise.tier === "drill" || exercise.tier === "check";

  return (
    <div className="exercise-panel__feedback-block">
      <p
        className="exercise-panel__feedback"
        role="status"
        aria-live="polite"
        data-state={result.correct ? "correct" : "incorrect"}
      >
        <ProseWithMath text={result.feedback} />
      </p>
      {reveal && <SolutionReveal reveal={reveal} compact={compact} />}
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Bodies (one per capability). Each reads/writes only its own typed draft.
 * ------------------------------------------------------------------------ */

function MultipleChoiceBody({
  exercise,
  draft,
  result,
  setDraft,
  setResult,
}: CapabilityBodyProps<MultipleChoiceDraft>) {
  if (exercise.type !== "multiple-choice") return null;
  const selected = draft.choice;

  const choose = (choice: number) => {
    setDraft({ choice });
    setResult(gradeExercise(exercise, { kind: "multiple-choice", choice }));
  };

  return (
    <>
      <ul className="exercise-panel__choices">
        {exercise.choices.map((choice, index) => {
          const isSelected = selected === index;
          const isCorrect = index === exercise.correctChoice;
          const state =
            selected === null || selected === undefined
              ? undefined
              : isCorrect
                ? "correct"
                : isSelected
                  ? "incorrect"
                  : undefined;
          return (
            <li key={`${exercise.id}-${index}`}>
              <button
                type="button"
                className="exercise-panel__choice"
                aria-pressed={isSelected}
                data-state={state}
                data-choice-index={index}
                onClick={() => choose(index)}
              >
                <span className="exercise-panel__choice-letter" aria-hidden="true">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="exercise-panel__choice-math">
                  <ProseWithMath text={choice} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <Feedback result={result} exercise={exercise} />
    </>
  );
}

function NumericBody({
  exercise,
  draft,
  result,
  setDraft,
  setResult,
}: CapabilityBodyProps<NumericDraft>) {
  if (exercise.type !== "numeric") return null;
  const check = () => {
    const parsed = Number(draft.value);
    if (draft.value.trim() === "" || Number.isNaN(parsed)) {
      setResult({ correct: false, feedback: "Enter a number to check." });
      return;
    }
    setResult(gradeExercise(exercise, { kind: "numeric", value: parsed }));
  };

  return (
    <form
      className="exercise-panel__answer"
      onSubmit={(event) => {
        event.preventDefault();
        check();
      }}
    >
      <label className="exercise-panel__field">
        <span className="sr-only">Numeric answer</span>
        <input
          type="number"
          step="any"
          inputMode="decimal"
          value={draft.value}
          onChange={(event) => setDraft({ value: event.target.value })}
        />
      </label>
      <button type="submit" className="btn">
        Check answer
      </button>
      <Feedback result={result} exercise={exercise} />
    </form>
  );
}

function VectorBody({
  exercise,
  draft,
  result,
  setDraft,
  setResult,
}: CapabilityBodyProps<VectorDraft>) {
  if (exercise.type !== "vector") return null;
  const check = () => {
    const px = Number(draft.x);
    const py = Number(draft.y);
    if (
      draft.x.trim() === "" ||
      draft.y.trim() === "" ||
      Number.isNaN(px) ||
      Number.isNaN(py)
    ) {
      setResult({ correct: false, feedback: "Enter both coordinates to check." });
      return;
    }
    setResult(gradeExercise(exercise, { kind: "vector", value: [px, py] }));
  };

  return (
    <form
      className="exercise-panel__answer"
      onSubmit={(event) => {
        event.preventDefault();
        check();
      }}
    >
      <label className="exercise-panel__field">
        <span className="exercise-panel__field-label">x</span>
        <input
          type="number"
          step="any"
          aria-label="x coordinate"
          value={draft.x}
          onChange={(event) => setDraft({ ...draft, x: event.target.value })}
        />
      </label>
      <label className="exercise-panel__field">
        <span className="exercise-panel__field-label">y</span>
        <input
          type="number"
          step="any"
          aria-label="y coordinate"
          value={draft.y}
          onChange={(event) => setDraft({ ...draft, y: event.target.value })}
        />
      </label>
      <button type="submit" className="btn">
        Check answer
      </button>
      <Feedback result={result} exercise={exercise} />
    </form>
  );
}

function EigenvalueBody({
  exercise,
  draft,
  result,
  setDraft,
  setResult,
}: CapabilityBodyProps<EigenvalueDraft>) {
  if (exercise.type !== "eigenvalue") return null;
  const check = () => {
    const parts = draft.lambdas
      .split(/[,\s]+/)
      .map((part) => part.trim())
      .filter(Boolean)
      .map(Number);
    if (parts.length === 0 || parts.some((n) => Number.isNaN(n))) {
      setResult({
        correct: false,
        feedback: "Enter one or more eigenvalues, separated by commas.",
      });
      return;
    }
    setResult(
      gradeExercise(exercise, {
        kind: "eigenvalue",
        value: parts.length === 1 ? parts[0]! : parts,
      }),
    );
  };

  return (
    <form
      className="exercise-panel__answer"
      onSubmit={(event) => {
        event.preventDefault();
        check();
      }}
    >
      <label className="exercise-panel__field">
        <span className="sr-only">Eigenvalue(s)</span>
        <input
          type="text"
          inputMode="decimal"
          placeholder="e.g. 2, 3"
          aria-label="Eigenvalues"
          value={draft.lambdas}
          onChange={(event) => setDraft({ lambdas: event.target.value })}
        />
      </label>
      <button type="submit" className="btn">
        Check answer
      </button>
      <Feedback result={result} exercise={exercise} />
    </form>
  );
}

function PredictionBody({
  exercise,
  draft,
  setDraft,
}: CapabilityBodyProps<PredictionDraft>) {
  if (exercise.type !== "prediction") return null;
  const revealed = draft.revealed;
  return (
    <>
      <button
        type="button"
        className="btn"
        aria-expanded={revealed}
        onClick={() => setDraft({ revealed: !revealed })}
      >
        {revealed ? "Hide answer" : "Reveal answer"}
      </button>
      {revealed && (
        <>
          <p
            className="exercise-panel__feedback"
            role="status"
            aria-live="polite"
            data-state="reveal"
          >
            <ProseWithMath text={exercise.reveal} />
          </p>
          {exercise.solutionReveal && (
            <SolutionReveal
              reveal={exercise.solutionReveal}
              compact={exercise.tier !== "transfer"}
            />
          )}
        </>
      )}
    </>
  );
}

/**
 * Committed prediction (the pilot interaction, reached via the `custom` escape
 * hatch). The learner commits a choice BEFORE the reveal — the testing-effect
 * commit that plain `prediction` lacks.
 */
function CommittedPredictionBody({
  exercise,
  draft,
  result,
  setDraft,
  setResult,
}: CapabilityBodyProps<CommittedPredictionDraft>) {
  if (exercise.type !== "custom") return null;
  const config = exercise.config as CommittedPredictionConfig | undefined;
  if (!config) return null;

  const commit = () => {
    if (draft.committedIndex === null) return;
    setDraft({ ...draft, submitted: true });
    setResult(
      gradeExercise(exercise, {
        kind: "custom",
        capabilityId: "committed-prediction",
        value: { committedIndex: draft.committedIndex },
      }),
    );
  };

  const graded = typeof config.correctIndex === "number";

  return (
    <>
      <ul className="exercise-panel__choices">
        {config.options.map((option, index) => {
          const isSelected = draft.committedIndex === index;
          const isCorrect = index === config.correctIndex;
          // Pre-commit selection is shown via aria-pressed; graded correctness
          // (only when a correctIndex is configured) via data-state after commit.
          const state =
            draft.submitted && graded
              ? isCorrect
                ? "correct"
                : isSelected
                  ? "incorrect"
                  : undefined
              : undefined;
          return (
            <li key={`${exercise.id}-${index}`}>
              <button
                type="button"
                className="exercise-panel__choice"
                aria-pressed={isSelected}
                data-state={state}
                data-choice-index={index}
                disabled={draft.submitted}
                onClick={() => setDraft({ ...draft, committedIndex: index })}
              >
                <span className="exercise-panel__choice-letter" aria-hidden="true">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="exercise-panel__choice-math">
                  <ProseWithMath text={option} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {!draft.submitted && (
        <button
          type="button"
          className="btn btn--primary"
          disabled={draft.committedIndex === null}
          onClick={commit}
        >
          Commit answer
        </button>
      )}
      {draft.submitted && <Feedback result={result} exercise={exercise} />}
    </>
  );
}
