import { Navigate, createBrowserRouter } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
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
      ...devRoutes,
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
