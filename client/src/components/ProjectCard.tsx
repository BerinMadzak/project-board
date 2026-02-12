import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store";
import {
  deleteProject,
  updateProject,
  type Project,
} from "../store/slices/projectSlice";
import { getTasks } from "../store/slices/taskSlice";

interface Props {
  project: Project;
}

export default function ProjectCard({ project }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(project.name);
  const [editDescription, setEditDescription] = useState(project.description);
  const [editColor, setEditColor] = useState(project.color);
  const [isDeleting, setIsDeleting] = useState(false);

  const taskCount = useSelector(
    (state: RootState) =>
      state.tasks.tasks.filter((task) => task.projectId === project.id).length,
  );

  useEffect(() => {
    dispatch(getTasks({ projectId: project.id }));
  }, [project]);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    await dispatch(deleteProject({ id: project.id }));
    setIsDeleting(false);
    setMenuOpen(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setMenuOpen(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await dispatch(
      updateProject({
        id: project.id,
        name: editName,
        description: editDescription,
        color: editColor,
      }),
    );
    setIsEditing(false);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditName(project.name);
    setEditDescription(project.description);
    setEditColor(project.color);
    setIsEditing(false);
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen((prev) => !prev);
  };

  const accentColor = project.color || "#6366f1";

  return (
    <div className="relative group rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-200 hover:bg-white/8 cursor-pointer overflow-hidden">
      <div
        className="h-1 w-full rounded-t-xl"
        style={{ backgroundColor: accentColor }}
      />

      <div className="p-5">
        {isEditing ? (
          <form
            onSubmit={handleUpdate}
            onClick={(e) => e.stopPropagation()}
            className="space-y-3"
          >
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Project Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-sm text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Description
              </label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={2}
                className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-sm text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  className="h-8 w-10 rounded cursor-pointer bg-transparent border border-white/10"
                />
                <span className="text-xs text-gray-400">{editColor}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-400 transition-colors"
              >
                Save
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex-1 rounded-md bg-white/5 px-3 py-1.5 text-sm font-semibold text-gray-300 hover:bg-white/10 transition-colors border border-white/10"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: accentColor }}
                />
                <h3 className="text-sm font-semibold text-white truncate">
                  {project.name}
                </h3>
              </div>

              <div className="relative flex-shrink-0">
                <button
                  onClick={toggleMenu}
                  className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Project options"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>

                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                      }}
                    />
                    <div className="absolute right-0 top-7 z-20 w-36 rounded-md bg-gray-900 border border-white/10 shadow-xl overflow-hidden">
                      <button
                        onClick={handleEdit}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zm-2.207 2.207L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                      >
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zm-1 8a1 1 0 012 0v3a1 1 0 11-2 0v-3zm4-1a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {isDeleting ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <p className="mt-2 text-xs text-gray-400 line-clamp-2 min-h-[2rem]">
              {project.description || (
                <span className="italic text-gray-600">No description</span>
              )}
            </p>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  {taskCount} {taskCount === 1 ? "task" : "tasks"}
                </span>
              </div>

              <span className="text-xs text-gray-600">
                {new Date(project.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
