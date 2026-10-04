import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { cn } from "@/lib/utils";
import { DownloadCalendarButton, ShareCalendarButton } from "@/components/share-calendar-button";
import { PaintingGrid } from "@/components/painting-grid";
import { buttonVariants } from "@/components/ui/button";
import { getSessionUserId } from "@/lib/current-user";
import { getHeartedIds } from "@/lib/hearts";
import { getFeed } from "@/lib/paintings";
import { getSiteUrl } from "@/lib/site-url";
import {
  CHALLENGE_NAME,
  FIRST_WEEKDAY,
  HASHTAG,
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

// Newest entries shown at the bottom; the rest are on the home page's tab.
const LATEST_COUNT = 6;

// Questions people search for, answered in plain words.
const ABOUT = [
  {
    q: "Who is it for?",
    a: "Anyone who wants to paint more. It's made for beginners, so nothing has to be perfect. A quick ten minute painting counts.",
  },
  {
    q: "What paints can I use?",
    a: "Anything you have: watercolor, gouache, acrylic, oil, or a mix. Pencils and markers are welcome too.",
  },
  {
    q: "Do I have to do all 31?",
    a: "No. Skip days, catch up later, or only paint the prompts you like.",
  },
  {
    q: "Do I need an account?",
    a: "No. You can post with just a name. An account gives you your own page with all your paintings.",
  },
  {
    q: "Where do I share it?",
    a: `Post it on justpaint, where everyone painting along can see it. On Instagram or TikTok, add ${HASHTAG} so others can find it.`,
  },
];

export default async function OctoberChallengePage() {
  // Rendered per visit so today's prompt and the latest entries stay current.
  await connection();
  const today = octoberDay();
  const pageUrl = `${getSiteUrl()}/october-challenge`;

  const [{ paintings: latest }, userId] = await Promise.all([
    getFeed({ octoberChallenge: true, limit: LATEST_COUNT }),
    getSessionUserId(),
  ]);
  const heartedIds = userId
    ? await getHeartedIds(userId, latest.map((p) => p.id))
    : undefined;

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
        <div className="mt-8 flex flex-wrap items-end justify-between gap-4 rounded-sm border border-border/70 bg-card px-5 py-5 shadow-[0_1px_2px_rgba(0,0,34,0.06)] sm:px-6">
          <div>
            <p className="text-xs font-semibold tracking-widest text-primary uppercase">
              Today&rsquo;s prompt, day {today}
            </p>
            <p className="mt-1 font-heading text-3xl italic leading-tight text-foreground">
              {PROMPTS[today - 1]}
            </p>
          </div>
          {/* Circled by hand, like circling something on paper. */}
          <Link
            href="/upload"
            className="group relative inline-block px-4 py-2 text-base font-semibold text-foreground"
          >
            <svg
              aria-hidden
              viewBox="0 0 160 50"
              preserveAspectRatio="none"
              className="absolute -inset-x-1 -inset-y-1 h-[calc(100%+0.5rem)] w-[calc(100%+0.5rem)] text-primary transition-transform duration-200 group-hover:-rotate-2"
            >
              <path
                d="M30 8 C 70 0, 140 4, 152 20 C 160 36, 110 46, 70 44 C 25 42, 4 34, 8 22 C 12 10, 50 4, 95 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <span className="relative">post yours</span>
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
        {/* The picture's text is tiny on a phone, so the prompts are also a
            plain list: days 1-16 down the left, 17-31 down the right. */}
        <ol className="mt-5 grid grid-flow-col grid-cols-2 grid-rows-[repeat(16,auto)] gap-x-6 text-sm sm:hidden">
          {PROMPTS.map((prompt, i) => {
            const day = i + 1;
            const isToday = day === today;
            return (
              <li
                key={day}
                aria-current={isToday ? "date" : undefined}
                className="flex gap-2.5 border-b border-border/70 py-1.5"
              >
                <span
                  className={cn(
                    "w-5 shrink-0 text-right font-semibold tabular-nums",
                    isToday ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {day}
                </span>
                <span className={cn(isToday && "font-semibold text-primary")}>
                  {prompt}
                  {isToday && <span className="sr-only"> (today)</span>}
                </span>
              </li>
            );
          })}
        </ol>

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
        <h2 className="mb-2 font-heading text-xl">About this challenge</h2>
        <p>
          The {CHALLENGE_NAME} is a free, month long painting challenge for
          beginners. There is one simple prompt for each day of October, from a
          cow on day 1 to Halloween on day 31. Paint the day&rsquo;s prompt, or
          any prompt you like, and share it with everyone else painting along.
        </p>
        <div className="mt-5 flex flex-col gap-4">
          {ABOUT.map(({ q, a }) => (
            <div key={q}>
              <h3 className="font-semibold text-foreground">{q}</h3>
              <p className="mt-0.5">{a}</p>
            </div>
          ))}
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
          on the home page. Posting somewhere else too? Add{" "}
          <span className="font-semibold text-foreground">{HASHTAG}</span>.
        </p>
      </section>

      {latest.length > 0 && (
        <section className="mt-12">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="font-heading text-xl">Latest entries</h2>
            <Link href="/?challenge=october" className={cn(LINK, "text-sm")}>
              See every entry &rarr;
            </Link>
          </div>
          <PaintingGrid paintings={latest} heartedIds={heartedIds} narrow />
        </section>
      )}
    </main>
  );
}
