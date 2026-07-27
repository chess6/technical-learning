import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  DESIGN_EXPERIMENTS,
  getDesignExperiment,
} from "../benchmark-lab/experiments/designExperiments";
import {
  BENCHMARK_MANIFESTS,
  LAB_STAGE,
  REPLICA_FPS,
  getBenchmarkManifest,
  getReferenceWindow,
  referenceFramesUrl,
  toReplicaTime,
  type BenchmarkManifest,
} from "../benchmark-lab/manifests";
import { readProbeEvents, readProbeSamples } from "../benchmark-lab/probes/probeRegistry";
import {
  mountLabPlayer,
  waitForFrame,
  type LabPlayerHandle,
} from "../benchmark-lab/runtime/labPlayer";
import { sampleBenchmark } from "../benchmark-lab/comparison/sampler";
import { postLabArtifact } from "../benchmark-lab/runtime/artifactRequests";
import { runAllChecks } from "../benchmark-lab/comparison/report";
import { buildMeasurementReport } from "../benchmark-lab/comparison/report";
import type { CheckResult, ComparisonReport } from "../benchmark-lab/comparison/types";
import "./DevBenchmarkLabPage.css";

/**
 * Development-only animation benchmark laboratory.
 *
 * Compares a locally fetched expert reference excerpt (frame sequence under
 * .reference-sources/media/, served by the dev-only vite middleware) against
 * its Motion Canvas reconstruction, with synchronized transport, four view
 * modes, guides, a dual event timeline, per-beat measurements, paired-frame
 * capture, and the full multi-dimension check run.
 *
 * Strictly separate from the learner-facing player: this page lives only in
 * the dev route tree and imports nothing from the lesson UI.
 */

type ViewMode = "side-by-side" | "reference" | "replica" | "overlay" | "difference";
const SPEEDS = [0.25, 0.5, 1, 2] as const;

interface RefMeta {
  frameFps: number;
  frameCount: number;
}

function refIndexForFrame(frame: number, meta: RefMeta): number {
  const seconds = frame / REPLICA_FPS;
  return Math.max(1, Math.min(meta.frameCount, 1 + Math.floor(seconds * meta.frameFps)));
}

function refFrameUrl(benchmarkId: string, index: number): string {
  return `${referenceFramesUrl(benchmarkId)}/${String(index).padStart(5, "0")}.jpg`;
}

/**
 * The lab has two jobs. `benchmark` compares a replica against a pinned
 * reference excerpt (the original purpose). `design` runs the elimination
 * animation design experiment: candidate clips with no reference, shown in a
 * large video-like viewport so they can be judged as clips rather than as
 * diffs. The mode lives in the URL so a candidate is linkable.
 */
export function DevBenchmarkLabPage() {
  const [params] = useSearchParams();
  if (params.get("mode") === "design") {
    return <DesignExperiment />;
  }
  return <BenchmarkComparison />;
}

