"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { toast } from "sonner";
import { Loader, CheckCircle, XCircle } from "lucide-react";

function InviteContent() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid invite link.");
      return;
    }

    async function acceptInvite() {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      // Not logged in — redirect to signup preserving the token
      if (res.status === 401) {
        router.push(`/auth/signup?redirect=/invite?token=${token}`);
        return;
      }

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("You've joined the workspace!");
        toast.success("Welcome to the workspace!");
        setTimeout(() => router.push("/dashboard/whiteboard"), 2000);
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
      }
    }

    acceptInvite();
  }, [token, router]);

  return (
    <div className="min-h-screen bg-obsidian-950 flex items-center justify-center px-5">
      <div className="flex flex-col items-center gap-6 text-center max-w-sm">
        <Logo size="md" />
        <div className="bg-obsidian-900/80 border border-obsidian-800 rounded-2xl p-8 w-full flex flex-col items-center gap-4">
          {status === "loading" && (
            <>
              <Loader size={32} className="animate-spin text-indigo-400" />
              <p className="text-sm text-obsidian-300">Accepting invite...</p>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle size={32} className="text-emerald-400" />
              <p className="text-sm text-obsidian-100 font-medium">{message}</p>
              <p className="text-xs text-obsidian-500">Redirecting to dashboard...</p>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle size={32} className="text-red-400" />
              <p className="text-sm text-obsidian-100 font-medium">{message}</p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => router.push(`/auth/login?redirect=/invite?token=${token}`)}
                  className="flex-1 px-4 py-2 rounded-xl text-sm bg-obsidian-800 hover:bg-obsidian-700 text-white transition-colors"
                >
                  Log in
                </button>
                <button
                  onClick={() => router.push(`/auth/signup?redirect=/invite?token=${token}`)}
                  className="flex-1 px-4 py-2 rounded-xl text-sm bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                >
                  Sign up
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-obsidian-950 flex items-center justify-center">
          <Loader size={24} className="animate-spin text-indigo-400" />
        </div>
      }
    >
      <InviteContent />
    </Suspense>
  );
}