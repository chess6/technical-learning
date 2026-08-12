import { useMemo, useState } from "react";
import { ExplorationPanel } from "../components/lesson/ExplorationPanel";
import { IMP_EXP, IMP_P_ONE, IMP_P_TWO, IMP_SIN, accumulation, type TailFixture } from "../math";
import { ParameterControls } from "./ParameterControls";
import { PresetPicker } from "./PresetPicker";
import { ResetButton } from "./ResetButton";
import { SceneReadout } from "./SceneReadout";
import "./ImproperIntegralExplorer.css";

const PRESETS: readonly TailFixture[] = [IMP_EXP, IMP_P_TWO, IMP_P_ONE, IMP_SIN];
const WIDTH = 620;
const HEIGHT = 230;
const PAD = 32;

function fmt(value: number): string {
  return Number(value.toFixed(4)).toString();
}

export function ImproperIntegralExplorer() {
  const [fixtureId, setFixtureId] = useState(PRESETS[0]!.id);
  const [R, setR] = useState(5);
  const [prediction, setPrediction] = useState<"settles" | "unbounded" | "oscillates">("settles");
  const [committed, setCommitted] = useState(false);
  const fixture = PRESETS.find((candidate) => candidate.id === fixtureId) ?? PRESETS[0]!;
  const maxR = fixture.id === IMP_SIN.id ? 30 : 40;
  const currentR = Math.min(R, maxR);
  const current = accumulation(fixture, currentR);
  const points = useMemo(
    () => Array.from({ length: 121 }, (_, index) => {
      const r = fixture.a + ((maxR - fixture.a) * index) / 120;
      return { r, value: accumulation(fixture, r).value };
    }),
    [fixture, maxR],
  );
  const values = points.map((point) => point.value);
  const yMin = Math.min(0, ...values);
  const yMax = Math.max(1, ...values);
  const sx = (x: number) => PAD + ((x - fixture.a) / (maxR - fixture.a)) * (WIDTH - 2 * PAD);
  const sy = (y: number) => HEIGHT - PAD - ((y - yMin) / (yMax - yMin || 1)) * (HEIGHT - 2 * PAD);
  const path = points.map((point, index) =>
    (index === 0 ? "M" : "L") + sx(point.r).toFixed(2) + "," + sy(point.value).toFixed(2),
  ).join(" ");
  const verdict = fixture.verdict.kind === "converges"
    ? "settles"
    : fixture.verdict.mode;

  const pick = (id: string) => {
    setFixtureId(id);
    setR(5);
    setCommitted(false);
  };
  const reset = () => {
    setFixtureId(PRESETS[0]!.id);
    setR(5);
    setPrediction("settles");
    setCommitted(false);
  };

  return (
    <ExplorationPanel
      explorationId="improper-accumulation"
      title="Move the finite edge"
      description="The symbol at infinity is a question about this ordinary accumulation graph."
      summary="Commit a prediction, then move R. A flat-looking finite window is evidence to investigate, not proof that the accumulation settles."
      toolbar={
        <>
          <PresetPicker label="Accumulation" activeId={fixture.id}
            presets={PRESETS.map((candidate) => ({
              id: candidate.id,
              label: candidate.label,
              onSelect: () => pick(candidate.id),
            }))} />
          <ResetButton onReset={reset} />
        </>
      }
      controls={
        <>
          <fieldset className="improper-explorer__prediction">
            <legend>Before revealing the verdict, what will A(R) do?</legend>
            <select aria-label="Accumulation prediction" value={prediction}
              disabled={committed}
              onChange={(event) => setPrediction(
                event.target.value as "settles" | "unbounded" | "oscillates",
              )}>
              <option value="settles">settles to a finite number</option>
              <option value="unbounded">grows without bound</option>
              <option value="oscillates">keeps oscillating</option>
            </select>
            <button type="button" className="btn" disabled={committed}
              onClick={() => setCommitted(true)}>
              Commit prediction
            </button>
          </fieldset>
          <ParameterControls title="Finite truncation" controls={[{
            id: "improper-R",
            label: "Right edge R",
            value: currentR,
            min: fixture.a,
            max: maxR,
            step: 0.1,
            onChange: setR,
          }]} />
        </>
      }
      readout={
        <SceneReadout title="Finite object only" items={[
          { id: "R", label: "R", value: fmt(currentR) },
          {
            id: "A",
            label: "A(R)",
            value: fmt(current.value) + (current.exact ? " (exact)" : " (numerical corroboration)"),
          },
          {
            id: "verdict",
            label: "Analytic verdict",
            value: committed ? verdict : "commit a prediction first",
          },
        ]} />
      }
    >
      <figure className="improper-explorer__figure">
        <svg viewBox={"0 0 " + WIDTH + " " + HEIGHT} role="img"
          aria-label={"Accumulation A(R) for " + fixture.label + " through finite R = " + fmt(currentR)}>
          <line x1={PAD} y1={sy(0)} x2={WIDTH - PAD} y2={sy(0)}
            className="improper-explorer__axis" />
          <path d={path} className="improper-explorer__curve" />
          <line x1={sx(currentR)} y1={PAD} x2={sx(currentR)} y2={HEIGHT - PAD}
            className="improper-explorer__edge" />
          <circle cx={sx(currentR)} cy={sy(current.value)} r="5"
            className="improper-explorer__point" />
        </svg>
        <figcaption>
          Every point is a finite accumulation A(R). No point is drawn at infinity.
        </figcaption>
      </figure>
    </ExplorationPanel>
  );
}
