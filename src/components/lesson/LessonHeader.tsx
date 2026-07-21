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
  const position = current === 0 ? "Chapter 0" : `Lesson ${current} of ${total}`;
  return (
    <header className="lesson-header">
      <p className="lesson-header__position" aria-label={position}>
        {position}
      </p>
      <h1 className="lesson-header__title">{title}</h1>
      <p className="lesson-header__subtitle">{subtitle}</p>
    </header>
  );
}
