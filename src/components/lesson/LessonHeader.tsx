import "./LessonHeader.css";

type LessonHeaderProps = {
  title: string;
  subtitle: string;
  current: number;
  total: number;
};

export function LessonHeader({
  title,
  subtitle,
  current,
  total,
}: LessonHeaderProps) {
  // current === 0 marks an intro chapter (Chapter 0), outside the Lesson count.
  const badgeLabel = current === 0 ? `Chapter ${current}` : `Lesson ${current}`;
  // reference `total` to avoid unused-parameter lint warnings without changing API
  void total;
  return (
    <header className="lesson-header">
      <div className="lesson-header__title-row">
        <div
          className="lesson-header__badge"
          aria-label={badgeLabel}
          role="img"
        >
          <span className="lesson-header__badge-number">{current}</span>
          {current === 0 ? (
            <span className="lesson-header__badge-eyebrow">Chapter</span>
          ) : null}
        </div>
        <h1 className="lesson-header__title">{title}</h1>
      </div>
      <p className="lesson-header__subtitle">{subtitle}</p>
    </header>
  );
}
