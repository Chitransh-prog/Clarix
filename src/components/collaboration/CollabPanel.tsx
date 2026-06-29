"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  X, Plus, Send, Users, Hash, UserPlus,
  Copy, Check, ChevronRight, Loader,
  Building2, MessageSquare, Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

type Tab = "chat" | "members" | "groups" | "workspace";

type Message = {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  group_id: string | null;
};

type Group = {
  id: string;
  name: string;
  description: string | null;
};

type Member = {
  user_id: string;
  role: string;
  email?: string;
};

type OnlineUser = {
  user_id: string;
  email: string;
  color: string;
};

const COLORS = ["#4F46E5","#059669","#D97706","#DB2777","#0EA5E9","#7C3AED","#EA580C","#16A34A"];

function getColor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}

function getInitials(email: string) {
  return email.slice(0, 2).toUpperCase();
}

function Avatar({ email, userId, size = "sm" }: { email: string; userId: string; size?: "sm" | "md" }) {
  const color = getColor(userId);
  const s = size === "sm" ? "w-6 h-6 text-[9px]" : "w-8 h-8 text-xs";
  return (
    <div className={cn("rounded-full flex items-center justify-center font-bold text-white shrink-0", s)}
      style={{ background: color }}>
      {getInitials(email)}
    </div>
  );
}

interface CollabPanelProps {
  workspaceId: string;
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export function CollabPanel({ workspaceId, user, isOpen, onClose }: CollabPanelProps) {
  const [tab, setTab] = useState<Tab>("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);

  // Forms
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [inviteCopied, setInviteCopied] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);

  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [groupLoading, setGroupLoading] = useState(false);

  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [showNewWorkspace, setShowNewWorkspace] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);
  const supabase = createClient();

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Fetch everything on open
  useEffect(() => {
    if (!isOpen || !workspaceId) return;
    fetchAll();
    setupRealtime();
    return () => { channelRef.current?.unsubscribe(); };
  }, [isOpen, workspaceId, activeGroup?.id]);

  async function fetchAll() {
    setLoading(true);
    await Promise.all([fetchMessages(), fetchGroups(), fetchMembers()]);
    setLoading(false);
    setTimeout(scrollToBottom, 100);
  }

