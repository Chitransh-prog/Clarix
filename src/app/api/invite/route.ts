import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    console.log("1. Token received:", token?.slice(0, 20));
    console.log("2. Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30));
    console.log("3. Service key exists:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    console.log("4. Service key prefix:", process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 10));

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    console.log("5. User:", user?.email);

    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: invite, error: inviteError } = await serviceClient
      .from("workspace_invites")
      .select("*")
      .eq("token", token)
      .single();

    console.log("6. Invite found:", !!invite);
    console.log("7. Invite error:", inviteError?.message);
    console.log("8. Invite status:", invite?.status);

    if (!invite) return NextResponse.json({ error: "Invite not found: " + inviteError?.message }, { status: 404 });
    if (invite.status !== "pending") return NextResponse.json({ error: "Invite already used" }, { status: 410 });
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) return NextResponse.json({ error: "Invite has expired" }, { status: 410 });
    if (invite.email && invite.email !== user.email) return NextResponse.json({ error: `Email mismatch: invite=${invite.email} user=${user.email}` }, { status: 403 });

    const { error: memberError } = await serviceClient
      .from("workspace_members")
      .insert({ workspace_id: invite.workspace_id, user_id: user.id, role: "member" });

    if (memberError && memberError.code !== "23505") {
      return NextResponse.json({ error: "Member insert failed: " + memberError.message }, { status: 500 });
    }

    await serviceClient.from("workspace_invites").update({ status: "accepted" }).eq("id", invite.id);

    return NextResponse.json({ workspace_id: invite.workspace_id });
  } catch (err: any) {
    console.error("CATCH ERROR:", err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}