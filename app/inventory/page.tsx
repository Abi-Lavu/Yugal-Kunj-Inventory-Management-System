import DeleteProductDialog from "@/components/delete-product-dialog";
import InventorySearch from "@/components/inventory-search";
import Pagination from "@/components/pagination";
import Sidebar from "@/components/sidebar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { deleteProduct } from "@/lib/actions/products";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { Prisma } from "@prisma/client";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ImageOff,
  ListFilter,
  Plus,
} from "lucide-react";
import Link from "next/link";

// Default low-stock threshold when a product has none set (matches the badge).
const DEFAULT_LOW = 5;
const STATUS_KEYS = ["in", "low", "out"] as const;

// Translate a stock-status filter into a DB query. The effective threshold is
// `lowStockAt || DEFAULT_LOW`, so null/0 thresholds fall back to DEFAULT_LOW.
function statusFilter(status: string): Prisma.ProductWhereInput | null {
  const usesDefault: Prisma.ProductWhereInput = {
    OR: [{ lowStockAt: null }, { lowStockAt: 0 }],
  };
  const usesCustom: Prisma.ProductWhereInput = { lowStockAt: { gt: 0 } };
  const lowRef = prisma.product.fields.lowStockAt;

  switch (status) {
    case "out":
      return { quantity: 0 };
    case "low":
      return {
        quantity: { gte: 1 },
        OR: [
          { AND: [usesDefault, { quantity: { lte: DEFAULT_LOW } }] },
          { AND: [usesCustom, { quantity: { lte: lowRef } }] },
        ],
      };
    case "in":
      return {
        OR: [
          { AND: [usesDefault, { quantity: { gt: DEFAULT_LOW } }] },
          { AND: [usesCustom, { quantity: { gt: lowRef } }] },
        ],
      };
    default:
      return null;
  }
}

