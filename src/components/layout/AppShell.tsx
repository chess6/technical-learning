import { Link, Outlet } from "react-router-dom";
import { useCallback } from "react";
import { CourseSidebar } from "./CourseSidebar";
import { ThemeToggle } from "./ThemeToggle";
import { useSidebarOpen } from "../../hooks/useSidebarOpen";
import { useTheme } from "../../hooks/useTheme";
import { LearnerStateProvider } from "../../platform/useLearnerState";
import { PRODUCT_NAME } from "../../platform/product";
import { registerSpacedScheduler } from "../../lessons/spacedSchedule";
import "./AppShell.css";

// Install the real spaced-retrieval scheduler once, at app boot (Package H).
// Occurrence RECONCILIATION happens inside learner-state normalization on hydrate,
// so no separate hydrate step is needed here.
registerSpacedScheduler();

export function AppShell() {
  const { open, closeSidebar, toggleSidebar } = useSidebarOpen();
  const { theme, setTheme } = useTheme();

  const handleClose = useCallback(() => {
    closeSidebar();
  }, [closeSidebar]);

  return (
    <LearnerStateProvider>
    <div className="app-shell">
      <header className="app-shell__header">
        <button
          type="button"
          className="app-shell__menu"
          aria-expanded={open}
          aria-controls="course-sidebar"
          onClick={toggleSidebar}
        >
          Contents
        </button>
        {/* App-level brand only. The course a learner is inside is named by the
            sidebar and the lesson header, so this must stay subject-neutral. */}
        <Link to="/" className="app-shell__brand">
          <span className="app-shell__brand-main">{PRODUCT_NAME}</span>
        </Link>
        <div className="app-shell__tools">
          <ThemeToggle theme={theme} onChange={setTheme} />
        </div>
      </header>

      <div className="app-shell__body">
        <div id="course-sidebar">
          <CourseSidebar open={open} onClose={handleClose} />
        </div>
        {open && (
          <button
            type="button"
            className="app-shell__backdrop"
            aria-label="Close course contents"
            onClick={handleClose}
          />
        )}
        <main className="app-shell__main">
          <Outlet />
        </main>
      </div>
    </div>
    </LearnerStateProvider>
  );
}
