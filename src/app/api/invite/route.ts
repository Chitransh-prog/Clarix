import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    // Find invite
    const { data: invite } = await supabase
      .from("workspace_invites")
      .select("*")
      .eq("token", token)
      .eq("status", "pending")
      .single();

    if (!invite) return NextResponse.json({ error: "Invalid or expired invite" }, { status: 404 });
    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: "Invite has expired" }, { status: 410 });
    }

    // Add to workspace
    const { error: memberError } = await supabase
      .from("workspace_members")
      .insert({ workspace_id: invite.workspace_id, user_id: user.id, role: "member" });

    if (memberError && memberError.code !== "23505") {
      return NextResponse.json({ error: "Failed to join workspace" }, { status: 500 });
    }

    // Mark invite accepted
    await supabase
      .from("workspace_invites")
      .update({ status: "accepted" })
      .eq("id", invite.id);

    return NextResponse.json({ workspace_id: invite.workspace_id });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
