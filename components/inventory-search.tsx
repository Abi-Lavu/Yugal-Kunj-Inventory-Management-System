"use client";

import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, useTransition } from "react";

export default function InventorySearch({
  initialQuery,
}: {
  initialQuery: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Freeze the initial value: the input is uncontrolled, so its defaultValue
  // must stay stable across re-renders (Base UI warns otherwise).
  const [defaultQuery] = useState(initialQuery);

  function handleChange(value: string) {
    if (timeout.current) clearTimeout(timeout.current);
    // Debounce so we filter as the user types without an Enter / submit.
    timeout.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = value.trim();
      if (trimmed) {
        params.set("q", trimmed);
      } else {
        params.delete("q");
      }
      params.delete("page"); // any new query resets to the first page
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    }, 300);
  }

  return (
    <div className="relative flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        name="q"
        type="search"
        defaultValue={defaultQuery}
        placeholder="Search products by name..."
        aria-label="Search products"
        className="h-9 pl-9 pr-9"
        onChange={(e) => handleChange(e.target.value)}
      />
      {isPending && (
        <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      )}
    </div>
  );
}
