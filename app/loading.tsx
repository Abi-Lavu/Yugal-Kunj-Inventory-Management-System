"use client";

import { Boxes } from "lucide-react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

function Panel({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`rounded-xl bg-card p-5 ring-1 ring-foreground/10 ${className}`}
    >
      {children}
    </div>
  );
}

function LoadingSidebar() {
  return (
    <aside className="fixed left-0 top-0 z-20 flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500">
          <Boxes className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="h-3.5 w-20 rounded bg-white/15" />
          <div className="h-2.5 w-16 rounded bg-white/10" />
        </div>
      </div>

      <div className="flex-1 space-y-2 px-3 py-2">
        <div className="px-3 pb-2">
          <div className="h-2 w-10 rounded bg-white/10" />
        </div>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5">
            <div className="h-[18px] w-[18px] rounded bg-white/10" />
            <div className="h-3.5 w-24 rounded bg-white/10" />
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-white/10" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-20 rounded bg-white/10" />
            <div className="h-2.5 w-28 rounded bg-white/10" />
          </div>
        </div>
      </div>
    </aside>
  );
}

function MainContentSkeleton({ showSidebar = true }: { showSidebar?: boolean }) {
  return (
    <main
      className={
        showSidebar
          ? "ml-64 min-h-screen p-6 lg:p-10"
          : "min-h-screen p-6 lg:p-10"
      }
    >
      <div className="mx-auto max-w-7xl">
        {/* header */}
        <div className="mb-8 space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>

        {/* stat cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Panel key={i}>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-7 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-11 w-11 rounded-xl" />
              </div>
            </Panel>
          ))}
        </div>

        {/* chart + donut */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Panel className="lg:col-span-2">
            <Skeleton className="mb-2 h-5 w-44" />
            <Skeleton className="mb-6 h-3.5 w-24" />
            <Skeleton className="h-56 w-full" />
          </Panel>
          <Panel>
            <Skeleton className="mb-2 h-5 w-28" />
            <Skeleton className="mb-6 h-3.5 w-36" />
            <div className="flex justify-center">
              <Skeleton className="h-40 w-40 rounded-full" />
            </div>
            <div className="mt-6 space-y-2">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </Panel>
        </div>

        {/* recent */}
        <Panel>
          <Skeleton className="mb-4 h-5 w-40" />
          <div className="space-y-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-2.5 w-2.5 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </main>
  );
}

export default function Loading() {
  const pathname = usePathname();

  // Don't show sidebar on public routes
  const showSidebar = !["/", "/sign-in", "/sign-up"].includes(pathname);

  return (
    <div className="min-h-screen bg-muted/20">
      {showSidebar && <LoadingSidebar />}
      <MainContentSkeleton showSidebar={showSidebar} />
    </div>
  );
}
