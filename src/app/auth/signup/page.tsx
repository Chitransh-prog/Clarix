"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Logo } from "@/components/ui/Logo";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${location.origin}/api/auth/callback`,
      },
    });
    if (error) { toast.error(error.message); setLoading(false); return; }
    toast.success("Check your email to confirm your account!");
    router.push("/auth/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-obsidian-950">
      <div className="w-full max-w-sm flex flex-col gap-8">
        <div className="text-center flex flex-col items-center gap-3">
          <Logo size="md" />
          <div>
            <h1 className="text-xl font-medium text-obsidian-50">Create your account</h1>
            <p className="text-sm text-obsidian-500 mt-1">Free forever. No credit card required.</p>
          </div>
        </div>

        <div className="bg-obsidian-900/80 border border-obsidian-800 rounded-2xl p-6">
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-obsidian-300">Full name</label>
              <input
                value={name} onChange={e => setName(e.target.value)} required
                placeholder="Chitransh Prasad"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-obsidian-950 border border-obsidian-700 text-obsidian-50 placeholder:text-obsidian-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
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
                placeholder="Min. 8 characters"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-obsidian-950 border border-obsidian-700 text-obsidian-50 placeholder:text-obsidian-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50 mt-1"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-obsidian-500">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
