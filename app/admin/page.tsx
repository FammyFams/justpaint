import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { isAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { AdminLoginForm } from "@/components/admin-login-form";
import { AdminDeleteButton } from "@/components/admin-delete-button";
import { adminLogoutAction } from "@/app/actions/admin";

export const metadata: Metadata = {
  title: "Admin — justpaint",
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

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-4xl italic leading-tight">
          All posts{paintings ? ` (${paintings.length})` : ""}
        </h1>
        <form action={adminLogoutAction}>
          <Button type="submit" variant="outline" size="sm">
            Log out
          </Button>
        </form>
      </div>

      {error && (
        <p className="mt-6 text-sm text-destructive" role="alert">
          Couldn&rsquo;t load posts: {error.message}
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
                  {author} · {formatDate(p.created_at)}
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
