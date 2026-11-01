const MAX_IMAGE_BYTES = 6 * 1024 * 1024;

// Check the bytes as well as the browser-provided MIME type before storing a data URL.
export async function validateProductImage(
  file: File
): Promise<"image-invalid" | "image-too-large" | null> {
  if (file.size > MAX_IMAGE_BYTES) return "image-too-large";
  if (file.type !== "image/png" && file.type !== "image/jpeg") {
    return "image-invalid";
  }

  const head = new Uint8Array(await file.slice(0, 24).arrayBuffer());
  if (file.type === "image/png") {
    const pngHeader = [137, 80, 78, 71, 13, 10, 26, 10];
    const valid = head.length === 24 &&
      pngHeader.every((byte, index) => head[index] === byte) &&
      String.fromCharCode(...head.slice(12, 16)) === "IHDR";
    return valid ? null : "image-invalid";
  }

  const tail = new Uint8Array(await file.slice(-2).arrayBuffer());
  return head.length >= 3 && head[0] === 0xff && head[1] === 0xd8 &&
    head[2] === 0xff && tail[0] === 0xff && tail[1] === 0xd9
    ? null : "image-invalid";
}
