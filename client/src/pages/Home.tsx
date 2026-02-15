import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/slices/authSlice";
import type { RootState } from "../store/store";

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <span className="text-white font-semibold tracking-tight flex gap-2">
          <img
            alt="Project Board Logo"
            src="logo.png"
            className="mx-auto h-8 w-auto"
          />
          project-board
        </span>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-gray-400">
                Hi, {user?.username}
              </span>
              <button
                onClick={() => navigate("/projects")}
                className="text-sm bg-indigo-500 hover:bg-indigo-400 text-white font-medium px-4 py-1.5 rounded-md transition-colors"
              >
                My Projects
              </button>
              <button
                onClick={() => dispatch(logout())}
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-4 py-1.5 rounded-lg transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Log in
              </button>
              <button
                onClick={() => navigate("/register")}
                className="text-sm bg-indigo-500 hover:bg-indigo-400 text-white font-medium px-4 py-1.5 rounded-md transition-colors"
              >
                Get started
              </button>
            </>
          )}
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 pb-24">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium px-3 py-1 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
          Collaborative task management
        </div>

        <h1 className="text-5xl font-bold text-white tracking-tight max-w-xl leading-tight mb-5">
          Get things done, <span className="text-indigo-400">together</span>
        </h1>

        <p className="text-gray-400 text-lg max-w-md mb-10">
          Organize projects, track tasks, and collaborate with your team.
        </p>

        {isAuthenticated ? (
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/projects")}
              className="bg-indigo-500 hover:bg-indigo-400 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
            >
              Go to Projects
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
            >
              Dashboard
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/register")}
              className="bg-indigo-500 hover:bg-indigo-400 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
            >
              Get started free
            </button>
            <button
              onClick={() => navigate("/login")}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
            >
              Log in
            </button>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-3 mt-16">
          {[
            "Kanban boards",
            "Real-time updates",
            "Team members",
            "Priority levels",
          ].map((f) => (
            <span
              key={f}
              className="bg-white/5 border border-white/10 text-gray-400 text-sm px-4 py-1.5 rounded-full"
            >
              {f}
            </span>
          ))}
        </div>
      </main>
    </div>
  );
}
