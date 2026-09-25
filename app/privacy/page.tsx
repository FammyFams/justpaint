import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy — justpaint",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-heading text-4xl italic leading-tight sm:text-5xl">
        Privacy policy
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Last updated September 25, 2026
      </p>

      <div className="prose-content mt-10 flex flex-col gap-8 text-sm leading-relaxed text-foreground/90">
        <p>
          justpaint is a small, independently run project. This page explains
          what data we collect and how we use it.
        </p>

        <section>
          <h2 className="mb-2 font-heading text-xl">What we collect</h2>
          <p className="mb-2 font-medium text-foreground">
            If you create an account:
          </p>
          <ul className="mb-4 list-disc space-y-1 pl-5">
            <li>
              Your email address and password. Passwords are handled
              entirely by our authentication provider (Supabase) — we never
              see or store them in plain text.
            </li>
            <li>The display name and bio you choose to add to your profile.</li>
            <li>Paintings you upload — the image, title, description, and tags.</li>
            <li>Likes and comments you make.</li>
          </ul>
          <p className="mb-2 font-medium text-foreground">
            If you post as a guest (no account):
          </p>
          <ul className="mb-4 list-disc space-y-1 pl-5">
            <li>
              The name you type in when uploading, plus the painting itself.
              We don&rsquo;t collect an email address or anything else
              identifying for guest posts.
            </li>
            <li>
              Photos often carry hidden details like the location they were
              taken and the phone that took them. We strip all of that from
              every image before it&rsquo;s stored or shown.
            </li>
          </ul>
          <p className="mb-2 font-medium text-foreground">
            Automatically, for anyone using the site:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Standard server request logs collected by our hosting
              provider (Vercel) — things like IP address, browser type, and
              timestamps — used only to operate and secure the site, not to
              track you.
            </li>
            <li>
              A scrambled (one-way hashed) version of your IP address. When
              you upload, it&rsquo;s kept for two days to limit how many
              uploads can come from one place. When you heart a painting,
              it&rsquo;s kept for as long as the heart is, so each painting
              gets one heart per visitor. We never store your actual IP, and
              it&rsquo;s never shown publicly.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">What we don&rsquo;t do</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>We don&rsquo;t run ads or use advertising trackers.</li>
            <li>
              We don&rsquo;t use analytics tools that build a profile of you
              across other sites.
            </li>
            <li>We don&rsquo;t sell or share your data with anyone.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">
            Cookies and browser storage
          </h2>
          <p className="mb-2">
            We only use what the site needs to work &mdash; nothing for
            tracking or advertising:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <span className="font-medium text-foreground">Hearts:</span> your
              browser remembers which paintings you&rsquo;ve hearted (a list of
              painting IDs in local storage). It stays on your device and
              isn&rsquo;t sent to us.
            </li>
            <li>
              <span className="font-medium text-foreground">Sign-in:</span>{" "}
              small cookies that keep a session signed in, for site admins
              and, when accounts are available, account holders.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">Do Not Track</h2>
          <p>
            Some browsers can send a &ldquo;Do Not Track&rdquo; signal.
            justpaint doesn&rsquo;t track you across other sites and doesn&rsquo;t
            let third parties do so, so we treat every visit the same way
            whether or not that signal is on.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">Who we share data with</h2>
          <p className="mb-2">
            We use two service providers to run justpaint, and your data
            passes through them as part of normal operation:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <span className="font-medium text-foreground">Supabase</span> —
              hosts our database, handles authentication, and stores
              uploaded images.
            </li>
            <li>
              <span className="font-medium text-foreground">Vercel</span> —
              hosts the website itself.
            </li>
          </ul>
          <p className="mt-2">
            Neither uses your data for anything beyond providing these
            services to us.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">Public content</h2>
          <p>
            Paintings, titles, descriptions, tags, comments, and profile
            display names and bios are public by design &mdash; that&rsquo;s
            the point of the site. Please don&rsquo;t upload or post
            anything you don&rsquo;t want visible to anyone who visits
            justpaint.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">Your choices</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              To have a painting you posted taken down, or your account and
              everything in it deleted, email{" "}
              <a
                href="mailto:matthewzhenghi@gmail.com"
                className="text-primary hover:underline"
              >
                matthewzhenghi@gmail.com
              </a>
              .
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">Children&rsquo;s privacy</h2>
          <p>
            justpaint isn&rsquo;t directed at children under 13, and we
            don&rsquo;t knowingly collect data from children under 13.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">Changes to this policy</h2>
          <p>
            If this policy changes in a meaningful way, we&rsquo;ll update
            the date at the top of this page.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-xl">Contact</h2>
          <p>
            Questions about this policy? Email{" "}
            <a
              href="mailto:matthewzhenghi@gmail.com"
              className="text-primary hover:underline"
            >
              matthewzhenghi@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
