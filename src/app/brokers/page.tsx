import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Building2,
  ClipboardList,
  Headphones,
  IndianRupee,
  Layers,
  MessageSquare,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrokersPageHero } from "@/components/auth/brokers-page-hero";
import { BrokersAuthPanel } from "@/components/brokers/brokers-auth-panel";

const BENEFITS = [
  { icon: ShieldCheck, title: "Verified leads", desc: "Curated buyer and tenant demand — not open-market spam." },
  { icon: ClipboardList, title: "Post requirements", desc: "Capture live requirements and match against inventory." },
  { icon: Layers, title: "Inventory management", desc: "Organise listings, freshness, and broker-assigned stock." },
  { icon: BadgeCheck, title: "Managed closures", desc: "Closure-first workflow with KrrishJazz coordination." },
  { icon: Headphones, title: "RM support", desc: "Dedicated relationship manager for onboarding and deals." },
  { icon: IndianRupee, title: "Commission tracking", desc: "Track brokerage milestones and closure payouts clearly." },
  { icon: Users, title: "Verified network badge", desc: "Stand out with a trusted KrrishJazz broker identity." },
];

const STEPS = [
  { step: "01", title: "Apply online", desc: "Share RERA and profile details in minutes." },
  { step: "02", title: "Get verified", desc: "KrrishJazz reviews credentials within 1 business day." },
  { step: "03", title: "Access dashboard", desc: "Requirements, inventory, leads, and RM support unlock." },
  { step: "04", title: "Close with confidence", desc: "Managed callbacks and commission tracking on closure." },
];

const FAQ = [
  {
    q: "Is there a fee to join the broker network?",
    a: "Application is free. Brokerage is aligned to successful closures through the KrrishJazz workflow.",
  },
  {
    q: "Who can see my inventory?",
    a: "Your broker tools are private to approved network members. Customer-facing pages stay clean — no public broker marketplace cards.",
  },
  {
    q: "How fast is approval?",
    a: "Most applications are reviewed within one business day after document verification.",
  },
  {
    q: "Can I post requirements for buyers?",
    a: "Yes. Post and manage requirements, then match against verified inventory from the network.",
  },
];

export default function BrokersPage() {
  return (
    <main className="bg-surface text-foreground">
      <BrokersPageHero />
      <BrokersAuthPanel />

      <section className="border-b border-border bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold sm:text-3xl">Everything you need to operate at scale</h2>
            <p className="mt-3 text-sm leading-6 text-text-secondary sm:text-base">
              Premium tools designed for brokers who value quality conversations and clean closures.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {BENEFITS.map((item) => (
              <div key={item.title} className="rounded-2xl border border-border/80 bg-surface p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-card">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary">
                  <item.icon size={20} />
                </span>
                <p className="mt-4 text-sm font-semibold text-foreground">{item.title}</p>
                <p className="mt-2 text-xs leading-5 text-text-secondary">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-white p-6 shadow-card">
              <div className="flex items-center gap-2">
                <BarChart3 className="text-primary" size={20} />
                <h2 className="text-xl font-semibold">Broker dashboard preview</h2>
              </div>
              <p className="mt-2 text-sm text-text-secondary">Private workspace — not shown on the public customer homepage.</p>
              <ul className="mt-5 space-y-3">
                {["Requirement board with locality & budget filters", "Inventory freshness and assignment view", "Lead pipeline with managed callback status", "Commission tracker tied to closure milestones"].map((line) => (
                  <li key={line} className="flex items-start gap-2 text-sm text-foreground">
                    <BadgeCheck size={16} className="mt-0.5 shrink-0 text-success" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-primary/15 bg-primary-light/40 p-6">
              <div className="flex items-center gap-2">
                <MessageSquare className="text-primary" size={20} />
                <h2 className="text-xl font-semibold">How it works</h2>
              </div>
              <ol className="mt-6 space-y-5">
                {STEPS.map((item) => (
                  <li key={item.step} className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
                      {item.step}
                    </span>
                    <div>
                      <p className="font-semibold text-foreground">{item.title}</p>
                      <p className="mt-1 text-sm text-text-secondary">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-white py-12">
        <div className="mx-auto max-w-3xl px-4 lg:px-6">
          <h2 className="text-center text-2xl font-semibold sm:text-3xl">Broker onboarding flow</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-text-secondary">
            A clear, premium path from application to your first verified lead.
          </p>
          <div className="mt-8 space-y-3">
            {["Submit application & RERA details", "Profile & document verification", "Network approval & dashboard access", "Start matching requirements & inventory", "RM-assisted closure & commission tracking"].map((label, index) => (
              <div key={label} className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">{index + 1}</span>
                <span className="text-sm font-medium text-foreground">{label}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/brokers#broker-auth">
              <Button size="lg">Start Application</Button>
            </Link>
            <Link href="/brokers" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              Questions? Talk to our team <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-3xl px-4 lg:px-6">
          <h2 className="text-center text-2xl font-semibold">Frequently asked questions</h2>
          <div className="mt-8 space-y-3">
            {FAQ.map((item) => (
              <details key={item.q} className="group rounded-xl border border-border bg-white p-4 shadow-sm open:border-primary/25 open:shadow-card">
                <summary className="cursor-pointer list-none text-sm font-semibold text-foreground marker:content-none">
                  {item.q}
                </summary>
                <p className="mt-3 text-sm leading-6 text-text-secondary">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-14">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="overflow-hidden rounded-2xl bg-primary-dark p-8 text-center shadow-lift sm:p-10">
            <Building2 className="mx-auto text-white/90" size={32} />
            <h2 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">Ready to join the network?</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/85">
              Apply today and get access to verified demand, inventory tools, and managed closures — without public marketplace clutter.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/brokers#broker-auth">
                <Button size="lg" className="bg-white text-primary hover:bg-white/95">
                  Register as Broker
                </Button>
              </Link>
              <Link href="/brokers#broker-auth" className="inline-flex items-center gap-1 text-sm font-semibold text-white underline-offset-4 hover:underline">
                Already approved? Login <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
