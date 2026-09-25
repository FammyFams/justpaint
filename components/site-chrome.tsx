"use client";

import { usePathname } from "next/navigation";

// Pages that render standalone, without the site header and footer.
const BARE_PATHS = ["/links"];

export function SiteChrome({
  header,
  footer,
  children,
}: {
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const bare = BARE_PATHS.includes(usePathname());
  return (
    <>
      {!bare && header}
      <div className="flex-1">{children}</div>
      {!bare && footer}
    </>
  );
}
