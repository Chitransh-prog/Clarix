"use client";
import { useState } from "react";
import { Whiteboard } from "@/components/collaboration/Whiteboard";
import { CollabPanel } from "@/components/collaboration/CollabPanel";
import { Users, X } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface Props {
  boardId: string;
  workspaceId: string;
  user: User;
}

export function WhiteboardClient({ boardId, workspaceId, user }: Props) {
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <div className="h-full flex relative overflow-hidden">
      {/* Whiteboard */}
      <div className={`flex-1 flex flex-col transition-all duration-300 min-w-0 ${panelOpen ? "md:mr-80" : ""}`}>
        <Whiteboard boardId={boardId} workspaceId={workspaceId} user={user} />
      </div>

      {/* Collaborate button — hidden when panel open */}
      {!panelOpen && (
        <button
          onClick={() => setPanelOpen(true)}
          className="fixed bottom-24 md:bottom-6 right-4 md:right-6 flex items-center gap-2 px-4 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-xl transition-colors z-30"
        >
          <Users size={15} />
          <span className="hidden sm:inline">Collaborate</span>
        </button>
      )}

      {/* Collab panel — full screen on mobile, sidebar on desktop */}
      {panelOpen && (
        <>
          {/* Mobile overlay */}
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setPanelOpen(false)}
          />
          {/* Panel */}
          <div className="fixed md:absolute inset-y-0 right-0 w-full sm:w-96 md:w-80 z-50 md:z-auto">
            <CollabPanel
              workspaceId={workspaceId}
              user={user}
              isOpen={panelOpen}
              onClose={() => setPanelOpen(false)}
            />
          </div>
        </>
      )}
    </div>
  );
}
