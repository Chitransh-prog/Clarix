"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Logo } from "@/components/ui/Logo";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { toast.error(error.message); setLoading(false); return; }
    toast.success("Welcome back!");
    router.push("/dashboard");
    router.refresh();
  }

  async function signInWithGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/api/auth/callback` },
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-obsidian-950">
      <div className="w-full max-w-sm flex flex-col gap-8">
        <div className="text-center flex flex-col items-center gap-3">
          <Logo size="md" />
          <div>
            <h1 className="text-xl font-medium text-obsidian-50">Sign in to Clarix</h1>
            <p className="text-sm text-obsidian-500 mt-1">Welcome back</p>
          </div>
        </div>

        <div className="bg-obsidian-900/80 border border-obsidian-800 rounded-2xl p-6">
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-obsidian-700 text-sm text-obsidian-200 hover:bg-obsidian-800 transition-colors mb-5"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-obsidian-800" />
            <span className="text-xs text-obsidian-600">or</span>
            <div className="flex-1 h-px bg-obsidian-800" />
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-obsidian-300">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-obsidian-950 border border-obsidian-700 text-obsidian-50 placeholder:text-obsidian-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-obsidian-300">Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-obsidian-950 border border-obsidian-700 text-obsidian-50 placeholder:text-obsidian-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50 mt-1"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-obsidian-500">
          No account?{" "}
          <Link href="/auth/signup" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
