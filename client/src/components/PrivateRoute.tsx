import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { Navigate, useLocation } from "react-router-dom";

export default function PrivateRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ path: location.pathname }} />;
  }

  return children;
}
