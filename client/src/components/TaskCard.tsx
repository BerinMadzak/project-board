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

  const status = [
    { name: "To Do", value: "TODO" },
    { name: "In Progress", value: "IN_PROGRESS" },
    { name: "Done", value: "DONE" },
  ];
  const priority = ["LOW", "MEDIUM", "HIGH", "URGENT"];

  const priorityColors: Record<string, string> = {
    LOW: "text-gray-400",
    MEDIUM: "text-amber-400",
    HIGH: "text-orange-400",
    URGENT: "text-red-400",
  };

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

    const handleDelete = async () => {
      await dispatch(deleteTask({ id: task.id }));
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

    const dueDateString = task.dueDate
      ? new Date(task.dueDate).toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : null;

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className="relative group rounded-xl bg-gray-800/50 border border-white/5 p-4"
      >
        <div
          {...listeners}
          className="flex w-full justify-end pr-3 absolute top-2 left-2 cursor-grab active:cursor-grabbing text-gray-600 hover:text-gray-400"
        >
          ⠿
        </div>
        <div
          className={`rounded-lg border border-white/10 bg-white/5 p-3 border-t-4 border-${priorityColors[task.priority]}`}
        >
          <div className="flex justify-between">
            <p className="text-sm text-white font-medium">{task.title}</p>
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="text-xs text-gray-400 hover:text-white"
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Delete
              </button>
            </div>
          </div>

          {task.description && (
            <p className="text-xs text-gray-400 mt-1">{task.description}</p>
          )}

          <div className="flex items-center justify-between mt-3">
            <span
              className={`text-xs font-semibold ${priorityColors[task.priority]}`}
            >
              {task.priority}
            </span>
            {dueDateString && (
              <span>
                <div className="text-xs text-gray-500">Due Date:</div>
                <div className="text-xs text-gray-500">{dueDateString}</div>
              </span>
            )}
          </div>

          {task.assigneeId && (
            <div className="mt-3 text-xs text-gray-400">
              Assigned:{" "}
              {projectMembers.find((m) => m?.id === task.assigneeId)?.username}
            </div>
          )}
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
                      {projectMembers!.map((m) => (
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
