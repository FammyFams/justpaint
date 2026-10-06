import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SiteChrome } from "@/components/site-chrome";
import { getSiteUrl } from "@/lib/site-url";
import { SITE_DESCRIPTION } from "@/lib/seo";
import { ViewerProvider } from "@/components/viewer";
import { SESSION_COOKIE_PATTERN } from "@/lib/session-cookie";
import "./globals.css";

// Stand-in for Alteix Sans, whose free version is personal-use only.
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  // Turns relative canonical/Open Graph URLs into absolute ones.
  metadataBase: new URL(getSiteUrl()),
  title: "justpaint",
  description: SITE_DESCRIPTION,
  applicationName: "justpaint",
  keywords: [
    "beginner painting",
    "painting for beginners",
    "beginner painting community",
    "share my painting",
    "beginner watercolor",
    "beginner acrylic painting",
    "easy painting ideas",
    "daily painting",
  ],
  // Pages that set their own openGraph replace this whole object, so they
  // repeat siteName. No url here: each page would otherwise claim the home URL.
  openGraph: {
    siteName: "justpaint",
    title: "justpaint | A Painting Community for Beginners",
    description: SITE_DESCRIPTION,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "justpaint | A Painting Community for Beginners",
    description: SITE_DESCRIPTION,
  },
};

// Runs before the first paint: a browser holding a login or admin cookie
// gets data-session, so CSS hides "log in" and the like until the account
// loads (components/viewer.tsx). Pages are cached and the same for everyone,
// so the server can't decide this.
const sessionScript = `try{if(new RegExp(${JSON.stringify(SESSION_COOKIE_PATTERN)}).test(document.cookie))document.documentElement.setAttribute("data-session","")}catch(e){}`;

// Nothing here reads cookies, so every page can be cached instead of built
// per visit (Vercel's free plan includes 4 hours of server CPU a month).
// The per-visitor parts load in the browser through ViewerProvider.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} h-full antialiased`}
      // The head script adds data-session before React loads.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: sessionScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ViewerProvider>
          <SiteChrome header={<Navbar />} footer={<Footer />}>
            {children}
          </SiteChrome>
        </ViewerProvider>
        <Toaster position="bottom-right" />
      </body>
      {/* Production only, so local dev visits don't count as traffic.
          Disclosed on the privacy page. */}
      {process.env.NODE_ENV === "production" && (
        <GoogleAnalytics gaId="G-K5E7GDQSHM" />
      )}
    </html>
  );
}
