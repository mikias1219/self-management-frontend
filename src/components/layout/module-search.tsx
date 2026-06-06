"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ALL_SEARCH_NAV } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";

/** Jump to app modules (Tasks, Habits, Finance, etc.) — not a full-text search inside lists. */
export function ModuleSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return ALL_SEARCH_NAV.slice(0, 10);
    return ALL_SEARCH_NAV.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.group?.toLowerCase().includes(query) ||
        item.href.toLowerCase().includes(query),
    );
  }, [q]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        nativeButton={false}
        render={
          <div className="relative w-full min-w-0 flex-1">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Go to module…"
              className="h-8 w-full bg-muted/40 pl-8 text-sm"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              aria-label="Search modules to navigate"
            />
          </div>
        }
      />
      <PopoverContent
        className="w-[var(--anchor-width)] min-w-[220px] p-1"
        align="start"
      >
        <p className="px-2 py-1.5 text-[10px] text-muted-foreground">
          Navigate to a section
        </p>
        {results.length === 0 ? (
          <p className="px-2 py-3 text-xs text-muted-foreground">
            No modules match
          </p>
        ) : (
          <ul className="max-h-56 overflow-y-auto">
            {results.map((item) => (
              <li key={`${item.href}-${item.title}`}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted",
                  )}
                  onClick={() => {
                    router.push(item.href);
                    setOpen(false);
                    setQ("");
                  }}
                >
                  <item.icon className="size-4 shrink-0 opacity-70" />
                  <span className="font-medium">{item.title}</span>
                  {item.group && (
                    <span className="ml-auto text-[10px] text-muted-foreground">
                      {item.group}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
