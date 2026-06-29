"use client";

import { useState } from "react";
import { Whiteboard } from "@/components/collaboration/Whiteboard";
import { CollabPanel } from "@/components/collaboration/CollabPanel";
import { Users } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface Props {
  boardId: string;
  workspaceId: string;
  user: User;
}

export function WhiteboardClient({ boardId, workspaceId, user }: Props) {
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    // overflow-hidden stops the browser from fighting Excalidraw's
    // internal panning. h-full fills the <main> from DashboardLayout.
    <div className="h-full flex relative overflow-hidden">
      {/* min-h-0 is required in a flex-col chain so this div can
          shrink and Excalidraw fills exactly the remaining space. */}
      <div
        className={`flex-1 flex flex-col min-h-0 transition-all duration-300 ${
          panelOpen ? "mr-80" : ""
        }`}
      >
        <Whiteboard
          boardId={boardId}
          workspaceId={workspaceId}
          user={user}
        />
      </div>

      {/* Toggle button */}
      {!panelOpen && (
        <button
          onClick={() => setPanelOpen(true)}
          className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-lg transition-colors z-30"
        >
          <Users size={16} />
          Collaborate
        </button>
      )}

      {/* Collab panel */}
      <CollabPanel
        workspaceId={workspaceId}
        user={user}
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
      />
    </div>
  );
}