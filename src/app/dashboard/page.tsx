"use client";
import { useState } from "react";
import { FolderOpen, CheckSquare, Clock, Plus, X } from "lucide-react";
import Link from "next/link";

type Project = {
  id: string; name: string; description: string;
  status: "active" | "paused" | "archived"; color: string;
};

type Task = {
  id: string; title: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "todo" | "in_progress" | "done";
  projectId: string;
};

const COLORS = ["#4F46E5","#059669","#D97706","#DB2777","#0EA5E9","#7C3AED"];

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: "", description: "", color: COLORS[0] });
  const [taskForm, setTaskForm] = useState({ title: "", priority: "medium" as Task["priority"], projectId: "" });

  function addProject() {
    if (!projectForm.name.trim()) return;
    setProjects([{ id: crypto.randomUUID(), ...projectForm, status: "active" }, ...projects]);
    setProjectForm({ name: "", description: "", color: COLORS[0] });
    setShowProjectModal(false);
  }

  function addTask() {
    if (!taskForm.title.trim()) return;
    setTasks([{ id: crypto.randomUUID(), ...taskForm, status: "todo" }, ...tasks]);
    setTaskForm({ title: "", priority: "medium", projectId: "" });
    setShowTaskModal(false);
  }

  function updateTaskStatus(id: string, status: Task["status"]) {
    setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
  }

  function updateProjectStatus(id: string, status: Project["status"]) {
    setProjects(projects.map(p => p.id === id ? { ...p, status } : p));
  }

  function deleteTask(id: string) { setTasks(tasks.filter(t => t.id !== id)); }
  function deleteProject(id: string) {
    setProjects(projects.filter(p => p.id !== id));
    setTasks(tasks.filter(t => t.projectId !== id));
  }

  const priorityColors: Record<string, string> = {
    urgent: "bg-red-500/20 text-red-400", high: "bg-amber-500/20 text-amber-400",
    medium: "bg-indigo-500/20 text-indigo-400", low: "bg-obsidian-700 text-obsidian-400",
  };

  const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-obsidian-900 border border-obsidian-700 rounded-t-3xl sm:rounded-2xl p-6 w-full sm:max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-medium text-obsidian-50">{title}</h2>
          <button onClick={onClose} className="text-obsidian-500 hover:text-obsidian-200 p-1"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-medium text-obsidian-50 tracking-tight">Overview</h1>
          <p className="text-xs md:text-sm text-obsidian-500 mt-0.5">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowTaskModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-obsidian-800 hover:bg-obsidian-700 text-obsidian-100 border border-obsidian-700 font-medium transition-colors">
            <Plus size={13} /><span className="hidden sm:inline">New</span> Task
          </button>
          <button onClick={() => setShowProjectModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors">
            <Plus size={13} /><span className="hidden sm:inline">New</span> Project
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 md:gap-3 mb-6">
        {[
          { label: "Projects", value: projects.filter(p => p.status === "active").length, icon: FolderOpen, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
          { label: "Open tasks", value: tasks.filter(t => t.status !== "done").length, icon: CheckSquare, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
          { label: "In progress", value: tasks.filter(t => t.status === "in_progress").length, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-obsidian-900/60 border border-obsidian-800 p-3 md:p-4">
            <div className={`w-7 h-7 md:w-8 md:h-8 rounded-xl border flex items-center justify-center mb-2 md:mb-3 ${s.bg}`}>
              <s.icon size={13} className={s.color} />
            </div>
            <p className="text-xl md:text-2xl font-medium text-obsidian-50 tracking-tight">{s.value}</p>
            <p className="text-[10px] md:text-xs text-obsidian-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Tasks */}
        <div className="md:col-span-3 rounded-2xl bg-obsidian-900/60 border border-obsidian-800 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-obsidian-800">
            <h2 className="text-sm font-medium text-obsidian-100">Tasks ({tasks.filter(t => t.status !== "done").length})</h2>
            <button onClick={() => setShowTaskModal(true)} className="text-xs text-indigo-400 hover:text-indigo-300">+ Add</button>
          </div>
          {tasks.length > 0 ? (
            <div className="divide-y divide-obsidian-800/60 max-h-72 overflow-y-auto">
              {tasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 px-4 py-3 hover:bg-obsidian-800/30 transition-colors group">
                  <button
                    onClick={() => updateTaskStatus(task.id, task.status === "done" ? "todo" : task.status === "todo" ? "in_progress" : "done")}
                    className={`w-3.5 h-3.5 rounded-full border shrink-0 transition-colors ${task.status === "done" ? "bg-emerald-500 border-emerald-400" : task.status === "in_progress" ? "bg-blue-500 border-blue-400" : "border-obsidian-600 hover:border-indigo-400"}`}
                  />
                  <p className={`text-sm flex-1 truncate ${task.status === "done" ? "text-obsidian-500 line-through" : "text-obsidian-200"}`}>
                    {task.title}
                  </p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </span>
                  <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-obsidian-600 hover:text-red-400 transition-all">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-10 text-center">
              <CheckSquare size={22} className="text-obsidian-700 mx-auto mb-2" />
              <p className="text-sm text-obsidian-500">No tasks yet</p>
              <button onClick={() => setShowTaskModal(true)} className="text-xs text-indigo-400 mt-1.5 inline-block">+ Create task</button>
            </div>
          )}
        </div>

        {/* Projects */}
        <div className="md:col-span-2 rounded-2xl bg-obsidian-900/60 border border-obsidian-800 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-obsidian-800">
            <h2 className="text-sm font-medium text-obsidian-100">Projects ({projects.length})</h2>
            <button onClick={() => setShowProjectModal(true)} className="text-xs text-indigo-400 hover:text-indigo-300">+ Add</button>
          </div>
          {projects.length > 0 ? (
            <div className="divide-y divide-obsidian-800/60 max-h-72 overflow-y-auto">
              {projects.map(p => (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-obsidian-800/30 transition-colors group">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
                  <p className="text-sm text-obsidian-200 flex-1 truncate">{p.name}</p>
                  <select value={p.status} onChange={e => updateProjectStatus(p.id, e.target.value as Project["status"])}
                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium border-0 cursor-pointer bg-transparent ${p.status === "active" ? "text-emerald-400" : p.status === "paused" ? "text-amber-400" : "text-obsidian-500"}`}>
                    <option value="active">active</option>
                    <option value="paused">paused</option>
                    <option value="archived">archived</option>
                  </select>
                  <button onClick={() => deleteProject(p.id)} className="opacity-0 group-hover:opacity-100 text-obsidian-600 hover:text-red-400 transition-all">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-10 text-center">
              <FolderOpen size={22} className="text-obsidian-700 mx-auto mb-2" />
              <p className="text-sm text-obsidian-500">No projects yet</p>
              <button onClick={() => setShowProjectModal(true)} className="text-xs text-indigo-400 mt-1.5 inline-block">+ Create project</button>
            </div>
          )}
        </div>
      </div>

      {/* Whiteboard CTA */}
      <div className="mt-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 p-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-obsidian-100">Collaborative whiteboard</p>
          <p className="text-xs text-obsidian-500 mt-0.5">Draw, plan, and collaborate in real time with your team.</p>
        </div>
        <Link href="/dashboard/whiteboard"
          className="shrink-0 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors">
          Open →
        </Link>
      </div>

      {/* Project Modal */}
      {showProjectModal && (
        <Modal title="New project" onClose={() => setShowProjectModal(false)}>
          <div className="flex flex-col gap-4">
            <input autoFocus value={projectForm.name} onChange={e => setProjectForm({ ...projectForm, name: e.target.value })}
              onKeyDown={e => e.key === "Enter" && addProject()} placeholder="Project name *"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-obsidian-950 border border-obsidian-700 text-obsidian-50 placeholder:text-obsidian-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
            <textarea value={projectForm.description} onChange={e => setProjectForm({ ...projectForm, description: e.target.value })}
              placeholder="Description (optional)" rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-obsidian-950 border border-obsidian-700 text-obsidian-50 placeholder:text-obsidian-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none" />
            <div>
              <p className="text-xs text-obsidian-400 mb-2">Color</p>
              <div className="flex gap-2.5">
                {COLORS.map(c => (
                  <button key={c} onClick={() => setProjectForm({ ...projectForm, color: c })}
                    className={`w-8 h-8 rounded-xl transition-all ${projectForm.color === c ? "ring-2 ring-white ring-offset-2 ring-offset-obsidian-900 scale-110" : ""}`}
                    style={{ background: c }} />
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowProjectModal(false)} className="flex-1 py-2.5 rounded-xl text-sm text-obsidian-400 bg-obsidian-800 hover:bg-obsidian-700 transition-colors">Cancel</button>
              <button onClick={addProject} className="flex-1 py-2.5 rounded-xl text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors font-medium">Create</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <Modal title="New task" onClose={() => setShowTaskModal(false)}>
          <div className="flex flex-col gap-4">
            <input autoFocus value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
              onKeyDown={e => e.key === "Enter" && addTask()} placeholder="Task title *"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-obsidian-950 border border-obsidian-700 text-obsidian-50 placeholder:text-obsidian-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
            <div>
              <p className="text-xs text-obsidian-400 mb-2">Priority</p>
              <div className="grid grid-cols-4 gap-2">
                {(["low", "medium", "high", "urgent"] as const).map(p => (
                  <button key={p} onClick={() => setTaskForm({ ...taskForm, priority: p })}
                    className={`py-2 rounded-xl text-xs font-medium capitalize transition-all ${
                      taskForm.priority === p
                        ? p === "urgent" ? "bg-red-500/30 text-red-300 ring-1 ring-red-400"
                          : p === "high" ? "bg-amber-500/30 text-amber-300 ring-1 ring-amber-400"
                          : p === "medium" ? "bg-indigo-500/30 text-indigo-300 ring-1 ring-indigo-400"
                          : "bg-obsidian-600 text-obsidian-300 ring-1 ring-obsidian-500"
                        : "bg-obsidian-800 text-obsidian-500 hover:bg-obsidian-700"
                    }`}>{p}</button>
                ))}
              </div>
            </div>
            {projects.length > 0 && (
              <select value={taskForm.projectId} onChange={e => setTaskForm({ ...taskForm, projectId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-obsidian-950 border border-obsidian-700 text-obsidian-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                <option value="">No project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            )}
            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowTaskModal(false)} className="flex-1 py-2.5 rounded-xl text-sm text-obsidian-400 bg-obsidian-800 hover:bg-obsidian-700 transition-colors">Cancel</button>
              <button onClick={addTask} className="flex-1 py-2.5 rounded-xl text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors font-medium">Create</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
