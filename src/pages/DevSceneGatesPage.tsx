import { useCallback, useEffect, useRef, useState } from "react";
import { SCENE_META } from "../guided-scenes/scenes/sceneMeta";
import { runSceneGateSampling } from "../guided-scenes/validation/sceneGateRunner";
import { runSceneHardGates } from "../guided-scenes/validation/hardGates";
import type { SceneGateFinding } from "../guided-scenes/validation/gateTypes";
import "./DevSceneGatesPage.css";

/**
 * Development-only runner for the production guided-scene HARD GATES.
 *
 * The gates come from the animation benchmark laboratory: every defect class
 * it proved is objectively detectable (missing claimed motion, teleports,
 * flicker, clipped or overlapping text, nondeterministic seeking, segment
 * overruns, blank frames) runs here against real production scenes.
 *
 * `window.__sceneGates` is the same entry point `e2e/guided-scene-hard-gates
 * .spec.ts` drives, so the button on this page and the CI gate can never
 * measure different things.
 */

declare global {
  interface Window {
    __sceneGates?: {
      list(): string[];
      run(sceneId: string, stride?: number): Promise<SceneGateFinding[]>;
    };
  }
}

interface SceneResult {
  sceneId: string;
  findings: SceneGateFinding[];
  seconds: number;
}

export function DevSceneGatesPage() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [results, setResults] = useState<SceneResult[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const sceneIds = Object.keys(SCENE_META);

  const runOne = useCallback(
    async (sceneId: string, stride = 3): Promise<SceneGateFinding[]> => {
      const host = hostRef.current;
      if (!host) throw new Error("gate host is not mounted");
      const run = await runSceneGateSampling(sceneId, host, { stride });
      return runSceneHardGates(run);
    },
    [],
  );

  // Expose the runner for the e2e gate. Registered once the host div exists.
  useEffect(() => {
    window.__sceneGates = {
      list: () => Object.keys(SCENE_META),
      run: (sceneId, stride) => runOne(sceneId, stride),
    };
    return () => {
      delete window.__sceneGates;
    };
  }, [runOne]);

  const runAll = useCallback(async () => {
    setResults([]);
    for (const sceneId of sceneIds) {
      setBusy(sceneId);
      const started = performance.now();
      try {
        const findings = await runOne(sceneId);
        setResults((previous) => [
          ...previous,
          { sceneId, findings, seconds: (performance.now() - started) / 1000 },
        ]);
      } catch (error) {
        setResults((previous) => [
          ...previous,
          {
            sceneId,
            seconds: (performance.now() - started) / 1000,
            findings: [
              {
                gate: "runner",
                sceneId,
                message: `gate run failed: ${String(error)}`,
              },
            ],
          },
        ]);
      }
    }
    setBusy(null);
  }, [runOne, sceneIds]);

  const totalFindings = results.reduce((sum, r) => sum + r.findings.length, 0);

  return (
    <div className="scene-gates">
      <header>
        <h1>Guided-scene hard gates</h1>
        <span className="scene-gates__dev-tag">dev-only</span>
        <button onClick={runAll} disabled={busy !== null}>
          {busy ? `running ${busy}…` : `Run all ${sceneIds.length} scenes`}
        </button>
        <span className="scene-gates__summary" data-testid="gate-summary">
          {results.length > 0
            ? `${results.length}/${sceneIds.length} scenes · ${totalFindings} hard finding(s)`
            : "not run"}
        </span>
      </header>

      <p className="scene-gates__note">
        Hard failures only. Composition, pacing, and typography differences are
        craft findings and belong to the benchmark laboratory, not here.
      </p>

      <ol className="scene-gates__results">
        {results.map((result) => (
          <li key={result.sceneId} data-failing={result.findings.length > 0}>
            <h2>
              {result.sceneId}{" "}
              <span className="scene-gates__timing">
                {result.seconds.toFixed(1)}s
              </span>
            </h2>
            {result.findings.length === 0 ? (
              <p className="scene-gates__pass">all gates pass</p>
            ) : (
              <ul>
                {result.findings.map((finding, index) => (
                  <li key={`${finding.gate}-${index}`}>
                    <span className="scene-gates__gate">{finding.gate}</span>
                    {finding.message}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>

      {/* Scenes are mounted here off-screen while they are sampled. */}
      <div ref={hostRef} className="scene-gates__host" aria-hidden="true" />
    </div>
  );
}
