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
 * wrapped in a labelled region by the caller) and carry its own tests. This is
 * a deliberate bar: an unconstrained escape hatch re-fragments the design the
 * same way an unconstrained per-lesson block shell would.
 *
 * `blockComponents.test.tsx` enforces the label half GENERICALLY, over
 * `BLOCK_COMPONENT_IDS` — it renders every registered entry and requires an
 * accessible region name from each, so entry number two is held to the bar
 * without anyone remembering to add a test for it. (An earlier version of this
 * comment claimed the test already did that while it only checked the single
 * hardcoded id then registered; the enumeration below is what makes the claim
 * true.) The "carries its own tests" half stays a review obligation — a test
 * cannot check that another test exists — and `contentValidation.test.ts`
 * separately proves every `composed` block a lesson references resolves here.
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

/**
 * Every registered `composed` component id. Exported ONLY so
 * `blockComponents.test.tsx` can hold each entry to the accessible-label bar
 * generically rather than by hardcoding the ids it happens to know about —
 * `lessonVisuals.tsx` and `explorations/registry.tsx` expose no equivalent,
 * and the difference is deliberate: their entries are reached through
 * validated lesson references, while this registry's bar is a property every
 * entry must satisfy on its own.
 */
export const BLOCK_COMPONENT_IDS: readonly string[] = Object.keys(LAZY_BLOCK_COMPONENTS);

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
