"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { Users, Loader } from "lucide-react";
import type { User } from "@supabase/supabase-js";

const Excalidraw = dynamic(
  async () => {
    const mod = await import("@excalidraw/excalidraw");
    return mod.Excalidraw;
  },
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-1 items-center justify-center bg-[#13111a]">
        <div className="flex flex-col items-center gap-3">
          <Loader size={20} className="animate-spin text-indigo-400" />
          <p className="text-sm text-obsidian-400">Loading whiteboard...</p>
        </div>
      </div>
    ),
  }
);

const COLORS = [
  "#4F46E5",
  "#059669",
  "#D97706",
  "#DB2777",
  "#0EA5E9",
  "#7C3AED",
];

function getColor(userId: string) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

interface WhiteboardProps {
  boardId: string;
  workspaceId: string;
  user: User;
}

export function Whiteboard({ boardId, workspaceId, user }: WhiteboardProps) {
  const supabase = createClient();

  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [onlineCount, setOnlineCount] = useState(1);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [cursors, setCursors] = useState<any[]>([]);

  const channelRef = useRef<any>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const userColor = getColor(user.id);

  /* ---------------------- LOAD BOARD ---------------------- */

  useEffect(() => {
    if (!excalidrawAPI) return;

    const loadBoard = async () => {
      const { data, error } = await supabase
        .from("whiteboards")
        .select("elements, app_state")
        .eq("id", boardId)
        .single();

      if (error) {
        console.error("Load board error:", error);
        return;
      }

      if (!data) return;

      excalidrawAPI.updateScene({
        elements: Array.isArray(data.elements) ? data.elements : [],
        appState: {
          ...(data.app_state && typeof data.app_state === "object"
            ? data.app_state
            : {}),
          // Excalidraw expects collaborators to be a Map.
          // JSON (Supabase) converts Map → plain object, causing
          // "collaborators.forEach is not a function" crash.
          collaborators: new Map(),
        },
      });
    };

    loadBoard();
  }, [boardId, excalidrawAPI, supabase]);

  /* ---------------------- REALTIME ---------------------- */

  useEffect(() => {
    const channel = supabase.channel(`board:${boardId}`, {
      config: {
        presence: { key: user.id },
      },
    });

    channelRef.current = channel;

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setOnlineCount(Object.keys(state).length);
      })
      .on("broadcast", { event: "cursor" }, ({ payload }: any) => {
        if (payload.user_id === user.id) return;

        setCursors((prev) => {
          const filtered = prev.filter((c) => c.user_id !== payload.user_id);
          return [...filtered, payload];
        });

        setTimeout(() => {
          setCursors((prev) =>
            prev.filter((c) => c.user_id !== payload.user_id)
          );
        }, 3000);
      })
      .on("broadcast", { event: "elements" }, ({ payload }: any) => {
        if (!excalidrawAPI) return;

        if (Array.isArray(payload.elements)) {
          excalidrawAPI.updateScene({
            elements: payload.elements,
            // Always inject a Map so Excalidraw doesn't crash on
            // collaborators.forEach() from a broadcast payload.
            appState: { collaborators: new Map() },
          });
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [boardId, excalidrawAPI, supabase, user.id, user.email, userColor]);

  /* ---------------------- CURSOR ---------------------- */

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      channelRef.current?.send({
        type: "broadcast",
        event: "cursor",
        payload: {
          user_id: user.id,
          email: user.email,
          color: userColor,
          x: e.clientX,
          y: e.clientY,
        },
      });
    },
    [user.id, user.email, userColor]
  );

  /* ---------------------- SAVE ---------------------- */

  const handleChange = useCallback(
    (elements: any[], appState: any) => {
      channelRef.current?.send({
        type: "broadcast",
        event: "elements",
        payload: { elements },
      });

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        setSaving(true);

        // Strip collaborators (Map is not JSON-serializable)
        // before saving to Supabase.
        const { collaborators, ...serializableAppState } = appState;

        const { error } = await supabase
          .from("whiteboards")
          .update({
            elements,
            app_state: serializableAppState,
            updated_at: new Date().toISOString(),
          })
          .eq("id", boardId);

        if (error) {
          console.error("Whiteboard save failed:", error);
        }

        setSaving(false);
        setLastSaved(new Date());
      }, 1500);
    },
    [boardId, supabase]
  );

  return (
    // h-full fills WhiteboardClient's flex-1 div.
    // flex flex-col so the header is fixed height and canvas takes the rest.
    <div
      className="relative flex h-full flex-col overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-obsidian-800 bg-obsidian-900/80 px-4 py-2">
        <h2 className="text-sm font-medium text-obsidian-100">Whiteboard</h2>

        <div className="flex items-center gap-4">
          {saving ? (
            <span className="flex items-center gap-1 text-xs text-obsidian-500">
              <Loader size={11} className="animate-spin" />
              Saving...
            </span>
          ) : lastSaved ? (
            <span className="text-xs text-obsidian-500">
              Saved{" "}
              {lastSaved.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          ) : (
            <span className="text-xs text-obsidian-500">Ready</span>
          )}

          <div className="flex items-center gap-2 text-xs text-obsidian-400">
            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <Users size={13} />
            {onlineCount}
          </div>
        </div>
      </div>

      {/* Canvas — min-h-0 lets it shrink inside the flex column so
          Excalidraw gets an actual measured height to fill. */}
      <div className="relative min-h-0 flex-1">
        <Excalidraw
          theme="dark"
          excalidrawAPI={setExcalidrawAPI}
          onChange={handleChange}
          style={{ height: "100%", width: "100%" }}
        />

        {cursors.map((cursor) => (
          <div
            key={cursor.user_id}
            className="pointer-events-none fixed z-50"
            style={{ left: cursor.x, top: cursor.y }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14">
              <path
                d="M0 0L9 12L4.5 8L12 4.5L0 0Z"
                fill={cursor.color}
              />
            </svg>

            <div
              className="mt-1 rounded px-2 py-1 text-[9px] text-white"
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