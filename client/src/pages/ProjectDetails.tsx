import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store";
import { addTask, getTasks } from "../store/slices/taskSlice";
import { useNavigate, useParams } from "react-router-dom";
import { getProjects } from "../store/slices/projectSlice";
import TaskCard from "../components/TaskCard";

const status = [{ name: "To Do", value: "TODO" }, { name: "In Progress", value: "IN_PROGRESS" }, { name: "Done", value: "DONE" }];
const priority = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export default function ProjectDetails()
{
    const { projectId } = useParams<{ projectId: string }>();

    const dispatch = useDispatch<AppDispatch>();
    const { tasks, loading, error } = useSelector((state: RootState) => state.tasks);
    const { projects } = useSelector((state: RootState) => state.projects);
    const project = projects.find(p => p.id === projectId);
    const navigate = useNavigate();

    const [modalOpen, setModalOpen] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [newStatus, setNewStatus] = useState("TODO");
    const [newPriority, setNewPriority] = useState("MEDIUM");
    const [newDueDate, setNewDueDate] = useState("");

    useEffect(() => {
        if(projectId) dispatch(getTasks({ projectId }));
        if(projects.length === 0) dispatch(getProjects());
    }, [dispatch, projectId]);

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!newTitle || !projectId) return;
        await dispatch(addTask({
            title: newTitle,
            description: newDescription,
            status: newStatus,
            priority: newPriority,
            dueDate: newDueDate ? new Date(newDueDate) : null,
            projectId,
            assigneeId: null,
        }));
        
        setModalOpen(false);
        setNewTitle("");
        setNewDescription("");
        setNewStatus("TODO");
        setNewPriority("MEDIUM");
        setNewDueDate("");
    };

    return (
        <div className="p-8">
            <div className="mb-6">
                <button onClick={() => navigate("/projects")} className="text-sm text-gray-400 hover:text-white mb-3 block">Back to Projects</button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">{project?.name}</h1>
                        {project?.description && <p className="text-sm text-gray-400 mt-1">{project.description}</p>}
                    </div>
                    <button onClick={() => { setModalOpen(true); }} className="bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold px-4 py-2 rounded-md">+ Add Task</button>
                </div>
            </div>  

            {loading && <p className="text-gray-400 text-sm">Loading tasks...</p>}
            {error && <p className="text-red-500 text-sm">{error}</p>}

            {!loading && (
                <div className="flex gap-6 overflow-x-auto pb-4">
                    {status.map(s => {
                        const filteredTasks = tasks.filter(t => t.status === s.value);
                        return (
                            <div key={s.name} className="w-72 flex-shrink-0">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-semibold text-white">
                                        {s.name}
                                        <span className="ml-2 text-gray-400 font-normal">{filteredTasks.length}</span>
                                    </span>
                                    <button onClick={() => { setNewStatus(s.value); setModalOpen(true); }} className="text-gray-400 hover:text-white text-xl">
                                        +
                                    </button>
                                </div>
                                 <div className="rounded-lg bg-white/[0.02] p-2 space-y-2 min-h-32">
                                    {filteredTasks.map(t => (
                                        <TaskCard key={t.id} task={t} />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}