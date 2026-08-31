import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "purple";
  size?: "sm" | "md";
  dot?: boolean;
}

const VARIANT_STYLES = {
  default: "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]",
  success: "bg-green-500/10 text-green-500",
  warning: "bg-yellow-500/10 text-yellow-500",
  danger: "bg-red-500/10 text-red-500",
  info: "bg-blue-500/10 text-blue-400",
  purple: "bg-purple-500/10 text-purple-400",
};

const DOT_COLORS = {
  default: "bg-[var(--text-tertiary)]",
  success: "bg-green-500",
  warning: "bg-yellow-500",
  danger: "bg-red-500",
  info: "bg-blue-400",
  purple: "bg-purple-400",
};

export default function Badge({
  children,
  variant = "default",
  size = "sm",
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        VARIANT_STYLES[variant],
        {
          "px-2 py-0.5 text-[10px]": size === "sm",
          "px-3 py-1 text-xs": size === "md",
        }
      )}
    >
      {dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full", DOT_COLORS[variant])} />
      )}
      {children}
    </span>
  );
}
