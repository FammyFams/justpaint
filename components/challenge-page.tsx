import type { Metadata } from "next";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { DownloadCalendarButton, ShareCalendarButton } from "@/components/share-calendar-button";
import { PaintingGrid } from "@/components/painting-grid";
import { TodayMark } from "@/components/today-mark";
import { buttonVariants } from "@/components/ui/button";
import { getFeed } from "@/lib/paintings";
import { getSiteUrl } from "@/lib/site-url";
import {
  CURRENT_CHALLENGE,
  RULES,
  WEEKDAYS,
  calendarWeeks,
  challengeDay,
  challengeOver,
  challengePath,
  promptFor,
  type Challenge,
} from "@/lib/challenges";

// One page per monthly challenge (app/october-challenge,
// app/november-challenge), all built from lib/challenges.ts.

// The share image comes from the page's own opengraph-image.tsx, which Next
// adds to openGraph and twitter automatically.
export function challengeMetadata(c: Challenge): Metadata {
  const path = challengePath(c);
  return {
    title: `${c.name} | justpaint`,
    description: c.description,
    keywords: c.keywords,
    alternates: { canonical: path },
    openGraph: {
      title: c.name,
      description: c.description,
      url: path,
      siteName: "justpaint",
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: c.name,
      description: c.description,
    },
  };
}

const LINK = "font-medium text-primary underline underline-offset-2 hover:decoration-2";

// Newest entries shown at the bottom; the rest are on the home page's tab.
const LATEST_COUNT = 6;

// Questions people search for, answered in plain words.
function aboutQuestions(c: Challenge) {
  return [
    {
      q: "Who is it for?",
      a: "Anyone who wants to paint more. It's made for beginners, so nothing has to be perfect. A quick ten minute painting counts.",
    },
    {
      q: "What paints can I use?",
      a: "Anything you have: watercolor, gouache, acrylic, oil, or a mix. Pencils and markers are welcome too.",
    },
    {
      q: `Do I have to do all ${c.prompts.length}?`,
      a: "No. Skip days, catch up later, or only paint the prompts you like.",
    },
    {
      q: "Do I need an account?",
      a: "No. You can post with just a name. An account gives you your own page with all your paintings.",
    },
    {
      q: "Where do I share it?",
      a: `Post it on justpaint, where everyone painting along can see it. On Instagram or TikTok, add ${c.hashtag} so others can find it.`,
    },
  ];
}

