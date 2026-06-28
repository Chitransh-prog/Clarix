"use client";
import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free", price: { monthly: 0, annual: 0 }, description: "For individuals exploring Clarix.",
    features: ["1 workspace", "Up to 3 projects", "20 tasks total", "2 team members"],
    cta: "Get started free", href: "/auth/signup", highlight: false,
  },
  {
    name: "Pro", price: { monthly: 12, annual: 9 }, description: "For small teams that move fast.",
    features: ["Unlimited workspaces", "Unlimited projects & tasks", "Up to 15 members", "Analytics dashboard", "Workflow automation", "Priority support"],
    cta: "Start Pro trial", href: "/auth/signup?plan=pro", highlight: true,
  },
  {
    name: "Team", price: { monthly: 29, annual: 22 }, description: "For larger organisations.",
    features: ["Everything in Pro", "Unlimited members", "SSO / SAML", "Audit logs", "Dedicated support"],
    cta: "Contact sales", href: "/contact", highlight: false,
  },
];

export function Pricing() {
  const [annual, setAnnual] = useState(false);
  return (
    <section id="pricing" className="py-28 px-5 border-t border-obsidian-800/60">
      <div className="max-w-6xl mx-auto">
        <div className="mb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-xl">
            <p className="text-xs font-medium text-indigo-400 uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-obsidian-50 leading-[1.1]">Simple, honest pricing.</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn("text-sm", !annual ? "text-obsidian-100" : "text-obsidian-500")}>Monthly</span>
            <button onClick={() => setAnnual(!annual)} className={cn("relative w-11 h-6 rounded-full border transition-all", annual ? "bg-indigo-600 border-indigo-500" : "bg-obsidian-800 border-obsidian-700")}>
              <span className={cn("absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform", annual ? "translate-x-5" : "translate-x-0")} />
            </button>
            <span className={cn("text-sm", annual ? "text-obsidian-100" : "text-obsidian-500")}>
              Annual <span className="text-xs text-emerald-400 font-medium">–25%</span>
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div key={plan.name} className={cn("relative rounded-2xl p-6 flex flex-col gap-6 border transition-all", plan.highlight ? "bg-indigo-600/10 border-indigo-500/40" : "bg-obsidian-900/60 border-obsidian-800 hover:border-obsidian-700")}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="text-xs font-medium bg-indigo-600 text-white px-3 py-1 rounded-full">Most popular</span>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-obsidian-300 mb-1">{plan.name}</p>
                <div className="flex items-baseline gap-1 mb-1.5">
                  <span className="text-4xl font-medium text-obsidian-50 tracking-tight">${annual ? plan.price.annual : plan.price.monthly}</span>
                  {plan.price.monthly > 0 && <span className="text-sm text-obsidian-500">/mo</span>}
                </div>
                <p className="text-sm text-obsidian-500">{plan.description}</p>
              </div>
              <Button variant={plan.highlight ? "primary" : "secondary"} className="w-full justify-center">
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
              <ul className="flex flex-col gap-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-obsidian-300">
                    <Check size={14} className={plan.highlight ? "text-indigo-400" : "text-obsidian-500"} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
