import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTokenStatus } from "@/lib/tokens";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const status = await getTokenStatus(user.id);
    return NextResponse.json(status);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
