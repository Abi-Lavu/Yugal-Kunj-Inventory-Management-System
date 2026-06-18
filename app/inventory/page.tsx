import InventorySearch from "@/components/inventory-search";
import Pagination from "@/components/pagination";
import Sidebar from "@/components/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteProduct } from "@/lib/actions/products";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, CheckCircle2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await getCurrentUser();

  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const page = Math.max(1, Number(params.page ?? 1));
  const pageSize = 5;

  const where = {
    ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
  };

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

          {/* search (filters live as you type) */}
          <Card
            style={{ animationDelay: "80ms" }}
            className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <CardContent>
              <InventorySearch initialQuery={q} />
            </CardContent>
          </Card>

          {/* table */}
          <Card
            style={{ animationDelay: "160ms" }}
            className="animate-in fade-in slide-in-from-bottom-4 gap-0 p-0 duration-500"
          >
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-11 pl-6">Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={6}
                      className="py-14 text-center text-muted-foreground"
                    >
                      No products found{q ? ` for “${q}”` : ""}.
                    </TableCell>
                  </TableRow>
                )}
                {items.map((product, i) => {
                  const stockLevel =
                    product.quantity === 0
                      ? 0
                      : product.quantity <= (product.lowStockAt || 5)
                      ? 1
                      : 2;
                  const status = statusStyles[stockLevel];
                  const StatusIcon = status.icon;
                  return (
                    <TableRow
                      key={product.id}
                      style={{ animationDelay: `${200 + i * 50}ms` }}
                      className="animate-in fade-in slide-in-from-bottom-1 duration-500"
                    >
                      <TableCell className="py-3 pl-6 font-medium text-foreground">
                        {product.name}
                      </TableCell>
                      <TableCell className="py-3 text-muted-foreground">
                        {product.sku || "—"}
                      </TableCell>
                      <TableCell className="py-3 tabular-nums">
                        ${Number(product.price).toFixed(2)}
                      </TableCell>
                      <TableCell className="py-3 tabular-nums">
                        {product.quantity}
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge variant="outline" className={status.badge}>
                          <StatusIcon />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 pr-6 text-right">
                        <form
                          action={async (formData: FormData) => {
                            "use server";
                            await deleteProduct(formData);
                          }}
                          className="inline"
                        >
                          <input type="hidden" name="id" value={product.id} />
                          <Button
                            type="submit"
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Delete product"
                            className="text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </form>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>

          {totalPages > 1 && (
            <div
              style={{ animationDelay: "260ms" }}
              className="mt-6 animate-in fade-in duration-500"
            >
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                baseUrl="/inventory"
                searchParams={{
                  q,
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
