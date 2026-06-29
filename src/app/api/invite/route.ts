import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    // Use service role to look up invite — bypasses RLS so any
    // authenticated user can redeem a token without being a member yet
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: invite } = await serviceClient
      .from("workspace_invites")
      .select("*")
      .eq("token", token)
      .eq("status", "pending")
      .single();

    if (!invite) return NextResponse.json({ error: "Invalid or expired invite" }, { status: 404 });

    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: "Invite has expired" }, { status: 410 });
    }

    // Optional: verify the invite email matches the logged-in user
    if (invite.email && invite.email !== user.email) {
      return NextResponse.json({ error: "This invite was sent to a different email" }, { status: 403 });
    }

    // Add to workspace (use service client to bypass RLS here too)
    const { error: memberError } = await serviceClient
      .from("workspace_members")
      .insert({ workspace_id: invite.workspace_id, user_id: user.id, role: "member" });

    if (memberError && memberError.code !== "23505") {
      return NextResponse.json({ error: "Failed to join workspace" }, { status: 500 });
    }

    // Mark invite accepted
    await serviceClient
      .from("workspace_invites")
      .update({ status: "accepted" })
      .eq("id", invite.id);

    return NextResponse.json({ workspace_id: invite.workspace_id });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}