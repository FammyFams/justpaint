"use client";

import { LogOut } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useViewer } from "@/components/viewer";
import { signOutAction } from "@/app/actions/auth";

// Navy, not red: logging out isn't dangerous.
export function LogoutMenuItem({ className }: { className?: string }) {
  const { refresh } = useViewer();
  return (
    <DropdownMenuItem
      className={className}
      // Logging out redirects to /, which may be this page, so ask again
      // instead of waiting for a navigation.
      onClick={() => void signOutAction().then(refresh, refresh)}
    >
      <LogOut className="text-muted-foreground" />
      Log out
    </DropdownMenuItem>
  );
}
