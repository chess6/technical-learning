import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { getDerivationSteps } from "../../guided-scenes/scenes/derivationSteps";
import { DerivationStepNav } from "./DerivationStepNav";
import type { ClipPosition } from "./clipPosition";
import "./EigenClipModal.css";

export type EigenClipModalProps = {
  open: boolean;
  title: string;
  sceneId: string;
  position: ClipPosition;
  /** Enlarged active visualization (2D player or 3D extension). */
  children: ReactNode;
  onClose: () => void;
  onSelectStep?: (stepId: string) => void;
  /** Element to restore focus to on close. */
  returnFocusRef?: RefObject<HTMLElement | null>;
};

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Expandable dialog for Lesson 4 eigen clips only.
 * Caller must unmount the inline renderer while this is open (single-renderer).
 */
export function EigenClipModal({
  open,
  title,
  sceneId,
  position,
  children,
  onClose,
  onSelectStep,
  returnFocusRef,
}: EigenClipModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const steps = getDerivationSteps(sceneId);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const returnTarget = returnFocusRef?.current ?? null;
    const focusables = dialog?.querySelectorAll<HTMLElement>(FOCUSABLE);
    focusables?.[0]?.focus();

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      const nodes = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (nodes.length === 0) return;
      const first = nodes[0]!;
      const last = nodes[nodes.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      const restore = returnTarget ?? previouslyFocused;
      restore?.focus?.();
    };
  }, [open, onClose, returnFocusRef]);

  const handleBackdrop = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) onClose();
    },
    [onClose],
  );

  if (!open) return null;

  return createPortal(
    <div
      className="eigen-clip-modal__backdrop"
      data-testid="eigen-clip-modal-backdrop"
      onMouseDown={handleBackdrop}
    >
      <div
        ref={dialogRef}
        className="eigen-clip-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-testid="eigen-clip-modal"
        data-major-step={position.majorStepId}
        data-has-steps={Boolean(steps && steps.length > 0)}
      >
        <header className="eigen-clip-modal__header">
          <h2 id={titleId} className="eigen-clip-modal__title">
            {title}
          </h2>
          <button
            type="button"
            className="btn btn--ghost eigen-clip-modal__close"
            onClick={onClose}
            aria-label="Close expanded clip"
            data-testid="eigen-clip-modal-close"
          >
            Close
          </button>
        </header>

        <div className="eigen-clip-modal__body">
          <div className="eigen-clip-modal__viz">{children}</div>

          {steps && steps.length > 0 && onSelectStep && (
            <DerivationStepNav
              className="eigen-clip-modal__steps"
              steps={steps}
              activeStepId={position.majorStepId}
              onSelectStep={onSelectStep}
              showCaption
            />
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
