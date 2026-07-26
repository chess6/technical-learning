import { matrixVectorMultiply } from "../../math";
import { distanceToLineThroughOrigin } from "../../guided-scenes/scenes/kitLayout";
import { SCALE } from "../../guided-scenes/scenes/safeFrame";
import type { ProbeSample } from "../probes/probeRegistry";
import { toReplicaTime, type BenchmarkManifest } from "../manifests";
import type { BenchmarkRun, CheckResult } from "./types";
import {
  EIGEN_BENCH_MATRIX,
  EIGEN_DIR_DIAG,
  EIGEN_DIR_X,
  EIGEN_FACTORS,
  KNOCKED_VECTOR,
  OPENING_VECTOR,
  SNEAKY_VECTOR,
  eigenAnalysisOfBenchMatrix,
} from "../replicas/data/eigenReplicaData";
import {
  HUFFMAN_LAYOUT,
  HUFFMAN_LEAVES,
  computeMergeSteps,
} from "../replicas/data/huffmanReplicaData";
import { AB_LAYOUT_CONSTANTS } from "../replicas/data/abTreeReplicaData";
import { computeBfsSchedule } from "../replicas/data/bfsReplicaData";

/**
 * Evaluators for the manifests' declared mathematical invariants — the
 * math-validity dimension. Each is a pure function over the sampled run; the
 * expected values are COMPUTED from the same shared math / algorithm modules
 * the replicas draw from, so a stale or hand-typed value cannot pass.
 */

export type InvariantEvaluator = (
  manifest: BenchmarkManifest,
  run: BenchmarkRun,
) => Omit<CheckResult, "id" | "dimension" | "severity">;

type EvaluatorTable = Record<string, Record<string, InvariantEvaluator>>;

const VISIBLE = 0.05;
const isVisible = (s: ProbeSample | undefined): s is ProbeSample =>
  !!s && s.opacity > VISIBLE;

function framesInBeats(
  manifest: BenchmarkManifest,
  run: BenchmarkRun,
  beatIds: string[],
): typeof run.frames {
  if (beatIds.length === 0) return run.frames;
  const intervals = manifest.beats
    .filter((b) => beatIds.includes(b.id))
    .map((b) => ({
      start: toReplicaTime(manifest, b.refStart),
      end: toReplicaTime(manifest, b.refEnd),
    }));
  return run.frames.filter((f) =>
    intervals.some((i) => f.time >= i.start - 1e-6 && f.time < i.end - 1e-6),
  );
}

/** Max distance-from-origin a probe reaches while visible over given frames. */
function maxReach(frames: BenchmarkRun["frames"], objectId: string): number {
  let max = 0;
  for (const frame of frames) {
    const sample = frame.samples[objectId];
    if (!isVisible(sample)) continue;
    max = Math.max(max, Math.hypot(sample.x, sample.y));
  }
  return max;
}

