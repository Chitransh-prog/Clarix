"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

type OnlineUser = {
  user_id: string;
  email: string;
};

const COLORS = ["#4F46E5","#059669","#D97706","#DB2777","#0EA5E9","#7C3AED"];

function getColor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}

export function OnlineUsers({ workspaceId, user }: { workspaceId: string; user: User }) {
  const [users, setUsers] = useState<OnlineUser[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase.channel(`presence:${workspaceId}`, {
      config: { presence: { key: user.id } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<{ email: string }>();
        const list = Object.entries(state).map(([id, p]) => ({
          user_id: id,
          email: p[0]?.email || "?",
        }));
        setUsers(list);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ user_id: user.id, email: user.email });
        }
      });

    return () => { channel.unsubscribe(); };
  }, [workspaceId, user.id]);

  if (users.length === 0) return null;

  return (
    <div className="px-3 py-2">
      <p className="text-[10px] text-obsidian-600 uppercase tracking-widest mb-2 px-2">Online now</p>
      <div className="flex flex-col gap-1">
        {users.map((u) => (
          <div key={u.user_id} className="flex items-center gap-2 px-2 py-1 rounded-lg">
            <div className="relative">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                style={{ background: getColor(u.user_id) }}
              >
                {u.email.slice(0, 2).toUpperCase()}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-obsidian-900" />
            </div>
            <span className="text-xs text-obsidian-400 truncate">
              {u.user_id === user.id ? "You" : u.email.split("@")[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
