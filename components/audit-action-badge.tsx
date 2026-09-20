import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Pencil, Plus, Trash2 } from "lucide-react";

const ACTION_STYLES: Record<
  string,
  { label: string; badge: string; icon: typeof Plus }
> = {
  CREATE: {
    label: "Created",
    badge: "border-transparent bg-emerald-500/10 text-emerald-600",
    icon: Plus,
  },
  UPDATE: {
    label: "Updated",
    badge: "border-transparent bg-violet-500/10 text-violet-600",
    icon: Pencil,
  },
  DELETE: {
    label: "Deleted",
    badge: "border-transparent bg-rose-500/10 text-rose-600",
    icon: Trash2,
  },
};

export default function AuditActionBadge({
  action,
  className,
}: {
  action: string;
  className?: string;
}) {
  const style = ACTION_STYLES[action] ?? ACTION_STYLES.UPDATE;
  const ActionIcon = style.icon;

  return (
    <Badge variant="outline" className={cn(style.badge, className)}>
      <ActionIcon />
      {style.label}
    </Badge>
  );
}
