import { useCallback, useState } from "react";
import { Line, Polygon, Text, Vector, useMovablePoint } from "mafs";
import { ExplorationPanel } from "../components/lesson/ExplorationPanel";
import { VectorTeX } from "../components/lesson/ProseWithMath";
import { MafsSceneShell } from "./MafsSceneShell";
import { ParameterControls } from "./ParameterControls";
import { ResetButton } from "./ResetButton";
import { SceneReadout } from "./SceneReadout";
import { ExplorationToggles } from "./ExplorationToggles";
import { PresetPicker } from "./PresetPicker";
import { LINEAR_COMBINATION_EXAMPLE } from "../lessons/exampleData";
import {
  addVectors,
  areParallel,
  clamp,
  scaleVector,
  type Vector2,
} from "../math";
import "./LinearCombinationExplorer.css";

const EX = LINEAR_COMBINATION_EXAMPLE;
const BOUND = EX.bound;
const COEF_BOUND = 3;
const SPAN_R = 1.2;

const ROLE_V = "var(--role-basis-1)";
const ROLE_W = "var(--role-basis-2)";
const ROLE_COMBO = "var(--role-invariant)";
const ROLE_COMPONENT = "var(--role-intermediate)";
const ROLE_SPAN = "var(--role-original)";
const ROLE_TARGET = "var(--role-selected)";

/** How close a·v + b·w must sit to p to count as "matched" in the challenge. */
const MATCH_TOL = 0.1;

type Preset = "independent" | "dependent" | "challenge";

function fmt(n: number): string {
  const r = Math.round(n * 100) / 100;
  return Object.is(r, -0) ? "0" : String(r);
}

const clampVec = (p: readonly [number, number]): [number, number] => [
  clamp(p[0], -BOUND, BOUND),
  clamp(p[1], -BOUND, BOUND),
];

/**
 * Lesson 1 exploration — continues the shared guided example.
 * Primary controls: a, b, presets. Secondary: numeric vectors & display.
 */
