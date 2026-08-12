import { useMemo, useState } from "react";
import { ExplorationPanel } from "../components/lesson/ExplorationPanel";
import { ParameterControls } from "./ParameterControls";
import { PresetPicker } from "./PresetPicker";
import { ResetButton } from "./ResetButton";
import { SceneReadout } from "./SceneReadout";
import {
  SUBSTITUTION_FIXTURES,
  ledgerSums,
  stripCorrespondence,
  substitutionIntegrand,
  type SubstitutionFixture,
} from "../math";
import "./SubstitutionLedgerExplorer.css";

/**
 * The substitution ledger (L7): two panels, one area.
 *
 * Left panel: the x-integrand f(g(x))·g'(x) over [a, b], partitioned into n
 * strips. Right panel: f(u) over [g(a), g(b)], partitioned into the strips'
 * EXACT images [g(x_i), g(x_{i+1})] — computed by `stripCorrespondence`, so
 * for the monotone-g fixtures shipped here the u-strips tile the image
 * interval with no gaps or overlaps. Selecting a strip highlights its partner.
 *
 * **What this deliberately shows and refuses to show.** The learner sees:
 * corresponding strips have (nearly) equal areas, the u-strip's width is the
 * image width — with the ratio to the x-width approaching g'(x), which is the
 * honest content of "du = g'(x)dx" — and the two panels' TOTALS agree with
 * each other and with F(g(b)) − F(g(a)). The readout labels the totals as
 * finite sums approaching the proven value, never as the proof: the identity
 * is proved in the lesson's proof block from the chain rule + FTC, and the
 * panels are a sampled visualization of it (the same honesty rule every
 * explorer in this repo follows). Per-strip areas are labelled "≈" because
 * left-sampled strips only agree in the limit — showing that gap is the
 * point, not a defect.
 *
 * Every number rendered comes from `src/math/integrationTechniques.ts`; no
 * geometry or value is re-derived here.
 */

interface Preset {
  readonly id: string;
  readonly label: string;
  readonly fixture: SubstitutionFixture;
}

const PRESETS: readonly Preset[] = SUBSTITUTION_FIXTURES.map((fixture) => ({
  id: fixture.id,
  label: fixture.label,
  fixture,
}));

const DEFAULT_STRIPS = 8;
const MAX_STRIPS = 60;

const PANEL_W = 300;
const PANEL_H = 170;
const PAD = 8;

function fmt(n: number, places = 4): string {
  const r = Number(n.toFixed(places));
  return Object.is(r, -0) ? "0" : String(r);
}

/** Pixel mapper for one panel given x/y ranges. */
function makeScale(xLo: number, xHi: number, yLo: number, yHi: number) {
  const sx = (x: number) => PAD + ((x - xLo) / (xHi - xLo)) * (PANEL_W - 2 * PAD);
  const sy = (y: number) => PANEL_H - PAD - ((y - yLo) / (yHi - yLo)) * (PANEL_H - 2 * PAD);
  return { sx, sy };
}

interface PanelSpec {
  readonly title: string;
  readonly curve: (t: number) => number;
  readonly lo: number;
  readonly hi: number;
  readonly strips: ReadonlyArray<{ left: number; width: number; height: number; index: number }>;
}

function Panel({
  spec,
  selected,
  onSelect,
  ariaLabel,
}: {
  spec: PanelSpec;
  selected: number;
  onSelect: (index: number) => void;
  ariaLabel: string;
}) {
  // y-range from the curve plus zero, padded.
  const samples = Array.from({ length: 80 }, (_, i) => spec.curve(spec.lo + ((spec.hi - spec.lo) * i) / 79));
  const finite = samples.filter(Number.isFinite);
  const yLo = Math.min(0, ...finite) * 1.1 - 0.05;
  const yHi = Math.max(0, ...finite) * 1.1 + 0.05;
  const { sx, sy } = makeScale(spec.lo, spec.hi, yLo, yHi);

  const path = samples
    .map((y, i) => {
      const x = spec.lo + ((spec.hi - spec.lo) * i) / 79;
      return `${i === 0 ? "M" : "L"}${sx(x).toFixed(2)},${sy(y).toFixed(2)}`;
    })
    .join(" ");

  return (
    <figure className="subledger__panel">
      <figcaption className="subledger__panel-title">{spec.title}</figcaption>
      <svg
        viewBox={`0 0 ${PANEL_W} ${PANEL_H}`}
        role="img"
        aria-label={ariaLabel}
        className="subledger__svg"
      >
        {/* baseline */}
        <line x1={PAD} y1={sy(0)} x2={PANEL_W - PAD} y2={sy(0)} className="subledger__axis" />
        {/* strips (under the curve line) */}
        {spec.strips.map((strip) => (
          <rect
            key={strip.index}
            x={sx(strip.left)}
            y={strip.height >= 0 ? sy(strip.height) : sy(0)}
            width={Math.max(0.5, sx(strip.left + strip.width) - sx(strip.left))}
            height={Math.abs(sy(strip.height) - sy(0))}
            className="subledger__strip"
            data-selected={strip.index === selected}
            role="button"
            tabIndex={0}
            aria-label={`Select strip ${strip.index + 1} of ${spec.strips.length} in ${spec.title}`}
            aria-pressed={strip.index === selected}
            onClick={() => onSelect(strip.index)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(strip.index);
              } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                event.preventDefault();
                onSelect(Math.min(spec.strips.length - 1, strip.index + 1));
              } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                event.preventDefault();
                onSelect(Math.max(0, strip.index - 1));
              }
            }}
          />
        ))}
        <path d={path} className="subledger__curve" fill="none" />
      </svg>
    </figure>
  );
}

