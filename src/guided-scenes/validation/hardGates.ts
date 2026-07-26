import {
  STAGE_BOUNDS,
  isNested,
  isVisible,
  type NodeSample,
  type SceneFrameSample,
  type SceneGateFinding,
  type SceneGateRun,
} from "./gateTypes";
import { checkBeatIntents } from "./beatIntentGates";
import {
  checkNoUnmeasuredGeometry,
  checkSemanticGeometry,
} from "./semanticGates";

export { checkBeatIntents, checkNoUnmeasuredGeometry, checkSemanticGeometry };

/**
 * Production hard gates for guided scenes.
 *
 * Each gate is a defect class the animation benchmark laboratory demonstrated
 * is objectively detectable: mathematical/diagram invalidity, discontinuities,
 * stale or missing claimed motion, clipping, broken seeking, and text that
 * destroys the reading of the frame. NOTHING here is a matter of taste —
 * composition, pacing, and typography differences are craft findings and live
 * in the laboratory's craft dimension, never in this file.
 *
 * All gates are pure `(run) -> findings`, so every one is unit-testable
 * against a synthetic run with no browser.
 */

/**
 * Text may never be cut off by the stage edge.
 *
 * Horizontal ink measures accurately (a glyph run's box is its advance
 * width), so sideways clipping — the failure `safeFrame.ts` was written to
 * prevent, where a long centre-anchored caption placed at a left-edge x loses
 * half its string — is checked to the pixel.
 */
export const TEXT_CLIP_TOLERANCE_X_PX = 1;

/**
 * Vertically, a text box is NOT ink: Motion Canvas includes line leading and
 * the node's own padding below the final line, which measured ~38px of empty
 * space under a two-line 40px caption sitting on LABEL_BOTTOM_Y. Allowing for
 * that keeps the gate honest — a caption that truly loses a line is off by a
 * full line height and is still caught.
 */
export const TEXT_CLIP_TOLERANCE_Y_PX = 44;

/**
 * The narrower text must be at least this much inside the other horizontally
 * before the pair counts as colliding rather than sitting side by side.
 */
export const TEXT_OVERLAP_AXIS_FRACTION = 0.5;

/**
 * Glyph bands must stay merged for this long before it is a defect.
 *
 * A label crossing another during an authored merge is choreography, not
 * garbled text; text that stays on text is unreadable.
 */
export const TEXT_OVERLAP_MIN_SECONDS = 0.35;

/**
 * …and they must interpenetrate by this fraction of the smaller band.
 *
 * Em boxes that merely graze are tight typography, not garbled text: two
 * labels 48px apart touch by 0.4px, and a caption clears the label beneath it
 * by 2px of real ink. Requiring genuine interpenetration keeps this gate
 * reporting only text a reader cannot separate — tightness is craft, and the
 * benchmark laboratory is where it belongs.
 */
export const TEXT_OVERLAP_BAND_DEPTH = 0.35;

/** A node moving further than this between adjacent sampled frames teleported. */
export const TELEPORT_PX_PER_FRAME = 90;

/**
 * When at least this fraction of visible nodes move together, the frame is an
 * authored cut (a scene-wide reset), not one object teleporting.
 */
export const SCENE_CUT_FRACTION = 0.25;

/** Vanishing and returning inside this window is a flicker, not a chapter change. */
export const FLICKER_WINDOW_SECONDS = 0.6;

/**
 * A node must have been at least this opaque in the sample immediately before
 * it vanished — and again in the sample where it returns — for the round trip
 * to count as a flicker.
 *
 * Crossfades pass through the middle: retiring an eigen-fan ramps 0.9 → 0.72
 * → 0.06 → 0, and a caption swapping its text fades down and back up the same
 * way. Both are correct practice and both dip below the visibility threshold.
 * A flicker is the thing a crossfade is not: a hard cut out and a hard cut
 * back, with no animated shoulder on either side.
 */
export const FLICKER_ABRUPT_OPACITY = 0.85;

function visibleNodes(frame: SceneFrameSample): NodeSample[] {
  return Object.values(frame.nodes).filter(isVisible);
}

function isText(sample: NodeSample): boolean {
  return sample.type === "Txt" && !!sample.text && sample.text.trim().length > 0;
}