export async function ChallengePage({ challenge: c }: { challenge: Challenge }) {
  const today = challengeDay(c);
  const todayPrompt = promptFor(c, today);
  // A past month points visitors at the one that's on now.
  const over = challengeOver(c) && c !== CURRENT_CHALLENGE;
  const path = challengePath(c);
  const pageUrl = `${getSiteUrl()}${path}`;
  const entriesHref = `/?challenge=${c.slug}`;
  const weeks = calendarWeeks(c);

  const { paintings: latest } = await getFeed({ challenge: c.id, limit: LATEST_COUNT });

  // Tells search engines this is a free, online, month-long event.
  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: c.name,
    description: c.description,
    startDate: c.startDate,
    endDate: c.endDate,
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
      validFrom: c.announced,
    },
    url: pageUrl,
  };

  const intro = (
    <>
      <span className="text-2xl leading-tight font-extrabold tracking-tight">
        {c.prompts.length} prompts.
      </span>
      <span className="text-2xl leading-tight font-extrabold tracking-tight text-muted-foreground">
        One painting a day.
      </span>
    </>
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <script
        type="application/ld+json"
        // Static data built above, so no user input ends up in the script.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd).replace(/</g, "\\u003c") }}
      />
      <h1 className="font-heading text-4xl italic leading-tight sm:text-5xl">{c.name}</h1>
      <p className="mt-3 text-muted-foreground">
        One prompt a day, all month long. Paint along with everyone.
      </p>
      {over && (
        <p className="mt-3 text-sm">
          This challenge ended on {c.month} {c.prompts.length}.{" "}
          <Link href={challengePath(CURRENT_CHALLENGE)} prefetch={false} className={LINK}>
            Join the {CURRENT_CHALLENGE.name} &rarr;
          </Link>
        </p>
      )}

      {today && (
        <div className="mt-8 flex flex-wrap items-end justify-between gap-4 rounded-sm border border-border/70 bg-card px-5 py-5 shadow-[0_1px_2px_rgba(0,0,34,0.06)] sm:px-6">
          <div>
            <p className="text-xs font-semibold tracking-widest text-primary uppercase">
              <TodayMark>Today&rsquo;s</TodayMark> prompt, day {today}
            </p>
            <p
              className={cn(
                "mt-1 font-heading text-3xl italic leading-tight",
                todayPrompt ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {todayPrompt ?? "Coming soon"}
            </p>
          </div>
          {/* Circled by hand, like circling something on paper. */}
          <Link
            href="/upload" prefetch={false}
            className="group relative inline-block px-4 py-2 text-base font-semibold text-foreground"
          >
            <svg
              aria-hidden
              viewBox="0 0 160 50"
              preserveAspectRatio="none"
              className="absolute -inset-x-1 -inset-y-1 h-[calc(100%+0.5rem)] w-[calc(100%+0.5rem)] text-primary transition-transform duration-200 motion-safe:group-hover:-rotate-2"
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
                    <Link href="/upload" prefetch={false} className={LINK}>
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
        <a href={`${path}/calendar.png`} target="_blank" className="block sm:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element -- already a sized PNG */}
          <img
            src={`${path}/calendar.png`}
            // Short: the same prompts follow as a text list just below.
            alt={`${c.name} calendar`}
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
            plain list: the first half of the month down the left, the rest
            down the right. */}
        <ol
          className="mt-5 grid grid-flow-col grid-cols-2 gap-x-6 text-sm sm:hidden"
          style={{ gridTemplateRows: `repeat(${Math.ceil(c.prompts.length / 2)}, auto)` }}
        >
          {c.prompts.map((prompt, i) => {
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
                <span
                  className={cn(
                    isToday && "font-semibold text-primary",
                    !prompt && !isToday && "text-muted-foreground"
                  )}
                >
                  {prompt ?? "Coming soon"}
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
            {weeks.flat().map((cell) => {
              if (cell.kind !== "day") {
                return (
                  <li
                    key={`${cell.kind}-${cell.kind === "intro" ? cell.side : "blank"}`}
                    className={cn(
                      "flex flex-col justify-end px-2.5 pb-3",
                      cell.kind === "intro" && cell.side === "start" && "border-r-2 border-foreground",
                      cell.kind === "intro" && cell.side === "end" && "border-l-2 border-foreground"
                    )}
                    style={{ gridColumn: `span ${cell.span}` }}
                  >
                    {cell.kind === "intro" && intro}
                  </li>
                );
              }
              const { day, weekday } = cell;
              const prompt = promptFor(c, day);
              const isToday = day === today;
              const holiday = day === c.holiday;
              // Day 1 sits next to the intro's thick rule when the intro
              // comes first.
              const introBefore = day === 1 && weeks[0][0].kind === "intro";
              return (
                <li
                  key={day}
                  aria-current={isToday ? "date" : undefined}
                  className={cn(
                    "flex min-h-28 flex-col px-2.5 pt-2 pb-2.5",
                    // Hairline between days; Sundays start a row.
                    weekday !== 0 && !introBefore && "border-l border-foreground/15",
                    holiday && "bg-[#e28413] text-[#000022]",
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
          <ShareCalendarButton slug={c.slug} className={cn(buttonVariants(), "cursor-pointer")} />
          <DownloadCalendarButton slug={c.slug} className={buttonVariants({ variant: "outline" })} />
        </div>
      </section>

      <section className="mt-10 text-sm leading-relaxed text-foreground/90">
        <h2 className="mb-2 font-heading text-xl">About this challenge</h2>
        <p>{c.about}</p>
        <div className="mt-5 flex flex-col gap-4">
          {aboutQuestions(c).map(({ q, a }) => (
            <div key={q}>
              <h3 className="font-semibold text-foreground">{q}</h3>
              <p className="mt-0.5">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {!over && (
        <section className="mt-10 text-sm leading-relaxed text-foreground/90">
          <h2 className="mb-2 font-heading text-xl">How to enter</h2>
          <p>
            When you{" "}
            <Link href="/upload" prefetch={false} className={LINK}>
              post a painting
            </Link>
            , tick &ldquo;This is part of the {c.name}&rdquo; and pick the
            day&rsquo;s prompt. You can see every entry, grouped by day, by picking{" "}
            {/* Plain <a>, like components/feed-filter.tsx: a <Link> to this
                query rewrite kept showing the full feed. */}
            <a href={entriesHref} className={LINK}>
              {c.tabName}
            </a>{" "}
            on the home page. Posting somewhere else too? Add{" "}
            <span className="font-semibold text-foreground">{c.hashtag}</span>.
          </p>
        </section>
      )}

      {latest.length > 0 && (
        <section className="mt-12">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="font-heading text-xl">Latest entries</h2>
            <a href={entriesHref} className={cn(LINK, "text-sm")}>
              See every entry &rarr;
            </a>
          </div>
          <PaintingGrid paintings={latest} narrow underHeading />
        </section>
      )}
    </main>
  );
}
