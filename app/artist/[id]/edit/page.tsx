import { notFound, redirect } from "next/navigation";
import { getArtistById } from "@/lib/paintings";
import { getCurrentUser } from "@/lib/current-user";
import { ProfileEditForm } from "@/components/profile-edit-form";
import { DeleteAccountButton } from "@/components/delete-account-button";

export default async function EditProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [artist, currentUser] = await Promise.all([
    getArtistById(id),
    getCurrentUser(),
  ]);
  if (!artist) notFound();

  if (!currentUser) redirect("/login");
  if (currentUser.id !== artist.id) redirect(`/artist/${artist.id}`);

  return (
    <main className="mx-auto max-w-lg px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-heading text-3xl italic leading-tight">
        Edit profile
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This is what other people see on your profile.
      </p>

      <ProfileEditForm artist={artist} />

      <div className="mt-12 border-t border-border pt-6">
        <h2 className="font-heading text-lg italic">Danger zone</h2>
        <p className="mt-1 mb-4 text-sm text-muted-foreground">
          Permanently delete your account and everything you&rsquo;ve posted.
        </p>
        <DeleteAccountButton />
      </div>
    </main>
  );
}
