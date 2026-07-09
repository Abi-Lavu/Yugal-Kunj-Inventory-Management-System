import ProductForm, { productErrorMessage } from "@/components/product-form";
import Sidebar from "@/components/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateProduct } from "@/lib/actions/products";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, SquarePen } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await getCurrentUser();
  const { id } = await params;
  const { error } = await searchParams;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    redirect("/inventory");
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <Sidebar currentPath="/inventory" />

      <main className="ml-64 min-h-screen p-6 lg:p-10">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <Link
              href="/inventory"
              className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Back to inventory
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight">
              Edit Product
            </h1>
            <p className="text-sm text-muted-foreground">
              Update the details for “{product.name}”.
            </p>
          </div>

          <Card
            style={{ animationDelay: "80ms" }}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SquarePen className="h-4 w-4 text-violet-600" />
                Product details
              </CardTitle>
              <CardDescription>Change any field, then save.</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductForm
                action={updateProduct}
                mode="edit"
                errorMessage={productErrorMessage(error)}
                product={{
                  id: product.id,
                  name: product.name,
                  sku: product.sku,
                  price: Number(product.price).toFixed(2),
                  quantity: product.quantity,
                  lowStockAt: product.lowStockAt,
                  imageUrl: product.imageUrl,
                  purchaseUrl: product.purchaseUrl,
                }}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