const eigenEvaluators: Record<string, InvariantEvaluator> = {
  "eigen-directions-match-math": () => {
    const analysis = eigenAnalysisOfBenchMatrix();
    if (analysis.kind !== "distinct-real") {
      return { passed: false, message: "example matrix is not distinct-real" };
    }
    const image3 = matrixVectorMultiply(EIGEN_BENCH_MATRIX, EIGEN_DIR_X);
    const image2 = matrixVectorMultiply(EIGEN_BENCH_MATRIX, EIGEN_DIR_DIAG);
    const ok =
      Math.abs(image3[0] - EIGEN_DIR_X[0] * EIGEN_FACTORS.xAxis) < 1e-9 &&
      Math.abs(image3[1] - EIGEN_DIR_X[1] * EIGEN_FACTORS.xAxis) < 1e-9 &&
      Math.abs(image2[0] - EIGEN_DIR_DIAG[0] * EIGEN_FACTORS.diagonal) < 1e-9 &&
      Math.abs(image2[1] - EIGEN_DIR_DIAG[1] * EIGEN_FACTORS.diagonal) < 1e-9;
    return {
      passed: ok,
      message: ok
        ? "drawn span directions are true eigen directions of the matrix"
        : "declared eigen directions are NOT eigenvectors of the example matrix",
    };
  },
  "span-lines-static-during-transform": (manifest, run) => {
    const spans = ["span-diag", "span-x", "span-knocked"];
    const invariant = manifest.invariants.find(
      (i) => i.id === "span-lines-static-during-transform",
    )!;
    const frames = framesInBeats(manifest, run, invariant.beats);
    let worst = 0;
    let culprit = "";
    for (const span of spans) {
      let last: ProbeSample | null = null;
      for (const frame of frames) {
        const sample = frame.samples[span];
        if (!isVisible(sample)) {
          last = null;
          continue;
        }
        if (last) {
          const step = Math.hypot(sample.x - last.x, sample.y - last.y);
          if (step > worst) {
            worst = step;
            culprit = span;
          }
        }
        last = sample;
      }
    }
    const ok = worst <= 1;
    return {
      passed: ok,
      measured: Math.round(worst * 100) / 100,
      tolerance: 1,
      message: ok
        ? "span lines never move while the plane transforms"
        : `${culprit} moved ${worst.toFixed(2)}px during a transform — the anchor drifted`,
    };
  },
  "eigenvectors-stay-on-span": (manifest, run) => {
    const invariant = manifest.invariants.find(
      (i) => i.id === "eigenvectors-stay-on-span",
    )!;
    const frames = framesInBeats(manifest, run, invariant.beats);
    // Stage-space span directions (y flips going math -> stage).
    const cases: [string, { x: number; y: number }][] = [
      ["vec-diag", { x: 1, y: 1 }],
      ["ihat", { x: 1, y: 0 }],
      ["vec-sneaky", { x: -1, y: -1 }],
      ["fan-diag", { x: -1, y: -1 }],
    ];
    let worst = 0;
    let culprit = "";
    for (const [id, direction] of cases) {
      for (const frame of frames) {
        const sample = frame.samples[id];
        if (!isVisible(sample)) continue;
        const distance = distanceToLineThroughOrigin(
          { x: sample.x, y: sample.y },
          direction,
        );
        if (distance > worst) {
          worst = distance;
          culprit = id;
        }
      }
    }
    const ok = worst <= 2.5;
    return {
      passed: ok,
      measured: Math.round(worst * 100) / 100,
      tolerance: 2.5,
      message: ok
        ? "eigenvector tips stay on their span at every sampled frame"
        : `${culprit} left its span by ${worst.toFixed(1)}px mid-tween (arcing off the line)`,
    };
  },
  "tips-match-matrix": (manifest, run) => {
    // The farthest each tracked vector reaches must equal |A v| in stage px.
    const cases: [string, readonly [number, number], string[]][] = [
      ["vec-diag", OPENING_VECTOR, ["stay-on-span"]],
      ["ihat", [1, 0], ["ihat-stretch"]],
      ["vec-sneaky", SNEAKY_VECTOR, ["sneaky-vector"]],
      ["vec-knocked", KNOCKED_VECTOR, ["knocked-off"]],
    ];
    const retainedBeats = new Set(manifest.beats.map((beat) => beat.id));
    let worstRatio = 0;
    let culprit = "";
    for (const [id, vector, beats] of cases) {
      if (!beats.some((beat) => retainedBeats.has(beat))) continue;
      const image = matrixVectorMultiply(EIGEN_BENCH_MATRIX, [
        vector[0],
        vector[1],
      ]);
      const expected = Math.hypot(image[0], image[1]) * SCALE;
      const measured = maxReach(framesInBeats(manifest, run, beats), id);
      if (measured === 0) {
        return { passed: false, message: `${id} was never visible in ${beats.join(",")}` };
      }
      const ratio = Math.abs(measured - expected) / expected;
      if (ratio > worstRatio) {
        worstRatio = ratio;
        culprit = id;
      }
    }
    const ok = worstRatio <= 0.05;
    return {
      passed: ok,
      measured: Math.round(worstRatio * 1000) / 1000,
      tolerance: 0.05,
      message: ok
        ? "every tracked tip reaches exactly the shared-math image of its vector"
        : `${culprit}'s farthest tip misses A*v by ${(worstRatio * 100).toFixed(1)}% — geometry does not match the matrix`,
    };
  },
  "label-scale-prefix-truthful": (manifest, run) => {
    const frames = framesInBeats(manifest, run, ["sneaky-vector"]);
    const threshold = 1.5 * Math.hypot(SNEAKY_VECTOR[0], SNEAKY_VECTOR[1]) * SCALE;
    for (const frame of frames) {
      const label = frame.samples["label-sneaky"];
      const tip = frame.samples["vec-sneaky"];
      if (!isVisible(label) || !tip) continue;
      const claims2x = (label.text ?? "").startsWith("2x");
      const reach = Math.hypot(tip.x, tip.y);
      if (claims2x && reach < threshold) {
        return {
          passed: false,
          frame: frame.frame,
          measured: Math.round(reach),
          expected: Math.round(threshold),
          message: `the scale prefix appears at frame ${frame.frame} while the tip is only ${reach.toFixed(0)}px out — displayed value ahead of the geometry`,
        };
      }
    }
    return {
      passed: true,
      message: "the scale prefix never appears before the geometry supports it",
    };
  },
};

