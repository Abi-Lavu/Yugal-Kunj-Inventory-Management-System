export const DEFAULT_LOW_STOCK_THRESHOLD = 5;

export type StockStatus = "in" | "low" | "out";

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  in: "In stock",
  low: "Low stock",
  out: "Out of stock",
};

// Quantity and custom thresholds are validated as non-negative integers.
// An explicit zero disables low-stock warnings, but never out-of-stock status.
export function getStockStatus(
  quantity: number,
  lowStockAt?: number | null
): StockStatus {
  if (quantity === 0) return "out";
  return quantity <= (lowStockAt ?? DEFAULT_LOW_STOCK_THRESHOLD) ? "low" : "in";
}
