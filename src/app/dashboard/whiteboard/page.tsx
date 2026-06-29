import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { WhiteboardClient } from "./WhiteboardClient";
import "@excalidraw/excalidraw/index.css";

export const metadata = {
  title: "Whiteboard",
};

export default async function WhiteboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  let workspaceId: string | null = null;
  let boardId: string | null = null;

  // =====================================================
  // GET ALL WORKSPACE MEMBERSHIPS
  // =====================================================

  const { data: memberships, error: membershipError } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id);
  // No .limit(1) — fetch all so board lookup works across all workspaces

  if (memberships && memberships.length > 0) {
    workspaceId = memberships[0].workspace_id;
  }

  // =====================================================
  // CREATE WORKSPACE IF NONE EXISTS
  // =====================================================

  if (!workspaceId) {
    const slug = `ws-${crypto.randomUUID()}`;

    const { data: workspace, error: workspaceError } = await supabase
      .from("workspaces")
      .insert({
        name: "My Workspace",
        slug,
        owner_id: user.id,
        plan: "free",
      })
      .select()
      .single();

    if (workspaceError) {
      return (
        <pre className="p-6 text-red-500">
          {JSON.stringify({ step: "create workspace", error: workspaceError }, null, 2)}
        </pre>
      );
    }

    workspaceId = workspace.id;

    const { error: memberError } = await supabase
      .from("workspace_members")
      .insert({
        workspace_id: workspaceId,
        user_id: user.id,
        role: "owner",
      });

    if (memberError) {
      return (
        <pre className="p-6 text-red-500">
          {JSON.stringify({ step: "insert membership", error: memberError }, null, 2)}
        </pre>
      );
    }
  }

  // =====================================================
  // GET FIRST WHITEBOARD ACROSS ALL USER WORKSPACES
  // =====================================================

  // Use all workspace IDs so we don't miss a board that belongs
  // to a different workspace than the one picked by LIMIT 1.
  const workspaceIds = memberships?.map((m) => m.workspace_id) ?? [workspaceId!];

  const { data: boards, error: boardError } = await supabase
    .from("whiteboards")
    .select("*")
    .in("workspace_id", workspaceIds)
    .limit(1);

  if (boards && boards.length > 0) {
    boardId = boards[0].id;
    // Align workspaceId to the board's actual workspace
    workspaceId = boards[0].workspace_id;
  }

  // =====================================================
  // CREATE WHITEBOARD IF NONE EXISTS
  // =====================================================

  if (!boardId) {
    const { data: board, error: createBoardError } = await supabase
      .from("whiteboards")
      .insert({
        workspace_id: workspaceId,
        created_by: user.id,
        name: "Main Whiteboard",
        elements: [],
        app_state: null,
      })
      .select()
      .single();

    if (createBoardError) {
      return (
        <pre className="p-6 text-red-500">
          {JSON.stringify({ step: "create board", error: createBoardError }, null, 2)}
        </pre>
      );
    }

    boardId = board.id;
  }

  return (
    <WhiteboardClient
      boardId={boardId!}
      workspaceId={workspaceId!}
      user={user}
    />
  );
}