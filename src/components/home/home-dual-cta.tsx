import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BadgeCheck, Briefcase, Check, Home, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HomeDualCta() {
  return (
    <section className="bg-surface py-12 lg:py-14">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 lg:grid-cols-2 lg:px-6">
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-card">
          <div className="grid sm:grid-cols-[1fr_200px]">
            <div className="p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-wide text-primary">For Owners</p>
              <h2 className="mt-2 text-2xl font-bold text-foreground">List your property with us</h2>
              <ul className="mt-4 space-y-2">
                {["Free Listing", "Verified Exposure", "Assisted Closure"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Check size={16} className="shrink-0 text-success" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/owners" className="mt-6 inline-block">
                <Button variant="accent" className="gap-2">
                  <PlusCircle size={18} />
                  Post Your Property
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
            <div className="relative hidden min-h-[200px] sm:block">
              <Image
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500&h=600&fit=crop"
                alt=""
                fill
                className="object-cover"
                sizes="200px"
              />
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-primary-dark shadow-lift">
          <div className="grid sm:grid-cols-[1fr_200px]">
            <div className="p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-wide text-white/70">Broker Network</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Join the KrrishJazz Broker Network</h2>
              <ul className="mt-4 space-y-2">
                {["Quality Leads", "No Spam", "Higher Conversions"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm font-medium text-white/90">
                    <BadgeCheck size={16} className="shrink-0 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/brokers" className="mt-6 inline-block">
                <Button className="gap-2 bg-white text-primary hover:bg-white/95">
                  <Briefcase size={18} />
                  Join Now
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
            <div className="relative hidden min-h-[200px] items-center justify-center bg-white/5 sm:flex">
              <Home size={64} className="text-white/20" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
