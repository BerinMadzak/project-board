import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store";
import { addTask, getTasks } from "../store/slices/taskSlice";
import { useNavigate, useParams } from "react-router-dom";
import { getProjects } from "../store/slices/projectSlice";
import TaskCard from "../components/TaskCard";
import { useForm } from "react-hook-form";

const status = [
  { name: "To Do", value: "TODO" },
  { name: "In Progress", value: "IN_PROGRESS" },
  { name: "Done", value: "DONE" },
];
const priority = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export interface TaskForm {
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
}

export default function ProjectDetails() {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { tasks, loading, error } = useSelector(
    (state: RootState) => state.tasks,
  );
  const { projects } = useSelector((state: RootState) => state.projects);
  const project = projects.find((p) => p.id === projectId);

  const [modalOpen, setModalOpen] = useState(false);

  const { register, handleSubmit, reset, setValue } = useForm<TaskForm>({
    defaultValues: {
      title: "",
      description: "",
      status: "TODO",
      priority: "MEDIUM",
      dueDate: "",
    },
  });

  useEffect(() => {
    if (projectId) dispatch(getTasks({ projectId }));
    if (projects.length === 0) dispatch(getProjects());
  }, [dispatch, projectId]);

  const onSubmit = async (data: TaskForm) => {
    if (!projectId) return;

    await dispatch(
      addTask({
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        projectId,
        assigneeId: null,
      }),
    );

    setModalOpen(false);
    reset();
  };

  const projectTasks = tasks.filter((t) => t.projectId === projectId);

  return (
    <div className="p-8">
      <div className="mb-6">
        <button
          onClick={() => navigate("/projects")}
          className="text-sm text-gray-400 hover:text-white mb-3 block"
        >
          Back to Projects
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{project?.name}</h1>
            {project?.description && (
              <p className="text-sm text-gray-400 mt-1">
                {project.description}
              </p>
            )}
          </div>
          <button
            onClick={() => {
              setModalOpen(true);
              reset();
            }}
            className="bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold px-4 py-2 rounded-md"
          >
            + Add Task
          </button>
        </div>
      </div>

      {loading && <p className="text-gray-400 text-sm">Loading tasks...</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {!loading && (
        <div className="flex gap-6 overflow-x-auto pb-4">
          {status.map((s) => {
            const filteredTasks = projectTasks.filter(
              (t) => t.status === s.value,
            );
            return (
              <div key={s.name} className="w-72 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-white">
                    {s.name}
                    <span className="ml-2 text-gray-400 font-normal">
                      {filteredTasks.length}
                    </span>
                  </span>
                  <button
                    onClick={() => {
                      setValue("status", s.value);
                      setModalOpen(true);
                    }}
                    className="text-gray-400 hover:text-white text-xl"
                  >
                    +
                  </button>
                </div>
                <div className="rounded-lg bg-white/[0.02] p-2 space-y-2 min-h-32">
                  {filteredTasks.map((t) => (
                    <TaskCard key={t.id} task={t} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        >
          <div className="bg-gray-900 border border-white/10 rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-white mb-4">New Task</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Title *
                </label>
                <input
                  {...register("title", { required: true })}
                  autoFocus
                  type="text"
                  placeholder="New Task"
                  className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  {...register("description")}
                  rows={3}
                  placeholder="Describe the task"
                  className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Status
                  </label>
                  <select
                    {...register("status")}
                    className="w-full rounded-md bg-gray-800 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    {status.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Priority
                  </label>
                  <select
                    {...register("priority")}
                    className="w-full rounded-md bg-gray-800 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    {priority.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Due Date
                </label>
                <input
                  {...register("dueDate")}
                  type="date"
                  className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 [color-scheme:dark]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-gray-300 hover:bg-white/10"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-md bg-indigo-500 hover:bg-indigo-400 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
