import type { Prisma } from "@prisma/client";

export type SortKey =
  | "newest"
  | "updated"
  | "name-asc"
  | "name-desc"
  | "brand-asc"
  | "quantity-low"
  | "quantity-high"
  | "price-low"
  | "price-high"
  | "status";

export const DEFAULT_SORT: SortKey = "newest";

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "Recently created" },
  { key: "updated", label: "Recently updated" },
  { key: "name-asc", label: "Name: A–Z" },
  { key: "name-desc", label: "Name: Z–A" },
  { key: "brand-asc", label: "Brand: A–Z" },
  { key: "quantity-low", label: "Quantity: lowest first" },
  { key: "quantity-high", label: "Quantity: highest first" },
  { key: "price-low", label: "Price: lowest first" },
  { key: "price-high", label: "Price: highest first" },
  { key: "status", label: "Stock status: urgent first" },
];

export function isSortKey(value: unknown): value is SortKey {
  return SORT_OPTIONS.some((option) => option.key === value);
}

// Every sort but "status" maps straight onto a Prisma orderBy. Each one ends
// with id so rows that tie keep a stable order across pages.
export const SORT_ORDER_BY: Record<
  Exclude<SortKey, "status">,
  Prisma.ProductOrderByWithRelationInput[]
> = {
  newest: [{ createdAt: "desc" }, { id: "asc" }],
  updated: [{ updatedAt: "desc" }, { id: "asc" }],
  "name-asc": [{ name: "asc" }, { id: "asc" }],
  "name-desc": [{ name: "desc" }, { id: "asc" }],
  // Products with no brand sort to the bottom rather than the top.
  "brand-asc": [
    { brand: { sort: "asc", nulls: "last" } },
    { name: "asc" },
    { id: "asc" },
  ],
  "quantity-low": [{ quantity: "asc" }, { id: "asc" }],
  "quantity-high": [{ quantity: "desc" }, { id: "asc" }],
  "price-low": [{ price: "asc" }, { id: "asc" }],
  "price-high": [{ price: "desc" }, { id: "asc" }],
};
