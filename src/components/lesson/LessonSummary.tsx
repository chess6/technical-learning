import { ProseWithMath } from "./ProseWithMath";
import "./LessonSummary.css";

type LessonSummaryProps = {
  takeaway: string;
  objectives: string[];
};

export function LessonSummary({ takeaway, objectives }: LessonSummaryProps) {
  return (
    <div className="lesson-summary">
      <blockquote className="lesson-summary__takeaway">
        <span className="lesson-summary__mark" aria-hidden="true" />
        <ProseWithMath text={takeaway} />
      </blockquote>

      {objectives.length > 0 && (
        <details className="lesson-summary__objectives">
          <summary>What this lesson set out to do</summary>
          <ul>
            {objectives.map((objective) => (
              <li key={objective}>
                <ProseWithMath text={objective} />
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
