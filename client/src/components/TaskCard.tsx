import { useDispatch } from "react-redux";
import { deleteTask, updateTask, type Task } from "../store/slices/taskSlice";
import type { AppDispatch } from "../store/store";
import { useState } from "react";
import type { TaskForm } from "../pages/ProjectDetails";
import { useForm } from "react-hook-form";
import type { User } from "../store/slices/authSlice";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createPortal } from "react-dom";

interface Props {
  task: Task;
  projectMembers: (User | undefined)[];
}

const statusOptions = [
  { name: "To Do", value: "TODO" },
  { name: "In Progress", value: "IN_PROGRESS" },
  { name: "Done", value: "DONE" },
];
const priorityOptions = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const priorityConfig: Record<
  string,
  { label: string; dot: string; text: string }
> = {
  LOW: { label: "Low", dot: "bg-gray-400", text: "text-gray-400" },
  MEDIUM: { label: "Medium", dot: "bg-amber-400", text: "text-amber-400" },
  HIGH: { label: "High", dot: "bg-orange-400", text: "text-orange-400" },
  URGENT: { label: "Urgent", dot: "bg-red-400", text: "text-red-400" },
};

function getInitials(username: string) {
  return username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function TaskCard({ task, projectMembers }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const { register, handleSubmit, reset } = useForm<TaskForm>({
    defaultValues: {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : "",
      assigneeId: task.assigneeId,
    },
  });

  const onSubmit = async (data: TaskForm) => {
    setIsSaving(true);
    await dispatch(
      updateTask({
        id: task.id,
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        projectId: task.projectId,
      }),
    );
    setIsEditing(false);
    setIsSaving(false);
  };

  const assignee = projectMembers.find((m) => m?.id === task.assigneeId);
  const p = priorityConfig[task.priority];

  const isOverdue =
    task.dueDate &&
    task.status !== "DONE" &&
    new Date(task.dueDate) < new Date();

  const dueDateString = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      })
    : null;

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="group">
      <div className="rounded-lg bg-gray-800 border border-white/5 hover:border-white/10 transition-colors p-3">
        <div className="flex items-center justify-between mb-2">
          <div
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-600 hover:text-gray-400 transition-colors select-none"
            title="Drag to reorder"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <circle cx="3" cy="2.5" r="1" />
              <circle cx="9" cy="2.5" r="1" />
              <circle cx="3" cy="6" r="1" />
              <circle cx="9" cy="6" r="1" />
              <circle cx="3" cy="9.5" r="1" />
              <circle cx="9" cy="9.5" r="1" />
            </svg>
          </div>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                dispatch(deleteTask({ id: task.id }));
              }}
              className="text-xs text-red-500 hover:text-red-400 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

        <p className="text-sm text-white font-medium leading-snug mb-1">
          {task.title}
        </p>

        {task.description && (
          <p className="text-xs text-gray-500 mb-2 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-3">
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium ${p.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
            {p.label}
          </span>

          <div className="flex items-center gap-2">
            {dueDateString && (
              <span
                className={`text-xs ${isOverdue ? "text-red-400" : "text-gray-500"}`}
              >
                {dueDateString}
              </span>
            )}

            {assignee && (
              <div
                title={assignee.username}
                className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
              >
                {getInitials(assignee.username)}
              </div>
            )}
          </div>
        </div>
      </div>

      {isEditing &&
        createPortal(
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget && !isSaving)
                setIsEditing(false);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          >
            <div className="bg-gray-900 border border-white/10 rounded-xl w-full max-w-md p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Edit Task
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    {...register("title", { required: true })}
                    className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Description
                  </label>
                  <textarea
                    {...register("description")}
                    rows={3}
                    className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
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
                      {statusOptions.map((s) => (
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
                      {priorityOptions.map((p) => (
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
                    type="date"
                    {...register("dueDate")}
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
                    onClick={() => {
                      setIsEditing(false);
                      reset();
                    }}
                    disabled={isSaving}
                    className="flex-1 rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-gray-300 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 rounded-md bg-indigo-500 hover:bg-indigo-400 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
