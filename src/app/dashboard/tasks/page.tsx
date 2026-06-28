import { CheckSquare } from "lucide-react";
export const metadata = { title: "Tasks" };

export default function TasksPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-medium text-obsidian-50 tracking-tight mb-8">Tasks</h1>
      <div className="rounded-2xl bg-obsidian-900/40 border border-obsidian-800 border-dashed p-16 text-center">
        <CheckSquare size={32} className="text-obsidian-700 mx-auto mb-4" />
        <p className="text-sm text-obsidian-500">No tasks yet</p>
      </div>
    </div>
  );
}
