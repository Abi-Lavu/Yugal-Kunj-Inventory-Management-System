import UserMenu from "@/components/auth/user-menu";
import { cn } from "@/lib/utils";
import { BarChart3, Boxes, Package, Plus, Settings } from "lucide-react";
import Link from "next/link";

export default function Sidebar({
  currentPath = "/dashboard",
}: {
  currentPath: string;
}) {
  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Inventory", href: "/inventory", icon: Package },
    { name: "Add Product", href: "/add-product", icon: Plus },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 z-20 flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground animate-in slide-in-from-left-6 fade-in duration-500">
      {/* ambient violet glow */}
      <div className="pointer-events-none absolute -top-20 left-1/2 h-44 w-44 -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl" />

      {/* brand */}
      <div className="relative flex items-center gap-3 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/30 transition-transform duration-300 hover:scale-105 hover:rotate-3">
          <Boxes className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">Inventory</span>
          <span className="text-xs text-sidebar-foreground/50">Management</span>
        </div>
      </div>

      {/* nav */}
      <nav className="relative flex-1 space-y-1 px-3 py-2">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/40">
          Menu
        </p>
        {navigation.map((item, i) => {
          const Icon = item.icon;
          const isActive = currentPath === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{ animationDelay: `${i * 70 + 120}ms` }}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium animate-in fade-in slide-in-from-left-4 duration-500",
                "transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-600/25"
                  : "text-sidebar-foreground/70 hover:translate-x-0.5 hover:bg-white/5 hover:text-white"
              )}
            >
              {isActive && (
                <span className="absolute inset-y-2 left-0 w-1 rounded-full bg-white/80" />
              )}
              <Icon
                className={cn(
                  "h-[18px] w-[18px] transition-transform duration-200",
                  !isActive && "group-hover:scale-110"
                )}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* user (auth) */}
      <div className="relative border-t border-white/10 p-4">
        <UserMenu />
      </div>
    </aside>
  );
}
