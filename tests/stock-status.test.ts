import assert from "node:assert/strict";
import { test } from "node:test";
import { getStockStatus, type StockStatus } from "../lib/stock-status";

const cases: [number, number | null | undefined, StockStatus][] = [
  [0, 0, "out"],
  [1, 0, "in"],
  [5, 0, "in"],
  [6, 0, "in"],
  [0, null, "out"],
  [1, null, "low"],
  [5, null, "low"],
  [6, null, "in"],
  [0, undefined, "out"],
  [1, undefined, "low"],
  [5, undefined, "low"],
  [6, undefined, "in"],
  [0, 3, "out"],
  [1, 3, "low"],
  [3, 3, "low"],
  [4, 3, "in"],
  [0, 1, "out"],
  [1, 1, "low"],
  [2, 1, "in"],
  [5, 10, "low"],
  [10, 10, "low"],
  [11, 10, "in"],
];

for (const [quantity, threshold, expected] of cases) {
  test(`quantity ${quantity}, threshold ${threshold}: ${expected}`, () => {
    assert.equal(getStockStatus(quantity, threshold), expected);
  });
}
