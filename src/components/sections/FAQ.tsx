"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  { q: "How is Clarix different from other project tools?", a: "Clarix is built around one principle: clarity over features. We ship fewer, better-designed tools that don't require onboarding docs to use." },
  { q: "Does Clarix have a free plan?", a: "Yes. The free plan supports 1 workspace, 3 projects, and 2 team members with no time limit." },
  { q: "How does the Supabase backend work?", a: "Every workspace is isolated using Supabase Row Level Security (RLS). Your data is never shared across workspaces — every query is scoped to your team at the database level." },
  { q: "Can I self-host Clarix?", a: "Yes. You can deploy it to any Next.js host (Vercel, Railway, Fly.io) and connect your own Supabase project." },
  { q: "What happens when I upgrade or downgrade?", a: "Upgrades take effect immediately. Downgrades take effect at the end of your current billing period. Your data is never deleted on downgrade." },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" className="py-28 px-5 border-t border-obsidian-800/60">
      <div className="max-w-3xl mx-auto">
        <div className="mb-14 text-center">
          <p className="text-xs font-medium text-indigo-400 uppercase tracking-widest mb-3">FAQ</p>
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-obsidian-50 leading-[1.1]">Common questions.</h2>
        </div>
        <div className="flex flex-col divide-y divide-obsidian-800/60">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button className="w-full flex items-center justify-between gap-4 py-5 text-left group" onClick={() => setOpen(open === i ? null : i)}>
                <span className="text-sm font-medium text-obsidian-100 group-hover:text-white transition-colors">{faq.q}</span>
                <ChevronDown size={16} className={cn("text-obsidian-500 shrink-0 transition-transform duration-200", open === i && "rotate-180 text-indigo-400")} />
              </button>
              <div className={cn("overflow-hidden transition-all duration-200", open === i ? "max-h-40 pb-5" : "max-h-0")}>
                <p className="text-sm text-obsidian-400 leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
