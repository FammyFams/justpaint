"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/app/actions/auth";

export function LogoutMenuItem() {
  return (
    <DropdownMenuItem variant="destructive" onClick={() => signOutAction()}>
      Log out
    </DropdownMenuItem>
  );
}
