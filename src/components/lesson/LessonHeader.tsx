import { ProseWithMath } from "./ProseWithMath";
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
  const isChapter = current === 0;
  const badgeLabel = isChapter ? `Chapter ${current}` : `Lesson ${current}`;
  // reference `total` to avoid unused-parameter lint warnings without changing API
  void total;
  return (
    <header className="lesson-header">
      {isChapter ? (
        <p className="lesson-header__position">{badgeLabel}</p>
      ) : null}
      <div className="lesson-header__title-row">
        {!isChapter ? (
          <div
            className="lesson-header__badge"
            aria-label={badgeLabel}
            role="img"
          >
            <span className="lesson-header__badge-number">{current}</span>
          </div>
        ) : null}
        <h1 className="lesson-header__title">{title}</h1>
      </div>
      <p className="lesson-header__subtitle">
        <ProseWithMath text={subtitle} />
      </p>
    </header>
  );
}
