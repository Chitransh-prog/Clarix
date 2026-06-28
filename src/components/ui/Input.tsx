import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-obsidian-300 tracking-wide">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full px-3.5 py-2.5 rounded-xl text-sm",
            "bg-obsidian-900 border border-obsidian-700",
            "text-obsidian-50 placeholder:text-obsidian-500",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50",
            "transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-red-500/60 focus:ring-red-500/30",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-obsidian-500">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
