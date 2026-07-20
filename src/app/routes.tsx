import { Navigate, createBrowserRouter } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { DevMafsDemoPage } from "../pages/DevMafsDemoPage";
import { DevTransformSpikePage } from "../pages/DevTransformSpikePage";
import { HomePage } from "../pages/HomePage";
import { LessonPage } from "../pages/LessonPage";

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
        element: <LessonPage />,
      },
      {
        path: "dev/mafs-demo",
        element: <DevMafsDemoPage />,
      },
      {
        path: "dev/transform-spike",
        element: <DevTransformSpikePage />,
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
