import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-obsidian-800/60 bg-obsidian-950">
      <div className="max-w-6xl mx-auto px-5 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <Logo size="sm" />
            <p className="text-sm text-obsidian-500 leading-relaxed max-w-[200px]">
              The SaaS toolkit built for teams that value clarity.
            </p>
          </div>
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <p className="text-xs font-medium text-obsidian-400 uppercase tracking-widest mb-4">{group}</p>
              <ul className="flex flex-col gap-2.5">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-obsidian-500 hover:text-obsidian-200 transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-obsidian-800/60">
          <p className="text-xs text-obsidian-600">© {new Date().getFullYear()} Clarix. All rights reserved.</p>
          <p className="text-xs text-obsidian-600">Built with Next.js, Tailwind CSS & Supabase</p>
        </div>
      </div>
    </footer>
  );
}
