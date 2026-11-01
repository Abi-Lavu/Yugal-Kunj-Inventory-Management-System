"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { getCurrentUser } from "../auth";
import { prisma } from "../prisma";
import { validateProductImage } from "../product-image";
import { parseProductForm } from "../product-validation";

// The optional detail fields, in the order they appear on the form.
const DETAIL_FIELDS = [
  ["brand", "Brand"],
  ["packageSize", "Package size"],
  ["dietaryInfo", "Dietary info"],
  ["notes", "Notes"],
] as const;

export async function deleteProduct(formData: FormData) {
  const user = await getCurrentUser();
  const id = String(formData.get("id") || "");

  await prisma.$transaction(async (tx) => {
    // Read the row before deleting so the history stays readable afterwards.
    const before = await tx.product.findUnique({
      where: { id },
      select: { name: true, quantity: true, price: true },
    });

    const deleted = await tx.product.deleteMany({
      where: { id },
    });

    if (before && deleted.count > 0) {
      await tx.auditLog.create({
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
  });

  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  revalidatePath("/history");
}

export async function createProduct(formData: FormData) {
  const user = await getCurrentUser();

  const parsed = parseProductForm(formData);

  if (!parsed.success) {
    redirect("/add-product?error=invalid");
  }

  const { name, sku, price, quantity } = parsed.data;

  const image = formData.get("image");
  if (!(image instanceof File) || image.size === 0) {
    redirect("/add-product?error=image-required");
  }
  const imageError = await validateProductImage(image);
  if (imageError) redirect(`/add-product?error=${imageError}`);
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

  try {
    await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          ...parsed.data,
          imageUrl,
          purchaseUrl: purchaseUrl || null,
          userId: user.id,
        },
      });
      await tx.auditLog.create({
        data: {
          action: "CREATE",
          productId: created.id,
          productName: name,
          details: `Quantity ${quantity} · Price $${price.toFixed(2)}${
            sku ? ` · SKU ${sku}` : ""
          }`,
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
        },
      });
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      redirect("/add-product?error=duplicate-sku");
    }
    redirect("/add-product?error=failed");
  }

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

  const existing = await prisma.product.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) {
    redirect("/inventory");
  }

  const parsed = parseProductForm(formData);

  if (!parsed.success) {
    redirect(`/edit-product/${id}?error=invalid`);
  }

  const { name, price, quantity, sku, lowStockAt, brand, packageSize, dietaryInfo, notes } =
    parsed.data;

  const image = formData.get("image");
  let imageUrl: string | undefined;
  if (image instanceof File && image.size > 0) {
    const imageError = await validateProductImage(image);
    if (imageError) redirect(`/edit-product/${id}?error=${imageError}`);
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
    await prisma.$transaction(async (tx) => {
      const before = await tx.product.findUnique({ where: { id } });
      if (!before) throw new Error("Product no longer exists");
      await tx.product.update({
        where: { id },
        data: {
          name,
          price,
          quantity,
          sku,
          lowStockAt,
          brand,
          packageSize,
          dietaryInfo,
          notes,
          purchaseUrl: purchaseUrl || null,
          ...(imageUrl ? { imageUrl } : {}),
        },
      });
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
      for (const [field, label] of DETAIL_FIELDS) {
        const previous = before[field] ?? "";
        const next = parsed.data[field] ?? "";
        if (previous !== next) {
          changes.push(`${label}: ${previous || "—"} → ${next || "—"}`);
        }
      }
      if ((before.purchaseUrl ?? "") !== (purchaseUrl || "")) {
        changes.push("Purchase link changed");
      }
      if (imageUrl) {
        changes.push("Image replaced");
      }

      await tx.auditLog.create({
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
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      redirect(`/edit-product/${id}?error=duplicate-sku`);
    }
    redirect(`/edit-product/${id}?error=failed`);
  }

  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  revalidatePath("/history");
  redirect("/inventory");
}
