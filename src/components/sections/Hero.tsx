import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(79,70,229,0.2) 0%, transparent 60%)" }} />

      <div className="relative z-10 max-w-4xl mx-auto px-5 text-center flex flex-col items-center gap-8">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-xs text-indigo-400 font-medium">
          Now in early access
        </span>

        <h1 className="text-5xl md:text-7xl font-medium tracking-tight leading-[1.05]">
          <span className="text-obsidian-50">Build tools that</span>
          <br />
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #818CF8 0%, #4F46E5 50%, #3730A3 100%)" }}>
            think clearly.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-obsidian-400 max-w-2xl leading-relaxed">
          Clarix gives your team the clarity to ship faster — no noise, no overhead. One minimal, powerful surface for everything that matters.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
          <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors">
            Go to dashboard <ArrowRight size={16} />
          </Link>
          <Link href="#features" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-obsidian-100 text-sm font-medium border border-obsidian-700 transition-colors">
            See features
          </Link>
        </div>

        <p className="text-xs text-obsidian-600">No credit card required · Free to use</p>
      </div>
    </section>
  );
}
