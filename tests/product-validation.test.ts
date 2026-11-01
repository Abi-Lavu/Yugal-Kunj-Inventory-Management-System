import assert from "node:assert/strict";
import { test } from "node:test";
import { parseProductForm } from "../lib/product-validation.ts";

function productForm(overrides: Record<string, string> = {}) {
  return Object.entries({
    name: "  Rice  ", price: "12.50", quantity: "3", sku: "  R1  ",
    lowStockAt: "", brand: "  Example  ", packageSize: "",
    dietaryInfo: "", notes: "", ...overrides,
  }).reduce((form, [key, value]) => {
    form.set(key, value);
    return form;
  }, new FormData());
}

test("trims names and optional fields and preserves an explicit zero threshold", () => {
  const result = parseProductForm(productForm({ lowStockAt: "0" }));
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.name, "Rice");
    assert.equal(result.data.sku, "R1");
    assert.equal(result.data.brand, "Example");
    assert.equal(result.data.packageSize, null);
    assert.equal(result.data.lowStockAt, 0);
  }
});

for (const [field, value] of [
  ["name", "   "], ["price", ""], ["price", "-1"], ["price", "1.234"],
  ["quantity", ""], ["quantity", "-1"], ["quantity", "1.5"],
  ["lowStockAt", "-1"], ["lowStockAt", "2.5"],
] as const) {
  test(`rejects invalid ${field}: ${JSON.stringify(value)}`, () => {
    assert.equal(parseProductForm(productForm({ [field]: value })).success, false);
  });
}
