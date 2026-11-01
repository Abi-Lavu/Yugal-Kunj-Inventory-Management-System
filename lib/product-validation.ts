import { z } from "zod";

const optionalText = (max: number) =>
  z.string().trim().max(max).transform((value) => value || null);

const nonNegativeInteger = z
  .string()
  .regex(/^(0|[1-9]\d*)$/, "Enter a non-negative whole number")
  .transform(Number)
  .refine(Number.isSafeInteger, "Number is too large");

const price = z
  .string()
  .regex(/^\d+(?:\.\d{1,2})?$/, "Enter a valid price")
  .transform(Number)
  .refine((value) => Number.isFinite(value) && value <= 9999999999.99, "Price is too large");

export const ProductSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  price,
  quantity: nonNegativeInteger,
  sku: z.string().trim().max(120).transform((value) => value || null),
  lowStockAt: z.union([nonNegativeInteger, z.literal("").transform(() => null)]),
  brand: optionalText(120),
  packageSize: optionalText(120),
  dietaryInfo: optionalText(300),
  notes: optionalText(1000),
});

export function parseProductForm(formData: FormData) {
  return ProductSchema.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
    quantity: formData.get("quantity"),
    sku: formData.get("sku"),
    lowStockAt: formData.get("lowStockAt"),
    brand: formData.get("brand"),
    packageSize: formData.get("packageSize"),
    dietaryInfo: formData.get("dietaryInfo"),
    notes: formData.get("notes"),
  });
}
