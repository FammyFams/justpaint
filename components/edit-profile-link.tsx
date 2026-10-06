"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { useViewer } from "@/components/viewer";

/** Shown only to the profile's own artist; profile pages are cached and the same for everyone. */
export function EditProfileLink({ artistId, href }: { artistId: string; href: string }) {
  const { user } = useViewer();
  if (user?.id !== artistId) return null;
  return (
    <Link href={href} className={buttonVariants({ variant: "outline" })}>
      Edit profile
    </Link>
  );
}
