import { Component, type ErrorInfo, type ReactNode } from "react";
import "./ErrorBoundary.css";

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Learner-facing heading, e.g. "This lesson couldn't load". */
  title: string;
  /** Learner-facing recovery copy. Keep calm and non-technical. */
  message?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches render/lifecycle errors from a lazily-loaded lesson, guided scene,
 * or explorer and shows calm, learner-facing recovery guidance with a retry
 * instead of a blank page or a raw stack trace.
 *
 * Never used to paper over incorrect mathematics: it only recovers from
 * loading/runtime failures. Unknown scene/lesson ids still throw explicitly
 * before this boundary is reached (see sceneMeta.ts / registry.ts).
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error("ErrorBoundary caught:", error, info.componentStack);
    }
  }

  private handleRetry = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="error-boundary" role="alert">
        <p className="error-boundary__title">{this.props.title}</p>
        <p className="error-boundary__message">
          {this.props.message ??
            "Something went wrong loading this content. Your progress elsewhere on the page is unaffected."}
        </p>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={this.handleRetry}
        >
          Try again
        </button>
        {import.meta.env.DEV && (
          <pre className="error-boundary__dev-detail">{error.message}</pre>
        )}
      </div>
    );
  }
}
