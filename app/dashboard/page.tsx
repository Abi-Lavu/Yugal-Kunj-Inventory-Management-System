import ProductsChart from "@/components/products-chart";
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
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  DollarSign,
  Package,
  PackageX,
  Plus,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const [totalProducts, allProducts] = await Promise.all([
    prisma.product.count(),
    prisma.product.findMany({
      select: { price: true, quantity: true, lowStockAt: true, createdAt: true },
    }),
  ]);

  const totalValue = allProducts.reduce(
    (sum, product) => sum + Number(product.price) * Number(product.quantity),
    0
  );

  const inStockCount = allProducts.filter(
    (p) => Number(p.quantity) > (p.lowStockAt ?? 5)
  ).length;
  const lowStockCount = allProducts.filter(
    (p) => Number(p.quantity) <= (p.lowStockAt ?? 5) && Number(p.quantity) >= 1
  ).length;
  const lowStock = lowStockCount;
  const outOfStockCount = allProducts.filter(
    (p) => Number(p.quantity) === 0
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

  const now = new Date();
  const weeklyProductsData = [];

  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - i * 7);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weekLabel = `${String(weekStart.getMonth() + 1).padStart(
      2,
      "0"
    )}/${String(weekStart.getDate()).padStart(2, "0")}`;

    const weekProducts = allProducts.filter((product) => {
      const productDate = new Date(product.createdAt);
      return productDate >= weekStart && productDate <= weekEnd;
    });

    weeklyProductsData.push({
      week: weekLabel,
      products: weekProducts.length,
    });
  }

  const recent = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const firstName = user.name?.split(" ")[0] || "there";

  const stats = [
    {
      label: "Total Products",
      value: String(totalProducts),
      hint: "",
      icon: Package,
      accent: "bg-violet-500/10 text-violet-600",
    },
    {
      label: "Inventory Value",
      value: `$${Number(totalValue).toFixed(0)}`,
      hint: "",
      icon: DollarSign,
      accent: "bg-emerald-500/10 text-emerald-600",
    },
    {
      label: "Low Stock",
      value: String(lowStock),
      hint: "",
      icon: AlertTriangle,
      accent: "bg-amber-500/10 text-amber-600",
    },
    {
      label: "Out of Stock",
      value: String(outOfStockCount),
      hint: "",
      icon: PackageX,
      accent: "bg-rose-500/10 text-rose-600",
    },
  ];

  const statusStyles = [
    { dot: "bg-rose-500", badge: "border-transparent bg-rose-500/10 text-rose-600" },
    { dot: "bg-amber-500", badge: "border-transparent bg-amber-500/10 text-amber-600" },
    { dot: "bg-emerald-500", badge: "border-transparent bg-emerald-500/10 text-emerald-600" },
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

          {/* Stat cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s, i) => (
              <Card
                key={s.label}
                style={{ animationDelay: `${i * 80}ms` }}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500 transition-all hover:-translate-y-1 hover:shadow-lg hover:ring-foreground/20"
              >
                <CardContent className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="mt-1 text-2xl font-bold tracking-tight">
                      {s.value}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground/70">
                      {s.hint}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover/card:scale-110",
                      s.accent
                    )}
                  >
                    <s.icon className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Chart + stock health */}
          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card
              style={{ animationDelay: "320ms" }}
              className="animate-in fade-in slide-in-from-bottom-4 duration-500 lg:col-span-2"
            >
              <CardHeader>
                <CardTitle>New Products Per Week</CardTitle>
                <CardDescription>Last 12 Weeks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ProductsChart data={weeklyProductsData} />
                </div>
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
                    },
                    {
                      dot: "bg-amber-500",
                      label: "Low Stock",
                      pct: lowStockPercentage,
                    },
                    {
                      dot: "bg-rose-500",
                      label: "Out of Stock",
                      pct: outOfStockPercentage,
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between text-sm"
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
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent products */}
          <Card
            style={{ animationDelay: "480ms" }}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <CardHeader className="flex-row items-center justify-between">
              <div className="grid gap-1">
                <CardTitle>Recent Products</CardTitle>
                <CardDescription>Latest Additions To Inventory</CardDescription>
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
              {recent.length === 0 && (
                <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
                  No products yet — add your first one to get started.
                </div>
              )}
              {recent.map((product, i) => {
                const stockLevel =
                  product.quantity === 0
                    ? 0
                    : product.quantity <= (product.lowStockAt || 5)
                    ? 1
                    : 2;
                const style = statusStyles[stockLevel];
                return (
                  <div
                    key={product.id}
                    style={{ animationDelay: `${560 + i * 60}ms` }}
                    className="flex animate-in fade-in slide-in-from-bottom-2 items-center justify-between rounded-lg border bg-card px-4 py-3 duration-500 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn("h-2.5 w-2.5 rounded-full", style.dot)}
                      />
                      <span className="text-sm font-medium">
                        {product.name}
                      </span>
                    </div>
                    <Badge variant="outline" className={style.badge}>
                      {product.quantity} units
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
