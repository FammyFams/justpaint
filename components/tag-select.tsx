"use client";

import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Tag } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TagSelect({
  id,
  tags,
  value,
  onChange,
}: {
  id?: string;
  tags: Tag[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  function toggle(name: string, checked: boolean) {
    onChange(checked ? [...value, name] : value.filter((t) => t !== name));
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        id={id}
        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span
          className={cn(
            "truncate text-left",
            value.length === 0 && "text-muted-foreground"
          )}
        >
          {value.length === 0 ? "Select tags" : value.join(", ")}
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {tags.map((tag) => (
          <DropdownMenuCheckboxItem
            key={tag.id}
            checked={value.includes(tag.name)}
            onCheckedChange={(checked) => toggle(tag.name, checked)}
          >
            {tag.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
