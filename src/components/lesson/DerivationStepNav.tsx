import { ProseWithMath } from "./ProseWithMath";
import type { DerivationStep } from "../../guided-scenes/scenes/derivationSteps";
import "./DerivationStepNav.css";

export type DerivationStepNavProps = {
  steps: readonly DerivationStep[];
  activeStepId: string;
  onSelectStep: (stepId: string) => void;
  /** Optional caption under the list for the active step. */
  showCaption?: boolean;
  compact?: boolean;
  className?: string;
};

/**
 * Numbered, clickable derivation-step list. Selecting a step seeks the clip
 * to that majorStepId (caller remounts / seeks the GuidedScenePlayer).
 */
export function DerivationStepNav({
  steps,
  activeStepId,
  onSelectStep,
  showCaption = true,
  compact = false,
  className,
}: DerivationStepNavProps) {
  const active =
    steps.find((step) => step.id === activeStepId) ?? steps[0] ?? null;

  return (
    <nav
      className={`derivation-step-nav ${compact ? "derivation-step-nav--compact" : ""} ${className ?? ""}`}
      aria-label="Derivation steps"
      data-testid="derivation-step-nav"
    >
      <p className="derivation-step-nav__eyebrow">Derivation steps</p>
      <ol className="derivation-step-nav__list">
        {steps.map((step, index) => {
          const active = step.id === activeStepId;
          return (
            <li
              key={step.id}
              className="derivation-step-nav__item"
              data-active={active}
              data-step-id={step.id}
            >
              <button
                type="button"
                className="derivation-step-nav__button"
                aria-current={active ? "step" : undefined}
                aria-label={`Step ${index + 1}: ${step.label}`}
                onClick={() => onSelectStep(step.id)}
              >
                <span className="derivation-step-nav__number" aria-hidden="true">
                  {index + 1}
                </span>
                <span className="derivation-step-nav__body">
                  <span className="derivation-step-nav__label">{step.label}</span>
                  <span className="derivation-step-nav__eq">
                    <ProseWithMath text={`$${step.equation}$`} />
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      {showCaption && active && (
        <p className="derivation-step-nav__caption" aria-live="polite">
          {active.caption}
        </p>
      )}
    </nav>
  );
}
