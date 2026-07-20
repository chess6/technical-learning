import { useState } from "react";
import type { ExerciseDefinition } from "../../lessons/types";
import { gradeExercise, type GradeResult } from "../../lessons/grading";
import { ProseWithMath } from "./ProseWithMath";
import { SolutionReveal } from "./SolutionReveal";
import "./ExercisePanel.css";

type ExercisePanelProps = {
  exercises: ExerciseDefinition[];
};

type Draft = {
  choice: number | null;
  value: string;
  x: string;
  y: string;
  /** Comma-separated eigenvalues for type: eigenvalue. */
  lambdas: string;
  revealed: boolean;
  hintIndex: number;
};

const emptyDraft: Draft = {
  choice: null,
  value: "",
  x: "",
  y: "",
  lambdas: "",
  revealed: false,
  hintIndex: 0,
};

const TIER_LABEL: Record<string, string> = {
  check: "Check",
  drill: "Drill",
  transfer: "Transfer",
};

/**
 * Interactive, deterministic exercises shown one at a time.
 * Answer state is lifted here so learners can move Next / Previous and
 * revisit earlier questions without losing their work, and so a compact
 * completed-summary can appear once every question has been attempted.
 */
export function ExercisePanel({ exercises }: ExercisePanelProps) {
  const [current, setCurrent] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [results, setResults] = useState<Record<string, GradeResult | null>>({});

  const total = exercises.length;
  const exercise = exercises[current];

  const draft = (id: string): Draft => drafts[id] ?? emptyDraft;
  const patch = (id: string, next: Partial<Draft>) =>
    setDrafts((prev) => ({ ...prev, [id]: { ...draft(id), ...next } }));
  const setResult = (id: string, result: GradeResult | null) =>
    setResults((prev) => ({ ...prev, [id]: result }));

  const isAttempted = (ex: ExerciseDefinition): boolean =>
    ex.type === "prediction"
      ? draft(ex.id).revealed
      : Boolean(results[ex.id]);

  const attemptedCount = exercises.filter(isAttempted).length;
  const allAttempted = attemptedCount === total && total > 0;

  const go = (delta: number) =>
    setCurrent((c) => Math.min(Math.max(c + delta, 0), total - 1));

  if (!exercise) return null;

  const tier = exercise.tier;

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
          hintIndex={draft(exercise.id).hintIndex}
          onShowMore={() =>
            patch(exercise.id, {
              hintIndex: draft(exercise.id).hintIndex + 1,
            })
          }
        />
        <ExerciseBody
          exercise={exercise}
          draft={draft(exercise.id)}
          result={results[exercise.id] ?? null}
          onDraft={(next) => patch(exercise.id, next)}
          onResult={(result) => setResult(exercise.id, result)}
        />
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
              const result = results[ex.id];
              const state =
                ex.type === "prediction"
                  ? "reviewed"
                  : result?.correct
                    ? "correct"
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

  const reveal = result.solutionReveal ?? exercise.solutionReveal;
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

type BodyProps = {
  exercise: ExerciseDefinition;
  draft: Draft;
  result: GradeResult | null;
  onDraft: (next: Partial<Draft>) => void;
  onResult: (result: GradeResult | null) => void;
};

function ExerciseBody(props: BodyProps) {
  switch (props.exercise.type) {
    case "multiple-choice":
      return <MultipleChoice {...props} exercise={props.exercise} />;
    case "numeric":
      return <NumericAnswer {...props} exercise={props.exercise} />;
    case "vector":
      return <VectorAnswer {...props} exercise={props.exercise} />;
    case "eigenvalue":
      return <EigenvalueAnswer {...props} exercise={props.exercise} />;
    case "prediction":
      return <Prediction {...props} exercise={props.exercise} />;
  }
}

function MultipleChoice({
  exercise,
  draft,
  result,
  onDraft,
  onResult,
}: BodyProps & {
  exercise: Extract<ExerciseDefinition, { type: "multiple-choice" }>;
}) {
  const selected = draft.choice;

  const choose = (choice: number) => {
    onDraft({ choice });
    onResult(gradeExercise(exercise, { kind: "multiple-choice", choice }));
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

function NumericAnswer({
  exercise,
  draft,
  result,
  onDraft,
  onResult,
}: BodyProps & { exercise: Extract<ExerciseDefinition, { type: "numeric" }> }) {
  const check = () => {
    const parsed = Number(draft.value);
    if (draft.value.trim() === "" || Number.isNaN(parsed)) {
      onResult({ correct: false, feedback: "Enter a number to check." });
      return;
    }
    onResult(gradeExercise(exercise, { kind: "numeric", value: parsed }));
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
          onChange={(event) => onDraft({ value: event.target.value })}
        />
      </label>
      <button type="submit" className="btn">
        Check answer
      </button>
      <Feedback result={result} exercise={exercise} />
    </form>
  );
}

function VectorAnswer({
  exercise,
  draft,
  result,
  onDraft,
  onResult,
}: BodyProps & { exercise: Extract<ExerciseDefinition, { type: "vector" }> }) {
  const check = () => {
    const px = Number(draft.x);
    const py = Number(draft.y);
    if (
      draft.x.trim() === "" ||
      draft.y.trim() === "" ||
      Number.isNaN(px) ||
      Number.isNaN(py)
    ) {
      onResult({ correct: false, feedback: "Enter both coordinates to check." });
      return;
    }
    onResult(gradeExercise(exercise, { kind: "vector", value: [px, py] }));
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
          onChange={(event) => onDraft({ x: event.target.value })}
        />
      </label>
      <label className="exercise-panel__field">
        <span className="exercise-panel__field-label">y</span>
        <input
          type="number"
          step="any"
          aria-label="y coordinate"
          value={draft.y}
          onChange={(event) => onDraft({ y: event.target.value })}
        />
      </label>
      <button type="submit" className="btn">
        Check answer
      </button>
      <Feedback result={result} exercise={exercise} />
    </form>
  );
}

function EigenvalueAnswer({
  exercise,
  draft,
  result,
  onDraft,
  onResult,
}: BodyProps & {
  exercise: Extract<ExerciseDefinition, { type: "eigenvalue" }>;
}) {
  const check = () => {
    const parts = draft.lambdas
      .split(/[,\s]+/)
      .map((part) => part.trim())
      .filter(Boolean)
      .map(Number);
    if (parts.length === 0 || parts.some((n) => Number.isNaN(n))) {
      onResult({
        correct: false,
        feedback: "Enter one or more eigenvalues, separated by commas.",
      });
      return;
    }
    onResult(
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
          onChange={(event) => onDraft({ lambdas: event.target.value })}
        />
      </label>
      <button type="submit" className="btn">
        Check answer
      </button>
      <Feedback result={result} exercise={exercise} />
    </form>
  );
}

function Prediction({
  exercise,
  draft,
  onDraft,
}: BodyProps & { exercise: Extract<ExerciseDefinition, { type: "prediction" }> }) {
  const revealed = draft.revealed;
  return (
    <>
      <button
        type="button"
        className="btn"
        aria-expanded={revealed}
        onClick={() => onDraft({ revealed: !revealed })}
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
