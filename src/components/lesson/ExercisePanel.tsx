import { useState } from "react";
import type { ExerciseDefinition } from "../../lessons/types";
import { gradeExercise, type GradeResult } from "../../lessons/grading";
import { ProseWithMath } from "./ProseWithMath";
import "./ExercisePanel.css";

type ExercisePanelProps = {
  exercises: ExerciseDefinition[];
};

/** Interactive, deterministic exercises with explanatory feedback. */
export function ExercisePanel({ exercises }: ExercisePanelProps) {
  return (
    <div className="exercise-panel" role="region" aria-label="Exercises">
      <h2 className="exercise-panel__heading">Exercises</h2>
      <ol className="exercise-panel__list">
        {exercises.map((exercise, index) => (
          <li key={exercise.id} className="exercise-panel__item">
            <p className="exercise-panel__prompt">
              <span className="exercise-panel__index">{index + 1}.</span>
              <ProseWithMath text={exercise.prompt} />
            </p>
            <ExerciseBody exercise={exercise} />
          </li>
        ))}
      </ol>
    </div>
  );
}

function Feedback({ result }: { result: GradeResult | null }) {
  return (
    <p
      className="exercise-panel__feedback"
      role="status"
      aria-live="polite"
      data-state={result ? (result.correct ? "correct" : "incorrect") : "idle"}
    >
      {result ? <ProseWithMath text={result.feedback} /> : null}
    </p>
  );
}

function ExerciseBody({ exercise }: { exercise: ExerciseDefinition }) {
  switch (exercise.type) {
    case "multiple-choice":
      return <MultipleChoice exercise={exercise} />;
    case "numeric":
      return <NumericAnswer exercise={exercise} />;
    case "vector":
      return <VectorAnswer exercise={exercise} />;
    case "prediction":
      return <Prediction exercise={exercise} />;
  }
}

function MultipleChoice({
  exercise,
}: {
  exercise: Extract<ExerciseDefinition, { type: "multiple-choice" }>;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<GradeResult | null>(null);

  const choose = (choice: number) => {
    setSelected(choice);
    setResult(gradeExercise(exercise, { kind: "multiple-choice", choice }));
  };

  return (
    <>
      <ul className="exercise-panel__choices">
        {exercise.choices.map((choice, index) => {
          const isSelected = selected === index;
          const isCorrect = index === exercise.correctChoice;
          const state =
            selected === null
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
                className="btn btn--ghost exercise-panel__choice"
                aria-pressed={isSelected}
                data-state={state}
                data-choice-index={index}
                onClick={() => choose(index)}
              >
                <span className="exercise-panel__choice-letter" aria-hidden="true">
                  {String.fromCharCode(65 + index)}.
                </span>
                <span className="exercise-panel__choice-math">
                  <ProseWithMath text={choice} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <Feedback result={result} />
    </>
  );
}

function NumericAnswer({
  exercise,
}: {
  exercise: Extract<ExerciseDefinition, { type: "numeric" }>;
}) {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<GradeResult | null>(null);

  const check = () => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
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
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </label>
      <button type="submit" className="btn">
        Check
      </button>
      <Feedback result={result} />
    </form>
  );
}

function VectorAnswer({
  exercise,
}: {
  exercise: Extract<ExerciseDefinition, { type: "vector" }>;
}) {
  const [xValue, setXValue] = useState("");
  const [yValue, setYValue] = useState("");
  const [result, setResult] = useState<GradeResult | null>(null);

  const check = () => {
    const px = Number(xValue);
    const py = Number(yValue);
    if (Number.isNaN(px) || Number.isNaN(py)) {
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
          value={xValue}
          onChange={(event) => setXValue(event.target.value)}
        />
      </label>
      <label className="exercise-panel__field">
        <span className="exercise-panel__field-label">y</span>
        <input
          type="number"
          step="any"
          aria-label="y coordinate"
          value={yValue}
          onChange={(event) => setYValue(event.target.value)}
        />
      </label>
      <button type="submit" className="btn">
        Check
      </button>
      <Feedback result={result} />
    </form>
  );
}

function Prediction({
  exercise,
}: {
  exercise: Extract<ExerciseDefinition, { type: "prediction" }>;
}) {
  const [revealed, setRevealed] = useState(false);
  return (
    <>
      <button
        type="button"
        className="btn"
        aria-expanded={revealed}
        onClick={() => setRevealed((prev) => !prev)}
      >
        {revealed ? "Hide answer" : "Reveal answer"}
      </button>
      {revealed && (
        <p
          className="exercise-panel__feedback"
          role="status"
          aria-live="polite"
          data-state="reveal"
        >
          <ProseWithMath text={exercise.reveal} />
        </p>
      )}
    </>
  );
}
