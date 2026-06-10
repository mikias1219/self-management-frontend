"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

/** Jump to app modules — opens on click or Cmd/Ctrl+K. */
export function ModuleSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return ALL_SEARCH_NAV.slice(0, 12);
    return ALL_SEARCH_NAV.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.group?.toLowerCase().includes(query) ||
        item.href.toLowerCase().includes(query),
    );
  }, [q]);

  const navigate = useCallback(
    (href: string) => {
      router.push(href);
      setOpen(false);
      setQ("");
      setActiveIndex(0);
    },
    [router],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [q]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const onInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIndex]) {
      e.preventDefault();
      navigate(results[activeIndex].href);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        nativeButton={false}
        render={
          <div className="relative w-full min-w-0 flex-1">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search…"
              className="h-8 w-full bg-muted/40 pl-8 pr-14 text-sm"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={onInputKeyDown}
              aria-label="Search modules to navigate"
              aria-expanded={open}
              aria-controls="module-search-results"
              role="combobox"
            />
            <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline">
              ⌘K
            </kbd>
          </div>
        }
      />
      <PopoverContent
        id="module-search-results"
        className="w-[var(--anchor-width)] min-w-[220px] p-1"
        align="start"
        role="listbox"
      >
        <p className="px-2 py-1.5 text-xs text-muted-foreground">
          Navigate to a section
        </p>
        {results.length === 0 ? (
          <p className="px-2 py-3 text-xs text-muted-foreground">
            No modules match
          </p>
        ) : (
          <ul className="max-h-56 overflow-y-auto">
            {results.map((item, index) => (
              <li key={`${item.href}-${item.title}`} role="option" aria-selected={index === activeIndex}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted",
                    index === activeIndex && "bg-muted",
                  )}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => navigate(item.href)}
                >
                  <item.icon className="size-4 shrink-0 opacity-70" />
                  <span className="font-medium">{item.title}</span>
                  {item.group && (
                    <span className="ml-auto text-xs text-muted-foreground">
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
