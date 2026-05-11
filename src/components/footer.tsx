import Link from "next/link";
import { Briefcase, Camera, Globe, MessageCircle } from "lucide-react";

export function Footer() {
  const linkClass = "text-sm text-text-secondary transition-colors hover:text-primary";

  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-3 text-xl font-bold text-primary">KrrishJazz</h3>
            <p className="mb-4 text-sm leading-6 text-text-secondary">
              Free owner listings, managed callbacks, and KrrishJazz-assisted closures with brokerage only after a successful deal.
            </p>
            <div className="flex gap-2">
              {[Globe, MessageCircle, Camera, Briefcase].map((Icon, index) => (
                <a key={index} href="#" className="flex h-9 w-9 items-center justify-center rounded-btn border border-border bg-surface text-primary hover:bg-primary-light">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wide text-foreground">Properties</h4>
            <ul className="space-y-2">
              <li><Link href="/properties?listingType=BUY" className={linkClass}>Buy</Link></li>
              <li><Link href="/properties?listingType=RENT" className={linkClass}>Rent</Link></li>
              <li><Link href="/properties?category=COMMERCIAL" className={linkClass}>Commercial</Link></li>
              <li><Link href="/properties?propertyType=Residential%20Plot" className={linkClass}>Plots / Land</Link></li>
              <li><Link href="/properties?listingType=RESALE" className={linkClass}>Resale</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wide text-foreground">Top Cities</h4>
            <ul className="space-y-2">
              {["Kolkata", "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Pune"].map((city) => (
                <li key={city}>
                  <Link href={`/properties?city=${encodeURIComponent(city)}`} className={linkClass}>{city}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wide text-foreground">Support</h4>
            <ul className="space-y-2">
              <li className="text-sm text-text-secondary">support@krrishjazz.com</li>
              <li className="text-sm text-text-secondary">+91 98765 43210</li>
              <li><Link href="/dashboard?tab=post" className={linkClass}>Post Property</Link></li>
              <li className="text-sm text-text-secondary">Brokerage: one month on closure</li>
              <li><Link href="/login" className={linkClass}>Login / Register</Link></li>
              <li><Link href="/properties" className={linkClass}>Search Properties</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-sm text-text-secondary">
          &copy; {new Date().getFullYear()} KrrishJazz. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
