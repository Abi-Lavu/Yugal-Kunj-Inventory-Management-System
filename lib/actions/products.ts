"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../auth";
import { prisma } from "../prisma";
import { z } from "zod";

const ProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.coerce.number().nonnegative("Price must be non-negative"),
  quantity: z.coerce.number().int().min(0, "Quantity must be non-negative"),
  sku: z.string().optional(),
  lowStockAt: z.coerce.number().int().min(0).optional(),
});

export async function deleteProduct(formData: FormData) {
  await getCurrentUser();
  const id = String(formData.get("id") || "");

  await prisma.product.deleteMany({
    where: { id },
  });

  revalidatePath("/inventory");
  revalidatePath("/dashboard");
}

export async function createProduct(formData: FormData) {
  const user = await getCurrentUser();

  const parsed = ProductSchema.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
    quantity: formData.get("quantity"),
    sku: formData.get("sku") || undefined,
    lowStockAt: formData.get("lowStockAt") || undefined,
  });

  if (!parsed.success) {
    redirect("/add-product?error=invalid");
  }

  const { name, sku } = parsed.data;

  // Required image upload -> stored as a data URL in the DB.
  const image = formData.get("image");
  if (!(image instanceof File) || image.size === 0) {
    redirect("/add-product?error=image-required");
  }
  if (!image.type.startsWith("image/")) {
    redirect("/add-product?error=image-invalid");
  }
  if (image.size > 6 * 1024 * 1024) {
    redirect("/add-product?error=image-too-large");
  }
  const imageUrl = `data:${image.type};base64,${Buffer.from(
    await image.arrayBuffer()
  ).toString("base64")}`;

  // Optional purchase link — normalize to an absolute URL.
  let purchaseUrl = String(formData.get("purchaseUrl") ?? "").trim();
  if (purchaseUrl && !/^https?:\/\//i.test(purchaseUrl)) {
    purchaseUrl = `https://${purchaseUrl}`;
  }

  // No duplicate items: reject a name that already exists (case-insensitive).
  const duplicateName = await prisma.product.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
    select: { id: true },
  });
  if (duplicateName) {
    redirect("/add-product?error=duplicate-name");
  }

  // SKUs are unique too — block a duplicate before hitting the DB constraint.
  if (sku) {
    const duplicateSku = await prisma.product.findFirst({
      where: { sku: { equals: sku, mode: "insensitive" } },
      select: { id: true },
    });
    if (duplicateSku) {
      redirect("/add-product?error=duplicate-sku");
    }
  }

  try {
    await prisma.product.create({
      data: {
        ...parsed.data,
        imageUrl,
        purchaseUrl: purchaseUrl || null,
        userId: user.id,
      },
    });
  } catch {
    redirect("/add-product?error=failed");
  }

  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  redirect("/inventory");
}
