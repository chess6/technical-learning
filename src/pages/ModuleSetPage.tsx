import { useParams } from "react-router-dom";
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
 * mode is real future work, not claimed here.
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
        Beta — this assessment surface is new. Written responses are scored by
        a human after you submit; feedback may take longer than the rest of
        the app.
      </p>
      <ModuleRunner setId={setId} />
    </div>
  );
}
