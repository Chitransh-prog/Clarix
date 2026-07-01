"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  LayoutDashboard, FolderOpen, CheckSquare,
  BarChart3, Settings, LogOut, Plus,
  PenTool, MessageSquare,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/dashboard/projects", icon: FolderOpen },
  { label: "Whiteboard", href: "/dashboard/whiteboard", icon: PenTool },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
];

export function DashboardSidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out.");
    router.push("/");
    router.refresh();
  }

  const initials = (user.email || "U").slice(0, 2).toUpperCase();

  return (
    <aside className="w-60 shrink-0 h-full bg-obsidian-900/60 border-r border-obsidian-800/60 flex flex-col">
      <div className="p-4 border-b border-obsidian-800/60"><Logo size="sm" /></div>

      <nav className="flex-1 p-3 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all",
                active
                  ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20"
                  : "text-obsidian-400 hover:text-obsidian-100 hover:bg-obsidian-800/60"
              )}
            >
              <item.icon size={15} />
              {item.label}
              {item.label === "Whiteboard" && (
                <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-600/20 text-indigo-400 font-medium">
                  LIVE
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-obsidian-800/60 flex flex-col gap-1">
        <Link href="/dashboard/settings"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-obsidian-400 hover:text-obsidian-100 hover:bg-obsidian-800/60 transition-all">
          <Settings size={15} />Settings
        </Link>
        <button onClick={signOut}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-obsidian-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut size={15} />Sign out
        </button>
        <div className="mt-2 p-2.5 rounded-xl bg-obsidian-800/60 border border-obsidian-700/60 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-medium text-indigo-400">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-obsidian-100 truncate">{user.email}</p>
            <p className="text-[10px] text-obsidian-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              Online
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