export function SubstitutionLedgerExplorer() {
  const [presetId, setPresetId] = useState(PRESETS[0]!.id);
  const [stripCount, setStripCount] = useState(DEFAULT_STRIPS);
  const [selected, setSelected] = useState(0);

  const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0]!;
  const fixture = preset.fixture;
  const n = Math.min(MAX_STRIPS, Math.max(2, Math.round(stripCount)));
  const clampedSelected = Math.min(selected, n - 1);

  const strips = useMemo(
    () => Array.from({ length: n }, (_, i) => stripCorrespondence(fixture, i, n)),
    [fixture, n],
  );
  const sums = useMemo(() => ledgerSums(fixture, n), [fixture, n]);
  const chosen = strips[clampedSelected]!;

  const [a, b] = fixture.domain;
  const integrand = useMemo(() => substitutionIntegrand(fixture), [fixture]);

  const xPanel: PanelSpec = {
    title: "What you were given: f(g(x))·g′(x) over x",
    curve: integrand,
    lo: a,
    hi: b,
    strips: strips.map((s, i) => ({ left: s.x, width: s.xWidth, height: s.xHeight, index: i })),
  };
  const uLo = fixture.g(a);
  const uHi = fixture.g(b);
  const uPanel: PanelSpec = {
    title: "What you recognized: f(u) over u = g(x)",
    curve: fixture.f,
    lo: Math.min(uLo, uHi),
    hi: Math.max(uLo, uHi),
    strips: strips.map((s, i) => ({ left: Math.min(s.u, s.u + s.uWidth), width: Math.abs(s.uWidth), height: s.uHeight, index: i })),
  };

  const pick = (id: string) => {
    setPresetId(id);
    setSelected(0);
  };
  const reset = () => {
    setPresetId(PRESETS[0]!.id);
    setStripCount(DEFAULT_STRIPS);
    setSelected(0);
  };

  return (
    <ExplorationPanel
      explorationId="substitution-ledger"
      title="The area ledger"
      description="Substitution as a change of bookkeeping: same area, two partitions."
      summary="**Select a strip** in either panel by click or keyboard to see its partner. The u-strip's width is the exact image width — its ratio to the x-width approaches g′(x), which is what du = g′(x)dx records. Raise the strip count and watch both totals close in on the same number."
      toolbar={
        <>
          <PresetPicker
            label="Substitution"
            activeId={presetId}
            presets={PRESETS.map((p) => ({ id: p.id, label: p.label, onSelect: () => pick(p.id) }))}
          />
          <ResetButton onReset={reset} />
        </>
      }
      controls={
        <ParameterControls
          title="Partition"
          controls={[
            {
              id: "strips",
              label: "strips",
              value: n,
              min: 2,
              max: MAX_STRIPS,
              step: 1,
              onChange: setStripCount,
            },
          ]}
        />
      }
    >
      <div className="subledger__ledger-line">
        <span className="subledger__ledger-entry">{fixture.uLabel}</span>
        <span className="subledger__ledger-entry">{fixture.duLabel}</span>
      </div>
      <div className="subledger__panels">
        <Panel
          spec={xPanel}
          selected={clampedSelected}
          onSelect={setSelected}
          ariaLabel={`The integrand ${fixture.integrandSource} partitioned into ${n} strips over the x interval`}
        />
        <Panel
          spec={uPanel}
          selected={clampedSelected}
          onSelect={setSelected}
          ariaLabel={`The outer function partitioned into the ${n} image strips over the u interval`}
        />
      </div>
      <SceneReadout
        title={`Strip ${clampedSelected + 1} of ${n} — the correspondence`}
        items={[
          { id: "xstrip", label: "x-strip area ≈", value: fmt(chosen.xArea) },
          { id: "ustrip", label: "u-strip area ≈", value: fmt(chosen.uArea) },
          {
            id: "ratio",
            label: "width ratio (u/x), vs g′ at the strip",
            value: `${fmt(chosen.uWidth / chosen.xWidth, 3)} vs ${fmt(fixture.gPrime(chosen.x), 3)}`,
          },
        ]}
      />
      <SceneReadout
        title="The totals (finite sums approaching the proven value — not the proof)"
        items={[
          { id: "xsum", label: "Σ x-strip areas", value: fmt(sums.xSum) },
          { id: "usum", label: "Σ u-strip areas", value: fmt(sums.uSum) },
          { id: "exact", label: "F(g(b)) − F(g(a)) (the proof block's value)", value: fmt(sums.exact) },
        ]}
      />
    </ExplorationPanel>
  );
}
