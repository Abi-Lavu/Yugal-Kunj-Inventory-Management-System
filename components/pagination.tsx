import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams: Record<string, string>;
}

export default function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  searchParams,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageUrl = (page: number) => {
    const params = new URLSearchParams({ ...searchParams, page: String(page) });
    return `${baseUrl}?${params.toString()}`;
  };

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();
  const edgeBase =
    "inline-flex h-9 items-center gap-1 rounded-lg px-3 text-sm font-medium transition-colors";

  return (
    <nav className="flex items-center justify-center gap-1.5">
      <Link
        href={getPageUrl(currentPage - 1)}
        aria-disabled={currentPage <= 1}
        className={cn(
          edgeBase,
          currentPage <= 1
            ? "pointer-events-none border bg-muted text-muted-foreground/50"
            : "border bg-card hover:bg-muted"
        )}
      >
        <ChevronLeft className="h-4 w-4" /> Previous
      </Link>

      {visiblePages.map((page, key) => {
        if (page === "...") {
          return (
            <span key={key} className="px-2 text-sm text-muted-foreground">
              …
            </span>
          );
        }

        const pageNumber = page as number;
        const isCurrentPage = pageNumber === currentPage;

        return (
          <Link
            key={key}
            href={getPageUrl(pageNumber)}
            className={cn(
              "inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition-all",
              isCurrentPage
                ? "bg-primary text-primary-foreground shadow-sm shadow-violet-600/25"
                : "border bg-card hover:bg-muted"
            )}
          >
            {pageNumber}
          </Link>
        );
      })}

      <Link
        href={getPageUrl(currentPage + 1)}
        aria-disabled={currentPage >= totalPages}
        className={cn(
          edgeBase,
          currentPage >= totalPages
            ? "pointer-events-none border bg-muted text-muted-foreground/50"
            : "border bg-card hover:bg-muted"
        )}
      >
        Next <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
