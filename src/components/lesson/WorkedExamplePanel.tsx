import { useMemo } from "react";
import type { WorkedExample } from "../../lessons/types";
import { getGuidedSceneFactory } from "../../guided-scenes/registry";
import { GuidedScenePlayer } from "./GuidedScenePlayer";
import { EigenClipStage } from "./EigenClipStage";
import { DepthLayerList } from "./DepthLayer";
import { EquationSequence } from "./EquationSequence";
import { ProseWithMath } from "./ProseWithMath";
import "./WorkedExamplePanel.css";

type WorkedExamplePanelProps = {
  examples: WorkedExample[];
  resetToken?: number;
  /**
   * Lesson 4 only: wrap eigen derivation scenes in EigenClipStage
   * (expand + 3D extension). Other lessons keep GuidedScenePlayer.
   */
  enableEigenClipStage?: boolean;
  /** 1-based number for the first example in this panel (lesson-wide numbering). */
  startNumber?: number;
  /**
   * Heading level for each example's title. `3` (default) is right under the
   * combined block's "Worked examples" h2; a worked example placed on its own by
   * a `worked` route block has no heading above it, so it takes `2` and becomes
   * the section heading itself.
   */
  headingLevel?: 2 | 3;
};

/**
 * A worked computation: an embedded derivation clip (when present) beside a
 * clean sequence of equations. No per-step explanatory template — high-value
 * asides live in depth layers, and misconceptions in callouts on the page.
 */
export function WorkedExamplePanel({
  examples,
  resetToken = 0,
  enableEigenClipStage = false,
  startNumber = 1,
  headingLevel = 3,
}: WorkedExamplePanelProps) {
  if (examples.length === 0) return null;

  return (
    <div className="worked-example-panel" role="region" aria-label="Worked examples">
      {examples.map((example, index) => (
        <WorkedExampleBlock
          key={example.id}
          example={example}
          exampleNumber={startNumber + index}
          resetToken={resetToken}
          enableEigenClipStage={enableEigenClipStage}
          headingLevel={headingLevel}
        />
      ))}
    </div>
  );
}

function WorkedExampleBlock({
  example,
  exampleNumber,
  resetToken,
  enableEigenClipStage,
  headingLevel,
}: {
  example: WorkedExample;
  exampleNumber: number;
  resetToken: number;
  enableEigenClipStage: boolean;
  headingLevel: 2 | 3;
}) {
  const createEngine = useMemo(
    () =>
      example.guidedSceneId
        ? getGuidedSceneFactory(example.guidedSceneId)
        : null,
    [example.guidedSceneId],
  );

  const useEigenStage =
    enableEigenClipStage &&
    Boolean(example.guidedSceneId) &&
    (example.guidedSceneId === "eigenvectors-derivation" ||
      example.guidedSceneId === "eigenvectors-invariant-directions");

  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <article className="worked-example" data-testid={`worked-example-${example.id}`}>
      <header className="worked-example__header">
        <div className="worked-example__eyebrow" aria-hidden="true">
          Example {exampleNumber}
        </div>
        <Heading
          className="worked-example__title"
          aria-label={`Example ${exampleNumber}: ${example.title}`}
        >
          <ProseWithMath text={example.title} />
        </Heading>
        {example.prompt && (
          <p className="worked-example__prompt">
            <ProseWithMath text={example.prompt} />
          </p>
        )}
      </header>

      <div
        className="worked-example__body"
        data-has-scene={Boolean(example.guidedSceneId)}
      >
        {example.guidedSceneId && useEigenStage && (
          <div className="worked-example__scene">
            <EigenClipStage
              key={`${example.id}:${example.guidedSceneId}:${resetToken}`}
              sceneId={example.guidedSceneId}
              title={`Derivation: ${example.title}`}
              resetToken={resetToken}
            />
          </div>
        )}

        {example.guidedSceneId && createEngine && !useEigenStage && (
          <div className="worked-example__scene">
            <GuidedScenePlayer
              key={`${example.id}:${example.guidedSceneId}:${resetToken}`}
              sceneId={example.guidedSceneId}
              createEngine={createEngine}
              title={`Derivation: ${example.title}`}
            />
          </div>
        )}

        <div className="worked-example__solution-label" aria-hidden="true">
          Solution
        </div>

        <EquationSequence
          className="worked-example__equations"
          equations={example.equations}
          ariaLabel={example.equationsAriaLabel ?? `${example.title}: calculation`}
        />
      </div>

      <DepthLayerList layers={example.layers} />
    </article>
  );
}
