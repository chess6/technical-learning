/* @jsxImportSource preact */
/* oxlint-disable react/only-export-components -- editor plugins intentionally co-locate hooks and Preact components. */

import {signal} from "@preact/signals";
import {
  Button,
  Field,
  FieldSet,
  NumberInput,
  Pane,
  Separator,
  Tab,
  Tune,
  makeEditorPlugin,
  useApplication,
  useCurrentFrame,
  useCurrentScene,
  type PluginDrawFunction,
  type PluginTabProps,
} from "@motion-canvas/ui";
import {useState} from "preact/hooks";
import type {Scene} from "@motion-canvas/core";
import {sampleSceneGraphDetailed} from "../../../src/guided-scenes/validation/sceneGraphSampler";
import {
  MATRIX_TRANSFORMATION_BEAT_CONTRACT,
} from "../../../src/guided-scenes/authoring/matrixTransformationBeatSpec";
import {
  MATRIX_TRANSFORMATION_PROJECT_VARIABLES,
  MATRIX_TRANSFORMATION_TUNING,
  MATRIX_TRANSFORMATION_TUNING_CONSTRAINTS,
  MATRIX_TUNING_KEYS,
  type MatrixTransformationTuning,
  type MatrixTransformationTuningKey,
} from "../../../src/guided-scenes/authoring/matrixTransformationTuning";
import {
  beatAtFrame,
  diagnoseOriginOnLattice,
  selectorMatches,
  stableIdentityColor
} from "../../../src/guided-scenes/authoring/debugOverlayMath";
import {
  SAFE_HEIGHT,
  SAFE_WIDTH,
  SCALE,
} from "../../../src/guided-scenes/scenes/safeFrame";

interface OverlayToggles {
  origin: boolean;
  lattice: boolean;
  semanticIds: boolean;
  bounds: boolean;
  safeFrame: boolean;
  focalObjects: boolean;
  diagnostics: boolean;
  zOrder: boolean;
  motionPaths: boolean;
  identity: boolean;
  beat: boolean;
}

const overlayToggles = signal<OverlayToggles>({
  origin: true,
  lattice: false,
  semanticIds: true,
  bounds: true,
  safeFrame: true,
  focalObjects: true,
  diagnostics: true,
  zOrder: false,
  motionPaths: true,
  identity: true,
  beat: true,
});
const tuningValues = signal<MatrixTransformationTuning>({
  ...MATRIX_TRANSFORMATION_TUNING,
});
const trajectories = new Map<string, {x: number; y: number}[]>();
let previousFrame = -1;

function projectVariables(values: MatrixTransformationTuning) {
  return Object.fromEntries(
    MATRIX_TUNING_KEYS.map((key) => [
      `authoring.matrix-transformations.${key}`,
      values[key],
    ]),
  );
}

function TabButton({tab}: PluginTabProps) {
  return (
    <Tab title="Animation authoring" id="animation-authoring" tab={tab}>
      <Tune />
    </Tab>
  );
}

function AuthoringPane() {
  const application = useApplication();
  const currentFrame = useCurrentFrame();
  const [status, setStatus] = useState("Changes are preview-only until persisted.");

  const updateTuning = (
    key: MatrixTransformationTuningKey,
    value: number,
  ) => {
    const next = {...tuningValues.value, [key]: value};
    tuningValues.value = next;
    application.player.setVariables(projectVariables(next));
    application.player.requestSeek(currentFrame);
    setStatus("Preview updated; production math is unchanged.");
  };

  const persist = async () => {
    setStatus("Persisting typed presentation config…");
    const response = await fetch("/__animation-authoring/tuning", {
      method: "POST",
      headers: {"content-type": "application/json"},
      body: JSON.stringify(tuningValues.value),
    });
    const result = (await response.json()) as {ok: boolean; error?: string};
    setStatus(
      result.ok
        ? "Persisted to matrixTransformationTuning.json."
        : `Persistence failed: ${result.error ?? response.status}`,
    );
  };

  return (
    <Pane title="Animation Authoring" id="animation-authoring-pane">
      <Separator size={1} />
      <FieldSet header="Debug overlays">
        {Object.entries(overlayToggles.value).map(([key, enabled]) => (
          <Field label={key} key={key}>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(event) => {
                overlayToggles.value = {
                  ...overlayToggles.value,
                  [key]: event.currentTarget.checked,
                };
              }}
            />
          </Field>
        ))}
      </FieldSet>
      <FieldSet header="Presentation tuning">
        {MATRIX_TUNING_KEYS.map((key) => {
          const constraint = MATRIX_TRANSFORMATION_TUNING_CONSTRAINTS[key];
          return (
            <Field label={constraint.label} key={key}>
              <NumberInput
                value={tuningValues.value[key]}
                min={constraint.min}
                max={constraint.max}
                step={constraint.step}
                onChange={(value) => updateTuning(key, value)}
              />
            </Field>
          );
        })}
      </FieldSet>
      <Button main onClick={persist}>PERSIST PRESENTATION VALUES</Button>
      <p>{status}</p>
      <p>Matrices, coordinates, and other mathematical values are not editable here.</p>
    </Pane>
  );
}

