import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ToastProvider } from "@/components/ui/toast";
import { BrokerageTrustBar } from "@/components/brokerage-trust-bar";
import { KrrishJazzAssistant } from "@/components/krrishjazz-assistant";

export const metadata: Metadata = {
  title: "KrrishJazz - Free Property Listings and Managed Closures",
  description: "Search, post, and close property deals with free owner listings, managed callbacks, and brokerage only after successful closure.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <BrokerageTrustBar />
            <main className="flex-1">{children}</main>
            <KrrishJazzAssistant />
            <Footer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
