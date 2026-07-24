import { Link } from "react-router-dom";
import { listModuleSets } from "../lessons/moduleSets";
import { isSpacedSetId } from "../platform/spacedConfig";

/**
 * Development-only index of the Package F/H assessment surfaces: every registered
 * module set (runner) plus the shared review queue. Dev-gated; same origin as
 * every surface.
 *
 * SPACED one-item sets are deliberately NOT listed here — they open only when due,
 * via the spaced-review list, never as directly-launchable runner sets.
 */
export function DevAssessmentIndexPage() {
  const sets = listModuleSets().filter((set) => !isSpacedSetId(set.id));
  return (
    <div className="dev-assessment-index" style={{ maxWidth: "52rem", margin: "0 auto" }}>
      <h1>Module assessment (dev)</h1>
      <h2>Runner sets</h2>
      <ul>
        {sets.map((set) => (
          <li key={set.id}>
            <Link to={`/dev/module/${set.id}`}>{set.title}</Link>{" "}
            <span style={{ color: "#667" }}>
              ({set.moduleId} · v{set.version} · {set.itemIds.length} items · {set.mode})
            </span>
          </li>
        ))}
      </ul>
      <h2>Review</h2>
      <p>
        <Link to="/dev/review">Open the human-scoring review queue</Link>
      </p>
      <h2>Spaced review</h2>
      <p>
        <Link to="/dev/spaced">Open the spaced-review due list</Link>
      </p>
      <h2>Recovery</h2>
      <p>
        <Link to="/dev/recovery">Export / import / reset learner state</Link>
      </p>
    </div>
  );
}
