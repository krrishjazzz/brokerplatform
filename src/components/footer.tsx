import Link from "next/link";
import { Globe, Mail, MapPin, Phone, Share2, Users } from "lucide-react";
import { formatPlatformPhoneDisplay, PLATFORM_PHONE } from "@/lib/platform";

export function Footer() {
  const linkClass = "text-sm text-white/75 transition-colors hover:text-white";

  return (
    <footer className="bg-primary-dark text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-white">KrrishJazz</h3>
            <p className="mt-3 max-w-sm text-sm leading-6 text-white/75">
              Premium property discovery with verified listings, managed callbacks, and brokerage only on successful closure.
            </p>
            <div className="mt-4 flex items-center gap-3">
              {[Share2, Globe, Users, Mail].map((Icon, index) => (
                <span
                  key={index}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20"
                  aria-hidden
                >
                  <Icon size={16} />
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wide text-white">Explore</h4>
            <ul className="space-y-2.5">
              <li><Link href="/properties?listingType=BUY" className={linkClass}>Buy</Link></li>
              <li><Link href="/properties?listingType=RENT" className={linkClass}>Rent</Link></li>
              <li><Link href="/properties?category=COMMERCIAL" className={linkClass}>Commercial</Link></li>
              <li><Link href="/owners" className={linkClass}>Owners</Link></li>
              <li><Link href="/brokers" className={linkClass}>Brokers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wide text-white">Company</h4>
            <ul className="space-y-2.5">
              <li><Link href="/properties?verified=true" className={linkClass}>About Us</Link></li>
              <li><Link href="/owners" className={linkClass}>For Owners</Link></li>
              <li><Link href="/brokers" className={linkClass}>Broker Network</Link></li>
              <li><Link href="/login?as=broker" className={linkClass}>Broker Login</Link></li>
              <li><Link href="/owners" className={linkClass}>List Property</Link></li>
              <li><Link href="/properties" className={linkClass}>Careers</Link></li>
              <li><Link href="/properties" className={linkClass}>Blog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wide text-white">Support</h4>
            <ul className="space-y-2.5">
              <li><Link href="/properties" className={linkClass}>Help Center</Link></li>
              <li><Link href="/properties" className={linkClass}>Privacy Policy</Link></li>
              <li><Link href="/properties" className={linkClass}>Terms of Service</Link></li>
              <li><Link href="/login" className={linkClass}>Login / Register</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/15 pt-8">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-white">Get in Touch</h4>
          <ul className="space-y-3 text-sm text-white/80">
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-primary-light" />
              <span>Salt Lake, Sector V, Kolkata, West Bengal 700091</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} className="shrink-0 text-primary-light" />
              <a href={`tel:+91${PLATFORM_PHONE}`} className="hover:text-white">
                {formatPlatformPhoneDisplay()}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="shrink-0 text-primary-light" />
              <span>support@krrishjazz.com</span>
            </li>
          </ul>
        </div>

        <div className="mt-8 border-t border-white/15 pt-6 text-center text-sm text-white/60">
          &copy; {new Date().getFullYear()} KrrishJazz. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
