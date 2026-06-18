import Sidebar from "@/components/sidebar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProduct } from "@/lib/actions/products";
import { getCurrentUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { AlertCircle, ArrowLeft, PackagePlus } from "lucide-react";
import Link from "next/link";

const ERROR_MESSAGES: Record<string, string> = {
  "duplicate-name": "A product with this name already exists.",
  "duplicate-sku": "A product with this SKU already exists.",
  "image-required": "Please attach an image of the product.",
  "image-invalid": "The attached file must be an image.",
  "image-too-large": "That image is too large — please use one under 6 MB.",
  invalid: "Please check the form and try again.",
  failed: "Something went wrong. Please try again.",
};

export default async function AddProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await getCurrentUser();
  const { error } = await searchParams;
  const errorMessage = error ? ERROR_MESSAGES[error] : null;

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
              Add a new product to your inventory.
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
              {errorMessage && (
                <div className="mb-5 flex animate-in fade-in slide-in-from-top-1 items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 duration-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {errorMessage}
                </div>
              )}
              <form className="space-y-5" action={createProduct}>
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    placeholder="Enter product name"
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Product Image *</Label>
                  <Input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    required
                    className="h-auto cursor-pointer py-1.5 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1 file:text-foreground"
                  />
                  <p className="text-xs text-muted-foreground">
                    Attach a photo of the item (PNG or JPG, up to 6 MB).
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min="0"
                      required
                      placeholder="0"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="0.00"
                      className="h-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku">SKU (optional)</Label>
                  <Input
                    id="sku"
                    name="sku"
                    placeholder="Enter SKU"
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lowStockAt">Low Stock At (optional)</Label>
                  <Input
                    id="lowStockAt"
                    name="lowStockAt"
                    type="number"
                    min="0"
                    placeholder="e.g. 5"
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchaseUrl">Purchase Link (optional)</Label>
                  <Input
                    id="purchaseUrl"
                    name="purchaseUrl"
                    type="text"
                    inputMode="url"
                    placeholder="https://store.example.com/item"
                    className="h-9"
                  />
                  <p className="text-xs text-muted-foreground">
                    Where this item is purchased.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    className="h-9 gap-1.5 px-5 shadow-sm shadow-violet-600/20"
                  >
                    <PackagePlus className="h-4 w-4" />
                    Add Product
                  </Button>
                  <Link
                    href="/inventory"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "h-9 px-5"
                    )}
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
