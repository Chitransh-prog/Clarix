import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Use SECURITY DEFINER function to bypass RLS for invite lookup
    const { data: invite, error: inviteError } = await supabase
      .rpc("get_invite_by_token", { invite_token: token });

    if (inviteError || !invite) {
      console.error("Invite lookup error:", inviteError);
      return NextResponse.json({ error: "Invalid or expired invite" }, { status: 404 });
    }

    if (invite.status !== "pending") {
      return NextResponse.json({ error: "Invite already used" }, { status: 410 });
    }

    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: "Invite has expired" }, { status: 410 });
    }

    if (invite.email && invite.email !== user.email) {
      return NextResponse.json(
        { error: `This invite was sent to ${invite.email}` },
        { status: 403 }
      );
    }

    // Add user to workspace
    const { error: memberError } = await supabase
      .from("workspace_members")
      .insert({ workspace_id: invite.workspace_id, user_id: user.id, role: "member" });

    if (memberError && memberError.code !== "23505") {
      console.error("Member insert error:", memberError);
      return NextResponse.json({ error: "Failed to join workspace" }, { status: 500 });
    }

    // Mark invite as accepted
    const { error: updateError } = await supabase
      .from("workspace_invites")
      .update({ status: "accepted" })
      .eq("id", invite.id);

    if (updateError) {
      console.error("Invite update error:", updateError);
    }

    return NextResponse.json({ workspace_id: invite.workspace_id });
  } catch (err: any) {
    console.error("Invite route error:", err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}