import { Navigate, createBrowserRouter } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { GlossaryPage } from "../pages/GlossaryPage";
import { HomePage } from "../pages/HomePage";
import { LazyLessonRoute } from "./LazyLessonRoute";

/**
 * Development-only routes (technical spikes/demos) are excluded from the
 * production route tree entirely — `import.meta.env.DEV` is statically
 * replaced at build time, so dead-code elimination drops both the route and
 * its lazy-loaded module graph from production bundles.
 */
const devRoutes = import.meta.env.DEV
  ? [
      {
        path: "dev/mafs-demo",
        lazy: async () => {
          const { DevMafsDemoPage } = await import(
            "../pages/DevMafsDemoPage"
          );
          return { Component: DevMafsDemoPage };
        },
      },
      {
        path: "dev/transform-spike",
        lazy: async () => {
          const { DevTransformSpikePage } = await import(
            "../pages/DevTransformSpikePage"
          );
          return { Component: DevTransformSpikePage };
        },
      },
      {
        path: "dev/assessment",
        lazy: async () => {
          const { DevAssessmentIndexPage } = await import(
            "../pages/DevAssessmentIndexPage"
          );
          return { Component: DevAssessmentIndexPage };
        },
      },
      {
        // Route identifies the concrete SET id, not merely the module, so later
        // packages can register multiple sets per module without changing this.
        path: "dev/module/:setId",
        lazy: async () => {
          const { DevModuleRunnerPage } = await import(
            "../pages/DevModuleRunnerPage"
          );
          return { Component: DevModuleRunnerPage };
        },
      },
      {
        path: "dev/review",
        lazy: async () => {
          const { DevReviewPage } = await import("../pages/DevReviewPage");
          return { Component: DevReviewPage };
        },
      },
    ]
  : [];

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "lesson/:lessonId",
        element: <LazyLessonRoute />,
      },
      {
        path: "glossary",
        element: <GlossaryPage />,
      },
      ...devRoutes,
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
