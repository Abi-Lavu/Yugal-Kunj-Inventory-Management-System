import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildXlsx } from "@/lib/xlsx";
import { headers } from "next/headers";

type Cell = string | number | null;

function csvCell(value: Cell): string {
  const s = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const format =
    new URL(request.url).searchParams.get("format") === "xlsx" ? "xlsx" : "csv";

  // Export all products, excluding the image.
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      name: true,
      sku: true,
      price: true,
      quantity: true,
      lowStockAt: true,
      purchaseUrl: true,
      createdAt: true,
    },
  });

  const header = [
    "Name",
    "SKU",
    "Price",
    "Quantity",
    "Low Stock At",
    "Status",
    "Purchase URL",
    "Created At",
  ];

  const rows: Cell[][] = products.map((p) => {
    const threshold = p.lowStockAt || 5;
    const status =
      p.quantity === 0
        ? "Out of stock"
        : p.quantity <= threshold
        ? "Low stock"
        : "In stock";
    return [
      p.name,
      p.sku ?? "",
      Number(p.price),
      p.quantity,
      p.lowStockAt ?? "",
      status,
      p.purchaseUrl ?? "",
      p.createdAt.toISOString().slice(0, 10),
    ];
  });

  const date = new Date().toISOString().slice(0, 10);

  if (format === "xlsx") {
    const buffer = buildXlsx("Inventory", header, rows);
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="inventory-${date}.xlsx"`,
        "Cache-Control": "no-store",
      },
    });
  }

  // CSV — prepend a BOM so Excel reads UTF-8 correctly.
  const csv =
    "﻿" +
    [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="inventory-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
