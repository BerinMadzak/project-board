import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "../components/Layout";
import Home from "../pages/Home";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/home" replace /> },
      { path: "home", element: <Home /> },
    ],
  },
]);

export default router;
