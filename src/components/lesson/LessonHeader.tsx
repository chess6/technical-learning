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
  return (
    <header className="lesson-header">
      <div className="lesson-header__text">
        <h1 className="lesson-header__title">{title}</h1>
        <p className="lesson-header__subtitle">{subtitle}</p>
      </div>
      <p className="lesson-header__position" aria-label={`Lesson ${current} of ${total}`}>
        Lesson {current} of {total}
      </p>
    </header>
  );
}
