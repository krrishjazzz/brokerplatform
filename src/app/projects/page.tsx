import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectsPreview } from "@/components/projects/projects-preview";

export const metadata = {
  title: "Projects in Kolkata | KrrishJazz",
  description: "Browse residential and commercial projects in Kolkata with KrrishJazz-managed callbacks.",
};

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-surface">
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 lg:px-6 lg:py-14">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary">
            <LayoutGrid size={22} />
          </div>
          <h1 className="mt-5 text-3xl font-bold text-foreground lg:text-4xl">New projects in Kolkata</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary lg:text-base">
            Explore builder and society projects with verified photos, pricing signals, and KrrishJazz-managed visits.
            Call or WhatsApp <strong className="text-foreground">91630 34822</strong> for floor plans and possession updates.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/properties?q=project&listingType=BUY">
              <Button variant="accent">Browse all projects</Button>
            </Link>
            <Link href="/properties?listingType=BUY">
              <Button variant="outline">View all buy listings</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 lg:px-6">
        <ProjectsPreview />
      </section>
    </main>
  );
}
