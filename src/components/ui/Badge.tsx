import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "indigo" | "green" | "yellow" | "red" | "zinc";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-obsidian-800 text-obsidian-300 border-obsidian-700",
  indigo: "bg-indigo-600/15 text-indigo-400 border-indigo-500/30",
  green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  yellow: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  red: "bg-red-500/10 text-red-400 border-red-500/20",
  zinc: "bg-obsidian-700 text-obsidian-400 border-obsidian-600",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border", variants[variant], className)}>
      {children}
    </span>
  );
}
