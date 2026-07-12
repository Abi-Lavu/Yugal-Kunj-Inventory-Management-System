"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown, Download, FileSpreadsheet, FileText } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ExportMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative w-full sm:w-auto">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-9 w-full gap-1.5 px-4 sm:w-auto"
        )}
      >
        <Download className="h-4 w-4" />
        Export
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1 w-48 animate-in fade-in zoom-in-95 overflow-hidden rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg duration-150">
          <a
            href="/api/export?format=csv"
            download
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-muted"
          >
            <FileText className="h-4 w-4 text-emerald-600" />
            Export as CSV
          </a>
          <a
            href="/api/export?format=xlsx"
            download
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-muted"
          >
            <FileSpreadsheet className="h-4 w-4 text-violet-600" />
            Export as Excel
          </a>
        </div>
      )}
    </div>
  );
}
