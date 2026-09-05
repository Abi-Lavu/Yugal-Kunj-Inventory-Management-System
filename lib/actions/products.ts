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
  const user = await getCurrentUser();
  const id = String(formData.get("id") || "");

  // Read the row before deleting so the history stays readable afterwards.
  const before = await prisma.product.findUnique({
    where: { id },
    select: { name: true, quantity: true, price: true },
  });

  await prisma.product.deleteMany({
    where: { id },
  });

  if (before) {
    await prisma.auditLog.create({
      data: {
        action: "DELETE",
        productId: null,
        productName: before.name,
        details: `Was quantity ${before.quantity}, price $${Number(
          before.price
        ).toFixed(2)}`,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
      },
    });
  }

  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  revalidatePath("/history");
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

  const { name, sku, price, quantity } = parsed.data;

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

  let purchaseUrl = String(formData.get("purchaseUrl") ?? "").trim();
  if (purchaseUrl && !/^https?:\/\//i.test(purchaseUrl)) {
    purchaseUrl = `https://${purchaseUrl}`;
  }

  const duplicateName = await prisma.product.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
    select: { id: true },
  });
  if (duplicateName) {
    redirect("/add-product?error=duplicate-name");
  }
  if (sku) {
    const duplicateSku = await prisma.product.findFirst({
      where: { sku: { equals: sku, mode: "insensitive" } },
      select: { id: true },
    });
    if (duplicateSku) {
      redirect("/add-product?error=duplicate-sku");
    }
  }

  let createdId: string | null = null;
  try {
    const created = await prisma.product.create({
      data: {
        ...parsed.data,
        imageUrl,
        purchaseUrl: purchaseUrl || null,
        userId: user.id,
      },
    });
    createdId = created.id;
  } catch {
    redirect("/add-product?error=failed");
  }

  await prisma.auditLog.create({
    data: {
      action: "CREATE",
      productId: createdId,
      productName: name,
      details: `Quantity ${quantity} · Price $${price.toFixed(2)}${
        sku ? ` · SKU ${sku}` : ""
      }`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
    },
  });

  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  revalidatePath("/history");
  redirect("/inventory");
}

export async function updateProduct(formData: FormData) {
  const user = await getCurrentUser();

  const id = String(formData.get("id") || "");
  if (!id) {
    redirect("/inventory");
  }

  // Snapshot the row BEFORE the update so we can report exactly what changed.
  const before = await prisma.product.findUnique({ where: { id } });
  if (!before) {
    redirect("/inventory");
  }

  const parsed = ProductSchema.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
    quantity: formData.get("quantity"),
    sku: formData.get("sku") || undefined,
    lowStockAt: formData.get("lowStockAt") || undefined,
  });

  if (!parsed.success) {
    redirect(`/edit-product/${id}?error=invalid`);
  }

  const { name, price, quantity, sku, lowStockAt } = parsed.data;

  const image = formData.get("image");
  let imageUrl: string | undefined;
  if (image instanceof File && image.size > 0) {
    if (!image.type.startsWith("image/")) {
      redirect(`/edit-product/${id}?error=image-invalid`);
    }
    if (image.size > 6 * 1024 * 1024) {
      redirect(`/edit-product/${id}?error=image-too-large`);
    }
    imageUrl = `data:${image.type};base64,${Buffer.from(
      await image.arrayBuffer()
    ).toString("base64")}`;
  }

  let purchaseUrl = String(formData.get("purchaseUrl") ?? "").trim();
  if (purchaseUrl && !/^https?:\/\//i.test(purchaseUrl)) {
    purchaseUrl = `https://${purchaseUrl}`;
  }

  const duplicateName = await prisma.product.findFirst({
    where: { name: { equals: name, mode: "insensitive" }, NOT: { id } },
    select: { id: true },
  });
  if (duplicateName) {
    redirect(`/edit-product/${id}?error=duplicate-name`);
  }
  if (sku) {
    const duplicateSku = await prisma.product.findFirst({
      where: { sku: { equals: sku, mode: "insensitive" }, NOT: { id } },
      select: { id: true },
    });
    if (duplicateSku) {
      redirect(`/edit-product/${id}?error=duplicate-sku`);
    }
  }

  try {
    await prisma.product.update({
      where: { id },
      data: {
        name,
        price,
        quantity,
        sku: sku ?? null,
        lowStockAt: lowStockAt ?? null,
        purchaseUrl: purchaseUrl || null,
        ...(imageUrl ? { imageUrl } : {}),
      },
    });
  } catch {
    redirect(`/edit-product/${id}?error=failed`);
  }

  // Compare old vs new, field by field, and describe only what actually changed.
  const changes: string[] = [];
  if (before.name !== name) {
    changes.push(`Name: "${before.name}" → "${name}"`);
  }
  if (Number(before.price) !== price) {
    changes.push(
      `Price: $${Number(before.price).toFixed(2)} → $${price.toFixed(2)}`
    );
  }
  if (before.quantity !== quantity) {
    changes.push(`Quantity: ${before.quantity} → ${quantity}`);
  }
  if ((before.sku ?? "") !== (sku ?? "")) {
    changes.push(`SKU: ${before.sku || "—"} → ${sku || "—"}`);
  }
  if ((before.lowStockAt ?? null) !== (lowStockAt ?? null)) {
    changes.push(
      `Low stock at: ${before.lowStockAt ?? "—"} → ${lowStockAt ?? "—"}`
    );
  }
  if ((before.purchaseUrl ?? "") !== (purchaseUrl || "")) {
    changes.push("Purchase link changed");
  }
  if (imageUrl) {
    changes.push("Image replaced");
  }

  await prisma.auditLog.create({
    data: {
      action: "UPDATE",
      productId: id,
      productName: name,
      details: changes.length > 0 ? changes.join(" · ") : "No fields changed",
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
    },
  });

  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  revalidatePath("/history");
  redirect("/inventory");
}