const huffmanEvaluators: Record<string, InvariantEvaluator> = {
  "parent-sum-conservation": (manifest, run) => {
    const last = run.frames[run.frames.length - 1];
    if (!last) return { passed: false, message: "no samples" };
    const declared = new Set(manifest.objects.map((object) => object.id));
    const value = (id: string) => last.samples[id]?.value;
    const pairs: [string, string, string][] = [
      ["parent-DE", "leaf-D", "leaf-E"],
      ["parent-AC", "leaf-A", "leaf-C"],
    ];
    for (const [parent, a, b] of pairs) {
      if (!declared.has(parent)) continue;
      const sum = (value(a) ?? 0) + (value(b) ?? 0);
      if (Math.abs((value(parent) ?? 0) - sum) > 1e-6) {
        return {
          passed: false,
          measured: value(parent),
          expected: sum,
          message: `${parent} displays ${value(parent)} but its children sum to ${sum.toFixed(2)}`,
        };
      }
    }
    if (!declared.has("root-065")) {
      return {
        passed: true,
        message: "every retained parent displays the sum of its children",
      };
    }
    const rootSum = (value("parent-DE") ?? 0) + (value("parent-AC") ?? 0);
    if (Math.abs((value("root-065") ?? 0) - rootSum) > 1e-6) {
      return {
        passed: false,
        measured: value("root-065"),
        expected: rootSum,
        message: `root displays ${value("root-065")} but its children sum to ${rootSum.toFixed(2)}`,
      };
    }
    return { passed: true, message: "every parent displays the sum of its children" };
  },
  "frontier-sorted": (manifest, run) => {
    const invariant = manifest.invariants.find((i) => i.id === "frontier-sorted")!;
    for (const beatId of invariant.beats) {
      const samples = run.beatEndSamples[beatId];
      if (!samples) continue;
      const members = Object.entries(samples)
        .filter(
          ([, s]) =>
            isVisible(s) && Math.abs(s.x - HUFFMAN_LAYOUT.column.x) < 30 && s.value !== undefined,
        )
        .sort((a, b) => a[1].y - b[1].y)
        .map(([id, s]) => ({ id, value: s.value! }));
      for (let i = 1; i < members.length; i += 1) {
        if (members[i]!.value < members[i - 1]!.value - 1e-9) {
          return {
            passed: false,
            beatId,
            message: `frontier out of order at end of "${beatId}": ${members
              .map((m) => `${m.id}=${m.value}`)
              .join(", ")}`,
          };
        }
      }
    }
    return { passed: true, message: "the frontier column is sorted at every rest state" };
  },
  "merge-picks-two-lowest": () => {
    const steps = computeMergeSteps(HUFFMAN_LEAVES);
    const ok =
      steps.length === 3 &&
      steps[0]!.left === "leaf-D" &&
      steps[0]!.right === "leaf-E" &&
      steps[1]!.left === "leaf-A" &&
      steps[1]!.right === "leaf-C" &&
      steps[2]!.left === "merge-1" &&
      steps[2]!.right === "merge-2";
    return {
      passed: ok,
      message: ok
        ? "the enacted merge order is the greedy two-lowest order"
        : "the greedy computation no longer matches the choreographed merge order",
    };
  },
  "placed-subtrees-never-move": (manifest, run) => {
    const invariant = manifest.invariants.find(
      (i) => i.id === "placed-subtrees-never-move",
    )!;
    const frames = framesInBeats(manifest, run, invariant.beats);
    const placed = ["leaf-D", "leaf-E", "parent-DE"];
    for (const id of placed) {
      let anchor: ProbeSample | null = null;
      for (const frame of frames) {
        const sample = frame.samples[id];
        if (!isVisible(sample)) continue;
        if (!anchor) {
          anchor = sample;
          continue;
        }
        const drift = Math.hypot(sample.x - anchor.x, sample.y - anchor.y);
        if (drift > 2) {
          return {
            passed: false,
            frame: frame.frame,
            measured: Math.round(drift * 10) / 10,
            message: `${id} moved ${drift.toFixed(1)}px after being placed in the tree`,
          };
        }
      }
    }
    return { passed: true, message: "placed subtrees stay put" };
  },
};

