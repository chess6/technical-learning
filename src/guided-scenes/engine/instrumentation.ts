/**
 * Development-only instrumentation for the guided-scene integration layer.
 *
 * Tracks resources owned by OUR wrapper (engine instances, mounts, disposals,
 * animation loops, and the observers/subscriptions we create). This is used to
 * prove correct lifecycle behavior:
 *
 *   - exactly one active engine while a scene is mounted
 *   - zero active engines after leaving the lesson
 *   - repeated navigation does not increase active counts
 *   - every mounted engine is eventually disposed
 *
 * Counters are always maintained (the cost is negligible) so unit tests can
 * import them directly. The console/window surface is attached only in dev.
 */

export interface GuidedSceneCounters {
  /** Cumulative engines constructed. */
  created: number;
  /** Currently-active (constructed but not yet disposed) engines. */
  activeEngines: number;
  /** Cumulative mount() calls. */
  mounts: number;
  /** Cumulative dispose() calls. */
  disposals: number;
  /** Active animation loops (Motion Canvas players / rAF loops). */
  activeLoops: number;
  /** Active observers/subscriptions we created against underlying libraries. */
  activeResources: number;
  /** Active engine.subscribe() listeners. */
  activeSubscribers: number;
}

type CounterKey = keyof GuidedSceneCounters;

const counters: GuidedSceneCounters = {
  created: 0,
  activeEngines: 0,
  mounts: 0,
  disposals: 0,
  activeLoops: 0,
  activeResources: 0,
  activeSubscribers: 0,
};

const isDev =
  typeof import.meta !== "undefined" && Boolean(import.meta.env?.DEV);

function bump(key: CounterKey, delta: number): void {
  counters[key] += delta;
}

export const instrumentation = {
  registerCreated(): void {
    bump("created", 1);
    bump("activeEngines", 1);
  },
  registerDisposed(): void {
    bump("disposals", 1);
    bump("activeEngines", -1);
  },
  registerMount(): void {
    bump("mounts", 1);
  },
  loopStarted(): void {
    bump("activeLoops", 1);
  },
  loopStopped(): void {
    bump("activeLoops", -1);
  },
  resourceAcquired(count = 1): void {
    bump("activeResources", count);
  },
  resourceReleased(count = 1): void {
    bump("activeResources", -count);
  },
  subscriberAdded(): void {
    bump("activeSubscribers", 1);
  },
  subscriberRemoved(): void {
    bump("activeSubscribers", -1);
  },
  snapshot(): GuidedSceneCounters {
    return { ...counters };
  },
  /** Test helper: restore all counters to zero. */
  reset(): void {
    (Object.keys(counters) as CounterKey[]).forEach((key) => {
      counters[key] = 0;
    });
  },
};

export type GuidedSceneDebug = typeof instrumentation & {
  isClean(): boolean;
};

const debug: GuidedSceneDebug = Object.assign(instrumentation, {
  isClean(): boolean {
    const s = counters;
    return (
      s.activeEngines === 0 &&
      s.activeLoops === 0 &&
      s.activeResources === 0 &&
      s.activeSubscribers === 0
    );
  },
});

declare global {
  interface Window {
    __guidedSceneDebug?: GuidedSceneDebug;
  }
}

if (isDev && typeof window !== "undefined") {
  window.__guidedSceneDebug = debug;
}

export { debug as guidedSceneDebug };
