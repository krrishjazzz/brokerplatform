import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "blue" | "accent";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "bg-surface text-text-secondary border-border",
    success: "bg-success-light text-success border-success/20",
    warning: "bg-warning-light text-[#9A5B00] border-warning/20",
    error: "bg-error-light text-error border-error/20",
    blue: "bg-primary-light text-primary border-primary/20",
    accent: "bg-primary-light text-accent border-accent/20",
  };
  return (
    <span className={cn("inline-flex items-center border px-2 py-0.5 rounded-pill text-xs font-medium", variants[variant], className)}>
      {children}
    </span>
  );
}
