import { Link, useParams } from "react-router-dom";
import { ModuleRunner } from "../components/assessment/ModuleRunner";
import { isSpacedSetId } from "../platform/spacedConfig";
import "./ModuleSetPage.css";

/**
 * Production host for a `workshop` / `assessment` curriculum node (ADR-004,
 * package R3) — the first production surface with no guided scene and no
 * explorer, proving media optionality outside a fixture. Mirrors
 * `DevModuleRunnerPage` (same rejection of spaced one-item sets, which open
 * only from the spaced-review due list), plus a beta banner: this is the
 * first production exposure of `ModuleRunner`, and workshop/assessment nodes
 * both render through it identically today — an immediate-feedback practice
 * mode is real future work, not claimed here (ADR-004 § implemented subset).
 *
 * The banner previously said written responses were "scored by a human after
 * you submit", which was untrue in production: the only reviewer UI was
 * dev-gated, so responses stayed pending forever. It now describes what
 * actually happens and links to `/review`.
 */
export function ModuleSetPage() {
  const { setId } = useParams<{ setId: string }>();
  if (!setId) return null;

  if (isSpacedSetId(setId)) {
    return (
      <section className="module-runner" aria-label="Module assessment">
        <p className="module-runner__error" role="alert" data-testid="spaced-rejected">
          This is a spaced-review item. It isn’t available here — it opens only when
          due, from the spaced-review list.
        </p>
      </section>
    );
  }

  return (
    <div className="module-set-page">
      <p className="module-set-page__beta" role="note">
        Beta — this surface is new. Written responses are saved{" "}
        <strong>on this device</strong> and are not sent anywhere; they stay
        pending until someone opens the{" "}
        <Link to="/review">local review queue</Link> and scores them.
      </p>
      <ModuleRunner setId={setId} />
    </div>
  );
}
