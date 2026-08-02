import { useCallback, useMemo, useState } from "react";
import { ExplorationPanel } from "../components/lesson/ExplorationPanel";
import { ProseWithMath } from "../components/lesson/ProseWithMath";
import { FunctionPlot } from "./FunctionPlot";
import { ParameterControls } from "./ParameterControls";
import { PresetPicker } from "./PresetPicker";
import { ResetButton } from "./ResetButton";
import { SceneReadout } from "./SceneReadout";
import { ExplorationToggles } from "./ExplorationToggles";
import {
  NO_DISAGREEMENT_IN_DOMAIN,
  OPT_ABS,
  OPT_CONSTANT,
  OPT_CUBIC_SURVIVOR,
  OPT_DECAY,
  OPT_LINEAR,
  OPT_MAIN_CUBIC,
  OPT_NEG_QUARTIC,
  OPT_OPEN_INTERVAL,
  OPT_QUARTIC,
  candidateSet,
  certifiedRadius,
  classifyStationaryPoint,
  existenceGuaranteed,
  firstSampledDisagreement,
  globalExtrema,
  linearize,
  trustRadius,
  type OptimizationFixture,
} from "../math";
import "./OptimizationApproximationExplorer.css";

/**
 * Explorer for `optimization-approximation` (spine L6). Continues from the
 * guided scene's closing state (the main cubic, candidate set decided) and
 * reuses `FunctionPlot` (L1's family) with `tangent` for the local model —
 * no new visual family, per L6's Supporting tier
 * (`curriculum-architecture.md` §5.1).
 *
 * **Honesty obligations this file keeps:**
 *
 *  1. **Three distinct radii, three distinct readouts, never merged.** The
 *     certified radius (`certifiedRadius`), the first sampled disagreement
 *     (`firstSampledDisagreement`), and the domain-open toggle's withdrawn
 *     existence guarantee are computed independently and labelled
 *     independently — none is ever presented as "the threshold" (see
 *     `src/math/optimization.ts`'s module docstring for why that word is
 *     banned).
 *  2. **Opening an endpoint really withdraws the guarantee.** The toggle
 *     constructs a genuinely `domainOpen` fixture and re-runs `candidateSet`/
 *     `globalExtrema` on it — it does not just relabel the closed case.
 *  3. **Every displayed number comes from `src/math/optimization.ts`.** No
 *     candidate, classification, radius, or bound is computed in this file.
 */

function withOpenRightEndpoint(fixture: OptimizationFixture): OptimizationFixture {
  return { ...fixture, domainOpen: [fixture.domainOpen?.[0] ?? false, true] };
}

interface PresetEntry {
  readonly id: string;
  readonly label: string;
  readonly fixture: OptimizationFixture;
  readonly defaultA: number;
}

const PRESETS: readonly PresetEntry[] = [
  { id: "main", label: "Main case: x³ − 3x", fixture: OPT_MAIN_CUBIC, defaultA: 0 },
  { id: "survivor", label: "x³ — a survivor, not an answer", fixture: OPT_CUBIC_SURVIVOR, defaultA: -1 },
  { id: "abs", label: "|x| — the unexamined minimum", fixture: OPT_ABS, defaultA: -1 },
  { id: "quartic", label: "x⁴ — silent, but a real minimum", fixture: OPT_QUARTIC, defaultA: -1 },
  { id: "neg-quartic", label: "−x⁴ — silent, but a real maximum", fixture: OPT_NEG_QUARTIC, defaultA: -1 },
  { id: "linear", label: "A linear function — never disagrees", fixture: OPT_LINEAR, defaultA: 1 },
  { id: "constant", label: "A constant function — degenerate", fixture: OPT_CONSTANT, defaultA: 0 },
  { id: "open", label: "x on an open interval — no maximum", fixture: OPT_OPEN_INTERVAL, defaultA: 0.5 },
  { id: "decay", label: "e^(−t/1.5) — the linearization", fixture: OPT_DECAY, defaultA: 0.5 },
];

const DEFAULT_PRESET = "main";

function fmt(n: number | undefined | null, places = 4): string {
  if (n === undefined || n === null || !Number.isFinite(n)) return "—";
  const r = Number(n.toFixed(places));
  return Object.is(r, -0) ? "0" : String(r);
}

