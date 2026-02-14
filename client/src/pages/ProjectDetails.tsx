import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store";
import { addTask, getTasks, moveTask } from "../store/slices/taskSlice";
import { useNavigate, useParams } from "react-router-dom";
import { getProjects } from "../store/slices/projectSlice";
import TaskCard from "../components/TaskCard";
import { useForm } from "react-hook-form";
import { DndContext, pointerWithin, PointerSensor, useSensor, useSensors, type DragEndEvent, type DragOverEvent } from "@dnd-kit/core";
import { updateTask } from "../store/slices/taskSlice";
import { DropColumn } from "../components/DropColumn";
import { useSocket } from "../hooks/useSocket";
import MemberPanel from "../components/MemberPanel";

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
  assigneeId: string | null;
  order: number | null;
}

export default function ProjectDetails() {
  const { projectId } = useParams<{ projectId: string }>();

  if (projectId) useSocket(projectId);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { tasks, loading, error } = useSelector(
    (state: RootState) => state.tasks,
  );
  const { projects } = useSelector((state: RootState) => state.projects);
  const project = projects.find((p) => p.id === projectId);

  const [modalOpen, setModalOpen] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const { register, handleSubmit, reset, setValue } = useForm<TaskForm>({
    defaultValues: {
      title: "",
      description: "",
      status: "TODO",
      priority: "MEDIUM",
      dueDate: "",
      assigneeId: null,
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active } = event;
    const taskId = active.id as string;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const columnTasks = tasks.filter(
      (t) =>
        t.projectId === projectId &&
        t.status === task.status &&
        t.id !== taskId,
    );
    const taskIndex = tasks
      .filter((t) => t.projectId === projectId && t.status === task.status)
      .findIndex((t) => t.id === taskId);

    const prev = columnTasks[taskIndex - 1];
    const next = columnTasks[taskIndex];

    let newOrder: number;
    if (!prev && !next) {
      newOrder = 1000;
    } else if (!prev) {
      newOrder = (next.order as number) - 1000;
    } else if (!next) {
      newOrder = (prev.order as number) + 1000;
    } else {
      newOrder = ((prev.order as number) + (next.order as number)) / 2;
    }

    await dispatch(
      updateTask({
        ...task,
        order: newOrder,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
      }),
    );
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    if (taskId === overId) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const overColumn = status.find((s) => s.value === overId);
    if (overColumn) {
      if (task.status !== overColumn.value) {
        dispatch(moveTask({ taskId, status: overColumn.value }));
      }
      return;
    }

    const overTask = tasks.find((t) => t.id === overId);
    if (!overTask) return;

    dispatch(
      moveTask({
        taskId,
        status: overTask.status,
        overId,
      }),
    );
  };

  useEffect(() => {
    if (projectId)
      dispatch(getTasks({ projectId })).finally(() => setInitialLoad(false));
    if (projects.length === 0) dispatch(getProjects());
  }, [dispatch, projectId]);

  const onSubmit = async (data: TaskForm) => {
    if (!projectId) return;

    await dispatch(
      addTask({
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        projectId,
      }),
    );

    setModalOpen(false);
    reset();
  };

  const projectTasks = tasks.filter((t) => t.projectId === projectId);
  const projectMembers = [
    project?.owner,
    ...(project?.members?.map((m) => m.user) || []),
  ];

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

      {projectId && <MemberPanel projectId={projectId} />}

      {loading && <p className="text-gray-400 text-sm">Loading tasks...</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {!initialLoad && (
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
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
                  <DropColumn
                    id={s.value}
                    items={filteredTasks.map((t) => t.id)}
                  >
                    {filteredTasks.map((t) => (
                      <TaskCard
                        key={t.id}
                        task={t}
                        projectMembers={projectMembers}
                      />
                    ))}
                  </DropColumn>
                </div>
              );
            })}
          </div>
        </DndContext>
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

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Assignee
                </label>
                <select
                  {...register("assigneeId")}
                  className="w-full rounded-md bg-gray-800 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Unassigned</option>
                  {projectMembers.map((m) => (
                    <option key={m?.id} value={m?.id}>
                      {m?.username}
                    </option>
                  ))}
                </select>
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
