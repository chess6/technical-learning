import type { ExerciseDefinition } from "../../lessons/types";
import "./ExercisePanel.css";

type ExercisePanelProps = {
  exercises: ExerciseDefinition[];
};

/**
 * Read-only exercise listing for M1.
 * Interactive grading lands in M4+.
 */
export function ExercisePanel({ exercises }: ExercisePanelProps) {
  return (
    <div className="exercise-panel" role="region" aria-label="Exercises">
      <h2 className="exercise-panel__heading">Exercises</h2>
      <ol className="exercise-panel__list">
        {exercises.map((exercise, index) => (
          <li key={exercise.id} className="exercise-panel__item">
            <p className="exercise-panel__prompt">
              <span className="exercise-panel__index">{index + 1}.</span>
              {exercise.prompt}
            </p>
            {exercise.type === "multiple-choice" && (
              <ul className="exercise-panel__choices">
                {exercise.choices.map((choice, choiceIndex) => (
                  <li key={choice}>
                    <button type="button" className="btn btn--ghost" disabled>
                      {String.fromCharCode(65 + choiceIndex)}. {choice}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {exercise.type === "numeric" && (
              <p className="exercise-panel__hint">Numeric answer — interactive in a later milestone.</p>
            )}
            {exercise.type === "vector" && (
              <p className="exercise-panel__hint">Vector answer — interactive in a later milestone.</p>
            )}
            {exercise.type === "prediction" && (
              <p className="exercise-panel__hint">Prediction — reveal in a later milestone.</p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
