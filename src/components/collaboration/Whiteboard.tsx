"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { Users, Save, Loader } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import type { AppState } from "@excalidraw/excalidraw/types/types";

// Dynamic import — Excalidraw is client-only
const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
  { ssr: false, loading: () => (
    <div className="flex-1 flex items-center justify-center bg-obsidian-950">
      <Loader size={20} className="animate-spin text-indigo-400" />
    </div>
  )}
);

type CursorData = {
  user_id: string;
  email: string;
  color: string;
  x: number;
  y: number;
};

const COLORS = ["#4F46E5","#059669","#D97706","#DB2777","#0EA5E9","#7C3AED","#EA580C","#16A34A"];

function getColor(userId: string) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

interface WhiteboardProps {
  boardId: string;
  workspaceId: string;
  user: User;
}

export function Whiteboard({ boardId, workspaceId, user }: WhiteboardProps) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [cursors, setCursors] = useState<CursorData[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const channelRef = useRef<any>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const supabase = createClient();
  const userColor = getColor(user.id);

  // Load initial board state
  useEffect(() => {
    async function loadBoard() {
      const { data } = await supabase
        .from("whiteboards")
        .select("elements, app_state")
        .eq("id", boardId)
        .single();

      if (data && excalidrawAPI) {
        excalidrawAPI.updateScene({
          elements: data.elements || [],
          appState: data.app_state || {},
        });
      }
    }
    if (excalidrawAPI) loadBoard();
  }, [excalidrawAPI, boardId]);

  // Set up realtime channel for cursors + board sync
  useEffect(() => {
    const channel = supabase.channel(`board:${boardId}`, {
      config: { presence: { key: user.id } },
    });

    channelRef.current = channel;

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<{ email: string; color: string }>();
        setOnlineCount(Object.keys(state).length);
      })
      // Listen for cursor broadcasts from other users
      .on("broadcast", { event: "cursor" }, ({ payload }: { payload: CursorData }) => {
        if (payload.user_id === user.id) return;
        setCursors((prev) => {
          const existing = prev.filter(c => c.user_id !== payload.user_id);
          return [...existing, payload];
        });
        // Remove cursor after 3s inactivity
        setTimeout(() => {
          setCursors(prev => prev.filter(c => c.user_id !== payload.user_id));
        }, 3000);
      })
      // Listen for board element updates from other users
      .on("broadcast", { event: "elements" }, ({ payload }: { payload: { elements: ExcalidrawElement[] } }) => {
        if (excalidrawAPI) {
          excalidrawAPI.updateScene({ elements: payload.elements });
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: user.id,
            email: user.email,
            color: userColor,
          });
        }
      });

    return () => { channel.unsubscribe(); };
  }, [boardId, user.id, excalidrawAPI]);

  // Broadcast cursor position
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!channelRef.current) return;
    channelRef.current.send({
      type: "broadcast",
      event: "cursor",
      payload: {
        user_id: user.id,
        email: user.email || "",
        color: userColor,
        x: e.clientX,
        y: e.clientY,
      },
    });
  }, [user.id, userColor]);

  // Auto-save and broadcast elements on change
  const handleChange = useCallback((elements: readonly ExcalidrawElement[], state: AppState) => {
    // Broadcast to other users immediately
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "elements",
        payload: { elements },
      });
    }

    // Debounced save to DB
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      setSaving(true);
      await supabase
        .from("whiteboards")
        .update({ elements, app_state: state, updated_at: new Date().toISOString() })
        .eq("id", boardId);
      setSaving(false);
      setLastSaved(new Date());
    }, 1500);
  }, [boardId]);

  return (
    <div className="flex flex-col h-full relative" onMouseMove={handleMouseMove}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-obsidian-900/80 border-b border-obsidian-800 backdrop-blur-sm z-10">
        <h2 className="text-sm font-medium text-obsidian-100">Whiteboard</h2>
        <div className="flex items-center gap-3">
          {saving ? (
            <span className="text-xs text-obsidian-500 flex items-center gap-1">
              <Loader size={11} className="animate-spin" /> Saving...
            </span>
          ) : lastSaved ? (
            <span className="text-xs text-obsidian-600">
              Saved {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          ) : null}
          <div className="flex items-center gap-1.5 text-xs text-obsidian-400">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <Users size={12} />
            {onlineCount} online
          </div>
        </div>
      </div>

      {/* Excalidraw canvas */}
      <div className="flex-1 relative">
        <Excalidraw
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          onChange={handleChange}
          theme="dark"
          UIOptions={{
            canvasActions: {
              export: { saveFileToDisk: true },
              loadScene: true,
            },
          }}
        />

        {/* Live cursors overlay */}
        {cursors.map((cursor) => (
          <div
            key={cursor.user_id}
            className="fixed pointer-events-none z-50 transition-all duration-75"
            style={{ left: cursor.x, top: cursor.y }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M0 0L10 14L5 9L14 5L0 0Z" fill={cursor.color} />
            </svg>
            <div
              className="mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium text-white whitespace-nowrap"
              style={{ background: cursor.color }}
            >
              {cursor.email?.split("@")[0]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
