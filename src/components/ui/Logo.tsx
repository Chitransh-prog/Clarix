import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  className?: string;
}

const iconSizes = { sm: 24, md: 32, lg: 44 };
const textSizes = { sm: "text-base", md: "text-xl", lg: "text-2xl" };

export function Logo({ size = "md", showWordmark = true, className }: LogoProps) {
  const s = iconSizes[size];
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#4F46E5" />
        <path d="M8 11L16 19L24 11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 18L16 26L24 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
      </svg>
      {showWordmark && (
        <span className={cn("font-medium tracking-tight text-obsidian-50", textSizes[size])}>
          Clarix
        </span>
      )}
    </div>
  );
}
