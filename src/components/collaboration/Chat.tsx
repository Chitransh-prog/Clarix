"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Send, X, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";

type Message = {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  user_email?: string;
};

type OnlineUser = {
  user_id: string;
  email: string;
  color: string;
  cursor?: { x: number; y: number };
};

const COLORS = [
  "#4F46E5", "#059669", "#D97706", "#DB2777",
  "#0EA5E9", "#7C3AED", "#EA580C", "#16A34A"
];

function getColor(userId: string) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(email: string) {
  return email.slice(0, 2).toUpperCase();
}

interface ChatProps {
  workspaceId: string;
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export function Chat({ workspaceId, user, isOpen, onClose }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    // Fetch existing messages
    async function fetchMessages() {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: true })
        .limit(100);
      if (data) setMessages(data);
      setLoading(false);
      setTimeout(scrollToBottom, 100);
    }
    fetchMessages();

    // Set up realtime channel
    const channel = supabase.channel(`workspace:${workspaceId}`, {
      config: { presence: { key: user.id } },
    });

    channelRef.current = channel;

    // Presence — who is online
    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<{ email: string }>();
        const users: OnlineUser[] = Object.entries(state).map(([userId, presences]) => ({
          user_id: userId,
          email: presences[0]?.email || "Unknown",
          color: getColor(userId),
        }));
        setOnlineUsers(users);
      })
      // New messages via realtime
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `workspace_id=eq.${workspaceId}` },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.find(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          setTimeout(scrollToBottom, 50);
        }
      )
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ user_id: user.id, email: user.email });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [isOpen, workspaceId]);

  async function sendMessage() {
    const content = input.trim();
    if (!content) return;
    setInput("");

    await supabase.from("messages").insert({
      workspace_id: workspaceId,
      user_id: user.id,
      content,
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 h-[480px] bg-obsidian-900 border border-obsidian-700 rounded-2xl shadow-2xl flex flex-col z-40 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-obsidian-800 bg-obsidian-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <MessageSquare size={15} className="text-indigo-400" />
          <span className="text-sm font-medium text-obsidian-100">Team chat</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Online users */}
          <div className="flex -space-x-1.5">
            {onlineUsers.slice(0, 4).map((u) => (
              <div
                key={u.user_id}
                title={u.email}
                className="w-5 h-5 rounded-full border border-obsidian-900 flex items-center justify-center text-[8px] font-bold text-white"
                style={{ background: u.color }}
              >
                {getInitials(u.email)}
              </div>
            ))}
          </div>
          {onlineUsers.length > 0 && (
            <span className="text-[10px] text-obsidian-500">{onlineUsers.length} online</span>
          )}
          <button onClick={onClose} className="text-obsidian-500 hover:text-obsidian-200 ml-1">
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
            <MessageSquare size={24} className="text-obsidian-700" />
            <p className="text-sm text-obsidian-500">No messages yet</p>
            <p className="text-xs text-obsidian-600">Say hello to your team!</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isOwn = msg.user_id === user.id;
            const prevMsg = messages[i - 1];
            const showAvatar = !prevMsg || prevMsg.user_id !== msg.user_id;
            const color = getColor(msg.user_id);

            return (
              <div key={msg.id} className={cn("flex gap-2", isOwn && "flex-row-reverse")}>
                {showAvatar ? (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 mt-0.5"
                    style={{ background: color }}
                  >
                    {getInitials(msg.user_email || msg.user_id)}
                  </div>
                ) : (
                  <div className="w-6 shrink-0" />
                )}
                <div className={cn("flex flex-col gap-0.5 max-w-[70%]", isOwn && "items-end")}>
                  <div
                    className={cn(
                      "px-3 py-2 rounded-2xl text-sm leading-relaxed",
                      isOwn
                        ? "bg-indigo-600 text-white rounded-tr-sm"
                        : "bg-obsidian-800 text-obsidian-100 rounded-tl-sm"
                    )}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[9px] text-obsidian-600 px-1">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-obsidian-800">
        <div className="flex items-end gap-2 bg-obsidian-800/60 border border-obsidian-700 rounded-xl px-3 py-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message your team... (Enter to send)"
            rows={1}
            className="flex-1 bg-transparent text-sm text-obsidian-100 placeholder:text-obsidian-600 resize-none focus:outline-none max-h-24"
            style={{ lineHeight: "1.4" }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="p-1 rounded-lg text-indigo-400 hover:text-indigo-300 disabled:text-obsidian-600 transition-colors shrink-0"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
