import { lazy, Suspense, type ComponentType, type ReactElement } from "react";
import type { JsonObject } from "../../platform/json";

/** Props every registered block component receives. `config` is opaque and
 * capability-owned, exactly like a `custom` exercise's `config` — the
 * component validates its own concrete shape at runtime. */
export type BlockComponentProps = {
  config?: JsonObject;
};

/**
 * Registry of `composed` block components — the escape hatch for a
 * pedagogical form the fixed `RouteBlock` palette doesn't name (a
 * computational laboratory, a simulation, a coached-attempt ladder, an open
 * investigation). Modeled on `lessonVisuals.tsx` (`LAZY_VISUALS`) and
 * `explorations/registry.tsx` (`LAZY_EXPLORERS`): a new form ships as a
 * registered, lazily-loaded component here, keyed by `componentId`, without
 * touching the `RouteBlock` union or `LessonLayout`'s switch.
 *
 * Every registered component must render its own accessible label (it is not
 * wrapped in a labelled region by the caller) and carry its own tests — see
 * `blockComponents.test.ts`, which asserts every registered id here has both.
 * This is a deliberate bar: an unconstrained escape hatch re-fragments the
 * design the same way an unconstrained per-lesson block shell would.
 *
 * The first entry ships with the Karatsuba historical-breakthrough rebuild
 * (R2): the "three evaluations of a quadratic" deeper connection (recorded in
 * the approved insight contract as C2) made concrete with real numbers,
 * rather than staying prose-only in a depth layer. It draws no new
 * arithmetic — every value comes from `karatsubaStep`, the same tested pure
 * function the lesson's exercises and worked examples already use.
 */
const LAZY_BLOCK_COMPONENTS: Record<string, ComponentType<BlockComponentProps>> = {
  "karatsuba-three-evaluations": lazy(() =>
    import("./KaratsubaThreeEvaluationsLab").then((m) => ({
      default: m.KaratsubaThreeEvaluationsLab,
    })),
  ),
};

export function getBlockComponent(
  componentId: string,
): ComponentType<BlockComponentProps> | undefined {
  return LAZY_BLOCK_COMPONENTS[componentId];
}

export function renderBlockComponent(
  componentId: string,
  config?: JsonObject,
): ReactElement | null {
  const Component = LAZY_BLOCK_COMPONENTS[componentId];
  if (!Component) return null;
  return (
    <Suspense fallback={null}>
      <Component config={config} />
    </Suspense>
  );
}
