import { Link, Outlet } from "react-router-dom";
import { useCallback } from "react";
import { CourseSidebar } from "./CourseSidebar";
import { useSidebarOpen } from "../../hooks/useSidebarOpen";
import "./AppShell.css";

export function AppShell() {
  const { open, closeSidebar, toggleSidebar } = useSidebarOpen();

  const handleClose = useCallback(() => {
    closeSidebar();
  }, [closeSidebar]);

  return (
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
        <Link to="/" className="app-shell__brand">
          <span className="app-shell__brand-main">Linear Algebra</span>
          <span className="app-shell__brand-sub">Visual Learning</span>
        </Link>
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
  );
}
