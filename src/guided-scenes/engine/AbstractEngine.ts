import { instrumentation } from "./instrumentation";
import {
  createInitialState,
  type GuidedSceneEngine,
  type GuidedSceneListener,
  type GuidedSceneState,
  type GuidedSceneStep,
} from "./types";

const PROGRESS_NOTIFY_INTERVAL_MS = 80;
const PROGRESS_EPSILON = 0.001;

/**
 * Shared engine plumbing: state storage, subscriber management, instrumentation
 * registration, and throttled notification so progress updates never fire React
 * state changes on every animation frame.
 */
export abstract class AbstractGuidedSceneEngine implements GuidedSceneEngine {
  abstract readonly steps: GuidedSceneStep[];

  protected state: GuidedSceneState;
  private readonly listeners = new Set<GuidedSceneListener>();
  private lastProgressNotify = 0;
  private disposed = false;

  protected constructor(canSeek: boolean) {
    this.state = createInitialState(canSeek);
    instrumentation.registerCreated();
  }

  abstract mount(container: HTMLElement): void | Promise<void>;
  abstract play(): void;
  abstract pause(): void;
  abstract reset(): void;
  abstract seek(progress: number): void;
  abstract resize(): void;

  getState(): GuidedSceneState {
    return this.state;
  }

  subscribe(listener: GuidedSceneListener): () => void {
    this.listeners.add(listener);
    instrumentation.subscriberAdded();
    listener(this.state);
    return () => {
      if (this.listeners.delete(listener)) {
        instrumentation.subscriberRemoved();
      }
    };
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.onDispose();
    this.listeners.clear();
    instrumentation.registerDisposed();
  }

  protected get isDisposed(): boolean {
    return this.disposed;
  }

  /** Backend-specific teardown. Subscriber cleanup is handled by the base. */
  protected abstract onDispose(): void;

  /**
   * Merge a state patch and notify subscribers. Progress-only changes are
   * throttled; status/step/error/duration changes notify immediately.
   */
  protected setState(patch: Partial<GuidedSceneState>): void {
    if (this.disposed) return;
    const previous = this.state;
    const next = { ...previous, ...patch };
    this.state = next;

    const structuralChange =
      next.status !== previous.status ||
      next.currentStep !== previous.currentStep ||
      next.error !== previous.error ||
      next.duration !== previous.duration ||
      next.canSeek !== previous.canSeek;

    if (structuralChange) {
      this.notify();
      return;
    }

    if (Math.abs(next.progress - previous.progress) >= PROGRESS_EPSILON) {
      const now = typeof performance !== "undefined" ? performance.now() : Date.now();
      if (now - this.lastProgressNotify >= PROGRESS_NOTIFY_INTERVAL_MS) {
        this.lastProgressNotify = now;
        this.notify();
      }
    }
  }

  /** Force an immediate notification (e.g. when settling on a final frame). */
  protected notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  protected stepForProgress(progress: number): number | null {
    if (this.steps.length === 0) return null;
    let index = 0;
    for (let i = 0; i < this.steps.length; i += 1) {
      if (progress + 1e-6 >= this.steps[i]!.at) {
        index = i;
      }
    }
    return index;
  }
}
