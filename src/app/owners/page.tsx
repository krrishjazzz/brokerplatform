import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Headphones,
  Home,
  IndianRupee,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OwnersPageHero } from "@/components/auth/owners-page-hero";

const BENEFITS = [
  { icon: ShieldCheck, title: "Verified exposure", desc: "Listings reviewed by KrrishJazz before they reach serious buyers." },
  { icon: BadgeCheck, title: "Assisted closure", desc: "Managed callbacks and visit coordination — no spam calls." },
  {
    icon: Users,
    title: "Managed buyer matching",
    desc: "KrrishJazz routes serious enquiries and coordinates follow-ups for faster closure.",
  },
  { icon: Headphones, title: "Dedicated RM", desc: "A relationship manager helps you through enquiries and closure." },
  { icon: IndianRupee, title: "Free to list", desc: "No upfront listing fee. Service fee only on successful closure." },
  { icon: Home, title: "Full control", desc: "Edit, pause, and track your listing from your owner dashboard." },
];

const STEPS = [
  { step: "01", title: "Create your account", desc: "Register with mobile OTP in under a minute." },
  { step: "02", title: "Post property free", desc: "Add photos, pricing, locality, and availability." },
  { step: "03", title: "KrrishJazz verifies", desc: "We review details before the listing goes live." },
  { step: "04", title: "Close with support", desc: "Managed enquiries, visits, and closure assistance." },
];

const FAQ = [
  {
    q: "Does it cost anything to list?",
    a: "Listing is free. A one month service fee applies only when a deal closes successfully through KrrishJazz.",
  },
  {
    q: "Will my phone number be public?",
    a: "No. Buyers reach you through KrrishJazz-managed callbacks and WhatsApp on 91630 34822.",
  },
  {
    q: "How long does verification take?",
    a: "Most listings are reviewed within one business day after you submit complete details and photos.",
  },
  {
    q: "Can I list rent and sale?",
    a: "Yes. Choose buy, rent, or commercial intent when posting and we route enquiries accordingly.",
  },
];

export const metadata = {
  title: "List Property Free | KrrishJazz Owners",
  description: "Post your property free on KrrishJazz. Verified exposure, managed enquiries, and assisted closure in Kolkata.",
};

export default function OwnersPage() {
  return (
    <main className="bg-surface text-foreground">
      <OwnersPageHero />
      <section className="border-b border-border bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold sm:text-3xl">Why owners choose KrrishJazz</h2>
            <p className="mt-3 text-sm leading-6 text-text-secondary sm:text-base">
              Premium listing support designed for Kolkata owners who want quality leads, not random calls.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border/80 bg-surface p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-card"
              >
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
              <h2 className="text-xl font-semibold">Your listing journey</h2>
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
            <div className="rounded-2xl border border-primary/15 bg-primary-light/40 p-6">
              <h2 className="text-xl font-semibold">What you can do in the dashboard</h2>
              <ul className="mt-5 space-y-3">
                {[
                  "Post and edit residential, commercial, and plot listings",
                  "Track enquiry status and visit requests",
                  "Confirm availability and freshness",
                  "Request KrrishJazz assisted matching when you need faster closure",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2 text-sm text-foreground">
                    <BadgeCheck size={16} className="mt-0.5 shrink-0 text-success" />
                    {line}
                  </li>
                ))}
              </ul>
              <p className="mt-5 rounded-xl bg-white/80 px-3 py-2 text-xs leading-5 text-text-secondary">
                Helpline for owners: call or WhatsApp KrrishJazz at 91630 34822 for listing help.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-white py-12">
        <div className="mx-auto max-w-3xl px-4 lg:px-6">
          <h2 className="text-center text-2xl font-semibold sm:text-3xl">Owner listing flow</h2>
          <div className="mt-8 space-y-3">
            {["Add property details & photos", "KrrishJazz reviews & verifies", "Listing goes live", "Managed callbacks begin", "Close with assisted support"].map((label, index) => (
              <div key={label} className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {index + 1}
                </span>
                <span className="text-sm font-medium text-foreground">{label}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/owners#owner-auth">
              <Button size="lg">Get Started</Button>
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
            <Home className="mx-auto text-white/90" size={32} />
            <h2 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">Ready to list your property?</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/85">
              Post for free today and let KrrishJazz handle verified exposure and managed enquiries.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="#owner-auth">
                <Button size="lg" className="bg-white text-primary hover:bg-white/95">
                  Post Property Free
                </Button>
              </Link>
              <Link href="/login?intent=owner" className="inline-flex items-center gap-1 text-sm font-semibold text-white underline-offset-4 hover:underline">
                Login to manage listings <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
