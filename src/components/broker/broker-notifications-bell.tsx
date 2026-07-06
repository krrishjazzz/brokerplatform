"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useBrokerNavCounts } from "@/components/broker/broker-nav-context";

export function BrokerNotificationsBell() {
  const { counts } = useBrokerNavCounts();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const total = counts.followUps + counts.matches;

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative rounded-lg p-2 text-white/85 transition-colors hover:bg-white/10 hover:text-white"
        aria-label="Broker notifications"
      >
        <Bell size={18} />
        {total > 0 && (
          <span className="absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-white">
            {total > 99 ? "99+" : total}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-card border border-border bg-white p-3 shadow-modal">
          <p className="text-sm font-semibold text-foreground">Today&apos;s signals</p>
          <div className="mt-3 space-y-2 text-xs text-text-secondary">
            <p>
              <span className="font-semibold text-accent">{counts.matches}</span> hot matches across inventory
            </p>
            <p>
              <span className="font-semibold text-warning">{counts.followUps}</span> listings need follow-up
            </p>
          </div>
          <div className="mt-3 grid gap-2">
            <Link
              href="/broker/matches"
              onClick={() => setOpen(false)}
              className="rounded-btn bg-primary px-3 py-2 text-center text-xs font-semibold text-white"
            >
              Open match desk
            </Link>
            <Link
              href="/broker/properties"
              onClick={() => setOpen(false)}
              className="rounded-btn border border-border px-3 py-2 text-center text-xs font-semibold text-foreground"
            >
              Review inventory
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
