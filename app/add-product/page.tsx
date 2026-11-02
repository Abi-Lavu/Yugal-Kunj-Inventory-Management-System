import ProductForm, { productErrorMessage } from "@/components/product-form";
import Sidebar from "@/components/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createProduct } from "@/lib/actions/products";
import { getCurrentUser } from "@/lib/auth";
import { ArrowLeft, PackagePlus } from "lucide-react";
import Link from "next/link";

export default async function AddProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await getCurrentUser();
  const { error } = await searchParams;

  return (
    <div className="min-h-screen bg-muted/20">
      <Sidebar currentPath="/add-product" />

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
              Add Product
            </h1>
            <p className="text-sm text-muted-foreground">
              New inventory item
            </p>
          </div>

          <Card
            style={{ animationDelay: "80ms" }}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PackagePlus className="h-4 w-4 text-violet-600" />
                Product details
              </CardTitle>
              <CardDescription>Fields marked * are required.</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductForm
                action={createProduct}
                mode="create"
                errorMessage={productErrorMessage(error)}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
