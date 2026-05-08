import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "blue" | "accent";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "bg-surface text-text-secondary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    error: "bg-error/10 text-error",
    blue: "bg-primary-light text-primary",
    accent: "bg-accent/10 text-accent",
  };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-pill text-xs font-medium", variants[variant], className)}>
      {children}
    </span>
  );
}
