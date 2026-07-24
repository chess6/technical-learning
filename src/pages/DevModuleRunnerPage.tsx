import { useParams } from "react-router-dom";
import { ModuleRunner } from "../components/assessment/ModuleRunner";
import { isSpacedSetId } from "../platform/spacedConfig";

/**
 * Development-only host for the Package F module-set runner. The route carries
 * the concrete SET id (not merely a module) so later packages can register many
 * sets per module without changing the routing contract.
 *
 * SPACED one-item sets are REJECTED here (Package H): they open only when due, via
 * the spaced-review list, so a learner cannot preview a spaced item — and its
 * answer/feedback — ahead of its scheduled occurrence by hand-typing this URL.
 */
export function DevModuleRunnerPage() {
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
  return <ModuleRunner setId={setId} />;
}
