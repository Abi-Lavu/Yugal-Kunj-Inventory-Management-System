"use client";

import { buttonVariants } from "@/components/ui/button";
import { DEFAULT_SORT, SORT_OPTIONS, type SortKey } from "@/lib/sort";
import { cn } from "@/lib/utils";
import { ArrowUpDown, Check, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function SortMenu({ sort }: { sort: SortKey }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  // Copy the current query string so the search and status filter survive a
  // sort change; only the ordering moves, and it restarts at the first page.
  const hrefFor = (key: SortKey) => {
    const params = new URLSearchParams(searchParams.toString());
    if (key === DEFAULT_SORT) {
      params.delete("sort");
    } else {
      params.set("sort", key);
    }
    params.delete("page");
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const current =
    SORT_OPTIONS.find((option) => option.key === sort) ?? SORT_OPTIONS[0];

  return (
    <div ref={ref} className="relative w-full sm:w-auto">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-9 w-full justify-between gap-1.5 px-4 sm:w-auto sm:justify-start"
        )}
      >
        <span className="inline-flex items-center gap-1.5">
          <ArrowUpDown className="h-4 w-4" />
          <span className="text-muted-foreground">Sort:</span>
          {current.label}
        </span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-1 max-h-[60vh] w-60 animate-in fade-in zoom-in-95 overflow-y-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg duration-150"
        >
          {SORT_OPTIONS.map((option) => {
            const active = option.key === sort;
            return (
              <Link
                key={option.key}
                href={hrefFor(option.key)}
                role="menuitem"
                scroll={false}
                aria-current={active ? "true" : undefined}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-muted",
                  active && "font-medium text-foreground"
                )}
              >
                <Check
                  className={cn(
                    "h-4 w-4 shrink-0 text-violet-600",
                    !active && "invisible"
                  )}
                />
                {option.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
