"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={cn(
      "fixed top-0 inset-x-0 z-50 transition-all duration-300",
      scrolled ? "bg-obsidian-950/90 backdrop-blur-xl border-b border-obsidian-800/60" : "bg-transparent"
    )}>
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link href="/"><Logo size="sm" /></Link>
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-obsidian-400 hover:text-obsidian-100 transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <Link href="/dashboard" className="text-sm px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors">
            Go to dashboard
          </Link>
        </div>
        <button className="md:hidden p-2 text-obsidian-400" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-obsidian-950/95 backdrop-blur-xl border-b border-obsidian-800 px-5 py-4 flex flex-col gap-4">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-obsidian-300 py-1" onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          ))}
          <Link href="/dashboard" className="text-sm text-center px-4 py-2 rounded-xl bg-indigo-600 text-white">
            Go to dashboard
          </Link>
        </div>
      )}
    </header>
  );
}
