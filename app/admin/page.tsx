import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { isAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { AdminLoginForm } from "@/components/admin-login-form";
import { AdminDeleteButton } from "@/components/admin-delete-button";
import { ReportActions } from "@/components/report-actions";
import { REPORT_REASONS } from "@/lib/validations/report";
import { adminLogoutAction } from "@/app/actions/admin";

export const metadata: Metadata = {
  title: "Admin | justpaint",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!(await isAdmin())) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="font-heading text-4xl italic leading-tight">Admin</h1>
        <AdminLoginForm />
      </main>
    );
  }

  const admin = createAdminClient();
  const { data: paintings, error } = await admin
    .from("paintings")
    .select(
      "id, title, image_path, guest_name, created_at, profiles!paintings_owner_id_fkey ( display_name )"
    )
    .order("created_at", { ascending: false });

  const { data: reports } = await admin
    .from("content_reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  const openReports = reports?.filter((r) => r.status === "open") ?? [];
  const closedReports = reports?.filter((r) => r.status !== "open").slice(0, 10) ?? [];
  // eslint-disable-next-line react-hooks/purity -- server render, runs once per request
  const now = Date.now();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-4xl italic leading-tight">
          Admin
        </h1>
        <form action={adminLogoutAction}>
          <Button type="submit" variant="outline" size="sm">
            Log out
          </Button>
        </form>
      </div>

      <section className="mt-8">
        <h2 className="font-heading text-2xl italic">
          Reports{openReports.length > 0 ? ` (${openReports.length} open)` : ""}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          A valid report of an intimate image shared without consent must be acted on within 48
          hours (TAKE IT DOWN Act). Removing also deletes identical copies.
        </p>
        {openReports.length === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">No open reports.</p>
        )}
        <ul className="mt-4 flex flex-col gap-3">
          {openReports.map((r) => {
            const hoursLeft = Math.floor(
              (new Date(r.created_at).getTime() + 48 * 3600 * 1000 - now) / 3600000
            );
            return (
              <li key={r.id} className="rounded-sm border border-destructive/40 bg-card p-4 text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-medium">
                    #{r.id}:{" "}
                    {r.painting_id ? (
                      <Link href={`/painting/${r.painting_id}`} className="hover:underline">
                        {r.painting_title ?? "post"}
                      </Link>
                    ) : (
                      r.painting_title ?? "post"
                    )}
                  </p>
                  <p className={hoursLeft < 12 ? "font-medium text-destructive" : "text-muted-foreground"}>
                    {hoursLeft > 0 ? `${hoursLeft}h left of 48` : "Past 48 hours"}
                  </p>
                </div>
                <p className="mt-1">{REPORT_REASONS[r.reason as keyof typeof REPORT_REASONS] ?? r.reason}</p>
                {r.details && <p className="mt-1 whitespace-pre-line text-foreground/80">{r.details}</p>}
                <p className="mt-1 text-muted-foreground">
                  From {r.signature} ({r.contact_email}) · {formatDateTime(r.created_at)}
                </p>
                {r.reason === "minor" && (
                  <p className="mt-2 text-destructive">
                    Child safety: before removing, report it to NCMEC at report.cybertip.org and
                    save a copy of the image and post details. Federal law requires reporting it
                    and keeping that copy for a year.
                  </p>
                )}
                <div className="mt-3">
                  <ReportActions reportId={r.id} />
                </div>
              </li>
            );
          })}
        </ul>
        {closedReports.length > 0 && (
          <details className="mt-4 text-sm">
            <summary className="cursor-pointer text-muted-foreground">Recently closed</summary>
            <ul className="mt-2 flex flex-col gap-1 text-muted-foreground">
              {closedReports.map((r) => (
                <li key={r.id}>
                  #{r.id} {r.painting_title} · {r.status === "removed" ? `removed (${r.removed_count})` : "no action"} ·{" "}
                  {r.resolved_at ? formatDateTime(r.resolved_at) : ""}
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>

      <h2 className="mt-12 font-heading text-2xl italic">
        All posts{paintings ? ` (${paintings.length})` : ""}
      </h2>

      {error && (
        <p className="mt-6 text-sm text-destructive" role="alert">
          Couldn&rsquo;t load posts.
        </p>
      )}

      {paintings?.length === 0 && (
        <p className="mt-6 text-muted-foreground">No posts yet.</p>
      )}

      <ul className="mt-8 divide-y divide-border border-y border-border">
        {paintings?.map((p) => {
          const imageUrl = admin.storage
            .from("paintings")
            .getPublicUrl(p.image_path).data.publicUrl;
          const author = p.profiles?.display_name || p.guest_name || "Guest";
          return (
            <li key={p.id} className="flex items-center gap-4 py-3">
              <Link
                href={`/painting/${p.id}`}
                className="relative size-16 shrink-0 overflow-hidden rounded-sm bg-muted"
              >
                <Image
                  src={imageUrl}
                  alt={p.title}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/painting/${p.id}`}
                  className="block truncate font-medium hover:underline"
                >
                  {p.title}
                </Link>
                <p className="truncate text-sm text-muted-foreground">
                  {author} · {formatDateTime(p.created_at)}
                </p>
              </div>
              <AdminDeleteButton paintingId={p.id} title={p.title} />
            </li>
          );
        })}
      </ul>
    </main>
  );
}