const NotAvailable = () => (
  <span className="font-normal text-muted-foreground/50">Not Available</span>
);

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string }>;
}) {
  await getCurrentUser();

  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const status = STATUS_KEYS.includes(params.status as (typeof STATUS_KEYS)[number])
    ? (params.status as string)
    : "";
  const page = Math.max(1, Number(params.page ?? 1));
  const pageSize = 9;

  const conditions = [
    q ? { name: { contains: q, mode: "insensitive" as const } } : null,
    statusFilter(status),
  ].filter(Boolean) as Prisma.ProductWhereInput[];
  const where: Prisma.ProductWhereInput =
    conditions.length > 0 ? { AND: conditions } : {};

  const [totalCount, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const statusStyles = [
    {
      label: "Out of stock",
      icon: AlertCircle,
      badge: "border-transparent bg-rose-500/10 text-rose-600",
    },
    {
      label: "Low stock",
      icon: AlertTriangle,
      badge: "border-transparent bg-amber-500/10 text-amber-600",
    },
    {
      label: "In stock",
      icon: CheckCircle2,
      badge: "border-transparent bg-emerald-500/10 text-emerald-600",
    },
  ];

  // Filter pills (server-rendered links that set ?status=, preserving the search).
  const filterHref = (key: string) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (key) sp.set("status", key);
    const qs = sp.toString();
    return qs ? `/inventory?${qs}` : "/inventory";
  };
  const filters: {
    key: string;
    label: string;
    icon: typeof CheckCircle2 | null;
    activeClass: string;
  }[] = [
    {
      key: "",
      label: "All",
      icon: null,
      activeClass: "border-transparent bg-primary text-primary-foreground",
    },
    {
      key: "in",
      label: "In Stock",
      icon: CheckCircle2,
      activeClass: "border-emerald-300 bg-emerald-500/10 text-emerald-700",
    },
    {
      key: "low",
      label: "Low Stock",
      icon: AlertTriangle,
      activeClass: "border-amber-300 bg-amber-500/10 text-amber-700",
    },
    {
      key: "out",
      label: "Out of Stock",
      icon: AlertCircle,
      activeClass: "border-rose-300 bg-rose-500/10 text-rose-700",
    },
  ];

  return (
    <div className="min-h-screen bg-muted/20">
      <Sidebar currentPath="/inventory" />
      <main className="ml-64 min-h-screen p-6 lg:p-10">
        <div className="mx-auto max-w-7xl">
          {/* header */}
          <div className="mb-8 flex animate-in fade-in slide-in-from-bottom-3 flex-wrap items-end justify-between gap-4 duration-500">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Inventory
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage your products and track stock levels.
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

          {/* search + status filter */}
          <Card
            style={{ animationDelay: "80ms" }}
            className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <CardContent className="space-y-4">
              <InventorySearch initialQuery={q} />
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <ListFilter className="h-3.5 w-3.5" />
                  Status:
                </span>
                {filters.map((f) => {
                  const active = status === f.key;
                  const Icon = f.icon;
                  return (
                    <Link
                      key={f.key || "all"}
                      href={filterHref(f.key)}
                      aria-pressed={active}
                      className={cn(
                        "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors",
                        active
                          ? f.activeClass
                          : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {Icon && <Icon className="h-3.5 w-3.5" />}
                      {f.label}
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* product grid (3 across, up to 9 per page) */}
          {items.length === 0 ? (
            <Card className="animate-in fade-in duration-500">
              <CardContent className="py-16 text-center text-muted-foreground">
                No products found
                {q ? ` for “${q}”` : ""}
                {status ? " with this status" : ""}.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((product, i) => {
                const stockLevel =
                  product.quantity === 0
                    ? 0
                    : product.quantity <= (product.lowStockAt || DEFAULT_LOW)
                    ? 1
                    : 2;
                const s = statusStyles[stockLevel];
                const StatusIcon = s.icon;
                return (
                  <Card
                    key={product.id}
                    style={{ animationDelay: `${120 + i * 60}ms` }}
                    className="group relative animate-in fade-in slide-in-from-bottom-3 gap-0 overflow-hidden p-0 duration-500 transition-all hover:-translate-y-1 hover:shadow-lg hover:ring-foreground/20"
                  >
                    {/* delete: small red line, top-right of the box */}
                    <div className="absolute right-2 top-2 z-10 rounded-md bg-card/70 backdrop-blur-sm">
                      <DeleteProductDialog
                        id={product.id}
                        name={product.name}
                        action={deleteProduct}
                      />
                    </div>

                    {/* image */}
                    <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted-foreground/60">
                          <ImageOff className="h-7 w-7" />
                          <span className="text-xs">No image</span>
                        </div>
                      )}
                    </div>

                    {/* details */}
                    <div className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold leading-tight">
                          {product.name}
                        </h3>
                        <Badge
                          variant="outline"
                          className={cn("shrink-0", s.badge)}
                        >
                          <StatusIcon />
                          {s.label}
                        </Badge>
                      </div>
                      <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
                        <dt className="text-muted-foreground">Price</dt>
                        <dd className="text-right font-medium tabular-nums">
                          ${Number(product.price).toFixed(2)}
                        </dd>
                        <dt className="text-muted-foreground">Quantity</dt>
                        <dd className="text-right font-medium tabular-nums">
                          {product.quantity}
                        </dd>
                        <dt className="text-muted-foreground">SKU</dt>
                        <dd className="text-right font-medium">
                          {product.sku || <NotAvailable />}
                        </dd>
                        <dt className="text-muted-foreground">Purchase</dt>
                        <dd className="truncate text-right font-medium">
                          {product.purchaseUrl ? (
                            <a
                              href={product.purchaseUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-violet-600 hover:underline"
                            >
                              Buy <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <NotAvailable />
                          )}
                        </dd>
                      </dl>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div
              style={{ animationDelay: "260ms" }}
              className="mt-8 animate-in fade-in duration-500"
            >
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                baseUrl="/inventory"
                searchParams={{
                  q,
                  ...(status ? { status } : {}),
                  pageSize: String(pageSize),
                }}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
