import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div className={cn("bg-white rounded-card border border-border shadow-card", className)} onClick={onClick}>
      {children}
    </div>
  );
}