function drawCross(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
) {
  context.beginPath();
  context.moveTo(x - radius, y);
  context.lineTo(x + radius, y);
  context.moveTo(x, y - radius);
  context.lineTo(x, y + radius);
  context.stroke();
}

function useOverlayDraw(): PluginDrawFunction {
  const scene = useCurrentScene();
  const frame = useCurrentFrame();
  const toggles = overlayToggles.value;
  const activeBeat = beatAtFrame(
    MATRIX_TRANSFORMATION_BEAT_CONTRACT,
    frame,
    30,
  );

  return (context, matrix) => {
    if (!scene || !activeBeat) return;
    const snapshot = sampleSceneGraphDetailed(scene as Scene);
    const nodes = Object.values(snapshot.nodes).filter(
      ({key, opacity}) =>
        opacity > 0.06 &&
        (key.startsWith("semantic:") || key.startsWith("presentation:")),
    );
    const focal = new Set(
      nodes
        .filter(({key}) =>
          activeBeat.focalObjects.some((selector) =>
            selectorMatches(selector, key),
          ),
        )
        .map(({key}) => key),
    );

    if (frame < previousFrame) trajectories.clear();
    previousFrame = frame;
    for (const node of nodes) {
      if (!focal.has(node.key)) continue;
      const path = trajectories.get(node.key) ?? [];
      const previous = path.at(-1);
      if (!previous || Math.hypot(previous.x - node.x, previous.y - node.y) > 1) {
        path.push({x: node.x, y: node.y});
        if (path.length > 160) path.shift();
      }
      trajectories.set(node.key, path);
    }

    context.save();
    context.setTransform(matrix);
    context.lineWidth = 1.5;
    context.font = "12px ui-monospace, monospace";

    if (toggles.safeFrame) {
      context.strokeStyle = "rgba(255, 210, 90, 0.8)";
      context.setLineDash([8, 6]);
      context.strokeRect(-SAFE_WIDTH / 2, -SAFE_HEIGHT / 2, SAFE_WIDTH, SAFE_HEIGHT);
      context.setLineDash([]);
    }

    if (toggles.lattice) {
      context.strokeStyle = "rgba(110, 220, 255, 0.5)";
      for (let x = -6; x <= 6; x += 1) {
        for (let y = -4; y <= 4; y += 1) {
          drawCross(context, x * SCALE, y * SCALE, 2.5);
        }
      }
    }
    if (toggles.origin) {
      context.strokeStyle = "#ff5f6d";
      context.lineWidth = 2.5;
      drawCross(context, 0, 0, 11);
      context.fillStyle = "#ff5f6d";
      context.fillText("origin (0,0)", 14, -10);
    }

    nodes.forEach((node, index) => {
      const color = stableIdentityColor(node.key);
      if (toggles.bounds || (toggles.focalObjects && focal.has(node.key))) {
        context.strokeStyle = focal.has(node.key) ? "#ffdf65" : color;
        context.lineWidth = focal.has(node.key) ? 3 : 1;
        context.strokeRect(
          node.x - node.width / 2,
          node.y - node.height / 2,
          node.width,
          node.height,
        );
      }
      if (toggles.semanticIds || toggles.identity || toggles.zOrder) {
        const parts = [
          toggles.semanticIds ? node.key : "",
          toggles.identity ? `id:${color.slice(4, 9)}` : "",
          toggles.zOrder ? `z:${index}` : "",
        ].filter(Boolean);
        context.fillStyle = color;
        context.fillText(
          parts.join(" · "),
          node.x - node.width / 2,
          node.y - node.height / 2 - 4,
        );
      }
    });

    if (toggles.motionPaths) {
      for (const [key, path] of trajectories) {
        if (path.length < 2) continue;
        context.strokeStyle = stableIdentityColor(key);
        context.beginPath();
        path.forEach((point, index) =>
          index === 0
            ? context.moveTo(point.x, point.y)
            : context.lineTo(point.x, point.y),
        );
        context.stroke();
      }
    }

    if (toggles.diagnostics) {
      const origin = snapshot.nodes["semantic:matrix:origin"];
      const diagnostic = diagnoseOriginOnLattice(
        {x: origin?.x ?? Number.NaN, y: origin?.y ?? Number.NaN},
        {x: 0, y: 0},
        SCALE,
      );
      context.fillStyle = diagnostic.pass ? "#65e6a6" : "#ff5f6d";
      diagnostic.message.split("\n").forEach((line, index) =>
        context.fillText(line, -462, -248 + index * 15),
      );
    }

    if (toggles.beat) {
      context.fillStyle = "#ffffff";
      context.fillText(
        `chapter:${activeBeat.chapter.id} · beat:${activeBeat.id} · frame:${frame}`,
        -462,
        254,
      );
    }
    context.restore();
  };
}

export default makeEditorPlugin({
  name: "technical-learning-animation-authoring",
  tabs: [
    {
      name: "animation-authoring",
      tabComponent: TabButton,
      paneComponent: AuthoringPane,
    },
  ],
  previewOverlay: {drawHook: useOverlayDraw},
  settings: (settings) => ({
    ...settings,
    variables: {
      ...settings.variables,
      ...MATRIX_TRANSFORMATION_PROJECT_VARIABLES,
    },
  }),
});
