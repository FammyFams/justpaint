"use client";

import { LogOut } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/app/actions/auth";

// Navy, not red: logging out isn't dangerous.
export function LogoutMenuItem({ className }: { className?: string }) {
  return (
    <DropdownMenuItem className={className} onClick={() => signOutAction()}>
      <LogOut className="text-muted-foreground" />
      Log out
    </DropdownMenuItem>
  );
}
