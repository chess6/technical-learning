import { ProseWithMath } from "./ProseWithMath";
import type { PlaybackBeat } from "../../guided-scenes/scenes/derivationSteps";
import "./DerivationStepNav.css";

export type DerivationStepNavProps = {
  beats: readonly PlaybackBeat[];
  activeStepId: string;
  onSelectStep: (stepId: string) => void;
  compact?: boolean;
  className?: string;
};

/**
 * Minimal numbered equation nav for the expand modal. Selecting a beat seeks
 * the clip to that majorStepId. Playback metadata only — no captions or prose
 * (the scene captions and the page own the explanation).
 */
export function DerivationStepNav({
  beats,
  activeStepId,
  onSelectStep,
  compact = false,
  className,
}: DerivationStepNavProps) {
  return (
    <nav
      className={`derivation-step-nav ${compact ? "derivation-step-nav--compact" : ""} ${className ?? ""}`}
      aria-label="Derivation steps"
      data-testid="derivation-step-nav"
    >
      <p className="derivation-step-nav__eyebrow">Steps</p>
      <ol className="derivation-step-nav__list">
        {beats.map((beat, index) => {
          const active = beat.id === activeStepId;
          return (
            <li
              key={beat.id}
              className="derivation-step-nav__item"
              data-active={active}
              data-step-id={beat.id}
            >
              <button
                type="button"
                className="derivation-step-nav__button"
                aria-current={active ? "step" : undefined}
                aria-label={`Step ${index + 1}: ${beat.label}`}
                onClick={() => onSelectStep(beat.id)}
              >
                <span className="derivation-step-nav__number" aria-hidden="true">
                  {index + 1}
                </span>
                <span className="derivation-step-nav__eq">
                  <ProseWithMath text={`$${beat.equation}$`} />
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
