import Sidebar from "@/components/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getCurrentUser } from "@/lib/auth";
import { Mail, User as UserIcon } from "lucide-react";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  const initials =
    (user.name || user.email || "?")
      .trim()
      .split(/\s+/)
      .map((s) => s[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-muted/20">
      <Sidebar currentPath="/settings" />

      <main className="ml-64 min-h-screen p-6 lg:p-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your account settings and preferences.
            </p>
          </div>

          <Card
            style={{ animationDelay: "80ms" }}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Your Better Auth account details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xl font-semibold text-white shadow-lg shadow-violet-500/30">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-base font-medium">
                    {user.name || "Not set"}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg border bg-muted/30 p-4 transition-colors hover:bg-muted/50">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <UserIcon className="h-3.5 w-3.5" /> Name
                  </div>
                  <div className="mt-1.5 text-sm font-medium">
                    {user.name || "Not set"}
                  </div>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4 transition-colors hover:bg-muted/50">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" /> Email
                  </div>
                  <div className="mt-1.5 break-all text-sm font-medium">
                    {user.email}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
