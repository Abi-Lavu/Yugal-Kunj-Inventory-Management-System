import Pagination from "@/components/pagination";
import Sidebar from "@/components/sidebar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Pencil, Plus, Trash2 } from "lucide-react";

// How each action is labelled and coloured in the table.
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

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await getCurrentUser();

  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const pageSize = 15;

  const [totalCount, logs] = await Promise.all([
    prisma.auditLog.count(),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="min-h-screen bg-muted/20">
      <Sidebar currentPath="/history" />
      <main className="ml-64 min-h-screen p-6 lg:p-10">
        <div className="mx-auto max-w-7xl">
          {/* header */}
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <h1 className="text-2xl font-semibold tracking-tight">History</h1>
            <p className="text-sm text-muted-foreground">
              Every change made to the inventory, and who made it.
            </p>
          </div>

          <Card
            style={{ animationDelay: "80ms" }}
            className="animate-in fade-in slide-in-from-bottom-4 gap-0 p-0 duration-500"
          >
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-11 pl-6">User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="pr-6 text-right">When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={4}
                      className="py-14 text-center text-muted-foreground"
                    >
                      No changes recorded yet — add, edit, or delete a product
                      and it will show up here.
                    </TableCell>
                  </TableRow>
                )}
                {logs.map((log, i) => {
                  const style =
                    ACTION_STYLES[log.action] ?? ACTION_STYLES.UPDATE;
                  const ActionIcon = style.icon;
                  return (
                    <TableRow
                      key={log.id}
                      style={{ animationDelay: `${100 + i * 40}ms` }}
                      className="animate-in fade-in slide-in-from-bottom-1 duration-500"
                    >
                      <TableCell className="py-3 pl-6">
                        <div className="font-medium text-foreground">
                          {log.userName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {log.userEmail}
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge variant="outline" className={style.badge}>
                          <ActionIcon />
                          {style.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="font-medium">{log.productName}</div>
                        {log.details && (
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            {log.details}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-3 pr-6 text-right text-muted-foreground">
                        {log.createdAt.toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>

          {totalPages > 1 && (
            <div
              style={{ animationDelay: "160ms" }}
              className="mt-6 animate-in fade-in duration-500"
            >
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                baseUrl="/history"
                searchParams={{}}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
