import Link from "next/link";

export const metadata = {
  title: "Terms of Service | KrrishJazz",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-6">
      <h1 className="text-2xl font-semibold text-foreground">Terms of Service</h1>
      <p className="mt-4 text-sm leading-relaxed text-text-secondary">
        Listings on KrrishJazz are subject to verification. Owners agree that buyer contact is managed
        by KrrishJazz. Brokerage of one month applies only after a successful closure, as communicated
        at the time of listing.
      </p>
      <p className="mt-4 text-sm text-text-secondary">
        Questions? Call or WhatsApp support at{" "}
        <a href="tel:+919163034822" className="font-medium text-primary hover:underline">
          91630 34822
        </a>
        .
      </p>
      <Link href="/" className="mt-8 inline-block text-sm font-semibold text-primary hover:underline">
        Back to home
      </Link>
    </div>
  );
}