/**
 * Gate: text must stay inside the stage.
 *
 * The repo's safe-frame convention exists because a long centre-anchored `Txt`
 * placed at a left-edge x clips half the string (see safeFrame.ts). Geometry
 * may bleed off-frame deliberately; a caption that does is unreadable.
 */
export function checkTextWithinStage(run: SceneGateRun): SceneGateFinding[] {
  const findings: SceneGateFinding[] = [];
  const worstByKey = new Map<
    string,
    { overflow: number; frame: number; sample: NodeSample; axis: string }
  >();

  for (const frame of run.frames) {
    for (const sample of visibleNodes(frame)) {
      if (!isText(sample)) continue;
      const overflowX =
        Math.abs(sample.x) + sample.width / 2 - STAGE_BOUNDS.halfWidth;
      const overflowY =
        Math.abs(sample.y) + sample.height / 2 - STAGE_BOUNDS.halfHeight;
      const clippedX = overflowX > TEXT_CLIP_TOLERANCE_X_PX;
      const clippedY = overflowY > TEXT_CLIP_TOLERANCE_Y_PX;
      if (!clippedX && !clippedY) continue;
      const overflow = clippedX ? overflowX : overflowY;
      const axis = clippedX ? "side" : "top/bottom";
      const previous = worstByKey.get(sample.key);
      if (!previous || overflow > previous.overflow) {
        worstByKey.set(sample.key, { overflow, frame: frame.frame, sample, axis });
      }
    }
  }

  for (const { overflow, frame, sample, axis } of worstByKey.values()) {
    findings.push({
      gate: "text-clipping",
      sceneId: run.sceneId,
      nodeKey: sample.key,
      frame,
      measured: Math.round(overflow),
      limit: axis === "side" ? TEXT_CLIP_TOLERANCE_X_PX : TEXT_CLIP_TOLERANCE_Y_PX,
      message:
        `text "${truncate(sample.text!)}" extends ${Math.round(overflow)}px past ` +
        `the ${axis} stage edge at frame ${frame} — the caption is clipped`,
    });
  }
  return findings;
}

/**
 * Gate: text must not be printed on top of other text.
 *
 * Two decisions make this gate trustworthy rather than noisy, and both were
 * settled by looking at the rendered frames it fired on:
 *
 *  - It reasons in FONT SIZE, not boxes. A text node's box carries line
 *    leading and padding (up to ~3.4× the glyph height for overlay captions),
 *    so box overlap "finds" collisions between a title and the subtitle
 *    stacked neatly beneath it. Two texts collide when their glyph bands
 *    actually meet.
 *  - It requires PERSISTENCE. One label sliding across another during an
 *    authored merge (elimination slides a scratch row onto R2 and the two
 *    read as one for a beat) is choreography. Text parked on text long
 *    enough to be read as a state is the defect.
 */
