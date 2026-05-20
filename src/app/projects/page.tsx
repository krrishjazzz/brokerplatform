import { redirect } from "next/navigation";

/** Projects live under Buy / Commercial filters — legacy URL redirect. */
export default function ProjectsPage() {
  redirect("/properties?listingType=BUY&q=project");
}
