import { Navigate, createBrowserRouter } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { DevMafsDemoPage } from "../pages/DevMafsDemoPage";
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
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
