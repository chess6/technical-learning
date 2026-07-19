import { ProseWithMath } from "./ProseWithMath";
import "./ExplanationBlock.css";

type ExplanationBlockProps = {
  title: string;
  body: string;
  observation?: string;
};

export function ExplanationBlock({
  title,
  body,
  observation,
}: ExplanationBlockProps) {
  return (
    <div className="explanation-block">
      <h2 className="explanation-block__title">{title}</h2>
      <p className="explanation-block__body">
        <ProseWithMath text={body} />
      </p>
      {observation && (
        <p className="explanation-block__observation">
          <span className="explanation-block__label">Key observation</span>
          <ProseWithMath text={observation} />
        </p>
      )}
    </div>
  );
}
