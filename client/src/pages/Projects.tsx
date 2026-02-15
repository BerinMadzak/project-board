import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store";
import { useEffect, useState, useRef } from "react";
import { getProjects, addProject } from "../store/slices/projectSlice";
import ProjectCard from "../components/ProjectCard";
import { useNavigate } from "react-router-dom";

const colors = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#f97316",
  "#ef4444",
];

export default function Projects() {
  const dispatch = useDispatch<AppDispatch>();
  const { projects, loading, error } = useSelector(
    (state: RootState) => state.projects,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(colors[0]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getProjects());
  }, [dispatch]);

  useEffect(() => {
    if (modalOpen) {
      setTimeout(() => nameRef.current?.focus(), 50);
    }
  }, [modalOpen]);

  const openModal = () => {
    setName("");
    setDescription("");
    setColor(colors[0]);
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Project name is required.");
      return;
    }
    setFormError(null);
    setSubmitting(true);
    await dispatch(
      addProject({ name: name.trim(), description: description.trim(), color }),
    );
    setSubmitting(false);
    setModalOpen(false);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) closeModal();
  };

  return (
    <>
      <div className="min-h-screen px-8 py-10">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
              <button onClick={() => navigate("/home")} className="hover:text-white transition-colors">
                Home
              </button>
              <span>/</span>
              <span className="text-gray-400">Projects</span>
            </div>
            <h1 className="text-4xl font-bold text-white">Projects</h1>
          </div>

          <button
            onClick={openModal}
            className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400"
          >
            + New Project
          </button>
        </div>

        <div className="h-px bg-white/5 mb-10" />

        {loading && (
          <div className="flex items-center gap-3 text-gray-400 text-sm">
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            Loading projects...
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 mb-6">
            {error}
          </div>
        )}

        {!loading && projects.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <svg
                className="h-8 w-8 text-gray-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
                />
              </svg>
            </div>
            <p className="text-white font-semibold mb-1">No projects yet</p>
            <p className="text-gray-500 text-sm mb-6 max-w-xs">
              Create your first project to start organizing tasks and
              collaborating with your team.
            </p>
            <button
              onClick={openModal}
              className="flex items-center gap-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30 px-4 py-2 text-sm font-medium text-indigo-300 hover:bg-indigo-500/30"
            >
              + Create a project
            </button>
          </div>
        )}

        {!loading && projects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="cursor-pointer"
              >
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={handleBackdropClick}
        >
          <div className="w-full max-w-md rounded-2xl bg-gray-900 border border-white/10 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  New Project
                </h2>
              </div>
              <button
                onClick={closeModal}
                disabled={submitting}
                className="p-1.5 rounded-md text-gray-500 hover:text-white hover:bg-white/10"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
              {formError && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  ref={nameRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. My Website Design"
                  className="block w-full rounded-md bg-white/5 px-3 py-2 text-sm text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-600 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Description
                  <span className="text-gray-600 font-normal ml-1">
                    (optional)
                  </span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this project about?"
                  rows={3}
                  className="block w-full rounded-md bg-white/5 px-3 py-2 text-sm text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-600 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">
                  Accent Color
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className="h-7 w-7 rounded-full border-2 transition-all duration-150 hover:scale-110 active:scale-95"
                      style={{
                        backgroundColor: c,
                        borderColor: color === c ? "white" : "transparent",
                        boxShadow: color === c ? `0 0 0 1px ${c}` : "none",
                      }}
                      aria-label={`Select color ${c}`}
                    />
                  ))}

                  <label
                    className="h-7 w-7 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-white/40 transition-colors overflow-hidden relative"
                    title="Custom color"
                  >
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                    <svg
                      className="h-3 w-3 text-gray-500 pointer-events-none"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </label>
                </div>

                <div className="mt-3 flex items-center gap-2 rounded-md bg-white/5 px-3 py-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs text-gray-400 truncate">
                    {name || "Project name preview"}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="flex-1 rounded-md bg-white/5 px-3 py-2 text-sm font-semibold text-gray-300 hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-400 transition-colors disabled:opacity-60 shadow-lg shadow-indigo-500/20"
                >
                  {submitting ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                      Creating...
                    </>
                  ) : (
                    "Create Project"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
