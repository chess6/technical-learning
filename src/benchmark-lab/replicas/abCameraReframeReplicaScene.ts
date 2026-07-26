import { Line, Node, Rect, Txt, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  waitFor,
  type ThreadGenerator,
} from "@motion-canvas/core";
import { makeFocusRig } from "../../guided-scenes/scenes/kitMotion";
import { ROLE } from "../../guided-scenes/scenes/semanticRoles";
import { abCameraReframeManifest as manifest } from "../manifests/abCameraReframe";
import { beginProbeRun, registerProbe } from "../probes/probeRegistry";
import { makeEventLogger, runReplicaBeats } from "./replicaKit";

/**
 * Original, reduced diagram for measuring camera treatment. The proof subject
 * is a persistent pair of split nodes; only the world rig moves.
 */
export const abCameraReframeReplicaScene = makeScene2D(function* (view) {
  const ID = manifest.id;
  view.fill(ROLE.background);
  beginProbeRun(ID);
  const logEvent = makeEventLogger(manifest);

  const rig = makeFocusRig();
  view.add(rig.world);

  const context = new Node({ opacity: 0.45 });
  const parent = new Rect({
    width: 130,
    height: 52,
    radius: 20,
    stroke: ROLE.textMuted,
    lineWidth: 3,
    position: new Vector2(0, -120),
  });
  const halves = new Node({});
  const left = new Rect({
    width: 150,
    height: 60,
    radius: 22,
    stroke: ROLE.basis1,
    lineWidth: 4,
    position: new Vector2(-110, 0),
  });
  const right = new Rect({
    width: 150,
    height: 60,
    radius: 22,
    stroke: ROLE.basis2,
    lineWidth: 4,
    position: new Vector2(110, 0),
  });
  halves.add(left);
  halves.add(right);

  for (const x of [-110, 110]) {
    context.add(
      new Line({
        stroke: ROLE.axis,
        lineWidth: 2.5,
        points: [
          new Vector2(0, -94),
          new Vector2(x, -30),
        ],
      }),
    );
  }
  context.add(parent);
  rig.world.add(context);
  rig.world.add(halves);

  const note = new Txt({
    text: "⌊(b + 1) / 2⌋ ≥ a",
    fill: ROLE.selected,
    fontFamily: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif",
    fontSize: 31,
    fontWeight: 650,
    position: new Vector2(0, 82),
    opacity: 0,
  });
  rig.world.add(note);

  registerProbe(ID, "camera-rig", () => ({
    x: rig.focus().x,
    y: rig.focus().y,
    opacity: 1,
    scale: rig.scale(),
  }));
  registerProbe(ID, "proof-halves", () => ({
    x: halves.position().x,
    y: halves.position().y,
    opacity: halves.opacity(),
    width: 370,
    height: 64,
  }));
  registerProbe(ID, "proof-note", () => ({
    x: note.position().x,
    y: note.position().y,
    opacity: note.opacity(),
    width: 250,
    height: 40,
    text: note.text(),
  }));

  const bodies: Record<string, () => ThreadGenerator> = {
    *"wide-context"() {
      yield* waitFor(1.5);
    },
    *"camera-reframe"() {
      logEvent("zoom-to-halves");
      const target = manifest.beats[1]!.camera.target!;
      yield* rig.focusOn(target, target.scale!, 1.5);
    },
    *"local-proof"() {
      yield* waitFor(2.8);
      logEvent("validity-annotated");
      yield* all(note.opacity(1, 0.7), context.opacity(0.18, 0.7));
      yield* waitFor(5.1);
    },
  };

  yield* runReplicaBeats(manifest, bodies);
});