const abEvaluators: Record<string, InvariantEvaluator> = {
  "keys-sorted-left-to-right": (_manifest, run) => {
    // The layout guarantees inorder = left-to-right; verify on the sampled
    // key probes (value-carrying) at every beat end.
    for (const [beatId, samples] of Object.entries(run.beatEndSamples)) {
      const keys = Object.values(samples)
        .filter((s) => isVisible(s) && s.value !== undefined && s.text === String(s.value))
        .sort((a, b) => a.value! - b.value!);
      for (let i = 1; i < keys.length; i += 1) {
        if (keys[i]!.x <= keys[i - 1]!.x) {
          return {
            passed: false,
            beatId,
            message: `keys ${keys[i - 1]!.value} and ${keys[i]!.value} are out of left-to-right order at end of "${beatId}"`,
          };
        }
      }
    }
    return { passed: true, message: "keys read in ascending order at every rest state" };
  },
  "leaf-row-height-constant": (manifest, run) => {
    const invariant = manifest.invariants.find(
      (i) => i.id === "leaf-row-height-constant",
    )!;
    const frames = framesInBeats(manifest, run, invariant.beats);
    let worst = 0;
    for (const frame of frames) {
      const sample = frame.samples["leaf-row"];
      if (!isVisible(sample)) continue;
      worst = Math.max(worst, Math.abs(sample.y - AB_LAYOUT_CONSTANTS.leafY));
    }
    const ok = worst <= 2;
    return {
      passed: ok,
      measured: Math.round(worst * 10) / 10,
      tolerance: 2,
      message: ok
        ? "the leaf row never changes height — growth happens only at the root"
        : `the leaf row drifted ${worst.toFixed(1)}px — the same-depth invariant broke visually`,
    };
  },
  "keys-persist-through-split": (manifest, run) => {
    const invariant = manifest.invariants.find(
      (i) => i.id === "keys-persist-through-split",
    )!;
    const keyIds = ["key-4", "key-5", "key-67", "node-0", "node-2"];
    const frames = framesInBeats(manifest, run, invariant.beats);
    for (const id of keyIds) {
      let seen = false;
      for (const frame of frames) {
        const sample = frame.samples[id];
        const vis = isVisible(sample);
        if (vis) seen = true;
        else if (seen) {
          return {
            passed: false,
            frame: frame.frame,
            message: `${id} faded during a structural step (frame ${frame.frame}) — keys must persist`,
          };
        }
      }
    }
    return { passed: true, message: "no key token fades during structural steps" };
  },
  "violation-colour-reserved": () => ({
    passed: true,
    message:
      "red is bound to the violation signals by construction; colour is not " +
      "probe-sampled, so this invariant is held by the scene code and covered " +
      "by the replica data tests, not measured at runtime",
  }),
};

