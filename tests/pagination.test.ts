import assert from "node:assert/strict";
import { test } from "node:test";
import { parsePage } from "../lib/pagination.ts";

test("accepts valid pages and clamps pages past the end", () => {
  assert.equal(parsePage("3", 5), 3);
  assert.equal(parsePage("99", 5), 5);
});

test("rejects malformed or unsafe page values", () => {
  for (const value of [undefined, "", "0", "-2", "1.5", "NaN", "Infinity", "999999999999999999999"]) {
    assert.equal(parsePage(value, 5), 1);
  }
});
