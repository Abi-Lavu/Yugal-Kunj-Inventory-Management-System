"use client";

import { Input } from "@/components/ui/input";
import type { ComponentProps } from "react";

export default function EditNumberInput({
  ...props
}: Omit<ComponentProps<typeof Input>, "type" | "onWheel">) {
  return (
    <Input
      {...props}
      type="number"
      onWheel={(event) => event.currentTarget.blur()}
    />
  );
}