function BenchmarkComparison() {
  const [params, setParams] = useSearchParams();
  const benchmarkId = params.get("benchmark") ?? BENCHMARK_MANIFESTS[0]!.id;
  const manifest = useMemo(() => getBenchmarkManifest(benchmarkId), [benchmarkId]);
  const window_ = useMemo(() => getReferenceWindow(benchmarkId), [benchmarkId]);
  const durationSec = window_.end - window_.start;
  const durationFrames = Math.round(durationSec * REPLICA_FPS);

  const replicaHost = useRef<HTMLDivElement | null>(null);
  const diffCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const handleRef = useRef<LabPlayerHandle | null>(null);
  const [ready, setReady] = useState(false);
  const [mediaMissing, setMediaMissing] = useState(false);
  const [refMeta, setRefMeta] = useState<RefMeta | null>(null);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [mode, setMode] = useState<ViewMode>("side-by-side");
  const [guides, setGuides] = useState({ safe: false, thirds: false, grid: false });
  const [report, setReport] = useState<ComparisonReport | null>(null);
  const [checkProgress, setCheckProgress] = useState<string | null>(null);
  const [measuredEvents, setMeasuredEvents] = useState<Record<string, number>>({});
  const [statusLine, setStatusLine] = useState<string>("");

  // --- mount the replica -----------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    let mounted: LabPlayerHandle | null = null;
    setReady(false);
    setReport(null);
    setFrame(0);
    setMeasuredEvents({});
    (async () => {
      if (!replicaHost.current) return;
      const handle = await mountLabPlayer(benchmarkId, replicaHost.current);
      if (cancelled) {
        handle.dispose();
        return;
      }
      mounted = handle;
      handleRef.current = handle;
      handle.onFrame((f) => {
        setFrame(f);
        setMeasuredEvents(readProbeEvents(benchmarkId));
      });
      handle.seekToFrame(0);
      setReady(true);
    })();
    return () => {
      cancelled = true;
      mounted?.dispose();
      handleRef.current = null;
    };
  }, [benchmarkId]);

  // --- reference meta ----------------------------------------------------------
  useEffect(() => {
    setRefMeta(null);
    setMediaMissing(false);
    fetch(`${referenceFramesUrl(benchmarkId)}/meta.json`)
      .then((r) => {
        if (!r.ok) throw new Error("missing");
        return r.json();
      })
      .then((meta: RefMeta) => setRefMeta(meta))
      .catch(() => setMediaMissing(true));
  }, [benchmarkId]);

  const refIndex = refMeta ? refIndexForFrame(frame, refMeta) : 1;
  const refUrl = refFrameUrl(benchmarkId, refIndex);

  // --- difference view -----------------------------------------------------------
  useEffect(() => {
    if (mode !== "difference" || !refMeta) return;
    let raf = 0;
    const image = new Image();
    let lastUrl = "";
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const canvas = diffCanvasRef.current;
      const replica = handleRef.current?.canvas;
      if (!canvas || !replica) return;
      const url = refFrameUrl(benchmarkId, refMeta ? refIndexForFrame(handleRef.current!.currentFrame(), refMeta) : 1);
      if (url !== lastUrl) {
        lastUrl = url;
        image.src = url;
      }
      if (!image.complete || image.naturalWidth === 0) return;
      const ctx = canvas.getContext("2d")!;
      const { width, height } = LAB_STAGE;
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(image, 0, 0, width, height);
      const refData = ctx.getImageData(0, 0, width, height);
      ctx.drawImage(replica, 0, 0, width, height);
      const repData = ctx.getImageData(0, 0, width, height);
      const out = ctx.createImageData(width, height);
      let total = 0;
      for (let i = 0; i < refData.data.length; i += 4) {
        const dr = Math.abs(refData.data[i]! - repData.data[i]!);
        const dg = Math.abs(refData.data[i + 1]! - repData.data[i + 1]!);
        const db = Math.abs(refData.data[i + 2]! - repData.data[i + 2]!);
        const d = (dr + dg + db) / 3;
        total += d;
        out.data[i] = d * 2;
        out.data[i + 1] = d < 24 ? d : 0;
        out.data[i + 2] = d < 24 ? d : 0;
        out.data[i + 3] = 255;
      }
      ctx.putImageData(out, 0, 0);
      const mean = total / (refData.data.length / 4);
      setStatusLine(`mean |diff| = ${mean.toFixed(1)} / 255 (supplemental only — semantic checks are the gates)`);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode, benchmarkId, refMeta]);

  // --- transport --------------------------------------------------------------------
  const seekTo = useCallback((target: number) => {
    const clamped = Math.max(0, Math.min(durationFrames - 1, Math.round(target)));
    handleRef.current?.seekToFrame(clamped);
  }, [durationFrames]);

  const togglePlay = useCallback(() => {
    if (!handleRef.current) return;
    if (playing) {
      handleRef.current.pause();
      setPlaying(false);
    } else {
      handleRef.current.play();
      setPlaying(true);
    }
  }, [playing]);

  const changeSpeed = (value: number) => {
    setSpeed(value);
    handleRef.current?.setSpeed(value);
  };

  const currentTime = frame / REPLICA_FPS;
  const beats = manifest.beats.map((beat) => ({
    ...beat,
    start: toReplicaTime(manifest, beat.refStart),
    end: toReplicaTime(manifest, beat.refEnd),
  }));
  const currentBeat = beats.find((b) => currentTime >= b.start && currentTime < b.end) ?? beats[beats.length - 1]!;
  const beatIndex = beats.indexOf(currentBeat);

  const jumpBeat = (delta: number) => {
    const next = beats[Math.max(0, Math.min(beats.length - 1, beatIndex + delta))]!;
    seekTo(next.start * REPLICA_FPS + 1);
  };

  // --- checks ----------------------------------------------------------------------
  const runChecks = useCallback(async () => {
    const handle = handleRef.current;
    if (!handle) return;
    handle.pause();
    handle.setSpeed(1);
    setPlaying(false);
    setSpeed(1);
    setCheckProgress("sampling…");
    try {
      const run = await sampleBenchmark(manifest, handle, {
        onProgress: (done, total) => setCheckProgress(`sampling ${done}/${total}`),
      });
      const nextReport = runAllChecks(manifest, run);
      setReport(nextReport);
      setMeasuredEvents(run.events);
      setCheckProgress(null);
      setStatusLine(
        `${nextReport.hardFailures.length} hard failure(s), ` +
          `${nextReport.craftFindings.length} measured craft finding(s), ` +
          `${manifest.knownDeviations.length} classified deviation(s)`,
      );
      await postLabArtifact("/__benchmark-lab/report", {
        name: manifest.id,
        report: buildMeasurementReport(manifest, run, nextReport),
      });
    } catch (error) {
      setCheckProgress(null);
      setStatusLine(`check run failed: ${String(error)}`);
    }
  }, [manifest]);

  // --- capture ------------------------------------------------------------------------
  const capturePair = useCallback(async (label?: string) => {
    const replica = handleRef.current?.canvas;
    // Refusing loudly matters: a capture that quietly does nothing reports
    // "captured" for evidence that was never written.
    if (!replica) throw new Error("replica canvas is not mounted yet");
    if (!refMeta) throw new Error("reference frames are not loaded yet");
    const f = handleRef.current!.currentFrame();
    const name = label ?? `${manifest.id}-f${String(f).padStart(4, "0")}`;
    const post = (suffix: string, dataUrl: string) =>
      postLabArtifact("/__benchmark-lab/capture", {
        name: `${name}-${suffix}`,
        dataUrl,
      });
    // Replica frame straight off the canvas.
    await post("replica", replica.toDataURL("image/png"));
    // Reference frame re-encoded through a canvas.
    const image = new Image();
    image.src = refFrameUrl(manifest.id, refIndexForFrame(f, refMeta));
    await image.decode();
    const scratch = document.createElement("canvas");
    scratch.width = LAB_STAGE.width;
    scratch.height = LAB_STAGE.height;
    const ctx = scratch.getContext("2d")!;
    ctx.drawImage(image, 0, 0, LAB_STAGE.width, LAB_STAGE.height);
    await post("reference", scratch.toDataURL("image/png"));
    setStatusLine(`captured pair "${name}"`);
  }, [manifest, refMeta]);

  const captureCurrentPair = useCallback(async () => {
    try {
      await capturePair();
    } catch (error) {
      setStatusLine(`capture failed: ${String(error)}`);
    }
  }, [capturePair]);

  const captureAllBeats = useCallback(async () => {
    const handle = handleRef.current;
    if (!handle) {
      setStatusLine("capture failed: replica canvas is not mounted yet");
      return;
    }
    let written = 0;
    try {
      for (const beat of beats) {
        const target = Math.round(((beat.start + beat.end) / 2) * REPLICA_FPS);
        handle.seekToFrame(target);
        await waitForFrame(handle, target);
        await capturePair(`${manifest.id}-${beat.id}`);
        written += 1;
      }
    } catch (error) {
      setStatusLine(`capture failed after ${written} pair(s): ${String(error)}`);
      return;
    }
    // The count is part of the message so a caller can tell a real sweep from
    // a no-op that still said "done".
    setStatusLine(`captured ${written} pairs across ${beats.length} beats`);
  }, [beats, capturePair, manifest.id]);

  // --- current-beat findings ------------------------------------------------------------
  const currentFindings: CheckResult[] = useMemo(() => {
    if (!report) return [];
    return report.results.filter((r) => {
      if (r.passed) return false;
      if (r.beatId) return r.beatId === currentBeat.id;
      if (r.frame !== undefined) {
        const t = r.frame / REPLICA_FPS;
        return t >= currentBeat.start && t < currentBeat.end;
      }
      return false;
    });
  }, [report, currentBeat]);

  const globalFindings: CheckResult[] = useMemo(
    () =>
      report
        ? report.results.filter((r) => !r.passed && !r.beatId && r.frame === undefined)
        : [],
    [report],
  );

  // Live landmark deltas for the current beat.
  const liveLandmarks = useMemo(() => {
    if (!ready || frame < 0) return [];
    const samples = readProbeSamples(manifest.id);
    return manifest.landmarks
      .filter((l) => l.beatId === currentBeat.id)
      .map((l) => {
        const s = samples[l.objectId];
        return {
          id: l.id,
          delta: s ? Math.hypot(s.x - l.x, s.y - l.y) : null,
        };
      });
  }, [ready, manifest, currentBeat, frame]);

  const showRef = mode === "side-by-side" || mode === "reference" || mode === "overlay";
  const showReplica = mode !== "reference" && mode !== "difference";

  return (
    <div className="bench-lab">
      <header className="bench-lab__header">
        <h1>Animation benchmark laboratory</h1>
        <span className="bench-lab__dev-tag">dev-only</span>
        <Link className="bench-lab__mode-link" to="/dev/benchmark-lab?mode=design">
          Elimination design experiment →
        </Link>
        <select
          value={benchmarkId}
          onChange={(e) => setParams({ benchmark: e.target.value })}
          aria-label="Benchmark"
        >
          {BENCHMARK_MANIFESTS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title}
            </option>
          ))}
        </select>
        <span className="bench-lab__source">
          {manifest.source.videoId} @ {manifest.source.inspectedCommit.slice(0, 8)} ·{" "}
          {window_.start}s–{window_.end}s
        </span>
      </header>

      <div className="bench-lab__modes" role="tablist" aria-label="View mode">
        {(["side-by-side", "reference", "replica", "overlay", "difference"] as ViewMode[]).map(
          (m) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              className={mode === m ? "is-active" : ""}
              onClick={() => setMode(m)}
            >
              {m}
            </button>
          ),
        )}
        <span className="bench-lab__guides">
          {(
            [
              ["safe", "safe frame"],
              ["thirds", "alignment"],
              ["grid", "coordinates"],
            ] as const
          ).map(([key, label]) => (
            <label key={key}>
              <input
                type="checkbox"
                checked={guides[key]}
                onChange={(e) => setGuides({ ...guides, [key]: e.target.checked })}
              />
              {label}
            </label>
          ))}
        </span>
      </div>

      <div
        className={`bench-lab__stage bench-lab__stage--${mode}`}
        data-ready={ready}
      >
        {mediaMissing && (
          <div className="bench-lab__media-warning">
            Reference media not fetched. Run{" "}
            <code>scripts/fetch-benchmark-media.sh</code> and reload.
          </div>
        )}
        <figure
          className="bench-lab__panel bench-lab__panel--reference"
          style={{ display: showRef && !mediaMissing ? undefined : "none" }}
        >
          <figcaption>reference (local frames)</figcaption>
          <div className="bench-lab__frame">
            <img src={refUrl} alt={`Reference frame ${refIndex}`} draggable={false} />
            {mode === "overlay" && null}
            <GuideOverlay guides={guides} />
          </div>
        </figure>
        <figure
          className="bench-lab__panel bench-lab__panel--replica"
          style={{ display: showReplica ? undefined : "none" }}
        >
          <figcaption>replica (Motion Canvas)</figcaption>
          <div
            className={`bench-lab__frame ${mode === "overlay" ? "bench-lab__frame--overlay" : ""}`}
          >
            {mode === "overlay" && !mediaMissing && (
              <img
                className="bench-lab__underlay"
                src={refUrl}
                alt=""
                draggable={false}
              />
            )}
            <div
              ref={replicaHost}
              className={`bench-lab__replica-host ${mode === "overlay" ? "bench-lab__replica-host--translucent" : ""}`}
            />
            <GuideOverlay guides={guides} />
          </div>
        </figure>
        {mode === "difference" && (
          <figure className="bench-lab__panel bench-lab__panel--difference">
            <figcaption>difference (|reference − replica|)</figcaption>
            <div className="bench-lab__frame">
              <canvas ref={diffCanvasRef} />
              <GuideOverlay guides={guides} />
            </div>
          </figure>
        )}
      </div>

      <div className="bench-lab__transport">
        <button onClick={togglePlay} disabled={!ready}>
          {playing ? "Pause" : "Play"}
        </button>
        <button onClick={() => seekTo(frame - 1)} disabled={!ready} aria-label="Step back">
          ⟨ frame
        </button>
        <button onClick={() => seekTo(frame + 1)} disabled={!ready} aria-label="Step forward">
          frame ⟩
        </button>
        <button onClick={() => jumpBeat(-1)} disabled={!ready}>
          ⟨ beat
        </button>
        <button onClick={() => jumpBeat(1)} disabled={!ready}>
          beat ⟩
        </button>
        <select
          value={speed}
          onChange={(e) => changeSpeed(Number(e.target.value))}
          aria-label="Playback speed"
        >
          {SPEEDS.map((s) => (
            <option key={s} value={s}>
              {s}×
            </option>
          ))}
        </select>
        <input
          className="bench-lab__scrubber"
          type="range"
          min={0}
          max={durationFrames - 1}
          value={frame}
          onChange={(e) => seekTo(Number(e.target.value))}
          aria-label="Timeline scrubber"
        />
        <span className="bench-lab__clock">
          f{frame} · {currentTime.toFixed(2)}s / {durationSec.toFixed(1)}s
        </span>
      </div>

      <div className="bench-lab__beats">
        {beats.map((beat) => (
          <button
            key={beat.id}
            className={beat.id === currentBeat.id ? "is-active" : ""}
            onClick={() => seekTo(beat.start * REPLICA_FPS + 1)}
            title={beat.purpose}
          >
            {beat.title}
          </button>
        ))}
      </div>

      <Timeline
        manifest={manifest}
        durationSec={durationSec}
        currentTime={currentTime}
        measuredEvents={measuredEvents}
        onSeek={(t) => seekTo(t * REPLICA_FPS)}
      />

      <div className="bench-lab__actions">
        <button onClick={runChecks} disabled={!ready || checkProgress !== null}>
          {checkProgress ?? "Run checks"}
        </button>
        <button onClick={captureCurrentPair} disabled={!ready || mediaMissing}>
          Capture pair
        </button>
        <button onClick={captureAllBeats} disabled={!ready || mediaMissing}>
          Capture beat keyframes
        </button>
        <span className="bench-lab__status">{statusLine}</span>
      </div>

      <div className="bench-lab__measurements">
        <section>
          <h2>
            Current beat: {currentBeat.title}{" "}
            <span className="bench-lab__beat-meta">
              text: {currentBeat.text.kind} · camera: {currentBeat.camera.mode}
            </span>
          </h2>
          <p className="bench-lab__purpose">{currentBeat.purpose}</p>
          {liveLandmarks.length > 0 && (
            <ul className="bench-lab__landmarks">
              {liveLandmarks.map((l) => (
                <li key={l.id}>
                  {l.id}: {l.delta === null ? "—" : `${l.delta.toFixed(1)}px`}
                </li>
              ))}
            </ul>
          )}
          <FindingsList
            title="Findings in this beat"
            findings={currentFindings}
            empty={report ? "no failed checks in this beat" : "run checks to populate"}
          />
        </section>
        <section>
          {report && (
            <table className="bench-lab__dimensions">
              <thead>
                <tr>
                  <th>dimension</th>
                  <th>checks</th>
                  <th>hard fails</th>
                  <th>craft</th>
                </tr>
              </thead>
              <tbody>
                {report.summaries
                  .filter((s) => s.total > 0)
                  .map((s) => (
                    <tr key={s.dimension} data-failing={s.hardFailures > 0}>
                      <td>{s.dimension}</td>
                      <td>
                        {s.passed}/{s.total}
                      </td>
                      <td>{s.hardFailures}</td>
                      <td>{s.craftFindings}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
          <FindingsList
            title="Scene-wide findings"
            findings={globalFindings}
            empty={report ? "none" : ""}
          />
          {report && manifest.knownDeviations.length > 0 && (
            <div className="bench-lab__findings">
              <h3>Classified deviations (separate from runtime findings)</h3>
              <ul>
                {manifest.knownDeviations.map((deviation) => (
                  <li key={deviation.id}>
                    <strong>{deviation.id}</strong> [{deviation.classification}]: {deviation.note}{" "}{deviation.rationale ?? ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/**
 * The elimination animation design experiment.
 *
 * Three candidate clips for one lesson, in a large 16:9 viewport with the
 * transport and the design thesis OUTSIDE the frame, so nothing competes with
 * the mathematics inside it. There is no reference panel and no check run:
 * these are hypotheses to compare, not replicas to score, and the page says so
 * rather than reusing controls that would imply a verdict.
 */
function DesignExperiment() {
  const [params, setParams] = useSearchParams();
  const experimentId = params.get("experiment") ?? DESIGN_EXPERIMENTS[0]!.id;
  const experiment = useMemo(
    () => getDesignExperiment(experimentId),
    [experimentId],
  );
  const candidateId = params.get("candidate") ?? experiment.candidates[0]!.id;
  const candidate = useMemo(
    () => experiment.resolve(candidateId),
    [experiment, candidateId],
  );
  const durationFrames = Math.round(candidate.durationSeconds * REPLICA_FPS);

  const host = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<LabPlayerHandle | null>(null);
  const [ready, setReady] = useState(false);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [theater, setTheater] = useState(false);
  const [safeFrame, setSafeFrame] = useState(false);

  /**
   * A freshly mounted player always starts at 1×, and the mount effect must not
   * re-run when the speed changes — so the chosen speed is carried in a ref and
   * re-applied after every mount. Without this, switching candidates left the
   * control reading 2× while the clip ran at 1×, which is the worst kind of
   * comparison bug: the two clips are no longer being watched the same way.
   */
  const speedRef = useRef(speed);
  speedRef.current = speed;

  useEffect(() => {
    let cancelled = false;
    let mounted: LabPlayerHandle | null = null;
    setReady(false);
    setFrame(0);
    setPlaying(false);
    (async () => {
      if (!host.current) return;
      const handle = await mountLabPlayer(
        candidateId,
        host.current,
        "design",
        experimentId,
      );
      if (cancelled) {
        handle.dispose();
        return;
      }
      mounted = handle;
      handleRef.current = handle;
      handle.onFrame(setFrame);
      handle.setSpeed(speedRef.current);
      handle.seekToFrame(0);
      setReady(true);
    })();
    return () => {
      cancelled = true;
      mounted?.dispose();
      handleRef.current = null;
    };
  }, [candidateId, experimentId]);

  const seekTo = useCallback(
    (target: number) => {
      handleRef.current?.seekToFrame(
        Math.max(0, Math.min(durationFrames - 1, Math.round(target))),
      );
    },
    [durationFrames],
  );

  const togglePlay = useCallback(() => {
    const handle = handleRef.current;
    if (!handle) return;
    if (playing) {
      handle.pause();
      setPlaying(false);
    } else {
      handle.play();
      setPlaying(true);
    }
  }, [playing]);

  const selectCandidate = (id: string) => {
    setParams({ mode: "design", experiment: experimentId, candidate: id });
  };
  const selectExperiment = (id: string) => {
    // Candidate ids are per-experiment, so switching experiments falls back to
    // its own first candidate rather than carrying a stale one across.
    setParams({ mode: "design", experiment: id });
  };

  const currentTime = frame / REPLICA_FPS;
  const activeBeat =
    [...candidate.beats].reverse().find((beat) => currentTime >= beat.at) ??
    candidate.beats[0]!;

  return (
    <div className={`bench-lab design-lab ${theater ? "design-lab--theater" : ""}`}>
      <header className="bench-lab__header">
        <h1>Animation design experiments</h1>
        <span className="bench-lab__dev-tag">dev-only</span>
        <Link className="bench-lab__mode-link" to="/dev/benchmark-lab">
          ← Benchmark comparison
        </Link>
        <select
          value={experimentId}
          onChange={(event) => selectExperiment(event.target.value)}
          aria-label="Experiment"
        >
          {DESIGN_EXPERIMENTS.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.title}
            </option>
          ))}
        </select>
        <span className="bench-lab__source">
          {experiment.candidates.length} candidates · no winner declared
        </span>
      </header>
      <p className="design-lab__question">{experiment.question}</p>

      <div className="design-lab__candidates" role="tablist" aria-label="Candidate">
        {experiment.candidates.map((c) => (
          <button
            key={c.id}
            role="tab"
            aria-selected={c.id === candidateId}
            className={c.id === candidateId ? "is-active" : ""}
            onClick={() => selectCandidate(c.id)}
          >
            <span className="design-lab__candidate-title">{c.title}</span>
            <span className="design-lab__candidate-strap">{c.strapline}</span>
          </button>
        ))}
      </div>

      <div className="design-lab__viewport" data-ready={ready}>
        <div ref={host} className="design-lab__stage" />
        {safeFrame && (
          <svg
            className="design-lab__safe"
            viewBox={`0 0 ${LAB_STAGE.width} ${LAB_STAGE.height}`}
            aria-hidden="true"
          >
            <rect
              x={80}
              y={80}
              width={LAB_STAGE.width - 160}
              height={LAB_STAGE.height - 160}
            />
          </svg>
        )}
      </div>

      <div className="bench-lab__transport design-lab__transport">
        <button onClick={togglePlay} disabled={!ready}>
          {playing ? "Pause" : "Play"}
        </button>
        <button onClick={() => seekTo(0)} disabled={!ready}>
          Restart
        </button>
        <button onClick={() => seekTo(frame - 1)} disabled={!ready} aria-label="Step back">
          ⟨ frame
        </button>
        <button onClick={() => seekTo(frame + 1)} disabled={!ready} aria-label="Step forward">
          frame ⟩
        </button>
        <select
          value={speed}
          onChange={(e) => {
            const value = Number(e.target.value);
            setSpeed(value);
            handleRef.current?.setSpeed(value);
          }}
          aria-label="Playback speed"
        >
          {SPEEDS.map((s) => (
            <option key={s} value={s}>
              {s}×
            </option>
          ))}
        </select>
        <input
          className="bench-lab__scrubber"
          type="range"
          min={0}
          max={durationFrames - 1}
          value={frame}
          onChange={(e) => seekTo(Number(e.target.value))}
          aria-label="Timeline scrubber"
        />
        <span className="bench-lab__clock">
          {currentTime.toFixed(2)}s / {candidate.durationSeconds.toFixed(0)}s
        </span>
        <label className="design-lab__toggle">
          <input
            type="checkbox"
            checked={theater}
            onChange={(e) => setTheater(e.target.checked)}
          />
          theater
        </label>
        <label className="design-lab__toggle">
          <input
            type="checkbox"
            checked={safeFrame}
            onChange={(e) => setSafeFrame(e.target.checked)}
          />
          safe frame
        </label>
      </div>

      <div className="bench-lab__beats design-lab__beats">
        {candidate.beats.map((beat) => (
          <button
            key={beat.id}
            className={beat.id === activeBeat.id ? "is-active" : ""}
            onClick={() => seekTo(beat.at * REPLICA_FPS + 1)}
          >
            {beat.title}
          </button>
        ))}
      </div>

      <section className="design-lab__thesis">
        <h2>{candidate.title} — design thesis</h2>
        <dl>
          <dt>Obstacle it targets</dt>
          <dd>{candidate.obstacle}</dd>
          <dt>Leading representation</dt>
          <dd>{candidate.leadRepresentation}</dd>
          <dt>Continuously visible</dt>
          <dd>{candidate.persistent}</dd>
          <dt>Attention</dt>
          <dd>{candidate.attention}</dd>
          <dt>Why it is not a restyling</dt>
          <dd>{candidate.distinctBecause}</dd>
        </dl>
      </section>
    </div>
  );
}

function GuideOverlay({
  guides,
}: {
  guides: { safe: boolean; thirds: boolean; grid: boolean };
}) {
  if (!guides.safe && !guides.thirds && !guides.grid) return null;
  const { width, height } = LAB_STAGE;
  const margin = 80;
  const unit = 64;
  const gridLines: React.ReactNode[] = [];
  if (guides.grid) {
    for (let x = width / 2 % unit; x <= width; x += unit) {
      gridLines.push(
        <line key={`v${x}`} x1={x} y1={0} x2={x} y2={height} className={x === width / 2 ? "axis" : ""} />,
      );
    }
    for (let y = height / 2 % unit; y <= height; y += unit) {
      gridLines.push(
        <line key={`h${y}`} x1={0} y1={y} x2={width} y2={y} className={y === height / 2 ? "axis" : ""} />,
      );
    }
  }
  return (
    <svg
      className="bench-lab__guides-overlay"
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      {guides.grid && <g className="bench-lab__grid-guides">{gridLines}</g>}
      {guides.thirds && (
        <g className="bench-lab__third-guides">
          <line x1={width / 3} y1={0} x2={width / 3} y2={height} />
          <line x1={(2 * width) / 3} y1={0} x2={(2 * width) / 3} y2={height} />
          <line x1={0} y1={height / 3} x2={width} y2={height / 3} />
          <line x1={0} y1={(2 * height) / 3} x2={width} y2={(2 * height) / 3} />
          <line x1={width / 2} y1={height / 2 - 14} x2={width / 2} y2={height / 2 + 14} />
          <line x1={width / 2 - 14} y1={height / 2} x2={width / 2 + 14} y2={height / 2} />
        </g>
      )}
      {guides.safe && (
        <g className="bench-lab__safe-guides">
          <rect x={1} y={1} width={width - 2} height={height - 2} />
          <rect
            x={margin}
            y={margin}
            width={width - margin * 2}
            height={height - margin * 2}
          />
        </g>
      )}
    </svg>
  );
}

function Timeline({
  manifest,
  durationSec,
  currentTime,
  measuredEvents,
  onSeek,
}: {
  manifest: BenchmarkManifest;
  durationSec: number;
  currentTime: number;
  measuredEvents: Record<string, number>;
  onSeek: (time: number) => void;
}) {
  const pct = (t: number) => `${Math.max(0, Math.min(100, (t / durationSec) * 100))}%`;
  return (
    <div className="bench-lab__timeline" aria-label="Event timeline">
      <div className="bench-lab__timeline-row" data-row="reference">
        <span className="bench-lab__timeline-label">reference</span>
        <div className="bench-lab__timeline-track">
          {manifest.beats.map((beat) => (
            <div
              key={beat.id}
              className="bench-lab__timeline-beat"
              style={{
                left: pct(toReplicaTime(manifest, beat.refStart)),
                width: pct(beat.refEnd - beat.refStart),
              }}
              title={beat.title}
            />
          ))}
          {manifest.events.map((event) => (
            <button
              key={event.id}
              className="bench-lab__timeline-tick"
              style={{ left: pct(toReplicaTime(manifest, event.refTime)) }}
              title={`${event.id} @ ${toReplicaTime(manifest, event.refTime).toFixed(2)}s (${event.anchor})`}
              onClick={() => onSeek(toReplicaTime(manifest, event.refTime))}
            />
          ))}
        </div>
      </div>
      <div className="bench-lab__timeline-row" data-row="replica">
        <span className="bench-lab__timeline-label">replica</span>
        <div className="bench-lab__timeline-track">
          {Object.entries(measuredEvents).map(([id, time]) => (
            <button
              key={id}
              className="bench-lab__timeline-tick bench-lab__timeline-tick--measured"
              style={{ left: pct(time) }}
              title={`${id} enacted @ ${time.toFixed(2)}s`}
              onClick={() => onSeek(time)}
            />
          ))}
          <div
            className="bench-lab__timeline-playhead"
            style={{ left: pct(currentTime) }}
          />
        </div>
      </div>
    </div>
  );
}

function FindingsList({
  title,
  findings,
  empty,
}: {
  title: string;
  findings: CheckResult[];
  empty: string;
}) {
  return (
    <div className="bench-lab__findings">
      <h3>{title}</h3>
      {findings.length === 0 ? (
        <p className="bench-lab__empty">{empty}</p>
      ) : (
        <ul>
          {findings.map((f) => (
            <li key={f.id} data-severity={f.severity}>
              <span className="bench-lab__severity">{f.severity}</span>
              <span className="bench-lab__dimension">{f.dimension}</span>
              {f.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
