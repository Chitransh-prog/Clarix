import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { WhiteboardClient } from "./WhiteboardClient";

export const metadata = { title: "Whiteboard" };

export default async function WhiteboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Get or create a default board for this user
  const { data: boards } = await supabase
    .from("whiteboards")
    .select("id, name")
    .limit(1);

  let boardId = boards?.[0]?.id;

  if (!boardId) {
    // Create a default board
    const { data: newBoard } = await supabase
      .from("whiteboards")
      .insert({
        name: "Main whiteboard",
        created_by: user.id,
        elements: [],
        app_state: {},
      })
      .select("id")
      .single();
    boardId = newBoard?.id;
  }

  if (!boardId) return <div className="p-6 text-obsidian-400">Could not load whiteboard.</div>;

  // Get workspace
  const { data: membership } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  return (
    <WhiteboardClient
      boardId={boardId}
      workspaceId={membership?.workspace_id || ""}
      user={user}
    />
  );
}
