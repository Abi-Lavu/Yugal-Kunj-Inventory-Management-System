import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Package,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  const features = [
    { icon: Package, label: "Track stock" },
    { icon: TrendingUp, label: "Live insights" },
    { icon: ShieldCheck, label: "Secure auth" },
  ];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-white via-violet-50/40 to-white px-4">
      {/* ambient aurora */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-10 h-72 w-72 animate-aurora rounded-full bg-violet-400/30 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-80 w-80 animate-float rounded-full bg-fuchsia-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 animate-pulse rounded-full bg-indigo-400/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <div className="mb-6 flex animate-in fade-in slide-in-from-bottom-3 justify-center duration-700">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-white/70 px-3 py-1 text-xs font-medium text-violet-700 shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Inventory, simplified
          </span>
        </div>

        <h1
          className="animate-in fade-in slide-in-from-bottom-4 text-5xl font-bold tracking-tight text-foreground duration-700 sm:text-6xl"
          style={{ animationDelay: "80ms" }}
        >
          Manage inventory{" "}
          <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
            beautifully
          </span>
        </h1>

        <p
          className="mx-auto mt-6 max-w-xl animate-in fade-in slide-in-from-bottom-4 text-lg text-muted-foreground duration-700"
          style={{ animationDelay: "160ms" }}
        >
          Track products, monitor stock levels, and gain real-time insights —
          all in one fast, modern dashboard.
        </p>

        <div
          className="mt-9 flex animate-in fade-in slide-in-from-bottom-4 flex-wrap items-center justify-center gap-3 duration-700"
          style={{ animationDelay: "240ms" }}
        >
          <Link
            href="/sign-in"
            className={cn(
              buttonVariants({ size: "lg" }),
              "group h-11 gap-2 px-6 text-sm shadow-lg shadow-violet-600/20"
            )}
          >
            Sign In
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="#"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-11 px-6 text-sm"
            )}
          >
            Learn More
          </Link>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-2.5">
          {features.map((f, i) => (
            <div
              key={f.label}
              style={{ animationDelay: `${420 + i * 90}ms` }}
              className="inline-flex animate-in fade-in zoom-in-95 items-center gap-2 rounded-full border bg-white/60 px-3.5 py-1.5 text-sm text-foreground/80 shadow-sm backdrop-blur transition-all duration-500 hover:-translate-y-0.5 hover:border-violet-300 hover:text-violet-700"
            >
              <f.icon className="h-4 w-4 text-violet-500" />
              {f.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
