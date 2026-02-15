// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { AppDispatch, RootState } from "../store/store";
import { getProjects } from "../store/slices/projectSlice";
import { fetchProjectAnalytics, clearAnalytics } from "../store/slices/analyticsSlice";

const statusConfig: Record<string, { label: string; className: string }> = {
  DONE: {
    label: "Done",
    className: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
  },
  TODO: {
    label: "To Do",
    className: "bg-white/5 text-gray-400 border border-white/10",
  },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-gray-900 border border-white/10 px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="text-indigo-400 font-semibold">{payload[0].value} completed</p>
    </div>
  );
};

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { projects } = useSelector((state: RootState) => state.projects);
  const { data, loading, error } = useSelector((state: RootState) => state.analytics);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (projects.length === 0) {
      dispatch(getProjects());
    }
  }, [dispatch]);

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects]);

  useEffect(() => {
    if (!selectedProjectId) return;
    dispatch(clearAnalytics());
    dispatch(fetchProjectAnalytics(selectedProjectId));
  }, [selectedProjectId, dispatch]);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const stats = data
    ? [
        { label: "Total Tasks",  value: data.stats.total,      color: "text-white"       },
        { label: "Completed",    value: data.stats.completed,  color: "text-emerald-400" },
        { label: "In Progress",  value: data.stats.inProgress, color: "text-indigo-400"  },
        { label: "Overdue",      value: data.stats.overdue,    color: "text-red-400"     },
      ]
    : [];

  const pct =
    data && data.stats.total > 0
      ? Math.round((data.stats.completed / data.stats.total) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white px-8 py-10">

      <div className="flex items-end justify-between mb-10">
        <div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
            <button
              onClick={() => navigate("/home")}
              className="hover:text-white transition-colors"
            >
              Home
            </button>
            <span>/</span>
            <span className="text-gray-400">Dashboard</span>
          </div>
          <h1 className="text-4xl font-bold text-white">Dashboard</h1>
        </div>

        {projects.length > 0 && selectedProject && (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 px-4 py-2.5 text-sm font-medium text-white transition-colors"
            >
              <span
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: selectedProject.color || "#6366f1" }}
              />
              {selectedProject.name}
              <svg className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-1.5 z-20 w-52 rounded-xl bg-gray-900 border border-white/10 shadow-2xl overflow-hidden">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => { setSelectedProjectId(project.id); setDropdownOpen(false); }}
                      className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-left transition-colors hover:bg-white/5 ${
                        project.id === selectedProjectId ? "text-white bg-white/5" : "text-gray-400"
                      }`}
                    >
                      <span
                        className="h-2 w-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: project.color || "#6366f1" }}
                      />
                      {project.name}
                      {project.id === selectedProjectId && (
                        <svg className="ml-auto h-3.5 w-3.5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="h-px bg-white/5 mb-10" />

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 mb-6">
          {error}
        </div>
      )}

      {loading && (
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl bg-white/5 border border-white/10 h-24" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl bg-white/5 border border-white/10 h-64" />
            <div className="rounded-xl bg-white/5 border border-white/10 h-64" />
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 h-48" />
        </div>
      )}

      {!loading && data && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {stats.map(({ label, value, color }) => (
              <div key={label} className="rounded-xl bg-white/5 border border-white/10 p-5">
                <p className="text-xs text-gray-500 mb-2">{label}</p>
                <p className={`text-3xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

            <div className="rounded-xl bg-white/5 border border-white/10 p-6">
              <p className="text-sm font-semibold text-white mb-5">Completion Over Time</p>
              {data.completionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={data.completionData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      stroke="#6366f1"
                      strokeWidth={2}
                      dot={{ fill: "#6366f1", r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: "#818cf8" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[180px] text-sm text-gray-600">
                  No completed tasks in the last 30 days
                </div>
              )}
            </div>

            <div className="rounded-xl bg-white/5 border border-white/10 p-6">
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm font-semibold text-white">Overall Progress</p>
                <span className="text-xs text-gray-500">{data.stats.completed}/{data.stats.total} tasks</span>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Completed</span>
                  <span className="text-xs font-semibold text-emerald-400">{pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
              {[
                { label: "Done",        value: data.stats.completed,  barClass: "bg-emerald-500" },
                { label: "In Progress", value: data.stats.inProgress, barClass: "bg-indigo-500"  },
                { label: "Overdue",     value: data.stats.overdue,    barClass: "bg-red-500"     },
              ].map(({ label, value, barClass }) => (
                <div key={label} className="mb-3 last:mb-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-500">{label}</span>
                    <span className="text-xs text-gray-400">{value}</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${barClass}`}
                      style={{ width: data.stats.total > 0 ? `${Math.round((value / data.stats.total) * 100)}%` : "0%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-white/5 border border-white/10 p-6">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm font-semibold text-white">Tasks</p>
              <span className="text-xs text-gray-600">{data.stats.total} total</span>
            </div>
            {data.tasks.length === 0 ? (
              <p className="text-sm text-gray-600 py-4 text-center">No tasks in this project yet.</p>
            ) : (
              data.tasks.map(({ title, status }, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between py-3 ${
                    i < data.tasks.length - 1 ? "border-b border-white/5" : ""
                  }`}
                >
                  <span className="text-sm text-gray-300">{title}</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusConfig[status]?.className ?? statusConfig.TODO.className}`}>
                    {statusConfig[status]?.label ?? status}
                  </span>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {!loading && !error && projects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-white font-semibold mb-1">No projects yet</p>
          <p className="text-gray-500 text-sm mb-6">
            Create a project first to see its analytics here.
          </p>
          <button
            onClick={() => navigate("/projects")}
            className="rounded-lg bg-indigo-500/20 border border-indigo-500/30 px-4 py-2 text-sm font-medium text-indigo-300 hover:bg-indigo-500/30 transition-colors"
          >
            Go to Projects
          </button>
        </div>
      )}
    </div>
  );
}