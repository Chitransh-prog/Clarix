import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="py-28 px-5">
      <div className="max-w-6xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-indigo-600/10 border border-indigo-500/20 p-12 md:p-20 text-center">
          <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(79,70,229,0.15) 0%, transparent 70%)" }} />
          <div className="relative z-10">
            <p className="text-xs font-medium text-indigo-400 uppercase tracking-widest mb-5">Get started today</p>
            <h2 className="text-4xl md:text-6xl font-medium tracking-tight text-obsidian-50 leading-[1.05] mb-5">
              Control your workflow<br />with Clarix.
            </h2>
            <p className="text-base text-obsidian-400 max-w-lg mx-auto mb-10 leading-relaxed">
              Join teams already using Clarix to ship faster with less noise. Free to start, no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg">
                <Link href="/auth/signup" className="flex items-center gap-2">Start for free <ArrowRight size={16} /></Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
