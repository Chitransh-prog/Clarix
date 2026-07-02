"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Features",  href: "#features" },
  { label: "Docs AI",   href: "#docs-generator" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing",   href: "#pricing" },
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
      scrolled
        ? "bg-obsidian-950/90 backdrop-blur-xl border-b border-obsidian-800/60"
        : "bg-transparent"
    )}>
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link href="/"><Logo size="sm" /></Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-obsidian-400 hover:text-obsidian-100 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-sm text-obsidian-400 hover:text-obsidian-100 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
          >
            Get started free
          </Link>
        </div>

        <button
          className="md:hidden p-2 text-obsidian-400 hover:text-obsidian-100 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-obsidian-950/98 backdrop-blur-xl border-b border-obsidian-800 px-5 py-4 flex flex-col gap-3">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-obsidian-300 hover:text-white py-1.5 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-obsidian-800">
            <Link href="/auth/login" className="text-sm text-center text-obsidian-400 py-2">
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="text-sm text-center py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
