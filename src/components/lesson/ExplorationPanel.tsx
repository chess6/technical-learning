import type { ReactNode } from "react";
import "./ExplorationPanel.css";

type ExplorationPanelProps = {
  title?: string;
  children?: ReactNode;
  explorationId: string;
};

/**
 * Placeholder exploration shell for M1.
 * M3 will host Mafs explorers here.
 */
export function ExplorationPanel({
  title = "Interactive exploration",
  children,
  explorationId,
}: ExplorationPanelProps) {
  return (
    <div
      className="exploration-panel"
      data-exploration-id={explorationId}
      role="region"
      aria-label={title}
    >
      <h2 className="exploration-panel__title">{title}</h2>
      {children ?? (
        <p className="exploration-panel__placeholder">
          Interactive diagram for <code>{explorationId}</code> will appear here.
        </p>
      )}
    </div>
  );
}