export function checkTextOverlap(run: SceneGateRun): SceneGateFinding[] {
  const findings: SceneGateFinding[] = [];
  const sampleSeconds = run.stride / run.fps;
  const minFrames = Math.max(2, Math.ceil(TEXT_OVERLAP_MIN_SECONDS / sampleSeconds));
  /** pairKey -> run of consecutive overlapping samples. */
  const streaks = new Map<
    string,
    { count: number; firstFrame: number; a: NodeSample; b: NodeSample; fraction: number }
  >();
  const reported = new Set<string>();

  for (const frame of run.frames) {
    const texts = visibleNodes(frame).filter(isText);
    const overlappingNow = new Set<string>();

    for (let i = 0; i < texts.length; i += 1) {
      for (let j = i + 1; j < texts.length; j += 1) {
        const a = texts[i]!;
        const b = texts[j]!;
        if (isNested(a, b)) continue;

        // Require real horizontal containment of the narrower text.
        const widthA = glyphWidth(a);
        const widthB = glyphWidth(b);
        const dx =
          Math.min(a.x + widthA / 2, b.x + widthB / 2) -
          Math.max(a.x - widthA / 2, b.x - widthB / 2);
        if (dx <= 0) continue;
        const horizontalFraction = dx / Math.min(widthA, widthB);
        if (horizontalFraction < TEXT_OVERLAP_AXIS_FRACTION) continue;

        // Vertically, compare glyph bands derived from font size.
        const bandA = glyphHalfHeight(a);
        const bandB = glyphHalfHeight(b);
        const verticalGap = Math.abs(a.y - b.y) - (bandA + bandB);
        if (verticalGap > 0) continue;
        const depth = -verticalGap / (2 * Math.min(bandA, bandB));
        if (depth < TEXT_OVERLAP_BAND_DEPTH) continue;

        const pairKey = [a.key, b.key].sort().join("|");
        if (reported.has(pairKey)) continue;
        overlappingNow.add(pairKey);
        const streak = streaks.get(pairKey);
        const fraction = Math.min(1, -verticalGap / (2 * Math.min(bandA, bandB)));
        if (streak) {
          streak.count += 1;
          streak.fraction = Math.max(streak.fraction, fraction);
        } else {
          streaks.set(pairKey, {
            count: 1,
            firstFrame: frame.frame,
            a,
            b,
            fraction,
          });
        }
      }
    }

    // Any pair that stopped overlapping never became a state; drop its streak.
    for (const key of [...streaks.keys()]) {
      if (!overlappingNow.has(key)) streaks.delete(key);
    }

    for (const [key, streak] of streaks) {
      if (streak.count < minFrames || reported.has(key)) continue;
      reported.add(key);
      findings.push({
        gate: "text-overlap",
        sceneId: run.sceneId,
        nodeKey: streak.a.key,
        frame: streak.firstFrame,
        measured: Math.round(streak.count * sampleSeconds * 100) / 100,
        limit: TEXT_OVERLAP_MIN_SECONDS,
        message:
          `"${truncate(streak.a.text!)}" and "${truncate(streak.b.text!)}" are ` +
          `printed over each other for ${(streak.count * sampleSeconds).toFixed(2)}s ` +
          `from frame ${streak.firstFrame} — the text is unreadable`,
      });
    }
  }
  return findings;
}

/**
 * Average glyph advance as a fraction of the font size, for the repo's sans
 * stack. Used to bound ink width the same way {@link GLYPH_BAND_EM} bounds
 * ink height: a short label's box is padded far wider than its glyph (a
 * single "x" at 28px measures 81px wide), while a long string's box is
 * accurate — so the smaller of the two is the honest figure.
 */
export const GLYPH_ADVANCE_EM = 0.62;

function glyphWidth(sample: NodeSample): number {
  if (!sample.fontSize || !sample.text) return sample.width;
  const characters = Math.max(1, sample.text.trim().length);
  return Math.min(sample.width, characters * sample.fontSize * GLYPH_ADVANCE_EM);
}

/**
 * Half the height of a text node's glyph band.
 *
 * `GLYPH_BAND_EM` is the em box — ascender to descender for the repo's sans
 * stack — and is capped by the measured box so a genuinely multi-line caption
 * still reports its real extent. Anything more generous re-invents the leading
 * this gate exists to see past: at 1.4em, a title and the subtitle 35px below
 * it "collide" by 3px when their ink is 8px apart.
 */
export const GLYPH_BAND_EM = 1.1;

function glyphHalfHeight(sample: NodeSample): number {
  const fromFont = sample.fontSize
    ? (sample.fontSize * GLYPH_BAND_EM) / 2
    : undefined;
  const fromBox = sample.height / 2;
  return fromFont === undefined ? fromBox : Math.min(fromFont, fromBox);
}

/**
 * Gate: an object may not teleport.
 *
 * A node that jumps while the rest of the frame moves continuously has lost
 * its identity — the learner cannot follow it. Authored scene-wide cuts (a
 * reset to the identity before the next preset) move most of the frame at
 * once and are exempt.
 */
