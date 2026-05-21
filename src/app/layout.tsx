import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { LoginPopupProvider } from "@/lib/login-popup-context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ToastProvider } from "@/components/ui/toast";
import { KrrishJazzAssistant } from "@/components/krrishjazz-assistant";
import { PropertySearchNavbarProvider } from "@/lib/property-search-navbar-context";

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
            <LoginPopupProvider>
              <PropertySearchNavbarProvider>
                <Suspense fallback={<div className="h-16 bg-primary-dark" />}>
                  <Navbar />
                </Suspense>
                <main className="flex-1">{children}</main>
              </PropertySearchNavbarProvider>
              <KrrishJazzAssistant />
              <Footer />
            </LoginPopupProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
