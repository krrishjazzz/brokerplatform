import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | KrrishJazz",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-6">
      <h1 className="text-2xl font-semibold text-foreground">Privacy Policy</h1>
      <p className="mt-4 text-sm leading-relaxed text-text-secondary">
        KrrishJazz uses your contact details to coordinate property enquiries, visits, and closures.
        We do not publish owner phone numbers on public listings. Data is shared with our relationship
        managers only as needed to complete a transaction you initiated.
      </p>
      <p className="mt-4 text-sm text-text-secondary">
        For privacy requests, email{" "}
        <a href="mailto:support@krrishjazz.com" className="font-medium text-primary hover:underline">
          support@krrishjazz.com
        </a>
        .
      </p>
      <Link href="/" className="mt-8 inline-block text-sm font-semibold text-primary hover:underline">
        Back to home
      </Link>
    </div>
  );
}