export function OptimizationApproximationExplorer() {
  const [presetId, setPresetId] = useState(DEFAULT_PRESET);
  const [openEndpoint, setOpenEndpoint] = useState(false);
  const [showApproximation, setShowApproximation] = useState(false);

  const preset = useMemo(
    () => PRESETS.find((p) => p.id === presetId) ?? PRESETS[0]!,
    [presetId],
  );

  const baseFixture = preset.fixture;
  const fixture = useMemo(
    () => (openEndpoint ? withOpenRightEndpoint(baseFixture) : baseFixture),
    [baseFixture, openEndpoint],
  );

  const [a, setA] = useState(preset.defaultA);

  const pick = useCallback((id: string) => {
    const next = PRESETS.find((p) => p.id === id) ?? PRESETS[0]!;
    setPresetId(id);
    setA(next.defaultA);
    setOpenEndpoint(false);
  }, []);

  const reset = useCallback(() => {
    setPresetId(DEFAULT_PRESET);
    setA(PRESETS[0]!.defaultA);
    setOpenEndpoint(false);
    setShowApproximation(false);
  }, []);

  // The SELECTABLE range — excludes an open endpoint by a small margin, so
  // dragging or the slider can never actually land ON a point the fixture
  // just declared ineligible. `a` itself is clamped into this range on every
  // render (not just at toggle time), so it self-corrects if the preset or
  // the endpoint toggle changes out from under a stale value.
  const [domainLo, domainHi] = fixture.domain;
  // A margin proportional to the domain's own width, not a fixed epsilon —
  // large enough that the displayed point (rounded to 2 places) reads
  // visibly short of the excluded endpoint rather than rounding back to it
  // and looking selectable again.
  const EDGE_MARGIN = (domainHi - domainLo) * 0.01;
  const [openLeft, openRight] = fixture.domainOpen ?? [false, false];
  const selectableLo = domainLo + (openLeft ? EDGE_MARGIN : 0);
  const selectableHi = domainHi - (openRight ? EDGE_MARGIN : 0);
  const clampedA = Math.min(Math.max(a, selectableLo), selectableHi);

  const slope = fixture.derivative(clampedA);
  const isSingular = (fixture.singularPoints ?? []).some((p) => Math.abs(p - clampedA) < 1e-6);
  const isStationary = !isSingular && Math.abs(slope) < 1e-9;

  const candidates = candidateSet(fixture);
  const extrema = globalExtrema(fixture);
  const guaranteed = existenceGuaranteed(fixture);

  const verdict = isStationary && fixture.derivative2 ? classifyStationaryPoint(fixture, clampedA) : null;

  // certifiedRadius needs a declared secondDerivativeBound (the Taylor proof's
  // curvature bound) — OPT_ABS correctly declares none, since |x| has no
  // useful second derivative anywhere. firstSampledDisagreement needs only
  // `derivative` and runs regardless.
  const canCertify = !isStationary && !isSingular && Boolean(fixture.secondDerivativeBound);
  const radius = canCertify ? certifiedRadius(fixture, clampedA) : null;
  const disagreement = !isStationary && !isSingular ? firstSampledDisagreement(fixture, clampedA) : null;

  const [epsilon] = useState(0.01);
  // The linearization demo step is clamped to stay inside the SELECTABLE
  // domain — a fixed 0.3 previously ran straight past a preset's own
  // boundary near an edge (e.g. a = 1.4 on [-1.5, 1.5]). Steps right when
  // there is room; falls back to stepping left near the right edge.
  const rightRoom = selectableHi - clampedA;
  const leftRoom = clampedA - selectableLo;
  const linStep =
    rightRoom >= 0.05 ? Math.min(0.3, rightRoom * 0.9) : -Math.min(0.3, Math.max(leftRoom * 0.9, 1e-3));
  const lin = fixture.secondDerivativeBound ? linearize(fixture, clampedA, linStep) : null;
  const radiusForTolerance = fixture.secondDerivativeBound ? trustRadius(fixture, clampedA, epsilon) : null;

  return (
    <ExplorationPanel
      explorationId="optimization-approximation"
      title="A slope is a way out"
      description="Drag the point. A sloped point can always be improved on — enlarge the step until it can't."
      summary="**Drag the point** to see the escape-route inequality live, and switch presets to see the sweep's honest edge cases: a survivor, an unexamined minimum, a silent test, and a case that never disagrees at all."
      toolbar={
        <>
          <PresetPicker
            label="Function"
            activeId={presetId}
            presets={PRESETS.map((p) => ({ id: p.id, label: p.label, onSelect: () => pick(p.id) }))}
          />
          <ResetButton onReset={reset} />
        </>
      }
      controls={
        <>
          <ParameterControls
            title="Point"
            controls={[
              {
                id: "a",
                label: "a",
                value: clampedA,
                min: selectableLo,
                max: selectableHi,
                step: (selectableHi - selectableLo) / 200,
                onChange: setA,
              },
            ]}
          />
          <ExplorationToggles
            toggles={[
              {
                id: "open-endpoint",
                label: "Open the right endpoint (withdraw the existence guarantee)",
                checked: openEndpoint,
                onChange: setOpenEndpoint,
              },
              {
                id: "approximation",
                label: "Show the linearization and its error bound",
                checked: showApproximation,
                onChange: setShowApproximation,
              },
            ]}
          />
        </>
      }
      readout={
        <>
          <SceneReadout
            title="At this point"
            items={[
              {
                id: "slope",
                label: `f'(${fmt(clampedA, 2)})`,
                value: isSingular ? "no single slope — singular" : fmt(slope),
              },
              {
                id: "status",
                label: "Escape-route verdict",
                value: isSingular
                  ? "no local model — unrefuted by default"
                  : isStationary
                    ? "survives — refutes nothing"
                    : "refuted — not a local extremum",
              },
              ...(verdict
                ? [{ id: "verdict", label: "Second-derivative test", value: verdict }]
                : []),
              ...(radius !== null
                ? [
                    {
                      id: "radius",
                      label: "Certified sufficient radius",
                      value: radius === Infinity ? "∞ — never fails anywhere in the domain" : fmt(radius),
                    },
                  ]
                : []),
              ...(disagreement !== null
                ? [
                    {
                      id: "disagreement",
                      label: "First sampled disagreement (this grid)",
                      value:
                        disagreement.kind === NO_DISAGREEMENT_IN_DOMAIN
                          ? "none in this domain"
                          : `h ≈ ${fmt(disagreement.h, 3)}`,
                    },
                  ]
                : []),
            ]}
          />

          <SceneReadout
            title="The candidate set"
            items={[
              {
                id: "candidates",
                label: "Reduction",
                value:
                  candidates.kind === "not-finite"
                    ? "not a finite reduction — every point is stationary"
                    : candidates.points
                        .map((p) => `${fmt(p.x, 2)} (${p.kind})`)
                        .join(", ") || "empty",
              },
              {
                id: "existence",
                label: "Existence guaranteed (EVT)",
                value: guaranteed ? "yes — closed, bounded" : "no — the domain is open",
              },
              {
                id: "max",
                label: "Global maximum",
                value: extrema.max ? `${fmt(extrema.max.value)} at x = ${extrema.max.at.map((x) => fmt(x, 2)).join(", ")}` : "no conclusion",
              },
              {
                id: "min",
                label: "Global minimum",
                value: extrema.min ? `${fmt(extrema.min.value)} at x = ${extrema.min.at.map((x) => fmt(x, 2)).join(", ")}` : "no conclusion",
              },
            ]}
          />

          {showApproximation && lin && (
            <SceneReadout
              title="Linearization"
              items={[
                { id: "lin-value", label: `L(a${linStep >= 0 ? "+" : ""}${fmt(linStep, 2)})`, value: fmt(lin.linearValue) },
                { id: "true-error", label: "True error", value: fmt(lin.trueError, 6) },
                { id: "bound", label: "Declared bound (M/2)h²", value: fmt(lin.bound, 6) },
                {
                  id: "trust",
                  label: `Radius for tolerance ${epsilon}`,
                  value: fmt(radiusForTolerance, 4),
                },
              ]}
            />
          )}

          {!guaranteed && (
            <ProseWithMath
              className="optapprox-explorer__note"
              text="With this endpoint open, the Extreme Value Theorem's hypothesis fails — the candidate set may say where an extremum WOULD be, but nothing guarantees one is attained."
            />
          )}
          {candidates.kind === "not-finite" && (
            <ProseWithMath
              className="optapprox-explorer__note"
              text="A constant function makes every point stationary — the reduction genuinely fails to reduce, which is the honest report, not a bug."
            />
          )}
        </>
      }
    >
      <FunctionPlot
        fixture={{
          id: fixture.id,
          label: fixture.label,
          f: fixture.f,
          domain: fixture.domain,
          derivative: fixture.derivative,
          nonDifferentiable: fixture.singularPoints,
        }}
        at={clampedA}
        onDragTo={(x) => setA(Math.min(Math.max(x, selectableLo), selectableHi))}
        tangent={isSingular ? undefined : { slope }}
        height={340}
        ariaLabel={`${fixture.label}, with the point at x = ${fmt(clampedA, 2)} and its local-linear model`}
      />
    </ExplorationPanel>
  );
}
