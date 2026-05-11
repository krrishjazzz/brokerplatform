"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bot,
  Building2,
  Home,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

const HIDDEN_PREFIXES = ["/admin"];

export function KrrishJazzAssistant() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  if (HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return null;

  const actions = [
    {
      label: "Find Property",
      detail: "Search homes, offices, plots and shops.",
      icon: <Search size={16} />,
      onClick: () => router.push("/properties"),
    },
    {
      label: "Post Free Listing",
      detail: "Owners can list without upfront charges.",
      icon: <Home size={16} />,
      onClick: () => router.push("/dashboard?tab=post"),
    },
    {
      label: "Request Callback",
      detail: "Let KrrishJazz coordinate the next step.",
      icon: <Phone size={16} />,
      onClick: () => {
        router.push(pathname.startsWith("/properties/") ? `${pathname}#enquire` : "/properties");
        toast("Open a property and request a callback from the contact card.", "info");
      },
    },
    {
      label: "Broker Help",
      detail: "Open demand and inventory workbench.",
      icon: <Building2 size={16} />,
      onClick: () => router.push("/broker/properties"),
    },
    {
      label: "Complaint / Feedback",
      detail: "Share an issue with the support team.",
      icon: <MessageCircle size={16} />,
      onClick: () => toast("Feedback noted. Add a support form next so users can submit details.", "info"),
    },
  ];

  return (
    <div className="fixed bottom-20 right-4 z-[70] lg:bottom-5">
      {open && (
        <div className="mb-3 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-card border border-border bg-white shadow-modal">
          <div className="bg-primary p-4 text-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-pill border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/85">
                  <Bot size={14} />
                  KrrishJazz Assistant
                </div>
                <p className="text-lg font-bold">How can we help?</p>
                <p className="mt-1 text-xs leading-5 text-white/75">Free listings, managed callbacks, and brokerage only after successful closure.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-btn p-1 text-white/80 hover:bg-white/10" aria-label="Close assistant">
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="space-y-2 p-3">
            {actions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => {
                  action.onClick();
                  setOpen(false);
                }}
                className="flex w-full items-start gap-3 rounded-btn border border-border bg-surface p-3 text-left transition-colors hover:border-primary/30 hover:bg-primary-light"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-sm">{action.icon}</span>
                <span>
                  <span className="block text-sm font-semibold text-foreground">{action.label}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-text-secondary">{action.detail}</span>
                </span>
              </button>
            ))}
          </div>

          <div className="border-t border-border bg-white p-3">
            <div className="rounded-card border border-primary/20 bg-primary-light p-3">
              <p className="flex items-center gap-2 text-xs font-semibold text-primary">
                <ShieldCheck size={14} />
                Transparent terms
              </p>
              <p className="mt-1 text-xs leading-5 text-text-secondary">Owners post free. KrrishJazz charges one month brokerage only when the deal closes.</p>
            </div>
          </div>
        </div>
      )}

      <Button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="h-14 w-14 rounded-full p-0 shadow-modal"
        aria-label="Open KrrishJazz assistant"
      >
        {open ? <X size={22} /> : <Bot size={24} />}
      </Button>
    </div>
  );
}
