import Link from "next/link";

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
            <p className="text-sm font-semibold text-foreground">Trusted property search with managed support.</p>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wide text-foreground">Explore by Need</h4>
            <ul className="space-y-2">
              <li><Link href="/properties?intent=buy" className={linkClass}>Buy Home</Link></li>
              <li><Link href="/properties?intent=rent" className={linkClass}>Rent Home</Link></li>
              <li><Link href="/properties?intent=commercial" className={linkClass}>Commercial Space</Link></li>
              <li><Link href="/properties?intent=land" className={linkClass}>Plots / Land</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wide text-foreground">Explore by City</h4>
            <ul className="space-y-2">
              {["Kolkata", "Mumbai", "Delhi", "Bengaluru"].map((city) => (
                <li key={city}>
                  <Link href={`/properties?intent=discover&city=${encodeURIComponent(city)}`} className={linkClass}>{city}</Link>
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
              <li><Link href="/login?as=broker" className={linkClass}>For Brokers</Link></li>
              <li className="text-sm text-text-secondary">Brokerage: one month on closure</li>
              <li><Link href="/login" className={linkClass}>Login / Register</Link></li>
              <li><Link href="/properties?intent=discover" className={linkClass}>Search Properties</Link></li>
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