export function LinearCombinationExplorer() {
  const [a, setA] = useState(EX.initialA);
  const [b, setB] = useState(EX.initialB);
  const [showComponents, setShowComponents] = useState(false);
  const [showSpan, setShowSpan] = useState(true);
  const [preset, setPreset] = useState<Preset>("independent");

  const vPoint = useMovablePoint(EX.v as [number, number], {
    color: ROLE_V,
    constrain: clampVec,
  });
  const wPoint = useMovablePoint(EX.wIndependent as [number, number], {
    color: ROLE_W,
    constrain: clampVec,
  });

  const v: Vector2 = [vPoint.x, vPoint.y];
  const w: Vector2 = [wPoint.x, wPoint.y];

  const av = scaleVector(v, a);
  const bw = scaleVector(w, b);
  const combo = addVectors(av, bw);
  const independent = !areParallel(v, w);
  const spanKind = independent ? "the plane" : "a line";

  // Bounded "find the coordinates" task, entered via the challenge preset.
  const challenge = preset === "challenge";
  const target = EX.target as [number, number];
  const matched =
    challenge &&
    Math.abs(combo[0] - target[0]) < MATCH_TOL &&
    Math.abs(combo[1] - target[1]) < MATCH_TOL;

  const spanCornerP1 = addVectors(scaleVector(v, SPAN_R), scaleVector(w, SPAN_R));
  const spanCornerP2 = addVectors(scaleVector(v, SPAN_R), scaleVector(w, -SPAN_R));
  const spanCorners = [
    spanCornerP1,
    spanCornerP2,
    scaleVector(spanCornerP1, -1),
    scaleVector(spanCornerP2, -1),
  ] as [number, number][];

  const spanLine = {
    p1: scaleVector(v, 5) as [number, number],
    p2: scaleVector(v, -5) as [number, number],
  };

  const applyPreset = useCallback(
    (next: Preset) => {
      setPreset(next);
      if (next === "challenge") {
        // Lock to the independent pair and start away from the answer so the
        // learner has to find a = b = 1.
        vPoint.setPoint(EX.v as [number, number]);
        wPoint.setPoint(EX.wIndependent as [number, number]);
        setA(0);
        setB(0);
        setShowSpan(false);
        setShowComponents(false);
        return;
      }
      wPoint.setPoint(
        (next === "independent" ? EX.wIndependent : EX.wDependent) as [
          number,
          number,
        ],
      );
    },
    [vPoint, wPoint],
  );

  const handleReset = useCallback(() => {
    setA(EX.initialA);
    setB(EX.initialB);
    setShowComponents(false);
    setShowSpan(true);
    setPreset("independent");
    vPoint.setPoint(EX.v as [number, number]);
    wPoint.setPoint(EX.wIndependent as [number, number]);
  }, [vPoint, wPoint]);

  return (
    <ExplorationPanel
      explorationId="linear-combination"
      title="Build a linear combination"
      description="Drag v and w or adjust a and b. You are changing the same example from the guided animation. Try the coordinate challenge to read p in the basis (v, w)."
      toolbar={
        <>
          <PresetPicker
            label="Vector pair"
            activeId={preset}
            presets={[
              { id: "independent", label: "Independent", onSelect: () => applyPreset("independent") },
              { id: "dependent", label: "Dependent", onSelect: () => applyPreset("dependent") },
              { id: "challenge", label: "Coordinate challenge", onSelect: () => applyPreset("challenge") },
            ]}
          />
          <ResetButton onReset={handleReset} />
        </>
      }
      summary={
        challenge
          ? matched
            ? "You found it: a·v + b·w now lands on p, so [p]_B = (1, 1). The same arrow that is (4, 1) in the standard basis is (1, 1) in the basis (v, w)."
            : "Adjust a and b until a·v + b·w lands on the gold target p = (4, 1). The coefficients you find are p's coordinates in the basis (v, w)."
          : independent
            ? "These two directions are independent, so their linear combinations reach every point of the plane — they form a basis."
            : "Here w = (2, 4) points along v's line, so every combination stays on that line and can't reach a point like (4, 1) off it — a dependent pair is not a basis."
      }
      controls={
        <>
          <ParameterControls
            title="Coefficients"
            controls={[
              { id: "coef-a", label: "a", value: a, min: -COEF_BOUND, max: COEF_BOUND, onChange: setA },
              { id: "coef-b", label: "b", value: b, min: -COEF_BOUND, max: COEF_BOUND, onChange: setB },
            ]}
          />
          <details className="exploration-details">
            <summary>Display options &amp; numeric vectors</summary>
            <div className="exploration-details__body">
              <ParameterControls
                title="Vectors (also draggable)"
                controls={[
                  { id: "vx", label: "vₓ", value: v[0], min: -BOUND, max: BOUND, onChange: (val) => vPoint.setPoint([clamp(val, -BOUND, BOUND), v[1]]) },
                  { id: "vy", label: "v_y", value: v[1], min: -BOUND, max: BOUND, onChange: (val) => vPoint.setPoint([v[0], clamp(val, -BOUND, BOUND)]) },
                  { id: "wx", label: "wₓ", value: w[0], min: -BOUND, max: BOUND, onChange: (val) => wPoint.setPoint([clamp(val, -BOUND, BOUND), w[1]]) },
                  { id: "wy", label: "w_y", value: w[1], min: -BOUND, max: BOUND, onChange: (val) => wPoint.setPoint([w[0], clamp(val, -BOUND, BOUND)]) },
                ]}
              />
              <ExplorationToggles
                toggles={[
                  { id: "toggle-components", label: "Components of v", checked: showComponents, onChange: setShowComponents },
                  { id: "toggle-span", label: "Span region", checked: showSpan, onChange: setShowSpan },
                ]}
              />
            </div>
          </details>
        </>
      }
      readout={
        <SceneReadout
          title="Result"
          items={[
            {
              id: "combo",
              label: "a·v + b·w",
              value: (
                <span data-testid="combo-readout" data-plain={`(${fmt(combo[0])}, ${fmt(combo[1])})`}>
                  <VectorTeX x={combo[0]} y={combo[1]} />
                </span>
              ),
            },
            {
              id: "independence",
              label: "Vectors are",
              value: (
                <span data-testid="independence-readout">
                  {independent ? "independent" : "dependent"}
                </span>
              ),
            },
            {
              id: "span",
              label: "Span is",
              value: <span data-testid="span-readout">{spanKind}</span>,
            },
            ...(challenge
              ? [
                  {
                    id: "coords-b",
                    label: "[p]_B = (a, b)",
                    value: (
                      <span data-testid="coords-b-readout" data-plain={`(${fmt(a)}, ${fmt(b)})`}>
                        <VectorTeX x={a} y={b} />
                      </span>
                    ),
                  },
                  {
                    id: "match",
                    label: "Target p = (4, 1)",
                    value: (
                      <span data-testid="match-readout">
                        {matched ? "matched" : "not matched yet"}
                      </span>
                    ),
                  },
                ]
              : []),
          ]}
        />
      }
    >
      <div className="lincomb-explorer__scene">
        <MafsSceneShell
          ariaLabel="Vectors v and w, their linear combination, and the span"
          viewBox={{ x: [-5.5, 5.5], y: [-4.5, 4.5], padding: 0.4 }}
          height={380}
        >
          {showSpan &&
            (independent ? (
              <Polygon
                points={spanCorners}
                color={ROLE_SPAN}
                fillOpacity={0.06}
                strokeOpacity={0.25}
                weight={1}
              />
            ) : (
              <Line.Segment
                point1={spanLine.p1}
                point2={spanLine.p2}
                color={ROLE_SPAN}
                weight={2}
                style="dashed"
              />
            ))}

          {showComponents && (
            <>
              <Line.Segment point1={[0, 0]} point2={[v[0], 0]} color={ROLE_COMPONENT} weight={2} style="dashed" />
              <Line.Segment point1={[v[0], 0]} point2={[v[0], v[1]]} color={ROLE_COMPONENT} weight={2} style="dashed" />
            </>
          )}

          <Vector
            tail={av as [number, number]}
            tip={combo as [number, number]}
            color={ROLE_W}
            weight={2}
            style="dashed"
            opacity={0.55}
          />

          {challenge && (
            <>
              <Vector
                tip={target}
                color={ROLE_TARGET}
                weight={4}
                style="dashed"
              />
              <Text x={target[0]} y={target[1]} attach="se" attachDistance={16} color={ROLE_TARGET} size={16}>
                p (target)
              </Text>
            </>
          )}

          <Vector tip={v as [number, number]} color={ROLE_V} weight={3} />
          <Vector tip={w as [number, number]} color={ROLE_W} weight={3} />
          <Vector tip={combo as [number, number]} color={ROLE_COMBO} weight={4} />

          <Text x={v[0]} y={v[1]} attach="ne" attachDistance={12} color={ROLE_V} size={16}>
            v
          </Text>
          <Text x={w[0]} y={w[1]} attach="ne" attachDistance={12} color={ROLE_W} size={16}>
            w
          </Text>
          <Text x={combo[0]} y={combo[1]} attach="ne" attachDistance={14} color={ROLE_COMBO} size={16}>
            a v + b w
          </Text>

          {vPoint.element}
          {wPoint.element}
        </MafsSceneShell>
      </div>
      <ul className="lincomb-explorer__legend" aria-label="Legend">
        <li><span className="swatch swatch--v" /> v (solid)</li>
        <li><span className="swatch swatch--w" /> w (solid)</li>
        <li><span className="swatch swatch--combo" /> a·v + b·w</li>
      </ul>
    </ExplorationPanel>
  );
}
