"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";

function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        className="w-full h-full"
        viewBox="0 0 696 316"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="url(#indigo-gradient)"
            strokeWidth={path.width}
            strokeOpacity={0.08 + path.id * 0.015}
            initial={{ pathLength: 0.3, opacity: 0.4 }}
            animate={{
              pathLength: 1,
              opacity: [0.2, 0.5, 0.2],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + (path.id % 10),
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
        <defs>
          <linearGradient id="indigo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="50%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#3730A3" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export function Hero() {
  const titleLine1 = "Build tools that";
  const titleLine2 = "think clearly.";

  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-obsidian-950 pt-16">

      {/* Floating path animations */}
      <div className="absolute inset-0">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      {/* Radial indigo glow at top */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(79,70,229,0.18) 0%, transparent 65%)",
        }}
      />

      {/* Grid overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 grid-bg opacity-20"
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="relative z-10 max-w-4xl mx-auto px-5 text-center flex flex-col items-center gap-8"
      >
        {/* Eyebrow badge */}
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-xs text-indigo-400 font-medium"
        >
          <Zap size={11} />
          Now in early access
        </motion.span>

        {/* Animated headline — line 1 */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-medium tracking-tight leading-[1.05]">
          <span className="inline-block mb-2">
            {titleLine1.split("").map((char, i) => (
              <motion.span
                key={`l1-${i}`}
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  delay: 0.3 + i * 0.025,
                  type: "spring",
                  stiffness: 180,
                  damping: 24,
                }}
                className="inline-block text-obsidian-50"
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </span>
          <br />
          {/* Line 2 — gradient */}
          <span className="inline-block">
            {titleLine2.split("").map((char, i) => (
              <motion.span
                key={`l2-${i}`}
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  delay: 0.5 + i * 0.028,
                  type: "spring",
                  stiffness: 180,
                  damping: 24,
                }}
                className="inline-block text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #818CF8 0%, #4F46E5 50%, #3730A3 100%)",
                }}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </span>
        </h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.7 }}
          className="text-base md:text-xl text-obsidian-400 max-w-2xl leading-relaxed"
        >
          Clarix gives your team the clarity to ship faster — no noise, no
          overhead. One minimal, powerful surface for everything that matters.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          {/* Primary CTA — glass morphism style */}
          <div className="group relative bg-gradient-to-b from-white/10 to-white/5 p-px rounded-2xl backdrop-blur-lg overflow-hidden shadow-lg hover:shadow-indigo-500/20 hover:shadow-xl transition-all duration-300">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2.5 rounded-[calc(1rem-1px)] px-7 py-3.5 text-sm font-semibold backdrop-blur-md bg-indigo-600/90 hover:bg-indigo-600 text-white transition-all duration-300 group-hover:-translate-y-0.5"
            >
              <span className="opacity-90 group-hover:opacity-100 transition-opacity">
                Go to dashboard
              </span>
              <ArrowRight
                size={15}
                className="opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300"
              />
            </Link>
          </div>

          {/* Secondary CTA */}
          <div className="group relative bg-gradient-to-b from-white/5 to-transparent p-px rounded-2xl backdrop-blur-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
            <Link
              href="#features"
              className="inline-flex items-center gap-2 rounded-[calc(1rem-1px)] px-7 py-3.5 text-sm font-semibold backdrop-blur-md bg-obsidian-800/80 hover:bg-obsidian-800 text-obsidian-200 hover:text-white border border-obsidian-700/60 hover:border-obsidian-600 transition-all duration-300 group-hover:-translate-y-0.5"
            >
              See features
            </Link>
          </div>
        </motion.div>

        {/* Fine print */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="text-xs text-obsidian-600"
        >
          No credit card required · Free to use · Cancel anytime
        </motion.p>
      </motion.div>

      {/* Bottom fade into rest of page */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 inset-x-0 h-40"
        style={{
          background:
            "linear-gradient(to bottom, transparent, #09090B)",
        }}
      />
    </section>
  );
}