  async function fetchMessages() {
    const query = supabase
      .from("messages")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: true })
      .limit(80);

    if (activeGroup) {
      query.eq("group_id", activeGroup.id);
    } else {
      query.is("group_id", null);
    }

    const { data } = await query;
    if (data) setMessages(data);
  }

  async function fetchGroups() {
    const { data } = await supabase
      .from("groups")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: true });
    if (data) setGroups(data);
  }

  async function fetchMembers() {
    const { data } = await supabase
      .from("workspace_members")
      .select("user_id, role")
      .eq("workspace_id", workspaceId);

    if (data) {
      // Fetch emails from profiles
      const ids = data.map(m => m.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", ids);

      const withEmails = data.map(m => ({
        ...m,
        email: profiles?.find(p => p.id === m.user_id)?.email || m.user_id.slice(0, 8),
      }));
      setMembers(withEmails);
    }
  }

  function setupRealtime() {
    channelRef.current?.unsubscribe();

    const channel = supabase.channel(`collab:${workspaceId}`, {
      config: { presence: { key: user.id } },
    });
    channelRef.current = channel;

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<{ email: string; color: string }>();
        const online: OnlineUser[] = Object.entries(state).map(([uid, p]) => ({
          user_id: uid,
          email: p[0]?.email || "?",
          color: getColor(uid),
        }));
        setOnlineUsers(online);
      })
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `workspace_id=eq.${workspaceId}`,
      }, (payload: any) => {
        const msg = payload.new as Message;
        const isForCurrentView = activeGroup
          ? msg.group_id === activeGroup.id
          : msg.group_id === null;
        if (isForCurrentView) {
          setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg]);
          setTimeout(scrollToBottom, 50);
        }
      })
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "groups",
        filter: `workspace_id=eq.${workspaceId}`,
      }, (payload: any) => {
        setGroups(prev => [...prev, payload.new as Group]);
      })
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "workspace_members",
        filter: `workspace_id=eq.${workspaceId}`,
      }, () => {
        fetchMembers();
      })
      .subscribe(async (status: string) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ user_id: user.id, email: user.email, color: getColor(user.id) });
        }
      });
  }

  async function sendMessage() {
    const content = input.trim();
    if (!content) return;
    setInput("");
    await supabase.from("messages").insert({
      workspace_id: workspaceId,
      user_id: user.id,
      content,
      group_id: activeGroup?.id || null,
    });
  }

  async function createInvite() {
    if (!inviteEmail.trim()) return;
    setInviteLoading(true);
    try {
      // Create invite record
      const { data: invite, error } = await supabase
        .from("workspace_invites")
        .insert({
          workspace_id: workspaceId,
          invited_by: user.id,
          email: inviteEmail,
        })
        .select("token")
        .single();

      if (error) throw error;

      const link = `${window.location.origin}/invite?token=${invite.token}`;
      setInviteLink(link);
      toast.success(`Invite created for ${inviteEmail}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to create invite");
    } finally {
      setInviteLoading(false);
    }
  }

  async function copyInviteLink() {
    await navigator.clipboard.writeText(inviteLink);
    setInviteCopied(true);
    toast.success("Invite link copied!");
    setTimeout(() => setInviteCopied(false), 2000);
  }

  async function createGroup() {
    if (!newGroupName.trim()) return;
    setGroupLoading(true);
    const { error } = await supabase.from("groups").insert({
      workspace_id: workspaceId,
      name: newGroupName.trim(),
      description: newGroupDesc.trim() || null,
      created_by: user.id,
    });
    if (error) { toast.error("Failed to create group"); }
    else { toast.success(`#${newGroupName} created!`); setNewGroupName(""); setNewGroupDesc(""); setShowNewGroup(false); }
    setGroupLoading(false);
  }

  async function createWorkspace() {
    if (!workspaceName.trim()) return;
    setWorkspaceLoading(true);
    const slug = workspaceName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-") + "-" + Date.now().toString(36);
    const { data: ws, error } = await supabase
      .from("workspaces")
      .insert({ name: workspaceName.trim(), slug, owner_id: user.id })
      .select("id")
      .single();

    if (error) { toast.error("Failed to create workspace"); setWorkspaceLoading(false); return; }

    await supabase.from("workspace_members").insert({
      workspace_id: ws.id, user_id: user.id, role: "owner",
    });

    toast.success(`Workspace "${workspaceName}" created!`);
    setWorkspaceName("");
    setShowNewWorkspace(false);
    setWorkspaceLoading(false);
    window.location.reload();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  if (!isOpen) return null;

  const tabs: { id: Tab; icon: any; label: string }[] = [
    { id: "chat", icon: MessageSquare, label: "Chat" },
    { id: "groups", icon: Hash, label: "Groups" },
    { id: "members", icon: Users, label: "Members" },
    { id: "workspace", icon: Building2, label: "Workspace" },
  ];

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-obsidian-900 border-l border-obsidian-700 flex flex-col z-40 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-obsidian-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1">
            {onlineUsers.slice(0, 3).map(u => (
              <Avatar key={u.user_id} email={u.email} userId={u.user_id} />
            ))}
          </div>
          <span className="text-xs text-obsidian-400">{onlineUsers.length} online</span>
        </div>
        <button onClick={onClose} className="text-obsidian-500 hover:text-obsidian-200 transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-obsidian-800 shrink-0">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors",
              tab === t.id
                ? "text-indigo-400 border-b-2 border-indigo-500"
                : "text-obsidian-500 hover:text-obsidian-300"
            )}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── CHAT TAB ─── */}
      {tab === "chat" && (
        <>
          {/* Group selector */}
          <div className="flex gap-1.5 px-3 py-2 border-b border-obsidian-800 overflow-x-auto shrink-0">
            <button
              onClick={() => { setActiveGroup(null); fetchMessages(); }}
              className={cn("px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors shrink-0",
                !activeGroup ? "bg-indigo-600/20 text-indigo-400" : "text-obsidian-500 hover:text-obsidian-300 hover:bg-obsidian-800"
              )}
            >
              # general
            </button>
            {groups.map(g => (
              <button
                key={g.id}
                onClick={() => { setActiveGroup(g); fetchMessages(); }}
                className={cn("px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors shrink-0",
                  activeGroup?.id === g.id ? "bg-indigo-600/20 text-indigo-400" : "text-obsidian-500 hover:text-obsidian-300 hover:bg-obsidian-800"
                )}
              >
                # {g.name}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2.5">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader size={18} className="animate-spin text-indigo-400" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 py-12">
                <MessageSquare size={22} className="text-obsidian-700" />
                <p className="text-sm text-obsidian-500">No messages yet</p>
                <p className="text-xs text-obsidian-600">Say something!</p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isOwn = msg.user_id === user.id;
                const prev = messages[i - 1];
                const showAvatar = !prev || prev.user_id !== msg.user_id;
                const memberEmail = members.find(m => m.user_id === msg.user_id)?.email || msg.user_id.slice(0, 8);

                return (
                  <div key={msg.id} className={cn("flex gap-2", isOwn && "flex-row-reverse")}>
                    {showAvatar
                      ? <Avatar email={memberEmail} userId={msg.user_id} />
                      : <div className="w-6 shrink-0" />
                    }
                    <div className={cn("flex flex-col gap-0.5 max-w-[75%]", isOwn && "items-end")}>
                      {showAvatar && (
                        <span className="text-[9px] text-obsidian-600 px-1">
                          {isOwn ? "You" : memberEmail.split("@")[0]}
                        </span>
                      )}
                      <div className={cn(
                        "px-3 py-2 rounded-2xl text-sm leading-relaxed break-words",
                        isOwn
                          ? "bg-indigo-600 text-white rounded-tr-sm"
                          : "bg-obsidian-800 text-obsidian-100 rounded-tl-sm"
                      )}>
                        {msg.content}
                      </div>
                      <span className="text-[9px] text-obsidian-700 px-1">
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
          <div className="px-3 py-3 border-t border-obsidian-800 shrink-0">
            <div className="flex items-end gap-2 bg-obsidian-800/60 border border-obsidian-700 rounded-xl px-3 py-2">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${activeGroup ? `#${activeGroup.name}` : "#general"}...`}
                rows={1}
                className="flex-1 bg-transparent text-sm text-obsidian-100 placeholder:text-obsidian-600 resize-none focus:outline-none max-h-20"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="p-1 text-indigo-400 hover:text-indigo-300 disabled:text-obsidian-600 transition-colors shrink-0"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* ─── GROUPS TAB ─── */}
      {tab === "groups" && (
        <div className="flex-1 overflow-y-auto flex flex-col">
          <div className="p-3 border-b border-obsidian-800 shrink-0">
            <button
              onClick={() => setShowNewGroup(!showNewGroup)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-sm text-indigo-400 hover:bg-indigo-600/20 transition-colors"
            >
              <Plus size={14} /> Create group
            </button>
          </div>

          {showNewGroup && (
            <div className="p-3 bg-obsidian-800/40 border-b border-obsidian-800 flex flex-col gap-2.5 shrink-0">
              <input
                autoFocus
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && createGroup()}
                placeholder="Group name (e.g. design)"
                className="w-full px-3 py-2 rounded-xl text-sm bg-obsidian-950 border border-obsidian-700 text-obsidian-50 placeholder:text-obsidian-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <input
                value={newGroupDesc}
                onChange={e => setNewGroupDesc(e.target.value)}
                placeholder="Description (optional)"
                className="w-full px-3 py-2 rounded-xl text-sm bg-obsidian-950 border border-obsidian-700 text-obsidian-50 placeholder:text-obsidian-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <div className="flex gap-2">
                <button onClick={() => setShowNewGroup(false)} className="flex-1 py-2 rounded-xl text-xs text-obsidian-400 bg-obsidian-800 hover:bg-obsidian-700 transition-colors">
                  Cancel
                </button>
                <button onClick={createGroup} disabled={groupLoading || !newGroupName.trim()}
                  className="flex-1 py-2 rounded-xl text-xs text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors font-medium">
                  {groupLoading ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
            {/* General always first */}
            <button
              onClick={() => { setActiveGroup(null); setTab("chat"); }}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-obsidian-800/60 transition-colors text-left w-full group"
            >
              <Hash size={14} className="text-obsidian-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-obsidian-200 font-medium">general</p>
                <p className="text-xs text-obsidian-600 truncate">Main workspace chat</p>
              </div>
              <ChevronRight size={12} className="text-obsidian-700 group-hover:text-obsidian-400 transition-colors" />
            </button>

            {groups.map(g => (
              <button
                key={g.id}
                onClick={() => { setActiveGroup(g); setTab("chat"); }}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-obsidian-800/60 transition-colors text-left w-full group"
              >
                <Hash size={14} className="text-obsidian-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-obsidian-200 font-medium">{g.name}</p>
                  {g.description && <p className="text-xs text-obsidian-600 truncate">{g.description}</p>}
                </div>
                <ChevronRight size={12} className="text-obsidian-700 group-hover:text-obsidian-400 transition-colors" />
              </button>
            ))}

            {groups.length === 0 && (
              <div className="py-8 text-center">
                <Hash size={22} className="text-obsidian-700 mx-auto mb-2" />
                <p className="text-sm text-obsidian-500">No groups yet</p>
                <p className="text-xs text-obsidian-600 mt-1">Create one above</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── MEMBERS TAB ─── */}
      {tab === "members" && (
        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Invite section */}
          <div className="p-3 border-b border-obsidian-800 flex flex-col gap-2 shrink-0">
            <p className="text-xs font-medium text-obsidian-400 uppercase tracking-widest">Invite people</p>
            <div className="flex gap-2">
              <input
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && createInvite()}
                placeholder="colleague@email.com"
                type="email"
                className="flex-1 px-3 py-2 rounded-xl text-sm bg-obsidian-950 border border-obsidian-700 text-obsidian-50 placeholder:text-obsidian-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <button
                onClick={createInvite}
                disabled={inviteLoading || !inviteEmail.trim()}
                className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-colors shrink-0"
              >
                {inviteLoading ? <Loader size={14} className="animate-spin" /> : <UserPlus size={14} />}
              </button>
            </div>

            {inviteLink && (
              <div className="flex items-center gap-2 bg-obsidian-800/60 border border-obsidian-700 rounded-xl px-3 py-2">
                <p className="text-[11px] text-obsidian-400 flex-1 truncate">{inviteLink}</p>
                <button onClick={copyInviteLink} className="text-obsidian-400 hover:text-indigo-400 transition-colors shrink-0">
                  {inviteCopied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                </button>
              </div>
            )}
          </div>

          {/* Online now */}
          {onlineUsers.length > 0 && (
            <div className="px-3 pt-3 pb-1 shrink-0">
              <p className="text-[10px] text-obsidian-600 uppercase tracking-widest mb-2 px-1">Online — {onlineUsers.length}</p>
              <div className="flex flex-col gap-1">
                {onlineUsers.map(u => (
                  <div key={u.user_id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg">
                    <div className="relative">
                      <Avatar email={u.email} userId={u.user_id} />
                      <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-obsidian-900" />
                    </div>
                    <span className="text-sm text-obsidian-200 truncate">
                      {u.user_id === user.id ? <><span className="font-medium">You</span></> : u.email.split("@")[0]}
                    </span>
                    <span className="ml-auto text-[9px] text-emerald-500">online</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All members */}
          <div className="flex-1 overflow-y-auto px-3 pb-3">
            <p className="text-[10px] text-obsidian-600 uppercase tracking-widest mb-2 px-1 pt-3">
              All members — {members.length}
            </p>
            <div className="flex flex-col gap-1">
              {members.map(m => {
                const isOnline = onlineUsers.some(u => u.user_id === m.user_id);
                return (
                  <div key={m.user_id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-obsidian-800/40 transition-colors">
                    <div className="relative">
                      <Avatar email={m.email || m.user_id} userId={m.user_id} />
                      {isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-obsidian-900" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-obsidian-200 truncate">
                        {m.user_id === user.id ? "You" : (m.email || m.user_id).split("@")[0]}
                      </p>
                      <p className="text-[10px] text-obsidian-600 capitalize">{m.role}</p>
                    </div>
                    {isOnline
                      ? <span className="text-[9px] text-emerald-500 shrink-0">online</span>
                      : <span className="text-[9px] text-obsidian-700 shrink-0">offline</span>
                    }
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── WORKSPACE TAB ─── */}
      {tab === "workspace" && (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          <div>
            <p className="text-xs font-medium text-obsidian-400 uppercase tracking-widest mb-3">
              Create new workspace
            </p>
            {showNewWorkspace ? (
              <div className="flex flex-col gap-2.5">
                <input
                  autoFocus
                  value={workspaceName}
                  onChange={e => setWorkspaceName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && createWorkspace()}
                  placeholder="Workspace name"
                  className="w-full px-3 py-2.5 rounded-xl text-sm bg-obsidian-950 border border-obsidian-700 text-obsidian-50 placeholder:text-obsidian-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                <div className="flex gap-2">
                  <button onClick={() => setShowNewWorkspace(false)} className="flex-1 py-2 rounded-xl text-xs text-obsidian-400 bg-obsidian-800 hover:bg-obsidian-700 transition-colors">
                    Cancel
                  </button>
                  <button onClick={createWorkspace} disabled={workspaceLoading || !workspaceName.trim()}
                    className="flex-1 py-2 rounded-xl text-xs text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors font-medium">
                    {workspaceLoading ? "Creating..." : "Create"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowNewWorkspace(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-sm text-indigo-400 hover:bg-indigo-600/20 transition-colors"
              >
                <Plus size={15} /> New workspace
              </button>
            )}
          </div>

          <div className="rounded-xl bg-obsidian-800/40 border border-obsidian-800 p-4 flex flex-col gap-2">
            <p className="text-xs font-medium text-obsidian-300 flex items-center gap-1.5">
              <Settings size={12} /> Current workspace
            </p>
            <p className="text-sm text-obsidian-500 text-xs leading-relaxed">
              Manage your workspace settings, billing, and integrations in the Settings page.
            </p>
            <button
              onClick={() => window.location.href = "/dashboard/settings"}
              className="mt-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors text-left"
            >
              Go to Settings →
            </button>
          </div>

          <div className="rounded-xl bg-obsidian-800/40 border border-obsidian-800 p-4 flex flex-col gap-2">
            <p className="text-xs font-medium text-obsidian-300 flex items-center gap-1.5">
              <Users size={12} /> Quick invite
            </p>
            <p className="text-sm text-obsidian-500 text-xs leading-relaxed">
              Generate an invite link and share it with your team.
            </p>
            <button
              onClick={() => setTab("members")}
              className="mt-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors text-left"
            >
              Invite people →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