export function checkNoTeleports(run: SceneGateRun): SceneGateFinding[] {
  const findings: SceneGateFinding[] = [];
  const allowed = TELEPORT_PX_PER_FRAME * run.stride;
  const worstByKey = new Map<string, { step: number; frame: number }>();

  for (let i = 1; i < run.frames.length; i += 1) {
    const previous = run.frames[i - 1]!;
    const current = run.frames[i]!;
    const jumped: { key: string; step: number }[] = [];
    let comparable = 0;

    for (const sample of visibleNodes(current)) {
      const before = previous.nodes[sample.key];
      if (!isVisible(before)) continue;
      comparable += 1;
      const step = Math.hypot(sample.x - before.x, sample.y - before.y);
      if (step > allowed) jumped.push({ key: sample.key, step });
    }

    if (comparable === 0) continue;
    // A scene-wide cut moves most of the frame at once; that is authored.
    if (jumped.length / comparable >= SCENE_CUT_FRACTION) continue;

    for (const { key, step } of jumped) {
      const previousWorst = worstByKey.get(key);
      if (!previousWorst || step > previousWorst.step) {
        worstByKey.set(key, { step, frame: current.frame });
      }
    }
  }

  for (const [key, { step, frame }] of worstByKey) {
    findings.push({
      gate: "teleport",
      sceneId: run.sceneId,
      nodeKey: key,
      frame,
      measured: Math.round(step),
      limit: allowed,
      message:
        `node ${key} jumps ${Math.round(step)}px at frame ${frame} while the ` +
        `rest of the frame moves continuously — the object loses its identity`,
    });
  }
  return findings;
}

/**
 * Gate: an object may not blink.
 *
 * Vanishing and coming back within a fraction of a second reads as a glitch,
 * and it is how identity gets faked by an opacity swap instead of a move.
 */
export function checkNoFlicker(run: SceneGateRun): SceneGateFinding[] {
  const findings: SceneGateFinding[] = [];
  const lastVisibleAt = new Map<string, number>();
  const goneSince = new Map<string, number>();
  /** Opacity in the sample immediately before the node vanished. */
  const opacityBefore = new Map<string, number>();
  const lastOpacity = new Map<string, number>();
  const reported = new Set<string>();

  for (const frame of run.frames) {
    const keys = new Set(Object.keys(frame.nodes));
    for (const key of keys) {
      const sample = frame.nodes[key]!;
      if (isVisible(sample)) {
        const hiddenAt = goneSince.get(key);
        if (hiddenAt !== undefined) {
          const gap = frame.time - hiddenAt;
          const wasAbrupt =
            (opacityBefore.get(key) ?? 0) >= FLICKER_ABRUPT_OPACITY &&
            sample.opacity >= FLICKER_ABRUPT_OPACITY;
          if (gap <= FLICKER_WINDOW_SECONDS && wasAbrupt && !reported.has(key)) {
            reported.add(key);
            findings.push({
              gate: "flicker",
              sceneId: run.sceneId,
              nodeKey: key,
              frame: frame.frame,
              measured: Math.round(gap * 100) / 100,
              limit: FLICKER_WINDOW_SECONDS,
              message:
                `node ${key}${sample.text ? ` ("${truncate(sample.text)}")` : ""} ` +
                `disappears and returns after ${gap.toFixed(2)}s at frame ` +
                `${frame.frame} — a flicker, not a transition`,
            });
          }
          goneSince.delete(key);
        }
        lastVisibleAt.set(key, frame.time);
      } else if (lastVisibleAt.has(key) && !goneSince.has(key)) {
        goneSince.set(key, frame.time);
        // Remember how bright it was the sample BEFORE it vanished: a
        // crossfade has already dimmed by then, a hard cut has not.
        opacityBefore.set(key, lastOpacity.get(key) ?? 0);
      }
      lastOpacity.set(key, sample.opacity);
    }
  }
  return findings;
}

/**
 * Gate: seeking straight to a beat must produce the same state as arriving
 * there by playback, from either direction.
 *
 * Chapter chips, the scrubber, and reduced-motion frames all seek; a scene
 * whose state depends on the path taken is broken for every one of them.
 */
