import type { ReactNode } from "react";
import { ProseWithMath } from "./ProseWithMath";
import "./ExplorationPanel.css";

export type ExplorationPanelProps = {
  explorationId: string;
  title?: string;
  description?: string;
  children?: ReactNode;
  controls?: ReactNode;
  readout?: ReactNode;
  toolbar?: ReactNode;
  /** Prominent, natural-language result statement shown above the canvas. */
  summary?: ReactNode;
};

/**
 * Orchestration shell for interactive explorations.
 * Hosts Mafs diagrams, external controls, and numerical readouts.
 * Mathematical state stays local to the child exploration component.
 */
export function ExplorationPanel({
  explorationId,
  title = "Interactive exploration",
  description,
  children,
  controls,
  readout,
  toolbar,
  summary,
}: ExplorationPanelProps) {
  return (
    <div
      className="exploration-panel"
      data-exploration-id={explorationId}
      role="region"
      aria-label={title}
    >
      <header className="exploration-panel__header">
        <div className="exploration-panel__intro">
          <h3 className="exploration-panel__title">{title}</h3>
          {description && (
            <p className="exploration-panel__description">
              <ProseWithMath text={description} />
            </p>
          )}
        </div>
        {toolbar && (
          <div className="exploration-panel__toolbar">{toolbar}</div>
        )}
      </header>

      {summary && (
        <p className="exploration-panel__summary" aria-live="polite">
          {typeof summary === "string" ? <ProseWithMath text={summary} /> : summary}
        </p>
      )}

      <div className="exploration-panel__body">
        <div className="exploration-panel__scene">{children}</div>
        {(controls || readout) && (
          <aside className="exploration-panel__side">
            {controls}
            {readout}
          </aside>
        )}
      </div>
    </div>
  );
}
