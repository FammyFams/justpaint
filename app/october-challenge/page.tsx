import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { cn } from "@/lib/utils";
import { DownloadCalendarButton, ShareCalendarButton } from "@/components/share-calendar-button";
import { buttonVariants } from "@/components/ui/button";
import { getSiteUrl } from "@/lib/site-url";
import {
  CHALLENGE_NAME,
  FIRST_WEEKDAY,
  PROMPTS,
  RULES,
  WEEKDAYS,
  octoberDay,
} from "@/lib/october-challenge";

const TITLE = `${CHALLENGE_NAME} | justpaint`;
const DESCRIPTION =
  "The October Painting Challenge 2026, free for beginners: 31 daily prompts, from a cow and a pumpkin to candy corn and Halloween. Paint one a day and share it on justpaint.";

// The share image comes from ./opengraph-image.tsx, which Next adds to
// openGraph and twitter automatically.
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "October painting challenge",
    "daily painting prompts",
    "October art prompts",
    "painting challenge for beginners",
    "watercolor challenge",
    "Halloween painting ideas",
  ],
  alternates: { canonical: "/october-challenge" },
  openGraph: {
    title: CHALLENGE_NAME,
    description: DESCRIPTION,
    url: "/october-challenge",
    siteName: "justpaint",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: CHALLENGE_NAME,
    description: DESCRIPTION,
  },
};

const LINK = "font-medium text-primary underline underline-offset-2 hover:decoration-2";

export default async function OctoberChallengePage() {
  // Rendered per visit so today's prompt stays current.
  await connection();
  const today = octoberDay();
  const pageUrl = `${getSiteUrl()}/october-challenge`;

  // Tells search engines this is a free, online, month-long event.
  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: CHALLENGE_NAME,
    description: DESCRIPTION,
    startDate: "2026-10-01T00:00:00-07:00",
    endDate: "2026-10-31T23:59:00-07:00",
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    location: { "@type": "VirtualLocation", url: pageUrl },
    image: [`${pageUrl}/opengraph-image`],
    isAccessibleForFree: true,
    organizer: { "@type": "Organization", name: "justpaint", url: getSiteUrl() },
    performer: { "@type": "Organization", name: "justpaint", url: getSiteUrl() },
    offers: {
      "@type": "Offer",
      price: 0,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: pageUrl,
      validFrom: "2026-09-27",
    },
    url: pageUrl,
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <script
        type="application/ld+json"
        // Static data built above, so no user input ends up in the script.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd).replace(/</g, "\\u003c") }}
      />
      <h1 className="font-heading text-4xl italic leading-tight sm:text-5xl">
        {CHALLENGE_NAME}
      </h1>
      <p className="mt-3 text-muted-foreground">
        One prompt a day, all month long. Paint along with everyone.
      </p>

      {today && (
        <div className="mt-8 rounded-sm bg-primary px-5 py-5 text-primary-foreground sm:px-6">
          <p className="text-xs tracking-wide uppercase opacity-80">
            Today&rsquo;s prompt, day {today}
          </p>
          <p className="mt-1 font-heading text-3xl italic leading-tight">
            {PROMPTS[today - 1]}
          </p>
          <Link
            href="/upload"
            className="mt-4 inline-block rounded-full bg-primary-foreground px-4 py-2 text-sm font-medium text-primary"
          >
            Post yours
          </Link>
        </div>
      )}

      <section className="mt-10">
        <h2 className="mb-3 font-heading text-xl">Rules</h2>
        <ol className="list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-foreground/90">
          {RULES.map((rule) => {
            // Any mention of the site links to the upload page.
            const [before, after] = rule.split("justpaint.art");
            return (
              <li key={rule}>
                {after === undefined ? (
                  rule
                ) : (
                  <>
                    {before}
                    <Link href="/upload" className={LINK}>
                      justpaint.art
                    </Link>
                    {after}
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mt-10">
        <h2 className="mb-3 font-heading text-xl">Daily prompts</h2>
        {/* Phones: seven columns of text don't fit, so show the calendar as
            a picture (./calendar.png) that opens full size to zoom or save. */}
        <a href="/october-challenge/calendar.png" target="_blank" className="block sm:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element -- already a sized PNG */}
          <img
            src="/october-challenge/calendar.png"
            alt={`${CHALLENGE_NAME} calendar: ${PROMPTS.map((p, i) => `day ${i + 1}, ${p}`).join("; ")}`}
            width={1080}
            height={1350}
            loading="lazy"
            className="h-auto w-full rounded-sm border border-border/70"
          />
          <span className="mt-2 block text-center text-xs text-muted-foreground">
            Tap the calendar to open it full size.
          </span>
        </a>

        {/* Desktop: same look as the picture. Thick rules between weeks,
            hairlines between days, big day numbers, prompts on one baseline. */}
        <div className="hidden sm:block">
          <div className="grid grid-cols-7 border-b-4 border-foreground">
            {WEEKDAYS.map((d) => (
              <div key={d} className="px-2.5 pb-1.5 text-xs font-extrabold tracking-wider uppercase">
                {d}
              </div>
            ))}
          </div>
          <ol className="grid grid-cols-7 [&>li]:border-b-2 [&>li]:border-b-foreground">
            <li
              className="flex flex-col justify-end border-r-2 border-foreground px-2.5 pb-3"
              style={{ gridColumn: `span ${FIRST_WEEKDAY}` }}
            >
              <span className="text-2xl leading-tight font-extrabold tracking-tight">
                31 prompts.
              </span>
              <span className="text-2xl leading-tight font-extrabold tracking-tight text-muted-foreground">
                One painting a day.
              </span>
            </li>
            {PROMPTS.map((prompt, i) => {
              const day = i + 1;
              const isToday = day === today;
              const halloween = day === PROMPTS.length;
              const weekday = (FIRST_WEEKDAY + i) % 7;
              return (
                <li
                  key={day}
                  aria-current={isToday ? "date" : undefined}
                  className={cn(
                    "flex min-h-28 flex-col px-2.5 pt-2 pb-2.5",
                    // Hairline between days; Sundays start a row and day 1
                    // sits next to the intro cell's thick rule.
                    weekday !== 0 && day !== 1 && "border-l border-foreground/15",
                    halloween && "bg-[#e28413] text-[#000022]",
                    isToday && "bg-primary text-primary-foreground"
                  )}
                >
                  <span className="text-4xl leading-none font-extrabold tracking-tighter tabular-nums">
                    {day}
                  </span>
                  <span className="mt-auto pt-2 text-sm leading-tight font-bold">
                    {prompt}
                    {isToday && <span className="sr-only"> (today)</span>}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <ShareCalendarButton className={cn(buttonVariants(), "cursor-pointer")} />
          <DownloadCalendarButton className={buttonVariants({ variant: "outline" })} />
        </div>
      </section>

      <section className="mt-10 text-sm leading-relaxed text-foreground/90">
        <h2 className="mb-2 font-heading text-xl">How to enter</h2>
        <p>
          When you{" "}
          <Link href="/upload" className={LINK}>
            post a painting
          </Link>
          , tick &ldquo;This is part of the {CHALLENGE_NAME}&rdquo; and pick the
          day&rsquo;s prompt. You can see every entry, grouped by day, by picking{" "}
          <Link
            href="/?challenge=october"
            className={LINK}
          >
            October Challenge 2026
          </Link>{" "}
          on the home page.
        </p>
      </section>
    </main>
  );
}
