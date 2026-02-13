import { useDispatch } from "react-redux";
import { deleteTask, updateTask, type Task } from "../store/slices/taskSlice";
import type { AppDispatch } from "../store/store";
import { useState } from "react";

interface Props 
{
    task: Task;
}

const status = [{ name: "To Do", value: "TODO" }, { name: "In Progress", value: "IN_PROGRESS" }, { name: "Done", value: "DONE" }];
const priority = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const priorityColors: Record<string, string> = {
    LOW: "text-gray-400",
    MEDIUM: "text-amber-400",
    HIGH: "text-orange-400",
    URGENT: "text-red-400",
};

export default function TaskCard({ task }: Props)
{
    const dispatch = useDispatch<AppDispatch>();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [newTitle, setNewTitle] = useState(task.title);
    const [newDescription, setNewDescription] = useState(task.description);
    const [newStatus, setNewStatus] = useState(task.status);
    const [newPriority, setNewPriority] = useState(task.priority);
    const [newDueDate, setNewDueDate] = useState(task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "");

    const handleDelete = async () => {
        await dispatch(deleteTask({ id: task.id }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await dispatch(updateTask({
            id: task.id,
            title: newTitle,
            description: newDescription,
            status: newStatus,
            priority: newPriority,
            dueDate: newDueDate ? new Date(newDueDate) : null,
            projectId: task.projectId,
            assigneeId: task.assigneeId,
        }));
        setIsSaving(false);
        setIsEditing(false);
    };

    const dueDateString = task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : null;

    return (
        <div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <p className="text-sm text-white font-medium">{task.title}</p>

                {task.description && <p className="text-xs text-gray-400 mt-1">{task.description}</p>}

                <div className="flex items-center justify-between mt-3">
                    <span className={`text-xs font-semibold ${priorityColors[task.priority]}`}>
                        {task.priority}
                    </span>
                    {dueDateString && <span className="text-xs text-gray-500">{dueDateString}</span>}
                </div>

                <div className="flex gap-2 mt-3">
                    <button onClick={() => setIsEditing(true)} className="text-xs text-gray-400 hover:text-white">Edit</button>
                    <button onClick={handleDelete} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                </div>
            </div>

            {isEditing && (
                <div onClick={(e) => { if(e.target === e.currentTarget && !isSaving) setIsEditing(false);}} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-gray-900 border border-white/10 rounded-xl w-full max-w p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Edit Task</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Title *</label>
                                <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required
                                 className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Description</label>
                                <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} rows={3}
                                 className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Status</label>
                                    <select
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        className="w-full rounded-md bg-gray-800 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                                    >
                                        {status.map(s => (
                                            <option key={s.value} value={s.value}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Priority</label>
                                    <select
                                        value={newPriority}
                                        onChange={(e) => setNewPriority(e.target.value)}
                                        className="w-full rounded-md bg-gray-800 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                                    >
                                        {priority.map(p => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Due Date</label>
                                <input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} 
                                 className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 [color-scheme:dark]"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setIsEditing(false)} disabled={isSaving}
                                 className="flex-1 rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-gray-300 hover:bg-white/10"
                                >
                                Cancel
                                </button>
                                <button type="submit" disabled={isSaving}
                                 className="flex-1 rounded-md bg-indigo-500 hover:bg-indigo-400 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                                >
                                    {isSaving ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}