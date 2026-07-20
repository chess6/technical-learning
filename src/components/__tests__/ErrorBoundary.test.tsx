import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { ReactElement } from "react";
import { ErrorBoundary } from "../ErrorBoundary";

function Boom({ shouldThrow }: { shouldThrow: boolean }): ReactElement {
  if (shouldThrow) throw new Error("scene init failed");
  return <div>content loaded</div>;
}

describe("ErrorBoundary", () => {
  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary title="Broken">
        <Boom shouldThrow={false} />
      </ErrorBoundary>,
    );
    expect(screen.getByText("content loaded")).toBeTruthy();
  });

  it("shows learner-facing recovery guidance and a retry action on error", () => {
    // React logs the caught error to the console; that's expected here.
    const consoleError = console.error;
    console.error = () => {};
    try {
      render(
        <ErrorBoundary title="This lesson couldn't load">
          <Boom shouldThrow={true} />
        </ErrorBoundary>,
      );
    } finally {
      console.error = consoleError;
    }

    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByText("This lesson couldn't load")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Try again" }),
    ).toBeTruthy();
  });

  it("re-attempts rendering children after retry", () => {
    const consoleError = console.error;
    console.error = () => {};
    let shouldThrow = true;
    function Wrapper() {
      return (
        <ErrorBoundary title="Broken">
          <Boom shouldThrow={shouldThrow} />
        </ErrorBoundary>
      );
    }
    const { rerender } = render(<Wrapper />);
    expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();

    // Update the underlying children to a non-throwing version first; the
    // boundary still shows the fallback until retry clears its error state.
    shouldThrow = false;
    rerender(<Wrapper />);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    console.error = consoleError;

    expect(screen.getByText("content loaded")).toBeTruthy();
  });
});
