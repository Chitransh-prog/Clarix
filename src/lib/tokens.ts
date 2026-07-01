import { createClient } from "@/lib/supabase/server";

export const FREE_DAILY_TOKENS = 6000;
export const FREE_DAILY_REQUESTS = 1200;

export type TokenStatus = {
  tokensUsed: number;
  requestsUsed: number;
  tokensLimit: number;
  requestsLimit: number;
  tokensRemaining: number;
  requestsRemaining: number;
  canGenerate: boolean;
  resetTime: string;
};

export async function getTokenStatus(userId: string): Promise<TokenStatus> {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  // Get usage
  const { data: usage } = await supabase
    .from("token_usage")
    .select("tokens_used, requests_used")
    .eq("user_id", userId)
    .eq("date", today)
    .single();

  // Get bonus from verified donations
  const { data: donations } = await supabase
    .from("donations")
    .select("extra_tokens, extra_requests")
    .eq("user_id", userId)
    .eq("status", "verified");

  const bonusTokens = donations?.reduce((s, d) => s + d.extra_tokens, 0) || 0;
  const bonusRequests = donations?.reduce((s, d) => s + d.extra_requests, 0) || 0;

  const tokensLimit = FREE_DAILY_TOKENS + bonusTokens;
  const requestsLimit = FREE_DAILY_REQUESTS + bonusRequests;
  const tokensUsed = usage?.tokens_used || 0;
  const requestsUsed = usage?.requests_used || 0;

  // Reset time = next midnight UTC
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);

  return {
    tokensUsed,
    requestsUsed,
    tokensLimit,
    requestsLimit,
    tokensRemaining: Math.max(0, tokensLimit - tokensUsed),
    requestsRemaining: Math.max(0, requestsLimit - requestsUsed),
    canGenerate: tokensUsed < tokensLimit && requestsUsed < requestsLimit,
    resetTime: tomorrow.toISOString(),
  };
}

export async function consumeTokens(
  userId: string,
  tokensConsumed: number
): Promise<boolean> {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const status = await getTokenStatus(userId);
  if (!status.canGenerate || tokensConsumed > status.tokensRemaining) return false;

  await supabase.from("token_usage").upsert({
    user_id: userId,
    date: today,
    tokens_used: status.tokensUsed + tokensConsumed,
    requests_used: status.requestsUsed + 1,
  }, { onConflict: "user_id,date" });

  return true;
}
