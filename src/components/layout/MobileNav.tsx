"use client";
import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Menu, X, LogOut, Settings } from "lucide-react";
import type { User } from "@supabase/supabase-js";

function getInitials(email: string) {
  return email.slice(0, 2).toUpperCase();
}

export function MobileNav({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out.");
    router.push("/");
    router.refresh();
  }

  return (
    <>
      {/* Mobile top bar */}
      <header className="md:hidden flex items-center justify-between px-4 h-14 bg-obsidian-900/80 backdrop-blur-xl border-b border-obsidian-800 shrink-0 z-30">
        <Logo size="sm" />
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <span className="text-[10px] font-medium text-indigo-400">{getInitials(user.email || "U")}</span>
          </div>
          <button onClick={() => setOpen(!open)} className="text-obsidian-400 hover:text-obsidian-100 p-1">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile dropdown menu */}
      {open && (
        <div className="md:hidden absolute top-14 inset-x-0 bg-obsidian-900/98 backdrop-blur-xl border-b border-obsidian-800 z-50 flex flex-col gap-1 p-3">
          <p className="text-[10px] text-obsidian-600 uppercase tracking-widest px-3 py-1">
            {user.email}
          </p>
          <Link href="/dashboard/settings" onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-obsidian-300 hover:text-white hover:bg-obsidian-800 transition-colors">
            <Settings size={15} /> Settings
          </Link>
          <button onClick={signOut}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-obsidian-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut size={15} /> Sign out
          </button>
        </div>
      )}
    </>
  );
}
