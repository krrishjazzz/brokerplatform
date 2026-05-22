"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";
import { KrrishJazzAssistant } from "@/components/krrishjazz-assistant";
import { isDashboardWorkspacePath } from "@/lib/dashboard-paths";

/** Global footer and assistant — hidden on app workspace routes. */
export function LayoutChrome() {
  const pathname = usePathname() ?? "";
  if (isDashboardWorkspacePath(pathname)) {
    return null;
  }

  return (
    <>
      <KrrishJazzAssistant />
      <Footer />
    </>
  );
}
