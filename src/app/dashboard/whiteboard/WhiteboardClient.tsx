"use client";
import { useState } from "react";
import { Whiteboard } from "@/components/collaboration/Whiteboard";
import { Chat } from "@/components/collaboration/Chat";
import { MessageSquare } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface Props {
  boardId: string;
  workspaceId: string;
  user: User;
}

export function WhiteboardClient({ boardId, workspaceId, user }: Props) {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="h-full flex flex-col relative">
      <Whiteboard boardId={boardId} workspaceId={workspaceId} user={user} />

      {/* Chat toggle button */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-4 right-4 w-11 h-11 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg transition-colors z-30"
        style={{ display: chatOpen ? "none" : "flex" }}
      >
        <MessageSquare size={18} />
      </button>

      <Chat
        workspaceId={workspaceId}
        user={user}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />
    </div>
  );
}