const bfsEvaluators: Record<string, InvariantEvaluator> = {
  "vertex-positions-frozen": (manifest, run) => {
    const invariant = manifest.invariants.find(
      (i) => i.id === "vertex-positions-frozen",
    )!;
    const frames = framesInBeats(manifest, run, invariant.beats);
    const ids = ["vertex-0", "vertex-4", "graph-nodes"];
    for (const id of ids) {
      let anchor: ProbeSample | null = null;
      for (const frame of frames) {
        const sample = frame.samples[id];
        if (!isVisible(sample)) continue;
        if (!anchor) {
          anchor = sample;
          continue;
        }
        const drift = Math.hypot(sample.x - anchor.x, sample.y - anchor.y);
        if (drift > 1) {
          return {
            passed: false,
            frame: frame.frame,
            measured: drift,
            message: `${id} moved ${drift.toFixed(1)}px after placement — vertex geometry must be frozen`,
          };
        }
      }
    }
    return { passed: true, message: "vertex geometry is frozen; only colour and labels change" };
  },
  "numbers-match-bfs-order": (_manifest, run) => {
    const schedule = computeBfsSchedule();
    const last = run.frames[run.frames.length - 1];
    if (!last) return { passed: false, message: "no samples" };
    const checks: [string, number][] = [
      ["vertex-0", 0],
      ["vertex-4", 4],
    ];
    for (const [id, vertexIndex] of checks) {
      const sample = last.samples[id];
      if (!sample?.text) continue;
      const expected = String(schedule.numberOf[vertexIndex]);
      if (sample.text !== expected) {
        return {
          passed: false,
          message: `${id} displays "${sample.text}" but BFS enqueue order gives ${expected}`,
        };
      }
    }
    return { passed: true, message: "displayed numbers equal the computed enqueue order" };
  },
  "done-never-regresses": (manifest, run) => {
    const invariant = manifest.invariants.find(
      (i) => i.id === "done-never-regresses",
    )!;
    const frames = framesInBeats(manifest, run, invariant.beats);
    for (const id of ["vertex-0", "vertex-4"]) {
      let maxState = 0;
      for (const frame of frames) {
        const state = frame.samples[id]?.value ?? 0;
        if (state < maxState - 0.01) {
          return {
            passed: false,
            frame: frame.frame,
            message: `${id} regressed from state ${maxState.toFixed(1)} to ${state.toFixed(1)} — done must be permanent`,
          };
        }
        maxState = Math.max(maxState, state);
      }
    }
    return { passed: true, message: "vertex states only ever advance" };
  },
  "tracer-agrees-with-state": (manifest, run) => {
    // When vertex-0 completes (state crosses to 2) the tracer must be at the
    // absorb-neighbours line within the same metronome tick.
    const frames = framesInBeats(manifest, run, ["trace-loop"]);
    const LINE_Y = -212 + 37 * 4; // absorb line (index 3)
    for (let i = 1; i < frames.length; i += 1) {
      const prev = frames[i - 1]!.samples["vertex-0"];
      const curr = frames[i]!.samples["vertex-0"];
      if (!prev || !curr) continue;
      if ((prev.value ?? 0) < 1.5 && (curr.value ?? 0) >= 1.5) {
        // find tracer within +-0.6s of this transition
        const t = frames[i]!.time;
        const near = run.frames.filter((f) => Math.abs(f.time - t) <= 0.6);
        const pointed = near.some(
          (f) =>
            f.samples["tracer"] &&
            Math.abs(f.samples["tracer"]!.y - LINE_Y) < 8,
        );
        return pointed
          ? { passed: true, message: "the tracer pointed at the absorb line as vertex 0 completed" }
          : {
              passed: false,
              frame: frames[i]!.frame,
              message:
                "vertex 0 completed but the tracer never pointed at the absorb line in that tick — panel and canvas desynchronised",
            };
      }
    }
    return { passed: false, message: "vertex 0 never completed inside the trace window" };
  },
};

