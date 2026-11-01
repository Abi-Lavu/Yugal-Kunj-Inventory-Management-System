import AuditActionBadge from "@/components/audit-action-badge";
import Sidebar from "@/components/sidebar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStockStatus, STOCK_STATUS_LABELS } from "@/lib/stock-status";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Package,
  PackageX,
  Plus,
} from "lucide-react";
import Link from "next/link";

// Out-of-stock is more urgent than low, and within a group the emptiest shelf
// comes first — the same ordering the inventory page's "Stock status" sort uses.
const STATUS_RANK = { out: 0, low: 1, in: 2 } as const;

const statusStyles = {
  out: {
    dot: "bg-rose-500",
    badge: "border-transparent bg-rose-500/10 text-rose-600",
  },
  low: {
    dot: "bg-amber-500",
    badge: "border-transparent bg-amber-500/10 text-amber-600",
  },
  in: {
    dot: "bg-emerald-500",
    badge: "border-transparent bg-emerald-500/10 text-emerald-600",
  },
};

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const [allProducts, recentProducts, recentChanges] =
    await Promise.all([
      prisma.product.findMany({
        select: {
          id: true,
          name: true,
          brand: true,
          price: true,
          quantity: true,
          lowStockAt: true,
        },
      }),
      prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          brand: true,
          quantity: true,
          lowStockAt: true,
          createdAt: true,
        },
      }),
      prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    ]);

  const totalProducts = allProducts.length;

  const totalValue = allProducts.reduce(
    (sum, product) => sum + Number(product.price) * Number(product.quantity),
    0
  );

  const inStockCount = allProducts.filter(
    (p) => getStockStatus(p.quantity, p.lowStockAt) === "in"
  ).length;
  const lowStockCount = allProducts.filter(
    (p) => getStockStatus(p.quantity, p.lowStockAt) === "low"
  ).length;
  const outOfStockCount = allProducts.filter(
    (p) => getStockStatus(p.quantity, p.lowStockAt) === "out"
  ).length;

  const inStockPercentage =
    totalProducts > 0 ? Math.round((inStockCount / totalProducts) * 100) : 0;
  const lowStockPercentage =
    totalProducts > 0 ? Math.round((lowStockCount / totalProducts) * 100) : 0;
  const outOfStockPercentage =
    totalProducts > 0 ? Math.round((outOfStockCount / totalProducts) * 100) : 0;
  const inStockDegrees = (inStockPercentage / 100) * 360;
  const lowStockDegrees = (lowStockPercentage / 100) * 360;
  const outOfStockDegrees = (outOfStockPercentage / 100) * 360;

  // Everything that is out of stock or running low, emptiest first. Derived
  // from the rows already fetched above rather than a second query.
  const needsAttention = allProducts
    .map((product) => ({
      ...product,
      status: getStockStatus(product.quantity, product.lowStockAt),
    }))
    .filter((product) => product.status !== "in")
    .sort(
      (a, b) =>
        STATUS_RANK[a.status] - STATUS_RANK[b.status] ||
        a.quantity - b.quantity ||
        a.name.localeCompare(b.name)
    )
    .slice(0, 6);

  const firstName = user.name?.split(" ")[0] || "there";

  const stats = [
    {
      label: "Total Products",
      value: String(totalProducts),
      icon: Package,
      accent: "bg-violet-500/10 text-violet-600",
      href: "/inventory",
    },
    {
      label: "Inventory Value",
      value: `$${Number(totalValue).toFixed(0)}`,
      icon: DollarSign,
      accent: "bg-emerald-500/10 text-emerald-600",
      href: "/inventory?sort=price-high",
    },
    {
      label: "Low Stock",
      value: String(lowStockCount),
      icon: AlertTriangle,
      accent: "bg-amber-500/10 text-amber-600",
      href: "/inventory?status=low",
    },
    {
      label: "Out of Stock",
      value: String(outOfStockCount),
      icon: PackageX,
      accent: "bg-rose-500/10 text-rose-600",
      href: "/inventory?status=out",
    },
  ];

  return (
    <div className="min-h-screen bg-muted/20">
      <Sidebar currentPath="/dashboard" />
      <main className="ml-64 min-h-screen p-6 lg:p-10">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex animate-in fade-in slide-in-from-bottom-3 flex-wrap items-end justify-between gap-4 duration-500">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Yugal Kunj Inventory Management System
              </h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {firstName}. Here is an overview of your inventory.
              </p>
            </div>
            <Link
              href="/add-product"
              className={cn(
                buttonVariants(),
                "group h-9 gap-1.5 px-4 shadow-sm shadow-violet-600/20"
              )}
            >
              <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
              Add Product
            </Link>
          </div>

          {/* Stat cards — each one opens the matching inventory view */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s, i) => (
              <Link
                key={s.label}
                href={s.href}
                style={{ animationDelay: `${i * 80}ms` }}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
              >
                <Card className="h-full transition-all hover:-translate-y-1 hover:shadow-lg hover:ring-foreground/20">
                  <CardContent className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{s.label}</p>
                      <p className="mt-1 text-2xl font-bold tracking-tight">
                        {s.value}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300",
                        s.accent
                      )}
                    >
                      <s.icon className="h-5 w-5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Needs attention + stock health */}
          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card
              style={{ animationDelay: "320ms" }}
              className="animate-in fade-in slide-in-from-bottom-4 duration-500 lg:col-span-2"
            >
              <CardHeader className="flex-row items-center justify-between">
                <div className="grid gap-1">
                  <CardTitle>Needs Attention</CardTitle>
                  <CardDescription>
                    Out of stock and running low, emptiest first
                  </CardDescription>
                </div>
                <Link
                  href="/inventory?sort=status"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "h-8"
                  )}
                >
                  View all
                </Link>
              </CardHeader>
              <CardContent className="space-y-2">
                {needsAttention.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    Everything is in stock — nothing needs restocking.
                  </div>
                ) : (
                  needsAttention.map((product, i) => {
                    const style = statusStyles[product.status];
                    return (
                      <Link
                        key={product.id}
                        href={`/edit-product/${product.id}`}
                        style={{ animationDelay: `${400 + i * 60}ms` }}
                        className="flex animate-in fade-in slide-in-from-bottom-2 items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3 duration-500 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className={cn(
                              "h-2.5 w-2.5 shrink-0 rounded-full",
                              style.dot
                            )}
                          />
                          <span className="truncate text-sm font-medium">
                            {product.name}
                          </span>
                          {product.brand && (
                            <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                              {product.brand}
                            </span>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="text-sm tabular-nums text-muted-foreground">
                            {product.quantity} left
                          </span>
                          <Badge variant="outline" className={style.badge}>
                            {STOCK_STATUS_LABELS[product.status]}
                          </Badge>
                        </div>
                      </Link>
                    );
                  })
                )}
              </CardContent>
            </Card>

            <Card
              style={{ animationDelay: "400ms" }}
              className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <CardHeader>
                <CardTitle>Stock Overview</CardTitle>
                <CardDescription></CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-5">
                <div
                  className="relative h-40 w-40 rounded-full"
                  style={{
                    background:
                      totalProducts > 0
                        ? `conic-gradient(#10b981 0deg ${inStockDegrees}deg, #f59e0b ${inStockDegrees}deg ${
                            inStockDegrees + lowStockDegrees
                          }deg, #f43f5e ${inStockDegrees + lowStockDegrees}deg ${
                            inStockDegrees + lowStockDegrees + outOfStockDegrees
                          }deg, var(--muted) ${
                            inStockDegrees + lowStockDegrees + outOfStockDegrees
                          }deg 360deg)`
                        : "var(--muted)",
                  }}
                >
                  <div className="absolute inset-[14px] flex items-center justify-center rounded-full bg-card">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {inStockPercentage}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        In stock
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full space-y-2">
                  {[
                    {
                      dot: "bg-emerald-500",
                      label: "In Stock",
                      pct: inStockPercentage,
                      href: "/inventory?status=in",
                    },
                    {
                      dot: "bg-amber-500",
                      label: "Low Stock",
                      pct: lowStockPercentage,
                      href: "/inventory?status=low",
                    },
                    {
                      dot: "bg-rose-500",
                      label: "Out of Stock",
                      pct: outOfStockPercentage,
                      href: "/inventory?status=out",
                    },
                  ].map((row) => (
                    <Link
                      key={row.label}
                      href={row.href}
                      className="flex items-center justify-between rounded-md px-1.5 py-1 text-sm transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={cn("h-2.5 w-2.5 rounded-full", row.dot)}
                        />
                        <span className="text-muted-foreground">
                          {row.label}
                        </span>
                      </div>
                      <span className="font-medium tabular-nums">
                        {row.pct}%
                      </span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recently added + recent changes */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card
              style={{ animationDelay: "480ms" }}
              className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <CardHeader className="flex-row items-center justify-between">
                <div className="grid gap-1">
                  <CardTitle>Recently Added</CardTitle>
                  <CardDescription>
                    Latest additions to inventory
                  </CardDescription>
                </div>
                <Link
                  href="/inventory"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "h-8"
                  )}
                >
                  View all
                </Link>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentProducts.length === 0 && (
                  <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
                    No products yet — add your first one to get started.
                  </div>
                )}
                {recentProducts.map((product, i) => {
                  const style =
                    statusStyles[
                      getStockStatus(product.quantity, product.lowStockAt)
                    ];
                  return (
                    <Link
                      key={product.id}
                      href={`/edit-product/${product.id}`}
                      style={{ animationDelay: `${560 + i * 60}ms` }}
                      className="flex animate-in fade-in slide-in-from-bottom-2 items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3 duration-500 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={cn(
                            "h-2.5 w-2.5 shrink-0 rounded-full",
                            style.dot
                          )}
                        />
                        <span className="truncate text-sm font-medium">
                          {product.name}
                        </span>
                        {product.brand && (
                          <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                            {product.brand}
                          </span>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={cn("shrink-0", style.badge)}
                      >
                        {product.quantity} units
                      </Badge>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>

            <Card
              style={{ animationDelay: "520ms" }}
              className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <CardHeader className="flex-row items-center justify-between">
                <div className="grid gap-1">
                  <CardTitle>Recent Changes</CardTitle>
                  <CardDescription>Who changed what, most recent first</CardDescription>
                </div>
                <Link
                  href="/history"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "h-8"
                  )}
                >
                  View all
                </Link>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentChanges.length === 0 && (
                  <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
                    No changes recorded yet.
                  </div>
                )}
                {recentChanges.map((log, i) => {
                  const row = (
                    <>
                      <div className="flex min-w-0 items-center gap-3">
                        <AuditActionBadge
                          action={log.action}
                          className="shrink-0"
                        />
                        <span className="truncate text-sm font-medium">
                          {log.productName}
                        </span>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {log.userName.split(" ")[0]} ·{" "}
                        {log.createdAt.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </>
                  );
                  const className =
                    "flex animate-in fade-in slide-in-from-bottom-2 items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3 duration-500";
                  const style = { animationDelay: `${600 + i * 60}ms` };

                  // Deleted products have no row left to link to.
                  return log.productId ? (
                    <Link
                      key={log.id}
                      href={`/edit-product/${log.productId}`}
                      style={style}
                      className={cn(className, "transition-colors hover:bg-muted/50")}
                    >
                      {row}
                    </Link>
                  ) : (
                    <div key={log.id} style={style} className={className}>
                      {row}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
