"use client";
import { Zap, Shield, Users, BarChart3, GitBranch, Bell } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Ship without friction",
    description: "Tasks, projects, and timelines in one surface. No tab-switching, no context loss.",
    accent: "#4F46E5",
    span: "col-span-2",
  },
  {
    icon: Shield,
    title: "Enterprise-grade security",
    description: "Row-level security baked in from day one. Every query scoped to your workspace.",
    accent: "#059669",
    span: "col-span-1",
  },
  {
    icon: Users,
    title: "Real-time collaboration",
    description: "Presence indicators, live updates, and inline comments — your team always in sync.",
    accent: "#D97706",
    span: "col-span-1",
  },
  {
    icon: BarChart3,
    title: "Analytics that surface signal",
    description: "Velocity, completion rates, blockers — meaningful metrics, not vanity dashboards.",
    accent: "#DB2777",
    span: "col-span-1",
  },
  {
    icon: GitBranch,
    title: "Workflow automation",
    description: "Auto-assign, status transitions, and trigger-based rules with zero configuration.",
    accent: "#7C3AED",
    span: "col-span-2",
  },
  {
    icon: Bell,
    title: "Smart notifications",
    description: "Digest by default. Surface only what needs your attention, when you need it.",
    accent: "#0EA5E9",
    span: "col-span-1",
  },
];

export function Features() {
  return (
    <section id="features" className="py-28 px-5">
      <div className="max-w-6xl mx-auto">
        <div className="mb-14 max-w-xl">
          <p className="text-xs font-medium text-indigo-400 uppercase tracking-widest mb-3">
            Features
          </p>
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-obsidian-50 leading-[1.1]">
            Everything your team actually needs.
          </h2>
          <p className="mt-4 text-base text-obsidian-400 leading-relaxed">
            We removed the features nobody uses so the ones that matter feel instant.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className={`group relative rounded-2xl bg-obsidian-900/60 border border-obsidian-800 p-6 overflow-hidden hover:border-obsidian-700 transition-all duration-300 ${
                f.span === "col-span-2" ? "md:col-span-2" : ""
              }`}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                style={{
                  background: `radial-gradient(ellipse at 0% 0%, ${f.accent}12 0%, transparent 60%)`,
                }}
              />
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-5"
                style={{
                  background: `${f.accent}18`,
                  border: `1px solid ${f.accent}30`,
                }}
              >
                <f.icon size={16} style={{ color: f.accent }} />
              </div>
              <h3 className="text-base font-medium text-obsidian-100 mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-obsidian-400 leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
