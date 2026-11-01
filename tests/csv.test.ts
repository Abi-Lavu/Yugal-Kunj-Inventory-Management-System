import assert from "node:assert/strict";
import { test } from "node:test";
import { csvCell } from "../lib/csv.ts";

test("escapes CSV punctuation and spreadsheet formulas", () => {
  assert.equal(csvCell('a,"b"'), '"a,""b"""');
  assert.equal(csvCell("=1+1"), "'=1+1");
  assert.equal(csvCell("\t@SUM(A1)"), "'\t@SUM(A1)");
  assert.equal(csvCell("-2"), "'-2");
  assert.equal(csvCell(-2), "-2");
  assert.equal(csvCell("ordinary"), "ordinary");
});
