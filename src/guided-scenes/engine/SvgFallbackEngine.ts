import { AbstractGuidedSceneEngine } from "./AbstractEngine";
import { instrumentation } from "./instrumentation";
import type {
  GuidedSceneEngineOptions,
  GuidedSceneStep,
} from "./types";
import { SPIKE_MATRIX, SPIKE_STEPS } from "../scenes/spikeConstants";

const SVG_NS = "http://www.w3.org/2000/svg";
const DURATION_SECONDS = 2.6;
const VIEW = 480;
const SCALE = 70;

/**
 * Minimal, interface-complete fallback engine used only if Motion Canvas fails
 * the spike. It is deliberately unpolished: a single transforming grid + basis
 * vectors driven by requestAnimationFrame. It exists to prove the abstraction
 * is backend-agnostic, not to be a finished lesson visual.
 */
export class SvgFallbackEngine extends AbstractGuidedSceneEngine {
  readonly steps: GuidedSceneStep[] = SPIKE_STEPS;

  private readonly reducedMotion: boolean;
  private svg: SVGSVGElement | null = null;
  private lines: Array<{ el: SVGLineElement; from: [number, number]; to: [number, number] }> = [];
  private rafId: number | null = null;
  private lastTimestamp = 0;
  private progress = 0;
  private playing = false;

  constructor(options: GuidedSceneEngineOptions) {
    super(true);
    this.reducedMotion = options.reducedMotion ?? false;
  }

  mount(container: HTMLElement): void {
    if (this.isDisposed) return;

    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", `0 0 ${VIEW} ${VIEW}`);
    svg.setAttribute("role", "img");
    svg.setAttribute(
      "aria-label",
      "Coordinate grid transforming from the identity to a shear matrix",
    );
    svg.style.width = "100%";
    svg.style.height = "auto";
    svg.style.display = "block";
    svg.style.background = "#0a0d11";
    this.svg = svg;

    for (let k = -3; k <= 3; k += 1) {
      this.addLine([k, -3], [k, 3], k === 0 ? "#3a4556" : "#1e2633");
      this.addLine([-3, k], [3, k], k === 0 ? "#3a4556" : "#1e2633");
    }
    this.addLine([0, 0], [1, 0], "#7dba8a", 3);
    this.addLine([0, 0], [0, 1], "#b89ad4", 3);

    container.appendChild(svg);
    this.setState({ duration: DURATION_SECONDS });
    this.progress = this.reducedMotion ? 1 : 0;
    this.render();
    this.publish(this.reducedMotion ? "complete" : "idle");
    instrumentation.registerMount();
  }

  play(): void {
    if (this.isDisposed) return;
    if (this.progress >= 1) this.progress = 0;
    this.playing = true;
    this.startLoop();
    this.publish("playing");
  }

  pause(): void {
    this.playing = false;
    this.stopLoop();
    this.publish("paused");
  }

  reset(): void {
    this.playing = false;
    this.stopLoop();
    this.progress = 0;
    this.render();
    this.publish("idle");
  }

  seek(progress: number): void {
    this.progress = Math.max(0, Math.min(1, progress));
    this.render();
    this.publish(this.playing ? "playing" : this.progress >= 1 ? "complete" : "paused");
  }

  resize(): void {
    this.render();
  }

  protected onDispose(): void {
    this.stopLoop();
    if (this.svg && this.svg.parentNode) {
      this.svg.parentNode.removeChild(this.svg);
    }
    this.svg = null;
    this.lines = [];
  }

  private addLine(
    from: [number, number],
    to: [number, number],
    stroke: string,
    width = 1,
  ): void {
    if (!this.svg) return;
    const el = document.createElementNS(SVG_NS, "line");
    el.setAttribute("stroke", stroke);
    el.setAttribute("stroke-width", String(width));
    this.svg.appendChild(el);
    this.lines.push({ el, from, to });
  }

  private startLoop(): void {
    if (this.rafId !== null || typeof requestAnimationFrame === "undefined") return;
    this.lastTimestamp = 0;
    instrumentation.loopStarted();
    const tick = (timestamp: number): void => {
      if (this.isDisposed || !this.playing) return;
      if (this.lastTimestamp === 0) this.lastTimestamp = timestamp;
      const delta = (timestamp - this.lastTimestamp) / 1000;
      this.lastTimestamp = timestamp;
      this.progress = Math.min(1, this.progress + delta / DURATION_SECONDS);
      this.render();
      if (this.progress >= 1) {
        this.playing = false;
        this.rafId = null;
        instrumentation.loopStopped();
        this.publish("complete");
        return;
      }
      this.publish("playing");
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  private stopLoop(): void {
    if (this.rafId !== null) {
      if (typeof cancelAnimationFrame !== "undefined") cancelAnimationFrame(this.rafId);
      this.rafId = null;
      instrumentation.loopStopped();
    }
  }

  private render(): void {
    const t = this.progress;
    const [[a, b], [c, d]] = SPIKE_MATRIX;
    const m: [[number, number], [number, number]] = [
      [1 + (a - 1) * t, b * t],
      [c * t, 1 + (d - 1) * t],
    ];
    const project = ([x, y]: [number, number]): [number, number] => {
      const tx = m[0][0] * x + m[0][1] * y;
      const ty = m[1][0] * x + m[1][1] * y;
      return [VIEW / 2 + tx * SCALE, VIEW / 2 - ty * SCALE];
    };
    for (const line of this.lines) {
      const [x1, y1] = project(line.from);
      const [x2, y2] = project(line.to);
      line.el.setAttribute("x1", x1.toFixed(2));
      line.el.setAttribute("y1", y1.toFixed(2));
      line.el.setAttribute("x2", x2.toFixed(2));
      line.el.setAttribute("y2", y2.toFixed(2));
    }
  }

  private publish(status: "idle" | "playing" | "paused" | "complete"): void {
    this.setState({
      status,
      progress: this.progress,
      currentStep: this.stepForProgress(this.progress),
    });
  }
}
