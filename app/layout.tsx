import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SiteChrome } from "@/components/site-chrome";
import { getSiteUrl } from "@/lib/site-url";
import { SITE_DESCRIPTION } from "@/lib/seo";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteChrome header={<Navbar />} footer={<Footer />}>
          {children}
        </SiteChrome>
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
