import { useState } from "react";
import { ProseWithMath } from "./ProseWithMath";
import "./Checkpoint.css";

type CheckpointProps = {
  prompt: string;
  answer: string;
};

/** A short conceptual check-in with a reveal, shown between guide and explore. */
export function Checkpoint({ prompt, answer }: CheckpointProps) {
  const [revealed, setRevealed] = useState(false);
  return (
    <section className="checkpoint" aria-label="Conceptual checkpoint">
      <p className="checkpoint__prompt">
        <ProseWithMath text={prompt} />
      </p>
      <button
        type="button"
        className="btn"
        aria-expanded={revealed}
        onClick={() => setRevealed((prev) => !prev)}
      >
        {revealed ? "Hide answer" : "Reveal answer"}
      </button>
      {revealed && (
        <p className="checkpoint__answer" role="status" aria-live="polite">
          <ProseWithMath text={answer} />
        </p>
      )}
    </section>
  );
}
