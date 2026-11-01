import assert from "node:assert/strict";
import { test } from "node:test";
import { validateProductImage } from "../lib/product-image.ts";

const png = Uint8Array.from([
  137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13,
  73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1,
]);
const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0xff, 0xd9]);

test("accepts PNG and JPEG signatures with matching MIME types", async () => {
  assert.equal(await validateProductImage(new File([png], "x.png", { type: "image/png" })), null);
  assert.equal(await validateProductImage(new File([jpeg], "x.jpg", { type: "image/jpeg" })), null);
});

test("rejects mislabeled and unsupported files", async () => {
  assert.equal(await validateProductImage(new File([png], "x.jpg", { type: "image/jpeg" })), "image-invalid");
  assert.equal(await validateProductImage(new File([jpeg], "x.gif", { type: "image/gif" })), "image-invalid");
  assert.equal(await validateProductImage(new File(["not an image"], "x.png", { type: "image/png" })), "image-invalid");
});

test("rejects files over 6 MB", async () => {
  const large = new File([new Uint8Array(6 * 1024 * 1024 + 1)], "x.png", { type: "image/png" });
  assert.equal(await validateProductImage(large), "image-too-large");
});
