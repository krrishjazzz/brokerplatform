import Link from "next/link";
import { Globe, MessageCircle, Camera, Briefcase } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-foreground text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold text-white mb-4">KrishJazz</h3>
            <p className="text-sm text-gray-400 mb-4">
              India&apos;s trusted real estate platform. Find your dream property with verified listings from owners and brokers.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 bg-white/10 rounded-btn hover:bg-white/20 transition-colors">
                <Globe size={16} />
              </a>
              <a href="#" className="p-2 bg-white/10 rounded-btn hover:bg-white/20 transition-colors">
                <MessageCircle size={16} />
              </a>
              <a href="#" className="p-2 bg-white/10 rounded-btn hover:bg-white/20 transition-colors">
                <Camera size={16} />
              </a>
              <a href="#" className="p-2 bg-white/10 rounded-btn hover:bg-white/20 transition-colors">
                <Briefcase size={16} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide mb-4">Properties</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/properties?listingType=BUY" className="hover:text-white transition-colors">Buy</Link></li>
              <li><Link href="/properties?listingType=RENT" className="hover:text-white transition-colors">Rent</Link></li>
              <li><Link href="/properties?category=COMMERCIAL" className="hover:text-white transition-colors">Commercial</Link></li>
              <li><Link href="/properties?propertyType=Plot" className="hover:text-white transition-colors">Plots / Land</Link></li>
              <li><Link href="/properties?listingType=RESALE" className="hover:text-white transition-colors">Resale</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide mb-4">Top Cities</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/properties?city=Mumbai" className="hover:text-white transition-colors">Mumbai</Link></li>
              <li><Link href="/properties?city=Delhi" className="hover:text-white transition-colors">Delhi</Link></li>
              <li><Link href="/properties?city=Bangalore" className="hover:text-white transition-colors">Bangalore</Link></li>
              <li><Link href="/properties?city=Hyderabad" className="hover:text-white transition-colors">Hyderabad</Link></li>
              <li><Link href="/properties?city=Pune" className="hover:text-white transition-colors">Pune</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Email: support@krishjazz.com</li>
              <li>Phone: +91 98765 43210</li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} KrishJazz. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
