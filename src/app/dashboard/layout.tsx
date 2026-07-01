import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { MobileNav } from "@/components/layout/MobileNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="flex h-dvh bg-obsidian-950 overflow-hidden">
      {/* Sidebar — desktop only */}
      <div className="hidden md:flex">
        <DashboardSidebar user={user} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <MobileNav user={user} />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileBottomNav />
    </div>
  );
}

function MobileBottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-obsidian-900/95 backdrop-blur-xl border-t border-obsidian-800 z-40">
      <div className="flex items-center justify-around px-2 py-2 safe-bottom">
        <BottomNavItem href="/dashboard" icon="grid" label="Overview" />
        <BottomNavItem href="/dashboard/projects" icon="folder" label="Projects" />
        <BottomNavItem href="/dashboard/tasks" icon="check" label="Tasks" />
        <BottomNavItem href="/dashboard/whiteboard" icon="pen" label="Board" />
        <BottomNavItem href="/dashboard/settings" icon="settings" label="Settings" />
      </div>
    </nav>
  );
}

function BottomNavItem({ href, icon, label }: { href: string; icon: string; label: string }) {
  const icons: Record<string, string> = {
    grid: "M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z",
    folder: "M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z",
    check: "M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11",
    pen: "M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z",
    settings: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
  };

  return (
    <a href={href} className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-obsidian-500 hover:text-indigo-400 transition-colors min-w-[48px]">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d={icons[icon]} />
      </svg>
      <span className="text-[9px] font-medium">{label}</span>
    </a>
  );
}
