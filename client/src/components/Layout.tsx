import { Outlet } from "react-router-dom";
import Loading from "./Loading";

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Loading />
      <Outlet />
    </div>
  );
}
