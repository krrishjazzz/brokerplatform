"use client";

import { Button } from "@/components/ui/button";

type PaginationBarProps = {
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  className?: string;
};

export function PaginationBar({ page, totalPages, onPrevious, onNext, className }: PaginationBarProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={className ?? "mt-6 flex items-center justify-center gap-3"}>
      <Button variant="ghost" size="sm" disabled={page <= 1} onClick={onPrevious}>
        Previous
      </Button>
      <span className="text-sm text-text-secondary">
        Page {page} of {totalPages}
      </span>
      <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={onNext}>
        Next
      </Button>
    </div>
  );
}
