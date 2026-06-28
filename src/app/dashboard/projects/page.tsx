import { FolderOpen } from "lucide-react";
export const metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-medium text-obsidian-50 tracking-tight mb-8">Projects</h1>
      <div className="rounded-2xl bg-obsidian-900/40 border border-obsidian-800 border-dashed p-16 text-center">
        <FolderOpen size={32} className="text-obsidian-700 mx-auto mb-4" />
        <p className="text-sm text-obsidian-500">No projects yet</p>
      </div>
    </div>
  );
}
