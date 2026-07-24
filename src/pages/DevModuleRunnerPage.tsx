import { useParams } from "react-router-dom";
import { ModuleRunner } from "../components/assessment/ModuleRunner";

/**
 * Development-only host for the Package F module-set runner. The route carries
 * the concrete SET id (not merely a module) so later packages can register many
 * sets per module without changing the routing contract.
 */
export function DevModuleRunnerPage() {
  const { setId } = useParams<{ setId: string }>();
  if (!setId) return null;
  return <ModuleRunner setId={setId} />;
}