export function checkSeekDeterminism(run: SceneGateRun): SceneGateFinding[] {
  const findings: SceneGateFinding[] = [];
  for (const record of run.seekRecords) {
    const hashesMatch = record.hashFromStart === record.hashFromEnd;
    let worstDelta = 0;
    let worstKey = "";
    for (const [key, fromStart] of Object.entries(record.nodesFromStart)) {
      const fromEnd = record.nodesFromEnd[key];
      if (!fromEnd) continue;
      const delta = Math.max(
        Math.hypot(fromStart.x - fromEnd.x, fromStart.y - fromEnd.y),
        Math.abs(fromStart.opacity - fromEnd.opacity) * 20,
      );
      if (delta > worstDelta) {
        worstDelta = delta;
        worstKey = key;
      }
    }
    if (hashesMatch && worstDelta <= 1) continue;
    findings.push({
      gate: "seek-determinism",
      sceneId: run.sceneId,
      segmentId: record.segmentId,
      frame: record.frame,
      nodeKey: worstKey || undefined,
      measured: Math.round(worstDelta * 100) / 100,
      message:
        `seeking to "${record.segmentId}" (frame ${record.frame}) from the ` +
        `start and from the end produce different states ` +
        `(canvas ${hashesMatch ? "matches" : "DIFFERS"}, worst node delta ` +
        `${worstDelta.toFixed(2)}${worstKey ? ` on ${worstKey}` : ""})`,
    });
  }
  return findings;
}

/**
 * Gate: the run must actually have measured the scene.
 *
 * This exists because the first version of the runner sampled ZERO frames
 * (the player's duration arrives asynchronously) and every other gate
 * dutifully reported "no findings" — a clean bill of health for a scene
 * nobody had looked at. An empty run is now a failure, not a pass.
 */
export function checkRunSampledScene(run: SceneGateRun): SceneGateFinding[] {
  const findings: SceneGateFinding[] = [];
  if (run.durationFrames <= 0) {
    findings.push({
      gate: "gate-coverage",
      sceneId: run.sceneId,
      message: "the scene reported no duration — nothing was measured",
    });
  }
  if (run.frames.length === 0) {
    findings.push({
      gate: "gate-coverage",
      sceneId: run.sceneId,
      measured: 0,
      message:
        "no frames were sampled — a gate run over zero frames cannot clear a scene",
    });
    return findings;
  }
  const withNodes = run.frames.filter((f) => Object.keys(f.nodes).length > 0);
  if (withNodes.length === 0) {
    findings.push({
      gate: "gate-coverage",
      sceneId: run.sceneId,
      measured: 0,
      message:
        "every sampled frame contained zero nodes — the scene graph was never read",
    });
  }
  if (run.seekRecords.length === 0 && run.segments.length > 0) {
    findings.push({
      gate: "gate-coverage",
      sceneId: run.sceneId,
      message: "no seek-determinism records were captured for a segmented scene",
    });
  }
  return findings;
}

/** Gate: the stage may never go blank mid-timeline. */
export function checkNoEmptyFrames(run: SceneGateRun): SceneGateFinding[] {
  const findings: SceneGateFinding[] = [];
  for (const frame of run.frames) {
    if (visibleNodes(frame).length > 0) continue;
    findings.push({
      gate: "empty-frame",
      sceneId: run.sceneId,
      frame: frame.frame,
      message: `frame ${frame.frame} (${frame.time.toFixed(2)}s) renders nothing visible`,
    });
  }
  return findings;
}

/** Gate: no segment body may outgrow its declared duration. */
export function checkNoOverruns(run: SceneGateRun): SceneGateFinding[] {
  return run.overruns.map((overrun) => ({
    gate: "segment-overrun",
    sceneId: run.sceneId,
    segmentId: overrun.label,
    measured: overrun.measured,
    limit: overrun.declared,
    message:
      `segment ${overrun.label} ran ${overrun.measured.toFixed(2)}s of a ` +
      `declared ${overrun.declared}s — every later chapter marker is offset`,
  }));
}

/** Every gate, in reporting order. Coverage first: it validates the rest. */
export const SCENE_HARD_GATES = [
  checkRunSampledScene,
  checkNoUnmeasuredGeometry,
  checkSemanticGeometry,
  checkBeatIntents,
  checkNoTeleports,
  checkNoFlicker,
  checkTextWithinStage,
  checkTextOverlap,
  checkSeekDeterminism,
  checkNoEmptyFrames,
  checkNoOverruns,
] as const;

/** Run every hard gate over one sampled scene. */
export function runSceneHardGates(run: SceneGateRun): SceneGateFinding[] {
  return SCENE_HARD_GATES.flatMap((gate) => gate(run));
}

function truncate(text: string, max = 42): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
}