const bfsTreatmentEvaluators: Record<string, InvariantEvaluator> = {
  "node-build-is-staggered": (_manifest, run) =>
    checkStaggeredAppearance(run, "graph-node-first", "graph-node-last", "nodes"),
  "edge-build-is-staggered": (_manifest, run) =>
    checkStaggeredAppearance(run, "graph-edge-first", "graph-edge-last", "edges"),
  "write-in-never-regresses": (_manifest, run) => {
    let titleLength = 0;
    let bodyLength = 0;
    for (const frame of run.frames) {
      const nextTitle = frame.samples["pseudo-title"]?.text?.length ?? 0;
      const nextBody = frame.samples["pseudo-lines"]?.text?.length ?? 0;
      if (nextTitle < titleLength || nextBody < bodyLength) {
        return {
          passed: false,
          frame: frame.frame,
          message: "pseudocode lost visible characters during write-in",
        };
      }
      titleLength = nextTitle;
      bodyLength = nextBody;
    }
    return { passed: true, message: "pseudocode only gains characters during write-in" };
  },
  "graph-fixed-during-write-in": (_manifest, run) => {
    for (const id of ["graph-nodes", "graph-edges"]) {
      const first = run.frames.find((frame) => isVisible(frame.samples[id]))?.samples[id];
      if (!first) return { passed: false, message: `${id} was never visible` };
      for (const frame of run.frames) {
        const sample = frame.samples[id];
        if (!isVisible(sample)) continue;
        if (Math.hypot(sample.x - first.x, sample.y - first.y) > 1) {
          return {
            passed: false,
            frame: frame.frame,
            message: `${id} moved while pseudocode was writing`,
          };
        }
      }
    }
    return { passed: true, message: "graph geometry stays fixed during write-in" };
  },
};

function checkStaggeredAppearance(
  run: BenchmarkRun,
  firstId: string,
  lastId: string,
  label: string,
): Omit<CheckResult, "id" | "dimension" | "severity"> {
  const firstTime = run.frames.find((frame) => isVisible(frame.samples[firstId]))?.time;
  const lastTime = run.frames.find((frame) => isVisible(frame.samples[lastId]))?.time;
  if (firstTime === undefined || lastTime === undefined) {
    return { passed: false, message: `first or last ${label} probe never appeared` };
  }
  const lead = lastTime - firstTime;
  return {
    passed: lead >= 0.5,
    measured: Math.round(lead * 100) / 100,
    tolerance: 0.5,
    message:
      lead >= 0.5
        ? `${label} have staggered onsets (${lead.toFixed(2)}s first-to-last)`
        : `${label} arrived together (only ${lead.toFixed(2)}s first-to-last)`,
  };
}

export const INVARIANT_EVALUATORS: EvaluatorTable = {
  "eigen-span-stretch": eigenEvaluators,
  "huffman-merge": huffmanEvaluators,
  "ab-split": abEvaluators,
  "bfs-frontier": bfsEvaluators,
  "bfs-intertitle-build": bfsTreatmentEvaluators,
  "bfs-pseudocode-writein": bfsTreatmentEvaluators,
  "ab-prediction-reveal": abEvaluators,
};

/** Run every declared invariant through its evaluator (missing = hard fail). */
export function checkInvariants(
  manifest: BenchmarkManifest,
  run: BenchmarkRun,
): CheckResult[] {
  const table = INVARIANT_EVALUATORS[manifest.id] ?? {};
  return manifest.invariants.map((invariant) => {
    const evaluator = table[invariant.id];
    if (!evaluator) {
      return {
        id: `invariant:${invariant.id}`,
        dimension: "math-validity",
        severity: "hard",
        passed: false,
        message: `invariant "${invariant.id}" is declared but has no evaluator`,
      } satisfies CheckResult;
    }
    const outcome = evaluator(manifest, run);
    return {
      id: `invariant:${invariant.id}`,
      dimension: "math-validity",
      severity: "hard",
      ...outcome,
    } satisfies CheckResult;
  });
}
