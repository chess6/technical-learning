import { useMemo, useState } from "react";
import type { WorkedExample, WorkedStep } from "../../lessons/types";
import { getGuidedSceneFactory } from "../../guided-scenes/registry";
import { GuidedScenePlayer } from "./GuidedScenePlayer";
import { DepthLayerList } from "./DepthLayer";
import { ProseWithMath } from "./ProseWithMath";
import { getSolutionVisual } from "./solutionVisuals/registry";
import { Suspense } from "react";
import "./WorkedExamplePanel.css";

type WorkedExamplePanelProps = {
  examples: WorkedExample[];
  resetToken?: number;
};

/**
 * Notebook-style worked computation.
 * When a guidedSceneId is set, the derivation animation is the visual core
 * (left/top) with synchronized notebook reasoning (right/below) — taught once.
 */
export function WorkedExamplePanel({
  examples,
  resetToken = 0,
}: WorkedExamplePanelProps) {
  if (examples.length === 0) return null;

  return (
    <div className="worked-example-panel" role="region" aria-label="Worked examples">
      {examples.map((example) => (
        <WorkedExampleBlock
          key={example.id}
          example={example}
          resetToken={resetToken}
        />
      ))}
    </div>
  );
}

function WorkedExampleBlock({
  example,
  resetToken,
}: {
  example: WorkedExample;
  resetToken: number;
}) {
  const createEngine = useMemo(
    () =>
      example.guidedSceneId
        ? getGuidedSceneFactory(example.guidedSceneId)
        : null,
    [example.guidedSceneId],
  );

  return (
    <article className="worked-example" data-testid={`worked-example-${example.id}`}>
      <header className="worked-example__header">
        <h3 className="worked-example__title">{example.title}</h3>
        <p className="worked-example__prompt">
          <ProseWithMath text={example.prompt} />
        </p>
      </header>

      <div
        className="worked-example__body"
        data-has-scene={Boolean(example.guidedSceneId)}
      >
        {example.guidedSceneId && createEngine && (
          <div className="worked-example__scene">
            <GuidedScenePlayer
              key={`${example.id}:${example.guidedSceneId}:${resetToken}`}
              sceneId={example.guidedSceneId}
              createEngine={createEngine}
              title={`Derivation: ${example.title}`}
            />
          </div>
        )}

        <ol className="worked-example__steps">
          {example.steps.map((step) => (
            <WorkedStepItem
              key={step.id}
              step={step}
              exampleId={example.exampleId}
            />
          ))}
        </ol>
      </div>

      <DepthLayerList layers={example.layers} />
    </article>
  );
}

function WorkedStepItem({
  step,
  exampleId,
}: {
  step: WorkedStep;
  exampleId?: string;
}) {
  const [revealed, setRevealed] = useState(!step.faded);
  const Visual = step.solutionVisualId
    ? getSolutionVisual(step.solutionVisualId)
    : null;

  const content = (
    <>
      {step.symbolic && (
        <p className="worked-example__symbolic">
          <ProseWithMath text={`$${step.symbolic}$`} />
        </p>
      )}
      {step.object && (
        <p>
          <span className="worked-example__label">Object.</span>{" "}
          <ProseWithMath text={step.object} />
        </p>
      )}
      {step.invariant && (
        <p>
          <span className="worked-example__label">Invariant.</span>{" "}
          <ProseWithMath text={step.invariant} />
        </p>
      )}
      {step.picture && (
        <p>
          <span className="worked-example__label">Picture.</span>{" "}
          <ProseWithMath text={step.picture} />
        </p>
      )}
      {step.whyNext && (
        <p>
          <span className="worked-example__label">Why next.</span>{" "}
          <ProseWithMath text={step.whyNext} />
        </p>
      )}
      {step.learned && (
        <p className="worked-example__learned">
          <span className="worked-example__label">What you learned.</span>{" "}
          <ProseWithMath text={step.learned} />
        </p>
      )}
      {Visual && (
        <div className="worked-example__step-visual">
          <Suspense fallback={null}>
            <Visual exampleId={exampleId} height={200} />
          </Suspense>
        </div>
      )}
    </>
  );

  return (
    <li className="worked-example__step" data-faded={Boolean(step.faded)}>
      {step.faded && !revealed ? (
        <button
          type="button"
          className="btn"
          aria-expanded={false}
          onClick={() => setRevealed(true)}
        >
          Reveal your reasoning for this step
        </button>
      ) : (
        content
      )}
      {step.faded && revealed && (
        <button
          type="button"
          className="btn btn--ghost worked-example__hide"
          aria-expanded={true}
          onClick={() => setRevealed(false)}
        >
          Hide step
        </button>
      )}
    </li>
  );
}
