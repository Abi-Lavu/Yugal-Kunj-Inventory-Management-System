type Cell = string | number | null;

// Spreadsheet applications can evaluate formulas in CSV text cells.
export function csvCell(value: Cell): string {
  let text = value === null ? "" : String(value);
  if (typeof value === "string" && /^[\s\u0000-\u001f]*[=+\-@]/.test(text)) {
    text = "'" + text;
  }
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
