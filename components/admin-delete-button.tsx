"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { adminDeletePaintingAction } from "@/app/actions/admin";

export function AdminDeleteButton({
  paintingId,
  title,
  redirectTo,
  size = "sm",
}: {
  paintingId: string;
  title: string;
  /** Where to go after deleting; stays on the page (and refreshes) if omitted. */
  redirectTo?: string;
  size?: "sm" | "default";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const result = await adminDeletePaintingAction(paintingId);
      if ("error" in result) {
        toast.error(result.error);
        setDeleting(false);
        return;
      }
      toast.success(`Deleted “${title}”`);
      setOpen(false);
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
    } catch {
      toast.error("Couldn't delete that — check your connection and try again.");
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="destructive" size={size}>
            <Trash2 />
            Delete
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete “{title}”?</DialogTitle>
          <DialogDescription>
            This removes the painting, its image, and all its likes and
            comments. This can&rsquo;t be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
