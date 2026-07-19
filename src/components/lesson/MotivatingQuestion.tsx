import { ProseWithMath } from "./ProseWithMath";
import "./MotivatingQuestion.css";

type MotivatingQuestionProps = {
  question: string;
};

/** A prediction/motivating prompt shown before the explanation. */
export function MotivatingQuestion({ question }: MotivatingQuestionProps) {
  return (
    <aside className="motivating-question" aria-label="Predict">
      <p className="motivating-question__body">
        <ProseWithMath text={question} />
      </p>
    </aside>
  );
}
