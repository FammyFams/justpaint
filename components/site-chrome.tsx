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
      {/* First thing a keyboard visitor reaches; hidden until focused. */}
      {!bare && (
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-sm focus:bg-card focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-md focus:outline-2 focus:outline-foreground"
        >
          Skip to content
        </a>
      )}
      {!bare && header}
      <div id="content" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </div>
      {!bare && footer}
    </>
  );
}
