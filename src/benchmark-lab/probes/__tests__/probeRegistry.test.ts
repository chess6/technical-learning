import { describe, expect, it } from "vitest";
import {
  beginProbeRun,
  logProbeEvent,
  readProbeEvents,
  readProbeSamples,
  registerProbe,
  registeredProbeIds,
} from "../probeRegistry";

describe("probeRegistry", () => {
  it("samples registered readers at call time", () => {
    beginProbeRun("bench");
    let x = 1;
    registerProbe("bench", "obj", () => ({ x, y: 0, opacity: 1 }));
    expect(readProbeSamples("bench").obj!.x).toBe(1);
    x = 5;
    expect(readProbeSamples("bench").obj!.x).toBe(5);
    expect(registeredProbeIds("bench")).toEqual(["obj"]);
  });

  it("keeps the FIRST event time within a run (re-yields must not move it)", () => {
    beginProbeRun("bench");
    logProbeEvent("bench", "e", 2.5);
    logProbeEvent("bench", "e", 9.9);
    expect(readProbeEvents("bench")).toEqual({ e: 2.5 });
  });

  it("clears readers and events at the start of a new run", () => {
    beginProbeRun("bench");
    registerProbe("bench", "obj", () => ({ x: 0, y: 0, opacity: 1 }));
    logProbeEvent("bench", "e", 1);
    beginProbeRun("bench");
    expect(readProbeSamples("bench")).toEqual({});
    expect(readProbeEvents("bench")).toEqual({});
  });

  it("isolates benchmarks from each other", () => {
    beginProbeRun("a");
    beginProbeRun("b");
    registerProbe("a", "only-a", () => ({ x: 0, y: 0, opacity: 1 }));
    expect(readProbeSamples("b")).toEqual({});
  });
});
