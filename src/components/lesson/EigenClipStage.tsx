import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { getGuidedSceneFactory } from "../../guided-scenes/registry";
import { getPlaybackBeats } from "../../guided-scenes/scenes/derivationSteps";
import { GuidedScenePlayer } from "./GuidedScenePlayer";
import { EigenClipModal } from "./EigenClipModal";
import type { ClipMode, ClipPosition } from "./clipPosition";
import "./EigenClipStage.css";

const Eigen3DExtensionLazy = lazy(async () => {
  const mod = await import("./threeD/Eigen3DExtension");
  return { default: mod.Eigen3DExtension };
});

export type EigenClipStageProps = {
  sceneId: string;
  title: string;
  /** Remount key fragment from lesson reset. */
  resetToken?: number;
  /** Optional test hook to force WebGL fallback. */
  forceUnavailable3d?: boolean;
};

/**
 * Lesson 4-only stage: primary 2D derivation + optional 3D extension + expand.
 *
 * Framing: 2D derivation is the computational lesson; "See it in 3D" is a
 * conceptual generalization with a *different* curated 3×3 example.
 *
 * Lifecycle invariant: at most one renderer (Motion Canvas or R3F) is mounted
 * for this clip at a time. Opening the modal unmounts the inline renderer.
 */
export function EigenClipStage({
  sceneId,
  title,
  resetToken = 0,
  forceUnavailable3d = false,
}: EigenClipStageProps) {
  const createEngine = useMemo(
    () => getGuidedSceneFactory(sceneId),
    [sceneId],
  );
  const beats = getPlaybackBeats(sceneId);
  const defaultStepId = beats?.[0]?.id ?? "recap";

  const [mode, setMode] = useState<ClipMode>("derivation");
  const [expanded, setExpanded] = useState(false);
  const [position, setPosition] = useState<ClipPosition>({
    majorStepId: defaultStepId,
  });
  const [retryToken, setRetryToken] = useState(0);
  /** Bumped only when the learner jumps to a step (sidebar / restore). */
  const [seekGeneration, setSeekGeneration] = useState(0);

  const expandButtonRef = useRef<HTMLButtonElement>(null);

  const handlePositionChange = useCallback((next: ClipPosition) => {
    setPosition(next);
  }, []);

  const handleSelectStep = useCallback((stepId: string) => {
    setPosition({ majorStepId: stepId });
    setSeekGeneration((generation) => generation + 1);
  }, []);

  const openModal = (): void => setExpanded(true);
  const closeModal = (): void => setExpanded(false);

  const showDerivation = (): void => {
    setMode("derivation");
  };

  const showExtension = (): void => {
    setMode("extension");
  };

  // Remount when mode, expand, reset, or deliberate seek changes — not on
  // every playback tick. majorStepId is seeded via initialPosition.
  const playerKey = `${sceneId}:${resetToken}:${retryToken}:${mode}:${expanded ? "modal" : "inline"}:${seekGeneration}`;

  const renderActiveViz = (opts: { autoplay: boolean }) => {
    if (mode === "extension") {
      return (
        <Suspense
          fallback={
            <div className="eigen-clip-stage__loading" role="status">
              Loading 3D extension…
            </div>
          }
        >
          <LazyErrorBoundary
            resetKey={playerKey}
            onRetry={() => setRetryToken((token) => token + 1)}
            onBackTo2d={showDerivation}
          >
            <Eigen3DExtensionLazy
              key={`3d:${playerKey}`}
              sceneId={sceneId}
              position={position}
              forceUnavailable={forceUnavailable3d}
            />
          </LazyErrorBoundary>
        </Suspense>
      );
    }

    return (
      <GuidedScenePlayer
        key={`2d:${playerKey}`}
        sceneId={sceneId}
        createEngine={createEngine}
        title={title}
        initialPosition={position}
        onClipPositionChange={handlePositionChange}
        autoplayEnabled={opts.autoplay}
      />
    );
  };

  return (
    <div
      className="eigen-clip-stage"
      data-testid="eigen-clip-stage"
      data-mode={mode}
      data-expanded={expanded}
      data-scene-id={sceneId}
      data-major-step={position.majorStepId}
    >
      <div
        className="eigen-clip-stage__controls"
        role="toolbar"
        aria-label="Clip view"
      >
        <div
          className="eigen-clip-stage__mode"
          role="group"
          aria-label="Derivation or 3D extension"
        >
          <button
            type="button"
            className="btn"
            data-active={mode === "derivation"}
            aria-pressed={mode === "derivation"}
            onClick={showDerivation}
          >
            2D derivation
          </button>
          <button
            type="button"
            className="btn btn--primary"
            data-active={mode === "extension"}
            aria-pressed={mode === "extension"}
            onClick={showExtension}
            data-testid="eigen-see-3d"
          >
            See it in 3D
          </button>
        </div>
        <button
          ref={expandButtonRef}
          type="button"
          className="btn btn--ghost"
          onClick={openModal}
          data-testid="eigen-expand-clip"
          aria-haspopup="dialog"
          aria-expanded={expanded}
        >
          Expand
        </button>
      </div>

      {mode === "extension" && (
        <p className="eigen-clip-stage__note">
          3D extension — a different 3×3 example. It does not reuse the 2×2
          matrix from the 2D derivation.
        </p>
      )}

      {/* Single-renderer: unmount inline when modal is open.
          Derivation-step nav lives only in the expand modal — the lesson page
          already has its own notebook steps beside the clip. */}
      {!expanded && (
        <div
          className="eigen-clip-stage__inline"
          data-testid="eigen-clip-inline"
        >
          {renderActiveViz({ autoplay: mode === "derivation" })}
        </div>
      )}

      <EigenClipModal
        open={expanded}
        title={
          mode === "extension"
            ? `3D extension — ${title}`
            : `2D derivation — ${title}`
        }
        sceneId={sceneId}
        position={position}
        onClose={closeModal}
        onSelectStep={handleSelectStep}
        returnFocusRef={expandButtonRef}
      >
        {expanded && renderActiveViz({ autoplay: false })}
      </EigenClipModal>
    </div>
  );
}

type BoundaryProps = {
  children: ReactNode;
  resetKey: string;
  onRetry: () => void;
  onBackTo2d: () => void;
};

type BoundaryState = {
  error: Error | null;
  resetKey: string;
};

class LazyErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { error: null, resetKey: "" };

  static getDerivedStateFromError(error: Error): Partial<BoundaryState> {
    return { error };
  }

  static getDerivedStateFromProps(
    props: BoundaryProps,
    state: BoundaryState,
  ): Partial<BoundaryState> | null {
    if (props.resetKey !== state.resetKey) {
      return { error: null, resetKey: props.resetKey };
    }
    return null;
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Eigen3DExtension failed", error, info);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="eigen-clip-stage__loading" role="alert">
          <p>The 3D extension failed to start.</p>
          <button type="button" className="btn" onClick={this.props.onRetry}>
            Try again
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={this.props.onBackTo2d}
          >
            Stay with 2D derivation
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
