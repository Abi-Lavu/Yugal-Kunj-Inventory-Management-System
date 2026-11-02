import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EditNumberInput from "@/components/edit-number-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_LOW_STOCK_THRESHOLD } from "@/lib/stock-status";
import { cn } from "@/lib/utils";
import { AlertCircle, PackagePlus, Save } from "lucide-react";
import Link from "next/link";

const ERROR_MESSAGES: Record<string, string> = {
  "duplicate-name": "A product with this name already exists.",
  "duplicate-sku": "A product with this SKU already exists.",
  "image-required": "Please attach an image of the product.",
  "image-invalid": "Use a valid PNG or JPEG image.",
  "image-too-large": "Use an image no larger than 6 MB.",
  invalid: "Please check the form and try again.",
  failed: "Something went wrong. Please try again.",
};

export function productErrorMessage(error?: string): string | null {
  return error ? ERROR_MESSAGES[error] ?? null : null;
}

export type ProductFormProduct = {
  id: string;
  name: string;
  sku: string | null;
  price: string;
  quantity: number;
  lowStockAt: number | null;
  imageUrl: string | null;
  purchaseUrl: string | null;
  brand: string | null;
  packageSize: string | null;
  dietaryInfo: string | null;
  notes: string | null;
};

export default function ProductForm({
  action,
  mode,
  errorMessage,
  product,
}: {
  action: (formData: FormData) => Promise<void>;
  mode: "create" | "edit";
  errorMessage?: string | null;
  product?: ProductFormProduct;
}) {
  const isEdit = mode === "edit";

  return (
    <form className="space-y-5" action={action}>
      {isEdit && product && (
        <input type="hidden" name="id" value={product.id} />
      )}

      {errorMessage && (
        <div className="flex animate-in fade-in slide-in-from-top-1 items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 duration-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorMessage}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Product Name *</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={product?.name}
          placeholder="Enter product name"
          className="h-9"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Product Image {isEdit ? "" : "*"}</Label>
        {isEdit && product?.imageUrl && (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-16 w-16 rounded-md border object-cover"
            />
            <span className="text-xs text-muted-foreground">
              Current image
            </span>
          </div>
        )}
        <Input
          id="image"
          name="image"
          type="file"
          accept="image/png,image/jpeg"
          required={!isEdit}
          className="h-auto cursor-pointer py-1.5 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1 file:text-foreground"
        />
        <p className="text-xs text-muted-foreground">
          {isEdit
            ? "Leave blank to keep the current image. PNG/JPG, up to 6 MB."
            : "PNG/JPG, up to 6 MB."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity *</Label>
          {isEdit ? (
            <EditNumberInput
              id="quantity"
              name="quantity"
              min="0"
              required
              defaultValue={product?.quantity}
              placeholder="0"
              className="h-9"
            />
          ) : (
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min="0"
              required
              defaultValue={product?.quantity}
              placeholder="0"
              className="h-9"
            />
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price *</Label>
          {isEdit ? (
            <EditNumberInput
              id="price"
              name="price"
              step="0.01"
              min="0"
              required
              defaultValue={product?.price}
              placeholder="0.00"
              className="h-9"
            />
          ) : (
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={product?.price}
              placeholder="0.00"
              className="h-9"
            />
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sku">SKU (optional)</Label>
        <Input
          id="sku"
          name="sku"
          defaultValue={product?.sku ?? ""}
          placeholder="Enter SKU"
          className="h-9"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="brand">Brand (optional)</Label>
          <Input
            id="brand"
            name="brand"
            defaultValue={product?.brand ?? ""}
            placeholder="e.g. Royal"
            className="h-9"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="packageSize">Package Size (optional)</Label>
          <Input
            id="packageSize"
            name="packageSize"
            defaultValue={product?.packageSize ?? ""}
            placeholder="e.g. 20-pound bag"
            className="h-9"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="lowStockAt">Low Stock At (optional)</Label>
        {isEdit ? (
          <EditNumberInput
            id="lowStockAt"
            name="lowStockAt"
            min="0"
            defaultValue={product?.lowStockAt ?? ""}
            placeholder={`e.g. ${DEFAULT_LOW_STOCK_THRESHOLD}`}
            aria-describedby="lowStockAt-help"
            className="h-9"
          />
        ) : (
          <Input
            id="lowStockAt"
            name="lowStockAt"
            type="number"
            min="0"
            defaultValue={product?.lowStockAt ?? ""}
            placeholder={`e.g. ${DEFAULT_LOW_STOCK_THRESHOLD}`}
            aria-describedby="lowStockAt-help"
            className="h-9"
          />
        )}
        <p id="lowStockAt-help" className="text-xs text-muted-foreground">
          Leave blank to use {DEFAULT_LOW_STOCK_THRESHOLD}. Enter 0 to flag only
          out-of-stock items.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="purchaseUrl">Purchase Link (optional)</Label>
        <Input
          id="purchaseUrl"
          name="purchaseUrl"
          type="text"
          inputMode="url"
          defaultValue={product?.purchaseUrl ?? ""}
          placeholder="https://store.example.com/item"
          className="h-9"
        />
        <p className="text-xs text-muted-foreground">
          Store or supplier URL
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dietaryInfo">Dietary Information (optional)</Label>
        <Input
          id="dietaryInfo"
          name="dietaryInfo"
          defaultValue={product?.dietaryInfo ?? ""}
          placeholder="e.g. Contains peanuts"
          aria-describedby="dietaryInfo-help"
          className="h-9"
        />
        <p id="dietaryInfo-help" className="text-xs text-muted-foreground">
          Allergens or dietary notes. Shown on the product card.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={product?.notes ?? ""}
          placeholder="e.g. Use for Sunday meals only"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          className="h-9 gap-1.5 px-5 shadow-sm shadow-violet-600/20"
        >
          {isEdit ? (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          ) : (
            <>
              <PackagePlus className="h-4 w-4" />
              Add Product
            </>
          )}
        </Button>
        <Link
          href="/inventory"
          className={cn(buttonVariants({ variant: "outline" }), "h-9 px-5")}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
