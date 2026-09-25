import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SiteChrome } from "@/components/site-chrome";
import "./globals.css";

// Stand-in for Alteix Sans, whose free version is personal-use only.
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "justpaint",
  description: "A place to hang your paintings and see everyone else's.",
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
    </html>
  );
}
