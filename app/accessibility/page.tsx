import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accessibility | justpaint",
  description: "How justpaint works with screen readers, keyboards, zoom and other assistive technology, and how to tell us about a problem.",
  alternates: { canonical: "/accessibility" },
};

export default function AccessibilityPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-heading text-4xl italic leading-tight sm:text-5xl">
        Accessibility
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Last updated October 5, 2026
      </p>

      <div className="mt-10 flex flex-col gap-8 text-sm leading-relaxed text-foreground/90">
        <p>
          justpaint is for everyone who paints, including people who use a
          screen reader, a keyboard, voice control, zoom or other assistive
          technology.
        </p>

        <section>
          <h2 className="mb-2 font-heading text-xl">Our goal</h2>
          <p>
            We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.2
            at Level AA. It&rsquo;s the standard the U.S. Department of Justice
            and courts point to for websites.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">What we&rsquo;ve done</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Everything works with a keyboard, with a visible focus outline and
              a &ldquo;Skip to content&rdquo; link at the top of each page.
            </li>
            <li>
              Text and controls meet WCAG color contrast, and links inside
              sentences are underlined.
            </li>
            <li>
              Form fields have labels, say what they need up front, and explain
              mistakes in words.
            </li>
            <li>
              Hearts, menus and the tag picker tell screen readers what they do
              and whether they&rsquo;re on.
            </li>
            <li>
              Pages fit narrow phones and zoom to 400% without scrolling
              sideways.
            </li>
            <li>The site follows your device&rsquo;s reduce motion setting.</li>
          </ul>
          <p className="mt-2">
            We checked every page in October 2026 with automated testing (axe)
            and by hand with a keyboard.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">Known limits</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Paintings are posted by our community. The text that goes with
              each one is the title, description and tags its painter writes,
              so how well a painting is described depends on them.
            </li>
            <li>
              The October challenge calendar is also a picture. Every prompt in
              it is listed as text on the same page.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">Tell us about a problem</h2>
          <p>
            If something on justpaint is hard to use, email{" "}
            <a
              href="mailto:thewcookie@gmail.com"
              className="text-primary underline underline-offset-2"
            >
              thewcookie@gmail.com
            </a>{" "}
            with the page and what happened. We&rsquo;ll get back to you, work
            on a fix, and help you with what you were trying to do in the
            meantime.
          </p>
        </section>
      </div>
    </main>
  );
}
