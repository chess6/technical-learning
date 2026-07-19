import { MatrixTransformDemo } from "../explorations/MatrixTransformDemo";
import "./DevMafsDemoPage.css";

/**
 * Development-only route hosting the M3 Mafs technical demonstration.
 * Not a full lesson — validates shared math + interactive exploration wiring.
 */
export function DevMafsDemoPage() {
  return (
    <div className="dev-mafs-demo">
      <header className="dev-mafs-demo__header">
        <p className="dev-mafs-demo__eyebrow">Milestone 3 technical demo</p>
        <h1 className="dev-mafs-demo__title">Mafs exploration foundation</h1>
        <p className="dev-mafs-demo__lede">
          One interactive diagram proving shared example data, pure math
          transforms, sliders, draggable vectors, reset, and responsive layout.
          Full lesson content arrives in later milestones.
        </p>
      </header>
      <MatrixTransformDemo />
    </div>
  );
}
