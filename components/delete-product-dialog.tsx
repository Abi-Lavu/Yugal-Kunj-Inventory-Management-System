"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

export default function DeleteProductDialog({
  id,
  name,
  action,
}: {
  id: string;
  name: string;
  action: (formData: FormData) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    const formData = new FormData();
    formData.set("id", id);
    startTransition(async () => {
      await action(formData);
      setOpen(false);
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <button
            type="button"
            aria-label={`Delete ${name}`}
            title="Delete"
            className="group/del inline-flex items-center justify-center rounded-md p-1.5 outline-none transition-colors hover:bg-rose-500/15 focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            <span className="block h-1 w-6 rounded-full bg-rose-500 transition-all group-hover/del:w-7 group-hover/del:bg-rose-600" />
          </button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-rose-500/10 text-rose-600">
            <Trash2 />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete this product?</AlertDialogTitle>
          <AlertDialogDescription>
            “{name}” will be permanently removed from your inventory. This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Go Back</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className="border-transparent bg-rose-600 text-white hover:bg-rose-700"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting…
              </>
            ) : (
              "Confirm"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
