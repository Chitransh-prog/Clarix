import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Tier benefits
const TIERS: Record<string, { tokens: number; requests: number }> = {
  "1":  { tokens: 3000,  requests: 600 },
  "3":  { tokens: 10000, requests: 2000 },
  "5":  { tokens: 20000, requests: 5000 },
  "10": { tokens: 50000, requests: 15000 },
};

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { amount, currency, bmcOrderId } = await req.json();
    if (!amount || !bmcOrderId) {
      return NextResponse.json({ error: "Missing amount or order ID" }, { status: 400 });
    }

    const tier = TIERS[String(Math.floor(amount))] || { tokens: Math.floor(amount) * 3000, requests: Math.floor(amount) * 600 };

    const { error } = await supabase.from("donations").insert({
      user_id: user.id,
      amount,
      currency: currency || "USD",
      bmc_order_id: bmcOrderId,
      status: "pending",
      extra_tokens: tier.tokens,
      extra_requests: tier.requests,
    });

    if (error) {
      if (error.code === "23505") return NextResponse.json({ error: "Order already submitted" }, { status: 409 });
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Donation submitted for verification. Tokens will be added within 24 hours.",
      tier,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Admin verify endpoint
export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();
    const { donationId, action } = await req.json();

    // Simple admin check — add your email here
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== "chitranshp35@gmail.com") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await supabase.from("donations").update({
      status: action === "verify" ? "verified" : "rejected",
      verified_at: new Date().toISOString(),
    }).eq("id", donationId);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
