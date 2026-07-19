import "./LessonSummary.css";

type LessonSummaryProps = {
  takeaway: string;
  objectives: string[];
};

export function LessonSummary({ takeaway, objectives }: LessonSummaryProps) {
  return (
    <section className="lesson-summary" aria-label="Lesson summary">
      <h2 className="lesson-summary__heading">Key insight</h2>
      <p className="lesson-summary__takeaway">{takeaway}</p>
      <h3 className="lesson-summary__objectives-title">Learning objectives</h3>
      <ul className="lesson-summary__objectives">
        {objectives.map((objective) => (
          <li key={objective}>{objective}</li>
        ))}
      </ul>
    </section>
  );
}
